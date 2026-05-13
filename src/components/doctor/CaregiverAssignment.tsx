import { useMemo, useState } from "react";
import { Search, UserCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCaregivers, useAssignCaregiver } from "@/hooks/queries";
import { SkeletonRow } from "@/components/common/Skeletons";

const MAX = 3;

interface Props {
  patientId: string;
  assignedCaregiverIds?: string[];
}

export function CaregiverAssignment({
  patientId,
  assignedCaregiverIds = [],
}: Props) {
  const { data: caregivers = [], isLoading } = useCaregivers();
  const assign = useAssignCaregiver();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>("");

  const getCaregiverId = (c: any): string => {
    if (typeof c.id === "string") return c.id;
    if (typeof c._id === "string") return c._id;
    if (c.id?.toString) return c.id.toString();
    if (c._id?.toString) return c._id.toString();
    return String(c.id || c._id || "");
  };

  const filtered = useMemo(
    () =>
      caregivers.filter((c) =>
        c.fullName.toLowerCase().includes(q.toLowerCase()),
      ),
    [caregivers, q],
  );

  const handleAssign = async () => {
    if (!selected) return;
    try {
      await assign.mutateAsync({ patientId, caregiverId: selected });
      toast.success("Caregiver assigned");
      setSelected("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to assign caregiver");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search caregivers…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No caregivers found.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-auto">
          {filtered.map((c) => {
            const caregiverId = getCaregiverId(c);
            const atMax = (c.patientCount ?? 0) >= MAX;
            const isAlreadyAssigned =
              assignedCaregiverIds.includes(caregiverId);
            const isSelected = selected === caregiverId;
            const isDisabled = atMax || isAlreadyAssigned;

            return (
              <li
                key={caregiverId}
                className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                  isAlreadyAssigned
                    ? "border-emerald-200 bg-emerald-50"
                    : isSelected
                      ? "border-primary bg-accent/40"
                      : "border-slate-200 bg-white"
                } ${isDisabled ? "opacity-70" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {c.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.relationship || "Caregiver"} · {c.patientCount ?? 0}/
                    {MAX} patients
                  </p>
                </div>

                {isAlreadyAssigned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Assigned
                  </span>
                ) : atMax ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
                    <AlertTriangle className="h-3 w-3" /> Max capacity
                  </span>
                ) : (
                  <button
                    onClick={() => setSelected(isSelected ? "" : caregiverId)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        disabled={!selected || assign.isPending}
        onClick={handleAssign}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
      >
        <UserCheck className="h-4 w-4" />
        {assign.isPending ? "Assigning…" : "Assign Caregiver"}
      </button>
    </div>
  );
}
