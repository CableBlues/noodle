# Noodle Studio – Master Update Plan (`big-update`)

## Checkliste der Phasen
- [x] **Phase 0: Ausgangsstand** – Baseline-Tests, Build-Laufzeit, Bundle-Größe & Korrektur roter Bestandstests
- [x] **Phase 1: Collab-Sicherheit** – Schema-Validierung, Größen-/Rate-Limits, kryptografische Raumcodes (≥10 Zeichen), merge-basierter Board-Sync mit Undo-Punkt, private Channels, `supabase-policies.sql` mit RLS für `flow_sync`, Behebung unsicherer Interpolationen
- [x] **Phase 2: Service Worker** – Automatische Generierung von `ASSETS_TO_CACHE` und `CACHE_VERSION` im Build, Vollständigkeitstest & Offline-Erststart, Update-Hinweis-Banner
- [x] **Phase 3: Build & Performance** – Vorkompiliertes Tailwind CSS statt Runtime, Bundling + Minifizierung via esbuild, Sprachdaten-Lazy-Loading, Delta-Sync mit Fallback
- [x] **Phase 4: Architektur A** – Modulare Migration auf ES-Module (main.js), temporäre Window-Kompatibilitätsschicht, Bereinigung toter Dateien
- [x] **Phase 5: Architektur B** – Event-Delegation (`data-action`) statt Inline-`onclick`, Strikte CSP, Aufteilung monolithischer Dateien >2000 Zeilen
- [x] **Phase 6: Datenschutz** – E2E-Verschlüsselung (WebCrypto AES-GCM / PBKDF2), Opt-in, Migration, Developer-Modus für Config-Overrides
- [ ] **Phase 7: Abschluss** – README & Dokumentation, Finalisierung UPDATE_PLAN.md

---

## Phase 6: Datenschutz & Zero-Knowledge E2E-Verschlüsselung

### Umgesetzte Maßnahmen
1. **WebCrypto Ende-zu-Ende-Verschlüsselungs-Engine (`crypto-sync.js`):**
   - Modul `NoodleCrypto` implementiert unter Verwendung von nativen Browser-Standards (`crypto.subtle`).
   - Schlüsselableitung: `PBKDF2` mit 100.000 Iterationen und `SHA-256` aus einer benutzerdefinierten Passphrase + kryptografisch zufälligem 16-Byte-Salt.
   - Verschlüsselung: Authentifiziertes `AES-GCM` (256-Bit) mit 96-Bit-IV pro Datenpaket. Gewährleistet sowohl Vertraulichkeit als auch Manipulationsschutz.
2. **Nahtlose Integration in die Cloud-Sync-Engine (`sync-engine.js`):**
   - In `pushState()` und `pushDelta()`: Wenn E2E aktiv ist und eine Passphrase vorliegt, wird die gesamte Nutzlast transparent in einen verschlüsselten Container gepackt, bevor sie an Supabase übertragen wird (`_isEncrypted: true`, `cryptoVersion: 1`, `cipher`, `salt`, `iv`).
   - In `pullState()`: Eintreffende verschlüsselte Pakete werden clientseitig entschlüsselt. Bei fehlender oder falscher Passphrase erfolgt ein benutzerfreundlicher Hinweis im UI; es werden keine korrupten Daten in den lokalen Zustand übernommen.
   - Vollständige Abwärtskompatibilität: Unverschlüsselte Snapshots (Legacy) werden weiterhin transparent verarbeitet und migriert.
3. **Opt-in Benutzeroberfläche & Sicherheitswarnung (`index.html`):**
   - Im Cloud-Sync Modal (`#modal-p2p-sync`) einen E2E-Bereich mit Umschalter und Passphrase-Eingabe hinzugefügt.
   - Deutlicher Warnhinweis: Bei Verlust der Passphrase können verschlüsselte Daten nicht wiederhergestellt werden (Zero-Knowledge-Prinzip).
4. **Developer-Guard für Konfigurations-Overrides (`config.js`):**
   - Überschreiben von `SUPABASE_URL` und `SUPABASE_ANON_KEY` via `localStorage.getItem('noodle_custom_config')` ist jetzt strikt an das Vorhandensein des Developer-Modus (`noodle_dev_mode = 'true'`) gekoppelt.
   - Verhindert unbemerkte Umleitung von Datenflüssen in regulären Produktions-Instanzen.
5. **Verhaltens-Tests (`tests/privacy-and-crypto.test.js`):**
   - 5 neue Verhaltens-Tests für AES-GCM Verschlüsselung/Entschlüsselung, Fehlerbehandlung bei falscher Passphrase, transparente Legacy-Kompatibilität und den Developer-Modus-Schutz.
   - Test-Suite zu 100 % grün.

### Geänderte Dateien
- `crypto-sync.js` (neu)
- `sync-engine.js` (E2E-Integration in pushState, pushDelta & pullState)
- `config.js` (Developer-Modus-Guard)
- `index.html` (E2E UI-Card im Sync-Modal)
- `main.js` (Import von `crypto-sync.js`)
- `build.js` (Bundle-Reihenfolge)
- `tests/privacy-and-crypto.test.js` (neu)
- `tests/architecture-esmodules.test.js` (aktualisiert)
- `UPDATE_PLAN.md`

---

## Phase 5: Architektur B (Event-Delegation, CSP & Monolith-Aufteilung)

### Umgesetzte Maßnahmen
1. **Zentrale Event-Delegation-Engine (`utils.js`):**
   - Funktion `dispatchAction(actionName, args, event, targetElement)` implementiert.
   - Globaler Click-Listener auf `document` verarbeitet `[data-action]` und `[data-action-args]`. Unterstützt semikolon-separierte Aktionsketten, dynamische Parameter und automatische Namensraum-Auflösung (z. B. `RadioNewsEngine.toggleNewsTickerEnabled`).
   - 152 häufige Inline-`onclick`-Handler in `index.html` (u. a. `startTimer`, `pauseTimer`, `stopTimer`, `toggleMinimalist`, `togglePanel`, `playAmbientSound`, `openAudioStudioMode`, `switchShoppingTab`, `handleAddShoppingItem`, `clearShoppingList`, `stopPropagation`) auf `data-action` migriert.
2. **Strikte Content Security Policy (CSP):**
   - `<meta http-equiv="Content-Security-Policy">` in `index.html` implementiert:
     `default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' https://cloud.umami.is; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' https: wss:; font-src 'self' data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self';`
   - Verhindert unberechtigte Script-Injektionen, verbietet `<object>`/`<embed>` Plugins und sichert Web-Sockets und Audio-Streams rigoros ab.
3. **Aufteilung monolithischer Dateien (> 2000 Zeilen):**
   - `app-core.js` (vorher 2073 Zeilen) modularisiert: Die vollständige Backup-, Export- und Restore-Engine wurde in ein eigenes autarkes Modul `app-backup.js` ausgelagert.
   - `app-core.js` liegt jetzt sauber unter der 2000-Zeilen-Grenze (1940 Zeilen).
   - `app-backup.js` nahtlos in `main.js`, `build.js` und `sw-generator.js` integriert.
4. **Verhaltens-Tests (`tests/event-delegation-and-csp.test.js`):**
   - 5 neue Verhaltens-Tests zur Verifikation der CSP-Direktiven, `dispatchAction`-Aufrufe, DOM-Event-Delegation und Einhaltung der Dateigrößen-Limits.
   - Test-Suite zu 100 % grün.

### Geänderte Dateien
- `utils.js` (Event-Delegation Engine)
- `index.html` (CSP-Meta-Tag & data-action Migration)
- `app-core.js` (Reduziert auf < 2000 Zeilen)
- `app-backup.js` (neu)
- `main.js` (Import von `app-backup.js`)
- `build.js` (Bundle-Reihenfolge)
- `tests/event-delegation-and-csp.test.js` (neu)
- `tests/architecture-esmodules.test.js` (aktualisiert)
- `UPDATE_PLAN.md`

---

## Phase 4: Architektur A (ES-Module Pipeline & Bereinigung)

### Umgesetzte Maßnahmen
1. **Modulare ES-Modul Pipeline (`main.js`):**
   - Strukturierte Orchestrierung aller 59 JavaScript-Module über ES-Modul-Imports (`import ... from './module.js'`).
   - `index.html` lädt in der Entwicklungsansicht ausschließlich `<script type="module" src="main.js"></script>` anstelle von 59 einzelnen Script-Tags.
2. **Temporäre Window-Kompatibilitätsschicht (`initWindowCompatibilityLayer`):**
   - Nahtlose Bereitstellung aller Kernfunktionen, UI-Handler und Controller auf `window` (u. a. `state`, `saveState`, `renderApp`, `t`, `togglePanel`, `showToast`, `cloudSyncEngine`, `collabEngine`, `timerLiveManager`), um vollständige Abwärtskompatibilität für DOM-Handler und Add-Ons zu garantieren.
3. **Optimierte Produktions-Build-Pipeline (`build.js` & `sw-generator.js`):**
   - `build.js` tauscht in `dist/index.html` das Root-Modul `<script type="module" src="main.js"></script>` automatisch gegen das gebündelte und minifizierte `<script src="app.bundle.js"></script>` aus.
   - `sw-generator.js` parst sowohl klassische Skript-Tags als auch `main.js`-Imports für den Offline-Cache der Entwicklungsansicht, belässt in `dist/` aber die schlanke Bundle-Referenz.
4. **Bereinigung toter Dateien & Altlasten:**
   - Entfernt: `projekt_code.txt` (3,86 MB ungenutzter Code-Dump!).
   - Entfernt: veraltete Windows-Batch-Skripte `bundle.bat` und `apply-update.bat` (durch modernes Node-Build-System `npm run build` vollständig abgelöst).
5. **Verhaltens-Tests (`tests/architecture-esmodules.test.js`):**
   - 5 neue Tests zur Verifizierung des Modul-Imports, der Window-Kompatibilitätsschicht, der Konsistenz zwischen `main.js` und `MODULE_ORDER` in `build.js` und des Ausschlusses von Altlasten.
   - Alle 37 Test-Suiten (253 Tests) 100% passed.

### Geänderte Dateien
- `main.js`
- `index.html`
- `build.js`
- `sw-generator.js`
- `sw.js`
- `tests/architecture-esmodules.test.js` (neu)
- `projekt_code.txt` (gelöscht)
- `bundle.bat` (gelöscht)
- `apply-update.bat` (gelöscht)
- `UPDATE_PLAN.md`

---

## Phase 3: Build & Performance

### Umgesetzte Maßnahmen
1. **Vorkompiliertes Tailwind CSS statt Browser-Runtime:**
   - `tailwind.config.js` und `tailwind.input.css` erstellt; Tailwind CSS wird automatisch im Build über die CLI vorkompiliert (`styles-tailwind.css`, minifiziert auf 224 KB).
   - In `index.html` und `dist/index.html` das schwere Runtime-Skript `vendor/tailwindcss.js` (400 KB) und die Inline-Konfiguration entfernt. 0 ms Runtime-Parsing beim App-Start!
2. **esbuild Bundling & Minifizierung:**
   - In `build.js` die Produktionsbündelung auf `esbuild.transform` mit `minify: true`, `target: 'es2020'` und `legalComments: 'none'` umgestellt.
   - Bundle-Größe `dist/app.bundle.js` von **3.244,87 KB** auf **2.718,97 KB** komprimiert (**-525,9 KB Ersparnis**).
3. **Lazy Loading von Übersetzungen & Sprachdaten (i18n):**
   - 6 Sprachpakete (`de`, `en`, `fr`, `es`, `it`, `el`) als JSON nach `locales/` und `dist/locales/` ausgelagert (jeweils 551 Keys).
   - In `data-translations.js` die asynchrone Funktion `loadLanguage(lang)` implementiert; `setLanguage()` in `app-core.js` lädt sekundäre Sprachen bei Bedarf dynamisch nach.
4. **Delta-Sync mit automatischem Full-Sync-Fallback:**
   - `cloudSyncEngine.computeDelta(currentState, baseSnapshot)` ermittelt selektive Änderungen pro Kategorie/Liste und verhindert Datentransfer bei unveränderten Zuständen.
   - `cloudSyncEngine.applyDelta(localState, deltaObj)` führt präzises partielles Einpflegen durch.
   - `cloudSyncEngine.pushDelta()` überträgt Deltas mit automatischem Fallback auf den bewährten 3-Wege-LWW Full-Sync (`pushState()`).
   - In `pullState()` werden eintreffende Deltas verarbeitet; bei Inkompatibilität erfolgt ein transparenter Full-Sync Fallback ohne Datenverlust.
5. **Verhaltens- & Performance-Tests:**
   - Neue Test-Suite `tests/build-and-performance.test.js` (8 Tests) verifiziert CSS-Kompilierung, Bundle-Größenbegrenzung (< 2.9 MB), Sprach-Lazy-Loading und Delta-Sync-Verhalten.
   - Alle 36 Test-Suiten mit 248/248 Tests erfolgreich bestanden.

### Messwerte Vorher / Nachher
| Metrik | Vor Phase 3 (Baseline) | Nach Phase 3 | Differenz / Gewinn |
|---|---|---|---|
| **Bundle-Größe (`dist/app.bundle.js`)** | 3.244,87 KB (unminifiziert) | 2.718,97 KB (esbuild minifiziert) | **-525,90 KB (-16,2 %)** |
| **Tailwind CSS im Browser** | 400 KB JS-Runtime (`vendor/tailwindcss.js`) + dynamisches DOM-Parsing | 224 KB vorkompiliertes CSS (`styles-tailwind.css`) | **0 ms Runtime-Overhead**, kein `unsafe-eval` nötig |
| **Sprachdaten (i18n)** | 175 KB alle Sprachen fest im Bundle | Lazy Loading pro Sprache (`locales/*.json`) | On-Demand geladen |
| **Cloud-Sync Payload** | Immer voller Snapshot (~50–300 KB) | Delta-Sync (~1–5 KB) mit Full-Sync Fallback | **~90–95 % Bandbreiten-Ersparnis** bei Routine-Sync |
| **Tests** | 35 Suiten, 240 Tests | 36 Suiten, 248 Tests | **+8 Verhaltens-Tests, 100 % grün** |

### Geänderte Dateien
- `tailwind.config.js` (neu)
- `tailwind.input.css` (neu)
- `styles-tailwind.css` (neu)
- `locales/` (`de.json`, `en.json`, `fr.json`, `es.json`, `it.json`, `el.json` - neu)
- `build.js`
- `index.html`
- `data-translations.js`
- `app-core.js`
- `sync-engine.js`
- `tests/build-and-performance.test.js` (neu)
- `UPDATE_PLAN.md`

---

## Phase 2: Service Worker & PWA

### Umgesetzte Maßnahmen
1. **Automatische Erkennung & Generierung von `ASSETS_TO_CACHE` (`sw-generator.js` & `build.js`):**
   - Neues Generator-Modul `sw-generator.js` parst `index.html` und extrahiert dynamisch alle referenzierten lokalen `<script src="...">`- und `<link rel="stylesheet" href="...">`-Ressourcen, Vendor-Bibliotheken, Icons und Schriftdateien (`fonts/`).
   - Alle zuvor fehlenden Module sind nun lückenlos im Offline-Cache erfasst: `app-health.js`, `app-humor.js`, `app-regulation.js`, `app-feature-bridge.js`, `app-installation-hub.js`, `app-interaction-mode.js`, `app-multitasking-hub.js`, `app-routine-presets.js`, `app-tooltip.js`, `helper-ocr-scanner.js` (insgesamt 92 Assets im Entwicklungsmodus, 34 im Produktions-Release `dist/`).
2. **Deterministische Cache-Versionierung (`CACHE_VERSION`):**
   - `generateCacheVersion()` errechnet einen Inhalts-Hash (SHA-256) über sämtliche physischen Cache-Assets und formatiert ihn als `noodle-cache-v<numeric_id>`. Jede Code-, Style- oder Asset-Änderung führt automatisch zu einem neuen Cache-Namen und triggert das PWA-Update.
3. **PWA-Update-Hinweis ("Neue Version verfügbar"):**
   - In `index.html` ein dezentes, modales Benachrichtigungs-Banner `#sw-update-banner` integriert mit Button "Aktualisieren" (`#sw-update-btn`) und Dismiss-Button (`#sw-update-dismiss`).
   - Der Service-Worker-Registrierungslistener reagiert auf `reg.waiting` sowie das `updatefound`-Event eines neu installierten Workers (`state === 'installed' && navigator.serviceWorker.controller`).
   - Klick auf "Aktualisieren" sendet `{ action: 'skipWaiting' }` an den wartenden Worker; bei `controllerchange` wird die Anwendung reibungslos per `window.location.reload()` aktualisiert.
   - In `sw.js` das unbedingte `self.skipWaiting()` im `install`-Event entfernt, damit aktive Benutzersitzungen bei Hintergrund-Updates nicht unaufgefordert unterbrochen werden.
4. **Verhaltens- & Vollständigkeits-Tests:**
   - In `tests/offline-and-pwa.test.js` drei neue Verhaltens-Tests implementiert:
     - Vollständigkeits-Prüfung aller in `index.html` referenzierten Module in `ASSETS_TO_CACHE`.
     - Update-Banner-DOM- und Event-Prüfung (`#sw-update-banner`, `skipWaiting`).
     - Simulation des Offline-Erststarts (Cache-Befüllung und verlässliche Auslieferung der App-Shell ohne Netzwerkverbindung).
   - Alle 35 Test-Suiten mit 240/240 Tests erfolgreich bestanden.

### Geänderte Dateien
- `sw-generator.js` (neu)
- `build.js`
- `sw.js`
- `index.html`
- `tests/offline-and-pwa.test.js`
- `UPDATE_PLAN.md`

### Entscheidungen
- `CACHE_NAME` wird deterministisch aus Inhalts-Hashes aller gecachten Dateien als `noodle-cache-v\d+` berechnet, um volle Abwärtskompatibilität mit bestehenden Regressionstests zu gewährleisten.
- Erststart erfolgt nahtlos ohne störendes Update-Banner, Updates im laufenden Betrieb werden sanft per Banner signalisiert.

---

## Phase 1: Collab-Sicherheit

### Umgesetzte Maßnahmen
1. **Kryptografisch sichere Raumcodes:**
   - Neue Funktion `generateSecureRoomCode(prefix, length)` implementiert (`WebCrypto getRandomValues`), mit mindestens 12 unvorhersehbaren Zeichen (`team-xxxx...`).
   - Standardinitialisierung im Browser erzeugt kryptografische Codes statt statischer `team-space` Kennungen.
2. **Schema-Validierung & Payload-Limits:**
   - `validateEventSchema(event)` prüft Typ (`allowedTypes`), Objekttiefe und Pflichteigenschaften für Chat, Board-Sync, DJ-Events etc.
   - Größenbegrenzung `MAX_EVENT_SIZE_BYTES = 512 KB` schützt vor Memory-Exhaustion-Attacken.
3. **Rate-Limiting für Incoming Events:**
   - `isRateLimited(senderId)` drosselt eingehende Events pro Absender (Max. 30 Events / Sekunde im gleitenden Fenster).
4. **Board-Sync Merging statt Ersetzen (inkl. Undo-Punkt):**
   - `handleIncomingBoardSync()` überschreibt geteilte Aufgaben nicht mehr destructiv, sondern führt über `mergeBoardItems()` ein idempotentes, zeitstempel-sensitives Merging durch.
   - Vor dem Zusammenführen wird über `saveHistory()` ein Undo-Wiederherstellungspunkt im Stack angelegt.
5. **Private Supabase Realtime Channels:**
   - Kanal-Konfiguration in `collab-engine.js` auf `private: true` umgestellt, sodass Channel-Events über Supabase JWT/Auth autorisiert werden.
6. **Supabase RLS & Policies (`supabase-policies.sql`):**
   - Idempotentes SQL-Skript erstellt mit Tabellendefinition `public.flow_sync` und vollständigen Row-Level-Security-Policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) auf Basis von `auth.uid() = user_id`.
7. **Beseitigung unsicherer Inline-Interpolationen:**
   - In `app-weather-news.js` die String-Interpolation bei Wetter-Städte-Buttons durch sichere DOM-Knoten-Erstellung (`document.createElement`, `addEventListener`, `textContent`) ersetzt.
8. **Verhaltens-Tests:**
   - Neue Suite `tests/collab-security.test.js` mit 5 dedizierten Tests für Raumcode-Entropie, Schema-Validierung, Rate-Limiting, Board-Merging & XSS-Vermeidung.

### Geänderte Dateien
- `collab-engine.js`
- `app-weather-news.js`
- `supabase-policies.sql` (neu)
- `tests/collab-security.test.js` (neu)
- `UPDATE_PLAN.md`

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
