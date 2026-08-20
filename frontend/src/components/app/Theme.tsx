"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "aarya.theme";

/**
 * Runs before first paint, so the page never renders in the wrong theme and
 * then corrects itself. Kept as a string because it has to be inlined into the
 * document head ahead of hydration.
 */
export const THEME_SCRIPT = `(function(){try{
var c=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"system";
var d=c==="dark"||(c==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);
if(d)document.documentElement.setAttribute("data-theme","dark");
}catch(e){}})();`;

const ThemeContext = createContext<{
  choice: ThemeChoice;
  setChoice: (choice: ThemeChoice) => void;
}>({ choice: "system", setChoice: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function apply(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
}

/**
 * The choice lives in localStorage, which is external state - so it is read
 * through a subscription rather than copied into React state by an effect.
 * That also keeps two tabs in step for free, via the storage event.
 */
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readChoice(): ThemeChoice {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeChoice | null) ?? "system";
  } catch {
    return "system";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);

  useEffect(() => {
    // Following the OS is a live subscription, not a one-off read.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readChoice() === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setChoice = useCallback((next: ThemeChoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing: the choice still applies for this session.
    }
    apply(next);
    notify();
  }, []);

  return (
    <ThemeContext.Provider value={{ choice, setChoice }}>{children}</ThemeContext.Provider>
  );
}

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Three-way segmented control. Small enough to live in the rail footer. */
export function ThemeToggle() {
  const { choice, setChoice } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-2 border border-line p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setChoice(value)}
            className={cn(
              "flex h-6 w-7 items-center justify-center rounded-1",
              "transition-colors duration-[--fast] ease-[--ease]",
              active
                ? "bg-raised-active text-text"
                : "text-text-3 hover:text-text-2",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
