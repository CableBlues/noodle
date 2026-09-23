// =========================================================================
// MODULAR HOME WORKOUT & PROFESSIONAL MOVEMENT ENGINE ("Bewegung")
// =========================================================================

let currentSportExercise = null;
let sportTimerInterval = null;
let sportTimerSeconds = 60;
let sportTimerRunning = false;
let sportTimerTargetEndTime = null;

// Routine Player State
let activeRoutine = null;
let activeRoutineIndex = 0;
let activeRoutineState = 'idle'; // 'work', 'rest', 'completed'
let activeRoutineTimerInterval = null;
let activeRoutineRemainingSec = 0;
let activeRoutineTargetEndTime = null;
let activeRoutineIsPaused = false;
let activeRoutineWorkSec = 45;
let activeRoutineRestSec = 15;
let activeRoutineAudio = 'none'; // 'none', 'beats', 'lofi', 'stream'

// Workout History Tracking
const WORKOUT_STATS_KEY = 'noodle_movement_stats_v1';

function getMovementStats() {
  try {
    const raw = localStorage.getItem(WORKOUT_STATS_KEY);
    return raw ? JSON.parse(raw) : { totalMinutes: 0, completedWorkouts: 0, lastWorkoutDate: null, streakDays: 0 };
  } catch (e) {
    return { totalMinutes: 0, completedWorkouts: 0, lastWorkoutDate: null, streakDays: 0 };
  }
}

function recordCompletedWorkout(durationMinutes) {
  try {
    const stats = getMovementStats();
    const todayStr = new Date().toISOString().split('T')[0];
    stats.totalMinutes = (stats.totalMinutes || 0) + durationMinutes;
    stats.completedWorkouts = (stats.completedWorkouts || 0) + 1;
    
    if (stats.lastWorkoutDate !== todayStr) {
      stats.streakDays = (stats.streakDays || 0) + 1;
      stats.lastWorkoutDate = todayStr;
    }
    localStorage.setItem(WORKOUT_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('recordCompletedWorkout error:', e);
  }
}

// Translations
const SPORT_TRANSLATIONS = {
  de: {
    no_exercise: "Keine Übung aktiv.",
    exercise_started: "Übungs-Timer gestartet! ⏱️",
    exercise_paused: "Übungs-Timer pausiert. ⏸️",
    exercise_skipped: "Übung übersprungen.",
    exercise_completed: "Wunderbar bewegt! 🎉 Dein Kreislauf dankt es dir.",
    energy_label: "Benötigtes Level: Löffel",
    next_suggestion: "Anderer Vorschlag 🔄",
    workout_started: "Workout gestartet! Gib dein Bestes 🚀",
    workout_paused: "Workout pausiert. ⏸️",
    workout_resumed: "Weiter geht's! 💪",
    workout_completed: "Fantastisch! Workout erfolgreich beendet! 🏆",
    rest_title: "Kurze Verschnaufpause",
    next_up: "Als Nächstes:",
    ready_set_go: "Los geht's!"
  },
  en: {
    no_exercise: "No exercise active.",
    exercise_started: "Exercise timer started! ⏱️",
    exercise_paused: "Exercise timer paused. ⏸️",
    exercise_skipped: "Exercise skipped.",
    exercise_completed: "Wonderfully moved! 🎉 Your body appreciates it.",
    energy_label: "Required level: Spoons",
    next_suggestion: "Another Suggestion 🔄",
    workout_started: "Workout started! Let's go 🚀",
    workout_paused: "Workout paused. ⏸️",
    workout_resumed: "Resuming workout! 💪",
    workout_completed: "Fantastic! Workout successfully completed! 🏆",
    rest_title: "Short Rest Interval",
    next_up: "Next up:",
    ready_set_go: "Get ready!"
  },
  es: {
    no_exercise: "Ningún ejercicio activo.",
    exercise_started: "¡Temporizador iniciado! ⏱️",
    exercise_paused: "Temporizador pausado. ⏸️",
    exercise_skipped: "Ejercicio omitido.",
    exercise_completed: "¡Maravilloso movimiento! 🎉 Tu cuerpo te lo agradece.",
    energy_label: "Nivel requerido: Cucharas",
    next_suggestion: "Siguiente sugerencia 🔄",
    workout_started: "¡Entrenamiento iniciado! 🚀",
    workout_paused: "Entrenamiento pausado. ⏸️",
    workout_resumed: "¡Continuamos! 💪",
    workout_completed: "¡Fantástico! ¡Entrenamiento completado! 🏆",
    rest_title: "Descanso breve",
    next_up: "A continuación:",
    ready_set_go: "¡Listos!"
  },
  el: {
    no_exercise: "Δεν υπάρχει ενεργή άσκηση.",
    exercise_started: "Το χρονόμετρο ξεκίνησε! ⏱️",
    exercise_paused: "Το χρονόμετρο σταμάτησε. ⏸️",
    exercise_skipped: "Η άσκηση παραλείφθηκε.",
    exercise_completed: "Υπέροχη κίνηση! 🎉 Το σώμα σου σε ευχαριστεί.",
    energy_label: "Απαιτούμενο επίπεδο: Κουτάλια",
    next_suggestion: "Επόμενη πρόταση 🔄",
    workout_started: "Η προπόνηση ξεκίνησε! 🚀",
    workout_paused: "Η προπόνηση σταμάτησε. ⏸️",
    workout_resumed: "Συνεχίζουμε! 💪",
    workout_completed: "Υπέροχα! Η προπόνηση ολοκληρώθηκε! 🏆",
    rest_title: "Σύντομο διάλειμμα",
    next_up: "Επόμενη άσκηση:",
    ready_set_go: "Ετοιμάσου!"
  },
  fr: {
    no_exercise: "Aucun exercice actif.",
    exercise_started: "Minuteur d'exercice démarré ! ⏱️",
    exercise_paused: "Minuteur d'exercice en pause. ⏸️",
    exercise_skipped: "Exercice passé.",
    exercise_completed: "Merveilleusement bougé ! 🎉 Ton corps te remercie.",
    energy_label: "Niveau requis : Cuillères",
    next_suggestion: "Autre suggestion 🔄",
    workout_started: "Entraînement démarré ! 🚀",
    workout_paused: "Entraînement en pause. ⏸️",
    workout_resumed: "C'est reparti ! 💪",
    workout_completed: "Fantastique ! Entraînement terminé ! 🏆",
    rest_title: "Courte pause",
    next_up: "À suivre :",
    ready_set_go: "Prêt !"
  },
  it: {
    no_exercise: "Nessun esercizio attivo.",
    exercise_started: "Timer dell'esercizio avviato! ⏱️",
    exercise_paused: "Timer dell'esercizio in pausa. ⏸️",
    exercise_skipped: "Esercizio saltato.",
    exercise_completed: "Ti sei mosso magnificamente! 🎉 Il tuo corpo ti ringrazia.",
    energy_label: "Livello richiesto: Cucchiai",
    next_suggestion: "Altro suggerimento 🔄",
    workout_started: "Allenamento iniziato! 🚀",
    workout_paused: "Allenamento in pausa. ⏸️",
    workout_resumed: "Si riprende! 💪",
    workout_completed: "Fantastico! Allenamento completato! 🏆",
    rest_title: "Breve pausa",
    next_up: "Prossimo:",
    ready_set_go: "Pronti!"
  }
};

function getSportT(key) {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  return SPORT_TRANSLATIONS[lang]?.[key] || SPORT_TRANSLATIONS['de'][key] || key;
}

// =========================================================================
// COMPREHENSIVE MODULAR HOME EXERCISES DATABASE
// =========================================================================
const HOME_WORKOUT_LIBRARY = [
  // 1. BEINE & GESÄSS (QUIET / KEIN SPRINGEN)
  {
    id: 'quiet_squat',
    category: 'legs',
    equipment: 'none',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Langsame Tief-Kniebeugen 🦵', en: 'Controlled Air Squats 🦵', fr: 'Squats Contrôlés 🦵', es: 'Sentadillas Controladas 🦵', it: 'Squat Controllati 🦵', el: 'Ελεγχόμενα Καθίσματα 🦵' },
    desc: { de: '3 Sek. kontrolliert absenken, 1 Sek. kraftvoll aufstehen. Fersen bleiben fest am Boden. Komplett geräuschlos.', en: 'Lower down in 3s, power up in 1s. Keep heels flat. Completely silent.', fr: 'Descends en 3s, remonte en 1s. Pieds bien à plat.', es: 'Baja en 3s, sube en 1s. Talones firmes en el suelo.', it: 'Scendi in 3s, sali in 1s. Talloni ben saldi.', el: 'Κατέβα σε 3δ, ανέβα δυναμικά σε 1δ. Πέλματα σταθερά.' },
    muscle: { de: 'Beine & Gesäß', en: 'Quads & Glutes', fr: 'Cuisses & Fessiers', es: 'Piernas y Glúteos', it: 'Gambe e Glutei', el: 'Πόδια & Γλουτοί' },
    defaultSec: 45
  },
  {
    id: 'glute_bridge',
    category: 'legs',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Beckenbrücke (Glute Bridge) 🍑', en: 'Glute Bridge 🍑', fr: 'Pont Fessier 🍑', es: 'Puente de Glúteos 🍑', it: 'Ponte per Glutei 🍑', el: 'Γέφυρα Γλουτών 🍑' },
    desc: { de: 'Rückenlage, Fersen aufstellen. Becken nach oben drücken, oben 2 Sek. Gesäß fest anspannen, sanft absenken.', en: 'Lie on back, push hips up, squeeze glutes for 2s at the top, lower gently.', fr: 'Allongé sur le dos, pousse les hanches vers le haut.', es: 'Tumbado, eleva la pelvis y aprieta glúteos 2s arriba.', it: 'Supino, solleva il bacino e contrai i glutei.', el: 'Ξαπλωμένος, σήκωσε τη λεκάνη και σφίξε γλουτούς για 2δ.' },
    muscle: { de: 'Gesäß & Beinbeuger', en: 'Glutes & Hamstrings', fr: 'Fessiers & Ischios', es: 'Glúteos e Isquiotibiales', it: 'Glutei e Flessori', el: 'Γλουτοί & Οπίσθιοι μηριαίοι' },
    defaultSec: 45
  },
  {
    id: 'wall_sit',
    category: 'legs',
    equipment: 'wall',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Wandsitz (Wall Sit) 🧱', en: 'Wall Sit Isometric 🧱', fr: 'Chaise au Mur 🧱', es: 'Silla en la Pared 🧱', it: 'Sedia a Muro 🧱', el: 'Κάθισμα στον Τοίχο 🧱' },
    desc: { de: 'Rücken an die Wand, Knie auf 90° beugen. Ruhig und tief atmen. Baut enorme Beinkraft ohne Bewegung auf.', en: 'Back flat on wall, 90° knee bend. Breathe deeply. Pure isometric strength.', fr: 'Dos contre le mur, genoux à 90°, respiration calme.', es: 'Espalda en la pared, rodillas a 90°. Respira con calma.', it: 'Schiena al muro, ginocchia a 90°. Respira a fondo.', el: 'Πλάτη στον τοίχο, γόνατα στις 90 μοίρες. Ανάπνεε ήρεμα.' },
    muscle: { de: 'Oberschenkel & Stabilität', en: 'Quads & Stability', fr: 'Quadriceps & Stabilité', es: 'Cuádriceps y Estabilidad', it: 'Quadricipiti e Stabilità', el: 'Τετρακέφαλοι & Σταθερότητα' },
    defaultSec: 40
  },
  {
    id: 'reverse_lunges',
    category: 'legs',
    equipment: 'none',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Ausfallschritt nach hinten 🚶‍♀️', en: 'Silent Reverse Lunges 🚶‍♀️', fr: 'Fentes Arrière Silencieuses 🚶‍♀️', es: 'Zancadas Hacia Atrás 🚶‍♀️', it: 'Affondi Indietro Silenziosi 🚶‍♀️', el: 'Προβολές Προς τα Πίσω 🚶‍♀️' },
    desc: { de: 'Schritt sanft nach hinten setzen, hinteres Knie kurz vor dem Boden halten, abdrücken und Seite wechseln.', en: 'Step backward softly, drop knee near floor, return and alternate legs.', fr: 'Pas doux en arrière, descends le genou, alterne.', es: 'Paso suave atrás, baja la rodilla y cambia de lado.', it: 'Passo indietro morbido, scendi e alterna le gambe.', el: 'Απαλό βήμα πίσω, χαμήλωσε το γόνατο, άλλαξε πλευρά.' },
    muscle: { de: 'Beine & Balance', en: 'Legs & Balance', fr: 'Jambes & Équilibre', es: 'Piernas y Equilibrio', it: 'Gambe ed Equilibrio', el: 'Πόδια & Ισορροπία' },
    defaultSec: 45
  },
  {
    id: 'standing_calf_raise',
    category: 'legs',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Wadenheber & Zehenstand 🦵', en: 'Calf Raises & Balance 🦵', fr: 'Élévations des Mollets 🦵', es: 'Elevación de Talones 🦵', it: 'Sollevamenti Polpacci 🦵', el: 'Ανυψώσεις Γαμπών 🦵' },
    desc: { de: 'Auf die Fußballen hochdrücken, 2 Sek. halten und Fersen ganz langsam absenken. Aktiviert die Venenpumpe.', en: 'Push high on toes, hold 2s, lower slowly. Boosts blood circulation.', fr: 'Monte sur la pointe des pieds, maintiens 2s et redescends.', es: 'Sube a las puntas de los pies, sostén 2s y baja despacio.', it: 'Sali sulle punte dei piedi, tieni 2s e scendi piano.', el: 'Σήκω στις μύτες, κράτα 2δ, κατέβα αργά. Ενισχύει την κυκλοφορία.' },
    muscle: { de: 'Waden & Fußgelenke', en: 'Calves & Ankles', fr: 'Mollets & Chevilles', es: 'Pantorrillas y Tobillos', it: 'Polpacci e Caviglie', el: 'Γάμπες & Αστράγαλοι' },
    defaultSec: 40
  },

  // 2. CORE & RUMPFSTABILITÄT
  {
    id: 'dead_bug',
    category: 'core',
    equipment: 'none',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Dead Bug (Rumpf-Koordination) 🪲', en: 'Dead Bug Core 🪲', fr: 'Dead Bug Abdominaux 🪲', es: 'Dead Bug Abdominal 🪲', it: 'Dead Bug Addominali 🪲', el: 'Dead Bug (Κοιλιακοί) 🪲' },
    desc: { de: 'Rückenlage, LWS fest in den Boden drücken. Diagonale Arme und Beine langsam absenken und zurückführen.', en: 'Lie on back, lower opposite arm and leg slowly while pressing low back to floor.', fr: 'Dos au sol, abaisse bras et jambe opposés lentement.', es: 'Espalda plana en el suelo, baja brazo y pierna opuestos.', it: 'Schiena a terra, abbassa braccio e gamba opposti.', el: 'Πλάτη στο πάτωμα, κατέβασε αργά αντίθετο χέρι και πόδι.' },
    muscle: { de: 'Tiefe Bauchmuskeln', en: 'Deep Core & Stability', fr: 'Abdominaux Profonds', es: 'Core Profundo', it: 'Core Profondo', el: 'Βαθείς Κοιλιακοί' },
    defaultSec: 45
  },
  {
    id: 'bird_dog',
    category: 'core',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Bird-Dog (Vierfüßler Diagonale) 🐕', en: 'Bird-Dog Stability 🐕', fr: 'Bird-Dog Équilibre 🐕', es: 'Bird-Dog Estabilidad 🐕', it: 'Bird-Dog Stabilità 🐕', el: 'Bird-Dog (Ραχιαίοι) 🐕' },
    desc: { de: 'Vierfüßlerstand. Rechten Arm und linkes Bein waagerecht strecken, kurz halten, wechseln. Stärkt den Rücken.', en: 'On all fours, extend opposite arm and leg straight out. Hold 2s and switch.', fr: 'À quatre pattes, étends bras et jambe opposés.', es: 'En cuatro patas, extiende brazo y pierna opuestos.', it: 'A quattro zampe, allunga braccio e gamba opposti.', el: 'Στα τέσσερα, τέντωσε αντίθετο χέρι και πόδι.' },
    muscle: { de: 'Rückenstrecker & Core', en: 'Lower Back & Core', fr: 'Dorsaux & Core', es: 'Lumbares y Core', it: 'Lombari e Core', el: 'Μέση & Κορμός' },
    defaultSec: 45
  },
  {
    id: 'plank_hold',
    category: 'core',
    equipment: 'none',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Unterarmstütz (Plank) 🛡️', en: 'Forearm Plank Hold 🛡️', fr: 'Gainage Planche 🛡️', es: 'Plancha Frontal 🛡️', it: 'Plank Avambracci 🛡️', el: 'Σανίδα (Plank) 🛡️' },
    desc: { de: 'Körper in einer geraden Linie halten, Bauchnabel nach innen ziehen, Gesäß anspannen. Gleichmäßig atmen.', en: 'Maintain straight line from head to heels, engage core and glutes. Breathe.', fr: 'Corps aligné, nombril rentré, fessiers serrés.', es: 'Cuerpo en línea recta, aprieta abdomen y glúteos.', it: 'Corpo allineato, contrai addome e glutei.', el: 'Σώμα σε ευθεία, σφίξε κοιλιά και γλουτούς.' },
    muscle: { de: 'Ganzkörper-Core', en: 'Full Core & Shoulders', fr: 'Gainage Complet', es: 'Core Completo', it: 'Core Completo', el: 'Κορμός & Ώμοι' },
    defaultSec: 40
  },
  {
    id: 'standing_cross_crunch',
    category: 'core',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Stehender Kreuz-Crunch 🧬', en: 'Standing Cross-Crunches 🧬', fr: 'Crunchs Croisés Debout 🧬', es: 'Crunches Cruzados de Pie 🧬', it: 'Crunch Incrociati in Piedi 🧬', el: 'Όρθιοι Χιαστί Κοιλιακοί 🧬' },
    desc: { de: 'Hände an die Schläfen. Rechtes Knie zum linken Ellbogen führen, kurz zusammendrücken, dann Seite wechseln.', en: 'Hands behind head, bring opposite knee to elbow with a controlled crunch.', fr: 'Mains aux tempes, amène le genou au coude opposé.', es: 'Manos en la nuca, lleva la rodilla al codo contrario.', it: 'Mani alla nuca, porta il ginocchio al gomito opposto.', el: 'Χέρια στους κροτάφους, φέρε αντίθετο γόνατο σε αγκώνα.' },
    muscle: { de: 'Schräge Bauchmuskeln', en: 'Obliques & Hip Flexors', fr: 'Obliques', es: 'Oblicuos', it: 'Obliqui', el: 'Πλάγιοι κοιλιακοί' },
    defaultSec: 45
  },

  // 3. OBERKÖRPER & HALTUNG
  {
    id: 'wall_incline_pushups',
    category: 'upper',
    equipment: 'wall',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Wand- oder Tisch-Liegestütze 🧱', en: 'Wall / Incline Push-Ups 🧱', fr: 'Pompes Murales ou Inclinées 🧱', es: 'Flexiones Inclinadas o de Pared 🧱', it: 'Piegamenti a Parete o Inclinati 🧱', el: 'Κάμψεις στον Τοίχο ή Πάγκο 🧱' },
    desc: { de: 'Hände schulterbreit an Wand oder Tischkante. Brust kontrolliert absenken und kraftvoll wegdrücken.', en: 'Hands shoulder-width on wall or desk edge. Lower chest and push back firmly.', fr: 'Mains à la largeur des épaules, descends la poitrine et repousse.', es: 'Manos al ancho de hombros en pared o mesa, baja y empuja.', it: 'Mani larghezza spalle su muro o tavolo, scendi e spingi.', el: 'Χέρια στο άνοιγμα των ώμων σε τοίχο ή γραφείο, κάμψε και σπρώξε.' },
    muscle: { de: 'Brust, Schultern & Trizeps', en: 'Chest, Shoulders & Triceps', fr: 'Pectoraux & Triceps', es: 'Pecho, Hombros y Tríceps', it: 'Pettorali e Tricipiti', el: 'Στήθος, Ώμοι & Τρικέφαλοι' },
    defaultSec: 45
  },
  {
    id: 'prone_y_t_w',
    category: 'upper',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Y-T-W Rücken-Aktivierung 🦅', en: 'Y-T-W Scapular Wings 🦅', fr: 'Y-T-W Activation Posturale 🦅', es: 'Y-T-W Activación de Espalda 🦅', it: 'Y-T-W Apertura Scapolare 🦅', el: 'Y-T-W Ενεργοποίηση Πλάτης 🦅' },
    desc: { de: 'Leicht vorgebeugt oder bauchlings: Arme in Y-, T- und W-Form heben, Schulterblätter kraftvoll zusammenziehen.', en: 'Hinged forward or on floor: lift arms in Y, T, and W shapes, squeezing shoulder blades.', fr: 'Buste penché : lève les bras en Y, T et W en serrant les omoplates.', es: 'Inclina el torso: eleva brazos en Y, T y W apretando omóplatos.', it: 'Busto inclinato: solleva le braccia in Y, T e W stringendo le scapole.', el: 'Σκυφτός: σήκωσε χέρια σε σχήμα Y, T και W σφίγγοντας ωμοπλάτες.' },
    muscle: { de: 'Oberer Rücken & Haltung', en: 'Upper Back & Posture', fr: 'Haut du Dos & Posture', es: 'Espalda Alta y Postura', it: 'Dorsali Alti e Postura', el: 'Άνω Πλάτη & Στάση Σώματος' },
    defaultSec: 45
  },
  {
    id: 'doorframe_chest_stretch',
    category: 'upper',
    equipment: 'wall',
    quiet: true,
    intensity: 'light',
    name: { de: 'Türrahmen-Brustöffner 🚪', en: 'Doorframe Chest Expansion 🚪', fr: 'Ouverture Pectorale de Porte 🚪', es: 'Apertura de Pecho en Puerta 🚪', it: 'Apertura Pettorale allo Stipite 🚪', el: 'Άνοιγμα Θώρακα στην Πόρτα 🚪' },
    desc: { de: 'Unterarme an den Türrahmen legen, sanften Schritt nach vorn machen. Dehnt die verkürzte Brustmuskulatur auf.', en: 'Forearms on doorframe, step gently forward to expand chest. Counteracts desk hunch.', fr: "Avant-bras sur le cadre de porte, avance d'un pas pour étirer le torse.", es: 'Antebrazos en el marco de la puerta, da un paso adelante y abre el pecho.', it: 'Avambracci sullo stipite, fai un passo avanti per aprire il petto.', el: 'Πήχεις στην κάσα της πόρτας, κάνε βήμα μπροστά για διάταση στήθους.' },
    muscle: { de: 'Brustkorb & HWS-Entlastung', en: 'Chest & Shoulder Front', fr: 'Poitrine & Épaules', es: 'Pecho y Hombros', it: 'Pettorali e Spalle', el: 'Θώρακας & Ώμοι' },
    defaultSec: 45
  },

  // 4. DESK-MOBILITY & NACKEN (Schreibtisch-Entlastung)
  {
    id: 'desk_neck_release',
    category: 'mobility',
    equipment: 'chair',
    quiet: true,
    intensity: 'light',
    name: { de: 'Halswirbel- & Nacken-Reset 🧘‍♀️', en: 'Cervical & Neck Release 🧘‍♀️', fr: 'Détente Nuque & Cervicales 🧘‍♀️', es: 'Liberación Cervical y Cuello 🧘‍♀️', it: 'Rilascio Cervicale e Collo 🧘‍♀️', el: 'Ανακούφιση Αυχένα & HWS 🧘‍♀️' },
    desc: { de: 'Kopf langsam zur Seite neigen, Gegenhand zum Boden schieben. Nach 20 Sek. die Seite wechseln. Tief atmen.', en: 'Tilt head to side, push opposite palm down. Switch after 20s. Breathe deeply.', fr: 'Incline la tête, pousse la main opposée vers le bas. Change à 20s.', es: 'Inclina la cabeza, empuja la mano contraria al suelo. Cambia a los 20s.', it: 'Inclina la testa, spingi la mano opposta in basso. Cambia a 20s.', el: 'Γείρε το κεφάλι, σπρώξε το αντίθετο χέρι κάτω. Άλλαξε στα 20δ.' },
    muscle: { de: 'Nacken & Trapezmuskel', en: 'Neck & Trapezius', fr: 'Nuque & Trapèzes', es: 'Cuello y Trapecios', it: 'Collo e Trapezi', el: 'Αυχένας & Τραπεζοειδής' },
    defaultSec: 45
  },
  {
    id: 'seated_spinal_twist',
    category: 'mobility',
    equipment: 'chair',
    quiet: true,
    intensity: 'light',
    name: { de: 'Sitzende Wirbelsäulen-Drehung 🌿', en: 'Seated Spinal Rotation 🌿', fr: 'Torsion Vertébrale Assise 🌿', es: 'Torsión Espinal Sentada 🌿', it: 'Torsione Spinale da Seduti 🌿', el: 'Στροφή Σπονδυλικής Στήλης 🌿' },
    desc: { de: 'Aufrecht sitzen, Oberkörper sanft nach rechts drehen, Hand an Stuhllehne. 20s halten, dann nach links.', en: 'Sit tall, gently twist torso right holding chair. Hold 20s, then switch to left.', fr: 'Assis droit, tourne le buste vers la droite 20s, puis vers la gauche.', es: 'Siéntate erguido, gira el torso a la derecha 20s, luego a la izquierda.', it: 'Siediti dritto, ruota il busto a destra per 20s, poi a sinistra.', el: 'Κάθισε ίσια, στρίψε τον κορμό δεξιά για 20δ, μετά αριστερά.' },
    muscle: { de: 'Brustwirbelsäule & Rippen', en: 'Thoracic Spine & Ribs', fr: 'Colonne Thoracique', es: 'Columna Dorsal', it: 'Colonna Toracica', el: 'Θωρακική Μοίρα' },
    defaultSec: 45
  },
  {
    id: 'wrist_forearm_carpal',
    category: 'mobility',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Mausarm- & Handgelenk-Dehnung 👐', en: 'Wrist & Forearm Release 👐', fr: 'Étirement Poignets & Avant-Bras 👐', es: 'Estiramiento de Muñecas y Brazos 👐', it: 'Allungamento Polsi e Avambracci 👐', el: 'Διάταση Καρπών & Πήχεων 👐' },
    desc: { de: 'Arm nach vorn strecken, Finger mit anderer Hand sanft nach hinten dehnen. Löst Krämpfe von Maus & Tastatur.', en: 'Extend arm forward, gently pull fingers back with opposite hand. Releases mouse tension.', fr: "Tends le bras, tire doucement les doigts vers l'arrière.", es: 'Extiende el brazo, tira suavemente los dedos hacia atrás.', it: 'Stendi il braccio, tira delicatamente le dita indietro.', el: 'Τέντωσε το χέρι μπροστά, τράβα απαλά τα δάχτυλα πίσω.' },
    muscle: { de: 'Unterarme & Sehnen', en: 'Forearms & Flexors', fr: 'Avant-Bras & Tendons', es: 'Antebrazos y Tendones', it: 'Avambracci e Tendini', el: 'Πήχεις & Τένοντες' },
    defaultSec: 40
  },

  // 5. LOW-IMPACT FLOW & GANZKÖRPER
  {
    id: 'low_impact_step_jack',
    category: 'full',
    equipment: 'none',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Leiser Step-Jack (Ganzkörper) 🤸‍♂️', en: 'Low-Impact Step Jack 🤸‍♂️', fr: 'Step Jack Silencieux 🤸‍♂️', es: 'Step Jack de Bajo Impacto 🤸‍♂️', it: 'Step Jack a Basso Impacto 🤸‍♂️', el: 'Step Jack Χωρίς Άλμα 🤸‍♂️' },
    desc: { de: 'Schritt abwechselnd nach rechts und links setzen, Arme schwungvoll über den Kopf führen. Null Erschütterung.', en: 'Step rhythmically side to side while swinging arms overhead. Zero floor noise.', fr: 'Pas alternés droite/gauche avec levée des bras. Zéro bruit.', es: 'Paso lateral rítmico con elevación de brazos. Cero ruido.', it: 'Passo laterale ritmico con apertura braccia. Zero rumore.', el: 'Ρυθμικό βήμα δεξιά-αριστερά με άνοιγμα χεριών. Μηδέν θόρυβος.' },
    muscle: { de: 'Herz-Kreislauf & Koordination', en: 'Cardio & Full Body', fr: 'Cardio & Corps Entier', es: 'Cardio y Cuerpo Completo', it: 'Cardio e Corpo Intero', el: 'Καρδιαγγειακό & Όλο το Σώμα' },
    defaultSec: 45
  },
  {
    id: 'shadow_boxing_flow',
    category: 'full',
    equipment: 'none',
    quiet: true,
    intensity: 'medium',
    name: { de: 'Rhythmisches Schattenboxen 🥊', en: 'Rhythmic Shadow Boxing 🥊', fr: "Boxe de l'Ombre Rythmée 🥊", es: 'Sombra de Boxeo Rítmica 🥊', it: 'Shadow Boxing Ritmico 🥊', el: 'Ρυθμική Σκιαμαχία 🥊' },
    desc: { de: 'Fester Stand. Lockere, kontrollierte Schläge geradeaus in die Luft. Löst Stress und lockert Schultern.', en: 'Solid stance. Throw gentle, controlled punches in the air. Blows off steam.', fr: 'Posture solide. Donne des coups légers et contrôlés dans le vide.', es: 'Postura firme. Lanza golpes suaves y controlados al aire.', it: "Posizione solida. Sferra pugni morbidi e controllati nell'aria.", el: 'Σταθερή στάση. Ρίξε απαλές, ελεγχόμενες γροθιές στον αέρα.' },
    muscle: { de: 'Schultern, Rumpf & Kreislauf', en: 'Shoulders, Core & Cardio', fr: 'Épaules, Buste & Cardio', es: 'Hombros, Core y Cardio', it: 'Spalle, Core e Cardio', el: 'Ώμοι, Κορμός & Κυκλοφορία' },
    defaultSec: 45
  },
  {
    id: 'good_mornings',
    category: 'full',
    equipment: 'none',
    quiet: true,
    intensity: 'light',
    name: { de: 'Good Mornings (Hüftbeugung) 🌅', en: 'Good Mornings (Hip Hinge) 🌅', fr: 'Good Mornings (Charnière de Hanche) 🌅', es: 'Good Mornings (Bisagra de Cadera) 🌅', it: "Good Mornings (Flessione d'Anca) 🌅", el: 'Good Mornings (Κλίση Ισχίων) 🌅' },
    desc: { de: 'Hände an die Schläfen, Knie leicht gebeugt. Oberkörper mit geradem Rücken nach vorn neigen, Gesäß nach hinten schieben.', en: 'Hands behind head, slight knee bend. Hinge at hips with a flat back, then return.', fr: "Mains aux tempes, dos plat, pousse les fessiers vers l'arrière.", es: 'Manos a la nuca, espalda recta, inclina el torso desde la cadera.', it: 'Mani alla nuca, schiena dritta, fletti il busto dalle anche.', el: 'Χέρια στους κροτάφους, ίσια πλάτη, γείρε τον κορμό από τα ισχία.' },
    muscle: { de: 'Rückenstrecker & Gesäß', en: 'Posterior Chain & Glutes', fr: 'Chaîne Postérieure & Fessiers', es: 'Cadena Posterior y Glúteos', it: 'Catena Posteriore e Glutei', el: 'Οπίσθια Αλυσίδα & Γλουτοί' },
    defaultSec: 45
  }
];

// Presets mapping
const WORKOUT_PRESETS = {
  express_5: {
    id: 'express_5',
    icon: 'zap',
    title: { de: '⚡ Express Flow (5 Min)', en: '⚡ Express Flow (5 Min)', fr: '⚡ Express Flow (5 Min)', es: '⚡ Express Flow (5 Min)', it: '⚡ Express Flow (5 Min)', el: '⚡ Express Flow (5 Min)' },
    subtitle: { de: 'Schneller Kreislauf-Kick für Zwischendurch', en: 'Quick energy boost for busy moments', fr: 'Coup de fouet énergétique rapide', es: 'Impulso rápido de energía', it: 'Spinta rapida di energia', el: 'Γρήγορη τόνωση ενέργειας' },
    durationMin: 5,
    exerciseIds: ['low_impact_step_jack', 'quiet_squat', 'doorframe_chest_stretch', 'standing_cross_crunch', 'shadow_boxing_flow'],
    workSec: 45,
    restSec: 15
  },
  apartment_quiet_10: {
    id: 'apartment_quiet_10',
    icon: 'home',
    title: { de: '🛋️ Leise Wohnung / Nachbar-Safe (10 Min)', en: '🛋️ Quiet Apartment / Neighbor-Safe (10 Min)', fr: '🛋️ Appartement Silencieux (10 Min)', es: '🛋️ Apartamento Silencioso (10 Min)', it: '🛋️ Appartamento Silenzioso (10 Min)', el: '🛋️ Αθόρυβο Στο Σπίτι (10 Min)' },
    subtitle: { de: 'Effektiv trainieren ohne Springen oder Trittschall', en: 'Train effectively without jumping or floor noise', fr: 'Entraînement efficace sans sauts ni bruit', es: 'Entrena sin saltos ni ruidos molestos', it: 'Allenati senza salti né rumori', el: 'Προπόνηση χωρίς άλματα και θόρυβο' },
    durationMin: 10,
    exerciseIds: ['quiet_squat', 'glute_bridge', 'wall_sit', 'dead_bug', 'bird_dog', 'reverse_lunges', 'prone_y_t_w', 'standing_calf_raise'],
    workSec: 50,
    restSec: 15
  },
  desk_reset_5: {
    id: 'desk_reset_5',
    icon: 'armchair',
    title: { de: '🪑 Desk- & Nacken-Reset (5 Min)', en: '🪑 Desk & Neck Reset (5 Min)', fr: '🪑 Reset Nuque & Bureau (5 Min)', es: '🪑 Reset de Cuello y Escritorio (5 Min)', it: '🪑 Reset Collo e Scrivania (5 Min)', el: '🪑 Επαναφορά Αυχένα & Γραφείου (5 Min)' },
    subtitle: { de: 'Löst Haltungsschäden & Verspannungen von Vielsitzern', en: 'Releases desk tension and posture hunch', fr: 'Soulage les tensions du travail assis', es: 'Alivia tensiones por estar sentado', it: 'Scioglie le tensioni da lavoro sedentario', el: 'Ανακουφίζει από την καθιστική εργασία' },
    durationMin: 5,
    exerciseIds: ['desk_neck_release', 'seated_spinal_twist', 'doorframe_chest_stretch', 'wrist_forearm_carpal', 'prone_y_t_w'],
    workSec: 45,
    restSec: 15
  },
  core_stability_10: {
    id: 'core_stability_10',
    icon: 'shield-check',
    title: { de: '🔥 Core & Rumpfstärke (10 Min)', en: '🔥 Core & Spine Stability (10 Min)', fr: '🔥 Gainage & Force du Tronc (10 Min)', es: '🔥 Core y Fuerza Abdominal (10 Min)', it: '🔥 Core e Forza Addominale (10 Min)', el: '🔥 Κορμός & Σταθερότητα (10 Min)' },
    subtitle: { de: 'Bauch- & Rückenmuskulatur für eine gesunde Wirbelsäule', en: 'Strengthen abs and lower back for spine health', fr: 'Renforce abdos et dos pour la colonne', es: 'Fortalece abdomen y espalda para tu columna', it: 'Rinforza addome e schiena per la colonna', el: 'Ενδυνάμωση κοιλιακών και ράχης' },
    durationMin: 10,
    exerciseIds: ['plank_hold', 'dead_bug', 'bird_dog', 'standing_cross_crunch', 'glute_bridge', 'good_mornings', 'wall_sit', 'plank_hold'],
    workSec: 50,
    restSec: 15
  },
  full_body_power_15: {
    id: 'full_body_power_15',
    icon: 'sparkles',
    title: { de: '🌟 Ganzkörper Power-Zirkel (15 Min)', en: '🌟 Full Body Power Circuit (15 Min)', fr: '🌟 Circuit Corps Entier Power (15 Min)', es: '🌟 Circuito Completo de Fuerza (15 Min)', it: '🌟 Circuito Total Body Power (15 Min)', el: '🌟 Ολοκληρωμένο Κυκλικό (15 Min)' },
    subtitle: { de: 'Kompletter Zirkel für Kraft, Ausdauer & Haltung', en: 'Complete circuit for strength, endurance & posture', fr: 'Circuit complet force, endurance et posture', es: 'Circuito completo de fuerza y resistencia', it: 'Circuito completo per forza e postura', el: 'Πλήρης κύκλος δύναμης και αντοχής' },
    durationMin: 15,
    exerciseIds: ['low_impact_step_jack', 'quiet_squat', 'wall_incline_pushups', 'dead_bug', 'reverse_lunges', 'prone_y_t_w', 'shadow_boxing_flow', 'glute_bridge', 'plank_hold', 'standing_calf_raise', 'doorframe_chest_stretch', 'good_mornings'],
    workSec: 50,
    restSec: 15
  }
};

// =========================================================================
// BACKWARD-COMPATIBLE SPOON-LEVEL MINI EXERCISES
// =========================================================================
const SPORT_EXERCISES = {
  de: {
    1: [
      { name: "Nacken-Entlastung 🧘‍♀️", desc: "Setze dich aufrecht hin. Lasse den Kopf langsam zur rechten Schulter sinken. Halte für 30s, dann wechsle die Seite. Atme tief ein.", duration: 60 },
      { name: "Handgelenk-Lockerung 👐", desc: "Kreise deine Handgelenke ganz sanft 30s nach links, dann 30s nach rechts. Perfekt, um Schreibtischanspannung zu lösen.", duration: 60 },
      { name: "Schulter-Kreisen 🔄", desc: "Zieh deine Schultern sanft nach oben zu den Ohren, kreise sie nach hinten und lasse sie sinken. Wiederhole das entspannt für 1 Minute.", duration: 60 },
      { name: "Katze-Kuh im Sitzen 🪑", desc: "Lege die Hände auf deine Knie. Beim Einatmen schiebst du die Brust sanft nach vorne (leichtes Hohlkreuz), beim Ausatmen machst du den Rücken ganz rund.", duration: 60 },
      { name: "Augen-Entspannung (Palming) 👀", desc: "Reibe deine Handflächen kräftig aneinander, bis sie warm sind. Lege sie sanft schalenförmig über deine geschlossenen Augen. Atme 5-mal tief durch.", duration: 60 },
      { name: "Sanftes Fußkreisen 🦶", desc: "Hebe im Sitzen einen Fuß leicht an und kreise ihn entspannt 30s nach links, dann 30s nach rechts. Danach die Seite wechseln.", duration: 60 },
      { name: "Brustkorb-Dehnung (Sitzend) 🫁", desc: "Verschränke die Finger hinter dem Kopf, ziehe die Ellbogen weit nach außen und öffne deinen Brustkorb sanft nach oben. Atme ruhig.", duration: 60 },
      { name: "Finger-Koordination 🧠", desc: "Bilde mit Daumen und Zeigefinger nacheinander Ringe mit allen Fingern der Hand. Geh vor und wieder zurück. Fördert sanft die Konzentration.", duration: 60 }
    ],
    2: [
      { name: "Brustöffner im Stehen 👐", desc: "Stelle dich aufrecht hin. Verschränke deine Hände hinter dem Rücken und ziehe sie sanft nach unten weg. Spüre die Dehnung in Brust und Schultern.", duration: 60 },
      { name: "Sanftes Wirbelsäulen-Pendeln 🌿", desc: "Lasse deine Arme im Stehen locker an den Seiten hängen. Drehe deinen Oberkörper ganz entspannt von links nach rechts, sodass die Arme locker mitschwingen.", duration: 60 },
      { name: "Himmels-Streckung 🌌", desc: "Strecke dich abwechselnd mit dem linken und rechten Arm so weit wie möglich nach oben, als würdest du Sterne pflücken. Atme gleichmäßig.", duration: 60 },
      { name: "Beckenkreisen 🌀", desc: "Stelle dich hüftbreit hin, lege die Hände auf die Hüften und ziehe ganz langsame, sanfte Kreise mit deinem Becken. Wechsel nach der Hälfte die Richtung.", duration: 60 },
      { name: "Nacken-Seitendehnung 📐", desc: "Neige den Kopf zur linken Schulter. Schiebe die rechte Handfläche aktiv Richtung Boden, um den Dehnreiz im Arm-Nerven-Strang zu verstärken. Nach 30s wechseln.", duration: 60 },
      { name: "Seitlicher Bogen 🏹", desc: "Strecke einen Arm weit nach oben und neige deinen Oberkörper sanft zur gegenüberliegenden Seite. Halte für 30s, dann wechsle den Arm.", duration: 60 },
      { name: "Schulterblätter-Dehnung 🛡️", desc: "Verschränke deine Hände vor der Brust, runde deinen oberen Rücken maximal und schiebe die Handflächen nach vorne weg. Halten und tief atmen.", duration: 60 },
      { name: "Adler-Arme 🦅", desc: "Kreuze die Arme vor dem Körper, verschränke die Unterarme ineinander und schiebe deine Ellbogen sanft nach oben. Dehnt den oberen Rücken wunderbar.", duration: 60 }
    ],
    3: [
      { name: "Küchen-Kniebeugen 🪑", desc: "Halte dich optional an einer Stuhllehne oder Arbeitsplatte fest. Senke dein Becken kontrolliert nach hinten ab (wie beim Hinsetzen) und richte dich wieder auf.", duration: 60 },
      { name: "Wadenheben (Venenpresse) 🦵", desc: "Drücke dich im Stehen kontrolliert auf die Zehenspitzen hoch, halte kurz die Balance und senke die Fersen langsam wieder ab. Wiederhole dies gleichmäßig.", duration: 60 },
      { name: "Wand-Liegestütze 🧱", desc: "Stelle dich einen Schritt entfernt vor eine Wand. Lege die Hände flach auf, senke deine Brust kontrolliert zur Wand ab und drücke dich sanft wieder weg.", duration: 60 },
      { name: "Hampelmann für Faule (Low Impact) 🤸‍♂️", desc: "Mache einen Schritt zur Seite und nimm den Arm der gleichen Seite mit nach oben. Wechsle rhythmisch die Seiten, ohne zu springen. Sehr gelenkschonend.", duration: 60 },
      { name: "Lockerer Faust-Stoß (Schattenboxen) 🥊", desc: "Stelle dich stabil hin. Boxe locker und rhythmisch abwechselnd mit links und rechts geradeaus in die Luft. Löst Spannungen im Schultergürtel.", duration: 60 },
      { name: "Knie-Ellbogen-Tipp 🧬", desc: "Führe im Stehen im Wechsel das linke Knie zum rechten Ellbogen und das rechte Knie zum linken Ellbogen. Aktiviert deine schräge Rumpfmuskulatur.", duration: 60 },
      { name: "Standwaage mit Festhalten ⚖️", desc: "Halte dich an einer Stuhllehne fest. Hebe ein Bein gestreckt nach hinten an und neige den Oberkörper leicht vor. 30s halten, dann Seite wechseln.", duration: 60 },
      { name: "Schulterblatt-Squeeze 🏋️", desc: "Stelle dich aufrecht hin, beuge die Ellbogen im 90-Grad-Winkel. Ziehe deine Schulterblätter hinten kraftvoll zusammen, halte für 3s und lockere wieder.", duration: 60 }
    ]
  },
  en: {
    1: [
      { name: "Neck Release 🧘‍♀️", desc: "Sit up straight. Gently let your head drop toward your right shoulder. Hold for 30s, then switch sides. Breathe deeply.", duration: 60 },
      { name: "Wrist Rolls 👐", desc: "Roll your wrists gently in circles for 30s to the left, then 30s to the right. Perfect for relieving desk fatigue.", duration: 60 },
      { name: "Shoulder Circles 🔄", desc: "Gently shrug your shoulders up to your ears, roll them backward, and let them drop. Repeat in a relaxed rhythm for 1 minute.", duration: 60 },
      { name: "Seated Cat-Cow 🪑", desc: "Place hands on your knees. Inhale as you push your chest forward, exhale as you round your spine fully.", duration: 60 }
    ],
    2: [
      { name: "Standing Chest Opener 👐", desc: "Stand tall. Interlace fingers behind back and gently pull down. Feel chest expansion.", duration: 60 },
      { name: "Gentle Spinal Twists 🌿", desc: "Stand with feet shoulder-width apart, arms loose. Gently rotate torso left to right.", duration: 60 }
    ],
    3: [
      { name: "Kitchen-Counter Squats 🪑", desc: "Lower hips back in controlled motion, then stand back up.", duration: 60 },
      { name: "Calf Raises 🦵", desc: "Push up onto tiptoes, hold balance briefly, lower heels slowly.", duration: 60 },
      { name: "Wall Push-Ups 🧱", desc: "Place hands on wall, lower chest in controlled way and push back.", duration: 60 }
    ]
  }
};

// =========================================================================
// MODAL CONTROLS & NAVIGATION
// =========================================================================
function openSportModal(initialTab = 'presets') {
  const modal = document.getElementById('helper-sport-modal');
  if (modal) {
    modal.classList.remove('hidden');
    switchSportTab(initialTab);
    renderWorkoutPresets();
    renderCustomWorkoutSelector();
    renderExerciseLibrary();
    updateMovementStatsBadge();
    generateSportSuggestion();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function closeSportModal() {
  const modal = document.getElementById('helper-sport-modal');
  if (modal) {
    modal.classList.add('hidden');
    resetSportTimer();
    if (activeRoutineState === 'work' || activeRoutineState === 'rest') {
      pauseWorkoutRoutine();
    }
  }
}

function switchSportTab(tabId) {
  const tabs = ['presets', 'builder', 'library', 'spoons', 'player'];
  tabs.forEach(t => {
    const pane = document.getElementById(`sport-pane-${t}`);
    const btn = document.getElementById(`sport-tab-btn-${t}`);
    if (pane) {
      if (t === tabId) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (btn) {
      if (t === tabId) {
        btn.className = "flex-1 py-1.5 px-2 rounded-xl font-bold text-xs bg-lime-500/20 text-lime-300 border border-lime-400/50 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "flex-1 py-1.5 px-2 rounded-xl font-semibold text-xs text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    }
  });

  const nav = document.getElementById('sport-modal-nav');
  if (nav) {
    if (tabId === 'player') nav.classList.add('hidden');
    else nav.classList.remove('hidden');
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateMovementStatsBadge() {
  const badge = document.getElementById('sport-stats-badge');
  if (!badge) return;
  const stats = getMovementStats();
  badge.innerHTML = `🔥 ${stats.totalMinutes} Min · ${stats.completedWorkouts} Workouts`;
}

// =========================================================================
// PRESETS RENDERING & TRIGGER
// =========================================================================
function renderWorkoutPresets() {
  const container = document.getElementById('sport-presets-grid');
  if (!container) return;

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';

  container.innerHTML = Object.values(WORKOUT_PRESETS).map(preset => {
    const title = preset.title[lang] || preset.title['de'];
    const subtitle = preset.subtitle[lang] || preset.subtitle['de'];
    const count = preset.exerciseIds.length;

    return `
      <div onclick="startSportPreset('${preset.id}')" class="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-lime-500/10 border border-white/10 hover:border-lime-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 group/card hover:scale-[1.015] active:scale-[0.985] shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-300 group-hover/card:scale-110 transition-transform">
              <i data-lucide="${preset.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-white group-hover/card:text-lime-200 transition-colors font-display">${title}</h4>
              <p class="text-[10px] text-gray-400 line-clamp-1">${subtitle}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 text-[10px] font-mono font-bold border border-lime-500/30 shrink-0">${preset.durationMin} Min</span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-gray-400">
          <span class="flex items-center gap-1">
            <i data-lucide="layers" class="w-3 h-3 text-lime-400"></i>
            <span>${count} Übungen · ${preset.workSec}s / ${preset.restSec}s</span>
          </span>
          <button class="px-2.5 py-1 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-bold text-[10px] transition flex items-center gap-1 shadow-sm">
            <i data-lucide="play" class="w-3 h-3 fill-black"></i>
            <span>Start</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function startSportPreset(presetId) {
  const preset = WORKOUT_PRESETS[presetId];
  if (!preset) return;

  const exercises = preset.exerciseIds.map(id => HOME_WORKOUT_LIBRARY.find(ex => ex.id === id)).filter(Boolean);
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const title = preset.title[lang] || preset.title['de'];

  startWorkoutRoutine(exercises, title, preset.workSec, preset.restSec);
}

// =========================================================================
// CUSTOM MODULAR WORKOUT BUILDER
// =========================================================================
function renderCustomWorkoutSelector() {
  const previewBox = document.getElementById('sport-custom-preview-list');
  if (!previewBox) return;

  updateCustomWorkoutPreview();
}

function updateCustomWorkoutPreview() {
  const durationSelect = document.getElementById('sport-builder-duration');
  const zoneSelect = document.getElementById('sport-builder-zone');
  const equipSelect = document.getElementById('sport-builder-equip');
  const quietCheck = document.getElementById('sport-builder-quiet');
  const previewBox = document.getElementById('sport-custom-preview-list');
  if (!previewBox) return;

  const count = parseInt(durationSelect?.value || '8');
  const zone = zoneSelect?.value || 'all';
  const equip = equipSelect?.value || 'all';
  const onlyQuiet = quietCheck ? quietCheck.checked : true;

  let pool = HOME_WORKOUT_LIBRARY.filter(ex => {
    if (onlyQuiet && !ex.quiet) return false;
    if (zone !== 'all' && ex.category !== zone) return false;
    if (equip !== 'all' && ex.equipment !== equip && ex.equipment !== 'none') return false;
    return true;
  });

  if (pool.length === 0) pool = HOME_WORKOUT_LIBRARY;

  // Shuffle & pick
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';

  previewBox.innerHTML = selected.map((ex, i) => {
    const name = ex.name[lang] || ex.name['de'];
    const muscle = ex.muscle[lang] || ex.muscle['de'];
    return `
      <div class="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-5 h-5 rounded-md bg-lime-500/20 text-lime-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">${i + 1}</span>
          <span class="font-semibold text-gray-200 truncate">${name}</span>
        </div>
        <span class="text-[9.5px] font-mono text-gray-400 shrink-0">${muscle}</span>
      </div>
    `;
  }).join('');

  previewBox.dataset.currentSelection = JSON.stringify(selected.map(e => e.id));
}

function startCustomGeneratedWorkout() {
  const previewBox = document.getElementById('sport-custom-preview-list');
  const intervalSelect = document.getElementById('sport-builder-interval');
  if (!previewBox) return;

  try {
    const ids = JSON.parse(previewBox.dataset.currentSelection || '[]');
    const exercises = ids.map(id => HOME_WORKOUT_LIBRARY.find(ex => ex.id === id)).filter(Boolean);
    if (exercises.length === 0) return;

    let workSec = 45;
    let restSec = 15;
    if (intervalSelect?.value === '30_15') { workSec = 30; restSec = 15; }
    else if (intervalSelect?.value === '50_10') { workSec = 50; restSec = 10; }
    else if (intervalSelect?.value === '60_20') { workSec = 60; restSec = 20; }

    const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
    const title = lang === 'de' ? '🧩 Individuelles Wohnungs-Workout' : '🧩 Custom Home Workout';

    startWorkoutRoutine(exercises, title, workSec, restSec);
  } catch (e) {
    console.error('Failed to start custom workout:', e);
  }
}

// =========================================================================
// EXERCISE LIBRARY & LEXIKON
// =========================================================================
function renderExerciseLibrary() {
  const container = document.getElementById('sport-library-list');
  const searchInput = document.getElementById('sport-library-search');
  const catFilter = document.getElementById('sport-library-category-filter');
  if (!container) return;

  const q = (searchInput?.value || '').toLowerCase().trim();
  const cat = catFilter?.value || 'all';
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';

  const filtered = HOME_WORKOUT_LIBRARY.filter(ex => {
    if (cat !== 'all' && ex.category !== cat) return false;
    if (q) {
      const name = (ex.name[lang] || ex.name['de'] || '').toLowerCase();
      const desc = (ex.desc[lang] || ex.desc['de'] || '').toLowerCase();
      const muscle = (ex.muscle[lang] || ex.muscle['de'] || '').toLowerCase();
      if (!name.includes(q) && !desc.includes(q) && !muscle.includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-gray-400 text-xs font-semibold">Keine Übungen für diesen Filter gefunden.</div>`;
    return;
  }

  container.innerHTML = filtered.map(ex => {
    const name = ex.name[lang] || ex.name['de'];
    const desc = ex.desc[lang] || ex.desc['de'];
    const muscle = ex.muscle[lang] || ex.muscle['de'];
    const equipLabel = ex.equipment === 'wall' ? '🧱 Wand' : ex.equipment === 'chair' ? '🪑 Stuhl' : '⚡ Körpergewicht';

    return `
      <div class="p-3 rounded-2xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/10 hover:border-lime-500/40 transition flex items-center justify-between gap-3">
        <div class="space-y-1 min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-xs font-bold text-white font-display">${name}</h4>
            <span class="px-1.5 py-0.2 rounded-md bg-lime-500/15 border border-lime-500/30 text-[9px] font-mono text-lime-300 font-bold">${equipLabel}</span>
            <span class="px-1.5 py-0.2 rounded-md bg-white/5 text-[9px] font-mono text-gray-400">${muscle}</span>
          </div>
          <p class="text-[11px] text-gray-300 leading-relaxed line-clamp-2">${desc}</p>
        </div>
        <button onclick="startSingleExerciseNow('${ex.id}')" class="px-3 py-1.5 rounded-xl bg-lime-500/20 hover:bg-lime-500/30 text-lime-300 border border-lime-400/40 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs" title="Übung sofort starten">
          <i data-lucide="play" class="w-3.5 h-3.5 fill-lime-300"></i>
          <span>Start</span>
        </button>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function startSingleExerciseNow(exerciseId) {
  const ex = HOME_WORKOUT_LIBRARY.find(e => e.id === exerciseId);
  if (!ex) return;
  startWorkoutRoutine([ex], ex.name['de'] || 'Einzelübung', ex.defaultSec || 45, 10);
}

// =========================================================================
// INTERACTIVE WORKOUT ROUTINE PLAYER ENGINE
// =========================================================================
function startWorkoutRoutine(exercises, title, workSec = 45, restSec = 15) {
  if (!exercises || exercises.length === 0) return;

  activeRoutine = {
    title: title,
    exercises: exercises,
    workSec: workSec,
    restSec: restSec
  };
  activeRoutineIndex = 0;
  activeRoutineState = 'work';
  activeRoutineIsPaused = false;
  activeRoutineRemainingSec = workSec;
  activeRoutineTargetEndTime = Date.now() + (workSec * 1000);

  switchSportTab('player');
  updateWorkoutPlayerUI();

  if (typeof playProceduralSound === 'function') {
    playProceduralSound(3);
  }

  showToast(getSportT('workout_started'));

  clearInterval(activeRoutineTimerInterval);
  activeRoutineTimerInterval = setInterval(handleRoutineTick, 1000);
}

function handleRoutineTick() {
  if (activeRoutineIsPaused) return;

  if (activeRoutineTargetEndTime) {
    activeRoutineRemainingSec = Math.max(0, Math.round((activeRoutineTargetEndTime - Date.now()) / 1000));
  } else {
    activeRoutineRemainingSec = Math.max(0, activeRoutineRemainingSec - 1);
  }

  updateWorkoutPlayerUI();

  // Audio cues on 3, 2, 1
  if (activeRoutineRemainingSec > 0 && activeRoutineRemainingSec <= 3) {
    if (typeof playProceduralSound === 'function') playProceduralSound(6);
  }

  if (activeRoutineRemainingSec <= 0) {
    if (activeRoutineState === 'work') {
      if (activeRoutineIndex >= activeRoutine.exercises.length - 1) {
        completeWorkoutRoutine();
      } else {
        activeRoutineState = 'rest';
        activeRoutineRemainingSec = activeRoutine.restSec;
        activeRoutineTargetEndTime = Date.now() + (activeRoutine.restSec * 1000);
        if (typeof playProceduralSound === 'function') playProceduralSound(2);
        updateWorkoutPlayerUI();
      }
    } else if (activeRoutineState === 'rest') {
      activeRoutineIndex++;
      activeRoutineState = 'work';
      activeRoutineRemainingSec = activeRoutine.workSec;
      activeRoutineTargetEndTime = Date.now() + (activeRoutine.workSec * 1000);
      if (typeof playProceduralSound === 'function') playProceduralSound(1);
      updateWorkoutPlayerUI();
    }
  }
}

function updateWorkoutPlayerUI() {
  if (!activeRoutine || !activeRoutine.exercises[activeRoutineIndex]) return;

  const currentEx = activeRoutine.exercises[activeRoutineIndex];
  const nextEx = activeRoutine.exercises[activeRoutineIndex + 1];
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';

  const titleEl = document.getElementById('sport-player-routine-title');
  const stepEl = document.getElementById('sport-player-step-counter');
  const stateBadgeEl = document.getElementById('sport-player-state-badge');
  const timerDisplayEl = document.getElementById('sport-player-timer-display');
  const progressBarEl = document.getElementById('sport-player-progress-bar');
  const exNameEl = document.getElementById('sport-player-ex-name');
  const exDescEl = document.getElementById('sport-player-ex-desc');
  const exMuscleEl = document.getElementById('sport-player-ex-muscle');
  const nextUpBoxEl = document.getElementById('sport-player-next-up-box');
  const playBtn = document.getElementById('sport-player-play-btn');
  const pauseBtn = document.getElementById('sport-player-pause-btn');

  if (titleEl) titleEl.innerText = activeRoutine.title;
  if (stepEl) stepEl.innerText = `${activeRoutineIndex + 1} / ${activeRoutine.exercises.length}`;

  const mins = Math.floor(activeRoutineRemainingSec / 60);
  const secs = activeRoutineRemainingSec % 60;
  if (timerDisplayEl) {
    timerDisplayEl.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const maxSec = activeRoutineState === 'work' ? activeRoutine.workSec : activeRoutine.restSec;
  const pct = Math.max(0, Math.min(100, (activeRoutineRemainingSec / maxSec) * 100));
  if (progressBarEl) progressBarEl.style.width = `${pct}%`;

  if (activeRoutineState === 'work') {
    if (stateBadgeEl) {
      stateBadgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime-500/25 text-lime-300 border border-lime-400/40 animate-pulse";
      stateBadgeEl.innerText = getSportT('ready_set_go');
    }
    if (exNameEl) exNameEl.innerText = currentEx.name[lang] || currentEx.name['de'];
    if (exDescEl) exDescEl.innerText = currentEx.desc[lang] || currentEx.desc['de'];
    if (exMuscleEl) exMuscleEl.innerText = `🎯 Fokus: ${currentEx.muscle[lang] || currentEx.muscle['de']}`;
  } else {
    if (stateBadgeEl) {
      stateBadgeEl.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-400/40";
      stateBadgeEl.innerText = `☕ ${getSportT('rest_title')} (${activeRoutineRemainingSec}s)`;
    }
    if (exNameEl) exNameEl.innerText = `☕ ${getSportT('rest_title')}`;
    if (exDescEl) exDescEl.innerText = "Tief durchatmen, Schultern kreisen und kurz lockern. Gleich geht's weiter!";
    if (exMuscleEl) exMuscleEl.innerText = "🌿 Erholung & Atmung";
  }

  if (nextUpBoxEl) {
    if (nextEx) {
      nextUpBoxEl.classList.remove('hidden');
      const nextTitle = nextEx.name[lang] || nextEx.name['de'];
      nextUpBoxEl.innerHTML = `<span class="text-gray-400 font-normal">${getSportT('next_up')}</span> <span class="text-lime-200 font-bold">${nextTitle}</span>`;
    } else {
      nextUpBoxEl.classList.add('hidden');
    }
  }

  if (playBtn && pauseBtn) {
    if (activeRoutineIsPaused) {
      playBtn.classList.remove('hidden');
      pauseBtn.classList.add('hidden');
    } else {
      playBtn.classList.add('hidden');
      pauseBtn.classList.remove('hidden');
    }
  }
}

function toggleWorkoutAudio(type) {
  if (typeof playAmbientSound !== 'function') return;
  if (activeRoutineAudio === type) {
    if (typeof stopAmbientSound === 'function') stopAmbientSound();
    activeRoutineAudio = 'none';
    showToast('🎵 Workout-Sound stummgeschaltet');
  } else {
    activeRoutineAudio = type;
    playAmbientSound(type === 'beats' ? 'synth' : type === 'lofi' ? 'cafe' : 'stream', true);
    showToast(`🎵 Workout-Sound: ${type}`);
  }
}

function pauseWorkoutRoutine() {
  if (activeRoutineIsPaused) return;
  activeRoutineIsPaused = true;
  clearInterval(activeRoutineTimerInterval);
  activeRoutineTimerInterval = null;
  activeRoutineTargetEndTime = null;
  updateWorkoutPlayerUI();
  showToast(getSportT('workout_paused'));
}

function resumeWorkoutRoutine() {
  if (!activeRoutineIsPaused) return;
  activeRoutineIsPaused = false;
  activeRoutineTargetEndTime = Date.now() + (activeRoutineRemainingSec * 1000);
  clearInterval(activeRoutineTimerInterval);
  activeRoutineTimerInterval = setInterval(handleRoutineTick, 1000);
  updateWorkoutPlayerUI();
  showToast(getSportT('workout_resumed'));
}

function nextWorkoutExercise() {
  if (!activeRoutine) return;
  if (activeRoutineIndex < activeRoutine.exercises.length - 1) {
    activeRoutineIndex++;
    activeRoutineState = 'work';
    activeRoutineRemainingSec = activeRoutine.workSec;
    activeRoutineTargetEndTime = Date.now() + (activeRoutine.workSec * 1000);
    updateWorkoutPlayerUI();
  } else {
    completeWorkoutRoutine();
  }
}

function prevWorkoutExercise() {
  if (!activeRoutine) return;
  if (activeRoutineIndex > 0) {
    activeRoutineIndex--;
    activeRoutineState = 'work';
    activeRoutineRemainingSec = activeRoutine.workSec;
    activeRoutineTargetEndTime = Date.now() + (activeRoutine.workSec * 1000);
    updateWorkoutPlayerUI();
  }
}

function quitWorkoutRoutine() {
  clearInterval(activeRoutineTimerInterval);
  activeRoutineTimerInterval = null;
  activeRoutine = null;
  activeRoutineState = 'idle';
  if (activeRoutineAudio !== 'none' && typeof stopAmbientSound === 'function') {
    stopAmbientSound();
  }
  switchSportTab('presets');
}

function completeWorkoutRoutine() {
  const approxMinutes = activeRoutine ? Math.max(1, Math.round((activeRoutine.exercises.length * (activeRoutine.workSec + activeRoutine.restSec)) / 60)) : 5;
  recordCompletedWorkout(approxMinutes);
  updateMovementStatsBadge();

  clearInterval(activeRoutineTimerInterval);
  activeRoutineTimerInterval = null;
  activeRoutineState = 'completed';

  if (typeof playProceduralSound === 'function') {
    playProceduralSound(0);
  }
  if (typeof triggerConfetti === 'function') {
    triggerConfetti();
  }
  if (typeof showPraise === 'function') {
    showPraise();
  }

  showToast(getSportT('workout_completed'));

  if (typeof state !== 'undefined') {
    state.streak = (state.streak || 0) + 1;
    if (typeof saveState === 'function') saveState();
  }

  quitWorkoutRoutine();
}

// =========================================================================
// SPOON-LEVEL 1-EXERCISE GENERATOR & TIMER
// =========================================================================
function generateSportSuggestion() {
  const energySelect = document.getElementById('sport-energy-select');
  const level = parseInt(energySelect?.value || '2') || 2;
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';

  const list = SPORT_EXERCISES[lang]?.[level] || SPORT_EXERCISES['de'][level];
  const randomExercise = list[Math.floor(Math.random() * list.length)];
  currentSportExercise = randomExercise;

  const box = document.getElementById('sport-suggestion-box');
  if (box && randomExercise) {
    box.innerHTML = `
      <h4 class="text-white font-bold text-sm font-display mb-1">${randomExercise.name}</h4>
      <p class="text-xs text-gray-300 leading-relaxed font-semibold">${randomExercise.desc}</p>
      <div class="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-lime-400 font-bold uppercase tracking-wider">
        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
        <span>${randomExercise.duration}s</span>
      </div>
    `;
  }

  sportTimerSeconds = randomExercise ? randomExercise.duration : 60;
  updateSportTimerDisplay();
  const timerCont = document.getElementById('sport-timer-container');
  if (timerCont) timerCont.classList.remove('hidden');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateSportTimerDisplay() {
  const display = document.getElementById('sport-timer-display');
  const progress = document.getElementById('sport-timer-progress');

  if (display) {
    const mins = Math.floor(sportTimerSeconds / 60);
    const secs = sportTimerSeconds % 60;
    display.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (progress && currentSportExercise) {
    const pct = (sportTimerSeconds / currentSportExercise.duration) * 100;
    progress.style.width = `${pct}%`;
  }
}

function startSportTimer() {
  if (sportTimerRunning) return;
  sportTimerRunning = true;
  sportTimerTargetEndTime = Date.now() + (sportTimerSeconds * 1000);

  const playBtn = document.getElementById('sport-timer-play-btn');
  const pauseBtn = document.getElementById('sport-timer-pause-btn');
  if (playBtn) playBtn.classList.add('hidden');
  if (pauseBtn) pauseBtn.classList.remove('hidden');

  showToast(getSportT('exercise_started'));

  clearInterval(sportTimerInterval);
  sportTimerInterval = setInterval(() => {
    if (sportTimerTargetEndTime) {
      sportTimerSeconds = Math.max(0, Math.round((sportTimerTargetEndTime - Date.now()) / 1000));
    }
    updateSportTimerDisplay();

    if (sportTimerSeconds > 0 && sportTimerSeconds <= 3) {
      if (typeof playProceduralSound === 'function') playProceduralSound(6);
    }

    if (sportTimerSeconds <= 0) {
      clearInterval(sportTimerInterval);
      sportTimerInterval = null;
      sportTimerRunning = false;
      sportTimerTargetEndTime = null;
      completeSportActivity();
    }
  }, 1000);
}

function pauseSportTimer() {
  if (!sportTimerRunning) return;
  clearInterval(sportTimerInterval);
  sportTimerRunning = false;
  sportTimerTargetEndTime = null;

  const playBtn = document.getElementById('sport-timer-play-btn');
  const pauseBtn = document.getElementById('sport-timer-pause-btn');
  if (playBtn) playBtn.classList.remove('hidden');
  if (pauseBtn) pauseBtn.classList.add('hidden');

  showToast(getSportT('exercise_paused'));
}

function skipSportTimer() {
  resetSportTimer();
  showToast(getSportT('exercise_skipped'));
  generateSportSuggestion();
}

function resetSportTimer() {
  if (sportTimerInterval) {
    clearInterval(sportTimerInterval);
    sportTimerInterval = null;
  }
  sportTimerRunning = false;
  sportTimerTargetEndTime = null;

  const playBtn = document.getElementById('sport-timer-play-btn');
  const pauseBtn = document.getElementById('sport-timer-pause-btn');
  if (playBtn) playBtn.classList.remove('hidden');
  if (pauseBtn) pauseBtn.classList.add('hidden');

  if (currentSportExercise) {
    sportTimerSeconds = currentSportExercise.duration;
  }
  updateSportTimerDisplay();
}

function completeSportActivity() {
  recordCompletedWorkout(1);
  resetSportTimer();

  if (typeof playProceduralSound === 'function') {
    playProceduralSound(0);
  }
  if (typeof triggerConfetti === 'function') {
    triggerConfetti();
  }
  if (typeof showPraise === 'function') {
    showPraise();
  }

  showToast(getSportT('exercise_completed'));

  if (typeof state !== 'undefined') {
    state.streak = (state.streak || 0) + 1;
    if (typeof saveState === 'function') saveState();
  }

  closeSportModal();
}

// Global exposure
if (typeof window !== 'undefined') {
  window.openSportModal = openSportModal;
  window.openBewegungModal = openSportModal;
  window.openFitnessModal = openSportModal;
  window.closeSportModal = closeSportModal;
  window.switchSportTab = switchSportTab;
  window.startSportPreset = startSportPreset;
  window.updateCustomWorkoutPreview = updateCustomWorkoutPreview;
  window.startCustomGeneratedWorkout = startCustomGeneratedWorkout;
  window.renderExerciseLibrary = renderExerciseLibrary;
  window.startSingleExerciseNow = startSingleExerciseNow;
  window.toggleWorkoutAudio = toggleWorkoutAudio;
  window.startWorkoutRoutine = startWorkoutRoutine;
  window.pauseWorkoutRoutine = pauseWorkoutRoutine;
  window.resumeWorkoutRoutine = resumeWorkoutRoutine;
  window.nextWorkoutExercise = nextWorkoutExercise;
  window.prevWorkoutExercise = prevWorkoutExercise;
  window.quitWorkoutRoutine = quitWorkoutRoutine;
  window.generateSportSuggestion = generateSportSuggestion;
  window.startSportTimer = startSportTimer;
  window.pauseSportTimer = pauseSportTimer;
  window.skipSportTimer = skipSportTimer;
  window.resetSportTimer = resetSportTimer;
  window.completeSportActivity = completeSportActivity;
}

if (typeof globalThis !== 'undefined') {
  globalThis.openSportModal = openSportModal;
  globalThis.openBewegungModal = openSportModal;
  globalThis.closeSportModal = closeSportModal;
  globalThis.switchSportTab = switchSportTab;
  globalThis.startSportPreset = startSportPreset;
  globalThis.updateCustomWorkoutPreview = updateCustomWorkoutPreview;
  globalThis.startCustomGeneratedWorkout = startCustomGeneratedWorkout;
  globalThis.renderExerciseLibrary = renderExerciseLibrary;
  globalThis.startSingleExerciseNow = startSingleExerciseNow;
  globalThis.toggleWorkoutAudio = toggleWorkoutAudio;
  globalThis.startWorkoutRoutine = startWorkoutRoutine;
  globalThis.pauseWorkoutRoutine = pauseWorkoutRoutine;
  globalThis.resumeWorkoutRoutine = resumeWorkoutRoutine;
  globalThis.nextWorkoutExercise = nextWorkoutExercise;
  globalThis.prevWorkoutExercise = prevWorkoutExercise;
  globalThis.quitWorkoutRoutine = quitWorkoutRoutine;
  globalThis.generateSportSuggestion = generateSportSuggestion;
  globalThis.startSportTimer = startSportTimer;
  globalThis.pauseSportTimer = pauseSportTimer;
  globalThis.skipSportTimer = skipSportTimer;
  globalThis.resetSportTimer = resetSportTimer;
  globalThis.completeSportActivity = completeSportActivity;
}
