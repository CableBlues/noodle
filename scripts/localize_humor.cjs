const fs = require('fs');

let content = fs.readFileSync('app-humor.js', 'utf8');

// 1. Add tr helper at the top of IIFE
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

// 2. Replace JOKES, ROAST_TEMPLATES, DECISIONS
const jokesSection = `  const JOKES = [
    {
      q: {
        de: "Warum prokrastinieren Entwickler gerne?",
        en: "Why do developers like to procrastinate?",
        fr: "Pourquoi les développeurs aiment-ils procrastiner ?",
        it: "Perché gli sviluppatori amano procrastinare?",
        es: "¿Por qué a los desarrolladores les gusta procrastinar?",
        el: "Γιατί αρέσει στους προγραμματιστές να χρονοτριβούν;"
      },
      a: {
        de: "Weil morgen die Anforderungen vielleicht deprecated sind!",
        en: "Because tomorrow the requirements might be deprecated!",
        fr: "Parce que demain les exigences seront peut-être obsolètes !",
        it: "Perché domani i requisiti potrebbero essere deprecati!",
        es: "¡Porque mañana los requisitos podrían estar obsoletos!",
        el: "Επειδή αύριο οι απαιτήσεις μπορεί να είναι παρωχημένες!"
      }
    },
    {
      q: {
        de: "Wie viele Programmierer braucht man, um eine Glühbirne zu wechseln?",
        en: "How many programmers does it take to change a light bulb?",
        fr: "Combien de programmeurs faut-il pour changer une ampoule ?",
        it: "Quanti programmatori servono per cambiare una lampadina?",
        es: "¿Cuántos programadores se necesitan para cambiar una bombilla?",
        el: "Πόσοι προγραμματιστές χρειάζονται για να αλλάξουν μια λάμπα;"
      },
      a: {
        de: "Keinen. Das ist ein Hardware-Problem!",
        en: "None. That's a hardware problem!",
        fr: "Aucun. C'est un problème matériel !",
        it: "Nessuno. È un problema hardware!",
        es: "¡Ninguno. Ese es un problema de hardware!",
        el: "Κανένας. Αυτό είναι πρόβλημα υλικού!"
      }
    },
    {
      q: {
        de: "Was ist das ADHS-Motto beim Aufräumen?",
        en: "What is the ADHD motto when tidying up?",
        fr: "Quelle est la devise TDAH pour ranger ?",
        it: "Qual è il motto ADHD per riordinare?",
        es: "¿Cuál es el lema del TDAH al ordenar?",
        el: "Ποιο είναι το μότο της ΔΕΠΥ στο συμμάζεμα;"
      },
      a: {
        de: "Ich bringe nur kurz dieses Buch ins Regal... und 4 Stunden später habe ich Origami gelernt.",
        en: "I'll just put this book back... and 4 hours later I mastered origami dragons.",
        fr: "Je range juste ce livre... et 4 heures plus tard j'ai appris l'origami.",
        it: "Metto solo questo libro a posto... e 4 ore dopo so fare origami.",
        es: "Solo voy a poner este libro en la estantería... y 4 horas después hago origami.",
        el: "Απλώς θα βάλω αυτό το βιβλίο στο ράφι... και 4 ώρες μετά έμαθα οριγκάμι."
      }
    },
    {
      q: {
        de: "Warum trinken Programmierer so viel Kaffee?",
        en: "Why do programmers drink so much coffee?",
        fr: "Pourquoi les développeurs boivent-ils autant de café ?",
        it: "Perché i programmatori bevono così tanto caffè?",
        es: "¿Por qué los programadores beben tanto café?",
        el: "Γιατί οι προγραμματιστές πίνουν τόσο καφέ;"
      },
      a: {
        de: "Weil Java ohne Kaffee nur ein Script ist.",
        en: "Because Java without coffee is just a script.",
        fr: "Parce que Java sans café n'est qu'un script.",
        it: "Perché Java senza caffè è solo uno script.",
        es: "Porque Java sin café es solo un script.",
        el: "Επειδή η Java χωρίς καφέ είναι απλώς ένα script."
      }
    }
  ];

  const ROAST_TEMPLATES = [
    {
      de: "👀 Schau dir diese Aufgabe an... Sie wartet seit 3 Tagen darauf, dass du sie in 90 Sekunden erledigst!",
      en: "👀 Look at this task... It has been waiting 3 days for you to finish it in 90 seconds!",
      fr: "👀 Regarde cette tâche... Elle t'attend depuis 3 jours pour la boucler en 90 secondes !",
      it: "👀 Guarda questo compito... Ti aspetta da 3 giorni per finirlo in 90 secondi!",
      es: "👀 Mira esta tarea... ¡Lleva 3 días esperando a que la termines en 90 segundos!",
      el: "👀 Κοίτα αυτή την εργασία... Σε περιμένει 3 μέρες να την τελειώσεις σε 90 δευτερόλεπτα!"
    },
    {
      de: "🔥 Wenn Prokrastination eine olympische Disziplin wäre, hättest du Gold. Klick auf Start!",
      en: "🔥 If procrastination were an Olympic sport, you'd take gold. Click Start!",
      fr: "🔥 Si la procrastination était un sport olympique, tu aurais l'or. Clique sur Démarrer !",
      it: "🔥 Se la procrastinazione fosse disciplina olimpica, vinceresti l'oro. Clicca Inizia!",
      es: "🔥 Si procrastinar fuera deporte olímpico, tendrías oro. ¡Haz clic en Iniciar!",
      el: "🔥 Αν η αναβλητικότητα ήταν ολυμπιακό άθλημα, θα έπαιρνες χρυσό. Πάτα Έναρξη!"
    }
  ];

  const DECISIONS = [
    {
      de: "🚀 Einfach anfangen (2-Minuten-Regel)!",
      en: "🚀 Just start (2-minute rule)!",
      fr: "🚀 Commencez simplement (règle des 2 minutes) !",
      it: "🚀 Inizia e basta (regola dei 2 minuti)!",
      es: "🚀 ¡Solo empieza (regla de los 2 minutos)!",
      el: "🚀 Απλώς ξεκίνα (κανόνας των 2 λεπτών)!"
    },
    {
      de: "☕ Hol dir ein Glas Wasser / Tee & los!",
      en: "☕ Grab a glass of water / tea & go!",
      fr: "☕ Prenez un verre d'eau / thé et c'est parti !",
      it: "☕ Prendi un bicchiere d'acqua / tè e vai!",
      es: "☕ ¡Toma un vaso de agua / té y listo!",
      el: "☕ Πάρε ένα ποτήρι νερό / τσάι και ξεκίνα!"
    },
    {
      de: "🎧 Lieblings-Beat anmachen & 10 Min Power!",
      en: "🎧 Put on your favorite beat & 10 min power!",
      fr: "🎧 Mettez votre musique préférée & 10 min de boost !",
      it: "🎧 Metti il tuo brano preferito & 10 min di energia!",
      es: "🎧 ¡Pon tu música favorita y 10 min de energía!",
      el: "🎧 Βάλε το αγαπημένο σου κομμάτι & 10 λεπτά δυναμικά!"
    },
    {
      de: "✂️ Zerlege die Aufgabe in 3 Mini-Schritte!",
      en: "✂️ Break the task down into 3 mini steps!",
      fr: "✂️ Découpez la tâche en 3 mini-étapes !",
      it: "✂️ Dividi il compito in 3 mini-passaggi!",
      es: "✂️ ¡Divide la tarea en 3 mini pasos!",
      el: "✂️ Σπάσε την εργασία σε 3 μικρά βήματα!"
    },
    {
      de: "🧘 3 tiefe Atemzüge & die leichteste Sache zuerst!",
      en: "🧘 3 deep breaths & easiest thing first!",
      fr: "🧘 3 respirations profondes & la chose la plus facile en premier !",
      it: "🧘 3 respiri profondi e la cosa più facile per prima!",
      es: "🧘 ¡3 respiraciones profundas y lo más fácil primero!",
      el: "🧘 3 βαθιές αναπνοές & το πιο εύκολο πρώτο!"
    },
    {
      de: "🎲 Würfeln: Gerade Zahl = Jetzt machen, Ungerade = 5 Min Dehnen!",
      en: "🎲 Roll dice: Even = Do now, Odd = 5 min stretch!",
      fr: "🎲 Lancez les dés : Pair = Faire maintenant, Impair = 5 min d'étirements !",
      it: "🎲 Lancia il dado: Pari = Fai ora, Dispari = 5 min stretching!",
      es: "🎲 Tira los dados: Par = Hazlo ya, Impar = ¡5 min de estiramiento!",
      el: "🎲 Ρίξε ζάρι: Ζυγός = Κάν' το τώρα, Μονός = 5 λεπτά τέντωμα!"
    }
  ];`;

// Replace old JOKES block
const oldJokesRegex = /const JOKES = \[[\s\S]*?const DECISIONS = \[[\s\S]*?\];/;
content = content.replace(oldJokesRegex, jokesSection);

// Update roastRandomTask, spinDecision, nextJoke
content = content.replace(
  'roastBox.textContent = randomRoast;',
  'roastBox.textContent = typeof randomRoast === "object" ? tr(randomRoast) : randomRoast;'
);
content = content.replace(
  'decisionBox.textContent = randomDec;',
  'decisionBox.textContent = typeof randomDec === "object" ? tr(randomDec) : randomDec;'
);
content = content.replace(
  'qEl.textContent = joke.q;\n      aEl.textContent = joke.a;',
  'qEl.textContent = typeof joke.q === "object" ? tr(joke.q) : joke.q;\n      aEl.textContent = typeof joke.a === "object" ? tr(joke.a) : joke.a;'
);

fs.writeFileSync('app-humor.js', content, 'utf8');
console.log('Successfully updated app-humor.js jokes and decision logic.');
