import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatTime, calcHours, todayStr } from "@/lib/utils";
import StatCard from "@/components/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  const today = todayStr();

  const [totalUsers, todayEntries, activeNow, allTasks] = await Promise.all([
    prisma.user.count({ where: { role: "user", active: true } }),
    prisma.timeEntry.findMany({
      where: { date: today },
      include: { user: { select: { id: true, name: true, department: true } }, tasks: true },
      orderBy: { clockIn: "desc" },
    }),
    prisma.timeEntry.count({ where: { date: today, clockOut: null } }),
    prisma.task.findMany({
      where: { createdAt: { gte: new Date(today) } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const avgHours = todayEntries
    .filter(e => e.clockOut)
    .reduce((sum, e) => {
      const ms = new Date(e.clockOut!).getTime() - new Date(e.clockIn).getTime();
      return sum + ms / 3600000;
    }, 0) / (todayEntries.filter(e => e.clockOut).length || 1);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>
          Good {getGreeting()}, {session?.name.split(" ")[0]}
        </h1>
        <p className="mt-1" style={{ color: "#6e6e73" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={totalUsers}
          color="#007AFF"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm10 2v6m-3-3h6"/></svg>} />
        <StatCard label="Clocked In Today" value={todayEntries.length}
          color="#34C759"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <StatCard label="Currently Active" value={activeNow}
          color="#FF9500"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>} />
        <StatCard label="Avg Hours Today" value={`${avgHours.toFixed(1)}h`}
          color="#5856D6"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2 glass-card rounded-2xl shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <h2 className="font-semibold text-base" style={{ color: "#1d1d1f" }}>Today's Attendance</h2>
          </div>
          {todayEntries.length === 0 ? (
            <div className="p-8 text-center" style={{ color: "#8E8E93" }}>
              <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              No attendance records for today
            </div>
          ) : (
            <div className="divide-y">
              {todayEntries.map(entry => (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                    {entry.user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>{entry.user.name}</p>
                    <p className="text-xs" style={{ color: "#8E8E93" }}>{entry.user.department || "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium" style={{ color: "#1d1d1f" }}>
                      {formatTime(entry.clockIn)} {entry.clockOut && `→ ${formatTime(entry.clockOut)}`}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: entry.clockOut ? "rgba(52,199,89,0.12)" : "rgba(255,149,0,0.12)",
                        color: entry.clockOut ? "#34C759" : "#FF9500"
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: entry.clockOut ? "#34C759" : "#FF9500" }} />
                      {entry.clockOut ? calcHours(entry.clockIn, entry.clockOut) : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass-card rounded-2xl shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <h2 className="font-semibold text-base" style={{ color: "#1d1d1f" }}>Recent Tasks</h2>
          </div>
          {allTasks.length === 0 ? (
            <div className="p-8 text-center" style={{ color: "#8E8E93" }}>
              <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              No tasks today
            </div>
          ) : (
            <div className="divide-y p-2 space-y-0">
              {allTasks.map(task => (
                <div key={task.id} className="px-3 py-2.5 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight" style={{ color: "#1d1d1f" }}>{task.title}</p>
                    {task.duration && (
                      <span className="text-xs shrink-0 px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(88,86,214,0.1)", color: "#5856D6" }}>
                        {task.duration}m
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{task.user.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
