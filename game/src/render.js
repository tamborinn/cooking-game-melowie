import { INGREDIENTS, RECIPES } from './recipes.js';
import { formatClock, orderUrgency } from './timer.js';

const W = 1280, H = 800;
const PALETTE = { dark: '#152b27', ink: '#253631', cream: '#f6edd9', white: '#fff9ec', wood: '#8b5734', woodLight: '#bc8150', gold: '#e8b955', green: '#24634d', red: '#b9473e', tile: '#39816c' };
const CARD_X = 20, CARD_Y = 78, CARD_W = 208, CARD_H = 190, CARD_GAP = 8;
const SHELF_X = 300, SHELF_Y = 594, CELL_W = 180, CELL_H = 70, CELL_GAP = 8;

function grad(ctx, x, y, h, a, b) { const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function box(ctx, x, y, w, h, r, fill, stroke = null, shadow = false) {
  ctx.save(); if (shadow) { ctx.shadowColor = 'rgba(8,22,19,.34)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5; }
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
}
function label(ctx, str, x, y, size, color = PALETTE.ink, align = 'left', weight = 600) {
  ctx.font = `${weight} ${size}px system-ui,sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(str, x, y);
}
function ellipse(ctx, x, y, rx, ry, fill, stroke = null) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function leaf(ctx, x, y, s, color, angle = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(0, s); ctx.bezierCurveTo(-s * .95, s * .4, -s * .8, -s, 0, -s); ctx.bezierCurveTo(s * .9, -s, s * .95, s * .4, 0, s); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(244,237,191,.75)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, s * .7); ctx.lineTo(0, -s * .7); ctx.stroke(); ctx.restore();
}

/** Ten ingredient icons use only Canvas paths, highlights, and shadows. */
function food(ctx, id, x, y, size, angle = 0) {
  const scale = size / 42; ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(25,22,15,.22)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 2;
  if (id === 'rice') {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { ellipse(ctx, (c - 2) * 6 + (r % 2) * 2, (r - 1) * 7, 4, 2.5, ['#fff9df', '#ead9ad', '#f7edcd'][(r + c) % 3]); }
  } else if (id === 'noodles') {
    ctx.lineWidth = 3.8; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-15 + i * 5, 14); ctx.bezierCurveTo(-24 + i * 4, -5, 15 - i * 4, 7, -12 + i * 7, -14); ctx.strokeStyle = ['#d58b25', '#f5d56d', '#e7aa36', '#fff0a1'][i]; ctx.stroke(); }
  } else if (id === 'chicken' || id === 'beef') {
    const c = id === 'chicken' ? '#d68a4f' : '#853f32';
    ctx.beginPath(); ctx.moveTo(-17, -5); ctx.quadraticCurveTo(-15, -17, -4, -13); ctx.quadraticCurveTo(8, -20, 15, -7); ctx.quadraticCurveTo(22, 5, 10, 12); ctx.quadraticCurveTo(-3, 20, -15, 10); ctx.quadraticCurveTo(-21, 3, -17, -5); ctx.fillStyle = c; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.fillStyle = 'rgba(255,221,155,.6)'; ctx.beginPath(); ctx.ellipse(-4, -7, 7, 2.5, -.3, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'egg') {
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 18, -.1, 0, Math.PI * 2); ctx.fillStyle = '#fff9e7'; ctx.fill(); ctx.strokeStyle = '#d7cba9'; ctx.lineWidth = 1.5; ctx.stroke(); ellipse(ctx, 2, 2, 6, 6, '#edb83d');
  } else if (id === 'tofu') {
    ctx.beginPath(); ctx.roundRect(-15, -12, 30, 24, 4); ctx.fillStyle = '#f0dfb9'; ctx.fill(); ctx.strokeStyle = '#d1bc91'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fillRect(-10, -8, 18, 3);
  } else if (id === 'shallot') {
    ellipse(ctx, 0, 3, 12, 14, '#9f4d59', '#713943'); ellipse(ctx, -3, -1, 7, 9, '#c97a72');
    ctx.strokeStyle = '#6e8248'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(4, -17, 8, -18); ctx.stroke();
  } else if (id === 'chili') {
    ctx.beginPath(); ctx.moveTo(-18, -5); ctx.bezierCurveTo(-7, -18, 13, -12, 13, -3); ctx.bezierCurveTo(12, 8, -1, 17, -11, 11); ctx.quadraticCurveTo(-2, 3, -18, -5); ctx.fillStyle = '#c63c31'; ctx.fill();
    ctx.strokeStyle = '#537a42'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -8); ctx.quadraticCurveTo(13, -16, 20, -15); ctx.stroke();
  } else if (id === 'lime') {
    ellipse(ctx, 0, 0, 16, 15, '#789a3f', '#526f36'); ellipse(ctx, -4, -5, 7, 5, '#a8bd61');
    ctx.strokeStyle = '#d9e29b'; ctx.lineWidth = 1; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 10); ctx.stroke(); }
  } else if (id === 'peanut') {
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate((i - 1) * .7); ctx.beginPath(); ctx.ellipse((i - 1) * 8, 0, 5, 9, 0, 0, Math.PI * 2); ctx.fillStyle = ['#c29457', '#e1be7c', '#aa7845'][i]; ctx.fill(); ctx.restore(); }
  }
  ctx.restore();
}

function dish(ctx, recipe, x, y, size) {
  ctx.save(); ctx.translate(x, y); const s = size / 96; ctx.scale(s, s); ctx.shadowColor = 'rgba(20,24,17,.3)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3;
  ellipse(ctx, 0, 0, 45, 28, '#fff9e9', '#d3c7a8'); ctx.shadowColor = 'transparent'; ellipse(ctx, 0, 0, 36, 20, '#ddd0ae');
  const ids = recipe.ingredients; ids.forEach((id, i) => food(ctx, id, [-16, 0, 16][i], i === 1 ? -3 : 4, 27, i * .25));
  ctx.restore();
}

function drawGuest(ctx, guest, x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ellipse(ctx, 0, 1, 15, 15, guest.id === 'vip' ? '#f1c85e' : guest.id === 'critic' ? '#d68e83' : '#d99c73', '#543f35');
  ellipse(ctx, -5, 0, 1.6, 2, '#302923'); ellipse(ctx, 5, 0, 1.6, 2, '#302923');
  ctx.strokeStyle = '#713e38'; ctx.lineWidth = 1.5; ctx.beginPath(); if (guest.id === 'critic') ctx.moveTo(-4, 8), ctx.lineTo(4, 8); else ctx.arc(0, 4, 4, .1, Math.PI - .1); ctx.stroke();
  if (guest.id === 'vip') { ctx.fillStyle = '#f6dc87'; ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(-8, -19); ctx.lineTo(-2, -11); ctx.lineTo(3, -20); ctx.lineTo(9, -10); ctx.lineTo(12, -8); ctx.fill(); }
  if (guest.id === 'critic') { ctx.strokeStyle = '#3e3831'; ctx.lineWidth = 2; ctx.strokeRect(-12, -3, 10, 7); ctx.strokeRect(2, -3, 10, 7); ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.stroke(); }
  ctx.restore();
}

function drawTicket(ctx, ticket, index, elapsed, selected = false) {
  const x = CARD_X + index * (CARD_W + CARD_GAP), y = CARD_Y, warning = ticket.timeLeft < 10;
  const guestColor = warning ? '#b85449' : ticket.guest.color;
  box(ctx, x, y, CARD_W, CARD_H, 12, grad(ctx, x, y, CARD_H, selected ? '#fffdf2' : '#fff8e8', warning ? '#f5d0be' : '#e9dcbf'), selected ? '#ffd06b' : warning ? '#df795f' : '#c3ad83', true);
  if (selected) { ctx.strokeStyle = '#9d5c31'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, CARD_W - 6, CARD_H - 6, 10); ctx.stroke(); }
  box(ctx, x + 7, y + 7, CARD_W - 14, 26, 7, grad(ctx, x, y + 7, 26, guestColor, '#72564a'));
  drawGuest(ctx, ticket.guest, x + 22, y + 20, .62); label(ctx, ticket.guest.name.toUpperCase(), x + 43, y + 20, 11, '#fff5df', 'left', 800);
  label(ctx, `${index + 1}`, x + CARD_W - 15, y + 20, 12, '#fff5df', 'right', 850);
  dish(ctx, ticket.recipe, x + 34, y + 76, 72);
  label(ctx, ticket.recipe.name, x + CARD_W / 2, y + 119, 13, PALETTE.ink, 'center', 800);
  // Three tiny ingredient checklist chips, legible through shape + short label.
  ticket.recipe.ingredients.forEach((id, i) => {
    const item = INGREDIENTS.find((ingredient) => ingredient.id === id), xx = x + 12 + i * 62;
    box(ctx, xx, y + 131, 58, 25, 5, '#f4ecd7', '#d6c6a3'); food(ctx, id, xx + 12, y + 143, 16); label(ctx, item.name.slice(0, 7), xx + 25, y + 143, 9.5, '#4d5849', 'left', 750);
  });
  box(ctx, x + 12, y + 164, CARD_W - 24, 9, 5, '#d6c8ac');
  const urgency = orderUrgency(ticket); box(ctx, x + 12, y + 164, (CARD_W - 24) * urgency, 9, 5, grad(ctx, x, y + 164, 9, warning ? '#f07a56' : '#d6ba59', warning ? '#b63d36' : '#6f9d52'));
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d'); let scaleX = 1, scaleY = 1, time = 0, wokPulse = 0, batchPulse = 0;
  const ingredientPop = new Map(), particles = [];
  function resize() {
    const dpr = window.devicePixelRatio || 1; canvas.width = Math.round(window.innerWidth * dpr); canvas.height = Math.round(window.innerHeight * dpr);
    scaleX = canvas.width / W; scaleY = canvas.height / H;
  }
  function popIngredient(id) { ingredientPop.set(id, .32); }
  function pulseWok() { wokPulse = .35; }
  function burstServe() {
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, speed = 70 + Math.random() * 170; particles.push({ x: 1110, y: 425, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30, age: 0, life: .8 + Math.random() * .3, color: ['#ffd46e', '#fff4d4', '#f38758', '#b5d778'][i % 4], r: 3 + Math.random() * 4 }); }
  }
  function drawBackground(state) {
    ctx.fillStyle = grad(ctx, 0, 0, H, '#2e6150', '#183d34'); ctx.fillRect(0, 0, W, H);
    // Green emerald tile with a quiet, repeating batik-inspired rosette.
    for (let y = 284; y < 582; y += 48) for (let x = 0; x < W; x += 64) {
      const stagger = (Math.floor(y / 48) % 2) * 32, xx = x + stagger;
      ctx.fillStyle = ((x / 64 + y / 48) % 2) ? 'rgba(225,222,163,.045)' : 'rgba(10,47,39,.10)'; ctx.fillRect(xx, y, 62, 46);
      ctx.strokeStyle = 'rgba(225,226,183,.13)'; ctx.lineWidth = 1; ctx.strokeRect(xx, y, 62, 46);
      ctx.save(); ctx.translate(xx + 31, y + 23); ctx.strokeStyle = 'rgba(235,218,150,.18)'; ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, 0, 5, 13, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    // Wall and rattan lights above order tickets.
    ctx.fillStyle = grad(ctx, 0, 0, 285, '#e8bd83', '#c18452'); ctx.fillRect(0, 0, W, 284);
    for (let x = 60; x < W; x += 188) { ctx.strokeStyle = 'rgba(104,63,39,.18)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 30, 82); ctx.stroke(); }
    for (let i = 0; i < 6; i++) {
      const x = 282 + i * 145; ctx.save(); ctx.translate(x, 32 + Math.sin(time * 1.1 + i) * 2);
      ctx.shadowColor = 'rgba(255,182,66,.35)'; ctx.shadowBlur = 20; ellipse(ctx, 0, 0, 18, 24, '#edb55c', '#915b38'); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#9c633b'; ctx.lineWidth = 1; for (let n = -2; n <= 2; n++) { ctx.beginPath(); ctx.ellipse(n * 5, 0, 7, 21, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.restore();
    }
    // Back counter lip and planks.
    ctx.fillStyle = grad(ctx, 0, 272, 20, '#a6663c', '#593a2a'); ctx.fillRect(0, 272, W, 19);
  }
  function drawHud(state, screen) {
    label(ctx, 'BARA DAN REMPAH', 22, 34, 27, '#fff0cb', 'left', 900); label(ctx, 'WARUNG REMPAH • SHIFT MALAM', 24, 59, 11, '#633f2e', 'left', 800);
    // Five compact metrics, isolated from ticket cards.
    box(ctx, 891, 8, 367, 147, 12, grad(ctx, 891, 8, 147, '#3b5140', '#243c33'), '#b9935b', true);
    const metrics = [
      ['SHIFT', formatClock(Math.max(0, 180 - state.elapsed)), '#e8d5a5'],
      ['RUSH', state.rushTime > 0 ? 'BARA PANAS' : 'TENANG', state.rushTime > 0 ? '#ffb251' : '#c6d4b1'],
      ['PENGHASILAN', `Rp ${state.score.toLocaleString('id-ID')}`, '#f4d276'],
      ['COMBO', `${state.combo}x`, '#f5c477'],
      ['PENGALI TIP', `${(1 + Math.min(.5, state.combo * .05)).toFixed(1)}x`, '#d3e19e'],
    ];
    metrics.forEach((m, i) => { const col = i % 2, row = Math.floor(i / 2), x = 900 + col * 177, y = 15 + row * 45; box(ctx, x, y, 168, 40, 8, grad(ctx, x, y, 40, '#4a634c', '#2a4438'), '#8e7953'); label(ctx, m[0], x + 8, y + 11, 8.5, '#d9c59c', 'left', 800); label(ctx, m[1], x + 8, y + 28, 14, m[2], 'left', 850); });
    label(ctx, 'PAPAN PESANAN', 22, 72, 12, '#fff3dc', 'left', 850);
    if (screen === 'play') state.orders.slice(0, 4).forEach((ticket, index) => drawTicket(ctx, ticket, index, time, index === state.activeTicketIndex));
    else state.orders.slice(0, 4).forEach((ticket, index) => drawTicket(ctx, ticket, index, time, index === 0));
  }
  function drawPlatingTable(state) {
    box(ctx, 20, 307, 264, 252, 15, grad(ctx, 20, 307, 252, '#c88b50', '#77492e'), '#e1ba76', true);
    label(ctx, 'MEJA PLATING', 152, 326, 13, '#fff0ce', 'center', 850);
    const centers = [[76, 390], [152, 390], [228, 390]];
    centers.forEach(([x, y], i) => {
      ctx.save(); ctx.shadowColor = 'rgba(28,20,14,.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ellipse(ctx, x, y, 30, 22, '#fff7df', '#d7c8a8'); ctx.restore(); ellipse(ctx, x, y, 23, 16, '#eee2c6');
      if (i === 0 && state.plate.length) state.plate.forEach((id, j) => food(ctx, id, x - 12 + j * 12, y, 18, j * .2));
      else if (i === 1 && state.readyPlates > 1) dish(ctx, RECIPES[(state.served + 1) % RECIPES.length], x, y, 45);
      if (i === 0 && state.plate.length) {
        box(ctx, x - 48, 350, 96, 27, 7, '#fff9e7', '#c3af83', true);
        label(ctx, `${state.plate.length}/3 BAHAN`, x, 364, 10, '#4a543f', 'center', 800);
        state.order?.recipe.ingredients.forEach((id, j) => { ellipse(ctx, x - 14 + j * 14, 419, 4, 4, state.plate.includes(id) ? '#6f9b54' : '#c8b995'); });
      }
    });
    label(ctx, 'RACIKAN', 76, 430, 9, '#fff2d8', 'center', 800); label(ctx, 'BATCH', 152, 430, 9, '#fff2d8', 'center', 800); label(ctx, 'SIAP', 228, 430, 9, '#fff2d8', 'center', 800);
    label(ctx, `Piring siap: ${state.readyPlates}`, 152, 462, 10, '#fff0d1', 'center', 700);
    box(ctx, 39, 483, 226, 57, 9, 'rgba(45,38,27,.42)', '#d1a260');
    label(ctx, 'Checklist tiket aktif', 53, 497, 10, '#f6deb1', 'left', 750);
    const recipe = state.order?.recipe; recipe?.ingredients.forEach((id, i) => { const have = state.plate.includes(id), ingredient = INGREDIENTS.find((v) => v.id === id); ellipse(ctx, 57, 519 + i * 0, 5, 5, have ? '#a3cb6d' : '#d19468'); label(ctx, ingredient.name, 68 + i * 61, 519, 9, '#fff6e5', 'left', 650); });
  }
  function drawStations(state) {
    const stations = [
      { x: 334, title: 'SAMPAH', kind: 'bin' }, { x: 438, title: 'IRIS I', kind: 'board' }, { x: 542, title: 'IRIS II', kind: 'board2' },
      { x: 646, title: 'PANGGANG', kind: 'grill' }, { x: 750, title: 'TUMIS', kind: 'wok' }, { x: 854, title: 'SOTO', kind: 'soup' }, { x: 958, title: 'RENDANG', kind: 'pot' },
    ];
    stations.forEach((station, index) => drawStation(station, index, state));
    // Decorative numbered route: rack -> prep -> heat -> plating -> pass.
    ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,226,145,.68)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1135, 570); ctx.lineTo(548, 535); ctx.lineTo(752, 515); ctx.lineTo(170, 568); ctx.lineTo(991, 558); ctx.stroke(); ctx.restore();
    [[1135, 570, '1'], [550, 535, '2'], [752, 515, '3'], [170, 568, '4'], [991, 558, '5']].forEach(([x, y, n]) => { ellipse(ctx, x, y, 10, 10, '#f0c664', '#5f492d'); label(ctx, n, x, y + 1, 10, '#392f22', 'center', 900); });
    drawChef(state.chef.x, state.chef.y, Math.sin(time * 12) * 1.5);
    if (state.rushTime > 0) drawRushCard(state);
  }
  function drawStation(s, index, state) {
    const x = s.x, y = 398, w = 92, h = 114;
    box(ctx, x - 44, y - 52, w, h, 10, grad(ctx, x - 44, y - 52, h, '#a96e43', '#65422e'), '#d4a766', true);
    label(ctx, s.title, x, y + 50, 9.5, '#fff0d1', 'center', 850);
    if (s.kind === 'bin') {
      box(ctx, x - 24, y - 27, 48, 52, 5, grad(ctx, x - 24, y - 27, 52, '#7b9a69', '#374d3a'), '#d7c494'); ctx.beginPath(); ctx.moveTo(x - 22, y - 19); ctx.lineTo(x + 22, y - 19); ctx.strokeStyle = '#d7c494'; ctx.lineWidth = 4; ctx.stroke();
    } else if (s.kind === 'board' || s.kind === 'board2') {
      box(ctx, x - 34, y - 28, 68, 47, 6, '#c99258', '#70472f', true); ellipse(ctx, x, y - 2, 20, 15, '#a35e47'); ellipse(ctx, x - 8, y - 7, 9, 6, '#d88c58');
      ctx.strokeStyle = '#efc863'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - 1, 25, -Math.PI / 2, -Math.PI / 2 + (index === 1 ? .62 : .38) * Math.PI * 2); ctx.stroke();
      box(ctx, x - 25, y + 25, 50, 12, 5, '#39473a'); box(ctx, x - 25, y + 25, (index === 1 ? 34 : 24), 12, 5, '#e9bb5b'); label(ctx, 'BATCH +', x, y + 31, 7.5, '#fff0c5', 'center', 800);
    } else if (s.kind === 'grill') {
      box(ctx, x - 35, y - 26, 70, 48, 5, '#352f29', '#c58b51'); for (let i = -2; i <= 2; i++) { ctx.strokeStyle = '#aeb6a4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + i * 10, y - 23); ctx.lineTo(x + i * 10, y + 19); ctx.stroke(); }
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = '#d18b4f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 25 + i * 20, y - 4); ctx.lineTo(x - 12 + i * 20, y + 2); ctx.stroke(); }
      box(ctx, x - 31, y + 25, 62, 9, 4, '#493b30'); box(ctx, x - 31, y + 25, 31, 9, '#559451'); box(ctx, x, y + 25, 31, 9, '#d24d36'); label(ctx, 'PERFECT  |  GOSONG', x, y + 40, 6.8, '#fff3da', 'center', 800);
    } else if (s.kind === 'wok') {
      ctx.save(); ctx.shadowColor = '#f19634'; ctx.shadowBlur = (state.rushTime > 0 ? 28 : 12) + Math.sin(time * 8) * 5; ellipse(ctx, x, y - 3, 34, 29, '#3c342c', '#c99a57'); ctx.restore(); ellipse(ctx, x, y - 6, 25, 19, '#282e29', '#737c63');
      if (state.plate.length) state.plate.forEach((id, i) => food(ctx, id, x - 14 + i * 14, y - 6, 16));
      for (let i = 0; i < 3; i++) { ellipse(ctx, x - 22 + i * 22, y + 29, 5, 5, i < state.cookProgress ? '#f5c85c' : '#485349', '#d6ad67'); }
      label(ctx, '3x ADUK', x, y + 40, 8, '#fff0d1', 'center', 800);
    } else {
      ctx.save(); const steam = Math.sin(time * 4 + index) * 3; ctx.strokeStyle = 'rgba(245,243,214,.7)'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 12 + i * 12, y - 39); ctx.bezierCurveTo(x - 18 + i * 12, y - 49 + steam, x + 2 + i * 12, y - 54, x - 3 + i * 12, y - 62); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.shadowColor = '#ed942f'; ctx.shadowBlur = 8; ellipse(ctx, x, y - 4, 31, 26, s.kind === 'soup' ? '#b58b37' : '#774633', '#d6af68'); ctx.restore();
      ellipse(ctx, x, y - 8, 23, 17, s.kind === 'soup' ? '#d1a443' : '#75412f', '#f0d796');
      if (s.kind === 'soup') { ellipse(ctx, x - 7, y - 8, 5, 3, '#f5e4b1'); ellipse(ctx, x + 7, y - 3, 5, 3, '#f1e4b3'); leaf(ctx, x, y - 8, 7, '#748a45', .4); }
      box(ctx, x - 30, y + 24, 60, 9, 4, '#39473a'); box(ctx, x - 30, y + 24, s.kind === 'soup' ? 42 : 20, 9, 4, s.kind === 'soup' ? '#daab48' : '#e47545');
      label(ctx, s.kind === 'soup' ? 'AWAS GOSONG' : 'API KECIL', x, y + 39, 7.5, '#fff1d4', 'center', 800);
    }
  }
  function drawChef(x, y, bob) {
    ctx.save(); ctx.translate(x, y + bob); ellipse(ctx, 0, 19, 19, 8, 'rgba(8,24,19,.35)');
    // apron and tunic, overhead head and batik headband.
    ctx.beginPath(); ctx.roundRect(-17, -7, 34, 31, 9); ctx.fillStyle = '#ead9b6'; ctx.fill(); ctx.strokeStyle = '#473b30'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, 1); ctx.lineTo(-11, 21); ctx.lineTo(11, 21); ctx.lineTo(12, 1); ctx.closePath(); ctx.fillStyle = '#9a5038'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(0, -15, 16, 0, Math.PI * 2); ctx.clip(); ellipse(ctx, 0, -15, 16, 16, '#b87851');
    // Batik patterned headband across the crown.
    ctx.fillStyle = '#3c5540'; ctx.fillRect(-17, -26, 34, 7); ctx.strokeStyle = '#e3bd62'; ctx.lineWidth = 1.4; for (let i = -12; i <= 12; i += 8) { ctx.beginPath(); ctx.moveTo(i - 3, -25); ctx.lineTo(i, -22.5); ctx.lineTo(i + 3, -25); ctx.stroke(); }
    ellipse(ctx, -5, -15, 1.5, 2, '#292b24'); ellipse(ctx, 5, -15, 1.5, 2, '#292b24'); ctx.restore();
    ctx.strokeStyle = '#e5d0ac'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-24, 8 + Math.sin(time * 12) * 2); ctx.moveTo(17, 0); ctx.lineTo(24, 8 - Math.sin(time * 12) * 2); ctx.stroke(); ctx.restore();
  }
  function drawService(state) {
    box(ctx, 1002, 307, 257, 252, 15, grad(ctx, 1002, 307, 252, '#b97d48', '#74442e'), '#e4b66a', true);
    label(ctx, 'MEJA SAJI', 1130, 326, 13, '#fff0ce', 'center', 850);
    ctx.save(); ctx.shadowColor = 'rgba(25,20,14,.35)'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 4; ellipse(ctx, 1084, 390, 49, 31, '#fff8e7', '#d2c19d'); ctx.restore();
    ellipse(ctx, 1084, 390, 39, 23, '#e6ddc6');
    if (state.readyPlates > 0 && state.plate.length === 3 && state.cookProgress === 3) state.plate.forEach((id, i) => food(ctx, id, 1065 + i * 18, 390, 24));
    if (state.readyPlates > 0) { box(ctx, 1042, 425, 84, 20, 6, '#83a657', '#d8e0a6'); label(ctx, 'READY', 1084, 435, 10, '#fffde7', 'center', 900); }
    // Brass service bell.
    ctx.save(); ctx.shadowColor = 'rgba(30,20,10,.3)'; ctx.shadowBlur = 6; ellipse(ctx, 1180, 391, 28, 24, grad(ctx, 367, 367, 48, '#f7df8a', '#a46e2a'), '#765126'); ctx.restore();
    ctx.fillStyle = '#6d5028'; ctx.beginPath(); ctx.moveTo(1164, 390); ctx.quadraticCurveTo(1168, 367, 1180, 367); ctx.quadraticCurveTo(1192, 367, 1196, 390); ctx.closePath(); ctx.fill(); ellipse(ctx, 1180, 389, 15, 5, '#f0cb66'); ellipse(ctx, 1180, 365, 4, 4, '#f8df8a'); label(ctx, 'KLIK LONCENG', 1180, 427, 9, '#fff0ce', 'center', 800);
    label(ctx, `ANTREAN  ${Math.min(5, state.orders.length)}`, 1130, 464, 10, '#fff0ce', 'center', 800);
    state.orders.slice(0, 4).forEach((order, i) => drawGuest(ctx, order.guest, 1040 + i * 54, 505, .9));
    // Rattan terrace bistro lights frame the customer line.
    ctx.strokeStyle = '#593b2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1020, 292); ctx.quadraticCurveTo(1130, 270, 1243, 292); ctx.stroke();
    for (let i = 0; i < 5; i++) { const x = 1032 + i * 50; ctx.strokeStyle = '#815538'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 291); ctx.lineTo(x, 314); ctx.stroke(); ctx.shadowColor = '#ffc66c'; ctx.shadowBlur = 10; ellipse(ctx, x, 318, 5, 6, '#f5cc73'); ctx.shadowBlur = 0; }
  }
  function drawIngredients(state) {
    // Dark teak rack with a recessed, inset tray for each ingredient.
    box(ctx, 292, 581, 974, 207, 13, grad(ctx, 292, 581, 207, '#704229', '#3f2920'), '#d5a05d', true);
    label(ctx, 'RAK BAHAN SEGAR', 308, 591, 11, '#f4d9a2', 'left', 850);
    INGREDIENTS.forEach((item, index) => {
      const col = index % 5, row = Math.floor(index / 5), x = SHELF_X + col * (CELL_W + CELL_GAP), y = SHELF_Y + row * (CELL_H + 8), pop = ingredientPop.get(item.id) || 0;
      const t = pop > 0 ? (1 - pop / .32) : 1; const scale = pop > 0 ? 1 - Math.sin(t * Math.PI) * .13 + Math.max(0, t - .55) * .10 : 1;
      ctx.save(); ctx.translate(x + CELL_W / 2, y + CELL_H / 2); ctx.scale(scale, scale);
      box(ctx, -CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H, 9, grad(ctx, -CELL_W / 2, -CELL_H / 2, CELL_H, '#3c3025', '#2c251e'), '#b9834c', true);
      // Recessed oval tray, gloss lip, finely detailed food drawing.
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 7; ellipse(ctx, -49, -3, 34, 21, '#201e19', '#b68a53'); ctx.restore(); ellipse(ctx, -49, -5, 29, 16, grad(ctx, -49, -21, 32, '#554634', '#30291f'), '#7b6748');
      food(ctx, item.id, -49, -7, 34);
      label(ctx, `${index + 1}`, -82, 26, 9, '#ddb777', 'left', 850); label(ctx, item.name, -25, 24, 12.5, '#fff0d3', 'left', 800);
      ctx.restore();
    });
  }
  function drawRushCard(state) {
    const x = 425, y = 286; box(ctx, x, y, 430, 50, 12, grad(ctx, x, y, 50, '#ffb84e', '#bb422e'), '#ffe194', true);
    label(ctx, 'RUSH EVENT  •  BARA API MEMBESAR!', 640, y + 18, 14, '#fff8de', 'center', 900); label(ctx, 'Matang lebih cepat · tip +50%', 640, y + 37, 11, '#fff0c9', 'center', 700);
  }
  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.age += 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 1.2; if (p.age > p.life) { particles.splice(i, 1); continue; } ctx.globalAlpha = 1 - p.age / p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
  }
  function overlay(screen, state) {
    ctx.fillStyle = 'rgba(8,23,20,.72)'; ctx.fillRect(0, 0, W, H); box(ctx, 355, 235, 570, 330, 20, grad(ctx, 355, 235, 330, '#fff4d7', '#dbc398'), '#edc873', true);
    label(ctx, screen === 'title' ? 'BARA DAN REMPAH' : 'SHIFT SELESAI', 640, 298, 36, '#71402c', 'center', 950);
    label(ctx, screen === 'title' ? 'Warung malam Nusantara menunggu sentuhan chef.' : 'Terima kasih sudah menjaga bara warung.', 640, 350, 17, '#4f5844', 'center', 650);
    if (screen === 'title') {
      label(ctx, '1–0 ambil bahan  •  WASD / panah bergerak  •  klik stasiun', 640, 395, 14, '#53614b', 'center');
      label(ctx, 'SPACE aduk  •  ENTER hidangkan  •  klik lonceng untuk kirim', 640, 421, 14, '#53614b', 'center');
      label(ctx, 'BACKSPACE buang bahan  -  ESC kosongkan wajan', 640, 442, 13, '#687052', 'center');
      box(ctx, 495, 461, 290, 59, 13, grad(ctx, 495, 461, 59, '#e7bb58', '#b77b39'), '#76522d', true); label(ctx, 'MULAI SHIFT', 640, 490, 19, '#fff7df', 'center', 900);
    } else { label(ctx, `Penghasilan ${state.score} koin  •  Hidangan ${state.served}  •  Combo terbaik ${state.bestCombo}`, 640, 411, 16, '#53614b', 'center', 700); label(ctx, 'KLIK ATAU ENTER UNTUK MAIN LAGI', 640, 480, 14, '#8d5735', 'center', 850); }
  }
  function draw(state, screen, dt = 0) {
    const step = Math.min(dt, .1); time += step; wokPulse = Math.max(0, wokPulse - step); batchPulse = Math.max(0, batchPulse - step);
    for (const [id, value] of ingredientPop) { const next = Math.max(0, value - step); if (next === 0) ingredientPop.delete(id); else ingredientPop.set(id, next); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PALETTE.dark; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    drawBackground(state); drawHud(state, screen); drawPlatingTable(state); drawStations(state); drawService(state); drawIngredients(state); drawParticles();
    if (screen !== 'play') overlay(screen, state);
  }
  resize(); window.addEventListener('resize', resize);
  return { draw, popIngredient, pulseWok, burstServe };
}
