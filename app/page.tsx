"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ui";
import { allWords, categories } from "@/lib/data";
import { levelFor, useProgress } from "@/lib/progress";

const sections = [
  { href: "/alphabet", title: "Alphabet", deva: "वर्णमाला", desc: "Vowels and consonants of Devanagari with sounds.", icon: "अ" },
  { href: "/vocabulary", title: "Vocabulary", deva: "शब्दाः", desc: "Flashcards across greetings, numbers, family, nature and more.", icon: "📖" },
  { href: "/quiz", title: "Quiz", deva: "परीक्षा", desc: "Test yourself and earn XP for every correct answer.", icon: "🎯" },
  { href: "/grammar", title: "Grammar", deva: "व्याकरणम्", desc: "Noun cases, verb tenses and pronouns in clear tables.", icon: "📐" },
  { href: "/phrases", title: "Phrases & Shlokas", deva: "वाक्यानि", desc: "Everyday sentences and famous verses with meanings.", icon: "💬" },
];

export default function Home() {
  const progress = useProgress();
  const { level, into } = levelFor(progress.xp);
  const learned = new Set(progress.learned);

  return (
    <div className="space-y-10">
      <section>
        <div data-spotlight="light" className="rounded-3xl bg-accent p-8 text-accent-ink">
          <p className="deva text-5xl sm:text-6xl">नमस्ते</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Begin your journey into Sanskrit</h1>
          <p className="mt-2 max-w-md opacity-90">
            Learn the script, build vocabulary, and read your first shlokas — a few minutes a day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/alphabet" className="block rounded-full bg-accent-ink px-5 py-2.5 font-medium text-accent shadow-sm hover:shadow-md">
              Start with the alphabet
            </Link>
            <Link href="/quiz" className="block rounded-full border border-current/40 px-5 py-2.5 font-medium hover:bg-white/10">
              Take a quiz
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Level" value={level} extra={<ProgressBar value={into} className="mt-3" />} />
        <Stat label="Total XP" value={progress.xp} />
        <Stat label="Day streak" value={`${progress.streak} 🔥`} />
        <Stat label="Words learned" value={`${allWords.filter((w) => learned.has(w.id)).length}/${allWords.length}`} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Learning path</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              data-spotlight
              className="group block h-full rounded-2xl border border-line bg-surface p-5 hover:shadow-[0_12px_30px_-12px_rgb(0_0_0/0.18)]"
            >
              <div className="flex items-center gap-3">
                <span className="deva flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-xl text-accent">
                  {s.icon}
                </span>
                <div>
                  <p className="font-semibold group-hover:text-accent">{s.title}</p>
                  <p className="deva text-sm text-muted">{s.deva}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Vocabulary progress</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((c) => {
            const done = c.words.filter((w) => learned.has(w.id)).length;
            return (
              <Link
                key={c.slug}
                href={`/vocabulary?c=${c.slug}`}
                data-spotlight
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
              >
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium">
                      {c.title} <span className="deva text-sm text-muted">{c.sanskrit}</span>
                    </p>
                    <p className="text-sm tabular-nums text-muted">
                      {done}/{c.words.length}
                    </p>
                  </div>
                  <ProgressBar value={(done / c.words.length) * 100} className="mt-2" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div data-spotlight className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {extra}
    </div>
  );
}
