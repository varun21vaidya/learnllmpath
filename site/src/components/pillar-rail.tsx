import Link from "next/link";
import { slugForPillar } from "@/data/pillar-slugs";
import { CheckIcon } from "@/components/icons";

/** Signature element: the 10-pillar path as a connected dot rail. */
export function PillarRail({
  current,
  completed,
}: {
  current: number;
  completed: boolean[];
}) {
  return (
    <nav aria-label="Position in the roadmap" className="flex w-full max-w-md items-center gap-1 sm:gap-2">
      {Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        const done = completed[i];
        const active = n === current;
        return (
          <span key={n} className="flex flex-1 items-center last:flex-none">
            {n > 1 && (
              <span
                aria-hidden="true"
                className={`h-px flex-1 ${completed[i - 1] || done ? "bg-success" : "bg-line"}`}
              />
            )}
            <Link
              href={`/pillars/${slugForPillar(n)}`}
              aria-label={`Pillar ${n}${done ? " (complete)" : ""}${active ? " (current)" : ""}`}
              aria-current={active ? "page" : undefined}
              title={`Pillar ${n}`}
              className={`grid size-7 shrink-0 place-items-center border border-ink transition-colors ${
                done
                  ? "bg-success text-white"
                  : active
                    ? "bg-primary text-on-accent"
                    : "bg-surface text-muted"
              }`}
            >
              {done ? (
                <CheckIcon width={12} height={12} strokeWidth={3.5} />
              ) : (
                <span className="font-mono text-[10px] font-bold leading-none">{n}</span>
              )}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
