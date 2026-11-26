"use client";

// The course map, like Duolingo's path: a section's units one under another, each a winding line of
// round steps (lessons, then tests). A step is done, open or locked, and exactly one is "next".

import Link from "next/link";
import { useState } from "react";
import { lockReason, stepDone, stepOpen, stepsOf, type CourseUnit, type Section, type Step } from "@/lib/course";
import { bestOf } from "@/lib/quizzes";
import type { Progress } from "@/lib/progress";

// The path swings right, back through the middle, left, and back.
const SWING = [0, 44, 72, 44, 0, -44, -72, -44];

export function CourseMap({ section, progress, next }: { section: Section; progress: Progress; next?: Step }) {
  // The locked step that was last pressed, so the press is answered with what it is waiting for.
  const [asked, setAsked] = useState<string | null>(null);
  const steps = stepsOf(section);
  const done = steps.filter((s) => stepDone(progress, s)).length;

  return (
    <section id="map" className="scroll-mt-20">
      <div className="rounded-3xl bg-accent p-5 text-accent-ink sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <p className="deva text-lg opacity-90">{section.deva}</p>
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">
              {section.icon} {section.title}
            </h2>
          </div>
          <p className="text-sm tabular-nums opacity-90">
            {done} of {steps.length} done
          </p>
        </div>
        {/* The shared ProgressBar is accent on a light track; on the accent banner the colours swap. */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent-ink/25">
          <div className="h-full rounded-full bg-accent-ink" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
        <Link href={section.study.href} className="mt-4 inline-block rounded-full border border-current/40 px-4 py-1.5 text-sm font-medium hover:bg-white/10">
          📖 {section.study.label} →
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-md space-y-10">
        {section.units.map((u, i) => (
          <UnitPath key={u.id} unit={u} index={i} progress={progress} next={next} asked={asked} onAsk={setAsked} />
        ))}
      </div>
    </section>
  );
}

function UnitPath({
  unit,
  index,
  progress,
  next,
  asked,
  onAsk,
}: {
  unit: CourseUnit;
  index: number;
  progress: Progress;
  next?: Step;
  asked: string | null;
  onAsk: (id: string) => void;
}) {
  const done = unit.steps.filter((s) => stepDone(progress, s)).length;
  return (
    <div>
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Unit {index + 1}</p>
          <p className="mt-0.5 font-semibold">
            <span className="deva text-lg text-accent">{unit.deva}</span> · {unit.title}
          </p>
        </div>
        <span className="shrink-0 text-sm tabular-nums text-muted">
          {done}/{unit.steps.length}
        </span>
      </div>
      <ol className="mt-6 flex flex-col items-center gap-5">
        {unit.steps.map((s, i) => (
          <li key={s.id} style={{ transform: `translateX(${SWING[i % SWING.length]}px)` }}>
            <StepNode step={s} progress={progress} isNext={s === next} asked={asked === s.id} onAsk={onAsk} />
          </li>
        ))}
      </ol>
    </div>
  );
}

const CIRCLE = "flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold tabular-nums shadow-[0_4px_0_0_rgb(0_0_0/0.12)]";
// 144px: with the widest swing (72px) a caption still fits a 320px phone, and "Finish lesson 3 first" stays on one line.
const CAPTION = "mt-2 block w-36 text-balance text-center text-xs";

function StepNode({ step, progress, isNext, asked, onAsk }: { step: Step; progress: Progress; isNext: boolean; asked: boolean; onAsk: (id: string) => void }) {
  const done = stepDone(progress, step);
  const open = stepOpen(progress, step);
  const face = step.kind === "lesson" ? step.lesson.n : step.grand ? "🏆" : "★";
  const best = step.kind === "test" ? bestOf(progress.bestScores, step.topic.id, step.part.id) : undefined;
  const detail = step.kind === "test" && step.part.subtitle ? `${step.label} · ${step.part.subtitle}` : step.label;

  if (!open) {
    return (
      <button type="button" onClick={() => onAsk(step.id)} aria-label={`${step.label}, locked`} className="flex flex-col items-center">
        <span className={`${CIRCLE} bg-surface-2 text-muted opacity-60`}>{step.kind === "lesson" ? face : "🔒"}</span>
        {asked ? (
          <span role="status" className={`${CAPTION} font-medium text-ink`}>
            🔒 {lockReason(step)}
          </span>
        ) : (
          <span className={`${CAPTION} text-muted`}>{step.label}</span>
        )}
      </button>
    );
  }
  return (
    <Link href={step.href} aria-label={`${detail}${done ? ", done" : ""}`} title={detail} className="group flex flex-col items-center">
      <span
        className={`${CIRCLE} ${
          done
            ? "bg-good text-good-ink group-hover:brightness-105"
            : isNext
              ? "bg-accent text-accent-ink ring-4 ring-accent/25 group-hover:brightness-105"
              : "border-2 border-accent bg-accent-soft text-accent group-hover:bg-accent group-hover:text-accent-ink"
        }`}
      >
        {done ? "✓" : face}
      </span>
      <span className={`${CAPTION} ${isNext ? "font-semibold text-accent" : "text-muted"}`}>
        {isNext ? `Start · ${step.label}` : best !== undefined ? `${step.label} · ${best}%` : step.label}
      </span>
    </Link>
  );
}
