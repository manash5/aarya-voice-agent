import { cn } from "@/lib/cn";

/**
 * Monogram: the apex and left stroke of a capital A, whose right stroke keeps
 * going and wraps into the bowl of a lowercase a - so the mark reads "Aa" for
 * aarya rather than being a plain letter A.
 */
export function LogoMark({
  size = 22,
  strokeWidth = 2.9,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <g transform="translate(0.9 0)">
        <path d="M3.2 27.5 13.6 5l5.8 13.4" />
        <path d="M19.4 18.4a5.2 5.2 0 1 1-2.5 6.6" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={24} className="text-accent" />
      <span className="text-lg font-semibold lowercase tracking-[-0.045em] text-ink">aarya</span>
    </span>
  );
}
