"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: number;
  createdAt: string;
  user: { id: string; name: string };
}

const CATEGORIES = ["Development", "Design", "Meeting", "Review", "Testing", "Documentation", "Support", "Other"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", duration: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", category: "", duration: "" });
    setShowForm(false);
    load();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    load();
  }

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.category === filter);
  const cats = [...new Set(tasks.map(t => t.category).filter(Boolean))] as string[];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>My Tasks</h1>
          <p className="mt-1" style={{ color: "#6e6e73" }}>{tasks.length} total tasks logged</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="apple-btn text-white"
          style={{ background: "#007AFF" }}>
          <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Log Task
        </button>
      </div>

      {/* Log Task Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-sm animate-fadeIn" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold mb-4" style={{ color: "#1d1d1f" }}>Log a Task</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="apple-input" placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="apple-input resize-none" placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="apple-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="apple-input" type="number" placeholder="Duration (minutes)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="apple-btn flex-1" style={{ background: "rgba(0,0,0,0.06)", color: "#1d1d1f" }}>Cancel</button>
              <button type="submit" disabled={saving} className="apple-btn flex-1 text-white" style={{ background: "#007AFF" }}>{saving ? "Saving…" : "Save Task"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Pills */}
      {cats.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {["all", ...cats].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className="text-sm px-4 py-1.5 rounded-full font-medium transition-all"
              style={{
                background: filter === c ? "#007AFF" : "rgba(0,0,0,0.06)",
                color: filter === c ? "white" : "#3c3c43",
              }}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="p-12 text-center" style={{ color: "#8E8E93" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center shadow-sm" style={{ color: "#8E8E93" }}>
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          No tasks yet — log your first task!
        </div>
      ) : (
        <div className="glass-card rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="divide-y">
            {filtered.map(task => (
              <div key={task.id} className="px-5 py-4 flex items-start gap-4 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(0,122,255,0.08)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>{task.title}</p>
                  {task.description && <p className="text-sm mt-0.5" style={{ color: "#6e6e73" }}>{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs" style={{ color: "#8E8E93" }}>{formatDate(task.createdAt)}</span>
                    {task.category && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>{task.category}</span>}
                    {task.duration && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(88,86,214,0.08)", color: "#5856D6" }}>{task.duration} min</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,59,48,0.08)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
