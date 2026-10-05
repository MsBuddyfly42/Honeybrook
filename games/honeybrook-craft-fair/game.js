/* Honeybrook Craft Fair — Wally's Bakery + Fishing Pond (v1) */
(() => {
'use strict';
const W = 1500, H = 1000;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------------------------------------------ */
/* Layout: fixed 3:2 stage scaled to the window                        */
/* ------------------------------------------------------------------ */
const stage = $('#stage');
function fit() {
  const w = Math.min(innerWidth, innerHeight * 1.5);
  const h = w / 1.5;
  stage.style.setProperty('--sw', w + 'px');
  stage.style.setProperty('--sh', h + 'px');
  stage.style.setProperty('--fs', Math.max(10, w / 72) + 'px');
  for (const c of $$('canvas')) {
    if (c.closest('.prize')) continue;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  }
}
addEventListener('resize', fit); fit();
function ctxOf(c) { const x = c.getContext('2d'); x.setTransform(c.width / W, 0, 0, c.height / H, 0, 0); return x; }
function toLogical(e, c) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }

/* ------------------------------------------------------------------ */
/* Audio: gentle procedural music + sound effects + ambience           */
/* ------------------------------------------------------------------ */
const Snd = {
  ctx: null, master: null, musicGain: null, sfxGain: null, ambGain: null, on: true,
  rainNode: null, nextNote: 0, step: 0, timer: null, mood: 'village',
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.16; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.5; this.sfxGain.connect(this.master);
    this.ambGain = this.ctx.createGain(); this.ambGain.gain.value = 0.0; this.ambGain.connect(this.master);
    // rain noise
    const len = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    src.connect(lp).connect(this.ambGain); src.start();
    this.nextNote = this.ctx.currentTime + 0.2;
    this.timer = setInterval(() => this.schedule(), 90);
    setInterval(() => this.critters(), 1000);
  },
  toggle() { this.on = !this.on; if (this.master) this.master.gain.setTargetAtTime(this.on ? 0.9 : 0, this.ctx.currentTime, 0.05); return this.on; },
  tone(f, t, dur, type = 'triangle', vol = 0.3, dest) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest || this.sfxGain); o.start(t); o.stop(t + dur + 0.05);
    return o;
  },
  // music: F major folk lilt
  schedule() {
    if (!this.ctx) return;
    const c = this.ctx, evening = S.slot === 2;
    const bpm = this.mood === 'pond' ? 72 : evening ? 70 : 88, eighth = 60 / bpm / 2;
    const prog = [[53, 57, 60], [58, 62, 65], [60, 64, 67], [53, 57, 60], [50, 53, 57], [58, 62, 65], [60, 64, 67], [53, 57, 60]];
    const scale = [65, 67, 69, 72, 74, 77, 79, 81];
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    while (this.nextNote < c.currentTime + 0.3) {
      const t = this.nextNote, bar = Math.floor(this.step / 8) % prog.length, beat = this.step % 8, ch = prog[bar];
      if (beat === 0) { ch.forEach(n => this.tone(mtof(n), t, eighth * 7.5, 'sine', 0.05, this.musicGain)); this.tone(mtof(ch[0] - 12), t, eighth * 3, 'triangle', 0.22, this.musicGain); }
      if (beat === 4) this.tone(mtof(ch[2] - 12), t, eighth * 3, 'triangle', 0.16, this.musicGain);
      const density = this.mood === 'pond' ? 0.32 : evening ? 0.38 : 0.55;
      if (Math.random() < density) {
        this.mel = clamp((this.mel ?? 3) + pick([-2, -1, -1, 0, 1, 1, 2]), 0, scale.length - 1);
        let n = scale[this.mel]; if (beat === 0 && !ch.some(x => (x - n) % 12 === 0)) n = ch[2] + 12;
        this.tone(mtof(n), t, eighth * 1.8, 'triangle', 0.13, this.musicGain);
      }
      this.nextNote += eighth; this.step++;
    }
  },
  ambience() {
    if (!this.ctx) return;
    const outdoor = S.scene === 'village' || S.scene === 'town' || S.scene === 'carnival' || S.scene === 'pond' || S.scene === 'garden' || (S.scene === 'work' && S.wsPlace === 'hollow') || (S.scene === 'area' && S.area !== 'room');
    const target = outdoor && S.weather === 'Rainy' ? 0.07 : 0;
    this.ambGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.6);
  },
  critters() {
    if (!this.ctx || !this.on) return;
    const outdoor = S.scene === 'village' || S.scene === 'town' || S.scene === 'pond' || S.scene === 'garden' || (S.scene === 'work' && S.wsPlace === 'hollow') || (S.scene === 'area' && S.area !== 'room'); if (!outdoor) return;
    const t = this.ctx.currentTime;
    if (S.slot < 2 && S.weather !== 'Rainy' && Math.random() < 0.18) { // bird chirp
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) { const o = this.tone(2600, t + i * 0.12, 0.09, 'sine', 0.05); o.frequency.exponentialRampToValueAtTime(3900, t + i * 0.12 + 0.08); }
    }
    if (S.slot === 2 && Math.random() < 0.5) { for (let i = 0; i < 4; i++) this.tone(4300, t + i * 0.06, 0.03, 'square', 0.012); }
  },
  sfx(name) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    const T = (f, d, ty, v, dt = 0) => this.tone(f, t + dt, d, ty, v);
    switch (name) {
      case 'click': T(660, 0.06, 'triangle', 0.2); break;
      case 'coin': T(988, 0.08, 'square', 0.12); T(1319, 0.25, 'square', 0.12, 0.07); break;
      case 'good': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.25, 'triangle', 0.22, i * 0.09)); break;
      case 'meh': T(392, 0.2, 'triangle', 0.2); T(349, 0.3, 'triangle', 0.2, 0.15); break;
      case 'bad': T(330, 0.25, 'sawtooth', 0.08); T(247, 0.4, 'sawtooth', 0.08, 0.2); break;
      case 'bite': T(880, 0.1, 'square', 0.15); T(1175, 0.15, 'square', 0.15, 0.08); break;
      case 'fanfare': [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => T(f, 0.3, 'triangle', 0.25, i * 0.13)); break;
      case 'ding': T(1568, 0.6, 'sine', 0.15); break;
      case 'splash': case 'pour': {
        const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuf;
        const f = this.ctx.createBiquadFilter(); f.type = name === 'splash' ? 'lowpass' : 'bandpass'; f.frequency.value = name === 'splash' ? 900 : 2200;
        const g = this.ctx.createGain(); const d = name === 'splash' ? 0.5 : 0.18;
        g.gain.setValueAtTime(name === 'splash' ? 0.5 : 0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
        src.connect(f).connect(g).connect(this.sfxGain); src.start(t, Math.random()); src.stop(t + d); break;
      }
    }
  }
};

/* ------------------------------------------------------------------ */
/* Game data                                                          */
/* ------------------------------------------------------------------ */
const SLOTS = ['Morning', 'Afternoon', 'Evening'];
const FAIR_DAY = 7;
const FOLKS = [
  { name: 'Big Mama Mary', fur: '#7a5236', top: '#8e3b5a', hat: '#e7c66a', lines: [
    'Baby, the secret to good cookies is patience. And butter. Mostly butter.',
    'Sit with me a minute and I\'ll tell you a story. Fill some orders and I\'ll tell you the next one.',
    'Don\'t you rush those cookies out of the oven. Golden, not pale.', 'Water that garden every day, baby. Plants are like people. They need tending.'] },
  { name: 'Buddy', fur: '#5a3b25', top: '#4d6b40', cap: '#2f4a5e', lines: [
    'Served this country a long time. Now my toughest mission is the catfish in that pond.',
    'Evenings and rainy days, that\'s when the catfish bite. Don\'t tell anybody I said so.',
    'Keep your line tight and your patience tighter.'] },
  { name: 'Jonesha', fur: '#8a5a35', top: '#c8862a', lines: ['I entered the fair last year. This year I want that blue ribbon.', 'Have you seen the castle on the hill? I heard there\'s a ball this winter.'] },
  { name: "Ja'Mya", fur: '#6e4528', top: '#a8344a', lines: ['The Sewing Cottage finally opened. I already picked my fabric.', 'If somebody needs a hand, I\'m already on my way.'] },
  { name: 'Jamon', fur: '#5c3a22', top: '#2f6b8a', cap: '#a8344a', lines: ['Morning is trout time. They like that cool water.', 'I bet I can eat a dozen of your cookies. Try me.'] },
  { name: 'Robin', fur: '#94603a', top: '#7d5ba6', lines: ['Somebody keeps losing teddy bears by the pond. Keep an eye out.', 'The Painter\'s Studio smells like fresh paint. Go hang something in that gallery.'] },
  { name: 'Rheanna', fur: '#7b4c2c', top: '#d0677a', lines: ['If you throw a coin in the fountain, sometimes the weather listens.', 'I\'ve got three questions about Bear Hollow. Okay, maybe four.'] },
  { name: 'Lena', fur: '#a06a3e', top: '#5c8f8a', lines: ['I\'d love a baby blanket from the Yarn Shop. Blue, please.', 'Your honey cookies are the talk of the village.'] },
  { name: 'Lance', fur: '#6a4429', top: '#b0602c', lines: ['Bass love to hide way out in the deep water. Cast far.', 'I\'m saving up coins for something special at the fair.'] },
  { name: 'Landis', fur: '#5f3b22', top: '#3f5f9e', cap: '#c8862a', lines: ['I heard there\'s a golden carp in that pond. Legend says it grants wishes.', 'Have you been up the old creek road to Bear Hollow? Their hives hum like a song.'] },
  { name: 'Landric', fur: '#a5703f', top: '#8a9b3c', cub: true, lines: ['Old boots, lost teddies... that pond has everything in it.', 'When the cookie crumbles, you just bake another batch.'] },
  { name: 'Amelia', fur: '#b98a55', top: '#5f8f6e', lines: ['If you need a place, we\'ll make one. That goes for you too.', 'Tom and I only meant to fix a bridge. Look what grew out of it.', 'Some folks need one night. Some need to stay. Both are welcome here.'] },
  { name: 'Tom Bridgewell', fur: '#6b4a2e', top: '#7a5a3a', lines: ['I fix whatever needs fixing. Mind the tools in the Craft Barn. They\'re sharp.', 'That bridge has held for years. Good work holds when it\'s done with care.'] },
  { name: 'Sammy', fur: '#9a6b3f', top: '#8a7a5a', cub: true, patch: true, lines: ['You can eat first.', 'Wally saves the honey buns for whoever looks hungriest. Usually me.'] },
  { name: 'Wally', fur: '#c79a62', top: '#c95a6e', apron: true, lines: ['Take a loaf home for yourself, too. Amelia makes me say that.', 'My oven\'s yours whenever you need it. Bake something good.'] },
  { name: 'Professor Honeywell', fur: '#8a6a4a', top: '#3f4f6e', glasses: true, lines: ['I came to teach this town. It ended up teaching me.', 'Learning has more than one doorway. Some of them smell like cookies.'] },
  { name: 'Harold Pawst', fur: '#9a9088', top: '#3b5a8a', cap: '#2c3e63', satchel: true, lines: ['I DELIVER MAIL. I DO NOT DELIVER MESSAGES.', 'Your orders are in my satchel. What they say is none of my business.', 'Rain, dust, or snow, the mail goes through.'] },
  { name: 'Carmen', human: true, after: 11, skin: '#e2b48c', hair: '#c8a050', top: '#a8344a', lines: ['Harold told me everything he knew. I\'m staying.', 'My family told this story as a ghost story. It turns out it was mine.', 'Tell them what you know. That\'s how a story comes back to life.'] },
];
const present = f => !f.after || storyUnlocked() > f.after;
const RECIPES = [
  { id: 'sugar', name: 'Sugar Cookies', note: 'A classic. Good for learning.', dough: '#f3dfb5', ing: [['Flour', 0.75, '#f6f1e7', 0.32], ['Sugar', 0.5, '#fffdf6', 0.38], ['Butter', 0.5, '#f2d074', 0.3], ['Vanilla', 0.25, '#6b3b17', 0.45]] },
  { id: 'choc', name: 'Chocolate Chip', note: 'Everybody\'s favorite.', dough: '#e9c690', chips: '#3b2416', ing: [['Flour', 0.67, '#f6f1e7', 0.32], ['Brown Sugar', 0.5, '#b57a3c', 0.36], ['Butter', 0.5, '#f2d074', 0.3], ['Chocolate Chips', 0.75, '#3b2416', 0.42]] },
  { id: 'oat', name: 'Oatmeal Raisin', note: 'Hearty and old-fashioned.', dough: '#d9b47c', chips: '#4a2333', ing: [['Oats', 0.75, '#d8c08e', 0.36], ['Brown Sugar', 0.33, '#b57a3c', 0.36], ['Raisins', 0.5, '#4a2333', 0.42], ['Cinnamon', 0.25, '#8a4b20', 0.5]] },
  { id: 'snick', name: 'Snickerdoodles', note: 'Rolled in cinnamon sugar.', dough: '#efd29f', ing: [['Flour', 0.67, '#f6f1e7', 0.32], ['Sugar', 0.75, '#fffdf6', 0.38], ['Butter', 0.33, '#f2d074', 0.3], ['Cinnamon Sugar', 0.25, '#b9773b', 0.5]] },
  { id: 'honey', name: 'Honeybrook Honey Cookies', note: 'Village specialty. Honey pours slow, then keeps dripping.', dough: '#e8b960', special: true, ing: [['Flour', 0.75, '#f6f1e7', 0.32], ['Honey', 0.5, '#d9921f', 0.2, 0.09], ['Butter', 0.33, '#f2d074', 0.3], ['Ginger', 0.25, '#c99a52', 0.5]] },
];
const FRAC = { 0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾' };
const FISH = [
  { id: 'bluegill', name: 'Bluegill', min: 0.3, max: 1.2, diff: 0.7, col: ['#5a7d8f', '#e0a04a'], fact: 'Bluegill are a kind of sunfish, named for the dark blue patch on their gill cover.' },
  { id: 'crappie', name: 'Crappie', min: 0.4, max: 2.0, diff: 0.9, col: ['#8a9a8c', '#3d4d44'], fact: 'Crappie like to gather in schools around sunken trees and brush.' },
  { id: 'trout', name: 'Rainbow Trout', min: 0.8, max: 4.5, diff: 1.15, col: ['#7c9c86', '#d77a8a'], fact: 'Rainbow trout love cool, clear water and are often most active early in the morning.' },
  { id: 'bass', name: 'Largemouth Bass', min: 1.2, max: 8.0, diff: 1.2, col: ['#5e7a3a', '#2f3f1f'], fact: 'A largemouth bass\'s upper jaw stretches past its eye. That\'s how it got its name.' },
  { id: 'catfish', name: 'Channel Catfish', min: 2.0, max: 14.0, diff: 1.3, col: ['#6d6a5f', '#3c3a33'], fact: 'Catfish "whiskers" are called barbels. They help the fish taste and smell in murky water.' },
  { id: 'golden', name: 'Golden Carp', min: 4.0, max: 9.0, diff: 1.55, col: ['#f0b52e', '#c27a10'], rare: true, fact: 'Honeybrook legend says the Golden Carp grants a wish to anyone kind enough to let it go.' },
  { id: 'teddy', name: 'Soggy Teddy Bear', junk: true, fact: 'Someone in Honeybrook is going to be very happy to have this little fellow back.' },
  { id: 'boot', name: 'Old Boot', junk: true, fact: 'Somewhere in Honeybrook, someone is walking around in one boot.' },
];
const UPGRADES = [
  { id: 'rod', name: 'Sturdy Oak Rod', cost: 45, desc: 'A bigger catch zone when reeling.' },
  { id: 'spoon', name: 'Golden Mixing Spoon', cost: 35, desc: 'Every stir counts for more.' },
  { id: 'thermo', name: 'Oven Thermometer', cost: 40, desc: 'Shows the golden zone while baking.' },
  { id: 'lure', name: 'Lucky Feather Lure', cost: 60, desc: 'Better odds of big and rare fish.' },
  { id: 'teddy', name: 'Fountain Teddy Bear', cost: 25, desc: 'A sweet bear to sit by the fountain. Just because.' },
];

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */
const S = {
  name: 'Friend', day: 1, slot: 0, weather: 'Sunny', season: 1,
  coins: 20, ribbons: 0, basket: [], orders: [], owned: {}, delivered: 0, carnivalTickets: 0, carnivalTreats: [],
  best: {}, gallery: [], garden: Array.from({ length: 6 }, () => ({ crop: null })), scene: 'title', usedSlot: false,
  storyPts: 0, glow: 20, woodsOpen: false, woodsCall: false,
};
function rollWeather() { const r = Math.random(); return r < 0.5 ? 'Sunny' : r < 0.78 ? 'Cloudy' : 'Rainy'; }

/* ------------------------------------------------------------------ */
/* UI helpers                                                         */
/* ------------------------------------------------------------------ */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800); }
function modal(html, actions = [{ label: 'OK', primary: true }]) {
  return new Promise(res => {
    $('#modal-body').innerHTML = html;
    const box = $('#modal-actions'); box.innerHTML = '';
    actions.forEach((a, i) => {
      const b = document.createElement('button'); b.className = 'btn ' + (a.primary ? 'btn-primary' : a.sage ? 'btn-sage' : ''); b.textContent = a.label;
      if (a.disabled) b.disabled = true;
      b.onclick = () => { Snd.sfx('click'); closeModal(); res(a.value ?? i); };
      box.appendChild(b);
    });
    $('#modal').hidden = false; bindModalBody(res);
    setTimeout(() => (box.querySelector('.btn-primary') || box.querySelector('.btn'))?.focus(), 50);
  });
}
let modalBodyHandler = null;
function bindModalBody(res) { modalBodyHandler = res; }
function closeModal() { $('#modal').hidden = true; }
$('#modal-body').addEventListener('click', e => {
  const b = e.target.closest('[data-val]'); if (!b || b.disabled) return;
  Snd.sfx('click'); closeModal(); modalBodyHandler && modalBodyHandler(b.dataset.val);
});
function stars(n, of = 3) { let s = '<span class="stars" aria-label="' + n + ' of ' + of + ' stars">'; for (let i = 0; i < of; i++) s += i < n ? '★' : '<span class="off">★</span>'; return s + '</span>'; }
function avatar(f) { const ini = f.name.replace("Big Mama ", "").replace("Professor ", "").split(' ').map(w => w[0]).join('').slice(0, 2); return `<span class="avatar" style="background:${f.top}">${esc(ini)}</span>`; }
function folk(name) { return FOLKS.find(f => f.name === name); }

function updateHUD() {
  $('#hud-day').textContent = 'Day ' + S.day;
  $('#hud-time').textContent = SLOTS[S.slot];
  $('#hud-wx').textContent = S.weather;
  const left = FAIR_DAY - S.day;
  $('#hud-fair').textContent = left <= 0 ? 'Annual Fair Day' : left === 1 ? 'Annual Fair tomorrow' : `Annual Fair in ${left} days`;
  $('#hud-coins').textContent = S.coins;
  $('#hud-ribbons').textContent = S.ribbons;
  const ticketCount = $('#carnivalTickets'); if (ticketCount) ticketCount.textContent = S.carnivalTickets || 0;
  const ready = S.orders.filter(o => findItemFor(o)).length;
  $('#orders-badge').textContent = ready ? ready : '';
  $('#btn-home').hidden = S.scene === 'village' || S.scene === 'title' || S.scene === 'home';
  $('#hud-toggle').hidden = $('#hud').hidden;
  $('#btn-town').hidden = S.scene !== 'village';
  $('#teddy').hidden = !S.owned.teddy;
  $('#hud-glow').textContent = (S.glow || 0) + '%';
  $('#story-badge').textContent = S.storyNew ? 'New' : '';
  applyAtmosphere();
}
function applyAtmosphere() {
  const tint = $('#tint');
  const indoor = S.scene === 'bakery' || S.scene === 'title' || S.scene === 'work';
  let bg = 'transparent';
  if (!indoor) {
    if (S.slot === 0) bg = 'rgba(255,214,190,.35)';
    if (S.slot === 2) bg = 'rgba(70,60,140,.55)';
    if (S.weather === 'Cloudy') bg = S.slot === 2 ? 'rgba(60,60,110,.6)' : 'rgba(150,160,170,.45)';
    if (S.weather === 'Rainy') bg = S.slot === 2 ? 'rgba(50,55,95,.65)' : 'rgba(120,135,150,.6)';
  } else if ((S.scene === 'bakery' || S.scene === 'work') && S.slot === 2) bg = 'rgba(200,150,110,.3)';
  tint.style.background = bg;
  Snd.ambience();
}

/* ------------------------------------------------------------------ */
/* Scenes                                                             */
/* ------------------------------------------------------------------ */
function backOut() { const r = S.returnTo; S.returnTo = null; if (r === 'town') go('town'); else if (r === 'village') go('village'); else if (r) go('area', r); else go('village'); }
function go(scene, arg) {
  if (scene === 'home' && S.scene !== 'home') Stay.returnTarget = { scene: S.scene, area: S.area };
  S.scene = scene; if (scene === 'area') S.area = arg;
  $$('.scene').forEach(s => s.classList.toggle('active', s.id === 'scene-' + scene));
  $('#bubble').hidden = true;
  Snd.mood = scene;
  updateHUD();
  if (scene === 'village') Village.enter();
  if (scene === 'bakery') Bakery.enter();
  if (scene === 'pond') Pond.enter();
  if (scene === 'work') Work.enter(arg);
  if (scene === 'garden') Garden.enter();
  if (scene === 'area') Area.enter(arg);
  if (scene === 'home') Stay.enter(arg);
  if (scene === 'circus') { $('#circus-act-line').textContent = 'Three acts · one story about making room.'; $('#scene-circus').classList.remove('showtime'); }
}

async function leaveActivity() {
  // returning to the square after an activity uses up this part of the day
  const used = S.usedSlot; S.usedSlot = false;
  backOut();
  if (used) storyPoint(1);
  if (used) await advanceTime();
  await checkWoods();
}
async function advanceTime() {
  if (S.slot < 2) {
    S.slot++;
    toast(S.slot === 1 ? 'The afternoon sun settles over Honeybrook.' : 'Evening falls. The lanterns flicker on.');
    updateHUD(); Village.populate(); return;
  }
  // end of day
  if (S.day + 1 >= FAIR_DAY) { await countyFair(); return; }
  S.day++; S.slot = 0; S.weather = rollWeather();
  const grew = growGardenOvernight();
  if (S.weather === 'Rainy') S.garden.forEach(b => { if (b.crop) b.water = 0.72; });
  refreshOrders();
  const wxLine = { Sunny: 'The sun is out and the birds are singing.', Cloudy: 'Clouds roll over the hills. The fish might like that.', Rainy: 'Rain patters on the cobblestones. Catfish weather.' }[S.weather];
  updateHUD(); Village.populate();
  await modal(`<p class="kicker">Good morning</p><h2>Day ${S.day} in Honeybrook</h2><p>${wxLine}</p><p>${FAIR_DAY - S.day === 1 ? 'The County Fair is <b>tomorrow</b>. Get your best work ready today.' : `The County Fair is in <b>${FAIR_DAY - S.day} days</b>.`}</p>${grew ? `<p>Your garden grew overnight (${grew} bed${grew > 1 ? 's' : ''}).</p>` : ''}<p>New orders are posted on the board.</p>`, [{ label: 'Start the day', primary: true }]);
}

/* ------------------------------------------------------------------ */
/* Friendships                                                        */
/* ------------------------------------------------------------------ */
const LIKES = { 'Big Mama Mary': ['baked', 'garden'], Buddy: ['fish'], Jonesha: ['art'], "Ja'Mya": ['needle'], Jamon: ['fish', 'baked'], Robin: ['art'], Rheanna: ['hand'], Lena: ['needle'], Lance: ['fish'], Landis: ['hand'], Landric: ['baked'], Amelia: ['garden', 'needle'], 'Tom Bridgewell': ['hand'], Sammy: ['baked'], Wally: ['garden'], 'Professor Honeywell': ['art'], 'Harold Pawst': ['baked'], Carmen: ['garden'] };
const MOMENTS = {
  Sammy: ['Sammy sits a little closer at lunch now. He still keeps one eye on the door.', 'Tonight, for the first time, Sammy takes his shoes off before bed. He doesn\'t say anything about it. He doesn\'t have to.'],
  Wally: ['Wally hands you a warm roll, then, after a long pause, takes one for himself.', 'Wally keeps a loaf for his own supper now. He says you inspired him. Amelia says it\'s about time.'],
  'Harold Pawst': ['Harold nods at you on his route. For Harold, that\'s practically a hug.', 'Harold pats his satchel. "Some letters wait a hundred years," he says. "I don\'t deliver messages. But I always deliver."'],
  Amelia: ['Amelia asks you to help ready the spare room for the next traveler.', 'Amelia tells you about the woman by the creek. "Rest tonight," she said. "Tomorrow may look different." Amelia still believes her.'],
  'Tom Bridgewell': ['Tom lets you hold the level while he fixes a fence. "Steady hands," he grunts. From Tom, that\'s high praise.', 'Tom admits he never stays anywhere long. "Except here," he says, and goes back to work before you can answer.'],
  'Professor Honeywell': ['The Professor asks your opinion on a lesson plan. Then he actually changes it.', 'The Professor adds a crafting bench to the schoolroom. He names it after you.'],
  'Big Mama Mary': ['Big Mama Mary calls you baby now, same as her own.', 'Big Mama Mary tells you a story about Willie she doesn\'t tell just anybody.'],
  Buddy: ['Buddy shows you his secret catfish spot. You are sworn to silence.', 'Buddy gives you a half-joking salute. Then he says, "Proud of you," and he isn\'t joking at all.'],
  Carmen: ['Carmen shows you her notebook. Half of it is questions with no answers yet.', 'Carmen says, "Harold told me to tell them what I know. So I\'m telling you."'],
};
const HEART_AT = [0, 3, 7, 12, 18, 25];
function hearts(name) { const p = (S.friend || {})[name] || 0; return HEART_AT.filter(a => p >= a).length - 1; }
function heartStr(name) { const h = hearts(name); return '♥'.repeat(h) + '♡'.repeat(5 - h); }
function addFriend(name, n) {
  if (!name) return; S.friend = S.friend || {}; const before = hearts(name); S.friend[name] = (S.friend[name] || 0) + n; const after = hearts(name);
  if (after > before) {
    const m = MOMENTS[name] || [`${name} saves you a seat by the fountain now.`, `${name} tells you, "You're one of us now. Don't forget it."`];
    setTimeout(() => { toast(`You and ${name} are closer now: ${heartStr(name)}`); if (after === 2 || after === 4) setTimeout(() => modal(`<p class="kicker">Friendship · ${heartStr(name)}</p><h2>${esc(name)}</h2><p>${esc(m[after === 2 ? 0 : 1])}</p>${after === 2 && HOME_OF[name] ? `<p style="color:var(--ink-2);font-size:.9em">Their door is always open. You can visit ${esc(HOMES[HOME_OF[name]].title)} in Bears' Den.</p>` : ''}`, [{ label: 'That\'s sweet', primary: true }]), 1400); }, 600);
  }
}
async function giveGift(f) {
  $('#bubble').hidden = true;
  if (!S.basket.length) { toast('Your basket is empty. Make something first.'); return; }
  const likes = LIKES[f.name] || [];
  const rows = S.basket.map((it, i) => `<button class="recipe-btn" data-val="g${i}"><b>${esc(it.name)}${likes.includes(it.cat) ? '<span class="tag">Loves this</span>' : ''}</b><small>${stars(it.stars)}</small></button>`).join('');
  const v = await modal(`<p class="kicker">A gift for</p><h2>${esc(f.name)} <span style="font-size:.6em;color:var(--berry)">${heartStr(f.name)}</span></h2><p>Pick something from your basket. Gifts they love count double.</p><div class="recipe-grid">${rows}</div>`, [{ label: 'Never mind' }]);
  if (typeof v !== 'string' || v[0] !== 'g') return;
  const it = S.basket[+v.slice(1)]; if (!it) return; S.basket.splice(S.basket.indexOf(it), 1);
  const loved = likes.includes(it.cat); addFriend(f.name, loved ? 4 : 2); S.glow = clamp((S.glow || 0) + 2, 0, 100); Snd.sfx('good'); updateHUD();
  await modal(`<div class="row" style="border:0;background:none;padding:0">${avatar(f)}<div class="grow"><p class="kicker">Gift given</p><h2 style="margin:0">${esc(f.name)}</h2></div></div><p>"${esc(loved ? pick(['Oh, you remembered what I love.', 'This is exactly my kind of thing. Thank you.', 'You didn\'t have to. But I\'m so glad you did.']) : pick(['Well, isn\'t that kind of you.', 'For me? Thank you.', 'I\'ll find just the spot for it.']))}"</p><p style="text-align:center;color:var(--berry);font-size:1.3em">${heartStr(f.name)}</p>`, [{ label: 'You\'re welcome', primary: true }]);
}

/* ------------------------------------------------------------------ */
/* Bears' Den, Bears' Hive, Bears' Rest, and your room                */
/* ------------------------------------------------------------------ */
const HOMES = {
  hearthwell: { title: 'Hearthwell House', owners: ['Big Mama Mary', 'Buddy'], desc: 'Nine pairs of boots by the door, a stack of library books, a guitar missing one string, and something wonderful in the oven. A photo of Willie sits on the mantel, right where everyone can see it.', gift: { coins: 10, text: 'Big Mama Mary sends you home with a plate wrapped in foil and 10 coins "for the road."' } },
  amelia: { title: "Amelia's Cottage", owners: ['Amelia'], desc: 'A lantern always burns in the window. Spare blankets are folded by the door, just in case someone needs one tonight.', gift: { glow: 6, text: 'Amelia gives you one of the spare blankets. Honeybrook\'s honey glows a little brighter.' } },
  harold: { title: "Harold's House", owners: ['Harold Pawst'], desc: 'Maps of every mail route are pinned to the walls. By the door there\'s a hook, worn smooth, where the satchel hangs at night. The satchel is not on the hook. It never leaves Harold\'s side.', gift: { coins: 12, text: 'Harold gives you a stamp from his collection and 12 coins. "For postage," he says.' } },
  wally: { title: "Wally's Cottage", owners: ['Wally'], desc: 'Flour on everything. On the table sits a single loaf with a note in Amelia\'s handwriting: "This one is yours, Wally."', gift: { coins: 8, glow: 3, text: 'Wally presses a warm honey bun into your paws, plus 8 coins.' } },
};
const HOME_OF = { 'Big Mama Mary': 'hearthwell', Buddy: 'hearthwell', Amelia: 'amelia', 'Harold Pawst': 'harold', Wally: 'wally' };
const DECOR = {
  bed: ['quilt', 'blanket', 'scarf', 'granny'],
  wall: ['p_sunflower', 'p_barn', 'p_teddy', 'p_ship', 'wreath', 'sign'],
  window: ['candle', 'pot', 'honeyjar', 'flowers', 'cake', 'teddybear', 'heartbox'],
  shelf: ['teddybear', 'dress', 'beanie', 'pot', 'honeyjar', 'candle', 'granny', 'scarf', 'bracelet', 'earrings', 'cake', 'heartbox', 'board', 'flowers', 'porridge', 'wreath'],
  rug: ['blanket', 'quilt', 'granny'],
};
const AREAS = {
  den: { name: "Bears' Den", img: 'img/den.jpg', back: 'town', backLabel: 'Back to Honeybrook', spots: [
    { id: 'room', label: 'Welcome House · Your Room', l: 42, t: 22, w: 20, h: 34, hot: true },
    { id: 'home:hearthwell', label: 'Hearthwell House', l: 1, t: 22, w: 27, h: 45 },
    { id: 'home:amelia', label: "Amelia's Cottage", l: 29, t: 36, w: 12, h: 22 },
    { id: 'home:harold', label: "Harold's House", l: 66, t: 34, w: 13, h: 18 },
    { id: 'home:wally', label: "Wally's Cottage", l: 81, t: 10, w: 19, h: 55 },
  ] },
  hive: { name: "Bears' Hive", img: 'img/hive.jpg', back: 'town', backLabel: 'Back to Honeybrook', spots: [
    { id: 'stall', label: 'Market Stall · Sell', l: 0, t: 30, w: 21, h: 60, hot: true },
    { id: 'ws:cakes', label: 'Cake Shop', l: 22, t: 22, w: 15, h: 48 },
    { id: 'ws:beads', label: 'Bead & Jewel Shop', l: 38, t: 18, w: 19, h: 52 },
    { id: 'ws:wood', label: 'Woodshop', l: 57.5, t: 20, w: 21, h: 54 },
    { id: 'ws:salon', label: 'Braiding Salon', l: 79, t: 12, w: 21, h: 64 },
    { id: 'soon', label: 'More shops coming', l: 40, t: 80, w: 22, h: 12 },
  ] },
  rest: { name: "Bears' Rest", img: 'img/rest.jpg', back: 'town', backLabel: 'Back to Honeybrook', spots: [
    { id: 'bench', label: "Willie's Bench", l: 14, t: 40, w: 22, h: 20 },
    { id: 'stones', label: 'Remembrance Stones', l: 20, t: 63, w: 26, h: 17 },
    { id: 'stump', label: 'Storytelling Stump', l: 61, t: 63, w: 16, h: 20 },
    { id: 'flowers', label: 'Hundred-Year Wildflowers', l: 0, t: 50, w: 13, h: 40 },
    { id: 'water', label: 'Quiet Water', l: 62, t: 44, w: 36, h: 17 },
  ] },
  room: { name: 'Your Room', img: 'img/room.jpg', back: 'den', spots: [], decor: [
    { id: 'wall1', kind: 'wall', l: 9.4, t: 13.3, w: 12.4, h: 15.6 }, { id: 'wall2', kind: 'wall', l: 25.6, t: 18, w: 7.6, h: 11.7 },
    { id: 'bed', kind: 'bed', l: 1, t: 56, w: 28, h: 22 }, { id: 'window', kind: 'window', l: 43, t: 43, w: 21, h: 11.5 },
    { id: 'shelf1', kind: 'shelf', l: 76.5, t: 7.5, w: 18.5, h: 10 }, { id: 'shelf2', kind: 'shelf', l: 77, t: 18.6, w: 18, h: 10.3 }, { id: 'shelf3', kind: 'shelf', l: 77, t: 29.6, w: 18, h: 10.3 },
    { id: 'rug', kind: 'rug', l: 29, t: 77, w: 63, h: 17 },
  ] },
  'story-village': { name: 'Honeybrook Village', img: 'img/village.jpg', back: 'village', backLabel: 'Back to Village Square', spots: [
    { id: 'lore:bridge', label: 'Tom Bridgewell’s Bridge', l: 3, t: 53, w: 17, h: 20, hot: true },
    { id: 'lore:welcome', label: 'Welcome House', l: 24, t: 34, w: 19, h: 24, hot: true },
    { id: 'lore:family', label: 'The Hearthwell Family', l: 22, t: 65, w: 23, h: 19 },
    { id: 'lore:school', label: 'Honeywell’s Learning Room', l: 49, t: 24, w: 18, h: 24 },
    { id: 'lore:bakery', label: 'Wally’s Bakery', l: 75, t: 32, w: 19, h: 25 },
    { id: 'lore:letter', label: 'Harold’s Hundred-Year Letter', l: 75, t: 59, w: 23, h: 18, hot: true },
    { id: 'lore:statue', label: 'Goldilocks and the Three Bears', l: 41, t: 58, w: 22, h: 20, hot: true },
    { id: 'lore:belonging', label: 'A Home for Whoever Needs One', l: 3, t: 77, w: 27, h: 18 },
    { id: 'lore:shared', label: 'Honey and Porridge', l: 69, t: 72, w: 27, h: 20 },
  ] },
  'bear-hollow': { name: 'Bear Hollow', img: 'img/hollow.jpg', back: 'town', backLabel: 'Back to Honeybrook map', spots: [
    { id: 'lore:cottage', label: 'Goldilocks & the Three Bears’ Cottage', l: 24, t: 20, w: 29, h: 28, hot: true },
    { id: 'lore:cabins', label: 'Cabins for New Neighbors', l: 52, t: 17, w: 24, h: 24 },
    { id: 'lore:square', label: 'Hollow Square · Fountain & Flowers', l: 68, t: 42, w: 29, h: 18, hot: true },
    { id: 'lore:footbridge', label: 'Footbridge over the Brook', l: 3, t: 40, w: 23, h: 19, hot: true },
    { id: 'lore:firewood', label: 'Shared Firewood Stack', l: 2, t: 79, w: 23, h: 17 },
    { id: 'lore:garden', label: 'Goldilocks’ Garden', l: 28, t: 57, w: 21, h: 18 },
    { id: 'lore:blueflower', label: 'The Blue-Flower Honey Jar', l: 3, t: 58, w: 22, h: 18, hot: true },
    { id: 'lore:hives', label: 'Golden Honey Hives', l: 75, t: 66, w: 22, h: 20, hot: true },
    { id: 'lore:hollowbakery', label: 'Bear Hollow Bakery', l: 77, t: 18, w: 22, h: 22, hot: true },
    { id: 'lore:hearth', label: 'Hearth & the Empty Bowl', l: 54, t: 57, w: 24, h: 22 },
    { id: 'lore:love', label: 'The Hollow’s Rule: LOVE', l: 29, t: 78, w: 37, h: 16 },
  ] },
  'northern-woods': { name: 'The Northern Woods', img: 'img/northern-woods.svg', back: 'story-village', backLabel: 'Back to Honeybrook', spots: [
    { id: 'lore:voices', label: 'The Voices in the Trees', l: 15, t: 45, w: 24, h: 21, hot: true },
    { id: 'lore:forgotten', label: 'Stories in the Fog', l: 43, t: 62, w: 22, h: 20 },
    { id: 'lore:mysterious', label: 'The Woman at the Tree Line', l: 69, t: 29, w: 24, h: 24 },
  ] },
  'storybook-lane': { name: 'Storybook Lane', img: 'img/storybook-lane.svg', back: 'northern-woods', backLabel: 'Back to the Woods', spots: [
    { id: 'lore:glass', label: 'The Glass-Slipper Shop', l: 4, t: 38, w: 24, h: 28, hot: true },
    { id: 'lore:gingerbread', label: 'The Gingerbread Cottage', l: 34, t: 26, w: 26, h: 28, hot: true },
    { id: 'lore:ash', label: 'Ash’s Sourdough Bakery', l: 68, t: 41, w: 26, h: 28, hot: true },
  ] },
};
function keepsake(it) { S.made = S.made || []; S.made.push({ ...it, day: S.day }); if (S.made.length > 60) S.made.shift(); }
function drawDecor(c, W, H, it, kind) {
  const col = it.color || '#c8862a', id = it.id; c.clearRect(0, 0, W, H);
  const s = Math.min(W, H), cx = W / 2, cy = (kind === 'shelf' || kind === 'window') ? H - s / 2 : H / 2;
  if (kind === 'bed' || kind === 'rug') {
    c.globalAlpha = 0.93; const cell = s / (kind === 'rug' ? 3 : 4);
    for (let y = 0; y < H; y += cell) for (let x = 0; x < W; x += cell) { const alt = (Math.floor(x / cell) + Math.floor(y / cell)) % 2; c.fillStyle = id === 'quilt' ? (alt ? col : mixColor(col, '#ffffff', 0.5)) : id === 'granny' ? (alt ? col : '#f4efe4') : (Math.floor(y / (cell / 2)) % 2 ? col : mixColor(col, '#ffffff', 0.35)); c.fillRect(x, y, cell + 1, cell + 1); }
    c.globalAlpha = 1; return;
  }
  if (it.pic && PICS[it.pic]) { c.fillStyle = '#f4ead4'; c.fillRect(0, 0, W, H); c.save(); c.scale(W / 840, H / 700); c.translate(-140, -180); GAMES.paint.draw(c, { pic: PICS[it.pic](), fills: it.fills || [] }, true); c.restore(); return; }
  c.save(); c.translate(cx, cy);
  const u = s / 100;
  const ball = (x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.arc(x * u, y * u, r * u, 0, Math.PI * 2); c.fill(); };
  if (id === 'wreath') { for (let a = 0; a < 12; a++) ball(Math.cos(a / 12 * 6.283) * 34, Math.sin(a / 12 * 6.283) * 34, 12, a % 3 ? '#6f8f5e' : ['#a8344a', '#e2b23b', '#5f93c0'][a % 4 % 3]); }
  else if (id === 'candle') { for (const x of [-16, 16]) { c.fillStyle = col; c.fillRect((x - 7) * u, -30 * u, 14 * u, 70 * u); ball(x, -38, 6, '#f2b23b'); } }
  else if (id === 'pot') { c.fillStyle = col; c.beginPath(); c.moveTo(-14 * u, -42 * u); c.lineTo(14 * u, -42 * u); c.quadraticCurveTo(46 * u, 0, 22 * u, 44 * u); c.lineTo(-22 * u, 44 * u); c.quadraticCurveTo(-46 * u, 0, -14 * u, -42 * u); c.fill(); }
  else if (id === 'honeyjar') { c.translate(0, 6 * u); GAMES.hive.jar(c, 0, 0, u * 0.62, 0.9); }
  else if (id === 'teddybear') { const t = col; ball(-24, -30, 12, t); ball(24, -30, 12, t); ball(0, 18, 30, t); ball(0, -16, 24, mixColor(t, '#ffffff', 0.1)); ball(0, -8, 9, '#f3dfb5'); ball(-9, -20, 3, '#1a0f08'); ball(9, -20, 3, '#1a0f08'); ball(0, -10, 3.5, '#1a0f08'); }
  else if (id === 'dress') { c.fillStyle = col; c.beginPath(); c.moveTo(-14 * u, -40 * u); c.lineTo(14 * u, -40 * u); c.lineTo(20 * u, -10 * u); c.lineTo(40 * u, 44 * u); c.lineTo(-40 * u, 44 * u); c.lineTo(-20 * u, -10 * u); c.closePath(); c.fill(); }
  else if (id === 'beanie') { c.fillStyle = col; c.beginPath(); c.arc(0, 14 * u, 38 * u, Math.PI, 0); c.fill(); c.fillRect(-40 * u, 10 * u, 80 * u, 16 * u); ball(0, -28, 11, mixColor(col, '#ffffff', 0.4)); }
  else if (id === 'scarf' || id === 'blanket' || id === 'granny') { for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? col : mixColor(col, '#ffffff', 0.45); c.fillRect(-40 * u, (-36 + i * 12) * u, 80 * u, 12 * u); } }
  else if (id === 'cake') { c.fillStyle = '#f7ecd8'; c.fillRect(-40 * u, -18 * u, 80 * u, 50 * u); c.fillStyle = col; c.fillRect(-42 * u, -26 * u, 84 * u, 12 * u); c.fillRect(-42 * u, 4 * u, 84 * u, 6 * u); ball(0, -32, 7, '#c8342f'); }
  else if (id === 'heartbox') { c.fillStyle = '#d8b98a'; c.fillRect(-42 * u, -36 * u, 84 * u, 76 * u); c.fillStyle = col; c.beginPath(); c.moveTo(0, 26 * u); c.bezierCurveTo(-46 * u, -6 * u, -20 * u, -40 * u, 0, -16 * u); c.bezierCurveTo(20 * u, -40 * u, 46 * u, -6 * u, 0, 26 * u); c.fill(); }
  else if (id === 'bracelet' || id === 'earrings') { const cols = PALETTES.beads.map(p => p[1]); for (let a = 0; a < 14; a++) ball(Math.cos(a / 14 * 6.283) * 32, Math.sin(a / 14 * 6.283) * 20, 7, cols[a % 3]); }
  else if (id === 'board' || id === 'sign' || id === 'shelfw') { c.fillStyle = '#c99a5b'; c.beginPath(); c.roundRect ? c.roundRect(-44 * u, -24 * u, 88 * u, 48 * u, 8 * u) : c.rect(-44 * u, -24 * u, 88 * u, 48 * u); c.fill(); if (id === 'sign') { c.fillStyle = '#5a3a1c'; c.font = `700 ${16 * u}px Fraunces, serif`; c.textAlign = 'center'; c.fillText('Welcome', 0, 6 * u); } }
  else if (id === 'flowers') { c.strokeStyle = '#4f7a3a'; c.lineWidth = 3 * u; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, 40 * u); c.lineTo(i * 12 * u, -14 * u); c.stroke(); ball(i * 12, -18, 9, ['#a8344a', '#e2b23b', '#f4efe4', '#7d5ba6', '#d0677a'][i + 2]); } c.fillStyle = '#5f93c0'; c.fillRect(-14 * u, 20 * u, 28 * u, 24 * u); }
  else if (id === 'porridge') { c.fillStyle = '#7a4b22'; c.beginPath(); c.ellipse(0, 6 * u, 40 * u, 20 * u, 0, 0, Math.PI); c.fill(); c.fillStyle = '#f1e4c4'; c.beginPath(); c.ellipse(0, 6 * u, 40 * u, 10 * u, 0, 0, Math.PI * 2); c.fill(); }
  else { c.fillStyle = col; c.fillRect(-30 * u, -30 * u, 60 * u, 60 * u); }
  c.restore();
}
const Area = {
  cur: null,
  enter(name) {
    this.cur = name; const A = AREAS[name]; $('#area-bg').src = A.img; const box = $('#area-spots'); box.innerHTML = '';
    for (const sp of A.spots) {
      const b = document.createElement('button'); b.className = 'spot' + (sp.hot ? ' hot' : ''); b.style.cssText = `left:${sp.l}%;top:${sp.t}%;width:${sp.w}%;height:${sp.h}%`;
      b.innerHTML = `<span class="sign">${esc(sp.label)}</span>`; b.onclick = () => this.spot(sp.id); box.appendChild(b);
    }
    if (A.decor) this.renderRoom();
    const title = document.createElement('div'); title.className = 'area-title'; title.textContent = A.name; box.appendChild(title);
    if (A.back) { const b = document.createElement('button'); b.className = 'btn btn-small area-back'; b.textContent = A.backLabel || "Back to Bears' Den"; b.onclick = () => { Snd.sfx('click'); A.back === 'village' ? go('village') : A.back === 'town' ? go('town') : go('area', A.back); }; box.appendChild(b); }
  },
  renderRoom() {
    const box = $('#area-spots'); S.room = S.room || {};
    for (const d of AREAS.room.decor) {
      const b = document.createElement('button'); b.className = 'decor' + (S.room[d.id] != null ? ' filled' : ''); b.style.cssText = `left:${d.l}%;top:${d.t}%;width:${d.w}%;height:${d.h}%`; b.setAttribute('aria-label', 'Decorate the ' + d.kind);
      const cv = document.createElement('canvas'); cv.width = 300; cv.height = Math.round(300 * d.h / (d.w * 1.5)); b.appendChild(cv);
      const it = S.room[d.id] != null ? (S.made || [])[S.room[d.id]] : null;
      if (it) drawDecor(cv.getContext('2d'), cv.width, cv.height, it, d.kind); else b.insertAdjacentHTML('beforeend', '<span class="plus">+</span>');
      b.onclick = () => this.decorate(d); box.appendChild(b);
    }
  },
  async decorate(d) {
    Snd.sfx('click'); const ok = DECOR[d.kind], made = S.made || [];
    const opts = made.map((m, i) => [m, i]).filter(([m, i]) => ok.includes(m.id) && !Object.entries(S.room || {}).some(([k, v]) => v === i && k !== d.id));
    const where = { bed: 'the bed', wall: 'the wall', window: 'the windowsill', shelf: 'the shelf', rug: 'the floor' }[d.kind];
    if (!opts.length) { await modal(`<p class="kicker">Your Room</p><h2>Nothing for ${where} yet</h2><p>Everything you make is kept here as a keepsake, even after you sell or deliver it. Things that fit ${where}: <b>${esc([...new Set(ok.map(id => (ALL_CRAFTS.find(c => c.id === id) || { name: id === 'flowers' ? 'Wildflower Bouquet' : id }).name))].join(', '))}</b>.</p>`, [{ label: 'Got it', primary: true }]); return; }
    const grid = opts.slice(-12).reverse().map(([m, i]) => `<button class="recipe-btn" data-val="d${i}"><b>${esc(m.name)}</b><small>${stars(m.stars || 0)} · made Day ${m.day}</small></button>`).join('');
    const v = await modal(`<p class="kicker">Your Room</p><h2>Decorate ${where}</h2><div class="recipe-grid">${grid}</div>`, S.room[d.id] != null ? [{ label: 'Close' }, { label: 'Take it down', value: 'clear' }] : [{ label: 'Close' }]);
    if (v === 'clear') S.room[d.id] = null; else if (typeof v === 'string' && v[0] === 'd') { S.room[d.id] = +v.slice(1); Snd.sfx('good'); }
    this.enter('room');
  },
  async spot(id) {
    Snd.sfx('click'); const day = S.day; S.restDay = S.restDay || {};
    if (this.cur === 'bear-hollow' && id === 'lore:cottage') { go('home', 'hollow-cottage'); return; }
    if (this.cur === 'bear-hollow' && id === 'lore:cabins') { go('home', 'hollow-cabins'); return; }
    if (id.startsWith('lore:')) { await showLore(id.slice(5)); return; }
    if (id === 'room') { go('area', 'room'); if (!S.found?.room) { S.found = S.found || {}; S.found.room = true; toast('Your room. Click the empty spots to decorate with things you\'ve made.'); } return; }
    if (id.startsWith('ws:')) { if (S.usedSlot) { toast('Head back out to let some time pass first.'); } S.returnTo = this.cur; go('work', id.slice(3)); return; }
    if (id.startsWith('home:')) { go('home', 'home-' + id.slice(5)); return; }
    if (id === 'stall') return this.market();
    if (id === 'soon') { await modal(`<p class="kicker">Bears' Hive</p><h2>More shops coming</h2><p>Signs are going up on the empty lots:</p><ul class="list"><li class="row"><div class="grow"><b>Photography Studio</b><small>Portraits and product photos</small></div></li><li class="row"><div class="grow"><b>Pet Grooming Parlor</b><small>Suds, brushing, and very fluffy results</small></div></li><li class="row"><div class="grow"><b>Flower Stand</b><small>Bouquets from your garden</small></div></li><li class="row"><div class="grow"><b>Makeup Studio</b><small>Shade-mixing lab and timed looks</small></div></li><li class="row"><div class="grow"><b>Farm Shop</b><small>Animal care, harvest timing, and a very dramatic chicken</small></div></li><li class="row"><div class="grow"><b>Mechanic Shop</b><small>Diagnose the engine by its sound</small></div></li></ul><p style="color:var(--ink-2);font-size:.9em">Soap making is coming to the Craft Barn's candle bench, hemming to the Sewing Cottage, and landscaping to your Garden Plot.</p>`, [{ label: 'Can\'t wait', primary: true }]); return; }
    if (id === 'bench') { const fresh = S.restDay.bench !== day; if (fresh) { S.restDay.bench = day; S.glow = clamp((S.glow || 0) + 2, 0, 100); updateHUD(); } await modal(`<p class="kicker">A small brass plaque</p><h2>Willie's Bench</h2><p style="font-family:var(--font-d);font-size:1.15em">"Sit a while. The fish will wait."</p><p>${pick(['The meadow hums. For a while, nothing needs fixing.', 'Somewhere a bee is working. You let it.', 'The light goes gold on the water. You breathe a little slower.', 'You think about everyone who made room for you here.'])}</p>${fresh ? '<p style="color:var(--ink-2);font-size:.9em">You feel steadier. The honey glows a little brighter.</p>' : ''}`, [{ label: 'Stand up slowly', primary: true }]); return; }
    if (id === 'stones') { const fresh = S.restDay.stones !== day; const v = await modal(`<p class="kicker">Bears' Rest</p><h2>Remembrance Stones</h2><p>A circle of smooth stones around a flat one with an empty bowl. Bears leave a little honey here for the ones who won't come home: Mama Bear, Papa Bear, Goldilocks, Willie, and anyone else someone is missing.</p>`, fresh ? [{ label: 'Leave a little honey', primary: true, value: 'h' }, { label: 'Just sit' }] : [{ label: 'Sit quietly', primary: true }]); if (v === 'h') { S.restDay.stones = day; S.glow = clamp((S.glow || 0) + 3, 0, 100); updateHUD(); Snd.sfx('ding'); toast('The bowl catches the light for a moment.'); } return; }
    if (id === 'flowers') { const fresh = S.restDay.flowers !== day; const v = await modal(`<p class="kicker">Bears' Rest</p><h2>Hundred-Year Wildflowers</h2><p>These wildflowers have bloomed here longer than anyone remembers. Big Mama Mary says they've been blooming for a hundred years, ever since a kiss far away sank into the soil.</p>`, fresh ? [{ label: 'Pick a small bouquet', primary: true, value: 'p' }, { label: 'Leave them be' }] : [{ label: 'Leave them be', primary: true }]); if (v === 'p') { S.restDay.flowers = day; keepsake({ id: 'flowers', name: 'Wildflower Bouquet', stars: 0 }); Snd.sfx('good'); toast('A Wildflower Bouquet for your windowsill or shelf.'); } return; }
    if (id === 'stump') { await showStory(); return; }
    if (id === 'water') { await modal(`<p class="kicker">Bears' Rest</p><h2>Quiet Water</h2><p>${S.slot === 2 ? 'Fireflies drift over the water, one, then ten, then too many to count. Somewhere to the north, a light in the woods blinks back.' : pick(['A dragonfly lands on a reed, considers you, and leaves.', 'The water holds the whole sky, upside down and perfectly still.', 'A fish jumps. Buddy would want to know about that.'])}</p>`, [{ label: 'Keep watching', primary: true }]); return; }
  },
  async market() {
    if (!S.basket.length) { await modal(`<p class="kicker">Bears' Hive</p><h2>Market Stall</h2><p>Your basket is empty. Make, bake, catch, or grow something, then bring it here to sell. Farmers market money adds up.</p>`, [{ label: 'Okay', primary: true }]); return; }
    const price = it => 3 + (it.stars || 0) * 6 + ((it.score || 0) >= 90 ? 4 : 0) + (it.kind === 'fish' ? Math.round((it.weight || 0) * 2) : 0);
    const rows = S.basket.map((it, i) => { const ord = S.orders.some(o => findItemFor(o) === it); return `<li class="row"><div class="grow"><b>${esc(it.name)}</b><small>${stars(it.stars || 0)}${ord ? ' · someone ordered this' : ''}</small></div><button class="btn btn-small btn-sage" data-val="s${i}">Sell ${price(it)}</button></li>`; }).join('');
    const v = await modal(`<p class="kicker">Bears' Hive</p><h2>Market Stall</h2><p>Sell anything in your basket. Keep your best pieces for the fair and for orders. Orders pay more.</p><ul class="list">${rows}</ul>`, [{ label: 'Done' }]);
    if (typeof v !== 'string' || v[0] !== 's') return;
    const it = S.basket[+v.slice(1)]; if (!it) return; const p = price(it); S.basket.splice(S.basket.indexOf(it), 1); S.coins += p; Snd.sfx('coin'); updateHUD(); toast(`Sold ${it.name} for ${p} coins.`);
    return this.market();
  },
};
/* ------------------------------------------------------------------ */
/* Where the Stories Live: chapter summaries, honey glow              */
/* ------------------------------------------------------------------ */
const STORY = [
  ['Prologue: The Kiss', 'Long ago, true love\'s kiss woke a sleeping princess. Its warmth didn\'t stop there. It sank through the roots and into the soil, and the forest kept it.'],
  ['Chapter 1: The River', 'A spring flood takes a beekeeping family. Their seven-year-old daughter survives with one thing: a jar of honey wrapped in a cloth printed with tiny blue flowers.'],
  ['Chapter 2: The Cottage', 'Starving, she follows the smell of porridge to a cottage with an unlatched door. Mama Bear sees a lost child, not an intruder. "She stays." They call her Goldilocks.'],
  ['Chapter 3: The Mascot', 'Orphaned bears find their way to the cottage, and Goldilocks welcomes every one. A settlement grows around them, Bear Hollow, where the honey is sweeter than it ought to be.'],
  ['Chapter 4: The Winter', 'A cruel winter takes Mama and Papa Bear. In spring, Goldilocks and Baby Bear light the fires again and set a bowl by the hearth for the two who won\'t come home.'],
  ['Chapter 5: The Rule', 'Bear Hollow lives by one rule: LOVE. Treat everybody right. But fear starts deciding who has to leave, and the town learns not to say their names.'],
  ['Chapter 6: The Bridge', 'Amelia shelters under a broken bridge, where a woman tells her to rest and then vanishes. With Tom Bridgewell, she mends the bridge and leaves a shelter for whoever needs it. Honeybrook begins.'],
  ['Chapter 7: The Town', 'Newcomers arrive one by one: Sammy, the Hearthwells, Professor Honeywell, Wally the baker, and Harold Pawst the mail bear. Honeybrook asks for honesty and repair, never exile.'],
  ['Chapter 8: The Letter', 'Harold carries a hundred-year-old letter he will not open. Goldilocks gave it to him herself, for a human who would one day come asking about the beekeepers.'],
  ['Chapter 9: The Sacred Dark', 'North of town lie the Northern Woods. Every bear hears a voice there calling their name, and the fog holds all the stories no one tells anymore.'],
  ['Chapter 10: Storybook Lane', 'Deep in the woods, the fairy-tale legends live on in a hidden lane of shops. The Big Bad Wolf goes by Ash now, and he bakes bread.'],
  ['Chapter 11: Carmen', 'A human woman arrives asking about the beekeepers. Honeybrook makes room for her, and Harold finally delivers the letter. The story she was chasing turns out to be her own.'],
  ['Chapter 12: The Voice', 'At three in the morning, a voice from the Northern Woods calls Carmen by name. "Come and see."'],
  ['Epilogue: The Telling', 'The stories don\'t need a hero. They need a reader. Tell them what you know. That is how every story comes back to life.'],
];
const STORY_AT = [0, 1, 3, 5, 8, 10, 13, 16, 19, 22, 25, 28, 31, 34];
function storyUnlocked() { const p = S.storyPts || 0; return STORY_AT.filter(a => p >= a).length; }
function glowBonus() { return Math.round((S.glow || 0) / 10); }
function addGlow(n) { S.glow = clamp((S.glow || 0) + n, 0, 100); updateHUD(); }
function storyPoint(n) {
  const before = storyUnlocked(); S.storyPts = (S.storyPts || 0) + n; const after = storyUnlocked();
  if (after > before) {
    S.storyNew = true;
    setTimeout(() => toast(`Big Mama Mary has a new chapter for you: ${STORY[after - 1][0]}`), 1200);
    if (before <= 11 && after > 11) setTimeout(() => toast('A woman with a notebook just arrived at the Welcome House.'), 4800);
    if (after === STORY.length && !S.woodsOpen) S.woodsCall = true;
  }
  updateHUD();
}
async function checkWoods() {
  if (!S.woodsCall || S.woodsOpen) return;
  S.woodsCall = false; S.woodsOpen = true; Snd.sfx('ding'); updateHUD();
  await modal(`<p class="kicker">Three in the morning</p><h2>Come and see</h2><p>You wake in the spare room at the Welcome House. A voice is coming from the north, from the dark between the trees. It says your name as if it has always known you.</p><p style="font-family:var(--font-d);font-size:1.25em;text-align:center">"${esc(S.name)}. Come and see."</p><p>Far past the rooftops, a single light appears in the Northern Woods, then another, like windows being lit along a lane no one can see.</p>`, [{ label: 'Look north', primary: true }]);
}
async function showStory() {
  const n = storyUnlocked(), pts = S.storyPts || 0; S.storyNew = false; updateHUD();
  const rows = STORY.map(([t, sum], i) => i < n
    ? `<li class="story-ch"><b>${esc(t)}</b><span>${esc(sum)}</span></li>`
    : i === n ? `<li class="story-ch locked"><b>${esc(t)}</b><span>${STORY_AT[i] - pts} more to go. Finishing a project counts 1, and filling an order counts 2.</span></li>`
    : `<li class="story-ch locked"><b>${esc(t)}</b></li>`).join('');
  await modal(`<p class="kicker">Big Mama Mary's storybook</p><h2>Where the Stories Live</h2><p style="color:var(--ink-2);font-size:.9em;margin-top:-.4em">Book One, a story of Bear Hollow, Honeybrook, and the Northern Woods, by Templar Hughes-Bryant. ${n} of ${STORY.length} chapters told.</p><ul class="list story-list">${rows}</ul>`, [{ label: 'Close the book', primary: true }]);
  await checkWoods();
}
const LORE = {
  bridge: ['The bridge into Honeybrook', 'During a storm, Amelia sheltered beneath a broken bridge. A gentle woman told her, “Rest tonight. Tomorrow may look different,” then vanished without footprints. The next day Amelia met Tom Bridgewell, a carpenter and stoneworker. They repaired the bridge together and built a small shelter for whoever needed it. That shelter became Honeybrook.'],
  welcome: ['The Welcome House', 'The shelter grew into the Welcome House. When Sammy arrived, the welcome was simple: “You can eat first.” Food comes before questions here, and newcomers only tell their story when they want to.'],
  family: ['The Hearthwell family', 'Templar is the family’s techie, Buddy is a veteran, and Big Mama Mary keeps the stories. Willie is remembered with love. Their children—Jonesha, Ja’Mya, Jamon, Robin, Rheanna, Lena, Lance, Landis, and Landric—each bring their own personality to the family and the town.'],
  school: ['A room that learned to change', 'Professor Theodore Honeywell first brought identical lessons for every child. The children helped him make a room with a reading corner, a puzzle table, a workbench, and room for neighbors to help one another. The teacher changed his plan when he saw what his students needed.'],
  bakery: ['Wally’s bakery', 'Wally makes bread and pastries for the village. Honeybrook learned that a giver needs to eat, too: caring for neighbors includes letting them care for you.'],
  letter: ['The letter Harold kept', 'Harold Pawst is the mail bear. “I DELIVER MAIL. I DO NOT DELIVER MESSAGES.” He knows most things and delivers messages anyway. For a hundred years he carried a sealed letter Goldilocks asked him to deliver to a human who came asking about the beekeepers. When Carmen arrived, she learned she was their descendant; Harold gave her the letter and the history.'],
  statue: ['The village square', 'A bronze Goldilocks stands with the Three Bears in the town square. The statue remembers the lost beekeeper’s daughter who found a family in Bear Hollow, and the hope that traveled with her to Honeybrook.'],
  belonging: ['Honesty, repair, and belonging', 'Honeybrook asks for honesty and repair when harm is done. It does not make people earn a home or send newcomers away. Accountability and belonging can live together; people need time, safety, and a chance to make things right.'],
  shared: ['Honey and porridge', 'Bear Hollow’s bees make unusually sweet honey, and Honeybrook shares in that sweetness. Honeybrook leaves porridge for Bear Hollow, but porridge belongs to the Hollow’s own rituals. The land does not take sides, and friendship does not require adopting another town’s rules.'],
  cottage: ['The cottage that opened its door', 'After a spring river swept away her beekeeper parents, a seven-year-old girl followed the smell of porridge to the Three Bears’ unlatched cottage. She ate from the bowls and curled into the smallest bed. Mama Bear saw a lost child, not a trespasser: “She stays.” The girl became Goldilocks and learned to care for bees.'],
  cabins: ['Cabins for the newcomers', 'The first cabin stood near Goldilocks’s cottage. The next rose farther down the path. Every new home answered a real need, built by neighbors who wanted the next frightened bear to find a roof.'],
  square: ['The fountain square', 'Bear Hollow became a town one shared task at a time. Someone shaped a fountain, Baby Bear hauled stones for it, and another neighbor planted flowers close by. The square gathered the bears around a place they had made together.'],
  footbridge: ['The footbridge over the brook', 'A little footbridge joined the paths over the brook. Cubs played in the water while neighbors carried stones, mended fences, and built a place to stack firewood where new arrivals could reach it.'],
  firewood: ['Firewood for whoever needs it', 'The stack was left where newcomers could find it. In Bear Hollow, practical kindness mattered: a warm fire, dry wood, a meal, and help offered before anyone had to ask twice.'],
  garden: ['Goldilocks’s shared garden', 'Goldilocks helped plan a garden to feed the growing settlement. The bears planted, watered, and harvested together, then brought what they grew to the shared table.'],
  hives: ['The hives and the golden honey', 'Goldilocks and Baby Bear tended the bees after Mama and Papa were gone. Their honey stayed golden, rich, and astonishingly sweet. The magic had been humming below the ground since the kiss, but it answered care in everyday work—not a command or a charm.'],
  hollowbakery: ['The bakery that sold out by noon', 'Bear Hollow had become a proper town, with a bakery that sold out by noon. Honey and porridge were traded like money. The food carried the care of the bears who made it, and it could comfort a neighbor who was ill.'],
  blueflower: ['The blue-flower cloth', 'The little beekeeper carried one jar of honey wrapped in cloth printed with tiny blue flowers. She had saved it when the river took her parents. Goldilocks brought that memory, and the bees’ work, into the family she found.'],
  hearth: ['A bowl beside the hearth', 'Years later, a cruel winter took Mama Bear and Papa Bear. Goldilocks and Baby Bear relit the fire and tended the hives. They left a bowl beside the hearth for the ones they missed. In Bear Hollow, love meant showing up and caring for one another.'],
  love: ['The Hollow’s rule', 'Bear Hollow’s rule was “LOVE. Treat everybody right.” It began as a promise of care, work, and repair. Over time fear shaped who was allowed to stay. Some bears were sent away; some were harmed, and some could not live under the rules. The town stopped saying their names. The story holds both the love that built the Hollow and the hurt its silence concealed.'],
  voices: ['A voice for each bear', 'In the Northern Woods, each bear hears an individual voice calling their own name. It is a resonance and an invitation, not a command for everyone to follow the same call. Honeybrook respects the woods’ boundary and the choice each person makes.'],
  forgotten: ['The stories in the fog', 'The fog and gloom hold fairy tales that have gone untold for a long time. A glass slipper chimes somewhere among the mushrooms. The woods draw people who feel lost or lonely; their sacredness asks for sympathy, not fear or another rule.'],
  mysterious: ['The woman at the tree line', 'A woman sometimes appears at the edge of the Northern Woods. Amelia remembers the same gentle woman from the night beneath the broken bridge. She offered rest, disappeared without footprints, and left no explanation.'],
  glass: ['The glass-slipper shop', 'Deep beyond the fog and the last reach of daylight, Storybook Lane opens in a clearing. A shop keeps glass slippers safe among the stories that are still waiting to be told.'],
  gingerbread: ['The gingerbread cottage', 'The Lane gathers storybook homes together: here stands a gingerbread cottage, beside shops and a bakery. It appears when old stories are brought back to life. The lane had waited a hundred years.'],
  ash: ['Ash’s bakery', 'Ash used to be called the Big Bad Wolf. Now he is rounder, kind, and bakes sourdough. He offers a seat and says, “Sit down, kid. Let me tell you what the books got wrong.”'],
};
async function showLore(id) { const item = LORE[id]; if (!item) return; await modal(`<p class="kicker">Where the Stories Live</p><h2>${esc(item[0])}</h2><p>${esc(item[1])}</p>`, [{ label: 'Keep exploring', primary: true }]); }
async function showStoryTrail() {
  const lane = S.woodsOpen;
  const choices = [
    ['village', 'Honeybrook Village', 'Amelia, Tom, the Welcome House, and the town that makes room.'],
    ['bear-hollow', 'Bear Hollow', 'Goldilocks, the Three Bears, the bees, and the meaning of the Hollow’s rule.'],
    ['northern-woods', 'Northern Woods', 'A boundary honored by the towns, and a voice that calls each bear by name.'],
    ['storybook-lane', lane ? 'Storybook Lane' : 'Storybook Lane · not yet', lane ? 'The glass-slipper shop, gingerbread cottage, and Ash’s bakery.' : 'The Lane appears after the whole first book has been told.'],
  ];
  const html = choices.map(([id, name, desc]) => `<button class="recipe-btn" data-val="${id}" ${id === 'storybook-lane' && !lane ? 'disabled' : ''}><b>${esc(name)}</b><small>${esc(desc)}</small></button>`).join('');
  const choice = await modal(`<p class="kicker">Explore the book’s places</p><h2>The Story Trail</h2><p>Walk through the places in <i>Where the Stories Live</i>. Tap a sign in each scene to hear its part of the story.</p><div class="recipe-grid">${html}</div>`, [{ label: 'Close', value: 'close' }]);
  if (choice && choice !== 'close' && (choice !== 'storybook-lane' || S.woodsOpen)) go('area', choice);
}
/* ------------------------------------------------------------------ */
/* Orders, basket, store                                              */
/* ------------------------------------------------------------------ */
function makeOrder() {
  const taken = S.orders.map(o => o.who);
  const who = pick(FOLKS.filter(f => present(f) && !taken.includes(f.name))).name;
  const r0 = Math.random();
  if (r0 < 0.26) {
    const r = pick(RECIPES), min = pick([1, 1, 2, 2, 3]);
    return { who, kind: 'cookie', recipe: r.id, min, reward: 12 + min * 8 + (r.special ? 6 : 0), text: `a batch of ${r.name}`, need: `${min}★ or better` };
  }
  if (r0 < 0.46) {
    const opts = [['bluegill', 0.6], ['crappie', 0.8], ['trout', 1.5], ['bass', 2.5], ['catfish', 4]];
    const [id, w] = pick(opts); const f = FISH.find(x => x.id === id);
    return { who, kind: 'fish', fish: id, min: w, reward: 14 + Math.round(f.diff * 14), text: `a ${f.name}`, need: `at least ${w} lb` };
  }
  if (r0 < 0.84) {
    const c = pick(ALL_CRAFTS.filter(x => !x.service)), min = pick([1, 1, 2, 2, 3]);
    const text = c.game === 'paint' ? `a painting of "${c.name}"` : c.id === 'candle' ? 'a set of Hand-Dipped Candles' : c.order || `a ${c.name}`;
    return { who, kind: 'craft', craft: c.id, min, reward: 16 + min * 9, text, need: `${min}★ or better` };
  }
  const id = pick(Object.keys(CROPS)), min = pick([1, 1, 2]), cr = CROPS[id];
  return { who, kind: 'produce', crop: id, min, reward: 14 + min * 8 + cr.days * 4, text: id === 'pumpkin' ? 'a pumpkin from your garden' : `some ${cr.name.toLowerCase()} from your garden`, need: `${min}★ or better` };
}
function refreshOrders() { while (S.orders.length < 3) S.orders.push(makeOrder()); }
function findItemFor(o) {
  const ok = S.basket.filter(it => it.kind === o.kind && (o.kind === 'cookie' ? it.recipe === o.recipe && it.stars >= o.min : o.kind === 'fish' ? it.fish === o.fish && it.weight >= o.min : o.kind === 'craft' ? it.craft === o.craft && it.stars >= o.min : it.crop === o.crop && it.stars >= o.min));
  ok.sort((a, b) => a.score - b.score); return ok[0];
}
async function showOrders() {
  if (!S.orders.length) refreshOrders();
  const rows = S.orders.map((o, i) => {
    const f = folk(o.who), it = findItemFor(o);
    return `<li class="row">${avatar(f)}<div class="grow"><b>${esc(o.who)}</b> wants ${esc(o.text)}<small>${esc(o.need)} · pays ${o.reward} coins</small></div><button class="btn btn-small ${it ? 'btn-sage' : ''}" data-val="${i}" ${it ? '' : 'disabled'}>${it ? 'Deliver' : 'Not yet'}</button></li>`;
  }).join('');
  const v = await modal(`<p class="kicker">Harold Pawst's mailbag</p><h2>Orders</h2><p style="font-size:.78em;letter-spacing:.06em;font-weight:800;color:var(--ink-2);margin-top:-.4em">I DELIVER MAIL. I DO NOT DELIVER MESSAGES.</p><ul class="list">${rows}</ul><p style="font-size:.85em;color:var(--ink-2)">Make it, catch it, or grow it, then come back here to deliver.</p>`, [{ label: 'Close' }]);
  if (typeof v === 'string') deliver(+v);
}
async function deliver(i) {
  const o = S.orders[i], it = findItemFor(o); if (!it) return;
  S.basket.splice(S.basket.indexOf(it), 1); S.orders.splice(i, 1);
  S.coins += o.reward; S.delivered++; addFriend(o.who, 3); Snd.sfx('coin'); S.glow = clamp((S.glow || 0) + 6, 0, 100); storyPoint(2);
  const f = folk(o.who);
  const thanks = o.kind === 'craft' ? pick(['Oh, would you look at this. You made this by hand?', 'This is going in a place of honor in my house.', 'It\'s beautiful. Thank you, truly.']) : o.kind === 'produce' ? pick(['Fresh from the garden. You can taste the sunshine.', 'These are going right into Sunday dinner.', 'Now that is some good growing.']) : o.kind === 'cookie' ? pick(['These smell like Sunday afternoon. Thank you, baby.', 'Oh, these are perfect. I might share. Might.', 'Golden and sweet, just how I like them.']) : pick(['Now that is a fish worth bragging about.', 'Fish fry tonight. You\'re invited.', 'Look at the size of it. Thank you kindly.']);
  updateHUD();
  await modal(`<div class="row" style="border:0;background:none;padding:0">${avatar(f)}<div class="grow"><p class="kicker">Delivered</p><h2 style="margin:0">${esc(o.who)}</h2></div></div><p>"${esc(o.who === 'Big Mama Mary' && o.kind === 'cookie' ? 'Baby, these taste like home. You did good.' : thanks)}"</p><p><b>+${o.reward} coins</b></p><p style="font-size:.88em;color:var(--ink-2)">Honeybrook's honey glows a little brighter. Kindness does that here.</p>`, [{ label: 'You\'re welcome', primary: true }]);
  if (S.orders.length < 2) { S.orders.push(makeOrder()); toast('Harold Pawst dropped off a new order. He did not read it.'); updateHUD(); }
  await checkWoods();
}
async function showBasket() {
  const verb = { cookie: 'Baked', craft: 'Made', produce: 'Picked' };
  const rows = S.basket.length ? S.basket.map(it => it.kind !== 'fish'
    ? `<li class="row"><div class="grow"><b>${esc(it.name)}</b><small>${verb[it.kind]} Day ${it.day}</small></div>${stars(it.stars)}</li>`
    : `<li class="row"><div class="grow"><b>${esc(it.name)}</b><small>Caught Day ${it.day}</small></div><b>${it.weight.toFixed(1)} lb</b></li>`).join('')
    : '<li class="empty">Your basket is empty. Make, bake, catch, or grow something.</li>';
  const best = Object.entries(CATS).filter(([k]) => S.best[k]).map(([k, label]) => `${label}: <b>${esc(S.best[k].name)}</b> (${S.best[k].score} pts)`);
  await modal(`<p class="kicker">${esc(S.name)}'s basket</p><h2>Basket</h2><ul class="list">${rows}</ul>${best.length ? `<p style="font-size:.88em">Fair entries so far:<br>${best.join('<br>')}</p>` : ''}`, [{ label: 'Close', primary: true }]);
}
async function showStore() {
  const rows = UPGRADES.map(u => {
    const own = S.owned[u.id];
    return `<li class="row"><div class="grow"><b>${esc(u.name)}</b><small>${esc(u.desc)}</small></div><button class="btn btn-small ${own ? '' : 'btn-sage'}" data-val="${u.id}" ${own || S.coins < u.cost ? 'disabled' : ''}>${own ? 'Owned' : u.cost + ' coins'}</button></li>`;
  }).join('');
  const v = await modal(`<p class="kicker">Honeybrook general store</p><h2>Store</h2><p>You have <b>${S.coins} coins</b>. Fill orders to earn more.</p><ul class="list">${rows}</ul>`, [{ label: 'Close' }]);
  if (typeof v === 'string') {
    const u = UPGRADES.find(x => x.id === v); S.coins -= u.cost; S.owned[u.id] = true; Snd.sfx('coin'); updateHUD();
    toast(`You bought the ${u.name}.`); if (u.id === 'teddy') toast('Your teddy bear is waiting by the fountain.');
  }
}

/* ------------------------------------------------------------------ */
/* Village                                                            */
/* ------------------------------------------------------------------ */
const LOCKED = {
  sewing: ['Sewing Cottage', 'Quilting, teddy bear stitching, and doll dresses. Ja\'Mya already picked her fabric.'],
  yarn: ['Yarn Shop', 'Knit and crochet scarves and blankets row by row, in any colors you like.'],
  paint: ['Painter\'s Studio', 'Paint by numbers or freehand, and hang your work in the village gallery.'],
  barn: ['Craft Barn', 'Wreaths, pottery, and candle making.'],
};
const Village = {
  folks: [], raf: 0, last: 0,
  enter() { this.populate(); cancelAnimationFrame(this.raf); this.last = performance.now(); this.loop(); },
  populate() {
    const box = $('#villagers'); box.innerHTML = ''; this.folks = [];
    const n = S.weather === 'Rainy' ? 2 : S.slot === 2 ? 3 : 4;
    const chosen = FOLKS.filter(present).sort(() => Math.random() - 0.5).slice(0, n);
    // Buddy and Big Mama Mary like to be around
    chosen.forEach(f => {
      const el = document.createElement('button'); el.className = 'villager walking'; el.setAttribute('aria-label', 'Talk to ' + f.name);
      el.innerHTML = villagerSVG(f, S.weather === 'Rainy') + `<span class="nm">${esc(f.name)}</span>`;
      box.appendChild(el);
      const v = { f, el, x: rand(25, 75), y: rand(74, 92), tx: 0, ty: 0, wait: rand(0, 2), dir: 1 };
      this.newTarget(v); this.folks.push(v);
      el.onclick = e => { e.stopPropagation(); this.talk(v); };
    });
  },
  newTarget(v) { v.tx = rand(14, 80); v.ty = rand(72, 94); },
  loop() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (S.scene === 'village') {
      for (const v of this.folks) {
        if (v.talking) { v.el.classList.remove('walking'); continue; }
        if (v.wait > 0) { v.wait -= dt; v.el.classList.remove('walking'); }
        else {
          const dx = v.tx - v.x, dy = v.ty - v.y, d = Math.hypot(dx, dy), sp = 4.5 * dt;
          if (d < 0.5) { v.wait = rand(1.5, 5); this.newTarget(v); }
          else { v.x += dx / d * sp; v.y += dy / d * sp * 0.7; v.dir = dx < 0 ? -1 : 1; v.el.classList.add('walking'); }
        }
        const sc = 0.75 + (v.y - 70) / 25 * 0.35;
        v.el.style.left = v.x + '%'; v.el.style.top = v.y + '%';
        v.el.style.transform = `scale(${sc}) scaleX(${v.dir})`; v.el.style.transformOrigin = '50% 100%';
        v.el.querySelector('.nm').style.transform = `translateX(-50%) scaleX(${v.dir})`;
        v.el.style.zIndex = Math.round(v.y);
      }
    }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  talk(v) {
    Snd.sfx('click');
    this.folks.forEach(o => o.talking = false); v.talking = true;
    const ord = S.orders.find(o => o.who === v.f.name);
    let line = pick(v.f.lines);
    if (ord && Math.random() < 0.6) line = `Did you see my order? I'd love ${ord.text}, ${ord.need}.`;
    if (S.weather === 'Rainy' && Math.random() < 0.3) line = 'Glad I brought my umbrella. You\'d best keep dry, too.';
    if (S.day === FAIR_DAY - 1 && Math.random() < 0.4) line = 'The fair is tomorrow. Are your entries ready?';
    S.talked = S.talked || {}; if (S.talked[v.f.name] !== S.day) { S.talked[v.f.name] = S.day; addFriend(v.f.name, 1); }
    const b = $('#bubble'); b.innerHTML = `<b>${esc(v.f.name)} <span class="hearts">${heartStr(v.f.name)}</span></b>${esc(line.replace('{name}', S.name))}<button class="btn btn-small bubble-gift">Give a gift</button>`; b.hidden = false;
    b.querySelector('.bubble-gift').onclick = e => { e.stopPropagation(); clearTimeout(this.bt); v.talking = false; giveGift(v.f); };
    const r = v.el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const bx = clamp(r.left - sr.left + r.width / 2 - b.offsetWidth / 2, 8, sr.width - b.offsetWidth - 8);
    const by = Math.max(60, r.top - sr.top - b.offsetHeight - 8);
    b.style.left = bx + 'px'; b.style.top = by + 'px';
    clearTimeout(this.bt); this.bt = setTimeout(() => { b.hidden = true; v.talking = false; }, 6000);
  },
};
function villagerSVG(f, umbrella) { return f.human ? humanSVG(f, umbrella) : bearSVG(f, umbrella); }
function bearSVG(f, umbrella) {
  const fur = f.fur, dk = mixColor(fur, '#1a0f08', 0.3), mz = mixColor(fur, '#f3dfb5', 0.6);
  const hat = f.hat ? `<path d="M11 21 Q30 4 49 21 Z" fill="${f.hat}"/><rect x="6" y="20" width="48" height="4" rx="2" fill="${f.hat}"/>` : '';
  const cap = f.cap ? `<path d="M15 22 Q30 9 45 22 Z" fill="${f.cap}"/><rect x="38" y="19" width="16" height="4" rx="2" fill="${f.cap}"/>` : '';
  const umb = umbrella ? `<path d="M-6 8 Q30 -26 66 8 Z" fill="#a8344a"/><path d="M-6 8 Q6 2 18 8 Q30 2 42 8 Q54 2 66 8" fill="#7d2133"/><line x1="30" y1="-12" x2="30" y2="58" stroke="#3a2a1c" stroke-width="2"/>` : '';
  const apron = f.apron ? `<path d="M20 52 L40 52 L42 84 Q30 87 18 84 Z" fill="#f6f1e7"/><path d="M20 52 Q30 46 40 52" stroke="#f6f1e7" stroke-width="2" fill="none"/>` : '';
  const patch = f.patch ? `<rect x="17" y="62" width="8" height="8" fill="#b0602c" transform="rotate(-8 21 66)"/><rect x="35" y="70" width="7" height="7" fill="#5c8f8a"/>` : '';
  const sat = f.satchel ? `<line x1="16" y1="46" x2="44" y2="76" stroke="#5a3a1c" stroke-width="3"/><rect x="38" y="70" width="16" height="13" rx="3" fill="#7a4b22"/><rect x="38" y="70" width="16" height="5" rx="2" fill="#5a3a1c"/>` : '';
  const gl = f.glasses ? `<circle cx="24.5" cy="30" r="4.2" stroke="#2a1a0e" stroke-width="1.4" fill="rgba(255,255,255,.25)"/><circle cx="35.5" cy="30" r="4.2" stroke="#2a1a0e" stroke-width="1.4" fill="rgba(255,255,255,.25)"/><line x1="28.7" y1="30" x2="31.3" y2="30" stroke="#2a1a0e" stroke-width="1.4"/>` : '';
  const body = `<ellipse cx="30" cy="98" rx="16" ry="3.5" fill="rgba(0,0,0,.25)"/>
    <g class="legs"><rect x="20" y="78" width="9" height="18" rx="4" fill="${dk}"/><rect x="31" y="78" width="9" height="18" rx="4" fill="${dk}"/></g>
    <path d="M13 48 Q30 36 47 48 L51 84 Q30 91 9 84 Z" fill="${f.top}"/>${apron}${patch}
    <rect x="6" y="48" width="9" height="24" rx="4.5" fill="${fur}"/><rect x="45" y="48" width="9" height="24" rx="4.5" fill="${fur}"/>${sat}
    <circle cx="17" cy="18" r="6.5" fill="${fur}"/><circle cx="43" cy="18" r="6.5" fill="${fur}"/><circle cx="17" cy="18" r="3.2" fill="${mz}"/><circle cx="43" cy="18" r="3.2" fill="${mz}"/>
    <circle cx="30" cy="31" r="15" fill="${fur}"/>
    <ellipse cx="30" cy="37" rx="7.5" ry="5.8" fill="${mz}"/><ellipse cx="30" cy="34.6" rx="2.8" ry="2" fill="#1a0f08"/>
    <circle cx="24.5" cy="29.5" r="1.7" fill="#1a0f08"/><circle cx="35.5" cy="29.5" r="1.7" fill="#1a0f08"/>
    <path d="M27 39 Q30 41.5 33 39" stroke="#1a0f08" stroke-width="1.4" fill="none" stroke-linecap="round"/>${gl}${hat}${cap}`;
  return `<svg viewBox="0 0 60 100" aria-hidden="true">${f.cub ? `<g transform="translate(6 22) scale(.8)">${body}</g>` : body}${umb}</svg>`;
}
function humanSVG(f, umbrella) {
  const hat = f.hat ? `<path d="M10 22 Q30 6 50 22 Z" fill="${f.hat}"/><rect x="6" y="21" width="48" height="4" rx="2" fill="${f.hat}"/>` : '';
  const cap = f.cap ? `<path d="M14 24 Q30 10 46 24 Z" fill="${f.cap}"/><rect x="38" y="21" width="16" height="4" rx="2" fill="${f.cap}"/>` : '';
  const umb = umbrella ? `<path d="M-6 8 Q30 -26 66 8 Z" fill="#a8344a"/><path d="M-6 8 Q6 2 18 8 Q30 2 42 8 Q54 2 66 8" fill="#7d2133"/><line x1="30" y1="-12" x2="30" y2="58" stroke="#3a2a1c" stroke-width="2"/>` : '';
  return `<svg viewBox="0 0 60 100" aria-hidden="true">
    <ellipse cx="30" cy="98" rx="16" ry="3.5" fill="rgba(0,0,0,.25)"/>
    <g class="legs"><rect x="21" y="78" width="7" height="18" rx="3" fill="#3a2a1c"/><rect x="32" y="78" width="7" height="18" rx="3" fill="#3a2a1c"/></g>
    <path d="M14 46 Q30 36 46 46 L50 84 Q30 90 10 84 Z" fill="${f.top}"/>
    <rect x="8" y="48" width="7" height="24" rx="3.5" fill="${f.skin}"/><rect x="45" y="48" width="7" height="24" rx="3.5" fill="${f.skin}"/>
    <circle cx="30" cy="30" r="14" fill="${f.skin}"/>
    <path d="M16 28 Q18 12 30 14 Q44 12 44 28 Q40 20 30 20 Q20 20 16 28Z" fill="${f.hair}"/>
    <circle cx="25" cy="31" r="1.6" fill="#1a0f08"/><circle cx="35" cy="31" r="1.6" fill="#1a0f08"/>
    <path d="M25 37 Q30 41 35 37" stroke="#1a0f08" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${hat}${cap}${umb}
  </svg>`;
}
function teddySVG() {
  return `<svg viewBox="0 0 60 60" aria-label="Teddy bear"><circle cx="16" cy="14" r="7" fill="#9a6131"/><circle cx="44" cy="14" r="7" fill="#9a6131"/><ellipse cx="30" cy="44" rx="17" ry="14" fill="#9a6131"/><circle cx="30" cy="24" r="14" fill="#b07440"/><ellipse cx="30" cy="29" rx="6" ry="4.5" fill="#e3c08e"/><circle cx="30" cy="27" r="2" fill="#2a1a0e"/><circle cx="24" cy="21" r="1.8" fill="#2a1a0e"/><circle cx="36" cy="21" r="1.8" fill="#2a1a0e"/><path d="M22 38 l8 4 8-4 -8 6z" fill="#a8344a"/><ellipse cx="30" cy="47" rx="8" ry="7" fill="#e3c08e"/></svg>`;
}
$('#teddy').innerHTML = teddySVG();

async function onPlace(p) {
  Snd.sfx('click');
  if (p === 'carnival') { S.returnTo = 'village'; go('carnival'); return; }
  if (p === 'bakery') { go('bakery'); return; }
  if (p === 'pond') { go('pond'); return; }
  if (WORKSHOPS[p]) { go('work', p); return; }
  if (p === 'garden') { go('garden'); return; }
  if (LOCKED[p]) {
    const [n, d] = LOCKED[p];
    await modal(`<p class="kicker">Coming soon</p><h2>${n}</h2><p>The ${n} is still getting ready for visitors. Peek through the window and you'll see what's coming:</p><p><b>${d}</b></p><p style="color:var(--ink-2);font-size:.9em">For now, the Wally's Bakery and the Fishing Pond are open.</p>`, [{ label: 'Back to the square', primary: true }]);
    return;
  }
  if (p === 'fountain') {
    const v = await modal(`<p class="kicker">Goldilocks Fountain</p><h2>Toss in a coin?</h2><p>In the middle of the fountain stands a bronze statue of Goldilocks beside the Three Bears. The legend is Honeybrook's heart. They say the fountain listens. Sometimes it changes the weather, sometimes it gives a little back, and sometimes it just sparkles.</p>`, [{ label: 'Not today' }, { label: 'Toss 1 coin', primary: true, disabled: S.coins < 1, value: 'toss' }]);
    if (v !== 'toss') return;
    S.coins -= 1; Snd.sfx('ding');
    const r = Math.random(); let msg;
    if (r < 0.25) { S.weather = S.weather === 'Rainy' ? 'Sunny' : 'Rainy'; msg = S.weather === 'Rainy' ? 'The sky darkens and a soft rain begins. Catfish weather.' : 'The clouds part and the sun comes out to say hello.'; }
    else if (r < 0.5) { S.coins += 4; msg = 'Four shiny coins wash up at the edge of the fountain.'; Snd.sfx('coin'); }
    else if (r < 0.7) { msg = 'A warm breeze carries the smell of fresh cookies across the square.'; }
    else if (r < 0.85) { msg = 'A tiny frog hops onto the rim, croaks once, and dives back in.'; }
    else { S.coins += 10; msg = 'The water glows golden for a moment. You find 10 coins.'; Snd.sfx('coin'); }
    updateHUD(); Village.populate(); toast(msg); return;
  }
  if (p === 'den' || p === 'hive' || p === 'rest') { go('area', p); return; }
  if (p === 'hollowroad') { go('work', 'hollow'); return; }
  if (p === 'woods') {
    if (S.woodsOpen) { const v = await modal(`<p class="kicker">The Northern Woods</p><h2>The lane is calling</h2><p>Past the fog, a clearing has appeared with a glass-slipper shop, a gingerbread cottage, and a bakery where Ash sets sourdough on the rack.</p>`, [{ label: 'Stay in Honeybrook' }, { label: 'Follow the lights', primary: true, value: 'lane' }]); if (v === 'lane') go('area', 'storybook-lane'); return; }
    const seen = Math.random() < 0.35;
    await modal(`<p class="kicker">The edge of town</p><h2>The Northern Woods</h2><p>North of Honeybrook, the trees grow close together and the light behaves strangely. Bear Hollow's elders forbid anyone to enter. Honeybrook honors the boundary.</p>${seen ? '<p><b>For a moment, a woman stands at the tree line, watching you. Then she\'s gone.</b></p>' : '<p>Fog sits low between the trunks. Somewhere deep inside, something chimes, like a glass slipper touching stone.</p>'}`, [{ label: 'Leave the woods be', primary: true }]);
    return;
  }
  if (p === 'bench') {
    await modal(`<p class="kicker">A small brass plaque</p><h2>Willie's Bench</h2><p style="font-family:var(--font-d);font-size:1.15em">"Sit a while. The fish will wait."</p><p>The wood is warm from the sun. From here you can hear the fountain, the bakery door, and the whole village going about its day.</p>`, [{ label: 'Sit a while', primary: true }]);
  }
}
$$('.spot').forEach(b => b.addEventListener('click', () => onPlace(b.dataset.place)));
$('#scene-village').addEventListener('click', e => { if (!e.target.closest('.villager')) $('#bubble').hidden = true; });

async function onTownPlace(place) {
  Snd.sfx('click');
  if (place === 'square') { go('village'); toast('Welcome to the Fair shops and little carnival.'); return; }
  if (place === 'den' || place === 'hive' || place === 'rest') { S.returnTo = 'town'; go('area', place); return; }
  if (place === 'bear-hollow') { S.returnTo = 'town'; go('area', 'bear-hollow'); return; }
  if (place === 'bakery') { S.returnTo = 'town'; go('bakery'); return; }
  if (['welcome','homes','bridge','school'].includes(place)) { go('home', 'town-' + place); return; }
}
$$('.town-marker').forEach(b => b.addEventListener('click', () => onTownPlace(b.dataset.townPlace)));


/* ------------------------------------------------------------------ */
/* Enterable Honeybrook rooms                                          */
/* ------------------------------------------------------------------ */
const STAY_PLACES = {
    'home-hearthwell': {img:'img/hearthwell-home.png',returnArea:'den',title:'Hearthwell House',kicker:'THE HOUSE FULL OF FAMILY',desc:'Nine pairs of boots by the door, a guitar by the hearth, and Big Mama Mary’s stories waiting at the table.',owner:'hearthwell',objects:[['hearth','🪵','Warm hearth','The fire pops softly. Big Mama Mary’s stories are waiting by the fire, and Buddy checks that everyone has a warm place to sit.'],['table','🍲','Family supper','A place is set for you. Honeybrook follows Sammy’s custom: you can eat first and share your story only if you want to.'],['mantel','🖼️','Willie’s picture','Willie’s photograph rests where everyone can see it. His name is woven into the family’s stories with tenderness.'],['guitar','🎸','The old guitar','Robin strums a tune. The children join in—some singing, some clapping, and Landric making up a very silly dance.']]},
    'home-amelia': {img:'img/amelia-home.png',returnArea:'den',title:'Amelia’s Cottage',kicker:'A LIGHT IN THE WINDOW',desc:'Spare blankets, a steady lantern, and a little shelter grown into a home for whoever needs one.',owner:'amelia',objects:[['lantern','🕯️','The lantern','Its warm light reaches the path outside. Amelia says the door should be easy to find on a stormy night.'],['table','🍎','A traveler’s plate','There is an apple and a small bowl set out. Amelia asks if you would like to sit and rest awhile.'],['blanket','🧺','Spare blankets','The blankets are clean, soft, and folded close to the door. Take one if the night turns cold.'],['window','🌧️','The rain window','Rain trickles down the glass. From here you can see the creek road and Tom’s bridge.']]},
    'home-harold': {img:'img/harold-home.png',returnArea:'den',title:'Harold’s House',kicker:'MAIL, MAPS & MEMORIES',desc:'Mail routes cover the walls. Harold’s satchel stays close by, even when he is home.',owner:'harold',objects:[['maps','🗺️','The route maps','Pins mark every stop along Harold’s route. He knows which doors welcome a knock and which letters should be left quietly.'],['desk','✉️','The letter desk','Harold sorts the mail carefully. “I DELIVER MAIL. I DO NOT DELIVER MESSAGES.” He remembers every word someone hopes to hear.'],['hook','🎒','The satchel hook','The hook is worn smooth. Harold’s satchel is not on it. It never leaves his side.'],['window','📮','The post window','A neighbor waves from the path. Harold is already checking that no letter was missed.']]},
    'home-wally': {img:'img/wally-home.png',returnArea:'den',title:'Wally’s Cottage',kicker:'THE LOAF THAT WAS HIS',desc:'There is flour on everything, and Amelia’s note beside one loaf: “This one is yours, Wally.”',owner:'wally',objects:[['oven','🔥','The little oven','Wally checks the warmth, then pulls out a honey bun. The whole kitchen smells like cinnamon and toasted honey.'],['table','🍞','Wally’s supper','Wally sits down to eat the loaf he meant to give away. A bear who feeds the town has to remember to feed himself, too.'],['note','💌','Amelia’s note','The note is simple and kind. Wally smiles; Harold made sure the loaf stayed right here.'],['window','🥖','The bakery path','You can smell the bakery from here. Wally invites you to visit the kitchen and bake something together.']]},
    'hollow-cottage': {img:'img/bear-hollow-cottage.png',returnArea:'bear-hollow',title:'Goldilocks and the Three Bears’ Cottage',kicker:'THE FIRST WELCOME IN THE HOLLOW',desc:'Mama Bear’s kettle still warms the hearth. Goldilocks keeps a place ready for a newcomer.',returnArea:'bear-hollow',objects:[['hearth','Mama Bear’s kettle','The old iron kettle hangs over the fire. Goldilocks stirs slowly, the way Mama Bear taught her.'],['table','A place at the table','Three familiar bowls and one guest bowl are set out. There is room for one more.'],['chair','Baby Bear’s little chair','The chair is small and sturdy. The cottage remembers every cub who found a home here.'],['window','The spring garden','Flowers bloom beside the cottage path and fountain. The hives hum softly beyond them.']]},
    'hollow-cabins': {img:'img/bear-hollow-cabin.png',returnArea:'bear-hollow',title:'Cabins for New Neighbors',kicker:'A HOME BUILT TOGETHER',desc:'Simple cabins rose one by one, with dry firewood, a warm hearth, and a place to rest.',returnArea:'bear-hollow',objects:[['hearth','The cabin hearth','A small fire keeps the room warm. Someone has left kindling ready for the next neighbor.'],['bed','A patched quilt','The bed is simple and clean. A newcomer can rest here before deciding what to do next.'],['wood','Shared firewood','The stack is close to the door and ready to use. No one has to earn a warm night.'],['table','A chair for a neighbor','There is a second chair at the table. A shared meal can begin without questions.']]},
    'town-welcome': {img:'img/welcome-house.png',returnArea:'town',title:'The Welcome House',kicker:'YOU CAN EAT FIRST',desc:'The first shelter grew into a house with a hearth, a table, and a door that stays open.',objects:[['hearth','🔥','A warm place to rest','Dry kindling catches. The creek hurries past outside, but here it is warm and safe.'],['table','🥣','Food first','A plate is ready before anyone asks where you came from. The house has room for one more.'],['bed','🛏️','A dry bed','There are clean blankets and a quiet corner for a traveler who needs a night’s rest.'],['door','🚪','The open door','A bee rests on the sign outside. It does not seem in a hurry to leave.']]},
    'town-homes': {img:'img/bear-hollow-cabin.png',returnArea:'town',title:'Neighbors’ Cottages',kicker:'BUILT TOGETHER, ONE BY ONE',desc:'Each cottage grew from what neighbors needed: a bed, a meal, a path, a place at the table.',objects:[['tools','🪚','Shared tools','A hammer and saw hang neatly on the wall. Tom lends them to neighbors who want to mend or build.'],['garden','🌼','The shared garden','The path winds past vegetables and flowers. Every family helps in its own way.'],['door','🏡','A cottage door','A neighbor welcomes you in without asking you to prove you belong.'],['table','🍯','A neighborly meal','Honey and bread are passed around. Nobody is hurried and nobody has to tell more than they want.']]},
    'town-school': {img:'img/schoolroom.png',returnArea:'town',title:'Honeybrook School',kicker:'LEARNING HAS MORE THAN ONE DOORWAY',desc:'Professor Honeywell changed his classroom after listening. Learn by reading, puzzling, building, or helping a friend.',objects:[['books','📚','The reading corner','Sammy sounds out a tricky word with a friend, one little piece at a time. A book is ready for you, too.'],['board','🧩','The puzzle table','Number tiles, patterns, and a puzzle with more than one way to solve it are spread across the table.'],['bench','🪵','The workbench','Lena builds a little bridge from craft sticks. Jamon asks if you can make one strong enough to hold a toy bear.'],['window','🔔','The school bell','The bell rings for a short stretch break. Then everyone comes back ready to read, build, and ask more questions.']]},
    'town-bridge': {img:'img/honeybrook-town-map.jpg',returnArea:'town',title:'Amelia & Tom’s Creek Bridge',kicker:'THE FIRST THING THEY BUILT',desc:'A repaired crossing and a small shelter became the beginning of Honeybrook.',objects:[['creek','💧','The rushing creek','The water hurries past. For one brief instant, a golden flash glimmers and is gone.'],['planks','🪵','Tom’s sturdy planks','Tom shows you how the boards fit. The bridge holds because each piece was measured, set, and repaired with care.'],['shelter','🏠','The first shelter','There is a dry blanket and a covered place to sit. Amelia hopes the next traveler finds it before the rain.'],['bee','🐝','The bee on the sign','A bee lands on the new Honeybrook sign and stays long after the light is gone.']]}
};
const Stay = {
  stayPlace:null,
  returnTarget:null,
  returnLabel(){
    const t=this.returnTarget;
    if(t?.scene==='town') return '← Back to Honeybrook';
    if(t?.scene==='village') return '← Back to Village Square';
    if(t?.scene==='area') return '← Back to '+(AREAS[t.area]?.name||'Honeybrook');
    if(t?.scene==='carnival') return '← Back to the Little Carnival';
    if(this.returnArea==='bear-hollow') return '← Back to Bear Hollow';
    if(this.returnArea==='den') return '← Back to Bear’s Den';
    return '← Back to Honeybrook';
  },
  goBack(){
    const t=this.returnTarget;
    if(t?.scene==='area'&&AREAS[t.area]) return go('area',t.area);
    if(t&&['town','village','carnival'].includes(t.scene)) return go(t.scene);
    if(AREAS[this.returnArea]) return go('area',this.returnArea);
    return go('town');
  },
  enter(key){
    this.stayPlace=key; const p=STAY_PLACES[key]; if(!p){go('town');return;}
    $('#home-title').textContent=p.title; $('#home-kicker').textContent=p.kicker; $('#home-description').textContent=p.desc;
    $('#home-bg').src=p.img || 'img/welcome-house.png'; $('#home-bg').alt='Interior of '+p.title;
    this.returnArea=p.returnArea || (key.startsWith('home-')?'den':'town');
    const room=$('#home-room'); room.className='home-room '+key; room.classList.toggle('home-cottage',key.startsWith('home-'));
    const box=$('#home-objects'); box.innerHTML='';
    p.objects.forEach(([id,icon,label])=>{const b=document.createElement('button');b.className='home-object object-'+(p.objects.findIndex(o=>o[0]===id)+1);b.dataset.homeObject=id;b.setAttribute('aria-label',label);b.innerHTML='<span class="home-hotspot-mark" aria-hidden="true"></span><b>'+esc(label)+'</b>';box.appendChild(b);});
    $('#home-back').textContent=this.returnLabel();
    if(p.owner){S.homeGift=S.homeGift||{};if(!S.homeGift[p.owner]){S.homeGift[p.owner]=true;const g=HOMES[p.owner].gift;if(g.coins)S.coins+=g.coins;if(g.glow)S.glow=clamp((S.glow||0)+g.glow,0,100);updateHUD();Save.push(true);toast(g.text);}}
  },
  async touch(id){
    Snd.sfx('click');const p=STAY_PLACES[this.stayPlace],item=p.objects.find(o=>o[0]===id);if(!item)return;
    if(this.stayPlace==='town-welcome'&&id==='table'){
      const v=await modal('<p class="kicker">The Welcome House</p><h2>What sounds good?</h2><p>Take a warm bowl, ask for bread, or sit quietly before you talk.</p>',[{label:'Warm porridge'},{label:'Bread and honey',primary:true},{label:'Just rest'}]);
      const line=v===0?'The bowl is warm in your paws.':v===1?'Bread and honey—food first, questions later.':'You rest without anyone asking a thing.';
      await modal('<p class="kicker">You are welcome here</p><h2>Stay as long as you need</h2><p>'+line+'</p>',[{label:'Thank you',primary:true}]);return;
    }
    if(this.stayPlace==='town-school'&&(id==='books'||id==='board'||id==='bench')){
      const intro=id==='books'?'Choose a book and find a cozy place to read.':id==='board'?'A pattern puzzle is waiting. How would you like to explore it?':'Build a bridge with craft sticks and test where it needs support.';
      const v=await modal('<p class="kicker">Honeybrook School · Explore a learning station</p><h2>'+esc(item[2])+'</h2><p>'+esc(intro)+'</p><p>What would you like to try?</p>',[{label:'Read and tell what I noticed',value:'read'},{label:'Try a puzzle or pattern',value:'puzzle'},{label:'Build and test an idea',value:'build'}]);
      if(v) await modal('<p class="kicker">Professor Honeywell</p><h2>That is a thoughtful way to learn.</h2><p>Take your time, explain your idea, and change it if you discover something new.</p>',[{label:'Back to class',primary:true}]);return;
    }
    await modal('<p class="kicker">'+esc(p.title)+'</p><h2>'+esc(item[2])+'</h2><p>'+esc(item[3])+'</p>',[{label:'Keep exploring',primary:true}]);
  }
};
const FriendBook = {
 async open(){
  const rows=FOLKS.map((f,i)=>'<div class="neighbor-row"><span class="neighbor-face">'+(f.human?'🧑':'🐻')+'</span><span class="neighbor-name"><b>'+esc(f.name)+'</b><small>'+heartStr(f.name)+'</small></span><button class="btn btn-small" data-val="n'+i+'">Visit</button></div>').join('');
  const result=await modal('<p class="kicker">Honeybrook neighbors</p><h2>Find someone to visit</h2><p>Everyone is listed here, even when they are away from the square. Visit once each day to grow a friendship.</p><div class="neighbor-list">'+rows+'</div>',[{label:'Close'}]);
  if(typeof result!=='string'||result[0]!=='n')return;
  const f=FOLKS[Number(result.slice(1))];if(!f)return;
  const already=(S.talked||{})[f.name]===S.day;
  const line=pick(f.lines).replace('{name}',S.name);
  const answer=await modal('<p class="kicker">A visit with '+esc(f.name)+'</p><h2>'+esc(f.name)+' <span style="color:var(--berry)">'+heartStr(f.name)+'</span></h2><p>'+esc(line)+'</p><p>What would you like to say?</p>',[{label:'Tell me more'},{label:'I’m glad I found you',primary:true},{label:'Ask what they are working on'}]);
  if(!already){S.talked=S.talked||{};S.talked[f.name]=S.day;addFriend(f.name,1);Save.push(true);}
  else toast('You already visited '+f.name+' today. Come by tomorrow for another friendship point.');
  if(answer!==undefined){const follow=pick(['They smile and save you a seat.','They tell you a little more about the day.','You share a laugh before they get back to work.']);await modal('<p class="kicker">Honeybrook friendship</p><h2>'+esc(f.name)+'</h2><p>'+esc(follow)+'</p><p>'+heartStr(f.name)+'</p>',[{label:'Back to the neighbors',primary:true}]);}
  this.open();
 }
};
/* ------------------------------------------------------------------ */
/* Weather canvas (rain + evening lantern glow)                       */
/* ------------------------------------------------------------------ */
const wx = $('#wx'); const drops = Array.from({ length: 160 }, () => ({ x: rand(0, W), y: rand(0, H), s: rand(900, 1400), l: rand(14, 28) }));
let wxLast = performance.now();
const LANTERNS = { village: [[10, 76], [62, 37.5], [47.5, 36.5], [81.5, 61], [19.5, 41]] };
function wxLoop(now) {
  const dt = Math.min(0.05, (now - wxLast) / 1000); wxLast = now;
  const c = ctxOf(wx); c.clearRect(0, 0, W, H);
  const outdoor = S.scene === 'village' || S.scene === 'town' || S.scene === 'pond' || S.scene === 'garden' || (S.scene === 'work' && S.wsPlace === 'hollow') || (S.scene === 'area' && S.area !== 'room');
  if (outdoor && S.slot === 2 && S.scene === 'village') {
    for (const [lx, ly] of LANTERNS.village) {
      const x = lx / 100 * W, y = ly / 100 * H, g = c.createRadialGradient(x, y, 0, x, y, 120);
      g.addColorStop(0, 'rgba(255,210,120,.55)'); g.addColorStop(1, 'rgba(255,210,120,0)');
      c.fillStyle = g; c.fillRect(x - 120, y - 120, 240, 240);
    }
  }
  if (outdoor && S.weather === 'Rainy') {
    c.strokeStyle = 'rgba(220,230,255,.45)'; c.lineWidth = 2; c.beginPath();
    for (const d of drops) { d.y += d.s * dt; d.x -= d.s * 0.12 * dt; if (d.y > H) { d.y = -30; d.x = rand(0, W + 100); } c.moveTo(d.x, d.y); c.lineTo(d.x + d.l * 0.12, d.y - d.l); }
    c.stroke();
  }
  requestAnimationFrame(wxLoop);
}
requestAnimationFrame(wxLoop);

/* ------------------------------------------------------------------ */
/* Bakery                                                             */
/* ------------------------------------------------------------------ */
const bc = $('#bake-canvas');
const Bakery = {
  st: null, raf: 0,
  async enter() {
    this.st = null; this.renderCard(); $('#bake-controls').innerHTML = '';
    cancelAnimationFrame(this.raf); this.last = performance.now(); this.loop();
    if (S.usedSlot) return;
    const ordersFor = id => S.orders.some(o => o.kind === 'cookie' && o.recipe === id);
    const grid = RECIPES.map(r => `<button class="recipe-btn" data-val="${r.id}"><b>${esc(r.name)}${ordersFor(r.id) ? '<span class="tag">Ordered</span>' : ''}</b><small>${esc(r.note)}</small></button>`).join('');
    const v = await modal(`<p class="kicker">Wally's Bakery · ${SLOTS[S.slot]}</p><h2>What are we baking?</h2><p>Measure, mix, and bake one batch. Recipes marked <span class="tag" style="margin:0">Ordered</span> are wanted on the order board.</p><div class="recipe-grid">${grid}</div>`, [{ label: 'Back to the square' }]);
    if (typeof v !== 'string') { go('village'); return; }
    this.start(RECIPES.find(r => r.id === v));
  },
  start(r) {
    this.st = { r, phase: 'measure', i: 0, fill: 0, pouring: false, drip: 0, scores: [], results: [], mix: 0, mixT: 0, mixAngle: 0, angle: null, bake: 0, bakeSpeed: rand(0.085, 0.12), bakeScore: 0, done: false, msg: '' };
    S.usedSlot = true; this.renderCard(); this.controls();
  },
  renderCard() {
    const st = this.st, card = $('#recipe-card');
    if (!st) { card.innerHTML = `<h3>Wally's Bakery</h3><p style="margin:.2em 0;font-size:.92em;color:var(--ink-2)">${S.usedSlot ? 'The oven is cooling. Head back to the square to let time pass.' : 'Pick a recipe to begin.'}</p>`; return; }
    const ing = st.r.ing.map(([n, amt], k) => {
      const cls = st.phase !== 'measure' || k < st.i ? 'done' : k === st.i ? 'now' : '';
      const res = st.results[k] ? ` <small style="color:var(--ink-2)">(${st.results[k]})</small>` : '';
      return `<li class="${cls}">${FRAC[amt]} cup ${esc(n)}${res}</li>`;
    }).join('');
    card.innerHTML = `<h3>${esc(st.r.name)}</h3><ol>${ing}<li class="${st.phase === 'mix' ? 'now' : st.phase === 'bake' || st.phase === 'done' ? 'done' : ''}">Mix until smooth</li><li class="${st.phase === 'bake' ? 'now' : st.phase === 'done' ? 'done' : ''}">Bake until golden</li></ol>`;
  },
  controls() {
    const box = $('#bake-controls'), st = this.st; box.innerHTML = '';
    const add = (label, cls, fn, hold) => {
      const b = document.createElement('button'); b.className = 'btn btn-lg ' + cls; b.textContent = label; box.appendChild(b);
      if (hold) {
        const down = e => { e.preventDefault(); fn(true); }, up = () => fn(false);
        b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
      } else b.onclick = fn;
      return b;
    };
    if (!st) return;
    if (st.phase === 'measure') add('Hold to pour', 'btn-primary', on => this.pour(on), true);
    if (st.phase === 'measure-next') add(st.i < st.r.ing.length ? 'Next ingredient' : 'Time to mix', 'btn-sage', () => { st.phase = st.i < st.r.ing.length ? 'measure' : 'mix'; st.fill = 0; st.drip = 0; st.msg = ''; this.renderCard(); this.controls(); });
    if (st.phase === 'mix') add('Stir', '', () => this.stir(0.022));
    if (st.phase === 'bake-ready') add('Put them in the oven', 'btn-primary', () => { st.phase = 'bake'; this.renderCard(); this.controls(); Snd.sfx('click'); });
    if (st.phase === 'bake') add('Take them out', 'btn-primary', () => this.takeOut());
  },
  pour(on) {
    const st = this.st; if (!st || st.phase !== 'measure') return;
    if (on && !st.pouring) Snd.sfx('pour');
    if (!on && st.pouring) { st.pouring = false; st.drip = st.r.ing[st.i][4] || 0.025; setTimeout(() => this.judgeMeasure(), 650); }
    else st.pouring = on;
  },
  judgeMeasure() {
    const st = this.st; if (!st || st.phase !== 'measure' || st.pouring) return;
    const target = st.r.ing[st.i][1], diff = Math.abs(st.fill - target);
    let sc = st.fill > 1 ? 0 : clamp(Math.round(100 - diff * 420), 0, 100);
    const label = st.fill > 1 ? 'spilled' : sc >= 92 ? 'perfect' : sc >= 72 ? 'close' : sc >= 45 ? 'a little off' : 'way off';
    st.scores.push(sc); st.results.push(label); st.msg = label === 'perfect' ? 'Perfect measure!' : label === 'spilled' ? 'Oops, it spilled over.' : label === 'close' ? 'Close enough to count.' : label === 'a little off' ? 'A little off. It\'ll still bake.' : 'Way off. Grandma would raise an eyebrow.';
    Snd.sfx(sc >= 72 ? 'good' : sc >= 45 ? 'meh' : 'bad');
    st.i++; st.phase = 'measure-next'; this.renderCard(); this.controls();
  },
  stir(amount) {
    const st = this.st; if (!st || st.phase !== 'mix') return;
    st.mix = Math.min(1, st.mix + amount * (S.owned.spoon ? 1.45 : 1));
    if (st.mix >= 1) {
      const sc = clamp(Math.round(100 - Math.max(0, st.mixT - 6) * 9), 30, 100);
      st.mixScore = sc; st.phase = 'bake-ready'; st.msg = sc >= 85 ? 'Smooth as silk.' : 'All mixed. A bit slow, but it\'ll do.';
      Snd.sfx('good'); this.renderCard(); this.controls();
    }
  },
  takeOut() {
    const st = this.st; if (!st || st.phase !== 'bake') return;
    st.bakeScore = clamp(Math.round(100 - Math.abs(st.bake - 0.62) * 430), 0, 100);
    st.phase = 'done'; this.renderCard(); $('#bake-controls').innerHTML = ''; this.finish();
  },
  async finish() {
    const st = this.st;
    const measure = st.scores.reduce((a, b) => a + b, 0) / st.scores.length;
    const total = Math.min(100, Math.round(measure * 0.4 + (st.mixScore || 40) * 0.2 + st.bakeScore * 0.4 + (st.r.id === 'honey' ? glowBonus() : 0)));
    const nStars = total >= 85 ? 3 : total >= 65 ? 2 : total >= 40 ? 1 : 0;
    const bakeWord = st.bake < 0.5 ? 'a little pale' : st.bake < 0.56 ? 'just shy of golden' : st.bake <= 0.68 ? 'perfectly golden' : st.bake < 0.78 ? 'a touch dark' : 'burnt';
    Snd.sfx(nStars >= 2 ? 'fanfare' : nStars === 1 ? 'meh' : 'bad');
    const name = nStars === 0 ? `Crumbled ${st.r.name}` : nStars === 3 ? `Ribbon-worthy ${st.r.name}` : st.r.name;
    let html = `<p class="kicker">Out of the oven</p><h2>${esc(name)}</h2><div class="prize"><canvas id="prize-c" width="480" height="320"></canvas></div>
      <p style="text-align:center">${stars(nStars)}</p>
      <ul class="list"><li class="row"><div class="grow">Measuring</div><b>${Math.round(measure)}</b></li><li class="row"><div class="grow">Mixing</div><b>${st.mixScore || 40}</b></li><li class="row"><div class="grow">Baking <small>${bakeWord}</small></div><b>${st.bakeScore}</b></li></ul>`;
    if (nStars === 0) html += `<p>When the cookie crumbles, you bake another batch. These went to the birds, who were thrilled.</p>`;
    else html += `<p>Score <b>${total}</b>. The batch went into your basket.</p>`;
    setTimeout(() => { const pc = $('#prize-c'); if (pc) drawCookieTray(pc.getContext('2d'), 480, 320, st.r, st.bake, 1); }, 30);
    if (nStars > 0) {
      const item = { kind: 'cookie', recipe: st.r.id, name: st.r.name, stars: nStars, score: total, day: S.day };
      S.basket.push(item);
      recordBest('baked', st.r.name, total);
    }
    updateHUD();
    const canDeliver = S.orders.some(o => findItemFor(o));
    const v = await modal(html, canDeliver ? [{ label: 'Back to the square', primary: true, value: 'home' }, { label: 'See orders', sage: true, value: 'orders' }] : [{ label: 'Back to the square', primary: true, value: 'home' }]);
    await leaveActivity();
    if (v === 'orders') showOrders();
  },
  loop() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (S.scene === 'bakery') { this.update(dt); this.draw(); }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  update(dt) {
    const st = this.st; if (!st) return;
    if (st.phase === 'measure') {
      const speed = st.r.ing[st.i][3];
      if (st.pouring) { st.fill += speed * dt; if (Math.random() < dt * 6) Snd.sfx('pour'); }
      else if (st.drip > 0) { const d = Math.min(st.drip, 0.12 * dt * 1.4); st.fill += d; st.drip -= d; }
      if (st.fill > 1.02 && st.pouring) { st.pouring = false; this.judgeMeasure(); }
    }
    if (st.phase === 'mix') { st.mixT += dt; if (st.mixT > 14 && st.mix < 1) { st.mixScore = Math.round(st.mix * 70); st.mix = 1; st.phase = 'bake-ready'; st.msg = 'Your arm got tired, but it\'s mixed enough.'; Snd.sfx('meh'); this.renderCard(); this.controls(); } }
    if (st.phase === 'bake') { st.bake += st.bakeSpeed * dt * (st.bake > 0.5 ? 0.85 : 1.15); if (st.bake >= 1.05) this.takeOut(); }
  },
  draw() {
    const c = ctxOf(bc); c.clearRect(0, 0, W, H); const st = this.st; if (!st) return;
    const r = st.r;
    // message ribbon
    const header = st.phase === 'measure' ? `Fill to the ${FRAC[r.ing[st.i][1]]} cup line: ${r.ing[st.i][0]}` : st.phase === 'measure-next' ? st.msg : st.phase === 'mix' ? 'Stir in circles inside the bowl!' : st.phase === 'bake-ready' ? st.msg : st.phase === 'bake' ? bakeCue(st.bake) : '';
    if (header) {
      c.font = '700 34px Fraunces, Georgia, serif'; const tw = c.measureText(header).width + 60;
      c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, 560 - tw / 2, 82, tw, 58, 29); c.fill();
      c.fillStyle = '#3a2a1c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(header, 560, 112);
    }
    if (st.phase === 'measure' || st.phase === 'measure-next') {
      const k = Math.min(st.i, r.ing.length - 1), idx = st.phase === 'measure' ? st.i : st.i - 1, ing = r.ing[idx];
      drawCup(c, 560, 400, 230, 340, st.phase === 'measure' ? st.fill : Math.min(st.fill, 1.05), ing[2], ing[1], st.pouring || st.drip > 0.001);
      void k;
    }
    if (st.phase === 'mix' || st.phase === 'bake-ready') drawBowl(c, 600, 700, r, st);
    if (st.phase === 'bake' || st.phase === 'done') {
      // oven window
      c.fillStyle = '#2a1a10'; roundRect(c, 250, 230, 680, 520, 40); c.fill();
      c.strokeStyle = '#7a5032'; c.lineWidth = 14; roundRect(c, 250, 230, 680, 520, 40); c.stroke();
      const glow = c.createRadialGradient(590, 520, 40, 590, 520, 380); glow.addColorStop(0, 'rgba(255,150,60,.55)'); glow.addColorStop(1, 'rgba(120,40,10,.1)');
      c.fillStyle = glow; roundRect(c, 270, 250, 640, 480, 30); c.fill();
      c.save(); c.translate(290, 330); drawCookieTray(c, 600, 380, r, st.bake, 0.98); c.restore();
      if (S.owned.thermo) {
        const x = 300, y = 785, w = 580; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, x - 14, y - 14, w + 28, 52, 26); c.fill();
        const gr = c.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#f3dfb5'); gr.addColorStop(0.62, '#d99a45'); gr.addColorStop(0.8, '#8a4b1f'); gr.addColorStop(1, '#2b1a10');
        c.fillStyle = gr; roundRect(c, x, y, w, 24, 12); c.fill();
        c.strokeStyle = '#2f6b8a'; c.lineWidth = 4; c.strokeRect(x + w * 0.56, y - 4, w * 0.12, 32);
        c.fillStyle = '#a8344a'; c.beginPath(); const px = x + w * clamp(st.bake, 0, 1); c.moveTo(px, y - 6); c.lineTo(px - 9, y - 18); c.lineTo(px + 9, y - 18); c.fill();
      }
    }
  }
};
function bakeCue(t) { return t < 0.25 ? 'The oven is warm. Watch the color...' : t < 0.45 ? 'The kitchen smells buttery...' : t < 0.56 ? 'The edges are starting to turn...' : t < 0.68 ? 'Golden brown!' : t < 0.8 ? 'Something smells toasty...' : 'Is that smoke?!'; }
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function drawCup(c, cx, top, w, h, fill, color, target, pouring) {
  const x = cx - w / 2, bot = top + h;
  // stream
  if (pouring) { c.fillStyle = color; c.globalAlpha = .9; c.fillRect(cx - 9 + Math.sin(performance.now() / 60) * 2, 150, 18, bot - 150 - fill * h * 0.98); c.globalAlpha = 1; }
  // glass
  c.save(); roundRect(c, x, top, w, h, 26); c.clip();
  c.fillStyle = 'rgba(240,248,252,.82)'; c.fillRect(x, top, w, h);
  const fh = clamp(fill, 0, 1.05) * h; c.fillStyle = color; c.fillRect(x, bot - fh, w, fh);
  c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 18, top, 22, h);
  c.restore();
  c.strokeStyle = 'rgba(80,100,110,.8)'; c.lineWidth = 6; roundRect(c, x, top, w, h, 26); c.stroke();
  // handle
  c.beginPath(); c.lineWidth = 16; c.strokeStyle = 'rgba(200,220,230,.9)'; c.arc(x + w + 10, top + h * 0.45, 60, -1.1, 1.1); c.stroke();
  // tick marks
  c.font = '700 22px Nunito, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
  for (const [v, l] of Object.entries(FRAC)) { const y = bot - v * h; c.fillStyle = '#4a5a62'; c.fillRect(x, y - 1.5, 28, 3); c.fillText(l, x + 34, y); }
  c.fillStyle = '#4a5a62'; c.fillRect(x, top + 1, 28, 3); c.fillText('1', x + 34, top + 12);
  // target line
  const ty = bot - target * h;
  c.setLineDash([14, 10]); c.strokeStyle = '#a8344a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 30, ty); c.lineTo(x + w + 30, ty); c.stroke(); c.setLineDash([]);
  c.font = '800 26px Nunito, sans-serif'; c.fillStyle = '#a8344a'; roundRect(c, x - 175, ty - 22, 130, 44, 22); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('fill here', x - 110, ty + 1);
  if (fill > 1) { c.fillStyle = color; c.beginPath(); c.ellipse(cx + 40, bot + 14, 140, 18, 0, 0, Math.PI * 2); c.fill(); }
}
function mixColor(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; }
function drawBowl(c, cx, cy, r, st) {
  const p = st.mix;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(cx, cy + 150, 280, 40, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#e9e2d4'; c.beginPath(); c.ellipse(cx, cy - 40, 290, 80, 0, 0, Math.PI * 2); c.fill();
  // contents
  c.save(); c.beginPath(); c.ellipse(cx, cy - 34, 262, 64, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = r.dough; c.fillRect(cx - 300, cy - 120, 600, 200);
  const blobs = r.ing.length, t = performance.now() / 1000;
  for (let i = 0; i < 14; i++) {
    const col = r.ing[i % blobs][2], ang = i * 0.9 + st.mixAngle * 0.4 + t * 0.1, rad = 40 + (i * 37) % 200;
    c.globalAlpha = (1 - p) * 0.95; c.fillStyle = col; c.beginPath(); c.ellipse(cx + Math.cos(ang) * rad, cy - 34 + Math.sin(ang) * rad * 0.25, 46, 16, ang, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  if (r.chips) { c.fillStyle = r.chips; for (let i = 0; i < 18; i++) { const a = i * 2.4 + (st.mixAngle || 0) * 0.5; c.beginPath(); c.arc(cx + Math.cos(a) * (60 + i * 11), cy - 34 + Math.sin(a) * (14 + i * 2.6), 7, 0, Math.PI * 2); c.fill(); } }
  // swirl lines
  c.strokeStyle = 'rgba(120,80,40,.25)'; c.lineWidth = 4;
  for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(cx, cy - 34, 60 * k, 15 * k, 0, (st.mixAngle || 0) + k, (st.mixAngle || 0) + k + 2.2); c.stroke(); }
  c.restore();
  // bowl body
  const g = c.createLinearGradient(cx - 290, 0, cx + 290, 0); g.addColorStop(0, '#5f8fa8'); g.addColorStop(0.5, '#8fbfd4'); g.addColorStop(1, '#4b7891');
  c.fillStyle = g; c.beginPath(); c.moveTo(cx - 290, cy - 40); c.bezierCurveTo(cx - 280, cy + 120, cx - 160, cy + 160, cx, cy + 160); c.bezierCurveTo(cx + 160, cy + 160, cx + 280, cy + 120, cx + 290, cy - 40); c.ellipse(cx, cy - 40, 290, 80, 0, 0, Math.PI, false); c.fill();
  c.strokeStyle = '#fbf3e2'; c.lineWidth = 6; c.beginPath(); c.ellipse(cx, cy - 40, 290, 80, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#fbf3e2'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(cx - 180 + i * 90, cy + 60 + Math.sin(i) * 10, 10, 0, Math.PI * 2); c.fill(); }
  // spoon
  const sp = st.spoon || { x: cx + 120, y: cy - 60 };
  c.save(); c.translate(sp.x, sp.y); c.rotate(-0.6);
  c.fillStyle = S.owned.spoon ? '#e2b23b' : '#b07a45'; roundRect(c, -10, -260, 20, 250, 10); c.fill(); c.beginPath(); c.ellipse(0, 0, 30, 44, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  // progress
  const bx = 340, by = 180;
  c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, bx - 14, by - 14, 468, 56, 28); c.fill();
  c.fillStyle = '#e3d3b2'; roundRect(c, bx, by, 440, 28, 14); c.fill();
  c.fillStyle = '#6f8f5e'; roundRect(c, bx, by, Math.max(28, 440 * p), 28, 14); c.fill();
  if (st.phase === 'mix') { c.fillStyle = '#3a2a1c'; c.font = '800 24px Nunito, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(Math.max(0, 14 - st.mixT).toFixed(0) + 's', bx + 470, by + 14); }
}
function drawCookieTray(c, w, h, r, t, scale) {
  // tray
  c.fillStyle = '#8f949a'; roundRect(c, 10, h * 0.18, w - 20, h * 0.74, 18); c.fill();
  c.fillStyle = '#b4b9be'; roundRect(c, 20, h * 0.18 + 8, w - 40, h * 0.74 - 16, 14); c.fill();
  const raw = r.dough, stops = [[0, '#f3dfb5'], [0.35, '#efd096'], [0.62, '#d99a45'], [0.76, '#a8642a'], [0.9, '#5a3418'], [1, '#2b1a10']];
  const tt = clamp(t, 0, 1); let k = 0; while (k < stops.length - 2 && tt > stops[k + 1][0]) k++;
  let col = mixColor(stops[k][1], stops[k + 1][1], (tt - stops[k][0]) / (stops[k + 1][0] - stops[k][0]));
  if (t < 0.2) col = mixColor(raw, col, t / 0.2);
  const pos = [[0.2, 0.38], [0.5, 0.38], [0.8, 0.38], [0.2, 0.7], [0.5, 0.7], [0.8, 0.7]];
  const rad = Math.min(w, h) * 0.12 * scale * (1 + clamp(t, 0, 0.6) * 0.25);
  for (const [px, py] of pos) {
    const x = px * w, y = py * h;
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + 3, y + 6, rad, rad * 0.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rad, rad * 0.82, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(90,50,20,.25)'; c.lineWidth = 3; c.beginPath(); c.arc(x - rad * 0.2, y - rad * 0.1, rad * 0.4, 0.4, 2.2); c.stroke();
    if (r.chips) { c.fillStyle = r.chips; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + Math.cos(k * 1.3 + px * 9) * rad * 0.5, y + Math.sin(k * 1.3 + py * 7) * rad * 0.42, rad * 0.11, 0, Math.PI * 2); c.fill(); } }
    if (r.id === 'snick') { c.fillStyle = 'rgba(160,90,40,.5)'; for (let k = 0; k < 12; k++) { c.fillRect(x + Math.cos(k * 2.1) * rad * 0.6, y + Math.sin(k * 1.7) * rad * 0.5, 3, 3); } }
    if (r.id === 'honey') { c.fillStyle = 'rgba(255,200,80,.55)'; c.beginPath(); c.ellipse(x, y - rad * 0.2, rad * 0.35, rad * 0.2, 0, 0, Math.PI * 2); c.fill(); }
  }
  if (t > 0.82) { c.fillStyle = `rgba(80,80,80,${clamp((t - 0.82) * 2, 0, .5)})`; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(w * (0.2 + k * 0.13), h * 0.15 - ((performance.now() / 20 + k * 30) % 60), 22, 0, Math.PI * 2); c.fill(); } }
}
// mixing input: stir in circles inside the bowl
(() => {
  let down = false;
  bc.addEventListener('pointerdown', e => { down = true; bc.setPointerCapture(e.pointerId); move(e); });
  bc.addEventListener('pointerup', () => { down = false; if (Bakery.st) Bakery.st.angle = null; });
  bc.addEventListener('pointermove', move);
  function move(e) {
    const st = Bakery.st; if (!st || (st.phase !== 'mix')) return;
    const p = toLogical(e, bc); const cx = 600, cy = 666;
    st.spoon = { x: clamp(p.x, cx - 240, cx + 240), y: clamp(p.y, cy - 70, cy + 40) };
    if (!down) return;
    const a = Math.atan2((p.y - cy) * 3.5, p.x - cx);
    if (st.angle != null) { let d = a - st.angle; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) < 1.2) { Bakery.stir(Math.abs(d) / (2 * Math.PI) * 0.12); st.mixAngle = (st.mixAngle || 0) + d; } }
    st.angle = a;
  }
})();
addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.repeat) return;
  if (S.scene === 'bakery' && Bakery.st?.phase === 'measure') { e.preventDefault(); Bakery.pour(true); }
});
addEventListener('keyup', e => { if (e.code === 'Space' && S.scene === 'bakery' && Bakery.st?.phase === 'measure') Bakery.pour(false); });

/* ------------------------------------------------------------------ */
/* Fishing Pond                                                       */
/* ------------------------------------------------------------------ */
const pc = $('#pond-canvas');
const Pond = {
  st: null, raf: 0,
  enter() {
    this.st = { phase: S.usedSlot ? 'rest' : 'ready', casts: 3, power: 0, pdir: 1, aim: { x: W / 2, y: 700 }, bob: null, t: 0, ripples: [], shadows: [], msg: '', reel: null, catches: 0 };
    for (let i = 0; i < 5; i++) this.st.shadows.push({ x: rand(200, 1300), y: rand(560, 900), vx: rand(-30, 30), vy: rand(-8, 8), s: rand(0.6, 1.3) });
    this.info(); this.controls();
    cancelAnimationFrame(this.raf); this.last = performance.now(); this.loop();
  },
  info() {
    const tip = S.slot === 0 ? 'Morning: trout are biting.' : S.slot === 2 ? 'Evening: catfish come out to feed.' : 'Afternoon: bass are lazy in the sun.';
    const wxTip = S.weather === 'Rainy' ? ' Rain makes the fish bite faster.' : S.weather === 'Cloudy' ? ' Clouds make the fish a little bolder.' : '';
    $('#pond-info').innerHTML = this.st.phase === 'rest' ? `<b>Fishing Pond</b><br>You've fished this part of the day. Head back to the square to let time pass.` : `<b>Casts left: ${this.st.casts}</b><br>${tip}${wxTip}<br><span style="color:var(--ink-2)">Cast farther for bigger fish.</span>`;
  },
  controls() {
    const box = $('#pond-controls'); box.innerHTML = '';
    if (this.st.phase === 'rest' || this.st.phase === 'out') { const b = document.createElement('button'); b.className = 'btn btn-lg btn-primary'; b.textContent = 'Back to the square'; b.onclick = () => leaveActivity(); box.appendChild(b); }
  },
  loop() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (S.scene === 'pond' && this.st) { this.update(dt); this.draw(); }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  rollFish(dist) {
    const lure = S.owned.lure ? 1 : 0;
    const w = { bluegill: 30 - dist * 15, crappie: 18, trout: S.slot === 0 ? 22 : 5, bass: 6 + dist * 20 + (S.slot === 1 ? 6 : 0) + lure * 6, catfish: (S.slot === 2 ? 20 : 3) + (S.weather === 'Rainy' ? 14 : 0) + dist * 8 + lure * 4, golden: (S.weather === 'Sunny' ? 2.2 : 0.6) + lure * 2.5, teddy: S.found?.teddy ? 0 : 3, boot: 4 };
    let tot = 0; for (const k in w) tot += Math.max(0, w[k]); let r = Math.random() * tot;
    for (const k in w) { r -= Math.max(0, w[k]); if (r <= 0) return FISH.find(f => f.id === k); }
    return FISH[0];
  },
  cast() {
    const st = this.st, p = st.power;
    const tx = clamp(W / 2 + (st.aim.x - W / 2) * (0.35 + p * 0.65), 220, 1280), ty = lerp(900, 520, p);
    st.bob = { sx: 760, sy: 640, x: 760, y: 640, tx, ty, t: 0, dip: 0 };
    st.phase = 'flying'; st.dist = p; st.casts--; S.usedSlot = true;
    this.info(); Snd.sfx('click');
  },
  startWait() {
    const st = this.st; st.phase = 'waiting'; st.t = 0;
    const speed = S.weather === 'Rainy' ? 0.65 : S.weather === 'Cloudy' ? 0.85 : 1;
    st.biteAt = rand(2.2, 5.5) * speed; st.nibbles = [];
    const n = Math.floor(rand(0, 3)); for (let i = 0; i < n; i++) st.nibbles.push(rand(0.8, st.biteAt - 0.4));
    st.fish = this.rollFish(st.dist);
    const sh = st.shadows[0]; sh.target = true;
  },
  hook() {
    const st = this.st;
    if (st.phase === 'waiting') { st.phase = 'missed'; st.msg = 'Too soon! The fish swam off.'; Snd.sfx('bad'); st.t = 0; return; }
    if (st.phase !== 'bite') return;
    const f = st.fish;
    if (f.junk) { this.land(); return; }
    st.phase = 'reel'; Snd.sfx('bite');
    st.reel = { fish: 0.5, fv: 0, ftarget: 0.5, ft: 0, bar: 0.3, bv: 0, h: S.owned.rod ? 0.33 : 0.25, prog: 0.3, hold: false };
  },
  land() {
    const st = this.st, f = st.fish; st.phase = 'landing';
    Snd.sfx('splash'); setTimeout(() => this.result(f), 400);
  },
  async result(f) {
    const st = this.st; let html, actions = [{ label: 'Keep fishing', primary: true }];
    const weight = f.junk ? 0 : Math.round(lerp(f.min, f.max, Math.pow(Math.random(), 1.6 - st.dist * 0.6)) * 10) / 10;
    const score = f.junk ? 0 : Math.round(clamp(weight / f.max, 0, 1) * 75 + f.diff * 15 + (f.rare ? 10 : 0));
    setTimeout(() => { const pcv = $('#prize-c'); if (pcv) drawFish(pcv.getContext('2d'), 480, 320, f); }, 30);
    if (f.id === 'teddy') {
      S.found = S.found || {}; S.found.teddy = true; S.coins += 15; S.glow = clamp((S.glow || 0) + 5, 0, 100); Snd.sfx('good');
      html = `<p class="kicker">Something fuzzy on the line</p><h2>A Soggy Teddy Bear</h2><div class="prize"><canvas id="prize-c" width="480" height="320"></canvas></div><p>${f.fact}</p><p>You dry him off and return him to Landric, who has been looking everywhere. He gives you <b>15 coins</b> and a big hug.</p>`;
    } else if (f.id === 'boot') {
      Snd.sfx('meh');
      html = `<p class="kicker">Well, would you look at that</p><h2>An Old Boot</h2><div class="prize"><canvas id="prize-c" width="480" height="320"></canvas></div><p>${f.fact}</p>`;
    } else {
      Snd.sfx('fanfare');
      html = `<p class="kicker">You caught a fish</p><h2>${f.name}</h2><div class="prize"><canvas id="prize-c" width="480" height="320"></canvas></div><p style="text-align:center;font-size:1.3em;font-family:var(--font-d)"><b>${weight.toFixed(1)} lb</b></p><p>${f.fact}</p>`;
      if (f.rare) { actions = [{ label: 'Keep it', primary: true, value: 'keep' }, { label: 'Let it go and make a wish', sage: true, value: 'wish' }]; }
    }
    const v = await modal(html, actions);
    if (!f.junk) {
      if (v === 'wish') {
        S.ribbons++; S.coins += 25; S.glow = clamp((S.glow || 0) + 15, 0, 100); Snd.sfx('fanfare'); updateHUD();
        await modal(`<p class="kicker">The legend is true</p><h2>Your wish is granted</h2><p>The Golden Carp flicks its tail and the whole pond shimmers. You find <b>25 coins</b> on the dock and a special <b>Kindness Ribbon</b> tied to your rod.</p>`, [{ label: 'Wonderful', primary: true }]);
      } else {
        S.basket.push({ kind: 'fish', fish: f.id, name: f.name, weight, score, day: S.day });
        recordBest('fish', `${f.name}, ${weight.toFixed(1)} lb`, score);
      }
      st.catches++;
    }
    updateHUD(); this.next();
  },
  next() {
    const st = this.st; st.bob = null; st.reel = null; st.msg = '';
    if (st.casts <= 0) { st.phase = 'out'; $('#pond-info').innerHTML = `<b>Out of bait</b><br>${st.catches ? 'Nice fishing. Your catch is in the basket.' : 'The fish won this round. There\'s always tomorrow.'}`; this.controls(); }
    else { st.phase = 'ready'; this.info(); }
  },
  update(dt) {
    const st = this.st; st.t += dt;
    for (const sh of st.shadows) {
      if (sh.target && st.bob && (st.phase === 'waiting' || st.phase === 'bite')) { const dx = st.bob.x - sh.x, dy = st.bob.y + 20 - sh.y, d = Math.hypot(dx, dy); if (d > 30) { sh.vx = dx / d * 50; sh.vy = dy / d * 50; } else { sh.vx *= 0.9; sh.vy *= 0.9; } }
      else if (Math.random() < dt * 0.4) { sh.vx = rand(-35, 35); sh.vy = rand(-10, 10); }
      sh.x += sh.vx * dt; sh.y += sh.vy * dt;
      if (sh.x < 150 || sh.x > 1350) sh.vx *= -1; if (sh.y < 540 || sh.y > 930) sh.vy *= -1;
      sh.x = clamp(sh.x, 150, 1350); sh.y = clamp(sh.y, 540, 930);
    }
    st.ripples = st.ripples.filter(r => (r.r += 60 * dt) < 90);
    if (st.phase === 'charging') { st.power += st.pdir * dt * 0.9; if (st.power > 1) { st.power = 1; st.pdir = -1; } if (st.power < 0) { st.power = 0; st.pdir = 1; } }
    if (st.phase === 'flying') {
      const b = st.bob; b.t += dt / 0.7;
      b.x = lerp(b.sx, b.tx, b.t); b.y = lerp(b.sy, b.ty, b.t) - Math.sin(b.t * Math.PI) * 220;
      if (b.t >= 1) { b.x = b.tx; b.y = b.ty; Snd.sfx('splash'); st.ripples.push({ x: b.x, y: b.y, r: 4 }); this.startWait(); }
    }
    if (st.phase === 'waiting') {
      st.bob.dip = Math.sin(st.t * 3) * 3;
      for (let i = st.nibbles.length - 1; i >= 0; i--) if (st.t >= st.nibbles[i]) { st.nibbles.splice(i, 1); st.nib = 0.28; st.ripples.push({ x: st.bob.x, y: st.bob.y, r: 4 }); Snd.sfx('click'); }
      if (st.nib > 0) { st.nib -= dt; st.bob.dip = 9; }
      if (st.t >= st.biteAt) { st.phase = 'bite'; st.t = 0; Snd.sfx('bite'); st.ripples.push({ x: st.bob.x, y: st.bob.y, r: 4 }); }
    }
    if (st.phase === 'bite') { st.bob.dip = 22; if (st.t > 1.0) { st.phase = 'missed'; st.msg = 'Too slow! It stole the bait.'; Snd.sfx('bad'); st.t = 0; } }
    if (st.phase === 'missed' && st.t > 1.6) { st.shadows.forEach(s => s.target = false); this.next(); }
    if (st.phase === 'reel') {
      const r = st.reel, f = st.fish;
      r.ft -= dt; if (r.ft <= 0) { r.ftarget = clamp(r.fish + rand(-0.55, 0.55) * f.diff, 0.07, 0.93); r.ft = rand(0.35, 1.1) / f.diff; }
      r.fv += (r.ftarget - r.fish) * 9 * f.diff * dt; r.fv *= Math.pow(0.08, dt); r.fish = clamp(r.fish + r.fv * dt * 2.2, 0.04, 0.96);
      r.bv += (r.hold ? 2.4 : -2.1) * dt; r.bv *= Math.pow(0.35, dt); r.bar += r.bv * dt; if (r.bar < 0) { r.bar = 0; r.bv = Math.max(0, r.bv) * -0.3; } if (r.bar > 1 - r.h) { r.bar = 1 - r.h; r.bv = Math.min(0, r.bv) * -0.3; }
      const inZone = r.fish >= r.bar && r.fish <= r.bar + r.h;
      r.prog += (inZone ? 0.3 : -0.17) * dt; r.inZone = inZone;
      st.bob.dip = 14 + Math.sin(st.t * 18) * 6;
      if (Math.random() < dt * 4) st.ripples.push({ x: st.bob.x + rand(-10, 10), y: st.bob.y, r: 4 });
      if (r.prog >= 1) { st.shadows.forEach(s => s.target = false); this.land(); }
      if (r.prog <= 0) { st.phase = 'missed'; st.msg = `The ${f.name.toLowerCase()} got away!`; Snd.sfx('bad'); st.t = 0; }
    }
  },
  draw() {
    const c = ctxOf(pc), st = this.st; c.clearRect(0, 0, W, H);
    // shadows
    for (const sh of st.shadows) { c.fillStyle = 'rgba(20,40,50,.22)'; c.beginPath(); c.ellipse(sh.x, sh.y, 34 * sh.s, 12 * sh.s, Math.atan2(sh.vy, sh.vx) * 0.3, 0, Math.PI * 2); c.fill(); }
    for (const r of st.ripples) { c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - r.r / 90)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(r.x, r.y + 8, r.r, r.r * 0.32, 0, 0, Math.PI * 2); c.stroke(); }
    // rod
    const tipX = 760 + ((st.bob ? st.bob.x : st.aim.x) - 760) * 0.12, tipY = 600 - (st.phase === 'charging' ? st.power * 40 : 0);
    c.strokeStyle = S.owned.rod ? '#7a4b22' : '#a0723f'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(800, 1010); c.lineTo(tipX, tipY); c.stroke();
    c.fillStyle = '#5a5f66'; c.beginPath(); c.arc(790, 930, 22, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#3a3f46'; c.lineWidth = 4; c.beginPath(); const ang = st.phase === 'reel' && st.reel.hold ? performance.now() / 50 : 0; c.moveTo(790, 930); c.lineTo(790 + Math.cos(ang) * 20, 930 + Math.sin(ang) * 20); c.stroke();
    if (st.bob) {
      const b = st.bob, by = b.y + b.dip;
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(tipX, tipY);
      const sag = st.phase === 'reel' ? 0 : 60; c.quadraticCurveTo((tipX + b.x) / 2, Math.max(tipY, by) + sag, b.x, by - 14); c.stroke();
      if (st.phase !== 'flying') { c.fillStyle = 'rgba(30,50,60,.25)'; c.beginPath(); c.ellipse(b.x, b.y + 8, 22, 6, 0, 0, Math.PI * 2); c.fill(); }
      c.save(); c.beginPath(); c.rect(0, 0, W, b.y + (st.phase === 'flying' ? 1000 : 6)); c.clip();
      c.fillStyle = '#fbf3e2'; c.beginPath(); c.arc(b.x, by, 13, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#c8342f'; c.beginPath(); c.arc(b.x, by, 13, Math.PI, 0); c.fill();
      c.fillStyle = '#3a2a1c'; c.fillRect(b.x - 2, by - 26, 4, 14);
      c.restore();
      if (st.phase === 'bite') { c.fillStyle = '#a8344a'; c.font = '900 72px Fraunces, serif'; c.textAlign = 'center'; c.fillText('!', b.x, b.y - 50 - Math.sin(st.t * 20) * 6); }
    }
    // aim + power
    if (st.phase === 'ready' || st.phase === 'charging') {
      const p = st.phase === 'charging' ? st.power : 0.5, tx = clamp(W / 2 + (st.aim.x - W / 2) * (0.35 + p * 0.65), 220, 1280), ty = lerp(900, 520, p);
      c.setLineDash([10, 12]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(tipX, tipY); c.quadraticCurveTo((tipX + tx) / 2, ty - 160, tx, ty); c.stroke(); c.setLineDash([]);
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(tx, ty, 26, 9, 0, 0, Math.PI * 2); c.stroke();
      if (st.phase === 'charging') {
        const x = 520, y = 950, w = 460; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, x - 12, y - 12, w + 24, 44, 22); c.fill();
        const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6f8f5e'); g.addColorStop(1, '#2f6b8a'); c.fillStyle = g; roundRect(c, x, y, Math.max(20, w * st.power), 20, 10); c.fill();
      }
    }
    // banner
    const banner = st.phase === 'ready' ? 'Press and hold on the water to cast. Let go to throw.' : st.phase === 'charging' ? 'Let go to cast!' : st.phase === 'waiting' ? 'Wait for it... don\'t bite on a nibble.' : st.phase === 'bite' ? 'A BITE! Click now!' : st.phase === 'reel' ? 'Hold to lift the green bar. Keep the fish inside it.' : st.phase === 'missed' ? st.msg : '';
    if (banner) {
      c.font = '700 32px Fraunces, Georgia, serif'; const tw = c.measureText(banner).width + 60;
      c.fillStyle = st.phase === 'bite' ? 'rgba(168,52,74,.95)' : 'rgba(251,243,226,.95)'; roundRect(c, W / 2 - tw / 2, 92, tw, 56, 28); c.fill();
      c.fillStyle = st.phase === 'bite' ? '#fff' : '#3a2a1c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(banner, W / 2, 121);
    }
    // reel meter
    if (st.phase === 'reel') {
      const r = st.reel, x = 1250, y = 200, h = 640, w = 90;
      c.fillStyle = 'rgba(251,243,226,.96)'; roundRect(c, x - 20, y - 20, w + 80, h + 40, 24); c.fill();
      c.fillStyle = '#2f5d73'; roundRect(c, x, y, w, h, 16); c.fill();
      c.fillStyle = r.inZone ? 'rgba(140,200,110,.95)' : 'rgba(140,200,110,.6)'; roundRect(c, x + 6, y + h - (r.bar + r.h) * h, w - 12, r.h * h, 12); c.fill();
      const fy = y + h - r.fish * h; c.save(); c.translate(x + w / 2, fy); c.scale(0.28, 0.28); drawFishShape(c, 0, 0, st.fish, 1); c.restore();
      c.fillStyle = '#e3d3b2'; roundRect(c, x + w + 16, y, 22, h, 11); c.fill();
      c.fillStyle = r.prog > 0.3 ? '#6f8f5e' : '#a8344a'; const ph = clamp(r.prog, 0, 1) * h; roundRect(c, x + w + 16, y + h - ph, 22, Math.max(10, ph), 11); c.fill();
    }
  }
};
function drawFishShape(c, x, y, f, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const [a, b] = f.col || ['#888', '#555'];
  c.fillStyle = b; c.beginPath(); c.moveTo(90, 0); c.lineTo(150, -50); c.lineTo(140, 0); c.lineTo(150, 50); c.closePath(); c.fill();
  const g = c.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, b); g.addColorStop(0.5, a); g.addColorStop(1, '#f2ead8');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, f.id === 'catfish' ? 120 : 105, f.id === 'bluegill' ? 62 : f.id === 'catfish' ? 38 : 48, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = b; c.beginPath(); c.moveTo(-20, -40); c.quadraticCurveTo(20, -90, 60, -36); c.fill();
  if (f.id === 'trout') { c.fillStyle = 'rgba(215,110,130,.8)'; c.fillRect(-90, -6, 180, 12); }
  if (f.id === 'bluegill') { c.fillStyle = '#1f2f4a'; c.beginPath(); c.arc(-62, -6, 12, 0, Math.PI * 2); c.fill(); }
  if (f.id === 'catfish') { c.strokeStyle = '#2a2822'; c.lineWidth = 4; [[-118, -10, -170, -40], [-118, 6, -175, 20], [-112, 12, -160, 48]].forEach(([x1, y1, x2, y2]) => { c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2, y2 - 10, x2, y2); c.stroke(); }); }
  if (f.id === 'crappie' || f.id === 'bass') { c.fillStyle = 'rgba(30,40,25,.35)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-50 + i * 24, (i % 2 ? -10 : 8), 8, 0, Math.PI * 2); c.fill(); } }
  if (f.rare) { c.strokeStyle = 'rgba(255,240,170,.9)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-40 + i * 25, 0, 14, -0.8, 0.8); c.stroke(); } }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-72, -12, 11, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(-74, -12, 6, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(-50, 0, 30, -1, 1); c.stroke();
  c.restore();
}
function drawFish(c, w, h, f) {
  c.clearRect(0, 0, w, h);
  c.fillStyle = '#e4eef0'; roundRect(c, 0, 0, w, h, 24); c.fill();
  if (f.id === 'teddy') { const img = new Image(); img.onload = () => c.drawImage(img, w / 2 - 110, h / 2 - 110, 220, 220); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(teddySVG().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); return; }
  if (f.id === 'boot') { c.fillStyle = '#5a3a22'; roundRect(c, w / 2 - 50, h / 2 - 110, 90, 170, 20); c.fill(); roundRect(c, w / 2 - 50, h / 2 + 20, 190, 70, 30); c.fill(); c.fillStyle = '#3a2412'; c.fillRect(w / 2 - 54, h / 2 + 84, 198, 16); c.fillStyle = '#6fa0b0'; c.beginPath(); c.arc(w / 2 + 100, h / 2 - 20, 12, 0, Math.PI * 2); c.fill(); return; }
  drawFishShape(c, w / 2 - 10, h / 2, f, 1.2);
}
pc.addEventListener('pointerdown', e => {
  const st = Pond.st; if (!st) return; const p = toLogical(e, pc); st.aim = p;
  if (st.phase === 'ready') { st.phase = 'charging'; st.power = 0; st.pdir = 1; pc.setPointerCapture(e.pointerId); }
  else if (st.phase === 'waiting' || st.phase === 'bite') Pond.hook();
  else if (st.phase === 'reel') st.reel.hold = true;
});
pc.addEventListener('pointermove', e => { const st = Pond.st; if (st && (st.phase === 'ready' || st.phase === 'charging')) st.aim = toLogical(e, pc); });
pc.addEventListener('pointerup', () => { const st = Pond.st; if (!st) return; if (st.phase === 'charging') Pond.cast(); if (st.phase === 'reel') st.reel.hold = false; });
addEventListener('keydown', e => {
  if (e.code !== 'Space' || S.scene !== 'pond' || !$('#modal').hidden) return; e.preventDefault(); const st = Pond.st; if (!st || e.repeat) return;
  if (st.phase === 'ready') { st.phase = 'charging'; st.power = 0; st.pdir = 1; }
  else if (st.phase === 'waiting' || st.phase === 'bite') Pond.hook();
  else if (st.phase === 'reel') st.reel.hold = true;
});
addEventListener('keyup', e => { if (e.code !== 'Space' || S.scene !== 'pond') return; const st = Pond.st; if (!st) return; if (st.phase === 'charging') Pond.cast(); if (st.phase === 'reel') st.reel.hold = false; });

/* ------------------------------------------------------------------ */
/* Workshops: Sewing Cottage, Yarn Shop, Painter's Studio, Craft Barn  */
/* ------------------------------------------------------------------ */
const CATS = { baked: 'Best Kitchen Fare', fish: 'Prize Catch', needle: 'Best Needlework', art: 'Fine Art', hand: 'Best Handcraft', garden: 'Garden & Hive' };
function recordBest(cat, name, score) { if (!S.best[cat] || score > S.best[cat].score) S.best[cat] = { name, score }; }
function starsFor(score) { return score >= 85 ? 3 : score >= 65 ? 2 : score >= 40 ? 1 : 0; }
const PALETTES = {
  beads: [['Berry', '#a8344a'], ['Sky', '#5f93c0'], ['Honey', '#e2a63b'], ['Sage', '#6f8f5e'], ['Pearl', '#f1ece0']],
  frosting: [['Strawberry', '#e98aa0'], ['Buttercream', '#f3e2a8'], ['Chocolate', '#6b3b22'], ['Mint', '#9fd3b5']],
  fabric: [['Rose', '#c95a6e'], ['Sky Blue', '#5f93c0'], ['Sage', '#7fa06a'], ['Sunflower', '#e2b23b']],
  yarn: [['Berry', '#a8344a'], ['Baby Blue', '#8ab8de'], ['Lavender', '#a48bc9'], ['Buttercream', '#ecd9a4']],
  glaze: [['Honey', '#c8862a'], ['Robin Egg', '#7ec4c1'], ['Plum', '#7d4b7a'], ['Moss', '#6f8f5e']],
  wax: [['Beeswax', '#e8c25a'], ['Cranberry', '#b23a48'], ['Lavender', '#b39ad6'], ['Snow', '#f4efe4']],
};
const WORKSHOPS = {
  sewing: { name: 'Sewing Cottage', img: 'img/sewing.jpg', intro: 'Pick a pattern and some fabric, then stitch along the line.', crafts: [
    { id: 'quilt', name: 'Patchwork Quilt Square', game: 'sew', shape: 'quilt', cat: 'needle', pal: 'fabric', note: 'Straight seams. Good for learning.' },
    { id: 'teddybear', name: 'Stitched Teddy Bear', game: 'sew', shape: 'teddy', cat: 'needle', pal: 'fabric', note: 'Lots of curves around the ears.' },
    { id: 'dress', name: 'Doll Dress', game: 'sew', shape: 'dress', cat: 'needle', pal: 'fabric', note: 'Sharp corners at the sleeves.' },
  ] },
  yarn: { name: 'Yarn Shop', img: 'img/yarn.jpg', intro: 'Knitting is all rhythm. Crochet is all timing.', crafts: [
    { id: 'scarf', name: 'Knitted Scarf', game: 'knit', len: 20, cat: 'needle', pal: 'yarn', note: 'Knit and purl to the beat.' },
    { id: 'blanket', name: 'Knitted Baby Blanket', game: 'knit', len: 28, hard: true, cat: 'needle', pal: 'yarn', note: 'Longer and faster. For steady hands.' },
    { id: 'granny', name: 'Crocheted Granny Square', game: 'crochet', len: 10, cat: 'needle', pal: 'yarn', note: 'Catch each loop with your hook.' },
    { id: 'beanie', name: 'Crocheted Beanie', game: 'crochet', len: 13, hard: true, cat: 'needle', pal: 'yarn', note: 'The loops come quicker.' },
  ] },
  paint: { name: "Painter's Studio", img: 'img/paint.jpg', intro: 'Paint by numbers. Your finished paintings hang in the gallery.', crafts: [
    { id: 'p_sunflower', name: 'Sunflower Field', game: 'paint', pic: 'sunflower', cat: 'art', note: 'Bright and simple.' },
    { id: 'p_barn', name: 'The Red Barn', game: 'paint', pic: 'barn', cat: 'art', note: 'A country afternoon.' },
    { id: 'p_teddy', name: 'Portrait of a Teddy Bear', game: 'paint', pic: 'teddy', cat: 'art', note: 'Small details. Look closely.' },
    { id: 'p_ship', name: 'The Great Ship at Night', game: 'paint', pic: 'ship', cat: 'art', note: 'Four tall funnels under the moon.' },
  ] },
  barn: { name: 'Craft Barn', img: 'img/barn.jpg', intro: 'Pottery, candle dipping, and wreath making.', crafts: [
    { id: 'pot', name: 'Clay Vase', game: 'pottery', cat: 'hand', pal: 'glaze', note: 'Shape the clay on the spinning wheel.' },
    { id: 'candle', name: 'Hand-Dipped Candles', game: 'candle', cat: 'hand', pal: 'wax', note: 'Dip when the wax is just right.' },
    { id: 'wreath', name: 'Flower Wreath', game: 'wreath', cat: 'hand', note: 'Remember the pattern, then rebuild it.' },
  ] },
  hollow: { name: 'Bear Hollow', img: 'img/hollow.jpg', intro: 'Up the old creek road, past the pines. Goldilocks\'s old cottage still stands with its door unlatched, and the hives still hum. The Hollow keeps one rule: LOVE. Treat everybody right.', crafts: [
    { id: 'honeyjar', name: 'Jar of Bear Hollow Honey', order: 'a jar of Bear Hollow honey', fail: 'Spilled Honey', game: 'hive', cat: 'garden', note: 'Lift the frames gently. Calm bees make the best honey.' },
    { id: 'porridge', name: 'Bear Hollow Porridge', order: 'a bowl of Bear Hollow porridge', fail: 'Scorched Porridge', game: 'porridge', cat: 'baked', note: 'Slow circles, a little honey, no hurry.' },
  ] },
  cakes: { name: 'Cake Shop', img: 'img/cakes.jpg', area: 'hive', intro: 'Custom cakes and cookie boxes for the farmers market. Pipe the frosting along the line.', crafts: [
    { id: 'cake', name: 'Layer Cake', game: 'pipe', shape: 'cake', cat: 'baked', pal: 'frosting', note: 'A scalloped border around the top.' },
    { id: 'heartbox', name: 'Heart Cookie Box', game: 'pipe', shape: 'heart', cat: 'baked', pal: 'frosting', note: 'Ice a giant heart cookie for the box.' },
  ] },
  beads: { name: 'Bead & Jewel Shop', img: 'img/beads.jpg', area: 'hive', intro: 'The first beads show the pattern. Keep it going.', crafts: [
    { id: 'bracelet', name: 'Beaded Bracelet', game: 'beads', len: 16, cat: 'hand', note: 'A simple repeating pattern.' },
    { id: 'earrings', name: 'Drop Earrings', game: 'beads', len: 14, hard: true, cat: 'hand', note: 'A trickier pattern on two strands.' },
  ] },
  wood: { name: 'Woodshop', img: 'img/wood.jpg', area: 'hive', intro: 'Sand it smooth, but don\'t sand a dip into it.', crafts: [
    { id: 'board', name: 'Cutting Board', game: 'sand', rows: 6, cat: 'hand', note: 'Folks pay real money for handmade wood.' },
    { id: 'shelfw', name: 'Wall Shelf', game: 'sand', rows: 3, cat: 'hand', note: 'Long and narrow. Quick, but careful.' },
    { id: 'sign', name: 'Carved Welcome Sign', game: 'sand', rows: 4, cat: 'hand', note: 'Hangs on a wall at home.' },
  ] },
  salon: { name: 'Braiding Salon', img: 'img/salon.jpg', area: 'hive', intro: 'A neighbor is in the chair. Cross each strand over the middle, right on the beat.', crafts: [
    { id: 'braid3', name: 'Three-Strand Braid', game: 'braid', len: 16, service: true, cat: 'hand', note: 'Steady and classic. Clients tip in coins.' },
    { id: 'boxbraid', name: 'Beaded Braids', game: 'braid', len: 24, hard: true, service: true, cat: 'hand', note: 'Faster, with beads at the ends.' },
  ] },
};
const ALL_CRAFTS = Object.values(WORKSHOPS).flatMap(w => w.crafts);

const wc = $('#work-canvas');
const hitCtx = document.createElement('canvas').getContext('2d');
const Work = {
  place: null, craft: null, g: null, st: null, raf: 0,
  async enter(place) {
    this.place = place; S.wsPlace = place; const ws = WORKSHOPS[place];
    $('#work-bg').src = ws.img; this.g = null; this.st = null; this.card(`<h3>${ws.name}</h3><p class="card-note">${S.usedSlot ? 'You\'ve finished your project for now. Head back to the square to let time pass.' : ws.intro}</p>`);
    this.setControls([]);
    cancelAnimationFrame(this.raf); this.last = performance.now(); this.loop();
    if (S.usedSlot) return;
    const ordered = id => S.orders.some(o => o.kind === 'craft' && o.craft === id);
    const grid = ws.crafts.map(c => `<button class="recipe-btn" data-val="${c.id}"><b>${esc(c.name)}${ordered(c.id) ? '<span class="tag">Ordered</span>' : ''}</b><small>${esc(c.note)}</small></button>`).join('');
    const extra = place === 'paint' ? [{ label: 'Visit the gallery', value: 'gallery' }] : [];
    const v = await modal(`<p class="kicker">${ws.name} · ${SLOTS[S.slot]}</p><h2>${place === 'hollow' ? 'What will you tend?' : 'What will you make?'}</h2><p>${ws.intro}</p><div class="recipe-grid">${grid}</div>`, [{ label: 'Back to the square', value: 'home' }, ...extra]);
    if (v === 'gallery') { await showGallery(); return this.enter(place); }
    if (v === 'home' || typeof v !== 'string') { backOut(); return; }
    const craft = ALL_CRAFTS.find(c => c.id === v);
    let color = null;
    if (craft.pal) {
      const sw = PALETTES[craft.pal].map(([n, c]) => `<button class="swatch" data-val="${c}" style="--c:${c}"><span></span>${n}</button>`).join('');
      const cv = await modal(`<p class="kicker">${esc(craft.name)}</p><h2>Pick your ${craft.pal === 'glaze' ? 'glaze' : craft.pal === 'wax' ? 'wax' : craft.pal}</h2><div class="swatches">${sw}</div>`, [{ label: 'Back', value: 'back' }]);
      if (cv === 'back' || typeof cv !== 'string') return this.enter(place);
      color = cv;
    }
    this.start(craft, color);
  },
  start(craft, color) {
    this.craft = craft; this.g = GAMES[craft.game]; this.st = { craft, color, t: 0, done: false };
    S.usedSlot = true; this.g.init(this.st); this.refresh();
  },
  refresh() { if (!this.g) return; this.card(`<h3>${esc(this.craft.name)}</h3>${this.g.card(this.st)}`); this.setControls(this.g.controls ? this.g.controls(this.st) : []); },
  card(html) { $('#work-card').innerHTML = html; },
  setControls(list) {
    const box = $('#work-controls'); box.innerHTML = '';
    for (const a of list) {
      const b = document.createElement('button'); b.className = 'btn btn-lg ' + (a.cls || ''); b.textContent = a.label; if (a.disabled) b.disabled = true;
      if (a.hold) { b.addEventListener('pointerdown', e => { e.preventDefault(); a.fn(true); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => a.fn(false))); }
      else b.onclick = () => a.fn();
      box.appendChild(b);
    }
  },
  loop() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (S.scene === 'work') {
      const c = ctxOf(wc); c.clearRect(0, 0, W, H);
      if (this.g && this.st) { if (!this.st.done) { this.st.t += dt; this.g.update(this.st, dt); } if (this.g.mat) { c.save(); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 30; c.fillStyle = 'rgba(251,243,226,.94)'; roundRect(c, 110, 170, 900, 720, 36); c.fill(); c.restore(); } this.g.draw(c, this.st); }
    }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  async finish(score, lines, extra = {}) {
    const st = this.st; if (st.done) return; st.done = true; this.setControls([]);
    score = Math.round(clamp(score, 0, 100));
    const n = starsFor(score), craft = st.craft;
    if (craft.service) return this.finishService(score, n, lines);
    const name = n === 0 && craft.fail ? craft.fail : n === 0 ? (craft.game === 'paint' ? `Smudged ${craft.name}` : `Unraveled ${craft.name}`) : n === 3 ? `Ribbon-worthy ${craft.name}` : craft.name;
    Snd.sfx(n >= 2 ? 'fanfare' : n === 1 ? 'meh' : 'bad');
    let html = `<p class="kicker">${WORKSHOPS[this.place].name}</p><h2>${esc(name)}</h2><div class="prize"><canvas id="prize-c" width="480" height="320"></canvas></div><p style="text-align:center">${stars(n)}</p><ul class="list">${lines.map(([k, v]) => `<li class="row"><div class="grow">${k}</div><b>${v}</b></li>`).join('')}</ul>`;
    html += n === 0 ? `<p>Even the best crafters start over sometimes. Try again another time.</p>` : `<p>Score <b>${score}</b>. It went into your basket${craft.game === 'paint' ? ' and a copy hangs in the gallery' : ''}.</p>`;
    setTimeout(() => { const pcv = $('#prize-c'); if (pcv) { const c = pcv.getContext('2d'); c.setTransform(480 / 1100, 0, 0, 320 / 733, 0, 0); c.fillStyle = '#f4ead4'; c.fillRect(0, 0, 1100, 733); c.translate(-10, -150); this.g.draw(c, st, true); } }, 30);
    if (n > 0) {
      S.basket.push({ kind: 'craft', craft: craft.id, cat: craft.cat, name: craft.name, stars: n, score, day: S.day, color: st.color });
      recordBest(craft.cat, craft.name, score);
      if (craft.game === 'paint') S.gallery.push({ pic: craft.pic, fills: [...st.fills], name: craft.name, stars: n, day: S.day });
      keepsake({ id: craft.id, name: craft.name, stars: n, color: st.color, pic: craft.pic, fills: st.fills ? [...st.fills] : null });
    }
    updateHUD();
    const canDeliver = S.orders.some(o => findItemFor(o));
    const v = await modal(html, canDeliver ? [{ label: 'Back to the square', primary: true, value: 'home' }, { label: 'See orders', sage: true, value: 'orders' }] : [{ label: 'Back to the square', primary: true, value: 'home' }]);
    await leaveActivity(); if (v === 'orders') showOrders();
  },
  async finishService(score, n, lines) {
    const st = this.st, craft = st.craft, who = st.client.name;
    const tip = n === 0 ? 1 : Math.round(score / 6) + 2;
    S.coins += tip; addFriend(who, n >= 2 ? 3 : 1); updateHUD();
    Snd.sfx(n >= 2 ? 'fanfare' : n === 1 ? 'meh' : 'bad');
    const name = n === 0 ? 'A Wobbly Braid' : n === 3 ? `A Picture-Perfect ${craft.name}` : craft.name;
    let html = `<p class="kicker">${WORKSHOPS[this.place].name} · for ${esc(who)}</p><h2>${esc(name)}</h2><div class="prize"><canvas id="prize-c" width="480" height="320"></canvas></div><p style="text-align:center">${stars(n)}</p><ul class="list">${lines.map(([k, v]) => `<li class="row"><div class="grow">${k}</div><b>${v}</b></li>`).join('')}</ul><p>${esc(who)} ${n >= 2 ? 'can\'t stop looking in the mirror' : n === 1 ? 'says it\'s nice' : 'is very polite about it'} and tips you <b>${tip} coins</b>.</p>`;
    setTimeout(() => { const pcv = $('#prize-c'); if (pcv) { const c = pcv.getContext('2d'); c.setTransform(480 / 1100, 0, 0, 320 / 733, 0, 0); c.fillStyle = '#f4ead4'; c.fillRect(0, 0, 1100, 733); c.translate(-10, -150); this.g.draw(c, st, true); } }, 30);
    await modal(html, [{ label: 'Back to the market', primary: true }]);
    await leaveActivity();
  },
};
const p2l = e => toLogical(e, wc);
wc.addEventListener('pointerdown', e => { if (Work.g?.down && !Work.st.done) { wc.setPointerCapture(e.pointerId); Work.g.down(Work.st, p2l(e)); } });
wc.addEventListener('pointermove', e => { if (Work.g?.move && !Work.st.done) Work.g.move(Work.st, p2l(e)); });
wc.addEventListener('pointerup', e => { if (Work.g?.up && !Work.st.done) Work.g.up(Work.st, p2l(e)); });
addEventListener('keydown', e => { if (S.scene !== 'work' || !$('#modal').hidden || e.repeat || !Work.g?.key || Work.st.done) return; if (Work.g.key(Work.st, e.code, true)) e.preventDefault(); });
addEventListener('keyup', e => { if (S.scene !== 'work' || !Work.g?.key || !Work.st || Work.st.done) return; Work.g.key(Work.st, e.code, false); });

function catmull(pts, seg = 10) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < seg; k++) { const t = k / seg, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
function resample(pts, step = 7) {
  const out = [pts[0]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i]; let d = Math.hypot(x1 - x0, y1 - y0);
    while (acc + d >= step) { const t = (step - acc) / d; x0 = x0 + (x1 - x0) * t; y0 = y0 + (y1 - y0) * t; out.push([x0, y0]); d = Math.hypot(x1 - x0, y1 - y0); acc = 0; }
    acc += d;
  }
  return out;
}
function sewPath(shape) {
  const cx = 560, cy = 560;
  if (shape === 'cake') { const pts = []; for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.02) { const r = 235 + 16 * Math.sin(a * 12); pts.push([cx + Math.cos(a - Math.PI / 2) * r, cy + Math.sin(a - Math.PI / 2) * r]); } return resample(pts); }
  if (shape === 'heart') { const pts = []; for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) pts.push([cx + 16 * Math.pow(Math.sin(t), 3) * 17, cy - 20 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 17]); return resample(pts); }
  if (shape === 'quilt') return resample([[340, 340], [780, 340], [780, 780], [340, 780], [340, 345], [775, 775]]);
  const rel = shape === 'teddy'
    ? [[0, 1], [-0.35, 1], [-0.5, 0.85], [-0.45, 0.55], [-0.7, 0.35], [-0.62, 0.15], [-0.38, 0.1], [-0.42, -0.15], [-0.62, -0.45], [-0.48, -0.66], [-0.3, -0.58], [0, -0.7], [0.3, -0.58], [0.48, -0.66], [0.62, -0.45], [0.42, -0.15], [0.38, 0.1], [0.62, 0.15], [0.7, 0.35], [0.45, 0.55], [0.5, 0.85], [0.35, 1], [0.02, 1]]
    : [[-0.16, -0.78], [0.16, -0.78], [0.42, -0.6], [0.34, -0.42], [0.2, -0.45], [0.22, -0.15], [0.62, 0.8], [-0.62, 0.8], [-0.22, -0.15], [-0.2, -0.45], [-0.34, -0.42], [-0.42, -0.6], [-0.18, -0.77]];
  const s = shape === 'teddy' ? 300 : 320;
  const pts = rel.map(([x, y]) => [cx + x * s, cy + y * s]);
  return resample(shape === 'teddy' ? catmull(pts, 12) : pts);
}

const GAMES = {
  /* ---------------- Bead & Jewel: continue the pattern ---------------- */
  beads: {
    mat: true,
    init(st) {
      const hard = st.craft.hard, k = hard ? 4 : 3, cols = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
      st.pat = hard ? [cols[0], cols[1], cols[1], cols[2]] : [cols[0], cols[1], cols[2]];
      st.n = st.craft.len; st.shown = k; st.seq = st.pat.map(c => ({ c, ok: true, pre: true })); st.errs = 0; st.limit = hard ? 30 : 26; st.msg = ''; st.msgT = 0;
    },
    card(st) { return `<p class="card-note">The first beads show the pattern. Memorize it, then keep it going with the buttons or keys 1 to 5.</p><div class="meter-row"><span>Beads</span><b>${st.seq.length} / ${st.n}</b></div><div class="meter-row"><span>Time</span><b>${Math.max(0, Math.ceil(st.limit - st.t))}s</b></div>`; },
    controls(st) { return PALETTES.beads.map(([nm], i) => ({ label: `${i + 1}. ${nm}`, cls: 'bead b' + i, fn: () => this.place(st, i) })); },
    key(st, code, down) { const m = /^Digit([1-5])$/.exec(code); if (down && m) { this.place(st, +m[1] - 1); return true; } return false; },
    place(st, i) {
      if (st.done || st.seq.length >= st.n) return;
      const want = st.pat[st.seq.length % st.pat.length], ok = i === want;
      st.seq.push({ c: i, ok }); if (!ok) { st.errs++; st.msg = 'That one breaks the pattern.'; st.msgT = 1.2; Snd.sfx('meh'); } else Snd.sfx('click');
      Work.refresh(); if (st.seq.length >= st.n) setTimeout(() => this.end(st), 500);
    },
    update(st, dt) { st.msgT = Math.max(0, st.msgT - dt); if (Math.floor(st.t * 2) !== st._tick) { st._tick = Math.floor(st.t * 2); Work.refresh(); } if (st.t >= st.limit) this.end(st); },
    end(st) {
      if (st.done || st.ended) return; st.ended = true;
      const total = st.n - st.shown, placed = st.seq.length - st.shown, good = st.seq.filter(b => b.ok && !b.pre).length, left = Math.max(0, st.limit - st.t);
      const sc = good / total * 88 + 12 * Math.min(1, left / 10) * (placed / total);
      Work.finish(sc, [['In pattern', `${good} of ${total}`], ['Out of place', st.errs], ['Time left', Math.round(left) + 's']]);
    },
    pos(st, i) {
      if (!st.craft.hard) { const a = -Math.PI / 2 + i / st.n * Math.PI * 2; return [560 + Math.cos(a) * 230, 540 + Math.sin(a) * 230]; }
      const half = Math.ceil(st.n / 2), side = i < half ? 0 : 1, j = i % half; return [420 + side * 280, 330 + j * 62];
    },
    draw(c, st, still) {
      c.strokeStyle = '#8a7a5a'; c.lineWidth = 3;
      if (!st.craft.hard) { c.beginPath(); c.arc(560, 540, 230, 0, Math.PI * 2); c.stroke(); }
      else for (const x of [420, 700]) { c.beginPath(); c.arc(x, 270, 26, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(x + 26, 270); c.lineTo(x, 330 + (Math.ceil(st.n / 2) - 1) * 62); c.stroke(); }
      for (let i = 0; i < st.n; i++) {
        const [x, y] = this.pos(st, i), b = st.seq[i];
        if (!b) { if (!still && i === st.seq.length) { c.strokeStyle = `rgba(58,42,28,${0.4 + Math.sin(st.t * 6) * 0.3})`; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 28, 0, Math.PI * 2); c.stroke(); } else if (!still) { c.fillStyle = 'rgba(58,42,28,.15)'; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill(); } continue; }
        const col = PALETTES.beads[b.c][1];
        c.fillStyle = col; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill();
        c.strokeStyle = b.ok ? 'rgba(0,0,0,.25)' : '#3a2a1c'; c.lineWidth = b.ok ? 2 : 4; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x - 8, y - 9, 7, 0, Math.PI * 2); c.fill();
        if (b.pre && !still) { c.fillStyle = '#3a2a1c'; c.font = '800 16px Nunito, sans-serif'; c.textAlign = 'center'; }
      }
      if (!still && !st.craft.hard && st.t < 5) { c.fillStyle = '#3a2a1c'; c.font = '800 22px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('Pattern:', 560, 520); st.pat.forEach((ci, i) => { c.fillStyle = PALETTES.beads[ci][1]; c.beginPath(); c.arc(560 + (i - (st.pat.length - 1) / 2) * 46, 560, 16, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.stroke(); }); }
      if (!still && st.craft.hard && st.t < 5) { c.fillStyle = '#3a2a1c'; c.font = '800 22px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('Pattern:', 560, 230); st.pat.forEach((ci, i) => { c.fillStyle = PALETTES.beads[ci][1]; c.beginPath(); c.arc(500 + i * 40, 255, 14, 0, Math.PI * 2); c.fill(); }); }
      if (!still && st.msg && st.msgT > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Woodshop: sanding ---------------- */
  sand: {
    mat: true,
    init(st) {
      st.rows = st.craft.rows; st.colsN = 14; st.cw = 50; st.x0 = 560 - 350; st.y0 = 540 - st.rows * 25;
      st.cells = Array.from({ length: st.rows * st.colsN }, () => ({ r: rand(0.55, 1), over: 0, gouge: false }));
      st.gouges = 0; st.limit = st.rows <= 3 ? 16 : st.rows <= 4 ? 20 : 26; st.dn = false; st.last = null; st.cur = null; st.msg = ''; st.msgT = 0;
    },
    card(st) { const sm = st.cells.filter(x => x.r <= 0.08).length / st.cells.length; return `<p class="card-note">Drag to sand the rough patches smooth. Once a spot is smooth, move on, or you'll sand a dip into it.</p><div class="meter-row"><span>Smooth</span><b>${Math.round(sm * 100)}%</b></div><div class="meter-row"><span>Time</span><b>${Math.max(0, Math.ceil(st.limit - st.t))}s</b></div>`; },
    down(st, p) { st.dn = true; st.last = p; st.cur = p; },
    move(st, p) {
      st.cur = p; if (!st.dn) return; const d = Math.min(80, Math.hypot(p.x - st.last.x, p.y - st.last.y)); st.last = p;
      for (let i = 0; i < st.cells.length; i++) {
        const cx = st.x0 + (i % st.colsN) * st.cw + st.cw / 2, cy = st.y0 + Math.floor(i / st.colsN) * st.cw + st.cw / 2;
        if (Math.hypot(p.x - cx, p.y - cy) > 48) continue; const cl = st.cells[i];
        if (cl.r > 0) cl.r -= d * 0.006; else { cl.over += d * 0.005; if (cl.over > 0.9 && !cl.gouge) { cl.gouge = true; st.gouges++; st.msg = 'Too much! That spot has a dip now.'; st.msgT = 1.3; Snd.sfx('meh'); } }
      }
      if (Math.random() < 0.15 && Snd.ctx && Snd.tone) Snd.tone(180 + Math.random() * 60, Snd.ctx.currentTime, 0.04, 'sawtooth', 0.02);
      if (st.cells.every(x => x.r <= 0.08)) this.end(st);
    },
    up(st) { st.dn = false; },
    update(st, dt) { st.msgT = Math.max(0, st.msgT - dt); if (Math.floor(st.t * 2) !== st._tick) { st._tick = Math.floor(st.t * 2); Work.refresh(); } if (st.t >= st.limit) this.end(st); },
    end(st) {
      if (st.ended) return; st.ended = true; st.dn = false;
      const sm = st.cells.filter(x => x.r <= 0.08).length / st.cells.length, left = Math.max(0, st.limit - st.t);
      Work.finish(sm * 92 + Math.min(8, left) - st.gouges * 5, [['Smooth', Math.round(sm * 100) + '%'], ['Dips sanded in', st.gouges], ['Time left', Math.round(left) + 's']]);
    },
    draw(c, st, still) {
      const w = st.colsN * st.cw, h = st.rows * st.cw, x0 = st.x0, y0 = st.y0, id = st.craft.id;
      c.save(); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 24; c.fillStyle = '#c99a5b'; roundRect(c, x0, y0, w, h, id === 'board' ? 40 : 10); c.fill(); c.restore();
      if (id === 'board') { c.fillStyle = '#f4ead4'; c.beginPath(); c.arc(x0 + w - 50, y0 + h / 2, 18, 0, Math.PI * 2); c.fill(); }
      c.save(); roundRect(c, x0, y0, w, h, id === 'board' ? 40 : 10); c.clip();
      c.strokeStyle = 'rgba(122,75,34,.35)'; c.lineWidth = 3; for (let k = 0; k < h; k += 14) { c.beginPath(); for (let x = 0; x <= w; x += 20) c.lineTo(x0 + x, y0 + k + Math.sin(x / 60 + k) * 5); c.stroke(); }
      st.cells.forEach((cl, i) => {
        const x = x0 + (i % st.colsN) * st.cw, y = y0 + Math.floor(i / st.colsN) * st.cw;
        if (!still && cl.r <= 0.08 && !cl.gouge) { c.fillStyle = 'rgba(255,245,215,.22)'; c.fillRect(x, y, st.cw, st.cw); }
        if (cl.gouge) { c.fillStyle = 'rgba(90,50,20,.45)'; c.beginPath(); c.ellipse(x + 25, y + 25, 22, 16, 0, 0, Math.PI * 2); c.fill(); }
        if (!still && cl.r > 0.08) { c.fillStyle = `rgba(92,56,26,${0.25 + cl.r * 0.6})`; c.fillRect(x, y, st.cw, st.cw); c.fillStyle = `rgba(255,240,210,${cl.r * 0.7})`; for (let k = 0; k < 10; k++) c.fillRect(x + ((i * 7 + k * 13) % 44) + 2, y + ((i * 11 + k * 17) % 44) + 2, 3, 3); }
      });
      c.restore();
      if (id === 'sign' && (still || st.done)) { c.fillStyle = '#5a3a1c'; c.font = '700 64px Fraunces, serif'; c.textAlign = 'center'; c.fillText('Welcome', 560, 560); }
      if (id === 'shelfw' && still) { c.fillStyle = '#7a4b22'; c.fillRect(x0 + 60, y0 + h, 24, 70); c.fillRect(x0 + w - 84, y0 + h, 24, 70); }
      if (!still && st.cur) { const { x, y } = st.cur; c.fillStyle = st.dn ? '#5f93c0' : 'rgba(95,147,192,.6)'; roundRect(c, x - 40, y - 26, 80, 52, 10); c.fill(); c.fillStyle = '#e8d6a8'; c.fillRect(x - 40, y + 14, 80, 12); }
      if (!still && st.msg && st.msgT > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Braiding Salon: rhythm ---------------- */
  braid: {
    mat: true,
    init(st) {
      const hard = st.craft.hard; st.n = st.craft.len; st.beat = hard ? 0.62 : 0.8; st.k = 0; st.res = []; st.next = 1.6; st.side = 0; st.msg = ''; st.msgT = 0; st.flash = 0; st.lastTick = -1;
      st.client = pick(FOLKS.filter(f => present(f) && !f.human)); st.cols = hard ? ['#a8344a', '#e2a63b', '#5f93c0'] : ['#3a2418', '#4a2e1c', '#2e1c12'];
    },
    card(st) { return `<p class="card-note"><b>${esc(st.client.name)}</b> is in the chair. When the dot reaches the ring, press the strand the arrow shows: <b>Left</b> or <b>Right</b> (arrow keys work too).</p><div class="meter-row"><span>Crosses</span><b>${st.k} / ${st.n}</b></div>`; },
    controls(st) { return [{ label: 'Left strand', cls: st.side === 0 ? 'btn-primary' : '', fn: () => this.press(st, 0) }, { label: 'Right strand', cls: st.side === 1 ? 'btn-primary' : '', fn: () => this.press(st, 1) }]; },
    key(st, code, down) { if (!down) return false; if (code === 'ArrowLeft' || code === 'KeyA') { this.press(st, 0); return true; } if (code === 'ArrowRight' || code === 'KeyD') { this.press(st, 1); return true; } return false; },
    press(st, s) {
      if (st.k >= st.n || st.ended) return; const off = Math.abs(st.t - st.next);
      if (off > 0.3) { st.msg = 'Wait for the beat.'; st.msgT = 0.6; return; }
      if (s !== st.side) { st.res.push(0.2); st.msg = 'Other strand.'; st.msgT = 0.7; Snd.sfx('meh'); }
      else { const q = off < 0.1 ? 1 : off < 0.2 ? 0.75 : 0.45; st.res.push(q); if (q === 1) { st.msg = 'Perfect.'; st.msgT = 0.4; } if (Snd.ctx && Snd.tone) Snd.tone(s ? 660 : 523, Snd.ctx.currentTime, 0.12, 'triangle', 0.12); }
      this.advance(st);
    },
    advance(st) { st.k++; st.side ^= 1; st.next += st.beat; st.flash = 0.25; Work.refresh(); if (st.k >= st.n) this.end(st); },
    update(st, dt) {
      st.msgT = Math.max(0, st.msgT - dt); st.flash = Math.max(0, st.flash - dt);
      if (st.k >= st.n) return;
      if (st.t > st.next + 0.3) { st.res.push(0); st.msg = 'Missed one.'; st.msgT = 0.7; this.advance(st); }
      const bi = Math.floor((st.t - 1.6) / st.beat); if (bi !== st.lastTick && st.t > 1.6 - st.beat) { st.lastTick = bi; if (Snd.ctx && Snd.tone) Snd.tone(1200, Snd.ctx.currentTime, 0.03, 'square', 0.03); }
    },
    end(st) { if (st.ended) return; st.ended = true; setTimeout(() => { const avg = st.res.reduce((a, b) => a + b, 0) / st.n; Work.finish(avg * 100, [['Perfect crosses', st.res.filter(x => x === 1).length + ' of ' + st.n], ['Missed', st.res.filter(x => x === 0).length]]); }, 600); },
    draw(c, st, still) {
      const f = st.client, fur = f.fur, mz = mixColor(fur, '#f3dfb5', 0.6), hx = 560, hy = 400;
      c.fillStyle = fur; c.beginPath(); c.arc(hx - 120, hy - 120, 52, 0, Math.PI * 2); c.arc(hx + 120, hy - 120, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = mz; c.beginPath(); c.arc(hx - 120, hy - 120, 26, 0, Math.PI * 2); c.arc(hx + 120, hy - 120, 26, 0, Math.PI * 2); c.fill();
      c.fillStyle = fur; c.beginPath(); c.arc(hx, hy, 160, 0, Math.PI * 2); c.fill();
      c.fillStyle = mz; c.beginPath(); c.ellipse(hx, hy + 55, 70, 52, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1a0f08'; c.beginPath(); c.ellipse(hx, hy + 32, 22, 15, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(hx - 55, hy - 20, 12, 0, Math.PI * 2); c.arc(hx + 55, hy - 20, 12, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#1a0f08'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx - 22, hy + 78); c.quadraticCurveTo(hx, hy + 92, hx + 22, hy + 78); c.stroke();
      const segs = st.k, bx = hx + 150, by = hy - 90;
      for (let i = 0; i < Math.max(segs, still ? st.n : 0) && i < st.n; i++) {
        const y = by + i * 22, x = bx + Math.sin(i * 0.4) * 6 + i * 2, side = i % 2 ? 1 : -1;
        c.fillStyle = st.cols[i % 3]; c.save(); c.translate(x, y); c.rotate(side * 0.5); c.beginPath(); c.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-4, -4, 12, 5, 0, 0, Math.PI * 2); c.fill(); c.restore();
        if (st.craft.hard && i % 4 === 3) { c.fillStyle = '#e2a63b'; c.beginPath(); c.arc(x + 18, y + 6, 9, 0, Math.PI * 2); c.fill(); }
      }
      if (still) return;
      const ty = 800, tx = 560; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, 200, ty - 50, 720, 100, 40); c.fill();
      c.strokeStyle = st.flash > 0 ? '#6f8f5e' : '#3a2a1c'; c.lineWidth = 6; c.beginPath(); c.arc(tx, ty, 34, 0, Math.PI * 2); c.stroke();
      for (let j = 0; j < 4 && st.k + j < st.n; j++) { const dtb = st.next + j * st.beat - st.t, x = tx + dtb * 280; if (x > 900 || x < 200) continue; c.fillStyle = (st.side + j) % 2 === 0 ? '#a8344a' : '#2f6b8a'; c.beginPath(); c.arc(x, ty, 18, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = st.side === 0 ? '#a8344a' : '#2f6b8a'; c.font = '800 40px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText(st.side === 0 ? '◀ Left' : 'Right ▶', tx, ty - 70);
      if (st.msg && st.msgT > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Bear Hollow: beekeeping ---------------- */
  hive: {
    mat: true,
    init(st) { st.frames = 6; st.k = 0; st.lift = 0; st.agit = 0.15; st.peak = 0; st.smoke = 3; st.used = 0; st.res = []; st.hold = false; st.msg = ''; st.msgT = 0; st.puffT = 0; st.bees = Array.from({ length: 40 }, () => ({ a: rand(0, 6.28), r: rand(70, 230), s: rand(0.8, 2.4) * (Math.random() < 0.5 ? -1 : 1), y: rand(-80, 60), p: rand(0, 6) })); },
    card(st) { return `<p class="card-note">Hold <b>Lift</b> to raise a frame slowly. The bees get fussy while you lift. Let go so they can settle, or use a puff of smoke. If the meter fills up, you'll have to set the frame back down.</p><div class="meter-row"><span>Frames</span><b>${st.k} / ${st.frames}</b></div><div class="meter-row"><span>Honey glow bonus</span><b>+${glowBonus()}</b></div>`; },
    controls(st) { return [{ label: 'Hold to lift  (Space)', cls: 'btn-primary', hold: true, fn: d => { st.hold = d; }, disabled: st.k >= st.frames }, { label: `Puff smoke (${st.smoke})`, fn: () => this.puff(st), disabled: st.smoke <= 0 || st.k >= st.frames }]; },
    key(st, code, down) { if (code === 'Space') { st.hold = down; return true; } return false; },
    puff(st) { if (st.smoke <= 0 || st.k >= st.frames) return; st.smoke--; st.used++; st.agit = Math.max(0, st.agit - 0.5); st.puffT = 1.4; Snd.sfx('click'); Work.refresh(); },
    say(st, m) { st.msg = m; st.msgT = 1.8; },
    update(st, dt) {
      st.msgT = Math.max(0, st.msgT - dt); st.puffT = Math.max(0, st.puffT - dt);
      for (const b of st.bees) b.a += dt * b.s * (0.5 + st.agit * 2.4);
      if (st.k >= st.frames) return;
      if (st.hold) { st.lift += dt * 0.3; st.agit += dt * (0.17 + st.k * 0.02); } else st.agit -= dt * 0.22;
      st.agit = clamp(st.agit, 0, 1); if (st.hold) st.peak = Math.max(st.peak, st.agit);
      if (st.agit >= 1) { st.res.push(0.25); st.k++; st.lift = 0; st.agit = 0.5; st.peak = 0; st.hold = false; this.say(st, 'Too much fuss. You set the frame back gently.'); Snd.sfx('bad'); Work.refresh(); this.check(st); }
      else if (st.lift >= 1) { const cr = clamp(1 - Math.max(0, st.peak - 0.75) * 2, 0.4, 1); st.res.push(cr); st.k++; st.lift = 0; st.peak = 0; this.say(st, cr > 0.9 ? 'A full frame of golden honey.' : 'Got it, though the bees were grumbling.'); Snd.sfx(cr > 0.9 ? 'good' : 'meh'); Work.refresh(); this.check(st); }
    },
    check(st) {
      if (st.k < st.frames) return; st.hold = false;
      setTimeout(() => { const avg = st.res.reduce((a, b) => a + b, 0) / st.frames * 100, g = glowBonus(); Work.finish(avg - st.used * 3 + g, [['Calm frames', st.res.filter(x => x > 0.9).length + ' of ' + st.frames], ['Smoke puffs used', st.used], ['Honey glow bonus', '+' + g]]); }, 900);
    },
    jar(c, x, y, s, fill) {
      c.save(); c.translate(x, y); c.scale(s, s);
      c.fillStyle = 'rgba(255,255,255,.55)'; roundRect(c, -60, -70, 120, 150, 26); c.fill();
      const h = 130 * fill; c.fillStyle = '#d9921f'; roundRect(c, -54, 74 - h, 108, h, 20); c.fill();
      c.fillStyle = 'rgba(255,240,190,.45)'; c.fillRect(-40, 70 - h, 10, h - 14);
      c.fillStyle = '#5f93c0'; roundRect(c, -66, -96, 132, 32, 8); c.fill();
      c.fillStyle = '#f6f1e7'; for (let i = -54; i < 60; i += 22) { c.beginPath(); c.arc(i, -80, 4, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#fbf3e2'; roundRect(c, -46, -10, 92, 44, 8); c.fill(); c.fillStyle = '#3a2a1c'; c.font = '700 15px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('Bear Hollow', 0, 10); c.fillText('Honey', 0, 28);
      c.restore();
    },
    draw(c, st, still) {
      if (still) { const avg = st.res.length ? st.res.reduce((a, b) => a + b, 0) / st.frames : 0.5; this.jar(c, 560, 540, 3.4, clamp(avg, 0.25, 1)); return; }
      const cx = 600, base = 800;
      c.fillStyle = '#7a5a3a'; c.fillRect(cx - 190, base, 380, 26); c.fillRect(cx - 170, base + 26, 20, 50); c.fillRect(cx + 150, base + 26, 20, 50);
      c.fillStyle = '#f4efe4'; roundRect(c, cx - 160, base - 300, 320, 300, 10); c.fill();
      c.strokeStyle = '#cdbb92'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - 160, base - 150); c.lineTo(cx + 160, base - 150); c.stroke();
      c.fillStyle = '#3a2a1c'; c.fillRect(cx - 40, base - 22, 80, 10);
      for (let i = 0; i < st.frames; i++) { if (i < st.k) continue; const fx = cx - 135 + i * 52; c.fillStyle = i === st.k ? '#c8862a' : '#a8743a'; c.fillRect(fx, base - 312, 30, 14); }
      if (st.k < st.frames) {
        const fx = cx - 135 + st.k * 52 - 8, fy = base - 300 - st.lift * 250;
        c.save(); c.beginPath(); c.rect(cx - 400, 170, 800, base - 300 - 170); c.clip();
        c.fillStyle = '#a8743a'; c.fillRect(fx - 6, fy - 14, 58, 14);
        c.fillStyle = '#e2a63b'; c.fillRect(fx, fy, 46, 240);
        c.fillStyle = 'rgba(255,230,150,.6)'; for (let r = 0; r < 12; r++) for (let q = 0; q < 2; q++) { c.beginPath(); c.arc(fx + 12 + q * 22 + (r % 2) * 6, fy + 12 + r * 19, 6, 0, Math.PI * 2); c.fill(); }
        c.restore();
      }
      const n = 8 + Math.round(st.agit * 32);
      for (let i = 0; i < n; i++) { const b = st.bees[i], r = b.r * (0.7 + st.agit * 0.5); const x = cx + Math.cos(b.a) * r, y = base - 380 + b.y + Math.sin(b.a * 1.7 + b.p) * 40;
        c.fillStyle = '#e8c25a'; c.beginPath(); c.ellipse(x, y, 9, 6, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2a1a0e'; c.fillRect(x - 2, y - 6, 3, 12); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(x - 2, y - 8, 5, 3, -0.5, 0, Math.PI * 2); c.fill(); }
      if (st.puffT > 0) { c.fillStyle = `rgba(230,225,215,${st.puffT / 1.4 * 0.7})`; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(cx - 220 + k * 30, base - 380 - k * 18 - (1.4 - st.puffT) * 60, 40 + k * 6, 0, Math.PI * 2); c.fill(); } }
      const done = st.res.filter(x => x > 0.3).length; for (let i = 0; i < done; i++) this.jar(c, 880 + (i % 3) * 46, 800 - Math.floor(i / 3) * 70, 0.32, st.res.filter(x => x > 0.3)[i]);
      const gx = 200, gy = 260, gh = 500; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, gx - 30, gy - 30, 100, gh + 60, 30); c.fill();
      const g = c.createLinearGradient(0, gy + gh, 0, gy); g.addColorStop(0, '#6f8f5e'); g.addColorStop(0.55, '#e2b23b'); g.addColorStop(1, '#c8342f'); c.fillStyle = g; roundRect(c, gx, gy, 40, gh, 20); c.fill();
      const ny = gy + gh * (1 - st.agit); c.fillStyle = '#3a2a1c'; c.beginPath(); c.moveTo(gx + 50, ny); c.lineTo(gx + 74, ny - 12); c.lineTo(gx + 74, ny + 12); c.fill();
      c.fillStyle = '#3a2a1c'; c.font = '800 20px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('Bees', gx + 20, gy + gh + 56);
      if (st.msg && st.msgT > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Bear Hollow: Mama Bear's porridge ---------------- */
  porridge: {
    mat: true,
    init(st) { st.phase = 'stir'; st.prog = 0; st.speed = 0; st.acc = 0; st.ang = 0; st.spoon = -1.2; st.dn = false; st.splash = 0; st.stick = 0; st.idle = 0; st.honey = 0; st.pour = false; st.msg = ''; st.msgT = 0; st.swirl = 0; },
    card(st) { return st.phase === 'stir' ? `<p class="card-note">Drag in slow circles around the pot. Keep the needle in the <b>green</b>. Too fast and it splashes, too slow and it sticks. No hurry.</p><div class="meter-row"><span>Cooked</span><b>${Math.round(st.prog * 100)}%</b></div>` : `<p class="card-note">Now <b>a little honey</b>. Hold to drizzle, then let go at the line. Just a little.</p><div class="meter-row"><span>Honey glow bonus</span><b>+${glowBonus()}</b></div>`; },
    controls(st) { return st.phase === 'honey' ? [{ label: 'Hold to drizzle  (Space)', cls: 'btn-primary', hold: true, fn: d => this.pourSet(st, d) }] : []; },
    pourSet(st, d) { if (st.phase !== 'honey') return; if (d) st.pour = true; else if (st.pour) { st.pour = false; this.end(st); } },
    key(st, code, down) { if (code === 'Space' && st.phase === 'honey') { this.pourSet(st, down); return true; } return false; },
    down(st, p) { st.dn = true; st.ang = Math.atan2(p.y - 600, p.x - 560); },
    move(st, p) { if (st.phase !== 'stir' || !st.dn) return; const a = Math.atan2(p.y - 600, p.x - 560); let d = a - st.ang; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; st.ang = a; st.spoon = a; st.acc += Math.abs(d); },
    up(st) { st.dn = false; },
    say(st, m) { if (st.msgT <= 0.2) { st.msg = m; st.msgT = 1.4; } },
    update(st, dt) {
      st.msgT = Math.max(0, st.msgT - dt);
      if (st.phase === 'stir') {
        st.speed = lerp(st.speed, st.acc / dt, 1 - Math.exp(-dt * 5)); st.acc = 0; st.swirl += dt * st.speed * 0.3;
        if (st.speed >= 3 && st.speed <= 8) { st.prog += dt / 12; st.idle = 0; }
        else if (st.speed > 8) { st.prog += dt / 24; st.splash += dt * (st.speed > 10 ? 10 : 4); this.say(st, 'Easy now. It\'s splashing.'); st.idle = 0; }
        else { st.idle += dt; if (st.idle > 1.5) { st.stick += dt * 5; this.say(st, 'It\'s starting to stick. Keep it moving.'); } }
        if (st.prog >= 1) { st.phase = 'honey'; st.dn = false; Snd.sfx('good'); Work.refresh(); }
      } else if (st.pour) { st.honey += dt * 0.32; if (st.honey >= 1) { st.pour = false; this.end(st); } }
    },
    end(st) {
      if (st.ended) return; st.ended = true;
      const stir = clamp(100 - st.splash - st.stick, 0, 100), hon = clamp(100 - Math.abs(st.honey - 0.3) * 260, 0, 100), g = glowBonus();
      const word = st.honey < 0.2 ? 'not quite sweet enough' : st.honey > 0.42 ? 'a little too sweet' : 'just right';
      setTimeout(() => Work.finish(stir * 0.7 + hon * 0.3 + g, [['Stirring', Math.round(stir)], ['Honey', word], ['Honey glow bonus', '+' + g]]), 700);
    },
    draw(c, st, still) {
      const cx = 560, cy = 600;
      const col = mixColor('#f1e4c4', '#e2a63b', clamp(st.honey * 1.6, 0, 1));
      if (still) {
        c.fillStyle = '#7a4b22'; c.beginPath(); c.ellipse(cx, 560, 300, 80, 0, 0, Math.PI); c.lineTo(cx - 300, 560); c.fill();
        c.fillStyle = '#9a6131'; c.beginPath(); c.ellipse(cx, 520, 300, 70, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = col; c.beginPath(); c.ellipse(cx, 520, 270, 56, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#d9921f'; c.lineWidth = 8; c.beginPath(); for (let a = 0; a < 12; a += 0.2) { const r = a * 18; c.lineTo(cx + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.2); } c.stroke();
        c.fillStyle = '#7a4b22'; c.beginPath(); c.moveTo(cx - 280, 600); c.quadraticCurveTo(cx, 720, cx + 280, 600); c.lineTo(cx + 200, 640); c.quadraticCurveTo(cx, 740, cx - 200, 640); c.fill();
        return;
      }
      c.fillStyle = 'rgba(255,140,60,.55)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(cx - 160 + k * 80, 800, 30, 18 + Math.sin(st.t * 8 + k) * 6, 0, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#2f2a26'; c.beginPath(); c.ellipse(cx, cy + 20, 290, 170, 0, 0, Math.PI); c.fill(); c.fillRect(cx - 290, cy - 40, 580, 62);
      c.fillStyle = '#4a433d'; c.beginPath(); c.ellipse(cx, cy - 40, 300, 92, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy - 34, 262, 74, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(160,120,60,.35)'; c.lineWidth = 5; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(cx, cy - 34, 62 * k, 17 * k, 0, st.swirl + k, st.swirl + k + 2.4); c.stroke(); }
      if (st.honey > 0) { c.strokeStyle = '#d9921f'; c.lineWidth = 6; c.beginPath(); for (let a = 0; a < st.honey * 14; a += 0.2) { const r = a * 14; c.lineTo(cx + Math.cos(a) * r, cy - 34 + Math.sin(a) * r * 0.27); } c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 4; k++) { const y = (st.t * 40 + k * 60) % 240; c.beginPath(); c.arc(cx - 90 + k * 60 + Math.sin(st.t + k) * 14, cy - 120 - y, 16 + y * 0.08, 0, Math.PI * 2); c.fill(); }
      if (st.phase === 'stir') {
        const sx = cx + Math.cos(st.spoon) * 160, sy = cy - 34 + Math.sin(st.spoon) * 45;
        c.strokeStyle = '#a8743a'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (sx - cx) * 0.25, sy - 300); c.stroke();
        c.fillStyle = '#8a5a2b'; c.beginPath(); c.ellipse(sx, sy, 26, 14, 0, 0, Math.PI * 2); c.fill();
        const bx = 300, by = 250, bw = 520; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, bx - 24, by - 30, bw + 48, 96, 24); c.fill(); c.fillStyle = '#e6d6b4'; roundRect(c, bx, by + 46, bw, 10, 5); c.fill();
        c.fillStyle = '#5f93c0'; c.fillRect(bx, by, bw * 0.3, 14); c.fillStyle = '#6f8f5e'; c.fillRect(bx + bw * 0.3, by, bw * 0.5, 14); c.fillStyle = '#c8342f'; c.fillRect(bx + bw * 0.8, by, bw * 0.2, 14);
        const nx = bx + bw * clamp(st.speed / 10, 0, 1); c.fillStyle = '#3a2a1c'; c.beginPath(); c.moveTo(nx, by + 18); c.lineTo(nx - 12, by + 38); c.lineTo(nx + 12, by + 38); c.fill();
        c.font = '800 18px Nunito, sans-serif'; c.textAlign = 'left'; c.fillText('slow', bx, by - 8); c.textAlign = 'right'; c.fillText('too fast', bx + bw, by - 8); c.textAlign = 'center'; c.fillText('just right', bx + bw * 0.55, by - 8);
        c.fillStyle = '#6f8f5e'; roundRect(c, bx, by + 46, bw * clamp(st.prog, 0, 1), 10, 5); c.fill();
      } else {
        const jx = cx + 60, jy = 290; c.save(); c.translate(jx, jy); c.rotate(st.pour ? 2.1 : 1.2); GAMES.hive.jar(c, 0, 0, 0.6, 0.8); c.restore();
        if (st.pour) { c.strokeStyle = '#d9921f'; c.lineWidth = 7; c.beginPath(); c.moveTo(jx - 40, jy + 40); c.lineTo(cx, cy - 40); c.stroke(); }
        const mx = 930, my = 300, mh = 440; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, mx - 26, my - 26, 92, mh + 52, 26); c.fill();
        c.fillStyle = '#ead9b8'; roundRect(c, mx, my, 40, mh, 18); c.fill();
        const fh = mh * clamp(st.honey, 0, 1); c.fillStyle = '#d9921f'; roundRect(c, mx, my + mh - fh, 40, fh, 18); c.fill();
        const ty = my + mh * (1 - 0.3); c.strokeStyle = '#3a2a1c'; c.lineWidth = 4; c.beginPath(); c.moveTo(mx - 12, ty); c.lineTo(mx + 52, ty); c.stroke();
        c.fillStyle = '#3a2a1c'; c.font = '800 18px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('a little', mx + 20, ty - 12);
      }
      if (st.msg && st.msgT > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Sewing: trace the stitch line ---------------- */
  sew: {
    init(st) { st.path = sewPath(st.craft.shape); st.idx = 0; st.errs = []; st.trail = []; st.sewing = false; st.limit = 38; st.msg = ''; },
    card(st) { return `<p class="card-note">Press on the green dot and drag along the dotted line. Stay close for tiny, even stitches.</p><div class="meter-row"><span>Sewn</span><b>${Math.round(st.idx / (st.path.length - 1) * 100)}%</b></div><div class="meter-row"><span>Time</span><b>${Math.max(0, Math.ceil(st.limit - st.t))}s</b></div>`; },
    down(st, p) { const [x, y] = st.path[st.idx]; if (Math.hypot(p.x - x, p.y - y) < 60) { st.sewing = true; st.msg = ''; Snd.sfx('click'); } else st.msg = 'Start at the needle (green dot).'; },
    move(st, p) {
      if (!st.sewing) return; let best = -1, bd = 1e9;
      for (let j = st.idx; j < Math.min(st.path.length, st.idx + 28); j++) { const d = Math.hypot(p.x - st.path[j][0], p.y - st.path[j][1]); if (d < bd) { bd = d; best = j; } }
      if (bd > 75) { st.sewing = false; st.msg = 'The thread slipped. Pick up at the needle.'; Snd.sfx('meh'); return; }
      if (best > st.idx) { for (let j = st.idx; j < best; j++) st.errs.push(bd); st.idx = best; st.trail.push([p.x, p.y]); if (st.trail.length % 6 === 0) Snd.tone && Snd.ctx && Snd.tone(900 + Math.random() * 60, Snd.ctx.currentTime, 0.03, 'square', 0.03); }
      if (st.idx >= st.path.length - 3) this.end(st);
    },
    up(st) { st.sewing = false; },
    update(st) { if (Math.floor(st.t * 2) !== st._tick) { st._tick = Math.floor(st.t * 2); Work.refresh(); } if (st.t >= st.limit) this.end(st); },
    end(st) {
      if (st.done) return; const comp = st.idx / (st.path.length - 1);
      const avg = st.errs.length ? st.errs.reduce((a, b) => a + b, 0) / st.errs.length : 60;
      const acc = clamp(100 - avg * 2.1, 0, 100), left = Math.max(0, st.limit - st.t);
      const score = acc * 0.85 * comp + 15 * comp * Math.min(1, left / 8);
      Work.finish(score, [['Neatness', Math.round(acc)], ['Finished', Math.round(comp * 100) + '%'], ['Time left', Math.round(left) + 's']]);
    },
    draw(c, st) {
      const col = st.color;
      c.save(); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 30; c.fillStyle = col; roundRect(c, 250, 250, 620, 620, 18); c.fill(); c.restore();
      c.save(); roundRect(c, 250, 250, 620, 620, 18); c.clip(); c.fillStyle = 'rgba(255,255,255,.22)';
      for (let i = 0; i < 620; i += 44) { c.fillRect(250 + i, 250, 22, 620); c.fillRect(250, 250 + i, 620, 22); } c.restore();
      if (st.done && st.craft.shape !== 'quilt') { c.fillStyle = mixColor(col, '#ffffff', 0.3); c.beginPath(); st.path.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); if (st.craft.shape === 'teddy') { c.fillStyle = '#2a1a0e'; c.beginPath(); c.arc(515, 430, 12, 0, 7); c.arc(605, 430, 12, 0, 7); c.fill(); c.beginPath(); c.ellipse(560, 470, 18, 12, 0, 0, 7); c.fill(); c.fillStyle = '#a8344a'; c.beginPath(); c.moveTo(560, 560); c.lineTo(510, 535); c.lineTo(510, 585); c.closePath(); c.moveTo(560, 560); c.lineTo(610, 535); c.lineTo(610, 585); c.closePath(); c.fill(); } }
      if (st.done && st.craft.shape === 'quilt') { c.fillStyle = mixColor(col, '#ffffff', 0.45); c.beginPath(); c.moveTo(340, 340); c.lineTo(780, 340); c.lineTo(780, 780); c.closePath(); c.fill(); }
      c.setLineDash([6, 10]); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.beginPath(); st.path.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#3a2a1c'; c.lineWidth = 5; c.lineCap = 'round';
      for (let i = 1; i < st.trail.length; i += 2) { const [a, b] = st.trail[i - 1], [x, y] = st.trail[i]; c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); }
      if (st.done) return;
      const [nx, ny] = st.path[Math.min(st.idx, st.path.length - 1)];
      c.fillStyle = st.sewing ? '#6f8f5e' : `rgba(111,143,94,${0.6 + Math.sin(st.t * 6) * 0.4})`; c.beginPath(); c.arc(nx, ny, st.sewing ? 14 : 22, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#c7c9cc'; c.lineWidth = 5; c.beginPath(); c.moveTo(nx, ny); c.lineTo(nx + 46, ny - 56); c.stroke();
      if (st.msg) banner(c, st.msg);
    },
  },
  /* ---------------- Knitting: rhythm ---------------- */
  knit: {
    mat: true,
    init(st) {
      const beat = st.craft.hard ? 0.46 : 0.58; st.notes = []; let t = 2.2;
      for (let i = 0; i < st.craft.len; i++) { st.notes.push({ t, type: Math.random() < 0.6 ? 'K' : 'P', res: null }); t += beat * (Math.random() < 0.18 ? 2 : 1); }
      st.travel = 2.0; st.hitX = 300; st.end = t + 1; st.last = '';
    },
    card(st) { const hit = st.notes.filter(n => n.res && n.res !== 'miss').length; return `<p class="card-note">When a stitch reaches the circle, press <b>Knit</b> for the V stitch or <b>Purl</b> for the bump. Keys: <b>F</b> knit, <b>J</b> purl.</p><div class="meter-row"><span>Stitches</span><b>${hit} / ${st.notes.length}</b></div>`; },
    controls(st) { return [{ label: 'Knit  (F)', cls: 'btn-primary', fn: () => this.press(st, 'K') }, { label: 'Purl  (J)', cls: 'btn-sage', fn: () => this.press(st, 'P') }]; },
    key(st, code, down) { if (!down) return false; if (code === 'KeyF') { this.press(st, 'K'); return true; } if (code === 'KeyJ') { this.press(st, 'P'); return true; } return false; },
    press(st, type) {
      const n = st.notes.find(n => !n.res && Math.abs(n.t - st.t) < 0.25); if (!n) { st.last = 'Wait for the stitch.'; return; }
      const e = Math.abs(n.t - st.t);
      if (n.type !== type) { n.res = 'miss'; st.last = n.type === 'K' ? 'That one was a knit.' : 'That one was a purl.'; Snd.sfx('meh'); }
      else { n.res = e < 0.08 ? 'perfect' : e < 0.16 ? 'good' : 'ok'; st.last = n.res === 'perfect' ? 'Perfect!' : n.res === 'good' ? 'Good' : 'Okay'; Snd.ctx && Snd.tone(type === 'K' ? 784 : 587, Snd.ctx.currentTime, 0.12, 'triangle', 0.2); }
      Work.refresh();
    },
    update(st) {
      for (const n of st.notes) if (!n.res && st.t - n.t > 0.25) { n.res = 'miss'; st.last = 'Dropped a stitch!'; Work.refresh(); }
      if (st.t > st.end) {
        const cr = { perfect: 1, good: 0.75, ok: 0.45, miss: 0 }; const sc = st.notes.reduce((a, n) => a + cr[n.res || 'miss'], 0) / st.notes.length * 100;
        const cnt = k => st.notes.filter(n => n.res === k).length;
        Work.finish(sc, [['Perfect stitches', cnt('perfect')], ['Good stitches', cnt('good') + cnt('ok')], ['Dropped', cnt('miss')]]);
      }
    },
    draw(c, st, still) {
      // knitted piece grows row by row
      const done = st.notes.filter(n => n.res), cols = 8, sw = 46, sh = 34, x0 = 560 - cols * sw / 2, y0 = 210;
      const rows = Math.ceil(st.notes.length / cols);
      c.fillStyle = 'rgba(0,0,0,.12)'; roundRect(c, x0 - 10, y0 - 10, cols * sw + 20, rows * sh + 20, 12); c.fill();
      done.forEach((n, i) => {
        const r = Math.floor(i / cols), k = i % cols, x = x0 + k * sw, y = y0 + r * sh;
        if (n.res === 'miss') { c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 4, y + 4, sw - 8, sh - 8); return; }
        c.fillStyle = st.color; c.fillRect(x, y, sw, sh);
        c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 4; c.beginPath();
        if (n.type === 'K') { c.moveTo(x + 8, y + 6); c.lineTo(x + sw / 2, y + sh - 6); c.lineTo(x + sw - 8, y + 6); } else { c.ellipse(x + sw / 2, y + sh / 2, sw / 2 - 8, 6, 0, 0, Math.PI * 2); }
        c.stroke();
      });
      if (still) return;
      // lane
      const ly = 780; c.fillStyle = '#efe0bf'; roundRect(c, 150, ly - 60, 820, 120, 60); c.fill();
      c.strokeStyle = '#a8344a'; c.lineWidth = 6; c.beginPath(); c.arc(st.hitX, ly, 46, 0, Math.PI * 2); c.stroke();
      for (const n of st.notes) {
        if (n.res) continue; const x = st.hitX + (n.t - st.t) / st.travel * 800; if (x > 960 || x < 160) continue;
        c.fillStyle = n.type === 'K' ? st.color : '#6b5440'; c.beginPath(); c.arc(x, ly, 36, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath();
        if (n.type === 'K') { c.moveTo(x - 14, ly - 12); c.lineTo(x, ly + 12); c.lineTo(x + 14, ly - 12); } else { c.moveTo(x - 16, ly); c.lineTo(x + 16, ly); }
        c.stroke();
      }
      if (st.last) { c.fillStyle = '#3a2a1c'; c.font = '800 30px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText(st.last, st.hitX, ly - 85); }
      if (st.t < 2) banner(c, 'Get ready... the first stitch is coming');
    },
  },
  /* ---------------- Crochet: loop timing ---------------- */
  crochet: {
    mat: true,
    init(st) { st.R0 = 90; st.r = 300; st.sp = 190; st.k = 0; st.res = []; st.msg = ''; st.flash = 0; },
    card(st) { return `<p class="card-note">The loop of yarn tightens around your hook. Press <b>Hook!</b> (or the space bar) right when it lines up with the dashed ring.</p><div class="meter-row"><span>Stitches</span><b>${st.k} / ${st.craft.len}</b></div>`; },
    controls(st) { return [{ label: 'Hook!  (Space)', cls: 'btn-primary', fn: () => this.hook(st) }]; },
    key(st, code, down) { if (down && code === 'Space') { this.hook(st); return true; } return false; },
    down(st) { this.hook(st); },
    hook(st) {
      if (st.k >= st.craft.len) return; const e = Math.abs(st.r - st.R0);
      const cr = e < 9 ? 1 : e < 20 ? 0.7 : e < 34 ? 0.4 : 0; st.res.push(cr);
      st.msg = cr === 1 ? 'Perfect loop!' : cr >= 0.7 ? 'Nice' : cr > 0 ? 'A little loose' : 'Missed the loop'; st.flash = 0.4;
      Snd.sfx(cr >= 0.7 ? 'click' : 'meh'); if (cr === 1) Snd.ctx && Snd.tone(988, Snd.ctx.currentTime, 0.15, 'triangle', 0.18);
      this.next(st);
    },
    next(st) { st.k++; st.r = 300; st.sp = (st.craft.hard ? 220 : 185) + st.k * (st.craft.hard ? 16 : 11); Work.refresh(); if (st.k >= st.craft.len) setTimeout(() => this.end(st), 500); },
    update(st, dt) { if (st.k >= st.craft.len) return; st.flash -= dt; st.r -= st.sp * dt; if (st.r < 30) { st.res.push(0); st.msg = 'Too slow. The loop slipped off.'; Snd.sfx('meh'); this.next(st); } },
    end(st) { const sc = st.res.reduce((a, b) => a + b, 0) / st.craft.len * 100; Work.finish(sc, [['Perfect loops', st.res.filter(x => x === 1).length], ['Loose loops', st.res.filter(x => x > 0 && x < 1).length], ['Missed', st.res.filter(x => x === 0).length]]); },
    draw(c, st, still) {
      const cx = 560, cy = 540; const beanie = st.craft.id === 'beanie';
      // the piece
      st.res.forEach((cr, i) => {
        const s = 70 + i * 34, col = i % 2 ? '#fbf3e2' : st.color;
        c.globalAlpha = cr === 0 ? 0.25 : 1;
        if (beanie) { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, s, 0, Math.PI * 2); c.fill(); }
        else { c.fillStyle = col; c.save(); c.translate(cx, cy); c.rotate(i * 0.02); roundRect(c, -s, -s, s * 2, s * 2, 14); c.fill(); c.restore(); }
        c.globalAlpha = 1;
      });
      for (let i = st.res.length - 1; i >= 0; i--) { const s = 70 + i * 34 - 17; c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 3; c.setLineDash([10, 8]); if (beanie) { c.beginPath(); c.arc(cx, cy, s + 17, 0, Math.PI * 2); c.stroke(); } else c.strokeRect(cx - s - 17, cy - s - 17, (s + 17) * 2, (s + 17) * 2); c.setLineDash([]); }
      if (still || st.k >= st.craft.len) return;
      c.fillStyle = 'rgba(251,243,226,.85)'; c.beginPath(); c.arc(cx, cy, 60, 0, Math.PI * 2); c.fill();
      c.setLineDash([12, 10]); c.strokeStyle = '#3a2a1c'; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, st.R0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.strokeStyle = st.color; c.lineWidth = 14; c.beginPath(); c.arc(cx, cy, Math.max(10, st.r), 0, Math.PI * 2); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, Math.max(10, st.r), 0, Math.PI * 2); c.stroke();
      // hook
      c.strokeStyle = '#c8862a'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + 10, cy + 10); c.lineTo(cx + 230, cy + 260); c.stroke();
      c.beginPath(); c.lineWidth = 9; c.arc(cx + 2, cy - 2, 14, Math.PI * 0.2, Math.PI * 1.3); c.stroke();
      if (st.msg && st.flash > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Painting: paint by numbers ---------------- */
  paint: {
    init(st) { st.pic = PICS[st.craft.pic](); st.fills = st.pic.regions.map(() => -1); st.sel = 0; st.msg = ''; },
    card(st) {
      const filled = st.fills.filter(f => f >= 0).length;
      return `<p class="card-note">Pick a color, then click every space with that number. You can repaint a space if you change your mind.</p><div class="meter-row"><span>Painted</span><b>${filled} / ${st.fills.length}</b></div><div class="meter-row"><span>Time</span><b>${Math.floor(st.t)}s</b></div>`;
    },
    controls(st) { const all = st.fills.every(f => f >= 0); return [{ label: all ? 'Sign your painting' : 'Fill every space to finish', cls: all ? 'btn-primary' : '', disabled: !all, fn: () => this.end(st) }]; },
    key(st, code, down) { const m = code.match(/^Digit(\d)$/); if (down && m && +m[1] >= 1 && +m[1] <= st.pic.pal.length) { st.sel = +m[1] - 1; return true; } return false; },
    down(st, p) {
      const pal = st.pic.pal, sx = 560 - (pal.length - 1) * 60;
      for (let i = 0; i < pal.length; i++) if (Math.hypot(p.x - (sx + i * 120), p.y - 935) < 44) { st.sel = i; Snd.sfx('click'); return; }
      for (let i = st.pic.regions.length - 1; i >= 0; i--) {
        if (hitCtx.isPointInPath(st.pic.regions[i].path, p.x, p.y)) { const was = st.fills[i]; st.fills[i] = st.sel; if (was < 0) { Work.refresh(); } Snd.ctx && Snd.tone(520 + st.sel * 60, Snd.ctx.currentTime, 0.08, 'sine', 0.15); return; }
      }
    },
    update(st) { if (Math.floor(st.t) !== st._tick) { st._tick = Math.floor(st.t); Work.refresh(); } },
    end(st) {
      const right = st.pic.regions.filter((r, i) => st.fills[i] === r.n - 1).length, tot = st.pic.regions.length;
      const speed = clamp(15 - Math.max(0, st.t - 35) * 0.25, 0, 15);
      Work.finish(right / tot * 85 + speed, [['Right colors', `${right} / ${tot}`], ['Time', Math.round(st.t) + 's']]);
    },
    draw(c, st, still) {
      const pic = st.pic;
      c.save(); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 24; c.fillStyle = '#8a5a2b'; c.fillRect(140, 180, 840, 700); c.restore();
      c.fillStyle = '#fffdf7'; c.fillRect(160, 200, 800, 660);
      c.save(); c.beginPath(); c.rect(160, 200, 800, 660); c.clip();
      pic.regions.forEach((r, i) => {
        c.fillStyle = st.fills[i] >= 0 ? pic.pal[st.fills[i]][1] : '#fffdf7'; c.fill(r.path);
        c.strokeStyle = 'rgba(58,42,28,.55)'; c.lineWidth = 2.5; c.stroke(r.path);
      });
      if (!still) pic.regions.forEach((r, i) => { if (st.fills[i] < 0) { c.fillStyle = '#6b5440'; c.font = '800 24px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(r.n, r.lx, r.ly); } });
      c.restore();
      if (still) return;
      const pal = pic.pal, sx = 560 - (pal.length - 1) * 60;
      c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, sx - 70, 885, (pal.length - 1) * 120 + 140, 100, 50); c.fill();
      pal.forEach(([n, col], i) => {
        const x = sx + i * 120; c.fillStyle = col; c.beginPath(); c.arc(x, 935, st.sel === i ? 40 : 32, 0, Math.PI * 2); c.fill();
        if (st.sel === i) { c.strokeStyle = '#3a2a1c'; c.lineWidth = 5; c.stroke(); }
        c.fillStyle = luminance(col) > 0.6 ? '#3a2a1c' : '#fff'; c.font = '900 26px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(i + 1, x, 936);
      });
    },
  },
  /* ---------------- Pottery: shape on the wheel ---------------- */
  pottery: {
    mat: true,
    init(st) {
      const shapes = { vase: [0.45, 0.6, 0.72, 0.65, 0.45, 0.3, 0.28, 0.38, 0.45], bowl: [0.5, 0.72, 0.86, 0.94, 0.98, 1, 1, 1, 1], jug: [0.6, 0.78, 0.85, 0.8, 0.66, 0.5, 0.36, 0.32, 0.34] };
      st.kind = pick(Object.keys(shapes)); st.tgt = shapes[st.kind]; st.h = st.kind === 'bowl' ? 240 : 420; st.started = false; st.prog = 0; st.prof = []; st.cur = 120; st.spin = 0;
    },
    target(st, u) { const a = st.tgt, f = u * (a.length - 1), i = Math.min(a.length - 2, Math.floor(f)); return lerp(a[i], a[i + 1], f - i) * 200; },
    card(st) { return `<p class="card-note">Today's shape: <b>${st.kind}</b>. Press start, then move your mouse or finger left and right to make the clay match the dotted outline as it rises.</p><div class="meter-row"><span>Shaped</span><b>${Math.round(st.prog * 100)}%</b></div>`; },
    controls(st) { return st.started ? [] : [{ label: 'Start the wheel', cls: 'btn-primary', fn: () => { st.started = true; Snd.sfx('click'); Work.refresh(); } }]; },
    move(st, p) { st.cur = clamp(Math.abs(p.x - 560), 25, 230); },
    down(st, p) { this.move(st, p); },
    update(st, dt) {
      st.spin += dt * (st.started ? 14 : 2); if (!st.started) return;
      st.prog = Math.min(1, st.prog + dt / 10); const idx = Math.floor(st.prog * 100);
      while (st.prof.length <= idx && st.prof.length <= 100) st.prof.push(st.cur);
      if (Math.floor(st.prog * 10) !== st._tick) { st._tick = Math.floor(st.prog * 10); Work.refresh(); }
      if (st.prog >= 1) { const err = st.prof.reduce((a, r, i) => a + Math.abs(r - this.target(st, i / 100)), 0) / st.prof.length; Work.finish(100 - err * 1.4, [['Shape', st.kind], ['Average wobble', Math.round(err) + ' px']]); }
    },
    draw(c, st, still) {
      const cx = 560, base = 800, H0 = st.h;
      c.fillStyle = '#6b4a2f'; c.beginPath(); c.ellipse(cx, base + 30, 300, 50, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8a6242'; c.beginPath(); c.ellipse(cx, base + 14, 280, 40, 0, 0, Math.PI * 2); c.fill();
      if (!still) { c.setLineDash([10, 10]); c.strokeStyle = '#6b5440'; c.lineWidth = 4; for (const s of [-1, 1]) { c.beginPath(); for (let i = 0; i <= 100; i++) { const y = base - i / 100 * H0, x = cx + s * this.target(st, i / 100); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } c.setLineDash([]); }
      if (st.prof.length > 1) {
        const glaze = still ? st.color : '#b9774a';
        c.fillStyle = glaze; c.beginPath(); c.moveTo(cx - st.prof[0], base);
        st.prof.forEach((r, i) => c.lineTo(cx - r, base - i / 100 * H0)); for (let i = st.prof.length - 1; i >= 0; i--) c.lineTo(cx + st.prof[i], base - i / 100 * H0); c.closePath(); c.fill();
        c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 6;
        for (let k = 0; k < 6; k++) { const x = cx + Math.sin(st.spin + k) * 160; c.beginPath(); c.moveTo(x, base); c.lineTo(x, base - H0); c.stroke(); } c.restore();
        const top = st.prof.length - 1; c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(cx, base - top / 100 * H0, st.prof[top], 14, 0, 0, Math.PI * 2); c.fill();
      }
      if (!still && st.started) { const y = base - st.prog * H0; c.fillStyle = '#946040'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * (st.cur + 24), y, 24, 36, 0, 0, Math.PI * 2); c.fill(); } }
    },
  },
  /* ---------------- Candle dipping: temperature timing ---------------- */
  candle: {
    mat: true,
    init(st) { st.dips = 10; st.k = 0; st.res = []; st.temp = 0.2; st.ph = rand(0, 6); st.anim = 0; st.msg = ''; st.layers = 0; st.lumps = 0; },
    card(st) { return `<p class="card-note">Dip when the thermometer needle is in the <b>green zone</b>. Too hot and the wax melts off. Too cool and it goes lumpy.</p><div class="meter-row"><span>Dips</span><b>${st.k} / ${st.dips}</b></div>`; },
    controls(st) { return [{ label: 'Dip!  (Space)', cls: 'btn-primary', fn: () => this.dip(st), disabled: st.k >= st.dips }]; },
    key(st, code, down) { if (down && code === 'Space') { this.dip(st); return true; } return false; },
    dip(st) {
      if (st.anim > 0 || st.k >= st.dips) return; const T = st.temp; let cr, m;
      if (T >= 0.45 && T <= 0.6) { cr = 1; m = 'Smooth layer!'; } else if (T >= 0.36 && T <= 0.7) { cr = 0.65; m = 'Good dip'; } else if (T > 0.7) { cr = 0.2; m = 'Too hot! The wax melted off.'; } else { cr = 0.3; m = 'Too cool. A bit lumpy.'; st.lumps++; }
      st.res.push(cr); st.layers += cr; st.msg = m; st.anim = 0.7; st.k++; Snd.sfx(cr >= 0.65 ? 'click' : 'meh'); Work.refresh();
      if (st.k >= st.dips) setTimeout(() => { const sc = st.res.reduce((a, b) => a + b, 0) / st.dips * 100; Work.finish(sc, [['Smooth layers', st.res.filter(x => x === 1).length], ['Good dips', st.res.filter(x => x === 0.65).length], ['Melted or lumpy', st.res.filter(x => x < 0.5).length]]); }, 900);
    },
    update(st, dt) { st.ph += dt * (1.6 + st.k * 0.12); st.temp = 0.5 + Math.sin(st.ph) * 0.38 + Math.sin(st.ph * 2.3) * 0.08; st.anim = Math.max(0, st.anim - dt); },
    draw(c, st, still) {
      const cx = 600, dipY = st.anim > 0 ? Math.sin((0.7 - st.anim) / 0.7 * Math.PI) * 220 : 0;
      if (!still) { c.fillStyle = '#5a5f66'; roundRect(c, cx - 220, 640, 440, 220, 30); c.fill(); c.fillStyle = mixColor(st.color, '#ffffff', 0.15); c.beginPath(); c.ellipse(cx, 650, 210, 36, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,140,60,.6)'; c.fillRect(cx - 200, 860, 400, 18); }
      c.fillStyle = '#7a4b22'; roundRect(c, cx - 260, 230, 520, 22, 11); c.fill();
      const w = 22 + st.layers * 7, len = 300 + st.layers * 6;
      for (const s of [-1, 1]) {
        const x = cx + s * 90, top = 252 + dipY;
        c.strokeStyle = '#3a2a1c'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 240); c.lineTo(x, top + 30); c.stroke();
        if (st.layers > 0) { c.fillStyle = st.color; roundRect(c, x - w / 2, top + 30, w, len * Math.min(1, 0.3 + st.layers / 8), w / 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - w / 2 + 5, top + 40, 5, len * Math.min(1, 0.3 + st.layers / 8) - 20); for (let k = 0; k < st.lumps; k++) { c.fillStyle = mixColor(st.color, '#000000', 0.15); c.beginPath(); c.arc(x + (k % 2 ? w / 2 : -w / 2), top + 80 + k * 40, 7, 0, Math.PI * 2); c.fill(); } }
      }
      if (still) return;
      const gx = 200, gy = 260, gh = 520; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, gx - 30, gy - 30, 100, gh + 60, 30); c.fill();
      const g = c.createLinearGradient(0, gy + gh, 0, gy); g.addColorStop(0, '#5f93c0'); g.addColorStop(0.5, '#6f8f5e'); g.addColorStop(1, '#c8342f'); c.fillStyle = g; roundRect(c, gx, gy, 40, gh, 20); c.fill();
      c.strokeStyle = '#3a2a1c'; c.lineWidth = 4; c.strokeRect(gx - 6, gy + gh * (1 - 0.6), 52, gh * 0.15);
      const ny = gy + gh * (1 - clamp(st.temp, 0, 1)); c.fillStyle = '#3a2a1c'; c.beginPath(); c.moveTo(gx + 50, ny); c.lineTo(gx + 74, ny - 12); c.lineTo(gx + 74, ny + 12); c.fill();
      if (st.msg && st.anim > 0) banner(c, st.msg);
    },
  },
  /* ---------------- Wreath: memory pattern ---------------- */
  wreath: {
    mat: true,
    init(st) { st.slots = 8; st.answer = Array.from({ length: 8 }, () => Math.floor(rand(0, 4))); st.place = Array(8).fill(-1); st.phase = 'show'; st.showFor = 6; st.sel = 0; st.peeks = 1; st.peeking = 0; },
    card(st) { return st.phase === 'show' ? `<p class="card-note">Memorize the flowers around the wreath. They'll disappear in <b>${Math.ceil(st.showFor - st.t)}</b> seconds.</p>` : `<p class="card-note">Pick a flower below, then click a spot on the wreath to rebuild the pattern.</p><div class="meter-row"><span>Placed</span><b>${st.place.filter(x => x >= 0).length} / 8</b></div>`; },
    controls(st) { if (st.phase === 'show') return []; const all = st.place.every(x => x >= 0); return [{ label: `Peek (${st.peeks} left)`, disabled: !st.peeks, fn: () => { st.peeks--; st.peeking = 1.5; Work.refresh(); } }, { label: 'Finish the wreath', cls: all ? 'btn-primary' : '', disabled: !all, fn: () => this.end(st) }]; },
    pos(i) { const a = -Math.PI / 2 + i / 8 * Math.PI * 2; return [560 + Math.cos(a) * 210, 520 + Math.sin(a) * 210]; },
    down(st, p) {
      if (st.phase !== 'build') return;
      for (let k = 0; k < 4; k++) if (Math.hypot(p.x - (380 + k * 120), p.y - 920) < 48) { st.sel = k; Snd.sfx('click'); return; }
      for (let i = 0; i < 8; i++) { const [x, y] = this.pos(i); if (Math.hypot(p.x - x, p.y - y) < 60) { st.place[i] = st.sel; Snd.sfx('click'); Work.refresh(); return; } }
    },
    update(st, dt) { if (st.phase === 'show') { if (Math.floor(st.t) !== st._tick) { st._tick = Math.floor(st.t); Work.refresh(); } if (st.t >= st.showFor) { st.phase = 'build'; Work.refresh(); } } st.peeking = Math.max(0, st.peeking - dt); },
    end(st) { const right = st.place.filter((f, i) => f === st.answer[i]).length; Work.finish(right / 8 * 100 - (1 - st.peeks) * 8, [['Flowers in the right spot', right + ' / 8'], ['Peeks used', 1 - st.peeks]]); },
    draw(c, st, still) {
      c.strokeStyle = '#4d6b40'; c.lineWidth = 70; c.beginPath(); c.arc(560, 520, 210, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#6f8f5e'; c.lineWidth = 8; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; c.beginPath(); c.moveTo(560 + Math.cos(a) * 185, 520 + Math.sin(a) * 185); c.lineTo(560 + Math.cos(a + 0.12) * 238, 520 + Math.sin(a + 0.12) * 238); c.stroke(); }
      const showAns = st.phase === 'show' || st.peeking > 0;
      for (let i = 0; i < 8; i++) { const [x, y] = this.pos(i); const f = showAns && !still ? st.answer[i] : st.place[i]; if (f >= 0) drawFlower(c, x, y, f, 1); else { c.strokeStyle = 'rgba(255,255,255,.8)'; c.setLineDash([8, 8]); c.lineWidth = 4; c.beginPath(); c.arc(x, y, 40, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); } }
      c.fillStyle = '#a8344a'; c.beginPath(); c.moveTo(560, 760); c.lineTo(510, 820); c.lineTo(545, 815); c.closePath(); c.fill(); c.beginPath(); c.moveTo(560, 760); c.lineTo(610, 820); c.lineTo(575, 815); c.closePath(); c.fill(); c.beginPath(); c.ellipse(560, 745, 40, 22, 0, 0, Math.PI * 2); c.fill();
      if (still) return;
      if (st.phase === 'build') {
        c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, 310, 865, 540, 110, 55); c.fill();
        for (let k = 0; k < 4; k++) { const x = 380 + k * 120; if (st.sel === k) { c.fillStyle = 'rgba(168,52,74,.2)'; c.beginPath(); c.arc(x, 920, 50, 0, Math.PI * 2); c.fill(); } drawFlower(c, x, 920, k, 0.85); }
      }
      if (st.peeking > 0) banner(c, 'Peeking...');
    },
  },
};
function banner(c, text) {
  c.font = '700 32px Fraunces, Georgia, serif'; const tw = c.measureText(text).width + 60;
  c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, 560 - tw / 2, 100, tw, 56, 28); c.fill();
  c.fillStyle = '#3a2a1c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 560, 129);
}
function luminance(hex) { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]; }
const FLOWERS = [['Rose', '#c8342f', '#8a1f1f'], ['Daisy', '#ffffff', '#e8b23b'], ['Lavender', '#9b7fd1', '#6a4fa0'], ['Sunflower', '#f0b52e', '#5a3418']];
function drawFlower(c, x, y, k, s) {
  const [, petal, mid] = FLOWERS[k]; c.save(); c.translate(x, y); c.scale(s, s);
  if (k === 2) { c.fillStyle = petal; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-8 + (i % 2) * 16, -30 + i * 9, 10, 8, 0, 0, Math.PI * 2); c.fill(); } c.fillStyle = mid; c.fillRect(-2, -34, 4, 70); }
  else { const n = k === 0 ? 6 : k === 1 ? 10 : 14; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; c.fillStyle = petal; c.beginPath(); c.ellipse(Math.cos(a) * 20, Math.sin(a) * 20, k === 0 ? 20 : 15, k === 0 ? 16 : 7, a, 0, Math.PI * 2); c.fill(); if (k === 1) { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1.5; c.stroke(); } }
    c.fillStyle = mid; c.beginPath(); c.arc(0, 0, k === 0 ? 14 : 13, 0, Math.PI * 2); c.fill(); if (k === 0) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 8, 0, 4); c.stroke(); } }
  c.restore();
}

/* Paint-by-number pictures (logical canvas area: 160..960 x 200..860) */
function P(fn) { const p = new Path2D(); fn(p); return p; }
const circ = (x, y, r) => P(p => p.arc(x, y, r, 0, Math.PI * 2));
const ell = (x, y, rx, ry, a = 0) => P(p => p.ellipse(x, y, rx, ry, a, 0, Math.PI * 2));
const rect = (x, y, w, h) => P(p => p.rect(x, y, w, h));
const poly = pts => P(p => { pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); });
GAMES.pipe = {
  ...GAMES.sew,
  init(st) { GAMES.sew.init(st); st.limit = 40; st.sprinkles = Array.from({ length: 60 }, () => [rand(-1, 1), rand(-1, 1), pick(['#a8344a', '#5f93c0', '#e2a63b', '#6f8f5e', '#ffffff']), rand(0, 3)]); },
  card(st) { return `<p class="card-note">Press on the green dot and drag along the dotted line to pipe the frosting. Smooth and steady wins ribbons.</p><div class="meter-row"><span>Piped</span><b>${Math.round(st.idx / (st.path.length - 1) * 100)}%</b></div><div class="meter-row"><span>Time</span><b>${Math.max(0, Math.ceil(st.limit - st.t))}s</b></div>`; },
  draw(c, st, still) {
    const heart = st.craft.shape === 'heart', cx = 560, cy = 560;
    if (heart) { c.fillStyle = '#d8b98a'; roundRect(c, 230, 230, 660, 660, 20); c.fill(); c.fillStyle = '#e9c690'; c.beginPath(); for (let t = 0; t <= Math.PI * 2; t += 0.05) c.lineTo(cx + 16 * Math.pow(Math.sin(t), 3) * 19, cy - 20 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 19); c.fill(); }
    else { c.fillStyle = '#e8e2d6'; c.beginPath(); c.arc(cx, cy, 320, 0, Math.PI * 2); c.fill(); c.fillStyle = '#f7ecd8'; c.beginPath(); c.arc(cx, cy, 275, 0, Math.PI * 2); c.fill(); }
    if (still || st.done) for (const [a, b, col, r] of st.sprinkles) { const x = cx + a * 150, y = cy + b * 130; c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = col; c.fillRect(-7, -2.5, 14, 5); c.restore(); }
    if (!still) { c.setLineDash([6, 10]); c.strokeStyle = 'rgba(122,75,34,.6)'; c.lineWidth = 4; c.beginPath(); st.path.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]); }
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [w, col] of [[22, mixColor(st.color, '#000000', 0.12)], [16, st.color], [6, mixColor(st.color, '#ffffff', 0.45)]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); st.trail.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
    if (still || st.done) return;
    const [nx, ny] = st.path[Math.min(st.idx, st.path.length - 1)];
    c.fillStyle = st.sewing ? '#6f8f5e' : `rgba(111,143,94,${0.6 + Math.sin(st.t * 6) * 0.4})`; c.beginPath(); c.arc(nx, ny, st.sewing ? 12 : 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f6f1e7'; c.strokeStyle = '#cdbb92'; c.lineWidth = 3; c.beginPath(); c.moveTo(nx, ny - 6); c.lineTo(nx + 40, ny - 90); c.lineTo(nx + 90, ny - 60); c.closePath(); c.fill(); c.stroke();
    if (st.msg) banner(c, st.msg);
  },
};
const PICS = {
  sunflower: () => ({ pal: [['Sky', '#9cc9e3'], ['Grass', '#86ad5c'], ['Petal', '#f2c230'], ['Seeds', '#6b4423'], ['Leaf', '#4f7a3a']], regions: [
    { n: 1, path: rect(160, 200, 800, 420), lx: 260, ly: 260 },
    { n: 3, path: circ(850, 300, 60), lx: 850, ly: 300 },
    { n: 2, path: P(p => { p.moveTo(160, 640); p.quadraticCurveTo(560, 540, 960, 640); p.lineTo(960, 860); p.lineTo(160, 860); p.closePath(); }), lx: 260, ly: 800 },
    { n: 5, path: rect(545, 520, 30, 340), lx: 560, ly: 800 },
    { n: 5, path: ell(470, 680, 80, 30, -0.4), lx: 460, ly: 684 },
    { n: 5, path: ell(650, 640, 80, 30, 0.4), lx: 660, ly: 644 },
    { n: 3, path: P(p => { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.moveTo(560 + Math.cos(a) * 60, 430 + Math.sin(a) * 60); p.ellipse(560 + Math.cos(a) * 95, 430 + Math.sin(a) * 95, 55, 24, a, 0, Math.PI * 2); } }), lx: 560, ly: 315 },
    { n: 4, path: circ(560, 430, 62), lx: 560, ly: 430 },
    { n: 3, path: circ(290, 560, 34), lx: 290, ly: 560 },
    { n: 4, path: circ(290, 560, 14), lx: 330, ly: 610 },
  ] }),
  barn: () => ({ pal: [['Sky', '#9cc9e3'], ['Barn Red', '#b23a3a'], ['Meadow', '#86ad5c'], ['Trim', '#f4efe4'], ['Roof', '#6e4a2c'], ['Sun', '#f2c230']], regions: [
    { n: 1, path: rect(160, 200, 800, 460), lx: 220, ly: 250 },
    { n: 6, path: circ(830, 290, 55), lx: 830, ly: 290 },
    { n: 4, path: P(p => { p.ellipse(330, 300, 70, 30, 0, 0, Math.PI * 2); p.moveTo(440, 300); p.ellipse(390, 285, 60, 34, 0, 0, Math.PI * 2); }), lx: 350, ly: 300 },
    { n: 3, path: P(p => { p.moveTo(160, 680); p.quadraticCurveTo(400, 600, 960, 660); p.lineTo(960, 860); p.lineTo(160, 860); p.closePath(); }), lx: 230, ly: 800 },
    { n: 2, path: rect(420, 470, 300, 260), lx: 470, ly: 520 },
    { n: 5, path: poly([[400, 480], [570, 360], [740, 480]]), lx: 570, ly: 440 },
    { n: 4, path: rect(520, 590, 100, 140), lx: 570, ly: 660 },
    { n: 6, path: rect(545, 495, 50, 50), lx: 570, ly: 520 },
    { n: 5, path: poly([[540, 730], [600, 730], [700, 860], [440, 860]]), lx: 570, ly: 810 },
  ] }),
  teddy: () => ({ pal: [['Wall', '#cfe3f0'], ['Fur', '#9a6131'], ['Tan', '#e3c08e'], ['Bow', '#b23a48'], ['Nose', '#2a1a0e']], regions: [
    { n: 1, path: rect(160, 200, 800, 660), lx: 220, ly: 260 },
    { n: 2, path: circ(445, 300, 55), lx: 420, ly: 270 },
    { n: 2, path: circ(675, 300, 55), lx: 700, ly: 270 },
    { n: 3, path: circ(445, 300, 28), lx: 452, ly: 306 },
    { n: 3, path: circ(675, 300, 28), lx: 668, ly: 306 },
    { n: 2, path: ell(560, 700, 190, 160), lx: 420, ly: 740 },
    { n: 2, path: circ(560, 420, 140), lx: 470, ly: 360 },
    { n: 3, path: ell(560, 720, 100, 100), lx: 560, ly: 740 },
    { n: 3, path: ell(560, 470, 62, 46), lx: 560, ly: 492 },
    { n: 5, path: ell(560, 450, 22, 16), lx: 560, ly: 450 },
    { n: 5, path: circ(505, 390, 16), lx: 505, ly: 390 },
    { n: 5, path: circ(615, 390, 16), lx: 615, ly: 390 },
    { n: 4, path: P(p => { p.moveTo(560, 575); p.lineTo(480, 535); p.lineTo(480, 615); p.closePath(); p.moveTo(560, 575); p.lineTo(640, 535); p.lineTo(640, 615); p.closePath(); }), lx: 505, ly: 575 },
  ] }),
  ship: () => ({ pal: [['Night', '#2e3f66'], ['Sea', '#2f6b8a'], ['Hull', '#2a2522'], ['White', '#f4efe4'], ['Funnel', '#d99a45'], ['Moon', '#f2e6b0']], regions: [
    { n: 1, path: rect(160, 200, 800, 440), lx: 220, ly: 250 },
    { n: 6, path: circ(830, 290, 50), lx: 830, ly: 290 },
    { n: 2, path: rect(160, 640, 800, 220), lx: 230, ly: 800 },
    { n: 4, path: P(p => { for (let i = 0; i < 5; i++) { p.moveTo(200 + i * 170, 700 + (i % 2) * 70); p.ellipse(220 + i * 170, 700 + (i % 2) * 70, 60, 10, 0, 0, Math.PI * 2); } }), lx: 220, ly: 700 },
    { n: 3, path: poly([[220, 560], [900, 560], [860, 660], [270, 660]]), lx: 560, ly: 615 },
    { n: 4, path: rect(320, 500, 480, 60), lx: 560, ly: 530 },
    ...[0, 1, 2, 3].map(i => ({ n: 5, path: poly([[370 + i * 110, 500], [420 + i * 110, 500], [430 + i * 110, 380], [380 + i * 110, 380]]), lx: 400 + i * 110, ly: 450 })),
  ] }),
};
async function showGallery() {
  if (!S.gallery.length) { await modal(`<p class="kicker">Painter's Studio</p><h2>The Gallery</h2><p class="empty">The walls are waiting for your first painting.</p>`, [{ label: 'Back', primary: true }]); return; }
  const items = S.gallery.map((g, i) => `<figure class="gal"><div class="prize"><canvas id="gal-${i}" width="300" height="250"></canvas></div><figcaption><b>${esc(g.name)}</b>${stars(g.stars)}<small>Painted Day ${g.day}</small></figcaption></figure>`).join('');
  setTimeout(() => S.gallery.forEach((g, i) => { const cv = $('#gal-' + i); if (!cv) return; const c = cv.getContext('2d'); c.setTransform(300 / 840, 0, 0, 250 / 700, 0, 0); c.translate(-140, -180); GAMES.paint.draw(c, { pic: PICS[g.pic](), fills: g.fills }, true); }), 30);
  await modal(`<p class="kicker">Painter's Studio</p><h2>The Gallery</h2><div class="gallery">${items}</div>`, [{ label: 'Back', primary: true }]);
}

/* ------------------------------------------------------------------ */
/* Garden Plot (chores here don't use up time)                         */
/* ------------------------------------------------------------------ */
const CROPS = {
  tomato: { name: 'Tomatoes', days: 2, fruit: '#d9452f', leaf: '#4f7a3a' },
  strawberry: { name: 'Strawberries', days: 2, fruit: '#c8342f', leaf: '#5c8f3e' },
  beans: { name: 'Green Beans', days: 2, fruit: '#6fa043', leaf: '#4f7a3a' },
  sunflower: { name: 'Sunflowers', days: 3, fruit: '#f2c230', leaf: '#4f7a3a' },
  rose: { name: 'Roses', days: 3, fruit: '#b23a48', leaf: '#3f6b35' },
  pumpkin: { name: 'Pumpkins', days: 3, fruit: '#e07b24', leaf: '#5c8f3e', big: true },
};
const BEDS = [[170, 420], [450, 420], [730, 420], [170, 680], [450, 680], [730, 680]];
const gcv = $('#garden-canvas');
const Garden = {
  raf: 0, hold: -1, msg: '', msgT: 0,
  enter() { this.card(); $('#garden-controls').innerHTML = ''; const b = document.createElement('button'); b.className = 'btn btn-lg btn-primary'; b.textContent = 'Back to the square'; b.onclick = () => { Snd.sfx('click'); go('village'); }; $('#garden-controls').appendChild(b); cancelAnimationFrame(this.raf); this.last = performance.now(); this.loop(); },
  card() {
    const planted = S.garden.filter(b => b.crop).length, ripe = S.garden.filter(b => b.crop && b.stage >= CROPS[b.crop].days).length;
    $('#garden-card').innerHTML = `<h3>Your Garden Plot</h3><p class="card-note">Garden chores don't use up any time. Click a bed to:</p><ul class="tips"><li><b>Plant</b> seeds in an empty bed</li><li><b>Pull weeds</b> when you see them</li><li><b>Hold</b> on a bed to water it into the green zone</li><li><b>Harvest</b> when it's ripe</li></ul><div class="meter-row"><span>Planted</span><b>${planted} / 6</b></div><div class="meter-row"><span>Ready to pick</span><b>${ripe}</b></div><p class="card-note" style="margin-top:.6em">Plants grow overnight if they were watered well and kept free of weeds.${S.weather === 'Rainy' ? ' <b>The rain watered everything today.</b>' : ''}</p>`;
  },
  say(m) { this.msg = m; this.msgT = 2.4; },
  bedAt(p) { return BEDS.findIndex(([x, y]) => p.x >= x && p.x <= x + 240 && p.y >= y && p.y <= y + 200); },
  async click(i) {
    const b = S.garden[i];
    if (!b.crop) {
      const opts = Object.entries(CROPS).map(([id, c]) => `<button class="recipe-btn" data-val="${id}"><b>${c.name}${S.orders.some(o => o.kind === 'produce' && o.crop === id) ? '<span class="tag">Ordered</span>' : ''}</b><small>Ready in ${c.days} days</small></button>`).join('');
      const v = await modal(`<p class="kicker">Seed packets</p><h2>What will you plant?</h2><div class="recipe-grid">${opts}</div>`, [{ label: 'Not now' }]);
      if (typeof v !== 'string') return;
      Object.assign(b, { crop: v, stage: 0, care: [], water: S.weather === 'Rainy' ? 0.72 : 0, weeds: 0 }); Snd.sfx('good'); this.say(`You planted ${CROPS[v].name.toLowerCase()}. Water them today.`); this.card(); return true;
    }
    if (b.weeds > 0) { b.weeds--; Snd.sfx('click'); this.say(b.weeds ? 'Got one. More weeds to pull.' : 'All the weeds are gone.'); return true; }
    if (b.stage >= CROPS[b.crop].days) { await this.harvest(i); return true; }
    return false;
  },
  async harvest(i) {
    const b = S.garden[i], cr = CROPS[b.crop];
    const q = clamp((b.care.reduce((a, x) => a + x, 0) / Math.max(1, b.care.length)) * 100 + rand(-4, 4), 0, 100);
    const n = starsFor(q); const score = Math.round(q);
    let name = cr.name, extra = '';
    if (cr.big) { const lb = Math.round(lerp(8, 70, q / 100) * 10) / 10; name = `${lb} lb Pumpkin`; extra = `<p style="text-align:center;font-family:var(--font-d);font-size:1.3em"><b>${lb} lb</b></p>`; }
    Snd.sfx(n >= 2 ? 'fanfare' : 'meh');
    S.garden[i] = { crop: null };
    if (n > 0) { S.basket.push({ kind: 'produce', crop: Object.keys(CROPS).find(k => CROPS[k] === cr), cat: 'garden', name, stars: n, score, day: S.day }); recordBest('garden', name, score); storyPoint(1); }
    updateHUD(); this.card();
    await modal(`<p class="kicker">Harvest time</p><h2>${esc(n ? name : 'A sad little harvest')}</h2>${extra}<p style="text-align:center">${stars(n)}</p><p>${n ? (n === 3 ? 'Prize-worthy. The judges are going to love these.' : 'Not bad at all. It went into your basket.') : 'They didn\'t get enough care. Water daily and keep the weeds away.'}</p>`, [{ label: 'Back to the garden', primary: true }]);
  },
  loop() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (S.scene === 'garden') { this.update(dt); this.draw(); }
    this.raf = requestAnimationFrame(() => this.loop());
  },
  update(dt) {
    this.msgT -= dt;
    if (this.hold >= 0) { const b = S.garden[this.hold]; if (b.crop) { b.water = Math.min(1.15, b.water + dt * 0.42); if (Math.random() < dt * 8) Snd.sfx('pour'); if (b.water > 1) this.say('Whoa, that\'s soggy. Too much water.'); } }
  },
  draw() {
    const c = ctxOf(gcv); c.clearRect(0, 0, W, H); const t = performance.now() / 1000;
    S.garden.forEach((b, i) => {
      const [x, y] = BEDS[i];
      c.fillStyle = 'rgba(70,40,20,.35)'; roundRect(c, x - 6, y + 6, 252, 206, 18); c.fill();
      c.fillStyle = b.crop && b.water > 0 ? mixColor('#7a5232', '#3e2614', clamp(b.water, 0, 1)) : '#7a5232'; roundRect(c, x, y, 240, 200, 16); c.fill();
      c.strokeStyle = '#8a6a3c'; c.lineWidth = 10; roundRect(c, x, y, 240, 200, 16); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; for (let r = 1; r < 4; r++) { c.beginPath(); c.moveTo(x + 14, y + r * 50); c.lineTo(x + 226, y + r * 50); c.stroke(); }
      if (!b.crop) { c.fillStyle = 'rgba(251,243,226,.9)'; c.font = '800 24px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+ Plant', x + 120, y + 100); return; }
      const cr = CROPS[b.crop], g = clamp(b.stage / cr.days, 0, 1), ripe = b.stage >= cr.days;
      for (let k = 0; k < 3; k++) drawPlant(c, x + 50 + k * 70, y + 150, cr, g, ripe, t + k);
      for (let w = 0; w < b.weeds; w++) { const wx = x + 30 + ((w * 83) % 180), wy = y + 175 - (w % 2) * 20; c.strokeStyle = '#7a8a2a'; c.lineWidth = 5; for (let s = -1; s <= 1; s++) { c.beginPath(); c.moveTo(wx, wy); c.quadraticCurveTo(wx + s * 14, wy - 18, wx + s * 20 + Math.sin(t * 3 + w) * 3, wy - 34); c.stroke(); } }
      // water meter
      const mx = x + 20, my = y - 30, mw = 200; c.fillStyle = 'rgba(251,243,226,.95)'; roundRect(c, mx - 6, my - 6, mw + 12, 26, 13); c.fill();
      c.fillStyle = '#e3d3b2'; roundRect(c, mx, my, mw, 14, 7); c.fill();
      c.fillStyle = 'rgba(111,143,94,.45)'; c.fillRect(mx + mw * 0.6, my, mw * 0.25, 14);
      c.fillStyle = b.water > 1 ? '#a8344a' : '#5f93c0'; roundRect(c, mx, my, Math.max(8, mw * clamp(b.water, 0, 1)), 14, 7); c.fill();
      if (ripe) { c.fillStyle = '#a8344a'; roundRect(c, x + 150, y + 10, 82, 32, 16); c.fill(); c.fillStyle = '#fff'; c.font = '800 18px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Ripe!', x + 191, y + 27); }
      if (this.hold === i) { c.save(); c.translate(x + 180, y + 20); c.rotate(0.5); c.fillStyle = '#7fa06a'; roundRect(c, -40, -30, 80, 60, 14); c.fill(); c.fillRect(30, -10, 50, 12); c.restore(); c.fillStyle = 'rgba(120,180,230,.7)'; for (let d = 0; d < 6; d++) c.fillRect(x + 150 - d * 16 + Math.sin(t * 20 + d) * 3, y + 60 + ((t * 300 + d * 40) % 100), 4, 14); }
    });
    if (this.msgT > 0) banner(c, this.msg);
  },
};
function drawPlant(c, x, y, cr, g, ripe, t) {
  const h = 20 + g * 90, sway = Math.sin(t * 1.5) * 3;
  c.strokeStyle = cr.leaf; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway, y - h / 2, x + sway, y - h); c.stroke();
  c.fillStyle = cr.leaf; const leaves = 1 + Math.floor(g * 3);
  for (let k = 0; k < leaves; k++) { const ly = y - 14 - k * (h / 4); c.beginPath(); c.ellipse(x - 14 + sway / 2, ly, 14, 7, -0.6, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(x + 14 + sway / 2, ly - 6, 14, 7, 0.6, 0, Math.PI * 2); c.fill(); }
  if (cr.big) { const r = 8 + g * 26; c.fillStyle = ripe ? cr.fruit : mixColor('#9cbf5a', cr.fruit, g); c.beginPath(); c.ellipse(x + 18, y - r * 0.7, r * 1.15, r * 0.85, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x + 18, y - r * 0.7, r * 0.45, r * 0.85, 0, 0, Math.PI * 2); c.stroke(); return; }
  if (g >= 0.5) {
    const top = [x + sway, y - h];
    if (cr === CROPS.sunflower) { const r = ripe ? 26 : 14; c.fillStyle = cr.fruit; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.ellipse(top[0] + Math.cos(a) * r, top[1] + Math.sin(a) * r, r * 0.55, r * 0.22, a, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#5a3418'; c.beginPath(); c.arc(top[0], top[1], r * 0.6, 0, Math.PI * 2); c.fill(); return; }
    const col = ripe ? cr.fruit : mixColor('#a9c96a', cr.fruit, 0.25); const n = ripe ? 3 : 1;
    for (let k = 0; k < n; k++) { c.fillStyle = col; c.beginPath(); if (cr === CROPS.beans) c.ellipse(top[0] - 12 + k * 12, top[1] + 20 + k * 10, 4, 16, 0.2, 0, Math.PI * 2); else c.arc(top[0] - 12 + k * 14, top[1] + 10 + (k % 2) * 16, cr === CROPS.rose ? 12 : 10, 0, Math.PI * 2); c.fill(); }
  }
}
gcv.addEventListener('pointerdown', async e => {
  const p = toLogical(e, gcv), i = Garden.bedAt(p); if (i < 0) return;
  const acted = await Garden.click(i);
  if (!acted && S.garden[i].crop) { Garden.hold = i; gcv.setPointerCapture(e.pointerId); }
});
const stopWater = () => { if (Garden.hold >= 0) { const b = S.garden[Garden.hold]; Garden.say(b.water > 1 ? 'Too soggy. It will dry a little overnight.' : b.water >= 0.6 && b.water <= 0.85 ? 'Just right!' : b.water < 0.6 ? 'Still a little thirsty.' : 'A touch too much, but okay.'); Garden.hold = -1; } };
gcv.addEventListener('pointerup', stopWater); gcv.addEventListener('pointercancel', stopWater);
function growGardenOvernight() {
  let grew = 0;
  for (const b of S.garden) {
    if (!b.crop) continue; const cr = CROPS[b.crop];
    if (b.stage >= cr.days) { b.weeds = Math.min(3, b.weeds + (Math.random() < 0.4 ? 1 : 0)); continue; }
    let acc = b.water >= 0.6 && b.water <= 0.85 ? 1 : b.water >= 0.4 && b.water <= 1 ? 0.7 : b.water > 1 ? 0.45 : 0;
    acc = Math.max(0, acc - b.weeds * 0.15);
    if (acc > 0) { b.stage++; b.care.push(acc); grew++; }
    b.water = 0; b.weeds = Math.min(3, b.weeds + Math.floor(rand(0, 2.4)));
  }
  return grew;
}

/* ------------------------------------------------------------------ */
/* County Fair                                                        */
/* ------------------------------------------------------------------ */
function ribbonFor(score) { return score >= 85 ? ['Blue Ribbon', '#2f6b8a', 3] : score >= 70 ? ['Red Ribbon', '#a8344a', 2] : score >= 45 ? ['White Ribbon', '#e9e2d4', 1] : null; }
function ribbonSVG(col) { return `<svg viewBox="0 0 60 80"><path d="M18 40 L8 78 L20 70 L26 80 L30 44Z M42 40 L52 78 L40 70 L34 80 L30 44Z" fill="${col}" stroke="rgba(0,0,0,.2)"/><circle cx="30" cy="28" r="24" fill="${col}" stroke="rgba(0,0,0,.2)" stroke-width="2"/><circle cx="30" cy="28" r="15" fill="#f6e7c1"/><path d="M30 18l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7-5.5-4.5 7-.5z" fill="#c8862a"/></svg>`; }
async function countyFair() {
  S.day = FAIR_DAY; S.slot = 1; S.weather = 'Sunny'; updateHUD(); go('village');
  Snd.sfx('fanfare');
  await modal(`<p class="kicker">Annual Fair Day</p><h2>The Honeybrook Annual Craft Fair</h2><p>Bunting flaps in the breeze, a fiddle plays by the fountain, and the whole village gathers in the square. Big Mama Mary has saved you a seat up front.</p><p>The judges are ready to look at your best work from this year. Open Story Trail any time to walk through the places from the book.</p>`, [{ label: 'Hear the results', primary: true }]);
  const res = [];
  const add = (cat, entry, score, detail) => { const r = entry ? ribbonFor(score) : null; res.push({ cat, entry, score, r, detail }); if (r) { S.ribbons++; S.coins += r[2] * 10; } };
  for (const [k, label] of Object.entries(CATS)) add(label, S.best[k]?.name, S.best[k]?.score || 0, '');
  const helper = S.delivered >= 4 ? 90 : S.delivered >= 2 ? 72 : S.delivered >= 1 ? 50 : 0;
  add('Good Neighbor', S.delivered ? `${S.delivered} order${S.delivered > 1 ? 's' : ''} delivered` : null, helper, '');
  const cards = res.map(x => `<div class="ribbon">${x.r ? ribbonSVG(x.r[1]) : '<svg viewBox="0 0 60 80"><circle cx="30" cy="28" r="24" fill="none" stroke="#c9b48c" stroke-width="3" stroke-dasharray="5 5"/></svg>'}<div>${x.cat}</div><small style="color:var(--ink-2);display:block">${x.entry ? esc(x.entry) : 'No entry'}</small><small style="color:var(--berry);display:block">${x.r ? x.r[0] + ' · +' + x.r[2] * 10 : x.entry ? 'Honorable mention' : ''}</small></div>`).join('');
  const lines = res.map(x => x.entry ? `<li class="row"><div class="grow"><b>${x.cat}</b><small>${esc(x.entry)}</small></div><b>${x.r ? '+' + x.r[2] * 10 + ' coins' : '—'}</b></li>` : '').join('');
  const won = res.filter(x => x.r).length;
  updateHUD(); Snd.sfx(won ? 'fanfare' : 'meh');
  await modal(`<p class="kicker">Annual Fair results · Year ${S.season}</p><h2>${res.every(x => x.r && x.r[2] === 3) ? 'A clean sweep of blue ribbons!' : won ? 'Ribbons for ' + esc(S.name) + '!' : 'Better luck next fair'}</h2><div class="ribbon-row">${cards}</div><p>${won ? 'Buddy is grinning ear to ear, and Big Mama Mary is telling everybody she taught you everything you know.' : 'The whole village cheered anyway. There will be another annual fair next year.'}</p>`, [{ label: 'Begin a new year', primary: true }]);
  S.season++; S.day = 1; S.slot = 0; S.weather = rollWeather(); S.best = {}; S.delivered = 0; S.orders = []; refreshOrders();
  updateHUD(); Village.populate();
  toast(`Fair Year ${S.season} begins. The next annual fair is in ${FAIR_DAY - 1} days.`);
}


/* ------------------------------------------------------------------ */
/* Saving: one saved game per visitor, kept on the Honeybrook server   */
/* ------------------------------------------------------------------ */
const API = 'port/8000';
const Save = {
  base: API.startsWith('__PORT') ? 'http://localhost:8000' : API,
  last: '', ok: null, busy: false,
  headers() { const h = { 'Content-Type': 'application/json' }; if (this.base.includes('localhost')) h['X-Save-Id'] = 'local-test'; return h; },
  snapshot() {
    return { v: 1, name: S.name, day: S.day, slot: S.slot, weather: S.weather, season: S.season, coins: S.coins, ribbons: S.ribbons,
      basket: S.basket, orders: S.orders, owned: S.owned, delivered: S.delivered, best: S.best, gallery: S.gallery, garden: S.garden, carnivalTickets: S.carnivalTickets || 0, carnivalTreats: S.carnivalTreats || [],
      friend: S.friend || {}, talked: S.talked || {}, made: S.made || [], room: S.room || {}, restDay: S.restDay || {}, homeGift: S.homeGift || {}, storyPts: S.storyPts || 0, glow: S.glow ?? 20, woodsOpen: !!S.woodsOpen, woodsCall: !!S.woodsCall, storyNew: !!S.storyNew, found: S.found || {}, usedSlot: !!S.usedSlot, savedAt: Date.now() };
  },
  async load() {
    try { const r = await fetch(this.base + '/api/save', { headers: this.headers() }); if (!r.ok) throw 0; const j = await r.json(); this.ok = true; return j.save; }
    catch (e) { this.ok = false; return null; }
  },
  async push(force) {
    if (S.scene === 'title' || this.busy) return;
    const snap = this.snapshot(), key = JSON.stringify({ ...snap, savedAt: 0 });
    if (!force && key === this.last) return;
    this.busy = true;
    try { const r = await fetch(this.base + '/api/save', { method: 'POST', headers: this.headers(), body: JSON.stringify(snap), keepalive: true }); if (!r.ok) throw 0; this.last = key; this.ok = true; saveIndicator('Saved'); }
    catch (e) { this.ok = false; saveIndicator('Not saving right now', true); }
    this.busy = false;
  },
  async wipe() { try { await fetch(this.base + '/api/save', { method: 'DELETE', headers: this.headers() }); } catch (e) { } this.last = ''; },
  apply(d) {
    const keys = ['name', 'day', 'slot', 'weather', 'season', 'coins', 'ribbons', 'basket', 'orders', 'owned', 'delivered', 'best', 'gallery', 'garden', 'carnivalTickets', 'carnivalTreats', 'found', 'friend', 'talked', 'made', 'room', 'restDay', 'homeGift', 'storyPts', 'glow', 'woodsOpen', 'woodsCall', 'storyNew'];
    for (const k of keys) if (d[k] !== undefined) S[k] = d[k];
    if (!Array.isArray(S.garden) || S.garden.length !== 6) S.garden = Array.from({ length: 6 }, () => ({ crop: null }));
    S.usedSlot = false;
  },
};
let saveT;
function saveIndicator(text, bad) { const el = $('#save-ind'); if (!el) return; el.textContent = text; el.classList.toggle('bad', !!bad); el.classList.add('show'); clearTimeout(saveT); if (!bad) saveT = setTimeout(() => el.classList.remove('show'), 1600); }
setInterval(() => Save.push(), 4000);
addEventListener('pagehide', () => Save.push());
document.addEventListener('visibilitychange', () => { if (document.hidden) Save.push(); });

async function continueGame(d) {
  Snd.init(); Snd.ctx && Snd.ctx.resume(); Snd.sfx('good');
  Save.apply(d); refreshOrders();
  $('#hud').hidden = false; go('village');
  toast(`Welcome back to Honeybrook, ${S.name}.`);
  S.found = S.found || {}; if (!S.found.v4) { S.found.v4 = true; setTimeout(() => modal(`<p class="kicker">New in Honeybrook</p><h2>Three new places</h2><p>Open the Town Map from the Fair square to visit all three places in Honeybrook town:</p><ul class="list"><li class="row"><div class="grow"><b>Bears' Den</b><small>The homes of Honeybrook, including your own room to decorate with things you make</small></div></li><li class="row"><div class="grow"><b>Bears' Hive</b><small>A market stall for selling, plus the Cake Shop, Bead & Jewel Shop, Woodshop, and Braiding Salon</small></div></li><li class="row"><div class="grow"><b>Bears' Rest</b><small>A quiet meadow with Willie's Bench, the Remembrance Stones, and wildflowers</small></div></li></ul><p>Talk to neighbors every day and give them gifts. Friends invite you into their homes.</p>`, [{ label: 'Go explore', primary: true }]), 900); }
  if (d.usedSlot) await advanceTime();
  Save.push(true);
}
(async () => {
  const d = await Save.load();
  if (!d) return;
  $('#name-box').hidden = true; $('#btn-start').hidden = true;
  const box = $('#continue-box'); box.hidden = false;
  $('#continue-info').innerHTML = `Welcome back, <b>${esc(d.name)}</b>.<br>Season ${d.season}, Day ${d.day} · ${d.coins} coins · ${(d.storyPts !== undefined ? STORY_AT.filter(a => d.storyPts >= a).length : 1)} chapters · ${d.ribbons} ribbon${d.ribbons === 1 ? '' : 's'}`;
  $('#btn-continue').onclick = () => continueGame(d);
  $('#btn-newgame').onclick = async () => {
    const v = await modal(`<h2>Start a brand-new game?</h2><p>This will erase ${esc(d.name)}'s saved game: coins, ribbons, garden, gallery, and everything in the basket. This can't be undone.</p>`, [{ label: 'Keep my game', primary: true, value: 'keep' }, { label: 'Erase and start over', value: 'wipe' }]);
    if (v !== 'wipe') return;
    await Save.wipe(); box.hidden = true; $('#name-box').hidden = false; $('#btn-start').hidden = false; $('#player-name').value = '';
  };
})();

/* ------------------------------------------------------------------ */
/* Boot                                                               */
/* ------------------------------------------------------------------ */
const hudToggle = $('#hud-toggle');
function setHudMenuOpen(open) {
  $('#hud').classList.toggle('hud-open', open);
  hudToggle.setAttribute('aria-expanded', String(open));
  hudToggle.title = open ? 'Close game menu' : 'Open game menu';
  hudToggle.textContent = open ? '× Close menu' : '☰ Menu';
}
hudToggle.addEventListener('click', () => setHudMenuOpen(!$('#hud').classList.contains('hud-open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#hud').classList.contains('hud-open')) setHudMenuOpen(false); });
$('#stage').addEventListener('pointerdown', e => { if ($('#hud').classList.contains('hud-open') && !e.target.closest('#hud, #hud-toggle')) setHudMenuOpen(false); });
$('#hud').addEventListener('click', e => { if (e.target.closest('button')) setTimeout(() => setHudMenuOpen(false), 0); });
$('#btn-home').onclick = () => { Snd.sfx('click'); if (S.scene === 'home') { Stay.goBack(); return; } if ((S.scene === 'bakery' && Bakery.st && Bakery.st.phase !== 'done') || (S.scene === 'work' && Work.st && !Work.st.done)) { modal('<h2>Leave your project?</h2><p>What you\'ve started will go to waste, and this part of the day will be used up.</p>', [{ label: 'Stay' }, { label: 'Leave', primary: true, value: 'go' }]).then(v => v === 'go' && leaveActivity()); return; } leaveActivity(); };
$('#btn-town').onclick = () => { Snd.sfx('click'); go('town'); };
$('#btn-orders').onclick = () => { Snd.sfx('click'); showOrders(); };
$('#btn-basket').onclick = () => { Snd.sfx('click'); showBasket(); };
$('#btn-shop').onclick = () => { Snd.sfx('click'); showStore(); };
$('#btn-story').onclick = () => { Snd.sfx('click'); showStory(); };
$('#btn-storytrail').onclick = () => { Snd.sfx('click'); showStoryTrail(); };
$('#btn-sound').onclick = () => { Snd.init(); const on = Snd.toggle(); $('#snd-waves').style.opacity = on ? 1 : 0.15; };
$('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-start').click(); });
$('#btn-start').onclick = async () => {
  Snd.init(); Snd.ctx && Snd.ctx.resume(); Snd.sfx('good');
  S.name = ($('#player-name').value || '').trim() || 'Friend';
  S.weather = 'Sunny'; refreshOrders();
  $('#hud').hidden = false; go('village'); Save.push(true);
  await modal(`<p class="kicker">The bridge into Honeybrook</p><h2>Welcome, ${esc(S.name)}</h2><p>You came over the creek in the rain with tired feet and nowhere in particular to go. On the far side of Tom Bridgewell's bridge, a bear named Amelia was waiting with a lantern.</p><p style="font-family:var(--font-d);font-size:1.1em">"If you need a place," she said, "we'll make one."</p><p>Sammy pushed a plate toward you. "You can eat first." They gave you the spare room at the Welcome House.</p><p>In <b>${FAIR_DAY - 1} days</b>, Honeybrook holds its annual County Craft Fair beneath the bronze statue of Goldilocks and the Three Bears. Every shop is open: <b>Wally's Bakery</b>, the <b>Sewing Cottage</b>, <b>Yarn Shop</b>, <b>Painter's Studio</b>, Tom's <b>Craft Barn</b>, the <b>Fishing Pond</b>, your own <b>Garden Plot</b>, and up the old creek road, <b>Bear Hollow</b>, with its hives and porridge pots. Harold Pawst brings <b>orders</b>. Fill them to earn coins.</p><p>Use the new <b>Story Trail</b> button to explore Honeybrook, Bear Hollow, and the Northern Woods as the book describes them. Storybook Lane appears when the whole first book has been told. Bear's Den, Bear's Hive and Bear's Rest are all in Honeybrook town. Return to the Fair square for its craft shops, midway games, and little circus.</p><p>Each visit to a shop takes one part of the day. Garden chores don't. Kindness makes the honey glow brighter here, and golden honey makes everything sweeter.</p><p>Big Mama Mary carries the town's stories. Finish projects and fill orders, and she'll tell you the story of Goldilocks and Bear Hollow, one chapter at a time.</p>`, [{ label: 'Step into the square', primary: true }]);
};

/* testing hooks */
window.render_game_to_text = () => JSON.stringify({ scene: S.scene, day: S.day, slot: SLOTS[S.slot], weather: S.weather, coins: S.coins, ribbons: S.ribbons, basket: S.basket.length, orders: S.orders.map(o => o.who + ':' + o.text), work: Work.st && { craft: Work.st.craft.id, done: Work.st.done }, garden: S.garden.map(b => b.crop ? b.crop + ':' + b.stage : '-').join(','), bake: Bakery.st && { phase: Bakery.st.phase, i: Bakery.st.i, fill: +Bakery.st.fill.toFixed(2), mix: +Bakery.st.mix.toFixed(2), bake: +Bakery.st.bake.toFixed(2) }, pond: Pond.st && { phase: Pond.st.phase, casts: Pond.st.casts, reel: Pond.st.reel && { prog: +Pond.st.reel.prog.toFixed(2) } } });
window.__S = S; window.__Work = Work; window.__Garden = Garden; window.__WS = WORKSHOPS;
window.__reelDbg = () => Pond.st && Pond.st.reel && { fish: Pond.st.reel.fish, bar: Pond.st.reel.bar, h: Pond.st.reel.h, prog: Pond.st.reel.prog };

/* ------------------------------------------------------------------ */
/* Honeybrook Fair's little midway                                    */
/* ------------------------------------------------------------------ */
const Carnival = {
  snack: {
    cotton: { name: 'Cotton Candy', icon: '🍭', cost: 2, line: 'A cloud-soft swirl spun fresh at the midway.' },
    apple: { name: 'Candy Apple', icon: '🍎', cost: 3, line: 'A crisp apple with a shiny red sugar shell.' },
    funnel: { name: 'Funnel Cake', icon: '🍰', cost: 4, line: 'Warm, golden ribbons dusted with powdered sugar.' },
    popcorn: { name: 'Popcorn & Lemonade', icon: '🍿', cost: 3, line: 'A little salty, a little sweet, and nice to share.' }
  },
  async visit(kind) {
    if (this.snack[kind]) return this.buy(kind);
    if (kind === 'wheel' || kind === 'carousel') return this.ride(kind);
    if (kind === 'prizes') return this.prizes();
    if (kind === 'rings' || kind === 'ducks' || kind === 'balloons') return this.game(kind);
    if (kind === 'circus') { go('circus'); return; }
  },
  async buy(kind) {
    const item = this.snack[kind];
    if (S.coins < item.cost) {
      await modal(`<p class="kicker">Midway Treats</p><h2>${item.icon} ${item.name}</h2><p>${item.line}</p><p>This treat costs <b>${item.cost} coins</b>. You have <b>${S.coins}</b>. You can earn coins at the market stall or enjoy the rides and shows for free.</p>`, [{label:'Back to the midway',primary:true}]);
      return;
    }
    const choice = await modal(`<p class="kicker">A little carnival treat</p><h2>${item.icon} ${item.name}</h2><p>${item.line}</p><p>Spend <b>${item.cost} coins</b>? You have ${S.coins} coins. Treats are saved in your Fair keepsakes.</p>`, [{label:'Maybe later'}, {label:`Enjoy one · ${item.cost} coins`,primary:true,value:'buy'}]);
    if (choice !== 'buy') return;
    S.coins -= item.cost; S.carnivalTreats = S.carnivalTreats || []; S.carnivalTreats.push(kind);
    Snd.sfx('good'); updateHUD(); Save.push(true);
    await modal(`<p class="kicker">Fresh from the midway</p><h2>Yum! ${item.name}</h2><p>${item.line}</p><p>You have enjoyed ${S.carnivalTreats.length} carnival ${S.carnivalTreats.length === 1 ? 'treat' : 'treats'} so far. Take your time—there is no rush to leave the Fair.</p>`, [{label:'Back to the carnival',primary:true}]);
  },
  action(kind) {
    const scenes = {
      carousel: { label:'Painted ponies circling under golden lights', art:'<div class="midway-canopy">🎠</div><div class="midway-deck"></div><div class="midway-ponies"><span>🐴</span><span>🐴</span><span>🐴</span><span>🐴</span><span>🐴</span><span>🐴</span></div><div class="midway-rest">🐴 🐴<small>resting behind the curtain</small></div>' },
      wheel: { label:'A little Ferris wheel turning above Honeybrook', art:'<div class="midway-wheel"><div class="midway-spokes"></div><i>🎡</i><span>🟡</span><span>🔵</span><span>🟡</span><span>🔵</span><span>🟡</span><span>🔵</span></div>' },
      rings: { label:'Rings sailing toward honey jars', art:'<div class="midway-target"><span class="midway-jar">🍯</span><span class="midway-ring">⭕</span><span class="midway-ring second">⭕</span><span class="midway-jar">🍯</span><span class="midway-jar">🍯</span></div>' },
      ducks: { label:'Three ducks drifting across the pond', art:'<div class="midway-water"><span>🦆</span><span>🦆</span><span>🦆</span></div>' },
      balloons: { label:'Bright balloons bobbing above the midway', art:'<div class="midway-balloons"><span>🎈</span><span>🎈</span><span>🎈</span></div>' }
    };
    const scene=scenes[kind]; if(!scene)return '';
    return '<div class="midway-action midway-'+kind+'" role="img" aria-label="'+scene.label+'"><span class="midway-lights" aria-hidden="true">✦　✧　✦　✧　✦</span>'+scene.art+'</div>';
  },
  async ride(kind) {
    const wheel = kind === 'wheel';
    const name = wheel ? 'Honeywheel' : 'Honey-Go-Round';
    const text = wheel
      ? 'The little Ferris wheel lifts you above Honeybrook. At the top, you can see the creek bridge, the welcome house, and the Fair lights all at once.'
      : 'Painted ponies circle beneath strings of golden lights. You choose a honey-colored pony with a blue saddle.';
    const value = await modal(`<p class="kicker">A gentle Fair ride</p><button type="button" class="btn btn-small btn-ghost challenge-back" data-val="back">← Back to the midway</button><h2>${wheel ? '🎡' : '🎠'} ${name}</h2><div class="carnival-act ride-act"><div class="ride-picture">${this.action(wheel ? 'wheel' : 'carousel')}</div><span class="act-icon" aria-hidden="true">${wheel ? '🎡' : '🐴'}</span><p>${text}</p><p class="ride-question">${wheel ? 'The wheel makes 3 turns. If you count 4 lanterns on each side, how many lanterns can you spot altogether?' : 'The carousel has 8 ponies. Two are resting behind the curtain. How many ponies are ready to ride?'}</p></div>`,
      (wheel ? [{label:'2'}, {label:'6'}, {label:'8',primary:true,value:'correct'}, {label:'12'}] : [{label:'2'}, {label:'6',primary:true,value:'correct'}, {label:'8'}, {label:'12'}]));
    if (value === 'back') return;
    S.usedSlot = true;
    if (value === 'correct') { Snd.sfx('good'); toast(wheel ? 'Eight lanterns—nice counting!' : 'Six ponies are ready—well counted!'); }
    else { Snd.sfx('click'); toast('The ride is the prize. Want to count it together next time?'); }
  },
  async game(kind) {
    const q = {
      rings: { title:'Ring Toss', icon:'🎯', intro:'The rings have to land around the bottle neck. Before you toss, solve the midway number riddle:', prompt:'A prize shelf has 3 honey jars and 4 berry jars. How many jars are there altogether?', answers:[['6','6'],['7','7'],['8','8']], correct:'7', tickets:3, hint:'Try counting on from 3: 4, 5, 6, 7.' },
      ducks: { title:'Lucky Duck Pond', icon:'🦆', intro:'Three ducks drift by. Pick the one with the word that has a long A sound:', prompt:'Which duck carries a long A word?', answers:[['CAT','cat'],['CAKE','cake'],['CAN','can']], correct:'cake', tickets:2, hint:'The silent e at the end helps the A say its name: cake.' },
      balloons: { title:'Balloon Pop', icon:'🎈', intro:'Pick the balloon that completes the pattern:', prompt:'🔴  🔵  🔴  🔵  🔴  ?', answers:[['🔴','red'],['🟡','yellow'],['🔵','blue']], correct:'blue', tickets:2, hint:'The colors take turns: red, blue, red, blue, red…' }
    }[kind];
    const ans = await modal(`<p class="kicker">Midway challenge · Just for fun</p><button type="button" class="btn btn-small btn-ghost challenge-back" data-val="back">← Back to the midway</button><h2>${q.icon} ${q.title}</h2><p>${q.intro}</p><div class="carnival-act game-act"><div class="ride-picture">${this.action(kind)}</div><p><b>${q.prompt}</b></p></div><p>Take a thoughtful guess. A wrong answer is just another chance to learn.</p>`,
      q.answers.map(([label,val])=>({label,primary:val===q.correct,value:val})));
    if (ans === 'back') return;
    S.usedSlot = true;
    if (ans === q.correct) {
      S.carnivalTickets = (S.carnivalTickets || 0) + q.tickets;
      Snd.sfx('good'); updateHUD(); Save.push(true);
      await modal(`<p class="kicker">Well done!</p><h2>${q.icon} ${q.title}</h2><p>${q.hint}</p><p>You earned <b>${q.tickets} carnival tickets</b>. Your purse now holds ${S.carnivalTickets}.</p>`,[{label:'Back to the midway',primary:true}]);
    } else {
      S.carnivalTickets = (S.carnivalTickets || 0) + 1;
      Snd.sfx('click'); updateHUD(); Save.push(true);
      await modal(`<p class="kicker">A good try</p><h2>Let’s work it out together</h2><p>${q.hint}</p><p>You still earned <b>1 carnival ticket</b> for giving it a try. Your purse now holds ${S.carnivalTickets}.</p>`,[{label:'Back to the midway',primary:true}]);
    }
  },
  async circus() {
    const robin = await modal(`<p class="kicker">Under the big top</p><button type="button" class="btn btn-small btn-ghost challenge-back" data-val="back">← Back to the carnival</button><h2>🎪 The Honeybrook Little Circus</h2><p>Find a seat beneath the striped tent. Robin is ready to sing, Templar has brought a clockwork bee, and Big Mama Mary is saving a story for the finale. The acts are friendly, the audience can join in, and everyone gets a warm welcome.</p><div class="carnival-act"><span class="act-icon">🎤</span><b>Act One · Robin’s rhyme</b><p>Robin sings: “A bear brought a pear, and sat in a ___.” Which word rhymes?</p></div>`,[{label:'chair',primary:true,value:'right'},{label:'river',value:'wrong'},{label:'honey',value:'wrong'}]);
    if (robin === 'back') { go('carnival'); return; }
    let score = robin === 'right' ? 1 : 0; $('#circus-act-line').textContent = 'Act One: Robin leads the audience in a rhyme.';
    const bee = await modal(`<p class="kicker">Act Two · Templar’s clockwork bee</p><button type="button" class="btn btn-small btn-ghost challenge-back" data-val="back">← Back to the carnival</button><h2>🐝 Follow the golden lights</h2><p>The bee blinks a pattern: <b>gold, blue, gold, blue, gold…</b> Which light should blink next?</p>`,[{label:'Gold',value:'wrong'},{label:'Blue',primary:true,value:'right'},{label:'Green',value:'wrong'}]);
    if (bee === 'back') { go('carnival'); return; }
    if (bee === 'right') score++; $('#circus-act-line').textContent = 'Act Two: Templar’s clockwork bee loops around the golden ring.';
    const story = await modal(`<p class="kicker">Act Three · Big Mama Mary’s story</p><button type="button" class="btn btn-small btn-ghost challenge-back" data-val="back">← Back to the carnival</button><h2>📖 The traveler at the door</h2><p>A new cub arrives in the rain. What does Sammy’s Honeybrook welcome say first?</p>`,[{label:'“Tell us everything.”',value:'wrong'},{label:'“You can eat first.”',primary:true,value:'right'},{label:'“Come back tomorrow.”',value:'wrong'}]);
    if (story === 'back') { go('carnival'); return; }
    if (story === 'right') score++; $('#circus-act-line').textContent = 'Act Three: Big Mama Mary brings the traveler in from the rain.';
    S.usedSlot = true;
    const tickets = 2 + score;
    S.carnivalTickets = (S.carnivalTickets || 0) + tickets;
    Snd.sfx('good'); updateHUD(); Save.push(true);
    const finale = await modal(`<p class="kicker">The circus finale</p><button type="button" class="btn btn-small btn-ghost challenge-back" data-val="back">← Back to the carnival</button><h2>✨ A standing ovation!</h2><p>The clockwork bee loops over the tent, Robin leads the crowd in the final chorus, and Big Mama Mary tells a story where everyone gets to come in from the rain.</p><p>You got ${score} of 3 audience challenges right and earned <b>${tickets} carnival tickets</b>. Everyone at the little circus belongs in the show.</p>`,[{label:'Back to the tent',primary:true}]);
    if (finale === 'back') go('carnival');
  },
  async prizes() {
    const choice = await modal(`<p class="kicker">Prize Booth</p><h2>🎟️ Trade tickets for a Fair ribbon</h2><p>Choose a keepsake for your collection. A ribbon costs 6 tickets. You have <b>${S.carnivalTickets || 0}</b>.</p><p>Ribbons are just for fun. You can keep exploring even if you save your tickets.</p>`,[{label:'Keep my tickets'},{label:'Trade 6 tickets for a ribbon',primary:true,disabled:(S.carnivalTickets||0)<6,value:'trade'}]);
    if (choice === 'trade') { S.carnivalTickets -= 6; S.ribbons = (S.ribbons || 0) + 1; Snd.sfx('good'); updateHUD(); Save.push(true); toast('A shiny Fair ribbon joins your keepsakes!'); }
  }
};
document.querySelectorAll('[data-carnival]').forEach(button => button.addEventListener('click', () => { Snd.sfx('click'); Carnival.visit(button.dataset.carnival); }));
$('#btn-neighbors').addEventListener('click', () => FriendBook.open());
$('#circus-back').addEventListener('click', () => go('carnival'));
$('#circus-start').addEventListener('click', () => { Snd.sfx('ding'); $('#scene-circus').classList.add('showtime'); $('#circus-act-line').textContent = 'The curtains open. Robin steps into the golden ring…'; Carnival.circus(); });
$('#home-back').addEventListener('click', () => Stay.goBack());
$('#home-objects').addEventListener('click', e => { const b = e.target.closest('[data-home-object]'); if (b) Stay.touch(b.dataset.homeObject); });

})();
