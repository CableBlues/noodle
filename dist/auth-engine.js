/**
 * ============================================================================
 * Noodle - Authentifizierungs- & Account-Engine (auth-engine.js)
 * ============================================================================
 * Verwaltet die Benutzer-Authentifizierung und Session-Lebenszyklen:
 * - Registrierung & Anmeldung (E-Mail / Passwort)
 * - Cloud-Sync Token-Verwaltung & Kopplung
 * - Supabase Client Integration mit Fallback-API
 * - Reaktive Auth-State Listener für die Benutzeroberfläche
 * ============================================================================
 */

const FlowAuth = (function() {
  let supabaseClient = null;
  let currentUser = null;
  let currentSession = null;
  let customSyncToken = null;
  const listeners = [];

  function getConfig() {
    if (typeof FLOW_CONFIG !== 'undefined') {
      return FLOW_CONFIG;
    }
    if (typeof window !== 'undefined' && window.FLOW_CONFIG) {
      return window.FLOW_CONFIG;
    }
    // Falls config.js nicht geladen wurde, geben wir leere Endpunkte zurück,
    // damit init() kontrolliert in den lokalen Offline-Modus übergeht.
    console.error('[FlowAuth] FLOW_CONFIG wurde nicht gefunden. Bitte prüfen, ob config.js vor auth-engine.js eingebunden ist.');
    return { SUPABASE_URL: null, SUPABASE_ANON_KEY: null };
  }

  function getSupabaseLib() {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
      return supabase;
    }
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      return window.supabase;
    }
    if (typeof globalThis !== 'undefined' && globalThis.supabase && typeof globalThis.supabase.createClient === 'function') {
      return globalThis.supabase;
    }
    return null;
  }

  function init() {
    try {
      // 1. Prüfe auf hinterlegten Custom Token (z.B. durch Login oder 6-stellige Kopplung)
      if (typeof localStorage !== 'undefined') {
        const storedToken = localStorage.getItem('flow_sync_token');
        const storedEmail = localStorage.getItem('flow_sync_email');
        if (storedToken) {
          customSyncToken = storedToken;
          currentUser = { id: storedToken, email: storedEmail || 'Angemeldet', isTokenOnly: true };
        }
      }

      // 2. Initialisiere optionalen Supabase Client (falls konfiguriert)
      const supaLib = getSupabaseLib();
      const config = getConfig();

      if (supaLib && config && config.SUPABASE_URL && config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.includes('dummy_anon_key')) {
        supabaseClient = supaLib.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });

        // Bestehende Session abfragen & URL Hash prüfen
        supabaseClient.auth.getSession().then(({ data, error }) => {
          if (!error && data && data.session) {
            setSession(data.session);
          }
        }).catch(err => {
          console.warn('[FlowAuth] Could not retrieve Supabase session:', err.message);
        });

        // Listener für Login / Logout Events
        supabaseClient.auth.onAuthStateChange((event, session) => {
          setSession(session);
        });
      }
    } catch (e) {
      console.warn('[FlowAuth] Initialization notice (offline-safe):', e.message);
    }
  }

  function setSession(session) {
    currentSession = session;
    currentUser = session ? session.user : (customSyncToken ? { id: customSyncToken, email: (typeof localStorage !== 'undefined' ? localStorage.getItem('flow_sync_email') : '') || 'Angemeldet' } : null);
    
    if (session && session.user && typeof localStorage !== 'undefined') {
      localStorage.setItem('flow_sync_token', session.user.id);
      localStorage.setItem('flow_sync_email', session.user.email || '');
    }

    notifyListeners();
    updateAuthUI();
  }

  function subscribe(fn) {
    if (typeof fn === 'function') {
      listeners.push(fn);
    }
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  function notifyListeners() {
    listeners.forEach(fn => {
      try {
        fn({ user: currentUser, session: currentSession, token: getSyncToken() });
      } catch (e) {
        console.error('[FlowAuth] Listener error:', e);
      }
    });
  }

  // ==========================================================================
  // 1. ANMELDUNG (LOGIN) MIT E-MAIL & PASSWORT
  // ==========================================================================
  async function signInWithCredentials(email, password) {
    if (!email || !email.trim() || !email.includes('@')) {
      return { success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
    }
    if (!password) {
      return { success: false, error: 'Bitte gib dein Passwort ein.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, error: 'Keine Internetverbindung. Bitte stelle eine Verbindung her.' };
    }

    // 1. Supabase Auth
    if (!supabaseClient) {
      init();
    }

    if (supabaseClient) {
      try {
        let authRes = await supabaseClient.auth.signInWithPassword({
          email: trimmedEmail,
          password: password
        });

        if (authRes.error) {
          const errMsg = authRes.error.message || '';
          if (errMsg.toLowerCase().includes('email not confirmed') || errMsg.toLowerCase().includes('email_not_confirmed')) {
            return {
              success: false,
              error: 'E-Mail noch nicht bestätigt. Bitte klicke auf den Bestätigungslink in deiner E-Mail.'
            };
          }
          if (errMsg.toLowerCase().includes('invalid login credentials') || errMsg.toLowerCase().includes('user not found')) {
            return { success: false, error: 'E-Mail oder Passwort falsch. Noch kein Konto? Bitte wähle "Registrieren".' };
          }
          return { success: false, error: authRes.error.message || 'Anmeldung fehlgeschlagen.' };
        }

        if (authRes.data && authRes.data.user) {
          setSession(authRes.data.session || { user: authRes.data.user });
          return { success: true, email: trimmedEmail, token: authRes.data.user.id };
        }
      } catch (err) {
        console.warn('[FlowAuth] Supabase Auth notice:', err);
        return { success: false, error: err.message || getFriendlyNetworkErrorMessage() };
      }
    }

    return { success: false, error: 'Anmeldung derzeit nicht möglich. Bitte prüfe deine Internetverbindung.' };
  }

  // ==========================================================================
  // 1b. REGISTRIERUNG (SIGN UP) MIT E-MAIL & PASSWORT
  // ==========================================================================
  async function signUpWithCredentials(email, password) {
    if (!email || !email.trim() || !email.includes('@')) {
      return { success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Bitte wähle ein Passwort mit mindestens 8 Zeichen.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, error: 'Keine Internetverbindung. Bitte stelle eine Verbindung her.' };
    }

    // 1. Supabase Auth
    if (!supabaseClient) {
      init();
    }

    if (supabaseClient) {
      try {
        const signUpRes = await supabaseClient.auth.signUp({
          email: trimmedEmail,
          password: password
        });

        if (signUpRes.error) {
          const signErr = signUpRes.error.message || '';
          if (signErr.toLowerCase().includes('already registered')) {
            return { success: false, error: 'Diese E-Mail ist bereits registriert. Bitte wechsle zu "Anmelden".' };
          }
          return { success: false, error: signErr || 'Registrierung fehlgeschlagen.' };
        }

        if (signUpRes.data && signUpRes.data.user) {
          if (signUpRes.data.session) {
            setSession(signUpRes.data.session);
            return { success: true, email: trimmedEmail, token: signUpRes.data.user.id };
          } else {
            return {
              success: true,
              needEmailConfirm: true,
              email: trimmedEmail,
              message: 'Konto erstellt! Bitte prüfe deine E-Mails zur Bestätigung oder melde dich an.'
            };
          }
        }
      } catch (err) {
        console.warn('[FlowAuth] Supabase SignUp notice:', err);
        return { success: false, error: err.message || getFriendlyNetworkErrorMessage() };
      }
    }

    return { success: false, error: 'Registrierung derzeit nicht möglich. Bitte prüfe deine Internetverbindung.' };
  }

  function getFriendlyNetworkErrorMessage() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.protocol === 'file:') {
        return 'App über file:// geöffnet. Bitte über einen Webserver oder GitHub Pages öffnen.';
      }
    }
    return 'Supabase nicht erreichbar. Bitte prüfe deine Internetverbindung.';
  }

  // Legacy Magic Link Unterstützung (falls Supabase konfiguriert ist)
  async function signInWithMagicLink(email) {
    if (!email || !email.trim() || !email.includes('@')) {
      return { success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, error: 'Keine Internetverbindung. Bitte später erneut versuchen.' };
    }

    const supaLib = getSupabaseLib();
    if (!supabaseClient && supaLib) {
      init();
    }

    if (supabaseClient) {
      try {
        let redirectUrl = 'https://cableblues.github.io/Flow-Organiser/';
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
          redirectUrl = window.location.origin + window.location.pathname;
        }

        const { data, error } = await supabaseClient.auth.signInWithOtp({
          email: trimmedEmail,
          options: { emailRedirectTo: redirectUrl }
        });

        if (error) {
          return { success: false, error: error.message || 'Fehler beim Senden des Magic Links.' };
        }
        return { success: true, data: data };
      } catch (e) {
        return { success: false, error: e.message || 'Verbindungsfehler beim Anfordern des Magic Links.' };
      }
    }

    // Fallback auf lokales Konto falls kein Supabase konfiguriert ist
    return await signInWithCredentials(trimmedEmail, 'flow_noodle_pass');
  }

  // Passwort-Reset anfordern (Supabase Auth)
  async function requestPasswordReset(email) {
    if (!email || !email.trim() || !email.includes('@')) {
      return { success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, error: 'Keine Internetverbindung. Bitte später erneut versuchen.' };
    }

    const supaLib = getSupabaseLib();
    if (!supabaseClient && supaLib) {
      init();
    }

    if (supabaseClient) {
      try {
        let redirectUrl = 'https://cableblues.github.io/Flow-Organiser/';
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
          redirectUrl = window.location.origin + window.location.pathname;
        }

        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: redirectUrl
        });

        if (error) {
          return { success: false, error: error.message || 'Fehler beim Anfordern des Links zum Zurücksetzen des Passworts.' };
        }
        return { success: true, data: data, message: 'Link zum Zurücksetzen des Passworts wurde per E-Mail versendet.' };
      } catch (e) {
        return { success: false, error: e.message || 'Verbindungsfehler beim Anfordern des Passwort-Resets.' };
      }
    }

    return { success: false, error: 'Supabase-Dienst nicht verfügbar.' };
  }

  async function signOut() {
    try {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
    } catch (e) {
      console.warn('[FlowAuth] SignOut error:', e);
    }

    currentSession = null;
    currentUser = null;
    customSyncToken = null;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('flow_sync_token');
      localStorage.removeItem('flow_sync_email');
      localStorage.removeItem('flow_pending_sync');
    }

    notifyListeners();
    updateAuthUI();
    return { success: true };
  }

  function setDirectPairingToken(token, email = '') {
    if (!token || typeof token !== 'string') return;
    const cleanToken = token.trim();
    customSyncToken = cleanToken;
    currentUser = { id: cleanToken, email: email || 'Gekoppeltes Gerät', isTokenOnly: true };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('flow_sync_token', cleanToken);
      if (email) localStorage.setItem('flow_sync_email', email);
    }

    notifyListeners();
    updateAuthUI();
  }

  function getSyncToken() {
    if (currentUser && currentUser.id) {
      return currentUser.id;
    }
    if (customSyncToken) {
      return customSyncToken;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('flow_sync_token') || null;
    }
    return null;
  }

  function getUser() {
    return currentUser;
  }

  function getSession() {
    return currentSession;
  }

  function isLoggedIn() {
    return !!getSyncToken();
  }

  function updateAuthUI() {
    if (typeof document === 'undefined') return;

    const loggedIn = isLoggedIn();
    const user = getUser();
    const email = user ? user.email : '';

    // Dezent Anzeige im Header Sync-Button
    const headerSyncBtn = document.getElementById('header-sync-btn') || document.querySelector('button[onclick*="openP2PSyncModal"]');
    if (headerSyncBtn) {
      let badge = headerSyncBtn.querySelector('.sync-auth-indicator');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'sync-auth-indicator absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] transition-all duration-300';
        headerSyncBtn.appendChild(badge);
      }
      if (loggedIn) {
        badge.className = 'sync-auth-indicator absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0f] shadow-[0_0_8px_rgba(52,211,153,0.8)]';
        badge.title = `Eingeloggt als: ${email || 'Verbunden'}`;
      } else {
        badge.className = 'sync-auth-indicator absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gray-500/40 border border-[#0a0a0f]';
        badge.title = 'Nicht angemeldet (nur lokaler Modus)';
      }
    }

    // Modal UI Status
    const loginSection = document.getElementById('sync-auth-logged-out-section');
    const loggedInSection = document.getElementById('sync-auth-logged-in-section');
    const userEmailDisplay = document.getElementById('sync-auth-user-email');

    if (loginSection && loggedInSection) {
      loginSection.classList.toggle('hidden', loggedIn);
      loggedInSection.classList.toggle('hidden', !loggedIn);
      if (userEmailDisplay && email) {
        userEmailDisplay.innerText = email;
      }
    }
  }

  return {
    init,
    signInWithCredentials,
    signUpWithCredentials,
    signInWithMagicLink,
    requestPasswordReset,
    signOut,
    getUser,
    getSession,
    getSyncToken,
    isLoggedIn,
    setDirectPairingToken,
    subscribe,
    updateAuthUI,
    getSupabaseClient: () => supabaseClient,
    _setSupabaseClientForTesting: (mock) => { supabaseClient = mock; }
  };
})();

if (typeof window !== 'undefined') {
  window.NoodleAuth = FlowAuth;
  window.FlowAuth = FlowAuth;
  window.addEventListener('DOMContentLoaded', () => {
    FlowAuth.init();
  });
}
if (typeof globalThis !== 'undefined') {
  globalThis.NoodleAuth = FlowAuth;
  globalThis.FlowAuth = FlowAuth;
}
 