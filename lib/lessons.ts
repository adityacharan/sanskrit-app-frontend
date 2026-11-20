// Duolingo-style lessons for the vocabulary tabs (Edited_daily_Conversation.docx: "create in the similar
// way of Duolingo … all words and sentences should be covered and don't repeat the words").
// Every tab is a path of units; a unit is a tab's word cards or a section of the conversation book,
// split in order into lessons of at most 8 items, so every item is taught in exactly one lesson.

import { categories, type Category } from "./data";
import { bookUnit, type BookUnit } from "./book";
import { shuffle } from "./speak";

export type LessonItem = { id: string; deva: string; translit: string; meaning: string; kind: "word" | "sentence" };
export type Unit = { id: string; deva: string; title: string; items: LessonItem[] };
export type VocabTab = {
  slug: string;
  title: string;
  sanskrit: string;
  icon: string;
  category?: Category; // the flashcard deck, for tabs that have word cards
  units: Unit[];
};
export type Lesson = { tab: string; unit: Unit; n: number; items: LessonItem[]; key: string };

const LESSON_SIZE = 8;

const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

// Numbers and Time's word cards are only the numbers.
const wordsUnit = (c: Category): Unit => ({
  id: "words",
  deva: c.slug === "numbers" ? "सङ्ख्याः" : c.sanskrit,
  title: "Words",
  items: c.words.map((w) => ({ id: w.id, deva: w.deva, translit: w.translit, meaning: w.meaning, kind: "word" })),
});

const book = (...ids: string[]): Unit[] => ids.map((id) => bookUnit(id) as BookUnit);

const withWords = (slug: string, ...bookIds: string[]): VocabTab => {
  const c = cat(slug);
  return { slug, title: c.title, sanskrit: c.sanskrit, icon: c.icon, category: c, units: [wordsUnit(c), ...book(...bookIds)] };
};

// The tabs in the order of the owner's document, then the older word tabs.
export const vocabTabs: VocabTab[] = [
  withWords("greetings", "s27"),
  withWords("manners", "manners"),
  { slug: "meeting", title: "Meeting", sanskrit: "मेलनम्", icon: "👋", units: book("s2", "s5") },
  {
    slug: "simple",
    title: "Simple sentences",
    sanskrit: "सरलवाक्यानि",
    icon: "💬",
    units: book("s3", "s4", "s6", "s7", "s10", "s12", "s13", "s14", "s16", "s18", "s19", "s20", "s25"),
  },
  { slug: "studies", title: "Studies", sanskrit: "अध्ययनम्", icon: "📚", units: book("s8", "s9", "s11", "s15") },
  withWords("numbers", "s17"),
  withWords("family", "s21", "s22", "s23", "s24", "s26"),
  withWords("nature"),
  withWords("animals"),
  withWords("body"),
];

/** Splits items, in order, into lessons of at most 8 with sizes as even as possible. */
function chunk<T>(items: T[]): T[][] {
  const count = Math.ceil(items.length / LESSON_SIZE);
  const base = Math.floor(items.length / count);
  const extra = items.length % count;
  const out: T[][] = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const n = base + (i < extra ? 1 : 0);
    out.push(items.slice(at, at + n));
    at += n;
  }
  return out;
}

export const lessonKey = (tab: string, unit: string, n: number) => `${tab}/${unit}/${n}`;

export const lessonsOf = (tab: string, unit: Unit): Lesson[] =>
  chunk(unit.items).map((items, i) => ({ tab, unit, n: i + 1, items, key: lessonKey(tab, unit.id, i + 1) }));

export const allLessons = (tab: VocabTab): Lesson[] => tab.units.flatMap((u) => lessonsOf(tab.slug, u));

export const lessonHref = (l: Lesson) => `/vocabulary/lesson?tab=${l.tab}&unit=${l.unit.id}&n=${l.n}`;

export function findLesson(tabSlug: string | null, unitId: string | null, n: number) {
  const tab = vocabTabs.find((t) => t.slug === tabSlug);
  const unit = tab?.units.find((u) => u.id === unitId);
  if (!tab || !unit) return null;
  const lessons = allLessons(tab);
  const i = lessons.findIndex((l) => l.unit === unit && l.n === n);
  return i < 0 ? null : { tab, lesson: lessons[i], next: lessons[i + 1] as Lesson | undefined };
}

/** A unit's lessons open one after another; the first lesson of every unit is always open. */
export const isUnlocked = (done: Record<string, number>, l: Lesson) => l.n === 1 || lessonKey(l.tab, l.unit.id, l.n - 1) in done;

// ---------------------------------------------------------------- exercises

export type Exercise =
  | { kind: "intro"; item: LessonItem }
  | { kind: "meaning"; item: LessonItem; options: string[] } // Sanskrit shown, pick the English
  | { kind: "reverse"; item: LessonItem; options: string[] } // English shown, pick the Sanskrit
  | { kind: "build"; item: LessonItem; tiles: string[] } // English shown, build the Sanskrit from word tiles
  | { kind: "match"; items: LessonItem[] }; // tap the pairs

/** The words of a Sanskrit sentence as tiles: no punctuation or quotes. */
export const tileWords = (deva: string) =>
  deva
    .split(/\s+/)
    .map((w) => w.replace(/[।॥.,!?‘’'"()…]/g, ""))
    .filter(Boolean);

/** अहं and अहम् are the same word. */
export const sameWord = (w: string) => w.replace(/ं$/, "म्");

// Slashes, brackets, blanks and "…" mark alternatives or gaps, which can't be built from tiles.
const buildable = (it: LessonItem) => it.kind === "sentence" && !/[/()…_]/.test(it.deva) && tileWords(it.deva).length >= 2;

const WRONG_OPTIONS = 3;
const WRONG_TILES = 4;
const MATCH_PAIRS = 5;

/** Where wrong answers come from: the lesson's own unit first, then the rest of the tab. */
export type Pool = { near: LessonItem[]; far: LessonItem[] };

/**
 * Wrong answers: items of the same kind (words for a word) before others, the unit before the tab.
 * An item that is also a right answer is never offered: one whose prompt is the same as this one's
 * (two sentences with the same English, or the same Sanskrit).
 */
function wrongOptions(item: LessonItem, pool: Pool, value: (it: LessonItem) => string, prompt: (it: LessonItem) => string): string[] {
  const right = value(item);
  const out: string[] = [];
  const add = (from: LessonItem[]) => {
    for (const o of shuffle(from)) {
      const v = value(o);
      if (out.length < WRONG_OPTIONS && v !== right && prompt(o) !== prompt(item) && !out.includes(v)) out.push(v);
    }
  };
  const sameKind = (l: LessonItem[]) => l.filter((o) => o.kind === item.kind);
  add(sameKind(pool.near));
  add(sameKind(pool.far));
  add(pool.near);
  add(pool.far);
  return out;
}

const meaningQ = (item: LessonItem, pool: Pool): Exercise => ({
  kind: "meaning",
  item,
  options: shuffle([item.meaning, ...wrongOptions(item, pool, (o) => o.meaning, (o) => o.deva)]),
});

function practiceQ(item: LessonItem, pool: Pool): Exercise {
  if (!buildable(item)) {
    return { kind: "reverse", item, options: shuffle([item.deva, ...wrongOptions(item, pool, (o) => o.deva, (o) => o.meaning)]) };
  }
  const right = tileWords(item.deva);
  const has = new Set(right.map(sameWord));
  // Spare tiles come only from sentences that are built from tiles themselves: no brackets, blanks or slashes.
  const wordsOf = (l: LessonItem[]) =>
    shuffle([...new Map(l.filter(buildable).flatMap((o) => tileWords(o.deva)).map((w) => [sameWord(w), w])).values()].filter((w) => !has.has(sameWord(w))));
  const near = wordsOf(pool.near);
  const others = [...near, ...wordsOf(pool.far).filter((w) => !near.includes(w))];
  return { kind: "build", item, tiles: shuffle([...right, ...others.slice(0, WRONG_TILES)]) };
}

/** A fresh copy of an exercise, with its options in a new order, to ask again after a mistake. */
export const again = (ex: Exercise, pool: Pool): Exercise =>
  ex.kind === "meaning" ? meaningQ(ex.item, pool) : ex.kind === "reverse" || ex.kind === "build" ? practiceQ(ex.item, pool) : ex;

/** Answer-checking for the build exercise: Sanskrit word order is free, so any order of the right words counts. */
export const builtRight = (item: LessonItem, built: string[]) =>
  [...built.map(sameWord)].sort().join(" ") === [...tileWords(item.deva).map(sameWord)].sort().join(" ");

export const poolFor = (tab: VocabTab, lesson: Lesson): Pool => ({
  near: lesson.unit.items,
  far: tab.units.filter((u) => u !== lesson.unit).flatMap((u) => u.items),
});

/**
 * The lesson, like Duolingo: each new item is shown and then its meaning asked, two at a time;
 * then a round of matching pairs; then every item once more the other way round — built from
 * word tiles when it's a sentence, picked from Sanskrit options otherwise.
 */
export function buildLesson(lesson: Lesson, pool: Pool): Exercise[] {
  const items = lesson.items;
  const steps: Exercise[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const two = items.slice(i, i + 2);
    for (const it of two) steps.push({ kind: "intro", item: it });
    for (const it of two) steps.push(meaningQ(it, pool));
  }
  // Short items only, so the two columns stay readable on a phone; no two with the same text.
  const short = items.filter((it) => it.deva.length <= 24 && it.meaning.length <= 40);
  const pairs = short.filter(
    (it, i) => short.findIndex((o) => o.deva === it.deva || o.meaning === it.meaning) === i,
  );
  if (pairs.length >= 3) steps.push({ kind: "match", items: shuffle(pairs).slice(0, MATCH_PAIRS) });
  for (const it of shuffle(items)) steps.push(practiceQ(it, pool));
  return steps;
}
