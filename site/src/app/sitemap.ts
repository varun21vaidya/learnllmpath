import type { MetadataRoute } from "next";
import { ROADMAP } from "@/data/roadmap";
import { slugForPillar } from "@/data/pillar-slugs";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://learnllmpath.com").replace(/\/+$/, "");

/** Public profile handles are DB-driven; skip silently when no database is configured. */
async function publicProfileUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const { getLeaderboard } = await import("@/lib/db");
    const rows = await getLeaderboard(200);
    return rows
      .filter((r) => r.handle)
      .map((r) => ({
        url: `${baseUrl}/u/${r.handle}`,
        changeFrequency: "weekly" as const,
        priority: 0.3,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const roadmapDate = ROADMAP.generatedAt ? new Date(ROADMAP.generatedAt) : undefined;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/plan`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, changeFrequency: "daily", priority: 0.4 },
    { url: `${baseUrl}/sequence`, lastModified: roadmapDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/portfolio`, lastModified: roadmapDate, changeFrequency: "monthly", priority: 0.5 },
  ];

  const pillarPages: MetadataRoute.Sitemap = ROADMAP.pillars.map((p) => ({
    url: `${baseUrl}/pillars/${slugForPillar(p.number)}`,
    lastModified: roadmapDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...pillarPages, ...(await publicProfileUrls())];
}
