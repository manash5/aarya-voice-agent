"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [mode, setMode] = useState<"default" | "button" | "explore">("default");

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(dot.current, "x", { duration: 0.18, ease: "power3" });
    const yTo = gsap.quickTo(dot.current, "y", { duration: 0.18, ease: "power3" });
    const rxTo = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ryTo = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rxTo(e.clientX);
      ryTo(e.clientY);

      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (!target) {
        setMode("default");
        setLabel(null);
        return;
      }
      const kind = target.dataset.cursor;
      if (kind === "explore") {
        setMode("explore");
        setLabel(target.dataset.cursorLabel ?? "Explore");
      } else if (kind === "button") {
        setMode("button");
        setLabel(null);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const ringSize = mode === "explore" ? 108 : mode === "button" ? 64 : 34;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-white/40 backdrop-blur-[2px] transition-[width,height,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          backgroundColor: mode === "explore" ? "rgba(255,255,255,0.92)" : "transparent",
          borderColor: mode === "default" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
        }}
      >
        {label ? (
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-black">
            {label}
          </span>
        ) : null}
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white transition-opacity duration-300"
        style={{ opacity: mode === "explore" ? 0 : 1 }}
      />
    </div>
  );
}
