// Nouns by ending (General Update_2): the owner's word lists, grouped by gender and final vowel,
// each word declined in the eight cases and three numbers. Where grammar gives two forms
// (मत्यै / मतये) the cell holds both, separated by " / ".

import { toIAST } from "./iast";

export type NounGender = "m" | "f" | "n";
export type NounForms = [string, string, string][]; // eight cases, each [singular, dual, plural]

export type NounWord = {
  id: string;
  deva: string; // as listed: "बालकः", or "पितृ / पिता" for ṛ-stems
  translit: string;
  meaning: string;
  note?: string;
  forms: NounForms;
};

export type NounClass = {
  id: string;
  gender: NounGender;
  title: string; // "Akārānta Pumliṅga Śabda"
  short: string; // "Akārānta"
  deva: string; // "अकारान्तः"
  words: NounWord[];
};

export const nounGenders: { id: NounGender; title: string; deva: string }[] = [
  { id: "m", title: "Pumliṅga", deva: "पुंलिङ्गम्" },
  { id: "f", title: "Strīliṅga", deva: "स्त्रीलिङ्गम्" },
  { id: "n", title: "Napuṃsakaliṅga", deva: "नपुंसकलिङ्गम्" },
];

// ---------------------------------------------------------------- sandhi

// णत्व: न after ऋ, र or ष becomes ण unless a letter outside vowels, ह य व, the क- and प-vargas or anusvāra
// comes between (पुत्रेण, गुरुणा, but ऋतुना). A word-final न् never changes.
const TRIGGER = /[रषऋॠृॄ]/;
const TRANSPARENT = /[अ-औा-ौ्ंहयवकखगघङपफबभम]/;

function natva(stem: string, ending: string): string {
  let out = stem;
  for (let i = 0; i < ending.length; i++) {
    let ch = ending[i];
    const final = ending[i + 1] === "्" && i + 2 === ending.length;
    if (ch === "न" && !final) {
      for (let j = out.length - 1; j >= 0; j--) {
        if (TRIGGER.test(out[j])) {
          ch = "ण";
          break;
        }
        if (!TRANSPARENT.test(out[j])) break;
      }
    }
    out += ch;
  }
  return out;
}

// One table cell: every " / " alternative gets the stem (and हे, in the vocative).
const cell = (stem: string, endings: string, prefix = "") =>
  endings
    .split(" / ")
    .map((e) => prefix + natva(stem, e))
    .join(" / ");

/** Ending tables are written as eight rows, "sg du pl"; the last row is the vocative. */
const decline = (stem: string, table: string): NounForms =>
  table
    .trim()
    .split("\n")
    .map((row, r, rows) =>
      row
        .trim()
        .split(/\s*\|\s*/)
        .map((e) => cell(stem, e === "0" ? "" : e, r === rows.length - 1 ? "हे " : "")),
    ) as NounForms;

// ---------------------------------------------------------------- ending tables

const A_M = `ः | ौ | ाः
म् | ौ | ान्
ेन | ाभ्याम् | ैः
ाय | ाभ्याम् | ेभ्यः
ात् | ाभ्याम् | ेभ्यः
स्य | योः | ानाम्
े | योः | ेषु
0 | ौ | ाः`;

const I_M = `िः | ी | यः
िम् | ी | ीन्
िना | िभ्याम् | िभिः
ये | िभ्याम् | िभ्यः
ेः | िभ्याम् | िभ्यः
ेः | ्योः | ीनाम्
ौ | ्योः | िषु
े | ी | यः`;

const U_M = `ुः | ू | वः
ुम् | ू | ून्
ुना | ुभ्याम् | ुभिः
वे | ुभ्याम् | ुभ्यः
ोः | ुभ्याम् | ुभ्यः
ोः | ्वोः | ूनाम्
ौ | ्वोः | ुषु
ो | ू | वः`;

// पितृ, भ्रातृ, जामातृ (relations) keep a short vowel; कर्तृ and other doers lengthen it.
const R_M_RELATION = `ा | रौ | रः
रम् | रौ | ॄन्
्रा | ृभ्याम् | ृभिः
्रे | ृभ्याम् | ृभ्यः
ुः | ृभ्याम् | ृभ्यः
ुः | ्रोः | ॄनाम्
रि | ्रोः | ृषु
ः | रौ | रः`;

const R_M_AGENT = `ा | ारौ | ारः
ारम् | ारौ | ॄन्
्रा | ृभ्याम् | ृभिः
्रे | ृभ्याम् | ृभ्यः
ुः | ृभ्याम् | ृभ्यः
ुः | ्रोः | ॄनाम्
रि | ्रोः | ृषु
ः | ारौ | ारः`;

const AA_F = `ा | े | ाः
ाम् | े | ाः
या | ाभ्याम् | ाभिः
ायै | ाभ्याम् | ाभ्यः
ायाः | ाभ्याम् | ाभ्यः
ायाः | योः | ानाम्
ायाम् | योः | ासु
े | े | ाः`;

const I_F = `िः | ी | यः
िम् | ी | ीः
्या | िभ्याम् | िभिः
्यै / ये | िभ्याम् | िभ्यः
्याः / ेः | िभ्याम् | िभ्यः
्याः / ेः | ्योः | ीनाम्
्याम् / ौ | ्योः | िषु
े | ी | यः`;

const II_F = `ी | ्यौ | ्यः
ीम् | ्यौ | ीः
्या | ीभ्याम् | ीभिः
्यै | ीभ्याम् | ीभ्यः
्याः | ीभ्याम् | ीभ्यः
्याः | ्योः | ीनाम्
्याम् | ्योः | ीषु
ि | ्यौ | ्यः`;

const U_F = `ुः | ू | वः
ुम् | ू | ूः
्वा | ुभ्याम् | ुभिः
्वै / वे | ुभ्याम् | ुभ्यः
्वाः / ोः | ुभ्याम् | ुभ्यः
्वाः / ोः | ्वोः | ूनाम्
्वाम् / ौ | ्वोः | ुषु
ो | ू | वः`;

const UU_F = `ूः | ्वौ | ्वः
ूम् | ्वौ | ूः
्वा | ूभ्याम् | ूभिः
्वै | ूभ्याम् | ूभ्यः
्वाः | ूभ्याम् | ूभ्यः
्वाः | ्वोः | ूनाम्
्वाम् | ्वोः | ूषु
ु | ्वौ | ्वः`;

// भू and भ्रू: one syllable, so the stem takes उव् before vowels.
const UU_F_MONO = `ूः | ुवौ | ुवः
ुवम् | ुवौ | ुवः
ुवा | ूभ्याम् | ूभिः
ुवै / ुवे | ूभ्याम् | ूभ्यः
ुवाः / ुवः | ूभ्याम् | ूभ्यः
ुवाः / ुवः | ुवोः | ूनाम् / ुवाम्
ुवाम् / ुवि | ुवोः | ूषु
ूः | ुवौ | ुवः`;

const R_F = `ा | रौ | रः
रम् | रौ | ॄः
्रा | ृभ्याम् | ृभिः
्रे | ृभ्याम् | ृभ्यः
ुः | ृभ्याम् | ृभ्यः
ुः | ्रोः | ॄनाम्
रि | ्रोः | ृषु
ः | रौ | रः`;

// स्वसृ lengthens its vowel like कर्तृ.
const R_F_SVASR = R_F.replace("ा | रौ | रः", "ा | ारौ | ारः")
  .replace("रम् | रौ", "ारम् | ारौ")
  .replace("ः | रौ | रः", "ः | ारौ | ारः");

const A_N = `म् | े | ानि
म् | े | ानि
ेन | ाभ्याम् | ैः
ाय | ाभ्याम् | ेभ्यः
ात् | ाभ्याम् | ेभ्यः
स्य | योः | ानाम्
े | योः | ेषु
0 | े | ानि`;

const I_N = `ि | िनी | ीनि
ि | िनी | ीनि
िना | िभ्याम् | िभिः
िने | िभ्याम् | िभ्यः
िनः | िभ्याम् | िभ्यः
िनः | िनोः | ीनाम्
िनि | िनोः | िषु
ि / े | िनी | ीनि`;

// अक्षि and दधि drop the vowel before the endings that start with a vowel.
const I_N_SYNCOPE = `ि | िनी | ीनि
ि | िनी | ीनि
्ना | िभ्याम् | िभिः
्ने | िभ्याम् | िभ्यः
्नः | िभ्याम् | िभ्यः
्नः | ्नोः | ्नाम्
्नि / नि | ्नोः | िषु
ि / े | िनी | ीनि`;

// An adjective used for a neuter noun may also take the masculine endings.
const I_N_ADJ = `ि | िनी | ीनि
ि | िनी | ीनि
िना | िभ्याम् | िभिः
िने / ये | िभ्याम् | िभ्यः
िनः / ेः | िभ्याम् | िभ्यः
िनः / ेः | िनोः / ्योः | ीनाम्
िनि / ौ | िनोः / ्योः | िषु
ि / े | िनी | ीनि`;

const U_N = `ु | ुनी | ूनि
ु | ुनी | ूनि
ुना | ुभ्याम् | ुभिः
ुने | ुभ्याम् | ुभ्यः
ुनः | ुभ्याम् | ुभ्यः
ुनः | ुनोः | ूनाम्
ुनि | ुनोः | ुषु
ु / ो | ुनी | ूनि`;

const U_N_ADJ = `ु | ुनी | ूनि
ु | ुनी | ूनि
ुना | ुभ्याम् | ुभिः
ुने / वे | ुभ्याम् | ुभ्यः
ुनः / ोः | ुभ्याम् | ुभ्यः
ुनः / ोः | ुनोः / ्वोः | ूनाम्
ुनि / ौ | ुनोः / ्वोः | ुषु
ु / ो | ुनी | ूनि`;

// ---------------------------------------------------------------- the word lists

type Row = [deva: string, meaning: string, opts?: { table?: string; note?: string }];

/** `ending` is cut off the listed form to get the stem; ṛ-stems are listed as "पितृ / पिता". */
function nounClass(id: string, gender: NounGender, short: string, deva: string, table: string, ending: string, rows: Row[]): NounClass {
  const g = nounGenders.find((x) => x.id === gender)!;
  return {
    id,
    gender,
    title: `${short} ${g.title} Śabda`,
    short,
    deva,
    words: rows.map(([word, meaning, opts]) => {
      const nominative = word.split(" / ").pop()!;
      return {
        id: `noun:${id}:${nominative}`,
        deva: word,
        translit: toIAST(word),
        meaning,
        note: opts?.note,
        forms: decline(nominative.slice(0, nominative.length - ending.length), opts?.table ?? table),
      };
    }),
  };
}

export const nounClasses: NounClass[] = [
  nounClass("a-m", "m", "Akārānta", "अकारान्तः", A_M, "ः", [
    ["बालकः", "Boy"],
    ["बालः", "Boy / Child"],
    ["जनकः", "Father"],
    ["विद्यालयः", "School"],
    ["देवः", "God"],
    ["गजः", "Elephant"],
    ["सूर्यः", "Sun"],
    ["पुत्रः", "Son"],
    ["शिक्षकः", "Teacher"],
    ["छात्रः", "Student"],
    ["वृक्षः", "Tree"],
    ["नरः", "Man"],
  ]),
  nounClass("i-m", "m", "Ikārānta", "इकारान्तः", I_M, "िः", [
    ["कविः", "Poet"],
    ["मुनिः", "Sage / Ascetic"],
    ["कपिः", "Monkey"],
    ["अग्निः", "Fire"],
    ["विधिः", "Law / Method / Ritual"],
    ["अरिः", "Enemy"],
    ["हरिः", "Lord Vishnu / Almighty"],
    ["रविः", "Sun"],
    ["गिरिः", "Mountain"],
    ["ऋषिः", "Seer / Saint"],
  ]),
  nounClass("u-m", "m", "Ukārānta", "उकारान्तः", U_M, "ुः", [
    ["भानुः", "Sun"],
    ["गुरुः", "Teacher / Master"],
    ["साधुः", "Sage / Saint"],
    ["शिशुः", "Baby / Infant"],
    ["विष्णुः", "Lord Vishnu"],
    ["वायुः", "Wind / Air"],
    ["तरुः", "Tree"],
    ["पशुः", "Animal"],
    ["रिपुः", "Enemy"],
    ["शत्रुः", "Enemy"],
    ["ऋतुः", "Season"],
  ]),
  nounClass("r-m", "m", "Ṛkārānta", "ऋकारान्तः", R_M_AGENT, "ा", [
    ["पितृ / पिता", "Father", { table: R_M_RELATION }],
    ["भ्रातृ / भ्राता", "Brother", { table: R_M_RELATION }],
    ["कर्तृ / कर्ता", "Doer / Creator"],
    ["दातृ / दाता", "Giver / Donor"],
    ["नेतृ / नेता", "Leader"],
    ["स्रष्टृ / स्रष्टा", "Creator"],
    ["वक्तृ / वक्ता", "Speaker"],
    ["श्रोतृ / श्रोता", "Listener"],
    ["जामातृ / जामाता", "Son-in-law", { table: R_M_RELATION }],
    ["नप्तृ / नप्ता", "Grandson"],
  ]),
  nounClass("aa-f", "f", "Ākārānta", "आकारान्ता", AA_F, "ा", [
    ["बालिका", "Girl"],
    ["बाला", "Young girl / Child"],
    ["लता", "Creeper / Vine"],
    ["रमा", "Goddess Lakshmi"],
    ["शाला", "School / Hall / Room"],
    ["माला", "Garland / Necklace"],
    ["कलिका", "Flower Bud"],
    ["महिला", "Woman"],
    ["चटका", "Female Sparrow"],
    ["विद्या", "Knowledge / Education"],
    ["कक्षा", "Class / Room"],
    ["छात्रा", "Female Student"],
  ]),
  nounClass("i-f", "f", "Ikārānta", "इकारान्ता", I_F, "िः", [
    ["मतिः", "Mind / Intelligence"],
    ["गतिः", "Speed / Motion / Destiny"],
    ["बुद्धिः", "Intellect / Wisdom"],
    ["शक्तिः", "Power / Energy"],
    ["भूमिः", "Earth / Land"],
    ["नीतिः", "Policy / Morals"],
    ["जातिः", "Caste / Community / Species"],
    ["कीर्तिः", "Fame / Glory"],
    ["रात्रिः", "Night"],
    ["सूक्तिः", "Good saying / Proverb"],
  ]),
  nounClass("ii-f", "f", "Īkārānta", "ईकारान्ता", II_F, "ी", [
    ["नदी", "River"],
    ["नारी", "Woman"],
    ["देवी", "Goddess"],
    ["पुत्री", "Daughter"],
    ["भगिनी", "Sister"],
    ["जननी", "Mother"],
    ["सखी", "Female Friend"],
    ["कुमारी", "Young Girl / Princess"],
    ["पत्नी", "Wife"],
    ["तरुणी", "Young Woman"],
    ["युवती", "Young Woman"],
    ["पृथिवी", "Earth"],
    ["वाणी", "Speech / Voice / Goddess Saraswati"],
  ]),
  nounClass("u-f", "f", "Ukārānta", "उकारान्ता", U_F, "ुः", [
    ["धेनुः", "Cow"],
    ["तनुः", "Body"],
    ["रेणुः", "Dust / Sand"],
    ["हनुः", "Jaw"],
    ["वेणुः", "Bamboo", { note: "Can also be used as masculine." }],
  ]),
  nounClass("uu-f", "f", "Ūkārānta", "ऊकारान्ता", UU_F, "ू", [
    ["वधू", "Bride / Daughter-in-law / Wife"],
    ["चमू", "Army / Division of an army"],
    ["श्वश्रू", "Mother-in-law"],
    ["भू", "Earth / Ground", { table: UU_F_MONO }],
    ["भ्रू", "Eyebrow", { table: UU_F_MONO }],
  ]),
  nounClass("r-f", "f", "Ṛkārānta", "ऋकारान्ता", R_F, "ा", [
    ["मातृ / माता", "Mother"],
    ["दुहितृ / दुहिता", "Daughter"],
    ["स्वसृ / स्वसा", "Sister", { table: R_F_SVASR }],
    ["यातृ / याता", "Husband's brother's wife / Sister-in-law"],
    ["ननान्दृ / ननान्दा", "Husband's sister / Sister-in-law"],
  ]),
  nounClass("a-n", "n", "Akārānta", "अकारान्तम्", A_N, "म्", [
    ["फलम्", "Fruit"],
    ["पुस्तकम्", "Book"],
    ["पत्रम्", "Leaf / Letter"],
    ["पुष्पम्", "Flower"],
    ["गृहम्", "House / Home"],
    ["वनम्", "Forest"],
    ["चित्रम्", "Picture / Painting"],
    ["यानम्", "Vehicle"],
    ["धनम्", "Wealth / Money"],
    ["उद्यानम्", "Garden / Park"],
    ["मित्रम्", "Friend", { note: "“Mitra” is neuter when it means friend, but masculine when it refers to the Sun God." }],
    ["क्षेत्रम्", "Field / Farm"],
  ]),
  nounClass("i-n", "n", "Ikārānta", "इकारान्तम्", I_N, "ि", [
    ["वारि", "Water"],
    ["अक्षि", "Eye", { table: I_N_SYNCOPE }],
    ["दधि", "Curd / Yogurt", { table: I_N_SYNCOPE }],
    ["शुचि", "Pure / Clean", { table: I_N_ADJ, note: "An adjective, when used for a neuter object." }],
  ]),
  nounClass("u-n", "n", "Ukārānta", "उकारान्तम्", U_N, "ु", [
    ["वस्तु", "Thing / Object"],
    ["मधु", "Honey / Sweet"],
    ["अश्रु", "Tear (from the eyes)"],
    ["मृदु", "Soft / Gentle", { table: U_N_ADJ, note: "An adjective, when used for a neuter object." }],
  ]),
];

export const allNouns: NounWord[] = nounClasses.flatMap((c) => c.words);
