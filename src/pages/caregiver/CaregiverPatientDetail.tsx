import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PatientHeader } from "@/features/patients/components/PatientHeader";
import { SectionCard, EmptyState } from "@/features/shared/ui";
import { DoseCompletionCard } from "@/components/caregiver/DoseCompletionCard";
import { usePatientSummary, useTodayDoses, useAlerts } from "@/hooks/queries";
import { Phone, Stethoscope, AlertTriangle, Lock, Mail, Inbox, CheckCircle2, Pill } from "lucide-react";
import { toast } from "sonner";
import { safeDistanceToNow, safeFormat } from "@/lib/date";
import type { Alert } from "@/types";
import { SkeletonCard, SkeletonStatCard, SkeletonHeader } from "@/components/common/Skeletons";

export default function CaregiverPatientDetail() {
  const { id } = useParams();
  const { data: summary, isLoading, error } = usePatientSummary(id);
  const { data: rawDoses = [] } = useTodayDoses(id);
  const { data: alerts = [] } = useAlerts({});

  // Sort by scheduledTime
  const todayDoses = [...rawDoses].sort(
    (a: any, b: any) => +new Date(a.scheduledTime) - +new Date(b.scheduledTime)
  );

  const takenToday = todayDoses.filter(
    (d: any) => d.status === "taken" || d.status === "delayed"
  ).length;

  const now = new Date();

  // Split into pending/upcoming vs past for display
  const activeDoses = todayDoses.filter(
    (d: any) => d.status === "pending" || d.status === "taken" ||
                d.status === "missed" || d.status === "delayed"
  );

  if (isLoading) {
    return (
      <AppLayout title="Patient">
        <SkeletonHeader className="mb-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0,1,2].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard /><SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (error || !summary?.patient) {
    return (
      <AppLayout title="Patient">
        <EmptyState icon={AlertTriangle} title="Patient not found" />
      </AppLayout>
    );
  }

  const patient = summary.patient as any;
  const adherenceArr: any[] = Array.isArray(summary.adherence) ? summary.adherence : [];
  const avgAdherence = adherenceArr.length
    ? Math.round(adherenceArr.reduce((a: number, m: any) => a + (m.adherence ?? 0), 0) / adherenceArr.length)
    : 0;
  const recentAlerts: any[] = Array.isArray(summary.recentAlerts) ? summary.recentAlerts : [];

  const extendedPatient = {
    id: patient.id ?? patient._id,
    fullName: patient.fullName ?? "Unknown",
    email: patient.email ?? "",
    phone: patient.phone ?? "",
    age: patient.age ?? 0,
    conditions: patient.conditions ?? [],
    emergencyContact: patient.emergencyContact?.phone ?? patient.emergencyContact ?? "N/A",
    avatarColor: "bg-slate-100 text-slate-700",
    adherenceRate: avgAdherence,
    riskLevel: (avgAdherence < 50
      ? "high"
      : avgAdherence < 80
        ? "medium"
        : "low") as "low" | "medium" | "high",
    riskScore: 100 - avgAdherence,
    activeMedications: adherenceArr.length,
    missedThisWeek: recentAlerts.filter((a) => a.type === "missed_dose").length,
    caregiver: "You",
    doctor: "—",
    nextDoseAt: "—",
    nextMedication: "N/A",
    lastActiveISO: patient.updatedAt ?? new Date().toISOString(),
    isActive: patient.isActive ?? true,
  };

  const patientAlerts = alerts.filter((a: Alert) => a.patientId === id);

  return (
    <AppLayout title={patient.fullName}>
      <PatientHeader patient={extendedPatient} backTo="/caregiver/patients" />

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => toast.success("Calling patient…")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">
          <Phone className="h-4 w-4" /> Contact Patient
        </button>
        <button onClick={() => toast.success("Doctor notified")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Stethoscope className="h-4 w-4" /> Notify Doctor
        </button>
        <button onClick={() => toast.error("Emergency escalated to physician")} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90">
          <AlertTriangle className="h-4 w-4" /> Escalate Emergency
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {/* TODAY'S DOSES */}
          <SectionCard title={`Today's Medication Schedule (${takenToday}/${todayDoses.length} done)`}>
            <div className="space-y-3">
              {todayDoses.length === 0 ? (
                <EmptyState icon={Inbox} title="No doses scheduled today" />
              ) : (
                activeDoses.map((d: any) => {
                  const isFuture = new Date(d.scheduledTime) > now;
                  const med = typeof d.medicationId === "object" ? d.medicationId : null;
                  const name = (med as any)?.name ?? "Medication";
                  const dosage = (med as any)?.dosage ?? (med as any)?.strength ?? "";
                  const time = safeFormat(d.scheduledTime, "hh:mm a", "--:--");
                  const isPending = d.status === "pending";
                  const isTaken = d.status === "taken" || d.status === "delayed";
                  const isMissed = d.status === "missed";

                  return (
                    <div key={d.id ?? d._id} className={`rounded-xl border p-4 ${
                      isTaken ? "border-success/30 bg-success/5"
                      : isMissed ? "border-destructive/30 bg-destructive/5"
                      : isFuture ? "border-slate-100 bg-slate-50"
                      : "border-primary/20 bg-accent/20"
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                          isTaken ? "bg-success text-white"
                          : isMissed ? "bg-destructive/10 text-destructive"
                          : "bg-accent text-primary"
                        }`}>
                          {isTaken ? <CheckCircle2 className="h-5 w-5" />
                          : isMissed ? <AlertTriangle className="h-5 w-5" />
                          : <Pill className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold uppercase tracking-wider ${
                            isMissed ? "text-destructive" : isTaken ? "text-success" : "text-primary"
                          }`}>
                            {time}
                            {isMissed && " · MISSED"}
                            {isTaken && " · COMPLETED"}
                            {isPending && !isFuture && " · DUE NOW"}
                            {isFuture && " · UPCOMING"}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900">
                            {name} <span className="text-slate-500 font-normal">{dosage}</span>
                          </p>
                          {(med as any)?.instructions && (
                            <p className="text-xs text-slate-500">{(med as any).instructions}</p>
                          )}
                        </div>
                        {/* Action button via DoseCompletionCard logic */}
                        {!isTaken && !isFuture && (
                          <DoseCompletionCard dose={d} compact />
                        )}
                        {isTaken && (
                          <span className="rounded-lg bg-success/20 px-3 py-1.5 text-xs font-semibold text-success shrink-0">
                            Done
                          </span>
                        )}
                        {isFuture && (
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400 shrink-0">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          {/* RECENT ALERTS */}
          <SectionCard title="Recent Alerts">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-slate-500">No recent alerts.</p>
            ) : (
              <ul className="space-y-3">
                {recentAlerts.slice(0, 5).map((a) => (
                  <li key={a.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-semibold text-slate-900">{a.message}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {safeDistanceToNow(a.createdAt, { addSuffix: true })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Doctor Instructions">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              <Lock className="mr-1 inline h-3.5 w-3.5" /> You cannot prescribe, modify dosages, or change treatment plans.
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Adherence Summary">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-slate-500">Overall</p>
                <p className="text-lg font-bold text-primary">{avgAdherence}%</p>
              </div>
              {adherenceArr.map((m: any) => (
                <div key={m.medicationId} className="flex items-baseline justify-between">
                  <p className="text-sm text-slate-500 truncate max-w-[120px]">{m.name}</p>
                  <p className="text-lg font-bold text-slate-900">{m.adherence ?? 0}%</p>
                </div>
              ))}
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-slate-500">Missed alerts</p>
                <p className="text-lg font-bold text-destructive">
                  {recentAlerts.filter((a) => a.type === "missed_dose").length}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Patient Info">
            <div className="space-y-2 text-sm">
              {patient.conditions?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500">Conditions</p>
                  <p className="font-medium">{patient.conditions.join(", ")}</p>
                </div>
              )}
              {patient.emergencyContact && typeof patient.emergencyContact === "object" && (
                <div>
                  <p className="text-xs text-slate-500">Emergency Contact</p>
                  <p className="font-medium">{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
                  <p className="text-xs text-slate-500">{patient.emergencyContact.phone}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${patient.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Phone className="h-3.5 w-3.5" /> {patient.phone}
              </a>
              <a href={`mailto:${patient.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  );
}