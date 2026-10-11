// Individual placement bank — har user uchun har xil test.
export type PQ = { q: string; opts: string[]; a: number; lvl: string };
export const PLACEMENT_BANK: PQ[] = [
  { q: "She ___ a teacher.", opts: ["is", "are", "am", "be"], a: 0, lvl: "A1" },
  { q: "I ___ to school every day.", opts: ["go", "goes", "going", "gone"], a: 0, lvl: "A1" },
  { q: "There ___ two apples.", opts: ["is", "are", "am", "be"], a: 1, lvl: "A1" },
  { q: "They ___ football now.", opts: ["plays", "play", "playing", "played"], a: 1, lvl: "A1" },
  { q: "My mother ___ dinner.", opts: ["cook", "cooks", "cooking", "cooked"], a: 1, lvl: "A1" },
  { q: "___ your name?", opts: ["What is", "What are", "What am", "How"], a: 0, lvl: "A1" },
  { q: "He ___ TV now.", opts: ["watch", "watches", "is watching", "watched"], a: 2, lvl: "A2" },
  { q: "We ___ in Tashkent since 2020.", opts: ["live", "lived", "have lived", "are living"], a: 2, lvl: "A2" },
  { q: "If it rains, we ___ at home.", opts: ["stay", "will stay", "stayed", "would stay"], a: 1, lvl: "A2" },
  { q: "___ you ever been abroad?", opts: ["Did", "Have", "Are", "Do"], a: 1, lvl: "A2" },
  { q: "___ honest man.", opts: ["A", "An", "The", "No article"], a: 1, lvl: "A2" },
  { q: "She ___ yesterday.", opts: ["go", "went", "gone", "goes"], a: 1, lvl: "A2" },
  { q: "I have never ___ sushi.", opts: ["eat", "ate", "eaten", "eating"], a: 2, lvl: "B1" },
  { q: "The book ___ yesterday.", opts: ["bought", "was bought", "is bought", "buys"], a: 1, lvl: "B1" },
  { q: "You ___ wear seatbelt.", opts: ["should", "would rather", "had better to", "ought"], a: 0, lvl: "B1" },
  { q: "He said he ___ tired.", opts: ["is", "was", "will be", "has been"], a: 1, lvl: "B1" },
  { q: "When I arrived, they ___ already.", opts: ["left", "have left", "had left", "leave"], a: 2, lvl: "B1" },
  { q: "Synonym of 'rapid'?", opts: ["slow", "fast", "late", "calm"], a: 1, lvl: "B1" },
  { q: "This is the house ___ I grew up.", opts: ["which", "where", "who", "whose"], a: 1, lvl: "B2" },
  { q: "I wish I ___ more time.", opts: ["have", "had", "will have", "have had"], a: 1, lvl: "B2" },
  { q: "If I ___ rich, I would travel.", opts: ["am", "were", "will be", "have been"], a: 1, lvl: "B2" },
  { q: "He denied ___ my phone.", opts: ["take", "to take", "taking", "takes"], a: 2, lvl: "B2" },
  { q: "Not only ___ late, he forgot books.", opts: ["he was", "was he", "is he", "he is"], a: 1, lvl: "B2" },
  { q: "By 2030, I ___ English for 5 years.", opts: ["learn", "will learn", "will have learnt", "learnt"], a: 2, lvl: "B2" },
  { q: "Hardly ___ arrived when it rained.", opts: ["we had", "had we", "we have", "have we"], a: 1, lvl: "C1" },
  { q: "Scarcely had I entered ___ phone rang.", opts: ["than", "when", "then", "that"], a: 1, lvl: "C1" },
  { q: "'To bite the dust' means...", opts: ["to eat fast", "to fail", "to win", "to sleep"], a: 1, lvl: "C1" },
  { q: "___ the rain, the match continued.", opts: ["Despite", "Although", "Because", "Unless"], a: 0, lvl: "C1" },
  { q: "He is ___ honest that all trust him.", opts: ["so", "such", "too", "very"], a: 0, lvl: "C1" },
  { q: "No sooner ___ home than guests came.", opts: ["I had got", "had I got", "I got", "got I"], a: 1, lvl: "C1" },
];
export const PLACEMENT_EXTRA: PQ[] = [
  { q: "A cat ___ on the roof.", opts: ["is", "are", "am", "be"], a: 0, lvl: "A1" },
  { q: "We ___ students.", opts: ["is", "are", "am", "be"], a: 1, lvl: "A1" },
  { q: "He ___ a car.", opts: ["have", "has", "having", "had"], a: 1, lvl: "A1" },
  { q: "She ___ to music now.", opts: ["listen", "listens", "is listening", "listened"], a: 2, lvl: "A2" },
  { q: "They ___ in Samarkand last year.", opts: ["live", "lived", "have lived", "living"], a: 1, lvl: "A2" },
  { q: "She has worked here ___ 2019.", opts: ["for", "since", "from", "at"], a: 1, lvl: "B1" },
  { q: "If I see him, I ___ tell him.", opts: ["will", "would", "would have", "told"], a: 0, lvl: "B1" },
  { q: "The room ___ every day.", opts: ["cleans", "is cleaned", "cleaned", "clean"], a: 1, lvl: "B1" },
  { q: "I am looking forward ___ you.", opts: ["to see", "to seeing", "see", "seeing"], a: 1, lvl: "B2" },
  { q: "Had I known, I ___ helped.", opts: ["will have", "would have", "have", "had"], a: 1, lvl: "B2" },
  { q: "He behaves as if he ___ rich.", opts: ["is", "were", "will be", "has been"], a: 1, lvl: "C1" },
  { q: "___ tired, she kept working.", opts: ["Although", "Despite being", "Because", "Unless"], a: 1, lvl: "C1" },
];
export const WRITING_TOPICS = [
  { t: "My yesterday (40+ so'z)", hint: "Past Simple ishlating." },
  { t: "My dream job (40+ so'z)", hint: "Why do you want it?" },
  { t: "My family weekend (40+ so'z)", hint: "Who, where, what did you do?" },
  { t: "My city (40+ so'z)", hint: "Describe places, food, people." },
  { t: "My best friend (40+ so'z)", hint: "Character, hobby, why you like." },
  { t: "Healthy day (40+ so'z)", hint: "Food, sport, sleep." },
];
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
function mulberry(seed: number) {
  let s = seed || 12345;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// userSeed (name/email) dan 20 savol: har darajadan 4 tadan + variantlar aralashadi
export function placementForUser(userSeed: string): { qs: PQ[]; writing: { t: string; hint: string }; seed: number } {
  const seed = hashStr(userSeed || String(Date.now()));
  const rand = mulberry(seed);
  const all = [...PLACEMENT_BANK, ...PLACEMENT_EXTRA];
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  const picked: PQ[] = [];
  for (const lvl of levels) {
    const pool = all.filter((q) => q.lvl === lvl);
    const sh = [...pool].sort(() => rand() - 0.5);
    picked.push(...sh.slice(0, 4));
  }
  const qs = [...picked].sort(() => rand() - 0.5).map((q) => {
    const order = q.opts.map((_, i) => i).sort(() => rand() - 0.5);
    const newOpts = order.map((i) => q.opts[i]);
    return { ...q, opts: newOpts, a: order.indexOf(q.a) };
  });
  const writing = WRITING_TOPICS[Math.floor(rand() * WRITING_TOPICS.length) % WRITING_TOPICS.length];
  return { qs, writing, seed };
}

