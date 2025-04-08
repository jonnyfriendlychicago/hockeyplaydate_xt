// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

const tsconfigPath = './tsconfig.json';

const raw = fs.readFileSync(tsconfigPath, 'utf-8');
const config = JSON.parse(raw);

if (Array.isArray(config.include)) {
  config.include = config.include.filter(
    (entry) => !entry.includes('.next/types')
  );
}

fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, 2));
console.log('Cleaned tsconfig.json after Next.js attempted rewrite');

// NOTE: 

// First line ('const fs = require('fs');'  is perfectly valid for a .js script outside of your main app code (like in runFixScripts/fix-tsconfig.js).
// TS wants to yell about it; to silence the ESLint red squiggle, you can add an ESLint comment above the line.