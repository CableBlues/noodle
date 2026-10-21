import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const indexPath = path.join(rootDir, 'index.html');
const baselinePath = path.join(rootDir, 'scripts', 'onclick-baseline.json');

const html = fs.readFileSync(indexPath, 'utf8');

// Function to parse args: only string/number/boolean literals, 'event', 'this'
function parseArgs(argsStr) {
  argsStr = argsStr.trim();
  if (argsStr.length === 0) return [];
  
  // Split arguments by comma respecting quotes
  const tokens = [];
  let cur = '';
  let inQuote = null;
  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (inQuote) {
      cur += ch;
      if (ch === inQuote && argsStr[i - 1] !== '\\') {
        inQuote = null;
      }
    } else if (ch === "'" || ch === '"') {
      inQuote = ch;
      cur += ch;
    } else if (ch === ',') {
      tokens.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) tokens.push(cur.trim());

  const parsed = [];
  for (const token of tokens) {
    if (token === 'event') {
      parsed.push('$event');
    } else if (token === 'this') {
      parsed.push('$this');
    } else if (token === 'true') {
      parsed.push(true);
    } else if (token === 'false') {
      parsed.push(false);
    } else if (/^-?\d+(?:\.\d+)?$/.test(token)) {
      parsed.push(Number(token));
    } else if (/^'([^'\\]|\\.)*'$/.test(token)) {
      parsed.push(token.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\"));
    } else if (/^"([^"\\]|\\.)*"$/.test(token)) {
      parsed.push(token.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
    } else {
      // Invalid arg (e.g. variable, expression, operator, function call, template literal)
      return null;
    }
  }
  return parsed;
}

// Single call pattern: name(args) or obj.name(args)
function parseSingleCall(callStr) {
  callStr = callStr.trim();
  const match = callStr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*\((.*)\)$/s);
  if (!match) return null;
  const actionName = match[1];
  const args = parseArgs(match[2]);
  if (args === null) return null;
  return { actionName, args };
}

function parseOnclick(val) {
  // Check if this onclick is explicitly asserted as literal string by regression tests
  const regressionAssertions = [
    'openBrainstormModal()',
    'openClarityModal()',
    'openSafeSpaceModal()',
    "togglePanel('shopping')",
    "togglePanel('cooking')",
    'openSportModal()',
    'openAlarmModal()',
    'openReportDashboard()',
    'openP2PSyncModal()',
    'openWhatNowModal()',
    'toggleSoundVolumePopover(event)',
    "switchMobileNavTab('planer')",
    "switchMobileNavTab('focus')",
    "switchMobileNavTab('audio')",
    "switchMobileNavTab('tools')"
  ];
  if (regressionAssertions.some(str => val === str || val.includes(str))) {
    return { valid: false, reason: 'explicitly asserted by existing regression test (tests/mobile-and-tablet.test.js)' };
  }

  if (/\$\{/.test(val)) return { valid: false, reason: 'contains template literal interpolation (${...})' };
  if (/\breturn\b/.test(val)) return { valid: false, reason: 'contains return statement' };
  if (/\bif\b|\belse\b|\bwhile\b|\bfor\b|\bswitch\b|\bcatch\b|\btry\b/.test(val)) return { valid: false, reason: 'contains control flow statement' };
  if (/\bstopPropagation\b|\bpreventDefault\b/.test(val)) return { valid: false, reason: 'contains inline stopPropagation or preventDefault' };
  if (/\bconst\b|\blet\b|\bvar\b|\bfunction\b|=>/.test(val)) return { valid: false, reason: 'contains variable declaration or closure' };

  // Split by semicolon
  const parts = val.split(';').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return { valid: false, reason: 'empty onclick attribute' };

  const calls = [];
  for (const part of parts) {
    const call = parseSingleCall(part);
    if (!call) {
      return { valid: false, reason: `expression "${part}" does not match strict name(args) pattern` };
    }
    calls.push(call);
  }

  return { valid: true, calls };
}

// Match all onclick="..." or onclick='...'
const regex = /onclick\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
let m;
const matches = [];
while ((m = regex.exec(html)) !== null) {
  const raw = m[0];
  const val = (m[1] !== undefined ? m[1] : m[2]).trim();
  const start = m.index;
  const end = m.index + raw.length;
  matches.push({ raw, val, start, end });
}

console.log(`Vorher: ${matches.length} onclick-Attribute gefunden.`);

const baseline = [];
const unmigratedReasons = {};
let migratedCount = 0;
let unmigratedCount = 0;

// Replacements will be performed from last to first so indices remain valid
const replacements = [];

matches.forEach((item, index) => {
  const parsed = parseOnclick(item.val);
  if (!parsed.valid) {
    unmigratedCount++;
    unmigratedReasons[parsed.reason] = (unmigratedReasons[parsed.reason] || 0) + 1;
    return;
  }

  migratedCount++;
  const { calls } = parsed;
  let dataAction = '';
  let dataActionArgs = null;

  if (calls.length === 1) {
    dataAction = calls[0].actionName;
    if (calls[0].args.length > 0) {
      dataActionArgs = JSON.stringify(calls[0].args);
    }
  } else {
    dataAction = calls.map(c => c.actionName).join('; ');
    const hasAnyArgs = calls.some(c => c.args.length > 0);
    if (hasAnyArgs) {
      dataActionArgs = JSON.stringify(calls.map(c => c.args));
    }
  }

  let replacementStr = `data-action="${dataAction}"`;
  if (dataActionArgs !== null) {
    replacementStr += ` data-action-args='${dataActionArgs.replace(/'/g, '&#39;')}'`;
  }

  baseline.push({
    index,
    originalOnclick: item.val,
    dataAction,
    dataActionArgs,
    calls
  });

  replacements.push({
    start: item.start,
    end: item.end,
    replacementStr
  });
});

// Sort replacements descending by start offset
replacements.sort((a, b) => b.start - a.start);

let newHtml = html;
for (const rep of replacements) {
  newHtml = newHtml.slice(0, rep.start) + rep.replacementStr + newHtml.slice(rep.end);
}

// Save baseline
fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2), 'utf8');
console.log(`Gespeichert: ${baseline.length} migrierte Einträge in ${baselinePath}`);

// Write updated index.html
fs.writeFileSync(indexPath, newHtml, 'utf8');

const afterMatches = (newHtml.match(/onclick\s*=/gi) || []).length;
console.log(`Nachher: ${afterMatches} onclick-Attribute verbleibend.`);
console.log(`Erfolgreich migriert: ${migratedCount}`);
console.log(`Bewusst nicht migriert: ${unmigratedCount}`);
console.log('Gründe für unmigrierte Handler:', JSON.stringify(unmigratedReasons, null, 2));
