/* Bright accent chips keep navy text in BOTH themes (WCAG AA verified).
   P10 red uses white: 4.83:1 vs navy's 3.04:1 on #dc2626. */
export const PILLAR_ACCENTS = [
  "bg-primary text-on-accent",
  "bg-accent-cyan text-on-accent",
  "bg-accent-pink text-on-accent",
  "bg-accent-purple text-on-accent",
  "bg-primary text-on-accent",
  "bg-accent-cyan text-on-accent",
  "bg-accent-pink text-on-accent",
  "bg-accent-purple text-on-accent",
  "bg-primary text-on-accent",
  "bg-accent-red text-white",
];

export function pillarAccent(n: number): string {
  return PILLAR_ACCENTS[(n - 1) % PILLAR_ACCENTS.length];
}
