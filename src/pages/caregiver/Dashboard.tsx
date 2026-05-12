import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  CheckCheck,
  Clock,
  Phone,
  BellRing,
  Stethoscope,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, KpiCard, SectionCard } from "@/features/shared/ui";
import { usePatients, useTodayDoses, useAlerts } from "@/hooks/queries";
import { format } from "date-fns";
import { safeFormat, safeDistanceToNow } from "@/lib/date";
import { toast } from "sonner";
import type { Alert, TodayMedicationDose } from "@/types";
import { SkeletonStatCard, SkeletonCard, SkeletonList } from "@/components/common/Skeletons";

export default function CaregiverDashboard() {
  const {
    data: patients = [],
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients();
  const {
    data: dosesData = [],
    isLoading: dosesLoading,
    error: dosesError,
  } = useTodayDoses();
  const {
    data: alerts = [],
    isLoading: alertsLoading,
    error: alertsError,
  } = useAlerts({ status: "active" });

  const doses = (dosesData as TodayMedicationDose[]).flatMap((item) =>
    item.scheduledDoses.map((dose, index) => ({
      id: `${item.medication.id}-${index}`,
      patientId: "",
      medicationId: item.medication.id,
      medicationName: item.medication.name,
      dosage: item.medication.dosage,
      scheduledAt: dose.time,
      status: dose.taken ? "taken" : "pending",
      takenAt: dose.taken ? dose.time : undefined,
      assistedBy: undefined,
    })),
  );

  const totalToday = doses.length;
  const completed = doses.filter((d) => d.status === "taken").length;
  const missed = doses.filter((d) => d.status === "missed").length;
  const upcoming = doses.filter((d) => d.status === "pending");

  if (patientsLoading || dosesLoading || alertsLoading) {
    return (
      <AppLayout title="Caregiver Dashboard">
        <PageHeader
          title="Today's Care"
          subtitle={format(new Date(), "EEEE, MMM d")}
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonList rows={5} /><SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (patientsError || dosesError || alertsError) {
    return (
      <AppLayout title="Caregiver Dashboard">
        <PageHeader
          title="Today's Care"
          subtitle={format(new Date(), "EEEE, MMM d")}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">
              Failed to load dashboard data
            </p>
            <p className="text-xs text-slate-500">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Caregiver Dashboard">
      <PageHeader
        title="Today's Care"
        subtitle={format(new Date(), "EEEE, MMM d")}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Assigned Patients"
          value={patients.length}
          sub="Currently in care"
          icon={Users}
          tone="info"
        />
        <KpiCard
          label="Completed Today"
          value={`${completed}/${totalToday}`}
          sub="Doses assisted"
          icon={CheckCheck}
          tone="success"
        />
        <KpiCard
          label="Missed"
          value={missed}
          sub="Need follow-up"
          icon={AlertTriangle}
          tone="destructive"
        />
        <KpiCard
          label="Emergency Alerts"
          value={alerts.filter((a) => a.severity === "critical").length}
          sub="Critical"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Today's Medication Tasks" className="lg:col-span-2">
          <ul className="divide-y divide-slate-100">
            {doses.map((d) => {
              const patient = patients.find((p) => p.id === d.patientId);
              const time = safeFormat(d.scheduledAt, "hh:mm a", "--:--");
              const tone =
                d.status === "taken"
                  ? "bg-success/10 text-success"
                  : d.status === "missed"
                    ? "bg-destructive/10 text-destructive"
                    : d.status === "delayed"
                      ? "bg-warning/10 text-warning"
                      : "bg-accent text-primary";
              return (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tone}`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {patient?.fullName || "Patient"} — {d.medicationName}{" "}
                      {d.dosage}
                    </p>
                    <p className="text-xs text-slate-500">
                      {time} · <span className="capitalize">{d.status}</span>
                      {d.assistedBy && ` · assisted by ${d.assistedBy}`}
                    </p>
                  </div>
                  {(d.status === "pending" ||
                    d.status === "missed" ||
                    d.status === "delayed") && (
                    <button
                      onClick={() => toast.success("Marked as assisted")}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-glow"
                    >
                      Mark Assisted
                    </button>
                  )}
                </li>
              );
            })}
            {doses.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-500">
                No medication tasks scheduled for today.
              </li>
            )}
          </ul>
        </SectionCard>

        <SectionCard title="Quick Patient Cards">
          <ul className="space-y-3">
            {patients.slice(0, 4).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-500 text-sm font-semibold">
                  {p.fullName
                    ? p.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                    : "P"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {p.fullName || "Patient"}
                  </p>
                  <p
                    className={`text-xs font-medium ${p.adherenceRate >= 85 ? "text-success" : p.adherenceRate >= 70 ? "text-warning" : "text-destructive"}`}
                  >
                    {p.adherenceRate}% adherence
                  </p>
                </div>
                <Link
                  to={`/caregiver/patients/${p.id}`}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open
                </Link>
              </li>
            ))}
            {patients.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-500">
                No patients assigned yet.
              </li>
            )}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Upcoming Medication Times"
          className="lg:col-span-2"
        >
          <ul className="space-y-2">
            {upcoming.slice(0, 6).map((d) => {
              const p = patients.find((x) => x.id === d.patientId);
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-900">
                    {p?.fullName || "Patient"}
                  </span>
                  <span className="text-slate-600">
                    {d.medicationName} {d.dosage}
                  </span>
                  <span className="font-semibold text-primary">
                    {safeFormat(d.scheduledAt, "hh:mm a", "--:--")}
                  </span>
                </li>
              );
            })}
            {upcoming.length === 0 && (
              <li className="text-sm text-slate-500">All doses handled.</li>
            )}
          </ul>
        </SectionCard>

        <SectionCard title="Alert Timeline">
          <ul className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <li key={a.id} className="flex gap-2">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.severity === "critical" ? "bg-destructive" : a.severity === "high" ? "bg-destructive/70" : a.severity === "medium" ? "bg-warning" : "bg-info"}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {a.title || a.type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {safeDistanceToNow(a.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="py-4 text-center text-sm text-slate-500">
                No active alerts.
              </li>
            )}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => toast.success("Calling patient…")}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
        >
          <Phone className="h-4 w-4" /> Call Patient
        </button>
        <button
          onClick={() => toast.success("Reminder sent")}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <BellRing className="h-4 w-4" /> Send Reminder
        </button>
        <button
          onClick={() => toast.success("Doctor notified")}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Stethoscope className="h-4 w-4" /> Notify Doctor
        </button>
      </div>
    </AppLayout>
  );
}
