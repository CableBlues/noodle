/**
 * @file sync-engine.js
 * @module SyncEngine
 * @description
 * Synchronisations- und Datenabgleich-Engine für den geräteübergreifenden Betrieb.
 *
 * Komponenten:
 * - `MinimalQR`: Erzeugt SVG-QR-Codes für die direkte Geräte-Kopplung ohne Server-Zwischenspeicher.
 * - `P2PDataCodec`: Komprimiert und Base64URL-kodiert Arbeitszustände für QR-Payloads.
 * - `SyncEngine`: Verwaltet den Hintergrundabgleich mit Supabase, Tombstone-basierte
 *   Konfliktauflösung (Last-Write-Wins auf Elementebene) sowie Offline-Warteschlangen.
 */

const MinimalQR = (function() {
  function generateQRCodeSVG(text, size = 220) {
    if (!text) return '';
    try {
      const qrLib = (typeof QRCode !== 'undefined' ? QRCode : (typeof window !== 'undefined' ? window.QRCode : (typeof globalThis !== 'undefined' ? globalThis.QRCode : null)));
      if (qrLib && typeof qrLib.toString === 'function') {
        let svgOut = '';
        qrLib.toString(text, { type: 'svg', margin: 2, width: size, errorCorrectionLevel: 'M' }, (err, svg) => {
          if (!err && svg) svgOut = svg;
        });
        if (svgOut) {
          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgOut)}`;
        }
      }
    } catch (e) {
      console.warn('[QR Engine] Error generating QR with QRCode vendor:', e);
    }
    return '';
  }

  return {
    generateQRCodeSVG
  };
})();

const P2PDataCodec = {
  encodeState(stateObj) {
    try {
      if (!stateObj) return '';
      const minimalState = {
        w: stateObj.activeWorkspace === 'work' ? 1 : 0,
        i: stateObj.items || {},
        d: (stateObj.done || []).slice(0, 15),
        wi: stateObj.workItems || {},
        wd: (stateObj.workDone || []).slice(0, 15)
      };
      const json = JSON.stringify(minimalState);
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      return '';
    }
  },

  decodeState(encodedStr) {
    try {
      if (!encodedStr) return null;
      let base64 = String(encodedStr).replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) base64 += '=';
      const json = decodeURIComponent(escape(atob(base64)));
      const parsed = JSON.parse(json);
      if (parsed.w !== undefined || parsed.i !== undefined) {
        return {
          items: parsed.i || {},
          done: parsed.d || [],
          workItems: parsed.wi || {},
          workDone: parsed.wd || [],
          ws: parsed.w === 1 ? 'work' : 'private'
        };
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }
};

if (typeof window !== 'undefined') {
  window.MinimalQR = MinimalQR;
  window.P2PDataCodec = P2PDataCodec;
}
if (typeof globalThis !== 'undefined') {
  globalThis.MinimalQR = MinimalQR;
  globalThis.P2PDataCodec = P2PDataCodec;
}

// ============================================================================
// 1. CLOUD SYNC & MERGE ENGINE (api-sync.php)
// ============================================================================
const cloudSyncEngine = {
  lastSyncTime: null,
  lastSyncedSnapshot: null,
  isSyncing: false,
  syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  syncError: null,
  retryCount: 0,
  retryTimer: null,
  autoSyncTimer: null,
  syncDebounceTimer: null,

  init() {
    // 1. Event-Listener für Online-/Offline-Wechsel
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn()) {
          this.retryCount = 0;
          if (this.isPendingSync()) {
            this.pushState();
          } else {
            this.pullState();
          }
        }
      });

      window.addEventListener('offline', () => {
        this.updateSyncUI('offline');
      });

      // 2. Automatischer Sync beim Wiederöffnen / Fokussieren des Tabs
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn()) {
          if (this.isPendingSync()) {
            this.pushState();
          } else {
            this.pullState();
          }
        }
      });
    }

    // 3. Auf Login-/Logout-Events reagieren
    if (typeof FlowAuth !== 'undefined') {
      FlowAuth.subscribe(({ user, token }) => {
        if (token) {
          this.pullState();
          this.startAutoSync();
        } else {
          this.stopAutoSync();
          this.updateSyncUI();
        }
      });
    }

    // 4. Starten wenn bereits angemeldet
    if (typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn()) {
      this.pullState();
      this.startAutoSync();
    }

    // 5. QR-Code / Direkt-Link Snapshot (#p2p=...) beim Öffnen prüfen
    if (typeof window !== 'undefined' && window.location && window.location.hash && window.location.hash.startsWith('#p2p=')) {
      try {
        const encoded = window.location.hash.slice(5);
        const decoded = P2PDataCodec.decodeState(encoded);
        if (decoded && typeof window.state === 'object' && window.state) {
          this.mergeState(window.state, decoded);
          if (typeof saveState === 'function') saveState(true);
          if (typeof renderApp === 'function') renderApp();
          if (typeof history !== 'undefined' && history.replaceState) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          if (typeof showToast === 'function') {
            setTimeout(() => showToast('✓ Geräte-Zustand per QR/Sync-Link erfolgreich abgeglichen!'), 400);
          }
        }
      } catch (e) {
        console.warn('[P2P Sync] Hash import notice:', e);
      }
    }
  },

  isPendingSync() {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('flow_pending_sync') === '1';
    } catch (e) {
      return false;
    }
  },

  markPendingSync() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('flow_pending_sync', '1');
      }
    } catch (e) {}
  },

  clearPendingSync() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('flow_pending_sync');
      }
    } catch (e) {}
  },

  // Vollständige State-Serialisierung (alle Datenbereiche inkl. Tombstones & Cleared-Timestamps)
  serializeFullState(stateObj) {
    const s = stateObj || {};
    const itemsCopy = (s.items && typeof s.items === 'object') ? { ...s.items } : {};
    if (!itemsCopy.notes && Array.isArray(s.notes)) itemsCopy.notes = [...s.notes];
    if (!itemsCopy.termine && Array.isArray(s.termine)) itemsCopy.termine = [...s.termine];

    return {
      _tombstones: s._tombstones || {},
      _clearedAt: s._clearedAt || {},
      _backupRestoredAt: s._backupRestoredAt || null,
      updatedAt: s.updatedAt || new Date().toISOString(),
      items: itemsCopy,
      done: s.done || [],
      workItems: s.workItems || {},
      workDone: s.workDone || [],
      studyItems: s.studyItems || {},
      studyDone: s.studyDone || [],
      notes: itemsCopy.notes || s.notes || [],
      termine: itemsCopy.termine || s.termine || [],
      shoppingList: s.shoppingList || [],
      shoppingHistory: s.shoppingHistory || [],
      shoppingCategories: s.shoppingCategories || [],
      pantry: s.pantry || [],
      recipes: s.recipes || [],
      cookingList: s.cookingList || [],
      alarms: s.alarms || [],
      archive: s.archive || [],
      brainstormIdeas: s.brainstormIdeas || [],
      clarityLog: s.clarityLog || [],
      customCategories: s.customCategories || [],
      categoriesOrder: s.categoriesOrder || [],
      activeWorkspace: s.activeWorkspace || 'private',
      clientTimestamp: new Date().toISOString()
    };
  },

  // Deterministischer, verlustfreier 3-Wege / Item-Level LWW-Merge mit Tombstones & Cleared-Timestamps
  mergeState(localState, remoteData) {
    if (!localState || !remoteData) return false;
    let modified = false;

    // 0. Vollständige Wiederherstellung (Backup-Restore / Template Reset) Vorrangprüfung
    const localRestoreTs = localState._backupRestoredAt ? new Date(localState._backupRestoredAt).getTime() : 0;
    const remoteRestoreTs = remoteData._backupRestoredAt ? new Date(remoteData._backupRestoredAt).getTime() : 0;
    const localUpTs = localState.updatedAt ? new Date(localState.updatedAt).getTime() : 0;
    const remoteUpTs = remoteData.updatedAt ? new Date(remoteData.updatedAt).getTime() : 0;

    // Fall A: Remote hat einen neueren Backup-Restore durchgeführt als der lokale Zustand
    if (remoteRestoreTs > 0 && remoteRestoreTs > localRestoreTs && remoteRestoreTs >= localUpTs) {
      console.log('[CloudSync] Remote-Backup/Restore erkannt. Lokaler Zustand wird mit wiederhergestelltem Snapshot synchronisiert.');
      if (remoteData.items) localState.items = JSON.parse(JSON.stringify(remoteData.items));
      if (remoteData.done) localState.done = JSON.parse(JSON.stringify(remoteData.done));
      if (remoteData.workItems) localState.workItems = JSON.parse(JSON.stringify(remoteData.workItems));
      if (remoteData.workDone) localState.workDone = JSON.parse(JSON.stringify(remoteData.workDone));
      if (remoteData.studyItems) localState.studyItems = JSON.parse(JSON.stringify(remoteData.studyItems));
      if (remoteData.studyDone) localState.studyDone = JSON.parse(JSON.stringify(remoteData.studyDone));
      if (remoteData.shoppingList) localState.shoppingList = JSON.parse(JSON.stringify(remoteData.shoppingList));
      if (remoteData.shoppingHistory) localState.shoppingHistory = JSON.parse(JSON.stringify(remoteData.shoppingHistory));
      if (remoteData.pantry) localState.pantry = JSON.parse(JSON.stringify(remoteData.pantry));
      if (remoteData.recipes) localState.recipes = JSON.parse(JSON.stringify(remoteData.recipes));
      if (remoteData.cookingList) localState.cookingList = JSON.parse(JSON.stringify(remoteData.cookingList));
      if (remoteData.alarms) localState.alarms = JSON.parse(JSON.stringify(remoteData.alarms));
      if (remoteData.archive) localState.archive = JSON.parse(JSON.stringify(remoteData.archive));
      if (remoteData.notes) localState.notes = JSON.parse(JSON.stringify(remoteData.notes));
      if (remoteData.termine) localState.termine = JSON.parse(JSON.stringify(remoteData.termine));
      localState._tombstones = remoteData._tombstones ? JSON.parse(JSON.stringify(remoteData._tombstones)) : {};
      localState._clearedAt = remoteData._clearedAt ? JSON.parse(JSON.stringify(remoteData._clearedAt)) : {};
      localState._backupRestoredAt = remoteData._backupRestoredAt;
      localState.updatedAt = remoteData.updatedAt || remoteData._backupRestoredAt;
      return true;
    }

    // Fall B: Lokal wurde frisch ein Backup/Vorlage wiederhergestellt, das neuer ist als der Remote-Zustand
    if (localRestoreTs > 0 && localRestoreTs > remoteRestoreTs && localRestoreTs >= remoteUpTs) {
      console.log('[CloudSync] Lokaler Backup/Restore ist aktiv und neuer als Remote. Wiederhergestellter Stand bleibt führend.');
      localState.updatedAt = new Date().toISOString();
      return true;
    }

    // Helper: Stabile Identität & Zeitstempel sicherstellen
    function computeStringHash(str) {
      let hash = 0;
      const s = String(str || '');
      for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36);
    }

    // WICHTIG: defaultTimestamp stammt aus parentState.updatedAt und ist NIEMALS Date.now(),
    // damit alte Strings nicht fälschlich neuer als bestehende Tombstones/Clear-Markierungen werden!
    function normalizeItem(item, fallbackPrefix = 'item', defaultTimestamp = '1970-01-01T00:00:00.000Z') {
      if (!item && item !== 0) return null;
      if (typeof item === 'string') {
        const hash = computeStringHash(item);
        return {
          id: `${fallbackPrefix}_h${hash}`,
          task: item,
          _wasString: true,
          _hash: hash,
          createdAt: defaultTimestamp,
          updatedAt: defaultTimestamp
        };
      }
      if (typeof item === 'object') {
        const copy = { ...item };
        const itemText = copy.task || copy.name || copy.text || copy.title || JSON.stringify(copy);
        const hash = computeStringHash(itemText);
        copy._hash = hash;
        if (!copy.id) {
          copy.id = `${fallbackPrefix}_h${hash}`;
        }
        if (!copy.createdAt) copy.createdAt = defaultTimestamp;
        if (!copy.updatedAt) copy.updatedAt = copy.createdAt || defaultTimestamp;
        return copy;
      }
      return item;
    }

    // 1. Tombstones (Lösch-Protokolle) beider Seiten zusammenführen
    const localTombstones = (localState._tombstones && typeof localState._tombstones === 'object') ? { ...localState._tombstones } : {};
    const remoteTombstones = (remoteData._tombstones && typeof remoteData._tombstones === 'object') ? remoteData._tombstones : {};
    const mergedTombstones = { ...localTombstones };

    for (const [tId, rTime] of Object.entries(remoteTombstones)) {
      if (!mergedTombstones[tId]) {
        mergedTombstones[tId] = rTime;
        modified = true;
      } else {
        const lTs = new Date(mergedTombstones[tId]).getTime();
        const rTs = new Date(rTime).getTime();
        if (rTs > lTs) {
          mergedTombstones[tId] = rTime;
          modified = true;
        }
      }
    }
    localState._tombstones = mergedTombstones;

    // 1.5 Cleared-At Zeitstempel (Karten/Tabellen-Leeren) beider Seiten zusammenführen
    const localCleared = (localState._clearedAt && typeof localState._clearedAt === 'object') ? { ...localState._clearedAt } : {};
    const remoteCleared = (remoteData._clearedAt && typeof remoteData._clearedAt === 'object') ? remoteData._clearedAt : {};
    const mergedCleared = { ...localCleared };

    for (const [cKey, rTime] of Object.entries(remoteCleared)) {
      if (!mergedCleared[cKey]) {
        mergedCleared[cKey] = rTime;
        modified = true;
      } else {
        const lTs = new Date(mergedCleared[cKey]).getTime();
        const rTs = new Date(rTime).getTime();
        if (rTs > lTs) {
          mergedCleared[cKey] = rTime;
          modified = true;
        }
      }
    }
    localState._clearedAt = mergedCleared;

    // Helper: Prüfen ob ein Item gelöscht wurde (Tombstone Matching)
    function isItemTombstoned(item, itemPrefix, categoryKey = '') {
      if (!item) return false;
      const possibleKeys = [
        item.id,
        item._hash ? `${itemPrefix}_h${item._hash}` : null,
        item._hash ? `task_${itemPrefix}_h${item._hash}` : null,
        item._hash && categoryKey ? `${categoryKey}_h${item._hash}` : null,
        item._hash && categoryKey ? `task_${categoryKey}_h${item._hash}` : null,
        item._hash && categoryKey ? `wtask_${categoryKey}_h${item._hash}` : null,
        item._hash && categoryKey ? `stask_${categoryKey}_h${item._hash}` : null,
        item._hash ? `task_h${item._hash}` : null,
        item._hash ? `done_h${item._hash}` : null,
        item._hash ? `wdone_h${item._hash}` : null,
        item._hash ? `sdone_h${item._hash}` : null,
        item._hash ? `hash_${item._hash}` : null
      ].filter(Boolean);

      for (const k of possibleKeys) {
        if (mergedTombstones[k]) {
          const delTs = new Date(mergedTombstones[k]).getTime();
          // Wenn das Item ein String war: Tombstone gilt verbindlich,
          // da Strings keine nachträglichen Teilbearbeitungen besitzen.
          if (item._wasString) {
            return true;
          }
          // Für Objekte: Prüfen, ob das Objekt nach dem Löschzeitpunkt gezielt bearbeitet wurde
          const itemUp = new Date(item.updatedAt || item.createdAt || 0).getTime();
          if (delTs >= itemUp) {
            return true;
          }
        }
      }
      return false;
    }

    // Helper: Zeitstempel für Tabellen-Leeren abrufen
    function getClearedTimestamp(ws, categoryKey) {
      const keys = [
        `${ws}_${categoryKey}`,
        `${ws}__all`,
        `__all`,
        categoryKey
      ];
      let maxTs = 0;
      for (const k of keys) {
        if (mergedCleared[k]) {
          const ts = new Date(mergedCleared[k]).getTime();
          if (!isNaN(ts) && ts > maxTs) maxTs = ts;
        }
      }
      return maxTs;
    }

    const localDefaultTime = localState.updatedAt || localState.clientTimestamp || '1970-01-01T00:00:00.000Z';
    const remoteDefaultTime = remoteData.updatedAt || remoteData.clientTimestamp || '1970-01-01T00:00:00.000Z';

    // Helper: Item-Level LWW Merge für eine Liste
    function mergeList(localList, remoteList, prefix, categoryKey = '', ws = 'private') {
      const lArr = Array.isArray(localList) ? localList.map(item => normalizeItem(item, prefix, localDefaultTime)).filter(Boolean) : [];
      const rArr = Array.isArray(remoteList) ? remoteList.map(item => normalizeItem(item, prefix, remoteDefaultTime)).filter(Boolean) : [];

      const lMap = new Map();
      lArr.forEach(item => { if (item && item.id) lMap.set(item.id, item); });

      const rMap = new Map();
      rArr.forEach(item => { if (item && item.id) rMap.set(item.id, item); });

      const allIds = new Set([...lMap.keys(), ...rMap.keys()]);
      const mergedMap = new Map();
      const clearTs = getClearedTimestamp(ws, categoryKey);

      for (const id of allIds) {
        const lItem = lMap.get(id);
        const rItem = rMap.get(id);

        // 1. Prüfen, ob Item gelöscht wurde (Tombstones)
        if (isItemTombstoned(lItem || rItem, prefix, categoryKey)) {
          if (lMap.has(id)) modified = true;
          continue;
        }

        // 2. Prüfen, ob Tabelle/Spalte geleert wurde vor Erstellung/Update dieses Items
        if (clearTs > 0) {
          const lUp = lItem ? new Date(lItem.updatedAt || lItem.createdAt || 0).getTime() : 0;
          const rUp = rItem ? new Date(rItem.updatedAt || rItem.createdAt || 0).getTime() : 0;

          // Lokale Items verwerfen, wenn die Spalte geleert wurde und das Item vor clearTs existierte
          if (lItem && (lItem._wasString || lUp <= clearTs)) {
            modified = true;
            continue;
          }
          // Remote Items verwerfen, wenn die Spalte geleert wurde und das Item vor clearTs existierte
          if (rItem && (rItem._wasString || rUp <= clearTs)) {
            continue;
          }
        }

        if (lItem && rItem) {
          // Konfliktauflösung via Last-Write-Wins (LWW)
          const lTime = new Date(lItem.updatedAt || lItem.createdAt || 0).getTime();
          const rTime = new Date(rItem.updatedAt || rItem.createdAt || 0).getTime();

          if (rTime > lTime) {
            // Remote-Version ist neuer
            mergedMap.set(id, rItem);
            modified = true;
          } else {
            // Lokale Version ist neuer oder gleich
            mergedMap.set(id, lItem);
          }
        } else if (rItem) {
          // Neues Item von Remote
          mergedMap.set(id, rItem);
          modified = true;
        } else if (lItem) {
          // Lokales Item beibehalten
          mergedMap.set(id, lItem);
        }
      }

      // Reihenfolge: Zuerst lokale Reihenfolge (gefiltert), dann neue Remote-Items anhängen
      const result = [];
      const seenIds = new Set();

      function formatOutput(item) {
        if (!item) return item;
        if (item._wasString) {
          const extraKeys = Object.keys(item).filter(k => !['_wasString', '_hash', 'id', 'createdAt', 'updatedAt', 'task'].includes(k));
          if (extraKeys.length === 0 && typeof item.task === 'string') {
            return item.task;
          }
        }
        return item;
      }

      lArr.forEach(item => {
        if (item && mergedMap.has(item.id) && !seenIds.has(item.id)) {
          result.push(formatOutput(mergedMap.get(item.id)));
          seenIds.add(item.id);
        }
      });

      rArr.forEach(item => {
        if (item && mergedMap.has(item.id) && !seenIds.has(item.id)) {
          result.push(formatOutput(mergedMap.get(item.id)));
          seenIds.add(item.id);
        }
      });

      return result;
    }

    // Helper: Kategorien-Map (z.B. items, workItems) zusammenführen
    function mergeCategoryMap(localMap, remoteMap, prefix, ws = 'private') {
      const merged = {};
      const lObj = (localMap && typeof localMap === 'object') ? localMap : {};
      const rObj = (remoteMap && typeof remoteMap === 'object') ? remoteMap : {};

      const allCats = new Set([...Object.keys(lObj), ...Object.keys(rObj)]);
      for (const cat of allCats) {
        merged[cat] = mergeList(lObj[cat] || [], rObj[cat] || [], `${prefix}_${cat}`, cat, ws);
      }
      return merged;
    }

    // Fallbacks für Notizen & Termine auf Root- und Items-Ebene synchronisieren
    if (remoteData.items && typeof remoteData.items === 'object') {
      if (!remoteData.items.notes && Array.isArray(remoteData.notes)) remoteData.items.notes = remoteData.notes;
      if (!remoteData.items.termine && Array.isArray(remoteData.termine)) remoteData.items.termine = remoteData.termine;
    }
    if (localState.items && typeof localState.items === 'object') {
      if (!localState.items.notes && Array.isArray(localState.notes)) localState.items.notes = localState.notes;
      if (!localState.items.termine && Array.isArray(localState.termine)) localState.items.termine = localState.termine;
    }

    // 1. Items, WorkItems & StudyItems (Aufgaben-Kategorien inkl. Notes & Termine)
    if (remoteData.items || localState.items) {
      localState.items = mergeCategoryMap(localState.items, remoteData.items, 'task', 'private');
      if (localState.items && localState.items.notes) {
        localState.notes = [...localState.items.notes];
      }
      if (localState.items && localState.items.termine) {
        localState.termine = [...localState.items.termine];
      }
    }
    if (remoteData.workItems || localState.workItems) {
      localState.workItems = mergeCategoryMap(localState.workItems, remoteData.workItems, 'wtask', 'work');
    }
    if (remoteData.studyItems || localState.studyItems) {
      localState.studyItems = mergeCategoryMap(localState.studyItems, remoteData.studyItems, 'stask', 'study');
    }

    // 2. Erledigte Aufgaben
    if (remoteData.done || localState.done) {
      localState.done = mergeList(localState.done, remoteData.done, 'done', 'done', 'private');
    }
    if (remoteData.workDone || localState.workDone) {
      localState.workDone = mergeList(localState.workDone, remoteData.workDone, 'wdone', 'done', 'work');
    }
    if (remoteData.studyDone || localState.studyDone) {
      localState.studyDone = mergeList(localState.studyDone, remoteData.studyDone, 'sdone', 'done', 'study');
    }

    // 3. Notizen & Termine (Root-Synchronisation)
    if (remoteData.notes || localState.notes) {
      localState.notes = mergeList(localState.notes || [], remoteData.notes || [], 'note', 'notes', 'private');
      if (localState.items) localState.items.notes = [...localState.notes];
    }
    if (remoteData.termine || localState.termine) {
      localState.termine = mergeList(localState.termine || [], remoteData.termine || [], 'termin', 'termine', 'private');
      if (localState.items) localState.items.termine = [...localState.termine];
    }

    // 4. Einkaufsliste & Historie
    if (remoteData.shoppingList || localState.shoppingList) {
      localState.shoppingList = mergeList(localState.shoppingList, remoteData.shoppingList, 'shop', 'shoppingList', 'private');
    }
    if (remoteData.shoppingHistory || localState.shoppingHistory) {
      localState.shoppingHistory = mergeList(localState.shoppingHistory, remoteData.shoppingHistory, 'shophist', 'shoppingHistory', 'private');
    }

    // 5. Vorrat, Rezepte, Kochen
    if (remoteData.pantry || localState.pantry) {
      localState.pantry = mergeList(localState.pantry, remoteData.pantry, 'pantry', 'pantry', 'private');
    }
    if (remoteData.recipes || localState.recipes) {
      localState.recipes = mergeList(localState.recipes, remoteData.recipes, 'recipe', 'recipes', 'private');
    }
    if (remoteData.cookingList || localState.cookingList) {
      localState.cookingList = mergeList(localState.cookingList, remoteData.cookingList, 'cook', 'cookingList', 'private');
    }

    // 6. Alarme, Brainstorming, Klarheit, Archiv
    if (remoteData.alarms || localState.alarms) {
      localState.alarms = mergeList(localState.alarms, remoteData.alarms, 'alarm', 'alarms', 'private');
    }
    if (remoteData.brainstormIdeas || localState.brainstormIdeas) {
      localState.brainstormIdeas = mergeList(localState.brainstormIdeas, remoteData.brainstormIdeas, 'idea', 'brainstormIdeas', 'private');
    }
    if (remoteData.clarityLog || localState.clarityLog) {
      localState.clarityLog = mergeList(localState.clarityLog, remoteData.clarityLog, 'clarity', 'clarityLog', 'private');
    }
    if (remoteData.archive || localState.archive) {
      localState.archive = mergeList(localState.archive, remoteData.archive, 'archive', 'archive', 'private');
    }

    return modified;
  },


  // Berechnet das Delta zwischen aktuellem Zustand und einem Basisschnappschuss
  computeDelta(currentState, baseSnapshot) {
    if (!currentState) return null;
    if (!baseSnapshot) {
      return { _isDelta: false, fullState: this.serializeFullState(currentState) };
    }

    const changes = {};
    let hasChanges = false;
    const arrayKeys = [
      'done', 'workDone', 'studyDone', 'notes', 'termine',
      'shoppingList', 'shoppingHistory', 'pantry', 'recipes',
      'cookingList', 'alarms', 'brainstormIdeas', 'clarityLog', 'archive'
    ];

    // 1. Kategorien-Maps
    ['items', 'workItems', 'studyItems'].forEach(mapKey => {
      const curMap = currentState[mapKey] || {};
      const baseMap = baseSnapshot[mapKey] || {};
      const changedCats = {};
      const allCats = new Set([...Object.keys(curMap), ...Object.keys(baseMap)]);

      allCats.forEach(cat => {
        const curItems = JSON.stringify(curMap[cat] || []);
        const baseItems = JSON.stringify(baseMap[cat] || []);
        if (curItems !== baseItems) {
          changedCats[cat] = curMap[cat] || [];
          hasChanges = true;
        }
      });

      if (Object.keys(changedCats).length > 0) {
        changes[mapKey] = changedCats;
      }
    });

    // 2. Flache Arrays
    arrayKeys.forEach(key => {
      const curArr = JSON.stringify(currentState[key] || []);
      const baseArr = JSON.stringify(baseSnapshot[key] || []);
      if (curArr !== baseArr) {
        changes[key] = currentState[key] || [];
        hasChanges = true;
      }
    });

    // 3. Tombstones & Cleared-Timestamps
    const curTomb = JSON.stringify(currentState._tombstones || {});
    const baseTomb = JSON.stringify(baseSnapshot._tombstones || {});
    if (curTomb !== baseTomb) {
      changes._tombstones = currentState._tombstones || {};
      hasChanges = true;
    }

    const curClear = JSON.stringify(currentState._clearedAt || {});
    const baseClear = JSON.stringify(baseSnapshot._clearedAt || {});
    if (curClear !== baseClear) {
      changes._clearedAt = currentState._clearedAt || {};
      hasChanges = true;
    }

    if (!hasChanges) return null;

    return {
      _isDelta: true,
      baseUpdatedAt: baseSnapshot.updatedAt || null,
      updatedAt: currentState.updatedAt || new Date().toISOString(),
      changes
    };
  },

  // Wendet ein Delta auf den lokalen Zustand an
  applyDelta(localState, deltaObj) {
    if (!localState || !deltaObj) {
      throw new Error('Ungültiges Delta-Paket');
    }
    if (!deltaObj._isDelta || !deltaObj.changes) {
      throw new Error('Delta-Format inkompatibel');
    }

    const changes = deltaObj.changes;

    if (changes._tombstones) {
      localState._tombstones = { ...(localState._tombstones || {}), ...changes._tombstones };
    }
    if (changes._clearedAt) {
      localState._clearedAt = { ...(localState._clearedAt || {}), ...changes._clearedAt };
    }

    ['items', 'workItems', 'studyItems'].forEach(mapKey => {
      if (changes[mapKey]) {
        localState[mapKey] = localState[mapKey] || {};
        Object.entries(changes[mapKey]).forEach(([cat, items]) => {
          localState[mapKey][cat] = items;
        });
      }
    });

    const arrayKeys = [
      'done', 'workDone', 'studyDone', 'notes', 'termine',
      'shoppingList', 'shoppingHistory', 'pantry', 'recipes',
      'cookingList', 'alarms', 'brainstormIdeas', 'clarityLog', 'archive'
    ];
    arrayKeys.forEach(key => {
      if (changes[key] !== undefined) {
        localState[key] = changes[key];
      }
    });

    localState.updatedAt = deltaObj.updatedAt || new Date().toISOString();
    return true;
  },

  // Führt einen Delta-Push aus mit automatischem Fallback auf Full-Sync
  async pushDelta() {
    try {
      const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : {});
      if (!this.lastSyncedSnapshot) {
        return await this.pushState(); // Full-Sync Fallback
      }

      const delta = this.computeDelta(currentState, this.lastSyncedSnapshot);
      if (!delta) {
        return { success: true, skipped: true, upToDate: true };
      }

      if (!delta._isDelta) {
        return await this.pushState(); // Full-Sync Fallback
      }

      if (typeof FlowAuth !== 'undefined' && FlowAuth.getSupabaseClient) {
        const supa = FlowAuth.getSupabaseClient();
        const user = FlowAuth.getUser();
        if (supa && user && user.id) {
          let payload = delta;
          if (typeof NoodleCrypto !== 'undefined' && NoodleCrypto.isE2EEnabled()) {
            const pass = NoodleCrypto.getSavedPassphrase();
            if (pass) {
              payload = await NoodleCrypto.encrypt(delta, pass);
            }
          }

          const { error } = await supa.from('flow_sync').upsert({
            user_id: user.id,
            data: payload,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

          if (error) {
            console.warn('[CloudSync] Delta-Push fehlgeschlagen, wechsle zu Full-Sync Fallback:', error.message);
            return await this.pushState();
          }


          this.clearPendingSync();
          this.retryCount = 0;
          this.lastSyncTime = new Date();
          this.lastSyncedSnapshot = JSON.parse(JSON.stringify(currentState));
          this.updateSyncUI('synced');
          return { success: true, isDelta: true, time: this.lastSyncTime };
        }
      }

      return await this.pushState();
    } catch (e) {
      console.warn('[CloudSync] Delta-Push Ausnahme, wechsle zu Full-Sync Fallback:', e.message);
      return await this.pushState();
    }
  },

  // Führt einen Delta-Pull aus mit automatischem Fallback auf Full-Sync
  async pullDelta() {
    return await this.pullState();
  },

  async pushState(isRetry = false) {
    if (typeof FlowAuth === 'undefined' || !FlowAuth.isLoggedIn()) return { skipped: true };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.markPendingSync();
      this.scheduleRetry();
      this.updateSyncUI('offline');
      return { offline: true };
    }

    const token = FlowAuth.getSyncToken();
    if (!token) return { skipped: true };

    this.isSyncing = true;
    this.updateSyncUI('syncing');

    try {
      const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : {});
      const serializedData = this.serializeFullState(currentState);

      // 1. Supabase Cloud Sync (wenn Supabase authentifiziert oder per Pairing-Token gekoppelt ist)
      if (typeof FlowAuth !== 'undefined' && FlowAuth.getSupabaseClient) {
        const supa = FlowAuth.getSupabaseClient();
        const user = FlowAuth.getUser();
        if (supa && user && user.id) {
          let payload = serializedData;
          if (typeof NoodleCrypto !== 'undefined' && NoodleCrypto.isE2EEnabled()) {
            const pass = NoodleCrypto.getSavedPassphrase();
            if (pass) {
              payload = await NoodleCrypto.encrypt(serializedData, pass);
            }
          }

          const { error } = await supa.from('flow_sync').upsert({
            user_id: user.id,
            data: payload,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

          if (error) {
            if (user.isTokenOnly || (error.message && /row-level security|violates row-level|unauthorized|jwt|401|403/i.test(error.message)) || error.status === 401 || error.status === 403 || error.code === '42501') {
              console.warn('[CloudSync] Cloud sync write not permitted by database RLS or expired session; relying on local/P2P sync.');
              this.clearPendingSync();
              this.retryCount = 0;
              if (this.retryTimer) {
                clearTimeout(this.retryTimer);
                this.retryTimer = null;
              }
              this.updateSyncUI('synced');
              return { skipped: true, tokenOnly: true };
            }
            throw error;
          }


          this.clearPendingSync();
          this.retryCount = 0;
          if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
          }
          this.lastSyncTime = new Date();
          this.lastSyncedSnapshot = JSON.parse(JSON.stringify(currentState));
          this.syncError = null;
          this.updateSyncUI('synced');
          return { success: true, time: this.lastSyncTime };
        }
      }

      // Kein aktiver Supabase-User vorhanden
      throw new Error('Kein aktives Supabase-Konto. Bitte neu anmelden.');
    } catch (e) {
      if (e && e.message && /row-level security|violates row-level|unauthorized|jwt/i.test(e.message)) {
        console.warn('[CloudSync] Cloud sync paused (RLS or unauthenticated session):', e.message);
        this.clearPendingSync();
        this.retryCount = 0;
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
        }
        this.updateSyncUI('synced');
        return { success: false, rlsRestricted: true };
      }
      console.warn('[CloudSync] Push notice:', e.message);
      this.markPendingSync();
      this.scheduleRetry();
      this.updateSyncUI('error');
      return { success: false, error: e.message };
    } finally {
      this.isSyncing = false;
    }
  },

  async pullState() {
    if (typeof FlowAuth === 'undefined' || !FlowAuth.isLoggedIn()) return { skipped: true };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateSyncUI('offline');
      return { offline: true };
    }

    const token = FlowAuth.getSyncToken();
    if (!token) return { skipped: true };

    // Wenn lokale Änderungen ausstehen (Löschen, Leeren, neue Tasks),
    // müssen diese ZUERST auf den Server übertragen werden, bevor ein Pull läuft!
    if (this.isPendingSync()) {
      return await this.pushState();
    }

    this.isSyncing = true;
    this.updateSyncUI('syncing');

    try {
      // 1. Supabase Cloud Sync (wenn Supabase authentifiziert oder per Pairing-Token gekoppelt ist)
      if (typeof FlowAuth !== 'undefined' && FlowAuth.getSupabaseClient) {
        const supa = FlowAuth.getSupabaseClient();
        const user = FlowAuth.getUser();
        if (supa && user && user.id) {
          const { data, error } = await supa.from('flow_sync').select('data, updated_at').eq('user_id', user.id).maybeSingle();
          if (error) {
            if (user.isTokenOnly) {
              console.warn('[CloudSync] Token-only pull not permitted by database RLS.');
              return { skipped: true, tokenOnly: true };
            }
            throw error;
          }

          if (!data || !data.data) {
            // Noch kein State auf Server -> aktuellen Zustand hochladen
            this.isSyncing = false;
            return await this.pushState();
          }

          let remoteData = data.data;

          // E2E-Entschlüsselung (wenn verschlüsseltes Paket empfangen wurde)
          if (remoteData && remoteData._isEncrypted) {
            if (typeof NoodleCrypto !== 'undefined') {
              const pass = NoodleCrypto.getSavedPassphrase();
              if (pass) {
                try {
                  remoteData = await NoodleCrypto.decrypt(remoteData, pass);
                } catch (decErr) {
                  console.error('[CloudSync] E2E-Entschlüsselungsfehler:', decErr.message);
                  this.updateSyncUI('error');
                  if (typeof showToast === 'function') {
                    showToast('🔒 E2E-Entschlüsselung fehlgeschlagen: Bitte Passphrase prüfen.');
                  }
                  return { success: false, error: 'Passphrase invalid' };
                }
              } else {
                console.warn('[CloudSync] Verschlüsselte Daten empfangen, aber keine Passphrase vorhanden.');
                this.updateSyncUI('error');
                if (typeof showToast === 'function') {
                  showToast('🔒 Bitte Passphrase eingeben, um Sync-Daten zu entschlüsseln.');
                }
                return { success: false, error: 'Passphrase required' };
              }
            }
          }

          const targetState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);

          if (targetState) {
            // Sicherheits-Backup vor Merge anlegen
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('flow_backup_before_sync', JSON.stringify(targetState));
              }
            } catch (err) {}

            // Prüfen ob Delta-Paket empfangen wurde
            if (remoteData._isDelta === true) {
              try {
                this.applyDelta(targetState, remoteData);
                if (typeof saveState === 'function') saveState(true);
                if (typeof renderApp === 'function') renderApp();
                this.lastSyncedSnapshot = JSON.parse(JSON.stringify(targetState));
                this.lastSyncTime = new Date();
                this.updateSyncUI('synced');
                return { success: true, isDelta: true, data: remoteData };
              } catch (err) {
                console.warn('[CloudSync] Delta-Anwendung fehlgeschlagen, wechsle auf Full-Sync Fallback:', err.message);
              }
            }

            // Intelligenter Full-Merge (LWW 3-Wege)
            const hasChanges = this.mergeState(targetState, remoteData);

            if (typeof saveState === 'function') saveState(true);
            if (typeof renderApp === 'function') renderApp();
            this.lastSyncedSnapshot = JSON.parse(JSON.stringify(targetState));

            // Falls lokaler Zustand neue Elemente hatte, Server aktualisieren
            if (hasChanges || this.isPendingSync()) {
              this.pushState();
            }
          }

          this.retryCount = 0;
          if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
          }
          this.lastSyncTime = new Date();
          this.syncError = null;
          this.updateSyncUI('synced');
          return { success: true, data: remoteData };
        }
      }

      // Kein voll authentifizierter Supabase-User vorhanden
    } catch (e) {
      if (e && e.message && /row-level security|violates row-level|unauthorized|jwt/i.test(e.message)) {
        this.clearPendingSync();
        this.retryCount = 0;
        if (this.retryTimer) {
          clearTimeout(this.retryTimer);
          this.retryTimer = null;
        }
        this.updateSyncUI('synced');
        return { success: false, rlsRestricted: true };
      }
      console.warn('[CloudSync] Pull notice:', e.message);
      this.scheduleRetry();
      this.updateSyncUI('error');
      return { success: false, error: e.message };
    } finally {
      this.isSyncing = false;
    }
  },

  scheduleRetry() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.retryCount >= 3) {
      return;
    }
    // Exponential Backoff with jitter: 3s, 6s, 12s, max 30s + 0-500ms
    const baseDelay = Math.min(3000 * Math.pow(2, this.retryCount), 30000);
    const jitter = Math.floor(Math.random() * 500);
    const delay = baseDelay + jitter;
    this.retryCount++;

    this.retryTimer = setTimeout(() => {
      if (typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn()) {
        if (this.isPendingSync()) {
          this.pushState(true);
        } else {
          this.pullState();
        }
      }
    }, delay);
  },

  triggerImmediatePush() {
    if (typeof FlowAuth === 'undefined' || !FlowAuth.isLoggedIn()) return Promise.resolve({ skipped: true });
    this.markPendingSync();
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = null;
    }
    return this.pushState();
  },

  triggerAutoPush() {
    if (typeof FlowAuth === 'undefined' || !FlowAuth.isLoggedIn()) return;
    this.markPendingSync();
    if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.pushState();
    }, 1200);
  },

  startAutoSync() {
    this.stopAutoSync();
    const interval = (typeof FLOW_CONFIG !== 'undefined' && FLOW_CONFIG.AUTO_SYNC_INTERVAL_MS) || 20000;
    this.autoSyncTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        if (this.isPendingSync()) {
          this.pushState();
        } else {
          this.pullState();
        }
      }
    }, interval);
  },

  stopAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  },

  updateSyncUI(overrideStatus = null) {
    if (typeof document === 'undefined') return;
    const statusLabel = document.getElementById('cloud-sync-status-text');
    const syncDot = document.getElementById('cloud-sync-status-dot');
    const modalStatusBadge = document.getElementById('p2p-status-badge');

    const isLoggedIn = (typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn());

    let statusText = 'Bereit zur Synchronisation';
    let dotClass = 'w-2 h-2 rounded-full bg-emerald-400';
    let badgeHtml = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>✓ Synchronisiert</span>';
    let badgeClass = 'px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2';

    if (!isLoggedIn) {
      statusText = 'Nicht angemeldet (nur lokaler Modus)';
      dotClass = 'w-2 h-2 rounded-full bg-gray-500';
      badgeHtml = '<span class="w-2 h-2 rounded-full bg-gray-500"></span><span>Lokaler Modus</span>';
      badgeClass = 'px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-medium flex items-center justify-center gap-2';
    } else if (overrideStatus === 'error' || overrideStatus === 'offline') {
      statusText = '⚠ Verbindung unterbrochen – erneuter Versuch';
      dotClass = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
      badgeHtml = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>⚠ Verbindung unterbrochen – erneuter Versuch</span>';
      badgeClass = 'px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-2';
    } else if (this.isSyncing || overrideStatus === 'syncing') {
      statusText = '↻ Synchronisiere…';
      dotClass = 'w-2 h-2 rounded-full bg-amber-400 animate-spin';
      badgeHtml = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-spin"></span><span>↻ Synchronisiere…</span>';
      badgeClass = 'px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-2';
    } else if (this.lastSyncTime) {
      const timeStr = this.lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      statusText = `✓ Synchronisiert (${timeStr} Uhr)`;
      dotClass = 'w-2 h-2 rounded-full bg-emerald-400';
      badgeHtml = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>✓ Synchronisiert (${timeStr} Uhr)</span>`;
      badgeClass = 'px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2';
    } else {
      statusText = '✓ Synchronisiert';
      dotClass = 'w-2 h-2 rounded-full bg-emerald-400';
      badgeHtml = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>✓ Synchronisiert</span>';
      badgeClass = 'px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2';
    }


    if (statusLabel) statusLabel.innerText = statusText;
    if (syncDot) syncDot.className = dotClass;
    if (modalStatusBadge) {
      modalStatusBadge.className = badgeClass;
      modalStatusBadge.innerHTML = badgeHtml;
    }
  }
};

window.cloudSyncEngine = cloudSyncEngine;

// ============================================================================
// 2. MODAL & UI HANDLER FÜR AUTH & KOPPLUNG
// ============================================================================
let currentAuthMode = 'login';

function getP2PSyncUrl() {
  try {
    const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : {});
    const encoded = P2PDataCodec.encodeState(currentState);
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null')
      ? (window.location.origin + window.location.pathname)
      : 'https://cableblues.github.io/noodle/';
    return encoded ? `${baseUrl}#p2p=${encoded}` : baseUrl;
  } catch (e) {
    return 'https://cableblues.github.io/noodle/';
  }
}

function updateP2PQrDisplay() {
  if (typeof document === 'undefined') return;
  const qrImg = document.getElementById('p2p-qr-img');
  if (!qrImg || typeof MinimalQR === 'undefined') return;
  const url = getP2PSyncUrl();
  const svgDataUrl = MinimalQR.generateQRCodeSVG(url, 180);
  if (svgDataUrl) {
    qrImg.src = svgDataUrl;
    qrImg.classList.remove('hidden');
  }
}
window.updateP2PQrDisplay = updateP2PQrDisplay;

function copyP2PSyncLink() {
  const url = getP2PSyncUrl();
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      if (typeof showToast === 'function') {
        showToast('🔗 Direkt-Sync-Link in die Zwischenablage kopiert!');
      }
    }).catch(() => {});
  }
}
window.copyP2PSyncLink = copyP2PSyncLink;

function openP2PSyncModal(preferredMode = 'login') {
  const modal = document.getElementById('modal-p2p-sync');
  if (modal) {
    modal.classList.remove('hidden');

    if (typeof FlowAuth !== 'undefined') {
      FlowAuth.updateAuthUI();
    }
    if (typeof cloudSyncEngine !== 'undefined') {
      cloudSyncEngine.updateSyncUI();
    }

    switchAuthMode(preferredMode || 'login');
    updateP2PQrDisplay();

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}
window.openP2PSyncModal = openP2PSyncModal;

function closeP2PSyncModal() {
  const modal = document.getElementById('modal-p2p-sync');
  if (modal) modal.classList.add('hidden');
}
window.closeP2PSyncModal = closeP2PSyncModal;

function switchAuthMode(mode = 'login') {
  currentAuthMode = mode;
  const isLogin = (mode === 'login');

  const btnLogin = document.getElementById('sync-tab-btn-login');
  const btnRegister = document.getElementById('sync-tab-btn-register');
  const repeatWrapper = document.getElementById('sync-password-repeat-wrapper');
  const submitBtn = document.getElementById('sync-auth-submit-btn');
  const modeHint = document.getElementById('sync-auth-mode-hint');
  const switchPrompt = document.getElementById('sync-auth-switch-prompt');
  const errorMsg = document.getElementById('sync-auth-error-msg');
  const successMsg = document.getElementById('sync-auth-success-msg');

  if (errorMsg) errorMsg.classList.add('hidden');
  if (successMsg) successMsg.classList.add('hidden');

  const activeClasses = 'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs';
  const inactiveClasses = 'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer';

  if (btnLogin) btnLogin.className = isLogin ? activeClasses : inactiveClasses;
  if (btnRegister) btnRegister.className = !isLogin ? activeClasses : inactiveClasses;

  if (repeatWrapper) {
    repeatWrapper.classList.toggle('hidden', isLogin);
  }

  if (submitBtn) {
    submitBtn.innerHTML = isLogin
      ? '<i data-lucide="log-in" class="w-4 h-4"></i><span>Anmelden</span>'
      : '<i data-lucide="user-plus" class="w-4 h-4"></i><span>Konto erstellen</span>';
  }

  if (modeHint) {
    modeHint.innerHTML = isLogin
      ? (typeof tr === 'function' ? tr({ de: 'Melde dich an, um Aufgaben und Notizen <strong>automatisch im Hintergrund</strong> abzugleichen.', en: 'Sign in to <strong>automatically sync</strong> tasks and notes in the background.' }) : 'Melde dich an, um Aufgaben und Notizen <strong>automatisch im Hintergrund</strong> abzugleichen.')
      : (typeof tr === 'function' ? tr({ de: 'Erstelle ein kostenloses Konto für <strong>automatischen Multi-Device Sync</strong>.', en: 'Create a free account for <strong>automatic multi-device sync</strong>.' }) : 'Erstelle ein kostenloses Konto für <strong>automatischen Multi-Device Sync</strong>.');
  }

  if (switchPrompt) {
    switchPrompt.innerHTML = isLogin
      ? '<span>Noch kein Konto?</span> <button type="button" onclick="switchAuthMode(\'register\')" class="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer">Jetzt registrieren</button>'
      : '<span>Bereits registriert?</span> <button type="button" onclick="switchAuthMode(\'login\')" class="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer">Jetzt anmelden</button>';
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.switchAuthMode = switchAuthMode;
window.switchSyncModalTab = (tab) => {
  if (tab === 'register') switchAuthMode('register');
  else switchAuthMode('login');
};
window.switchP2PTab = (tab) => window.switchSyncModalTab(tab);

// E-Mail & Passwort Authentifizierung (Anmelden / Registrieren)
async function handleEmailAuth(forcedMode = null) {
  const mode = forcedMode || currentAuthMode || 'login';
  const emailInput = document.getElementById('sync-email-input');
  const passwordInput = document.getElementById('sync-password-input');
  const repeatInput = document.getElementById('sync-password-repeat-input');
  const btn = document.getElementById('sync-auth-submit-btn');
  const errorMsg = document.getElementById('sync-auth-error-msg');
  const successMsg = document.getElementById('sync-auth-success-msg');

  if (!emailInput || !passwordInput) return;
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const repeatPassword = repeatInput ? repeatInput.value.trim() : '';

  if (errorMsg) errorMsg.classList.add('hidden');
  if (successMsg) successMsg.classList.add('hidden');

  if (!email || !email.includes('@')) {
    if (errorMsg) {
      errorMsg.innerText = typeof tr === 'function' ? tr({
        de: 'Bitte gib eine gültige E-Mail-Adresse ein.',
        en: 'Please enter a valid email address.',
        es: 'Introduce una dirección de correo electrónico válida.',
        el: 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email.',
        fr: 'Veuillez saisir une adresse e-mail valide.',
        it: 'Inserisci un indirizzo email valido.'
      }) : 'Bitte gib eine gültige E-Mail-Adresse ein.';
      errorMsg.classList.remove('hidden');
    }
    return;
  }

  const minPassLen = mode === 'register' ? 8 : 1;
  if (!password || password.length < minPassLen) {
    if (errorMsg) {
      errorMsg.innerText = typeof tr === 'function' ? tr({
        de: mode === 'register' ? 'Das Passwort muss mindestens 8 Zeichen lang sein.' : 'Bitte gib dein Passwort ein.',
        en: mode === 'register' ? 'Password must be at least 8 characters long.' : 'Please enter your password.',
        es: mode === 'register' ? 'La contraseña debe tener al menos 8 caracteres.' : 'Por favor, introduce tu contraseña.',
        el: mode === 'register' ? 'Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες.' : 'Παρακαλώ εισάγετε τον κωδικό πρόσβασής σας.',
        fr: mode === 'register' ? 'Le mot de passe doit comporter au moins 8 caractères.' : 'Veuillez saisir votre mot de passe.',
        it: mode === 'register' ? 'La password deve contenere almeno 8 caratteri.' : 'Inserisci la tua password.'
      }) : (mode === 'register' ? 'Das Passwort muss mindestens 8 Zeichen lang sein.' : 'Bitte gib dein Passwort ein.');
      errorMsg.classList.remove('hidden');
    }
    return;
  }

  if (mode === 'register' && repeatInput && repeatPassword && password !== repeatPassword) {
    if (errorMsg) {
      errorMsg.innerText = typeof tr === 'function' ? tr({
        de: 'Die Passwörter stimmen nicht überein.',
        en: 'Passwords do not match.',
        es: 'Las contraseñas no coinciden.',
        el: 'Οι κωδικοί πρόσβασης δεν ταιριάζουν.',
        fr: 'Les mots de passe ne correspondent pas.',
        it: 'Le password non coincidono.'
      }) : 'Die Passwörter stimmen nicht überein.';
      errorMsg.classList.remove('hidden');
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">⏳</span> ${mode === 'register' ? 'Erstelle Konto...' : 'Anmelden...'}`;
  }

  try {
    const authMethod = (mode === 'register' && typeof FlowAuth.signUpWithCredentials === 'function')
      ? FlowAuth.signUpWithCredentials
      : FlowAuth.signInWithCredentials;

    const res = await authMethod(email, password);

    if (res.success) {
      if (res.needEmailConfirm) {
        if (successMsg) {
          successMsg.innerText = res.message || 'Konto erstellt! Bitte prüfe deine E-Mails zur Bestätigung.';
          successMsg.classList.remove('hidden');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(typeof tr === 'function' ? tr({
            de: mode === 'register' ? '✓ Konto erfolgreich erstellt & angemeldet!' : '✓ Erfolgreich angemeldet! Synchronisation läuft...',
            en: mode === 'register' ? '✓ Account created and signed in!' : '✓ Successfully signed in! Syncing...',
            es: '✓ ¡Inicio de sesión correcto!',
            el: '✓ Επιτυχής σύνδεση!',
            fr: '✓ Connexion réussie !',
            it: '✓ Accesso riuscito!'
          }) : '✓ Erfolgreich angemeldet!');
        }
        await cloudSyncEngine.pullState();
      }
    } else {
      if (errorMsg) {
        errorMsg.innerText = res.error || (mode === 'register' ? 'Registrierung fehlgeschlagen.' : 'Anmeldung fehlgeschlagen.');
        errorMsg.classList.remove('hidden');
      }
    }
  } catch (e) {
    if (errorMsg) {
      errorMsg.innerText = 'Verbindungsfehler beim Authentifizieren.';
      errorMsg.classList.remove('hidden');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = mode === 'register'
        ? '<i data-lucide="user-plus" class="w-4 h-4"></i><span>Konto erstellen</span>'
        : '<i data-lucide="log-in" class="w-4 h-4"></i><span>Anmelden</span>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}
window.handleEmailAuth = handleEmailAuth;
window.handleSendMagicLink = handleEmailAuth;

async function handlePasswordReset() {
  const emailInput = document.getElementById('sync-email-input');
  const errorMsg = document.getElementById('sync-auth-error-msg');
  const successMsg = document.getElementById('sync-auth-success-msg');

  if (!emailInput) return;
  const email = emailInput.value.trim();

  if (errorMsg) errorMsg.classList.add('hidden');
  if (successMsg) successMsg.classList.add('hidden');

  if (!email || !email.includes('@')) {
    if (errorMsg) {
      errorMsg.innerText = typeof tr === 'function' ? tr({
        de: 'Bitte gib deine E-Mail-Adresse ein, um das Passwort zurückzusetzen.',
        en: 'Please enter your email address to reset your password.',
        es: 'Introduce tu correo electrónico para restablecer la contraseña.',
        el: 'Εισάγετε το email σας για να επαναφέρετε τον κωδικό πρόσβασης.',
        fr: 'Veuillez saisir votre adresse e-mail pour réinitialiser le mot de passe.',
        it: 'Inserisci il tuo indirizzo email per reimpostare la password.'
      }) : 'Bitte gib deine E-Mail-Adresse ein, um das Passwort zurückzusetzen.';
      errorMsg.classList.remove('hidden');
    }
    return;
  }

  if (typeof FlowAuth !== 'undefined' && FlowAuth.requestPasswordReset) {
    const res = await FlowAuth.requestPasswordReset(email);
    if (res && res.success) {
      if (successMsg) {
        successMsg.innerText = res.message || (typeof tr === 'function' ? tr({
          de: 'E-Mail zum Zurücksetzen wurde gesendet! Bitte prüfe dein Postfach.',
          en: 'Reset email sent! Please check your inbox.',
          es: '¡Correo de restablecimiento enviado! Por favor revisa tu bandeja de entrada.',
          el: 'Το email επαναφοράς στάλθηκε! Ελέγξτε τα εισερχόμενά σας.',
          fr: 'E-mail de réinitialisation envoyé ! Veuillez vérifier votre boîte de réception.',
          it: 'Email di reimpostazione inviata! Controlla la tua casella di posta.'
        }) : 'E-Mail zum Zurücksetzen wurde gesendet! Bitte prüfe dein Postfach.');
        successMsg.classList.remove('hidden');
      }
      if (typeof showToast === 'function') {
        showToast(tr({
          de: '✉️ Reset-Link per E-Mail gesendet!',
          en: '✉️ Reset link sent via email!',
          es: '✉️ ¡Enlace de restablecimiento enviado por correo!',
          el: '✉️ Ο σύνδεσμος επαναφοράς στάλθηκε με email!',
          fr: '✉️ Lien de réinitialisation envoyé par e-mail !',
          it: '✉️ Link di ripristino inviato via email!'
        }));
      }
    } else {
      if (errorMsg) {
        errorMsg.innerText = res.error || 'Fehler beim Zurücksetzen des Passworts.';
        errorMsg.classList.remove('hidden');
      }
    }
  }
}
window.handlePasswordReset = handlePasswordReset;


async function handleManualCloudSync() {
  if (typeof cloudSyncEngine !== 'undefined') {
    const res = await cloudSyncEngine.pullState();
    if (res && res.success) {
      if (typeof showToast === 'function') {
        showToast(tr({
          de: '✓ Synchronisiert',
          en: '✓ Synchronized',
          es: '✓ Sincronizado',
          el: '✓ Συγχρονίστηκε',
          fr: '✓ Synchronisé',
          it: '✓ Sincronizzato'
        }));
      }
    } else {
      if (typeof showToast === 'function') {
        showToast(tr({
          de: '⚠ Synchronisation konnte nicht abgeschlossen werden – wir versuchen es erneut.',
          en: '⚠ Sync could not be completed – retrying.',
          es: '⚠ Error de sincronización – reintentando.',
          el: '⚠ Σφάλμα συγχρονισμού – προσπάθεια ξανά.',
          fr: '⚠ Échec de la synchronisation – nouvel essai.',
          it: '⚠ Sincronizzazione fallita – nuovo tentativo.'
        }));
      }
    }
  }
}
window.handleManualCloudSync = handleManualCloudSync;

// ===== E2E VERSCHLÜSSELUNG UI-CONTROLLER =====
function toggleE2EEncryption(enabled) {
  const wrapper = document.getElementById('sync-e2e-input-wrapper');
  const input = document.getElementById('sync-e2e-passphrase');
  if (enabled) {
    if (wrapper) wrapper.classList.remove('hidden');
    if (input) setTimeout(() => input.focus(), 50);
  } else {
    if (wrapper) wrapper.classList.add('hidden');
    if (typeof NoodleCrypto !== 'undefined') {
      NoodleCrypto.setE2EEnabled(false);
    }
    if (typeof showToast === 'function') {
      showToast('🔓 Ende-zu-Ende-Verschlüsselung deaktiviert.');
    }
  }
}
window.toggleE2EEncryption = toggleE2EEncryption;

async function saveE2EPassphrase() {
  const input = document.getElementById('sync-e2e-passphrase');
  const phrase = input ? input.value.trim() : '';
  if (!phrase || phrase.length < 6) {
    if (typeof showToast === 'function') {
      showToast('⚠️ Die Passphrase muss mindestens 6 Zeichen lang sein.');
    }
    return;
  }

  if (typeof NoodleCrypto !== 'undefined') {
    NoodleCrypto.setE2EEnabled(true, phrase);
    if (input) input.value = '';
    const wrapper = document.getElementById('sync-e2e-input-wrapper');
    if (wrapper) wrapper.classList.add('hidden');

    if (typeof showToast === 'function') {
      showToast('🔒 Ende-zu-Ende-Verschlüsselung aktiv! Neuer Sync wird verschlüsselt.');
    }

    // Sofort verschlüsselten Sync anstoßen
    if (typeof cloudSyncEngine !== 'undefined') {
      cloudSyncEngine.pushState();
    }
  }
}
window.saveE2EPassphrase = saveE2EPassphrase;


async function handleLogout() {
  const msg = tr({
    de: 'Möchtest du dich wirklich abmelden? Deine lokalen Daten bleiben erhalten.',
    en: 'Do you really want to log out? Your local data will be preserved.',
    es: '¿Seguro que quieres cerrar sesión? Tus datos locales se conservarán.',
    el: 'Θέλετε σίγουρα να αποσυνδεθείτε; Τα τοπικά δεδομένα διατηρούνται.',
    fr: 'Voulez-vous vraiment vous déconnecter ? Vos données locales seront conservées.',
    it: 'Vuoi davvero disconnetterti? I tuoi dati locali saranno conservati.'
  });

  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Abmelden?', en: 'Log out?' }) : 'Abmelden?',
    message: msg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Abmelden', en: 'Log out' }) : 'Abmelden',
    isDanger: false,
    icon: 'log-out'
  }) : confirm(msg);

  if (confirmed) {
    if (typeof FlowAuth !== 'undefined') {
      await FlowAuth.signOut();
      if (typeof showToast === 'function') {
        showToast(tr({
          de: 'Erfolgreich abgemeldet.',
          en: 'Successfully logged out.',
          es: 'Sesión cerrada.',
          el: 'Αποσυνδεθήκατε.',
          fr: 'Déconnexion réussie.',
          it: 'Disconnessione riuscita.'
        }));
      }
    }
  }
}
window.handleLogout = handleLogout;

// Initialisierung bei DOMContentLoaded
if (typeof window !== 'undefined') {
  window.MinimalQR = MinimalQR;
  window.cloudSyncEngine = cloudSyncEngine;
  window.openP2PSyncModal = openP2PSyncModal;
  window.closeP2PSyncModal = closeP2PSyncModal;
  window.switchP2PTab = switchP2PTab;
  window.switchSyncModalTab = switchSyncModalTab;
  window.handlePasswordReset = handlePasswordReset;

  window.addEventListener('DOMContentLoaded', () => {
    cloudSyncEngine.init();
  });
}
if (typeof globalThis !== 'undefined') {
  globalThis.MinimalQR = MinimalQR;
  globalThis.cloudSyncEngine = cloudSyncEngine;
  globalThis.openP2PSyncModal = openP2PSyncModal;
  globalThis.closeP2PSyncModal = closeP2PSyncModal;
  globalThis.switchP2PTab = switchP2PTab;
  globalThis.switchSyncModalTab = switchSyncModalTab;
  globalThis.handlePasswordReset = handlePasswordReset;
}
