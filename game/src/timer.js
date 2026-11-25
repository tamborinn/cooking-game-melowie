export function formatClock(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function orderUrgency(order) {
  return order ? Math.max(0, order.timeLeft / order.duration) : 0;
}
