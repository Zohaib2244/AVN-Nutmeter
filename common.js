// Shared data layer for the dashboard variants: fetching, formatting, clock, wake lock.
(() => {
  const STALE_MS = 15 * 60 * 1000;
  const state = { data: null, err: null };

  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function fmtDur(ms) {
    if (ms <= 0) return "now";
    const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${pad(m % 60)}m`;
    return `${m}m`;
  }
  const untilReset = (w) => (w.resetsAt ? fmtDur(new Date(w.resetsAt).getTime() - Date.now()) : "");
  const left = (w) => Math.max(0, Math.min(100, Math.round(100 - w.usedPercent)));

  function shortLabel(w) {
    if (/fable/i.test(w.label)) return "Fable";
    const m = w.windowMins;
    if (m === 300) return "5h";
    if (m === 10080) return "7d";
    if (m && m % 1440 === 0) return `${m / 1440}d`;
    if (m && m % 60 === 0) return `${m / 60}h`;
    return w.label;
  }

  // Provider accent colours; variants may override via the `accents` option of start().
  const groupName = (driver) => ({ codex: "Codex", claudeAgent: "Claude" }[driver] ?? driver);

  // "ok" | "warn" | "crit" from % left
  const level = (pct) => (pct <= 10 ? "crit" : pct <= 25 ? "warn" : "ok");

  function status() {
    if (state.err) return { text: "Can't reach dashboard", bad: true };
    if (!state.data) return { text: "", bad: false };
    const age = Date.now() - new Date(state.data.fetchedAt ?? 0).getTime();
    if (!state.data.ok || age > STALE_MS) return { text: `Stale · last update ${fmtDur(age)} ago`, bad: true };
    return { text: "", bad: false };
  }

  // Demo fixtures for checking the warning, empty and offline screens: open /app#mock=low (or offline, empty).
  const MOCK = /mock=(\w+)/.exec(location.hash)?.[1];
  function applyMock(data) {
    if (MOCK === "offline") throw new Error("mock offline");
    if (MOCK === "empty") data.providers = [];
    if (MOCK === "low") data.providers.forEach((p, i) => p.windows.forEach((w, j) => { w.usedPercent = [[84, 40], [93, 70], [100, 55], [30, 20]][i % 4][j % 2] ?? w.usedPercent; }));
  }

  async function load() {
    try {
      state.data = await (await fetch("/api/usage", { cache: "no-store" })).json(); state.err = null;
      applyMock(state.data);
    } catch (e) { state.err = e; }
  }

  // render(state) runs after every fetch and every 30s; tick(date) runs every second.
  // Returns { draw, refresh } so a caller can redraw straight after a settings change.
  function start({ render, tick, shiftId = "shift", wake = () => true }) {
    const draw = () => render({
      providers: state.data?.providers ?? [], loaded: !!state.data, status: status(),
      fetchedAt: state.data?.fetchedAt ?? null, ok: state.data?.ok ?? false, offline: !!state.err,
    });
    const refresh = async () => { await load(); draw(); };
    if (tick) { tick(new Date()); setInterval(() => tick(new Date()), 1000); }
    refresh(); setInterval(refresh, 30000); setInterval(draw, 30000);

    const keepAwake = async () => { try { if (wake() && "wakeLock" in navigator) await navigator.wakeLock.request("screen"); } catch {} };
    keepAwake();
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { keepAwake(); refresh(); } });

    // Nudge the layout a few pixels every minute so an OLED panel doesn't burn in.
    const el = document.getElementById(shiftId);
    if (el) setInterval(() => {
      const r = () => Math.round((Math.random() * 2 - 1) * 8);
      el.style.transform = `translate(${r()}px, ${r()}px)`;
    }, 60000);
    return { draw, refresh };
  }

  window.Dash = { start, pad, esc, fmtDur, untilReset, left, shortLabel, groupName, level };
})();
