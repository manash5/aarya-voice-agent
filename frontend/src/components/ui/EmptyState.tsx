import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-16 text-center", className)}>
      <h3 className="display text-title text-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-ui text-text-3">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
