// Word tiles, shared by the sentence quizzes and the vocabulary lessons: a sentence is given in English
// and built from its jumbled Sanskrit words, with a few spare tiles mixed in.

/** अहं and अहम् are the same word. */
export const sameWord = (w: string) => w.replace(/ं$/, "म्");

// Words a correct sentence can take in or leave out: the "is" (मम नाम सीता / मम नाम सीता अस्ति) and the
// subject a verb already shows (गच्छतु / भवान् गच्छतु, मिलामः / वयं मिलामः), and मह्यं, सर्वं likewise.
// As a spare tile any of them could make a second right sentence, which would be marked wrong.
const OPTIONAL = ["अस्ति", "सन्ति", "अस्मि", "असि", "भवति", "अहम्", "त्वम्", "वयम्", "यूयम्", "भवान्", "भवती", "भवन्तः", "सः", "सा", "मह्यम्", "सर्वम्"];

// Words the greeting sentences use for much the same English ("Good." शोभनम्, "Very good." साधु साधु,
// "Fine." कुशलम्, "All right." अस्तु; "Greetings" नमस्ते, नमस्काराः): one is never a spare tile for another.
const SYNONYMS = [
  ["साधु", "शोभनम्", "समीचीनम्", "कुशलम्", "अस्तु"],
  ["नमस्ते", "नमस्काराः", "प्रणामाः"],
];

/** Whether `word` can be a spare tile for the sentence made of `right`, whose English is `english`. */
export function spareOk(word: string, right: string[], english: string) {
  const w = sameWord(word);
  if (OPTIONAL.includes(w)) return false;
  // "Please come." is आगच्छन्तु in the owner's sentences, but कृपया आगच्छन्तु says it too.
  if (w === "कृपया" && /please/i.test(english)) return false;
  return !SYNONYMS.some((set) => set.includes(w) && right.some((r) => set.includes(sameWord(r))));
}
