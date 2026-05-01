interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, color = "#007AFF", icon }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm animate-fadeIn"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: "#8E8E93" }}>{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight" style={{ color: "#1d1d1f", letterSpacing: "-0.03em" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>{sub}</p>}
    </div>
  );
}
