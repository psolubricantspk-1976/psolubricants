import { useEffect, useState } from "react";

/** Thin gradient bar across the top showing how far down the page the visitor is. */
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px] bg-transparent" aria-hidden="true">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #00a651 0%, #2d8fd6 60%, #00a651 100%)",
          boxShadow: pct > 0 ? "0 0 12px rgba(0,166,81,0.6)" : "none",
        }}
      />
    </div>
  );
}
