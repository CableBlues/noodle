// app-feedback.js - Intuitives & hochwertiges Feedback- & Einführungssystem
// ============================================================================

let currentFeedbackCategories = new Set(['idea']);
let isSubmittingFeedback = false;
let currentFeedbackModalTab = 'tour';

function getFeedbackTranslations() {
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'de';
  const dict = {
    de: {
      tab_tour: 'Einführung & Tour',
      tab_feedback: 'Feedback & Wünsche',
      title: 'Noodle Studio Hub',
      subtitle: 'App kennenlernen, Feedback geben & Wünsche teilen',
      tour_welcome_title: 'Willkommen bei Noodle Studio',
      tour_welcome_desc: 'Dein ruhiger Begleiter für Fokus, Alltag & Klarheit — 100% offline, privat & ohne Reizüberflutung.',
      tour_btn_start: 'Interaktive 4-Schritte Tour starten',
      cat_idea: '💡 Feature-Wunsch',
      cat_praise: '❤️ Lob & Eindrücke',
      cat_bug: '🐛 Problem melden',
      cat_other: 'Sonstiges',
      categories_label: 'Kategorie wählen:',
      msg_placeholder_default: 'Teile deine Gedanken, neue Feature-Wünsche oder was dir besonders gut gefällt...',
      msg_placeholder_idea: 'Welche Funktion oder Verbesserung würde deinen Alltag mit Noodle bereichern?',
      msg_placeholder_praise: 'Was gefällt dir am besten an Noodle? Wie hilft es dir im Alltag?',
      msg_placeholder_bug: 'Was ist passiert? Welche Schritte führen zu dem Problem?',
      msg_placeholder_other: 'Schreib mir einfach eine kurze Nachricht, Frage oder Anmerkung...',
      contact_label: 'Name oder E-Mail (optional für Rückfragen)',
      contact_placeholder: 'z.B. name@beispiel.de (kann frei bleiben)',
      send_btn: 'Feedback jetzt absenden',
      sending_btn: 'Wird übertragen...',
      success_title: 'Vielen Dank für dein Feedback! ❤️',
      success_desc: 'Deine Nachricht wurde direkt übertragen und hilft, Noodle kontinuierlich zu verfeinern.',
      direct_email_hint: 'Alternativ erreichst du mich direkt per E-Mail unter',
      close_btn: 'Schließen',
      err_empty: 'Bitte schreibe eine kurze Nachricht oder wähle ein Thema.'
    },
    en: {
      tab_tour: 'Guide & Tour',
      tab_feedback: 'Feedback & Ideas',
      title: 'Noodle Studio Hub',
      subtitle: 'Explore the app, share feedback & suggest ideas',
      tour_welcome_title: 'Welcome to Noodle Studio',
      tour_welcome_desc: 'Your calm companion for focus, daily tasks & clarity — 100% offline, private & distraction-free.',
      tour_btn_start: 'Start Interactive 4-Step Tour',
      cat_idea: '💡 Feature Request',
      cat_praise: '❤️ Praise & Thoughts',
      cat_bug: '🐛 Report Issue',
      cat_other: 'General / Other',
      categories_label: 'Select Category:',
      msg_placeholder_default: 'Share your thoughts, feature requests, or what you love most...',
      msg_placeholder_idea: 'What feature or improvement would enhance your daily workflow?',
      msg_placeholder_praise: 'What do you love most about Noodle? How does it help your day?',
      msg_placeholder_bug: 'What happened? What steps lead to the issue?',
      msg_placeholder_other: 'Drop a friendly message, question or thought...',
      contact_label: 'Name or Email (optional for replies)',
      contact_placeholder: 'e.g. name@example.com (optional)',
      send_btn: 'Send Feedback Now',
      sending_btn: 'Sending...',
      success_title: 'Thank you for your feedback! ❤️',
      success_desc: 'Your message was delivered directly and helps continuously improve Noodle.',
      direct_email_hint: 'Alternatively, email me directly at',
      close_btn: 'Close',
      err_empty: 'Please enter a brief message or select a topic.'
    },
    fr: {
      tab_tour: 'Guide & Visite',
      tab_feedback: 'Avis & Idées',
      title: 'Noodle Studio Hub',
      subtitle: 'Découvre l\'application et partage tes retours',
      tour_welcome_title: 'Bienvenue sur Noodle Studio',
      tour_welcome_desc: 'Ton compagnon serein pour la productivité et la clarté — 100% hors-ligne & privé.',
      tour_btn_start: 'Démarrer la visite guidée',
      cat_idea: '💡 Idée / Fonctionnalité',
      cat_praise: '❤️ Compliment & Avis',
      cat_bug: '🐛 Signaler un problème',
      cat_other: 'Autre / Question',
      categories_label: 'Choisir une catégorie :',
      msg_placeholder_default: 'Partage tes pensées, idées ou ce qui te plaît...',
      msg_placeholder_idea: 'Quelle fonctionnalité enrichirait ton flux de travail ?',
      msg_placeholder_praise: 'Qu\'apprécies-tu le plus dans Noodle ?',
      msg_placeholder_bug: 'Que s\'est-il passé ? Quelles étapes mènent au problème ?',
      msg_placeholder_other: 'Envoie un petit mot ou une question...',
      contact_label: 'Nom ou E-mail (facultatif)',
      contact_placeholder: 'ex. nom@exemple.fr (facultatif)',
      send_btn: 'Envoyer mes retours',
      sending_btn: 'Envoi en cours...',
      success_title: 'Merci beaucoup pour tes retours ! ❤️',
      success_desc: 'Ton message a bien été transmis directement.',
      direct_email_hint: 'Tu peux aussi m\'écrire directement par e-mail à',
      close_btn: 'Fermer',
      err_empty: 'Veuillez écrire un court message.'
    },
    es: {
      tab_tour: 'Guía y Tour',
      tab_feedback: 'Comentarios e Ideas',
      title: 'Noodle Studio Hub',
      subtitle: 'Explora la app y comparte tus comentarios',
      tour_welcome_title: 'Bienvenido a Noodle Studio',
      tour_welcome_desc: 'Tu compañero sereno para el enfoque y la claridad diaria — 100% offline y privado.',
      tour_btn_start: 'Iniciar tour interactivo',
      cat_idea: '💡 Nueva idea',
      cat_praise: '❤️ Elogios y opiniones',
      cat_bug: '🐛 Reportar problema',
      cat_other: 'Mensaje / Otro',
      categories_label: 'Selecciona una categoría:',
      msg_placeholder_default: 'Comparte tus pensamientos, propuestas o lo que más te guste...',
      msg_placeholder_idea: '¿Qué función mejoraría tu rutina diaria?',
      msg_placeholder_praise: '¿Qué es lo que más te gusta de Noodle?',
      msg_placeholder_bug: '¿Qué ocurrió? ¿Qué pasos reproducen el error?',
      msg_placeholder_other: 'Manda un saludo, pregunta o sugerencia...',
      contact_label: 'Nombre o Email (opcional)',
      contact_placeholder: 'ej. nombre@ejemplo.com (opcional)',
      send_btn: 'Enviar opinión ahora',
      sending_btn: 'Enviando...',
      success_title: '¡Muchas gracias por tu opinión! ❤️',
      success_desc: 'Tu mensaje ha sido enviado directamente.',
      direct_email_hint: 'Alternativamente puedes escribirme directamente a',
      close_btn: 'Cerrar',
      err_empty: 'Por favor escribe un mensaje.'
    },
    it: {
      tab_tour: 'Tour & Guida',
      tab_feedback: 'Feedback & Idee',
      title: 'Noodle Studio Hub',
      subtitle: 'Esplora l\'app e condividi i tuoi suggerimenti',
      tour_welcome_title: 'Benvenuto in Noodle Studio',
      tour_welcome_desc: 'Il tuo compagno calmo per concentrazione e chiarezza quotidiana — 100% offline e privato.',
      tour_btn_start: 'Avvia il tour interattivo',
      cat_idea: '💡 Idea / Feature',
      cat_praise: '❤️ Impressioni & Elogi',
      cat_bug: '🐛 Segnala errore',
      cat_other: 'Altro / Domanda',
      categories_label: 'Seleziona categoria:',
      msg_placeholder_default: 'Condividi pensieri, desideri o cosa ti piace di più...',
      msg_placeholder_idea: 'Quale funzionalità arricchirebbe il tuo flusso di lavoro?',
      msg_placeholder_praise: 'Cosa apprezzi di più in Noodle?',
      msg_placeholder_bug: 'Cosa è successo? Quali passaggi portano all\'errore?',
      msg_placeholder_other: 'Scrivi un messaggio o una domanda...',
      contact_label: 'Nome o Email (opzionale)',
      contact_placeholder: 'es. nome@esempio.it (opzionale)',
      send_btn: 'Invia feedback',
      sending_btn: 'Invio in corso...',
      success_title: 'Grazie mille per il tuo feedback! ❤️',
      success_desc: 'Il tuo messaggio è stato trasmesso direttamente.',
      direct_email_hint: 'In alternativa puoi scrivermi direttamente a',
      close_btn: 'Chiudi',
      err_empty: 'Scrivi un messaggio.'
    },
    el: {
      tab_tour: 'Περιήγηση',
      tab_feedback: 'Σχόλια & Ιδέες',
      title: 'Noodle Studio Hub',
      subtitle: 'Εξερεύνησε την εφαρμογή και μοιράσου ιδέες',
      tour_welcome_title: 'Καλώς ήρθες στο Noodle Studio',
      tour_welcome_desc: 'Ο ήρεμος σύντροφός σου για εστίαση και διαύγεια — 100% offline & ιδιωτικό.',
      tour_btn_start: 'Έναρξη περιήγησης',
      cat_idea: '💡 Νέα ιδέα',
      cat_praise: '❤️ Εντυπώσεις & Σχόλια',
      cat_bug: '🐛 Αναφορά προβλήματος',
      cat_other: 'Άλλο / Ερώτηση',
      categories_label: 'Επιλογή κατηγορίας:',
      msg_placeholder_default: 'Μοιράσου σκέψεις, ιδέες ή τι σου αρέσει περισσότερο...',
      msg_placeholder_idea: 'Ποια λειτουργία θα βελτίωνε τη ροή εργασίας σου;',
      msg_placeholder_praise: 'Τι σου αρέσει περισσότερο στο Noodle;',
      msg_placeholder_bug: 'Τι συνέβη; Ποια βήματα οδηγούν στο σφάλμα;',
      msg_placeholder_other: 'Στείλε ένα μήνυμα ή ερώτηση...',
      contact_label: 'Όνομα ή Email (προαιρετικό)',
      contact_placeholder: 'π.χ. name@example.gr (προαιρετικό)',
      send_btn: 'Αποστολή σχολίων',
      sending_btn: 'Αποστολή...',
      success_title: 'Ευχαριστούμε θερμά για τα σχόλιά σου! ❤️',
      success_desc: 'Το μήνυμά σου στάλθηκε επιτυχώς.',
      direct_email_hint: 'Εναλλακτικά μπορείς να μου στείλεις email στο',
      close_btn: 'Κλείσιμο',
      err_empty: 'Παρακαλώ γράψε ένα μήνυμα.'
    }
  };
  return dict[lang] || dict.de;
}

function setFeedbackModalTab(tab) {
  currentFeedbackModalTab = tab;
  renderFeedbackModalContent();
}
window.setFeedbackModalTab = setFeedbackModalTab;
if (typeof globalThis !== 'undefined') globalThis.setFeedbackModalTab = setFeedbackModalTab;

function openFeedbackModal(defaultCategory = null, tab = null) {
  if (defaultCategory) {
    currentFeedbackCategories = new Set([defaultCategory]);
    currentFeedbackModalTab = 'feedback';
  } else if (tab) {
    currentFeedbackModalTab = tab;
  }
  let modal = document.getElementById('app-feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'app-feedback-modal';
    modal.className = 'fixed inset-0 z-[170000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none';
    document.body.appendChild(modal);
  }

  renderFeedbackModalContent();
  modal.classList.remove('hidden');

  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

function closeFeedbackModal() {
  const modal = document.getElementById('app-feedback-modal');
  if (modal) modal.classList.add('hidden');
}

function toggleFeedbackCategory(catKey) {
  if (currentFeedbackCategories.has(catKey)) {
    if (currentFeedbackCategories.size > 1) {
      currentFeedbackCategories.delete(catKey);
    }
  } else {
    currentFeedbackCategories.add(catKey);
  }
  renderFeedbackModalContent();
}

function renderFeedbackModalContent(isSuccess = false) {
  const modal = document.getElementById('app-feedback-modal');
  if (!modal) return;
  const T = getFeedbackTranslations();

  if (isSuccess) {
    modal.innerHTML = `
      <div class="mobile-modal-card animate-spring-modal w-full max-w-md bg-[#0e0f17]/98 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center">
        <div class="absolute -top-24 -left-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-xl mb-3 shadow-md">
          <i data-lucide="check" class="w-6 h-6 text-emerald-400"></i>
        </div>
        <h3 class="text-lg font-bold font-display text-white mb-1.5">${T.success_title}</h3>
        <p class="text-xs text-gray-300 max-w-sm mb-5 leading-relaxed">${T.success_desc}</p>
        <button onclick="closeFeedbackModal()" class="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer">
          ${T.close_btn}
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    return;
  }

  // Determine dynamic placeholder
  let placeholder = T.msg_placeholder_default;
  if (currentFeedbackCategories.has('bug') && !currentFeedbackCategories.has('idea')) {
    placeholder = T.msg_placeholder_bug;
  } else if (currentFeedbackCategories.has('idea') && !currentFeedbackCategories.has('bug')) {
    placeholder = T.msg_placeholder_idea;
  } else if (currentFeedbackCategories.has('praise') && currentFeedbackCategories.size === 1) {
    placeholder = T.msg_placeholder_praise;
  } else if (currentFeedbackCategories.has('other') && currentFeedbackCategories.size === 1) {
    placeholder = T.msg_placeholder_other;
  }

  const prevText = document.getElementById('feedback-modal-msg')?.value || '';
  const prevContact = document.getElementById('feedback-modal-contact')?.value || '';

  modal.innerHTML = `
    <div class="mobile-modal-card animate-spring-modal w-full max-w-lg bg-[#0e0f17]/98 border border-white/10 rounded-3xl shadow-2xl p-5 sm:p-6 text-left relative overflow-hidden flex flex-col max-h-[92vh]">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-sm shrink-0">
            <i data-lucide="compass" class="w-4 h-4 text-purple-300"></i>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold font-display text-white leading-tight">${T.title}</h3>
            <p class="text-[11px] text-gray-400">${T.subtitle}</p>
          </div>
        </div>
        <button onclick="closeFeedbackModal()" aria-label="Schließen" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer font-bold text-sm">✕</button>
      </div>

      <!-- Clean 2-Tab Switcher -->
      <div class="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold gap-1 mt-3 mb-1 shrink-0">
        <button onclick="setFeedbackModalTab('tour')" class="flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${currentFeedbackModalTab === 'tour' ? 'bg-purple-600/30 border border-purple-400/40 text-white shadow-sm font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'}">
          <i data-lucide="compass" class="w-3.5 h-3.5 ${currentFeedbackModalTab === 'tour' ? 'text-purple-300' : ''}"></i>
          <span>${T.tab_tour}</span>
        </button>
        <button onclick="setFeedbackModalTab('feedback')" class="flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${currentFeedbackModalTab === 'feedback' ? 'bg-purple-600/30 border border-purple-400/40 text-white shadow-sm font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'}">
          <i data-lucide="heart" class="w-3.5 h-3.5 ${currentFeedbackModalTab === 'feedback' ? 'text-purple-300' : ''}"></i>
          <span>${T.tab_feedback}</span>
        </button>
      </div>

      ${currentFeedbackModalTab === 'tour' ? `
        <!-- TAB 1: EINFÜHRUNG & TOUR -->
        <div class="overflow-y-auto py-2.5 space-y-3 custom-scrollbar pr-0.5">
          <!-- Hero Card -->
          <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <i data-lucide="compass" class="w-4 h-4"></i>
              </div>
              <div>
                <h4 class="text-xs sm:text-sm font-bold text-white font-display">${T.tour_welcome_title}</h4>
                <p class="text-[11px] text-gray-300 leading-snug">${T.tour_welcome_desc}</p>
              </div>
            </div>
          </div>

          <!-- 4 Core Feature Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">📋</span>
              <div>
                <div class="text-xs font-bold text-white">Modulares Board</div>
                <div class="text-[10.5px] text-gray-400 leading-snug">Tagesplan, Haushalt & Spalten flexibel anpassen & organisieren.</div>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">🎧</span>
              <div>
                <div class="text-xs font-bold text-white">Soundscapes & Audio</div>
                <div class="text-[10.5px] text-gray-400 leading-snug">Naturklänge, Beats & Live-Radio zur Konzentration.</div>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">⏱️</span>
              <div>
                <div class="text-xs font-bold text-white">Fokus-Timer & Energie</div>
                <div class="text-[10.5px] text-gray-400 leading-snug">Hürden überwinden mit Sprints oder dem Energy-Picker.</div>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">🛡️</span>
              <div>
                <div class="text-xs font-bold text-white">100% Privat & Offline</div>
                <div class="text-[10.5px] text-gray-400 leading-snug">Alle Daten verbleiben sicher lokal auf deinem Gerät.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tour Footer Button -->
        <div class="pt-3 border-t border-white/10 shrink-0 flex flex-col gap-2">
          <button onclick="closeFeedbackModal(); startOnboardingTour();" class="w-full py-2.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md border border-purple-400/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i>
            <span>${T.tour_btn_start}</span>
          </button>
        </div>
      ` : `
        <!-- TAB 2: FEEDBACK & WÜNSCHE -->
        <div class="overflow-y-auto py-2.5 space-y-3 custom-scrollbar pr-0.5">
          
          <!-- Category Chips -->
          <div>
            <label class="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block mb-1.5">${T.categories_label}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button type="button" onclick="toggleFeedbackCategory('idea')" class="px-2 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1 ${currentFeedbackCategories.has('idea') ? 'bg-purple-500/20 border-purple-400/60 text-purple-200 font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}">
                <span>${T.cat_idea}</span>
              </button>
              <button type="button" onclick="toggleFeedbackCategory('praise')" class="px-2 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1 ${currentFeedbackCategories.has('praise') ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}">
                <span>${T.cat_praise}</span>
              </button>
              <button type="button" onclick="toggleFeedbackCategory('bug')" class="px-2 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1 ${currentFeedbackCategories.has('bug') ? 'bg-rose-500/20 border-rose-400/60 text-rose-200 font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}">
                <span>${T.cat_bug}</span>
              </button>
              <button type="button" onclick="toggleFeedbackCategory('other')" class="px-2 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1 ${currentFeedbackCategories.has('other') ? 'bg-purple-500/20 border-purple-400/60 text-purple-200 font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'}">
                <span>${T.cat_other}</span>
              </button>
            </div>
          </div>

          <!-- Message Textarea -->
          <div>
            <textarea id="feedback-modal-msg" rows="3" placeholder="${placeholder}" class="w-full p-3 bg-black/50 border border-white/15 focus:border-purple-400/80 rounded-2xl text-xs text-white placeholder:text-gray-500 outline-none transition custom-scrollbar font-sans resize-y leading-relaxed">${prevText}</textarea>
          </div>

          <!-- Optional Contact Field -->
          <div>
            <label for="feedback-modal-contact" class="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block mb-1">${T.contact_label}:</label>
            <input type="text" id="feedback-modal-contact" value="${prevContact}" placeholder="${T.contact_placeholder}" class="w-full p-2.5 px-3 bg-black/50 border border-white/15 focus:border-purple-400/80 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none transition" />
          </div>

        </div>

        <!-- Footer & Direct Send Action -->
        <div class="pt-3 border-t border-white/10 shrink-0 flex flex-col gap-2">
          <button id="feedback-submit-btn" onclick="submitAppFeedback()" class="w-full py-2.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md border border-purple-400/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2">
            <span>${T.send_btn}</span>
          </button>

          <!-- Subtle Direct Mail Notice -->
          <p class="text-[10.5px] text-gray-400 text-center leading-normal">
            ${T.direct_email_hint} <a href="mailto:jmonke@gmail.com" class="text-purple-300 hover:text-purple-200 underline font-mono">jmonke@gmail.com</a>
          </p>
        </div>
      `}

    </div>
  `;

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

async function submitAppFeedback() {
  if (isSubmittingFeedback) return;
  const T = getFeedbackTranslations();
  const msgEl = document.getElementById('feedback-modal-msg');
  const contactEl = document.getElementById('feedback-modal-contact');
  const submitBtn = document.getElementById('feedback-submit-btn');

  const message = msgEl ? msgEl.value.trim() : '';
  const contact = contactEl ? contactEl.value.trim() : 'Anonym';
  const categories = Array.from(currentFeedbackCategories);

  if (!message && categories.length === 0) {
    if (typeof showToast === 'function') showToast(T.err_empty);
    return;
  }

  isSubmittingFeedback = true;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>${T.sending_btn}</span>`;
  }

  // Client-Side Webhook (FormSubmit - sendet zuverlässig auch bei statischem Hosting)
  try {
    const fsRes = await fetch('https://formsubmit.co/ajax/jmonke@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `Noodle Feedback: [${categories.join(', ')}]`,
        Kategorien: categories.join(', '),
        Nachricht: message,
        Kontakt: contact,
        App: 'Noodle Studio',
        Zeit: new Date().toLocaleString()
      })
    });
  } catch (fsErr) {
    console.warn('[Feedback] Webhook notice:', fsErr);
  }

  isSubmittingFeedback = false;
  renderFeedbackModalContent(true);
  if (typeof triggerPraise === 'function') triggerPraise();

  // Automatisches Schließen nach 2 Sekunden
  setTimeout(() => {
    closeFeedbackModal();
    currentFeedbackCategories = new Set(['idea']);
  }, 2200);
}

if (typeof window !== 'undefined') {
  window.openFeedbackModal = openFeedbackModal;
  window.closeFeedbackModal = closeFeedbackModal;
  window.toggleFeedbackCategory = toggleFeedbackCategory;
  window.submitAppFeedback = submitAppFeedback;
}
if (typeof globalThis !== 'undefined') {
  globalThis.openFeedbackModal = openFeedbackModal;
  globalThis.closeFeedbackModal = closeFeedbackModal;
  globalThis.submitAppFeedback = submitAppFeedback;
}

async function submitAppFeedbackDirect() {
  const quickInput = document.getElementById('feedback-text');
  const msg = quickInput ? quickInput.value.trim() : '';
  if (!msg) {
    if (typeof showToast === 'function') {
      showToast((typeof tr === 'function') ? tr({ de: 'Bitte gib eine kurze Nachricht ein.', en: 'Please enter a short message.' }) : 'Bitte Nachricht eingeben.');
    }
    return;
  }

  try {
    fetch('https://formsubmit.co/ajax/jmonke@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'Noodle Feedback (Direkt)',
        Nachricht: msg,
        App: 'Noodle Studio',
        Quelle: 'Quick Feedback'
      })
    }).catch(err => console.warn('[Feedback] Direct fetch error:', err));
  } catch(e) {
    console.warn('[Feedback] submitAppFeedbackDirect exception:', e);
  }

  if (quickInput) quickInput.value = '';
  if (typeof togglePanel === 'function') togglePanel('feedback');
  if (typeof showToast === 'function') {
    showToast((typeof tr === 'function') ? tr({ de: 'Vielen Dank für dein Feedback! ❤️', en: 'Thank you for your feedback! ❤️' }) : 'Vielen Dank für dein Feedback! ❤️');
  }
  if (typeof triggerPraise === 'function') triggerPraise();
}
window.submitAppFeedbackDirect = submitAppFeedbackDirect;
if (typeof globalThis !== 'undefined') globalThis.submitAppFeedbackDirect = submitAppFeedbackDirect;
