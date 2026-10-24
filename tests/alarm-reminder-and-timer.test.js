/**
 * @file tests/alarm-reminder-and-timer.test.js
 * @description
 * Umfassende Tests für die Wecker-, Erinnerungs- und Timer-Engine (app-alarm.js).
 * Testet Initialisierung, Speicherung, Fehlerbehandlung bei defekten Daten,
 * Hinzufügen, Umschalten, Löschen, Snooze/Dismiss, Voreinstellungen und minütliche Prüfung.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Alarm-, Reminder- und Timer-Engine (app-alarm.js)', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="panel-alarm"></div>
      <div id="alarm-active-badge" class="hidden"></div>
      <input id="new-alarm-time" value="07:30" />
      <input id="new-alarm-label" value="Guten Morgen" />
      <input id="new-reminder-text" value="Tee kochen" />
      <select id="new-reminder-mins">
        <option value="5">5 min</option>
        <option value="10">10 min</option>
        <option value="15" selected>15 min</option>
        <option value="30">30 min</option>
        <option value="60">60 min</option>
      </select>
      <input type="checkbox" id="new-reminder-urgent" checked />
    `;

    // Audio-Mocks
    window.AudioContext = vi.fn().mockImplementation(() => ({
      createOscillator: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        type: 'sine'
      }),
      createGain: () => ({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
      }),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined)
    }));
    window.webkitAudioContext = window.AudioContext;

    // Toast & Tombstone Mocks
    window.showToast = vi.fn();
    window.trackTombstone = vi.fn();

    // Importieren
    await import('../app-alarm.js');

    // Sicherstellen, dass Hintergrund-Ticker während Unit-Tests nicht wild laufen
    if (typeof window.stopAlarmLoop === 'function') window.stopAlarmLoop();
    if (typeof window.stopAlarmLiveTicker === 'function') window.stopAlarmLiveTicker();
  });

  afterEach(() => {
    if (typeof window.stopAlarmLoop === 'function') window.stopAlarmLoop();
    if (typeof window.stopAlarmLiveTicker === 'function') window.stopAlarmLiveTicker();
    vi.restoreAllMocks();
  });

  describe('1. Initialisierung und Speicher-Wiederherstellung', () => {
    it('initialisiert Standarddaten bei leerem localStorage', () => {
      localStorage.removeItem('flow_alarms_reminders');
      window.initAlarmReminder();

      const st = window.getAlarmState();
      expect(st).toBeDefined();
      expect(Array.isArray(st.alarms)).toBe(true);
      expect(st.alarms.length).toBeGreaterThan(0);
      expect(st.alarms[0].time).toBe('08:00');
      expect(st.alarms[0].label).toBe('Fokus-Start');
      expect(st.settings.sound).toBe('digital');
      expect(st.settings.volume).toBe(0.9);
      expect(st.settings.vibrate).toBe(true);
    });

    it('fängt beschädigte JSON-Daten in localStorage sauber ab', () => {
      localStorage.setItem('flow_alarms_reminders', '{ungueltiges_json: kein JSON}');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => window.initAlarmReminder()).not.toThrow();
      warnSpy.mockRestore();
    });

    it('ergänzt unvollständige Benutzereinstellungen mit den Standardeinstellungen', () => {
      const partialState = {
        alarms: [{ id: 'a1', time: '09:15', label: 'Daily', active: true }],
        reminders: [],
        settings: { sound: 'retro' } // volume und vibrate fehlen
      };
      localStorage.setItem('flow_alarms_reminders', JSON.stringify(partialState));

      window.initAlarmReminder();
      const st = window.getAlarmState();
      expect(st.settings.sound).toBe('retro');
      expect(st.settings.volume).toBe(0.9);
      expect(st.settings.vibrate).toBe(true);
      expect(st.settings.remindersAsAlarm).toBe(true);
    });
  });

  describe('2. Wecker-Verwaltung (handleAddAlarm, handleToggleAlarm, handleDeleteAlarm)', () => {
    it('erstellt neuen Wecker mit Eingaben aus den DOM-Feldern', () => {
      window.initAlarmReminder();
      const initialCount = window.getAlarmState().alarms.length;

      document.getElementById('new-alarm-time').value = '06:15';
      document.getElementById('new-alarm-label').value = 'Frühsport';

      window.handleAddAlarm();

      const st = window.getAlarmState();
      expect(st.alarms.length).toBe(initialCount + 1);
      const added = st.alarms.find(a => a.time === '06:15');
      expect(added).toBeDefined();
      expect(added.label).toBe('Frühsport');
      expect(added.active).toBe(true);
      expect(window.showToast).toHaveBeenCalled();
    });

    it('ignoriert leere Uhrzeit beim Erstellen eines Weckers', () => {
      window.initAlarmReminder();
      const initialCount = window.getAlarmState().alarms.length;

      document.getElementById('new-alarm-time').value = '';
      window.handleAddAlarm();

      const st = window.getAlarmState();
      expect(st.alarms.length).toBe(initialCount);
    });

    it('schaltet den Aktiv-Zustand eines Weckers um (handleToggleAlarm)', () => {
      window.initAlarmReminder();
      const alarm = window.getAlarmState().alarms[0];
      const initialActive = alarm.active;

      window.handleToggleAlarm(alarm.id);
      expect(window.getAlarmState().alarms.find(a => a.id === alarm.id).active).toBe(!initialActive);

      window.handleToggleAlarm(alarm.id);
      expect(window.getAlarmState().alarms.find(a => a.id === alarm.id).active).toBe(initialActive);
    });

    it('löscht einen Wecker und ruft trackTombstone auf', () => {
      window.initAlarmReminder();
      const alarmToDelete = window.getAlarmState().alarms[0];

      window.handleDeleteAlarm(alarmToDelete.id);

      const st = window.getAlarmState();
      expect(st.alarms.find(a => a.id === alarmToDelete.id)).toBeUndefined();
      expect(window.trackTombstone).toHaveBeenCalledWith(alarmToDelete.id);
    });
  });

  describe('3. Erinnerungs-Verwaltung (handleAddReminder, handleToggleReminder, handleDeleteReminder)', () => {
    it('erstellt eine Erinnerung mit individueller Offset-Dauer und Dringlichkeit', () => {
      window.initAlarmReminder();
      document.getElementById('new-reminder-text').value = 'Wäsche aufhängen';
      document.getElementById('new-reminder-mins').value = '30';
      document.getElementById('new-reminder-urgent').checked = true;

      const beforeTime = Date.now();
      window.handleAddReminder();

      const st = window.getAlarmState();
      const added = st.reminders.find(r => r.text === 'Wäsche aufhängen');
      expect(added).toBeDefined();
      expect(added.completed).toBe(false);
      expect(added.isUrgent).toBe(true);
      expect(added.time).toBeGreaterThanOrEqual(beforeTime + 29 * 60000);
      expect(document.getElementById('new-reminder-text').value).toBe('');
    });

    it('ignoriert leere Erinnerungs-Texte', () => {
      window.initAlarmReminder();
      const countBefore = window.getAlarmState().reminders.length;
      document.getElementById('new-reminder-text').value = '   ';

      window.handleAddReminder();
      expect(window.getAlarmState().reminders.length).toBe(countBefore);
    });

    it('markiert eine Erinnerung als erledigt / toggelt den Status', () => {
      window.initAlarmReminder();
      const rem = window.getAlarmState().reminders[0];
      expect(rem.completed).toBe(false);

      window.handleToggleReminder(rem.id);
      expect(window.getAlarmState().reminders.find(r => r.id === rem.id).completed).toBe(true);
    });

    it('löscht eine Erinnerung sauber und ruft Tombstone-Tracking auf', () => {
      window.initAlarmReminder();
      const rem = window.getAlarmState().reminders[0];

      window.handleDeleteReminder(rem.id);
      expect(window.getAlarmState().reminders.find(r => r.id === rem.id)).toBeUndefined();
      expect(window.trackTombstone).toHaveBeenCalledWith(rem.id);
    });
  });

  describe('4. Presets und dynamische Zeitberechnungen', () => {
    it('applyAlarmPreset fügt einen neuen Wecker mit Label hinzu', () => {
      window.initAlarmReminder();
      window.applyAlarmPreset('12:00', 'Mittagspause');

      const st = window.getAlarmState();
      const preset = st.alarms.find(a => a.time === '12:00' && a.label === 'Mittagspause');
      expect(preset).toBeDefined();
      expect(preset.active).toBe(true);
    });

    it('applyAlarmOffsetMinutes berechnet Zielzeit im korrekten HH:MM-Format', () => {
      window.initAlarmReminder();
      const now = new Date();
      const targetTime = new Date(now.getTime() + 45 * 60000);
      const expHh = String(targetTime.getHours()).padStart(2, '0');
      const expMm = String(targetTime.getMinutes()).padStart(2, '0');
      const expectedTimeStr = `${expHh}:${expMm}`;

      window.applyAlarmOffsetMinutes(45, 'Meeting');

      const st = window.getAlarmState();
      const matched = st.alarms.find(a => a.time === expectedTimeStr && a.label === 'Meeting');
      expect(matched).toBeDefined();
    });
  });

  describe('5. Snooze- und Dismiss-Logik', () => {
    it('snoozeAlarm pausiert den Wecker und legt eine Snooze-Erinnerung 5 Min in die Zukunft an', () => {
      window.initAlarmReminder();
      const beforeMs = Date.now();

      window.snoozeAlarm(5);

      const st = window.getAlarmState();
      const snoozeReminder = st.reminders.find(r => r.text.includes('Snooze'));
      expect(snoozeReminder).toBeDefined();
      expect(snoozeReminder.isUrgent).toBe(true);
      expect(snoozeReminder.completed).toBe(false);
      expect(snoozeReminder.time).toBeGreaterThanOrEqual(beforeMs + 4 * 60000);
    });

    it('dismissActiveAlarm beendet Klingeln und markiert gegebene Erinnerung als erledigt', () => {
      window.initAlarmReminder();
      const rem = window.getAlarmState().reminders[0];

      window.dismissActiveAlarm(rem.id);
      expect(window.getAlarmState().reminders.find(r => r.id === rem.id).completed).toBe(true);
      expect(window.showToast).toHaveBeenCalled();
    });
  });

  describe('6. Einstellungen und Sound-Konfiguration', () => {
    it('handleUpdateAlarmSetting aktualisiert Einstellung und speichert im localStorage', () => {
      window.initAlarmReminder();
      window.handleUpdateAlarmSetting('sound', 'radar');

      const st = window.getAlarmState();
      expect(st.settings.sound).toBe('radar');

      const saved = JSON.parse(localStorage.getItem('flow_alarms_reminders'));
      expect(saved.settings.sound).toBe('radar');
    });

    it('handleUpdateAlarmVolume aktualisiert Lautstärke und speichert', () => {
      window.initAlarmReminder();
      window.handleUpdateAlarmVolume(0.45);

      const st = window.getAlarmState();
      expect(st.settings.volume).toBeCloseTo(0.45);

      const saved = JSON.parse(localStorage.getItem('flow_alarms_reminders'));
      expect(saved.settings.volume).toBeCloseTo(0.45);
    });
  });

  describe('7. Ticker & Loop-Prüfung (checkAlarmsLoop)', () => {
    it('schließt fällige Erinnerungen in checkAlarmsLoop automatisch ab', () => {
      window.initAlarmReminder();
      const st = window.getAlarmState();
      // Eine überfällige Erinnerung anlegen
      st.reminders.push({
        id: 'past_rem',
        text: 'Abgelaufene Erinnerung',
        time: Date.now() - 5000,
        completed: false,
        isUrgent: false
      });

      window.checkAlarmsLoop();

      const updated = window.getAlarmState().reminders.find(r => r.id === 'past_rem');
      expect(updated.completed).toBe(true);
    });
  });
});
