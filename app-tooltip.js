// app-tooltip.js: Ultraschnelle, ästhetische & farblich abgestimmte Hovertexte (Tooltips)
// ==========================================================================

(function() {
  'use strict';

  let tooltipEl = null;
  let showTimer = null;
  let hideTimer = null;
  let warmTimer = null;
  let isWarm = false;
  let currentTarget = null;

  const DELAY_SHOW = 90; // Schnelle Reaktionszeit in ms (statt Browser 1500ms)
  const WARM_TIMEOUT = 450; // Schneller Wechsel zwischen Buttons ohne Verzögerung

  function getOrCreateTooltip() {
    if (tooltipEl && document.body.contains(tooltipEl)) return tooltipEl;
    
    tooltipEl = document.getElementById('noodle-global-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'noodle-global-tooltip';
      tooltipEl.className = 'noodle-custom-tooltip';
      tooltipEl.setAttribute('role', 'tooltip');
      tooltipEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
  }

  function formatTooltipContent(text) {
    if (!text) return '';
    
    // HTML-Escaping zur Sicherheit
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Tastenkürzel wie [T], [Ctrl+Z], [S], (Ctrl+Z) in elegante Mini-Kbd-Badges umwandeln
    safe = safe.replace(/\[([A-Z0-9\+\-\s]{1,10})\]/g, '<kbd class="noodle-tooltip-kbd">$1</kbd>');
    safe = safe.replace(/\((Ctrl\+[A-Za-z0-9]|Strg\+[A-Za-z0-9]|Alt\+[A-Za-z0-9]|Shift\+[A-Za-z0-9]|Cmd\+[A-Za-z0-9])\)/gi, '<kbd class="noodle-tooltip-kbd">$1</kbd>');

    // Optionaler Bullet / Info-Trenner
    safe = safe.replace(/(\s[•·]\s)/g, '<span class="noodle-tooltip-bullet">$1</span>');

    return safe;
  }

  function positionTooltip(target, el) {
    if (!target || !el) return;

    const rect = target.getBoundingClientRect();
    const tooltipRect = el.getBoundingClientRect();
    const margin = 8;
    const gap = 6;

    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - gap;
    let placement = 'top';

    // Oben kein Platz? Dann unter dem Element platzieren
    if (top < margin) {
      top = rect.bottom + gap;
      placement = 'bottom';
      if (top + tooltipRect.height > window.innerHeight - margin) {
        top = Math.max(margin, Math.min(window.innerHeight - tooltipRect.height - margin, rect.top));
      }
    }

    // Links/Rechts im sichtbaren Fenster begrenzen
    left = Math.max(margin, Math.min(window.innerWidth - tooltipRect.width - margin, left));

    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
    el.setAttribute('data-placement', placement);
  }

  function showTooltip(target) {
    if (!target) return;
    const tooltip = getOrCreateTooltip();
    const text = target.getAttribute('data-noodle-tooltip') || target.getAttribute('data-tooltip') || target.getAttribute('data-title');
    if (!text || !text.trim()) return;

    tooltip.innerHTML = formatTooltipContent(text.trim());
    tooltip.classList.remove('noodle-tooltip-visible');
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';

    // Position berechnen
    positionTooltip(target, tooltip);

    // Sichtbar machen mit sanfter Animation
    tooltip.style.visibility = 'visible';
    requestAnimationFrame(() => {
      tooltip.classList.add('noodle-tooltip-visible');
      tooltip.setAttribute('aria-hidden', 'false');
    });

    isWarm = true;
    if (warmTimer) clearTimeout(warmTimer);
  }

  function hideTooltip(immediate = false) {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }

    if (warmTimer) clearTimeout(warmTimer);
    warmTimer = setTimeout(() => {
      isWarm = false;
    }, WARM_TIMEOUT);

    if (tooltipEl) {
      tooltipEl.classList.remove('noodle-tooltip-visible');
      tooltipEl.setAttribute('aria-hidden', 'true');
      if (immediate) {
        tooltipEl.style.display = 'none';
      } else {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (!tooltipEl.classList.contains('noodle-tooltip-visible')) {
            tooltipEl.style.display = 'none';
          }
        }, 120);
      }
    }
    currentTarget = null;
  }

  function findTooltipTarget(el) {
    let curr = el;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (curr.hasAttribute('title') && curr.getAttribute('title').trim()) {
        const titleText = curr.getAttribute('title').trim();
        curr.setAttribute('data-noodle-tooltip', titleText);
        curr.removeAttribute('title'); // Verhindert den Standard-Browser-Tooltip
        return curr;
      }
      if (curr.hasAttribute('data-noodle-tooltip') && curr.getAttribute('data-noodle-tooltip').trim()) {
        return curr;
      }
      if (curr.hasAttribute('data-tooltip') && curr.getAttribute('data-tooltip').trim()) {
        return curr;
      }
      if (curr.hasAttribute('data-title') && curr.getAttribute('data-title').trim()) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  // Globales Event-Delegation für alle aktuellen und künftigen UI-Elemente
  document.addEventListener('pointerover', function(e) {
    if (e.pointerType === 'touch') return;

    const target = findTooltipTarget(e.target);
    if (!target) {
      hideTooltip();
      return;
    }

    if (target === currentTarget) return;
    currentTarget = target;

    if (showTimer) clearTimeout(showTimer);

    const delay = isWarm ? 20 : DELAY_SHOW;
    showTimer = setTimeout(() => {
      showTooltip(target);
    }, delay);
  }, { passive: true });

  document.addEventListener('pointerout', function(e) {
    if (!currentTarget) return;
    const related = e.relatedTarget;
    if (related && (currentTarget === related || currentTarget.contains(related))) {
      return;
    }
    hideTooltip();
  }, { passive: true });

  document.addEventListener('pointerdown', () => hideTooltip(true), { passive: true });
  document.addEventListener('scroll', () => hideTooltip(true), { passive: true, capture: true });
  window.addEventListener('blur', () => hideTooltip(true));

  document.addEventListener('focusin', function(e) {
    const target = findTooltipTarget(e.target);
    if (target) {
      currentTarget = target;
      showTooltip(target);
    }
  }, { passive: true });

  document.addEventListener('focusout', function() {
    hideTooltip();
  }, { passive: true });

  if (typeof window !== 'undefined') {
    window.NoodleTooltip = {
      show: showTooltip,
      hide: hideTooltip,
      refresh() {
        if (currentTarget) positionTooltip(currentTarget, tooltipEl);
      }
    };
  }
})();
