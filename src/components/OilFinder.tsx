import { useState } from "react";
import { VEHICLES, DRIVE_STYLES, FINDER_RESULT, PRODUCTS } from "../data";
import { Reveal, SectionHead } from "../ui";
import { cn } from "../utils/cn";

export default function OilFinder({ onBuy }: { onBuy: (id: string) => void }) {
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [drive, setDrive] = useState<string | null>(null);
  const result = vehicle && drive ? FINDER_RESULT[`${vehicle}-${drive}`] : null;

  return (
    <section id="finder" className="grid-bg relative scroll-mt-24 overflow-hidden border-t border-line bg-coal">
      <div className="pointer-events-none absolute -left-32 top-1/3 opacity-[0.06]">
        <svg viewBox="0 0 120 120" className="h-[420px] w-[420px] spin-slower" aria-hidden="true">
          <circle cx="60" cy="60" r="58" fill="none" stroke="#009a44" strokeWidth="2" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="#009a44" strokeWidth="3" />
          <circle cx="81" cy="40" r="26" fill="#ffe000" />
          <text x="60" y="77" textAnchor="middle" fontSize="38" fontWeight="800" fill="#009a44" stroke="#f7fbff" strokeWidth="4" paintOrder="stroke" fontFamily="Archivo, sans-serif">PSO</text>
        </svg>
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <SectionHead
          index="02"
          label="oil finder"
          title="Which oil is right for you?"
          copy="Answer two quick questions and we'll recommend the perfect lubricant for your vehicle."
        />

        <Reveal delay={120}>
          <div className="mt-10 rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <div className="text-left">
              <p className="font-mono text-[10.5px] tracking-[0.2em] text-fog uppercase">1 · Select your vehicle</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {VEHICLES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVehicle(v.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all",
                      vehicle === v.id ? "border-oil bg-oil/10" : "border-line bg-steel hover:border-line2",
                    )}
                  >
                    <span className="text-fog transition-colors" style={{ color: vehicle === v.id ? "#00a651" : undefined }}>
                      {v.icon === "car" && <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 17h14v-4l-2-4H7l-2 4v4Z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>}
                      {v.icon === "bike" && <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17 10 9h4l3 8M9 9l-2-3M14 9l3-3" /></svg>}
                      {v.icon === "truck" && <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="7" width="11" height="8" rx="1" /><path d="M13 11h4l3 3v3h-7" /><circle cx="6" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></svg>}
                      {v.icon === "tractor" && <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 14V7h6v7M6 14h-3v4h3M18 14a3 3 0 1 1-6 0M12 14h6" /><circle cx="6" cy="18.5" r="2" /><circle cx="18" cy="18.5" r="2" /></svg>}
                    </span>
                    <span className={cn("font-mono text-[11px]", vehicle === v.id ? "text-oil" : "text-fog2")}>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 text-left">
              <p className="font-mono text-[10.5px] tracking-[0.2em] text-fog uppercase">2 · How do you drive?</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {DRIVE_STYLES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDrive(d.id)}
                    className={cn(
                      "rounded-full border px-5 py-2.5 font-mono text-[12px] transition-all",
                      drive === d.id ? "border-oil bg-oil/10 text-oil" : "border-line text-fog2 hover:border-line2 hover:text-paper",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  if (!vehicle || !drive) return;
                  document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                disabled={!vehicle || !drive}
                className="shine flex items-center gap-2 rounded-full bg-oil px-8 py-3 font-display text-[14px] font-bold tracking-wide text-paper uppercase transition-all hover:bg-paper hover:text-ink disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                Find My Oil
              </button>
            </div>
          </div>
        </Reveal>

        {result && (
          <Reveal delay={200}>
            <div id="result" className="mt-6 rounded-xl border border-moss/40 bg-moss/10 p-5">
              <p className="font-mono text-[10.5px] tracking-[0.2em] text-moss uppercase">recommended</p>
              <p className="mt-1 font-display text-2xl font-bold text-paper">{result}</p>
              <button onClick={() => { const p = PRODUCTS.find((x) => `${x.name} ${x.grade}` === result || x.name === result); if (p) onBuy(p.id); }} className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-oil underline decoration-dotted underline-offset-4">
                Buy now <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
