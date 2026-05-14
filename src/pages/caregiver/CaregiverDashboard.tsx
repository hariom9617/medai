import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  BarChart3,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePatients, useAlerts } from "@/hooks/queries";
import { safeDistanceToNow } from "@/lib/date";
import { SkeletonGrid } from "@/components/common/Skeletons";

// ✅ Matches backend: <50 high, 50-79 medium, 80+ low
function riskFromRate(rate: number): "low" | "medium" | "high" {
  if (rate >= 80) return "low";
  if (rate >= 50) return "medium";
  return "high";
}

const RISK = {
  high: {
    border: "border-l-destructive",
    badge: "bg-destructive/10 text-destructive",
    label: "HIGH RISK",
  },
  medium: {
    border: "border-l-warning",
    badge: "bg-warning/10 text-warning",
    label: "WARNING",
  },
  low: {
    border: "border-l-success",
    badge: "bg-success/10 text-success",
    label: "STABLE",
  },
} as const;

export default function CaregiverDashboard() {
  const { data: rawPatients = [], isLoading } = usePatients();
  const { data: alerts = [] } = useAlerts({ status: "active" });

  // ✅ Normalize: use todayAdherence (%), not adherenceScore (raw int)
  const patients = useMemo(
    () =>
      rawPatients.map((p: any) => ({
        id: p.patient?.id ?? p.id,
        fullName: p.patient?.fullName ?? p.fullName ?? "Unknown",
        email: p.patient?.email ?? p.email,
        lastActive: p.patient?.lastActive ?? p.lastActive ?? null,
        adherenceRate: p.todayAdherence ?? p.adherenceRate ?? 0,
      })),
    [rawPatients],
  );

  const unread = alerts.length;
  const avg = patients.length
    ? Math.round(
        patients.reduce((a, p) => a + p.adherenceRate, 0) / patients.length,
      )
    : 0;

  return (
    <AppLayout title="Patient Overview" search="Search patients…">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Total Patients"
          value={patients.length}
          sub="Currently in care"
          icon={<Users className="h-5 w-5" />}
          tone="info"
        />
        <Stat
          label="Critical Alerts"
          value={String(unread).padStart(2, "0")}
          sub="Immediate action"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="destructive"
        />
        <Stat
          label="Avg Adherence"
          value={`${avg}%`}
          sub="Across panel"
          icon={<BarChart3 className="h-5 w-5" />}
          tone="info"
        />
        <Stat
          label="Active Patients"
          value={patients.filter((p) => p.adherenceRate >= 80).length}
          sub="On track"
          icon={<CheckCheck className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Patient Care Grid</h2>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : patients.length === 0 ? (
        <p className="text-sm text-slate-500">No patients yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((p, i) => {
            const level = riskFromRate(p.adherenceRate);
            const r = RISK[level];
            return (
              <div
                key={p.id ?? p.email ?? i}
                className={`card-base border-l-4 ${r.border} p-5`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-slate-500 font-semibold">
                      {(p.fullName ?? "?")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {p.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.email ?? p.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${r.badge}`}
                  >
                    {r.label}
                  </span>
                </div>
                <div className="mt-5 flex justify-between text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Adherence</p>
                    <p
                      className={`text-2xl font-bold ${
                        p.adherenceRate < 50
                          ? "text-destructive"
                          : p.adherenceRate < 80
                            ? "text-warning"
                            : "text-success"
                      }`}
                    >
                      {p.adherenceRate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Last Active</p>
                    <p className="text-base font-bold text-slate-900">
                      {p.lastActive
                        ? `${safeDistanceToNow(p.lastActive)} ago`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/caregiver/patients/${p.id}`}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
                  >
                    Details
                  </Link>
                  <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

function Stat({ label, value, sub, icon, tone }: any) {
  const tones: any = {
    info: "bg-info/10 text-info",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div
          className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
      <p
        className={`mt-3 text-3xl font-bold ${tone === "destructive" ? "text-destructive" : "text-slate-900"}`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${tone === "destructive" ? "text-destructive" : "text-slate-500"}`}
      >
        {sub}
      </p>
    </div>
  );
}
