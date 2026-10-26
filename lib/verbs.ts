// Verbs (धातवः) in all ten lakaras, from the owner's P_2-Verbs document.
// Forms are per person in the order [3rd (प्रथम), 2nd (मध्यम), 1st (उत्तम)], each [sg, du, pl].

import { toIAST } from "./iast";

export type Forms = [string, string, string][];
export type LakaraId = "lat" | "lit" | "lut" | "lrt" | "lot" | "lang" | "vidhiling" | "ashirling" | "lung" | "lrng";

export type Lakara = { id: LakaraId; deva: string; translit: string; name: string; hint: string };

// In the document's order.
export const lakaras: Lakara[] = [
  { id: "lat", deva: "लट्", translit: "Laṭ", name: "Present Tense", hint: "he reads" },
  { id: "lit", deva: "लिट्", translit: "Liṭ", name: "Remote Past Tense", hint: "he read (long ago)" },
  { id: "lut", deva: "लुट्", translit: "Luṭ", name: "First Future Tense", hint: "he will read (not today)" },
  { id: "lrt", deva: "लृट्", translit: "Lṛṭ", name: "General Future Tense", hint: "he will read" },
  { id: "lot", deva: "लोट्", translit: "Loṭ", name: "Imperative Mood (Command / Request)", hint: "let him read" },
  { id: "lang", deva: "लङ्", translit: "Laṅ", name: "Past Tense", hint: "he read / was reading" },
  { id: "vidhiling", deva: "विधिलिङ्", translit: "Vidhiliṅ", name: "Potential Mood (Advice / Permission)", hint: "he should read" },
  { id: "ashirling", deva: "आशीर्लिङ्", translit: "Āśīrliṅ", name: "Benedictive Mood (Blessing)", hint: "may he read" },
  { id: "lung", deva: "लुङ्", translit: "Luṅ", name: "General Past Tense", hint: "he read" },
  { id: "lrng", deva: "लृङ्", translit: "Lṛṅ", name: "Conditional Mood", hint: "he would have read" },
];

export const persons = [
  { name: "3rd person", sanskrit: "प्रथमपुरुषः", hint: "he / she / they" },
  { name: "2nd person", sanskrit: "मध्यमपुरुषः", hint: "you" },
  { name: "1st person", sanskrit: "उत्तमपुरुषः", hint: "I / we" },
];

export type Verb = {
  id: string;
  root: string;
  translit: string;
  meaning: string;
  english: [string, string, string]; // present, after "I" / "we, you, they" / "he, she, it"
  ing: string; // "reading", for the past tense ("he was reading")
  base?: string; // "be" for अस्; otherwise english[1]
  past?: [string, string, string]; // only अस् ("was / were / was")
  forms: Partial<Record<LakaraId, Forms>>;
  note?: string;
};

// ---------------------------------------------------------------- generators

const join = (stem: string, endings: string[][]): Forms => endings.map((row) => row.map((e) => stem + e)) as Forms;

const LAT = [["ति", "तः", "न्ति"], ["सि", "थः", "थ"], ["ामि", "ावः", "ामः"]];
const LANG = [["त्", "ताम्", "न्"], ["ः", "तम्", "त"], ["म्", "ाव", "ाम"]];
const LOT = [["तु", "ताम्", "न्तु"], ["", "तम्", "त"], ["ानि", "ाव", "ाम"]];
const VIDHI = [["ेत्", "ेताम्", "ेयुः"], ["ेः", "ेतम्", "ेत"], ["ेयम्", "ेव", "ेम"]];
const LUT = [["ा", "ारौ", "ारः"], ["ासि", "ास्थः", "ास्थ"], ["ास्मि", "ास्वः", "ास्मः"]];
const ASHIR = [["ात्", "ास्ताम्", "ासुः"], ["ाः", "ास्तम्", "ास्त"], ["ासम्", "ास्व", "ास्म"]];
const IS_AORIST = [["ीत्", "िष्टाम्", "िषुः"], ["ीः", "िष्टम्", "िष्ट"], ["िषम्", "िष्व", "िष्म"]];
const S_AORIST = [["षीत्", "ष्टाम्", "षुः"], ["षीः", "ष्टम्", "ष्ट"], ["षम्", "ष्व", "ष्म"]];

// लिट्: strong stem (3rd/1st sg), weak stem (the rest) and the 2nd sg form.
const lit = (strong: string, weak: string, second: string, first = strong): Forms => [
  [strong, weak + "तुः", weak + "ुः"],
  [second, weak + "थुः", weak],
  [first, weak + "िव", weak + "िम"],
];

type Aorist = { is: string } | { s: string } | { a: string } | Forms;
const lung = (a: Aorist): Forms =>
  Array.isArray(a) ? a : "is" in a ? join(a.is, IS_AORIST) : "s" in a ? join(a.s, S_AORIST) : join(a.a, LANG);

type Spec = {
  id: string;
  root: string;
  translit: string;
  meaning: string;
  english: [string, string, string];
  ing: string;
  stem?: string; // present a-stem (लट्, लोट्, विधिलिङ्)
  aug?: string; // augmented present stem (लङ्)
  sya: string; // future stem (लृट्)
  augSya: string; // augmented future stem (लृङ्)
  ta: string; // लुट् 3rd sg
  lit: Forms | [string, string, string] | [string, string, string, string];
  lung: Aorist;
  ashir: string; // आशीर्लिङ् stem before -यात्
  present?: Partial<Record<"lat" | "lang" | "lot" | "vidhiling", Forms>>; // athematic verbs
};

const verb = (s: Spec): Verb => ({
  id: s.id,
  root: s.root,
  translit: s.translit,
  meaning: s.meaning,
  english: s.english,
  ing: s.ing,
  forms: {
    lat: s.present?.lat ?? join(s.stem!, LAT),
    lit: typeof s.lit[0] === "string" ? lit(...(s.lit as [string, string, string, string?])) : (s.lit as Forms),
    lut: join(s.ta.slice(0, -1), LUT),
    lrt: join(s.sya, LAT),
    lot: s.present?.lot ?? join(s.stem!, LOT),
    lang: s.present?.lang ?? join(s.aug!, LANG),
    vidhiling: s.present?.vidhiling ?? join(s.stem!, VIDHI),
    ashirling: join(s.ashir, ASHIR),
    lung: lung(s.lung),
    lrng: join(s.augSya, LANG),
  },
});

// ---------------------------------------------------------------- the verbs

export const verbs: Verb[] = [
  verb({ id: "path", root: "पठ्", translit: "paṭh", meaning: "to read", english: ["read", "read", "reads"], ing: "reading",
    stem: "पठ", aug: "अपठ", sya: "पठिष्य", augSya: "अपठिष्य", ta: "पठिता", lit: ["पपाठ", "पेठ", "पेठिथ"], lung: { is: "अपठ" }, ashir: "पठ्य" }),
  verb({ id: "likh", root: "लिख्", translit: "likh", meaning: "to write", english: ["write", "write", "writes"], ing: "writing",
    stem: "लिख", aug: "अलिख", sya: "लेखिष्य", augSya: "अलेखिष्य", ta: "लेखिता", lit: ["लिलेख", "लिलिख", "लिलेखिथ"], lung: { is: "अलेख" }, ashir: "लिख्य" }),
  verb({ id: "gam", root: "गम्", translit: "gam", meaning: "to go", english: ["go", "go", "goes"], ing: "going",
    stem: "गच्छ", aug: "अगच्छ", sya: "गमिष्य", augSya: "अगमिष्य", ta: "गन्ता", lit: ["जगाम", "जग्म", "जगमिथ"], lung: { a: "अगम" }, ashir: "गम्य" }),
  verb({ id: "agam", root: "आ + गम्", translit: "ā + gam", meaning: "to come", english: ["come", "come", "comes"], ing: "coming",
    stem: "आगच्छ", aug: "आगच्छ", sya: "आगमिष्य", augSya: "आगमिष्य", ta: "आगन्ता", lit: ["आजगाम", "आजग्म", "आजगमिथ"], lung: { a: "आगम" }, ashir: "आगम्य" }),
  verb({ id: "khad", root: "खाद्", translit: "khād", meaning: "to eat", english: ["eat", "eat", "eats"], ing: "eating",
    stem: "खाद", aug: "अखाद", sya: "खादिष्य", augSya: "अखादिष्य", ta: "खादिता", lit: ["चखाद", "चखाद", "चखादिथ"], lung: { is: "अखाद" }, ashir: "खाद्य" }),
  verb({ id: "pa", root: "पा", translit: "pā", meaning: "to drink", english: ["drink", "drink", "drinks"], ing: "drinking",
    stem: "पिब", aug: "अपिब", sya: "पास्य", augSya: "अपास्य", ta: "पाता", lit: ["पपौ", "पप", "पपिथ"],
    lung: [["अपात्", "अपाताम्", "अपुः"], ["अपाः", "अपातम्", "अपात"], ["अपाम्", "अपाव", "अपाम"]], ashir: "पेय" }),
  verb({ id: "drs", root: "दृश्", translit: "dṛś", meaning: "to see", english: ["see", "see", "sees"], ing: "seeing",
    stem: "पश्य", aug: "अपश्य", sya: "द्रक्ष्य", augSya: "अद्रक्ष्य", ta: "द्रष्टा", lit: ["ददर्श", "ददृश", "ददर्शिथ"],
    lung: [["अद्राक्षीत्", "अद्राष्टाम्", "अद्राक्षुः"], ["अद्राक्षीः", "अद्राष्टम्", "अद्राष्ट"], ["अद्राक्षम्", "अद्राक्ष्व", "अद्राक्ष्म"]], ashir: "दृश्य" }),
  verb({ id: "krid", root: "क्रीड्", translit: "krīḍ", meaning: "to play", english: ["play", "play", "plays"], ing: "playing",
    stem: "क्रीड", aug: "अक्रीड", sya: "क्रीडिष्य", augSya: "अक्रीडिष्य", ta: "क्रीडिता", lit: ["चिक्रीड", "चिक्रीड", "चिक्रीडिथ"], lung: { is: "अक्रीड" }, ashir: "क्रीड्य" }),
  verb({ id: "has", root: "हस्", translit: "has", meaning: "to laugh", english: ["laugh", "laugh", "laughs"], ing: "laughing",
    stem: "हस", aug: "अहस", sya: "हसिष्य", augSya: "अहसिष्य", ta: "हसिता", lit: ["जहास", "जहस", "जहसिथ"], lung: { is: "अहस" }, ashir: "हस्य" }),
  verb({ id: "vad", root: "वद्", translit: "vad", meaning: "to speak", english: ["speak", "speak", "speaks"], ing: "speaking",
    stem: "वद", aug: "अवद", sya: "वदिष्य", augSya: "अवदिष्य", ta: "वदिता", lit: ["उवाद", "ऊद", "उवदिथ"], lung: { is: "अवाद" }, ashir: "उद्य" }),
  verb({ id: "cal", root: "चल्", translit: "cal", meaning: "to walk / to move", english: ["move", "move", "moves"], ing: "moving",
    stem: "चल", aug: "अचल", sya: "चलिष्य", augSya: "अचलिष्य", ta: "चलिता", lit: ["चचाल", "चेल", "चेलिथ"], lung: { is: "अचल" }, ashir: "चल्य" }),
  verb({ id: "dhav", root: "धाव्", translit: "dhāv", meaning: "to run", english: ["run", "run", "runs"], ing: "running",
    stem: "धाव", aug: "अधाव", sya: "धाविष्य", augSya: "अधाविष्य", ta: "धाविता", lit: ["दधाव", "दधाव", "दधाविथ"], lung: { is: "अधाव" }, ashir: "धाव्य" }),
  verb({ id: "nrt", root: "नृत्", translit: "nṛt", meaning: "to dance", english: ["dance", "dance", "dances"], ing: "dancing",
    stem: "नृत्य", aug: "अनृत्य", sya: "नर्तिष्य", augSya: "अनर्तिष्य", ta: "नर्तिता", lit: ["ननर्त", "ननृत", "ननर्तिथ"], lung: { is: "अनर्त" }, ashir: "नृत्य" }),
  verb({ id: "nam", root: "नम्", translit: "nam", meaning: "to bow", english: ["bow", "bow", "bows"], ing: "bowing",
    stem: "नम", aug: "अनम", sya: "नंस्य", augSya: "अनंस्य", ta: "नन्ता", lit: ["ननाम", "नेम", "नेमिथ"], lung: { is: "अनंस" }, ashir: "नम्य" }),
  verb({ id: "smr", root: "स्मृ", translit: "smṛ", meaning: "to remember", english: ["remember", "remember", "remembers"], ing: "remembering",
    stem: "स्मर", aug: "अस्मर", sya: "स्मरिष्य", augSya: "अस्मरिष्य", ta: "स्मर्ता", lit: ["सस्मार", "सस्मर", "सस्मर्थ"], lung: { s: "अस्मार्" }, ashir: "स्मर्य" }),
  verb({ id: "kr", root: "कृ", translit: "kṛ", meaning: "to do", english: ["do", "do", "does"], ing: "doing",
    sya: "करिष्य", augSya: "अकरिष्य", ta: "कर्ता",
    lit: [["चकार", "चक्रतुः", "चक्रुः"], ["चकर्थ", "चक्रथुः", "चक्र"], ["चकार", "चकृव", "चकृम"]],
    lung: { s: "अकार्" }, ashir: "क्रिय",
    present: {
      lat: [["करोति", "कुरुतः", "कुर्वन्ति"], ["करोषि", "कुरुथः", "कुरुथ"], ["करोमि", "कुर्वः", "कुर्मः"]],
      lang: [["अकरोत्", "अकुरुताम्", "अकुर्वन्"], ["अकरोः", "अकुरुतम्", "अकुरुत"], ["अकरवम्", "अकुर्व", "अकुर्म"]],
      lot: [["करोतु", "कुरुताम्", "कुर्वन्तु"], ["कुरु", "कुरुतम्", "कुरुत"], ["करवाणि", "करवाव", "करवाम"]],
      vidhiling: [["कुर्यात्", "कुर्याताम्", "कुर्युः"], ["कुर्याः", "कुर्यातम्", "कुर्यात"], ["कुर्याम्", "कुर्याव", "कुर्याम"]],
    } }),
  verb({ id: "stha", root: "स्था", translit: "sthā", meaning: "to stand", english: ["stand", "stand", "stands"], ing: "standing",
    stem: "तिष्ठ", aug: "अतिष्ठ", sya: "स्थास्य", augSya: "अस्थास्य", ta: "स्थाता", lit: ["तस्थौ", "तस्थ", "तस्थिथ"],
    lung: [["अस्थात्", "अस्थाताम्", "अस्थुः"], ["अस्थाः", "अस्थातम्", "अस्थात"], ["अस्थाम्", "अस्थाव", "अस्थाम"]], ashir: "स्थेय" }),
  verb({ id: "ni", root: "नी", translit: "nī", meaning: "to lead / to take", english: ["lead", "lead", "leads"], ing: "leading",
    stem: "नय", aug: "अनय", sya: "नेष्य", augSya: "अनेष्य", ta: "नेता", lit: ["निनाय", "निन्य", "निनयिथ"], lung: { s: "अनै" }, ashir: "नीय" }),
  verb({ id: "bhu", root: "भू", translit: "bhū", meaning: "to be / to become", english: ["become", "become", "becomes"], ing: "becoming",
    stem: "भव", aug: "अभव", sya: "भविष्य", augSya: "अभविष्य", ta: "भविता", lit: ["बभूव", "बभूव", "बभूविथ"],
    lung: [["अभूत्", "अभूताम्", "अभूवन्"], ["अभूः", "अभूतम्", "अभूत"], ["अभूवम्", "अभूव", "अभूम"]], ashir: "भूय" }),
  {
    id: "as", root: "अस्", translit: "as", meaning: "to be / to become", english: ["am", "are", "is"], ing: "being", base: "be", past: ["was", "were", "was"],
    note: "अस् has forms only in लट्, लङ्, लोट् and विधिलिङ्. In the other lakaras भू (भवति) is used in its place.",
    forms: {
      lat: [["अस्ति", "स्तः", "सन्ति"], ["असि", "स्थः", "स्थ"], ["अस्मि", "स्वः", "स्मः"]],
      lang: [["आसीत्", "आस्ताम्", "आसन्"], ["आसीः", "आस्तम्", "आस्त"], ["आसम्", "आस्व", "आस्म"]],
      lot: [["अस्तु", "स्ताम्", "सन्तु"], ["एधि", "स्तम्", "स्त"], ["असानि", "असाव", "असाम"]],
      vidhiling: [["स्यात्", "स्याताम्", "स्युः"], ["स्याः", "स्यातम्", "स्यात"], ["स्याम्", "स्याव", "स्याम"]],
    },
  },
  // Other commonly used verbs, added as the document asked.
  verb({ id: "vas", root: "वस्", translit: "vas", meaning: "to dwell / to stay", english: ["stay", "stay", "stays"], ing: "staying",
    stem: "वस", aug: "अवस", sya: "वत्स्य", augSya: "अवत्स्य", ta: "वस्ता", lit: ["उवास", "ऊष", "उवसिथ"],
    lung: [["अवात्सीत्", "अवात्ताम्", "अवात्सुः"], ["अवात्सीः", "अवात्तम्", "अवात्त"], ["अवात्सम्", "अवात्स्व", "अवात्स्म"]], ashir: "उष्य" }),
  verb({ id: "pac", root: "पच्", translit: "pac", meaning: "to cook", english: ["cook", "cook", "cooks"], ing: "cooking",
    stem: "पच", aug: "अपच", sya: "पक्ष्य", augSya: "अपक्ष्य", ta: "पक्ता", lit: ["पपाच", "पेच", "पेचिथ"],
    lung: [["अपाक्षीत्", "अपाक्ताम्", "अपाक्षुः"], ["अपाक्षीः", "अपाक्तम्", "अपाक्त"], ["अपाक्षम्", "अपाक्ष्व", "अपाक्ष्म"]], ashir: "पच्य" }),
  verb({ id: "jiv", root: "जीव्", translit: "jīv", meaning: "to live", english: ["live", "live", "lives"], ing: "living",
    stem: "जीव", aug: "अजीव", sya: "जीविष्य", augSya: "अजीविष्य", ta: "जीविता", lit: ["जिजीव", "जिजीव", "जिजीविथ"], lung: { is: "अजीव" }, ashir: "जीव्य" }),
  verb({ id: "pat", root: "पत्", translit: "pat", meaning: "to fall", english: ["fall", "fall", "falls"], ing: "falling",
    stem: "पत", aug: "अपत", sya: "पतिष्य", augSya: "अपतिष्य", ta: "पतिता", lit: ["पपात", "पेत", "पेतिथ"], lung: { a: "अपप्त" }, ashir: "पत्य" }),
  verb({ id: "raks", root: "रक्ष्", translit: "rakṣ", meaning: "to protect", english: ["protect", "protect", "protects"], ing: "protecting",
    stem: "रक्ष", aug: "अरक्ष", sya: "रक्षिष्य", augSya: "अरक्षिष्य", ta: "रक्षिता", lit: ["ररक्ष", "ररक्ष", "ररक्षिथ"], lung: { is: "अरक्ष" }, ashir: "रक्ष्य" }),
  verb({ id: "tyaj", root: "त्यज्", translit: "tyaj", meaning: "to give up / to leave", english: ["give up", "give up", "gives up"], ing: "giving up",
    stem: "त्यज", aug: "अत्यज", sya: "त्यक्ष्य", augSya: "अत्यक्ष्य", ta: "त्यक्ता", lit: ["तत्याज", "तत्यज", "तत्यजिथ"],
    lung: [["अत्याक्षीत्", "अत्याक्ताम्", "अत्याक्षुः"], ["अत्याक्षीः", "अत्याक्तम्", "अत्याक्त"], ["अत्याक्षम्", "अत्याक्ष्व", "अत्याक्ष्म"]], ashir: "त्यज्य" }),
  verb({ id: "is", root: "इष्", translit: "iṣ", meaning: "to wish / to want", english: ["want", "want", "wants"], ing: "wanting",
    stem: "इच्छ", aug: "ऐच्छ", sya: "एषिष्य", augSya: "ऐषिष्य", ta: "एषिता", lit: ["इयेष", "ईष", "इयेषिथ"], lung: { is: "ऐष" }, ashir: "इष्य" }),
  verb({ id: "ji", root: "जि", translit: "ji", meaning: "to win / to conquer", english: ["win", "win", "wins"], ing: "winning",
    stem: "जय", aug: "अजय", sya: "जेष्य", augSya: "अजेष्य", ta: "जेता", lit: ["जिगाय", "जिग्य", "जिगयिथ"], lung: { s: "अजै" }, ashir: "जीय" }),
  verb({ id: "sru", root: "श्रु", translit: "śru", meaning: "to hear", english: ["hear", "hear", "hears"], ing: "hearing",
    sya: "श्रोष्य", augSya: "अश्रोष्य", ta: "श्रोता",
    lit: [["शुश्राव", "शुश्रुवतुः", "शुश्रुवुः"], ["शुश्रोथ", "शुश्रुवथुः", "शुश्रुव"], ["शुश्राव", "शुश्रुव", "शुश्रुम"]],
    lung: { s: "अश्रौ" }, ashir: "श्रूय",
    present: {
      lat: [["शृणोति", "शृणुतः", "शृण्वन्ति"], ["शृणोषि", "शृणुथः", "शृणुथ"], ["शृणोमि", "शृणुवः", "शृणुमः"]],
      lang: [["अशृणोत्", "अशृणुताम्", "अशृण्वन्"], ["अशृणोः", "अशृणुतम्", "अशृणुत"], ["अशृणवम्", "अशृणुव", "अशृणुम"]],
      lot: [["शृणोतु", "शृणुताम्", "शृण्वन्तु"], ["शृणु", "शृणुतम्", "शृणुत"], ["शृणवानि", "शृणवाव", "शृणवाम"]],
      vidhiling: [["शृणुयात्", "शृणुयाताम्", "शृणुयुः"], ["शृणुयाः", "शृणुयातम्", "शृणुयात"], ["शृणुयाम्", "शृणुयाव", "शृणुयाम"]],
    } }),
  verb({ id: "da", root: "दा", translit: "dā", meaning: "to give", english: ["give", "give", "gives"], ing: "giving",
    sya: "दास्य", augSya: "अदास्य", ta: "दाता",
    lit: [["ददौ", "ददतुः", "ददुः"], ["ददिथ", "ददथुः", "दद"], ["ददौ", "ददिव", "ददिम"]],
    lung: [["अदात्", "अदाताम्", "अदुः"], ["अदाः", "अदातम्", "अदात"], ["अदाम्", "अदाव", "अदाम"]], ashir: "देय",
    present: {
      lat: [["ददाति", "दत्तः", "ददति"], ["ददासि", "दत्थः", "दत्थ"], ["ददामि", "दद्वः", "दद्मः"]],
      lang: [["अददात्", "अदत्ताम्", "अददुः"], ["अददाः", "अदत्तम्", "अदत्त"], ["अददाम्", "अदद्व", "अदद्म"]],
      lot: [["ददातु", "दत्ताम्", "ददतु"], ["देहि", "दत्तम्", "दत्त"], ["ददानि", "ददाव", "ददाम"]],
      vidhiling: [["दद्यात्", "दद्याताम्", "दद्युः"], ["दद्याः", "दद्यातम्", "दद्यात"], ["दद्याम्", "दद्याव", "दद्याम"]],
    } }),
  verb({ id: "kath", root: "कथ्", translit: "kath", meaning: "to tell / to narrate", english: ["tell", "tell", "tells"], ing: "telling",
    stem: "कथय", aug: "अकथय", sya: "कथयिष्य", augSya: "अकथयिष्य", ta: "कथयिता",
    lit: [["कथयामास", "कथयामासतुः", "कथयामासुः"], ["कथयामासिथ", "कथयामासथुः", "कथयामास"], ["कथयामास", "कथयामासिव", "कथयामासिम"]],
    lung: { a: "अचकथ" }, ashir: "कथ्य" }),
  verb({ id: "puj", root: "पूज्", translit: "pūj", meaning: "to worship", english: ["worship", "worship", "worships"], ing: "worshipping",
    stem: "पूजय", aug: "अपूजय", sya: "पूजयिष्य", augSya: "अपूजयिष्य", ta: "पूजयिता",
    lit: [["पूजयामास", "पूजयामासतुः", "पूजयामासुः"], ["पूजयामासिथ", "पूजयामासथुः", "पूजयामास"], ["पूजयामास", "पूजयामासिव", "पूजयामासिम"]],
    lung: { a: "अपूपुज" }, ashir: "पूज्य" }),
];

// ---------------------------------------------------------------- sentences

// A subject: Devanagari (before a consonant, before a vowel), English, and which form it takes.
export type Subject = {
  deva: [string, string];
  en: string; // "He", "The boy"
  obj: string; // "him", "the boy" — for "Let … read."
  person: number; // index into forms: 0 = 3rd, 1 = 2nd, 2 = 1st
  number: number; // 0 sg, 1 du, 2 pl
  english: 0 | 1 | 2; // which English form: after "I" / "we, you, they" / "he, she, it"
  note?: string;
};

// The document's fifteen example subjects: every person and number, then every gender of the 3rd person.
export const subjects: Subject[] = [
  { deva: ["अहं", "अहम्"], en: "I", obj: "me", person: 2, number: 0, english: 0 },
  { deva: ["आवां", "आवाम्"], en: "We two", obj: "us two", person: 2, number: 1, english: 1 },
  { deva: ["वयं", "वयम्"], en: "We all", obj: "us all", person: 2, number: 2, english: 1 },
  { deva: ["त्वं", "त्वम्"], en: "You", obj: "you", person: 1, number: 0, english: 1 },
  { deva: ["युवां", "युवाम्"], en: "You two", obj: "you two", person: 1, number: 1, english: 1 },
  { deva: ["यूयं", "यूयम्"], en: "You all", obj: "you all", person: 1, number: 2, english: 1 },
  { deva: ["सः", "सः"], en: "He", obj: "him", person: 0, number: 0, english: 2, note: "पुल्लिङ्ग - एकवचनम्" },
  { deva: ["तौ", "तौ"], en: "Those two", obj: "those two", person: 0, number: 1, english: 1, note: "पुल्लिङ्ग - द्विवचनम्" },
  { deva: ["ते", "ते"], en: "They", obj: "them", person: 0, number: 2, english: 1, note: "पुल्लिङ्ग - बहुवचनम्" },
  { deva: ["सा", "सा"], en: "She", obj: "her", person: 0, number: 0, english: 2, note: "स्त्रीलिङ्ग - एकवचनम्" },
  { deva: ["ते", "ते"], en: "Those two", obj: "those two", person: 0, number: 1, english: 1, note: "स्त्रीलिङ्ग - द्विवचनम्" },
  { deva: ["ताः", "ताः"], en: "They", obj: "them", person: 0, number: 2, english: 1, note: "स्त्रीलिङ्ग - बहुवचनम्" },
  { deva: ["तत्", "तत्"], en: "It", obj: "it", person: 0, number: 0, english: 2, note: "नपुंसकलिङ्ग - एकवचनम्" },
  { deva: ["ते", "ते"], en: "Those two", obj: "those two", person: 0, number: 1, english: 1, note: "नपुंसकलिङ्ग - द्विवचनम्" },
  { deva: ["तानि", "तानि"], en: "They", obj: "them", person: 0, number: 2, english: 1, note: "नपुंसकलिङ्ग - बहुवचनम्" },
];

// Nouns for the sentence quiz.
const noun = (deva: string, en: string, number: number, english: 1 | 2 = 2): Subject => ({
  deva: [deva, deva], en: `The ${en}`, obj: `the ${en}`, person: 0, number, english,
});
export const nounSubjects: Subject[] = [
  noun("बालकः", "boy", 0),
  noun("बालकौ", "two boys", 1, 1),
  noun("बालकाः", "boys", 2, 1),
  noun("बालिका", "girl", 0),
  noun("बालिकाः", "girls", 2, 1),
  noun("शिष्यः", "student", 0),
  noun("शिष्याः", "students", 2, 1),
  noun("गुरुः", "teacher", 0),
  noun("मित्रम्", "friend", 0),
  { deva: ["रामः", "रामः"], en: "Rama", obj: "Rama", person: 0, number: 0, english: 2 },
  { deva: ["सीता", "सीता"], en: "Sita", obj: "Sita", person: 0, number: 0, english: 2 },
];

// The subjects whose English is unambiguous (one pronoun per English "they"), for the quiz.
export const quizSubjects: Subject[] = [
  ...subjects.filter((s) => !s.note || s.note.startsWith("पुल्लिङ्ग") || s.deva[0] === "सा"),
  ...nounSubjects,
];

// The lakaras the sentences can be glossed in English.
export const sentenceLakaras: LakaraId[] = ["lat", "lrt", "lang", "lot", "vidhiling"];

export type Sentence = { deva: string; translit: string; meaning: string; note?: string; person: number };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function sentence(verb: Verb, lakara: LakaraId, s: Subject): Sentence | null {
  const forms = verb.forms[lakara];
  if (!forms) return null;
  const form = forms[s.person][s.number];
  // अहं before a consonant, अहम् before a vowel (अहम् अस्मि).
  const subject = s.deva[/^[अ-औ]/.test(form) ? 1 : 0];
  const deva = `${subject} ${form}।`;
  const base = verb.base ?? verb.english[1];
  let meaning: string;
  switch (lakara) {
    case "lat":
      meaning = `${s.en} ${verb.english[s.english]}.`;
      break;
    case "lrt":
      meaning = `${s.en} will ${base}.`;
      break;
    case "lang":
      meaning = verb.past
        ? `${s.en} ${verb.past[s.english]}.`
        : `${s.en} ${s.english === 1 ? "were" : "was"} ${verb.ing}.`;
      break;
    case "lot":
      meaning = s.person === 1 ? `(${s.en}) ${base}!` : `Let ${s.obj} ${base}.`;
      break;
    case "vidhiling":
      meaning = `${s.en} should ${base}.`;
      break;
    default:
      return null;
  }
  return { deva, translit: toIAST(deva), meaning: cap(meaning), note: s.note, person: s.person };
}

// Example sentences for a verb in a lakara: the document's fifteen subjects.
export function verbExamples(verb: Verb, lakara: LakaraId): Sentence[] {
  return subjects.map((s) => sentence(verb, lakara, s)).filter((x): x is Sentence => x !== null);
}
