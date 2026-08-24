import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgressSafe, getPublicProfileByHandleSafe, getPublicUserStatsSafe } from "@/lib/profile-view";
import { ROADMAP } from "@/data/roadmap";
import { pillarAccent } from "@/lib/ui";
import { slugForPillar } from "@/data/pillar-slugs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `@${handle} on Learn LLM Path`,
    description: `Follow @${handle}'s progress through the LLM & Agentic AI roadmap.`,
    openGraph: {
      title: `@${handle} on Learn LLM Path`,
      images: [`/api/card/${handle}`],
    },
    twitter: { card: "summary_large_image", images: [`/api/card/${handle}`] },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getPublicProfileByHandleSafe(handle);
  if (!profile) {
    // Distinguish in server logs: missing handle vs private profile vs DB error.
    const { probeHandle } = await import("@/lib/profile-view");
    console.log(`[u/${handle}] not found: ${await probeHandle(handle)}`);
    notFound();
  }

  const [completedIds, statsData] = await Promise.all([
    getProgressSafe(profile.id),
    getPublicUserStatsSafe(profile.id),
  ]);

  const totalItems = ROADMAP.pillars.reduce(
    (n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0),
    0
  );
  const pct = totalItems ? Math.round((completedIds.size / totalItems) * 100) : 0;
  const displayName = profile.name || profile.handle || "Learner";

  return (
    <main className="nb-page nb-stack-lg pt-6">
      <header className="nb-card nb-p-5 nb-stack">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="nb-title mr-auto">{displayName}</h1>
          {profile.handle && (
            <span className="nb-badge nb-badge-course text-base! px-2! py-1!">
              @{profile.handle}
            </span>
          )}
        </div>
        <p className="font-mono text-xs text-muted">learning since {statsData.joined_month}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="nb-card nb-p-4 text-center">
          <p className="font-black text-2xl">{pct}%</p>
          <p className="text-[10px] font-mono uppercase">complete</p>
        </div>
        <div className="nb-card nb-p-4 text-center">
          <p className="font-black text-2xl">
            {completedIds.size}/{totalItems}
          </p>
          <p className="text-[10px] font-mono uppercase">resources done</p>
        </div>
        <div className="nb-card nb-p-4 text-center">
          <p className="font-black text-2xl">{statsData.pillars_passed}/10</p>
          <p className="text-[10px] font-mono uppercase">pillars passed</p>
        </div>
      </section>

      <section className="nb-card nb-p-5 nb-stack">
        <h2 className="font-black text-lg">Pillar progress</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROADMAP.pillars.map((pillar) => {
            const items = pillar.sections.flatMap((s) => s.items);
            const done = items.filter((i) => completedIds.has(i.id)).length;
            const p = items.length ? Math.round((done / items.length) * 100) : 0;
            return (
              <Link
                key={pillar.slugId}
                href={`/pillars/${slugForPillar(pillar.number)}`}
                className="nb-stack hover:underline"
              >
                <span className="flex justify-between text-xs font-bold">
                  <span>
                    <span className={`${pillarAccent(pillar.number)} nb-badge mr-2`}>
                      P{pillar.number}
                    </span>
                    {pillar.title}
                  </span>
                  <span className="font-mono">{p}%</span>
                </span>
                <div className="nb-progress-track h-4!">
                  <div className="nb-progress-fill" style={{ width: `${p}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="text-xs font-mono text-muted">
        Want your own tracker?{" "}
        <a href="/login" className="underline font-bold">
          Start the path →
        </a>
      </p>
    </main>
  );
}
