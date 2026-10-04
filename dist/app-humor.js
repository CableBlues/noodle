// app-humor.js - Noodle Humor Lab, Chaos FX Studio & 1-Minute Idle Ambient Engine
// 100% Client-Side, Web Audio Synthesizer, 12+ Visual FX & Auto-Idle Screensaver

(function() {
  'use strict';

  let audioCtx = null;
  let activeEffects = new Set();
  let bubbleGridState = Array(20).fill(false);
  let currentJokeIndex = 0;

  // Active FX animations and canvas cleanup handles
  let activeFxCleanup = null;
  let activeFxAnimId = null;

  // 1-Minute Idle Auto-Trigger Engine
  let idleTimer = null;
  let isIdleActive = false;
  const IDLE_TIMEOUT_MS = 60 * 1000; // 1 Minute (60 Sekunden)

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
      @keyframes humor-vortex {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(0.92) rotate(4deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      .chaos-vortex-active main {
        animation: humor-vortex 1.8s ease-in-out infinite;
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

    document.querySelectorAll('.noodle-fx-canvas-overlay, #humor-fx-canvas').forEach(el => el.remove());
    document.body.classList.remove('chaos-jello', 'chaos-matrix-active', 'chaos-vortex-active');

    const existingStyle = document.getElementById('humor-chaos-styles');
    if (existingStyle) existingStyle.remove();

    document.querySelectorAll('.task-card, .glass-card, header, main, main article').forEach(el => {
      el.style.transform = '';
      el.style.transition = '';
      el.style.animation = '';
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
  // 4. 1-MINUTE IDLE AUTO-SCREENSAVER ENGINE
  // ==========================================================================
  const IDLE_FX_POOL = [
    toggleHyperspace,
    toggleBubbles,
    toggleFireflies,
    toggleSynthwave,
    toggleSnow,
    toggleMatrix,
    toggleArcade
  ];

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

    // Zufälligen Effekt auswählen - rein visuell, absolut lautlos und ohne Nachrichten
    const randomFx = IDLE_FX_POOL[Math.floor(Math.random() * IDLE_FX_POOL.length)];
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
      idleTimer = setTimeout(startIdleFX, IDLE_TIMEOUT_MS);
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

  // ==========================================================================
  // 7. PANEL RENDERER
  // ==========================================================================
  function renderHumorPanel() {
    const container = document.getElementById('panel-humor-lab-content');
    if (!container) return;

    const currentJoke = JOKES[currentJokeIndex];
    const idleActive = isIdleEnabled();

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

    container.innerHTML = `
      <!-- TOP HEADER -->
      <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-md">
            <span>😄</span>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-display leading-tight">Fun & Chaos Studio</h3>
            <span class="text-[10px] text-gray-400 font-mono">12+ Live FX • 1-Min Screensaver • Soundboard</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="HumorEngine.panicReset()" class="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer" title="Notfall-Reset: Alle Effekte sofort beenden">
            🛡️ Panic Reset [ESC]
          </button>
          <button onclick="togglePanel('humor-lab')" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
        </div>
      </div>

      <!-- 1. AMBIENT SCREENSAVER BANNER -->
      <div class="p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/30 flex items-center justify-between gap-2 shadow-sm">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-lg">🌌</span>
          <div>
            <div class="text-xs font-bold text-purple-200">Inaktivitäts-Ambient FX</div>
            <div class="text-[9px] text-gray-400 font-mono">Startet nach 1 Minute Ruhe, endet lautlos bei Bewegung</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="HumorEngine.startIdleFX()" class="px-2.5 py-1 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-[10px] font-bold border border-purple-400/40 transition cursor-pointer" title="Jetzt ausprobieren">
            ✨ Testen
          </button>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" onchange="HumorEngine.toggleIdleSetting(this.checked)" ${idleActive ? 'checked' : ''} class="sr-only peer">
            <div class="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>
      </div>

      <!-- 2. CHAOS & LIVE ACTION FX -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-pink-300 font-mono px-0.5">
          <span>⚡ Chaos & Action FX</span>
          <span class="text-[9px] text-gray-400">Interaktiv</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button onclick="HumorEngine.toggleGravity()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Schwerkraft-Drop & Bounce">
            <span class="text-base">🪐</span>
            <span class="truncate mt-0.5">Gravity Drop</span>
          </button>
          <button onclick="HumorEngine.toggleJello()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 hover:text-white transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Wobble Jello Wellen">
            <span class="text-base">🍮</span>
            <span class="truncate mt-0.5">Jello Wobble</span>
          </button>
          <button onclick="HumorEngine.toggleMatrix()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-emerald-300 hover:text-emerald-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Cyberpunk Code Regen">
            <span class="text-base">🕶️</span>
            <span class="truncate mt-0.5">Matrix Rain</span>
          </button>
          <button onclick="HumorEngine.toggleVortex()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-indigo-300 hover:text-indigo-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Schwarzes Loch Wirbel">
            <span class="text-base">🌀</span>
            <span class="truncate mt-0.5">Vortex Swirl</span>
          </button>
          <button onclick="HumorEngine.toggleLaser()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-cyan-300 hover:text-cyan-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Neon DJ Laser Scanner">
            <span class="text-base">⚡</span>
            <span class="truncate mt-0.5">Laser DJ</span>
          </button>
          <button onclick="HumorEngine.toggleConfetti()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-amber-300 hover:text-amber-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Konfetti Party Explosion">
            <span class="text-base">🎊</span>
            <span class="truncate mt-0.5">Party Blast</span>
          </button>
        </div>
      </div>

      <!-- 3. AMBIENT & IDLE FLOW SCREENSAVERS -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-purple-300 font-mono px-0.5">
          <span>🌌 Ambient & Screensaver FX</span>
          <span class="text-[9px] text-gray-400">Ruhe & Ästhetik</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button onclick="HumorEngine.toggleHyperspace()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-violet-300 hover:text-violet-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="3D Hyperspace Sternenflug">
            <span class="text-base">🌌</span>
            <span class="truncate mt-0.5">Hyperspace</span>
          </button>
          <button onclick="HumorEngine.toggleBubbles()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-pink-300 hover:text-pink-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Schwebende Seifenblasen">
            <span class="text-base">🫧</span>
            <span class="truncate mt-0.5">Bubbles</span>
          </button>
          <button onclick="HumorEngine.toggleFireflies()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-yellow-300 hover:text-yellow-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Glühende Glühwürmchen">
            <span class="text-base">🔥</span>
            <span class="truncate mt-0.5">Fireflies</span>
          </button>
          <button onclick="HumorEngine.toggleSynthwave()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-rose-300 hover:text-rose-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="80s Retro Synthwave Gitter">
            <span class="text-base">🌊</span>
            <span class="truncate mt-0.5">Synthwave</span>
          </button>
          <button onclick="HumorEngine.toggleSnow()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-sky-300 hover:text-sky-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Sanfter Schneefall">
            <span class="text-base">❄️</span>
            <span class="truncate mt-0.5">Winter Snow</span>
          </button>
          <button onclick="HumorEngine.toggleArcade()" class="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-emerald-300 hover:text-emerald-100 transition flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-sm" title="Retro 8-Bit Pixel Items">
            <span class="text-base">👾</span>
            <span class="truncate mt-0.5">Arcade Pixel</span>
          </button>
        </div>
      </div>

      <!-- 4. SOUNDBOARD BUTTONS -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-pink-300 font-mono px-0.5">
          <span>🔊 Synthesizer Soundboard</span>
        </div>
        <div class="grid grid-cols-4 gap-1.5">
          <button onclick="HumorEngine.playSound('airhorn')" class="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>📯</span>
            <span class="truncate">Airhorn</span>
          </button>
          <button onclick="HumorEngine.playSound('applause')" class="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>👏</span>
            <span class="truncate">Applaus</span>
          </button>
          <button onclick="HumorEngine.playSound('rimshot')" class="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-purple-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>🥁</span>
            <span class="truncate">Badum</span>
          </button>
          <button onclick="HumorEngine.playSound('fail')" class="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>🎺</span>
            <span class="truncate">Fail</span>
          </button>
          <button onclick="HumorEngine.playSound('laser')" class="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>⚡</span>
            <span class="truncate">Laser</span>
          </button>
          <button onclick="HumorEngine.playSound('coin')" class="p-1.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/35 border border-yellow-500/40 text-yellow-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>🪙</span>
            <span class="truncate">Coin</span>
          </button>
          <button onclick="HumorEngine.playSound('boing')" class="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/40 text-blue-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>🦘</span>
            <span class="truncate">Boing</span>
          </button>
          <button onclick="HumorEngine.playSound('sparkle')" class="p-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-500/40 text-pink-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm">
            <span>✨</span>
            <span class="truncate">Level Up</span>
          </button>
        </div>
      </div>

      <!-- 5. BUBBLE WRAP POPPER & DECISION SPINNER -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Bubble Wrap Popper -->
        <div class="p-2.5 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-pink-300 uppercase tracking-wider font-mono">🫧 Luftpolsterfolie</span>
            <button onclick="HumorEngine.resetBubbles()" class="text-[9px] text-pink-300 hover:text-pink-100 font-bold underline cursor-pointer">Neu</button>
          </div>
          <div class="flex flex-wrap gap-1 items-center justify-center max-h-[64px] overflow-hidden">
            ${bubblesHtml}
          </div>
        </div>

        <!-- Task Roaster / Decision -->
        <div class="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">🎯 Impuls & Würfel</span>
            <button onclick="HumorEngine.spinDecision()" class="px-2 py-0.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 text-[10px] font-bold transition cursor-pointer">
              Würfeln 🎲
            </button>
          </div>
          <div id="humor-decision-output" class="p-1.5 rounded-xl bg-black/40 border border-purple-500/20 text-[11px] text-purple-200 font-medium min-h-[34px] flex items-center justify-center text-center">
            Klicke auf Würfeln für einen Impuls!
          </div>
        </div>
      </div>

      <!-- 6. JOKE BOX FOOTER -->
      <div class="p-2.5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-1 flex items-center justify-between gap-2">
        <div class="min-w-0 flex-1">
          <div id="humor-joke-q" class="text-xs font-bold text-white truncate">${currentJoke.q}</div>
          <div id="humor-joke-a" class="text-[11px] text-pink-300/90 truncate">${currentJoke.a}</div>
        </div>
        <button onclick="HumorEngine.nextJoke()" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold shrink-0 transition cursor-pointer">
          Nächster Witz 😂
        </button>
      </div>
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
    startIdleFX,
    toggleIdleSetting,
    panicReset,
    renderHumorPanel
  };

  if (typeof window !== 'undefined') {
    window.HumorEngine = HumorEngine;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HumorEngine = HumorEngine;
  }
})();
