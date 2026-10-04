import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexHtmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Extract header logo wrapper and tools wrapper
// Find header logo wrapper:
const logoWrapperStart = html.indexOf('<!-- 1. Noodle Logo & Wordmark');
const logoWrapperEnd = html.indexOf('<!-- 2. Noodle Tools Hub');

const toolsWrapperStart = html.indexOf('<!-- 2. Noodle Tools Hub');
const timerWrapperStart = html.indexOf('<!-- 3. Fokus-Timer');

if (logoWrapperStart === -1 || logoWrapperEnd === -1 || toolsWrapperStart === -1 || timerWrapperStart === -1) {
  console.error('Could not find Zone 1 markers:', { logoWrapperStart, logoWrapperEnd, toolsWrapperStart, timerWrapperStart });
  process.exit(1);
}

const logoWrapperHtml = html.substring(logoWrapperStart, logoWrapperEnd).trim();
const toolsWrapperHtml = html.substring(toolsWrapperStart, timerWrapperStart).trim();

// Rebuild Zone 1 with Tools before Logo and flex-1 justify-start
const zone1Start = html.indexOf('<!-- 1. LINKE ZONE:');
const zone1WrapperStart = html.indexOf('<div class="hidden md:flex items-center', zone1Start);
const zone1WrapperEnd = html.indexOf('>', zone1WrapperStart) + 1;

html = html.substring(0, zone1WrapperStart) + 
  '<div class="hidden md:flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0 flex-1 justify-start">\n        ' +
  toolsWrapperHtml + '\n\n        ' +
  logoWrapperHtml + '\n\n        ' +
  html.substring(timerWrapperStart);

// 2. Fix Zone 2: [SUCHE] [BRAINSTORMING] [DATUMSBLOCK] [WAS NUN?]
const zone2Marker = '<!-- ======================================================================\n      <!-- 2. ZENTRALE ZONE:';
const zone2AltMarker = '<!-- 2. ZENTRALE ZONE:';
const zone3Marker = '<!-- 3. RECHTE ZONE:';

const z2Idx = html.indexOf(zone2AltMarker);
const z3Idx = html.indexOf(zone3Marker);

if (z2Idx === -1 || z3Idx === -1) {
  console.error('Could not find Zone 2/3 markers');
  process.exit(1);
}

// Find elements within Zone 2:
// Search button
const searchBtnStart = html.indexOf('<!-- 1. Suche / Command Palette', z2Idx);
const searchBtnEnd = html.indexOf('<!-- 2. Datumsblock:', searchBtnStart);

// Datumsblock
const dateBlockStart = html.indexOf('<!-- 2. Datumsblock:', z2Idx);
const dateBlockEnd = html.indexOf('<!-- 3. Brainstorming Studio', dateBlockStart);

// Brainstorming button
const brainstormStart = html.indexOf('<!-- 3. Brainstorming Studio', z2Idx);
const brainstormEnd = html.indexOf('<!-- 4. Was nun?', brainstormStart);

// Was nun button + focus mode
const wasNunStart = html.indexOf('<!-- 4. Was nun?', z2Idx);
const zone2End = html.indexOf('</div>\n\n      <!-- ======================================================================\n      <!-- 3. RECHTE ZONE:', z2Idx);

if (searchBtnStart === -1 || dateBlockStart === -1 || brainstormStart === -1 || wasNunStart === -1) {
  console.error('Could not find Zone 2 elements');
  process.exit(1);
}

const searchHtml = html.substring(searchBtnStart, searchBtnEnd).trim();
const dateBlockHtml = html.substring(dateBlockStart, dateBlockEnd).trim();
const brainstormHtml = html.substring(brainstormStart, brainstormEnd).trim();
const wasNunHtml = html.substring(wasNunStart, zone2End).trim();

// Assemble clean Zone 2:
const newZone2Html = `<!-- ====================================================================== -->
      <!-- 2. ZENTRALE ZONE: [SUCHE] [BRAINSTORMING] [DATUMSBLOCK] [WAS NUN?] -->
      <!-- ====================================================================== -->
      <div class="flex items-center justify-center gap-1.5 sm:gap-2 shrink-0">
        ${searchHtml}

        ${brainstormHtml}

        ${dateBlockHtml}

        ${wasNunHtml}
      </div>`;

// Find the start of Zone 2 section before z2Idx
const zone2SectionHeaderStart = html.lastIndexOf('<!-- ===', z2Idx);

html = html.substring(0, zone2SectionHeaderStart) + newZone2Html + '\n\n      ' + html.substring(html.indexOf('<!-- ======================================================================\n      <!-- 3. RECHTE ZONE:', z2Idx));

// 3. Update Zone 3 wrapper to have flex-1 justify-end
const z3SectionStart = html.indexOf('<!-- 3. RECHTE ZONE:');
const z3WrapperStart = html.indexOf('<div class="hidden md:flex items-center', z3SectionStart);
const z3WrapperEnd = html.indexOf('>', z3WrapperStart) + 1;

html = html.substring(0, z3WrapperStart) + 
  '<div class="hidden md:flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0 flex-1 justify-end">' +
  html.substring(z3WrapperEnd);

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Successfully reordered header elements!');
