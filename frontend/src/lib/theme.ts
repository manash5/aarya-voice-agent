// Per-chapter mood used by the 3D scene and the CSS background morph.
// index: 0 hero, 1 about, 2 skills, 3 work, 4 contact.
export const CHAPTER_HUES = [210, 275, 160, 30, 335];

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function hueAt(chapter: number) {
  const clamped = Math.max(0, Math.min(CHAPTER_HUES.length - 1, chapter));
  const i = Math.floor(clamped);
  const t = clamped - i;
  const next = CHAPTER_HUES[Math.min(i + 1, CHAPTER_HUES.length - 1)];
  // shortest hue path
  let a = CHAPTER_HUES[i];
  let b = next;
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (a + diff * t + 360) % 360;
}
