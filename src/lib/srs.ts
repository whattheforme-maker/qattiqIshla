// SM-2 (SuperMemo 2) — sof kod
export function sm2(
  quality: number,
  prev: { ef: number; interval: number; reps: number }
): { ef: number; interval: number; reps: number; lapses: number } {
  let { ef, interval, reps } = prev;
  let lapses = 0;
  const q = Math.max(0, Math.min(5, quality));
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;
  if (q < 3) {
    reps = 0;
    interval = 1;
    lapses = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
  }
  return { ef: Math.round(ef * 100) / 100, interval, reps, lapses };
}

export function nextReviewDate(intervalDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + intervalDays);
  return d.toISOString().slice(0, 10);
}

export function todayStr(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isDue(nextReview: string): boolean {
  return nextReview <= todayStr();
}
