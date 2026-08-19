"use client";

import {
  Bot,
  BookOpen,
  Hammer,
  LayoutGrid,
  Phone,
  PhoneCall,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/assistants", label: "Assistants", icon: Bot },
  { href: "/tools", label: "Tools", icon: Hammer },
  { href: "/knowledge-base", label: "Knowledge base", icon: BookOpen },
  { href: "/phone-numbers", label: "Phone numbers", icon: Phone },
  { href: "/call-logs", label: "Call logs", icon: PhoneCall },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-panel">
      <Link href="/" className="px-4 py-5">
        <Logo />
      </Link>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-elevated font-medium text-ink"
                  : "text-ink-muted hover:bg-elevated/60 hover:text-ink",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-ink-dim")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line-soft p-2">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-elevated text-[11px] font-medium text-ink">
            SM
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs text-ink">Local workspace</span>
            <span className="block truncate text-[11px] text-ink-dim">No account connected</span>
          </span>
          <Settings className="h-3.5 w-3.5 text-ink-dim" />
        </div>
      </div>
    </aside>
  );
}
