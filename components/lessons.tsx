"use client";

// The full list of a vocabulary tab's conversation-book words and sentences. (The tab's lessons are on
// the course map, components/map.tsx.)

import { useEffect, useState } from "react";
import { Strip } from "@/components/deck";
import { SpeakButton } from "@/components/ui";
import type { Unit } from "@/lib/lessons";

/**
 * Every conversation-book word and sentence of the tab, grouped by unit, behind a "See all" toggle.
 * `startOpen`: for a tab with nothing else on it, the list is the page.
 */
export function BookList({ units, startOpen = false }: { units: Unit[]; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [active, setActive] = useState<string | null>(null);
  const items = units.flatMap((u) => u.items);

  useEffect(() => {
    if (open && active) document.getElementById(`row-${active}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [open, active]);

  if (!items.length) return null;
  const allWords = items.every((it) => it.kind === "word");

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{allWords ? "All words" : "All sentences"}</h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="shrink-0 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium hover:border-accent"
        >
          {open ? "Show less" : `See all (${items.length})`}
        </button>
      </div>
      {open ? (
        <div className="space-y-5">
          {units.map((u) => (
            <div key={u.id}>
              <p className="mb-2 text-sm font-medium text-muted">
                <span className="deva">{u.deva}</span> · {u.title}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {u.items.map((it) => (
                  <div
                    key={it.id}
                    id={`row-${it.id}`}
                    className={`flex h-full items-center gap-3 rounded-2xl border bg-surface p-3 ${active === it.id ? "border-accent" : "border-line"}`}
                  >
                    <SpeakButton text={it.deva} />
                    <span className="min-w-0">
                      <span className="deva text-xl">{it.deva}</span>
                      <span className="block text-sm italic text-muted">{it.translit}</span>
                      <span className="block text-sm">{it.meaning}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Strip>
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  setActive(it.id);
                  setOpen(true);
                }}
                className="shrink-0 whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-1.5 hover:border-accent"
              >
                <span className="deva text-lg">{it.deva}</span>
              </button>
            ))}
        </Strip>
      )}
    </section>
  );
}
