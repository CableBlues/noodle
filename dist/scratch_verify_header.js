import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');

const checks = [
    { name: 'Tools button (Zone 1)', test: idx.includes('id="btn-header-tools"') },
    { name: 'Alarm button (Zone 1)', test: idx.includes('id="header-btn-alarm-container"') },
    { name: 'Timer wrapper (Zone 1)', test: idx.includes('id="timer-wrapper"') },
    { name: 'Timer display 02:00', test: idx.includes('id="timer-display"') },
    { name: 'Brainstorm button (Zone 2)', test: idx.includes('id="btn-header-brainstorm"') },
    { name: 'Date container (Zone 2)', test: idx.includes('id="date-container"') },
    { name: 'Weather badge in date container', test: idx.includes('id="date-weather-badge"') },
    { name: 'Date hover wrapper', test: idx.includes('id="date-hover-wrapper"') },
    { name: 'Was nun button (Zone 2)', test: idx.includes('id="btn-whatnow-dance"') },
    { name: 'Pause container (Zone 3)', test: idx.includes('id="header-btn-pause-container"') },
    { name: 'Stats container (Zone 3)', test: idx.includes('id="header-btn-report-container"') },
    { name: 'Options container (Zone 3)', test: idx.includes('id="header-btn-options-container"') },
    { name: 'Sound container (Zone 3)', test: idx.includes('id="header-btn-sound-container"') },
    { name: 'Chat panel with 3 tabs', test: idx.includes('id="panel-collab-chat"') && idx.includes('collab-tab-btn-team') && idx.includes('collab-tab-btn-messengers') && idx.includes('collab-tab-btn-direct') },
    { name: 'WhatsApp & Signal integration in Chat', test: idx.includes("shareToMessenger('whatsapp')") && idx.includes("shareToMessenger('signal')") },
    { name: 'Messengers pane in Chat', test: idx.includes('id="collab-pane-messengers"') },
    { name: 'Direct Chat pane in Chat', test: idx.includes('id="collab-pane-direct"') }
];

console.log('=== HEADER VERIFICATION ===');
let allPassed = true;
for (const c of checks) {
    console.log(`${c.test ? '✅' : '❌'} ${c.name}`);
    if (!c.test) allPassed = false;
}
console.log('All checks passed:', allPassed);
