// app-radio-news.js: High-End Live Radio Stations, Minimal Calming News Lounge & Feature Guide
// 100% Serverless, Zero-PHP, GitHub Pages compatible, Anti-Sensory-Overload & Neurodivergent-optimized

(function() {
  'use strict';

  // ============================================================================
  // 1. DATA: RADIO STATIONS, LANGUAGES, REGIONS, FEED MODES & SOURCES
  // ============================================================================

  const RADIO_STATIONS = [
    // 🇩🇪 Deutschland
    { id: 'dlf', name: 'Deutschlandfunk', category: 'news', country: 'de', flag: '🇩🇪', desc: 'Nachrichten, Politik, Wissen & Kultur', stream: 'https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3', logo: '📻' },
    { id: 'ndrinfo', name: 'NDR Info', category: 'news', country: 'de', flag: '🇩🇪', desc: 'Das Informationsradio für den Norden', stream: 'https://icecast.ndr.de/ndr/ndrinfo/hamburg/mp3/128/stream.mp3', logo: '🎙️' },
    { id: 'wdr5', name: 'WDR 5', category: 'news', country: 'de', flag: '🇩🇪', desc: 'Tiefgang, Analysen & Wissensmagazine', stream: 'https://wdr-wdr5-live.icecastssl.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3', logo: '🎙️' },
    { id: 'br24', name: 'BR24 Live', category: 'news', country: 'de', flag: '🇩🇪', desc: 'In 15 Minuten umfassend informiert', stream: 'https://dispatcher.rndfnk.com/br/br24/live/mp3/mid', logo: '📢' },
    { id: 'swraktuell', name: 'SWR Aktuell', category: 'news', country: 'de', flag: '🇩🇪', desc: 'Nachrichten, Interviews & Verkehr', stream: 'https://liveradio.swr.de/sw282p3/swraktuell/play.mp3', logo: '📻' },

    // 🇦🇹 Österreich & 🇨🇭 Schweiz
    { id: 'oe1', name: 'Ö1 Kultur & Info', category: 'news', country: 'at', flag: '🇦🇹', desc: 'Wissen, Kultur & fundierte Nachrichten', stream: 'https://orf-live.ors-shoutcast.at/oe1-q2a', logo: '🇦🇹' },
    { id: 'oe3', name: 'Hitradio Ö3', category: 'music', country: 'at', flag: '🇦🇹', desc: 'Österreichs beliebtes Hitradio', stream: 'https://orf-live.ors-shoutcast.at/oe3-q2a', logo: '🎵' },
    { id: 'srf1', name: 'SRF 1 Info & Musik', category: 'news', country: 'ch', flag: '🇨🇭', desc: 'Schweizer Radio & Nachrichten', stream: 'https://stream.srg-ssr.ch/m/drs1/mp3_128', logo: '🇨🇭' },
    { id: 'swisspop', name: 'Radio Swiss Pop', category: 'music', country: 'ch', flag: '🇨🇭', desc: 'Entspannter Pop-Mix ohne Unterbrechung', stream: 'https://stream.srg-ssr.ch/m/rsp/mp3_128', logo: '🎶' },

    // 🇬🇧 UK & 🇺🇸 USA & 🌐 Global
    { id: 'bbcworld', name: 'BBC World Service', category: 'news', country: 'uk', flag: '🇬🇧', desc: 'Global news, reports & analysis', stream: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service', logo: '🌍' },
    { id: 'npr', name: 'NPR 24/7 News', category: 'news', country: 'us', flag: '🇺🇸', desc: 'National Public Radio Live Stream', stream: 'https://npr-ice.streamguys1.com/live.mp3', logo: '🌐' },
    { id: 'franceinfo', name: 'France Info Live', category: 'news', country: 'fr', flag: '🇫🇷', desc: 'Actualités en direct et informations 24/7', stream: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3', logo: '🇫🇷' },
    { id: 'rne', name: 'Radio Nacional España', category: 'news', country: 'es', flag: '🇪🇸', desc: 'Noticias y actualidad en directo', stream: 'https://rtvelivestream.akamaized.net/rne_r1_main.mp3', logo: '🇪🇸' },
    { id: 'rai1', name: 'Rai Radio 1', category: 'news', country: 'it', flag: '🇮🇹', desc: 'Informazione e approfondimenti 24h', stream: 'https://icstream.rai.it/1.mp3', logo: '🇮🇹' },
    { id: 'ertproto', name: 'ΕΡΤ Πρώτο Πρόγραμμα', category: 'news', country: 'gr', flag: '🇬🇷', desc: 'Δημόσια ραδιοφωνία & ενημέρωση', stream: 'https://radiostreaming.ert.gr/ert-proto', logo: '🏛️' },

    // 🧘 Focus & Chill Soundscapes
    { id: 'groovesalad', name: 'SomaFM Groove Salad', category: 'focus', country: 'global', flag: '🧘', desc: 'Downtempo Ambient & Chilled Electronic', stream: 'https://ice1.somafm.com/groovesalad-128-mp3', logo: '🥗' },
    { id: 'dronezone', name: 'SomaFM Drone Zone', category: 'focus', country: 'global', flag: '🌌', desc: 'Tiefer Ambient Space & Fokus-Soundscapes', stream: 'https://ice1.somafm.com/dronezone-128-mp3', logo: '🧘' },
    { id: 'lush', name: 'SomaFM Lush Chill', category: 'focus', country: 'global', flag: '🎧', desc: 'Sanfter Lofi Chill & Vocal Atmospheres', stream: 'https://ice1.somafm.com/lush-128-mp3', logo: '☕' }
  ];

  // 1.1 SPRACHE (Ausgabesprache & automatische Übersetzung)
  const NEWS_LANGUAGES = [
    { id: 'de', name: 'Deutsch', flag: '🇩🇪', ttsLang: 'de-DE' },
    { id: 'en', name: 'English', flag: '🇬🇧', ttsLang: 'en-US' },
    { id: 'es', name: 'Español', flag: '🇪🇸', ttsLang: 'es-ES' },
    { id: 'fr', name: 'Français', flag: '🇫🇷', ttsLang: 'fr-FR' },
    { id: 'it', name: 'Italiano', flag: '🇮🇹', ttsLang: 'it-IT' },
    { id: 'el', name: 'Ελληνικά', flag: '🇬🇷', ttsLang: 'el-GR' }
  ];

  // 1.2 REGION & HERKUNFT (Lokaler Kontext)
  const REGIONS = [
    { id: 'global', name: 'Global', flag: '🌐', label: 'International', defaultLang: 'en' },
    { id: 'de', name: 'Deutschland', flag: '🇩🇪', label: 'Deutschland', defaultLang: 'de' },
    { id: 'at', name: 'Österreich', flag: '🇦🇹', label: 'Österreich', defaultLang: 'de' },
    { id: 'ch', name: 'Schweiz', flag: '🇨🇭', label: 'Schweiz', defaultLang: 'de' },
    { id: 'uk', name: 'UK', flag: '🇬🇧', label: 'Großbritannien', defaultLang: 'en' },
    { id: 'us', name: 'USA', flag: '🇺🇸', label: 'Vereinigte Staaten', defaultLang: 'en' },
    { id: 'fr', name: 'France', flag: '🇫🇷', label: 'Frankreich', defaultLang: 'fr' },
    { id: 'es', name: 'España', flag: '🇪🇸', label: 'Spanien', defaultLang: 'es' },
    { id: 'it', name: 'Italia', flag: '🇮🇹', label: 'Italien', defaultLang: 'it' },
    { id: 'gr', name: 'Ελλάδα', flag: '🇬🇷', label: 'Griechenland', defaultLang: 'el' }
  ];

  // 1.3 FEED-MODUS: Wechselnd Global ⟷ Lokal (wie vom Nutzer gewünscht)
  const FEED_MODES = [
    { id: 'hybrid', name: 'Wechselnd (Global ⟷ Lokal)', shortName: 'Wechselnd', icon: '🔀', desc: 'Internationale & lokale Meldungen im Wechsel' },
    { id: 'local', name: 'Nur Lokal', shortName: 'Nur Lokal', icon: '📍', desc: 'Ausschließlich Meldungen der gewählten Region' },
    { id: 'global', name: 'Nur International', shortName: 'Nur Global', icon: '🌐', desc: 'Ausschließlich weltweite Meldungen' }
  ];

  // 1.4 KATEGORIEN / THEMEN
  const CATEGORIES = [
    { id: 'all', name: 'Alle Themen', emoji: '✨' },
    { id: 'top', name: 'Top News', emoji: '🚨' },
    { id: 'tech', name: 'Tech & KI', emoji: '🤖' },
    { id: 'science', name: 'Wissen & Natur', emoji: '🔬' },
    { id: 'goodnews', name: 'Good News', emoji: '🌟' },
    { id: 'business', name: 'Wirtschaft', emoji: '💼' },
    { id: 'culture', name: 'Kultur', emoji: '🎭' }
  ];

  // 1.5 DIVERSE LOKALE MEDIEN & QUELLEN PRO REGION
  const LOCAL_MEDIA_OUTLETS = {
    de: [
      { id: 'all', name: 'Alle Quellen (Mix)', icon: '✨' },
      { id: 'tagesschau', name: 'Tagesschau', match: ['tagesschau'], rss: 'https://www.tagesschau.de/xml/rss2/' },
      { id: 'spiegel', name: 'Spiegel Online', match: ['spiegel'], rss: 'https://www.spiegel.de/schlagzeilen/index.rss' },
      { id: 'zeit', name: 'Zeit Online', match: ['zeit'], rss: 'https://newsfeed.zeit.de/index' },
      { id: 'heise', name: 'Heise Tech', match: ['heise'], rss: 'https://www.heise.de/rss/heise-atom.xml' },
      { id: 'handelsblatt', name: 'Handelsblatt', match: ['handelsblatt'], rss: 'https://www.handelsblatt.com/contentexport/feed/top-themen' },
      { id: 'sueddeutsche', name: 'Süddeutsche Zeitung', match: ['süddeutsche', 'sz'], rss: 'https://rss.sueddeutsche.de/rss/Topthemen' },
      { id: 'goodnews', name: 'Good News DE', match: ['good news', 'positive'], rss: 'https://goodnews.eu/feed/' }
    ],
    at: [
      { id: 'all', name: 'Alle Quellen (Mix)', icon: '✨' },
      { id: 'orf', name: 'ORF News', match: ['orf'], rss: 'https://rss.orf.at/news.xml' },
      { id: 'standard', name: 'Der Standard', match: ['standard'], rss: 'https://www.derstandard.at/rss' },
      { id: 'kurier', name: 'Kurier', match: ['kurier'], rss: 'https://kurier.at/xml/rss' },
      { id: 'presse', name: 'Die Presse', match: ['presse'], rss: 'https://www.diepresse.com/rss/Home' },
      { id: 'salzburger', name: 'Salzburger Nachrichten', match: ['salzburger', 'sn'], rss: 'https://www.sn.at/rss' },
      { id: 'goodnews', name: 'Good News AT', match: ['good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    ch: [
      { id: 'all', name: 'Alle Quellen (Mix)', icon: '✨' },
      { id: 'srf', name: 'SRF News', match: ['srf'], rss: 'https://www.srf.ch/news/bnf/rss/1646' },
      { id: 'nzz', name: 'NZZ', match: ['nzz'], rss: 'https://www.nzz.ch/recent.rss' },
      { id: 'tagesanzeiger', name: 'Tages-Anzeiger', match: ['tages-anzeiger', 'tagesanzeiger'], rss: 'https://www.tagesanzeiger.ch/rss' },
      { id: 'srf_digital', name: 'SRF Digital', match: ['srf digital'], rss: 'https://www.srf.ch/news/bnf/rss/1648' },
      { id: 'letemps', name: 'Le Temps', match: ['temps'], rss: 'https://www.letemps.ch/rss' },
      { id: 'goodnews', name: 'Good News CH', match: ['good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    uk: [
      { id: 'all', name: 'All Media (Mix)', icon: '✨' },
      { id: 'bbc', name: 'BBC News', match: ['bbc'], rss: 'https://feeds.bbci.co.uk/news/rss.xml' },
      { id: 'guardian', name: 'The Guardian', match: ['guardian'], rss: 'https://www.theguardian.com/uk/rss' },
      { id: 'reuters', name: 'Reuters UK', match: ['reuters'], rss: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best' },
      { id: 'independent', name: 'The Independent', match: ['independent'], rss: 'https://www.independent.co.uk/news/uk/rss' },
      { id: 'ft', name: 'Financial Times', match: ['ft', 'financial times'], rss: 'https://www.ft.com/rss/home/uk' },
      { id: 'positive_news', name: 'Positive News', match: ['positive'], rss: 'https://www.positive.news/feed/' }
    ],
    us: [
      { id: 'all', name: 'All Media (Mix)', icon: '✨' },
      { id: 'npr', name: 'NPR News', match: ['npr'], rss: 'https://feeds.npr.org/1001/rss.xml' },
      { id: 'techcrunch', name: 'TechCrunch', match: ['techcrunch'], rss: 'https://techcrunch.com/feed/' },
      { id: 'wired', name: 'Wired', match: ['wired'], rss: 'https://www.wired.com/feed/rss' },
      { id: 'sciam', name: 'Scientific American', match: ['scientific'], rss: 'http://rss.sciam.com/ScientificAmerican-Global' },
      { id: 'cnbc', name: 'CNBC', match: ['cnbc'], rss: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
      { id: 'ap', name: 'Associated Press', match: ['ap', 'associated press'], rss: 'https://apnews.com/feed' },
      { id: 'goodnews', name: 'Good News Network', match: ['good news'], rss: 'https://www.goodnewsnetwork.org/feed/' }
    ],
    fr: [
      { id: 'all', name: 'Tous les médias (Mix)', icon: '✨' },
      { id: 'franceinfo', name: 'France Info', match: ['france info'], rss: 'https://www.francetvinfo.fr/titres.rss' },
      { id: 'lemonde', name: 'Le Monde', match: ['lemonde', 'le monde'], rss: 'https://www.lemonde.fr/rss/une.xml' },
      { id: 'lefigaro', name: 'Le Figaro', match: ['le figaro', 'figaro'], rss: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
      { id: 'rfi', name: 'RFI', match: ['rfi'], rss: 'https://www.rfi.fr/fr/general/rss' },
      { id: 'lesechos', name: 'Les Echos', match: ['echos'], rss: 'https://www.lesechos.fr/rss' },
      { id: 'goodnews', name: 'Good News FR', match: ['good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    es: [
      { id: 'all', name: 'Todos los medios (Mix)', icon: '✨' },
      { id: 'elpais', name: 'El País', match: ['el país', 'el pais'], rss: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' },
      { id: 'rtve', name: 'RTVE Noticias', match: ['rtve'], rss: 'https://www.rtve.es/api/noticias.rss' },
      { id: 'elmundo', name: 'El Mundo', match: ['el mundo'], rss: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml' },
      { id: 'efe', name: 'Agencia EFE', match: ['efe'], rss: 'https://efe.com/feed/' },
      { id: 'abc', name: 'ABC España', match: ['abc'], rss: 'https://www.abc.es/rss/feeds/abc_EspanaEspana.xml' },
      { id: 'cincodias', name: 'Cinco Días', match: ['cinco'], rss: 'https://cincodias.elpais.com/rss' },
      { id: 'goodnews', name: 'Buenas Noticias', match: ['buenas', 'good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    it: [
      { id: 'all', name: 'Tutti i media (Mix)', icon: '✨' },
      { id: 'ansa', name: 'ANSA Top', match: ['ansa'], rss: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml' },
      { id: 'corriere', name: 'Corriere della Sera', match: ['corriere'], rss: 'https://xml2.corriereobjects.it/rss/homepage.xml' },
      { id: 'repubblica', name: 'La Repubblica', match: ['repubblica'], rss: 'https://www.repubblica.it/rss/homepage/rss2.0.xml' },
      { id: 'rainews', name: 'Rai News', match: ['rai'], rss: 'https://www.rainews.it/rss/tutti' },
      { id: 'ilsole', name: 'Il Sole 24 Ore', match: ['sole', '24 ore'], rss: 'https://www.ilsole24ore.com/rss/primapagina.xml' },
      { id: 'lastampa', name: 'La Stampa', match: ['stampa'], rss: 'https://www.lastampa.it/rss' },
      { id: 'goodnews', name: 'Buone Notizie IT', match: ['buone', 'good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    gr: [
      { id: 'all', name: 'Όλα τα Μέσα (Mix)', icon: '✨' },
      { id: 'ert', name: 'ΕΡΤ News', match: ['ερτ', 'ert'], rss: 'https://www.ertnews.gr/feed/' },
      { id: 'kathimerini', name: 'Καθημερινή', match: ['καθημερινή', 'kathimerini'], rss: 'https://www.kathimerini.gr/rss' },
      { id: 'capital', name: 'Capital.gr', match: ['capital'], rss: 'https://www.capital.gr/rss' },
      { id: 'techblog', name: 'Techblog GR', match: ['techblog'], rss: 'https://techblog.gr/feed/' },
      { id: 'tovima', name: 'Το Βήμα', match: ['βήμα', 'vima'], rss: 'https://www.tovima.gr/feed/' },
      { id: 'protothema', name: 'Πρώτο Θέμα', match: ['θέμα', 'thema'], rss: 'https://www.protothema.gr/rss' },
      { id: 'skai', name: 'ΣΚΑΪ News', match: ['σκαϊ', 'skai'], rss: 'https://www.skai.gr/rss' }
    ],
    global: [
      { id: 'all', name: 'All Global Media (Mix)', icon: '✨' },
      { id: 'bbc_world', name: 'BBC World Service', match: ['bbc'], rss: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
      { id: 'reuters', name: 'Reuters Global', match: ['reuters'], rss: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best' },
      { id: 'wired', name: 'Wired Global', match: ['wired'], rss: 'https://www.wired.com/feed/rss' },
      { id: 'nature', name: 'Nature Science', match: ['nature'], rss: 'https://www.nature.com/nature.rss' },
      { id: 'ap_world', name: 'Associated Press', match: ['ap'], rss: 'https://apnews.com/feed' },
      { id: 'goodnews', name: 'Good News Network', match: ['good news'], rss: 'https://www.goodnewsnetwork.org/feed/' }
    ]
  };

  // 1.6 INTERAKTIVER FUNKTIONS-GUIDE (24 TIPPS - Nur repräsentative klickbare Icons, saubere Typografie)
  const FEATURE_TIPS_DATA = [
    {
      action: 'dice', icon: 'dices',
      actionTitle: { de: 'Würfel werfen', en: 'Roll dice', es: 'Lanzar dado', fr: 'Lancer le dé', it: 'Lancia il dado', el: 'Ρίξτε το ζάρι' },
      text: {
        de: 'Unentschlossen bei der Aufgabenauswahl? Der Würfel trifft eine schnelle Entscheidung.',
        en: 'Unsure which task to tackle next? The Decision Dice makes a fast choice.',
        es: '¿Indeciso sobre qué tarea hacer? El dado de decisión elige por ti.',
        fr: 'Indécis pour votre prochaine tâche ? Le Dé de décision choisit pour vous.',
        it: 'Indeciso su quale attività fare? Il Dado delle decisioni sceglie per te.',
        el: 'Αναποφάσιστοι για την επόμενη εργασία; Το Ζάρι επιλογής αποφασίζει άμεσα.'
      }
    },
    {
      action: 'alarm', icon: 'bell',
      actionTitle: { de: 'Wecker & Timer', en: 'Alarm & Timer', es: 'Alarmas y temporizador', fr: 'Réveil & Minuteur', it: 'Sveglie e timer', el: 'Ξυπνητήρι & Χρονόμετρο' },
      text: {
        de: 'Praktische Countdown-Timer, Intervallpausen und Terminerinnerungen einstellen.',
        en: 'Set countdown timers, interval breaks and punctual task reminders.',
        es: 'Configura temporizadores, pausas de intervalo y recordatorios puntuales.',
        fr: 'Réglez minuteurs, pauses d\'intervalle et rappels de rendez-vous.',
        it: 'Imposta timer per il conto alla rovescia, pause e promemoria puntuali.',
        el: 'Ρυθμίστε χρονόμετρα αντίστροφης μέτρησης, διαλείμματα και υπενθυμίσεις.'
      }
    },
    {
      action: 'sound', icon: 'headphones',
      actionTitle: { de: 'Sound Studio', en: 'Sound Studio', es: 'Estudio de sonido', fr: 'Studio sonore', it: 'Studio suoni', el: 'Στούντιο Ήχου' },
      text: {
        de: 'Beruhigende Naturklänge, atmosphärische LoFi-Musik und DJ-Decks für optimalen Fokus.',
        en: 'Calming ambient soundscapes, LoFi music and DJ decks for maximum focus.',
        es: 'Sonidos ambientales relajantes, música LoFi y platos DJ para máxima concentración.',
        fr: 'Ambiance sonore apaisante, musique LoFi et platines DJ pour une concentration totale.',
        it: 'Suoni rilassanti della natura, musica LoFi e consolle DJ per concentrarti al meglio.',
        el: 'Χαλαρωτικοί ήχοι φύσης, μουσική LoFi και κονσόλες DJ για απόλυτη εστίαση.'
      }
    },
    {
      action: 'cooking', icon: 'chef-hat',
      actionTitle: { de: 'Kochen & Rezepte', en: 'Cooking & Recipes', es: 'Cocina y recetas', fr: 'Cuisine & Recettes', it: 'Cucina & Ricette', el: 'Μαγειρική & Συνταγές' },
      text: {
        de: 'Kochen und smarte Rezepte, Küchen-Timer und Portionsrechner für schnelle Mahlzeiten.',
        en: 'Smart recipes, kitchen timers and ingredient portion calculators.',
        es: 'Recetas inteligentes, temporizadores de cocina y calculadora de raciones.',
        fr: 'Recettes intelligentes, minuteurs de cuisson et calculateur de portions.',
        it: 'Ricette intelligenti, timer da cucina e calcolatore delle porzioni.',
        el: 'Έξυπνες συνταγές, χρονόμετρα μαγειρικής και υπολογιστής μερίδων.'
      }
    },
    {
      action: 'shopping', icon: 'shopping-cart',
      actionTitle: { de: 'Einkaufsliste', en: 'Shopping List', es: 'Lista de compras', fr: 'Liste de courses', it: 'Lista della spesa', el: 'Λίστα αγορών' },
      text: {
        de: 'Smarte Einkaufsliste mit automatischem Wochen-Spar-Radar und Kategorien.',
        en: 'Smart grocery list with weekly deal radar and categorized items.',
        es: 'Lista de la compra inteligente con radar de ofertas semanales.',
        fr: 'Liste de courses intelligente avec radar de réductions hebdomadaires.',
        it: 'Lista della spesa intelligente con radar offerte della settimana.',
        el: 'Έξυπνη λίστα αγορών με ραντάρ εβδομαδιαίων προσφορών.'
      }
    },
    {
      action: 'pause', icon: 'heart-pulse',
      actionTitle: { de: 'Pause & Erholung', en: 'Pause & Recovery', es: 'Pausa y recuperación', fr: 'Pause & Récupération', it: 'Pausa & Recupero', el: 'Παύση & Ηρεμία' },
      text: {
        de: 'Geführte Atemübungen zur sofortigen Nervensystem-Beruhigung (Box-Breathing).',
        en: 'Guided breathing exercises for instant nervous system reset (Box Breathing).',
        es: 'Ejercicios de respiración guiada para calmar el sistema nervioso al instante.',
        fr: 'Exercices de respiration guidée pour apaiser le système nerveux immédiatement.',
        it: 'Esercizi di respirazione guidata per resettare subito la mente.',
        el: 'Καθοδηγούμενες ασκήσεις αναπνοής για άμεση ηρεμία και χαλάρωση.'
      }
    },
    {
      action: 'health', icon: 'activity',
      actionTitle: { de: 'Gesundheit & Vitalität', en: 'Health & Vitality', es: 'Salud y vitalidad', fr: 'Santé & Vitalité', it: 'Salute & Vitalità', el: 'Υγεία & Ευεξία' },
      text: {
        de: 'Tägliche Trinkziele, Bewegungspausen und Vitalitäts-Tracking im Blick behalten.',
        en: 'Track daily hydration goals, movement breaks and vitality habits.',
        es: 'Seguimiento de hidratación diaria, pausas de movimiento y hábitos de salud.',
        fr: 'Suivi quotidien de l\'hydratation, pauses actives et vitalité.',
        it: 'Monitora idratazione quotidiana, pause attive e vitalità.',
        el: 'Παρακολούθηση ημερήσιου στόχου νερού, κίνησης και ευεξίας.'
      }
    },
    {
      action: 'brainstorm', icon: 'brain',
      actionTitle: { de: 'Brainstorming Studio', en: 'Brainstorming Studio', es: 'Estudio de ideas', fr: 'Studio d\'idées', it: 'Studio idee', el: 'Στούντιο Ιδεών' },
      text: {
        de: 'Spontane Ideen, Mindmaps und schnelle Gedanken blitzschnell festhalten.',
        en: 'Capture spontaneous thoughts, mindmaps and rapid inspiration instantly.',
        es: 'Guarda ideas espontáneas, mapas mentales y notas al instante.',
        fr: 'Notez vos éclairs de génie, cartes mentales et idées spontanées.',
        it: 'Annota subito idee spontanee, mappe mentali e pensieri rapidi.',
        el: 'Καταγράψτε άμεσα αυθόρμητες ιδέες, νοητικούς χάρτες και σημειώσεις.'
      }
    },
    {
      action: 'clean', icon: 'sparkles',
      actionTitle: { de: 'Clean-Coach', en: 'Clean Coach', es: 'Entrenador de limpieza', fr: 'Coach Rangement', it: 'Coach Riordino', el: 'Clean Coach' },
      text: {
        de: 'Strukturierte 10-Minuten-Aufräumsprints für frische Energie in deinem Raum.',
        en: 'Structured 10-minute speed cleaning sprints for fresh room energy.',
        es: 'Sprints guiados de limpieza de 10 minutos para renovar tu espacio.',
        fr: 'Sessions éclair de rangement de 10 minutes pour aérer votre espace.',
        it: 'Sessioni guidate di riordino da 10 minuti per rinfrescare il tuo ambiente.',
        el: 'Σύντομα σπριντ καθαριότητας 10 λεπτών για ανανέωση του χώρου σας.'
      }
    },
    {
      action: 'learning', icon: 'graduation-cap',
      actionTitle: { de: 'Lern-Labor', en: 'Learning Hub', es: 'Centro de aprendizaje', fr: 'Pôle Apprentissage', it: 'Hub Apprendimento', el: 'Κέντρο Μάθησης' },
      text: {
        de: 'Wissens-Hub und interaktive Karteikarten mit Spaced Repetition für dauerhaften Lernerfolg.',
        en: 'Learning Hub and interactive flashcards with spaced repetition for lasting learning retention.',
        es: 'Centro de Aprendizaje y tarjetas mnemotécnicas con repetición espaciada para aprender mejor.',
        fr: 'Pôle Apprentissage et cartes mémoire interactives avec répétition espacée pour mieux mémoriser.',
        it: 'Hub di Apprendimento e flashcard interattive con ripetizione spaziata per memorizzare a lungo.',
        el: 'Κέντρο Μάθησης και διαδραστικές κάρτες επανάληψης (flashcards) για σταθερή απομνημόνευση.'
      }
    },
    {
      action: 'humor', icon: 'smile',
      actionTitle: { de: 'Fun-Labor', en: 'Fun Lab', es: 'Laboratorio de humor', fr: 'Labo Humour', it: 'Laboratorio Buonumore', el: 'Fun-Labor' },
      text: {
        de: 'Aufmunternde Witze, Meme-Sounds und Anti-Stress-Soundboard für gute Laune.',
        en: 'Uplifting jokes, funny memes and anti-stress soundboard for a smile.',
        es: 'Chistes reconfortantes, memes y caja de efectos para desconectar con humor.',
        fr: 'Blagues amusantes, mèmes et boîte à sons anti-stress pour garder le sourire.',
        it: 'Battute divertenti, meme e soundboard antistress per ritrovare il buonumore.',
        el: 'Ευχάριστα αστεία, meme και soundboard χαλάρωσης για θετική διάθεση.'
      }
    },
    {
      action: 'zen', icon: 'eye',
      actionTitle: { de: 'Zen-Modus', en: 'Zen Mode', es: 'Modo Zen', fr: 'Mode Zen', it: 'Modalità Zen', el: 'Λειτουργία Zen' },
      text: {
        de: 'Maximal ablenkungsfreie Arbeitsansicht für puren Flow und Ruhe.',
        en: 'Distraction-free minimalist workspace for pure focus and clarity.',
        es: 'Espacio minimalista sin distracciones para fluir con tranquilidad.',
        fr: 'Espace minimaliste sans distraction pour un état de flow absolu.',
        it: 'Modalità minimalista senza distrazioni per concentrazione assoluta.',
        el: 'Περιβάλλον χωρίς περισπασμούς για απόλυτη ροή και ηρεμία.'
      }
    },
    {
      action: 'cmd', icon: 'command',
      actionTitle: { de: 'Befehlspalette', en: 'Command Palette', es: 'Paleta de comandos', fr: 'Palette de commandes', it: 'Tavolozza comandi', el: 'Παλέτα εντολών' },
      text: {
        de: 'Spotlight-Befehlspalette für Blitz-Aktionen, Navigation und globale Suche.',
        en: 'Spotlight command palette for instant actions, navigation and search.',
        es: 'Paleta de comandos Spotlight para acciones rápidas y búsqueda global.',
        fr: 'Palette de commandes Spotlight pour raccourcis instantanés et recherche.',
        it: 'Tavolozza dei comandi Spotlight per azioni rapide e ricerca globale.',
        el: 'Παλέτα εντολών Spotlight για αστραπιαίες ενέργειες και αναζήτηση.'
      }
    },
    {
      action: 'columns', icon: 'sliders',
      actionTitle: { de: 'Karten anpassen', en: 'Customize Cards', es: 'Personalizar tarjetas', fr: 'Personnaliser cartes', it: 'Personalizza schede', el: 'Προσαρμογή καρτών' },
      text: {
        de: 'Eigene Spalten anpassen, ausblenden, umordnen oder neue Karten anlegen.',
        en: 'Customize columns, reorder, show, hide or create brand new lists.',
        es: 'Personaliza columnas, reordena, muestra, oculta o crea nuevas listas.',
        fr: 'Personnalisez vos colonnes, réorganisez, masquez ou créez de nouvelles cartes.',
        it: 'Personalizza le colonne, riordina, mostra, nascondi o crea nuove schede.',
        el: 'Προσαρμόστε στήλες, αποκρύψτε, ταξινομήστε ή δημιουργήστε νέες κάρτες.'
      }
    },
    {
      action: 'clear', icon: 'eraser',
      actionTitle: { de: 'Erledigte aufräumen', en: 'Clear completed', es: 'Archivar completadas', fr: 'Archiver terminées', it: 'Archivia completate', el: 'Καθαρισμός ολοκληρωμένων' },
      text: {
        de: 'Erledigte Aufgaben mit einem Handgriff ins Archiv verschieben und Platz schaffen.',
        en: 'Move completed tasks to the archive with one click to keep boards tidy.',
        es: 'Archiva todas las tareas completadas de una vez y despeja tu tablero.',
        fr: 'Archivez toutes les tâches terminées en un clic pour faire de la place.',
        it: 'Archivia le attività completate con un clic per liberare spazio.',
        el: 'Αρχειοθετήστε τις ολοκληρωμένες εργασίες με ένα κλικ και κρατήστε τον πίνακα καθαρό.'
      }
    },
    {
      action: 'stats', icon: 'bar-chart-2',
      actionTitle: { de: 'Statistik öffnen', en: 'Open Stats', es: 'Ver estadísticas', fr: 'Voir statistiques', it: 'Vedi statistiche', el: 'Προβολή στατιστικών' },
      text: {
        de: 'Erledigte Aufgaben, Wochenfortschritt und deinen persönlichen Flow-Score analysieren.',
        en: 'Inspect completed tasks, weekly progress and your personal flow score.',
        es: 'Analiza tareas completadas, progreso semanal y tu puntuación de flujo.',
        fr: 'Analysez vos tâches accomplies, progrès hebdomadaire et score de flux.',
        it: 'Analizza le attività completate, il progresso settimanale e il flow score.',
        el: 'Αναλύστε ολοκληρωμένες εργασίες, εβδομαδιαία πρόοδο και flow score.'
      }
    },
    {
      action: 'theme', icon: 'palette',
      actionTitle: { de: 'Themes & Farben', en: 'Themes & Colors', es: 'Temas y colores', fr: 'Thèmes & Couleurs', it: 'Temi & Colori', el: 'Θέματα & Χρώματα' },
      text: {
        de: 'Farben und Kontraste mit über 15 abgestimmten Themes für Tag und Nacht anpassen.',
        en: 'Fine-tune colors and contrast with 15+ curated themes for day and night.',
        es: 'Personaliza colores y contraste con más de 15 temas pensados para tus ojos.',
        fr: 'Ajustez couleurs et contrastes avec plus de 15 thèmes adaptés jour et nuit.',
        it: 'Regola colori e contrasti con oltre 15 temi studiati per il comfort visivo.',
        el: 'Προσαρμόστε χρώματα και αντιθέσεις με 15+ επιλεγμένα θέματα ημέρας και νύχτας.'
      }
    },
    {
      action: 'team', icon: 'users',
      actionTitle: { de: 'Team-Board', en: 'Team Board', es: 'Tablero de equipo', fr: 'Tableau d\'équipe', it: 'Bacheca di squadra', el: 'Πίνακας Ομάδας' },
      text: {
        de: 'Zwischen privatem Bereich und Team-Board wechseln, um live zusammenzuarbeiten.',
        en: 'Switch between private workspace and team board for live collaboration.',
        es: 'Alterna entre espacio privado y tablero de equipo para colaborar en tiempo real.',
        fr: 'Basculez entre espace privé et tableau d\'équipe pour collaborer en direct.',
        it: 'Alterna tra spazio privato e bacheca di squadra per collaborare dal vivo.',
        el: 'Εναλλαγή μεταξύ προσωπικού χώρου και πίνακα ομάδας για ζωντανή συνεργασία.'
      }
    },
    {
      action: 'tts', icon: 'volume-2',
      actionTitle: { de: 'Audio-Vorlesen', en: 'Read Aloud', es: 'Lectura de voz', fr: 'Lecture vocale', it: 'Lettura vocale', el: 'Φωνητική ανάγνωση' },
      text: {
        de: 'Aktuelle Schlagzeilen und Nachrichten mit angenehmer Stimme vorlesen lassen.',
        en: 'Listen to current headlines and briefings read aloud with natural speech.',
        es: 'Escucha los titulares y noticias actuales narrados con voz natural.',
        fr: 'Écoutez les gros titres et actualités lus à voix haute avec synthèse vocale.',
        it: 'Ascolta i titoli delle notizie letti ad alta voce con sintesi vocale naturale.',
        el: 'Ακούστε τους τρέχοντες τίτλους ειδήσεων με φυσική φωνητική ανάγνωση.'
      }
    },
    {
      action: 'timer', icon: 'timer',
      actionTitle: { de: 'Timer starten', en: 'Start timer', es: 'Iniciar temporizador', fr: 'Démarrer minuteur', it: 'Avvia timer', el: 'Έναρξη χρονομέτρου' },
      text: {
        de: 'Den Fokus-Timer starten, um hochkonzentriert an einer Aufgabe zu arbeiten.',
        en: 'Start the focus timer to work with deep concentration on your task.',
        es: 'Inicia el temporizador de enfoque para trabajar con máxima concentración.',
        fr: 'Lancez le minuteur de concentration pour travailler avec une attention absolue.',
        it: 'Avvia il timer di concentrazione per lavorare con la massima attenzione.',
        el: 'Ξεκινήστε το χρονόμετρο εστίασης για βαθιά συγκέντρωση στην εργασία σας.'
      }
    },
    {
      action: 'cmd', icon: 'mouse-pointer',
      actionTitle: { de: 'Schnell-Optionen', en: 'Quick Options', es: 'Opciones rápidas', fr: 'Options rapides', it: 'Opzioni rapide', el: 'Γρήγορες επιλογές' },
      text: {
        de: 'Über Aufgaben gleiten, um Prioritäten, Fälligkeiten und Timer aufzudecken.',
        en: 'Hover over tasks to reveal quick actions, priorities and timers.',
        es: 'Pasa el ratón sobre una tarea para ver opciones rápidas, prioridad y temporizador.',
        fr: 'Survolez les tâches pour découvrir options rapides, priorités et minuteurs.',
        it: 'Passa sulle attività per scoprire azioni rapide, priorità e timer.',
        el: 'Περάστε το ποντίκι πάνω από εργασίες για γρήγορες επιλογές, προτεραιότητα και χρονόμετρο.'
      }
    },
    {
      action: 'steps', icon: 'list-checks',
      actionTitle: { de: 'Schritte aufteilen', en: 'Break into steps', es: 'Dividir en pasos', fr: 'Diviser en étapes', it: 'Dividi in passaggi', el: 'Διαίρεση σε βήματα' },
      text: {
        de: 'Komplexe Aufgaben in mundgerechte Teil-Schritte für sofortige Klarheit zerlegen.',
        en: 'Break complex tasks down into bite-sized actionable steps for instant clarity.',
        es: 'Divide tareas complejas en pasos pequeños y accionables para ganar claridad.',
        fr: 'Décomposez les tâches complexes en étapes simples pour une clarté immédiate.',
        it: 'Scomponi compiti complessi in piccoli passaggi per la massima chiarezza.',
        el: 'Χωρίστε σύνθετες εργασίες σε απλά βήματα για άμεση σαφήνεια.'
      }
    },
    {
      action: 'columns', icon: 'move',
      actionTitle: { de: 'Karten sortieren', en: 'Organize cards', es: 'Ordenar tarjetas', fr: 'Trier les cartes', it: 'Ordina schede', el: 'Ταξινόμηση καρτών' },
      text: {
        de: 'Aufgaben per Drag & Drop mit der Maus nahtlos in deinen Listen anordnen.',
        en: 'Reorder tasks seamlessly across lists with fluid mouse drag & drop.',
        es: 'Organiza tareas arrastrando y soltando con el ratón de forma totalmente fluida.',
        fr: 'Réorganisez vos tâches de façon fluide par simple glisser-déposer.',
        it: 'Riordina le attività trascinandole con il mouse in modo fluido e naturale.',
        el: 'Ταξινομήστε εργασίες με ομαλό σύρσιμο και απόθεση (Drag & Drop).'
      }
    },
    {
      action: 'undo', icon: 'rotate-ccw',
      actionTitle: { de: 'Rückgängig machen', en: 'Undo action', es: 'Deshacer acción', fr: 'Annuler action', it: 'Annulla azione', el: 'Αναίρεση ενέργειας' },
      text: {
        de: 'Versehentlich gelöschte oder veränderte Aufgaben sofort wiederherstellen.',
        en: 'Instantly restore accidentally deleted or changed tasks with full history.',
        es: 'Restaura al instante cualquier tarea borrada o modificada por error.',
        fr: 'Restaurez immédiatement toute tâche supprimée ou modifiée par erreur.',
        it: 'Ripristina subito qualsiasi attività cancellata o modificata per errore.',
        el: 'Επαναφέρετε αμέσως εργασίες που διαγράφηκαν ή άλλαξαν κατά λάθος.'
      }
    }
  ];

  // Abwärtskompatible String-Arrays
  const FEATURE_TIPS = {
    de: FEATURE_TIPS_DATA.map(d => d.text.de),
    en: FEATURE_TIPS_DATA.map(d => d.text.en),
    es: FEATURE_TIPS_DATA.map(d => d.text.es),
    fr: FEATURE_TIPS_DATA.map(d => d.text.fr),
    it: FEATURE_TIPS_DATA.map(d => d.text.it),
    el: FEATURE_TIPS_DATA.map(d => d.text.el)
  };

  // 1.7 CURATED MULTILINGUAL NEWS DATABASE (100% Offline-fähig, hochkarätig übersetzt in 6 Sprachen)
  const FALLBACK_NEWS_DATABASE = {
    de: [
      {
        source: 'Tagesschau', outletId: 'tagesschau', category: 'top', time: 'vor 8 Min', url: 'https://www.tagesschau.de',
        translations: {
          de: { title: 'EU beschließt neues Digitalpaket für Verbraucherschutz & faire Online-Märkte', summary: 'Strengere Transparenzregeln für Algorithmen und vereinfachte Kündigungen von Online-Abos ab sofort wirksam.' },
          en: { title: 'EU enacts comprehensive digital consumer protection and fair market act', summary: 'Stricter algorithmic transparency and streamlined cancellation of online subscriptions take effect.' },
          es: { title: 'La UE aprueba un nuevo paquete digital para la protección del consumidor y mercados justos', summary: 'Reglas más estrictas de transparencia para algoritmos y cancelaciones sencillas de suscripciones online.' },
          fr: { title: 'L\'UE adopte un nouveau paquet numérique pour la protection des consommateurs', summary: 'Règles renforcées de transparence algorithmique et résiliation simplifiée des abonnements en ligne.' },
          it: { title: 'L\'UE approva il nuovo pacchetto digitale a tutela dei consumatori e mercati equi', summary: 'Regole più severe di trasparenza per gli algoritmi e disdetta semplificata degli abbonamenti online.' },
          el: { title: 'Η ΕΕ ψηφίζει νέο ψηφιακό πακέτο για την προστασία των καταναλωτών και δίκαιες αγορές', summary: 'Αυστηρότεροι κανόνες διαφάνειας αλγορίθμων και απλοποιημένη ακύρωση διαδικτυακών συνδρομών.' }
        }
      },
      {
        source: 'Spiegel Online', outletId: 'spiegel', category: 'top', time: 'vor 15 Min', url: 'https://www.spiegel.de',
        translations: {
          de: { title: 'Investitionen in erneuerbare Energien erreichen Rekord: 58% des Stroms aus Wind & Sonne', summary: 'Über 58 Prozent des bundesweiten Strombedarfs stammten im letzten Quartal aus Wind- und Solarkraft.' },
          en: { title: 'Renewable energy hits historic high: 58% of power generated from wind and solar', summary: 'Over 58 percent of nationwide electricity demand was supplied by wind and solar in the recent quarter.' },
          es: { title: 'Las renovables marcan récord histórico: 58% de la electricidad procede de eólica y solar', summary: 'Más del 58 por ciento de la demanda nacional de electricidad provino de fuentes eólicas y solares.' },
          fr: { title: 'Les énergies renouvelables battent un record : 58% d\'électricité issue de l\'éolien et du solaire', summary: 'Plus de 58% des besoins électriques nationaux ont été couverts par le vent et le soleil au dernier trimestre.' },
          it: { title: 'Le energie rinnovabili segnano il record: il 58% dell\'elettricità da eolico e solare', summary: 'Oltre il 58% del fabbisogno elettrico nazionale proviene da fonti eoliche e solari nell\'ultimo trimestre.' },
          el: { title: 'Ρεκόρ ανανεώσιμων πηγών ενέργειας: 58% της ηλεκτρικής ενέργειας από αιολική και ηλιακή', summary: 'Πάνω από το 58% της εθνικής ζήτησης καλύφθηκε από αιολική και ηλιακή ενέργεια το πρόσφατο τρίμηνο.' }
        }
      },
      {
        source: 'Heise Tech', outletId: 'heise', category: 'tech', time: 'vor 12 Min', url: 'https://www.heise.de',
        translations: {
          de: { title: 'Neues Open-Source KI-Modell läuft vollständig lokal im Browser ohne Server-Übertragung', summary: 'WebGPU ermöglicht blitzschnelle Sprachmodelle ohne jegliche Datenübertragung an fremde Server.' },
          en: { title: 'New open-source AI model runs fully locally inside browser with zero server latency', summary: 'WebGPU enables lightning-fast language models with zero telemetry or data transfer to remote clouds.' },
          es: { title: 'Nuevo modelo de IA de código abierto funciona 100% en el navegador sin enviar datos', summary: 'WebGPU permite modelos de lenguaje ultrarrápidos con privacidad absoluta y procesamiento local.' },
          fr: { title: 'Un nouveau modèle d\'IA open source s\'exécute localement dans le navigateur', summary: 'WebGPU permet des modèles linguistiques ultra-rapides sans transmission de données vers des serveurs tiers.' },
          it: { title: 'Nuovo modello di IA open source gira interamente nel browser senza server esterni', summary: 'WebGPU rende possibili modelli linguistici ultraveloci garantendo totale privacy locale.' },
          el: { title: 'Νέο μοντέλο AI ανοιχτού κώδικα εκτελείται πλήρως τοπικά στον browser χωρίς εξωτερικό server', summary: 'Το WebGPU επιτρέπει αστραπιαία γλωσσικά μοντέλα με απόλυτη προστασία δεδομένων.' }
        }
      },
      {
        source: 'Good News DE', outletId: 'goodnews', category: 'goodnews', time: 'vor 25 Min', url: 'https://goodnews.eu',
        translations: {
          de: { title: 'Globale Wiederaufforstung verzeichnet 1 Million Hektar gesunden neuen Mischwald', summary: 'Internationale Naturschutzprojekte regenerieren erfolgreich artenreiche Mischwälder und Ökosysteme.' },
          en: { title: 'Global reforestation effort successfully restores 1 million hectares of biodiverse woodland', summary: 'International conservation projects successfully revitalize thriving mixed forests and habitats.' },
          es: { title: 'La reforestación global regenera con éxito 1 millón de hectáreas de bosque mixto', summary: 'Proyectos internacionales de conservación restauran con éxito ecosistemas de gran biodiversidad.' },
          fr: { title: 'Le reboisement mondial restaure avec succès 1 million d\'hectares de forêt mixte', summary: 'Des projets internationaux régénèrent des forêts riches en biodiversité et résilientes au climat.' },
          it: { title: 'La riforestazione globale rigenera con successo 1 milione di ettari di boschi misti', summary: 'I progetti internazionali di conservazione ripristinano con successo ecosistemi ad alta biodiversità.' },
          el: { title: 'Παγκόσμια αναδάσωση αναγεννά με επιτυχία 1 εκατομμύριο εκτάρια υγιούς μικτού δάσους', summary: 'Διεθνή περιβαλλοντικά έργα αναζωογονούν πλούσια δασικά οικοσυστήματα με επιτυχία.' }
        }
      },
      {
        source: 'Handelsblatt', outletId: 'handelsblatt', category: 'business', time: 'vor 40 Min', url: 'https://www.handelsblatt.com',
        translations: {
          de: { title: 'Gründer-Boom in Europa: Starkes Wachstum bei nachhaltigen Start-ups & Green-Tech', summary: 'Investitionen in Cleantech, Bildung und KI-Software steigen im laufenden Quartal um 24 Prozent.' },
          en: { title: 'European startup surge: robust growth across sustainable ventures and green tech', summary: 'Investments in clean technologies, education, and ethical AI software rise 24 percent this quarter.' },
          es: { title: 'Auge emprendedor en Europa: fuerte crecimiento en startups sostenibles y tecnología verde', summary: 'La inversión en tecnologías limpias, educación y software de IA aumenta un 24 por ciento.' },
          fr: { title: 'Boom des startups en Europe : forte croissance des jeunes pousses durables et de la GreenTech', summary: 'Les investissements dans les technologies propres et l\'IA éthique augmentent de 24% ce trimestre.' },
          it: { title: 'Boom di startup in Europa: forte crescita per imprese sostenibili e tecnologia verde', summary: 'Gli investimenti in tecnologie pulite, formazione e software IA aumentano del 24% in questo trimestre.' },
          el: { title: 'Άνθηση νεοφυών επιχειρήσεων στην Ευρώπη: ισχυρή άνοδος στη βιώσιμη τεχνολογία και Green-Tech', summary: 'Οι επενδύσεις σε καθαρή τεχνολογία και λογισμικό AI αυξάνονται κατά 24% αυτό το τρίμηνο.' }
        }
      },
      {
        source: 'ZEIT ONLINE', outletId: 'zeit', category: 'top', time: 'vor 18 Min', url: 'https://www.zeit.de',
        translations: {
          de: { title: '29-Euro-Deutschlandticket für Schüler und Azubis bundesweit beschlossen', summary: 'Verkehrsminister einigen sich auf vergünstigte Mobilität für Millionen junge Menschen in ganz Deutschland.' },
          en: { title: 'Nationwide 29-Euro transit pass approved for students and trainees across Germany', summary: 'Transport authorities agree on affordable public transit for millions of young commuters.' },
          es: { title: 'Aprobado el abono transporte de 29 euros para estudiantes y aprendices en Alemania', summary: 'Los ministerios acuerdan tarifas reducidas de movilidad para millones de jóvenes.' },
          fr: { title: 'Le forfait transports à 29 euros validé pour les étudiants et apprentis en Allemagne', summary: 'Les ministres des transports s\'accordent sur une mobilité accessible à des millions de jeunes.' },
          it: { title: 'Approvato l\'abbonamento trasporti a 29 euro per studenti e apprendisti in Germania', summary: 'Accordo per garantire mobilità pubblica accessibile a milioni di giovani.' },
          el: { title: 'Εγκρίθηκε κάρτα μετακίνησης 29 ευρώ για μαθητές και σπουδαστές σε όλη τη Γερμανία', summary: 'Συμφωνία για προσιτή δημόσια συγκοινωνία για εκατομμύρια νέους.' }
        }
      },
      {
        source: 'Heise Tech', outletId: 'heise', category: 'tech', time: 'vor 32 Min', url: 'https://www.heise.de',
        translations: {
          de: { title: 'Quantencomputer erzielt Durchbruch bei fehlerkorrigierten Qubits', summary: 'Neues Verfahren senkt Fehlerraten drastisch und ebnet den Weg für alltagstaugliche Quanten-Algorithmen.' },
          en: { title: 'Quantum computing milestone achieved in fault-tolerant logical qubits', summary: 'Novel error-mitigation method drastically reduces noise, unlocking scalable quantum algorithms.' },
          es: { title: 'Hito en computación cuántica con cúbits lógicos corregidos contra errores', summary: 'Un nuevo método reduce drásticamente las tasas de fallo para algoritmos escalables.' },
          fr: { title: 'Avancée majeure en informatique quantique avec des qubits logiques corrigés', summary: 'Un nouveau procédé réduit considérablement les erreurs de calcul quantique.' },
          it: { title: 'Traguardo storico nel calcolo quantistico con qubit logici corretti dagli errori', summary: 'Nuovo metodo riduce drasticamente gli errori aprendo la via ad algoritmi scalabili.' },
          el: { title: 'Επανάσταση στους κβαντικούς υπολογιστές με αυτοδιορθούμενα qubits', summary: 'Νέα μέθοδος μειώνει δραστικά τα σφάλματα ανοίγοντας τον δρόμο για πρακτικούς αλγορίθμους.' }
        }
      },
      {
        source: 'Spektrum Wissenschaft', outletId: 'spektrum', category: 'science', time: 'vor 45 Min', url: 'https://www.spektrum.de',
        translations: {
          de: { title: 'James-Webb-Teleskop entdeckt bisher älteste sauerstoffreiche Galaxie im Universum', summary: 'Spektakuläre Beobachtungen liefern neue Erkenntnisse über die rasche Sternentstehung nach dem Urknall.' },
          en: { title: 'James Webb Space Telescope detects earliest known oxygen-rich galaxy in cosmos', summary: 'Spectacular spectroscopic data reveals surprisingly fast star formation shortly after the Big Bang.' },
          es: { title: 'El telescopio James Webb detecta la galaxia rica en oxígeno más remota del cosmos', summary: 'Observaciones espectaculares revelan una formación estelar ultrarrápida tras el Big Bang.' },
          fr: { title: 'Le télescope James Webb découvre la plus ancienne galaxie riche en oxygène', summary: 'Des données spectaculaires éclairent la formation stellaire rapide à l\'aube de l\'Univers.' },
          it: { title: 'Il telescopio James Webb individua la più antica galassia ricca di ossigeno', summary: 'Osservazioni spettacolari svelano una rapida nascita delle stelle dopo il Big Bang.' },
          el: { title: 'Το τηλεσκόπιο James Webb εντοπίζει την αρχαιότερη γαλαξιακή δομή πλούσια σε οξυγόνο', summary: 'Εντυπωσιακά δεδομένα αποκαλύπτουν ταχύτατη γέννηση άστρων στις απαρχές του σύμπαντος.' }
        }
      },
      {
        source: 'Good News DE', outletId: 'goodnews', category: 'goodnews', time: 'vor 50 Min', url: 'https://goodnews.eu',
        translations: {
          de: { title: 'Ozean-Bereinigungsprojekt fischt 500 Tonnen Plastik aus dem Nordpazifik', summary: 'Moderne Müll-Auffangsysteme arbeiten vollautonom mit Solarantrieb und schützen Meeresfauna.' },
          en: { title: 'Ocean cleanup operation removes 500 metric tons of plastic from North Pacific', summary: 'Solar-powered autonomous retrieval barriers surpass environmental cleanup targets.' },
          es: { title: 'Iniciativa marina retira 500 toneladas de plástico del Pacífico Norte', summary: 'Sistemas autónomos de recolección impulsados por energía solar protegen los hábitats marinos.' },
          fr: { title: 'Un projet océanique retire 500 tonnes de plastique du Pacifique Nord', summary: 'Des barrières autonomes à énergie solaire dépassent les objectifs de dépollution marine.' },
          it: { title: 'Progetto di pulizia oceanica raccoglie 500 tonnellate di plastica nel Pacifico', summary: 'Barriere autonome ad energia solare superano gli obiettivi ecologici salvaguardando il mare.' },
          el: { title: 'Περιβαλλοντική αποστολή συλλέγει 500 τόνους πλαστικού από τον Βόρειο Ειρηνικό', summary: 'Αυτόνομα ηλιακά συστήματα καθαρισμού προστατεύουν τη θαλάσσια ζωή με επιτυχία.' }
        }
      },
      {
        source: 'Süddeutsche Zeitung', outletId: 'sueddeutsche', category: 'culture', time: 'vor 1h', url: 'https://www.sueddeutsche.de',
        translations: {
          de: { title: 'Bundesweiter Kultursommer öffnet über 500 Museen bei freiem Eintritt', summary: 'Großangelegte Kultur-Initiative begeistert Besucher und fördert zeitgenössische Kunst und Geschichte.' },
          en: { title: 'Nationwide cultural festival opens over 500 museums with free admission', summary: 'Broad cultural initiative delights visitors and champions contemporary arts and history.' },
          es: { title: 'Festival cultural nacional abre más de 500 museos con entrada libre y gratuita', summary: 'Gran iniciativa cultural cautiva al público y promueve el arte contemporáneo y la historia.' },
          fr: { title: 'Un festival culturel national ouvre plus de 500 musées en accès totalement gratuit', summary: 'Vaste initiative culturelle qui ravit le public et valorise l\'art contemporain et l\'histoire.' },
          it: { title: 'Grande estate culturale: oltre 500 musei aperti con ingresso gratuito', summary: 'Iniziativa di ampio respiro che promuove l\'arte contemporanea e la storia aperta a tutti.' },
          el: { title: 'Πολιτιστικό καλοκαίρι ανοίγει πάνω από 500 μουσεία με ελεύθερη είσοδο', summary: 'Ευρεία πρωτοβουλία φέρνει τον πολιτισμό και την ιστορία κοντά σε όλους τους πολίτες.' }
        }
      },
      {
        source: 'Handelsblatt', outletId: 'handelsblatt', category: 'business', time: 'vor 1h', url: 'https://www.handelsblatt.com',
        translations: {
          de: { title: 'Europas Halbleiter-Produktion verdoppelt sich durch neue Mega-Fabriken', summary: 'Strategische Investitionen in Mikrochips sichern Zukunftsfähigkeit und Unabhängigkeit der Industrie.' },
          en: { title: 'European semiconductor output set to double with state-of-the-art mega-fabs', summary: 'Strategic microchip manufacturing investments bolster industrial autonomy across the continent.' },
          es: { title: 'La producción europea de semiconductores se duplicará con nuevas megafábricas', summary: 'Inversiones estratégicas en microchips refuerzan la soberanía industrial del continente.' },
          fr: { title: 'La production européenne de semi-conducteurs va doubler grâce à de nouvelles usines géantes', summary: 'Des investissements stratégiques renforcent l\'autonomie industrielle du continent.' },
          it: { title: 'La produzione europea di semiconduttori raddoppia con nuove gigafabbriche', summary: 'Investimenti strategici nei microchip rafforzano l\'autonomia industriale del continente.' },
          el: { title: 'Η ευρωπαϊκή παραγωγή ημιαγωγών διπλασιάζεται με νέα υπερσύγχρονα εργοστάσια', summary: 'Στρατηγικές επενδύσεις ενισχύουν την τεχνολογική αυτονομία της Ευρώπης.' }
        }
      },
      {
        source: 'Tagesschau', outletId: 'tagesschau', category: 'science', time: 'vor 1.5h', url: 'https://www.tagesschau.de',
        translations: {
          de: { title: 'Medizinischer Durchbruch: Neuer mRNA-Wirkstoff stärkt gezielte Immuntherapie', summary: 'Klinische Studien zeigen bemerkenswerte Erfolge bei der personalisierten Bekämpfung von Tumoren.' },
          en: { title: 'Medical breakthrough: novel mRNA vaccine enhances targeted cancer immunotherapy', summary: 'Clinical trials demonstrate promising outcomes in personalized oncological treatments.' },
          es: { title: 'Avance médico: nueva terapia con ARNm potencia el tratamiento contra tumores', summary: 'Los ensayos clínicos muestran resultados muy esperanzadores en medicina personalizada.' },
          fr: { title: 'Percée médicale : une nouvelle thérapie à ARNm renforce l\'immunothérapie ciblée', summary: 'Des essais cliniques démontrent des résultats prometteurs en oncologie personnalisée.' },
          it: { title: 'Svolta medica: innovativa terapia a mRNA potenzia l\'immunoterapia mirata', summary: 'Sperimentazioni cliniche mostrano esiti promettenti nella cura oncologica personalizzata.' },
          el: { title: 'Ιατρικό επίτευγμα: νέα θεραπεία mRNA ενισχύει τη στοχευμένη ανοσοθεραπεία', summary: 'Κλινικές δοκιμές καταγράφουν εξαιρετικά αποτελέσματα στην εξατομικευμένη ιατρική.' }
        }
      },
      {
        source: 'ZEIT ONLINE', outletId: 'zeit', category: 'top', time: 'vor 2h', url: 'https://www.zeit.de',
        translations: {
          de: { title: 'Städte-Offensive für grüne Metropolen: Mehr Parks, Solardächer & Trinkbrunnen', summary: 'Umfassendes Förderprogramm kühlt Ballungszentren ab und macht Innenstädte spürbar lebenswerter.' },
          en: { title: 'Urban greening initiative launches: more parks, solar roofs, and public water fountains', summary: 'Comprehensive urban planning program cools city centers and boosts urban biodiversity.' },
          es: { title: 'Ofensiva urbana verde: más parques, tejados solares y fuentes públicas en las ciudades', summary: 'Un plan integral reduce las islas de calor y mejora la calidad de vida en los centros urbanos.' },
          fr: { title: 'Offensive urbaine verte : plus de parcs, de toits solaires et de fontaines publiques', summary: 'Un vaste programme rafraîchit les métropoles et améliore le cadre de vie citadin.' },
          it: { title: 'Piano per città più verdi: più parchi, tetti solari e fontane pubbliche nei centri', summary: 'Programma di riqualificazione urbana per contrastare il caldo estivo e migliorare la qualità di vita.' },
          el: { title: 'Πρωτοβουλία για πράσινες πόλεις: περισσότερα πάρκα, φωτοβολταϊκά και δημόσιες βρύσες', summary: 'Ολοκληρωμένο πρόγραμμα δροσίζει τα αστικά κέντρα και βελτιώνει την ποιότητα ζωής.' }
        }
      },
      {
        source: 'Good News DE', outletId: 'goodnews', category: 'goodnews', time: 'vor 2.5h', url: 'https://goodnews.eu',
        translations: {
          de: { title: 'Wanderfalken und Biber kehren dauerhaft in deutsche Flusslandschaften zurück', summary: 'Langjährige Renaturierungsprojekte verzeichnen stabile Zuwächse bei ehemals gefährdeten Arten.' },
          en: { title: 'Peregrine falcons and beavers make resilient return to German river ecosystems', summary: 'Long-term wetland conservation initiatives report thriving populations of once-endangered wildlife.' },
          es: { title: 'Halcones peregrinos y castores regresan con éxito a los ríos de Alemania', summary: 'Los planes de renaturalización logran la recuperación estable de especies protegidas.' },
          fr: { title: 'Faucons pèlerins et castors font un retour durable le long des cours d\'eau en Allemagne', summary: 'Des projets de renaturation à long terme confirment l\'essor d\'espèces autrefois menacées.' },
          it: { title: 'Falchi pellegrini e castori tornano a popolare stabilmente i fiumi in Germania', summary: 'Progetti di rinaturalizzazione pluriennali portano al ripopolamento di specie protette.' },
          el: { title: 'Πετρίτες και κάστορες επιστρέφουν μόνιμα στα ποτάμια οικοσυστήματα της Γερμανίας', summary: 'Μακροχρόνια έργα αποκατάστασης της φύσης καταγράφουν σταθερή αύξηση προστατευόμενων ειδών.' }
        }
      },
      {
        source: 'Heise Tech', outletId: 'heise', category: 'tech', time: 'vor 3h', url: 'https://www.heise.de',
        translations: {
          de: { title: 'Neuer Smart-Home-Standard Matter 2.0 bringt lokale Steuerung ohne Cloud-Zwang', summary: 'Herstellerübergreifende Vernetzung funktioniert künftig vollständig offline mit höchstem Datenschutz.' },
          en: { title: 'Smart home standard Matter 2.0 enables fully local control with zero cloud reliance', summary: 'Cross-vendor interoperability operates completely on-device with airtight privacy guarantees.' },
          es: { title: 'El estándar domótico Matter 2.0 permite control 100% local sin depender de la nube', summary: 'La interoperabilidad entre fabricantes funciona ahora sin conexión externa y con total privacidad.' },
          fr: { title: 'La norme domotique Matter 2.0 permet un contrôle local complet sans cloud obligatoire', summary: 'L\'interopérabilité multimarque fonctionne désormais hors ligne en toute sécurité.' },
          it: { title: 'Nuovo standard smart home Matter 2.0: controllo locale senza obbligo di cloud', summary: 'La compatibilità multipiattaforma garantisce funzionamento offline e massima riservatezza.' },
          el: { title: 'Νέο πρότυπο smart home Matter 2.0 προσφέρει τοπικό έλεγχο χωρίς ανάγκη για cloud', summary: 'Πλήρης διαλειτουργικότητα συσκευών με απόλυτη προστασία προσωπικών δεδομένων.' }
        }
      },
      {
        source: 'Spiegel Online', outletId: 'spiegel', category: 'top', time: 'vor 3.5h', url: 'https://www.spiegel.de',
        translations: {
          de: { title: 'Neue Schnellfahrstrecken verkürzen Reisezeiten zwischen deutschen Metropolen', summary: 'Moderne Bahninfrastruktur ermöglicht umweltfreundliche Reisezeiten von unter zwei Stunden.' },
          en: { title: 'New high-speed rail corridors slash travel times between major metropolitan hubs', summary: 'Modernized railway infrastructure provides eco-friendly intercity journeys under two hours.' },
          es: { title: 'Nuevas líneas de alta velocidad reducen los tiempos de viaje entre grandes ciudades', summary: 'Infraestructura ferroviaria moderna conecta metrópolis en menos de dos horas de forma ecológica.' },
          fr: { title: 'De nouvelles lignes à grande vitesse réduisent les temps de trajet entre métropoles', summary: 'Des infrastructures ferroviaires modernes permettent des trajets écologiques de moins de deux heures.' },
          it: { title: 'Nuove tratte ferroviarie veloci accorciano i tempi di viaggio tra le grandi metropoli', summary: 'Infrastrutture moderne garantiscono collegamenti sostenibili in meno di due ore.' },
          el: { title: 'Νέες σιδηροδρομικές γραμμές υψηλής ταχύτητας μειώνουν τους χρόνους ταξιδιού', summary: 'Σύγχρονες υποδομές συνδέουν μεγάλες πόλεις σε λιγότερο από δύο ώρες οικολογικά.' }
        }
      }
    ],

    // 🇬🇷 Eλλάδα (Griechenland)
    gr: [
      {
        source: 'ΕΡΤ News', outletId: 'ert', category: 'top', time: 'πριν 15 λεπτά', url: 'https://www.ertnews.gr',
        translations: {
          el: { title: 'Ηλιακή και αιολική ενέργεια καλύπτουν πάνω από το 60% της ζήτησης στην Ελλάδα', summary: 'Ιστορικό ρεκόρ καθαρής ενέργειας με σημαντική μείωση του κόστους ρεύματος για πολίτες και επιχειρήσεις.' },
          es: { title: 'La energía solar y eólica cubren más del 60% de la demanda eléctrica en Grecia', summary: 'Récord histórico de energía limpia con una notable bajada en los costes de electricidad para ciudadanos y empresas.' },
          de: { title: 'Solar- und Windenergie decken über 60% des Strombedarfs in Griechenland ab', summary: 'Historischer Rekord für saubere Energie mit spürbarer Senkung der Stromkosten für Haushalte und Betriebe.' },
          en: { title: 'Solar and wind energy supply over 60% of electricity demand across Greece', summary: 'Historic clean energy milestone leads to significant drop in electricity prices for households and businesses.' },
          fr: { title: 'L\'énergie solaire et éolienne couvre plus de 60% de la demande en Grèce', summary: 'Record historique d\'énergie verte avec une baisse sensible des prix de l\'électricité pour tous.' },
          it: { title: 'Energia solare ed eolica coprono oltre il 60% della domanda elettrica in Grecia', summary: 'Record storico di energia pulita con una significativa riduzione dei costi energetici per cittadini e imprese.' }
        }
      },
      {
        source: 'Καθημερινή', outletId: 'kathimerini', category: 'top', time: 'πριν 35 λεπτά', url: 'https://www.kathimerini.gr',
        translations: {
          el: { title: 'Εκσυγχρονισμός ψηφιακών δημόσιων υπηρεσιών για πολίτες και επιχειρήσεις', summary: 'Νέες αυτοματοποιημένες διαδικασίες εξοικονομούν χιλιάδες ώρες γραφειοκρατίας σε όλη τη χώρα.' },
          es: { title: 'Modernización de los servicios públicos digitales para ciudadanos y empresas en Grecia', summary: 'Nuevos procesos automatizados ahorran miles de horas de burocracia administrativa en todo el país.' },
          de: { title: 'Modernisierung digitaler Bürgerdienste und Verwaltungsportale in Griechenland', summary: 'Neue automatisierte Verwaltungsprozesse sparen landesweit tausende Stunden Bürokratie ein.' },
          en: { title: 'Digital public services modernization speeds up administrative workflows across Greece', summary: 'New automated e-government procedures save thousands of bureaucratic hours nationwide.' },
          fr: { title: 'Modernisation des services publics numériques pour citoyens et entreprises en Grèce', summary: 'De nouvelles procédures automatisées réduisent fortement les démarches administratives dans tout le pays.' },
          it: { title: 'Modernizzazione dei servizi pubblici digitali per cittadini e imprese in Grecia', summary: 'Nuove procedure automatizzate riducono notevolmente i tempi della burocrazia in tutto il paese.' }
        }
      },
      {
        source: 'Techblog GR', outletId: 'techblog', category: 'tech', time: 'πριν 1 ώρα', url: 'https://techblog.gr',
        translations: {
          el: { title: 'Ελληνικές νεοφυείς επιχειρήσεις τεχνητής νοημοσύνης προσελκύουν διεθνή κεφάλαια', summary: 'Ανάπτυξη καινοτόμων λύσεων υγείας και ναυτιλίας στην Αθήνα και Θεσσαλονίκη με παγκόσμια απήχηση.' },
          es: { title: 'Startups griegas de inteligencia artificial atraen inversión internacional récord', summary: 'Desarrollo de soluciones pioneras en salud y logística marítima en Atenas y Tesalónica.' },
          de: { title: 'Griechische KI-Start-ups ziehen Rekordinvestitionen aus dem Ausland an', summary: 'Entwicklung innovativer KI-Lösungen für maritime Logistik und Medizin in Athen und Thessaloniki.' },
          en: { title: 'Greek AI startups attract substantial international venture investments', summary: 'Pioneering artificial intelligence solutions for healthcare and maritime logistics thrive in Athens and Thessaloniki.' },
          fr: { title: 'Les startups grecques d\'intelligence artificielle attirent des capitaux internationaux', summary: 'Des solutions innovantes pour la santé et la marine marchande émergent avec succès à Athènes.' },
          it: { title: 'Startup greche di intelligenza artificiale attraggono capitali internazionali', summary: 'Sviluppo di soluzioni innovative per sanità e logistica marittima ad Atene e Salonicco.' }
        }
      },
      {
        source: 'Capital.gr', outletId: 'capital', category: 'business', time: 'πριν 1.5 ώρα', url: 'https://www.capital.gr',
        translations: {
          el: { title: 'Ανάπτυξη του ελληνικού τουρισμού με έμφαση στη βιωσιμότητα και τον πολιτισμό', summary: 'Επέκταση της τουριστικής περιόδου σε όλη τη διάρκεια του έτους με πράσινες υποδομές και οικολογική φιλοξενία.' },
          es: { title: 'El turismo sostenible y cultural impulsa el crecimiento económico en Grecia', summary: 'Ampliación de la temporada durante todo el año con infraestructuras ecológicas y hospitalidad verde.' },
          de: { title: 'Nachhaltiger Kultur- und Naturtourismus treibt Wachstum in Griechenland an', summary: 'Ganzjährige Saisonverlängerung und Investitionen in umweltfreundliche Reisekonzepte und Gastfreundschaft.' },
          en: { title: 'Sustainable cultural tourism drives balanced economic growth across Greek regions', summary: 'Year-round season extension and green hospitality infrastructure investments yield strong results.' },
          fr: { title: 'Le tourisme durable et culturel stimule la croissance économique en Grèce', summary: 'Extension de la saison tout au long de l\'année et investissements dans l\'hôtellerie verte et responsable.' },
          it: { title: 'Il turismo sostenibile e culturale traina la crescita economica in Grecia', summary: 'Estensione della stagione a tutto l\'anno con nuove infrastrutture alberghiere a basso impatto ambientale.' }
        }
      },
      {
        source: 'ΕΡΤ News', outletId: 'ert', category: 'goodnews', time: 'πριν 2 ώρες', url: 'https://www.ertnews.gr',
        translations: {
          el: { title: 'Πρόγραμμα προστασίας θαλάσσιων χελωνών Caretta-Caretta σημειώνει ρεκόρ φωλιών', summary: 'Σημαντική αύξηση πληθυσμού στη Ζάκυνθο και την Κρήτη χάρη σε συντονισμένες εθελοντικές δράσεις.' },
          es: { title: 'Récord histórico de nidos protegidos de tortugas marinas Caretta-Caretta en Grecia', summary: 'Fuerte aumento de la población en Zante y Creta gracias al compromiso ejemplar de voluntarios.' },
          de: { title: 'Schutzprogramm für Caretta-Caretta Meeresschildkröten verzeichnet Rekord an Nistplätzen', summary: 'Deutlicher Populationszuwachs auf Zakynthos und Kreta dank engagierter Naturschutzprojekte.' },
          en: { title: 'Caretta-Caretta sea turtle conservation program records historic nesting high in Greece', summary: 'Substantial population growth across Zakynthos and Crete thanks to dedicated conservation efforts.' },
          fr: { title: 'Le programme de protection des tortues Caretta-Caretta enregistre un record en Grèce', summary: 'Forte hausse des naissances à Zante et en Crète grâce aux initiatives écologiques coordonnées.' },
          it: { title: 'Record di nidi per le tartarughe marine Caretta-Caretta nelle isole della Grecia', summary: 'Crescita costante della popolazione a Zante e Creta grazie alla tutela ambientale dei volontari.' }
        }
      },
      {
        source: 'Το Βήμα', outletId: 'tovima', category: 'culture', time: 'πριν 3 ώρες', url: 'https://www.tovima.gr',
        translations: {
          el: { title: 'Ολοκλήρωση νέας φάσης συντήρησης των αρχαίων μνημείων της Ακρόπολης', summary: 'Πρωτοποριακές τεχνικές λέιζερ αποκαλύπτουν τα αρχικά ανάγλυφα με απόλυτη ασφάλεια και πιστότητα.' },
          es: { title: 'Concluye con éxito una nueva fase de restauración en la Acrópolis de Atenas', summary: 'Pioneras técnicas láser revelan relieves originales con máxima precisión y cuidado histórico.' },
          de: { title: 'Neue Restaurierungsphase an den Monumenten der Akropolis erfolgreich abgeschlossen', summary: 'Modernste Lasertechnologie legt Originalreliefs ohne Substanzverlust und mit höchster Präzision frei.' },
          en: { title: 'New restoration milestone completed on Acropolis monuments in Athens', summary: 'Cutting-edge laser conservation reveals ancient reliefs with supreme precision and historical fidelity.' },
          fr: { title: 'Nouvelle étape réussie dans la restauration des monuments de l\'Acropole d\'Athènes', summary: 'Des technologies laser de pointe révèlent les bas-reliefs antiques avec une extrême précision.' },
          it: { title: 'Completata con successo la nuova fase di restauro dei monumenti dell\'Acropoli ad Atene', summary: 'Tecniche laser all\'avanguardia riportano alla luce i rilievi originali in piena sicurezza storica.' }
        }
      }
    ],

    // 🇪🇸 España
    es: [
      {
        source: 'RTVE Noticias', outletId: 'rtve', category: 'top', time: 'hace 15 min', url: 'https://www.rtve.es',
        translations: {
          es: { title: 'España lidera la generación europea con energía solar y eólica limpia', summary: 'El 65% de la electricidad nacional procede de fuentes renovables limpias y altamente competitivas.' },
          de: { title: 'Spanien führt Europas Stromerzeugung aus Wind und Solarkraft an', summary: 'Über 65 Prozent des nationalen Strombedarfs stammen aus sauberen erneuerbaren Quellen.' },
          en: { title: 'Spain leads European clean electricity generation with record solar and wind output', summary: 'Over 65 percent of domestic electricity stems from competitive renewable sources.' },
          fr: { title: 'L\'Espagne mène la production européenne d\'énergie solaire et éolienne', summary: '65% de l\'électricité nationale provient désormais de sources renouvelables compétitives.' },
          it: { title: 'La Spagna guida la produzione europea con energia solare ed eolica pulita', summary: 'Il 65% dell\'elettricità nazionale proviene da fonti rinnovabili pulite e competitive.' },
          el: { title: 'Η Ισπανία ηγείται της ευρωπαϊκής παραγωγής καθαρής ηλιακής και αιολικής ενέργειας', summary: 'Το 65% της εθνικής ηλεκτρικής ενέργειας προέρχεται από καθαρές ανανεώσιμες πηγές.' }
        }
      },
      {
        source: 'El País', outletId: 'elpais', category: 'top', time: 'hace 35 min', url: 'https://elpais.com',
        translations: {
          es: { title: 'El tren de alta velocidad alcanza récord histórico de pasajeros en España', summary: 'Precios asequibles y conexiones directas reducen el tráfico por carretera en más de un 40%.' },
          de: { title: 'Hochgeschwindigkeitszüge verzeichnen Passagierrekord in Spanien', summary: 'Erschwingliche Tickets und direkte Takte senken den Straßenverkehr um über 40 Prozent.' },
          en: { title: 'High-speed rail network sets all-time passenger travel record across Spain', summary: 'Affordable fares and direct links cut intercity highway car traffic by over 40 percent.' },
          fr: { title: 'Le train à grande vitesse bat un record historique de voyageurs en Espagne', summary: 'Des tarifs accessibles et des liaisons directes réduisent le trafic routier de plus de 40%.' },
          it: { title: 'I treni ad alta velocità segnano il record storico di passeggeri in Spagna', summary: 'Prezzi accessibili e collegamenti diretti riducono il traffico autostradale di oltre il 40%.' },
          el: { title: 'Τα τρένα υψηλής ταχύτητας σημειώνουν ιστορικό ρεκόρ επιβατών στην Ισπανία', summary: 'Προσιτές τιμές και απευθείας συνδέσεις μειώνουν την οδική κίνηση κατά 40%.' }
        }
      },
      {
        source: 'El Mundo', outletId: 'elmundo', category: 'tech', time: 'hace 1h', url: 'https://www.elmundo.es',
        translations: {
          es: { title: 'Startups de biomedicina en Barcelona descubren prometedor tratamiento celular', summary: 'Avance terapéutico pionero contra enfermedades autoinmunes con alta tolerancia clínica.' },
          de: { title: 'Biomedizin-Startups in Barcelona erzielen Durchbruch bei Zelltherapie', summary: 'Pioniertherapie gegen Autoimmunerkrankungen zeigt hohe Wirksamkeit bei minimalen Nebenwirkungen.' },
          en: { title: 'Barcelona biomedical startups discover breakthrough cellular therapy', summary: 'Pioneering therapeutic advance against autoimmune conditions demonstrates high efficacy.' },
          fr: { title: 'Des startups biomédicales à Barcelone découvrent une thérapie cellulaire prometteuse', summary: 'Avancée thérapeutique majeure contre les maladies auto-immunes avec haute tolérance.' },
          it: { title: 'Startup biomediche a Barcellona scoprono una promettente terapia cellulare', summary: 'Pionieristico progresso contro le patologie autoimmuni con ottima tolleranza clinica.' },
          el: { title: 'Νεοφυείς επιχειρήσεις βιοϊατρικής στη Βαρκελώνη ανακαλύπτουν πρωτοποριακή κυτταρική θεραπεία', summary: 'Σημαντική θεραπευτική πρόοδος κατά αυτοάνοσων νοσημάτων με υψηλή αποτελεσματικότητα.' }
        }
      },
      {
        source: 'Agencia EFE', outletId: 'efe', category: 'goodnews', time: 'hace 2h', url: 'https://efe.com',
        translations: {
          es: { title: 'El lince ibérico consolida su recuperación histórica con más de 2.000 ejemplares', summary: 'Éxito mundial de conservación medioambiental en los parques naturales de la península.' },
          de: { title: 'Der iberische Luchs feiert historische Erholung mit über 2.000 Tieren', summary: 'Weltweiter Vorzeigeerfolg des Naturschutzes in den spanischen Naturparks.' },
          en: { title: 'Iberian lynx achieves historic population milestone exceeding 2,000 individuals', summary: 'Celebrated worldwide wildlife conservation triumph across protected natural habitats.' },
          fr: { title: 'Le lynx ibérique confirme son retour historique avec plus de 2 000 individus', summary: 'Succès mondial de préservation de la biodiversité dans les parcs naturels protégés.' },
          it: { title: 'La lince iberica consolida la storica ripresa con oltre 2.000 esemplari', summary: 'Successo mondiale di conservazione ambientale nei parchi naturali della penisola.' },
          el: { title: 'Ο ιβηρικός λύγκας καταγράφει ιστορική ανάκαμψη με πάνω από 2.000 ζώα', summary: 'Παγκόσμια περιβαλλοντική επιτυχία προστασίας της άγριας ζωής στα φυσικά πάρκα.' }
        }
      }
    ],

    // 🌐 Global / International
    global: [
      {
        source: 'BBC World', outletId: 'bbc_world', category: 'top', time: '10m ago', url: 'https://www.bbc.com/news',
        translations: {
          en: { title: 'Global Climate Accord unlocks record international funding for clean tech', summary: 'Over 80 nations commit to accelerating solar, wind, and smart battery storage rollouts worldwide.' },
          de: { title: 'Globales Klimaabkommen mobilisiert Rekordinvestitionen für saubere Technologien', summary: 'Über 80 Nationen beschließen den beschleunigten Ausbau von Solarkraft und Speichertechnologie.' },
          es: { title: 'El Acuerdo Climático Global desbloquea fondos récord para energías limpias', summary: 'Más de 80 países se comprometen a acelerar parques solares, eólicos y baterías avanzadas.' },
          fr: { title: 'L\'Accord mondial sur le climat débloque des financements records pour l\'énergie propre', summary: 'Plus de 80 pays s\'engagent à accélérer le déploiement du solaire et du stockage par batteries.' },
          it: { title: 'L\'Accordo Globale sul Clima sblocca finanziamenti record per tecnologie pulite', summary: 'Oltre 80 nazioni accelerano l\'installazione di solare, eolico e sistemi di accumulo avanzati.' },
          el: { title: 'Παγκόσμια Κλιματική Συμφωνία εξασφαλίζει χρηματοδότηση ρεκόρ για καθαρές τεχνολογίες', summary: 'Πάνω από 80 χώρες δεσμεύονται να επιταχύνουν την ηλιακή ενέργεια και τις μπαταρίες αποθήκευσης.' }
        }
      },
      {
        source: 'Reuters', outletId: 'reuters', category: 'top', time: '28m ago', url: 'https://www.reuters.com',
        translations: {
          en: { title: 'International Space Station marks 25 years of uninterrupted human presence in orbit', summary: 'Astronauts and global researchers celebrate a quarter-century of breakthroughs in microgravity.' },
          de: { title: 'Internationale Raumstation feiert 25 Jahre dauerhafte bemannte Forschung im All', summary: 'Astronauten und Wissenschaftler würdigen ein Vierteljahrhundert bahnbrechender Experimente in der Schwerelosigkeit.' },
          es: { title: 'La Estación Espacial Internacional celebra 25 años de presencia humana continua en órbita', summary: 'Astronautas e investigadores globales celebran un cuarto de siglo de descubrimientos en microgravedad.' },
          fr: { title: 'La Station spatiale internationale célèbre 25 ans de présence humaine continue en orbite', summary: 'Des astronautes et chercheurs mondiaux célèbrent un quart de siècle de percées scientifiques.' },
          it: { title: 'La Stazione Spaziale Internazionale compie 25 anni di presenza umana continua in orbita', summary: 'Astronauti e ricercatori di tutto il mondo celebrano un quarto di secolo di scoperte scientifiche.' },
          el: { title: 'Ο Διεθνής Διαστημικός Σταθμός γιορτάζει 25 χρόνια συνεχούς ανθρώπινης παρουσίας σε τροχιά', summary: 'Αστροναύτες και επιστήμονες γιορτάζουν ένα τέταρτο του αιώνα ανακαλύψεων σε μικροβαρύτητα.' }
        }
      },
      {
        source: 'Wired', outletId: 'wired', category: 'tech', time: '15m ago', url: 'https://www.wired.com',
        translations: {
          en: { title: 'On-device neural inference breakthrough delivers instantaneous translation with zero latency', summary: 'Compact neural network architectures run entirely inside user browsers with airtight privacy guarantees.' },
          de: { title: 'Durchbruch bei lokaler KI: Blitzschnelle neuronale Übersetzung direkt im Browser', summary: 'Kompakte Sprachmodelle arbeiten vollständig lokal ohne Latenz und mit absolutem Datenschutz.' },
          es: { title: 'Gran avance en IA local: traducción neuronal instantánea directamente en el navegador', summary: 'Modelos compactos se ejecutan sin latencia y con garantía total de privacidad para el usuario.' },
          fr: { title: 'Avancée en IA locale : traduction neuronale instantanée directement dans le navigateur', summary: 'Des réseaux de neurones compacts fonctionnent en local sans latence et avec une confidentialité totale.' },
          it: { title: 'Svolta nell\'IA locale: traduzione neurale istantanea direttamente nel browser', summary: 'Modelli compatti girano senza latenza e con assoluta garanzia di privacy per l\'utente.' },
          el: { title: 'Επανάσταση στην τοπική τεχνητή νοημοσύνη: αστραπιαία νευρωνική μετάφραση απευθείας στον browser', summary: 'Συμπαγή μοντέλα λειτουργούν τοπικά χωρίς καθυστέρηση και με απόλυτη ιδιωτικότητα.' }
        }
      },
      {
        source: 'Nature', outletId: 'nature', category: 'science', time: '1h ago', url: 'https://www.nature.com',
        translations: {
          en: { title: 'Deep sea exploration documents over 100 previously unknown marine species', summary: 'Fluorescent coral gardens and thriving hydrothermal ecosystems mapped across Pacific ridges.' },
          de: { title: 'Tiefsee-Expedition entdeckt über 100 bisher unbekannte Meeresarten', summary: 'Fluoreszierende Korallengärten und faszinierende hydrothermale Ökosysteme im Pazifik dokumentiert.' },
          es: { title: 'Expedición a las profundidades marinas descubre más de 100 especies nunca antes vistas', summary: 'Jardines de coral fluorescentes y ecosistemas hidrotérmicos cartografiados en el Pacífico.' },
          fr: { title: 'Une expédition en haute mer découvre plus de 100 espèces marines inconnues', summary: 'Des jardins de coraux fluorescents et des écosystèmes sous-marins fascinants répertoriés.' },
          it: { title: 'Spedizione negli abissi marini scopre oltre 100 specie marine finora sconosciute', summary: 'Giardini di corallo fluorescenti ed ecosistemi idrotermali mappati lungo le dorsali del Pacifico.' },
          el: { title: 'Εξερεύνηση βαθέων υδάτων καταγράφει πάνω από 100 άγνωστα έως τώρα θαλάσσια είδη', summary: 'Φθορίζοντες κοραλλιογενείς κήποι και μοναδικά οικοσυστήματα χαρτογραφήθηκαν στον Ειρηνικό.' }
        }
      },
      {
        source: 'Good News Network', outletId: 'goodnews', category: 'goodnews', time: '40m ago', url: 'https://www.goodnewsnetwork.org',
        translations: {
          en: { title: 'Renewable energy generation surpasses fossil fuels across major worldwide power grids', summary: 'Rapid deployment of clean energy leads to declining global emissions and lower utility costs.' },
          de: { title: 'Erneuerbare Energien übertreffen fossile Brennstoffe in führenden Stromnetzen weltweit', summary: 'Zügiger Ausbau sauberer Energien führt zu sinkenden Emissionen und günstigeren Stromtarifen.' },
          es: { title: 'Las energías renovables superan a los combustibles fósiles en las principales redes mundiales', summary: 'El rápido despliegue de energía limpia reduce las emisiones globales y abarata las tarifas eléctricas.' },
          fr: { title: 'Les énergies renouvelables dépassent les combustibles fossiles sur les réseaux mondiaux', summary: 'Le déploiement rapide de l\'énergie propre entraîne une baisse des émissions et des coûts d\'électricité.' },
          it: { title: 'Le energie rinnovabili superano i combustibili fossili nelle principali reti mondiali', summary: 'La rapida espansione dell\'energia pulita riduce le emissioni e abbassa i costi delle bollette.' },
          el: { title: 'Οι ανανεώσιμες πηγές ξεπερνούν τα ορυκτά καύσιμα στα μεγαλύτερα δίκτυα παγκοσμίως', summary: 'Η ταχεία ανάπτυξη καθαρής ενέργειας μειώνει τις εκπομπές ρύπων και το κόστος ρεύματος.' }
        }
      },
      {
        source: 'Associated Press', outletId: 'ap_world', category: 'top', time: '35m ago', url: 'https://apnews.com',
        translations: {
          en: { title: 'Global health partnership eradicates critical infectious illness in 14 countries', summary: 'Historic immunization and clean water programs protect millions of vulnerable families.' },
          de: { title: 'Globale Gesundheitspartnerschaft rottet schwere Infektionskrankheit in 14 Ländern aus', summary: 'Historische Impfprogramme und sauberes Trinkwasser schützen Millionen Familien weltweit.' },
          es: { title: 'Alianza sanitaria global erradica grave enfermedad infecciosa en 14 países', summary: 'Programas históricos de inmunización y agua potable protegen a millones de familias.' },
          fr: { title: 'Un partenariat mondial de santé éradique une maladie infectieuse dans 14 pays', summary: 'Des campagnes historiques de vaccination et d\'accès à l\'eau potable sauvent des millions de vies.' },
          it: { title: 'Alleanza sanitaria globale debella grave malattia infettiva in 14 nazioni', summary: 'Storici programmi di vaccinazione e acqua potabile proteggono milioni di famiglie vulnerabili.' },
          el: { title: 'Παγκόσμια συνεργασία υγείας εξαλείφει σοβαρή λοιμώδη νόσο σε 14 χώρες', summary: 'Ιστορικά προγράμματα εμβολιασμού και καθαρού νερού προστατεύουν εκατομμύρια οικογένειες.' }
        }
      },
      {
        source: 'Wired', outletId: 'wired', category: 'tech', time: '50m ago', url: 'https://www.wired.com',
        translations: {
          en: { title: 'Solid-state battery breakthrough doubles EV driving range with 10-minute ultra charge', summary: 'New ceramic electrolyte eliminates fire risk while providing exceptional energy density.' },
          de: { title: 'Feststoff-Batterie verdoppelt Reichweite von Elektroautos bei 10 Minuten Ladezeit', summary: 'Neuartiger Keramik-Elektrolyt schließt Brandgefahr aus und bietet extreme Energiedichte.' },
          es: { title: 'Batería de estado sólido duplica la autonomía de vehículos eléctricos con carga de 10 min', summary: 'Un innovador electrolito cerámico elimina el riesgo de incendio con densidad récord.' },
          fr: { title: 'Percée des batteries solides : autonomie doublée et recharge ultra-rapide en 10 minutes', summary: 'Un nouvel électrolyte céramique supprime tout risque d\'incendie avec une densité énergétique maximale.' },
          it: { title: 'Batterie allo stato solido: raddoppia l\'autonomia delle auto con ricarica in 10 minuti', summary: 'Nuovo elettrolita ceramico elimina il rischio di incendi offrendo altissima densità energetica.' },
          el: { title: 'Μπαταρίες στερεάς κατάστασης διπλασιάζουν την αυτονομία με φόρτιση 10 λεπτών', summary: 'Νέος κεραμικός ηλεκτρολύτης εξαλείφει τον κίνδυνο φωτιάς με κορυφαία ενεργειακή πυκνότητα.' }
        }
      },
      {
        source: 'Nature', outletId: 'nature', category: 'science', time: '1.2h ago', url: 'https://www.nature.com',
        translations: {
          en: { title: 'Astronomers detect habitable-zone exoplanet with water-rich atmospheric signatures', summary: 'Deep spectroscopic observations 40 light-years away reveal temperate oceans and atmospheric clouds.' },
          de: { title: 'Astronomen weisen wasserreiche Atmosphäre bei Exoplaneten in habitabler Zone nach', summary: 'Spektroskopische Daten aus 40 Lichtjahren Entfernung deuten auf milde Ozeane und Wolken hin.' },
          es: { title: 'Astrónomos detectan exoplaneta en zona habitable con atmósfera rica en agua', summary: 'Observaciones espectroscópicas a 40 años luz revelan posibles océanos templados y nubes.' },
          fr: { title: 'Des astronomes détectent un exoplanète en zone habitable avec de la vapeur d\'eau', summary: 'Des analyses spectroscopiques à 40 années-lumière suggèrent la présence d\'océans tempérés.' },
          it: { title: 'Astronomi individuano esopianeta in zona abitabile con atmosfera ricca di vapore acqueo', summary: 'Dati spettroscopici a 40 anni luce di distanza rivelano indizi di oceani temperati.' },
          el: { title: 'Αστρονόμοι εντοπίζουν εξωπλανήτη σε κατοικήσιμη ζώνη με ατμόσφαιρα πλούσια σε νερό', summary: 'Φασματοσκοπικά δεδομένα από απόσταση 40 ετών φωτός αποκαλύπτουν εύκρατους ωκεανούς.' }
        }
      },
      {
        source: 'Reuters', outletId: 'reuters', category: 'business', time: '1.5h ago', url: 'https://www.reuters.com',
        translations: {
          en: { title: 'Global clean energy capital investments reach landmark 2 trillion dollar benchmark', summary: 'Private and sovereign funds accelerate commitments to solar, grid scale storage, and hydrogen.' },
          de: { title: 'Globale Investitionen in saubere Energien erreichen 2-Billionen-Dollar-Rekord', summary: 'Fonds und Staaten investieren beispiellose Summen in Sonnenkraft, Großspeicher und Wasserstoff.' },
          es: { title: 'La inversión global en energía limpia alcanza el hito histórico de 2 billones de dólares', summary: 'Fondos soberanos y privados aceleran su apuesta por solar, baterías e hidrógeno verde.' },
          fr: { title: 'Les investissements mondiaux dans l\'énergie propre franchissent le cap des 2 000 milliards de dollars', summary: 'Fonds publics et privés accélèrent dans le solaire, les batteries géantes et l\'hydrogène.' },
          it: { title: 'Gli investimenti globali in energia pulita toccano la cifra record di 2.000 miliardi di dollari', summary: 'Fondi sovrani e privati puntano su solare, stoccaggio a batteria e idrogeno verde.' },
          el: { title: 'Παγκόσμιες επενδύσεις σε καθαρή ενέργεια αγγίζουν το ρεκόρ των 2 τρισεκατομμυρίων δολαρίων', summary: 'Κρατικά και ιδιωτικά κεφάλαια επιταχύνουν έργα ηλιακής ενέργειας και αποθήκευσης.' }
        }
      },
      {
        source: 'Good News Network', outletId: 'goodnews', category: 'goodnews', time: '2h ago', url: 'https://www.goodnewsnetwork.org',
        translations: {
          en: { title: 'Global ocean pact designates 3 million square kilometers of new marine sanctuaries', summary: 'Historic high-seas conservation agreement shields pristine coral reefs and whale sanctuaries.' },
          de: { title: 'Weltweites Abkommen stellt 3 Millionen Quadratkilometer Ozean unter strengen Schutz', summary: 'Historischer Hochsee-Pakt bewahrt unberührte Korallenriffe und Schutzräume für Wale.' },
          es: { title: 'Pacto oceánico mundial protege 3 millones de kilómetros cuadrados de santuarios marinos', summary: 'Acuerdo histórico de alta mar salvaguarda arrecifes de coral y rutas migratorias de ballenas.' },
          fr: { title: 'Un pacte océanique mondial sanctuarise 3 millions de kilomètres carrés en haute mer', summary: 'Traité historique pour préserver les récifs coralliens et les couloirs migratoires des cétacés.' },
          it: { title: 'Patto oceanico mondiale: protetti 3 milioni di chilometri quadrati di riserve marine', summary: 'Accordo storico in alto mare per difendere le barriere coralline e le rotte delle balene.' },
          el: { title: 'Παγκόσμιο σύμφωνο προστατεύει 3 εκατομμύρια τετραγωνικά χιλιόμετρα θαλάσσιων καταφυγίων', summary: 'Ιστορική συμφωνία προστατεύει κοραλλιογενείς υφάλους και θαλάσσια θηλαστικά.' }
        }
      },
      {
        source: 'BBC World', outletId: 'bbc_world', category: 'culture', time: '2.5h ago', url: 'https://www.bbc.com',
        translations: {
          en: { title: 'Open cultural heritage vault grants free digital access to millions of ancient texts', summary: 'Multispectral scanning preserves rare historical manuscripts from libraries worldwide.' },
          de: { title: 'Offenes Weltkulturerbe-Portal bietet freien Zugriff auf Millionen antiker Handschriften', summary: 'Multispektral-Scans bewahren unschätzbare historische Dokumente digital für die Menschheit.' },
          es: { title: 'Archivo digital de patrimonio cultural universal abre millones de textos antiguos', summary: 'El escaneo multiespectral conserva valiosos manuscritos históricos para acceso público y libre.' },
          fr: { title: 'Un portail du patrimoine mondial offre l\'accès libre à des millions de textes anciens', summary: 'La numérisation multispectrale sauvegarde des manuscrits inestimables pour tous.' },
          it: { title: 'Portale del patrimonio mondiale apre l\'accesso gratuito a milioni di testi antichi', summary: 'Scansioni multispettrali preservano manoscritti storici inestimabili consultabili da tutti.' },
          el: { title: 'Ψηφιακό αποθετήριο παγκόσμιας κληρονομιάς προσφέρει ελεύθερη πρόσβαση σε αρχαία κείμενα', summary: 'Πολυφασματική σάρωση διασώζει σπάνια ιστορικά χειρόγραφα για όλη την ανθρωπότητα.' }
        }
      },
      {
        source: 'Wired', outletId: 'wired', category: 'tech', time: '3h ago', url: 'https://www.wired.com',
        translations: {
          en: { title: 'Agile autonomous search-and-rescue robots successfully assist emergency responders', summary: 'Advanced bio-inspired locomotion allows robots to navigate rubble and save lives in disaster zones.' },
          de: { title: 'Autonome Such- und Rettungsroboter unterstützen Einsatzkräfte bei Naturkatastrophen', summary: 'Roboter mit bioinspirierter Motorik navigieren sicher durch unwegsames Trümmergelände.' },
          es: { title: 'Robots autónomos de rescate asisten con éxito a los equipos de emergencia', summary: 'Locomoción bioinspirada permite acceder a terrenos inaccesibles para salvar vidas.' },
          fr: { title: 'Des robots autonomes de sauvetage prêtent main-forte aux équipes de secours', summary: 'Une motricité bio-inspirée permet d\'évoluer dans les décombres pour secourir des rescapés.' },
          it: { title: 'Robot autonomi di soccorso supportano con successo i vigili del fuoco nelle emergenze', summary: 'La motricità bio-ispirata consente di esplorare macerie e salvare vite in aree colpite da disastri.' },
          el: { title: 'Αυτόνομα ρομπότ έρευνας και διάσωσης υποστηρίζουν αποτελεσματικά σωστικά συνεργεία', summary: 'Βιομιμητική κίνηση επιτρέπει ασφαλή πλοήγηση σε ερείπια για τη διάσωση ανθρώπων.' }
        }
      },
      {
        source: 'Nature', outletId: 'nature', category: 'science', time: '3.5h ago', url: 'https://www.nature.com',
        translations: {
          en: { title: 'Engineered biological enzyme breaks down common PET plastics in sixteen hours', summary: 'Green biotechnology breakthrough enables infinite recycling of complex polymer waste.' },
          de: { title: 'Neues biotechnologisches Enzym zersetzt PET-Kunststoffe vollständig in nur 16 Stunden', summary: 'Biologischer Durchbruch ebnet den Weg für geschlossene, rückstandslose Recycling-Kreisläufe.' },
          es: { title: 'Enzima biotecnológica descompone plásticos PET comunes en solo dieciséis horas', summary: 'Gran avance de biotecnología verde hace posible el reciclaje infinito de residuos plásticos.' },
          fr: { title: 'Une enzyme biotechnologique décompose les plastiques PET en seulement seize heures', summary: 'Une avancée verte majeure permet le recyclage infini des déchets polymères sans résidus.' },
          it: { title: 'Innovativo enzima biotecnologico decompone le plastiche PET in sole sedici ore', summary: 'Svolta nella biotecnologia verde che apre la strada al riciclo infinito dei polimeri.' },
          el: { title: 'Βιοτεχνολογικό ένζυμο αποδομεί πλαστικά PET σε μόλις δεκαέξι ώρες', summary: 'Πράσινο τεχνολογικό επίτευγμα επιτρέπει άπειρη ανακύκλωση πλαστικών αποβλήτων.' }
        }
      },
      {
        source: 'Associated Press', outletId: 'ap_world', category: 'top', time: '4h ago', url: 'https://apnews.com',
        translations: {
          en: { title: 'Worldwide solar panel installations increase by 45 percent over past twelve months', summary: 'Lower manufacturing costs empower remote and rural communities with resilient energy independence.' },
          de: { title: 'Weltweiter Solaranlagen-Zubau wächst um 45 Prozent innerhalb eines Jahres', summary: 'Günstigere Modulpreise ermöglichen abgelegenen Regionen saubere und autarke Energieversorgung.' },
          es: { title: 'Las instalaciones solares mundiales aumentan un 45% en los últimos doce meses', summary: 'Costes de fabricación más bajos dotan de energía limpia y barata a zonas rurales y remotas.' },
          fr: { title: 'Les installations solaires mondiales bondissent de 45% en douze mois', summary: 'La baisse des coûts de production offre l\'indépendance énergétique à des millions de foyers.' },
          it: { title: 'Installazioni solari nel mondo crescono del 45% negli ultimi dodici mesi', summary: 'Costi di produzione più bassi portano energia pulita e autonomia anche nelle comunità remote.' },
          el: { title: 'Παγκόσμιες εγκαταστάσεις φωτοβολταϊκών αυξάνονται κατά 45% σε δώδεκα μήνες', summary: 'Χαμηλότερο κόστος παραγωγής προσφέρει ενεργειακή αυτονομία σε απομακρυσμένες περιοχές.' }
        }
      },
      {
        source: 'Good News Network', outletId: 'goodnews', category: 'goodnews', time: '4.5h ago', url: 'https://www.goodnewsnetwork.org',
        translations: {
          en: { title: 'Antarctic blue whale populations show remarkable resurgence after sixty years', summary: 'Marine biologists document booming pod sightings in protected Southern Ocean sanctuaries.' },
          de: { title: 'Blauwal-Bestände in der Antarktis erholen sich nach 60 Jahren eindrucksvoll', summary: 'Meeresbiologen verzeichnen erfreuliche Zuwächse in geschützten Gewässern des Südpolarmeers.' },
          es: { title: 'Las poblaciones de ballena azul antártica muestran una notable recuperación tras 60 años', summary: 'Biólogos marinos constatan un claro aumento de avistamientos en reservas del océano austral.' },
          fr: { title: 'Les populations de baleines bleues en Antarctique rebondissent nettement après 60 ans', summary: 'Des biologistes marins observent une multiplication des groupes dans l\'océan Austral protégé.' },
          it: { title: 'Popolazioni di balenottera azzurra in Antartide registrano una forte ripresa dopo 60 anni', summary: 'Biologi marini documentano un costante aumento di avvistamenti nelle aree protette.' },
          el: { title: 'Πληθυσμοί γαλάζιας φάλαινας στην Ανταρκτική ανακάμπτουν εντυπωσιακά μετά από 60 χρόνια', summary: 'Θαλάσσιοι βιολόγοι καταγράφουν σημαντική αύξηση πληθυσμού στους προστατευόμενους ωκεανούς.' }
        }
      },
      {
        source: 'Reuters', outletId: 'reuters', category: 'business', time: '5h ago', url: 'https://www.reuters.com',
        translations: {
          en: { title: 'Global cargo shipping launches first zero-emission green hydrogen maritime vessels', summary: 'Leading commercial transport fleets initiate zero-carbon deep sea trading routes.' },
          de: { title: 'Welthandel startet erste emissionsfreie Frachtschiffe mit grünem Wasserstoff', summary: 'Führende Hochsee-Reedereien nehmen emissionsfreie Übersee-Routen erfolgreich in Betrieb.' },
          es: { title: 'El transporte marítimo mundial estrena sus primeros buques con hidrógeno verde sin emisiones', summary: 'Grandes navieras inician rutas transoceánicas comerciales con cero emisiones de carbono.' },
          fr: { title: 'Le fret maritime mondial lance ses premiers cargos à hydrogène vert zéro émission', summary: 'Les plus grands armateurs inaugurent des routes océaniques commerciales décarbonées.' },
          it: { title: 'Trasporto marittimo mondiale inaugura le prime navi da carico a idrogeno verde', summary: 'Grandi flotte commerciali avviano rotte transoceaniche a emissioni zero.' },
          el: { title: 'Η παγκόσμια ναυτιλία εγκαινιάζει τα πρώτα φορτηγά πλοία με πράσινο υδρογόνο μηδενικών ρύπων', summary: 'Κορυφαίοι εμπορικοί στόλοι ξεκινούν θαλάσσιες διαδρομές χωρίς εκπομπές άνθρακα.' }
        }
      }
    ],

    // 🇦🇹 Österreich
    at: [
      {
        source: 'ORF News', outletId: 'orf', category: 'top', time: 'vor 20 Min', url: 'https://orf.at',
        translations: {
          de: { title: 'Österreich investiert 3 Milliarden Euro in den zukunftsfähigen Bahnausbau', summary: 'Koralmbahn und Zulaufstrecken verkürzen Reisezeiten im gesamten Alpenraum drastisch.' },
          en: { title: 'Austria invests 3 billion euros in modernized sustainable railway corridors', summary: 'New high-speed Alpine routes drastically reduce intercity travel times across Central Europe.' },
          es: { title: 'Austria invierte 3.000 millones de euros en la modernización de su red ferroviaria', summary: 'Nuevos trazados de alta velocidad en los Alpes reducen drásticamente los tiempos de viaje.' },
          fr: { title: 'L\'Autriche investit 3 milliards d\'euros dans l\'extension ferroviaire durable', summary: 'De nouvelles liaisons alpines réduisent considérablement les temps de trajet.' },
          it: { title: 'L\'Austria investe 3 miliardi di euro per modernizzare la rete ferroviaria alpina', summary: 'Nuove tratte ad alta velocità riducono drasticamente i tempi di percorrenza.' },
          el: { title: 'Η Αυστρία επενδύει 3 δισεκατομμύρια ευρώ στον εκσυγχρονισμό του σιδηροδρομικού δικτύου', summary: 'Νέες γραμμές υψηλής ταχύτητας μειώνουν δραστικά τους χρόνους ταξιδιού στις Άλπεις.' }
        }
      },
      {
        source: 'Der Standard', outletId: 'standard', category: 'top', time: 'vor 40 Min', url: 'https://www.derstandard.at',
        translations: {
          de: { title: 'Alpen-Wasserkraftwerke melden Rekord-Füllstände für saubere Energie', summary: 'Speicherkraftwerke in Tirol und Salzburg sichern stabile Stromversorgung zu günstigen Preisen.' },
          en: { title: 'Alpine hydropower reservoirs report record storage levels for clean energy', summary: 'Hydro facilities across Tyrol and Salzburg ensure reliable electricity at competitive rates.' },
          es: { title: 'Las centrales hidroeléctricas alpinas registran niveles récord de energía limpia', summary: 'Presas en Tirol y Salzburgo garantizan un suministro eléctrico estable y económico.' },
          fr: { title: 'Les centrales hydroélectriques alpines enregistrent des niveaux records', summary: 'Les barrages du Tyrol et de Salzbourg garantissent une énergie propre et économique.' },
          it: { title: 'Le centrali idroelettriche alpine registrano livelli record di energia pulita', summary: 'I bacini in Tirolo e Salisburgo assicurano forniture elettriche stabili e convenienti.' },
          el: { title: 'Υδροηλεκτρικοί σταθμοί των Άλπεων καταγράφουν επίπεδα ρεκόρ καθαρής ενέργειας', summary: 'Εγκαταστάσεις στο Τιρόλο και το Σάλτσμπουργκ εξασφαλίζουν σταθερή παροχή ρεύματος.' }
        }
      }
    ],

    // 🇨🇭 Schweiz
    ch: [
      {
        source: 'SRF News', outletId: 'srf', category: 'top', time: 'vor 22 Min', url: 'https://www.srf.ch',
        translations: {
          de: { title: 'Schweiz stärkt Innovationsstandort mit neuem Biotech-Campus', summary: 'Spitzenforschung an ETH Zürich und EPFL Lausanne zieht internationale Talente an.' },
          en: { title: 'Switzerland bolsters global innovation leadership with cutting-edge biotech hub', summary: 'Pioneering scientific research at ETH Zurich and EPFL Lausanne attracts global talent.' },
          es: { title: 'Suiza refuerza su liderazgo en innovación con un nuevo campus biotecnológico', summary: 'La investigación puntera en la ETH de Zúrich y la EPFL de Lausana atrae talento mundial.' },
          fr: { title: 'La Suisse renforce son pôle d\'innovation avec un nouveau campus biotech', summary: 'La recherche de pointe à l\'EPFL de Lausanne et l\'ETH de Zurich attire des talents mondiaux.' },
          it: { title: 'La Svizzera rafforza il primato nell\'innovazione con un nuovo hub biotecnologico', summary: 'La ricerca d\'avanguardia al Politecnico di Zurigo e Losanna attrae talenti internazionali.' },
          el: { title: 'Η Ελβετία ενισχύει την καινοτομία με νέο κόμβο βιοτεχνολογίας', summary: 'Κορυφαία έρευνα στο ETH Ζυρίχης και EPFL Λωζάνης προσελκύει διεθνή ταλέντα.' }
        }
      }
    ],

    // 🇬🇧 UK
    uk: [
      {
        source: 'BBC News', outletId: 'bbc', category: 'top', time: '20m ago', url: 'https://www.bbc.co.uk/news',
        translations: {
          en: { title: 'UK offshore wind farms generate record clean energy output across Britain', summary: 'Maritime wind turbines supply over 40% of peak electricity demand nationwide.' },
          de: { title: 'Britische Offshore-Windparks erzielen historischen Erzeugungsrekord', summary: 'Meereswindräder decken über 40 Prozent des Spitzenstrombedarfs in Großbritannien.' },
          es: { title: 'Los parques eólicos marinos de Reino Unido alcanzan récord de energía limpia', summary: 'Las turbinas marítimas cubren más del 40% del pico de demanda eléctrica en Gran Bretaña.' },
          fr: { title: 'Les parcs éoliens en mer du Royaume-Uni établissent un record d\'énergie propre', summary: 'Les éoliennes marines fournissent plus de 40% de la demande électrique de pointe.' },
          it: { title: 'Parchi eolici offshore nel Regno Unito generano un record di energia pulita', summary: 'Le turbine marittime coprono oltre il 40% del picco di domanda elettrica nel paese.' },
          el: { title: 'Υπεράκτια αιολικά πάρκα στο Ηνωμένο Βασίλειο παράγουν ρεκόρ καθαρής ενέργειας', summary: 'Οι θαλάσσιες ανεμογεννήτριες καλύπτουν πάνω από το 40% της ζήτησης ρεύματος.' }
        }
      }
    ],

    // 🇺🇸 USA
    us: [
      {
        source: 'NPR News', outletId: 'npr', category: 'top', time: '15m ago', url: 'https://www.npr.org',
        translations: {
          en: { title: 'Nationwide electrical grid modernization accelerates clean energy integration', summary: 'Smart interconnections and transmission upgrades enhance reliability across all states.' },
          de: { title: 'Modernisierung des US-Stromnetzes beschleunigt Ausbau sauberer Energien', summary: 'Intelligente Netzknoten und moderne Übertragungsleitungen steigern Zuverlässigkeit landesweit.' },
          es: { title: 'La modernización de la red eléctrica nacional acelera la integración de renovables', summary: 'Nuevas interconexiones inteligentes aumentan la fiabilidad energética en todo el país.' },
          fr: { title: 'La modernisation du réseau électrique américain accélère la transition énergétique', summary: 'Des interconnexions intelligentes renforcent la fiabilité sur l\'ensemble du territoire.' },
          it: { title: 'La modernizzazione della rete elettrica nazionale accelera l\'integrazione verde', summary: 'Nuove interconnessioni intelligenti aumentano l\'affidabilità della fornitura energetica.' },
          el: { title: 'Ο εκσυγχρονισμός του ηλεκτρικού δικτύου επιταχύνει την ένταξη καθαρής ενέργειας', summary: 'Έξυπνες διασυνδέσεις αυξάνουν την αξιοπιστία της παροχής ρεύματος.' }
        }
      }
    ],

    // 🇫🇷 France
    fr: [
      {
        source: 'France Info', outletId: 'franceinfo', category: 'top', time: 'il y a 20 min', url: 'https://www.francetvinfo.fr',
        translations: {
          fr: { title: 'La France accélère sa transition écologique avec de nouveaux parcs éoliens maritimes', summary: 'Plus de 35% d\'électricité verte produite grâce aux nouvelles infrastructures côtières.' },
          de: { title: 'Frankreich beschleunigt Energiewende mit neuen Meereswindparks', summary: 'Über 35 Prozent Ökostrom dank moderner Meeres-Infrastruktur und Offshore-Anlagen.' },
          es: { title: 'Francia acelera su transición ecológica con nuevos parques eólicos marinos', summary: 'Más del 35% de electricidad limpia generada gracias a infraestructuras costeras avanzadas.' },
          en: { title: 'France accelerates ecological transition with new offshore wind projects', summary: 'Over 35% clean electricity produced thanks to advanced coastal offshore infrastructure.' },
          it: { title: 'La Francia accelera la transizione ecologica con nuovi parchi eolici marini', summary: 'Oltre il 35% di elettricità verde prodotta grazie alle nuove infrastrutture marittime.' },
          el: { title: 'Η Γαλλία επιταχύνει την οικολογική μετάβαση με νέα υπεράκτια αιολικά πάρκα', summary: 'Πάνω από το 35% καθαρής ηλεκτρικής ενέργειας παράγεται χάρη σε νέες υποδομές.' }
        }
      }
    ],

    // 🇮🇹 Italia
    it: [
      {
        source: 'ANSA Top', outletId: 'ansa', category: 'top', time: '20 min fa', url: 'https://www.ansa.it',
        translations: {
          it: { title: 'Italia approva il piano strategico per l\'innovazione verde e digitale', summary: 'Investimenti per modernizzare i trasporti ferroviari ed espandere le energie rinnovabili.' },
          de: { title: 'Italien verabschiedet strategischen Zukunftsplan für grüne und digitale Innovation', summary: 'Milliardeninvestitionen in moderne Bahninfrastruktur und flächendeckende Solarenergie.' },
          es: { title: 'Italia aprueba su plan estratégico para la innovación verde y digital', summary: 'Inversiones para modernizar el transporte ferroviario y expandir las energías limpias.' },
          en: { title: 'Italy enacts strategic blueprint for green and digital infrastructure innovation', summary: 'High-impact investments modernize high-speed rail lines and expand renewable power.' },
          fr: { title: 'L\'Italie adopte un plan stratégique pour l\'innovation verte et numérique', summary: 'Investissements majeurs pour moderniser les transports ferroviaires et les énergies propres.' },
          el: { title: 'Η Ιταλία εγκρίνει στρατηγικό σχέδιο για την πράσινη και ψηφιακή καινοτομία', summary: 'Επενδύσεις για τον εκσυγχρονισμό των σιδηροδρόμων και την επέκταση των ανανεώσιμων πηγών.' }
        }
      }
    ]
  };

  // ============================================================================
  // 2. STATE MANAGEMENT & SYNCHRONIZATION
  // ============================================================================

  function detectInitialNewsLang() {
    const saved = localStorage.getItem('flow_news_lang');
    if (saved && NEWS_LANGUAGES.some(l => l.id === saved)) return saved;
    const appLang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'de';
    if (NEWS_LANGUAGES.some(l => l.id === appLang)) return appLang;
    return 'de';
  }

  function detectUserRegion() {
    const saved = localStorage.getItem('flow_news_region');
    if (saved && REGIONS.some(r => r.id === saved)) {
      return saved;
    }
    // Check weather location
    try {
      const weatherLoc = JSON.parse(localStorage.getItem('flow_weather_loc') || 'null');
      if (weatherLoc) {
        const s = ((weatherLoc.country || '') + ' ' + (weatherLoc.name || '')).toLowerCase();
        if (s.includes('österreich') || s.includes('austria') || s.includes('wien')) return 'at';
        if (s.includes('schweiz') || s.includes('switzerland') || s.includes('zürich')) return 'ch';
        if (s.includes('deutschland') || s.includes('germany') || s.includes('berlin')) return 'de';
        if (s.includes('united kingdom') || s.includes('london') || s.includes('uk')) return 'uk';
        if (s.includes('united states') || s.includes('usa') || s.includes('new york')) return 'us';
        if (s.includes('france') || s.includes('paris')) return 'fr';
        if (s.includes('españa') || s.includes('spain') || s.includes('madrid')) return 'es';
        if (s.includes('italia') || s.includes('italy') || s.includes('roma')) return 'it';
        if (s.includes('greece') || s.includes('ελλάδα') || s.includes('athens')) return 'gr';
      }
    } catch (e) {}

    // Check browser language
    try {
      const navLang = (navigator.language || '').toLowerCase();
      if (navLang.includes('de-at')) return 'at';
      if (navLang.includes('de-ch')) return 'ch';
      if (navLang.startsWith('de')) return 'de';
      if (navLang.includes('en-gb') || navLang.includes('en-uk')) return 'uk';
      if (navLang.startsWith('en')) return 'us';
      if (navLang.startsWith('fr')) return 'fr';
      if (navLang.startsWith('es')) return 'es';
      if (navLang.startsWith('it')) return 'it';
      if (navLang.startsWith('el')) return 'gr';
    } catch (e) {}

    const appLang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'de';
    if (appLang === 'de') return 'de';
    if (appLang === 'fr') return 'fr';
    if (appLang === 'es') return 'es';
    if (appLang === 'it') return 'it';
    if (appLang === 'el') return 'gr';
    return 'de';
  }

  // Radio Audio State
  let currentStationId = localStorage.getItem('flow_radio_station') || 'dlf';
  let isRadioPlaying = false;
  let radioVolume = parseFloat(localStorage.getItem('flow_radio_vol') || '0.7');
  let radioAudioEl = null;

  // News Dimensions (Vollständig unabhängig voneinander)
  let currentNewsLang = detectInitialNewsLang();
  let currentRegion = detectUserRegion();
  let feedMixMode = localStorage.getItem('flow_news_feed_mode') || 'hybrid'; // Standard: Wechselnd Global & Lokal
  let currentCategory = localStorage.getItem('flow_news_category') || 'all';
  let currentMedia = localStorage.getItem('flow_news_media') || 'all';
  let searchQuery = '';
  let activeTab = 'news';

  // TTS State
  let isSpeakingQueue = false;
  let isTtsPaused = false;
  let currentSpeakingIndex = -1;
  let speechRate = parseFloat(localStorage.getItem('flow_news_speech_rate') || '1.15');
  let currentNewsItems = [];
  let isLiveFetching = false;
  let cachedNewsByRegion = {};
  let cachedNewsTimestamp = {};
  let liveTranslationCache = {};
  let newsAutoRefreshInterval = null;

  // Ticker State & Subheader Animation
  let currentTickerIndex = 0;
  let shownNewsHistory = [];
  let tickerSpeedSec = parseInt(localStorage.getItem('flow_ticker_speed') || '7', 10);
  let tickerAutoSwapInterval = null;
  let isTickerHoverPaused = false;
  let isTickerSuppressed = false; // Unterdrückt Ticker-Meldung, wenn links Anleitung aktiv ist

  // Instruction Ticker Guide State (Jede 3 News-Schlagzeilen wechselnd 1 Anleitung links - 3:1 Rhythmus)
  let newsHeadlinesShownCount = 0;
  const NEWS_HEADLINES_PER_INSTRUCTION = 3;
  let isInstructionActive = false;
  let isInstructionHovered = false;
  let instructionHideTimer = null;
  let currentInstructionIndex = 0;
  // Aliases für Abwärtskompatibilität
  let currentFeatureTipIndex = 0;
  let featureTipIntervalTimer = null;
  let featureTipHideTimer = null;
  let isFeatureHintHovered = false;

  // Vibrant Palette for Ticker Headlines
  const NEWS_VIBRANT_PALETTE = [
    { name: 'electric-violet', hex: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', bg: 'rgba(192, 132, 252, 0.18)', border: 'rgba(192, 132, 252, 0.5)' },
    { name: 'sky-blue', hex: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)', bg: 'rgba(56, 189, 248, 0.18)', border: 'rgba(56, 189, 248, 0.5)' },
    { name: 'neon-lime', hex: '#a3e635', glow: 'rgba(163, 230, 53, 0.6)', bg: 'rgba(163, 230, 53, 0.18)', border: 'rgba(163, 230, 53, 0.5)' },
    { name: 'coral-orange', hex: '#ff7a00', glow: 'rgba(255, 122, 0, 0.6)', bg: 'rgba(255, 122, 0, 0.18)', border: 'rgba(255, 122, 0, 0.5)' },
    { name: 'hot-magenta', hex: '#e879f9', glow: 'rgba(232, 121, 249, 0.6)', bg: 'rgba(232, 121, 249, 0.18)', border: 'rgba(232, 121, 249, 0.5)' },
    { name: 'mint-teal', hex: '#14b8a6', glow: 'rgba(20, 184, 166, 0.6)', bg: 'rgba(20, 184, 166, 0.18)', border: 'rgba(20, 184, 166, 0.5)' }
  ];

  function getNextNonRepeatingIndex(items) {
    if (!items || items.length === 0) return 0;
    if (items.length === 1) return 0;

    const historyLimit = Math.max(1, Math.min(items.length - 1, Math.floor(items.length * 0.75)));
    
    const candidateIndices = [];
    for (let i = 0; i < items.length; i++) {
      const itemKey = items[i].title || String(i);
      if (!shownNewsHistory.includes(itemKey) && i !== currentTickerIndex) {
        candidateIndices.push(i);
      }
    }

    let nextIdx;
    if (candidateIndices.length > 0) {
      nextIdx = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    } else {
      const curKey = items[currentTickerIndex]?.title || '';
      shownNewsHistory = curKey ? [curKey] : [];
      const remaining = items.map((_, i) => i).filter(i => i !== currentTickerIndex);
      nextIdx = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : 0;
    }

    const chosenKey = items[nextIdx]?.title || String(nextIdx);
    shownNewsHistory.push(chosenKey);
    while (shownNewsHistory.length > historyLimit) {
      shownNewsHistory.shift();
    }

    return nextIdx;
  }

  // ============================================================================
  // 3. RADIO PLAYER CORE
  // ============================================================================

  function getRadioAudio() {
    if (!radioAudioEl) {
      radioAudioEl = new Audio();
      radioAudioEl.preload = 'none';
      radioAudioEl.volume = radioVolume;

      radioAudioEl.addEventListener('playing', () => {
        isRadioPlaying = true;
        updateRadioUIState(true);
      });
      radioAudioEl.addEventListener('pause', () => {
        isRadioPlaying = false;
        updateRadioUIState(false);
      });
      radioAudioEl.addEventListener('error', (e) => {
        console.warn('[Radio Engine] Stream error:', e);
        isRadioPlaying = false;
        updateRadioUIState(false);
      });
    }
    return radioAudioEl;
  }

  let isRadioDucked = false;
  let radioDuckingInterval = null;

  function duckRadio(isDucked) {
    const audio = getRadioAudio();
    if (!audio) return;
    if (radioDuckingInterval) {
      clearInterval(radioDuckingInterval);
      radioDuckingInterval = null;
    }
    isRadioDucked = isDucked;
    const baseVol = typeof radioVolume !== 'undefined' ? radioVolume : 0.7;
    const targetVol = isDucked ? (baseVol * 0.18) : baseVol;
    const startVol = audio.volume;
    const steps = 12;
    const duration = isDucked ? 180 : 450;
    const stepTime = duration / steps;
    let step = 0;
    radioDuckingInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * progress));
      if (step >= steps) {
        clearInterval(radioDuckingInterval);
        radioDuckingInterval = null;
        audio.volume = targetVol;
      }
    }, stepTime);
  }

  function playRadioStation(stationId) {
    const station = RADIO_STATIONS.find(s => s.id === stationId);
    if (!station) return;

    if (currentStationId === stationId && isRadioPlaying && radioAudioEl) {
      toggleRadioPlayback();
      return;
    }

    currentStationId = stationId;
    localStorage.setItem('flow_radio_station', stationId);

    if (isSpeakingQueue) stopNewsReader();

    // Exklusivität: Umgebungsgeräusche stoppen
    try {
      if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
      if (typeof stopAllStudioAudio === 'function') stopAllStudioAudio();
      if (typeof pauseMusicTrack === 'function') pauseMusicTrack();
    } catch(e) {}

    const audio = getRadioAudio();
    try {
      audio.pause();
      audio.src = station.stream;
      audio.load();
      audio.volume = isRadioDucked ? (radioVolume * 0.18) : radioVolume;
      audio.play().then(() => {
        isRadioPlaying = true;
        updateRadioUIState(true);
        if (typeof showToast === 'function') {
          showToast(`📻 ${station.flag} ${station.name}`);
        }
      }).catch(() => {
        isRadioPlaying = false;
        updateRadioUIState(false);
      });
    } catch (err) {
      isRadioPlaying = false;
      updateRadioUIState(false);
    }
    renderRadioPanelContent();
  }

  function toggleRadioPlayback() {
    const audio = getRadioAudio();
    if (isRadioPlaying) {
      audio.pause();
      isRadioPlaying = false;
      updateRadioUIState(false);
    } else {
      try {
        if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
        if (typeof stopAllStudioAudio === 'function') stopAllStudioAudio();
      } catch(e) {}
      playRadioStation(currentStationId);
    }
    renderRadioPanelContent();
  }

  function setRadioVolume(val) {
    radioVolume = Math.max(0, Math.min(1, parseFloat(val)));
    localStorage.setItem('flow_radio_vol', radioVolume.toString());
    const audio = getRadioAudio();
    if (!isRadioDucked) {
      audio.volume = radioVolume;
    }
  }

  function updateRadioUIState(isPlaying) {
    const playBtn = document.getElementById('radio-main-play-btn');
    if (playBtn) {
      playBtn.innerHTML = isPlaying 
        ? '<i data-lucide="pause" class="w-4 h-4 fill-white"></i>' 
        : '<i data-lucide="play" class="w-4 h-4 fill-white ml-0.5"></i>';
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  // ============================================================================
  // 4. TRANSLATION ENGINE & RSS AGGREGATOR
  // ============================================================================

  // Übersetzt einen Artikel in die gewünschte Ausgabesprache (currentNewsLang)
  function localizeArticle(rawItem, targetLang) {
    if (!rawItem) return null;
    const lang = targetLang || currentNewsLang || 'de';

    // 1. Wenn der Artikel eine kuratierte Übersetzung für diese Sprache hat:
    if (rawItem.translations && rawItem.translations[lang]) {
      const tr = rawItem.translations[lang];
      return {
        ...rawItem,
        title: tr.title,
        summary: tr.summary,
        originLang: rawItem.originLang || rawItem.defaultLang || 'de',
        isTranslated: (rawItem.originLang || 'de') !== lang
      };
    }

    // 2. Fallback auf andere vorhandene Sprachen
    let fallbackTitle = rawItem.title || '';
    let fallbackSummary = rawItem.summary || '';
    if (rawItem.translations) {
      const availableLangs = Object.keys(rawItem.translations);
      if (availableLangs.length > 0) {
        const firstTr = rawItem.translations[availableLangs[0]];
        fallbackTitle = firstTr.title;
        fallbackSummary = firstTr.summary;
      }
    }

    return {
      ...rawItem,
      title: fallbackTitle,
      summary: fallbackSummary,
      originLang: rawItem.originLang || 'de',
      isTranslated: (rawItem.originLang || 'de') !== lang
    };
  }

  function parseRssXml(xmlText, defaultSource = 'News') {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      if (!items || items.length === 0) return [];
      
      const results = [];
      items.forEach((item, idx) => {
        if (idx >= 15) return;
        const title = item.querySelector('title')?.textContent?.trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || '#';
        const desc = item.querySelector('description')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
        
        if (!title) return;
        const cleanDesc = desc
          .replace(/<[^>]*>?/gm, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .trim();

        let timeLabel = 'vorhin';
        if (pubDate) {
          const diffMins = Math.round((Date.now() - new Date(pubDate).getTime()) / 60000);
          if (diffMins > 0 && diffMins < 60) timeLabel = `vor ${diffMins}m`;
          else if (diffMins >= 60 && diffMins < 1440) timeLabel = `vor ${Math.round(diffMins/60)}h`;
        }

        results.push({
          title,
          summary: cleanDesc || title,
          source: defaultSource,
          category: idx % 3 === 0 ? 'top' : (idx % 3 === 1 ? 'tech' : 'science'),
          time: timeLabel,
          url: link,
          originLang: REGIONS.find(r => r.id === currentRegion)?.defaultLang || 'de'
        });
      });
      return results;
    } catch (e) {
      return [];
    }
  }

  async function fetchNewsForRegion(region, forceRefresh = false) {
    const reg = region || currentRegion || 'de';
    
    // 1. Lokale Fallbacks sofort laden
    const fallbackList = FALLBACK_NEWS_DATABASE[reg] || FALLBACK_NEWS_DATABASE.de || [];
    if (!currentNewsItems || currentNewsItems.length === 0 || forceRefresh) {
      currentNewsItems = [...fallbackList];
    }
    applyFilterAndRender();

    const cacheAge = Date.now() - (cachedNewsTimestamp[reg] || 0);
    if (!forceRefresh && cachedNewsByRegion[reg] && cachedNewsByRegion[reg].length > 0 && cacheAge < 5 * 60 * 1000) {
      currentNewsItems = [...cachedNewsByRegion[reg]];
      applyFilterAndRender();
      return;
    }

    // 2. Live-Feed über RSS versuchen (Parallel von bis zu 3 Quellen)
    if (typeof navigator !== 'undefined' && navigator.onLine && LOCAL_MEDIA_OUTLETS[reg]) {
      const outlets = LOCAL_MEDIA_OUTLETS[reg].filter(o => o.rss);
      if (outlets.length > 0) {
        isLiveFetching = true;
        updateNewsFetchIndicator(true);

        const targetOutlets = outlets.slice(0, 3);
        const fetchPromises = targetOutlets.map(async (targetOutlet) => {
          try {
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetOutlet.rss)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data && data.items && data.items.length > 0) {
                return data.items.slice(0, 10).map((item, idx) => {
                  const cleanDesc = (item.description || item.content || '')
                    .replace(/<[^>]*>?/gm, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .trim();

                  let timeLabel = 'vorhin';
                  if (item.pubDate) {
                    const diffMins = Math.round((Date.now() - new Date(item.pubDate).getTime()) / 60000);
                    if (diffMins > 0 && diffMins < 60) timeLabel = `vor ${diffMins}m`;
                    else if (diffMins >= 60 && diffMins < 1440) timeLabel = `vor ${Math.round(diffMins/60)}h`;
                  }

                  return {
                    title: item.title ? item.title.trim() : '',
                    summary: cleanDesc || item.title || '',
                    source: data.feed?.title?.split('-')[0]?.trim() || targetOutlet.name,
                    category: idx % 3 === 0 ? 'top' : (idx % 3 === 1 ? 'tech' : 'science'),
                    time: timeLabel,
                    url: item.link || '#',
                    originLang: REGIONS.find(r => r.id === reg)?.defaultLang || 'de'
                  };
                }).filter(it => it.title);
              }
            }
          } catch (e) {}
          return [];
        });

        try {
          const settled = await Promise.allSettled(fetchPromises);
          let fetchedItems = [];
          settled.forEach(res => {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
              fetchedItems.push(...res.value);
            }
          });

          if (fetchedItems.length > 0) {
            const combined = [...fetchedItems, ...fallbackList];
            const seen = new Set();
            const unique = combined.filter(it => {
              const k = (it.title || '').toLowerCase().trim();
              if (!k || seen.has(k)) return false;
              seen.add(k);
              return true;
            });
            currentNewsItems = unique;
            cachedNewsByRegion[reg] = unique;
            cachedNewsTimestamp[reg] = Date.now();
            applyFilterAndRender();
          }
        } catch (err) {}

        isLiveFetching = false;
        updateNewsFetchIndicator(false);
      }
    }
  }

  function updateNewsFetchIndicator(isFetching) {
    const indicator = document.getElementById('news-live-indicator');
    if (indicator) {
      if (isFetching) indicator.classList.remove('hidden');
      else indicator.classList.add('hidden');
    }
  }

  // ============================================================================
  // 5. HYBRID ALTERNATING FEED & FILTERING LOGIC
  // ============================================================================

  // 1. Sprache wählen
  function selectLanguage(langId) {
    if (!NEWS_LANGUAGES.some(l => l.id === langId)) return;
    currentNewsLang = langId;
    try { localStorage.setItem('flow_news_lang', langId); } catch(e) {}
    stopNewsReader();
    updateAllSelectorsUI();
    applyFilterAndRender();
    if (typeof showToast === 'function') {
      const l = NEWS_LANGUAGES.find(x => x.id === langId);
      showToast(`🌐 Ausgabesprache: ${l.flag} ${l.name}`);
    }
  }

  // Bei Sprachwechsel der gesamten Anwendung synchronisieren
  function syncAppLanguage(langId) {
    if (NEWS_LANGUAGES.some(l => l.id === langId)) {
      currentNewsLang = langId;
      try { localStorage.setItem('flow_news_lang', langId); } catch(e) {}
      updateAllSelectorsUI();
      applyFilterAndRender();
    }
  }

  // 2. Region wählen (unabhängig von der Sprache!)
  function selectRegion(regionId) {
    if (!REGIONS.some(r => r.id === regionId)) return;
    currentRegion = regionId;
    currentMedia = 'all';
    try {
      localStorage.setItem('flow_news_region', regionId);
      localStorage.setItem('flow_news_media', 'all');
    } catch(e) {}
    stopNewsReader();
    const fallbackList = FALLBACK_NEWS_DATABASE[regionId] || FALLBACK_NEWS_DATABASE.de || [];
    currentNewsItems = [...fallbackList];
    updateAllSelectorsUI();
    fetchNewsForRegion(currentRegion);
  }

  // 3. Feed-Modus wählen (Wechselnd / Nur Lokal / Nur Global)
  function selectFeedMode(modeId) {
    if (!FEED_MODES.some(m => m.id === modeId)) return;
    feedMixMode = modeId;
    try { localStorage.setItem('flow_news_feed_mode', modeId); } catch(e) {}
    stopNewsReader();
    updateAllSelectorsUI();
    applyFilterAndRender();
  }

  // 4. Kategorie / Thema wählen
  function selectCategory(catId) {
    currentCategory = catId;
    try { localStorage.setItem('flow_news_category', catId); } catch(e) {}
    stopNewsReader();
    updateAllSelectorsUI();
    applyFilterAndRender();
  }

  // 5. Quelle / Medium wählen
  function selectMedia(mediaId) {
    currentMedia = mediaId;
    try { localStorage.setItem('flow_news_media', mediaId); } catch(e) {}
    stopNewsReader();
    updateAllSelectorsUI();
    applyFilterAndRender();
  }

  function handleNewsSearch(val) {
    searchQuery = (val || '').trim().toLowerCase();
    applyFilterAndRender();
  }

  // Filterung und automatisches Abwechseln (Hybrid: International ⟷ Lokal)
  function getFilteredNewsItems() {
    const reg = currentRegion || 'de';
    const localBase = FALLBACK_NEWS_DATABASE[reg] || FALLBACK_NEWS_DATABASE.de || [];
    let localItems = (currentNewsItems && currentNewsItems.length > 0) ? [...currentNewsItems] : [...localBase];
    const globalBase = FALLBACK_NEWS_DATABASE.global || [];

    // Lokale Items lokalisieren / übersetzen
    localItems = localItems.map(it => {
      const loc = localizeArticle(it, currentNewsLang);
      return { ...loc, scope: 'local', regionId: reg };
    });

    // Globale Items lokalisieren / übersetzen
    const globalItems = globalBase.map(it => {
      const loc = localizeArticle(it, currentNewsLang);
      return { ...loc, scope: 'global', regionId: 'global' };
    });

    // 1. Kategoriefilter anwenden
    if (currentCategory && currentCategory !== 'all') {
      localItems = localItems.filter(it => it.category === currentCategory);
    }
    const filteredGlobal = (currentCategory && currentCategory !== 'all')
      ? globalItems.filter(it => it.category === currentCategory)
      : globalItems;

    // 2. Medienfilter anwenden (gilt für lokale Quellen)
    if (currentMedia && currentMedia !== 'all') {
      const outlets = LOCAL_MEDIA_OUTLETS[reg] || [];
      const outletObj = outlets.find(o => o.id === currentMedia);
      if (outletObj && outletObj.match) {
        localItems = localItems.filter(it => {
          const s = (it.source || '').toLowerCase();
          return outletObj.match.some(m => s.includes(m));
        });
      }
    }

    // 3. Zusammenstellung gemäß FEED-MODUS
    let finalFeed = [];
    if (feedMixMode === 'local' || reg === 'global') {
      finalFeed = localItems.length > 0 ? localItems : localBase.map(it => localizeArticle(it, currentNewsLang));
    } else if (feedMixMode === 'global') {
      finalFeed = filteredGlobal.length > 0 ? filteredGlobal : globalBase.map(it => localizeArticle(it, currentNewsLang));
    } else {
      // STANDARD HYBRID-MODUS: Automatisch abwechselnd Lokal ⟷ International
      const maxLen = Math.max(localItems.length, filteredGlobal.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < localItems.length) finalFeed.push(localItems[i]);
        if (i < filteredGlobal.length) finalFeed.push(filteredGlobal[i]);
      }
      if (finalFeed.length === 0) {
        finalFeed = localBase.map(it => localizeArticle(it, currentNewsLang));
      }
    }

    // 4. Suchfilter
    if (searchQuery) {
      finalFeed = finalFeed.filter(it =>
        (it.title || '').toLowerCase().includes(searchQuery) ||
        (it.summary || '').toLowerCase().includes(searchQuery) ||
        (it.source || '').toLowerCase().includes(searchQuery)
      );
    }

    return finalFeed;
  }

  function applyFilterAndRender() {
    const items = getFilteredNewsItems();
    renderNewsCards(items);
    renderTickerMarquee(items);
    renderSubheaderTicker(items);
    updateItemsCount(items.length);
  }

  function updateItemsCount(count) {
    const el = document.getElementById('news-count-badge');
    if (el) {
      el.textContent = `${count} Meldungen`;
    }
  }

  // ============================================================================
  // 6. SYNCHRONIZED UI SELECTORS (NEWS LOUNGE & SUBHEADER TICKER POPOVER)
  // ============================================================================

  function renderLanguageSelectors() {
    // A. Im Tool-Panel (#news-language-selector)
    const toolEl = document.getElementById('news-language-selector');
    if (toolEl) {
      toolEl.innerHTML = NEWS_LANGUAGES.map(l => {
        const isSelected = l.id === currentNewsLang;
        return `
          <button onclick="RadioNewsEngine.selectLanguage('${l.id}')" class="px-2.5 py-1 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
            isSelected
              ? 'bg-purple-500/30 text-white border border-purple-400/70 shadow-sm font-bold ring-1 ring-purple-400/40'
              : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 border border-white/10 font-medium'
          }">
            <span class="text-sm leading-none">${l.flag}</span>
            <span class="text-[11px] whitespace-nowrap">${l.name}</span>
          </button>
        `;
      }).join('');
    }

    // B. Im Ticker-Popover (#ticker-settings-language-grid)
    const tickerGrid = document.getElementById('ticker-settings-language-grid');
    if (tickerGrid) {
      tickerGrid.innerHTML = NEWS_LANGUAGES.map(l => {
        const isSelected = l.id === currentNewsLang;
        return `
          <button onclick="RadioNewsEngine.selectLanguage('${l.id}')" class="p-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all ${
            isSelected
              ? 'bg-purple-500/35 text-white border border-purple-400/70 font-bold shadow-sm ring-1 ring-purple-400/40'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-medium'
          }" title="${l.name}">
            <span class="text-base leading-none">${l.flag}</span>
            <span class="text-[9px] font-mono font-bold uppercase">${l.id}</span>
          </button>
        `;
      }).join('');
    }

    // Status Badges aktualisieren
    const curLangObj = NEWS_LANGUAGES.find(l => l.id === currentNewsLang);
    const badgeText = curLangObj ? `${curLangObj.flag} ${curLangObj.name}` : 'Auto';
    const toolBadge = document.getElementById('news-lang-badge-status');
    if (toolBadge) toolBadge.textContent = badgeText;
    const tickerBadge = document.getElementById('ticker-lang-badge-status');
    if (tickerBadge) tickerBadge.textContent = badgeText;
  }

  function renderRegionSelectors() {
    // A. Im Tool-Panel (#news-region-selector)
    const toolEl = document.getElementById('news-region-selector');
    if (toolEl) {
      toolEl.innerHTML = REGIONS.map(reg => {
        const isSelected = reg.id === currentRegion;
        return `
          <button onclick="RadioNewsEngine.selectRegion('${reg.id}')" class="px-2.5 py-1 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
            isSelected
              ? 'bg-purple-500/30 text-white border border-purple-400/70 shadow-sm font-bold ring-1 ring-purple-400/40'
              : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 border border-white/10 font-medium'
          }">
            <span class="text-sm leading-none">${reg.flag}</span>
            <span class="text-[11px] whitespace-nowrap">${reg.name}</span>
          </button>
        `;
      }).join('');
    }

    // B. Im Ticker-Popover (#ticker-settings-region-grid)
    const tickerGrid = document.getElementById('ticker-settings-region-grid');
    if (tickerGrid) {
      tickerGrid.innerHTML = REGIONS.map(reg => {
        const isSelected = reg.id === currentRegion;
        return `
          <button onclick="RadioNewsEngine.selectRegion('${reg.id}')" class="p-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all ${
            isSelected
              ? 'bg-purple-500/35 text-white border border-purple-400/70 font-bold shadow-sm ring-1 ring-purple-400/40'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-medium'
          }" title="${reg.name}">
            <span class="text-base leading-none">${reg.flag}</span>
            <span class="text-[9px] font-mono font-bold uppercase">${reg.id}</span>
          </button>
        `;
      }).join('');
    }
  }

  function renderFeedModeSelectors() {
    // A. Im Tool-Panel (#news-mode-selector)
    const toolEl = document.getElementById('news-mode-selector');
    if (toolEl) {
      toolEl.innerHTML = FEED_MODES.map(m => {
        const isSelected = m.id === feedMixMode;
        return `
          <button onclick="RadioNewsEngine.selectFeedMode('${m.id}')" class="px-2.5 py-1 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
            isSelected
              ? 'bg-gradient-to-r from-purple-500/35 to-cyan-500/35 text-white border border-cyan-400/60 shadow-sm font-bold ring-1 ring-cyan-400/40'
              : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 border border-white/10 font-medium'
          }" title="${m.desc}">
            <span>${m.icon}</span>
            <span class="text-[11px] whitespace-nowrap">${m.name}</span>
          </button>
        `;
      }).join('');
    }

    // B. Im Ticker-Popover (#ticker-settings-mode-grid)
    const tickerGrid = document.getElementById('ticker-settings-mode-grid');
    if (tickerGrid) {
      tickerGrid.innerHTML = FEED_MODES.map(m => {
        const isSelected = m.id === feedMixMode;
        return `
          <button onclick="RadioNewsEngine.selectFeedMode('${m.id}')" class="p-1 px-1.5 rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer select-none transition-all text-[10.5px] ${
            isSelected
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/70 font-bold shadow-xs ring-1 ring-cyan-400/40'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-medium'
          }" title="${m.desc}">
            <span>${m.icon}</span>
            <span class="truncate font-semibold">${m.shortName}</span>
          </button>
        `;
      }).join('');
    }
  }

  function renderCategorySelectors() {
    // A. Im Tool-Panel (#news-category-selector)
    const toolEl = document.getElementById('news-category-selector');
    if (toolEl) {
      toolEl.innerHTML = CATEGORIES.map(cat => {
        const isSelected = cat.id === currentCategory;
        return `
          <button onclick="RadioNewsEngine.selectCategory('${cat.id}')" class="px-2.5 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
            isSelected
              ? 'bg-gradient-to-r from-purple-500/35 to-pink-500/35 text-white border border-purple-400/60 font-bold shadow-xs ring-1 ring-purple-400/40'
              : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 border border-white/8 font-medium'
          }">
            <span>${cat.emoji}</span>
            <span class="whitespace-nowrap">${cat.name}</span>
          </button>
        `;
      }).join('');
    }

    // B. Im Ticker-Popover (#ticker-settings-category-grid)
    const tickerGrid = document.getElementById('ticker-settings-category-grid');
    if (tickerGrid) {
      tickerGrid.innerHTML = CATEGORIES.map(cat => {
        const isSelected = cat.id === currentCategory;
        return `
          <button onclick="RadioNewsEngine.selectCategory('${cat.id}')" class="p-1 px-1.5 rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer select-none transition-all text-[10px] ${
            isSelected
              ? 'bg-purple-500/35 text-white border border-purple-400/70 font-bold shadow-xs ring-1 ring-purple-400/40'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-medium'
          }">
            <span class="text-xs">${cat.emoji}</span>
            <span class="truncate font-semibold">${cat.name.replace(' & ', '/').replace('Themen', '').trim()}</span>
          </button>
        `;
      }).join('');
    }
  }

  function renderMediaSelectors() {
    const outlets = LOCAL_MEDIA_OUTLETS[currentRegion] || LOCAL_MEDIA_OUTLETS.de || [];

    // A. Im Tool-Panel (#news-media-selector)
    const toolEl = document.getElementById('news-media-selector');
    if (toolEl) {
      toolEl.innerHTML = outlets.map(o => {
        const isSelected = o.id === currentMedia;
        return `
          <button onclick="RadioNewsEngine.selectMedia('${o.id}')" class="px-2.5 py-0.5 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer select-none shrink-0 ${
            isSelected
              ? 'bg-teal-500/30 text-teal-100 border border-teal-400/60 font-bold shadow-xs'
              : 'bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-gray-200 border border-white/5 font-normal'
          }">
            ${o.icon ? `<span>${o.icon}</span>` : ''}
            <span class="whitespace-nowrap">${o.name}</span>
          </button>
        `;
      }).join('');
    }

    // B. Im Ticker-Popover (#ticker-settings-media-grid)
    const tickerGrid = document.getElementById('ticker-settings-media-grid');
    if (tickerGrid) {
      tickerGrid.innerHTML = outlets.map(o => {
        const isSelected = o.id === currentMedia;
        return `
          <button onclick="RadioNewsEngine.selectMedia('${o.id}')" class="px-2 py-0.5 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer select-none ${
            isSelected
              ? 'bg-teal-500/30 text-teal-100 border border-teal-400/60 font-bold shadow-xs'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
          }">
            ${o.icon ? `<span class="text-xs">${o.icon}</span>` : ''}
            <span class="whitespace-nowrap font-medium">${o.name}</span>
          </button>
        `;
      }).join('');
    }
  }

  function updateAllSelectorsUI() {
    renderLanguageSelectors();
    renderRegionSelectors();
    renderFeedModeSelectors();
    renderCategorySelectors();
    renderMediaSelectors();

    const subtext = document.getElementById('ticker-options-subtext');
    if (subtext) {
      const regObj = REGIONS.find(r => r.id === currentRegion);
      const langObj = NEWS_LANGUAGES.find(l => l.id === currentNewsLang);
      const catObj = CATEGORIES.find(c => c.id === currentCategory);
      subtext.textContent = `${regObj ? regObj.id.toUpperCase() : 'DE'} → ${langObj ? langObj.id.toUpperCase() : 'DE'} · ${catObj ? catObj.name : 'Alle'}`;
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  // ============================================================================
  // 7. CARDS & SUBHEADER TICKER RENDERING
  // ============================================================================

  function renderNewsCards(items) {
    const listContainer = document.getElementById('news-items-container');
    if (!listContainer) return;

    if (!items || items.length === 0) {
      listContainer.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-400 space-y-2">
          <div class="text-2xl">🌿</div>
          <div class="text-xs font-medium">Keine Meldungen für diese Filterauswahl gefunden.</div>
          <button onclick="RadioNewsEngine.selectCategory('all'); RadioNewsEngine.selectMedia('all');" class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-purple-300 font-semibold transition cursor-pointer">Filter zurücksetzen</button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = items.map((item, idx) => {
      const isTranslated = !!item.isTranslated;
      const scopeBadge = item.scope === 'global'
        ? '<span class="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">🌐 Global</span>'
        : '<span class="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">📍 Lokal</span>';
      
      const transBadge = isTranslated
        ? `<span class="px-1.5 py-0.5 rounded text-[8px] font-mono bg-purple-500/20 text-purple-300 border border-purple-400/30" title="Automatisch übersetzt">${(item.originLang || '').toUpperCase()} → ${currentNewsLang.toUpperCase()}</span>`
        : '';

      return `
        <div id="news-card-${idx}" class="news-item-card p-3 rounded-2xl bg-[#12131e]/90 hover:bg-[#181928] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between gap-2 text-left relative group">
          
          <!-- Card Header: Source Badge + Scope + Time + Controls -->
          <div class="flex items-center justify-between gap-1.5">
            <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span class="px-2 py-0.5 rounded-md bg-white/[0.06] text-purple-200 border border-white/10 text-[9px] font-semibold font-mono tracking-wide truncate">${item.source}</span>
              ${scopeBadge}
              ${transBadge}
              <span class="text-[9px] text-gray-500 font-mono shrink-0">${item.time || 'vorhin'}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="RadioNewsEngine.startNewsReader(${idx})" class="p-1 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 text-gray-400 hover:text-purple-300 transition cursor-pointer" title="Diesen Artikel vorlesen">
                <i data-lucide="volume-2" class="w-3.5 h-3.5 news-speaker-icon"></i>
              </button>
              ${item.url && item.url !== '#' ? `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="p-1 rounded-lg bg-white/[0.04] hover:bg-white/15 text-gray-400 hover:text-white transition" title="Originalquelle öffnen">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Headline & Summary -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-white group-hover:text-purple-200 transition-colors leading-snug">${item.title}</h4>
            <p class="text-[11px] text-gray-300 group-hover:text-white leading-relaxed font-normal">${item.summary}</p>
          </div>

          <!-- Bottom Tag -->
          <div class="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[9px] text-gray-500">
            <span class="capitalize">${item.category ? '#' + item.category : '#news'}</span>
            <button onclick="RadioNewsEngine.startNewsReader(${idx})" class="text-purple-300/80 hover:text-purple-200 hover:underline cursor-pointer flex items-center gap-0.5 text-[9px]">
              <span>Anhören</span>
              <i data-lucide="chevron-right" class="w-2.5 h-2.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function renderTickerMarquee(items) {
    const tickerContainer = document.getElementById('news-marquee-text');
    if (!tickerContainer) return;

    if (!items || items.length === 0) {
      tickerContainer.innerHTML = '<span class="text-xs text-gray-500 italic">Keine aktuellen Meldungen</span>';
      return;
    }

    tickerContainer.innerHTML = items.slice(0, 10).map((it, idx) => `
      <span class="inline-flex items-center gap-1.5 mx-3.5 text-xs text-gray-300 hover:text-white transition cursor-pointer" onclick="RadioNewsEngine.startNewsReader(${idx})">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
        <span class="font-medium text-gray-200 hover:underline">${it.title}</span>
        <span class="text-[9px] text-gray-500 font-mono">(${it.source})</span>
      </span>
    `).join('');
  }

  function renderSubheaderTicker(items) {
    if (!items) items = getFilteredNewsItems();
    renderCurrentTeletextHeadline(items, true);
  }

  function renderCurrentTeletextHeadline(items, withAnimation = true) {
    if (!items || items.length === 0) items = getFilteredNewsItems();
    const container = document.getElementById('board-ticker-track') || document.getElementById('teletext-news-item');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<span class="text-xs text-gray-400 italic">Keine aktuellen Meldungen</span>';
      return;
    }

    if (currentTickerIndex < 0 || currentTickerIndex >= items.length) {
      currentTickerIndex = 0;
    }

    const currentItem = items[currentTickerIndex];
    const color = NEWS_VIBRANT_PALETTE[currentTickerIndex % NEWS_VIBRANT_PALETTE.length];
    const fullTitle = currentItem.title || '';

    container.innerHTML = `
      <div id="ticker-headline-wrapper" class="inline-flex items-center gap-1.5 w-full max-w-full min-w-0 overflow-hidden cursor-pointer ${withAnimation ? 'animate-headline-swap' : ''}"
           onclick="RadioNewsEngine.handleNewsClick(${currentTickerIndex})"
           title="${fullTitle} (${currentItem.source || ''})">
        <span id="ticker-headline-text" class="news-ticker-text-headline font-bold tracking-wide font-display text-[11px] sm:text-[12px] whitespace-nowrap hover:underline py-0.5 inline-block" 
              style="color: ${color.hex}; text-shadow: 0 0 8px ${color.glow};">
          ${fullTitle}
        </span>
      </div>
    `;

    updateHoverActionPill(currentItem, currentTickerIndex);
    updateTickerDetailsInPopover(currentItem, currentTickerIndex);

    // Dynamische Berechnung für überlange Schlagzeilen: Vollständiger Marquee-Lauf ohne Abschneiden links/rechts
    let headlineDisplayDuration = Math.max(5000, Math.min(7800, (tickerSpeedSec || 7) * 1000));
    const textEl = document.getElementById('ticker-headline-text');
    const wrapperEl = document.getElementById('ticker-headline-wrapper');
    const trackEl = document.getElementById('board-ticker-track');
    const viewport = document.getElementById('board-ticker-viewport');

    if (textEl && viewport && typeof textEl.scrollWidth === 'number' && typeof viewport.clientWidth === 'number') {
      textEl.classList.remove('ticker-marquee-active');
      textEl.style.removeProperty('--ticker-marquee-x');
      textEl.style.removeProperty('--ticker-marquee-duration');
      textEl.style.transform = 'none';

      const textWidth = textEl.scrollWidth;
      const viewportWidth = Math.max(60, viewport.clientWidth - 20);
      const overflow = textWidth - viewportWidth;

      if (overflow > 6) {
        // OVERFLOW: Zwingend linksbündig (justify-start / text-left), damit Zeichen 0 (Start der Meldung) zu 100% sichtbar am linken Rand beginnt!
        if (wrapperEl) {
          wrapperEl.classList.remove('justify-end', 'text-right');
          wrapperEl.classList.add('justify-start', 'text-left');
        }
        if (trackEl) {
          trackEl.classList.remove('justify-end', 'text-right');
          trackEl.classList.add('justify-start', 'text-left');
        }
        viewport.classList.remove('justify-end');
        viewport.classList.add('justify-start');

        // Scrollweg: Vollständiger Overflow + 36px Puffer für das letzte Wort & Satzzeichen
        const scrollDistance = overflow + 36;
        const scrollSeconds = Math.max(3.2, scrollDistance / 38);
        const totalDurationSeconds = 1.6 + scrollSeconds + 1.8;

        textEl.style.setProperty('--ticker-marquee-x', `-${scrollDistance}px`);
        textEl.style.setProperty('--ticker-marquee-duration', `${totalDurationSeconds}s`);
        textEl.classList.add('ticker-marquee-active');

        headlineDisplayDuration = Math.round((totalDurationSeconds + 0.8) * 1000);
      } else {
        // PASST: Wenn Platz da ist, dezent nach rechts ausrichten
        if (wrapperEl) {
          wrapperEl.classList.remove('justify-start', 'text-left');
          wrapperEl.classList.add('justify-end', 'text-right');
        }
        if (trackEl) {
          trackEl.classList.remove('justify-start', 'text-left');
          trackEl.classList.add('justify-end', 'text-right');
        }
        viewport.classList.remove('justify-start');
        viewport.classList.add('justify-end');
      }
    }

    newsHeadlinesShownCount++;
    if (tickerAutoSwapInterval) clearInterval(tickerAutoSwapInterval);
    tickerAutoSwapInterval = setInterval(() => {
      if (!isTickerHoverPaused && !isTickerSuppressed && !isInstructionActive) {
        const freshItems = getFilteredNewsItems();
        if (freshItems.length > 0) {
          // Jede 3. auf dem Newsticker gezeigte Meldung wechselnd 1 Anleitung links zeigen
          if (newsHeadlinesShownCount >= NEWS_HEADLINES_PER_INSTRUCTION) {
            newsHeadlinesShownCount = 0;
            showInstructionHeadline(false);
          } else {
            currentTickerIndex = getNextNonRepeatingIndex(freshItems);
            renderCurrentTeletextHeadline(freshItems, true);
          }
        }
      }
    }, headlineDisplayDuration);
  }

  function updateTickerDetailsInPopover(currentItem, idx) {
    const articleBox = document.getElementById('ticker-current-article-box');
    if (!articleBox || !currentItem) return;
    const color = NEWS_VIBRANT_PALETTE[idx % NEWS_VIBRANT_PALETTE.length];
    const fullTitle = currentItem.title || '';
    const fullSummary = currentItem.summary || '';
    const scopeLabel = currentItem.scope === 'global' ? '🌐 Global' : '📍 Lokal';

    articleBox.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 shadow-xs" style="color: ${color.hex}; border: 1px solid ${color.border}; background-color: ${color.bg};">
            ${currentItem.source || 'Live'}
          </span>
          <span class="text-[9px] font-mono text-cyan-300">${scopeLabel}</span>
          ${currentItem.isTranslated ? `<span class="text-[8.5px] font-mono text-purple-300">(${(currentItem.originLang||'').toUpperCase()}→${currentNewsLang.toUpperCase()})</span>` : ''}
        </div>
        <span class="text-[10px] font-mono text-gray-400 shrink-0">${currentItem.time || 'Jetzt'}</span>
      </div>
      <div class="text-xs font-bold text-white leading-snug">${fullTitle}</div>
      ${fullSummary ? `<div class="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">${fullSummary}</div>` : ''}
      <div class="flex items-center justify-between pt-1 border-t border-white/5">
        ${currentItem.url && currentItem.url !== '#' ? `
          <a href="${currentItem.url}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition border border-white/15" title="Vollständigen Artikel öffnen">
            <span>Artikel öffnen</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        ` : '<div></div>'}
        <button onclick="RadioNewsEngine.toggleCurrentTickerTTS(event, ${idx})" class="px-2.5 py-1 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/40 text-purple-200 hover:text-white text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
          <span>Vorlesen</span>
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function updateHoverActionPill(it, idx) {
    const hoverPill = document.getElementById('ticker-hover-action-pill');
    if (!hoverPill || !it) return;

    const color = NEWS_VIBRANT_PALETTE[idx % NEWS_VIBRANT_PALETTE.length];
    hoverPill.innerHTML = `
      <span class="px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold shrink-0 shadow-xs" style="color: ${color.hex}; border: 1px solid ${color.border}; background-color: ${color.bg};">
        ${it.source || 'Live'}
      </span>
      <span class="text-[10px] font-mono text-gray-300 shrink-0">${it.time || 'Jetzt'}</span>
      ${it.url && it.url !== '#' ? `
        <a href="${it.url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-white/15 shadow-xs" title="Artikel auf ${it.source} öffnen">
          <span>Öffnen</span>
          <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      ` : ''}
      <button onclick="RadioNewsEngine.toggleCurrentTickerTTS(event, ${idx})" class="p-1 px-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-purple-200 hover:text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer" title="Nachricht vorlesen">
        <i data-lucide="volume-2" class="w-3 h-3"></i>
      </button>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function handleNewsClick(idx) {
    const items = getFilteredNewsItems();
    if (!items || !items[idx]) return;
    const it = items[idx];
    if (it.url && it.url !== '#') {
      window.open(it.url, '_blank', 'noopener,noreferrer');
    } else {
      RadioNewsEngine.startNewsReader(idx);
    }
  }

  function rotateNewsStream(steps = 1) {
    const items = getFilteredNewsItems();
    if (items.length === 0) return;
    if (steps > 0 && items.length > 2) {
      currentTickerIndex = getNextNonRepeatingIndex(items);
    } else {
      currentTickerIndex = (currentTickerIndex + steps + items.length) % items.length;
    }
    renderCurrentTeletextHeadline(items, true);
  }

  function nextTickerHeadline(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    rotateNewsStream(1);
  }

  function prevTickerHeadline(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    rotateNewsStream(-1);
  }

  function pauseTickerOnHover() {
    isTickerHoverPaused = true;
  }

  function resumeTickerOnHover() {
    isTickerHoverPaused = false;
  }

  function setTickerSpeed(seconds) {
    tickerSpeedSec = parseInt(seconds, 10) || 7;
    try { localStorage.setItem('flow_ticker_speed', String(tickerSpeedSec)); } catch(e){}
    const items = getFilteredNewsItems();
    renderCurrentTeletextHeadline(items, true);
  }

  function toggleTickerSettingsDropdown(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const popover = document.getElementById('ticker-settings-popover');
    const wrapper = document.getElementById('ticker-options-wrapper');
    if (popover) {
      const isHidden = popover.classList.contains('hidden');
      if (isHidden) {
        popover.classList.remove('hidden');
        if (wrapper) wrapper.classList.add('ticker-popover-open');
        updateAllSelectorsUI();
      } else {
        popover.classList.add('hidden');
        if (wrapper) wrapper.classList.remove('ticker-popover-open');
      }
    }
  }

  function closeTickerSettingsDropdown() {
    const popover = document.getElementById('ticker-settings-popover');
    const wrapper = document.getElementById('ticker-options-wrapper');
    if (popover) popover.classList.add('hidden');
    if (wrapper) wrapper.classList.remove('ticker-popover-open');
  }

  // ============================================================================
  // ============================================================================
  // 8. INSTRUCTION TICKER ENGINE (LINKS NACH KARTEN LEEREN - OHNE EXTRA BUTTON & RAHMEN)
  // Jede 5 auf dem Newsticker gezeigte Meldungen wechselnd 1 Anleitung links zeigen.
  // ============================================================================
  // 8. INSTRUCTION TICKER ENGINE (LINKS NACH KARTEN LEEREN - 3:1 RHYTHMUS)
  // Jede 3 auf dem Newsticker gezeigten Meldungen wechselnd 1 Anleitung links zeigen.
  // Keine willkürlichen Deko-Icons - nur repräsentative, klickbare Aktions-Icons,
  // mit denen der Nutzer genau das ausführen kann, was beschrieben wird.
  // Während jede solche Anleitung gezeigt wird, ist der Newsticker rechts ausgeblendet.
  // ============================================================================

  function setTickerSuppressed(suppressed) {
    isTickerSuppressed = !!suppressed;
    const tickerBar = document.getElementById('board-news-ticker-bar');
    if (tickerBar) {
      if (isTickerSuppressed) {
        tickerBar.classList.add('opacity-0', 'pointer-events-none', 'hidden');
        tickerBar.style.display = 'none';
      } else {
        tickerBar.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
        tickerBar.style.display = '';
      }
    }
  }

  let activeDisplayedTip = null;

  function executeInstructionAction(actionKey) {
    if (!actionKey) return;
    try {
      // Hilfsfunktion: Falls ein Unterpanel der Header-Tools geöffnet werden soll,
      // muss dessen Eltern-Panel #panel-header-tools sichtbar sein
      const ensureParentToolsOpen = () => {
        const headerTools = document.getElementById('panel-header-tools');
        if (headerTools && headerTools.classList.contains('hidden')) {
          headerTools.classList.remove('hidden');
          headerTools.classList.add('noodle-panel-pinned');
          if (typeof adjustPanelPosition === 'function') adjustPanelPosition(headerTools, 'header-tools');
        }
      };

      switch (actionKey) {
        case 'dice':
          if (typeof openHelperModal === 'function') {
            openHelperModal('pick');
          } else {
            const diceBtn = document.getElementById('btn-whatnow-dance') || document.querySelector('[data-i18n-title="dice_tooltip"]');
            if (diceBtn) diceBtn.click();
            else if (typeof togglePanel === 'function') togglePanel('dice');
          }
          break;
        case 'alarm':
          const alarmBtn = document.getElementById('btn-header-alarm');
          if (alarmBtn && typeof alarmBtn.click === 'function') {
            alarmBtn.click();
          } else if (typeof togglePanel === 'function') {
            togglePanel('alarm');
          }
          break;
        case 'sound':
          if (typeof openAudioStudioMode === 'function') {
            openAudioStudioMode('ambient');
          } else if (typeof togglePanel === 'function') {
            ensureParentToolsOpen();
            togglePanel('audio');
          }
          break;
        case 'cooking':
          ensureParentToolsOpen();
          if (typeof togglePanel === 'function') {
            togglePanel('cooking');
            if (typeof renderCookingPanel === 'function') renderCookingPanel();
          }
          break;
        case 'shopping':
          ensureParentToolsOpen();
          if (typeof togglePanel === 'function') {
            togglePanel('shopping');
            if (typeof renderShoppingList === 'function') renderShoppingList();
          }
          break;
        case 'pause':
          const pauseBtn = document.querySelector('[data-i18n-title="pause_panel_title"]');
          if (pauseBtn && typeof pauseBtn.click === 'function') {
            pauseBtn.click();
          } else if (typeof togglePanel === 'function') {
            togglePanel('pause-dropdown');
          }
          break;
        case 'health':
          ensureParentToolsOpen();
          if (typeof togglePanel === 'function') {
            togglePanel('health');
            if (typeof HealthEngine !== 'undefined' && typeof HealthEngine.renderPanel === 'function') {
              HealthEngine.renderPanel();
            }
          }
          break;
        case 'brainstorm':
          if (typeof openBrainstormModal === 'function') {
            openBrainstormModal();
          } else {
            const bBtn = document.getElementById('btn-header-brainstorm');
            if (bBtn) bBtn.click();
          }
          break;
        case 'clean':
          if (typeof openCleaningGuideModal === 'function') {
            openCleaningGuideModal();
          }
          break;
        case 'learning':
          if (typeof openLearningHubModal === 'function') {
            openLearningHubModal();
          }
          break;
        case 'humor':
          ensureParentToolsOpen();
          if (typeof togglePanel === 'function') {
            togglePanel('humor-lab');
            if (typeof HumorEngine !== 'undefined' && typeof HumorEngine.renderHumorPanel === 'function') {
              HumorEngine.renderHumorPanel();
            }
          }
          break;
        case 'zen':
          if (typeof toggleMinimalist === 'function') {
            toggleMinimalist();
          }
          break;
        case 'cmd':
          if (typeof openCommandPalette === 'function') {
            openCommandPalette();
          }
          break;
        case 'columns':
          const colBtn = document.getElementById('btn-board-columns');
          if (colBtn && typeof colBtn.click === 'function') {
            colBtn.click();
          } else if (typeof toggleColumnsDropdown === 'function') {
            toggleColumnsDropdown();
          }
          break;
        case 'clear':
          const clearBtn = document.getElementById('btn-board-clear');
          if (clearBtn && typeof clearBtn.click === 'function') {
            clearBtn.click();
          } else if (typeof handleClearAllLists === 'function') {
            handleClearAllLists();
          }
          break;
        case 'stats':
          const statsBtn = document.querySelector('#header-btn-report-container button') || document.querySelector('[data-i18n-title="report_title"]') || document.getElementById('header-stats-btn');
          if (statsBtn && typeof statsBtn.click === 'function') {
            statsBtn.click();
          } else if (typeof togglePanel === 'function') {
            togglePanel('report');
          }
          break;
        case 'theme':
          const optBtn = document.querySelector('#header-btn-options-container button') || document.querySelector('[data-i18n-title="options_title"]') || document.getElementById('header-settings-toggle');
          if (optBtn && typeof optBtn.click === 'function') {
            optBtn.click();
          } else if (typeof togglePanel === 'function') {
            togglePanel('settings-dropdown');
          }
          break;
        case 'team':
          const wsBtn = document.getElementById('btn-header-workspace');
          if (wsBtn && typeof wsBtn.click === 'function') {
            wsBtn.click();
          } else if (typeof setWorkspace === 'function') {
            setWorkspace('shared');
          }
          break;
        case 'tts':
          if (typeof toggleAllNewsReader === 'function') {
            toggleAllNewsReader();
          } else if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleAllNewsReader === 'function') {
            RadioNewsEngine.toggleAllNewsReader();
          }
          break;
        case 'timer':
          const playBtn = document.getElementById('timer-play-btn');
          if (playBtn && typeof playBtn.click === 'function') {
            playBtn.click();
          } else if (typeof toggleTimer === 'function') {
            toggleTimer();
          } else if (typeof togglePanel === 'function') {
            togglePanel('timer-presets');
          }
          break;
        case 'steps':
          if (typeof openHelperModal === 'function') {
            openHelperModal('steps');
          }
          break;
        case 'undo':
          const undoBtn = document.getElementById('btn-board-undo');
          if (undoBtn && typeof undoBtn.click === 'function') {
            undoBtn.click();
          } else if (typeof undoLastAction === 'function') {
            undoLastAction();
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.warn('[Instruction Action] Fehler bei Aktionsausführung:', actionKey, err);
    }
  }

  function handleInstructionClick(e, explicitTip) {
    if (e && e.stopPropagation) e.stopPropagation();
    const currentTip = explicitTip || activeDisplayedTip || FEATURE_TIPS_DATA[currentInstructionIndex];
    if (currentTip && currentTip.action) {
      executeInstructionAction(currentTip.action);
    } else {
      nextInstruction(true);
    }
  }

  function showInstructionHeadline(manual = false) {
    const bar = document.getElementById('board-instruction-ticker-bar') || document.getElementById('board-feature-hint-wrapper');
    const track = document.getElementById('board-instruction-ticker-track');
    const textEl = document.getElementById('board-instruction-ticker-text') || document.getElementById('board-feature-hint-text');
    if (!bar || (!textEl && !track)) return;

    const appLang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'de';
    const tipsList = FEATURE_TIPS_DATA || [];
    if (tipsList.length === 0) return;

    if (manual) {
      currentInstructionIndex = (currentInstructionIndex + 1) % tipsList.length;
    }
    const currentTip = tipsList[currentInstructionIndex];
    activeDisplayedTip = currentTip;
    currentFeatureTipIndex = currentInstructionIndex; // Abwärtskompatibel synchron

    const color = NEWS_VIBRANT_PALETTE[currentInstructionIndex % NEWS_VIBRANT_PALETTE.length];
    const tipText = (currentTip.text && currentTip.text[appLang]) || currentTip.text?.de || (typeof currentTip === 'string' ? currentTip : '');
    const actionTitle = (currentTip.actionTitle && currentTip.actionTitle[appLang]) || currentTip.actionTitle?.de || 'Öffnen';

    if (track) {
      track.classList.remove('animate-headline-swap');
      void track.offsetWidth; // Force reflow für reibungslose Einblendungs-Animation
      track.classList.add('animate-headline-swap');

      const iconHtml = currentTip.icon ? `
        <button type="button" onclick="event.stopPropagation(); RadioNewsEngine.executeInstructionAction('${currentTip.action}')" 
                class="instruction-action-btn instruction-action-btn-glow inline-flex items-center justify-center w-6 h-6 rounded-lg border transition-all duration-200 cursor-pointer shrink-0 mr-1.5" 
                style="color: ${color.hex}; background-color: ${color.bg}; border-color: ${color.border};"
                title="${actionTitle} (Klicken zum Ausführen)">
          <i data-lucide="${currentTip.icon}" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
        </button>
      ` : '';

      track.innerHTML = `
        ${iconHtml}
        <span id="board-instruction-ticker-text" class="font-bold tracking-wide font-display text-[11px] sm:text-[12px] whitespace-normal sm:whitespace-nowrap hover:underline py-0.5 inline-block" 
              style="color: ${color.hex}; text-shadow: 0 0 8px ${color.glow};"
              title="${currentTip.action ? actionTitle + ': ' + tipText : tipText}">
          ${tipText}
        </span>
      `;
      track.onclick = (e) => {
        RadioNewsEngine.handleInstructionClick(e, currentTip);
      };
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    } else if (textEl) {
      textEl.textContent = tipText;
      if (textEl.style) {
        textEl.style.color = color.hex;
        textEl.style.textShadow = `0 0 8px ${color.glow}`;
      }
    }

    isInstructionActive = true;

    // 1. Links Anleitung sanft und vollständig einblenden
    bar.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
    bar.classList.add('opacity-100', 'pointer-events-auto', 'flex');

    // 2. Rechts Newsticker ausblenden & Layout-Platz freigeben während Anleitung angezeigt wird
    setTickerSuppressed(true);

    // 3. Kein Marquee für Anleitungen: Text bleibt ruhig und zu 100% vollständig sichtbar stehen
    const instructionTextEl = document.getElementById('board-instruction-ticker-text');
    if (instructionTextEl) {
      instructionTextEl.classList.remove('instruction-marquee-active');
      instructionTextEl.style.removeProperty('--instruction-marquee-x');
      instructionTextEl.style.removeProperty('--instruction-marquee-duration');
      instructionTextEl.style.transform = 'none';
      instructionTextEl.style.animation = 'none';
    }

    // 4. Großzügige, ruhige Lesezeit (13.5 Sekunden) für vollständiges, entspanntes Erfassen
    const instructionDuration = 13500;
    if (instructionHideTimer) clearTimeout(instructionHideTimer);
    instructionHideTimer = setTimeout(() => {
      if (!isInstructionHovered) {
        hideInstructionHeadline();
      }
    }, instructionDuration);
  }

  function hideInstructionHeadline() {
    const bar = document.getElementById('board-instruction-ticker-bar') || document.getElementById('board-feature-hint-wrapper');
    const instructionTextEl = document.getElementById('board-instruction-ticker-text');
    if (instructionTextEl) {
      instructionTextEl.classList.remove('instruction-marquee-active');
      instructionTextEl.style.removeProperty('--instruction-marquee-x');
      instructionTextEl.style.removeProperty('--instruction-marquee-duration');
      instructionTextEl.style.transform = 'none';
      instructionTextEl.style.animation = 'none';
    }
    if (bar) {
      bar.classList.remove('opacity-100', 'pointer-events-auto');
      bar.classList.add('opacity-0', 'pointer-events-none');
      if (bar.id === 'board-feature-hint-wrapper') {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
      }
    }

    isInstructionActive = false;
    currentInstructionIndex = (currentInstructionIndex + 1) % (FEATURE_TIPS_DATA.length || 1);
    setTickerSuppressed(false);

    // Rechts den Newsticker zur nächsten Schlagzeile weiterschalten
    const freshItems = getFilteredNewsItems();
    if (freshItems.length > 0) {
      currentTickerIndex = (currentTickerIndex + 1) % freshItems.length;
      renderCurrentTeletextHeadline(freshItems, true);
    }
  }

  function nextInstruction(manual = true) {
    showInstructionHeadline(manual);
  }

  function pauseInstructionHover() {
    isInstructionHovered = true;
    if (instructionHideTimer) clearTimeout(instructionHideTimer);
  }

  function resumeInstructionHover() {
    isInstructionHovered = false;
    if (instructionHideTimer) clearTimeout(instructionHideTimer);
    instructionHideTimer = setTimeout(() => {
      hideInstructionHeadline();
    }, 6500);
  }

  // Aliases für Abwärtskompatibilität
  function showNextFeatureTip(manual = false) { showInstructionHeadline(manual); }
  function hideFeatureTip() { hideInstructionHeadline(); }
  function nextFeatureTip(manual = true) { showInstructionHeadline(manual); }
  function pauseFeatureHintHover() { pauseInstructionHover(); }
  function resumeFeatureHintHover() { resumeInstructionHover(); }
  function startFeatureHintsCycle() {
    // Die Anleitungen laufen harmonisch im 3:1 Rhythmus des Newstickers
  }

  // ============================================================================
  // 9. TEXT-TO-SPEECH (TTS) AUDIO BRIEFING
  // ============================================================================

  function speakNextItemInQueue() {
    if (!('speechSynthesis' in window) || !isSpeakingQueue) return;

    const items = getFilteredNewsItems();
    if (currentSpeakingIndex >= items.length) {
      stopNewsReader();
      if (typeof showToast === 'function') {
        showToast('✅ Audio-Briefing abgeschlossen');
      }
      return;
    }

    const item = items[currentSpeakingIndex];
    if (!item) {
      stopNewsReader();
      return;
    }

    highlightNewsCard(currentSpeakingIndex);

    const textToSpeak = `${item.title}. ${item.summary}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Gewählte Ausgabesprache für die TTS-Stimme verwenden
    const langObj = NEWS_LANGUAGES.find(l => l.id === currentNewsLang) || NEWS_LANGUAGES[0];
    const targetLang = langObj.ttsLang || 'de-DE';
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const prefix = targetLang.split('-')[0].toLowerCase();
      const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Microsoft') || v.name.includes('Premium'))) ||
                            voices.find(v => v.lang.toLowerCase().startsWith(prefix)) ||
                            voices[0];
      if (matchingVoice) utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      if (isSpeakingQueue) {
        currentSpeakingIndex++;
        setTimeout(() => {
          if (isSpeakingQueue) speakNextItemInQueue();
        }, 320);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[TTS Engine] Speech error:', e);
      if (isSpeakingQueue) {
        currentSpeakingIndex++;
        speakNextItemInQueue();
      }
    };

    window.speechSynthesis.speak(utterance);
    updateTtsReaderUI();
  }

  function startNewsReader(startIndex = 0) {
    if (!('speechSynthesis' in window)) {
      if (typeof showToast === 'function') {
        showToast('Sprachausgabe wird in diesem Browser nicht unterstützt.');
      }
      return;
    }

    if (isRadioPlaying && radioAudioEl) {
      radioAudioEl.pause();
      isRadioPlaying = false;
      updateRadioUIState(false);
    }

    window.speechSynthesis.cancel();
    isSpeakingQueue = true;
    isTtsPaused = false;
    currentSpeakingIndex = startIndex;

    speakNextItemInQueue();
    updateTtsReaderUI();
  }

  function toggleAllNewsReader() {
    if (isSpeakingQueue) {
      stopNewsReader();
    } else {
      startNewsReader(0);
    }
  }

  function toggleNewsReaderPause() {
    if (!('speechSynthesis' in window) || !isSpeakingQueue) return;
    if (isTtsPaused) {
      window.speechSynthesis.resume();
      isTtsPaused = false;
    } else {
      window.speechSynthesis.pause();
      isTtsPaused = true;
    }
    updateTtsReaderUI();
  }

  function stopNewsReader() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingQueue = false;
    isTtsPaused = false;
    currentSpeakingIndex = -1;
    removeNewsHighlights();
    updateTtsReaderUI();
  }

  function nextNewsItem() {
    if (!isSpeakingQueue) {
      startNewsReader(0);
      return;
    }
    window.speechSynthesis.cancel();
    currentSpeakingIndex++;
    speakNextItemInQueue();
  }

  function prevNewsItem() {
    if (!isSpeakingQueue) {
      startNewsReader(0);
      return;
    }
    window.speechSynthesis.cancel();
    currentSpeakingIndex = Math.max(0, currentSpeakingIndex - 1);
    speakNextItemInQueue();
  }

  function toggleCurrentTickerTTS(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isSpeakingQueue) {
      stopNewsReader();
    } else {
      startNewsReader(currentTickerIndex >= 0 ? currentTickerIndex : 0);
    }
  }

  function setSpeechRate(rate) {
    speechRate = parseFloat(rate);
    try { localStorage.setItem('flow_news_speech_rate', speechRate.toString()); } catch(e){}
    
    document.querySelectorAll('.news-speed-btn').forEach(btn => {
      const isCur = Math.abs(parseFloat(btn.dataset.speed) - speechRate) < 0.05;
      btn.className = isCur 
        ? 'news-speed-btn px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-500/50 text-[10px] font-mono font-bold cursor-pointer transition'
        : 'news-speed-btn px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 text-[10px] font-mono font-bold cursor-pointer transition';
    });

    document.querySelectorAll('.ticker-tts-rate-btn').forEach(btn => {
      const txt = btn.textContent.trim().replace('x', '');
      const isCur = Math.abs(parseFloat(txt) - speechRate) < 0.1;
      btn.className = isCur
        ? 'ticker-tts-rate-btn px-1.5 py-0.5 rounded bg-teal-500/25 border border-teal-500/50 text-[9px] font-mono font-bold text-teal-200 cursor-pointer'
        : 'ticker-tts-rate-btn px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[9px] font-mono text-gray-300 cursor-pointer';
    });

    if (isSpeakingQueue) {
      window.speechSynthesis.cancel();
      speakNextItemInQueue();
    }
  }

  function highlightNewsCard(index) {
    removeNewsHighlights();
    const card = document.getElementById(`news-card-${index}`);
    if (card) {
      card.classList.add('news-card-playing');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function removeNewsHighlights() {
    document.querySelectorAll('.news-item-card').forEach(c => {
      c.classList.remove('news-card-playing');
    });
  }

  function updateTtsReaderUI() {
    const bottomPlayerBar = document.getElementById('news-tts-bottom-bar');
    const headerPlayBtn = document.getElementById('news-reader-play-btn');
    const tickerTtsBtn = document.getElementById('ticker-tts-btn');
    const tickerTtsIcon = document.getElementById('ticker-tts-icon');
    const items = getFilteredNewsItems();
    
    if (bottomPlayerBar) {
      if (isSpeakingQueue) {
        bottomPlayerBar.classList.remove('hidden');
        const countText = document.getElementById('news-tts-count-display');
        if (countText) {
          countText.textContent = `${currentSpeakingIndex + 1} / ${items.length}`;
        }
        const activeTitle = document.getElementById('news-tts-current-title');
        if (activeTitle && items[currentSpeakingIndex]) {
          activeTitle.textContent = items[currentSpeakingIndex].title;
        }
        const pauseBtn = document.getElementById('news-tts-pause-btn');
        if (pauseBtn) {
          pauseBtn.innerHTML = isTtsPaused 
            ? '<i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i>' 
            : '<i data-lucide="pause" class="w-3.5 h-3.5 fill-white"></i>';
        }
      } else {
        bottomPlayerBar.classList.add('hidden');
      }
    }

    if (headerPlayBtn) {
      if (isSpeakingQueue) {
        headerPlayBtn.innerHTML = '<i data-lucide="square" class="w-3.5 h-3.5 fill-rose-300"></i><span>Stoppen</span>';
        headerPlayBtn.className = 'px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer';
      } else {
        headerPlayBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5 text-purple-300"></i><span>Vorlesen</span>';
        headerPlayBtn.className = 'px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer';
      }
    }

    if (tickerTtsBtn) {
      if (isSpeakingQueue) {
        tickerTtsBtn.className = 'p-1 px-1.5 rounded-lg bg-rose-500/25 text-rose-300 border border-rose-500/50 transition cursor-pointer flex items-center gap-1 active:scale-90 animate-pulse';
        tickerTtsBtn.title = 'Audio-Vorlesen stoppen';
        if (tickerTtsIcon) tickerTtsIcon.setAttribute('data-lucide', 'square');
      } else {
        tickerTtsBtn.className = 'p-1 px-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 transition cursor-pointer flex items-center gap-1 active:scale-90';
        tickerTtsBtn.title = 'Nachricht vorlesen (Audio-Briefing)';
        if (tickerTtsIcon) tickerTtsIcon.setAttribute('data-lucide', 'volume-2');
      }
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function renderRadioPanelContent() {
    const container = document.getElementById('radio-stations-list');
    if (!container) return;

    container.innerHTML = RADIO_STATIONS.map(s => {
      const isCurrent = s.id === currentStationId;
      const isLive = isCurrent && isRadioPlaying;

      return `
        <div onclick="RadioNewsEngine.playRadioStation('${s.id}')" class="p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 group ${
          isCurrent 
            ? 'bg-purple-500/15 border-purple-500/40 shadow-sm' 
            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/8'
        }">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${
              isCurrent ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-gray-300 border border-white/10'
            }">
              <span>${s.logo}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-white group-hover:text-purple-200 transition truncate">${s.name}</span>
                <span class="text-[10px]">${s.flag}</span>
                ${isLive ? '<span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-purple-500 text-white animate-pulse">LIVE</span>' : ''}
              </div>
              <p class="text-[10px] text-gray-400 truncate">${s.desc}</p>
            </div>
          </div>
          <button class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition ${
            isLive 
              ? 'bg-purple-500 text-white shadow-md' 
              : isCurrent 
                ? 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500 group-hover:text-white' 
                : 'bg-white/5 text-gray-400 group-hover:bg-white/20 group-hover:text-white'
          }">
            <i data-lucide="${isLive ? 'pause' : 'play'}" class="w-3.5 h-3.5 ${isLive ? 'fill-white' : ''}"></i>
          </button>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function switchMainTab(tab) {
    activeTab = tab;
    const radioPane = document.getElementById('radio-news-pane-radio');
    const newsPane = document.getElementById('radio-news-pane-news');
    const radioTabBtn = document.getElementById('tab-btn-radio-hub');
    const newsTabBtn = document.getElementById('tab-btn-news-hub');

    if (tab === 'radio') {
      if (radioPane) radioPane.classList.remove('hidden');
      if (newsPane) newsPane.classList.add('hidden');
      if (radioTabBtn) {
        radioTabBtn.className = 'flex-1 py-1 px-2 rounded-xl text-purple-100 bg-purple-600/30 border border-purple-400/50 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold select-none';
      }
      if (newsTabBtn) {
        newsTabBtn.className = 'flex-1 py-1 px-2 rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium select-none';
      }
    } else {
      if (radioPane) radioPane.classList.add('hidden');
      if (newsPane) newsPane.classList.remove('hidden');
      if (newsTabBtn) {
        newsTabBtn.className = 'flex-1 py-1 px-2 rounded-xl text-purple-100 bg-purple-600/30 border border-purple-400/50 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold select-none';
      }
      if (radioTabBtn) {
        radioTabBtn.className = 'flex-1 py-1 px-2 rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium select-none';
      }
      if (currentNewsItems.length === 0) {
        fetchNewsForRegion(currentRegion);
      }
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function openFullNewsLounge() {
    closeTickerSettingsDropdown();
    if (typeof togglePanel === 'function') {
      togglePanel('news');
    } else {
      const panel = document.getElementById('panel-news');
      if (panel) panel.classList.remove('hidden');
    }
  }

  function initNewsPanel() {
    updateAllSelectorsUI();
    setSpeechRate(speechRate);
    fetchNewsForRegion(currentRegion);

    if (!newsAutoRefreshInterval) {
      newsAutoRefreshInterval = setInterval(() => {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          fetchNewsForRegion(currentRegion, true);
        }
      }, 3 * 60 * 1000); // Alle 3 Minuten frische Live-Feeds abrufen
    }
  }

  function initRadioPanel() {
    renderRadioPanelContent();
    updateRadioUIState(isRadioPlaying);
  }

  function initPanel() {
    initNewsPanel();
    initRadioPanel();
    startFeatureHintsCycle();
  }

  // ============================================================================
  // 10. PUBLIC ENGINE EXPORTS
  // ============================================================================

  const RadioNewsEngine = {
    initPanel,
    initRadioPanel,
    initNewsPanel,
    switchMainTab,
    // 5 Dimension Selection
    selectLanguage,
    syncAppLanguage,
    selectRegion,
    selectFeedMode,
    selectCategory,
    selectMedia,
    handleNewsSearch,
    // Radio
    playRadioStation,
    toggleRadioPlayback,
    setRadioVolume,
    duckRadio,
    // News Reader (TTS)
    startNewsReader,
    toggleAllNewsReader,
    toggleNewsReaderPause,
    stopNewsReader,
    nextNewsItem,
    prevNewsItem,
    setSpeechRate,
    fetchNewsForRegion,
    // Subheader Ticker
    renderSubheaderTicker,
    renderCurrentTeletextHeadline,
    handleNewsClick,
    rotateNewsStream,
    nextTickerHeadline,
    prevTickerHeadline,
    pauseTickerOnHover,
    resumeTickerOnHover,
    setTickerSpeed,
    toggleCurrentTickerTTS,
    toggleTickerSettingsDropdown,
    closeTickerSettingsDropdown,
    renderTickerSettingsGrids: updateAllSelectorsUI,
    openFullNewsLounge,
    getCurrentRegion: () => currentRegion,
    getCurrentCategory: () => currentCategory,
    getCurrentLanguage: () => currentNewsLang,
    getCurrentFeedMode: () => feedMixMode,
    getFilteredNewsItems,
    // Instruction Ticker Engine Coordination (Links nach Karten leeren - frameless)
    setTickerSuppressed,
    showInstructionHeadline,
    hideInstructionHeadline,
    nextInstruction,
    pauseInstructionHover,
    resumeInstructionHover,
    executeInstructionAction,
    handleInstructionClick,
    // Aliases für Abwärtskompatibilität
    nextFeatureTip,
    pauseFeatureHintHover,
    resumeFeatureHintHover,
    startFeatureHintsCycle
  };

  // Close Ticker popover on click outside
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('ticker-settings-popover');
      const wrapper = document.getElementById('ticker-options-wrapper');
      const btn = document.getElementById('ticker-options-btn');
      if (popover && !popover.classList.contains('hidden')) {
        if (!popover.contains(e.target) && !wrapper?.contains(e.target) && !btn?.contains(e.target)) {
          popover.classList.add('hidden');
          if (wrapper) wrapper.classList.remove('ticker-popover-open');
        }
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.RadioNewsEngine = RadioNewsEngine;
    window.FeatureHintsEngine = {
      nextTip: nextInstruction,
      nextInstruction: nextInstruction,
      pauseHover: pauseInstructionHover,
      resumeHover: resumeInstructionHover,
      startCycle: startFeatureHintsCycle
    };
    window.playRadioStation = playRadioStation;
    window.toggleRadioPlayback = toggleRadioPlayback;
    window.duckRadio = duckRadio;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.RadioNewsEngine = RadioNewsEngine;
    globalThis.duckRadio = duckRadio;
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initPanel();
      });
    } else {
      initPanel();
    }
  }

})();
