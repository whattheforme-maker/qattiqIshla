// Server: Gemini chaqiruv + mock fallback.
// Foydalanuvchi tokenni Sozlamalarda kiritadi (x-user-key header yoki body.userKey).
// Hech qanday kalit bo'lmasa — mock rejim.

export async function geminiGenerate(opts: {
  prompt: string;
  userKey?: string;
  kind?: string;
}): Promise<{ text: string; mocked: boolean }> {
  const serverKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const key = opts.userKey?.trim() || serverKey;
  if (!key) {
    return { text: mockFor(opts.kind || "general", opts.prompt), mocked: true };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: opts.prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1200 },
        }),
        signal: ctrl.signal,
      }
    );
    clearTimeout(t);
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const j = await res.json();
    const text =
      j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ||
      mockFor(opts.kind || "general", opts.prompt);
    return { text, mocked: false };
  } catch {
    return { text: mockFor(opts.kind || "general", opts.prompt), mocked: true };
  }
}

function mockFor(kind: string, prompt: string): string {
  const short = prompt.slice(0, 120);
  if (kind === "writing-grade") {
    return JSON.stringify({
      score: 78,
      feedbackUz: "Yaxshi urinish! Gaplaringiz tushunarli. Past Simple'da 1 xato bor. Keyingi safar bog'lovchilar (because, then) qo'shing.",
      corrections: ["I go yesterday -> I went yesterday"],
      newLevelHint: "B1",
    });
  }
  if (kind === "placement-grade") {
    return JSON.stringify({ level: "A2", weak: ["grammar", "writing"], commentUz: "Mock baho: A2. Grammar ustida ishlang." });
  }
  return `Mock javob (${kind}): ${short} ... — Gemini kaliti kiritilmagan, lekin mashq to'liq ishlaydi. Sozlamalar > Gemini token ga kalit qo'ying.`;
}
