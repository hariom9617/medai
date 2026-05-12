import { DoseStatus } from "@/types";

const MAP: Record<string, { label: string; cls: string }> = {
  taken: { label: "Taken", cls: "bg-success/10 text-success" },
  missed: { label: "Missed", cls: "bg-destructive/10 text-destructive" },
  pending: { label: "Pending", cls: "bg-warning/10 text-warning" },
  skipped: { label: "Skipped", cls: "bg-slate-200 text-slate-600" },
  upcoming: { label: "Upcoming", cls: "bg-info/10 text-info" },
};

export function StatusBadge({ status, label }: { status: DoseStatus | string; label?: string }) {
  const m = MAP[status] ?? { label: status, cls: "bg-slate-200 text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}>
      {label ?? m.label}
    </span>
  );
}
