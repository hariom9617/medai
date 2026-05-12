import {
  AlertTriangle,
  Pill,
  TrendingDown,
  Activity,
  MessageCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Alert } from "@/types";
import { severityStyles } from "./SeverityIndicator";
import { safeDistanceToNow } from "@/lib/date";

const TYPE_ICON: Record<Alert["type"], any> = {
  missed_dose: Pill,
  high_risk: Activity,
  delay: MessageCircle,
  anomaly: MessageCircle,
  medication_refill: AlertTriangle,
  low_adherence: TrendingDown,
};
const TYPE_LABEL: Record<Alert["type"], string> = {
  missed_dose: "Missed Dose",
  high_risk: "High Risk",
  delay: "Delayed Dose",
  anomaly: "Anomaly",
  medication_refill: "Medication Refill",
  low_adherence: "Low Adherence",
};

export function AlertCard({
  alert,
  patientPath,
  onResolve,
  onEscalate,
  onContact,
}: {
  alert: Alert;
  patientPath: string;
  onResolve?: () => void;
  onEscalate?: () => void;
  onContact?: () => void;
}) {
  const Icon = TYPE_ICON[alert.type] ?? AlertTriangle;
  const s = severityStyles[alert.severity ?? "low"];
  const isActive = alert.status === "active";
  return (
    <div
      className={`card-base border-l-4 ${s.border} p-5 ${isActive ? "" : "opacity-80"}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${s.bg} ${s.text}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${s.badge}`}
            >
              {s.label}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {TYPE_LABEL[alert.type]}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              {safeDistanceToNow(alert.createdAt, { addSuffix: true })}
            </span>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
              {alert.status}
            </span>
          </div>
          <Link
            to={`${patientPath}/${alert.patientId}`}
            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Patient <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <h4 className="mt-1 text-base font-bold text-slate-900">
            {alert.title || alert.type}
          </h4>
          <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
          {alert.message && (
            <div className="mt-3 flex gap-2 rounded-lg bg-accent/40 p-3 text-xs text-primary">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p className="font-semibold">Alert details</p>
                <p className="mt-0.5 text-primary/90">{alert.message}</p>
              </div>
            </div>
          )}
          {isActive && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={onResolve}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-glow"
              >
                Mark Resolved
              </button>
              {onContact && (
                <button
                  onClick={onContact}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Contact Patient
                </button>
              )}
              {onEscalate && (
                <button
                  onClick={onEscalate}
                  className="rounded-lg border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5"
                >
                  Escalate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
