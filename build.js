import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

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

// 2. Copy static files & vendor/fonts/.well-known directory
const staticDirs = ['vendor', 'fonts', '.well-known'];
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
allCssFiles.forEach(cssFile => {
  const src = path.join(rootDir, cssFile);
  const dest = path.join(distDir, cssFile);
  fs.copyFileSync(src, dest);
});
console.log(`✓ ${allCssFiles.length} CSS-Dateien nach dist/ kopiert`);

// Copy all app JS files
const allJsFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.js') && f !== 'build.js' && f !== 'vitest.config.js');
allJsFiles.forEach(jsFile => {
  const src = path.join(rootDir, jsFile);
  const dest = path.join(distDir, jsFile);
  fs.copyFileSync(src, dest);
});
console.log(`✓ ${allJsFiles.length} JavaScript-Module nach dist/ kopiert`);

// 3. Bundle JS application with esbuild
try {
  const result = esbuild.buildSync({
    entryPoints: [path.join(rootDir, 'main.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    write: false
  });
  if (result.outputFiles && result.outputFiles.length > 0) {
    const bundlePath = path.join(distDir, 'app.bundle.js');
    fs.writeFileSync(bundlePath, result.outputFiles[0].contents);
    console.log('✓ app.bundle.js mit esbuild erfolgreich erzeugt');
  }
} catch (e) {
  console.warn('esbuild bundling warning:', e.message);
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
