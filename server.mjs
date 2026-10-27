// Serves a clock + provider usage-limits page for an always-on phone display.
// Polls the local T3 Code server (read-only token) and re-serves a slimmed JSON snapshot.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = path.join(DIR, "token.txt");
const T3_BIN = process.env.T3_BIN ?? path.join(process.env.HOME, ".t3/bin/t3");
const T3_HOST = process.env.T3_HOST ?? "127.0.0.1:3773";
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 8787);
const POLL_MS = Number(process.env.POLL_MS ?? 60_000);

let snapshot = { ok: false, error: "starting", fetchedAt: null, providers: [] };

const log = (...a) => console.log(new Date().toISOString(), ...a);
const readToken = () => (fs.existsSync(TOKEN_FILE) ? fs.readFileSync(TOKEN_FILE, "utf8").trim() : "");

class AuthError extends Error {}

function issueToken() {
  return new Promise((resolve, reject) => {
    const args = ["auth", "session", "issue", "--scope", "orchestration:read", "--ttl", "30d", "--label", "phone-usage-dashboard", "--token-only"];
    execFile(T3_BIN, args, { env: { ...process.env, ELECTRON_RUN_AS_NODE: "" }, timeout: 30_000 }, (err, stdout) => {
      const token = String(stdout ?? "").trim().split("\n").pop();
      if (err || !token) return reject(err ?? new Error("empty token"));
      fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
      resolve(token);
    });
  });
}

async function fetchConfig(token) {
  const res = await fetch(`http://${T3_HOST}/api/auth/websocket-ticket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 401 || res.status === 403) throw new AuthError(`ticket ${res.status}`);
  if (!res.ok) throw new Error(`ticket ${res.status}`);
  const { ticket } = await res.json();
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${T3_HOST}/ws?orchestrationProtocol=2&wsTicket=${encodeURIComponent(ticket)}`);
    const timer = setTimeout(() => { ws.close(); reject(new Error("rpc timeout")); }, 20_000);
    ws.onopen = () => ws.send(JSON.stringify({ _tag: "Request", id: "1", tag: "server.getConfig", payload: {}, headers: [] }));
    ws.onerror = () => { clearTimeout(timer); reject(new Error("ws error")); };
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(String(e.data)); } catch { return; }
      if (msg._tag !== "Exit") return;
      clearTimeout(timer);
      ws.close();
      if (msg.exit?._tag === "Success") resolve(msg.exit.value);
      else reject(new Error(`rpc failed: ${JSON.stringify(msg.exit).slice(0, 200)}`));
    };
  });
}

// Keep only what the page needs; never forward emails, workspace ids or credential fingerprints.
function slim(config) {
  const providers = [];
  for (const p of config.providers ?? []) {
    const windows = p.usageLimits?.windows ?? [];
    if (p.enabled === false || windows.length === 0) continue;
    providers.push({
      id: p.instanceId,
      driver: p.driver,
      name: p.displayName ?? p.instanceId,
      checkedAt: p.usageLimits.checkedAt,
      windows: windows.map((w) => ({
        id: w.id,
        kind: w.kind,
        label: w.label,
        usedPercent: w.usedPercent,
        resetsAt: w.resetsAt ?? null,
        windowMins: w.windowDurationMins ?? null,
      })),
      resetCredits: p.usageLimits.resetCredits?.availableCount ?? null,
    });
  }
  return providers;
}

async function poll() {
  try {
    let token = readToken() || (await issueToken());
    let config;
    try {
      config = await fetchConfig(token);
    } catch (e) {
      if (!(e instanceof AuthError)) throw e;
      log("token rejected, issuing a new one");
      token = await issueToken();
      config = await fetchConfig(token);
    }
    snapshot = { ok: true, fetchedAt: new Date().toISOString(), providers: slim(config) };
  } catch (e) {
    log("poll failed:", e.message);
    snapshot = { ...snapshot, ok: false, error: e.message };
  }
}

// Page routes → files in this directory (read per request so edits show on reload).
const ROUTES = {
  "/": "index.html", "/index.html": "index.html", "/classic": "index.html",
  "/v1": "v1.html", "/v2": "v2.html", "/v3": "v3.html", "/v4": "v4.html", "/pick": "pick.html",
  "/common.js": "common.js",
};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/usage") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    return res.end(JSON.stringify(snapshot));
  }
  const file = ROUTES[url.pathname];
  if (file) {
    const type = file.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    return res.end(fs.readFileSync(path.join(DIR, file)));
  }
  res.writeHead(404).end("not found");
});
server.on("error", (e) => { log("listen failed:", e.message); process.exit(1); });
server.listen(PORT, HOST, () => log(`serving on http://${HOST}:${PORT}`));

poll();
setInterval(poll, POLL_MS);
