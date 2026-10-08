const fs = require('fs');

let content = fs.readFileSync('app-social.js', 'utf8');

// 1. Add tr helper inside IIFE
const oldTop = `(function() {
  'use strict';`;

const newTop = `(function() {
  'use strict';

  function tr(obj) {
    const l = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' && window.currentLang) || 'de');
    if (!obj || typeof obj !== 'object') return obj || '';
    return obj[l] || obj['en'] || obj['de'] || Object.values(obj)[0] || '';
  }`;

if (!content.includes('function tr(obj)')) {
  content = content.replace(oldTop, newTop);
}

// 2. Localize copyCaptionAndOpen toasts
content = content.replace(
  "showToast('⚠️ Bitte schreibe zuerst einen Text oder wähle Hashtags.');",
  "showToast(tr({ de: '⚠️ Bitte schreibe zuerst einen Text oder wähle Hashtags.', en: '⚠️ Please write a text or select hashtags first.', fr: '⚠️ Veuillez d’abord écrire un texte ou choisir des hashtags.', it: '⚠️ Scrivi prima un testo o scegli gli hashtag.', es: '⚠️ Por favor, escribe un texto o selecciona hashtags primero.', el: '⚠️ Γράψε πρώτα κείμενο ή επίλεξε hashtags.' }));"
);
content = content.replace(
  "showToast('📋 Text kopiert! Öffne ' + platformKey + '...');",
  "showToast(tr({ de: '📋 Text kopiert! Öffne ' + platformKey + '...', en: '📋 Text copied! Opening ' + platformKey + '...', fr: '📋 Texte copié ! Ouverture de ' + platformKey + '...', it: '📋 Testo copiato! Apertura di ' + platformKey + '...', es: '📋 ¡Texto copiado! Abriendo ' + platformKey + '...', el: '📋 Το κείμενο αντιγράφηκε! Άνοιγμα ' + platformKey + '...' }));"
);

// 3. Localize tab navigation labels
content = content.replace(
  '<span>Post Studio</span>',
  '<span>${tr({ de: "Post Studio", en: "Post Studio", fr: "Studio de Posts", it: "Studio Post", es: "Estudio de Publicaciones", el: "Εργαστήριο Αναρτήσεων" })}</span>'
);
content = content.replace(
  '<span>Inspiration</span>',
  '<span>${tr({ de: "Inspiration", en: "Inspiration", fr: "Inspiration", it: "Ispirazione", es: "Inspiración", el: "Έμπνευση" })}</span>'
);
content = content.replace(
  '<span>Story Cards</span>',
  '<span>${tr({ de: "Story Cards", en: "Story Cards", fr: "Cartes Stories", it: "Card Storie", es: "Tarjetas de Historias", el: "Κάρτες Ιστοριών" })}</span>'
);

// 4. Localize tab content
content = content.replace(
  '<span>PLATTFORMEN & SCHNELLZUGRIFF</span>',
  '<span>${tr({ de: "PLATTFORMEN & SCHNELLZUGRIFF", en: "PLATFORMS & QUICK ACCESS", fr: "PLATEFORMES & ACCÈS RAPIDE", it: "PIATTAFORME & ACCESSO RAPIDO", es: "PLATAFORMAS Y ACCESO RÁPIDO", el: "ΠΛΑΤΦΟΡΜΕΣ & ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ" })}</span>'
);
content = content.replace(
  '<span>Öffnen ↗</span>',
  '<span>${tr({ de: "Öffnen ↗", en: "Open ↗", fr: "Ouvrir ↗", it: "Apri ↗", es: "Abrir ↗", el: "Άνοιγμα ↗" })}</span>'
);
content = content.replace(
  '<span>Meine Profile & Kanäle verknüpfen</span>',
  '<span>${tr({ de: "Meine Profile & Kanäle verknüpfen", en: "Link My Profiles & Channels", fr: "Lier mes profils & chaînes", it: "Collega i miei profili & canali", es: "Vincular mis perfiles y canales", el: "Σύνδεση των προφίλ & καναλιών μου" })}</span>'
);
content = content.replace(
  '<span class="text-[9px] text-gray-500 font-mono">100% lokal</span>',
  '<span class="text-[9px] text-gray-500 font-mono">${tr({ de: "100% lokal", en: "100% local", fr: "100% local", it: "100% locale", es: "100% local", el: "100% τοπικό" })}</span>'
);

content = content.replace(
  '<span>POST / CAPTION VERFASSEN</span>',
  '<span>${tr({ de: "POST / CAPTION VERFASSEN", en: "WRITE POST / CAPTION", fr: "RÉDIGER POST / LÉGENDE", it: "SCRIVI POST / DIDASCALIA", es: "ESCRIBIR PUBLICACIÓN / TEXTO", el: "ΣΥΝΤΑΞΗ ΑΝΑΡΤΗΣΗΣ / ΛΕΖΑΝΤΑΣ" })}</span>'
);
content = content.replace(
  'placeholder="Schreibe deinen Instagram-Post, Facebook-Beitrag oder Tweet hier..."',
  'placeholder="${tr({ de: \'Schreibe deinen Instagram-Post, Facebook-Beitrag oder Tweet hier...\', en: \'Write your Instagram post, Facebook update or tweet here...\', fr: \'Écrivez votre post Instagram, message Facebook ou tweet ici...\', it: \'Scrivi qui il tuo post Instagram, post Facebook o tweet...\', es: \'Escribe tu publicación de Instagram, Facebook o tweet aquí...\', el: \'Γράψε την ανάρτηση Instagram, Facebook ή tweet εδώ...\' })}"'
);
content = content.replace(
  '<span class="text-[10px] text-gray-400 font-semibold px-0.5">HASHTAG-PACKS (1-KLICK):</span>',
  '<span class="text-[10px] text-gray-400 font-semibold px-0.5">${tr({ de: "HASHTAG-PACKS (1-KLICK):", en: "HASHTAG PACKS (1-CLICK):", fr: "PACKS DE HASHTAGS (1-CLIC) :", it: "PACCHETTI HASHTAG (1-CLIC):", es: "PACKS DE HASHTAGS (1-CLIC):", el: "ΠΑΚΕΤΑ HASHTAG (1-ΚΛΙΚ):" })}</span>'
);
content = content.replace(
  '<span class="text-[10px] text-gray-400 font-semibold px-0.5">KOPIEREN & DIREKT POSTEN AUF:</span>',
  '<span class="text-[10px] text-gray-400 font-semibold px-0.5">${tr({ de: "KOPIEREN & DIREKT POSTEN AUF:", en: "COPY & POST DIRECTLY TO:", fr: "COPIER & PUBLIER DIRECTEMENT SUR :", it: "COPIA & PUBBLICA DIRETTAMENTE SU:", es: "COPIAR Y PUBLICAR DIRECTAMENTE EN:", el: "ΑΝΤΙΓΡΑΦΗ & ΑΠΕΥΘΕΙΑΣ ΑΝΑΡΤΗΣΗ ΣΕ:" })}</span>'
);

content = content.replace(
  '<span class="text-[10px] font-bold text-pink-300">Neuen Post / Reel-Link speichern</span>',
  '<span class="text-[10px] font-bold text-pink-300">${tr({ de: "Neuen Post / Reel-Link speichern", en: "Save New Post / Reel Link", fr: "Enregistrer un nouveau lien de post / reel", it: "Salva nuovo link post / reel", es: "Guardar nuevo enlace de post / reel", el: "Αποθήκευση νέου συνδέσμου ανάρτησης / reel" })}</span>'
);
content = content.replace(
  '<span>Merken</span>',
  '<span>${tr({ de: "Merken", en: "Save", fr: "Enregistrer", it: "Salva", es: "Guardar", el: "Αποθήκευση" })}</span>'
);
content = content.replace(
  '<span>GESPEICHERTE INSPIRATIONEN (${savedInspirations.length})</span>',
  '<span>${tr({ de: "GESPEICHERTE INSPIRATIONEN", en: "SAVED INSPIRATIONS", fr: "INSPIRATIONS ENREGISTRÉES", it: "ISPIRAZIONI SALVATE", es: "INSPIRACIONES GUARDADAS", el: "ΑΠΟΘΗΚΕΥΜΕΝΕΣ ΕΜΠΝΕΥΣΕΙΣ" })} (${savedInspirations.length})</span>'
);

content = content.replace(
  '<h4 class="text-xs font-bold text-white font-display">Visuelles Card & Story Studio</h4>',
  '<h4 class="text-xs font-bold text-white font-display">${tr({ de: "Visuelles Card & Story Studio", en: "Visual Card & Story Studio", fr: "Studio de cartes visuelles & stories", it: "Studio grafico per card & storie", es: "Estudio de tarjetas visuales e historias", el: "Εργαστήριο οπτικών καρτών & ιστοριών" })}</h4>'
);
content = content.replace(
  '<p class="text-[10px] text-gray-400 mt-0.5">Erstelle ästhetische 9:16 Stories, 1:1 Posts und 16:9 Banner deiner Streak- und Flow-Erfolge für Instagram & LinkedIn.</p>',
  '<p class="text-[10px] text-gray-400 mt-0.5">${tr({ de: "Erstelle ästhetische 9:16 Stories, 1:1 Posts und 16:9 Banner deiner Streak- und Flow-Erfolge für Instagram & LinkedIn.", en: "Create aesthetic 9:16 stories, 1:1 posts and 16:9 banners of your streak & flow achievements.", fr: "Créez des stories 9:16 esthétiques, posts 1:1 et bannières 16:9 de vos réussites.", it: "Crea storie 9:16 estetiche, post 1:1 e banner 16:9 dei tuoi successi di streak e flow.", es: "Crea historias 9:16 estéticas, posts 1:1 y banners 16:9 de tus logros de racha y flow.", el: "Δημιούργησε αισθητικές ιστορίες 9:16, αναρτήσεις 1:1 και banner 16:9 των επιτευγμάτων σου." })}</p>'
);
content = content.replace(
  '<span>Visual Story Studio öffnen 🚀</span>',
  '<span>${tr({ de: "Visual Story Studio öffnen 🚀", en: "Open Visual Story Studio 🚀", fr: "Ouvrir le studio de stories 🚀", it: "Apri lo studio di storie 🚀", es: "Abrir estudio de historias visuales 🚀", el: "Άνοιγμα εργαστηρίου οπτικών ιστοριών 🚀" })}</span>'
);

fs.writeFileSync('app-social.js', content, 'utf8');
console.log('Successfully localized app-social.js');
