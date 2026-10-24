(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const animate = !!(gsap && ScrollTrigger) && !reduceMotion;
  if (animate) gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------- Helpers ---------- */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((ch) => ch === " " ? " " : `<span class="char" aria-hidden="true">${esc(ch)}</span>`).join("");
    return $$(".char", el);
  }
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
    return $$(".w", el);
  }
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- Hero: 3D wall of game screenshots ---------- */
  const wallPlane = $("#wall-plane");
  const SHOTS = GAMES.flatMap((g) => g.shots);
  const COLS = window.innerWidth < 700 ? 4 : 6;
  for (let c = 0; c < COLS; c++) {
    const col = document.createElement("div");
    col.className = "wall-col";
    const picks = Array.from({ length: 6 }, (_, k) => SHOTS[(c * 5 + k * 3) % SHOTS.length]);
    const figs = picks.map((src) => `<figure><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`).join("");
    col.innerHTML = `<div class="wall-track" style="--dur:${55 + c * 9}s">${figs}${figs}</div>`;
    wallPlane.appendChild(col);
  }
  // Pause the wall's CSS animation while the hero is off screen
  new IntersectionObserver(([en]) => {
    $$(".wall-track", wallPlane).forEach((t) => { t.style.animationPlayState = en.isIntersecting ? "running" : "paused"; });
  }).observe($("#hero"));

  /* ---------- Render: game cards ---------- */
  const track = $("#work-track");
  GAMES.forEach((g, i) => {
    const live = !!g.playUrl;
    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--acc", g.accent);
    card.innerHTML = `
      <button class="card-media" data-open="${g.id}" data-cursor="View" aria-label="Details for ${esc(g.title)}">
        <img src="${g.shots[0]}" alt="${esc(g.title)} screenshot" loading="lazy" draggable="false">
        <span class="card-badges">
          <span>${esc(g.genre)}</span>
          <span class="${live ? "is-live" : ""}">${live ? "● Playable" : "Source"}</span>
        </span>
      </button>
      <div class="card-body">
        <div class="card-top">
          <span class="card-num">${String(i + 1).padStart(2, "0")} / ${String(GAMES.length).padStart(2, "0")}</span>
          <span class="card-engine">${esc(g.engine)}</span>
        </div>
        <h3>${esc(g.title)}</h3>
        <p class="card-tagline">${esc(g.tagline)}</p>
        <p class="card-desc">${esc(g.description)}</p>
        <div class="card-actions">
          ${live
            ? `<a class="btn btn-light" href="${g.playUrl}" target="_blank" rel="noopener noreferrer" data-cursor="Play"><span>Play</span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>`
            : `<a class="btn btn-light" href="${g.sourceUrl}" target="_blank" rel="noopener noreferrer" data-cursor="Code"><span>Source</span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg></a>`}
          <button class="btn btn-glass" data-open="${g.id}"><span>Details</span></button>
        </div>
      </div>`;
    track.appendChild(card);
  });
  const endCard = document.createElement("a");
  endCard.className = "card-end";
  endCard.href = "https://github.com/FluffyCrunch";
  endCard.target = "_blank";
  endCard.rel = "noopener noreferrer";
  endCard.innerHTML = `<b>More on GitHub</b><span>Source code, experiments and whatever I'm building next.</span><i>→</i>`;
  track.appendChild(endCard);

  /* ---------- Render: skill meters ---------- */
  $$(".pips").forEach((p) => {
    const lv = +p.dataset.lv;
    const grow = p.hasAttribute("data-grow");
    p.setAttribute("role", "img");
    p.setAttribute("aria-label", `${lv} out of 5${grow ? ", leveling up" : ""}`);
    p.innerHTML = "<i></i>".repeat(5);
  });
  function fillPips(scope) {
    $$(".pips", scope).forEach((p) => {
      const lv = +p.dataset.lv;
      const grow = p.hasAttribute("data-grow");
      $$("i", p).forEach((pip, i) => {
        setTimeout(() => {
          if (i < lv) pip.classList.add("on");
          else if (grow && i === lv) pip.classList.add("grow");
        }, animate ? 150 + i * 120 : 0);
      });
    });
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (animate && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
  });

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const burger = $("#nav-burger");
  const navLinks = $("#nav-links");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("is-hidden", y > lastY && y > 300 && !navLinks.classList.contains("open"));
    lastY = y;
  }, { passive: true });
  function closeMenu() {
    navLinks.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.remove("is-hidden");
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$("a", navLinks).forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["work", "skills", "about", "contact"].forEach((id) => navObs.observe(document.getElementById(id)));

  /* ---------- Cursor, magnetic buttons, wall tilt ---------- */
  if (finePointer && animate) {
    document.body.classList.add("has-cursor");
    const cursor = $("#cursor");
    const label = $("#cursor-label");
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener("pointerover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      const hover = e.target.closest("a, button");
      cursor.classList.toggle("is-label", !!labelled);
      cursor.classList.toggle("is-hover", !labelled && !!hover);
      label.textContent = labelled ? labelled.dataset.cursor : "";
    });

    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.3);
        my((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });

    // The wall leans toward the mouse
    const tilt = { rx: 32, ry: 0 };
    const set = () => { wallPlane.style.setProperty("--rx", tilt.rx + "deg"); wallPlane.style.setProperty("--ry", tilt.ry + "deg"); };
    $("#hero").addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      gsap.to(tilt, { rx: 32 - ny * 8, ry: nx * 10, duration: 1.4, ease: "power3.out", overwrite: true, onUpdate: set });
    });
  }

  /* ---------- Bento spotlight glow ---------- */
  $$(".bento-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    const target = +el.dataset.count;
    if (!animate) { el.textContent = target; return; }
    const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(obj.v); } });
  }

  /* ---------- Static fallback (no GSAP or reduced motion) ---------- */
  if (!animate) {
    $("#preloader")?.remove();
    $(".manifesto").classList.add("static");
    $$(".stat-num").forEach(countUp);
    fillPips(document);
  }

  /* ---------- Preloader → hero intro ---------- */
  const heroChars = $$(".hero-title .split").flatMap(splitChars);
  const spotChars = splitChars($(".spot-title .split"));
  const contactChars = $$(".contact-title .split").flatMap(splitChars);

  function heroIntro() {
    return gsap.timeline()
      .fromTo(".wall", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 2.2, ease: "expo.out" }, 0)
      .from(heroChars, { yPercent: 115, rotate: 6, duration: 1.3, ease: "expo.out", stagger: 0.045 }, 0.1)
      .from(".hero-top > *", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.3)
      .from("#hero .reveal", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, 0.45)
      .from(".scroll-cue", { opacity: 0, duration: 0.8 }, 0.8);
  }

  function runPreloader() {
    const count = $("#pl-count");
    const bar = $("#pl-bar");
    const state = { p: 0 };
    let loaded = document.readyState === "complete";
    window.addEventListener("load", () => { loaded = true; });
    const intro = heroIntro().pause(0); // sets start states while the preloader covers the page
    const tl = gsap.timeline();
    tl.to(state, {
      p: 100, duration: 1.8, ease: "power2.inOut",
      onUpdate: () => {
        const v = loaded ? state.p : Math.min(state.p, 90);
        count.textContent = String(Math.round(v)).padStart(3, "0");
        bar.style.width = v + "%";
      }
    });
    tl.to("#preloader .pl-inner", { yPercent: -30, opacity: 0, duration: 0.7, ease: "power3.in" }, "+=0.1");
    tl.to("#preloader", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.3");
    tl.add(() => intro.play(0), "-=0.55");
    tl.add(() => $("#preloader").remove());
  }

  /* ---------- Scroll scenes ---------- */
  function scrollScenes() {
    $$(".reveal").filter((el) => !el.closest("#hero")).forEach((el) => {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    // Hero: title drifts apart, the wall dives toward the camera
    const heroST = { trigger: "#hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".ht-line:first-child", { xPercent: -8, ease: "none", scrollTrigger: heroST });
    gsap.to(".ht-right", { xPercent: 8, ease: "none", scrollTrigger: { ...heroST } });
    gsap.to(".hero-bottom, .hero-top", { opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: "#hero", start: "20% top", end: "70% top", scrub: true } });
    gsap.to(".wall-plane", { "--s": 1.45, ease: "none", scrollTrigger: { ...heroST } });
    gsap.to(".wall", { opacity: 0.25, ease: "none", scrollTrigger: { ...heroST } });

    // Manifesto words light up as you scroll
    const words = splitWords($("#manifesto"));
    gsap.to(words, { opacity: 1, stagger: 0.12, ease: "none", scrollTrigger: { trigger: "#manifesto", start: "top 78%", end: "bottom 42%", scrub: 0.6 } });

    $$(".stat-num").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => countUp(el) });
    });
    ScrollTrigger.create({ trigger: "#bento", start: "top 75%", once: true, onEnter: () => fillPips($("#bento")) });

    gsap.timeline({ scrollTrigger: { trigger: ".contact-title", start: "top 85%", once: true } })
      .from(contactChars, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.02 })
      .from(".ct-grad", { yPercent: 110, duration: 1.2, ease: "expo.out" }, 0.25);

    const mm = gsap.matchMedia();

    // Desktop: cinematic spotlight + horizontal gallery
    mm.add("(min-width: 901px)", () => {
      gsap.timeline({ scrollTrigger: { trigger: ".spot-pin", start: "top top", end: "+=160%", pin: true, scrub: 1, anticipatePin: 1 } })
        .fromTo("#spot-media", { clipPath: "inset(22% 26% 22% 26% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 })
        .fromTo("#spot-media img", { scale: 1.35 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(".spot-shade", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.4)
        .from(spotChars, { yPercent: 110, stagger: 0.03, duration: 0.5, ease: "power3.out" }, 0.55)
        .from(".spot-head .eyebrow", { opacity: 0, y: 20, duration: 0.4 }, 0.6)
        .from("#spot-panel", { y: 80, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.75)
        .to({}, { duration: 0.35 });

      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const work = gsap.to(track, {
        x: () => -getDistance(), ease: "none",
        scrollTrigger: {
          trigger: "#work", start: () => window.innerHeight >= $("#work").offsetHeight ? "bottom bottom" : "top top", end: () => "+=" + getDistance(),
          pin: "#work", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { $("#work-progress").style.width = self.progress * 100 + "%"; }
        }
      });
      $$(".card", track).forEach((card) => {
        gsap.fromTo(card, { rotateY: -8, opacity: 0.4 }, {
          rotateY: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: work, start: "left 100%", end: "left 55%", scrub: true }
        });
      });
    });

    mm.add("(max-width: 900px)", () => {
      gsap.from(spotChars, { yPercent: 110, stagger: 0.03, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".spot-title", start: "top 85%", once: true } });
      gsap.from(["#spot-media", "#spot-panel"], { y: 50, opacity: 0, duration: 1.1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: "#spot-media", start: "top 88%", once: true } });
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (animate) {
    scrollScenes();
    runPreloader();
  }

  /* ---------- Details panel ---------- */
  const panel = $("#panel");
  let lastFocus = null;
  function setShot(src) {
    $("#panel-img").src = src;
    $$("#panel-thumbs button").forEach((b) => b.classList.toggle("on", b.dataset.src === src));
  }
  function openPanel(g) {
    lastFocus = document.activeElement;
    $("#panel-genre").textContent = `${g.genre} · ${g.platform}`;
    $("#panel-title").textContent = g.title;
    $("#panel-tagline").textContent = g.tagline;
    $("#panel-engine").textContent = g.engine;
    $("#panel-platform").textContent = g.platform;
    $("#panel-desc").textContent = g.description;
    $("#panel-img").alt = `${g.title} screenshot`;
    $("#panel-features").innerHTML = g.features.map((f) => `<li>${esc(f)}</li>`).join("");
    $("#panel-controls-wrap").hidden = !(g.controls && g.controls.length);
    $("#panel-controls").innerHTML = (g.controls || []).map(([k, a]) => `<div><kbd>${esc(k)}</kbd>${esc(a)}</div>`).join("");
    $("#panel-tags").innerHTML = g.tags.map((t) => `<span>${esc(t)}</span>`).join("");
    const thumbs = $("#panel-thumbs");
    thumbs.innerHTML = g.shots.length > 1
      ? g.shots.map((s, i) => `<button data-src="${s}" aria-label="Screenshot ${i + 1}"><img src="${s}" alt=""></button>`).join("")
      : "";
    $$("button", thumbs).forEach((b) => b.addEventListener("click", () => setShot(b.dataset.src)));
    setShot(g.shots[0]);
    const arrow = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>`;
    $("#panel-actions").innerHTML =
      (g.playUrl ? `<a class="btn btn-grad" href="${g.playUrl}" target="_blank" rel="noopener noreferrer"><span>Play now</span>${arrow}</a>` : "") +
      `<a class="btn btn-glass" href="${g.sourceUrl}" target="_blank" rel="noopener noreferrer"><span>View source</span>${arrow}</a>`;
    panel.classList.remove("closing");
    panel.hidden = false;
    $(".panel-sheet", panel).scrollTop = 0;
    document.body.classList.add("panel-open");
    if (lenis) lenis.stop();
    $(".panel-close", panel).focus();
  }
  function closePanel() {
    if (panel.hidden || panel.classList.contains("closing")) return;
    panel.classList.add("closing");
    setTimeout(() => {
      panel.hidden = true;
      panel.classList.remove("closing");
      document.body.classList.remove("panel-open");
      if (lenis) lenis.start();
      if (lastFocus) lastFocus.focus();
    }, reduceMotion ? 0 : 450);
  }
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) {
      const g = GAMES.find((x) => x.id === opener.dataset.open);
      if (g) openPanel(g);
    }
    if (e.target.closest("[data-close]")) closePanel();
  });
  document.addEventListener("keydown", (e) => {
    if (panel.hidden) return;
    if (e.key === "Escape") closePanel();
    if (e.key === "Tab") {
      const f = $$("a[href], button:not([disabled])", panel).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Konami code ---------- */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kPos = 0;
  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kPos = key === KONAMI[kPos] ? kPos + 1 : (key === KONAMI[0] ? 1 : 0);
    if (kPos === KONAMI.length) {
      kPos = 0;
      const on = document.body.classList.toggle("cheat");
      toast(on ? "🎮 Cheat mode on" : "Cheat mode off");
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();
