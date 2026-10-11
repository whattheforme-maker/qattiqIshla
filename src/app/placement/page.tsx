"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { gradePlacement } from "@/lib/taskgen";
import { placementForUser } from "@/lib/placement";
import { loadProfile, saveProfile, geminiKeyGet } from "@/lib/client-store";

export default function Placement() {
  const r = useRouter();
  const profile = useMemo(() => loadProfile(), []);
  // Har userga individual: name+email dan seed
  const { qs, writing: wTopic } = useMemo(
    () => placementForUser(`${profile.name}|${profile.email}|${new Date().toISOString().slice(0, 10)}-${profile.name.length}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [writing, setWriting] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const score = Object.entries(answers).filter(([i, a]) => qs[+i].a === a).length;

  const finish = async (beginner = false) => {
    setLoading(true);
    let level = "A1";
    let weak: string[] = ["grammar", "vocab"];
    if (beginner) {
      level = "A1";
    } else {
      const g = gradePlacement(score, writing.trim().length);
      level = g.level;
      weak = g.weak;
      // AI baho (Gemini bo'lsa, bo'lmasa mock)
      try {
        const res = await fetch("/api/ai/grade-placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, total: qs.length, writing, userKey: geminiKeyGet() }),
        });
        const j = await res.json();
        if (j.level) level = j.level;
        if (j.weak) weak = j.weak;
      } catch {}
    }
    const p = loadProfile();
    saveProfile({ ...p, currentLevel: level, weakAreas: weak, placed: true, currentDay: 12 });
    setLoading(false);
    r.push("/feasibility");
  };

  if (step === 0) {
    return (
      <main className="mx-auto max-w-[680px] px-4 pb-24 pt-10">
        <div className="glass rounded-[28px] p-8 text-center">
          <p className="text-5xl">🎯</p>
          <h1 className="font-display mt-3 text-4xl">Daraja testi</h1>
          <p className="mt-2 text-white/60 text-sm">20 ta savol + qisqa yozma. ~7 daqiqa. AI darajangizni A1–C1 da aniqlaydi.</p>
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={() => setStep(1)} className="btn-gold rounded-2xl px-6 py-3.5 font-bold">Testni boshlash →</button>
            <button onClick={() => finish(true)} className="chip rounded-2xl px-6 py-3 text-sm text-white/70">Men boshlang'ichman — to'g'ri A1 dan</button>
          </div>
        </div>
      </main>
    );
  }

  const perPage = 5;
  const page = Math.floor(step - 1);
  const totalPages = Math.ceil(qs.length / perPage);
  const slice = qs.slice(page * perPage, page * perPage + perPage);

  return (
    <main className="mx-auto max-w-[720px] px-4 pb-24 pt-8">
      <div className="glass rounded-[28px] p-6 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-widest text-[#e8b07a]">PLACEMENT • {Math.min(step, totalPages)}/{totalPages + 1}</p>
          <p className="text-xs text-white/50">To'g'ri: {score}</p>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10">
          <div className="h-full progress-gold rounded-full" style={{ width: `${(step / (totalPages + 1)) * 100}%` }} />
        </div>

        {step <= totalPages ? (
          <div className="mt-6 space-y-5">
            {slice.map((q, k) => {
              const gi = page * perPage + k;
              return (
                <div key={gi} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold">{gi + 1}. {q.q} <span className="ml-2 text-[10px] text-white/40">{q.lvl}</span></p>
                  <div className="mt-2 grid gap-1.5">
                    {q.opts.map((o, oi) => (
                      <button key={oi} onClick={() => setAnswers({ ...answers, [gi]: oi })}
                        className={`rounded-xl px-3 py-2 text-left text-sm ${answers[gi] === oi ? "bg-[#7fe0c3] text-black font-bold" : "bg-white/5 hover:bg-white/10"}`}>
                        {["A", "B", "C", "D"][oi]}. {o}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2">
              {step > 1 && <button onClick={() => setStep(step - 1)} className="chip rounded-2xl px-6 py-3 text-sm">←</button>}
              <button onClick={() => setStep(step + 1)} className="btn-gold flex-1 rounded-2xl px-6 py-3 font-bold">
                {step === totalPages ? "Yozma qism →" : "Keyingi →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="font-bold">Yozma qism (ixtiyoriy, lekin daraja aniqligini oshiradi)</p>
            <p className="mt-1 text-sm text-white/60">Mavzu: “{wTopic.t}” — {wTopic.hint}</p>
            <textarea value={writing} onChange={(e) => setWriting(e.target.value)} rows={6}
              placeholder="Yesterday I woke up at 7..."
              className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-sm outline-none focus:border-[#e8b07a]" />
            <p className="mt-1 text-xs text-white/40">{writing.trim().split(/\s+/).filter(Boolean).length} so'z</p>
            <button onClick={() => finish(false)} disabled={loading} className="btn-gold mt-4 w-full rounded-2xl px-6 py-3.5 font-bold disabled:opacity-60">
              {loading ? "AI baholamoqda..." : `Natijani ko'rish (${score}/20) →`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
