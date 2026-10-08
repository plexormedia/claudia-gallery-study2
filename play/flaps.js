/* Split-flap playground.
   The board runs the same logic as site.js L18–L36 (STUDY.md section 5.3). What the playground adds: the numbers
   come from the sliders, a slow-motion factor, and a record of when each tile stopped and landed, for the chart. */
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SLOW = 5;                                         // slow motion runs everything 5 times slower
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", DIGITS = "0123456789";
  const DEFAULTS = { word: "CLAUDIA", base: 380, step: 95, spread: 260, interval: 55, fw: null, digits: false };
  // the variations from STUDY.md section 5.6; each starts from the site's numbers
  const PRESETS = [
    ["Site", { ...DEFAULTS }],
    ["Left to right", { spread: 90 }],
    ["Slow clatter", { interval: 110 }],
    ["Counter", { word: "2026", digits: true }],
    ["Big tiles", { fw: 120 }],
  ];

  const board = $("#board"), chart = $("#chart"), readout = $("#readout"), statusEl = $("#status");
  const word = $("#word"), RANGES = ["base", "step", "spread", "interval", "fw"];
  let P = { ...DEFAULTS };
  let slow = false, runId = 0, rec = null, picked = null, summary = "";

  /* ---------- the board ---------- */
  function buildBoard() {
    runId++;                                             // stop any run on the old tiles
    rec = null;
    board.textContent = "";
    [...(P.word || " ")].forEach(ch => {
      const d = document.createElement("span");
      d.className = ch === " " ? "flap sp" : "flap";
      d.setAttribute("aria-hidden", "true");
      d.textContent = ch === " " ? "" : ch;             // an empty tile is skipped, as on the site
      d.dataset.final = d.textContent;
      board.appendChild(d);
    });
    board.setAttribute("aria-label", P.word.trim() || "Empty board");
    $("#word-n").textContent = board.children.length + (board.children.length === 1 ? " tile" : " tiles");
    if (P.fw == null) board.style.removeProperty("--fw"); else board.style.setProperty("--fw", P.fw + "px");
  }

  /* ---------- one run: site.js L20–L34 with the playground's numbers ---------- */
  function play() {
    const run = ++runId, k = slow ? SLOW : 1, CH = P.digits ? DIGITS : LETTERS;
    const start = performance.now();
    rec = { run, k, start, stops: [], lands: [], left: 0 };
    picked = null; summary = "";
    [...board.children].forEach((d, i) => {
      d.textContent = d.dataset.final;
      const c = d.dataset.final;
      if (!c) return;                                   // site: if (!c) return;
      const stop = start + (P.base + i * P.step + Math.random() * P.spread) * k;   // site: L26
      rec.stops[i] = (stop - start) / k;                // playground: kept for the chart, in real-speed ms
      rec.left++;
      const step = now => {
        if (runId !== run) return;                      // playground: a newer run took over
        if (now >= stop) { d.textContent = c; landed(i, (now - start) / k); return; }
        if (now >= start) {
          d.textContent = CH[(Math.random() * CH.length) | 0];
          d.classList.remove("tick"); void d.offsetWidth; d.classList.add("tick");
        }
        setTimeout(() => requestAnimationFrame(step), P.interval * k);   // site: L30
      };
      requestAnimationFrame(step);
    });
    statusEl.textContent = slow ? `Playing, ${SLOW} times slower` : "Playing";
    readout.textContent = "Tap a row to see its numbers.";
    drawChart();
    if (rec.left) requestAnimationFrame(cursor); else settle();
  }

  function landed(i, t) {
    if (!rec || rec.lands[i] != null) return;
    rec.lands[i] = t;
    rec.left--;
    drawChart();
    if (!rec.left) settle();
  }

  // the summary once every tile has landed
  function settle() {
    const ids = rec.stops.map((s, i) => (s == null ? null : i)).filter(i => i != null);
    if (!ids.length) { statusEl.textContent = "Nothing to flip"; return; }
    const end = Math.max(...ids.map(i => rec.lands[i]));
    const name = i => board.children[i].dataset.final;
    const byStop = [...ids].sort((a, b) => rec.stops[a] - rec.stops[b]);
    const outOfOrder = byStop.some((v, n) => n && v < byStop[n - 1]);
    const together = [];
    ids.forEach(i => ids.forEach(j => { if (j > i && Math.abs(rec.lands[i] - rec.lands[j]) < 1) together.push(name(i) + " and " + name(j)); }));
    statusEl.textContent = `Settled after ${Math.round(end).toLocaleString("en")}ms`;
    summary = `This run settled after ${Math.round(end).toLocaleString("en")}ms. ` +
      (outOfOrder ? `Stop order: ${byStop.map(name).join(" ")}, so some neighbours stopped out of order. ` : "The tiles stopped from left to right. ") +
      (together.length ? `Landed at the same moment: ${together.slice(0, 3).join("; ")}.` : "");
    if (picked == null) readout.textContent = summary;
  }

  /* ---------- the chart ---------- */
  const niceStep = max => (max <= 600 ? 100 : max <= 1600 ? 200 : max <= 4000 ? 500 : 1000);
  let geo = null;

  function drawChart() {
    const tiles = [...board.children];
    const rows = tiles.map((d, i) => ({ i, ch: d.dataset.final })).filter(r => r.ch);
    const W = Math.max(260, chart.clientWidth - 28), L = 50, R = 12, T = 4, rowH = 24, axH = 30;
    const latest = P.base + Math.max(0, tiles.length - 1) * P.step + P.spread + P.interval + 20;
    const tick = niceStep(latest), max = Math.ceil(latest / tick) * tick;
    const x = ms => L + (Math.min(ms, max) / max) * (W - L - R);
    const H = T + rows.length * rowH + axH;
    geo = { x, T, H, rowH, n: rows.length };
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Stop windows for ${rows.length} tiles">`;
    for (let ms = 0; ms <= max; ms += tick) {
      s += `<line class="m-grid" x1="${x(ms)}" x2="${x(ms)}" y1="${T}" y2="${T + rows.length * rowH}"/>`;
      s += `<text class="ax" x="${x(ms)}" y="${H - 10}" text-anchor="middle">${ms}</text>`;
    }
    rows.forEach((r, n) => {
      const y = T + n * rowH, lo = P.base + r.i * P.step, hi = lo + P.spread;
      s += `<text class="rl" x="${L - 10}" y="${y + 16}" text-anchor="end">${r.i} · ${r.ch}</text>`;
      s += `<rect class="m-flip" x="${x(0)}" y="${y + 8}" width="${Math.max(0, x(lo) - x(0) - 1)}" height="8"/>`;
      s += `<rect class="m-win" x="${x(lo)}" y="${y + 8}" width="${Math.max(2, x(hi) - x(lo))}" height="8"/>`;
      if (rec && rec.stops[r.i] != null) s += `<rect class="m-stop" x="${x(rec.stops[r.i]) - 1}" y="${y + 3}" width="2" height="18"/>`;
      if (rec && rec.lands[r.i] != null) s += `<rect class="m-land" x="${x(rec.lands[r.i]) - 4.5}" y="${y + 7.5}" width="9" height="9"/>`;
      s += `<rect class="hit${picked === r.i ? " on" : ""}" data-i="${r.i}" x="0" y="${y}" width="${W}" height="${rowH}"/>`;
    });
    s += `<line class="m-now" id="now" x1="${x(0)}" x2="${x(0)}" y1="${T}" y2="${T + rows.length * rowH}" opacity="0"/>`;
    chart.innerHTML = s + "</svg>";
  }

  // a line that sweeps across the chart while the board runs
  function cursor() {
    if (!rec || rec.run !== runId || !geo) return;
    const t = (performance.now() - rec.start) / rec.k, line = $("#now");
    if (line) { line.setAttribute("x1", geo.x(t)); line.setAttribute("x2", geo.x(t)); line.setAttribute("opacity", rec.left ? 1 : 0); }
    if (rec.left) requestAnimationFrame(cursor);
  }

  function pick(i) {
    picked = i;
    chart.querySelectorAll(".hit").forEach(h => h.classList.toggle("on", +h.dataset.i === i));
    const ch = board.children[i].dataset.final, lo = P.base + i * P.step, hi = lo + P.spread;
    let t = `Tile ${i} (${ch}) can stop anywhere from ${lo} to ${hi}ms.`;
    if (rec && rec.stops[i] != null) t += ` This run it stopped at ${Math.round(rec.stops[i])}ms`;
    if (rec && rec.lands[i] != null) t += ` and landed at ${Math.round(rec.lands[i])}ms, ${Math.round(rec.lands[i] - rec.stops[i])}ms later, at its next letter.`;
    else if (rec && rec.stops[i] != null) t += ".";
    readout.textContent = t;
  }
  chart.addEventListener("pointerdown", e => { const h = e.target.closest(".hit"); if (h) pick(+h.dataset.i); });
  chart.addEventListener("pointerover", e => { const h = e.target.closest(".hit"); if (h && e.pointerType === "mouse") pick(+h.dataset.i); });

  /* ---------- the code and what it means ---------- */
  function drawCode() {
    const CH = P.digits ? DIGITS : LETTERS, fw = P.fw == null ? "clamp(34px, 6.2vw, 100px)" : P.fw + "px";
    $("#code").innerHTML =
      `<i>// site.js L19: what a tile can show</i>\nconst CH = "<b>${CH}</b>";\n\n` +
      `<i>// site.js L26: when tile i stops</i>\nconst stop = start + <b>${P.base}</b> + i * <b>${P.step}</b> + Math.random() * <b>${P.spread}</b>;\n\n` +
      `<i>// site.js L30: the wait before the next letter</i>\nsetTimeout(() => requestAnimationFrame(step), <b>${P.interval}</b>);\n\n` +
      `<i>/* site.css L63: the tile width */</i>\n.flaps { --fw: <b>${fw}</b>; }`;
    const n = board.children.length, lo = P.base + (n - 1) * P.step, hi = lo + P.spread;
    const order = P.spread > P.step
      ? `The random part (<b>${P.spread}ms</b>) is bigger than the step (<b>${P.step}ms</b>), so neighbouring tiles can stop out of order.`
      : `The random part (<b>${P.spread}ms</b>) is no bigger than the step (<b>${P.step}ms</b>), so the tiles always stop from left to right.`;
    $("#insight").innerHTML = `${order} The last tile stops between <b>${lo}</b> and <b>${hi}ms</b>, and lands at its next letter, up to about <b>${P.interval + 17}ms</b> later.`;
  }

  /* ---------- controls ---------- */
  function siteFw() {                                    // the width the site's clamp() gives in this window
    const probe = board.querySelector(".flap");
    if (P.fw != null || !probe) return null;
    return Math.round(parseFloat(getComputedStyle(probe).width));
  }
  function syncUI() {
    word.value = P.word;
    RANGES.forEach(k => {
      const el = $("#" + k);
      el.value = k === "fw" ? (P.fw ?? siteFw() ?? 64) : P[k];
      $("#" + k + "-o").textContent = k === "fw" ? (P.fw == null ? `${siteFw()}px, the site's` : `${P.fw}px`) : `${P[k]}ms`;
    });
    $("#fw-site").disabled = P.fw == null;
    document.querySelectorAll("#alphabet button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.digits === +P.digits)));
    document.querySelectorAll("#presets button").forEach((b, n) => {
      const want = { ...DEFAULTS, word: P.word, ...PRESETS[n][1] };
      if (n === 0) want.word = DEFAULTS.word;
      b.setAttribute("aria-pressed", String(Object.keys(DEFAULTS).every(key => want[key] === P[key])));
    });
  }
  function changed({ rebuild = false, replay = false } = {}) {
    if (rebuild) buildBoard(); else { rec = null; runId++; [...board.children].forEach(d => (d.textContent = d.dataset.final)); }
    syncUI(); drawCode(); drawChart();
    statusEl.textContent = "Ready";
    readout.textContent = "Tap a row to see its numbers.";
    if (replay) play();
  }

  $("#presets").innerHTML = PRESETS.map(([label]) => `<button type="button" aria-pressed="false">${label}</button>`).join("");
  $("#presets").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const n = [...b.parentNode.children].indexOf(b);
    const before = P.word;
    P = n === 0 ? { ...DEFAULTS } : { ...DEFAULTS, word: P.word, ...PRESETS[n][1] };
    changed({ rebuild: true, replay: true });
    if (P.word !== before) word.value = P.word;
  });
  $("#reset").addEventListener("click", () => { P = { ...DEFAULTS }; changed({ rebuild: true, replay: true }); });

  RANGES.forEach(k => {
    const el = $("#" + k);
    el.addEventListener("input", () => {
      P[k] = +el.value;
      if (k === "fw") board.style.setProperty("--fw", P.fw + "px");
      changed();
    });
    el.addEventListener("change", () => play());       // replay when you let go of the slider
  });
  $("#fw-site").addEventListener("click", () => { P.fw = null; board.style.removeProperty("--fw"); changed({ replay: true }); });

  let typing;
  word.addEventListener("input", () => {
    const clean = word.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 14);
    if (word.value !== clean) word.value = clean;
    P.word = clean;
    changed({ rebuild: true });
    clearTimeout(typing);
    typing = setTimeout(play, 700);                      // replay once you stop typing
  });

  $("#alphabet").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    P.digits = b.dataset.digits === "1";
    changed({ replay: true });
  });
  $("#play").addEventListener("click", play);
  $("#slow").addEventListener("click", () => {
    slow = !slow;
    $("#slow").setAttribute("aria-pressed", String(slow));
    board.style.setProperty("--slow", slow ? SLOW : 1);
    play();
  });

  let pending = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => { drawChart(); if (P.fw == null) syncUI(); });
  }).observe(chart);

  /* ---------- start ---------- */
  buildBoard(); syncUI(); drawCode(); drawChart();
  if (RM) {
    statusEl.textContent = "Ready";
    readout.textContent = "Your device asks for less motion, so the board doesn't start by itself. Press Play to run it.";
  } else {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(play, 250));
  }
})();
