// All sound is synthesized locally with Web Audio oscillators; no audio files or network calls.
export function createKitchenAudio() {
  let context = null;
  function unlock() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      context = new AudioContextClass();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }
  function tone(frequency, duration, type = 'sine', volume = .12, slide = 0) {
    const audio = unlock(); if (!audio) return;
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, frequency + slide), audio.currentTime + duration);
    gain.gain.setValueAtTime(.0001, audio.currentTime); gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + .012); gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration + .02);
  }
  function play(name) {
    if (name === 'pick') tone(660, .09, 'triangle', .07, 180);
    else if (name === 'stir') { tone(190, .16, 'triangle', .11, 90); tone(490, .12, 'sine', .05, -80); }
    else if (name === 'serve') { tone(523, .18, 'sine', .1, 90); setTimeout(() => tone(784, .28, 'sine', .09, 80), 90); }
    else if (name === 'wrong') tone(160, .22, 'sawtooth', .06, -65);
    else if (name === 'start') { tone(392, .2, 'triangle', .08, 80); setTimeout(() => tone(587, .22, 'triangle', .08, 100), 100); }
    else if (name === 'expire') tone(250, .32, 'sine', .08, -80);
  }
  return { unlock, play };
}
