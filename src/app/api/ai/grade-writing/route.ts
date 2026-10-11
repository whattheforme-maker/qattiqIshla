import { geminiGenerate } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { text, level, userKey } = await req.json();
    const wc = (text || "").trim().split(/\s+/).filter(Boolean).length;
    const prompt = `You are an English teacher for Uzbek students (level ${level || "A1"}). Grade this writing (0-100), give short feedback in Uzbek, list 1-2 corrections. Text: """${(text || "").slice(0, 1500)}""" Return JSON: {"score":number,"feedbackUz":string,"corrections":string[]}`;
    const g = await geminiGenerate({ prompt, userKey, kind: "writing-grade" });
    try {
      const j = JSON.parse(g.text.replace(/```json|```/g, ""));
      if (typeof j.score === "number") return Response.json({ ...j, mocked: g.mocked, words: wc });
    } catch {}
    // fallback sof kod baho
    const score = Math.max(40, Math.min(95, 55 + Math.min(30, wc) + (g.mocked ? 0 : 5)));
    return Response.json({
      score,
      feedbackUz: g.mocked
        ? `Mock baho (${wc} so'z). Tuzilishi yaxshi. Past Simple tekshiring, bog'lovchilar qo'shing (because, then, finally). Gemini kalit qo'ysangiz batafsil tahlil beradi.`
        : g.text.slice(0, 500),
      mocked: g.mocked,
      words: wc,
    });
  } catch {
    return Response.json({ score: 70, feedbackUz: "Yaxshi urinish! Davom eting.", mocked: true });
  }
}
