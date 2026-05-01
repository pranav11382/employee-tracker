import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, calcHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const entries = await prisma.timeEntry.findMany({
    where: { clockIn: { gte: sevenDaysAgo } },
    include: {
      user: { select: { id: true, name: true, department: true, email: true } },
      tasks: true,
    },
    orderBy: { clockIn: "desc" },
  });

  const byEmployee: Record<string, { name: string; dept: string; entries: typeof entries; totalMs: number }> = {};
  for (const entry of entries) {
    if (!byEmployee[entry.userId]) {
      byEmployee[entry.userId] = { name: entry.user.name, dept: entry.user.department || "—", entries: [], totalMs: 0 };
    }
    byEmployee[entry.userId].entries.push(entry);
    if (entry.clockOut) {
      byEmployee[entry.userId].totalMs += new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime();
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>Reports</h1>
        <p className="mt-1" style={{ color: "#6e6e73" }}>Last 7 days overview</p>
      </div>

      {Object.keys(byEmployee).length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center shadow-sm" style={{ color: "#8E8E93" }}>
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          No data for the last 7 days
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(byEmployee).map(([uid, emp]) => {
            const totalHrs = (emp.totalMs / 3600000).toFixed(1);
            const daysWorked = new Set(emp.entries.map(e => e.date)).size;
            return (
              <div key={uid} className="glass-card rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="px-5 py-4 flex items-center gap-4" style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                    {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "#1d1d1f" }}>{emp.name}</p>
                    <p className="text-sm" style={{ color: "#8E8E93" }}>{emp.dept}</p>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-xl font-bold" style={{ color: "#007AFF" }}>{totalHrs}h</p>
                      <p className="text-xs" style={{ color: "#8E8E93" }}>Total Hours</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold" style={{ color: "#34C759" }}>{daysWorked}</p>
                      <p className="text-xs" style={{ color: "#8E8E93" }}>Days</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold" style={{ color: "#5856D6" }}>{emp.entries.reduce((s, e) => s + e.tasks.length, 0)}</p>
                      <p className="text-xs" style={{ color: "#8E8E93" }}>Tasks</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y">
                  {emp.entries.slice(0, 5).map(entry => (
                    <div key={entry.id} className="px-5 py-3 flex items-center gap-4">
                      <p className="text-sm w-32 shrink-0" style={{ color: "#6e6e73" }}>{formatDate(entry.clockIn)}</p>
                      <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>
                        {formatTime(entry.clockIn)} → {entry.clockOut ? formatTime(entry.clockOut) : "Active"}
                      </p>
                      <span className="ml-auto text-sm font-medium px-2.5 py-0.5 rounded-full"
                        style={{ background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>
                        {calcHours(entry.clockIn, entry.clockOut)}
                      </span>
                      {entry.tasks.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(88,86,214,0.08)", color: "#5856D6" }}>
                          {entry.tasks.length} task{entry.tasks.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
