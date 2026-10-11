/**
 * @file data-tasks-steps-3.js
 * @module DataTaskStepsSelfcareAndMaintenance
 * @description
 * Mehrsprachige Schritt-für-Schritt-Anleitungen (Micro-Steps) für Entsorgung,
 * Körperpflege und periodische Wohnungsarbeiten (`DE`, `EN`, `ES`, `EL`, `FR`, `IT`).
 */
const TASK_STEPS_DATABASE_PART3 = {
  'Müll wegbringen': {
    de: [
      '1. Alle Räume kurz abgleichen: Restmüll, Plastik/Gelber Sack, Biomüll & Altpapier kontrollieren',
      '2. Volle Müllbeutel oben fest verknoten und griffbereit an die Wohnungstür stellen',
      '3. Mülleimer kurz auf Flecken prüfen, ggf. auswischen und direkt neue Müllbeutel einlegen',
      '4. Müllbeutel zu den Außentonnen bringen und ordentlich in die richtigen Tonnen einsortieren',
      '5. Zurückkommen, Hände gründlich mit Seife waschen – der Kopf ist sofort wieder frei!'
    ],
    en: [
      '1. Do a quick round across all rooms: check general waste, recycling, compost, and paper bins',
      '2. Tie full trash bags firmly at the top and stage them by the front door',
      '3. Check inside trash cans for spills, wipe if needed, and insert fresh bin liners immediately',
      '4. Take bags outside to the main bins and sort into the correct recycling containers',
      '5. Return inside, wash hands thoroughly with soap & enjoy a fresh, clutter-free home'
    ],
    es: [
      '1. Revisar todas las habitaciones: basura general, envases, orgánico y papel',
      '2. Atar bien las bolsas llenas y colocarlas junto a la puerta de salida',
      '3. Comprobar que los cubos estén limpios y poner bolsas nuevas de inmediato',
      '4. Bajar las bolsas a los contenedores exteriores separando correctamente el reciclaje',
      '5. Volver a casa, lavarse bien las manos y disfrutar del espacio despejado'
    ],
    el: [
      '1. Έλεγξε όλους τους κάδους στο σπίτι: σύμμεικτα, ανακύκλωση, οργανικά και χαρτί',
      '2. Δέσε σφιχτά τις γεμάτες σακούλες και βάλτες κοντά στην εξώπορτα',
      '3. Βεβαιώσου ότι οι κάδοι είναι καθαροί και βάλε αμέσως καινούργιες σακούλες',
      '4. Πήγαινε τα σκουπίδια στους εξωτερικούς κάδους ξεχωρίζοντας σωστά την ανακύκλωση',
      '5. Επίστρεψε, πλύνε σχολαστικά τα χέρια σου & νιώσε την ανακούφιση'
    ],
    fr: [
      '1. Fais le tour de toutes les pièces : poubelle générale, tri sélectif, compost et papier',
      '2. Noue solidement les sacs pleins et dépose-les près de la porte d\'entrée',
      '3. Vérifie la propreté des bacs et remets immédiatement un sac propre dans chaque poubelle',
      '4. Descends les sacs aux conteneurs extérieurs en respectant les consignes de tri',
      '5. Rentre, lave-toi soigneusement les mains et savoure la propreté de ton intérieur'
    ],
    it: [
      '1. Fai il giro delle stanze: controlla indifferenziata, plastica, umido e carta',
      '2. Chiudi bene i sacchetti pieni e posizionali vicino alla porta d\'ingresso',
      '3. Verifica che i bidoni siano puliti e inserisci subito i sacchetti nuovi',
      '4. Porta i rifiuti ai cassonetti esterni differenziandoli con cura',
      '5. Rientra a casa, lavati bene le mani e goditi la sensazione di ordine e pulizia'
    ]
  },

  'Pfandflaschen wegbringen': {
    de: [
      '1. Alle leeren Pfandflaschen und Dosen aus Küche, Zimmern und Vorrat zusammensuchen',
      '2. In eine stabile Trage- oder Pfandtasche packen (schwere Glasflaschen nach unten, Dosen/PET nach oben)',
      '3. Tasche mitnehmen zum Supermarkt oder Getränkemarkt',
      '4. Flaschen zügig in den Leergutautomaten einführen und Pfandbon ausdrucken',
      '5. Pfandbon an der Kasse bar auszahlen lassen oder direkt vom nächsten Einkauf abziehen'
    ],
    en: [
      '1. Collect all empty deposit bottles and cans from kitchen, desk, and pantry areas',
      '2. Pack them in a sturdy tote bag (heavy glass at the bottom, lightweight PET/cans on top)',
      '3. Take the bag with you on your next grocery trip',
      '4. Feed containers into the return machine and press the button for your voucher',
      '5. Redeem the voucher at the cash register or deduct it directly from your groceries'
    ],
    es: [
      '1. Reunir todas las botellas retornables y latas vacías de la casa',
      '2. Colocarlas en una bolsa resistente (el vidrio abajo, las latas y plástico arriba)',
      '3. Llevar la bolsa al supermercado o punto de reciclaje',
      '4. Introducir los envases en la máquina de devolución y recoger el ticket',
      '5. Canjear el ticket en caja o descontarlo de la compra'
    ],
    el: [
      '1. Μάζεψε όλα τα άδεια επιστρεφόμενα μπουκάλια και κουτάκια από το σπίτι',
      '2. Τοποθέτησέ τα σε μια ανθεκτική τσάντα (τα γυάλινα στον πάτο, τα ελαφριά πάνω)',
      '3. Πάρε την τσάντα μαζί σου στο σούπερ μάρκετ',
      '4. Βάλε τα μπουκάλια στο μηχάνημα επιστροφής και πάρε το κουπόνι',
      '5. Εξαργύρωσε το κουπόνι στο ταμείο ή χρησιμοποίησέ το στα ψώνια σου'
    ],
    fr: [
      '1. Rassemble toutes les bouteilles et canettes consignées de la maison',
      '2. Range-les dans un sac solide (bouteilles en verre au fond, plastique et canettes au-dessus)',
      '3. Emporte le sac lors de tes prochaines courses',
      '4. Insère les bouteilles dans l\'automate de reprise et récupère ton ticket',
      '5. Fais déduire le bon d\'achat en caisse pour tes courses'
    ],
    it: [
      '1. Raccogli tutte le bottiglie con vuoto a rendere e le lattine vuote di casa',
      '2. Disponile in una borsa resistente (vetro sul fondo, plastica e alluminio sopra)',
      '3. Porta la borsa con te al supermercato',
      '4. Inserisci i vuoti nella macchina automatica e ritira lo scontrino di rimborso',
      '5. Fatti scalare l\'importo direttamente alla cassa per la spesa'
    ]
  },

  'Haare waschen': {
    de: [
      '1. Haare vor dem Duschen kurz durchbürsten (löst Knoten, Staub & Produktreste)',
      '2. Haare unter der Dusche mit lauwarmem Wasser vollständig durchnässen',
      '3. Haselnussgroße Menge Shampoo sanft mit den Fingerspitzen in die Kopfhaut einmassieren',
      '4. Gründlich mit klarem Wasser ausspülen, bis das Wasser vollkommen schaumfrei ist',
      '5. Conditioner/Spülung in die Längen und Spitzen geben, 1-2 Min. einwirken lassen, kalt ausspülen & sanft ausdrücken'
    ],
    en: [
      '1. Brush hair gently before showering to detangle and remove styling residues',
      '2. Wet hair thoroughly with warm water from roots to ends',
      '3. Massage a hazelnut-sized amount of shampoo gently into the scalp using your fingertips',
      '4. Rinse thoroughly with clear water until hair is completely foam-free',
      '5. Apply conditioner to mid-lengths and ends, leave for 1-2 mins, rinse with cool water & gently squeeze dry'
    ],
    es: [
      '1. Cepillar el pelo antes de la ducha para desenredar y eliminar restos de productos',
      '2. Mojar el cabello completamente con agua tibia',
      '3. Masajear una pequeña cantidad de champú con las yemas de los dedos en el cuero cabelludo',
      '4. Aclarar abundantemente con agua hasta que no quede espuma',
      '5. Aplicar acondicionador en puntas, dejar actuar 1-2 minutos, aclarar con agua fresca y secar suave'
    ],
    el: [
      '1. Χτένισε απαλά τα μαλλιά πριν το ντους για να ξεμπερδευτούν',
      '2. Βρέξε καλά τα μαλλιά με χλιαρό νερό από τη ρίζα ως τις άκρες',
      '3. Κάνε απαλό μασάζ με λίγο σαμπουάν στο τριχωτό της κεφαλής',
      '4. Ξέπλυνε πολύ καλά με καθαρό νερό μέχρι να φύγει όλος ο αφρός',
      '5. Βάλε μαλακτική κρέμα στις άκρες, άφησε 1-2 λεπτά, ξέπλυνε με δροσερό νερό & στέγνωσε ταμποναριστά'
    ],
    fr: [
      '1. Brosse doucement tes cheveux avant la douche pour démêler et éliminer les résidus',
      '2. Mouille abondamment les cheveux à l\'eau tiède des racines aux pointes',
      '3. Masse délicatement une noisette de shampoing sur le cuir chevelu du bout des doigts',
      '4. Rince minutieusement à l\'eau claire jusqu\'à disparition totale de la mousse',
      '5. Applique l\'après-shampoing sur les pointes, laisse agir 1-2 min, rince à l\'eau fraîche et essore doucement'
    ],
    it: [
      '1. Spazzola delicatamente i capelli prima della doccia per districare i nodi',
      '2. Bagna completamente i capelli con acqua tiepida dalle radici alle punte',
      '3. Massaggia una noce di shampoo sul cuoio capelluto con i polpastrelli',
      '4. Risciacqua abbondantemente finché l\'acqua non scorre senza residui di schiuma',
      '5. Applica il balsamo sulle lunghezze e punte, lascia agire 1-2 minuti, risciacqua con acqua fresca e tampona'
    ]
  },

  'Haare schneiden': {
    de: [
      '1. Wunschfrisur/Länge überlegen oder Beispielfoto bereithalten / Friseurtermin abstimmen',
      '2. Haare vorher waschen oder vom Friseur professionell vorbereiten lassen',
      '3. Schnittwünsche, Kanten und Übergänge vorab klar kommunizieren (oder Aufsatz bei DIY-Trimmen wählen)',
      '4. Haare schneiden lassen bzw. Konturen/Bart vorsichtig und mit ruhiger Hand trimmen',
      '5. Schnitt im Spiegel von allen Seiten prüfen, lose Härchen abfegen & das gepflegte Frischegefühl genießen'
    ],
    en: [
      '1. Decide on desired hairstyle/length or save reference photos / book barber appointment',
      '2. Wash hair beforehand or have it prepared at the salon',
      '3. Clearly communicate preferred length and fades (or choose correct guard size for DIY trim)',
      '4. Execute haircut / trim contours with a steady hand',
      '5. Check result in mirror from all angles, brush off loose hairs & enjoy your sharp, refreshed look'
    ],
    es: [
      '1. Pensar el estilo deseado o guardar foto de referencia / pedir cita en la peluquería',
      '2. Lavarse el pelo antes o dejar que lo preparen en la peluquería',
      '3. Explicar claramente el corte deseado (o elegir el cabezal adecuado para recorte casero)',
      '4. Realizar el corte o perfilar contornos con calma y precisión',
      '5. Revisar el resultado en el espejo, limpiar pelos sueltos y disfrutar del nuevo look'
    ],
    el: [
      '1. Επίλεξε το επιθυμητό κούρεμα/μήκος ή κλείσε ραντεβού στο κομμωτήριο',
      '2. Λούσε τα μαλλιά πριν ή άφησε τον κομμωτή να τα προετοιμάσει',
      '3. Εξήγησε ξεκάθαρα το στυλ που θέλεις (ή επίλεξε τη σωστή σκάλα αν κουρεύεσαι μόνος)',
      '4. Προχώρησε στο κούρεμα / τριμάρισμα περιγράμματος με σταθερό χέρι',
      '5. Έλεγξε το αποτέλεσμα στον καθρέφτη από όλες τις πλευρές & απόλαυσε την περιποιημένη εμφάνιση'
    ],
    fr: [
      '1. Réfléchis à la coupe souhaitée ou prépare une photo / prends rendez-vous chez le coiffeur',
      '2. Lave tes cheveux au préalable ou laisse le salon s\'en charger',
      '3. Explique précisément la longueur et les contours (ou choisis le bon sabot en cas de coupe maison)',
      '4. Réalise la coupe ou ajuste les contours avec précision',
      '5. Vérifie le résultat sous tous les angles dans le miroir, brosse les petits cheveux et profite de ta coupe nette'
    ],
    it: [
      '1. Scegli il taglio desiderato o salva una foto di riferimento / prenota dal parrucchiere',
      '2. Lava i capelli prima o affidati alla preparazione in salone',
      '3. Spiega chiaramente lunghezza e sfumatura (o scegli la misura del pettine per il fai-da-te)',
      '4. Esegui il taglio o rifinisci i contorni con mano ferma e precisa',
      '5. Controlla il risultato allo specchio su tutti i lati, spazzola via i capelli tagliati e goditi il nuovo look'
    ]
  },

  'Bettwäsche tauschen': {
    de: [
      '1. Altes Bettzeug (Kissenbezüge, Bettbezug, Spannbettlaken) komplett abziehen und in den Wäschekorb legen',
      '2. Kissen und Bettdecke am geöffneten Fenster kräftig aufschütteln und 10 Min. auslüften lassen',
      '3. Matratze kurz absaugen oder wenden',
      '4. Frisches Spannbettlaken straff aufziehen, Kissen und Bettdecke neu beziehen',
      '5. Bettdecke glatt ausbreiten – das herrlich duftende, frische Bett für den Abend ist fertig!'
    ],
    en: [
      '1. Strip old pillowcases, duvet cover, and fitted sheet completely and toss into the laundry hamper',
      '2. Shake pillows and duvet vigorously by an open window and let them air out for 10 minutes',
      '3. Vacuum mattress surface lightly or flip it if needed',
      '4. Fit fresh sheet tautly over the mattress, then slip clean covers onto pillows and duvet',
      '5. Smooth out the fresh bedspread – your wonderfully crisp, clean bed is ready for tonight!'
    ],
    es: [
      '1. Quitar todas las fundas de almohada, edredón y sábana bajera y llevarlas al cesto',
      '2. Sacudir almohadas y edredón en la ventana abierta y dejar ventilar 10 minutos',
      '3. Aspirar ligeramente el colchón o darle la vuelta',
      '4. Colocar la sábana bajera limpia bien estirada y poner fundas nuevas a almohadas y edredón',
      '5. Extender la cama de forma lisa; lista para descansar en ropa de cama fresca y limpia'
    ],
    el: [
      '1. Αφαίρεσε μαξιλαροθήκες, παπλωματοθήκη και κατωσέντονο και βάλτα στα άπλυτα',
      '2. Τίναξε καλά μαξιλάρια και πάπλωμα στο ανοιχτό παράθυρο και άφησέ τα να αεριστούν για 10 λεπτά',
      '3. Σκούπισε ελαφρώς το στρώμα με την ηλεκτρική σκούπα',
      '4. Στρώσε τεντωμένο το καθαρό κατωσέντονο και βάλε καθαρές θήκες σε μαξιλάρια και πάπλωμα',
      '5. Στρώσε όμορφα το κρεβάτι – το φρεσκοπλυμένο κρεβάτι για το βράδυ είναι έτοιμο'
    ],
    fr: [
      '1. Retire complètement taies d\'oreiller, housse de couette et drap-housse et mets-les au panier à linge',
      '2. Secoue énergiquement oreillers et couette près de la fenêtre ouverte et laisse aérer 10 minutes',
      '3. Aspire légèrement la surface du matelas ou retourne-le',
      '4. Installe un drap-housse propre bien tendu, puis enfile les taies et la housse de couette propres',
      '5. Lisse la couette – ton lit frais, doux et accueillant est prêt pour la nuit !'
    ],
    it: [
      '1. Sfodera cuscini, piumino e togli il lenzuolo con angoli mettendoli nel cesto della biancheria',
      '2. Scuoti energicamente cuscini e piumone vicino alla finestra aperta lasciandoli arieggiare per 10 minuti',
      '3. Aspira leggermente la superficie del materasso',
      '4. Infila il lenzuolo pulito ben teso e metti le federe e il copripiumino freschi',
      '5. Stendi bene la coperta – il tuo letto profumato e pulito è pronto per questa sera!'
    ]
  },

  'Nägel schneiden': {
    de: [
      '1. Nagelknipser / Nagelschere und Nagelfeile bereitlegen (nach dem Duschen/Händewaschen sind Nägel weicher)',
      '2. Fingernägel in sanfter natürlicher Rundung gleichmäßig kürzen (nicht zu tief an den Rändern einschneiden)',
      '3. Fußnägel immer GERADE schneiden (verhindert das schmerzhafte Einwachsen in die Haut)',
      '4. Kanten mit der Feile sanft in eine Richtung glätten, um Splittern und Einreißen zu verhindern',
      '5. Hände/Füße kurz abspülen und Nägel sowie Nagelhaut mit etwas Handcreme oder Nagelöl pflegen'
    ],
    en: [
      '1. Have nail clippers and an emery board ready (nails are softer after showering or washing hands)',
      '2. Trim fingernails evenly following their natural slight curve (avoid cutting too deep into side edges)',
      '3. Always trim toenails STRAIGHT across (prevents painful ingrown nails)',
      '4. Smooth rough edges with a nail file in one direction to prevent snagging and tearing',
      '5. Rinse hands/feet and apply a drop of moisturizer or cuticle oil to nourish the nail beds'
    ],
    es: [
      '1. Preparar cortaúñas o tijeras y lima (las uñas están más blandas después de la ducha)',
      '2. Cortar las uñas de las manos siguiendo su curva natural (sin apurar demasiado los lados)',
      '3. Cortar las uñas de los pies siempre RECTAS para evitar que se encarnen',
      '4. Limar los bordes en una sola dirección para dejarlos suaves y evitar roturas',
      '5. Enjuagar y aplicar un poco de crema hidratante en uñas y cutículas'
    ],
    el: [
      '1. Ετοίμασε νυχοκόπτη και λίμα (τα νύχια είναι πιο μαλακά μετά το ντους)',
      '2. Κόψε τα νύχια των χεριών ακολουθώντας τη φυσική τους καμπύλη',
      '3. Κόψε τα νύχια των ποδιών πάντα ΙΣΙΑ (αποτρέπει το επώδυνο είσφρυση νυχιού)',
      '4. Λίμαρε τις άκρες προς μία κατεύθυνση για να μην σπάνε',
      '5. Ξέπλυνε και άπλωσε λίγη ενυδατική κρέμα σε χέρια και πετσάκια'
    ],
    fr: [
      '1. Prépare coupe-ongles et lime (les ongles sont plus souples après la douche)',
      '2. Coupe les ongles des mains en suivant leur courbe naturelle (sans couper trop court sur les côtés)',
      '3. Coupe les ongles des pieds toujours DROITS pour éviter les ongles incarnés',
      '4. Lime doucement les bords dans un seul sens pour éviter qu\'ils ne s\'accrochent',
      '5. Rince et applique une touche de crème hydratante sur les mains et cuticules'
    ],
    it: [
      '1. Prepara tagliaunghie o forbicine e lima (le unghie sono più morbide dopo la doccia)',
      '2. Taglia le unghie delle mani seguendo la loro naturale curvatura (senza tagliare troppo ai lati)',
      '3. Taglia le unghie dei piedi sempre DRITTE per prevenire unghie incarnite',
      '4. Lima i bordi in un\'unica direzione per renderli lisci ed evitare sfaldamenti',
      '5. Sciacqua e applica una crema idratante su mani e cuticole'
    ]
  },

  'Türe/Fenster putzen': {
    de: [
      '1. Fensterbank & Türrahmen freiräumen; Eimer mit warmem Wasser, Spülmittel & Glasreiniger bereitstellen',
      '2. Zuerst Türrahmen, Griffe & Fensterrahmen von Staub und Fingerabdrücken feucht abwischen',
      '3. Glasscheibe mit Einwascher oder weichem Schwamm kreisend einschäumen (löst Schmutz & Pollen)',
      '4. Mit dem Gummiabzieher in leicht überlappenden Bahnen von oben nach unten abziehen (Gummilippe zwischendurch am Tuch abwischen)',
      '5. Ecken und Kanten mit trockenem Waffel-/Mikrofasertuch nachwischen & streifenfreien Glanz genießen'
    ],
    en: [
      '1. Clear windowsills and doorways; prepare a bucket with warm water, dish soap & glass cleaner',
      '2. Wipe door frames, handles, and window frames first with a damp cloth to remove loose grime',
      '3. Lather window glass with a scrubber sponge in circular motions to dissolve dust and water spots',
      '4. Pull squeegee from top to bottom in overlapping vertical strokes (wipe rubber blade on dry cloth between strokes)',
      '5. Dry edges and frames with a clean microfiber waffle cloth for a completely streak-free finish'
    ],
    es: [
      '1. Despejar el alféizar; preparar un cubo con agua tibia, jabón y limpiacristales',
      '2. Limpiar primero marcos de puertas, pomos y marcos de ventanas con un paño húmedo',
      '3. Enjabonar los cristales con una esponja suave en movimientos circulares',
      '4. Pasar la rasqueta de goma de arriba abajo secando la goma con un trapo en cada pasada',
      '5. Secar los bordes con microfibra limpia para un acabado brillante y sin marcas'
    ],
    el: [
      '1. Άδειασε το περβάζι & ετοίμασε κουβά με χλιαρό νερό, σαπούνι και καθαριστικό τζαμιών',
      '2. Σκούπισε πρώτα τα κουφώματα, τα πόμολα και τα πλαίσια με νωπό πανί',
      '3. Άπλωσε σαπουνάδα στα τζάμια με σφουγγάρι με κυκλικές κινήσεις',
      '4. Πέρνα το λάστιχο τζαμιών από πάνω προς τα κάτω σκουπίζοντας το λάστιχο ενδιάμεσα',
      '5. Σκούπισε τις γωνίες με στεγνό πανί μικροϊνών για αστραφτερό αποτέλεσμα χωρίς θαμπάδες'
    ],
    fr: [
      '1. Dégage les rebords de fenêtre ; prépare un seau d\'eau tiède avec liquide vaisselle et produit vitres',
      '2. Nettoie d\'abord les encadrements de porte, poignées et cadres de fenêtre au chiffon humide',
      '3. Savonne la vitre avec une éponge douce en effectuant des mouvements circulaires',
      '4. Passe la raclette du haut vers le bas en bandes chevauchantes (essuie le caoutchouc entre chaque bande)',
      '5. Essuie les bords avec un chiffon microfibre propre pour une transparence parfaite et sans traces'
    ],
    it: [
      '1. Libera il davanzale; prepara un secchio con acqua tiepida, detergente piatti e lavavetri',
      '2. Pulisci prima infissi, maniglie e telai con un panno umido per rimuovere la polvere',
      '3. Insapona i vetri con una spugna morbida con movimenti circolari',
      '4. Passa il tergivetro dall\'alto verso il basso (asciuga la gomma sul panno a ogni passata)',
      '5. Asciuga i bordi con un panno in microfibra asciutto per una lucentezza senza aloni'
    ]
  },

  'Herd & Kühlschrank putzen': {
    de: [
      '1. Kühlschrank prüfen: Abgelaufenes entsorgen, Lebensmittel kurz herausstellen & Fächer von oben nach unten feucht mit Essig-/Spülwasser auswischen',
      '2. Kühlschrank-Dichtungen abwischen, Böden trockenreiben & Lebensmittel sortiert zurückstellen',
      '3. Kochfeld & Backofen mit Fettlöser oder Spülmittel einsprühen und 5-10 Minuten einwirken lassen',
      '4. Eingebranntes und Fettreste mit einem feuchten Schwamm mühelos aufnehmen',
      '5. Mit klarem Wasser nachwischen und mit einem Mikrofasertuch auf Hochglanz polieren'
    ],
    en: [
      '1. Fridge reset: discard expired items, temporarily move food to counter & wipe shelves top to bottom with warm soapy water',
      '2. Clean rubber door seals, dry shelves with a cloth & return food neatly organized',
      '3. Spray stovetop and oven surfaces with degreaser or dish soap solution (let sit 5-10 mins to dissolve grease)',
      '4. Wipe away dissolved grease and cooked-on splatters effortlessly with a damp sponge',
      '5. Rinse with clean water and buff chrome/glass surfaces with a microfiber cloth for a sparkling shine'
    ],
    es: [
      '1. Nevera: tirar alimentos caducados, sacar comida y limpiar baldas de arriba a abajo con agua y vinagre',
      '2. Limpiar las gomas de la puerta, secar baldas y colocar los alimentos ordenados',
      '3. Pulverizar desengrasante en placa y horno y dejar actuar 5-10 minutos',
      '4. Retirar la grasa ablandada y restos quemados con una esponja húmeda',
      '5. Aclarar con agua limpia y secar con microfibra para que brille'
    ],
    el: [
      '1. Ψυγείο: πέταξε τα ληγμένα, βγάλε προσωρινά τα τρόφιμα & σκούπισε τα ράφια από πάνω προς τα κάτω με ξιδόνερο',
      '2. Καθάρισε τα λάστιχα της πόρτας, στέγνωσε τα ράφια & τακτοποίησε τα τρόφιμα',
      '3. Ψέκασε λιποκαθαριστικό στις εστίες και στον φούρνο και άφησε να δράσει για 5-10 λεπτά',
      '4. Σκούπισε τα λίπη και τους λεκέδες εύκολα με ένα νωπό σφουγγάρι',
      '5. Ξέπλυνε με καθαρό νερό και γυάλισε με πανί μικροϊνών'
    ],
    fr: [
      '1. Réfrigérateur : jette les périmés, sors les aliments et nettoie les étagères du haut en bas à l\'eau tiède vinaigrée',
      '2. Nettoie les joints de porte, sèche au chiffon et réorganise les aliments par compartiments',
      '3. Vaporise le dégraissant sur la plaque de cuisson et le four (laisse agir 5 à 10 min)',
      '4. Essuie la graisse dissoute et les éclaboussures sans forcer avec une éponge humide',
      '5. Rince à l\'eau claire et lustre au chiffon microfibre pour un éclat étincelant'
    ],
    it: [
      '1. Frigorifero: elimina alimenti scaduti, sposta il cibo e pulisci i ripiani dall\'alto verso il basso con acqua e aceto',
      '2. Pulisci le guarnizioni, asciuga bene i ripiani e rimetti il cibo in modo ordinato',
      '3. Spruzza lo sgrassatore sul piano cottura e forno lasciando agire per 5-10 minuti',
      '4. Rimuovi grasso e residui incrostati con una spugna umida senza fatica',
      '5. Risciacqua con acqua pulita e lucida con panno in microfibra'
    ]
  }
};

window.TASK_STEPS_DATABASE_PART3 = TASK_STEPS_DATABASE_PART3;
globalThis.TASK_STEPS_DATABASE_PART3 = TASK_STEPS_DATABASE_PART3;
