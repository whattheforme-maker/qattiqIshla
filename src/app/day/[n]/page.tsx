"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import LearningMap from "@/components/LearningMap";
import BoredomGuard from "@/components/BoredomGuard";
import { loadProfile, saveProfile, loadTasks, saveTasks, TaskState } from "@/lib/client-store";
import { uniqueTasksForDay } from "@/lib/taskgen";

export default function DayPage() {
  const params = useParams();
  const router = useRouter();
  const n = Math.max(1, Math.min(365, parseInt((params?.n as string) || "12", 10) || 12));
  const [profile, setProfile] = useState(loadProfile());
  const [tasks, setTasks] = useState<TaskState[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatchup, setShowCatchup] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    // streak yangilash (sodda)
    const today = new Date().toISOString().slice(0, 10);
    if (p.lastActiveDate !== today && p.completedCount > 0) {
      // gap hisoblash soddalashtirilgan
    }
    setProfile(p);
    let t = loadTasks(n);
    if (!t || t.length === 0) {
      setLoading(true);
      // lazy generatsiya effekti: 900ms "generating"
      const timer = setTimeout(() => {
        const usedTitles: string[] = [];
        for (let d = Math.max(1, n - 4); d < n; d++) {
          const prev = loadTasks(d);
          if (prev) prev.forEach((x) => usedTitles.push(x.title));
        }
        const gen = uniqueTasksForDay({
          day: n,
          level: p.currentLevel,
          interests: p.interests,
          usedTitles,
          minutesTotal: p.dailyMinutes,
        });
        // oldingilar bilan bir xil bo'lsa — formatni almashtir (takrorlanmaslik kafolati)
        const mapped: TaskState[] = gen
          .filter((g) => !usedTitles.includes(g.title))
          .map((g, i) => ({
            id: `${n}-${i}-${Date.now() % 10000}`,
            kind: g.kind,
            title: g.title,
            titleUz: g.titleUz,
            minutes: g.minutes,
            status: "pending" as const,
            xp: 25 + (i * 7) % 20,
          }));
        const finalTasks = mapped.length >= 3 ? mapped : gen.map((g, i) => ({
          id: `${n}-${i}-f`,
          kind: g.kind,
          title: g.title + (i === 0 ? " • yangi format" : ""),
          titleUz: g.titleUz,
          minutes: g.minutes,
          status: "pending" as const,
          xp: 25,
        }));
        // payload ni alohida saqlash
        try {
          localStorage.setItem(`linguaplan_payload_${n}`, JSON.stringify(gen));
        } catch {}
        saveTasks(n, finalTasks);
        setTasks(finalTasks);
        setLoading(false);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      setTasks(t);
      setLoading(false);
    }
    // 2+ kun o'tkazilgan bo'lsa catch-up
    if (n - (p.currentDay || 12) >= 2) setShowCatchup(true);
  }, [n]);

  const done = tasks.filter((t) => t.status === "done").length;
  const activeIdx = Math.max(0, tasks.findIndex((t) => t.status !== "done"));
  const next = tasks[activeIdx] || tasks[0];
  const week = Math.ceil(n / 7);

  const completeQuick = (id: string) => {
    const nt = tasks.map((t) => (t.id === id ? { ...t, status: "done" as const } : t));
    setTasks(nt);
    saveTasks(n, nt);
    const p = loadProfile();
    const gained = tasks.find((t) => t.id === id)?.xp || 20;
    const np = { ...p, totalXp: p.totalXp + gained, completedCount: p.completedCount + 1, lastActiveDate: new Date().toISOString().slice(0, 10) };
    // streak
    if (np.lastActiveDate !== p.lastActiveDate) {
      np.streakDays = (p.streakDays || 0) + 1;
      np.longestStreak = Math.max(np.longestStreak, np.streakDays);
    }
    saveProfile(np);
    setProfile(np);
  };

  const icons: Record<string, string> = {
    vocab: "✦", grammar: "❋", reading: "📖", listening: "🎧", writing: "✎", speaking: "🎙", review: "🔁",
  };
  const kindUz: Record<string, string> = {
    vocab: "LUG'AT", grammar: "GRAMMATIKA", reading: "O'QISH", listening: "TINGLASH", writing: "YOZISH", speaking: "GAPIRISH", review: "TAKRORLASH",
  };

  return (
    <div className="min-h-screen pb-28">
      <TopNav streak={profile.streakDays || 6} dueCount={12} name={profile.name} />
      <BoredomGuard loading={loading} />

      <main className="mx-auto max-w-[1240px] px-4 md:px-6">
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">{n}-KUN • REJANING {week}-HAFTASI</p>
            <h1 className="font-display mt-2 text-5xl md:text-6xl">Bugungi yo'nalish</h1>
            <p className="mt-2 text-white/60">Bugungi yo'nalishingiz — {profile.targetLevel} sari navbatdagi qadam.</p>
          </div>
          <Link href="/plan" className="glass flex items-center gap-3 rounded-2xl px-5 py-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d98a7a] font-bold">{profile.currentLevel}</span>
            <span><span className="block text-[11px] tracking-widest text-white/50">MAQSAD</span><span className="font-bold">{profile.targetLevel} dareja</span></span>
            <span className="text-white/50">→</span>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Xarita */}
          <section className="glass overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between px-6 pt-5">
              <p className="text-xs font-bold tracking-[0.2em] text-white/50">O'QUV XARITASI • {n}-KUN</p>
              <span className="chip rounded-full px-3 py-1 text-xs">{profile.currentLevel} → {profile.targetLevel}</span>
            </div>
            {loading ? (
              <div className="grid h-[420px] place-items-center">
                <div className="text-center">
                  <p className="animate-pulse text-4xl">✨</p>
                  <p className="mt-2 text-sm text-white/60">Sizga maxsus unikal vazifalar tuzilmoqda...</p>
                  <p className="mt-1 text-xs text-white/40">Har safar yangi format • polling 2s</p>
                </div>
              </div>
            ) : (
              <LearningMap tasks={tasks} activeIdx={activeIdx === -1 ? tasks.length - 1 : activeIdx} day={n} />
            )}
            <p className="px-6 pb-5 text-sm text-white/50">↘ Yo'lingizni bakatina-bakat davom ettiring</p>
          </section>

          {/* O'ng ustun */}
          <section className="flex flex-col gap-4">
            <div className="glass rounded-[24px] p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl">Kunlik masofa</p>
                <p className="text-sm text-white/70">{done}/{tasks.length || 4} bajarildi</p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full progress-gold transition-all" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 25}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/50">
                <span>Bugungi mashg'ulot</span><span>{profile.dailyMinutes} daqiqa</span>
              </div>
            </div>

            <div className="glass rounded-[24px] p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl">Bugungi bekatlar</p>
                <span className="text-xs text-white/50">🕐 {tasks.reduce((a, t) => a + t.minutes, 0) || 25} daqiqa</span>
              </div>
              <div className="mt-3 space-y-2">
                {loading ? (
                  [0, 1, 2, 3].map((i) => <div key={i} className="h-[64px] animate-pulse rounded-2xl bg-white/5" />)
                ) : (
                  tasks.map((t, i) => (
                    <div key={t.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${i === activeIdx ? "task-active" : "border-white/10 bg-black/25"}`}>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.status === "done" ? "bg-[#1a4a42] text-white" : "bg-white/10"}`}>
                        {t.status === "done" ? "✓" : icons[t.kind] || "✦"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] tracking-widest text-white/45">{kindUz[t.kind] || t.kind.toUpperCase()}</p>
                        <p className="truncate text-sm font-semibold">{t.titleUz || t.title}</p>
                      </div>
                      <span className="text-xs text-white/50">{t.minutes} daq.</span>
                      {t.status === "done" ? (
                        <span className="text-[#7fe0c3]">✓</span>
                      ) : (
                        <button onClick={() => router.push(`/task/${n}-${i}`)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
                          {i === activeIdx ? "Keyingi" : "Ochish"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {next && !loading && (
              <div className="glass rounded-[24px] p-5">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="font-bold tracking-widest">KEYINGI BEKAT</span>
                  <span>▶ {next.minutes} daqiqa</span>
                </div>
                <p className="font-display mt-2 text-[26px] leading-snug">{kindUz[next.kind]}: {next.title}</p>
                <button onClick={() => router.push(`/task/${n}-${activeIdx === -1 ? 0 : activeIdx}`)} className="btn-gold mt-4 w-full rounded-2xl px-4 py-4 font-bold">
                  Mashqni boshlash →
                </button>
                <button onClick={() => completeQuick(next.id)} className="mt-2 w-full rounded-2xl px-4 py-2 text-xs text-white/50 hover:text-white">
                  Tez belgilash (demo)
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => router.push(`/day/${Math.max(1, n - 1)}`)} className="chip flex-1 rounded-2xl py-2.5 text-sm">← Kecha</button>
              <button onClick={() => router.push(`/day/${n + 1}`)} className="chip flex-1 rounded-2xl py-2.5 text-sm">Ertaga →</button>
            </div>
          </section>
        </div>
      </main>

      {showCatchup && (
        <div className="modal-blur fixed inset-0 z-[70] grid place-items-center p-4">
          <div className="glass w-full max-w-[520px] rounded-3xl p-7">
            <p className="text-xs font-bold tracking-widest text-[#e8b07a]">CATCH-UP</p>
            <h3 className="font-display mt-1 text-3xl">2+ kun o'tkazildi</h3>
            <p className="mt-1 text-sm text-white/60">Qanday davom etamiz?</p>
            <div className="mt-4 space-y-2">
              {[
                "Keyingi 3 kunga taqsimlash (+yuk)",
                "Muddatni siljitish (yuk o'zgarmaydi)",
                "O'tkazib yuborish (eng yengil)",
              ].map((t, i) => (
                <button key={i} onClick={() => { setShowCatchup(false); setProfile({ ...profile, currentDay: n }); }}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-left text-sm hover:border-[#e8b07a88]">{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav dueCount={12} />
    </div>
  );
}
