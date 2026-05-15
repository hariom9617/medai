// src/pages/doctor/PatientDetail.tsx
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Printer, FilePlus, AlertTriangle, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PatientHeader } from "@/features/patients/components/PatientHeader";
import { SectionCard, EmptyState } from "@/features/shared/ui";
import { AdherenceChart } from "@/features/adherence/components/AdherenceChart";
import { AdherenceBars } from "@/features/adherence/components/AdherenceBars";
import { RiskPredictionCard } from "@/features/ai/components/RiskPredictionCard";
import { MedicationTimelineRow } from "@/features/medications/components/MedicationTimelineRow";
import { CaregiverAssignment } from "@/components/doctor/CaregiverAssignment";
import {
  AssignMedicationModal,
  type AssignMedicationFormData,
} from "@/components/doctor/AssignMedicationModal";
import {
  SkeletonCard,
  SkeletonStatCard,
  SkeletonHeader,
  SkeletonRow,
} from "@/components/common/Skeletons";
import {
  useDoctorPatient,
  useDoctorPatientMedications,
  useDoctorPatientDoseLogs,
  useDoctorAlerts,
  useRisk,
  useInsights,
  useDoctorPatientAdherence,
  useCreateIntervention,
  useDoctorInterventions,
  usePatientAssignedMedications,
  useAssignMedicationToPatient,
  useDeletePatientMedicationAssignment,
  useSOSMedications,
  useAssignSOSPatients,
  useUnassignSOSPatient,
} from "@/hooks/queries";
import {
  Pill,
  Send,
  BellRing,
  CalendarClock,
  NotebookPen,
  Inbox,
  Trash2,
  AlertTriangle as SirenIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, isValid } from "date-fns";
import type { MockPatient, MockDose } from "@/features/shared/mock/patients";
import type { Intervention, PatientMedicationAssignment } from "@/types";

// FIXED: safe date formatter — never throws
function safeDistanceToNow(dateVal: string | null | undefined): string {
  if (!dateVal) return "some time";
  const d = new Date(dateVal);
  if (!isValid(d)) return "some time";
  return formatDistanceToNow(d);
}

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const { data: patientSummary, isLoading } = useDoctorPatient(id);
  const { data: medications = [] } = useDoctorPatientMedications(id);
  const { data: doseLogs = [] } = useDoctorPatientDoseLogs(id);
  const { data: alerts = [] } = useDoctorAlerts();
  const { data: riskData } = useRisk(id);
  const { data: adherenceHistory } = useDoctorPatientAdherence(id);
  const { data: interventions = [], isLoading: isLoadingInterventions } =
    useDoctorInterventions(id);
  const { data: medicationAssignments = [] } =
    usePatientAssignedMedications(id);
  const createIntervention = useCreateIntervention();
  const assignMedication = useAssignMedicationToPatient();
  const deleteAssignment = useDeletePatientMedicationAssignment(id || "");

  const { data: sosMedications = [] } = useSOSMedications();
  const assignSOSPatients = useAssignSOSPatients();
  const unassignSOSPatient = useUnassignSOSPatient();

  const [note, setNote] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignSOSModalOpen, setIsAssignSOSModalOpen] = useState(false);
  const [pendingSOSIds, setPendingSOSIds] = useState<string[]>([]);

  const monthlyAdherence = useMemo(() => {
    const history = Array.isArray(adherenceHistory) ? adherenceHistory : [];
    return history.slice(-30).map((h, i) => ({
      date: h.date ?? `D${i + 1}`,
      rate: h.adherence ?? 0,
    }));
  }, [adherenceHistory]);

  const weeklyAdherence = useMemo(() => {
    const history = Array.isArray(adherenceHistory) ? adherenceHistory : [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      rate: history.slice(-7)[i]?.adherence ?? 0,
    }));
  }, [adherenceHistory]);

  const assignedCaregiverIds = useMemo(() => {
    const caregivers = (patientSummary as any)?.caregivers ?? [];
    return caregivers.map((c: any) => {
      const cg = c.caregiverId;
      return typeof cg === "object" ? cg.id || cg._id || "" : String(cg);
    });
  }, [patientSummary]);

  const recentMissedDoses = useMemo(() => {
    return doseLogs
      .filter((d) => d.status === "missed" || d.status === "delayed")
      .slice(0, 5);
  }, [doseLogs]);

  const patient: MockPatient | null = patientSummary
    ? {
        id: patientSummary.patient?.id ?? "",
        fullName: patientSummary.patient?.fullName ?? "Unknown",
        age: (patientSummary.patient as any)?.age ?? 0,
        email: patientSummary.patient?.email ?? "",
        phone: (patientSummary.patient as any)?.phone ?? "",
        avatarColor: "bg-slate-100 text-slate-600",
        adherenceRate: patientSummary.adherenceSummary?.weeklyRate ?? 0,
        riskLevel:
          (patientSummary.adherenceSummary?.weeklyRate ?? 100) < 70
            ? "high"
            : (patientSummary.adherenceSummary?.weeklyRate ?? 100) < 85
              ? "medium"
              : "low",
        riskScore: 100 - (patientSummary.adherenceSummary?.weeklyRate ?? 0),
        activeMedications: patientSummary.medications?.length ?? 0,
        missedThisWeek: 0,
        caregiver: "Assigned Caregiver",
        doctor: "Dr. Patel",
        nextDoseAt: "--:--",
        nextMedication: "N/A",
        lastActiveISO: new Date().toISOString(),
        conditions: (patientSummary.patient as any)?.conditions ?? [],
        emergencyContact: patientSummary.patient?.email ?? "",
      }
    : null;

  if (isLoading || !patient) {
    return (
      <AppLayout title="Patient">
        <SkeletonHeader className="mb-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  const handleSendIntervention = async () => {
    try {
      await createIntervention.mutateAsync({
        patientId: id!,
        data: {
          type: "reminder_sent",
          detail: "Doctor sent intervention reminder",
          notes: note || "Standard intervention",
        },
      });
      toast.success("Intervention sent");
      setNote("");
    } catch {
      toast.error("Failed to send intervention");
    }
  };

  const handleAssignMedication = async (data: AssignMedicationFormData) => {
    try {
      await assignMedication.mutateAsync({
        patientId: id!,
        input: {
          medicationId: data.medicationId,
          dosage: data.dosage,
          scheduleType: data.scheduleType,
          times: data.times,
          daysOfWeek: data.daysOfWeek,
          instructions: data.instructions,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      });
      toast.success("Medication assigned to patient");
      setIsAssignModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to assign medication");
    }
  };

  const handleDeleteAssignment = async (
    assignmentId: string,
    medicationName: string,
  ) => {
    if (
      !confirm(`Remove ${medicationName} from this patient's treatment plan?`)
    )
      return;
    try {
      await deleteAssignment.mutateAsync(assignmentId);
      toast.success("Medication removed from patient");
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove medication");
    }
  };

  return (
    <AppLayout title={patient.fullName}>
      <PatientHeader patient={patient} backTo="/doctor/patients" />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => toast.success("Schedule adjustment requested")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
        >
          <CalendarClock className="h-4 w-4" /> Adjust Schedule
        </button>
        <button
          onClick={handleSendIntervention}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Send className="h-4 w-4" /> Send Intervention
        </button>
        <button
          onClick={() => toast.success(`${patient.caregiver} notified`)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <BellRing className="h-4 w-4" /> Notify Caregiver
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="30-Day Adherence Trend">
            <AdherenceChart data={monthlyAdherence} xKey="date" />
          </SectionCard>

          <SectionCard title="Weekly Pattern">
            <AdherenceBars data={weeklyAdherence} />
          </SectionCard>

          <SectionCard title="Treatment Plan & Schedule">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {medicationAssignments.length} assigned medication
                  {medicationAssignments.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-glow"
                >
                  <Plus className="h-4 w-4" /> Assign Medication
                </button>
              </div>
              {medicationAssignments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No medications assigned yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {medicationAssignments.map(
                    (assignment: PatientMedicationAssignment) => (
                      <li
                        key={assignment.id || assignment._id}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                            <Pill className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
                              {(assignment.medicationId as any)?.name ||
                                "Unknown Medication"}{" "}
                              <span className="text-slate-500">
                                {assignment.dosage}
                              </span>
                            </p>
                            {assignment.instructions && (
                              <p className="text-xs text-slate-500">
                                {assignment.instructions}
                              </p>
                            )}
                            <div className="mt-2 text-xs text-slate-600">
                              {assignment.scheduleType === "daily"
                                ? "Daily"
                                : `On ${assignment.daysOfWeek?.join(", ")}`}{" "}
                              at {assignment.times?.join(", ")}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment.id || assignment._id || "",
                                (assignment.medicationId as any)?.name ||
                                  "Medication",
                              )
                            }
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </SectionCard>

          {/* SOS Medications Section */}
          {(() => {
            const patientId = id ?? "";
            const assignedSOS = sosMedications.filter((s) =>
              (s.assignedPatients ?? []).includes(patientId)
            );

            const handleOpenAssignSOS = () => {
              setPendingSOSIds(assignedSOS.map((s) => s.id));
              setIsAssignSOSModalOpen(true);
            };

            const handleSaveSOSAssignments = async () => {
              const wasAssigned = new Set(assignedSOS.map((s) => s.id));
              const nowAssigned = new Set(pendingSOSIds);

              const toAssign = [...nowAssigned].filter((sid) => !wasAssigned.has(sid));
              const toRemove = [...wasAssigned].filter((sid) => !nowAssigned.has(sid));

              try {
                await Promise.all([
                  ...toAssign.map((sid) => {
                    const med = sosMedications.find((m) => m.id === sid);
                    const existing = med?.assignedPatients ?? [];
                    return assignSOSPatients.mutateAsync({
                      id: sid,
                      patientIds: [...existing, patientId],
                    });
                  }),
                  ...toRemove.map((sid) =>
                    unassignSOSPatient.mutateAsync({ id: sid, patientId })
                  ),
                ]);
                toast.success("SOS medications updated");
                setIsAssignSOSModalOpen(false);
              } catch (err: any) {
                toast.error(err?.message || "Failed to update SOS medications");
              }
            };

            const handleQuickUnassign = async (sosId: string, sosName: string) => {
              if (!confirm(`Remove ${sosName} from this patient?`)) return;
              try {
                await unassignSOSPatient.mutateAsync({ id: sosId, patientId });
                toast.success(`${sosName} removed`);
              } catch (err: any) {
                toast.error(err?.message || "Failed to remove");
              }
            };

            return (
              <>
                <SectionCard title="SOS (Emergency) Medications">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {assignedSOS.length} SOS medication{assignedSOS.length === 1 ? "" : "s"} assigned
                      </p>
                      <button
                        onClick={handleOpenAssignSOS}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        <Plus className="h-4 w-4" /> Assign SOS Medication
                      </button>
                    </div>

                    {assignedSOS.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-red-200 bg-red-50/40 p-6 text-center text-sm text-slate-500">
                        No SOS medications assigned yet.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {assignedSOS.map((sos) => {
                          const cooldown =
                            sos.cooldownMinutes >= 60
                              ? `${Math.floor(sos.cooldownMinutes / 60)}h${sos.cooldownMinutes % 60 > 0 ? ` ${sos.cooldownMinutes % 60}m` : ""}`
                              : `${sos.cooldownMinutes}m`;
                          return (
                            <li key={sos.id} className="rounded-xl border border-red-100 bg-white p-4">
                              <div className="flex items-start gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
                                  <SirenIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-900">{sos.name}</p>
                                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                                      🚨 SOS
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {sos.dosage} {sos.unit} · {sos.category}
                                  </p>
                                  {sos.instructions && (
                                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                      {sos.instructions}
                                    </p>
                                  )}
                                  <div className="mt-1.5 flex gap-3 text-xs text-slate-400">
                                    <span>Max {sos.maxDosesPerDay}/day</span>
                                    <span>Cooldown: {cooldown}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleQuickUnassign(sos.id, sos.name)}
                                  disabled={unassignSOSPatient.isPending}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </SectionCard>

                {/* Assign SOS Modal */}
                {isAssignSOSModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                      className="absolute inset-0 bg-slate-900/40"
                      onClick={() => setIsAssignSOSModalOpen(false)}
                    />
                    <div className="relative w-full max-w-lg card-base p-6 max-h-[90vh] overflow-y-auto">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Assign SOS Medications</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Select emergency medications for {patient?.fullName}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAssignSOSModalOpen(false)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
                        >
                          ✕
                        </button>
                      </div>

                      {sosMedications.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No SOS medications in the catalog. Create one first.
                        </p>
                      ) : (
                        <div className="max-h-80 space-y-2 overflow-y-auto">
                          {sosMedications.map((sos) => {
                            const checked = pendingSOSIds.includes(sos.id);
                            const cooldown =
                              sos.cooldownMinutes >= 60
                                ? `${Math.floor(sos.cooldownMinutes / 60)}h cooldown`
                                : `${sos.cooldownMinutes}m cooldown`;
                            return (
                              <label
                                key={sos.id}
                                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setPendingSOSIds((prev) =>
                                      checked
                                        ? prev.filter((i) => i !== sos.id)
                                        : [...prev, sos.id]
                                    )
                                  }
                                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-900">{sos.name}</p>
                                    <span
                                      className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                                        sos.importance === "critical"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {sos.importance === "critical" ? "🔴 Critical" : "🟡 Important"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {sos.dosage} {sos.unit} · {sos.category} · {cooldown}
                                  </p>
                                  {sos.instructions && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                      {sos.instructions}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => setIsAssignSOSModalOpen(false)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSOSAssignments}
                          disabled={assignSOSPatients.isPending || unassignSOSPatient.isPending}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {assignSOSPatients.isPending || unassignSOSPatient.isPending
                            ? "Saving..."
                            : "Save Assignments"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          <SectionCard title="Today's Dose Timeline">
            <div className="space-y-3">
              {doseLogs.length === 0 ? (
                <EmptyState icon={Inbox} title="No doses scheduled today" />
              ) : (
                doseLogs.slice(0, 5).map((d) => (
                  <MedicationTimelineRow
                    key={d.id || d._id}
                    dose={
                      {
                        id: d.id || d._id || "",
                        patientId: d.patientId,
                        medicationId:
                          typeof d.medicationId === "string"
                            ? d.medicationId
                            : ((d.medicationId as any)?._id ?? ""),
                        medicationName:
                          typeof d.medicationId === "object"
                            ? ((d.medicationId as any)?.name ?? "Unknown")
                            : "Unknown",
                        dosage:
                          typeof d.medicationId === "object"
                            ? ((d.medicationId as any)?.dosage ?? "")
                            : "",
                        scheduledAt: d.scheduledTime ?? null,
                        status: d.status,
                        takenAt: d.takenAt,
                      } as MockDose
                    }
                  />
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Recent Missed Doses">
            {recentMissedDoses.length === 0 ? (
              <EmptyState icon={Inbox} title="No recent missed doses" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentMissedDoses.map((d) => (
                  <li
                    key={d.id || d._id}
                    className="flex items-center gap-4 py-3"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {typeof d.medicationId === "object"
                          ? (d.medicationId as any)?.name
                          : "Medication"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.scheduledTime
                          ? new Date(d.scheduledTime).toLocaleString()
                          : "Unknown time"}{" "}
                        · {d.status}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        d.status === "missed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {d.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Intervention History">
            {isLoadingInterventions ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : interventions.length === 0 ? (
              <EmptyState
                icon={NotebookPen}
                title="No interventions recorded"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {interventions.map((intervention: Intervention) => (
                  <li key={intervention.id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {intervention.detail}
                        </p>
                        {/* FIXED: safeDistanceToNow guards null/invalid dates */}
                        <p className="text-xs text-slate-500">
                          {intervention.createdByName ||
                            intervention.createdByRole ||
                            "System"}{" "}
                          · {safeDistanceToNow(intervention.createdAt)} ago
                        </p>
                        {intervention.notes && (
                          <p className="mt-1 text-sm text-slate-600">
                            {intervention.notes}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {intervention.type?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          {riskData && (
            <RiskPredictionCard
              prediction={riskData}
              patientName={patient.fullName}
            />
          )}

          <SectionCard title="Active Alerts">
            {alerts.length === 0 ? (
              <EmptyState icon={BellRing} title="No active alerts" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {alerts.slice(0, 5).map((alert) => (
                  <li key={alert.id || alert._id} className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                          alert.severity === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : alert.severity === "high"
                              ? "bg-warning/10 text-warning"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {alert.message}
                        </p>
                        {/* FIXED: safeDistanceToNow guards null/invalid dates */}
                        <p className="text-xs text-slate-500">
                          {safeDistanceToNow(alert.createdAt)} ago
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" /> Assign Medication
              </button>
              <button
                onClick={() => toast.success("Caregiver assignment opened")}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FilePlus className="h-4 w-4" /> Assign Caregiver
              </button>
              <button
                onClick={() => toast.success("Report generated")}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" /> Print Report
              </button>
            </div>
          </SectionCard>

          <CaregiverAssignment
            patientId={id!}
            assignedCaregiverIds={assignedCaregiverIds}
          />
        </div>
      </div>

      <AssignMedicationModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignMedication}
        isSubmitting={assignMedication.isPending}
      />
    </AppLayout>
  );
}
