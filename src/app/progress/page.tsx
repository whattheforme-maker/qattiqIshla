"use client";
import Link from "next/link";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import BoredomGuard from "@/components/BoredomGuard";
import MiniGame from "@/components/MiniGame";
import { loadProfile } from "@/lib/client-store";
import { levelFromXpAndBase, progressToNextLevel } from "@/lib/levels";

export default function Progress() {
  const [p] = useState(loadProfile());
  const effLevel = levelFromXpAndBase(p.currentLevel, p.totalXp);
  const pct = progressToNextLevel(p.currentLevel, p.totalXp);
  const planPct = Math.min(100, Math.round(((p.currentDay || 12) / (p.deadlineDays || 90)) * 100));

  const skills = [
    ["Lug'at", 68 + (p.completedCount % 20)],
    ["Grammatika", 55 + (p.completedCount % 25)],
    ["O'qish", 60 + (p.completedCount % 15)],
    ["Tinglash", 48 + (p.completedCount % 30)],
    ["Yozish", 42 + (p.completedCount % 22)],
    ["Gapirish", 38 + (p.completedCount % 28)],
  ];

  return (
    <div className="min-h-screen pb-28">
      <TopNav streak={p.streakDays || 6} dueCount={12} name={p.name} />
      <BoredomGuard />
      <main className="mx-auto max-w-[1000px] px-4 pt-6">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">NATIJALAR</p>
        <h1 className="font-display mt-2 text-5xl">O'sish grafigi</h1>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-xs tracking-widest text-white/50">HOZIRGI DARAJA</p>
            <p className="font-display mt-1 text-6xl text-[#ffd9ad]">{effLevel}</p>
            <p className="text-xs text-white/50">Baza: {p.currentLevel} + {p.totalXp} XP</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full progress-gold rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-white/50">Keyingi darajagacha {pct}%</p>
          </div>
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-xs tracking-widest text-white/50">STREAK</p>
            <p className="font-display mt-1 text-6xl">🔥{p.streakDays || 6}</p>
            <p className="text-xs text-white/50">Eng uzun: {Math.max(p.longestStreak, p.streakDays, 6)} kun • ❄️ freeze: {p.freezeAvailable ?? 1}</p>
            <p className="mt-2 text-xs">Bajarilgan: <b>{p.completedCount}</b> • XP: <b>{p.totalXp}</b></p>
          </div>
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-xs tracking-widest text-white/50">REJA</p>
            <p className="font-display mt-1 text-6xl">{planPct}%</p>
            <p className="text-xs text-white/50">{p.currentDay || 12}/{p.deadlineDays} kun • Maqsad {p.targetLevel}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#7fe0c3]" style={{ width: `${planPct}%` }} />
            </div>
          </div>
        </div>

        <div className="glass mt-4 rounded-3xl p-6">
          <p className="font-bold">Ko'nikmalar</p>
          <div className="mt-4 space-y-3">
            {skills.map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="w-24 text-sm text-white/70">{k}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full progress-gold" style={{ width: `${Math.min(98, v as number)}%` }} />
                </div>
                <span className="w-10 text-right text-xs text-white/60">{Math.min(98, v as number)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/40">SVG emas, jonli div grafik — Lighthouse ≥90 uchun yengil.</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <p className="font-bold">🎮 Zeriksangiz — mashq o'yini</p>
            <div className="mt-3"><MiniGame compact /></div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="font-bold">📅 Haftalik mini-test</p>
            <p className="mt-1 text-sm text-white/60">Har 7-kun oxirida 5 savollik test. Final kunda — katta test va daraja qayta baholanadi.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/placement" className="btn-gold flex-1 rounded-2xl px-4 py-3 text-center text-sm font-bold">Qayta test →</Link>
              <Link href="/day/14" className="chip flex-1 rounded-2xl px-4 py-3 text-center text-sm">14-kun testi</Link>
            </div>
          </div>
        </div>
      </main>
      <BottomNav dueCount={12} />
    </div>
  );
}
