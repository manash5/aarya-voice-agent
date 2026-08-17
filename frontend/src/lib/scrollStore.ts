// Tiny external store driving the shared "chapter" value (continuous scroll
// position across sections, e.g. 1.35 = 35% through section index 1).
// R3F reads it every frame via getChapter() directly inside useFrame — no
// React re-renders needed there. UI that needs to react (nav, dots) should
// subscribe and round/threshold to avoid re-rendering at 60fps.

type Listener = (v: number) => void;

let chapter = 0;
const listeners = new Set<Listener>();

export function setChapter(v: number) {
  chapter = v;
  listeners.forEach((l) => l(v));
}

export function getChapter() {
  return chapter;
}

export function subscribeChapter(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const SECTION_NAMES = ["Hero", "About", "Skills", "Work", "Contact"] as const;
