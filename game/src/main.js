import { createKitchen, INGREDIENT_IDS } from './kitchen.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createKitchenAudio } from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const kitchen = createKitchen();
const input = createInput(canvas);
const renderer = createRenderer(canvas);
const audio = createKitchenAudio();
let screen = 'title';
let lastFrame = performance.now();

function hit(x, y, left, top, width, height) { return x >= left && x <= left + width && y >= top && y <= top + height; }
function startShift() {
  audio.unlock(); audio.play('start'); kitchen.start(); screen = 'play'; status.textContent = 'Shift dibuka. Lima tiket pesanan masuk.';
}
function pickIngredient(index) {
  if (kitchen.addIngredient(INGREDIENT_IDS[index])) { renderer.popIngredient(INGREDIENT_IDS[index]); audio.play('pick'); }
}
function stirWok() { if (kitchen.stir()) { renderer.pulseWok(); audio.play('stir'); } else audio.play('wrong'); }
function serveDish() { if (kitchen.serve()) { renderer.burstServe(); audio.play('serve'); } else audio.play('wrong'); }
function handlePointer(x, y) {
  if (screen !== 'play') { startShift(); return; }
  for (let index = 0; index < 4; index += 1) {
    if (hit(x, y, 20 + index * 216, 78, 208, 190)) { kitchen.selectOrder(index); audio.play('pick'); return; }
  }
  for (let index = 0; index < INGREDIENT_IDS.length; index += 1) {
    const col = index % 5, row = Math.floor(index / 5), left = 300 + col * 188, top = 594 + row * 78;
    if (hit(x, y, left, top, 180, 70)) { pickIngredient(index); return; }
  }
  if (hit(x, y, 1148, 358, 62, 76)) { serveDish(); return; }
  if (hit(x, y, 706, 345, 88, 110)) { kitchen.moveTo(750, 445); stirWok(); return; }
  if (hit(x, y, 300, 294, 680, 286)) kitchen.moveTo(x, y);
}
function handleActions() {
  for (const action of input.takeActions()) {
    if (action.type === 'pointer') { handlePointer(action.x, action.y); continue; }
    if (screen !== 'play') { if (action.type === 'serve' || action.type === 'start') startShift(); continue; }
    if (action.type === 'ingredient') pickIngredient(action.index);
    else if (action.type === 'serve') serveDish();
    else if (action.type === 'stir') stirWok();
    else if (action.type === 'remove') kitchen.removeLast();
    else if (action.type === 'clear') kitchen.clearPlate();
  }
}
function movementVector() {
  const keys = input.keys;
  return { x: (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), y: (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) };
}
function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, .1); lastFrame = now; handleActions();
  if (screen === 'play') {
    const beforeMissed = kitchen.state.missed;
    kitchen.step(dt, movementVector());
    if (kitchen.state.missed > beforeMissed) audio.play('expire');
    if (!kitchen.state.running) { screen = 'over'; status.textContent = `Shift selesai. ${kitchen.state.score} koin dari ${kitchen.state.served} hidangan.`; }
  }
  renderer.draw(kitchen.state, screen, dt); requestAnimationFrame(frame);
}

// Staged scenes are useful for the local Make.fun screenshot workflow.
const scene = new URLSearchParams(window.location.search).get('scene');
if (new URLSearchParams(window.location.search).has('debug')) Object.defineProperty(window, '__baraDebug', { value: { state: kitchen.state }, configurable: false });
if (scene === 'play' || scene === 'rush') {
  kitchen.start(); screen = 'play';
  if (scene === 'rush') { kitchen.state.elapsed = 70; kitchen.state.rushTime = 13; }
}
status.textContent = 'Bara dan Rempah. Enter mulai, WASD bergerak, angka memilih bahan.';
requestAnimationFrame(frame);
