"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { feasibility } from "@/lib/feasibility";
import { loadProfile, saveProfile } from "@/lib/client-store";

export default function Feasibility() {
  const r = useRouter();
  const [p, setP] = useState(loadProfile());
  const f = useMemo(
    () =>
      feasibility({
        from: p.currentLevel,
        to: p.targetLevel,
        deadlineDays: p.deadlineDays,
        dailyMinutes: p.dailyMinutes,
        daysPerWeek: p.daysPerWeek,
      }),
    [p]
  );

  const badge =
    f.verdict === "realistik"
      ? ["✅ Realistik", "bg-emerald-500/20 text-emerald-200 border-emerald-300/30"]
      : f.verdict === "qiyin"
        ? ["⚠️ Qiyin, lekin mumkin", "bg-amber-500/20 text-amber-200 border-amber-300/30"]
        : ["❌ Real emas", "bg-red-500/20 text-red-200 border-red-300/30"];

  const start = () => {
    saveProfile({ ...p, startDay: 1 });
    fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).catch(() => {});
    r.push("/day/1");
  };

  return (
    <main className="mx-auto max-w-[820px] px-4 pb-24 pt-8">
      <div className="glass rounded-[28px] p-8">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">HALOL HISOB • SOF KOD</p>
        <h1 className="font-display mt-2 text-4xl">Maqsad realligi</h1>
        <p className="mt-1 text-sm text-white/60">
          {p.currentLevel} → {p.targetLevel} • {p.deadlineDays} kun • kuniga {p.dailyMinutes} daq • haftada {p.daysPerWeek} kun
        </p>

        <div className={`mt-5 rounded-2xl border p-5 ${badge[1]}`}>
          <p className="text-2xl font-bold">{badge[0]}</p>
          <p className="mt-1 text-sm opacity-90">
            Kerak: <b>{f.needHours} soat</b> • Sizda: <b>{f.haveHours} soat</b> ({f.studyDays} dars kuni) • Nisbat: {f.ratio}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full progress-gold" style={{ width: `${Math.min(100, f.ratio * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-70">Barcha raqamlar Gemini emas, sof TypeScript kodida hisoblanadi.</p>
        </div>

        <p className="mt-6 text-sm font-bold text-white/80">3 MUQOBIL YO'L:</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {f.alternatives.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                if (a.dailyMinutes) setP({ ...p, dailyMinutes: Math.min(120, a.dailyMinutes) });
                if (a.deadlineDays) setP({ ...p, deadlineDays: a.deadlineDays });
                if (a.target && a.id === "lower-goal") setP({ ...p, targetLevel: a.target });
                saveProfile({ ...p });
              }}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:border-[#e8b07a66]"
            >
              <p className="text-sm font-bold text-[#ffd9ad]">{a.title}</p>
              <p className="mt-1 text-xs text-white/60">{a.desc}</p>
              <p className="mt-2 text-xs text-[#7fe0c3]">Qo'llash →</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/onboarding" className="chip rounded-2xl px-6 py-3.5 text-center text-sm">← Sozlamalarni o'zgartirish</Link>
          <button onClick={start} className="btn-gold flex-1 rounded-2xl px-6 py-3.5 font-bold">Rejani boshlash → 1-kun</button>
        </div>
      </div>
    </main>
  );
}
