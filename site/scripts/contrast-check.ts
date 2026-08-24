function lum(hex: string): number {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a: string, b: string): number {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const ON = "#1c293c";
const WHITE = "#ffffff";
const INK_DARK = "#edf1f8";
const pairs: [string, string, string][] = [
  ["on-accent vs yellow", ON, "#fdc800"],
  ["on-accent vs cyan", ON, "#a6faff"],
  ["on-accent vs pink", ON, "#ff6b9d"],
  ["on-accent vs purple", ON, "#c5a3ff"],
  ["on-accent vs warning-light(d97706)", ON, "#d97706"],
  ["on-accent vs warning-dark(f5a623)", ON, "#f5a623"],
  ["white vs red dc2626", WHITE, "#dc2626"],
  ["on-accent vs red dc2626", ON, "#dc2626"],
  ["white vs green 16a34a", WHITE, "#16a34a"],
  ["white vs green 15803d", WHITE, "#15803d"],
  ["white vs green 166534", WHITE, "#166534"],
  ["white vs course 432dd7", WHITE, "#432dd7"],
  ["on-accent vs course 432dd7", ON, "#432dd7"],
  ["ink-dark vs surface (body)", INK_DARK, "#212c40"],
  ["muted vs surface (secondary)", "#aab9d0", "#212c40"],
  ["muted vs paper", "#aab9d0", "#0f131b"],
  ["danger ff5d5d vs bad-bg (error txt)", "#ff5d5d", "#42191c"],
  ["success 2ee06a vs surface", "#2ee06a", "#212c40"],
  ["FAIL-CHECK: ink-dark vs yellow", INK_DARK, "#fdc800"],
  ["FAIL-CHECK: ink-dark vs cyan", INK_DARK, "#a6faff"],
];
for (const [label, fg, bg] of pairs) {
  const r = ratio(fg, bg);
  const aa = r >= 4.5 ? "AAA-pass(4.5)" : r >= 3 ? "large-only" : "FAIL";
  console.log(`${r.toFixed(2).padStart(5)}  ${aa.padEnd(14)} ${label}`);
}
