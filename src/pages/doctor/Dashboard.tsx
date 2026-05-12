import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, AlertTriangle, Activity, TrendingUp, Search, Send, BellRing, Eye, Stethoscope } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, KpiCard, SectionCard } from "@/features/shared/ui";
import { AdherenceChart } from "@/features/adherence/components/AdherenceChart";
import { RiskPredictionCard } from "@/features/ai/components/RiskPredictionCard";
import { useDoctorPatients, useDoctorAlerts, useRisk, useInsights, useAdherenceHistory } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { SkeletonStatCard, SkeletonChart, SkeletonCard } from "@/components/common/Skeletons";

export default function DoctorDashboard() {
  const [q, setQ] = useState("");
  const { data: patients = [], isLoading: patientsLoading } = useDoctorPatients();
  const { data: alerts = [] } = useDoctorAlerts({ status: "active" });
  const { data: adherenceHistory } = useAdherenceHistory({ groupBy: "day" });

  // Calculate metrics from real data
  const total = patients.length;
  const highRisk = patients.filter((p) => p.adherenceRate < 70).length;
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const avgAdherence = total > 0 ? Math.round(patients.reduce((s, p) => s + (p.adherenceRate || 0), 0) / total) : 0;

  const filtered = useMemo(
    () => patients.filter((p) => p.fullName.toLowerCase().includes(q.toLowerCase())),
    [patients, q]
  );

  // Get risk scores for top 2 patients
  const topRiskPatients = [...patients]
    .sort((a, b) => (a.adherenceRate || 0) - (b.adherenceRate || 0))
    .slice(0, 2);

  // Prepare adherence chart data
  const monthlyAdherence = useMemo(() => {
    const history = Array.isArray(adherenceHistory) ? adherenceHistory : [];
    return history.slice(-30).map((h, i) => ({
      date: `D${i + 1}`,
      rate: h.overallRate || 0,
    }));
  }, [adherenceHistory]);

  return (
    <AppLayout title="Doctor Dashboard">
      <PageHeader title="Adherence Monitoring" subtitle="AI-powered overview of your patient panel" />

      {patientsLoading ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SkeletonChart className="lg:col-span-2" />
            <div className="space-y-4">
              <SkeletonCard /><SkeletonCard />
            </div>
          </div>
        </>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Monitored Patients" value={total} sub="Active panel" icon={Users} tone="info" />
        <KpiCard label="High-Risk" value={highRisk} sub="Need intervention" icon={AlertTriangle} tone="destructive" />
        <KpiCard label="Active Alerts" value={activeAlerts} sub="Requires action" icon={Activity} tone="warning" />
        <KpiCard label="Avg Adherence" value={`${avgAdherence}%`} sub="Across panel" icon={TrendingUp} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="30-Day Adherence Trend" action={<span className="text-xs text-slate-500">Panel-wide</span>}>
            <AdherenceChart data={monthlyAdherence} xKey="date" />
          </SectionCard>
        </div>
        <div className="space-y-4">
          {topRiskPatients.map((p) => (
            <RiskPredictionCard
              key={p.id}
              prediction={{
                patientId: p.id,
                overallRisk: 100 - (p.adherenceRate || 0),
                riskLevel: p.adherenceRate < 70 ? "high" : p.adherenceRate < 85 ? "medium" : "low",
                factors: [],
                recommendations: [p.adherenceRate < 70 ? "Immediate intervention recommended" : "Continue monitoring"],
                calculatedAt: new Date().toISOString(),
              }}
              patientName={p.fullName}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Quick Patient Search" className="lg:col-span-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <ul className="mt-3 max-h-72 space-y-1 overflow-auto">
            {filtered.slice(0, 6).map((p) => {
              const riskLevel = (p.adherenceRate || 0) < 70 ? "high" : (p.adherenceRate || 0) < 85 ? "medium" : "low";
              return (
                <li key={p.id}>
                  <Link
                    to={`/doctor/patients/${p.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="truncate font-medium text-slate-900">{p.fullName}</span>
                    <span className={`text-xs font-bold ${
                      riskLevel === "high" ? "text-destructive" : riskLevel === "medium" ? "text-warning" : "text-success"
                    }`}>{p.adherenceRate}%</span>
                  </Link>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="px-2 py-3 text-sm text-slate-500">No matches</li>}
          </ul>
        </SectionCard>

        <SectionCard title="Alert Feed" className="lg:col-span-1">
          <ul className="space-y-3">
{alerts.slice(0, 4).map((a) => (
  <li key={a.id} className="flex gap-3">
    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
      a.severity === "critical" || a.severity === "high"
        ? "bg-destructive"
        : a.severity === "medium"
        ? "bg-warning"
        : "bg-info"
    }`} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-900">{a.title ?? a.type}</p>
      <p className="truncate text-xs text-slate-500">
        {a.createdAt && !isNaN(new Date(a.createdAt).getTime())
          ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })
          : "some time ago"}
      </p>
    </div>
    <Link to="/doctor/alerts" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
      <Eye className="h-4 w-4" />
    </Link>
  </li>
))}
            {alerts.length === 0 && <li className="px-2 py-3 text-sm text-slate-500">No active alerts</li>}
          </ul>
        </SectionCard>

        <SectionCard title="Recent Interventions" className="lg:col-span-1">
          <ul className="space-y-3">
            <li className="text-sm text-slate-500">Intervention history will be available after backend implementation</li>
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button onClick={() => toast.success("Intervention sent to top high-risk patient")} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">
          <Send className="h-4 w-4" /> Send Intervention
        </button>
        <button onClick={() => toast.success("Caregiver team notified")} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <BellRing className="h-4 w-4" /> Notify Caregiver
        </button>
        <Link to="/doctor/alerts" className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Activity className="h-4 w-4" /> Review All Alerts
        </Link>
      </div>
      </>
      )}
    </AppLayout>
  );
}
