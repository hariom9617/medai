import { useState } from "react";
import { CheckCircle2, Clock, Pill, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { safeFormat } from "@/lib/date";
import { useTakeDose } from "@/hooks/queries";
import { useAuth } from "@/context/AuthContext";
import type { DoseLog } from "@/types";

interface Props {
  dose: DoseLog;
  compact?: boolean;
}

export function DoseCompletionCard({ dose, compact }: Props) {
  const { user } = useAuth();
  const take = useTakeDose();

  const isDone = dose.status === "taken" || dose.status === "delayed";
  const isMissed = dose.status === "missed";
  const isPending = dose.status === "pending";
  const [localStatus, setLocalStatus] = useState<"pending" | "taken">(
    isDone ? "taken" : "pending"
  );

  const id = (dose as any)._id ?? dose.id ?? "";
  const med = typeof dose.medicationId === "object" ? dose.medicationId : null;
  const name = (med as any)?.name ?? "Medication";
  const dosage = (med as any)?.dosage ?? "";
  const scheduledTime = safeFormat(dose.scheduledTime, "hh:mm a", "--:--");
  const takenTime = dose.takenAt
    ? safeFormat(dose.takenAt, "hh:mm a", "--:--")
    : null;

  // Only allow actions on today's doses
  const isToday = (() => {
    if (!dose.scheduledTime) return false;
    const d = new Date(dose.scheduledTime);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  })();

  // Check if dose is in the future (can't be taken yet)
  const isFuture = new Date(dose.scheduledTime).getTime() > Date.now();

  const handleTake = async () => {
    try {
      await take.mutateAsync({ id });
      setLocalStatus("taken");
      toast.success("Dose marked as completed");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to mark dose as completed");
    }
  };

  const cardColor =
    localStatus === "taken" || isDone
      ? "border-success/30 bg-success/5"
      : isMissed
        ? "border-destructive/30 bg-destructive/5"
        : "border-slate-200 bg-white";

  const iconColor =
    localStatus === "taken" || isDone
      ? "bg-success text-white"
      : isMissed
        ? "bg-destructive/10 text-destructive"
        : "bg-accent text-primary";

  if (compact) {
    return localStatus === "taken" || isDone ? (
      <span className="rounded-lg bg-success/20 px-3 py-1.5 text-xs font-semibold text-success shrink-0">
        Done
      </span>
    ) : isMissed ? (
      <button
        onClick={handleTake}
        disabled={take.isPending || !isToday}
        title={!isToday ? "Today's doses only" : undefined}
        className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive-glow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {take.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Late Log"
        )}
      </button>
    ) : isFuture ? (
      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 shrink-0">
        Scheduled
      </span>
    ) : (
      <button
        onClick={handleTake}
        disabled={take.isPending || !isToday}
        title={!isToday ? "Today's doses only" : undefined}
        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {take.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Mark Done"
        )}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition ${cardColor}`}
    >
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${iconColor}`}
      >
        {localStatus === "taken" || isDone ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : isMissed ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <Pill className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {name} <span className="text-slate-500">{dosage}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3 w-3" /> Scheduled {scheduledTime}
          {!isToday && (
            <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              PAST
            </span>
          )}
          {isFuture && (
            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
              UPCOMING
            </span>
          )}
        </p>
        {(localStatus === "taken" || isDone) && takenTime && (
          <p className="mt-0.5 text-xs text-success">
            ✓ Completed at {takenTime}
          </p>
        )}
        {isMissed && (
          <p className="mt-0.5 text-xs text-destructive">
            ⚠ Missed dose - can still log
          </p>
        )}
      </div>

      {localStatus === "taken" || isDone ? (
        <span className="rounded-lg bg-success/20 px-3 py-2 text-xs font-semibold text-success">
          Completed
        </span>
      ) : isMissed ? (
        <button
          onClick={handleTake}
          disabled={take.isPending || !isToday}
          title={!isToday ? "Can only log today's doses" : undefined}
          className="rounded-lg border border-destructive px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {take.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Log Late Dose"
          )}
        </button>
      ) : isFuture ? (
        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
          Scheduled
        </span>
      ) : (
        <button
          onClick={handleTake}
          disabled={take.isPending || !isToday}
          title={!isToday ? "Can only mark today's doses" : undefined}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {take.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Mark Completed"
          )}
        </button>
      )}
    </div>
  );
}
