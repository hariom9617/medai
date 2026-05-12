import { useState } from "react";
import { CheckCircle2, Clock, Pill, Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { safeFormat } from "@/lib/date";
import { useAssistDose, useConfirmDose } from "@/hooks/queries";
import { useAuth } from "@/context/AuthContext";
import type { DoseLog } from "@/types";

interface Props {
  dose: DoseLog;
  compact?: boolean;
}

export function DoseCompletionCard({ dose, compact }: Props) {
  const { user } = useAuth();
  const assist = useAssistDose();
  const confirm = useConfirmDose();

  const isDone = dose.status === "taken" || dose.status === "delayed";
  const isAssisted = (dose.status as any) === "assisted";
  const [localStatus, setLocalStatus] = useState<
    "pending" | "assisted" | "confirmed"
  >(isDone || isAssisted ? "confirmed" : "pending");

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

  const handleAssist = async () => {
    try {
      await assist.mutateAsync({
        id,
        notes: `Assisted by ${user?.fullName ?? "caregiver"}`,
      });
      setLocalStatus("assisted");
      toast.success("Dose marked as assisted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to assist dose");
    }
  };

  const handleConfirm = async () => {
    try {
      await confirm.mutateAsync({
        id,
        notes: `Confirmed by ${user?.fullName ?? "caregiver"}`,
      });
      setLocalStatus("confirmed");
      toast.success("Dose confirmed as taken");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to confirm dose");
    }
  };

  const cardColor =
    localStatus === "confirmed" || isDone
      ? "border-success/30 bg-success/5"
      : localStatus === "assisted"
        ? "border-primary/30 bg-primary/5"
        : dose.status === "missed"
          ? "border-destructive/30 bg-destructive/5"
          : "border-slate-200 bg-white";

  const iconColor =
    localStatus === "confirmed" || isDone
      ? "bg-success text-white"
      : localStatus === "assisted"
        ? "bg-primary text-white"
        : dose.status === "missed"
          ? "bg-destructive/10 text-destructive"
          : "bg-accent text-primary";

  if (compact) {
    return localStatus === "confirmed" || isDone ? (
      <span className="rounded-lg bg-success/20 px-3 py-1.5 text-xs font-semibold text-success shrink-0">
        Done
      </span>
    ) : localStatus === "assisted" ? (
      <button
        onClick={handleConfirm}
        disabled={confirm.isPending || !isToday}
        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {confirm.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Confirm"
        )}
      </button>
    ) : (
      <button
        onClick={handleAssist}
        disabled={assist.isPending || !isToday}
        title={!isToday ? "Today's doses only" : undefined}
        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {assist.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : dose.status === "missed" ? (
          "Late Assist"
        ) : (
          "Assist"
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
        {localStatus === "confirmed" || isDone ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : localStatus === "assisted" ? (
          <UserCheck className="h-5 w-5" />
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
        </p>
        {(localStatus === "confirmed" || isDone) && takenTime && (
          <p className="mt-0.5 text-xs text-success">
            ✓ Completed at {takenTime}
          </p>
        )}
        {localStatus === "assisted" && (
          <p className="mt-0.5 text-xs text-primary">
            ⟳ Assisted — awaiting confirmation
          </p>
        )}
      </div>

      {localStatus === "confirmed" || isDone ? (
        <span className="rounded-lg bg-success/20 px-3 py-2 text-xs font-semibold text-success">
          Completed
        </span>
      ) : localStatus === "assisted" ? (
        <button
          onClick={handleConfirm}
          disabled={confirm.isPending || !isToday}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {confirm.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Confirm Taken"
          )}
        </button>
      ) : dose.status === "missed" ? (
        <button
          onClick={handleAssist}
          disabled={assist.isPending || !isToday}
          title={!isToday ? "Can only assist today's doses" : undefined}
          className="rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {assist.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Late Assist"
          )}
        </button>
      ) : (
        <button
          onClick={handleAssist}
          disabled={assist.isPending || !isToday}
          title={!isToday ? "Can only assist today's doses" : undefined}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {assist.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Mark Assisted"
          )}
        </button>
      )}
    </div>
  );
}
