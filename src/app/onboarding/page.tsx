"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadProfile, saveProfile } from "@/lib/client-store";

const PURPOSES = [
  ["ish", "💼 Ish uchun"],
  ["ielts", "🎓 IELTS / o'qish"],
  ["safar", "✈️ Sayohat"],
  ["kundalik", "💬 Kundalik muloqot"],
  ["it", "💻 IT / freelans"],
];
const INTERESTS = ["Safar", "Ish", "Kino", "Musiqa", "Sport", "Texnologiya", "Taom", "Tarix", "Biznes", "Tabiat"];

export default function Onboarding() {
  const r = useRouter();
  const [p, setP] = useState(loadProfile());
  const [step, setStep] = useState(0);

  const save = async () => {
    saveProfile({ ...p, onboarded: true });
    // Save to server if authenticated
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLevel: p.currentLevel,
          targetLevel: p.targetLevel,
          deadlineDays: p.deadlineDays,
          dailyMinutes: p.dailyMinutes,
          daysPerWeek: p.daysPerWeek,
          purpose: p.purpose,
          interests: p.interests,
          weakAreas: p.weakAreas,
        }),
      }).catch(() => {});
    } catch {}
    r.push("/placement");
  };

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-24 pt-8">
      <div className="glass rounded-[28px] p-8">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">ONBOARDING • {step + 1}/3</p>
        <h1 className="font-display mt-2 text-4xl">Maqsadingizni aniqlaymiz</h1>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full progress-gold transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>

        {step === 0 && (
          <div className="mt-6">
            <p className="text-sm text-white/60">Qaysi darajaga chiqmoqchisiz?</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {["A2", "B1", "B2", "C1"].map((l) => (
                <button key={l} onClick={() => setP({ ...p, targetLevel: l })}
                  className={`rounded-2xl border px-4 py-4 text-xl font-bold ${p.targetLevel === l ? "border-[#e8b07a] bg-[#e8b07a22] text-[#ffd9ad]" : "border-white/10 bg-white/5"}`}>
                  {l}
                </button>
              ))}
            </div>
            <p className="mt-5 text-sm text-white/60">Maqsadingiz nima?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PURPOSES.map(([v, label]) => (
                <button key={v} onClick={() => setP({ ...p, purpose: v })}
                  className={`rounded-full px-4 py-2 text-sm ${p.purpose === v ? "bg-[#7fe0c3] text-black font-bold" : "chip text-white/70"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm">Necha kunda? <b className="text-[#ffd9ad]">{p.deadlineDays} kun</b></p>
              <input type="range" min={14} max={365} value={p.deadlineDays} onChange={(e) => setP({ ...p, deadlineDays: +e.target.value })} className="mt-2 w-full accent-[#e8b07a]" />
            </div>
            <div>
              <p className="text-sm">Kuniga necha daqiqa? <b className="text-[#ffd9ad]">{p.dailyMinutes} daq</b></p>
              <input type="range" min={10} max={120} step={5} value={p.dailyMinutes} onChange={(e) => setP({ ...p, dailyMinutes: +e.target.value })} className="mt-2 w-full accent-[#7fe0c3]" />
            </div>
            <div>
              <p className="text-sm">Haftada necha kun? <b className="text-[#ffd9ad]">{p.daysPerWeek}</b></p>
              <div className="mt-2 flex gap-2">
                {[3, 4, 5, 6, 7].map((d) => (
                  <button key={d} onClick={() => setP({ ...p, daysPerWeek: d })}
                    className={`rounded-xl px-4 py-2 text-sm font-bold ${p.daysPerWeek === d ? "bg-white text-black" : "chip text-white/70"}`}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <p className="text-sm text-white/60">Qiziqishlaringiz (vazifalar shunga moslashadi):</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((t) => {
                const on = p.interests.includes(t);
                return (
                  <button key={t} onClick={() => setP({ ...p, interests: on ? p.interests.filter((x) => x !== t) : [...p.interests, t] })}
                    className={`rounded-full px-4 py-2 text-sm ${on ? "bg-[#e8b07a] text-black font-bold" : "chip text-white/70"}`}>{t}</button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="chip rounded-2xl px-6 py-3 text-sm">← Orqaga</button>}
          {step < 2
            ? <button onClick={() => setStep(step + 1)} className="btn-gold flex-1 rounded-2xl px-6 py-3 font-bold">Keyingi →</button>
            : <button onClick={save} className="btn-gold flex-1 rounded-2xl px-6 py-3 font-bold">Testga o'tish →</button>}
        </div>
      </div>
    </main>
  );
}
