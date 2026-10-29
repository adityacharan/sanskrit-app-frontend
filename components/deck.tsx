"use client";

// The pattern every learning section shares (General Update_1): a flashcard at the top,
// then a one-line preview of the items with a "See all" toggle for the full list.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { project, SpeakButton, spring } from "@/components/ui";

export function useDeck(length: number) {
  // [index, direction of travel]: direction decides which way cards enter and exit.
  const [[raw, dir], set] = useState<[number, number]>([0, 0]);
  const index = Math.min(raw, Math.max(0, length - 1));
  // Stable functions, so callers can use them in effect dependencies.
  const go = useCallback((delta: number) => set(([i]) => [(i + delta + length) % length, delta]), [length]);
  const goTo = useCallback((n: number) => set(([i]) => [n, n >= i ? 1 : -1]), []);
  const reset = useCallback(() => set([0, 0]), []);
  return { index, dir, go, goTo, reset };
}

/** One text size for a whole deck, so cards don't change size as you swipe. */
export const deckSize = (texts: string[], long = "text-4xl", short = "text-6xl") =>
  texts.some((t) => t.length > 12) ? long : short;

type DeckProps = {
  deck: ReturnType<typeof useDeck>;
  count: number;
  cardKey: string;
  front: React.ReactNode;
  back: React.ReactNode;
  speakText: (flipped: boolean) => string;
  frontCorner?: React.ReactNode;
  children?: React.ReactNode;
};

export function Deck({ deck, count, cardKey, front, back, speakText, frontCorner, children }: DeckProps) {
  // Flipping belongs to one card; moving to another card shows its front.
  const [flippedKey, setFlippedKey] = useState<string | null>(null);
  const flipped = flippedKey === cardKey;
  // Moving to another card by any route (list, buttons, tabs) clears the flip.
  useEffect(() => setFlippedKey(null), [cardKey]);
  const toggle = () => setFlippedKey(flipped ? null : cardKey);
  const go = (d: number) => {
    setFlippedKey(null);
    deck.go(d);
  };

  return (
    <div className="mx-auto max-w-md">
      <div
        className="relative h-72 rounded-3xl"
        tabIndex={0}
        role="group"
        aria-label="Flashcard. Space flips, arrow keys move. Swipe left or right."
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          } else if (e.key === "ArrowRight") go(1);
          else if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <AnimatePresence initial={false} custom={deck.dir}>
          <Card key={cardKey} dir={deck.dir} flipped={flipped} onFlip={toggle} onSwipe={go} corner={frontCorner} front={front} back={back} />
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} className="rounded-full border border-line bg-surface px-4 py-2 hover:border-accent">
          ← Prev
        </button>
        <div className="flex items-center gap-3">
          <SpeakButton text={speakText(flipped)} />
          <span className="text-sm tabular-nums text-muted">
            {deck.index + 1} / {count}
          </span>
        </div>
        <button type="button" onClick={() => go(1)} className="rounded-full border border-line bg-surface px-4 py-2 hover:border-accent">
          Next →
        </button>
      </div>
      {children}
    </div>
  );
}

const SWIPE_DISTANCE = 110;

function Card({
  dir,
  flipped,
  onFlip,
  onSwipe,
  corner,
  front,
  back,
}: {
  dir: number;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (delta: number) => void;
  corner?: React.ReactNode;
  front: React.ReactNode;
  back: React.ReactNode;
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
        <div className="flip-face absolute inset-0 flex select-none flex-col items-center justify-center rounded-3xl border border-line bg-surface px-6 pb-10 pt-6 text-center shadow-[0_10px_30px_-12px_rgb(0_0_0/0.2)]">
          {corner}
          {front}
          <p className="absolute bottom-4 text-xs text-muted">Tap to flip · swipe for next</p>
        </div>
        <div className="flip-face flip-back absolute inset-0 flex select-none flex-col items-center justify-center rounded-3xl border border-accent bg-accent-soft p-6 text-center shadow-[0_10px_30px_-12px_rgb(0_0_0/0.2)]">
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------- Preview list */

type Group = { label: React.ReactNode; from: number; to: number }; // item indexes [from, to)

export function PreviewList<T>({
  title,
  items,
  active,
  onPick,
  getKey,
  chip,
  row,
  groups,
}: {
  title: React.ReactNode;
  items: T[];
  active: number;
  onPick: (index: number) => void;
  getKey: (item: T) => string;
  /** Compact content for the one-line preview (and the full list when there's no `row`). */
  chip: (item: T) => React.ReactNode;
  /** Richer content for each item in the full list. */
  row?: (item: T, index: number, isActive: boolean) => React.ReactNode;
  groups?: Group[];
}) {
  const [open, setOpen] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  // Keep the current item visible in the one-line preview.
  useEffect(() => {
    const el = strip.current?.children[active] as HTMLElement | undefined;
    const box = strip.current;
    if (!el || !box) return;
    if (el.offsetLeft < box.scrollLeft || el.offsetLeft + el.offsetWidth > box.scrollLeft + box.clientWidth) {
      box.scrollTo({ left: el.offsetLeft - 8, behavior: "smooth" });
    }
  }, [active, open]);

  const chipButton = (item: T, i: number) => (
    <button
      key={getKey(item)}
      type="button"
      onClick={() => onPick(i)}
      aria-current={i === active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 ${
        i === active ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent"
      }`}
    >
      {chip(item)}
    </button>
  );

  const full = (from: number, to: number) =>
    row ? (
      <div className="grid gap-2 sm:grid-cols-2">
        {items.slice(from, to).map((item, k) => (
          <div key={getKey(item)}>{row(item, from + k, from + k === active)}</div>
        ))}
      </div>
    ) : (
      <div className="flex flex-wrap gap-2">{items.slice(from, to).map((item, k) => chipButton(item, from + k))}</div>
    );

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
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
        groups ? (
          <div className="space-y-5">
            {groups.map((g, i) => (
              <div key={i}>
                <p className="mb-2 text-sm font-medium text-muted">{g.label}</p>
                {full(g.from, g.to)}
              </div>
            ))}
          </div>
        ) : (
          full(0, items.length)
        )
      ) : (
        <div className="relative">
          <div ref={strip} className="no-scrollbar flex gap-2 overflow-x-auto">
            {items.map(chipButton)}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-bg to-transparent" />
        </div>
      )}
    </section>
  );
}
