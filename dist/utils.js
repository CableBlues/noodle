// XSS-Schutz: Sichere HTML-Maskierung & URL-Sanitization für Benutzereingaben
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;');
}

function sanitizeUrl(url, fallback = '#') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (/[\x00-\x1f\x7f]/.test(trimmed)) return fallback;
  if (/^(javascript|vbscript|data(?!:image\/(?:png|jpeg|jpg|gif|svg\+xml|webp);base64,)):/i.test(trimmed)) {
    return fallback;
  }
  if (/^(https?:\/\/|mailto:|tel:|\/|\.\/|#|data:image\/(?:png|jpeg|jpg|gif|svg\+xml|webp);base64,)/i.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.sanitizeUrl = sanitizeUrl;
}
if (typeof globalThis !== 'undefined') {
  globalThis.escapeHtml = escapeHtml;
  globalThis.sanitizeUrl = sanitizeUrl;
}

// Zentraler Panel-Manager (für Dropdowns & Werkzeug-Panels)
const PanelManager = {
  panels: ['feedback', 'report', 'settings', 'soundscape', 'language', 'boost', 'music', 'theme', 'calendar-dropdown', 'inspiration', 'shopping', 'cooking', 'alarm', 'weather', 'news', 'pause-dropdown', 'collab-chat'],
  open(name) {
    this.panels.forEach(p => {
      const el = document.getElementById(`panel-${p}`);
      if (el) {
        if (p === name) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
    window.currentlyOpenPanel = name;
  },
  close(name) {
    const el = document.getElementById(`panel-${name}`);
    if (el) el.classList.add('hidden');
    if (window.currentlyOpenPanel === name) window.currentlyOpenPanel = null;
  },
  closeAll() {
    this.panels.forEach(p => {
      const el = document.getElementById(`panel-${p}`);
      if (el) el.classList.add('hidden');
    });
    window.currentlyOpenPanel = null;
  },
  toggle(name) {
    const el = document.getElementById(`panel-${name}`);
    if (!el) return;
    if (el.classList.contains('hidden')) this.open(name);
    else this.close(name);
  }
};
window.PanelManager = PanelManager;

// Zentraler Modal-Manager (für Dialoge & Overlays)
const ModalManager = {
  modals: ['brainstorm-modal', 'helper-whatnow-modal', 'helper-sport-modal', 'clarity-modal', 'feierabend-modal', 'mobile-menu-drawer', 'mobile-tools-sheet', 'app-confirm-modal'],
  open(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  },
  closeAll() {
    this.modals.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }
};
window.ModalManager = ModalManager;

// Wiederverwendbarer Bestätigungsdialog (Ersatz für natives confirm())
function showConfirmDialog(options = {}) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      return resolve(true);
    }

    let title = '';
    let message = '';
    let confirmText = (typeof tr === 'function' ? tr({ de: 'Bestätigen', en: 'Confirm', fr: 'Confirmer', it: 'Conferma', es: 'Confirmar', el: 'Επιβεβαίωση' }) : 'Bestätigen');
    let cancelText = (typeof tr === 'function' ? tr({ de: 'Abbrechen', en: 'Cancel', fr: 'Annuler', it: 'Annulla', es: 'Cancelar', el: 'Άκυρο' }) : 'Abbrechen');
    let isDanger = true;
    let icon = 'alert-triangle';

    if (typeof options === 'string') {
      message = options;
      title = (typeof tr === 'function' ? tr({ de: 'Bist du sicher?', en: 'Are you sure?', fr: 'Êtes-vous sûr ?', it: 'Sei sicuro?', es: '¿Estás seguro?', el: 'Είσαι σίγουρος;' }) : 'Bist du sicher?');
    } else if (typeof options === 'object' && options !== null) {
      message = options.message || options.text || '';
      title = options.title || (typeof tr === 'function' ? tr({ de: 'Bist du sicher?', en: 'Are you sure?', fr: 'Êtes-vous sûr ?', it: 'Sei sicuro?', es: '¿Estás seguro?', el: 'Είσαι σίγουρος;' }) : 'Bist du sicher?');
      if (options.confirmText) confirmText = options.confirmText;
      if (options.cancelText) cancelText = options.cancelText;
      if (options.isDanger !== undefined) isDanger = options.isDanger;
      if (options.icon) icon = options.icon;
    }

    let modal = document.getElementById('app-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'app-confirm-modal';
      document.body.appendChild(modal);
    }

    modal.className = 'fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
    modal.innerHTML = `
      <div class="mobile-modal-card animate-spring-modal w-full max-w-sm bg-[#111116]/98 border border-white/15 p-5 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-2xl text-white relative text-center flex flex-col items-center gap-4">
        <div class="w-12 h-12 rounded-2xl ${isDanger ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400' : 'bg-purple-500/20 border border-purple-500/40 text-purple-300'} flex items-center justify-center shrink-0">
          <i data-lucide="${icon}" class="w-6 h-6"></i>
        </div>
        <div class="space-y-1.5 w-full">
          <h3 class="text-base font-bold font-display text-white leading-snug">${escapeHtml(title)}</h3>
          <p class="text-xs text-gray-300 leading-relaxed max-h-36 overflow-y-auto px-1">${escapeHtml(message)}</p>
        </div>
        <div class="grid grid-cols-2 gap-2.5 w-full pt-2">
          <button type="button" id="confirm-modal-cancel-btn" aria-label="${escapeHtml(cancelText)}" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition cursor-pointer">
            ${escapeHtml(cancelText)}
          </button>
          <button type="button" id="confirm-modal-ok-btn" aria-label="${escapeHtml(confirmText)}" class="px-4 py-2.5 rounded-xl ${isDanger ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40' : 'bg-[var(--accent)] hover:brightness-110 text-white shadow-lg shadow-purple-900/40'} active:scale-95 text-xs font-bold transition cursor-pointer">
            ${escapeHtml(confirmText)}
          </button>
        </div>
      </div>
    `;

    if (typeof doRenderLucideIcons === 'function') {
      doRenderLucideIcons();
    } else if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons(); } catch (e) {}
    }

    let settled = false;
    const cleanup = (result) => {
      if (settled) return;
      settled = true;
      modal.classList.add('hidden');
      document.removeEventListener('keydown', keyHandler);
      resolve(result);
    };

    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        cleanup(false);
      } else if (e.key === 'Enter') {
        cleanup(true);
      }
    };

    document.addEventListener('keydown', keyHandler);

    const cancelBtn = modal.querySelector('#confirm-modal-cancel-btn');
    const okBtn = modal.querySelector('#confirm-modal-ok-btn');

    if (cancelBtn) cancelBtn.onclick = () => cleanup(false);
    if (okBtn) okBtn.onclick = () => cleanup(true);
    modal.onclick = (e) => {
      if (e.target === modal) cleanup(false);
    };

    modal.classList.remove('hidden');
    if (okBtn) okBtn.focus();
  });
}
window.showConfirmDialog = showConfirmDialog;
window.confirmModal = showConfirmDialog;


// Globaler Escape-Key Handler
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      PanelManager.closeAll();
      ModalManager.closeAll();
    }
  });
}

const _lucideSvgCache = new Map();

function getLucideSvg(name, classNames = '', extraAttrs = '') {
  if (!name) return '';
  const cacheKey = `${name}:::${classNames}:::${extraAttrs}`;
  if (_lucideSvgCache.has(cacheKey)) return _lucideSvgCache.get(cacheKey);

  if (typeof lucide !== 'undefined' && lucide.icons && lucide.icons[name]) {
    try {
      const svg = lucide.icons[name].toSvg({ class: classNames });
      if (extraAttrs) {
        const modified = svg.replace('<svg ', `<svg ${extraAttrs} `);
        _lucideSvgCache.set(cacheKey, modified);
        return modified;
      }
      _lucideSvgCache.set(cacheKey, svg);
      return svg;
    } catch (e) {}
  }
  return `<i data-lucide="${name}" class="${classNames}" ${extraAttrs}></i>`;
}

let lucideBatchScheduled = false;
const pendingLucideRoots = new Set();

function doRenderLucideIcons(root = null) {
  const targetRoot = (root && root.querySelectorAll) ? root : (typeof document !== 'undefined' ? document : null);
  if (!targetRoot) return;

  if (typeof lucide === 'undefined' || !lucide.createIcons) {
    if (typeof window !== 'undefined') {
      [50, 150, 350].forEach(delay => {
        setTimeout(() => {
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            try {
              if (targetRoot !== document) {
                const nodes = targetRoot.querySelectorAll('[data-lucide]');
                if (nodes.length > 0) lucide.createIcons({ root: targetRoot });
              } else {
                lucide.createIcons();
              }
            } catch(e) {}
          }
        }, delay);
      });
    }
    return;
  }
  try {
    const iconNodes = targetRoot.querySelectorAll('[data-lucide]');
    if (iconNodes.length === 0) return; // Sofortiger Return ohne teure DOM-Arbeit
    
    let needsFullLucide = false;
    iconNodes.forEach(node => {
      const name = node.getAttribute('data-lucide');
      if (!name) return;
      if (typeof lucide !== 'undefined' && lucide.icons && lucide.icons[name]) {
        try {
          const svgStr = getLucideSvg(name, node.className || '');
          if (svgStr && svgStr.startsWith('<svg')) {
            node.outerHTML = svgStr;
            return;
          }
        } catch(err) {}
      }
      needsFullLucide = true;
    });

    if (needsFullLucide) {
      if (targetRoot !== document) {
        lucide.createIcons({ root: targetRoot });
      } else {
        lucide.createIcons();
      }
    }
  } catch (e) {
    console.warn('[Lucide] Batch createIcons notice:', e);
  }
}

function renderLucideIcons(immediate = false, root = null) {
  if (root) pendingLucideRoots.add(root);
  if (immediate) {
    if (pendingLucideRoots.size > 0) {
      pendingLucideRoots.forEach(r => doRenderLucideIcons(r));
      pendingLucideRoots.clear();
    } else {
      doRenderLucideIcons(root || (typeof document !== 'undefined' ? document : null));
    }
    return;
  }
  if (lucideBatchScheduled) return;
  lucideBatchScheduled = true;
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      lucideBatchScheduled = false;
      if (pendingLucideRoots.size > 0) {
        pendingLucideRoots.forEach(r => doRenderLucideIcons(r));
        pendingLucideRoots.clear();
      } else {
        doRenderLucideIcons(document);
      }
    });
  } else {
    setTimeout(() => {
      lucideBatchScheduled = false;
      if (pendingLucideRoots.size > 0) {
        pendingLucideRoots.forEach(r => doRenderLucideIcons(r));
        pendingLucideRoots.clear();
      } else {
        doRenderLucideIcons(document);
      }
    }, 0);
  }
}
window.renderLucideIcons = renderLucideIcons;
window.getLucideSvg = getLucideSvg;
if (typeof globalThis !== 'undefined') {
  globalThis.renderLucideIcons = renderLucideIcons;
  globalThis.getLucideSvg = getLucideSvg;
}

// Shuffler-Pools zur vollständigen Absicherung gegen Wiederholungen
let praisePool = [];
let soundPool = [];
let animationPool = [];

// Abgestuftes Lob-System (Skaliert mit dem Fortschritt des Tages)
// Merkt sich den zuletzt gezeigten Lob-Spruch, damit er nicht sofort wiederholt wird
let lastPraiseMsg = null;

function getNextFromPool(poolArray, limit) {
  if (poolArray.length === 0) {
    for (let i = 0; i < limit; i++) poolArray.push(i);
    for (let i = poolArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolArray[i], poolArray[j]] = [poolArray[j], poolArray[i]];
    }
  }
  return poolArray.pop();
}

let _toastHideTimer = null;
function showToast(msg, options = {}) {
  const overlay = document.getElementById('toast-overlay');
  const card = document.getElementById('toast-card');
  if (!card || !overlay) return;
  
  clearTimeout(_toastHideTimer);
  
  if (options && options.undo) {
    const undoText = (typeof tr === 'function') 
      ? tr({ de: 'Rückgängig ↩️', en: 'Undo ↩️', fr: 'Annuler ↩️', it: 'Annulla ↩️', es: 'Deshacer ↩️', el: 'Αναίρεση ↩️' })
      : 'Rückgängig ↩️';
    const safeMsg = escapeHtml(msg);
    const safeUndo = escapeHtml(undoText);
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span>${safeMsg}</span>
        <button id="toast-undo-btn" class="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 border border-white/25 shadow-sm shrink-0">
          <span>${safeUndo}</span>
        </button>
      </div>
    `;
    const undoBtn = card.querySelector('#toast-undo-btn');
    if (undoBtn) {
      undoBtn.onclick = (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
        if (typeof undoLastAction === 'function') undoLastAction();
        else if (typeof handleUndo === 'function') handleUndo();
      };
    }
    overlay.classList.remove('hidden');
    _toastHideTimer = setTimeout(() => overlay.classList.add('hidden'), options.duration || 5000);
  } else {
    card.innerText = msg;
    overlay.classList.remove('hidden');
    _toastHideTimer = setTimeout(() => overlay.classList.add('hidden'), options.duration || 2200);
  }
}
if (typeof window !== 'undefined') window.showToast = showToast;
if (typeof globalThis !== 'undefined') globalThis.showToast = showToast;

// Integrierte performante Canvas-Celebration-Engine mit 5 wechselnden Partikel-Effekten
let celebrationParticleIndex = 0;

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function triggerCelebrationParticles(customX, customY) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const effectType = celebrationParticleIndex % 5;
  celebrationParticleIndex++;

  const startX = (typeof customX === 'number' && customX > 0) ? customX : canvas.width / 2;
  const startY = (typeof customY === 'number' && customY > 0) ? customY : (effectType === 3 ? canvas.height * 0.85 : canvas.height * 0.45);

  const particles = [];
  const particleCount = effectType === 3 ? 45 : 85; // Ballons etwas weniger, sonst zu voll

  const colorPalettes = {
    0: ['#8b5cf6', '#38bdf8', '#10b981', '#ec4899', '#f59e0b', '#fb7185', '#facc15'], // Konfetti
    1: ['#f472b6', '#fbcfe8', '#fb7185', '#fda4af', '#f43f5e', '#fff1f2', '#e879f9'], // Sakura-Blüten
    2: ['#facc15', '#fde047', '#fef08a', '#fbbf24', '#f59e0b', '#ffffff', '#e2e8f0'], // Goldene Sterne
    3: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'], // Bunte Ballons
    4: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#67e8f9', '#a7f3d0', '#fde047']  // Schillernde Seifenblasen
  };
  const colors = colorPalettes[effectType];

  for (let i = 0; i < particleCount; i++) {
    let vx = (Math.random() - 0.5) * (effectType === 3 ? 10 : 22);
    let vy = effectType === 3 
      ? -(Math.random() * 8 + 6) // Ballons steigen nach oben
      : ((Math.random() - 0.5) * 20 - 10);

    particles.push({
      x: startX + (Math.random() - 0.5) * 60,
      y: startY + (Math.random() - 0.5) * 40,
      vx: vx,
      vy: vy,
      gravity: effectType === 3 ? -0.06 : (effectType === 1 ? 0.22 : 0.42),
      friction: effectType === 3 ? 0.99 : 0.975,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: effectType === 3 ? Math.random() * 12 + 14 : (effectType === 1 ? Math.random() * 8 + 6 : Math.random() * 8 + 4),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * (effectType === 3 ? 2 : 10),
      opacity: 1,
      sway: Math.random() * 10,
      swaySpeed: Math.random() * 0.08 + 0.03
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      if (p.opacity > 0 && p.y > -80 && p.y < canvas.height + 80) {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * (effectType === 1 ? 1.5 : 0.6);
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.opacity -= (effectType === 3 ? 0.007 : 0.011);
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (effectType === 0) {
          // 1. Konfetti (Rechteckig)
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (effectType === 1) {
          // 2. Sakura-Blütenblatt (Geschwungene Blüte)
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.8, p.size * 0.5, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
          ctx.fill();
        } else if (effectType === 2) {
          // 3. Sterne (Gold/Funkeln)
          ctx.fillStyle = p.color;
          drawStar(ctx, 0, 0, 5, p.size, p.size * 0.5);
        } else if (effectType === 3) {
          // 4. Bunte Mini-Ballons
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.75, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          // Schnur
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, p.size);
          ctx.lineTo(Math.sin(p.sway) * 4, p.size + 14);
          ctx.stroke();
        } else if (effectType === 4) {
          // 5. Schillernde Seifenblasen
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Lichtglanz
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath();
          ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        active = true;
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

// ===== NOODLE MODERN CALM & LUXURY ANIMATION ENGINE =====
let _lastNoodleAnim = '';
let _noodleIsAnimating = false;

// 4 hochwertige, abwechselnde Logo-Animationsmodi (Langsam, edel & abwechslungsreich)
const NOODLE_LOGO_MODES = [
  { id: 'anim-mode-aurora', name: 'Cosmic Aurora Flow', desc: 'Sanftes Nordlicht & Eisblau-Violett Schwebe-Aura' },
  { id: 'anim-mode-prism', name: 'Prismatic Diamond Sheen', desc: 'Kristall-Reflexion, Champagnergold & 3D-Prisma' },
  { id: 'anim-mode-velvet', name: 'Living Clay Velvet', desc: 'Organische Knete-Welle, Sunset-Peach & Kamin-Glow' },
  { id: 'anim-mode-studio', name: 'HiFi Studio Desk Pulse', desc: 'Cyber-Emerald, Laser-Lichtstrahl & Studio-Mastering' }
];
let _currentLogoModeIdx = 0;
let _logoCycleTimer = null;

function setLogoAnimationMode(modeIndexOrName) {
  if (typeof document === 'undefined') return;
  const container = document.querySelector('.flow-logo-container');
  if (!container) return;

  let nextIdx = 0;
  if (typeof modeIndexOrName === 'number') {
    nextIdx = (modeIndexOrName + NOODLE_LOGO_MODES.length) % NOODLE_LOGO_MODES.length;
  } else if (typeof modeIndexOrName === 'string') {
    const found = NOODLE_LOGO_MODES.findIndex(m => m.id === modeIndexOrName || m.id.includes(modeIndexOrName));
    nextIdx = found >= 0 ? found : 0;
  }
  _currentLogoModeIdx = nextIdx;
  
  // Alle vorherigen Modus-Klassen entfernen
  NOODLE_LOGO_MODES.forEach(m => container.classList.remove(m.id));
  
  // Neuen Modus setzen
  const targetMode = NOODLE_LOGO_MODES[_currentLogoModeIdx];
  container.classList.add(targetMode.id);
  container.setAttribute('data-logo-mode', targetMode.id);
  container.setAttribute('title', 'Onboarding & Feedback');
  container.setAttribute('data-noodle-tooltip', 'Onboarding & Feedback');

  // Tab-Favicon synchron mitbewegen
  if (typeof animateFavicon === 'function') {
    animateFavicon('breathe');
  }
}
window.setLogoAnimationMode = setLogoAnimationMode;

function cycleNextLogoMode(event) {
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
    const container = document.querySelector('.flow-logo-container');
    if (container) {
      container.classList.add('scale-95');
      setTimeout(() => container.classList.remove('scale-95'), 180);
    }
  }
  setLogoAnimationMode(_currentLogoModeIdx + 1);
}
window.cycleNextLogoMode = cycleNextLogoMode;

function animateNoodleLogo(type = 'random') {
  if (typeof document === 'undefined') return;
  const logo = document.getElementById('header-noodle-logo');
  const container = document.querySelector('.flow-logo-container');
  if (!logo) return;

  // Modus-Wechsel bei speziellem Aufruf oder Favicon-Trigger
  if (type === 'next' || type === 'cycle') {
    cycleNextLogoMode();
    return;
  }
  
  // Bei direktem Typen ggf. Modus wechseln
  if (type === 'aurora') setLogoAnimationMode(0);
  else if (type === 'shimmer' || type === 'prism') setLogoAnimationMode(1);
  else if (type === 'breathe' || type === 'velvet') setLogoAnimationMode(2);
  else if (type === 'float' || type === 'studio') setLogoAnimationMode(3);

  const allAnimClasses = [
    'noodle-anim-float',
    'noodle-anim-breathe',
    'noodle-anim-shimmer',
    'noodle-anim-aurora',
    'noodle-anim-celebrate',
    'noodle-anim-wobble',
    'noodle-anim-spin',
    'noodle-anim-dance',
    'noodle-anim-wave',
    'noodle-anim-bounce',
    'noodle-anim-sway',
    'noodle-anim-flip3d'
  ];
  
  allAnimClasses.forEach(cls => logo.classList.remove(cls));
  
  const availableMoves = ['float', 'breathe', 'shimmer', 'aurora'];
  let chosenMove = type;
  
  if (!chosenMove || chosenMove === 'random') {
    const filtered = availableMoves.filter(m => m !== _lastNoodleAnim);
    chosenMove = filtered[Math.floor(Math.random() * filtered.length)] || 'float';
  }
  
  _lastNoodleAnim = chosenMove;
  _noodleIsAnimating = true;
  
  const classMap = {
    float: 'noodle-anim-float',
    breathe: 'noodle-anim-breathe',
    shimmer: 'noodle-anim-shimmer',
    aurora: 'noodle-anim-aurora',
    celebrate: 'noodle-anim-celebrate',
    wobble: 'noodle-anim-breathe',
    dance: 'noodle-anim-breathe',
    sway: 'noodle-anim-breathe',
    spin: 'noodle-anim-shimmer',
    flip3d: 'noodle-anim-shimmer',
    wave: 'noodle-anim-float',
    bounce: 'noodle-anim-float'
  };
  
  const targetClass = classMap[chosenMove] || 'noodle-anim-float';
  
  void logo.offsetWidth;
  logo.classList.add(targetClass);
  
  setTimeout(() => {
    logo.classList.remove(targetClass);
    _noodleIsAnimating = false;
  }, 3000);

  // Tab-Favicon synchron sanft animieren
  if (typeof animateFavicon === 'function') {
    animateFavicon('breathe');
  }
}
window.animateNoodleLogo = animateNoodleLogo;

// ===== DYNAMIC TAB FAVICON ANIMATOR =====
let _faviconCanvas = null;
let _faviconCtx = null;
let _faviconLink = null;
let _isFaviconAnimating = false;

let _noodleLogoImg = null;
function getCachedNoodleLogoImg() {
  if (!_noodleLogoImg && typeof Image !== 'undefined') {
    _noodleLogoImg = new Image();
    _noodleLogoImg.src = 'favicon.png';
  }
  return _noodleLogoImg;
}

function drawClayNoodleFavicon(ctx, offsetY = 0, scale = 1, rotation = 0) {
  ctx.clearRect(0, 0, 32, 32);
  ctx.save();
  ctx.translate(16, 16 + offsetY);
  if (rotation) ctx.rotate(rotation);
  if (scale !== 1) ctx.scale(scale, scale);
  ctx.translate(-16, -16);
  
  // Draw official 3D clay 'n' glyph image
  const img = getCachedNoodleLogoImg();
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, 32, 32);
  }
  
  ctx.restore();
}

function animateFavicon(move = 'bounce') {
  if (typeof document === 'undefined') return;
  if (!_faviconLink) _faviconLink = document.querySelector("link[rel*='icon']");
  if (!_faviconCanvas) {
    _faviconCanvas = document.createElement('canvas');
    _faviconCanvas.width = 32;
    if (_faviconCanvas && typeof _faviconCanvas.getContext === 'function') {
      _faviconCtx = _faviconCanvas.getContext('2d');
    }
  }
  if (!_faviconCtx || _isFaviconAnimating) return;
  _isFaviconAnimating = true;

  let frame = 0;
  const totalFrames = 10;
  const interval = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    let offsetY = 0;
    let scale = 1;
    let rot = 0;

    if (move === 'bounce') {
      offsetY = -Math.sin(progress * Math.PI) * 3;
      scale = 1 + Math.sin(progress * Math.PI) * 0.12;
    } else if (move === 'spin') {
      rot = progress * Math.PI * 2;
    } else {
      offsetY = Math.sin(progress * Math.PI * 2) * 2;
    }

    drawClayNoodleFavicon(_faviconCtx, offsetY, scale, rot);
    if (_faviconLink) {
      try {
        _faviconLink.href = _faviconCanvas.toDataURL('image/png');
      } catch (e) {
        // Tainted canvas on file:/// scheme is ignored safely
      }
    }

    if (frame >= totalFrames) {
      clearInterval(interval);
      _isFaviconAnimating = false;
      drawClayNoodleFavicon(_faviconCtx, 0, 1, 0);
      if (_faviconLink) {
        try {
          _faviconLink.href = _faviconCanvas.toDataURL('image/png');
        } catch (e) {
          // Tainted canvas on file:/// scheme is ignored safely
        }
      }
    }
  }, 45);
}
window.animateFavicon = animateFavicon;

function initNoodlePlayfulEngine() {
  if (typeof window === 'undefined' || window._noodlePlayfulEngineInitialized) return;
  window._noodlePlayfulEngineInitialized = true;

  // Initialer Modus 0 (Cosmic Aurora Flow)
  setLogoAnimationMode(0);

  // Kontinuierlicher, langsamer & eleganter Modus-Wechsel alle 14 Sekunden
  function scheduleNextModeCycle() {
    if (_logoCycleTimer) clearTimeout(_logoCycleTimer);
    const delay = 14000;
    _logoCycleTimer = setTimeout(() => {
      if (!document.hidden && !_noodleIsAnimating) {
        cycleNextLogoMode();
      }
      scheduleNextModeCycle();
    }, delay);
  }

  scheduleNextModeCycle();

  // Hover-Effekt: startet einen sanften, edlen Shimmer
  const container = document.querySelector('.flow-logo-container');
  if (container) {
    container.addEventListener('mouseenter', () => {
      if (!_noodleIsAnimating) {
        animateNoodleLogo('shimmer');
      }
    });
  }
}
window.initNoodlePlayfulEngine = initNoodlePlayfulEngine;

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNoodlePlayfulEngine);
  } else {
    initNoodlePlayfulEngine();
  }
}

function triggerConfetti(x, y) {
  triggerCelebrationParticles(x, y);
  try {
    animateNoodleLogo('celebrate');
  } catch(e) {}
}
window.triggerCelebrationParticles = triggerCelebrationParticles;
window.triggerConfetti = triggerConfetti;


function showPraise() {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const todayISO = new Date().toISOString().split('T')[0];
  
  // Zähle die heute erledigten Aufgaben
  const completedToday = (state.done || []).filter(item => item.date === todayISO).length;
  
  // Bestimme die passende Stufe des Lobes
  let activeTier = 'tier1';
  if (completedToday >= 9) {
    activeTier = 'tier4';
  } else if (completedToday >= 5) {
    activeTier = 'tier3';
  } else if (completedToday >= 2) {
    activeTier = 'tier2';
  }
  
  const list = (TIERED_PRAISES[lang] || TIERED_PRAISES['de'])[activeTier];
  
  // Hole einen zufälligen Spruch aus der gewählten Stufe, ohne den zuletzt gezeigten sofort zu wiederholen
  let praiseIdx = Math.floor(Math.random() * list.length);
  if (list.length > 1) {
    while (list[praiseIdx] === lastPraiseMsg) {
      praiseIdx = Math.floor(Math.random() * list.length);
    }
  }
  const msg = list[praiseIdx];
  lastPraiseMsg = msg;

  const overlay = document.getElementById('praise-overlay');
  const card = document.getElementById('praise-card');
  if (card && overlay) {
    card.innerText = msg; overlay.classList.remove('hidden');
    card.style.animation = 'scaleBounce 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    
    // VERBESSERUNG: Bleibt nun 5000ms statt 2800ms auf dem Bildschirm
    setTimeout(() => overlay.classList.add('hidden'), 5000); 
  }

  if (typeof speakWithProfile === 'function') {
    const randomProfileIdx = Math.floor(Math.random() * 12);
    speakWithProfile(msg, randomProfileIdx);
  }
}

// Haptisches Feedback für Touch- & Mobilgeräte
function triggerHapticFeedback(type = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    if (type === 'light') {
      navigator.vibrate(8);
    } else if (type === 'medium') {
      navigator.vibrate(15);
    } else if (type === 'success') {
      navigator.vibrate([10, 30, 15]);
    } else if (type === 'warning') {
      navigator.vibrate([20, 40, 20]);
    } else if (Array.isArray(type) || typeof type === 'number') {
      navigator.vibrate(type);
    }
  } catch (e) {}
}
window.triggerHapticFeedback = triggerHapticFeedback;

function triggerPraise() {
  triggerHapticFeedback('success');
  const soundPool = getStoragePool('flow_sound_pool', 12);
  const animationPool = getStoragePool('flow_animation_pool', 10);

  const soundIdx = getNextFromPool(soundPool, 12);
  playProceduralSound(soundIdx);

  const animIdx = getNextFromPool(animationPool, 10);
  triggerPraiseAnimation(animIdx);
}

let lastProceduralSoundIndex = -1;

// Erzeugt 12 mathematisch unterschiedliche Belohnungsklänge über die Web Audio API (wechselt zufällig)
function playProceduralSound(idx = null) {
  try {
    initAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const ctx = audioCtx;

    // Wenn kein Index übergeben oder 'random', wechsle zufällig ohne direkte Wiederholung
    if (idx === null || idx === undefined || idx === 'random') {
      do {
        idx = Math.floor(Math.random() * 12);
      } while (idx === lastProceduralSoundIndex && 12 > 1);
    }
    lastProceduralSoundIndex = idx;

    const playNode = (freq, type, duration, delay = 0, vol = 0.08) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(vol, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      
      osc.connect(gainNode);
      const dest = typeof getMasterAudioDestination === 'function' ? getMasterAudioDestination() : ctx.destination;
      if (dest) gainNode.connect(dest);
      
      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
      if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
    };

    switch (idx) {
      case 0: // 1. Ascending Major Arpeggio (C4 -> E4 -> G4 -> C5)
        playNode(261.63, 'sine', 0.6, 0);
        playNode(329.63, 'sine', 0.6, 0.07);
        playNode(392.00, 'sine', 0.6, 0.14);
        playNode(523.25, 'sine', 1.0, 0.21, 0.1);
        break;
      case 1: // 2. Kristallklare Resonanzglocke
        playNode(880, 'sine', 1.6, 0, 0.12);
        playNode(1320, 'sine', 0.9, 0.02, 0.04);
        break;
      case 2: // 3. Fanfare (Dreiklang-Swell)
        playNode(329.63, 'triangle', 1.2, 0, 0.06); 
        playNode(392.00, 'triangle', 1.2, 0, 0.06); 
        playNode(523.25, 'triangle', 1.2, 0, 0.06); 
        break;
      case 3: // 4. Bubbly Liquid POPs
        playNode(550, 'sine', 0.12, 0);
        playNode(780, 'sine', 0.10, 0.05);
        playNode(1050, 'sine', 0.08, 0.10);
        break;
      case 4: // 5. Cosmic Shimmer Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.7);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.7);
        filter.Q.setValueAtTime(6, now);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      case 5: // 6. Jazz Major 7th Warm Swell
        playNode(196.00, 'sine', 1.8, 0, 0.1); 
        playNode(246.94, 'sine', 1.8, 0.04, 0.08); 
        playNode(293.66, 'sine', 1.8, 0.08, 0.06); 
        playNode(370.00, 'sine', 1.8, 0.12, 0.05); 
        break;
      case 6: // 7. Retro 8-bit Coin Up
        playNode(523.25, 'square', 0.08, 0, 0.04);
        playNode(1046.50, 'square', 0.35, 0.06, 0.04);
        break;
      case 7: // 8. Zen Wind Chimes
        playNode(1150, 'sine', 1.5, 0, 0.05);
        playNode(1350, 'sine', 1.3, 0.15, 0.04);
        playNode(1550, 'sine', 1.1, 0.3, 0.04);
        break;
      case 8: // 9. Bass Thump & Echo
        playNode(65.41, 'sine', 0.5, 0, 0.22); 
        playNode(130.81, 'sine', 0.8, 0.10, 0.08); 
        break;
      case 9: // 10. Harfen-Glissando (Fairy Harp)
        const harpScale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
        harpScale.forEach((f, i) => {
          playNode(f, 'sine', 0.5, i * 0.04, 0.05);
        });
        break;
      case 10: // 11. Spring Jump Bounce (Boing-Modulator)
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(140, now);
        bOsc.frequency.linearRampToValueAtTime(420, now + 0.28);
        bOsc.frequency.linearRampToValueAtTime(95, now + 0.55);
        
        bGain.gain.setValueAtTime(0.1, now);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.6);
        break;
      case 11: // 12. Tribal Woodblock Sequence
        playNode(440, 'triangle', 0.06, 0, 0.12);
        playNode(554, 'triangle', 0.06, 0.07, 0.10);
        playNode(659, 'triangle', 0.06, 0.14, 0.08);
        playNode(880, 'triangle', 0.10, 0.21, 0.12);
        break;
    }
  } catch (e) {
    console.error("Fehler beim prozeduralen Sound:", e);
  }
}


// Interaktiver Logo-Klick-Effekt mit Wellen-Ausbreitung und Sound
function triggerLogoReloadFlow(element) {
  if (!element) {
    location.reload();
    return;
  }
  
  // 1. Visuelle Klick-Animation auf dem Logo auslösen
  element.classList.add('logo-clicked-flow');
  try { animateNoodleLogo('spin'); } catch(e) {}

  // 2. Bubbly Liquid Sound abspielen
  try {
    playProceduralSound(3);
  } catch (e) {}

  // 3. Vollbild-Wellen-Ripple erzeugen
  const ripple = document.createElement('div');
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  ripple.style.position = 'fixed';
  ripple.style.left = `${x - 50}px`;
  ripple.style.top = `${y - 50}px`;
  ripple.style.width = '100px';
  ripple.style.height = '100px';
  ripple.style.borderRadius = '50%';
  ripple.style.pointerEvents = 'none';
  ripple.style.zIndex = '999999';
  ripple.style.background = 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(20,184,166,0.2) 50%, rgba(16,185,129,0) 80%)';
  ripple.style.transform = 'scale(0)';
  ripple.style.transition = 'transform 0.75s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.75s ease-out';
  ripple.style.opacity = '1';

  document.body.appendChild(ripple);

  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(45)';
    ripple.style.opacity = '0';
  });

  // 4. Nach Abschluss der Animation Seite neu laden
  setTimeout(() => {
    location.reload();
  }, 680);
}


// ==========================================
// INTERAKTIVES PAUSEN- & TIMER-MODAL SYSTEM
// ==========================================

const BREAK_CONFIGS = {
  breath: {
    title: 'Atemtakt-Übung 🧘‍♀️',
    subtitle: '4-4-4 Atmen zur Tiefenentspannung',
    desc: 'Atme 4 Sekunden tief ein, halte 4 Sekunden inne, und atme 4 Sekunden sanft aus. Finde deine innere Ruhe.',
    duration: 120,
    icon: 'wind'
  },
  box: {
    title: 'Box-Breathing (Atembox) 📦',
    subtitle: 'Strukturierte Vierfach-Atmung',
    desc: 'Bewährte Methode von Profis und Astronauten: Einatmen, Halten, Ausatmen, Halten – jeweils im 4-Sekunden-Takt.',
    duration: 180,
    icon: 'box'
  },
  anchor: {
    title: 'Erdungs-Anker ⚓',
    subtitle: '5-4-3-2-1 Achtsamkeits-Übung',
    desc: 'Nimm bewusst deine Umgebung wahr: 5 Dinge sehen, 4 spüren, 3 hören, 2 riechen, 1 schmecken.',
    duration: 180,
    icon: 'anchor'
  },
  eyes: {
    title: 'Augen-Entspannung (Palming) 👀',
    subtitle: 'Wärme für gestresste Bildschirm-Augen',
    desc: 'Reibe deine Hände aneinander, bis sie warm sind, und lege sie sanft und ohne Druck auf deine geschlossenen Augen.',
    duration: 60,
    icon: 'eye'
  },
  stretch: {
    title: 'Schneller Ganzkörper-Stretch 🧘',
    subtitle: 'Muskeln lockern & Energie tanken',
    desc: 'Strecke die Arme weit nach oben, kreise die Schultern und bewege deinen Nacken ganz behutsam von Seite zu Seite.',
    duration: 60,
    icon: 'dumbbell'
  },
  squeeze: {
    title: 'Nacken- & Schulter-Squeeze 🏋️',
    subtitle: 'Anspannen & bewusst loslassen',
    desc: 'Ziehe deine Schultern für 5 Sekunden fest zu den Ohren hoch – und lass sie beim Ausatmen schlagartig und schwer sinken.',
    duration: 60,
    icon: 'shield'
  },
  tea: {
    title: '5-Minuten Teepause ☕',
    subtitle: 'Bewusste Genuss-Auszeit',
    desc: 'Hole dir ein Glas Wasser oder Tee. Schlürfe langsam und spüre ganz bewusst die Wärme und den Geschmack.',
    duration: 300,
    icon: 'coffee'
  },
  nature: {
    title: 'Wald-Auszeit (Vogelstimmen) 🐦',
    subtitle: 'Akustischer Rückzug ins Grün',
    desc: 'Schließe die Augen, lausche den inneren Naturklängen und stelle dir vor, du sitzt auf einer ruhigen Lichtung im Wald.',
    duration: 180,
    icon: 'trees'
  },
  nap: {
    title: 'Power Nap (20 Min) 😴',
    subtitle: 'Kurzschlaf zur Regeneration',
    desc: 'Schließe die Augen, entspanne deinen Körper und gleite für 20 Minuten in einen erholsamen Kurzschlaf.',
    duration: 1200,
    icon: 'bed'
  }
};

let currentBreakId = null;
let breakTotalSecs = 120;
let breakRemainingSecs = 120;
let breakTimerInterval = null;
let isBreakRunning = false;

function triggerPowerNap() {
  openBreakModal('nap');
}

function openBreakModal(breakId) {
  const config = BREAK_CONFIGS[breakId] || BREAK_CONFIGS.breath;
  currentBreakId = breakId;
  breakTotalSecs = config.duration;
  breakRemainingSecs = config.duration;
  isBreakRunning = false;
  if (breakTimerInterval) clearInterval(breakTimerInterval);

  const titleEl = document.getElementById('break-modal-title');
  const subEl = document.getElementById('break-modal-subtitle');
  const descEl = document.getElementById('break-modal-desc');
  
  if (titleEl) titleEl.innerText = config.title;
  if (subEl) subEl.innerText = config.subtitle;
  if (descEl) descEl.innerText = config.desc;
  
  const iconEl = document.getElementById('break-modal-lucide');
  if (iconEl) {
    iconEl.setAttribute('data-lucide', config.icon);
    renderLucideIcons();
  }

  updateBreakTimerDisplay();

  const modal = document.getElementById('helper-break-modal');
  if (modal) modal.classList.remove('hidden');

  const panel = document.getElementById('panel-pause-dropdown');
  if (panel) panel.classList.add('hidden');
}

function closeBreakModal() {
  if (breakTimerInterval) clearInterval(breakTimerInterval);
  breakTimerInterval = null;
  isBreakRunning = false;
  breakTargetEndTime = null;
  const modal = document.getElementById('helper-break-modal');
  if (modal) modal.classList.add('hidden');
}

let breakTargetEndTime = null;

function toggleBreakTimer() {
  const toggleBtn = document.getElementById('break-toggle-btn');
  
  if (isBreakRunning) {
    if (breakTimerInterval) clearInterval(breakTimerInterval);
    breakTimerInterval = null;
    isBreakRunning = false;
    breakTargetEndTime = null;
    if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> <span id="break-toggle-label">Fortsetzen</span>';
  } else {
    isBreakRunning = true;
    breakTargetEndTime = Date.now() + (breakRemainingSecs * 1000);
    if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="pause" class="w-4 h-4"></i> <span id="break-toggle-label">Pause</span>';
    
    if (breakTimerInterval) clearInterval(breakTimerInterval);
    breakTimerInterval = setInterval(() => {
      if (breakTargetEndTime) {
        breakRemainingSecs = Math.max(0, Math.round((breakTargetEndTime - Date.now()) / 1000));
        updateBreakTimerDisplay();
      }
      if (breakRemainingSecs <= 0) {
        if (breakTimerInterval) clearInterval(breakTimerInterval);
        breakTimerInterval = null;
        isBreakRunning = false;
        breakTargetEndTime = null;
        finishBreakSuccessfully();
      }
    }, 1000);
  }
  renderLucideIcons();
  updateBreakTimerDisplay();
}

function resetBreakTimer() {
  if (breakTimerInterval) clearInterval(breakTimerInterval);
  breakTimerInterval = null;
  isBreakRunning = false;
  breakTargetEndTime = null;
  const config = BREAK_CONFIGS[currentBreakId] || BREAK_CONFIGS.breath;
  breakRemainingSecs = config.duration;
  updateBreakTimerDisplay();
  const toggleBtn = document.getElementById('break-toggle-btn');
  if (toggleBtn) toggleBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> <span id="break-toggle-label">Pause starten</span>';
  renderLucideIcons();
}

function finishBreakEarly() {
  if (breakTimerInterval) clearInterval(breakTimerInterval);
  isBreakRunning = false;
  finishBreakSuccessfully();
}

function finishBreakSuccessfully() {
  if (typeof playProceduralSound === 'function') {
    try { playProceduralSound(0); } catch(e){}
  }
  if (typeof triggerConfetti === 'function') {
    try { triggerConfetti(); } catch(e){}
  }
  if (typeof showToast === 'function') {
    showToast(tr({
      de: 'Wunderbare Pause abgeschlossen! Du hast neue Energie getankt. 🌿✨',
      en: 'Wonderful break completed! You recharged your energy. 🌿✨',
      es: '¡Pausa maravillosa completada! Has recargado energía. 🌿✨'
    }));
  }
  closeBreakModal();
}

function updateBreakTimerDisplay() {
  const mins = Math.floor(breakRemainingSecs / 60);
  const secs = breakRemainingSecs % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  const timerEl = document.getElementById('break-timer-display');
  if (timerEl) timerEl.innerText = display;

  const pct = ((breakTotalSecs - breakRemainingSecs) / breakTotalSecs) * 100;
  const barEl = document.getElementById('break-progress-bar');
  if (barEl) barEl.style.width = `${pct}%`;

  const statusEl = document.getElementById('break-status-text');
  if (statusEl) {
    if (breakRemainingSecs === breakTotalSecs) {
      statusEl.innerText = 'Bereit';
    } else if (isBreakRunning) {
      statusEl.innerText = 'Atmen & Entspannen... 🧘';
    } else {
      statusEl.innerText = 'Pausiert';
    }
  }
}




/* --- NATIVE MOBILE DRAWER & TOOLS SHEET HANDLERS --- */
function openMobileMenuDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (drawer) {
    drawer.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function closeMobileMenuDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  if (drawer) drawer.classList.add('hidden');
}

function openMobileToolsSheet() {
  const sheet = document.getElementById('mobile-tools-sheet');
  if (sheet) {
    sheet.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function closeMobileToolsSheet() {
  const sheet = document.getElementById('mobile-tools-sheet');
  if (sheet) sheet.classList.add('hidden');
}

function openPrivacyModal() {
  const modal = document.getElementById('privacy-legal-modal');
  if (modal) {
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function closePrivacyModal() {
  const modal = document.getElementById('privacy-legal-modal');
  if (modal) modal.classList.add('hidden');
}

if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.PanelManager = PanelManager;
  window.ModalManager = ModalManager;
  window.openPrivacyModal = openPrivacyModal;
  window.closePrivacyModal = closePrivacyModal;
}
if (typeof globalThis !== 'undefined') {
  globalThis.escapeHtml = escapeHtml;
  globalThis.PanelManager = PanelManager;
  globalThis.ModalManager = ModalManager;
  globalThis.openPrivacyModal = openPrivacyModal;
  globalThis.closePrivacyModal = closePrivacyModal;
}


