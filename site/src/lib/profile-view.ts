import { getProgress, getPublicProfileByHandle, getPublicUserStats } from "@/lib/db";

export async function getProgressSafe(userId: string): Promise<Set<string>> {
  try {
    return await getProgress(userId);
  } catch {
    return new Set();
  }
}

export async function getPublicProfileByHandleSafe(handle: string) {
  try {
    return await getPublicProfileByHandle(handle);
  } catch {
    return null;
  }
}

export async function getPublicUserStatsSafe(userId: string) {
  try {
    return await getPublicUserStats(userId);
  } catch {
    return { done_count: 0, pillars_passed: 0, joined_month: "" };
  }
}

/** Diagnostic: why did a profile lookup fail? */
export async function probeHandle(
  handle: string
): Promise<"db_error" | "no_such_handle" | "handle_is_private"> {
  try {
    const { getProfileByHandleAnyVisibility } = await import("@/lib/db");
    const row = await getProfileByHandleAnyVisibility(handle);
    if (!row) return "no_such_handle";
    if (!row.is_public) return "handle_is_private";
    return "no_such_handle";
  } catch {
    return "db_error";
  }
}
