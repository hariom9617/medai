import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SOSMedication } from "@/types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
  dosage: z.string().trim().min(1, "Dosage is required").max(50),
  unit: z.string().trim().min(1, "Unit is required").max(30),
  category: z.string().trim().min(1, "Category is required").max(50),
  importance: z.enum(["critical", "important"]),
  sideEffects: z.string().trim().max(500).optional(),
  instructions: z.string().trim().max(1000).optional(),
  maxDosesPerDay: z.coerce.number().int().min(1).max(10),
  cooldownMinutes: z.coerce.number().int().min(0).max(1440),
});

export type SOSMedicationFormData = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
  initialData?: SOSMedication;
  onSubmit: (data: SOSMedicationFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SOSMedicationForm({ mode, initialData, onSubmit, onCancel, isSubmitting = false }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SOSMedicationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      dosage: "",
      unit: "mg",
      category: "",
      importance: "critical",
      sideEffects: "",
      instructions: "",
      maxDosesPerDay: 2,
      cooldownMinutes: 240,
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        name: initialData.name,
        description: initialData.description ?? "",
        dosage: initialData.dosage,
        unit: initialData.unit,
        category: initialData.category,
        importance: initialData.importance,
        sideEffects: initialData.sideEffects ?? "",
        instructions: initialData.instructions ?? "",
        maxDosesPerDay: initialData.maxDosesPerDay,
        cooldownMinutes: initialData.cooldownMinutes,
      });
    }
  }, [initialData, mode, reset]);

  const cooldownMinutes = watch("cooldownMinutes");
  const cooldownDisplay = cooldownMinutes >= 60
    ? `${Math.floor(cooldownMinutes / 60)}h ${cooldownMinutes % 60 > 0 ? `${cooldownMinutes % 60}m` : ""}`.trim()
    : `${cooldownMinutes}m`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Medication Name *" error={errors.name?.message}>
          <Input placeholder="e.g. Nitroglycerin" {...register("name")} />
        </FormField>
        <FormField label="Category *" error={errors.category?.message}>
          <Input placeholder="e.g. Cardiac, Analgesic" {...register("category")} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Dosage *" error={errors.dosage?.message}>
          <Input placeholder="e.g. 0.5" {...register("dosage")} />
        </FormField>
        <FormField label="Unit *" error={errors.unit?.message}>
          <Input placeholder="e.g. mg, ml, tablet" {...register("unit")} />
        </FormField>
        <FormField label="Importance *" error={errors.importance?.message}>
          <select
            {...register("importance")}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="critical">🔴 Critical</option>
            <option value="important">🟡 Important</option>
          </select>
        </FormField>
      </div>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea rows={2} placeholder="Brief description of the medication..." {...register("description")} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Max Doses Per Day *" error={errors.maxDosesPerDay?.message}>
          <Input type="number" min={1} max={10} {...register("maxDosesPerDay")} />
        </FormField>
        <FormField
          label={`Cooldown Between Doses * (${cooldownDisplay})`}
          error={errors.cooldownMinutes?.message}
        >
          <Input type="number" min={0} max={1440} placeholder="Minutes" {...register("cooldownMinutes")} />
        </FormField>
      </div>

      <FormField label="Instructions (when to take this)" error={errors.instructions?.message}>
        <Textarea rows={3} placeholder="e.g. Take under the tongue when chest pain begins..." {...register("instructions")} />
      </FormField>

      <FormField label="Side Effects" error={errors.sideEffects?.message}>
        <Textarea rows={2} placeholder="Common side effects..." {...register("sideEffects")} />
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create SOS Medication" : "Update SOS Medication"}
        </button>
      </div>
    </form>
  );
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      {...props}
      ref={ref}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => (
    <textarea
      {...props}
      ref={ref}
      className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  )
);
Textarea.displayName = "Textarea";

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
