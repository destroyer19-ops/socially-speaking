import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2, Plus, Trash2, Edit2, Save, X, Users, CheckCircle,
  AlertCircle, RefreshCw, ChevronDown, ChevronRight,
} from "lucide-react";

interface WaGroup {
  id: number;
  name: string;
  capacity: number;
  assigned: number;
  remaining: number;
  link: string;
  active: number;
  sort_order: number;
  status: "Full" | "Open";
}

interface Attendee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  status: string;
}

const BASE = import.meta.env.BASE_URL;

export function WhatsAppGroupsManager() {
  const [groups, setGroups] = useState<WaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<WaGroup>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", capacity: 1000, link: "", sort_order: 99 });
  const [saving, setSaving] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Record<number, Attendee[]>>({});
  const [loadingAttendees, setLoadingAttendees] = useState<Record<number, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}whatsapp-groups-api.php?action=admin-list`);
      const json = await res.json();
      if (json.ok) setGroups(json.groups);
      else setError(json.error || "Failed to load groups");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadAttendees = async (id: number) => {
    if (attendees[id]) { setExpandedGroup(expandedGroup === id ? null : id); return; }
    setLoadingAttendees(p => ({ ...p, [id]: true }));
    setExpandedGroup(id);
    try {
      const res = await fetch(`${BASE}whatsapp-groups-api.php?action=attendees&id=${id}`);
      const json = await res.json();
      if (json.ok) setAttendees(p => ({ ...p, [id]: json.attendees }));
    } finally {
      setLoadingAttendees(p => ({ ...p, [id]: false }));
    }
  };

  const startEdit = (g: WaGroup) => {
    setEditingId(g.id);
    setEditForm({ name: g.name, capacity: g.capacity, link: g.link, active: g.active, sort_order: g.sort_order });
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      await fetch(`${BASE}whatsapp-groups-api.php?action=update&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      // Invalidate attendee cache for this group
      setAttendees(p => { const n = { ...p }; delete n[id]; return n; });
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${BASE}whatsapp-groups-api.php?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();
      if (json.ok) {
        setShowCreate(false);
        setCreateForm({ name: "", capacity: 1000, link: "", sort_order: 99 });
        load();
      } else {
        alert(json.error || "Failed to create group");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this group? (Groups with assigned attendees cannot be deleted — deactivate them instead.)")) return;
    const res = await fetch(`${BASE}whatsapp-groups-api.php?action=delete&id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) load();
    else alert(json.error);
  };

  const totalAssigned = groups.reduce((s, g) => s + g.assigned, 0);
  const totalCapacity = groups.reduce((s, g) => s + g.capacity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">WhatsApp Attendee Groups</h3>
          <p className="text-sm text-foreground-muted mt-0.5">
            {totalAssigned.toLocaleString()} / {totalCapacity.toLocaleString()} total assigned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2 py-2 px-4 text-sm">
            <Plus size={16} /> Add Group
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {groups.map(g => (
          <div key={g.id} className={`rounded-xl p-3 border ${g.status === "Full" ? "border-red-500/20 bg-red-500/5" : "border-green-500/20 bg-green-500/5"}`}>
            <p className="text-xs text-foreground-subtle truncate">{g.name}</p>
            <p className="text-lg font-bold text-white mt-1">{g.assigned.toLocaleString()} <span className="text-xs font-normal text-foreground-muted">/ {g.capacity.toLocaleString()}</span></p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${g.status === "Full" ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(100, (g.assigned / g.capacity) * 100)}%` }}
              />
            </div>
            <span className={`text-xs mt-1 inline-block font-semibold ${g.status === "Full" ? "text-red-400" : "text-green-400"}`}>{g.status}</span>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-strong rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white">Add New Group</h4>
            <button onClick={() => setShowCreate(false)}><X size={16} className="text-foreground-muted hover:text-white" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Group Name</label>
              <input required value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                placeholder="SSC 2026 Attendees 06"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-glow" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Capacity</label>
              <input required type="number" value={createForm.capacity} onChange={e => setCreateForm(p => ({ ...p, capacity: +e.target.value }))}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-glow" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground-muted mb-1">WhatsApp Invite Link</label>
              <input required value={createForm.link} onChange={e => setCreateForm(p => ({ ...p, link: e.target.value }))}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-glow" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Sort Order</label>
              <input type="number" value={createForm.sort_order} onChange={e => setCreateForm(p => ({ ...p, sort_order: +e.target.value }))}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-glow" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="w-full btn-primary justify-center disabled:opacity-50">
                {saving ? "Adding..." : "Add Group"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-purple-glow w-8 h-8" /></div>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              {/* Group row */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {editingId === g.id ? (
                  /* ── Edit mode ── */
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-foreground-subtle mb-1">Name</label>
                      <input value={editForm.name ?? ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-glow" />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-subtle mb-1">Capacity</label>
                      <input type="number" value={editForm.capacity ?? 1000} onChange={e => setEditForm(p => ({ ...p, capacity: +e.target.value }))}
                        className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-glow" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-foreground-subtle mb-1">WhatsApp Link</label>
                      <input value={editForm.link ?? ""} onChange={e => setEditForm(p => ({ ...p, link: e.target.value }))}
                        className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-glow" />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-subtle mb-1">Sort Order</label>
                      <input type="number" value={editForm.sort_order ?? 0} onChange={e => setEditForm(p => ({ ...p, sort_order: +e.target.value }))}
                        className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-glow" />
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground-muted">
                        <input type="checkbox" checked={!!editForm.active} onChange={e => setEditForm(p => ({ ...p, active: e.target.checked ? 1 : 0 }))}
                          className="rounded border-white/20 bg-transparent h-4 w-4" />
                        Active (accepts new assignments)
                      </label>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <button onClick={() => saveEdit(g.id)} disabled={saving}
                        className="btn-primary py-1.5 px-4 text-sm inline-flex items-center gap-1 disabled:opacity-50">
                        <Save size={14} /> {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="py-1.5 px-4 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white transition-colors inline-flex items-center gap-1">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white">{g.name}</h4>
                        {g.active ? (
                          <span className="text-xs px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full border border-green-500/20">Active</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-white/5 text-foreground-subtle rounded-full border border-white/10">Inactive</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${g.status === "Full" ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-blue/15 text-blue border-blue/20"}`}>
                          {g.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-sm text-foreground-muted">
                        <span><span className="text-white font-semibold">{g.assigned.toLocaleString()}</span> assigned</span>
                        <span><span className="text-white font-semibold">{g.remaining.toLocaleString()}</span> remaining</span>
                        <span><span className="text-white font-semibold">{g.capacity.toLocaleString()}</span> capacity</span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-xs">
                        <div
                          className={`h-full rounded-full transition-all ${g.status === "Full" ? "bg-red-500" : "bg-purple-glow"}`}
                          style={{ width: `${Math.min(100, g.capacity > 0 ? (g.assigned / g.capacity) * 100 : 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => loadAttendees(g.id)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white transition-colors"
                        title="View attendees"
                      >
                        {expandedGroup === g.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="sr-only">Attendees</span>
                      </button>
                      <button onClick={() => startEdit(g)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Attendees table */}
              {expandedGroup === g.id && (
                <div className="border-t border-white/5">
                  {loadingAttendees[g.id] ? (
                    <div className="flex items-center justify-center py-6"><Loader2 className="animate-spin w-6 h-6 text-purple-glow" /></div>
                  ) : (attendees[g.id] ?? []).length === 0 ? (
                    <p className="text-center py-6 text-sm text-foreground-subtle">No attendees assigned yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-white/[0.02] text-foreground-subtle uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3 font-semibold">Name</th>
                            <th className="px-5 py-3 font-semibold">Email</th>
                            <th className="px-5 py-3 font-semibold">Phone</th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                            <th className="px-5 py-3 font-semibold">Registered</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {(attendees[g.id] ?? []).map(a => (
                            <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3 text-white font-medium">{a.full_name}</td>
                              <td className="px-5 py-3 text-foreground-muted">{a.email}</td>
                              <td className="px-5 py-3 text-foreground-muted">{a.phone}</td>
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue/10 text-blue border border-blue/20">
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-foreground-subtle">{new Date(a.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
