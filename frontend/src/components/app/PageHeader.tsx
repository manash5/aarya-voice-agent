import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Breadcrumb({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group -ml-1 inline-flex items-center gap-1 rounded-1 py-0.5 pl-1 pr-2 text-meta text-text-3 transition-colors hover:text-text-2"
    >
      <ChevronLeft
        className="h-3.5 w-3.5 transition-transform duration-[--fast] group-hover:-translate-x-0.5"
        strokeWidth={1.75}
      />
      {label}
    </Link>
  );
}

/**
 * One title per page, set in the display face, with the primary action on the
 * same line. Supporting copy sits below at reading width instead of being
 * squeezed into the gap between them.
 */
export function PageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  breadcrumb?: ReactNode;
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("px-6 pb-8 pt-8 lg:px-10", className)}>
      <div className="mx-auto max-w-[1180px]">
        {breadcrumb ? <div className="mb-3">{breadcrumb}</div> : null}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="min-w-0 max-w-xl">
            <h1 className="display text-display text-text">{title}</h1>
            {eyebrow ? <div className="mt-2.5">{eyebrow}</div> : null}
            {description ? <p className="mt-3 text-ui text-text-3">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      </div>
    </header>
  );
}

/** Standard scroll region under a PageHeader. Keeps every page on one grid. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 pb-20 lg:px-10", className)}>
      <div className="mx-auto max-w-[1180px]">{children}</div>
    </div>
  );
}
