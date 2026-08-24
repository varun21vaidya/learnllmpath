import Link from "next/link";
import { TRACKS, type ParsedTrack } from "@/lib/tracks";

/** Segmented control: one grouped unit, active track filled. */
export function TrackToggle({ path, active }: { path: string; active: ParsedTrack }) {
  return (
    <nav
      aria-label="Learning track"
      className="inline-flex max-w-full overflow-hidden border border-ink bg-surface shadow-[3px_3px_0_color-mix(in_srgb,var(--color-ink)_15%,transparent)]"
    >
      {TRACKS.map((t, i) => (
        <Link
          key={t.id}
          href={t.id === "short" ? path : `${path}?track=${t.id}`}
          aria-current={active === t.id ? "page" : undefined}
          title={t.blurb}
          className={`px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
            i > 0 ? "border-l border-ink" : ""
          } ${
            active === t.id
              ? "bg-primary text-on-accent"
              : "text-ink hover:bg-callout-bg"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
