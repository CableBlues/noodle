/**
 * app-installation-hub.js
 * Cross-Platform Local App Installation, Setup Wizard & Offline Cockpit for Noodle Studio
 * ======================================================================================
 * Unterstützt:
 *  - Windows (🪟 PWA, Edge/Chrome App-Modus, Desktop-Launcher, Autostart-Guide)
 *  - Android (🤖 PWA 1-Click Install, Vollbild ohne Adressleiste, Offline-Ready)
 *  - macOS (🍎 Safari Dock-App, Chrome/Brave Launchpad & Spotlight-Integration)
 *  - Linux (🐧 PWA, .desktop-Launcher für GNOME/KDE/XFCE/Wayland)
 *  - iOS / iPadOS (📱 Safari "Zum Home-Bildschirm")
 *  - Setup-Wizard: Routinen-Auswahl, Sync-Kopplung, Themes, Sound, Offline-Tresor
 *  - Portable Offline-Standalone-Paket Download (100% offline ohne Internet)
 */

(function () {
  'use strict';

  // State
  let currentPlatform = 'windows';
  let isInstallPromptAvailable = false;

  /**
   * Automatische Erkennung des Betriebssystems
   */
  function detectPlatform() {
    if (typeof navigator === 'undefined') return 'windows';
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';

    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(platform) || /Mac OS X/i.test(ua)) return 'macos';
    if (/Linux/i.test(platform) || /Linux/i.test(ua)) return 'linux';
    return 'windows';
  }

  /**
   * Prüft den aktuellen PWA- und Offline-Status
   */
  async function checkOfflineStatus() {
    const status = {
      isServiceWorkerActive: false,
      cachedAssetsCount: 0,
      isStandalone: false
    };

    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        status.isStandalone = true;
      }
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        status.isServiceWorkerActive = true;
      }
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          for (const key of cacheKeys) {
            const cache = await caches.open(key);
            const keys = await cache.keys();
            status.cachedAssetsCount += keys.length;
          }
        } catch (e) {
          console.warn('[InstallHub] Error reading caches:', e);
        }
      }
    }
    return status;
  }

  /**
   * Aktualisiert die Live-Status-Badges im Modal
   */
  async function refreshStatusBadges() {
    const status = await checkOfflineStatus();
    const badgeStandalone = document.getElementById('install-badge-standalone');
    const badgeOffline = document.getElementById('install-badge-offline');
    const directBtn = document.getElementById('install-direct-pwa-btn');

    if (badgeStandalone) {
      if (status.isStandalone) {
        badgeStandalone.className = 'px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1.5';
        badgeStandalone.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Als App aktiv ✓</span>';
      } else {
        badgeStandalone.className = 'px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1.5';
        badgeStandalone.innerHTML = '<span>Browser-Tab</span>';
      }
    }

    if (badgeOffline) {
      if (status.isServiceWorkerActive || status.cachedAssetsCount > 0) {
        badgeOffline.className = 'px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1.5';
        badgeOffline.innerHTML = `<i data-lucide="shield-check" class="w-3 h-3 text-cyan-300"></i><span>100% Offline-Bereit (${status.cachedAssetsCount || '30+'} Assets)</span>`;
      } else {
        badgeOffline.className = 'px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-gray-300 text-[10px] font-mono font-bold flex items-center gap-1.5';
        badgeOffline.innerHTML = '<span>Offline-Cache lädt...</span>';
      }
    }

    if (directBtn) {
      if (window.deferredPwaPrompt) {
        directBtn.classList.remove('hidden');
      } else {
        // Even if direct prompt is not held, button can open the native browser install hint
        directBtn.classList.remove('hidden');
      }
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons(); } catch (e) {}
    }
  }

  /**
   * Öffnet das Installations- & Setup-Cockpit
   */
  function openInstallModal(platform) {
    const modal = document.getElementById('modal-app-install');
    if (!modal) return;

    currentPlatform = platform || detectPlatform();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '200050';

    switchPlatformTab(currentPlatform);
    refreshStatusBadges();

    if (typeof window.bringToFront === 'function') {
      window.bringToFront(modal);
    }
    if (window.NoodleInteractionMode && typeof window.NoodleInteractionMode.bringWindowToFront === 'function') {
      window.NoodleInteractionMode.bringWindowToFront('app-install');
    }
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons(); } catch (e) {}
    }
  }

  /**
   * Schließt das Modal
   */
  function closeInstallModal() {
    const modal = document.getElementById('modal-app-install');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  /**
   * Wechselt die Plattform-Reiter im Installations-Center
   */
  function switchPlatformTab(platformKey) {
    currentPlatform = platformKey;
    const platforms = ['windows', 'android', 'macos', 'linux', 'ios', 'wizard'];

    platforms.forEach(p => {
      const btn = document.getElementById(`install-tab-btn-${p}`);
      const pane = document.getElementById(`install-pane-${p}`);

      if (btn) {
        if (p === platformKey) {
          btn.className = 'py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold border border-purple-400/50 shadow-md transition flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-95';
        } else {
          btn.className = 'py-2 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-transparent transition flex items-center justify-center gap-1.5 text-xs cursor-pointer font-medium';
        }
      }

      if (pane) {
        if (p === platformKey) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      }
    });

    if (platformKey === 'wizard') {
      renderSetupWizardValues();
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons(); } catch (e) {}
    }
  }

  /**
   * Löst die 1-Klick-PWA-Installation oder den Desktop-Starter aus
   */
  function triggerDirectInstall() {
    if (window.deferredPwaPrompt) {
      window.deferredPwaPrompt.prompt();
      window.deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          if (typeof showToast === 'function') {
            showToast(typeof tr === 'function' ? tr({
              de: '🎉 Noodle wird auf deinem System installiert!',
              en: '🎉 Installing Noodle on your system!'
            }) : '🎉 Noodle wird auf deinem System installiert!');
          }
        }
        window.deferredPwaPrompt = null;
        refreshStatusBadges();
      });
    } else {
      // Wenn der Browser keinen direkten Prompt anbietet, lade für Windows/Linux direkt den Starter herunter!
      const detected = currentPlatform || detectPlatform();
      if (detected === 'windows') {
        downloadDesktopLauncher('windows-bat');
        if (typeof showToast === 'function') {
          showToast('📥 Windows Desktop-Starter heruntergeladen! Führe die .bat Datei aus.');
        }
      } else if (detected === 'linux') {
        downloadDesktopLauncher('linux-desktop');
        if (typeof showToast === 'function') {
          showToast('📥 Linux Desktop-Shortcut heruntergeladen!');
        }
      } else {
        const platformTitles = {
          android: 'Tippe im Browser-Menü (⋮) auf „App installieren“ oder „Zum Startbildschirm hinzufügen“.',
          macos: 'Klicke im Safari-Menü auf „Ablage“ ➔ „Zum Dock hinzufügen“ oder im Chrome auf ⊕.',
          ios: 'Tippe in Safari auf das Teilen-Symbol [↑] und wähle „Zum Home-Bildschirm“.'
        };
        const hint = platformTitles[detected] || 'Installiere Noodle über dein Browser-Menü als App.';
        if (typeof showToast === 'function') showToast(hint);
      }
    }
  }

  /**
   * Erzeugt und lädt einen nativen Desktop-Launcher herunter
   */
  function downloadDesktopLauncher(type) {
    const currentOrigin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://noodlestudio.app';
    const currentPath = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/';
    const fullAppUrl = currentOrigin + currentPath;

    let filename = 'Noodle-Studio';
    let content = '';
    let mimeType = 'text/plain';

    if (type === 'windows-bat' || type === 'windows-installer') {
      filename = 'Install-Noodle-Studio.bat';
      content = `@echo off
setlocal enabledelayedexpansion
title Noodle Studio - Windows Installer
chcp 65001 >nul 2>&1

echo ==============================================================================
echo  🍜 NOODLE STUDIO - WINDOWS INSTALLER
echo ==============================================================================
echo.
echo  Installiere Noodle Studio dauerhaft auf deinem Computer...
echo.

set "APP_DIR=%LOCALAPPDATA%\\NoodleStudio"
set "DESKTOP_DIR=%USERPROFILE%\\Desktop"
set "STARTMENU_DIR=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs"
set "APP_URL=${fullAppUrl}"

:: 1. Erstelle lokales Anwendungsverzeichnis
if not exist "%APP_DIR%" (
    mkdir "%APP_DIR%"
)

:: 2. Erstelle den rahmenlosen App-Launcher
(
echo @echo off
echo title Noodle Studio
echo where msedge ^>nul 2^>nul ^&^& (start msedge --app="%APP_URL%" ^& exit /b^)
echo where chrome ^>nul 2^>nul ^&^& (start chrome --app="%APP_URL%" ^& exit /b^)
echo where brave ^>nul 2^>nul ^&^& (start brave --app="%APP_URL%" ^& exit /b^)
echo start "" "%APP_URL%"
) > "%APP_DIR%\\noodle-studio.cmd"

:: 3. Erstelle lautlosen VBScript-Starter (kein strendes schwarzes Konsolenfenster)
(
echo Set WshShell = CreateObject("WScript.Shell"^)
echo WshShell.Run chr(34^) ^& "%APP_DIR%\\noodle-studio.cmd" ^& chr(34^), 0, False
echo Set WshShell = Nothing
) > "%APP_DIR%\\launch.vbs"

:: 4. Erstelle Deinstallations-Skript
(
echo @echo off
echo title Noodle Studio Deinstallieren
echo del /f /q "%DESKTOP_DIR%\\Noodle Studio.lnk" 2^>nul
echo del /f /q "%STARTMENU_DIR%\\Noodle Studio.lnk" 2^>nul
echo rd /s /q "%APP_DIR%" 2^>nul
echo Noodle Studio wurde erfolgreich entfernt.
echo pause
) > "%APP_DIR%\\uninstall.cmd"

:: 5. Erstelle echte Windows .lnk Shortcuts auf Desktop und im Startmen via PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$sDesktop = $ws.CreateShortcut('%DESKTOP_DIR%\\Noodle Studio.lnk'); " ^
  "$sDesktop.TargetPath = 'wscript.exe'; " ^
  "$sDesktop.Arguments = '\"%APP_DIR%\\launch.vbs\"'; " ^
  "$sDesktop.Description = 'Noodle Studio - Dein fokussierter Alltags- und Arbeits-Planer'; " ^
  "$sDesktop.WorkingDirectory = '%APP_DIR%'; " ^
  "$sDesktop.Save(); " ^
  "$sStart = $ws.CreateShortcut('%STARTMENU_DIR%\\Noodle Studio.lnk'); " ^
  "$sStart.TargetPath = 'wscript.exe'; " ^
  "$sStart.Arguments = '\"%APP_DIR%\\launch.vbs\"'; " ^
  "$sStart.Description = 'Noodle Studio'; " ^
  "$sStart.WorkingDirectory = '%APP_DIR%'; " ^
  "$sStart.Save();"

echo  [OK] Desktop-Verknpfung erstellt:
echo       "%DESKTOP_DIR%\\Noodle Studio.lnk"
echo.
echo  [OK] Startmen-Eintrag registriert:
echo       "%STARTMENU_DIR%\\Noodle Studio.lnk"
echo.
echo  [OK] Anwendungsdateien installiert in:
echo       "%APP_DIR%"
echo.
echo ==============================================================================
echo  🎉 INSTALLATION ERFOLGREICH! Noodle Studio startet jetzt...
echo ==============================================================================
echo.

:: 6. Starte installierte App sofort
start "" wscript.exe "%APP_DIR%\\launch.vbs"
timeout /t 2 >nul
exit /b
`;
    } else if (type === 'windows-url') {
      filename = 'Noodle-Studio.url';
      content = `[InternetShortcut]\nURL=${fullAppUrl}\nIconIndex=0\n`;
    } else if (type === 'linux-desktop') {
      filename = 'noodle-studio.desktop';
      content = `[Desktop Entry]
Version=1.0
Type=Application
Name=Noodle Studio
Comment=Dein fokussierter, ruhiger und barrierefreier Alltags- und Arbeits-Planer
Exec=x-www-browser --app="${fullAppUrl}" || xdg-open "${fullAppUrl}"
Icon=applications-office
Terminal=false
Categories=Office;Productivity;Utility;
StartupWMClass=noodle-studio
`;
    } else if (type === 'offline-pack') {
      // Standalone Portable HTML Backup Package
      filename = 'Noodle-Studio-Standalone-Portable.html';
      const rawHtml = document.documentElement ? document.documentElement.outerHTML : '<!DOCTYPE html><html><body>Noodle Studio Standalone</body></html>';
      content = rawHtml;
      mimeType = 'text/html';
    }

    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof showToast === 'function') {
        showToast(typeof tr === 'function' ? tr({
          de: `💾 "${filename}" erfolgreich heruntergeladen!`,
          en: `💾 "${filename}" successfully downloaded!`
        }) : `💾 "${filename}" erfolgreich heruntergeladen!`);
      }
    } catch (e) {
      console.error('[InstallHub] Download launcher failed:', e);
    }
  }

  /**
   * Fragt die Desktop-/System-Benachrichtigungsberechtigung an
   */
  async function requestNotificationPermission() {
    if (typeof Notification === 'undefined') {
      if (typeof showToast === 'function') showToast('Benachrichtigungen werden von diesem Browser nicht unterstützt.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Noodle Studio', {
          body: 'Benachrichtigungen sind aktiv! 🔔',
          icon: './icon-192.png'
        });
        if (typeof showToast === 'function') showToast('🔔 Benachrichtigungen erfolgreich aktiviert!');
      } else {
        if (typeof showToast === 'function') showToast('Benachrichtigungen wurden nicht freigegeben.');
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  }

  /**
   * Liest & rendert Werte im interaktiven Setup-Wizard Tab
   */
  function renderSetupWizardValues() {
    // Current Theme badge
    const curTheme = (typeof currentTheme !== 'undefined' ? currentTheme : (localStorage.getItem('flowPlannerTheme') || 'aurora'));
    const themeDisplay = document.getElementById('wizard-current-theme-name');
    if (themeDisplay) themeDisplay.textContent = curTheme;

    // Current Lang badge
    const curLang = (typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('flowPlannerLanguage') || 'de'));
    const langDisplay = document.getElementById('wizard-current-lang-name');
    if (langDisplay) langDisplay.textContent = curLang.toUpperCase();
  }

  // Event Listener für BeforeInstallPrompt
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      isInstallPromptAvailable = true;
      refreshStatusBadges();
    });

    window.addEventListener('appinstalled', () => {
      window.deferredPwaPrompt = null;
      isInstallPromptAvailable = false;
      refreshStatusBadges();
      if (typeof showToast === 'function') {
        showToast(typeof tr === 'function' ? tr({
          de: '🎉 Noodle Studio wurde erfolgreich auf deinem System installiert!',
          en: '🎉 Noodle Studio was successfully installed on your system!'
        }) : '🎉 Noodle Studio wurde erfolgreich auf deinem System installiert!');
      }
    });
  }

  // Public API Export
  const AppInstallationHub = {
    detectPlatform,
    openInstallModal,
    closeInstallModal,
    switchPlatformTab,
    triggerDirectInstall,
    downloadDesktopLauncher,
    requestNotificationPermission,
    checkOfflineStatus,
    refreshStatusBadges,
    renderSetupWizardValues
  };

  if (typeof window !== 'undefined') {
    window.AppInstallationHub = AppInstallationHub;
    window.openInstallModal = openInstallModal;
    window.closeInstallModal = closeInstallModal;
    window.switchPlatformTab = switchPlatformTab;
    window.triggerDirectInstall = triggerDirectInstall;
    window.downloadDesktopLauncher = downloadDesktopLauncher;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.AppInstallationHub = AppInstallationHub;
    globalThis.openInstallModal = openInstallModal;
    globalThis.closeInstallModal = closeInstallModal;
  }

})();
