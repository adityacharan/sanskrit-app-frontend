"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import { Deck, PreviewList, useDeck } from "@/components/deck";
import { ayogavahas, consonants, vowels, type LetterGroup } from "@/lib/data";

type Tab = "vowels" | "ayogavaha" | "consonants";
const groups: Record<Tab, LetterGroup[]> = { vowels, ayogavaha: ayogavahas, consonants };
const listTitles: Record<Tab, string> = { vowels: "स्वराः", ayogavaha: "अयोगवाहौ", consonants: "व्यञ्जनानि" };

export default function AlphabetPage() {
  const [tab, setTab] = useState<Tab>("vowels");
  const letters = groups[tab].flatMap((g) => g.letters);
  const deck = useDeck(letters.length);
  const letter = letters[deck.index];

  // Group boundaries for the full list (the five vargas, semivowels, sibilants).
  let from = 0;
  const listGroups = groups[tab].map((g) => {
    const group = { label: <>{g.name} <span className="deva">· {g.sanskrit}</span></>, from, to: from + g.letters.length };
    from += g.letters.length;
    return group;
  });

  return (
    <div>
      <PageHeader
        deva="वर्णमाला"
        title="The Devanagari Alphabet"
        subtitle="Sanskrit is written in Devanagari. Flip each letter to see a word that begins with it."
      />

      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          deck.reset();
        }}
        options={[
          { value: "vowels", label: "Vowels · स्वराः" },
          { value: "ayogavaha", label: "Anusvāra & visarga · अयोगवाहौ" },
          { value: "consonants", label: "Consonants · व्यञ्जनानि" },
        ]}
      />

      <div className="mt-6">
        <Deck
          deck={deck}
          count={letters.length}
          cardKey={letter.id}
          speakText={(flipped) => (flipped && letter.example ? letter.example.deva : letter.deva)}
          front={
            <>
              <p className="deva text-8xl text-accent">{letter.deva}</p>
              <p className="text-2xl font-semibold italic">{letter.translit}</p>
            </>
          }
          back={
            letter.example ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Example · <span className="deva normal-case">{letter.deva}</span>
                </p>
                <p className="deva mt-2 text-5xl">{letter.example.deva}</p>
                <p className="mt-2 text-lg italic text-muted">{letter.example.translit}</p>
                <p className="text-lg">{letter.example.meaning}</p>
                <p className="mt-3 text-sm text-muted">
                  <span className="deva">{letter.deva}</span> sounds like {letter.sound}
                </p>
              </>
            ) : (
              <>
                <p className="deva text-5xl">{letter.deva}</p>
                <p className="mt-2 text-lg italic text-muted">{letter.translit}</p>
                <p className="mt-3 max-w-xs text-sm text-muted">This letter rarely begins a word, but appears inside many words.</p>
                <p className="mt-3 text-sm text-muted">Sounds like {letter.sound}</p>
              </>
            )
          }
        >
          {letter.deva === "ह" && (
            <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
              <p className="font-medium text-ink">Note</p>
              <p className="mt-1">
                In Devanagari, pure consonants natively end with a small diagonal slash underneath the letter called a{" "}
                <em>halanta</em> (e.g. <span className="deva text-ink">क्, ख्, ग्, घ्, ङ्</span>). However, for ease of
                pronunciation and writing, they are naturally combined with the inherent short vowel “a” and written as{" "}
                <span className="deva text-ink">क, ख, ग, घ, ङ</span>.
              </p>
            </div>
          )}
        </Deck>
      </div>

      <PreviewList
        title={
          <>
            All letters · <span className="deva text-accent">{listTitles[tab]}</span>
          </>
        }
        items={letters}
        active={deck.index}
        onPick={deck.goTo}
        getKey={(l) => l.id}
        chip={(l) => (
          <>
            <span className="deva text-lg">{l.deva}</span> <span className="text-sm italic text-muted">{l.translit}</span>
          </>
        )}
        groups={listGroups.length > 1 ? listGroups : undefined}
      />
    </div>
  );
}
