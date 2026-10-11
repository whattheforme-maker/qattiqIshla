import { hoursNeeded } from "./levels";

export type Verdict = "realistik" | "qiyin" | "real-emas";

export function feasibility(input: {
  from: string;
  to: string;
  deadlineDays: number;
  dailyMinutes: number;
  daysPerWeek: number;
}) {
  const needHours = hoursNeeded(input.from, input.to);
  const studyDays = Math.round((input.deadlineDays / 7) * input.daysPerWeek);
  const haveHours = (studyDays * input.dailyMinutes) / 60;
  const ratio = needHours === 0 ? 1 : haveHours / needHours;

  let verdict: Verdict = "realistik";
  if (ratio < 0.55) verdict = "real-emas";
  else if (ratio < 0.9) verdict = "qiyin";

  const needDailyForPlan = studyDays > 0 ? Math.ceil((needHours / studyDays) * 60) : 0;
  const needDaysForDaily =
    input.dailyMinutes > 0
      ? Math.ceil(needHours / (input.dailyMinutes / 60) / (input.daysPerWeek / 7))
      : 0;

  return {
    needHours,
    haveHours: Math.round(haveHours),
    studyDays,
    ratio: Math.round(ratio * 100) / 100,
    verdict,
    alternatives: [
      {
        id: "more-minutes",
        title: `Kunlik vaqtni ${Math.min(120, needDailyForPlan)} daqiqaga oshiring`,
        desc: `${input.deadlineDays} kunda maqsadga yetish uchun shu kerak.`,
        dailyMinutes: needDailyForPlan,
        deadlineDays: input.deadlineDays,
        target: input.to,
      },
      {
        id: "more-time",
        title: `Muddatni ${needDaysForDaily} kunga uzaytiring`,
        desc: `Hozirgi ${input.dailyMinutes} daqiqa bilan real muddat.`,
        dailyMinutes: input.dailyMinutes,
        deadlineDays: needDaysForDaily,
        target: input.to,
      },
      {
        id: "lower-goal",
        title: `Maqsadni bir pog'ona pastlatib oraliq g'alaba qiling`,
        desc: `Avval keyingi darajani mahkamlang, keyin ${input.to} ga sakrang.`,
        dailyMinutes: input.dailyMinutes,
        deadlineDays: input.deadlineDays,
        target: lowerTarget(input.to),
      },
    ],
  };
}

function lowerTarget(t: string) {
  const order = ["A1", "A2", "B1", "B2", "C1"];
  const i = order.indexOf(t);
  return i > 0 ? order[i - 1] : t;
}
