// ============================================================================

var djDecks = {
  a: {
    audio: null,
    track: null,
    isPlaying: false,
    pitch: 1.0,
    bpm: 126,
    volume: 1.0,
    low: 1.0,
    mid: 1.0,
    high: 1.0,
    filter: 0.5,
    cueTime: 0,
    hotCues: [null, null, null, null],
    loopActive: false,
    loopLength: 4,
    loopStart: 0,
    loopEnd: 0,
    jogRotation: 0,
    keylock: true
  },
  b: {
    audio: null,
    track: null,
    isPlaying: false,
    pitch: 1.0,
    bpm: 85,
    volume: 1.0,
    low: 1.0,
    mid: 1.0,
    high: 1.0,
    filter: 0.5,
    cueTime: 0,
    hotCues: [null, null, null, null],
    loopActive: false,
    loopLength: 4,
    loopStart: 0,
    loopEnd: 0,
    jogRotation: 0,
    keylock: true
  }
};

// Echte Audio-Tracks für DJ Workstation & Preloaded MP3s
var BUILTIN_DJ_STEMS = [
  { id: 'cinematic', name: 'Cinematic Orchestra – Evolution', bpm: 95, file: 'music/Cinematic%20Orchestra%20-%20%20Evolution.mp3', color: 'cyan', emoji: '🎻' },
  { id: 'death_in_vegas', name: 'Death In Vegas – All That Glitters', bpm: 110, file: 'music/Death%20In%20Vegas%20-%20All%20That%20Glitters.mp3', color: 'purple', emoji: '🎸' },
  { id: 'dj_cam', name: 'DJ Cam – Lost Kingdom', bpm: 88, file: 'music/DJ%20Cam%20-%20Lost%20Kingdom.mp3', color: 'cyan', emoji: '🎧' },
  { id: 'indian_rope', name: 'Indian Rope Man – 66 Meters', bpm: 118, file: 'music/Indian%20Rope%20Man%2066%20Meters.mp3', color: 'purple', emoji: '🥁' },
  { id: 'levitation', name: 'Levitation – More Than Ever People', bpm: 100, file: 'music/Levitation%20-%20More%20Than%20Ever%20People.mp3', color: 'cyan', emoji: '🌊' },
  { id: 'portishead', name: 'Portishead – Numb', bpm: 78, file: 'music/Portishead%20-%20Numb.mp3', color: 'purple', emoji: '⚡' },
  { id: 'channel_1', name: 'Cinematic Orch – Channel 1 Suite', bpm: 92, file: 'music/The%20Cinematic%20Orchestra%20-%20Channel%201%20Suite%20(Zero%207%20-%20Late%20Night%20Tales).mp3', color: 'cyan', emoji: '🎹' },
  { id: 'tricky', name: 'Tricky – Hell Is Around The Corner', bpm: 82, file: 'music/Tricky%20Hell%20Is%20Around%20The%20Corner.mp3', color: 'purple', emoji: '🎤' }
];

function updateDjPresetDropdowns() {
  ['a', 'b'].forEach(deckId => {
    const sel = document.getElementById(`dj-preset-select-${deckId}`);
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = BUILTIN_DJ_STEMS.map(stem => {
      return `<option value="${stem.id}">${stem.name}</option>`;
    }).join('');
    if (currentVal && BUILTIN_DJ_STEMS.some(s => s.id === currentVal)) {
      sel.value = currentVal;
    }
  });
}
window.updateDjPresetDropdowns = updateDjPresetDropdowns;

// ============================================================================
// 1. FORMATIERUNG & UTILS
// ============================================================================
function formatAudioTime(secs) {
  if (isNaN(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
window.formatAudioTime = formatAudioTime;

function getDjCurrentPlayingTrack() {
  if (djDecks.a && djDecks.a.isPlaying && djDecks.a.track) {
    return { ...djDecks.a.track, deck: 'a', bpm: djDecks.a.bpm, currentTime: (djDecks.a.audio ? djDecks.a.audio.currentTime : 0) };
  }
  if (djDecks.b && djDecks.b.isPlaying && djDecks.b.track) {
    return { ...djDecks.b.track, deck: 'b', bpm: djDecks.b.bpm, currentTime: (djDecks.b.audio ? djDecks.b.audio.currentTime : 0) };
  }
  if (typeof currentPlaylistIndex !== 'undefined' && playlistTracks && playlistTracks[currentPlaylistIndex]) {
    const t = playlistTracks[currentPlaylistIndex];
    return { id: t.id, name: t.name || t.fullName, url: t.url, bpm: t.bpm || 120, isPlaying: (typeof isMusicPlaying !== 'undefined' ? isMusicPlaying : false) };
  }
  if (BUILTIN_DJ_STEMS && BUILTIN_DJ_STEMS.length > 0) {
    const s = BUILTIN_DJ_STEMS[0];
    return { id: s.id, name: s.name, bpm: s.bpm, file: s.file, url: s.file };
  }
  return null;
}
window.getDjCurrentPlayingTrack = getDjCurrentPlayingTrack;

function playDjSharedTrack(trackData) {
  if (!trackData) return;
  const stem = BUILTIN_DJ_STEMS.find(s => s.id === trackData.id || s.name === trackData.name || (trackData.file && s.file === trackData.file));
  if (stem) {
    loadDjBuiltinTrack('a', stem.id, true);
    if (trackData.startedAt && djDecks.a.audio) {
      const elapsed = (Date.now() - trackData.startedAt) / 1000;
      if (elapsed > 0 && elapsed < (djDecks.a.audio.duration || 300)) {
        try { djDecks.a.audio.currentTime = elapsed % (djDecks.a.audio.duration || 180); } catch(e) {}
      }
    }
    return;
  }

  if (trackData.url || trackData.file) {
    const targetUrl = trackData.url || trackData.file;
    const deck = djDecks.a;
    if (!deck.audio) deck.audio = new Audio();
    deck.audio.src = targetUrl;
    deck.track = { id: trackData.id || 'shared_track', name: trackData.name || 'DJ Stream', bpm: trackData.bpm || 120, url: targetUrl };
    deck.bpm = trackData.bpm || 120;
    
    deck.audio.play().then(() => {
      deck.isPlaying = true;
      if (trackData.startedAt && deck.audio.duration) {
        const elapsed = (Date.now() - trackData.startedAt) / 1000;
        if (elapsed > 0 && elapsed < deck.audio.duration) {
          try { deck.audio.currentTime = elapsed; } catch(e) {}
        }
      }
      updateDjDeckPlayButtonUI('a');
      startDjJogAnimation('a');
    }).catch(e => console.warn('[AudioPlayer] Shared playback note:', e));
  }
}
window.playDjSharedTrack = playDjSharedTrack;

// ============================================================================
// 2. TAB 3: EIGENE TRACKS / PLAYLIST PLAYER & INDEXEDDB AUDIO VAULT
// ============================================================================

const IDB_AUDIO_DB_NAME = 'noodle_audio_vault';
const IDB_AUDIO_STORE_NAME = 'user_tracks';

function getAudioVaultDB() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const req = indexedDB.open(IDB_AUDIO_DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_AUDIO_STORE_NAME)) {
          db.createObjectStore(IDB_AUDIO_STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch(e) {
      resolve(null);
    }
  });
}

async function saveTrackToAudioVault(track, file) {
  const db = await getAudioVaultDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_AUDIO_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IDB_AUDIO_STORE_NAME);
    store.put({
      id: track.id || ('usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
      name: track.name,
      fullName: track.fullName || track.name,
      duration: track.duration || 0,
      blob: file,
      addedAt: Date.now()
    });
  } catch(e) {
    console.warn('[AudioVault] Error saving track:', e);
  }
}

async function removeTrackFromAudioVault(trackId) {
  if (!trackId) return;
  const db = await getAudioVaultDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_AUDIO_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IDB_AUDIO_STORE_NAME);
    store.delete(trackId);
  } catch(e) {
    console.warn('[AudioVault] Error deleting track:', e);
  }
}

async function loadSavedUserAudioTracks() {
  const db = await getAudioVaultDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_AUDIO_STORE_NAME, 'readonly');
    const store = tx.objectStore(IDB_AUDIO_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result || [];
      if (records.length === 0) return;
      
      const loadedTracks = records.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        duration: r.duration || null,
        url: URL.createObjectURL(r.blob),
        isUserUploaded: true
      }));

      const existingIds = new Set(playlistTracks.map(t => t.id || t.name));
      const freshTracks = loadedTracks.filter(t => !existingIds.has(t.id) && !existingIds.has(t.name));
      
      if (freshTracks.length > 0) {
        playlistTracks = playlistTracks.concat(freshTracks);
        freshTracks.forEach(preloadMusicTrackDuration);
        renderMusicPlaylist();
      }
    };
  } catch(e) {
    console.warn('[AudioVault] Error loading saved tracks:', e);
  }
}

async function scanMusicFolderTracks() {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    // Auf file:// Protokoll blockieren Browser CORS-Fetches auf lokale Verzeichnisse/Dateien.
    // Built-in Stems und DEFAULT_PRELOADED_TRACKS werden sauber genutzt.
    return;
  }
  try {
    let res = await fetch('music/list.php').catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('music/manifest.json').catch(() => null);
    }
    if (res && res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.tracks) && data.tracks.length > 0) {
        const foundTracks = data.tracks;
        
        const realTracks = foundTracks.map(t => {
          let cleanTitle = (t.name || t.fullName || '')
            .replace(/^🎵\s*/, '')
            .replace(/\s*-\s*/g, ' – ')
            .replace(/[_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          return {
            id: t.id || ('folder_' + Math.random().toString(36).slice(2, 7)),
            name: cleanTitle,
            fullName: t.fullName || cleanTitle,
            url: t.url,
            duration: null,
            isLocalFolder: true
          };
        });

        playlistTracks = [...realTracks];
        if (typeof window !== 'undefined') window.playlistTracks = playlistTracks;

        playlistTracks.forEach(preloadMusicTrackDuration);
        renderMusicPlaylist();

        BUILTIN_DJ_STEMS.length = 0;
        realTracks.forEach((t, i) => {
          const stemId = 'track_stem_' + i;
          BUILTIN_DJ_STEMS.push({
            id: stemId,
            name: t.name,
            bpm: 120,
            file: t.url,
            color: (i % 2 === 0 ? 'cyan' : 'purple'),
            emoji: '🎵'
          });
        });

        updateDjPresetDropdowns();

        if (BUILTIN_DJ_STEMS.length > 0 && (!djDecks.a.track || !djDecks.a.isPlaying)) {
          loadDjBuiltinTrack('a', BUILTIN_DJ_STEMS[0].id, false);
        }
        if (BUILTIN_DJ_STEMS.length > 1 && (!djDecks.b.track || !djDecks.b.isPlaying)) {
          loadDjBuiltinTrack('b', BUILTIN_DJ_STEMS[1].id, false);
        }
      }
    }
  } catch(e) {
    console.warn('[AudioPlayer] Folder scan notice:', e);
  }
}
window.scanMusicFolderTracks = scanMusicFolderTracks;

// Auto-load saved tracks and scan music folder on startup
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadSavedUserAudioTracks();
      scanMusicFolderTracks();
    });
  } else {
    loadSavedUserAudioTracks();
    scanMusicFolderTracks();
  }
}

var DEFAULT_PRELOADED_TRACKS = (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_PRELOADED_TRACKS))
  ? window.DEFAULT_PRELOADED_TRACKS
  : [
      { id: 'folder_43696e65', name: 'The Cinematic Orchestra – Evolution', fullName: 'Cinematic Orchestra - Evolution.mp3', url: 'music/Cinematic%20Orchestra%20-%20%20Evolution.mp3', bpm: 95, duration: 388, isPreloaded: true },
      { id: 'folder_44656174', name: 'Death In Vegas – All That Glitters', fullName: 'Death In Vegas - All That Glitters.mp3', url: 'music/Death%20In%20Vegas%20-%20All%20That%20Glitters.mp3', bpm: 110, duration: 395, isPreloaded: true },
      { id: 'folder_444a2043', name: 'DJ Cam – Lost Kingdom', fullName: 'DJ Cam - Lost Kingdom.mp3', url: 'music/DJ%20Cam%20-%20Lost%20Kingdom.mp3', bpm: 88, duration: 254, isPreloaded: true },
      { id: 'folder_496e6469', name: 'Indian Rope Man – 66 Meters', fullName: 'Indian Rope Man 66 Meters.mp3', url: 'music/Indian%20Rope%20Man%2066%20Meters.mp3', bpm: 118, duration: 270, isPreloaded: true },
      { id: 'folder_4c657669', name: 'Levitation – More Than Ever People', fullName: 'Levitation - More Than Ever People.mp3', url: 'music/Levitation%20-%20More%20Than%20Ever%20People.mp3', bpm: 100, duration: 320, isPreloaded: true },
      { id: 'folder_506f7274', name: 'Portishead – Numb', fullName: 'Portishead - Numb.mp3', url: 'music/Portishead%20-%20Numb.mp3', bpm: 78, duration: 236, isPreloaded: true },
      { id: 'folder_54686520', name: 'The Cinematic Orchestra – Channel 1 Suite (Zero 7)', fullName: 'The Cinematic Orchestra - Channel 1 Suite (Zero 7 - Late Night Tales).mp3', url: 'music/The%20Cinematic%20Orchestra%20-%20Channel%201%20Suite%20(Zero%207%20-%20Late%20Night%20Tales).mp3', bpm: 92, duration: 345, isPreloaded: true },
      { id: 'folder_54726963', name: 'Tricky – Hell Is Around The Corner', fullName: 'Tricky Hell Is Around The Corner.mp3', url: 'music/Tricky%20Hell%20Is%20Around%20The%20Corner.mp3', bpm: 82, duration: 226, isPreloaded: true }
    ];

if (typeof playlistTracks === 'undefined' || !Array.isArray(playlistTracks) || playlistTracks.length === 0) {
  playlistTracks = [...DEFAULT_PRELOADED_TRACKS];
}

function openAudioStudioModal() {
  if (typeof togglePanel === 'function') togglePanel('audio');
  scanMusicFolderTracks();
}
window.openAudioStudioModal = openAudioStudioModal;

function handleMusicFilesUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const wasEmpty = playlistTracks.length === 0;
  const newTracks = Array.from(files).map((file, i) => {
    const trackId = 'usr_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2, 6);
    const track = {
      id: trackId,
      url: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, ''),
      fullName: file.name,
      duration: null,
      isUserUploaded: true
    };
    saveTrackToAudioVault(track, file);
    return track;
  });

  playlistTracks = playlistTracks.concat(newTracks);
  newTracks.forEach(preloadMusicTrackDuration);

  renderMusicPlaylist();

  if (wasEmpty) {
    if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
    currentTrackIndex = isPlayerShuffleEnabled && playlistTracks.length > 1
      ? Math.floor(Math.random() * playlistTracks.length)
      : 0;
    playMusicTrack(currentTrackIndex);
  } else {
    showToast(`${newTracks.length} Track(s) dauerhaft gespeichert! 🎧💾`);
  }
  event.target.value = '';
}
window.handleMusicFilesUpload = handleMusicFilesUpload;
window.handleUserSoundFile = handleMusicFilesUpload;

function preloadMusicTrackDuration(track) {
  if (!track || !track.url) return;
  const probe = new Audio();
  probe.preload = 'metadata';
  probe.addEventListener('loadedmetadata', () => {
    track.duration = probe.duration;
    renderMusicPlaylist();
    updateMusicNowPlayingDisplay();
  });
  probe.addEventListener('error', () => {
    if (!track.duration) {
      track.duration = 180;
    }
    renderMusicPlaylist();
  });
  probe.src = track.url;
}

function renderMusicPlaylist() {
  const container = document.getElementById('music-playlist-container');
  if (!container) return;

  if (playlistTracks.length === 0) {
    container.innerHTML = `<div class="text-center py-2 text-xs text-gray-500 italic">Noch keine Tracks geladen. Klicke auf 'Laden', um deine Musik abzuspielen.</div>`;
    return;
  }

  container.innerHTML = playlistTracks.map((track, idx) => {
    const isActive = idx === currentTrackIndex && activeUserAudio && !activeUserAudio.paused;
    const isSelected = idx === currentTrackIndex;
    const durStr = track.duration ? formatAudioTime(track.duration) : '--:--';
    return `
      <div onclick="playMusicTrack(${idx})" class="p-1.5 px-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${isSelected ? 'bg-purple-500/20 border-purple-500/40 text-white' : 'bg-black/30 hover:bg-white/5 border-white/5 text-gray-300'}">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-[10px] font-mono ${isActive ? 'text-[#00ff66] font-bold' : 'text-gray-500'} w-4 shrink-0">${idx + 1}.</span>
          <div class="truncate text-xs font-semibold ${isSelected ? 'text-purple-200' : ''}">${track.name}</div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[9px] font-mono text-gray-400">${durStr}</span>
          <button onclick="removeMusicTrack(${idx}, event)" aria-label="Titel löschen" class="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-300 transition" title="Löschen">
            <i data-lucide="x" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}
window.renderMusicPlaylist = renderMusicPlaylist;
window.renderTrackList = renderMusicPlaylist;

let mediaVisualizerAnimFrame = null;
let mediaAudioSourceNode = null;
let mediaAnalyserNode = null;

function isVideoFileUrl(url, name) {
  const testStr = `${url || ''} ${name || ''}`.toLowerCase();
  return testStr.endsWith('.mp4') || testStr.endsWith('.webm') || testStr.endsWith('.ogg') || testStr.endsWith('.mov') || testStr.endsWith('.mkv') || testStr.includes('video/');
}

function updateMediaScreenDisplay(isVideo, mediaEl) {
  const videoEl = document.getElementById('media-video-element');
  const canvas = document.getElementById('media-audio-visualizer-canvas');
  const typeBadge = document.getElementById('media-type-badge');
  const pipBtn = document.getElementById('media-pip-btn');

  if (isVideo && videoEl) {
    videoEl.classList.remove('hidden');
    if (canvas) canvas.classList.add('hidden');
    if (typeBadge) {
      typeBadge.textContent = 'VIDEO';
      typeBadge.className = 'px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-black/60 text-emerald-300 border border-emerald-500/40 backdrop-blur-md';
    }
    if (pipBtn) pipBtn.classList.remove('hidden');
  } else {
    if (videoEl) {
      videoEl.classList.add('hidden');
      try { videoEl.pause(); } catch(e) {}
    }
    if (canvas) canvas.classList.remove('hidden');
    if (typeBadge) {
      typeBadge.textContent = 'AUDIO';
      typeBadge.className = 'px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-black/60 text-purple-300 border border-purple-500/40 backdrop-blur-md';
    }
    startAudioVisualizerLoop();
  }
}

function startAudioVisualizerLoop() {
  const canvas = document.getElementById('media-audio-visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (mediaVisualizerAnimFrame) cancelAnimationFrame(mediaVisualizerAnimFrame);

  let phase = 0;
  function draw() {
    if (canvas.classList.contains('hidden')) return;
    const w = canvas.width = canvas.clientWidth || 300;
    const h = canvas.height = canvas.clientHeight || 96;

    ctx.fillStyle = '#0a0c12';
    ctx.fillRect(0, 0, w, h);

    const isPlaying = activeUserAudio && !activeUserAudio.paused;
    const bars = 36;
    const barWidth = (w - (bars * 2)) / bars;

    for (let i = 0; i < bars; i++) {
      const x = i * (barWidth + 2) + 2;
      let barHeight = 6;
      if (isPlaying) {
        const wave = Math.sin(phase + i * 0.35) * 0.5 + 0.5;
        const wave2 = Math.cos(phase * 1.5 + i * 0.2) * 0.5 + 0.5;
        barHeight = Math.max(6, (wave * 0.6 + wave2 * 0.4) * (h * 0.72));
      }

      const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.85)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.95)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, h - barHeight, barWidth, barHeight, [3, 3, 0, 0]) : ctx.fillRect(x, h - barHeight, barWidth, barHeight);
      ctx.fill();
    }

    if (isPlaying) phase += 0.08;
    mediaVisualizerAnimFrame = requestAnimationFrame(draw);
  }
  draw();
}

function setMediaPlaybackRate(rate) {
  const r = parseFloat(rate) || 1.0;
  if (activeUserAudio) activeUserAudio.playbackRate = r;
  const videoEl = document.getElementById('media-video-element');
  if (videoEl) videoEl.playbackRate = r;
}
window.setMediaPlaybackRate = setMediaPlaybackRate;

async function toggleMediaPip() {
  const videoEl = document.getElementById('media-video-element');
  if (!videoEl || videoEl.classList.contains('hidden')) {
    if (typeof showToast === 'function') showToast('Picture-in-Picture ist nur bei Videos verfügbar 🎬');
    return;
  }
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoEl.requestPictureInPicture) {
      await videoEl.requestPictureInPicture();
    }
  } catch(e) {
    console.warn('[Media] PiP Error:', e);
  }
}
window.toggleMediaPip = toggleMediaPip;

function toggleMediaFullscreen() {
  const videoEl = document.getElementById('media-video-element');
  const wrapper = document.getElementById('media-screen-wrapper');
  const target = (!videoEl.classList.contains('hidden') ? videoEl : wrapper);
  if (!target) return;
  if (!document.fullscreenElement) {
    target.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
window.toggleMediaFullscreen = toggleMediaFullscreen;

function loadOnlineMediaUrl() {
  const input = document.getElementById('media-stream-url-input');
  if (!input || !input.value.trim()) return;
  const url = input.value.trim();
  const name = url.split('/').pop().split('?')[0] || 'Online Stream';
  const isVideo = isVideoFileUrl(url, name);

  const trackId = 'online_' + Date.now();
  const newTrack = {
    id: trackId,
    name: '🌐 ' + decodeURIComponent(name),
    fullName: decodeURIComponent(name),
    url: url,
    isVideo: isVideo,
    duration: null,
    isOnlineStream: true
  };

  playlistTracks.unshift(newTrack);
  input.value = '';
  renderMusicPlaylist();
  playMusicTrack(0);
  if (typeof showToast === 'function') {
    showToast(`Stream geladen: ${newTrack.name} 🎬`);
  }
}
window.loadOnlineMediaUrl = loadOnlineMediaUrl;

function playMusicTrack(index) {
  if (playlistTracks.length === 0) return;
  if (index < 0 || index >= playlistTracks.length) index = 0;
  currentTrackIndex = index;

  const track = playlistTracks[currentTrackIndex];
  const isVideo = track.isVideo || isVideoFileUrl(track.url, track.name || track.fullName);

  if (activeUserAudio) {
    try {
      activeUserAudio.pause();
      activeUserAudio.src = '';
    } catch(e) {}
  }

  let mediaEl;
  const videoEl = document.getElementById('media-video-element');

  if (isVideo && videoEl) {
    videoEl.src = track.url;
    mediaEl = videoEl;
  } else {
    mediaEl = new Audio(track.url);
  }

  const speedSelect = document.getElementById('media-speed-select');
  if (speedSelect && speedSelect.value) {
    mediaEl.playbackRate = parseFloat(speedSelect.value) || 1.0;
  }

  mediaEl.volume = isPlayerMuted ? 0 : (soundMasterVolume * 0.75);
  activeUserAudio = mediaEl;

  updateMediaScreenDisplay(isVideo, mediaEl);

  mediaEl.addEventListener('timeupdate', () => {
    if (activeUserAudio !== mediaEl) return;
    updateMusicProgressUI(mediaEl);
  });

  mediaEl.addEventListener('ended', () => {
    if (playerRepeatMode === 'one') {
      playMusicTrack(currentTrackIndex);
    } else if (playerRepeatMode === 'off' && !isPlayerShuffleEnabled && currentTrackIndex === playlistTracks.length - 1) {
      updateMusicPlayBtnUI(false);
    } else {
      playNextMusicTrack();
    }
  });

  mediaEl.play().then(() => {
    updateMusicPlayBtnUI(true);
    updateMusicNowPlayingDisplay();
    renderMusicPlaylist();
    startAudioVisualizerLoop();
  }).catch(err => {
    console.warn('[AudioPlayer] Playback attempt error:', err);
    updateMusicPlayBtnUI(false);
  });
}
window.playMusicTrack = playMusicTrack;
window.playTrack = playMusicTrack;

function toggleMusicPlayback() {
  if (!activeUserAudio) {
    if (playlistTracks.length > 0) playMusicTrack(currentTrackIndex);
    return;
  }

  if (activeUserAudio.paused) {
    activeUserAudio.play().then(() => {
      updateMusicPlayBtnUI(true);
      renderMusicPlaylist();
    }).catch(e => console.warn(e));
  } else {
    activeUserAudio.pause();
    updateMusicPlayBtnUI(false);
    renderMusicPlaylist();
  }
}
window.toggleMusicPlayback = toggleMusicPlayback;
window.togglePlaylistPlayback = toggleMusicPlayback;

function playNextMusicTrack() {
  if (playlistTracks.length === 0) return;
  let nextIndex = currentTrackIndex;
  if (isPlayerShuffleEnabled && playlistTracks.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * playlistTracks.length);
    } while (nextIndex === currentTrackIndex);
  } else {
    nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlistTracks.length) nextIndex = 0;
  }
  playMusicTrack(nextIndex);
}
window.playNextMusicTrack = playNextMusicTrack;
window.playNextTrackWithCrossfade = playNextMusicTrack;

function playPrevMusicTrack() {
  if (playlistTracks.length === 0) return;
  if (activeUserAudio && activeUserAudio.currentTime > 3) {
    activeUserAudio.currentTime = 0;
    return;
  }
  let prevIndex = currentTrackIndex - 1;
  if (prevIndex < 0) prevIndex = playlistTracks.length - 1;
  playMusicTrack(prevIndex);
}
window.playPrevMusicTrack = playPrevMusicTrack;
window.playPreviousTrack = playPrevMusicTrack;

function seekMusicTrack(val) {
  if (!activeUserAudio || !activeUserAudio.duration) return;
  const pct = parseFloat(val);
  activeUserAudio.currentTime = (pct / 100) * activeUserAudio.duration;
}
window.seekMusicTrack = seekMusicTrack;

function setMusicPlayerVolume(val) {
  soundMasterVolume = parseFloat(val);
  if (activeUserAudio) {
    activeUserAudio.volume = isPlayerMuted ? 0 : (soundMasterVolume * 0.75);
  }
}
window.setMusicPlayerVolume = setMusicPlayerVolume;
window.setSoundVolume = setMusicPlayerVolume;

function toggleMusicShuffle() {
  isPlayerShuffleEnabled = !isPlayerShuffleEnabled;
  const btn = document.getElementById('music-btn-shuffle');
  if (btn) {
    btn.className = isPlayerShuffleEnabled
      ? 'p-1 rounded-lg bg-purple-500/30 text-purple-300 border border-purple-400/40 cursor-pointer transition'
      : 'p-1 rounded-lg text-gray-400 hover:text-white transition cursor-pointer';
  }
  showToast(isPlayerShuffleEnabled ? 'Zufallswiedergabe aktiv 🔀' : 'Zufallswiedergabe aus');
}
window.toggleMusicShuffle = toggleMusicShuffle;
window.togglePlayerShuffle = toggleMusicShuffle;

function toggleMusicRepeat() {
  if (playerRepeatMode === 'all') playerRepeatMode = 'one';
  else if (playerRepeatMode === 'one') playerRepeatMode = 'off';
  else playerRepeatMode = 'all';

  const btn = document.getElementById('music-btn-repeat');
  if (btn) {
    if (playerRepeatMode === 'all') {
      btn.className = 'p-1 rounded-lg bg-purple-500/30 text-purple-300 border border-purple-400/40 cursor-pointer transition';
      btn.title = 'Alles wiederholen';
    } else if (playerRepeatMode === 'one') {
      btn.className = 'p-1 rounded-lg bg-purple-500/50 text-purple-100 border border-purple-300 font-bold cursor-pointer transition';
      btn.title = 'Titel wiederholen';
    } else {
      btn.className = 'p-1 rounded-lg text-gray-400 hover:text-white transition cursor-pointer';
      btn.title = 'Keine Wiederholung';
    }
  }
}
window.toggleMusicRepeat = toggleMusicRepeat;
window.cyclePlayerRepeatMode = toggleMusicRepeat;

function removeMusicTrack(idx, event) {
  if (event) event.stopPropagation();
  const tracks = (typeof window !== 'undefined' && Array.isArray(window.playlistTracks))
    ? window.playlistTracks
    : ((typeof playlistTracks !== 'undefined' && Array.isArray(playlistTracks)) ? playlistTracks : []);
  if (idx < 0 || idx >= tracks.length) return;

  const curIdx = (typeof currentTrackIndex !== 'undefined') ? currentTrackIndex : ((typeof window !== 'undefined' && window.currentTrackIndex) || 0);
  const audioObj = (typeof activeUserAudio !== 'undefined') ? activeUserAudio : ((typeof window !== 'undefined' && window.activeUserAudio) || null);

  const wasPlaying = idx === curIdx && audioObj && !audioObj.paused;
  const [removedTrack] = tracks.splice(idx, 1);
  if (removedTrack) {
    if (removedTrack.id) removeTrackFromAudioVault(removedTrack.id);
    if (removedTrack.url && String(removedTrack.url).startsWith('blob:')) {
      try { URL.revokeObjectURL(removedTrack.url); } catch(e) {}
    }
  }

  if (tracks.length === 0) {
    if (audioObj) {
      try { audioObj.pause(); } catch(e) {}
      if (typeof activeUserAudio !== 'undefined') activeUserAudio = null;
      if (typeof window !== 'undefined') window.activeUserAudio = null;
    }
    if (typeof currentTrackIndex !== 'undefined') currentTrackIndex = 0;
    if (typeof window !== 'undefined') window.currentTrackIndex = 0;
    if (typeof updateMusicPlayBtnUI === 'function') updateMusicPlayBtnUI(false);
    if (typeof updateMusicNowPlayingDisplay === 'function') updateMusicNowPlayingDisplay();
    if (typeof renderMusicPlaylist === 'function') renderMusicPlaylist();
    return;
  }

  let nextIdx = curIdx;
  if (idx < curIdx) {
    nextIdx = curIdx - 1;
  } else if (idx === curIdx) {
    nextIdx = Math.min(curIdx, tracks.length - 1);
    if (wasPlaying && typeof playMusicTrack === 'function') {
      if (typeof currentTrackIndex !== 'undefined') currentTrackIndex = nextIdx;
      if (typeof window !== 'undefined') window.currentTrackIndex = nextIdx;
      playMusicTrack(nextIdx);
      return;
    }
  }

  if (typeof currentTrackIndex !== 'undefined') currentTrackIndex = nextIdx;
  if (typeof window !== 'undefined') window.currentTrackIndex = nextIdx;
  if (typeof updateMusicNowPlayingDisplay === 'function') updateMusicNowPlayingDisplay();
  if (typeof renderMusicPlaylist === 'function') renderMusicPlaylist();
}
window.removeMusicTrack = removeMusicTrack;
window.removeTrackFromPlaylist = removeMusicTrack;

function updateMusicPlayBtnUI(isPlaying) {
  const btn = document.getElementById('music-play-pause-btn');
  if (btn) {
    btn.innerHTML = isPlaying
      ? '<i data-lucide="pause" class="w-3.5 h-3.5"></i>'
      : '<i data-lucide="play" class="w-3.5 h-3.5"></i>';
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }
}

function updateMusicNowPlayingDisplay() {
  const titleEl = document.getElementById('music-now-playing-title');
  const timeEl = document.getElementById('music-now-playing-time');
  const track = playlistTracks[currentTrackIndex];

  if (titleEl) {
    titleEl.innerText = track ? track.name : 'Kein Track aktiv';
  }
  if (timeEl && track && activeUserAudio) {
    const cur = formatAudioTime(activeUserAudio.currentTime);
    const dur = track.duration ? formatAudioTime(track.duration) : '--:--';
    timeEl.innerText = `${cur} / ${dur}`;
  }
}

function updateMusicProgressUI(audio) {
  if (!audio || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100 || 0;
  const slider = document.getElementById('music-progress-slider');
  if (slider) slider.value = pct;

  const timeEl = document.getElementById('music-now-playing-time');
  if (timeEl) {
    const cur = formatAudioTime(audio.currentTime);
    const dur = formatAudioTime(audio.duration);
    timeEl.innerText = `${cur} / ${dur}`;
  }
}

// ============================================================================
// 3. MULTI-SOURCE STREAMING (SPOTIFY & YOUTUBE)
// ============================================================================

function switchMusicSourceTab(tab) {
  const tabs = ['dj', 'spotify', 'youtube'];
  tabs.forEach(t => {
    const btn = document.getElementById(`music-tab-btn-${t}`);
    const pane = document.getElementById(`music-pane-${t}`);
    if (btn) {
      btn.className = (t === tab)
        ? `flex-1 py-1 rounded-lg text-white bg-purple-600/30 border border-purple-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px] font-bold shadow-sm`
        : `flex-1 py-1 rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px] font-medium`;
    }
    if (pane) {
      pane.classList.toggle('hidden', t !== tab);
    }
  });

  if (typeof AppStorage !== 'undefined') {
    AppStorage.set('flow_music_active_tab', tab);
  }

  if (tab === 'spotify') {
    const spotifyContainer = document.getElementById('spotify-embed-container');
    if (spotifyContainer && !spotifyContainer.querySelector('iframe')) {
      const saved = (typeof AppStorage !== 'undefined' ? AppStorage.get('flow_spotify_url') : '') || 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM';
      loadSpotifyEmbed(saved);
    }
  } else if (tab === 'youtube') {
    const ytContainer = document.getElementById('youtube-embed-container');
    if (ytContainer && !ytContainer.querySelector('iframe')) {
      const saved = (typeof AppStorage !== 'undefined' ? AppStorage.get('flow_youtube_url') : '') || 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
      loadYoutubeEmbed(saved);
    }
  }

  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}
window.switchMusicSourceTab = switchMusicSourceTab;

function formatSpotifyEmbedUrl(input) {
  if (!input) return 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM';
  let str = input.trim();
  
  // Strip iframe code if user pasted whole <iframe>
  const iframeMatch = str.match(/src=["'](.*?)["']/);
  if (iframeMatch && iframeMatch[1]) {
    str = iframeMatch[1];
  }

  // spotify:playlist:ID or spotify:track:ID or spotify:album:ID
  if (str.startsWith('spotify:')) {
    const parts = str.split(':');
    if (parts.length >= 3) {
      return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
    }
  }

  // Clean parameters and query strings from raw URL first
  const cleanUrl = str.split('?')[0];

  // Regex matching playlist, track, album, episode, artist, show across any localized subdomain (e.g. open.spotify.com/intl-de/playlist/...)
  const match = cleanUrl.match(/open\.spotify\.com\/(?:[a-zA-Z-]+(?:\/|))?(playlist|track|album|artist|show|episode)\/([a-zA-Z0-9]+)/);
  if (match && match[1] && match[2]) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }

  // If already open.spotify.com/embed/...
  if (cleanUrl.includes('open.spotify.com/embed/')) {
    return cleanUrl;
  }

  // If plain 22-character alphanumeric ID (standard Spotify 22-char Base62 ID)
  if (/^[a-zA-Z0-9]{22}$/.test(str)) {
    return `https://open.spotify.com/embed/playlist/${str}`;
  }

  return `https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM`;
}

function loadSpotifyEmbed(urlOrId) {
  let val = urlOrId;
  if (!val) {
    const input = document.getElementById('spotify-url-input');
    val = input ? input.value.trim() : '';
  }
  if (!val) {
    val = 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM';
  }

  const container = document.getElementById('spotify-embed-container');
  if (!container) return;

  const embedUrl = formatSpotifyEmbedUrl(val);
  const input = document.getElementById('spotify-url-input');
  if (input && urlOrId) {
    input.value = urlOrId;
  }

  container.innerHTML = `
    <iframe style="border-radius:14px" src="${embedUrl}?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
  `;

  if (typeof AppStorage !== 'undefined') {
    AppStorage.set('flow_spotify_url', val);
  }
  if (typeof showToast === 'function') {
    showToast('Spotify Playlist geladen! 🟢');
  }
}
window.loadSpotifyEmbed = loadSpotifyEmbed;

function formatYoutubeEmbedData(input) {
  if (!input) return { type: 'video', id: 'jfKfPfyJRdk', listId: null };
  let str = input.trim();

  // Strip iframe code if user pasted whole <iframe>
  const iframeMatch = str.match(/src=["'](.*?)["']/);
  if (iframeMatch && iframeMatch[1]) {
    str = iframeMatch[1];
  }

  // Extract playlist ID
  const playlistMatch = str.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const listId = playlistMatch ? playlistMatch[1] : null;

  // Extract video ID from youtube.com, youtu.be, live streams, shorts, embeds
  const videoMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/);
  
  if (videoMatch && videoMatch[1]) {
    return {
      type: 'video',
      id: videoMatch[1],
      listId: listId
    };
  }

  if (listId) {
    return {
      type: 'playlist',
      id: listId
    };
  }

  if (/^[\w-]{11}$/.test(str)) {
    return {
      type: 'video',
      id: str,
      listId: null
    };
  }

  return {
    type: 'video',
    id: 'jfKfPfyJRdk',
    listId: null
  };
}

function loadYoutubeEmbed(urlOrId) {
  let val = urlOrId;
  if (!val) {
    const input = document.getElementById('youtube-url-input');
    val = input ? input.value.trim() : '';
  }
  if (!val) {
    val = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
  }

  const container = document.getElementById('youtube-embed-container');
  if (!container) return;

  const data = formatYoutubeEmbedData(val);
  const input = document.getElementById('youtube-url-input');
  if (input && urlOrId) {
    input.value = urlOrId;
  }

  let srcUrl = '';
  if (data.type === 'playlist') {
    srcUrl = `https://www.youtube.com/embed/videoseries?list=${data.id}&autoplay=1&rel=0`;
  } else {
    srcUrl = `https://www.youtube.com/embed/${data.id}?autoplay=1&rel=0&modestbranding=1${data.listId ? '&list=' + data.listId : ''}`;
  }

  container.innerHTML = `
    <div class="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-lg">
      <iframe class="w-full h-full" src="${srcUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
    </div>
  `;

  if (typeof AppStorage !== 'undefined') {
    AppStorage.set('flow_youtube_url', val);
  }
  if (typeof showToast === 'function') {
    showToast('YouTube Stream geladen! 🔴');
  }
}
window.loadYoutubeEmbed = loadYoutubeEmbed;
window.loadYouTubeEmbed = loadYoutubeEmbed;

// ============================================================================
// 4. TAB 4: 2-DECK PRO DJ MIXER & AUTOMIX WORKSTATION
// ============================================================================

var djAutomix = {
  enabled: false,
  durationSec: 8,
  isTransitioning: false,
  activeDeck: 'a',
  timer: null
};

function initDjDecks() {
  if (!djDecks.a.track) {
    loadDjBuiltinTrack('a', 'deep_house', false);
  }
  if (!djDecks.b.track) {
    loadDjBuiltinTrack('b', 'lofi_chill', false);
  }
  setDjCrossfader(0.5);
  updateDjDeckUI('a');
  updateDjDeckUI('b');
}
window.initDjDecks = initDjDecks;

function createSyntheticBeatAudio(bpm = 124, type = 'techno') {
  if (typeof initAudioContext === 'function') initAudioContext();
  const ctx = (typeof audioCtx !== 'undefined' && audioCtx) ? audioCtx : (typeof window !== 'undefined' ? window.audioCtx : null);
  if (!ctx) return null;

  const sampleRate = ctx.sampleRate || 44100;
  const barSec = (60 / bpm) * 4;
  const loopSec = barSec * 4; // 16 beats loop
  const buffer = ctx.createBuffer(2, Math.floor(sampleRate * loopSec), sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const beatSec = 60 / bpm;
  const totalBeats = 16;

  for (let b = 0; b < totalBeats; b++) {
    const startSample = Math.floor(b * beatSec * sampleRate);
    
    // Kick on every beat
    const kickSamples = Math.floor(0.18 * sampleRate);
    for (let i = 0; i < kickSamples; i++) {
      if (startSample + i < left.length) {
        const t = i / sampleRate;
        const freq = 130 * Math.exp(-t * 26) + 45;
        const env = Math.exp(-t * 18);
        const val = Math.sin(2 * Math.PI * freq * t) * env * 0.75;
        left[startSample + i] += val;
        right[startSample + i] += val;
      }
    }

    // Hi-Hat on off-beats
    const hatSample = Math.floor((b + 0.5) * beatSec * sampleRate);
    const hatLen = Math.floor(0.06 * sampleRate);
    for (let i = 0; i < hatLen; i++) {
      if (hatSample + i < left.length) {
        const env = Math.exp(-(i / sampleRate) * 55);
        const noise = (Math.random() * 2 - 1) * env * 0.35;
        left[hatSample + i] += noise;
        right[hatSample + i] += noise;
      }
    }

    // Snare / Clap on beats 2 and 4
    if (b % 2 === 1) {
      const snareSamples = Math.floor(0.14 * sampleRate);
      for (let i = 0; i < snareSamples; i++) {
        if (startSample + i < left.length) {
          const t = i / sampleRate;
          const noise = (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.45;
          const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 32) * 0.35;
          left[startSample + i] += noise + tone;
          right[startSample + i] += noise + tone;
        }
      }
    }
  }

  const wavBlob = audioBufferToWavBlob(buffer);
  return URL.createObjectURL(wavBlob);
}
if (typeof window !== 'undefined') window.createSyntheticBeatAudio = createSyntheticBeatAudio;
if (typeof globalThis !== 'undefined') globalThis.createSyntheticBeatAudio = createSyntheticBeatAudio;

function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLen = buffer.length * blockAlign;
  const bufferLen = 44 + dataLen;
  const arrayBuffer = new ArrayBuffer(bufferLen);
  const view = new DataView(arrayBuffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLen, true);

  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = Math.max(-1, Math.min(1, channels[ch][i]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function loadDjBuiltinTrack(deckId, presetKey = 'deep_house', notify = true) {
  const deck = djDecks[deckId];
  if (!deck) return;

  const stem = BUILTIN_DJ_STEMS.find(s => s.id === presetKey) || BUILTIN_DJ_STEMS[0];
  const syntheticUrl = createSyntheticBeatAudio(stem.bpm, stem.id);

  if (deck.audio) {
    try { deck.audio.pause(); } catch(e) {}
  }
  if (deck.track && deck.track.url && String(deck.track.url).startsWith('blob:')) {
    try { URL.revokeObjectURL(deck.track.url); } catch(e) {}
  }

  const track = {
    url: stem.file || syntheticUrl,
    fallbackUrl: syntheticUrl,
    name: stem.name,
    fullName: stem.name,
    isBuiltin: true
  };

  deck.track = track;
  deck.bpm = stem.bpm;
  
  const audio = new Audio(track.url);
  audio.loop = true;
  audio.playbackRate = deck.pitch;

  audio.addEventListener('error', () => {
    if (track.fallbackUrl && audio.src !== track.fallbackUrl) {
      console.log(`[DJ] MP3 file not found (${track.url}), falling back to synthetic audio for ${stem.name}`);
      audio.src = track.fallbackUrl;
      deck.track.url = track.fallbackUrl;
      if (deck.isPlaying) audio.play().catch(() => {});
    }
  });

  deck.audio = audio;

  bindDjAudioEvents(deckId);
  updateDjDeckUI(deckId);

  if (notify) {
    showToast(`Deck ${deckId.toUpperCase()}: "${stem.name}" geladen! 🎛️`);
  }
}
window.loadDjBuiltinTrack = loadDjBuiltinTrack;

function handleDjDeckUpload(deckId, event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const deck = djDecks[deckId];
  if (!deck) return;

  if (deck.audio) {
    try { deck.audio.pause(); } catch(e) {}
  }
  if (deck.track && deck.track.url && String(deck.track.url).startsWith('blob:')) {
    try { URL.revokeObjectURL(deck.track.url); } catch(e) {}
  }

  const trackId = 'usr_dj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const track = {
    id: trackId,
    url: URL.createObjectURL(file),
    name: file.name.replace(/\.[^/.]+$/, ''),
    fullName: file.name,
    isBuiltin: false,
    isUserUploaded: true
  };
  saveTrackToAudioVault(track, file);

  deck.track = track;
  deck.audio = new Audio(track.url);
  deck.audio.playbackRate = deck.pitch;

  bindDjAudioEvents(deckId);
  updateDjDeckUI(deckId);

  showToast(`Deck ${deckId.toUpperCase()}: "${track.name}" geladen & gesichert! 🎛️💾`);
  event.target.value = '';
}
window.handleDjDeckUpload = handleDjDeckUpload;

function bindDjAudioEvents(deckId) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;

  deck.audio.addEventListener('timeupdate', () => {
    if (!deck.audio || !deck.audio.duration) return;

    if (deck.loopActive && deck.loopEnd > deck.loopStart && deck.audio.currentTime >= deck.loopEnd) {
      deck.audio.currentTime = deck.loopStart;
    }

    deck.jogRotation = (deck.jogRotation + 3) % 360;
    const jog = document.getElementById(`dj-jog-${deckId}`) || document.getElementById(`dj-vinyl-disc-${deckId}`);
    if (jog && deck.isPlaying) {
      jog.style.transform = `rotate(${deck.jogRotation}deg)`;
    }

    const timeEl = document.getElementById(`dj-time-deck-${deckId}`);
    if (timeEl) timeEl.innerText = formatAudioTime(deck.audio.currentTime);
    const seekSlider = document.getElementById(`dj-seek-deck-${deckId}`);
    if (seekSlider) seekSlider.value = (deck.audio.currentTime / deck.audio.duration) * 100 || 0;

    if (djAutomix.enabled && !djAutomix.isTransitioning && deck.isPlaying) {
      const remain = deck.audio.duration - deck.audio.currentTime;
      if (remain <= (djAutomix.durationSec || 8) && remain > 0.5) {
        triggerDjAutomixNow();
      }
    }
  });

  deck.audio.addEventListener('ended', () => {
    deck.isPlaying = false;
    updateDjPlayBtnUI(deckId, false);
    if (djAutomix.enabled) {
      triggerDjAutomixNow();
    }
  });
}

function updateDjDeckUI(deckId) {
  const deck = djDecks[deckId];
  if (!deck) return;

  const titleEl = document.getElementById(`dj-title-deck-${deckId}`);
  if (titleEl) titleEl.innerText = deck.track ? deck.track.name : 'Kein Track geladen';

  const bpmEl = document.getElementById(`dj-bpm-deck-${deckId}`);
  if (bpmEl) bpmEl.innerText = `${Math.round(deck.bpm * deck.pitch)} BPM`;

  const pitchEl = document.getElementById(`dj-pitch-val-${deckId}`);
  if (pitchEl) {
    const pct = (deck.pitch - 1.0) * 100;
    pitchEl.innerText = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }
}

function updateDjPlayBtnUI(deckId, isPlaying) {
  const btn = document.getElementById(`dj-play-btn-${deckId}`);
  if (btn) {
    const isDeckA = deckId === 'a';
    if (isPlaying) {
      btn.innerHTML = `<i data-lucide="pause" class="w-4 h-4 fill-black"></i><span class="font-black">PAUSE</span>`;
      btn.className = isDeckA
        ? 'flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-xs cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.6)] transition flex items-center justify-center gap-1.5 active:scale-95 ring-2 ring-cyan-300'
        : 'flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-xl text-xs cursor-pointer shadow-[0_0_18px_rgba(245,158,11,0.6)] transition flex items-center justify-center gap-1.5 active:scale-95 ring-2 ring-amber-300';
    } else {
      btn.innerHTML = `<i data-lucide="play" class="w-4 h-4 fill-black"></i><span class="font-black">PLAY</span>`;
      btn.className = isDeckA
        ? 'flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-xs cursor-pointer shadow-[0_0_14px_rgba(6,182,212,0.35)] transition flex items-center justify-center gap-1.5 active:scale-95'
        : 'flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs cursor-pointer shadow-[0_0_14px_rgba(245,158,11,0.35)] transition flex items-center justify-center gap-1.5 active:scale-95';
    }
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}

function toggleDjDeckPlayback(deckId) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) {
    loadDjBuiltinTrack(deckId, deckId === 'a' ? 'deep_house' : 'lofi_chill');
    return;
  }

  if (deck.audio.paused) {
    if (typeof initAudioContext === 'function') initAudioContext();
    deck.audio.play().then(() => {
      deck.isPlaying = true;
      updateDjPlayBtnUI(deckId, true);
    }).catch(e => console.warn(e));
  } else {
    deck.audio.pause();
    deck.isPlaying = false;
    updateDjPlayBtnUI(deckId, false);
  }
}
window.toggleDjDeckPlayback = toggleDjDeckPlayback;

function cueDjDeck(deckId) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  deck.audio.currentTime = deck.cueTime || 0;
  if (deck.audio.paused) {
    toggleDjDeckPlayback(deckId);
  }
  playDjSfx('cue_click');
}
window.cueDjDeck = cueDjDeck;

function syncDjDeck(deckId) {
  const otherId = deckId === 'a' ? 'b' : 'a';
  const thisDeck = djDecks[deckId];
  const otherDeck = djDecks[otherId];
  if (!thisDeck || !thisDeck.audio) return;

  if (otherDeck && otherDeck.bpm) {
    thisDeck.bpm = otherDeck.bpm;
    thisDeck.pitch = otherDeck.pitch;
    thisDeck.audio.playbackRate = thisDeck.pitch;

    const slider = document.getElementById(`dj-pitch-slider-${deckId}`);
    if (slider) slider.value = ((thisDeck.pitch - 1.0) * 100).toFixed(1);
    
    updateDjDeckUI(deckId);
    showToast(`Deck ${deckId.toUpperCase()} auf ${Math.round(thisDeck.bpm * thisDeck.pitch)} BPM synchronisiert! ⚡`);
  }
}
window.syncDjDeck = syncDjDeck;

function seekDjDeck(deckId, val) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio || !deck.audio.duration) return;
  const pct = parseFloat(val);
  deck.audio.currentTime = (pct / 100) * deck.audio.duration;
}
window.seekDjDeck = seekDjDeck;

function setDjPitch(deckId, val) {
  const deck = djDecks[deckId];
  if (!deck) return;
  const pct = parseFloat(val);
  deck.pitch = 1.0 + (pct / 100);
  if (deck.audio) {
    deck.audio.playbackRate = deck.pitch;
  }
  updateDjDeckUI(deckId);
}
window.setDjPitch = setDjPitch;

function nudgeDjPitch(deckId, delta) {
  const slider = document.getElementById(`dj-pitch-slider-${deckId}`);
  if (!slider) return;
  let cur = parseFloat(slider.value) || 0;
  cur = Math.max(-8, Math.min(8, cur + delta));
  slider.value = cur.toFixed(1);
  setDjPitch(deckId, cur);
}
window.nudgeDjPitch = nudgeDjPitch;

function setDjEq(deckId, type, val) {
  const deck = djDecks[deckId];
  if (!deck) return;
  const gain = parseFloat(val);
  if (type === 'low') deck.low = gain;
  if (type === 'mid') deck.mid = gain;
  if (type === 'high') deck.high = gain;
}
window.setDjEq = setDjEq;

function setDjFilter(deckId, val) {
  const deck = djDecks[deckId];
  if (!deck) return;
  deck.filter = parseFloat(val);
  const label = document.getElementById(`dj-filter-val-${deckId}`);
  if (label) {
    if (deck.filter < 0.45) label.innerText = 'LPF';
    else if (deck.filter > 0.55) label.innerText = 'HPF';
    else label.innerText = 'OFF';
  }
}
window.setDjFilter = setDjFilter;

function setDjCrossfader(val) {
  const x = parseFloat(val);
  const gainA = Math.cos(x * 0.5 * Math.PI);
  const gainB = Math.sin(x * 0.5 * Math.PI);
  const master = (typeof soundMasterVolume === 'number') ? soundMasterVolume : 0.5;

  if (djDecks.a && djDecks.a.audio) {
    djDecks.a.audio.volume = Math.max(0, Math.min(1, gainA * master));
  }
  if (djDecks.b && djDecks.b.audio) {
    djDecks.b.audio.volume = Math.max(0, Math.min(1, gainB * master));
  }

  const slider = document.getElementById('dj-crossfader-slider');
  if (slider && parseFloat(slider.value) !== x) {
    slider.value = x;
  }
}
window.setDjCrossfader = setDjCrossfader;

// ============================================================================
// 5. AUTOMIX & SMART SHUFFLE ENGINE
// ============================================================================

function toggleDjAutomix() {
  djAutomix.enabled = !djAutomix.enabled;
  const btn = document.getElementById('dj-automix-toggle-btn');
  const led = document.getElementById('dj-automix-led');
  const txt = document.getElementById('dj-automix-status-text');
  if (btn) {
    btn.className = djAutomix.enabled
      ? 'px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
      : 'px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-zinc-800/80 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs';
  }
  if (led) {
    led.className = djAutomix.enabled ? 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'w-2 h-2 rounded-full bg-zinc-600';
  }
  if (txt) {
    txt.textContent = djAutomix.enabled ? 'ACTIVE' : 'OFF';
  }
  showToast(djAutomix.enabled ? 'Automix Aktiviert! 🎛️⚡ Nahtloser Übergang' : 'Automix Deaktiviert');
}
window.toggleDjAutomix = toggleDjAutomix;

function setDjAutomixDuration(sec) {
  djAutomix.durationSec = parseInt(sec, 10) || 8;
  [4, 8, 16].forEach(s => {
    const b = document.getElementById(`dj-automix-dur-${s}`);
    if (b) {
      b.className = (s === djAutomix.durationSec)
        ? 'px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 text-[9px] font-bold'
        : 'px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/5 text-[9px] font-medium';
    }
  });
}
window.setDjAutomixDuration = setDjAutomixDuration;

function triggerDjAutomixNow() {
  if (djAutomix.isTransitioning) return;
  djAutomix.isTransitioning = true;

  const slider = document.getElementById('dj-crossfader-slider');
  const currentPos = slider ? parseFloat(slider.value) : 0.5;
  const targetDeck = currentPos < 0.5 ? 'b' : 'a';
  const targetPos = targetDeck === 'b' ? 1.0 : 0.0;
  const startPos = currentPos;

  if (!djDecks[targetDeck].isPlaying) {
    toggleDjDeckPlayback(targetDeck);
  }

  const durationMs = (djAutomix.durationSec || 8) * 1000;
  const startTime = performance.now();

  function animateFader(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1.0, elapsed / durationMs);
    const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    const newPos = startPos + (targetPos - startPos) * ease;
    
    setDjCrossfader(newPos);

    if (progress < 1.0) {
      requestAnimationFrame(animateFader);
    } else {
      djAutomix.isTransitioning = false;
      const outgoingDeck = targetDeck === 'b' ? 'a' : 'b';
      if (djDecks[outgoingDeck].isPlaying) {
        toggleDjDeckPlayback(outgoingDeck);
      }
      showToast(`Automix abgeschlossen: Jetzt auf Deck ${targetDeck.toUpperCase()}! 🎧`);
    }
  }

  requestAnimationFrame(animateFader);
  showToast(`Automix Übergang zu Deck ${targetDeck.toUpperCase()} (${djAutomix.durationSec}s) gestartet! 🎛️`);
}
window.triggerDjAutomixNow = triggerDjAutomixNow;

function djShuffleTracks() {
  const stems = [...BUILTIN_DJ_STEMS].sort(() => Math.random() - 0.5);
  loadDjBuiltinTrack('a', stems[0].id, false);
  loadDjBuiltinTrack('b', stems[1].id, false);
  showToast('DJ Shuffle: Frische Stems & Rhythmen geladen! 🔀');
}
window.djShuffleTracks = djShuffleTracks;

// ============================================================================
// 6. HOT CUES, LOOPS & JOGWHEEL INTERACTION
// ============================================================================

function setDjHotCue(deckId, index) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  deck.hotCues[index] = deck.audio.currentTime;
  const pad = document.getElementById(`dj-hotcue-btn-${deckId}-${index}`);
  if (pad) {
    pad.classList.add('bg-amber-400/30', 'border-amber-400', 'text-amber-200');
  }
  showToast(`Deck ${deckId.toUpperCase()}: Hot Cue ${index + 1} bei ${formatAudioTime(deck.audio.currentTime)} gesetzt! 📍`);
}
window.setDjHotCue = setDjHotCue;

function jumpDjHotCue(deckId, index) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  if (deck.hotCues[index] === null) {
    setDjHotCue(deckId, index);
    return;
  }
  deck.audio.currentTime = deck.hotCues[index];
  if (deck.audio.paused) {
    toggleDjDeckPlayback(deckId);
  }
  playDjSfx('cue_click');
}
window.jumpDjHotCue = jumpDjHotCue;

function toggleDjLoop(deckId, beats = 4) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;

  deck.loopActive = !deck.loopActive;
  deck.loopLength = beats;

  if (deck.loopActive) {
    deck.loopStart = deck.audio.currentTime;
    const beatDuration = 60 / (deck.bpm * deck.pitch);
    deck.loopEnd = deck.loopStart + (beatDuration * beats);
  }

  const loopBtn = document.getElementById(`dj-loop-btn-${deckId}-${beats}`);
  if (loopBtn) {
    loopBtn.classList.toggle('bg-emerald-500/30', deck.loopActive);
    loopBtn.classList.toggle('border-emerald-400', deck.loopActive);
  }
  showToast(`Deck ${deckId.toUpperCase()}: ${beats}-Beat Loop ${deck.loopActive ? 'Aktiv 🔁' : 'Aus'}`);
}
window.toggleDjLoop = toggleDjLoop;

function handleDjJogTouch(deckId, delta) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  deck.audio.currentTime = Math.max(0, deck.audio.currentTime + delta);
  playDjSfx('scratch_mini');
}
window.handleDjJogTouch = handleDjJogTouch;

// ============================================================================
// 7. REAL-TIME DJ SOUND FX
// ============================================================================

function playDjSfx(type) {
  if (typeof initAudioContext === 'function') initAudioContext();
  if (typeof audioCtx === 'undefined' || !audioCtx) return;

  const now = audioCtx.currentTime;
  const dest = (typeof getMasterAudioDestination === 'function') ? (getMasterAudioDestination() || audioCtx.destination) : audioCtx.destination;

  if (type === 'airhorn') {
    const hornPitches = [466.16, 622.25, 932.33];
    hornPitches.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.96, now);
      osc.frequency.linearRampToValueAtTime(freq, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.5);

      const vol = 0.28 * (soundMasterVolume || 0.5);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.setValueAtTime(vol, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(dest);
      osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
      osc.start(now);
      osc.stop(now + 0.6);
    });
    showToast('📢 AIRHORN BLAST!');
  } else if (type === 'scratch' || type === 'scratch_mini') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(type === 'scratch_mini' ? 400 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(3, now);

    const vol = (type === 'scratch_mini' ? 0.15 : 0.35) * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
    osc.start(now);
    osc.stop(now + 0.2);
    if (type !== 'scratch_mini') showToast('⚡ VINYL SCRATCH!');
  } else if (type === 'laser') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

    const vol = 0.35 * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc.connect(gain);
    gain.connect(dest);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
    osc.start(now);
    osc.stop(now + 0.35);
    showToast('🚨 LASER SWEEP!');
  } else if (type === 'subdrop') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.7);

    const vol = 0.55 * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(dest);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
    osc.start(now);
    osc.stop(now + 0.9);
    showToast('💥 808 SUB DROP!');
  } else if (type === 'riser') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 1.2);

    const vol = 0.3 * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(vol, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    osc.connect(gain);
    gain.connect(dest);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
    osc.start(now);
    osc.stop(now + 1.3);
    showToast('🌪️ NOISE RISER!');
  } else if (type === 'cue_click') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.2 * (soundMasterVolume || 0.5), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(dest);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

window.playDjSfx = playDjSfx;
window.removeMusicTrack = removeMusicTrack;
window.removeTrackFromPlaylist = removeMusicTrack;
if (typeof window !== 'undefined') window.djDecks = djDecks;
if (typeof globalThis !== 'undefined') {
  globalThis.djDecks = djDecks;
  globalThis.removeMusicTrack = removeMusicTrack;
}



function updateDjVuMeters() {
  if (typeof document === 'undefined') return;
  const vuA = document.getElementById('dj-vu-meter-a');
  const vuB = document.getElementById('dj-vu-meter-b');
  
  if (djDecks.a && djDecks.a.isPlaying && vuA) {
    const h = 25 + Math.random() * 65;
    vuA.style.height = h + '%';
  } else if (vuA) {
    vuA.style.height = '10%';
  }

  if (djDecks.b && djDecks.b.isPlaying && vuB) {
    const h = 25 + Math.random() * 65;
    vuB.style.height = h + '%';
  } else if (vuB) {
    vuB.style.height = '10%';
  }
}
if (typeof window !== 'undefined') {
  setInterval(updateDjVuMeters, 100);
}
