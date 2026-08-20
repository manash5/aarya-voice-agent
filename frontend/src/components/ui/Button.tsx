"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Four levels, and the gap between them is deliberate: primary is the only
 * filled surface, danger never competes with it, and ghost has no container
 * until you touch it.
 *
 * Primary is a strong neutral rather than the accent - the accent is reserved
 * for state (selection, active nav, focus, live), so an action never reads as
 * a status.
 */
const VARIANT: Record<Variant, string> = {
  primary:
    "bg-text text-canvas hover:bg-white active:bg-text disabled:hover:bg-text",
  secondary:
    "bg-raised text-text border border-line hover:bg-raised-hover hover:border-line-strong",
  ghost: "text-text-2 hover:bg-raised hover:text-text",
  danger: "text-danger hover:bg-danger/10",
};

const SIZE: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-meta",
  md: "h-8 gap-1.5 px-3 text-ui",
  lg: "h-9 gap-2 px-4 text-ui",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-2 font-medium",
        "transition-[background-color,border-color,color,transform] duration-[--fast] ease-[--ease]",
        // A single pixel of lift. Enough to feel responsive, not enough to move.
        "hover:-translate-y-px active:translate-y-0",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

/** Square, label-less action. Ghost until hovered, so toolbars stay quiet. */
export function IconButton({
  label,
  size = "md",
  variant = "ghost",
  className,
  children,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  size?: "sm" | "md";
  variant?: "ghost" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2",
        "transition-colors duration-[--fast] ease-[--ease]",
        "disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        variant === "danger"
          ? "text-text-3 hover:bg-danger/10 hover:text-danger"
          : "text-text-3 hover:bg-raised hover:text-text",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
