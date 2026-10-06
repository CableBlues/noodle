// timer.js Teil 1/3: State, Konstanten & Sound/Sprach-Hilfsfunktionen

var timerSeconds = 3 * 60; // Standardmäßig auf 3 Minuten initialisiert
var timerInitialSeconds = 3 * 60;
var timerRunning = false;
var timerInterval = null;
var activeTimerTask = null;
var timerTargetEndTime = null;

var timerSoundEnabled = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerSoundEnabled') : null) !== 'false';
var timerVoiceEnabled = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerVoiceEnabled') : null) !== 'false';
var timerVoiceTimeAnnounce = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerVoiceTimeAnnounce') : null) !== 'false';
var timerVoiceMotivation = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerVoiceMotivation') : null) !== 'false';
var timerAudioMode = (typeof localStorage !== 'undefined' ? localStorage.getItem('flowTimerAudioMode') : null) || 'silent';
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
  window.timerVoiceTimeAnnounce = timerVoiceTimeAnnounce;
  window.timerVoiceMotivation = timerVoiceMotivation;
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
  globalThis.timerVoiceTimeAnnounce = timerVoiceTimeAnnounce;
  globalThis.timerVoiceMotivation = timerVoiceMotivation;
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
const TIMER_AMBIENTS = ['piano', 'lofi', 'chimes', 'space', 'guitar', 'singingbowl', 'musicbox', 'breeze', 'campfire', 'birds', 'cafe', 'clock', 'lofi_sunshine', 'summer_meadow', 'synthwave'];

// VIELFÄLTIGE NATÜRLICHE STIMMPROFILE: Sehr freundlich, warm, wechselnd zwischen Frau, Mann und jungem Kind
const VOICE_PROFILES = [
  // Turn 0: FRAU (Warm & Sanft)
  { id: 'female_warm', name: 'Sanfte Begleiterin', category: 'female', gender: 'female', pitch: 1.02, rate: 0.93, style: 'warm', desc: 'Ruhig, herzlich & beruhigend' },
  // Turn 1: MANN (Tief-warm & Entspannt)
  { id: 'male_warm', name: 'Warmer Gefährte', category: 'male', gender: 'male', pitch: 0.88, rate: 0.93, style: 'warm', desc: 'Angenehm tief, entspannt & freundschaftlich' },
  // Turn 2: KIND (Fröhlich & Aufgeweckt)
  { id: 'child_cheerful', name: 'Fröhliches Kind', category: 'child', gender: 'child', pitch: 1.46, rate: 1.05, style: 'cheerful', desc: 'Hell, gut gelaunt & ansteckend optimistisch' },

  // Turn 3: FRAU (Sonnig & Positiv)
  { id: 'female_sunny', name: 'Sonnige Optimistin', category: 'female', gender: 'female', pitch: 1.12, rate: 0.98, style: 'sunny', desc: 'Frisch, aufgeweckt & strahlend positiv' },
  // Turn 4: MANN (Empathischer Mentor)
  { id: 'male_mentor', name: 'Empathischer Mentor', category: 'male', gender: 'male', pitch: 0.95, rate: 0.92, style: 'mentor', desc: 'Ruhig, weise, verlässlich & geerdet' },
  // Turn 5: KIND (Kleiner Wirbelwind / sehr jung)
  { id: 'child_playful', name: 'Kleiner Wirbelwind', category: 'child', gender: 'child', pitch: 1.58, rate: 1.08, style: 'playful', desc: 'Sehr jung, quirlig, niedlich & voller Stolz' },

  // Turn 6: FRAU (Gelassene Zen-Stimme)
  { id: 'female_zen', name: 'Gelassene Zen-Stimme', category: 'female', gender: 'female', pitch: 0.98, rate: 0.89, style: 'zen', desc: 'Meditativ, sanft & tiefenentspannt' },
  // Turn 7: MANN (Dynamischer Motivator)
  { id: 'male_dynamic', name: 'Dynamischer Motivator', category: 'male', gender: 'male', pitch: 1.04, rate: 0.98, style: 'dynamic', desc: 'Sportlich-freundlich, klar & tatkräftig' },
  // Turn 8: KIND (Kleiner Entdecker)
  { id: 'child_explorer', name: 'Kleiner Entdecker', category: 'child', gender: 'child', pitch: 1.38, rate: 1.02, style: 'explorer', desc: 'Neugierig, tapfer & eifrig' },

  // Turn 9: FRAU (Herzliche Freundin)
  { id: 'female_friendly', name: 'Herzliche Freundin', category: 'female', gender: 'female', pitch: 1.06, rate: 0.95, style: 'friendly', desc: 'Zugewandt, ehrlich & wohlwollend' },
  // Turn 10: MANN (Sanfter Begleiter)
  { id: 'male_calm', name: 'Sanfter Begleiter', category: 'male', gender: 'male', pitch: 0.92, rate: 0.91, style: 'calm', desc: 'Unaufdringlich, friedvoll & beruhigend' },
  // Turn 11: KIND (Sanftes Sternchen)
  { id: 'child_gentle', name: 'Sanftes Sternchen', category: 'child', gender: 'child', pitch: 1.50, rate: 0.96, style: 'gentle', desc: 'Zart, liebevoll & herzerwärmend' }
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
      "Starker Flow! Zieh es mit voller Energie durch.",
      "Du ziehst es stark durch! Nimm diesen Schwung voll mit.",
      "Beeindruckende Ausdauer. Du bist gerade unaufhaltsam!",
      "Großartiger Fokus. Bring deinen Gedanken mit voller Kraft zu Ende.",
      "Tiefer Flow-Zustand. Du machst das fantastisch, bleib dran!",
      "Volle Entschlossenheit. Jeder weitere Schritt bringt dich spürbar voran.",
      "Echtes Durchhaltevermögen. Du hast das Steuer fest in der Hand!",
      "Fantastischer Antrieb. Mach es in deinem ganz eigenen Tempo.",
      "Dein Schwung ist großartig. Voll im Tunnel!",
      "Du machst das spitze! Wenn der Moment passt, hast du dir eine Pause redlich verdient.",
      "Hervorragender Einsatz. Denk daran: Du darfst dir jederzeit eine wohlverdiente Verschnaufpause gönnen.",
      "Du gibst alles! Sobald der Gedanke rund ist, kannst du dir ganz entspannt eine Pause schenken.",
      "Wunderbare Konzentration. Gönn dir ruhig eine Pause, wann immer es sich für dich gut anfühlt."
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
      "Strong flow! Keep pushing forward with full energy.",
      "You are powering through! Ride this momentum all the way.",
      "Impressive endurance. You are completely in the zone!",
      "Outstanding focus. Bring this thought to completion with full strength.",
      "Deep flow state. You are doing fantastic, keep going!",
      "Complete determination. Every extra step is making a real difference.",
      "True resilience. You are fully in command!",
      "Fantastic drive. Move forward at your own pace.",
      "Great momentum. You are locked in!",
      "You are doing amazing! Whenever the moment feels right, you have truly earned a break.",
      "Wonderful effort. Remember: you are always welcome to treat yourself to a well-deserved rest.",
      "Giving it your all! Once this step feels round, feel free to take a gentle break.",
      "Superb concentration. Treat yourself to a break whenever it feels right for you."
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
      "Superbe élan ! Poursuis avec toute ton énergie.",
      "Tu avances avec force ! Profite pleinement de ce momentum.",
      "Endurance impressionnante. Tu es totalement dans le flux !",
      "Remarquable concentration. Mène cette idée à bien avec force.",
      "État de flow profond. Tu te débrouilles à merveille, continue !",
      "Détermination totale. Chaque pas supplémentaire fait la différence.",
      "Véritable persévérance. Tu maîtrises parfaitement la situation !",
      "Beau travail ! Quand le moment sera venu, tu auras bien mérité une pause.",
      "Bel engagement. Souviens-toi que tu peux t'offrir un moment de répit quand tu le souhaites.",
      "Excellente concentration. Accorde-toi une pause dès que tu le sens."
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
      "Grande flusso! Continua con tutta la tua energia.",
      "Stai spingendo forte! Sfrutta appieno questo slancio.",
      "Resistenza impressionante. Sei completamente nella zona!",
      "Concentrazione straordinaria. Porta a termine questo pensiero con forza.",
      "Stato di flow profondo. Stai andando alla grande, avanti così!",
      "Determinazione totale. Ogni passo in più fa davvero la differenza.",
      "Vera perseveranza. Hai il pieno controllo!",
      "Splendido lavoro! Quando il momento è giusto, ti sei meritato una pausa.",
      "Ottimo impegno. Ricorda che puoi concederti un riposo ben meritato quando vuoi.",
      "Magnifica concentrazione. Concediti una pausa appena ti fa piacere."
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
      "¡Gran flujo! Sigue adelante con toda tu energía.",
      "¡Lo estás logrando con fuerza! Aprovecha al máximo este impulso.",
      "Resistencia impresionante. ¡Estás totalmente en la zona!",
      "Enfoque sobresaliente. Lleva esta idea a término con fuerza.",
      "Profundo estado de flujo. Lo estás haciendo fantástico, ¡adelante!",
      "Determinación total. Cada paso extra marca una diferencia real.",
      "Verdadera perseverancia. ¡Tienes el control absoluto!",
      "¡Estupendo trabajo! Cuando el momento sea propicio, te has ganado un buen descanso.",
      "Gran entrega. Recuerda que puedes regalarte una merecida pausa cuando lo desees.",
      "Magnífica concentración. Tómate un respiro cuando sientas que es el momento."
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
      "Δυνατή ροή! Συνέχισε με όλη σου την ενέργεια.",
      "Προχωράς με δύναμη! Αξιοποίησε αυτή την ορμή στο έπακρο.",
      "Εντυπωσιακή αντοχή. Είσαι απόλυτα συγκεντρωμένος!",
      "Εξαιρετική εστίαση. Ολοκλήρωσε αυτή τη σκέψη με αυτοπεποίθηση.",
      "Βαθιά κατάσταση ροής. Τα πας περίφημα, συνέχισε δυναμικά!",
      "Απόλυτη αποφασιστικότητα. Κάθε επιπλέον βήμα σε φέρνει πιο κοντά στον στόχο.",
      "Πραγματικό πείσμα. Έχεις τον πλήρη έλεγχο!",
      "Υπέροχη προσπάθεια! Όταν το νιώσεις κατάλληλο, αξίζεις απόλυτα ένα όμορφο διάλειμμα.",
      "Σπουδαία συγκέντρωση. Θυμήσου ότι μπορείς να κάνεις ένα διάλειμμα όποτε εσύ το επιθυμείς."
    ]
  },
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

// Spezifische Begrüßung mit der verknüpften Aufgabe
const SESSION_START_TASK_PHRASES = {
  de: [
    "Fokuszeit gestartet, {mins} Minuten für: {task}. Ganz in Ruhe anfangen.",
    "{mins} Minuten Fokus für deine Aufgabe: {task}. Finde deinen eigenen Takt.",
    "Timer läuft, {mins} Minuten. Dein Ziel ist: {task}. Schritt für Schritt.",
    "Auf geht's. {mins} Minuten voll konzentriert auf: {task}.",
    "Fokusblock gestartet für: {task}. Durchatmen und entspannt loslegen."
  ],
  en: [
    "Focus session started, {mins} minutes for: {task}. Begin in your own time.",
    "{mins} minutes of focus for: {task}. Find your gentle pace.",
    "Timer running, {mins} minutes on: {task}. Step by step.",
    "Here we go. {mins} minutes dedicated to: {task}.",
    "Focus block started on: {task}. Take a breath and ease into it."
  ],
  fr: [
    "Session démarrée, {mins} minutes pour : {task}. Commence tout en douceur.",
    "{mins} minutes de concentration sur : {task}. Trouve ton propre tempo.",
    "Minuteur lancé, {mins} minutes pour : {task}. Pas à pas.",
    "C'est parti pour : {task}. {mins} minutes de travail serein."
  ],
  it: [
    "Sessione avviata, {mins} minuti per: {task}. Comincia con tutta calma.",
    "{mins} minuti di concentrazione su: {task}. Trova il tuo ritmo naturale.",
    "Timer avviato, {mins} minuti su: {task}. Un passo alla volta."
  ],
  es: [
    "Sesión iniciada, {mins} minutos para: {task}. Comienza a tu ritmo.",
    "{mins} minutos de enfoque en: {task}. Encuentra tu compás.",
    "Temporizador en marcha, {mins} minutos para: {task}. Paso a paso."
  ],
  el: [
    "Η συνεδρία ξεκίνησε, {mins} λεπτά για: {task}. Ξεκίνα με ηρεμία.",
    "{mins} λεπτά εστίασης στο: {task}. Βρες τον δικό σου ρυθμό.",
    "Το χρονόμετρο τρέχει για: {task}. Βήμα προς βήμα."
  ]
};

// Motivationssprüche, die bei Bedarf die aktive Aufgabe harmonisch einbinden
const TASK_AWARE_MOTIVATIONS = {
  de: {
    start: [
      "Bleib ganz ruhig bei '{task}'. Nimm dir diesen ersten Schritt vor.",
      "Guter Einstieg in '{task}'. Lass dich nicht hetzen.",
      "Komm entspannt in '{task}' an. Du hast die Zeit.",
      "Konzentrier dich auf den nächsten Schritt von '{task}'.",
      "Schritt für Schritt an '{task}'. Dein Fokus trägt dich ruhig voran."
    ],
    halfway: [
      "Sehr schöner Rhythmus bei '{task}'. Bleib im Fluss.",
      "Halbzeit geschafft bei '{task}'. Guter, stetiger Fortschritt.",
      "Du bist voll drin in '{task}'. Lass es einfach ruhig fließen.",
      "Schultern kurz lockern und mit klarem Kopf an '{task}' weiterarbeiten.",
      "Konzentration auf '{task}' läuft gleichmäßig. Sehr schön."
    ],
    end: [
      "Fast geschafft mit '{task}'. Bring diesen Gedanken in Ruhe zu Ende.",
      "Der Endspurt für '{task}'. Bleib noch kurz aufmerksam.",
      "Gleich am Ziel mit '{task}'. Sauber zu Ende führen.",
      "Nur noch ein kleiner Moment für '{task}'. Sehr schön durchgezogen.",
      "Gleich hast du '{task}' gemeistert."
    ],
    overdue: [
      "Starker Flow bei '{task}'. Zieh es voll durch!",
      "Du bleibst an '{task}' dran. Fantastischer Einsatz!",
      "Mitten im Schaffensrausch bei '{task}'. Nutze diese Energie!",
      "Volle Kraft für '{task}'. Großartig, wie du dich festbeißt!",
      "Dein Fokus auf '{task}' trägt dich weit voran. Stark!",
      "Klasse Leistung bei '{task}'. Wenn du magst, hast du dir eine Pause redlich verdient.",
      "Du hast '{task}' großartig vorangebracht. Gönn dir jederzeit einen Moment zum Durchatmen."
    ]
  },
  en: {
    start: [
      "Gently ease into '{task}'. One small step at a time.",
      "Good start on '{task}'. You have all the time you need.",
      "Stay centered on '{task}'. Proceed at your own tempo."
    ],
    halfway: [
      "Great steady rhythm on '{task}'. Keep going with ease.",
      "Halfway through '{task}'. You are in a wonderful groove.",
      "Smooth progress on '{task}'. Breathe and keep going."
    ],
    end: [
      "Almost done with '{task}'. Wrap up this thought peacefully.",
      "Final stretch for '{task}'. Bring it to a clean close.",
      "Near the finish line with '{task}'. Great focus."
    ],
    overdue: [
      "Powerful flow on '{task}'. Keep pushing through!",
      "Deep focus on '{task}'. Ride this wave of energy!",
      "Incredible momentum with '{task}'. Keep going strong!",
      "Outstanding effort on '{task}'. Whenever you're ready, take a well-deserved breather.",
      "Great progress on '{task}'. Feel free to pause anytime you wish."
    ]
  },
  fr: {
    start: [
      "Aborde '{task}' tout en douceur. Un pas après l'autre.",
      "Bienvenue dans '{task}'. Avance à ton rythme."
    ],
    halfway: [
      "Beau travail sur '{task}'. La concentration est fluide.",
      "Mi-parcours pour '{task}'. Continue avec cette belle constance."
    ],
    end: [
      "Presque terminé pour '{task}'. Conclus cette étape sereinement.",
      "Dernière ligne droite sur '{task}'. Bravo pour ton attention."
    ],
    overdue: [
      "Superbe élan sur '{task}'. Fonce avec cette belle énergie !",
      "Immersion totale dans '{task}'. Continue sur ta lancée !",
      "Belle détermination sur '{task}'. Tu mérites une pause dès que tu le souhaites."
    ]
  },
  it: {
    start: [
      "Affronta '{task}' con calma. Un passo alla volta.",
      "Ottima partenza per '{task}'. Procedi sereno."
    ],
    halfway: [
      "Ottimo ritmo su '{task}'. Sei ben immerso nel lavoro.",
      "Metà percorso per '{task}'. Continua così con naturalezza."
    ],
    end: [
      "Quasi completato '{task}'. Concludi con tranquillità.",
      "Ultimo tratto per '{task}'. Ottima concentrazione."
    ],
    overdue: [
      "Grande slancio su '{task}'. Continua con tutta questa energia!",
      "Immersione profonda in '{task}'. Sei in pieno ritmo!",
      "Ottimo lavoro su '{task}'. Concediti pure una pausa appena ne hai voglia."
    ]
  },
  es: {
    start: [
      "Entra en '{task}' con calma. Paso a paso.",
      "Buen comienzo en '{task}'. Tienes todo el tiempo."
    ],
    halfway: [
      "Gran progreso en '{task}'. Mantén este ritmo sereno.",
      "Mitad del camino en '{task}'. Vas muy bien."
    ],
    end: [
      "Casi listo '{task}'. Remata esta idea con serenidad.",
      "Recta final para '{task}'. Gran trabajo."
    ],
    overdue: [
      "¡Gran impulso en '{task}'. Sigue adelante con toda la energía!",
      "Enfoque profundo en '{task}'. ¡Aprovecha este gran ritmo!",
      "Excelente avance en '{task}'. Puedes tomarte un descanso merecido cuando quieras."
    ]
  },
  el: {
    start: [
      "Ξεκίνα το '{task}' με ηρεμία. Ένα βήμα τη φορά."
    ],
    halfway: [
      "Όμορφη ροή στο '{task}'. Συνέχισε αβίαστα."
    ],
    end: [
      "Σχεδόν τελείωσες το '{task}'. Ολοκλήρωσε με φροντίδα."
    ],
    overdue: [
      "Δυνατή ορμή στο '{task}'. Συνέχισε με όλη σου τη δύναμη!",
      "Βαθιά εστίαση στο '{task}'. Αξιοποίησε αυτόν τον όμορφο ρυθμό!",
      "Υπέροχη δουλειά στο '{task}'. Μπορείς να πάρεις ένα διάλειμμα όποτε εσύ το θελήσεις."
    ]
  }
};

// Ansagen beim Erreichen von 00:00 (Mut gebend, im Flow weiterziehend)
const TIME_UP_PHRASES = {
  de: [
    "Fokuszeit gemeistert! Zieh ruhig weiter durch, wenn du im Flow bist.",
    "Zielzeit erreicht! Bleib im Flow, wenn es gerade so gut läuft.",
    "Starker Fokusblock! Zieh weiter durch, oder gönn dir gleich eine wohlverdiente Pause."
  ],
  en: [
    "Focus session mastered! Keep flowing if you are in the zone.",
    "Target time completed! Keep pushing through while momentum is high.",
    "Great focus block! Keep going strong, or take a peaceful pause whenever you like."
  ],
  es: [
    "¡Tiempo de enfoque completado! Sigue en el flujo si tienes impulso.",
    "¡Gran bloque de enfoque! Continúa con fuerza o tómate un merecido descanso."
  ],
  el: [
    "Η εστίαση ολοκληρώθηκε με επιτυχία! Συνέχισε στη ροή σου αν έχεις ορμή.",
    "Υπέροχη συνεδρία! Συνέχισε δυναμικά ή πάρε ένα όμορφο διάλειμμα όποτε θέλεις."
  ],
  fr: [
    "Session de focus accomplie ! Reste dans le flow si tu es bien lancé.",
    "Superbe concentration ! Continue sur ta lancée, ou accorde-toi une pause bien méritée."
  ],
  it: [
    "Obiettivo di focus raggiunto! Rimani nel flusso se sei ben concentrato.",
    "Ottima sessione! Continua a pieno ritmo, o concediti una pausa quando vuoi."
  ]
};

// Ansagen bei 30 Sekunden Verlängerung (positiver Flow)
const OVERDUE_30S_LABELS = {
  de: "30 Sekunden im Flow.",
  en: "30 seconds in the flow.",
  es: "30 segundos en el flujo.",
  el: "30 δευτερόλεπτα στη ροή σου.",
  fr: "30 secondes en plein flow.",
  it: "30 secondi nel pieno flusso."
};

// Ansagen für die Minuten, die über die eingestellte Zeit hinaus im Flow gearbeitet werden ("Flow-Verlängerung")
const OVERDUE_MINUTE_LABELS = {
  de: (n) => n === 1 ? "1 Minute Flow-Verlängerung" : `${n} Minuten Flow-Verlängerung`,
  en: (n) => n === 1 ? "1 minute flow extension" : `${n} minutes flow extension`,
  es: (n) => n === 1 ? "1 minuto de extensión de flujo" : `${n} minutos de extensión de flujo`,
  el: (n) => n === 1 ? "1 λεπτό επέκταση ροής" : `${n} λεπτά επέκταση ροής`,
  fr: (n) => n === 1 ? "1 minute d'extension de flow" : `${n} minutes d'extension de flow`,
  it: (n) => n === 1 ? "1 minuto di estensione del flusso" : `${n} minuti di estensione del flusso`
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
function speakWithProfile(text, profileIndex = null, onComplete = null) {
  if (!timerSoundEnabled || timerVoiceEnabled === false) {
    if (typeof onComplete === 'function') setTimeout(onComplete, 50);
    return;
  }
  if (!('speechSynthesis' in window)) {
    if (typeof onComplete === 'function') setTimeout(onComplete, 50);
    return;
  }
  if (!text || typeof text !== 'string') {
    if (typeof onComplete === 'function') setTimeout(onComplete, 50);
    return;
  }

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
    if (typeof window !== 'undefined') {
      window._activeSpeechUtterance = utterance; // Prevent Chrome garbage collection bug
    }
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

    const childKeywords = [
      'child', 'kind', 'kid', 'boy', 'girl', 'young', 'junior', 'elli', 'yannick', 'marta', 'audrey', 'alice', 'oliver'
    ];
    const childVoices = sortedVoices.filter(v => 
      childKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );

    let selectedVoice = null;
    if (profile.gender === 'child' || profile.category === 'child') {
      if (childVoices.length > 0) {
        selectedVoice = childVoices[Math.abs(profileIndex) % childVoices.length];
      } else if (femaleVoices.length > 0) {
        selectedVoice = femaleVoices[Math.abs(profileIndex) % femaleVoices.length];
      } else if (sortedVoices.length > 0) {
        selectedVoice = sortedVoices[Math.abs(profileIndex) % sortedVoices.length];
      }
    } else if (profile.gender === 'female' && femaleVoices.length > 0) {
      selectedVoice = femaleVoices[Math.abs(profileIndex) % femaleVoices.length];
    } else if (profile.gender === 'male' && maleVoices.length > 0) {
      selectedVoice = maleVoices[Math.abs(profileIndex) % maleVoices.length];
    } else if (sortedVoices.length > 0) {
      selectedVoice = sortedVoices[Math.abs(profileIndex) % sortedVoices.length];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // 4. Harmonisches Ducking: Hintergrundsounds sanft abdämpfen und nach Sprache wieder anheben
    duckAllAudioForSpeech(true);

    utterance.onstart = () => {
      duckAllAudioForSpeech(true);
    };

    let hasCompleted = false;
    const finishHandler = () => {
      if (hasCompleted) return;
      hasCompleted = true;
      if (!keepDucked) {
        duckAllAudioForSpeech(false);
      }
      if (typeof onComplete === 'function') {
        try { onComplete(); } catch (e) { console.warn('onComplete callback error:', e); }
      }
    };

    utterance.onend = finishHandler;
    utterance.onerror = finishHandler;

    const speakSessionToken = currentSpeechSessionId;
    const speakTimeout = setTimeout(() => {
      if (currentSpeechSessionId !== speakSessionToken) {
        finishHandler();
        return;
      }
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("speechSynthesis.speak error:", err);
        finishHandler();
      }
    }, 50);
    if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
      activeTimeouts.push(speakTimeout);
    }
  } catch (e) {
    console.error("Fehler bei der speakWithProfile Ausführung:", e);
    if (!keepDucked) duckAllAudioForSpeech(false);
    if (typeof onComplete === 'function') {
      try { onComplete(); } catch (err) {}
    }
  }
}

// Chaining von Ansagen mit wechselnden Stimmen (z. B. Zeitansage durch Stimme A -> Spruch durch Stimme B)
function speakVoiceSequence(items, onComplete = null) {
  if (!timerSoundEnabled || timerVoiceEnabled === false) {
    if (typeof onComplete === 'function') setTimeout(onComplete, 50);
    return;
  }
  if (!items || items.length === 0) {
    if (typeof onComplete === 'function') setTimeout(onComplete, 50);
    return;
  }
  const validItems = items.filter(it => it && it.text && typeof it.text === 'string' && it.text.trim());
  if (validItems.length === 0) {
    if (typeof onComplete === 'function') setTimeout(onComplete, 50);
    return;
  }

  const sessionToken = currentSpeechSessionId;
  let idx = 0;

  function runNext() {
    if (typeof timerRunning !== 'undefined' && !timerRunning) {
      duckAllAudioForSpeech(false);
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    if (typeof currentSpeechSessionId !== 'undefined' && currentSpeechSessionId !== sessionToken) {
      duckAllAudioForSpeech(false);
      return;
    }
    if (idx >= validItems.length) {
      duckAllAudioForSpeech(false);
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const item = validItems[idx];
    const isLast = (idx === validItems.length - 1);
    idx++;

    const turn = (item.profileIndex !== undefined && item.profileIndex !== null)
      ? item.profileIndex
      : globalVoiceTurnIndex++;

    speakWithProfile(item.text, turn, () => {
      if (isLast) {
        duckAllAudioForSpeech(false);
        if (typeof onComplete === 'function') onComplete();
      } else {
        // Natürliche, menschliche Atempause zwischen zwei Sprechern (z. B. Zeitansage -> Motivation)
        const pauseTimer = setTimeout(() => {
          if (typeof currentSpeechSessionId !== 'undefined' && currentSpeechSessionId !== sessionToken) {
            duckAllAudioForSpeech(false);
            return;
          }
          runNext();
        }, 420);
        if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
          activeTimeouts.push(pauseTimer);
        }
      }
    }, !isLast);
  }

  runNext();
}

// Jede 2 Minuten und bei Ansagen wechselnde Stimmenprofile
function speakSoftlyDynamic(text, remSec, totSec, onComplete = null) {
  if (Array.isArray(text)) {
    speakVoiceSequence(text, onComplete);
  } else {
    speakVoiceSequence([{ text }], onComplete);
  }
}

// Interaktive Hörprobe für Timer-Stimmen (Frau, Mann, Kind)
function previewVoiceCategory(category) {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const previews = {
    de: {
      female: "Hallo! Ich begleite dich mit Ruhe und Klarheit durch deinen Fokus.",
      male: "Auf geht's. Ein Schritt nach dem anderen, ganz entspannt.",
      child: "Du machst das richtig klasse! Ich glaub an dich, zieh weiter durch!"
    },
    en: {
      female: "Hello! I am here to guide you peacefully through your focus.",
      male: "Let's do this. One step at a time, staying relaxed.",
      child: "You're doing so great! I believe in you, keep going!"
    },
    es: {
      female: "¡Hola! Te acompaño con calma y claridad en tu enfoque.",
      male: "Vamos paso a paso, con tranquilidad y confianza.",
      child: "¡Lo estás haciendo genial! ¡Sigue así con toda la energía!"
    },
    fr: {
      female: "Bonjour ! Je t'accompagne avec douceur et sérénité.",
      male: "C'est parti. Un pas après l'autre, tout en confiance.",
      child: "Tu te débrouilles super bien ! Je suis fier de toi, continue !"
    },
    it: {
      female: "Ciao! Ti accompagno con serenità e calma nella concentrazione.",
      male: "Forza, un passo alla volta con calma e fiducia.",
      child: "Stai andando alla grande! Credo in te, continua così!"
    },
    el: {
      female: "Γεια σου! Είμαι εδώ για να σε συνοδεύσω με ηρεμία και γαλήνη.",
      male: "Πάμε δυνατά. Ένα βήμα τη φορά, χωρίς κανένα άγχος.",
      child: "Τα πας καταπληκτικά! Πιστεύω σε σένα, συνέχισε δυνατά!"
    }
  };
  const text = (previews[lang] && previews[lang][category]) || previews.de[category] || "Hallo!";
  const matchingProfiles = VOICE_PROFILES.filter(p => p.category === category || p.gender === category);
  const profile = matchingProfiles[Math.floor(Math.random() * matchingProfiles.length)] || VOICE_PROFILES[0];
  const profileIndex = VOICE_PROFILES.indexOf(profile);
  
  speakWithProfile(text, profileIndex >= 0 ? profileIndex : 0);
  
  if (typeof showToast === 'function') {
    const label = category === 'female' ? '👩 Frauenstimme' : (category === 'male' ? '👨 Männerstimme' : '🧒 Kinderstimme');
    showToast(`${label}: ${profile.name}`);
  }
}

function getTimeUpPhrase(lang = null) {
  const currentL = lang || (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const phrases = (typeof TIME_UP_PHRASES !== 'undefined' && TIME_UP_PHRASES[currentL]) 
    ? TIME_UP_PHRASES[currentL] 
    : (typeof TIME_UP_PHRASES !== 'undefined' ? TIME_UP_PHRASES.de : null);
  if (Array.isArray(phrases)) {
    const chosen = pickWithoutImmediateRepeat(phrases, lastMotivationByTier['time_up']);
    lastMotivationByTier['time_up'] = chosen;
    return chosen;
  }
  return phrases || "Fokuszeit gemeistert! Zieh ruhig weiter durch, wenn du im Flow bist.";
}

function getOverdueMotivation(lang = null, taskName = '', overdueMins = 0) {
  const currentL = lang || (typeof currentLang !== 'undefined' ? currentLang : 'de');
  
  // Wenn eine Aufgabe aktiv ist, binden wir sie mit hoher Wahrscheinlichkeit natürlich ein
  if (taskName && typeof taskName === 'string' && taskName.trim() && Math.random() < 0.6) {
    const taskListObj = (typeof TASK_AWARE_MOTIVATIONS !== 'undefined' && TASK_AWARE_MOTIVATIONS[currentL]) 
      ? TASK_AWARE_MOTIVATIONS[currentL] 
      : (typeof TASK_AWARE_MOTIVATIONS !== 'undefined' ? TASK_AWARE_MOTIVATIONS.de : null);
    const taskTierList = taskListObj ? taskListObj.overdue : null;
    if (taskTierList && taskTierList.length > 0) {
      const template = pickWithoutImmediateRepeat(taskTierList, lastMotivationByTier['overdue_task']);
      lastMotivationByTier['overdue_task'] = template;
      const cleanTask = taskName.trim().replace(/^[\d\.\-\*•✓\s]+/, '');
      return template.replace('{task}', cleanTask);
    }
  }

  const list = (typeof MOTIVATIONAL_CHUNKS !== 'undefined' && (MOTIVATIONAL_CHUNKS[currentL] || MOTIVATIONAL_CHUNKS.de))
    ? (MOTIVATIONAL_CHUNKS[currentL] || MOTIVATIONAL_CHUNKS.de).overdue
    : [];
  if (list && list.length > 0) {
    const chosen = pickWithoutImmediateRepeat(list, lastMotivationByTier['overdue']);
    lastMotivationByTier['overdue'] = chosen;
    return chosen;
  }
  return "";
}

function getContextMotivation(remSec, totSec, taskName = '') {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  if (remSec <= 0) {
    return getOverdueMotivation(lang, taskName, Math.abs(Math.floor(remSec / 60)));
  }
  const pct = totSec > 0 ? (remSec / totSec) * 100 : 0;
  
  let tier = 'end';
  if (pct > 70) tier = 'start';
  else if (pct > 25) tier = 'halfway';
  
  // Wenn eine Aufgabe aktiv ist, binden wir sie mit 50-60% Wahrscheinlichkeit natürlich ein
  if (taskName && typeof taskName === 'string' && taskName.trim() && Math.random() < 0.6) {
    const taskListObj = (typeof TASK_AWARE_MOTIVATIONS !== 'undefined' && TASK_AWARE_MOTIVATIONS[lang]) 
      ? TASK_AWARE_MOTIVATIONS[lang] 
      : (typeof TASK_AWARE_MOTIVATIONS !== 'undefined' ? TASK_AWARE_MOTIVATIONS.de : null);
    const taskTierList = taskListObj ? taskListObj[tier] : null;
    if (taskTierList && taskTierList.length > 0) {
      const template = pickWithoutImmediateRepeat(taskTierList, lastMotivationByTier[tier + '_task']);
      lastMotivationByTier[tier + '_task'] = template;
      const cleanTask = taskName.trim().replace(/^[\d\.\-\*•✓\s]+/, '');
      return template.replace('{task}', cleanTask);
    }
  }

  const list = MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS['de'];
  const chosen = pickWithoutImmediateRepeat(list[tier], lastMotivationByTier[tier]);
  lastMotivationByTier[tier] = chosen;
  return chosen;
}

// Angenehmer, dezenter Glockenton für die Minuten "dazwischen" (kein Sprechen, viel Klang-Varianz)

if (typeof window !== 'undefined') {
  window.VOICE_PROFILES = VOICE_PROFILES;
  window.toggleTimerSound = toggleTimerSound;
  window.updateMuteButtonsUI = updateMuteButtonsUI;
  window.playRandomTimerAmbient = playRandomTimerAmbient;
  window.updateSpeechVoices = updateSpeechVoices;
  window.speakWithProfile = speakWithProfile;
  window.speakVoiceSequence = speakVoiceSequence;
  window.speakSoftlyDynamic = speakSoftlyDynamic;
  window.previewVoiceCategory = previewVoiceCategory;
  window.getContextMotivation = getContextMotivation;
  window.getOverdueMotivation = getOverdueMotivation;
  window.getTimeUpPhrase = getTimeUpPhrase;
  window.getCurrentPresetMinutes = getCurrentPresetMinutes;
}
if (typeof globalThis !== 'undefined') {
  globalThis.VOICE_PROFILES = VOICE_PROFILES;
  globalThis.toggleTimerSound = toggleTimerSound;
  globalThis.updateMuteButtonsUI = updateMuteButtonsUI;
  globalThis.playRandomTimerAmbient = playRandomTimerAmbient;
  globalThis.updateSpeechVoices = updateSpeechVoices;
  globalThis.speakWithProfile = speakWithProfile;
  globalThis.speakVoiceSequence = speakVoiceSequence;
  globalThis.speakSoftlyDynamic = speakSoftlyDynamic;
  globalThis.previewVoiceCategory = previewVoiceCategory;
  globalThis.getContextMotivation = getContextMotivation;
  globalThis.getOverdueMotivation = getOverdueMotivation;
  globalThis.getTimeUpPhrase = getTimeUpPhrase;
  globalThis.getCurrentPresetMinutes = getCurrentPresetMinutes;
}

