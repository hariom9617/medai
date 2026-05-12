import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  pill?: { label: string; tone: "success" | "warning" | "info" | "destructive" };
  subline?: ReactNode;
  highlight?: boolean;
  bar?: number; // 0-100 progress
}

const PILL: Record<string, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon, iconBg = "bg-success/10", iconColor = "text-success", pill, subline, highlight, bar }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 ${highlight ? "border-primary bg-primary text-primary-foreground" : "border-slate-100 bg-white shadow-sm"}`}>
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${highlight ? "bg-white/15 text-white" : `${iconBg} ${iconColor}`}`}>
          {icon}
        </div>
        {pill && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${highlight ? "bg-white/15 text-white" : PILL[pill.tone]}`}>
            {pill.label}
          </span>
        )}
      </div>
      <p className={`mt-4 text-[11px] font-semibold uppercase tracking-wider ${highlight ? "text-white/70" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-1 text-3xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>{value}</p>
      {subline && <p className={`mt-1 text-xs ${highlight ? "text-white/80" : "text-slate-500"}`}>{subline}</p>}
      {bar !== undefined && (
        <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${highlight ? "bg-white/20" : "bg-slate-100"}`}>
          <div className={`h-full rounded-full ${highlight ? "bg-white" : "bg-primary"}`} style={{ width: `${bar}%` }} />
        </div>
      )}
    </div>
  );
}
