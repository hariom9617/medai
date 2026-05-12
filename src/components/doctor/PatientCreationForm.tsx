import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/queries";

const schema = z.object({
  fullName: z.string().trim().min(2, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  age: z.coerce.number().int().min(0).max(120).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  conditions: z.string().max(500).optional(),
  emergencyContactName: z.string().trim().max(80).optional(),
  emergencyContactPhone: z.string().trim().max(40).optional(),
  emergencyContactRelationship: z.string().trim().max(40).optional(),
});
type Data = z.infer<typeof schema>;

export function PatientCreationForm({
  onCreated,
}: {
  onCreated?: (patient: any) => void;
}) {
  const create = useCreatePatient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Data>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const submit = async (d: Data) => {
    try {
      const patient = await create.mutateAsync({
        fullName: d.fullName,
        email: d.email,
        password: d.password,
        phone: d.phone || undefined,
        age: d.age,
        gender: d.gender,
        conditions: d.conditions
          ? d.conditions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        emergencyContact: (d.emergencyContactName || d.emergencyContactPhone)
          ? {
              name: d.emergencyContactName || undefined,
              phone: d.emergencyContactPhone || undefined,
              relationship: d.emergencyContactRelationship || undefined,
            }
          : undefined,
      });
      toast.success(`Patient ${d.fullName} created`);
      reset();
      onCreated?.(patient);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create patient");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      autoComplete="off"
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full Name" error={errors.fullName?.message}>
          <Input
            placeholder="Jane Doe"
            autoComplete="off"
            {...register("fullName")}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="patient@example.com"
            autoComplete="off"
            {...register("email")}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
        <Field label="Phone">
          <Input
            placeholder="+1 555 000 0000"
            autoComplete="off"
            {...register("phone")}
          />
        </Field>
        <Field label="Age">
          <Input
            type="number"
            placeholder="65"
            autoComplete="off"
            {...register("age")}
          />
        </Field>
        <Field label="Gender">
          <select
            {...register("gender")}
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:border-primary focus:bg-white focus:outline-none"
          >
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Medical Conditions (comma-separated)">
        <Input
          placeholder="Hypertension, Type 2 Diabetes"
          autoComplete="off"
          {...register("conditions")}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Emergency Contact Name">
          <Input
            placeholder="John Doe"
            autoComplete="off"
            {...register("emergencyContactName")}
          />
        </Field>
        <Field label="Emergency Contact Phone">
          <Input
            placeholder="+1 555 000 0001"
            autoComplete="off"
            {...register("emergencyContactPhone")}
          />
        </Field>
        <Field label="Relationship">
          <Input
            placeholder="Spouse"
            autoComplete="off"
            {...register("emergencyContactRelationship")}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
      >
        {create.isPending ? "Creating…" : "Create Patient"}
      </button>
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
    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
  />
));
Input.displayName = "Input";

function Field({
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
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}