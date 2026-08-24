"use client";

import { useState, type ReactNode } from "react";
import { XIcon } from "@/components/icons";

export function DismissibleBanner({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="nb-callout font-semibold flex items-start justify-between gap-3">
      <div>{children}</div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="shrink-0 p-1 -m-1 opacity-70 hover:opacity-100"
      >
        <XIcon width={16} height={16} />
      </button>
    </div>
  );
}
