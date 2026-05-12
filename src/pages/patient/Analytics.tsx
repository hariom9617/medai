import { AppLayout } from "@/components/layout/AppLayout";
import {
  useAdherenceSummary,
  useAdherenceHistory,
  useDoseLogs,
} from "@/hooks/queries";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Flame, Trophy } from "lucide-react";
import { calcStreak } from "@/utils/adherence";
import { SkeletonStatCard, SkeletonChart, SkeletonBox, SkeletonTableRows } from "@/components/common/Skeletons";

export default function Analytics() {
  const { data: month, isLoading: mLoad } = useAdherenceSummary("month");
  const { data: week, isLoading: wLoad } = useAdherenceSummary("week");
  const { data: history, isLoading: hLoad } = useAdherenceHistory({ groupBy: "day" });
  const { data: logs = [] } = useDoseLogs();
  const loading = mLoad || wLoad || hLoad;

  const streak = calcStreak(Array.isArray(logs) ? logs : []);

  // Backend returns [{ medicationId, name, adherence }]
  const summaryMeds = (month as any)?.medications ?? [];
  const summaryMedsWeek = (week as any)?.medications ?? [];

  const avg30d = summaryMeds.length
    ? Math.round(
        summaryMeds.reduce((a: number, m: any) => a + (m.adherence ?? 0), 0) /
          summaryMeds.length,
      )
    : 0;

  const avg7d = summaryMedsWeek.length
    ? Math.round(
        summaryMedsWeek.reduce(
          (a: number, m: any) => a + (m.adherence ?? 0),
          0,
        ) / summaryMedsWeek.length,
      )
    : 0;

  const historyArr =
    (history as any)?.history ?? (Array.isArray(history) ? history : []);
  const trend = historyArr
    .slice(-30)
    .map((d: any, i: number) => ({ day: i + 1, adherence: d.adherence ?? 0 }));
  const heatSource = historyArr.slice(-84);
  const heat = heatSource.length
    ? heatSource.map((d: any) => (d.adherence ?? 0) / 100)
    : Array.from({ length: 84 }, () => 0);

  return (
    <AppLayout title="Analytics">
      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[0,1,2].map(i => <SkeletonStatCard key={i} />)}
          </div>
          <div className="mt-6"><SkeletonBox className="h-48 w-full" /></div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonChart />
            <div className="card-base p-6"><table className="w-full"><tbody><SkeletonTableRows rows={5} cols={4} /></tbody></table></div>
          </div>
        </>
      ) : (
      <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-base p-6 flex items-center gap-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-warning/10 text-warning">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">
              Current Streak
            </p>
            <p className="text-3xl font-bold text-slate-900">{streak} days</p>
          </div>
        </div>

        <div className="card-base p-6 flex items-center gap-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400">
              7-Day Adherence
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {avg7d}% this week
            </p>
          </div>
        </div>

        <div className="card-base p-6">
          <p className="text-xs uppercase font-semibold text-slate-400">
            30-Day Adherence
          </p>
          <p className="text-3xl font-bold text-primary">{avg30d}%</p>
          <p className="text-sm text-slate-500 mt-1">
            avg across {summaryMeds.length} medications
          </p>
        </div>
      </div>

      <div className="mt-6 card-base p-6">
        <h3 className="text-lg font-bold text-slate-900">12-Week Heatmap</h3>
        <p className="text-sm text-slate-500">
          Each cell = a day. Greener = higher adherence.
        </p>
        <div className="mt-4 grid grid-cols-12 gap-1.5">
          {heat.map((v, i) => (
            <div
              key={i}
              className="aspect-square rounded"
              style={{ backgroundColor: `hsl(173 80% ${85 - v * 50}%)` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-base p-6">
          <h3 className="text-lg font-bold">Trend (30 days)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-lg font-bold">Per Medication</h3>
          <table className="mt-4 w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-right">7d %</th>
                <th className="text-right">30d %</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {summaryMeds.map((m: any) => {
                // find matching week entry for this medication
                const weekEntry = summaryMedsWeek.find(
                  (w: any) => w.medicationId === m.medicationId,
                );
                const adherence7d = weekEntry?.adherence ?? 0;
                const adherence30d = m.adherence ?? 0;
                return (
                  <tr
                    key={m.medicationId}
                    className="border-t border-slate-100"
                  >
                    <td className="py-3 font-medium">{m.name}</td>
                    <td className="text-right">{adherence7d}%</td>
                    <td className="text-right text-success">{adherence30d}%</td>
                    <td className="text-right text-destructive">
                      {adherence7d < 70 ? "⚠" : "✓"}
                    </td>
                  </tr>
                );
              })}
              {summaryMeds.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-slate-400 text-xs"
                  >
                    No adherence data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </AppLayout>
  );
}
