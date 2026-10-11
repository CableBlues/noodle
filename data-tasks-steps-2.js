/**
 * @file data-tasks-steps-2.js
 * @module DataTaskStepsHousehold
 * @description
 * Mehrsprachige Schritt-für-Schritt-Anleitungen (Micro-Steps) für Haushalts-,
 * Ordnungs- und Reinigungsaufgaben (`DE`, `EN`, `ES`, `EL`, `FR`, `IT`).
 */
const TASK_STEPS_DATABASE_PART2 = {
  'Aufräumen': {
    de: [
      '1. Mülltüte & Sammelkorb schnappen und einmal zügig durch den Raum gehen',
      '2. Allen Müll, leere Verpackungen & benutztes Geschirr direkt einsammeln und wegbringen',
      '3. Kleidung sortieren: Getragenes in den Wäschekorb, Frisches ordentlich in den Schrank',
      '4. Oberflächen (Tisch, Schreibtisch, Couch) freiräumen & Gegenstände an ihren festen Platz legen',
      '5. Kissen aufschütteln, Stühle heranschieben & die gewonnene optische Ruhe genießen'
    ],
    en: [
      '1. Grab a trash bag and a catch-all basket, and do a quick sweep of the room',
      '2. Collect all trash, empty wrappers, and dirty dishes and take them to the kitchen/bin',
      '3. Sort clothes: throw dirty items in the hamper, put clean clothes away in the closet',
      '4. Clear flat surfaces (tables, desks, counters) and return items to their designated spots',
      '5. Fluff sofa pillows, tuck in chairs, and enjoy the visual calm of a tidy space'
    ],
    es: [
      '1. Coger una bolsa de basura y una cesta para hacer una pasada rápida por la habitación',
      '2. Recoger toda la basura, envases vacíos y platos sucios y llevarlos a su sitio',
      '3. Clasificar la ropa: la sucia al cesto, la limpia al armario',
      '4. Despejar superficies (mesas, escritorio, sofá) colocando cada cosa en su lugar',
      '5. Ahuecar cojines, colocar sillas y disfrutar de la tranquilidad de un espacio ordenado'
    ],
    el: [
      '1. Πάρε μια σακούλα σκουπιδιών και ένα καλάθι και κάνε έναν γρήγορο γύρο στο δωμάτιο',
      '2. Μάζεψε όλα τα σκουπίδια, τις συσκευασίες και τα άπλυτα πιάτα και πήγαινέ τα στην κουζίνα',
      '3. Ξεχώρισε τα ρούχα: τα άπλυτα στο καλάθι, τα καθαρά στη ντουλάπα',
      '4. Άδειασε τις επιφάνειες (τραπέζια, γραφείο, καναπές) βάζοντας κάθε πράγμα στη θέση του',
      '5. Στρώσε τα μαξιλάρια, τακτοποίησε τις καρέκλες & απόλαυσε την ηρεμία του καθαρού χώρου'
    ],
    fr: [
      '1. Munis-toi d\'un sac poubelle et d\'un panier, puis fais un tour rapide de la pièce',
      '2. Ramasse tous les déchets, emballages et vaisselle sale pour les mettre au bon endroit',
      '3. Trie les vêtements : le sale dans le panier à linge, le propre plié dans l\'armoire',
      '4. Dégage les surfaces planes (tables, bureau, canapé) en remettant chaque objet à sa place',
      '5. Replace les coussins, pousse les chaises et profite du calme visuel retrouvé'
    ],
    it: [
      '1. Prendi un sacchetto per i rifiuti e un cesto, poi fai un giro veloce della stanza',
      '2. Raccogli tutta la spazzatura, confezioni vuote e piatti sporchi e portali in cucina',
      '3. Separa i vestiti: quelli sporchi nella cesta, quelli puliti nell\'armadio',
      '4. Libera le superfici piane (tavoli, scrivania, divano) rimettendo ogni oggetto al suo posto',
      '5. Spiumaccia i cuscini, sistema le sedie e goditi l\'ordine e la calma ritrovata'
    ]
  },

  'Staub wischen': {
    de: [
      '1. Leicht feuchtes Mikrofasertuch oder antistatischen Staubwedel bereitlegen',
      '2. Immer von OBEN nach UNTEN arbeiten: Hohe Regale, Lampen, Fensterbänke, dann Tische & Kommoden',
      '3. Gegenstände kurz anheben, darunter wischen und entstaubt zurückstellen',
      '4. Bildschirme & Monitore nur trocken mit weichem Tuch ohne Druck abwischen',
      '5. Tuch auswaschen – herabgefallene Staubpartikel werden danach einfach aufgesaugt'
    ],
    en: [
      '1. Prepare a slightly damp microfiber cloth or an electrostatic duster',
      '2. Always work from TOP to BOTTOM: high shelves, lamps, windowsills, then tables and sideboards',
      '3. Lift items briefly, wipe the surface underneath, and place them back clean',
      '4. Clean screens and delicate electronics only with a dry, soft cloth (no harsh pressure)',
      '5. Rinse the cloth – any dust that settled on the floor will be picked up during vacuuming'
    ],
    es: [
      '1. Preparar un paño de microfibra ligeramente húmedo o un plumero electrostático',
      '2. Trabajar siempre de ARRIBA hacia ABAJO: estanterías altas, lámparas, luego mesas y muebles',
      '3. Levantar los objetos, limpiar la superficie debajo y colocarlos limpios',
      '4. Limpiar pantallas y electrónica solo en seco con un paño suave sin apretar',
      '5. Aclarar el paño; el polvo caído se aspirará después del suelo'
    ],
    el: [
      '1. Ετοίμασε ένα ελαφρώς νωπό πανί μικροϊνών ή ένα φτερό ξεσκονίσματος',
      '2. Ξεκίνα πάντα από ΠΑΝΩ προς τα ΚΑΤΩ: ψηλά ράφια, φωτιστικά, περβάζια, έπειτα τραπέζια & έπιπλα',
      '3. Σήκωσε τα αντικείμενα, σκούπισε την επιφάνεια από κάτω και τοποθέτησέ τα καθαρά',
      '4. Καθάρισε οθόνες και ηλεκτρονικά μόνο στεγνά με απαλό πανί χωρίς πίεση',
      '5. Ξέπλυνε το πανί – η σκόνη που έπεσε στο πάτωμα θα μαζευτεί με το σκούπισμα'
    ],
    fr: [
      '1. Prépare un chiffon microfibre légèrement humide ou un plumeau électrostatique',
      '2. Travaille toujours du HAUT vers le BAS : étagères hautes, lampes, puis tables et buffets',
      '3. Soulève les objets, essuie la surface en dessous et repose-les dépoussiérés',
      '4. Essuie les écrans et appareils électroniques uniquement à sec avec un chiffon doux',
      '5. Rince ton chiffon – la poussière retombée au sol sera éliminée lors de l\'aspiration'
    ],
    it: [
      '1. Prepara un panno in microfibra leggermente umido o un piumino catturapolvere',
      '2. Lavora sempre dall\'ALTO verso il BASSO: mensole alte, lampadari, poi tavoli e mobili',
      '3. Solleva gli oggetti, pulisci sotto la superficie e riposizionali puliti',
      '4. Pulisci schermi ed elettronica solo a secco con un panno morbido senza fare pressione',
      '5. Sciacqua il panno – la polvere caduta a terra verrà raccolta passando l\'aspirapolvere'
    ]
  },

  'Staubsaugen': {
    de: [
      '1. Hindernisse, Kabel, Stühle und Schuhe kurz vom Boden anheben oder beiseitestellen',
      '2. Bodendüse passend einstellen (Bürste ausgefahren für Hartboden, eingezogen für Teppich)',
      '3. In der hintersten Ecke des Raumes starten und in gleichmäßigen Bahnen zur Tür hin saugen',
      '4. Ecken, Fußleisten und Zonen unter dem Bett/Sofa sorgfältig mitsaugen',
      '5. Staubsaugerkabel einziehen, Düse kurz abwischen und Gerät ordentlich abstellen'
    ],
    en: [
      '1. Pick up obstacles, cables, shoes, and move chairs slightly away from the floor',
      '2. Set the vacuum head correctly (brush extended for hard floors, retracted for carpets)',
      '3. Start at the farthest corner of the room and vacuum backward in overlapping strokes toward the doorway',
      '4. Vacuum along baseboards, corners, and under bed/sofa areas thoroughly',
      '5. Retract the power cord, clean the nozzle, and store the vacuum in its place'
    ],
    es: [
      '1. Retirar del suelo obstáculos, cables, zapatos y apartar las sillas',
      '2. Ajustar el cabezal de la aspiradora (cepillo fuera para suelos duros, dentro para alfombras)',
      '3. Empezar en la esquina más alejada y aspirar hacia atrás en dirección a la puerta',
      '4. Aspirar con detalle esquinas, zócalos y debajo de camas o sofás',
      '5. Recoger el cable, limpiar el cepillo y guardar la aspiradora'
    ],
    el: [
      '1. Μάζεψε από το πάτωμα καλώδια, παπούτσια και απομάκρυνε ελαφρώς τις καρέκλες',
      '2. Ρύθμισε σωστά το πέλμα (βούρτσα έξω για σκληρά δάπεδα, μέσα για χαλιά)',
      '3. Ξεκίνα από την πιο μακρινή γωνία και σκούπισε προς τα πίσω με κατεύθυνση την πόρτα',
      '4. Πέρασε προσεκτικά γωνίες, σοβατεπί και κάτω από κρεβάτια/καναπέδες',
      '5. Μάζεψε το καλώδιο, καθάρισε το πέλμα και τακτοποίησε τη σκούπα'
    ],
    fr: [
      '1. Ramasse les câbles, chaussures et déplace légèrement les chaises du sol',
      '2. Règle la brosse de l\'aspirateur (poils sortis pour sol dur, rentrés pour tapis/moquette)',
      '3. Commence par le coin le plus éloigné et aspire à reculons en direction de la porte',
      '4. Aspire soigneusement les plinthes, recoins et sous les lits/canapés',
      '5. Enroule le câble, nettoie la brosse et range l\'aspirateur à sa place'
    ],
    it: [
      '1. Togli dal pavimento cavi, scarpe e sposta leggermente le sedie',
      '2. Regola la spazzola dell\'aspirapolvere (setole fuori per pavimenti duri, dentro per tappeti)',
      '3. Inizia dall\'angolo più lontano e procedi all\'indietro verso la porta',
      '4. Aspira con cura battiscopa, angoli e sotto divani e letti',
      '5. Riavvolgi il cavo, pulisci la bocchetta e riponi l\'aspirapolvere'
    ]
  },

  'Boden wischen': {
    de: [
      '1. Eimer mit warmem Wasser und einer Kappe Allzweck- oder Bodenreiniger befüllen',
      '2. Sicherstellen, dass der Boden vorher gründlich gesaugt oder gekehrt wurde',
      '3. Wischmopp gründlich auswringen (nebelfeucht bei Parkett/Laminat, nasser bei Fliesen)',
      '4. Von der hintersten Zimmerecke in Schlangenlinien rückwärts zur Tür wischen',
      '5. Fenster öffnen & Boden 10-15 Min. unbetreten vollständig trocknen lassen'
    ],
    en: [
      '1. Fill mop bucket with warm water and a capful of appropriate floor cleaner',
      '2. Ensure the floor has been thoroughly vacuumed or swept first',
      '3. Wring out mop thoroughly (barely damp for laminate/wood, slightly wetter for tiles)',
      '4. Mop from the farthest corner backward toward the exit door using figure-eight strokes',
      '5. Open windows and allow floor to dry completely for 10-15 minutes before walking on it'
    ],
    es: [
      '1. Llenar el cubo con agua tibia y un tapón de limpiador de suelos adecuado',
      '2. Asegurarse de que el suelo esté bien aspirado antes de fregar',
      '3. Escurrir muy bien la fregona (ligeramente húmeda para parquet/laminado, más mojada para baldosas)',
      '4. Fregar desde la esquina más alejada hacia la puerta en movimientos continuos',
      '5. Abrir ventanas y dejar secar completamente 10-15 minutos sin pisar'
    ],
    el: [
      '1. Γέμισε τον κουβά με ζεστό νερό και ένα καπάκι καθαριστικό πατώματος',
      '2. Βεβαιώσου ότι το πάτωμα έχει σκουπιστεί πολύ καλά προηγουμένως',
      '3. Στύψε πολύ καλά τη σφουγγαρίστρα (ελαφρώς νωπή για παρκέ/laminate, πιο υγρή για πλακάκια)',
      '4. Σφουγγάρισε από την πιο μακρινή γωνία προς την πόρτα με κινήσεις σε σχήμα οκτώ',
      '5. Άνοιξε τα παράθυρα και άφησε το δάπεδο να στεγνώσει εντελώς για 10-15 λεπτά'
    ],
    fr: [
      '1. Remplis le seau d\'eau tiède avec un bouchon de nettoyant adapté pour les sols',
      '2. Assure-toi que le sol a été soigneusement aspiré au préalable',
      '3. Essore bien la serpillière (légèrement humide pour le parquet/stratifié, plus mouillée pour le carrelage)',
      '4. Lave à reculons du coin le plus éloigné vers la porte en formant des huit',
      '5. Ouvre les fenêtres et laisse sécher complètement 10 à 15 minutes sans marcher dessus'
    ],
    it: [
      '1. Riempi il secchio con acqua tiepida e un tappo di detergente per pavimenti',
      '2. Assicurati che il pavimento sia stato ben aspirato prima di lavarlo',
      '3. Strizza con cura lo straccio/mocio (appena umido per parquet, più bagnato per piastrelle)',
      '4. Lava partendo dall\'angolo più lontano verso l\'uscita con movimenti a otto',
      '5. Apri le finestre e lascia asciugare per 10-15 minuti senza calpestare'
    ]
  },

  'Geschirr spülen': {
    de: [
      '1. Speisereste mit Schaber/Papiertuch in den Biomüll entsorgen & Eingebranntes kurz mit warmem Wasser einweichen',
      '2. Spülmaschine systematisch beladen (Teller/Töpfe unten, Gläser/Tassen oben) ODER Spülbecken mit heißem Spülwasser füllen',
      '3. Reihenfolge beim Spülen von sauber zu fettig: Gläser & Besteck zuerst, dann Teller, zuletzt Töpfe & Pfannen',
      '4. Mit klarem Wasser nachspülen und auf das Abtropfgitter stellen oder abtrocknen',
      '5. Spülbecken ausspülen, Reste aus dem Sieb leeren & Spültuch luftig aufhängen'
    ],
    en: [
      '1. Scrape food scraps into the compost bin & soak stubborn burnt pans in warm soapy water',
      '2. Load dishwasher systematically (plates/pans below, glasses/cups above) OR fill sink with hot soapy water',
      '3. Wash in order from cleanest to greasiest: glassware & cutlery first, then plates, pots/pans last',
      '4. Rinse with clean hot water and place on drying rack or dry with a clean dish towel',
      '5. Rinse the sink basin, empty the drain strainer & hang the dishcloth up to dry'
    ],
    es: [
      '1. Retirar restos de comida a la basura y poner en remojo sartenes con restos pegados',
      '2. Cargar el lavavajillas ordenadamente O llenar el fregadero con agua caliente y jabón',
      '3. Lavar de menos a más graso: vasos y cubiertos primero, luego platos, ollas y sartenes al final',
      '4. Aclarar con agua limpia y colocar en el escurridor o secar con paño limpio',
      '5. Aclarar el fregadero, limpiar el filtro del desagüe y tender el estropajo'
    ],
    el: [
      '1. Καθάρισε τα υπολείμματα φαγητού στα σκουπίδια & μούλιασε τα καμένα σκεύη σε ζεστό νερό',
      '2. Γέμισε το πλυντήριο πιάτων σωστά Ή γέμισε τον νεροχύτη με ζεστό νερό και απορρυπαντικό',
      '3. Πλύνε με σειρά από τα καθαρά στα πιο λιπαρά: ποτήρια/μαχαιροπίρουνα, πιάτα, κατσαρόλες/τηγάνια στο τέλος',
      '4. Ξέπλυνε με καθαρό νερό και τοποθέτησέ τα στη στραγγίχτρα ή σκούπισέ τα',
      '5. Ξέπλυνε τη γούρνα του νεροχύτη, άδειασε το φίλτρο & άπλωσε το σφουγγάρι να στεγνώσει'
    ],
    fr: [
      '1. Jette les restes alimentaires à la poubelle et fais tremper les plats attachés à l\'eau chaude',
      '2. Remplis le lave-vaisselle méthodiquement OU prépare un évier d\'eau chaude savonneuse',
      '3. Lave du moins gras au plus gras : verres et couverts d\'abord, assiettes, puis casseroles et poêles',
      '4. Rince à l\'eau claire et dispose sur l\'égouttoir ou essuie avec un torchon propre',
      '5. Rince l\'évier, vide la grille d\'évacuation et étends l\'éponge/chiffon'
    ],
    it: [
      '1. Elimina i residui di cibo e metti in ammollo pentole e teglie incrostate con acqua calda',
      '2. Carica la lavastoviglie con criterio O riempi il lavello con acqua calda e detersivo',
      '3. Lava dal meno unto al più unto: prima bicchieri e posate, poi piatti, infine pentole e padelle',
      '4. Risciacqua con acqua corrente pulita e disponi sullo scolapiatti o asciuga con un canovaccio',
      '5. Pulisci la vasca del lavello, svuota il filtro e stendi la spugnetta ad asciugare'
    ]
  },

  'Wäsche waschen': {
    de: [
      '1. Wäsche nach Farben und Textilien trennen (Buntwäsche 30-40°C, Weißwäsche & Handtücher 60°C)',
      '2. Taschen leeren, Reißverschlüsse schließen & bedruckte Kleidungsstücke auf links drehen',
      '3. Waschtrommel beladen (oben sollte noch etwa eine Handbreit Platz frei bleiben)',
      '4. Passendes Waschmittel dosieren (Color- oder Vollwaschmittel) & Programm starten',
      '5. Timer/Erinnerung stellen, damit die nasse Wäsche nach Programmende direkt entnommen wird'
    ],
    en: [
      '1. Separate laundry by color and fabric (colors 30-40°C, whites & towels/bedding 60°C)',
      '2. Empty pockets, zip up zippers & turn graphic shirts and delicates inside out',
      '3. Load the drum leaving a hand\'s width of space at the top so clothes can tumble freely',
      '4. Add appropriate detergent dose (color or heavy-duty detergent) & start the cycle',
      '5. Set a timer/reminder so wet laundry is hung immediately when the cycle finishes'
    ],
    es: [
      '1. Separar la colada por colores y tipo de tejido (color 30-40°C, blancos y toallas 60°C)',
      '2. Vaciar bolsillos, cerrar cremalleras y dar la vuelta a prendas con estampados',
      '3. Cargar el tambor dejando un palmo libre arriba para que la ropa gire bien',
      '4. Dosificar el detergente adecuado (color o blanco) e iniciar el programa',
      '5. Poner una alarma para tender la ropa en cuanto termine el ciclo'
    ],
    el: [
      '1. Ξεχώρισε τα ρούχα ανά χρώμα και ύφασμα (χρωματιστά 30-40°C, λευκά & πετσέτες 60°C)',
      '2. Άδειασε τσέπες, κλείσε φερμουάρ & γύρισε τα ευαίσθητα/τυπωμένα ρούχα ανάποδα',
      '3. Γέμισε τον κάδο αφήνοντας έναν χώρο μιας παλάμης στο επάνω μέρος',
      '4. Βάλε τη σωστή δόση απορρυπαντικού & ξεκίνα το πρόγραμμα',
      '5. Βάλε ξυπνητήρι/υπενθύμιση για να απλώσεις τα ρούχα αμέσως μόλις τελειώσει'
    ],
    fr: [
      '1. Trie le linge par couleur et textile (couleurs 30-40°C, blancs et serviettes 60°C)',
      '2. Vide les poches, ferme les fermetures éclair et retourne les vêtements délicats',
      '3. Remplis le tambour en laissant l\'espace d\'une main libre au sommet',
      '4. Dose la bonne quantité de lessive (couleur ou blanc) et lance le programme',
      '5. Mets un rappel pour étendre le linge dès la fin du cycle'
    ],
    it: [
      '1. Dividi il bucato per colore e tessuto (colorati 30-40°C, bianchi e asciugamani 60°C)',
      '2. Svuota le tasche, chiudi le cerniere e gira al rovescio i capi delicati o stampati',
      '3. Carica il cestello lasciando lo spazio di una mano libera in alto',
      '4. Dosa il detersivo adatto (per colorati o universale) e avvia il lavaggio',
      '5. Imposta un promemoria per stendere i panni appena la lavatrice ha terminato'
    ]
  },

  'Wäsche aufhängen': {
    de: [
      '1. Wäscheständer an einem gut belüfteten Ort (nahe geöffnetem Fenster) stabil aufstellen',
      '2. Jedes Wäschestück aus der Maschine nehmen und kräftig ausschütteln (reduziert Knitterfalten deutlich)',
      '3. Schwere Teile (Jeans, Handtücher) außen, leichtere T-Shirts und Socken innen aufhängen',
      '4. Ausreichend Abstand zwischen den Kleidungsstücken lassen, damit die Luft zirkulieren kann',
      '5. Raum für 10 Min. lüften, damit feuchte Luft entweicht und die Wäsche schnell trocknet'
    ],
    en: [
      '1. Set up the drying rack stably in a well-ventilated spot (near an open window)',
      '2. Remove each garment from the machine and give it a firm shake (smooths out wrinkles)',
      '3. Hang heavier items (jeans, bath towels) on outer bars, lighter items and socks on inner bars',
      '4. Leave ample space between garments so drying air can circulate freely',
      '5. Ventilate the room for 10 minutes to let moisture escape and prevent musty smells'
    ],
    es: [
      '1. Colocar el tendedero en un lugar bien ventilado',
      '2. Sacar cada prenda y sacudirla con energía para reducir las arrugas',
      '3. Colgar prendas pesadas (vaqueros, toallas) en las varillas exteriores y las ligeras en el centro',
      '4. Dejar espacio entre prendas para que el aire circule bien',
      '5. Ventilar la habitación para que la humedad salga y la ropa seque rápido'
    ],
    el: [
      '1. Στήσε την απλώστρα σταθερά σε χώρο με καλό αερισμό',
      '2. Βγάλε κάθε ρούχο και τίναξέ το δυνατά (μειώνει σημαντικά το τσαλάκωμα)',
      '3. Άπλωσε τα βαριά (τζιν, πετσέτες) στα εξωτερικά σύρματα και τα ελαφριά στα εσωτερικά',
      '4. Άφησε επαρκές κενό ανάμεσα στα ρούχα για να κυκλοφορεί ο αέρας',
      '5. Άνοιξε το παράθυρο για λίγο ώστε να απομακρυνθεί η υγρασία'
    ],
    fr: [
      '1. Déploie l\'étendoir de façon stable dans une pièce bien aérée',
      '2. Sors chaque vêtement et secoue-le énergiquement pour défroisser les fibres',
      '3. Étends les pièces lourdes (jeans, serviettes) à l\'extérieur et les légères au milieu',
      '4. Laisse de l\'espace entre les vêtements pour que l\'air circule librement',
      '5. Ouvre la fenêtre pour évacuer l\'humidité et accélérer le séchage'
    ],
    it: [
      '1. Posiziona lo stendibiancheria in un luogo ben aerato della casa',
      '2. Prendi ogni capo e scuotilo con decisione per distendere le pieghe',
      '3. Stendi i capi pesanti (jeans, asciugamani) sulle aste esterne e quelli leggeri al centro',
      '4. Lascia spazio tra i vestiti per consentire la circolazione dell\'aria',
      '5. Apri la finestra per far uscire l\'umidità e velocizzare l\'asciugatura'
    ]
  },

  'Waschbecken & Spiegelschrank': {
    de: [
      '1. Zahnbürsten & Kosmetik kurz vom Waschbeckenrand in eine kleine Schale stellen',
      '2. Badreiniger/Kalklöser auf Waschbecken, Armatur und Ablageflächen sprühen (2 Min einwirken lassen)',
      '3. Spiegel mit Glasreiniger einsprühen und mit trockenem Waffeltuch/Mikrofasertuch streifenfrei polieren',
      '4. Waschbecken und Wasserhahn mit feuchtem Schwamm abreiben & mit klarem Wasser gründlich nachspülen',
      '5. Armatur mit trockenem Tuch glänzend trockenreiben & Pflegeprodukte ordentlich zurückstellen'
    ],
    en: [
      '1. Move toothbrushes and cosmetics off the sink surface into a small tray',
      '2. Spray bathroom/limescale cleaner onto the basin, faucet, and surfaces (let sit for 2 mins)',
      '3. Spray mirror with glass cleaner and buff completely streak-free with a dry microfiber cloth',
      '4. Wipe basin and faucet with a damp sponge and rinse thoroughly with clear water',
      '5. Buff chrome faucet dry with a towel for a brilliant shine & return items neatly'
    ],
    es: [
      '1. Retirar cepillos y cosméticos del lavabo temporalmente',
      '2. Pulverizar limpiador de baño/antical en lavabo y grifo (dejar actuar 2 min)',
      '3. Limpiar el espejo con limpiacristales y secar con microfibra sin dejar marcas',
      '4. Frotar el lavabo y el grifo con esponja húmeda y aclarar con agua limpia',
      '5. Secar el grifo para sacarle brillo y colocar los productos ordenados'
    ],
    el: [
      '1. Μετακίνησε προσωρινά οδοντόβουρτσες και καλλυντικά από τον νιπτήρα',
      '2. Ψέκασε καθαριστικό αλάτων σε νιπτήρα και μπαταρία (άφησε να δράσει 2 λεπτά)',
      '3. Ψέκασε τον καθρέφτη με καθαριστικό τζαμιών και γυάλισε με στεγνό πανί μικροϊνών',
      '4. Τρίψε τον νιπτήρα με νωπό σφουγγάρι και ξέπλυνε καλά με καθαρό νερό',
      '5. Σκούπισε τη βρύση με στεγνό πανί για να γυαλίσει & τακτοποίησε τα πράγματα'
    ],
    fr: [
      '1. Retire temporairement brosses à dents et cosmétiques du rebord du lavabo',
      '2. Vaporise le nettoyant salle de bain/anticalcaire sur le lavabo et la robinetterie (laisse agir 2 min)',
      '3. Nettoie le miroir au nettoyant vitres et lustre avec un chiffon microfibre propre sans traces',
      '4. Frotte le lavabo et le robinet à l\'éponge humide, puis rince abondamment à l\'eau claire',
      '5. Séche la robinetterie au chiffon doux pour faire briller et remets les objets en place'
    ],
    it: [
      '1. Rimuovi temporaneamente spazzolini e cosmetici dal piano del lavandino',
      '2. Spruzza anticalcare o detergente bagno su lavabo e rubinetteria (lascia agire 2 min)',
      '3. Spruzza lavavetri sullo specchio e asciuga con panno in microfibra senza aloni',
      '4. Pulisci lavandino e rubinetto con spugna umida e risciacqua con acqua corrente',
      '5. Asciuga il rubinetto per farlo brillare e rimetti in ordine i prodotti'
    ]
  },

  'Waschbecken & Spiegelschrank putzen': {
    de: [
      '1. Zahnbürsten & Kosmetik kurz vom Waschbeckenrand in eine kleine Schale stellen',
      '2. Badreiniger/Kalklöser auf Waschbecken, Armatur und Ablageflächen sprühen (2 Min einwirken lassen)',
      '3. Spiegel mit Glasreiniger einsprühen und mit trockenem Waffeltuch/Mikrofasertuch streifenfrei polieren',
      '4. Waschbecken und Wasserhahn mit feuchtem Schwamm abreiben & mit klarem Wasser gründlich nachspülen',
      '5. Armatur mit trockenem Tuch glänzend trockenreiben & Pflegeprodukte ordentlich zurückstellen'
    ],
    en: [
      '1. Move toothbrushes and cosmetics off the sink surface into a small tray',
      '2. Spray bathroom/limescale cleaner onto the basin, faucet, and surfaces (let sit for 2 mins)',
      '3. Spray mirror with glass cleaner and buff completely streak-free with a dry microfiber cloth',
      '4. Wipe basin and faucet with a damp sponge and rinse thoroughly with clear water',
      '5. Buff chrome faucet dry with a towel for a brilliant shine & return items neatly'
    ],
    es: [
      '1. Retirar cepillos y cosméticos del lavabo temporalmente',
      '2. Pulverizar limpiador de baño/antical en lavabo y grifo (dejar actuar 2 min)',
      '3. Limpiar el espejo con limpiacristales y secar con microfibra sin dejar marcas',
      '4. Frotar el lavabo y el grifo con esponja húmeda y aclarar con agua limpia',
      '5. Secar el grifo para sacarle brillo y colocar los productos ordenados'
    ],
    el: [
      '1. Μετακίνησε προσωρινά οδοντόβουρτσες και καλλυντικά από τον νιπτήρα',
      '2. Ψέκασε καθαριστικό αλάτων σε νιπτήρα και μπαταρία (άφησε να δράσει 2 λεπτά)',
      '3. Ψέκασε τον καθρέφτη με καθαριστικό τζαμιών και γυάλισε με στεγνό πανί μικροϊνών',
      '4. Τρίψε τον νιπτήρα με νωπό σφουγγάρι και ξέπλυνε καλά με καθαρό νερό',
      '5. Σκούπισε τη βρύση με στεγνό πανί για να γυαλίσει & τακτοποίησε τα πράγματα'
    ],
    fr: [
      '1. Retire temporairement brosses à dents et cosmétiques du rebord du lavabo',
      '2. Vaporise le nettoyant salle de bain/anticalcaire sur le lavabo et la robinetterie (laisse agir 2 min)',
      '3. Nettoie le miroir au nettoyant vitres et lustre avec un chiffon microfibre propre sans traces',
      '4. Frotte le lavabo et le robinet à l\'éponge humide, puis rince abondamment à l\'eau claire',
      '5. Séche la robinetterie au chiffon doux pour faire briller et remets les objets en place'
    ],
    it: [
      '1. Rimuovi temporaneamente spazzolini e cosmetici dal piano del lavandino',
      '2. Spruzza anticalcare o detergente bagno su lavabo e rubinetteria (lascia agire 2 min)',
      '3. Spruzza lavavetri sullo specchio e asciuga con panno in microfibra senza aloni',
      '4. Pulisci lavandino e rubinetto con spugna umida e risciacqua con acqua corrente',
      '5. Asciuga il rubinetto per farlo brillare e rimetti in ordine i prodotti'
    ]
  },

  'Fliesen & Badewanne': {
    de: [
      '1. Shampoo-Flaschen und Schwämme kurz aus Wanne und Dusche räumen',
      '2. Bad- & Kalkreiniger gleichmäßig auf Fliesen, Fugen, Wannenrand und Duschkopf aufsprühen',
      '3. 5-10 Minuten einwirken lassen (der Reiniger löst Seifenreste und Kalk selbstständig an)',
      '4. Fliesen und Wanne mit Badschwamm abreiben (bei hartnäckigen Fugen eine kleine Bürste nutzen)',
      '5. Mit dem Duschstrahl warm abspülen & Fliesen mit dem Gummiabzieher streifenfrei abziehen'
    ],
    en: [
      '1. Clear shampoo bottles, soaps, and bath toys out of the tub and shower area',
      '2. Spray bathroom/limescale cleaner evenly over tiles, grout lines, tub surfaces, and shower head',
      '3. Let it sit for 5-10 minutes (allows cleaner to dissolve soap scum and hard water deposits without heavy scrubbing)',
      '4. Scrub surfaces gently with a bathroom sponge (use a small grout brush for tight corners)',
      '5. Rinse thoroughly with warm shower water & squeegee tiles and glass to prevent water spots'
    ],
    es: [
      '1. Retirar botes de champú y esponjas de la bañera y ducha',
      '2. Pulverizar antical en azulejos, juntas, bañera y grifería',
      '3. Dejar actuar 5-10 minutos para disolver la cal y restos de jabón',
      '4. Frotar con una esponja de baño suave prestando atención a las juntas',
      '5. Aclarar con agua tibia usando la alcachofa y pasar la rasqueta'
    ],
    el: [
      '1. Άδειασε τη μπανιέρα/ντουζιέρα από σαμπουάν και σφουγγάρια',
      '2. Ψέκασε καθαριστικό αλάτων ομοιόμορφα σε πλακάκια, αρμούς, μπανιέρα & τηλέφωνο ντους',
      '3. Άφησε να δράσει για 5-10 λεπτά (διαλύει τα άλατα και τα υπολείμματα σαπουνιού)',
      '4. Τρίψε με σφουγγάρι μπάνιου και καθάρισε προσεκτικά τους αρμούς',
      '5. Ξέπλυνε καλά με ζεστό νερό από το ντους & πέρνα τα πλακάκια με λάστιχο'
    ],
    fr: [
      '1. Dégage les flacons de shampoing et éponges de la baignoire ou douche',
      '2. Vaporise l\'anticalcaire sur les carreaux, joints, baignoire et pommeau de douche',
      '3. Laisse agir 5 à 10 minutes pour dissoudre le calcaire et les résidus de savon sans forcer',
      '4. Frotte avec une éponge de salle de bain en insistant sur les joints',
      '5. Rince abondamment au jet d\'eau chaude et passe la raclette pour éviter les traces de calcaire'
    ],
    it: [
      '1. Togli flaconi di bagnoschiuma e spugne dalla vasca e dalla doccia',
      '2. Spruzza l\'anticalcare su piastrelle, fughe, vasca e soffione doccia',
      '3. Lascia agire per 5-10 minuti per sciogliere calcare e residui di sapone',
      '4. Strofina con una spugna morbida prestando attenzione alle fughe',
      '5. Risciacqua abbondantemente con il getto della doccia e passa il tiravetri'
    ]
  },

  'Klo putzen': {
    de: [
      '1. WC-Reiniger unter den Innenrand der Kloschüssel spritzen & mit der Bürste verteilen (5 Min einwirken lassen)',
      '2. Separates WC-Reinigungstuch (Hygiene-Farbleitsystem: Rot) & Desinfektionsreiniger bereitlegen',
      '3. Spülkasten, Drückerplatte, Deckel und Brille von OBEN nach UNTEN gründlich desinfizierend abwischen',
      '4. Toilettenschüssel innen kräftig mit der WC-Bürste schrubben, bis unter den Rand, und spülen',
      '5. Außenseite der Kloschüssel & Fußboden um das WC feucht abwischen & Tuch direkt in die 60°C-Wäsche geben'
    ],
    en: [
      '1. Squirt toilet bowl cleaner under the rim and distribute with the brush (let sit for 5 mins)',
      '2. Prepare a designated toilet cloth (Color code: Red) and disinfectant spray',
      '3. Wipe down flush button, tank, lid, seat, and hinge areas thoroughly from TOP to BOTTOM',
      '4. Scrub inside the bowl firmly with the toilet brush (under the rim and down the trap), then flush',
      '5. Wipe the exterior ceramic base and floor around the toilet, then put the cloth directly in hot wash'
    ],
    es: [
      '1. Aplicar limpiador de WC bajo el borde y repartir con la escobilla (dejar actuar 5 min)',
      '2. Usar un paño exclusivo para el inodoro (código rojo) y desinfectante',
      '3. Limpiar pulsador, cisterna, tapa y asiento de ARRIBA hacia ABAJO',
      '4. Frotar con fuerza el interior de la taza con la escobilla y tirar de la cadena',
      '5. Limpiar el pie del inodoro y el suelo alrededor, poniendo el paño directo a la lavadora'
    ],
    el: [
      '1. Ρίξε καθαριστικό λεκάνης κάτω από το χείλος και άπλωσέ το με το πιγκάλ (άφησε να δράσει 5 λεπτά)',
      '2. Χρησιμοποίησε ξεχωριστό πανί για την τουαλέτα (κόκκινος κωδικός) και απολυμαντικό',
      '3. Σκούπισε το καζανάκι, το καπάκι και το κάθισμα από ΠΑΝΩ προς τα ΚΑΤΩ',
      '4. Τρίψε καλά το εσωτερικό της λεκάνης με το πιγκάλ και τράβηξε το καζανάκι',
      '5. Σκούπισε τη βάση της λεκάνης και το γύρω δάπεδο & βάλε το πανί κατευθείαν για πλύσιμο'
    ],
    fr: [
      '1. Verse le gel WC sous les rebords et répartis avec la brosse (laisse agir 5 min)',
      '2. Utilise un chiffon dédié exclusivement aux WC (code couleur rouge) et un désinfectant',
      '3. Essuie bouton de chasse, réservoir, abattant et lunette du HAUT vers le BAS',
      '4. Frotte énergiquement l\'intérieur de la cuvette avec la brosse, puis tire la chasse',
      '5. Nettoie l\'extérieur de la cuvette et le sol autour, puis mets le chiffon au lavage chaud'
    ],
    it: [
      '1. Distribuisci il gel WC sotto il bordo della tazza e spargi con lo scopino (lascia agire 5 min)',
      '2. Usa un panno dedicato esclusivamente al WC (codice colore rosso) e disinfettante',
      '3. Pulisci placca di scarico, coperchio, asse e cerniere dall\'ALTO verso il BASSO',
      '4. Strofina energicamente l\'interno del water con lo scopino e tira lo sciacquone',
      '5. Pulisci la base esterna e il pavimento circostante, poi metti subito il panno a lavare'
    ]
  }
};

window.TASK_STEPS_DATABASE_PART2 = TASK_STEPS_DATABASE_PART2;
globalThis.TASK_STEPS_DATABASE_PART2 = TASK_STEPS_DATABASE_PART2;
