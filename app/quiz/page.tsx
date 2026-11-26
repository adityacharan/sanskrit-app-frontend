"use client";

// One test (a topic's part, or a Grand Test), opened from a step of the course map. The Quiz page's own
// lists of topics and tests are gone (2026-11-26): the map is that list now.

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ProgressBar, SpeakButton, spring, Tabs } from "@/components/ui";
import { grandOpen, nextTest, sectionHref, sectionOfTopic, stepOpen, testHref } from "@/lib/course";
import {
  bestOf,
  builtRight,
  grandsOf,
  grandTest,
  isBuilder,
  modeLabels,
  partMarks,
  partQuiz,
  quizKey,
  topics,
  type Mode,
  type Part,
  type Question,
  type Topic,
} from "@/lib/quizzes";
import { actions, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speak";

export default function QuizPage() {
  return (
    <Suspense>
      <TestRoute />
    </Suspense>
  );
}

function Notice({ title, text, href }: { title: string; text?: string; href: string }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mt-1 text-muted">{text}</p>}
      <Link href={href} className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
        Back to the map
      </Link>
    </div>
  );
}

function TestRoute() {
  const params = useSearchParams();
  const scores = useProgress().bestScores;
  const topic = topics.find((t) => t.id === params.get("t"));
  const partId = params.get("p");
  const part = topic && (topic.parts.find((p) => p.id === partId) ?? grandsOf(topic).find((g) => g.id === partId));
  if (!topic || !part) return <Notice title="Pick a test from the map." href="/" />;
  const isGrand = !topic.parts.includes(part);
  const back = sectionHref(sectionOfTopic(topic.id));
  // A Grand Test opens once every test of its topic is done, also when its address is typed in.
  if (isGrand && !grandOpen(scores, topic)) {
    return <Notice title="This Grand Test is locked." text={`Finish all the tests of ${topic.title} first.`} href={back} />;
  }
  const asked = params.get("m") as Mode | null;
  // The key starts the test afresh when "Next test" changes the address.
  return <Test key={`${topic.id}/${part.id}`} topic={topic} part={part} isGrand={isGrand} back={back} askedMode={asked && topic.modes.includes(asked) ? asked : null} />;
}

function Test({ topic, part, isGrand, back, askedMode }: { topic: Topic; part: Part; isGrand: boolean; back: string; askedMode: Mode | null }) {
  const router = useRouter();
  const scores = useProgress().bestScores;
  const make = (m: Mode) => (isGrand ? grandTest(topic, part.id, m) : partQuiz(topic, topic.parts.indexOf(part), m));
  const [mode, setMode] = useState<Mode>(askedMode ?? topic.modes[0]);
  // A topic with one question type starts at once; with several, the type is chosen first
  // (it comes in the address when "Next test" carries it over).
  const startsAtOnce = askedMode !== null || topic.modes.length === 1;
  const [questions, setQuestions] = useState<Question[] | null>(null);
  // Drawn after the page is in the browser: questions are random, so a draw on the server would not match.
  useEffect(() => {
    if (startsAtOnce) setQuestions(make(mode));
    // Once, when the test opens: the key on <Test> remounts it for another test.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const label = part.title.replace(/\bPart (\d+)$/, "Test $1");
  const finished = questions !== null && results.length === questions.length && picked === null;

  const start = () => {
    setQuestions(make(mode));
    setCurrent(0);
    setPicked(null);
    setResults([]);
    window.scrollTo({ top: 0 });
  };

  const choose = (opt: string) => {
    if (!questions || picked !== null) return;
    const q = questions[current];
    setPicked(opt);
    setResults((r) => [...r, opt === q.answer]);
    if (q.promptIsDeva || q.mode === "toSanskrit") speak(q.item.deva);
  };

  const next = () => {
    if (!questions) return;
    if (current + 1 >= questions.length) {
      actions.recordQuiz(quizKey(topic.id, part.id, mode), results.filter(Boolean).length, questions.length);
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
      if (picked === null && n >= 1 && n <= questions[current].options.length) choose(questions[current].options[n - 1]);
      // A focused button gets its own click from Enter; calling next() here too would skip a question.
      else if (picked !== null && e.key === "Enter" && !(e.target instanceof Element && e.target.closest("a, button"))) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!questions && startsAtOnce) return null; // one frame, until the questions are drawn

  // ---------- Before the test: choose the question type
  if (!questions) {
    const best = bestOf(scores, topic.id, part.id);
    return (
      <div className="mx-auto max-w-xl">
        <Link href={back} className="text-sm text-muted hover:text-ink">
          ← Back to the map
        </Link>
        <div className="mt-6 rounded-3xl border border-line bg-surface p-6 text-center">
          <p className="deva text-lg text-accent">{topic.deva}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{topic.title}</h1>
          <p className="mt-1 text-muted">
            {isGrand ? "🏆 " : ""}
            {label} · {partMarks(part)} marks{best !== undefined ? ` · Best score: ${best}%` : ""}
          </p>
          {part.subtitle && <p className="deva mt-1 text-lg text-muted">{part.subtitle}</p>}
          <p className="mb-3 mt-6 font-medium">Question type</p>
          <Tabs value={mode} onChange={setMode} options={topic.modes.map((m) => ({ value: m, label: modeLabels[m] }))} />
          <button type="button" onClick={start} className="mt-6 block w-full rounded-full bg-accent py-3 font-medium text-accent-ink">
            Start
          </button>
        </div>
      </div>
    );
  }

  // ---------- Results
  if (finished) {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / questions.length) * 100);
    const missed = questions.filter((q, i) => !results[i] && questions.findIndex((x, j) => !results[j] && x.item.id === q.item.id) === i);
    // The next test of the topic, if it is open: a Grand Test waits until every test is done.
    const after = nextTest(topic.id, part.id);
    const following = after && stepOpen({ lessons: {}, bestScores: scores }, after) ? after : undefined;
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
          {topic.title} · {label}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">
          {correct} / {questions.length} marks
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
          <button type="button" onClick={start} className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent">
            Try again
          </button>
          {following && (
            <button
              type="button"
              onClick={() => router.replace(testHref(topic.id, following.part.id, mode))}
              className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink"
            >
              {following.grand ? following.label : "Next test"} →
            </button>
          )}
          <Link href={back} className="rounded-full border border-line bg-surface px-6 py-3 font-medium hover:border-accent">
            Back to the map
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Question
  const q = questions[current];
  // One prompt size for the whole quiz, so it doesn't jump between questions.
  // Word-only tests draw at random, so they use the smaller size every time, not just when a long word comes up.
  const promptSize = q.mode === "form" || questions.some((x) => x.promptIsDeva && x.prompt.length > 12) ? "text-4xl" : "text-6xl";
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-4">
        <Link href={back} className="text-muted hover:text-ink" aria-label="Quit test">
          ✕
        </Link>
        <ProgressBar value={((current + (picked ? 1 : 0)) / questions.length) * 100} className="flex-1" />
        <span className="text-sm tabular-nums text-muted">
          {current + 1}/{questions.length}
        </span>
      </div>
      {/* Word-only tests: a title like "Verbs · लट्" would give away the lakara, root or gender. */}
      {q.mode !== "form" && (
        <p className="mt-3 text-center text-sm text-muted">
          {topic.title} · {label}
        </p>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-muted">
          {q.mode === "meaning"
            ? "What does this mean?"
            : q.mode === "reverse"
              ? "How do you say this in Sanskrit?"
              : q.mode === "sound"
                ? "How is this read?"
                : isBuilder(q.mode)
                  ? "Pick the words to make this sentence in Sanskrit"
                  : ""}
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

      {q.tiles && <SentenceBuilder key={current} question={q} locked={picked !== null} onCheck={choose} />}

      <div className={q.tiles ? "hidden" : "mt-10 grid gap-3 sm:grid-cols-2"}>
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
              <span className={q.mode === "form" ? "deva text-xl" : q.optionsAreDeva ? "deva text-2xl" : "text-lg"}>{opt}</span>
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
                {/* A built sentence is shown whole only here, so it gets its own line at a readable size. */}
                <span className={q.tiles ? "deva block text-lg" : "deva"}>{q.item.deva}</span>
                {!q.tiles && " · "}
                <em>{q.item.translit}</em>
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

// Sentence translation, like Duolingo: the sentence is given in English and its Sanskrit words are jumbled
// among a few spare ones. Tap word tiles to build the sentence, tap a placed word to take it back.
function SentenceBuilder({ question: q, locked, onCheck }: { question: Question; locked: boolean; onCheck: (answer: string) => void }) {
  const [placed, setPlaced] = useState<number[]>([]); // indexes into q.tiles
  const tiles = q.tiles!;
  const root = useRef<HTMLDivElement>(null);
  const tileClass = "deva rounded-xl border px-3 py-1.5 text-2xl";
  const built = placed.map((i) => tiles[i]);
  // After Check, the built sentence turns green or red, like a chosen option.
  const placedClass = !locked ? "border-line bg-surface hover:border-accent" : builtRight(q.answer, built) ? "border-good bg-good-soft" : "border-bad bg-bad-soft";

  const check = () => {
    if (locked || !placed.length) return;
    // "✗" keeps a wrong sentence from ever being equal to the answer.
    onCheck(builtRight(q.answer, built) ? q.answer : `✗ ${built.join(" ")}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Enter on a link or button elsewhere (quit, speak) keeps its normal meaning.
      const control = document.activeElement?.closest("a, button");
      if (e.key !== "Enter" || locked || (control && !root.current?.contains(control))) return;
      e.preventDefault(); // otherwise Enter also presses whichever tile has focus
      check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={root} className="mt-8">
      <div className="flex min-h-16 flex-wrap items-center gap-2 border-y border-line py-3">
        {placed.map((t, i) => (
          <button key={t} type="button" disabled={locked} onClick={() => setPlaced((p) => p.filter((x) => x !== t))} className={`${tileClass} ${placedClass}`}>
            {tiles[t]}
            <span className="sr-only"> (position {i + 1}, tap to remove)</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {tiles.map((word, i) => {
          const used = placed.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={locked || used}
              onClick={() => setPlaced((p) => [...p, i])}
              className={`${tileClass} border-line bg-surface ${used ? "opacity-30" : "hover:border-accent"}`}
            >
              {word}
            </button>
          );
        })}
      </div>
      {!locked && (
        <button
          type="button"
          onClick={check}
          disabled={!placed.length}
          className="mt-6 w-full rounded-full bg-accent py-3 font-medium text-accent-ink disabled:opacity-50"
        >
          Check
        </button>
      )}
    </div>
  );
}
