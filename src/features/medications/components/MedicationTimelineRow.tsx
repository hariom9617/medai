// src/features/medications/components/MedicationTimelineRow.tsx
import { CheckCircle2, Clock, AlertTriangle, Pill } from "lucide-react";
import { format, isValid } from "date-fns";
import type { MockDose } from "@/features/shared/mock/patients";

export function MedicationTimelineRow({
  dose,
  onAssist,
  canAssist = false,
}: {
  dose: MockDose;
  onAssist?: () => void;
  canAssist?: boolean;
}) {
  // FIXED: guard invalid date before format()
  const dateVal = dose.scheduledAt ? new Date(dose.scheduledAt) : null;
  const time = dateVal && isValid(dateVal) ? format(dateVal, "hh:mm a") : "--:--";

  const isTaken = dose.status === "taken";
  const isMissed = dose.status === "missed";
  const isPending = dose.status === "pending";
  const isDelayed = dose.status === "delayed";

  const dot = isTaken
    ? "border-success bg-success text-white"
    : isMissed
    ? "border-destructive bg-destructive text-white"
    : isDelayed
    ? "border-warning bg-warning text-white"
    : "border-slate-200 bg-white text-slate-300";

  const card = isMissed
    ? "border-destructive/30 bg-destructive/5"
    : isPending
    ? "border-2 border-primary/40 bg-accent/30"
    : "border-slate-100 bg-white shadow-sm";

  return (
    <div className="relative flex items-start gap-4">
      <div className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${dot}`}>
        {isTaken && <CheckCircle2 className="h-5 w-5" />}
        {isMissed && <AlertTriangle className="h-5 w-5" />}
        {(isPending || isDelayed) && <Clock className="h-4 w-4" />}
      </div>
      <div className={`flex-1 rounded-xl border p-4 ${card}`}>
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
            <Pill className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold uppercase tracking-wider ${
              isMissed ? "text-destructive" : isPending ? "text-primary" : "text-slate-400"
            }`}>
              {time} {isMissed && "· MISSED"} {isDelayed && "· DELAYED"} {isPending && "· UPCOMING"}
            </p>
            <h4 className="mt-0.5 text-sm font-bold text-slate-900">
              {dose.medicationName} <span className="text-slate-500">{dose.dosage}</span>
            </h4>
            {dose.assistedBy && (
              <p className="text-xs text-slate-500">Assisted by {dose.assistedBy}</p>
            )}
          </div>
          {canAssist && (isPending || isMissed) && (
            <button
              onClick={onAssist}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow"
            >
              Mark Assisted
            </button>
          )}
        </div>
      </div>
    </div>
  );
}