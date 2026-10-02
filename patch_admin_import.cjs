const fs = require('fs');
let file = fs.readFileSync('src/routes/admin.tsx', 'utf8');

file = file.replace('import { QRScanner } from "@/components/admin/QRScanner";', 'import { QRScanner } from "@/components/admin/QRScanner";\nimport { BlogManager } from "@/components/admin/BlogManager";');

fs.writeFileSync('src/routes/admin.tsx', file);
