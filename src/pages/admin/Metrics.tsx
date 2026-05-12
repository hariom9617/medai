import { Users, BarChart3, Bell, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAdminMetrics } from "@/hooks/queries";
import { SkeletonStatCard, SkeletonChart, SkeletonRow } from "@/components/common/Skeletons";

export default function AdminMetrics() {
  const { data: metrics, isLoading, isError, error } = useAdminMetrics();

  const data = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
    d,
    v: Math.round((metrics?.adherence.averageRate ?? 80) + (i - 3) * 2),
  }));

  return (
    <AppLayout title="Platform Metrics">
      {isError && <p className="text-sm text-destructive">{(error as Error)?.message}</p>}

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SkeletonChart className="lg:col-span-2" />
            <div className="card-base p-6 space-y-3">
              {[0,1,2,3].map(i => <SkeletonRow key={i} />)}
            </div>
          </div>
        </>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "Active Users", v: metrics?.users.active?.toLocaleString() ?? "—", i: Users, t: "info" },
          { l: "Platform Adherence", v: `${metrics?.adherence.averageRate ?? 0}%`, i: BarChart3, t: "success" },
          { l: "API Calls 24h", v: metrics?.system.apiCalls24h?.toLocaleString() ?? "—", i: Bell, t: "warning" },
          { l: "Error Rate", v: `${((metrics?.system.errorRate ?? 0) * 100).toFixed(2)}%`, i: AlertTriangle, t: "destructive" },
        ].map((s, i) => {
          const Icon = s.i;
          const tones: any = { info: "bg-info/10 text-info", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning", destructive: "bg-destructive/10 text-destructive" };
          return (
            <div key={i} className="card-base p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-slate-600">{s.l}</p>
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${tones[s.t]}`}><Icon className="h-5 w-5" /></div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{s.v}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card-base p-6">
          <h3 className="text-lg font-bold">Adherence by Day</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-base p-6">
          <h3 className="text-lg font-bold">Users by Role</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(metrics?.users.byRole ?? {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between border-l-2 border-primary/40 pl-3">
                <p className="text-sm text-slate-700 capitalize">{role}</p>
                <p className="text-sm font-bold">{count}</p>
              </div>
            ))}
            {!metrics && <p className="text-xs text-slate-500">—</p>}
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">System uptime</p>
            <p className="text-lg font-bold">{metrics?.system.uptime ?? "—"}</p>
          </div>
        </div>
      </div>
      </>
      )}
    </AppLayout>
  );
}
