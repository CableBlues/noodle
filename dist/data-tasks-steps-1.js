/**
 * @file data-tasks-steps-1.js
 * @module DataTaskStepsDaily
 * @description
 * Mehrsprachige Schritt-für-Schritt-Anleitungen (Micro-Steps) für grundlegende
 * tägliche Routinen (`DE`, `EN`, `ES`, `EL`, `FR`, `IT`).
 */
const TASK_STEPS_DATABASE_PART1 = {
  'Medis': {
    de: [
      '1. Glas frisches Wasser einschenken & Medikamentenbox / Blister bereitlegen',
      '2. Richtige Dosierung für die aktuelle Tageszeit (morgens/mittags/abends) prüfen',
      '3. Tabletten mit einem großen Schluck Wasser einnehmen (nicht auf nüchternen Magen, falls vorgeschrieben)',
      '4. Packung / Box direkt wieder an ihren festen Aufbewahrungsort zurücklegen',
      '5. Kurze mentale Bestätigung („Erledigt!“) & Aufgabe in der App abhaken'
    ],
    en: [
      '1. Pour a glass of fresh water & have your medication organizer or blister pack ready',
      '2. Check the correct dosage for the current time of day (morning/noon/evening)',
      '3. Take your medication with a full sip of water (follow food instructions if applicable)',
      '4. Return the medication box immediately to its designated storage place',
      '5. Give yourself a quick mental confirmation ("Done!") & check it off in the app'
    ],
    es: [
      '1. Servir un vaso de agua fresca y preparar el pastillero o blíster',
      '2. Comprobar la dosis correcta para el momento del día (mañana/tarde/noche)',
      '3. Tomar la medicación con un buen trago de agua (según prescripción)',
      '4. Guardar la caja de medicamentos en su lugar habitual',
      '5. Confirmación mental («¡Listo!») y marcar la tarea en la app'
    ],
    el: [
      '1. Γέμισε ένα ποτήρι φρέσκο νερό & ετοίμασε τη θήκη ή την καρτέλα φαρμάκων',
      '2. Έλεγξε τη σωστή δοσολογία για την ώρα της ημέρας (πρωί/μεσημέρι/βράδυ)',
      '3. Πάρε τα φάρμακα με μια γεμάτη γουλιά νερό',
      '4. Επίστρεψε το κουτί αμέσως στη σταθερή θέση φύλαξής του',
      '5. Επιβεβαίωσε τη λήψη & σημείωσε την εργασία στην εφαρμογή'
    ],
    fr: [
      '1. Remplis un verre d\'eau fraîche et prépare ton pilulier ou ta plaquette',
      '2. Vérifie le bon dosage pour le moment de la journée (matin/midi/soir)',
      '3. Prends ton médicament avec une grande gorgée d\'eau',
      '4. Range immédiatement la boîte à son emplacement habituel',
      '5. Courte confirmation mentale (« Fait ! ») et coche la tâche dans l\'application'
    ],
    it: [
      '1. Versa un bicchiere d\'acqua fresca e tieni a portata il portapillole o blister',
      '2. Controlla il dosaggio corretto per il momento della giornata (mattina/pomeriggio/sera)',
      '3. Assumi i farmaci con un bel sorso d\'acqua',
      '4. Riponi subito la confezione nel suo posto designato',
      '5. Breve conferma mentale ("Fatto!") e spunta l\'attività nell\'app'
    ]
  },

  'Zähne morgens': {
    de: [
      '1. Zahnbürste mit erbsengroßer Menge fluoridhaltiger Zahnpasta benetzen',
      '2. 2 Minuten systematisch putzen: Kauflächen, Außenflächen und Innenflächen (30 Sek. pro Kieferquadrant)',
      '3. Zahnschaum ausspucken (nur kurz oder gar nicht nachspülen, damit Fluorid schützen kann)',
      '4. Zahnbürste gründlich unter fließendem Wasser ausspülen und aufrecht zum Trocknen aufstellen',
      '5. Gesicht mit frischem Wasser erfrischen & mit sauberem Mundgefühl in den Tag starten'
    ],
    en: [
      '1. Apply a pea-sized amount of fluoride toothpaste to your toothbrush',
      '2. Brush thoroughly for 2 minutes: chewing surfaces, outer surfaces, and inner surfaces (30 sec per quadrant)',
      '3. Spit out the foam (spit, don\'t rinse with excess water so fluoride can protect enamel)',
      '4. Rinse the toothbrush thoroughly under running water and store upright to dry',
      '5. Refresh your face with cool water and start your morning with a clean smile'
    ],
    es: [
      '1. Aplicar una cantidad del tamaño de un guisante de pasta con flúor en el cepillo',
      '2. Cepillar durante 2 minutos: caras masticatorias, exteriores e interiores (30 seg por cuadrante)',
      '3. Escupir la espuma (evitar enjuagar con exceso de agua para mantener la protección)',
      '4. Aclarar bien el cepillo bajo el grifo y colocarlo en posición vertical',
      '5. Refrescarse la cara con agua fresca y empezar el día'
    ],
    el: [
      '1. Βάλε οδοντόκρεμα με φθόριο σε μέγεθος μπιζελιού στην οδοντόβουρτσα',
      '2. Βούρτσισε σχολαστικά για 2 λεπτά: μασητικές, εξωτερικές και εσωτερικές επιφάνειες',
      '3. Φτύσε τον αφρό (απόφυγε το πολύ ξέπλυμα ώστε το φθόριο να προστατεύει τα δόντια)',
      '4. Ξέπλυνε καλά την οδοντόβουρτσα και τοποθέτησέ την όρθια να στεγνώσει',
      '5. Δροσίσου με κρύο νερό στο πρόσωπο και ξεκίνα τη μέρα σου'
    ],
    fr: [
      '1. Dépose une noisette de dentifrice au fluor sur ta brosse à dents',
      '2. Brosse soigneusement pendant 2 minutes : faces masticatoires, extérieures et intérieures',
      '3. Recrache la mousse (sans rincer abondamment pour laisser agir le fluor)',
      '4. Rince bien ta brosse à l\'eau courante et range-la debout pour qu\'elle sèche',
      '5. Rafraîchis ton visage à l\'eau fraîche et démarre ta journée'
    ],
    it: [
      '1. Applica una noce di dentifricio al fluoro sullo spazzolino',
      '2. Spazzola accuratamente per 2 minuti: superfici masticatorie, esterne e interne',
      '3. Sputa la schiuma (evita di sciacquare con troppa acqua per prolungare l\'azione del fluoro)',
      '4. Risciacqua bene lo spazzolino e riponilo in verticale ad asciugare',
      '5. Rinfrescati il viso con acqua fresca e inizia la giornata con energia'
    ]
  },

  'Gesicht waschen': {
    de: [
      '1. Hände gründlich mit Seife waschen, bevor das Gesicht berührt wird',
      '2. Gesicht mit lauwarmem Wasser anfeuchten und milden Reiniger sanft kreisend einmassieren',
      '3. Mit klarem, lauwarmem Wasser restlos abspülen (schont die Hautbarriere)',
      '4. Gesicht mit einem sauberen Handtuch sanft trocken tupfen (nicht reiben)',
      '5. Feuchtigkeitscreme & ggf. Sonnenschutz (morgens) sanft auftragen'
    ],
    en: [
      '1. Wash hands thoroughly with soap before touching your face',
      '2. Splash face with lukewarm water and gently massage a mild cleanser in circular motions',
      '3. Rinse thoroughly with clear water (lukewarm water preserves the natural skin barrier)',
      '4. Gently pat your face dry with a clean towel (pat, do not rub)',
      '5. Apply your daily moisturizer and sunscreen gently'
    ],
    es: [
      '1. Lavarse bien las manos con jabón antes de tocarse la cara',
      '2. Humedecer el rostro con agua tibia y masajear suavemente con limpiador facial',
      '3. Aclarar completamente con agua tibia para proteger la piel',
      '4. Secar suavemente a toquecitos con una toalla limpia (sin frotar)',
      '5. Aplicar crema hidratante y protector solar'
    ],
    el: [
      '1. Πλύνε καλά τα χέρια σου με σαπούνι πριν αγγίξεις το πρόσωπό σου',
      '2. Βρέξε το πρόσωπο με χλιαρό νερό και άπλωσε απαλά ένα ήπιο καθαριστικό',
      '3. Ξέπλυνε σχολαστικά με καθαρό νερό (το χλιαρό νερό προστατεύει την επιδερμίδα)',
      '4. Στέγνωσε το πρόσωπο ταμποναριστά με μια καθαρή πετσέτα (χωρίς τρίψιμο)',
      '5. Άπλωσε ενυδατική κρέμα και αντηλιακό'
    ],
    fr: [
      '1. Lave-toi les mains avec du savon avant de toucher ton visage',
      '2. Humidifie ton visage à l\'eau tiède et masse doucement avec un nettoyant doux',
      '3. Rince abondamment à l\'eau claire pour préserver la barrière cutanée',
      '4. Tamponne doucement ton visage avec une serviette propre (sans frotter)',
      '5. Applique ta crème hydratante et ta protection solaire'
    ],
    it: [
      '1. Lavati accuratamente le mani con il sapone prima di toccare il viso',
      '2. Inumidisci il viso con acqua tiepida e massaggia delicatamente un detergente viso',
      '3. Risciacqua abbondantemente con acqua pulita per proteggere la pelle',
      '4. Tampona delicatamente con un asciugamano pulito (senza strofinare)',
      '5. Applica crema idratante e protezione solare'
    ]
  },

  'Bett machen': {
    de: [
      '1. Bettdecke nach dem Aufstehen kurz zurückschlagen (Feuchtigkeit entweichen lassen)',
      '2. Kissen kräftig aufschütteln und glatt an das Kopfende legen',
      '3. Spannbettlaken an allen vier Ecken straff ziehen',
      '4. Bettdecke gleichmäßig und glatt über die Matratze ausbreiten',
      '5. Raum kurz stoßlüften – das Schlafzimmer wirkt sofort ruhig und ordentlich'
    ],
    en: [
      '1. Fold back the duvet for a few minutes upon waking to let humidity evaporate',
      '2. Fluff pillows firmly and place them neatly at the head of the bed',
      '3. Pull the fitted sheet taut across all four mattress corners',
      '4. Spread the duvet evenly and smoothly across the bed',
      '5. Open the window briefly – your bedroom instantly feels fresh and peaceful'
    ],
    es: [
      '1. Retirar el edredón unos minutos al levantarse para ventilar la humedad',
      '2. Ahuecar las almohadas con energía y colocarlas en el cabecero',
      '3. Estirar bien la sábana bajera en las cuatro esquinas',
      '4. Extender el edredón de forma lisa y uniforme sobre la cama',
      '5. Ventilar brevemente la habitación para un ambiente despejado y ordenado'
    ],
    el: [
      '1. Άνοιξε το πάπλωμα για λίγα λεπτά ώστε να φύγει η υγρασία',
      '2. Τίναξε καλά τα μαξιλάρια και τοποθέτησέ τα όμορφα στο κεφαλάρι',
      '3. Τέντωσε καλά το κατωσέντονο στις τέσσερις γωνίες',
      '4. Στρώσε το πάπλωμα ομοιόμορφα και ίσια σε όλο το κρεβάτι',
      '5. Άνοιξε το παράθυρο για λίγο – το δωμάτιο δείχνει αμέσως καθαρό και ήρεμο'
    ],
    fr: [
      '1. Rabats la couette quelques minutes au réveil pour aérer la literie',
      '2. Secoue énergiquement les oreillers et dispose-les en tête de lit',
      '3. Tire bien le drap-housse aux quatre coins du matelas',
      '4. Déploie la couette de manière lisse et harmonieuse',
      '5. Aère la pièce quelques minutes pour un sentiment immédiat d\'ordre et de fraîcheur'
    ],
    it: [
      '1. Ripiega indietro la coperta al risveglio per far evaporare l\'umidità',
      '2. Sprimaccia bene i cuscini e posizionali ordinati alla testata',
      '3. Tira bene il lenzuolo con angoli sui quattro lati',
      '4. Stendi la coperta in modo liscio e uniforme sul letto',
      '5. Arieggia brevemente la stanza per una sensazione immediata di freschezza'
    ]
  },

  'Durchlüften': {
    de: [
      '1. Heizkörper/Thermostat für die Dauer des Lüftens herunterdrehen (Energie sparen)',
      '2. Fenster in gegenüberliegenden Räumen weit öffnen für echten Durchzug (Stoßlüften)',
      '3. 5 bis 10 Minuten intensiv durchlüften (tauscht CO2 und Feuchtigkeit komplett aus)',
      '4. Alle Fenster wieder fest schließen (dauerhaftes Kippen vermeiden)',
      '5. Heizung wieder auf Wohlfühltemperatur einstellen & die frische Raumluft genießen'
    ],
    en: [
      '1. Turn down thermostats/heaters during airing to save energy',
      '2. Open windows fully in opposite rooms to create cross-ventilation (shock airing)',
      '3. Air out intensely for 5 to 10 minutes (fully replaces CO2 and indoor humidity)',
      '4. Close all windows firmly (avoid long-term tilted windows which cool walls)',
      '5. Reset heating to comfortable temperature & enjoy the crisp indoor air'
    ],
    es: [
      '1. Bajar la calefacción durante la ventilación para ahorrar energía',
      '2. Abrir ventanas opuestas de par en par para crear corriente cruzada',
      '3. Ventilar intensamente durante 5 a 10 minutos para renovar el aire y la humedad',
      '4. Cerrar bien todas las ventanas',
      '5. Reajustar la calefacción y disfrutar del aire fresco y renovado'
    ],
    el: [
      '1. Χαμήλωσε τη θέρμανση όσο αερίζεις για εξοικονόμηση ενέργειας',
      '2. Άνοιξε διάπλατα παράθυρα σε αντίθετα δωμάτια για να δημιουργηθεί ρεύμα',
      '3. Άφησε να αεριστεί καλά για 5-10 λεπτά ώστε να ανανεωθεί πλήρως ο αέρας',
      '4. Κλείσε καλά όλα τα παράθυρα',
      '5. Επανάφερε τη θέρμανση & απόλαυσε την καθαρή ατμόσφαιρα του σπιτιού'
    ],
    fr: [
      '1. Baisse le chauffage pendant l\'aération pour économiser l\'énergie',
      '2. Ouvre grand les fenêtres en créant un courant d\'air traversant',
      '3. Aère énergiquement pendant 5 à 10 minutes pour renouveler l\'air et évacuer l\'humidité',
      '4. Referme bien toutes les fenêtres (évite les fenêtres en oscillo-battant continu)',
      '5. Remets le chauffage à bonne température et profite de l\'air frais'
    ],
    it: [
      '1. Abbassa i termosifoni durante l\'aerazione per risparmiare energia',
      '2. Apri completamente le finestre creando corrente d\'aria tra le stanze',
      '3. Arieggia intensamente per 5-10 minuti per ricambiare l\'aria e l\'umidità',
      '4. Chiudi bene tutte le finestre',
      '5. Reimposta il riscaldamento e goditi l\'aria fresca e pulita'
    ]
  },

  'Kochen': {
    de: [
      '1. Rezept & Zutaten kurz prüfen, Arbeitsfläche freiräumen & Hände waschen',
      '2. Zutaten waschen, schälen und vorschneiden (Mise en Place spart Hektik beim Kochen)',
      '3. Pfanne/Topf erhitzen, etwas Öl zugeben und Zutaten nach Garzeiten anbraten/garen',
      '4. Mit Salz, Pfeffer, Kräutern und Gewürzen abschmecken und zwischendurch probieren',
      '5. Essen anrichten, Kochgeschirr kurz einweichen & Mahlzeit in Ruhe genießen'
    ],
    en: [
      '1. Review recipe/ingredients, clear your counter space & wash hands thoroughly',
      '2. Wash, peel and chop all ingredients first (Mise en place prevents kitchen stress)',
      '3. Heat pan or pot, add cooking oil, and cook ingredients in order of cooking time',
      '4. Season thoughtfully with salt, pepper, herbs, and taste as you go',
      '5. Plate your meal, soak used pans in warm water & enjoy your food mindfully'
    ],
    es: [
      '1. Revisar ingredientes, despejar la encimera y lavarse las manos',
      '2. Lavar, pelar y picar todos los ingredientes primero (mise en place)',
      '3. Calentar la sartén/olla con un poco de aceite y cocinar según los tiempos de cocción',
      '4. Sazonar con sal, pimienta y especias probando el sabor',
      '5. Servir el plato, poner utensilios a remojo y disfrutar de la comida'
    ],
    el: [
      '1. Έλεγξε τα υλικά, καθάρισε τον πάγκο της κουζίνας & πλύνε καλά τα χέρια σου',
      '2. Πλύνε, καθάρισε και κόψε όλα τα υλικά από πριν (Mise en place)',
      '3. Ζέστανε το σκεύος με λίγο λάδι και μαγείρεψε με βάση τον χρόνο ψησίματος',
      '4. Καρύκεψε με αλάτι, πιπέρι, μυρωδικά και δοκίμασε τη γεύση',
      '5. Σέρβιρε το φαγητό, μούλιασε τα μαγειρικά σκεύη & απόλαυσε το γεύμα σου'
    ],
    fr: [
      '1. Vérifie les ingrédients, dégage le plan de travail et lave-toi les mains',
      '2. Lave, épluche et découpe tous les ingrédients à l\'avance (mise en place)',
      '3. Fais chauffer poêle ou casserole avec un peu d\'huile et cuis selon les temps de cuisson',
      '4. Assaisonne avec sel, poivre, herbes et goûte au fur et à mesure',
      '5. Dresse ton assiette, fais tremper les ustensiles et savoure ton repas dans le calme'
    ],
    it: [
      '1. Controlla gli ingredienti, libera il piano di lavoro e lavati le mani',
      '2. Lava, sbuccia e taglia tutti gli ingredienti in anticipo (mise en place)',
      '3. Scalda la padella o pentola con un filo d\'olio e cuoci rispettando i tempi',
      '4. Condisci con sale, pepe ed erbe aromatiche assaggiando durante la cottura',
      '5. Impiatta, metti in ammollo le pentole usate e goditi il pasto in tranquillità'
    ]
  },

  'Zähne abends': {
    de: [
      '1. Zahnseide oder Interdentalbürste durch alle Zahnzwischenräume führen (löst Plaque)',
      '2. Erbsengroße Menge Zahnpasta auftragen und 2 Minuten gründlich im 45°-Winkel putzen',
      '3. Zunge sanft mit der Zahnbürste oder einem Zungenreiniger abbürsten',
      '4. Zahnschaum nur ausspucken (nicht mit viel Wasser nachspülen – Fluorid schützt über Nacht)',
      '5. Zahnbürste abspülen, aufrecht hinstellen & mit sauberem Mundgefühl ins Bett gehen'
    ],
    en: [
      '1. Use dental floss or an interdental brush between all teeth (clears plaque and food debris)',
      '2. Apply a pea-sized amount of toothpaste and brush thoroughly for 2 minutes at a 45° angle',
      '3. Gently brush the tongue with your toothbrush or tongue scraper',
      '4. Spit out excess foam (do not rinse heavily with water so fluoride protects overnight)',
      '5. Rinse your toothbrush, store upright and head to sleep with a fresh mouth'
    ],
    es: [
      '1. Pasar hilo dental o cepillo interdental entre todos los dientes para eliminar placa',
      '2. Aplicar pasta y cepillar a conciencia durante 2 minutos en ángulo de 45°',
      '3. Limpiar suavemente la lengua con el cepillo',
      '4. Escupir la espuma sin enjuagar con exceso de agua (el flúor actúa durante la noche)',
      '5. Aclarar el cepillo, dejarlo en vertical y dormir con la boca limpia y fresca'
    ],
    el: [
      '1. Χρησιμοποίησε οδοντικό νήμα ανάμεσα στα δόντια για απομάκρυνση της πλάκας',
      '2. Βάλε οδοντόκρεμα και βούρτσισε σχολαστικά για 2 λεπτά υπό γωνία 45°',
      '3. Βούρτσισε απαλά και την επιφάνεια της γλώσσας',
      '4. Φτύσε τον αφρό χωρίς πολύ νερό (το φθόριο προστατεύει το σμάλτο κατά τη διάρκεια της νύχτας)',
      '5. Ξέπλυνε την οδοντόβουρτσα, τοποθέτησέ την όρθια & κοιμήσου με φρεσκάδα'
    ],
    fr: [
      '1. Passe le fil dentaire ou une brossette entre toutes les dents pour retirer la plaque',
      '2. Dépose du dentifrice et brosse minutieusement pendant 2 minutes à 45°',
      '3. Brosse délicatement la surface de la langue',
      '4. Recrache la mousse sans rincer abondamment (le fluor protège l\'émail toute la nuit)',
      '5. Rince ta brosse, range-la debout et va te coucher avec une bouche parfaitement propre'
    ],
    it: [
      '1. Passa il filo interdentale tra tutti i denti per rimuovere la placca accumulata',
      '2. Spazzola accuratamente per 2 minuti con movimenti a 45° verso il bordo gengivale',
      '3. Spazzola delicatamente anche la superficie della lingua',
      '4. Sputa la schiuma senza risciacquare troppo (il fluoro lavora durante la notte)',
      '5. Risciacqua lo spazzolino, riponilo in verticale e vai a letto con la bocca pulita'
    ]
  },

  'Duschen': {
    de: [
      '1. Frisches Handtuch, Duschgel und Wechselkleidung griffbereit bereitlegen',
      '2. Wassertemperatur angenehm einstellen, Körper und Haare gründlich nass machen',
      '3. Duschgel / Seife mit den Händen oder einem Waschlappen von oben nach unten einseifen',
      '4. Seifenschaum vollständig abspülen & Duschwand/Fliesen kurz mit dem Abzieher abziehen',
      '5. Gründlich abtrocknen, Haut bei Bedarf eincremen & frische Kleidung anziehen'
    ],
    en: [
      '1. Set out a clean towel, body wash, and fresh clothes within easy reach',
      '2. Adjust water to a comfortable temperature, wet body and hair completely',
      '3. Lather body wash or soap gently from neck down to feet',
      '4. Rinse off all soap completely & squeegee the shower walls to prevent limescale',
      '5. Dry off thoroughly with your towel, moisturize skin if needed & put on fresh clothes'
    ],
    es: [
      '1. Preparar una toalla limpia, gel de ducha y ropa limpia a mano',
      '2. Ajustar la temperatura del agua y mojarse cuerpo y pelo',
      '3. Enjabonarse de arriba abajo con gel de ducha',
      '4. Aclarar todo el jabón y pasar la rasqueta por la mampara para evitar cal',
      '5. Secarse bien con la toalla, hidratar la piel y vestirse con ropa limpia'
    ],
    el: [
      '1. Ετοίμασε καθαρή πετσέτα, αφρόλουτρο και καθαρά ρούχα σε σημείο άμεσης πρόσβασης',
      '2. Ρύθμισε τη θερμοκρασία του νερού και βρέξε καλά σώμα και μαλλιά',
      '3. Άπλωσε το αφρόλουτρο με απαλές κινήσεις από πάνω προς τα κάτω',
      '4. Ξέπλυνε καλά όλο το σαπούνι & πέρασε το τζάμι της ντουζιέρας με το λάστιχο',
      '5. Σκούπισε καλά το σώμα με την πετσέτα, βάλε ενυδατική & φόρεσε καθαρά ρούχα'
    ],
    fr: [
      '1. Prépare une serviette propre, ton gel douche et des vêtements propres à portée de main',
      '2. Règle l\'eau à température agréable et mouille l\'ensemble du corps et des cheveux',
      '3. Savonne délicatement du haut vers le bas avec ton gel douche',
      '4. Rince abondamment tout le savon et passe la raclette sur la paroi de douche',
      '5. Sèche-toi soigneusement, hydrate ta peau si besoin et enfile des vêtements propres'
    ],
    it: [
      '1. Prepara un asciugamano pulito, bagnoschiuma e vestiti puliti a portata di mano',
      '2. Regola l\'acqua a temperatura gradevole e bagna completamente corpo e capelli',
      '3. Insapona con cura dall\'alto verso il basso con bagnoschiuma',
      '4. Risciacqua via tutto il sapone e passa il tiravetri sulle pareti della doccia',
      '5. Asciugati bene con il telo, idrata la pelle se necessario e indossa abiti freschi'
    ]
  }
};

window.TASK_STEPS_DATABASE_PART1 = TASK_STEPS_DATABASE_PART1;
globalThis.TASK_STEPS_DATABASE_PART1 = TASK_STEPS_DATABASE_PART1;
