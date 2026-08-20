"use client";

import { Menu as MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/app/Sidebar";
import { ThemeProvider } from "@/components/app/Theme";
import { IconButton, Logo, ToastProvider } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Two layouts rather than one shrunk down: at lg the rail is permanent and the
 * page owns the full canvas; below it the rail becomes an overlay drawer and
 * the page gains a compact top bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [drawer]);

  return (
    <ThemeProvider>
      <ToastProvider>
      <div className="flex h-full overflow-hidden">
        <aside className="hidden w-60 shrink-0 border-r border-line lg:block">
          <Sidebar />
        </aside>

        {/* Drawer, below lg only. */}
        <div className={cn("lg:hidden", drawer ? "" : "pointer-events-none")}>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-text/12 transition-opacity duration-[--base]",
              drawer ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 border-r border-line",
              "transition-transform duration-[--base] ease-[--ease-out]",
              drawer ? "translate-x-0" : "-translate-x-full",
            )}
            role="dialog"
            aria-modal={drawer}
            aria-label="Navigation"
            aria-hidden={!drawer}
          >
            <Sidebar onNavigate={() => setDrawer(false)} />
            <div className="absolute right-2 top-3">
              <IconButton label="Close navigation" onClick={() => setDrawer(false)}>
                <X className="h-4 w-4" strokeWidth={1.75} />
              </IconButton>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4 lg:hidden">
            <IconButton label="Open navigation" onClick={() => setDrawer(true)}>
              <MenuIcon className="h-4 w-4" strokeWidth={1.75} />
            </IconButton>
            <Logo />
          </div>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
