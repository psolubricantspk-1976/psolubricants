import { useState } from "react";
import { Flask, Thermo, Shield, Recycle } from "../icons";
import { Reveal, SectionHead } from "../ui";

const FEATURES = [
  { icon: <Flask className="h-5 w-5" />, title: "Lab-tested formulas", copy: "Every batch passes 20+ quality tests in our state-of-the-art laboratories before it reaches the shelf." },
  { icon: <Thermo className="h-5 w-5" />, title: "Built for extreme heat", copy: "Engineered for 50°C summers, dusty roads and heavy traffic — conditions our engines actually face." },
  { icon: <Shield className="h-5 w-5" />, title: "API & JASO certified", copy: "International certifications guarantee performance that matches or beats imported brands." },
  { icon: <Recycle className="h-5 w-5" />, title: "Longer drain intervals", copy: "Advanced additive packages keep oil stable longer — fewer changes, lower running costs." },
];

export default function WhyChooseUs() {
  const [motionPaused, setMotionPaused] = useState(false);

  return (
    <section id="why" className="grid-light scroll-mt-24 bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <Reveal>
          <div className="relative">
            <div className="relative isolate overflow-hidden rounded-2xl bg-steel shadow-2xl shadow-black/30">
              <img
                id="quality-lab-photo"
                src="/images/lab.jpg"
                alt="Scientist testing motor oil in PSO lab"
                className="lab-photo-motion block aspect-[3/2] w-full object-cover"
                style={{ animationPlayState: motionPaused ? "paused" : undefined }}
                loading="lazy"
                decoding="async"
              />
              <button
                type="button"
                onClick={() => setMotionPaused((paused) => !paused)}
                aria-label={motionPaused ? "Play photo animation" : "Pause photo animation"}
                aria-controls="quality-lab-photo"
                className="absolute top-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-coal/80 px-4 py-2 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-coal focus-visible:outline-white motion-reduce:hidden"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                  {motionPaused ? <path d="M4 2.5v11L13 8z" /> : <path d="M3 2h3v12H3zm7 0h3v12h-3z" />}
                </svg>
                {motionPaused ? "Play motion" : "Pause motion"}
              </button>
            </div>
            <div className="float-soft absolute -bottom-5 -right-3 rounded-xl border border-moss/40 bg-moss/15 p-4 backdrop-blur sm:-right-6">
              <div className="font-display text-3xl font-extrabold text-moss">99.8%</div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-moss uppercase">Batch quality pass rate</div>
            </div>
          </div>
        </Reveal>

        <div>
          <SectionHead
            tone="light"
            index="04"
            label="why choose us"
            title="Quality you can measure, protection you can feel"
            copy="From base oil selection to final packaging, our lubricants are blended and tested to international standards — so your engine runs smoother, cooler, and longer."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="lift-hover rounded-xl border border-sand bg-paper p-5 hover:border-oil hover:shadow-[0_18px_45px_rgba(0,166,81,0.18)]">
                  <span className="inline-flex rounded-lg bg-moss/15 p-2.5 text-moss">{f.icon}</span>
                  <h3 className="mt-3 font-display text-[15px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-clay">{f.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
