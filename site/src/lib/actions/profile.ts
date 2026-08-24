"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { setProfile } from "@/lib/db";

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "invalid_handle" | "taken" | "db" };

const HANDLE_RE = /^[a-z0-9_-]{3,24}$/;

export async function saveProfileAction(
  handleRaw: string,
  isPublic: boolean
): Promise<SaveProfileResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, reason: "unauthorized" };
  }

  const handle = handleRaw.trim().toLowerCase();
  if (!HANDLE_RE.test(handle)) return { ok: false, reason: "invalid_handle" };

  try {
    const res = await setProfile(userId, handle, isPublic);
    if (!res.ok) return { ok: false, reason: "taken" };
    revalidatePath("/profile");
    revalidatePath(`/u/${handle}`);
    revalidatePath("/leaderboard");
    return { ok: true };
  } catch {
    return { ok: false, reason: "db" };
  }
}
