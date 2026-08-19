import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-line px-8 py-5">
      <div>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-dim">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
