/* EMBERFALL DUEL — WebAudio synth effects. No audio files: every sound
   is an oscillator envelope built at runtime. */

const AudioFX = {
  ctx: null,
  muted: false,

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, dur, type, vol, when) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  playCard() {
    this.tone(520, 0.12, 'triangle', 0.18, 0);
    this.tone(780, 0.1, 'triangle', 0.12, 0.05);
  },

  playChain() {
    this.tone(660, 0.1, 'square', 0.1, 0);
    this.tone(880, 0.12, 'square', 0.1, 0.07);
    this.tone(1174, 0.16, 'square', 0.1, 0.14);
  },

  playHit() {
    this.tone(160, 0.22, 'sawtooth', 0.2, 0);
    this.tone(90, 0.28, 'sawtooth', 0.16, 0.03);
  },

  playDraw() {
    this.tone(440, 0.08, 'sine', 0.1, 0);
    this.tone(587, 0.08, 'sine', 0.1, 0.06);
  },

  playWin() {
    const notes = [523, 659, 784, 1046, 1318];
    for (let i = 0; i < notes.length; i++) {
      this.tone(notes[i], 0.35, 'triangle', 0.16, i * 0.13);
    }
  },

  playLose() {
    const notes = [392, 330, 262, 196];
    for (let i = 0; i < notes.length; i++) {
      this.tone(notes[i], 0.4, 'sine', 0.14, i * 0.18);
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },
};
