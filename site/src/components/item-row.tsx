"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleItem, saveNoteAction, deleteNoteAction } from "@/lib/actions/tracking";
import type { RoadmapItem } from "@/data/types";

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
}: {
  item: RoadmapItem;
  signedIn: boolean;
  unlocked: boolean;
  initialChecked: boolean;
  initialNote: string;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [note, setNote] = useState(initialNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [lockedMsg, setLockedMsg] = useState(false);
  const [pending, startTransition] = useTransition();

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
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#44536a]">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline decoration-2 underline-offset-2 hover:decoration-primary"
            >
              {item.resourceName} ↗
            </a>
          ) : (
            <span>{item.resourceName}</span>
          )}
          <TypeBadge kind={KIND_LABEL[item.urlType] ?? "unverified"} />
          <span className="font-mono">{item.lengthLabel}</span>
          {!item.url && <UnverifiedFlag />}
        </p>

        {signedIn && (
          <>
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="mt-1 text-xs font-bold underline underline-offset-2"
            >
              {note ? "✎ note" : "+ note"}
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
            Locked — pass the previous pillar quiz first.{" "}
            <Link href={`/quiz/${Math.max(1, parseInt(item.id.slice(1), 10) - 1)}`} className="underline">
              Go to that quiz
            </Link>
          </p>
        )}
      </div>

      {!signedIn && (
        <span className="sr-only">Sign in to track this item</span>
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
      title="No confident exact link found yet — verify manually"
    >
      ⚠ link unverified
    </span>
  );
}
