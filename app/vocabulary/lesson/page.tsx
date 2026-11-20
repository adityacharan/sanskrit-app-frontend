"use client";

// A vocabulary lesson, Duolingo-style: new items are introduced and practised one exercise at a time,
// with a Check button and a correct / not-quite panel. A mistake brings the exercise back at the end,
// so the lesson finishes only when every exercise has been answered right once.

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgressBar, SpeakButton } from "@/components/ui";
import {
  again,
  buildLesson,
  builtRight,
  findLesson,
  isUnlocked,
  lessonHref,
  poolFor,
  type Exercise,
  type Lesson,
  type LessonItem,
  type VocabTab,
} from "@/lib/lessons";
import { actions, useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/speak";

export default function LessonPage() {
  return (
    <Suspense>
      <LessonRoute />
    </Suspense>
  );
}

function LessonRoute() {
  const params = useSearchParams();
  const done = useProgress().lessons;
  const found = findLesson(params.get("tab"), params.get("unit"), Number(params.get("n")));
  // A lesson opens once the one before it in its unit is done, also when its address is typed in.
  if (found && !isUnlocked(done, found.lesson)) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-lg font-semibold">This lesson is locked.</p>
        <p className="mt-1 text-muted">Finish lesson {found.lesson.n - 1} of this unit first.</p>
        <Link href={`/vocabulary?c=${found.tab.slug}#lessons`} className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
          Back to lessons
        </Link>
      </div>
    );
  }
  if (!found) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-lg font-semibold">This lesson doesn&apos;t exist.</p>
        <Link href="/vocabulary" className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
          Back to vocabulary
        </Link>
      </div>
    );
  }
  return <Player key={found.lesson.key} tab={found.tab} lesson={found.lesson} next={found.next} />;
}

type Status = "idle" | "right" | "wrong";

// One size per kind of text for every exercise of every lesson, so nothing jumps between screens.
const DEVA_PROMPT = "deva text-3xl";
const EN_PROMPT = "text-2xl font-semibold";
const DEVA_OPTION = "deva text-xl";
const EN_OPTION = "text-lg";

function Player({ tab, lesson, next }: { tab: VocabTab; lesson: Lesson; next?: Lesson }) {
  const router = useRouter();
  const [pool] = useState(() => poolFor(tab, lesson));
  const [steps, setSteps] = useState<Exercise[]>(() => buildLesson(lesson, pool));
  const [total, setTotal] = useState(steps.length); // a mistake adds a step but not to the bar
  const [at, setAt] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [picked, setPicked] = useState<string | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [missed, setMissed] = useState<Set<number>>(new Set()); // first-round steps answered wrong at least once
  const recorded = useRef(false);

  const finished = at >= steps.length;
  const ex = steps[at];
  const graded = steps.slice(0, total).filter((s) => s.kind !== "intro").length;
  const pct = graded ? Math.round(((graded - missed.size) / graded) * 100) : 100;

  useEffect(() => {
    if (finished && !recorded.current) {
      recorded.current = true;
      actions.completeLesson(lesson.key, pct);
    }
  }, [finished, lesson.key, pct]);

  const markMissed = () => at < total && setMissed((m) => new Set(m).add(at));

  // A quick double tap on Continue mustn't skip the next screen (a new word would never be shown).
  const lastAdvance = useRef(0);
  const advance = () => {
    const now = performance.now();
    if (now - lastAdvance.current < 400) return;
    lastAdvance.current = now;
    if (status !== "wrong") setDoneCount((d) => d + 1);
    setAt((i) => i + 1);
    setStatus("idle");
    setPicked(null);
    setPlaced([]);
  };

  const canCheck = ex && status === "idle" && (ex.kind === "build" ? placed.length > 0 : ex.kind === "meaning" || ex.kind === "reverse" ? picked !== null : false);

  const check = () => {
    if (!ex || !canCheck) return;
    let right = false;
    if (ex.kind === "meaning") right = picked === ex.item.meaning;
    else if (ex.kind === "reverse") right = picked === ex.item.deva;
    else if (ex.kind === "build") right = builtRight(ex.item, placed.map((i) => ex.tiles[i]));
    setStatus(right ? "right" : "wrong");
    if (!right) {
      markMissed();
      setSteps((s) => [...s, again(ex, pool)]);
    }
  };

  const restart = () => {
    const fresh = buildLesson(lesson, pool);
    setSteps(fresh);
    setTotal(fresh.length);
    setAt(0);
    setDoneCount(0);
    setStatus("idle");
    setPicked(null);
    setPlaced([]);
    setMissed(new Set());
    recorded.current = false;
  };

  // Enter checks, then continues; 1–4 choose an option.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || !ex) return;
      const focused = document.activeElement;
      // Enter on a link or another button (quit, listen) keeps its usual meaning; a disabled button can't take it.
      const onControl =
        focused instanceof HTMLAnchorElement || (focused instanceof HTMLButtonElement && !focused.disabled && !focused.dataset.option);
      if (e.key === "Enter" && !onControl) {
        e.preventDefault();
        if (status !== "idle" || ex.kind === "intro") advance();
        else check();
      } else if (status === "idle" && (ex.kind === "meaning" || ex.kind === "reverse") && /^[1-9]$/.test(e.key)) {
        const opt = ex.options[Number(e.key) - 1];
        if (opt !== undefined) setPicked(opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const backHref = `/vocabulary?c=${tab.slug}#lessons`;

  if (finished) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="text-6xl" aria-hidden>
          🎉
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Lesson complete!</h1>
        <p className="deva mt-1 text-xl text-accent">साधु! शोभनम्।</p>
        <p className="mt-2 text-muted">
          <span className="deva">{lesson.unit.deva}</span> · {lesson.unit.title} · Lesson {lesson.n}
        </p>
        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm text-muted">XP earned</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">+{pct === 100 ? 15 : 10}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm text-muted">First-try accuracy</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{pct}%</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={restart} className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent">
            Practise again
          </button>
          {next && (
            <button type="button" onClick={() => router.push(lessonHref(next))} className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
              Next lesson →
            </button>
          )}
          <Link href={backHref} className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent">
            All lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-4">
        <Link href={backHref} className="text-muted hover:text-ink" aria-label="Quit lesson">
          ✕
        </Link>
        <ProgressBar value={(doneCount / total) * 100} className="flex-1" />
        <span className="text-sm tabular-nums text-muted">
          {Math.min(at + 1, total)}/{total}
        </span>
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        {tab.title} · <span className="deva">{lesson.unit.deva}</span> · Lesson {lesson.n}
        {at >= total && " · fixing mistakes"}
      </p>

      <div className="mt-8">
        {ex.kind === "intro" && <Intro item={ex.item} />}
        {(ex.kind === "meaning" || ex.kind === "reverse") && (
          <Choice key={at} ex={ex} picked={picked} status={status} onPick={setPicked} />
        )}
        {ex.kind === "build" && <Build key={at} ex={ex} placed={placed} setPlaced={setPlaced} status={status} />}
        {ex.kind === "match" && (
          <Match key={at} items={ex.items} onMistake={markMissed} onDone={() => setStatus("right")} />
        )}
      </div>

      {/* Kept in view at the bottom of the screen, so Check is never below the fold on a small phone. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-8 bg-bg px-4 pb-4 pt-3">
        {status === "idle" ? (
          ex.kind === "intro" ? (
            <button key="continue" type="button" onClick={advance} className="w-full rounded-full bg-accent py-3 font-medium text-accent-ink">
              Continue
            </button>
          ) : (
            ex.kind !== "match" && (
              <button
                key="check"
                type="button"
                onClick={check}
                disabled={!canCheck}
                className="w-full rounded-full bg-accent py-3 font-medium text-accent-ink disabled:opacity-50"
              >
                Check
              </button>
            )
          )
        ) : (
          <Feedback ex={ex} right={status === "right"} onContinue={advance} />
        )}
      </div>
    </div>
  );
}

function Intro({ item }: { item: LessonItem }) {
  return (
    <div>
      <p className="text-center text-sm font-medium text-accent">{item.kind === "word" ? "New word" : "New sentence"}</p>
      {/* The speaker sits in the corner, so the Sanskrit stays centred over the lines below it. */}
      <div className="relative mt-3 rounded-3xl border border-line bg-surface px-12 py-8 text-center">
        <SpeakButton text={item.deva} className="absolute right-3 top-3" />
        <p className={DEVA_PROMPT}>{item.deva}</p>
        <p className="mt-2 italic text-muted">{item.translit}</p>
        <p className="mt-4 text-xl font-medium">{item.meaning}</p>
      </div>
    </div>
  );
}

function Prompt({ item, deva }: { item: LessonItem; deva: boolean }) {
  return deva ? (
    <div className="mt-3 flex items-center gap-3">
      <SpeakButton text={item.deva} />
      <p className={DEVA_PROMPT}>{item.deva}</p>
    </div>
  ) : (
    <p className={`mt-3 ${EN_PROMPT}`}>{item.meaning}</p>
  );
}

function Choice({
  ex,
  picked,
  status,
  onPick,
}: {
  ex: Extract<Exercise, { kind: "meaning" | "reverse" }>;
  picked: string | null;
  status: Status;
  onPick: (v: string) => void;
}) {
  const answer = ex.kind === "meaning" ? ex.item.meaning : ex.item.deva;
  return (
    <div>
      <p className="text-sm text-muted">{ex.kind === "meaning" ? "What does this mean?" : "How do you say this in Sanskrit?"}</p>
      <Prompt item={ex.item} deva={ex.kind === "meaning"} />
      <div className="mt-6 grid gap-3">
        {ex.options.map((opt, i) => {
          const state =
            status === "idle" ? (opt === picked ? "picked" : "idle") : opt === answer ? "right" : opt === picked ? "wrong" : "dim";
          return (
            <button
              key={opt}
              type="button"
              data-option="1"
              disabled={status !== "idle"}
              onClick={() => onPick(opt)}
              aria-pressed={opt === picked}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left ${
                state === "picked"
                  ? "border-accent bg-accent-soft"
                  : state === "right"
                    ? "border-good bg-good-soft"
                    : state === "wrong"
                      ? "border-bad bg-bad-soft"
                      : state === "dim"
                        ? "border-line bg-surface opacity-50"
                        : "border-line bg-surface hover:border-accent/60"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs text-muted">{i + 1}</span>
              <span className={ex.kind === "reverse" ? DEVA_OPTION : EN_OPTION}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Tap word tiles to build the sentence; tap a placed tile to take it back.
function Build({
  ex,
  placed,
  setPlaced,
  status,
}: {
  ex: Extract<Exercise, { kind: "build" }>;
  placed: number[];
  setPlaced: (f: (p: number[]) => number[]) => void;
  status: Status;
}) {
  const locked = status !== "idle";
  const tile = `rounded-xl border bg-surface px-3 py-1.5 ${DEVA_OPTION}`;
  // After Check, the built answer turns green or red like a chosen option.
  const placedTile = status === "right" ? "border-good bg-good-soft" : status === "wrong" ? "border-bad bg-bad-soft" : "border-line hover:border-accent";
  return (
    <div>
      <p className="text-sm text-muted">Write this in Sanskrit</p>
      <Prompt item={ex.item} deva={false} />
      <div className="mt-6 flex min-h-16 flex-wrap items-center gap-2 border-y border-line py-3">
        {placed.map((t, i) => (
          <button
            key={t}
            type="button"
            data-option="1"
            disabled={locked}
            onClick={() => setPlaced((p) => p.filter((x) => x !== t))}
            className={`${tile} ${placedTile}`}
          >
            {ex.tiles[t]}
            <span className="sr-only"> (position {i + 1}, tap to remove)</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {ex.tiles.map((word, i) => {
          const used = placed.includes(i);
          return (
            <button
              key={i}
              type="button"
              data-option="1"
              disabled={locked || used}
              onClick={() => setPlaced((p) => [...p, i])}
              className={`${tile} border-line ${used ? "opacity-30" : "hover:border-accent"}`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Two columns, Sanskrit and English, each shuffled: tap one on each side to pair them.
function Match({ items, onMistake, onDone }: { items: LessonItem[]; onMistake: () => void; onDone: () => void }) {
  const [left] = useState(() => shuffle(items));
  const [right] = useState(() => shuffle(items));
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<[string, string] | null>(null);

  useEffect(() => {
    if (!wrong) return;
    const t = setTimeout(() => setWrong(null), 600);
    return () => clearTimeout(t);
  }, [wrong]);

  const tryPair = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    setSelL(null);
    setSelR(null);
    if (l === r) {
      const next = new Set(matched).add(l);
      setMatched(next);
      if (next.size === items.length) onDone();
    } else {
      setWrong([l, r]);
      onMistake();
    }
  };

  const cell = (id: string, selected: boolean, isWrong: boolean) => {
    const isMatched = matched.has(id);
    return `flex min-h-14 w-full items-center justify-center rounded-2xl border-2 px-3 py-2 text-center ${
      isMatched
        ? "border-good bg-good-soft opacity-50"
        : isWrong
          ? "border-bad bg-bad-soft"
          : selected
            ? "border-accent bg-accent-soft"
            : "border-line bg-surface hover:border-accent/60"
    }`;
  };

  return (
    <div>
      <p className="text-sm text-muted">Tap the matching pairs</p>
      {/* One grid, Sanskrit and English side by side in each row, so the two columns line up. */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {left.flatMap((l, i) => {
          const r = right[i];
          return [
            <button
              key={`l-${l.id}`}
              type="button"
              data-option="1"
              disabled={matched.has(l.id)}
              onClick={() => {
                setSelL(l.id);
                tryPair(l.id, selR);
              }}
              className={cell(l.id, selL === l.id, wrong?.[0] === l.id)}
            >
              <span className={DEVA_OPTION}>{l.deva}</span>
            </button>,
            <button
              key={`r-${r.id}`}
              type="button"
              data-option="1"
              disabled={matched.has(r.id)}
              onClick={() => {
                setSelR(r.id);
                tryPair(selL, r.id);
              }}
              className={cell(r.id, selR === r.id, wrong?.[1] === r.id)}
            >
              <span className="text-base">{r.meaning}</span>
            </button>,
          ];
        })}
      </div>
    </div>
  );
}

function Feedback({ ex, right, onContinue }: { ex: Exercise; right: boolean; onContinue: () => void }) {
  const item = ex.kind === "match" ? null : ex.item;
  return (
    <div className={`flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between ${right ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}>
      <div className="min-w-0">
        <p className="font-semibold">{right ? (ex.kind === "match" ? "All pairs matched! शोभनम्" : "Correct! साधु") : "Correct answer:"}</p>
        {item && (
          <p className="mt-1 text-ink">
            <span className="deva block text-lg">{item.deva}</span>
            <em className="block text-sm">{item.translit}</em>
            <span className="block text-sm">{item.meaning}</span>
          </p>
        )}
        {!right && <p className="mt-1 text-sm text-ink">This one will come again at the end.</p>}
      </div>
      <button type="button" onClick={onContinue} autoFocus className="shrink-0 rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink">
        Continue
      </button>
    </div>
  );
}
