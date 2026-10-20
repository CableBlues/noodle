/**
 * @file app-feedback.js
 * @module FeedbackAndTourHub
 * @description
 * Integriertes Feedback- und Einführungsmodul.
 * Ermöglicht das Einreichen von Verbesserungsvorschlägen, Fehlermeldungen
 * oder Rückmeldungen sowie den jederzeitigen Neustart der Einführungstour.
 */

let currentFeedbackCategories = new Set(['idea']);
let isSubmittingFeedback = false;
let currentFeedbackModalTab = 'feedback';

function getFeedbackTranslations() {
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'de';
  const dict = {
    de: {
      tab_tour: 'Einführung & Tour',
      tab_feedback: 'Feedback & Wünsche',
      title: 'Feedback & Wünsche',
      subtitle: 'Deine Gedanken & Ideen direkt an den Entwickler',
      tour_welcome_title: 'Willkommen bei Noodle Studio',
      tour_welcome_desc: 'Dein ruhiger Begleiter für Fokus, Alltag & Klarheit — 100% offline, privat & ohne Reizüberflutung.',
      tour_btn_start: 'Interaktive 4-Schritte Tour starten',
      cat_idea: '💡 Feature-Wunsch',
      cat_praise: '❤️ Lob & Eindrücke',
      cat_bug: '🐛 Problem melden',
      cat_other: 'Sonstiges',
      categories_label: 'Thema wählen:',
      msg_placeholder_default: 'Teile deine Gedanken, neue Feature-Wünsche oder was dir besonders gut gefällt...',
      msg_placeholder_idea: 'Welche Funktion oder Verbesserung würde deinen Alltag mit Noodle bereichern?',
      msg_placeholder_praise: 'Was gefällt dir am besten an Noodle? Wie hilft es dir im Alltag?',
      msg_placeholder_bug: 'Was ist passiert? Welche Schritte führen zu dem Problem?',
      msg_placeholder_other: 'Schreib mir einfach eine kurze Nachricht, Frage oder Anmerkung...',
      contact_label: 'Deine E-Mail oder Name (für direkte Antwort)',
      contact_placeholder: 'z.B. deine-email@beispiel.de (optional)',
      send_btn: 'Feedback jetzt absenden 🚀',
      sending_btn: 'Wird übertragen...',
      success_title: 'Vielen Dank für dein Feedback! ❤️',
      success_desc: 'Deine Nachricht wurde direkt an jmonke@gmail.com übermittelt und hilft, Noodle noch besser zu machen.',
      direct_email_hint: 'Direktkontakt per E-Mail:',
      close_btn: 'Schließen',
      err_empty: 'Bitte schreibe eine kurze Nachricht oder wähle ein Thema.'
    },
    en: {
      tab_tour: 'Guide & Tour',
      tab_feedback: 'Feedback & Ideas',
      title: 'Feedback & Ideas',
      subtitle: 'Send your thoughts & ideas directly to the developer',
      tour_welcome_title: 'Welcome to Noodle Studio',
      tour_welcome_desc: 'Your calm companion for focus, daily tasks & clarity — 100% offline, private & distraction-free.',
      tour_btn_start: 'Start Interactive 4-Step Tour',
      cat_idea: '💡 Feature Request',
      cat_praise: '❤️ Praise & Thoughts',
      cat_bug: '🐛 Report Issue',
      cat_other: 'General / Other',
      categories_label: 'Select Topic:',
      msg_placeholder_default: 'Share your thoughts, feature requests, or what you love most...',
      msg_placeholder_idea: 'What feature or improvement would enhance your daily workflow?',
      msg_placeholder_praise: 'What do you love most about Noodle? How does it help your day?',
      msg_placeholder_bug: 'What happened? What steps lead to the issue?',
      msg_placeholder_other: 'Drop a friendly message, question or thought...',
      contact_label: 'Your Email or Name (for a reply)',
      contact_placeholder: 'e.g. your-email@example.com (optional)',
      send_btn: 'Send Feedback Now 🚀',
      sending_btn: 'Sending...',
      success_title: 'Thank you for your feedback! ❤️',
      success_desc: 'Your message was delivered directly to jmonke@gmail.com and helps continuously improve Noodle.',
      direct_email_hint: 'Direct developer contact:',
      close_btn: 'Close',
      err_empty: 'Please enter a brief message or select a topic.'
    },
    fr: {
      tab_tour: 'Guide & Visite',
      tab_feedback: 'Avis & Idées',
      title: 'Avis & Idées',
      subtitle: 'Vos remarques et idées directement au développeur',
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
      send_btn: 'Envoyer mes retours 🚀',
      sending_btn: 'Envoi en cours...',
      success_title: 'Merci beaucoup pour tes retours ! ❤️',
      success_desc: 'Ton message a été transmis directement à jmonke@gmail.com.',
      direct_email_hint: 'Contact direct :',
      close_btn: 'Fermer',
      err_empty: 'Veuillez écrire un court message.'
    },
    es: {
      tab_tour: 'Guía y Tour',
      tab_feedback: 'Comentarios e Ideas',
      title: 'Comentarios e Ideas',
      subtitle: 'Tus sugerencias e ideas directo al desarrollador',
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
      send_btn: 'Enviar opinión ahora 🚀',
      sending_btn: 'Enviando...',
      success_title: '¡Muchas gracias por tu opinión! ❤️',
      success_desc: 'Tu mensaje ha sido enviado directamente a jmonke@gmail.com.',
      direct_email_hint: 'Contacto directo por email:',
      close_btn: 'Cerrar',
      err_empty: 'Por favor escribe un mensaje.'
    },
    it: {
      tab_tour: 'Tour & Guida',
      tab_feedback: 'Feedback & Idee',
      title: 'Feedback & Idee',
      subtitle: 'I tuoi pensieri e suggerimenti direttamente allo sviluppatore',
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
      send_btn: 'Invia feedback 🚀',
      sending_btn: 'Invio in corso...',
      success_title: 'Grazie mille per il tuo feedback! ❤️',
      success_desc: 'Il tuo messaggio è stato inviato direttamente a jmonke@gmail.com.',
      direct_email_hint: 'Contatto diretto via email:',
      close_btn: 'Chiudi',
      err_empty: 'Scrivi un messaggio.'
    },
    el: {
      tab_tour: 'Περιήγηση',
      tab_feedback: 'Σχόλια & Ιδέες',
      title: 'Σχόλια & Ιδέες',
      subtitle: 'Οι σκέψεις και ιδέες σου απευθείας στον δημιουργό',
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
      send_btn: 'Αποστολή σχολίων 🚀',
      sending_btn: 'Αποστολή...',
      success_title: 'Ευχαριστούμε θερμά για τα σχόλιά σου! ❤️',
      success_desc: 'Το μήνυμά σου στάλθηκε επιτυχώς στο jmonke@gmail.com.',
      direct_email_hint: 'Άμεση επικοινωνία μέσω email:',
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
  }
  // Klick auf Feedback führt immer direkt zum Feedback-Tab, sofern nicht explizit 'tour' gewünscht ist
  if (tab) {
    currentFeedbackModalTab = tab;
  } else {
    currentFeedbackModalTab = 'feedback';
  }

  let modal = document.getElementById('app-feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'app-feedback-modal';
    modal.className = 'fixed inset-0 z-[170000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none';
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
      <div class="mobile-modal-card animate-spring-modal w-full max-w-md bg-gradient-to-b from-[#1e1b2e] to-[#14121f] border border-emerald-400/35 rounded-3xl shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center">
        <div class="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-2xl mb-3 shadow-lg">
          <i data-lucide="check-circle" class="w-7 h-7 text-emerald-300"></i>
        </div>
        <h3 class="text-lg font-bold font-display text-white mb-1.5">${T.success_title}</h3>
        <p class="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">${T.success_desc}</p>
        <button onclick="closeFeedbackModal()" class="px-6 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm">
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
    <div class="mobile-modal-card animate-spring-modal w-full max-w-lg bg-gradient-to-b from-[#1f1d2c] via-[#171524] to-[#12111d] border border-rose-300/20 rounded-3xl shadow-2xl p-5 sm:p-6 text-left relative overflow-hidden flex flex-col max-h-[92vh]">
      
      <!-- Warmer, freundlicher Hintergrund-Glow -->
      <div class="absolute -top-16 -right-16 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header mit warmen, freundlichen Akzenten -->
      <div class="flex items-center justify-between pb-3 border-b border-white/10 shrink-0 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500/25 to-rose-400/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-md shrink-0">
            <i data-lucide="message-square-heart" class="w-4.5 h-4.5 text-pink-300"></i>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold font-display text-white leading-tight">${T.title}</h3>
            <p class="text-[11px] text-rose-200/80">${T.subtitle}</p>
          </div>
        </div>
        <button onclick="closeFeedbackModal()" aria-label="Schließen" class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer font-bold text-sm">✕</button>
      </div>

      <!-- Freundlicher 2-Tab Switcher mit runderen Ecken & weichen Farbverläufen -->
      <div class="flex bg-black/30 p-1.5 rounded-2xl border border-white/10 text-xs font-bold gap-1 mt-3 mb-1 shrink-0 relative z-10">
        <button onclick="setFeedbackModalTab('feedback')" class="flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${currentFeedbackModalTab === 'feedback' ? 'bg-gradient-to-r from-rose-500/30 to-pink-500/30 border border-rose-400/50 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'}">
          <i data-lucide="heart" class="w-3.5 h-3.5 ${currentFeedbackModalTab === 'feedback' ? 'text-rose-300 fill-rose-400/30' : ''}"></i>
          <span>${T.tab_feedback}</span>
        </button>
        <button onclick="setFeedbackModalTab('tour')" class="flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${currentFeedbackModalTab === 'tour' ? 'bg-gradient-to-r from-amber-500/30 to-purple-500/30 border border-amber-400/50 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'}">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 ${currentFeedbackModalTab === 'tour' ? 'text-amber-300' : ''}"></i>
          <span>${T.tab_tour}</span>
        </button>
      </div>

      ${currentFeedbackModalTab === 'tour' ? `
        <!-- TAB: EINFÜHRUNG & TOUR -->
        <div class="overflow-y-auto py-2.5 space-y-3 custom-scrollbar pr-0.5 relative z-10">
          <!-- Hero Card -->
          <div class="p-4 rounded-2xl bg-white/[0.05] border border-amber-400/20 flex flex-col gap-1.5 shadow-sm">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <i data-lucide="compass" class="w-4.5 h-4.5"></i>
              </div>
              <div>
                <h4 class="text-xs sm:text-sm font-bold text-white font-display">${T.tour_welcome_title}</h4>
                <p class="text-[11px] text-slate-300 leading-snug">${T.tour_welcome_desc}</p>
              </div>
            </div>
          </div>

          <!-- 4 Core Feature Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">📋</span>
              <div>
                <div class="text-xs font-bold text-white">Modulares Board</div>
                <div class="text-[10.5px] text-slate-300 leading-snug">Tagesplan, Haushalt & Karten flexibel anpassen & organisieren.</div>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">🎧</span>
              <div>
                <div class="text-xs font-bold text-white">Soundscapes & Audio</div>
                <div class="text-[10.5px] text-slate-300 leading-snug">Naturklänge, Beats & Live-Radio zur Konzentration.</div>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">⏱️</span>
              <div>
                <div class="text-xs font-bold text-white">Fokus-Timer & Energie</div>
                <div class="text-[10.5px] text-slate-300 leading-snug">Hürden überwinden mit Sprints oder dem Energy-Picker.</div>
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5">
              <span class="text-base shrink-0">🛡️</span>
              <div>
                <div class="text-xs font-bold text-white">100% Privat & Offline</div>
                <div class="text-[10.5px] text-slate-300 leading-snug">Alle Daten verbleiben sicher lokal auf deinem Gerät.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tour Footer Button -->
        <div class="pt-3 border-t border-white/10 shrink-0 flex flex-col gap-2 relative z-10">
          <button onclick="closeFeedbackModal(); startOnboardingTour();" class="w-full py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg border border-pink-400/40 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i>
            <span>${T.tour_btn_start}</span>
          </button>
        </div>
      ` : `
        <!-- TAB: FEEDBACK & WÜNSCHE -->
        <div class="overflow-y-auto py-2.5 space-y-3.5 custom-scrollbar pr-0.5 relative z-10">
          
          <!-- Category Chips mit lebendigen, freundlichen Farben -->
          <div>
            <label class="text-[11px] font-semibold text-rose-200/90 block mb-1.5">${T.categories_label}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onclick="toggleFeedbackCategory('idea')" class="px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${currentFeedbackCategories.has('idea') ? 'bg-amber-500/25 border-amber-400/70 text-amber-200 font-bold shadow-sm' : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'}">
                <span>${T.cat_idea}</span>
              </button>
              <button type="button" onclick="toggleFeedbackCategory('praise')" class="px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${currentFeedbackCategories.has('praise') ? 'bg-rose-500/25 border-rose-400/70 text-rose-200 font-bold shadow-sm' : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'}">
                <span>${T.cat_praise}</span>
              </button>
              <button type="button" onclick="toggleFeedbackCategory('bug')" class="px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${currentFeedbackCategories.has('bug') ? 'bg-orange-500/25 border-orange-400/70 text-orange-200 font-bold shadow-sm' : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'}">
                <span>${T.cat_bug}</span>
              </button>
              <button type="button" onclick="toggleFeedbackCategory('other')" class="px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${currentFeedbackCategories.has('other') ? 'bg-purple-500/25 border-purple-400/70 text-purple-200 font-bold shadow-sm' : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'}">
                <span>${T.cat_other}</span>
              </button>
            </div>
          </div>

          <!-- Message Textarea mit freundlichem Glow-Fokus -->
          <div>
            <textarea id="feedback-modal-msg" rows="4" placeholder="${placeholder}" class="w-full p-3.5 bg-black/40 border border-white/15 focus:border-rose-400/80 focus:ring-2 focus:ring-rose-400/20 rounded-2xl text-xs text-white placeholder:text-slate-400 outline-none transition custom-scrollbar font-sans resize-y leading-relaxed shadow-inner">${prevText}</textarea>
          </div>

          <!-- Optional Contact Field -->
          <div>
            <label for="feedback-modal-contact" class="text-[11px] font-semibold text-rose-200/90 block mb-1.5">${T.contact_label}:</label>
            <input type="text" id="feedback-modal-contact" value="${prevContact}" placeholder="${T.contact_placeholder}" class="w-full p-2.5 px-3.5 bg-black/40 border border-white/15 focus:border-rose-400/80 focus:ring-2 focus:ring-rose-400/20 rounded-xl text-xs text-white placeholder:text-slate-400 outline-none transition shadow-inner" />
          </div>

        </div>

        <!-- Footer & Direct Send Action mit freundlichem Farbverlauf -->
        <div class="pt-3 border-t border-white/10 shrink-0 flex flex-col gap-2 relative z-10">
          <button id="feedback-submit-btn" onclick="submitAppFeedback()" class="w-full py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white rounded-xl text-xs font-bold shadow-lg border border-rose-300/40 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2">
            <span>${T.send_btn}</span>
          </button>

          <!-- Subtle Direct Mail Notice mit klarer jmonke@gmail.com Adresse -->
          <p class="text-[11px] text-slate-300 text-center leading-normal">
            ${T.direct_email_hint} <a href="mailto:jmonke@gmail.com" class="text-rose-300 hover:text-white underline font-semibold transition">jmonke@gmail.com</a>
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

  const subject = `Noodle Feedback: [${categories.join(', ')}]`;
  let sentSuccessfully = false;

  // 1. Client-Side Übertragung via FormSubmit Ajax an jmonke@gmail.com
  try {
    const res = await fetch('https://formsubmit.co/ajax/jmonke@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject,
        Kategorien: categories.join(', '),
        Nachricht: message,
        Kontakt: contact,
        _replyto: contact.includes('@') ? contact : undefined,
        App: 'Noodle Studio PWA',
        Zeit: new Date().toLocaleString()
      })
    });
    if (res && res.ok) {
      sentSuccessfully = true;
    }
  } catch (fsErr) {
    console.warn('[Feedback] FormSubmit fetch notice:', fsErr);
  }

  // 2. Fallback: Falls Offline / Blocker aktiv war, Mailto-Backup anbieten
  if (!sentSuccessfully && typeof window !== 'undefined') {
    try {
      const mailtoUrl = `mailto:jmonke@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Kategorien: ${categories.join(', ')}\nKontakt: ${contact}\n\nNachricht:\n${message}`)}`;
      window.open(mailtoUrl, '_blank');
      sentSuccessfully = true;
    } catch (e) {
      console.warn('[Feedback] Mailto fallback exception:', e);
    }
  }

  isSubmittingFeedback = false;
  renderFeedbackModalContent(true);
  if (typeof triggerPraise === 'function') triggerPraise();

  // Automatisches Schließen nach 2.5 Sekunden
  setTimeout(() => {
    closeFeedbackModal();
    currentFeedbackCategories = new Set(['idea']);
  }, 2500);
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
