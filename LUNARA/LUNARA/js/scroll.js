/* ==========================================================================
   LUNARA — GSAP & ScrollTrigger Choreography
   ========================================================================== */

(function () {
  "use strict";

  const chapterDots = Array.from(document.querySelectorAll(".chapter-dot"));
  const sections = Array.from(document.querySelectorAll(".story-section"));
  let scrollTriggersBuilt = false;

  function setActiveChapter(index) {
    chapterDots.forEach((dot, i) => {
      const isCurrent = i === index;
      dot.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        dot.setAttribute("aria-current", "step");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function initChapterObservers() {
    sections.forEach((section, index) => {
      window.ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveChapter(index),
        onEnterBack: () => setActiveChapter(index),
      });
    });
  }

  function buildParallaxJourney() {
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const state = window.LunaraAnimations ? window.LunaraAnimations.state : {};

    gsap.registerPlugin(ScrollTrigger);

    if (scrollTriggersBuilt) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }
    scrollTriggersBuilt = true;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        isMobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isMobile, reduceMotion } = context.conditions;

        if (reduceMotion) {
          initChapterObservers();
          gsap.set(".reveal-word", { opacity: 1, y: 0, filter: "blur(0px)" });
          gsap.set(["#stage-moon", "#stage-moon-inner"], { opacity: 1, scale: 1 });
          if (state.lakeReflection) state.lakeReflection.active = 0.7;
          if (state.fireflyActivity !== undefined) state.fireflyActivity = 0.65;
          return;
        }

        const parallaxScale = isMobile ? 0.6 : 1;
        gsap.set("#stage-moon", { x: 0, y: 0, scale: 1 });

        /* --------------------------------------------------------------------
           SECTION 1 — THE BEGINNING (Scroll Exit Parallax)
           -------------------------------------------------------------------- */
        gsap
          .timeline({
            scrollTrigger: {
              id: "scene-0",
              trigger: "#section-beginning",
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          })
          .to(".layer-distant-mountains", { yPercent: -12 * parallaxScale, opacity: 0.35, ease: "none" }, 0)
          .to(".layer-mountains", { yPercent: -24 * parallaxScale, opacity: 0.25, ease: "none" }, 0)
          .to(".layer-hero-mist", { yPercent: -34 * parallaxScale, xPercent: 4, opacity: 0.1, ease: "none" }, 0)
          .to(".layer-forest-hero", { yPercent: 22 * parallaxScale, scale: 1.08, opacity: 0, ease: "none" }, 0)
          .to(".hero-content", { yPercent: -30 * parallaxScale, opacity: 0, ease: "none" }, 0);

        /* --------------------------------------------------------------------
           SECTION 2 — THE WHISPER OF THE NIGHT (Pinned Story Beat)
           -------------------------------------------------------------------- */
        const whisperWords = gsap.utils.toArray("#section-whisper .reveal-word");
        gsap.set(whisperWords, { opacity: 0, y: 20, filter: "blur(8px)" });

        const tlWhisper = gsap.timeline({
          scrollTrigger: {
            id: "scene-1",
            trigger: "#section-whisper",
            start: "top top",
            end: isMobile ? "+=120%" : "+=145%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tlWhisper
          .fromTo(
            ".whisper-distant-ridge",
            { opacity: 0, yPercent: 18, scale: 1.07 },
            { opacity: 0.75, yPercent: 0, scale: 1, duration: 0.45, ease: "none" },
            0
          )
          .fromTo(
            ".whisper-main-ridge",
            { opacity: 0, yPercent: 26, scale: 1.05 },
            { opacity: 0.92, yPercent: 0, scale: 1, duration: 0.55, ease: "none" },
            0.08
          )
          .fromTo(
            ".whisper-mist",
            { opacity: 0, xPercent: -6 },
            { opacity: 0.75, xPercent: 5, duration: 0.75, ease: "none" },
            0.12
          )
          .to(
            whisperWords,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              stagger: 0.024,
              duration: 0.2,
              ease: "power2.out",
            },
            0.08
          )
          .to(
            ["#section-whisper .whisper-content", ".whisper-main-ridge", ".whisper-distant-ridge", ".whisper-mist"],
            { opacity: 0, yPercent: -12, duration: 0.2, ease: "none" },
            0.8
          );

        /* --------------------------------------------------------------------
           SECTION 3 — THE ENCHANTED FOREST (Layered Depth & Fireflies)
           -------------------------------------------------------------------- */
        const forestWords1 = gsap.utils.toArray('#section-forest [data-reveal="forest-1"] .reveal-word');
        const forestWords2 = gsap.utils.toArray('#section-forest [data-reveal="forest-2"] .reveal-word');
        gsap.set([...forestWords1, ...forestWords2], { opacity: 0, y: 18, filter: "blur(7px)" });

        const tlForest = gsap.timeline({
          scrollTrigger: {
            id: "scene-2",
            trigger: "#section-forest",
            start: "top top",
            end: isMobile ? "+=145%" : "+=175%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tlForest
          .fromTo(
            ".forest-distant-mountains",
            { yPercent: 10, opacity: 0.35 },
            { yPercent: -8 * parallaxScale, opacity: 0.55, duration: 0.9, ease: "none" },
            0
          )
          .fromTo(
            ".forest-pathway-backdrop",
            { opacity: 0, scale: 1.0 },
            { opacity: 0.92, scale: 1.1, duration: 0.85, ease: "none" },
            0
          )
          .fromTo(
            ".moonbeams-overlay",
            { opacity: 0, xPercent: -4 },
            { opacity: 0.72, xPercent: 5, duration: 0.85, ease: "none" },
            0.05
          )
          .fromTo(
            ".forest-mid-trees",
            { yPercent: 16, scale: 1.0 },
            { yPercent: -14 * parallaxScale, scale: 1.06, duration: 0.9, ease: "none" },
            0
          )
          .fromTo(
            ".forest-foreground-trees",
            { yPercent: 28, scale: 1.02 },
            { yPercent: -30 * parallaxScale, scale: 1.18, duration: 0.95, ease: "none" },
            0
          )
          .fromTo(
            ".forest-ground-fog",
            { xPercent: -8, opacity: 0.2 },
            { xPercent: 8, opacity: 0.85, duration: 0.9, ease: "none" },
            0.05
          )
          .to(
            state,
            { fireflyActivity: 1, duration: 0.35, ease: "none" },
            0.05
          )
          .to(
            forestWords1,
            { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.024, duration: 0.16, ease: "power2.out" },
            0.08
          )
          .to(
            forestWords2,
            { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.024, duration: 0.16, ease: "power2.out" },
            0.25
          )
          .to(
            state,
            { fireflyActivity: 0, duration: 0.2, ease: "none" },
            0.8
          )
          .to(
            ["#section-forest .forest-content", ".forest-pathway-backdrop", ".moonbeams-overlay", ".forest-mid-trees", ".forest-foreground-trees", ".forest-ground-fog", ".forest-distant-mountains"],
            { opacity: 0, duration: 0.2, ease: "none" },
            0.8
          );

        /* --------------------------------------------------------------------
           SECTION 4 — THE SILVER LAKE (Scroll-Responsive Water Reflection)
           -------------------------------------------------------------------- */
        const lakeWords = gsap.utils.toArray("#section-lake .reveal-word");
        gsap.set(lakeWords, { opacity: 0, y: 18, filter: "blur(7px)" });

        const tlLake = gsap.timeline({
          scrollTrigger: {
            id: "scene-3",
            trigger: "#section-lake",
            start: "top top",
            end: isMobile ? "+=140%" : "+=170%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (state.lakeReflection) {
                state.lakeReflection.scrollProgress = self.progress;
              }
            },
          },
        });

        tlLake
          .fromTo(
            ".lake-distant-peaks",
            { opacity: 0, yPercent: 12 },
            { opacity: 0.55, yPercent: -6 * parallaxScale, duration: 0.45, ease: "none" },
            0
          )
          .fromTo(
            ".lake-water-backdrop",
            { opacity: 0, yPercent: 10, scale: 1.04 },
            { opacity: 0.96, yPercent: 0, scale: 1, duration: 0.45, ease: "none" },
            0
          )
          .fromTo(
            ".lake-shore-mist",
            { opacity: 0, xPercent: -5 },
            { opacity: 0.55, xPercent: 5, duration: 0.78, ease: "none" },
            0.05
          )
          .to(
            state.lakeReflection,
            { active: 1, brightness: 1.25, duration: 0.28, ease: "none" },
            0.08
          )
          .to(
            lakeWords,
            { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.025, duration: 0.18, ease: "power2.out" },
            0.14
          )
          .to(
            state.lakeReflection,
            { active: 0, duration: 0.2, ease: "none" },
            0.8
          )
          .to(
            ["#section-lake .lake-content", ".lake-water-backdrop", ".lake-distant-peaks", ".lake-shore-mist"],
            { opacity: 0, duration: 0.2, ease: "none" },
            0.8
          );

        /* --------------------------------------------------------------------
           SECTION 5 — BEYOND THE HORIZON (Sky Shift & Cloud Dissolution)
           -------------------------------------------------------------------- */
        const horizonWords1 = gsap.utils.toArray('#section-horizon [data-reveal="horizon-1"] .reveal-word');
        const horizonWords2 = gsap.utils.toArray('#section-horizon [data-reveal="horizon-2"] .reveal-word');
        gsap.set([...horizonWords1, ...horizonWords2], { opacity: 0, y: 18, filter: "blur(7px)" });

        const tlHorizon = gsap.timeline({
          scrollTrigger: {
            id: "scene-4",
            trigger: "#section-horizon",
            start: "top top",
            end: isMobile ? "+=135%" : "+=165%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tlHorizon
          .fromTo(
            ".horizon-distant-ridge",
            { opacity: 0.1, yPercent: 18 },
            { opacity: 0.48, yPercent: 0, duration: 0.55, ease: "none" },
            0
          )
          .fromTo(
            ".horizon-light-veil",
            { opacity: 0 },
            { opacity: 0.9, duration: 0.65, ease: "none" },
            0.05
          )
          .to(
            horizonWords1,
            { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.02, duration: 0.15, ease: "power2.out" },
            0.08
          )
          .to(
            horizonWords2,
            { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.02, duration: 0.16, ease: "power2.out" },
            0.24
          )
          .to(
            ["#section-horizon .horizon-content", ".horizon-distant-ridge", ".horizon-light-veil"],
            { opacity: 0, duration: 0.2, ease: "none" },
            0.8
          );

        /* --------------------------------------------------------------------
           SECTION 6 — THE END IS ANOTHER BEGINNING (Finale Reveal)
           -------------------------------------------------------------------- */
        const finaleMainWords = gsap.utils.toArray("#section-finale .finale-heading .reveal-word");
        const finaleSubWords = gsap.utils.toArray("#section-finale .finale-subtext .reveal-word");
        gsap.set([...finaleMainWords, ...finaleSubWords], { opacity: 0, y: 20, filter: "blur(8px)" });
        gsap.set("#restart-btn", { opacity: 0, y: 18 });

        gsap
          .timeline({
            scrollTrigger: {
              id: "scene-5",
              trigger: "#section-finale",
              start: "top 80%",
              end: "top 20%",
              scrub: 1,
            },
          })
          .to(finaleMainWords, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, duration: 0.5 }, 0)
          .to(finaleSubWords, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.45 }, 0.3)
          .to("#restart-btn", { opacity: 1, y: 0, duration: 0.45 }, 0.55);

        /* --------------------------------------------------------------------
           MASTER CONTINUOUS CELESTIAL STAGE TIMELINE
           (Moon arc, sky color transformation, clouds fade, stars parallax)
           -------------------------------------------------------------------- */
        ScrollTrigger.refresh();
        const maxScroll = Math.max(1, ScrollTrigger.maxScroll(window));

        function normStart(id) {
          const st = ScrollTrigger.getById(id);
          return st ? Math.max(0, Math.min(0.98, st.start / maxScroll)) : 0;
        }

        const p2 = normStart("scene-1") || 0.16;
        const p3 = normStart("scene-2") || 0.34;
        const p4 = normStart("scene-3") || 0.54;
        const p5 = normStart("scene-4") || 0.72;
        const p6 = normStart("scene-5") || 0.88;

        const masterStage = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: "#journey",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });

        // Initial normalized anchor at 0
        masterStage.set(
          document.documentElement,
          {
            "--sky-top": "#080B16",
            "--sky-mid": "#0C1326",
            "--sky-bottom": "#101A32",
          },
          0
        );

        // Phase 1 -> 2: Moon gradually moves upward; clouds pass across screen
        masterStage
          .to("#stage-moon", { y: "-4vh", scale: 0.96, duration: Math.max(0.05, p2) }, 0)
          .to("#clouds-back-offset", { xPercent: -6, duration: Math.max(0.05, p2) }, 0)
          .to("#clouds-front-offset", { xPercent: 8, duration: Math.max(0.05, p2) }, 0)
          .to("#clouds-back", { y: "-4vh", opacity: 0.52, duration: Math.max(0.05, p2) }, 0)
          .to("#clouds-front", { y: "-6vh", opacity: 0.62, duration: Math.max(0.05, p2) }, 0)
          .to("#stars-layer", { y: "-4vh", duration: Math.max(0.05, p2) }, 0)
          .to(state, { starParallaxY: -40, duration: Math.max(0.05, p2) }, 0);

        // Phase 2 -> 3: Entering Enchanted Forest
        const d23 = Math.max(0.05, p3 - p2);
        masterStage
          .to("#stage-moon", { y: "-5vh", scale: 0.9, duration: d23 }, p2)
          .to("#clouds-back-offset", { xPercent: -11, duration: d23 }, p2)
          .to("#clouds-front-offset", { xPercent: 14, duration: d23 }, p2)
          .to("#clouds-back", { opacity: 0.28, duration: d23 }, p2)
          .to("#clouds-front", { opacity: 0.24, duration: d23 }, p2)
          .to(
            document.documentElement,
            { "--sky-top": "#060913", "--sky-mid": "#0B1325", "--sky-bottom": "#101C36", duration: d23 },
            p2
          )
          .to(state, { starOpacity: 0.65, starParallaxY: -90, duration: d23 }, p2);

        // Phase 3 -> 4: Emerging onto The Silver Lake (moon centers over water for reflection)
        const d34 = Math.max(0.05, p4 - p3);
        masterStage
          .to("#stage-moon", { y: "-2vh", scale: 1.02, filter: "brightness(1.08)", duration: d34 }, p3)
          .to("#clouds-back-offset", { xPercent: -15, duration: d34 }, p3)
          .to("#clouds-front-offset", { xPercent: 18, duration: d34 }, p3)
          .to("#clouds-back", { opacity: 0.35, duration: d34 }, p3)
          .to("#clouds-front", { opacity: 0.22, duration: d34 }, p3)
          .to(
            document.documentElement,
            { "--sky-top": "#080B16", "--sky-mid": "#0E1A34", "--sky-bottom": "#14274A", duration: d34 },
            p3
          )
          .to(state, { starOpacity: 0.88, particleActivity: 0.62, starParallaxY: -135, duration: d34 }, p3);

        // Phase 4 -> 5: Beyond the Horizon (moon brightens, sky shifts lighter blue, clouds dissolve)
        const d45 = Math.max(0.05, p5 - p4);
        masterStage
          .to("#stage-moon", { y: "-1vh", scale: 1.15, filter: "brightness(1.2)", duration: d45 }, p4)
          .to(["#clouds-back", "#clouds-front"], { opacity: 0, y: "-10vh", duration: d45 * 0.85 }, p4)
          .to("#horizon-atmosphere", { opacity: 0.95, y: "0vh", duration: d45 }, p4)
          .to(
            document.documentElement,
            { "--sky-top": "#122447", "--sky-mid": "#214375", "--sky-bottom": "#4270A8", duration: d45 },
            p4
          )
          .to("#stars-layer", { opacity: 0.25, duration: d45 }, p4)
          .to(state, { starOpacity: 0.35, particleActivity: 0.72, particleIntensity: 1.3, starParallaxY: -175, duration: d45 }, p4);

        // Phase 5 -> 6: Finale (giant glowing moon + rich star particles)
        const d56 = Math.max(0.05, 1.0 - p5);
        masterStage
          .to("#stage-moon", { y: "0vh", scale: isMobile ? 1.18 : 1.28, filter: "brightness(1.24)", duration: d56 }, p5)
          .to("#horizon-atmosphere", { opacity: 0.32, duration: d56 }, p5)
          .to(
            document.documentElement,
            { "--sky-top": "#080D1C", "--sky-mid": "#101E3B", "--sky-bottom": "#1B335E", duration: d56 },
            p5
          )
          .to("#stars-layer", { opacity: 0.9, duration: d56 }, p5)
          .to(state, { starOpacity: 1, particleActivity: 1, particleIntensity: 1.85, starParallaxY: -220, duration: d56 }, p5);

        initChapterObservers();
      }
    );
  }

  function smoothScrollToY(targetY, durationSec) {
    const startY = window.scrollY || window.pageYOffset;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetY);
      return;
    }

    if (typeof window.gsap !== "undefined") {
      const scrollProxy = { y: startY };
      window.gsap.to(scrollProxy, {
        y: targetY,
        duration: durationSec || 1.6,
        ease: "power2.inOut",
        onUpdate: () => window.scrollTo(0, scrollProxy.y),
      });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }

  function scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (!target || typeof window.ScrollTrigger === "undefined") {
      if (target) target.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const index = sections.indexOf(target);
    const st = index >= 0 ? window.ScrollTrigger.getById(`scene-${index}`) : null;
    let destination = target.offsetTop;
    if (st) {
      if (index === sections.length - 1) {
        destination = window.ScrollTrigger.maxScroll(window);
      } else {
        destination = st.start + (st.pin ? (st.end - st.start) * 0.48 : 0);
      }
    }
    smoothScrollToY(destination, 1.25);
  }

  window.LunaraScroll = {
    init: buildParallaxJourney,
    scrollToTop() {
      smoothScrollToY(0, 2.1);
    },
    scrollToSection,
  };
})();
