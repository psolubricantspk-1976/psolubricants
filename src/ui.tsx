import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";
import { useInView } from "./hooks";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1500,
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);

  const formatted = Number(val.toFixed(decimals)).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

export function SectionHead({
  index,
  label,
  title,
  copy,
  tone = "dark",
  className,
}: {
  index: string;
  label: string;
  title: ReactNode;
  copy?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <div
        className={cn(
          "flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] uppercase",
          light ? "text-oildim" : "text-oil",
        )}
      >
        <span className={light ? "text-clay" : "text-fog"}>{index}</span>
        <span className={cn("h-px w-8", light ? "bg-sand" : "bg-line2")} />
        <span>{label}</span>
      </div>
      <h2
        className={cn(
          "font-display mt-4 text-4xl leading-[0.98] font-bold tracking-tight uppercase sm:text-5xl lg:text-[3.4rem]",
          light ? "text-ink" : "text-paper",
        )}
      >
        {title}
      </h2>
      {copy && (
        <p className={cn("mt-4 max-w-xl text-[15px] leading-relaxed", light ? "text-clay" : "text-fog")}>
          {copy}
        </p>
      )}
    </Reveal>
  );
}
