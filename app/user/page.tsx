"use client";
import { useEffect, useState } from "react";
import { formatTime, calcHours, formatDate } from "@/lib/utils";

interface TimeEntry {
  id: string;
  clockIn: string;
  clockOut: string | null;
  date: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: number;
  createdAt: string;
}

interface User {
  name: string;
  email: string;
  department?: string;
  position?: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [task, setTask] = useState({ title: "", description: "", category: "", duration: "" });
  const [savingTask, setSavingTask] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function load() {
    const [meRes, entriesRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/time-entries"),
    ]);
    const meData = await meRes.json();
    const entriesData = await entriesRes.json();
    setUser(meData.user);
    const entries: TimeEntry[] = entriesData.entries || [];
    const todayStr = new Date().toISOString().split("T")[0];
    const todayActive = entries.find(e => e.date === todayStr && !e.clockOut) || null;
    setActiveEntry(todayActive);
    setRecentEntries(entries.slice(0, 7));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleClock() {
    setClocking(true);
    const action = activeEntry ? "clock-out" : "clock-in";
    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) load();
    setClocking(false);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setSavingTask(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, timeEntryId: activeEntry?.id }),
    });
    setTask({ title: "", description: "", category: "", duration: "" });
    setShowTaskForm(false);
    load();
    setSavingTask(false);
  }

  const elapsed = activeEntry
    ? (() => {
        const ms = now.getTime() - new Date(activeEntry.clockIn).getTime();
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      })()
    : null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm" style={{ color: "#8E8E93" }}>Loading…</div>
    </div>
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>
          {greeting}, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1" style={{ color: "#6e6e73" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Clock Card */}
        <div className="glass-card rounded-2xl p-7 shadow-sm text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {activeEntry ? (
            <>
              <div className="w-4 h-4 rounded-full mx-auto mb-4 animate-pulse" style={{ background: "#34C759" }} />
              <p className="text-sm font-medium mb-2" style={{ color: "#8E8E93" }}>Shift started at {formatTime(activeEntry.clockIn)}</p>
              <p className="text-5xl font-bold tabular-nums mb-6" style={{ color: "#1d1d1f", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                {elapsed}
              </p>
              <button onClick={handleClock} disabled={clocking}
                className="apple-btn text-white w-full"
                style={{ background: "linear-gradient(135deg, #FF3B30, #FF2D55)" }}>
                {clocking ? "Clocking Out…" : "Clock Out"}
              </button>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full mx-auto mb-4" style={{ background: "#FF3B30" }} />
              <p className="text-sm font-medium mb-2" style={{ color: "#8E8E93" }}>Not clocked in</p>
              <p className="text-5xl font-bold mb-6" style={{ color: "#1d1d1f", letterSpacing: "-0.04em" }}>
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </p>
              <button onClick={handleClock} disabled={clocking}
                className="apple-btn text-white w-full"
                style={{ background: "linear-gradient(135deg, #34C759, #30D158)" }}>
                {clocking ? "Clocking In…" : "Clock In"}
              </button>
            </>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="glass-card rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <h2 className="font-semibold" style={{ color: "#1d1d1f" }}>Today's Tasks</h2>
            {activeEntry && (
              <button onClick={() => setShowTaskForm(!showTaskForm)}
                className="text-sm font-medium px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>
                + Add Task
              </button>
            )}
          </div>

          {showTaskForm && activeEntry && (
            <form onSubmit={handleAddTask} className="p-4 border-b space-y-2.5 animate-fadeIn" style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}>
              <input className="apple-input" placeholder="Task title *" value={task.title} onChange={e => setTask({ ...task, title: e.target.value })} required />
              <input className="apple-input" placeholder="Description" value={task.description} onChange={e => setTask({ ...task, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="apple-input" placeholder="Category" value={task.category} onChange={e => setTask({ ...task, category: e.target.value })} />
                <input className="apple-input" type="number" placeholder="Duration (min)" value={task.duration} onChange={e => setTask({ ...task, duration: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTaskForm(false)} className="apple-btn flex-1 text-sm" style={{ background: "rgba(0,0,0,0.06)", color: "#1d1d1f" }}>Cancel</button>
                <button type="submit" disabled={savingTask} className="apple-btn flex-1 text-sm text-white" style={{ background: "#007AFF" }}>{savingTask ? "Saving…" : "Save"}</button>
              </div>
            </form>
          )}

          <div className="overflow-auto" style={{ maxHeight: 280 }}>
            {!activeEntry ? (
              <div className="p-8 text-center" style={{ color: "#8E8E93" }}>
                <p className="text-sm">Clock in to start adding tasks</p>
              </div>
            ) : activeEntry.tasks.length === 0 ? (
              <div className="p-8 text-center" style={{ color: "#8E8E93" }}>
                <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <p className="text-sm">No tasks yet — add your first one!</p>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {activeEntry.tasks.map((t: Task) => (
                  <div key={t.id} className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>{t.title}</p>
                      {t.duration && <span className="text-xs shrink-0 px-2 py-0.5 rounded-full" style={{ background: "rgba(88,86,214,0.1)", color: "#5856D6" }}>{t.duration}m</span>}
                    </div>
                    {t.description && <p className="text-xs mt-0.5" style={{ color: "#6e6e73" }}>{t.description}</p>}
                    {t.category && <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>{t.category}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold" style={{ color: "#1d1d1f" }}>Recent Shifts</h2>
        </div>
        {recentEntries.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#8E8E93" }}>No shift history yet</div>
        ) : (
          <div className="divide-y">
            {recentEntries.map(entry => (
              <div key={entry.id} className="px-5 py-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>{formatDate(entry.clockIn)}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                    {formatTime(entry.clockIn)} {entry.clockOut ? `→ ${formatTime(entry.clockOut)}` : "→ Active"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.tasks.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(88,86,214,0.08)", color: "#5856D6" }}>
                      {entry.tasks.length} task{entry.tasks.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: entry.clockOut ? "rgba(0,122,255,0.08)" : "rgba(255,149,0,0.1)",
                      color: entry.clockOut ? "#007AFF" : "#FF9500"
                    }}>
                    {calcHours(entry.clockIn, entry.clockOut)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
