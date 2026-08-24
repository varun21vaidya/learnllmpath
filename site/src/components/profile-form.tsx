"use client";

import { useState, useTransition } from "react";
import { saveProfileAction } from "@/lib/actions/profile";

export function ProfileForm({
  initialHandle,
  initialPublic,
}: {
  initialHandle: string;
  initialPublic: boolean;
}) {
  const [handle, setHandle] = useState(initialHandle);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveProfileAction(handle, isPublic);
      if (res.ok) setSaved(true);
      else
        setError(
          res.reason === "taken"
            ? "That handle is already claimed."
            : res.reason === "invalid_handle"
              ? "3–24 chars: lowercase letters, numbers, - or _."
              : res.reason === "db"
                ? "Database unavailable, try again later."
                : "Not signed in?"
        );
    });
  }

  return (
    <form onSubmit={submit} className="nb-stack">
      <label className="nb-stack gap-1">
        <span className="text-sm font-bold">Handle (your public URL)</span>
        <div className="flex items-center">
          <span className="font-mono text-sm text-muted mr-1">learnllmpath.com/u/</span>
          <input
            className="nb-input w-auto! flex-1 font-mono"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value.toLowerCase());
              setSaved(false);
            }}
            placeholder="ada-lovelace"
            maxLength={24}
            minLength={3}
            required
            aria-describedby="handle-help"
          />
        </div>
        <span id="handle-help" className="text-xs text-muted">
          3–24 chars: a-z, 0-9, dash, underscore.
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          className="nb-checkbox scale-75"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Show me on the leaderboard and public profile
      </label>

      {error && (
        <p role="alert" className="nb-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="font-bold text-sm text-success">
          Saved ✓ Your profile: /u/{handle}
        </p>
      )}

      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-fit">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
