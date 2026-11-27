// Duolingo-style lessons for the vocabulary tabs (Edited_daily_Conversation.docx: "create in the similar
// way of Duolingo … all words and sentences should be covered and don't repeat the words").
// Every tab is a path of units; a unit is a tab's word cards or a section of the conversation book,
// split in order into lessons of at most 10 items, so every item is taught in exactly one lesson.

import { categories, type Category } from "./data";
import { bookUnit, type BookUnit } from "./book";
import { shuffle } from "./speak";
import { sameWord, spareOk } from "./tiles";

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

// Ten since 2026-11-27: the owner asked for the questions after every ten sentences (it was 8, asked in twos).
const LESSON_SIZE = 10;

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

/** Splits items, in order, into lessons of at most 10 with sizes as even as possible. */
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
  | { kind: "listen"; item: LessonItem; options: string[] } // a word is heard, pick it from Sanskrit options
  | { kind: "hear"; item: LessonItem; tiles: string[] } // a sentence is heard, build it from word tiles
  | { kind: "blank"; item: LessonItem; words: string[]; gap: number; options: string[] } // one word missing, pick it
  | { kind: "match"; items: LessonItem[] }; // tap the pairs

/** The words of a Sanskrit sentence as tiles: no punctuation or quotes. */
export const tileWords = (deva: string) =>
  deva
    .split(/\s+/)
    .map((w) => w.replace(/[।॥.,!?‘’'"()…]/g, ""))
    .filter(Boolean);

// Slashes, brackets, blanks and "…" mark alternatives or gaps, which can't be built from tiles.
const buildable = (it: LessonItem) => it.kind === "sentence" && !/[/()…_]/.test(it.deva) && tileWords(it.deva).length >= 2;

const WRONG_OPTIONS = 3;
const WRONG_TILES = 4;
const MATCH_PAIRS = 5;
const EXTRA_EACH = 2; // listening and missing-word exercises per lesson

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
  return { kind: "build", item, tiles: shuffle([...tileWords(item.deva), ...spareWords(item, pool).slice(0, WRONG_TILES)]) };
}

// Spare words for a sentence: from sentences that are built from tiles themselves (no brackets, blanks
// or slashes), the unit before the tab, and never a word that could make a second right sentence (`spareOk`).
function spareWords(item: LessonItem, pool: Pool): string[] {
  const right = tileWords(item.deva);
  const has = new Set(right.map(sameWord));
  const wordsOf = (l: LessonItem[]) =>
    shuffle(
      [...new Map(l.filter(buildable).flatMap((o) => tileWords(o.deva)).map((w) => [sameWord(w), w])).values()].filter(
        (w) => !has.has(sameWord(w)) && spareOk(w, right, item.meaning),
      ),
    );
  const near = wordsOf(pool.near);
  return [...near, ...wordsOf(pool.far).filter((w) => !near.some((n) => sameWord(n) === sameWord(w)))];
}

// Read aloud, an alternative ("जननी / माता"), a bracket or a blank can't be told apart from the plain item.
const listenable = (it: LessonItem) => !/[/()…_]/.test(it.deva) && it.deva.length <= 40;

/**
 * The item is read aloud. A sentence is then built from its word tiles, like every other sentence
 * exercise (a sentence is never offered whole among whole sentences); a word is picked from Sanskrit options.
 */
const listenQ = (item: LessonItem, pool: Pool): Exercise =>
  buildable(item)
    ? { kind: "hear", item, tiles: shuffle([...tileWords(item.deva), ...spareWords(item, pool).slice(0, WRONG_TILES)]) }
    : { kind: "listen", item, options: shuffle([item.deva, ...wrongOptions(item, pool, (o) => o.deva, (o) => o.deva)]) };

// A gap needs a sentence of three words or more, and a word that is in it only once.
const gapsOf = (it: LessonItem) => {
  const words = tileWords(it.deva).map(sameWord);
  return buildable(it) && words.length >= 3 ? words.map((_, i) => i).filter((i) => words.indexOf(words[i]) === words.lastIndexOf(words[i])) : [];
};

/** The sentence with one word left out; pick the missing word. */
function blankQ(item: LessonItem, pool: Pool): Exercise {
  const words = tileWords(item.deva);
  const gap = shuffle(gapsOf(item))[0];
  return { kind: "blank", item, words, gap, options: shuffle([words[gap], ...spareWords(item, pool).slice(0, WRONG_OPTIONS)]) };
}

/** Whether `picked` fills the gap. */
export const gapRight = (ex: Extract<Exercise, { kind: "blank" }>, picked: string) => sameWord(picked) === sameWord(ex.words[ex.gap]);

/** A fresh copy of an exercise, with its options in a new order, to ask again after a mistake. */
export const again = (ex: Exercise, pool: Pool): Exercise =>
  ex.kind === "meaning"
    ? meaningQ(ex.item, pool)
    : ex.kind === "reverse" || ex.kind === "build"
      ? practiceQ(ex.item, pool)
      : ex.kind === "listen" || ex.kind === "hear"
        ? listenQ(ex.item, pool)
        : ex.kind === "blank"
          ? blankQ(ex.item, pool)
          : ex;

/** Answer-checking for the build exercise: Sanskrit word order is free, so any order of the right words counts. */
export const builtRight = (item: LessonItem, built: string[]) =>
  [...built.map(sameWord)].sort().join(" ") === [...tileWords(item.deva).map(sameWord)].sort().join(" ");

export const poolFor = (tab: VocabTab, lesson: Lesson): Pool => ({
  near: lesson.unit.items,
  far: tab.units.filter((u) => u !== lesson.unit).flatMap((u) => u.items),
});

/**
 * The lesson: first all of its new items are shown, one after another (up to ten), and only then do the
 * questions start (the owner, 2026-11-27: questions and sentence building come "after every ten
 * sentences, not after two"). Each item is asked once in the order it was shown; then a round of
 * matching pairs; then up to two listening and two missing-word exercises; then every item is asked
 * once more, in a new order.
 * A sentence is never asked whole with whole meanings to choose from (the owner asked for this): it is
 * given in English and built from its jumbled Sanskrit word tiles, both times. Words, and sentences that
 * can't be cut into tiles, are asked by meaning first and then picked from Sanskrit options.
 */
export function buildLesson(lesson: Lesson, pool: Pool): Exercise[] {
  const items = lesson.items;
  const steps: Exercise[] = [];
  for (const it of items) steps.push({ kind: "intro", item: it });
  for (const it of items) steps.push(buildable(it) ? practiceQ(it, pool) : meaningQ(it, pool));
  // Short items only, so the two columns stay readable on a phone; no two with the same text.
  const short = items.filter((it) => it.deva.length <= 24 && it.meaning.length <= 40);
  const pairs = short.filter(
    (it, i) => short.findIndex((o) => o.deva === it.deva || o.meaning === it.meaning) === i,
  );
  if (pairs.length >= 3) steps.push({ kind: "match", items: shuffle(pairs).slice(0, MATCH_PAIRS) });
  // Two more kinds of practice (2026-11-26), on a few of the lesson's items and added to the rounds above,
  // not instead of them: hear it and pick it, and pick a sentence's missing word.
  const gaps = shuffle(items.filter((it) => gapsOf(it).length > 0)).slice(0, EXTRA_EACH);
  const rest = items.filter((it) => listenable(it) && !gaps.includes(it));
  const heard = shuffle(rest.length >= EXTRA_EACH ? rest : items.filter(listenable)).slice(0, EXTRA_EACH);
  steps.push(...shuffle([...heard.map((it) => listenQ(it, pool)), ...gaps.map((it) => blankQ(it, pool))]));
  for (const it of shuffle(items)) steps.push(practiceQ(it, pool));
  return steps;
}
