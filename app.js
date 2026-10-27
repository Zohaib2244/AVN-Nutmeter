// AVN Nutmeter: the app. Data comes from common.js (Dash); look comes from the AVN style links
// that nutmeter.html wrote before first paint; clock faces come from faces.js (NMFaces).
// Settings live in localStorage (window.__NM).
(() => {
  "use strict";
  const D = window.Dash, NM = window.__NM, S = NM.settings, FACES = window.NMFaces;
  const $ = (sel, r = document) => r.querySelector(sel);
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = D.esc, pad = D.pad;
  const NAME = "nutmag"; // the gamer tag: nutmag2469

  // ---------- palettes: [key, name, swatch, one-line note] ----------
  const STYLE_NAMES = { "avn-family": "AVN Family", nutstyle: "Nutstyle", pocket: "Pocket" };
  const PALETTES = {
    "avn-family": [
      ["", "Nutmeg", "light-dark(#cf5418, #ff7f45)", "Nutmeg. Named after the gamer tag."],
      ["slate", "Slate", "light-dark(#1d6fd1, #5aa8ff)", "Slate. Calm and blue."],
      ["moss", "Moss", "light-dark(#4b8411, #9ccc4a)", "Moss. A little block-world green."],
      ["hibiscus", "Hibiscus", "light-dark(#b0204a, #e0476b)", "Hibiscus. Dried, deep crimson."],
      ["white", "White build", "light-dark(#1d2125, #f2f4f6)", "White build. Four face buttons, four colours."],
      ["chiral", "Chiral", "light-dark(#0b6f8a, #7fe5ff)", "Chiral network online."],
      ["dora", "Dora", "light-dark(#9e5e00, #ffb020)", "Dora. Black and amber, eyes open."],
    ],
    nutstyle: [
      ["", "Ember", "light-dark(#e05a18, #ff6b2b)", "Ember. Hot and chunky."],
      ["slate", "Slate", "light-dark(#1a73d8, #4da3ff)", "Slate. Cool and steady."],
      ["moss", "Moss", "light-dark(#4e8a10, #8fc63c)", "Moss. Green as a garden."],
      ["plum", "Plum", "light-dark(#c01868, #e84a8a)", "Plum. Berry bright."],
      ["reef", "Reef", "light-dark(#cf4e32, #ff7a59)", "Reef. Coral on deep water."],
      ["raspberry", "Raspberry", "light-dark(#d41446, #ff4d6d)", "Raspberry. Loud and sweet."],
      ["circuit", "Circuit", "light-dark(#b38300, #f2c94c)", "Circuit. Yellow traces."],
      ["graphite", "Graphite", "light-dark(#bf3f20, #f0623d)", "Graphite. Quiet, with a hot core."],
    ],
    pocket: [
      ["", "Cream", "light-dark(#d9a400, #ffd23f)", "Cream shell, yellow face button."],
      ["mint", "Mint", "light-dark(#bd3f22, #ff8a66)", "Mint shell, coral button."],
      ["lagoon", "Lagoon", "light-dark(#d9a400, #ffd23f)", "Lagoon shell, yellow button."],
      ["grape", "Grape", "light-dark(#86b816, #b6e34a)", "Grape shell, lime button."],
    ],
  };
  const SECRETS = {
    konami: "Nut Hoarder", pet: "Cat person", shy: "Shy cat", nutbot: "Hello, NutBot", wish: "Make a wish", owl: "Night owl", dry: "Dry well", collector: "Collector",
    gamertag: "Gamer tag", flipper: "Click-clack", twosuns: "Two suns", timetravel: "Time traveller", stargazer: "Star gazer", stash: "Full stash", lives: "Nine lives", run: "Good run", sudo: "Not a sudoer",
  };

  // ---------- icons ----------
  const svg = (d) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    bars: svg('<path d="M6 20v-5M12 20V6M18 20v-9"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  };
  $("#btnSettings").innerHTML = IC.gear;
  $("#btnLimits").innerHTML = IC.bars;
  $("#btnFace").innerHTML = IC.clock;

  // ---------- toasts (components.css .toast) ----------
  const TOASTS = [];
  function toast(o) {
    const kind = o.kind || "info", key = o.key || o.title, ms = o.ms || 4200;
    const dup = TOASTS.find((x) => x.key === key);
    if (dup) { dup.n++; const n = $(".t-n", dup.el); n.textContent = "×" + dup.n; n.hidden = false; arm(dup, ms); return; }
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.setAttribute("role", kind === "bad" ? "alert" : "status");
    el.innerHTML = `<span class="t-i">${IC[o.icon || (kind === "ok" ? "check" : "info")]}</span>` +
      `<div class="t-b"><b>${esc(o.title)}<span class="t-n" hidden></span></b>${o.msg ? `<span class="m">${esc(o.msg)}</span>` : ""}` +
      `${o.action ? `<button class="t-a" type="button">${esc(o.action.label)}</button>` : ""}</div>` +
      `<button class="t-x" type="button" aria-label="Dismiss">${IC.x}</button><i class="t-bar"></i>`;
    const t = { el, key, n: 1, timer: 0 };
    TOASTS.push(t);
    $("#toasts").appendChild(el);
    $(".t-x", el).addEventListener("click", () => dismiss(t));
    if (o.action) $(".t-a", el).addEventListener("click", () => { o.action.fn(); dismiss(t); });
    arm(t, ms);
    while (TOASTS.length > 4) dismiss(TOASTS[0]);
  }
  function arm(t, ms) {
    clearTimeout(t.timer);
    const bar = $(".t-bar", t.el);
    bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = `barrun ${ms}ms linear forwards`;
    t.timer = setTimeout(() => dismiss(t), ms);
  }
  function dismiss(t) {
    clearTimeout(t.timer);
    const i = TOASTS.indexOf(t); if (i < 0) return; TOASTS.splice(i, 1);
    t.el.classList.add("out"); setTimeout(() => t.el.remove(), 200);
  }

  // ---------- secrets ----------
  function unlock(id) {
    if (S.found[id]) return;
    S.found[id] = Date.now(); NM.save();
    toast({ kind: "ok", icon: "star", title: "Secret found: " + SECRETS[id], msg: `${Object.keys(S.found).length} of ${Object.keys(SECRETS).length}`, key: "secret-" + id, ms: 5200 });
    if (drawerOpen()) renderDrawer();
  }

  // ---------- flip clicks (optional) ----------
  let ac = null;
  function click() {
    if (!S.sound) return;
    try {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      const n = Math.floor(ac.sampleRate * 0.03), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.18));
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = buf; f.type = "bandpass"; f.frequency.value = 1800; g.gain.value = 0.35;
      src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
    } catch {}
  }

  // ---------- look: style, palette, theme ----------
  function setHref(id, href) { const l = $("#" + id); if (l && l.getAttribute("href") !== href) l.setAttribute("href", href); }
  const hourNow = () => new Date().getHours();
  function resolveTheme() { const h = hourNow(); return S.theme === "day" ? "light" : S.theme === "night" ? "dark" : (h >= 6 && h < 18 ? "light" : "dark"); }
  function applyTheme() {
    const t = resolveTheme(), h = hourNow();
    root.dataset.theme = t;
    $("#dash").dataset.dim = S.dim && t === "dark" && (h >= 23 || h < 6) ? "1" : "0";
  }
  function applyLook() {
    const st = NM.STYLES[S.style], b = "/avn/styles/";
    setHref("s-fonts", b + S.style + "/fonts.css");
    setHref("s-tokens", b + S.style + "/tokens.css");
    setHref("s-skin", b + S.style + "/skin.css");
    $("#s-skin").media = st.skin ? "all" : "not all";
    setHref("s-flavour", b + st.flavour + "/flavour.css");
    if (!PALETTES[S.style].some((p) => p[0] === S.palette)) S.palette = "";
    if (S.palette) root.dataset.palette = S.palette; else delete root.dataset.palette;
    applyTheme();
  }

  // ---------- limits section: animated in and out ----------
  function applyLimits() {
    $("#shift").dataset.limits = S.limits ? "1" : "0";
    $("#accts").inert = !S.limits;
    const b = $("#btnLimits");
    b.setAttribute("aria-pressed", String(!!S.limits));
    b.setAttribute("aria-label", S.limits ? "Hide limits" : "Show limits");
    b.title = (S.limits ? "Hide" : "Show") + " limits (G)";
  }

  // ---------- clock faces ----------
  let face = null;
  const ctx = { S, D, esc, pad, reduced, toast, unlock, change: (p) => change(p), save: () => NM.save(), click, data: () => data, faces: FACES, boot: (f) => boot(f), hourNow };
  function mountFace() {
    if (face) face.destroy?.();
    const def = FACES.find((f) => f.id === S.face) || FACES[0];
    S.face = def.id;
    const box = $("#facebox");
    box.innerHTML = ""; box.dataset.face = def.id;
    face = def.create(ctx);
    face.mount(box);
    face.tick(new Date());
    const b = $("#btnFace"); b.title = `Clock face: ${def.name} (C)`;
  }
  const nextFace = () => { const i = FACES.findIndex((f) => f.id === S.face), nf = FACES[(i + 1) % FACES.length]; change({ face: nf.id }); toast({ title: nf.name, msg: nf.hint, key: "face", ms: 2000 }); };

  // ---------- settings changes ----------
  function change(patch) {
    const prevStyle = S.style, prevPalette = S.palette;
    Object.assign(S, patch);
    if (patch.style && patch.style !== prevStyle) S.palette = "";
    NM.save(); applyLook();
    if ("face" in patch) mountFace();
    if ("limits" in patch) applyLimits();
    renderAll(new Date(), Object.keys(patch).length > 0 && !("fable" in patch) && !("layout" in patch));
    face?.tick(new Date());
    if (drawerOpen()) renderDrawer();
    if (S.palette !== prevPalette || S.style !== prevStyle) {
      const list = PALETTES[S.style], cur = list.find((p) => p[0] === S.palette) || list[0];
      toast({ kind: "info", title: S.style !== prevStyle ? `${STYLE_NAMES[S.style]} · ${cur[1]}` : cur[1], msg: cur[3], key: "palette", ms: 2600 });
      const tried = (S.tried[S.style] ||= []);
      if (!tried.includes(S.palette)) tried.push(S.palette);
      NM.save();
      if (tried.length === list.length) unlock("collector");
    }
  }
  const cycle = (list, cur) => list[(list.indexOf(cur) + 1) % list.length];
  const nextStyle = (dir = 1) => { const k = Object.keys(STYLE_NAMES); change({ style: k[(k.indexOf(S.style) + dir + k.length) % k.length] }); };
  const nextPalette = () => change({ palette: cycle(PALETTES[S.style].map((p) => p[0]), S.palette) });
  const cycleTheme = () => { const t = cycle(["auto", "day", "night"], S.theme); change({ theme: t }); toast({ title: t === "auto" ? "Auto: follows the clock" : t === "day" ? "Day" : "Night", key: "theme", ms: 1800 }); };

  // ---------- helpers on usage data ----------
  let data = { providers: [], loaded: false, ok: false, offline: false, fetchedAt: null };
  const isFable = (w) => /fable/i.test(w.label);
  const wins = (p) => p.windows.filter((w) => S.fable || !isFable(w));
  function stateOf(p) {
    const ws = wins(p);
    if (!ws.length) return { kind: "plain", word: "No data", w: null, pct: null };
    const w = ws.reduce((a, b) => (D.left(b) < D.left(a) ? b : a)), pct = D.left(w);
    if (pct === 0) return { kind: "bad", word: "Empty", w, pct };
    const lv = D.level(pct);
    return lv === "crit" ? { kind: "bad", word: "Almost out", w, pct } : lv === "warn" ? { kind: "warn", word: "Getting low", w, pct } : { kind: "ok", word: "Healthy", w, pct };
  }
  const meterCls = (pct, tight) => { const lv = D.level(pct); return lv === "crit" ? "bad" : lv === "warn" ? "warn" : tight ? "hi" : ""; };
  const ORDER = ["5h", "7d", "Fable"], ord = (l) => (ORDER.includes(l) ? ORDER.indexOf(l) : 9);
  const age = () => (data.fetchedAt ? Date.now() - new Date(data.fetchedAt).getTime() : null);

  // ---------- rendering: accounts ----------
  function panelHTML(p, i) {
    const st = stateOf(p);
    const rows = wins(p).map((w) => {
      const pct = D.left(w);
      return `<div class="urow"><span class="lbl">${esc(D.shortLabel(w))}</span>` +
        `<div class="meter ${meterCls(pct, w === st.w)}" style="--p:${pct}%" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(p.name)} ${esc(w.label)} left"><i></i></div>` +
        `<span class="pct">${pct}%</span><span class="rst">${D.untilReset(w)}</span></div>`;
    }).join("");
    const credits = p.resetCredits ? ` · ${p.resetCredits} reset${p.resetCredits > 1 ? "s" : ""}` : "";
    return `<article class="panel acct" style="--i:${i}"><div class="ph"><div><h2>${esc(p.name)}</h2><p>${esc(D.groupName(p.driver))}${credits}</p></div>` +
      `<span class="tag ${st.kind} dot">${st.word}</span></div><div class="pb">${rows}</div></article>`;
  }
  function tableHTML(ps) {
    const labels = [...new Set(ps.flatMap((p) => wins(p).map(D.shortLabel)))].sort((a, b) => ord(a) - ord(b));
    const head = `<tr><th>Account</th>${labels.map((l) => `<th>${esc(l)}</th>`).join("")}<th>Status</th></tr>`;
    const body = ps.map((p) => {
      const st = stateOf(p), ws = wins(p);
      const cells = labels.map((l) => {
        const w = ws.find((x) => D.shortLabel(x) === l);
        if (!w) return `<td class="dim">–</td>`;
        const pct = D.left(w);
        return `<td><div class="cellv"><div class="top2"><b>${pct}%</b><span>${D.untilReset(w)}</span></div><div class="meter ${meterCls(pct, w === st.w)}" style="--p:${pct}%"><i></i></div></div></td>`;
      }).join("");
      return `<tr><td class="who"><b>${esc(p.name)}</b><span>${esc(D.groupName(p.driver))}</span></td>${cells}<td><span class="tag ${st.kind} dot">${st.word}</span></td></tr>`;
    }).join("");
    return `<div class="panel tbl"><div class="t-wrap"><table class="t"><thead>${head}</thead><tbody>${body}</tbody></table></div></div>`;
  }
  function renderAccts() {
    const el = $("#accts");
    if (!data.loaded && !data.offline) {
      el.innerHTML = Array.from({ length: 4 }, (_, i) => `<div class="panel sk-card acct" style="--i:${i}" aria-hidden="true"><span class="sk" style="height:16px;width:55%"></span><span class="sk" style="height:10px"></span><span class="sk" style="height:10px;width:80%"></span></div>`).join("");
      return;
    }
    if (!data.providers.length) {
      el.innerHTML = data.offline
        ? `<div class="panel empty"><h2>Can't reach your PC</h2><p>Check that Tailscale or the Wi-Fi is on and the PC is awake. This screen keeps trying.</p><button class="btn" id="retry" type="button">Try again</button></div>`
        : `<div class="panel empty"><h2>No usage data yet</h2><p>T3 Code hasn't reported any limits. Open it on your PC and this fills in.</p></div>`;
      return;
    }
    el.innerHTML = S.layout === "table" ? tableHTML(data.providers) : data.providers.map(panelHTML).join("");
    if (data.providers.some((p) => wins(p).some((w) => D.left(w) === 0))) unlock("dry");
  }

  // ---------- hero: phase, date, greeting, next refill ----------
  const PHASES = [[5, "dawn"], [7, "morning"], [12, "midday"], [14, "afternoon"], [17, "dusk"], [20, "evening"], [23, "night"]];
  const GREET = {
    "small hours": `Still up, ${NAME}? Dora is asleep.`, dawn: `Early start, ${NAME}.`, morning: `Good morning, ${NAME}.`,
    midday: "Midday. Stretch, drink some water.", afternoon: `Good afternoon, ${NAME}.`, dusk: "Golden hour. Dora is stretching.",
    evening: `Good evening, ${NAME}.`, night: "Late one. Dora is asleep.",
  };
  const phaseOf = (h) => { let p = "small hours"; for (const [from, name] of PHASES) if (h >= from) p = name; return p; };
  const dayOfYear = (d) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  function nextRefill() {
    let best = null;
    for (const p of data.providers) for (const w of wins(p)) {
      const ms = w.resetsAt ? new Date(w.resetsAt).getTime() - Date.now() : 0;
      if (ms > 0 && (!best || ms < best.ms)) best = { p, w, ms };
    }
    return best;
  }
  function renderHero(now) {
    const ph = phaseOf(now.getHours());
    $("#phase").textContent = ph;
    $("#date").textContent = `${now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · day ${dayOfYear(now)}`;
    $("#greet").textContent = GREET[ph];
    const nx = S.limits ? nextRefill() : null, tag = $("#nextTag");
    tag.hidden = !nx;
    if (nx) tag.textContent = `Refill in ${D.fmtDur(nx.ms)} · ${nx.p.name} ${D.shortLabel(nx.w)}`;
  }
  function renderTop() {
    const tag = $("#liveTag"), a = age();
    let kind = "plain", word = "Loading";
    if (data.offline) { kind = "bad"; word = "Offline"; }
    else if (data.loaded) { if (!data.ok || (a !== null && a > 15 * 60000)) { kind = "warn"; word = "Stale"; } else { kind = "ok"; word = "Live"; } }
    tag.className = `tag ${kind} dot`; tag.textContent = word;
    $("#upd").textContent = a === null ? "" : a < 60000 ? "Updated just now" : `Updated ${D.fmtDur(a)} ago`;
    $("#fableTag").hidden = S.fable;
  }
  // skipAccts: keep the existing panels so the limits toggle can transition them instead of rebuilding them
  function renderAll(now = new Date(), skipAccts = false) {
    $("#dash").dataset.layout = S.layout;
    renderTop(); if (!skipAccts) renderAccts(); renderHero(now);
  }

  // ---------- clock tick ----------
  let lastMin = -1;
  function tick(now) {
    face?.tick(now);
    const m = now.getMinutes();
    if (m !== lastMin) { lastMin = m; applyTheme(); renderAll(now); moments(now); }
  }
  const MOMENTS = {
    "11:11": ["Make a wish", "Dora already did.", "wish"], "00:00": ["A new day", "Midnight. The tanks keep their own time."],
    "12:00": ["Midday", "Stretch, drink water, charge the controller."], "23:00": ["Past eleven", "Dora is asleep. Bedtime is a good feature."],
  };
  let lastMoment = "";
  function moments(now) {
    const h = now.getHours(), k = `${pad(h)}:${pad(now.getMinutes())}`, mo = MOMENTS[k];
    if (mo && lastMoment !== now.toDateString() + k) {
      lastMoment = now.toDateString() + k;
      toast({ kind: "info", title: mo[0], msg: mo[1], key: "moment-" + k, ms: 6000 });
      if (mo[2]) unlock(mo[2]);
    }
    if (h >= 1 && h < 5) unlock("owl");
  }

  // ---------- easter eggs: Konami, nut rain, brand taps ----------
  const KONAMI = "U,U,D,D,L,R,L,R,B,A";
  let seq = [];
  function feed(t) {
    face?.input?.(t);
    seq.push(t); if (seq.length > 10) seq.shift();
    if (seq.join() === KONAMI) { seq = []; nutRain(); unlock("konami"); }
  }
  function nutRain() {
    if (reduced) return;
    const host = $("#rain");
    host.innerHTML = Array.from({ length: 34 }, () => {
      const x = Math.random() * 96, d = 2.2 + Math.random() * 2.2, w = Math.random() * 1.6, r = (Math.random() < .5 ? -1 : 1) * (90 + Math.random() * 180);
      return `<svg class="nut" viewBox="0 0 7 6" shape-rendering="crispEdges" style="left:${x}%;--d:${d}s;--w:${w}s;--r:${r}deg"><rect class="cap" x="1" y="0" width="5" height="1"/><rect class="cap" x="0" y="1" width="7" height="1"/><rect x="1" y="2" width="5" height="2"/><rect x="2" y="4" width="3" height="1"/><rect x="3" y="5" width="1" height="1"/></svg>`;
    }).join("");
    setTimeout(() => { host.innerHTML = ""; }, 6200);
  }
  let brandTaps = [];
  $("#brand").addEventListener("click", () => {
    const now = Date.now(); brandTaps = brandTaps.filter((t) => now - t < 3000); brandTaps.push(now);
    if (brandTaps.length >= 5) { brandTaps = []; toast({ title: "NutBot", msg: "Hello. I keep an eye on your tanks so you don't have to.", key: "nutbot", ms: 5200 }); unlock("nutbot"); }
  });
  $("#fableTag").addEventListener("click", () => change({ fable: true }));
  $("#btnLimits").addEventListener("click", () => change({ limits: !S.limits }));
  $("#btnFace").addEventListener("click", nextFace);
  document.addEventListener("click", (e) => { if (e.target.closest("#retry")) ctl.refresh(); });

  // ---------- settings drawer ----------
  const drawerOpen = () => !$("#drawer").hidden;
  let lastFocus = null;
  function openDrawer(scrollEnd) {
    lastFocus = document.activeElement;
    $("#drawer").hidden = false; $("#dBg").hidden = false;
    renderDrawer();
    if (scrollEnd) { const b = $("#drawer .db"); b.scrollTop = b.scrollHeight; }
    setTimeout(() => $("#dClose")?.focus(), 40);
  }
  function closeDrawer() { $("#drawer").hidden = true; $("#dBg").hidden = true; lastFocus?.focus?.(); }
  const toggleDrawer = () => (drawerOpen() ? closeDrawer() : openDrawer());
  $("#btnSettings").addEventListener("click", () => openDrawer());
  $("#dBg").addEventListener("click", closeDrawer);

  const seg = (key, val, label) => `<button type="button" role="radio" aria-checked="${String(S[key]) === String(val)}" class="${String(S[key]) === String(val) ? "on" : ""}" data-set="${key}" data-val="${val}">${label}</button>`;
  const opt = (key, label, hint) => `<button type="button" class="opt" role="checkbox" aria-checked="${!!S[key]}" data-opt="${key}"><span class="cb">${IC.check}</span><span class="ot">${label}</span>${hint ? `<span class="oc">${hint}</span>` : ""}</button>`;
  const faceOpt = (f) => `<button type="button" class="opt" role="radio" aria-checked="${S.face === f.id}" data-face="${f.id}"><span class="tick">${IC.check}</span><span class="ot">${esc(f.name)}</span><span class="oc">${esc(f.hint)}</span></button>`;
  function renderDrawer() {
    const d = $("#drawer"), prev = $(".db", d)?.scrollTop || 0;
    const pals = PALETTES[S.style], cur = pals.find((p) => p[0] === S.palette) || pals[0];
    const keys = [["S", "Settings"], ["G", "Show or hide limits"], ["C", "Next clock face"], ["F", "Show or hide Fable"], ["T", "Auto, day or night"], ["P", "Next colour"], ["Y", "Next style"], ["L", "Panels or table"], ["Esc", "Close"]];
    d.innerHTML = `<div class="dh"><div class="sp1"><h2>Settings</h2><span class="sub">Saved on this device</span></div><button class="icon-btn" id="dClose" type="button" aria-label="Close settings">${IC.x}</button></div>
      <div class="db">
        <div class="dsec"><span class="eyebrow">Clock face</span><div class="opts" role="radiogroup" aria-label="Clock face">${FACES.map(faceOpt).join("")}</div></div>
        <div class="dsec"><span class="eyebrow">Style</span><div class="seg wide" role="radiogroup" aria-label="Style">${Object.keys(STYLE_NAMES).map((k) => seg("style", k, STYLE_NAMES[k])).join("")}</div></div>
        <div class="dsec"><span class="eyebrow">Colour</span><div class="pals" role="group" aria-label="Colour">${pals.map((p) => `<button type="button" data-pal="${p[0]}" style="--c:${p[2]}" aria-pressed="${S.palette === p[0]}" aria-label="${esc(p[1])}" title="${esc(p[1])}"></button>`).join("")}</div><div class="palname">${esc(cur[1])}</div></div>
        <div class="dsec"><span class="eyebrow">Day and night</span><div class="seg wide" role="radiogroup" aria-label="Day and night">${seg("theme", "auto", "Auto")}${seg("theme", "day", "Day")}${seg("theme", "night", "Night")}</div><p class="hint">Auto follows the clock: day from 6:00, night from 18:00.</p></div>
        <div class="dsec"><span class="eyebrow">Limits</span><div class="opts">${opt("limits", "Show limits", "animates in and out")}${opt("fable", "Fable limit", "Claude weekly")}</div><div class="seg wide" role="radiogroup" aria-label="Layout" style="margin-top:8px">${seg("layout", "panels", "Panels")}${seg("layout", "table", "Table")}</div></div>
        <div class="dsec"><span class="eyebrow">Clock</span><div class="opts">${opt("h24", "24-hour clock")}${opt("seconds", "Show seconds", "or tap the clock")}${opt("sound", "Flip clicks", "sound on the Flip face")}</div></div>
        <div class="dsec"><span class="eyebrow">Display</span><div class="opts">${opt("dim", "Dim at night", "23:00 to 6:00")}${opt("wake", "Keep the screen awake", "needs HTTPS")}</div></div>
        <div class="dsec"><span class="eyebrow">Secrets · ${Object.keys(S.found).length} of ${Object.keys(SECRETS).length}</span><div class="secrets">${Object.keys(SECRETS).map((k) => S.found[k] ? `<span class="tag ok">${esc(SECRETS[k])}</span>` : `<span class="tag plain">???</span>`).join("")}</div><p class="hint">Every clock face hides something. Poke around.</p></div>
        <div class="dsec"><span class="eyebrow">Shortcuts</span><div class="keys">${keys.map(([k, t]) => `<span><kbd>${k}</kbd></span><span>${t}</span>`).join("")}</div></div>
      </div>
      <div class="df"><button class="btn danger-o grow" id="dReset" type="button">Reset settings</button><button class="btn primary" id="dDone" type="button">Done</button></div>`;
    $(".db", d).scrollTop = prev;
  }
  $("#drawer").addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.set) { const v = t.dataset.val; change({ [t.dataset.set]: v === "true" ? true : v === "false" ? false : v }); }
    else if (t.dataset.pal !== undefined) change({ palette: t.dataset.pal });
    else if (t.dataset.face) change({ face: t.dataset.face });
    else if (t.dataset.opt) change({ [t.dataset.opt]: !S[t.dataset.opt] });
    else if (t.id === "dClose" || t.id === "dDone") closeDrawer();
    else if (t.id === "dReset") {
      const snap = JSON.parse(JSON.stringify(S)), keep = { found: S.found, tried: S.tried, bootDay: S.bootDay, nuts: S.nuts, deaths: S.deaths, flips: S.flips, dashBest: S.dashBest };
      Object.assign(S, JSON.parse(JSON.stringify(NM.DEFAULTS)), keep);
      change({ face: S.face, limits: S.limits, fable: S.fable, layout: S.layout });
      toast({ title: "Settings reset", msg: "Your secrets and nuts are kept.", key: "reset", ms: 7000, action: { label: "Undo", fn: () => { Object.assign(S, snap); change({ face: S.face, limits: S.limits, fable: S.fable, layout: S.layout }); } } });
    }
  });
  $("#drawer").addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = [...$("#drawer").querySelectorAll("button")].filter((b) => !b.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ---------- input: keyboard, touch, gamepad ----------
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea")) return;
    const arrows = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R" }, k = e.key, lk = k.toLowerCase();
    if (arrows[k]) return feed(arrows[k]);
    if (k === " ") { if (!drawerOpen()) { face?.input?.("J"); e.preventDefault(); } return; }
    if (lk === "b" || lk === "a") return feed(lk.toUpperCase());
    if (k === "Escape") closeDrawer();
    else if (lk === "s") toggleDrawer();
    else if (lk === "g") change({ limits: !S.limits });
    else if (lk === "c") nextFace();
    else if (lk === "f") change({ fable: !S.fable });
    else if (lk === "t") cycleTheme();
    else if (lk === "p") nextPalette();
    else if (lk === "y") nextStyle();
    else if (lk === "l") change({ layout: S.layout === "panels" ? "table" : "panels" });
    else if (k === "?") openDrawer(true);
  });
  // Swipes are the d-pad; a tap on the left half is B, on the right half is A. Faces keep their own taps and drags.
  let down = null;
  addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: Date.now(), target: e.target }; });
  addEventListener("pointerup", (e) => {
    if (!down || drawerOpen()) { down = null; return; }
    const dx = e.clientX - down.x, dy = e.clientY - down.y, ax = Math.abs(dx), ay = Math.abs(dy), quick = Date.now() - down.t < 300;
    const inFace = down.target.closest?.(".facebox"), inSky = down.target.closest?.(".sky-svg");
    if (Math.max(ax, ay) > 48) { if (!inSky) feed(ax > ay ? (dx > 0 ? "R" : "L") : (dy > 0 ? "D" : "U")); }
    else if (quick && !inFace && !down.target.closest("button, a")) feed(e.clientX < innerWidth / 2 ? "B" : "A");
    down = null;
  });
  // Controller: d-pad, B, A feed the code; Y fable, X colour, bumpers style, triggers face, Back limits, Start settings.
  let pad0 = {}, padLoop = 0;
  function padPoll() {
    const gp = [...(navigator.getGamepads?.() || [])].find(Boolean);
    if (gp) {
      const edge = (i) => { const on = !!gp.buttons[i]?.pressed, was = pad0[i]; pad0[i] = on; return on && !was; };
      if (edge(12)) feed("U"); if (edge(13)) feed("D"); if (edge(14)) feed("L"); if (edge(15)) feed("R");
      if (edge(1)) feed("B"); if (edge(0)) feed("A");
      if (edge(3)) change({ fable: !S.fable });
      if (edge(2)) nextPalette();
      if (edge(4)) nextStyle(-1);
      if (edge(5)) nextStyle(1);
      if (edge(6) || edge(7)) nextFace();
      if (edge(8)) change({ limits: !S.limits });
      if (edge(9)) toggleDrawer();
    }
    padLoop = requestAnimationFrame(padPoll);
  }
  addEventListener("gamepadconnected", () => { toast({ title: "Controller connected", msg: "Y Fable · X colour · bumpers style · triggers face · Back limits · Start settings", key: "pad", ms: 6000 }); if (!padLoop) padPoll(); });
  addEventListener("gamepaddisconnected", () => { cancelAnimationFrame(padLoop); padLoop = 0; });

  // ---------- boot moment: once a day ----------
  function boot(force) {
    const today = new Date().toDateString();
    if ((!force && S.bootDay === today) || reduced) return;
    S.bootDay = today; NM.save();
    const el = $("#boot");
    el.innerHTML = `<div class="boot-in"><img src="/avn/icons/avn-nutmeter.svg" alt="" width="64" height="64" style="image-rendering:pixelated;border-radius:8px"><div class="boot-t">AVN Nutmeter</div><div class="boot-s">quota companion</div></div>`;
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 1900);
  }

  // ---------- go ----------
  applyLook();
  applyLimits();
  boot();
  mountFace();
  if (location.hash === "#settings") setTimeout(() => openDrawer(), 60);
  const ctl = D.start({
    tick,
    wake: () => S.wake,
    render: (d) => { data = d; renderAll(); },
  });
})();
