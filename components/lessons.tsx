"use client";

// The vocabulary tab's lesson path (Duolingo-style units of lessons) and the full list of its
// conversation-book words and sentences.

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpeakButton } from "@/components/ui";
import { allLessons, isUnlocked, lessonHref, lessonsOf, type Unit, type VocabTab } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";

export function LessonPath({ tab }: { tab: VocabTab }) {
  const done = useProgress().lessons;
  const lessons = allLessons(tab);
  const finished = lessons.filter((l) => l.key in done).length;
  const next = lessons.find((l) => !(l.key in done) && isUnlocked(done, l));

  return (
    <section id="lessons" className="mt-10 scroll-mt-20">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          Lessons · <span className="deva text-accent">पाठाः</span>
        </h2>
        <span className="text-sm tabular-nums text-muted">
          {finished} of {lessons.length} done
        </span>
      </div>

      {next && (
        <Link
          href={lessonHref(next)}
          data-spotlight="light"
          className="mb-4 flex items-center justify-between gap-4 rounded-2xl bg-accent px-5 py-4 text-accent-ink"
        >
          <span className="min-w-0">
            <span className="block text-sm opacity-90">
              {finished ? "Continue" : "Start"} · Lesson {next.n}
            </span>
            <span className="block font-semibold">
              <span className="deva">{next.unit.deva}</span> · {next.unit.title}
            </span>
          </span>
          <span className="shrink-0 text-xl" aria-hidden>
            →
          </span>
        </Link>
      )}

      <div className="grid items-start gap-3 sm:grid-cols-2">
        {tab.units.map((u, i) => (
          <UnitCard key={u.id} tab={tab} unit={u} index={i} done={done} />
        ))}
      </div>
    </section>
  );
}

function UnitCard({ tab, unit, index, done }: { tab: VocabTab; unit: Unit; index: number; done: Record<string, number> }) {
  const lessons = lessonsOf(tab.slug, unit);
  const finished = lessons.filter((l) => l.key in done).length;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Unit {index + 1}</p>
          <p className="mt-0.5 font-semibold">
            <span className="deva text-lg text-accent">{unit.deva}</span> · {unit.title}
          </p>
          <p className="text-sm text-muted">
            {unit.items.length} {unit.items.every((it) => it.kind === "word") ? "words" : "items"} · {lessons.length}{" "}
            {lessons.length === 1 ? "lesson" : "lessons"}
          </p>
        </div>
        <span className="shrink-0 text-sm tabular-nums text-muted">
          {finished}/{lessons.length}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {lessons.map((l) => {
          const complete = l.key in done;
          const open = isUnlocked(done, l);
          const label = `Lesson ${l.n}${complete ? ", done" : open ? "" : ", locked"}`;
          const base = "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold tabular-nums";
          if (!open) {
            return (
              <span key={l.key} aria-label={label} title="Finish the lesson before this one first" className={`${base} bg-surface-2 text-muted opacity-60`}>
                {l.n}
              </span>
            );
          }
          return (
            <Link
              key={l.key}
              href={lessonHref(l)}
              aria-label={label}
              title={label}
              className={
                complete
                  ? `${base} bg-good text-good-ink hover:brightness-105`
                  : `${base} border-2 border-accent bg-accent-soft text-accent hover:bg-accent hover:text-accent-ink`
              }
            >
              {complete ? "✓" : l.n}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Every conversation-book word and sentence of the tab, grouped by unit, behind a "See all" toggle. */
export function BookList({ units }: { units: Unit[] }) {
  const [open, setOpen] = useState(false);
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
                    data-spotlight
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
        <div className="relative">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
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
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-bg to-transparent" />
        </div>
      )}
    </section>
  );
}
