"use client";

import { ElementType, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Stagger unit. "word" for headlines, "char" for short display type. */
  unit?: "word" | "char";
  delay?: number;
  /** Scrub ties the reveal to scroll position so it reverses on scroll-up. */
  scrub?: boolean;
  start?: string;
};

export default function RevealText({
  text,
  as: Tag = "div",
  className = "",
  unit = "word",
  delay = 0,
  scrub = false,
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const pieces = el.querySelectorAll<HTMLElement>("[data-piece]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pieces,
        { yPercent: 115, rotate: 3, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.1,
          delay,
          ease: "expo.out",
          stagger: unit === "char" ? 0.022 : 0.055,
          scrollTrigger: {
            trigger: el,
            start,
            end: scrub ? "bottom 55%" : undefined,
            scrub: scrub ? 1 : false,
            toggleActions: scrub ? undefined : "play reverse play reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, unit, delay, scrub, start]);

  const parts = unit === "word" ? text.split(" ") : text.split("");

  return (
    <Tag ref={ref} className={className}>
      {parts.map((part, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span data-piece className="inline-block will-change-transform">
            {part === " " ? " " : part}
          </span>
          {unit === "word" && i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
