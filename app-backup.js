/**
 * @file app-backup.js
 * @module AppBackup
 * @description
 * Full Local-First Backup, Export & Restore Engine für Noodle Studio.
 * Ermöglicht vollständige JSON-Datensicherungen, automatisierte Migrationen und Wiederherstellung.
 */

function downloadFullBackup() {
  try {
    const backupData = {
      app: 'Noodle',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      items: typeof items !== 'undefined' ? items : (typeof state !== 'undefined' && state.items ? state.items : {}),
      categoriesOrder: typeof categoriesOrder !== 'undefined' ? categoriesOrder : [],
      currentWorkspace: typeof currentWorkspace !== 'undefined' ? currentWorkspace : 'private',
      historyScreenshots: typeof getHistoryScreenshots === 'function' ? getHistoryScreenshots() : [],
      customTranslations: typeof customTranslations !== 'undefined' ? customTranslations : {},
      theme: (typeof localStorage !== 'undefined' && localStorage.getItem('flow_theme')) || 'dark',
      currentLang: typeof currentLang !== 'undefined' ? currentLang : 'en'
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `noodle-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
      showToast(typeof tr === 'function' ? tr({ de: 'Backup erfolgreich heruntergeladen! 💾', en: 'Backup successfully downloaded! 💾' }) : 'Backup heruntergeladen! 💾');
    }
  } catch (e) {
    console.error('Backup download error:', e);
    if (typeof showToast === 'function') {
      showToast('Fehler beim Erstellen des Backups: ' + e.message);
    }
  }
}

async function handleRestoreBackupFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data) {
        throw new Error('Ungültiges Noodle Backup-Format');
      }

      const msg = typeof tr === 'function' ? tr({
        de: 'Möchtest du dieses Backup wirklich wiederherstellen? Bestehende Daten werden ersetzt.',
        en: 'Do you really want to restore this backup? Existing data will be replaced.'
      }) : 'Möchtest du dieses Backup wirklich wiederherstellen? Bestehende Daten werden ersetzt.';

      const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
        title: typeof tr === 'function' ? tr({ de: 'Backup wiederherstellen?', en: 'Restore Backup?' }) : 'Backup wiederherstellen?',
        message: msg,
        confirmText: typeof tr === 'function' ? tr({ de: 'Wiederherstellen', en: 'Restore' }) : 'Wiederherstellen',
        isDanger: false,
        icon: 'rotate-ccw'
      }) : (typeof confirm === 'function' ? confirm(msg) : true);

      if (confirmed) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
        const migrated = (typeof migrateState === 'function') ? migrateState(data, lang) : data;
        const nowISO = new Date().toISOString();
        migrated._backupRestoredAt = nowISO;
        migrated.updatedAt = nowISO;

        if (typeof state !== 'undefined') {
          state = migrated;
        }
        if (typeof window !== 'undefined') {
          window.state = migrated;
        }

        if (migrated.categoriesOrder && Array.isArray(migrated.categoriesOrder)) {
          if (typeof categoriesOrder !== 'undefined') categoriesOrder = migrated.categoriesOrder;
          if (typeof saveCategoriesOrder === 'function') saveCategoriesOrder();
        }

        if (typeof saveState === 'function') saveState();

        if (typeof cloudSyncEngine !== 'undefined' && typeof cloudSyncEngine.triggerImmediatePush === 'function') {
          cloudSyncEngine.triggerImmediatePush();
        }

        if (typeof renderApp === 'function') renderApp();
        if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
        if (typeof updateZenView === 'function') updateZenView();
        if (typeof closeSettingsModal === 'function') closeSettingsModal();

        if (typeof showToast === 'function') {
          showToast(tr({
            de: 'Backup erfolgreich wiederhergestellt! ✨',
            en: 'Backup restored successfully! ✨'
          }));
        }
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Fehler beim Wiederherstellen: ' + err.message);
      }
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function exportData() {
  if (typeof downloadFullBackup === 'function') {
    downloadFullBackup();
  }
}

function importData() {
  const fileInput = document.getElementById('backup-restore-file-input');
  if (fileInput) {
    fileInput.click();
  } else {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      if (typeof handleRestoreBackupFile === 'function') handleRestoreBackupFile(e);
    };
    input.click();
  }
}

if (typeof window !== 'undefined') {
  window.downloadFullBackup = downloadFullBackup;
  window.handleRestoreBackupFile = handleRestoreBackupFile;
  window.exportData = exportData;
  window.importData = importData;
}

if (typeof globalThis !== 'undefined') {
  globalThis.downloadFullBackup = downloadFullBackup;
  globalThis.handleRestoreBackupFile = handleRestoreBackupFile;
  globalThis.exportData = exportData;
  globalThis.importData = importData;
}
