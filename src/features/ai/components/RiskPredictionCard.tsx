import { Sparkles, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { RiskScore } from "@/types";

interface RiskPredictionCardProps {
  prediction: RiskScore | null;
  patientName: string;
  isLoading?: boolean;
  error?: unknown;
}

export function RiskPredictionCard({ prediction, patientName, isLoading, error }: RiskPredictionCardProps) {
  const tone =
    prediction?.riskLevel === "high"
      ? "from-destructive to-destructive/80"
      : prediction?.riskLevel === "medium"
      ? "from-warning to-warning/80"
      : "from-success to-success/80";

  if (isLoading) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading Risk Analysis…</p>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !prediction || !prediction.factors || !Array.isArray(prediction.factors)) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Analysis Unavailable</p>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Unable to load risk prediction at this time. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <div className={`bg-gradient-to-br ${tone} p-5 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-wider">AI Risk Prediction</p>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
            {prediction.riskLevel}
          </span>
        </div>
        <p className="mt-3 text-sm opacity-90">{patientName}</p>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-5xl font-bold">{prediction.overallRisk}</p>
          <p className="pb-2 text-sm opacity-80">/ 100</p>
        </div>
        <p className="mt-1 text-xs opacity-80">
          Calculated {new Date(prediction.calculatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Risk Factors</p>
          <ul className="mt-2 space-y-2">
            {prediction.factors.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{f.factor}</p>
                  <p className="truncate text-xs text-slate-500">{f.description}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  f.score >= 70 ? "bg-destructive/10 text-destructive" :
                  f.score >= 40 ? "bg-warning/10 text-warning" :
                  "bg-success/10 text-success"
                }`}>
                  {Math.round(f.score)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {prediction.recommendations && Array.isArray(prediction.recommendations) && prediction.recommendations.length > 0 && (
          <div className="rounded-lg bg-accent/40 p-3 text-xs text-primary">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> Recommendations
            </p>
            <ul className="mt-1 space-y-1 text-primary/90">
              {prediction.recommendations.slice(0, 2).map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}