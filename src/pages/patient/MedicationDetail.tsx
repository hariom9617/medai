import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  CheckCircle2,
  Lock,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DoseCompletionCard } from "@/components/patient/DoseCompletionCard";
import { useMedication, useDoseLogs, useTodayDoses } from "@/hooks/queries";
import { safeFormat } from "@/lib/date";
import { BarChart, Bar, ResponsiveContainer, XAxis, Cell } from "recharts";
import { calcAdherence } from "@/utils/adherence";
import { useAuth } from "@/context/AuthContext";
import { SkeletonCard, SkeletonHeader, SkeletonChart } from "@/components/common/Skeletons";

export default function MedicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = (user as any)?._id ?? user?.id;
  const { data: med, isLoading } = useMedication(id);
  const { data: allLogs = [] } = useDoseLogs();
  const { data: todayDoses = [] } = useTodayDoses(userId);
  const logs = allLogs.filter(
    (l: any) =>
      l.patientMedicationId === id || l.patientMedicationId?.id === id,
  );

  if (isLoading)
    return (
      <AppLayout title="Loading">
        <SkeletonHeader className="mb-6" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard /><SkeletonChart />
        </div>
      </AppLayout>
    );
  if (!med)
    return (
      <AppLayout title="Not Found">
        <p>Medication not found.</p>
      </AppLayout>
    );

  const todayMissed = todayDoses.filter(
    (d: any) =>
      d.status === "missed" &&
      (d.patientMedicationId?.id === id ||
        d.patientMedicationId?._id === id ||
        d.patientMedicationId === id),
  );

  const now = new Date();

  // Split logs into upcoming (pending) and past (non-pending)
  const upcomingLogs = [...logs]
    .filter((l: any) => l.status === "pending")
    .sort((a, b) => +new Date(a.scheduledTime) - +new Date(b.scheduledTime));

  const pastLogs = [...logs]
    .filter((l: any) => l.status !== "pending")
    .sort((a, b) => +new Date(b.scheduledTime) - +new Date(a.scheduledTime));

  const allSorted = [...logs].sort(
    (a, b) => +new Date(b.scheduledTime) - +new Date(a.scheduledTime),
  );

  const chartData = allSorted
    .slice(0, 15)
    .reverse()
    .map((l, i) => {
      const v =
        l.status === "missed"
          ? 25
          : l.status === "skipped"
            ? 50
            : l.status === "delayed"
              ? 75
              : l.status === "pending"
                ? 0
                : 95;
      return { day: i, value: v, status: l.status };
    });

  const pct = calcAdherence(logs);

  return (
    <AppLayout title={med?.name ?? "Medication"} search="Search medications…">
      <nav className="mb-2 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/patient/medications" className="hover:text-primary">
          Medications
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary">{med.name}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900">
          {med.name} {med.dosage}
        </h1>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <Lock className="h-3 w-3" /> Managed by your doctor
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base p-6">
            <div className="flex gap-6">
              <div className="h-32 w-32 shrink-0 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900" />
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Dosage</p>
                    <p className="text-lg font-bold">{med.dosage}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Times</p>
                    <p className="text-lg font-bold">
                      {((med as any).times ?? med.frequency?.times)?.join(
                        ", ",
                      ) || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Days</p>
                    <p className="text-lg font-bold capitalize">
                      {(med as any).daysOfWeek?.length
                        ? (med as any).daysOfWeek.join(", ")
                        : ((med as any).scheduleType ?? "—")}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  Instructions
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {med.instructions || "—"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold uppercase text-success">
                    {med.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    Started {safeFormat(med.startDate, "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">Adherence Analytics</h3>
                <p className="text-sm text-slate-500">Recent dose history</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{pct}%</p>
                <p className="text-sm font-semibold text-primary">
                  {pct >= 90 ? "Excellent" : pct >= 75 ? "Good" : "Needs work"}
                </p>
              </div>
            </div>
            <div className="mt-6 h-48">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="day" hide />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell
                        key={i}
                        fill={
                          d.status === "missed"
                            ? "hsl(var(--destructive) / 0.7)"
                            : d.status === "skipped"
                              ? "hsl(var(--warning) / 0.7)"
                              : d.status === "pending"
                                ? "hsl(var(--slate-200))"
                                : "hsl(var(--primary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-6">
          {/* Block 1: Dose Schedule — all upcoming pending */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Dose Schedule
              </h3>
              <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-semibold text-info">
                {upcomingLogs.length} upcoming
              </span>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {upcomingLogs.length === 0 ? (
                <p className="text-xs text-slate-500">No upcoming doses.</p>
              ) : (
                upcomingLogs.map((l) => (
                  <div
                    key={(l as any)._id ?? l.id}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {safeFormat(l.scheduledTime, "hh:mm a")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {safeFormat(l.scheduledTime, "EEE, MMM d")}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Block 2: Past Dose Logs — missed / taken / delayed / skipped */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Past Doses</h3>
              {pastLogs.filter((l) => l.status === "missed").length > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  {pastLogs.filter((l) => l.status === "missed").length} missed
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {pastLogs.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No past dose records yet.
                </p>
              ) : (
                pastLogs.map((l) => (
                  <div
                    key={(l as any)._id ?? l.id}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        l.status === "missed"
                          ? "bg-destructive/10 text-destructive"
                          : l.status === "skipped"
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                      }`}
                    >
                      {l.status === "missed" || l.status === "skipped" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p
                        className={`font-semibold ${
                          l.status === "missed"
                            ? "text-destructive"
                            : l.status === "skipped"
                              ? "text-warning"
                              : "text-slate-900"
                        }`}
                      >
                        {l.status === "missed"
                          ? "Missed Dose"
                          : l.status === "skipped"
                            ? "Skipped"
                            : l.status === "delayed"
                              ? `Late by ${l.delayMinutes ?? 0}m`
                              : "Taken on time"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {safeFormat(l.scheduledTime, "EEE, MMM d • hh:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Doses */}
          {todayMissed.length > 0 && (
            <div className="card-base border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-destructive">
                  Today's Doses
                </h3>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  {todayMissed.length} missed
                </span>
              </div>
              <div className="space-y-3">
                {todayMissed.map((d: any) => (
                  <DoseCompletionCard
                    key={d._id ?? d.id}
                    dose={d}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
