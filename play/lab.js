/* CSS lab: the homepage of this copy in a frame, with your CSS added to it as you type.
   The frame and this page come from the same site, so the script can reach into the frame's document and add a
   <style> element after site.css and study-copy.css. Being last, its rules win. */
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const KEY = "claudia-study-lab-css";
  const WIDTHS = [[375, 812, "Phone"], [533, 900, ""], [820, 1180, "iPad"], [1180, 820, "iPad"], [1440, 900, "Laptop"]];
  const JUMPS = [["top", "Top"], ["who", "Who she is"], ["films", "Films"], ["looks", "Looks"], ["make", "Wiki"], ["agents", "Agents"], ["footer", "Footer"]];
  // every CSS "Try it" in STUDY.md, with where to look and what to look for
  const EXPERIMENTS = [
    ["Colour · guide section 2", [
      ["Re-tint the accent", ":root { --clay: #3fa7a0; --clay2: #63c7c0; }", "top", null,
        "The whole accent turns teal: the brand streak, the slideshow pips, the face-box corners, the section numbers, the footer line. The photos stay orange: her streak is real."],
      ["Labels that pass AA", ":root { --ink3: #7a7f86; }", "who", null,
        "The small labels get a touch brighter: 4.88 : 1 on the background instead of 4.18 : 1. The three levels of text still read as three levels."],
      ["A green canvas", ":root { --bg: #0b1a14; }", "who", null,
        "The page and the wiki cards turn green, but the header stays blue-black, because its colour is written out as rgba(10,11,13,.86). Jump to Top: the hero's shade only turns green at its very bottom."],
    ]],
    ["Type · guide section 3", [
      ["Swap the display face", ':root { --cond: "Heros Cn", "Arial Narrow", sans-serif; }', "who", null,
        "The section titles switch to condensed Heros Bold. They ask for weight 900; the browser uses the nearest weight it has, 700."],
      ["Labels without tracking", ".lab { letter-spacing: 0; }", "who", null,
        "Small capitals without letter spacing look cramped. Compare the label under the title and the ones in the canon list."],
      ["A bigger intro on phones", "@media (max-width: 700px) {\n  .hero-copy .lede { font-size: 17px; }\n}", "top", 375,
        "The frame switches to phone width, where the intro under CLAUDIA is now 17px instead of 15.5px. At wider frames nothing changes, because of the media query."],
    ]],
    ["Layout · guide section 4", [
      ["Fix the looks strip", ".look .ph { display: block; }\n.look .lab { display: block; }\n.strip { scroll-padding-inline: var(--pad); }", "looks", null,
        "The photos get their 2:3 frames, the titles appear under them, the labels tighten, and the first card lines up with the section title."],
      ["Equal film columns", "@media (min-width: 901px) {\n  .film-row, .film-row:nth-child(even) {\n    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n  }\n}", "films", 1440,
        "The video and the text now share each row equally. Under 900px the rows still stack, thanks to the media query."],
      ["A narrower page", ":root { --max: 960px; }", "who", 1440,
        "Every section stops at 960px and centres itself, with wide margins on both sides."],
      ["More wiki columns", ".guides { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }", "make", 1440,
        "The cards can now be as narrow as 240px, so one more fits in each row: 5 instead of 4 at 1440px. Try the other widths: 4 instead of 3 at 1180, 3 instead of 2 at 820, 2 instead of 1 at 533."],
    ]],
    ["Face boxes · guide section 6", [
      ["Contain instead of cover", ".hero .slide img { object-fit: contain; }", "top", null,
        "The photos shrink to fit, with black bands, but the boxes stay where cover would put them. The JavaScript half of this experiment is in the face-box playground."],
      ["Break object-position", ".hero .slide img { object-position: 50% 50% !important; }", "top", 375,
        "At phone width most of each photo is cropped away, so the shift is easy to see. The photos re-centre, but the boxes keep following data-pos and miss the faces. The !important beats the style attribute in the HTML."],
      ["Show the box at once", ".cvbox { transition-delay: 0s; }", "top", null,
        "Wait for the next slide, which comes every 7 seconds, or tap one of the small bars at the bottom right: the box now appears while the photo is still fading in."],
    ]],
  ];

  const frame = $("#frame"), wrap = $("#frame-wrap"), panel = $("#frame-panel"), css = $("#css"), explain = $("#explain");
  const HELLO = explain.textContent;
  let size = WIDTHS[4], target = "top";

  /* ---------- the frame ---------- */
  function fit() {
    const [w, h] = size;
    // The frame is drawn at full size and scaled down to fit the panel. The panel sticks to the top of the screen,
    // so all of it must fit on screen, and it must still fit at the end of the page, where the footer takes some of
    // the screen; otherwise the end of the bench would push it up. Under 1000px the frame also leaves room for the
    // controls scrolling below it.
    const chrome = panel.offsetHeight - wrap.offsetHeight;          // the panel's header and footer
    const foot = document.querySelector(".play-f");
    const below = foot ? Math.max(0, foot.getBoundingClientRect().bottom - panel.closest(".bench").getBoundingClientRect().bottom) : 0;
    const room = innerHeight - (parseFloat(getComputedStyle(panel).top) || 0) - chrome - below - 12;
    const maxH = Math.max(150, matchMedia("(max-width: 1000px)").matches ? Math.min(room, innerHeight * 0.36) : room);
    const s = Math.min(1, panel.clientWidth / w, maxH / h);
    frame.style.width = w + "px";
    frame.style.height = h + "px";
    frame.style.transform = s < 1 ? `scale(${s})` : "";
    wrap.style.width = w * s + "px";
    wrap.style.height = h * s + "px";
    $("#frame-note").textContent = `Scale ${Math.round(s * 100)}%`;
  }

  function doc() { try { return frame.contentDocument; } catch (e) { return null; } }

  function apply() {
    const d = doc();
    if (!d || !d.head) return;
    let st = d.getElementById("lab-css");
    if (!st) { st = d.createElement("style"); st.id = "lab-css"; d.head.appendChild(st); }
    st.textContent = css.value;
    $("#applied").textContent = css.value.trim() ? "Applied" : "Nothing yet";
  }

  function jump(id) {
    target = id;
    const d = doc(), win = frame.contentWindow;
    if (!d || !win) return;
    const el = id === "top" ? null : id === "footer" ? d.querySelector(".site-f") : d.getElementById(id);
    const y = el ? el.getBoundingClientRect().top + win.scrollY - 64 : 0;
    win.scrollTo(0, Math.max(0, y));
    document.querySelectorAll("#jumps button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
  }

  function loaded() {
    apply();
    const d = doc();
    if (!d || d.labReady) return;
    d.labReady = true;
    // keep the frame on the homepage: section links jump inside it, other links open in a new tab
    d.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      e.preventDefault();
      if (href.startsWith("#")) jump(href === "#about-this-copy" ? "footer" : href === "#main" ? "who" : href.slice(1));
      else if (href === "./") jump("top");
      else window.open(a.href, "_blank", "noopener");
    }, true);
    setTimeout(() => jump(target), 60);
  }
  frame.addEventListener("load", loaded);

  /* ---------- your CSS ---------- */
  let typing;
  css.addEventListener("input", () => {
    clearTimeout(typing);
    typing = setTimeout(() => { apply(); save(); markExperiment(); }, 150);
  });
  function save() { try { localStorage.setItem(KEY, css.value); } catch (e) {} }
  function restore() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }

  $("#clear").addEventListener("click", () => { css.value = ""; apply(); save(); markExperiment(); explain.textContent = HELLO; });
  $("#copy").addEventListener("click", () => {
    const b = $("#copy"), done = () => { b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy"; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(css.value).then(done, () => css.select());
    else css.select();
  });
  $("#reload").addEventListener("click", () => { try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; } });

  /* ---------- the experiments ---------- */
  const all = [];
  $("#experiments").innerHTML = EXPERIMENTS.map(([group, items]) =>
    `<div class="field"><span class="lab">${group}</span><div class="chips">` +
    items.map(item => { all.push(item); return `<button type="button" data-n="${all.length - 1}" aria-pressed="false">${item[0]}</button>`; }).join("") +
    `</div></div>`).join("");

  function markExperiment() {
    document.querySelectorAll("#experiments button").forEach(b => b.setAttribute("aria-pressed", String(all[+b.dataset.n][1] === css.value)));
  }

  $("#experiments").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const [title, rule, where, width, look] = all[+b.dataset.n];
    css.value = rule; apply(); save(); markExperiment();
    explain.innerHTML = `<b>${title}.</b> ${look}`;
    if (width && width !== size[0]) setWidth(WIDTHS.find(x => x[0] === width));
    jump(where);
    setTimeout(() => jump(where), 250);                  // again, once the page has re-laid itself out
    const r = panel.getBoundingClientRect();
    if (r.top < 56 || r.top > innerHeight - 120) panel.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  /* ---------- width and jumps ---------- */
  function setWidth(w) {
    size = w; fit();
    document.querySelectorAll("#widths button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.w === w[0])));
    setTimeout(() => jump(target), 120);
  }
  $("#widths").innerHTML = WIDTHS.map(([w, , name]) => `<button type="button" data-w="${w}" aria-pressed="false">${(name + " " + w).trim()}</button>`).join("");
  $("#widths").addEventListener("click", e => { const b = e.target.closest("button"); if (b) setWidth(WIDTHS.find(x => x[0] === +b.dataset.w)); });
  $("#jumps").innerHTML = JUMPS.map(([id, name]) => `<button type="button" data-id="${id}" aria-pressed="false">${name}</button>`).join("");
  $("#jumps").addEventListener("click", e => { const b = e.target.closest("button"); if (b) jump(b.dataset.id); });

  // fit again when the panel changes size (rotation, split view, a longer explanation) or the window gets much
  // shorter or taller; small changes in height, like a phone's toolbar hiding as you scroll, are ignored
  let pending = 0, lastH = innerHeight;
  const refit = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(fit); };
  new ResizeObserver(refit).observe(panel);
  addEventListener("resize", () => { if (Math.abs(innerHeight - lastH) > 120) { lastH = innerHeight; refit(); } });

  /* ---------- start ---------- */
  css.value = restore();
  markExperiment();
  $("#applied").textContent = css.value.trim() ? "Applied" : "Nothing yet";
  setWidth(WIDTHS[4]);
  const d0 = doc();                                      // the frame may have finished loading before this script ran
  if (d0 && d0.readyState === "complete" && d0.URL !== "about:blank") loaded();
})();
