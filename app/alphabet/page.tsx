"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader, SpeakButton, spring, Tabs } from "@/components/ui";
import { conjuncts, consonants, vowels, type Letter, type LetterGroup } from "@/lib/data";
import { speak } from "@/lib/speak";

type Tab = "vowels" | "consonants" | "conjuncts";
const groups: Record<Tab, LetterGroup[]> = { vowels, consonants, conjuncts };

export default function AlphabetPage() {
  const [tab, setTab] = useState<Tab>("vowels");
  const [selected, setSelected] = useState<Letter>(vowels[0].letters[0]);

  return (
    <div>
      <PageHeader
        deva="वर्णमाला"
        title="The Devanagari Alphabet"
        subtitle="Sanskrit is written in Devanagari. Letters are arranged by where in the mouth they're pronounced — tap any letter to hear it and see an example."
      />

      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          setSelected(groups[t][0].letters[0]);
        }}
        options={[
          { value: "vowels", label: "Vowels · स्वराः" },
          { value: "consonants", label: "Consonants · व्यञ्जनानि" },
          { value: "conjuncts", label: "Conjuncts" },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {groups[tab].map((g) => (
            <div key={g.name}>
              {groups[tab].length > 1 && (
                <p className="mb-2 text-sm font-medium text-muted">
                  {g.name} <span className="deva">· {g.sanskrit}</span>
                </p>
              )}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {g.letters.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelected(l);
                      speak(l.deva);
                    }}
                    data-spotlight
                    className="relative isolate flex aspect-square flex-col items-center justify-center rounded-2xl border border-line bg-surface"
                  >
                    {selected.id === l.id && (
                      <motion.span
                        layoutId="letter-selected"
                        className="absolute inset-0 -z-10 rounded-2xl border-2 border-accent bg-accent-soft"
                        transition={spring}
                      />
                    )}
                    <span className="deva text-3xl sm:text-4xl">{l.deva}</span>
                    <span className="text-xs text-muted">{l.translit}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit overflow-hidden rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-20">
          <div className="flex items-start justify-between">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={selected.id}
                initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(6px)" }}
                transition={spring}
                style={{ transformOrigin: "left center" }}
                className="deva text-8xl leading-none text-accent"
              >
                {selected.deva}
              </motion.p>
            </AnimatePresence>
            <SpeakButton text={selected.deva} />
          </div>
          <motion.div key={selected.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <p className="mt-4 text-2xl font-semibold italic">{selected.translit}</p>
          <p className="text-muted">Sounds like: {selected.sound}</p>
          {selected.example ? (
            <div className="mt-6 rounded-2xl bg-surface-2 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Example</p>
              <div className="mt-1 flex items-center gap-3">
                <p className="deva text-3xl">{selected.example.deva}</p>
                <SpeakButton text={selected.example.deva} />
              </div>
              <p className="italic text-accent">{selected.example.translit}</p>
              <p className="text-sm text-muted">{selected.example.meaning}</p>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
              This letter rarely begins a word, but appears inside many words.
            </p>
          )}
          </motion.div>
        </aside>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
        <p className="font-medium text-ink">Tip: the inherent “a”</p>
        <p className="mt-1">
          Every consonant carries a built-in “a” sound — <span className="deva text-ink">क</span> is “ka”, not just
          “k”. A small slash called a <em>virāma</em> removes it: <span className="deva text-ink">क्</span> = “k”.
        </p>
      </div>
    </div>
  );
}
