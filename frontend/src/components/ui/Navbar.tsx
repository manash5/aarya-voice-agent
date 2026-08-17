"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SECTION_NAMES, subscribeChapter } from "@/lib/scrollStore";

const LINKS = SECTION_NAMES.map((name, i) => ({ name, id: name.toLowerCase(), index: i }));

export default function Navbar() {
  const [active, setActive] = useState(0);
  const logo = useRef<HTMLAnchorElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    return subscribeChapter((v) => {
      const next = Math.round(v);
      setActive((prev) => (prev === next ? prev : next));

      const compact = Math.min(v, 1);
      gsap.set(logo.current, { scale: 1 - compact * 0.18, letterSpacing: `${0.32 - compact * 0.12}em` });
      gsap.set(nav.current, {
        backgroundColor: `rgba(255,255,255,${0.02 + compact * 0.03})`,
        backdropFilter: `blur(${6 + compact * 10}px)`,
        borderColor: `rgba(255,255,255,${0.04 + compact * 0.06})`,
      });
    });
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-5 pt-5">
      <nav
        ref={nav}
        className="flex w-full max-w-6xl items-center justify-between rounded-full border border-white/5 bg-white/[0.02] px-5 py-3 backdrop-blur-md"
      >
        <a
          ref={logo}
          href="#hero"
          data-cursor="button"
          onClick={(e) => {
            e.preventDefault();
            go("hero");
          }}
          className="origin-left font-display text-[11px] uppercase tracking-[0.32em] text-white/90"
        >
          Dikshanta
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              data-cursor="button"
              onClick={() => go(link.id)}
              className="relative px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors duration-500"
              style={{ color: active === link.index ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)" }}
            >
              {link.name}
              <span
                className="absolute inset-x-3 bottom-1 h-px origin-left bg-gradient-to-r from-indigo-300 to-fuchsia-300 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `scaleX(${active === link.index ? 1 : 0})` }}
              />
            </button>
          ))}
        </div>

        <button
          data-cursor="button"
          onClick={() => go("contact")}
          className="rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70 transition-colors duration-500 hover:border-white/40 hover:text-white"
        >
          Let&apos;s talk
        </button>
      </nav>
    </header>
  );
}
