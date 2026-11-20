"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chevron, Dropdown, PageHeader, ProgressBar, SpeakButton, Tabs } from "@/components/ui";
import { Deck, deckSize, PreviewList, useDeck } from "@/components/deck";
import { BookList, LessonPath } from "@/components/lessons";
import { numberGenderNote, type Category } from "@/lib/data";
import { vocabTabs } from "@/lib/lessons";
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
  const slug = params.get("c") ?? vocabTabs[0].slug;
  const tab = vocabTabs.find((t) => t.slug === slug) ?? vocabTabs[0];
  const pick = (s: string) => router.replace(`/vocabulary?c=${s}`, { scroll: false });

  return (
    <div>
      <PageHeader
        deva="शब्दाः"
        title="Vocabulary"
        subtitle="Flip the cards to learn the words, then work through each tab's lessons, Duolingo-style, to practise every word and sentence."
      />

      {/* Ten tabs wrap into five rows on a phone, so phones get a menu instead. */}
      <div className="sm:hidden">
        <Dropdown
          label="Choose a topic"
          rootClassName="block"
          triggerClassName="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left hover:border-accent aria-expanded:border-accent"
          trigger={(open) => (
            <>
              <span>
                {tab.icon} {tab.title} <span className="deva text-muted">{tab.sanskrit}</span>
              </span>
              <Chevron open={open} />
            </>
          )}
          items={vocabTabs.map((t) => ({
            key: t.slug,
            label: (
              <>
                {t.icon} {t.title} <span className="deva text-muted">{t.sanskrit}</span>
              </>
            ),
            selected: t.slug === tab.slug,
          }))}
          onSelect={pick}
        />
      </div>
      <div className="hidden sm:block">
        <Tabs value={tab.slug} onChange={pick} options={vocabTabs.map((t) => ({ value: t.slug, label: `${t.icon} ${t.title}` }))} />
      </div>

      {tab.category && <WordDeck key={tab.slug} category={tab.category} />}
      <LessonPath tab={tab} />
      <BookList key={tab.slug} units={tab.units.filter((u) => u.id !== "words")} />
    </div>
  );
}

// The tab's word cards: a flashcard deck and the list of all its words. Keyed by tab, so it starts at the first card.
function WordDeck({ category }: { category: Category }) {
  const deck = useDeck(category.words.length);
  const progress = useProgress();
  const learned = new Set(progress.learned);

  const word = category.words[deck.index];
  const size = deckSize(category.words.map((w) => w.deva));
  const done = category.words.filter((w) => learned.has(w.id)).length;

  return (
    <>
      <div className="mt-6 flex items-center gap-3 text-sm text-muted">
        <span>
          {done} of {category.words.length} learned
        </span>
        <ProgressBar value={(done / category.words.length) * 100} className="flex-1" />
      </div>

      <div className="mt-6">
        <Deck
          deck={deck}
          count={category.words.length}
          cardKey={word.id}
          speakText={() => word.deva}
          frontCorner={
            learned.has(word.id) && (
              <span className="absolute right-4 top-4 rounded-full bg-good-soft px-2.5 py-0.5 text-xs font-medium text-good">
                ✓ Learned
              </span>
            )
          }
          front={
            <>
              {word.numeral && (
                <p className="mb-2 text-2xl text-muted">
                  <Numeral value={word.numeral} />
                </p>
              )}
              <p className={`deva ${size}`}>{word.deva}</p>
              <p className="mt-3 text-lg italic text-muted">{word.translit}</p>
            </>
          }
          back={
            <>
              <p className="text-3xl font-semibold">{word.meaning}</p>
              <p className="deva mt-3 text-2xl text-accent">{word.deva}</p>
              <p className="italic text-muted">{word.translit}</p>
              {word.example && <p className="deva mt-3 text-lg">{word.example}</p>}
            </>
          }
        >
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                actions.setLearned(word.id, false);
                deck.go(1);
              }}
              className="rounded-2xl border border-line bg-surface py-3 font-medium hover:border-accent hover:bg-surface-2"
            >
              Still learning
            </button>
            <button
              type="button"
              onClick={() => {
                actions.setLearned(word.id, true);
                deck.go(1);
              }}
              data-spotlight="light"
              className="rounded-2xl bg-good py-3 font-medium text-good-ink hover:brightness-105"
            >
              I know this ✓
            </button>
          </div>
          {word.id === "numbers:1" && (
            <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
              <p className="font-medium text-ink">Note</p>
              <p className="mt-1">{numberGenderNote}</p>
            </div>
          )}
        </Deck>
      </div>

      <PreviewList
        title={
          <>
            All words · <span className="deva text-accent">{category.sanskrit}</span>
          </>
        }
        items={category.words}
        active={deck.index}
        onPick={deck.goTo}
        getKey={(w) => w.id}
        chip={(w) => <span className="deva text-lg">{w.deva}</span>}
        row={(w, i, active) => (
          <div
            data-spotlight
            className={`flex h-full items-center gap-3 rounded-2xl border bg-surface p-3 ${active ? "border-accent" : "border-line"}`}
          >
            <SpeakButton text={w.deva} />
            <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => deck.goTo(i)}>
              {w.numeral && (
                <span className="w-16 shrink-0 rounded-lg bg-surface-2 py-1 text-center text-sm text-muted">
                  <Numeral value={w.numeral} />
                </span>
              )}
              <span className="min-w-0">
                <span className="deva text-xl">{w.deva}</span>{" "}
                <span className="text-sm italic text-muted">{w.translit}</span>
                <span className="block text-sm">{w.meaning}</span>
              </span>
            </button>
            <input
              type="checkbox"
              checked={learned.has(w.id)}
              onChange={(e) => actions.setLearned(w.id, e.target.checked)}
              className="h-5 w-5 accent-[var(--good)]"
              aria-label={`Mark ${w.translit} as learned`}
            />
          </div>
        )}
      />
    </>
  );
}

// "१ (1)": the Devanagari digits in the Sanskrit font, the Western digits in the UI font.
function Numeral({ value }: { value: string }) {
  const [deva, latin] = value.split(" ");
  return (
    <>
      <span className="deva">{deva}</span> <span className="tabular-nums">{latin}</span>
    </>
  );
}
