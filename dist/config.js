/**
 * @file config.js
 * @module Config
 * @description
 * Zentrale Laufzeitkonfiguration für Noodle Studio.
 * Definiert API-Endpunkte für die optionale Cloud-Synchronisation (Supabase),
 * Synchronisationsintervalle sowie Feature-Flags. Kann für Self-Hosting-Instanzen
 * über `localStorage` (`noodle_custom_config`) oder Window-Variablen überschrieben werden.
 */

(function() {
  const DEFAULT_CONFIG = {
    // Supabase Projekt-Konfiguration (vom Admin / Host anpassbar oder via Env/Storage überschreibbar)
    SUPABASE_URL: (typeof window !== 'undefined' && (window.__NOODLE_SUPABASE_URL || window.__FLOW_SUPABASE_URL)) || 'https://myrnwelpewgnyejylgna.supabase.co',
    SUPABASE_ANON_KEY: (typeof window !== 'undefined' && (window.__NOODLE_SUPABASE_ANON_KEY || window.__FLOW_SUPABASE_ANON_KEY)) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cm53ZWxwZXdnbnllanlsZ25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzA0MTYsImV4cCI6MjEwMDA0NjQxNn0.Xy6UnBLMw9nbiSxBJMHwiyXt7f_H4GeaEKUipKaCUq4',
    
    // Auto-Sync Intervall (ms)
    AUTO_SYNC_INTERVAL_MS: 30000,

    // --- Monetarisierung (Stand: vorbereitet, aber inaktiv) ---
    // WICHTIG: Erst auf true stellen, wenn Impressum, Datenschutzerklärung
    // (inkl. Werbepartner-Abschnitt), AGB, Widerrufsbelehrung UND ein
    // Cookie-Consent-Banner (falls Werbung mit Tracking genutzt wird)
    // fertig und veröffentlicht sind.
    MONETIZATION_ENABLED: false,
    ADS_ENABLED: false
  };

  // Erlaube optionales lokales Überschreiben für Entwickler / Self-Host-Instanzen
  try {
    if (typeof localStorage !== 'undefined') {
      const storedConfig = localStorage.getItem('noodle_custom_config') || localStorage.getItem('flow_custom_config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        if (parsed && typeof parsed === 'object') {
          Object.assign(DEFAULT_CONFIG, parsed);
        }
      }
    }
  } catch (e) {
    // Ignorieren falls localStorage gesperrt oder ungültig
  }

  // ============================================================================
  // ACHTUNG: MONETIZATION_ENABLED / ADS_ENABLED erst aktivieren, wenn:
  // 1. Impressum & Datenschutzerklärung final sind (inkl. Zahlungsanbieter
  //    und ggf. Werbepartner als Abschnitt)
  // 2. AGB + Widerrufsbelehrung für digitale Inhalte vorhanden sind
  // 3. Bei ADS_ENABLED zusätzlich: ein echtes Cookie-Consent-Banner existiert,
  //    das VOR dem Laden des Werbe-SDKs eine Einwilligung einholt
  // ============================================================================

  if (typeof window !== 'undefined') {
    window.NOODLE_CONFIG = DEFAULT_CONFIG;
    window.FLOW_CONFIG = DEFAULT_CONFIG;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.NOODLE_CONFIG = DEFAULT_CONFIG;
    globalThis.FLOW_CONFIG = DEFAULT_CONFIG;
  }
})();
