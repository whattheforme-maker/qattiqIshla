import { skillShare } from "./levels";

const TOPICS = [
  "Salomlashuv va tanishuv",
  "Oila va do'stlar",
  "Kundalik tartib",
  "Safar va aeroport",
  "Mehmonxona va bron",
  "Restoran va buyurtma",
  "Xarid va bozor",
  "Ob-havo va fasllar",
  "Ish va kasblar",
  "Intervyu va CV",
  "Ta'lim va imtihon",
  "Texnologiya",
  "Salomatlik",
  "Sport",
  "Kino va musiqa",
  "Kitoblar va hikoyalar",
  "Shahar va yo'nalish",
  "Pul va bank",
  "Tabiat va ekologiya",
  "Bayramlar",
  "Do'kon va mijoz",
  "Telefon qo'ng'irog'i",
  "Email yozish",
  "Taqdimot qilish",
];

const GRAMMAR_SEQ = [
  "to be va kishilik olmoshlari",
  "Present Simple",
  "Present Continuous",
  "a/an/the artikllari",
  "Ko'plik va sanaladigan/sanalmaydigan otlar",
  "Past Simple",
  "Past Continuous",
  "Present Perfect",
  "Past Perfect vs Past Simple",
  "Future Simple / going to",
  "Modal fe'llar (can, must, should)",
  "Comparative & Superlative",
  "Conditionals Type 1",
  "Conditionals Type 2",
  "Passive Voice",
  "Reported Speech",
  "Relative Clauses",
  "Gerund vs Infinitive",
  "Phrasal verbs",
  "Word order & Questions",
];

export function buildPlan(input: {
  from: string;
  to: string;
  totalDays: number;
  interests: string[];
}) {
  const weeks: {
    week: number;
    theme: string;
    grammar: string;
    share: Record<string, number>;
    review: boolean;
  }[] = [];
  const totalWeeks = Math.max(1, Math.ceil(input.totalDays / 7));
  for (let w = 1; w <= totalWeeks; w++) {
    const topicPool =
      input.interests.length > 0
        ? [...input.interests, ...TOPICS]
        : TOPICS;
    const theme = topicPool[(w * 5 + totalWeeks) % topicPool.length];
    const grammar = GRAMMAR_SEQ[(w - 1) % GRAMMAR_SEQ.length];
    weeks.push({
      week: w,
      theme,
      grammar,
      share: skillShare(w),
      review: w % 1 === 0, // har hafta review
    });
  }
  return { weeks, totalWeeks };
}

export function dayKinds(day: number, totalDays: number): string[] {
  if (day === totalDays) return ["review", "mini-test", "final"];
  if (day % 7 === 0) return ["review", "mini-test", "vocab"];
  if (day % 7 === 6) return ["speaking", "listening", "vocab"];
  const rot: string[][] = [
    ["vocab", "grammar", "reading", "listening"],
    ["grammar", "listening", "vocab", "writing"],
    ["reading", "vocab", "speaking", "grammar"],
    ["listening", "reading", "grammar", "vocab"],
    ["writing", "vocab", "listening", "reading"],
    ["vocab", "speaking", "reading", "grammar"],
  ];
  return rot[day % rot.length];
}
