// Mock content for the app. No backend — everything lives here.

export type Letter = {
  id: string;
  deva: string;
  translit: string;
  sound: string; // English pronunciation hint
  example?: { deva: string; translit: string; meaning: string };
};

export type LetterGroup = { name: string; sanskrit: string; letters: Letter[] };

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
  example: example && { deva: example[0], translit: example[1], meaning: example[2] },
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
      L("अं", "aṃ", "nasal hum (anusvāra)", ["अंशः", "aṃśaḥ", "portion"]),
      L("अः", "aḥ", "breathy echo (visarga)", ["दुःखम्", "duḥkham", "sorrow"]),
    ],
  },
];

export const consonants: LetterGroup[] = [
  {
    name: "Velar",
    sanskrit: "कण्ठ्य",
    letters: [
      L("क", "ka", "k in 'skin'", ["कमलम्", "kamalam", "lotus"]),
      L("ख", "kha", "k in 'kite' (aspirated)", ["खगः", "khagaḥ", "bird"]),
      L("ग", "ga", "g in 'go'", ["गजः", "gajaḥ", "elephant"]),
      L("घ", "gha", "g-h in 'log-house'", ["घटः", "ghaṭaḥ", "pot"]),
      L("ङ", "ṅa", "ng in 'sing'"),
    ],
  },
  {
    name: "Palatal",
    sanskrit: "तालव्य",
    letters: [
      L("च", "ca", "ch in 'chunk'", ["चन्द्रः", "candraḥ", "moon"]),
      L("छ", "cha", "ch-h in 'church-hill'", ["छत्रम्", "chatram", "umbrella"]),
      L("ज", "ja", "j in 'jug'", ["जलम्", "jalam", "water"]),
      L("झ", "jha", "dge-h in 'hedgehog'", ["झषः", "jhaṣaḥ", "fish"]),
      L("ञ", "ña", "ny in 'canyon'"),
    ],
  },
  {
    name: "Retroflex",
    sanskrit: "मूर्धन्य",
    letters: [
      L("ट", "ṭa", "t with tongue curled back"),
      L("ठ", "ṭha", "aspirated ṭ"),
      L("ड", "ḍa", "d with tongue curled back", ["डमरुः", "ḍamaruḥ", "small drum"]),
      L("ढ", "ḍha", "aspirated ḍ", ["ढक्का", "ḍhakkā", "large drum"]),
      L("ण", "ṇa", "n with tongue curled back"),
    ],
  },
  {
    name: "Dental",
    sanskrit: "दन्त्य",
    letters: [
      L("त", "ta", "t with tongue on teeth", ["तरुः", "taruḥ", "tree"]),
      L("थ", "tha", "aspirated t (not 'th' in 'thin')"),
      L("द", "da", "d with tongue on teeth", ["दीपः", "dīpaḥ", "lamp"]),
      L("ध", "dha", "aspirated d", ["धनुः", "dhanuḥ", "bow"]),
      L("न", "na", "n in 'name'", ["नदी", "nadī", "river"]),
    ],
  },
  {
    name: "Labial",
    sanskrit: "ओष्ठ्य",
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
    name: "Sibilants & h",
    sanskrit: "ऊष्म",
    letters: [
      L("श", "śa", "sh in 'shut'", ["शशः", "śaśaḥ", "rabbit"]),
      L("ष", "ṣa", "sh with tongue curled back", ["षट्", "ṣaṭ", "six"]),
      L("स", "sa", "s in 'sun'", ["सूर्यः", "sūryaḥ", "sun"]),
      L("ह", "ha", "h in 'hut'", ["हस्तः", "hastaḥ", "hand"]),
    ],
  },
];

export const conjuncts: LetterGroup[] = [
  {
    name: "Common conjuncts",
    sanskrit: "संयुक्ताक्षराणि",
    letters: [
      L("क्ष", "kṣa", "k + ṣ", ["क्षमा", "kṣamā", "forgiveness"]),
      L("त्र", "tra", "t + r", ["मित्रम्", "mitram", "friend"]),
      L("ज्ञ", "jña", "j + ñ (often 'gya')", ["ज्ञानम्", "jñānam", "knowledge"]),
      L("श्र", "śra", "ś + r", ["श्रमः", "śramaḥ", "effort"]),
      L("द्य", "dya", "d + y", ["विद्या", "vidyā", "learning"]),
      L("स्त", "sta", "s + t", ["हस्तः", "hastaḥ", "hand"]),
    ],
  },
];

export const allLetters: Letter[] = [...vowels, ...consonants, ...conjuncts].flatMap(
  (g) => g.letters,
);

// ---------------------------------------------------------------- vocabulary

export type Word = {
  id: string;
  deva: string;
  translit: string;
  meaning: string;
  category: string;
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
    meaning,
    category: slug,
  })),
});

export const categories: Category[] = [
  cat("greetings", "Greetings", "अभिवादनम्", "🙏", [
    ["नमस्ते", "namaste", "hello / I bow to you"],
    ["धन्यवादः", "dhanyavādaḥ", "thank you"],
    ["स्वागतम्", "svāgatam", "welcome"],
    ["सुप्रभातम्", "suprabhātam", "good morning"],
    ["शुभरात्रिः", "śubharātriḥ", "good night"],
    ["क्षम्यताम्", "kṣamyatām", "sorry / excuse me"],
    ["पुनर्मिलामः", "punarmilāmaḥ", "see you again"],
    ["कुशलम्", "kuśalam", "well / fine"],
  ]),
  cat("numbers", "Numbers", "सङ्ख्याः", "🔢", [
    ["एकम्", "ekam", "one"],
    ["द्वे", "dve", "two"],
    ["त्रीणि", "trīṇi", "three"],
    ["चत्वारि", "catvāri", "four"],
    ["पञ्च", "pañca", "five"],
    ["षट्", "ṣaṭ", "six"],
    ["सप्त", "sapta", "seven"],
    ["अष्ट", "aṣṭa", "eight"],
    ["नव", "nava", "nine"],
    ["दश", "daśa", "ten"],
  ]),
  cat("family", "Family", "कुटुम्बम्", "👪", [
    ["माता", "mātā", "mother"],
    ["पिता", "pitā", "father"],
    ["भ्राता", "bhrātā", "brother"],
    ["भगिनी", "bhaginī", "sister"],
    ["पुत्रः", "putraḥ", "son"],
    ["पुत्री", "putrī", "daughter"],
    ["पितामहः", "pitāmahaḥ", "grandfather"],
    ["मित्रम्", "mitram", "friend"],
  ]),
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
  cat("verbs", "Verbs", "क्रियाः", "🏃", [
    ["गच्छति", "gacchati", "goes"],
    ["पठति", "paṭhati", "reads / studies"],
    ["लिखति", "likhati", "writes"],
    ["खादति", "khādati", "eats"],
    ["पिबति", "pibati", "drinks"],
    ["वदति", "vadati", "speaks"],
    ["पश्यति", "paśyati", "sees"],
    ["धावति", "dhāvati", "runs"],
    ["हसति", "hasati", "laughs"],
    ["क्रीडति", "krīḍati", "plays"],
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

export const persons = [
  { name: "3rd person", sanskrit: "प्रथमपुरुषः", hint: "he / she / they" },
  { name: "2nd person", sanskrit: "मध्यमपुरुषः", hint: "you" },
  { name: "1st person", sanskrit: "उत्तमपुरुषः", hint: "I / we" },
];

export type Conjugation = {
  id: string;
  root: string;
  translit: string;
  meaning: string;
  tense: string;
  tenseSanskrit: string;
  forms: [string, string, string][]; // per person: [sg, du, pl]
};

// Present tense (लट्), the nine forms of each dhatu.
const present = (
  id: string,
  root: string,
  translit: string,
  meaning: string,
  forms: [string, string, string][],
): Conjugation => ({ id, root, translit, meaning, tense: "Present", tenseSanskrit: "लट्", forms });

export const conjugations: Conjugation[] = [
  present("path-present", "पठ्", "paṭh", "to read", [
    ["पठति", "पठतः", "पठन्ति"],
    ["पठसि", "पठथः", "पठथ"],
    ["पठामि", "पठावः", "पठामः"],
  ]),
  {
    id: "path-past",
    root: "पठ्",
    translit: "paṭh",
    meaning: "to read",
    tense: "Past (imperfect)",
    tenseSanskrit: "लङ्",
    forms: [
      ["अपठत्", "अपठताम्", "अपठन्"],
      ["अपठः", "अपठतम्", "अपठत"],
      ["अपठम्", "अपठाव", "अपठाम"],
    ],
  },
  {
    id: "path-future",
    root: "पठ्",
    translit: "paṭh",
    meaning: "to read",
    tense: "Future",
    tenseSanskrit: "लृट्",
    forms: [
      ["पठिष्यति", "पठिष्यतः", "पठिष्यन्ति"],
      ["पठिष्यसि", "पठिष्यथः", "पठिष्यथ"],
      ["पठिष्यामि", "पठिष्यावः", "पठिष्यामः"],
    ],
  },
  present("likh-present", "लिख्", "likh", "to write", [
    ["लिखति", "लिखतः", "लिखन्ति"],
    ["लिखसि", "लिखथः", "लिखथ"],
    ["लिखामि", "लिखावः", "लिखामः"],
  ]),
  present("gam-present", "गम्", "gam", "to go", [
    ["गच्छति", "गच्छतः", "गच्छन्ति"],
    ["गच्छसि", "गच्छथः", "गच्छथ"],
    ["गच्छामि", "गच्छावः", "गच्छामः"],
  ]),
  present("agam-present", "आ + गम्", "ā + gam", "to come", [
    ["आगच्छति", "आगच्छतः", "आगच्छन्ति"],
    ["आगच्छसि", "आगच्छथः", "आगच्छथ"],
    ["आगच्छामि", "आगच्छावः", "आगच्छामः"],
  ]),
  present("khad-present", "खाद्", "khād", "to eat", [
    ["खादति", "खादतः", "खादन्ति"],
    ["खादसि", "खादथः", "खादथ"],
    ["खादामि", "खादावः", "खादामः"],
  ]),
  present("pa-present", "पा", "pā", "to drink", [
    ["पिबति", "पिबतः", "पिबन्ति"],
    ["पिबसि", "पिबथः", "पिबथ"],
    ["पिबामि", "पिबावः", "पिबामः"],
  ]),
  present("drs-present", "दृश्", "dṛś", "to see", [
    ["पश्यति", "पश्यतः", "पश्यन्ति"],
    ["पश्यसि", "पश्यथः", "पश्यथ"],
    ["पश्यामि", "पश्यावः", "पश्यामः"],
  ]),
  present("krid-present", "क्रीड्", "krīḍ", "to play", [
    ["क्रीडति", "क्रीडतः", "क्रीडन्ति"],
    ["क्रीडसि", "क्रीडथः", "क्रीडथ"],
    ["क्रीडामि", "क्रीडावः", "क्रीडामः"],
  ]),
  present("has-present", "हस्", "has", "to laugh", [
    ["हसति", "हसतः", "हसन्ति"],
    ["हससि", "हसथः", "हसथ"],
    ["हसामि", "हसावः", "हसामः"],
  ]),
  present("vad-present", "वद्", "vad", "to speak", [
    ["वदति", "वदतः", "वदन्ति"],
    ["वदसि", "वदथः", "वदथ"],
    ["वदामि", "वदावः", "वदामः"],
  ]),
  present("cal-present", "चल्", "cal", "to walk / to move", [
    ["चलति", "चलतः", "चलन्ति"],
    ["चलसि", "चलथः", "चलथ"],
    ["चलामि", "चलावः", "चलामः"],
  ]),
  present("dhav-present", "धाव्", "dhāv", "to run", [
    ["धावति", "धावतः", "धावन्ति"],
    ["धावसि", "धावथः", "धावथ"],
    ["धावामि", "धावावः", "धावामः"],
  ]),
  present("nrt-present", "नृत्", "nṛt", "to dance", [
    ["नृत्यति", "नृत्यतः", "नृत्यन्ति"],
    ["नृत्यसि", "नृत्यथः", "नृत्यथ"],
    ["नृत्यामि", "नृत्यावः", "नृत्यामः"],
  ]),
  present("nam-present", "नम्", "nam", "to bow", [
    ["नमति", "नमतः", "नमन्ति"],
    ["नमसि", "नमथः", "नमथ"],
    ["नमामि", "नमावः", "नमामः"],
  ]),
  present("smr-present", "स्मृ", "smṛ", "to remember", [
    ["स्मरति", "स्मरतः", "स्मरन्ति"],
    ["स्मरसि", "स्मरथः", "स्मरथ"],
    ["स्मरामि", "स्मरावः", "स्मरामः"],
  ]),
  present("kr-present", "कृ", "kṛ", "to do", [
    ["करोति", "कुरुतः", "कुर्वन्ति"],
    ["करोषि", "कुरुथः", "कुरुथ"],
    ["करोमि", "कुर्वः", "कुर्मः"],
  ]),
  present("stha-present", "स्था", "sthā", "to stand", [
    ["तिष्ठति", "तिष्ठतः", "तिष्ठन्ति"],
    ["तिष्ठसि", "तिष्ठथः", "तिष्ठथ"],
    ["तिष्ठामि", "तिष्ठावः", "तिष्ठामः"],
  ]),
  present("ni-present", "नी", "nī", "to lead / to take", [
    ["नयति", "नयतः", "नयन्ति"],
    ["नयसि", "नयथः", "नयथ"],
    ["नयामि", "नयावः", "नयामः"],
  ]),
  present("bhu-present", "भू", "bhū", "to be / to become", [
    ["भवति", "भवतः", "भवन्ति"],
    ["भवसि", "भवथः", "भवथ"],
    ["भवामि", "भवावः", "भवामः"],
  ]),
  present("as-present", "अस्", "as", "to be / to become", [
    ["अस्ति", "स्तः", "सन्ति"],
    ["असि", "स्थः", "स्थ"],
    ["अस्मि", "स्वः", "स्मः"],
  ]),
];

// Example sentences for the verbs tab: every person and number, then every gender.
export type VerbExample = { deva: string; translit: string; meaning: string; note?: string };

export const verbExamples: VerbExample[] = [
  { deva: "अहं पठामि।", translit: "ahaṃ paṭhāmi.", meaning: "I read." },
  { deva: "आवां पठावः।", translit: "āvāṃ paṭhāvaḥ.", meaning: "We two read." },
  { deva: "वयं पठामः।", translit: "vayaṃ paṭhāmaḥ.", meaning: "We all read." },
  { deva: "त्वं गच्छसि।", translit: "tvaṃ gacchasi.", meaning: "You go." },
  { deva: "युवां गच्छथः।", translit: "yuvāṃ gacchathaḥ.", meaning: "You two go." },
  { deva: "यूयं गच्छथ।", translit: "yūyaṃ gacchatha.", meaning: "You all go." },
  { deva: "सः गच्छति।", translit: "saḥ gacchati.", meaning: "He goes.", note: "पुल्लिङ्ग - एकवचनम्" },
  { deva: "तौ गच्छतः।", translit: "tau gacchataḥ.", meaning: "Those two go.", note: "पुल्लिङ्ग - द्विवचनम्" },
  { deva: "ते गच्छन्ति।", translit: "te gacchanti.", meaning: "They go.", note: "पुल्लिङ्ग - बहुवचनम्" },
  { deva: "सा गच्छति।", translit: "sā gacchati.", meaning: "She goes.", note: "स्त्रीलिङ्ग - एकवचनम्" },
  { deva: "ते गच्छतः।", translit: "te gacchataḥ.", meaning: "Those two go.", note: "स्त्रीलिङ्ग - द्विवचनम्" },
  { deva: "ताः गच्छन्ति।", translit: "tāḥ gacchanti.", meaning: "They go.", note: "स्त्रीलिङ्ग - बहुवचनम्" },
  { deva: "तत् चलति।", translit: "tat calati.", meaning: "It moves.", note: "नपुंसकलिङ्ग - एकवचनम्" },
  { deva: "ते चलतः।", translit: "te calataḥ.", meaning: "Those two move.", note: "नपुंसकलिङ्ग - द्विवचनम्" },
  { deva: "तानि चलन्ति।", translit: "tāni calanti.", meaning: "They move.", note: "नपुंसकलिङ्ग - बहुवचनम्" },
];

export const pronouns = [
  { deva: "अहम्", translit: "aham", meaning: "I" },
  { deva: "आवाम्", translit: "āvām", meaning: "we two" },
  { deva: "वयम्", translit: "vayam", meaning: "we" },
  { deva: "त्वम्", translit: "tvam", meaning: "you" },
  { deva: "युवाम्", translit: "yuvām", meaning: "you two" },
  { deva: "यूयम्", translit: "yūyam", meaning: "you all" },
  { deva: "सः", translit: "saḥ", meaning: "he" },
  { deva: "सा", translit: "sā", meaning: "she" },
  { deva: "तत्", translit: "tat", meaning: "it" },
];

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
