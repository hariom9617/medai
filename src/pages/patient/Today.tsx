import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pill,
  Lock,
  Sparkles,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { safeFormat } from "@/lib/date";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useTakeDose,
  useSkipDose,
  useAdherenceSummary,
  useTodayDoses,
} from "@/hooks/queries";
import { Modal } from "@/components/common/Modal";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SkeletonRow } from "@/components/common/Skeletons";

const REASONS = ["Side Effects", "Forgot", "Illness", "Other"];

interface TodayDose {
  _id: string;
  scheduledTime: string;
  status: "pending" | "taken" | "missed" | "delayed";
  medicationId: { _id: string; name: string; dosage: string };
  patientId: string;
  delayMinutes?: number;
  takenAt?: string;
  doses: number;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  taken: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
  delayed: "bg-orange-100 text-orange-700",
};

export default function Today() {
  const { user } = useAuth();
  const userId = (user as any)?._id ?? user?.id;
  const { data: doses = [], refetch, isLoading } = useTodayDoses(userId);
  const { data: summary } = useAdherenceSummary("week");
  const take = useTakeDose();
  const skip = useSkipDose();

  const [tab, setTab] = useState<"Daily" | "Weekly">("Daily");
  const [skipping, setSkipping] = useState<string | null>(null);
  const [reason, setReason] = useState("Side Effects");
  const [note, setNote] = useState("");

  const todayLogs = [...doses].sort(
    (a, b) => +new Date(a.scheduledTime) - +new Date(b.scheduledTime),
  );
  const remaining = todayLogs.filter((l) => l.status === "pending").length;

  const markTaken = async (id: string) => {
    try {
      await take.mutateAsync({ id });
      toast.success("Dose logged");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const confirmSkip = async () => {
    if (!skipping || !note.trim()) return;
    try {
      await skip.mutateAsync({ id: skipping, notes: `${reason}: ${note}` });
      toast.success("Dose skipped");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
    setSkipping(null);
    setNote("");
  };

  return (
    <AppLayout title="Today's Timeline">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Today's Timeline
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {format(new Date(), "EEEE, MMM d")} • {remaining} Doses Remaining
          </p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {(["Daily", "Weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === t ? "bg-primary text-primary-foreground" : "text-slate-500"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative space-y-4">
        {isLoading && todayLogs.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-base p-4"><SkeletonRow /></div>
            ))
          : todayLogs.map((dose, i) => {
          const id = (dose as any).id ?? dose._id;
          const medName = dose.medicationId?.name ?? "Medication";
          const dosage = dose.medicationId?.dosage ?? "";
          const time = safeFormat(dose.scheduledTime, "hh:mm a");
          const isPending = dose.status === "pending";
          const isMissed = dose.status === "missed";
          const isTaken = dose.status === "taken";
          const isDelayed = dose.status === "delayed";
          const isSkipped = (dose.status as string) === "skipped";
          const isFuture = new Date(dose.scheduledTime).getTime() > Date.now();
          const isDueNow =
            isPending &&
            !isFuture &&
            Math.abs(Date.now() - +new Date(dose.scheduledTime)) <
              1000 * 60 * 90;

          return (
            <div key={id} className="relative flex items-start gap-4">
              {i < todayLogs.length - 1 && (
                <span className="absolute left-[18px] top-12 bottom-[-1rem] w-px bg-slate-200" />
              )}
              <div
                className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
                  isTaken || isDelayed
                    ? "border-success bg-success text-white"
                    : isMissed
                      ? "border-destructive bg-destructive text-white"
                      : isDueNow
                        ? "border-primary bg-white text-primary"
                        : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                {(isTaken || isDelayed) && <CheckCircle2 className="h-5 w-5" />}
                {isMissed && <AlertTriangle className="h-5 w-5" />}
                {(isPending || isSkipped) && <Clock className="h-4 w-4" />}
              </div>

              <div
                className={`flex-1 rounded-xl border p-4 ${
                  isMissed
                    ? "border-destructive/30 bg-destructive/5"
                    : isDueNow
                      ? "border-2 border-primary bg-accent/30"
                      : "border-slate-100 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${isMissed ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`}
                  >
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${isMissed ? "text-destructive" : isDueNow ? "text-primary" : "text-slate-400"}`}
                      >
                        {time} {isMissed && "• MISSED"}{" "}
                        {isDueNow && "• DUE NOW"}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[dose.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {dose.status}
                      </span>
                    </div>
                    <h4 className="mt-0.5 text-base font-bold text-slate-900">
                      {medName}
                    </h4>
                    <p className="text-xs text-slate-500">{dosage}</p>
                  </div>

                  {isFuture && isPending && (
                    <Lock className="h-4 w-4 text-slate-300" />
                  )}

                  {(isTaken || isDelayed) && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-success px-3 py-1.5 text-xs font-semibold text-white">
                        Taken at{" "}
                        {safeFormat(
                          dose.takenAt ?? dose.scheduledTime,
                          "hh:mm a",
                        )}
                      </span>
                      <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {isMissed && (
                    <button
                      onClick={() => markTaken(id)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Log Late Dose
                    </button>
                  )}

                  {isPending && !isFuture && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markTaken(id)}
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow"
                      >
                        Mark Taken
                      </button>
                      <button
                        onClick={() => setSkipping(id)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Skip
                      </button>
                    </div>
                  )}

                  {isSkipped && (
                    <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      Skipped
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {todayLogs.length === 0 && (
          <p className="text-sm text-slate-500">
            No doses scheduled for today.
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Weekly Adherence Rate</p>
              <p className="text-4xl font-bold text-primary">
                {(() => {
                  const meds = (summary as any)?.medications;
                  const avg = meds?.length
                    ? Math.round(
                        meds.reduce(
                          (a: number, m: any) => a + m.adherence7d,
                          0,
                        ) / meds.length,
                      )
                    : 0;
                  return avg;
                })()}
                %{" "}
                <span className="text-sm font-medium text-slate-500">
                  This week
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="card-base bg-info p-6 text-white">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 text-lg font-bold">Pro Tip</h3>
          <p className="mt-2 text-sm text-white/90">
            Setting a reminder a few minutes before your meal helps maintain
            consistency.
          </p>
          <button className="mt-3 text-sm font-semibold underline">
            View More Insights
          </button>
        </div>
      </div>

      <Modal
        open={!!skipping}
        onClose={() => setSkipping(null)}
        title="Reason for Skipping"
        size="md"
      >
        <p className="text-sm text-slate-600">
          Provide a reason for skipping this dose to help your physician monitor
          your progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${reason === r ? "border-primary bg-accent text-primary" : "border-slate-200 text-slate-600"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Describe any symptoms or reasons…"
          className="mt-4 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-5 flex gap-3">
          <button
            disabled={!note.trim() || skip.isPending}
            onClick={confirmSkip}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-50"
          >
            Confirm Skip
          </button>
          <button
            onClick={() => setSkipping(null)}
            className="flex-1 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
