# Noodle Studio

**Noodle Studio** ist eine lokal-erste (Local-First), datenschutzfreundliche Progressive Web App (PWA) für Tagesplanung, Fokus-Steuerung und Selbstorganisation. Die Anwendung kombiniert ein adaptives Kanban-Board (Privat, Arbeit, Studium, Team-Space) mit einer prozeduralen WebAudio-Klangsynthese, einem ausfallsicheren Live-Radio- und Nachrichten-System sowie spezialisierten Werkzeugen zur Unterstützung exekutiver Funktionen.

---

## Inhaltsverzeichnis

1. [Architektur-Prinzipien](#architektur-prinzipien)
2. [Technischer Überblick & Highlights](#technischer-überblick--highlights)
3. [Projektstruktur & Modul-Übersicht](#projektstruktur--modul-übersicht)
4. [Installation & Entwicklung](#installation--entwicklung)
5. [Build-Pipeline & Deployment](#build-pipeline--deployment)
6. [Qualitätssicherung & Tests](#qualitätssicherung--tests)

---

## Architektur-Prinzipien

- **Local-First & 100 % Offline-fähig**: Alle Benutzerdaten werden primär lokal im Browser verarbeitet. Die Anwendung startet ohne Netzwerkverbindung über einen dedizierten Service Worker (`sw.js`) und speichert Zustände synchron in `localStorage` sowie asynchron gespiegelt in `IndexedDB` (`storage.js`).
- **Privacy by Design (Zero-CDN)**: Sämtliche Laufzeitabhängigkeiten (Tailwind-Runtime, Lucide Icons, QR-Generator, Schriftarten) sind lokal im Repository (`vendor/`, `fonts/`) gebündelt. Es finden beim Start keine externen Requests an Google Fonts, Unpkg oder jsDelivr statt.
- **Barrierearme Kognitions-Ergonomie**: Entwickelt mit Fokus auf geringe sensorische Überlastung, klare visuelle Hierarchien, Schritt-für-Schritt-Aufgabenzerlegung (Micro-Steps) und sofortiges akustisches/haptisches Feedback.
- **Buildless Development, Single-Bundle Production**: Im Entwicklungsmodus läuft die Anwendung direkt im Browser ohne Transpilierungs-Zwischenschritt. Für das Produktions-Deployment erzeugt `build.js` ein einzelnes, optimiertes `dist/app.bundle.js` inklusive präziser Service-Worker-Asset-Liste.

---

## Technischer Überblick & Highlights

### 1. Zweistufiger Persistenz-Tresor (`storage.js` & `state.js`)
Um Datenverlust durch aggressive Speicherbereinigung mobiler Browser (insbesondere WebKit/Safari ITP) oder `QuotaExceededError`-Ausnahmen zu verhindern, nutzt Noodle eine zweistufige Speicherarchitektur:
- **Primärspeicher**: Synchroner Lese-/Schreibzugriff über `localStorage` für verzögerungsfreie UI-Reaktivität.
- **Resilience Vault**: Jede Zustandsänderung wird asynchron in einer `IndexedDB`-Datenbank (`noodle_resilience_vault`) gespiegelt und beim Anwendungsstart automatisch wiederhergestellt, falls der `localStorage` geleert wurde.
- **Schema-Migration & Selbstheilung**: `migrateState()` in `state.js` überführt ältere Datenstrukturen deterministisch in das aktuelle Schema (Version 3) und bereinigt verwaiste Tombstones nach 30 Tagen.

### 2. Konfliktfreie Synchronisation & Echtzeit-Kollaboration (`sync-engine.js`, `collab-engine.js`)
- **Tombstone-basiertes Merging**: Gelöschte Einträge werden mit Zeitstempeln in `_tombstones` vermerkt, sodass beim Abgleich zwischen mehreren Geräten gelöschte Aufgaben nicht versehentlich wiederhergestellt werden.
- **P2P-QR-Codec**: Kleinere Arbeitszustände können komplett serverlos als URL-sicherer Base64-Payload in einen QR-Code (`MinimalQR`) kodiert und direkt von Gerät zu Gerät übertragen werden.
- **Team-Space**: Unterstützt gemeinsame Boards, Präsenz-Anzeige, Live-DJ-Synchronisation und WebRTC-basierte Sprachräume.

### 3. Prozedurale WebAudio-DSP-Engine (`audio-core.js`, `audio-generators.js`, `audio-scheduler-*.js`)
Statt große Audiodateien zu streamen, synthetisiert Noodle seine Fokus-Klangwelten in Echtzeit über die native Web Audio API:
- **Mehrspur-Ambient-Mixer**: Beliebig kombinierbare Klangschichten (Rosa/Braunes Rauschen, Sommerwind, Lagerfeuer, Café-Atmosphäre, Bachlauf) mit individuellen Biquad-Filtern.
- **Generative Musik-Scheduler**: Pentatonisches Neo-Klassik-Piano, Lofi-Tape-Akkorde, tibetische Klangschalen, Akustikgitarre und binaurale Fokus-Frequenzen (Alpha, Theta, Gamma).
- **Audio-Ducking**: Sanfte exponentielle Lautstärkeabsenkung (`duckRadio`, `duckAmbient`) während Sprachausgaben (TTS) oder Timer-Signalen.

### 4. Mehrstufige Radio- & Nachrichten-Engine (`app-radio-news.js`)
- **3-Stufen-Signal-Garantie**: Jeder Radiosender verfügt über ein Array verifizierter HTTPS-Mirror-Streams (`streams`). Schlägt ein Primärstream fehl oder liefert innerhalb von 4,5 Sekunden kein Signal (Watchdog-Timer), schaltet die Engine automatisch auf den nächsten Mirror um, fragt bei Bedarf dynamisch die Radio-Browser-API ab oder aktiviert einen harmonischen WebAudio-Fallback-Synthesizer.
- **5-Dimensionen-Nachrichtenfilter**: Unabhängige Echtzeit-Filterung nach Ausgabesprache (`DE`, `EN`, `ES`, `FR`, `IT`, `EL`), Region, Feed-Modus (Lokal, Global, Hybrid), Thema und Medienquelle – direkt steuerbar über das Optionen-Menü rechts neben dem Newsticker.

### 5. Multi-Window-Manager & Cross-Tool-Pipelines (`app-interaction-mode.js`, `app-multitasking-hub.js`, `app-feature-bridge.js`)
- **Desktop Snap-Layouts**: Fenster können frei minimiert, maximiert oder im Windows-11-Stil (50:50 Split, 65:35 Fokus-Split, 4-Quadranten-Grid) angeordnet werden.
- **Mobile Dynamic Island & 5-Tab-Navigation**: Auf Touch-Geräten passt sich die Oberfläche automatisch an eine einhändig bedienbare Bottom-Navigation mit schwebender Status-Insel an.
- **Semantische `@`-Verknüpfungen**: Aufgaben erkennen Schlüsselwörter und Tags (z. B. `@timer`, `@rezept`, `@einkauf`) und blenden kontextbezogene Schnellstart-Aktionen direkt auf der Aufgabenkarte ein.

---

## Projektstruktur & Modul-Übersicht

### Kern- & Infrastrukturschicht
| Datei | Verantwortung |
| :--- | :--- |
| `index.html` | Semantisches Anwendungs-Markup, CSP-Metatag, Event-Delegation (`data-action`), PWA-Update-Banner |
| `main.js` | Moderner ES-Modul Einstiegspunkt & temporäre Window-Kompatibilitätsschicht |
| `config.js` | Zentrale Laufzeitkonfiguration mit Developer-Guard für sichere Overrides |
| `crypto-sync.js` | Zero-Knowledge Ende-zu-Ende-Verschlüsselung (WebCrypto AES-GCM 256-Bit & PBKDF2) |
| `storage.js` | Ausfallsichere Speicherschicht (`AppStorage`) mit `localStorage` und `IndexedDB`-Spiegelung |
| `state.js` | Zentrales State-Management, Schema-Migration (`migrateState`), Undo/Redo-Stack, Workspaces |
| `auth-engine.js` | Authentifizierungs-Client (`FlowAuth`), Session-Verwaltung und Cloud-Token-Handling |
| `sync-engine.js` | Multi-Device-Synchronisation, Delta-Sync mit Fallback, E2E-Container, Tombstone-LWW |
| `collab-engine.js` | Echtzeit-Team-Kollaboration, private Supabase-Channels, kryptografische Raumcodes (≥10 Zeichen) |
| `utils.js` / `utils-2.js` | XSS-Sanitization (`escapeHtml`, `sanitizeUrl`), Event-Delegation-Dispatcher (`dispatchAction`), Kalender |
| `app-backup.js` | Autarkes Backup-, JSON-Export- und Restore-System mit Daten-Migration |
| `sw.js` | Automatisch generierter Service Worker mit SHA-256 Inhalts-Cache-Versionierung |

### Audio-, Radio- & Timer-Engine
| Datei | Verantwortung |
| :--- | :--- |
| `audio-core.js` | WebAudio-Kontext, Master-Gain-Routing, Mehrspur-Ambient-Mixer und Binaural-Beats |
| `audio-generators.js` | Dispatcher und Synthese-Initialisierung für generative Klangwelten |
| `audio-scheduler-1.js` | Pentatonisches Piano, Lofi-Akkorde, Windspiele, Klangschalen, Spieluhr & Gitarre |
| `audio-scheduler-2.js` | Prozedurale Klangsynthese für Dampflokomotive, Retro-Arcade und Kloster-Atmosphäre |
| `audio-scheduler-3.js` | Schreibmaschinen-Akustik, Gewitter-Synthese sowie globale Stop-/Volume-Steuerung |
| `audio-player.js` | Dual-Deck DJ-Controller (Deck A/B, 3-Band-EQ, Pitch, Hot-Cues, Crossfader) & lokaler Musik-Player |
| `timer-1.js` – `timer-3.js` | Fokus-Timer, Sprachansagen (Web Speech API), Chime-Synthese und Task-Kopplung |
| `app-radio-news.js` | Live-Radio-Player mit Multi-Stream-Failover, mehrsprachiger News-Aggregator & Newsticker |

### Fachmodule & Produktivitäts-Werkzeuge
| Datei | Verantwortung |
| :--- | :--- |
| `app-core.js` | Haupt-Orchestrierung (< 2000 Zeilen), Theme-Engine (12 Farbschemata), Zen-Modus, Tastaturkürzel |
| `app-tasks.js` | Kanban-Board-Rendering, Drag-and-Drop, Inline-Editor, Aufgaben-Kontextmenü & Kalender |
| `app-interaction-mode.js` | Fenster-Manager (Minimieren, Maximieren, Taskleiste, Hover-/Pin-Koordination) |
| `app-multitasking-hub.js` | Desktop Snap-Layouts, Mobile Split-View und Dynamic-Island-Steuerung |
| `app-feature-bridge.js` | Cross-Tool-Pipeline (Verknüpfung zwischen Aufgaben, Rezepten, Einkauf, OCR & Timer) |
| `app-command-palette.js` | Globale Befehlspalette (`Strg+K` / `Cmd+K`) für Schnellzugriff auf alle Aktionen |
| `helper-core.js` / `-2.js` | „Was nun?"-Entscheidungsassistent, Münzwurf-Dilemma-Löser und Micro-Step-Zerlegung |
| `helper-brainstorm.js` | Brainstorming-Studio mit Listen-/Cluster-Ansicht und Markdown-Mindmap-Export |
| `helper-ocr-scanner.js` | Dokumenten- & Handschrift-Scanner mit Bildfilterung und lokaler Texterkennung |
| `helper-learning.js` | Wissens-Hub mit Karteikarten, Spaced Repetition (Leitner/SM-2) und Fach-Quizzes |
| `helper-clarity.js` | Impulskontrolle, Urge-Surfing-Timer (90s) und Reflexions-Journal |
| `helper-cleaning.js` | Geführte Wohnungs-Reset-Programme (15-Minuten-Express bis Tiefenreinigung) |
| `sport.js` | Modulares Home-Workout-System, Intervall-Player, Übungs-Lexikon & 1–3-Löffel-Impulse |
| `app-shopping.js` | Intelligente Einkaufsliste mit automatischer Abteilungs-Sortierung & Angebots-Übersicht |
| `app-cooking.js` | Rezept-Assistent, Vorratskammer-Abgleich und interaktiver Schritt-für-Schritt-Kochmodus |
| `app-alarm.js` | Wecker, Erinnerungen und akustische Signale |
| `app-regulation.js` | Atem-Pacer (Physiologischer Seufzer, 4-7-8, Box-Breathing), Grounding & Bilaterale Stimulation |
| `app-health.js` | Vorsorge-Checklisten, Medikamenten-Tracker und Blutdruck-Protokoll |
| `app-reports.js` | Produktivitäts-Statistiken, Aktivitäts-Heatmap und Bildexport (`html2canvas`) |
| `app-weather-news.js` | Lokales Wetter-Widget (Open-Meteo API) mit Multi-Stadt-Vergleich & XSS-sicheren Nodes |
| `app-dice.js` | 3D-Glückswürfel zur spielerischen Auswahl offener Aufgaben |
| `app-routine-presets.js` | Vorlagen-Manager für Tages- und Wochenroutinen |
| `app-installation-hub.js` | Plattformabhängiger PWA-Installationsassistent (Windows, macOS, Linux, Android, iOS) |
| `app-humor.js` | Interaktive Pausen-Effekte, Soundboard und konfigurierbarer Bildschirmschoner |
| `app-social.js` | Visueller Share-Card-Generator (HTML5 Canvas) für Social-Media-Beiträge |
| `app-feedback.js` | Integriertes Feedback-Formular und interaktive Einführungstour |
| `app-tooltip.js` | Verzögerungsfreies, viewport-sicheres Tooltip-System |
| `onboarding.js` | 4-Schritte-Onboarding-Dialog für neue Nutzer |
| `monetization.js` | Vorbereitete Schnittstelle für optionale Pro-Erweiterungen (standardmäßig deaktiviert) |

---

## Installation & Entwicklung

Noodle Studio nutzt im Entwicklungsmodus native **ES-Module (`main.js`)**:

```bash
# Abhängigkeiten für Tailwind-CLI, esbuild und Test-Runner installieren
npm install

# Vollständige Test-Suite ausführen (Vitest + Happy-DOM, 39 Suiten, 263 Tests)
npm test

# Vorkompiliertes CSS generieren, JS mit esbuild minifizieren & dist/ erstellen
npm run build
```

---

## Build-Pipeline & Deployment

Das Build-Skript [`build.js`](file:///c:/Users/Admin/Documents/GitHub/noodle/build.js) optimiert das gesamte Projekt für Hosting & Edge-CDNs:
1. **Tailwind CSS Vorkompilierung**: Erzeugt `styles-tailwind.css` (224 KB minifiziert) ohne Runtime-Overhead im Browser.
2. **esbuild Bundling**: Bündelt alle 61 Module in exakter Reihenfolge und minifiziert zu `dist/app.bundle.js` (2.727 KB, -517 KB Ersparnis).
3. **i18n Lazy-Loading**: Sprachpakete (`de`, `en`, `fr`, `es`, `it`, `el`) werden on-demand als JSON nach `dist/locales/` ausgelagert.
4. **Service Worker Automatisierung**: [`sw-generator.js`](file:///c:/Users/Admin/Documents/GitHub/noodle/sw-generator.js) parst alle Referenzen und kalkuliert deterministische SHA-256 Cache-Hashes für `sw.js` und `dist/sw.js`.
5. **PWA Update Banner**: Erkennt Service-Worker-Updates automatisch und bietet dem Nutzer ein unterbrechungsfreies "Aktualisieren" an.

---

## Supabase Einrichtung & RLS-Sicherheit

Für den optionalen Cloud-Sync und Collab-Betrieb liegt das vorbereitete SQL-Skript [`supabase-policies.sql`](file:///c:/Users/Admin/Documents/GitHub/noodle/supabase-policies.sql) bereit:

1. Öffne das **Supabase Dashboard** deines Projekts.
2. Navigiere zum **SQL Editor** und führe den Inhalt von [`supabase-policies.sql`](file:///c:/Users/Admin/Documents/GitHub/noodle/supabase-policies.sql) aus.
3. Das Skript richtet Folgendes ein:
   - Tabelle `public.flow_sync` mit Spalten `user_id`, `data (jsonb)` und `updated_at`.
   - Aktiviert **Row Level Security (RLS)**.
   - Richtet strikte Richtlinien (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) ein, sodass Nutzer **nur ihre eigenen Datensätze** (`auth.uid() = user_id`) abrufen und modifizieren können.

