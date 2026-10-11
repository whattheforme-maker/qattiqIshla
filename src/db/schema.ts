import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  date,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar").notNull().default("M"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  currentLevel: text("current_level").notNull().default("A1"),
  targetLevel: text("target_level").notNull().default("B2"),
  deadlineDays: integer("deadline_days").notNull().default(90),
  dailyMinutes: integer("daily_minutes").notNull().default(25),
  daysPerWeek: integer("days_per_week").notNull().default(5),
  purpose: text("purpose").notNull().default("ish"),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  weakAreas: jsonb("weak_areas").$type<string[]>().notNull().default([]),
  streakDays: integer("streak_days").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  freezeAvailable: integer("freeze_available").notNull().default(1),
  lastActiveDate: date("last_active_date"),
  totalXp: integer("total_xp").notNull().default(0),
  completedCount: integer("completed_count").notNull().default(0),
  startDate: date("start_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const placements = pgTable("placements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  level: text("level").notNull().default("A1"),
  weakAreas: jsonb("weak_areas").$type<string[]>().notNull().default([]),
  writingText: text("writing_text").default(""),
  writingScore: integer("writing_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  totalDays: integer("total_days").notNull().default(90),
  startDate: date("start_date").notNull(),
  weeks: jsonb("weeks").$type<unknown>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyTasks = pgTable("daily_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  titleUz: text("title_uz").notNull().default(""),
  minutes: integer("minutes").notNull().default(6),
  status: text("status").notNull().default("ready"),
  order: integer("order").notNull().default(0),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  result: jsonb("result").$type<Record<string, unknown>>().notNull().default({}),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vocabCards = pgTable("vocab_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  example: text("example").notNull().default(""),
  exampleUz: text("example_uz").notNull().default(""),
  ef: doublePrecision("ef").notNull().default(2.5),
  interval: integer("interval").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  nextReview: date("next_review").notNull(),
  lastQuality: integer("last_quality").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  xp: integer("xp").notNull().default(0),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
