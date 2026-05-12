// src/features/patients/components/PatientHeader.tsx
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import type { MockPatient } from "@/features/shared/mock/patients";
import { RiskBadge } from "@/features/alerts/components/RiskBadge";

export function PatientHeader({ patient, backTo }: { patient: MockPatient; backTo: string }) {
  const initials = patient.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // FIXED: guard undefined numbers → NaN in DOM
  const adherenceRate = patient.adherenceRate ?? 0;
  const riskScore = patient.riskScore ?? "--";
  const missedThisWeek = patient.missedThisWeek ?? 0;

  return (
    <div className="card-base mb-6 p-6">
      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`grid h-16 w-16 place-items-center rounded-full text-lg font-semibold ${patient.avatarColor ?? "bg-slate-200 text-slate-600"}`}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{patient.fullName}</h2>
              <RiskBadge level={patient.riskLevel} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Age {patient.age ?? "?"} · {(patient.conditions ?? []).join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {patient.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {patient.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-xs text-slate-500">Adherence</p>
            <p className="text-2xl font-bold text-primary">{adherenceRate}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Risk Score</p>
            <p className="text-2xl font-bold text-slate-900">{riskScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Missed (7d)</p>
            <p className="text-2xl font-bold text-slate-900">{missedThisWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
}