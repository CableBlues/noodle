# Noodle Studio – Master Update Plan (`big-update`)

## Checkliste der Phasen
- [x] **Phase 0: Ausgangsstand** – Baseline-Tests, Build-Laufzeit, Bundle-Größe & Korrektur roter Bestandstests
- [ ] **Phase 1: Collab-Sicherheit** – Schema-Validierung, Größen-/Rate-Limits, kryptografische Raumcodes (≥10 Zeichen), merge-basierter Board-Sync mit Undo-Punkt, private Channels, `supabase-policies.sql` mit RLS für `flow_sync`, Behebung unsicherer Interpolationen
- [ ] **Phase 2: Service Worker** – Automatische Generierung von `ASSETS_TO_CACHE` und `CACHE_VERSION` im Build, Vollständigkeitstest & Offline-Erststart, Update-Hinweis-Banner
- [ ] **Phase 3: Build & Performance** – Vorkompiliertes Tailwind CSS statt Runtime, Bundling + Minifizierung via esbuild, Sprachdaten-Lazy-Loading, Delta-Sync mit Fallback
- [ ] **Phase 4: Architektur A** – Modulare Migration auf ES-Module (main.js), temporäre Window-Kompatibilitätsschicht, Bereinigung toter Dateien
- [ ] **Phase 5: Architektur B** – Event-Delegation (`data-action`) statt Inline-`onclick`, Strikte CSP, Aufteilung monolithischer Dateien >2000 Zeilen
- [ ] **Phase 6: Datenschutz** – E2E-Verschlüsselung (WebCrypto AES-GCM / PBKDF2), Opt-in, Migration, Developer-Modus für Config-Overrides
- [ ] **Phase 7: Abschluss** – README & Dokumentation, Finalisierung UPDATE_PLAN.md

---

## Phase 0: Ausgangsstand

### Messwerte Baseline
- **Tests vorher:** 34 Test-Dateien, 28 passed, 6 failed (7 Tests fehlgeschlagen, 1 unhandled error)
- **Tests nachher (Phase 0 Fixes):** 34 Test-Dateien, 34 passed, 0 failed (232 Tests passed, 0 unhandled errors)
- **Build-Dauer:** 2.847 ms (`npm run build`)
- **Bundle-Größen (`dist/`):**
  - Gesamtdateien: 140 Dateien, 64,57 MB (inkl. statische MP3/Audio/Font-Assets)
  - `dist/app.bundle.js`: 3.244,87 KB (~3,16 MB unminifiziert)
  - `dist/index.html`: 593,66 KB

### Analysierte Bestandstests & Fehlerbehebungen
1. **Unhandled Rejection in `audio-player.js` (`isPlayerMuted is not defined`)**
   - *Problem:* `getMusicTargetVolume()` griff global auf `isPlayerMuted` zu, was bei isolierten Testläufen ohne `audio-core.js` zu einem `ReferenceError` führte.
   - *Fix:* Sichere Erkennung `(typeof isPlayerMuted !== 'undefined') ? Boolean(isPlayerMuted) : false`.
2. **`multitasking-and-snap.test.js` (`unsnaps window cleanly back to default flow`)**
   - *Problem:* `unsnapWindow()` säuberte `winBox.style`, wenn jedoch `el` und `winBox` getrennt waren, blieben `left` oder `width` auf `el` stehen.
   - *Fix:* Inline-Styles für `left`, `top`, `width`, `height` explizit auch auf `el` zurücksetzen.
3. **`news-and-feature-hints.test.js` (`provides verified HTTPS streams and multi-stream failover`)**
   - *Problem:* Station `kexp` hatte nur 2 Stream-URLs definiert; die Spezifikation fordert mindestens 3 Failover-Streams.
   - *Fix:* Dritten Stream-Kandidaten ergänzt.
4. **`routine-presets.test.js` (`applies routine presets directly and updates board state`)**
   - *Problem:* Test erwartete veraltete 4 Standardaufgaben für das Preset `minimalist`, definiert waren im Datenmodell aber die 3 Kernaufgaben `['Zähne morgens', 'Bett machen', 'Zähne abends']`.
   - *Fix:* Test-Erwartung an die offizielle Preset-Struktur angepasst.
5. **`ui-and-components.test.js` (Putz-Guide Besen-Emoji `🧹`)**
   - *Problem:* `transferCleaningStepsToBoard()` übertrug den reinen Titel ohne vorangestelltes `🧹`-Icon, das die Board-Task-Identifikation für Putzschritte kennzeichnet.
   - *Fix:* Voranstellen von `🧹 ` bei der Übernahme in das Board ergänzt.
6. **`ui-and-components.test.js` (Board-Steuerelement-IDs)**
   - *Problem:* `btn-board-columns` und `btn-board-reset` wurden in ein Überlauf-Menü "Karten verwalten" verlegt, die IDs fehlten jedoch an den Dropdown-Buttons.
   - *Fix:* IDs `btn-board-reset` und `btn-board-columns` an den entsprechenden Buttons in `index.html` hinterlegt.
7. **`mobile-and-tablet.test.js` (Mobile Tools Parity)**
   - *Problem:* Test erwartete veraltete Modal-Aufrufe `openShoppingModal()` / `openRecipeModal()` / `openPantryModal()`, während das System auf `togglePanel('shopping')` und `togglePanel('cooking')` migriert wurde.
   - *Fix:* Test auf die aktuellen Architektur-Methoden angepasst.
8. **`audio-and-sequencer.test.js` (`setTimerAudioMode toggles off on same mode`)**
   - *Problem:* In `timer-3.js` wurde die Umschaltung auf `'silent'` versehentlich überschrieben (`if (newMode === 'silent') newMode = 'ambient'`).
   - *Fix:* Ursprüngliche Toggle-Logik (`if (!specificChoice && currentMode === mode && mode !== 'silent') newMode = 'silent';`) wiederhergestellt.

### Geänderte Dateien
- `app-multitasking-hub.js`
- `app-radio-news.js`
- `audio-player.js`
- `helper-cleaning.js`
- `index.html`
- `timer-3.js`
- `tests/mobile-and-tablet.test.js`
- `tests/routine-presets.test.js`
- `UPDATE_PLAN.md`

### Entscheidungen
- Portable Node.js (v20.18.0) & GitHub Desktop Git im lokalen Pfad eingerichtet, um autonome Ausführung zu garantieren.
- Alle 34 Testsuiten sind grün (232 / 232 bestanden). Keine Regressionen.
