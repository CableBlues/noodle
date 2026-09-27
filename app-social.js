// app-social.js: High-End Social Media Launch, Viral Sharing Engine & Visual Card Studio for Noodle Studio
// 100% Client-Side, Zero Tracking, GDPR/DSGVO compliant, Canvas-powered Social Graphic Generator

(function() {
  'use strict';

  // ============================================================================
  // 1. CONSTANTS & VIRAL COPY TEMPLATES (DE & EN)
  // ============================================================================

  const APP_URL = (typeof window !== 'undefined' && window.location) ? (window.location.origin + window.location.pathname) : 'https://noodle.studio';
  const GITHUB_URL = 'https://github.com/CableBlues/noodle';
  
  const VIRAL_POSTS = [
    {
      id: 'x_thread_story',
      platform: 'x',
      platformName: 'X / Twitter (Thread)',
      icon: 'twitter',
      title: '🧵 Thread: Die Geschichte & Philosophie hinter Noodle Studio',
      lang: 'de',
      content: `1/7 Ich habe die letzten Monate damit verbracht, das Anti-Überforderungs-Tool zu bauen, das ich selbst immer gebraucht habe: @NoodleStudio 🌿✨\n\n100% kostenlos, offline-fähig, keine Paywalls, kein Daten-Tracking.\n\nHier ist, warum moderne Todo-Apps ADHS- und Kreativ-Köpfe oft blockieren – und wie wir es lösen 🧵👇\n\n2/7 Das Problem: Die meisten Produktivitäts-Apps bombardieren uns mit roten Badges, Benachrichtigungs-Terror und starren Deadlines.\nErgebnis? Sensorischer Overload und Prokrastination.\n\n3/7 Noodle Studio verfolgt ein anderes Prinzip: "Calm Ergonomics & Sensory Flow".\n- Integrierte Soundscapes (Binaural Beats, Regen, Lofi, Synth & DJ Lounge)\n- 3D-Matrix & automatischer Aufgaben-Zerleger (Next-Small-Step)\n- Human Voice Focus-Coach für sanfte Motivation\n- Live-Nachrichten Ticker & Welt-Radio für ruhige Pausen\n\n4/7 Das Beste: Es läuft 100% autark im Browser (PWA), speichert alles sicher lokal auf deinem Gerät und funktioniert komplett im Flugmodus.\n\n5/7 Ob Deep Work, Lernen, Kochen, Putz-Guide oder somatische Beruhigung – Noodle vereint alles an einem Ort, ohne das Gefühl von "Arbeit" zu erzeugen.\n\n6/7 Probiere es direkt im Browser aus (kein Account-Zwang):\n🔗 ${APP_URL}\n\n7/7 Feedback ist Gold wert! Lass mich wissen, wie es sich für deinen Flow anfühlt. RT für mehr ruhige, humane Software 💙 #buildinpublic #productivity #adhd #indiehackers`
    },
    {
      id: 'x_thread_en',
      platform: 'x',
      platformName: 'X / Twitter (Viral Launch)',
      icon: 'twitter',
      title: '🚀 Launch Announcement (English)',
      lang: 'en',
      content: `I got tired of bloated, subscription-greedy productivity apps that induce sensory overload.\n\nSo I built @NoodleStudio: a calm, aesthetic, offline-first workspace tailored for neurodivergent minds, deep workers & creators. 🌿🎧\n\n✨ Ambient Soundscapes & DJ Focus Lounge\n✨ Smart Task Chunking (Step-by-Step)\n✨ Human Voice Coach & Micro-Routines\n✨ Live Calming News & Global Radio\n✨ 100% Free, Zero Ads, 100% Local Privacy\n\nTry it instantly in your browser (no signup required):\n👉 ${APP_URL}\n\n#buildinpublic #indiehackers #productivity #adhd #deepwork`
    },
    {
      id: 'linkedin_thought',
      platform: 'linkedin',
      platformName: 'LinkedIn (Thought Leadership)',
      icon: 'linkedin',
      title: '💼 LinkedIn Post: Digitale Ergonomie & Fokus',
      lang: 'de',
      content: `Warum scheitern 80% aller Produktivitäts-Tools nach nur zwei Wochen?\n\nWeil sie für Roboter gebaut sind – nicht für das menschliche Nervensystem. 🧠\n\nIn einer Arbeitswelt voller Push-Notifications, Slack-Pings und endloser Todo-Listen ist "mehr Disziplin" nicht die Lösung. Die Lösung ist digitale Ergonomie.\n\nDeshalb haben wir NOODLE STUDIO entwickelt:\nEinen radikal minimalistischen, neurodivergenz-freundlichen Workspace, der sensorische Überlastung abbaut und echten "Flow" spürbar macht.\n\nDie Kern-Prinzipien:\n1️⃣ Zero Friction: Sofort startklar ohne Anmelde-Zwang oder Tracking.\n2️⃣ Integrierte Akustik: Prozedurale Ambient-Soundscapes & Lofi-Fokus, die nachweislich Alpha-Wellen im Gehirn anregen.\n3️⃣ Kognitive Entlastung: Große Aufgaben werden mit einem Klick in mundgerechte Mikro-Schritte zerlegt.\n4️⃣ 100% Datensouveränität: Alle Daten bleiben lokal beim Nutzer (DSGVO-konform).\n\nDas Projekt ist 100% kostenlos als Open-Web-App verfügbar.\n\n👉 Jetzt im Browser erleben: ${APP_URL}\n\nWie gestaltet ihr euren digitalen Arbeitsplatz, um fokussiert zu bleiben? Ich freue mich auf eure Gedanken in den Kommentaren!\n\n#Produktivität #MentalHealth #WorkplaceErgonomics #DeepWork #Innovation #Software`
    },
    {
      id: 'reddit_productivity',
      platform: 'reddit',
      platformName: 'Reddit (r/productivity / r/ADHD)',
      icon: 'message-circle',
      title: '👾 Reddit Showcase: Honest & Value-First',
      lang: 'en',
      content: `Title: I built a 100% free, offline, calm life organiser with soundscapes & micro-routines to fix sensory overload\n\nHey r/productivity!\n\nLike many here with ADHD/neurodivergent brains, I've tried every planner out there (Notion, Todoist, Obsidian, TickTick). Most of them ended up becoming another chore that triggered analysis paralysis.\n\nA few months ago, I started building Noodle Studio with a few non-negotiable rules:\n1. Zero sensory overload: Dark soothing aesthetics, no intrusive popups or paywalls.\n2. Built-in flow audio: Dual-deck focus music, ambient soundscapes (rain, hearth, binaural beats) and chill radio so you never leave the tab.\n3. Micro-step task chunking: Break down overwhelming goals into 2-minute actionable steps with one click.\n4. Complete offline privacy: 100% client-side PWA, zero tracking, your data never leaves your device.\n\nIt includes daily matrix organization, smart shopping lists, home workout routines, somatic regulation / breathwork, and a human voice timer companion.\n\nIt's completely free to use on desktop and mobile:\n🔗 ${APP_URL}\nGitHub: ${GITHUB_URL}\n\nI'd love your honest feedback! What feature would make your daily workflow even calmer?`
    },
    {
      id: 'tiktok_script',
      platform: 'tiktok',
      platformName: 'TikTok / Reels / Shorts (Script)',
      icon: 'video',
      title: '📱 30s TikTok & Reels Video-Skript',
      lang: 'de',
      content: `[0:00 - 0:03 HOOK - Gesicht in Nahaufnahme / Bildschirm überfordert mit 50 Tabs]:\n"Wenn du auch ADHS hast oder dich von Todo-Apps gestresst fühlst, stop scrolling für 15 Sekunden..."\n\n[0:03 - 0:10 VISUELLER SCHNITT - Sanfter Übergang zu Noodle Studio im Dark Mode]:\n"Das hier ist Noodle Studio – eine kostenlose App, die speziell gegen sensorische Überlastung gebaut wurde."\n\n[0:10 - 0:20 FEATURE HIGHLIGHTS IN SCHNELLER FOLGE]:\n- Klick auf 'Sound': Lofi-Beats & Regen starten im Hintergrund.\n- Klick auf 'Aufgabe zerlegen': Ein riesiges Projekt verwandelt sich automatisch in 3 kleine, einfache Schritte.\n- Klick auf 'Innere Ruhe': 2-Minuten Atem-Übung mit sanftem Glow.\n\n[0:20 - 0:30 CALL TO ACTION]:\n"Kein Abo, kein Account, 100% offline auf jedem Gerät. Link ist in meiner Bio oder auf Noodle Studio!"`
    },
    {
      id: 'producthunt_pitch',
      platform: 'producthunt',
      platformName: 'Product Hunt Launch Kit',
      icon: 'zap',
      title: '🚀 Product Hunt Tagline & Maker Comment',
      lang: 'en',
      content: `Tagline:\nThe calm, sensory-friendly life organiser for ADHD & deep workers.\n\nShort Description:\nNoodle Studio is an all-in-one, offline-first productivity lounge combining micro-step task organization, ambient soundscapes, focus DJ decks, somatic breathwork, and gentle voice coaching. 100% client-side, zero tracking, zero paywalls.\n\nMaker First Comment:\n"Hey Product Hunt community! 👋\n\nWe built Noodle Studio because modern work software has become noisy, stressful, and bloated. As neurodivergent creators, we craved a serene space that protects our attention instead of exploiting it.\n\nNoodle gives you:\n🎧 Built-in audio lounge (ambient generator, vinyl DJ decks, radio)\n📋 Smart task chunking with matrix & kanban views\n🧘 Somatic regulation & impulse pause tools\n🎙️ Natural voice coach with time checks & gentle reminders\n📱 100% offline PWA, responsive on desktop and mobile\n\nNo signups, no ads, no telemetry. Just pure, focused calm.\n\nWe can't wait to hear your thoughts and suggestions! 🌿"`
    }
  ];

  // ============================================================================
  // 2. MODAL & TAB CONTROLS
  // ============================================================================

  let currentSocialTab = 'share'; // 'share' | 'card' | 'templates' | 'press'
  let cardFormat = 'story'; // 'story' (9:16) | 'post' (1:1) | 'banner' (16:9)
  let cardTheme = 'cyan'; // 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose'

  function openSocialLaunchModal(initialTab = 'share') {
    const modal = document.getElementById('modal-social-launch');
    if (!modal) return;
    modal.classList.remove('hidden');
    switchSocialTab(initialTab);
    renderTemplatesList();
    renderSocialCardPreview();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function closeSocialLaunchModal() {
    const modal = document.getElementById('modal-social-launch');
    if (modal) modal.classList.add('hidden');
  }

  function switchSocialTab(tabName) {
    currentSocialTab = tabName;
    const tabs = ['share', 'card', 'templates', 'press'];
    tabs.forEach(t => {
      const pane = document.getElementById('social-pane-' + t);
      const btn = document.getElementById('social-tab-' + t);
      if (pane) {
        if (t === tabName) pane.classList.remove('hidden');
        else pane.classList.add('hidden');
      }
      if (btn) {
        if (t === tabName) {
          btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-white bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer select-none';
        } else {
          btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-gray-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer select-none';
        }
      }
    });

    if (tabName === 'card') {
      setTimeout(() => renderSocialCardPreview(), 60);
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  // ============================================================================
  // 3. 1-CLICK VIRAL SHARING & WEB SHARE API
  // ============================================================================

  function getShareMessage(customHeadline) {
    const defaultText = customHeadline || 'Entdecke Noodle Studio: Der ruhige, barrierefreie & ästhetische Alltags-Planer für echten Flow 🌿🎧';
    return {
      title: 'Noodle Studio – Calm Productivity & Flow Workspace',
      text: defaultText,
      url: APP_URL
    };
  }

  function shareToPlatform(platform, customHeadline = '') {
    const data = getShareMessage(customHeadline);
    const textEncoded = encodeURIComponent(data.text);
    const urlEncoded = encodeURIComponent(data.url);
    const titleEncoded = encodeURIComponent(data.title);

    let targetUrl = '';
    switch (platform) {
      case 'x':
      case 'twitter':
        targetUrl = 'https://twitter.com/intent/tweet?text=' + textEncoded + '&url=' + urlEncoded + '&hashtags=NoodleStudio,Productivity,ADHD,BuildInPublic';
        break;
      case 'linkedin':
        targetUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + urlEncoded;
        break;
      case 'reddit':
        targetUrl = 'https://reddit.com/submit?url=' + urlEncoded + '&title=' + titleEncoded;
        break;
      case 'threads':
        targetUrl = 'https://threads.net/intent/post?text=' + textEncoded + '%20' + urlEncoded;
        break;
      case 'bluesky':
        targetUrl = 'https://bsky.app/intent/compose?text=' + textEncoded + '%20' + urlEncoded;
        break;
      case 'whatsapp':
        targetUrl = 'https://api.whatsapp.com/send?text=' + textEncoded + '%20' + urlEncoded;
        break;
      case 'telegram':
        targetUrl = 'https://t.me/share/url?url=' + urlEncoded + '&text=' + textEncoded;
        break;
      case 'facebook':
        targetUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + urlEncoded;
        break;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer,width=640,height=580');
    }
  }

  async function triggerNativeWebShare(customHeadline = '') {
    const data = getShareMessage(customHeadline);
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url
        });
        if (typeof showToast === 'function') showToast('✅ Erfolgreich geteilt!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyAppShareLink();
        }
      }
    } else {
      copyAppShareLink();
    }
  }

  function copyAppShareLink() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(APP_URL).then(() => {
        if (typeof showToast === 'function') {
          showToast('🔗 Noodle Link in die Zwischenablage kopiert!');
        }
      });
    } else {
      prompt('Kopiere diesen Link:', APP_URL);
    }
  }

  function copyTextToClipboard(text, successMessage = '✅ Text in die Zwischenablage kopiert!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast(successMessage);
      });
    } else {
      prompt('Kopiere folgenden Text:', text);
    }
  }

  // ============================================================================
  // 4. MILESTONE & ACHIEVEMENT SHARING TRIGGER
  // ============================================================================

  function shareTaskAchievement(taskTitle) {
    const msg = '🎉 Gerade erledigt in @NoodleStudio: "' + taskTitle + '" – Schritt für Schritt im Flow! 🌿';
    openSocialLaunchModal('share');
    const customInput = document.getElementById('social-custom-share-text');
    if (customInput) customInput.value = msg;
  }

  function shareStreakAchievement(streakDays) {
    const msg = '🔥 ' + streakDays + ' Tage Flow-Streak in @NoodleStudio erreicht! Ruhig, fokussiert & ohne Überforderung. 🌿✨';
    openSocialLaunchModal('card');
    const customInput = document.getElementById('social-custom-share-text');
    if (customInput) customInput.value = msg;
  }

  // ============================================================================
  // 5. HIGH-RESOLUTION CANVAS CARD GENERATOR (STORY, POST, BANNER)
  // ============================================================================

  const CARD_THEMES = {
    cyan: { primary: '#00f2ff', secondary: '#38bdf8', bgGradStart: '#04131a', bgGradEnd: '#02060a', glow: 'rgba(0, 242, 255, 0.4)' },
    purple: { primary: '#c084fc', secondary: '#e879f9', bgGradStart: '#14061f', bgGradEnd: '#06020a', glow: 'rgba(192, 132, 252, 0.4)' },
    emerald: { primary: '#34d399', secondary: '#10b981', bgGradStart: '#031911', bgGradEnd: '#010805', glow: 'rgba(52, 211, 153, 0.4)' },
    amber: { primary: '#fbbf24', secondary: '#f59e0b', bgGradStart: '#1a1202', bgGradEnd: '#0a0701', glow: 'rgba(251, 191, 36, 0.4)' },
    rose: { primary: '#fb7185', secondary: '#f43f5e', bgGradStart: '#1a050d', bgGradEnd: '#0a0205', glow: 'rgba(251, 113, 133, 0.4)' }
  };

  function setCardFormat(fmt) {
    cardFormat = fmt;
    ['story', 'post', 'banner'].forEach(f => {
      const btn = document.getElementById('card-fmt-btn-' + f);
      if (btn) {
        if (f === fmt) {
          btn.className = 'px-3 py-1 rounded-xl bg-purple-500/30 text-purple-200 border border-purple-400/60 font-bold text-xs shadow-xs cursor-pointer';
        } else {
          btn.className = 'px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 text-xs font-medium cursor-pointer';
        }
      }
    });
    renderSocialCardPreview();
  }

  function setCardTheme(thm) {
    cardTheme = thm;
    document.querySelectorAll('.card-theme-selector-btn').forEach(btn => {
      const t = btn.dataset.theme;
      if (t === thm) {
        btn.classList.add('ring-2', 'ring-white', 'scale-110');
      } else {
        btn.classList.remove('ring-2', 'ring-white', 'scale-110');
      }
    });
    renderSocialCardPreview();
  }

  function getUserStatsForCard() {
    let streak = 3;
    let completedTasks = 5;
    let focusMinutes = 45;

    try {
      if (typeof state !== 'undefined') {
        if (state.streak) streak = state.streak;
        if (Array.isArray(state.tasks)) {
          completedTasks = state.tasks.filter(t => t.completed).length || 5;
        }
        if (state.totalFocusTime) {
          focusMinutes = Math.round(state.totalFocusTime / 60) || 45;
        }
      }
    } catch(e) {}

    return { streak, completedTasks, focusMinutes };
  }

  function renderSocialCardPreview() {
    const canvas = document.getElementById('social-card-canvas');
    if (!canvas) return;

    let width = 1080;
    let height = 1920; // 9:16 Story default

    if (cardFormat === 'post') {
      width = 1080;
      height = 1080; // 1:1
    } else if (cardFormat === 'banner') {
      width = 1200;
      height = 675; // 16:9
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = CARD_THEMES[cardTheme] || CARD_THEMES.cyan;
    const stats = getUserStatsForCard();

    // 1. Dark Neon Aurora Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgGradStart);
    bgGrad.addColorStop(0.5, '#0a0a10');
    bgGrad.addColorStop(1, theme.bgGradEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Glowing Ambient Orbs
    ctx.save();
    const orbGrad1 = ctx.createRadialGradient(width * 0.2, height * 0.25, 20, width * 0.2, height * 0.25, width * 0.6);
    orbGrad1.addColorStop(0, theme.glow);
    orbGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGrad1;
    ctx.fillRect(0, 0, width, height);

    const orbGrad2 = ctx.createRadialGradient(width * 0.8, height * 0.75, 20, width * 0.8, height * 0.75, width * 0.5);
    orbGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    orbGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGrad2;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 3. Subtle Modern Grid Background Pattern
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(y, 0);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Outer Glowing Frame
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    roundRect(ctx, 40, 40, width - 80, height - 80, 44);
    ctx.stroke();
    ctx.restore();

    // 5. Header: Logo & Brand Badge
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOODLE STUDIO', width / 2, height > 1200 ? 180 : 120);

    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('CALM PRODUCTIVITY & FLOW LOUNGE', width / 2, height > 1200 ? 230 : 160);
    ctx.restore();

    // 6. Central Highlight Achievement Box
    const boxW = width - 180;
    const boxH = height > 1200 ? 760 : (height > 900 ? 460 : 320);
    const boxX = (width - boxW) / 2;
    const boxY = height > 1200 ? 360 : (height > 900 ? 240 : 200);

    ctx.save();
    ctx.fillStyle = 'rgba(18, 19, 30, 0.85)';
    roundRect(ctx, boxX, boxY, boxW, boxH, 36);
    ctx.fill();
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.restore();

    // Stats Grid inside Box
    const statItemW = boxW / 3;
    const statsData = [
      { label: 'FLOW-STREAK', value: stats.streak + ' TAGE', icon: '🔥' },
      { label: 'ERLEDIGT', value: stats.completedTasks + ' TASKS', icon: '✅' },
      { label: 'FOKUS-ZEIT', value: stats.focusMinutes + ' MIN', icon: '⏳' }
    ];

    statsData.forEach((st, idx) => {
      const cx = boxX + statItemW * idx + statItemW / 2;
      const cy = boxY + (boxH * 0.35);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '48px sans-serif';
      ctx.fillText(st.icon, cx, cy - 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText(st.value, cx, cy + 50);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(st.label, cx, cy + 90);
      ctx.restore();
    });

    // Soothing Zen Quote inside Box
    ctx.save();
    ctx.fillStyle = theme.primary;
    ctx.font = 'italic bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const quoteY = boxY + boxH - 70;
    ctx.fillText('„Ruhig fokussiert. Schritt für Schritt im eigenen Flow.“', width / 2, quoteY);
    ctx.restore();

    // 7. Feature Pills
    if (height > 1200) {
      const pillsY = boxY + boxH + 80;
      const pills = ['🎧 Ambient Soundscapes', '🧩 Micro-Step Chunking', '🛡️ 100% Offline & Privat'];
      ctx.save();
      pills.forEach((p, i) => {
        const py = pillsY + (i * 75);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        roundRect(ctx, (width - 640) / 2, py, 640, 56, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        ctx.fillStyle = '#f4f4f5';
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p, width / 2, py + 36);
      });
      ctx.restore();
    }

    // 8. Footer: Join / App Link CTA
    ctx.save();
    const footerY = height - 120;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Kostenlos & direkt im Browser erleben', width / 2, footerY - 30);

    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(APP_URL.replace('http://', '').replace('https://', ''), width / 2, footerY + 10);
    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function downloadSocialCardImage() {
    const canvas = document.getElementById('social-card-canvas');
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'noodle-studio-story-' + cardFormat + '-' + Date.now() + '.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (typeof showToast === 'function') {
        showToast('📸 Social Card erfolgreich als PNG heruntergeladen!');
      }
    } catch(e) {
      console.error('Download error:', e);
    }
  }

  // ============================================================================
  // 6. VIRAL TEMPLATES & PRESS ASSETS
  // ============================================================================

  function renderTemplatesList() {
    const container = document.getElementById('social-templates-list');
    if (!container) return;

    container.innerHTML = VIRAL_POSTS.map(post => `
      <div class="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/10 transition-all flex flex-col gap-2.5 text-left group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase">${post.platformName}</span>
            <span class="text-[10px] text-gray-400 font-mono">${post.lang.toUpperCase()}</span>
          </div>
          <button onclick="SocialShareEngine.copyTemplateContent('${post.id}')" class="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Kopieren</span>
          </button>
        </div>
        <h4 class="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">${post.title}</h4>
        <pre class="text-[11px] text-gray-300 bg-black/60 p-2.5 rounded-xl border border-white/5 font-mono whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto custom-scrollbar">${post.content}</pre>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function copyTemplateContent(id) {
    const p = VIRAL_POSTS.find(item => item.id === id);
    if (p) {
      copyTextToClipboard(p.content, '✅ ' + p.platformName + ' Vorlage kopiert!');
    }
  }

  // ============================================================================
  // 7. PUBLIC API & INITIALIZATION
  // ============================================================================

  const SocialShareEngine = {
    openSocialLaunchModal,
    closeSocialLaunchModal,
    switchSocialTab,
    shareToPlatform,
    triggerNativeWebShare,
    copyAppShareLink,
    copyTextToClipboard,
    shareTaskAchievement,
    shareStreakAchievement,
    setCardFormat,
    setCardTheme,
    renderSocialCardPreview,
    downloadSocialCardImage,
    copyTemplateContent
  };

  if (typeof window !== 'undefined') {
    window.SocialShareEngine = SocialShareEngine;
    window.openSocialLaunchModal = openSocialLaunchModal;
    window.closeSocialLaunchModal = closeSocialLaunchModal;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.SocialShareEngine = SocialShareEngine;
  }

})();
