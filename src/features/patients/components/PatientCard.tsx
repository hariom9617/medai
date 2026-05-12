import { Link } from "react-router-dom";
import { MessageSquare, Phone, BellRing } from "lucide-react";
import type { MockPatient } from "@/features/shared/mock/patients";
import { safeDistanceToNow } from "@/lib/date";
import { RiskBadge } from "@/features/alerts/components/RiskBadge";

export function PatientCard({
  patient,
  basePath,
  onContact,
  onNotify,
}: {
  patient: MockPatient;
  basePath: string;
  onContact?: () => void;
  onNotify?: () => void;
}) {
  const initials = (patient.fullName || "Unknown")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const adherenceColor =
    patient.adherenceRate >= 85
      ? "text-success"
      : patient.adherenceRate >= 70
        ? "text-warning"
        : "text-destructive";
  const borderTone =
    patient.riskLevel === "high"
      ? "border-l-destructive"
      : patient.riskLevel === "medium"
        ? "border-l-warning"
        : "border-l-success";
  return (
    <div className={`card-base border-l-4 ${borderTone} p-5`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-full font-semibold ${patient.avatarColor}`}
          >
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">
              {patient.fullName}
            </p>
            <p className="text-xs text-slate-500">
              Age {patient.age} · {patient.activeMedications} medications
            </p>
          </div>
        </div>
        <RiskBadge level={patient.riskLevel} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Adherence</p>
          <p className={`text-xl font-bold ${adherenceColor}`}>
            {patient.adherenceRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Missed (7d)</p>
          <p className="text-xl font-bold text-slate-900">
            {patient.missedThisWeek}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Next dose</p>
          <p className="text-xl font-bold text-slate-900">
            {patient.nextDoseAt}
          </p>
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-slate-500">
        Caregiver: {patient.caregiver} · Last active{" "}
        {safeDistanceToNow(patient.lastActiveISO)} ago
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          to={`${basePath}/${patient.id}`}
          className="flex-1 rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
        >
          View Details
        </Link>
        <button
          onClick={onContact}
          title="Contact patient"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          onClick={onNotify}
          title="Send reminder"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <BellRing className="h-4 w-4" />
        </button>
        <button
          title="Message"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
