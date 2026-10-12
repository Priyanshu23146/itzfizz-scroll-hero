import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Car from "./Car.jsx";

gsap.registerPlugin(ScrollTrigger);

// `at` = rough point (0-1) of the scroll where the car passes the card
const TOP_ROW = [
  {
    value: 58,
    label: "Increase in pick up point use",
    color: "bg-[#dff74c] text-black",
    at: 0.5,
  },
  {
    value: 27,
    label: "Increase in pick up point use",
    color: "bg-[#333] text-white",
    at: 0.72,
  },
];
const BOTTOM_ROW = [
  {
    value: 23,
    label: "Decreased in customer phone calls",
    color: "bg-[#6cc8ff] text-black",
    at: 0.42,
  },
  {
    value: 40,
    label: "Decreased in customer phone calls",
    color: "bg-[#fa7328] text-black",
    at: 0.64,
  },
];
const ALL_STATS = [...TOP_ROW, ...BOTTOM_ROW];

const WORDS = ["WELCOME", "ITZFIZZ"];

function Stat({ value, label, color, at }) {
  return (
    <div className="stat will-change-transform" data-at={at}>
      <div
        className={`stat-in min-h-30 w-[44vw] max-w-72.5 rounded-xl p-5 md:min-h-37.5 md:w-[21vw] md:p-6 ${color}`}
      >
        <div className="text-4xl font-bold leading-none md:text-6xl">
          <span className="num tabular-nums">{value}</span>%
        </div>
        <p className="mt-3 text-xs md:text-base">{label}</p>
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

      /* ---------- 1. Intro (time-based, plays once on load) ---------- */
      const nums = gsap.utils.toArray(".num");
      const counters = ALL_STATS.map(() => ({ v: 0 }));
      // DOM order is top row then bottom row, same as ALL_STATS
      nums.forEach((el) => (el.textContent = "0"));

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
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
          { y: 40, opacity: 0, scale: 0.92, duration: 0.9, stagger: 0.18 },
          "stats",
        );

      nums.forEach((el, i) => {
        intro.to(
          counters[i],
          {
            v: ALL_STATS[i].value,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => (el.textContent = Math.round(counters[i].v)),
          },
          `stats+=${i * 0.18}`,
        );
      });

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
        // car drives left -> right and ends half off-screen
        .fromTo(
          ".car",
          { x: 0 },
          { x: () => window.innerWidth - carEl.offsetWidth * 0.5, duration: 1 },
          0,
        )
        // green band grows from the left, always ending under the car's centre
        .fromTo(
          ".band",
          { scaleX: () => (carEl.offsetWidth * 0.5) / window.innerWidth },
          { scaleX: 1, duration: 1 },
          0,
        );

      // each card gives a small pulse when the car passes it
      gsap.utils.toArray(".stat").forEach((el) => {
        scroll.to(
          el,
          {
            keyframes: [
              { scale: 1.08, y: -10, duration: 0.05 },
              { scale: 1, y: 0, duration: 0.08 },
            ],
            ease: "power2.out",
          },
          parseFloat(el.dataset.at),
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
        <div className="absolute inset-x-0 top-[5%] z-20 flex gap-2 pl-[3%] md:top-[8%] md:pl-[47%]">
          {TOP_ROW.map((s) => (
            <Stat key={s.value} {...s} />
          ))}
        </div>

        {/* green band (scaled by scroll) */}
        <div className="band absolute inset-x-0 top-[35%] z-10 h-[31%] origin-left bg-[#44db7e] will-change-transform" />

        {/* headline */}
        <h1
          aria-label="Welcome Itzfizz"
          className="absolute inset-x-0 top-[35%] z-20 flex h-[31%] flex-wrap items-center justify-center gap-x-[0.7em] px-2 text-[clamp(1.6rem,6.4vw,6rem)] font-bold text-[#111]"
        >
          {WORDS.map((word) => (
            <span key={word} aria-hidden="true" className="flex">
              {word.split("").map((c, i) => (
                <span
                  key={i}
                  className="inline-block overflow-hidden px-[0.06em] md:px-[0.1em]"
                >
                  <span className="char inline-block">{c}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* car */}
        <div className="pointer-events-none absolute left-0 top-[35%] z-30 flex h-[31%] items-center">
          <div className="car-intro">
            <div className="car w-[clamp(170px,22vw,320px)] will-change-transform">
              <Car className="h-auto w-full" />
            </div>
          </div>
        </div>

        {/* stats: bottom row */}
        <div className="absolute inset-x-0 bottom-[5%] z-20 flex gap-2 pl-[3%] md:bottom-[8%] md:pl-[40%]">
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
          green band and the stat cards are driven by scroll progress using
          transforms only.
        </p>
      </section>
    </main>
  );
}
