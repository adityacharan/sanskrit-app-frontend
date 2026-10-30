"use client";

import { useState } from "react";
import { PageHeader, SpeakButton, Switch, Tabs } from "@/components/ui";
import { Deck, deckSize, PreviewList, useDeck } from "@/components/deck";
import { FormsTable, usePractice, VerbsSection, type Practice } from "@/components/grammar";
import {
  allNouns,
  basicLakaras,
  capFirst,
  cases,
  declensions,
  genderNames,
  nounClasses,
  nounGenders,
  pronounList,
  pronounSections,
  type Gender,
  type NounGender,
} from "@/lib/data";

type Tab = "nouns" | "sabda" | "verbs" | "pronouns";

export default function GrammarPage() {
  const [tab, setTab] = useState<Tab>("nouns");
  const practice = usePractice();

  return (
    <div>
      <PageHeader
        deva="व्याकरणम्"
        title="Grammar"
        subtitle="Sanskrit words change their endings to show their role in a sentence. Study the patterns below, then switch on practice mode to test your memory."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          value={tab}
          onChange={(t) => {
            setTab(t);
            practice.reset();
          }}
          options={[
            { value: "nouns", label: "Nouns · शब्दरूपाणि" },
            { value: "sabda", label: "Śabda by ending · शब्दाः" },
            { value: "verbs", label: "Verbs · धातुरूपाणि" },
            { value: "pronouns", label: "Pronouns · सर्वनामानि" },
          ]}
        />
        <Switch checked={practice.on} onChange={practice.set} label="Practice mode — hide forms, tap to reveal" />
      </div>

      {tab === "nouns" && <Nouns practice={practice} />}
      {tab === "sabda" && <SabdaSection practice={practice} />}
      {tab === "verbs" && <VerbsSection lakaraIds={basicLakaras} practice={practice} />}
      {tab === "pronouns" && <Pronouns practice={practice} />}
    </div>
  );
}

function Nouns({ practice }: { practice: Practice }) {
  const deck = useDeck(declensions.length);
  const noun = declensions[deck.index];
  const size = deckSize(declensions.map((d) => d.stem));

  return (
    <section className="mt-6">
      <Deck
        deck={deck}
        count={declensions.length}
        cardKey={noun.id}
        speakText={() => noun.stem}
        front={
          <>
            <p className={`deva ${size}`}>{noun.stem}</p>
            <p className="mt-3 text-lg italic text-muted">{noun.translit}</p>
          </>
        }
        back={
          <>
            <p className="text-3xl font-semibold">{capFirst(noun.meaning)}</p>
            <p className="deva mt-3 text-2xl text-accent">{noun.forms[0][0]}</p>
            <p className="text-sm text-muted">{noun.kind}</p>
          </>
        }
      />

      <PreviewList
        title={
          <>
            All nouns · <span className="deva text-accent">शब्दाः</span>
          </>
        }
        items={declensions}
        active={deck.index}
        onPick={(i) => {
          deck.goTo(i);
          practice.reset();
        }}
        getKey={(d) => d.id}
        chip={(d) => (
          <>
            <span className="deva text-lg">{d.stem}</span> <span className="text-sm italic text-muted">{d.kind}</span>
          </>
        )}
      />

      <p className="mt-8 text-sm text-muted">
        <span className="deva text-ink">{noun.stem}</span> means “{noun.meaning}”. Eight cases × three numbers = 24 forms.
      </p>
      <div className="mt-3">
        <FormsTable id={noun.id} rows={cases} forms={noun.forms} practice={practice} />
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-accent-soft p-4">
        <SpeakButton text="रामः वनं गच्छति।" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Example</p>
          <p className="deva text-2xl">रामः वनं गच्छति।</p>
          <p className="italic text-muted">rāmaḥ vanaṃ gacchati.</p>
          <p className="text-sm">Rama goes to the forest. (रामः = nominative, the subject)</p>
        </div>
      </div>
    </section>
  );
}

// One card size across the whole section, so it doesn't change between the sub-sections.
const sabdaSize = deckSize(allNouns.map((w) => w.deva));

function SabdaSection({ practice }: { practice: Practice }) {
  const [gender, setGender] = useState<NounGender>("m");
  const inGender = nounClasses.filter((c) => c.gender === gender);
  const [classId, setClassId] = useState(inGender[0].id);
  const nounClass = inGender.find((c) => c.id === classId) ?? inGender[0];
  const words = nounClass.words;
  const deck = useDeck(words.length);
  const word = words[deck.index];

  const pickClass = (id: string) => {
    setClassId(id);
    deck.reset();
    practice.reset();
  };

  return (
    <section className="mt-6">
      <Tabs
        value={gender}
        onChange={(g) => {
          setGender(g);
          pickClass(nounClasses.find((c) => c.gender === g)!.id);
        }}
        options={nounGenders.map((g) => ({ value: g.id, label: `${g.title} · ${g.deva}` }))}
      />
      <div className="mt-3">
        <Tabs value={nounClass.id} onChange={pickClass} options={inGender.map((c) => ({ value: c.id, label: `${c.short} · ${c.deva}` }))} />
      </div>

      <h2 className="mb-4 mt-6 text-xl font-semibold">
        {nounClass.title} · <span className="deva text-accent">{nounClass.deva}</span>
      </h2>
      <Deck
        deck={deck}
        count={words.length}
        cardKey={word.id}
        speakText={() => word.deva}
        front={
          <>
            <p className={`deva ${sabdaSize}`}>{word.deva}</p>
            <p className="mt-3 text-lg italic text-muted">{word.translit}</p>
          </>
        }
        back={
          <>
            <p className="text-3xl font-semibold">{word.meaning}</p>
            <p className="deva mt-3 text-2xl text-accent">{word.deva}</p>
            <p className="italic text-muted">{word.translit}</p>
            {word.note && <p className="mt-3 text-sm text-muted">{word.note}</p>}
          </>
        }
      />

      <PreviewList
        title={
          <>
            All words · <span className="deva text-accent">{nounClass.deva}</span>
          </>
        }
        items={words}
        active={deck.index}
        onPick={(i) => {
          deck.goTo(i);
          practice.reset();
        }}
        getKey={(w) => w.id}
        chip={(w) => (
          <>
            <span className="deva text-lg">{w.deva}</span> <span className="text-sm italic text-muted">{w.meaning}</span>
          </>
        )}
      />

      <p className="mt-8 text-sm text-muted">
        <span className="deva text-ink">{word.deva}</span> means “{word.meaning}”. Eight cases × three numbers. Where a case has two forms, both are shown.
      </p>
      <div className="mt-3">
        <FormsTable id={word.id} rows={cases} forms={word.forms} practice={practice} />
      </div>
    </section>
  );
}

function Pronouns({ practice }: { practice: Practice }) {
  const deck = useDeck(pronounList.length);
  const pronoun = pronounList[deck.index];
  const [gender, setGender] = useState<Gender>("m");
  const section = pronounSections.find((s) => s.id === pronoun.section)!;
  const table = pronoun.tables.find((t) => t.gender === gender) ?? pronoun.tables[0];
  const size = deckSize(pronounList.map((p) => p.stem));

  // The full list is grouped by the document's five sections.
  let from = 0;
  const groups = pronounSections.map((s) => {
    const count = pronounList.filter((p) => p.section === s.id).length;
    const g = { label: <>{s.title} <span className="deva">· {s.sanskrit}</span></>, from, to: from + count };
    from += count;
    return g;
  });

  return (
    <section className="mt-6">
      <Deck
        deck={deck}
        count={pronounList.length}
        cardKey={pronoun.id}
        speakText={() => pronoun.stem}
        front={
          <>
            <p className={`deva ${size}`}>{pronoun.stem}</p>
            <p className="mt-3 text-lg italic text-muted">{pronoun.translit}</p>
          </>
        }
        back={
          <>
            <p className="text-3xl font-semibold">{pronoun.meaning}</p>
            <p className="deva mt-3 text-2xl text-accent">{pronoun.tables[0].forms[0][0]}</p>
            <p className="text-sm text-muted">{section.title}</p>
          </>
        }
      />

      <PreviewList
        title={
          <>
            All pronouns · <span className="deva text-accent">सर्वनामानि</span>
          </>
        }
        items={pronounList}
        active={deck.index}
        onPick={(i) => {
          deck.goTo(i);
          practice.reset();
        }}
        getKey={(p) => p.id}
        chip={(p) => (
          <>
            <span className="deva text-lg">{p.stem}</span> <span className="text-sm italic text-muted">{p.translit}</span>
          </>
        )}
        groups={groups}
      />

      <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">{section.title}</p>
        <p className="mt-1 text-lg">
          <span className="deva">{pronoun.stem}</span> <em className="text-muted">{pronoun.translit}</em> · {pronoun.meaning}
        </p>
        {(section.note || pronoun.note) && (
          <p className="mt-2 text-sm text-muted">Note: {[section.note, pronoun.note].filter(Boolean).join(" ")}</p>
        )}
      </div>

      {pronoun.tables.length > 1 && (
        <div className="mt-4">
          <Tabs
            value={gender}
            onChange={(g) => {
              setGender(g);
              practice.reset();
            }}
            options={(["m", "f", "n"] as Gender[]).map((g) => ({ value: g, label: genderNames[g] }))}
          />
        </div>
      )}
      <div className="mt-4">
        <FormsTable id={`${pronoun.id}-${table.gender ?? "x"}`} rows={cases.slice(0, 7)} forms={table.forms} practice={practice} />
      </div>
    </section>
  );
}
