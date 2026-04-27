// Chess Sound Effects using Web Audio API
// No external files needed — sounds are generated programmatically

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency, duration, type = 'sine', volume = 0.5, decay = true) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    if (decay) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}

function playNoise(duration, volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.warn('Noise playback failed:', e);
  }
}

// Wood-on-wood piece placement sound
export function playMoveSound() {
  playNoise(0.12, 0.6);
  playTone(300, 0.08, 'triangle', 0.3);
  setTimeout(() => playTone(200, 0.06, 'triangle', 0.15), 30);
}

// Sharp capture sound — louder thud
export function playCaptureSound() {
  playNoise(0.18, 0.8);
  playTone(250, 0.1, 'square', 0.4);
  setTimeout(() => {
    playTone(180, 0.08, 'triangle', 0.3);
    playNoise(0.1, 0.4);
  }, 40);
}

// Alert check sound — two quick tones
export function playCheckSound() {
  playTone(880, 0.15, 'sine', 0.5);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.5), 150);
}

// Game over fanfare
export function playGameOverSound() {
  playTone(440, 0.2, 'sine', 0.4);
  setTimeout(() => playTone(550, 0.2, 'sine', 0.4), 200);
  setTimeout(() => playTone(660, 0.3, 'sine', 0.5), 400);
}

// Initialize audio context on first user interaction
export function initAudio() {
  try {
    getAudioContext();
  } catch (e) {
    console.warn('Audio init failed:', e);
  }
}

// Play the right sound for a given move
export function playChessSound(move, isCheck) {
  if (isCheck) {
    playCheckSound();
  } else if (move.captured) {
    playCaptureSound();
  } else {
    playMoveSound();
  }
}
