"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader, SpeakButton, spring, Switch, Tabs } from "@/components/ui";
import { phrases, shlokas, spokenGroups, type Phrase } from "@/lib/data";

export default function PhrasesPage() {
  const [tab, setTab] = useState<"phrases" | "shlokas">("phrases");
  const [showTranslit, setShowTranslit] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);

  return (
    <div>
      <PageHeader
        deva="वाक्यानि श्लोकाः च"
        title="Phrases & Shlokas"
        subtitle="Everyday sentences to start speaking, and well-known verses to read and recite."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "phrases", label: "💬 Everyday phrases" },
            { value: "shlokas", label: "🪔 Shlokas" },
          ]}
        />
        <div className="flex gap-5">
          <Switch checked={showTranslit} onChange={setShowTranslit} label="Romanization" />
          <Switch checked={showMeaning} onChange={setShowMeaning} label="Meaning" />
        </div>
      </div>

      {tab === "phrases" ? (
        <div className="mt-6 space-y-8">
          <PhraseGrid items={phrases} showTranslit={showTranslit} showMeaning={showMeaning} />
          {spokenGroups.map((g) => (
            <section key={g.id}>
              <h2 className="mb-3 text-xl font-semibold">
                {g.title} · <span className="deva text-accent">{g.deva}</span>
              </h2>
              <PhraseGrid items={g.sentences} showTranslit={showTranslit} showMeaning={showMeaning} />
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {shlokas.map((s) => (
            <article key={s.title} data-spotlight className="rounded-3xl border border-line bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                  <p className="text-sm text-muted">{s.source}</p>
                </div>
                <SpeakButton text={s.deva.join(" ")} />
              </div>
              <div className="mt-4 border-l-4 border-accent pl-4">
                {s.deva.map((line) => (
                  <p key={line} className="deva text-2xl sm:text-3xl">
                    {line}
                  </p>
                ))}
                <Reveal show={showTranslit}>
                  <div className="pt-2">
                    {s.translit.map((line) => (
                      <p key={line} className="italic text-accent">
                        {line}
                      </p>
                    ))}
                  </div>
                </Reveal>
              </div>
              <Reveal show={showMeaning}>
                <p className="pt-4 text-muted">{s.meaning}</p>
              </Reveal>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PhraseGrid({ items, showTranslit, showMeaning }: { items: Phrase[]; showTranslit: boolean; showMeaning: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <div key={p.translit} data-spotlight className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
          <SpeakButton text={p.deva} />
          <div>
            <p className="deva text-2xl">{p.deva}</p>
            <Reveal show={showTranslit}>
              <p className="italic text-accent">{p.translit}</p>
            </Reveal>
            <Reveal show={showMeaning}>
              <p className="text-sm text-muted">{p.meaning}</p>
            </Reveal>
          </div>
        </div>
      ))}
    </div>
  );
}

// Height + opacity spring so toggling text reflows smoothly instead of jumping.
function Reveal({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={spring}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
