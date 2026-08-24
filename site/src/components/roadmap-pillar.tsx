import Link from "next/link";
import { auth } from "@/lib/auth";
import { getProgress, getNotes, getQuizBests, getVoteData } from "@/lib/db";
import type { Pillar, TrackId } from "@/data/types";
import { ItemRow } from "@/components/item-row";
import { pillarAccent } from "@/lib/ui";
import { slugForPillar } from "@/data/pillar-slugs";
import { LockIcon } from "@/components/icons";

export async function RoadmapPillar({
  pillar,
  userId,
  track = "short",
}: {
  pillar: Pillar;
  userId?: string | null;
  track?: TrackId;
}) {
  const signedIn = Boolean(userId);
  let progress = new Set<string>();
  let notes = new Map<string, string>();
  let bests = new Map<number, { passed: boolean; best_pct: number }>();

  if (userId) {
    try {
      [progress, notes, bests] = await Promise.all([
        getProgress(userId),
        getNotes(userId),
        getQuizBests(userId),
      ]);
    } catch {
      // DB unavailable: render read-only
    }
  }

  const locked =
    signedIn && pillar.number > 1 && !bests.get(pillar.number - 1)?.passed;
  const items = pillar.sections.flatMap((s) => s.items);
  const done = items.filter((i) => progress.has(i.id)).length;

  let votes;
  try {
    votes = await getVoteData(
      items.map((i) => i.id),
      userId ?? null
    );
  } catch {
    votes = new Map();
  }

  const prevSlug = slugForPillar(pillar.number - 1);
  const nextSlug = slugForPillar(pillar.number + 1);

  return (
    <section id={pillar.slugId} className="nb-card nb-p-5 nb-stack">
      <div className="flex flex-wrap items-center gap-3 border-b-3 border-ink pb-3 -mx-1 px-1">
        <span className={`${pillarAccent(pillar.number)} nb-badge text-sm! py-1!`}>
          Pillar {pillar.number}
        </span>
        <h1 className="font-black text-lg sm:text-xl mr-auto">{pillar.title}</h1>
        {signedIn && (
          <span className="font-mono text-xs">
            {done}/{items.length}
          </span>
        )}
        <Link href={`/quiz/${pillar.number}`} className="nb-btn nb-btn-small bg-surface">
          Quiz{bests.get(pillar.number)?.passed ? " ✓" : ""}
        </Link>
      </div>

      {!signedIn && (
        <div className="nb-callout font-bold">
          Sign in to track this pillar and save notes. The resource list stays open to everyone.
        </div>
      )}

      {locked ? (
        <div className="nb-callout font-bold">
          <LockIcon className="mr-1 inline-block" width={16} height={16} />
          Locked. Pass the Pillar {pillar.number - 1} quiz (≥70%) to track this pillar.
          Content stays open below.
        </div>
      ) : null}

      {pillar.goal && <p className="nb-subtitle">{pillar.goal}</p>}

      {pillar.sections.map((section) => (
        <div key={section.id}>
          {section.title !== "Core" && (
            <h2 className="mb-1 mt-2 font-mono text-xs font-bold uppercase tracking-wider">
              {section.title}
            </h2>
          )}
          <ul className="divide-y-2 divide-dashed divide-line">
            {section.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                signedIn={signedIn}
                unlocked={!locked}
                initialChecked={progress.has(item.id)}
                initialNote={notes.get(item.id) ?? ""}
                votes={votes.get(item.id)}
                track={track}
              />
            ))}
          </ul>
        </div>
      ))}

      {track !== "short" &&
        (pillar.extras?.[track] ?? []).map((group) => (
          <div key={`${track}-${group.sectionTitle}`}>
            <h2 className="mb-1 mt-3 font-mono text-xs font-bold uppercase tracking-wider">
              {track === "deep" ? "Deeper" : "Free"} · {group.sectionTitle}
            </h2>
            <ul className="divide-y-2 divide-dashed divide-line">
              {group.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  signedIn={signedIn}
                  unlocked={!locked}
                  initialChecked={progress.has(item.id)}
                  initialNote={notes.get(item.id) ?? ""}
                  votes={votes.get(item.id)}
                  track="short"
                />
              ))}
            </ul>
          </div>
        ))}

      {pillar.callouts.map((callout, idx) => (
        <aside key={idx} className="nb-callout">
          <strong className="mr-1">Gap fill:</strong>
          {callout.text.replace(/^Gap fill::?\s*/i, "")}
        </aside>
      ))}

      <nav className="flex justify-between gap-3 pt-2 border-t-3 border-ink">
        {prevSlug ? (
          <Link href={`/pillars/${prevSlug}`} className="nb-btn nb-btn-small bg-surface">
            ← Pillar {pillar.number - 1}
          </Link>
        ) : (
          <span />
        )}
        {nextSlug && (
          <Link href={`/pillars/${nextSlug}`} className="nb-btn nb-btn-small bg-surface">
            Pillar {pillar.number + 1} →
          </Link>
        )}
      </nav>
    </section>
  );
}

export async function loadTrackerContext() {
  const session = await auth();
  return {
    signedIn: Boolean(session?.user),
    userId: session?.user?.id ?? null,
  };
}
