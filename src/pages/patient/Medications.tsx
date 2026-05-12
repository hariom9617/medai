import { Pill, Stethoscope } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMedications } from "@/hooks/queries";
import { MedicationCard } from "@/components/patient/MedicationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { SkeletonGrid } from "@/components/common/Skeletons";

export default function Medications() {
  const { user } = useAuth();
  const { data: meds = [], isLoading, isError, error } = useMedications(user?.id);

  return (
    <AppLayout title="Medications" search="Search medications…">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Your prescriptions</h2>
        <p className="text-sm text-slate-500">All medications and supplements assigned by your doctor</p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 p-4 text-sm text-slate-700">
        <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <div>
          <p className="font-semibold text-slate-900">Medication plans are managed by your doctor.</p>
          <p className="mt-0.5 text-xs text-slate-500">You can view your schedule and track adherence, but cannot add or edit prescriptions.</p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{(error as Error)?.message}</p>
      ) : meds.length === 0 ? (
        <EmptyState
          icon={<Pill className="h-6 w-6" />}
          title="No medications assigned yet"
          description="Your doctor hasn't assigned any prescriptions. Check back later."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meds.map((m) => (
            <MedicationCard key={(m as any)._id ?? m.id} med={m} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
