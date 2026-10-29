"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader, ProgressBar, SpeakButton, spring, Tabs } from "@/components/ui";
import {
  bestOf,
  GRAND_MARKS,
  grandTest,
  groups,
  isDone,
  modeLabels,
  PART_MARKS,
  partQuiz,
  quizKey,
  topics,
  type Mode,
  type Question,
  type Topic,
} from "@/lib/quizzes";
import { actions, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speak";

const GRAND = "grand";
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

type Run = { topic: Topic; partId: string; mode: Mode; questions: Question[] };

export default function QuizPage() {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("meaning");
  const [run, setRun] = useState<Run | null>(null);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const progress = useProgress();
  const scores = progress.bestScores;

  const topic = topics.find((t) => t.id === topicId) ?? null;
  const finished = run !== null && results.length === run.questions.length && picked === null;

  const openTopic = (t: Topic) => {
    setTopicId(t.id);
    setMode(t.modes[0]);
    window.scrollTo({ top: 0 });
  };

  const start = (t: Topic, partId: string, m: Mode) => {
    const i = t.parts.findIndex((p) => p.id === partId);
    setRun({ topic: t, partId, mode: m, questions: partId === GRAND ? grandTest(t, m) : partQuiz(t, i, m) });
    setCurrent(0);
    setPicked(null);
    setResults([]);
    window.scrollTo({ top: 0 });
  };

  const choose = (opt: string) => {
    if (!run || picked !== null) return;
    const q = run.questions[current];
    setPicked(opt);
    setResults((r) => [...r, opt === q.answer]);
    if (q.promptIsDeva) speak(q.item.deva);
  };

  const next = () => {
    if (!run) return;
    if (current + 1 >= run.questions.length) {
      actions.recordQuiz(quizKey(run.topic.id, run.partId, run.mode), results.filter(Boolean).length, run.questions.length);
    } else {
      setCurrent((c) => c + 1);
    }
    setPicked(null);
  };

  // Keyboard: 1–4 to answer, Enter to continue.
  useEffect(() => {
    if (!run || finished) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (picked === null && n >= 1 && n <= run.questions[current].options.length) choose(run.questions[current].options[n - 1]);
      else if (picked !== null && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---------- Topic list
  if (!topic) {
    return (
      <div>
        <PageHeader
          deva="परीक्षा"
          title="Quiz"
          subtitle={`Every topic is split into parts of ${PART_MARKS} marks that cover every item. Finish all the parts of a topic to unlock its ${GRAND_MARKS}-mark Grand Test.`}
        />
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.id}>
              <h2 className="mb-3 text-xl font-semibold">
                {g.title} · <span className="deva text-accent">{g.deva}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topics
                  .filter((t) => t.group === g.id)
                  .map((t) => {
                    const done = t.parts.filter((p) => isDone(scores, t.id, p.id)).length;
                    const grand = bestOf(scores, t.id, GRAND);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openTopic(t)}
                        data-spotlight
                        className="flex flex-col rounded-2xl border border-line bg-surface p-4 text-left hover:border-accent"
                      >
                        <span className="flex items-center gap-3">
                          <span className="deva flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg text-accent">
                            {t.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium">{t.title}</span>
                            <span className="deva block text-sm text-muted">{t.deva}</span>
                          </span>
                        </span>
                        <span className="mt-3 flex items-center justify-between text-sm text-muted">
                          <span>
                            {done} / {plural(t.parts.length, "part")}
                          </span>
                          <span>{grand !== undefined ? `🏆 ${grand}%` : done === t.parts.length ? "🏆 Grand Test ready" : "🔒 Grand Test"}</span>
                        </span>
                        <ProgressBar value={(done / t.parts.length) * 100} className="mt-2" />
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  // ---------- A topic's parts
  if (!run) {
    const done = topic.parts.filter((p) => isDone(scores, topic.id, p.id)).length;
    const unlocked = done === topic.parts.length;
    const grand = bestOf(scores, topic.id, GRAND);
    return (
      <div>
        <button type="button" onClick={() => setTopicId(null)} className="mb-6 text-sm text-muted hover:text-ink">
          ← All topics
        </button>
        <PageHeader
          deva={topic.deva}
          title={topic.title}
          subtitle={`${plural(topic.parts.length, "part")} of ${PART_MARKS} marks covering all ${topic.items.length} items, then a ${GRAND_MARKS}-mark Grand Test.`}
        />
        {topic.modes.length > 1 && (
          <div className="mb-6">
            <p className="mb-3 font-medium">Question type</p>
            <Tabs value={mode} onChange={setMode} options={topic.modes.map((m) => ({ value: m, label: modeLabels[m] }))} />
          </div>
        )}

        <div className="mb-3 flex items-center gap-3 text-sm text-muted">
          <span>
            {done} of {plural(topic.parts.length, "part")} done
          </span>
          <ProgressBar value={(done / topic.parts.length) * 100} className="flex-1" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topic.parts.map((p) => {
            const best = bestOf(scores, topic.id, p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => start(topic, p.id, mode)}
                data-spotlight
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 text-left hover:border-accent"
              >
                <span className="min-w-0">
                  <span className="block text-lg">{p.title}</span>
                  {p.subtitle && <span className="block truncate text-sm text-muted">{p.subtitle}</span>}
                </span>
                <span className="shrink-0 text-right text-sm">
                  {best !== undefined ? (
                    <span className="rounded-full bg-good-soft px-2.5 py-0.5 font-medium text-good">✓ {best}%</span>
                  ) : (
                    <span className="text-muted">{PART_MARKS} marks</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 ${
            unlocked ? "bg-accent text-accent-ink" : "border border-line bg-surface"
          }`}
        >
          <div>
            <p className="text-xl font-semibold">{unlocked ? "🏆" : "🔒"} Grand Test · {GRAND_MARKS} marks</p>
            <p className={`text-sm ${unlocked ? "opacity-90" : "text-muted"}`}>
              {unlocked
                ? `Questions from ${topic.parts.length === 1 ? "the whole of" : `all ${topic.parts.length} parts of`} ${topic.title}.${grand !== undefined ? ` Best score: ${grand}%.` : ""}`
                : `Finish ${topic.parts.length === 1 ? "the part" : `all ${topic.parts.length} parts`} to unlock it (${topic.parts.length - done} left).`}
            </p>
          </div>
          {unlocked && (
            <button
              type="button"
              onClick={() => start(topic, GRAND, mode)}
              className="rounded-full bg-accent-ink px-6 py-3 font-medium text-accent shadow-sm hover:shadow-md"
            >
              Start Grand Test →
            </button>
          )}
        </div>
      </div>
    );
  }

  const isGrand = run.partId === GRAND;
  const partIndex = run.topic.parts.findIndex((p) => p.id === run.partId);
  const runTitle = isGrand ? "Grand Test" : run.topic.parts[partIndex].title;

  // ---------- Results
  if (finished) {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / run.questions.length) * 100);
    const missed = run.questions.filter((q, i) => !results[i] && run.questions.findIndex((x, j) => !results[j] && x.item.id === q.item.id) === i);
    const nextPart = !isGrand && partIndex + 1 < run.topic.parts.length ? run.topic.parts[partIndex + 1] : null;
    const allDone = run.topic.parts.every((p) => isDone(scores, run.topic.id, p.id));
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
        <p className="mt-4 text-sm text-muted">
          {run.topic.title} · {runTitle}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">
          {correct} / {run.questions.length} marks
        </h1>
        <p className="deva mt-1 text-xl text-accent">{pct >= 70 ? "साधु! (Well done!)" : "अभ्यासं कुरु (Keep practising)"}</p>
        <p className="mt-2 text-muted">+{correct * 10} XP earned</p>

        {missed.length > 0 && (
          <div className="mt-8 rounded-3xl border border-line bg-surface p-5 text-left">
            <p className="mb-3 font-medium">Review these</p>
            <ul className="space-y-2">
              {missed.map((q, i) => (
                <li key={`${q.item.id}-${i}`} className="flex items-start gap-3">
                  <SpeakButton text={q.item.deva} />
                  <div className="min-w-0">
                    <p className="deva text-xl">{q.item.deva}</p>
                    <p className="text-sm text-muted">
                      <em>{q.item.translit}</em>
                      {q.item.meaning && <> · {q.item.meaning}</>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => start(run.topic, run.partId, run.mode)} className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent">
            Try again
          </button>
          {nextPart ? (
            <button type="button" onClick={() => start(run.topic, nextPart.id, run.mode)} className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
              Next part →
            </button>
          ) : (
            !isGrand &&
            allDone && (
              <button type="button" onClick={() => start(run.topic, GRAND, run.mode)} className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
                Grand Test →
              </button>
            )
          )}
          <button type="button" onClick={() => setRun(null)} className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent">
            All parts
          </button>
        </div>
      </div>
    );
  }

  // ---------- Question
  const q = run.questions[current];
  // One prompt size for the whole quiz, so it doesn't jump between questions.
  const promptSize = run.questions.some((x) => x.promptIsDeva && x.prompt.length > 12) ? "text-4xl" : "text-6xl";
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setRun(null)} className="text-muted hover:text-ink" aria-label="Quit quiz">
          ✕
        </button>
        <ProgressBar value={((current + (picked ? 1 : 0)) / run.questions.length) * 100} className="flex-1" />
        <span className="text-sm tabular-nums text-muted">
          {current + 1}/{run.questions.length}
        </span>
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        {run.topic.title} · {runTitle}
      </p>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted">
          {q.mode === "meaning" ? "What does this mean?" : q.mode === "reverse" ? "How do you say this in Sanskrit?" : "How is this read?"}
        </p>
        {q.item.context && <p className="mt-1 text-lg font-medium text-accent">{q.item.context}</p>}
        <div className="mt-3 flex items-center justify-center gap-3">
          <motion.p
            key={current}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={spring}
            className={q.promptIsDeva ? `deva ${promptSize}` : "text-3xl font-semibold"}
          >
            {q.prompt}
          </motion.p>
          {q.promptIsDeva && <SpeakButton text={q.item.deva} />}
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const state = picked === null ? "idle" : opt === q.answer ? "right" : opt === picked ? "wrong" : "dim";
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
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs text-muted">{i + 1}</span>
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
            className={`mt-6 flex items-center justify-between gap-4 rounded-2xl p-4 ${picked === q.answer ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}
          >
            <div>
              <p className="font-semibold">{picked === q.answer ? "Correct! शोभनम्" : "Not quite"}</p>
              <p className="text-sm text-ink">
                <span className="deva">{q.item.deva}</span> · <em>{q.item.translit}</em>
                {q.item.meaning && <> · {q.item.meaning}</>}
              </p>
            </div>
            <button type="button" onClick={next} className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink">
              {current + 1 >= run.questions.length ? "Finish" : "Next →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
