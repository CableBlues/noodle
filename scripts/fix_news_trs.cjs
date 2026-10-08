const fs = require('fs');

let news = fs.readFileSync('app-weather-news.js', 'utf8');

const replacements = [
  {
    target: "tr({ de: 'Heiter', en: 'Fair' })",
    repl: "tr({ de: 'Heiter', en: 'Fair', fr: 'Éclaircies', it: 'Sereno', es: 'Despejado', el: 'Αίθριος' })"
  },
  {
    target: "tr({ de: 'Ort entfernen', en: 'Remove city' })",
    repl: "tr({ de: 'Ort entfernen', en: 'Remove city', fr: 'Supprimer la ville', it: 'Rimuovi città', es: 'Eliminar ciudad', el: 'Αφαίρεση πόλης' })"
  },
  {
    target: "tr({ de: 'Ort gespeichert', en: 'Saved' })",
    repl: "tr({ de: 'Ort gespeichert', en: 'Saved', fr: 'Enregistré', it: 'Salvato', es: 'Guardado', el: 'Αποθηκεύτηκε' })"
  },
  {
    target: "tr({ de: '+ Ort anpinnen', en: '+ Pin city' })",
    repl: "tr({ de: '+ Ort anpinnen', en: '+ Pin city', fr: '+ Épingler la ville', it: '+ Fissa città', es: '+ Fijar ciudad', el: '+ Καρφίτσωμα πόλης' })"
  },
  {
    target: "tr({ de: 'oder Stadt suchen...', en: 'or search city...' })",
    repl: "tr({ de: 'oder Stadt suchen...', en: 'or search city...', fr: 'ou rechercher une ville...', it: 'o cerca città...', es: 'o buscar ciudad...', el: 'ή αναζήτηση πόλης...' })"
  },
  {
    target: "tr({ de: 'Ermittle deinen lokalen Standort... 📍', en: 'Detecting your local location... 📍' })",
    repl: "tr({ de: 'Ermittle deinen lokalen Standort... 📍', en: 'Detecting your local location... 📍', fr: 'Détection de votre position locale... 📍', it: 'Rilevamento della posizione locale... 📍', es: 'Detectando tu ubicación local... 📍', el: 'Εντοπισμός της τοποθεσίας σας... 📍' })"
  },
  {
    target: "tr({ de: 'Lokaler Standort nicht verfügbar. Zeige Hauptstadt der Sprache.', en: 'Local location not available. Showing language capital.' })",
    repl: "tr({ de: 'Lokaler Standort nicht verfügbar. Zeige Hauptstadt der Sprache.', en: 'Local location not available. Showing language capital.', fr: 'Emplacement local non disponible. Affichage de la capitale de la langue.', it: 'Posizione locale non disponibile. Mostro la capitale della lingua.', es: 'Ubicación local no disponible. Mostrando la capital del idioma.', el: 'Η τοπική τοποθεσία δεν είναι διαθέσιμη. Εμφάνιση της πρωτεύουσας της γλώσσας.' })"
  }
];

replacements.forEach(r => {
  news = news.split(r.target).join(r.repl);
});

fs.writeFileSync('app-weather-news.js', news, 'utf8');
console.log('Successfully updated app-weather-news.js');
