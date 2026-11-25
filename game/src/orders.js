import { RECIPES } from './recipes.js';

const GUESTS = [
  { id: 'regular', name: 'Tamu', color: '#b8d89b', patience: 56, tip: 1 },
  { id: 'vip', name: 'VIP', color: '#f2c85f', patience: 48, tip: 1.5 },
  { id: 'critic', name: 'Kritikus', color: '#df8e7d', patience: 43, tip: 2 },
];
let nextId = 1;

export function createOrder() {
  const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const roll = Math.random();
  const guest = GUESTS[roll < .14 ? 2 : roll < .34 ? 1 : 0];
  return { id: nextId++, recipe, guest, timeLeft: guest.patience, duration: guest.patience };
}
export function createOrderQueue(count = 4) {
  const guestSequence = [GUESTS[0], GUESTS[1], GUESTS[2], GUESTS[0], GUESTS[1]];
  return Array.from({ length: count }, (_, index) => {
    const guest = guestSequence[index % guestSequence.length];
    return { id: nextId++, recipe: RECIPES[index % RECIPES.length], guest, timeLeft: guest.patience, duration: guest.patience };
  });
}
export function advanceOrder(order, dt) {
  if (!order) return false;
  order.timeLeft = Math.max(0, order.timeLeft - dt);
  return order.timeLeft === 0;
}
