/* ==========================================================================
   LUNARA — Canvas Atmosphere, Water Reflection & Text Reveal Helpers
   ========================================================================== */

(function () {
  "use strict";

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const LunaraState = {
    reducedMotion: reducedMotionQuery.matches,
    starOpacity: 0.9,
    starParallaxY: 0,
    fireflyActivity: 0,
    particleActivity: 0.45,
    particleIntensity: 1,
    lakeReflection: {
      active: 0,
      scrollProgress: 0,
      moonX: 0.5,
      brightness: 1,
    },
  };

  function isReducedMotion() {
    return reducedMotionQuery.matches;
  }

  function splitTextWords() {
    const elements = document.querySelectorAll(".js-reveal-words");
    elements.forEach((el) => {
      if (el.dataset.wordsSplit === "true") return;
      const rawText = el.textContent.replace(/\s+/g, " ").trim();
      const words = rawText.split(" ");
      el.textContent = "";

      words.forEach((word, index) => {
        const span = document.createElement("span");
        span.className = "reveal-word";
        span.textContent = word;
        el.appendChild(span);
        if (index < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });

      el.dataset.wordsSplit = "true";
    });
  }

  function setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const state = { width: 0, height: 0, dpr: 1 };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = Math.max(1, Math.floor(rect.width || window.innerWidth));
      state.height = Math.max(1, Math.floor(rect.height || window.innerHeight));
      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    }

    resize();
    return { ctx, state, resize };
  }

  function initStarfield() {
    const canvas = document.getElementById("starfield-canvas");
    const setup = setupCanvas(canvas);
    if (!setup) return null;

    const { ctx, state, resize } = setup;
    const starCount = window.innerWidth < 768 ? 85 : 145;
    const stars = Array.from({ length: starCount }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      radius: i % 9 === 0 ? 1.85 : Math.random() * 1.15 + 0.4,
      baseAlpha: Math.random() * 0.55 + 0.3,
      speed: Math.random() * 1.4 + 0.5,
      phase: Math.random() * Math.PI * 2,
      tint: i % 5 === 0 ? "220, 230, 245" : i % 7 === 0 ? "142, 170, 203" : "245, 247, 255",
    }));

    function draw(time) {
      ctx.clearRect(0, 0, state.width, state.height);
      const t = time * 0.001;
      const globalAlpha = LunaraState.starOpacity;
      if (globalAlpha <= 0.01) return;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = isReducedMotion()
          ? 0.82
          : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        const alpha = s.baseAlpha * twinkle * globalAlpha;
        const px = s.x * state.width;
        const py = ((s.y * state.height + LunaraState.starParallaxY) % state.height + state.height) % state.height;

        ctx.fillStyle = `rgba(${s.tint}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fill();

        if (s.radius > 1.55) {
          ctx.fillStyle = `rgba(${s.tint}, ${(alpha * 0.22).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, s.radius * 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    return { draw, resize };
  }

  function initFireflies() {
    const canvas = document.getElementById("fireflies-canvas");
    const setup = setupCanvas(canvas);
    if (!setup) return null;

    const { ctx, state, resize } = setup;
    const count = window.innerWidth < 768 ? 26 : 46;
    const flies = Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      y: 0.24 + Math.random() * 0.68,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: -(Math.random() * 0.00014 + 0.00005),
      size: Math.random() * 2.2 + 1.4,
      phase: Math.random() * Math.PI * 2,
      driftFreq: Math.random() * 1.1 + 0.6,
      color: i % 3 === 0 ? "245, 247, 255" : i % 2 === 0 ? "220, 230, 245" : "142, 170, 203",
    }));

    function draw(time) {
      ctx.clearRect(0, 0, state.width, state.height);
      const activity = LunaraState.fireflyActivity;
      if (activity <= 0.02) return;

      const t = time * 0.001;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < flies.length; i++) {
        const f = flies[i];
        if (!isReducedMotion()) {
          f.x += f.vx + Math.sin(t * f.driftFreq + f.phase) * 0.00014;
          f.y += f.vy;
          if (f.y < 0.18) f.y = 0.92;
          if (f.x < 0.02) f.x = 0.98;
          if (f.x > 0.98) f.x = 0.02;
        }

        const pulse = isReducedMotion()
          ? 0.75
          : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.1 + f.phase));
        const alpha = pulse * activity * 0.85;
        const px = f.x * state.width;
        const py = f.y * state.height;
        const glowRadius = f.size * 7.5;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        grad.addColorStop(0, `rgba(${f.color}, ${alpha.toFixed(3)})`);
        grad.addColorStop(0.35, `rgba(${f.color}, ${(alpha * 0.38).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${f.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    return { draw, resize };
  }

  function initLakeReflection() {
    const canvas = document.getElementById("lake-reflection-canvas");
    const setup = setupCanvas(canvas);
    if (!setup) return null;

    const { ctx, state, resize } = setup;

    function draw(time) {
      ctx.clearRect(0, 0, state.width, state.height);
      const refl = LunaraState.lakeReflection;
      if (refl.active <= 0.02) return;

      const t = isReducedMotion() ? 0 : time * 0.0014;
      const w = state.width;
      const h = state.height;
      const horizonY = h * 0.54;
      const waterHeight = h - horizonY;
      const centerX = w * (refl.moonX + (refl.scrollProgress - 0.5) * 0.04);
      const baseWidth = Math.min(w * 0.24, 240);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Soft reflected moon orb haze right beneath the horizon
      const orbY = horizonY + waterHeight * (0.18 + refl.scrollProgress * 0.08);
      const orbGlow = ctx.createRadialGradient(
        centerX,
        orbY,
        4,
        centerX,
        orbY,
        baseWidth * 0.85
      );
      orbGlow.addColorStop(0, `rgba(245, 247, 255, ${(0.28 * refl.active * refl.brightness).toFixed(3)})`);
      orbGlow.addColorStop(0.45, `rgba(142, 170, 203, ${(0.16 * refl.active).toFixed(3)})`);
      orbGlow.addColorStop(1, "rgba(16, 26, 50, 0)");
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.ellipse(centerX, orbY, baseWidth * 0.95, waterHeight * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shimmering horizontal moonlit water ripple bands synchronized to scroll progress
      const bands = window.innerWidth < 768 ? 28 : 42;
      for (let i = 0; i < bands; i++) {
        const depth = i / bands;
        const y = horizonY + 8 + depth * (waterHeight * 0.82);
        const wave = Math.sin(t * 2.1 + i * 0.75 + refl.scrollProgress * 12.0);
        const shimmer = 0.5 + 0.5 * Math.cos(t * 1.5 - i * 0.55 + refl.scrollProgress * 9.0);
        const bandWidth = baseWidth * (0.28 + depth * 0.82) * (0.68 + 0.32 * shimmer);
        const offsetX = wave * (4 + depth * 18);
        const bandThickness = 1.2 + depth * 2.4;
        const alpha = (1 - depth * 0.72) * (0.14 + shimmer * 0.28) * refl.active * refl.brightness;

        const grad = ctx.createLinearGradient(
          centerX + offsetX - bandWidth,
          y,
          centerX + offsetX + bandWidth,
          y
        );
        grad.addColorStop(0, "rgba(142, 170, 203, 0)");
        grad.addColorStop(0.3, `rgba(220, 230, 245, ${(alpha * 0.65).toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(245, 247, 255, ${alpha.toFixed(3)})`);
        grad.addColorStop(0.7, `rgba(220, 230, 245, ${(alpha * 0.65).toFixed(3)})`);
        grad.addColorStop(1, "rgba(142, 170, 203, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(
          centerX + offsetX - bandWidth,
          y,
          bandWidth * 2,
          bandThickness
        );
      }

      // Organic shimmering water wavelets & moonlit glint bars (replaces geometric outlines)
      const glintCount = window.innerWidth < 768 ? 14 : 22;
      for (let r = 0; r < glintCount; r++) {
        const depth = (r + 0.5) / glintCount;
        const gy = horizonY + 12 + depth * (waterHeight * 0.78);
        const drift = Math.sin(t * 1.8 + r * 1.7 + refl.scrollProgress * 10.0) * (12 + depth * 36);
        const span = baseWidth * (0.16 + depth * 0.42);
        const gx = centerX + drift;
        const gAlpha = (1 - depth * 0.68) * (0.12 + 0.16 * Math.sin(t * 2.4 + r)) * refl.active * refl.brightness;

        const wGrad = ctx.createLinearGradient(gx - span, gy, gx + span, gy);
        wGrad.addColorStop(0, "rgba(220, 230, 245, 0)");
        wGrad.addColorStop(0.5, `rgba(245, 247, 255, ${Math.max(0, gAlpha).toFixed(3)})`);
        wGrad.addColorStop(1, "rgba(220, 230, 245, 0)");

        ctx.fillStyle = wGrad;
        ctx.fillRect(gx - span, gy, span * 2, 1.4 + depth * 1.4);
      }

      ctx.restore();
    }

    return { draw, resize };
  }

  function initAmbientParticles() {
    const canvas = document.getElementById("particles-canvas");
    const setup = setupCanvas(canvas);
    if (!setup) return null;

    const { ctx, state, resize } = setup;
    const count = window.innerWidth < 768 ? 30 : 56;
    const motes = Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.8 + 0.7,
      speedY: -(Math.random() * 0.00022 + 0.00008),
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.5 + 0.22,
      tint: i % 4 === 0 ? "245, 247, 255" : "220, 230, 245",
    }));

    function draw(time) {
      ctx.clearRect(0, 0, state.width, state.height);
      const activity = LunaraState.particleActivity;
      if (activity <= 0.02) return;

      const t = time * 0.001;
      const intensity = LunaraState.particleIntensity;

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        if (!isReducedMotion()) {
          m.y += m.speedY * intensity;
          m.x += Math.sin(t * 0.7 + m.phase) * 0.00012;
          if (m.y < -0.04) m.y = 1.04;
          if (m.x < -0.04) m.x = 1.04;
          if (m.x > 1.04) m.x = -0.04;
        }

        const twinkle = isReducedMotion() ? 0.75 : 0.45 + 0.55 * Math.sin(t * 1.4 + m.phase);
        const alpha = m.alpha * twinkle * activity;
        const px = m.x * state.width;
        const py = m.y * state.height;

        ctx.fillStyle = `rgba(${m.tint}, ${Math.min(1, alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, m.size * (0.9 + intensity * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return { draw, resize };
  }

  function startRenderLoop(engines) {
    let rafId = null;

    function frame(time) {
      for (let i = 0; i < engines.length; i++) {
        if (engines[i]) engines[i].draw(time);
      }
      if (!isReducedMotion()) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    function refresh() {
      for (let i = 0; i < engines.length; i++) {
        if (engines[i]) engines[i].resize();
      }
      if (isReducedMotion()) {
        frame(performance.now());
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    if (isReducedMotion()) {
      frame(0);
    } else {
      rafId = window.requestAnimationFrame(frame);
    }

    reducedMotionQuery.addEventListener("change", () => {
      LunaraState.reducedMotion = isReducedMotion();
      if (isReducedMotion() && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      refresh();
    });

    window.addEventListener("resize", refresh, { passive: true });
    return { refresh };
  }

  function playHeroEntrance() {
    if (typeof window.gsap === "undefined" || isReducedMotion()) {
      const elements = document.querySelectorAll("#stage-moon-inner, .hero-title, .hero-subtitle, .scroll-cue");
      elements.forEach((el) => {
        el.style.opacity = "1";
        el.style.filter = "none";
      });
      return;
    }

    const tl = window.gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      "#stage-moon-inner",
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 1.9, ease: "power2.out" },
      0
    )
      .fromTo(
        "#hero-title",
        { opacity: 0, filter: "blur(18px)", y: 18 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.5 },
        0.25
      )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 1.15 },
        0.75
      )
      .fromTo(
        "#scroll-cue",
        { opacity: 0, y: 12 },
        { opacity: 0.9, y: 0, duration: 1.0 },
        1.05
      );
  }

  window.LunaraAnimations = {
    state: LunaraState,
    splitTextWords,
    playHeroEntrance,
    init() {
      splitTextWords();
      const engines = [
        initStarfield(),
        initFireflies(),
        initLakeReflection(),
        initAmbientParticles(),
      ];
      return startRenderLoop(engines);
    },
  };
})();
