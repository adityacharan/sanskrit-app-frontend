"use client";

// Pieces shared by the Grammar and Advanced Grammar pages.

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Chevron, Dropdown, SpeakButton, spring } from "@/components/ui";
import { Deck, deckSize, PreviewList, useDeck } from "@/components/deck";
import { capFirst, lakaras, persons, verbExamples, verbs, type LakaraId } from "@/lib/data";
import { toIAST } from "@/lib/iast";

export const numberLabels = ["Singular · एकवचनम्", "Dual · द्विवचनम्", "Plural · बहुवचनम्"];

/** Practice mode: forms are hidden until tapped. */
export function usePractice() {
  const [on, setOn] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  return {
    on,
    set: (v: boolean) => {
      setOn(v);
      setRevealed(new Set());
    },
    reset: () => setRevealed(new Set()),
    hidden: (id: string) => on && !revealed.has(id),
    reveal: (id: string) => setRevealed((r) => new Set(r).add(id)),
  };
}
export type Practice = ReturnType<typeof usePractice>;

export function FormCell({ text, hidden, onReveal }: { text: string; hidden: boolean; onReveal: () => void }) {
  // "—" marks a number the word isn't used in; there's nothing to practise.
  const blank = text === "—";
  return (
    <td className="border-t border-line p-0">
      <button
        type="button"
        disabled={!hidden || blank}
        onClick={onReveal}
        className={`deva w-full px-3 py-2.5 text-left text-lg ${hidden && !blank ? "cursor-pointer" : "cursor-default"} ${blank ? "text-muted" : ""}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {hidden && !blank ? (
            <motion.span key="hidden" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.12 }} className="inline-block">
              <span className="inline-block min-w-16 rounded-md bg-surface-2 px-2 text-center text-sm text-muted hover:bg-accent-soft hover:text-accent">
                ?
              </span>
              {/* Holds the romanization line's height, so the row doesn't grow when revealed. */}
              <span className="block font-sans text-xs" aria-hidden>
                &nbsp;
              </span>
            </motion.span>
          ) : (
            <motion.span
              key="shown"
              initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={spring}
              className="inline-block"
            >
              {text}
              {!blank && <span className="block font-sans text-xs italic text-muted">{toIAST(text)}</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </td>
  );
}

/** A cases × numbers table (nouns and pronouns). */
export function FormsTable({
  id,
  rows,
  forms,
  practice,
}: {
  id: string;
  rows: { name: string; sanskrit: string; use: string }[];
  forms: [string, string, string][];
  practice: Practice;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-surface-2 text-left">
          <tr>
            <th className="px-3 py-2.5 font-medium">Case</th>
            {numberLabels.map((n) => (
              <th key={n} className="px-3 py-2.5 font-medium">
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {forms.map((row, i) => (
            <tr key={rows[i].name}>
              <td className="border-t border-line px-3 py-2.5">
                <span className="font-medium">{rows[i].name}</span> <span className="deva text-muted">{rows[i].sanskrit}</span>
                <span className="block text-xs text-muted">{rows[i].use}</span>
              </td>
              {row.map((f, j) => (
                <FormCell key={j} text={f} hidden={practice.hidden(`${id}-${i}-${j}`)} onReveal={() => practice.reveal(`${id}-${i}-${j}`)} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The verbs: a flashcard per verb, the verb list, then the chosen lakara's forms person by person. */
export function VerbsSection({ lakaraIds, practice }: { lakaraIds: LakaraId[]; practice: Practice }) {
  const deck = useDeck(verbs.length);
  const [lakaraId, setLakaraId] = useState<LakaraId>(lakaraIds[0]);
  const verb = verbs[deck.index];
  const lakara = lakaras.find((l) => l.id === lakaraId)!;
  // अस् has no forms outside the present system; भू stands in for it.
  const shown = verb.forms[lakaraId] ? verb : verbs.find((v) => v.id === "bhu")!;
  const forms = shown.forms[lakaraId]!;
  const examples = verbExamples(shown, lakaraId);
  const size = deckSize(verbs.map((v) => v.root));
  const options = lakaras.filter((l) => lakaraIds.includes(l.id));

  return (
    <section className="mt-6">
      <Deck
        deck={deck}
        count={verbs.length}
        cardKey={verb.id}
        speakText={(flipped) => (flipped ? verb.forms.lat![0][0] : verb.root)}
        front={
          <>
            <p className={`deva ${size}`}>{verb.root}</p>
            <p className="mt-3 text-lg italic text-muted">{verb.translit}</p>
          </>
        }
        back={
          <>
            <p className="text-3xl font-semibold">{capFirst(verb.meaning)}</p>
            <p className="deva mt-3 text-2xl text-accent">{verb.forms.lat![0][0]}</p>
            <p className="italic text-muted">{toIAST(verb.forms.lat![0][0])}</p>
            <p className="text-sm text-muted">He / she / it {verb.english[2]}</p>
          </>
        }
      />

      <PreviewList
        title={
          <>
            All verbs · <span className="deva text-accent">धातवः</span>
          </>
        }
        items={verbs}
        active={deck.index}
        onPick={(i) => {
          deck.goTo(i);
          practice.reset();
        }}
        getKey={(v) => v.id}
        chip={(v) => (
          <>
            <span className="deva text-lg">{v.root}</span> <span className="text-sm italic text-muted">{v.meaning}</span>
          </>
        )}
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Dropdown
          label="Choose a lakara"
          triggerClassName="flex min-w-64 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 text-left hover:border-accent aria-expanded:border-accent"
          trigger={(open) => (
            <>
              <span>
                <span className="deva">{lakara.deva}</span> ({lakara.translit}) · {lakara.name}
              </span>
              <Chevron open={open} />
            </>
          )}
          items={options.map((l) => ({
            key: l.id,
            label: (
              <>
                <span className="deva">{l.deva}</span> ({l.translit}) · {l.name}
              </>
            ),
            selected: l.id === lakaraId,
          }))}
          onSelect={(k) => {
            setLakaraId(k as LakaraId);
            practice.reset();
          }}
        />
        <p className="text-sm text-muted">
          <span className="deva text-ink">{verb.root}</span> <em>{verb.translit}</em> · {verb.meaning}
        </p>
      </div>

      {verb.note && !verb.forms[lakaraId] && (
        <p className="mt-3 rounded-2xl bg-surface-2 p-3 text-sm text-muted">
          {verb.note} The forms below are of <span className="deva text-ink">{shown.root}</span>.
        </p>
      )}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        {[2, 1, 0].map((i) => {
          const p = persons[i];
          const personExamples = examples.filter((e) => e.person === i);
          return (
            <div key={p.name} className="rounded-2xl border border-line bg-surface">
              <div className="rounded-t-2xl bg-surface-2 px-4 py-2.5">
                <p className="font-medium">
                  {p.name} <span className="deva font-normal text-muted">{p.sanskrit}</span>
                </p>
                <p className="text-xs text-muted">{p.hint}</p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {numberLabels.map((n, j) => {
                    const id = `${shown.id}-${lakaraId}-${i}-${j}`;
                    return (
                      <tr key={n}>
                        <td className="w-1/2 border-t border-line px-4 py-2.5 text-muted">{n}</td>
                        <FormCell text={forms[i][j]} hidden={practice.hidden(id)} onReveal={() => practice.reveal(id)} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {personExamples.length > 0 && (
                <ul className="space-y-3 rounded-b-2xl border-t border-line bg-accent-soft/60 p-4">
                  {personExamples.map((e) => (
                    <li key={`${e.deva}-${e.note ?? ""}`} className="flex items-start gap-3">
                      <SpeakButton text={e.deva} />
                      <div className="min-w-0">
                        <p className="deva text-xl">{e.deva}</p>
                        <p className="text-sm italic text-muted">{e.translit}</p>
                        <p className="text-sm">
                          {e.meaning}
                          {e.note && <span className="deva text-muted"> ({e.note})</span>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted">
        Note: Sanskrit has three persons (<span className="deva">पुरुषाः</span>) and three numbers (
        <span className="deva">वचनानि</span>). <span className="deva">प्रथमपुरुषः</span> means 3rd person,{" "}
        <span className="deva">मध्यमपुरुषः</span> 2nd person and <span className="deva">उत्तमपुरुषः</span> 1st person.
        Each verb has nine forms in every lakara: three persons × three numbers.
      </p>
    </section>
  );
}
