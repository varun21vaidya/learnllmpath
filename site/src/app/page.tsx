import Link from "next/link";
import { auth } from "@/lib/auth";
import { getProgress, getNotes, getQuizBests } from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";
import { ItemRow } from "@/components/item-row";

export const dynamic = "force-dynamic";

const PILLAR_ACCENTS = [
  "bg-primary", "bg-accent-cyan", "bg-accent-pink", "bg-accent-purple",
  "bg-primary", "bg-accent-cyan", "bg-accent-pink", "bg-accent-purple",
  "bg-primary", "bg-danger text-white",
];

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const userId = session?.user?.id ?? null;
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
      // DATABASE_URL missing — render public roadmap without tracker state
    }
  }

  return (
    <main className="nb-page nb-stack-lg">
      <header className="nb-stack pt-6 pb-2">
        <h1 className="nb-title">LLM &amp; Agentic AI — Master Roadmap</h1>
        <p className="nb-subtitle max-w-2xl">
          Gap-aware path across 10 pillars: internals → RAG → agents → MCP → security.
          {signedIn
            ? " Check items as you go — pass each pillar quiz to unlock the next."
            : " Browse freely; sign in to track progress, keep notes and take quizzes."}
        </p>
      </header>

      {!signedIn && (
        <div className="nb-callout font-semibold">
          You are browsing read-only.{" "}
          <Link href="/login" className="underline decoration-2 underline-offset-2">
            Sign in
          </Link>{" "}
          to check off items and save notes.
        </div>
      )}

      {ROADMAP.pillars.map((pillar) => {
        const locked =
          signedIn &&
          pillar.number > 1 &&
          !bests.get(pillar.number - 1)?.passed;
        const items = pillar.sections.flatMap((s) => s.items);
        const done = items.filter((i) => progress.has(i.id)).length;

        return (
          <section key={pillar.slugId} id={pillar.slugId} className="nb-card nb-p-5 nb-stack">
            <div className={`flex flex-wrap items-center gap-3 border-b-3 border-ink pb-3 -mx-1 px-1`}>
              <span className={`${PILLAR_ACCENTS[pillar.number - 1]} nb-badge !text-sm !py-1`}>
                Pillar {pillar.number}
              </span>
              <h2 className="font-black text-lg sm:text-xl mr-auto">{pillar.title}</h2>
              {signedIn && (
                <span className="font-mono text-xs">
                  {done}/{items.length}
                </span>
              )}
              <Link
                href={`/quiz/${pillar.number}`}
                className="nb-btn nb-btn-small bg-white"
              >
                Quiz{bests.get(pillar.number)?.passed ? " ✓" : ""}
              </Link>
            </div>

            {locked ? (
              <div className="nb-callout font-bold">
                🔒 Locked — pass the Pillar {pillar.number - 1} quiz (≥70%) to track this pillar.
                Content stays open below.
              </div>
            ) : null}

            {pillar.goal && <p className="nb-subtitle">{pillar.goal}</p>}

            {pillar.sections.map((section) => (
              <div key={section.id}>
                {section.title !== "Core" && (
                  <h3 className="mb-1 mt-2 font-mono text-xs font-bold uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <ul className="divide-y-2 divide-dashed divide-[#c9d2df]">
                  {section.items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      signedIn={signedIn}
                      unlocked={!locked}
                      initialChecked={progress.has(item.id)}
                      initialNote={notes.get(item.id) ?? ""}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {pillar.callouts.map((callout, idx) => (
              <aside key={idx} className="nb-callout">
                <strong className="mr-1">🟡 Gap fill:</strong>
                {callout.text}
              </aside>
            ))}
          </section>
        );
      })}
    </main>
  );
}
