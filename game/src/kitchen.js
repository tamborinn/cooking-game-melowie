import { createOrder, createOrderQueue, advanceOrder } from './orders.js';
import { matchesRecipe } from './recipes.js';

export const GAME_LENGTH = 180;
export const INGREDIENT_IDS = ['rice', 'noodles', 'chicken', 'beef', 'egg', 'tofu', 'shallot', 'chili', 'lime', 'peanut'];

export function createKitchen() {
  const state = {
    running: false, elapsed: 0, score: 0, combo: 0, bestCombo: 0, order: null, orders: [], plate: [], cookProgress: 0,
    message: 'Ambil bahan, masak, lalu hidangkan!', messageTime: 3, missed: 0, served: 0,
    rushTime: 0, chef: { x: 635, y: 490 }, target: null, readyPlates: 0, activeTicketIndex: 0,
  };
  function syncOrder() { state.activeTicketIndex = Math.max(0, Math.min(state.activeTicketIndex, state.orders.length - 1)); state.order = state.orders[state.activeTicketIndex] || state.orders[0] || null; }
  function fillQueue() { while (state.orders.length < 4) state.orders.push(createOrder()); syncOrder(); }
  function start() {
    Object.assign(state, { running: true, elapsed: 0, score: 0, combo: 0, bestCombo: 0, orders: createOrderQueue(4), plate: [], cookProgress: 0, missed: 0, served: 0, rushTime: 0, chef: { x: 635, y: 490 }, target: null, readyPlates: 0, activeTicketIndex: 0, message: 'Api menyala! Pesanan masuk, chef.', messageTime: 3 });
    syncOrder();
  }
  function addIngredient(id) {
    if (!state.running || !state.order) return false;
    if (state.plate.length >= 3) { state.message = 'Wajan penuh. Buang satu bahan dulu.'; state.messageTime = 1.6; return false; }
    if (state.plate.includes(id)) { state.message = 'Bahan itu sudah ada di wajan.'; state.messageTime = 1.4; return false; }
    state.plate.push(id); state.cookProgress = 0; state.readyPlates = 0;
    state.message = 'Bahan segar masuk ke wajan!'; state.messageTime = 1.2; return true;
  }
  function removeLast() { if (state.plate.length) { state.plate.pop(); state.cookProgress = 0; } }
  function clearPlate() { state.plate.length = 0; state.cookProgress = 0; }
  function stir() {
    if (!state.running || state.plate.length !== 3) { state.message = 'Masukkan tiga bahan sesuai tiket dulu.'; state.messageTime = 1.6; return false; }
    state.cookProgress = Math.min(3, state.cookProgress + (state.rushTime > 0 ? 2 : 1));
    state.message = ['Aduk rata!', 'Bumbunya meresap!', 'Matang sempurna! Siap plating.'][state.cookProgress - 1]; state.messageTime = 1.3;
    if (state.cookProgress === 3) state.readyPlates = Math.min(3, state.readyPlates + 1);
    return true;
  }
  function serve() {
    const order = state.order;
    if (!state.running || !order) return false;
    if (state.cookProgress < 3) { state.message = 'Masakan belum matang. Aduk wajan!'; state.messageTime = 1.8; return false; }
    if (!matchesRecipe(state.plate, order.recipe)) { state.message = 'Cek lagi checklist bahan di tiket.'; state.messageTime = 1.8; state.combo = 0; return false; }
    const tip = Math.ceil(order.timeLeft / 3 * order.guest.tip * (state.rushTime > 0 ? 1.5 : 1));
    const earned = 100 + tip + Math.min(100, state.combo * 15);
    state.combo += 1; state.bestCombo = Math.max(state.bestCombo, state.combo); state.score += earned; state.served += 1;
    state.message = `Hidangan terkirim! +${earned} koin`; state.messageTime = 2;
    const servedIndex = state.orders.indexOf(order);
    if (servedIndex >= 0) state.orders.splice(servedIndex, 1);
    state.activeTicketIndex = 0; fillQueue(); state.plate = []; state.cookProgress = 0; state.readyPlates = 0; return true;
  }
  function selectOrder(index) { if (index < 0 || index >= state.orders.length) return false; state.activeTicketIndex = index; syncOrder(); state.plate = []; state.cookProgress = 0; state.message = `Tiket ${index + 1}: ${state.order.recipe.name}`; state.messageTime = 1.6; return true; }
  function moveTo(x, y) { state.target = { x: Math.max(320, Math.min(960, x)), y: Math.max(306, Math.min(565, y)) }; }
  function moveChef(dx, dy, dt) {
    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1; state.chef.x += dx / length * 230 * dt; state.chef.y += dy / length * 230 * dt; state.target = null;
    } else if (state.target) {
      const dxTarget = state.target.x - state.chef.x, dyTarget = state.target.y - state.chef.y, length = Math.hypot(dxTarget, dyTarget);
      if (length < 5) state.target = null;
      else { const travel = Math.min(length, 230 * dt); state.chef.x += dxTarget / length * travel; state.chef.y += dyTarget / length * travel; }
    }
    state.chef.x = Math.max(310, Math.min(970, state.chef.x)); state.chef.y = Math.max(304, Math.min(565, state.chef.y));
  }
  function step(dt, movement = { x: 0, y: 0 }) {
    if (!state.running) return;
    state.elapsed += dt; if (state.messageTime > 0) state.messageTime -= dt;
    moveChef(movement.x, movement.y, dt);
    if (state.elapsed >= 65 && state.elapsed < 83) state.rushTime = 83 - state.elapsed; else state.rushTime = 0;
    if (state.elapsed >= GAME_LENGTH) { state.elapsed = GAME_LENGTH; state.running = false; state.message = 'Shift berakhir!'; return; }
    let expired = 0;
    for (const ticket of state.orders) if (advanceOrder(ticket, dt)) expired += 1;
    if (expired) {
      state.missed += expired; state.combo = 0; state.orders = state.orders.filter((ticket) => ticket.timeLeft > 0); if (state.activeTicketIndex >= state.orders.length) state.activeTicketIndex = 0; fillQueue();
      state.message = 'Kesabaran pelanggan habis!'; state.messageTime = 2;
    }
  }
  return { state, start, step, addIngredient, removeLast, clearPlate, stir, serve, moveTo, selectOrder };
}
