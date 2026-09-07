import { useEffect, useRef, useState } from "react";

type Bubble = { id: number; x: number; y: number; size: number; hue: "green" | "blue" };
type Ripple = { id: number; x: number; y: number };

/**
 * Cursor bubble trail + click ripples.
 * - A soft glowing orb follows the pointer with easing (rAF, no re-renders).
 * - Small bubbles spawn as the pointer travels and float upward.
 * - Clicking emits an expanding ripple ring.
 * Disabled automatically on touch devices and when the user prefers reduced motion.
 */
export default function CursorFX() {
  const orbRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [enabled, setEnabled] = useState(false);

  // pointer + eased orb position kept in refs so we never re-render on move
  const target = useRef({ x: -100, y: -100 });
  const orbPos = useRef({ x: -100, y: -100 });
  const lastSpawn = useRef(0);
  const lastPoint = useRef({ x: -100, y: -100 });
  const seq = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      // spawn a bubble when the pointer has travelled far enough, throttled by time
      const now = performance.now();
      const dx = e.clientX - lastPoint.current.x;
      const dy = e.clientY - lastPoint.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 26 && now - lastSpawn.current > 55) {
        lastSpawn.current = now;
        lastPoint.current = { x: e.clientX, y: e.clientY };
        const id = ++seq.current;
        const bubble: Bubble = {
          id,
          x: e.clientX + (Math.random() * 16 - 8),
          y: e.clientY + (Math.random() * 12 - 6),
          size: 6 + Math.random() * 12,
          hue: Math.random() > 0.45 ? "green" : "blue",
        };
        setBubbles((prev) => (prev.length > 22 ? [...prev.slice(-22), bubble] : [...prev, bubble]));
        window.setTimeout(() => setBubbles((prev) => prev.filter((b) => b.id !== id)), 1200);
      }
    };

    const onDown = (e: PointerEvent) => {
      const id = ++seq.current;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 750);
    };

    const tick = () => {
      // ease the big orb toward the pointer, snap the small dot
      orbPos.current.x += (target.current.x - orbPos.current.x) * 0.14;
      orbPos.current.y += (target.current.y - orbPos.current.y) * 0.14;
      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${orbPos.current.x}px, ${orbPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true">
      {/* soft trailing glow */}
      <div
        ref={orbRef}
        className="cursor-orb"
        style={{
          width: 260,
          height: 260,
          background: "radial-gradient(circle, rgba(0,166,81,0.16) 0%, rgba(29,85,155,0.10) 42%, transparent 68%)",
          filter: "blur(6px)",
        }}
      />
      {/* crisp leading dot */}
      <div
        ref={dotRef}
        className="cursor-orb"
        style={{
          width: 9,
          height: 9,
          background: "#00a651",
          boxShadow: "0 0 14px rgba(0,166,81,0.85)",
        }}
      />
      {/* floating bubbles */}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="cursor-orb bubble-pop"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            border: `1.5px solid ${b.hue === "green" ? "rgba(0,166,81,0.75)" : "rgba(90,160,235,0.7)"}`,
            background: b.hue === "green" ? "rgba(0,166,81,0.14)" : "rgba(90,160,235,0.12)",
          }}
        />
      ))}
      {/* click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="cursor-orb click-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: 46,
            height: 46,
            border: "2px solid rgba(0,166,81,0.7)",
          }}
        />
      ))}
    </div>
  );
}
