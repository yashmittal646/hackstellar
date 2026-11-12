import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatLabel(fmt) {
  const labels = {
    ean_13: "EAN-13", ean_8: "EAN-8",
    upc_a: "UPC-A", upc_e: "UPC-E",
    code_128: "CODE-128", code_39: "CODE-39",
    qr_code: "QR Code", data_matrix: "Data Matrix",
  };
  return labels[fmt] || fmt?.toUpperCase() || "Unknown";
}

// ── Laptop Dashboard ───────────────────────────────────────────────────────
export default function LaptopDashboard() {
  const [publicUrl, setPublicUrl] = useState("");
  const [tunnelReady, setTunnelReady] = useState(false);
  const [session, setSession] = useState(null);      // { token, phoneUrl, qrDataUrl }
  const [socketReady, setSocketReady] = useState(false);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState("");
  const [latestScan, setLatestScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const socketRef = useRef(null);
  const historyRef = useRef([]);

  // Auto-fetch tunnel URL from server on mount
  useEffect(() => {
    let tries = 0;
    const poll = async () => {
      try {
        const res = await fetch("/api/tunnel");
        const data = await res.json();
        if (data.url) {
          setPublicUrl(data.url);
          setTunnelReady(true);
          return; // stop polling
        }
      } catch {}
      tries++;
      if (tries < 20) setTimeout(poll, 2000); // retry every 2s for 40s
    };
    poll();
  }, []);

  // Keep historyRef in sync
  useEffect(() => { historyRef.current = history; }, [history]);

  // ── Disconnect socket cleanly ────────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketReady(false);
    setPhoneConnected(false);
    setPhoneStatus("");
  }, []);

  // ── Create a new session and connect socket ──────────────────────────────
  const createSession = useCallback(async () => {
    setLoading(true);
    setError("");
    disconnect();

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl: publicUrl.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSession(data);
      setPhoneConnected(false);
      setLatestScan(null);

      // Connect socket and identify as laptop
      const serverUrl = window.location.origin; // proxied to backend
      const sock = io(serverUrl, { transports: ["websocket", "polling"] });
      socketRef.current = sock;

      sock.on("connect", () => {
        console.log("[socket] connected as laptop");
        setSocketReady(true);
        sock.emit("laptop:identify", { token: data.token });
      });

      sock.on("phone:connected", () => {
        console.log("[socket] phone connected!");
        setPhoneConnected(true);
        setPhoneStatus("Phone connected ✓");
      });

      sock.on("phone:disconnected", () => {
        setPhoneConnected(false);
        setPhoneStatus("Phone disconnected");
      });

      sock.on("phone:status", ({ message }) => {
        setPhoneStatus(message || "");
      });

      sock.on("barcode:result", (scan) => {
        console.log("[scan received]", scan.barcode);
        setLatestScan(scan);
        setHistory(prev => [scan, ...prev].slice(0, 50));
      });

      sock.on("error", ({ message }) => setError(message));
      sock.on("disconnect", () => setSocketReady(false));
      sock.on("connect_error", (e) => setError("Socket connection failed: " + e.message));

    } catch (e) {
      setError("Failed to create session: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [publicUrl, disconnect]);

  // Cleanup on unmount
  useEffect(() => () => disconnect(), [disconnect]);

  // Polling fallback to ensure laptop NEVER misses a scan even if socket blinks
  useEffect(() => {
    if (!session?.token) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/session/${session.token}/scans`);
        const data = await res.json();
        if (data.success && data.scans?.length > 0) {
          const newest = data.scans[0];
          setLatestScan(prev => {
            if (!prev || prev.id !== newest.id) {
              return newest;
            }
            return prev;
          });
          setHistory(data.scans);
          if (data.phoneConnected) setPhoneConnected(true);
        }
      } catch {}
    }, 1500);
    return () => clearInterval(interval);
  }, [session?.token]);

  const copyUrl = async () => {
    if (!session?.phoneUrl) return;
    await navigator.clipboard.writeText(session.phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => { setHistory([]); setLatestScan(null); };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">📡</span>
            <div>
              <h1>Scanner Bridge</h1>
              <p>Wireless Phone → Laptop Barcode Scanner</p>
            </div>
          </div>
          {session && (
            <div className={`status-badge ${phoneConnected ? "status-on" : socketReady ? "status-wait" : "status-off"}`}>
              <span className="status-dot" />
              {phoneConnected ? "Phone Connected" : socketReady ? "Waiting for phone…" : "Offline"}
            </div>
          )}
        </div>
      </header>

      <main className="main">
        {/* ── Setup panel ─────────────────────────────────────────────── */}
        <div className="card setup-card">
          <h2>🔗 Connect Your Phone</h2>

          <div className="url-row">
            <div className="field">
              <label>
                Public HTTPS URL
                {tunnelReady && <span style={{color:"#22c55e", marginLeft:8}}>✓ Auto-detected</span>}
              </label>
              <input
                type="url"
                placeholder="Detecting tunnel URL…"
                value={publicUrl}
                onChange={e => { setPublicUrl(e.target.value); setTunnelReady(false); }}
                disabled={loading}
              />
              {!tunnelReady && (
                <p className="field-hint">
                  Starting Cloudflare HTTPS tunnel (no password, direct phone access)…
                </p>
              )}
              {tunnelReady && (
                <p className="field-hint" style={{color:"#22c55e"}}>
                  🟢 Cloudflare Tunnel Active — direct instant camera access with no password/prompt!
                </p>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={createSession}
              disabled={loading || !publicUrl}
            >
              {loading ? "Generating…" : session ? "↻ Reconnect" : "Connect Phone"}
            </button>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          {session && (
            <div className="pair-section">
              <div className="qr-block">
                <p className="qr-label">📱 Scan this QR code with your phone</p>
                {session.qrDataUrl ? (
                  <img className="qr-img" src={session.qrDataUrl} alt="Pairing QR code" />
                ) : (
                  <div className="qr-placeholder">QR unavailable</div>
                )}
                <div className="phone-url">
                  <span className="url-text">{session.phoneUrl}</span>
                  <button className="btn btn-sm" onClick={copyUrl}>
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="steps">
                <h3>How to connect:</h3>
                <ol>
                  <li><strong>Scan the QR code</strong> with your phone camera app</li>
                  <li>Your phone's browser opens the scanner page</li>
                  <li>Tap <strong>"Start Scanning"</strong> on your phone</li>
                  <li>Point the camera at any barcode</li>
                  <li>Results appear below instantly ⚡</li>
                </ol>
                {phoneStatus && (
                  <div className={`status-msg ${phoneConnected ? "status-msg-ok" : "status-msg-warn"}`}>
                    {phoneStatus}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Latest scan ──────────────────────────────────────────────── */}
        {latestScan && (
          <div className="card result-card">
            <div className="result-header">
              <h2>✅ Latest Scan</h2>
              <span className="result-time">{formatTime(latestScan.timestamp)}</span>
            </div>
            <div className="result-body">
              {latestScan.imageDataUrl && (
                <div className="result-img-wrap">
                  <img className="result-img" src={latestScan.imageDataUrl} alt="Captured barcode" />
                  <span className="result-img-label">Captured image</span>
                </div>
              )}
              <div className="result-info">
                <div className="barcode-number">{latestScan.barcode}</div>
                <div className="barcode-format">{formatLabel(latestScan.format)}</div>
                <div className="result-id">ID: {latestScan.id?.slice(0, 8)}</div>
              </div>
            </div>
          </div>
        )}

        {!latestScan && session && (
          <div className="card empty-card">
            <div className="empty-icon">📦</div>
            <p>{phoneConnected ? "Point your phone at a barcode to scan" : "Waiting for phone to connect…"}</p>
          </div>
        )}

        {/* ── History ───────────────────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="card history-card">
            <div className="history-header">
              <h2>📋 Scan History ({history.length})</h2>
              <button className="btn btn-sm btn-danger" onClick={clearHistory}>Clear</button>
            </div>
            <div className="history-list">
              {history.map((scan) => (
                <div key={scan.id} className="history-item">
                  {scan.imageDataUrl && (
                    <img className="history-thumb" src={scan.imageDataUrl} alt="thumb" />
                  )}
                  <div className="history-info">
                    <span className="history-barcode">{scan.barcode}</span>
                    <span className="history-meta">
                      {formatLabel(scan.format)} · {formatTime(scan.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

