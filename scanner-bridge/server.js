const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e6, // 5 MB (for image data)
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Session store ──────────────────────────────────────────────────────────
// token → { laptopSocketId, phoneSocketId | null, createdAt }
const sessions = new Map();

// Clean up stale sessions every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour
  for (const [token, session] of sessions.entries()) {
    if (session.createdAt < cutoff) sessions.delete(token);
  }
}, 10 * 60 * 1000);

// ── REST API ───────────────────────────────────────────────────────────────

/**
 * POST /api/session
 * Called by laptop dashboard to create a new pairing session.
 * Returns the token and phone URL (with public tunnel URL if provided).
 */
app.post("/api/session", async (req, res) => {
  const { publicUrl } = req.body;

  const token = uuidv4().replace(/-/g, "").slice(0, 16);
  sessions.set(token, {
    laptopSocketId: null,
    phoneSocketId: null,
    createdAt: Date.now(),
    scans: [],
  });

  // Use provided URL, or auto-detected tunnel URL, or origin fallback
  const baseUrl = (publicUrl && publicUrl.trim())
    || global.TUNNEL_URL
    || req.headers.origin
    || `http://localhost:5174`;

  const phoneUrl = `${baseUrl}/phone?token=${token}`;

  // Generate QR code as data URL
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(phoneUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (e) {
    console.error("QR generation failed:", e.message);
  }

  res.json({ success: true, token, phoneUrl, qrDataUrl });
});

/**
 * GET /api/tunnel
 * Returns the auto-detected tunnel URL (from localtunnel).
 */
app.get("/api/tunnel", (req, res) => {
  res.json({ url: global.TUNNEL_URL || null });
});

/**
 * GET /api/session/:token/scans
 * Returns current scans for a session (polling failsafe).
 */
app.get("/api/session/:token/scans", (req, res) => {
  const session = sessions.get(req.params.token);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return;
  }
  res.json({
    success: true,
    scans: session.scans,
    phoneConnected: !!session.phoneSocketId,
  });
});

/**
 * POST /api/session/:token/scan
 * Direct HTTP fallback for phone to post scan.
 */
app.post("/api/session/:token/scan", async (req, res) => {
  const session = sessions.get(req.params.token);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return;
  }
  let { barcode, format, imageDataUrl } = req.body;

  // If phone took a photo but couldn't decode digits locally, call backend AI OCR
  if (!barcode && imageDataUrl) {
    try {
      console.log(`[ocr-bridge] Decoding barcode from photo for session ${req.params.token}…`);
      const ocrRes = await fetch("http://localhost:5000/api/barcode/from-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageDataUrl }),
      });
      const ocrJson = await ocrRes.json();
      if (ocrJson.success && ocrJson.data?.barcode) {
        barcode = ocrJson.data.barcode;
        format = "ai_detected";
        console.log(`[ocr-bridge] AI OCR detected: ${barcode}`);
      }
    } catch (e) {
      console.warn("[ocr-bridge] Failed to call backend OCR:", e.message);
    }
  }

  if (!barcode) {
    res.status(400).json({ success: false, message: "barcode is required or could not be detected from image" });
    return;
  }

  // Fetch full product details from backend so phone and laptop immediately know the item
  let productDetails = null;
  try {
    const prodRes = await fetch(`http://localhost:5000/api/barcode/${encodeURIComponent(barcode)}`);
    const prodJson = await prodRes.json();
    if (prodJson.success && prodJson.data?.product) {
      productDetails = prodJson.data.product;
    }
  } catch (e) {
    console.warn("[product-lookup-bridge] Failed:", e.message);
  }

  const scanRecord = {
    id: uuidv4(),
    barcode,
    format: format || "unknown",
    imageDataUrl: imageDataUrl || null,
    product: productDetails,
    timestamp: Date.now(),
  };

  session.scans.unshift(scanRecord);
  if (session.scans.length > 50) session.scans.pop();

  console.log(`[http-scan] ${barcode} (${productDetails?.name || "Product"}) posted to session ${req.params.token}`);
  io.to(`session:${req.params.token}`).emit("barcode:result", scanRecord);

  res.json({ success: true, scan: scanRecord, product: productDetails });
});

/**
 * GET /api/session/:token
 * Returns current session status.
 */
app.get("/api/session/:token", (req, res) => {
  const session = sessions.get(req.params.token);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found or expired" });
    return;
  }
  res.json({
    success: true,
    phoneConnected: !!session.phoneSocketId,
    scanCount: session.scans.length,
  });
});

// Serve built Vite client in production
const clientDist = path.join(__dirname, "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(200).send("Scanner Bridge Server is running. Start the Vite client separately for development.");
  });
});

// ── Socket.IO events ───────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  let myToken = null;
  let myRole = null; // "laptop" | "phone"

  // ── Laptop identifies itself ─────────────────────────────────────────────
  socket.on("laptop:identify", ({ token }) => {
    const session = sessions.get(token);
    if (!session) {
      socket.emit("error", { message: "Invalid or expired session token" });
      return;
    }
    myToken = token;
    myRole = "laptop";
    session.laptopSocketId = socket.id;
    socket.join(`session:${token}`);
    console.log(`[socket] laptop identified for token ${token}`);

    // If phone is already connected, tell laptop immediately
    if (session.phoneSocketId) {
      socket.emit("phone:connected");
    }

    // If phone already scanned before laptop reconnected, emit latest scan immediately
    if (session.scans.length > 0) {
      console.log(`[socket] delivering cached scan ${session.scans[0].barcode} to reconnecting laptop`);
      socket.emit("barcode:result", session.scans[0]);
    }
  });

  // ── Phone joins session ──────────────────────────────────────────────────
  socket.on("phone:join", ({ token }) => {
    const session = sessions.get(token);
    if (!session) {
      socket.emit("error", { message: "Invalid or expired session token" });
      return;
    }
    myToken = token;
    myRole = "phone";
    session.phoneSocketId = socket.id;
    socket.join(`session:${token}`);
    console.log(`[socket] phone joined session ${token}`);

    // Notify all members in session room that phone connected
    io.to(`session:${token}`).emit("phone:connected");
    socket.emit("phone:ready");
  });

  // ── Phone sends scanned barcode ──────────────────────────────────────────
  socket.on("barcode:scan", async (data) => {
    // data = { barcode, format, imageDataUrl, timestamp }
    if (!myToken) return;
    const session = sessions.get(myToken);
    if (!session) return;

    let barcode = data.barcode;
    let format = data.format || "unknown";

    if (!barcode && data.imageDataUrl) {
      try {
        const ocrRes = await fetch("http://localhost:5000/api/barcode/from-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: data.imageDataUrl }),
        });
        const ocrJson = await ocrRes.json();
        if (ocrJson.success && ocrJson.data?.barcode) {
          barcode = ocrJson.data.barcode;
          format = "ai_detected";
        }
      } catch (e) {
        console.warn("[socket-ocr] Failed:", e.message);
      }
    }

    if (!barcode) return;

    let productDetails = null;
    try {
      const prodRes = await fetch(`http://localhost:5000/api/barcode/${encodeURIComponent(barcode)}`);
      const prodJson = await prodRes.json();
      if (prodJson.success && prodJson.data?.product) {
        productDetails = prodJson.data.product;
      }
    } catch (e) {
      console.warn("[socket-product-lookup] Failed:", e.message);
    }

    const scanRecord = {
      id: uuidv4(),
      barcode,
      format,
      imageDataUrl: data.imageDataUrl || null,
      product: productDetails,
      timestamp: data.timestamp || Date.now(),
    };

    // Store in session history (keep last 50)
    session.scans.unshift(scanRecord);
    if (session.scans.length > 50) session.scans.pop();

    console.log(`[scan] ${scanRecord.barcode} (${productDetails?.name || "Product"}) → broadcast to room session:${myToken}`);

    // Broadcast to entire session room (both laptop & any reconnecting client)
    io.to(`session:${myToken}`).emit("barcode:result", scanRecord);
  });

  // ── Phone sends status updates ───────────────────────────────────────────
  socket.on("phone:status", (data) => {
    if (!myToken) return;
    const session = sessions.get(myToken);
    if (!session || !session.laptopSocketId) return;
    io.to(session.laptopSocketId).emit("phone:status", data);
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[socket] disconnected: ${socket.id} (role: ${myRole})`);
    if (!myToken) return;
    const session = sessions.get(myToken);
    if (!session) return;

    if (myRole === "phone") {
      session.phoneSocketId = null;
      if (session.laptopSocketId) {
        io.to(session.laptopSocketId).emit("phone:disconnected");
      }
    } else if (myRole === "laptop") {
      session.laptopSocketId = null;
    }
  });
});

// ── Start server + auto-tunnel (Cloudflare via untun) ───────────────────────
const PORT = process.env.PORT || 3001;

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`\n🚀 Scanner Bridge Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Socket.IO ready`);

  // Auto-start Cloudflare tunnel (no password, no "click to continue" screen)
  try {
    const { startTunnel } = await import("untun");
    console.log(`\n⏳ Starting Cloudflare HTTPS tunnel (direct access, zero interstitial)…`);
    const tunnel = await startTunnel({ port: PORT });
    const tunnelUrl = await tunnel.getURL();

    global.TUNNEL_URL = tunnelUrl;

    console.log(`\n✅ Direct Cloudflare HTTPS Tunnel ready!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📱 Phone URL: ${tunnelUrl}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n👉 Open on laptop: http://localhost:3001 (or http://localhost:5174)`);
    console.log(`   The QR code will instantly open the scanner with NO password prompt!\n`);

  } catch (e) {
    console.warn(`\n⚠ Cloudflare tunnel failed to start automatically: ${e.message}`);
    // Fallback attempt with localtunnel if untun fails
    try {
      const localtunnel = require("localtunnel");
      const tunnel = await localtunnel({ port: PORT });
      global.TUNNEL_URL = tunnel.url;
      console.log(`Localtunnel fallback active: ${tunnel.url}`);
    } catch {}
  }
});

