// Mock content for the app. No backend — everything lives here.

import { toIAST } from "./iast";

export type Letter = {
  id: string;
  deva: string;
  translit: string;
  sound: string; // English pronunciation hint
  example?: { deva: string; translit: string; meaning: string };
};

export type LetterGroup = { name: string; sanskrit: string; letters: Letter[] };

/** Flashcards show English with a capital first letter. */
export const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const L = (
  deva: string,
  translit: string,
  sound: string,
  example?: [string, string, string],
): Letter => ({
  id: `letter:${translit}`,
  deva,
  translit,
  sound,
  example: example && { deva: example[0], translit: example[1], meaning: capFirst(example[2]) },
});

export const vowels: LetterGroup[] = [
  {
    name: "Vowels",
    sanskrit: "स्वराः",
    letters: [
      L("अ", "a", "u in 'but'", ["अश्वः", "aśvaḥ", "horse"]),
      L("आ", "ā", "a in 'father'", ["आम्रम्", "āmram", "mango"]),
      L("इ", "i", "i in 'pin'", ["इक्षुः", "ikṣuḥ", "sugarcane"]),
      L("ई", "ī", "ee in 'feet'", ["ईशः", "īśaḥ", "lord"]),
      L("उ", "u", "u in 'put'", ["उलूकः", "ulūkaḥ", "owl"]),
      L("ऊ", "ū", "oo in 'pool'", ["ऊर्मिः", "ūrmiḥ", "wave"]),
      L("ऋ", "ṛ", "ri in 'rhythm' (vocalic r)", ["ऋषिः", "ṛṣiḥ", "sage"]),
      L("ॠ", "ṝ", "long vocalic r"),
      L("ऌ", "ḷ", "vocalic l, as in 'table'"),
      L("ए", "e", "a in 'gate'", ["एकम्", "ekam", "one"]),
      L("ऐ", "ai", "ai in 'aisle'", ["ऐरावतः", "airāvataḥ", "Indra's elephant"]),
      L("ओ", "o", "o in 'go'", ["ओष्ठः", "oṣṭhaḥ", "lip"]),
      L("औ", "au", "ow in 'cow'", ["औषधम्", "auṣadham", "medicine"]),
    ],
  },
];

// Anusvāra and visarga: not vowels (the owner's General Update_1 removed them from the vowels).
export const ayogavahas: LetterGroup[] = [
  {
    name: "Anusvāra & visarga",
    sanskrit: "अयोगवाहौ",
    letters: [
      L("अं", "aṃ", "nasal hum (anusvāra)", ["अंशः", "aṃśaḥ", "portion"]),
      L("अः", "aḥ", "breathy echo (visarga)", ["दुःखम्", "duḥkham", "sorrow"]),
    ],
  },
];

export const consonants: LetterGroup[] = [
  {
    name: "Ka-varga",
    sanskrit: "कवर्गः",
    letters: [
      L("क", "ka", "k in 'skin'", ["कमलम्", "kamalam", "lotus"]),
      L("ख", "kha", "k in 'kite' (aspirated)", ["खगः", "khagaḥ", "bird"]),
      L("ग", "ga", "g in 'go'", ["गजः", "gajaḥ", "elephant"]),
      L("घ", "gha", "g-h in 'log-house'", ["घटः", "ghaṭaḥ", "pot"]),
      L("ङ", "ṅa", "ng in 'sing'"),
    ],
  },
  {
    name: "Ca-varga",
    sanskrit: "चवर्गः",
    letters: [
      L("च", "ca", "ch in 'chunk'", ["चन्द्रः", "candraḥ", "moon"]),
      L("छ", "cha", "ch-h in 'church-hill'", ["छत्रम्", "chatram", "umbrella"]),
      L("ज", "ja", "j in 'jug'", ["जलम्", "jalam", "water"]),
      L("झ", "jha", "dge-h in 'hedgehog'", ["झषः", "jhaṣaḥ", "fish"]),
      L("ञ", "ña", "ny in 'canyon'"),
    ],
  },
  {
    name: "Ṭa-varga",
    sanskrit: "टवर्गः",
    letters: [
      L("ट", "ṭa", "t with tongue curled back"),
      L("ठ", "ṭha", "aspirated ṭ"),
      L("ड", "ḍa", "d with tongue curled back", ["डमरुः", "ḍamaruḥ", "small drum"]),
      L("ढ", "ḍha", "aspirated ḍ", ["ढक्का", "ḍhakkā", "large drum"]),
      L("ण", "ṇa", "n with tongue curled back"),
    ],
  },
  {
    name: "Ta-varga",
    sanskrit: "तवर्गः",
    letters: [
      L("त", "ta", "t with tongue on teeth", ["तरुः", "taruḥ", "tree"]),
      L("थ", "tha", "aspirated t (not 'th' in 'thin')"),
      L("द", "da", "d with tongue on teeth", ["दीपः", "dīpaḥ", "lamp"]),
      L("ध", "dha", "aspirated d", ["धनुः", "dhanuḥ", "bow"]),
      L("न", "na", "n in 'name'", ["नदी", "nadī", "river"]),
    ],
  },
  {
    name: "Pa-varga",
    sanskrit: "पवर्गः",
    letters: [
      L("प", "pa", "p in 'spin'", ["पुष्पम्", "puṣpam", "flower"]),
      L("फ", "pha", "p in 'pot' (aspirated)", ["फलम्", "phalam", "fruit"]),
      L("ब", "ba", "b in 'bat'", ["बालकः", "bālakaḥ", "boy"]),
      L("भ", "bha", "b-h in 'abhor'", ["भवनम्", "bhavanam", "building"]),
      L("म", "ma", "m in 'mother'", ["मयूरः", "mayūraḥ", "peacock"]),
    ],
  },
  {
    name: "Semivowels",
    sanskrit: "अन्तःस्थ",
    letters: [
      L("य", "ya", "y in 'yes'", ["यानम्", "yānam", "vehicle"]),
      L("र", "ra", "lightly tapped r", ["रथः", "rathaḥ", "chariot"]),
      L("ल", "la", "l in 'love'", ["लता", "latā", "creeper"]),
      L("व", "va", "between v and w", ["वनम्", "vanam", "forest"]),
    ],
  },
  {
    name: "Sibilants",
    sanskrit: "ऊष्म",
    letters: [
      L("श", "śa", "sh in 'shut'", ["शशः", "śaśaḥ", "rabbit"]),
      L("ष", "ṣa", "sh with tongue curled back", ["षट्", "ṣaṭ", "six"]),
      L("स", "sa", "s in 'sun'", ["सूर्यः", "sūryaḥ", "sun"]),
      L("ह", "ha", "h in 'hut'", ["हस्तः", "hastaḥ", "hand"]),
    ],
  },
];

export const allLetters: Letter[] = [...vowels, ...ayogavahas, ...consonants].flatMap(
  (g) => g.letters,
);

// ---------------------------------------------------------------- vocabulary

export type Word = {
  id: string;
  deva: string;
  translit: string;
  meaning: string;
  category: string;
  numeral?: string; // numbers only: "१ (1)"
  example?: string; // numbers 1–4: the gender example on the card back
};

export type Category = {
  slug: string;
  title: string;
  sanskrit: string;
  icon: string;
  words: Word[];
};

const cat = (
  slug: string,
  title: string,
  sanskrit: string,
  icon: string,
  rows: [string, string, string][],
): Category => ({
  slug,
  title,
  sanskrit,
  icon,
  words: rows.map(([deva, translit, meaning]) => ({
    id: `${slug}:${translit}`,
    deva,
    translit,
    meaning: capFirst(meaning),
    category: slug,
  })),
});

// Numbers 1–100 from the owner's P-2_Numbers document, in its order and spelling.
// 1–4 change with the gender of the noun (masculine / feminine / neuter); 5 onwards don't.
// Each of 1–4 gets its own example (masculine, feminine, neuter), as the Ordinal Numbers document asked.
// The gender note itself shows only under number 1 (General Update_2).
const genderExamples = [
  "एकः बालकः, एका बालिका, एकं फलम्",
  "द्वौ बालकौ, द्वे बालिके, द्वे फले",
  "त्रयः बालकाः, तिस्रः बालिकाः, त्रीणि फलानि",
  "चत्वारः बालकाः, चतस्रः बालिकाः, चत्वारि फलानि",
];
export const numberGenderNote =
  "The forms of Sanskrit numbers for 1–4 can vary according to the gender of the noun being counted. Numbers from 5 onwards there are no gender differences.";

const numberRows: [string, string, string][] = [
  ["एकः / एका / एकम्", "ekaḥ / ekā / ekam", "one"],
  ["द्वौ / द्वे / द्वे", "dvau / dve / dve", "two"],
  ["त्रयः / तिस्रः / त्रीणि", "trayaḥ / tisraḥ / trīṇi", "three"],
  ["चत्वारः / चतस्रः / चत्वारि", "catvāraḥ / catasraḥ / catvāri", "four"],
  ["पञ्च", "pañca", "five"],
  ["षट्", "ṣaṭ", "six"],
  ["सप्त", "sapta", "seven"],
  ["अष्ट", "aṣṭa", "eight"],
  ["नव", "nava", "nine"],
  ["दश", "daśa", "ten"],
  ["एकादश", "ekādaśa", "eleven"],
  ["द्वादश", "dvādaśa", "twelve"],
  ["त्रयोदश", "trayodaśa", "thirteen"],
  ["चतुर्दश", "caturdaśa", "fourteen"],
  ["पञ्चदश", "pañcadaśa", "fifteen"],
  ["षोडश", "ṣoḍaśa", "sixteen"],
  ["सप्तदश", "saptadaśa", "seventeen"],
  ["अष्टादश", "aṣṭādaśa", "eighteen"],
  ["नवदश / एकोनविंशतिः", "navadaśa / ekonaviṃśatiḥ", "nineteen"],
  ["विंशतिः", "viṃśatiḥ", "twenty"],
  ["एकविंशतिः", "ekaviṃśatiḥ", "twenty-one"],
  ["द्वाविंशतिः", "dvāviṃśatiḥ", "twenty-two"],
  ["त्रयोविंशतिः", "trayoviṃśatiḥ", "twenty-three"],
  ["चतुर्विंशतिः", "caturviṃśatiḥ", "twenty-four"],
  ["पञ्चविंशतिः", "pañcaviṃśatiḥ", "twenty-five"],
  ["षड् विंशतिः", "ṣaḍviṃśatiḥ", "twenty-six"],
  ["सप्तविंशतिः", "saptaviṃśatiḥ", "twenty-seven"],
  ["अष्टाविंशतिः", "aṣṭāviṃśatiḥ", "twenty-eight"],
  ["नवविंशतिः / एकोनत्रिंशत्", "navaviṃśatiḥ / ekonatriṃśat", "twenty-nine"],
  ["त्रिंशत्", "triṃśat", "thirty"],
  ["एकत्रिंशत्", "ekatriṃśat", "thirty-one"],
  ["द्वात्रिंशत्", "dvātriṃśat", "thirty-two"],
  ["त्रयस्त्रिंशत्", "trayastriṃśat", "thirty-three"],
  ["चतुस्त्रिंशत्", "catustriṃśat", "thirty-four"],
  ["पञ्चत्रिंशत्", "pañcatriṃśat", "thirty-five"],
  ["षट् त्रिंशत्", "ṣaṭtriṃśat", "thirty-six"],
  ["सप्तत्रिंशत्", "saptatriṃśat", "thirty-seven"],
  ["अष्टात्रिंशत्", "aṣṭātriṃśat", "thirty-eight"],
  ["नवत्रिंशत् / एकोनचत्वारिंशत्", "navatriṃśat / ekonacatvāriṃśat", "thirty-nine"],
  ["चत्वारिंशत्", "catvāriṃśat", "forty"],
  ["एकचत्वारिंशत्", "ekacatvāriṃśat", "forty-one"],
  ["द्विचत्वारिंशत्", "dvicatvāriṃśat", "forty-two"],
  ["त्रिचत्वारिंशत्", "tricatvāriṃśat", "forty-three"],
  ["चतुश्चत्वारिंशत्", "catuścatvāriṃśat", "forty-four"],
  ["पञ्चचत्वारिंशत्", "pañcacatvāriṃśat", "forty-five"],
  ["षट् चत्वारिंशत्", "ṣaṭcatvāriṃśat", "forty-six"],
  ["सप्तचत्वारिंशत्", "saptacatvāriṃśat", "forty-seven"],
  ["अष्टचत्वारिंशत्", "aṣṭacatvāriṃśat", "forty-eight"],
  ["नवचत्वारिंशत् / एकोनपञ्चाशत्", "navacatvāriṃśat / ekonapañcāśat", "forty-nine"],
  ["पञ्चाशत्", "pañcāśat", "fifty"],
  ["एकपञ्चाशत्", "ekapañcāśat", "fifty-one"],
  ["द्विपञ्चाशत्", "dvipañcāśat", "fifty-two"],
  ["त्रिपञ्चाशत्", "tripañcāśat", "fifty-three"],
  ["चतुष्पञ्चाशत्", "catuṣpañcāśat", "fifty-four"],
  ["पञ्चपञ्चाशत्", "pañcapañcāśat", "fifty-five"],
  ["षट् पञ्चाशत्", "ṣaṭpañcāśat", "fifty-six"],
  ["सप्तपञ्चाशत्", "saptapañcāśat", "fifty-seven"],
  ["अष्टपञ्चाशत्", "aṣṭapañcāśat", "fifty-eight"],
  ["नवपञ्चाशत् / एकोनषष्टिः", "navapañcāśat / ekonaṣaṣṭiḥ", "fifty-nine"],
  ["षष्टिः", "ṣaṣṭiḥ", "sixty"],
  ["एकषष्टिः", "ekaṣaṣṭiḥ", "sixty-one"],
  ["द्विषष्टिः", "dviṣaṣṭiḥ", "sixty-two"],
  ["त्रिषष्टिः", "triṣaṣṭiḥ", "sixty-three"],
  ["चतुःषष्टिः", "catuḥṣaṣṭiḥ", "sixty-four"],
  ["पञ्चषष्टिः", "pañcaṣaṣṭiḥ", "sixty-five"],
  ["षट् षष्टिः", "ṣaṭṣaṣṭiḥ", "sixty-six"],
  ["सप्तषष्टिः", "saptaṣaṣṭiḥ", "sixty-seven"],
  ["अष्टषष्टिः", "aṣṭaṣaṣṭiḥ", "sixty-eight"],
  ["नवषष्टिः / एकोनसप्ततिः", "navaṣaṣṭiḥ / ekonasaptatiḥ", "sixty-nine"],
  ["सप्ततिः", "saptatiḥ", "seventy"],
  ["एकसप्ततिः", "ekasaptatiḥ", "seventy-one"],
  ["द्विसप्ततिः", "dvisaptatiḥ", "seventy-two"],
  ["त्रिसप्ततिः", "trisaptatiḥ", "seventy-three"],
  ["चतुःसप्ततिः", "catuḥsaptatiḥ", "seventy-four"],
  ["पञ्चसप्ततिः", "pañcasaptatiḥ", "seventy-five"],
  ["षट् सप्ततिः", "ṣaṭsaptatiḥ", "seventy-six"],
  ["सप्तसप्ततिः", "saptasaptatiḥ", "seventy-seven"],
  ["अष्टसप्ततिः", "aṣṭasaptatiḥ", "seventy-eight"],
  ["नवसप्ततिः / एकोनाशीतिः", "navasaptatiḥ / ekonāśītiḥ", "seventy-nine"],
  ["अशीतिः", "aśītiḥ", "eighty"],
  ["एकाशीतिः", "ekāśītiḥ", "eighty-one"],
  ["द्व्यशीतिः", "dvyaśītiḥ", "eighty-two"],
  ["त्र्यशीतिः", "tryaśītiḥ", "eighty-three"],
  ["चतुरशीतिः", "caturaśītiḥ", "eighty-four"],
  ["पञ्चाशीतिः", "pañcāśītiḥ", "eighty-five"],
  ["षडशीतिः", "ṣaḍaśītiḥ", "eighty-six"],
  ["सप्ताशीतिः", "saptāśītiḥ", "eighty-seven"],
  ["अष्टाशीतिः", "aṣṭāśītiḥ", "eighty-eight"],
  ["नवाशीतिः / एकोननवतिः", "navāśītiḥ / ekonanavatiḥ", "eighty-nine"],
  ["नवतिः", "navatiḥ", "ninety"],
  ["एकनवतिः", "ekanavatiḥ", "ninety-one"],
  ["द्विनवतिः", "dvinavatiḥ", "ninety-two"],
  ["त्रिनवतिः", "trinavatiḥ", "ninety-three"],
  ["चतुर्नवतिः", "caturnavatiḥ", "ninety-four"],
  ["पञ्चनवतिः", "pañcanavatiḥ", "ninety-five"],
  ["षण्णवतिः", "ṣaṇṇavatiḥ", "ninety-six"],
  ["सप्तनवतिः", "saptanavatiḥ", "ninety-seven"],
  ["अष्टनवतिः", "aṣṭanavatiḥ", "ninety-eight"],
  ["नवनवतिः / एकोनशतम्", "navanavatiḥ / ekonaśatam", "ninety-nine"],
  ["शतम्", "śatam", "one hundred"],
];

export const toDevaDigits = (n: number) => String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)]);

const numbers: Category = {
  slug: "numbers",
  title: "Numbers",
  sanskrit: "सङ्ख्याः",
  icon: "🔢",
  words: numberRows.map(([deva, translit, meaning], i) => {
    const n = i + 1;
    return {
      id: `numbers:${n}`,
      deva,
      translit,
      meaning: capFirst(meaning),
      category: "numbers",
      numeral: `${toDevaDigits(n)} (${n})`,
      example: genderExamples[n - 1],
    };
  }),
};

// The names of the powers of ten, shown under the numbers. From Bhāskarācārya's Līlāvatī.
export type LargeNumber = { power: number; value: string; deva: string; translit: string; meaning: string };

const withCommas = (digits: string) => digits.replace(/\B(?=(\d{3})+$)/g, ",");

export const largeNumbers: {
  shloka: { deva: string[]; translit: string[] };
  intro: string;
  rows: LargeNumber[];
} = {
  shloka: {
    deva: [
      "एकदशशतसहस्रायुतलक्षप्रयुतकोटयः क्रमशः।",
      "अर्बुदम् न्यर्बुदम् खर्वं निखर्वं महापद्म शङ्कवस्तस्मात्॥",
      "जलधिश्चान्त्यं मध्यं परार्धमिति दशगुणोत्तराः संज्ञाः॥",
    ],
    translit: [
      "ekadaśaśatasahasrāyutalakṣaprayutakoṭayaḥ kramaśaḥ,",
      "arbudam nyarbudam kharvaṃ nikharvaṃ mahāpadma śaṅkavas tasmāt,",
      "jaladhiś cāntyaṃ madhyaṃ parārdham iti daśaguṇottarāḥ saṃjñāḥ.",
    ],
  },
  intro: "Based on this shloka composed by the 12th-century mathematician Bhaskaracharya, each name is ten times the one before it:",
  rows: (
    [
      ["दश", "daśa", "ten"],
      ["शतम्", "śatam", "hundred"],
      ["सहस्रम्", "sahasram", "thousand"],
      ["अयुतम्", "ayutam", "ten thousand"],
      ["लक्षम् / नियुतम्", "lakṣam / niyutam", "lakh / hundred thousand"],
      ["प्रयुतम्", "prayutam", "ten lakh / one million"],
      ["कोटिः", "koṭiḥ", "one crore / ten million"],
      ["अर्बुदम्", "arbudam", "ten crore / hundred million"],
      ["न्यर्बुदम्", "nyarbudam", "hundred crore / one billion"],
      ["खर्वम्", "kharvam", "thousand crore / ten billion"],
      ["निखर्वम्", "nikharvam", "ten thousand crore / hundred billion"],
      ["महापद्मम्", "mahāpadmam", "one lakh crore / one trillion"],
      ["शङ्कुः", "śaṅkuḥ", "ten lakh crore / ten trillion"],
      ["समुद्रः / जलधिः", "samudraḥ / jaladhiḥ", "one crore crore / hundred trillion"],
      ["अन्त्यम्", "antyam", "one quadrillion"],
      ["मध्यम्", "madhyam", "ten quadrillion"],
      ["परार्धम्", "parārdham", "hundred quadrillion"],
    ] as [string, string, string][]
  ).map(([deva, translit, meaning], i) => {
    const power = i + 1;
    return { power, value: withCommas("1" + "0".repeat(power)), deva, translit, meaning };
  }),
};

// The owner's General Update_2 table and list, merged without repeats and ordered by relation:
// parents, children, spouse, siblings, grandparents, grandchildren, uncles and aunts, nephews and nieces, in-laws, friend.
const familyRows: [string, string][] = [
  ["मातापितरौ / पितरौ", "Parents"],
  ["जननी / माता", "Mother"],
  ["जनकः / पिता", "Father"],
  ["विमाता", "Stepmother"],
  ["पुत्रः", "Son"],
  ["पुत्री", "Daughter"],
  ["पतिः / भर्ता / कान्तः", "Husband"],
  ["भार्या / पत्नी / दारा / कान्ता / कलत्रम्", "Wife"],
  ["भ्राता / सहोदरः", "Brother"],
  ["भगिनी / सहोदरी", "Sister"],
  ["अग्रजः / ज्येष्ठभ्राता", "Elder Brother"],
  ["अनुजः / कनिष्ठभ्राता", "Younger Brother"],
  ["अग्रजा / ज्येष्ठभगिनी", "Elder Sister"],
  ["अनुजा / कनिष्ठभगिनी", "Younger Sister"],
  ["पितामहः", "Grandfather (Father's father)"],
  ["पितामही", "Grandmother (Father's mother)"],
  ["मातामहः", "Maternal Grandfather (Mother's father)"],
  ["मातामही", "Maternal Grandmother (Mother's mother)"],
  ["प्रपितामहः", "Great Grandfather"],
  ["प्रपितामही", "Great Grandmother"],
  ["पौत्रः", "Grandson (Son's son)"],
  ["पौत्री", "Granddaughter (Son's daughter)"],
  ["दौहित्रः", "Grandson (Daughter's son)"],
  ["दौहित्री", "Granddaughter (Daughter's daughter)"],
  ["प्रपौत्रः", "Great Grandson"],
  ["प्रपौत्री", "Great Granddaughter"],
  ["पितृव्यः", "Uncle (Father's brother)"],
  ["पितृव्या", "Aunt (Father's brother's wife)"],
  ["पितृभगिनी / पितृष्वसा", "Aunt (Father's sister)"],
  ["मातुलः", "Maternal Uncle (Mother's brother)"],
  ["मातुलानी", "Maternal Aunt (Mother's brother's wife)"],
  ["मातृभगिनी / मातृष्वसा", "Aunt (Mother's sister)"],
  ["भागिनेयः", "Nephew (Sister's son)"],
  ["भागिनेया", "Niece (Sister's daughter)"],
  ["भ्रातृव्यः / भ्रातृपुत्रः", "Nephew (Brother's son)"],
  ["भ्रातृव्या / भ्रातृजा", "Niece (Brother's daughter)"],
  ["श्वशुरः", "Father-in-law"],
  ["श्वश्रूः", "Mother-in-law"],
  ["जामाता", "Son-in-law"],
  ["वधू / पुत्रवधूः / स्नुषा", "Daughter-in-law"],
  ["श्यालः", "Brother-in-law (Wife's brother)"],
  ["देवरः", "Brother-in-law (Husband's brother)"],
  ["आवुत्तः", "Brother-in-law (Sister's husband)"],
  ["ननान्दा", "Sister-in-law (Husband's sister)"],
  ["भ्रातृजाया", "Sister-in-law (Brother's wife)"],
  ["याता", "Sister-in-law (Husband's brother's wife)"],
  ["मित्रम् / स्नेहितः / सखा / सुहृद्", "Friend"],
];

const family = cat(
  "family",
  "Family",
  "परिवारः",
  "👪",
  familyRows.map(([deva, meaning]) => [deva, toIAST(deva), meaning]),
);

export const categories: Category[] = [
  cat("greetings", "Greetings", "अभिवादनम्", "🙏", [
    ["हरिः ॐ", "hariḥ oṃ", "hello"],
    ["सुप्रभातम्", "suprabhātam", "good morning"],
    ["नमस्काराः / नमस्ते / प्रणामाः", "namaskārāḥ / namaste / praṇāmāḥ", "salutations"],
    ["शुभरात्रिः", "śubharātriḥ", "good night"],
    ["धन्यवादाः", "dhanyavādāḥ", "thank you"],
    ["स्वागतम्", "svāgatam", "welcome"],
    ["कुशलम्", "kuśalam", "well / fine"],
  ]),
  cat("manners", "Good Manners", "शिष्टाचारः", "🤝", [
    ["क्षम्यताम्", "kṣamyatām", "excuse / pardon me"],
    ["चिन्ता मास्तु", "cintā māstu", "don't worry"],
    ["कृपया", "kṛpayā", "please"],
    ["पुनर्मिलामः", "punarmilāmaḥ", "let us meet again"],
    ["अस्तु", "astu", "all right / OK"],
    ["श्रीमन् / मान्यवर", "śrīman / mānyavara", "sir"],
    ["मान्ये / आर्ये", "mānye / ārye", "lady"],
    ["उत्तमम् / शोभनम्", "uttamam / śobhanam", "good"],
    ["साधु साधु / समीचीनम्", "sādhu sādhu / samīcīnam", "very good"],
    ["आगच्छन्तु", "āgacchantu", "come"],
    ["पुनः आगच्छन्तु", "punaḥ āgacchantu", "come again"],
    ["उपविशन्तु", "upaviśantu", "sit"],
    ["महान् आनन्दः", "mahān ānandaḥ", "very happy"],
  ]),
  numbers,
  family,
  cat("nature", "Nature", "प्रकृतिः", "🌿", [
    ["सूर्यः", "sūryaḥ", "sun"],
    ["चन्द्रः", "candraḥ", "moon"],
    ["जलम्", "jalam", "water"],
    ["अग्निः", "agniḥ", "fire"],
    ["वायुः", "vāyuḥ", "wind"],
    ["पृथ्वी", "pṛthvī", "earth"],
    ["आकाशः", "ākāśaḥ", "sky"],
    ["वृक्षः", "vṛkṣaḥ", "tree"],
    ["पुष्पम्", "puṣpam", "flower"],
    ["नदी", "nadī", "river"],
  ]),
  cat("animals", "Animals", "पशवः", "🐘", [
    ["गजः", "gajaḥ", "elephant"],
    ["अश्वः", "aśvaḥ", "horse"],
    ["सिंहः", "siṃhaḥ", "lion"],
    ["गौः", "gauḥ", "cow"],
    ["मार्जारः", "mārjāraḥ", "cat"],
    ["कुक्कुरः", "kukkuraḥ", "dog"],
    ["सर्पः", "sarpaḥ", "snake"],
    ["मत्स्यः", "matsyaḥ", "fish"],
    ["काकः", "kākaḥ", "crow"],
    ["वानरः", "vānaraḥ", "monkey"],
  ]),
  cat("body", "Body", "शरीरम्", "✋", [
    ["शिरः", "śiraḥ", "head"],
    ["नेत्रम्", "netram", "eye"],
    ["कर्णः", "karṇaḥ", "ear"],
    ["नासिका", "nāsikā", "nose"],
    ["मुखम्", "mukham", "mouth / face"],
    ["हस्तः", "hastaḥ", "hand"],
    ["पादः", "pādaḥ", "foot"],
    ["हृदयम्", "hṛdayam", "heart"],
  ]),
];

export const allWords: Word[] = categories.flatMap((c) => c.words);

// ---------------------------------------------------------------- grammar

export const cases = [
  { name: "Nominative", sanskrit: "प्रथमा", use: "subject — who does it" },
  { name: "Accusative", sanskrit: "द्वितीया", use: "object — whom / what" },
  { name: "Instrumental", sanskrit: "तृतीया", use: "by / with" },
  { name: "Dative", sanskrit: "चतुर्थी", use: "for / to" },
  { name: "Ablative", sanskrit: "पञ्चमी", use: "from" },
  { name: "Genitive", sanskrit: "षष्ठी", use: "of / 's" },
  { name: "Locative", sanskrit: "सप्तमी", use: "in / on / at" },
  { name: "Vocative", sanskrit: "सम्बोधनम्", use: "O …! (addressing)" },
];

export type Declension = {
  id: string;
  stem: string;
  translit: string;
  meaning: string;
  kind: string;
  forms: [string, string, string][]; // [singular, dual, plural] per case
};

export const declensions: Declension[] = [
  {
    id: "rama",
    stem: "राम",
    translit: "rāma",
    meaning: "Rama (name)",
    kind: "a-stem · masculine",
    forms: [
      ["रामः", "रामौ", "रामाः"],
      ["रामम्", "रामौ", "रामान्"],
      ["रामेण", "रामाभ्याम्", "रामैः"],
      ["रामाय", "रामाभ्याम्", "रामेभ्यः"],
      ["रामात्", "रामाभ्याम्", "रामेभ्यः"],
      ["रामस्य", "रामयोः", "रामाणाम्"],
      ["रामे", "रामयोः", "रामेषु"],
      ["हे राम", "हे रामौ", "हे रामाः"],
    ],
  },
  {
    id: "phala",
    stem: "फल",
    translit: "phala",
    meaning: "fruit",
    kind: "a-stem · neuter",
    forms: [
      ["फलम्", "फले", "फलानि"],
      ["फलम्", "फले", "फलानि"],
      ["फलेन", "फलाभ्याम्", "फलैः"],
      ["फलाय", "फलाभ्याम्", "फलेभ्यः"],
      ["फलात्", "फलाभ्याम्", "फलेभ्यः"],
      ["फलस्य", "फलयोः", "फलानाम्"],
      ["फले", "फलयोः", "फलेषु"],
      ["हे फल", "हे फले", "हे फलानि"],
    ],
  },
  {
    id: "lata",
    stem: "लता",
    translit: "latā",
    meaning: "creeper / vine",
    kind: "ā-stem · feminine",
    forms: [
      ["लता", "लते", "लताः"],
      ["लताम्", "लते", "लताः"],
      ["लतया", "लताभ्याम्", "लताभिः"],
      ["लतायै", "लताभ्याम्", "लताभ्यः"],
      ["लतायाः", "लताभ्याम्", "लताभ्यः"],
      ["लतायाः", "लतयोः", "लतानाम्"],
      ["लतायाम्", "लतयोः", "लतासु"],
      ["हे लते", "हे लते", "हे लताः"],
    ],
  },
];

// Verbs in all ten lakaras live in ./verbs.ts.
export { lakaras, basicLakaras, advancedLakaras, persons, verbs, verbExamples, sentence, quizSubjects, sentenceLakaras } from "./verbs";
export { ordinals, type Ordinal } from "./ordinals";
export { pronounList, pronounSections, genderNames, type Pronoun, type Gender } from "./pronouns";
export { allNouns, nounClasses, nounGenders, type NounClass, type NounGender, type NounWord } from "./nouns";
export { spokenGroups, spokenSentences, type SpokenGroup, type SpokenSentence } from "./spoken";
export type { Verb, Lakara, LakaraId, Forms, Sentence, Subject } from "./verbs";

// ---------------------------------------------------------------- phrases

export type Phrase = { deva: string; translit: string; meaning: string };

export const phrases: Phrase[] = [
  { deva: "भवतः नाम किम्?", translit: "bhavataḥ nāma kim?", meaning: "What is your name?" },
  { deva: "मम नाम अर्जुनः।", translit: "mama nāma arjunaḥ.", meaning: "My name is Arjuna." },
  { deva: "भवान् कथम् अस्ति?", translit: "bhavān katham asti?", meaning: "How are you?" },
  { deva: "अहं कुशली अस्मि।", translit: "ahaṃ kuśalī asmi.", meaning: "I am well." },
  { deva: "अहं संस्कृतं पठामि।", translit: "ahaṃ saṃskṛtaṃ paṭhāmi.", meaning: "I study Sanskrit." },
  { deva: "भवान् कुत्र गच्छति?", translit: "bhavān kutra gacchati?", meaning: "Where are you going?" },
  { deva: "अहं न जानामि।", translit: "ahaṃ na jānāmi.", meaning: "I don't know." },
  { deva: "पुनः वदतु।", translit: "punaḥ vadatu.", meaning: "Please say it again." },
  { deva: "जलं ददातु।", translit: "jalaṃ dadātu.", meaning: "Please give (me) water." },
  { deva: "बालकः फलं खादति।", translit: "bālakaḥ phalaṃ khādati.", meaning: "The boy eats a fruit." },
];

// Greeting sentences (अभिवादनानि). The quiz uses these as their own source.
export const greetingSentences: (Phrase & { id: string })[] = [
  ["हरिः ॐ। सुप्रभातम्।", "hariḥ oṃ. suprabhātam.", "Hari Om. Good morning."],
  ["नमस्ते, मान्यवर।", "namaste, mānyavara.", "Greetings, Sir."],
  ["नमस्ते, मान्ये।", "namaste, mānye.", "Greetings, Madam."],
  ["कुशलम्। धन्यवादाः।", "kuśalam. dhanyavādāḥ.", "Fine. Thank you."],
  ["स्वागतम्। आगच्छन्तु।", "svāgatam. āgacchantu.", "Welcome. Please come."],
  ["कृपया उपविशन्तु।", "kṛpayā upaviśantu.", "Please sit down."],
  ["क्षम्यताम्। चिन्ता मास्तु।", "kṣamyatām. cintā māstu.", "Excuse me. Don't worry."],
  ["साधु साधु। समीचीनम्।", "sādhu sādhu. samīcīnam.", "Very good. Excellent."],
  ["शोभनम्। समीचीनम्।", "śobhanam. samīcīnam.", "Good. Excellent."],
  ["धन्यवादाः। पुनर्मिलामः।", "dhanyavādāḥ. punarmilāmaḥ.", "Thank you. Let us meet again."],
  ["कृपया पुनः आगच्छन्तु।", "kṛpayā punaḥ āgacchantu.", "Please come again."],
  ["कृपया आगच्छन्तु, उपविशन्तु।", "kṛpayā āgacchantu, upaviśantu.", "Please come. Please sit down."],
  ["अस्तु। नमस्ते।", "astu. namaste.", "All right. Greetings."],
  ["शुभरात्रिः, मान्यवर।", "śubharātriḥ, mānyavara.", "Good night, Sir."],
  ["सुप्रभातम्, मान्ये।", "suprabhātam, mānye.", "Good morning, Madam."],
  ["स्वागतम्। महान् आनन्दः।", "svāgatam. mahān ānandaḥ.", "Welcome. Great happiness."],
  ["नमस्काराः! सर्वं कुशलम् वा?", "namaskārāḥ! sarvaṃ kuśalam vā?", "Salutations / Greetings! Is everything well?"],
].map(([deva, translit, meaning], i) => ({ id: `greeting-sentence:${i}`, deva, translit, meaning }));

export type Shloka = {
  title: string;
  source: string;
  deva: string[];
  translit: string[];
  meaning: string;
};

export const shlokas: Shloka[] = [
  {
    title: "Truth alone triumphs",
    source: "Muṇḍaka Upaniṣad 3.1.6",
    deva: ["सत्यमेव जयते नानृतम्।"],
    translit: ["satyam eva jayate nānṛtam."],
    meaning: "Truth alone triumphs, not falsehood.",
  },
  {
    title: "The world is one family",
    source: "Mahā Upaniṣad 6.71",
    deva: ["अयं निजः परो वेति गणना लघुचेतसाम्।", "उदारचरितानां तु वसुधैव कुटुम्बकम्॥"],
    translit: ["ayaṃ nijaḥ paro veti gaṇanā laghucetasām,", "udāracaritānāṃ tu vasudhaiva kuṭumbakam."],
    meaning:
      "'This one is mine, that one is a stranger' — so reckon the narrow-minded. For the large-hearted, the whole earth is one family.",
  },
  {
    title: "Knowledge gives humility",
    source: "Hitopadeśa",
    deva: ["विद्या ददाति विनयं विनयाद्याति पात्रताम्।", "पात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥"],
    translit: [
      "vidyā dadāti vinayaṃ vinayād yāti pātratām,",
      "pātratvād dhanam āpnoti dhanād dharmaṃ tataḥ sukham.",
    ],
    meaning:
      "Knowledge gives humility; from humility comes worthiness; from worthiness one gains wealth; from wealth, righteous living; and from that, happiness.",
  },
  {
    title: "Prayer before study",
    source: "Traditional",
    deva: ["सरस्वति नमस्तुभ्यं वरदे कामरूपिणि।", "विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा॥"],
    translit: [
      "sarasvati namastubhyaṃ varade kāmarūpiṇi,",
      "vidyārambhaṃ kariṣyāmi siddhir bhavatu me sadā.",
    ],
    meaning:
      "O Sarasvatī, giver of boons, who takes any form at will — salutations to you. I begin my studies; may I always succeed.",
  },
  {
    title: "Your right is to action",
    source: "Bhagavad Gītā 2.47",
    deva: ["कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।", "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"],
    translit: [
      "karmaṇy evādhikāras te mā phaleṣu kadācana,",
      "mā karmaphalahetur bhūr mā te saṅgo 'stv akarmaṇi.",
    ],
    meaning:
      "Your right is to the work alone, never to its fruits. Do not let the fruits be your motive, nor be attached to inaction.",
  },
];
