"use server";

import { requireUserId } from "@/lib/auth";
import { getSrsDueIds, getSrsStats, reviewSrsCard } from "@/lib/db";
import { QUIZZES } from "@/data/quizzes";

export interface SafeQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export async function loadDueQuestions(): Promise<SafeQuestion[]> {
  const userId = await requireUserId();
  const dueIds = await getSrsDueIds(userId);
  const byId = new Map<string, SafeQuestion>();
  for (const quiz of QUIZZES) {
    for (const q of quiz.questions) {
      if (dueIds.includes(q.id)) {
        byId.set(q.id, { id: q.id, prompt: q.prompt, options: q.options });
      }
    }
  }
  return dueIds.map((id) => byId.get(id)).filter((q): q is SafeQuestion => Boolean(q));
}

export async function loadSrsStats(): Promise<{ due: number; scheduled: number }> {
  try {
    const userId = await requireUserId();
    return await getSrsStats(userId);
  } catch {
    return { due: 0, scheduled: 0 };
  }
}

export type ReviewResult = { ok: boolean; reason?: "unauthorized" };

export async function recordReview(questionId: string, correct: boolean): Promise<ReviewResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, reason: "unauthorized" };
  }
  // Only questions that exist in a quiz can be reviewed.
  const exists = QUIZZES.some((qz) => qz.questions.some((q) => q.id === questionId));
  if (!exists) return { ok: false };
  await reviewSrsCard(userId, questionId, correct);
  return { ok: true };
}
