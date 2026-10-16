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
  isAuthenticated: boolean;
  userId?: string;
};

const KEY = "linguaplan_v1";
const USER_KEY = "linguaplan_user";

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
  currentDay: 1,
  onboarded: false,
  placed: false,
  isAuthenticated: false,
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

export function clearLocalData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("linguaplan_gemini");
  localStorage.removeItem("linguaplan_vocab");
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith("linguaplan_day_") || k.startsWith("linguaplan_payload_"))) {
      localStorage.removeItem(k);
      i--;
    }
  }
}

export function getLocalUser(): { name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalUser(u: { name: string; email: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

export function clearLocalUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

// --- Server sync helpers (authenticated mode) ---

async function apiJson(path: string, opts?: { method?: string; body?: unknown }): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  return fetch(path, {
    method: opts?.method || "GET",
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  });
}

export type ServerProfile = {
  user: { id: string; name: string; email: string; avatar: string };
  profile: {
    current_level: string;
    target_level: string;
    deadline_days: number;
    daily_minutes: number;
    days_per_week: number;
    purpose: string;
    interests: string[];
    weak_areas: string[];
    streak_days: number;
    longest_streak: number;
    freeze_available: number;
    last_active_date: string | null;
    total_xp: number;
    completed_count: number;
    start_date: string | null;
    updated_at: string;
  } | null;
};

export async function fetchServerProfile(): Promise<ServerProfile | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await apiJson("/api/profile");
    if (!res.ok) return null;
    return (await res.json()) as ServerProfile;
  } catch {
    return null;
  }
}

export async function saveProfileToServer(p: Partial<LocalProfile>): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await apiJson("/api/profile", {
      method: "POST",
      body: {
        currentLevel: p.currentLevel,
        targetLevel: p.targetLevel,
        deadlineDays: p.deadlineDays,
        dailyMinutes: p.dailyMinutes,
        daysPerWeek: p.daysPerWeek,
        purpose: p.purpose,
        interests: p.interests,
        weakAreas: p.weakAreas,
        totalXp: p.totalXp,
        streakDays: p.streakDays,
        freezeAvailable: p.freezeAvailable,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
