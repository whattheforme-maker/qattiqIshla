"use client";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import BoredomGuard from "@/components/BoredomGuard";
import TtsButton from "@/components/TtsButton";
import { loadProfile, vocabGet, vocabSet } from "@/lib/client-store";
import { sm2, nextReviewDate, todayStr } from "@/lib/srs";

export default function ReviewPage() {
  const [p] = useState(loadProfile());
  const [cards, setCards] = useState(() => Object.entries(vocabGet()));
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");

  const due = cards.filter(([, v]) => v.next <= todayStr());
  const fresh = cards.filter(([, v]) => v.next > todayStr());

  const grade = (word: string, q: number) => {
    const v = vocabGet();
    const c = v[word];
    if (!c) return;
    const r = sm2(q, { ef: c.ef, interval: c.interval, reps: c.reps });
    v[word] = { ...c, ef: r.ef, interval: r.interval, reps: r.reps, next: nextReviewDate(r.interval) };
    vocabSet(v);
    setCards(Object.entries(v));
    setMsg(q >= 4 ? `✅ ${word} — keyingi takrorlash ${r.interval} kundan keyin` : `🔁 ${word} — ertaga yana (SM-2)`);
  };

  const seedDemo = () => {
    const v = vocabGet();
    const demo: Record<string, { ef: number; interval: number; reps: number; next: string; word: string; uz: string }> = { ...v };
    [["journey", "sayohat"], ["delay", "kechikish"], ["luggage", "yuk"], ["opportunity", "imkoniyat"], ["punctual", "vaqtida keladigan"], ["bridge", "ko'prik"]].forEach(([en, uz]) => {
      if (!demo[en]) demo[en] = { ef: 2.5, interval: 0, reps: 0, next: todayStr(), word: en, uz };
    });
    vocabSet(demo);
    setCards(Object.entries(demo));
  };

  return (
    <div className="min-h-screen pb-28">
      <TopNav streak={p.streakDays || 6} dueCount={due.length || 12} name={p.name} />
      <BoredomGuard />
      <main className="mx-auto max-w-[820px] px-4 pt-6">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">SRS • SM-2 (1, 6, 15...)</p>
        <h1 className="font-display mt-2 text-5xl">Takrorlash</h1>
        <p className="mt-1 text-sm text-white/60">{due.length} ta karta vaqti keldi • sifatni 0–5 baholang</p>
        {msg && <p className="mt-3 rounded-2xl bg-emerald-500/15 p-3 text-sm text-emerald-100">{msg}</p>}

        {cards.length === 0 && (
          <div className="glass mt-5 rounded-3xl p-6 text-center">
            <p className="text-3xl">📚</p>
            <p className="mt-2 font-bold">Hali karta yo'q</p>
            <p className="text-sm text-white/60">Avval lug'at vazifasini bajaring yoki demo kartalarni yuklang.</p>
            <button onClick={seedDemo} className="btn-gold mt-4 rounded-2xl px-6 py-3 text-sm font-bold">Demo kartalarni yuklash</button>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {due.map(([w, c]) => (
            <div key={w} className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-3xl">{w}</p>
                <TtsButton text={w} />
              </div>
              {!show[w] ? (
                <button onClick={() => setShow({ ...show, [w]: true })} className="chip mt-3 rounded-2xl px-5 py-2.5 text-sm">Tarjimani ko'rish 👀</button>
              ) : (
                <div className="mt-3">
                  <p className="text-lg text-[#ffd9ad]">{c.uz}</p>
                  <p className="mt-2 text-xs text-white/50">Qanchalik esladingiz? (0–5)</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((q) => (
                      <button key={q} onClick={() => grade(w, q)}
                        className={`h-10 w-10 rounded-xl font-bold ${q >= 4 ? "bg-emerald-500/25 hover:bg-emerald-400 hover:text-black" : q === 3 ? "bg-amber-500/25 hover:bg-amber-300 hover:text-black" : "bg-red-500/20 hover:bg-red-400 hover:text-black"}`}>
                        {q}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">5-mukammal • 3-qiyin • 0-eslolmadim • EF:{c.ef} • int:{c.interval}k</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {fresh.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold tracking-widest text-white/40">KEYINROQ ({fresh.length})</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fresh.map(([w, c]) => (
                <span key={w} className="chip rounded-full px-3 py-1.5 text-xs">{w} → {c.next}</span>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav dueCount={due.length || 12} />
    </div>
  );
}
