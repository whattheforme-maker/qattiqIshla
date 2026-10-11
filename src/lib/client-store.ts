"use client";
// Local-first store — DB bilan sinxron, lekin offlayn ham ishlaydi.

export type LocalProfile = {
  name: string;
  email: string;
  currentLevel: string;
  targetLevel: string;
  deadlineDays: number;
  dailyMinutes: number;
  daysPerWeek: number;
  purpose: string;
  interests: string[];
  weakAreas: string[];
  streakDays: number;
  longestStreak: number;
  freezeAvailable: number;
  lastActiveDate: string | null;
  totalXp: number;
  completedCount: number;
  startDay: number;
  currentDay: number;
  onboarded: boolean;
  placed: boolean;
};

const KEY = "linguaplan_v1";

export const defaultProfile: LocalProfile = {
  name: "Mehmon",
  email: "",
  currentLevel: "A1",
  targetLevel: "B2",
  deadlineDays: 90,
  dailyMinutes: 25,
  daysPerWeek: 5,
  purpose: "ish",
  interests: ["Safar", "Ish"],
  weakAreas: [],
  streakDays: 0,
  longestStreak: 0,
  freezeAvailable: 1,
  lastActiveDate: null,
  totalXp: 0,
  completedCount: 0,
  startDay: 1,
  currentDay: 12,
  onboarded: false,
  placed: false,
};

export function loadProfile(): LocalProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(p: LocalProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function taskKey(day: number) {
  return `linguaplan_day_${day}`;
}

export function loadTasks(day: number): TaskState[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(taskKey(day));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTasks(day: number, tasks: TaskState[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(taskKey(day), JSON.stringify(tasks));
}

export type TaskState = {
  id: string;
  kind: string;
  title: string;
  titleUz: string;
  minutes: number;
  status: "pending" | "done";
  xp: number;
};

export function geminiKeyGet(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("linguaplan_gemini") || "";
}
export function geminiKeySet(k: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("linguaplan_gemini", k);
}

export function vocabGet(): Record<string, { ef: number; interval: number; reps: number; next: string; word: string; uz: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("linguaplan_vocab") || "{}");
  } catch {
    return {};
  }
}
export function vocabSet(v: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem("linguaplan_vocab", JSON.stringify(v));
}
