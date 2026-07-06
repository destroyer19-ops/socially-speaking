const fs = require('fs');
let file = fs.readFileSync('src/routes/admin.tsx', 'utf8');

file = file.replace('import { CampaignHistory } from "@/components/admin/CampaignHistory";', 'import { CampaignHistory } from "@/components/admin/CampaignHistory";\nimport { QRScanner } from "@/components/admin/QRScanner";\nimport { ScanLine } from "lucide-react";');

file = file.replace('const [activeTab, setActiveTab] = useState<"dashboard" | "email">("dashboard");', 'const [activeTab, setActiveTab] = useState<"dashboard" | "email" | "scanner">("dashboard");');

file = file.replace('{ key: "email", label: "Email Manager", icon: <Mail size={16} /> },', '{ key: "email", label: "Email Manager", icon: <Mail size={16} /> },\n              { key: "scanner", label: "Event Check-In", icon: <ScanLine size={16} /> },');

file = file.replace('] as { key: "dashboard" | "email";', '] as { key: "dashboard" | "email" | "scanner";');

file = file.replace('{/* ── Email Manager Tab ── */}', '{/* ── Scanner Tab ── */}\n          {activeTab === "scanner" && (\n            <div className="py-8">\n              <QRScanner />\n            </div>\n          )}\n\n          {/* ── Email Manager Tab ── */}');

fs.writeFileSync('src/routes/admin.tsx', file);
