import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, calcHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) return null;

  const entries = await prisma.timeEntry.findMany({
    where: { userId: session.userId },
    include: { tasks: true },
    orderBy: { clockIn: "desc" },
    take: 30,
  });

  const totalHours = entries
    .filter(e => e.clockOut)
    .reduce((sum, e) => {
      const ms = new Date(e.clockOut!).getTime() - new Date(e.clockIn).getTime();
      return sum + ms / 3600000;
    }, 0);

  const totalTasks = entries.reduce((sum, e) => sum + e.tasks.length, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>Shift History</h1>
        <p className="mt-1" style={{ color: "#6e6e73" }}>Your last 30 shifts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Shifts", value: entries.length, color: "#007AFF" },
          { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, color: "#34C759" },
          { label: "Tasks Logged", value: totalTasks, color: "#5856D6" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5 text-center shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
            <p className="text-sm" style={{ color: "#8E8E93" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center shadow-sm" style={{ color: "#8E8E93" }}>
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          No shift history yet — clock in to get started!
        </div>
      ) : (
        <div className="glass-card rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="divide-y">
            {entries.map(entry => (
              <div key={entry.id} className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: entry.clockOut ? "rgba(52,199,89,0.1)" : "rgba(255,149,0,0.1)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={entry.clockOut ? "#34C759" : "#FF9500"} strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>{formatDate(entry.clockIn)}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                      {formatTime(entry.clockIn)} → {entry.clockOut ? formatTime(entry.clockOut) : "Active"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.tasks.length > 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(88,86,214,0.08)", color: "#5856D6" }}>
                        {entry.tasks.length} task{entry.tasks.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="text-sm font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        background: entry.clockOut ? "rgba(0,122,255,0.08)" : "rgba(255,149,0,0.1)",
                        color: entry.clockOut ? "#007AFF" : "#FF9500",
                      }}>
                      {calcHours(entry.clockIn, entry.clockOut)}
                    </span>
                  </div>
                </div>
                {entry.tasks.length > 0 && (
                  <div className="mt-2.5 ml-14 flex flex-wrap gap-1.5">
                    {entry.tasks.map((t) => (
                      <span key={t.id} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(0,0,0,0.04)", color: "#3c3c43" }}>
                        {t.title}{t.duration ? ` · ${t.duration}m` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
