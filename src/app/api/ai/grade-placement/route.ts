import { geminiGenerate } from "@/lib/gemini";
import { gradePlacement } from "@/lib/taskgen";

export async function POST(req: Request) {
  try {
    const { score, total, writing, userKey } = await req.json();
    const base = gradePlacement(score || 0, (writing || "").length);
    const prompt = `Placement: ${score}/${total}, writing: """${(writing || "").slice(0, 800)}""". Base level ${base.level}. Confirm or adjust CEFR A1-C1 and weak areas. Return JSON {"level":string,"weak":string[]}`;
    const g = await geminiGenerate({ prompt, userKey, kind: "placement-grade" });
    try {
      const j = JSON.parse(g.text.replace(/```json|```/g, ""));
      if (j.level && ["A1", "A2", "B1", "B2", "C1"].includes(j.level)) {
        return Response.json({ level: j.level, weak: j.weak || base.weak, mocked: g.mocked });
      }
    } catch {}
    return Response.json({ level: base.level, weak: base.weak, mocked: true });
  } catch {
    return Response.json({ level: "A1", weak: ["grammar", "vocab"], mocked: true });
  }
}
