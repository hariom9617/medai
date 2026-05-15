import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/common/Modal";
import { SOSMedicationForm, type SOSMedicationFormData } from "@/components/doctor/SOSMedicationForm";
import {
  useSOSMedication,
  useSOSMedicationLogs,
  useUpdateSOSMedication,
  useUnassignSOSPatient,
  useAssignSOSPatients,
  useDoctorPatients,
} from "@/hooks/queries";
import {
  AlertTriangle,
  ArrowLeft,
  Edit2,
  Users,
  Clock,
  UserMinus,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SOSMedicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  const { data: med, isLoading, isError } = useSOSMedication(id);
  const { data: logs = [] } = useSOSMedicationLogs(id);
  const { data: allPatients = [] } = useDoctorPatients();

  const updateMutation = useUpdateSOSMedication();
  const unassignMutation = useUnassignSOSPatient();
  const assignMutation = useAssignSOSPatients();

  const handleEditSubmit = async (data: SOSMedicationFormData) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, patch: data });
      toast.success("SOS medication updated");
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
  };

  const handleUnassign = async (patientId: string, patientName: string) => {
    if (!id) return;
    try {
      await unassignMutation.mutateAsync({ id, patientId });
      toast.success(`${patientName} unassigned`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to unassign");
    }
  };

  const openAssign = () => {
    setSelectedPatientIds(med?.assignedPatients ?? []);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!id) return;
    try {
      await assignMutation.mutateAsync({ id, patientIds: selectedPatientIds });
      toast.success("Patients updated");
      setIsAssignOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign patients");
    }
  };

  const togglePatient = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId) ? prev.filter((p) => p !== patientId) : [...prev, patientId]
    );
  };

  if (isLoading) {
    return (
      <AppLayout title="SOS Medication">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-base h-32 animate-pulse bg-slate-100" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (isError || !med) {
    return (
      <AppLayout title="SOS Medication">
        <p className="text-sm text-destructive">Failed to load SOS medication.</p>
      </AppLayout>
    );
  }

  const cooldownDisplay =
    med.cooldownMinutes >= 60
      ? `${Math.floor(med.cooldownMinutes / 60)}h${med.cooldownMinutes % 60 > 0 ? ` ${med.cooldownMinutes % 60}m` : ""}`
      : `${med.cooldownMinutes}m`;

  const importanceBadge =
    med.importance === "critical"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-yellow-100 text-yellow-700 border border-yellow-200";

  const assignedPatientObjs = allPatients.filter((p) =>
    (med.assignedPatients ?? []).includes(p.id)
  );

  return (
    <AppLayout title={med.name}>
      {/* Back + header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{med.name}</h1>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
              🚨 SOS
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {med.dosage} {med.unit} · {med.category}
          </p>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Edit2 className="h-4 w-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Details card */}
          <div className="card-base p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Details</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Detail label="Importance">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${importanceBadge}`}>
                  {med.importance === "critical" ? "🔴 Critical" : "🟡 Important"}
                </span>
              </Detail>
              <Detail label="Max Doses / Day">
                <span className="font-semibold text-slate-900">{med.maxDosesPerDay}</span>
              </Detail>
              <Detail label="Cooldown">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {cooldownDisplay}
                </div>
              </Detail>
            </div>

            {med.description && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</p>
                <p className="mt-1.5 text-sm text-slate-700">{med.description}</p>
              </div>
            )}

            {med.instructions && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">When to Take</p>
                <p className="mt-1.5 text-sm text-slate-700">{med.instructions}</p>
              </div>
            )}

            {med.sideEffects && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Side Effects</p>
                <p className="mt-1.5 text-sm text-slate-700">{med.sideEffects}</p>
              </div>
            )}
          </div>

          {/* SOS Dose Log */}
          <div className="card-base p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              SOS Dose History
            </h2>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-400">No emergency doses logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="pb-2 text-left">Patient</th>
                      <th className="pb-2 text-left">Taken At</th>
                      <th className="pb-2 text-left">Reason</th>
                      <th className="pb-2 text-center">Pain</th>
                      <th className="pb-2 text-center">Photo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="py-2">
                        <td className="py-2.5 pr-4 font-medium text-slate-900">
                          {log.patientName ?? log.patientId}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">
                          {format(new Date(log.takenAt), "MMM d, h:mm a")}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-600">{log.reason}</td>
                        <td className="py-2.5 text-center">
                          {log.painLevel != null ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                log.painLevel >= 7
                                  ? "bg-red-100 text-red-700"
                                  : log.painLevel >= 4
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {log.painLevel}/10
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          {log.verifiedPhotoUrl ? (
                            <a
                              href={log.verifiedPhotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center text-primary hover:text-primary-glow"
                            >
                              <Camera className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column: assigned patients */}
        <div className="space-y-4">
          <div className="card-base p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Assigned Patients
              </h2>
              <button
                onClick={openAssign}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <Users className="h-3.5 w-3.5" />
                Manage
              </button>
            </div>

            {assignedPatientObjs.length === 0 ? (
              <p className="text-sm text-slate-400">No patients assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {assignedPatientObjs.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.fullName}</p>
                      {p.email && <p className="text-xs text-slate-400">{p.email}</p>}
                    </div>
                    <button
                      onClick={() => handleUnassign(p.id, p.fullName)}
                      disabled={unassignMutation.isPending}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-destructive disabled:opacity-50"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit SOS Medication"
        subtitle="Update emergency medication details"
        size="lg"
      >
        <SOSMedicationForm
          mode="edit"
          initialData={med}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
          isSubmitting={updateMutation.isPending}
        />
      </Modal>

      {/* Assign Modal */}
      <Modal
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign to Patients"
        subtitle={`Select patients who can use ${med.name}`}
        size="md"
      >
        <div className="space-y-3">
          {allPatients.length === 0 ? (
            <p className="text-sm text-slate-500">No patients found.</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {allPatients.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPatientIds.includes(p.id)}
                    onChange={() => togglePatient(p.id)}
                    className="h-4 w-4 rounded border-slate-300 text-red-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.fullName}</p>
                    {p.email && <p className="text-xs text-slate-500">{p.email}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsAssignOpen(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              disabled={assignMutation.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {assignMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
