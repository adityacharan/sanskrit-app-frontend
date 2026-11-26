"use client";

// Home is the course map (owner, 2026-11-26): one section of the path at a time, a button to carry on
// from where you stopped, and the numbers that used to be the dashboard.

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CourseMap } from "@/components/map";
import { Chevron, Dropdown, ProgressBar, Tabs } from "@/components/ui";
import { allSteps, nextStep, sectionHref, sectionOfStep, sections, stepDone, stepsOf } from "@/lib/course";
import { allWords } from "@/lib/data";
import { levelFor, useProgress } from "@/lib/progress";

export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const params = useSearchParams();
  const router = useRouter();
  const progress = useProgress();
  const { level, into } = levelFor(progress.xp);
  const learned = new Set(progress.learned);

  const next = nextStep(progress);
  const done = allSteps.filter((s) => stepDone(progress, s)).length;
  // The section in the address, or the one to carry on in.
  const section = sections.find((s) => s.id === params.get("s")) ?? (next ? sectionOfStep(next) : sections[0]);
  const pick = (id: string) => router.replace(sectionHref(id), { scroll: false });
  const nextSection = next && sectionOfStep(next);
  const nextUnit = next && nextSection!.units.find((u) => u.steps.includes(next));

  return (
    <div className="space-y-8">
      {next ? (
        <Link href={next.href} data-spotlight="light" className="flex items-center justify-between gap-4 rounded-3xl bg-accent p-6 text-accent-ink sm:p-8">
          <span className="min-w-0">
            <span className="deva block text-4xl sm:text-5xl">नमस्ते</span>
            <span className="mt-3 block text-sm opacity-90">
              {done ? "Continue" : "Start here"} · {nextSection!.title}
            </span>
            <span className="block text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              {next.label} · <span className="deva font-normal">{nextUnit!.deva}</span>
            </span>
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-ink text-2xl text-accent" aria-hidden>
            →
          </span>
        </Link>
      ) : (
        <div className="rounded-3xl bg-accent p-6 text-accent-ink sm:p-8">
          <p className="deva text-4xl sm:text-5xl">साधु!</p>
          <p className="mt-3 text-xl font-semibold">Every lesson and test is done. Pick any step to practise again.</p>
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Level" value={level} extra={<ProgressBar value={into} className="mt-3" />} />
        <Stat label="Total XP" value={progress.xp} />
        <Stat label="Day streak" value={`${progress.streak} 🔥`} />
        <Stat label="Steps done" value={`${done}/${allSteps.length}`} extra={<p className="mt-1 text-xs text-muted">{allWords.filter((w) => learned.has(w.id)).length} words learned</p>} />
      </section>

      <section>
        <h1 className="mb-3 text-xl font-semibold">
          Your path · <span className="deva text-accent">मार्गः</span>
        </h1>
        {/* Fourteen sections wrap into many rows on a phone, so phones get a menu instead. */}
        <div className="sm:hidden">
          <Dropdown
            label="Choose a section"
            rootClassName="block"
            triggerClassName="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left hover:border-accent aria-expanded:border-accent"
            trigger={(open) => (
              <>
                <span>
                  {section.icon} {section.title} <span className="deva text-muted">{section.deva}</span>
                </span>
                <Chevron open={open} />
              </>
            )}
            items={sections.map((s) => ({
              key: s.id,
              label: (
                <>
                  {s.icon} {s.title} <span className="deva text-muted">{s.deva}</span>
                </>
              ),
              selected: s.id === section.id,
            }))}
            onSelect={pick}
          />
        </div>
        <div className="hidden sm:block">
          <Tabs
            value={section.id}
            onChange={pick}
            options={sections.map((s) => {
              const steps = stepsOf(s);
              return { value: s.id, label: `${s.icon} ${s.title}${steps.every((st) => stepDone(progress, st)) ? " ✓" : ""}` };
            })}
          />
        </div>
      </section>

      <CourseMap key={section.id} section={section} progress={progress} next={next} />
    </div>
  );
}

function Stat({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {extra}
    </div>
  );
}
