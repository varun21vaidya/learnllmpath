"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import {
  toggleProgress,
  saveNote,
  deleteNote,
  hasPassedQuiz,
  getNotes,
  getProgress,
  getQuizBests,
} from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";

const PASS_THRESHOLD = 70;

function pillarOfItem(itemId: string): number {
  const n = parseInt(itemId.slice(1).split("-")[0], 10);
  return Number.isNaN(n) ? 0 : n;
}

export async function getUnlockedPillars(): Promise<Set<number>> {
  const userId = await requireUserId();
  const bests = await getQuizBests(userId);
  const unlocked = new Set<number>([1]);
  for (let n = 1; n < 10; n++) {
    const b = bests.get(n);
    if (b?.passed || (b && b.best_pct >= PASS_THRESHOLD)) unlocked.add(n + 1);
  }
  return unlocked;
}

export async function loadTrackerState() {
  const userId = await requireUserId();
  const [progress, notes] = await Promise.all([getProgress(userId), getNotes(userId)]);
  return { progress: [...progress], notes: Object.fromEntries(notes) };
}

export type ToggleResult = { ok: boolean; reason?: "locked" | "unauthorized" };

export async function toggleItem(itemId: string, complete: boolean): Promise<ToggleResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, reason: "unauthorized" };
  }
  const pillarN = pillarOfItem(itemId);
  if (!pillarN || !ROADMAP.pillars.some((p) => p.number === pillarN)) {
    return { ok: false, reason: "unauthorized" };
  }
  if (pillarN > 1) {
    const prevPassed = await hasPassedQuiz(userId, pillarN - 1);
    if (!prevPassed) return { ok: false, reason: "locked" };
  }
  await toggleProgress(userId, itemId, complete);
  revalidatePath("/");
  return { ok: true };
}

export type NoteResult = { ok: boolean; reason?: "unauthorized" };

export async function saveNoteAction(itemId: string, body: string): Promise<NoteResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, reason: "unauthorized" };
  }
  await saveNote(userId, itemId, body.trim());
  revalidatePath("/");
  return { ok: true };
}

export async function deleteNoteAction(itemId: string): Promise<NoteResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, reason: "unauthorized" };
  }
  await deleteNote(userId, itemId);
  revalidatePath("/");
  return { ok: true };
}
