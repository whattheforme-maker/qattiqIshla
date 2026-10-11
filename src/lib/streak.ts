import { todayStr } from "./srs";

export function diffDays(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

// Streak: kuniga >=1 vazifa. Haftada 1 freeze.
export function updateStreak(state: {
  streakDays: number;
  longestStreak: number;
  freezeAvailable: number;
  lastActiveDate: string | null;
}): { streakDays: number; longestStreak: number; freezeAvailable: number; lastActiveDate: string; freezeUsed: boolean; reset: boolean } {
  const today = todayStr();
  if (state.lastActiveDate === today) {
    return { ...state, lastActiveDate: today, freezeUsed: false, reset: false };
  }
  if (!state.lastActiveDate) {
    const s = state.streakDays + 0 || 1;
    return {
      streakDays: 1,
      longestStreak: Math.max(1, state.longestStreak),
      freezeAvailable: state.freezeAvailable,
      lastActiveDate: today,
      freezeUsed: false,
      reset: false,
    };
  }
  const gap = diffDays(state.lastActiveDate, today);
  if (gap === 1) {
    const s = state.streakDays + 1;
    return {
      streakDays: s,
      longestStreak: Math.max(s, state.longestStreak),
      freezeAvailable: 1, // yangi haftada yangilanadi (soddalashtirilgan: har yangi kunda 1)
      lastActiveDate: today,
      freezeUsed: false,
      reset: false,
    };
  }
  if (gap === 2 && state.freezeAvailable > 0) {
    const s = state.streakDays + 1;
    return {
      streakDays: s,
      longestStreak: Math.max(s, state.longestStreak),
      freezeAvailable: 0,
      lastActiveDate: today,
      freezeUsed: true,
      reset: false,
    };
  }
  return {
    streakDays: 1,
    longestStreak: state.longestStreak,
    freezeAvailable: state.freezeAvailable,
    lastActiveDate: today,
    freezeUsed: false,
    reset: true,
  };
}

export function catchUpPlan(skippedDays: number): {
  mode: string;
  desc: string;
}[] {
  return [
    {
      mode: "distribute",
      desc: `${skippedDays} kunlik yuk keyingi 3 kunga teng taqsimlanadi (+${Math.ceil(
        (skippedDays * 25) / 3
      )} daq/kun).`,
    },
    {
      mode: "shift",
      desc: `Muddat ${skippedDays} kunga orqaga siljiydi, kunlik yuk o'zgarmaydi.`,
    },
    {
      mode: "skip",
      desc: `O'tkazilgan kunlar tashlab yuboriladi, rejadan %${Math.min(
        12,
        skippedDays * 3
      )} qisqaradi — eng yengil yo'l.`,
    },
  ];
}
