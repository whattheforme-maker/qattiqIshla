export const CEFR = ["A1", "A2", "B1", "B2", "C1"] as const;
export type Level = (typeof CEFR)[number];

export const LEVEL_INDEX: Record<string, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
};

// Sof kodda hisoblangan kerakli soatlar (CEFR tadqiqotlariga yaqin)
export const HOURS_PER_STEP: Record<string, number> = {
  "A1-A2": 110,
  "A2-B1": 160,
  "B1-B2": 200,
  "B2-C1": 260,
};

export function hoursNeeded(from: string, to: string): number {
  const a = LEVEL_INDEX[from] ?? 0;
  const b = LEVEL_INDEX[to] ?? 3;
  if (b <= a) return 0;
  let h = 0;
  for (let i = a; i < b; i++) {
    const key = `${CEFR[i]}-${CEFR[i + 1]}`;
    h += HOURS_PER_STEP[key] ?? 150;
  }
  return h;
}

export function xpForLevel(level: string): number {
  return (LEVEL_INDEX[level] ?? 0) * 1200;
}

export function levelFromXpAndBase(baseLevel: string, xp: number): string {
  // Har 1200 XP ~ yarim daraja; tugallangan vazifaga qarab oshadi
  const base = LEVEL_INDEX[baseLevel] ?? 0;
  const steps = Math.floor(xp / 1200);
  const idx = Math.min(4, base + steps);
  return CEFR[idx];
}

export function progressToNextLevel(baseLevel: string, xp: number): number {
  const within = xp % 1200;
  return Math.round((within / 1200) * 100);
}

export function skillShare(week: number): Record<string, number> {
  // Hafta o'sishi bilan ulush siljiydi — sof kod
  if (week <= 2) return { vocab: 35, grammar: 30, reading: 15, listening: 10, writing: 5, speaking: 5 };
  if (week <= 5) return { vocab: 25, grammar: 25, reading: 20, listening: 15, writing: 8, speaking: 7 };
  if (week <= 9) return { vocab: 20, grammar: 20, reading: 20, listening: 18, writing: 12, speaking: 10 };
  return { vocab: 15, grammar: 15, reading: 20, listening: 20, writing: 15, speaking: 15 };
}

export function estimateDays(
  from: string,
  to: string,
  dailyMinutes: number,
  daysPerWeek: number
): number {
  const hours = hoursNeeded(from, to);
  const perWeekH = (dailyMinutes / 60) * daysPerWeek;
  if (perWeekH <= 0) return 9999;
  return Math.ceil((hours / perWeekH) * 7);
}
