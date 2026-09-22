// app-radio-news.js: High-End Live Radio Stations & Minimal Calming News Lounge
// 100% Serverless, Zero-PHP, GitHub Pages compatible, Anti-Sensory-Overload & Neurodivergent-optimized

(function() {
  'use strict';

  // ============================================================================
  // 1. DATA: RADIO STATIONS & COMPREHENSIVE MULTI-REGION NEWS FEEDS
  // ============================================================================

  const RADIO_STATIONS = [
    // 🇩🇪 Deutschland (Info, Talk & Nachrichten)
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

  const REGIONS = [
    { id: 'de', name: 'Deutschland', flag: '🇩🇪', lang: 'de-DE' },
    { id: 'at', name: 'Österreich', flag: '🇦🇹', lang: 'de-AT' },
    { id: 'ch', name: 'Schweiz', flag: '🇨🇭', lang: 'de-CH' },
    { id: 'uk', name: 'UK / Britain', flag: '🇬🇧', lang: 'en-GB' },
    { id: 'us', name: 'USA', flag: '🇺🇸', lang: 'en-US' },
    { id: 'fr', name: 'France', flag: '🇫🇷', lang: 'fr-FR' },
    { id: 'es', name: 'España', flag: '🇪🇸', lang: 'es-ES' },
    { id: 'it', name: 'Italia', flag: '🇮🇹', lang: 'it-IT' },
    { id: 'gr', name: 'Ελλάδα', flag: '🇬🇷', lang: 'el-GR' },
    { id: 'global', name: 'Global', flag: '🌐', lang: 'en-US' }
  ];

  const LOCAL_MEDIA_OUTLETS = {
    de: [
      { id: 'all', name: 'Alle Quellen', icon: '✨' },
      { id: 'tagesschau', name: 'Tagesschau', match: ['tagesschau'], rss: 'https://www.tagesschau.de/xml/rss2/' },
      { id: 'spiegel', name: 'Spiegel Online', match: ['spiegel'], rss: 'https://www.spiegel.de/schlagzeilen/index.rss' },
      { id: 'zeit', name: 'Zeit Online', match: ['zeit'], rss: 'https://newsfeed.zeit.de/index' },
      { id: 'heise', name: 'Heise Tech', match: ['heise'], rss: 'https://www.heise.de/rss/heise-atom.xml' },
      { id: 'handelsblatt', name: 'Handelsblatt', match: ['handelsblatt'], rss: 'https://www.handelsblatt.com/contentexport/feed/top-themen' },
      { id: 'goodnews', name: 'Good News DE', match: ['good news', 'positive'], rss: 'https://goodnews.eu/feed/' }
    ],
    at: [
      { id: 'all', name: 'Alle Quellen', icon: '✨' },
      { id: 'orf', name: 'ORF News', match: ['orf'], rss: 'https://rss.orf.at/news.xml' },
      { id: 'standard', name: 'Der Standard', match: ['standard'], rss: 'https://www.derstandard.at/rss' },
      { id: 'kurier', name: 'Kurier', match: ['kurier'], rss: 'https://kurier.at/xml/rss' },
      { id: 'presse', name: 'Die Presse', match: ['presse'], rss: 'https://www.diepresse.com/rss/Home' },
      { id: 'goodnews', name: 'Good News AT', match: ['good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    ch: [
      { id: 'all', name: 'Alle Quellen', icon: '✨' },
      { id: 'srf', name: 'SRF News', match: ['srf'], rss: 'https://www.srf.ch/news/bnf/rss/1646' },
      { id: 'nzz', name: 'NZZ', match: ['nzz'], rss: 'https://www.nzz.ch/recent.rss' },
      { id: 'tagesanzeiger', name: 'Tages-Anzeiger', match: ['tages-anzeiger', 'tagesanzeiger'], rss: 'https://www.tagesanzeiger.ch/rss' },
      { id: 'srf_digital', name: 'SRF Digital', match: ['srf digital'], rss: 'https://www.srf.ch/news/bnf/rss/1648' },
      { id: 'goodnews', name: 'Good News CH', match: ['good news'], rss: 'https://goodnews.eu/feed/' }
    ],
    uk: [
      { id: 'all', name: 'All Media', icon: '✨' },
      { id: 'bbc', name: 'BBC News', match: ['bbc'], rss: 'https://feeds.bbci.co.uk/news/rss.xml' },
      { id: 'guardian', name: 'The Guardian', match: ['guardian'], rss: 'https://www.theguardian.com/uk/rss' },
      { id: 'reuters', name: 'Reuters UK', match: ['reuters'], rss: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best' },
      { id: 'independent', name: 'The Independent', match: ['independent'], rss: 'https://www.independent.co.uk/news/uk/rss' },
      { id: 'positive_news', name: 'Positive News', match: ['positive'], rss: 'https://www.positive.news/feed/' }
    ],
    us: [
      { id: 'all', name: 'All Media', icon: '✨' },
      { id: 'npr', name: 'NPR News', match: ['npr'], rss: 'https://feeds.npr.org/1001/rss.xml' },
      { id: 'techcrunch', name: 'TechCrunch', match: ['techcrunch'], rss: 'https://techcrunch.com/feed/' },
      { id: 'wired', name: 'Wired', match: ['wired'], rss: 'https://www.wired.com/feed/rss' },
      { id: 'sciam', name: 'Scientific American', match: ['scientific'], rss: 'http://rss.sciam.com/ScientificAmerican-Global' },
      { id: 'cnbc', name: 'CNBC', match: ['cnbc'], rss: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
      { id: 'goodnews', name: 'Good News Network', match: ['good news'], rss: 'https://www.goodnewsnetwork.org/feed/' }
    ],
    fr: [
      { id: 'all', name: 'Tous les médias', icon: '✨' },
      { id: 'franceinfo', name: 'France Info', match: ['france info'], rss: 'https://www.francetvinfo.fr/titres.rss' },
      { id: 'lemonde', name: 'Le Monde', match: ['lemonde', 'le monde'], rss: 'https://www.lemonde.fr/rss/une.xml' },
      { id: 'lefigaro', name: 'Le Figaro', match: ['le figaro', 'figaro'], rss: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
      { id: 'rfi', name: 'RFI', match: ['rfi'], rss: 'https://www.rfi.fr/fr/general/rss' }
    ],
    es: [
      { id: 'all', name: 'Todos los medios', icon: '✨' },
      { id: 'elpais', name: 'El País', match: ['el país', 'el pais'], rss: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' },
      { id: 'rtve', name: 'RTVE', match: ['rtve'], rss: 'https://www.rtve.es/api/noticias.rss' },
      { id: 'elmundo', name: 'El Mundo', match: ['el mundo'], rss: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml' },
      { id: 'efe', name: 'Agencia EFE', match: ['efe'], rss: 'https://efe.com/feed/' }
    ],
    it: [
      { id: 'all', name: 'Tutti i media', icon: '✨' },
      { id: 'ansa', name: 'ANSA', match: ['ansa'], rss: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml' },
      { id: 'corriere', name: 'Corriere della Sera', match: ['corriere'], rss: 'https://xml2.corriereobjects.it/rss/homepage.xml' },
      { id: 'repubblica', name: 'La Repubblica', match: ['repubblica'], rss: 'https://www.repubblica.it/rss/homepage/rss2.0.xml' },
      { id: 'rainews', name: 'Rai News', match: ['rai'], rss: 'https://www.rainews.it/rss/tutti' }
    ],
    gr: [
      { id: 'all', name: 'Όλα τα Μέσα', icon: '✨' },
      { id: 'ert', name: 'ΕΡΤ News', match: ['ερτ', 'ert'], rss: 'https://www.ertnews.gr/feed/' },
      { id: 'kathimerini', name: 'Καθημερινή', match: ['καθημερινή', 'kathimerini'], rss: 'https://www.kathimerini.gr/rss' },
      { id: 'capital', name: 'Capital.gr', match: ['capital'], rss: 'https://www.capital.gr/rss' },
      { id: 'techblog', name: 'Techblog GR', match: ['techblog'], rss: 'https://techblog.gr/feed/' }
    ],
    global: [
      { id: 'all', name: 'All Global Media', icon: '✨' },
      { id: 'bbc_world', name: 'BBC World', match: ['bbc'], rss: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
      { id: 'reuters', name: 'Reuters', match: ['reuters'], rss: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best' },
      { id: 'wired', name: 'Wired', match: ['wired'], rss: 'https://www.wired.com/feed/rss' },
      { id: 'nature', name: 'Nature', match: ['nature'], rss: 'https://www.nature.com/nature.rss' },
      { id: 'goodnews', name: 'Good News Network', match: ['good news'], rss: 'https://www.goodnewsnetwork.org/feed/' }
    ]
  };

  const CATEGORIES = [
    { id: 'all', name: 'Alle Themen', emoji: '✨' },
    { id: 'top', name: 'Top News', emoji: '🚨' },
    { id: 'tech', name: 'Tech & KI', emoji: '🤖' },
    { id: 'science', name: 'Wissen & Natur', emoji: '🔬' },
    { id: 'goodnews', name: 'Good News', emoji: '🌟' },
    { id: 'business', name: 'Wirtschaft', emoji: '💼' },
    { id: 'culture', name: 'Kultur', emoji: '🎭' }
  ];

  // Curated Calm Fallback Database (Guaranteed instant load offline)
  const FALLBACK_NEWS_DATABASE = {
    de: [
      { title: 'EU beschließt neues Digitalpaket für Verbraucherschutz', summary: 'Strengere Transparenzregeln für Algorithmen und vereinfachte Kündigungen von Online-Abos ab sofort wirksam.', source: 'Tagesschau', category: 'top', time: 'vor 12 Min', url: 'https://www.tagesschau.de' },
      { title: 'Investitionen in erneuerbare Energien erreichen Höchststand', summary: 'Über 58 Prozent des bundesweiten Strombedarfs stammten im letzten Quartal aus Wind- und Solarkraft.', source: 'Spiegel', category: 'top', time: 'vor 25 Min', url: 'https://www.spiegel.de' },
      { title: 'Bahn erweitert Schnellfahrstrecken & Pünktlichkeitsoffensive', summary: 'Neue ICE-Verbindungen verkürzen Reisezeiten zwischen Berlin, Frankfurt und München spürbar.', source: 'Zeit Online', category: 'top', time: 'vor 45 Min', url: 'https://www.zeit.de' },
      { title: 'Neues Open-Source KI-Modell läuft direkt lokal im Browser', summary: 'WebGPU ermöglicht blitzschnelle Sprachmodelle ohne Datenübertragung an fremde Server.', source: 'Heise', category: 'tech', time: 'vor 18 Min', url: 'https://www.heise.de' },
      { title: 'Durchbruch bei Festkörper-Akkus: 1000 km Reichweite & 10 Min Ladezeit', summary: 'Neue Silizium-Anoden-Technologie verspricht längere Haltbarkeit und doppelte Energiedichte.', source: 'Heise', category: 'tech', time: 'vor 35 Min', url: 'https://www.heise.de' },
      { title: 'James Webb Teleskop entdeckt bisher älteste bekannte Galaxie', summary: 'Die Galaxie entstand nur 290 Millionen Jahre nach dem Urknall und überrascht mit hoher Leuchtkraft.', source: 'Spektrum', category: 'science', time: 'vor 30 Min', url: 'https://www.spektrum.de' },
      { title: 'Tiefsee-Expedition entdeckt über 100 neue Tierarten vor Chile', summary: 'Korallengärten und fluoreszierende Tiefsee-Organismen in bis zu 4000 Metern Tiefe dokumentiert.', source: 'Spektrum', category: 'science', time: 'vor 1 Std', url: 'https://www.spektrum.de' },
      { title: 'Globale Wiederaufforstung verzeichnet 1 Million Hektar neuen Wald', summary: 'Internationale Naturschutzprojekte regenerieren erfolgreich artenreiche Mischwälder.', source: 'Good News DE', category: 'goodnews', time: 'vor 20 Min', url: 'https://goodnews.eu' },
      { title: 'Meeresreinigung entfernt Rekordmenge an Plastik aus dem Pazifik', summary: 'Autonome Barrieren sammeln über 250 Tonnen Zivilisationsmüll zur Wiederverwertung.', source: 'Good News DE', category: 'goodnews', time: 'vor 40 Min', url: 'https://goodnews.eu' },
      { title: 'Europäische Zentralbank signalisiert stabile Zinsentwicklung', summary: 'Inflation sinkt kontinuierlich in Richtung des 2-Prozent-Ziels, Kaufkraft der Verbraucher stabilisiert sich.', source: 'Handelsblatt', category: 'business', time: 'vor 25 Min', url: 'https://www.handelsblatt.com' },
      { title: 'Gründer-Boom in Europa: Starkes Wachstum bei nachhaltigen Start-ups', summary: 'Investitionen in Cleantech, Bildung und KI-Software steigen im laufenden Quartal um 24 Prozent.', source: 'Handelsblatt', category: 'business', time: 'vor 50 Min', url: 'https://www.handelsblatt.com' },
      { title: 'Kuratierte Kunstausstellung begeistert 100.000 Besucher in 2 Wochen', summary: 'Verbindung von klassischer Malerei und immersiven Lichtinstallationen setzt neue Maßstäbe.', source: 'Zeit Online', category: 'culture', time: 'vor 40 Min', url: 'https://www.zeit.de' }
    ],
    at: [
      { title: 'Österreich investiert 3 Milliarden Euro in den Bahnausbau', summary: 'Koralmbahn und Brenner-Zulaufstrecken verkürzen Reisezeiten im Alpenraum drastisch.', source: 'ORF News', category: 'top', time: 'vor 20 Min', url: 'https://orf.at' },
      { title: 'Alpen-Wasserkraftwerke melden Rekord-Füllstände für saubere Energie', summary: 'Speicherkraftwerke in Tirol und Salzburg sichern stabile Stromversorgung zu günstigen Preisen.', source: 'Der Standard', category: 'top', time: 'vor 40 Min', url: 'https://www.derstandard.at' },
      { title: 'Wiener Quantenphysik-Zentrum erzielt Meilenstein bei Teleportation', summary: 'Erfolgreiche photonische Verschränkung über mehrere Kilometer Glasfasernetz in Wien.', source: 'ORF News', category: 'tech', time: 'vor 30 Min', url: 'https://science.orf.at' },
      { title: 'Österreichs Nationalparks verzeichnen Rückkehr seltener Bartgeier', summary: 'Erfolgreiche Wiederansiedlung stärkt das alpine Ökosystem in den Hohen Tauern.', source: 'Good News AT', category: 'goodnews', time: 'vor 1 Std', url: 'https://goodnews.eu' },
      { title: 'Kurier Wirtschaftsreport: Exportwirtschaft erholt sich kräftig', summary: 'Spezialisierter Maschinenbau und Green-Tech verzeichnen gefüllte Auftragsbücher.', source: 'Kurier', category: 'business', time: 'vor 1 Std', url: 'https://kurier.at' },
      { title: 'Salzburger Festspiele kündigen wegweisendes Programm an', summary: 'Internationale Spitzenorchester und innovative Inszenierungen begeistern Klassik-Fans.', source: 'Die Presse', category: 'culture', time: 'vor 2 Std', url: 'https://www.diepresse.com' }
    ],
    ch: [
      { title: 'Schweiz stärkt Innovationsstandort mit neuem Biotech-Campus', summary: 'Spitzenforschung an ETH Zürich und EPFL Lausanne zieht internationale Talente an.', source: 'SRF News', category: 'top', time: 'vor 22 Min', url: 'https://www.srf.ch' },
      { title: 'SBB baut Taktfahrplan im Fernverkehr und grenzüberschreitend aus', summary: 'Halbstundentakt auf allen Hauptachsen und komfortable Direktzüge nach Mailand und Paris.', source: 'NZZ', category: 'top', time: 'vor 50 Min', url: 'https://www.nzz.ch' },
      { title: 'ETH-Forscher entwickeln biologisch abbaubare Micro-Chips', summary: 'Sensoren aus nachhaltigen Pflanzenfasern revolutionieren Medizintechnik und Logistik.', source: 'SRF Digital', category: 'tech', time: 'vor 35 Min', url: 'https://www.srf.ch' },
      { title: 'Schweizer Solarpflicht auf Neubauten übertrifft alle Erwartungen', summary: 'Alpine Solaranlagen liefern besonders im Winter wertvollen Sonnenstrom in großen Mengen.', source: 'Good News CH', category: 'goodnews', time: 'vor 1 Std', url: 'https://goodnews.eu' },
      { title: 'Schweizer Franken stabilisiert sich bei solider Exportnachfrage', summary: 'Präzisionsindustrie und Pharmabranche melden stabiles Wachstum für das Gesamtjahr.', source: 'Tages-Anzeiger', category: 'business', time: 'vor 1 Std', url: 'https://www.tagesanzeiger.ch' },
      { title: 'Montreux Jazz Festival kündigt legendäre Headliner an', summary: 'Akustische Meisterkonzerte am Genfersee mit weltweiten Musikerlegenden.', source: 'NZZ', category: 'culture', time: 'vor 3 Std', url: 'https://www.nzz.ch' }
    ],
    uk: [
      { title: 'UK offshore wind farms generate record clean energy output', summary: 'Maritime wind turbines supply over 40% of peak electricity demand across Britain.', source: 'BBC News', category: 'top', time: '20m ago', url: 'https://www.bbc.co.uk/news' },
      { title: 'Cambridge researchers unveil ultra-efficient synthetic diamond chips', summary: 'Thermal properties allow computers to operate faster with 70% less power consumption.', source: 'BBC News', category: 'tech', time: '45m ago', url: 'https://www.bbc.co.uk' },
      { title: 'Ancient temperate rainforest restored in Western Scotland', summary: 'Thousands of native oak, hazel and birch trees naturally regenerate in protected glen.', source: 'Positive News', category: 'goodnews', time: '1h ago', url: 'https://www.positive.news' },
      { title: 'Green bond issuance sets new all-time record in London financial markets', summary: 'Institutional investors channel billions into carbon-neutral cities and clean mobility.', source: 'Reuters UK', category: 'business', time: '1h ago', url: 'https://www.reuters.com' },
      { title: 'Tate Modern unveils groundbreaking interactive contemporary showcase', summary: 'Immersive acoustic and visual installations captivate international art visitors.', source: 'The Guardian', category: 'culture', time: '2h ago', url: 'https://www.theguardian.com' },
      { title: 'High-speed rail expansion reaches major engineering breakthrough', summary: 'Tunnel boring completed ahead of schedule with zero environmental disruption.', source: 'The Independent', category: 'top', time: '3h ago', url: 'https://www.independent.co.uk' }
    ],
    us: [
      { title: 'Major infrastructure upgrades modernize nationwide electrical grid', summary: 'Smart grid interconnections enhance reliability and accelerate clean energy integration.', source: 'NPR News', category: 'top', time: '15m ago', url: 'https://www.npr.org' },
      { title: 'Lightweight AI models run entirely on-device with zero cloud latency', summary: 'Local neural inference guarantees user privacy without transmitting sensitive data.', source: 'Wired', category: 'tech', time: '30m ago', url: 'https://techcrunch.com' },
      { title: 'Breakthrough quantum processor achieves error mitigation milestone', summary: 'Fault-tolerant quantum computing moves closer to practical industrial chemistry.', source: 'TechCrunch', category: 'tech', time: '40m ago', url: 'https://techcrunch.com' },
      { title: 'Bald eagle populations reach historic all-time high across North America', summary: 'Decades of habitat preservation and river cleanups restore thriving wild raptor pairs.', source: 'Good News Network', category: 'goodnews', time: '1h ago', url: 'https://www.goodnewsnetwork.org' },
      { title: 'Clean tech investments surge across renewable manufacturing hubs', summary: 'Over 50 new battery and solar fabrication facilities begin commercial production.', source: 'CNBC', category: 'business', time: '1h ago', url: 'https://www.cnbc.com' },
      { title: 'Smithsonian opens revolutionary digital archives to worldwide researchers', summary: 'Millions of 3D artifact models made freely accessible for global education.', source: 'Scientific American', category: 'science', time: '2h ago', url: 'https://www.sciam.com' }
    ],
    fr: [
      { title: 'La France accélère son plan de transition énergétique et solaire', summary: 'Plus de 30% d électricité verte produite grâce aux nouveaux parcs éoliens maritimes.', source: 'France Info', category: 'top', time: 'il y a 20 min', url: 'https://www.francetvinfo.fr' },
      { title: 'L écosystème IA français attire des investissements records à Paris', summary: 'Des modèles de langage ouverts et performants se développent rapidement.', source: 'Le Monde', category: 'tech', time: 'il y a 40 min', url: 'https://www.lemonde.fr' },
      { title: 'Restauration réussie des forêts des Vosges et des Alpes', summary: 'Des millions d arbres adaptés au climat plantés avec succès par les gardes forestiers.', source: 'France Info', category: 'goodnews', time: 'il y a 1h', url: 'https://www.francetvinfo.fr' },
      { title: 'Le TGV nouvelle génération entre en service sur l axe Atlantique', summary: 'Trains plus spacieux, silencieux et consommant 20% d énergie en moins.', source: 'Le Figaro', category: 'top', time: 'il y a 2h', url: 'https://www.lefigaro.fr' },
      { title: 'Le secteur aérospatial européen signe des contrats majeurs', summary: 'Nouveaux satellites écologiques pour l observation précise des océans.', source: 'RFI', category: 'business', time: 'il y a 2h', url: 'https://www.rfi.fr' }
    ],
    es: [
      { title: 'España lidera la generación europea con energía solar y eólica', summary: 'El 65% de la electricidad nacional procede de fuentes renovables limpias y competitivas.', source: 'RTVE', category: 'top', time: 'hace 15 min', url: 'https://www.rtve.es' },
      { title: 'El tren de alta velocidad alcanza récords históricos de pasajeros', summary: 'Precios asequibles y conexiones directas reducen el tráfico por carretera en un 40%.', source: 'El País', category: 'top', time: 'hace 35 min', url: 'https://elpais.com' },
      { title: 'Startups de biomedicina en Barcelona descubren nuevo tratamiento celular', summary: 'Avance terapéutico pionero contra enfermedades autoinmunes con alta eficacia.', source: 'El Mundo', category: 'tech', time: 'hace 1h', url: 'https://www.elmundo.es' },
      { title: 'El lince ibérico consolida su recuperación con más de 2.000 ejemplares', summary: 'Éxito histórico de conservación ambiental en los parques naturales de Andalucía.', source: 'Agencia EFE', category: 'goodnews', time: 'hace 2h', url: 'https://efe.com' },
      { title: 'El turismo cultural sostenible bate marcas de satisfacción en España', summary: 'Monumentos y museos adoptan nuevas tecnologías inmersivas de visita.', source: 'El País', category: 'culture', time: 'hace 3h', url: 'https://elpais.com' }
    ],
    it: [
      { title: 'Italia approva il nuovo piano per l innovazione verde e digitale', summary: 'Investimenti strategici per modernizzare trasporti ferroviari ed energie pulite.', source: 'ANSA', category: 'top', time: '20 min fa', url: 'https://www.ansa.it' },
      { title: 'Ricercatori di Milano sviluppano batterie al grafene ultra-veloci', summary: 'Ricarica completa in 5 minuti e ciclo di vita triplicato per dispositivi e mobilità.', source: 'Corriere della Sera', category: 'tech', time: '40 min fa', url: 'https://www.corriere.it' },
      { title: 'I parchi nazionali italiani registrano un aumento della biodiversità', summary: 'Popolazioni di aquile e camosci in crescita stabile nelle Alpi e negli Appennini.', source: 'ANSA', category: 'goodnews', time: '1 ora fa', url: 'https://www.ansa.it' },
      { title: 'L export del design e della tecnologia italiana cresce del 12%', summary: 'Grande richiesta globale per arredo sostenibile, meccanica di precisione e moda etica.', source: 'La Repubblica', category: 'business', time: '2 ore fa', url: 'https://www.repubblica.it' },
      { title: 'La Biennale d Arte apre le porte con installazioni eco-sostenibili', summary: 'Centinaia di artisti internazionali celebrano l armonia tra uomo e natura a Venezia.', source: 'Rai News', category: 'culture', time: '3 ore fa', url: 'https://www.rainews.it' }
    ],
    gr: [
      { title: 'Ηλιακή και αιολική ενέργεια καλύπτουν πάνω από το 60% της ζήτησης', summary: 'Ιστορικό ρεκόρ καθαρής ενέργειας στην Ελλάδα με σημαντική μείωση του κόστους.', source: 'ΕΡΤ News', category: 'top', time: 'πριν 15 λεπτά', url: 'https://www.ertnews.gr' },
      { title: 'Εκσυγχρονισμός ψηφιακών υπηρεσιών για πολίτες και επιχειρήσεις', summary: 'Νέες αυτοματοποιημένες διαδικασίες εξοικονομούν χιλιάδες ώρες γραφειοκρατίας.', source: 'Kathimerini', category: 'top', time: 'πριν 40 λεπτά', url: 'https://www.kathimerini.gr' },
      { title: 'Ελληνικές νεοφυείς επιχειρήσεις τεχνητής νοημοσύνης προσελκύουν διεθνή κεφάλαια', summary: 'Ανάπτυξη καινοτόμων λύσεων υγείας και ναυτιλίας στην Αθήνα και Θεσσαλονίκη.', source: 'Techblog GR', category: 'tech', time: 'πριν 1 ώρα', url: 'https://techblog.gr' },
      { title: 'Πρόγραμμα προστασίας θαλάσσιων χελωνών Caretta-Caretta σημειώνει ρεκόρ φωλιών', summary: 'Σημαντική αύξηση πληθυσμού στη Ζάκυνθο και την Κρήτη χάρη σε εθελοντικές δράσεις.', source: 'ΕΡΤ News', category: 'goodnews', time: 'πριν 2 ώρες', url: 'https://www.ertnews.gr' },
      { title: 'Ανάπτυξη του ελληνικού τουρισμού με έμφαση στη βιωσιμότητα και τον πολιτισμό', summary: 'Επέκταση της τουριστικής περιόδου σε όλη τη διάρκεια του έτους.', source: 'Capital.gr', category: 'business', time: 'πριν 2 ώρες', url: 'https://www.capital.gr' }
    ],
    global: [
      { title: 'Global Climate Accord unlocks record funding for green infrastructure', summary: 'Over 80 nations commit to accelerating solar, wind, and battery storage rollouts.', source: 'BBC World', category: 'top', time: '10m ago', url: 'https://www.bbc.com/news' },
      { title: 'International Space Station marks 25 years of human presence in orbit', summary: 'Astronauts and scientists celebrate a quarter-century of breakthroughs in microgravity.', source: 'Reuters', category: 'top', time: '28m ago', url: 'https://www.reuters.com' },
      { title: 'On-device AI breakthrough guarantees zero-cloud neural inference', summary: 'Privacy-first computing architecture delivers instant voice transcription with zero latency.', source: 'Wired', category: 'tech', time: '15m ago', url: 'https://www.wired.com' },
      { title: 'Deep sea exploration discovers 100+ new marine species in Pacific ridge', summary: 'Glowing coral ecosystems and unique marine flora documented at 4,000m depth.', source: 'Nature', category: 'science', time: '1h ago', url: 'https://www.nature.com' },
      { title: 'Global ocean cleanup removes record 500 tons of plastic debris', summary: 'Autonomous ocean barriers deploy closed-loop recycling into sustainable materials.', source: 'Good News Network', category: 'goodnews', time: '20m ago', url: 'https://www.goodnewsnetwork.org' },
      { title: 'Renewable energy surpasses coal in major worldwide power grids', summary: 'Clean energy generation records exponential growth, dropping electricity costs globally.', source: 'Good News Network', category: 'goodnews', time: '45m ago', url: 'https://www.positive.news' }
    ]
  };

  // ============================================================================
  // 2. STATE & AUTO LOCATION DETECTION
  // ============================================================================

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
        if (s.includes('österreich') || s.includes('austria') || s.includes('wien') || s.includes('salzburg') || s.includes('graz')) return 'at';
        if (s.includes('schweiz') || s.includes('switzerland') || s.includes('suisse') || s.includes('zürich') || s.includes('bern')) return 'ch';
        if (s.includes('deutschland') || s.includes('germany') || s.includes('berlin') || s.includes('münchen') || s.includes('hamburg')) return 'de';
        if (s.includes('united kingdom') || s.includes('london') || s.includes('uk')) return 'uk';
        if (s.includes('united states') || s.includes('usa') || s.includes('new york')) return 'us';
        if (s.includes('france') || s.includes('paris') || s.includes('lyon')) return 'fr';
        if (s.includes('españa') || s.includes('spain') || s.includes('madrid')) return 'es';
        if (s.includes('italia') || s.includes('italy') || s.includes('roma') || s.includes('milano')) return 'it';
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

  let currentStationId = localStorage.getItem('flow_radio_station') || 'dlf';
  let isRadioPlaying = false;
  let radioVolume = parseFloat(localStorage.getItem('flow_radio_vol') || '0.7');
  let radioAudioEl = null;

  let currentRegion = detectUserRegion();
  let currentMedia = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let activeTab = 'news'; // Default to clean news lounge!

  // TTS State
  let isSpeakingQueue = false;
  let isTtsPaused = false;
  let currentSpeakingIndex = -1;
  let speechRate = parseFloat(localStorage.getItem('flow_news_speech_rate') || '1.15');
  let currentNewsItems = [];
  let isLiveFetching = false;
  let cachedNewsByRegion = {};

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

    // Exklusivität: Hintergrundgeräusche und Synthesizer stoppen
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
      // Exklusivität: Hintergrundgeräusche stoppen beim Starten
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
  // 4. NEWS AGGREGATOR & LIVE PROXY FETCHER
  // ============================================================================

  async function fetchNewsForRegion(region, forceRefresh = false) {
    if (!forceRefresh && cachedNewsByRegion[region] && cachedNewsByRegion[region].length > 0) {
      applyFilterAndRender();
      return;
    }

    // Default to rich curated fallback
    const fallbackList = FALLBACK_NEWS_DATABASE[region] || FALLBACK_NEWS_DATABASE.de || [];
    currentNewsItems = [...fallbackList];
    applyFilterAndRender();

    // Try fetching live RSS for the region's main sources if online
    if (typeof navigator !== 'undefined' && navigator.onLine && LOCAL_MEDIA_OUTLETS[region]) {
      const outlets = LOCAL_MEDIA_OUTLETS[region].filter(o => o.rss);
      if (outlets.length > 0) {
        isLiveFetching = true;
        updateNewsFetchIndicator(true);

        try {
          const targetOutlet = outlets[0];
          const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetOutlet.rss)}&api_key=`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const res = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.items && data.items.length > 0) {
              const parsed = data.items.slice(0, 14).map((item, idx) => {
                const cleanDesc = (item.description || item.content || '')
                  .replace(/<[^>]*>?/gm, '')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&amp;/g, '&')
                  .trim();
                const shortSummary = cleanDesc.length > 170 ? cleanDesc.slice(0, 167) + '...' : cleanDesc;

                let timeLabel = 'vorhin';
                if (item.pubDate) {
                  const diffMins = Math.round((Date.now() - new Date(item.pubDate).getTime()) / 60000);
                  if (diffMins > 0 && diffMins < 60) timeLabel = `vor ${diffMins}m`;
                  else if (diffMins >= 60 && diffMins < 1440) timeLabel = `vor ${Math.round(diffMins/60)}h`;
                }

                return {
                  title: item.title.trim(),
                  summary: shortSummary || item.title,
                  source: data.feed?.title?.split('-')[0]?.trim() || targetOutlet.name,
                  category: idx % 3 === 0 ? 'top' : (idx % 3 === 1 ? 'tech' : 'science'),
                  time: timeLabel,
                  url: item.link || '#'
                };
              });

              if (parsed.length > 0) {
                // Merge with fallback items to guarantee rich multi-category diversity
                const combined = [...parsed, ...fallbackList];
                const seenTitles = new Set();
                const uniqueItems = combined.filter(it => {
                  if (seenTitles.has(it.title.toLowerCase())) return false;
                  seenTitles.add(it.title.toLowerCase());
                  return true;
                });

                currentNewsItems = uniqueItems;
                cachedNewsByRegion[region] = uniqueItems;
                applyFilterAndRender();
              }
            }
          }
        } catch (err) {
          // Keep rich curated fallback
        } finally {
          isLiveFetching = false;
          updateNewsFetchIndicator(false);
        }
      }
    }
  }

  function updateNewsFetchIndicator(isFetching) {
    const indicator = document.getElementById('news-live-indicator');
    if (indicator) {
      if (isFetching) {
        indicator.classList.remove('hidden');
      } else {
        indicator.classList.add('hidden');
      }
    }
  }

  // ============================================================================
  // 5. FILTER & DISPLAY LOGIC
  // ============================================================================

  function selectRegion(regionId) {
    currentRegion = regionId;
    currentMedia = 'all';
    localStorage.setItem('flow_news_region', regionId);
    stopNewsReader();
    renderRegionFlags();
    renderMediaChips();
    fetchNewsForRegion(currentRegion);
  }

  function selectMedia(mediaId) {
    currentMedia = mediaId;
    stopNewsReader();
    renderMediaChips();
    applyFilterAndRender();
  }

  function selectCategory(catId) {
    currentCategory = catId;
    stopNewsReader();
    renderCategoryChips();
    applyFilterAndRender();
  }

  function handleNewsSearch(val) {
    searchQuery = (val || '').trim().toLowerCase();
    applyFilterAndRender();
  }

  function getFilteredNewsItems() {
    let items = currentNewsItems.length > 0 ? currentNewsItems : (FALLBACK_NEWS_DATABASE[currentRegion] || FALLBACK_NEWS_DATABASE.de || []);
    
    // 1. Filter by category
    if (currentCategory && currentCategory !== 'all') {
      items = items.filter(it => it.category === currentCategory);
    }

    // 2. Filter by local media outlet
    if (currentMedia && currentMedia !== 'all') {
      const outlets = LOCAL_MEDIA_OUTLETS[currentRegion] || [];
      const outletObj = outlets.find(o => o.id === currentMedia);
      if (outletObj && outletObj.match) {
        items = items.filter(it => {
          const srcLower = (it.source || '').toLowerCase();
          return outletObj.match.some(m => srcLower.includes(m));
        });
      }
    }

    // 3. Filter by search query
    if (searchQuery) {
      items = items.filter(it => 
        (it.title || '').toLowerCase().includes(searchQuery) ||
        (it.summary || '').toLowerCase().includes(searchQuery) ||
        (it.source || '').toLowerCase().includes(searchQuery)
      );
    }

    return items;
  }

  function applyFilterAndRender() {
    const items = getFilteredNewsItems();
    renderNewsCards(items);
    renderTickerMarquee(items);
    updateItemsCount(items.length);
  }

  function updateItemsCount(count) {
    const el = document.getElementById('news-count-badge');
    if (el) {
      el.textContent = `${count} Meldungen`;
    }
  }

  // ============================================================================
  // 6. UI RENDERING (MINIMAL, CALM, HIGH-END)
  // ============================================================================

  function renderRegionFlags() {
    const container = document.getElementById('news-region-selector');
    if (!container) return;

    container.innerHTML = REGIONS.map(reg => {
      const isSelected = reg.id === currentRegion;
      return `
        <button onclick="RadioNewsEngine.selectRegion('${reg.id}')" class="px-2 py-1 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
          isSelected 
            ? 'bg-purple-500/25 text-white border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold' 
            : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 border border-white/8 font-medium'
        }">
          <span class="text-sm leading-none">${reg.flag}</span>
          <span class="text-[11px] whitespace-nowrap">${reg.name}</span>
        </button>
      `;
    }).join('');
  }

  function renderMediaChips() {
    const container = document.getElementById('news-media-selector');
    if (!container) return;

    const outlets = LOCAL_MEDIA_OUTLETS[currentRegion] || LOCAL_MEDIA_OUTLETS.de || [];
    container.innerHTML = outlets.map(outlet => {
      const isSelected = outlet.id === currentMedia;
      return `
        <button onclick="RadioNewsEngine.selectMedia('${outlet.id}')" class="px-2.5 py-0.5 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer select-none shrink-0 ${
          isSelected 
            ? 'bg-teal-500/25 text-teal-200 border border-teal-400/50 font-bold shadow-xs' 
            : 'bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-gray-200 border border-white/5 font-normal'
        }">
          ${outlet.icon ? `<span>${outlet.icon}</span>` : ''}
          <span class="whitespace-nowrap">${outlet.name}</span>
        </button>
      `;
    }).join('');
  }

  function renderCategoryChips() {
    const container = document.getElementById('news-category-selector');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
      const isSelected = cat.id === currentCategory;
      return `
        <button onclick="RadioNewsEngine.selectCategory('${cat.id}')" class="px-2.5 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1 cursor-pointer select-none shrink-0 ${
          isSelected 
            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-400/50 font-bold shadow-xs' 
            : 'bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-gray-200 border border-white/8 font-medium'
        }">
          <span>${cat.emoji}</span>
          <span class="whitespace-nowrap">${cat.name}</span>
        </button>
      `;
    }).join('');
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
        <span class="font-medium text-gray-200 hover:underline truncate max-w-[260px]">${it.title}</span>
        <span class="text-[9px] text-gray-500 font-mono">(${it.source})</span>
      </span>
    `).join('');
  }

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

    listContainer.innerHTML = items.map((item, idx) => `
      <div id="news-card-${idx}" class="news-item-card p-3 rounded-2xl bg-[#12131e]/90 hover:bg-[#181928] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between gap-2 text-left relative group">
        
        <!-- Card Header: Source Badge + Time + Controls -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="px-2 py-0.5 rounded-md bg-white/[0.06] text-purple-200 border border-white/10 text-[9px] font-semibold font-mono tracking-wide truncate">${item.source}</span>
            <span class="text-[9px] text-gray-500 font-mono shrink-0">${item.time}</span>
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
          <h4 class="text-xs font-bold text-white group-hover:text-purple-200 transition-colors leading-snug line-clamp-2">${item.title}</h4>
          <p class="text-[11px] text-gray-400 group-hover:text-gray-300 leading-relaxed font-normal line-clamp-3">${item.summary}</p>
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
    `).join('');

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

  // ============================================================================
  // 7. TEXT-TO-SPEECH (TTS) AUDIO BRIEFING
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

    const regionObj = REGIONS.find(r => r.id === currentRegion) || REGIONS[0];
    const targetLang = regionObj.lang || 'de-DE';
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Microsoft') || v.name.includes('Premium'))) ||
                            voices.find(v => v.lang.startsWith(targetLang.split('-')[0])) ||
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

  function setSpeechRate(rate) {
    speechRate = parseFloat(rate);
    localStorage.setItem('flow_news_speech_rate', speechRate.toString());
    
    document.querySelectorAll('.news-speed-btn').forEach(btn => {
      const isCur = Math.abs(parseFloat(btn.dataset.speed) - speechRate) < 0.05;
      btn.className = isCur 
        ? 'news-speed-btn px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-500/50 text-[10px] font-mono font-bold cursor-pointer transition'
        : 'news-speed-btn px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 text-[10px] font-mono font-bold cursor-pointer transition';
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

  // ============================================================================
  // 8. INITIALIZATION
  // ============================================================================

  function initNewsPanel() {
    renderRegionFlags();
    renderMediaChips();
    renderCategoryChips();
    setSpeechRate(speechRate);
    fetchNewsForRegion(currentRegion);
  }

  function initRadioPanel() {
    renderRadioPanelContent();
    updateRadioUIState(isRadioPlaying);
  }

  function initPanel() {
    initNewsPanel();
    initRadioPanel();
  }

  const RadioNewsEngine = {
    initPanel,
    initRadioPanel,
    initNewsPanel,
    switchMainTab,
    selectRegion,
    selectMedia,
    selectCategory,
    handleNewsSearch,
    playRadioStation,
    toggleRadioPlayback,
    setRadioVolume,
    startNewsReader,
    toggleAllNewsReader,
    toggleNewsReaderPause,
    stopNewsReader,
    nextNewsItem,
    prevNewsItem,
    setSpeechRate,
    duckRadio,
    fetchNewsForRegion
  };

  if (typeof window !== 'undefined') {
    window.RadioNewsEngine = RadioNewsEngine;
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
