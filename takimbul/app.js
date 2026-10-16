/* TakımBul – YaşarOBS demo prototipi
   Gerçek OBS'ye bağlı değildir. Tüm veriler örnektir ve yalnızca bu tarayıcıda saklanır. */
'use strict';

/* ---------- yardımcılar ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const sleep = ms => new Promise(res => setTimeout(res, ms));
const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('').toLocaleUpperCase('tr-TR');
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------- sabit veriler ---------- */
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
const DAYS_LONG = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const SLOTS = ['08:30', '10:30', '13:30', '15:30', '17:30'];
const SLOT_LBL = ['08:30–10:20', '10:30–12:20', '13:30–15:20', '15:30–17:20', '17:30–19:20'];
const NS = 25;
const slotName = k => `${DAYS_LONG[Math.floor(k / 5)]} ${SLOTS[k % 5]}`;
const slotShort = k => `${DAYS[Math.floor(k / 5)]} ${SLOTS[k % 5]}`;

const SKILLS = [
  { id: 'devre', n: 'Devre tasarımı & simülasyon', s: 'Devre', i: '⚡', role: 'Devre tasarımcısı' },
  { id: 'pcb', n: 'PCB & prototip montajı', s: 'PCB', i: '🔧', role: 'Donanım / PCB sorumlusu' },
  { id: 'gomulu', n: 'Gömülü yazılım (C, STM32/ESP32)', s: 'Gömülü', i: '💻', role: 'Gömülü yazılımcı' },
  { id: 'matlab', n: 'MATLAB & sinyal analizi', s: 'MATLAB', i: '📈', role: 'Ölçüm & analiz sorumlusu' },
  { id: 'rapor', n: 'Teknik rapor yazımı', s: 'Rapor', i: '📝', role: 'Dokümantasyon' },
  { id: 'sunum', n: 'Sunum', s: 'Sunum', i: '🎤', role: 'Sunum & iletişim' },
];
const SK = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const LVL = ['Yok', 'Temel', 'İyi', 'Çok iyi'];
// "İyi" ve üstü beyanlar ders geçmişiyle doğrulanır (yalnızca dersin tamamlanmış olması; not kullanılmaz)
const EVIDENCE = { devre: 'EEE 2201 Elektronik Devreler I', pcb: 'EEE 2202 Elektronik Laboratuvarı', gomulu: 'EEE 2401 Mikroişlemciler', matlab: 'EEE 2301 Sinyaller ve Sistemler', rapor: 'ENG 2001 Teknik Yazım', sunum: 'Proje / kulüp portfolyosu' };

const MAIN = 'EEE 3401';
const COURSES = [
  { code: 'EEE 3401', name: 'Gömülü Sistem Tasarımı', ins: 'Doç. Dr. Elif Aydın', slots: [1, 17] },
  { code: 'EEE 3301', name: 'İşaret İşleme', ins: 'Dr. Öğr. Üyesi Murat Demir', slots: [5] },
  { code: 'EEE 3201', name: 'Elektronik Devreler II', ins: 'Prof. Dr. Selin Arslan', slots: [12, 13] },
  { code: 'EEE 3501', name: 'Kontrol Sistemleri', ins: 'Dr. Öğr. Üyesi Can Yıldız', slots: [16] },
  { code: 'EEE 3101', name: 'Elektromanyetik Dalgalar', ins: 'Dr. Öğr. Üyesi Ayla Tan', slots: [20] },
];
const CLASS_SLOTS = COURSES.flatMap(c => c.slots);
const classAt = k => COURSES.find(c => c.slots.includes(k));
const INSTRUCTOR = { name: 'Doç. Dr. Elif Aydın', short: 'Elif Aydın', no: 'Öğretim Üyesi' };
const ME_BASE = { id: 'me', name: 'Deniz Kaya', no: '22070601023', color: '#1d4ed8' };
const NAMES = ['Ahmet Yılmaz', 'Zeynep Çelik', 'Mert Şahin', 'Elif Öztürk', 'Burak Aksoy', 'Selin Koç', 'Emre Arslan', 'Ayşe Doğan', 'Can Kılıç', 'İrem Aslan', 'Kerem Çetin', 'Ece Kara', 'Berk Polat', 'Nazlı Kurt', 'Onur Özdemir', 'Melis Şimşek', 'Arda Yıldırım', 'Defne Erdoğan', 'Kaan Tunç', 'Ceren Tekin', 'Yiğit Güneş', 'Su Bulut', 'Ata Korkmaz'];
const COLORS = ['#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1', '#15803d', '#9333ea', '#c2410c', '#0e7490', '#4338ca', '#a16207', '#be185d'];
const GOALS = { sinav: 'Sınava hazırlık', odev: 'Ödev / proje', tekrar: 'Konu tekrarı' };
const STYLES = { yuz: 'Yüz yüze', online: 'Online', karma: 'Karma' };
const DEMO_TODAY = new Date('2026-10-15T12:00:00');

// Gerçek hayattaki zaman kısıtları (öğrencinin kendi beyanı)
const LIMITS = [
  { t: 'Yarı zamanlı iş (Sal–Per öğleden sonra)', block: [7, 8, 9, 17, 18, 19] },
  { t: 'Manisa\'dan geliyor, akşam saatleri uygun değil', block: [4, 9, 14, 19, 24] },
  { t: 'Kulüp antrenmanı (Pzt ve Çar 17:30)', block: [4, 14] },
  { t: 'Cuma günleri kampüste değil', block: [20, 21, 22, 23, 24] },
  { t: 'Laboratuvar asistanlığı (Çar sabah)', block: [10, 11] },
  { t: 'Servisle geliyor, 08:30 saatleri uygun değil', block: [0, 5, 10, 15, 20] },
];
// İsteğe bağlı "birlikte çalışmak istediğim kişi" tercihleri (yalnızca karşılıklıysa dikkate alınır)
const PREFS = { s2: 's14', s14: 's2', s6: 's19', s19: 's6', s11: 'me', s9: 's4' };

function buildStudents() {
  const r = rng(20261016);
  const prim = shuffle(['devre', 'devre', 'devre', 'devre', 'pcb', 'gomulu', 'gomulu', 'gomulu', 'gomulu', 'gomulu', 'matlab', 'matlab', 'matlab', 'matlab', 'pcb', 'pcb', 'pcb', 'pcb', 'rapor', 'rapor', 'rapor', 'sunum', 'sunum'], r);
  const others = COURSES.filter(c => c.code !== MAIN);
  return NAMES.map((name, i) => {
    const skills = {}, ver = {};
    SKILLS.forEach(s => { skills[s.id] = r() < 0.4 ? 1 : 0; });
    skills[prim[i]] = r() < 0.5 ? 3 : 2;
    let sec; do { sec = SKILLS[Math.floor(r() * 6)].id; } while (sec === prim[i]);
    skills[sec] = r() < 0.5 ? 2 : 1;
    SKILLS.forEach(s => { if (skills[s.id] >= 2) ver[s.id] = r() < (s.id === 'sunum' ? 0.5 : s.id === 'rapor' ? 0.75 : 0.9); });
    // ders programı: ana ders + 2-3 diğer ders (farklı şubeler) + bir seçmeli
    const busy = new Set(COURSES[0].slots);
    shuffle(others.slice(), r).slice(0, 2 + Math.floor(r() * 2)).forEach(c => c.slots.forEach(k => busy.add(k)));
    busy.add(Math.floor(r() * NS));
    const limit = r() < 0.45 ? LIMITS[Math.floor(r() * LIMITS.length)] : null;
    if (limit) limit.block.forEach(k => busy.add(k));
    const avail = [];
    for (let k = 0; k < NS; k++) if (!busy.has(k) && r() < 0.55) avail.push(k);
    return {
      id: 's' + (i + 1), name, no: '2207060' + (1100 + i * 37), color: COLORS[i % COLORS.length], skills, ver, avail,
      limit: limit ? limit.t : '', pref: PREFS['s' + (i + 1)] || '',
      goal: ['sinav', 'odev', 'tekrar'][Math.floor(r() * 3)], style: ['yuz', 'online', 'karma'][Math.floor(r() * 3)],
    };
  });
}
const STUDENTS = buildStudents();
// birkaç el ayarı: sınıf profili gerçekçi kalsın diye (PCB ve MATLAB bilen az ama yeterli)
[['Nazlı', 'pcb'], ['Ata', 'pcb']].forEach(([n, k]) => { STUDENTS.find(s => s.name.startsWith(n)).ver[k] = true; });
{ const d = STUDENTS.find(s => s.name.startsWith('Defne')); d.skills.matlab = 2; d.ver.matlab = true; }

function autoAvail() {
  const out = [];
  for (let k = 0; k < NS; k++) { const s = k % 5; if (s >= 1 && s <= 3 && !CLASS_SLOTS.includes(k)) out.push(k); }
  return out;
}
const DEFAULT_ME_SKILLS = { devre: 2, pcb: 3, gomulu: 1, matlab: 1, rapor: 1, sunum: 2 };
const ME_VER = { devre: true, pcb: true, gomulu: true, matlab: true, rapor: true, sunum: false };

/* ---------- durum ---------- */
const STORE = 'takimbul-eee-v2';
function freshState() {
  return {
    role: null,
    me: { skills: { devre: 0, pcb: 0, gomulu: 0, matlab: 0, rapor: 0, sunum: 0 }, avail: [], goal: 'sinav', style: 'karma', friend: '', profileDone: false },
    assignments: [presetA0()],
    notes: [],
    buddy: { course: 'EEE 3301', req: {} },
    form: null,
    log: [],
    week: 0,
    demoOpen: false,
  };
}
function presetA0() {
  return {
    id: 'a0', course: 'EEE 3301', title: 'Ödev 2: FIR Filtre Tasarımı ve Ölçümü', size: 3, due: '2026-11-06', method: 'ogrenci',
    req: ['matlab', 'devre', 'rapor'], weight: 60, status: 'published', groups: [['me', 's5', 's9']],
    tasks: [[
      { id: 't1', t: 'Filtre spesifikasyonları', skill: 'matlab', pts: 2, who: 's9', col: 2 },
      { id: 't2', t: 'MATLAB ile FIR katsayıları', skill: 'matlab', pts: 3, who: 's9', col: 1 },
      { id: 't3', t: 'Op-amp tabanlı analog karşılaştırma devresi', skill: 'devre', pts: 2, who: 's5', col: 1 },
      { id: 't4', t: 'Osiloskop ölçümleri (Lab 2)', skill: 'devre', pts: 2, who: 'me', col: 0 },
      { id: 't5', t: 'Rapor: frekans yanıtı karşılaştırması', skill: 'rapor', pts: 2, who: 'me', col: 0 },
    ]],
    lazy: {}, reminded: {}, submitted: {}, peer: {}, chat: [
      { who: 's9', text: 'Katsayıları hesapladım, MATLAB dosyasını yükledim.' },
      { who: 's5', text: 'Süper 👍 Devreyi Perşembe labda kuruyorum.' },
    ], active: {},
  };
}
let S;
function load() {
  try { const raw = localStorage.getItem(STORE); S = raw ? JSON.parse(raw) : freshState(); } catch (e) { S = freshState(); }
  if (!S || !S.me) S = freshState();
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* depolama yoksa bellekte devam */ } }
function log(t) { const d = new Date(); S.log.unshift(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}  ${t}`); S.log = S.log.slice(0, 30); }

function meStudent() {
  const done = S.me.profileDone;
  return { ...ME_BASE, skills: done ? S.me.skills : DEFAULT_ME_SKILLS, ver: ME_VER, avail: done ? S.me.avail : autoAvail(), goal: S.me.goal, style: S.me.style, limit: '', pref: S.me.friend || '' };
}
function getS(id) { return id === 'me' ? meStudent() : STUDENTS.find(s => s.id === id); }
const firstName = id => id === 'me' ? 'Sen' : getS(id).name.split(' ')[0];
function av(id, cls = '') { const s = getS(id); return `<span class="avatar ${cls}" style="background:${s.color}" title="${esc(s.name)}">${initials(s.name)}</span>`; }
// doğrulanmamış "İyi/Çok iyi" beyanı yarım seviye düşük sayılır
const eff = (s, k) => { const v = s.skills[k] || 0; return v >= 2 && !(s.ver && s.ver[k]) ? v - 0.5 : v; };
function skIcons(s, only) {
  return `<span class="sk">${SKILLS.filter(k => (only ? only.includes(k.id) : true) && s.skills[k.id] >= 2).map(k => { const v = s.ver && s.ver[k.id]; return `<i class="s${s.skills[k.id]} ${v ? 'ver' : 'unv'}" title="${k.n}: ${LVL[s.skills[k.id]]} · ${v ? '✓ ' + EVIDENCE[k.id] : 'ders geçmişiyle doğrulanmadı'}">${k.i}${v ? '' : '<sup>?</sup>'}</i>`; }).join('')}</span>`;
}
function mutualPairs() {
  const all = ['me', ...STUDENTS.map(s => s.id)]; const pair = {};
  all.forEach(id => { const p = getS(id).pref; if (p && getS(p) && getS(p).pref === id) pair[id] = p; });
  return pair;
}

/* ---------- gruplama algoritması ---------- */
const covVal = x => x <= 0 ? 0 : x < 1 ? 0.15 * x : x < 2 ? 0.15 + 0.6 * (x - 1) : x < 3 ? 0.75 + 0.25 * (x - 2) : 1;
function groupStats(ids, req) {
  const ms = ids.map(getS);
  const cov = {}; let covScore = 0;
  req.forEach(r => { const m = Math.max(0, ...ms.map(s => eff(s, r))); cov[r] = m; covScore += covVal(m); });
  covScore /= Math.max(1, req.length);
  const counts = new Array(NS).fill(0);
  ms.forEach(s => s.avail.forEach(k => counts[k]++));
  const common = [], near = [];
  counts.forEach((c, k) => { if (c === ms.length) common.push(k); else if (c === ms.length - 1) near.push(k); });
  const timeScore = Math.min(1, (common.length + 0.3 * near.length) / 4);
  const total = ms.reduce((a, s) => a + SKILLS.reduce((x, k) => x + eff(s, k.id), 0), 0);
  const missing = req.filter(r => cov[r] < 2);
  return { cov, covScore, common, near, counts, timeScore, total, missing };
}
function partitionScore(groups, req, w) {
  const st = groups.map(g => groupStats(g, req));
  const mean = st.reduce((a, s) => a + w * s.covScore + (1 - w) * s.timeScore, 0) / st.length;
  const avgT = st.reduce((a, s) => a + s.total, 0) / st.length;
  const sd = Math.sqrt(st.reduce((a, s) => a + (s.total - avgT) ** 2, 0) / st.length);
  const miss = st.reduce((x, s) => x + s.missing.length, 0);
  const noTime = st.filter(s => !s.common.length).length;
  return Math.max(0, Math.min(100, mean * 100 - sd * 1.2 - miss * 5 - noTime * 2));
}
function capacities(n, size) {
  const G = Math.max(1, Math.floor(n / size));
  return Array.from({ length: G }, (_, i) => Math.floor(n / G) + (i < n % G ? 1 : 0));
}
function makeGroups(ids, size) {
  const cap = capacities(ids.length, size); const groups = cap.map(() => []);
  let gi = 0; ids.forEach(id => { while (groups[gi].length >= cap[gi]) gi++; groups[gi].push(id); });
  return groups;
}
function optimize(ids, size, req, w, seed) {
  // birkaç rastgele başlangıçtan yerel arama; en iyisinin adımları animasyonda gösterilir
  const pair = mutualPairs();
  let best = null;
  for (let k = 0; k < 5; k++) { const st = optimizeOnce(ids, size, req, w, seed * 13 + k, pair); if (!best || st[st.length - 1].score > best[best.length - 1].score) best = st; }
  return best;
}
function optimizeOnce(ids, size, req, w, seed, pair) {
  const r = rng(seed);
  // başlangıç: rastgele, ama karşılıklı tercih edenler birlikte
  const units = [], seen = new Set();
  shuffle(ids.slice(), r).forEach(id => { if (seen.has(id)) return; seen.add(id); const p = pair[id]; if (p && ids.includes(p) && !seen.has(p)) { seen.add(p); units.push([id, p]); } else units.push([id]); });
  const cap = capacities(ids.length, size); let groups = cap.map(() => []);
  units.filter(u => u.length === 2).forEach(u => { const gi = groups.findIndex((g, i) => cap[i] - g.length >= 2 && !g.some(x => pair[x])); groups[gi >= 0 ? gi : groups.findIndex((g, i) => cap[i] - g.length >= 2)].push(...u); });
  const singles = units.filter(u => u.length === 1).map(u => u[0]); let gi0 = 0;
  singles.forEach(id => { while (groups[gi0].length >= cap[gi0]) gi0++; groups[gi0].push(id); });
  let cur = partitionScore(groups, req, w);
  const steps = [{ groups: clone(groups), score: cur, swap: null }];
  const locked = (g, x) => pair[x] && g.includes(pair[x]);
  let sampled = true;
  for (let it = 0; it < 140; it++) {
    let best = null;
    const tryOne = (gi, ai, gj, bj) => {
      const a = groups[gi][ai], b = groups[gj][bj];
      const A = [a], B = [b];
      if (locked(groups[gi], a)) A.push(pair[a]);
      if (locked(groups[gj], b)) B.push(pair[b]);
      if (A.length !== B.length) {
        const [short, g] = A.length < B.length ? [A, groups[gi]] : [B, groups[gj]];
        const ext = g.find(x => !short.includes(x) && !locked(g, x));
        if (!ext) return; short.push(ext);
      }
      const g2 = groups.map(g => g.slice());
      g2[gi] = g2[gi].map(x => A.includes(x) ? B[A.indexOf(x)] : x);
      g2[gj] = g2[gj].map(x => B.includes(x) ? A[B.indexOf(x)] : x);
      const sc = partitionScore(g2, req, w);
      if (!best || sc > best.score) best = { groups: g2, score: sc, swap: [...A, ...B], pairMove: A.length > 1 };
    };
    if (sampled) {
      for (let n = 0; n < 8; n++) {
        const gi = Math.floor(r() * groups.length); let gj = Math.floor(r() * groups.length);
        if (gi === gj) gj = (gj + 1) % groups.length;
        tryOne(gi, Math.floor(r() * groups[gi].length), gj, Math.floor(r() * groups[gj].length));
      }
    } else {
      for (let gi = 0; gi < groups.length; gi++) for (let gj = gi + 1; gj < groups.length; gj++)
        for (let a = 0; a < groups[gi].length; a++) for (let b = 0; b < groups[gj].length; b++) tryOne(gi, a, gj, b);
    }
    if (!best || best.score <= cur + 1e-6) { if (sampled) { sampled = false; continue; } break; }
    groups = best.groups; cur = best.score;
    steps.push({ groups: clone(groups), score: cur, swap: best.swap });
  }
  return steps;
}
function baseline(ids, size, req, w) {
  const r = rng(7);
  let common = 0, missingGroups = 0, score = 0, n = 0, gcount = 0, noTime = 0;
  for (let i = 0; i < 150; i++) {
    const gs = makeGroups(shuffle(ids.slice(), r), size);
    score += partitionScore(gs, req, w);
    gs.forEach(g => { const st = groupStats(g, req); common += st.common.length; if (st.missing.length) missingGroups++; if (!st.common.length) noTime++; gcount++; });
    n++;
  }
  return { common: common / gcount, missingRate: missingGroups / gcount, noTimeRate: noTime / gcount, score: score / n };
}
function summarize(groups, req, w) {
  const st = groups.map(g => groupStats(g, req));
  const pair = mutualPairs();
  const pairs = Object.keys(pair).filter(a => a < pair[a]);
  return {
    common: st.reduce((a, s) => a + s.common.length, 0) / st.length,
    missing: st.filter(s => s.missing.length).length,
    noTime: st.filter(s => !s.common.length).length,
    score: partitionScore(groups, req, w),
    pairs: pairs.length,
    pairsKept: pairs.filter(a => groups.some(g => g.includes(a) && g.includes(pair[a]))).length,
    limits: groups.flat().filter(id => getS(id).limit).length,
    unverified: groups.flat().filter(id => SKILLS.some(k => getS(id).skills[k.id] >= 2 && !(getS(id).ver || {})[k.id])).length,
  };
}

/* ---------- görevler ---------- */
const TASK_TEMPLATE = [
  { t: 'Sistem gereksinimleri ve blok diyagramı', skill: 'rapor', pts: 2 },
  { t: 'Akım/gerilim sensör devresi + LTspice simülasyonu', skill: 'devre', pts: 3 },
  { t: 'Güç kaynağı ve regülatör devresi', skill: 'devre', pts: 2 },
  { t: 'PCB çizimi (KiCad)', skill: 'pcb', pts: 3 },
  { t: 'Prototip montajı ve lehim', skill: 'pcb', pts: 2 },
  { t: 'STM32 ADC ölçüm yazılımı', skill: 'gomulu', pts: 3 },
  { t: 'ESP32 ile Wi-Fi veri gönderimi', skill: 'gomulu', pts: 2 },
  { t: 'MATLAB ile ölçüm analizi ve filtreleme', skill: 'matlab', pts: 2 },
  { t: 'Lab testleri ve osiloskop ölçümleri', skill: 'devre', pts: 2 },
  { t: 'Proje raporu', skill: 'rapor', pts: 2 },
  { t: 'Final sunumu ve demo videosu', skill: 'sunum', pts: 2 },
];
function distribute(tasks, members) {
  const load = Object.fromEntries(members.map(m => [m, tasks.filter(t => t.who === m).reduce((a, t) => a + t.pts, 0)]));
  tasks.filter(t => !t.who).sort((a, b) => b.pts - a.pts).forEach(t => {
    let best = null, bs = -1e9;
    members.forEach(m => { const sc = eff(getS(m), t.skill) * 2.2 - load[m] * 1.1; if (sc > bs) { bs = sc; best = m; } });
    t.who = best; load[best] += t.pts;
  });
}
function suggestRoles(members, req) {
  const roles = {}; const used = new Set();
  const pairs = [];
  members.forEach(m => SKILLS.forEach(k => pairs.push({ m, k: k.id, v: eff(getS(m), k.id) + (req.includes(k.id) ? 0.5 : 0) })));
  pairs.sort((a, b) => b.v - a.v).forEach(p => { if (!roles[p.m] && !used.has(p.k)) { roles[p.m] = p.k; used.add(p.k); } });
  members.forEach(m => { if (!roles[m]) roles[m] = 'devre'; });
  return roles;
}
const myGroupIdx = a => a.groups ? a.groups.findIndex(g => g.includes('me')) : -1;
function progress(tasks) {
  const tot = tasks.reduce((x, t) => x + t.pts, 0) || 1;
  const done = tasks.reduce((x, t) => x + (t.col === 2 ? t.pts : t.col === 1 ? t.pts * 0.4 : 0), 0);
  return Math.round(done / tot * 100);
}
function contrib(tasks, members) {
  const out = Object.fromEntries(members.map(m => [m, 0]));
  tasks.forEach(t => { if (t.who && out[t.who] !== undefined) out[t.who] += t.col === 2 ? t.pts : t.col === 1 ? t.pts * 0.4 : 0; });
  const tot = Object.values(out).reduce((a, b) => a + b, 0);
  return { raw: out, pct: Object.fromEntries(members.map(m => [m, tot ? Math.round(out[m] / tot * 100) : 0])) };
}

/* ---------- bildirim, ses, toast ---------- */
let audioCtx;
function ding() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.12 + 0.35);
      o.connect(g).connect(audioCtx.destination); o.start(audioCtx.currentTime + i * 0.12); o.stop(audioCtx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) { }
}
function toast(title, sub = '', kind = '', icon = '🔔') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = `<div style="font-size:20px">${icon}</div><div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  const box = $('#toasts'); box.appendChild(el);
  while (box.children.length > 2) box.firstChild.remove();
  setTimeout(() => { el.style.transition = '.4s'; el.style.opacity = '0'; el.style.transform = 'translateY(-8px)'; }, 4200);
  setTimeout(() => el.remove(), 4700);
}
function notify(role, title, body, icon = '🔔', link = '') {
  S.notes.unshift({ role, title, body, icon, link, read: false, at: Date.now() });
  if (S.role === role) {
    toast(title, body, 'teal', icon); ding();
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification('YaşarOBS · TakımBul', { body: `${title} – ${body}` }); } catch (e) { }
  }
}

/* ---------- yönlendirme ---------- */
function route() { const h = location.hash.replace(/^#\/?/, ''); return h ? h.split('/') : []; }
function go(path) { if (location.hash === '#/' + path) render(); else location.hash = '#/' + path; }
window.addEventListener('hashchange', () => { cancelAnim(); S.ui = { infoX: S.ui && S.ui.infoX }; render(); window.scrollTo(0, 0); });

/* ---------- arayüz parçaları ---------- */
const LOGO = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/></svg>`;
const ICP = {
  cap: '<path d="M2 9l10-5 10 5-10 5z" fill="currentColor"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" fill="currentColor"/>',
  list: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
  book: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13"/><path d="M9 7h6"/>',
  form: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5l3 3L13 14H10v-3z"/>',
  doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
  clip: '<path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
  kbd: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  clipb: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5 7-5s6.2 1.5 7 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.5c2.8.3 4.7 1.9 5.3 4.5"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  mega: '<path d="M3 10v4h4l8 5V5L7 10z"/><path d="M18.5 9a4 4 0 0 1 0 6"/>',
  bank: '<path d="M3 9l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  info: '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M12 11v6M12 7.5h.01" stroke="#fff" stroke-width="2.4"/>',
  glass: '<path d="M6 3h12M6 21h12"/><path d="M7 3c0 6 10 5 10 9s-10 3-10 9M17 3c0 6-10 5-10 9s10 3 10 9" />',
  edit: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 16l1-4 7-7 3 3-7 7z"/>',
  board: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l2-4M16 20l-2-4"/><circle cx="9" cy="10" r="2"/><path d="M13 9h4M13 12h3"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
};
const icon = (k, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICP[k]}</svg>`;

function sidebar(r) {
  const cur = r[0] === 'x' ? 'x/' + r[1] : (r[0] || 'home');
  const item = (to, ic, label, extra = '') => `<button class="onav ${to === 'tb' ? 'tb' : ''} ${cur === to ? 'active' : ''}" data-act="nav" data-to="${to}">${icon(ic)}<span>${label}</span>${extra || '<span class="chev">›</span>'}</button>`;
  const tbItem = item('tb', 'users', 'TakımBul', '<span class="badge">YENİ</span>');
  const stu = `<div class="oh">Genel</div>${item('x/genel', 'list', 'Genel İşlemler')}${item('x/ders', 'book', 'Ders ve Dönem İşlemleri')}${item('x/form', 'form', 'Form İşlemleri')}${item('x/belge', 'doc', 'Belge Talebi')}
    <div class="oh">İşbirliği</div>${tbItem}
    <div class="oh">Akademik</div>${item('x/intibak', 'clip', 'İntibak Başvuru')}${item('x/hazirlik', 'kbd', 'Hazırlık İşlemleri')}
    <div class="oh">Başvurular</div>${item('x/basvuru', 'clipb', 'Başvuru İşlemleri')}
    <div class="oh">Hesap</div>${item('x/kullanici', 'user', 'Kullanıcı İşlemleri')}`;
  const ins = `<div class="oh">Genel</div>${item('x/genel', 'list', 'Genel İşlemler')}${item('x/dersler', 'book', 'Ders İşlemleri')}${item('x/not', 'form', 'Not İşlemleri')}${item('x/danisman', 'board', 'Danışmanlık İşlemleri')}
    <div class="oh">İşbirliği</div>${tbItem}
    <div class="oh">Hesap</div>${item('x/kullanici', 'user', 'Kullanıcı İşlemleri')}`;
  return `<aside class="oside" id="side"><div class="emb" title="Demo amblemi">${LOGO}</div>
    <div class="sysbtn">${S.role === 'student' ? 'Öğrenci' : 'Akademisyen'} Bilgi Sistemi</div>
    <div class="osearch">Menüde Ara...</div>${S.role === 'student' ? stu : ins}</aside>`;
}
function topbar() {
  const unread = S.notes.filter(n => n.role === S.role && !n.read).length;
  const who = S.role === 'student' ? { name: 'DENİZ KAYA', sub: 'DEMO ÖĞRENCİ · ' + ME_BASE.no } : { name: 'ELİF AYDIN', sub: 'DEMO AKADEMİSYEN' };
  const notes = S.notes.filter(n => n.role === S.role);
  return `<header class="obar">
    <button class="ham" data-act="menu" aria-label="Menü" style="width:34px;height:34px">${icon('menu', 2)}</button>
    <span class="uni">Yaşar Üniversitesi</span><span class="term">2026-2027 Güz</span>
    <span class="sp"></span>
    <span class="demo-tag" title="Ders projesi prototipi">DEMO</span>
    <div class="rseg" role="group" aria-label="Görünüm">
      <button class="${S.role === 'student' ? 'on' : ''}" data-act="role" data-r="student">🎓 <span class="lbl">Öğrenci</span></button>
      <button class="${S.role === 'instructor' ? 'on' : ''}" data-act="role" data-r="instructor">👩‍🏫 <span class="lbl">Akademisyen</span></button>
    </div>
    <button class="obtn home-btn" data-act="nav" data-to="home" aria-label="Ana sayfa" style="padding:9px">${icon('home')}</button>
    <div style="position:relative">
      <button class="obtn" data-act="bell" aria-label="Duyurular ve bildirimler" style="padding:9px">${icon('mega')}<span class="dot" style="${unread ? '' : 'background:#ef4444'}">${unread}</span></button>
      ${S.ui && S.ui.bell ? `<div class="drop">
        <div class="row" style="padding:6px 8px"><b>Bildirimler</b><span class="sp"></span><button class="btn sm ghost" data-act="perm">Tarayıcı bildirimi aç</button></div>
        ${notes.length ? notes.slice(0, 6).map((n, i) => `<div class="ni ${n.read ? '' : 'unread'}" data-act="note" data-i="${i}" style="cursor:pointer"><div>${n.icon}</div><div><b style="font-size:13px">${esc(n.title)}</b><div class="small muted">${esc(n.body)}</div></div></div>`).join('') : '<div class="empty small">Henüz bildirim yok</div>'}
      </div>` : ''}
    </div>
    <div style="position:relative">
      <button class="upill" data-act="umenu"><span class="uav">${icon('user', 2)}</span><span style="flex:1;text-align:left"><small>${who.sub}</small><b>${who.name}</b></span><span style="opacity:.8">⌄</span></button>
      ${S.ui && S.ui.umenu ? `<div class="udrop"><button data-act="role" data-r="${S.role === 'student' ? 'instructor' : 'student'}">🔁 Demo: ${S.role === 'student' ? 'Akademisyen' : 'Öğrenci'} görünümüne geç</button><button data-act="nav" data-to="x/kullanici">${icon('user')} Kullanıcı İşlemleri</button><button data-act="logout">⎋ Güvenli Çıkış</button></div>` : ''}
    </div>
  </header>`;
}
function demoPanel() {
  const pub = S.assignments.some(a => a.status === 'published' && a.course === MAIN);
  return `<div class="demo ${S.demoOpen ? '' : 'min'}" id="demo">
    <div class="demo-h" data-act="demo-toggle"><span>🧪</span><b>Demo paneli</b><span class="chip ${pub ? 'green' : 'gray'}" style="font-size:11px">Hafta ${S.week}</span><span>${S.demoOpen ? '▾' : '▴'}</span></div>
    ${S.demoOpen ? `<div class="demo-b">
      <div class="muted small" style="color:#94a3b8">Sahte veriler. Zamanı ileri sararak grupların ilerleyişini canlı izleyin.</div>
      <button class="btn sm" data-act="week" ${pub ? '' : 'disabled title="Önce bir grup ödevi yayınlayın"'}>⏩ Bir hafta ileri sar</button>
      <button class="btn sm" data-act="reset">↺ Demo verilerini sıfırla</button>
      <div class="demo-log">${S.log.slice(0, 8).map(l => `<div>${esc(l)}</div>`).join('') || '<div>Olay günlüğü boş</div>'}</div>
    </div>` : ''}
  </div>`;
}
// oturum sayacı (gerçek OBS'deki gibi)
let SESSION_END = Date.now() + 60 * 60 * 1000;
function timerText() { const s = Math.max(0, Math.round((SESSION_END - Date.now()) / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
setInterval(() => { const t = $('#otimer b'); if (t) t.textContent = timerText(); if (SESSION_END < Date.now()) SESSION_END = Date.now() + 3600e3; }, 1000);
document.addEventListener('click', () => { SESSION_END = Date.now() + 60 * 60 * 1000; }, true);

/* ---------- sayfalar ---------- */
function pLogin() {
  // Gerçek giriş sayfasının yapısı: dil bağlantısı, üniversite adı, "Önlisans / Lisans", Öğrenci Girişi / Akademisyen Girişi, duyuru görseli
  return `<div class="gate">
    <div class="gate-lang"><span class="demo-tag">DEMO</span><a href="#/" onclick="return false" title="Demo yalnızca Türkçe">English</a></div>
    <div class="gate-box">
      <div class="gate-uni"><div class="gate-emblem">${LOGO}</div><div><div class="gate-name">Yaşar Üniversitesi</div><div class="gate-sub">Bilgi Sistemleri · Ders projesi demosu</div></div></div>
      <hr>
      <h2 class="gate-h">Önlisans / Lisans</h2>
      <div class="gate-btns">
        <button class="gate-btn" data-act="login" data-r="student"><span class="gi">🎓</span><b>Öğrenci Girişi</b><small>Demo: Deniz Kaya · EEE 3. sınıf</small></button>
        <button class="gate-btn" data-act="login" data-r="instructor"><span class="gi">👩‍🏫</span><b>Akademisyen Girişi</b><small>Demo: Doç. Dr. Elif Aydın</small></button>
      </div>
      <div class="warn" style="margin:16px 0 0">⚠️ Bu sayfa bir <b>ders projesi prototipidir</b>. Şifre istenmez; gerçek bilgilerinizi hiçbir yere girmeyin.</div>
      <hr>
      <div class="gate-banner"><span class="pill">🤝 YENİ</span><b>TakımBul</b><span>Grup ödevlerinde dengeli ekipler, ortak boş saatler ve adil katkı raporu</span></div>
    </div>
    <p class="login-foot">Ders projesi prototipi · Yaşar Üniversitesi'nin resmi sistemi değildir.</p>
  </div>`;
}
const WARN_SVG = `<svg viewBox="0 0 24 24"><path d="M12 2.5L23 21.5H1z" fill="#fff"/><path d="M12 9v5.5M12 17.6v.2" stroke="#0b7a42" stroke-width="2.6" stroke-linecap="round"/></svg>`;
function infoBanner(html) { return S.ui.infoX ? '' : `<div class="oinfo">${WARN_SVG}<div><b>Bilgilendirme</b> ${html}</div><button class="x" data-act="info-x" aria-label="Kapat">✕</button></div>`; }
function icard(ic, title, lines, extra = '') { return `<div class="card icard ${extra}"><div class="it">${icon(ic)}</div><div><h3>${title}</h3>${lines.map(l => `<p>${l}</p>`).join('')}</div></div>`; }
function qitem(ic, color, title, sub, to, extra = '') { return `<button class="qitem ${extra}" data-act="nav" data-to="${to}"><span class="qi" style="background:${color}22;color:${color}">${icon(ic)}</span><span><b>${title}${extra ? ' <span class="badge" style="vertical-align:2px">YENİ</span>' : ''}</b><small>${sub}</small></span><span class="chev">›</span></button>`; }
function pHome() {
  if (S.role === 'instructor') {
    const a = S.assignments.find(x => x.course === MAIN);
    return infoBanner(`2026-2027 Güz Döneminde 2 dersiniz ve ${a ? 1 : 0} aktif grup ödeviniz bulunmaktadır.`) + `
    <div class="icards">
      ${icard('user', 'Akademisyen Bilgisi', ['Doç. Dr. Elif Aydın', 'Elektrik-Elektronik Mühendisliği'])}
      ${icard('book', 'Verdiği Dersler', ['EEE 3401 Gömülü Sistem Tasarımı · 24 öğrenci', 'EEE 4901 Bitirme Projesi I · 12 öğrenci'])}
      ${icard('board', 'Danışmanlık', ['Danışman olduğu öğrenci: 18', 'Onay bekleyen ders kaydı: 0'])}
      <div data-act="nav" data-to="tb" style="cursor:pointer">${icard('users', 'TakımBul <span class="badge" style="vertical-align:2px">YENİ</span>', [a ? `Aktif grup ödevi: ${esc(a.title)}` : 'Henüz grup ödevi yok', 'Dengeli gruplar · izleme · katkı raporu'], 'new')}</div>
    </div>
    <div class="qa-h">Hızlı Erişim</div>
    <div class="qa">
      ${qitem('users', '#ea580c', 'TakımBul', 'Grup ödevi oluştur, grupları kur ve izle', 'tb', 'new')}
      ${qitem('form', '#7c3aed', 'Not İşlemleri', 'Dönem içi ve final not girişleri', 'x/not')}
      ${qitem('cal', '#2563eb', 'Akademik Takvim', 'Aktif Döneme Ait Tanımlanmış Takvim Listesi', 'x/genel')}
      ${qitem('list', '#db2777', 'Ders Programı', 'Verilen Dersler Bazında Aktif Ders Programı', 'x/dersler')}
    </div>`;
  }
  const a5 = S.assignments.find(x => x.course === MAIN);
  return infoBanner('2026-2027 Güz Döneminde 5 Adet Onaylanmış ders kaydınız mevcut.') + `
  <div class="icards">
    ${icard('cap', 'Öğrenci Kimliği', [`Öğrenci No: ${ME_BASE.no}`, 'T.C. Kimlik No: ●●●●●●●●●●●'])}
    ${icard('bank', 'Program Bilgisi', ['MÜHENDİSLİK FAK.', 'ELEKTRİK-ELEKTRONİK MÜHENDİSLİĞİ', 'Lisans'])}
    ${icard('info', 'Öğrenim Durumu', ['Kayıt Nedeni: ÖSYM Yerleştirme', 'Öğrenim Durumu: KAYIT YENİLEME', 'AGNO: 2,87 <span class="muted small">(örnek)</span>'])}
    ${icard('glass', 'Süre Bilgisi', ['Okuduğu Dönem: 5', 'Normal Süre: 4', 'Azami Süre: 7'])}
    ${icard('edit', 'Ders Kayıt', ['Onaylı Ders: 5', 'Onaysız Ders: 0', 'Özet: Tüm dersler onaylı'])}
    ${icard('board', 'Danışman', ['Dr. Öğr. Üyesi Murat Demir', 'MÜHENDİSLİK FAKÜLTESİ - ELEKTRİK-ELEKTRONİK MÜHENDİSLİĞİ'])}
    ${icard('chart', 'Akademik Özet', ['Durum: KAYIT YENİLEME', 'Program: ELEKTRİK-ELEKTRONİK MÜHENDİSLİĞİ', 'Dönem / Sınıf: 5 / 3'])}
    <div data-act="nav" data-to="tb" style="cursor:pointer">${icard('users', 'TakımBul <span class="badge" style="vertical-align:2px">YENİ</span>', [`Profil: ${S.me.profileDone ? '✓ Tamamlandı' : '<b style="color:#c2410c">Tamamlanmadı</b>'}`, `Grup ödevi: ${S.assignments.length}${a5 && a5.status === 'published' ? ' · grubun hazır' : ''}`, 'Dengeli gruplar, ortak saatler, adil katkı'], 'new')}</div>
  </div>
  <div class="qa-h">Hızlı Erişim</div>
  <div class="qa">
    ${qitem('users', '#ea580c', 'TakımBul', 'Grup Ödevleri, Ekip Eşleştirme ve Çalışma Arkadaşı', 'tb', 'new')}
    ${qitem('cal', '#2563eb', 'Akademik Takvim', 'Aktif Döneme Ait Tanımlanmış Takvim Listesi', 'x/genel')}
    ${qitem('list', '#db2777', 'Sınav Takvimi', 'Tanımlanmış Sınavlara Göre Sınav Takvimi', 'x/ders')}
    ${qitem('list', '#4f46e5', 'Ders Programı', 'Alınan Dersler Bazında Aktif Ders Programı Listesi', 'x/ders')}
    ${qitem('list', '#9333ea', 'Genel Bilgiler', 'Bir Çok Kategoride Özetlenmiş Diğer Bilgiler', 'x/genel')}
    ${qitem('doc', '#0891b2', 'Belge Talebi', 'Öğrenci Belgesi ve Transkript Talepleri', 'x/belge')}
  </div>`;
}
function tbPromo(text) {
  return `<div class="hero" style="margin:0"><span class="pill">🤝 YENİ MODÜL</span><h1>TakımBul</h1><p>${esc(text)}</p>
    <div class="feat"><span>🧠 Akıllı grup kurma</span><span>🗓️ Ortak boş saat</span><span>📋 Görev panosu</span><span>⚖️ Adil katkı raporu</span></div>
    <div style="margin-top:16px"><button class="btn lg" data-act="nav" data-to="tb">TakımBul'u aç →</button></div></div>`;
}
function privacyCard() {
  return `<div class="card" style="margin-top:16px"><div class="row" style="align-items:flex-start;gap:14px"><div style="font-size:26px">🔒</div><div>
    <h3 style="margin:0 0 4px">Gizlilik ilkeleri</h3>
    <div class="small muted">Notlar ve ortalamalar <b>eşleştirmede kullanılmaz ve kimseyle paylaşılmaz</b>. Beceriler öğrencinin kendi beyanıdır; yalnızca ilgili dersin tamamlanıp tamamlanmadığına bakılır. Arkadaş tercihleri gizlidir ve yalnızca karşılıklıysa dikkate alınır. Akran değerlendirmeleri anonimdir; öğretim üyesi yalnızca ortalamayı görür.</div>
  </div></div></div>`;
}
function pPlaceholder(name) {
  const titles = { genel: 'Genel İşlemler', ders: 'Ders ve Dönem İşlemleri', form: 'Form İşlemleri', belge: 'Belge Talebi', intibak: 'İntibak Başvuru', hazirlik: 'Hazırlık İşlemleri', basvuru: 'Başvuru İşlemleri', kullanici: 'Kullanıcı İşlemleri', dersler: 'Ders İşlemleri', not: 'Not İşlemleri', danisman: 'Danışmanlık İşlemleri' };
  return `<div class="crumb">YaşarOBS › ${titles[name] || ''}</div><div class="page-h"><h1>${titles[name] || 'Sayfa'}</h1></div>
  <div class="card empty"><div class="e">🧩</div><h2 style="color:var(--text)">Bu sayfa demo kapsamında değil</h2><p>Prototip yalnızca yeni <b>TakımBul</b> modülünü içerir. Diğer menüler OBS görünümünü tamamlamak için yer alır.</p>
  <button class="btn teal" data-act="nav" data-to="tb">TakımBul'a git →</button></div>`;
}

/* ----- TakımBul: öğrenci ----- */
function stuTabs(cur) {
  return `<div class="tabs"><button class="${cur === 'odev' ? 'on' : ''}" data-act="nav" data-to="tb">📁 Grup Ödevlerim</button><button class="${cur === 'arkadas' ? 'on' : ''}" data-act="nav" data-to="tb/arkadas">🤝 Çalışma Arkadaşı</button><button class="${cur === 'profil' ? 'on' : ''}" data-act="nav" data-to="tb/profil">👤 Profilim ${S.me.profileDone ? '' : '<span class="badge red" style="margin-left:4px">!</span>'}</button></div>`;
}
function tbHeader(sub) {
  return `<div class="crumb">YaşarOBS › İşbirliği › TakımBul</div>
  <div class="hero"><div class="bubbles"></div><span class="pill">🤝 TakımBul <span class="badge" style="background:#fff;color:var(--teal)">YENİ</span></span><h1>${sub.h}</h1><p>${sub.p}</p></div>`;
}
function pStuTB() {
  const mine = S.assignments.filter(a => a.course !== MAIN || a.status !== 'none');
  const a5 = S.assignments.find(a => a.course === MAIN);
  return tbHeader({ h: 'Grup ödevlerinde doğru ekip, adil iş bölümü', p: 'Becerilerine ve boş saatlerine göre dengeli gruplar kurulur; görevler panoda paylaşılır, teslimde herkesin katkısı görünür.' }) + stuTabs('odev') + `
  ${S.me.profileDone ? '' : `<div class="callout amber" style="margin-bottom:14px"><div class="ci">✍️</div><div style="flex:1"><b>Profilini tamamla</b><div class="small">Becerilerini ve boş saatlerini girersen öğretim üyeleri grup kurarken seni en uygun ekibe yerleştirebilir. 1 dakika sürer.</div></div><button class="btn sm" data-act="nav" data-to="tb/profil">Profili doldur</button></div>`}
  <div class="card"><h2>Grup ödevlerim</h2><p class="muted small">Bu dönem</p>
    ${mine.map(a => {
      const c = COURSES.find(x => x.code === a.course);
      let st;
      if (a.status === 'published') st = a.submitted && a.submitted[myGroupIdx(a)] ? '<span class="chip green">✓ Teslim edildi</span>' : `<span class="chip teal">Grubun hazır · %${progress(a.tasks[myGroupIdx(a)])}</span>`;
      else st = '<span class="chip amber">⏳ Gruplar oluşturuluyor</span>';
      return `<div class="list-item click" data-act="nav" data-to="tb/odev/${a.id}"><span class="code">${a.course}</span><div class="li-main"><b>${esc(a.title)}</b><span class="muted small">${c.name} · ${a.size} kişilik · Teslim ${fmtDate(a.due)} · ${a.method === 'akilli' ? '🧠 Akıllı eşleştirme' : '👥 Öğrenciler kurdu'}</span></div>${st}<span class="muted">›</span></div>`;
    }).join('')}
    ${a5 ? '' : `<div class="list-item" style="opacity:.75"><span class="code">EEE 3401</span><div class="li-main"><b>Gömülü Sistem Tasarımı</b><span class="muted small">Henüz grup ödevi tanımlanmadı</span></div></div>`}
  </div>${privacyCard()}`;
}
function fmtDate(d) { return new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }); }
function daysLeft(d) { const now = new Date(DEMO_TODAY.getTime() + S.week * 7 * 864e5); return Math.max(0, Math.round((new Date(d + 'T12:00:00') - now) / 864e5)); }

function availGrid(sel, mode) {
  // mode: 'edit' | {counts,size}
  let h = `<div class="avail"><div></div>${DAYS.map(d => `<div class="h">${d}</div>`).join('')}`;
  for (let s = 0; s < 5; s++) {
    h += `<div class="t">${SLOT_LBL[s]}</div>`;
    for (let d = 0; d < 5; d++) {
      const k = d * 5 + s; const c = classAt(k);
      if (mode === 'edit') {
        if (c) h += `<button class="slot class" disabled title="${c.code}">${c.code.split(' ')[1]}</button>`;
        else h += `<button class="slot ${sel.includes(k) ? 'on' : ''}" data-act="slot" data-k="${k}" aria-label="${slotName(k)}">${sel.includes(k) ? '✓' : ''}</button>`;
      } else {
        const n = mode.counts[k];
        if (c && mode.classes) h += `<div class="slot class" style="display:grid;place-items:center">${c.code.split(' ')[1]}</div>`;
        else if (n === mode.size) h += `<div class="slot common" style="display:grid;place-items:center">Hepsi</div>`;
        else if (n === mode.size - 1) h += `<div class="slot some" style="display:grid;place-items:center">${n}/${mode.size}</div>`;
        else h += `<div class="slot"></div>`;
      }
    }
  }
  return h + '</div>';
}
function pProfile() {
  const m = S.me;
  return tbHeader({ h: 'Profilim', p: 'Bu bilgiler yalnızca grup kurarken ve çalışma arkadaşı önerirken kullanılır. Notların hiçbir zaman kullanılmaz.' }) + stuTabs('profil') + `
  <div class="grid g2">
    <div class="card"><h2>Becerilerim</h2><p class="muted small">Kendini dürüstçe değerlendir; amaç dengeli ekipler kurmak.</p>
      ${SKILLS.map(k => `<div class="skill-row"><span style="font-size:18px">${k.i}</span><span class="nm">${k.n}${m.skills[k.id] >= 2 ? (ME_VER[k.id] ? `<small class="ev ok">✓ ${EVIDENCE[k.id]} tamamlandı</small>` : `<small class="ev no">Ders geçmişiyle doğrulanamadı · eşleştirmede biraz daha düşük ağırlıkla kullanılır</small>`) : ''}</span><span class="lvl">${[0, 1, 2, 3].map(v => `<button class="${m.skills[k.id] === v ? 'on' : ''}" data-act="skill" data-sk="${k.id}" data-v="${v}">${LVL[v]}</button>`).join('')}</span></div>`).join('')}
      <hr class="sep"><div class="grid g2" style="gap:12px">
        <div class="field" style="margin:0"><label>Çalışma tarzı</label><select class="input" data-bind="me.style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}" ${m.style === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="field" style="margin:0"><label>Öncelikli hedef</label><select class="input" data-bind="me.goal">${Object.entries(GOALS).map(([k, v]) => `<option value="${k}" ${m.goal === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      </div>
      <div class="field" style="margin:12px 0 0"><label>Birlikte çalışmak istediğim kişi <span class="muted">(isteğe bağlı)</span></label><select class="input" data-bind="me.friend" id="friend"><option value="">Tercih yok</option>${STUDENTS.slice().sort((x, y) => x.name.localeCompare(y.name, 'tr')).map(s => `<option value="${s.id}" ${m.friend === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
        <span class="small muted">🔒 Yalnızca <b>karşılıklı</b> tercih edilirse aynı gruba konursunuz. Tercihin kimseye gösterilmez.</span></div>
    </div>
    <div class="card"><div class="row"><div><h2>Boş saatlerim</h2><p class="muted small" style="margin:0">Kutulara tıklayarak seç. Ders saatlerin otomatik kilitlidir.</p></div><span class="sp"></span><button class="btn sm teal" data-act="autofill">⚡ Ders programımdan doldur</button></div>
      <div style="margin-top:12px">${availGrid(m.avail, 'edit')}</div>
      <div class="legend"><span><i style="background:var(--teal-2)"></i>Boşum</span><span><i style="background:#e2e8f0"></i>Dersim var</span><span>${m.avail.length} saat seçili</span></div>
    </div>
  </div>
  <div class="row" style="margin-top:16px"><span class="sp"></span><button class="btn lg primary" data-act="save-profile">💾 Profili kaydet</button></div>`;
}

function buddyMatches(course) {
  const me = meStudent();
  return STUDENTS.slice(0, 18).map((s, i) => {
    const common = s.avail.filter(k => me.avail.includes(k));
    const t = Math.min(1, common.length / 6);
    const g = s.goal === me.goal ? 1 : 0;
    const st = s.style === me.style ? 1 : (s.style === 'karma' || me.style === 'karma') ? 0.6 : 0;
    const comp = SKILLS.filter(k => s.skills[k.id] >= 2 && (me.skills[k.id] || 0) <= 1).length;
    const pct = Math.max(35, Math.min(92, Math.round(40 * t + 25 * g + 15 * st + Math.min(20, comp * 8) - (s.limit ? 7 : 0))));
    const reasons = [];
    if (common.length) reasons.push(`🗓️ ${common.length} ortak boş saat (${slotShort(common[0])}${common[1] !== undefined ? ', ' + slotShort(common[1]) : ''})`);
    if (g) reasons.push(`🎯 İkiniz de: ${GOALS[s.goal]}`);
    if (st) reasons.push(`📍 ${STYLES[s.style]} çalışmayı seviyor`);
    if (s.limit) reasons.push(`⏱️ ${s.limit}`);
    const strong = SKILLS.find(k => s.skills[k.id] >= 2 && (me.skills[k.id] || 0) <= 1);
    if (strong) reasons.push(`${strong.i} ${strong.n} konusunda güçlü`);
    return { s, pct, reasons, idx: i };
  }).filter(x => (x.idx + course.length) % 3 !== 0).sort((a, b) => b.pct - a.pct).slice(0, 4);
}
function pBuddy() {
  const b = S.buddy; const m = S.me;
  const courses = COURSES.map(c => c.code);
  const matches = buddyMatches(b.course);
  return tbHeader({ h: 'Çalışma arkadaşını bul', p: 'Aynı dersi alan, boş saatleri ve hedefi seninkine uyan öğrencilerle gönüllü olarak eşleş. Sadece adın ve tercihlerin paylaşılır.' }) + stuTabs('arkadas') + `
  <div class="card" style="margin-bottom:16px"><div class="row wrap" style="gap:14px">
    <div><div class="small muted" style="font-weight:600;margin-bottom:6px">Ders</div><div class="checks">${courses.map(c => `<span class="check ${b.course === c ? 'on' : ''}" data-act="buddy-course" data-c="${c}">${c}</span>`).join('')}</div></div>
    <span class="sp"></span>
    <div class="field" style="margin:0;min-width:170px"><label>Hedefim</label><select class="input" data-bind="me.goal">${Object.entries(GOALS).map(([k, v]) => `<option value="${k}" ${m.goal === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="field" style="margin:0;min-width:140px"><label>Tarz</label><select class="input" data-bind="me.style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}" ${m.style === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
  </div></div>
  <div class="row" style="margin-bottom:10px"><h2 style="margin:0;font-size:16px">${b.course} için önerilen çalışma arkadaşları</h2><span class="sp"></span><span class="chip gray">Uyum skoruna göre sıralı</span></div>
  ${matches.map(x => {
    const st = b.req[x.s.id];
    return `<div class="match"><div class="ring" style="--p:${x.pct}"><b>%${x.pct}</b></div>
      <div style="flex:1;min-width:0"><div class="person">${av(x.s.id)}<div><b>${esc(x.s.name)}</b><small>${STYLES[x.s.style]} · ${GOALS[x.s.goal]}</small></div></div>
      <div class="reasons">${x.reasons.map(r => `<span class="chip gray">${esc(r)}</span>`).join('')}</div></div>
      ${st === 'ok' ? `<button class="btn green" data-act="nav" data-to="tb/arkadas">✓ Eşleştiniz</button>` : st === 'wait' ? `<button class="btn" disabled>⏳ İstek gönderildi</button>` : `<button class="btn teal" data-act="buddy-req" data-id="${x.s.id}">İstek gönder</button>`}
    </div>`;
  }).join('')}
  <div class="callout blue" style="margin-top:16px"><div class="ci">💡</div><div class="small"><b>Uyum skoru nasıl hesaplanıyor?</b> %40 ortak boş saat, %25 aynı hedef, %15 çalışma tarzı, %20 birbirini tamamlayan beceriler. Not ortalaması hiçbir şekilde kullanılmaz.</div></div>`;
}

function pStuAssignment(a) {
  const c = COURSES.find(x => x.code === a.course);
  const head = `<div class="crumb">YaşarOBS › TakımBul › ${a.course}</div>
  <div class="page-h"><div><span class="code">${a.course}</span> <span class="muted small">${c.name} · ${c.ins}</span><h1 style="margin-top:6px">${esc(a.title)}</h1></div><span class="sp"></span>
  <div class="card" style="padding:10px 16px;text-align:center"><div class="small muted">Teslime kalan</div><b style="font-size:22px">${daysLeft(a.due)} gün</b><div class="small muted">${fmtDate(a.due)}</div></div></div>`;
  if (a.status !== 'published') {
    return head + `<div class="card empty"><div class="e">⏳</div><h2 style="color:var(--text)">Grubun henüz oluşturulmadı</h2><p>${c.ins} bu ödev için <b>${a.size} kişilik gruplar</b> kuracak. Gruplar becerilere ve ortak boş saatlere göre dengeli kurulur.</p>
    ${S.me.profileDone ? '<span class="chip green">✓ Profilin hazır, en uygun gruba yerleştirileceksin</span>' : '<button class="btn teal" data-act="nav" data-to="tb/profil">Profilimi doldur →</button>'}</div>`;
  }
  const gi = myGroupIdx(a); const g = a.groups[gi]; const tasks = a.tasks[gi];
  const st = groupStats(g, a.req);
  const roles = suggestRoles(g, a.req);
  const others = g.filter(m => m !== 'me');
  const firstMeet = st.common[0] !== undefined ? st.common[0] : st.counts.indexOf(Math.max(...st.counts));
  const place = (firstMeet % 5) >= 1 && (firstMeet % 5) <= 3 ? 'Elektronik Laboratuvarı 2 (lehim istasyonu boş)' : 'Kütüphane Grup Çalışma Odası 2';
  const prog = progress(tasks);
  const ct = contrib(tasks, g);
  const unassigned = tasks.filter(t => !t.who).length;
  const submitted = a.submitted && a.submitted[gi];
  const bl = a.baseline;
  return head + `
  ${a.method === 'akilli' ? (() => {
    const pair = mutualPairs(); const fr = pair.me && g.includes(pair.me) ? pair.me : null;
    const best = r => g.slice().sort((x, y) => eff(getS(y), r) - eff(getS(x), r))[0];
    return `<div class="callout teal" style="margin-bottom:16px"><div class="ci">🧠</div><div><b>Neden bu grup?</b><div class="small" style="margin-top:4px">
    • ${st.missing.length ? `Gerekli becerilerin çoğu ekibinde var: ` : `Gerekli tüm beceriler ekibinde var: `}${a.req.map(r => { const b = best(r); return `${SK[r].i} ${b === 'me' ? 'sen' : esc(firstName(b))}`; }).join(', ')}${st.missing.length ? ` <span style="color:var(--amber)">(${st.missing.map(m => SK[m].s).join(', ')} tarafı zayıf — dersin asistanından destek alabilirsiniz)</span>` : ''}.<br>
    • <b>${st.common.length} ortak boş saatiniz</b> var${st.near.length ? `, ${st.near.length} saatte de 4 kişiden 3'ü boş` : ''}${bl ? ` (rastgele gruplamada ortalama ${bl.common.toFixed(1)})` : ''}.<br>
    ${fr ? `• ${esc(getS(fr).name)} ile karşılıklı tercihiniz dikkate alındı.<br>` : ''}
    • Gruplar arası beceri farkı en aza indirildi; hiçbir grup "güçlü" ya da "zayıf" olarak kurulmadı.</div></div></div>`;
  })() : ''}
  <div class="grid g2">
    <div class="card"><div class="row"><h2>Ekibin</h2><span class="sp"></span><span class="chip gray">${g.length} kişi</span></div>
      ${g.map(m => { const s = getS(m); return `<div class="list-item" style="padding:10px">${av(m)}<div class="li-main"><b>${m === 'me' ? 'Deniz Kaya (sen)' : esc(s.name)}</b><span class="muted small">Önerilen rol: <b style="display:inline;color:var(--teal)">${SK[roles[m]].role}</b>${s.limit ? `<br>⏱️ ${esc(s.limit)}` : ''}</span></div>${skIcons(s)}</div>`; }).join('')}
    </div>
    <div class="card"><h2>Ortak zaman</h2><p class="muted small" style="margin-top:0">Herkesin boş olduğu saatler yeşil.</p>
      ${availGrid([], { counts: st.counts, size: g.length, classes: true })}
      <div class="callout blue" style="margin-top:12px"><div class="ci">📍</div><div style="flex:1"><b>İlk buluşma önerisi</b><div class="small">${slotName(firstMeet)}${st.common.includes(firstMeet) ? '' : ` (${st.counts[firstMeet]}/${g.length} kişi)`} · ${place}</div></div><button class="btn sm" data-act="ics" data-k="${firstMeet}" data-id="${a.id}">📅 Takvime ekle</button></div>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="row wrap"><h2 style="margin:0">Görev panosu</h2><span class="chip ${prog >= 70 ? 'green' : 'teal'}">%${prog} tamamlandı</span><span class="sp"></span>
      ${unassigned ? `<button class="btn teal pulse" data-act="distribute" data-id="${a.id}">✨ Görevleri becerilere göre dağıt</button>` : ''}
      <button class="btn sm" data-act="add-task" data-id="${a.id}">＋ Görev ekle</button></div>
    <div class="bar big" style="margin:12px 0 14px"><i style="width:${prog}%"></i></div>
    <div id="board">${kanban(a, gi)}</div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h2>Katkı dağılımı</h2><p class="muted small" style="margin-top:0">Tamamlanan iş puanına göre. Teslimde öğretim üyesi de görür.</p>
      ${g.map(m => `<div class="row" style="margin:10px 0">${av(m)}<div style="width:110px" class="small"><b>${m === 'me' ? 'Sen' : esc(firstName(m))}</b></div><div class="bar" style="flex:1"><i style="width:${ct.pct[m]}%"></i></div><b class="small" style="width:40px;text-align:right">%${ct.pct[m]}</b></div>`).join('')}
      ${others.some(m => ct.pct[m] === 0) && S.week > 0 ? `<div class="callout amber small" style="margin-top:8px"><div class="ci">⚠️</div><div>Henüz katkısı görünmeyen bir ekip arkadaşın var. Sohbetten nazikçe hatırlatabilirsin.</div></div>` : ''}
    </div>
    <div class="card"><h2>Grup sohbeti</h2>
      <div class="chat"><div class="msgs" id="msgs">${(a.chat || []).map(msgHtml).join('') || '<div class="muted small" style="text-align:center;margin:auto">İlk mesajı sen yaz 👋</div>'}</div>
      <form class="chat-in" data-form="chat" data-id="${a.id}"><input class="input" name="m" placeholder="Mesaj yaz…" autocomplete="off"><button class="btn primary">Gönder</button></form></div>
    </div>
  </div>
  <div class="card" style="margin-top:16px"><div class="row wrap">
    <div style="font-size:26px">${submitted ? '✅' : '📤'}</div><div style="flex:1"><h2 style="margin:0">${submitted ? 'Ödev teslim edildi' : 'Teslim'}</h2><div class="muted small">${submitted ? 'Akran değerlendirmen anonim olarak kaydedildi. Katkı raporu öğretim üyesine iletildi.' : 'Teslim ederken ekip arkadaşlarını anonim olarak değerlendirirsin. Böylece herkesin emeği adil görünür.'}</div></div>
    ${submitted ? '' : `<button class="btn primary" data-act="submit" data-id="${a.id}">Teslim et ve değerlendir</button>`}
  </div></div>`;
}
function kanban(a, gi) {
  const tasks = a.tasks[gi];
  const cols = ['📌 Yapılacak', '🔧 Devam ediyor', '✅ Bitti'];
  return `<div class="kanban">${cols.map((cn, ci) => `<div class="kcol"><h4>${cn}<span class="muted">${tasks.filter(t => t.col === ci).length}</span></h4>
    ${tasks.filter(t => t.col === ci).map(t => `<div class="task ${t.who ? '' : 'unassigned'}" data-key="${t.id}"><div class="tt">${esc(t.t)}</div>
      <div class="tm"><span class="chip gray" style="font-size:11px">${SK[t.skill].i} ${SK[t.skill].s}</span><span>${t.pts} puan</span>
      <span class="mv">${t.who ? av(t.who) : '<span class="chip amber" style="font-size:11px">Atanmadı</span>'}
      ${t.who === 'me' && ci > 0 ? `<button data-act="mv" data-id="${a.id}" data-t="${t.id}" data-d="-1" aria-label="Geri al">←</button>` : ''}
      ${t.who === 'me' && ci < 2 ? `<button data-act="mv" data-id="${a.id}" data-t="${t.id}" data-d="1" aria-label="İlerlet">→</button>` : ''}</span></div></div>`).join('')}
  </div>`).join('')}</div>`;
}
function msgHtml(m) {
  if (m.sys) return `<div class="msg sys"><div class="bub">${esc(m.text)}</div></div>`;
  const mine = m.who === 'me';
  return `<div class="msg ${mine ? 'me' : ''}">${av(m.who)}<div class="bub"><small>${mine ? 'Sen' : esc(getS(m.who).name)}</small>${esc(m.text)}</div></div>`;
}

/* ----- TakımBul: öğretim üyesi ----- */
function pInsTB() {
  const list = S.assignments.filter(a => a.course === MAIN);
  const pub = list.find(a => a.status === 'published');
  const risks = pub ? riskList(pub).filter(r => r.level !== 'ok').length : 0;
  return tbHeader({ h: 'Grup ödevlerini akıllıca yönetin', p: 'Öğrencilerin beyan ettiği beceri ve boş saatlere göre dengeli gruplar kurun, ilerlemeyi izleyin, teslimde adil katkı raporu alın.' }) + `
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat"><span>EEE 3401 öğrencisi</span><b>24</b><span>${S.me.profileDone ? '24/24 profil dolu' : '23/24 profil dolu'}</span></div>
    <div class="card stat"><span>Aktif grup ödevi</span><b>${list.length}</b><span>Bu dönem</span></div>
    <div class="card stat"><span>Grup sayısı</span><b>${pub ? pub.groups.length : '–'}</b><span>${pub ? pub.size + ' kişilik' : 'Henüz kurulmadı'}</span></div>
    <div class="card stat"><span>Dikkat gereken</span><b style="color:${risks ? 'var(--red)' : 'inherit'}">${risks}</b><span>grup uyarısı</span></div>
  </div>
  <div class="card"><div class="row"><div><h2>Grup ödevleri</h2><p class="muted small" style="margin:0">EEE 3401 Gömülü Sistem Tasarımı</p></div><span class="sp"></span><button class="btn teal ${list.length ? '' : 'pulse'}" data-act="nav" data-to="tb/yeni">＋ Yeni grup ödevi</button></div>
    <div style="margin-top:14px">${list.length ? list.map(a => `<div class="list-item click" data-act="nav" data-to="tb/odev/${a.id}"><span class="code">${a.course}</span><div class="li-main"><b>${esc(a.title)}</b><span class="muted small">${a.size} kişilik · Teslim ${fmtDate(a.due)} · ${a.method === 'akilli' ? '🧠 Akıllı eşleştirme' : a.method === 'ogrenci' ? '👥 Öğrenciler kursun' : '🎲 Rastgele'}</span></div>${a.status === 'published' ? '<span class="chip green">Yayında</span>' : a.status === 'review' ? '<span class="chip violet">Gruplar hazır · onay bekliyor</span>' : '<span class="chip amber">Taslak</span>'}<span class="muted">›</span></div>`).join('') : `<div class="empty"><div class="e">📁</div>Henüz grup ödevi yok. İlk ödevinizi oluşturun.</div>`}
    <div class="list-item" style="opacity:.7"><span class="code" style="background:#64748b">EEE 3401</span><div class="li-main"><b>Lab Föyü 1: GPIO ve Kesmeler</b><span class="muted small">Bireysel · Tamamlandı</span></div><span class="chip gray">Arşiv</span></div></div>
  </div>${privacyCard()}`;
}
function defaultForm() {
  return { title: 'Dönem Projesi: IoT Tabanlı Akıllı Enerji İzleme Sistemi', size: 4, due: '2026-12-25', method: 'akilli', req: ['devre', 'pcb', 'gomulu', 'matlab'], weight: 60 };
}
function pNew() {
  const f = S.form || (S.form = defaultForm());
  const n = 24, G = Math.floor(n / f.size);
  return `<div class="crumb">YaşarOBS › TakımBul › Yeni grup ödevi</div><div class="page-h"><h1>Yeni grup ödevi</h1><span class="chip">EEE 3401 · 24 öğrenci</span></div>
  <div class="grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
    <div class="card">
      <div class="field"><label>Ödev başlığı</label><input class="input" data-bind="form.title" value="${esc(f.title)}"></div>
      <div class="grid g2" style="gap:12px"><div class="field"><label>Grup büyüklüğü</label><select class="input" data-bind="form.size" data-num="1">${[2, 3, 4, 5, 6].map(v => `<option ${+f.size === v ? 'selected' : ''} value="${v}">${v} kişi</option>`).join('')}</select></div>
      <div class="field"><label>Teslim tarihi</label><input class="input" type="date" data-bind="form.due" value="${f.due}"></div></div>
      <div class="field"><label>Gruplar nasıl kurulsun?</label>
        ${[['akilli', '🧠 Akıllı eşleştirme (önerilen)', 'Beceri dengesi ve ortak boş saatlere göre sistem kurar.'], ['ogrenci', '👥 Öğrenciler kendi kursun', 'Grupsuz kalanlar son tarihte otomatik eşleştirilir.'], ['rastgele', '🎲 Rastgele', 'Klasik yöntem; karşılaştırma için.']].map(([k, t, d]) => `<label class="opt ${f.method === k ? 'on' : ''}" data-act="form-method" data-m="${k}"><input type="radio" name="m" ${f.method === k ? 'checked' : ''}><div><b>${t}</b><span>${d}</span></div></label>`).join('')}
      </div>
      <div class="field"><label>Her grupta bulunması gereken beceriler</label><div class="checks">${SKILLS.map(k => `<span class="check ${f.req.includes(k.id) ? 'on' : ''}" data-act="form-req" data-sk="${k.id}">${k.i} ${k.n}</span>`).join('')}</div></div>
      <div class="field"><label>Öncelik: <span class="muted" id="wlabel">Beceri dengesi %${f.weight} · Ortak zaman %${100 - f.weight}</span></label><input type="range" class="range" min="20" max="90" step="5" value="${f.weight}" data-bind="form.weight" data-num="1" data-live="1"></div>
      <div class="row"><span class="sp"></span><button class="btn" data-act="nav" data-to="tb">Vazgeç</button><button class="btn lg teal" data-act="create">Ödevi oluştur →</button></div>
    </div>
    <div class="stack">
      <div class="card"><h3>Özet</h3><div class="stat"><b>${G} grup</b><span>${n} öğrenci · ${f.size} kişilik${n % f.size ? ` (${n % f.size} grup ${+f.size + 1} kişi)` : ''}</span></div></div>
      ${(() => {
        const all = [...STUDENTS, meStudent()];
        const cnt = k => ({ dec: all.filter(s => s.skills[k] >= 2).length, ver: all.filter(s => s.skills[k] >= 2 && s.ver && s.ver[k]).length });
        const scarce = f.req.slice().sort((x, y) => cnt(x).ver - cnt(y).ver).slice(0, 2);
        const pairs = Object.keys(mutualPairs()).length / 2;
        return `<div class="card"><h3>Sınıfın beceri dağılımı</h3><p class="muted small" style="margin-top:0">“İyi” ve üstü · <span style="color:var(--teal)">■</span> ders geçmişiyle doğrulanmış · <span style="color:#cbd5e1">■</span> yalnızca beyan</p>
        ${SKILLS.map(k => { const c = cnt(k.id); return `<div class="row small" style="margin:7px 0"><span style="width:170px">${k.i} ${k.s}</span><div class="bar" style="flex:1;background:#eef2f7;position:relative"><i style="position:absolute;inset:0 auto 0 0;width:${c.dec / 24 * 100}%;background:#cbd5e1"></i><i style="position:absolute;inset:0 auto 0 0;width:${c.ver / 24 * 100}%"></i></div><b style="width:44px;text-align:right">${c.ver}/${c.dec}</b></div>`; }).join('')}
        <div class="callout amber small" style="margin-top:10px"><div class="ci">💡</div><div>${scarce.map(x => SK[x].s).join(' ve ')} becerisi az kişide doğrulanmış. Rastgele gruplamada bazı gruplar bu becerilerden yoksun kalır.</div></div></div>
        <div class="card"><h3>Dikkate alınacak kısıtlar</h3><div class="cons">
          <div>⏱️<span><b>${all.filter(s => s.limit).length} öğrenci</b> çalışma kısıtı belirtti (iş, ulaşım, kulüp)</span></div>
          <div>🤝<span><b>${pairs} karşılıklı</b> “birlikte çalışmak istiyorum” tercihi var${S.me.friend ? '' : ' (tek taraflılar dikkate alınmaz)'}</span></div>
          <div>❔<span><b>${all.filter(s => SKILLS.some(k => s.skills[k.id] >= 2 && !(s.ver || {})[k.id])).length} öğrencinin</b> bazı beyanları ders geçmişiyle doğrulanamadı; bunlar düşük ağırlıkla kullanılır</span></div>
        </div></div>`;
      })()}
    </div>
  </div>`;
}

function riskList(a) {
  return a.groups.map((g, gi) => {
    const tasks = a.tasks[gi]; const prog = progress(tasks);
    const ct = contrib(tasks, g);
    const items = [];
    const un = tasks.filter(t => !t.who).length;
    if (S.week >= 1 && un) items.push({ t: `${un} görev atanmadı`, level: 'warn' });
    if (S.week >= 1) g.forEach(m => { const active = tasks.some(t => t.who === m && t.col > 0); if (!active && tasks.some(t => t.who === m)) items.push({ t: `${m === 'me' ? 'Deniz' : firstName(m)} hareketsiz`, level: 'bad' }); });
    const expected = Math.min(100, S.week * 22);
    if (S.week >= 1 && prog < expected - 20) items.push({ t: 'Plana göre geride', level: 'warn' });
    const level = items.some(i => i.level === 'bad') ? 'bad' : items.length ? 'warn' : 'ok';
    return { gi, g, prog, ct, items, level };
  });
}
function pInsAssignment(a, tab) {
  const head = `<div class="crumb">YaşarOBS › TakımBul › ${a.course}</div>
  <div class="page-h"><div><span class="code">${a.course}</span> <span class="muted small">Gömülü Sistem Tasarımı · 24 öğrenci</span><h1 style="margin-top:6px">${esc(a.title)}</h1></div><span class="sp"></span>
  <span class="chip gray">${a.size} kişilik</span><span class="chip gray">Teslim ${fmtDate(a.due)}</span><span class="chip ${a.status === 'published' ? 'green' : a.status === 'review' ? 'violet' : 'amber'}">${a.status === 'published' ? 'Yayında' : a.status === 'review' ? 'Onay bekliyor' : 'Taslak'}</span></div>`;
  if (a.status === 'draft') {
    if (S.ui && S.ui.optim) return head + optimizerShell();
    return head + `<div class="card" style="text-align:center;padding:40px">
      <div style="font-size:44px">🧠</div><h2 style="font-size:20px">Gruplar oluşturulmaya hazır</h2>
      <p class="muted" style="max-width:560px;margin:8px auto 18px">24 öğrencinin beyan ettiği beceriler ve boş saatler kullanılarak <b>${Math.floor(24 / a.size)} dengeli grup</b> kurulacak. Gerekli beceriler: ${a.req.map(r => SK[r].i + ' ' + SK[r].n).join(', ')}.</p>
      <button class="btn lg teal pulse" data-act="optimize" data-id="${a.id}">🧠 Akıllı grupları oluştur</button>
      <div class="small muted" style="margin-top:14px">Notlar ve ortalamalar kullanılmaz.</div></div>`;
  }
  const tabs = a.status === 'published' ? `<div class="tabs"><button class="${tab === 'gruplar' ? 'on' : ''}" data-act="nav" data-to="tb/odev/${a.id}">👥 Gruplar</button><button class="${tab === 'izleme' ? 'on' : ''}" data-act="nav" data-to="tb/odev/${a.id}/izleme">📈 İzleme ${riskList(a).some(r => r.level !== 'ok') ? '<span class="badge red" style="margin-left:4px">!</span>' : ''}</button><button class="${tab === 'rapor' ? 'on' : ''}" data-act="nav" data-to="tb/odev/${a.id}/rapor">⚖️ Katkı raporu</button></div>` : '';
  if (tab === 'izleme') return head + tabs + insMonitor(a);
  if (tab === 'rapor') return head + tabs + insReport(a);
  const sm = summarize(a.groups, a.req, a.weight / 100); const bl = a.baseline;
  return head + tabs + `
  <div class="grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);margin-bottom:16px">
    <div class="compare">
      <div class="cmp bad"><div class="small muted" style="font-weight:700">🎲 Rastgele gruplama (ortalama)</div>
        <div class="row" style="margin-top:8px;gap:18px"><div><div class="k">${Math.round(bl.missingRate * a.groups.length)}/${a.groups.length}</div><div class="small muted">grupta eksik beceri</div></div><div><div class="k">${bl.common.toFixed(1)}</div><div class="small muted">ortak boş saat</div></div><div><div class="k">${Math.round(bl.score)}</div><div class="small muted">denge skoru</div></div></div></div>
      <div class="cmp good"><div class="small" style="font-weight:700;color:var(--green)">🧠 TakımBul</div>
        <div class="row" style="margin-top:8px;gap:18px"><div><div class="k" style="color:var(--green)">${sm.missing}/${a.groups.length}</div><div class="small muted">grupta eksik beceri</div></div><div><div class="k" style="color:var(--green)">${sm.common.toFixed(1)}</div><div class="small muted">ortak boş saat</div></div><div><div class="k" style="color:var(--green)">${Math.round(sm.score)}</div><div class="small muted">denge skoru</div></div></div></div>
    </div>
    <div class="card row" style="gap:12px">
      ${a.status === 'review' ? `<div style="flex:1"><b>Gruplar hazır</b><div class="small muted">Yayınladığınızda öğrencilere bildirim gider.</div></div><div class="stack" style="text-align:right"><button class="btn lg teal" data-act="publish" data-id="${a.id}">📣 Yayınla ve bildir</button><button class="btn sm ghost" data-act="reopt" data-id="${a.id}">🔁 Yeniden oluştur</button></div>`
      : `<div style="font-size:26px">📣</div><div style="flex:1"><b>Yayında</b><div class="small muted">${a.groups.length} grup, ${24} öğrenci bilgilendirildi.</div></div>`}
    </div>
  </div>
  <div class="card" style="margin-bottom:16px"><div class="row wrap" style="align-items:flex-start;gap:20px">
    <div style="flex:1;min-width:280px"><h3>Kısıtlar ve uyarılar</h3><div class="cons">
      <div>${sm.pairs && sm.pairsKept === sm.pairs ? '✅' : '⚠️'}<span>${sm.pairs ? `${sm.pairsKept}/${sm.pairs} karşılıklı arkadaş tercihi korundu` : 'Karşılıklı arkadaş tercihi yok'}</span></div>
      <div>✅<span>${sm.limits} öğrencinin zaman kısıtı (iş, ulaşım, kulüp) ortak saat hesabına dahil edildi</span></div>
      <div>${sm.missing ? '⚠️' : '✅'}<span>${sm.missing ? `${sm.missing} grupta bir beceri yalnızca beyanla karşılanıyor — elle düzenleyebilirsiniz` : 'Her grupta gerekli tüm beceriler var'}</span></div>
      <div>${sm.noTime ? '⚠️' : '✅'}<span>${sm.noTime ? `${sm.noTime} grubun tam ortak saati yok; 4 kişiden 3'ünün boş olduğu saatler önerilecek` : 'Her grubun en az bir tam ortak saati var'}</span></div>
    </div></div>
    ${a.status === 'review' ? `<div class="callout blue small" style="flex:1;min-width:260px"><div class="ci">✋</div><div><b>Elle düzenleme:</b> Bir öğrenciye, ardından başka bir gruptaki öğrenciye tıklayın; yer değiştirirler ve skor anında yeniden hesaplanır. Son karar her zaman öğretim üyesinindir.${a.manual ? `<br><b>${a.manual} elle değişiklik</b> yapıldı.` : ''}</div></div>` : ''}
  </div></div>
  <div class="groups">${a.groups.map((g, gi) => groupCol(g, gi, a, false, a.status === 'review')).join('')}</div>`;
}
function groupCol(g, gi, a, compact, pickable) {
  const st = groupStats(g, a.req);
  const w = (a.weight || 60) / 100; const fit = Math.round((w * st.covScore + (1 - w) * st.timeScore) * 100);
  const pair = mutualPairs();
  return `<div class="gcol"><h4>Grup ${gi + 1}<span class="sp"></span>${st.missing.length ? `<span class="chip red" style="font-size:10.5px">Eksik: ${st.missing.map(m => SK[m].i).join('')}</span>` : '<span class="chip green" style="font-size:10.5px">✓ Dengeli</span>'}</h4>
    ${g.map(id => scard(id, a.req, pickable, pair[id] && g.includes(pair[id]))).join('')}
    ${compact ? '' : `<div class="cov">${a.req.map(r => `<span title="${SK[r].n}">${SK[r].i}</span><div class="bar ${st.cov[r] < 2 ? 'red' : ''}"><i style="width:${st.cov[r] / 3 * 100}%"></i></div>`).join('')}</div>`}
    <div class="gmeta"><span class="chip ${st.common.length >= 2 ? 'green' : st.common.length ? 'amber' : 'red'}" title="${st.common.map(slotShort).join(', ')}">🗓️ ${st.common.length} ortak saat${st.common.length ? '' : ` · ${st.near.length} saat 3/4`}</span><span class="chip gray">Uyum %${fit}</span></div>
  </div>`;
}
function scard(id, req, pickable, paired) {
  const s = getS(id);
  return `<div class="scard ${id === 'me' ? 'me' : ''} ${S.ui && S.ui.pick === id ? 'pick' : ''}" data-key="${id}" ${pickable ? `data-act="pick" data-id="${id}"` : ''}>${av(id)}<span class="nm">${id === 'me' ? 'Deniz Kaya' : esc(s.name)}</span>${paired ? '<span class="lnk" title="Karşılıklı tercih">🔗</span>' : ''}${s.limit ? `<span class="lnk" title="${esc(s.limit)}">⏱️</span>` : ''}${skIcons(s, req)}</div>`;
}
function insMonitor(a) {
  const rl = riskList(a);
  return `${S.week === 0 ? `<div class="callout blue" style="margin-bottom:14px"><div class="ci">⏩</div><div class="small">Gruplar yeni yayınlandı. Demo panelindeki <b>“Bir hafta ileri sar”</b> ile zamanı ilerletip grupların gidişatını izleyin.</div></div>` : ''}
  <div class="card"><div class="row"><h2 style="margin:0">Grup ilerlemesi · Hafta ${S.week}</h2><span class="sp"></span><span class="chip gray">Beklenen: %${Math.min(100, S.week * 22)}</span></div>
  <table class="tbl" style="margin-top:10px"><thead><tr><th>Grup</th><th>Üyeler</th><th style="width:26%">İlerleme</th><th>Durum</th><th></th></tr></thead><tbody>
  ${rl.map(r => `<tr><td><b>Grup ${r.gi + 1}</b></td><td><span class="row" style="gap:3px">${r.g.map(m => av(m)).join('')}</span></td>
    <td><div class="row"><div class="bar ${r.level === 'bad' ? 'red' : r.level === 'warn' ? 'amber' : ''}" style="flex:1"><i style="width:${r.prog}%"></i></div><b class="small">%${r.prog}</b></div></td>
    <td>${r.items.length ? r.items.map(i => `<span class="chip ${i.level === 'bad' ? 'red' : 'amber'}" style="margin:2px">${i.level === 'bad' ? '⚠️' : '⏱️'} ${esc(i.t)}</span>`).join('') : '<span class="chip green">✓ Yolunda</span>'}</td>
    <td style="text-align:right">${r.level !== 'ok' ? (a.reminded[r.gi] ? '<span class="chip gray">✓ Hatırlatıldı</span>' : `<button class="btn sm" data-act="remind" data-id="${a.id}" data-g="${r.gi}">🔔 Hatırlat</button>`) : ''}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function peerFor(a, gi, m) {
  const p = a.peer && a.peer[gi] && a.peer[gi][m];
  if (p && p.length) return p.reduce((x, y) => x + y, 0) / p.length;
  const lazy = a.lazy[gi] === m;
  const r = rng(gi * 31 + m.length * 7 + (m.charCodeAt(1) || 0));
  return lazy ? (a.reminded[gi] ? 3.2 : 2.1) : 4 + r() * 0.9;
}
function insReport(a) {
  if (S.week < 1) return `<div class="card empty"><div class="e">⚖️</div>Katkı raporu ilk haftadan sonra oluşur. Demo panelinden zamanı ileri sarın.</div>`;
  const order = a.groups.map((g, gi) => gi).sort((x, y) => (a.groups[y].includes('me') ? 1 : 0) - (a.groups[x].includes('me') ? 1 : 0));
  return `<div class="callout blue" style="margin-bottom:14px"><div class="ci">⚖️</div><div class="small"><b>Bedavacı sorununa çözüm:</b> Her üyenin katkısı, görev panosundaki tamamlanan iş puanı ve anonim akran değerlendirmesiyle birlikte gösterilir. Bireysel not ayarlaması tamamen öğretim üyesinin kararıdır.</div></div>
  <div class="grid g2">${order.map(gi => {
    const g = a.groups[gi]; const ct = contrib(a.tasks[gi], g);
    return `<div class="card"><div class="row"><h3 style="margin:0">Grup ${gi + 1}</h3><span class="sp"></span>${a.submitted[gi] ? '<span class="chip green">✓ Teslim edildi</span>' : `<span class="chip gray">%${progress(a.tasks[gi])}</span>`}</div>
      <table class="tbl" style="margin-top:6px"><thead><tr><th>Üye</th><th>Katkı</th><th>Akran</th><th></th></tr></thead><tbody>
      ${g.map(m => { const pr = peerFor(a, gi, m); const flag = ct.pct[m] < 10 || pr < 2.6; return `<tr><td><div class="person">${av(m)}<b>${m === 'me' ? 'Deniz Kaya' : esc(getS(m).name)}</b></div></td><td style="width:34%"><div class="row"><div class="bar ${flag ? 'red' : ''}" style="flex:1"><i style="width:${ct.pct[m]}%"></i></div><b class="small">%${ct.pct[m]}</b></div></td><td><b>${pr.toFixed(1)}</b> <span style="color:#f59e0b">★</span></td><td>${flag ? '<span class="chip red">İnceleyin</span>' : ''}</td></tr>`; }).join('')}
      </tbody></table></div>`;
  }).join('')}</div>`;
}

/* ---------- optimizasyon animasyonu ---------- */
let animToken = 0;
function cancelAnim() { animToken++; }
function optimizerShell() {
  return `<div class="optimizer">
    <div class="card"><div class="gb-head"><h2 style="margin:0" id="ph">Profiller okunuyor…</h2><span class="sp"></span><span class="chip violet" id="phchip">1/3</span></div>
      <div id="board" style="margin-top:14px"></div></div>
    <div class="score-box"><small>DENGE SKORU</small><div class="big" id="score">–</div><small id="iter">Başlıyor…</small>
      <svg viewBox="0 0 260 90" preserveAspectRatio="none" id="chart"><polyline id="line" fill="none" stroke="#2dd4bf" stroke-width="3" points=""/></svg>
      <div class="small" style="color:#9fb3cf;margin-top:8px">Her adımda iki öğrenci takas edilir; skor yükselirse takas kalır.</div></div>
  </div>`;
}
function flip(container, mutate) {
  const first = new Map();
  container.querySelectorAll('[data-key]').forEach(el => first.set(el.dataset.key, el.getBoundingClientRect()));
  mutate();
  container.querySelectorAll('[data-key]').forEach(el => {
    const f = first.get(el.dataset.key); if (!f) return;
    const l = el.getBoundingClientRect(); const dx = f.left - l.left, dy = f.top - l.top;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
}
async function runOptimizer(a) {
  const tok = ++animToken;
  S.ui = { optim: true }; render();
  const ids = ['me', ...STUDENTS.map(s => s.id)];
  const w = a.weight / 100;
  const steps = optimize(ids, a.size, a.req, w, 99 + (a.reseed || 0));
  const bl = baseline(ids, a.size, a.req, w);
  const board = $('#board'); if (!board) return;
  const alive = () => tok === animToken && $('#board') === board;
  const setPhase = (t, c) => { $('#ph').textContent = t; $('#phchip').textContent = c; };
  const drawPool = () => { board.innerHTML = `<div class="pool">${ids.map(id => scard(id, a.req)).join('')}</div>`; };
  const drawGroups = (gs) => { board.innerHTML = `<div class="groups">${gs.map((g, gi) => groupCol(g, gi, a, true)).join('')}</div>`; };
  const scores = [];
  const plot = () => {
    const max = 100, min = Math.max(0, Math.min(...scores) - 10);
    const pts = scores.map((s, i) => `${(i / Math.max(1, steps.length - 1)) * 260},${90 - ((s - min) / (max - min)) * 86}`).join(' ');
    $('#line').setAttribute('points', pts);
  };
  drawPool();
  await sleep(1300); if (!alive()) return;
  setPhase('Başlangıç: rastgele dağılım', '2/3');
  flip(board, () => drawGroups(steps[0].groups));
  scores.push(steps[0].score); $('#score').textContent = Math.round(steps[0].score); $('#iter').textContent = 'Rastgele başlangıç'; plot();
  await sleep(1800); if (!alive()) return;
  setPhase('Optimizasyon: dengeli gruplar aranıyor', '3/3');
  const delay = Math.max(260, Math.min(650, 9000 / steps.length));
  for (let i = 1; i < steps.length; i++) {
    flip(board, () => drawGroups(steps[i].groups));
    (steps[i].swap || []).forEach(id => { const el = board.querySelector(`[data-key="${id}"]`); if (el) el.classList.add('flash'); });
    scores.push(steps[i].score); $('#score').textContent = Math.round(steps[i].score);
    $('#iter').textContent = `Adım ${i}/${steps.length - 1} · ${firstName(steps[i].swap[0])}${steps[i].swap.length > 2 ? ' + ' + firstName(steps[i].swap[1]) : ''} ⇄ ${firstName(steps[i].swap[steps[i].swap.length / 2])}`; plot();
    await sleep(delay); if (!alive()) return;
  }
  setPhase('✓ Gruplar hazır', 'Bitti');
  $('#iter').textContent = `${steps.length - 1} iyileştirme adımı · ${Math.round(steps[0].score)} → ${Math.round(steps[steps.length - 1].score)}`;
  await sleep(1300); if (!alive()) return;
  a.groups = steps[steps.length - 1].groups; a.baseline = bl; a.status = 'review';
  log(`${a.course}: ${a.groups.length} grup oluşturuldu (skor ${Math.round(steps[0].score)}→${Math.round(steps[steps.length - 1].score)})`);
  save(); S.ui = {}; render();
  toast('Gruplar oluşturuldu', `Denge skoru ${Math.round(steps[0].score)} → ${Math.round(steps[steps.length - 1].score)}`, 'teal', '🧠'); ding();
}

/* ---------- simülasyon ---------- */
const CHAT_WEEK = [
  'LTspice simülasyonu tamam, sensör çıkışı 0–3.3 V aralığında 👍',
  'STM32\'de ADC okuması çalışıyor ama gürültü biraz fazla, MATLAB\'da filtreleyelim mi? 🤔',
  'KiCad\'de PCB\'nin ilk çizimi bitti, Gerber dosyalarını klasöre koydum.',
  'Osiloskop ölçümlerini aldım, rapora ekliyorum.',
];
function weekForward() {
  S.week++;
  const r = rng(S.week * 977);
  S.assignments.filter(a => a.status === 'published').forEach(a => {
    a.groups.forEach((g, gi) => {
      const ts = a.tasks[gi];
      const mine = gi === myGroupIdx(a);
      g.forEach(m => {
        if (m === 'me') return;
        if (a.lazy[gi] === m && !a.reminded[gi]) return;
        let steps = 1 + (r() < 0.5 ? 1 : 0) + (a.lazy[gi] === m ? 1 : 0);
        while (steps-- > 0) {
          const t = ts.filter(x => x.who === m && x.col < 2).sort((x, y) => y.col - x.col)[0];
          if (!t) break; t.col++;
        }
      });
      if (!mine) ts.filter(t => !t.who).forEach(t => { t.who = g[Math.floor(r() * g.length)]; });
      if (mine && a.course === MAIN) {
        const talk = g.filter(m => m !== 'me' && !(a.lazy[gi] === m && !a.reminded[gi]));
        if (talk.length) { const who = talk[Math.floor(r() * talk.length)]; a.chat.push({ who, text: CHAT_WEEK[(S.week - 1) % CHAT_WEEK.length] }); }
        if (a.lazy[gi] && a.reminded[gi] && !a.lazyReplied) { a.chat.push({ who: a.lazy[gi], text: 'Kusura bakmayın, bu hafta yoğundum. Görevimi bu hafta tamamlıyorum 🙏' }); a.lazyReplied = true; }
      }
    });
  });
  log(`Hafta ${S.week}: ekipler görevlerde ilerledi`);
  const a = S.assignments.find(x => x.course === MAIN && x.status === 'published');
  if (a) {
    const risks = riskList(a).filter(x => x.level !== 'ok');
    if (risks.length) notify('instructor', `${risks.length} grupta dikkat gereken durum`, `Hafta ${S.week} izleme raporu hazır`, '📈', `tb/odev/${a.id}/izleme`);
    notify('student', 'Grup panon güncellendi', `Hafta ${S.week}: ekip arkadaşların görevlerde ilerledi`, '📋', `tb/odev/${a.id}`);
  }
  save(); render();
}

/* ---------- modaller ---------- */
function modal(html) { $('#modal').innerHTML = `<div class="modal-bg" data-act="modal-bg"><div class="modal">${html}</div></div>`; }
function closeModal() { $('#modal').innerHTML = ''; }
function peerModal(a) {
  const gi = myGroupIdx(a); const others = a.groups[gi].filter(m => m !== 'me');
  S.ui.peer = S.ui.peer || {};
  modal(`<h2 style="margin:0 0 4px">Teslim ve akran değerlendirmesi</h2><p class="muted small" style="margin-top:0">Değerlendirmen <b>anonimdir</b>. Ekip arkadaşların kimin ne verdiğini göremez; öğretim üyesi yalnızca ortalamayı görür.</p>
    ${others.map(m => `<div class="list-item" style="padding:10px">${av(m)}<div class="li-main"><b>${esc(getS(m).name)}</b><span class="small muted">Katkısını nasıl değerlendirirsin?</span></div><span class="stars" data-m="${m}">${[1, 2, 3, 4, 5].map(v => `<button class="${(S.ui.peer[m] || 0) >= v ? 'on' : ''}" data-act="star" data-m="${m}" data-v="${v}" aria-label="${v} yıldız">★</button>`).join('')}</span></div>`).join('')}
    <div class="field" style="margin-top:12px"><label>Not (isteğe bağlı)</label><textarea class="input" rows="2" placeholder="Ekip çalışması hakkında kısa bir not…"></textarea></div>
    <div class="row"><span class="sp"></span><button class="btn" data-act="close">Vazgeç</button><button class="btn primary" data-act="do-submit" data-id="${a.id}">📤 Teslim et</button></div>`);
}

/* ---------- olaylar ---------- */
const A = {
  login(el) { S.role = el.dataset.r; save(); go('home'); },
  logout() { S.role = null; save(); go('login'); },
  role(el) { if (S.role === el.dataset.r) return; S.role = el.dataset.r; save(); go('tb'); },
  nav(el) { go(el.dataset.to); },
  menu() { $('#side').classList.toggle('open'); },
  umenu() { S.ui.umenu = !S.ui.umenu; S.ui.bell = false; render(); },
  'info-x'() { S.ui.infoX = true; render(); },
  bell() { S.ui.umenu = false; S.ui.bell = !S.ui.bell; if (!S.ui.bell) S.notes.forEach(n => { if (n.role === S.role) n.read = true; }); save(); render(); },
  note(el) { const n = S.notes.filter(x => x.role === S.role)[+el.dataset.i]; S.notes.forEach(x => { if (x.role === S.role) x.read = true; }); S.ui.bell = false; save(); if (n && n.link) go(n.link); else render(); },
  perm() { try { if ('Notification' in window) Notification.requestPermission().then(p => toast(p === 'granted' ? 'Tarayıcı bildirimleri açık' : 'Bildirim izni verilmedi', '', '', '🔔')); } catch (e) { } },
  'demo-toggle'() { S.demoOpen = !S.demoOpen; save(); render(); },
  reset() { const role = S.role; S = freshState(); S.role = role; save(); toast('Demo verileri sıfırlandı', '', '', '↺'); go('tb'); },
  week() { weekForward(); },
  skill(el) { S.me.skills[el.dataset.sk] = +el.dataset.v; save(); render(); },
  slot(el) { const k = +el.dataset.k; const i = S.me.avail.indexOf(k); if (i >= 0) S.me.avail.splice(i, 1); else S.me.avail.push(k); save(); render(); },
  autofill() { S.me.avail = autoAvail(); save(); render(); toast('Boş saatler dolduruldu', 'Ders programındaki boşluklar seçildi; dilediğin gibi düzenleyebilirsin.', '', '⚡'); },
  'save-profile'() {
    if (!S.me.avail.length) { toast('En az bir boş saat seç', '', '', '⚠️'); return; }
    S.me.profileDone = true; log('Deniz profilini güncelledi'); save();
    toast('Profilin kaydedildi', 'Grup kurulurken ve eşleşmelerde kullanılacak.', 'teal', '✅'); go('tb');
  },
  'buddy-course'(el) { S.buddy.course = el.dataset.c; save(); render(); },
  'buddy-req'(el) {
    const id = el.dataset.id; S.buddy.req[id] = 'wait'; save(); render();
    setTimeout(() => { S.buddy.req[id] = 'ok'; log(`${getS(id).name} çalışma isteğini kabul etti`); save(); render(); notify('student', `${getS(id).name} isteğini kabul etti 🎉`, `${S.buddy.course} için çalışma arkadaşı oldunuz`, '🤝'); }, 1800);
  },
  'form-method'(el) { S.form.method = el.dataset.m; save(); render(); },
  'form-req'(el) { const k = el.dataset.sk; const i = S.form.req.indexOf(k); if (i >= 0) { if (S.form.req.length > 1) S.form.req.splice(i, 1); } else S.form.req.push(k); save(); render(); },
  create() {
    const f = S.form; if (!f.title.trim()) { toast('Başlık gerekli', '', '', '⚠️'); return; }
    S.assignments = S.assignments.filter(a => a.course !== MAIN);
    const a = { id: 'a1', course: MAIN, title: f.title.trim(), size: +f.size, due: f.due, method: f.method === 'rastgele' ? 'rastgele' : 'akilli', req: f.req.slice(), weight: +f.weight, status: 'draft', groups: null, tasks: [], lazy: {}, reminded: {}, submitted: {}, peer: {}, chat: [], reseed: 0 };
    S.assignments.push(a); S.form = null; log(`Yeni ödev: ${a.title}`); save();
    notify('student', 'EEE 3401: Yeni grup ödevi', `${a.title} · ${a.size} kişilik gruplar kurulacak`, '📁', 'tb/odev/a1');
    go('tb/odev/a1');
  },
  optimize(el) { const a = S.assignments.find(x => x.id === el.dataset.id); runOptimizer(a); },
  reopt(el) { const a = S.assignments.find(x => x.id === el.dataset.id); a.status = 'draft'; a.reseed = (a.reseed || 0) + 1; save(); runOptimizer(a); },
  publish(el) {
    const a = S.assignments.find(x => x.id === el.dataset.id);
    a.status = 'published'; a.tasks = []; a.lazy = {};
    const mg = myGroupIdx(a);
    a.groups.forEach((g, gi) => {
      const ts = TASK_TEMPLATE.map((t, i) => ({ ...t, id: `g${gi}t${i}`, who: null, col: 0 }));
      if (gi !== mg) distribute(ts, g);
      a.tasks.push(ts);
    });
    { const pr = mutualPairs(); a.lazy[mg] = a.groups[mg].filter(m => m !== 'me' && m !== pr.me).slice(-1)[0]; }
    const og = (mg + 2) % a.groups.length; if (og !== mg) a.lazy[og] = a.groups[og][1];
    const st = groupStats(a.groups[mg], a.req);
    a.chat = [{ sys: true, text: `Grup ${mg + 1} kuruldu · ${st.common.length} ortak boş saat` }];
    log(`${a.course}: gruplar yayınlandı`); save();
    toast('Gruplar yayınlandı', '24 öğrenciye bildirim gönderildi', 'teal', '📣'); ding();
    notify('student', 'Grubun hazır! 🎉', `EEE 3401 · ${a.groups[mg].length} kişilik ekibin ve ${st.common.length} ortak boş saatiniz var`, '🤝', 'tb/odev/a1');
    render();
  },
  distribute(el) {
    const a = S.assignments.find(x => x.id === el.dataset.id); const gi = myGroupIdx(a);
    const board = $('#board');
    flip(board, () => { distribute(a.tasks[gi], a.groups[gi]); board.innerHTML = kanban(a, gi); });
    a.chat.push({ sys: true, text: 'Görevler becerilere göre dağıtıldı' });
    log('Deniz görevleri becerilere göre dağıttı'); save();
    toast('Görevler dağıtıldı', 'Herkese becerisine uygun ve dengeli iş yükü verildi.', 'teal', '✨');
    setTimeout(() => render(), 900);
  },
  mv(el) {
    const a = S.assignments.find(x => x.id === el.dataset.id); const gi = myGroupIdx(a);
    const t = a.tasks[gi].find(x => x.id === el.dataset.t); t.col = Math.max(0, Math.min(2, t.col + +el.dataset.d));
    const board = $('#board');
    flip(board, () => { board.innerHTML = kanban(a, gi); });
    if (t.col === 2) { a.chat.push({ sys: true, text: `Deniz “${t.t}” görevini tamamladı ✅` }); log(`Deniz bitirdi: ${t.t}`); }
    save(); setTimeout(() => render(), 600);
  },
  'add-task'(el) {
    const a = S.assignments.find(x => x.id === el.dataset.id);
    modal(`<h2 style="margin-top:0">Yeni görev</h2><form data-form="task" data-id="${a.id}"><div class="field"><label>Görev</label><input class="input" name="t" required placeholder="Örn. Kullanıcı girişi ekranı"></div>
      <div class="grid g2" style="gap:12px"><div class="field"><label>Beceri</label><select class="input" name="s">${SKILLS.map(k => `<option value="${k.id}">${k.i} ${k.n}</option>`).join('')}</select></div><div class="field"><label>İş puanı</label><select class="input" name="p"><option>1</option><option selected>2</option><option>3</option></select></div></div>
      <div class="row"><span class="sp"></span><button type="button" class="btn" data-act="close">Vazgeç</button><button class="btn primary">Ekle</button></div></form>`);
    setTimeout(() => { const i = $('#modal input'); if (i) i.focus(); }, 50);
  },
  ics(el) {
    const k = +el.dataset.k; const a = S.assignments.find(x => x.id === el.dataset.id);
    const d = Math.floor(k / 5); const base = new Date('2026-10-19T00:00:00'); base.setDate(base.getDate() + d);
    const [hh, mm] = SLOTS[k % 5].split(':'); const p = n => String(n).padStart(2, '0');
    const ds = `${base.getFullYear()}${p(base.getMonth() + 1)}${p(base.getDate())}`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TakimBul Demo//TR', 'BEGIN:VEVENT', `UID:${Date.now()}@takimbul-demo`, `DTSTART:${ds}T${hh}${mm}00`, `DTEND:${ds}T${p(+hh + 1)}${p(+mm + 50 >= 60 ? +mm - 10 : +mm + 50)}00`, `SUMMARY:${a.course} grup buluşması`, 'LOCATION:Yaşar Üniversitesi · Elektronik Laboratuvarı 2', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const l = document.createElement('a'); l.href = url; l.download = 'grup-bulusmasi.ics'; document.body.appendChild(l); l.click(); l.remove();
    toast('Takvim dosyası indirildi', 'Google veya Outlook takvimine ekleyebilirsin.', '', '📅');
  },
  submit(el) { S.ui.peer = {}; S.ui.peerA = el.dataset.id; peerModal(S.assignments.find(x => x.id === el.dataset.id)); },
  star(el) { const v = +el.dataset.v; S.ui.peer[el.dataset.m] = v; el.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.v <= v)); },
  'do-submit'(el) {
    const a = S.assignments.find(x => x.id === el.dataset.id); const gi = myGroupIdx(a);
    const others = a.groups[gi].filter(m => m !== 'me');
    if (others.some(m => !S.ui.peer[m])) { toast('Her ekip arkadaşını değerlendir', 'Yıldızlara tıklayarak puan ver.', '', '⭐'); return; }
    a.peer[gi] = {};
    others.forEach((m, i) => { const r = rng(i + 5); const sim = a.lazy[gi] === m ? [2, 3] : [4 + Math.round(r()), 5]; a.peer[gi][m] = [S.ui.peer[m], ...sim]; });
    a.peer[gi].me = [5, 4, 5];
    a.submitted[gi] = true; closeModal(); log(`Grup ${gi + 1} ödevi teslim etti`); save();
    toast('Ödev teslim edildi', 'Değerlendirmen anonim olarak kaydedildi.', 'teal', '✅'); ding();
    notify('instructor', `Grup ${gi + 1} teslim etti`, 'Katkı raporu güncellendi', '⚖️', `tb/odev/${a.id}/rapor`);
    render();
  },
  remind(el) {
    const a = S.assignments.find(x => x.id === el.dataset.id); const gi = +el.dataset.g;
    a.reminded[gi] = true; log(`Hoca Grup ${gi + 1}'e hatırlatma gönderdi`); save();
    toast(`Grup ${gi + 1}'e hatırlatma gönderildi`, 'Üyelere bildirim ve e-posta iletildi.', 'teal', '🔔'); ding();
    if (gi === myGroupIdx(a)) notify('student', 'Öğretim üyesinden hatırlatma', `Grup ${gi + 1}: lütfen görev dağılımını ve ilerlemeyi güncelleyin`, '👩‍🏫', `tb/odev/${a.id}`);
    render();
  },
  pick(el) {
    const a = S.assignments.find(x => x.course === MAIN && x.status === 'review'); if (!a) return;
    const id = el.dataset.id; const p = S.ui.pick;
    if (!p) { S.ui.pick = id; render(); return; }
    S.ui.pick = null;
    const gi = a.groups.findIndex(g => g.includes(p)), gj = a.groups.findIndex(g => g.includes(id));
    if (p === id || gi === gj) { render(); return; }
    const w = a.weight / 100; const before = partitionScore(a.groups, a.req, w);
    const pair = mutualPairs(); const broke = (pair[p] && a.groups[gi].includes(pair[p])) || (pair[id] && a.groups[gj].includes(pair[id]));
    a.groups[gi][a.groups[gi].indexOf(p)] = id; a.groups[gj][a.groups[gj].indexOf(id)] = p;
    const after = partitionScore(a.groups, a.req, w); a.manual = (a.manual || 0) + 1;
    log(`Elle takas: ${getS(p).name} ⇄ ${getS(id).name}`); save();
    const box = document.querySelector('.groups');
    if (box) flip(box, () => { box.innerHTML = a.groups.map((g, k) => groupCol(g, k, a, false, true)).join(''); });
    toast(`${firstName(p)} ⇄ ${firstName(id)}`, `Denge skoru ${Math.round(before)} → ${Math.round(after)}${broke ? ' · ⚠️ karşılıklı tercih bozuldu' : ''}`, '', '✋');
    setTimeout(() => render(), 650);
  },
  close() { closeModal(); },
  'modal-bg'(el, e) { if (e.target === el) closeModal(); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) { if (S.ui && (S.ui.bell || S.ui.umenu) && !e.target.closest('.drop,.udrop')) { S.ui.bell = false; S.ui.umenu = false; render(); } return; }
  const fn = A[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
});
function setPath(path, val) { const p = path.split('.'); let o = S; while (p.length > 1) o = o[p.shift()]; o[p[0]] = val; }
document.addEventListener('input', e => {
  const el = e.target.closest('[data-bind]'); if (!el) return;
  setPath(el.dataset.bind, el.dataset.num ? +el.value : el.value); save();
  if (el.dataset.live) { const l = $('#wlabel'); if (l) l.textContent = `Beceri dengesi %${el.value} · Ortak zaman %${100 - el.value}`; }
});
document.addEventListener('change', e => { const el = e.target.closest('select[data-bind]'); if (el) { setPath(el.dataset.bind, el.dataset.num ? +el.value : el.value); save(); render(); } });
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
  const a = S.assignments.find(x => x.id === f.dataset.id);
  if (f.dataset.form === 'chat') {
    const v = f.m.value.trim(); if (!v) return;
    a.chat.push({ who: 'me', text: v }); save(); render();
    const gi = myGroupIdx(a); const mates = a.groups[gi].filter(m => m !== 'me' && !(a.lazy[gi] === m && !a.reminded[gi]));
    const low = v.toLocaleLowerCase('tr-TR');
    const reply = /buluş|toplan|görüş|lab/.test(low) ? 'Bana uyar 👍 Lab 2\'de lehim istasyonu da boş olur, PCB\'yi orada deneriz.' : /görev|pano|dağıt/.test(low) ? 'Panodan kendi görevimi gördüm, bu akşam başlıyorum 💪' : /merhaba|selam/.test(low) ? 'Selam! Ekip olarak güzel bir dağılım olmuş 😊' : 'Tamamdır, katılıyorum 👌';
    const who = mates[Math.floor(Math.random() * mates.length)];
    if (who) setTimeout(() => { a.chat.push({ who, text: reply }); save(); if (location.hash.includes('odev/' + a.id)) { render(); } ding(); }, 1500);
  }
  if (f.dataset.form === 'task') {
    const gi = myGroupIdx(a); const t = f.t.value.trim(); if (!t) return;
    a.tasks[gi].push({ id: 'u' + Date.now(), t, skill: f.s.value, pts: +f.p.value, who: null, col: 0 });
    closeModal(); save(); render(); toast('Görev eklendi', '“Görevleri dağıt” ile otomatik atayabilirsin.', '', '📌');
  }
});

/* ---------- render ---------- */
function render() {
  S.ui = S.ui || {};
  const r = route();
  const app = $('#app');
  if (!S.role || r[0] === 'login' || !r.length) {
    if (S.role && !r.length) { location.replace('#/home'); return render(); }
    app.innerHTML = pLogin(); return;
  }
  let body;
  if (r[0] === 'home') body = pHome();
  else if (r[0] === 'x') body = pPlaceholder(r[1]);
  else if (r[0] === 'tb') {
    if (S.role === 'student') {
      if (r[1] === 'profil') body = pProfile();
      else if (r[1] === 'arkadas') body = pBuddy();
      else if (r[1] === 'odev') { const a = S.assignments.find(x => x.id === r[2]); body = a ? pStuAssignment(a) : pStuTB(); }
      else body = pStuTB();
    } else {
      if (r[1] === 'yeni') body = pNew();
      else if (r[1] === 'odev') { const a = S.assignments.find(x => x.id === r[2] && x.course === MAIN); body = a ? pInsAssignment(a, r[3] || 'gruplar') : pInsTB(); }
      else body = pInsTB();
    }
  } else body = pHome();
  const msgs = $('#msgs'); const atBottom = !msgs || msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 40;
  app.innerHTML = `<div class="app2">${topbar()}<div class="obody">${sidebar(r)}<div class="main"><main class="content">${body}<div class="footer-note">TakımBul · Ders projesi prototipi — gerçek OBS'ye bağlı değildir, tüm veriler örnektir · Yaşar Üniversitesi'nin resmi sistemi değildir.</div></main></div></div></div>${demoPanel()}<div class="otimer" id="otimer">${icon('clock')}<b style="font-weight:600">${timerText()}</b></div>`;
  const m2 = $('#msgs'); if (m2 && atBottom) m2.scrollTop = m2.scrollHeight;
}

load();
S.ui = {};
render();
