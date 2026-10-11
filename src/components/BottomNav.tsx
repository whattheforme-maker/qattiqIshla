"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ dueCount }: { dueCount: number }) {
  const path = usePathname();
  const items = [
    { href: "/day/12", label: "Bugun", icon: "🧭" },
    { href: "/plan", label: "Reja", icon: "📍" },
    { href: "/review", label: "Takrorlash", icon: "📖", badge: dueCount },
    { href: "/progress", label: "Natijalar", icon: "🏆" },
    { href: "/settings", label: "Sozlamalar", icon: "⚙️" },
  ];
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[min(680px,92vw)] -translate-x-1/2">
      <div className="glass flex items-center justify-around rounded-3xl px-2 py-2">
        {items.map((it) => {
          const active = path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex min-w-[92px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs ${
                active ? "bg-[#1d4a43] text-white" : "text-white/60 hover:text-white"
              }`}
            >
              <span className="text-lg">{it.icon}</span>
              <span className="font-medium">{it.label}</span>
              {it.badge ? (
                <span className="absolute right-4 top-1 rounded-full bg-[#d98a7a] px-1.5 text-[10px] font-bold text-white">
                  {it.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
