/* ==========================================================================
   LUNARA — Application Entry, Preloader & Navigation Interactions
   ========================================================================== */

(function () {
  "use strict";

  const CRITICAL_ASSETS = [
    "assets/images/moon.png",
    "assets/images/clouds.png",
    "assets/images/mountains.png",
    "assets/images/forest.png",
    "assets/images/stars.png",
  ];

  const LAZY_WARMUP_ASSETS = [
    "assets/backgrounds/distant-mountains.png",
    "assets/backgrounds/enchanted-path.png",
    "assets/backgrounds/forest-foreground.png",
    "assets/backgrounds/mist-fog.png",
    "assets/images/lake.png",
    "assets/backgrounds/horizon-glow.png",
  ];

  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(resolve);
        } else {
          resolve();
        }
      };
      img.onerror = resolve;
      img.src = src;
    });
  }

  function warmRemainingAssets() {
    const warm = () => {
      LAZY_WARMUP_ASSETS.forEach((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(warm, { timeout: 2000 });
    } else {
      window.setTimeout(warm, 800);
    }
  }

  async function runPreloader() {
    const preloader = document.getElementById("preloader");
    const fill = document.getElementById("preloader-fill");
    let loaded = 0;

    const tasks = CRITICAL_ASSETS.map((src) =>
      preloadImage(src).then(() => {
        loaded += 1;
        if (fill) {
          const pct = Math.min(100, Math.round((loaded / CRITICAL_ASSETS.length) * 100));
          fill.style.width = `${Math.max(20, pct)}%`;
        }
      })
    );

    const safetyTimeout = new Promise((resolve) => window.setTimeout(resolve, 2600));
    await Promise.race([Promise.all(tasks), safetyTimeout]);

    if (fill) fill.style.width = "100%";

    document.body.classList.remove("is-loading");
    if (preloader) {
      preloader.classList.add("is-done");
      window.setTimeout(() => {
        preloader.setAttribute("aria-hidden", "true");
      }, 900);
    }
  }

  function bindNavigation() {
    const scrollCue = document.getElementById("scroll-cue");
    if (scrollCue) {
      scrollCue.addEventListener("click", (event) => {
        event.preventDefault();
        window.LunaraScroll.scrollToSection("#section-whisper");
      });
    }

    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        window.LunaraScroll.scrollToTop();
      });
    }

    const chapterLinks = document.querySelectorAll(".chapter-dot");
    chapterLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = link.getAttribute("href");
        if (targetId === "#section-beginning") {
          window.LunaraScroll.scrollToTop();
        } else if (targetId) {
          window.LunaraScroll.scrollToSection(targetId);
        }
      });
    });
  }

  async function initApp() {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Wait briefly for web fonts + critical hero layers
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    await Promise.all([runPreloader(), fontsReady]);

    if (window.LunaraAnimations) {
      window.LunaraAnimations.init();
      window.LunaraAnimations.playHeroEntrance();
    }

    if (window.LunaraScroll) {
      window.LunaraScroll.init();
    }

    bindNavigation();
    warmRemainingAssets();

    let resizeTimer = null;
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          if (typeof window.ScrollTrigger !== "undefined") {
            window.ScrollTrigger.refresh();
          }
        }, 200);
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
