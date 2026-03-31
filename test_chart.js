const fs = require('fs'); const content = fs.readFileSync('app/page.tsx', 'utf-8'); const lines = content.split('\n'); for (let i = 1180; i < 1205; ++i) { console.log(i + ': ' + lines[i]) }
