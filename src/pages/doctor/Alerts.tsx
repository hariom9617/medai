import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, FilterChip, EmptyState } from "@/features/shared/ui";
import { AlertCard } from "@/features/alerts/components/AlertCard";
import { useDoctorAlerts, useResolveAlert, useEscalateAlert } from "@/hooks/queries";
import { BellOff } from "lucide-react";
import { toast } from "sonner";
import type { Alert } from "@/types";
import { SkeletonCard } from "@/components/common/Skeletons";

type Tab = "all" | "active" | "resolved";
type Sev = "all" | "critical" | "high" | "medium" | "low";

// Add missing properties to Alert for AlertCard compatibility
function adaptAlertForCard(a: Alert): Alert {
  return {
    ...a,
    title: a.title || a.type,
  };
}

export default function DoctorAlerts() {
  const [tab, setTab] = useState<Tab>("active");
  const [sev, setSev] = useState<Sev>("all");
  const { data: alerts = [], refetch, isLoading } = useDoctorAlerts();
  const resolveAlert = useResolveAlert();
  const escalateAlert = useEscalateAlert();

  const list = useMemo(() => {
    return alerts.filter((a) => {
      if (tab !== "all" && a.status !== tab) return false;
      if (sev !== "all" && a.severity !== sev) return false;
      return true;
    });
  }, [alerts, tab, sev]);

  const update = async (id: string, status: "resolved" | "escalated") => {
    try {
      if (status === "resolved") {
        await resolveAlert.mutateAsync({ id });
        toast.success("Alert resolved");
      } else {
        await escalateAlert.mutateAsync({ id });
        toast.success("Escalated to caregiver");
      }
      refetch();
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  return (
    <AppLayout title="Alerts">
      <PageHeader title="Adherence Alerts" subtitle="Centralized alert management for your patient panel" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          {(["active", "resolved", "all"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${tab === t ? "bg-primary text-primary-foreground" : "text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "critical", "high", "medium", "low"] as Sev[]).map((s) => (
            <FilterChip key={s} active={sev === s} onClick={() => setSev(s)}>
              {s === "all" ? "All severity" : s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterChip>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={BellOff} title="No alerts" description="You're all caught up." />
      ) : (
        <div className="space-y-4">
          {list.map((a) => {
            const adaptedAlert = adaptAlertForCard(a);
            return (
              <AlertCard
                key={a.id}
                alert={adaptedAlert}
                patientPath="/doctor/patients"
                onResolve={() => update(a.id, "resolved")}
                onEscalate={() => update(a.id, "escalated")}
                onContact={() => toast.success("Reminder sent to patient")}
              />
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
