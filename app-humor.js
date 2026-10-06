// app-humor.js - Noodle Humor Lab, Chaos FX Studio & Customizable Radical Idle Screensaver
// 100% Client-Side, Web Audio Synthesizer, Radical App-Breaking FX, Ambient Screensavers

(function() {
  'use strict';

  let audioCtx = null;
  let activeEffects = new Set();
  let bubbleGridState = Array(20).fill(false);
  let currentJokeIndex = 0;

  // Active FX animations and canvas cleanup handles
  let activeFxCleanup = null;
  let activeFxAnimId = null;
  let activeCleanups = [];

  function registerCleanup(fn) {
    if (typeof fn === 'function') {
      activeCleanups.push(fn);
    }
  }

  // Configurable Idle Auto-Trigger Engine (Default 3 Minuten, seltener & radikaler)
  let idleTimer = null;
  let isIdleActive = false;

  const JOKES = [
    { q: "Warum prokrastinieren Entwickler gerne?", a: "Weil morgen die Anforderungen vielleicht deprecated sind!" },
    { q: "Wie viele Programmierer braucht man, um eine Glühbirne zu wechseln?", a: "Keinen. Das ist ein Hardware-Problem!" },
    { q: "Was ist das ADHS-Motto beim Aufräumen?", a: "Ich bringe nur kurz dieses Buch ins Regal... und 4 Stunden später habe ich mein Zimmer umgebaut und gelernt, wie man Origami-Drachen faltet." },
    { q: "Warum können Geister so schlecht lügen?", a: "Weil man durch sie hindurchsehen kann!" },
    { q: "Was macht ein Informatiker im Wald?", a: "Bäume loggen!" },
    { q: "Warum trinken Programmierer so viel Kaffee?", a: "Weil Java ohne Kaffee nur ein Script ist." },
    { q: "Wie nennt man eine To-Do-Liste mit 40 offenen Aufgaben?", a: "Eine Wunschliste für das nächste Leben!" },
    { q: "Was ist der Lieblingsort eines Programmierers?", a: "Das Loop!" }
  ];

  const ROAST_TEMPLATES = [
    "👀 Schau dir diese Aufgabe an... Sie wartet seit 3 Tagen darauf, dass du sie in 90 Sekunden erledigst!",
    "🔥 Wenn Prokrastination eine olympische Disziplin wäre, hättest du gerade Gold geholt. Klick auf Start!",
    "🧠 Dein Gehirn: 'Lass uns erst den Wikipedia-Artikel über antiken römischen Beton lesen.' — Noodle sagt: Erst 2 Minuten Fokus!",
    "🚀 Kleine Erinnerung: Eine unvollständige Aufgabe tut dir nichts. Sie schaut dich nur vorwurfsvoll an.",
    "☕ Espresso getrunken, Playlist an, jetzt 5 Minuten Power-Sprint — danach gibt's Belohnung!"
  ];

  const DECISIONS = [
    "🚀 Einfach anfangen (2-Minuten-Regel)!",
    "☕ Hol dir ein Glas Wasser / Tee & los!",
    "🎧 Lieblings-Beat anmachen & 10 Min Power!",
    "✂️ Zerlege die Aufgabe in 3 Mini-Schritte!",
    "🧘 3 tiefe Atemzüge & die leichteste Sache zuerst!",
    "🎲 Würfeln: Gerade Zahl = Jetzt machen, Ungerade = 5 Min Dehnen!"
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ==========================================================================
  // 1. WEB AUDIO SYNTHESIZED SOUND EFFECTS (Zero External Assets)
  // ==========================================================================
  const SoundFX = {
    airhorn: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [466.16, 466.16, 466.16, 466.16, 622.25];
      const times = [0, 0.08, 0.16, 0.24, 0.34];
      const durs  = [0.06, 0.06, 0.06, 0.06, 0.45];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + times[idx]);
        gain.gain.setValueAtTime(0.18, now + times[idx]);
        gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + durs[idx]);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + times[idx]);
        osc.stop(now + times[idx] + durs[idx]);
      });
    },

    applause: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    },

    rimshot: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      cOsc.type = 'square';
      cOsc.frequency.setValueAtTime(1400, now + 0.12);
      cGain.gain.setValueAtTime(0.12, now + 0.12);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      cOsc.connect(cGain);
      cGain.connect(ctx.destination);
      cOsc.start(now + 0.12);
      cOsc.stop(now + 0.35);
    },

    fail: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [311.13, 293.66, 277.18, 261.63];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const start = now + idx * 0.22;
        const dur = idx === 3 ? 0.6 : 0.2;
        osc.frequency.setValueAtTime(freq, start);
        if (idx === 3) {
          osc.frequency.linearRampToValueAtTime(freq - 20, start + dur);
        }
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    },

    boing: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    },

    pop: function(pitch = 600) {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.8, now + 0.04);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    },

    sparkle: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.05;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      });
    },

    laser: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    },

    whoosh: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const now = ctx.currentTime;
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
      filter.Q.value = 3.0;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    },

    coin: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.18, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    },

    warp: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    },

    buzz: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(55, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    },

    thud: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.22);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    },

    glitch: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [180, 520, 240, 890, 130].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        const t = now + idx * 0.05;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      });
    },

    reboot: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const t = now + idx * 0.1;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    },

    squeak: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2600, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    },

    explosion: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.9;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.8);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    },

    shatter: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [2200, 3100, 4400, 1800, 5200].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const t = now + idx * 0.025;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    },

    dvdHit: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    },

    rewind: function() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.4);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  };

  // ==========================================================================
  // 2. STYLES & CHAOS FX ENGINE
  // ==========================================================================
  function injectChaosStyles() {
    if (document.getElementById('humor-chaos-styles')) return;
    const style = document.createElement('style');
    style.id = 'humor-chaos-styles';
    style.textContent = `
      @keyframes humor-jello {
        0%, 100% { transform: scale3d(1, 1, 1); }
        30% { transform: scale3d(1.12, 0.88, 1) rotate(-2deg); }
        40% { transform: scale3d(0.88, 1.12, 1) rotate(2deg); }
        50% { transform: scale3d(1.05, 0.95, 1) rotate(-1deg); }
        65% { transform: scale3d(0.98, 1.02, 1) rotate(1deg); }
        75% { transform: scale3d(1.02, 0.98, 1); }
      }
      .chaos-jello .task-card, .chaos-jello button, .chaos-jello main article {
        animation: humor-jello 0.85s ease infinite;
      }
      @keyframes humor-matrix-glow {
        0% { filter: hue-rotate(0deg) drop-shadow(0 0 8px #10b981); }
        50% { filter: hue-rotate(90deg) drop-shadow(0 0 15px #06b6d4); }
        100% { filter: hue-rotate(0deg) drop-shadow(0 0 8px #10b981); }
      }
      .chaos-matrix-active {
        animation: humor-matrix-glow 2s infinite ease-in-out;
      }
      @keyframes humor-earthquake {
        0% { transform: translate(0, 0) rotate(0deg); }
        15% { transform: translate(-7px, 5px) rotate(-1deg); filter: drop-shadow(4px 0 0 rgba(239, 68, 68, 0.6)) drop-shadow(-4px 0 0 rgba(6, 182, 212, 0.6)); }
        30% { transform: translate(8px, -6px) rotate(1.2deg); filter: drop-shadow(-5px 0 0 rgba(239, 68, 68, 0.7)) drop-shadow(5px 0 0 rgba(6, 182, 212, 0.7)); }
        45% { transform: translate(-9px, -5px) rotate(-1.3deg); }
        60% { transform: translate(7px, 7px) rotate(1deg); }
        75% { transform: translate(-5px, 3px) rotate(-0.6deg); }
        90% { transform: translate(4px, -3px) rotate(0.4deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      .chaos-earthquake {
        animation: humor-earthquake 0.28s infinite linear !important;
      }
      .chaos-upside-down {
        transform: rotate(180deg) !important;
        transition: transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        transform-origin: center center !important;
      }
      .humor-fleeing-target {
        transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        position: relative;
        z-index: 50;
      }
      .humor-melting-active {
        filter: url(#humor-melt-filter) !important;
        transform: scaleY(1.04) translateY(10px) !important;
        transition: filter 0.5s ease, transform 0.8s ease;
      }
      .humor-crt-screen {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999990;
        pointer-events: none;
        background: radial-gradient(circle, rgba(16, 24, 16, 0.2) 0%, rgba(0, 0, 0, 0.92) 100%);
        box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.95);
      }
      .humor-crt-screen::before {
        content: " ";
        display: block;
        position: absolute;
        top: 0; left: 0; bottom: 0; right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%);
        background-size: 100% 4px;
        z-index: 2;
        pointer-events: none;
      }
      .noodle-fx-canvas-overlay {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999990;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      .noodle-idle-badge {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        background: rgba(15, 13, 26, 0.92);
        border: 1px solid rgba(192, 132, 252, 0.4);
        box-shadow: 0 10px 35px rgba(0,0,0,0.8), 0 0 20px rgba(168, 85, 247, 0.35);
        backdrop-filter: blur(14px);
        color: #f3f4f6;
        padding: 8px 18px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
        animation: fade-in 0.3s ease;
      }
      @keyframes humor-nervous {
        0% { transform: translate(0, 0) rotate(0deg); }
        20% { transform: translate(-3px, 2px) rotate(-1deg); }
        40% { transform: translate(3px, -2px) rotate(1.5deg); }
        60% { transform: translate(-2px, -3px) rotate(-0.8deg); }
        80% { transform: translate(4px, 1px) rotate(1.2deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      .chaos-nervous-twitch .task-card,
      .chaos-nervous-twitch button,
      .chaos-nervous-twitch .kanban-column,
      .chaos-nervous-twitch .dock-orb-btn,
      .chaos-nervous-twitch .glass-card {
        animation: humor-nervous 0.12s infinite alternate ease-in-out !important;
      }
      @keyframes humor-vhs-scan {
        0% { background-position: 0 0; }
        100% { background-position: 0 100%; }
      }
      .chaos-vhs-screen {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999990;
        pointer-events: none;
        background: repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 2px, transparent 4px);
        animation: humor-vhs-scan 8s linear infinite;
      }
      .chaos-ransomware-screen {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999999;
        background: rgba(12, 4, 8, 0.96);
        color: #ff4444;
        font-family: 'Consolas', 'Courier New', Courier, monospace;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        animation: humor-bsod-in 0.22s ease;
        user-select: none;
      }
      @keyframes humor-warp-spin {
        0% { filter: hue-rotate(0deg) contrast(1.1); }
        50% { filter: hue-rotate(180deg) contrast(1.8) saturate(2); }
        100% { filter: hue-rotate(360deg) contrast(1.1); }
      }
      .chaos-time-warp-active {
        animation: humor-warp-spin 1.2s infinite linear !important;
      }
      #humor-dvd-logo {
        position: fixed;
        z-index: 9999995;
        padding: 8px 16px;
        border-radius: 9999px;
        font-weight: 900;
        letter-spacing: 2px;
        display: flex;
        align-items: center;
        gap: 8px;
        user-select: none;
        pointer-events: none;
        transition: color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
    `;
    document.head.appendChild(style);
  }

  function panicReset(silent = false) {
    activeEffects.clear();
    isIdleActive = false;

    if (activeFxAnimId) {
      cancelAnimationFrame(activeFxAnimId);
      activeFxAnimId = null;
    }
    if (activeFxCleanup) {
      try { activeFxCleanup(); } catch(e) {}
      activeFxCleanup = null;
    }

    // Run all registered dynamic cleanups (text scrambles, physics timers, event listeners)
    while (activeCleanups.length > 0) {
      const fn = activeCleanups.pop();
      try { fn(); } catch(e) {}
    }

    document.querySelectorAll('.noodle-fx-canvas-overlay, #humor-fx-canvas, #humor-melting-svg, .humor-crt-screen, .noodle-idle-badge, .chaos-vhs-screen, .chaos-ransomware-screen, #humor-dvd-logo, #humor-glass-canvas, #humor-pixel-canvas, #humor-timewarp-overlay').forEach(el => el.remove());
    document.body.classList.remove('chaos-jello', 'chaos-matrix-active', 'chaos-vortex-active', 'chaos-earthquake', 'chaos-upside-down', 'chaos-nervous-twitch', 'chaos-time-warp-active');

    const existingStyle = document.getElementById('humor-chaos-styles');
    if (existingStyle) existingStyle.remove();

    document.querySelectorAll('.task-card, .glass-card, header, main, main article, .kanban-column, .dock-orb-btn, button').forEach(el => {
      el.style.transform = '';
      el.style.transition = '';
      el.style.animation = '';
      el.style.filter = '';
      el.classList.remove('humor-melting-active', 'humor-fleeing-target');
    });

    if (!silent && typeof showFloatingToast === 'function') {
      showFloatingToast('🛡️ Normalität wiederhergestellt! Alle Effekte beendet.', 'info');
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        panicReset();
      }
    });
  }

  // ==========================================================================
  // 3. EFFECT IMPLEMENTATIONS (Chaos & Visual FX)
  // ==========================================================================
  
  // 1. GRAVITY DROP & BOUNCE
  function toggleGravity() {
    injectChaosStyles();
    SoundFX.boing();
    const cards = document.querySelectorAll('.task-card, main article > div[draggable="true"]');
    cards.forEach((card) => {
      const rot = (Math.random() * 14 - 7).toFixed(1);
      const transY = (Math.random() * 18 + 8).toFixed(1);
      card.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.35)';
      card.style.transform = `translateY(${transY}px) rotate(${rot}deg) scale(1.02)`;
    });
    activeEffects.add('gravity');
    setTimeout(() => {
      cards.forEach(card => {
        card.style.transform = '';
      });
      activeEffects.delete('gravity');
    }, 3800);
  }

  // 2. JELLO WOBBLE
  function toggleJello() {
    injectChaosStyles();
    SoundFX.boing();
    document.body.classList.add('chaos-jello');
    activeEffects.add('jello');
    setTimeout(() => {
      document.body.classList.remove('chaos-jello');
      activeEffects.delete('jello');
    }, 3500);
  }

  // 3. MATRIX CYBER CODE RAIN (Canvas)
  function toggleMatrix(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.sparkle();
    
    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const letters = '01010101アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン⚡✨NOODLEFLOW⚛';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    function drawMatrix() {
      ctx.fillStyle = 'rgba(10, 8, 20, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ffaa';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : (i % 2 === 0 ? '#a855f7' : '#10b981');
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      activeFxAnimId = requestAnimationFrame(drawMatrix);
    }
    drawMatrix();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };

    if (!isIdle) {
      setTimeout(panicReset, 6000);
    }
  }

  // 4. VORTEX BLACK HOLE SWIRL
  function toggleVortex() {
    injectChaosStyles();
    SoundFX.whoosh();
    document.body.classList.add('chaos-vortex-active');
    activeEffects.add('vortex');
    setTimeout(() => {
      document.body.classList.remove('chaos-vortex-active');
      activeEffects.delete('vortex');
    }, 4000);
  }

  // 5. NEON LASER SCANNER
  function toggleLaser() {
    injectChaosStyles();
    SoundFX.laser();
    const laserEl = document.createElement('div');
    laserEl.className = 'noodle-fx-canvas-overlay';
    laserEl.innerHTML = `
      <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, transparent, #ec4899, #00f2fe, #a855f7, transparent); box-shadow:0 0 20px #00f2fe, 0 0 40px #ec4899; animation:laser-sweep 2.2s ease-in-out infinite;"></div>
      <style>
        @keyframes laser-sweep {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 95%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
      </style>
    `;
    document.body.appendChild(laserEl);
    activeEffects.add('laser');
    setTimeout(() => {
      laserEl.remove();
      activeEffects.delete('laser');
    }, 4500);
  }

  // 6. CONFETTI PARTY BLAST
  function toggleConfetti() {
    injectChaosStyles();
    SoundFX.applause();
    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
    const particles = Array.from({ length: 90 }, () => ({
      x: width * 0.5 + (Math.random() - 0.5) * 200,
      y: height * 0.6,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 16 - 8,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    }));

    function renderConfetti() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.vx *= 0.98;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      activeFxAnimId = requestAnimationFrame(renderConfetti);
    }
    renderConfetti();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    setTimeout(panicReset, 5000);
  }

  // 7. HYPERSPACE WARP SPEED (3D Stars)
  function toggleHyperspace(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.warp();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 220 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      pz: Math.random() * width
    }));

    const speed = isIdle ? 10 : 25;

    function renderHyperspace() {
      ctx.fillStyle = 'rgba(8, 7, 16, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach(star => {
        star.pz = star.z;
        star.z -= speed;
        if (star.z <= 0) {
          star.z = width;
          star.pz = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        const sx = (star.x / star.z) * width + cx;
        const sy = (star.y / star.z) * width + cy;
        const px = (star.x / star.pz) * width + cx;
        const py = (star.y / star.pz) * width + cy;

        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = Math.min(2.5, (1 - star.z / width) * 3);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      });
      activeFxAnimId = requestAnimationFrame(renderHyperspace);
    }
    renderHyperspace();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // 8. SOAP BUBBLE STREAM (Floating & Popping)
  function toggleBubbles(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.sparkle();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const bubbles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 200,
      r: Math.random() * 24 + 10,
      vy: -Math.random() * 1.5 - 0.8,
      vx: (Math.random() - 0.5) * 0.8,
      color: Math.random() > 0.5 ? 'rgba(236, 72, 153, 0.4)' : 'rgba(147, 51, 234, 0.4)'
    }));

    function renderBubbles() {
      ctx.clearRect(0, 0, width, height);

      bubbles.forEach(b => {
        b.y += b.vy;
        b.x += b.vx;
        if (b.y < -50) {
          b.y = height + 30;
          b.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.stroke();

        // Highlight glint
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      });
      activeFxAnimId = requestAnimationFrame(renderBubbles);
    }
    renderBubbles();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    if (!isIdle) setTimeout(panicReset, 7000);
  }

  // 9. GOLDEN FIREFLIES DRIFT
  function toggleFireflies(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.sparkle();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fireflies = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1.5,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.6 + 0.4
    }));

    function renderFireflies() {
      ctx.clearRect(0, 0, width, height);

      fireflies.forEach(f => {
        f.angle += (Math.random() - 0.5) * 0.1;
        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed;

        if (f.x < 0) f.x = width;
        if (f.x > width) f.x = 0;
        if (f.y < 0) f.y = height;
        if (f.y > height) f.y = 0;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 204, 21, ${f.alpha})`;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      activeFxAnimId = requestAnimationFrame(renderFireflies);
    }
    renderFireflies();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    if (!isIdle) setTimeout(panicReset, 7500);
  }

  // 10. 80s SYNTHWAVE HORIZON GRID
  function toggleSynthwave(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.laser();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let offset = 0;

    function renderSynthwave() {
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * 0.68;

      // Synthwave sun
      const sunGradient = ctx.createLinearGradient(0, horizonY - 120, 0, horizonY);
      sunGradient.addColorStop(0, '#f43f5e');
      sunGradient.addColorStop(0.5, '#fb923c');
      sunGradient.addColorStop(1, '#fde047');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(width / 2, horizonY, 80, Math.PI, 0, false);
      ctx.fill();

      // Horizon line glow
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Perspective Grid Lines
      offset = (offset + 1.2) % 30;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 1.2;

      for (let y = horizonY + offset; y < height; y += (y - horizonY) * 0.35 + 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      activeFxAnimId = requestAnimationFrame(renderSynthwave);
    }
    renderSynthwave();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    if (!isIdle) setTimeout(panicReset, 7500);
  }

  // 11. COZY WINTER SNOW
  function toggleSnow(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.sparkle();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const flakes = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      vy: Math.random() * 1.2 + 0.5,
      vx: (Math.random() - 0.5) * 0.6
    }));

    function renderSnow() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

      flakes.forEach(f => {
        f.y += f.vy;
        f.x += f.vx;
        if (f.y > height) {
          f.y = -10;
          f.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
      activeFxAnimId = requestAnimationFrame(renderSnow);
    }
    renderSnow();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    if (!isIdle) setTimeout(panicReset, 7500);
  }

  // 12. RETRO 8-BIT ARCADE PIXEL DRIFT
  function toggleArcade(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.coin();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const items = ['💖', '⭐', '🪙', '🍄', '👾', '💎', '🚀'];
    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 100,
      char: items[Math.floor(Math.random() * items.length)],
      vy: -Math.random() * 1.8 - 0.8,
      size: Math.floor(Math.random() * 10 + 16)
    }));

    function renderArcade() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.vy;
        if (p.y < -40) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        ctx.font = `${p.size}px monospace`;
        ctx.fillText(p.char, p.x, p.y);
      });
      activeFxAnimId = requestAnimationFrame(renderArcade);
    }
    renderArcade();

    activeFxCleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
    };
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // ==========================================================================
  // 4. RADICAL APP-BREAKING CHAOS FX (100% Reversible, Safe & Recoverable)
  // ==========================================================================

  // RADICAL 1: GRAVITATIONAL COLLAPSE (Cards & Board Drop)
  function toggleGravityCollapse(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.thud();

    const targets = Array.from(document.querySelectorAll('.task-card, .kanban-column, header, .dock-orb-btn, .glass-card'));
    const originalStyles = targets.map(el => ({
      el,
      transform: el.style.transform,
      transition: el.style.transition
    }));

    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const dropDistance = Math.max(120, (window.innerHeight - rect.bottom - 40) + (Math.random() * 40 - 20));
      const rot = (Math.random() * 32 - 16).toFixed(1);
      el.style.transition = 'transform 0.75s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
      el.style.transform = `translateY(${dropDistance}px) rotate(${rot}deg) scale(0.96)`;
    });

    const cleanup = () => {
      targets.forEach(({ el }, idx) => {
        if (el && el.isConnected) {
          el.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
          el.style.transform = originalStyles[idx].transform || '';
          setTimeout(() => {
            if (el && el.isConnected) {
              el.style.transition = originalStyles[idx].transition || '';
            }
          }, 700);
        }
      });
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // RADICAL 3: EARTHQUAKE 10.0 & CRACK OVERLAY
  function toggleEarthquake(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.buzz();

    document.body.classList.add('chaos-earthquake');

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;

    function drawBranch(x, y, angle, length, depth) {
      if (depth <= 0) return;
      const nx = x + Math.cos(angle) * length;
      const ny = y + Math.sin(angle) * length;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      drawBranch(nx, ny, angle + (Math.random() - 0.5) * 0.8, length * 0.7, depth - 1);
      if (Math.random() < 0.5) {
        drawBranch(nx, ny, angle + (Math.random() - 0.5) * 1.2, length * 0.6, depth - 1);
      }
    }

    for (let i = 0; i < 4; i++) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() < 0.5 ? 0 : canvas.height;
      const targetAngle = startY === 0 ? Math.PI / 2 : -Math.PI / 2;
      drawBranch(startX, startY, targetAngle + (Math.random() - 0.5) * 0.6, 90, 5);
    }

    const cleanup = () => {
      document.body.classList.remove('chaos-earthquake');
      canvas.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 5500);
  }

  // RADICAL 4: MELTING UI (SVG Liquid Distortion)
  function toggleMeltingUI(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.glitch();

    let svg = document.getElementById('humor-melting-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'humor-melting-svg';
      svg.setAttribute('style', 'position:absolute; width:0; height:0; pointer-events:none;');
      svg.innerHTML = `
        <filter id="humor-melt-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="2" result="noise" seed="3">
            <animate attributeName="baseFrequency" dur="4s" values="0.01 0.04; 0.02 0.12; 0.01 0.04" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      `;
      document.body.appendChild(svg);
    }

    const mainEl = document.querySelector('main') || document.body;
    mainEl.classList.add('humor-melting-active');

    const cleanup = () => {
      mainEl.classList.remove('humor-melting-active');
      const s = document.getElementById('humor-melting-svg');
      if (s) s.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // RADICAL 5: HACKER CODE CORRUPTION (Scramble Board Text)
  let hackerCorruptionHandle = null;
  function toggleHackerCorruption(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.glitch();

    const candidates = Array.from(document.querySelectorAll('.task-card h4, .task-card p, header h1, header span, .kanban-column h3, .glass-card span, button span'));
    const chosen = candidates.slice(0, 30);
    const originalTexts = chosen.map(el => ({ el, text: el.textContent }));

    const glyphs = ['0', '1', '§', '☠', '¿', 'Ø', '░', '▓', '█', '#', '!', '$', '%', '&', 'λ', 'µ', 'ERROR_404', 'NaN'];
    document.body.classList.add('chaos-matrix-active');

    function scramble() {
      originalTexts.forEach(({ el, text }) => {
        if (!el || !el.isConnected) return;
        const chars = text.split('');
        const scrambled = chars.map(ch => {
          if (ch === ' ' || ch === '\n') return ch;
          return Math.random() < 0.4 ? glyphs[Math.floor(Math.random() * glyphs.length)] : ch;
        }).join('');
        el.textContent = scrambled;
      });
    }

    hackerCorruptionHandle = setInterval(scramble, 120);

    const cleanup = () => {
      if (hackerCorruptionHandle) {
        clearInterval(hackerCorruptionHandle);
        hackerCorruptionHandle = null;
      }
      originalTexts.forEach(({ el, text }) => {
        if (el && el.isConnected) {
          el.textContent = text;
        }
      });
      document.body.classList.remove('chaos-matrix-active');
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // RADICAL 6: FLEEING UI (Buttons Dodge The Cursor)
  function toggleFleeingUI(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.squeak();

    const targets = Array.from(document.querySelectorAll('.task-card, button, .dock-orb-btn, .glass-card'));
    
    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>🏃</span><span>Die Buttons streiken und fliehen vor der Maus! [ESC] zum Fangen</span>`;
    document.body.appendChild(badge);

    let lastSqueakTime = 0;

    const onMouseMove = (e) => {
      const mx = e.clientX;
      const my = e.clientY;

      targets.forEach(el => {
        if (!el || !el.isConnected) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.hypot(dx, dy);

        if (dist < 110 && dist > 0) {
          const push = (110 - dist) * 1.1;
          const px = (dx / dist) * push;
          const py = (dy / dist) * push;
          el.classList.add('humor-fleeing-target');
          el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;

          const now = Date.now();
          if (now - lastSqueakTime > 350) {
            lastSqueakTime = now;
            SoundFX.squeak();
          }
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove);
      targets.forEach(el => {
        if (el && el.isConnected) {
          el.style.transform = '';
          el.classList.remove('humor-fleeing-target');
        }
      });
      badge.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 8000);
  }

  // RADICAL 7: UPSIDE-DOWN WORLD (180° Inversion)
  function toggleUpsideDown(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.warp();

    document.body.classList.add('chaos-upside-down');

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>🙃</span><span>Dimension umgekehrt! Maus bewegen oder [ESC] zum Wenden</span>`;
    document.body.appendChild(badge);

    const cleanup = () => {
      document.body.classList.remove('chaos-upside-down');
      badge.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // RADICAL 8: CRT RETRO BREAKDOWN (Tube TV Collapse)
  function toggleCRTBreakdown(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.buzz();

    const crtEl = document.createElement('div');
    crtEl.className = 'humor-crt-screen';

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    crtEl.appendChild(canvas);
    document.body.appendChild(crtEl);

    const ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;
    let phase = 0;

    function renderCRT() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      phase += 0.05;
      const beamHeight = Math.max(2, 60 * Math.exp(-phase * 0.8));
      const beamY = height / 2 - beamHeight / 2;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 20;
      ctx.fillRect(0, beamY, width, beamHeight);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 20; i++) {
        const ry = Math.random() * height;
        ctx.fillRect(0, ry, width, Math.random() * 2);
      }

      activeFxAnimId = requestAnimationFrame(renderCRT);
    }
    renderCRT();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      crtEl.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6000);
  }

  // RADICAL 9: SPIDERWEB GLASS SHATTER (Display Fracture)
  function toggleGlassShatter(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.shatter();

    if (document.body) {
      document.body.style.transform = 'rotate(-1.2deg) scale(0.99)';
      setTimeout(() => {
        if (document.body) document.body.style.transform = '';
      }, 320);
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-glass-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cx = width / 2 + (Math.random() * 120 - 60);
    const cy = height / 2 + (Math.random() * 100 - 50);

    // Crack paths
    const crackBranches = [];
    const numRays = 16;
    for (let i = 0; i < numRays; i++) {
      const baseAngle = (i / numRays) * Math.PI * 2;
      let curX = cx;
      let curY = cy;
      const pts = [{ x: curX, y: curY }];
      const segments = Math.floor(Math.random() * 6 + 5);
      for (let s = 0; s < segments; s++) {
        const segLen = Math.random() * 80 + 40;
        const a = baseAngle + (Math.random() - 0.5) * 0.45;
        curX += Math.cos(a) * segLen;
        curY += Math.sin(a) * segLen;
        pts.push({ x: curX, y: curY });
      }
      crackBranches.push(pts);
    }

    // Shards
    const shards = Array.from({ length: 35 }, () => ({
      x: cx + (Math.random() * 140 - 70),
      y: cy + (Math.random() * 140 - 70),
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -3 - 1,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 16 + 8,
      alpha: Math.random() * 0.5 + 0.35
    }));

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>🔨</span><span>Display zerbrochen! Bewege die Maus oder drücke [ESC] für Reparatur</span>`;
    document.body.appendChild(badge);

    function renderGlass() {
      ctx.clearRect(0, 0, width, height);

      // Radial web lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;

      crackBranches.forEach(pts => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      });

      // Concentric connecting crack arcs
      [45, 95, 160, 240, 340].forEach(radius => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.35) {
          const r = radius + (Math.random() - 0.5) * 14;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      // Tumble shards with physics
      shards.forEach(s => {
        s.vy += 0.32;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.vrot;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.fillStyle = `rgba(224, 242, 254, ${s.alpha})`;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s.size, -s.size / 2);
        ctx.lineTo(s.size, -s.size / 2);
        ctx.lineTo(0, s.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      activeFxAnimId = requestAnimationFrame(renderGlass);
    }
    renderGlass();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
      badge.remove();
      if (document.body) document.body.style.transform = '';
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 7000);
  }

  // RADICAL 10: RETRO BOUNCING NOODLE DVD SCREENSAVER
  function toggleDvdBounce(isIdle = false) {
    injectChaosStyles();

    const logo = document.createElement('div');
    logo.id = 'humor-dvd-logo';
    logo.innerHTML = `
      <img src="logo-noodle.png" alt="Noodle" style="height: 22px; width: auto; object-fit: contain;" />
      <span style="font-size: 13px; font-weight: 900; letter-spacing: 1.5px;">NOODLE</span>
    `;
    document.body.appendChild(logo);

    const colors = ['#00f2fe', '#f43f5e', '#39ff14', '#eab308', '#a855f7', '#ec4899', '#38bdf8'];
    let colorIdx = 0;

    function applyLogoColor(c) {
      logo.style.color = c;
      logo.style.border = `2px solid ${c}`;
      logo.style.boxShadow = `0 0 25px ${c}, inset 0 0 10px ${c}40`;
      logo.style.background = 'rgba(10, 8, 20, 0.92)';
    }
    applyLogoColor(colors[0]);

    let x = Math.random() * (window.innerWidth - 180) + 40;
    let y = Math.random() * (window.innerHeight - 100) + 40;
    let vx = 3.8;
    let vy = 2.9;
    const w = 125;
    const h = 42;

    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.opacity = '0.35';

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>📺</span><span>Der legendäre DVD-Screensaver... Trifft er die Ecke?! [ESC]</span>`;
    document.body.appendChild(badge);

    function bounceLoop() {
      x += vx;
      y += vy;

      let hitWall = false;
      const maxX = window.innerWidth - w - 8;
      const maxY = window.innerHeight - h - 8;

      if (x <= 8) {
        x = 8;
        vx = Math.abs(vx);
        hitWall = true;
      } else if (x >= maxX) {
        x = maxX;
        vx = -Math.abs(vx);
        hitWall = true;
      }

      if (y <= 8) {
        y = 8;
        vy = Math.abs(vy);
        hitWall = true;
      } else if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy);
        hitWall = true;
      }

      if (hitWall) {
        colorIdx = (colorIdx + 1) % colors.length;
        applyLogoColor(colors[colorIdx]);
        SoundFX.dvdHit();

        // Corner hit easter egg!
        const nearLeft = x <= 16;
        const nearRight = x >= maxX - 8;
        const nearTop = y <= 16;
        const nearBottom = y >= maxY - 8;
        if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
          SoundFX.applause();
          if (typeof showFloatingToast === 'function') {
            showFloatingToast('🎯 ECK-TREFFER! Das Internet applaudiert!', 'success');
          }
        }
      }

      logo.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      activeFxAnimId = requestAnimationFrame(bounceLoop);
    }
    bounceLoop();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      logo.remove();
      badge.remove();
      if (mainEl) mainEl.style.opacity = '';
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 11000);
  }

  // RADICAL 11: ANALOG VHS GLITCH & TRACKING DESTRUCTION
  function toggleVHSGlitch(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.rewind();

    const vhsOverlay = document.createElement('div');
    vhsOverlay.className = 'chaos-vhs-screen';
    vhsOverlay.innerHTML = `
      <div style="position: absolute; top: 28px; left: 32px; font-family: monospace; color: #39ff14; font-size: 17px; font-weight: bold; text-shadow: 0 0 8px #39ff14; pointer-events: none; letter-spacing: 1px;">
        PLAY ▶ 00:42:19<br>
        <span style="font-size: 12px; color: #a7f3d0; opacity: 0.85;">SP • Hi-Fi STEREO • CH 03</span>
      </div>
    `;
    document.body.appendChild(vhsOverlay);

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let frame = 0;

    function renderVHS() {
      ctx.clearRect(0, 0, width, height);
      frame++;

      // Scanline static noise bar moving up
      const barY = (frame * 4) % (height + 120) - 60;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fillRect(0, barY, width, 24);

      // Random horizontal tear slices
      for (let i = 0; i < 6; i++) {
        if (Math.random() < 0.65) {
          const sy = Math.random() * height;
          const sh = Math.random() * 8 + 2;
          const shift = (Math.random() - 0.5) * 35;
          ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0, 242, 254, 0.14)' : 'rgba(244, 63, 94, 0.14)';
          ctx.fillRect(shift, sy, width, sh);
        }
      }

      activeFxAnimId = requestAnimationFrame(renderVHS);
    }
    renderVHS();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      vhsOverlay.remove();
      canvas.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 7500);
  }

  // RADICAL 12: NERVOUS TWITCH & HYPERACTIVE ADHS JITTER
  function toggleNervousTwitch(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.squeak();

    document.body.classList.add('chaos-nervous-twitch');

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>⚡</span><span>Koffein-Schock! Die gesamte Benutzeroberfläche zappelt nervös! [ESC]</span>`;
    document.body.appendChild(badge);

    const candidates = Array.from(document.querySelectorAll('.task-card, .dock-orb-btn, .kanban-column, button'));
    const jitterTimer = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        if (target && target.isConnected) {
          const jx = (Math.random() * 8 - 4).toFixed(1);
          const jy = (Math.random() * -10 - 2).toFixed(1);
          target.style.transform = `translate(${jx}px, ${jy}px) scale(1.03)`;
          setTimeout(() => {
            if (target && target.isConnected) target.style.transform = '';
          }, 110);
        }
      }
    }, 150);

    const cleanup = () => {
      clearInterval(jitterTimer);
      document.body.classList.remove('chaos-nervous-twitch');
      candidates.forEach(el => {
        if (el && el.isConnected) el.style.transform = '';
      });
      badge.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // RADICAL 13: ZERO-GRAVITY SPACE FLOAT (Cards Float Into Orbit)
  function toggleAntiGravityFloat(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.warp();

    const targets = Array.from(document.querySelectorAll('.task-card, .kanban-column, .dock-orb-btn, .glass-card'));
    const originalStyles = targets.map(el => ({
      el,
      transform: el.style.transform,
      transition: el.style.transition
    }));

    targets.forEach(el => {
      const floatDistance = Math.random() * 280 + 160;
      const rot = (Math.random() * 22 - 11).toFixed(1);
      el.style.transition = 'transform 3.4s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = `translateY(-${floatDistance}px) rotate(${rot}deg) scale(0.96)`;
    });

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>🛸</span><span>Schwerelosigkeit aktiv! Alle Aufgaben schweben in den Weltraum... [ESC]</span>`;
    document.body.appendChild(badge);

    const cleanup = () => {
      targets.forEach(({ el }, idx) => {
        if (el && el.isConnected) {
          el.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
          el.style.transform = originalStyles[idx].transform || '';
          setTimeout(() => {
            if (el && el.isConnected) {
              el.style.transition = originalStyles[idx].transition || '';
            }
          }, 700);
        }
      });
      badge.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 7000);
  }

  // RADICAL 14: BLACK HOLE SINGULARITY (Extreme Gravitational Lensing)
  function toggleBlackHoleSingularity(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.explosion();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-fx-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const cx = width / 2;
    const cy = height / 2;

    const targets = Array.from(document.querySelectorAll('.task-card, .kanban-column, .dock-orb-btn, .glass-card'));
    const originalStyles = targets.map(el => ({
      el,
      transform: el.style.transform,
      transition: el.style.transition
    }));

    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const ex = rect.left + rect.width / 2;
      const ey = rect.top + rect.height / 2;
      const dx = cx - ex;
      const dy = cy - ey;
      el.style.transition = 'transform 2.6s cubic-bezier(0.68, -0.2, 0.8, 0.05)';
      el.style.transform = `translate(${dx * 0.88}px, ${dy * 0.88}px) rotate(720deg) scale(0.08)`;
    });

    let angle = 0;
    function renderBlackHole() {
      ctx.fillStyle = 'rgba(10, 8, 20, 0.12)';
      ctx.fillRect(0, 0, width, height);

      angle += 0.05;

      // Accretion disk rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const grad = ctx.createRadialGradient(0, 0, 30, 0, 0, 160);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
      grad.addColorStop(0.25, '#f97316');
      grad.addColorStop(0.6, '#a855f7');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fill();

      // Dark Event Horizon
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
      activeFxAnimId = requestAnimationFrame(renderBlackHole);
    }
    renderBlackHole();

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>🕳️</span><span>Schwarzes Loch! Ereignishorizont überschritten! [ESC]</span>`;
    document.body.appendChild(badge);

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
      badge.remove();
      targets.forEach(({ el }, idx) => {
        if (el && el.isConnected) {
          el.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
          el.style.transform = originalStyles[idx].transform || '';
          setTimeout(() => {
            if (el && el.isConnected) {
              el.style.transition = originalStyles[idx].transition || '';
            }
          }, 700);
        }
      });
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 7000);
  }

  // RADICAL 15: TORNADO CYCLONE VORTEX (Cards Orbiting The Screen)
  function toggleTornadoSpins(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.warp();

    const targets = Array.from(document.querySelectorAll('.task-card, .dock-orb-btn, .glass-card'));
    const originalStyles = targets.map(el => ({
      el,
      transform: el.style.transform,
      transition: el.style.transition
    }));

    const orbits = targets.map(() => ({
      angle: Math.random() * Math.PI * 2,
      rx: Math.random() * 220 + 90,
      ry: Math.random() * 110 + 40,
      speed: (Math.random() * 0.05 + 0.03) * (Math.random() < 0.5 ? 1 : -1)
    }));

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>🌪️</span><span>Aufgaben-Tornado der Kategorie 5 fegt übers Board! [ESC]</span>`;
    document.body.appendChild(badge);

    function tornadoLoop() {
      targets.forEach((el, idx) => {
        if (!el || !el.isConnected) return;
        const o = orbits[idx];
        o.angle += o.speed;
        const ox = (Math.cos(o.angle) * o.rx).toFixed(1);
        const oy = (Math.sin(o.angle) * o.ry).toFixed(1);
        const rot = (o.angle * 45).toFixed(1);
        const scale = (0.8 + 0.25 * Math.sin(o.angle)).toFixed(2);
        el.style.transition = 'none';
        el.style.transform = `translate(${ox}px, ${oy}px) rotate(${rot}deg) scale(${scale})`;
      });
      activeFxAnimId = requestAnimationFrame(tornadoLoop);
    }
    tornadoLoop();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      badge.remove();
      targets.forEach(({ el }, idx) => {
        if (el && el.isConnected) {
          el.style.transition = 'transform 0.5s ease';
          el.style.transform = originalStyles[idx].transform || '';
          setTimeout(() => {
            if (el && el.isConnected) el.style.transition = originalStyles[idx].transition || '';
          }, 550);
        }
      });
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 7500);
  }

  // RADICAL 16: HARMLESS RETRO RANSOMWARE MODAL
  function toggleFakeRansomware(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.buzz();

    const screen = document.createElement('div');
    screen.className = 'chaos-ransomware-screen';
    screen.innerHTML = `
      <div style="max-width: 660px; background: #180509; border: 2px solid #ef4444; border-radius: 18px; padding: 32px; box-shadow: 0 0 50px rgba(239,68,68,0.55); text-align: center; width: 100%;">
        <div style="font-size: 3.5rem; margin-bottom: 8px; line-height: 1;">☠️</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #f87171; margin-bottom: 12px; letter-spacing: 1.5px;">
          NOODLE-CRYPTOR v4.2 LOCKED
        </h2>
        <p style="font-size: 0.95rem; color: #fca5a5; line-height: 1.6; margin-bottom: 22px;">
          Deine Aufgaben wurden mit einem <strong>4096-Bit Koffein-Schlüssel</strong> verschlüsselt!<br>
          Um deine To-Dos freizulassen, verlangt das Kollektiv <em>"Procrastination-X"</em> ein Lösegeld!
        </p>
        <div style="background: rgba(0,0,0,0.65); border: 1px solid #ef4444; border-radius: 10px; padding: 12px; margin-bottom: 24px; font-family: monospace; font-size: 1.3rem; color: #fef08a;">
          Verbleibende Zeit: <span id="humor-ransom-timer">00:59:42</span>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button id="humor-pay-coffee" style="background: #10b981; color: white; padding: 11px 20px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; font-size: 0.9rem; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            ☕ Lösegeld zahlen (1 Tasse Kaffee)
          </button>
          <button id="humor-negotiate" style="background: #6366f1; color: white; padding: 11px 20px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; font-size: 0.9rem; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            💸 Rabatt aushandeln (100% Nachlass)
          </button>
          <button id="humor-ransom-esc" style="background: rgba(255,255,255,0.1); color: #e5e7eb; padding: 11px 16px; border-radius: 12px; font-weight: bold; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; font-size: 0.9rem;">
            🛡️ Notfall [ESC]
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(screen);

    let sec = 3582;
    const timer = setInterval(() => {
      sec--;
      const el = document.getElementById('humor-ransom-timer');
      if (el) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        el.textContent = `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    }, 1000);

    const onPayCoffee = () => {
      SoundFX.applause();
      if (typeof showFloatingToast === 'function') {
        showFloatingToast('☕ Kaffee akzeptiert! Aufgaben freigelassen!', 'success');
      }
      panicReset(false);
    };

    const onNegotiate = () => {
      SoundFX.coin();
      if (typeof showFloatingToast === 'function') {
        showFloatingToast('🎉 100% Rabatt verhandelt! Weiter gehts!', 'success');
      }
      panicReset(false);
    };

    const payBtn = screen.querySelector('#humor-pay-coffee');
    const negBtn = screen.querySelector('#humor-negotiate');
    const escBtn = screen.querySelector('#humor-ransom-esc');

    if (payBtn) payBtn.addEventListener('click', onPayCoffee);
    if (negBtn) negBtn.addEventListener('click', onNegotiate);
    if (escBtn) escBtn.addEventListener('click', () => panicReset(false));

    const cleanup = () => {
      clearInterval(timer);
      screen.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 11000);
  }

  // RADICAL 17: RETRO 8-BIT GAMEBOY MOSAIC PIXELATION
  function togglePixelate(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.coin();

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-pixel-canvas';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const palette = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
    const blockSize = 20;
    const cols = Math.ceil(width / blockSize);
    const rows = Math.ceil(height / blockSize);

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>👾</span><span>8-Bit Retro GameBoy Pixel-Kollaps! [ESC]</span>`;
    document.body.appendChild(badge);

    function renderPixelate() {
      for (let i = 0; i < 45; i++) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
      }
      activeFxAnimId = requestAnimationFrame(renderPixelate);
    }
    renderPixelate();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      canvas.remove();
      badge.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // RADICAL 18: HYPER-SPEED TIME-WARP REWIND
  function toggleTimeWarp(isIdle = false) {
    injectChaosStyles();
    if (!isIdle) SoundFX.rewind();

    document.body.classList.add('chaos-time-warp-active');

    const canvas = document.createElement('canvas');
    canvas.id = 'humor-timewarp-overlay';
    canvas.className = 'noodle-fx-canvas-overlay';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const cx = width / 2;
    const cy = height / 2;

    let timeOffsetSec = 0;
    let handAngle = 0;

    const badge = document.createElement('div');
    badge.className = 'noodle-idle-badge';
    badge.innerHTML = `<span>⏳</span><span>Zeitreise rückwärts! Aufgaben werden un-erledigt! [ESC]</span>`;
    document.body.appendChild(badge);

    function renderTimeWarp() {
      ctx.clearRect(0, 0, width, height);

      timeOffsetSec += 0.45;
      handAngle -= 0.22;

      // Reverse clock face in center
      ctx.save();
      ctx.translate(cx, cy);

      // Glowing dial
      ctx.strokeStyle = '#a855f7';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning clock hands
      ctx.rotate(handAngle);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -75);
      ctx.stroke();

      ctx.rotate(handAngle * 1.5);
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -55);
      ctx.stroke();

      ctx.restore();

      // Digital readout
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(`TEMPORAL REWIND: -${timeOffsetSec.toFixed(1)}s [PARADOX DETECTED]`, cx, cy + 130);

      activeFxAnimId = requestAnimationFrame(renderTimeWarp);
    }
    renderTimeWarp();

    const cleanup = () => {
      if (activeFxAnimId) cancelAnimationFrame(activeFxAnimId);
      document.body.classList.remove('chaos-time-warp-active');
      canvas.remove();
      badge.remove();
    };

    registerCleanup(cleanup);
    if (!isIdle) setTimeout(panicReset, 6500);
  }

  // ==========================================================================
  // 5. CUSTOMIZABLE IDLE AUTO-SCREENSAVER ENGINE (Rare & Radical Support)
  // ==========================================================================
  const RADICAL_FX_POOL = [
    toggleGravityCollapse,
    toggleEarthquake,
    toggleMeltingUI,
    toggleHackerCorruption,
    toggleFleeingUI,
    toggleUpsideDown,
    toggleCRTBreakdown,
    toggleGlassShatter,
    toggleDvdBounce,
    toggleVHSGlitch,
    toggleNervousTwitch,
    toggleAntiGravityFloat,
    toggleBlackHoleSingularity,
    toggleTornadoSpins,
    toggleFakeRansomware,
    togglePixelate,
    toggleTimeWarp
  ];

  const AMBIENT_FX_POOL = [
    toggleHyperspace,
    toggleBubbles,
    toggleFireflies,
    toggleSynthwave,
    toggleSnow,
    toggleMatrix,
    toggleArcade
  ];

  function getIdleTimeoutMinutes() {
    try {
      const val = parseInt(localStorage.getItem('noodle_idle_timeout_min'), 10);
      if ([1, 2, 3, 5, 10, 15].includes(val)) return val;
      return 3; // Standard: 3 Minuten (angenehm seltener als 1 Minute!)
    } catch(e) {
      return 3;
    }
  }

  function setIdleTimeoutMinutes(minutes) {
    try {
      localStorage.setItem('noodle_idle_timeout_min', minutes);
      resetIdleTimer();
      renderHumorPanel();
    } catch(e) {}
  }

  function getIdleMode() {
    try {
      const mode = localStorage.getItem('noodle_idle_fx_mode');
      if (['mixed', 'radical', 'ambient'].includes(mode)) return mode;
      return 'mixed'; // Standard: Gemischt (Zufall aus Radikal & Sanft)
    } catch(e) {
      return 'mixed';
    }
  }

  function setIdleMode(mode) {
    try {
      localStorage.setItem('noodle_idle_fx_mode', mode);
      renderHumorPanel();
    } catch(e) {}
  }

  function getIdleTimeoutMs() {
    return getIdleTimeoutMinutes() * 60 * 1000;
  }

  function isIdleEnabled() {
    try {
      const stored = localStorage.getItem('noodle_idle_fx_enabled');
      return stored !== 'false';
    } catch(e) {
      return true;
    }
  }

  function toggleIdleSetting(enabled) {
    try {
      localStorage.setItem('noodle_idle_fx_enabled', enabled ? 'true' : 'false');
      renderHumorPanel();
    } catch(e) {}
  }

  function startIdleFX() {
    if (isIdleActive || !isIdleEnabled()) return;
    isIdleActive = true;

    const mode = getIdleMode();
    let pool = [];
    if (mode === 'radical') {
      pool = RADICAL_FX_POOL;
    } else if (mode === 'ambient') {
      pool = AMBIENT_FX_POOL;
    } else {
      // 'mixed': 50% Chance für radikalen Glitch, 50% für sanftes Ambient
      pool = Math.random() < 0.5 ? RADICAL_FX_POOL : AMBIENT_FX_POOL;
    }

    const randomFx = pool[Math.floor(Math.random() * pool.length)];
    randomFx(true);
  }

  function dismissIdleFX() {
    if (!isIdleActive) return;
    panicReset(true); // Lautlos beenden ohne Toasts
  }

  function resetIdleTimer() {
    if (isIdleActive) {
      dismissIdleFX();
    }
    if (idleTimer) clearTimeout(idleTimer);
    if (isIdleEnabled()) {
      idleTimer = setTimeout(startIdleFX, getIdleTimeoutMs());
    }
  }

  // Registriere alle Benutzeraktivitäten für sofortigen Wakeup & Timer-Reset
  if (typeof window !== 'undefined') {
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointermove', 'wheel', 'scroll'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });
    // Start initial timer
    resetIdleTimer();
  }

  // ==========================================================================
  // 5. BUBBLE WRAP POPPER
  // ==========================================================================
  function popBubble(index) {
    if (bubbleGridState[index]) return;
    bubbleGridState[index] = true;
    const pitch = 450 + Math.random() * 300;
    SoundFX.pop(pitch);
    const btn = document.getElementById(`bubble-pop-${index}`);
    if (btn) {
      btn.classList.remove('bg-purple-500/30', 'hover:bg-purple-500/50', 'border-purple-400/40');
      btn.classList.add('bg-white/5', 'border-white/10', 'scale-90', 'opacity-40');
      btn.innerHTML = '💥';
    }

    if (bubbleGridState.every(b => b === true)) {
      SoundFX.applause();
      setTimeout(resetBubbles, 1200);
    }
  }

  function resetBubbles() {
    bubbleGridState = Array(20).fill(false);
    renderHumorPanel();
  }

  // ==========================================================================
  // 6. TASK ROASTER & DECISION SPINNER
  // ==========================================================================
  function roastRandomTask() {
    SoundFX.airhorn();
    const roastBox = document.getElementById('humor-roast-output');
    if (!roastBox) return;
    const randomRoast = ROAST_TEMPLATES[Math.floor(Math.random() * ROAST_TEMPLATES.length)];
    roastBox.textContent = randomRoast;
    roastBox.classList.add('animate-bounce');
    setTimeout(() => roastBox.classList.remove('animate-bounce'), 800);
  }

  function spinDecision() {
    SoundFX.sparkle();
    const decisionBox = document.getElementById('humor-decision-output');
    if (!decisionBox) return;
    const randomDec = DECISIONS[Math.floor(Math.random() * DECISIONS.length)];
    decisionBox.textContent = randomDec;
    decisionBox.classList.add('animate-pulse');
    setTimeout(() => decisionBox.classList.remove('animate-pulse'), 1000);
  }

  function nextJoke() {
    SoundFX.rimshot();
    currentJokeIndex = (currentJokeIndex + 1) % JOKES.length;
    const joke = JOKES[currentJokeIndex];
    const qEl = document.getElementById('humor-joke-q');
    const aEl = document.getElementById('humor-joke-a');
    if (qEl && aEl) {
      qEl.textContent = joke.q;
      aEl.textContent = joke.a;
    }
  }

  let currentHumorTab = 'chaos'; // 'chaos' | 'party' | 'sounds' | 'stress'

  function switchHumorTab(tab) {
    currentHumorTab = tab;
    renderHumorPanel();
  }

  // ==========================================================================
  // 7. PANEL RENDERER (COMPACT & 100% VIEWPORT-FITTING WITHOUT SCROLLING)
  // ==========================================================================
  function renderHumorPanel() {
    const container = document.getElementById('panel-humor-lab-content');
    if (!container) return;

    const currentJoke = JOKES[currentJokeIndex];
    const idleActive = isIdleEnabled();
    const idleMin = getIdleTimeoutMinutes();
    const idleMode = getIdleMode();

    let bubblesHtml = '';
    for (let i = 0; i < 20; i++) {
      const popped = bubbleGridState[i];
      bubblesHtml += `
        <button id="bubble-pop-${i}" onclick="HumorEngine.popBubble(${i})" class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-150 cursor-pointer ${
          popped 
            ? 'bg-white/5 border border-white/10 scale-90 opacity-40' 
            : 'bg-gradient-to-br from-pink-500/40 to-purple-600/40 hover:from-pink-500/60 hover:to-purple-600/60 border border-pink-400/50 shadow-[0_0_8px_rgba(236,72,153,0.3)] active:scale-75'
        }">
          ${popped ? '💥' : '🫧'}
        </button>
      `;
    }

    // Dynamic Tab Navigation Active Classes
    const activeTabClasses = 'bg-gradient-to-r from-pink-600/45 to-fuchsia-600/45 text-white border-pink-400/70 shadow-[0_0_12px_rgba(236,72,153,0.35)] font-bold';
    const inactiveTabClasses = 'text-gray-400 hover:text-pink-200 border-transparent hover:bg-white/5 font-semibold';

    let tabContentHtml = '';

    if (currentHumorTab === 'chaos') {
      tabContentHtml = `
        <!-- TAB 1: 17 RADIKALE APP-BREAKING CHAOS FX (4-COL COMPACT GRID) -->
        <div class="space-y-1.5 animate-fade-in">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-300 font-mono px-0.5">
            <span class="flex items-center gap-1">💥 17 Radikale Glitches</span>
            <span class="text-[8.5px] text-rose-300/90 bg-rose-500/20 px-1.5 py-0.5 rounded-md border border-rose-500/30 font-mono">100% Sicher • [ESC] heilt</span>
          </div>
          <div class="grid grid-cols-4 gap-1.5">
            <button onclick="HumorEngine.toggleGravityCollapse()" class="p-1.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-bold text-amber-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Karten stürzen in die Tiefe">
              <span class="text-base group-hover:scale-110 transition-transform">🪐</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Kollaps</span>
            </button>
            <button onclick="HumorEngine.toggleEarthquake()" class="p-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold text-rose-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Erdbeben 10.0 mit tektonischen Rissen">
              <span class="text-base group-hover:scale-110 transition-transform">🌋</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Erdbeben</span>
            </button>
            <button onclick="HumorEngine.toggleMeltingUI()" class="p-1.5 rounded-xl bg-orange-600/15 hover:bg-orange-600/30 border border-orange-500/30 text-xs font-bold text-orange-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Flüssiges Schmelzen wie heißes Wachs">
              <span class="text-base group-hover:scale-110 transition-transform">🫠</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Melting</span>
            </button>
            <button onclick="HumorEngine.toggleHackerCorruption()" class="p-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold text-emerald-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Matrix Glitch: Alle Board-Texte werden zu Alien-Code">
              <span class="text-base group-hover:scale-110 transition-transform">👾</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Hacker FX</span>
            </button>
            <button onclick="HumorEngine.toggleFleeingUI()" class="p-1.5 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-bold text-cyan-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Die Buttons haben Angst und fliehen vor dem Cursor">
              <span class="text-base group-hover:scale-110 transition-transform">🧲</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Flucht</span>
            </button>
            <button onclick="HumorEngine.toggleUpsideDown()" class="p-1.5 rounded-xl bg-fuchsia-600/15 hover:bg-fuchsia-600/30 border border-fuchsia-500/30 text-xs font-bold text-fuchsia-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="180° Kopfstand der Dimension">
              <span class="text-base group-hover:scale-110 transition-transform">🙃</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Kopfstand</span>
            </button>
            <button onclick="HumorEngine.toggleCRTBreakdown()" class="p-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/30 border border-violet-500/30 text-xs font-bold text-violet-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Retro Röhrenfernseher-Zusammenbruch">
              <span class="text-base group-hover:scale-110 transition-transform">📺</span>
              <span class="text-[10px] font-bold truncate mt-0.5">CRT Röhre</span>
            </button>
            <button onclick="HumorEngine.toggleGlassShatter()" class="p-1.5 rounded-xl bg-sky-600/15 hover:bg-sky-600/30 border border-sky-500/30 text-xs font-bold text-sky-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Display-Bruch: Splitterndes Glas & Risse">
              <span class="text-base group-hover:scale-110 transition-transform">🔨</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Glasbruch</span>
            </button>
            <button onclick="HumorEngine.toggleDvdBounce()" class="p-1.5 rounded-xl bg-pink-600/15 hover:bg-pink-600/30 border border-pink-500/30 text-xs font-bold text-pink-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Legendärer DVD-Screensaver">
              <span class="text-base group-hover:scale-110 transition-transform">📀</span>
              <span class="text-[10px] font-bold truncate mt-0.5">DVD Bouncer</span>
            </button>
            <button onclick="HumorEngine.toggleVHSGlitch()" class="p-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="80s VHS Tracking-Störung">
              <span class="text-base group-hover:scale-110 transition-transform">📼</span>
              <span class="text-[10px] font-bold truncate mt-0.5">VHS Band</span>
            </button>
            <button onclick="HumorEngine.toggleNervousTwitch()" class="p-1.5 rounded-xl bg-yellow-600/15 hover:bg-yellow-600/30 border border-yellow-500/30 text-xs font-bold text-yellow-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Koffein-Schock: ADHS-Zappel-Panik">
              <span class="text-base group-hover:scale-110 transition-transform">⚡</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Hyper-Twitch</span>
            </button>
            <button onclick="HumorEngine.toggleAntiGravityFloat()" class="p-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-bold text-indigo-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Zero-G: Aufgaben schweben ins All">
              <span class="text-base group-hover:scale-110 transition-transform">🛸</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Zero-G</span>
            </button>
            <button onclick="HumorEngine.toggleBlackHoleSingularity()" class="p-1.5 rounded-xl bg-slate-600/20 hover:bg-slate-600/35 border border-slate-500/40 text-xs font-bold text-slate-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Schwarzes Loch Singularität">
              <span class="text-base group-hover:scale-110 transition-transform">🕳️</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Black Hole</span>
            </button>
            <button onclick="HumorEngine.toggleTornadoSpins()" class="p-1.5 rounded-xl bg-teal-600/15 hover:bg-teal-600/30 border border-teal-500/30 text-xs font-bold text-teal-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Kategorie-5 Aufgaben-Wirbelsturm">
              <span class="text-base group-hover:scale-110 transition-transform">🌪️</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Tornado</span>
            </button>
            <button onclick="HumorEngine.toggleFakeRansomware()" class="p-1.5 rounded-xl bg-red-700/20 hover:bg-red-700/35 border border-red-500/40 text-xs font-bold text-red-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="Geiselnahme (Lösegeld: 1 Kaffee)">
              <span class="text-base group-hover:scale-110 transition-transform">☠️</span>
              <span class="text-[10px] font-bold truncate mt-0.5">Lösegeld</span>
            </button>
            <button onclick="HumorEngine.togglePixelate()" class="p-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold text-emerald-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs group" title="8-Bit GameBoy Pixel Mosaik">
              <span class="text-base group-hover:scale-110 transition-transform">👾</span>
              <span class="text-[10px] font-bold truncate mt-0.5">8-Bit Pixel</span>
            </button>
            <button onclick="HumorEngine.toggleTimeWarp()" class="col-span-4 p-1.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-bold text-amber-200 hover:text-white transition flex items-center justify-center gap-2 text-center cursor-pointer active:scale-95 shadow-xs group" title="Rückwärts-Zeitreise: Aufgaben werden ungeschehen">
              <span class="text-base group-hover:scale-110 transition-transform">⏳</span>
              <span class="text-[10.5px] font-bold">Time-Warp Rückwärts-Zeitreise</span>
              <span class="text-[9px] text-amber-300/70 font-mono">(Tasks spulen zurück)</span>
            </button>
          </div>
        </div>
      `;
    } else if (currentHumorTab === 'party') {
      tabContentHtml = `
        <!-- TAB 2: PARTY ACTION & AMBIENT SCREENSAVERS (2 x 3-COL GRIDS) -->
        <div class="space-y-2.5 animate-fade-in">
          <!-- Visuelle Live Action FX -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-pink-300 font-mono px-0.5">
              <span>⚡ Live Action & Party FX</span>
              <span class="text-[9px] text-gray-400">Interaktiv</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5">
              <button onclick="HumorEngine.toggleGravity()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🪐</span>
                <span class="truncate mt-0.5 text-[10.5px]">Gravity Drop</span>
              </button>
              <button onclick="HumorEngine.toggleJello()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🍮</span>
                <span class="truncate mt-0.5 text-[10.5px]">Jello Wobble</span>
              </button>
              <button onclick="HumorEngine.toggleMatrix()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-emerald-300 hover:text-emerald-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🕶️</span>
                <span class="truncate mt-0.5 text-[10.5px]">Matrix Rain</span>
              </button>
              <button onclick="HumorEngine.toggleVortex()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-indigo-300 hover:text-indigo-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🌀</span>
                <span class="truncate mt-0.5 text-[10.5px]">Vortex Swirl</span>
              </button>
              <button onclick="HumorEngine.toggleLaser()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-cyan-300 hover:text-cyan-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">⚡</span>
                <span class="truncate mt-0.5 text-[10.5px]">Laser DJ</span>
              </button>
              <button onclick="HumorEngine.toggleConfetti()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-amber-300 hover:text-amber-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🎊</span>
                <span class="truncate mt-0.5 text-[10.5px]">Party Blast</span>
              </button>
            </div>
          </div>

          <!-- Ambient & Screensaver FX -->
          <div class="space-y-1 pt-1 border-t border-white/5">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-purple-300 font-mono px-0.5">
              <span>🌌 Ambient Flow & Screensaver</span>
              <span class="text-[9px] text-gray-400">Ästhetik & Ruhe</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5">
              <button onclick="HumorEngine.toggleHyperspace()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-violet-300 hover:text-violet-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🌌</span>
                <span class="truncate mt-0.5 text-[10.5px]">Hyperspace</span>
              </button>
              <button onclick="HumorEngine.toggleBubbles()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-pink-300 hover:text-pink-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🫧</span>
                <span class="truncate mt-0.5 text-[10.5px]">Bubbles</span>
              </button>
              <button onclick="HumorEngine.toggleFireflies()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-yellow-300 hover:text-yellow-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🔥</span>
                <span class="truncate mt-0.5 text-[10.5px]">Fireflies</span>
              </button>
              <button onclick="HumorEngine.toggleSynthwave()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-rose-300 hover:text-rose-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">🌊</span>
                <span class="truncate mt-0.5 text-[10.5px]">Synthwave</span>
              </button>
              <button onclick="HumorEngine.toggleSnow()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-sky-300 hover:text-sky-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">❄️</span>
                <span class="truncate mt-0.5 text-[10.5px]">Winter Snow</span>
              </button>
              <button onclick="HumorEngine.toggleArcade()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-emerald-300 hover:text-emerald-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-xs">
                <span class="text-base">👾</span>
                <span class="truncate mt-0.5 text-[10.5px]">Arcade Pixel</span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (currentHumorTab === 'sounds') {
      tabContentHtml = `
        <!-- TAB 3: SYNTHESIZER SOUNDBOARD & WITZE -->
        <div class="space-y-2.5 animate-fade-in">
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-pink-300 font-mono px-0.5">
              <span>🔊 12 Soundboard FX (Web Audio)</span>
              <span class="text-[9px] text-gray-400">100% autark</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              <button onclick="HumorEngine.playSound('airhorn')" class="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>📯</span>
                <span class="truncate">Airhorn</span>
              </button>
              <button onclick="HumorEngine.playSound('applause')" class="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>👏</span>
                <span class="truncate">Applaus</span>
              </button>
              <button onclick="HumorEngine.playSound('rimshot')" class="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-purple-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>🥁</span>
                <span class="truncate">Badum</span>
              </button>
              <button onclick="HumorEngine.playSound('fail')" class="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>🎺</span>
                <span class="truncate">Fail</span>
              </button>
              <button onclick="HumorEngine.playSound('laser')" class="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>⚡</span>
                <span class="truncate">Laser</span>
              </button>
              <button onclick="HumorEngine.playSound('coin')" class="p-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/35 border border-yellow-500/40 text-yellow-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>🪙</span>
                <span class="truncate">Coin</span>
              </button>
              <button onclick="HumorEngine.playSound('boing')" class="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/40 text-blue-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>🦘</span>
                <span class="truncate">Boing</span>
              </button>
              <button onclick="HumorEngine.playSound('sparkle')" class="p-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-500/40 text-pink-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>✨</span>
                <span class="truncate">Level Up</span>
              </button>
              <button onclick="HumorEngine.playSound('buzz')" class="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-600/40 text-rose-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>🚨</span>
                <span class="truncate">Buzz</span>
              </button>
              <button onclick="HumorEngine.playSound('thud')" class="p-1.5 rounded-xl bg-amber-700/20 hover:bg-amber-700/35 border border-amber-700/40 text-amber-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>💥</span>
                <span class="truncate">Thud</span>
              </button>
              <button onclick="HumorEngine.playSound('glitch')" class="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-600/40 text-emerald-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>👾</span>
                <span class="truncate">Glitch</span>
              </button>
              <button onclick="HumorEngine.playSound('reboot')" class="p-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-500/40 text-sky-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <span>🔄</span>
                <span class="truncate">Reboot</span>
              </button>
            </div>
          </div>

          <!-- Joke Box Footer -->
          <div class="p-2.5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-1 flex items-center justify-between gap-2 shadow-xs">
            <div class="min-w-0 flex-1">
              <div id="humor-joke-q" class="text-xs font-bold text-white truncate">${currentJoke.q}</div>
              <div id="humor-joke-a" class="text-[11px] text-pink-300/90 truncate">${currentJoke.a}</div>
            </div>
            <button onclick="HumorEngine.nextJoke()" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold shrink-0 transition cursor-pointer">
              Nächster Witz 😂
            </button>
          </div>
        </div>
      `;
    } else if (currentHumorTab === 'stress') {
      tabContentHtml = `
        <!-- TAB 4: ANTI-STRESS (BUBBLE POPPER, IMPULS & SCREENSAVER SETTINGS) -->
        <div class="space-y-2.5 animate-fade-in">
          <!-- Screensaver Inactivity Banner & Config -->
          <div class="p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/30 space-y-1.5 shadow-xs">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-base">🌌</span>
                <div>
                  <div class="text-[11px] font-bold text-purple-200">Screensaver bei Inaktivität</div>
                  <div class="text-[8.5px] text-gray-400 font-mono">Endet lautlos bei Mausbewegung oder [ESC]</div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="HumorEngine.startIdleFX()" class="px-2 py-0.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-[9.5px] font-bold border border-purple-400/40 transition cursor-pointer" title="Jetzt Screensaver testen">
                  ✨ Testen
                </button>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" onchange="HumorEngine.toggleIdleSetting(this.checked)" ${idleActive ? 'checked' : ''} class="sr-only peer">
                  <div class="w-7 h-3.5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-white after:rounded-full after:h-2.5 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between gap-1 flex-wrap pt-0.5 border-t border-white/5 text-[9px]">
              <div class="flex items-center gap-1">
                <span class="text-gray-400 font-mono">Ruhezeit:</span>
                <button onclick="HumorEngine.setIdleTimeoutMinutes(2)" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMin === 2 ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}">2m</button>
                <button onclick="HumorEngine.setIdleTimeoutMinutes(3)" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMin === 3 ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}">3m</button>
                <button onclick="HumorEngine.setIdleTimeoutMinutes(5)" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMin === 5 ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}">5m</button>
                <button onclick="HumorEngine.setIdleTimeoutMinutes(10)" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMin === 10 ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}">10m</button>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-gray-400 font-mono">Modus:</span>
                <button onclick="HumorEngine.setIdleMode('mixed')" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMode === 'mixed' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300'}">🎲 Mix</button>
                <button onclick="HumorEngine.setIdleMode('radical')" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMode === 'radical' ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-300'}">💥 Glitch</button>
                <button onclick="HumorEngine.setIdleMode('ambient')" class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${idleMode === 'ambient' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}">🌌 Sanft</button>
              </div>
            </div>
          </div>

          <!-- Bubble Wrap Popper & Decision Spinner -->
          <div class="grid grid-cols-2 gap-2">
            <!-- Bubble Wrap Popper -->
            <div class="p-2 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[9.5px] font-bold text-pink-300 uppercase tracking-wider font-mono">🫧 Luftpolsterfolie</span>
                <button onclick="HumorEngine.resetBubbles()" class="text-[8.5px] text-pink-300 hover:text-pink-100 font-bold underline cursor-pointer">Neu</button>
              </div>
              <div class="flex flex-wrap gap-1 items-center justify-center max-h-[52px] overflow-hidden">
                ${bubblesHtml}
              </div>
            </div>

            <!-- Impuls & Würfel -->
            <div class="p-2 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-[9.5px] font-bold text-purple-300 uppercase tracking-wider font-mono">🎯 Impuls & Würfel</span>
                <button onclick="HumorEngine.spinDecision()" class="px-1.5 py-0.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 text-[9.5px] font-bold transition cursor-pointer">
                  Würfeln 🎲
                </button>
              </div>
              <div id="humor-decision-output" class="p-1 rounded-xl bg-black/40 border border-purple-500/20 text-[10.5px] text-purple-200 font-medium min-h-[38px] flex items-center justify-center text-center">
                Klicke auf Würfeln für einen Impuls!
              </div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- TOP HEADER -->
      <div class="flex items-center justify-between border-b border-white/10 pb-2">
        <div class="relative flex flex-col items-center justify-center shrink-0">
          <div class="relative overflow-hidden flex items-center justify-center">
            <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
          </div>
          <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
            <span class="badge-tool-subtext select-none">HUMOR</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="HumorEngine.panicReset()" class="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer" title="Notfall-Reset: Alle Effekte sofort beenden">
            🛡️ Panic Reset [ESC]
          </button>
          <button onclick="togglePanel('humor-lab')" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
        </div>
      </div>

      <!-- 4-TAB SUB-NAVIGATION BAR (ZERO-SCROLL VIEWPORT FITTING) -->
      <div class="flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 text-xs gap-1 shadow-sm select-none">
        <button onclick="HumorEngine.switchTab('chaos')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentHumorTab === 'chaos' ? activeTabClasses : inactiveTabClasses}" title="17 Radikale App-Breaking Glitches">
          <span>💥 Glitches</span>
          <span class="text-[8.5px] opacity-80 font-mono">17</span>
        </button>
        <button onclick="HumorEngine.switchTab('party')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentHumorTab === 'party' ? activeTabClasses : inactiveTabClasses}" title="Live Action & Ambient FX">
          <span>⚡ Action & FX</span>
          <span class="text-[8.5px] opacity-80 font-mono">12</span>
        </button>
        <button onclick="HumorEngine.switchTab('sounds')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentHumorTab === 'sounds' ? activeTabClasses : inactiveTabClasses}" title="Soundboard & Witze">
          <span>🔊 Sound & Witz</span>
        </button>
        <button onclick="HumorEngine.switchTab('stress')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentHumorTab === 'stress' ? activeTabClasses : inactiveTabClasses}" title="Luftpolsterfolie, Würfel & Screensaver">
          <span>🫧 Stress & Idle</span>
        </button>
      </div>

      <!-- ACTIVE TAB CONTENT -->
      ${tabContentHtml}
    `;

    if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  const HumorEngine = {
    playSound: function(type) {
      if (SoundFX[type]) SoundFX[type]();
    },
    popBubble,
    resetBubbles,
    roastTask: roastRandomTask,
    spinDecision,
    nextJoke,
    toggleGravity,
    toggleJello,
    toggleMatrix,
    toggleVortex,
    toggleLaser,
    toggleConfetti,
    toggleHyperspace,
    toggleBubbles,
    toggleFireflies,
    toggleSynthwave,
    toggleSnow,
    toggleArcade,
    // Radical App-Breaking Effects
    toggleGravityCollapse,
    toggleEarthquake,
    toggleMeltingUI,
    toggleHackerCorruption,
    toggleFleeingUI,
    toggleUpsideDown,
    toggleCRTBreakdown,
    toggleGlassShatter,
    toggleDvdBounce,
    toggleVHSGlitch,
    toggleNervousTwitch,
    toggleAntiGravityFloat,
    toggleBlackHoleSingularity,
    toggleTornadoSpins,
    toggleFakeRansomware,
    togglePixelate,
    toggleTimeWarp,
    // Screensaver & Idle Configuration
    getIdleTimeoutMinutes,
    setIdleTimeoutMinutes,
    getIdleMode,
    setIdleMode,
    startIdleFX,
    toggleIdleSetting,
    panicReset,
    switchTab: switchHumorTab,
    getTab: () => currentHumorTab,
    renderHumorPanel
  };

  if (typeof window !== 'undefined') {
    window.HumorEngine = HumorEngine;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HumorEngine = HumorEngine;
  }
})();
