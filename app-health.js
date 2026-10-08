// app-health.js - Noodle Health, Prevention & Vitality Hub
// 100% Client-Side, Zero-Tracking, Neuro-Friendly & Medically Sound

(function() {
  'use strict';

  function tr(obj) {
    const l = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' && window.currentLang) || 'de');
    if (!obj || typeof obj !== 'object') return obj || '';
    return obj[l] || obj['en'] || obj['de'] || Object.values(obj)[0] || '';
  }

  // ============================================================================
  // 1. DATA MODELS & OFFICIAL PREVENTION GUIDELINES MATRIX
  // ============================================================================

  const DEFAULT_HEALTH_PROFILE = {
    age: 32,
    gender: 'female', // 'female' | 'male' | 'neutral'
    cycleEnabled: true,
    cycleStart: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    cycleLength: 28,
    periodLength: 5,
    smoker: false,
    completedCheckups: {},
    medications: [
      { id: 'med_1', name: 'Vitamin D3 + K2', dose: '2.000 I.E.', timing: 'morning', takenToday: false },
      { id: 'med_2', name: 'Magnesium', dose: '300 mg', timing: 'evening', takenToday: false }
    ],
    bpLogs: [
      { id: 'bp_1', date: new Date().toISOString().split('T')[0], sys: 120, dia: 78, pulse: 68 }
    ],
    doctorQuestions: [
      { id: 'q_1', doctor: 'Hausarzt', question: 'Großes Blutbild inkl. Vitamin D & Ferritin prüfen lassen?', done: false }
    ]
  };

  const CHECKUPS_DATABASE = [
    {
      id: 'dental',
      category: 'universal',
      title: 'Zahnärztliche Vorsorge & PZR',
      desc: 'Halbjährliche / jährliche Kontrolle von Zähnen, Zahnfleisch & professionelle Zahnreinigung.',
      minAge: 18,
      maxAge: 99,
      gender: 'all',
      intervalMonths: 6,
      officialBody: 'G-BA Richtlinie',
      icon: 'sparkles',
      color: 'sky'
    },
    {
      id: 'skin_cancer',
      category: 'universal',
      title: 'Hautkrebs-Screening',
      desc: 'Visuelle Ganzkörperuntersuchung der Haut auf verdächtige Muttermale & Veränderungen.',
      minAge: 35,
      maxAge: 99,
      gender: 'all',
      intervalMonths: 24,
      officialBody: 'G-BA (Kassenleistung ab 35)',
      icon: 'sun',
      color: 'amber'
    },
    {
      id: 'checkup_35',
      category: 'universal',
      title: 'Gesundheits-Check-up (Check-up 35)',
      desc: 'Ganzheitliche Untersuchung: Blutdruck, Blutzucker, Cholesterin, Nierenwerte, Urin & Herz-Kreislauf.',
      minAge: 35,
      maxAge: 99,
      gender: 'all',
      intervalMonths: 36,
      officialBody: 'G-BA Richtlinie (alle 3 Jahre)',
      icon: 'activity',
      color: 'teal'
    },
    {
      id: 'checkup_young',
      category: 'universal',
      title: 'Junger Erwachsenen Check-up (18–34 J.)',
      desc: 'Einmaliger Basis-Check auf frühe Risikofaktoren (Blutdruck, Blutzucker, Impfstatus, Lebensstil).',
      minAge: 18,
      maxAge: 34,
      gender: 'all',
      intervalMonths: 120,
      officialBody: 'G-BA (Einmalig 18–34)',
      icon: 'shield',
      color: 'emerald'
    },
    {
      id: 'colon_stool',
      category: 'universal',
      title: 'Darmkrebs-Früherkennung (Stuhltest iFOBT)',
      desc: 'Immunologischer Stuhltest auf nichtsichtbare Blutspuren im Stuhl zur Früherkennung.',
      minAge: 50,
      maxAge: 99,
      gender: 'all',
      intervalMonths: 12,
      officialBody: 'G-BA Krebsfrüherkennung',
      icon: 'microscope',
      color: 'indigo'
    },
    {
      id: 'colonoscopy',
      category: 'universal',
      title: 'Darmspiegelung (Koloskopie)',
      desc: 'Goldstandard zur Vorsorge & direkten Polypenentfernung (Männer ab 50, Frauen ab 55).',
      minAge: 50,
      maxAge: 99,
      gender: 'all',
      intervalMonths: 120,
      officialBody: 'G-BA Krebsfrüherkennung',
      icon: 'search',
      color: 'violet'
    },
    {
      id: 'eye_glaucoma',
      category: 'universal',
      title: 'Augeninnendruck & Glaukom-Vorsorge',
      desc: 'Sehnerv- & Augendruckkontrolle zur Früherkennung des Grünen Stars.',
      minAge: 40,
      maxAge: 99,
      gender: 'all',
      intervalMonths: 24,
      officialBody: 'DOG Empfehlung',
      icon: 'eye',
      color: 'cyan'
    },
    {
      id: 'cervical_pap',
      category: 'female',
      title: 'Gynäkologische Krebsvorsorge (Pap-Test)',
      desc: 'Zellabstrich des Gebärmutterhalses zur Früherkennung von Zellveränderungen.',
      minAge: 20,
      maxAge: 34,
      gender: 'female',
      intervalMonths: 12,
      officialBody: 'G-BA Richtlinie (jährlich)',
      icon: 'shield-check',
      color: 'rose'
    },
    {
      id: 'cervical_co_test',
      category: 'female',
      title: 'Kombi-Screening (Pap-Test + HPV-Test)',
      desc: 'Kombinierte Vorsorgeuntersuchung auf Humane Papillomviren (HPV) und Zellveränderungen.',
      minAge: 35,
      maxAge: 99,
      gender: 'female',
      intervalMonths: 36,
      officialBody: 'G-BA Richtlinie (alle 3 Jahre)',
      icon: 'shield-check',
      color: 'pink'
    },
    {
      id: 'breast_palpation',
      category: 'female',
      title: 'Abtastuntersuchung der Brust',
      desc: 'Tastuntersuchung von Brust & Achselhöhlen durch die Frauenärztin.',
      minAge: 30,
      maxAge: 99,
      gender: 'female',
      intervalMonths: 12,
      officialBody: 'G-BA Richtlinie (jährlich)',
      icon: 'heart',
      color: 'fuchsia'
    },
    {
      id: 'mammography',
      category: 'female',
      title: 'Mammographie-Screening',
      desc: 'Röntgenreihenuntersuchung der Brust im qualitätsgesicherten Screening-Zentrum.',
      minAge: 50,
      maxAge: 75,
      gender: 'female',
      intervalMonths: 24,
      officialBody: 'G-BA Screening (50–75 J.)',
      icon: 'activity',
      color: 'rose'
    },
    {
      id: 'prostate_exam',
      category: 'male',
      title: 'Prostata- & Genitaluntersuchung',
      desc: 'Tastuntersuchung der Prostata, der äußeren Genitalien und der regionalen Lymphknoten.',
      minAge: 45,
      maxAge: 99,
      gender: 'male',
      intervalMonths: 12,
      officialBody: 'G-BA Richtlinie (jährlich ab 45)',
      icon: 'shield',
      color: 'blue'
    },
    {
      id: 'aorta_ultrasound',
      category: 'male',
      title: 'Bauchaortenaneurysma-Screening',
      desc: 'Einmaliger Ultraschall der Bauchschlagader zur Erkennung gefährlicher Erweiterungen.',
      minAge: 65,
      maxAge: 99,
      gender: 'male',
      intervalMonths: 240,
      officialBody: 'G-BA (Einmalig für Männer ab 65)',
      icon: 'heart-pulse',
      color: 'indigo'
    }
  ];

  let currentTab = 'radar'; // 'radar' | 'daily' | 'cycle' | 'profile'

  function loadProfile() {
    try {
      const stored = localStorage.getItem('flow_health_profile');
      if (stored) {
        return { ...DEFAULT_HEALTH_PROFILE, ...JSON.parse(stored) };
      }
    } catch (e) {}
    return { ...DEFAULT_HEALTH_PROFILE };
  }

  function saveProfile(updated) {
    try {
      const current = loadProfile();
      const merged = { ...current, ...updated };
      localStorage.setItem('flow_health_profile', JSON.stringify(merged));
      renderHealthPanel();
      if (typeof window.showToast === 'function') {
        window.showToast('✓ Gesundheitsprofil gespeichert 🛡️');
      }
    } catch (e) {}
  }

  function getRelevantCheckups(profile) {
    const age = profile.age || 30;
    const gender = profile.gender || 'neutral';

    return CHECKUPS_DATABASE.filter(c => {
      if (c.gender !== 'all' && c.gender !== gender && gender !== 'neutral') return false;
      if (c.minAge && age < c.minAge - 5) return false;
      return true;
    }).map(c => {
      const lastDone = profile.completedCheckups && profile.completedCheckups[c.id];
      let status = 'due';
      let daysRemaining = 0;

      if (lastDone) {
        const lastDate = new Date(lastDone);
        const nextDue = new Date(lastDate);
        nextDue.setMonth(nextDue.getMonth() + c.intervalMonths);
        const diffDays = Math.round((nextDue - new Date()) / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;
        if (diffDays > 30) status = 'done';
        else if (diffDays >= 0) status = 'soon';
        else status = 'urgent';
      } else {
        if (age >= c.minAge && age <= c.maxAge) status = 'due';
        else status = 'upcoming';
      }

      return { ...c, lastDone, status, daysRemaining };
    });
  }

  function calculateCycleState(profile) {
    if (!profile.cycleEnabled || !profile.cycleStart) return null;
    const start = new Date(profile.cycleStart);
    const today = new Date();
    const cycleLength = profile.cycleLength || 28;
    const periodLength = profile.periodLength || 5;

    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) % cycleLength;
    const currentDay = diffDays + 1;

    let phase = 'follicular';
    let phaseName = 'Follikelphase';
    let energyLevel = 'Steigend ⚡';
    let moodAdvice = 'Gute Phase für neue Projekte & kreativen Fokus.';
    let icon = '🌱';
    let color = 'emerald';

    if (currentDay <= periodLength) {
      phase = 'menstruation';
      phaseName = 'Menstruation';
      energyLevel = 'Ruhig / Erholung 🌙';
      moodAdvice = 'Sanfte Aufgaben, ausreichend Schlaf & wärmender Tee.';
      icon = '🩸';
      color = 'rose';
    } else if (currentDay >= 13 && currentDay <= 15) {
      phase = 'ovulation';
      phaseName = 'Eisprung / Ovulation';
      energyLevel = 'Peak Energie 🚀';
      moodAdvice = 'Höchste Kommunikationskraft & Tatendrang.';
      icon = '✨';
      color = 'amber';
    } else if (currentDay > 15) {
      phase = 'luteal';
      phaseName = 'Lutealphase';
      energyLevel = 'Fokussiert / Ausklingend 🧘';
      moodAdvice = 'Strukturierte Aufgaben abschließen, Stress reduzieren.';
      icon = '🍂';
      color = 'purple';
    }

    return { currentDay, cycleLength, phase, phaseName, energyLevel, moodAdvice, icon, color };
  }

  function switchHealthTab(tabName) {
    currentTab = tabName;
    renderHealthPanel();
  }

  function markCheckupDone(checkupId) {
    const profile = loadProfile();
    profile.completedCheckups = profile.completedCheckups || {};
    profile.completedCheckups[checkupId] = new Date().toISOString().split('T')[0];
    saveProfile(profile);
    if (typeof window.showToast === 'function') {
      window.showToast('✓ Vorsorge-Checkup als erledigt markiert! 🛡️');
    }
  }

  function toggleMedication(medId) {
    const profile = loadProfile();
    profile.medications = profile.medications.map(m => {
      if (m.id === medId) return { ...m, takenToday: !m.takenToday };
      return m;
    });
    saveProfile(profile);
  }

  function addMedication(name, dose, timing) {
    if (!name || !name.trim()) return;
    const profile = loadProfile();
    profile.medications = profile.medications || [];
    profile.medications.push({
      id: `med_${Date.now()}`,
      name: name.trim(),
      dose: dose.trim() || '1x',
      timing: timing || 'morning',
      takenToday: false
    });
    saveProfile(profile);
  }

  function deleteMedication(medId) {
    const profile = loadProfile();
    profile.medications = profile.medications.filter(m => m.id !== medId);
    saveProfile(profile);
  }

  function addDoctorQuestion(doctor, question) {
    if (!question || !question.trim()) return;
    const profile = loadProfile();
    profile.doctorQuestions = profile.doctorQuestions || [];
    profile.doctorQuestions.push({
      id: `q_${Date.now()}`,
      doctor: doctor.trim() || 'Arzt',
      question: question.trim(),
      done: false
    });
    saveProfile(profile);
  }

  function deleteDoctorQuestion(qId) {
    const profile = loadProfile();
    profile.doctorQuestions = profile.doctorQuestions.filter(q => q.id !== qId);
    saveProfile(profile);
  }

  function renderHealthPanel() {
    const container = document.getElementById('panel-health-content');
    if (!container) return;

    const profile = loadProfile();
    const relevantCheckups = getRelevantCheckups(profile);
    const cycleState = profile.cycleEnabled ? calculateCycleState(profile) : null;

    const totalCheckups = relevantCheckups.length;
    const completedCount = relevantCheckups.filter(c => c.status === 'done').length;
    const dueCount = relevantCheckups.filter(c => c.status === 'due' || c.status === 'urgent').length;

    let html = `
      <!-- 1. KOPFZEILE: NOODLE HEALTH BRANDING -->
      <div class="flex items-center justify-between border-b border-white/10 pb-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-sm shrink-0">
            <i data-lucide="shield-plus" class="w-4 h-4"></i>
          </div>
          <div class="relative flex flex-col items-center justify-center shrink-0">
            <div class="relative overflow-hidden flex items-center justify-center">
              <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
            </div>
            <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
              <span class="badge-tool-subtext select-none">HEALTH</span>
            </div>
          </div>
        </div>
        <button onclick="togglePanel('health')" aria-label="Gesundheits-Panel schließen" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
      </div>

      <!-- TOP PROFILE SUMMARY BANNER -->
      <div class="p-2 rounded-xl bg-gradient-to-r from-rose-500/15 via-purple-500/10 to-teal-500/15 border border-rose-500/30 flex items-center justify-between shadow-inner">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 font-bold text-xs shadow-xs">
            ${profile.gender === 'female' ? '🌸' : profile.gender === 'male' ? '⚡' : '🌿'}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">${profile.age} ${tr({ de: 'Jahre', en: 'years', fr: 'ans', it: 'anni', es: 'años', el: 'χρόνων' })}</span>
              <span class="text-[10px] text-gray-400">•</span>
              <span class="text-[10px] font-semibold text-rose-200 capitalize">${profile.gender === 'female' ? tr({ de: 'Weiblich', en: 'Female', fr: 'Femme', it: 'Femmina', es: 'Femenino', el: 'Γυναίκα' }) : profile.gender === 'male' ? tr({ de: 'Männlich', en: 'Male', fr: 'Homme', it: 'Maschio', es: 'Masculino', el: 'Άνδρας' }) : tr({ de: 'Divers', en: 'Diverse', fr: 'Neutre', it: 'Altro', es: 'Diverso', el: 'Άλλο' })}</span>
            </div>
            <div class="text-[9px] text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span class="${dueCount > 0 ? 'text-amber-300 font-bold' : 'text-emerald-300'}">● ${dueCount > 0 ? `${dueCount} ${tr({ de: 'fällig', en: 'due', fr: 'dû', it: 'scaduto', es: 'pendiente', el: 'εκκρεμεί' })}` : tr({ de: 'Aktuell', en: 'Up to date', fr: 'À jour', it: 'Aggiornato', es: 'Al día', el: 'Ενήμερο' })}</span>
              <span>•</span>
              <span>${completedCount}/${totalCheckups} ${tr({ de: 'erledigt', en: 'done', fr: 'fait', it: 'fatto', es: 'hecho', el: 'ολοκληρωμένα' })}</span>
            </div>
          </div>
        </div>
        <button onclick="HealthEngine.switchTab('profile')" class="px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer">
          <i data-lucide="sliders" class="w-3 h-3 text-rose-300"></i>
          <span>${tr({ de: 'Profil', en: 'Profile', fr: 'Profil', it: 'Profilo', es: 'Perfil', el: 'Προφίλ' })}</span>
        </button>
      </div>

      <!-- PRIMARY NAVIGATION TABS -->
      <div class="flex bg-black/60 p-1 rounded-2xl border border-white/10 text-xs font-bold gap-1 shadow-sm">
        <button onclick="HealthEngine.switchTab('radar')" class="flex-1 py-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer ${currentTab === 'radar' ? 'bg-rose-600/35 border border-rose-400/70 text-white shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>${tr({ de: 'Vorsorge', en: 'Prevention', fr: 'Prévention', it: 'Prevenzione', es: 'Prevención', el: 'Πρόληψη' })}</span>
        </button>
        <button onclick="HealthEngine.switchTab('daily')" class="flex-1 py-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer ${currentTab === 'daily' ? 'bg-rose-600/35 border border-rose-400/70 text-white shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
          <i data-lucide="pill" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>${tr({ de: 'Alltag & Meds', en: 'Daily & Meds', fr: 'Meds & Santé', it: 'Meds & Salute', es: 'Medicinas', el: 'Φάρμακα & Υγεία' })}</span>
        </button>
        ${profile.cycleEnabled ? `
        <button onclick="HealthEngine.switchTab('cycle')" class="flex-1 py-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer ${currentTab === 'cycle' ? 'bg-rose-600/35 border border-rose-400/70 text-white shadow-xs' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
          <i data-lucide="moon" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>${tr({ de: 'Zyklus', en: 'Cycle', fr: 'Cycle', it: 'Ciclo', es: 'Ciclo', el: 'Κύκλος' })}</span>
        </button>` : ''}
      </div>
    `;

    if (currentTab === 'radar') {
      html += `
        <div class="space-y-1.5 animate-fade-in text-xs">
          <div class="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            ${relevantCheckups.map(c => `
              <div class="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border ${c.status === 'urgent' ? 'border-rose-500/50 bg-rose-500/5' : c.status === 'due' ? 'border-amber-500/40 bg-amber-500/5' : c.status === 'done' ? 'border-emerald-500/30' : 'border-white/10'} transition flex items-center justify-between gap-2.5 group">
                <div class="flex items-start gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-xl bg-${c.color}-500/20 border border-${c.color}-500/40 flex items-center justify-center text-${c.color}-300 shrink-0 mt-0.5">
                    <i data-lucide="${c.icon}" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <h4 class="font-bold text-white text-xs truncate">${c.title}</h4>
                      <span class="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold ${c.status === 'done' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : c.status === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}">
                        ${c.status === 'done' ? tr({de:'Erledigt ✓',en:'Done ✓',fr:'Fait ✓',it:'Fatto ✓',es:'Hecho ✓',el:'Ολοκληρώθηκε ✓'}) : c.status === 'urgent' ? tr({de:'Überfällig!',en:'Overdue!',fr:'En retard !',it:'Scaduto!',es:'¡Atrasado!',el:'Εκπρόθεσμο!'}) : tr({de:'Fällig',en:'Due',fr:'Dû',it:'In scadenza',es:'Pendiente',el:'Εκκρεμεί'})}
                      </span>
                    </div>
                    <p class="text-[10px] text-gray-400 line-clamp-1 mt-0.5">${c.desc}</p>
                    <div class="flex items-center gap-2 text-[9px] text-gray-500 font-mono mt-1">
                      <span>${c.officialBody}</span>
                      <span>•</span>
                      <span>${c.lastDone ? `${tr({de:'Zuletzt',en:'Last',fr:'Dernier',it:'Ultimo',es:'Último',el:'Τελευταία'})}: ${c.lastDone}` : tr({de:'Noch nicht erfasst',en:'Not recorded yet',fr:'Pas encore enregistré',it:'Non ancora registrato',es:'Aún no registrado',el:'Δεν έχει καταγραφεί'})}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="HealthEngine.markCheckupDone('${c.id}')" class="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-500/40 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer" title="Als erledigt markieren">
                    <i data-lucide="check" class="w-3 h-3"></i>
                    <span>${tr({de:'Erledigt',en:'Done',fr:'Fait',it:'Fatto',es:'Hecho',el:'Έγινε'})}</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (currentTab === 'daily') {
      html += `
        <div class="space-y-3 animate-fade-in text-xs">
          <!-- Medikamente & Vitamine -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[10.5px] font-bold text-gray-300 px-1">
              <span class="flex items-center gap-1 text-rose-300">
                <i data-lucide="pill" class="w-3.5 h-3.5"></i>
                <span>${tr({de:'Tägliche Medikamente & Vitamine',en:'Daily Medications & Vitamins',fr:'Médicaments & Vitamines du jour',it:'Farmaci e vitamine giornalieri',es:'Medicamentos y vitaminas diarios',el:'Καθημερινά φάρμακα & Βιταμίνες'})}</span>
              </span>
              <span class="text-[9.5px] text-gray-400 font-mono">${profile.medications.filter(m => m.takenToday).length}/${profile.medications.length} ${tr({de:'genommen',en:'taken',fr:'pris',it:'assunti',es:'tomados',el:'ελήφθησαν'})}</span>
            </div>
            <div class="space-y-1 max-h-[110px] overflow-y-auto pr-1">
              ${profile.medications.map(m => `
                <div class="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <button onclick="HealthEngine.toggleMedication('${m.id}')" class="w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition ${m.takenToday ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20 bg-black/40 text-transparent'}">
                      <i data-lucide="check" class="w-3 h-3"></i>
                    </button>
                    <div>
                      <span class="font-bold text-xs ${m.takenToday ? 'line-through text-gray-400' : 'text-white'}">${m.name}</span>
                      <span class="text-[9.5px] text-gray-400 font-mono ml-1">(${m.dose})</span>
                    </div>
                  </div>
                  <button onclick="HealthEngine.deleteMedication('${m.id}')" class="text-gray-500 hover:text-rose-400 p-1 cursor-pointer">✕</button>
                </div>
              `).join('')}
            </div>
            <div class="flex gap-1.5 pt-1">
              <input type="text" id="health-new-med-name" placeholder="${tr({de:'Neues Präparat (z.B. Omega 3)...',en:'New supplement (e.g. Omega 3)...',fr:'Nouveau produit (ex. Oméga 3)...',it:'Nuovo integratore (es. Omega 3)...',es:'Nuevo suplemento (ej. Omega 3)...',el:'Νέο σκεύασμα (π.χ. Ωμέγα 3)...'})}" class="flex-1 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500">
              <input type="text" id="health-new-med-dose" placeholder="${tr({de:'Dosis...',en:'Dose...',fr:'Dose...',it:'Dose...',es:'Dosis...',el:'Δόση...'})}" class="w-20 bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500">
              <button onclick="
                const n = document.getElementById('health-new-med-name').value;
                const d = document.getElementById('health-new-med-dose').value;
                HealthEngine.addMedication(n, d);
              " class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center gap-1">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>${tr({de:'Hinzufügen',en:'Add',fr:'Ajouter',it:'Aggiungi',es:'Añadir',el:'Προσθήκη'})}</span>
              </button>
            </div>
          </div>

          <!-- Fragen für den nächsten Arztbesuch -->
          <div class="space-y-1.5 pt-2 border-t border-white/10">
            <div class="flex items-center justify-between text-[10.5px] font-bold text-gray-300 px-1">
              <span class="flex items-center gap-1 text-teal-300">
                <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
                <span>${tr({de:'Fragen für den nächsten Arztbesuch',en:'Questions for next doctor visit',fr:'Questions pour le médecin',it:'Domande per il prossimo medico',es:'Preguntas para el médico',el:'Ερωτήσεις για τον επόμενο γιατρό'})}</span>
              </span>
            </div>
            <div class="space-y-1 max-h-[100px] overflow-y-auto pr-1">
              ${profile.doctorQuestions.map(q => `
                <div class="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
                  <div class="flex items-start gap-2 min-w-0">
                    <span class="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[9px] font-mono font-bold mt-0.5">${q.doctor}</span>
                    <span class="text-xs text-gray-200">${q.question}</span>
                  </div>
                  <button onclick="HealthEngine.deleteDoctorQuestion('${q.id}')" class="text-gray-500 hover:text-rose-400 p-1 cursor-pointer">✕</button>
                </div>
              `).join('')}
            </div>
            <div class="flex gap-1.5 pt-1">
              <input type="text" id="health-new-q-text" placeholder="${tr({de:'Frage an Arzt notieren...',en:'Note question for doctor...',fr:'Noter question pour le médecin...',it:'Scrivi domanda per il medico...',es:'Anotar pregunta para el médico...',el:'Σημειώστε ερώτηση για τον γιατρό...'})}" class="flex-1 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500">
              <button onclick="
                const txt = document.getElementById('health-new-q-text').value;
                HealthEngine.addDoctorQuestion('Hausarzt', txt);
              " class="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs cursor-pointer transition flex items-center gap-1">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>${tr({de:'Hinzufügen',en:'Add',fr:'Ajouter',it:'Aggiungi',es:'Añadir',el:'Προσθήκη'})}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (currentTab === 'cycle' && cycleState) {
      html += `
        <div class="space-y-2.5 animate-fade-in text-xs">
          <div class="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-purple-500/20 border border-rose-400/40 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">${cycleState.icon}</span>
                <div>
                  <h4 class="font-bold text-white text-sm leading-tight">${cycleState.phaseName}</h4>
                  <span class="text-[10px] text-rose-200 font-mono">Tag ${cycleState.currentDay} von ${cycleState.cycleLength}</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold border border-rose-400/40">${cycleState.energyLevel}</span>
            </div>
            <p class="text-[11px] text-rose-100/90 leading-relaxed bg-black/30 p-2 rounded-xl border border-white/5">
              💡 ${cycleState.moodAdvice}
            </p>
          </div>
        </div>
      `;
    } else if (currentTab === 'profile') {
      html += `
        <div class="space-y-3 animate-fade-in text-xs">
          <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <h4 class="font-bold text-white text-xs">Profil & Vorsorge-Filter</h4>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] text-gray-400 block mb-0.5">Alter:</label>
                <input type="number" id="health-prof-age" value="${profile.age}" min="18" max="100" class="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white">
              </div>
              <div>
                <label class="text-[10px] text-gray-400 block mb-0.5">Geschlecht:</label>
                <select id="health-prof-gender" class="w-full bg-black/80 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white">
                  <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Weiblich</option>
                  <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Männlich</option>
                  <option value="neutral" ${profile.gender === 'neutral' ? 'selected' : ''}>Neutral / Divers</option>
                </select>
              </div>
            </div>
            <button onclick="
              const a = parseInt(document.getElementById('health-prof-age').value, 10) || 30;
              const g = document.getElementById('health-prof-gender').value;
              HealthEngine.saveProfile({ age: a, gender: g });
              HealthEngine.switchTab('radar');
            " class="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer">
              Speichern & Aktualisieren
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  const HealthEngine = {
    loadProfile,
    saveProfile,
    switchTab: switchHealthTab,
    renderPanel: renderHealthPanel,
    markCheckupDone,
    toggleMedication,
    addMedication,
    deleteMedication,
    addDoctorQuestion,
    deleteDoctorQuestion
  };

  if (typeof window !== 'undefined') {
    window.HealthEngine = HealthEngine;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.HealthEngine = HealthEngine;
  }
})();
