const fs = require('fs');
let file = fs.readFileSync('src/routes/admin.tsx', 'utf8');

file = file.replace('ScanLine,', 'ScanLine, PenTool,');

fs.writeFileSync('src/routes/admin.tsx', file);
