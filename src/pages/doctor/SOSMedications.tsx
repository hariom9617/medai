import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/common/Modal";
import { SOSMedicationForm, type SOSMedicationFormData } from "@/components/doctor/SOSMedicationForm";
import { PageHeader, SearchInput, EmptyState } from "@/features/shared/ui";
import {
  useSOSMedications,
  useCreateSOSMedication,
  useUpdateSOSMedication,
  useDeleteSOSMedication,
  useAssignSOSPatients,
  useDoctorPatients,
} from "@/hooks/queries";
import type { SOSMedication } from "@/types";
import { AlertTriangle, Plus, Edit2, Trash2, Users, Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function DoctorSOSMedications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedMed, setSelectedMed] = useState<SOSMedication | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SOSMedication | null>(null);
  const [assignMed, setAssignMed] = useState<SOSMedication | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  const { data: medications = [], isLoading } = useSOSMedications();
  const { data: patients = [] } = useDoctorPatients();
  const createMutation = useCreateSOSMedication();
  const updateMutation = useUpdateSOSMedication();
  const deleteMutation = useDeleteSOSMedication();
  const assignMutation = useAssignSOSPatients();

  const filtered = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setFormMode("create");
    setSelectedMed(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (med: SOSMedication) => {
    setFormMode("edit");
    setSelectedMed(med);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: SOSMedicationFormData) => {
    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(data);
        toast.success("SOS medication created");
      } else if (selectedMed) {
        await updateMutation.mutateAsync({ id: selectedMed.id, patch: data });
        toast.success("SOS medication updated");
      }
      setIsFormModalOpen(false);
      setSelectedMed(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save SOS medication");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      toast.success(`${deleteConfirm.name} deleted`);
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  const openAssign = (med: SOSMedication) => {
    setAssignMed(med);
    setSelectedPatientIds(med.assignedPatients ?? []);
  };

  const handleAssignSubmit = async () => {
    if (!assignMed) return;
    try {
      await assignMutation.mutateAsync({ id: assignMed.id, patientIds: selectedPatientIds });
      toast.success("Patients assigned");
      setAssignMed(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign patients");
    }
  };

  const togglePatient = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId]
    );
  };

  return (
    <AppLayout title="SOS Medications">
      <PageHeader
        title="SOS Medications"
        subtitle="Emergency medications for critical situations"
      />

      {/* Actions Bar */}
      <div className="card-base mb-6 flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-[200px] flex-1">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search SOS medications..." />
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Plus className="h-4 w-4" /> Create SOS Medication
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-base h-52 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={searchQuery ? "No SOS medications match your search" : "No SOS medications yet"}
          description={
            searchQuery
              ? "Try a different search term."
              : "Create your first SOS medication to enable emergency dose tracking."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((med) => (
            <SOSMedicationCard
              key={med.id}
              med={med}
              onEdit={() => handleEdit(med)}
              onDelete={() => setDeleteConfirm(med)}
              onAssign={() => openAssign(med)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedMed(null); }}
        title={formMode === "create" ? "🚨 Create SOS Medication" : "Edit SOS Medication"}
        subtitle={
          formMode === "create"
            ? "Add an emergency medication for critical situations"
            : "Update emergency medication details"
        }
        size="lg"
      >
        <SOSMedicationForm
          mode={formMode}
          initialData={selectedMed ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormModalOpen(false); setSelectedMed(null); }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete SOS Medication"
        subtitle="This action cannot be undone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This will remove
            it from all assigned patients.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteMutation.isPending}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Patients Modal */}
      <Modal
        open={!!assignMed}
        onClose={() => setAssignMed(null)}
        title="Assign to Patients"
        subtitle={`Select patients who can use ${assignMed?.name}`}
        size="md"
      >
        <div className="space-y-3">
          {patients.length === 0 ? (
            <p className="text-sm text-slate-500">No patients found.</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {patients.map((p) => (
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
              onClick={() => setAssignMed(null)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              disabled={assignMutation.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {assignMutation.isPending ? "Saving..." : "Assign Patients"}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function SOSMedicationCard({
  med,
  onEdit,
  onDelete,
  onAssign,
}: {
  med: SOSMedication;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}) {
  const cooldownDisplay =
    med.cooldownMinutes >= 60
      ? `${Math.floor(med.cooldownMinutes / 60)}h${med.cooldownMinutes % 60 > 0 ? ` ${med.cooldownMinutes % 60}m` : ""}`
      : `${med.cooldownMinutes}m`;

  const importanceBadge =
    med.importance === "critical"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-yellow-100 text-yellow-700 border border-yellow-200";

  return (
    <div className="card-base group relative overflow-hidden border-l-4 border-l-red-400">
      {/* SOS badge */}
      <div className="absolute right-3 top-3 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
        🚨 SOS
      </div>

      <div className="p-4 pr-16">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">{med.name}</h3>
            <p className="text-xs text-slate-500">{med.dosage} {med.unit}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${importanceBadge}`}>
                {med.importance === "critical" ? "🔴 Critical" : "🟡 Important"}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {med.category}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Cooldown: {cooldownDisplay}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Max {med.maxDosesPerDay}/day</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{med.patientCount ?? med.assignedPatients?.length ?? 0} patients</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-slate-100 p-2">
        <button
          onClick={onAssign}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Users className="h-3.5 w-3.5" />
          Assign to Patients
        </button>
        <Link
          to={`/doctor/sos-medications/${med.id}`}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={onEdit}
          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
