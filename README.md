# Itzfizz Scroll-Driven Hero

Scroll-driven hero section built with React, Vite, Tailwind CSS v4 and GSAP (ScrollTrigger).

## What it does

- Letter-spaced "WELCOME ITZFIZZ" headline reveals with a staggered mask animation on load
- Four impact stats animate in one by one, with count-up numbers
- Pinned hero: car, road markings, headline and stats are scrubbed to scroll progress (`scrub: 1` gives the smoothing)
- Transforms only (`y`, `scale`, `rotation`, `opacity`), no layout work on scroll
- Respects `prefers-reduced-motion`

## Run

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Push to a GitHub repo on the `main` branch
2. Repo Settings > Pages > Source: **GitHub Actions**
3. The included workflow builds and publishes automatically
