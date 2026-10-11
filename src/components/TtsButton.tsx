"use client";
export default function TtsButton({ text, lang = "en-US" }: { text: string; lang?: string }) {
  const speak = () => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <button onClick={speak} className="chip rounded-full px-3 py-1.5 text-xs hover:bg-white/10" title="Tinglash">
      🔊 Eshitish
    </button>
  );
}
