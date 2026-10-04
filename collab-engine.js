// collab-engine.js - Real-time Team Collaboration, Live DJ Music Hub, WebRTC Voice & Shared Dashboard Suite
// ========================================================================================================

const CollabEngine = (function() {
  let activeRoom = 'team-space';
  let realtimeChannel = null;
  let broadcastChannel = null;
  let localUser = null;
  let activeMembers = new Map();
  let chatHistory = [];
  let unreadCount = 0;
  let isChatOpen = false;
  let typingTimer = null;
  let audioContext = null;

  // Live DJ Streaming Session State
  let activeDjSession = null; // { dj: user, track: { id, name, bpm, url, file, startedAt }, isLive: true }

  // Voice Chat & WebRTC Mesh State
  let voiceRoomActive = false;
  let isMicMuted = true;
  let localAudioStream = null;
  let audioAnalyserNode = null;
  let vadInterval = null;
  let isSpeaking = false;
  const peerConnections = new Map(); // peerId -> RTCPeerConnection

  // Voice Note Recorder State
  let mediaRecorder = null;
  let voiceRecordingChunks = [];
  let voiceRecordingTimer = null;
  let voiceRecordingSeconds = 0;
  let isRecordingVoiceNote = false;

  // Farbschema für zufällige Avatar-Farben
  const AVATAR_COLORS = [
    { bg: 'from-purple-600 to-indigo-600', text: '#c084fc', border: 'border-purple-400/50' },
    { bg: 'from-emerald-600 to-teal-600', text: '#34d399', border: 'border-emerald-400/50' },
    { bg: 'from-cyan-600 to-blue-600', text: '#38bdf8', border: 'border-cyan-400/50' },
    { bg: 'from-amber-600 to-orange-600', text: '#fbbf24', border: 'border-amber-400/50' },
    { bg: 'from-rose-600 to-pink-600', text: '#fb7185', border: 'border-rose-400/50' },
    { bg: 'from-violet-600 to-fuchsia-600', text: '#e879f9', border: 'border-fuchsia-400/50' }
  ];

  function getLocalUser() {
    if (localUser) return localUser;

    // 1. Wenn über FlowAuth angemeldet
    if (typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn && FlowAuth.isLoggedIn()) {
      const u = FlowAuth.getUser();
      const email = (u && u.email) || 'user@example.com';
      const name = email.split('@')[0];
      const colorIdx = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % AVATAR_COLORS.length;
      localUser = {
        id: (u && u.id) || `user_${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        avatar: name.slice(0, 2).toUpperCase(),
        color: AVATAR_COLORS[colorIdx]
      };
      return localUser;
    }

    // 2. Aus LocalStorage oder Zufall
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('flow_collab_user');
        if (stored) {
          localUser = JSON.parse(stored);
          return localUser;
        }
      }
    } catch (e) {}

    const randomId = 'guest_' + Math.random().toString(36).substring(2, 8);
    const names = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Robin', 'Charlie'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const colorIdx = Math.floor(Math.random() * AVATAR_COLORS.length);

    localUser = {
      id: randomId,
      name: randomName,
      email: `${randomName.toLowerCase()}@noodle.local`,
      avatar: randomName.slice(0, 2).toUpperCase(),
      color: AVATAR_COLORS[colorIdx]
    };

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('flow_collab_user', JSON.stringify(localUser));
      }
    } catch (e) {}

    return localUser;
  }

  function playSound(type = 'message') {
    try {
      if (typeof window === 'undefined' || !(window.AudioContext || window.webkitAudioContext)) return;
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      const now = audioContext.currentTime;
      if (type === 'message') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'send') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'dj') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio optional
    }
  }

  function initRoomFromUrl() {
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room') || urlParams.get('team') || urlParams.get('board');
      if (roomParam) {
        activeRoom = roomParam.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      } else {
        try {
          if (typeof localStorage !== 'undefined') {
            const savedRoom = localStorage.getItem('flow_collab_active_room');
            if (savedRoom) activeRoom = savedRoom;
          }
        } catch (e) {}
      }
    }
  }

  function loadChatHistory() {
    try {
      if (typeof localStorage !== 'undefined') {
        const key = `flow_chat_${activeRoom}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          chatHistory = JSON.parse(raw);
          if (!Array.isArray(chatHistory)) chatHistory = [];
        } else {
          chatHistory = [
            {
              id: 'sys_welcome',
              isSystem: true,
              text: `🎉 Willkommen im Team-Room #${activeRoom}! Teile den Link mit deinen Teammitgliedern.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
      }
    } catch (e) {
      chatHistory = [];
    }
  }

  function saveChatHistory() {
    try {
      if (typeof localStorage !== 'undefined') {
        const key = `flow_chat_${activeRoom}`;
        localStorage.setItem(key, JSON.stringify(chatHistory.slice(-100)));
      }
    } catch (e) {}
  }

  // ==========================================================================
  // REALTIME VERBINDUNG (Supabase Channels & Local Broadcast Fallback)
  // ==========================================================================
  function connect() {
    initRoomFromUrl();
    loadChatHistory();
    const user = getLocalUser();

    // 1. BroadcastChannel (Lokale Multi-Tab Kommunikation)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        if (broadcastChannel) broadcastChannel.close();
        broadcastChannel = new BroadcastChannel(`noodle_collab_${activeRoom}`);
        broadcastChannel.onmessage = (event) => {
          handleIncomingEvent(event.data);
        };
      } catch (e) {
        console.warn('[CollabEngine] BroadcastChannel error:', e);
      }
    }

    // 2. Supabase Realtime Channel (Globales Live-WebSockets)
    if (typeof FlowAuth !== 'undefined' && FlowAuth.getSupabaseClient) {
      const supa = FlowAuth.getSupabaseClient();
      if (supa && typeof supa.channel === 'function') {
        try {
          if (realtimeChannel) {
            supa.removeChannel(realtimeChannel);
          }

          realtimeChannel = supa.channel(`room_${activeRoom}`, {
            config: {
              broadcast: { self: false },
              presence: { key: user.id }
            }
          });

          // A. Broadcast Nachricht empfangen
          realtimeChannel.on('broadcast', { event: 'collab_event' }, ({ payload }) => {
            handleIncomingEvent(payload);
          });

          // B. Presence Tracking (Aktive Teammitglieder)
          realtimeChannel.on('presence', { event: 'sync' }, () => {
            const stateObj = realtimeChannel.presenceState();
            activeMembers.clear();
            activeMembers.set(user.id, { ...user, isSelf: true, onlineAt: Date.now(), isSpeaking: isSpeaking });

            for (const key in stateObj) {
              const presences = stateObj[key];
              if (Array.isArray(presences) && presences.length > 0) {
                const p = presences[0];
                if (p && p.user && p.user.id !== user.id) {
                  activeMembers.set(p.user.id, { ...p.user, isSelf: false, onlineAt: Date.now() });
                }
              }
            }
            renderPresenceUI();
          });

          realtimeChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await realtimeChannel.track({
                user: user,
                online_at: new Date().toISOString()
              });
            }
          });
        } catch (err) {
          console.warn('[CollabEngine] Supabase Realtime setup warning:', err);
        }
      }
    }

    activeMembers.set(user.id, { ...user, isSelf: true, onlineAt: Date.now(), isSpeaking: isSpeaking });
    renderPresenceUI();
    renderChatMessages();
    renderDjActiveBanner();
  }

  // ==========================================================================
  // EVENT-HANDLING (Chat, DJ Music Share, Voice, Board Actions & Shared Board)
  // ==========================================================================
  function handleIncomingEvent(event) {
    if (!event || !event.type) return;

    const myUser = getLocalUser();
    if (event.sender && event.sender.id === myUser.id && event.type !== 'board_sync') return;

    switch (event.type) {
      case 'chat_message':
        chatHistory.push(event.message);
        saveChatHistory();
        renderChatMessages();
        if (!isChatOpen) {
          unreadCount++;
          updateUnreadBadge();
          playSound('message');
          if (typeof showToast === 'function') {
            showToast(`💬 ${event.sender.name}: ${(event.message.text || '').substring(0, 40)}`);
          }
        } else {
          playSound('message');
        }
        break;

      case 'dj_music_share':
        activeDjSession = {
          dj: event.sender,
          track: event.track,
          isLive: true,
          startedAt: event.track?.startedAt || Date.now()
        };
        playSound('dj');
        if (event.message) {
          chatHistory.push(event.message);
          saveChatHistory();
          renderChatMessages();
        }
        renderDjActiveBanner();
        if (typeof showToast === 'function') {
          showToast(`🎧 ${event.sender.name} hat Musik aufgelegt: "${event.track.name}"! Klicke zum Mithören 🎶`);
        }
        break;

      case 'dj_stop':
        activeDjSession = null;
        renderDjActiveBanner();
        break;

      case 'voice_message':
        if (event.message) {
          chatHistory.push(event.message);
          saveChatHistory();
          renderChatMessages();
          playSound('message');
          if (!isChatOpen) {
            unreadCount++;
            updateUnreadBadge();
            if (typeof showToast === 'function') {
              showToast(`🎙️ ${event.sender.name} hat eine Sprachnachricht gesendet`);
            }
          }
        }
        break;

      case 'user_speaking':
        if (event.sender && event.sender.id) {
          const member = activeMembers.get(event.sender.id);
          if (member) {
            member.isSpeaking = !!event.isSpeaking;
            renderPresenceUI();
          }
        }
        break;

      case 'board_sync':
        handleIncomingBoardSync(event);
        break;

      case 'board_action':
        if (event.actionText) {
          const sysMsg = {
            id: `sys_${Date.now()}`,
            isSystem: true,
            text: `📌 ${event.sender.name} ${event.actionText}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          chatHistory.push(sysMsg);
          saveChatHistory();
          renderChatMessages();

          if (typeof showToast === 'function') {
            showToast(`⚡ ${event.sender.name} ${event.actionText}`);
          }
        }
        if (typeof cloudSyncEngine !== 'undefined' && typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn && FlowAuth.isLoggedIn()) {
          cloudSyncEngine.pullState();
        }
        break;

      case 'reaction':
        if (event.messageId && event.emoji) {
          const target = chatHistory.find(m => m.id === event.messageId);
          if (target) {
            target.reactions = target.reactions || {};
            target.reactions[event.emoji] = (target.reactions[event.emoji] || 0) + 1;
            saveChatHistory();
            renderChatMessages();
          }
        }
        break;

      case 'typing':
        showTypingIndicator(event.sender.name);
        break;
    }
  }

  function broadcastEvent(payload) {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    if (realtimeChannel && typeof realtimeChannel.send === 'function') {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'collab_event',
          payload: payload
        });
      } catch (e) {}
    }
  }

  // ==========================================================================
  // 1. LIVE DJ & MUSIK IM CHAT AUFLEGEN
  // ==========================================================================
  function shareDjTrack(trackIdOrStem, customName = null) {
    const user = getLocalUser();
    let trackInfo = null;

    if (typeof BUILTIN_DJ_STEMS !== 'undefined' && Array.isArray(BUILTIN_DJ_STEMS)) {
      const found = BUILTIN_DJ_STEMS.find(s => s.id === trackIdOrStem || s.name === trackIdOrStem);
      if (found) {
        trackInfo = {
          id: found.id,
          name: found.name,
          bpm: found.bpm || 120,
          url: found.file || found.url,
          color: found.color || 'cyan',
          emoji: found.emoji || '🎵',
          startedAt: Date.now()
        };
      }
    }

    if (!trackInfo && typeof getDjCurrentPlayingTrack === 'function') {
      const cur = getDjCurrentPlayingTrack();
      if (cur) {
        trackInfo = {
          id: cur.id || 'track_now',
          name: cur.name || 'Fokus Stream',
          bpm: cur.bpm || 120,
          url: cur.url || cur.file,
          color: 'purple',
          emoji: '⚡',
          startedAt: Date.now()
        };
      }
    }

    if (!trackInfo) {
      trackInfo = {
        id: 'deep_house',
        name: 'Deep House Sunset (126 BPM)',
        bpm: 126,
        url: 'music/deep_house_sunset.mp3',
        color: 'cyan',
        emoji: '⚡',
        startedAt: Date.now()
      };
    }

    // Starte lokalen Player
    if (typeof playDjSharedTrack === 'function') {
      playDjSharedTrack(trackInfo);
    }

    activeDjSession = {
      dj: user,
      track: trackInfo,
      isLive: true,
      startedAt: trackInfo.startedAt
    };

    const newMsg = {
      id: `dj_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sender: user,
      isDjShare: true,
      track: trackInfo,
      text: `🎧 ${user.name} legt gerade auf: "${trackInfo.name}" (${trackInfo.bpm} BPM)! Klicke auf 'Live Mithören' 🎶`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    chatHistory.push(newMsg);
    saveChatHistory();
    renderChatMessages();
    renderDjActiveBanner();
    playSound('dj');

    broadcastEvent({
      type: 'dj_music_share',
      sender: user,
      track: trackInfo,
      message: newMsg
    });

    if (typeof showToast === 'function') {
      showToast(`🎧 DJ-Stream gestartet! Dein Team kann jetzt synchron mithören.`);
    }
  }

  function syncSharedDjTrack(trackData) {
    if (!trackData) return;
    if (typeof playDjSharedTrack === 'function') {
      playDjSharedTrack(trackData);
    }
    if (typeof showToast === 'function') {
      showToast(`🎶 Synchronisiert mit DJ-Stream: ${trackData.name || 'Live Track'}!`);
    }
  }

  function stopSharedDjSession() {
    activeDjSession = null;
    renderDjActiveBanner();
    const user = getLocalUser();
    broadcastEvent({
      type: 'dj_stop',
      sender: user
    });
    if (typeof showToast === 'function') {
      showToast(`⏹️ DJ-Stream beendet.`);
    }
  }

  function openDjWorkstationFromChat() {
    if (typeof togglePanel === 'function') {
      togglePanel('audio');
      if (typeof switchAudioTab === 'function') switchAudioTab('dj');
    }
  }

  function openDjSharePicker() {
    let html = `
      <div id="collab-dj-picker-modal" class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in" onclick="if(event.target===this) CollabEngine.closeDjSharePicker();">
        <div class="w-full max-w-sm bg-[#12121e] border border-cyan-500/40 rounded-3xl p-4 shadow-2xl space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎧</span>
              <div>
                <h3 class="text-xs font-bold text-white uppercase tracking-wider">Musik für das Team auflegen</h3>
                <p class="text-[10px] text-cyan-300">Wähle einen Beat zum Live-Streamen</p>
              </div>
            </div>
            <button onclick="CollabEngine.closeDjSharePicker()" class="p-1 text-gray-400 hover:text-white text-xs cursor-pointer">✕</button>
          </div>

          <div class="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
            <button onclick="CollabEngine.shareDjTrack('deep_house'); CollabEngine.closeDjSharePicker();" class="w-full p-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left flex items-center justify-between transition cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">⚡</span>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-cyan-200">Deep House Sunset</div>
                  <div class="text-[10px] text-cyan-300 font-mono">126 BPM • Driving Energy</div>
                </div>
              </div>
              <span class="px-2 py-1 bg-cyan-500/20 text-cyan-200 rounded-lg text-[10px] font-bold">Auflegen 🎧</span>
            </button>

            <button onclick="CollabEngine.shareDjTrack('lofi_chill'); CollabEngine.closeDjSharePicker();" class="w-full p-2.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left flex items-center justify-between transition cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">☕</span>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-purple-200">Deep Focus Lofi</div>
                  <div class="text-[10px] text-purple-300 font-mono">85 BPM • Chill Lounge</div>
                </div>
              </div>
              <span class="px-2 py-1 bg-purple-500/20 text-purple-200 rounded-lg text-[10px] font-bold">Auflegen 🎧</span>
            </button>

            <button onclick="CollabEngine.shareDjTrack('cyber_wave'); CollabEngine.closeDjSharePicker();" class="w-full p-2.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-left flex items-center justify-between transition cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">🌌</span>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-pink-200">Synthwave Neon Drive</div>
                  <div class="text-[10px] text-pink-300 font-mono">128 BPM • Retro Pulse</div>
                </div>
              </div>
              <span class="px-2 py-1 bg-pink-500/20 text-pink-200 rounded-lg text-[10px] font-bold">Auflegen 🎧</span>
            </button>

            <button onclick="CollabEngine.shareDjTrack('ambient_flow'); CollabEngine.closeDjSharePicker();" class="w-full p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left flex items-center justify-between transition cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">🍃</span>
                <div>
                  <div class="text-xs font-bold text-white group-hover:text-emerald-200">Zen Meditation Flow</div>
                  <div class="text-[10px] text-emerald-300 font-mono">118 BPM • Calm Wave</div>
                </div>
              </div>
              <span class="px-2 py-1 bg-emerald-500/20 text-emerald-200 rounded-lg text-[10px] font-bold">Auflegen 🎧</span>
            </button>
          </div>

          <div class="pt-1 border-t border-white/10 flex items-center justify-between">
            <button onclick="CollabEngine.openDjWorkstationFromChat(); CollabEngine.closeDjSharePicker();" class="text-[10px] text-violet-400 hover:text-violet-200 underline cursor-pointer">🎛️ Eigene MP3 im DJ-Pult laden</button>
            <button onclick="CollabEngine.closeDjSharePicker()" class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-gray-200 font-semibold cursor-pointer">Abbrechen</button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('collab-dj-picker-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeDjSharePicker() {
    const el = document.getElementById('collab-dj-picker-modal');
    if (el) el.remove();
  }

  function renderDjActiveBanner() {
    const banner = document.getElementById('collab-dj-active-banner');
    if (!banner) return;

    if (!activeDjSession || !activeDjSession.isLive) {
      banner.classList.add('hidden');
      return;
    }

    const dj = activeDjSession.dj || { name: 'DJ' };
    const track = activeDjSession.track || { name: 'Focus Beat', bpm: 120 };

    banner.innerHTML = `
      <div class="p-2 px-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-purple-950/80 to-cyan-950/80 border border-cyan-500/40 shadow-lg flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <div class="flex items-center gap-0.5">
            <span class="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse"></span>
            <span class="w-1 h-5 bg-purple-400 rounded-full animate-pulse delay-75"></span>
            <span class="w-1 h-3 bg-pink-400 rounded-full animate-pulse delay-150"></span>
          </div>
          <div class="min-w-0">
            <div class="text-[10px] font-mono text-cyan-300 uppercase font-black truncate flex items-center gap-1">
              <span>🎧 DJ ${escapeHtml(dj.name)}</span>
              <span class="text-zinc-500">•</span>
              <span class="text-purple-300 font-normal">${Number(track.bpm) || 120} BPM</span>
            </div>
            <div class="font-bold text-white truncate text-[11px]">${escapeHtml(track.name)}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="CollabEngine.syncSharedDjTrack(${JSON.stringify(track).replace(/"/g, '&quot;')})" class="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[10px] shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1">
            <span>▶️ Mithören</span>
          </button>
          <button onclick="CollabEngine.openDjWorkstationFromChat()" class="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer" title="DJ-Pult öffnen">
            <span>🎛️</span>
          </button>
        </div>
      </div>
    `;
    banner.classList.remove('hidden');
  }

  // ==========================================================================
  // 2. MIKROFON & LIVE VOICE CHAT / SPRACHNACHRICHTEN
  // ==========================================================================
  async function toggleMicrophone() {
    if (isMicMuted) {
      try {
        if (!localAudioStream) {
          localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setupAudioAnalyser(localAudioStream);
        } else {
          localAudioStream.getAudioTracks().forEach(t => { t.enabled = true; });
        }
        isMicMuted = false;
        voiceRoomActive = true;
        updateMicButtonUI();
        if (typeof showToast === 'function') {
          showToast('🎙️ Mikrofon aktiv! Du bist im Voice-Kanal hörbar.');
        }
      } catch (err) {
        console.warn('[VoiceChat] Microphone access warning:', err);
        if (typeof showToast === 'function') {
          showToast('⚠️ Mikrofon-Zugriff verweigert oder nicht verfügbar.');
        }
      }
    } else {
      if (localAudioStream) {
        localAudioStream.getAudioTracks().forEach(t => { t.enabled = false; });
      }
      isMicMuted = true;
      isSpeaking = false;
      updateMicButtonUI();
      broadcastSpeakingState(false);
      if (typeof showToast === 'function') {
        showToast('🔇 Mikrofon stummgeschaltet.');
      }
    }
  }

  function setupAudioAnalyser(stream) {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const source = audioContext.createMediaStreamSource(stream);
      audioAnalyserNode = audioContext.createAnalyser();
      audioAnalyserNode.fftSize = 256;
      source.connect(audioAnalyserNode);

      const bufferLength = audioAnalyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (vadInterval) clearInterval(vadInterval);
      vadInterval = setInterval(() => {
        if (isMicMuted || !audioAnalyserNode) return;
        audioAnalyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const nowSpeaking = avg > 25; // Schwellenwert für Sprache

        if (nowSpeaking !== isSpeaking) {
          isSpeaking = nowSpeaking;
          const user = getLocalUser();
          const me = activeMembers.get(user.id);
          if (me) {
            me.isSpeaking = isSpeaking;
            renderPresenceUI();
          }
          broadcastSpeakingState(isSpeaking);
        }
      }, 180);
    } catch (e) {
      console.warn('[VoiceChat] Audio analyser setup notice:', e);
    }
  }

  function broadcastSpeakingState(speaking) {
    const user = getLocalUser();
    broadcastEvent({
      type: 'user_speaking',
      sender: user,
      isSpeaking: speaking
    });
  }

  function updateMicButtonUI() {
    const micBtn = document.getElementById('collab-mic-toggle-btn');
    const micIcon = document.getElementById('collab-mic-icon');
    const micStatus = document.getElementById('collab-mic-status-label');

    if (!micBtn) return;

    if (!isMicMuted) {
      micBtn.className = 'px-2.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition active:scale-95 cursor-pointer';
      if (micIcon) micIcon.innerHTML = '🎙️';
      if (micStatus) micStatus.innerText = 'Mic An';
    } else {
      micBtn.className = 'px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-semibold text-xs flex items-center gap-1.5 border border-white/10 transition active:scale-95 cursor-pointer';
      if (micIcon) micIcon.innerHTML = '🔇';
      if (micStatus) micStatus.innerText = 'Mic Stumm';
    }
  }

  // Voice Note Recorder (Sprachnachricht im Chat aufnehmen)
  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceRecordingChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          voiceRecordingChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (voiceRecordingChunks.length > 0) {
          const blob = new Blob(voiceRecordingChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result;
            sendVoiceMessage(base64Audio, voiceRecordingSeconds);
          };
          reader.readAsDataURL(blob);
        }
      };

      mediaRecorder.start();
      isRecordingVoiceNote = true;
      voiceRecordingSeconds = 0;

      const recordBar = document.getElementById('collab-voice-record-bar');
      const standardBar = document.getElementById('collab-chat-input-bar');
      if (recordBar) recordBar.classList.remove('hidden');
      if (standardBar) standardBar.classList.add('hidden');

      if (voiceRecordingTimer) clearInterval(voiceRecordingTimer);
      voiceRecordingTimer = setInterval(() => {
        voiceRecordingSeconds++;
        const timerLabel = document.getElementById('collab-voice-record-timer');
        if (timerLabel) {
          const m = Math.floor(voiceRecordingSeconds / 60);
          const s = voiceRecordingSeconds % 60;
          timerLabel.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
      }, 1000);
    } catch (e) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Mikrofon-Zugriff fehlgeschlagen.');
      }
    }
  }

  function stopVoiceRecording(send = true) {
    if (voiceRecordingTimer) {
      clearInterval(voiceRecordingTimer);
      voiceRecordingTimer = null;
    }
    isRecordingVoiceNote = false;

    const recordBar = document.getElementById('collab-voice-record-bar');
    const standardBar = document.getElementById('collab-chat-input-bar');
    if (recordBar) recordBar.classList.add('hidden');
    if (standardBar) standardBar.classList.remove('hidden');

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      if (!send) {
        voiceRecordingChunks = [];
      }
      mediaRecorder.stop();
    }
  }

  function sendVoiceMessage(audioDataUrl, durationSecs) {
    const user = getLocalUser();
    const newMsg = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sender: user,
      isVoice: true,
      audioUrl: audioDataUrl,
      duration: durationSecs || 1,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    chatHistory.push(newMsg);
    saveChatHistory();
    renderChatMessages();
    playSound('send');

    broadcastEvent({
      type: 'voice_message',
      sender: user,
      message: newMsg
    });
  }

  // ==========================================================================
  // 3. GEMEINSAMES TEAM-DASHBOARD & 1-KLICK SHARING
  // ==========================================================================
  function shareCurrentBoardWithTeam() {
    const user = getLocalUser();
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : (typeof state !== 'undefined' ? (state.items || {}) : {});
    const curCats = (typeof categoriesOrder !== 'undefined') ? categoriesOrder : [];

    // Speichere in Shared Workspace
    if (typeof state !== 'undefined') {
      if (!state.workspaces) state.workspaces = {};
      state.workspaces.shared = {
        items: JSON.parse(JSON.stringify(curItems)),
        done: (state.done ? [...state.done] : []),
        history: []
      };
      if (typeof saveState === 'function') saveState();
    }

    const payload = {
      type: 'board_sync',
      sender: user,
      room: activeRoom,
      isFullSnapshot: true,
      boardData: {
        items: curItems,
        categoriesOrder: curCats,
        updatedAt: Date.now()
      }
    };

    broadcastEvent(payload);

    const sysMsg = {
      id: `sys_${Date.now()}`,
      isSystem: true,
      text: `🚀 ${user.name} hat das persönliche Dashboard mit dem Team (#${activeRoom}) geteilt!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatHistory.push(sysMsg);
    saveChatHistory();
    renderChatMessages();

    if (typeof showToast === 'function') {
      showToast(`📤 Dein Dashboard wurde live mit Raum #${activeRoom} geteilt!`);
    }
  }

  function handleIncomingBoardSync(event) {
    if (!event || !event.boardData) return;
    const { items, categoriesOrder: incomingCats } = event.boardData;

    if (typeof state !== 'undefined') {
      if (!state.workspaces) state.workspaces = {};
      state.workspaces.shared = {
        items: JSON.parse(JSON.stringify(items || {})),
        done: (state.workspaces.shared && state.workspaces.shared.done) || [],
        history: []
      };
      if (typeof saveState === 'function') saveState();

      // Wenn der Nutzer gerade im gemeinsamen Team-Board arbeitet: Live aktualisieren
      if (state.activeWorkspace === 'shared') {
        if (typeof renderApp === 'function') renderApp();
        if (typeof showToast === 'function') {
          showToast(`⚡ Team-Dashboard von ${event.sender?.name || 'Teammate'} aktualisiert!`);
        }
      }
    }
  }

  function importSharedBoardToPersonal() {
    if (typeof state === 'undefined' || !state.workspaces || !state.workspaces.shared) {
      if (typeof showToast === 'function') showToast('⚠️ Noch kein geteiltes Team-Dashboard vorhanden.');
      return;
    }

    const sharedItems = state.workspaces.shared.items || {};
    state.items = JSON.parse(JSON.stringify(sharedItems));
    if (!state.workspaces.private) state.workspaces.private = {};
    state.workspaces.private.items = JSON.parse(JSON.stringify(sharedItems));

    if (typeof saveState === 'function') saveState();
    if (typeof setWorkspace === 'function') setWorkspace('private');
    if (typeof renderApp === 'function') renderApp();

    if (typeof showToast === 'function') {
      showToast('📥 Team-Dashboard erfolgreich in deinen privaten Bereich kopiert!');
    }
  }

  function switchToSharedBoard() {
    if (typeof setWorkspace === 'function') {
      setWorkspace('shared');
    }
  }

  // ==========================================================================
  // STANDARD CHAT, REAKTIONEN & TYPING
  // ==========================================================================
  function sendMessage(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const user = getLocalUser();

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sender: user,
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    chatHistory.push(newMsg);
    saveChatHistory();
    renderChatMessages();
    playSound('send');

    broadcastEvent({
      type: 'chat_message',
      sender: user,
      message: newMsg
    });
  }

  function broadcastBoardEvent(actionText) {
    const user = getLocalUser();
    const sysMsg = {
      id: `sys_${Date.now()}`,
      isSystem: true,
      text: `📌 Du ${actionText}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatHistory.push(sysMsg);
    saveChatHistory();
    renderChatMessages();

    broadcastEvent({
      type: 'board_action',
      sender: user,
      actionText: actionText
    });
  }

  function addReaction(messageId, emoji) {
    const msg = chatHistory.find(m => m.id === messageId);
    if (!msg) return;

    msg.reactions = msg.reactions || {};
    msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
    saveChatHistory();
    renderChatMessages();

    const user = getLocalUser();
    broadcastEvent({
      type: 'reaction',
      sender: user,
      messageId: messageId,
      emoji: emoji
    });
  }

  function sendTyping() {
    const user = getLocalUser();
    broadcastEvent({
      type: 'typing',
      sender: user
    });
  }

  function setRoom(newRoom) {
    if (!newRoom || !newRoom.trim()) return;
    const clean = newRoom.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (clean === activeRoom) return;

    activeRoom = clean;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('flow_collab_active_room', clean);
      }
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location);
        url.searchParams.set('room', clean);
        window.history.replaceState({}, '', url);
      }
    } catch (e) {}

    connect();
    if (typeof showToast === 'function') {
      showToast(`🚀 Raum gewechselt: #${clean}`);
    }
  }

  function getShareLink() {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', activeRoom);
    return url.toString();
  }

  function copyShareLink() {
    const link = getShareLink();
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        if (typeof showToast === 'function') {
          showToast('✓ Team-Link in Zwischenablage kopiert! 📋');
        }
      });
    } else {
      prompt('Kopiere diesen Team-Link:', link);
    }
  }

  function clearChat() {
    if (confirm('Möchtest du den Chat-Verlauf für diesen Raum wirklich leeren?')) {
      chatHistory = [
        {
          id: `sys_${Date.now()}`,
          isSystem: true,
          text: `🧹 Chat-Verlauf wurde geleert.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      saveChatHistory();
      renderChatMessages();
    }
  }

  function sendQuickChip(text) {
    if (text) sendMessage(text);
  }

  // ==========================================================================
  // UI RENDERING & INTERACTION
  // ==========================================================================
  function renderPresenceUI() {
    const container = document.getElementById('header-collab-avatars');
    const memberCountLabel = document.getElementById('collab-member-count');
    const roomTitleDisplay = document.getElementById('collab-current-room-name');

    if (roomTitleDisplay) {
      roomTitleDisplay.innerText = `#${activeRoom}`;
    }

    if (memberCountLabel) {
      const count = activeMembers.size || 1;
      memberCountLabel.innerText = `${count} online`;
    }

    if (!container) return;

    const members = Array.from(activeMembers.values()).slice(0, 5);
    let html = '';

    members.forEach((m, idx) => {
      const col = m.color || AVATAR_COLORS[0];
      const zIndex = 10 - idx;
      const isCurrentlyTalking = !!m.isSpeaking;
      const speakingAura = isCurrentlyTalking ? 'ring-2 ring-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse scale-110' : '';

      html += `
        <div class="relative -ml-1.5 first:ml-0 rounded-full border-2 border-[#12121a] shadow-sm cursor-pointer group transition-transform" style="z-index: ${zIndex};" title="${m.name} (${m.isSelf ? 'Du' : 'Online'}${isCurrentlyTalking ? ' • 🎙️ Spricht gerade' : ''})">
          <div class="w-6.5 h-6.5 rounded-full bg-gradient-to-tr ${col.bg} flex items-center justify-center text-[9px] font-black text-white uppercase select-none ${speakingAura}">
            ${m.avatar || m.name.slice(0, 2)}
          </div>
          <span class="absolute bottom-0 right-0 w-2 h-2 rounded-full ${isCurrentlyTalking ? 'bg-emerald-300 animate-ping' : 'bg-emerald-400'} border border-black"></span>
        </div>
      `;
    });

    if (activeMembers.size > 5) {
      html += `
        <div class="relative -ml-1.5 rounded-full border-2 border-[#12121a] bg-zinc-800 w-6.5 h-6.5 flex items-center justify-center text-[9px] font-bold text-gray-300 shadow-sm" style="z-index: 5;">
          +${activeMembers.size - 5}
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function renderChatMessages() {
    const container = document.getElementById('collab-chat-messages-container');
    if (!container) return;

    const myUser = getLocalUser();

    if (chatHistory.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8 space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 text-xl">
            💬
          </div>
          <p class="text-xs font-bold text-white">Noch keine Nachrichten</p>
          <p class="text-[10px] text-gray-400 max-w-[200px]">Schreibe eine Nachricht, nimm eine Sprachnotiz auf oder lege Musik auf!</p>
        </div>
      `;
      return;
    }

    let html = '';
    chatHistory.forEach((msg) => {
      if (msg.isSystem) {
        html += `
          <div class="flex justify-center my-1.5">
            <div class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-purple-200 font-mono flex items-center gap-1.5 max-w-[90%] text-center">
              <span>${escapeHtml(msg.text)}</span>
              <span class="text-[8px] text-gray-400 font-mono">${escapeHtml(msg.time || '')}</span>
            </div>
          </div>
        `;
      } else if (msg.isDjShare && msg.track) {
        // RICH DJ MUSIC SHARE CARD
        const isSelf = (msg.sender && msg.sender.id === myUser.id);
        const djName = isSelf ? 'Du' : escapeHtml(msg.sender?.name || 'DJ');
        const trackName = escapeHtml(msg.track.name || 'Fokus Beat');
        const bpm = Number(msg.track.bpm) || 120;
        const trackJSON = JSON.stringify(msg.track).replace(/"/g, '&quot;');

        html += `
          <div class="my-2.5 p-3 rounded-2xl bg-gradient-to-br from-[#0e1626] via-[#16122b] to-[#0e1626] border border-cyan-500/40 shadow-[0_8px_25px_rgba(6,182,212,0.15)] space-y-2">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-lg animate-spin-slow">🎧</span>
                <div>
                  <span class="text-[10px] font-mono text-cyan-300 uppercase font-black tracking-wider">DJ STREAM • LIVE</span>
                  <div class="text-xs font-bold text-white">${djName} hat Musik aufgelegt</div>
                </div>
              </div>
              <span class="text-[9px] font-mono bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-500/30 text-cyan-200 font-bold">${bpm} BPM</span>
            </div>

            <div class="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                  🎵
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate">${trackName}</div>
                  <div class="text-[9px] text-gray-400 font-mono">Synchronisierter Stream</div>
                </div>
              </div>
              <button onclick="CollabEngine.syncSharedDjTrack(${trackJSON})" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0">
                <span>▶️ Live Sync</span>
              </button>
            </div>
          </div>
        `;
      } else if (msg.isVoice && msg.audioUrl) {
        // RICH VOICE NOTE CARD
        const isSelf = (msg.sender && msg.sender.id === myUser.id);
        const col = (msg.sender && msg.sender.color) || AVATAR_COLORS[0];
        const senderName = isSelf ? 'Du' : escapeHtml((msg.sender && msg.sender.name) || 'Teammate');
        const safeAvatar = escapeHtml((msg.sender && msg.sender.avatar) || 'U');
        const safeTime = escapeHtml(msg.time || '');
        const duration = msg.duration || 1;
        const msgId = escapeHtml(msg.id);

        html += `
          <div class="flex gap-2 my-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'} group">
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr ${col.bg} flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm self-end mb-1">
              ${safeAvatar}
            </div>

            <div class="flex flex-col max-w-[82%] ${isSelf ? 'items-end' : 'items-start'}">
              <div class="flex items-center gap-1.5 px-1 mb-0.5 text-[9px] text-gray-400 font-mono">
                <span class="font-bold ${isSelf ? 'text-purple-300' : 'text-gray-300'}">${senderName}</span>
                <span>${safeTime}</span>
              </div>

              <div class="p-2.5 rounded-2xl text-xs bg-[#181826] border border-white/10 shadow-sm flex items-center gap-2.5 min-w-[200px]">
                <button onclick="CollabEngine.playVoiceMessage('${msgId}', '${msg.audioUrl}')" id="voice-btn-${msgId}" class="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center text-xs transition cursor-pointer shadow-md shrink-0">
                  ▶
                </button>
                <div class="flex-1 min-w-0 space-y-1">
                  <div class="flex items-center justify-between text-[10px] font-mono text-purple-300">
                    <span class="flex items-center gap-1 font-bold">🎙️ Sprachnachricht</span>
                    <span id="voice-time-${msgId}">${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}</span>
                  </div>
                  <div class="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div id="voice-progress-${msgId}" class="h-full bg-purple-500 transition-all" style="width: 0%;"></div>
                  </div>
                </div>
                <button onclick="CollabEngine.toggleVoicePlaybackSpeed('${msgId}')" id="voice-speed-${msgId}" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-mono font-bold text-gray-300 cursor-pointer">1x</button>
                <audio id="voice-audio-${msgId}" src="${msg.audioUrl}" class="hidden" ontimeupdate="CollabEngine.updateVoiceAudioProgress('${msgId}')" onended="CollabEngine.resetVoiceAudioUI('${msgId}')"></audio>
              </div>
            </div>
          </div>
        `;
      } else {
        const isSelf = (msg.sender && msg.sender.id === myUser.id);
        const col = (msg.sender && msg.sender.color) || AVATAR_COLORS[0];
        const safeMsgId = escapeHtml(msg.id || '');
        const senderName = isSelf ? 'Du' : escapeHtml((msg.sender && msg.sender.name) || 'Teammate');
        const safeAvatar = escapeHtml((msg.sender && msg.sender.avatar) || 'U');
        const safeTime = escapeHtml(msg.time || '');

        let reactionsHtml = '';
        if (msg.reactions && Object.keys(msg.reactions).length > 0) {
          reactionsHtml = '<div class="flex flex-wrap gap-1 mt-1">';
          for (const [em, count] of Object.entries(msg.reactions)) {
            const safeEm = escapeHtml(em);
            reactionsHtml += `
              <button onclick="CollabEngine.addReaction('${safeMsgId}', '${safeEm}')" class="px-1.5 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] flex items-center gap-1 hover:border-purple-400 transition cursor-pointer">
                <span>${safeEm}</span>
                <span class="text-[9px] font-bold text-gray-300">${Number(count) || 0}</span>
              </button>
            `;
          }
          reactionsHtml += '</div>';
        }

        html += `
          <div class="flex gap-2 my-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'} group">
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr ${col.bg} flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm self-end mb-1">
              ${safeAvatar}
            </div>

            <div class="flex flex-col max-w-[78%] ${isSelf ? 'items-end' : 'items-start'}">
              <div class="flex items-center gap-1.5 px-1 mb-0.5 text-[9px] text-gray-400 font-mono">
                <span class="font-bold ${isSelf ? 'text-purple-300' : 'text-gray-300'}">${senderName}</span>
                <span>${safeTime}</span>
              </div>

              <div class="relative p-2.5 rounded-2xl text-xs leading-relaxed ${isSelf ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-xs shadow-md' : 'bg-[#181824] border border-white/10 text-gray-100 rounded-bl-xs shadow-sm'}">
                <p class="break-words select-text">${escapeHtml(msg.text)}</p>

                <!-- Quick Reaction Hover Toolbar -->
                <div class="hidden group-hover:flex items-center gap-1 absolute ${isSelf ? 'left-0 -top-6' : 'right-0 -top-6'} bg-[#101018] border border-white/15 px-1.5 py-0.5 rounded-full shadow-lg z-10 animate-fade-in">
                  <button onclick="CollabEngine.addReaction('${safeMsgId}', '👍')" class="hover:scale-125 transition-transform text-xs cursor-pointer">👍</button>
                  <button onclick="CollabEngine.addReaction('${safeMsgId}', '❤️')" class="hover:scale-125 transition-transform text-xs cursor-pointer">❤️</button>
                  <button onclick="CollabEngine.addReaction('${safeMsgId}', '🔥')" class="hover:scale-125 transition-transform text-xs cursor-pointer">🔥</button>
                  <button onclick="CollabEngine.addReaction('${safeMsgId}', '🎧')" class="hover:scale-125 transition-transform text-xs cursor-pointer">🎧</button>
                  <button onclick="CollabEngine.addReaction('${safeMsgId}', '🚀')" class="hover:scale-125 transition-transform text-xs cursor-pointer">🚀</button>
                </div>
              </div>

              ${reactionsHtml}
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  function playVoiceMessage(msgId) {
    const audio = document.getElementById(`voice-audio-${msgId}`);
    const btn = document.getElementById(`voice-btn-${msgId}`);
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      if (btn) btn.innerText = '⏸';
    } else {
      audio.pause();
      if (btn) btn.innerText = '▶';
    }
  }

  function updateVoiceAudioProgress(msgId) {
    const audio = document.getElementById(`voice-audio-${msgId}`);
    const bar = document.getElementById(`voice-progress-${msgId}`);
    const time = document.getElementById(`voice-time-${msgId}`);
    if (!audio || !bar) return;

    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    bar.style.width = `${pct}%`;
    if (time && !isNaN(audio.currentTime)) {
      const cur = Math.floor(audio.currentTime);
      time.innerText = `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`;
    }
  }

  function resetVoiceAudioUI(msgId) {
    const btn = document.getElementById(`voice-btn-${msgId}`);
    const bar = document.getElementById(`voice-progress-${msgId}`);
    if (btn) btn.innerText = '▶';
    if (bar) bar.style.width = '0%';
  }

  function toggleVoicePlaybackSpeed(msgId) {
    const audio = document.getElementById(`voice-audio-${msgId}`);
    const btn = document.getElementById(`voice-speed-${msgId}`);
    if (!audio || !btn) return;

    if (audio.playbackRate === 1.0) {
      audio.playbackRate = 1.5;
      btn.innerText = '1.5x';
    } else if (audio.playbackRate === 1.5) {
      audio.playbackRate = 2.0;
      btn.innerText = '2x';
    } else {
      audio.playbackRate = 1.0;
      btn.innerText = '1x';
    }
  }

  function escapeHtml(str) {
    if (typeof window !== 'undefined' && typeof window.escapeHtml === 'function') {
      return window.escapeHtml(str);
    }
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;');
  }

  function showTypingIndicator(name) {
    const indicator = document.getElementById('collab-typing-indicator');
    if (!indicator) return;

    indicator.innerText = `✍️ ${name} schreibt...`;
    indicator.classList.remove('hidden');

    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      indicator.classList.add('hidden');
    }, 2500);
  }

  function updateUnreadBadge() {
    const badge = document.getElementById('collab-unread-badge');
    const headerBadge = document.getElementById('header-collab-unread-badge');

    if (unreadCount > 0) {
      if (badge) {
        badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
      }
      if (headerBadge) {
        headerBadge.innerText = unreadCount > 9 ? '9+' : unreadCount;
        headerBadge.classList.remove('hidden');
      }
    } else {
      if (badge) badge.classList.add('hidden');
      if (headerBadge) headerBadge.classList.add('hidden');
    }
  }

  let currentTab = 'team';

  function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    const btnTeam = document.getElementById('collab-tab-btn-team');
    const btnMessengers = document.getElementById('collab-tab-btn-messengers');
    const btnDirect = document.getElementById('collab-tab-btn-direct');

    const activeClass = 'flex-1 py-1.5 px-1.5 rounded-xl text-violet-100 bg-gradient-to-r from-violet-600/40 via-purple-600/35 to-violet-600/40 border border-violet-400/80 shadow-[0_0_15px_rgba(139,92,246,0.35)] text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition';
    const inactiveClass = 'flex-1 py-1.5 px-1.5 rounded-xl text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 border border-transparent transition text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer';

    if (btnTeam) btnTeam.className = tab === 'team' ? activeClass : inactiveClass;
    if (btnMessengers) btnMessengers.className = tab === 'messengers' ? activeClass : inactiveClass;
    if (btnDirect) btnDirect.className = tab === 'direct' ? activeClass : inactiveClass;

    // Toggle panes
    const paneTeam = document.getElementById('collab-pane-team');
    const paneMessengers = document.getElementById('collab-pane-messengers');
    const paneDirect = document.getElementById('collab-pane-direct');

    if (paneTeam) paneTeam.classList.toggle('hidden', tab !== 'team');
    if (paneMessengers) paneMessengers.classList.toggle('hidden', tab !== 'messengers');
    if (paneDirect) paneDirect.classList.toggle('hidden', tab !== 'direct');

    if (tab === 'team') {
      renderChatMessages();
      renderDjActiveBanner();
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  function getShareMessageContent() {
    const input = document.getElementById('collab-messenger-input');
    let text = (input && input.value.trim()) || '';
    if (!text) {
      text = `🚀 Schau dir mein Noodle Studio Board an: ${getShareLink()}`;
    }
    return text;
  }

  function shareToMessenger(platformKey, customText = null) {
    const text = customText || getShareMessageContent();
    const appUrl = getShareLink();
    let url = '';

    switch (platformKey) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        break;
      case 'signal':
        url = `sgnl://share?text=${encodeURIComponent(text)}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          if (typeof showToast === 'function') showToast('📋 Nachricht kopiert! Signal wird geöffnet...');
        }
        break;
      case 'viber':
      case 'vibe':
        url = `viber://forward?text=${encodeURIComponent(text)}`;
        break;
      case 'messenger':
        url = `https://www.messenger.com/`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          if (typeof showToast === 'function') showToast('📋 Text kopiert! Öffne Messenger...');
        }
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'discord':
        url = `https://discord.com/app`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          if (typeof showToast === 'function') showToast('📋 Nachricht für Discord kopiert!');
        }
        break;
      case 'slack':
        url = `https://slack.com/`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          if (typeof showToast === 'function') showToast('📋 Nachricht für Slack kopiert!');
        }
        break;
      case 'teams':
        url = `https://teams.microsoft.com/share?href=${encodeURIComponent(appUrl)}&msgText=${encodeURIComponent(text)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Noodle Studio Workspace')}&body=${encodeURIComponent(text)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(text)}`;
        break;
      default:
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  function openDirectChat(platformKey, targetContact, message) {
    if (!targetContact || !targetContact.trim()) {
      if (typeof showToast === 'function') showToast('⚠️ Bitte Nummer oder Username eingeben');
      return;
    }

    const cleanNum = targetContact.trim().replace(/[^0-9+]/g, '');
    const cleanUser = targetContact.trim().replace(/^@/, '');
    const text = message && message.trim() ? message.trim() : 'Hallo! Ich teile meinen Fokus mit dir auf Noodle.';
    let url = '';

    switch (platformKey) {
      case 'whatsapp':
        url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
        break;
      case 'signal':
        url = `https://signal.me/#p/${cleanNum}`;
        break;
      case 'viber':
      case 'vibe':
        url = `viber://chat?number=${cleanNum}`;
        break;
      case 'messenger':
        url = `https://m.me/${cleanUser}`;
        break;
      case 'telegram':
        url = `https://t.me/${cleanUser}`;
        break;
      default:
        url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      if (typeof showToast === 'function') showToast(`🚀 Chat auf ${platformKey.toUpperCase()} wird geöffnet!`);
    }
  }

  function insertQuickContext(type) {
    const input = document.getElementById('collab-messenger-input');
    if (!input) return;

    let text = '';
    if (type === 'tasks') {
      let taskList = [];
      if (typeof columns !== 'undefined' && Array.isArray(columns)) {
        columns.forEach(col => {
          if (col.tasks && Array.isArray(col.tasks)) {
            col.tasks.slice(0, 3).forEach(t => taskList.push(`• [${col.title}] ${t.title || t.task || t}`));
          }
        });
      }
      text = `📋 Meine aktuellen Aufgaben auf Noodle:\n${taskList.slice(0, 5).join('\n')}\n🔗 ${getShareLink()}`;
    } else if (type === 'focus') {
      const activeTask = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || 'Fokus-Session');
      text = `⏱️ Ich starte jetzt einen Fokus-Sprint an: "${activeTask}" auf Noodle! 🚀`;
    } else if (type === 'invite') {
      text = `👋 Lass uns gemeinsam fokussieren! Tritt meinem Team-Space auf Noodle bei:\n🔗 ${getShareLink()}`;
    }

    input.value = text;
    if (typeof showToast === 'function') showToast('✨ Vorlage eingefügt!');
    input.focus();
  }

  function copyShareText() {
    const text = getShareMessageContent();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast('📋 Nachricht in die Zwischenablage kopiert!');
      });
    }
  }

  function toggleChat() {
    const panel = document.getElementById('panel-collab-chat');
    if (!panel) return;

    isChatOpen = !panel.classList.contains('hidden');
    if (isChatOpen) {
      panel.classList.add('hidden');
      isChatOpen = false;
    } else {
      panel.classList.remove('hidden');
      isChatOpen = true;
      unreadCount = 0;
      updateUnreadBadge();
      if (currentTab === 'team') {
        renderChatMessages();
        renderDjActiveBanner();
      }

      const input = document.getElementById('collab-chat-input');
      if (input && currentTab === 'team') {
        setTimeout(() => input.focus(), 100);
      }
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function openRoomModal() {
    const newRoom = prompt('Gib den Namen oder die ID des Team-Rooms ein:', activeRoom);
    if (newRoom && newRoom.trim()) {
      setRoom(newRoom);
    }
  }

  function init() {
    connect();
  }

  return {
    init,
    connect,
    getLocalUser,
    sendMessage,
    broadcastBoardEvent,
    addReaction,
    sendTyping,
    setRoom,
    getRoom: () => activeRoom,
    getShareLink,
    copyShareLink,
    toggleChat,
    openRoomModal,
    clearChat,
    sendQuickChip,
    loadChatHistory,
    renderChatMessages,
    renderPresenceUI,
    switchTab,
    shareToMessenger,
    openDirectChat,
    insertQuickContext,
    copyShareText,
    // DJ Music Hub
    shareDjTrack,
    syncSharedDjTrack,
    stopSharedDjSession,
    openDjWorkstationFromChat,
    openDjSharePicker,
    closeDjSharePicker,
    renderDjActiveBanner,
    // Voice & Mic
    toggleMicrophone,
    startVoiceRecording,
    stopVoiceRecording,
    playVoiceMessage,
    updateVoiceAudioProgress,
    resetVoiceAudioUI,
    toggleVoicePlaybackSpeed,
    // Shared Dashboard Suite
    shareCurrentBoardWithTeam,
    importSharedBoardToPersonal,
    switchToSharedBoard
  };
})();

if (typeof window !== 'undefined') {
  window.CollabEngine = CollabEngine;
  window.toggleCollabChat = () => CollabEngine.toggleChat();
  window.addEventListener('DOMContentLoaded', () => {
    CollabEngine.init();
  });
}
if (typeof globalThis !== 'undefined') {
  globalThis.CollabEngine = CollabEngine;
}
