"use client";

import { useState } from "react";
import { PageHeader, SpeakButton, Switch, Tabs } from "@/components/ui";
import { Deck, deckSize, PreviewList, useDeck } from "@/components/deck";
import { usePractice, VerbsSection } from "@/components/grammar";
import { advancedLakaras, largeNumbers, ordinals } from "@/lib/data";

type Tab = "verbs" | "numbers";
type NumbersTab = "large" | "ordinal";

export default function AdvancedGrammarPage() {
  const [tab, setTab] = useState<Tab>("verbs");
  const [numbersTab, setNumbersTab] = useState<NumbersTab>("large");
  const practice = usePractice();

  return (
    <div>
      <PageHeader
        deva="उन्नतव्याकरणम्"
        title="Advanced Grammar"
        subtitle="The less common lakaras, the names of large numbers, and ordinal numbers."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          value={tab}
          onChange={(t) => {
            setTab(t);
            practice.reset();
          }}
          options={[
            { value: "verbs", label: "Verbs · धातुरूपाणि" },
            { value: "numbers", label: "Numbers · सङ्ख्याः" },
          ]}
        />
        {tab === "verbs" && <Switch checked={practice.on} onChange={practice.set} label="Practice mode — hide forms, tap to reveal" />}
      </div>

      {tab === "verbs" && <VerbsSection lakaraIds={advancedLakaras} practice={practice} />}

      {tab === "numbers" && (
        <>
          <div className="mt-6">
            <Tabs
              value={numbersTab}
              onChange={setNumbersTab}
              options={[
                { value: "large", label: "Large numbers · महासङ्ख्याः" },
                { value: "ordinal", label: "Ordinal numbers · पूरणसङ्ख्याः" },
              ]}
            />
          </div>
          {numbersTab === "large" ? <LargeNumbers /> : <OrdinalNumbers />}
        </>
      )}
    </div>
  );
}

function LargeNumbers() {
  const rows = largeNumbers.rows;
  const deck = useDeck(rows.length);
  const r = rows[deck.index];
  const size = deckSize(rows.map((x) => x.deva));

  return (
    <section className="mt-6">
      <Deck
        deck={deck}
        count={rows.length}
        cardKey={String(r.power)}
        speakText={() => r.deva}
        front={
          <>
            <p className="mb-2 text-2xl tabular-nums text-muted">
              10<sup>{r.power}</sup>
            </p>
            <p className={`deva ${size}`}>{r.deva}</p>
            <p className="mt-3 text-lg italic text-muted">{r.translit}</p>
          </>
        }
        back={
          <>
            <p className="text-3xl font-semibold">{r.meaning}</p>
            <p className="mt-3 text-xl tabular-nums text-accent">{r.value}</p>
            <p className="deva mt-2 text-2xl">{r.deva}</p>
          </>
        }
      />

      <PreviewList
        title={
          <>
            All large numbers · <span className="deva text-accent">महासङ्ख्याः</span>
          </>
        }
        items={rows}
        active={deck.index}
        onPick={deck.goTo}
        getKey={(x) => String(x.power)}
        chip={(x) => <span className="deva text-lg">{x.deva}</span>}
        row={(x, i, active) => (
          <div className={`flex h-full items-center gap-3 rounded-2xl border bg-surface p-3 ${active ? "border-accent" : "border-line"}`}>
            <SpeakButton text={x.deva} />
            <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => deck.goTo(i)}>
              <span className="w-16 shrink-0 rounded-lg bg-surface-2 py-1 text-center text-sm tabular-nums text-muted">
                10<sup>{x.power}</sup>
              </span>
              <span className="min-w-0">
                <span className="deva text-xl">{x.deva}</span> <span className="text-sm italic text-muted">{x.translit}</span>
                <span className="block text-sm">{x.meaning}</span>
              </span>
            </button>
          </div>
        )}
      />

      <div className="mt-10 rounded-2xl bg-accent-soft p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Note</p>
        <div className="mt-2 flex items-start gap-3">
          <SpeakButton text={largeNumbers.shloka.deva.join(" ")} />
          <div className="min-w-0">
            {largeNumbers.shloka.deva.map((line) => (
              <p key={line} className="deva text-xl">
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
    </section>
  );
}

function OrdinalNumbers() {
  const deck = useDeck(ordinals.length);
  const o = ordinals[deck.index];
  const size = deckSize(ordinals.map((x) => x.masculine));

  return (
    <section className="mt-6">
      <Deck
        deck={deck}
        count={ordinals.length}
        cardKey={o.label}
        speakText={() => o.masculine}
        front={
          <>
            <p className="mb-2 text-2xl tabular-nums text-muted">{o.label}</p>
            <p className={`deva ${size}`}>{o.masculine}</p>
            <p className="mt-3 text-lg italic text-muted">{o.translit}</p>
          </>
        }
        back={
          <>
            <p className="text-3xl font-semibold">{o.english}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left">
              <dt className="text-sm text-muted">Masculine</dt>
              <dd className="deva text-lg">{o.masculine}</dd>
              <dt className="text-sm text-muted">Feminine</dt>
              <dd className="deva text-lg">{o.feminine}</dd>
              <dt className="text-sm text-muted">Neuter</dt>
              <dd className="deva text-lg">{o.neuter}</dd>
            </dl>
          </>
        }
      />

      <PreviewList
        title={
          <>
            All ordinal numbers · <span className="deva text-accent">पूरणसङ्ख्याः</span>
          </>
        }
        items={ordinals}
        active={deck.index}
        onPick={deck.goTo}
        getKey={(x) => x.label}
        chip={(x) => (
          <>
            <span className="text-sm tabular-nums text-muted">{x.label}</span> <span className="deva text-lg">{x.stems[0]}</span>
          </>
        )}
        row={(x, i, active) => (
          <div className={`flex h-full items-center gap-3 rounded-2xl border bg-surface p-3 ${active ? "border-accent" : "border-line"}`}>
            <SpeakButton text={x.masculine} />
            <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => deck.goTo(i)}>
              <span className="w-16 shrink-0 rounded-lg bg-surface-2 py-1 text-center text-sm tabular-nums text-muted">{x.label}</span>
              <span className="min-w-0">
                <span className="deva text-xl">{x.masculine}</span> <span className="text-sm italic text-muted">{x.translit}</span>
                <span className="block text-sm">{x.english}</span>
                <span className="block text-sm text-muted">
                  f. <span className="deva">{x.feminine}</span> · n. <span className="deva">{x.neuter}</span>
                </span>
              </span>
            </button>
          </div>
        )}
      />
    </section>
  );
}
