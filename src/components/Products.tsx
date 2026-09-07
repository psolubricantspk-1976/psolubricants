import React, { useState } from "react";
import { CATS, PRODUCTS, type Category } from "../data";
import { Arrow, Cart, Car, Bike, Truck, Grid } from "../icons";
import { Reveal } from "../ui";
import { cn } from "../utils/cn";
import { formatMoney } from "../orders";

const CAT_ICON: Record<string, React.ReactElement> = {
  car: <Car className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
  gear: <Grid className="h-4 w-4" />,
};

export default function Products({ onBuy }: { onBuy: (id: string) => void }) {
  const [cat, setCat] = useState<Category>("all");
  const rows = cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);

  return (
    <section id="products" className="grid-light scroll-mt-24 bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <Reveal>
            <span className="font-mono text-[11px] tracking-[0.22em] text-moss uppercase">Our Range</span>
            <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Motor Oils & Lubricants</h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-clay">A complete range of engine oils, gear oils, greases and specialty lubricants for every vehicle and industry.</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-[12px] tracking-wide transition-all",
                    cat === c.id
                      ? "border-oil bg-oil text-paper"
                      : "border-sand bg-paper text-clay hover:border-oil hover:text-ink",
                  )}
                >
                  {c.id !== "all" && CAT_ICON[c.id]}
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <article className="lift-hover group flex h-full flex-col rounded-2xl border border-sand bg-paper p-5 hover:border-oil hover:shadow-[0_22px_55px_rgba(0,166,81,0.20)]">
                <span className={cn("absolute -mt-1 ml-1 rounded-md px-2.5 py-1 font-mono text-[9.5px] font-semibold tracking-wider", p.tag === "BEST SELLER" ? "bg-oil text-paper" : "bg-moss text-paper")}>{p.tag}</span>
                <div className="flex h-44 items-center justify-center rounded-xl bg-cream/80 p-4">
                  <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" loading="lazy" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink">{p.name}</h3>
                <p className="mt-0.5 font-mono text-[10.5px] text-moss">{p.grade}</p>
                <ul className="mt-3 space-y-1.5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[12px] text-clay">
                      <span className="mt-0.5 text-moss"><Arrow className="h-3 w-3" /></span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between border-t border-sand pt-4">
                  <div>
                    <div className="font-display text-xl font-extrabold text-ink">{formatMoney(p.price)}</div>
                    <div className="font-mono text-[10px] text-fog">{p.pack}</div>
                  </div>
                  <button onClick={() => onBuy(p.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-oil text-paper transition-transform hover:scale-110 hover:bg-paper hover:text-ink" aria-label={`Add ${p.name} to cart`}>
                    <Cart className="h-4 w-4" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
