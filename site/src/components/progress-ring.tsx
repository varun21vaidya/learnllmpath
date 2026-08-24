import { CheckIcon } from "@/components/icons";

/**
 * The one progress visual used everywhere (pillar cards, pillar header, overall).
 * 0% = outline track, partial = accent fill, 100% = success fill + check.
 */
export function ProgressRing({
  pct,
  size = 48,
  label,
}: {
  pct: number;
  size?: number;
  label?: string;
}) {
  const stroke = Math.max(3, Math.round(size / 12));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const complete = clamped >= 100;
  const fill = complete
    ? "var(--color-success)"
    : clamped > 0
      ? "var(--color-primary)"
      : "transparent";

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
        />
        {clamped > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            stroke={fill}
            strokeDasharray={`${(clamped / 100) * c} ${c}`}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {complete ? (
          <CheckIcon width={size * 0.45} height={size * 0.45} className="text-success" />
        ) : (
          <span
            className={`font-mono font-bold leading-none ${clamped === 0 ? "text-muted" : ""}`}
            style={{ fontSize: Math.max(9, size * 0.24) }}
          >
            {clamped}%
          </span>
        )}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
