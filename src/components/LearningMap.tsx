"use client";

// Premium cosmic map: 4 orol z-index qatlam + oltin-yashil yo'l + 4 bekat + B2 maqsad
export default function LearningMap({
  tasks,
  activeIdx,
  day,
}: {
  tasks: { title: string; status: string; kind: string }[];
  activeIdx: number;
  day: number;
}) {
  const icons: Record<string, string> = {
    vocab: "✦",
    grammar: "❋",
    reading: "📖",
    listening: "🎧",
    writing: "✎",
    speaking: "🎙",
    review: "🔁",
  };
  const shortUz: Record<string, string> = {
    vocab: "Lug'at",
    grammar: "Grammatika",
    reading: "O'qish",
    listening: "Tinglash",
    writing: "Yozish",
    speaking: "Gapirish",
    review: "Takrorlash",
  };
  // 4 node pozitsiyasi (screenshotga mos)
  const spots = [
    { x: 14, y: 74 },
    { x: 34, y: 58 },
    { x: 62, y: 42 },
    { x: 78, y: 22 },
  ];
  return (
    <div className="relative h-[420px] w-full overflow-hidden md:h-[520px]">
      {/* yulduzlar */}
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${(i * 37 + day * 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animationDelay: `${(i % 7) * 0.4}s`,
            opacity: 0.25 + ((i * 13) % 60) / 100,
          }}
        />
      ))}

      {/* 4 orol — z-index bo'yicha ustma-ust */}
      <div className="isle isle-1" style={{ left: "6%", top: "48%", width: "46%", height: "40%", zIndex: 1, transform: "rotate(-8deg)" }} />
      <div className="isle isle-2" style={{ left: "16%", top: "38%", width: "50%", height: "42%", zIndex: 2, transform: "rotate(4deg)" }} />
      <div className="isle isle-3" style={{ left: "30%", top: "28%", width: "48%", height: "42%", zIndex: 3, transform: "rotate(-4deg)" }} />
      <div className="isle isle-4" style={{ left: "44%", top: "22%", width: "40%", height: "36%", zIndex: 4, transform: "rotate(6deg)", opacity: 0.95 }} />

      {/* oltin-yashil yo'l */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" style={{ zIndex: 5 }}>
        <defs>
          <linearGradient id="goldPath" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8b07a" />
            <stop offset="55%" stopColor="#ffe9c9" />
            <stop offset="100%" stopColor="#7fe0c3" />
          </linearGradient>
        </defs>
        <path
          d="M 14 74 C 22 72, 26 66, 34 58 C 44 50, 52 52, 62 42 C 70 34, 72 30, 78 22"
          fill="none"
          stroke="url(#goldPath)"
          strokeWidth="0.7"
          strokeLinecap="round"
          className="path-glow"
          strokeDasharray="3 1.2"
        />
        <path
          d="M 14 74 C 30 78, 55 78, 72 52 C 78 42, 80 34, 82 26"
          fill="none"
          stroke="url(#goldPath)"
          strokeWidth="0.35"
          opacity="0.55"
          strokeDasharray="2 2"
        />
        {spots.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="1.1" fill="#fff7e8" opacity="0.95" />
            <circle cx={s.x} cy={s.y} r="2.1" fill="none" stroke="#e8b07a" strokeWidth="0.25" opacity="0.6" />
          </g>
        ))}
      </svg>

      {/* tugunlar */}
      {spots.map((s, i) => {
        const t = tasks[i];
        const done = t?.status === "done";
        const active = i === activeIdx;
        return (
          <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, zIndex: 10, transform: "translate(-50%,-90%)" }}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`grid h-11 w-11 place-items-center rounded-full border text-lg backdrop-blur ${
                  done
                    ? "bg-[#1a4a42] border-[#7fe0c3] text-white"
                    : active
                      ? "bg-[#e8b07a] border-white/60 text-[#2a1a0e] node-pulse"
                      : "bg-[#101d1b]/85 border-white/20 text-white/80"
                }`}
              >
                {done ? "✓" : icons[t?.kind || "vocab"] || "✦"}
              </div>
              <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${active ? "border-[#e8b07a88] bg-[#2a1a0e]/80 text-[#ffd9ad]" : "border-white/15 bg-black/55 text-white/85"}`}>
                {t ? shortUz[t.kind] || t.kind : `Bekat ${i + 1}`}
              </span>
            </div>
          </div>
        );
      })}

      {/* B2 maqsad tuguni */}
      <div className="absolute" style={{ right: "8%", top: "6%", zIndex: 11 }}>
        <div className="flex flex-col items-center gap-1">
          <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#7fe0c3] bg-[#0f2e29]/90 text-2xl shadow-[0_0_30px_rgba(127,224,195,0.5)]">
            🏆
          </div>
          <span className="text-[11px] font-bold tracking-widest text-white/70">B2 MAQSAD</span>
        </div>
      </div>
    </div>
  );
}
