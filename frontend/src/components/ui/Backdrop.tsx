"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { getChapter } from "@/lib/scrollStore";
import { hueAt } from "@/lib/theme";

// Ambient background: two slow-drifting gradient blooms whose hue tracks the
// scroll chapter, plus a static grain layer. Updated in a rAF loop rather than
// via React state so it never triggers a re-render.
export default function Backdrop() {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const chapter = getChapter();
      const h = hueAt(chapter);
      const t = performance.now() / 1000;

      if (a.current) {
        a.current.style.background = `radial-gradient(closest-side, hsla(${h}, 78%, 52%, 0.42), transparent)`;
        a.current.style.transform = `translate3d(${Math.sin(t * 0.11) * 12}%, ${
          Math.cos(t * 0.09) * 10 - chapter * 4
        }%, 0)`;
      }
      if (b.current) {
        b.current.style.background = `radial-gradient(closest-side, hsla(${
          (h + 62) % 360
        }, 82%, 55%, 0.32), transparent)`;
        b.current.style.transform = `translate3d(${Math.cos(t * 0.08) * -14}%, ${
          Math.sin(t * 0.12) * 12 + chapter * 3
        }%, 0)`;
      }
      if (root.current) {
        root.current.style.backgroundColor = `hsl(${h}, 32%, ${4 + Math.sin(chapter) * 1.2}%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    gsap.to(".grain-layer", {
      keyframes: [
        { x: "2%", y: "-3%" },
        { x: "-3%", y: "2%" },
        { x: "1%", y: "3%" },
        { x: 0, y: 0 },
      ],
      duration: 0.9,
      repeat: -1,
      ease: "none",
    });
  }, []);

  return (
    <div ref={root} className="fixed inset-0 -z-10 overflow-hidden bg-[#050508]">
      <div
        ref={a}
        className="absolute left-[-20%] top-[-15%] h-[95vmax] w-[95vmax] rounded-full blur-[60px] will-change-transform"
      />
      <div
        ref={b}
        className="absolute right-[-25%] bottom-[-20%] h-[85vmax] w-[85vmax] rounded-full blur-[70px] will-change-transform"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,2,6,0.85)_100%)]" />
      <div className="grain-layer absolute inset-[-10%] opacity-[0.16] mix-blend-overlay [background-image:var(--grain)] [background-size:180px_180px]" />
    </div>
  );
}
