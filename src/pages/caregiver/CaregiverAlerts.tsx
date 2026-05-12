import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, FilterChip, EmptyState } from "@/features/shared/ui";
import { AlertCard } from "@/features/alerts/components/AlertCard";
import { useAlerts } from "@/hooks/queries";
import { BellOff } from "lucide-react";
import { toast } from "sonner";
import type { Alert, AlertStatus } from "@/types";
import { SkeletonCard } from "@/components/common/Skeletons";

type Tab = "all" | "active" | "resolved" | "acknowledged";

export default function CaregiverAlerts() {
  const [tab, setTab] = useState<Tab>("active");
  const { data: alerts = [], isLoading, error } = useAlerts(tab === "all" ? {} : { status: tab as AlertStatus });

  const list = useMemo(() => alerts.filter((a) => (tab === "all" ? true : a.status === tab)), [alerts, tab]);

  const update = (id: string, status: "resolved" | "escalated") => {
    // TODO: Implement API calls to resolve/escalate alerts
    toast.success(status === "resolved" ? "Alert resolved" : "Escalated to doctor");
  };

  if (isLoading) {
    return (
      <AppLayout title="Alerts">
        <PageHeader title="Care Alerts" subtitle="Loading…" />
        <div className="space-y-3">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Alerts">
        <PageHeader title="Care Alerts" subtitle="Error loading alerts" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">Failed to load alerts</p>
            <p className="text-xs text-slate-500">Please try refreshing the page</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Alerts">
      <PageHeader title="Care Alerts" subtitle="Missed medications, escalations, and doctor messages" />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["active", "escalated", "resolved", "all"] as Tab[]).map((t) => (
          <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </FilterChip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={BellOff} title="No alerts" description="You're all caught up." />
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              patientPath="/caregiver/patients"
              onResolve={() => update(a.id!, "resolved")}
              onEscalate={() => update(a.id!, "escalated")}
              onContact={() => toast.success("Calling patient…")}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
