const fs = require('fs'); const content = fs.readFileSync('app/page.tsx', 'utf-8'); const lines = content.split('\n'); for (let i = 557; i < 590; ++i) { console.log(i + ': ' + lines[i]) }
