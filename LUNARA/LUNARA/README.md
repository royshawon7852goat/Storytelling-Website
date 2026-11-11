# LUNARA — A Journey Through the Moonlight

An atmospheric, scroll-driven storytelling parallax website built with HTML5, CSS3, JavaScript, GSAP, and ScrollTrigger.

> *"Somewhere between dreams and reality."*

## Storytelling Chapters

1. **The Beginning** — Full-screen moonlit panorama with multi-speed mountain, cloud, star, and forest parallax layers, moon fade-in, and blur-to-focus title reveal.
2. **The Whisper of the Night** — Pinned scroll chapter where the moon ascends, clouds pass overhead, the distant ridge emerges from darkness, and *"When the world falls silent, the universe begins to speak."* reveals word by word.
3. **The Enchanted Forest** — Layered foreground, mid-ground, and distant mountain parallax combined with volumetric silver moonbeams, drifting ground fog, and floating canvas fireflies.
4. **The Silver Lake** — Smooth transition onto a glassy alpine lake featuring a live, scroll-responsive canvas moon reflection and animated water ripples.
5. **Beyond the Horizon** — Environmental transformation from deep navy to lighter celestial twilight blue as the moon brightens, clouds dissipate, and the distant horizon blooms.
6. **The End Is Another Beginning** — Minimalist closing composition with a giant glowing moon, rising starlight particles, and a **Restart the Journey** control that glides back to the start.

## Structure

```text
LUNARA/
├── index.html
├── README.md
├── assets/
│   ├── images/        # moon.png, clouds.png, mountains.png, forest.png, lake.png, stars.png
│   ├── backgrounds/   # distant-mountains.png, enchanted-path.png, forest-foreground.png, mist-fog.png, horizon-glow.png
│   ├── icons/         # favicon.svg, arrow-down.svg, restart.svg
│   └── fonts/         # Local Cinzel, Cormorant Garamond, Plus Jakarta Sans WOFF2 fonts
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
└── js/
    ├── main.js
    ├── animations.js
    └── scroll.js
```

## Running Locally

Serve the `LUNARA` directory with any static HTTP server (or open `index.html` with internet access for GSAP 3.12.7 + ScrollTrigger CDN):

```bash
npx serve LUNARA
# or
python -m http.server 8000 --directory LUNARA
```

## Accessibility & Performance

- Respects `prefers-reduced-motion` across both CSS animations and `gsap.matchMedia()` ScrollTrigger timelines.
- Uses local bundled WOFF2 fonts in `assets/fonts/` for crisp typography without FOUT.
- Includes semantic landmarks, keyboard-accessible chapter navigation, skip link, and high-contrast text scrims.
- Uses `loading="lazy"` and idle background warming for deeper chapter layers.
