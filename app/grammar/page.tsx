"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Chevron, Dropdown, PageHeader, SpeakButton, spring, Switch, Tabs } from "@/components/ui";
import { cases, declensions, lakaras, persons, pronouns, verbExamples, verbs, type LakaraId } from "@/lib/data";

type Tab = "nouns" | "verbs" | "pronouns";
const numbers = ["Singular · एकवचनम्", "Dual · द्विवचनम्", "Plural · बहुवचनम्"];

export default function GrammarPage() {
  const [tab, setTab] = useState<Tab>("nouns");
  const [nounId, setNounId] = useState(declensions[0].id);
  const [verbId, setVerbId] = useState(verbs[0].id);
  const [lakaraId, setLakaraId] = useState<LakaraId>("lat");
  const [practice, setPractice] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const noun = declensions.find((d) => d.id === nounId)!;
  const verb = verbs.find((c) => c.id === verbId)!;
  const lakara = lakaras.find((l) => l.id === lakaraId)!;
  // अस् has no forms outside the present system; भू stands in for it.
  const shown = verb.forms[lakaraId] ? verb : verbs.find((v) => v.id === "bhu")!;
  const forms = shown.forms[lakaraId]!;
  const examples = verbExamples(shown, lakaraId);

  const resetReveal = () => setRevealed(new Set());
  const reveal = (id: string) => setRevealed((r) => new Set(r).add(id));

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
            resetReveal();
          }}
          options={[
            { value: "nouns", label: "Nouns · शब्दरूपाणि" },
            { value: "verbs", label: "Verbs · धातुरूपाणि" },
            { value: "pronouns", label: "Pronouns" },
          ]}
        />
        {tab !== "pronouns" && (
          <Switch
            checked={practice}
            onChange={(v) => {
              setPractice(v);
              resetReveal();
            }}
            label="Practice mode — hide forms, tap to reveal"
          />
        )}
      </div>

      {tab === "nouns" && (
        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            {declensions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setNounId(d.id);
                  resetReveal();
                }}
                data-spotlight
                className={`rounded-2xl border px-4 py-2 text-left ${
                  d.id === nounId ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent"
                }`}
              >
                <span className="deva text-xl">{d.stem}</span>{" "}
                <span className="text-sm italic text-muted">{d.translit}</span>
                <span className="block text-xs text-muted">{d.kind}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            <span className="deva text-ink">{noun.stem}</span> means “{noun.meaning}”. Eight cases × three numbers =
            24 forms.
          </p>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Case</th>
                  {numbers.map((n) => (
                    <th key={n} className="px-3 py-2.5 font-medium">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <tr key={c.name}>
                    <td className="border-t border-line px-3 py-2.5">
                      <span className="font-medium">{c.name}</span> <span className="deva text-muted">{c.sanskrit}</span>
                      <span className="block text-xs text-muted">{c.use}</span>
                    </td>
                    {noun.forms[i].map((f, j) => (
                      <FormCell key={j} text={f} hidden={practice && !revealed.has(`${noun.id}-${i}-${j}`)} onReveal={() => reveal(`${noun.id}-${i}-${j}`)} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Example deva="रामः वनं गच्छति।" translit="rāmaḥ vanaṃ gacchati." meaning="Rama goes to the forest. (रामः = nominative, the subject)" />
        </section>
      )}

      {tab === "verbs" && (
        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            {verbs.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setVerbId(c.id);
                  resetReveal();
                }}
                data-spotlight
                className={`rounded-2xl border px-4 py-2 text-left ${
                  c.id === verbId ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent"
                }`}
              >
                <span className="deva text-xl">{c.root}</span>{" "}
                <span className="text-sm italic text-muted">{c.translit}</span>
                <span className="block text-xs text-muted">{c.meaning}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
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
              items={lakaras.map((l) => ({
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
                resetReveal();
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
                      {numbers.map((n, j) => (
                        <tr key={n}>
                          <td className="w-1/2 border-t border-line px-4 py-2.5 text-muted">{n}</td>
                          <FormCell text={forms[i][j]} hidden={practice && !revealed.has(`${shown.id}-${lakaraId}-${i}-${j}`)} onReveal={() => reveal(`${shown.id}-${lakaraId}-${i}-${j}`)} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {personExamples.length > 0 && (
                    <ul className="space-y-3 border-t border-line bg-accent-soft/60 p-4 rounded-b-2xl">
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
      )}

      {tab === "pronouns" && (
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pronouns.map((p) => (
            <div key={p.translit} data-spotlight className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <SpeakButton text={p.deva} />
              <div>
                <p className="deva text-2xl">{p.deva}</p>
                <p className="text-sm text-muted">
                  <em>{p.translit}</em> · {p.meaning}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function FormCell({ text, hidden, onReveal }: { text: string; hidden: boolean; onReveal: () => void }) {
  return (
    <td className="border-t border-line p-0">
      <button
        type="button"
        disabled={!hidden}
        onClick={onReveal}
        className={`deva w-full px-3 py-2.5 text-left text-lg ${hidden ? "cursor-pointer" : "cursor-default"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {hidden ? (
            <motion.span
              key="hidden"
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className="inline-block min-w-16 rounded-md bg-surface-2 px-2 text-center text-sm text-muted hover:bg-accent-soft hover:text-accent"
            >
              ?
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
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </td>
  );
}

function Example({ deva, translit, meaning }: { deva: string; translit: string; meaning: string }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl bg-accent-soft p-4">
      <SpeakButton text={deva} />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Example</p>
        <p className="deva text-2xl">{deva}</p>
        <p className="italic text-muted">{translit}</p>
        <p className="text-sm">{meaning}</p>
      </div>
    </div>
  );
}
