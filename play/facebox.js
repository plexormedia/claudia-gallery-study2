/* Face-box playground.
   place() is the arithmetic from site.js L43–L51 (STUDY.md section 6.4). The playground runs it two ways:
   - the site's: always Math.max (cover), with the position from data-pos, as the site does;
   - fixed: Math.max or Math.min to match object-fit, with the position read from the image itself.
   Then it draws the result on a screen of the size you choose, and on the whole photo. */
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const IMG = "https://claudia.gallery/img/";
  // the three hero slides, with their data-box, data-pos and score from index.html L38–L49
  const SLIDES = [
    { name: "Escape Velocity", src: IMG + "ev-17-merge/tag-to-lens-1.m.webp", box: [0.516, 0.2003, 0.2927, 0.5244], pos: [66, 30], score: "0.65" },
    { name: "Clodyssey", src: IMG + "sp-02-open/siren-mcu-2.m.webp", box: [0.2983, 0.1799, 0.2616, 0.5385], pos: [43, 35], score: "0.79" },
    { name: "Bliss", src: IMG + "xp-01c-cast/face-gown-4.m.webp", box: [0.3041, 0.0292, 0.4636, 0.9272], pos: [54, 30], score: "0.68" },
  ];
  const SCREENS = [["Phone", 375, 812], ["iPad", 820, 1180], ["iPad wide", 1180, 820], ["Laptop", 1440, 900]];
  const START = { slide: 0, W: 1440, H: 900, fit: "cover", px: 66, py: 30, mode: "site", zoom: 100 };
  const FALLBACK = { w: 1800, h: 1008 };               // the .m.webp files are 1800 × 1008
  let S = { ...START };

  const photo = $("#photo"), screen = $("#screen"), box = $("#box"), truebox = $("#truebox");

  /* ---------- the arithmetic ---------- */
  function place(nat, W, H, [bx, by, bw, bh], fit, px, py) {
    const sc = (fit === "contain" ? Math.min : Math.max)(W / nat.w, H / nat.h);   // (1)
    const iw = nat.w * sc, ih = nat.h * sc;                                        // (2)
    const ox = (W - iw) * px / 100, oy = (H - ih) * py / 100;                      // (3)
    return { sc, iw, ih, ox, oy, left: ox + bx * iw, top: oy + by * ih, width: bw * iw, height: bh * ih };   // (4)
  }
  // the slow zoom scales the photo about the middle of the screen; this is where a rectangle on it ends up
  const zoomed = (r, W, H, z) => ({ left: W / 2 + (r.left - W / 2) * z, top: H / 2 + (r.top - H / 2) * z, width: r.width * z, height: r.height * z });

  const minus = v => (v < 0 ? "−" : "") + Math.abs(v);
  const f1 = v => minus(Math.abs(v) < 0.05 ? 0 : +v.toFixed(1)).replace(/^(−?\d+)$/, "$1.0");
  const f4 = v => v.toFixed(4);
  const frac = v => (v / 100).toFixed(2);

  /* ---------- drawing ---------- */
  function render() {
    const sl = SLIDES[S.slide], z = S.zoom / 100;
    photo.style.objectFit = S.fit;
    photo.style.objectPosition = `${S.px}% ${S.py}%`;
    photo.style.transform = z === 1 ? "" : `scale(${z})`;
    $("#score").textContent = sl.score;

    const nat = photo.naturalWidth ? { w: photo.naturalWidth, h: photo.naturalHeight } : FALLBACK;
    const { W, H } = S;
    // the fixed place() asks the image where it is, instead of keeping a copy in data-pos
    const [cpx, cpy] = getComputedStyle(photo).objectPosition.split(" ").map(parseFloat);
    const site = place(nat, W, H, sl.box, "cover", sl.pos[0], sl.pos[1]);
    const real = place(nat, W, H, sl.box, S.fit, cpx, cpy);
    const used = S.mode === "site" ? site : real;
    const face = zoomed(real, W, H, z);                  // where the face really is on screen

    // the screen, scaled to fit the panel (object-fit gives the same crop at any scale)
    // on narrow screens the screen sticks to the top while you use the controls, so it gets less height
    const maxH = matchMedia("(max-width: 1000px)").matches ? Math.min(300, innerHeight * 0.34) : 520;
    const wrap = $("#screen-wrap"), s = Math.min(1, (wrap.clientWidth - 36) / W, maxH / H);
    screen.style.width = W * s + "px";
    screen.style.height = H * s + "px";
    Object.assign(box.style, { left: used.left * s + "px", top: used.top * s + "px", width: used.width * s + "px", height: used.height * s + "px" });
    const d = Math.max(Math.abs(used.left - face.left), Math.abs(used.top - face.top),
      Math.abs(used.left + used.width - face.left - face.width), Math.abs(used.top + used.height - face.top - face.height));
    truebox.hidden = d < 1;
    Object.assign(truebox.style, { left: face.left * s + "px", top: face.top * s + "px", width: face.width * s + "px", height: face.height * s + "px" });
    $("#screen-note").textContent = `${W} × ${H}, shown at ${Math.round(s * 100)}%`;

    verdict(d, sl, cpx, cpy, z);
    drawWorld(sl, W, H, real, used, face, z, d);
    drawCalc(nat, W, H, sl, used, cpx, cpy);
    syncUI();
  }

  function verdict(d, sl, cpx, cpy, z) {
    const why = [];
    if (S.mode === "site" && S.fit === "contain") why.push("the site's place() always does the cover arithmetic (<b>Math.max</b>), but the photo is drawn with <b>contain</b>");
    if (S.mode === "site" && (cpx !== sl.pos[0] || cpy !== sl.pos[1])) why.push(`it takes the position from <b>data-pos="${sl.pos.join(" ")}"</b>, but the photo is at <b>${cpx}% ${cpy}%</b>`);
    if (z !== 1) why.push(`the photo is zoomed to <b>${S.zoom.toFixed(1)}%</b>, and place() works out the box for 100%`);
    const fixable = S.mode === "site" && why.length > (z !== 1 ? 1 : 0);
    $("#verdict").innerHTML = d < 1
      ? "<b>The box sits on the face.</b> " + (S.mode === "site" ? "The site's place() is right as long as the CSS matches its assumptions: cover, at the position in data-pos." : "The fixed place() follows whatever the CSS does.")
      : `<span class="bad"><b>The box misses the face by up to ${Math.round(d)}px:</b></span> ${why.join("; ")}.` + (fixable ? " Switch to the fixed place() to put it back." : "");
  }

  function drawWorld(sl, W, H, real, used, face, z, d) {
    const el = $("#world");
    const ph = zoomed({ left: real.ox, top: real.oy, width: real.iw, height: real.ih }, W, H, z);   // the photo as drawn
    const minX = Math.min(0, ph.left), minY = Math.min(0, ph.top);
    const bw = Math.max(W, ph.left + ph.width) - minX, bh = Math.max(H, ph.top + ph.height) - minY;
    let dw = Math.max(240, el.clientWidth - 28), dh = dw * bh / bw;
    if (dh > 420) { dh = 420; dw = dh * bw / bh; }
    const u = bw / dw, pad = 10 * u, top = 24 * u;      // u = photo pixels per screen pixel
    const vx = minX - pad, vy = minY - pad - top, vw = bw + 2 * pad, vh = bh + 2 * pad + top;
    const r = (o, cls) => `x="${o.left}" y="${o.top}" width="${o.width}" height="${o.height}" ${cls}`;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${vw / u}" height="${vh / u}" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="The whole photo, the screen and the box">`;
    s += `<defs><pattern id="hatch" width="${8 * u}" height="${8 * u}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${8 * u}" height="${8 * u}" fill="rgba(10,11,13,.62)"/><rect width="${3 * u}" height="${8 * u}" fill="rgba(217,119,87,.5)"/></pattern>`;
    s += `<mask id="outside"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/><rect x="0" y="0" width="${W}" height="${H}" fill="#000"/></mask></defs>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#000"/>`;
    s += `<image href="${sl.src}" xlink:href="${sl.src}" ${r(ph, "")} preserveAspectRatio="none"/>`;
    s += `<rect ${r(ph, 'fill="url(#hatch)" mask="url(#outside)"')}/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#ece9e2" stroke-width="${2 * u}"/>`;
    s += `<text x="0" y="${-8 * u}" font-size="${11 * u}" fill="#ece9e2" letter-spacing="${0.08 * 11 * u}">SCREEN ${W} × ${H}</text>`;
    if (d >= 1) s += `<rect ${r(face, `fill="none" stroke="#f0936f" stroke-width="${1.5 * u}" stroke-dasharray="${5 * u} ${4 * u}"`)}/>`;
    s += `<rect ${r(used, `fill="none" stroke="#fff" stroke-width="${1.5 * u}"`)}/>`;
    el.innerHTML = s + "</svg>";
  }

  function drawCalc(nat, W, H, sl, c, cpx, cpy) {
    const site = S.mode === "site", fit = site ? "cover" : S.fit, fn = fit === "contain" ? "min" : "max";
    const [px, py] = site ? sl.pos : [cpx, cpy];
    const noteFit = site && S.fit === "contain" ? "<br><b>but the CSS says contain</b>" : "";
    const notePos = site && (cpx !== sl.pos[0] || cpy !== sl.pos[1]) ? `<br><b>from data-pos; the photo is at ${cpx}% ${cpy}%</b>` : (site ? "<br>from data-pos" : "<br>read from the image");
    const rows = [
      ["Screen", "W × H", `${W} × ${H}`],
      ["Photo", "naturalWidth × naturalHeight", `${nat.w} × ${nat.h}`],
      ["(1) Scale", `${fn}(${W} / ${nat.w}, ${H} / ${nat.h})<br>= ${fn}(${f4(W / nat.w)}, ${f4(H / nat.h)})${noteFit}`, f4(c.sc)],
      ["(2) On screen", `${nat.w} × ${f4(c.sc)}, ${nat.h} × ${f4(c.sc)}`, `${f1(c.iw)} × ${f1(c.ih)}`],
      ["(3) Offset", `(${W} − ${f1(c.iw)}) × ${frac(px)},<br>(${H} − ${f1(c.ih)}) × ${frac(py)}${notePos}`, `${f1(c.ox)}, ${f1(c.oy)}`],
      ["(4) Left", `${f1(c.ox)} + ${sl.box[0]} × ${f1(c.iw)}`, f1(c.left)],
      ["Top", `${f1(c.oy)} + ${sl.box[1]} × ${f1(c.ih)}`, f1(c.top)],
      ["Width", `${sl.box[2]} × ${f1(c.iw)}`, f1(c.width)],
      ["Height", `${sl.box[3]} × ${f1(c.ih)}`, f1(c.height)],
    ];
    $("#calc").innerHTML = rows.map(([a, b, v]) => `<tr><th scope="row">${a}</th><td>${b}</td><td class="r">${v}</td></tr>`).join("");
    $("#calc-title").textContent = site ? "place(), as the site runs it" : "place(), fixed";
  }

  /* ---------- controls ---------- */
  function syncUI() {
    ["W", "H", "px", "py", "zoom"].forEach(k => { $("#" + k).value = S[k]; });
    $("#W-o").textContent = S.W + "px";
    $("#H-o").textContent = S.H + "px";
    $("#px-o").textContent = S.px + "%";
    $("#py-o").textContent = S.py + "%";
    $("#zoom-o").textContent = S.zoom.toFixed(1) + "%";
    document.querySelectorAll("#slides button").forEach((b, n) => b.setAttribute("aria-pressed", String(n === S.slide)));
    document.querySelectorAll("#screens button").forEach((b, n) => b.setAttribute("aria-pressed", String(SCREENS[n][1] === S.W && SCREENS[n][2] === S.H)));
    document.querySelectorAll("#fit button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.fit === S.fit)));
    document.querySelectorAll("#mode button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === S.mode)));
    const own = SLIDES[S.slide].pos;
    $("#own-pos").disabled = S.px === own[0] && S.py === own[1];
    $("#mode-hint").innerHTML = S.mode === "site"
      ? "Always <b>Math.max</b> (cover), and the position from <b>data-pos</b>. Right as long as the CSS doesn't change."
      : "<b>Math.max</b> for cover and <b>Math.min</b> for contain, with the position read from the image: <b>getComputedStyle(img).objectPosition</b>.";
  }

  function setSlide(n) {
    S.slide = n;
    [S.px, S.py] = SLIDES[n].pos;
    const src = SLIDES[n].src;
    if (photo.getAttribute("src") !== src) { photo.removeAttribute("src"); photo.src = src; }
    render();
  }

  $("#slides").innerHTML = SLIDES.map(s => `<button type="button">${s.name}</button>`).join("");
  $("#screens").innerHTML = SCREENS.map(([n, w, h]) => `<button type="button">${n} ${w} × ${h}</button>`).join("");
  $("#slides").addEventListener("click", e => { const b = e.target.closest("button"); if (b) setSlide([...b.parentNode.children].indexOf(b)); });
  $("#screens").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const [, w, h] = SCREENS[[...b.parentNode.children].indexOf(b)];
    S.W = w; S.H = h; render();
  });
  $("#fit").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { S.fit = b.dataset.fit; render(); } });
  $("#mode").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { S.mode = b.dataset.mode; render(); } });
  ["W", "H", "px", "py", "zoom"].forEach(k => $("#" + k).addEventListener("input", e => { S[k] = +e.target.value; render(); }));
  $("#own-pos").addEventListener("click", () => { [S.px, S.py] = SLIDES[S.slide].pos; render(); });
  $("#reset").addEventListener("click", () => { S = { ...START }; setSlide(0); });

  photo.addEventListener("load", render);
  photo.addEventListener("error", () => { $("#verdict").insertAdjacentHTML("beforeend", " (The photo didn't load, so the numbers use its usual size, 1800 × 1008.)"); });
  let pending = 0;
  new ResizeObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(render); }).observe($("#screen-wrap"));

  setSlide(0);
})();
