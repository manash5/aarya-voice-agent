"use client";

import { useRef } from "react";
import gsap from "gsap";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  className?: string;
};

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "solid",
  className = "",
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = wrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.32, y: y * 0.42, duration: 0.7, ease: "power3.out" });
    gsap.to(inner.current, { x: x * 0.14, y: y * 0.2, duration: 0.7, ease: "power3.out" });
    gsap.to(el, {
      rotateX: -y * 0.25,
      rotateY: x * 0.25,
      duration: 0.7,
      ease: "power3.out",
      transformPerspective: 600,
    });
  };

  const handleLeave = () => {
    gsap.to(wrap.current, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: "elastic.out(1, 0.4)",
    });
    gsap.to(inner.current, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
  };

  const base =
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-sm font-medium tracking-wide transition-colors duration-500";
  const skin =
    variant === "solid"
      ? "bg-white text-black"
      : "border border-white/20 text-white/80 hover:text-white backdrop-blur-md";

  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 -translate-y-full bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-60 bg-gradient-to-br from-indigo-400 to-fuchsia-500"
      />
      <span ref={inner} className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  );

  return (
    <div
      ref={wrap}
      data-cursor="button"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`inline-block [transform-style:preserve-3d] ${className}`}
    >
      {href ? (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={`${base} ${skin}`}>
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={`${base} ${skin}`}>
          {content}
        </button>
      )}
    </div>
  );
}
