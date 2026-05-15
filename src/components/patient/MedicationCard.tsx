import { Clock, Pill } from "lucide-react";
import type { Medication } from "@/types";
import { Link } from "react-router-dom";

const TYPE_BADGE: Record<string, string> = {
  Prescription: "bg-success/10 text-success",
  Supplement: "bg-info/10 text-info",
  OTC: "bg-warning/10 text-warning",
};

const IMPORTANCE_CONFIG = {
  critical: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "🔴",
    label: "Critical",
    cardBorder: "border-l-4 border-l-red-400",
  },
  important: {
    badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    dot: "🟡",
    label: "Important",
    cardBorder: "border-l-4 border-l-yellow-400",
  },
  routine: {
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "🟢",
    label: "Routine",
    cardBorder: "border-l-4 border-l-green-400",
  },
} as const;

export function MedicationCard({ med }: { med: Medication }) {
  const times = (med as any).times ?? med.frequency?.times ?? [];
  const type = med.type ?? "Prescription";
  const importance = ((med as any).importance ??
    "routine") as keyof typeof IMPORTANCE_CONFIG;
  const impConfig = IMPORTANCE_CONFIG[importance] ?? IMPORTANCE_CONFIG.routine;

  const daysLeft = med.endDate
    ? Math.max(
        0,
        Math.ceil((new Date(med.endDate).getTime() - Date.now()) / 86400000),
      )
    : "∞";

  return (
    <Link
      to={`/patient/medications/${(med as any)._id ?? med.id}`}
      className={`card-base block p-5 transition hover:shadow-md ${impConfig.cardBorder}`}
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary">
          <Pill className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-lg font-bold text-slate-900 truncate">
                {med.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {med.dosage} •{" "}
                {times.length <= 1 ? "Once daily" : `${times.length}x daily`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGE[type]}`}
            >
              {type}
            </span>
          </div>
        </div>
      </div>

      {/* Importance badge */}
      <div className="mt-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${impConfig.badge}`}
        >
          {impConfig.dot} {impConfig.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Pill className="h-3.5 w-3.5" /> {daysLeft} days left
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {times[0] ?? "—"}
        </span>
      </div>
    </Link>
  );
}
