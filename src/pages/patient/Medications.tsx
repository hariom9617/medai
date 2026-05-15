import { useState } from "react";
import { Pill, Stethoscope, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMedications, useMySOSMedications, useTakeSOSDose } from "@/hooks/queries";
import { MedicationCard } from "@/components/patient/MedicationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { useAuth } from "@/context/AuthContext";
import { SkeletonGrid } from "@/components/common/Skeletons";
import type { Medication, PatientSOSMedication } from "@/types";
import { toast } from "sonner";

const IMPORTANCE_ORDER = ["critical", "important", "routine"] as const;

const SECTION_CONFIG = {
  critical: {
    label: "Critical Medications",
    dot: "🔴",
    dividerClass: "border-red-200 bg-red-50",
    textClass: "text-red-700",
    countClass: "bg-red-100 text-red-700",
  },
  important: {
    label: "Important Medications",
    dot: "🟡",
    dividerClass: "border-yellow-200 bg-yellow-50",
    textClass: "text-yellow-700",
    countClass: "bg-yellow-100 text-yellow-700",
  },
  routine: {
    label: "Routine Medications",
    dot: "🟢",
    dividerClass: "border-green-200 bg-green-50",
    textClass: "text-green-700",
    countClass: "bg-green-100 text-green-700",
  },
} as const;

export default function Medications() {
  const { user } = useAuth();
  const {
    data: meds = [],
    isLoading,
    isError,
    error,
  } = useMedications(user?.id);
  const { data: sosMeds = [], isLoading: sosLoading } = useMySOSMedications();

  const [sosTakeTarget, setSosTakeTarget] = useState<PatientSOSMedication | null>(null);
  const [sosReason, setSosReason] = useState("");
  const [sosPainLevel, setSosPainLevel] = useState(5);
  const [sosNotes, setSosNotes] = useState("");
  const takeDoseMutation = useTakeSOSDose();

  // Group by importance
  const grouped = IMPORTANCE_ORDER.reduce(
    (acc, level) => {
      acc[level] = meds.filter(
        (m) => ((m as any).importance ?? "routine") === level,
      );
      return acc;
    },
    {} as Record<string, Medication[]>,
  );

  // Only render sections that have meds
  const activeSections = IMPORTANCE_ORDER.filter(
    (level) => grouped[level].length > 0,
  );

  return (
    <AppLayout title="Medications" search="Search medications…">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Your prescriptions
        </h2>
        <p className="text-sm text-slate-500">
          All medications and supplements assigned by your doctor
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 p-4 text-sm text-slate-700">
        <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <div>
          <p className="font-semibold text-slate-900">
            Medication plans are managed by your doctor.
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            You can view your schedule and track adherence, but cannot add or
            edit prescriptions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <p className="text-sm text-destructive">{(error as Error)?.message}</p>
      ) : meds.length === 0 ? (
        <EmptyState
          icon={<Pill className="h-6 w-6" />}
          title="No medications assigned yet"
          description="Your doctor hasn't assigned any prescriptions. Check back later."
        />
      ) : (
        <div className="space-y-8">
          {activeSections.map((level) => {
            const config = SECTION_CONFIG[level];
            const sectionMeds = grouped[level];
            return (
              <div key={level}>
                {/* Section divider header */}
                <div
                  className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-2.5 ${config.dividerClass}`}
                >
                  <span className="text-base">{config.dot}</span>
                  <span className={`text-sm font-semibold ${config.textClass}`}>
                    {config.label}
                  </span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${config.countClass}`}
                  >
                    {sectionMeds.length}
                  </span>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionMeds.map((m) => (
                    <MedicationCard key={(m as any)._id ?? m.id} med={m} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SOS Medications Section */}
      {!sosLoading && sosMeds.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
            <span className="text-base">🚨</span>
            <span className="text-sm font-semibold text-red-700">Emergency (SOS) Medications</span>
            <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {sosMeds.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sosMeds.map((sos) => (
              <SOSMedCard key={sos.id} med={sos} onTake={() => setSosTakeTarget(sos)} />
            ))}
          </div>
        </div>
      )}

      {/* SOS Confirmation Modal */}
      <Modal
        open={!!sosTakeTarget}
        onClose={() => {
          setSosTakeTarget(null);
          setSosReason("");
          setSosPainLevel(5);
          setSosNotes("");
        }}
        title="⚠️ Take Emergency Medication?"
        subtitle={sosTakeTarget?.name}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>This will immediately notify your doctor and caregiver.</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reason *
            </label>
            <textarea
              value={sosReason}
              onChange={(e) => setSosReason(e.target.value)}
              rows={3}
              placeholder="Describe your symptoms or reason for taking this medication..."
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pain Level: {sosPainLevel}/10 (optional)
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={sosPainLevel}
              onChange={(e) => setSosPainLevel(Number(e.target.value))}
              className="mt-2 w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1 – Mild</span>
              <span>10 – Severe</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Additional Notes (optional)
            </label>
            <textarea
              value={sosNotes}
              onChange={(e) => setSosNotes(e.target.value)}
              rows={2}
              placeholder="Any additional details..."
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setSosTakeTarget(null);
                setSosReason("");
                setSosPainLevel(5);
                setSosNotes("");
              }}
              disabled={takeDoseMutation.isPending}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!sosTakeTarget || !sosReason.trim()) {
                  toast.error("Please provide a reason");
                  return;
                }
                try {
                  await takeDoseMutation.mutateAsync({
                    sosMedicationId: sosTakeTarget.id,
                    reason: sosReason.trim(),
                    painLevel: sosPainLevel,
                    notes: sosNotes.trim() || undefined,
                  });
                  toast.success("Emergency dose logged. Your doctor has been notified.");
                  setSosTakeTarget(null);
                  setSosReason("");
                  setSosPainLevel(5);
                  setSosNotes("");
                } catch (err: any) {
                  toast.error(err?.message || "Failed to log emergency dose");
                }
              }}
              disabled={takeDoseMutation.isPending || !sosReason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {takeDoseMutation.isPending ? "Logging..." : "Confirm & Notify Doctor"}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}

function SOSMedCard({ med, onTake }: { med: PatientSOSMedication; onTake: () => void }) {
  const { isReady, remainingMinutes } = med.cooldownStatus;

  const cooldownLabel = () => {
    if (!remainingMinutes) return "";
    const h = Math.floor(remainingMinutes / 60);
    const m = remainingMinutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
  };

  return (
    <div className="card-base overflow-hidden border border-red-100 border-l-4 border-l-red-400">
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-bold text-red-600">🚨 SOS</span>
          {isReady ? (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              <CheckCircle className="h-3 w-3" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              <Clock className="h-3 w-3" /> Cooldown: {cooldownLabel()} remaining
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900">{med.name}</h3>
        <p className="text-xs text-slate-500">
          {med.dosage} {med.unit}
        </p>

        {med.instructions && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-600">{med.instructions}</p>
        )}
      </div>

      <div className="border-t border-red-100 p-3">
        <button
          onClick={onTake}
          disabled={!isReady}
          className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isReady ? "Take Emergency Dose" : `Available in ${cooldownLabel()}`}
        </button>
      </div>
    </div>
  );
}
