const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

const samples = [
  ['kick', 72, 0.28, 'sine', 0.95],
  ['snare', 190, 0.2, 'noise', 0.55],
  ['closed-hihat', 8200, 0.08, 'noise', 0.28],
  ['open-hihat', 7400, 0.28, 'noise', 0.24],
  ['clap', 920, 0.16, 'pulseNoise', 0.48],
  ['crash', 5600, 0.42, 'noise', 0.32],
  ['ride', 3300, 0.36, 'metal', 0.34],
  ['high-tom', 260, 0.24, 'sine', 0.68],
  ['mid-tom', 190, 0.26, 'sine', 0.7],
  ['floor-tom', 118, 0.32, 'sine', 0.74],
  ['rim', 1350, 0.09, 'square', 0.42],
  ['cowbell', 650, 0.18, 'metal', 0.46],
  ['shaker', 6200, 0.12, 'noise', 0.24],
  ['perc', 440, 0.16, 'square', 0.42],
  ['metronome', 1200, 0.08, 'square', 0.38],
  ['sub-kick', 45, 0.42, 'sine', 0.78],
];

const sampleRate = 44100;

function writeUInt32LE(buffer, value, offset) {
  buffer.writeUInt32LE(value, offset);
}

function writeUInt16LE(buffer, value, offset) {
  buffer.writeUInt16LE(value, offset);
}

function envelope(t, duration) {
  return Math.exp(-7 * (t / duration));
}

function waveform(type, t, freq) {
  if (type === 'noise') return Math.random() * 2 - 1;
  if (type === 'pulseNoise') return (Math.random() * 2 - 1) * (Math.sin(t * 95) > 0 ? 1 : 0.35);
  if (type === 'square') return Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
  if (type === 'metal') {
    return (
      Math.sin(2 * Math.PI * freq * t) * 0.55 +
      Math.sin(2 * Math.PI * freq * 1.48 * t) * 0.3 +
      Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.15
    );
  }
  return Math.sin(2 * Math.PI * freq * t);
}

function makeWav(name, freq, duration, type, gain) {
  const frameCount = Math.floor(sampleRate * duration);
  const dataSize = frameCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  writeUInt32LE(buffer, 36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  writeUInt32LE(buffer, 16, 16);
  writeUInt16LE(buffer, 1, 20);
  writeUInt16LE(buffer, 1, 22);
  writeUInt32LE(buffer, sampleRate, 24);
  writeUInt32LE(buffer, sampleRate * 2, 28);
  writeUInt16LE(buffer, 2, 32);
  writeUInt16LE(buffer, 16, 34);
  buffer.write('data', 36);
  writeUInt32LE(buffer, dataSize, 40);

  for (let i = 0; i < frameCount; i += 1) {
    const t = i / sampleRate;
    const pitchDrop = type === 'sine' ? 1 + 0.85 * envelope(t, duration) : 1;
    const raw = waveform(type, t, freq * pitchDrop);
    const value = Math.max(-1, Math.min(1, raw * envelope(t, duration) * gain));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(outDir, `${name}.wav`), buffer);
}

for (const sample of samples) {
  makeWav(...sample);
}

process.stdout.write(`Generated ${samples.length} placeholder WAV files in ${outDir}\n`);
