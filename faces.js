// AVN Nutmeter clock faces. Each face is a factory: create(ctx) -> { mount(box), tick(now), destroy(), input?(token) }.
// Faces draw only with the active AVN style's contract roles, so they work in every style, palette and theme.
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const INK = "light-dark(#1f1a17, #0b0908)";
  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap12 = (d) => ((((d + 12) % 24) + 24) % 24) - 12;

  function mk(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function rect(parent, x, y, w, h, fill, cls) {
    const r = mk("rect", { x, y, width: w, height: h }, parent);
    r.style.fill = fill;
    if (cls) r.setAttribute("class", cls);
    return r;
  }
  function sprite(parent, map, colors, x0, y0, cls) {
    const g = mk("g", cls ? { class: cls } : {}, parent);
    map.forEach((row, y) => [...row].forEach((ch, x) => { if (colors[ch]) rect(g, x0 + x, y0 + y, 1, 1, colors[ch]); }));
    return g;
  }
  // 12 or 24 hour pieces of a Date
  function parts(S, d) {
    const h = d.getHours();
    return { hh: S.h24 ? pad(h) : String(h % 12 || 12), mm: pad(d.getMinutes()), ss: pad(d.getSeconds()), ap: S.h24 ? "" : h < 12 ? "AM" : "PM" };
  }

  const FACES = [];
  const face = (id, name, hint, create) => FACES.push({ id, name, hint, create });

  // Dora's head, drawn facing left (the loaf on the monitor); reversed for the runner.
  const DORA = ["..a...a.......", "..aa.aa.......", ".aaaaaaa......", ".a-aa-aaaaaaa.", ".aaapaaaaaaaaa", "..aaaaaaaaaaaa", "...aaaaaaaaaaa"];
  const DORA_R = DORA.map((r) => [...r].reverse().join(""));

  // ================================================================ Dora
  face("dora", "Dora", "the cat on the monitor", (ctx) => {
    const { S } = ctx;
    let clockEl, svg, last = "", hideUntil = 0, wakeUntil = 0, stamps = [], pets = 0;
    const timers = [];
    const state = () => {
      const now = Date.now();
      if (now < hideUntil) return "gone";
      const h = new Date().getHours();
      return (h >= 23 || h < 7) && now >= wakeUntil ? "asleep" : "awake";
    };
    function draw() {
      const st = state();
      if (st === last) return;
      last = st; svg.innerHTML = "";
      rect(svg, 6, 12, 28, 12, "var(--line-strong)"); rect(svg, 7, 13, 26, 10, "var(--nested)");
      rect(svg, 9, 15, 9, 1, "var(--line)"); rect(svg, 9, 17, 13, 1, "var(--line)"); rect(svg, 9, 19, 6, 1, "var(--line)");
      rect(svg, 16, 19, 2, 1, "var(--accent)", "blink");
      rect(svg, 17, 24, 6, 1, "var(--line-strong)"); rect(svg, 14, 25, 12, 1, "var(--line-strong)");
      if (st === "gone") return;
      [[-1, 0], [1, 0], [0, -1]].forEach(([dx, dy]) => sprite(svg, DORA, { a: "var(--line-strong)", "-": "var(--line-strong)", p: "var(--line-strong)" }, 13 + dx, 5 + dy, "breathe"));
      sprite(svg, DORA, { a: INK, "-": st === "awake" ? "var(--warn)" : "var(--line-strong)", p: "#E89AA6" }, 13, 5, "breathe");
      rect(svg, 25, 12, 1, 4, "var(--line-strong)"); rect(svg, 26, 12, 1, 3, INK); rect(svg, 27, 14, 1, 1, INK);
      if (st === "asleep") {
        sprite(svg, ["aaa", ".a.", "aaa"], { a: "var(--muted)" }, 9, 1, "zz");
        sprite(svg, ["aa", "aa"], { a: "var(--dim)" }, 6, 4, "zz zz2");
      }
      svg.setAttribute("aria-label", st === "asleep" ? "Dora, a black cat, asleep on the monitor" : "Dora, a black cat, awake on the monitor");
    }
    function poke(e) {
      e.stopPropagation();
      const st = state(), now = Date.now();
      if (st === "gone") return;
      if (st === "asleep") {
        wakeUntil = now + 5000; last = ""; draw();
        timers.push(setTimeout(() => { last = ""; draw(); }, 5100));
        ctx.toast({ title: "Dora opens one eye", key: "dora-eye", ms: 2200 });
        return;
      }
      stamps = stamps.filter((t) => now - t < 6000); stamps.push(now); pets++;
      if (stamps.length >= 8) {
        hideUntil = now + 15000; stamps = []; last = ""; draw(); ctx.unlock("shy");
        ctx.toast({ title: "Dora left the screen", msg: "Too many pets. She'll be back.", key: "dora-gone", ms: 4200 });
        timers.push(setTimeout(() => { last = ""; draw(); }, 15100));
        return;
      }
      ctx.toast({ title: "Prrr…", key: "purr", ms: 1800 });
      if (pets >= 3) ctx.unlock("pet");
    }
    return {
      mount(box) {
        box.innerHTML = `<div class="lcd screen dora-face"><div class="clock" role="timer"></div><svg class="scene" viewBox="0 0 40 27" shape-rendering="crispEdges" role="img" aria-label="Dora, a black cat"></svg></div>`;
        clockEl = box.querySelector(".clock"); svg = box.querySelector(".scene");
        clockEl.addEventListener("click", () => ctx.change({ seconds: !S.seconds }));
        svg.addEventListener("click", poke);
      },
      tick(now) {
        const p = parts(S, now);
        clockEl.innerHTML = `<span class="hm">${p.hh}:${p.mm}</span>${S.seconds ? `<span class="ss">:${p.ss}</span>` : ""}${p.ap ? `<span class="ap">${p.ap}</span>` : ""}`;
        draw();
      },
      destroy() { timers.forEach(clearTimeout); },
    };
  });

  // ================================================================ Flip
  face("flip", "Flip", "tap the cards", (ctx) => {
    const { S } = ctx;
    let box, row, meta, apEl, hintEl, sGroup = null, sColon = null;
    let cards = [], playUntil = 0;
    const timers = [];
    const COMBOS = { 1337: ["Leet", "Dora is unimpressed."], 1111: ["Make a wish", "Dora already did."], 0: ["Midnight, but cheaper", "Nothing happens at 0000."] };

    const makeCard = () => {
      const c = document.createElement("div");
      c.className = "fcard"; c.dataset.v = "0";
      c.innerHTML = `<div class="fu"><span>0</span></div><div class="fl"><span>0</span></div><div class="ffu"><span>0</span></div><div class="ffl"><span>0</span></div>`;
      return c;
    };
    const spans = (c) => ({ fu: c.querySelector(".fu span"), fl: c.querySelector(".fl span"), ffu: c.querySelector(".ffu span"), ffl: c.querySelector(".ffl span") });
    // Upper static = new digit, lower static = old digit until the flap lands. The flap carries old-upper down, then new-lower.
    function set(c, v, anim) {
      v = String(v);
      const cur = c.dataset.v;
      if (cur === v) return;
      clearTimeout(c._t); c.classList.remove("flipping");
      const s = spans(c);
      if (!anim || ctx.reduced) { for (const k in s) s[k].textContent = v; c.dataset.v = v; return; }
      s.fu.textContent = v; s.fl.textContent = cur; s.ffu.textContent = cur; s.ffl.textContent = v;
      void c.offsetWidth;
      c.classList.add("flipping"); c.dataset.v = v;
      c._t = setTimeout(() => { s.fl.textContent = v; s.ffu.textContent = v; c.classList.remove("flipping"); }, 640);
    }
    const group = () => { const g = document.createElement("div"); g.className = "fg"; g.append(makeCard(), makeCard()); return g; };
    const colon = () => { const c = document.createElement("div"); c.className = "fcolon"; c.title = "Seconds"; c.innerHTML = "<i></i><i></i>"; return c; };

    function ensureSeconds() {
      if (S.seconds && !sGroup) {
        sColon = colon(); sGroup = group(); row.append(sColon, sGroup);
        cards.push(...sGroup.querySelectorAll(".fcard"));
        row.parentNode.dataset.s = "1";
      } else if (!S.seconds && sGroup) {
        sColon.remove(); sGroup.remove(); sColon = sGroup = null;
        cards = cards.slice(0, 4); row.parentNode.dataset.s = "0";
      }
    }
    function digits(now) { const p = parts(S, now); return { str: p.hh.padStart(2, "0") + p.mm + (sGroup ? p.ss : ""), ap: p.ap }; }
    function sync(now, anim, stagger) {
      const { str, ap } = digits(now);
      apEl.textContent = ap;
      cards.forEach((c, i) => {
        if (stagger) timers.push(setTimeout(() => set(c, str[i], true), i * 140));
        else set(c, str[i], anim);
      });
    }
    function tap(e) {
      if (e.target.closest(".fcolon")) { ctx.change({ seconds: !S.seconds }); return; }
      const c = e.target.closest(".fcard"); if (!c) return;
      playUntil = Date.now() + 12000;
      hintEl.hidden = false; hintEl.textContent = "Free flip · real time in 12s";
      set(c, (Number(c.dataset.v) + 1) % 10, true);
      ctx.click();
      S.flips = (S.flips || 0) + 1; ctx.save();
      if (S.flips >= 100) ctx.unlock("flipper");
      const read = cards.slice(0, 4).map((x) => x.dataset.v).join("");
      if (read === "2469") { ctx.unlock("gamertag"); ctx.toast({ kind: "ok", title: "nutmag2469", msg: "That's the gamer tag.", key: "tag", ms: 4200 }); }
      else if (COMBOS[Number(read)]) ctx.toast({ title: COMBOS[Number(read)][0], msg: COMBOS[Number(read)][1], key: "combo-" + read, ms: 3200 });
    }
    return {
      mount(el) {
        box = el;
        box.innerHTML = `<div class="flipclock" data-s="0" role="timer"><div class="frow"></div><div class="fmeta"><span class="fap"></span><span class="tag plain fhint" hidden></span></div></div>`;
        row = box.querySelector(".frow"); apEl = box.querySelector(".fap"); hintEl = box.querySelector(".fhint");
        const h = group(), m = group();
        row.append(h, colon(), m);
        cards = [...h.querySelectorAll(".fcard"), ...m.querySelectorAll(".fcard")];
        row.addEventListener("click", tap);
        ensureSeconds();
        sync(new Date(), false);
      },
      tick(now) {
        ensureSeconds();
        if (playUntil) {
          const left = playUntil - now.getTime();
          if (left > 0) { hintEl.hidden = false; hintEl.textContent = `Free flip · real time in ${Math.ceil(left / 1000)}s`; return; }
          playUntil = 0; hintEl.hidden = true; sync(now, true, true); return;
        }
        sync(now, true);
      },
      destroy() { timers.forEach(clearTimeout); cards.forEach((c) => clearTimeout(c._t)); },
    };
  });

  // ================================================================ Sky
  face("sky", "Sky", "drag the sky", (ctx) => {
    const { S } = ctx;
    let svg, timeEl, tagEl, skyR, glow, sunG, moonG, sun2G, starsG, wins = [];
    let scrub = null, drag = null, ret = 0, tween = 0, travel = 0, sunTaps = [], starTaps = 0, twoSuns = false;
    const timers = [];
    const nowH = (d = new Date()) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    const SUN = [".aaa.", "aaaaa", "aaaaa", "aaaaa", ".aaa."], MOON = [".aaa.", "aa...", "aa...", "aa...", ".aaa."];
    const CAT = ["a.a...", "aaaa..", "aaaaaa", ".a..a."];

    function build() {
      svg.innerHTML = "";
      skyR = rect(svg, 0, 0, 64, 32, "var(--nested)");
      glow = rect(svg, 0, 12, 64, 16, "var(--warn)"); glow.style.opacity = 0;
      starsG = mk("g", {}, svg);
      [[5, 3], [11, 8], [17, 2], [23, 6], [29, 3], [36, 9], [42, 2], [48, 7], [54, 4], [60, 9], [8, 12], [33, 13], [51, 12], [20, 11]].forEach(([x, y], i) => {
        rect(starsG, x, y, 1, 1, "var(--text)", "st").style.setProperty("--d", `${(i * 0.37) % 2.6}s`);
      });
      sunG = mk("g", { class: "sun" }, svg); sprite(sunG, SUN, { a: "var(--hl-gold)" }, 0, 0); rect(sunG, -2, -2, 9, 9, "transparent", "hit").style.pointerEvents = "all";
      sun2G = mk("g", { class: "sun" }, svg); sprite(sun2G, ["aa", "aa"], { a: "var(--warn)" }, 0, 0); sun2G.style.display = "none";
      moonG = mk("g", { class: "moon" }, svg); sprite(moonG, MOON, { a: "var(--text)" }, 0, 0); rect(moonG, -2, -2, 9, 9, "transparent", "hit").style.pointerEvents = "all";
      rect(svg, 0, 26, 64, 6, "color-mix(in srgb, var(--bg) 55%, var(--line-strong))");
      [[2, 20, 6, 6], [9, 17, 5, 9], [15, 22, 7, 4], [24, 19, 6, 7], [32, 15, 6, 11], [40, 21, 5, 5], [47, 18, 7, 8], [56, 22, 6, 4]].forEach(([x, y, w, h]) => {
        rect(svg, x, y, w, h, "color-mix(in srgb, var(--bg) 72%, var(--line-strong))");
        for (let wy = y + 1; wy < y + h - 1; wy += 2) for (let wx = x + 1; wx < x + w - 1; wx += 2) if ((wx * 7 + wy * 3) % 5 < 3) wins.push(rect(svg, wx, wy, 1, 1, "var(--warn)"));
      });
      const cat = sprite(svg, CAT, { a: INK }, 33, 11); rect(cat, 1, 1, 1, 1, "var(--warn)");
      cat.setAttribute("class", "skycat");
    }
    function place(g, p, off = 0) {
      if (p < 0 || p > 1) { g.style.display = "none"; return; }
      g.style.display = "";
      g.setAttribute("transform", `translate(${4 + p * 56 - 2.5 + off} ${25 - Math.sin(Math.PI * p) * 19 - 2.5 + off * 0.4})`);
    }
    function draw(h) {
      const raw = Math.sin((Math.PI * (h - 6)) / 12);
      const lum = clamp((raw + 0.2) / 0.7, 0, 1), glowAmt = clamp(1 - Math.abs(raw) / 0.4, 0, 1);
      skyR.style.fill = `color-mix(in srgb, var(--info) ${Math.round(lum * 50)}%, var(--nested))`;
      glow.style.opacity = glowAmt * 0.45;
      starsG.style.opacity = clamp(1 - lum * 1.8, 0, 1);
      wins.forEach((w) => (w.style.opacity = clamp(1 - lum * 1.4, 0, 1) * 0.9));
      const sp = (h - 6) / 12;
      place(sunG, sp); place(moonG, ((((h - 18) % 24) + 24) % 24) / 12);
      if (twoSuns) place(sun2G, sp, 7); else sun2G.style.display = "none";
      const hh = Math.floor(h) % 24, mm = Math.floor((h - Math.floor(h)) * 60);
      const t = S.h24 ? `${pad(hh)}:${pad(mm)}` : `${hh % 12 || 12}:${pad(mm)} ${hh < 12 ? "AM" : "PM"}`;
      timeEl.textContent = t;
    }
    function home() {
      clearTimeout(ret);
      const from = scrub, to = nowH(), delta = wrap12(to - from), t0 = performance.now();
      if (ctx.reduced) { scrub = null; tagEl.hidden = true; draw(nowH()); return; }
      const step = (t) => {
        const k = clamp((t - t0) / 900, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        scrub = (((from + delta * e) % 24) + 24) % 24; draw(scrub);
        if (k < 1) tween = requestAnimationFrame(step); else { scrub = null; tagEl.hidden = true; draw(nowH()); }
      };
      tween = requestAnimationFrame(step);
    }
    function tap(el) {
      const sun = el?.closest?.(".sun"), moon = el?.closest?.(".moon"), star = el?.closest?.(".st");
      if (sun) {
        const now = Date.now(); sunTaps = sunTaps.filter((t) => now - t < 3000); sunTaps.push(now);
        if (sunTaps.length >= 3 && !twoSuns) { twoSuns = true; draw(scrub ?? nowH()); ctx.unlock("twosuns"); ctx.toast({ title: "Two suns", msg: "One of them is somewhere far away.", key: "suns", ms: 4000 }); }
        else if (sunTaps.length === 1) ctx.toast({ title: "Don't stare at the sun", key: "sun", ms: 1800 });
      } else if (moon) ctx.toast({ title: "Dora is watching the moon", key: "moon", ms: 2200 });
      else if (star) {
        const c = rect(svg, Number(star.getAttribute("x")), Number(star.getAttribute("y")), 3, 1, "var(--text)", "comet");
        timers.push(setTimeout(() => c.remove(), 1200));
        ctx.toast({ title: "Make a wish", key: "wish-star", ms: 1800 });
        if (++starTaps >= 5) ctx.unlock("stargazer");
      }
    }
    return {
      mount(box) {
        box.innerHTML = `<div class="skyface"><svg class="sky-svg" viewBox="0 0 64 32" shape-rendering="crispEdges" role="img" aria-label="A pixel sky that follows the time of day. Drag sideways to look at another time."></svg><div class="sky-time" role="timer"></div><span class="tag info sky-tag" hidden>Time machine · let go to return</span></div>`;
        svg = box.querySelector(".sky-svg"); timeEl = box.querySelector(".sky-time"); tagEl = box.querySelector(".sky-tag");
        build(); draw(nowH());
        svg.addEventListener("pointerdown", (e) => {
          clearTimeout(ret); cancelAnimationFrame(tween);
          drag = { x: e.clientX, h0: scrub ?? nowH(), moved: 0, w: svg.getBoundingClientRect().width, prev: scrub ?? nowH() };
          svg.setPointerCapture(e.pointerId);
        });
        svg.addEventListener("pointermove", (e) => {
          if (!drag) return;
          const dx = e.clientX - drag.x; drag.moved = Math.max(drag.moved, Math.abs(dx));
          if (drag.moved < 4) return;
          scrub = (((drag.h0 + (dx / drag.w) * 12) % 24) + 24) % 24;
          travel += Math.abs(wrap12(scrub - drag.prev)); drag.prev = scrub;
          tagEl.hidden = false; draw(scrub);
          if (travel >= 24) ctx.unlock("timetravel");
        });
        svg.addEventListener("pointerup", (e) => {
          const d = drag; drag = null; if (!d) return;
          if (d.moved < 4) { tap(document.elementFromPoint(e.clientX, e.clientY)); return; }
          ret = setTimeout(home, 2200);
        });
        svg.addEventListener("pointercancel", () => { drag = null; if (scrub !== null) ret = setTimeout(home, 800); });
      },
      tick(now) { if (scrub === null && !drag) draw(nowH(now)); },
      destroy() { clearTimeout(ret); cancelAnimationFrame(tween); timers.forEach(clearTimeout); },
    };
  });

  // ================================================================ Dash
  face("dash", "Dash", "tap to jump", (ctx) => {
    const { S } = ctx;
    const W = 96, GROUND = 32, DX = 14, G = 230, JUMP = 112, HB = { x0: 3, x1: 12, h: 8 };
    let svg, timeEl, hudEl, world, doraG, legsA, legsB, groundG, root;
    let raf = 0, last = 0, mode = "auto", y = 0, vy = 0, dist = 0, score = 0, runNuts = 0, nextSpawn = 60, legT = 0, deadAt = 0, saveT = 0;
    let obstacles = [], nuts = [];
    const nowStr = (d) => { const p = parts(S, d); return `${p.hh}:${p.mm}${S.seconds ? ":" + p.ss : ""}${p.ap ? " " + p.ap : ""}`; };

    function build() {
      svg.innerHTML = "";
      rect(svg, 0, 0, W, 40, "var(--nested)");
      [[6, 5], [19, 11], [33, 4], [47, 9], [61, 3], [75, 10], [88, 5]].forEach(([x, yy]) => rect(svg, x, yy, 1, 1, "var(--line-strong)"));
      world = mk("g", {}, svg);
      groundG = mk("g", {}, svg);
      rect(groundG, 0, GROUND, W + 14, 8, "var(--line-strong)"); rect(groundG, 0, GROUND, W + 14, 1, "var(--muted)");
      for (let x = 0; x < W + 14; x += 12) rect(groundG, x, GROUND + 3, 4, 1, "var(--line)", "gt");
      doraG = mk("g", {}, svg);
      [[-1, 0], [1, 0], [0, -1]].forEach(([dx, dy]) => sprite(doraG, DORA_R, { a: "var(--line-strong)", "-": "var(--line-strong)", p: "var(--line-strong)" }, dx, dy));
      sprite(doraG, DORA_R, { a: INK, "-": "var(--warn)", p: "#E89AA6" }, 0, 0);
      legsA = mk("g", {}, doraG); rect(legsA, 3, 7, 2, 2, INK); rect(legsA, 9, 7, 2, 2, INK);
      legsB = mk("g", {}, doraG); rect(legsB, 5, 7, 2, 2, INK); rect(legsB, 7, 7, 2, 2, INK); legsB.style.display = "none";
    }
    function hud() {
      const tags = [`<span class="tag plain mono">nuts ${S.nuts || 0}</span>`];
      if (ctx.reduced) tags.push(`<span class="tag plain">Motion is reduced</span>`);
      else if (mode === "auto") tags.push(`<span class="tag info">Tap to play</span>`);
      else if (mode === "play") tags.push(`<span class="tag ok mono">score ${score}</span>`, `<span class="tag plain mono">best ${S.dashBest || 0}</span>`);
      else tags.push(`<span class="tag bad">Oof</span>`, `<span class="tag plain mono">score ${score}</span>`, `<span class="tag plain">Tap to run again</span>`);
      hudEl.innerHTML = tags.join("");
    }
    function startRun() {
      [...obstacles, ...nuts].forEach((o) => o.el.remove());
      obstacles = []; nuts = []; mode = "play"; dist = 0; score = 0; runNuts = 0; nextSpawn = 70; y = 0; vy = 0;
      doraG.removeAttribute("class"); hud();
    }
    function goAuto() {
      [...obstacles, ...nuts].forEach((o) => o.el.remove());
      obstacles = []; nuts = []; mode = "auto"; nextSpawn = 50; y = 0; vy = 0; hud();
    }
    function die() {
      mode = "dead"; deadAt = Date.now(); doraG.setAttribute("class", "dead");
      S.deaths = (S.deaths || 0) + 1;
      if (score > (S.dashBest || 0)) S.dashBest = score;
      if (score >= 100) ctx.unlock("run");
      if (S.deaths >= 9) ctx.unlock("lives");
      ctx.save(); hud();
    }
    function userJump() {
      if (ctx.reduced) return;
      if (mode === "dead") { if (Date.now() - deadAt > 450) startRun(); return; }
      if (mode === "auto") startRun();
      if (y === 0) vy = JUMP;
    }
    function spawn() {
      const k = Math.random() < 0.5 ? 1 : Math.random() < 0.7 ? 2 : 3, x = W + 6;
      const g = mk("g", {}, world);
      for (let i = 0; i < k; i++) { rect(g, 0, -(i + 1) * 6, 6, 6, "var(--line-strong)"); rect(g, 1, -(i + 1) * 6 + 1, 4, 1, "var(--muted)"); }
      obstacles.push({ x, h: k * 6, el: g });
      if (Math.random() < 0.8) {
        // floating at jump-apex height right above the block, so a well-timed hop picks it up
        const n = mk("g", {}, world); sprite(n, [".aaa.", "aaaaa", "aaaaa", ".aaa."], { a: "var(--accent)" }, 0, 0);
        nuts.push({ x: x + 0.5, y: 24, el: n });
      }
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      if (mode === "dead") { if (Date.now() - deadAt > 15000) goAuto(); render(); return; }
      const sp = mode === "play" ? 38 + Math.min(score / 8, 30) : 34;
      dist += sp * dt;
      nextSpawn -= sp * dt; if (nextSpawn <= 0) { spawn(); nextSpawn = 52 + Math.random() * 40 + sp * 0.6; }
      obstacles.forEach((o) => (o.x -= sp * dt)); nuts.forEach((n) => (n.x -= sp * dt));
      obstacles = obstacles.filter((o) => (o.x > -10 ? true : (o.el.remove(), false)));
      nuts = nuts.filter((n) => (n.x > -10 ? true : (n.el.remove(), false)));
      if (y > 0 || vy > 0) { vy -= G * dt; y += vy * dt; if (y <= 0) { y = 0; vy = 0; } }
      const bx0 = DX + HB.x0, bx1 = DX + HB.x1, bottom = GROUND - y, top = bottom - HB.h;
      if (mode === "auto" && y === 0) {
        const o = obstacles.find((q) => q.x > bx1 - 1);
        if (o && o.x - bx1 < sp * 0.27 && o.x - bx1 > 0) vy = JUMP;
      }
      if (mode === "play") {
        score = Math.floor(dist / 6);
        for (const o of obstacles) if (bx1 > o.x + 0.5 && bx0 < o.x + 5.5 && bottom > GROUND - o.h + 1) { die(); break; }
      }
      nuts = nuts.filter((n) => {
        const ny = GROUND - n.y - 5;
        if (bx1 > n.x && bx0 < n.x + 5 && bottom > ny && top < ny + 5) {
          n.el.remove(); S.nuts = (S.nuts || 0) + 1; runNuts++;
          if (S.nuts >= 2469) ctx.unlock("stash");
          clearTimeout(saveT); saveT = setTimeout(ctx.save, 800); hud(); return false;
        }
        return true;
      });
      legT += dt; render();
    }
    function render() {
      const dead = mode === "dead";
      doraG.setAttribute("transform", dead ? `translate(${DX} ${GROUND - 3}) rotate(-90 7 3)` : `translate(${DX} ${GROUND - 9 - y})`);
      const flip = Math.floor(legT / 0.11) % 2 === 0 || y > 0;
      legsA.style.display = flip ? "" : "none"; legsB.style.display = flip ? "none" : "";
      obstacles.forEach((o) => o.el.setAttribute("transform", `translate(${o.x} ${GROUND})`));
      nuts.forEach((n) => n.el.setAttribute("transform", `translate(${n.x} ${GROUND - n.y - 5})`));
      groundG.setAttribute("transform", `translate(${-(dist % 12)} 0)`);
    }
    return {
      mount(el) {
        root = el;
        el.innerHTML = `<div class="dashface"><div class="dtime" role="timer"></div><svg class="dscene" viewBox="0 0 96 40" shape-rendering="crispEdges" role="img" aria-label="Dora the cat runs along a row of blocks. Tap to jump."></svg><div class="dhud"></div></div>`;
        svg = el.querySelector(".dscene"); timeEl = el.querySelector(".dtime"); hudEl = el.querySelector(".dhud");
        build(); render(); hud();
        el.querySelector(".dashface").addEventListener("pointerdown", userJump);
        if (!ctx.reduced) raf = requestAnimationFrame(frame);
      },
      tick(now) { timeEl.textContent = nowStr(now); },
      input(tok) { if (tok === "U" || tok === "A" || tok === "J") userJump(); },
      destroy() { cancelAnimationFrame(raf); clearTimeout(saveT); },
    };
  });

  // ================================================================ Terminal
  face("term", "Terminal", "type commands", (ctx) => {
    const { S } = ctx;
    let logEl, inEl, timeEl, hist = [], hi = -1;
    const lines = [];
    const born = performance.now();
    const print = (text, cls = "") => { String(text).split("\n").forEach((t) => lines.push({ t, cls })); if (lines.length > 80) lines.splice(0, lines.length - 80); paint(); };
    const esc = ctx.esc;
    function paint() { logEl.innerHTML = lines.map((l) => `<div class="${l.cls}">${esc(l.t) || "&nbsp;"}</div>`).join(""); logEl.scrollTop = logEl.scrollHeight; }
    const up = () => { const m = Math.floor((performance.now() - born) / 60000); return `up ${Math.floor(m / 60)}:${pad(m % 60)}`; };
    function sync() {
      const d = ctx.data();
      if (d.offline) return "t3 link: offline";
      if (!d.loaded) return "t3 link: connecting";
      const a = Math.max(0, Math.round((Date.now() - new Date(d.fetchedAt).getTime()) / 1000));
      return `t3 link: ${d.ok ? "live" : "stale"} · updated ${a}s ago`;
    }
    const onOff = (arg, cur) => (arg === "on" ? true : arg === "off" ? false : !cur);
    const HIDDEN = {
      sudo: () => { ctx.unlock("sudo"); return ["nutmag is not in the sudoers file.", "This incident will be reported to Dora."]; },
      ls: () => ["dora.txt  hibiscus.txt  controller.cfg  stash/"],
      "cat dora.txt": () => ["mrrp."],
      "cat hibiscus.txt": () => ["dried, deep crimson. steep for five minutes."],
      "cat controller.cfg": () => ["A=green  B=red  X=blue  Y=yellow"],
      "ls stash": () => [`${S.nuts || 0} nuts`],
      hello: () => ["Hello. NutBot here. Your tanks are being watched."],
      meow: () => ["mrrp"],
      "rm -rf /": () => ["Nice try. Dora removed the dangerous parts."],
      xyzzy: () => ["Nothing happens."],
      2469: () => { ctx.unlock("gamertag"); return ["nutmag2469. That's the gamer tag."]; },
      konami: () => ["up up down down left right left right b a"],
      reboot: () => { setTimeout(() => ctx.boot(true), 200); return ["Rebooting…"]; },
    };
    function run(raw) {
      const cmd = raw.trim().replace(/\s+/g, " "), [name, arg] = cmd.split(" ");
      print(`nutmag@minipc:~$ ${raw}`, "cmd");
      if (!cmd) return;
      if (HIDDEN[cmd]) return print(HIDDEN[cmd]().join("\n"), "ok");
      switch (name) {
        case "help": return print("date  uptime  sync  dora  nuts\nlimits [on|off]  fable [on|off]\ntheme [auto|day|night]  style [family|nut|pocket]\nface <dora|flip|sky|dash|term>\nclear  exit", "dim");
        case "date": return print(new Date().toString());
        case "uptime": return print(` ${up()} · 1 user · ${ctx.faces.length} faces`);
        case "sync": return print(sync());
        case "dora": { const h = new Date().getHours(); return print(h >= 23 || h < 7 ? "dora: asleep (zzz)" : "dora: awake, supervising"); }
        case "nuts": return print(`${S.nuts || 0} nuts in the stash`);
        case "limits": ctx.change({ limits: onOff(arg, S.limits) }); return print(`limits: ${S.limits ? "on" : "off"}`, "ok");
        case "fable": ctx.change({ fable: onOff(arg, S.fable) }); return print(`fable: ${S.fable ? "shown" : "hidden"}`, "ok");
        case "theme": if (["auto", "day", "night"].includes(arg)) { ctx.change({ theme: arg }); return print(`theme: ${arg}`, "ok"); } return print("usage: theme auto|day|night", "warn");
        case "style": { const m = { family: "avn-family", nut: "nutstyle", pocket: "pocket" }[arg]; if (m) { ctx.change({ style: m }); return print(`style: ${arg}`, "ok"); } return print("usage: style family|nut|pocket", "warn"); }
        case "face": { const id = arg === "terminal" ? "term" : arg; if (ctx.faces.some((f) => f.id === id)) { ctx.change({ face: id }); return; } return print("usage: face dora|flip|sky|dash|term", "warn"); }
        case "clear": lines.length = 0; return paint();
        case "exit": ctx.change({ face: "dora" }); return;
        default: return print(`${name}: command not found. Try help.`, "warn");
      }
    }
    return {
      mount(box) {
        box.innerHTML = `<div class="termface"><div class="term-time" role="timer"></div><div class="term-log"></div><label class="term-in"><span class="term-ps">nutmag@minipc:~$</span><input type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" enterkeyhint="go" aria-label="Terminal command"></label></div>`;
        logEl = box.querySelector(".term-log"); inEl = box.querySelector("input"); timeEl = box.querySelector(".term-time");
        box.querySelector(".termface").addEventListener("click", (e) => { if (!e.target.closest("input")) inEl.focus({ preventScroll: true }); });
        inEl.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter") { const v = inEl.value; if (v.trim()) { hist.unshift(v); hi = -1; } inEl.value = ""; run(v); }
          else if (e.key === "ArrowUp") { e.preventDefault(); if (hi < hist.length - 1) inEl.value = hist[++hi]; }
          else if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.max(-1, hi - 1); inEl.value = hi < 0 ? "" : hist[hi]; }
        });
        print("nutmag@minipc:~$ uptime", "cmd"); print(` ${up()} · 1 user · ${ctx.faces.length} faces`);
        setTimeout(() => { print("nutmag@minipc:~$ sync", "cmd"); print(sync()); print("type help", "dim"); }, 900);
      },
      tick(now) {
        const p = parts(S, now);
        timeEl.textContent = `${p.hh}:${p.mm}${S.seconds ? ":" + p.ss : ""}${p.ap ? " " + p.ap : ""}`;
      },
      destroy() {},
    };
  });

  window.NMFaces = FACES;
})();
