const fs = require('fs');
let file = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

file = file.replace('{ label: "Media", to: "/media" },', '{ label: "Media", to: "/media" },\n  { label: "Blog", to: "/blog" },');

fs.writeFileSync('src/components/Navbar.tsx', file);
