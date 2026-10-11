"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Login xatosi");
      try {
        localStorage.setItem("linguaplan_user", JSON.stringify({ name: j.name, email }));
      } catch {}
      const raw = localStorage.getItem("linguaplan_v1");
      if (raw) {
        const p = JSON.parse(raw);
        p.name = j.name || p.name;
        p.email = email;
        localStorage.setItem("linguaplan_v1", JSON.stringify(p));
      }
      r.push("/day/12");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Xatolik. Demo sifatida davom eting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-[1240px] place-items-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-[440px] rounded-[28px] p-8">
        <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">LINGUAPLAN</p>
        <h1 className="font-display mt-2 text-4xl">Kirish</h1>
        <label className="mt-6 block text-xs text-white/60">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#e8b07a]" />
        <label className="mt-3 block text-xs text-white/60">Parol</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#e8b07a]" />
        {err && <p className="mt-3 rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{err}</p>}
        <button disabled={loading} className="btn-gold mt-5 w-full rounded-2xl px-4 py-3.5 font-bold">
          {loading ? "..." : "Kirish →"}
        </button>
        <p className="mt-4 text-center text-sm text-white/60">
          Yangimisiz? <Link href="/register" className="text-[#ffd9ad] underline">Ro'yxatdan o'tish</Link>
        </p>
      </form>
    </main>
  );
}
