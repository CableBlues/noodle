/**
 * @file audio-player.js
 * @module AudioPlayerAndDjStudio
 * @description
 * Integrierter Musik-Player für lokale Audiodateien (`music/manifest.json`) sowie
 * Dual-Deck-DJ-Mixer (Deck A & Deck B) mit 3-Band-EQ, Pitch/BPM-Anpassung,
 * Hot-Cues, Beat-Looping, Crossfader und Mini-Audio-Player-Koordination.
 */
var playlistTracks = (typeof window !== 'undefined' && window.playlistTracks) ? window.playlistTracks : [];
var activeUserAudio = (typeof window !== 'undefined' && window.activeUserAudio) ? window.activeUserAudio : null;

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
    let res = await fetch('music/manifest.json').catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('music/list.php').catch(() => null);
    }
    if (res && res.ok) {
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Falls list.php rohes PHP oder ungültiges JSON geliefert hat, manifest.json als Fallback versuchen
        const fallbackRes = await fetch('music/manifest.json').catch(() => null);
        if (fallbackRes && fallbackRes.ok) {
          data = await fallbackRes.json().catch(() => null);
        }
      }
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

        // The list was rebuilt – keep the index pointing at the track that is loaded.
        if (activeUserAudio && activeUserAudio._trackUrl) {
          const loadedIdx = playlistTracks.findIndex(t => t.url === activeUserAudio._trackUrl);
          if (loadedIdx >= 0) currentTrackIndex = loadedIdx;
        }
        if (currentTrackIndex >= playlistTracks.length) currentTrackIndex = 0;

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
          const randA = Math.floor(Math.random() * BUILTIN_DJ_STEMS.length);
          loadDjBuiltinTrack('a', BUILTIN_DJ_STEMS[randA].id, false);
          const selA = document.getElementById('dj-preset-select-a');
          if (selA) selA.value = BUILTIN_DJ_STEMS[randA].id;
        }
        if (BUILTIN_DJ_STEMS.length > 1 && (!djDecks.b.track || !djDecks.b.isPlaying)) {
          let randB = Math.floor(Math.random() * BUILTIN_DJ_STEMS.length);
          if (djDecks.a.track && BUILTIN_DJ_STEMS.length > 1) {
            const curAId = BUILTIN_DJ_STEMS.find(s => s.file === djDecks.a.track.url || s.id === djDecks.a.track.id)?.id;
            const pool = BUILTIN_DJ_STEMS.filter(s => s.id !== curAId);
            if (pool.length > 0) {
              randB = BUILTIN_DJ_STEMS.indexOf(pool[Math.floor(Math.random() * pool.length)]);
            }
          }
          loadDjBuiltinTrack('b', BUILTIN_DJ_STEMS[randB].id, false);
          const selB = document.getElementById('dj-preset-select-b');
          if (selB) selB.value = BUILTIN_DJ_STEMS[randB].id;
        }
      }
    }
  } catch(e) {
    console.warn('[AudioPlayer] Folder scan notice:', e);
  }
}
window.scanMusicFolderTracks = scanMusicFolderTracks;

// Auto-load saved tracks, scan the music folder and cue a random track on startup
if (typeof window !== 'undefined') {
  const initMusicLibrary = () => {
    loadSavedUserAudioTracks();
    Promise.resolve(scanMusicFolderTracks())
      .catch(() => {})
      .then(() => { if (typeof cueRandomMusicTrack === 'function') cueRandomMusicTrack(); });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicLibrary);
  } else {
    initMusicLibrary();
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

// ----------------------------------------------------------------------------
// CROSSFADE ENGINE
//
// Tracks blend into each other instead of cutting hard:
//   • the fade length is user-selectable (0 = off) and persisted,
//   • the next track is preloaded in the background so the blend starts instantly,
//   • shortly before a track ends, the next one fades in automatically,
//   • clicking a track or "next" also fades over.
// The fade is driven by a timer *and* by the media `timeupdate` events, because
// browsers heavily throttle timers in background tabs while media events keep firing.
// ----------------------------------------------------------------------------
var MUSIC_CROSSFADE_STORAGE_KEY = 'flow_music_crossfade_sec';
var MUSIC_CROSSFADE_DEFAULT_SEC = 8;
var musicCrossfadeSeconds = (() => {
  try {
    const saved = localStorage.getItem(MUSIC_CROSSFADE_STORAGE_KEY);
    if (saved !== null && !isNaN(parseFloat(saved))) return Math.max(0, parseFloat(saved));
  } catch (e) { /* storage unavailable */ }
  return MUSIC_CROSSFADE_DEFAULT_SEC;
})();
var musicActiveFade = null;        // { step(), finish() } of the running crossfade
var musicUpcoming = null;          // { index, url, shuffle, el } preloaded next track
var musicRecentlyPlayed = [];      // last played indices, so shuffle avoids quick repeats

/** Some platforms (iOS Safari) ignore element.volume – crossfading is impossible there. */
var musicCanControlVolume = (() => {
  try {
    const probe = new Audio();
    probe.volume = 0.5;
    return Math.abs(probe.volume - 0.5) < 0.01;
  } catch (e) { return false; }
})();

function getMusicTargetVolume() {
  const muted = (typeof isPlayerMuted !== 'undefined') ? Boolean(isPlayerMuted) : false;
  const masterVol = (typeof soundMasterVolume !== 'undefined') ? soundMasterVolume : 0.8;
  return muted ? 0 : (masterVol * 0.75);
}

function setMusicCrossfadeSeconds(val) {
  musicCrossfadeSeconds = Math.max(0, Math.min(30, parseFloat(val) || 0));
  try { localStorage.setItem(MUSIC_CROSSFADE_STORAGE_KEY, String(musicCrossfadeSeconds)); } catch (e) { /* ignore */ }
  syncMusicCrossfadeSelect();
  if (typeof showToast === 'function') {
    showToast(musicCrossfadeSeconds > 0 ? `Überblenden: ${musicCrossfadeSeconds} s 🎚️` : 'Überblenden aus');
  }
}
window.setMusicCrossfadeSeconds = setMusicCrossfadeSeconds;

function syncMusicCrossfadeSelect() {
  const select = document.getElementById('music-crossfade-select');
  if (select) select.value = String(musicCrossfadeSeconds);
  const mobSelect = document.getElementById('mobile-music-crossfade-select');
  if (mobSelect) mobSelect.value = String(musicCrossfadeSeconds);
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncMusicCrossfadeSelect);
  else syncMusicCrossfadeSelect();
}

/** Fully releases an audio element that is no longer needed. */
function releaseMusicElement(el) {
  if (!el) return;
  try {
    el.pause();
    if (el.tagName !== 'VIDEO') {
      el.removeAttribute('src');
      el.load();
    }
  } catch (e) { /* ignore */ }
}

/** Immediately ends a running crossfade (the outgoing track is silenced). */
function finishActiveMusicFade() {
  if (musicActiveFade) musicActiveFade.finish();
  musicActiveFade = null;
}
window.stopMusicCrossfadeTails = finishActiveMusicFade;

/** Equal-power crossfade from `oldEl` to `newEl` over `seconds`. */
function crossfadeMusicElements(oldEl, newEl, seconds) {
  finishActiveMusicFade();
  const durationMs = Math.max(200, seconds * 1000);
  const startedAt = performance.now();
  const oldStartVolume = oldEl ? oldEl.volume : 0;
  let timer = null;
  let done = false;

  const fade = {
    step() {
      if (done) return;
      const t = Math.min(1, (performance.now() - startedAt) / durationMs);
      if (activeUserAudio === newEl) newEl.volume = getMusicTargetVolume() * Math.sin(t * Math.PI / 2);
      if (oldEl) oldEl.volume = Math.max(0, oldStartVolume * Math.cos(t * Math.PI / 2));
      if (t >= 1) fade.finish();
    },
    finish() {
      if (done) return;
      done = true;
      if (timer) clearInterval(timer);
      if (oldEl) {
        oldEl.removeEventListener('timeupdate', fade.step);
        releaseMusicElement(oldEl);
      }
      newEl.removeEventListener('timeupdate', fade.step);
      if (activeUserAudio === newEl) newEl.volume = getMusicTargetVolume();
      if (musicActiveFade === fade) musicActiveFade = null;
    }
  };

  newEl.volume = 0;
  if (oldEl) oldEl.addEventListener('timeupdate', fade.step);
  newEl.addEventListener('timeupdate', fade.step);
  timer = setInterval(fade.step, 50);
  musicActiveFade = fade;
}

/** Chooses the index that should play after the current one. */
function pickNextMusicIndex() {
  const count = playlistTracks.length;
  if (count === 0) return -1;
  if (!isPlayerShuffleEnabled || count === 1) return (currentTrackIndex + 1) % count;

  // Avoid the current track and – where possible – the last few played ones.
  const avoidCount = Math.min(count - 1, Math.max(1, Math.floor(count / 2)));
  const avoid = new Set([currentTrackIndex, ...musicRecentlyPlayed.slice(-avoidCount)]);
  const candidates = [];
  for (let i = 0; i < count; i++) if (!avoid.has(i)) candidates.push(i);
  const pool = candidates.length ? candidates : [...Array(count).keys()].filter(i => i !== currentTrackIndex);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Preloads the upcoming track so the next crossfade can start without delay. */
function prepareUpcomingMusicTrack() {
  if (musicUpcoming && musicUpcoming.el && musicUpcoming.el !== activeUserAudio) releaseMusicElement(musicUpcoming.el);
  musicUpcoming = null;

  const nextIndex = pickNextMusicIndex();
  const track = playlistTracks[nextIndex];
  if (!track || nextIndex === currentTrackIndex) return;
  if (track.isVideo || isVideoFileUrl(track.url, track.name || track.fullName)) return;

  const el = new Audio();
  el.preload = 'auto';
  el.src = track.url;
  musicUpcoming = { index: nextIndex, url: track.url, shuffle: isPlayerShuffleEnabled, el };
}

/** Takes the preloaded element if it matches the requested track. */
function takeUpcomingMusicElement(index, url) {
  if (musicUpcoming && musicUpcoming.index === index && musicUpcoming.url === url) {
    const el = musicUpcoming.el;
    musicUpcoming = null;
    return el;
  }
  return null;
}

/** Attaches progress / auto-advance listeners exactly once per element. */
function attachMusicElementListeners(mediaEl) {
  if (mediaEl._noodleMusicListeners) return;
  mediaEl._noodleMusicListeners = true;

  mediaEl.addEventListener('timeupdate', () => {
    if (activeUserAudio !== mediaEl) return;
    updateMusicProgressUI(mediaEl);

    // Start the crossfade into the next track shortly before this one ends.
    const fadeSec = musicCrossfadeSeconds;
    const duration = mediaEl.duration;
    if (fadeSec <= 0 || !musicCanControlVolume || mediaEl._autoAdvanced || mediaEl.paused) return;
    if (!isFinite(duration) || duration < fadeSec * 2) return;
    if (duration - mediaEl.currentTime > fadeSec) return;
    if (playerRepeatMode === 'off' && !isPlayerShuffleEnabled && currentTrackIndex === playlistTracks.length - 1) return;

    mediaEl._autoAdvanced = true;
    if (playerRepeatMode === 'one') playMusicTrack(currentTrackIndex);
    else playNextMusicTrack();
  });

  mediaEl.addEventListener('ended', () => {
    if (activeUserAudio !== mediaEl || mediaEl._autoAdvanced) return;
    if (playerRepeatMode === 'one') {
      playMusicTrack(currentTrackIndex);
    } else if (playerRepeatMode === 'off' && !isPlayerShuffleEnabled && currentTrackIndex === playlistTracks.length - 1) {
      updateMusicPlayBtnUI(false);
    } else {
      playNextMusicTrack();
    }
  });
}

/**
 * Cues a random track from the music folder (preloaded, not playing), so the
 * player is always ready – and shows a different track on every visit.
 */
function cueRandomMusicTrack() {
  if (!playlistTracks || playlistTracks.length === 0) return;
  if (activeUserAudio && !activeUserAudio._cued) return; // user already started something

  const folderIndices = playlistTracks
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => (t.isLocalFolder || t.isPreloaded) && !(t.isVideo || isVideoFileUrl(t.url, t.name || t.fullName)))
    .map(({ i }) => i);
  const pool = folderIndices.length ? folderIndices : playlistTracks.map((_, i) => i);

  let lastCuedUrl = null;
  try { lastCuedUrl = localStorage.getItem('flow_music_last_cued'); } catch (e) { /* ignore */ }
  const fresh = pool.filter(i => playlistTracks[i].url !== lastCuedUrl);
  const choices = fresh.length ? fresh : pool;
  const index = choices[Math.floor(Math.random() * choices.length)];
  const track = playlistTracks[index];
  if (!track) return;

  if (activeUserAudio && activeUserAudio._cued) releaseMusicElement(activeUserAudio);

  const el = new Audio();
  el.preload = 'auto';
  el.src = track.url;
  el.volume = getMusicTargetVolume();
  el._cued = true;
  el._trackUrl = track.url;
  attachMusicElementListeners(el);

  activeUserAudio = el;
  currentTrackIndex = index;
  try { localStorage.setItem('flow_music_last_cued', track.url); } catch (e) { /* ignore */ }

  updateMusicNowPlayingDisplay();
  renderMusicPlaylist();
}
window.cueRandomMusicTrack = cueRandomMusicTrack;

function playMusicTrack(index) {
  if (playlistTracks.length === 0) return;
  if (index < 0 || index >= playlistTracks.length) index = 0;
  currentTrackIndex = index;

  const track = playlistTracks[currentTrackIndex];
  const isVideo = track.isVideo || isVideoFileUrl(track.url, track.name || track.fullName);

  const previousEl = activeUserAudio;
  const previousWasPlaying = !!(previousEl && !previousEl.paused && !previousEl.ended);
  const previousIsVideo = !!(previousEl && previousEl.tagName === 'VIDEO');
  const shouldCrossfade = previousWasPlaying && musicCrossfadeSeconds > 0 && musicCanControlVolume
    && !isVideo && !previousIsVideo;

  // Re-use the cued / preloaded element when it already holds this track.
  let reusedEl = null;
  if (previousEl && previousEl._cued && previousEl._trackUrl === track.url && !isVideo) reusedEl = previousEl;
  if (!reusedEl && !isVideo) reusedEl = takeUpcomingMusicElement(index, track.url);

  if (previousEl && !shouldCrossfade && previousEl !== reusedEl) {
    finishActiveMusicFade();
    try {
      previousEl.pause();
      previousEl.src = '';
    } catch(e) {}
  }

  // Exklusivität: Ambient & Radio still beenden, wenn Musik startet
  try {
    if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
    if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.stopRadioPlayback === 'function') {
      RadioNewsEngine.stopRadioPlayback();
    } else if (typeof window !== 'undefined' && window.radioAudioEl && !window.radioAudioEl.paused) {
      window.radioAudioEl.pause();
      window.isRadioPlaying = false;
    }
  } catch(e) {}

  let mediaEl;
  const videoEl = document.getElementById('media-video-element');

  if (isVideo && videoEl) {
    videoEl.src = track.url;
    mediaEl = videoEl;
  } else if (reusedEl) {
    mediaEl = reusedEl;
  } else {
    mediaEl = new Audio(track.url);
  }
  mediaEl._cued = false;
  mediaEl._autoAdvanced = false;
  mediaEl._trackUrl = track.url;
  if (mediaEl === previousEl) {
    try { mediaEl.currentTime = 0; } catch (e) { /* not seekable yet */ }
  }

  const speedSelect = document.getElementById('media-speed-select');
  if (speedSelect && speedSelect.value) {
    mediaEl.playbackRate = parseFloat(speedSelect.value) || 1.0;
  }

  mediaEl.volume = getMusicTargetVolume();
  activeUserAudio = mediaEl;
  attachMusicElementListeners(mediaEl);

  if (shouldCrossfade && previousEl !== mediaEl) {
    crossfadeMusicElements(previousEl, mediaEl, musicCrossfadeSeconds);
  }

  musicRecentlyPlayed.push(index);
  if (musicRecentlyPlayed.length > 50) musicRecentlyPlayed.shift();

  updateMediaScreenDisplay(isVideo, mediaEl);

  mediaEl.play().then(() => {
    if (activeUserAudio !== mediaEl) return;
    updateMusicPlayBtnUI(true);
    updateMusicNowPlayingDisplay();
    renderMusicPlaylist();
    startAudioVisualizerLoop();
    prepareUpcomingMusicTrack();
    if (typeof updateMiniAudioPlayer === 'function') {
      updateMiniAudioPlayer({
        isPlaying: true,
        title: track.name || track.fullName || 'Track',
        sub: 'Musik & Medien',
        emoji: isVideo ? '🎬' : '🎶',
        source: 'music'
      });
    }
  }).catch(err => {
    console.warn('[AudioPlayer] Playback attempt error:', err);
    if (activeUserAudio !== mediaEl) return;
    finishActiveMusicFade();
    updateMusicPlayBtnUI(false);
    if (typeof updateMiniAudioPlayer === 'function') {
      updateMiniAudioPlayer({ isPlaying: false, sub: 'Pausiert', source: 'music' });
    }
  });
}
window.playMusicTrack = playMusicTrack;
window.playTrack = playMusicTrack;

function pauseMusicTrack() {
  finishActiveMusicFade();
  if (activeUserAudio && !activeUserAudio.paused) {
    activeUserAudio.pause();
    updateMusicPlayBtnUI(false);
    renderMusicPlaylist();
    const currentTrack = (playlistTracks && playlistTracks[currentTrackIndex]) || null;
    if (typeof updateMiniAudioPlayer === 'function') {
      updateMiniAudioPlayer({
        isPlaying: false,
        title: currentTrack ? (currentTrack.name || currentTrack.fullName) : 'Musik',
        sub: 'Pausiert',
        emoji: '🎶',
        source: 'music'
      });
    }
  }
}
window.pauseMusicTrack = pauseMusicTrack;

function stopMusicTrack() {
  finishActiveMusicFade();
  if (activeUserAudio) {
    try {
      activeUserAudio.pause();
      activeUserAudio.currentTime = 0;
    } catch(e) {}
    updateMusicPlayBtnUI(false);
    renderMusicPlaylist();
    const currentTrack = (playlistTracks && playlistTracks[currentTrackIndex]) || null;
    if (typeof updateMiniAudioPlayer === 'function') {
      updateMiniAudioPlayer({
        isPlaying: false,
        title: currentTrack ? (currentTrack.name || currentTrack.fullName) : 'Musik',
        sub: 'Gestoppt',
        emoji: '🎶',
        source: 'music'
      });
    }
  }
}
window.stopMusicTrack = stopMusicTrack;

function toggleMusicPlayback() {
  // A cued (preloaded but never started) track goes through the full start path.
  if (!activeUserAudio || activeUserAudio._cued) {
    if (playlistTracks.length > 0) playMusicTrack(currentTrackIndex);
    return;
  }

  if (activeUserAudio.paused) {
    activeUserAudio.play().then(() => {
      updateMusicPlayBtnUI(true);
      renderMusicPlaylist();
      const currentTrack = playlistTracks[currentTrackIndex];
      if (typeof updateMiniAudioPlayer === 'function') {
        updateMiniAudioPlayer({
          isPlaying: true,
          title: currentTrack ? (currentTrack.name || currentTrack.fullName) : 'Musik',
          sub: 'Musik & Medien',
          emoji: '🎶',
          source: 'music'
        });
      }
    }).catch(e => console.warn(e));
  } else {
    finishActiveMusicFade();
    activeUserAudio.pause();
    updateMusicPlayBtnUI(false);
    renderMusicPlaylist();
    const currentTrack = playlistTracks[currentTrackIndex];
    if (typeof updateMiniAudioPlayer === 'function') {
      updateMiniAudioPlayer({
        isPlaying: false,
        title: currentTrack ? (currentTrack.name || currentTrack.fullName) : 'Musik',
        sub: 'Pausiert',
        emoji: '🎶',
        source: 'music'
      });
    }
  }
}
window.toggleMusicPlayback = toggleMusicPlayback;
window.togglePlaylistPlayback = toggleMusicPlayback;

/** Skips to the next track – fading over if something is playing. */
function playNextMusicTrack() {
  if (playlistTracks.length === 0) return;
  // Prefer the track that is already preloaded in the background (instant blend).
  const upcoming = musicUpcoming;
  const upcomingStillValid = upcoming
    && upcoming.shuffle === isPlayerShuffleEnabled
    && playlistTracks[upcoming.index]
    && playlistTracks[upcoming.index].url === upcoming.url
    && upcoming.index !== currentTrackIndex;
  const nextIndex = upcomingStillValid ? upcoming.index : pickNextMusicIndex();
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
  const mobBtn = document.getElementById('mobile-music-btn-shuffle');
  if (mobBtn) {
    mobBtn.className = isPlayerShuffleEnabled
      ? 'p-1 px-2 rounded-lg text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/50 flex items-center gap-1 active:scale-95 shadow-xs'
      : 'p-1 px-2 rounded-lg text-[10px] bg-white/5 text-gray-400 border border-white/10 flex items-center gap-1 active:scale-95';
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
  const mobBtn = document.getElementById('mobile-music-play-btn');
  if (mobBtn) {
    mobBtn.innerHTML = isPlaying
      ? '<i data-lucide="pause" class="w-4 h-4"></i>'
      : '<i data-lucide="play" class="w-4 h-4 ml-0.5"></i>';
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
  const mobTitleEl = document.getElementById('mobile-music-now-playing-title');
  if (mobTitleEl) {
    mobTitleEl.innerText = track ? track.name : 'Kein Track geladen';
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

// WebAudio EQ Nodes & Gain chain for Deck A & B
var djAudioNodes = {
  a: { source: null, lowNode: null, midNode: null, highNode: null, gainNode: null },
  b: { source: null, lowNode: null, midNode: null, highNode: null, gainNode: null }
};

function setupDjAudioNodes(deckId) {
  // Direkte, zuverlässige HTML5-Audiowiedergabe ohne CORS-bedingte WebAudio-Stille
  applyDjVolumes();
}
window.setupDjAudioNodes = setupDjAudioNodes;

function initDjDecks() {
  updateDjPresetDropdowns();
  if (!djDecks.a.track || !djDecks.b.track) {
    loadDjRandomPair(false);
  }
  setDjCrossfader(0.5);
  updateDjDeckUI('a');
  updateDjDeckUI('b');
  renderDjWaveformMarkers('a');
  renderDjWaveformMarkers('b');
}
window.initDjDecks = initDjDecks;

function loadDjRandomPair(playIfRunning = false) {
  if (!BUILTIN_DJ_STEMS || BUILTIN_DJ_STEMS.length === 0) return;
  const count = BUILTIN_DJ_STEMS.length;
  const idxA = Math.floor(Math.random() * count);
  let idxB = (idxA + 1 + Math.floor(Math.random() * (count - 1))) % count;

  loadDjBuiltinTrack('a', BUILTIN_DJ_STEMS[idxA].id, false, playIfRunning && djDecks.a.isPlaying);
  loadDjBuiltinTrack('b', BUILTIN_DJ_STEMS[idxB].id, false, playIfRunning && djDecks.b.isPlaying);

  const selA = document.getElementById('dj-preset-select-a');
  if (selA) selA.value = BUILTIN_DJ_STEMS[idxA].id;
  const selB = document.getElementById('dj-preset-select-b');
  if (selB) selB.value = BUILTIN_DJ_STEMS[idxB].id;
}
window.loadDjRandomPair = loadDjRandomPair;

function loadDjBuiltinTrack(deckId, presetKey, notify = true, startPlaying = false) {
  const deck = djDecks[deckId];
  if (!deck) return;

  const stem = BUILTIN_DJ_STEMS.find(s => s.id === presetKey) || BUILTIN_DJ_STEMS[0];
  if (!stem) return;

  if (deck.audio) {
    try { deck.audio.pause(); } catch(e) {}
  }
  if (deck.track && deck.track.url && String(deck.track.url).startsWith('blob:')) {
    try { URL.revokeObjectURL(deck.track.url); } catch(e) {}
  }

  const track = {
    id: stem.id,
    url: stem.file,
    name: stem.name,
    fullName: stem.name,
    isBuiltin: true
  };

  deck.track = track;
  deck.bpm = stem.bpm || 120;
  deck.cueTime = 0;
  deck.hotCues = [null, null, null, null];
  deck.loopActive = false;
  
  const audio = new Audio(track.url);
  audio.loop = true;
  audio.playbackRate = deck.pitch;

  deck.audio = audio;

  bindDjAudioEvents(deckId);
  updateDjDeckUI(deckId);
  renderDjWaveformMarkers(deckId);
  applyDjVolumes();

  const sel = document.getElementById(`dj-preset-select-${deckId}`);
  if (sel) sel.value = stem.id;

  if (startPlaying) {
    audio.play().then(() => {
      deck.isPlaying = true;
      updateDjPlayBtnUI(deckId, true);
    }).catch(() => {});
  } else {
    deck.isPlaying = false;
    updateDjPlayBtnUI(deckId, false);
  }

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
  deck.cueTime = 0;
  deck.hotCues = [null, null, null, null];
  deck.loopActive = false;
  deck.audio = new Audio(track.url);
  deck.audio.playbackRate = deck.pitch;

  bindDjAudioEvents(deckId);
  updateDjDeckUI(deckId);
  renderDjWaveformMarkers(deckId);
  applyDjVolumes();

  showToast(`Deck ${deckId.toUpperCase()}: "${track.name}" geladen! 🎛️💾`);
  event.target.value = '';
}
window.handleDjDeckUpload = handleDjDeckUpload;

function bindDjAudioEvents(deckId) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;

  deck.audio.addEventListener('loadedmetadata', () => {
    const timeEl = document.getElementById(`dj-time-deck-${deckId}`);
    if (timeEl) timeEl.innerText = `${formatAudioTime(deck.audio.currentTime)} / ${formatAudioTime(deck.audio.duration)}`;
    renderDjWaveformMarkers(deckId);
  });

  deck.audio.addEventListener('timeupdate', () => {
    if (!deck.audio || !deck.audio.duration) return;

    if (deck.loopActive && deck.loopEnd > deck.loopStart && deck.audio.currentTime >= deck.loopEnd) {
      deck.audio.currentTime = deck.loopStart;
    }

    deck.jogRotation = (deck.jogRotation + 2.5) % 360;
    const jog = document.getElementById(`dj-jog-${deckId}`);
    if (jog && deck.isPlaying) {
      jog.style.transform = `rotate(${deck.jogRotation}deg)`;
    }

    const cur = deck.audio.currentTime;
    const dur = deck.audio.duration;
    const pct = dur ? (cur / dur) * 100 : 0;

    const timeEl = document.getElementById(`dj-time-deck-${deckId}`);
    if (timeEl) timeEl.innerText = `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`;
    
    const seekSlider = document.getElementById(`dj-seek-deck-${deckId}`);
    if (seekSlider) seekSlider.value = pct;

    const playhead = document.getElementById(`dj-playhead-${deckId}`);
    if (playhead) playhead.style.left = `${pct}%`;

    const progressTint = document.getElementById(`dj-wave-progress-${deckId}`);
    if (progressTint) progressTint.style.width = `${pct}%`;

    if (djAutomix.enabled && !djAutomix.isTransitioning && deck.isPlaying) {
      const remain = dur - cur;
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

function handleDjWaveformClick(deckId, event) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio || !deck.audio.duration) return;
  const wrap = document.getElementById(`dj-waveform-wrap-${deckId}`);
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  deck.audio.currentTime = ratio * deck.audio.duration;
}
window.handleDjWaveformClick = handleDjWaveformClick;

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
    pitchEl.innerText = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}% (Reset)`;
  }
}

function updateDjPlayBtnUI(deckId, isPlaying) {
  const btn = document.getElementById(`dj-play-btn-${deckId}`);
  const waveformEl = document.getElementById(`dj-waveform-deck-${deckId}`);
  const isDeckA = deckId === 'a';

  if (waveformEl) {
    if (isPlaying) {
      waveformEl.classList.add('dj-wave-playing');
    } else {
      waveformEl.classList.remove('dj-wave-playing');
    }
  }

  const jog = document.getElementById(`dj-jog-${deckId}`);
  if (jog) {
    if (isPlaying) jog.classList.remove('dj-vinyl-paused');
    else jog.classList.add('dj-vinyl-paused');
  }

  if (btn) {
    if (isPlaying) {
      btn.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5 fill-black"></i><span class="font-black">PAUSE</span>`;
      btn.className = isDeckA
        ? 'flex-1 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-[11px] cursor-pointer shadow-[0_0_16px_rgba(6,182,212,0.5)] transition flex items-center justify-center gap-1 active:scale-95 ring-2 ring-cyan-300'
        : 'flex-1 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-xl text-[11px] cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.5)] transition flex items-center justify-center gap-1 active:scale-95 ring-2 ring-amber-300';
    } else {
      btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-black"></i><span class="font-black">PLAY</span>`;
      btn.className = isDeckA
        ? 'flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-[11px] cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] transition flex items-center justify-center gap-1 active:scale-95'
        : 'flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-[11px] cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] transition flex items-center justify-center gap-1 active:scale-95';
    }
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}

function toggleDjDeckPlayback(deckId) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) {
    loadDjRandomPair(false);
    return;
  }

  applyDjVolumes();

  if (deck.audio.paused) {
    if (typeof initAudioContext === 'function') initAudioContext();
    if (deck.audio.volume === 0 && (typeof isPlayerMuted === 'undefined' || !isPlayerMuted)) {
      applyDjVolumes();
      if (deck.audio.volume === 0) deck.audio.volume = 0.5;
    }
    deck.audio.play().then(() => {
      deck.isPlaying = true;
      updateDjPlayBtnUI(deckId, true);
      if (typeof updateMiniAudioPlayer === 'function') {
        updateMiniAudioPlayer({
          isPlaying: true,
          title: (deck.track ? (deck.track.name || deck.track.title) : 'Deck ' + deckId.toUpperCase()),
          sub: `Noodle DJ (${deck.bpm} BPM)`,
          emoji: '🎧',
          source: 'dj'
        });
      }
      if (typeof updateHeaderSoundBtnUI === 'function') {
        updateHeaderSoundBtnUI();
      }
    }).catch(e => {
      console.warn('[NoodleDJ] Playback error:', e);
    });
  } else {
    deck.audio.pause();
    deck.isPlaying = false;
    updateDjPlayBtnUI(deckId, false);
    if (typeof updateMiniAudioPlayer === 'function') {
      const otherDeck = djDecks[deckId === 'a' ? 'b' : 'a'];
      if (!otherDeck || !otherDeck.isPlaying) {
        updateMiniAudioPlayer({ isPlaying: false, sub: 'DJ Pausiert' });
      }
    }
    if (typeof updateHeaderSoundBtnUI === 'function') {
      updateHeaderSoundBtnUI();
    }
  }
}
window.toggleDjDeckPlayback = toggleDjDeckPlayback;

function pauseDjDeck(deckId) {
  const deck = djDecks[deckId];
  if (deck && deck.audio && !deck.audio.paused) {
    deck.audio.pause();
    deck.isPlaying = false;
    updateDjPlayBtnUI(deckId, false);
    if (typeof updateHeaderSoundBtnUI === 'function') {
      updateHeaderSoundBtnUI();
    }
  }
}
window.pauseDjDeck = pauseDjDeck;

function setDjMainCue(deckId, event) {
  if (event) event.preventDefault();
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  deck.cueTime = deck.audio.currentTime;
  renderDjWaveformMarkers(deckId);
  playDjSfx('cue_click');
  showToast(`Deck ${deckId.toUpperCase()}: CUE-Punkt bei ${formatAudioTime(deck.cueTime)} gesetzt! 📍`);
}
window.setDjMainCue = setDjMainCue;

function cueDjDeck(deckId) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  if (!deck.isPlaying) {
    deck.cueTime = deck.audio.currentTime;
    renderDjWaveformMarkers(deckId);
    showToast(`Deck ${deckId.toUpperCase()}: CUE-Punkt bei ${formatAudioTime(deck.cueTime)} gesetzt 📍`);
  } else {
    deck.audio.currentTime = deck.cueTime || 0;
    deck.audio.pause();
    deck.isPlaying = false;
    updateDjPlayBtnUI(deckId, false);
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

function resetDjPitch(deckId) {
  const slider = document.getElementById(`dj-pitch-slider-${deckId}`);
  if (slider) slider.value = 0;
  setDjPitch(deckId, 0);
}
window.resetDjPitch = resetDjPitch;

function nudgeDjPitch(deckId, delta) {
  const slider = document.getElementById(`dj-pitch-slider-${deckId}`);
  if (!slider) return;
  let cur = parseFloat(slider.value) || 0;
  cur = Math.max(-8, Math.min(8, cur + delta));
  slider.value = cur.toFixed(1);
  setDjPitch(deckId, cur);
}
window.nudgeDjPitch = nudgeDjPitch;

// 2 NORMAL SOUNDREGLER (CHANNEL VOLUME FADERS)
function setDjDeckVolume(deckId, val) {
  const deck = djDecks[deckId];
  if (!deck) return;
  deck.volume = Math.max(0, Math.min(1, parseFloat(val)));

  const valEl = document.getElementById(`dj-vol-val-${deckId}`);
  if (valEl) valEl.innerText = `${Math.round(deck.volume * 100)}%`;

  applyDjVolumes();
}
window.setDjDeckVolume = setDjDeckVolume;

// SIMPLIFIED, USER-FRIENDLY EQ (BASS / MITTEN / HÖHEN)
function setDjEq(deckId, type, val) {
  const deck = djDecks[deckId];
  if (!deck) return;
  const gain = parseFloat(val); // 0 .. 2 (1 = neutral)
  if (type === 'low') deck.low = gain;
  if (type === 'mid') deck.mid = gain;
  if (type === 'high') deck.high = gain;

  const db = Math.round((gain - 1.0) * 12);
  const dbStr = `${db > 0 ? '+' : ''}${db} dB`;
  const lbl = document.getElementById(`dj-eq-val-${deckId}-${type}`);
  if (lbl) lbl.innerText = db === 0 ? '0 dB' : dbStr;

  const nodes = djAudioNodes[deckId];
  if (nodes) {
    if (type === 'low' && nodes.lowNode) nodes.lowNode.gain.value = db;
    if (type === 'mid' && nodes.midNode) nodes.midNode.gain.value = db;
    if (type === 'high' && nodes.highNode) nodes.highNode.gain.value = db;
  }
}
window.setDjEq = setDjEq;

function resetDjEq(deckId) {
  const deck = djDecks[deckId];
  if (!deck) return;
  deck.low = 1.0;
  deck.mid = 1.0;
  deck.high = 1.0;

  ['low', 'mid', 'high'].forEach(band => {
    const slider = document.getElementById(`dj-eq-${deckId}-${band}`);
    if (slider) slider.value = 1.0;
    const lbl = document.getElementById(`dj-eq-val-${deckId}-${band}`);
    if (lbl) lbl.innerText = '0 dB';
  });

  const nodes = djAudioNodes[deckId];
  if (nodes) {
    if (nodes.lowNode) nodes.lowNode.gain.value = 0;
    if (nodes.midNode) nodes.midNode.gain.value = 0;
    if (nodes.highNode) nodes.highNode.gain.value = 0;
  }
  showToast(`Deck ${deckId.toUpperCase()}: EQ zurückgesetzt (Neutral) 🎚️`);
}
window.resetDjEq = resetDjEq;

var currentDjCrossfaderPos = 0.5;

function applyDjVolumes() {
  const x = Math.max(0, Math.min(1, parseFloat(currentDjCrossfaderPos) || 0.5));
  // Equal-Power Crossfader Curve (Constant acoustic energy across transition)
  const gainA = Math.cos(x * 0.5 * Math.PI);
  const gainB = Math.sin(x * 0.5 * Math.PI);

  const isMuted = (typeof isPlayerMuted !== 'undefined' && Boolean(isPlayerMuted));
  const master = isMuted ? 0 : ((typeof soundMasterVolume === 'number') ? soundMasterVolume : 0.5);

  const volA = Math.max(0, Math.min(1, gainA * (djDecks.a?.volume ?? 1.0) * master));
  const volB = Math.max(0, Math.min(1, gainB * (djDecks.b?.volume ?? 1.0) * master));

  if (djDecks.a && djDecks.a.audio) {
    try {
      djDecks.a.audio.volume = volA;
      djDecks.a.audio.muted = isMuted;
    } catch (e) {}
  }

  if (djDecks.b && djDecks.b.audio) {
    try {
      djDecks.b.audio.volume = volB;
      djDecks.b.audio.muted = isMuted;
    } catch (e) {}
  }

  if (djAudioNodes && djAudioNodes.a && djAudioNodes.a.gainNode) {
    try { djAudioNodes.a.gainNode.gain.value = volA; } catch (e) {}
  }
  if (djAudioNodes && djAudioNodes.b && djAudioNodes.b.gainNode) {
    try { djAudioNodes.b.gainNode.gain.value = volB; } catch (e) {}
  }
}
window.applyDjVolumes = applyDjVolumes;

function setDjCrossfader(val) {
  currentDjCrossfaderPos = parseFloat(val);
  applyDjVolumes();

  const slider = document.getElementById('dj-crossfader-slider');
  if (slider && Math.abs(parseFloat(slider.value) - currentDjCrossfaderPos) > 0.005) {
    slider.value = currentDjCrossfaderPos;
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
    led.className = djAutomix.enabled ? 'w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'w-1.5 h-1.5 rounded-full bg-zinc-600';
  }
  if (txt) {
    txt.textContent = djAutomix.enabled ? 'ACTIVE' : 'OFF';
  }
  showToast(djAutomix.enabled ? 'Automix Aktiviert! 🎛️⚡ Nahtloser Übergang' : 'Automix Deaktiviert');
}
window.toggleDjAutomix = toggleDjAutomix;

function setDjAutomixDuration(sec) {
  djAutomix.durationSec = parseInt(sec, 10) || 8;
}
window.setDjAutomixDuration = setDjAutomixDuration;

function triggerDjAutomixNow() {
  if (djAutomix.isTransitioning) return;
  djAutomix.isTransitioning = true;

  const currentPos = currentDjCrossfaderPos;
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

// 100% FUNKTIONALER SHUFFLE BUTTON: Lädt 2 frische unterschiedliche Tracks
function djShuffleTracks() {
  if (!BUILTIN_DJ_STEMS || BUILTIN_DJ_STEMS.length === 0) return;
  const wasPlayingA = djDecks.a.isPlaying;
  const wasPlayingB = djDecks.b.isPlaying;

  const count = BUILTIN_DJ_STEMS.length;
  const curA = djDecks.a.track?.id;
  const curB = djDecks.b.track?.id;

  let poolA = BUILTIN_DJ_STEMS.filter(s => s.id !== curA && s.id !== curB);
  if (poolA.length === 0) poolA = BUILTIN_DJ_STEMS;
  const pickA = poolA[Math.floor(Math.random() * poolA.length)];

  let poolB = BUILTIN_DJ_STEMS.filter(s => s.id !== pickA.id && s.id !== curB);
  if (poolB.length === 0) poolB = BUILTIN_DJ_STEMS.filter(s => s.id !== pickA.id);
  if (poolB.length === 0) poolB = BUILTIN_DJ_STEMS;
  const pickB = poolB[Math.floor(Math.random() * poolB.length)];

  loadDjBuiltinTrack('a', pickA.id, false, wasPlayingA);
  loadDjBuiltinTrack('b', pickB.id, false, wasPlayingB);

  const selA = document.getElementById('dj-preset-select-a');
  if (selA) selA.value = pickA.id;
  const selB = document.getElementById('dj-preset-select-b');
  if (selB) selB.value = pickB.id;

  showToast(`Zufalls-Tracks geladen: "${pickA.name}" & "${pickB.name}" 🎲🔀`);
}
window.djShuffleTracks = djShuffleTracks;

// ============================================================================
// 6. HOT CUES, LOOPS & WAVEFORM MARKERS
// ============================================================================

function renderDjWaveformMarkers(deckId) {
  const container = document.getElementById(`dj-waveform-markers-${deckId}`);
  const deck = djDecks[deckId];
  if (!container || !deck || !deck.audio) return;

  const duration = deck.audio.duration;
  let html = '';

  // 1. Main CUE Marker
  if (deck.cueTime && duration && deck.cueTime > 0) {
    const pct = Math.max(0, Math.min(100, (deck.cueTime / duration) * 100));
    html += `
      <div class="dj-wave-cue-marker absolute top-0 bottom-0 pointer-events-none" style="left: ${pct}%;">
        <div class="w-[1.5px] h-full bg-amber-400"></div>
        <div class="absolute -top-0.5 -translate-x-1/2 px-1 py-0.2 rounded bg-amber-500 text-black text-[7px] font-black font-mono shadow">CUE</div>
      </div>
    `;
  }

  // 2. Hot Cues (0 and 1)
  deck.hotCues.forEach((time, idx) => {
    if (time !== null && duration && time >= 0) {
      const pct = Math.max(0, Math.min(100, (time / duration) * 100));
      const colorClass = deckId === 'a' ? 'bg-cyan-400 text-black' : 'bg-amber-400 text-black';
      const borderClass = deckId === 'a' ? 'bg-cyan-400' : 'bg-amber-400';
      html += `
        <div class="dj-wave-hotcue-marker absolute top-0 bottom-0 pointer-events-none" style="left: ${pct}%;">
          <div class="w-[1.5px] h-full ${borderClass}"></div>
          <div class="absolute bottom-0 -translate-x-1/2 px-1 py-0.2 rounded ${colorClass} text-[7px] font-black font-mono shadow">C${idx + 1}</div>
        </div>
      `;
    }
  });

  // 3. Active Loop Region
  if (deck.loopActive && duration && deck.loopEnd > deck.loopStart) {
    const startPct = Math.max(0, Math.min(100, (deck.loopStart / duration) * 100));
    const endPct = Math.max(0, Math.min(100, (deck.loopEnd / duration) * 100));
    const widthPct = Math.max(1, endPct - startPct);
    html += `
      <div class="absolute inset-y-0 bg-emerald-500/25 border-x border-emerald-400 pointer-events-none flex items-center justify-center" style="left: ${startPct}%; width: ${widthPct}%;">
        <span class="text-[7.5px] font-mono font-bold text-emerald-200 bg-black/75 px-1 rounded border border-emerald-500/40">${deck.loopLength}B LOOP</span>
      </div>
    `;
  }

  container.innerHTML = html;
}
window.renderDjWaveformMarkers = renderDjWaveformMarkers;

function setDjHotCue(deckId, index) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  deck.hotCues[index] = deck.audio.currentTime;
  
  const pad = document.getElementById(`dj-hotcue-btn-${deckId}-${index}`);
  if (pad) {
    pad.classList.add('bg-cyan-500/30', 'border-cyan-400', 'text-white');
  }
  renderDjWaveformMarkers(deckId);
  playDjSfx('cue_click');
  showToast(`Deck ${deckId.toUpperCase()}: CUE ${index + 1} bei ${formatAudioTime(deck.audio.currentTime)} gesetzt! 📍`);
}
window.setDjHotCue = setDjHotCue;

function clearSingleDjHotCue(deckId, index, event) {
  if (event) event.preventDefault();
  const deck = djDecks[deckId];
  if (!deck) return;
  deck.hotCues[index] = null;
  const pad = document.getElementById(`dj-hotcue-btn-${deckId}-${index}`);
  if (pad) {
    pad.classList.remove('bg-cyan-500/30', 'border-cyan-400', 'text-white');
  }
  renderDjWaveformMarkers(deckId);
  showToast(`Deck ${deckId.toUpperCase()}: CUE ${index + 1} gelöscht`);
}
window.clearSingleDjHotCue = clearSingleDjHotCue;

function clearDjHotCues(deckId) {
  const deck = djDecks[deckId];
  if (!deck) return;
  deck.hotCues = [null, null, null, null];
  [0, 1].forEach(idx => {
    const pad = document.getElementById(`dj-hotcue-btn-${deckId}-${idx}`);
    if (pad) pad.classList.remove('bg-cyan-500/30', 'border-cyan-400', 'text-white');
  });
  renderDjWaveformMarkers(deckId);
  showToast(`Deck ${deckId.toUpperCase()}: Alle CUEs zurückgesetzt`);
}
window.clearDjHotCues = clearDjHotCues;

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

  const isCurrentLengthActive = deck.loopActive && deck.loopLength === beats;
  deck.loopActive = !isCurrentLengthActive;
  deck.loopLength = beats;

  if (deck.loopActive) {
    deck.loopStart = deck.audio.currentTime;
    const beatDuration = 60 / (deck.bpm * deck.pitch);
    deck.loopEnd = deck.loopStart + (beatDuration * beats);
  }

  [4, 8].forEach(b => {
    const btn = document.getElementById(`dj-loop-btn-${deckId}-${b}`);
    if (btn) {
      const active = deck.loopActive && deck.loopLength === b;
      btn.classList.toggle('bg-emerald-500/35', active);
      btn.classList.toggle('border-emerald-400', active);
      btn.classList.toggle('text-emerald-200', active);
    }
  });

  const stateLabel = document.getElementById(`dj-loop-state-${deckId}`);
  if (stateLabel) {
    stateLabel.innerText = deck.loopActive ? `${beats}B AN` : 'AUS';
    stateLabel.className = deck.loopActive ? 'text-[8px] font-mono font-bold text-emerald-400' : 'text-[8px] font-mono text-zinc-500';
  }

  renderDjWaveformMarkers(deckId);
  showToast(`Deck ${deckId.toUpperCase()}: ${beats}-Beat Loop ${deck.loopActive ? 'Aktiv 🔁' : 'Aus'}`);
}
window.toggleDjLoop = toggleDjLoop;

function handleDjJogTouch(deckId, delta) {
  const deck = djDecks[deckId];
  if (!deck || !deck.audio) return;
  deck.audio.currentTime = Math.max(0, deck.audio.currentTime + delta * 0.05);
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

  if (type === 'scratch_mini') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(3, now);

    const vol = 0.12 * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
    osc.start(now);
    osc.stop(now + 0.14);
  } else if (type === 'cue_click') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.15 * (soundMasterVolume || 0.5), now);
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
  const djPanel = document.getElementById('panel-audio');
  if (!djPanel || djPanel.classList.contains('hidden')) return;

  const vuA = document.getElementById('dj-vu-meter-a');
  const vuB = document.getElementById('dj-vu-meter-b');
  
  if (djDecks.a && djDecks.a.isPlaying && vuA) {
    const h = 25 + Math.random() * 60;
    vuA.style.height = (h * (djDecks.a.volume ?? 1)) + '%';
  } else if (vuA) {
    vuA.style.height = '10%';
  }

  if (djDecks.b && djDecks.b.isPlaying && vuB) {
    const h = 25 + Math.random() * 60;
    vuB.style.height = (h * (djDecks.b.volume ?? 1)) + '%';
  } else if (vuB) {
    vuB.style.height = '10%';
  }
}
if (typeof window !== 'undefined') {
  setInterval(updateDjVuMeters, 250);
}

// ============================================================================
// NOODLE PERSISTENT MINI AUDIO PLAYER ENGINE (BOTTOM-LEFT)
// ============================================================================
var currentActiveAudioSource = null; // 'ambient' | 'dj' | 'music' | 'radio' | 'tts' | null
var isMiniPlayerPlaying = false;
var miniPlayerCurrentInfo = {
  title: 'Ambient Sound',
  sub: 'Aktiv',
  emoji: '🎵',
  source: null
};

function getNoodleSoundDisplayName(type) {
  const names = {
    piano: 'Sanftes Piano',
    lofi: 'Lofi Chords',
    jazz_piano: 'Jazz Voicings',
    rhodes: 'Fender Rhodes',
    guitar: 'Akustik-Gitarre',
    hypnotic_riff: 'Hypnotic Riff',
    singingbowl: 'Klangschale',
    chimes: 'Windspiel',
    musicbox: 'Spieluhr',
    campfire: 'Kaminfeuer',
    birds: 'Waldvögel',
    breeze: 'Blättersäuseln',
    cafe: 'Cozy Café',
    clock: 'Pendeluhr',
    space: 'Cosmic Ambient',
    techno: 'Techno 128',
    dnb: 'Drum & Bass',
    afrobeats: 'Afrobeats',
    swing: 'Swing & Jazz',
    boombap: 'Boom-Bap',
    bossa_nova: 'Bossa Nova'
  };
  return names[type] || type || 'Ambient Sound';
}
window.getNoodleSoundDisplayName = getNoodleSoundDisplayName;

function updateMiniAudioPlayer(info) {
  if (typeof document === 'undefined') return;
  const playerEl = document.getElementById('noodle-mini-audio-player');
  if (!playerEl) return;

  if (info && info.hide) {
    playerEl.classList.add('hidden');
    isMiniPlayerPlaying = false;
    currentActiveAudioSource = null;
    return;
  }

  if (info) {
    if (info.title) miniPlayerCurrentInfo.title = info.title;
    if (info.sub) miniPlayerCurrentInfo.sub = info.sub;
    if (info.emoji) miniPlayerCurrentInfo.emoji = info.emoji;
    if (info.source) {
      miniPlayerCurrentInfo.source = info.source;
      currentActiveAudioSource = info.source;
    }
    isMiniPlayerPlaying = info.isPlaying !== undefined ? Boolean(info.isPlaying) : true;
  }

  // Update UI Elements
  playerEl.classList.remove('hidden');
  const titleEl = document.getElementById('mini-player-track-title');
  const subEl = document.getElementById('mini-player-track-sub');
  const emojiEl = document.getElementById('mini-player-source-emoji');
  const playBtn = document.getElementById('mini-player-playpause-btn');
  const eqAnim = document.getElementById('mini-player-eq-anim');

  if (titleEl && miniPlayerCurrentInfo.title) titleEl.textContent = miniPlayerCurrentInfo.title;
  if (subEl && miniPlayerCurrentInfo.sub) subEl.textContent = miniPlayerCurrentInfo.sub;
  if (emojiEl && miniPlayerCurrentInfo.emoji) emojiEl.textContent = miniPlayerCurrentInfo.emoji;

  if (playBtn) {
    playBtn.innerHTML = isMiniPlayerPlaying 
      ? '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>' 
      : '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    playBtn.title = isMiniPlayerPlaying ? 'Pause' : 'Fortsetzen';
  }

  if (eqAnim) {
    if (isMiniPlayerPlaying) eqAnim.classList.remove('opacity-30');
    else eqAnim.classList.add('opacity-30');
  }
}
window.updateMiniAudioPlayer = updateMiniAudioPlayer;

function toggleMiniPlayerPlayback() {
  if (!currentActiveAudioSource) {
    if (typeof playAmbientSound === 'function') {
      playAmbientSound(window.lastSelectedSound || 'piano');
    }
    return;
  }

  if (currentActiveAudioSource === 'ambient') {
    if (typeof currentSoundType !== 'undefined' && currentSoundType) {
      const savedType = currentSoundType;
      window._pausedAmbientSound = savedType;
      if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
      updateMiniAudioPlayer({
        isPlaying: false,
        title: getNoodleSoundDisplayName(savedType),
        sub: 'Pausiert',
        emoji: '⏸️',
        source: 'ambient'
      });
    } else if (window._pausedAmbientSound) {
      playAmbientSound(window._pausedAmbientSound);
    } else {
      playAmbientSound(window.lastSelectedSound || 'piano');
    }
  } else if (currentActiveAudioSource === 'radio') {
    if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleRadioPlayback === 'function') {
      RadioNewsEngine.toggleRadioPlayback();
    } else if (typeof window.toggleRadioPlayback === 'function') {
      window.toggleRadioPlayback();
    }
  } else if (currentActiveAudioSource === 'dj') {
    if (djDecks.a && djDecks.a.audio) toggleDjDeckPlayback('a');
    else if (djDecks.b && djDecks.b.audio) toggleDjDeckPlayback('b');
  } else if (currentActiveAudioSource === 'music') {
    if (typeof toggleMusicPlayback === 'function') toggleMusicPlayback();
  } else if (currentActiveAudioSource === 'tts') {
    if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleNewsReaderPause === 'function') {
      RadioNewsEngine.toggleNewsReaderPause();
    }
  }
}
window.toggleMiniPlayerPlayback = toggleMiniPlayerPlayback;

function stopAllMiniPlayerAudio() {
  if (typeof stopAllStudioAudio === 'function') {
    stopAllStudioAudio(true);
  } else {
    if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
    if (typeof pauseMusicTrack === 'function') pauseMusicTrack();
  }
  if (typeof RadioNewsEngine !== 'undefined') {
    if (typeof RadioNewsEngine.stopRadioPlayback === 'function') RadioNewsEngine.stopRadioPlayback();
    if (typeof RadioNewsEngine.stopNewsReader === 'function') RadioNewsEngine.stopNewsReader();
  }
  const playerEl = document.getElementById('noodle-mini-audio-player');
  if (playerEl) {
    playerEl.classList.remove('hidden');
  }
  isMiniPlayerPlaying = false;
  updateMiniAudioPlayer({
    isPlaying: false,
    sub: 'Gestoppt'
  });
  if (typeof showToast === 'function') {
    showToast(typeof tr === 'function' ? tr({ de: 'Audio beendet ⏹️', en: 'Audio stopped ⏹️' }) : 'Audio beendet ⏹️');
  }
}
window.stopAllMiniPlayerAudio = stopAllMiniPlayerAudio;

function toggleDjProMode() {
  const proElements = document.querySelectorAll('.dj-pro-only');
  const btn = document.getElementById('dj-pro-mode-toggle-btn');
  const isHidden = proElements.length > 0 && proElements[0].classList.contains('hidden');
  proElements.forEach(el => {
    if (isHidden) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
  if (btn) {
    btn.innerHTML = isHidden 
      ? '<span>🎛️ Pro Mixer: An</span>' 
      : '<span>🎛️ Pro Mixer & FX</span>';
  }
}
window.toggleDjProMode = toggleDjProMode;

function handleMiniPlayerVolume(val) {
  const vol = parseFloat(val);
  if (typeof handleStudioMasterVolume === 'function') {
    handleStudioMasterVolume(vol);
  }
  if (typeof soundMasterVolume !== 'undefined') {
    soundMasterVolume = vol;
  }
  if (typeof setMusicPlayerVolume === 'function') {
    setMusicPlayerVolume(vol);
  }
  if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.setRadioVolume === 'function') {
    RadioNewsEngine.setRadioVolume(vol);
  }
}
window.handleMiniPlayerVolume = handleMiniPlayerVolume;
