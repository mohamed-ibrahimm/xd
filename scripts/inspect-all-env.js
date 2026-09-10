const fs = require('fs');

const files = ['.env', '.env.local', '.env.example'];

files.forEach(f => {
  console.log('=== ' + f + ' ===');
  if (!fs.existsSync(f)) {
    console.log('NOT FOUND');
    return;
  }
  const lines = fs.readFileSync(f, 'utf-8').split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      console.log(`Line ${idx + 1}: INVALID FORMAT`);
      return;
    }
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    const rawVal = val.replace(/^["']|["']$/g, '');
    const hasQuotes = /^["'].*["']$/.test(val);
    console.log(`Line ${idx + 1}: Key [${key}] -> ${rawVal === '' ? 'EMPTY' : `CONFIGURED (len: ${rawVal.length}, quotes: ${hasQuotes})`}`);
  });
});
