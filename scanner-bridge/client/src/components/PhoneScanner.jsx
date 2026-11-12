import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";

const BARCODE_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
];

function captureFrameAsJpeg(videoEl, quality = 0.8, maxW = 1024) {
  try {
    if (!videoEl || !videoEl.videoWidth) return null;
    const scale = Math.min(1, maxW / videoEl.videoWidth);
    const w = Math.round(videoEl.videoWidth * scale);
    const h = Math.round(videoEl.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(videoEl, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return null;
  }
}

function fileToBase64(file, maxW = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Load failed"));
    };
    img.src = url;
  });
}

export default function PhoneScanner() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const scanLoopTimerRef = useRef(null);
  const lastBarcodeRef = useRef("");
  const lastScanTimeRef = useRef(0);
  const isScanningRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [laptopPaired, setLaptopPaired] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [socketError, setSocketError] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [flashMsg, setFlashMsg] = useState("");

  // ── Socket.IO connection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const sock = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    });
    socketRef.current = sock;

    sock.on("connect", () => {
      setConnected(true);
      setSocketError("");
      sock.emit("phone:join", { token });
    });
    sock.on("phone:ready", () => setLaptopPaired(true));
    sock.on("error", ({ message }) => setSocketError(message));
    sock.on("connect_error", (e) => setSocketError("Server link: " + e.message));
    sock.on("disconnect", () => {
      setConnected(false);
      setLaptopPaired(false);
    });

    return () => sock.disconnect();
  }, [token]);

  // ── Show Green Success Flash ─────────────────────────────────────────────
  const showFlash = useCallback((msg) => {
    setFlashMsg(msg);
    setFlashVisible(true);
    if (navigator.vibrate) navigator.vibrate([100, 60, 180]);
    setTimeout(() => setFlashVisible(false), 2500);
  }, []);

  // ── Send Scan to Laptop (Socket + HTTP with product lookup) ───────────────
  const dispatchScan = useCallback(
    async (scanData) => {
      setIsSending(true);
      try {
        // Socket.IO real-time emission
        socketRef.current?.emit("barcode:scan", scanData);

        // HTTP POST fallback (returns enriched product details from server!)
        const res = await fetch(`/api/session/${encodeURIComponent(token)}/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scanData),
        });
        const json = await res.json();
        const finalScan = json.success ? json.scan : scanData;
        if (json.product) finalScan.product = json.product;

        setLastResult(finalScan);
        setScanCount((c) => c + 1);

        const prodName = finalScan.product?.name ? `\n${finalScan.product.name}` : "";
        showFlash(
          finalScan.barcode
            ? `✅ Scanned: ${finalScan.barcode}${prodName}`
            : "✅ Photo Sent — AI identifying on laptop…"
        );
      } catch {
        setLastResult(scanData);
        setScanCount((c) => c + 1);
        showFlash(scanData.barcode ? `✅ Sent: ${scanData.barcode}` : "📤 Photo sent to laptop…");
      } finally {
        setIsSending(false);
      }
    },
    [token, showFlash]
  );

  // ── Start Camera Stream with Autofocus ───────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");

    // Stop old tracks first
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
    }

    try {
      // Constraints with continuous focus preference
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPermissionGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play().catch(() => {});
        setCameraReady(true);
      }
    } catch (e) {
      console.warn("Camera start err:", e);
      let msg = "Camera error: " + e.message;
      if (e.name === "NotAllowedError") msg = "Camera access denied. Please allow camera in browser settings.";
      else if (e.name === "NotFoundError") msg = "No rear camera found on device.";
      else if (e.name === "NotReadableError") msg = "Camera is locked by another app. Tap Refresh Camera.";
      setCameraError(msg);
      setCameraReady(false);
    }
  }, []);

  // ── Stop Camera Stream ───────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (scanLoopTimerRef.current) {
      clearInterval(scanLoopTimerRef.current);
      scanLoopTimerRef.current = null;
    }
    isScanningRef.current = false;
    setScanning(false);

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  // ── FIX FOR BLACK SCREEN: Auto-recover when switching back to browser ────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const track = streamRef.current?.getVideoTracks()?.[0];
        const isDead = !track || track.readyState === "ended" || !track.enabled;
        if (isDead && permissionGranted) {
          console.log("[camera] Tab resumed with dead stream — restarting camera cleanly…");
          setTimeout(() => {
            startCamera();
          }, 300);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [permissionGranted, startCamera]);

  // ── Dual Barcode Detector (Native C++ BarcodeDetector + ZXing Fallback) ──
  const detectFromVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return null;

    // 1. Try Native BarcodeDetector (instant hardware C++ scan on Android Chrome)
    if ("BarcodeDetector" in window) {
      try {
        const bd = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "code_93", "itf", "qr_code", "data_matrix"],
        });
        const results = await bd.detect(video);
        if (results && results.length > 0 && results[0].rawValue) {
          return {
            barcode: results[0].rawValue,
            format: results[0].format || "barcode_detector",
          };
        }
      } catch {}
    }

    // 2. ZXing center-crop canvas fallback
    try {
      if (!readerRef.current) {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS);
        hints.set(DecodeHintType.TRY_HARDER, true);
        readerRef.current = new BrowserMultiFormatReader(hints);
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      // Focus on center 75% width, 40% height where the green target box is
      const cropW = Math.round(vw * 0.75);
      const cropH = Math.round(vh * 0.45);
      const startX = Math.round((vw - cropW) / 2);
      const startY = Math.round((vh - cropH) / 2);

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
        const res = await readerRef.current.decodeFromCanvas(canvas);
        if (res && res.getText()) {
          return {
            barcode: res.getText(),
            format: BarcodeFormat[res.getBarcodeFormat()]?.toLowerCase() || "zxing",
          };
        }
      }
    } catch {}

    return null;
  }, []);

  // ── Snap Current Frame (Manual trigger while looking at barcode) ─────────
  const snapCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !cameraReady) {
      startCamera();
      return;
    }

    const imgData = captureFrameAsJpeg(videoRef.current);
    if (!imgData) {
      setCameraError("Cannot capture video frame. Try restarting camera.");
      return;
    }

    // Try instant detection on the frame
    let code = "";
    let format = "snap_ai";
    const detected = await detectFromVideo();
    if (detected?.barcode) {
      code = detected.barcode;
      format = detected.format;
    }

    await dispatchScan({
      barcode: code,
      format,
      imageDataUrl: imgData,
      timestamp: Date.now(),
    });
  }, [cameraReady, detectFromVideo, dispatchScan, startCamera]);

  // ── Start Live Continuous Auto-Scanning Loop ─────────────────────────────
  const startScanning = useCallback(async () => {
    if (!cameraReady || !videoRef.current) {
      await startCamera();
    }

    setScanning(true);
    isScanningRef.current = true;
    lastBarcodeRef.current = "";
    lastScanTimeRef.current = 0;

    socketRef.current?.emit("phone:status", { message: "📷 Phone scanning live…" });

    // Periodic detection loop (every 220ms)
    if (scanLoopTimerRef.current) clearInterval(scanLoopTimerRef.current);

    scanLoopTimerRef.current = setInterval(async () => {
      if (!isScanningRef.current || !videoRef.current) return;

      try {
        const hit = await detectFromVideo();
        if (hit?.barcode) {
          const now = Date.now();
          // Debounce same barcode within 4 seconds
          if (hit.barcode === lastBarcodeRef.current && now - lastScanTimeRef.current < 4000) return;

          lastBarcodeRef.current = hit.barcode;
          lastScanTimeRef.current = now;

          console.log("[detected]", hit.barcode, hit.format);
          const imgData = captureFrameAsJpeg(videoRef.current);

          // Green border flash on video preview
          if (videoRef.current) {
            videoRef.current.style.borderColor = "#22c55e";
            setTimeout(() => {
              if (videoRef.current) videoRef.current.style.borderColor = "transparent";
            }, 500);
          }

          dispatchScan({
            barcode: hit.barcode,
            format: hit.format,
            imageDataUrl: imgData,
            timestamp: now,
          });
        }
      } catch {}
    }, 220);
  }, [cameraReady, detectFromVideo, dispatchScan, startCamera]);

  // ── Stop Live Scanning Loop ──────────────────────────────────────────────
  const stopScanning = useCallback(() => {
    isScanningRef.current = false;
    setScanning(false);
    if (scanLoopTimerRef.current) {
      clearInterval(scanLoopTimerRef.current);
      scanLoopTimerRef.current = null;
    }
    socketRef.current?.emit("phone:status", { message: "⏸ Scanner paused" });
  }, []);

  // ── Handle Native Camera App Photo Capture ───────────────────────────────
  const handlePhotoUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = ""; // clear so user can take photo of same barcode again!

      setIsSending(true);
      try {
        const b64 = await fileToBase64(file);
        let code = "";

        // Try local ZXing decode on the high-res file
        try {
          if (!readerRef.current) {
            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS);
            hints.set(DecodeHintType.TRY_HARDER, true);
            readerRef.current = new BrowserMultiFormatReader(hints);
          }
          const img = new Image();
          img.src = b64;
          await new Promise((res) => {
            img.onload = res;
          });
          const decoded = await readerRef.current.decodeFromImageElement(img);
          code = decoded.getText();
        } catch {}

        await dispatchScan({
          barcode: code,
          format: code ? "camera_app" : "photo_ai",
          imageDataUrl: b64,
          timestamp: Date.now(),
        });
      } catch (err) {
        setCameraError("Photo error: " + err.message);
      } finally {
        setIsSending(false);
        // FIX FOR BLACK SCREEN: ensure live camera recovers after returning from native camera
        setTimeout(() => {
          const track = streamRef.current?.getVideoTracks()?.[0];
          if (!track || track.readyState === "ended" || !videoRef.current?.srcObject) {
            startCamera();
          }
        }, 400);
      }
    },
    [dispatchScan, startCamera]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
      stopCamera();
    };
  }, [stopScanning, stopCamera]);

  if (!token) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#fff", background: "#07090e", minHeight: "100vh" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <h2>Invalid Pairing Link</h2>
        <p style={{ color: "#94a3b8" }}>Scan the QR code displayed on your laptop screen.</p>
      </div>
    );
  }

  const prod = lastResult?.product;

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#07090e",
        minHeight: "100vh",
        color: "#fff",
        paddingBottom: 40,
        maxWidth: 500,
        margin: "0 auto",
      }}
    >
      {/* ── SUCCESS POPUP MODAL ── */}
      {flashVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(16, 185, 129, 0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 64 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", whiteSpace: "pre-line" }}>{flashMsg}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.2)", padding: "6px 14px", borderRadius: 20 }}>
            Transferred to laptop dashboard instantly!
          </div>
        </div>
      )}

      {/* ── Top Header ── */}
      <div
        style={{
          background: "#0f172a",
          padding: "12px 16px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📦</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>Hackstellar Rider</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>Doorstep Wireless Scanner</div>
          </div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: laptopPaired ? "rgba(16,185,129,0.2)" : connected ? "rgba(234,179,8,0.2)" : "rgba(100,116,139,0.2)",
            color: laptopPaired ? "#34d399" : connected ? "#fbbf24" : "#94a3b8",
            border: `1px solid ${laptopPaired ? "rgba(16,185,129,0.4)" : connected ? "rgba(234,179,8,0.4)" : "rgba(100,116,139,0.4)"}`,
          }}
        >
          {laptopPaired ? "✓ Laptop Paired" : connected ? "Connecting…" : "Offline"}
        </div>
      </div>

      {socketError && (
        <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", margin: "10px 16px", padding: "10px 14px", borderRadius: 10, color: "#fca5a5", fontSize: 13 }}>
          ⚠ {socketError}
        </div>
      )}

      {/* ── Live Camera Preview Window ── */}
      <div
        style={{
          position: "relative",
          margin: "12px 16px 0",
          borderRadius: 16,
          overflow: "hidden",
          background: "#000",
          aspectRatio: "4/3",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            border: "3px solid transparent",
            borderRadius: 14,
            transition: "border-color 0.25s",
          }}
          playsInline
          muted
          autoPlay
        />

        {/* Placeholder / Black screen recovery overlay */}
        {!cameraReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "#0f172a",
              padding: 20,
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 44 }}>📷</span>
            <div style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600 }}>
              {permissionGranted ? "Camera paused / inactive" : "Camera turned off"}
            </div>
            <button
              onClick={startCamera}
              style={{
                marginTop: 6,
                padding: "10px 18px",
                background: "#6366f1",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              🔄 Turn On / Refresh Camera
            </button>
          </div>
        )}

        {/* Active Scan Guide Box */}
        {scanning && cameraReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "75%",
                height: "40%",
                border: "2px solid #22c55e",
                borderRadius: 10,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "linear-gradient(90deg, transparent, #22c55e, transparent)",
                  animation: "scanLine 1.6s ease-in-out infinite",
                  top: "50%",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: -22,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#22c55e",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Hold barcode in frame
              </span>
            </div>
          </div>
        )}

        {/* Live scanning badge */}
        {scanning && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(16,185,129,0.92)",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#fff",
                animation: "pulseDot 1s infinite",
              }}
            />
            LIVE SCANNING
          </div>
        )}

        {isSending && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(99,102,241,0.92)",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            📤 Transferring…
          </div>
        )}
      </div>

      {cameraError && (
        <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", margin: "10px 16px 0", padding: "10px 14px", borderRadius: 10, color: "#fca5a5", fontSize: 13 }}>
          ⚠ {cameraError}
          <button
            onClick={() => {
              setCameraError("");
              startCamera();
            }}
            style={{
              display: "block",
              marginTop: 8,
              padding: "6px 12px",
              background: "rgba(239,68,68,0.3)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* ── Main Scan Action Buttons ── */}
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Toggle Camera */}
        {!cameraReady ? (
          <button
            onClick={startCamera}
            style={{
              padding: "15px 20px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
            }}
          >
            📹 Turn On Rear Camera
          </button>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Auto-scan toggle */}
            {!scanning ? (
              <button
                onClick={startScanning}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
                }}
              >
                ▶ Auto Scan
              </button>
            ) : (
              <button
                onClick={stopScanning}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ⏸ Pause
              </button>
            )}

            {/* Instant Snap Button */}
            <button
              onClick={snapCurrentFrame}
              disabled={isSending}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(99,102,241,0.25)",
                border: "1px solid rgba(99,102,241,0.5)",
                color: "#a5b4fc",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ⚡ Scan Now
            </button>
          </div>
        )}

        {/* Native Camera App Option */}
        <label
          htmlFor="phone-native-cam"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 20px",
            borderRadius: 14,
            background: "rgba(30,41,59,0.9)",
            border: "1px solid #334155",
            color: "#e2e8f0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <span>📷</span>
          <span>Take Photo with Camera App</span>
        </label>
        <input
          id="phone-native-cam"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          style={{ position: "fixed", top: 0, left: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        />
      </div>

      {/* ── DRIVER PRODUCT VERIFICATION CARD (Solves Driver Matching Issue) ── */}
      {prod && (
        <div
          style={{
            margin: "16px 16px 0",
            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 13, background: "rgba(16,185,129,0.2)", color: "#34d399", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
              ✓ PRODUCT IDENTIFIED
            </span>
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{lastResult?.barcode}</span>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {prod.imageUrl ? (
              <img
                src={prod.imageUrl}
                alt={prod.name}
                style={{ width: 68, height: 68, objectFit: "contain", borderRadius: 10, background: "#fff", padding: 4, flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 10,
                  background: "#1e293b",
                  border: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                📦
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>{prod.name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {prod.brand} · <span style={{ color: "#64748b" }}>{prod.category}</span>
              </div>
              {prod.price > 0 && (
                <div style={{ fontSize: 16, fontWeight: 900, color: "#34d399", marginTop: 4 }}>₹{prod.price.toLocaleString("en-IN")}</div>
              )}
            </div>
          </div>

          {/* Driver Inspection Checklist Prompt */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              📋 Driver Doorstep Verification Guide:
            </div>
            <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.5 }}>
              {prod.verificationSpecs || `Compare customer's item with ${prod.name}. Ensure factory seal is intact, package undamaged, and label matches.`}
            </div>
          </div>
        </div>
      )}

      {/* ── Status Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "14px 16px 0" }}>
        {[
          { val: scanCount, lbl: "Scans Sent" },
          { val: scanning ? "LIVE" : cameraReady ? "READY" : "OFF", lbl: "Camera" },
          { val: laptopPaired ? "PAIRED" : connected ? "LINKED" : "OFFLINE", lbl: "Laptop Link" },
        ].map(({ val, lbl }) => (
          <div key={lbl} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: val === "LIVE" || val === "PAIRED" ? "#34d399" : val === "OFFLINE" ? "#f87171" : "#e2e8f0",
              }}
            >
              {val}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0.4; }
          50% { top: 85%; opacity: 1; }
          100% { top: 10%; opacity: 0.4; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
