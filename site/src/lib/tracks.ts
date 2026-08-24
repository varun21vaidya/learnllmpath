import type { ItemAlt, TrackId } from "@/data/types";

export type { TrackId };
export type ParsedTrack = TrackId;

export const TRACKS: { id: TrackId; label: string; blurb: string }[] = [
  { id: "short", label: "Short & concise", blurb: "The default curated path" },
  { id: "deep", label: "Deeper", blurb: "Job-ready depth, more resources" },
  { id: "free", label: "100% Free", blurb: "Same depth, zero paid resources" },
];

export function parseTrack(value: string | undefined): TrackId {
  return value === "deep" || value === "free" ? value : "short";
}

export function activeAlt(
  item: { alt?: { deep?: ItemAlt; free?: ItemAlt } },
  track: TrackId
): ItemAlt | null {
  if (track === "short") return null;
  return item.alt?.[track] ?? null;
}

/** Deep/free badge shown on swapped resources. */
export function altBadgeClass(track: TrackId): string {
  return track === "deep" ? "bg-accent-purple text-on-accent" : "bg-accent-cyan text-on-accent";
}
