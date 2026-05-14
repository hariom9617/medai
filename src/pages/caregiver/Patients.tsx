import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PageHeader,
  FilterChip,
  SearchInput,
  EmptyState,
} from "@/features/shared/ui";
import { PatientCard } from "@/features/patients/components/PatientCard";
import { usePatients } from "@/hooks/queries";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { SkeletonGrid } from "@/components/common/Skeletons";

export default function CaregiverPatients() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "needs_help" | "stable">("all");

  const { data: patients = [], isLoading, error } = usePatients();

  const enriched = patients.map((p: any) => {
    const adherenceRate = p.todayAdherence ?? p.adherenceRate ?? 0;
    return {
      id: p.patient?.id ?? p.id,
      fullName: p.patient?.fullName ?? p.fullName ?? "Unknown",
      email: p.patient?.email ?? p.email ?? "",
      phone: p.patient?.phone ?? p.phone ?? "",
      age: p.patient?.age ?? p.age ?? 0,
      conditions: p.conditions ?? [],
      emergencyContact: p.emergencyContact ?? "N/A",
      avatarColor: "bg-slate-100 text-slate-700",
      adherenceRate,
      riskLevel: (adherenceRate < 50
        ? "high"
        : adherenceRate < 80
          ? "medium"
          : "low") as "low" | "medium" | "high",
      riskScore: 100 - adherenceRate,
      activeMedications: p.activeMedications ?? 0,
      missedThisWeek: 0,
      caregiver: "You",
      doctor: "—",
      nextDoseAt: "—",
      nextMedication: "N/A",
      lastActiveISO: p.patient?.lastActive ?? new Date().toISOString(),
      isActive: p.patient?.isActive ?? p.isActive ?? true,
    };
  });

  const list = useMemo(
    () =>
      enriched.filter((p) => {
        if (q && !p.fullName.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (filter === "needs_help" && p.adherenceRate >= 80) return false;
        if (filter === "stable" && p.adherenceRate < 80) return false;
        return true;
      }),
    [enriched, q, filter],
  );

  if (isLoading) {
    return (
      <AppLayout title="My Patients">
        <PageHeader title="Assigned Patients" subtitle="Loading…" />
        <SkeletonGrid count={6} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="My Patients">
        <PageHeader title="Assigned Patients" subtitle="Error loading data" />
        <div className="py-12 text-center">
          <p className="text-sm text-destructive">
            Failed to load patient data
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Patients">
      <PageHeader
        title="Assigned Patients"
        subtitle={`${patients.length} patients in your care`}
      />

      <div className="card-base mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search patient…"
          />
        </div>
        <div className="flex gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </FilterChip>
          <FilterChip
            active={filter === "needs_help"}
            onClick={() => setFilter("needs_help")}
          >
            Needs help
          </FilterChip>
          <FilterChip
            active={filter === "stable"}
            onClick={() => setFilter("stable")}
          >
            Stable
          </FilterChip>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              basePath="/caregiver/patients"
              onContact={() => toast.success(`Calling ${p.fullName}`)}
              onNotify={() => toast.success("Doctor notified")}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
