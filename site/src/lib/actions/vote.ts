"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { voteResource } from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";

export type VoteResult = { ok: boolean; reason?: "unauthorized" };

const VALID_ITEMS = new Set(
  ROADMAP.pillars.flatMap((p) => p.sections.flatMap((s) => s.items.map((i) => i.id)))
);

export async function voteItem(itemId: string, value: -1 | 0 | 1): Promise<VoteResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, reason: "unauthorized" };
  }
  if (!VALID_ITEMS.has(itemId)) return { ok: false };
  await voteResource(userId, itemId, value);
  revalidatePath("/pillars");
  return { ok: true };
}
