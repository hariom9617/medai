import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PageHeader,
  FilterChip,
  SearchInput,
  EmptyState,
} from "@/features/shared/ui";
import { PatientCard } from "@/features/patients/components/PatientCard";
import { useDoctorPatients } from "@/hooks/queries";
import { Users } from "lucide-react";
import { toast } from "sonner";
import type { MockPatient } from "@/features/shared/mock/patients";
import { SkeletonGrid } from "@/components/common/Skeletons";

type RiskFilter = "all" | "high" | "medium" | "low";

function adaptToMockPatient(p: any): MockPatient {
  return {
    id: p.id,
    fullName: p.fullName,
    age: p.age ?? 0,
    email: p.email,
    phone: p.phone,
    avatarColor: "bg-slate-100 text-slate-600",
    adherenceRate: p.adherenceRate,
    riskLevel: p.riskLevel,
    riskScore: 100 - (p.adherenceRate ?? 0),
    activeMedications: p.activeMedications,
    missedThisWeek: 0,
    caregiver: "Assigned Caregiver",
    doctor: "Dr. Patel",
    nextDoseAt: "--:--",
    nextMedication: "N/A",
    lastActiveISO: p.lastActive ?? new Date().toISOString(),
    conditions: p.conditions ?? [],
    emergencyContact: p.phone ?? "",
  };
}

export default function DoctorPatients() {
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [adhFilter, setAdhFilter] = useState<"all" | "lt70" | "70-85" | "gt85">("all");
  const { data: patients = [], isLoading } = useDoctorPatients();

  const list = useMemo(() => {
    return patients.filter((p: any) => {
      if (q && !p.fullName.toLowerCase().includes(q.toLowerCase())) return false;
      if (risk !== "all" && p.riskLevel !== risk) return false;
      if (adhFilter === "lt70" && (p.adherenceRate ?? 0) >= 70) return false;
      if (adhFilter === "70-85" && ((p.adherenceRate ?? 0) < 70 || (p.adherenceRate ?? 0) > 85)) return false;
      if (adhFilter === "gt85" && (p.adherenceRate ?? 0) <= 85) return false;
      return true;
    });
  }, [patients, q, risk, adhFilter]);

  const highRiskCount = patients.filter((p: any) => p.riskLevel === "high").length;

  return (
    <AppLayout title="Patients">
      <PageHeader
        title="My Patients"
        subtitle={`${patients.length} monitored patients · ${highRiskCount} high-risk`}
      />

      <div className="card-base mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <SearchInput value={q} onChange={setQ} placeholder="Search patient name…" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={risk === "all"} onClick={() => setRisk("all")}>All risk</FilterChip>
          <FilterChip active={risk === "high"} onClick={() => setRisk("high")}>High</FilterChip>
          <FilterChip active={risk === "medium"} onClick={() => setRisk("medium")}>Medium</FilterChip>
          <FilterChip active={risk === "low"} onClick={() => setRisk("low")}>Low</FilterChip>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={adhFilter === "all"} onClick={() => setAdhFilter("all")}>All adherence</FilterChip>
          <FilterChip active={adhFilter === "lt70"} onClick={() => setAdhFilter("lt70")}>&lt; 70%</FilterChip>
          <FilterChip active={adhFilter === "70-85"} onClick={() => setAdhFilter("70-85")}>70–85%</FilterChip>
          <FilterChip active={adhFilter === "gt85"} onClick={() => setAdhFilter("gt85")}>&gt; 85%</FilterChip>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} className="md:grid-cols-2 xl:grid-cols-3" />
      ) : list.length === 0 ? (
        <EmptyState icon={Users} title="No patients match your filters" description="Try clearing search or filter chips." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p: any) => (
            <PatientCard
              key={p.id}
              patient={adaptToMockPatient(p)}
              basePath="/doctor/patients"
              onContact={() => toast.success(`Reminder sent to ${p.fullName}`)}
              onNotify={() => toast.success(`Caregiver notified`)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}