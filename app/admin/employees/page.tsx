"use client";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  position?: string;
  active: boolean;
  createdAt: string;
}

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "", position: "", role: "user" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setShowModal(false);
    setForm({ name: "", email: "", password: "", department: "", position: "", role: "user" });
    load();
    setSaving(false);
  }

  async function toggleActive(user: User) {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    load();
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>Employees</h1>
          <p className="mt-1" style={{ color: "#6e6e73" }}>{users.filter(u => u.role === "user").length} team members</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="apple-btn text-white"
          style={{ background: "#007AFF" }}>
          <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Search employees…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="apple-input pl-10"
          style={{ maxWidth: 360 }}
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: "#8E8E93" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#8E8E93" }}>No employees found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {["Employee", "Department", "Position", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#8E8E93" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: user.role === "admin" ? "linear-gradient(135deg, #007AFF, #5856D6)" : "linear-gradient(135deg, #34C759, #30D158)" }}>
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>{user.name}</p>
                        <p className="text-xs" style={{ color: "#8E8E93" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#3c3c43" }}>{user.department || "—"}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: "#3c3c43" }}>{user.position || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: user.role === "admin" ? "rgba(88,86,214,0.1)" : "rgba(0,122,255,0.1)",
                        color: user.role === "admin" ? "#5856D6" : "#007AFF",
                      }}>
                      {user.role === "admin" ? "Admin" : "Employee"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: user.active ? "rgba(52,199,89,0.1)" : "rgba(142,142,147,0.12)",
                        color: user.active ? "#34C759" : "#8E8E93",
                      }}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(user)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ background: "rgba(0,0,0,0.05)", color: "#3c3c43" }}>
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => deleteUser(user.id, user.name)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ background: "rgba(255,59,48,0.08)", color: "#FF3B30" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="glass-card rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: "#1d1d1f" }}>Add Employee</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3c3c43" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="apple-input" placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="apple-input" type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <input className="apple-input" type="password" placeholder="Password *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <input className="apple-input" placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              <input className="apple-input" placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
              <select className="apple-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">Employee</option>
                <option value="admin">Admin</option>
              </select>
              {error && <p className="text-sm text-center py-2 rounded-xl" style={{ background: "rgba(255,59,48,0.08)", color: "#FF3B30" }}>{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="apple-btn flex-1" style={{ background: "rgba(0,0,0,0.06)", color: "#1d1d1f" }}>Cancel</button>
                <button type="submit" disabled={saving}
                  className="apple-btn flex-1 text-white" style={{ background: "#007AFF" }}>
                  {saving ? "Adding…" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
