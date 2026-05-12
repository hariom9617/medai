import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAlerts, useAcknowledgeAlert } from "@/hooks/queries";
import { AlertTriangle, Pill, HeadphonesIcon, TrendingUp } from "lucide-react";
import { safeDistanceToNow } from "@/lib/date";
import { toast } from "sonner";
import type { AlertType } from "@/types";
import { SkeletonCard } from "@/components/common/Skeletons";

const ICONS: Partial<Record<AlertType, any>> = {
  missed_dose: AlertTriangle,
  medication_refill: Pill,
  low_adherence: TrendingUp,
  high_risk: AlertTriangle,
  delay: AlertTriangle,
  anomaly: AlertTriangle,
};
const SEV: any = {
  critical: {
    label: "CRITICAL",
    text: "text-destructive",
    border: "border-l-destructive",
    bg: "bg-destructive/10",
  },
  high: {
    label: "HIGH",
    text: "text-destructive",
    border: "border-l-destructive",
    bg: "bg-destructive/10",
  },
  medium: {
    label: "WARNING",
    text: "text-warning",
    border: "border-l-warning",
    bg: "bg-warning/10",
  },
  low: {
    label: "INFO",
    text: "text-info",
    border: "border-l-info",
    bg: "bg-info/10",
  },
};

export default function Alerts() {
  const { data: alerts = [], isLoading } = useAlerts();
  const ack = useAcknowledgeAlert();
  const [filter, setFilter] = useState<"all" | "active" | "high">("all");
  const filtered = alerts.filter((a) =>
    filter === "all"
      ? true
      : filter === "active"
        ? a.status === "active"
        : a.severity === "critical" || a.severity === "high",
  );

  return (
    <AppLayout title="Alerts">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alerts Inbox</h2>
          <p className="text-sm text-slate-500">
            Manage your health notifications and adherence updates.
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "active", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === f ? "bg-primary text-primary-foreground" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              {f === "all"
                ? "All"
                : f === "active"
                  ? "Active"
                  : "Severity: High"}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const Icon = ICONS[a.type] ?? AlertTriangle;
            const s = SEV[a.severity ?? "low"] ?? SEV.low;
            const isActive = a.status === "active";
            return (
              <div
                key={a.id}
                className={`card-base border-l-4 ${s.border} ${isActive ? "bg-white" : "bg-white/60"} p-5`}
              >
                <div className="flex gap-4">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${s.bg} ${s.text}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`text-xs font-bold uppercase tracking-wider ${s.text}`}
                        >
                          {s.label}
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-slate-900">
                          {a.title ?? a.type?.replace("_", " ")}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-slate-500">
                          {safeDistanceToNow(a.createdAt, { addSuffix: true })}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${isActive ? "bg-destructive/10 text-destructive" : "bg-slate-100 text-slate-500"}`}
                        >
                          ● {a.status}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{a.message}</p>
                    {isActive && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={async () => {
                            try {
                              await ack.mutateAsync(a.id);
                              toast.success("Acknowledged");
                            } catch (e: any) {
                              toast.error(e?.message ?? "Failed");
                            }
                          }}
                          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
                        >
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">No alerts.</p>
          )}
        </div>
      )}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card-base bg-gradient-to-br from-primary to-primary-glow p-6 text-white">
          <h3 className="text-xl font-bold">Adherence Analysis</h3>
          <p className="mt-2 text-sm text-white/85">
            Live alert feed from your backend.
          </p>
        </div>
        <div className="card-base p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100">
            <HeadphonesIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-bold">Need help?</h3>
          <p className="mt-1 text-sm text-slate-500">
            Chat with our 24/7 care support team about your alerts.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
