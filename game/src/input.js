export function createInput(canvas) {
  const actions = [];
  const keys = new Set();
  const enqueue = (action) => actions.push(action);
  window.addEventListener('keydown', (event) => {
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
    if (event.repeat) return;
    keys.add(event.code);
    if (event.code === 'Enter') enqueue({ type: 'serve' });
    else if (event.code === 'Space') enqueue({ type: 'stir' });
    else if (event.code === 'Backspace') enqueue({ type: 'remove' });
    else if (event.code === 'Escape') enqueue({ type: 'clear' });
    else if (/^Digit[1-9]$/.test(event.code)) enqueue({ type: 'ingredient', index: Number(event.code.slice(-1)) - 1 });
    else if (event.code === 'Digit0') enqueue({ type: 'ingredient', index: 9 });
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    enqueue({ type: 'pointer', x: (event.clientX - rect.left) / rect.width * 1280, y: (event.clientY - rect.top) / rect.height * 800 });
  });
  return { takeActions: () => actions.splice(0), keys };
}
