import { useState } from "react";
import { PRODUCTS } from "../data";
import { scrollToId } from "../hooks";
import { Arrow, Award, Phone, Pump, Search, Shield } from "../icons";
import { Reveal } from "../ui";

const STATS = [
  { icon: <Shield className="h-5 w-5" />, value: "100%", label: "Genuine products" },
  { icon: <Pump className="h-5 w-5" />, value: "3,500+", label: "Retail outlets" },
  { icon: <Award className="h-5 w-5" />, value: "45+", label: "Years of trust" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.grade.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 5);

  return (
    <section id="top" className="relative min-h-[88vh] overflow-hidden scroll-mt-24">
      <div className="absolute inset-0">
        <img src="/images/hero-oil.jpg" alt="" className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-coal via-coal/90 to-coal/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-transparent to-coal/40" />
      </div>

      <div className="pointer-events-none absolute right-[-6%] top-1/2 -translate-y-1/2 opacity-[0.07]">
        <div className="spin-slower h-[520px] w-[520px] lg:h-[680px] lg:w-[680px]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <circle cx="60" cy="60" r="58" fill="none" stroke="#009a44" strokeWidth="2" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#009a44" strokeWidth="3" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="#009a44" strokeWidth="2" />
            <circle cx="81" cy="40" r="26" fill="#ffe000" />
            <text x="60" y="77" textAnchor="middle" fontSize="38" fontWeight="800" fill="#009a44" stroke="#f7fbff" strokeWidth="4" paintOrder="stroke" fontFamily="Archivo, sans-serif">PSO</text>
          </svg>
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 h-1 bg-moss" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-5 pb-24 pt-20 sm:px-8 lg:pb-32">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-moss/60 bg-moss/10 px-4 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-moss uppercase">
            <Award className="h-3.5 w-3.5" />
            Pakistan's No.1 — Trusted Since 1976
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 max-w-3xl font-display text-[2.9rem] leading-[0.95] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-paper">Power Your Engine</span>
            <span className="block">
              with{" "}
              <span className="shimmer-text bg-gradient-to-r from-[#2d8fd6] via-[#00a651] to-[#2d8fd6] bg-clip-text text-transparent">Premium</span>
            </span>
            <span className="shimmer-text block bg-gradient-to-r from-[#2d8fd6] via-[#00a651] to-[#2d8fd6] bg-clip-text text-transparent">Lubricants</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-fog2">
            High-performance motor oils, diesel engine oils, and industrial lubricants engineered for Pakistani roads and climates. Maximum protection, longer engine life, proven performance.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => scrollToId("products")} className="shine group flex items-center gap-2 rounded-full bg-oil px-7 py-3 font-display text-[14px] font-bold tracking-wide text-paper uppercase transition-all hover:bg-paper hover:text-ink">
              Explore Products <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => scrollToId("finder")} className="rounded-full border border-fog2/60 px-7 py-3 font-display text-[14px] font-bold tracking-wide text-paper transition-colors hover:border-oil hover:text-oil">
              Find the Right Oil
            </button>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-10 w-full max-w-md">
            <label className="mb-1.5 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] text-fog uppercase">
              <Search className="h-3.5 w-3.5" /> Quick oil finder
            </label>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="e.g. 5W-40, Carient…"
                className="w-full rounded-full border border-line bg-coal/70 px-5 py-3 pr-28 font-mono text-[13px] text-paper outline-none backdrop-blur placeholder:text-fog focus:border-oil"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-fog">ESC</span>
            </div>
            {open && query && (
              <ul className="mt-2 overflow-hidden rounded-xl border border-line bg-coal/95 backdrop-blur">
                {matches.length === 0 && <li className="px-4 py-3 font-mono text-[11px] text-fog">no products match “{query}”</li>}
                {matches.map((m) => (
                  <li key={m.id}>
                    <button onClick={() => { scrollToId("products"); setOpen(false); setQuery(""); }} className="flex w-full items-center justify-between px-4 py-2.5 text-left font-mono text-[12px] text-fog2 transition-colors hover:bg-steel2 hover:text-oil">
                      <span>{m.name}</span>
                      <span className="text-fog">{m.grade}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="lift-hover rounded-2xl border border-line/70 bg-white/5 p-4 backdrop-blur hover:border-moss/60 hover:bg-white/10">
                <div className="text-moss">{s.icon}</div>
                <div className="mt-2 font-display text-2xl font-extrabold text-paper">{s.value}</div>
                <div className="mt-0.5 font-mono text-[10px] tracking-wide text-fog">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={420}>
          <a href="tel:03077885585" className="mt-10 inline-flex items-center gap-2 rounded-full bg-moss/15 px-5 py-2.5 font-mono text-[12px] text-moss transition-colors hover:bg-moss/25">
            <Phone className="h-3.5 w-3.5" /> 03077885585
            <span className="ml-2 rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold text-paper uppercase">24h support</span>
          </a>
        </Reveal>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
