// Browser text-to-speech. Sanskrit voices are rare, so we use a Hindi voice,
// which reads Devanagari reasonably well. Silently does nothing if unsupported.
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const voice =
    voices.find((v) => v.lang === "sa-IN") ??
    voices.find((v) => v.lang === "hi-IN") ??
    voices.find((v) => v.lang.startsWith("hi"));
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "hi-IN";
  u.rate = 0.8;
  synth.speak(u);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
