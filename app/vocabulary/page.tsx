"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { PageHeader, ProgressBar, project, SpeakButton, spring, Tabs } from "@/components/ui";
import { categories, largeNumbers, type Word } from "@/lib/data";
import { actions, useProgress } from "@/lib/progress";

export default function VocabularyPage() {
  return (
    <Suspense>
      <Vocabulary />
    </Suspense>
  );
}

function Vocabulary() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get("c") ?? categories[0].slug;
  const category = categories.find((c) => c.slug === slug) ?? categories[0];

  // [index, direction of travel] — direction decides which way cards enter/exit.
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const [flipped, setFlipped] = useState(false);
  const progress = useProgress();
  const learned = new Set(progress.learned);

  const word = category.words[Math.min(index, category.words.length - 1)];
  const done = category.words.filter((w) => learned.has(w.id)).length;

  const go = (delta: number) => {
    setFlipped(false);
    setPage(([i]) => [(i + delta + category.words.length) % category.words.length, delta]);
  };

  const pickCategory = (s: string) => {
    setPage([0, 0]);
    setFlipped(false);
    router.replace(`/vocabulary?c=${s}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader
        deva="शब्दाः"
        title="Vocabulary"
        subtitle="Flip each card to reveal its meaning. Mark words you know to earn XP and track your progress."
      />

      <Tabs
        value={category.slug}
        onChange={pickCategory}
        options={categories.map((c) => ({ value: c.slug, label: `${c.icon} ${c.title}` }))}
      />

      <div className="mt-6 flex items-center gap-3 text-sm text-muted">
        <span>
          {done} of {category.words.length} learned
        </span>
        <ProgressBar value={(done / category.words.length) * 100} className="flex-1" />
      </div>

      <div className="mx-auto mt-6 max-w-md">
        <div
          className="relative h-72 rounded-3xl"
          tabIndex={0}
          role="group"
          aria-label="Flashcard. Space flips, arrow keys move. Swipe left or right."
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setFlipped((f) => !f);
            } else if (e.key === "ArrowRight") go(1);
            else if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <AnimatePresence initial={false} custom={dir}>
            <Flashcard
              key={word.id}
              word={word}
              dir={dir}
              learned={learned.has(word.id)}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              onSwipe={go}
            />
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={() => go(-1)} className="rounded-full border border-line bg-surface px-4 py-2 hover:border-accent">
            ← Prev
          </button>
          <div className="flex items-center gap-3">
            <SpeakButton text={word.deva} />
            <span className="text-sm tabular-nums text-muted">
              {index + 1} / {category.words.length}
            </span>
          </div>
          <button type="button" onClick={() => go(1)} className="rounded-full border border-line bg-surface px-4 py-2 hover:border-accent">
            Next →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              actions.setLearned(word.id, false);
              go(1);
            }}
            className="rounded-2xl border border-line bg-surface py-3 font-medium hover:border-accent hover:bg-surface-2"
          >
            Still learning
          </button>
          <button
            type="button"
            onClick={() => {
              actions.setLearned(word.id, true);
              go(1);
            }}
            data-spotlight="light"
            className="rounded-2xl bg-good py-3 font-medium text-white hover:brightness-105"
          >
            I know this ✓
          </button>
        </div>
      </div>

      <h2 className="mb-3 mt-12 text-xl font-semibold">
        All words · <span className="deva text-accent">{category.sanskrit}</span>
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {category.words.map((w, i) => (
          <div
            key={w.id}
            data-spotlight
            className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 ${
              i === index ? "border-accent" : "border-line"
            }`}
          >
            <SpeakButton text={w.deva} />
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                setPage([i, i > index ? 1 : -1]);
                setFlipped(false);
              }}
            >
              {w.numeral && <span className="deva mr-2 rounded-md bg-surface-2 px-1.5 text-sm text-muted">{w.numeral}</span>}
              <span className="deva text-xl">{w.deva}</span>{" "}
              <span className="text-sm italic text-muted">{w.translit}</span>
              <span className="block text-sm">{w.meaning}</span>
              {w.note && <span className="mt-1 block text-xs text-muted">Note: {w.note}</span>}
            </button>
            <input
              type="checkbox"
              checked={learned.has(w.id)}
              onChange={(e) => actions.setLearned(w.id, e.target.checked)}
              className="h-5 w-5 accent-[var(--good)]"
              aria-label={`Mark ${w.translit} as learned`}
            />
          </div>
        ))}
      </div>

      {category.slug === "numbers" && <LargeNumbers />}
    </div>
  );
}

// The powers of ten, under the Numbers list: the owner's shloka note and its table.
function LargeNumbers() {
  return (
    <section className="mt-12">
      <h2 className="mb-3 text-xl font-semibold">
        Large numbers · <span className="deva text-accent">महासङ्ख्याः</span>
      </h2>
      <div className="rounded-2xl bg-accent-soft p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Note</p>
        <div className="mt-2 flex items-start gap-3">
          <SpeakButton text={largeNumbers.shloka.deva.join(" ")} />
          <div className="min-w-0">
            {largeNumbers.shloka.deva.map((line) => (
              <p key={line} className="deva text-lg sm:text-xl">
                {line}
              </p>
            ))}
            <div className="mt-2 text-sm italic text-muted">
              {largeNumbers.shloka.translit.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm">{largeNumbers.intro}</p>
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-surface-2 text-left">
            <tr>
              <th className="px-3 py-2.5 font-medium">Power of ten</th>
              <th className="px-3 py-2.5 font-medium">Sanskrit</th>
              <th className="px-3 py-2.5 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {largeNumbers.rows.map((r) => (
              <tr key={r.power}>
                <td className="border-t border-line px-3 py-2.5 tabular-nums">
                  10<sup>{r.power}</sup>
                  <span className="block text-xs text-muted">{r.value}</span>
                </td>
                <td className="border-t border-line px-3 py-2.5">
                  <span className="deva text-lg">{r.deva}</span>
                  <span className="block text-xs italic text-muted">{r.translit}</span>
                </td>
                <td className="border-t border-line px-3 py-2.5">{r.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const SWIPE_DISTANCE = 110;

function Flashcard({
  word,
  dir,
  learned,
  flipped,
  onFlip,
  onSwipe,
}: {
  word: Word;
  dir: number;
  learned: boolean;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (delta: number) => void;
}) {
  const x = useMotionValue(0);
  // The card leans the way it's being dragged.
  const rotate = useTransform(x, [-300, 300], [-10, 10]);
  const dragged = useRef(false);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ x, rotate, perspective: 1200 }}
      custom={dir}
      variants={{
        enter: (d: number) => ({ x: d * 260, opacity: 0, scale: 0.94 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (d: number) => ({ x: d * -320, opacity: 0, scale: 0.94 }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ ...spring, opacity: { duration: 0.2 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
      onPointerDown={() => (dragged.current = false)}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={(_, info) => {
        // Decide from where the flick is heading, not just where it was released.
        const landing = info.offset.x + project(info.velocity.x);
        if (landing < -SWIPE_DISTANCE) onSwipe(1);
        else if (landing > SWIPE_DISTANCE) onSwipe(-1);
      }}
      onClick={() => !dragged.current && onFlip()}
    >
      <motion.div
        className="relative h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      >
        <div className="flip-face absolute inset-0 flex select-none flex-col items-center justify-center rounded-3xl border border-line bg-surface p-6 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.2)]">
          {word.numeral && (
            <span className="deva absolute left-4 top-4 rounded-full bg-surface-2 px-2.5 py-0.5 text-sm text-muted">{word.numeral}</span>
          )}
          {learned && (
            <span className="absolute right-4 top-4 rounded-full bg-good-soft px-2.5 py-0.5 text-xs font-medium text-good">
              ✓ Learned
            </span>
          )}
          <p className={`deva text-center ${word.deva.length > 12 ? "text-4xl" : "text-6xl"}`}>{word.deva}</p>
          <p className="mt-3 text-center text-lg italic text-muted">{word.translit}</p>
          <p className="absolute bottom-4 text-xs text-muted">Tap to flip · swipe for next</p>
        </div>
        <div className="flip-face flip-back absolute inset-0 flex select-none flex-col items-center justify-center rounded-3xl border border-accent bg-accent-soft p-6 text-center shadow-[0_10px_30px_-12px_rgb(0_0_0/0.2)]">
          <p className="text-3xl font-semibold">{word.meaning}</p>
          <p className="deva mt-3 text-2xl text-accent">{word.deva}</p>
          <p className="italic text-muted">{word.translit}</p>
          {word.note && <p className="mt-3 text-xs text-muted">{word.note}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
