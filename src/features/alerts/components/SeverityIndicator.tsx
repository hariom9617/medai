export type Severity = "critical" | "high" | "medium" | "low";

export const severityStyles: Record<Severity, { border: string; badge: string; bg: string; text: string; label: string }> = {
  critical: { border: "border-l-destructive", badge: "bg-destructive text-white", bg: "bg-destructive/10", text: "text-destructive", label: "CRITICAL" },
  high: { border: "border-l-destructive", badge: "bg-destructive/15 text-destructive", bg: "bg-destructive/10", text: "text-destructive", label: "HIGH" },
  medium: { border: "border-l-warning", badge: "bg-warning/15 text-warning", bg: "bg-warning/10", text: "text-warning", label: "MEDIUM" },
  low: { border: "border-l-info", badge: "bg-info/15 text-info", bg: "bg-info/10", text: "text-info", label: "LOW" },
};

export function SeverityIndicator({ severity }: { severity: Severity }) {
  const s = severityStyles[severity];
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${s.badge}`}>{s.label}</span>;
}
