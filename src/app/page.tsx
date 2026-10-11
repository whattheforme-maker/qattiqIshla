import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Landing() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 md:px-6 pb-24">
      <header className="flex items-center justify-between pt-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#1e5a4f] to-[#0f2e29] border border-white/10 text-xl">🧭</span>
          <span className="text-xl font-semibold">linguaplan</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="chip rounded-full px-5 py-2.5 text-sm text-white/80 hover:text-white">Kirish</Link>
          <Link href="/register" className="btn-gold rounded-full px-5 py-2.5 text-sm font-bold">Boshlash →</Link>
        </div>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-[28px] p-8 md:p-12">
          <p className="text-xs font-bold tracking-[0.25em] text-[#e8b07a]">A1 → C1 • O'ZBEKCHA • SUN'IY INTELLEKT BILAN</p>
          <h1 className="font-display mt-4 text-5xl leading-[1.05] md:text-6xl">
            Inglizchani <span className="gold-text italic">kosmik reja</span> bilan o'rganing
          </h1>
          <p className="mt-4 max-w-[520px] text-white/70">
            Darajangizni test aniqlaydi. Maqsad + muddat realmi — sof kod halol hisoblaydi.
            Har kuni <b>hech biri takrorlanmaydigan</b> 3–6 interaktiv vazifa. Zeriksangiz — inglizcha o'yin chiqadi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="btn-gold rounded-2xl px-7 py-3.5 font-bold">Darajani aniqlash →</Link>
            <Link href="/day/12" className="chip rounded-2xl px-7 py-3.5 text-white/80">Demo kunni ko'rish</Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              ["20+7", "savolli placement test"],
              ["∞", "unikal vazifa formati"],
              ["SM-2", "aqlli takrorlash"],
            ].map(([a, b]) => (
              <div key={b} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="font-display text-2xl text-[#ffd9ad]">{a}</p>
                <p className="text-[11px] text-white/60">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass rounded-[28px] p-6">
            <p className="text-xs font-bold tracking-widest text-white/50">QANDAY ISHLAYDI</p>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                ["1", "Ro'yxat + maqsad", "B2, 90 kun, kuniga 25 daqiqa — xohlaganingizcha"],
                ["2", "Placement test", "20 MCQ + yozma, AI baholaydi, zaif joylar chiqadi"],
                ["3", "Halol hisob", "✅ Realistik / ⚠️ Qiyin / ❌ Real emas + 3 muqobil"],
                ["4", "Har kuni vazifa", "Vocab, grammatika, reading, listening (TTS), writing, speaking"],
                ["5", "Daraja o'sadi", "XP + streak + SRS — A1 dan C1 sari"],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8b07a22] border border-[#e8b07a55] text-sm font-bold text-[#ffd9ad]">{n}</span>
                  <span><b>{t}</b><br /><span className="text-white/60">{d}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass rounded-[28px] p-6">
            <p className="text-xs font-bold tracking-widest text-white/50">GEMINI TOKEN</p>
            <p className="mt-2 text-sm text-white/70">
              Tokenni keyin o'zingiz qo'yasiz: <b>Sozlamalar → Gemini token</b>. Hozir kalitsiz ham <b>mock rejim</b>da to'liq ishlaydi — hech qayerda qotib qolmaydi.
            </p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="chip rounded-full px-3 py-1.5">🔥 streak + freeze</span>
              <span className="chip rounded-full px-3 py-1.5">🎮 anti-zerikish</span>
              <span className="chip rounded-full px-3 py-1.5">📊 progress</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["🧩", "Hech qachon takrorlanmaydi", "Har vazifa seed + tarix filtri bilan yangi formatda: match, type, quiz, hikoya, dialog..."],
          ["😴 Zerikdingizmi?", "50 sek harakatsizlik yoki 12 sek kutish — darhol inglizcha mini-o'yin (scramble, translate, memory)."],
          ["📈 Daraja o'sadi", "Har tugallangan vazifa XP beradi. 1200 XP ≈ yarim daraja. Streak qatori olovlanadi."],
        ].map(([i, t, d]) => (
          <div key={t} className="glass rounded-[24px] p-6">
            <p className="text-3xl">{i}</p>
            <p className="mt-2 font-bold">{t}</p>
            <p className="mt-1 text-sm text-white/60">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
