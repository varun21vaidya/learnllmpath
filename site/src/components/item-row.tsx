"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleItem, saveNoteAction, deleteNoteAction } from "@/lib/actions/tracking";
import { voteItem } from "@/lib/actions/vote";
import { activeAlt, altBadgeClass } from "@/lib/tracks";
import type { RoadmapItem, TrackId } from "@/data/types";
import type { VoteInfo } from "@/lib/db";

const KIND_LABEL: Record<string, string> = {
  video: "video",
  read: "article",
  doc: "docs",
  repo: "repo",
  course: "course",
  unverified: "unverified",
};

export function ItemRow({
  item,
  signedIn,
  unlocked,
  initialChecked,
  initialNote,
  votes,
  track = "short",
}: {
  item: RoadmapItem;
  signedIn: boolean;
  unlocked: boolean;
  initialChecked: boolean;
  initialNote: string;
  votes?: VoteInfo;
  track?: TrackId;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [note, setNote] = useState(initialNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [lockedMsg, setLockedMsg] = useState(false);
  const [pending, startTransition] = useTransition();
  const [vote, setVote] = useState<{ score: number; mine: 0 | 1 | -1 }>(
    votes ? { score: votes.score, mine: votes.mine } : { score: 0, mine: 0 }
  );

  function applyVote(next: -1 | 0 | 1) {
    if (!signedIn) return;
    const prev = vote;
    const optimistic = {
      score: prev.score - prev.mine + next,
      mine: next,
    };
    setVote(optimistic);
    startTransition(async () => {
      const res = await voteItem(item.id, next);
      if (!res.ok) setVote(prev);
    });
  }

  function handleToggle() {
    if (!signedIn || !unlocked) return;
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      const res = await toggleItem(item.id, next);
      if (!res.ok) {
        setChecked(!next);
        if (res.reason === "locked") setLockedMsg(true);
      }
    });
  }

  return (
    <li className={`flex items-start gap-3 py-2 ${checked ? "opacity-60" : ""}`}>
      {signedIn ? (
        <input
          type="checkbox"
          className="nb-checkbox mt-0.5"
          checked={checked}
          disabled={pending || (!unlocked && !checked)}
          onChange={handleToggle}
          aria-label={`Mark "${item.subtopic}" ${checked ? "incomplete" : "complete"}`}
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">
          {item.subtopic}{" "}
          {item.isKey && <span className="nb-badge nb-badge-key ml-1">KEY</span>}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {(() => {
            const alt = activeAlt(item, track);
            const name = alt ? alt.resourceName : item.resourceName;
            const url = alt ? alt.url : item.url;
            const kind = (alt ? alt.urlType : item.urlType) ?? "unverified";
            const len = alt ? alt.lengthLabel : item.lengthLabel;
            return (
              <>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline decoration-2 underline-offset-2 hover:decoration-primary"
                  >
                    {name}
                  </a>
                ) : (
                  <span>{name}</span>
                )}
                <TypeBadge kind={KIND_LABEL[kind] ?? "unverified"} />
                {alt && (
                  <span className={`nb-badge ${altBadgeClass(track)}`}>
                    {track === "deep" ? "DEEP" : "FREE"}
                  </span>
                )}
                <span className="font-mono">{len}</span>
                {!url && !alt && <UnverifiedFlag />}
              </>
            );
          })()}
        </p>

        {signedIn && (
          <>
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="mt-1 text-xs font-bold underline underline-offset-2"
            >
              {note ? "Edit note" : "+ Add note"}
            </button>
            {noteOpen && (
              <div className="mt-1 nb-stack max-w-md">
                <textarea
                  className="nb-textarea text-sm"
                  rows={3}
                  maxLength={5000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Private note for this resource…"
                  aria-label={`Note for ${item.subtopic}`}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="nb-btn nb-btn-small nb-btn-primary"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await saveNoteAction(item.id, note);
                        setNoteOpen(false);
                      })
                    }
                  >
                    Save
                  </button>
                  {note && (
                    <button
                      type="button"
                      className="nb-btn nb-btn-small nb-btn-danger"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteNoteAction(item.id);
                          setNote("");
                          setNoteOpen(false);
                        })
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {lockedMsg && (
          <p role="alert" className="mt-1 text-xs font-bold text-danger">
            Locked. Pass the previous pillar quiz first.{" "}
            <Link href={`/quiz/${Math.max(1, parseInt(item.id.slice(1), 10) - 1)}`} className="underline">
              Go to that quiz
            </Link>
          </p>
        )}
      </div>

      {signedIn && (
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            type="button"
            aria-label={`Upvote ${item.subtopic}`}
            aria-pressed={vote.mine === 1}
            disabled={pending}
            onClick={() => applyVote(vote.mine === 1 ? 0 : 1)}
            className={`text-xs font-black leading-none px-1 ${
              vote.mine === 1 ? "text-success" : "opacity-50 hover:opacity-100"
            }`}
          >
            ▲
          </button>
          <span className="font-mono text-[10px] font-bold leading-none">{vote.score}</span>
          <button
            type="button"
            aria-label={`Downvote ${item.subtopic}`}
            aria-pressed={vote.mine === -1}
            disabled={pending}
            onClick={() => applyVote(vote.mine === -1 ? 0 : -1)}
            className={`text-xs font-black leading-none px-1 ${
              vote.mine === -1 ? "text-danger" : "opacity-50 hover:opacity-100"
            }`}
          >
            ▼
          </button>
        </div>
      )}
    </li>
  );
}

function TypeBadge({ kind }: { kind: string }) {
  const cls =
    kind === "KEY"
      ? ""
      : `nb-badge-${
          ["video", "read", "doc", "repo", "course", "unverified"].includes(kind) ? kind : "read"
        }`;
  return <span className={`nb-badge ${cls}`}>{kind}</span>;
}

function UnverifiedFlag() {
  return (
    <span
      className="text-warning font-bold"
      title="No confident exact link found yet, verify manually"
    >
      ⚠ link unverified
    </span>
  );
}
