import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import type { MedicationCatalog } from "@/types";

const schema = z.object({
  name: z.string().trim().min(1, "Medication name is required").max(100),
  genericName: z.string().trim().max(100).optional(),
  category: z.string().trim().min(1, "Category is required").max(50),
  strength: z.string().trim().min(1, "Strength is required").max(50),
  form: z.enum(["tablet", "capsule", "syrup", "injection", "other"], {
    required_error: "Form is required",
  }),
  importance: z.enum(["critical", "important", "routine"]).default("routine"),
  manufacturer: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  sideEffects: z.string().trim().max(500).optional(),
});

function formatSideEffects(value: string[] | undefined): string {
  if (!value || value.length === 0) return "";
  return value.join(", ");
}

export type MedicationCatalogFormData = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
  initialData?: MedicationCatalog;
  onSubmit: (data: MedicationCatalogFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MedicationCatalogForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationCatalogFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      genericName: "",
      category: "",
      strength: "",
      form: "tablet",
      importance: "routine",
      manufacturer: "",
      description: "",
      sideEffects: "",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        name: initialData.name,
        genericName: initialData.genericName || "",
        category: initialData.category,
        strength: initialData.strength,
        form: initialData.form,
        importance: (initialData as any).importance ?? "routine",
        manufacturer: initialData.manufacturer || "",
        description: initialData.description || "",
        sideEffects: formatSideEffects(initialData.sideEffects),
      });
    }
  }, [initialData, mode, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Medication Name *" error={errors.name?.message}>
          <Input placeholder="e.g. Metformin" {...register("name")} />
        </FormField>
        <FormField label="Generic Name" error={errors.genericName?.message}>
          <Input
            placeholder="e.g. Metformin hydrochloride"
            {...register("genericName")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField label="Category *" error={errors.category?.message}>
          <Input placeholder="e.g. Antidiabetic" {...register("category")} />
        </FormField>
        <FormField label="Strength *" error={errors.strength?.message}>
          <Input placeholder="e.g. 500mg" {...register("strength")} />
        </FormField>
        <FormField label="Form *" error={errors.form?.message}>
          <select
            {...register("form")}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="syrup">Syrup</option>
            <option value="injection">Injection</option>
            <option value="other">Other</option>
          </select>
        </FormField>
      </div>

      {/* Importance field */}
      <FormField label="Importance *" error={errors.importance?.message}>
        <div className="grid grid-cols-3 gap-3">
          {(["critical", "important", "routine"] as const).map((level) => {
            const config = {
              critical: {
                emoji: "🔴",
                label: "Critical",
                selectedClass: "border-red-400 bg-red-50 text-red-700",
              },
              important: {
                emoji: "🟡",
                label: "Important",
                selectedClass: "border-yellow-400 bg-yellow-50 text-yellow-700",
              },
              routine: {
                emoji: "🟢",
                label: "Routine",
                selectedClass: "border-green-400 bg-green-50 text-green-700",
              },
            }[level];
            return (
              <label
                key={level}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-slate-200 p-3 text-center transition hover:border-slate-300 has-[:checked]:border-current"
              >
                <input
                  type="radio"
                  value={level}
                  {...register("importance")}
                  className="sr-only"
                />
                <span className="text-lg">{config.emoji}</span>
                <span className="text-xs font-semibold text-slate-700">
                  {config.label}
                </span>
              </label>
            );
          })}
        </div>
      </FormField>

      <FormField label="Manufacturer" error={errors.manufacturer?.message}>
        <Input placeholder="e.g. Pfizer" {...register("manufacturer")} />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea
          rows={3}
          placeholder="Brief description of the medication..."
          {...register("description")}
        />
      </FormField>

      <FormField label="Side Effects" error={errors.sideEffects?.message}>
        <Textarea
          rows={3}
          placeholder="Common side effects..."
          {...register("sideEffects")}
        />
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
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Medication"
              : "Update Medication"}
        </button>
      </div>
    </form>
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

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    {...props}
    ref={ref}
    className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
  />
));
Textarea.displayName = "Textarea";

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
