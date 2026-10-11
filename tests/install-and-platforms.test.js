import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('App Installation & Cross-Platform Hub', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="modal-app-install" class="hidden">
        <div id="install-badge-standalone"></div>
        <div id="install-badge-offline"></div>
        <button id="install-direct-pwa-btn" class="hidden"></button>
        
        <button id="install-tab-btn-windows"></button>
        <button id="install-tab-btn-android"></button>
        <button id="install-tab-btn-macos"></button>
        <button id="install-tab-btn-linux"></button>
        <button id="install-tab-btn-ios"></button>
        <button id="install-tab-btn-wizard"></button>

        <div id="install-pane-windows" class="hidden"></div>
        <div id="install-pane-android" class="hidden"></div>
        <div id="install-pane-macos" class="hidden"></div>
        <div id="install-pane-linux" class="hidden"></div>
        <div id="install-pane-ios" class="hidden"></div>
        <div id="install-pane-wizard" class="hidden">
          <span id="wizard-current-theme-name"></span>
          <span id="wizard-current-lang-name"></span>
        </div>
      </div>
    `;

    // Mock global objects
    global.window = window;
    global.localStorage = {
      getItem: vi.fn((key) => {
        if (key === 'flowPlannerTheme') return 'aurora';
        if (key === 'flowPlannerLanguage') return 'de';
        return null;
      }),
      setItem: vi.fn()
    };
    global.showToast = vi.fn();
    global.tr = vi.fn((obj) => obj.de || Object.values(obj)[0]);
  });

  it('should detect platform accurately based on userAgent/platform', async () => {
    await import('../app-installation-hub.js');
    expect(window.AppInstallationHub).toBeDefined();

    const originalNavigator = window.navigator;

    // Test Windows
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32' },
      configurable: true
    });
    expect(window.AppInstallationHub.detectPlatform()).toBe('windows');

    // Test Android
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B)', platform: 'Linux armv8l' },
      configurable: true
    });
    expect(window.AppInstallationHub.detectPlatform()).toBe('android');

    // Test macOS
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel' },
      configurable: true
    });
    expect(window.AppInstallationHub.detectPlatform()).toBe('macos');

    // Test Linux
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)', platform: 'Linux x86_64' },
      configurable: true
    });
    expect(window.AppInstallationHub.detectPlatform()).toBe('linux');

    // Test iOS
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)', platform: 'iPhone' },
      configurable: true
    });
    expect(window.AppInstallationHub.detectPlatform()).toBe('ios');

    // Restore navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true
    });
  });

  it('should open and close installation modal properly', () => {
    const modal = document.getElementById('modal-app-install');
    expect(modal.classList.contains('hidden')).toBe(true);

    window.AppInstallationHub.openInstallModal('windows');
    expect(modal.classList.contains('hidden')).toBe(false);

    window.AppInstallationHub.closeInstallModal();
    expect(modal.classList.contains('hidden')).toBe(true);
  });

  it('should switch between platform tabs and activate corresponding pane', () => {
    window.AppInstallationHub.openInstallModal('windows');
    expect(document.getElementById('install-pane-windows').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('install-pane-android').classList.contains('hidden')).toBe(true);

    window.AppInstallationHub.switchPlatformTab('android');
    expect(document.getElementById('install-pane-windows').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('install-pane-android').classList.contains('hidden')).toBe(false);

    window.AppInstallationHub.switchPlatformTab('macos');
    expect(document.getElementById('install-pane-macos').classList.contains('hidden')).toBe(false);

    window.AppInstallationHub.switchPlatformTab('wizard');
    expect(document.getElementById('install-pane-wizard').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('wizard-current-theme-name').textContent).toBe('aurora');
    expect(document.getElementById('wizard-current-lang-name').textContent).toBe('DE');
  });

  it('should handle desktop launcher downloads for Windows, Linux, and Offline Package', () => {
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    let appendedElement = null;
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      appendedElement = el;
      return el;
    });
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    // Windows .bat Installer
    window.AppInstallationHub.downloadDesktopLauncher('windows-bat');
    expect(appendedElement).toBeDefined();
    expect(appendedElement.download).toBe('Install-Noodle-Studio.bat');

    // Windows .url
    window.AppInstallationHub.downloadDesktopLauncher('windows-url');
    expect(appendedElement.download).toBe('Noodle-Studio.url');

    // Linux .desktop
    window.AppInstallationHub.downloadDesktopLauncher('linux-desktop');
    expect(appendedElement.download).toBe('noodle-studio.desktop');

    // Standalone Offline Pack
    window.AppInstallationHub.downloadDesktopLauncher('offline-pack');
    expect(appendedElement.download).toBe('Noodle-Studio-Standalone-Portable.html');

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
