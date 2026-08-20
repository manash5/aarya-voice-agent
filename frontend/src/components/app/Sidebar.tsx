"use client";

import {
  AudioLines,
  Activity,
  BookOpen,
  CreditCard,
  LayoutGrid,
  Phone,
  PhoneCall,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/app/Theme";
import { Logo } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Split by lifecycle, not by object type: the things you build an agent out
 * of, then the things that happen once it is answering the phone.
 */
const GROUPS = [
  {
    label: "Build",
    items: [
      { href: "/", label: "Overview", icon: LayoutGrid },
      { href: "/assistants", label: "Agents", icon: AudioLines },
      { href: "/knowledge-base", label: "Knowledge", icon: BookOpen },
      { href: "/tools", label: "Capabilities", icon: Wrench },
    ],
  },
  {
    label: "Operate",
    items: [
      { href: "/phone-numbers", label: "Phone numbers", icon: Phone },
      { href: "/call-logs", label: "Calls", icon: PhoneCall },
      { href: "/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/team", label: "Team", icon: Users },
      { href: "/billing", label: "Billing", icon: CreditCard },
    ],
  },
];

/**
 * The rail is meant to recede. Inactive rows are quiet enough to ignore while
 * you're reading the page; the active row is carried by weight and a 2px
 * accent mark rather than a filled block.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-rail">
      <div className="flex h-14 shrink-0 items-center px-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="rounded-1 transition-opacity hover:opacity-70"
        >
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="eyebrow px-2 pb-2">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-2 px-2 py-1.5 text-ui",
                        "transition-colors duration-[--fast] ease-[--ease]",
                        active
                          ? "bg-accent-subtle font-medium text-text"
                          : "text-text-3 hover:bg-raised-hover hover:text-text-2",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent",
                          "transition-opacity duration-[--base] ease-[--ease]",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-text" : "text-text-3 group-hover:text-text-2",
                        )}
                        strokeWidth={1.75}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-3">
        <button
          type="button"
          className="group flex w-full items-center gap-2.5 rounded-2 px-2 py-1.5 text-left transition-colors duration-[--fast] hover:bg-raised-hover"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-1 bg-line text-micro font-semibold tracking-wide text-text-2">
            SM
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-meta text-text">Local workspace</span>
          </span>
          <Settings
            className="h-3.5 w-3.5 shrink-0 text-text-3 transition-colors group-hover:text-text-2"
            strokeWidth={1.75}
          />
        </button>
        <div className="px-2 pb-0.5">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
