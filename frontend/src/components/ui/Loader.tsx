"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const NODES = 22;

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          onDone();
        },
      });

      tl.fromTo(
        "[data-node]",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, stagger: 0.035, ease: "back.out(2)" }
      )
        .fromTo(
          "[data-edge]",
          { strokeDashoffset: 60, opacity: 0 },
          { strokeDashoffset: 0, opacity: 0.5, duration: 0.8, stagger: 0.02, ease: "power2.out" },
          "-=0.6"
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.9,
            ease: "power2.inOut",
            onUpdate: () => setPct(Math.round(counter.v)),
          },
          0
        )
        .to("[data-bar]", { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
        .to("[data-loader-content]", {
          scale: 1.15,
          opacity: 0,
          filter: "blur(14px)",
          duration: 1,
          ease: "power4.inOut",
        })
        .to(
          root.current,
          {
            yPercent: -100,
            duration: 1.2,
            ease: "expo.inOut",
          },
          "-=0.5"
        );
    }, root);

    return () => ctx.revert();
  }, [onDone]);

  const nodes = Array.from({ length: NODES }, (_, i) => {
    const angle = (i / NODES) * Math.PI * 2;
    const radius = i % 3 === 0 ? 34 : i % 3 === 1 ? 56 : 76;
    return {
      x: 100 + Math.cos(angle * 1.7) * radius,
      y: 100 + Math.sin(angle * 1.7) * radius,
    };
  });

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050508]"
    >
      <div data-loader-content className="flex flex-col items-center">
        <svg ref={svg} viewBox="0 0 200 200" className="h-52 w-52">
          {nodes.map((n, i) =>
            nodes.slice(i + 1).map((m, j) => {
              const d = Math.hypot(n.x - m.x, n.y - m.y);
              if (d > 46) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  data-edge
                  x1={n.x}
                  y1={n.y}
                  x2={m.x}
                  y2={m.y}
                  stroke="url(#lg)"
                  strokeWidth="0.6"
                  strokeDasharray="60"
                  opacity="0"
                />
              );
            })
          )}
          {nodes.map((n, i) => (
            <circle key={i} data-node cx={n.x} cy={n.y} r={i % 4 === 0 ? 3 : 1.8} fill="#c7d2fe" />
          ))}
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>
        </svg>

        <div className="mt-8 flex w-56 flex-col gap-3">
          <div className="h-px w-full overflow-hidden bg-white/12">
            <div
              data-bar
              className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-indigo-400 to-fuchsia-400"
            />
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-[0.28em] text-white/45">
            <span>Initialising</span>
            <span className="tabular-nums">{String(pct).padStart(3, "0")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
