"use client";
import { useMemo, useState } from "react";
import { GAME_BANK } from "@/lib/taskgen";

function shuffle(s: string): string {
  const a = s.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const r = a.join("");
  return r === s ? shuffle(s) : r;
}

export default function MiniGame({ onWin, compact }: { onWin?: (xp: number) => void; compact?: boolean }) {
  const [mode, setMode] = useState<"scramble" | "translate" | "memory">("scramble");
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * GAME_BANK.length));
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [score, setScore] = useState(0);
  const word = GAME_BANK[idx % GAME_BANK.length];
  const scrambled = useMemo(() => shuffle(word.en), [word.en, idx]);

  const next = () => {
    setIdx((v) => (v + 1 + Math.floor(Math.random() * 3)) % GAME_BANK.length);
    setInput("");
    setMsg("");
  };

  const check = () => {
    const ok =
      mode === "translate"
        ? input.trim().toLowerCase() === word.uz.toLowerCase() || input.trim().toLowerCase() === word.en.toLowerCase()
        : input.trim().toLowerCase() === word.en.toLowerCase();
    if (ok) {
      setScore((s) => s + 10);
      setMsg("✅ To'g'ri! +10 XP");
      onWin?.(10);
      try {
        const raw = localStorage.getItem("linguaplan_v1");
        if (raw) {
          const p = JSON.parse(raw);
          p.totalXp = (p.totalXp || 0) + 10;
          localStorage.setItem("linguaplan_v1", JSON.stringify(p));
        }
      } catch {}
      setTimeout(next, 900);
    } else {
      setMsg("❌ Qayta urining! Hint: " + word.hint);
    }
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 p-4 ${compact ? "" : "glass"}`}>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["scramble", "🔤 Scramble"],
            ["translate", "⚡ Speed Translate"],
            ["memory", "🧠 Memory"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setMsg(""); setInput(""); }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${mode === m ? "bg-[#e8b07a] text-black" : "chip text-white/70"}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs font-bold text-[#7fe0c3]">Score: {score}</span>
      </div>

      {mode === "scramble" && (
        <div className="mt-4 text-center">
          <p className="text-xs uppercase tracking-widest text-white/50">Unscramble — inglizcha so'zni toping</p>
          <p className="font-display mt-2 text-4xl tracking-[0.2em] text-[#ffd9ad]">{scrambled}</p>
          <p className="mt-1 text-sm text-white/60">Hint: {word.hint} • UZ: {word.uz}</p>
        </div>
      )}
      {mode === "translate" && (
        <div className="mt-4 text-center">
          <p className="text-xs uppercase tracking-widest text-white/50">Tez tarjima qiling</p>
          <p className="font-display mt-2 text-4xl">{word.uz}</p>
          <p className="mt-1 text-sm text-white/60">Hint: {word.hint}</p>
        </div>
      )}
      {mode === "memory" && (
        <div className="mt-4 text-center">
          <p className="text-xs uppercase tracking-widest text-white/50">Yodlang va yozing (5 soniya)</p>
          <p className="font-display mt-2 text-3xl text-[#7fe0c3]">{word.en} — {word.uz}</p>
          <p className="mt-1 text-xs text-white/50">Endi pastga faqat inglizchasini yozing</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder={mode === "translate" ? "English..." : "So'zni yozing..."}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-[#e8b07a]"
        />
        <button onClick={check} className="btn-gold rounded-xl px-5 py-2.5 text-sm font-bold">
          OK
        </button>
        <button onClick={next} className="chip rounded-xl px-4 py-2.5 text-sm">
          Skip
        </button>
      </div>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
      <p className="mt-2 text-[11px] text-white/40">All in English practice • har bir to'g'ri javob streak XP beradi</p>
    </div>
  );
}
