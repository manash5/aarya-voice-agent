"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setChapter } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Registers a section as chapter `index` in the shared scroll timeline.
 * While the section crosses the viewport, the global chapter value scrubs
 * continuously from `index` to `index + 1`, driving the 3D scene, lighting
 * and background gradient in sync with native scroll position.
 */
export function useChapter(index: number, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => setChapter(index + self.progress),
      onToggle: (self) => {
        if (self.isActive) setChapter(index + self.progress);
      },
    });

    return () => trigger.kill();
  }, [index, ref]);
}
