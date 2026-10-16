# AGENTS.md — LinguaPlan (LangWeb) loyihasi xaritasi

> Bu fayl sun'iy intellekt yordamchilari (Cline, Cursor, Codex, Copilot va h.k.) uchun loyihani tez tushunish maqsadida yozilgan. **Avval shu faylni o'qing.** Til: UI va matnlar o'zbekcha, kod inglizcha.

---

## 1. Loyiha nima qiladi?

**LinguaPlan** — ingliz tilini A1 → C1 darajalarigacha o'rganish uchun **local-first, gamifikatsiyalangan, AI yordamidagi** veb-ilova (Next.js App Router).

Asosiy funksiyalar:

1. **Ro'yxatdan o'tish / kirish** (JWT cookie + bcrypt, PostgreSQL da doimiy saqlash; DB sozlanmagan holda xato beradi, local save qilmaydi).
2. **Onboarding** — maqsad darajasi (A2…C1), muddat (kun), kunlik daqiqa, qiziqishlar. Server profiliga saqlanadi.
3. **Placement test** — seed asosida individual 20 ta MCQ + yozma. Natija DB ga saqlanadi.
4. **“Halol hisob” (Feasibility)** — maqsad realligi. ✅ Realistik / ⚠️ Qiyin / ❌ Real emas + 3 ta variant.
5. **Reja (Plan)** — haftalik yo'l xaritasi. DB da saqlanadi.
6. **Kunlik vazifalar (Day)** — 3–6 ta takrorlanmaydigan vazifa. DB da saqlanadi (authenticated uchun).
7. **Vazifa bajarish (TaskRunner)** — interaktiv UI, XP beradi, vocab → SRS.'ga tushadi. DB ga saqlanadi.
8. **Takrorlash (Review)** — SM-2 algoritmi bilan so'z kartalari. DB da saqlanadi.
9. **Natijalar (Progress)** — daraja/XP, streak, skill grafigi. DB dan qaytariladi.
10. **Zerikish himoyasi (BoredomGuard)** — 50s / 12s — mini-o'yin ochadi.
11. **Sozlamalar** — Gemini API kaliti, JSON export, local wipe.

---

## 2. Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Framework | Next.js 16.2.6 (App Router), React 19.2.6 |
| Til | TypeScript 5.9.3 (strict: true) |
| Styling | Tailwind CSS v4, custom glass/cosmic sinflar |
| DB | PostgreSQL + Drizzle ORM 0.45, pg pool |
| Cloud DB | Neon / Supabase |
| Auth | bcryptjs (hash) + jsonwebtoken (JWT, 30 kun), linguaplan_session HttpOnly cookie |
| AI | Google Gemini (gemini-2.0-flash REST) — server kaliti yoki foydalanuvchi kaliti |
| Migratsiya | drizzle-kit + migrate.sql |

Buyruqlar: npm run dev, npm run build, npm run start, npm run lint, npm run typecheck.
Path alias: @/* → ./src/*

---

## 3. Arxitektura: LOCAL-FIRST + ICHOCHIROLIO DB

Ilova **ikki asosiy rejimda** ishlaydi:

### 3.1 Mehmon / demo rejim (auth yo'q, DB yo'q)

- Barcha ma'lumotlar localStorage da (src/lib/client-store.ts).
- DB sozlanmagan bo'lsa, /api/auth/register va /api/auth/login **503** qaytaradi — local save qilinmaydi.

### 3.2 Authenticated online mode (DB bor, cookie bor)

- linguaplan_session JWT cookie o'rnatiladi (HttpOnly, Path=/, SameSite=Lax, Secure HTTPS da, 30 kun).
- Server users, profiles, placements, plans, daily_tasks, vocab_cards, activities jadvallarda saqlaydi.
- Client localStorage — kesh, server — manba haqiqatidan.

### 3.3 Qoida

- DB yoki AI'siz ishlash majburiy: har bir API route'da try/catch + aniq xato javob.
- Hech qanday api ok: true qaytarsa DB yazish amalga oshmagan bo'lmasa.
- DB sozlanmagan holda ro'yxatdan o'tish / kirish rad etiladi (503), local fallback qilmaydi.

---

## 4. Dizayn tili (UI)

UI matnlari — o'zbekcha Latin. Dizayn — .glass, .btn-gold, .chip sinflari va emoji ikonlamalar.
Rang palitra: qora/kosmik fon, oltin va yashil.

---

## 5. API endpointlar

| Endpoint | Method | Auth | Vazifasi |
|---|---|---|---|
| /api/auth/register | POST | Yo'q | Ro'yxatdan o'tish, profil yaratish, JWT cookie |
| /api/auth/login | POST | Yo'q | Kirish, JWT cookie |
| /api/auth/logout | POST | Yo'q | Session cookie ni o'chirish |
| /api/profile | GET | Ha | Foydalanuvchi profili |
| /api/profile | POST | Ha | Profil yangilash |
| /api/placement | GET | Ha | Placement natijalari |
| /api/placement | POST | Ha | Placement saqlash |
| /api/tasks | GET | Ha | Kunlik vazifalar |
| /api/tasks | POST | Ha | Vazifa yaratish |
| /api/vocab | GET | Ha | SRS so'z kartalari |
| /api/vocab | POST | Ha | So'z kartasi saqlash |
| /api/plan | GET | Ha | Foydalanuvchi rejasi |
| /api/plan | POST | Ha | Rejani saqlash |
| /api/activities | GET | Ha | Faoliyatlar tarixi |
| /api/activities | POST | Ha | Faoliyat yozish |
| /api/ai/grade-placement | POST | Yo'q | Placement yozma baholash |
| /api/ai/grade-writing | POST | Yo'q | Writing baholash |
| /api/health | GET | Yo'q | DB ulanish holati |

---

## 6. localStorage kalitlari

| Kalit | Mazmuni |
|---|---|
| linguaplan_v1 | LocalProfile (isAuthenticated bilan) |
| linguaplan_user | {name, email} sessiya markeri |
| linguaplan_day_{n} | n-kun vazifalari |
| linguaplan_payload_{n} | n-kun payloadlari |
| linguaplan_vocab | SRS so'z kartalari |
| linguaplan_gemini | Foydalanuvchi Gemini kaliti (faqat clientda) |

Cookie: linguaplan_session (HttpOnly, JWT, 30 kun, Path=/).

---

## 7. Env o'zgaruvchilari (hosting paneli da o'rnating, Git'ga kiritilmaydi!)

| Nom | Majburiymi? | Vazifasi |
|---|---|---|
| DATABASE_URL | Ha (production) | PostgreSQL ulanish |
| AUTH_SECRET | Ha (production) | JWT imzalash kaliti |
| GEMINI_API_KEY | Yo'q | Server Gemini kaliti |
| NEXT_PUBLIC_APP_URL | Yo'q | Faqat clientda kerak bo'lsa |

**Eslatma:** NEXT_PUBLIC_* bilan boshlanuvchi o'zgaruvchilar brauzerga yuboriladi. Server kalitlarni undan ochirmoqchi bo'lsangiz, uni NEXT_PUBLIC_ qo'shmang.

---

## 8. Production deployment

1. PostgreSQL bazani yarating (Neon, Supabase).
2. migrate.sql ni bazada bir marta ishga tushiring.
3. Hosting paneli da DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY o'rnating.
4. npm run build va npm run start.
5. GET /api/health orqali DB ulanishini tekshiring.

**Never commit real secrets.**

---

## 9. Qoidalar (yangi kod qo'shganda)

1. Avval AGENTS.md va src/lib/client-store.ts ni o'qing.
2. UI matnlari — o'zbekcha; dizayn — .glass / .btn-gold / .chip.
3. Biznes-logika — src/lib/ da sof funksiyalar.
4. DB yoki AI'siz ishlash majburiy.
5. Validatsiya: npm run typecheck → npm run lint → npm run build.
6. Foydalanuvchi ma'lumotlarini faqat o'zi (sessiya id orqali) o'qisha/tahrirlashga ruxsat bering.
7. localStorage faqat kesh uchun — server DB manba haqiqatidan.

---