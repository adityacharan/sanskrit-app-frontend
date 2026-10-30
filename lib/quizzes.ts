// The quiz series (General Update_1): every topic is split into parts of 10 marks that between them
// ask every item, and finishing all of a topic's parts unlocks a 20-mark Grand Test over the whole topic.
// General Update_2 changed some topics: verbs, pronouns and nouns ask only the word, with Sanskrit options
// and no repeated question (`marks` parts and named `grands`); the everyday sentences are built from word tiles.

import {
  allLetters,
  cases,
  categories,
  greetingSentences,
  lakaras,
  largeNumbers,
  nounClasses,
  nounGenders,
  ordinals,
  persons,
  pronounList,
  quizSubjects,
  sentence,
  sentenceLakaras,
  spokenGroups,
  verbs,
} from "./data";
import { shuffle } from "./speak";
import { toIAST } from "./iast";

export type Mode = "meaning" | "reverse" | "sound" | "form" | "toEnglish" | "toSanskrit";
export type QItem = {
  id: string;
  deva: string;
  translit: string;
  meaning?: string;
  context?: string; // shown above the question, e.g. "पठ् · लट्"
  group?: string; // wrong answers come from the same group first
  cells?: string[]; // the table cells this form fills: a wrong answer can't name any of them
};
export type Part = {
  id: string;
  title: string;
  subtitle?: string;
  items: QItem[];
  /** Set: the test asks this many items drawn from `items`, never the same word twice. */
  marks?: number;
  pool?: QItem[]; // wrong answers for this part only (defaults to the topic's)
};
export type Topic = {
  id: string;
  group: GroupId;
  title: string;
  deva: string;
  icon: string;
  modes: Mode[];
  parts: Part[];
  items: QItem[];
  pool?: QItem[]; // wrong answers are drawn from here (defaults to items)
  grands?: Part[]; // named Grand Tests (default: one 20-mark test over the whole topic)
};
export type GroupId = "alphabet" | "words" | "phrases" | "grammar" | "advanced";

export const PART_MARKS = 10;
export const GRAND_MARKS = 20;
const FORM_TEST_MARKS = 20; // a verb, pronoun or noun test
const FORM_GRAND_MARKS = 30;
export const GRAND = "grand";

export const groups: { id: GroupId; title: string; deva: string }[] = [
  { id: "alphabet", title: "Alphabet", deva: "वर्णमाला" },
  { id: "words", title: "Words", deva: "शब्दाः" },
  { id: "phrases", title: "Phrases", deva: "वाक्यानि" },
  { id: "grammar", title: "Grammar", deva: "व्याकरणम्" },
  { id: "advanced", title: "Advanced Grammar", deva: "उन्नतव्याकरणम्" },
];

export const modeLabels: Record<Mode, string> = {
  meaning: "Sanskrit → English",
  reverse: "English → Sanskrit",
  sound: "Script → Romanization",
  form: "Identify the form",
  toEnglish: "Sanskrit → English",
  toSanskrit: "English → Sanskrit",
};
const ALL_MODES: Mode[] = ["meaning", "reverse", "sound"];

// ---------------------------------------------------------------- splitting into parts

/** Splits items, in order, into parts of at most 10 with sizes as even as possible. */
function chunk<T>(items: T[], size = PART_MARKS): T[][] {
  const count = Math.ceil(items.length / size);
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

/** Parts titled "Part 1", "Part 2" … with the first and last item as the subtitle. */
function numberedParts(prefix: string, items: QItem[], label: (it: QItem) => string = (it) => it.deva): Part[] {
  return chunk(items).map((c, i) => ({
    id: `${prefix}${i + 1}`,
    title: `Part ${i + 1}`,
    subtitle: c.length > 1 ? `${label(c[0])} – ${label(c[c.length - 1])}` : label(c[0]),
    items: c,
  }));
}

// A table of forms becomes one item per distinct word; a word that fills several cells (रामौ is
// nominative and accusative dual) is one item whose answer names all of them. A cell with two
// forms (मत्यै / मतये) gives two words. The answers are in Sanskrit.
function formItems(idPrefix: string, cells: { deva: string; row: string; col: string }[], group: string): QItem[] {
  const byForm = new Map<string, Map<string, string[]>>();
  for (const c of cells) {
    if (c.deva === "—") continue;
    for (const deva of c.deva.split(" / ")) {
      const cols = byForm.get(deva) ?? new Map<string, string[]>();
      const rows = cols.get(c.col) ?? [];
      if (!rows.includes(c.row)) rows.push(c.row);
      byForm.set(deva, cols.set(c.col, rows));
    }
  }
  return [...byForm].map(([deva, cols], i) => ({
    id: `${idPrefix}:${i}`,
    deva,
    translit: toIAST(deva),
    meaning: [...cols].map(([col, rows]) => `${rows.join(", ")} · ${col}`).join(" / "),
    group,
    cells: [...cols].flatMap(([col, rows]) => rows.map((row) => `${row} · ${col}`)),
  }));
}

/** A test that draws `marks` different words; smaller if the items don't have that many. */
function formPart(id: string, title: string, subtitle: string | undefined, items: QItem[], marks: number, pool?: QItem[]): Part {
  return { id, title, subtitle, items, marks: Math.min(marks, new Set(items.map((i) => i.deva)).size), pool };
}

const numberNames = ["एकवचनम्", "द्विवचनम्", "बहुवचनम्"];

// ---------------------------------------------------------------- topics

const sup = (n: number) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

// Only the verbs whose stem changes from lakara to lakara (गच्छति, गमिष्यति, जगाम), which is what the
// owner wants to show: पठति, पठिष्यति, हसति, हसिष्यति and the like just change their endings.
const changingVerbs = ["likh", "gam", "agam", "pa", "drs", "vad", "nrt", "nam", "smr", "kr", "stha", "ni", "bhu", "vas", "pac", "tyaj", "is", "ji", "sru", "da"].map(
  (id) => verbs.find((v) => v.id === id)!,
);

function verbsTopic(): Topic {
  // One test per lakara: one question per verb, answered with the person and number.
  const parts = lakaras.map((l) => {
    const items = changingVerbs.flatMap((v) =>
      formItems(
        `${l.id}:${v.id}`,
        v.forms[l.id]!.flatMap((row, p) => row.map((deva, n) => ({ deva, row: persons[p].sanskrit, col: numberNames[n] }))),
        v.id,
      ),
    );
    return formPart(l.id, l.deva, l.name.replace(/ \(.*\)$/, ""), items, changingVerbs.length, items);
  });

  // Three Grand Tests over all the lakaras, one for each person, so no question repeats between them.
  // The answer is the lakara; a form two lakaras share can't be asked.
  const inLakaras = (v: (typeof verbs)[number], deva: string) => lakaras.filter((l) => v.forms[l.id]!.flat().includes(deva));
  const pool: QItem[] = changingVerbs.flatMap((v) =>
    lakaras.flatMap((l) =>
      v.forms[l.id]!.flat()
        .filter((deva) => inLakaras(v, deva).length === 1)
        .map((deva) => ({ id: `grand:${v.id}:${l.id}:${deva}`, deva, translit: toIAST(deva), meaning: l.deva })),
    ),
  );
  const grands = [0, 1, 2].map((person, g) => {
    const items: QItem[] = [];
    for (let q = 0; q < FORM_GRAND_MARKS; q++) {
      const v = changingVerbs[q % changingVerbs.length];
      // Every verb, every lakara equally; the number and lakara move on so a verb's second question differs.
      const start = q + g * 3 + Math.floor(q / changingVerbs.length) * 5;
      for (let tryNo = 0; tryNo < lakaras.length * 3; tryNo++) {
        const l = lakaras[(start + Math.floor(tryNo / 3)) % lakaras.length];
        const deva = v.forms[l.id]![person][(q + tryNo) % 3];
        if (inLakaras(v, deva).length === 1 && !items.some((i) => i.deva === deva)) {
          items.push({ id: `grand:${v.id}:${l.id}:${deva}`, deva, translit: toIAST(deva), meaning: l.deva });
          break;
        }
      }
    }
    return formPart(`${GRAND}${g + 1}`, `Grand Test ${g + 1}`, `All lakaras · ${persons[person].sanskrit}`, items, FORM_GRAND_MARKS, pool);
  });

  return {
    id: "verbs",
    group: "grammar",
    title: "Verbs",
    deva: "धातुरूपाणि",
    icon: "🏃",
    modes: ["form"],
    parts,
    items: parts.flatMap((p) => p.items),
    grands,
  };
}

function sentencesTopic(): Topic {
  // Every verb once in each of the five lakaras; the subject rotates so all of them appear.
  const parts: Part[] = [];
  const pool: QItem[] = [];
  const items: QItem[] = [];
  sentenceLakaras.forEach((l, li) => {
    const lakara = lakaras.find((x) => x.id === l)!;
    const chosen: QItem[] = [];
    verbs.forEach((v, vi) => {
      const si = (vi + li * 7) % quizSubjects.length;
      const s = sentence(v, l, quizSubjects[si]);
      if (s) chosen.push({ id: `${l}:${v.id}:${si}`, deva: s.deva, translit: s.translit, meaning: s.meaning, group: `${v.id}:${si}` });
    });
    items.push(...chosen);
    chunk(chosen).forEach((c, i) =>
      parts.push({ id: `${l}${i + 1}`, title: `${lakara.deva} · Part ${i + 1}`, subtitle: lakara.name, items: c }),
    );
  });
  // Wrong answers: the same subject and verb in the other lakaras, so the question tests the lakara.
  verbs.forEach((v) =>
    quizSubjects.forEach((s, si) =>
      sentenceLakaras.forEach((l) => {
        const x = sentence(v, l, s);
        if (x) pool.push({ id: `${l}:${v.id}:${si}`, deva: x.deva, translit: x.translit, meaning: x.meaning, group: `${v.id}:${si}` });
      }),
    ),
  );
  return { id: "sentences", group: "grammar", title: "Sentences", deva: "वाक्यानि", icon: "✍️", modes: ["meaning", "reverse"], parts, items, pool };
}

// The noun endings quiz: which ending does this word have? 20 questions for each gender.
function nounEndingsTopic(): Topic {
  const parts = nounGenders.map((g) => {
    const classes = nounClasses.filter((c) => c.gender === g.id);
    const items: QItem[] = classes.flatMap((c) =>
      c.words.map((w) => {
        const deva = w.forms[0][0];
        return { id: `ending:${w.id}`, deva, translit: toIAST(deva), meaning: c.deva, group: c.id };
      }),
    );
    return formPart(g.id, `${g.title} · ${g.deva}`, `${items.length} words`, items, FORM_TEST_MARKS, items);
  });
  return { id: "noun-endings", group: "grammar", title: "Noun endings", deva: "शब्दान्ताः", icon: "🔤", modes: ["form"], parts, items: parts.flatMap((p) => p.items), grands: [] };
}

// Sabdarup: one test per ending, a Grand Test per gender, and one last Grand Test over all three.
function sabdarupTopics(): Topic[] {
  const wordItems = (w: (typeof nounClasses)[number]["words"][number]) =>
    formItems(w.id, w.forms.flatMap((row, c) => row.map((deva, n) => ({ deva, row: cases[c].sanskrit, col: numberNames[n] }))), w.id);
  const perGender = nounGenders.map((g): Topic => {
    const parts = nounClasses
      .filter((c) => c.gender === g.id)
      .map((c) => formPart(c.id, c.title, `${c.deva} · ${c.words.length} words`, c.words.flatMap(wordItems), FORM_TEST_MARKS));
    const items = parts.flatMap((p) => p.items);
    return {
      id: `sabda-${g.id}`,
      group: "grammar",
      title: `${g.title} Śabda`,
      deva: g.deva,
      icon: "📘",
      modes: ["form"],
      parts,
      items,
      grands: [formPart(GRAND, "Grand Test", `All ${g.title} words`, items, FORM_GRAND_MARKS)],
    };
  });
  const items = perGender.flatMap((t) => t.items);
  return [
    ...perGender,
    {
      id: "sabda-all",
      group: "grammar",
      title: "All Śabda",
      deva: "सर्वे शब्दाः",
      icon: "🏆",
      modes: ["form"],
      parts: [],
      items,
      grands: [formPart(GRAND, "Grand Test", "All three genders together", items, FORM_GRAND_MARKS)],
    },
  ];
}

// One test per pronoun (all its genders together), then three Grand Tests that share no question.
function pronounsTopic(): Topic {
  const seen = new Set<string>();
  const parts = pronounList.map((p) => {
    const cells = p.tables.flatMap((t) => t.forms.flatMap((row, c) => row.map((deva, n) => ({ deva, row: cases[c].sanskrit, col: numberNames[n] }))));
    return formPart(p.id, p.stem, p.meaning, formItems(`pron:${p.id}`, cells, p.id), FORM_TEST_MARKS);
  });
  const items = parts.flatMap((p) => p.items);
  const distinct = items.filter((i) => !seen.has(i.deva) && seen.add(i.deva));
  const grands = [0, 1, 2].map((g) =>
    formPart(`${GRAND}${g + 1}`, `Grand Test ${g + 1}`, "All pronouns together", distinct.filter((_, i) => i % 3 === g), FORM_GRAND_MARKS, items),
  );
  return { id: "pronouns", group: "grammar", title: "Pronouns", deva: "सर्वनामानि", icon: "👤", modes: ["form"], parts, items, grands };
}

/** Parts titled "Part 1", "Part 2" … in `count` even parts, each asking all its items. */
function evenParts(items: QItem[], count: number): Part[] {
  return chunk(items, Math.ceil(items.length / count)).map((c, i) => ({
    id: `part${i + 1}`, // not "p1": saved scores for the old, smaller parts shouldn't count
    title: `Part ${i + 1}`,
    subtitle: c[0].meaning && `${c[0].meaning} – ${c[c.length - 1].meaning}`,
    items: c,
    marks: c.length,
  }));
}

// Greetings and Good Manners are quizzed together (General Update_2).
const SEPARATE_WORDS = ["greetings", "manners"];

export const topics: Topic[] = [
  {
    id: "alphabet",
    group: "alphabet",
    title: "Alphabet",
    deva: "वर्णमाला",
    icon: "अ",
    modes: ["sound"],
    items: allLetters,
    parts: numberedParts("p", allLetters),
  },
  (() => {
    const items: QItem[] = categories.filter((c) => SEPARATE_WORDS.includes(c.slug)).flatMap((c) => c.words);
    return { id: "greetings-manners", group: "words", title: "Greetings & Good Manners", deva: "अभिवादनं शिष्टाचारः च", icon: "🙏", modes: ALL_MODES, items, parts: numberedParts("p", items) } as Topic;
  })(),
  ...categories.filter((c) => !SEPARATE_WORDS.includes(c.slug)).map((c): Topic => {
    const items: QItem[] = c.words;
    return {
      id: c.slug,
      group: "words",
      title: c.title,
      deva: c.sanskrit,
      icon: c.icon,
      modes: ALL_MODES,
      items,
      parts:
        c.slug === "numbers"
          ? numberedParts("p", items, (w) => w.id.split(":")[1])
          : c.slug === "family"
            ? evenParts(items, 3)
            : numberedParts("p", items),
    };
  }),
  {
    id: "greeting-sentences",
    group: "phrases",
    title: "Greeting sentences",
    deva: "अभिवादनानि",
    icon: "💬",
    modes: ALL_MODES,
    items: greetingSentences,
    parts: numberedParts("p", greetingSentences, (s) => s.deva.split(/[।,!?]/)[0]),
  },
  {
    id: "spoken",
    group: "phrases",
    title: "Everyday sentences",
    deva: "दैनिकवाक्यानि",
    icon: "🗣️",
    modes: ["toEnglish", "toSanskrit"],
    items: spokenGroups.flatMap((g) => g.sentences),
    parts: spokenGroups.map((g) => ({ id: g.id, title: g.title, subtitle: g.deva, items: g.sentences })),
  },
  nounEndingsTopic(),
  ...sabdarupTopics(),
  pronounsTopic(),
  verbsTopic(),
  sentencesTopic(),
  (() => {
    const items: QItem[] = largeNumbers.rows.map((r) => ({
      id: `large:${r.power}`,
      deva: r.deva,
      translit: r.translit,
      meaning: `10${sup(r.power)} · ${r.meaning}`,
    }));
    return { id: "large-numbers", group: "advanced", title: "Large numbers", deva: "महासङ्ख्याः", icon: "🔭", modes: ALL_MODES, items, parts: numberedParts("p", items, (it) => `10${sup(Number(it.id.split(":")[1]))}`) } as Topic;
  })(),
  (() => {
    // Every form is asked: the masculine, feminine and neuter of each ordinal, one gender at a time.
    // Wrong answers come from the same ordinal's other genders first, so the question tests the gender.
    const genders = [
      { key: "m", name: "masculine", form: (o: (typeof ordinals)[number]) => o.masculine },
      { key: "f", name: "feminine", form: (o: (typeof ordinals)[number]) => o.feminine },
      { key: "n", name: "neuter", form: (o: (typeof ordinals)[number]) => o.neuter },
    ];
    const parts: Part[] = [];
    for (const g of genders) {
      chunk(ordinals).forEach((c, i) =>
        parts.push({
          id: `${g.key}${i + 1}`,
          title: `${g.name[0].toUpperCase()}${g.name.slice(1)} · ${c[0].label}–${c[c.length - 1].label}`,
          items: c.map((o) => ({
            id: `ordinal:${o.n}:${g.key}`,
            deva: g.form(o),
            translit: toIAST(g.form(o)),
            meaning: `${o.english} (${o.label}) · ${g.name}`,
            group: `ordinal:${o.n}`,
          })),
        }),
      );
    }
    return { id: "ordinals", group: "advanced", title: "Ordinal numbers", deva: "पूरणसङ्ख्याः", icon: "🥇", modes: ALL_MODES, items: parts.flatMap((p) => p.items), parts } as Topic;
  })(),
];

// ---------------------------------------------------------------- questions

export type Question = {
  item: QItem;
  mode: Mode;
  prompt: string;
  promptIsDeva: boolean;
  options: string[];
  answer: string;
  optionsAreDeva: boolean;
  /** Set for the sentence builder: the word tiles in shuffled order, including wrong ones. */
  tiles?: string[];
};

export const isBuilder = (m: Mode) => m === "toEnglish" || m === "toSanskrit";

/** The words of a sentence as tiles: no punctuation. */
export const tokens = (sentence: string) =>
  sentence
    .split(/\s+/)
    .map((w) => w.replace(/[।॥.,!?]/g, ""))
    .filter(Boolean);

const WRONG_TILES = 4;

const answerOf = (it: QItem, m: Mode) =>
  m === "meaning" || m === "form" || m === "toEnglish" ? it.meaning! : m === "reverse" || m === "toSanskrit" ? it.deva : it.translit;
const promptOf = (it: QItem, m: Mode) => (m === "reverse" || m === "toSanskrit" ? it.meaning! : it.deva);

function builderQuestion(item: QItem, mode: Mode, pool: QItem[]): Question {
  const answer = answerOf(item, mode);
  const right = tokens(answer);
  // अहं and अहम् are the same word, so one can't be a wrong tile for the other.
  const same = (w: string) => w.toLowerCase().replace(/ं$/, "म्");
  const has = new Set(right.map(same));
  const others = [...new Map(pool.flatMap((o) => tokens(answerOf(o, mode))).map((w) => [same(w), w])).values()].filter((w) => !has.has(same(w)));
  return {
    item,
    mode,
    prompt: promptOf(item, mode),
    promptIsDeva: mode === "toEnglish",
    options: [],
    answer,
    optionsAreDeva: mode === "toSanskrit",
    tiles: shuffle([...right, ...shuffle(others).slice(0, WRONG_TILES)]),
  };
}

function question(item: QItem, mode: Mode, pool: QItem[]): Question {
  if (isBuilder(mode)) return builderQuestion(item, mode, pool);
  const answer = answerOf(item, mode);
  const prompt = promptOf(item, mode);
  // A wrong answer must not also fit the prompt anywhere in the topic: ते is masculine plural
  // but also feminine and neuter dual, so "Nominative / Accusative · dual" can't be a wrong option for it.
  const alsoRight = new Set(pool.filter((o) => promptOf(o, mode) === prompt).map((o) => answerOf(o, mode)));
  // The same for answers naming several cells: मे is चतुर्थी and षष्ठी, so "षष्ठी · एकवचनम्" alone can't be wrong.
  const rightCells = new Set(pool.filter((o) => o.deva === item.deva).flatMap((o) => o.cells ?? []));
  const candidates = pool.filter(
    (o) => promptOf(o, mode) !== prompt && !alsoRight.has(answerOf(o, mode)) && !o.cells?.some((c) => rightCells.has(c)),
  );
  const pick = (from: QItem[], taken: string[]) =>
    shuffle([...new Set(from.map((o) => answerOf(o, mode)))].filter((v) => !taken.includes(v)));
  const wrong = pick(item.group ? candidates.filter((o) => o.group === item.group) : [], []).slice(0, 3);
  if (wrong.length < 3) wrong.push(...pick(candidates, wrong).slice(0, 3 - wrong.length));
  return {
    item,
    mode,
    prompt,
    promptIsDeva: mode !== "reverse",
    options: shuffle([answer, ...wrong]),
    answer,
    optionsAreDeva: mode === "reverse" || mode === "form",
  };
}

/** Tops a quiz up to `total` in the same question type: first with other items of the topic, then,
 *  for topics smaller than the quiz, by asking items again. Types are never mixed, so the prompt
 *  and options keep one size throughout. */
function fill(topic: Topic, chosen: QItem[], extra: QItem[], mode: Mode, total: number): Question[] {
  const pool = topic.pool ?? topic.items;
  const qs = chosen.map((it) => question(it, mode, pool));
  for (const it of shuffle(extra)) {
    if (qs.length >= total) break;
    qs.push(question(it, mode, pool));
  }
  while (qs.length < total) {
    for (const it of shuffle([...chosen, ...extra])) {
      if (qs.length >= total) break;
      qs.push(question(it, mode, pool));
    }
  }
  return shuffle(qs);
}

/** Draws `marks` items, taking turns between the groups (words), never the same word twice. */
function draw(part: Part): QItem[] {
  const queues = new Map<string, QItem[]>();
  for (const it of shuffle(part.items)) {
    const key = it.group ?? "";
    queues.set(key, [...(queues.get(key) ?? []), it]);
  }
  const lists = shuffle([...queues.values()]);
  const seen = new Set<string>();
  const picked: QItem[] = [];
  while (picked.length < part.marks! && lists.some((q) => q.length)) {
    for (const q of lists) {
      while (q.length && picked.length < part.marks!) {
        const it = q.pop()!;
        if (seen.has(it.deva)) continue;
        seen.add(it.deva);
        picked.push(it);
        break;
      }
    }
  }
  return shuffle(picked);
}

const marksTest = (topic: Topic, part: Part, mode: Mode) => draw(part).map((it) => question(it, mode, part.pool ?? topic.pool ?? topic.items));

/** A part: every one of its items once, topped up to 10 marks with review items from the rest of the topic. */
export function partQuiz(topic: Topic, partIndex: number, mode: Mode): Question[] {
  const part = topic.parts[partIndex];
  if (part.marks) return marksTest(topic, part, mode);
  const ids = new Set(part.items.map((i) => i.id));
  return fill(topic, part.items, topic.items.filter((i) => !ids.has(i.id)), mode, PART_MARKS);
}

/** A topic's Grand Tests: its named ones, or one 20-mark test over the whole topic. */
export const grandsOf = (topic: Topic): Part[] =>
  topic.grands ?? [{ id: GRAND, title: "Grand Test", items: topic.items, marks: GRAND_MARKS }];

export const partMarks = (part: Part) => part.marks ?? PART_MARKS;

/** A Grand Test. Named ones use their own draw; the default is drawn evenly from every part of the topic. */
export function grandTest(topic: Topic, grandId: string, mode: Mode): Question[] {
  const named = topic.grands?.find((g) => g.id === grandId);
  if (named) return marksTest(topic, named, mode);
  const queues = topic.parts.map((p) => shuffle(p.items));
  const picked: QItem[] = [];
  while (picked.length < GRAND_MARKS && queues.some((q) => q.length)) {
    for (const q of queues) if (q.length && picked.length < GRAND_MARKS) picked.push(q.pop()!);
  }
  return fill(topic, picked, [], mode, GRAND_MARKS);
}

// ---------------------------------------------------------------- progress keys

export const quizKey = (topicId: string, partId: string, mode: Mode) => `q/${topicId}/${partId}/${mode}`;
/** A part counts as done once it has been finished in any question type. */
export const isDone = (scores: Record<string, number>, topicId: string, partId: string) =>
  Object.keys(scores).some((k) => k.startsWith(`q/${topicId}/${partId}/`));
export const bestOf = (scores: Record<string, number>, topicId: string, partId: string) => {
  const vals = Object.entries(scores)
    .filter(([k]) => k.startsWith(`q/${topicId}/${partId}/`))
    .map(([, v]) => v);
  return vals.length ? Math.max(...vals) : undefined;
};
