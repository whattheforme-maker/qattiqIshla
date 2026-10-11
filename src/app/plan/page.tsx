"use client";
import Link from "next/link";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import BoredomGuard from "@/components/BoredomGuard";
import { loadProfile } from "@/lib/client-store";
import { buildPlan } from "@/lib/planner";

export default function PlanPage() {
  const [p] = useState(loadProfile());
  const plan = buildPlan({ from: p.currentLevel, to: p.targetLevel, totalDays: p.deadlineDays, interests: p.interests });
  const cur = p.currentDay || 12;

  return (
    <div className="min-h-screen pb-28">
      <TopNav streak={p.streakDays || 6} dueCount={12} name={p.name} />
      <BoredomGuard />
      <main className="mx-auto max-w-[1000px] px-4 md:px-6 pt-6">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">REJA SKELETI • SOF KOD</p>
        <h1 className="font-display mt-2 text-5xl">Yo'l xaritasi</h1>
        <p className="mt-1 text-sm text-white/60">{p.currentLevel} → {p.targetLevel} • {p.deadlineDays} kun • {plan.totalWeeks} hafta • har 7-kun review</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {plan.weeks.slice(0, 12).map((w) => {
            const isCur = Math.ceil(cur / 7) === w.week;
            const past = Math.ceil(cur / 7) > w.week;
            return (
              <div key={w.week} className={`rounded-3xl border p-5 ${isCur ? "task-active" : "glass"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold tracking-widest text-white/50">{w.week}-HAFTA {isCur ? "• HOZIR" : past ? "• ✓" : ""}</p>
                  {w.week % 1 === 0 && <span className="text-[11px] text-[#7fe0c3]">review + mini-test</span>}
                </div>
                <p className="mt-1 font-bold">📌 {w.theme}</p>
                <p className="text-sm text-white/60">📏 {w.grammar}</p>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
                  {Object.entries(w.share).map(([k, v], i) => (
                    <div key={k} style={{ width: `${v}%`, background: ["#e8b07a", "#7fe0c3", "#7aa8e8", "#d98a7a", "#b07fe0", "#7fe07a"][i % 6] }} />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/50">
                  {Object.entries(w.share).map(([k, v]) => <span key={k} className="chip rounded-full px-2 py-0.5">{k} {v}%</span>)}
                </div>
                <div className="mt-3 flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                    const dayN = (w.week - 1) * 7 + d;
                    return (
                      <Link key={d} href={`/day/${dayN}`}
                        className={`grid h-8 w-8 place-items-center rounded-lg text-[11px] font-bold ${dayN === cur ? "bg-[#e8b07a] text-black" : dayN < cur ? "bg-emerald-500/25 text-emerald-200" : "bg-white/8 text-white/60 hover:bg-white/15"}`}>
                        {d}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {plan.totalWeeks > 12 && <p className="mt-3 text-center text-xs text-white/40">... yana {plan.totalWeeks - 12} hafta (oxirgi kun — final test)</p>}
      </main>
      <BottomNav dueCount={12} />
    </div>
  );
}
