// app-tooltip.js: Ultraschnelle, ästhetische & farblich abgestimmte Hovertexte (Tooltips)
// ==========================================================================

(function() {
  'use strict';

  let tooltipEl = null;
  let showTimer = null;
  let hideTimer = null;
  let currentTarget = null;

  // Eingebetteter Style für ultraschnelle, flackerfreie & ästhetische Darstellung
  function ensureTooltipStyles() {
    if (document.getElementById('noodle-tooltip-base-styles')) return;
    const style = document.createElement('style');
    style.id = 'noodle-tooltip-base-styles';
    style.textContent = `
      .noodle-custom-tooltip {
        position: fixed !important;
        z-index: 9999999 !important;
        pointer-events: none !important;
        user-select: none !important;
        max-width: 320px;
        background: rgba(13, 13, 22, 0.96) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 14px rgba(139, 92, 246, 0.25) !important;
        backdrop-filter: blur(16px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
        border-radius: 9px !important;
        padding: 4.5px 8.5px !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        color: #f3f4f6 !important;
        white-space: nowrap !important;
        line-height: 1.35 !important;
        opacity: 0;
        transform: scale(0.96) translateY(2px);
        transition: opacity 0.07s cubic-bezier(0.16, 1, 0.3, 1), transform 0.07s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: transform, opacity;
      }
      .noodle-custom-tooltip.noodle-tooltip-visible {
        opacity: 1 !important;
        transform: scale(1) translateY(0) !important;
      }
      .noodle-tooltip-shortcut-wrap {
        display: inline-flex;
        align-items: center;
      }
      .noodle-tooltip-kbd {
        display: inline-block;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.24);
        border-radius: 4px;
        padding: 0.5px 4.5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 9.5px;
        font-weight: 600;
        color: #c4b5fd;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        letter-spacing: 0.2px;
      }
      .noodle-tooltip-bullet {
        color: #a78bfa;
        margin: 0 2px;
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }

  function getOrCreateTooltip() {
    ensureTooltipStyles();
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
    
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    safe = safe.replace(/(\s*)(?:\[([A-Z0-9\+\-\s]{1,10})\]|\((Ctrl\+[A-Za-z0-9]|Strg\+[A-Za-z0-9]|Alt\+[A-Za-z0-9]|Shift\+[A-Za-z0-9]|Cmd\+[A-Za-z0-9])\))/gi, (match, space, kbd1, kbd2) => {
      const key = kbd1 || kbd2;
      return `<span class="noodle-tooltip-shortcut-wrap">&nbsp;<kbd class="noodle-tooltip-kbd">${key}</kbd></span>`;
    });

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

    if (top < margin) {
      top = rect.bottom + gap;
      placement = 'bottom';
      if (top + tooltipRect.height > window.innerHeight - margin) {
        top = Math.max(margin, Math.min(window.innerHeight - tooltipRect.height - margin, rect.top));
      }
    }

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

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    tooltip.innerHTML = formatTooltipContent(text.trim());
    tooltip.classList.remove('noodle-tooltip-visible');
    tooltip.style.display = 'block';

    positionTooltip(target, tooltip);

    tooltip.classList.add('noodle-tooltip-visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }

  function hideTooltip(immediate = false) {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }

    if (tooltipEl) {
      tooltipEl.classList.remove('noodle-tooltip-visible');
      tooltipEl.setAttribute('aria-hidden', 'true');
      if (immediate) {
        tooltipEl.style.display = 'none';
      } else {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (tooltipEl && !tooltipEl.classList.contains('noodle-tooltip-visible')) {
            tooltipEl.style.display = 'none';
          }
        }, 80);
      }
    }
    currentTarget = null;
  }

  function findTooltipTarget(el) {
    let curr = el;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (curr.getAttribute('data-no-tooltip') === 'true' || curr.hasAttribute('data-no-tooltip')) {
        return null;
      }
      if (curr.hasAttribute('title') && curr.getAttribute('title').trim()) {
        const titleText = curr.getAttribute('title').trim();
        curr.setAttribute('data-noodle-tooltip', titleText);
        curr.removeAttribute('title');
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

  // Globales Event-Delegation: Reagiert SOFORT (0ms Verzögerung)
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
    // Sofort anzeigen ohne künstliche Verzögerung
    showTooltip(target);
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
  document.addEventListener('dragstart', () => hideTooltip(true), { passive: true });
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureTooltipStyles);
  } else {
    ensureTooltipStyles();
  }
})();
