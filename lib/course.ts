// The course: one map of everything there is to do (owner, 2026-11-26: "a complete lesson map", like
// Duolingo). A section is a vocabulary tab with its lessons, followed by the tests that used to be on the
// Quiz page; the topics that have no lessons (everyday sentences, alphabet, grammar) are sections of tests.

import { isUnlocked, lessonHref, lessonsOf, vocabTabs, type Lesson } from "./lessons";
import { grandsOf, isDone, topics, type Part, type Topic } from "./quizzes";

export type TestStep = { kind: "test"; id: string; href: string; label: string; topic: Topic; part: Part; grand: boolean };
export type Step = { kind: "lesson"; id: string; href: string; label: string; lesson: Lesson } | TestStep;
export type CourseUnit = { id: string; deva: string; title: string; steps: Step[] };
export type Section = {
  id: string;
  title: string;
  deva: string;
  icon: string;
  units: CourseUnit[];
  /** The reference page that goes with the section: its flashcards, lists or tables. */
  study: { href: string; label: string };
};

export const testHref = (topicId: string, partId: string, mode?: string) =>
  `/quiz?t=${topicId}&p=${partId}${mode ? `&m=${mode}` : ""}`;
export const sectionHref = (sectionId: string) => `/?s=${sectionId}`;

const topic = (id: string) => topics.find((t) => t.id === id)!;

/** A topic's tests, then its Grand Tests, as one unit. */
function testUnit(t: Topic): CourseUnit {
  const step = (part: Part, grand: boolean): Step => ({
    kind: "test",
    id: `test/${t.id}/${part.id}`,
    href: testHref(t.id, part.id),
    // "Part 3" was the Quiz page's name for a topic's third test.
    label: part.title.replace(/\bPart (\d+)$/, "Test $1"),
    topic: t,
    part,
    grand,
  });
  return {
    id: `test/${t.id}`,
    deva: t.deva,
    title: `${t.title} · tests`,
    steps: [...t.parts.map((p) => step(p, false)), ...grandsOf(t).map((g) => step(g, true))],
  };
}

// The tests that follow each vocabulary tab's lessons. Greetings and Good Manners share one word test,
// which sits after the second of them.
const TAB_TESTS: Record<string, string[]> = {
  greetings: ["greeting-sentences"],
  manners: ["greetings-manners"],
  numbers: ["numbers"],
  family: ["family"],
  nature: ["nature"],
  animals: ["animals"],
  body: ["body"],
};

const testSection = (id: string, title: string, deva: string, icon: string, topicIds: string[], study: Section["study"]): Section => ({
  id,
  title,
  deva,
  icon,
  units: topicIds.map((t) => testUnit(topic(t))),
  study,
});

const groupTopics = (group: string) => topics.filter((t) => t.group === group).map((t) => t.id);

// Lessons first, so a new learner starts with one; then the sections that are tests only.
export const sections: Section[] = [
  ...vocabTabs.map(
    (tab): Section => ({
      id: tab.slug,
      title: tab.title,
      deva: tab.sanskrit,
      icon: tab.icon,
      units: [
        ...tab.units.map((u) => ({
          id: u.id,
          deva: u.deva,
          title: u.title,
          steps: lessonsOf(tab.slug, u).map((l): Step => ({ kind: "lesson", id: l.key, href: lessonHref(l), label: `Lesson ${l.n}`, lesson: l })),
        })),
        ...(TAB_TESTS[tab.slug] ?? []).map((t) => testUnit(topic(t))),
      ],
      study: { href: `/vocabulary?c=${tab.slug}`, label: tab.category ? "Flashcards and word list" : "All the sentences" },
    }),
  ),
  testSection("everyday", "Everyday sentences", "दैनिकवाक्यानि", "🗣️", ["spoken"], { href: "/phrases", label: "Read the sentences" }),
  testSection("alphabet", "Alphabet", "वर्णमाला", "अ", ["alphabet"], { href: "/alphabet", label: "Letter flashcards" }),
  testSection("grammar", "Grammar", "व्याकरणम्", "📐", groupTopics("grammar"), { href: "/grammar", label: "Tables of forms" }),
  testSection("advanced", "Advanced Grammar", "उन्नतव्याकरणम्", "🎓", groupTopics("advanced"), { href: "/advanced", label: "Tables and numbers" }),
];

export const stepsOf = (s: Section) => s.units.flatMap((u) => u.steps);
export const allSteps = sections.flatMap(stepsOf);

type Done = { lessons: Record<string, number>; bestScores: Record<string, number> };

export const stepDone = (p: Done, s: Step) => (s.kind === "lesson" ? s.lesson.key in p.lessons : isDone(p.bestScores, s.topic.id, s.part.id));

/** A Grand Test opens when every test of its topic is done (one with no tests is open from the start). */
export const grandOpen = (scores: Record<string, number>, t: Topic) => t.parts.every((p) => isDone(scores, t.id, p.id));

/** Lessons open one after another within a unit; tests are open; a Grand Test waits for its topic's tests. */
export const stepOpen = (p: Done, s: Step) => (s.kind === "lesson" ? isUnlocked(p.lessons, s.lesson) : !s.grand || grandOpen(p.bestScores, s.topic));

/** What a locked step is waiting for. */
export const lockReason = (s: Step) =>
  s.kind === "lesson"
    ? `Finish lesson ${s.lesson.n - 1} first`
    : `Finish ${s.topic.parts.length === 1 ? "the test" : `all ${s.topic.parts.length} tests`} first`;

/** Where to go on: the first step, in course order, that is open and not done. */
export const nextStep = (p: Done) => allSteps.find((s) => !stepDone(p, s) && stepOpen(p, s));

export const sectionOfStep = (step: Step) => sections.find((s) => stepsOf(s).includes(step))!;
export const sectionOfTopic = (topicId: string) =>
  sections.find((s) => stepsOf(s).some((st) => st.kind === "test" && st.topic.id === topicId))?.id ?? sections[0].id;

/** The test after this one in its unit, if any (the next part, then the Grand Tests). */
export function nextTest(topicId: string, partId: string) {
  const steps = allSteps.filter((s): s is TestStep => s.kind === "test" && s.topic.id === topicId);
  const i = steps.findIndex((s) => s.part.id === partId);
  return i >= 0 ? (steps[i + 1] as TestStep | undefined) : undefined;
}
