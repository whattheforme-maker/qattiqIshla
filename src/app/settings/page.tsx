"use client";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { loadProfile, saveProfile, geminiKeyGet, geminiKeySet } from "@/lib/client-store";

export default function Settings() {
  const [p, setP] = useState(loadProfile());
  const [key, setKey] = useState(geminiKeyGet());
  const [msg, setMsg] = useState("");
  const [theme, setTheme] = useState("cosmic");

  const save = () => {
    saveProfile(p);
    geminiKeySet(key);
    fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).catch(() => {});
    setMsg("✅ Saqlandi! Gemini kaliti brauzeringizda (faqat sizda) saqlanadi.");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ profile: p, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "linguaplan-export.json";
    a.click();
  };

  const wipe = () => {
    if (!confirm("Akkauntni o'chirish (local)?")) return;
    localStorage.clear();
    location.href = "/";
  };

  return (
    <div className="min-h-screen pb-28">
      <TopNav streak={p.streakDays || 6} dueCount={12} name={p.name} />
      <main className="mx-auto max-w-[720px] px-4 pt-6">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">SOZLAMALAR</p>
        <h1 className="font-display mt-2 text-5xl">Nazorat paneli</h1>

        <div className="glass mt-5 rounded-3xl p-6">
          <p className="font-bold">🤖 Gemini token (keyin o'zingiz qo'yasiz)</p>
          <p className="mt-1 text-xs text-white/55">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline text-[#7fe0c3]">Google AI Studio</a> dan oling va shu yerga yopishtiring.
            Kalit faqat brauzeringizda saqlanadi va har bir AI so'rovda serverga yuboriladi. Kalit bo'lmasa — mock rejim ishlaydi.
          </p>
          <input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="AIza..." className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#7fe0c3]" />
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 font-bold ${key ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}>
              {key ? "● AI ulangan" : "● Mock rejim (kalitsiz)"}
            </span>
            {key && <button onClick={() => { setKey(""); geminiKeySet(""); }} className="underline text-white/50">O'chirish</button>}
          </div>
        </div>

        <div className="glass mt-4 rounded-3xl p-6 space-y-4">
          <p className="font-bold">🎯 Maqsad va vaqt</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-white/60">Maqsad
              <select value={p.targetLevel} onChange={(e) => setP({ ...p, targetLevel: e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white">
                {["A2", "B1", "B2", "C1"].map((l) => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </label>
            <label className="text-xs text-white/60">Hozirgi
              <select value={p.currentLevel} onChange={(e) => setP({ ...p, currentLevel: e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white">
                {["A1", "A2", "B1", "B2", "C1"].map((l) => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </label>
            <label className="text-xs text-white/60">Muddat (kun)
              <input type="number" value={p.deadlineDays} onChange={(e) => setP({ ...p, deadlineDays: +e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm" />
            </label>
            <label className="text-xs text-white/60">Kunlik (daq)
              <input type="number" value={p.dailyMinutes} onChange={(e) => setP({ ...p, dailyMinutes: +e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm" />
            </label>
            <label className="text-xs text-white/60">Haftada kun
              <input type="number" min={1} max={7} value={p.daysPerWeek} onChange={(e) => setP({ ...p, daysPerWeek: +e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm" />
            </label>
            <label className="text-xs text-white/60">Tema
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white">
                <option value="cosmic" className="text-black">🌌 Cosmic (dark)</option>
                <option value="midnight" className="text-black">🌙 Midnight</option>
              </select>
            </label>
          </div>
          <label className="block text-xs text-white/60">Ism
            <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm" />
          </label>
          <button onClick={save} className="btn-gold w-full rounded-2xl px-4 py-3.5 font-bold">Saqlash ✅</button>
          {msg && <p className="rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-100">{msg}</p>}
        </div>

        <div className="glass mt-4 rounded-3xl p-6">
          <p className="font-bold">📦 Ma'lumotlar</p>
          <div className="mt-3 flex gap-2">
            <button onClick={exportJson} className="chip flex-1 rounded-2xl px-4 py-3 text-sm">Eksport JSON ⬇</button>
            <button onClick={wipe} className="flex-1 rounded-2xl bg-red-500/20 border border-red-300/30 px-4 py-3 text-sm text-red-200">Akkauntni o'chirish</button>
          </div>
          <p className="mt-2 text-[11px] text-white/40">Mock rejim: AI_MOCK=true bo'lsa Gemini kalitsiz fixtures dan ishlaydi.</p>
        </div>
      </main>
      <BottomNav dueCount={12} />
    </div>
  );
}
