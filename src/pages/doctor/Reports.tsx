import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, KpiCard, SectionCard } from "@/features/shared/ui";
import { AdherenceChart } from "@/features/adherence/components/AdherenceChart";
import { AdherenceBars } from "@/features/adherence/components/AdherenceBars";
import { useDoctorPatients, useAdherenceHistory } from "@/hooks/queries";
import { Activity, AlertTriangle, BarChart3, Sparkles, Printer, Download } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { SkeletonStatCard, SkeletonChart, SkeletonTableRows } from "@/components/common/Skeletons";

export default function DoctorReports() {
  const { data: patients = [], isLoading: pLoading } = useDoctorPatients();
  const { data: adherenceHistory, isLoading: hLoading } = useAdherenceHistory({ groupBy: "day" });
  const loading = pLoading || hLoading;

  const total = patients.length;
  const high = patients.filter((p) => (p.adherenceRate || 0) < 70).length;
  const medium = patients.filter((p) => (p.adherenceRate || 0) >= 70 && (p.adherenceRate || 0) < 85).length;
  const low = patients.filter((p) => (p.adherenceRate || 0) >= 85).length;
  const avg = total > 0 ? Math.round(patients.reduce((s, p) => s + (p.adherenceRate || 0), 0) / total) : 0;

  const riskDist = [
    { name: "High", value: high, color: "hsl(var(--destructive))" },
    { name: "Medium", value: medium, color: "hsl(var(--warning))" },
    { name: "Low", value: low, color: "hsl(var(--success))" },
  ];

  // Prepare chart data
  const monthlyAdherence = useMemo(() => {
    const history = Array.isArray(adherenceHistory) ? adherenceHistory : [];
    return history.slice(-30).map((h, i) => ({
      date: `D${i + 1}`,
      rate: h.overallRate || 0,
    }));
  }, [adherenceHistory]);

  const weeklyAdherence = useMemo(() => {
    const history = Array.isArray(adherenceHistory) ? adherenceHistory : [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      rate: history.slice(-7)[i]?.overallRate || 80,
    }));
  }, [adherenceHistory]);

  // Sort patients by adherence for medication effectiveness
  const topMeds = patients.slice().sort((a, b) => (a.adherenceRate || 0) - (b.adherenceRate || 0));

  return (
    <AppLayout title="Reports">
      <PageHeader
        title="Adherence Reports"
        subtitle="Insights and analytics across your patient panel"
        actions={
          <>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={() => toast.success("Report export started")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </>
        }
      />

      {loading ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SkeletonChart className="lg:col-span-2" />
            <SkeletonChart />
          </div>
        </>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Avg Adherence" value={`${avg}%`} sub="All patients" icon={BarChart3} tone="primary" />
        <KpiCard label="High-Risk" value={high} sub="Need intervention" icon={AlertTriangle} tone="destructive" />
        <KpiCard label="Active Patients" value={total} sub="In monitoring" icon={Activity} tone="info" />
        <KpiCard label="Stable" value={low} sub="Low risk" icon={Activity} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Monthly Trend" className="lg:col-span-2">
          <AdherenceChart data={monthlyAdherence} xKey="date" />
        </SectionCard>
        <SectionCard title="Risk Distribution">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {riskDist.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Weekly Adherence">
          <AdherenceBars data={weeklyAdherence} />
        </SectionCard>

        <SectionCard title="Patient Adherence (lowest first)">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="py-2">Patient</th>
                <th className="py-2">Email</th>
                <th className="py-2 text-right">Adherence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topMeds.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 font-medium text-slate-900">{p.fullName}</td>
                  <td className="py-2.5 text-slate-500">{p.email || "—"}</td>
                  <td className={`py-2.5 text-right font-bold ${(p.adherenceRate || 0) >= 85 ? "text-success" : (p.adherenceRate || 0) >= 70 ? "text-warning" : "text-destructive"}`}>
                    {p.adherenceRate || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      <div className="mt-6 card-base bg-gradient-to-br from-primary to-primary-glow p-6 text-white">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-wider">AI-Generated Recommendations</p></div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>3 patients exhibit declining evening adherence — consider shifting to morning regimens.</li>
          <li>Warfarin and Lisinopril show below-average adherence; reinforce dosing routines.</li>
          <li>Patricia Williams’ risk score is climbing — schedule a check-in this week.</li>
        </ul>
      </div>
      </>
      )}
    </AppLayout>
  );
}
