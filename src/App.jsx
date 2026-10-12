import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Car from "./Car.jsx";

gsap.registerPlugin(ScrollTrigger);

/*
  Measured from the reference frames (scroll progress 0 -> 1):
  - green trail's right edge = car's left edge + 17% of car width
  - car ends with ~35% of its length off-screen on the right
  - cards fade in one after another: 58 -> 23 -> 27 -> 40
*/
const TRAIL_OFFSET = 0.17;
const CAR_OVERFLOW = 0.35;

// `at` / `dur` = where in the scroll (0-1) the card fades in
const TOP_ROW = [
  {
    value: 58,
    label: "Increase in pick up point use",
    style: "bg-[#dff74c] text-black md:w-[21vw]",
    at: 0.31,
    dur: 0.16,
  },
  {
    value: 27,
    label: "Increase in pick up point use",
    style: "bg-[#333] text-white md:w-[19.3vw]",
    at: 0.63,
    dur: 0.16,
  },
];
const BOTTOM_ROW = [
  {
    value: 23,
    label: "Decreased in customer phone calls",
    style: "bg-[#6cc8ff] text-black md:w-[22.7vw]",
    at: 0.47,
    dur: 0.16,
  },
  {
    value: 40,
    label: "Decreased in customer phone calls",
    style: "bg-[#fa7328] text-black md:w-[22.7vw]",
    at: 0.8,
    dur: 0.2,
  },
];
const ALL_STATS = [...TOP_ROW, ...BOTTOM_ROW]; // same order as the DOM

const WORDS = ["WELCOME", "ITZFIZZ"];

const BAND_POS = "top-[34.5%] h-[31.5%]";

// The headline is drawn twice at the exact same position:
//  - ghost: faint text on the dark road, animates in on page load
//  - solid: black text, revealed only where the green trail has passed
function Headline({ solid }) {
  return (
    <h1
      aria-label={solid ? undefined : "Welcome Itzfizz"}
      aria-hidden={solid ? "true" : undefined}
      className={`${solid ? "headline-solid z-20 text-[#111]" : "z-5text-white/0.06"} pointer-events-none absolute inset-x-0 ${BAND_POS} flex flex-wrap content-center items-center justify-center gap-x-[0.28em] px-2 text-[clamp(2rem,9.8vw,9.5rem)] font-bold leading-none tracking-[0.02em]`}
    >
      {WORDS.map((word) => (
        <span key={word} aria-hidden="true" className="flex">
          {word.split("").map((c, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <span className={`${solid ? "" : "char"} inline-block`}>{c}</span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

function Stat({ value, label, style, at, dur }) {
  return (
    <div className="stat will-change-transform" data-at={at} data-dur={dur}>
      <div className="stat-in">
        <div
          className={`min-h-27.5 w-[46vw] rounded-xl p-4 md:min-h-0 md:p-[2vw] ${style}`}
        >
          <div className="text-4xl font-bold leading-none md:text-[max(2.2rem,4.5vw)]">
            <span className="num tabular-nums">{value}</span>%
          </div>
          <p className="mt-2 text-xs md:mt-[0.8vw] md:text-[max(0.75rem,1.1vw)]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return; // static final state is already rendered

    const ctx = gsap.context(() => {
      const carEl = root.current.querySelector(".car");

      // measurements are functions so they are re-read on every resize/refresh
      const W = () => document.documentElement.clientWidth;
      const CW = () => carEl.offsetWidth;
      const xEnd = () => W() - CW() * CAR_OVERFLOW;
      const edge0 = () => (CW() * TRAIL_OFFSET) / W(); // trail edge (as 0-1 of width) at scroll start
      const edge1 = () => (xEnd() + CW() * TRAIL_OFFSET) / W(); // ...and at scroll end

      /* ---------- 1. Intro (time-based, plays once on load) ---------- */
      const nums = gsap.utils.toArray(".num");
      nums.forEach((el) => (el.textContent = "0"));

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".char", {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          stagger: 0.06,
        })
        .from(".car-intro", { xPercent: -130, duration: 1.8 }, 0.2)
        .addLabel("stats", "-=0.6")
        .from(
          ".stat-in",
          { y: 30, opacity: 0, duration: 0.9, stagger: 0.18 },
          "stats",
        );

      /* ---------- 2. Scroll-driven scene (tied to scroll progress) ---------- */
      const scroll = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".scene",
          start: "top top",
          end: "+=300%",
          scrub: 1, // 1s of smoothing/interpolation behind the scrollbar
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      scroll
        // car drives left -> right and ends partly off-screen
        .fromTo(".car", { x: 0 }, { x: xEnd, duration: 1 }, 0)
        // green trail grows behind the car
        .fromTo(".trail", { scaleX: edge0 }, { scaleX: edge1, duration: 1 }, 0)
        // black headline is revealed by exactly the same edge
        .fromTo(
          ".headline-solid",
          { clipPath: () => `inset(0 ${(1 - edge0()) * 100}% 0 0)` },
          {
            clipPath: () => `inset(0 ${(1 - edge1()) * 100}% 0 0)`,
            duration: 1,
          },
          0,
        );

      // cards fade in one after another while their number counts up
      gsap.utils.toArray(".stat").forEach((el, i) => {
        const at = parseFloat(el.dataset.at);
        const dur = parseFloat(el.dataset.dur);
        const counter = { v: 0 };

        scroll
          .fromTo(
            el,
            { opacity: 0.1, y: 24 },
            { opacity: 1, y: 0, duration: dur, ease: "power1.out" },
            at,
          )
          .to(
            counter,
            {
              v: ALL_STATS[i].value,
              duration: dur,
              onUpdate: () => (nums[i].textContent = Math.round(counter.v)),
            },
            at,
          );
      });

      scroll.to(".scroll-hint", { opacity: 0, duration: 0.05 }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={root}>
      <section className="scene relative h-screen w-full overflow-hidden bg-[#d1d1d1]">
        {/* stats: top row */}
        <div className="absolute inset-x-0 top-[7.5%] z-20 flex gap-[0.5vw] pl-[2%] md:pl-[47%]">
          {TOP_ROW.map((s) => (
            <Stat key={s.value} {...s} />
          ))}
        </div>

        {/* dark road */}
        <div className={`absolute inset-x-0 z-1 bg-[#1e1e1e] ${BAND_POS}`} />
        <Headline />
        {/* green trail (scaled by scroll) */}
        <div
          className={`trail absolute inset-x-0 z-10 origin-left bg-[#44db7e] will-change-transform ${BAND_POS}`}
        />
        <Headline solid />

        {/* car */}
        <div
          className={`pointer-events-none absolute left-0 z-30 flex items-center ${BAND_POS}`}
        >
          <div className="car-intro">
            <div className="car aspect-21/10 h-[29vh] will-change-transform">
              <Car className="block h-full w-full" />
            </div>
          </div>
        </div>

        {/* stats: bottom row */}
        <div className="absolute inset-x-0 bottom-[7.5%] z-20 flex gap-[0.5vw] pl-[2%] md:pl-[40.4%]">
          {BOTTOM_ROW.map((s) => (
            <Stat key={s.value} {...s} />
          ))}
        </div>

        <div className="scroll-hint absolute bottom-3 left-4 z-20 text-xs uppercase tracking-[0.4em] text-black/50">
          Scroll
        </div>
      </section>

      <section className="flex min-h-[70vh] items-center justify-center bg-[#d1d1d1] px-6 text-center">
        <p className="max-w-xl text-lg text-black/60">
          Built with React, Tailwind CSS and GSAP ScrollTrigger. The car, the
          green trail, the headline reveal and the stat cards are all driven by
          scroll progress using transforms and opacity.
        </p>
      </section>
    </main>
  );
}
