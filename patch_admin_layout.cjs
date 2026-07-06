const fs = require('fs');
let file = fs.readFileSync('src/routes/admin.tsx', 'utf8');

const oldReturn = `  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-1">
                Socially Speaking Conference
              </p>
              <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight">
                SSC 2026{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-glow to-blue-glow">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-foreground-muted mt-1 text-sm">
                Live overview of registrations, volunteers and recruitment for{" "}
                <strong className="text-white/70">The Takeover Generation · 5 Dec 2026</strong>
              </p>
            </div>
            {activeTab === "dashboard" && (
              <button
                onClick={handleExportCSV}
                disabled={loading || filteredData.length === 0}
                className="btn-primary inline-flex items-center gap-2 whitespace-nowrap self-start md:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={15} />
                Export CSV
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 glass-strong rounded-2xl border border-white/5 p-2">
            {([
              { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
              { key: "email", label: "Email Manager", icon: <Mail size={16} /> },
              { key: "scanner", label: "Event Check-In", icon: <ScanLine size={16} /> },
            ] as { key: "dashboard" | "email" | "scanner"; label: string; icon: React.ReactNode }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 \${
                  activeTab === t.key
                    ? "bg-purple/20 text-purple-glow border border-purple/30"
                    : "text-foreground-muted hover:text-white"
                }\`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>`;

const newReturn = `  const tabs = [
    { key: "dashboard", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { key: "email", label: "Email Campaigns", icon: <Mail size={16} /> },
    { key: "scanner", label: "QR Check-In", icon: <ScanLine size={16} /> },
  ] as const;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-foreground font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-display font-black text-xl text-white tracking-tight">
            SSC <span className="text-purple-glow">26</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 \${
                activeTab === t.key
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-foreground-muted hover:bg-white/[0.03] hover:text-white"
              }\`}
            >
              <span className={\`\${activeTab === t.key ? "text-purple-400" : "text-foreground-subtle"}\`}>
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-glow to-blue-glow flex items-center justify-center text-xs font-bold text-white shadow-inner">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Administrator</p>
              <p className="text-[10px] text-foreground-subtle truncate">admin@sociallyspeaking</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505] relative">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a] z-20">
          <h1 className="font-display font-bold text-lg text-white tracking-tight">
            SSC <span className="text-purple-glow">26</span>
          </h1>
          
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="bg-transparent border border-white/10 text-white text-sm rounded-lg py-1.5 px-3 focus:outline-none"
          >
            {tabs.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-10">
          
            {/* Header Area per Tab */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
                  {tabs.find(t => t.key === activeTab)?.label}
                </h2>
                <p className="text-sm text-foreground-muted mt-1">
                  {activeTab === 'dashboard' && "Live overview of registrations and recruitment"}
                  {activeTab === 'email' && "Manage and dispatch attendee broadcasts"}
                  {activeTab === 'scanner' && "Live event access control"}
                </p>
              </div>
              
              {activeTab === "dashboard" && (
                <button
                  onClick={handleExportCSV}
                  disabled={loading || filteredData.length === 0}
                  className="btn-primary inline-flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-glow/10"
                >
                  <Download size={15} />
                  Export CSV
                </button>
              )}
            </div>`;

file = file.replace(oldReturn, newReturn);

const oldFooter = `        </div>
      </div>
      <Footer />
    </main>
  );
}`;

const newFooter = `          </div>
        </div>
      </main>
    </div>
  );
}`;

file = file.replace(oldFooter, newFooter);

fs.writeFileSync('src/routes/admin.tsx', file);
