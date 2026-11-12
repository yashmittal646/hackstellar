import { Router, Request, Response } from "express";

const router = Router();

/** In-memory session store: sessionId → { code, listeners } */
interface ScanSession {
  createdAt: number;
  scannedCode: string | null;
  listeners: Response[];
}

const sessions = new Map<string, ScanSession>();

// Clean up stale sessions every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000; // 10 min TTL
  for (const [id, session] of sessions.entries()) {
    if (session.createdAt < cutoff) sessions.delete(id);
  }
}, 5 * 60 * 1000);

/** POST /api/scan-relay/session — laptop calls this to create a session */
router.post("/session", (_req: Request, res: Response) => {
  const sessionId =
    Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g. "A3K9PZ"
  sessions.set(sessionId, {
    createdAt: Date.now(),
    scannedCode: null,
    listeners: [],
  });
  res.json({ success: true, data: { sessionId } });
});

/** GET /api/scan-relay/session/:id/events — SSE stream for laptop to listen */
router.get("/session/:id/events", (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send a keepalive comment every 25s
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  // If code was already scanned before SSE connected, send immediately
  if (session.scannedCode) {
    res.write(`data: ${JSON.stringify({ code: session.scannedCode })}\n\n`);
  }

  session.listeners.push(res);

  req.on("close", () => {
    clearInterval(heartbeat);
    session.listeners = session.listeners.filter((l) => l !== res);
  });
});

/** POST /api/scan-relay/session/:id/scan — phone posts scanned barcode */
router.post("/session/:id/scan", (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return;
  }

  const { code } = req.body as { code: string };
  if (!code) {
    res.status(400).json({ success: false, message: "code is required" });
    return;
  }

  session.scannedCode = code;

  // Push to all SSE listeners (the laptop)
  const event = `data: ${JSON.stringify({ code })}\n\n`;
  for (const listener of session.listeners) {
    listener.write(event);
  }

  res.json({ success: true, message: "Code relayed to laptop" });
});

/** GET /api/scan-relay/session/:id — simple poll fallback */
router.get("/session/:id", (req: Request, res: Response) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, message: "Session not found" });
    return;
  }
  res.json({ success: true, data: { code: session.scannedCode } });
});

export default router;

