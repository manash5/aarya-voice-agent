import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Label/value rows for reading a configuration at a glance. A settings form
 * asks you to edit; this tells you what the thing currently is, which is what
 * you want nine times out of ten.
 */
export function PropertyList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={cn("divide-y divide-line", className)}>{children}</dl>;
}

export function Property({
  label,
  children,
  action,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="group flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-meta text-text-3">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className={cn("truncate text-meta text-text-2", mono && "font-mono")}>
          {children}
        </span>
        {action ? (
          <span className="opacity-0 transition-opacity duration-[--fast] focus-within:opacity-100 group-hover:opacity-100">
            {action}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
