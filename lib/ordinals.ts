// Ordinal numbers (पूरणसङ्ख्याः), 1st–100th and 1000th, from the owner's Ordinal Numbers document.
// Each ordinal has one or more stems; masculine adds -ः, neuter -म्, and the feminine is -ा or -ी as the document gives.

import { toIAST } from "./iast";

export type Ordinal = {
  n: number;
  label: string; // "1st"
  english: string; // "first"
  stems: string[]; // "प्रथम", or "विंश" and "विंशतितम"
  masculine: string; // "प्रथमः", alternatives joined with " / "
  feminine: string;
  neuter: string;
  stem: string;
  translit: string; // of the masculine
};

// Feminine: -ā for 1–3 and every -तम stem, तुरीया / तुर्या for 4, -ī for the rest (पञ्चमी, विंशी, एकषष्टी …).
const feminine = (stem: string, n: number) => {
  // सप्तम (7th) also ends in तम, so the -तम rule only applies from 20th on.
  if (n <= 3 || (n >= 20 && stem.endsWith("तम")) || stem === "तुरीय" || stem === "तुर्य") return stem + "ा";
  return stem + "ी";
};

const ones = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];
const teens = ["tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
const tensCardinal = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const tensOrdinal = ["", "", "twentieth", "thirtieth", "fortieth", "fiftieth", "sixtieth", "seventieth", "eightieth", "ninetieth"];

function englishOrdinal(n: number): string {
  if (n === 1000) return "thousandth";
  if (n === 100) return "hundredth";
  if (n < 10) return ones[n - 1];
  if (n < 20) return teens[n - 10];
  const t = Math.floor(n / 10), o = n % 10;
  return o === 0 ? tensOrdinal[t] : `${tensCardinal[t]}-${ones[o - 1]}`;
}

function suffix(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}

// Stems, in the document's order and spelling (including its spaces in षट् षष्टः and षट् सप्ततः).
const stemsFor: string[][] = [
  ["प्रथम"], ["द्वितीय"], ["तृतीय"], ["चतुर्थ", "तुरीय", "तुर्य"], ["पञ्चम"], ["षष्ठ"], ["सप्तम"], ["अष्टम"], ["नवम"], ["दशम"],
  ["एकादश"], ["द्वादश"], ["त्रयोदश"], ["चतुर्दश"], ["पञ्चदश"], ["षोडश"], ["सप्तदश"], ["अष्टादश"], ["नवदश", "ऊनविंश"],
];

// 20–99: the short stem (विंश) and the -तम stem (विंशतितम). 60, 70, 80 and 90 have only the -तम stem.
const decades: { short: string; tama: string; prefixes: string[]; onlyTama?: boolean }[] = [
  { short: "विंश", tama: "विंशतितम", prefixes: ["", "एक", "द्वा", "त्रयो", "चतुर्", "पञ्च", "षड्", "सप्त", "अष्टा", "नव"] },
  { short: "त्रिंश", tama: "त्रिंशत्तम", prefixes: ["", "एक", "द्वा", "त्रयस्", "चतुस्", "पञ्च", "षट्", "सप्त", "अष्टा", "नव"] },
  { short: "चत्वारिंश", tama: "चत्वारिंशत्तम", prefixes: ["", "एक", "द्वि", "त्रि", "चतुश्", "पञ्च", "षट्", "सप्त", "अष्ट", "नव"] },
  { short: "पञ्चाश", tama: "पञ्चाशत्तम", prefixes: ["", "एक", "द्वि", "त्रि", "चतुष्", "पञ्च", "षट्", "सप्त", "अष्ट", "नव"] },
  { short: "षष्ट", tama: "षष्टितम", prefixes: ["", "एक", "द्वि", "त्रि", "चतुः", "पञ्च", "षट् ", "सप्त", "अष्ट", "नव"] },
  { short: "सप्तत", tama: "सप्ततितम", prefixes: ["", "एक", "द्वि", "त्रि", "चतुः", "पञ्च", "षट् ", "सप्त", "अष्ट", "नव"] },
  { short: "शीत", tama: "शीतितम", prefixes: ["अ", "एका", "द्व्य", "त्र्य", "चतुर", "पञ्चा", "षड", "सप्ता", "अष्टा", "नवा"] },
  { short: "नवत", tama: "नवतितम", prefixes: ["", "एक", "द्वि", "त्रि", "चतुर्", "पञ्च", "षण्ण", "सप्त", "अष्टा", "नव"] },
];

decades.forEach((d, i) => {
  d.prefixes.forEach((p, o) => {
    const decade = 20 + i * 10;
    // षण्णवति: the न of नवति is part of the sandhi (षण्ण + वत), so the stem joins without repeating it.
    const join = (base: string) => (p === "षण्ण" ? p + base.slice(1) : p + base);
    if (o === 0 && decade >= 60) stemsFor.push([join(d.tama)]);
    else stemsFor.push([join(d.short), join(d.tama)]);
  });
});
stemsFor.push(["शततम"]); // 100th

const build = (n: number, stems: string[]): Ordinal => {
  const masculine = stems.map((s) => s + "ः").join(" / ");
  return {
    n,
    label: `${n}${suffix(n)}`,
    english: englishOrdinal(n),
    stems,
    masculine,
    feminine: stems.map((s) => feminine(s, n)).join(" / "),
    neuter: stems.map((s) => s + "म्").join(" / "),
    stem: stems.join(" / "),
    translit: toIAST(masculine),
  };
};

export const ordinals: Ordinal[] = [...stemsFor.map((stems, i) => build(i + 1, stems)), build(1000, ["सहस्रतम"])];
