"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import TopNav from "@/components/TopNav";
import BoredomGuard from "@/components/BoredomGuard";
import TtsButton from "@/components/TtsButton";
import MiniGame from "@/components/MiniGame";
import { loadProfile, saveProfile, loadTasks, saveTasks, vocabGet, vocabSet, geminiKeyGet } from "@/lib/client-store";

type Payload = Record<string, unknown>;

export default function TaskRunner() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || "12-0";
  const [day, idx] = useMemo(() => {
    const [d, i] = rawId.split("-").map((x) => parseInt(x, 10));
    return [isNaN(d) ? 12 : d, isNaN(i) ? 0 : i];
  }, [rawId]);

  const [profile, setProfile] = useState(loadProfile());
  const [tasks, setTasks] = useState(loadTasks(day) || []);
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const task = tasks[idx];
  const payload: Payload = payloads[idx] || {};

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [writing, setWriting] = useState("");
  const [grade, setGrade] = useState<{ score: number; feedbackUz: string } | null>(null);
  const [grading, setGrading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    setProfile(loadProfile());
    setTasks(loadTasks(day) || []);
    try {
      const p = JSON.parse(localStorage.getItem(`linguaplan_payload_${day}`) || "[]");
      setPayloads(p.map((x: { payload: Payload }) => x.payload || x));
    } catch { setPayloads([]); }
  }, [day]);

  if (!task) {
    return (
      <main className="mx-auto max-w-[680px] px-4 pt-16 text-center">
        <div className="glass rounded-3xl p-8">
          <p className="text-4xl">🔍</p>
          <p className="mt-2 font-bold">Vazifa topilmadi</p>
          <Link href={`/day/${day}`} className="btn-gold mt-4 inline-block rounded-2xl px-6 py-3 font-bold">Kunga qaytish</Link>
        </div>
      </main>
    );
  }

  const kind = task.kind;
  const words: { en: string; uz: string; ex: string; exUz: string }[] =
    (payload.words as typeof words) || [
      { en: "journey", uz: "sayohat", ex: "Our journey was amazing.", exUz: "Sayohatimiz ajoyib edi." },
      { en: "delay", uz: "kechikish", ex: "Flight delayed.", exUz: "Reys kechikdi." },
      { en: "luggage", uz: "yuk", ex: "Where is my luggage?", exUz: "Yukim qayerda?" },
    ];
  const grammar = (payload.grammar as { t: string; ruleUz: string; exs: string[][] }) || {
    t: "Past Perfect", ruleUz: "had + V3 — avval tugagan ish.", exs: [["I had left.", "Men ketib bo'lgan edim."]],
  };
  const reading = (payload.reading as { title: string; text: string; uz: string; qs: { q: string; opts: string[]; a: number }[] }) || null;
  const listening = (payload.listening as { title: string; script: string; qs: { q: string; opts: string[]; a: number }[] }) || null;
  const prompt = (payload.prompt as { t: string; hint: string }) || { t: task.title, hint: "Erkin yozing / gapiring." };

  const finishTask = (bonus = 0) => {
    const nt = tasks.map((t, i) => (i === idx ? { ...t, status: "done" as const } : t));
    saveTasks(day, nt);
    const p = loadProfile();
    const gained = (task.xp || 25) + bonus + score * 2;
    const today = new Date().toISOString().slice(0, 10);
    const np = {
      ...p,
      totalXp: p.totalXp + gained,
      completedCount: p.completedCount + 1,
      lastActiveDate: today,
      streakDays: p.lastActiveDate === today ? p.streakDays || 1 : (p.streakDays || 0) + 1,
    };
    np.longestStreak = Math.max(np.longestStreak, np.streakDays);
    saveProfile(np);
    // vocab → SRS
    if (kind === "vocab") {
      const v = vocabGet();
      words.forEach((w) => {
        if (!v[w.en]) v[w.en] = { ef: 2.5, interval: 1, reps: 1, next: new Date(Date.now() + 86400000).toISOString().slice(0, 10), word: w.en, uz: w.uz };
      });
      vocabSet(v);
    }
    setFinished(true);
  };

  const gradeWriting = async () => {
    setGrading(true);
    try {
      const res = await fetch("/api/ai/grade-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: writing, level: profile.currentLevel, userKey: geminiKeyGet() }),
      });
      const j = await res.json();
      setGrade({ score: j.score || 75, feedbackUz: j.feedbackUz || "Yaxshi! Davom eting." });
    } catch {
      const wc = writing.trim().split(/\s+/).filter(Boolean).length;
      setGrade({ score: Math.min(95, 50 + wc), feedbackUz: `So'zlar: ${wc}. Tuzilishi yaxshi. Bog'lovchilar qo'shing (because, then, finally).` });
    } finally {
      setGrading(false);
    }
  };

  const startRec = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setRecUrl(URL.createObjectURL(blob));
      };
      mr.start();
      recRef.current = mr;
      setRecording(true);
    } catch {
      alert("Mikrofon ruxsati kerak (yoki o'z-o'zingizga ovoz chiqarib o'qing va o'z-o'zingizni baholang).");
    }
  };
  const stopRec = () => {
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
  };

  return (
    <div className="min-h-screen pb-16">
      <TopNav streak={profile.streakDays || 6} dueCount={12} name={profile.name} />
      <BoredomGuard />
      <main className="mx-auto max-w-[760px] px-4 pt-6">
        <Link href={`/day/${day}`} className="text-sm text-white/60 hover:text-white">← {day}-kunga qaytish</Link>
        <div className="glass mt-3 rounded-[28px] p-6 md:p-8">
          <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">{kind.toUpperCase()} • {task.minutes} DAQ • +{task.xp} XP</p>
          <h1 className="font-display mt-2 text-3xl md:text-4xl">{task.titleUz || task.title}</h1>
          <p className="mt-1 text-sm text-white/60">{task.title}</p>

          {/* VOCAB */}
          {kind === "vocab" && !finished && (
            <div className="mt-6">
              {step < words.length ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-xs text-white/50">{step + 1}/{words.length} • Har so'z yangi formatda</p>
                  <p className="font-display mt-2 text-4xl text-[#ffd9ad]">{words[step].en}</p>
                  <p className="mt-1 text-sm text-white/60">{words[step].ex}</p>
                  <div className="mt-2"><TtsButton text={`${words[step].en}. ${words[step].ex}`} /></div>
                  {step % 2 === 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {shuffledOpts(words, step).map((o) => (
                        <button key={o} onClick={() => {
                          const ok = o === words[step].uz;
                          if (ok) setScore((s) => s + 1);
                          setAnswers({ ...answers, [step]: o });
                          setTimeout(() => setStep(step + 1), 500);
                        }}
                          className={`rounded-xl px-3 py-2.5 text-sm ${answers[step] === o ? (o === words[step].uz ? "bg-emerald-400 text-black font-bold" : "bg-red-400 text-black") : "bg-white/8 border border-white/10 hover:bg-white/15"}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm text-white/60">Tarjimasini yozing: <b className="text-white">{words[step].uz.slice(0, 2)}...</b> (yoki inglizchasini eslab yozing)</p>
                      <div className="mt-2 flex gap-2">
                        <input id={`voc-${step}`} placeholder="Javob..." className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-[#e8b07a]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const v = (e.target as HTMLInputElement).value.trim().toLowerCase();
                              if (v === words[step].en.toLowerCase() || v === words[step].uz.toLowerCase()) setScore((s) => s + 1);
                              setStep(step + 1);
                            }
                          }} />
                        <button onClick={() => {
                          const el = document.getElementById(`voc-${step}`) as HTMLInputElement;
                          const v = (el?.value || "").trim().toLowerCase();
                          if (v === words[step].en.toLowerCase() || v === words[step].uz.toLowerCase()) setScore((s) => s + 1);
                          setStep(step + 1);
                        }} className="btn-gold rounded-xl px-5 text-sm font-bold">OK</button>
                      </div>
                      <button onClick={() => setStep(step + 1)} className="mt-2 text-xs text-white/40 underline">Bilaman deb o'tkazish (ma'nosi: {words[step].uz})</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-5 text-center">
                  <p className="text-3xl">🎉</p>
                  <p className="font-bold">Natija: {score}/{words.length}</p>
                  <p className="text-sm text-white/60">So'zlar SRS ga qo'shildi — ertaga takrorlashda chiqadi.</p>
                  <button onClick={() => finishTask()} className="btn-gold mt-4 w-full rounded-2xl px-4 py-3 font-bold">Yakunlash +XP →</button>
                </div>
              )}
            </div>
          )}

          {/* GRAMMAR */}
          {kind === "grammar" && !finished && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-[#e8b07a44] bg-[#e8b07a11] p-5">
                <p className="font-bold">📏 {grammar.t}</p>
                <p className="mt-1 text-sm text-white/75">{grammar.ruleUz}</p>
                {grammar.exs.map((e, i) => (
                  <p key={i} className="mt-2 text-sm"><span className="text-[#ffd9ad]">{e[0]}</span><br /><span className="text-white/55">{e[1]}</span></p>
                ))}
              </div>
              <GrammarQuiz onDone={(s) => { setScore(s); setFinished(true); finishTask(s); }} level={profile.currentLevel} topic={grammar.t} />
            </div>
          )}

          {/* READING */}
          {kind === "reading" && reading && !finished && (
            <div className="mt-6">
              <div className="rounded-2xl bg-black/30 border border-white/10 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{reading.title}</p>
                  <TtsButton text={reading.text} />
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85">{reading.text}</p>
                <p className="mt-2 text-xs text-white/40">{reading.uz}</p>
              </div>
              <QuizBlock qs={reading.qs} onDone={(s) => { setScore(s); finishTask(s); setFinished(true); }} />
            </div>
          )}
          {kind === "reading" && !reading && (
            <div className="mt-6"><QuizBlock qs={[
              { q: "“Journey” nimani anglatadi?", opts: ["sayohat", "ovqat", "uyqu", "ish"], a: 0 },
              { q: "“I have finished” qaysi zamon?", opts: ["Past Simple", "Present Perfect", "Future", "Continuous"], a: 1 },
            ]} onDone={(s) => { finishTask(s); setFinished(true); }} /></div>
          )}

          {/* LISTENING */}
          {kind === "listening" && listening && !finished && (
            <div className="mt-6">
              <div className="rounded-2xl border border-[#7fe0c355] bg-[#7fe0c311] p-5 text-center">
                <p className="font-bold">{listening.title}</p>
                <p className="mt-1 text-xs text-white/55">Avval eshiting, keyin savollarga javob bering. Matn yashirin!</p>
                <div className="mt-3 flex justify-center gap-2">
                  <TtsButton text={listening.script} />
                </div>
                <details className="mt-3 text-left text-xs text-white/45"><summary className="cursor-pointer">Matnni ko'rish (avval eshitib bo'ling!)</summary><p className="mt-2">{listening.script}</p></details>
              </div>
              <QuizBlock qs={listening.qs} onDone={(s) => { setScore(s); finishTask(s); setFinished(true); }} />
            </div>
          )}

          {/* WRITING */}
          {kind === "writing" && !finished && (
            <div className="mt-6">
              <div className="rounded-2xl bg-black/30 border border-white/10 p-5">
                <p className="font-bold">✎ {prompt.t}</p>
                <p className="mt-1 text-sm text-white/60">{prompt.hint}</p>
                <textarea value={writing} onChange={(e) => setWriting(e.target.value)} rows={7} placeholder="Write in English..."
                  className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 p-4 text-sm outline-none focus:border-[#e8b07a]" />
                <p className="mt-1 text-xs text-white/40">{writing.trim().split(/\s+/).filter(Boolean).length} so'z (min 40)</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={gradeWriting} disabled={grading || writing.trim().split(/\s+/).length < 5} className="btn-gold flex-1 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50">
                    {grading ? "AI baholamoqda..." : "AI baholash 🤖"}
                  </button>
                  {grade && <button onClick={() => finishTask(Math.round(grade.score / 20))} className="chip rounded-xl px-5 py-3 text-sm font-bold text-[#7fe0c3]">Yakunlash →</button>}
                </div>
                {grade && (
                  <div className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-sm">
                    <p className="font-bold">Ball: {grade.score}/100</p>
                    <p className="mt-1 text-white/75">{grade.feedbackUz}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SPEAKING */}
          {kind === "speaking" && !finished && (
            <div className="mt-6">
              <div className="rounded-2xl bg-black/30 border border-white/10 p-5">
                <p className="font-bold">🎙 {prompt.t}</p>
                <p className="mt-1 text-sm text-white/60">{prompt.hint}</p>
                <div className="mt-3"><TtsButton text={prompt.t + ". " + prompt.hint} /></div>
                <div className="mt-4 flex gap-2">
                  {!recUrl ? (
                    recording ? (
                      <button onClick={stopRec} className="flex-1 rounded-xl bg-red-500/80 px-4 py-3 text-sm font-bold">⏹ To'xtatish</button>
                    ) : (
                      <button onClick={startRec} className="btn-gold flex-1 rounded-xl px-4 py-3 text-sm font-bold">● Yozishni boshlash (45 sek)</button>
                    )
                  ) : (
                    <div className="w-full">
                      <audio src={recUrl} controls className="w-full" />
                      <div className="mt-3 space-y-1.5 text-sm">
                        {["Men 30+ soniya gapirdim", "Past/Present zamonni to'g'ri ishlatdim", "3+ yangi so'z ishlatdim"].map((c, i) => (
                          <label key={i} className="flex items-center gap-2 text-white/75"><input type="checkbox" id={`sp-${i}`} className="accent-[#7fe0c3]" />{c}</label>
                        ))}
                      </div>
                      <button onClick={() => finishTask(5)} className="btn-gold mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold">Yakunlash +XP →</button>
                      <button onClick={() => setRecUrl(null)} className="mt-2 w-full text-xs text-white/40 underline">Qayta yozish</button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-white/40">Mikrofon bo'lmasa — ovoz chiqarib o'qing va checkbox'larni belgilang. Halollik streak'ingizni mustahkamlaydi 😉</p>
              </div>
            </div>
          )}

          {(kind === "review" || finished) && finished && (
            <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-6 text-center">
              <p className="text-4xl">🏆</p>
              <p className="font-display mt-2 text-3xl">Bekat yakunlandi!</p>
              <p className="mt-1 text-sm text-white/60">+{task.xp} XP • Streak: {profile.streakDays} kun • Daraja sari yana bir qadam</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => router.push(`/day/${day}`)} className="btn-gold flex-1 rounded-2xl px-4 py-3 font-bold">Xaritaga →</button>
                <button onClick={() => router.push(`/task/${day}-${Math.min(tasks.length - 1, idx + 1)}`)} className="chip flex-1 rounded-2xl px-4 py-3 text-sm">Keyingi bekat</button>
              </div>
              <div className="mt-4"><MiniGame compact /></div>
            </div>
          )}
          {kind === "review" && !finished && (
            <div className="mt-6">
              <p className="text-sm text-white/60">SRS kartalaringizni takrorlang, keyin yakunlang:</p>
              <Link href="/review" className="btn-gold mt-3 block rounded-2xl px-4 py-3 text-center font-bold">Takrorlashga o'tish →</Link>
              <button onClick={() => finishTask()} className="mt-2 w-full text-xs text-white/40 underline">Men takrorladim — yakunlash</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function shuffledOpts(words: { uz: string }[], step: number) {
  const correct = words[step].uz;
  const others = words.filter((_, i) => i !== step).map((w) => w.uz);
  const pool = [...new Set([...others, "kitob", "vaqt", "makon", "orzu"])];
  const pick = pool.slice(0, 3);
  const arr = [correct, ...pick];
  // deterministik aralashtirish
  return arr.sort((a, b) => ((a.length * 7 + step) % 5) - ((b.length * 7) % 5));
}

function QuizBlock({ qs, onDone }: { qs: { q: string; opts: string[]; a: number }[]; onDone: (s: number) => void }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = qs.filter((q, i) => ans[i] === q.a).length;
  if (done) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-5 text-center">
        <p className="font-bold">Natija: {score}/{qs.length}</p>
        <button onClick={() => onDone(score)} className="btn-gold mt-3 w-full rounded-2xl px-4 py-3 font-bold">Yakunlash +XP →</button>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {qs.map((q, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-semibold">{i + 1}. {q.q}</p>
          <div className="mt-2 grid gap-1.5">
            {q.opts.map((o, oi) => (
              <button key={oi} onClick={() => setAns({ ...ans, [i]: oi })}
                className={`rounded-xl px-3 py-2 text-left text-sm ${ans[i] === oi ? (oi === q.a ? "bg-emerald-400 text-black font-bold" : "bg-[#e8b07a] text-black font-bold") : "bg-white/5 hover:bg-white/10"}`}>
                {o}
              </button>
            ))}
          </div>
          {ans[i] !== undefined && (
            <p className="mt-1 text-xs ${ans[i]===q.a?'text-emerald-300':'text-amber-200'}">
              {ans[i] === q.a ? "✅ To'g'ri!" : `❌ To'g'ri javob: ${q.opts[q.a]}`}
            </p>
          )}
        </div>
      ))}
      <button disabled={Object.keys(ans).length < qs.length} onClick={() => setDone(true)} className="btn-gold w-full rounded-2xl px-4 py-3 font-bold disabled:opacity-40">
        Tekshirish →
      </button>
    </div>
  );
}

function GrammarQuiz({ onDone, level, topic }: { onDone: (s: number) => void; level: string; topic: string }) {
  const qs = [
    { q: `When I arrived, the train ___ left. (${topic})`, opts: ["has", "have", "had", "having"], a: 2 },
    { q: "She ___ finished before he called.", opts: ["has", "had", "have", "was"], a: 1 },
    { q: "I ___ never been to London.", opts: ["has", "have", "had had", "having"], a: 1 },
    { q: `Daraja: ${level} — “If it rains, we ___ stay.”`, opts: ["will", "would", "stayed", "staying"], a: 0 },
    { q: "The cake ___ by mom.", opts: ["baked", "was baked", "is bake", "bake"], a: 1 },
  ];
  return <QuizBlock qs={qs} onDone={onDone} />;
}
