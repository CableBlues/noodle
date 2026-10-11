/**
 * @file storage.js
 * @module StorageAbstraction
 * @description
 * Dual-Storage Resilienz-Vault (`AppStorage`):
 * - Synchroner Primärzugriff über `localStorage` für verzögerungsfreies UI-Rendering
 * - Asynchroner IndexedDB-Sicherheitsspiegel (`IDB_VAULT`) gegen Browser-Storage-Eviction (z. B. Safari ITP)
 * - Automatische Wiederherstellung (`hydrateFromVault`) beim App-Start
 * - Sichere JSON-Serialisierung und Quota-Überwachung
 */

// 1. IndexedDB Vault (Asynchroner Sicherheitsspiegel gegen Safari/Mobile Eviction)
const IDB_VAULT = {
  dbPromise: null,
  getDB() {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        let finished = false;
        const timer = setTimeout(() => {
          if (!finished) {
            finished = true;
            this.dbPromise = null;
            resolve(null);
          }
        }, 1500);

        try {
          const req = indexedDB.open('noodle_resilience_vault', 1);
          req.onupgradeneeded = (e) => {
            try {
              const db = e.target.result;
              if (db && !db.objectStoreNames.contains('keyval')) {
                db.createObjectStore('keyval');
              }
            } catch (err) {
              // Graceful upgrade catch
            }
          };
          req.onsuccess = (e) => {
            if (!finished) {
              finished = true;
              clearTimeout(timer);
              resolve(e.target.result);
            }
          };
          req.onerror = () => {
            if (!finished) {
              finished = true;
              clearTimeout(timer);
              this.dbPromise = null;
              resolve(null);
            }
          };
          req.onblocked = () => {
            if (!finished) {
              finished = true;
              clearTimeout(timer);
              this.dbPromise = null;
              resolve(null);
            }
          };
        } catch (e) {
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            this.dbPromise = null;
            resolve(null);
          }
        }
      });
    }
    return this.dbPromise;
  },

  async set(key, value) {
    try {
      const db = await this.getDB();
      if (!db) return;
      const tx = db.transaction('keyval', 'readwrite');
      tx.onerror = () => {};
      tx.onabort = () => {};
      tx.objectStore('keyval').put(value, key);
    } catch (e) {
      // Stiller Fehler im Hintergrund
    }
  },

  async get(key) {
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('keyval', 'readonly');
          tx.onerror = () => resolve(null);
          tx.onabort = () => resolve(null);
          const req = tx.objectStore('keyval').get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch (err) {
          resolve(null);
        }
      });
    } catch (e) {
      return null;
    }
  },

  async getAllKeys() {
    try {
      const db = await this.getDB();
      if (!db) return [];
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('keyval', 'readonly');
          tx.onerror = () => resolve([]);
          tx.onabort = () => resolve([]);
          const req = tx.objectStore('keyval').getAllKeys();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (err) {
          resolve([]);
        }
      });
    } catch (e) {
      return [];
    }
  },

  async remove(key) {
    try {
      const db = await this.getDB();
      if (!db) return;
      const tx = db.transaction('keyval', 'readwrite');
      tx.onerror = () => {};
      tx.onabort = () => {};
      tx.objectStore('keyval').delete(key);
    } catch (e) {}
  }
};

const AppStorage = {
  get(key, defaultValue = null) {
    try {
      if (typeof localStorage === 'undefined') return defaultValue;
      const val = localStorage.getItem(key);
      if (val === null || val === undefined) return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`[AppStorage] Fehler beim Lesen von '${key}':`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      if (typeof localStorage === 'undefined') return false;
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      // Asynchrone Spiegelung in IndexedDB
      IDB_VAULT.set(key, value);
      return true;
    } catch (e) {
      console.error(`[AppStorage] Fehler beim Schreiben von '${key}':`, e);
      // Notfall-Trim bei QuotaExceededError
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || String(e).includes('QuotaExceeded'))) {
        try {
          const hist = localStorage.getItem('flow_history');
          if (hist) localStorage.removeItem('flow_history');
          const backup = localStorage.getItem('flow_backup_before_sync');
          if (backup) localStorage.removeItem('flow_backup_before_sync');
          localStorage.setItem(key, JSON.stringify(value));
          IDB_VAULT.set(key, value);
          return true;
        } catch (retryErr) {}
      }
      IDB_VAULT.set(key, value);
      return false;
    }
  },

  getString(key, defaultValue = '') {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : defaultValue;
    } catch (e) {
      console.warn(`[AppStorage] Fehler beim Lesen des Strings '${key}':`, e);
      return defaultValue;
    }
  },

  setString(key, value) {
    try {
      localStorage.setItem(key, String(value));
      IDB_VAULT.set(key, String(value));
      return true;
    } catch (e) {
      console.error(`[AppStorage] Fehler beim Schreiben des Strings '${key}':`, e);
      IDB_VAULT.set(key, String(value));
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      IDB_VAULT.remove(key);
      return true;
    } catch (e) {
      console.warn(`[AppStorage] Fehler beim Löschen von '${key}':`, e);
      return false;
    }
  },

  // Resilienz-Prüfung bei App-Start: Stellt Daten still im Hintergrund wieder her, falls Browser-Storage (z. B. Safari ITP) geleert wurde
  async initResilience() {
    try {
      if (typeof localStorage === 'undefined') return false;
      let hasValidData = false;
      const primaryKey = (typeof window !== 'undefined' && window.STORE_KEY) || 'flowPlannerV3';
      const rawPrimary = localStorage.getItem(primaryKey);
      const rawV3 = localStorage.getItem('flow_state_v3');
      const rawV2 = localStorage.getItem('flow_items_v2');

      const candidateRaw = rawPrimary || rawV3 || rawV2;
      if (candidateRaw) {
        try {
          const parsed = JSON.parse(candidateRaw);
          if (parsed && typeof parsed === 'object') {
            hasValidData = true;
          }
        } catch (parseErr) {
          hasValidData = false;
        }
      }

      if (!hasValidData) {
        const idbKeys = await IDB_VAULT.getAllKeys();
        if (idbKeys && idbKeys.length > 0) {
          let restoredPrimary = false;
          for (const key of idbKeys) {
            const val = await IDB_VAULT.get(key);
            if (val !== null && val !== undefined) {
              if (typeof val === 'string') {
                localStorage.setItem(key, val);
              } else {
                localStorage.setItem(key, JSON.stringify(val));
              }
              if (key === primaryKey || key === 'flow_state_v3') {
                restoredPrimary = true;
              }
            }
          }
          if (restoredPrimary && typeof loadState === 'function' && typeof renderApp === 'function') {
            state = loadState();
            if (typeof window !== 'undefined') window.state = state;
            renderApp();
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('[AppStorage] Resilienz-Initialisierung Notiz:', e);
    }
    return false;
  }
};

// Automatischer Resilienz-Check beim Laden
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    AppStorage.initResilience();
  });
}

const ErrorDiagnostics = {
  logs: [],
  record(type, error) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message: error ? (error.message || String(error)) : 'Unknown',
      stack: error ? error.stack : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    };
    this.logs.unshift(entry);
    if (this.logs.length > 20) this.logs.pop();
  },
  capture(msg, details) {
    this.record('manual', { message: msg, details });
  },
  getLogs() {
    return this.logs;
  },
  export() {
    return JSON.stringify(this.logs, null, 2);
  }
};

window.addEventListener('error', (event) => {
  console.error('[Noodle Global Error Boundary]:', event.error || event.message);
  ErrorDiagnostics.record('error', event.error || event.message);
  const appContainer = document.getElementById('app');
  if (appContainer && appContainer.innerHTML.trim() === '') {
    showCrashRecoveryScreen(event.message);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Noodle Unhandled Promise Rejection]:', event.reason);
  ErrorDiagnostics.record('unhandledrejection', event.reason);
});

function showCrashRecoveryScreen(errorMsg = '') {
  let overlay = document.getElementById('noodle-crash-recovery-overlay') || document.getElementById('flow-crash-recovery-overlay');
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'noodle-crash-recovery-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:#0d0d14;color:#fff;z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;text-align:center;';
  overlay.innerHTML = `
    <div style="max-width:440px;background:#151522;border:1px solid rgba(168,85,247,0.3);padding:32px;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.8);">
      <div style="font-size:3rem;margin-bottom:12px;">🍜</div>
      <h2 style="font-size:1.3rem;font-weight:bold;margin-bottom:8px;">Noodle sicher neu starten</h2>
      <p style="font-size:0.85rem;color:#a1a1aa;margin-bottom:20px;line-height:1.5;">Ein Browser-Skript hat sich kurz verschluckt. Deine Aufgaben und Daten sind sicher gespeichert.</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button onclick="window.location.reload()" style="padding:12px 20px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;border:none;border-radius:12px;font-weight:bold;cursor:pointer;font-size:0.9rem;">App neu laden 🔄</button>
        <button onclick="window.location.reload(true)" style="padding:10px 16px;background:rgba(255,255,255,0.06);color:#ccc;border:1px solid rgba(255,255,255,0.12);border-radius:12px;cursor:pointer;font-size:0.8rem;">Sicherer Neustart 🛡️</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

if (typeof window !== 'undefined') {
  window.IDB_VAULT = IDB_VAULT;
  window.AppStorage = AppStorage;
  window.ErrorDiagnostics = ErrorDiagnostics;
  window.showCrashRecoveryScreen = showCrashRecoveryScreen;
}
if (typeof globalThis !== 'undefined') {
  globalThis.IDB_VAULT = IDB_VAULT;
  globalThis.AppStorage = AppStorage;
  globalThis.ErrorDiagnostics = ErrorDiagnostics;
  globalThis.showCrashRecoveryScreen = showCrashRecoveryScreen;
}

