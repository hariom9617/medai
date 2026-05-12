export function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const map = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-success/10 text-success",
  } as const;
  const label = level === "high" ? "HIGH RISK" : level === "medium" ? "MEDIUM" : "STABLE";
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[level]}`}>
      {label}
    </span>
  );
}
