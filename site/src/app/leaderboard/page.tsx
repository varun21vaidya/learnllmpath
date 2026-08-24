import type { Metadata } from "next";
import Link from "next/link";
import { getLeaderboard } from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learn LLM Path: Leaderboard",
  description:
    "Learners grinding through the LLM & Agentic AI roadmap, ranked by resources completed.",
  alternates: { canonical: "/leaderboard" },
};

export default async function LeaderboardPage() {
  let rows: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let dbError: string | null = null;
  try {
    rows = await getLeaderboard(50);
  } catch (err) {
    dbError = String((err as Error)?.message ?? err).slice(0, 160);
    console.error("[leaderboard] query failed:", err);
  }

  const totalItems = ROADMAP.pillars.reduce(
    (n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0),
    0
  );

  return (
    <main className="nb-page nb-stack-lg pt-6">
      <header className="nb-stack">
        <h1 className="nb-title">Leaderboard</h1>
        <p className="nb-subtitle max-w-2xl">
          Ranked by resources completed across the full roadmap. Claim a handle on your{" "}
          <Link href="/profile" className="underline font-bold">
            profile
          </Link>{" "}
          to appear here; you can go private anytime.
        </p>
      </header>

      {dbError && (
        <div className="nb-callout font-bold">
          Database error: <code className="font-mono text-xs">{dbError}</code>
          <div className="text-sm font-semibold mt-1">
            Usually means the schema migration hasn&apos;t run. Apply{" "}
            <code className="font-mono text-xs">site/schema.sql</code> in Supabase SQL Editor
            (or run <code className="font-mono text-xs">npm run db:migrate</code> locally).
          </div>
        </div>
      )}

      {!dbError && rows.length === 0 && (
        <div className="nb-card nb-p-8 text-center nb-stack">
          <p className="font-black text-lg">Nobody here yet 👀</p>
          <p className="nb-subtitle">Be the first on the board.</p>
        </div>
      )}

      {rows.length > 0 && (
        <section className="nb-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-3 border-ink bg-primary text-on-accent text-left">
                <th className="p-3 font-black">#</th>
                <th className="p-3 font-black">Learner</th>
                <th className="p-3 font-black hidden sm:table-cell">Progress</th>
                <th className="p-3 font-black">Pillars</th>
                <th className="p-3 font-black hidden md:table-cell">Cohort</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const pct = Math.round((row.done_count / totalItems) * 100);
                return (
                  <tr key={row.id} className="border-b-2 border-dashed border-line align-top">
                    <td className="p-3 font-mono font-bold">{medal(i)}</td>
                    <td className="p-3 font-semibold">
                      {row.handle ? (
                        <Link href={`/u/${row.handle}`} className="underline decoration-2 underline-offset-2">
                          {row.display_name}
                        </Link>
                      ) : (
                        row.display_name
                      )}
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="flex items-center gap-2 min-w-40">
                        <span className="nb-progress-track h-4! flex-1">
                          <span className="nb-progress-fill block h-full" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="font-mono text-xs">{pct}%</span>
                      </span>
                    </td>
                    <td className="p-3 font-mono">{row.pillars_passed}/10</td>
                    <td className="p-3 font-mono text-xs hidden md:table-cell">{row.joined_month}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

function medal(i: number): string {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return String(i + 1);
}
