// Har bir vazifa eskisiga o'xshamasin — katta hovuz + seed + tarix filtri
// Har safar har xil interaktiv format.

export type TaskKind =
  | "vocab"
  | "grammar"
  | "reading"
  | "listening"
  | "writing"
  | "speaking"
  | "review"
  | "mini-test"
  | "final";

export function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const VOCAB_POOL: { en: string; uz: string; ex: string; exUz: string; topic: string; lvl: string }[] = [
  { en: "journey", uz: "sayohat", ex: "Our journey to Samarkand was amazing.", exUz: "Samarqandga sayohatimiz ajoyib bo'ldi.", lvl: "A2", topic: "Safar" },
  { en: "delay", uz: "kechikish", ex: "The flight had a two-hour delay.", exUz: "Reys ikki soat kechikdi.", lvl: "A2", topic: "Aeroport" },
  { en: "luggage", uz: "yuk (chamadon)", ex: "Where can I collect my luggage?", exUz: "Yukimni qayerdan olsam bo'ladi?", lvl: "A1", topic: "Aeroport" },
  { en: "appointment", uz: "uchrashuv (belgilangan)", ex: "I have an appointment at 10.", exUz: "Soat 10 da uchrashuvim bor.", lvl: "A2", topic: "Ish" },
  { en: "opportunity", uz: "imkoniyat", ex: "This job is a great opportunity.", exUz: "Bu ish zo'r imkoniyat.", lvl: "B1", topic: "Ish" },
  { en: "recipe", uz: "retsept / taom retsepti", ex: "Can you share the soup recipe?", exUz: "Sho'rva retseptini bera olasizmi?", lvl: "A2", topic: "Taom" },
  { en: "ancient", uz: "qadimiy", ex: "Khiva is an ancient city.", exUz: "Xiva qadimiy shahar.", lvl: "B1", topic: "Tarix" },
  { en: "bridge", uz: "ko'prik", ex: "The bridge connects two banks.", exUz: "Ko'prik ikki qirg'oqni bog'laydi.", lvl: "A1", topic: "Shahar" },
  { en: "courage", uz: "jasorat", ex: "She had the courage to speak.", exUz: "U gapirishga jasorat topdi.", lvl: "B2", topic: "Xarakter" },
  { en: "honest", uz: "halol", ex: "Be honest with your teacher.", exUz: "Ustozingizga nisbatan halol bo'ling.", lvl: "A1", topic: "Xarakter" },
  { en: "improve", uz: "yaxshilamoq", ex: "I want to improve my listening.", exUz: "Tinglab tushunishimni yaxshilamoqchiman.", lvl: "A2", topic: "O'quv" },
  { en: "habit", uz: "odat", ex: "Reading is a good habit.", exUz: "Kitob o'qish yaxshi odat.", lvl: "A1", topic: "O'quv" },
  { en: "bargain", uz: "savdolashmoq", ex: "You can bargain in the bazaar.", exUz: "Bozorda savdolashsa bo'ladi.", lvl: "B1", topic: "Bozor" },
  { en: "eager", uz: "ishtiyoqmand", ex: "He is eager to learn English.", exUz: "U inglizcha o'rganishga ishtiyoqmand.", lvl: "B1", topic: "O'quv" },
  { en: "fragile", uz: "mo'rt, sinuvchan", ex: "Glass is fragile.", exUz: "Shisha mo'rt.", lvl: "B1", topic: "Buyum" },
  { en: "generous", uz: "saxiy", ex: "My neighbour is very generous.", exUz: "Qo'shnim juda saxiy.", lvl: "B1", topic: "Xarakter" },
  { en: "curious", uz: "qiziquvchan", ex: "Children are naturally curious.", exUz: "Bolalar tabiiy qiziquvchan.", lvl: "A2", topic: "Xarakter" },
  { en: "thunder", uz: "momaqaldiroq", ex: "Thunder woke me up.", exUz: "Momaqaldiroq meni uyg'otdi.", lvl: "B1", topic: "Ob-havo" },
  { en: "invoice", uz: "hisob-faktura", ex: "Please send the invoice.", exUz: "Iltimos, hisob-fakturani yuboring.", lvl: "B2", topic: "Biznes" },
  { en: "deadline", uz: "muddati", ex: "The deadline is Friday.", exUz: "Muddati juma kuni.", lvl: "B1", topic: "Ish" },
  { en: "whisper", uz: "shivirlash", ex: "Don't whisper in class.", exUz: "Darsda shivirlashma.", lvl: "B1", topic: "Muloqot" },
  { en: "embrace", uz: "quchoqlamoq", ex: "They embraced at the airport.", exUz: "Ular aeroportda quchoqlashdi.", lvl: "B2", topic: "Hissiyot" },
  { en: "rescue", uz: "qutqarmoq", ex: "They rescued the cat.", exUz: "Ular mushukni qutqarishdi.", lvl: "A2", topic: "Hodisa" },
  { en: "punctual", uz: "vaqtida keladigan", ex: "Be punctual for the interview.", exUz: "Intervyuga vaqtida boring.", lvl: "B1", topic: "Ish" },
];

const GRAMMAR_TOPICS = [
  { t: "Past Simple vs Past Perfect", ruleUz: "Avval tugagan ish — Past Perfect (had + V3), keyingi — Past Simple.", exs: [["When I arrived, the train had left.", "Men kelganimda poyezd ketib bo'lgan edi."],["She had finished before he called.", "U qo'ng'iroq qilishidan oldin tugatib bo'lgan edi."]] },
  { t: "Present Perfect", ruleUz: "have/has + V3 — natijasi hozir ko'rinadigan o'tmish.", exs: [["I have just finished my homework.", "Men hozirgina vazifamni tugatdim."],["Have you ever been to London?", "Hech Londonda bo'lganmisiz?"]] },
  { t: "Conditionals Type 1", ruleUz: "If + Present Simple, will + V — real kelajak.", exs: [["If it rains, we will stay home.", "Yomg'ir yog'sa, uyda qolamiz."]] },
  { t: "Passive Voice", ruleUz: "be + V3 — ish kim tomonidan muhim emas.", exs: [["The cake was baked by mom.", "Tort onam tomonidan pishirildi."]] },
  { t: "Articles a/an/the", ruleUz: "Birinchi marta — a/an, ma'lum narsa — the.", exs: [["I saw a dog. The dog was cute.", "Men it ko'rdim. U it yoqimtoy edi."]] },
  { t: "Modal verbs", ruleUz: "can/must/should + V — qobiliyat, majburiyat, maslahat.", exs: [["You should rest.", "Siz dam olishingiz kerak."]] },
];

const READING_TEXTS = [
  {
    title: "Aeroportdagi suhbat",
    titleUz: "Aeroportdagi suhbat",
    text: "Sarah arrived at Tashkent airport two hours before her flight to Istanbul. She went to the check-in counter, showed her passport and got her boarding pass. Suddenly she heard an announcement: her flight was delayed by forty minutes. Instead of getting bored, she bought a coffee, opened her notebook and revised ten new English phrases. When boarding finally started, she felt calm and ready.",
    uz: "Sara Istanbulga uchishidan ikki soat oldin Toshkent aeroportiga keldi...",
    qs: [
      { q: "Why did Sarah come early?", opts: ["To meet a friend", "To catch her flight calmly", "To buy gifts", "To work"], a: 1 },
      { q: "What did she do during the delay?", opts: ["Slept", "Revised English phrases", "Called taxi", "Left airport"], a: 1 },
      { q: `"delayed" means...`, opts: ["cancelled", "late", "fast", "cheap"], a: 1 },
    ],
  },
  {
    title: "Bozorda savdo",
    titleUz: "Bozorda savdo",
    text: "Jasur went to Chorsu bazaar to buy fruit for his family. A seller offered fresh pomegranates. Jasur asked the price, bargained politely and bought three kilos. The seller smiled and added one extra apple as a gift. Jasur thanked him and learned a new phrase: 'Could you give me a discount?'",
    uz: "Jasur oilasi uchun meva olgani Chorsu bozoriga bordi...",
    qs: [
      { q: "What did Jasur buy?", opts: ["Vegetables", "Pomegranates", "Bread", "Fish"], a: 1 },
      { q: "What phrase did he learn?", opts: ["Open the door", "Give me a discount", "See you", "Good night"], a: 1 },
      { q: `"bargained" means...`, opts: ["argued angrily", "discussed price politely", "ran away", "paid extra"], a: 1 },
    ],
  },
  {
    title: "Kechki odatlar",
    titleUz: "Kechki odatlar",
    text: "Every evening, Malika spends twenty minutes with English. On Mondays she listens to a podcast, on Tuesdays she writes five sentences, on Wednesdays she reads a short story. Small steps, she says, build big results. After two months she can already introduce herself confidently.",
    uz: "Har oqshom Malika inglizchaga yigirma daqiqa ajratadi...",
    qs: [
      { q: "How long does she study?", opts: ["10 min", "20 min", "1 hour", "2 hours"], a: 1 },
      { q: "What does she do on Tuesdays?", opts: ["Listens", "Writes sentences", "Watches film", "Sleeps"], a: 1 },
      { q: "Main idea?", opts: ["Big steps once", "Small daily steps work", "Only grammar matters", "Tests are useless"], a: 1 },
    ],
  },
];

const LISTENING_SCRIPTS = [
  { title: "Aeroport e'loni", script: "Attention please. Flight TK-369 to Istanbul is now boarding at gate number five. Please have your passport and boarding pass ready. We wish you a pleasant flight.", qs: [{ q: "Which flight?", opts: ["TK-369", "TK-396", "TK-693", "TK-963"], a: 0 },{ q: "Which gate?", opts: ["3", "4", "5", "6"], a: 2 }] },
  { title: "Mehmonxona suhbati", script: "Good evening! Welcome to our hotel. Do you have a reservation? Yes, under the name Karimov. Perfect, your room is on the third floor. Breakfast is from seven to ten.", qs: [{ q: "Where?", opts: ["Airport", "Hotel", "Bank", "School"], a: 1 },{ q: "Breakfast time?", opts: ["6-9", "7-10", "8-11", "9-12"], a: 1 }] },
  { title: "Do'konda", script: "Hi! Can I help you? Yes, I'm looking for a winter jacket. What size are you? Medium, please. This blue one is on sale. Great, I'll try it on.", qs: [{ q: "What does customer want?", opts: ["Shoes", "Jacket", "Hat", "Bag"], a: 1 },{ q: "What size?", opts: ["S", "M", "L", "XL"], a: 1 }] },
];

const SPEAKING_PROMPTS = [
  { t: "O'zingni tanishtir (30 sek)", hint: "Name, age, city, job/hobby. Masalan: My name is... I live in..." },
  { t: "Kecha nima qilding?", hint: "Past Simple ishlat: Yesterday I woke up at... Then I..." },
  { t: "Orzuingdagi sayohat", hint: "I want to visit... because... There I will..." },
  { t: "Sevimli taomingni tasvirla", hint: "It is made of... It tastes... I eat it when..." },
  { t: "Do'stingga rejani tushuntir", hint: "Tomorrow I will... First... Then... Finally..." },
];

const WRITING_PROMPTS = [
  { t: "Aeroportdagi kunim (50-70 so'z)", hint: "Past Simple + yangi 3 so'z ishlat. Boshi, o'rtasi, oxiri bo'lsin." },
  { t: "Orzuimdagi ish (60-80 so'z)", hint: "Why do you want it? What skills? If I get it, I will..." },
  { t: "Do'stimga email (40-60 so'z)", hint: "Hi ..., How are you? I want to tell you about..." },
  { t: "Mening kunlik odatim (50 so'z)", hint: "Present Simple, frequency adverbs: always, usually, never." },
];

const GAME_BANK = [
  { en: "apple", uz: "olma", hint: "Red fruit" },
  { en: "bridge", uz: "ko'prik", hint: "Crosses river" },
  { en: "journey", uz: "sayohat", hint: "Travel" },
  { en: "courage", uz: "jasorat", hint: "Brave heart" },
  { en: "thunder", uz: "momaqaldiroq", hint: "Sky sound" },
  { en: "generous", uz: "saxiy", hint: "Gives much" },
  { en: "punctual", uz: "vaqtida keladigan", hint: "Never late" },
  { en: "recipe", uz: "retsept", hint: "Cooking steps" },
];

export function uniqueTasksForDay(opts: {
  day: number;
  level: string;
  interests: string[];
  usedTitles: string[];
  minutesTotal: number;
}): { kind: TaskKind; title: string; titleUz: string; minutes: number; payload: Record<string, unknown> }[] {
  const { day, level, interests } = opts;
  const rand = seededRand(day * 7919 + level.length * 131 + Date.now() % 100000);
  // Har kun rotatsiya — bir xil ketma-ketlik takrorlanmaydi
  const allKinds: TaskKind[] = ["vocab", "grammar", "reading", "listening", "writing", "speaking"];
  // kun raqamiga qarab aralashtirish
  for (let i = allKinds.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1) + ((day * 7 + i * 13) % 3)) % (i + 1);
    [allKinds[i], allKinds[j]] = [allKinds[j], allKinds[i]];
  }
  const count = opts.minutesTotal >= 40 ? 5 : opts.minutesTotal >= 25 ? 4 : 3;
  const picked = allKinds.slice(0, count);
  if (day % 7 === 0) {
    picked[picked.length - 1] = "review";
  }
  const interest = interests[day % Math.max(1, interests.length)] || "Safar";

  return picked.map((kind, idx) => {
    const seed = day * 100 + idx * 17 + Math.floor(rand() * 1000);
    const r = seededRand(seed);
    const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length) % arr.length];

    if (kind === "vocab") {
      const shuffled = vocabForLevel(level, 5, r);
      const formats = ["flash-kartalar + test", "rasmli topish o'yini", "gap tuzish", "tezlik viktorinasi", "eslab yozish"];
      return {
        kind,
        title: `New words: ${shuffled[0].topic} — ${pick(formats)}`,
        titleUz: `Lug'at: ${shuffled[0].topic} bo'yicha 5 yangi ibora`,
        minutes: 6,
        payload: { words: shuffled, format: pick(formats), interest, interaction: pick(["match", "type", "choose", "order"]) },
      };
    }
    if (kind === "grammar") {
      const g = pick(GRAMMAR_TOPICS);
      const f = pick(["bo'shliqni to'ldir", "xatoni top", "qayta yoz", "tanlov testi", "dialog tuz"]);
      return {
        kind,
        title: `${g.t} — ${f}`,
        titleUz: `Grammatika: ${g.t}`,
        minutes: 7,
        payload: { grammar: g, format: f, level },
      };
    }
    if (kind === "reading") {
      const t = pick(READING_TEXTS);
      return {
        kind,
        title: `${t.title} — o'qish + 3 savol`,
        titleUz: `O'qish: ${t.titleUz}`,
        minutes: 6,
        payload: { reading: t, mode: pick(["quiz", "true-false", "order-events", "find-word"]) },
      };
    }
    if (kind === "listening") {
      const l = pick(LISTENING_SCRIPTS);
      return {
        kind,
        title: `${l.title} — tinglash`,
        titleUz: `Tinglash: ${l.title}`,
        minutes: 6,
        payload: { listening: l, tts: true, speed: pick(["0.9x", "1x", "1.1x"]) },
      };
    }
    if (kind === "writing") {
      const w = pick(WRITING_PROMPTS);
      return {
        kind,
        title: w.t,
        titleUz: `Yozish: ${w.t}`,
        minutes: 6,
        payload: { prompt: w, minWords: 40, aiGrade: true },
      };
    }
    if (kind === "speaking") {
      const s = pick(SPEAKING_PROMPTS);
      return {
        kind,
        title: s.t,
        titleUz: `Gapirish: ${s.t}`,
        minutes: 5,
        payload: { prompt: s, recordSecs: 45 },
      };
    }
    return {
      kind: "review" as TaskKind,
      title: "Takrorlash: SRS kartalar",
      titleUz: "Takrorlash",
      minutes: 5,
      payload: { auto: true },
    };
  });
}

export type VocabWord = { en: string; uz: string; ex: string; exUz: string; topic: string; lvl: string };
const LVL_IDX: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };
// Darajaga qarab so'z: o'z darajasi + 1 past + 1 yuqori (tabiiy o'sish)
export function vocabForLevel(level: string, count: number, rand: () => number): VocabWord[] {
  const idx = LVL_IDX[level] ?? 0;
  const near = (VOCAB_POOL as VocabWord[]).filter((w) => Math.abs((LVL_IDX[w.lvl] ?? 1) - idx) <= 1);
  const pool = near.length >= count ? near : (VOCAB_POOL as VocabWord[]);
  return [...pool].sort(() => rand() - 0.5).slice(0, count);
}
export { VOCAB_POOL };

// Eski placementQuestions endi ishlatilmaydi — placementForUser (placement.ts) ishlatiladi
export function placementQuestions() {
  return [
    { q: "She ___ a teacher.", opts: ["is", "are", "am", "be"], a: 0, lvl: "A1" },
    { q: "I ___ to school every day.", opts: ["go", "goes", "going", "gone"], a: 0, lvl: "A1" },
    { q: "There ___ two apples.", opts: ["is", "are", "am", "be"], a: 1, lvl: "A1" },
    { q: "He ___ TV now.", opts: ["watch", "watches", "is watching", "watched"], a: 2, lvl: "A2" },
    { q: "We ___ in Tashkent since 2020.", opts: ["live", "lived", "have lived", "are living"], a: 2, lvl: "A2" },
    { q: "If it rains, we ___ at home.", opts: ["stay", "will stay", "stayed", "would stay"], a: 1, lvl: "A2" },
    { q: "I have never ___ sushi.", opts: ["eat", "ate", "eaten", "eating"], a: 2, lvl: "B1" },
    { q: "The book ___ yesterday.", opts: ["bought", "was bought", "is bought", "buys"], a: 1, lvl: "B1" },
    { q: "When I arrived, they ___ already.", opts: ["left", "have left", "had left", "leave"], a: 2, lvl: "B1" },
    { q: "You ___ wear seatbelt.", opts: ["should", "would rather", "had better to", "ought"], a: 0, lvl: "B1" },
    { q: "He said he ___ tired.", opts: ["is", "was", "will be", "has been"], a: 1, lvl: "B1" },
    { q: "___ you ever been abroad?", opts: ["Did", "Have", "Are", "Do"], a: 1, lvl: "A2" },
    { q: "This is the house ___ I grew up.", opts: ["which", "where", "who", "whose"], a: 1, lvl: "B2" },
    { q: "I wish I ___ more time.", opts: ["have", "had", "will have", "have had"], a: 1, lvl: "B2" },
    { q: "Hardly ___ arrived when it rained.", opts: ["we had", "had we", "we have", "have we"], a: 1, lvl: "C1" },
    { q: "Scarcely had I entered ___ phone rang.", opts: ["than", "when", "then", "that"], a: 1, lvl: "C1" },
    { q: "Choose correct: ", opts: ["She don't like tea", "She doesn't like tea", "She not like tea", "She no like tea"], a: 1, lvl: "A1" },
    { q: "Synonym of 'rapid'?", opts: ["slow", "fast", "late", "calm"], a: 1, lvl: "B1" },
    { q: "___ honest man.", opts: ["A", "An", "The", "No article"], a: 1, lvl: "A2" },
    { q: "If I ___ rich, I would travel.", opts: ["am", "were", "will be", "have been"], a: 1, lvl: "B2" },
  ];
}

export function gradePlacement(score20: number, writingLen: number): { level: string; weak: string[] } {
  let level = "A1";
  if (score20 >= 18) level = "C1";
  else if (score20 >= 14) level = "B2";
  else if (score20 >= 10) level = "B1";
  else if (score20 >= 6) level = "A2";
  else level = "A1";
  if (writingLen < 20 && level !== "A1") {
    // yozma bo'sh bo'lsa bir pog'ona past
    const order = ["A1", "A2", "B1", "B2", "C1"];
    level = order[Math.max(0, order.indexOf(level) - 1)];
  }
  const weak = score20 < 10 ? ["grammar", "vocab"] : score20 < 14 ? ["listening", "writing"] : ["speaking", "writing"];
  return { level, weak };
}

export { GAME_BANK };
