import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

console.log('====================================================');
console.log('📦 NOODLE PRODUCTION BUNDLER');
console.log('====================================================\n');

// 1. Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Scan music directory and write music/manifest.json
const musicDirPath = path.join(rootDir, 'music');
if (fs.existsSync(musicDirPath)) {
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
  const musicFiles = fs.readdirSync(musicDirPath).filter(f => audioExts.includes(path.extname(f).toLowerCase()));
  const tracks = musicFiles.map(f => {
    const ext = path.extname(f);
    let cleanName = path.basename(f, ext)
      .replace(/\s*-\s*/g, ' – ')
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      id: 'folder_' + Buffer.from(f).toString('hex').slice(0, 8),
      name: '🎵 ' + cleanName,
      fullName: f,
      url: 'music/' + encodeURIComponent(f),
      isLocalFolder: true
    };
  });
  fs.writeFileSync(path.join(musicDirPath, 'manifest.json'), JSON.stringify({ success: true, count: tracks.length, tracks }, null, 2), 'utf8');
  console.log(`✓ music/manifest.json generiert (${tracks.length} Tracks gefunden)`);
}

// 3. Copy static files & vendor/fonts/.well-known/music/api directory
const staticDirs = ['vendor', 'fonts', '.well-known', 'music', 'api'];
staticDirs.forEach(dir => {
  const src = path.join(rootDir, dir);
  const dest = path.join(distDir, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Verzeichnis kopiert: ${dir}/`);
  }
});

const staticFiles = [
  'manifest.json',
  'logo-noodle.png',
  'logo-banner.png',
  'favicon.png',
  'favicon.svg',
  'icon-192.png',
  'icon-192.svg',
  'icon-512.png',
  'icon-512.svg',
  'service-worker.js',
  'sw.js',
  'fonts.css'
];
staticFiles.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Datei kopiert: ${file}`);
  }
});

// Copy all CSS files
const allCssFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.css'));
function safeCopyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    try {
      const data = fs.readFileSync(src);
      fs.writeFileSync(dest, data);
    } catch (e) {
      console.warn(`[Build] Warning copying ${src} to ${dest}:`, e.message);
    }
  }
}

allCssFiles.forEach(cssFile => {
  const src = path.join(rootDir, cssFile);
  const dest = path.join(distDir, cssFile);
  safeCopyFile(src, dest);
});
console.log(`✓ ${allCssFiles.length} CSS-Dateien nach dist/ kopiert`);

// Copy all app JS files
const allJsFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.js') && f !== 'build.js' && f !== 'vitest.config.js');
allJsFiles.forEach(jsFile => {
  const src = path.join(rootDir, jsFile);
  const dest = path.join(distDir, jsFile);
  safeCopyFile(src, dest);
});
console.log(`✓ ${allJsFiles.length} JavaScript-Module nach dist/ kopiert`);

// 3. Bundle JS application
try {
  const moduleList = [
    'data-tasks-steps-1.js',
    'data-tasks-steps-2.js',
    'data-tasks-steps-3.js',
    'data-tasks.js',
    'data-translations-1.js',
    'data-translations-2.js',
    'data-translations.js',
    'data-custom-translations.js',
    'data-extras.js',
    'config.js',
    'auth-engine.js',
    'storage.js',
    'state.js',
    'sync-engine.js',
    'collab-engine.js',
    'utils-data.js',
    'utils.js',
    'utils-2.js',
    'audio-core.js',
    'audio-generators.js',
    'audio-scheduler-1.js',
    'audio-scheduler-2.js',
    'audio-scheduler-3.js',
    'audio-player.js',
    'timer-1.js',
    'timer-2.js',
    'timer-3.js',
    'sport.js',
    'helper-core-data.js',
    'helper-core.js',
    'helper-core-2.js',
    'helper-clarity.js',
    'helper-brainstorm.js',
    'helper-cleaning.js',
    'helper-learning.js',
    'app-regulation.js',
    'app-health.js',
    'app-humor.js',
    'app-shopping.js',
    'app-cooking.js',
    'app-alarm.js',
    'app-tasks.js',
    'app-reports.js',
    'app-weather-news.js',
    'app-radio-news.js',
    'app-dice.js',
    'app-command-palette.js',
    'app-routine-presets.js',
    'onboarding.js',
    'monetization.js',
    'app-feedback.js',
    'app-tooltip.js',
    'app-social.js',
    'app-core.js'
  ];

  let bundledCode = moduleList.map(mod => {
    const filePath = path.join(rootDir, mod);
    if (fs.existsSync(filePath)) {
      return `/* --- ${mod} --- */\n` + fs.readFileSync(filePath, 'utf8');
    }
    return '';
  }).join('\n\n');

  const bundlePath = path.join(distDir, 'app.bundle.js');
  fs.writeFileSync(bundlePath, bundledCode, 'utf8');
  console.log(`✓ app.bundle.js erfolgreich aus ${moduleList.length} Modulen erzeugt`);
} catch (e) {
  console.warn('Bundling warning:', e.message);
}

// 4. Generate dist/index.html (wires single bundled app.bundle.js)
let indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const scriptBlockRegex = /<script src="data-tasks-steps-1\.js"><\/script>[\s\S]*?<script src="app-core\.js"><\/script>/;
if (scriptBlockRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(scriptBlockRegex, '  <!-- Noodle Standalone Production Bundle -->\n  <script src="app.bundle.js"></script>');
}
fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml, 'utf8');
console.log('✓ dist/index.html erfolgreich auf app.bundle.js umgestellt');

// 5. Generate dist/sw.js tailored for dist/ assets
let swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
const distAssets = [
  './',
  './index.html',
  './manifest.json',
  './logo-noodle.png',
  './logo-banner.png',
  './favicon.png',
  './favicon.svg',
  './icon-192.png',
  './icon-192.svg',
  './icon-512.png',
  './icon-512.svg',
  './fonts.css',
  './app.bundle.js',
  './fonts/plus-jakarta-sans-400.ttf',
  './fonts/plus-jakarta-sans-500.ttf',
  './fonts/plus-jakarta-sans-600.ttf',
  './fonts/plus-jakarta-sans-700.ttf',
  './fonts/space-grotesk-500.ttf',
  './fonts/space-grotesk-700.ttf',
  './fonts/caveat-400.ttf',
  './fonts/caveat-700.ttf',
  './fonts/playfair-display-400.ttf',
  './fonts/playfair-display-700.ttf',
  './styles-base-1.css',
  './styles-base-2.css',
  './styles-dock.css',
  './styles-hover.css',
  './styles-animations.css',
  './styles-mobile.css',
  './vendor/tailwindcss.js',
  './vendor/lucide.min.js',
  './vendor/supabase.min.js',
  './vendor/qrcode.min.js',
  './vendor/html2canvas.min.js'
];
const distAssetsBlock = `const ASSETS_TO_CACHE = [\n  ${distAssets.map(a => `'${a}'`).join(',\n  ')}\n];`;
swContent = swContent.replace(/const ASSETS_TO_CACHE = \[[\s\S]*?\];/m, distAssetsBlock);
fs.writeFileSync(path.join(distDir, 'sw.js'), swContent, 'utf8');
console.log('✓ dist/sw.js mit optimierter Offline-Cache-Liste erzeugt');

console.log('\n====================================================');
console.log('🎉 BUILD ERFOLGREICH ABGESCHLOSSEN (Bereit für Hosting)');
console.log('====================================================');
