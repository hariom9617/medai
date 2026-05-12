import { useState } from "react";
import { Search, Download, FileSpreadsheet } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePatients } from "@/hooks/queries";
import { ReportsApi } from "@/api/reports";
import { toast } from "sonner";
import { SkeletonTableRows } from "@/components/common/Skeletons";

function risk(rate: number): "low" | "medium" | "high" {
  if (rate >= 90) return "low";
  if (rate >= 75) return "medium";
  return "high";
}

const RISK_CLS: any = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

export default function DoctorReport() {
  const { data: patients = [], isLoading } = usePatients();
  const [q, setQ] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const rows = patients.filter((p) => {
    const r = risk(p.adherenceRate);
    return (riskFilter === "all" || r === riskFilter) && p.fullName.toLowerCase().includes(q.toLowerCase());
  });

  const download = async (format: "pdf" | "csv" | "excel") => {
    if (patients.length === 0) return toast.error("No patients to export");
    try {
      const blob = await ReportsApi.exportDownload(patients[0].id, { format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report.${format === "excel" ? "xlsx" : format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export ready");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    }
  };

  return (
    <AppLayout title="Clinical Reports">
      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patient Adherence Report</h2>
          <p className="text-sm text-slate-500">Adherence summary across your panel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => download("pdf")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"><Download className="h-4 w-4" /> Export PDF</button>
          <button onClick={() => download("csv")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FileSpreadsheet className="h-4 w-4" /> Export CSV</button>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm">
            <option value="all">All Risk</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr><th className="text-left px-6 py-3">Patient</th><th className="text-left px-6 py-3">Email</th><th className="text-right px-6 py-3">Adherence</th><th className="text-center px-6 py-3">Risk</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableRows rows={6} cols={4} />
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-6 text-center text-slate-500">No patients.</td></tr>
            ) : (
              rows.map((p) => {
                const r = risk(p.adherenceRate);
                return (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.fullName}</td>
                    <td className="px-6 py-4 text-slate-500">{p.email ?? "—"}</td>
                    <td className="px-6 py-4 text-right font-bold">{p.adherenceRate}%</td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${RISK_CLS[r]}`}>{r}</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
