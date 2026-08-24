import { getCompletionDates } from "@/lib/db";

export { computeStats, computeStreak } from "@/lib/stats";
export type { RoadmapStats } from "@/lib/stats";

export async function getCompletionDatesSafe(userId: string): Promise<string[]> {
  try {
    return await getCompletionDates(userId);
  } catch {
    return [];
  }
}
