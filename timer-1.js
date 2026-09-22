// timer.js Teil 1/3: State, Konstanten & Sound/Sprach-Hilfsfunktionen

var timerSeconds = 3 * 60; // Standardmäßig auf 3 Minuten initialisiert
var timerInitialSeconds = 3 * 60;
var timerRunning = false;
var timerInterval = null;
var activeTimerTask = null;
var timerTargetEndTime = null;

var timerSoundEnabled = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerSoundEnabled') : null) !== 'false';
var timerVoiceEnabled = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerVoiceEnabled') : null) !== 'false';
var timerAudioMode = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerAudioMode') : null) || 'ambient';
var timerVoiceRotationIndex = 0;
var lastSelectedTimerAmbient = null;
var currentSpeechSessionId = 0;

if (typeof window !== 'undefined') {
  window.timerSeconds = timerSeconds;
  window.timerInitialSeconds = timerInitialSeconds;
  window.timerRunning = timerRunning;
  window.timerInterval = timerInterval;
  window.activeTimerTask = activeTimerTask;
  window.timerTargetEndTime = timerTargetEndTime;
  window.currentSpeechSessionId = currentSpeechSessionId;
  window.timerSoundEnabled = timerSoundEnabled;
  window.timerVoiceEnabled = timerVoiceEnabled;
  window.timerAudioMode = timerAudioMode;
}
if (typeof globalThis !== 'undefined') {
  globalThis.timerSeconds = timerSeconds;
  globalThis.timerInitialSeconds = timerInitialSeconds;
  globalThis.timerRunning = timerRunning;
  globalThis.timerInterval = timerInterval;
  globalThis.activeTimerTask = activeTimerTask;
  globalThis.timerTargetEndTime = timerTargetEndTime;
  globalThis.currentSpeechSessionId = currentSpeechSessionId;
  globalThis.timerSoundEnabled = timerSoundEnabled;
  globalThis.timerVoiceEnabled = timerVoiceEnabled;
  globalThis.timerAudioMode = timerAudioMode;
}

// Audio-Intervalle für die harmonischen Synthesizer-Loops am Ende
var ringInterval = null;
var ringTimeout = null;
var currentEndingPatternIndex = 0;

// Tracker für die im Modal angezeigte Alarm-Klingelzeit
var ringingSeconds = 0;
var ringingSecondsInterval = null;

if (typeof window !== 'undefined') {
  window.ringInterval = ringInterval;
  window.ringTimeout = ringTimeout;
  window.currentEndingPatternIndex = currentEndingPatternIndex;
  window.ringingSeconds = ringingSeconds;
  window.ringingSecondsInterval = ringingSecondsInterval;
}
if (typeof globalThis !== 'undefined') {
  globalThis.ringInterval = ringInterval;
  globalThis.ringTimeout = ringTimeout;
  globalThis.currentEndingPatternIndex = currentEndingPatternIndex;
  globalThis.ringingSeconds = ringingSeconds;
  globalThis.ringingSecondsInterval = ringingSecondsInterval;
}

// Konstante Liste aller integrierten sanften Ambient-Sounds & Melodien zum Durchmischen
const TIMER_AMBIENTS = ['piano', 'lofi', 'chimes', 'space', 'guitar', 'singingbowl', 'musicbox', 'breeze', 'campfire', 'birds', 'cafe', 'clock', 'lofi_sunshine', 'summer_meadow', 'bossa_nova'];

// VIELFÄLTIGE NATÜRLICHE STIMMPROFILE: Warm, freundlich, empathisch, nicht roboterhaft
const VOICE_PROFILES = [
  // 1. FRAUENSTIMMEN (Warm, Sanft, Freundlich, Natürlich)
  { id: 'female_warm', name: 'Sanfte warme Begleiterin', pitch: 1.02, rate: 0.93, gender: 'female', style: 'warm' },
  { id: 'female_clear', name: 'Klare freundliche Stimme', pitch: 1.04, rate: 0.94, gender: 'female', style: 'clear' },
  { id: 'female_zen', name: 'Entspannte Zen-Stimme', pitch: 0.99, rate: 0.91, gender: 'female', style: 'zen' },
  { id: 'female_dynamic', name: 'Freundliche Motivatorin', pitch: 1.03, rate: 0.95, gender: 'female', style: 'dynamic' },

  // 2. MÄNNERSTIMMEN (Ruhig, Freundlich, Vertrauensvoll, Natürlich)
  { id: 'male_calm', name: 'Ruhiger freundlicher Coach', pitch: 0.98, rate: 0.93, gender: 'male', style: 'calm' },
  { id: 'male_warm', name: 'Warme entspannte Stimme', pitch: 0.96, rate: 0.92, gender: 'male', style: 'warm' },
  { id: 'male_steady', name: 'Freundlicher Begleiter', pitch: 0.99, rate: 0.94, gender: 'male', style: 'steady' },
  { id: 'male_coach', name: 'Empathischer Mentor', pitch: 1.00, rate: 0.94, gender: 'male', style: 'coach' }
];

let globalVoiceTurnIndex = 0;

// Motivierende Sätze, passend zum Fortschritt der Fokussitzung:
// - Start: Ruhig, geerdet, realistisch, ohne Übertreibung
// - Halfway: Beständig, im Fluss, achtsam
// - End: Konzentrierter Endspurt, Gedanken abschließen
// - Overdue: Entspannte Pause, Dehnen, Augen lockern
const MOTIVATIONAL_CHUNKS = {
  de: {
    start: [
      "Ganz in Ruhe anfangen. Nimm dir diesen ersten Schritt vor.",
      "Atme einmal durch und finde deinen eigenen Takt.",
      "Schritt für Schritt, ganz ohne Hektik.",
      "Lass dich nicht ablenken, jetzt zählt nur dieser Moment.",
      "Ein guter, ruhiger Anfang. Du hast die Zeit.",
      "Komm entspannt in deiner Aufgabe an.",
      "Einfach anfangen, der Rest fügt sich von selbst.",
      "Dein Fokus ist da. Mach es in deinem Tempo.",
      "Klarer Kopf, klare Sache. Ein Schritt nach dem anderen.",
      "Atme tief ein. Ganz ruhig loslegen.",
      "Konzentrier dich auf das Erste, was jetzt ansteht.",
      "Ruhig und gelassen beginnen."
    ],
    halfway: [
      "Guter Rhythmus. Bleib einfach ganz entspannt dabei.",
      "Die Mitte ist erreicht. Du bist gut im Fluss.",
      "Schultern kurz lockern und ruhig weiterarbeiten.",
      "Konzentration läuft gleichmäßig. Sehr schön.",
      "Der Faden ist da, bleib in diesem ruhigen Takt.",
      "Halbzeit geschafft. Weiter so mit Bedacht.",
      "Du bist voll drin. Lass es einfach fließen.",
      "Schöner, stetiger Fortschritt. Kein Stress.",
      "Kurzer Atemzug und mit klarem Kopf weiter.",
      "Dein Fokus trägt dich ruhig voran.",
      "Ruhig bleiben, du liegst genau richtig in der Zeit.",
      "Gleichmäßige Konzentration tut gut."
    ],
    end: [
      "Fast geschafft. Bring diesen Gedanken in Ruhe zu Ende.",
      "Der letzte Abschnitt. Bleib noch kurz aufmerksam.",
      "Gleich am Ziel. Zieh es ganz gelassen durch.",
      "Nur noch ein kleiner Moment. Schließe das Jetzt gut ab.",
      "Endspurt. Konzentriert bis zum Schluss.",
      "Fast fertig. Ein kurzer letzter Blick.",
      "Gleich hast du diesen Block gemeistert.",
      "Noch wenige Augenblicke. Bleib ganz bei der Sache.",
      "Die Ziellinie ist da. Sauber zu Ende führen.",
      "Gleich kannst du zufrieden aufblicken."
    ],
    overdue: [
      "Zeit für eine Pause. Atme tief durch und steh kurz auf.",
      "Sehr gut gemacht. Gönn deinen Augen jetzt etwas Ruhe.",
      "Schultern kreisen, kurz strecken und durchatmen.",
      "Ein Glas Wasser trinken und den Kopf frei machen.",
      "Klasse Fokus. Jetzt kurz komplett abschalten.",
      "Guter Block. Mach einen Moment die Augen zu.",
      "Tritt kurz vom Bildschirm zurück.",
      "Zeit zum Durchschnaufen. Danke für deine Konzentration!"
    ]
  },
  en: {
    start: [
      "Begin gently. Take this first step in your own time.",
      "Take a slow breath and settle into your pace.",
      "One small step at a time, no need to rush.",
      "Let distractions fade, just be in this present moment.",
      "A calm and steady start. You have all the time you need.",
      "Ease into your task with an open mind.",
      "Simply start, the flow will come naturally.",
      "Your focus is ready. Proceed at your own tempo.",
      "Clear mind, quiet focus. Step by step.",
      "Deep breath in. Begin with peaceful intent.",
      "Focus on the very first thing right in front of you.",
      "Calm and centered start."
    ],
    halfway: [
      "Good steady rhythm. Keep going with ease.",
      "Midpoint reached. You are moving along nicely.",
      "Relax your shoulders, breathe, and continue smoothly.",
      "Concentration is flowing evenly. Very well done.",
      "You have found the groove, stay with this calm pace.",
      "Halfway through. Keep moving mindfully.",
      "You are in the flow now. Let it unfold effortlessly.",
      "Steady and solid progress. No rush.",
      "Take a soft breath and carry on with clarity.",
      "Your focus is carrying you forward gently.",
      "Staying centered, you are right on time.",
      "Even concentration makes all the difference."
    ],
    end: [
      "Almost there. Wrap up this thought peacefully.",
      "The final stretch. Stay gently attentive.",
      "Near the finish line. See it through with calm confidence.",
      "Just a moment left. Finish this step mindfully.",
      "Final phase. Keep your focus right to the end.",
      "Nearly done. One last attentive look.",
      "You will complete this block in just a moment.",
      "Only moments remaining. Stay right here.",
      "The finish line is here. Bring it to a clean close.",
      "You can look up with satisfaction in a moment."
    ],
    overdue: [
      "Time for a break. Take a deep breath and stand up.",
      "Well done. Give your eyes a well-deserved rest.",
      "Roll your shoulders, stretch, and let go of tension.",
      "Drink a glass of water and clear your mind.",
      "Great focus today. Now switch off completely for a bit.",
      "Wonderful session. Close your eyes for a moment.",
      "Step away from the screen and take in the room.",
      "Time to breathe freely. Thank you for your concentration!"
    ]
  },
  fr: {
    start: [
      "Commence tout en douceur. Aborde ce premier pas avec sérénité.",
      "Prends une inspiration lente et trouve ton propre rythme.",
      "Une étape après l'autre, sans aucune précipitation.",
      "Laisse de côté les distractions, seul cet instant compte.",
      "Un départ calme et posé. Tu as tout le temps nécessaire.",
      "Installe-toi paisiblement dans ta tâche.",
      "Commence simplement, la suite viendra naturellement.",
      "Ton attention est là. Avance à ton propre rythme.",
      "Esprit clair et détendu. Un pas après l'autre.",
      "Respire profondément. Démarre en toute tranquillité.",
      "Concentre-toi sur la première chose à faire.",
      "Un début calme et centré."
    ],
    halfway: [
      "Bon rythme régulier. Continue avec fluidité.",
      "Mi-parcours atteint. Tout se passe à merveille.",
      "Détends un instant tes épaules et poursuis calmement.",
      "La concentration est stable et agréable. Bravo.",
      "Le fil conducteur est là, reste dans cette cadence.",
      "Déjà la moitié. Continue avec cette belle constance.",
      "Tu es bien dans ton travail. Laisse couler.",
      "Beau travail régulier, sans aucun stress.",
      "Une douce respiration et on continue l'esprit clair.",
      "Ton élan tranquille te porte vers l'avant.",
      "Reste serein, tu es parfaitement dans les temps.",
      "Cette concentration équilibrée fait du bien."
    ],
    end: [
      "Presque fini. Termine cette idée en toute tranquillité.",
      "Dernière ligne droite. Reste attentif encore un instant.",
      "Tout près du but. Mène cela à bien sereinement.",
      "Plus que quelques instants. Conclus cette étape avec soin.",
      "Dernier effort. Concentré jusqu'au bout.",
      "Bientôt terminé. Un dernier regard attentif.",
      "Tu auras accompli cette tâche d'une minute à l'autre.",
      "Encore quelques secondes. Reste bien présent.",
      "La fin est là. Boucle cela proprement.",
      "Tu pourras savourer ce moment dans un instant."
    ],
    overdue: [
      "C'est l'heure de la pause. Respire à fond et lève-toi.",
      "Très beau travail. Accorde un repos bien mérité à tes yeux.",
      "Fais rouler tes épaules, étire-toi et relâche la pression.",
      "Bois un verre d'eau et aère-toi l'esprit.",
      "Superbe concentration. Déconnecte totalement un moment.",
      "Belle session. Ferme les yeux quelques secondes.",
      "Éloigne-toi de l'écran et regarde au loin.",
      "Temps de souffler. Bravo pour ta concentration !"
    ]
  },
  it: {
    start: [
      "Inizia con calma. Affronta questo primo passo senza fretta.",
      "Fai un respiro profondo e trova il tuo ritmo naturale.",
      "Un passo alla volta, con tutta la serenità possibile.",
      "Lascia andare le distrazioni, conta solo questo momento.",
      "Una partenza serena e ordinata. Hai tutto il tempo.",
      "Entra nel compito con mente aperta e rilassata.",
      "Basta iniziare, il resto verrà da sé.",
      "Il tuo focus è pronto. Procedi con il tuo passo.",
      "Mente lucida e tranquilla. Un passo dopo l'altro.",
      "Respira a fondo. Comincia con calma.",
      "Concentrati sulla prima cosa che hai davanti.",
      "Inizio calmo e centrato."
    ],
    halfway: [
      "Ottimo ritmo costante. Continua con naturalezza.",
      "Metà percorso raggiunto. Stai procedendo benissimo.",
      "Sciogli le spalle per un attimo e prosegui sereno.",
      "La concentrazione scorre in modo armonioso. Molto bene.",
      "Hai preso il filo giusto, resta in questo ritmo quieto.",
      "Metà fatta. Avanti così con attenzione.",
      "Sei immerso nel compito. Lascia scorrere.",
      "Progresso solido e continuo. Niente stress.",
      "Un respiro morbido e si continua con chiarezza.",
      "Il tuo impegno ti sta guidando con delicatezza.",
      "Rimani tranquillo, sei perfettamente nei tempi.",
      "Una concentrazione equilibrata porta ottimi frutti."
    ],
    end: [
      "Quasi fatto. Concludi questo pensiero con serenità.",
      "Tratto finale. Rimani attento ancora per un momento.",
      "A un passo dal traguardo. Porta a termine con calma.",
      "Mancano pochi istanti. Chiudi questo passaggio con cura.",
      "Sprint finale. Concentrato fino alla fine.",
      "Quasi terminato. Un ultimo sguardo attento.",
      "Tra poco avrai completato questa sessione.",
      "Ancora qualche istante. Resta concentrato qui.",
      "Il traguardo è raggiunto. Chiudi in bellezza.",
      "Tra un momento potrai sentirti molto soddisfatto."
    ],
    overdue: [
      "È tempo di una pausa. Fai un respiro profondo e alzati.",
      "Ottimo lavoro. Concedi un meritato riposo agli occhi.",
      "Ruota le spalle, fai un po' di stretching e rilassati.",
      "Bevi un bicchiere d'acqua e libera la mente.",
      "Grande focus. Ora stacca completamente per qualche minuto.",
      "Sessione splendida. Chiudi gli occhi per un attimo.",
      "Allontanati dallo schermo e guarda lontano.",
      "Momento di respirare. Grazie per la tua concentrazione!"
    ]
  },
  es: {
    start: [
      "Empieza con calma. Da este primer paso a tu ritmo.",
      "Respira hondo y encuentra tu propio compás.",
      "Paso a paso, sin ninguna prisa.",
      "Deja fuera las distracciones, solo cuenta este momento.",
      "Un inicio sereno y ordenado. Tienes todo el tiempo.",
      "Entra en la tarea con la mente tranquila.",
      "Solo empieza, el flujo vendrá por sí solo.",
      "Tu enfoque está listo. Avanza a tu manera.",
      "Mente clara y despejada. Un paso tras otro.",
      "Respira profundo. Comienza con sosiego.",
      "Concéntrate en lo primero que tienes delante.",
      "Comienzo tranquilo y centrado."
    ],
    halfway: [
      "Buen ritmo constante. Sigue así con naturalidad.",
      "Mitad del camino alcanzada. Vas muy bien.",
      "Relaja los hombros un segundo y continúa tranquilo.",
      "La concentración fluye de manera uniforme. Muy bien.",
      "Tienes el hilo correcto, mantén este ritmo sereno.",
      "La mitad está hecha. Sigue con calma.",
      "Estás totalmente enfocado. Deja que fluya.",
      "Progreso firme y constante. Sin agobios.",
      "Una respiración suave y seguimos con claridad.",
      "Tu dedicación te lleva hacia adelante suavemente.",
      "Mantén la calma, vas perfecto de tiempo.",
      "Una concentración equilibrada hace maravillas."
    ],
    end: [
      "Casi listo. Remata esta idea con serenidad.",
      "Tramo final. Mantente atento un momento más.",
      "Cerca de la meta. Concluye con tranquilidad.",
      "Solo falta un instante. Cierra este paso con esmero.",
      "Recta final. Concentrado hasta el final.",
      "Prácticamente terminado. Un último vistazo atento.",
      "En breve habrás completado este bloque.",
      "Quedan pocos segundos. Sigue presente aquí.",
      "La meta está aquí. Ciérralo con limpieza.",
      "En un momento podrás disfrutar de la satisfacción."
    ],
    overdue: [
      "Momento de descansar. Respira hondo y ponte de pie.",
      "Muy buen trabajo. Dale un descanso merecido a tus ojos.",
      "Mueve los hombros, estírate y suelta la tensión.",
      "Bebe un vaso de agua y despeja la mente.",
      "Gran enfoque hoy. Desconecta del todo unos minutos.",
      "Sesión estupenda. Cierra los ojos un instante.",
      "Aléjate de la pantalla y mira a lo lejos.",
      "Hora de respirar aliviado. ¡Gracias por tu concentración!"
    ]
  },
  el: {
    start: [
      "Ξεκίνα με απόλυτη ηρεμία. Κάνε αυτό το πρώτο βήμα στον δικό σου χρόνο.",
      "Πάρε μια βαθιά ανάσα και βρες τον δικό σου ρυθμό.",
      "Βήμα προς βήμα, χωρίς καμία βιασύνη.",
      "Άφησε τις αποσπάσεις στην άκρη, μετράει μόνο αυτή η στιγμή.",
      "Ένα ήρεμο και σταθερό ξεκίνημα. Έχεις όλο τον χρόνο.",
      "Μπες στην εργασία σου με καθαρό και ήσυχο μυαλό.",
      "Απλώς ξεκίνα, η ροή θα έρθει φυσικά.",
      "Η προσοχή σου είναι έτοιμη. Προχώρα με τον ρυθμό σου.",
      "Καθαρό μυαλό, ήρεμη εστίαση. Ένα βήμα τη φορά.",
      "Ανάπνευσε βαθιά. Ξεκίνα με γαλήνη.",
      "Εστίασε στο πρώτο πράγμα που έχεις μπροστά σου.",
      "Ήρεμο και συγκεντρωμένο ξεκίνημα."
    ],
    halfway: [
      "Ωραίος σταθερός ρυθμός. Συνέχισε απλά και αβίαστα.",
      "Έφτασες στα μισά. Προχωράς πολύ όμορφα.",
      "Χαλάρωσε λίγο τους ώμους σου και συνέχισε ήρεμα.",
      "Η συγκέντρωση ρέει ομοιόμορφα. Πολύ καλά.",
      "Έχεις βρει τον μίτο, μείνε σε αυτόν τον γαλήνιο ρυθμό.",
      "Τα μισά έγιναν. Συνέχισε με προσοχή.",
      "Είσαι μέσα στην εργασία σου. Άφησέ το να κυλήσει.",
      "Σταθερή και όμορφη πρόοδος. Χωρίς κανένα άγχος.",
      "Μια ήρεμη ανάσα και συνεχίζεις με διαύγεια.",
      "Η εστίασή σου σε οδηγεί μπροστά με ευκολία.",
      "Μείνε ήρεμος, είσαι απόλυτα μέσα στον χρόνο σου.",
      "Η ισορροπημένη συγκέντρωση κάνει τη διαφορά."
    ],
    end: [
      "Σχεδόν τελείωσες. Ολοκλήρωσε αυτή τη σκέψη με ηρεμία.",
      "Τελική ευθεία. Μείνε συγκεντρωμένος για λίγο ακόμα.",
      "Κοντά στον τερματισμό. Ολοκλήρωσέ το με άνεση.",
      "Απομένει μόνο μια στιγμή. Κλείσε αυτό το βήμα με φροντίδα.",
      "Τελικό στάδιο. Εστίαση μέχρι το τέλος.",
      "Σχεδόν έτοιμο. Μια τελευταία προσεκτική ματιά.",
      "Σε λίγο θα έχεις ολοκληρώσει αυτό το κομμάτι.",
      "Έμειναν ελάχιστα δευτερόλεπτα. Μείνε εδώ.",
      "Το τέλος έφτασε. Ολοκλήρωσε όμορφα.",
      "Σε λίγο θα νιώσεις τη γλυκιά ικανοποίηση."
    ],
    overdue: [
      "Ώρα για διάλειμμα. Πάρε μια βαθιά ανάσα και σήκω για λίγο.",
      "Πολύ ωραία δουλειά. Χάρισε ξεκούραση στα μάτια σου.",
      "Κάνε κυκλικές κινήσεις στους ώμους και τεντώσου.",
      "Πιες ένα ποτήρι δροσερό νερό και καθάρισε το μυαλό σου.",
      "Υπέροχη εστίαση. Τώρα αποσυνδέσου εντελώς για λίγο.",
      "Όμορφη συνεδρία. Κλείσε τα μάτια σου για λίγες στιγμές.",
      "Απομακρύνσου από την οθόνη και κοίταξε μακριά.",
      "Ώρα να αναπνεύσεις ελεύθερα. Ευχαριστούμε για τη συγκέντρωσή σου!"
    ]
  }
};

// Kurze, herzliche und unaufdringliche Ansagen beim Start einer Fokus-Sitzung
const SESSION_START_PHRASES = {
  de: [
    "Fokuszeit gestartet, {mins} Minuten. Ganz in Ruhe anfangen.",
    "{mins} Minuten Fokus. Finde deinen eigenen Takt.",
    "Timer läuft, {mins} Minuten. Schritt für Schritt.",
    "Auf geht's. {mins} Minuten für deine Aufgabe.",
    "{mins} Minuten Fokusblock. Durchatmen und loslegen."
  ],
  en: [
    "Focus session started, {mins} minutes. Begin in your own time.",
    "{mins} minutes of focus. Find your gentle pace.",
    "Timer running, {mins} minutes. Step by step.",
    "Here we go. {mins} minutes for your task.",
    "A {mins}-minute focus block begins. Breathe and start."
  ],
  fr: [
    "Session démarrée, {mins} minutes. Commence tout en douceur.",
    "{mins} minutes de concentration. Trouve ton propre tempo.",
    "Minuteur lancé, {mins} minutes. Pas à pas.",
    "C'est parti. {mins} minutes pour ton travail.",
    "Un bloc de {mins} minutes commence. Respire et débute."
  ],
  it: [
    "Sessione avviata, {mins} minuti. Comincia con tutta calma.",
    "{mins} minuti di concentrazione. Trova il tuo ritmo naturale.",
    "Timer avviato, {mins} minuti. Un passo alla volta.",
    "Si parte. {mins} minuti per il tuo compito.",
    "Un blocco da {mins} minuti è iniziato. Respira e comincia."
  ],
  es: [
    "Sesión iniciada, {mins} minutos. Comienza a tu ritmo.",
    "{mins} minutos de enfoque. Encuentra tu compás.",
    "Temporizador en marcha, {mins} minutos. Paso a paso.",
    "Adelante. {mins} minutos para tu tarea.",
    "Un bloque de {mins} minutos comienza. Respira e inicia."
  ],
  el: [
    "Η συνεδρία ξεκίνησε, {mins} λεπτά. Ξεκίνα με ηρεμία.",
    "{mins} λεπτά εστίασης. Βρες τον δικό σου ρυθμό.",
    "Το χρονόμετρο τρέχει, {mins} λεπτά. Βήμα προς βήμα.",
    "Πάμε. {mins} λεπτά για την εργασία σου.",
    "Ένα διάστημα {mins} λεπτών ξεκινά. Πάρε ανάσα και άρχισε."
  ]
};

// Ansagen beim Erreichen von 00:00
const TIME_UP_PHRASES = {
  de: "Die Zeit ist abgelaufen!",
  en: "Time is up!",
  es: "¡El tiempo ha terminado!",
  el: "Ο χρόνος τελείωσε!",
  fr: "Le temps est écoulé !",
  it: "Il tempo è scaduto!"
};

// Ansagen bei 30 Sekunden Überzeit
const OVERDUE_30S_LABELS = {
  de: "30 Sekunden über der Zeit.",
  en: "30 seconds overtime.",
  es: "30 segundos de exceso.",
  el: "30 δευτερόλεπτα καθυστέρηση.",
  fr: "30 secondes de dépassement.",
  it: "30 secondi di ritardo."
};

// Ansagen für die Minuten, die über die eingestellte Zeit hinaus verstreichen ("Überzeit")
const OVERDUE_MINUTE_LABELS = {
  de: (n) => n === 1 ? "1 Minute überzogen" : `${n} Minuten überzogen`,
  en: (n) => n === 1 ? "1 minute overtime" : `${n} minutes overtime`,
  es: (n) => n === 1 ? "1 minuto de exceso" : `${n} minutos de exceso`,
  el: (n) => n === 1 ? "1 λεπτό καθυστέρηση" : `${n} λεπτά καθυστέρηση`,
  fr: (n) => n === 1 ? "1 minute de dépassement" : `${n} minutes de dépassement`,
  it: (n) => n === 1 ? "1 minuto di ritardo" : `${n} minuti di ritardo`
};

// Zuletzt verwendete Sprüche merken, damit sich innerhalb einer Sitzung nichts unmittelbar wiederholt
let lastMotivationByTier = {};
let lastSessionStartPhrase = null;
let lastChimePatternIndex = -1;

function pickWithoutImmediateRepeat(list, lastValue) {
  if (!list || list.length === 0) return "";
  if (list.length === 1) return list[0];
  let choice;
  do {
    choice = list[Math.floor(Math.random() * list.length)];
  } while (choice === lastValue);
  return choice;
}

function safeTr(obj) {
  if (typeof tr === 'function') return tr(obj);
  if (typeof t === 'function' && typeof obj === 'string') return t(obj);
  if (!obj || typeof obj !== 'object') return String(obj || '');
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  return obj[lang] || obj.de || obj.en || Object.values(obj)[0] || '';
}

function safeTranslate(key) {
  if (typeof TRANSLATIONS === 'undefined') return key;
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.de?.[key] || key;
}

function getCurrentPresetMinutes() {
  const presetReal = document.getElementById('timer-preset-select-real');
  return presetReal ? (parseInt(presetReal.value) || 2) : 2;
}

// Synchronisiert den Timer-Zustand beim Laden
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const mins = getCurrentPresetMinutes();
    timerSeconds = mins * 60;
    timerInitialSeconds = mins * 60;
    if (typeof updateTimerDisplay === 'function') updateTimerDisplay();
    if (typeof updateTimerUI === 'function') updateTimerUI();
    if (typeof updateMuteButtonsUI === 'function') updateMuteButtonsUI();
  });
}

// Stummschaltung toggeln und Buttons aktualisieren
function toggleTimerSound() {
  timerSoundEnabled = !timerSoundEnabled;
  if (typeof window !== 'undefined') window.timerSoundEnabled = timerSoundEnabled;
  if (typeof globalThis !== 'undefined') globalThis.timerSoundEnabled = timerSoundEnabled;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('flowTimerSoundEnabled', String(timerSoundEnabled));
    }
  } catch(e) {}
  
  if (!timerSoundEnabled) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
    if (ringInterval) {
      clearInterval(ringInterval);
      ringInterval = null;
    }
    const msg = safeTr({ de: "Timer-Sound stummgeschaltet 🔇", en: "Timer sound muted 🔇", es: "Sonido del temporizador silenciado 🔇", el: "Ο ήχος του χρονομέτρου σίγασε 🔇", fr: "Son du minuteur coupé 🔇", it: "Audio del timer disattivato 🔇" });
    if (typeof showToast === 'function') showToast(msg);
  } else {
    const msg = safeTr({ de: "Timer-Sound eingeschaltet 🔊", en: "Timer sound unmuted 🔊", es: "Sonido del temporizador activado 🔊", el: "Ο ήχος του χρονομέτρου ενεργοποιήθηκε 🔊", fr: "Son du minuteur activé 🔊", it: "Audio del timer attivato 🔊" });
    if (typeof showToast === 'function') showToast(msg);
    if (timerRunning && typeof playRandomTimerAmbient === 'function') {
      playRandomTimerAmbient();
    }
  }
  updateMuteButtonsUI();
}

function updateMuteButtonsUI() {
  const muteBtnIds = ['timer-mute-btn', 'helper-pick-timer-mute-btn', 'helper-steps-timer-mute'];
  muteBtnIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (timerSoundEnabled) {
        el.innerHTML = '<i data-lucide="volume-2" class="w-3.5 h-3.5 text-gray-300 hover:text-white"></i>';
        el.title = safeTr({ de: "Stummschalten", en: "Mute", es: "Silenciar", el: "Σίγαση", fr: "Couper le son", it: "Disattiva audio" });
      } else {
        el.innerHTML = '<i data-lucide="volume-x" class="w-3.5 h-3.5 text-rose-400"></i>';
        el.title = safeTr({ de: "Ton einschalten", en: "Unmute", es: "Activar sonido", el: "Ενεργοποίηση ήχου", fr: "Activer le son", it: "Attiva audio" });
      }
    }
  });
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// Startet bei jedem Timer-Start einen neuen Natursound im Hintergrund
function playRandomTimerAmbient(crossfade = false, force = false) {
  if (!timerSoundEnabled || (!timerRunning && !force)) return;
  
  let chosen;
  do {
    chosen = TIMER_AMBIENTS[Math.floor(Math.random() * TIMER_AMBIENTS.length)];
  } while (chosen === lastSelectedTimerAmbient && TIMER_AMBIENTS.length > 1);
  
  lastSelectedTimerAmbient = chosen;
  
  if (typeof playAmbientSound === 'function') {
    playAmbientSound(chosen, crossfade);
  }
}

// Caching der Systemstimmen & dynamisches Re-Loading
let cachedVoices = [];
function updateSpeechVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis.getVoices === 'function') {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis.getVoices === 'function') {
  updateSpeechVoices();
  window.speechSynthesis.onvoiceschanged = updateSpeechVoices;
}

let speechDuckingTimeout = null;

// Harmonisches Audio-Ducking für alle laufenden Klangquellen (Radio, Ambient, Sound Machine)
function duckAllAudioForSpeech(isDucked) {
  if (speechDuckingTimeout) {
    clearTimeout(speechDuckingTimeout);
    speechDuckingTimeout = null;
  }
  if (isDucked) {
    if (typeof duckAmbientVolume === 'function') duckAmbientVolume(0.18);
    if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.duckRadio === 'function') {
      RadioNewsEngine.duckRadio(true);
    } else if (typeof window !== 'undefined' && typeof window.duckRadio === 'function') {
      window.duckRadio(true);
    }
    // Sicherheits-Timeout: Audio nach 8.5s automatisch wiederherstellen, falls Browser-Event hakt
    speechDuckingTimeout = setTimeout(() => {
      duckAllAudioForSpeech(false);
    }, 8500);
  } else {
    if (typeof restoreAmbientVolume === 'function') restoreAmbientVolume();
    if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.duckRadio === 'function') {
      RadioNewsEngine.duckRadio(false);
    } else if (typeof window !== 'undefined' && typeof window.duckRadio === 'function') {
      window.duckRadio(false);
    }
  }
}
if (typeof window !== 'undefined') window.duckAllAudioForSpeech = duckAllAudioForSpeech;
if (typeof globalThis !== 'undefined') globalThis.duckAllAudioForSpeech = duckAllAudioForSpeech;

// Globale, hochqualitative Sprach-Synthese mit organischen, menschlich-warmen Stimmen
function speakWithProfile(text, profileIndex = null) {
  if (!timerSoundEnabled || timerVoiceEnabled === false) return;
  if (!('speechSynthesis' in window)) return;
  if (!text || typeof text !== 'string') return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    // 1. Text für organische menschliche Sprachmelodie & natürliche Atempausen aufbereiten
    let naturalText = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}]/gu, '') // Emojis entfernen
      .replace(/^\s*\d+[\.\)\:]\s+/, '') // Nur echte Schrittnummern wie "1. ", "2) " entfernen
      .replace(/^[•\-\*✓✔✕\+➔]+\s*/, '')
      .replace(/\s*([!?.])\s*/g, '$1 ... ') // Sanfte Atempausen nach Sätzen für menschliche Sprachmelodie
      .replace(/([,;:])\s*/g, '$1 ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!naturalText) naturalText = text;

    const utterance = new SpeechSynthesisUtterance(naturalText);
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
    const langMap = { en: 'en-US', de: 'de-DE', es: 'es-ES', el: 'el-GR', fr: 'fr-FR', it: 'it-IT' };
    const targetLang = langMap[lang] || 'en-US';
    utterance.lang = targetLang;
    utterance.volume = 1.0;

    // 2. Stimmen-Persona deterministisch oder abwechselnd rotieren
    if (profileIndex === null || profileIndex === undefined) {
      profileIndex = globalVoiceTurnIndex++;
    }
    const profile = VOICE_PROFILES[Math.abs(profileIndex) % VOICE_PROFILES.length] || VOICE_PROFILES[0];

    utterance.rate = profile.rate || 0.94;
    utterance.pitch = profile.pitch || 1.0;

    // 3. Verfügbare Stimmen laden & höchste Neural/Natural-Qualität priorisieren
    if (cachedVoices.length === 0) updateSpeechVoices();
    const allVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const langPrefix = targetLang.split('-')[0].toLowerCase();
    const matchingVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));

    // Höchste Priorität für Neural / Natural / Online / Wavenet / Siri / Enhanced / Freundliche Stimmen
    function getVoiceScore(voice) {
      const name = (voice.name || '').toLowerCase();
      let score = 0;
      if (name.includes('natural') || name.includes('neural')) score += 120;
      if (name.includes('online')) score += 60;
      if (name.includes('google') || name.includes('wavenet')) score += 50;
      if (name.includes('siri') || name.includes('enhanced') || name.includes('premium')) score += 50;
      if (name.includes('marlene') || name.includes('vicki') || name.includes('katja') || 
          name.includes('luisa') || name.includes('amira') || name.includes('jenny') || 
          name.includes('conrad') || name.includes('stefan') || name.includes('florian') ||
          name.includes('anna') || name.includes('serena') || name.includes('samantha')) {
        score += 40;
      }
      if (name.includes('desktop') || name.includes('legacy') || name.includes('espeak')) {
        score -= 40;
      }
      return score;
    }

    const sortedVoices = (matchingVoices.length > 0 ? matchingVoices : allVoices).slice().sort((a, b) => getVoiceScore(b) - getVoiceScore(a));

    const femaleKeywords = [
      'marlene', 'vicki', 'katja', 'luisa', 'hedda', 'anna', 'zira', 'petra', 'elena', 'hazel', 'susan', 'samantha', 'moira',
      'tessa', 'deutsch', 'female', 'julie', 'hortense', 'clara', 'paola', 'lucia', 'monica',
      'victoria', 'audrey', 'alice', 'federica', 'denise', 'jenny', 'sonia', 'isabella', 'athina',
      'elli', 'marta', 'laura', 'chiara', 'serena', 'ava', 'karen', 'amira'
    ];
    const maleKeywords = [
      'conrad', 'stefan', 'florian', 'yannick', 'markus', 'david', 'george', 'ravi', 'stefanos', 'male', 'paul',
      'henri', 'alvaro', 'jorge', 'cosimo', 'thomas', 'daniel', 'oliver', 'arthur', 'claude',
      'guy', 'diego', 'nestoras', 'nikos', 'paulino', 'matteo'
    ];

    const femaleVoices = sortedVoices.filter(v => 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
      !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
    const maleVoices = sortedVoices.filter(v => 
      maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );

    let selectedVoice = null;
    if (profile.gender === 'female' && femaleVoices.length > 0) {
      selectedVoice = femaleVoices[Math.abs(profileIndex) % femaleVoices.length];
    } else if (profile.gender === 'male' && maleVoices.length > 0) {
      selectedVoice = maleVoices[Math.abs(profileIndex) % maleVoices.length];
    } else if (sortedVoices.length > 0) {
      selectedVoice = sortedVoices[Math.abs(profileIndex) % sortedVoices.length];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // 4. Harmonisches Ducking: Hintergrundsounds/Radio sanft abdämpfen und nach Sprache wieder anheben
    duckAllAudioForSpeech(true);

    utterance.onstart = () => {
      duckAllAudioForSpeech(true);
    };

    const cleanupDucking = () => {
      duckAllAudioForSpeech(false);
    };

    utterance.onend = cleanupDucking;
    utterance.onerror = cleanupDucking;

    const speakSessionToken = currentSpeechSessionId;
    const speakTimeout = setTimeout(() => {
      if (currentSpeechSessionId !== speakSessionToken) {
        cleanupDucking();
        return;
      }
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("speechSynthesis.speak error:", err);
        cleanupDucking();
      }
    }, 50);
    if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
      activeTimeouts.push(speakTimeout);
    }
  } catch (e) {
    console.error("Fehler bei der speakWithProfile Ausführung:", e);
    duckAllAudioForSpeech(false);
  }
}

// Jede Minute und jede Ansage wechselnde Stimmenprofile (Frauen, Männer, Kinder)
function speakSoftlyDynamic(text, remSec, totSec) {
  const voiceTurn = globalVoiceTurnIndex++;
  speakWithProfile(text, voiceTurn);
}

// Liefert kontextbezogene, stufenweise angepasste Motivationen (Start: ruhig, Mitte: im Fluss, Ende: Endspurt)
function getContextMotivation(remSec, totSec) {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const list = MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS['de'];
  const pct = totSec > 0 ? (remSec / totSec) * 100 : 0;
  
  let tier = 'end';
  if (pct > 70) tier = 'start';
  else if (pct > 25) tier = 'halfway';
  
  const chosen = pickWithoutImmediateRepeat(list[tier], lastMotivationByTier[tier]);
  lastMotivationByTier[tier] = chosen;
  return chosen;
}

// Angenehmer, dezenter Glockenton für die Minuten "dazwischen" (kein Sprechen, viel Klang-Varianz)

if (typeof window !== 'undefined') {
  window.toggleTimerSound = toggleTimerSound;
  window.updateMuteButtonsUI = updateMuteButtonsUI;
  window.playRandomTimerAmbient = playRandomTimerAmbient;
  window.updateSpeechVoices = updateSpeechVoices;
  window.speakWithProfile = speakWithProfile;
  window.speakSoftlyDynamic = speakSoftlyDynamic;
  window.getContextMotivation = getContextMotivation;
  window.getCurrentPresetMinutes = getCurrentPresetMinutes;
}
if (typeof globalThis !== 'undefined') {
  globalThis.toggleTimerSound = toggleTimerSound;
  globalThis.updateMuteButtonsUI = updateMuteButtonsUI;
  globalThis.playRandomTimerAmbient = playRandomTimerAmbient;
  globalThis.updateSpeechVoices = updateSpeechVoices;
  globalThis.speakWithProfile = speakWithProfile;
  globalThis.speakSoftlyDynamic = speakSoftlyDynamic;
  globalThis.getContextMotivation = getContextMotivation;
  globalThis.getCurrentPresetMinutes = getCurrentPresetMinutes;
}

