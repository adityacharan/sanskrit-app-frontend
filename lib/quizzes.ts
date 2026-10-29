// The quiz series (General Update_1): every topic is split into parts of 10 marks that between them
// ask every item, and finishing all of a topic's parts unlocks a 20-mark Grand Test over the whole topic.

import {
  allLetters,
  cases,
  categories,
  declensions,
  greetingSentences,
  lakaras,
  largeNumbers,
  ordinals,
  pronounList,
  pronounSections,
  quizSubjects,
  sentence,
  sentenceLakaras,
  verbs,
  type LakaraId,
} from "./data";
import { basicLakaras, advancedLakaras } from "./verbs";
import { shuffle } from "./speak";
import { toIAST } from "./iast";

export type Mode = "meaning" | "reverse" | "sound";
export type QItem = {
  id: string;
  deva: string;
  translit: string;
  meaning?: string;
  context?: string; // shown above the question, e.g. "पठ् · लट्"
  group?: string; // wrong answers come from the same group first
};
export type Part = { id: string; title: string; subtitle?: string; items: QItem[] };
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
};
export type GroupId = "alphabet" | "words" | "phrases" | "grammar" | "advanced";

export const PART_MARKS = 10;
export const GRAND_MARKS = 20;

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

// A table of forms becomes one item per distinct form; a form that fills several cells
// (रामौ is nominative and accusative dual) is one item whose meaning names all of them.
function formItems(
  idPrefix: string,
  cells: { deva: string; row: string; col: string }[],
  context: string,
  group: string,
): QItem[] {
  const byForm = new Map<string, { row: string; col: string }[]>();
  for (const c of cells) {
    if (c.deva === "—") continue;
    byForm.set(c.deva, [...(byForm.get(c.deva) ?? []), { row: c.row, col: c.col }]);
  }
  return [...byForm].map(([deva, where], i) => {
    const sameCol = where.every((w) => w.col === where[0].col);
    const meaning = sameCol
      ? `${where.map((w) => w.row).join(" / ")} · ${where[0].col}`
      : where.map((w) => `${w.row} · ${w.col}`).join(" / ");
    return { id: `${idPrefix}:${i}`, deva, translit: toIAST(deva), meaning, context, group };
  });
}

const numberNames = ["singular", "dual", "plural"];
const personShort = ["3rd", "2nd", "1st"];

// ---------------------------------------------------------------- topics

const sup = (n: number) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

function verbTopic(lakaraId: LakaraId, group: GroupId): Topic {
  const lakara = lakaras.find((l) => l.id === lakaraId)!;
  const parts: Part[] = [];
  for (const v of verbs) {
    const forms = v.forms[lakaraId];
    if (!forms) continue; // अस् has no forms in this lakara
    const cells = forms.flatMap((row, p) => row.map((deva, n) => ({ deva, row: personShort[p], col: numberNames[n] })));
    // "3rd / 1st person · singular" reads better than "3rd · singular / 1st · singular".
    const items = formItems(`${lakaraId}:${v.id}`, cells, `${v.root} · ${lakara.deva}`, v.id).map((it) => ({
      ...it,
      meaning: it.meaning!.replace(/(\d(?:st|nd|rd)) · /g, "$1 person · "),
    }));
    parts.push({ id: v.id, title: `${v.root}`, subtitle: v.meaning, items });
  }
  return {
    id: `verbs-${lakaraId}`,
    group,
    title: `Verbs · ${lakara.name}`,
    deva: lakara.deva,
    icon: "🏃",
    modes: ALL_MODES,
    parts,
    items: parts.flatMap((p) => p.items),
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

function nounsTopic(): Topic {
  const parts: Part[] = [];
  for (const d of declensions) {
    const cells = d.forms.flatMap((row, c) => row.map((deva, n) => ({ deva, row: cases[c].name, col: numberNames[n] })));
    const items = formItems(`noun:${d.id}`, cells, `${d.stem} · ${d.kind}`, d.id);
    chunk(items).forEach((c, i, all) =>
      parts.push({ id: `${d.id}${i + 1}`, title: all.length > 1 ? `${d.stem} · Part ${i + 1}` : d.stem, subtitle: d.kind, items: c }),
    );
  }
  return { id: "nouns", group: "grammar", title: "Nouns", deva: "शब्दरूपाणि", icon: "📘", modes: ALL_MODES, parts, items: parts.flatMap((p) => p.items) };
}

const genderWord = { m: "masculine", f: "feminine", n: "neuter" } as const;

function pronounTopics(): Topic[] {
  return pronounSections.map((s) => {
    const parts: Part[] = [];
    for (const p of pronounList.filter((x) => x.section === s.id)) {
      for (const t of p.tables) {
        const label = t.gender ? `${p.stem} · ${genderWord[t.gender]}` : p.stem;
        const cells = t.forms.flatMap((row, c) => row.map((deva, n) => ({ deva, row: cases[c].name, col: numberNames[n] })));
        const items = formItems(`pron:${p.id}:${t.gender ?? "x"}`, cells, label, `${p.id}:${t.gender ?? "x"}`);
        chunk(items).forEach((c, i, all) =>
          parts.push({ id: `${p.id}-${t.gender ?? "x"}${i + 1}`, title: all.length > 1 ? `${label} · ${i + 1}` : label, subtitle: p.meaning, items: c }),
        );
      }
    }
    return {
      id: `pronouns-${s.id}`,
      group: "grammar" as GroupId,
      title: `Pronouns · ${s.title.replace(/ \(.*\)$/, "")}`,
      deva: s.sanskrit,
      icon: "👤",
      modes: ALL_MODES,
      parts,
      items: parts.flatMap((x) => x.items),
    };
  });
}

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
  ...categories.map((c): Topic => {
    const items: QItem[] = c.words;
    return {
      id: c.slug,
      group: "words",
      title: c.title,
      deva: c.sanskrit,
      icon: c.icon,
      modes: ALL_MODES,
      items,
      parts: c.slug === "numbers" ? numberedParts("p", items, (w) => w.id.split(":")[1]) : numberedParts("p", items),
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
  nounsTopic(),
  ...pronounTopics(),
  ...basicLakaras.map((l) => verbTopic(l, "grammar")),
  sentencesTopic(),
  ...advancedLakaras.map((l) => verbTopic(l, "advanced")),
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
};

const answerOf = (it: QItem, m: Mode) => (m === "meaning" ? it.meaning! : m === "reverse" ? it.deva : it.translit);
const promptOf = (it: QItem, m: Mode) => (m === "reverse" ? it.meaning! : it.deva);

function question(item: QItem, mode: Mode, pool: QItem[]): Question {
  const answer = answerOf(item, mode);
  const prompt = promptOf(item, mode);
  // A wrong answer must not also fit the prompt anywhere in the topic: ते is masculine plural
  // but also feminine and neuter dual, so "Nominative / Accusative · dual" can't be a wrong option for it.
  const alsoRight = new Set(pool.filter((o) => promptOf(o, mode) === prompt).map((o) => answerOf(o, mode)));
  const candidates = pool.filter((o) => promptOf(o, mode) !== prompt && !alsoRight.has(answerOf(o, mode)));
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
    optionsAreDeva: mode === "reverse",
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

/** A part: every one of its items once, topped up to 10 marks with review items from the rest of the topic. */
export function partQuiz(topic: Topic, partIndex: number, mode: Mode): Question[] {
  const part = topic.parts[partIndex];
  const ids = new Set(part.items.map((i) => i.id));
  return fill(topic, part.items, topic.items.filter((i) => !ids.has(i.id)), mode, PART_MARKS);
}

/** The Grand Test: 20 marks, drawn evenly from every part of the topic. */
export function grandTest(topic: Topic, mode: Mode): Question[] {
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
