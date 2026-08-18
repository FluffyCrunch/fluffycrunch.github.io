(() => {
  "use strict";

  /* ---------- Boot screen ---------- */
  const bootScreen = document.getElementById("boot-screen");
  const bootFill = document.getElementById("boot-bar-fill");
  const bootText = document.getElementById("boot-text");
  let progress = 0;
  const bootInterval = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(bootInterval);
      bootFill.style.width = "100%";
      bootText.textContent = "READY.";
      setTimeout(() => {
        bootScreen.classList.add("hidden");
        document.body.style.overflow = "";
        startHeroReveal();
      }, 350);
    } else {
      bootFill.style.width = progress + "%";
      bootText.textContent = "LOADING WORLD... " + Math.floor(progress) + "%";
    }
  }, 140);
  document.body.style.overflow = "hidden";
  // Safety: never trap the user if something goes wrong
  setTimeout(() => {
    bootScreen.classList.add("hidden");
    document.body.style.overflow = "";
  }, 4000);

  /* ---------- Custom cursor ---------- */
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (!isTouch) {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll("a, button, .game-card, .skill-card").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("active"));
    });
  } else {
    document.body.classList.add("no-custom-cursor");
  }

  /* ---------- Starfield / particle background canvas ---------- */
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let w, h, particles;
  const PARTICLE_COUNT = window.innerWidth < 700 ? 55 : 110;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function makeParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      tw: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.6 ? "168,224,200" : "123,92,255"
    }));
  }
  resize();
  makeParticles();
  window.addEventListener("resize", () => {
    resize();
    makeParticles();
  });

  let mouseX = w / 2, mouseY = h / 2;
  window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawFrame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      p.tw += 0.02;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glow = dist < 160 ? (160 - dist) / 160 : 0;

      const alpha = 0.25 + Math.sin(p.tw) * 0.2 + glow * 0.5;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.hue},${Math.min(alpha, 0.95)})`;
      ctx.arc(p.x, p.y, p.r + glow * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("site-header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navToggle.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );

  /* ---------- Hero line reveal ---------- */
  function startHeroReveal() {
    document.querySelectorAll(".hero-title .line").forEach((line, i) => {
      setTimeout(() => line.classList.add("in-view"), 150 + i * 180);
    });
    document.querySelectorAll("#hero .reveal-up").forEach((el, i) => {
      setTimeout(() => el.classList.add("in-view"), 500 + i * 130);
    });
    startTyping();
    animateCounters();
  }

  /* ---------- Typing effect ---------- */
  const typedEl = document.getElementById("typed-text");
  const phrases = ["playable HTML5 games.", "smooth game UI in React.", "real-time interactive systems.", "worlds people remember."];
  function startTyping() {
    let phraseIdx = 0, charIdx = 0, deleting = false;
    function tick() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        typedEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIdx--;
        typedEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  /* ---------- Counters ---------- */
  function animateCounters() {
    document.querySelectorAll(".stat-num").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      let cur = 0;
      const step = Math.max(1, target / 40);
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        el.textContent = Math.floor(cur);
      }, 30);
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  // stagger reveal-up elements based on their order within each section
  document.querySelectorAll("main > section:not(#hero)").forEach((section) => {
    section.querySelectorAll(".reveal-up").forEach((el, i) => {
      el.style.setProperty("--stagger", (i * 110) + "ms");
      revealObserver.observe(el);
    });
  });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById("scroll-progress");
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Render game cards ---------- */
  const grid = document.getElementById("games-grid");
  if (typeof GAMES !== "undefined") {
    GAMES.forEach((game, i) => {
      const card = document.createElement("article");
      card.className = "game-card";
      card.style.transitionDelay = (i * 100) + "ms";
      const coverInner = game.cover
        ? `<img src="${game.cover}" alt="${game.title} screenshot" loading="lazy">`
        : `<span>${game.emoji}</span>`;
      card.innerHTML = `
        <div class="game-cover" style="background:${game.gradient}">
          <span class="game-status">${game.status || "Playable"}</span>
          ${coverInner}
        </div>
        <div class="game-body">
          <h3>${game.title}</h3>
          <p class="game-tagline">${game.tagline}</p>
          <p class="game-desc">${game.description}</p>
          <div class="game-tags">${game.tags.map(t => `<span>${t}</span>`).join("")}</div>
          <a class="play-btn" href="${game.playUrl}" target="_blank" rel="noopener noreferrer">
            <span>${game.status === "View Source" ? "View Source" : "Play Now"}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>`;
      grid.appendChild(card);
      revealObserver.observe(card);

      // subtle 3D tilt on hover
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- About card tilt ---------- */
  const aboutCard = document.querySelector(".card-inner");
  if (aboutCard) {
    const wrap = document.querySelector(".about-card");
    wrap.addEventListener("mousemove", (e) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      aboutCard.style.transform = `rotateX(${-py * 8}deg) rotateY(${px * 10}deg)`;
    });
    wrap.addEventListener("mouseleave", () => { aboutCard.style.transform = ""; });
  }

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

})();
