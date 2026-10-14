"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Chevron, Dropdown, PageHeader, ProgressBar, SpeakButton, spring, Tabs } from "@/components/ui";
import { allLetters, allWords, categories } from "@/lib/data";
import { actions, useProgress } from "@/lib/progress";
import { shuffle, speak } from "@/lib/speak";

type Mode = "meaning" | "reverse" | "sound";
type Item = { id: string; deva: string; translit: string; meaning?: string };
type Question = { item: Item; prompt: string; promptIsDeva: boolean; options: string[]; answer: string; optionsAreDeva: boolean };

const sources = [
  { value: "all", label: "🌐 All words" },
  { value: "alphabet", label: "अ Alphabet" },
  ...categories.map((c) => ({ value: c.slug, label: `${c.icon} ${c.title}` })),
];

const modes: { value: Mode; label: string; needsMeaning: boolean }[] = [
  { value: "meaning", label: "Sanskrit → English", needsMeaning: true },
  { value: "reverse", label: "English → Sanskrit", needsMeaning: true },
  { value: "sound", label: "Script → Romanization", needsMeaning: false },
];

function poolFor(source: string): Item[] {
  if (source === "alphabet") return allLetters;
  if (source === "all") return allWords;
  return categories.find((c) => c.slug === source)?.words ?? allWords;
}

function buildQuestions(source: string, mode: Mode, count = 10): Question[] {
  const pool = poolFor(source);
  const field = (it: Item) =>
    mode === "meaning" ? it.meaning! : mode === "reverse" ? it.deva : it.translit;

  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((item) => {
      const answer = field(item);
      const distractors = shuffle([...new Set(pool.map(field))].filter((v) => v !== answer)).slice(0, 3);
      return {
        item,
        prompt: mode === "reverse" ? item.meaning! : item.deva,
        promptIsDeva: mode !== "reverse",
        options: shuffle([answer, ...distractors]),
        answer,
        optionsAreDeva: mode === "reverse",
      };
    });
}

export default function QuizPage() {
  const [source, setSource] = useState("all");
  const [mode, setMode] = useState<Mode>("meaning");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const progress = useProgress();

  const effectiveMode: Mode = source === "alphabet" ? "sound" : mode;
  const quizKey = `${source}:${effectiveMode}`;
  const finished = questions !== null && results.length === questions.length && picked === null;

  const start = () => {
    setQuestions(buildQuestions(source, effectiveMode));
    setCurrent(0);
    setPicked(null);
    setResults([]);
  };

  const choose = (opt: string) => {
    if (!questions || picked !== null) return;
    const q = questions[current];
    setPicked(opt);
    setResults((r) => [...r, opt === q.answer]);
    if (q.promptIsDeva) speak(q.item.deva);
  };

  const next = () => {
    if (!questions) return;
    const isLast = current + 1 >= questions.length;
    if (isLast) {
      actions.recordQuiz(quizKey, results.filter(Boolean).length, questions.length);
    } else {
      setCurrent((c) => c + 1);
    }
    setPicked(null);
  };

  // Keyboard: 1–4 to answer, Enter to continue.
  useEffect(() => {
    if (!questions || finished) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (picked === null && n >= 1 && n <= questions[current].options.length) {
        choose(questions[current].options[n - 1]);
      } else if (picked !== null && e.key === "Enter") {
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---------- Setup screen
  if (!questions) {
    return (
      <div>
        <PageHeader
          deva="परीक्षा"
          title="Quiz"
          subtitle="Ten quick questions. Earn 10 XP for every correct answer."
        />
        <div className="space-y-6 rounded-3xl border border-line bg-surface p-6">
          <div>
            <p className="mb-3 font-medium">What do you want to practise?</p>
            <Dropdown
              label="Choose what to practise"
              triggerClassName="flex min-w-56 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 text-left hover:border-accent aria-expanded:border-accent"
              trigger={(open) => (
                <>
                  <span>{sources.find((o) => o.value === source)?.label}</span>
                  <Chevron open={open} />
                </>
              )}
              items={sources.map((o) => {
                const best = progress.bestScores[`${o.value}:${o.value === "alphabet" ? "sound" : mode}`];
                return {
                  key: o.value,
                  label: o.label,
                  hint: best !== undefined ? `best ${best}%` : undefined,
                  selected: o.value === source,
                };
              })}
              onSelect={setSource}
            />
          </div>
          <div>
            <p className="mb-3 font-medium">Question type</p>
            <Tabs
              value={effectiveMode}
              onChange={(m) => source !== "alphabet" && setMode(m)}
              options={modes
                .filter((m) => source !== "alphabet" || !m.needsMeaning)
                .map((m) => ({ value: m.value, label: m.label }))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
              <button
                type="button"
                onClick={start}
                data-spotlight="light"
                className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30"
              >
                Start quiz →
              </button>
            {progress.bestScores[quizKey] !== undefined && (
              <p className="text-sm text-muted">Best score: {progress.bestScores[quizKey]}%</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Results screen
  if (finished) {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / questions.length) * 100);
    const missed = questions.filter((_, i) => !results[i]);
    return (
      <div className="mx-auto max-w-xl text-center">
        <motion.p
          className="text-6xl"
          initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.45, duration: 0.6 }}
        >
          {pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "👍" : "📚"}
        </motion.p>
        <h1 className="mt-4 text-3xl font-semibold">
          {correct} / {questions.length} correct
        </h1>
        <p className="deva mt-1 text-xl text-accent">
          {pct >= 70 ? "साधु! (Well done!)" : "अभ्यासं कुरु (Keep practising)"}
        </p>
        <p className="mt-2 text-muted">+{correct * 10} XP earned</p>

        {missed.length > 0 && (
          <div className="mt-8 rounded-3xl border border-line bg-surface p-5 text-left">
            <p className="mb-3 font-medium">Review these</p>
            <ul className="space-y-2">
              {missed.map((q) => (
                <li key={q.item.id} className="flex items-center gap-3">
                  <SpeakButton text={q.item.deva} />
                  <span className="deva text-xl">{q.item.deva}</span>
                  <span className="italic text-muted">{q.item.translit}</span>
                  {q.item.meaning && <span className="ml-auto text-sm">{q.item.meaning}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={start} className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
            Try again
          </button>
          <button
            type="button"
            onClick={() => setQuestions(null)}
            className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent"
          >
            Change quiz
          </button>
        </div>
      </div>
    );
  }

  // ---------- Question screen
  const q = questions[current];
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setQuestions(null)} className="text-muted hover:text-ink" aria-label="Quit quiz">
          ✕
        </button>
        <ProgressBar value={((current + (picked ? 1 : 0)) / questions.length) * 100} className="flex-1" />
        <span className="text-sm tabular-nums text-muted">
          {current + 1}/{questions.length}
        </span>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-muted">
          {effectiveMode === "meaning" ? "What does this mean?" : effectiveMode === "reverse" ? "How do you say this in Sanskrit?" : "How is this read?"}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <motion.p
            key={current}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={spring}
            className={q.promptIsDeva ? "deva text-6xl" : "text-3xl font-semibold"}
          >
            {q.prompt}
          </motion.p>
          {q.promptIsDeva && <SpeakButton text={q.item.deva} />}
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const state =
            picked === null ? "idle" : opt === q.answer ? "right" : opt === picked ? "wrong" : "dim";
          return (
            <button
              key={`${current}-${opt}`}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(opt)}
              data-spotlight
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left ${
                state === "right"
                  ? "border-good bg-good-soft"
                  : state === "wrong"
                    ? "border-bad bg-bad-soft"
                    : state === "dim"
                      ? "border-line bg-surface opacity-50"
                      : "border-line bg-surface hover:border-accent/60"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs text-muted">
                {i + 1}
              </span>
              <span className={q.optionsAreDeva ? "deva text-2xl" : "text-lg"}>{opt}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
      {picked !== null && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={spring}
          className={`mt-6 flex items-center justify-between gap-4 rounded-2xl p-4 ${
            picked === q.answer ? "bg-good-soft text-good" : "bg-bad-soft text-bad"
          }`}
        >
          <div>
            <p className="font-semibold">{picked === q.answer ? "Correct! शोभनम्" : "Not quite"}</p>
            <p className="text-sm text-ink">
              <span className="deva">{q.item.deva}</span> · <em>{q.item.translit}</em>
              {q.item.meaning && <> · {q.item.meaning}</>}
            </p>
          </div>
          <button type="button" onClick={next} className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink">
            {current + 1 >= questions.length ? "Finish" : "Next →"}
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
