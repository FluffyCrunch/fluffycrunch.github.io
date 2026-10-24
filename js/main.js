(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Sound (Web Audio, off by default) ---------- */
  const Sound = (() => {
    let ctx = null;
    let enabled = false;
    try { enabled = localStorage.getItem("fc-sound") === "1"; } catch (e) {}
    const btn = $("#sound-toggle");
    const sync = () => btn.setAttribute("aria-pressed", String(enabled));
    sync();

    function tone(freq, dur, type = "square", vol = 0.05, slideTo) {
      if (!enabled) return;
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    }
    const seq = (notes, step = 0.08) => notes.forEach((f, i) => setTimeout(() => tone(f, 0.14, "square", 0.045), i * step * 1000));

    const sfx = {
      hover: () => tone(880, 0.04, "square", 0.018),
      select: () => tone(440, 0.12, "square", 0.05, 880),
      coin: () => seq([988, 1319], 0.07),
      achievement: () => seq([523, 659, 784, 1047], 0.09),
      open: () => tone(220, 0.18, "triangle", 0.06, 660),
      close: () => tone(660, 0.14, "triangle", 0.05, 220),
      cheat: () => seq([392, 523, 659, 784, 659, 784, 1047], 0.07)
    };

    btn.addEventListener("click", () => {
      enabled = !enabled;
      try { localStorage.setItem("fc-sound", enabled ? "1" : "0"); } catch (e) {}
      sync();
      sfx.coin();
    });
    return { play: (name) => sfx[name] && sfx[name]() };
  })();

  /* ---------- Achievements ---------- */
  const ACHIEVEMENTS = {
    spotlight: { icon: "☠️", name: "Boss Spotted" },
    library: { icon: "🗂️", name: "Level Select" },
    inspect: { icon: "🔍", name: "Inspector" },
    play: { icon: "🎮", name: "Press Start" },
    skills: { icon: "🌳", name: "Skill Check" },
    quests: { icon: "📜", name: "Lore Hunter" },
    contact: { icon: "🪙", name: "Final Stage" },
    konami: { icon: "🕹️", name: "Cheat Code Entered" }
  };
  const unlocked = new Set();
  $("#ach-total").textContent = Object.keys(ACHIEVEMENTS).length;

  function unlock(id) {
    if (unlocked.has(id) || !ACHIEVEMENTS[id]) return;
    unlocked.add(id);
    $("#ach-count").textContent = unlocked.size;
    const a = ACHIEVEMENTS[id];
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="toast-ico">${a.icon}</span><div><small>ACHIEVEMENT UNLOCKED</small><b>${esc(a.name)}</b></div>`;
    $("#toast-stack").appendChild(t);
    Sound.play("achievement");
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------- Boot screen ---------- */
  const TIPS = [
    "TIP: Every game here is one click from playable.",
    "TIP: Turn on sound in the top bar for 8-bit SFX.",
    "TIP: Achievements unlock as you explore.",
    "TIP: Some games want your hand, not your mouse."
  ];
  const bootScreen = $("#boot-screen");
  const bootFill = $("#boot-bar-fill");
  const bootText = $("#boot-text");
  $("#boot-tip").textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  let booted = false;
  function finishBoot() {
    if (booted) return;
    booted = true;
    bootScreen.classList.add("hidden");
    document.body.style.overflow = "";
    startHero();
  }
  if (reduceMotion) {
    finishBoot();
  } else {
    document.body.style.overflow = "hidden";
    let progress = 0;
    const iv = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 20 + 8);
      bootFill.style.width = progress + "%";
      bootText.textContent = progress < 100 ? `LOADING ASSETS... ${Math.floor(progress)}%` : "PRESS START";
      if (progress >= 100) { clearInterval(iv); setTimeout(finishBoot, 380); }
    }, 120);
    setTimeout(finishBoot, 3500); // never trap the visitor
  }

  /* ---------- Cursor reticle ---------- */
  let lastHover = null;
  if (!isTouch && !reduceMotion) {
    document.body.classList.add("custom-cursor");
    const ret = $("#cursor-reticle");
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      rx += (mx - rx) * 0.25;
      ry += (my - ry) * 0.25;
      ret.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    const lockSel = "a, button, .game-card, [role=tab]";
    document.addEventListener("mouseover", (e) => {
      const hit = e.target.closest(lockSel);
      ret.classList.toggle("lock", !!hit);
      if (hit && hit !== lastHover) Sound.play("hover");
      lastHover = hit;
    });
  }

  /* ---------- Background: drifting stars + pixel bits ---------- */
  const canvas = $("#bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, DPR, stars = [], bits = [];
  let mouseX = 0.5, mouseY = 0.5;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = W < 700 ? 70 : 140;
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.9 + 0.1, tw: Math.random() * 6.28
    }));
    const colors = ["#8b5cf6", "#22d3ee", "#ec4899", "#facc15"];
    bits = Array.from({ length: W < 700 ? 8 : 16 }, () => ({
      x: Math.random() * W, y: Math.random() * H, s: Math.random() * 5 + 3,
      vy: -(Math.random() * 0.25 + 0.08), c: colors[(Math.random() * colors.length) | 0], a: Math.random() * 0.35 + 0.15
    }));
  }
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouseX = e.clientX / W; mouseY = e.clientY / H; });
  resize();
  let bgRunning = true;
  document.addEventListener("visibilitychange", () => {
    bgRunning = !document.hidden;
    if (bgRunning) requestAnimationFrame(drawBg);
  });
  function drawBg(t) {
    if (!bgRunning) return;
    ctx.clearRect(0, 0, W, H);
    const ox = (mouseX - 0.5) * 30, oy = (mouseY - 0.5) * 30;
    for (const s of stars) {
      s.y += s.z * 0.12;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      const a = 0.35 + Math.sin(t * 0.002 + s.tw) * 0.3;
      ctx.fillStyle = `rgba(220,215,255,${a * s.z})`;
      const sz = s.z * 1.8;
      ctx.fillRect(s.x + ox * s.z, s.y + oy * s.z, sz, sz);
    }
    for (const b of bits) {
      b.y += b.vy;
      if (b.y < -10) { b.y = H + 10; b.x = Math.random() * W; }
      ctx.globalAlpha = b.a;
      ctx.fillStyle = b.c;
      ctx.fillRect(Math.round(b.x - ox * 0.6), Math.round(b.y - oy * 0.6), b.s, b.s);
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(drawBg);
  }
  requestAnimationFrame(drawBg);

  /* ---------- Header, progress bar, active nav ---------- */
  const header = $("#site-header");
  const progressBar = $("#scroll-progress");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  }, { passive: true });

  const navLinks = $$(".nav-links a");
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => navObserver.observe(s));

  const navToggle = $("#nav-toggle");
  const navList = $("#nav-links");
  navToggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach((a) => a.addEventListener("click", () => {
    navList.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Hero ---------- */
  const TYPED = ["3D tower defense.", "match-3 puzzlers.", "hand-tracked games.", "shader toys.", "games in Unity."];
  function typeLoop() {
    const el = $("#typed-text");
    if (reduceMotion) { el.textContent = TYPED[0]; return; }
    let w = 0, i = 0, deleting = false;
    (function tick() {
      const word = TYPED[w];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 75;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % TYPED.length; delay = 300; }
      setTimeout(tick, delay);
    })();
  }

  function countUp(el) {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - start) / 1200);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  function startHero() {
    $$("[data-reveal]").forEach((el, i) => setTimeout(() => el.classList.add("in"), 120 + i * 160));
    typeLoop();
    setTimeout(() => { $("#xp-fill").style.width = "70%"; }, 600);
  }

  /* ---------- Attract mode (hero screen) ---------- */
  const slidesEl = $("#attract-slides");
  const dotsEl = $("#attract-dots");
  let attractIdx = 0, attractTimer = null;
  GAMES.forEach((g, i) => {
    const img = document.createElement("img");
    img.src = g.shots[0];
    img.alt = "";
    if (i > 1) img.loading = "lazy";
    slidesEl.appendChild(img);
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Show ${g.title}`);
    dot.addEventListener("click", () => { showAttract(i); restartAttract(); });
    dotsEl.appendChild(dot);
  });
  function showAttract(i) {
    attractIdx = (i + GAMES.length) % GAMES.length;
    const g = GAMES[attractIdx];
    $$("img", slidesEl).forEach((im, k) => im.classList.toggle("on", k === attractIdx));
    $$("button", dotsEl).forEach((d, k) => d.classList.toggle("on", k === attractIdx));
    $("#attract-title").textContent = g.title;
    $("#attract-genre").textContent = g.genre.toUpperCase() + " · " + g.engine.toUpperCase();
    $("#attract-count").textContent = String(attractIdx + 1).padStart(2, "0") + " / " + String(GAMES.length).padStart(2, "0");
    $("#attract-view").setAttribute("aria-label", `Open details for ${g.title}`);
  }
  function restartAttract() {
    clearInterval(attractTimer);
    if (!reduceMotion) attractTimer = setInterval(() => showAttract(attractIdx + 1), 4200);
  }
  $("#attract-view").addEventListener("click", () => openModal(GAMES[attractIdx]));
  showAttract(0);
  restartAttract();

  /* ---------- Featured gallery ---------- */
  const featured = GAMES.find((g) => g.featured);
  const featMain = $("#feat-main-img");
  featured.shots.forEach((src, i) => {
    const b = document.createElement("button");
    b.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
    b.setAttribute("aria-label", `Screenshot ${i + 1}`);
    if (i === 0) b.classList.add("on");
    b.addEventListener("click", () => {
      $$("#feat-thumbs button").forEach((x) => x.classList.toggle("on", x === b));
      featMain.style.opacity = 0;
      setTimeout(() => { featMain.src = src; featMain.style.opacity = 1; }, 180);
    });
    $("#feat-thumbs").appendChild(b);
  });

  /* ---------- Library ---------- */
  const grid = $("#games-grid");
  function cardHTML(g) {
    const live = !!g.playUrl;
    const primary = live
      ? `<a class="btn btn-primary btn-sm" href="${g.playUrl}" target="_blank" rel="noopener noreferrer" data-play><span>▶ Play</span></a>`
      : `<a class="btn btn-primary btn-sm" href="${g.sourceUrl}" target="_blank" rel="noopener noreferrer"><span>&lt;/&gt; Source</span></a>`;
    return `
      <button class="gc-cover" data-open="${g.id}" aria-label="Details for ${esc(g.title)}">
        <img src="${g.shots[0]}" alt="${esc(g.title)} screenshot" loading="lazy">
        <span class="gc-genre">${esc(g.genre.toUpperCase())}</span>
        <span class="gc-status ${live ? "live" : "src"}">${live ? "● Playable" : "Source"}</span>
        <span class="gc-play"><span>${live ? "▶" : "i"}</span></span>
      </button>
      <div class="gc-body">
        <h3>${esc(g.title)}</h3>
        <p class="gc-tagline">${esc(g.tagline)}</p>
        <p class="gc-desc">${esc(g.description)}</p>
        <div class="tags">${g.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <div class="gc-actions">
          ${primary}
          <button class="btn btn-ghost btn-sm" data-open="${g.id}"><span>Details</span></button>
        </div>
      </div>`;
  }
  GAMES.forEach((g) => {
    const card = document.createElement("article");
    card.className = "game-card reveal-up";
    card.dataset.filters = g.filters.join(" ");
    card.style.setProperty("--acc", g.accent);
    card.innerHTML = cardHTML(g);
    grid.appendChild(card);

    if (!isTouch && !reduceMotion) {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    }
  });

  const filterBar = $("#filter-bar");
  GAME_FILTERS.forEach((f, i) => {
    const count = f.id === "all" ? GAMES.length : GAMES.filter((g) => g.filters.includes(f.id)).length;
    if (!count) return;
    const b = document.createElement("button");
    b.className = "filter-btn";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(i === 0));
    b.dataset.filter = f.id;
    b.innerHTML = `${esc(f.label)}<span class="n">${count}</span>`;
    filterBar.appendChild(b);
  });
  filterBar.addEventListener("click", (e) => {
    const b = e.target.closest(".filter-btn");
    if (!b) return;
    Sound.play("select");
    $$(".filter-btn", filterBar).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    const f = b.dataset.filter;
    $$(".game-card", grid).forEach((card) => {
      const show = f === "all" || card.dataset.filters.split(" ").includes(f);
      card.classList.toggle("hide", !show);
      card.classList.remove("pop");
      if (show) { void card.offsetWidth; card.classList.add("pop"); }
    });
  });

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) {
      const g = GAMES.find((x) => x.id === opener.dataset.open);
      if (g) openModal(g);
    }
    if (e.target.closest("[data-play], a[href*='netlify.app']")) {
      Sound.play("select");
      unlock("play");
    }
    const sfx = e.target.closest("[data-sfx]");
    if (sfx) Sound.play(sfx.dataset.sfx);
  });

  /* ---------- Skill pips ---------- */
  $$(".pips").forEach((p) => {
    const lv = +p.dataset.lv;
    const grow = p.hasAttribute("data-grow");
    p.setAttribute("role", "img");
    p.setAttribute("aria-label", `${lv} out of 5${grow ? ", leveling up" : ""}`);
    for (let i = 0; i < 5; i++) {
      const pip = document.createElement("i");
      p.appendChild(pip);
    }
  });
  function fillPips(branch) {
    $$(".pips", branch).forEach((p) => {
      const lv = +p.dataset.lv;
      const grow = p.hasAttribute("data-grow");
      $$("i", p).forEach((pip, i) => {
        setTimeout(() => {
          if (i < lv) pip.classList.add("on");
          else if (grow && i === lv) pip.classList.add("grow");
        }, reduceMotion ? 0 : i * 110);
      });
    });
  }

  /* ---------- Modal ---------- */
  const modal = $("#game-modal");
  let lastFocus = null;
  function setModalShot(src) {
    $("#modal-img").src = src;
    $$("#modal-thumbs button").forEach((b) => b.classList.toggle("on", b.dataset.src === src));
  }
  function openModal(g) {
    lastFocus = document.activeElement;
    $("#modal-genre").textContent = g.genre.toUpperCase();
    $("#modal-title").textContent = g.title;
    $("#modal-tagline").textContent = g.tagline;
    $("#modal-engine").textContent = g.engine;
    $("#modal-platform").textContent = g.platform;
    $("#modal-desc").textContent = g.description;
    $("#modal-img").alt = `${g.title} screenshot`;
    $("#modal-features").innerHTML = g.features.map((f) => `<li><span>▸</span>${esc(f)}</li>`).join("");
    $("#modal-controls-wrap").hidden = !g.controls || !g.controls.length;
    $("#modal-controls").innerHTML = (g.controls || []).map(([k, a]) => `<div><kbd>${esc(k)}</kbd>${esc(a)}</div>`).join("");
    $("#modal-tags").innerHTML = g.tags.map((t) => `<span>${esc(t)}</span>`).join("");
    const thumbs = $("#modal-thumbs");
    thumbs.innerHTML = g.shots.length > 1
      ? g.shots.map((s, i) => `<button data-src="${s}" aria-label="Screenshot ${i + 1}"><img src="${s}" alt=""></button>`).join("")
      : "";
    $$("button", thumbs).forEach((b) => b.addEventListener("click", () => setModalShot(b.dataset.src)));
    setModalShot(g.shots[0]);
    $("#modal-cta").innerHTML =
      (g.playUrl ? `<a class="btn btn-primary" href="${g.playUrl}" target="_blank" rel="noopener noreferrer" data-play><span>▶ Play Now</span></a>` : "") +
      `<a class="btn btn-ghost" href="${g.sourceUrl}" target="_blank" rel="noopener noreferrer"><span>&lt;/&gt; View Source</span></a>`;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    $(".modal-close", modal).focus();
    Sound.play("open");
    unlock("inspect");
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    Sound.play("close");
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      const f = $$("a[href], button:not([disabled])", modal).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Scroll reveals + section achievements ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      if (el.classList.contains("tree-branch")) fillPips(el);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal-up").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    revealObserver.observe(el);
  });

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".stat-num", en.target).forEach(countUp);
      statsObserver.unobserve(en.target);
    });
  }, { threshold: 0.4 });
  statsObserver.observe($(".hero-stats"));

  const achObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting || !booted) return;
      unlock(en.target.dataset.achievement);
      achObserver.unobserve(en.target);
    });
  }, { threshold: 0.35 });
  $$("[data-achievement]").forEach((s) => achObserver.observe(s));

  /* ---------- Konami code ---------- */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kPos = 0;
  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kPos = key === KONAMI[kPos] ? kPos + 1 : (key === KONAMI[0] ? 1 : 0);
    if (kPos === KONAMI.length) {
      kPos = 0;
      document.body.classList.toggle("cheat");
      Sound.play("cheat");
      unlock("konami");
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();
