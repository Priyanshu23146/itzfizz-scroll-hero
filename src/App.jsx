import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Car from "./Car.jsx";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 58, label: "Increase in pick up point use" },
  { value: 23, label: "Decrease in customer phone calls" },
  { value: 27, label: "Increase in pick up point use" },
  { value: 40, label: "Decrease in customer phone calls" },
];

const WORDS = ["WELCOME", "ITZFIZZ"];
const ROAD_PERIOD = 120; // must match the dash period in index.css

function Stat({ value, label }) {
  return (
    <div className="stat">
      <div className="stat-in max-w-[210px]">
        <div className="text-4xl font-bold leading-none md:text-6xl">
          <span className="num tabular-nums">{value}</span>
          <span className="text-orange-400">%</span>
        </div>
        <p className="mt-2 text-xs font-light text-zinc-400 md:text-sm">
          {label}
        </p>
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
      /* ---------- 1. Intro (time-based, plays once on load) ---------- */
      const nums = gsap.utils.toArray(".num");
      const targets = STATS.map((s) => ({ v: 0, end: s.value }));
      nums.forEach((el) => (el.textContent = "0"));

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from(".char", {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          stagger: 0.07,
        })
        .from(
          ".car-intro",
          { y: "60vh", opacity: 0, duration: 1.6, ease: "power3.out" },
          0.2,
        )
        .addLabel("stats", "-=0.5")
        .from(
          ".stat-in",
          { y: 30, opacity: 0, duration: 0.9, stagger: 0.18 },
          "stats",
        );

      nums.forEach((el, i) => {
        intro.to(
          targets[i],
          {
            v: targets[i].end,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => (el.textContent = Math.round(targets[i].v)),
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
        // car drives up the road and grows slightly (transforms only)
        .to(
          ".car",
          { y: () => -window.innerHeight * 0.62, scale: 1.2, duration: 1 },
          0,
        )
        // gentle steering sway
        .fromTo(
          ".car",
          { rotation: 0 },
          {
            keyframes: [
              { rotation: -4 },
              { rotation: 4 },
              { rotation: -2 },
              { rotation: 0 },
            ],
            duration: 1,
          },
          0,
        )
        // road markings stream past; wrapped to the dash period so the loop is seamless
        .to(
          ".road-lines",
          {
            y: ROAD_PERIOD * 14,
            duration: 1,
            modifiers: {
              y: gsap.utils.unitize((v) => parseFloat(v) % ROAD_PERIOD),
            },
          },
          0,
        )
        // headline and stats make way for the car
        .to(".headline", { scale: 1.08, opacity: 0.3, duration: 0.7 }, 0.1)
        .to(
          ".stat",
          { y: -40, opacity: 0.25, stagger: 0.06, duration: 0.5 },
          0.2,
        )
        .to(
          ".glow",
          { y: () => -window.innerHeight * 0.3, opacity: 0.9, duration: 1 },
          0,
        )
        .to(".scroll-hint", { opacity: 0, duration: 0.1 }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={root}>
      <section className="scene relative h-screen w-full overflow-hidden">
        {/* ambient glow */}
        <div className="glow pointer-events-none absolute left-1/2 top-[55%] h-[70vmin] w-[70vmin] -translate-x-1/2 rounded-full bg-orange-500/20 opacity-60 blur-[120px]" />

        {/* road */}
        <div className="absolute inset-y-0 left-1/2 w-[min(38vw,300px)] -translate-x-1/2 overflow-hidden border-x border-white/10 bg-[#0e1016]">
          <div
            className="road-lines absolute inset-x-0 will-change-transform"
            style={{
              top: -ROAD_PERIOD,
              height: `calc(100% + ${ROAD_PERIOD * 2}px)`,
            }}
          />
        </div>

        {/* headline */}
        <h1
          aria-label="Welcome Itzfizz"
          className="headline absolute inset-x-0 top-[11vh] z-20 flex flex-wrap justify-center gap-x-[1.2em] px-4 text-[clamp(1.4rem,4.6vw,3.8rem)] font-light"
        >
          {WORDS.map((word) => (
            <span key={word} aria-hidden="true" className="flex">
              {word.split("").map((c, i) => (
                <span
                  key={i}
                  className="inline-block overflow-hidden px-[0.3em]"
                >
                  <span className="char inline-block">{c}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* stats */}
        <div className="absolute inset-x-0 top-[30vh] z-20 mx-auto flex max-w-6xl justify-between gap-6 px-6 md:px-10">
          <div className="flex flex-col gap-10 md:gap-16">
            <Stat {...STATS[0]} />
            <Stat {...STATS[1]} />
          </div>
          <div
            className="hidden w-[min(38vw,300px)] md:block"
            aria-hidden="true"
          />
          <div className="flex flex-col items-end gap-10 text-right md:gap-16">
            <Stat {...STATS[2]} />
            <Stat {...STATS[3]} />
          </div>
        </div>

        {/* car */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
          <div className="car-intro -mb-16">
            <div className="car w-[clamp(90px,13vw,150px)] will-change-transform">
              <Car className="h-auto w-full" />
            </div>
          </div>
        </div>

        <div className="scroll-hint absolute bottom-6 left-6 z-20 text-xs uppercase tracking-[0.4em] text-zinc-500">
          Scroll
        </div>
      </section>

      <section className="flex min-h-[70vh] items-center justify-center bg-[#07080c] px-6 text-center">
        <p className="max-w-xl text-lg font-light text-zinc-400">
          Built with React, Tailwind CSS and GSAP ScrollTrigger. The car, road
          and stats are driven by scroll progress using transforms only.
        </p>
      </section>
    </main>
  );
}
