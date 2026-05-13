import React, { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/common/Modal";
import { useDoctorMedications } from "@/hooks/queries";
import type { MedicationCatalog } from "@/types";
import {
  Pill,
  Clock,
  Calendar,
  X,
  Plus,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const schema = z.object({
  medicationId: z.string().min(1, "Please select a medication"),
  dosage: z.string().trim().min(1, "Dosage is required").max(50),
  scheduleType: z.enum(["daily", "weekly"]),
  times: z.array(z.string()).min(1, "Add at least one time"),
  daysOfWeek: z.array(z.string()).optional(),
  instructions: z.string().trim().max(500).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

export type AssignMedicationFormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignMedicationFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssignMedicationModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const { data: medications = [], isLoading: isLoadingMedications } =
    useDoctorMedications();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationCatalog | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [times, setTimes] = useState<string[]>(["09:00"]);
  const [newTime, setNewTime] = useState("12:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignMedicationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduleType: "daily",
      times: ["09:00"],
      daysOfWeek: ["monday", "wednesday", "friday"],
      startDate: today,
    },
  });

  const scheduleType = watch("scheduleType");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMedications = useMemo(() => {
    if (!searchQuery) return medications;
    const q = searchQuery.toLowerCase();
    return medications.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    );
  }, [medications, searchQuery]);

  const getMedId = (med: MedicationCatalog) => med.id || med._id || "";

  const handleSelectMedication = (medication: MedicationCatalog) => {
    setSelectedMedication(medication);
    setValue("medicationId", getMedId(medication));
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleAddTime = () => {
    if (!times.includes(newTime)) {
      const newTimes = [...times, newTime].sort();
      setTimes(newTimes);
      setValue("times", newTimes);
    }
  };

  const handleRemoveTime = (time: string) => {
    const newTimes = times.filter((t) => t !== time);
    setTimes(newTimes);
    setValue("times", newTimes);
  };

  const handleToggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort(),
    );
  };

  const handleFormSubmit = async (data: AssignMedicationFormData) => {
    if (!selectedMedication) {
      toast.error("Please select a medication");
      return;
    }
    const finalData: AssignMedicationFormData = {
      ...data,
      medicationId: getMedId(selectedMedication),
      times,
      daysOfWeek:
        scheduleType === "weekly"
          ? selectedDays.map((d) => DAY_NAMES[d])
          : undefined,
    };
    await onSubmit(finalData);
    handleClose();
  };

  const handleClose = () => {
    reset();
    setSelectedMedication(null);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setTimes(["09:00"]);
    setNewTime("12:00");
    setSelectedDays([1, 3, 5]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Assign Medication"
      subtitle="Select a medication and configure prescription"
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* ── Medication Dropdown ── */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Medication *
          </label>
          <div className="relative mt-1.5" ref={dropdownRef}>
            {/* Trigger button */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen((v) => !v);
                setSearchQuery("");
              }}
              className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm transition ${
                errors.medicationId
                  ? "border-destructive focus:ring-destructive/20"
                  : isDropdownOpen
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-slate-200 hover:border-slate-300"
              } bg-white`}
            >
              {selectedMedication ? (
                <span className="flex items-center gap-2 truncate">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-accent text-primary">
                    <Pill className="h-3 w-3" />
                  </span>
                  <span className="font-medium text-slate-900 truncate">
                    {selectedMedication.name}
                  </span>
                  <span className="shrink-0 text-slate-400">
                    · {selectedMedication.strength} · {selectedMedication.form}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400">
                  {isLoadingMedications
                    ? "Loading medications…"
                    : "Select a medication…"}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                {/* Search inside dropdown */}
                <div className="border-b border-slate-100 p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, generic, category…"
                      className="h-8 w-full rounded-lg bg-slate-50 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Options list */}
                <ul className="max-h-52 overflow-y-auto py-1">
                  {isLoadingMedications ? (
                    [0, 1, 2].map((i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 px-3 py-2.5"
                      >
                        <div className="h-6 w-6 animate-pulse rounded bg-slate-100" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                          <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
                        </div>
                      </li>
                    ))
                  ) : filteredMedications.length === 0 ? (
                    <li className="px-3 py-4 text-center text-sm text-slate-400">
                      No medications found
                    </li>
                  ) : (
                    filteredMedications.map((med) => {
                      const isSelected =
                        getMedId(selectedMedication ?? ({} as any)) ===
                        getMedId(med);
                      return (
                        <li key={getMedId(med)}>
                          <button
                            type="button"
                            onClick={() => handleSelectMedication(med)}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-accent text-primary"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Pill className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-slate-900"}`}
                              >
                                {med.name}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {med.genericName && `${med.genericName} · `}
                                {med.strength} · {med.form} · {med.category}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 shrink-0 text-primary" />
                            )}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
          {errors.medicationId && (
            <p className="mt-1 text-xs text-destructive">
              {errors.medicationId.message}
            </p>
          )}
        </div>

        {/* ── Rest of form (only shown after selection) ── */}
        {selectedMedication && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Dosage *" error={errors.dosage?.message}>
                <Input
                  placeholder="e.g. 500mg twice daily"
                  {...register("dosage")}
                />
              </FormField>

              <FormField
                label="Schedule Type *"
                error={errors.scheduleType?.message}
              >
                <div className="flex gap-2">
                  {(["daily", "weekly"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue("scheduleType", type)}
                      className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold capitalize transition ${
                        scheduleType === type
                          ? "border-primary bg-accent text-primary"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {type === "daily" ? (
                        <Clock className="mr-1 inline h-4 w-4" />
                      ) : (
                        <Calendar className="mr-1 inline h-4 w-4" />
                      )}
                      {type}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            {scheduleType === "weekly" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Days of Week
                </label>
                <div className="mt-2 flex gap-2">
                  {DAY_LABELS.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDay(idx)}
                      className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                        selectedDays.includes(idx)
                          ? "bg-primary text-primary-foreground"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Dose Times *
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {times.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {time}
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(time)}
                      className="text-primary/60 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" /> Add Time
                </button>
              </div>
              {errors.times && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.times.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Start Date *" error={errors.startDate?.message}>
                <Input type="date" {...register("startDate")} />
              </FormField>
              <FormField
                label="End Date (Optional)"
                error={errors.endDate?.message}
              >
                <Input type="date" {...register("endDate")} />
              </FormField>
            </div>

            <FormField
              label="Instructions"
              error={errors.instructions?.message}
            >
              <textarea
                rows={3}
                placeholder="e.g. Take with food, avoid alcohol..."
                {...register("instructions")}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>

            <div className="rounded-lg bg-accent/40 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Schedule Preview
              </p>
              <p className="font-semibold text-slate-900">
                {selectedMedication.name}
              </p>
              <p className="text-sm text-slate-600">
                {scheduleType === "daily"
                  ? "Daily"
                  : `On ${selectedDays.map((d) => DAY_LABELS[d]).join(", ")}`}{" "}
                at {times.join(", ")}
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedMedication}
            className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
          >
            {isSubmitting ? "Assigning..." : "Assign Medication"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
  />
));
Input.displayName = "Input";

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
