const fs = require('fs');
let file = fs.readFileSync('src/routes/admin.tsx', 'utf8');

file = file.replace(/dashboard" \| "email" \| "scanner"/g, 'dashboard" | "email" | "scanner" | "blog"');
file = file.replace('{ key: "scanner",   label: "QR Check-In",     icon: <ScanLine size={16} /> },', '{ key: "scanner",   label: "QR Check-In",     icon: <ScanLine size={16} /> },\n            { key: "blog",      label: "Blog Manager",    icon: <PenTool size={16} /> },');
file = file.replace('<option value="scanner">QR Check-In</option>', '<option value="scanner">QR Check-In</option>\n            <option value="blog">Blog Manager</option>');
file = file.replace('{activeTab === "scanner"   && "QR Check-In"}', '{activeTab === "scanner"   && "QR Check-In"}\n                  {activeTab === "blog"      && "Blog Manager"}');
file = file.replace('{activeTab === "scanner"   && "Scan attendee QR codes to mark live check-ins"}', '{activeTab === "scanner"   && "Scan attendee QR codes to mark live check-ins"}\n                  {activeTab === "blog"      && "Manage and publish blog posts"}');
file = file.replace('{activeTab === "email" && <EmailManager />}', '{activeTab === "email" && <EmailManager />}\n            {activeTab === "blog" && <BlogManager />}');

if (!file.includes('PenTool')) {
    file = file.replace('ScanLine,', 'ScanLine, PenTool,');
}

fs.writeFileSync('src/routes/admin.tsx', file);
