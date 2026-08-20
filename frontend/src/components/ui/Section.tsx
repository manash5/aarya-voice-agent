import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * A titled region of a page. No card by default - grouping comes from the
 * heading and the space around it. Pass `card` only when the content is a
 * list or table that genuinely needs an edge.
 */
export function Section({
  title,
  description,
  action,
  card = false,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  card?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(className)}>
      {title ? (
        <SectionHeader title={title} description={description} action={action} />
      ) : null}
      {card ? (
        <div className="overflow-hidden rounded-3 border border-line bg-raised">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-4 flex items-start justify-between gap-6", className)}>
      <div className="min-w-0">
        <h2 className="text-heading font-medium text-text">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-prose text-meta text-text-3">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/**
 * Figures in a row divided by rules, not four identical boxes. The number is
 * the content; the label is the caption.
 */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-y-6 border-y border-line py-5 sm:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "border-l border-line pl-5",
        // The rule separates columns, so it has to drop at the start of every
        // row - which is every odd item at two columns, the first at four.
        "[&:nth-child(odd)]:border-l-0 [&:nth-child(odd)]:pl-0",
        "sm:[&:nth-child(odd)]:border-l sm:[&:nth-child(odd)]:pl-5",
        "sm:first:border-l-0 sm:first:pl-0",
      )}
    >
      <p className="text-meta text-text-3">{label}</p>
      <p className="display tnum mt-1.5 text-title text-text">{value}</p>
    </div>
  );
}
