export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calcHours(clockIn: Date | string, clockOut?: Date | string | null): string {
  if (!clockOut) return "Active";
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const totalMins = Math.floor(ms / 60000);
  return formatDuration(totalMins);
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
