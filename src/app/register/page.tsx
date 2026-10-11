"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadProfile, saveProfile } from "@/lib/client-store";

export default function Register() {
  const r = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Ismingizni yozing");
    if (!email.includes("@")) return setErr("Email noto'g'ri");
    if (pw.length < 6) return setErr("Parol kamida 6 belgi");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pw }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Xatolik");
    } catch (e: unknown) {
      // DB bo'lmasa ham local davom etamiz
      console.log("register fallback", e);
    }
    const p = loadProfile();
    saveProfile({ ...p, name: name.trim(), email: email.trim() });
    try {
      localStorage.setItem("linguaplan_user", JSON.stringify({ name, email }));
    } catch {}
    r.push("/onboarding");
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-[1240px] place-items-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-[440px] rounded-[28px] p-8">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">LINGUAPLAN</p>
        <h1 className="font-display mt-2 text-4xl">Ro'yxatdan o'tish</h1>
        <p className="mt-1 text-sm text-white/60">30 soniyada boshlang — keyin daraja testi.</p>
        <label className="mt-6 block text-xs text-white/60">Ism</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Malika" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#e8b07a]" />
        <label className="mt-3 block text-xs text-white/60">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#e8b07a]" />
        <label className="mt-3 block text-xs text-white/60">Parol</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#e8b07a]" />
        {err && <p className="shake mt-3 rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{err}</p>}
        <button disabled={loading} className="btn-gold mt-5 w-full rounded-2xl px-4 py-3.5 font-bold disabled:opacity-60">
          {loading ? "Kutilmoqda..." : "Davom etish →"}
        </button>
        <p className="mt-4 text-center text-sm text-white/60">
          Akkauntingiz bormi? <Link href="/login" className="text-[#ffd9ad] underline">Kirish</Link>
        </p>
      </form>
    </main>
  );
}
