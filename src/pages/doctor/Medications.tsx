import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/common/Modal";
import { MedicationCatalogForm, type MedicationCatalogFormData } from "@/components/doctor/MedicationCatalogForm";
import {
  PageHeader,
  SearchInput,
  EmptyState,
} from "@/features/shared/ui";
import {
  useDoctorMedications,
  useDoctorCreateMedicationCatalog,
  useDoctorUpdateMedicationCatalog,
  useDoctorDeleteMedicationCatalog,
} from "@/hooks/queries";
import type { MedicationCatalog } from "@/types";
import { Pill, Plus, Edit2, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function DoctorMedications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedMedication, setSelectedMedication] = useState<MedicationCatalog | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<MedicationCatalog | null>(null);

  const { data: medications = [], isLoading } = useDoctorMedications();
  const createMutation = useDoctorCreateMedicationCatalog();
  const updateMutation = useDoctorUpdateMedicationCatalog();
  const deleteMutation = useDoctorDeleteMedicationCatalog();

  const filteredMedications = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setFormMode("create");
    setSelectedMedication(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (medication: MedicationCatalog) => {
    setFormMode("edit");
    setSelectedMedication(medication);
    setIsFormModalOpen(true);
  };

  const handleDelete = (medication: MedicationCatalog) => {
    setDeleteConfirmation(medication);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirmation.id || deleteConfirmation._id || "");
      toast.success(`${deleteConfirmation.name} deleted from catalog`);
      setDeleteConfirmation(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete medication");
    }
  };

  const handleFormSubmit = async (data: MedicationCatalogFormData) => {
    try {
      const sideEffectsArray = data.sideEffects
        ? data.sideEffects.split(",").map(s => s.trim()).filter(s => s.length > 0)
        : undefined;

      if (formMode === "create") {
        await createMutation.mutateAsync({
          name: data.name,
          genericName: data.genericName,
          category: data.category,
          strength: data.strength,
          form: data.form,
          importance: data.importance,
          manufacturer: data.manufacturer,
          description: data.description,
          sideEffects: sideEffectsArray,
        });
        toast.success("Medication added to catalog");
      } else if (formMode === "edit" && selectedMedication) {
        await updateMutation.mutateAsync({
          id: selectedMedication.id || selectedMedication._id || "",
          patch: {
            ...data,
            importance: data.importance,
            sideEffects: sideEffectsArray,
          },
        });
        toast.success("Medication updated");
      }
      setIsFormModalOpen(false);
      setSelectedMedication(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save medication");
    }
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setSelectedMedication(null);
  };

  return (
    <AppLayout title="Medication Catalog">
      <PageHeader
        title="Medication Catalog"
        subtitle={`${medications.length} medications available for prescription`}
      />

      {/* Actions Bar */}
      <div className="card-base mb-6 flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-[200px] flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search medications by name, generic name, or category..."
          />
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
        >
          <Plus className="h-4 w-4" /> Create Medication
        </button>
      </div>

      {/* Medications List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-base h-48 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : filteredMedications.length === 0 ? (
        <EmptyState
          icon={Package}
          title={searchQuery ? "No medications match your search" : "No medications in catalog"}
          description={
            searchQuery
              ? "Try a different search term or clear the search."
              : "Create your first medication to start building your prescription catalog."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMedications.map((medication) => (
            <MedicationCard
              key={medication.id || medication._id}
              medication={medication}
              onEdit={() => handleEdit(medication)}
              onDelete={() => handleDelete(medication)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={isFormModalOpen}
        onClose={handleFormCancel}
        title={formMode === "create" ? "Create Medication" : "Edit Medication"}
        subtitle={
          formMode === "create"
            ? "Add a new medication to the catalog for prescription"
            : "Update medication details in the catalog"
        }
        size="lg"
      >
        <MedicationCatalogForm
          mode={formMode}
          initialData={selectedMedication || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        title="Delete Medication"
        subtitle="This action cannot be undone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deleteConfirmation?.name}</strong> from the
            medication catalog? This will not affect existing patient prescriptions.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setDeleteConfirmation(null)}
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
    </AppLayout>
  );
}

function MedicationCard({
  medication,
  onEdit,
  onDelete,
}: {
  medication: MedicationCatalog;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card-base group relative overflow-hidden">
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent text-primary">
            <Pill className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">{medication.name}</h3>
            {medication.genericName && (
              <p className="text-xs text-slate-500">{medication.genericName}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {medication.strength}
              </span>
              <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                {medication.form}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {medication.category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {medication.description && (
        <div className="border-t border-slate-100 px-4 pb-3 pt-2">
          <p className="line-clamp-2 text-xs text-slate-500">{medication.description}</p>
        </div>
      )}

      {medication.manufacturer && (
        <div className="border-t border-slate-100 px-4 pb-3 pt-2">
          <p className="text-xs text-slate-400">Manufacturer: {medication.manufacturer}</p>
        </div>
      )}
    </div>
  );
}
