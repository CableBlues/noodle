/**
 * @file app-feature-bridge.js
 * @module FeatureBridge
 * @description
 * Modulübergreifende Integrations-Pipeline & Smart-Action-Verknüpfung:
 * - Smart Action Badges & Aufgaben-Tool-Links (Timer, Rezepte, Einkaufsliste, Soundscapes)
 * - Universeller Inline-Parser für `@`-Mentions und kontextsensitive Schlagworte
 * - Kontextmenü-Integration zur direkten Werkzeugverknüpfung an Aufgabenkarten
 * - 1-Klick-Pipelines zwischen Koch-Studio, OCR-Scanner, Brainstorming, Lernkarten und Kanban-Board
 */

(function(global) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. SMART TOOL LINK PARSER & DETECTION
  // --------------------------------------------------------------------------

  /**
   * Extrahiert alle verknüpften Tools für ein Task-Objekt oder einen Text-String.
   * Prüft sowohl explizite Eigenschaften auf dem Task-Objekt (task.toolLinks)
   * als auch semantische Schlüsselwörter und Inline-Tags wie @timer, @rezept, etc.
   */
  function getTaskToolLinks(taskItem) {
    if (!taskItem) return [];
    const links = [];
    const taskObj = (typeof taskItem === 'object' && taskItem !== null) ? taskItem : { task: String(taskItem || '') };
    const taskText = String(taskObj.task || taskObj.title || taskObj.name || '').trim();
    const explicitLinks = taskObj.toolLinks || {};

    // 1. Expliziter Timer oder Regex-Dauer / @timer
    if (explicitLinks.timer) {
      links.push({
        type: 'timer',
        icon: 'timer',
        label: explicitLinks.timer.label || `${explicitLinks.timer.minutes || 25}m Timer`,
        color: 'text-amber-300 border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25',
        data: explicitLinks.timer
      });
    } else {
      const timerMatch = taskText.match(/@timer\s*(\d+)?m?/i) || taskText.match(/\b(\d{1,3})\s*(?:min|minute|minuten|m)\b/i);
      if (timerMatch) {
        const mins = parseInt(timerMatch[1], 10) || 25;
        links.push({
          type: 'timer',
          icon: 'timer',
          label: `${mins}m Fokus`,
          color: 'text-amber-300 border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25',
          data: { minutes: mins }
        });
      }
    }

    // 2. Explizites oder semantisches Rezept / @rezept / Koch-Aufgabe
    if (explicitLinks.recipe) {
      links.push({
        type: 'recipe',
        icon: 'utensils',
        label: explicitLinks.recipe.title ? `🍳 ${explicitLinks.recipe.title.slice(0, 18)}...` : '🍳 Rezept öffnen',
        color: 'text-orange-300 border-orange-500/40 bg-orange-500/15 hover:bg-orange-500/25',
        data: explicitLinks.recipe
      });
    } else {
      const recipeMatch = taskText.match(/@rezept(?::([\w-]+))?/i) || taskText.match(/\b(rezept|kochen|zubereiten|nudeln|pasta|curry|wrap|omelett|lachs)\b/i);
      if (recipeMatch) {
        const recipeId = recipeMatch[1] || null;
        links.push({
          type: 'recipe',
          icon: 'utensils',
          label: '🍳 Koch-Studio',
          color: 'text-orange-300 border-orange-500/40 bg-orange-500/15 hover:bg-orange-500/25',
          data: { recipeId }
        });
      }
    }

    // 3. Explizite oder semantische Einkaufsliste / @einkauf
    if (explicitLinks.shopping) {
      links.push({
        type: 'shopping',
        icon: 'shopping-cart',
        label: '🛒 Einkaufsliste',
        color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25',
        data: explicitLinks.shopping
      });
    } else if (/@einkauf|@shopping|einkaufen|supermarkt|lebensmittel|zutaten/i.test(taskText)) {
      links.push({
        type: 'shopping',
        icon: 'shopping-cart',
        label: '🛒 Einkaufsliste',
        color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25',
        data: {}
      });
    }

    // 4. Soundscape / Ambient Lo-Fi / @sound
    if (explicitLinks.sound) {
      links.push({
        type: 'sound',
        icon: 'headphones',
        label: explicitLinks.sound.name ? `🎧 ${explicitLinks.sound.name}` : '🎧 Soundscape',
        color: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25',
        data: explicitLinks.sound
      });
    } else if (/@sound(?::([\w-]+))?|@lofi|@rain|@focus|soundscape|hintergrundmusik/i.test(taskText)) {
      const soundMatch = taskText.match(/@sound(?::([\w-]+))?/i);
      links.push({
        type: 'sound',
        icon: 'headphones',
        label: '🎧 Soundscape',
        color: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25',
        data: { soundId: soundMatch ? soundMatch[1] : 'rain' }
      });
    }

    // 5. Lernkarten / Flashcards / @learn / @flashcards
    if (explicitLinks.flashcards) {
      links.push({
        type: 'flashcards',
        icon: 'graduation-cap',
        label: '🗂️ Lernkarten',
        color: 'text-purple-300 border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25',
        data: explicitLinks.flashcards
      });
    } else if (/@learn|@cards|@flashcards|vokabeln|lernen|prüfung|klausur|karteikarten/i.test(taskText)) {
      links.push({
        type: 'flashcards',
        icon: 'graduation-cap',
        label: '🗂️ Lernkarten',
        color: 'text-purple-300 border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25',
        data: {}
      });
    }

    // 6. Brainstorming / Mindmap / @brainstorm / @mindmap
    if (explicitLinks.brainstorm) {
      links.push({
        type: 'brainstorm',
        icon: 'lightbulb',
        label: '💡 Mindmap & Ideen',
        color: 'text-teal-300 border-teal-500/40 bg-teal-500/15 hover:bg-teal-500/25',
        data: explicitLinks.brainstorm
      });
    } else if (/@brainstorm|@mindmap|@ideen|brainstorming|konzept|entwurf/i.test(taskText)) {
      links.push({
        type: 'brainstorm',
        icon: 'lightbulb',
        label: '💡 Mindmap & Ideen',
        color: 'text-teal-300 border-teal-500/40 bg-teal-500/15 hover:bg-teal-500/25',
        data: {}
      });
    }

    // 7. Clarity / Anti-Aufschub / Urge Surf / @clarity / @breathe
    if (explicitLinks.clarity) {
      links.push({
        type: 'clarity',
        icon: 'wind',
        label: '🌬️ 90s Atem & Klarheit',
        color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25',
        data: explicitLinks.clarity
      });
    } else if (/@clarity|@breathe|@urge|atemübung|widerstand|aufschieben|blockade/i.test(taskText)) {
      links.push({
        type: 'clarity',
        icon: 'wind',
        label: '🌬️ 90s Atem & Klarheit',
        color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25',
        data: {}
      });
    }

    // 8. OCR Notiz & Handschrift Scan / @ocr / @scan
    if (explicitLinks.ocr) {
      links.push({
        type: 'ocr',
        icon: 'camera',
        label: '📷 OCR Notiz',
        color: 'text-rose-300 border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25',
        data: explicitLinks.ocr
      });
    } else if (/@scan|@ocr|handschrift|foto-notiz|abfotografieren/i.test(taskText)) {
      links.push({
        type: 'ocr',
        icon: 'camera',
        label: '📷 OCR Scan',
        color: 'text-rose-300 border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25',
        data: {}
      });
    }

    return links;
  }

  // --------------------------------------------------------------------------
  // 2. TOOL BADGE RENDERING
  // --------------------------------------------------------------------------

  /**
   * Erzeugt das kompakte HTML für die interaktiven Aktions-Pills unter einer Aufgabenkarte.
   */
  function renderTaskToolBadgesHTML(taskItem, colId, index) {
    const links = getTaskToolLinks(taskItem);
    if (!links || links.length === 0) return '';

    const badges = links.map(link => {
      const safeData = JSON.stringify(link.data || {}).replace(/"/g, '&quot;');
      return `
        <button 
          onclick="executeToolLink('${link.type}', ${safeData}, '${colId}', ${index}, event)"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9.5px] font-bold transition-all duration-150 cursor-pointer shadow-xs hover:scale-105 active:scale-95 shrink-0 ${link.color}"
          title="${tr({ de: 'Klicken zum Öffnen / Starten dieses verknüpften Tools', en: 'Click to open or trigger this linked tool' })}"
        >
          <i data-lucide="${link.icon}" class="w-2.5 h-2.5"></i>
          <span>${link.label}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="flex items-center gap-1 flex-wrap mt-1 pt-0.5 border-t border-white/[0.04] w-full" onclick="event.stopPropagation()">
        ${badges}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 3. TOOL LINK EXECUTION (DER INTELLIGENTE TRIGGER)
  // --------------------------------------------------------------------------

  function executeToolLink(type, data, colId, index, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    const taskItem = curItems[colId]?.[index];
    const taskTitle = typeof taskItem === 'object' && taskItem ? (taskItem.task || taskItem.title || taskItem.name || '') : String(taskItem || '');

    switch (type) {
      case 'timer': {
        const mins = (data && data.minutes) ? data.minutes : 25;
        if (typeof linkTaskToTimer === 'function') {
          linkTaskToTimer(taskTitle, colId, index);
        }
        if (typeof setCustomTimerMinutes === 'function') {
          setCustomTimerMinutes(mins);
        } else if (typeof state !== 'undefined') {
          state.timerDuration = mins * 60;
          state.timerSecondsLeft = mins * 60;
        }
        if (typeof startTimer === 'function') {
          startTimer();
        }
        if (typeof showToast === 'function') {
          showToast(`⏱️ ${mins}-Minuten Fokus für "${taskTitle || 'Aufgabe'}" gestartet!`);
        }
        break;
      }

      case 'recipe': {
        if (typeof openCookingHub === 'function') {
          openCookingHub();
        } else if (typeof openCookingModal === 'function') {
          openCookingModal();
        }
        const recipeId = data.recipeId || data.id;
        if (recipeId && typeof viewRecipeDetail === 'function') {
          setTimeout(() => viewRecipeDetail(recipeId), 150);
        }
        if (typeof showToast === 'function') {
          showToast(`🍳 Rezept geöffnet: "${data.title || 'Koch-Studio'}"`);
        }
        break;
      }

      case 'shopping': {
        if (typeof openSupermarketModal === 'function') {
          openSupermarketModal();
        } else if (typeof openShoppingHub === 'function') {
          openShoppingHub();
        }
        if (typeof showToast === 'function') {
          showToast(`🛒 Einkaufsliste geöffnet`);
        }
        break;
      }

      case 'sound': {
        const soundId = data.soundId || data.id || 'rain';
        if (typeof playPresetSound === 'function') {
          playPresetSound(soundId);
        } else if (typeof playSoundScape === 'function') {
          playSoundScape(soundId);
        } else if (typeof toggleAudioPlay === 'function') {
          toggleAudioPlay(true);
        }
        if (typeof showToast === 'function') {
          showToast(`🎧 Soundscape aktiviert (${soundId})`);
        }
        break;
      }

      case 'flashcards': {
        if (typeof openLearningModal === 'function') {
          openLearningModal();
        } else if (typeof openLearningHub === 'function') {
          openLearningHub();
        }
        if (data.deckId && typeof startLearningDeck === 'function') {
          setTimeout(() => startLearningDeck(data.deckId), 150);
        }
        if (typeof showToast === 'function') {
          showToast(`🗂️ Lernkarten geöffnet`);
        }
        break;
      }

      case 'brainstorm': {
        if (typeof openBrainstormModal === 'function') {
          openBrainstormModal();
        } else if (typeof openBrainstormHub === 'function') {
          openBrainstormHub();
        }
        if (typeof showToast === 'function') {
          showToast(`💡 Brainstorming geöffnet`);
        }
        break;
      }

      case 'clarity': {
        if (typeof openClarityModal === 'function') {
          openClarityModal();
          if (typeof switchClarityTab === 'function') switchClarityTab('urge');
          if (typeof startClarityUrgeTimer === 'function') {
            setTimeout(() => startClarityUrgeTimer(), 200);
          }
        }
        if (typeof showToast === 'function') {
          showToast(`🌬️ 90s Urge Surfing gestartet – durchatmen!`);
        }
        break;
      }

      case 'ocr': {
        if (typeof openNoteScannerModal === 'function') {
          openNoteScannerModal('notes', `${colId}-${index}`);
        }
        if (typeof showToast === 'function') {
          showToast(`📷 OCR Dokument- & Notiz-Scanner geöffnet`);
        }
        break;
      }

      default:
        console.warn('[FeatureBridge] Unknown tool link type:', type);
    }

    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  // --------------------------------------------------------------------------
  // 4. MODAL: "TOOL VERKNÜPFEN" (LINK TOOL TO TASK)
  // --------------------------------------------------------------------------

  let linkingTargetMeta = null; // { colId, index }

  function openLinkToolModal(colId, index) {
    linkingTargetMeta = { colId, index };
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    const rawTask = curItems[colId]?.[index];
    if (!rawTask) return;
    const taskObj = typeof rawTask === 'object' ? rawTask : { task: rawTask };
    const taskTitle = taskObj.task || taskObj.title || 'Aufgabe';

    let modal = document.getElementById('modal-link-tool');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-link-tool';
      modal.className = 'fixed inset-0 z-[200060] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-[#12111d] border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 flex flex-col gap-4 text-gray-200">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <i data-lucide="link" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-white tracking-tight">${tr({ de: 'Tool mit Aufgabe verknüpfen', en: 'Link Tool to Task' })}</h2>
              <p class="text-xs text-gray-400 truncate max-w-xs font-mono">"${escapeHtml(taskTitle)}"</p>
            </div>
          </div>
          <button onclick="closeLinkToolModal()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Quick Tool Select Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-1">
          <!-- 1. Timer -->
          <button onclick="attachToolToTask('timer', { minutes: 25, label: '25m Pomodoro' })" class="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">⏱️</span>
              <span class="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">25 Min</span>
            </div>
            <span class="text-xs font-bold text-amber-200 group-hover:text-amber-100">${tr({ de: 'Fokus-Timer', en: 'Focus Timer' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Startet Pomodoro-Taktung', en: 'Starts Pomodoro interval' })}</span>
          </button>

          <!-- 2. Stoppuhr / Chrono -->
          <button onclick="attachToolToTask('timer', { minutes: 50, label: '50m Deep Work' })" class="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">⏳</span>
              <span class="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">50 Min</span>
            </div>
            <span class="text-xs font-bold text-emerald-200 group-hover:text-emerald-100">${tr({ de: 'Deep Work', en: 'Deep Work' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Langer Fokus-Block', en: 'Long focus block' })}</span>
          </button>

          <!-- 3. Soundscape -->
          <button onclick="attachToolToTask('sound', { soundId: 'rain', name: 'Regen & Lo-Fi' })" class="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">🎧</span>
              <span class="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">Ambient</span>
            </div>
            <span class="text-xs font-bold text-indigo-200 group-hover:text-indigo-100">${tr({ de: 'Soundscape', en: 'Soundscape' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Regen, Cafe & Lo-Fi', en: 'Rain, Cafe & Lo-Fi' })}</span>
          </button>

          <!-- 4. Kochstudio / Rezept -->
          <button onclick="attachToolToTask('recipe', { title: 'Schnelle Nudeln' })" class="p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">🍳</span>
              <span class="text-[9px] font-mono font-bold text-orange-300 bg-orange-500/20 px-1.5 py-0.5 rounded">Rezept</span>
            </div>
            <span class="text-xs font-bold text-orange-200 group-hover:text-orange-100">${tr({ de: 'Koch-Studio', en: 'Cooking Hub' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Schritte & Küchen-Timer', en: 'Steps & kitchen timers' })}</span>
          </button>

          <!-- 5. Einkaufsliste -->
          <button onclick="attachToolToTask('shopping', {})" class="p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">🛒</span>
              <span class="text-[9px] font-mono font-bold text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded">Deals</span>
            </div>
            <span class="text-xs font-bold text-teal-200 group-hover:text-teal-100">${tr({ de: 'Einkaufsliste', en: 'Shopping List' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Gänge & Supermarkt-Radar', en: 'Aisles & Supermarket deals' })}</span>
          </button>

          <!-- 6. Brainstorming / Mindmap -->
          <button onclick="attachToolToTask('brainstorm', {})" class="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">💡</span>
              <span class="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">Ideen</span>
            </div>
            <span class="text-xs font-bold text-purple-200 group-hover:text-purple-100">${tr({ de: 'Brainstorming', en: 'Brainstorming' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Mindmap & Ideenpool', en: 'Mindmap & idea pool' })}</span>
          </button>

          <!-- 7. Lernkarten -->
          <button onclick="attachToolToTask('flashcards', { deckId: 'adhd_neuro' })" class="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">🗂️</span>
              <span class="text-[9px] font-mono font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded">Spaced</span>
            </div>
            <span class="text-xs font-bold text-sky-200 group-hover:text-sky-100">${tr({ de: 'Lernkarten', en: 'Flashcards' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Wissen & Leitner-System', en: 'Knowledge & Leitner spaced rep' })}</span>
          </button>

          <!-- 8. Clarity / 90s Breath -->
          <button onclick="attachToolToTask('clarity', { mode: 'urge' })" class="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">🌬️</span>
              <span class="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">90 Sek</span>
            </div>
            <span class="text-xs font-bold text-cyan-200 group-hover:text-cyan-100">${tr({ de: 'Anti-Aufschub', en: 'Anti-Procrastinate' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Atemübung & Impulskontrolle', en: 'Breathing & somatic calm' })}</span>
          </button>

          <!-- 9. OCR Scan -->
          <button onclick="attachToolToTask('ocr', {})" class="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition flex flex-col gap-1 cursor-pointer group">
            <div class="flex items-center justify-between">
              <span class="text-lg">📷</span>
              <span class="text-[9px] font-mono font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded">OCR</span>
            </div>
            <span class="text-xs font-bold text-rose-200 group-hover:text-rose-100">${tr({ de: 'Dokument-Scan', en: 'Document Scan' })}</span>
            <span class="text-[10px] text-gray-400">${tr({ de: 'Handschrift erfassen', en: 'Handwriting capture' })}</span>
          </button>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-white/10">
          <button onclick="removeAllToolLinksFromTask()" class="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 font-medium text-xs transition cursor-pointer">
            ${tr({ de: 'Verknüpfungen entfernen', en: 'Remove tool links' })}
          </button>
          <button onclick="closeLinkToolModal()" class="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer">
            ${tr({ de: 'Fertig', en: 'Done' })}
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  function closeLinkToolModal() {
    const modal = document.getElementById('modal-link-tool');
    if (modal) modal.classList.add('hidden');
    linkingTargetMeta = null;
  }

  function attachToolToTask(toolType, toolData) {
    if (!linkingTargetMeta) return;
    const { colId, index } = linkingTargetMeta;
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    let rawTask = curItems[colId]?.[index];
    if (!rawTask) return;

    if (typeof rawTask === 'string') {
      rawTask = { task: rawTask };
      curItems[colId][index] = rawTask;
    }

    if (!rawTask.toolLinks) rawTask.toolLinks = {};
    rawTask.toolLinks[toolType] = toolData || {};

    if (typeof saveHistory === 'function') saveHistory();
    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();

    closeLinkToolModal();
    if (typeof showToast === 'function') {
      showToast(`🔗 Tool erfolgreich verknüpft!`);
    }
  }

  function removeAllToolLinksFromTask() {
    if (!linkingTargetMeta) return;
    const { colId, index } = linkingTargetMeta;
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    const rawTask = curItems[colId]?.[index];
    if (rawTask && typeof rawTask === 'object') {
      rawTask.toolLinks = {};
      if (typeof saveHistory === 'function') saveHistory();
      if (typeof saveState === 'function') saveState();
      if (typeof renderApp === 'function') renderApp();
    }
    closeLinkToolModal();
    if (typeof showToast === 'function') {
      showToast(tr({ de: 'Verknüpfungen gelöscht', en: 'Links removed' }));
    }
  }

  // --------------------------------------------------------------------------
  // 5. CROSS-FEATURE PIPELINE BRIDGES
  // --------------------------------------------------------------------------

  /**
   * KOCHSTUDIO ➔ EINKAUFSLISTE
   * Übernimmt alle Zutaten eines Rezepts direkt in die Einkaufsliste
   */
  function bridgeRecipeToShopping(recipeIdOrObj) {
    let recipe = recipeIdOrObj;
    if (typeof recipe === 'string') {
      const cooking = (typeof getCookingState === 'function') ? getCookingState() : (state.cooking || {});
      const allRecipes = (cooking.recipes && cooking.recipes.length) ? cooking.recipes : (typeof DEFAULT_CURATED_RECIPES !== 'undefined' ? DEFAULT_CURATED_RECIPES : []);
      recipe = allRecipes.find(r => r.id === recipeIdOrObj);
    }
    if (!recipe || !Array.isArray(recipe.ingredients)) {
      if (typeof showToast === 'function') showToast('Rezept-Zutaten konnten nicht geladen werden');
      return;
    }

    if (typeof handleAddShoppingItem === 'function') {
      recipe.ingredients.forEach(ing => {
        handleAddShoppingItem(ing, {
          dept: (typeof getDepartmentForItem === 'function') ? getDepartmentForItem(ing) : 'pantry'
        });
      });
    }

    if (typeof showToast === 'function') {
      showToast(`🛒 ${recipe.ingredients.length} Zutaten für "${recipe.title}" auf Einkaufsliste gesetzt!`);
    }
  }

  /**
   * KOCHSTUDIO ➔ BOARD AUFGABE
   * Erstellt eine Aufgabe "Kochen: [Rezeptname]" mit Rezept-Link und Timer-Dauer
   */
  function bridgeRecipeToBoardTask(recipeIdOrObj, colId = 'daily') {
    let recipe = recipeIdOrObj;
    if (typeof recipe === 'string') {
      const cooking = (typeof getCookingState === 'function') ? getCookingState() : (state.cooking || {});
      const allRecipes = (cooking.recipes && cooking.recipes.length) ? cooking.recipes : (typeof DEFAULT_CURATED_RECIPES !== 'undefined' ? DEFAULT_CURATED_RECIPES : []);
      recipe = allRecipes.find(r => r.id === recipeIdOrObj);
    }
    if (!recipe) return;

    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    if (!curItems[colId]) curItems[colId] = [];

    const durationMins = parseInt(recipe.duration, 10) || 20;

    const newTask = {
      task: `🍳 Kochen: ${recipe.title}`,
      color: 'orange',
      toolLinks: {
        recipe: { id: recipe.id, title: recipe.title },
        timer: { minutes: durationMins, label: `${durationMins}m Zubereitung` }
      }
    };

    if (typeof saveHistory === 'function') saveHistory();
    curItems[colId].push(newTask);
    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();

    if (typeof showToast === 'function') {
      showToast(`📋 Aufgabe "${newTask.task}" im Board angelegt!`);
    }
  }

  /**
   * OCR SCANNER ➔ BOARD AUFGABEN
   * Zerlegt gescannten Text in To-Dos und fügt sie ins Board ein
   */
  function bridgeOcrToBoardTasks(scannedText, colId = 'todo') {
    if (!scannedText) return;
    const lines = scannedText.split('\n')
      .map(l => l.replace(/^[-*•\d.)\]\s]+/, '').trim())
      .filter(l => l.length > 2);

    if (lines.length === 0) return;

    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    if (!curItems[colId]) curItems[colId] = [];

    if (typeof saveHistory === 'function') saveHistory();
    lines.forEach(text => {
      curItems[colId].push({
        task: text,
        toolLinks: {
          ocr: { scannedAt: new Date().toISOString() }
        }
      });
    });

    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();

    if (typeof showToast === 'function') {
      showToast(`📋 ${lines.length} Aufgaben aus Scan übernommen!`);
    }
  }

  /**
   * OCR SCANNER ➔ EINKAUFSLISTE
   */
  function bridgeOcrToShopping(scannedText) {
    if (!scannedText) return;
    const lines = scannedText.split('\n')
      .map(l => l.replace(/^[-*•\d.)\]\s]+/, '').trim())
      .filter(l => l.length > 1);

    if (lines.length === 0) return;

    if (typeof handleAddShoppingItem === 'function') {
      lines.forEach(item => handleAddShoppingItem(item));
    }
  }

  /**
   * BRAINSTORMING ➔ BOARD AUFGABE
   */
  function bridgeBrainstormToBoardTask(ideaId, colId = 'daily') {
    const ideas = (typeof brainstormIdeas !== 'undefined') ? brainstormIdeas : [];
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    if (!curItems[colId]) curItems[colId] = [];

    const newTask = {
      task: idea.text,
      color: idea.tag === 'quickwin' ? 'emerald' : (idea.tag === 'project' ? 'sky' : 'purple'),
      toolLinks: {
        brainstorm: { ideaId: idea.id, tag: idea.tag },
        timer: { minutes: idea.tag === 'quickwin' ? 10 : 25 }
      }
    };

    if (typeof saveHistory === 'function') saveHistory();
    curItems[colId].push(newTask);
    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();

    if (typeof showToast === 'function') {
      showToast(`💡 Idee als Aufgabe mit Timer ins Board übertragen!`);
    }
  }

  /**
   * CLARITY / ATEMÜBUNG ➔ DIREKTER MICRO-FOCUS ARBEITSSTART
   * Startet nach der Atemübung sofort einen 10- oder 25-Minuten Fokusblock auf der obersten Aufgabe
   */
  function startClarityMicroFocus(minutes = 10) {
    if (typeof closeClarityModal === 'function') closeClarityModal();

    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    const firstCol = curItems.daily || curItems.todo || [];
    const firstTask = firstCol[0];
    const taskTitle = typeof firstTask === 'object' && firstTask ? (firstTask.task || 'Micro-Focus Block') : (firstTask || 'Micro-Focus Block');

    if (typeof linkTaskToTimer === 'function') {
      linkTaskToTimer(taskTitle, 'daily', 0);
    }
    if (typeof setCustomTimerMinutes === 'function') {
      setCustomTimerMinutes(minutes);
    } else if (typeof state !== 'undefined') {
      state.timerDuration = minutes * 60;
      state.timerSecondsLeft = minutes * 60;
    }
    if (typeof startTimer === 'function') {
      startTimer();
    }
    if (typeof playPresetSound === 'function') {
      playPresetSound('lofi');
    }

    if (typeof showToast === 'function') {
      showToast(`🚀 ${minutes}-Minuten Micro-Focus gestartet! Ruhig und konzentriert loslegen.`);
    }
  }

  // --------------------------------------------------------------------------
  // 6. GLOBAL EXPORTS
  // --------------------------------------------------------------------------

  global.getTaskToolLinks = getTaskToolLinks;
  global.renderTaskToolBadgesHTML = renderTaskToolBadgesHTML;
  global.executeToolLink = executeToolLink;
  global.openLinkToolModal = openLinkToolModal;
  global.closeLinkToolModal = closeLinkToolModal;
  global.attachToolToTask = attachToolToTask;
  global.removeAllToolLinksFromTask = removeAllToolLinksFromTask;

  global.bridgeRecipeToShopping = bridgeRecipeToShopping;
  global.bridgeRecipeToBoardTask = bridgeRecipeToBoardTask;
  global.bridgeOcrToBoardTasks = bridgeOcrToBoardTasks;
  global.bridgeOcrToShopping = bridgeOcrToShopping;
  global.bridgeBrainstormToBoardTask = bridgeBrainstormToBoardTask;
  global.startClarityMicroFocus = startClarityMicroFocus;

})(typeof window !== 'undefined' ? window : globalThis);
