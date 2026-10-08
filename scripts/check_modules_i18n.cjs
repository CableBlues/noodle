const fs = require('fs');

const files = ['app-radio-news.js', 'app-health.js', 'app-social.js', 'app-humor.js', 'sport.js', 'helper-cleaning.js', 'helper-learning.js', 'helper-clarity.js', 'app-cooking.js', 'app-shopping.js', 'app-alarm.js'];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  const tCalls = (c.match(/\bt\(['"][a-zA-Z0-9_\-]+['"]\)/g) || []).length;
  const trCalls = (c.match(/\btr\(\{/g) || []).length;
  const i18nAttrs = (c.match(/data-i18n/g) || []).length;
  console.log(`${f.padEnd(20)} -> t(): ${String(tCalls).padStart(3)} | tr(): ${String(trCalls).padStart(3)} | data-i18n: ${String(i18nAttrs).padStart(3)}`);
}
