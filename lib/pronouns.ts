// Pronouns (सर्वनामानि), from the owner's "Sarvanam sabd" document: every pronoun it lists,
// declined in the seven cases (प्रथमा … सप्तमी) and three numbers, grouped in the document's five sections.
// Where a case has two forms (माम् / मा, एतम् / एनम्) the cell holds both, as General Update_2 asked.

export type Gender = "m" | "f" | "n";
// Seven cases, each [singular, dual, plural]. "—" marks a number the word isn't used in.
export type CaseForms = [string, string, string][];

export type PronounTable = { gender?: Gender; forms: CaseForms };

export type Pronoun = {
  id: string;
  stem: string;
  translit: string;
  meaning: string;
  section: SectionId;
  note?: string;
  tables: PronounTable[]; // one table, or masculine / feminine / neuter
};

export type SectionId = "personal" | "demonstrative" | "interrogative" | "relative" | "adjectives";

export const pronounSections: { id: SectionId; title: string; sanskrit: string; note?: string }[] = [
  {
    id: "personal",
    title: "Personal Pronouns (First and Second Person)",
    sanskrit: "पुरुषवाचकसर्वनामानि",
    note: "These pronouns have no gender distinction (the same form applies whether masculine, feminine, or neuter).",
  },
  { id: "demonstrative", title: "Third-Person & Demonstrative Pronouns", sanskrit: "निर्देशकसर्वनामानि" },
  {
    id: "interrogative",
    title: "Interrogative Pronouns",
    sanskrit: "प्रश्नवाचकसर्वनामानि",
    note: "Used to ask questions (derived from the root किम् / क- · kim / ka-).",
  },
  {
    id: "relative",
    title: "Relative Pronouns",
    sanskrit: "सम्बन्धवाचकसर्वनामानि",
    note: "Used to link clauses, built on the root यद् (yad · who / which). Correlative pairs often work together in sentences (e.g., yaḥ … saḥ — “he who … that person”).",
  },
  { id: "adjectives", title: "Pronominal Adjectives (Sarvanāmāni)", sanskrit: "सर्वनामविशेषणानि" },
];

export const genderNames: Record<Gender, string> = { m: "Masculine · पुंलिङ्गम्", f: "Feminine · स्त्रीलिङ्गम्", n: "Neuter · नपुंसकलिङ्गम्" };

// Builds the masculine and neuter tables of a pronoun that differ only in the nominative and accusative.
const neuterOf = (masc: CaseForms, nom: [string, string, string], acc = nom): CaseForms => [nom, acc, ...masc.slice(2)];

const tadM: CaseForms = [
  ["सः", "तौ", "ते"],
  ["तम्", "तौ", "तान्"],
  ["तेन", "ताभ्याम्", "तैः"],
  ["तस्मै", "ताभ्याम्", "तेभ्यः"],
  ["तस्मात्", "ताभ्याम्", "तेभ्यः"],
  ["तस्य", "तयोः", "तेषाम्"],
  ["तस्मिन्", "तयोः", "तेषु"],
];
const tadF: CaseForms = [
  ["सा", "ते", "ताः"],
  ["ताम्", "ते", "ताः"],
  ["तया", "ताभ्याम्", "ताभिः"],
  ["तस्यै", "ताभ्याम्", "ताभ्यः"],
  ["तस्याः", "ताभ्याम्", "ताभ्यः"],
  ["तस्याः", "तयोः", "तासाम्"],
  ["तस्याम्", "तयोः", "तासु"],
];

const etadM: CaseForms = [
  ["एषः", "एतौ", "एते"],
  ["एतम् / एनम्", "एतौ / एनौ", "एतान् / एनान्"],
  ["एतेन / एनेन", "एताभ्याम्", "एतैः"],
  ["एतस्मै", "एताभ्याम्", "एतेभ्यः"],
  ["एतस्मात्", "एताभ्याम्", "एतेभ्यः"],
  ["एतस्य", "एतयोः / एनयोः", "एतेषाम्"],
  ["एतस्मिन्", "एतयोः / एनयोः", "एतेषु"],
];
const etadF: CaseForms = [
  ["एषा", "एते", "एताः"],
  ["एताम् / एनाम्", "एते / एने", "एताः / एनाः"],
  ["एतया / एनया", "एताभ्याम्", "एताभिः"],
  ["एतस्यै", "एताभ्याम्", "एताभ्यः"],
  ["एतस्याः", "एताभ्याम्", "एताभ्यः"],
  ["एतस्याः", "एतयोः / एनयोः", "एतासाम्"],
  ["एतस्याम्", "एतयोः / एनयोः", "एतासु"],
];

const idamM: CaseForms = [
  ["अयम्", "इमौ", "इमे"],
  ["इमम् / एनम्", "इमौ / एनौ", "इमान् / एनान्"],
  ["अनेन / एनेन", "आभ्याम्", "एभिः"],
  ["अस्मै", "आभ्याम्", "एभ्यः"],
  ["अस्मात्", "आभ्याम्", "एभ्यः"],
  ["अस्य", "अनयोः / एनयोः", "एषाम्"],
  ["अस्मिन्", "अनयोः / एनयोः", "एषु"],
];
const idamF: CaseForms = [
  ["इयम्", "इमे", "इमाः"],
  ["इमाम् / एनाम्", "इमे / एने", "इमाः / एनाः"],
  ["अनया / एनया", "आभ्याम्", "आभिः"],
  ["अस्यै", "आभ्याम्", "आभ्यः"],
  ["अस्याः", "आभ्याम्", "आभ्यः"],
  ["अस्याः", "अनयोः / एनयोः", "आसाम्"],
  ["अस्याम्", "अनयोः / एनयोः", "आसु"],
];

const adasM: CaseForms = [
  ["असौ", "अमू", "अमी"],
  ["अमुम्", "अमू", "अमून्"],
  ["अमुना", "अमूभ्याम्", "अमीभिः"],
  ["अमुष्मै", "अमूभ्याम्", "अमीभ्यः"],
  ["अमुष्मात्", "अमूभ्याम्", "अमीभ्यः"],
  ["अमुष्य", "अमुयोः", "अमीषाम्"],
  ["अमुष्मिन्", "अमुयोः", "अमीषु"],
];
const adasF: CaseForms = [
  ["असौ", "अमू", "अमूः"],
  ["अमूम्", "अमू", "अमूः"],
  ["अमुया", "अमूभ्याम्", "अमूभिः"],
  ["अमुष्यै", "अमूभ्याम्", "अमूभ्यः"],
  ["अमुष्याः", "अमूभ्याम्", "अमूभ्यः"],
  ["अमुष्याः", "अमुयोः", "अमूषाम्"],
  ["अमुष्याम्", "अमुयोः", "अमूषु"],
];

// किम्, यद्, सर्व and अन्य follow the same pronominal pattern from their stems.
const pronominalM = (s: string, instr: string): CaseForms => [
  [s + "ः", s + "ौ", s + "े"],
  [s + "म्", s + "ौ", s + "ान्"],
  [instr, s + "ाभ्याम्", s + "ैः"],
  [s + "स्मै", s + "ाभ्याम्", s + "ेभ्यः"],
  [s + "स्मात्", s + "ाभ्याम्", s + "ेभ्यः"],
  [s + "स्य", s + "योः", s + "ेषाम्"],
  [s + "स्मिन्", s + "योः", s + "ेषु"],
];
const pronominalF = (s: string): CaseForms => [
  [s + "ा", s + "े", s + "ाः"],
  [s + "ाम्", s + "े", s + "ाः"],
  [s + "या", s + "ाभ्याम्", s + "ाभिः"],
  [s + "स्यै", s + "ाभ्याम्", s + "ाभ्यः"],
  [s + "स्याः", s + "ाभ्याम्", s + "ाभ्यः"],
  [s + "स्याः", s + "योः", s + "ासाम्"],
  [s + "स्याम्", s + "योः", s + "ासु"],
];

const kimM = pronominalM("क", "केन");
const yadM = pronominalM("य", "येन");
const sarvaM = pronominalM("सर्व", "सर्वेण");
const anyaM = pronominalM("अन्य", "अन्येन");

// एक is used in the singular only; उभय has no dual.
const singularOnly = (t: CaseForms): CaseForms => t.map(([sg]) => [sg, "—", "—"]);
const noDual = (t: CaseForms): CaseForms => t.map(([sg, , pl]) => [sg, "—", pl]);
const ekaM = singularOnly(pronominalM("एक", "एकेन"));
const ubhayaM = noDual(pronominalM("उभय", "उभयेन"));

export const pronounList: Pronoun[] = [
  {
    id: "asmad",
    stem: "अस्मद्",
    translit: "asmad",
    meaning: "I / We",
    section: "personal",
    note: "First person.",
    tables: [
      {
        forms: [
          ["अहम्", "आवाम्", "वयम्"],
          ["माम् / मा", "आवाम् / नौ", "अस्मान् / नः"],
          ["मया", "आवाभ्याम्", "अस्माभिः"],
          ["मह्यम् / मे", "आवाभ्याम् / नौ", "अस्मभ्यम् / नः"],
          ["मत् / मत्तः", "आवाभ्याम्", "अस्मत् / अस्मत्तः"],
          ["मम / मे", "आवयोः / नौ", "अस्माकम् / नः"],
          ["मयि", "आवयोः", "अस्मासु"],
        ],
      },
    ],
  },
  {
    id: "yusmad",
    stem: "युष्मद्",
    translit: "yuṣmad",
    meaning: "You",
    section: "personal",
    note: "Second person.",
    tables: [
      {
        forms: [
          ["त्वम्", "युवाम्", "यूयम्"],
          ["त्वाम् / त्वा", "युवाम् / वाम्", "युष्मान् / वः"],
          ["त्वया", "युवाभ्याम्", "युष्माभिः"],
          ["तुभ्यम् / ते", "युवाभ्याम् / वाम्", "युष्मभ्यम् / वः"],
          ["त्वत् / त्वत्तः", "युवाभ्याम्", "युष्मत् / युष्मत्तः"],
          ["तव / ते", "युवयोः / वाम्", "युष्माकम् / वः"],
          ["त्वयि", "युवयोः", "युष्मासु"],
        ],
      },
    ],
  },
  {
    id: "tad",
    stem: "तद्",
    translit: "tad",
    meaning: "That / He, She, It (distal, third person)",
    section: "demonstrative",
    note: "These indicate objects or persons that are distal (far), and change according to gender, number, and case.",
    tables: [
      { gender: "m", forms: tadM },
      { gender: "f", forms: tadF },
      { gender: "n", forms: neuterOf(tadM, ["तत्", "ते", "तानि"]) },
    ],
  },
  {
    id: "etad",
    stem: "एतद्",
    translit: "etad",
    meaning: "This (proximal)",
    section: "demonstrative",
    note: "These indicate objects or persons that are proximal (near), and change according to gender, number, and case.",
    tables: [
      { gender: "m", forms: etadM },
      { gender: "f", forms: etadF },
      { gender: "n", forms: neuterOf(etadM, ["एतत्", "एते", "एतानि"], ["एतत् / एनत्", "एते / एने", "एतानि / एनानि"]) },
    ],
  },
  {
    id: "idam",
    stem: "इदम्",
    translit: "idam",
    meaning: "This / Here (immediate proximal)",
    section: "demonstrative",
    note: "These indicate objects or persons that are previously mentioned, and change according to gender, number, and case.",
    tables: [
      { gender: "m", forms: idamM },
      { gender: "f", forms: idamF },
      { gender: "n", forms: neuterOf(idamM, ["इदम्", "इमे", "इमानि"], ["इदम् / एनत्", "इमे / एने", "इमानि / एनानि"]) },
    ],
  },
  {
    id: "adas",
    stem: "अदस्",
    translit: "adas",
    meaning: "That yonder / Over there",
    section: "demonstrative",
    note: "It is used to refer to someone or something distant but visible (“that yonder” or “that over there”).",
    tables: [
      { gender: "m", forms: adasM },
      { gender: "f", forms: adasF },
      { gender: "n", forms: neuterOf(adasM, ["अदः", "अमू", "अमूनि"]) },
    ],
  },
  {
    id: "kim",
    stem: "किम्",
    translit: "kim",
    meaning: "Who? / What? / Which?",
    section: "interrogative",
    tables: [
      { gender: "m", forms: kimM },
      { gender: "f", forms: pronominalF("क") },
      { gender: "n", forms: neuterOf(kimM, ["किम्", "के", "कानि"]) },
    ],
  },
  {
    id: "yad",
    stem: "यद्",
    translit: "yad",
    meaning: "Who / Which (relative)",
    section: "relative",
    tables: [
      { gender: "m", forms: yadM },
      { gender: "f", forms: pronominalF("य") },
      { gender: "n", forms: neuterOf(yadM, ["यत्", "ये", "यानि"]) },
    ],
  },
  {
    id: "sarva",
    stem: "सर्व",
    translit: "sarva",
    meaning: "All / Every",
    section: "adjectives",
    tables: [
      { gender: "m", forms: sarvaM },
      { gender: "f", forms: pronominalF("सर्व") },
      { gender: "n", forms: neuterOf(sarvaM, ["सर्वम्", "सर्वे", "सर्वाणि"]) },
    ],
  },
  {
    id: "anya",
    stem: "अन्य",
    translit: "anya",
    meaning: "Other",
    section: "adjectives",
    tables: [
      { gender: "m", forms: anyaM },
      { gender: "f", forms: pronominalF("अन्य") },
      { gender: "n", forms: neuterOf(anyaM, ["अन्यत्", "अन्ये", "अन्यानि"]) },
    ],
  },
  {
    id: "eka",
    stem: "एक",
    translit: "eka",
    meaning: "One / Single",
    section: "adjectives",
    note: "एक is declined in the singular. (Its plural एके means “some”.)",
    tables: [
      { gender: "m", forms: ekaM },
      { gender: "f", forms: singularOnly(pronominalF("एक")) },
      { gender: "n", forms: neuterOf(ekaM, ["एकम्", "—", "—"]) },
    ],
  },
  {
    id: "ubhaya",
    stem: "उभय",
    translit: "ubhaya",
    meaning: "Both",
    section: "adjectives",
    note: "उभय has no dual; in the dual, उभ is used instead (उभौ, उभे). Its feminine is उभयी, declined like नदी.",
    tables: [
      { gender: "m", forms: ubhayaM },
      {
        gender: "f",
        forms: [
          ["उभयी", "—", "उभय्यः"],
          ["उभयीम्", "—", "उभयीः"],
          ["उभय्या", "—", "उभयीभिः"],
          ["उभय्यै", "—", "उभयीभ्यः"],
          ["उभय्याः", "—", "उभयीभ्यः"],
          ["उभय्याः", "—", "उभयीनाम्"],
          ["उभय्याम्", "—", "उभयीषु"],
        ],
      },
      { gender: "n", forms: neuterOf(ubhayaM, ["उभयम्", "—", "उभयानि"]) },
    ],
  },
];
