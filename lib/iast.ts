// Devanagari → IAST, for text the app generates (e.g. verb example sentences).

const vowels: Record<string, string> = {
  अ: "a", आ: "ā", इ: "i", ई: "ī", उ: "u", ऊ: "ū", ऋ: "ṛ", ॠ: "ṝ", ऌ: "ḷ", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
};

const signs: Record<string, string> = {
  "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};

const consonants: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ",
  च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ",
  ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh", ण: "ṇ",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v",
  श: "ś", ष: "ṣ", स: "s", ह: "h",
};

const other: Record<string, string> = { "ं": "ṃ", "ः": "ḥ", "ँ": "m̐", "ऽ": "'", "।": ".", "॥": ".", ॐ: "oṃ" };

const VIRAMA = "्";

export function toIAST(deva: string): string {
  let out = "";
  const chars = [...deva];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch in consonants) {
      out += consonants[ch];
      const next = chars[i + 1];
      if (next === VIRAMA) i++;
      else if (next in signs) {
        out += signs[next];
        i++;
      } else out += "a";
    } else {
      out += vowels[ch] ?? other[ch] ?? ch;
    }
  }
  // "।" is written after a space-free word; drop the space some sources put before it.
  return out.replace(/ \./g, ".");
}
