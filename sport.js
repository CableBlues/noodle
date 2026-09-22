
// =========================================================================
// SENSITIVE MOVEMENT & GENTLE ACTIVATION MODULE ("Sport")
// =========================================================================

let currentSportExercise = null;
let sportTimerInterval = null;
let sportTimerSeconds = 60;
let sportTimerRunning = false;

// Lokale Übersetzungen für sportbezogene Systemmeldungen
const SPORT_TRANSLATIONS = {
  de: {
    no_exercise: "Keine Übung aktiv.",
    exercise_started: "Übungs-Timer gestartet! ⏱️",
    exercise_paused: "Übungs-Timer pausiert. ⏸️",
    exercise_skipped: "Übung übersprungen.",
    exercise_completed: "Wunderbar bewegt! 🎉 Dein Kreislauf dankt es dir.",
    energy_label: "Benötigtes Level: Löffel",
    next_suggestion: "Anderer Vorschlag 🔄"
  },
  en: {
    no_exercise: "No exercise active.",
    exercise_started: "Exercise timer started! ⏱️",
    exercise_paused: "Exercise timer paused. ⏸️",
    exercise_skipped: "Exercise skipped.",
    exercise_completed: "Wonderfully moved! 🎉 Your body appreciates it.",
    energy_label: "Required level: Spoons",
    next_suggestion: "Another Suggestion 🔄"
  },
  es: {
    no_exercise: "Ningún ejercicio activo.",
    exercise_started: "¡Temporizador de ejercicio iniciado! ⏱️",
    exercise_paused: "Temporizador de ejercicio pausado. ⏸️",
    exercise_skipped: "Ejercicio omitido.",
    exercise_completed: "¡Maravilloso movimiento! 🎉 Tu cuerpo te lo agradece.",
    energy_label: "Nivel requerido: Cucharas",
    next_suggestion: "Siguiente sugerencia 🔄"
  },
  el: {
    no_exercise: "Δεν υπάρχει ενεργή άσκηση.",
    exercise_started: "Το χρονόμετρο άσκησης ξεκίνησε! ⏱️",
    exercise_paused: "Το χρονόμετρο άσκησης σταμάτησε. ⏸️",
    exercise_skipped: "Η άσκηση παραλείφθηκε.",
    exercise_completed: "Υπέροχη κίνηση! 🎉 Το σώμα σου σε ευχαριστεί.",
    energy_label: "Απαιτούμενο επίπεδο: Κουτάλια",
    next_suggestion: "Επόμενη πρόταση 🔄"
  },
  fr: {
    no_exercise: "Aucun exercice actif.",
    exercise_started: "Minuteur d'exercice démarré ! ⏱️",
    exercise_paused: "Minuteur d'exercice en pause. ⏸️",
    exercise_skipped: "Exercice passé.",
    exercise_completed: "Merveilleusement bougé ! 🎉 Ton corps te remercie.",
    energy_label: "Niveau requis : Cuillères",
    next_suggestion: "Autre suggestion 🔄"
  },
  it: {
    no_exercise: "Nessun esercizio attivo.",
    exercise_started: "Timer dell'esercizio avviato! ⏱️",
    exercise_paused: "Timer dell'esercizio in pausa. ⏸️",
    exercise_skipped: "Esercizio saltato.",
    exercise_completed: "Ti sei mosso magnificamente! 🎉 Il tuo corpo ti ringrazia.",
    energy_label: "Livello richiesto: Cucchiai",
    next_suggestion: "Altro suggerimento 🔄"
  }
};

// Die erweiterte Übungsdatenbank – nun 8 maßgeschneiderte Übungen für jeden Energiezustand
const SPORT_EXERCISES = {
  el: {
    1: [
      { name: 'Ανακούφιση Αυχένα 🧘‍♀️', desc: 'Κάθισε με ίσια πλάτη. Άφησε απαλά το κεφάλι να γείρει προς τον δεξιό ώμο. Κράτησε για 30δ και άλλαξε πλευρά. Πάρε βαθιές ανάσες.', duration: 60 },
      { name: 'Κύκλοι Καρπών 👐', desc: 'Κάνε απαλούς κύκλους με τους καρπούς για 30δ προς τα αριστερά και 30δ προς τα δεξιά. Ιδανικό για ξεκούραση από το πληκτρολόγιο.', duration: 60 },
      { name: 'Κυκλικές Κινήσεις Ώμων 🔄', desc: 'Σήκωσε απαλά τους ώμους προς τα αυτιά, κύλησέ τους προς τα πίσω και άφησέ τους να πέσουν. Επανάλαβε ήρεμα για 1 λεπτό.', duration: 60 },
      { name: 'Γάτα-Αγελάδα σε Καρέκλα 🪑', desc: 'Βάλε τα χέρια στα γόνατα. Με την εισπνοή σπρώξε το στήθος μπροστά, με την εκπνοή καμπούριασε απαλά την πλάτη σου.', duration: 60 },
      { name: 'Χαλάρωση Ματιών (Palming) 👀', desc: 'Τρίψε τις παλάμες σου μέχρι να ζεσταθούν. Τοποθέτησέ τες απαλά πάνω από τα κλειστά σου μάτια. Πάρε 5 βαθιές ανάσες.', duration: 60 },
      { name: 'Απαλοί Κύκλοι Αστραγάλων 🦶', desc: 'Σήκωσε ελαφρώς το ένα πόδι καθιστός. Κάνε κύκλους για 30δ αριστερά και 30δ δεξιά. Άλλαξε πόδι.', duration: 60 },
      { name: 'Διάταση Στήθους (Καθιστή) 🫁', desc: 'Πλέξε τα δάχτυλα πίσω από το κεφάλι, άνοιξε καλά τους αγκώνες και ανάπνευσε ήρεμα ανοίγοντας τον θώρακα.', duration: 60 },
      { name: 'Συντονισμός Δαχτύλων (Brain Gym) 🧠', desc: 'Άγγιξε με τον αντίχειρα κάθε δάχτυλο του ίδιου χεριού διαδοχικά και μετά αντίστροφα. Ενισχύει απαλά τη συγκέντρωση.', duration: 60 }
    ],
    2: [
      { name: 'Άνοιγμα Στήθους Όρθιος 👐', desc: 'Στάσου όρθιος. Πλέξε τα χέρια πίσω από την πλάτη και τράβηξε απαλά προς τα κάτω. Νιώσε το άνοιγμα στο στήθος και τους ώμους.', duration: 60 },
      { name: 'Ήπιες Στροφές Σπονδυλικής Στήλης 🌿', desc: 'Στάσου με τα πόδια στο άνοιγμα των ώμων, χέρια χαλαρά. Στρίψε απαλά τον κορμό δεξιά-αριστερά αφήνοντας τα χέρια να ακολουθούν.', duration: 60 },
      { name: 'Άγγιγμα των Αστεριών 🌌', desc: 'Τέντωσε εναλλάξ το αριστερό και το δεξί χέρι όσο πιο ψηλά μπορείς, σαν να μαζεύεις αστέρια από τον ουρανό. Ανάπνεε ρυθμικά.', duration: 60 },
      { name: 'Κύκλοι Λεκάνης 🌀', desc: 'Στάσου με τα χέρια στη μέση. Σχεδίασε αργούς, κυκλικούς κύκλους με τη λεκάνη. Άλλαξε φορά στα 30 δευτερόλεπτα.', duration: 60 },
      { name: 'Πλάγια Διάταση Αυχένα 📐', desc: 'Γείρε το κεφάλι προς τον αριστερό ώμο. Σπρώξε την δεξιά παλάμη προς το πάτωμα για να τεντώσει το χέρι. Άλλαξε στα 30δ.', duration: 60 },
      { name: 'Πλάγια Κάμψη Κορμού 🏹', desc: 'Σήκωσε το ένα χέρι ψηλά και γείρε απαλά τον κορμό προς την αντίθετη πλευρά. Κράτησε για 30δ και άλλαξε χέρι.', duration: 60 },
      { name: 'Διάταση Άνω Πλάτης 🛡️', desc: 'Πλέξε τα χέρια μπροστά στο στήθος, καμπούριασε την άνω πλάτη και σπρώξε τις παλάμες μπροστά. Ανάπνευσε βαθιά.', duration: 60 },
      { name: 'Χέρια Αετού 🦅', desc: 'Σταύρωσε τα χέρια μπροστά σου, πλέξε τους πήχεις και σπρώξε απαλά τους αγκώνες προς τα πάνω. Εξαιρετική ανακούφιση για την πλάτη.', duration: 60 }
    ],
    3: [
      { name: 'Καθίσματα στον Πάγκο 🪑', desc: 'Κρατήσου αν θέλεις από μια καρέκλα ή πάγκο. Χαμήλωσε τη λεκάνη προς τα πίσω ελεγχόμενα και σήκω ξανά.', duration: 60 },
      { name: 'Ανυψώσεις στις Γάμπες 🦵', desc: 'Στάσου όρθιος. Σήκω αργά στις μύτες των ποδιών, κράτησε για μια στιγμή ισορροπία και κατέβα αργά. Επανάλαβε με σταθερό ρυθμό.', duration: 60 },
      { name: 'Κάμψεις στον Τοίχο 🧱', desc: 'Στάσου ένα βήμα μακριά από τον τοίχο. Ακούμπησε τις παλάμες, λύγισε τους αγκώνες φέρνοντας το στήθος κοντά στον τοίχο και σπρώξε πίσω.', duration: 60 },
      { name: 'Ήπιο Jumping Jack (Χαμηλής Έντασης) 🤸‍♂️', desc: 'Κάνε ένα βήμα στο πλάι σηκώνοντας το αντίστοιχο χέρι. Άλλαζε πλευρές ρυθμικά χωρίς άλματα. Πολύ φιλικό για τις αρθρώσεις.', duration: 60 },
      { name: 'Σκιαμαχία (Shadow Boxing) 🥊', desc: 'Στάσου σε σταθερή στάση. Ρίξε απαλές, ρυθμικές γροθιές στον αέρα εναλλάξ με αριστερό και δεξί. Εκτονώνει την ένταση στους ώμους.', duration: 60 },
      { name: 'Άγγιγμα Γόνατο με Αγκώνα 🧬', desc: 'Όρθιος, φέρε το αριστερό γόνατο στον δεξιό αγκώνα και μετά το δεξί γόνατο στον αριστερό αγκώνα. Ενεργοποιεί τους κοιλιακούς μυς.', duration: 60 },
      { name: 'Πολεμιστής 3 με Υποστήριξη ⚖️', desc: 'Κρατήσου από μια καρέκλα για ισορροπία. Σήκωσε το ένα πόδι τεντωμένο πίσω και γείρε ελαφρώς μπροστά. Κράτησε για 30δ, μετά άλλαξε.', duration: 60 },
      { name: 'Σύσφιξη Ωμοπλατών 🏋️', desc: 'Στάσου με ίσια πλάτη, αγκώνες λυγισμένοι στις 90 μοίρες. Τράβηξε δυνατά τις ωμοπλάτες προς τα πίσω, κράτησε για 3δ και χαλάρωσε.', duration: 60 }
    ]
  },

  de: {
    1: [
      { name: "Nacken-Entlastung 🧘‍♀️", desc: "Setze dich aufrecht hin. Lasse den Kopf langsam zur rechten Schulter sinken. Halte für 30s, dann wechsle die Seite. Atme tief ein.", duration: 60 },
      { name: "Handgelenk-Lockerung 👐", desc: "Kreise deine Handgelenke ganz sanft 30s nach links, dann 30s nach rechts. Perfekt, um Schreibtischanspannung zu lösen.", duration: 60 },
      { name: "Schulter-Kreisen 🔄", desc: "Zieh deine Schultern sanft nach oben zu den Ohren, kreise sie nach hinten und lasse sie sinken. Wiederhole das entspannt für 1 Minute.", duration: 60 },
      { name: "Katze-Kuh im Sitzen 🪑", desc: "Lege die Hände auf deine Knie. Beim Einatmen schiebst du die Brust sanft nach vorne (leichtes Hohlkreuz), beim Ausatmen machst du den Rücken ganz rund.", duration: 60 },
      { name: "Augen-Entspannung (Palming) 👀", desc: "Reibe deine Handflächen kräftig aneinander, bis sie warm sind. Lege sie sanft schalenförmig über deine geschlossenen Augen. Atme 5-mal tief durch.", duration: 60 },
      { name: "Sanftes Fußkreisen 🦶", desc: "Hebe im Sitzen einen Fuß leicht an und kreise ihn entspannt 30s nach links, dann 30s nach rechts. Danach die Seite wechseln.", duration: 60 },
      { name: "Brustkorb-Dehnung (Sitzend) 🫁", desc: "Verschränke die Finger hinter dem Kopf, ziehe die Ellbogen weit nach außen und öffne deinen Brustkorb sanft nach oben. Atme ruhig.", duration: 60 },
      { name: "Finger-Koordination (Gehirnhälften-Tanz) 🧠", desc: "Bilde mit Daumen und Zeigefinger nacheinander Ringe mit allen Fingern der Hand. Geh vor und wieder zurück. Fördert sanft die Konzentration.", duration: 60 }
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
      { name: "Seated Cat-Cow 🪑", desc: "Place hands on your knees. Inhale as you push your chest forward (gentle backbend), exhale as you round your spine fully.", duration: 60 },
      { name: "Eye Relaxation (Palming) 👀", desc: "Rub your palms together until they feel warm. Place them gently over your closed eyes. Breathe deeply 5 times.", duration: 60 },
      { name: "Gentle Ankle Circles 🦶", desc: "Slightly lift one foot while seated. Rotate your ankle for 30s to the left, then 30s to the right. Swap feet.", duration: 60 },
      { name: "Chest Stretch (Seated) 🫁", desc: "Interlace your fingers behind your head, draw your elbows wide apart, and gently open your chest upward. Breathe calmly.", duration: 60 },
      { name: "Brain-Gym Finger Coordination 🧠", desc: "Touch your thumb to each finger on the same hand, one after the other, then reverse the sequence. Boosts concentration gently.", duration: 60 }
    ],
    2: [
      { name: "Standing Chest Opener 👐", desc: "Stand tall. Interlace your fingers behind your back and gently pull them downward. Feel the stretch in your chest and shoulders.", duration: 60 },
      { name: "Gentle Spinal Twists 🌿", desc: "Stand with your feet shoulder-width apart, arms hanging loose. Gently rotate your torso left to right, letting your arms swing freely.", duration: 60 },
      { name: "Reach for the Stars 🌌", desc: "Alternate reaching up with your left and right arms as high as possible, as if picking stars from the sky. Breathe evenly.", duration: 60 },
      { name: "Hip Circles 🌀", desc: "Stand with hands on hips. Draw slow, gentle circles with your pelvis. Reverse the direction after 30 seconds.", duration: 60 },
      { name: "Neck Lateral Stretch 📐", desc: "Tilt your head toward your left shoulder. Push your right palm actively toward the floor to stretch the arm-nerve bundle. Switch after 30s.", duration: 60 },
      { name: "Side Bend 🏹", desc: "Reach one arm straight up and lean your torso gently to the opposite side. Hold for 30s, then swap arms.", duration: 60 },
      { name: "Upper Back Stretch 🛡️", desc: "Interlace your fingers in front of your chest, round your upper back, and push your palms away from you. Hold and breathe deeply.", duration: 60 },
      { name: "Eagle Arms 🦅", desc: "Cross your arms in front, wrap your forearms around each other, and gently push your elbows upward. Marvelous upper back release.", duration: 60 }
    ],
    3: [
      { name: "Kitchen-Counter Squats 🪑", desc: "Optionally hold onto a chair or counter for balance. Lower your hips back and down in a controlled motion, then stand back up.", duration: 60 },
      { name: "Calf Raises 🦵", desc: "Stand tall. Slowly push up onto your tiptoes, hold the balance briefly, and slowly lower your heels. Repeat in a steady rhythm.", duration: 60 },
      { name: "Wall Push-Ups 🧱", desc: "Stand an arm's length from a wall. Place hands flat, slowly lower your chest toward the wall, and gently push yourself back.", duration: 60 },
      { name: "Lazy Jack (Low Impact) 🤸‍♂️", desc: "Step out to the side while raising the arm on the same side. Change sides rhythmically without jumping. Very gentle on the joints.", duration: 60 },
      { name: "Shadow Boxing 🥊", desc: "Stand in a stable stance. Punch the air gently and rhythmically, alternating left and right. Releases tension in the shoulders.", duration: 60 },
      { name: "Knee-to-Elbow Tap 🧬", desc: "While standing, touch your left knee to your right elbow, then your right knee to your left elbow. Activates your core muscles.", duration: 60 },
      { name: "Supported Warrior 3 ⚖️", desc: "Hold onto a chair for support. Lift one leg straight back and lean your upper body slightly forward. Hold for 30s, then swap sides.", duration: 60 },
      { name: "Shoulder Blade Squeeze 🏋️", desc: "Stand tall, elbows bent at a 90-degree angle. Pull your shoulder blades firmly together behind you, hold for 3s, then release.", duration: 60 }
    ]
  },
  es: {
    1: [
      { name: "Alivio del Cuello 🧘‍♀️", desc: "Siéntate derecho. Deja caer suavemente la cabeza hacia el hombro derecho. Sostén por 30s, luego cambia de lado. Respira profundo.", duration: 60 },
      { name: "Rotación de Muñecas 👐", desc: "Gira tus muñecas suavemente en círculos durante 30s a la izquierda, luego 30s a la derecha. Perfecto para aliviar la fatiga de escritorio.", duration: 60 },
      { name: "Círculos de Hombros 🔄", desc: "Sube suavemente los hombros hacia las orejas, muévelos hacia atrás y déjalos caer. Repite de forma relaxed durante 1 minuto.", duration: 60 },
      { name: "Gato-Vaca Sentado 🪑", desc: "Coloca tus manos en las rodillas. Inhala empujando el pecho hacia delante, exhala redondeando completamente la espalda.", duration: 60 },
      { name: "Palmeo Ocular 👀", desc: "Frota tus manos vigorosamente hasta sentir calor. Colócalas suavemente sobre tus ojos cerrados. Respira hondo 5 veces.", duration: 60 },
      { name: "Giros de Tobillo Suaves 🦶", desc: "Levanta un pie ligeramente mientras estás sentado. Gíralo durante 30s a la izquierda, luego 30s a la derecha. Cambia de pie.", duration: 60 },
      { name: "Apertura de Pecho Sentado 🫁", desc: "Cruza tus dedos detrás de la cabeza, abre bien los codos y estira el pecho suavemente hacia arriba. Respira con calma.", duration: 60 },
      { name: "Coordinación de Dedos (Brain Gym) 🧠", desc: "Toca el pulgar con cada uno de los dedos de la misma mano consecutivamente y al revés. Estimula suavemente la concentración.", duration: 60 }
    ],
    2: [
      { name: "Apertura de Pecho de Pie 👐", desc: "Párate derecho. Cruza tus dedos detrás de la espalda y tira suavemente hacia abajo. Siente el estiramiento en pecho y hombros.", duration: 60 },
      { name: "Giro de Columna Suave 🌿", desc: "Párate con los pies separados, los brazos sueltos. Gira suavemente tu torso de izquierda a derecha de forma relajada.", duration: 60 },
      { name: "Estiramiento al Cielo 🌌", desc: "Estira alternadamente los brazos izquierdo und derecho hacia arriba lo más alto posible, como si quisieras alcanzar las estrellas.", duration: 60 },
      { name: "Círculos de Cadera 🌀", desc: "Coloca las manos en las caderas. Dibuja círculos lentos y suaves con la pelvis. Cambia de dirección a los 30 segundos.", duration: 60 },
      { name: "Estiramiento Lateral del Cuello 📐", desc: "Inclina la cabeza hacia tu hombro izquierdo. Empuja activamente la palma derecha hacia el suelo para estirar los nervios del brazo. Cambia tras 30s.", duration: 60 },
      { name: "Flexión Lateral 🏹", desc: "Sube un brazo estirado e inclina el torso suavemente hacia el lado opuesto. Sostén por 30s, luego cambia de brazo.", duration: 60 },
      { name: "Estiramiento de la Espalda Alta 🛡️", desc: "Entrelaza los dedos frente al peco, redondea la espalda alta y empuja las palmas hacia delante. Sostén y respira hondo.", duration: 60 },
      { name: "Brazos de Águila 🦅", desc: "Cruza los brazos por delante, entrelaza los antebrazos y empuja suavemente los codos hacia arriba. Un estiramiento magnífico de la espalda alta.", duration: 60 }
    ],
    3: [
      { name: "Sentadillas de Cocina 🪑", desc: "Apóyate en el respaldo de una silla si lo necesitas. Baja la cadera de forma controlada hacia atrás y vuelve a subir.", duration: 60 },
      { name: "Elevación de Talones 🦵", desc: "Ponte de pie. Sube despacio sobre las puntas de los pies, mantén el equilibrio y baja lentamente. Repite de forma constante.", duration: 60 },
      { name: "Flexiones en la Pared 🧱", desc: "Apoya las manos planas en la pared a la distancia de tus brazos. Baja el pecho hacia la pared de forma controlada y empuja hacia atrás.", duration: 60 },
      { name: "Jack de Bajo Impacto 🤸‍♂️", desc: "Da un paso lateral mientras subes el brazo del mismo lado. Cambia rítmicamente de lado sin saltar. Muy suave para las articulaciones.", duration: 60 },
      { name: "Sombra de Boxeo 🥊", desc: "Párate en una postura estable. Lanza puñetazos suaves y rítmicos al aire, alternando izquierda y derecha. Alivia tensiones.", duration: 60 },
      { name: "Toque de Rodilla a Codo 🧬", desc: "Estando de pie, toca tu rodilla izquierda con el codo derecho, y luego tu rodilla derecha con el codo izquierdo. Activa tus abdominales.", duration: 60 },
      { name: "Guerrero 3 Sostenido ⚖️", desc: "Apóyate en una silla para mantener el equilibrio. Eleva una pierna estirada hacia atrás e inclina el torso adelante. Sostén 30s, luego cambia.", duration: 60 },
      { name: "Apretón de Omóplatos 🏋️", desc: "Párate derecho, codos doblados en ángulo de 90 grados. Junta con fuerza los omóplatos por detrás, sostén 3s y relaja.", duration: 60 }
    ]
  },
  fr: {
    1: [
      { name: 'Relâchement de la nuque 🧘‍♀️', desc: 'Assieds-toi bien droit. Laisse doucement ta tête tomber vers l\'épaule droite. Maintiens 30s, puis change de côté. Respire profondément.', duration: 60 },
      { name: 'Rotation des poignets 👐', desc: 'Fais tourner doucement tes poignets en cercles pendant 30s vers la gauche, puis 30s vers la droite. Parfait contre la fatigue du bureau.', duration: 60 },
      { name: 'Cercles d\'épaules 🔄', desc: 'Monte doucement tes épaules vers les oreilles, fais-les tourner vers l\'arrière et laisse-les redescendre. Répète calmement pendant 1 minute.', duration: 60 },
      { name: 'Chat-vache assis 🪑', desc: 'Pose les mains sur tes genoux. Inspire en poussant la poitrine vers l\'avant, expire en arrondissant complètement le dos.', duration: 60 },
      { name: 'Relaxation des yeux (Palming) 👀', desc: 'Frotte tes paumes l\'une contre l\'autre jusqu\'à ce qu\'elles chauffent. Pose-les doucement sur tes yeux fermés. Respire profondément 5 fois.', duration: 60 },
      { name: 'Cercles de chevilles en douceur 🦶', desc: 'Lève légèrement un pied en position assise. Fais-le tourner 30s vers la gauche, puis 30s vers la droite. Change de pied.', duration: 60 },
      { name: 'Étirement de la poitrine (assis) 🫁', desc: 'Entrelace tes doigts derrière la tête, écarte bien les coudes et ouvre doucement ta poitrine vers le haut. Respire calmement.', duration: 60 },
      { name: 'Coordination des doigts (Brain Gym) 🧠', desc: 'Touche ton pouce à chaque doigt de la même main, l\'un après l\'autre, puis dans l\'ordre inverse. Stimule doucement la concentration.', duration: 60 }
    ],
    2: [
      { name: 'Ouverture de poitrine debout 👐', desc: 'Tiens-toi bien droit. Entrelace tes doigts derrière le dos et tire doucement vers le bas. Sens l\'étirement dans la poitrine et les épaules.', duration: 60 },
      { name: 'Torsions douces de la colonne 🌿', desc: 'Tiens-toi debout, pieds écartés, bras relâchés. Fais tourner doucement ton buste de gauche à droite, en laissant les bras suivre librement.', duration: 60 },
      { name: 'Attraper les étoiles 🌌', desc: 'Étire alternativement le bras gauche et le bras droit vers le haut, comme pour attraper des étoiles. Respire régulièrement.', duration: 60 },
      { name: 'Cercles de hanches 🌀', desc: 'Tiens-toi debout, mains sur les hanches. Trace des cercles lents et doux avec ton bassin. Change de sens après 30 secondes.', duration: 60 },
      { name: 'Étirement latéral du cou 📐', desc: 'Penche la tête vers l\'épaule gauche. Pousse activement la paume droite vers le sol pour étirer le bras. Change après 30s.', duration: 60 },
      { name: 'Flexion latérale 🏹', desc: 'Étire un bras tout droit vers le haut et penche doucement le buste du côté opposé. Maintiens 30s, puis change de bras.', duration: 60 },
      { name: 'Étirement du haut du dos 🛡️', desc: 'Entrelace tes doigts devant la poitrine, arrondis le haut du dos et pousse les paumes vers l\'avant. Maintiens et respire profondément.', duration: 60 },
      { name: 'Bras d\'aigle 🦅', desc: 'Croise les bras devant toi, entrelace les avant-bras et pousse doucement les coudes vers le haut. Un merveilleux relâchement du haut du dos.', duration: 60 }
    ],
    3: [
      { name: 'Squats au plan de travail 🪑', desc: 'Tiens-toi éventuellement à une chaise ou un plan de travail. Abaisse tes hanches vers l\'arrière de façon contrôlée, puis relève-toi.', duration: 60 },
      { name: 'Montées sur pointes 🦵', desc: 'Tiens-toi bien droit. Monte lentement sur la pointe des pieds, garde l\'équilibre un instant, puis redescends lentement. Répète régulièrement.', duration: 60 },
      { name: 'Pompes contre le mur 🧱', desc: 'Place-toi à un pas d\'un mur. Pose les mains à plat, abaisse ta poitrine vers le mur de façon contrôlée, puis repousse-toi doucement.', duration: 60 },
      { name: 'Jumping Jack tranquille (faible impact) 🤸‍♂️', desc: 'Fais un pas de côté en levant le bras du même côté. Alterne les côtés rythmiquement sans sauter. Très doux pour les articulations.', duration: 60 },
      { name: 'Boxe dans le vide 🥊', desc: 'Tiens-toi dans une position stable. Frappe l\'air doucement et rythmiquement, en alternant gauche et droite. Relâche les tensions des épaules.', duration: 60 },
      { name: 'Genou-coude croisé 🧬', desc: 'Debout, touche ton genou gauche avec ton coude droit, puis ton genou droit avec ton coude gauche. Active tes muscles abdominaux.', duration: 60 },
      { name: 'Guerrier 3 avec appui ⚖️', desc: 'Tiens-toi à une chaise pour t\'équilibrer. Lève une jambe tendue vers l\'arrière et penche légèrement le buste vers l\'avant. Maintiens 30s, change de côté.', duration: 60 },
      { name: 'Rapprochement des omoplates 🏋️', desc: 'Tiens-toi bien droit, coudes pliés à 90 degrés. Rapproche fermement tes omoplates derrière toi, maintiens 3s, puis relâche.', duration: 60 }
    ]
  },
  it: {
    1: [
      { name: 'Rilascio del collo 🧘‍♀️', desc: 'Siediti dritto. Lascia cadere delicatamente la testa verso la spalla destra. Mantieni per 30s, poi cambia lato. Respira profondamente.', duration: 60 },
      { name: 'Rotazione dei polsi 👐', desc: 'Fai ruotare delicatamente i polsi in cerchio per 30s verso sinistra, poi 30s verso destra. Perfetto contro la stanchezza da scrivania.', duration: 60 },
      { name: 'Cerchi con le spalle 🔄', desc: 'Solleva delicatamente le spalle verso le orecchie, falle ruotare all\'indietro e lasciale scendere. Ripeti con calma per 1 minuto.', duration: 60 },
      { name: 'Gatto-mucca da seduti 🪑', desc: 'Appoggia le mani sulle ginocchia. Inspira spingendo il petto in avanti, espira arrotondando completamente la schiena.', duration: 60 },
      { name: 'Rilassamento degli occhi (Palming) 👀', desc: 'Strofina le palme una contro l\'altra finché non si scaldano. Posale delicatamente sugli occhi chiusi. Respira profondamente 5 volte.', duration: 60 },
      { name: 'Cerchi delicati con le caviglie 🦶', desc: 'Solleva leggermente un piede da seduto. Fallo ruotare per 30s verso sinistra, poi 30s verso destra. Cambia piede.', duration: 60 },
      { name: 'Allungamento del petto (da seduti) 🫁', desc: 'Intreccia le dita dietro la testa, apri bene i gomiti e apri delicatamente il petto verso l\'alto. Respira con calma.', duration: 60 },
      { name: 'Coordinazione delle dita (Brain Gym) 🧠', desc: 'Tocca il pollice con ogni dito della stessa mano, uno dopo l\'altro, poi al contrario. Stimola delicatamente la concentrazione.', duration: 60 }
    ],
    2: [
      { name: 'Apertura del petto in piedi 👐', desc: 'Stai dritto in piedi. Intreccia le dita dietro la schiena e tira delicatamente verso il basso. Senti l\'allungamento nel petto e nelle spalle.', duration: 60 },
      { name: 'Torsioni delicate della colonna 🌿', desc: 'Stai in piedi con i piedi larghi e le braccia rilassate. Ruota delicatamente il busto da sinistra a destra, lasciando le braccia libere di seguire.', duration: 60 },
      { name: 'Afferra le stelle 🌌', desc: 'Allunga alternativamente il braccio sinistro e destro verso l\'alto, come per afferrare le stelle. Respira in modo regolare.', duration: 60 },
      { name: 'Cerchi con i fianchi 🌀', desc: 'Stai in piedi con le mani sui fianchi. Disegna cerchi lenti e delicati con il bacino. Cambia direzione dopo 30 secondi.', duration: 60 },
      { name: 'Allungamento laterale del collo 📐', desc: 'Inclina la testa verso la spalla sinistra. Spingi attivamente il palmo destro verso il pavimento per allungare il braccio. Cambia dopo 30s.', duration: 60 },
      { name: 'Flessione laterale 🏹', desc: 'Allunga un braccio dritto verso l\'alto e inclina delicatamente il busto verso il lato opposto. Mantieni 30s, poi cambia braccio.', duration: 60 },
      { name: 'Allungamento della parte alta della schiena 🛡️', desc: 'Intreccia le dita davanti al petto, arrotonda la parte alta della schiena e spingi i palmi in avanti. Mantieni e respira profondamente.', duration: 60 },
      { name: 'Braccia d\'aquila 🦅', desc: 'Incrocia le braccia davanti a te, intreccia gli avambracci e spingi delicatamente i gomiti verso l\'alto. Un meraviglioso rilascio della parte alta della schiena.', duration: 60 }
    ],
    3: [
      { name: 'Squat al bancone della cucina 🪑', desc: 'Se vuoi, tieniti a una sedia o al bancone. Abbassa i fianchi all\'indietro in modo controllato, poi rialzati.', duration: 60 },
      { name: 'Sollevamento sui polpacci 🦵', desc: 'Stai dritto in piedi. Sali lentamente sulle punte dei piedi, mantieni l\'equilibrio un istante, poi riabbassa lentamente. Ripeti con costanza.', duration: 60 },
      { name: 'Flessioni contro il muro 🧱', desc: 'Mettiti a un passo dal muro. Appoggia le mani piatte, abbassa il petto verso il muro in modo controllato, poi spingiti delicatamente indietro.', duration: 60 },
      { name: 'Jumping jack tranquillo (basso impatto) 🤸‍♂️', desc: 'Fai un passo lateralmente sollevando il braccio dello stesso lato. Alterna i lati ritmicamente senza saltare. Molto delicato per le articolazioni.', duration: 60 },
      { name: 'Pugilato immaginario (ombra) 🥊', desc: 'Mettiti in posizione stabile. Colpisci l\'aria delicatamente e ritmicamente, alternando sinistra e destra. Rilascia le tensioni delle spalle.', duration: 60 },
      { name: 'Tocco ginocchio-gomito 🧬', desc: 'In piedi, tocca il ginocchio sinistro con il gomito destro, poi il ginocchio destro con il gomito sinistro. Attiva i muscoli addominali.', duration: 60 },
      { name: 'Guerriero 3 con supporto ⚖️', desc: 'Tieniti a una sedia per l\'equilibrio. Solleva una gamba tesa all\'indietro e inclina leggermente il busto in avanti. Mantieni 30s, poi cambia lato.', duration: 60 },
      { name: 'Contrazione delle scapole 🏋️', desc: 'Stai dritto in piedi, gomiti piegati a 90 gradi. Avvicina con forza le scapole dietro di te, mantieni 3s, poi rilascia.', duration: 60 }
    ]
  }
};

function getSportT(key) {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  return SPORT_TRANSLATIONS[lang]?.[key] || SPORT_TRANSLATIONS.de[key] || key;
}

// Open / Close Modals
function openSportModal() {
  document.getElementById('helper-sport-modal').classList.remove('hidden');
  resetSportTimer();
  generateSportSuggestion();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeSportModal() {
  document.getElementById('helper-sport-modal').classList.add('hidden');
  resetSportTimer();
}

// Generate Exercise Suggestions
function generateSportSuggestion() {
  const energySelect = document.getElementById('sport-energy-select');
  if (!energySelect) return;
  const level = parseInt(energySelect.value) || 2;
  
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const list = SPORT_EXERCISES[lang]?.[level] || SPORT_EXERCISES['de'][level];
  
  // Pick random item from list
  const randomExercise = list[Math.floor(Math.random() * list.length)];
  currentSportExercise = randomExercise;

  const box = document.getElementById('sport-suggestion-box');
  if (box) {
    box.innerHTML = `
      <h4 class="text-white font-bold text-sm font-display mb-1">${randomExercise.name}</h4>
      <p class="text-xs text-gray-300 leading-relaxed font-semibold">${randomExercise.desc}</p>
      <div class="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-orange-400 font-bold uppercase tracking-wider">
        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
        <span>${randomExercise.duration}s</span>
      </div>
    `;
  }
  
  // Prepare Timer
  sportTimerSeconds = randomExercise.duration;
  updateSportTimerDisplay();
  document.getElementById('sport-timer-container').classList.remove('hidden');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Timer Logic
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

let sportTimerTargetEndTime = null;

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
  
  const playBtn = document.getElementById('sport-timer-play-btn');
  const pauseBtn = document.getElementById('sport-timer-pause-btn');
  if (playBtn) playBtn.classList.remove('hidden');
  if (pauseBtn) pauseBtn.classList.add('hidden');

  if (currentSportExercise) {
    sportTimerSeconds = currentSportExercise.duration;
  }
  updateSportTimerDisplay();
}

// Complete Exercise Unit
function completeSportActivity() {
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
    saveState();
  }

  closeSportModal();
}

// Tastatur-Listener zum Schließen des Modals
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sportModal = document.getElementById('helper-sport-modal');
      if (sportModal && !sportModal.classList.contains('hidden')) {
        closeSportModal();
      }
    }
  });
}

if (typeof window !== 'undefined') {
  window.openSportModal = openSportModal;
  window.openFitnessModal = openSportModal;
  window.closeSportModal = closeSportModal;
  window.switchSportCategory = typeof switchSportCategory !== 'undefined' ? switchSportCategory : undefined;
  window.generateSportSuggestion = generateSportSuggestion;
  window.startSportTimer = startSportTimer;
  window.pauseSportTimer = pauseSportTimer;
  window.skipSportTimer = skipSportTimer;
  window.resetSportTimer = resetSportTimer;
  window.completeSportActivity = completeSportActivity;
  window.setSportCustomDuration = typeof setSportCustomDuration !== 'undefined' ? setSportCustomDuration : undefined;
}

if (typeof globalThis !== 'undefined') {
  globalThis.openSportModal = openSportModal;
  globalThis.closeSportModal = closeSportModal;
  globalThis.switchSportCategory = typeof switchSportCategory !== 'undefined' ? switchSportCategory : undefined;
  globalThis.generateSportSuggestion = generateSportSuggestion;
  globalThis.startSportTimer = startSportTimer;
  globalThis.pauseSportTimer = pauseSportTimer;
  globalThis.skipSportTimer = skipSportTimer;
  globalThis.resetSportTimer = resetSportTimer;
  globalThis.completeSportActivity = completeSportActivity;
  globalThis.setSportCustomDuration = typeof setSportCustomDuration !== 'undefined' ? setSportCustomDuration : undefined;
}
