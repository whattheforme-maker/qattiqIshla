"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav({
  streak,
  dueCount,
  name,
}: {
  streak: number;
  dueCount: number;
  name: string;
}) {
  const path = usePathname();
  const item = (href: string, label: string, icon: string, badge?: number, activeMatch?: string) => {
    const active = activeMatch ? path.startsWith(activeMatch) : path === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm transition-all ${
          active
            ? "bg-[#173b35] border border-[#7fe0c355] text-white shadow-[0_0_20px_rgba(127,224,195,0.25)]"
            : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
      >
        <span className="text-base">{icon}</span>
        <span className="hidden md:inline">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-1 rounded-full bg-[#e8b07a66] px-2 py-0.5 text-[11px] font-bold text-[#ffd9ad]">
            {badge}
          </span>
        )}
      </Link>
    );
  };
  return (
    <header className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 pt-5 md:px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#1e5a4f] to-[#0f2e29] border border-white/10 text-xl">
          🧭
        </span>
        <span className="text-xl font-semibold tracking-tight">linguaplan</span>
      </Link>
      <nav className="glass hidden sm:flex items-center gap-1 rounded-2xl p-1.5">
        {item("/day/12", "Bugun", "📖", undefined, "/day")}
        {item("/plan", "Reja", "🎯")}
        {item("/review", "Takrorlash", "🔁", dueCount)}
        {item("/progress", "Natijalar", "📊")}
        {item("/settings", "Sozlamalar", "⚙️")}
      </nav>
      <div className="flex items-center gap-2">
        <div className="chip flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <span>🔥</span>
          <span className="font-semibold">{streak} kunlik qator</span>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 font-bold">
          {(name?.[0] || "M").toUpperCase()}
        </div>
      </div>
    </header>
  );
}
