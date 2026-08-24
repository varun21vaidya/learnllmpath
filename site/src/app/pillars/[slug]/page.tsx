import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ALL_PILLAR_SLUGS, pillarBySlug, slugForPillar } from "@/data/pillar-slugs";
import { RoadmapPillar } from "@/components/roadmap-pillar";
import { TrackToggle } from "@/components/track-toggle";
import { parseTrack } from "@/lib/tracks";
import { PillarRail } from "@/components/pillar-rail";
import { getProgress } from "@/lib/db";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return ALL_PILLAR_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pillar = pillarBySlug(slug);
  if (!pillar) return { title: "Learn LLM Path: Page Not Found" };
  return {
    title: `${pillar.title} (Pillar ${pillar.number}) | Learn LLM Path`,
    description:
      pillar.goal ||
      pillar.focus ||
      `Follow Pillar ${pillar.number} of the Learn LLM Path roadmap: ${pillar.title}.`,
    alternates: { canonical: `/pillars/${slug}` },
  };
}

export default async function PillarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ track?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const pillar = pillarBySlug(slug);
  if (!pillar) notFound();

  const track = parseTrack(sp.track);
  const session = await auth();
  const userId = session?.user?.id ?? null;
  let progress = new Set<string>();
  if (userId) {
    try {
      progress = await getProgress(userId);
    } catch {}
  }
  const completed = Array.from({ length: 10 }, (_, index) => {
    const itemIds = pillarBySlug(slugForPillar(index + 1))?.sections.flatMap((section) => section.items) ?? [];
    return itemIds.length > 0 && itemIds.every((item) => progress.has(item.id));
  });

  return (
    <main className="nb-page nb-stack pt-6">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
        <Link href="/" className="underline underline-offset-2 hover:decoration-primary">
          Learn LLM Path
        </Link>{" "}
        / pillar {pillar.number} of 10
      </p>
      <TrackToggle path={`/pillars/${slug}`} active={track} />
      <PillarRail current={pillar.number} completed={completed} />
      {track !== "short" && (
        <p className="text-xs font-mono text-muted">
          {track === "deep"
            ? "Deeper track: heavier resources for job-ready depth. Concepts you already checked stay checked."
            : "Free track: every swapped resource costs $0. Concepts you already checked stay checked."}
        </p>
      )}
      <RoadmapPillar pillar={pillar} userId={userId} track={track} />
      <nav className="flex justify-between text-xs font-mono text-muted">
        {pillar.number > 1 ? (
          <Link href={`/pillars/${slugForPillar(pillar.number - 1)}`} className="underline">
            ← previous pillar
          </Link>
        ) : (
          <span />
        )}
        {pillar.number < 10 && (
          <Link href={`/pillars/${slugForPillar(pillar.number + 1)}`} className="underline">
            next pillar →
          </Link>
        )}
      </nav>
    </main>
  );
}
