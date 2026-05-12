import { Clock, Pill } from "lucide-react";
import type { Medication } from "@/types";
import { Link } from "react-router-dom";

const TYPE_BADGE: Record<string, string> = {
  Prescription: "bg-success/10 text-success",
  Supplement: "bg-info/10 text-info",
  OTC: "bg-warning/10 text-warning",
};

export function MedicationCard({ med }: { med: Medication }) {
  const times = (med as any).times ?? med.frequency?.times ?? [];
  const type = med.type ?? "Prescription";
  const daysLeft = med.endDate
    ? Math.max(
        0,
        Math.ceil((new Date(med.endDate).getTime() - Date.now()) / 86400000),
      )
    : "∞";
  return (
    <Link
      to={`/patient/medications/${(med as any)._id ?? med.id}`}
      className="card-base block p-5 transition hover:shadow-md"
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
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
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
