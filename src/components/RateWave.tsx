import { useEffect, useState } from "react";

type Rate = {
  fuel: string;
  price: number;
  unit: string;
  change: number;
};

const BASE: Rate[] = [
  { fuel: "Petrol Super", price: 268.76, unit: "Rs/L", change: 0.42 },
  { fuel: "Petrol Regular", price: 259.55, unit: "Rs/L", change: -0.18 },
  { fuel: "HSD Diesel", price: 272.91, unit: "Rs/L", change: 0.55 },
  { fuel: "Light Diesel", price: 188.4, unit: "Rs/L", change: 0.12 },
  { fuel: "Kerosene", price: 198.25, unit: "Rs/L", change: -0.08 },
  { fuel: "CNG", price: 274.0, unit: "Rs/kg", change: 0.0 },
  { fuel: "LPG", price: 245.5, unit: "Rs/kg", change: 1.2 },
  { fuel: "Furnace Oil", price: 168.9, unit: "Rs/L", change: -0.35 },
];

/** Live-looking petrol rate ticker with a green/blue SVG wave underneath. */
export default function RateWave() {
  const [rates, setRates] = useState(BASE);
  const [updated, setUpdated] = useState(() => new Date());

  // gentle random walk so the board feels live
  useEffect(() => {
    const t = window.setInterval(() => {
      setRates((prev) =>
        prev.map((r) => {
          const drift = (Math.random() - 0.48) * 0.35;
          const next = Math.max(1, +(r.price + drift).toFixed(2));
          return { ...r, price: next, change: +(next - r.price).toFixed(2) };
        }),
      );
      setUpdated(new Date());
    }, 4200);
    return () => window.clearInterval(t);
  }, []);

  const strip = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {rates.map((r) => {
        const up = r.change > 0;
        const flat = r.change === 0;
        return (
          <span
            key={key + r.fuel}
            className="flex items-center gap-2.5 border-r border-white/10 px-5 py-1.5 font-mono text-[11px] whitespace-nowrap"
          >
            <span className="tracking-wide text-white/55 uppercase">{r.fuel}</span>
            <span className="font-semibold text-white tabular-nums">
              {r.price.toFixed(2)}
              <span className="ml-1 text-[9.5px] font-normal text-white/45">{r.unit}</span>
            </span>
            <span
              className={
                flat
                  ? "text-white/40"
                  : up
                    ? "text-[#3fe08e]"
                    : "text-[#ff6b6b]"
              }
            >
              {flat ? "• 0.00" : `${up ? "▲" : "▼"} ${Math.abs(r.change).toFixed(2)}`}
            </span>
          </span>
        );
      })}
    </div>
  );

  const time = updated.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="relative z-30 overflow-hidden bg-[#071a33]">
      {/* label + live clock */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-2 bg-gradient-to-r from-[#071a33] via-[#071a33] to-transparent pr-10 pl-4">
        <span className="relative flex h-2 w-2">
          <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-[#00a651] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00a651]" />
        </span>
        <span className="hidden font-mono text-[10px] tracking-[0.22em] text-[#00a651] uppercase sm:inline">
          Live rates · PK
        </span>
        <span className="hidden font-mono text-[10px] text-white/40 sm:inline">{time}</span>
      </div>

      {/* scrolling rates */}
      <div className="marquee flex w-max py-0.5 pl-36 sm:pl-48">
        {strip("a")}
        {strip("b")}
      </div>

      {/* green/blue wave line under the ticker */}
      <svg
        className="block h-[14px] w-full"
        viewBox="0 0 1200 28"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rateWaveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00a651" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1d559b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rateWaveStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00a651" />
            <stop offset="50%" stopColor="#2d8fd6" />
            <stop offset="100%" stopColor="#00a651" />
          </linearGradient>
        </defs>
        {/* filled soft wave */}
        <path
          className="rate-wave-fill"
          d="M0 18 C 100 6, 200 28, 300 16 S 500 4, 600 16 S 800 28, 900 14 S 1100 6, 1200 18 L 1200 28 L 0 28 Z"
          fill="url(#rateWaveFill)"
        />
        {/* animated stroke wave */}
        <path
          className="rate-wave-line"
          d="M0 18 C 100 6, 200 28, 300 16 S 500 4, 600 16 S 800 28, 900 14 S 1100 6, 1200 18"
          fill="none"
          stroke="url(#rateWaveStroke)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
