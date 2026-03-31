const fs = require('fs'); const content = fs.readFileSync('app/page.tsx', 'utf-8'); const lines = content.split('\n'); for (let i = 750; i < 780; ++i) { console.log(i + ': ' + lines[i]) }
