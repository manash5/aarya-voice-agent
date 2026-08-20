"use client";

import { ChevronDown } from "lucide-react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";
import type { Option } from "@/lib/catalog";

/**
 * Label, optional description, control, optional hint. The description sits
 * above the control because it tells you what you're about to change; the
 * hint sits below because it qualifies what you just read.
 */
export function Field({
  label,
  description,
  hint,
  children,
  className,
  action,
  htmlFor,
}: {
  label: string;
  description?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  htmlFor?: string;
}) {
  const Wrapper = htmlFor ? "div" : "label";
  return (
    <Wrapper className={cn("block", className)}>
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor={htmlFor}
          className="text-ui font-medium text-text"
        >
          {label}
        </label>
        {action}
      </div>
      {description ? (
        <p className="mt-1 text-meta text-text-3">{description}</p>
      ) : null}
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-meta text-text-3">{hint}</p> : null}
    </Wrapper>
  );
}

/**
 * Controls sit slightly below the canvas rather than above it, so a form
 * reads as fields cut into the page instead of chips stacked on top of it.
 */
const CONTROL = cn(
  "w-full rounded-2 bg-sunken text-ui text-text",
  "border border-line",
  "placeholder:text-text-3",
  "outline-none transition-[border-color,box-shadow,background-color] duration-[--base] ease-[--ease]",
  "hover:border-line-strong",
  "focus:border-accent-line focus:bg-canvas focus:shadow-[0_0_0_3px_var(--accent-subtle)]",
  "disabled:opacity-40",
);

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "h-9 px-3", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "resize-y px-3 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({
  options,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return (
    <div className="relative">
      <select className={cn(CONTROL, "h-9 cursor-pointer appearance-none pl-3 pr-9", className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-raised text-text">
            {option.label}
            {option.planned ? " (planned)" : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3"
        strokeWidth={1.75}
      />
    </div>
  );
}

/** The track fills to the value, so the number isn't the only readout. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  format,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  label?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        aria-label={label}
        className="flex-1"
        style={{
          background: `linear-gradient(to right, var(--text) ${pct}%, var(--line-strong) ${pct}%)`,
        }}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="tnum w-12 shrink-0 text-right font-mono text-meta text-text-2">
        {format ? format(value) : value}
      </span>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start justify-between gap-4 py-2 text-left"
    >
      <span className="min-w-0">
        <span className="block text-ui text-text">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-meta text-text-3">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-8 shrink-0 items-center rounded-full p-0.5",
          "transition-colors duration-[--base] ease-[--ease]",
          checked ? "bg-accent" : "bg-line-strong group-hover:bg-raised-hover",
        )}
      >
        <span
          className={cn(
            "h-3.5 w-3.5 rounded-full bg-raised shadow-sm",
            "transition-transform duration-[--base] ease-[--ease-out]",
            checked ? "translate-x-3.5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

/** Compact selectable panel. The shared shape for pipelines, tasks, voices. */
export function SelectCard({
  selected,
  disabled,
  onClick,
  className,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        // flex-col: a <button> centres its content, which pulls the title of a
        // shorter card out of line with its neighbours in a stretched grid.
        "flex w-full flex-col rounded-2 border p-3 text-left",
        "transition-[background-color,border-color] duration-[--fast] ease-[--ease]",
        selected
          ? "border-accent-line bg-accent-subtle"
          : "border-line bg-raised hover:border-line-strong hover:bg-raised-hover",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Square check used inside SelectCard and the tool picker. */
export function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
        "transition-colors duration-[--fast] ease-[--ease]",
        checked ? "border-accent bg-accent" : "border-line-strong",
      )}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.8"
            stroke="var(--accent-ink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}
