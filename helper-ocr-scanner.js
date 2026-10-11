// ============================================================================
// NOODLE HANDWRITING OCR & DOCUMENT SCANNER (helper-ocr-scanner.js)
// Exklusiv integriert im Brainstorming Studio und in der Notizenkarte
// ============================================================================

let currentScannerContext = 'brainstorm'; // 'brainstorm' | 'notes' | 'note-detail'
let currentScannerTargetId = null;
let currentScannerMediaStream = null;
let currentScannerImage = null; // HTMLImageElement or ImageBitmap
let currentScannerFilter = 'doc'; // 'doc' | 'original' | 'sharpen'
let currentScannerRotation = 0; // 0, 90, 180, 270
let isOcrProcessing = false;
let ocrWorkerInstance = null;

// --- INITIALISIERUNG & MODAL-STEUERUNG ---

function openNoteScannerModal(context = 'brainstorm', targetId = null) {
  currentScannerContext = context;
  currentScannerTargetId = targetId;
  currentScannerImage = null;
  currentScannerFilter = 'doc';
  currentScannerRotation = 0;

  const modal = document.getElementById('note-scanner-modal');
  if (!modal) {
    createNoteScannerModalDOM();
  }
  
  const m = document.getElementById('note-scanner-modal');
  if (m) {
    m.classList.remove('hidden');
    resetScannerUI();
    updateScannerContextLabels();
  }
}
window.openNoteScannerModal = openNoteScannerModal;

function closeNoteScannerModal() {
  stopScannerCamera();
  const m = document.getElementById('note-scanner-modal');
  if (m) m.classList.add('hidden');
}
window.closeNoteScannerModal = closeNoteScannerModal;

function updateScannerContextLabels() {
  const titleEl = document.getElementById('scanner-context-title');
  const badgeEl = document.getElementById('scanner-context-badge');
  const actionContainer = document.getElementById('scanner-action-buttons');
  
  if (titleEl && badgeEl) {
    if (currentScannerContext === 'brainstorm') {
      titleEl.innerText = tr({ de: 'Handschrift & Notizen erfassen', en: 'Capture Handwriting & Notes' });
      badgeEl.innerText = 'BRAINSTORMING';
      badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40';
    } else {
      titleEl.innerText = tr({ de: 'Notiz-Scan & Handschrift', en: 'Note Scan & Handwriting' });
      badgeEl.innerText = 'NOTIZENKARTE';
      badgeEl.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40';
    }
  }

  renderScannerActionButtons();
}

function renderScannerActionButtons() {
  const container = document.getElementById('scanner-action-buttons');
  if (!container) return;

  if (currentScannerContext === 'brainstorm') {
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-2 justify-end w-full">
        <select id="scanner-brainstorm-tag" class="bg-black/60 border border-teal-500/40 rounded-xl px-2.5 py-2 text-xs font-bold text-teal-300 outline-none cursor-pointer shadow-sm">
          <option value="idea">💡 Als Ideen</option>
          <option value="quickwin">⚡ Als Quick Wins</option>
          <option value="project">🚀 Als Projekte</option>
          <option value="question">❓ Als Fragen</option>
          <option value="goal">🎯 Als Ziele</option>
        </select>
        <button onclick="importScannedTextToBrainstorm()" class="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5 active:scale-95">
          <i data-lucide="lightbulb" class="w-4 h-4"></i>
          <span>Als Ideen ins Brainstorming übernehmen</span>
        </button>
      </div>
    `;
  } else {
    // Notizenkarte / Note Detail / Cross-Tool Bridge
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-2 justify-end w-full">
        <button onclick="importScannedTextToNotes('notes')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5 active:scale-95">
          <i data-lucide="sticky-note" class="w-3.5 h-3.5"></i>
          <span>In Notizen</span>
        </button>
        <button onclick="importScannedTextToNotes('todo')" class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95">
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Als Aufgaben</span>
        </button>
        <button onclick="if(typeof bridgeOcrToShopping === 'function'){ const txt = document.getElementById('scanner-ocr-result-text')?.value; bridgeOcrToShopping(txt); closeNoteScannerModal(); }" class="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95" title="Erkannte Posten direkt auf die Einkaufsliste setzen">
          <i data-lucide="shopping-cart" class="w-3.5 h-3.5 text-teal-400"></i>
          <span>Zur Einkaufsliste</span>
        </button>
      </div>
    `;
  }
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function resetScannerUI() {
  const uploadStep = document.getElementById('scanner-upload-step');
  const previewStep = document.getElementById('scanner-preview-step');
  const ocrProgress = document.getElementById('scanner-ocr-progress');
  const ocrTextarea = document.getElementById('scanner-ocr-result-text');

  if (uploadStep) uploadStep.classList.remove('hidden');
  if (previewStep) previewStep.classList.add('hidden');
  if (ocrProgress) ocrProgress.classList.add('hidden');
  if (ocrTextarea) ocrTextarea.value = '';

  const fileInput = document.getElementById('scanner-file-input');
  if (fileInput) fileInput.value = '';
}

// --- KAMERA STREAM & CAPTURE ---

async function startScannerCamera() {
  const video = document.getElementById('scanner-camera-video');
  const camContainer = document.getElementById('scanner-camera-container');
  const dropZone = document.getElementById('scanner-dropzone');
  if (!video || !camContainer) return;

  try {
    stopScannerCamera();
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };
    currentScannerMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentScannerMediaStream;
    await video.play();

    camContainer.classList.remove('hidden');
    if (dropZone) dropZone.classList.add('hidden');
  } catch (err) {
    console.warn('[Scanner] Camera error:', err);
    if (typeof showToast === 'function') {
      showToast(tr({
        de: '📷 Kamerazugriff nicht verfügbar oder abgelehnt. Bitte Foto hochladen.',
        en: '📷 Camera access not available or denied. Please upload a photo.'
      }));
    }
  }
}
window.startScannerCamera = startScannerCamera;

function stopScannerCamera() {
  if (currentScannerMediaStream) {
    currentScannerMediaStream.getTracks().forEach(track => track.stop());
    currentScannerMediaStream = null;
  }
  const video = document.getElementById('scanner-camera-video');
  if (video) video.srcObject = null;
  const camContainer = document.getElementById('scanner-camera-container');
  const dropZone = document.getElementById('scanner-dropzone');
  if (camContainer) camContainer.classList.add('hidden');
  if (dropZone) dropZone.classList.remove('hidden');
}
window.stopScannerCamera = stopScannerCamera;

function captureScannerPhoto() {
  const video = document.getElementById('scanner-camera-video');
  if (!video || !video.videoWidth) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  stopScannerCamera();

  const img = new Image();
  img.onload = () => {
    currentScannerImage = img;
    processAndDisplayScannedImage();
    runOcrOnScannedImage();
  };
  img.src = canvas.toDataURL('image/jpeg', 0.92);
}
window.captureScannerPhoto = captureScannerPhoto;

// --- DATEI-UPLOAD & DRAG-AND-DROP ---

function handleScannerFileInput(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  loadScannerImageFromFile(file);
}
window.handleScannerFileInput = handleScannerFileInput;

function loadScannerImageFromFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    if (typeof showToast === 'function') {
      showToast('Bitte eine gültige Bilddatei (PNG, JPG, WebP) auswählen.');
    }
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentScannerImage = img;
      processAndDisplayScannedImage();
      runOcrOnScannedImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Paste Handler (Strg + V)
if (typeof window !== 'undefined') {
  window.addEventListener('paste', (e) => {
    const modal = document.getElementById('note-scanner-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          loadScannerImageFromFile(blob);
          if (typeof showToast === 'function') {
            showToast('📋 Bild aus Zwischenablage geladen!');
          }
          break;
        }
      }
    }
  });
}

// --- CANVAS-BILDOPTIMIERUNG (DOKUMENTEN-FILTER & KONTRAST) ---

function setScannerFilter(filterName) {
  currentScannerFilter = filterName;
  processAndDisplayScannedImage();
}
window.setScannerFilter = setScannerFilter;

function rotateScannerImage() {
  currentScannerRotation = (currentScannerRotation + 90) % 360;
  processAndDisplayScannedImage();
}
window.rotateScannerImage = rotateScannerImage;

function processAndDisplayScannedImage() {
  if (!currentScannerImage) return;

  const canvas = document.getElementById('scanner-preview-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Maße unter Berücksichtigung der Rotation bestimmen
  const isRotated = currentScannerRotation === 90 || currentScannerRotation === 270;
  const rawW = currentScannerImage.naturalWidth || currentScannerImage.width;
  const rawH = currentScannerImage.naturalHeight || currentScannerImage.height;
  
  // Auf max 1600px für optimale Performance & OCR-Präzision skalieren
  const maxDim = 1600;
  let scale = 1;
  if (Math.max(rawW, rawH) > maxDim) {
    scale = maxDim / Math.max(rawW, rawH);
  }
  
  const targetW = Math.round(rawW * scale);
  const targetH = Math.round(rawH * scale);

  canvas.width = isRotated ? targetH : targetW;
  canvas.height = isRotated ? targetW : targetH;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((currentScannerRotation * Math.PI) / 180);
  ctx.drawImage(currentScannerImage, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();

  // Filter anwenden
  if (currentScannerFilter === 'doc') {
    applyDocumentScanFilter(ctx, canvas.width, canvas.height);
  } else if (currentScannerFilter === 'sharpen') {
    applyContrastSharpenFilter(ctx, canvas.width, canvas.height);
  }

  // UI-Umschaltung
  const uploadStep = document.getElementById('scanner-upload-step');
  const previewStep = document.getElementById('scanner-preview-step');
  if (uploadStep) uploadStep.classList.add('hidden');
  if (previewStep) previewStep.classList.remove('hidden');

  updateFilterButtonsUI();
}

function applyDocumentScanFilter(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Grayscale & Adaptive High-Contrast Binarization
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Helligkeit
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Kontrast-S-Kurve (Weißes Papier wird reinweiß, Tinte tiefschwarz)
    let val;
    if (lum > 140) {
      val = Math.min(255, lum * 1.35);
    } else if (lum < 90) {
      val = Math.max(0, lum * 0.6);
    } else {
      val = lum;
    }

    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imgData, 0, 0);
}

function applyContrastSharpenFilter(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const factor = 1.35; // Contrast Boost

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      val = ((val / 255 - 0.5) * factor + 0.5) * 255;
      data[i + c] = Math.max(0, Math.min(255, val));
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function updateFilterButtonsUI() {
  const btnDoc = document.getElementById('scanner-filter-btn-doc');
  const btnOrig = document.getElementById('scanner-filter-btn-original');
  const btnSharp = document.getElementById('scanner-filter-btn-sharpen');

  const activeClass = 'px-3 py-1 rounded-xl text-xs font-bold bg-teal-500/30 border border-teal-400 text-teal-200 shadow-xs';
  const inactiveClass = 'px-3 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white';

  if (btnDoc) btnDoc.className = currentScannerFilter === 'doc' ? activeClass : inactiveClass;
  if (btnOrig) btnOrig.className = currentScannerFilter === 'original' ? activeClass : inactiveClass;
  if (btnSharp) btnSharp.className = currentScannerFilter === 'sharpen' ? activeClass : inactiveClass;
}

// --- OCR ERKENNUNG (TESSERACT.JS MIT FALLBACK) ---

async function runOcrOnScannedImage() {
  const canvas = document.getElementById('scanner-preview-canvas');
  const progressBox = document.getElementById('scanner-ocr-progress');
  const progressText = document.getElementById('scanner-ocr-status-text');
  const progressBar = document.getElementById('scanner-ocr-progress-bar');
  const resultTextarea = document.getElementById('scanner-ocr-result-text');

  if (!canvas || isOcrProcessing) return;

  isOcrProcessing = true;
  if (progressBox) progressBox.classList.remove('hidden');
  if (progressText) progressText.innerText = 'Lade OCR-Handschriftenerkennung...';
  if (progressBar) progressBar.style.width = '15%';

  try {
    // 1. Tesseract.js dynamisch laden, falls noch nicht im Scope
    if (typeof Tesseract === 'undefined') {
      if (progressText) progressText.innerText = 'Initialisiere OCR-Engine...';
      await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    }

    if (typeof Tesseract !== 'undefined') {
      if (progressText) progressText.innerText = 'Analysiere Handschrift & Notizen...';
      if (progressBar) progressBar.style.width = '45%';

      const langCode = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'eng' : 'deu+eng';
      
      const { data: { text } } = await Tesseract.recognize(canvas, langCode, {
        logger: (m) => {
          if (m.status === 'recognizing text' && progressBar) {
            const pct = Math.round((m.progress || 0) * 100);
            progressBar.style.width = `${Math.max(45, pct)}%`;
            if (progressText) progressText.innerText = `Erkenne Text: ${pct}%`;
          }
        }
      });

      const cleaned = postProcessOcrText(text);
      if (resultTextarea) {
        resultTextarea.value = cleaned;
      }
      if (progressBar) progressBar.style.width = '100%';
      if (progressText) progressText.innerText = '✅ Handschrift erfolgreich erkannt!';
      
      if (typeof showToast === 'function') {
        showToast(tr({ de: '✨ Handschriftliche Notiz erkannt!', en: '✨ Handwritten note recognized!' }));
      }
    } else {
      throw new Error('Tesseract script not available');
    }
  } catch (err) {
    console.warn('[Scanner] OCR fallback triggered:', err);
    if (progressText) progressText.innerText = 'ℹ️ Bild geladen (Handschrift bitte kurz prüfen/ergänzen)';
    if (resultTextarea && !resultTextarea.value.trim()) {
      resultTextarea.value = '• Gescannte Notiz (' + new Date().toLocaleDateString() + ')\n';
    }
  } finally {
    isOcrProcessing = false;
    setTimeout(() => {
      if (progressBox) progressBox.classList.add('hidden');
    }, 1200);
  }
}
window.runOcrOnScannedImage = runOcrOnScannedImage;

function postProcessOcrText(rawText) {
  if (!rawText) return '';
  return rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !/^[\s|_\-+=*~`]+$/.test(line))
    .join('\n');
}
window.postProcessOcrText = postProcessOcrText;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

// --- IMPORT-AKTIONEN ---

function importScannedTextToBrainstorm() {
  const textarea = document.getElementById('scanner-ocr-result-text');
  const tagSelect = document.getElementById('scanner-brainstorm-tag');
  const tag = tagSelect ? tagSelect.value : 'idea';
  const text = textarea ? textarea.value.trim() : '';

  if (!text) {
    if (typeof showToast === 'function') showToast('Kein Text zum Importieren vorhanden.');
    return;
  }

  if (typeof addBrainstormIdea === 'function') {
    addBrainstormIdea(text, tag);
  }

  closeNoteScannerModal();
  if (typeof openBrainstormModal === 'function') {
    openBrainstormModal();
  }
}
window.importScannedTextToBrainstorm = importScannedTextToBrainstorm;

function importScannedTextToNotes(targetType = 'notes') {
  const textarea = document.getElementById('scanner-ocr-result-text');
  const text = textarea ? textarea.value.trim() : '';

  if (!text) {
    if (typeof showToast === 'function') showToast('Kein Text zum Importieren vorhanden.');
    return;
  }

  if (currentScannerContext === 'note-detail') {
    const detailTextarea = document.getElementById('note-detail-textarea');
    if (detailTextarea) {
      if (detailTextarea.value.trim()) {
        detailTextarea.value += '\n\n' + text;
      } else {
        detailTextarea.value = text;
      }
    }
    closeNoteScannerModal();
    if (typeof showToast === 'function') {
      showToast(tr({
        de: '📝 Scan in Notiz eingefügt!',
        en: '📝 Scan inserted into note!'
      }));
    }
    return;
  }

  if (targetType === 'todo') {
    // Einzelne Zeilen in die To-Do Spalte einfügen
    if (typeof saveHistory === 'function') saveHistory();
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : (state.items || {});
    if (!curItems.todo) curItems.todo = [];
    
    const lines = text.split('\n').map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(l => l.length > 0);
    lines.forEach(l => {
      curItems.todo.push(l);
    });
    
    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();
    if (typeof showToast === 'function') {
      showToast(tr({
        de: `🚀 ${lines.length} Aufgaben in To-Do Spalte angelegt!`,
        en: `🚀 ${lines.length} tasks added to To-Do!`
      }));
    }
  } else {
    // In die Notizenkarte einfügen
    if (typeof saveHistory === 'function') saveHistory();
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : (state.items || {});
    if (!curItems.notes) curItems.notes = [];
    curItems.notes.push(text);

    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();
    if (typeof showToast === 'function') {
      showToast(tr({
        de: '📝 Notiz aus Scan erfolgreich gespeichert!',
        en: '📝 Note from scan successfully saved!'
      }));
    }
  }

  closeNoteScannerModal();
}
window.importScannedTextToNotes = importScannedTextToNotes;

// --- MODAL DOM GENERIERUNG ---

function createNoteScannerModalDOM() {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'note-scanner-modal';
  modalDiv.className = 'hidden fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in';
  modalDiv.onclick = (e) => {
    if (e.target === modalDiv) closeNoteScannerModal();
  };

  modalDiv.innerHTML = `
    <div class="mobile-modal-card animate-spring-modal w-full max-w-2xl bg-[#0e0c18] border border-teal-500/40 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-2xl text-white relative flex flex-col max-h-[92vh] overflow-hidden" onclick="event.stopPropagation()">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10 select-none shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500/30 to-indigo-500/30 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
            <i data-lucide="scan-line" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 id="scanner-context-title" class="text-sm sm:text-base font-bold font-display text-white">Handschrift & Notizen erfassen</h3>
            <div class="flex items-center gap-2 mt-0.5">
              <span id="scanner-context-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40">BRAINSTORMING</span>
              <span class="text-[10px] text-gray-400">Kamera · Upload · Handschrift-OCR</span>
            </div>
          </div>
        </div>
        <button onclick="closeNoteScannerModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition cursor-pointer" title="Schließen">✕</button>
      </div>

      <!-- Scrollbarer Inhalt -->
      <div class="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar min-h-0">
        
        <!-- 1. UPLOAD & KAMERA SCHRITT -->
        <div id="scanner-upload-step" class="space-y-3">
          
          <!-- Dropzone / Auswahl-Optionen -->
          <div id="scanner-dropzone" class="border-2 border-dashed border-teal-500/35 hover:border-teal-400 rounded-3xl p-6 sm:p-8 bg-black/40 text-center flex flex-col items-center justify-center gap-3 transition cursor-pointer group" onclick="document.getElementById('scanner-file-input').click()">
            <input type="file" id="scanner-file-input" accept="image/*" class="hidden" onchange="handleScannerFileInput(event)" />
            
            <div class="w-14 h-14 rounded-2xl bg-teal-500/15 group-hover:bg-teal-500/25 border border-teal-500/30 group-hover:border-teal-400/60 flex items-center justify-center text-teal-300 group-hover:scale-110 transition duration-200 shadow-lg">
              <i data-lucide="camera" class="w-7 h-7"></i>
            </div>
            
            <div>
              <h4 class="text-sm font-bold text-white mb-1">Notizblatt fotografieren oder Foto hochladen</h4>
              <p class="text-xs text-gray-400 max-w-sm">Klicke zum Auswählen, ziehe ein Bild hierher oder drücke <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-teal-300">Strg+V</kbd> zum Einfügen.</p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 pt-1" onclick="event.stopPropagation()">
              <button onclick="document.getElementById('scanner-file-input').click()" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                <i data-lucide="upload" class="w-3.5 h-3.5 text-teal-300"></i>
                <span>Foto auswählen</span>
              </button>
              <button onclick="startScannerCamera()" class="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                <i data-lucide="video" class="w-3.5 h-3.5 text-teal-400"></i>
                <span>Live-Kamera starten</span>
              </button>
            </div>
          </div>

          <!-- Live Kamera Stream Container (falls aktiviert) -->
          <div id="scanner-camera-container" class="hidden relative rounded-3xl overflow-hidden border border-teal-500/50 bg-black aspect-video flex items-center justify-center shadow-2xl">
            <video id="scanner-camera-video" playsinline autoplay class="w-full h-full object-cover"></video>
            
            <div class="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-20">
              <button onclick="captureScannerPhoto()" class="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-xl transition cursor-pointer flex items-center gap-2 active:scale-90">
                <i data-lucide="camera" class="w-4 h-4"></i>
                <span>Foto knipsen</span>
              </button>
              <button onclick="stopScannerCamera()" class="px-4 py-2.5 rounded-2xl bg-black/70 hover:bg-black/90 border border-white/20 text-gray-300 hover:text-white font-bold text-xs transition cursor-pointer">
                Abbrechen
              </button>
            </div>
          </div>
        </div>

        <!-- 2. VORSCHAU & OCR-ERGEBNIS SCHRITT -->
        <div id="scanner-preview-step" class="hidden space-y-3">
          
          <!-- Werkzeugleiste für Filter & Rotation -->
          <div class="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-black/50 border border-white/10">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-mono text-gray-400 mr-1">Filter:</span>
              <button id="scanner-filter-btn-doc" onclick="setScannerFilter('doc')" class="px-3 py-1 rounded-xl text-xs font-bold bg-teal-500/30 border border-teal-400 text-teal-200 shadow-xs transition cursor-pointer">📄 Scan (S/W)</button>
              <button id="scanner-filter-btn-sharpen" onclick="setScannerFilter('sharpen')" class="px-3 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer">✨ Schärfen</button>
              <button id="scanner-filter-btn-original" onclick="setScannerFilter('original')" class="px-3 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer">🎨 Original</button>
            </div>

            <div class="flex items-center gap-1.5">
              <button onclick="rotateScannerImage()" class="p-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer" title="Bild um 90° drehen">
                <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
                <span>90° Drehen</span>
              </button>
              <button onclick="resetScannerUI()" class="p-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Neues Foto</span>
              </button>
            </div>
          </div>

          <!-- Split-View: Bild-Scan links, OCR-Text rechts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            
            <!-- Scan-Vorschau (Canvas) -->
            <div class="relative rounded-2xl overflow-hidden border border-teal-500/30 bg-black/60 flex items-center justify-center max-h-[280px] p-2">
              <canvas id="scanner-preview-canvas" class="max-h-[260px] max-w-full object-contain rounded-lg shadow-md"></canvas>
            </div>

            <!-- OCR Text-Ergebnis (Live editierbar) -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between text-xs font-bold text-gray-300">
                <span class="flex items-center gap-1 text-teal-300">
                  <i data-lucide="align-left" class="w-3.5 h-3.5"></i>
                  <span>Erkannte Notizen & Stichpunkte:</span>
                </span>
                <button onclick="runOcrOnScannedImage()" class="text-[10.5px] text-teal-400 hover:text-teal-300 font-mono hover:underline cursor-pointer flex items-center gap-0.5">
                  <i data-lucide="rotate-cw" class="w-3 h-3"></i>
                  <span>Erneut scannen</span>
                </button>
              </div>

              <!-- OCR Lade-Balken -->
              <div id="scanner-ocr-progress" class="p-2 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-1">
                <div class="flex items-center justify-between text-[10px] font-mono text-teal-300">
                  <span id="scanner-ocr-status-text">Analysiere Handschrift...</span>
                </div>
                <div class="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div id="scanner-ocr-progress-bar" class="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300 w-1/4"></div>
                </div>
              </div>

              <textarea id="scanner-ocr-result-text" rows="8" placeholder="Erkannter Handschrifttext erscheint hier zur Überprüfung..." class="w-full p-3 bg-black/60 border border-teal-500/30 focus:border-teal-400 rounded-xl text-xs text-white placeholder:text-gray-500 font-mono leading-relaxed outline-none resize-none shadow-inner"></textarea>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Footer & Kontext-Aktionen -->
      <div class="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
        <button onclick="closeNoteScannerModal()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition cursor-pointer">
          Abbrechen
        </button>
        <div id="scanner-action-buttons">
          <!-- Dynamisch gerendert via renderScannerActionButtons() -->
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(modalDiv);
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openNoteScannerModal,
    closeNoteScannerModal,
    updateScannerContextLabels,
    renderScannerActionButtons,
    postProcessOcrText,
    importScannedTextToBrainstorm,
    importScannedTextToNotes
  };
}
