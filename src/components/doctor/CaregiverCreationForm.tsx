import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { useCreateCaregiver } from "@/hooks/queries";

const schema = z.object({
  fullName: z.string().trim().min(2, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  relationship: z.string().trim().max(60).optional(),
  address: z.string().trim().max(255).optional(),
});
type Data = z.infer<typeof schema>;

export function CaregiverCreationForm({
  onCreated,
}: {
  onCreated?: (cg: any) => void;
}) {
  const create = useCreateCaregiver();
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
      const cg = await create.mutateAsync({
        fullName: d.fullName,
        email: d.email,
        password: d.password,
        phone: d.phone || undefined,
        relationship: d.relationship,
        address: d.address,
      });
      toast.success(`Caregiver ${d.fullName} created`);
      reset();
      onCreated?.(cg);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create caregiver");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      autoComplete="off"
      className="space-y-5"
    >
      <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-slate-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        One caregiver can manage up to 3 patients.
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full Name" error={errors.fullName?.message}>
          <Input
            placeholder="John Smith"
            autoComplete="off"
            {...register("fullName")}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="caregiver@example.com"
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
        <Field label="Relationship to Patient">
          <Input
            placeholder="Spouse, Daughter, Nurse…"
            autoComplete="off"
            {...register("relationship")}
          />
        </Field>
        <Field label="Address">
          <Input
            placeholder="Street, City"
            autoComplete="off"
            {...register("address")}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
      >
        {create.isPending ? "Creating…" : "Create Caregiver"}
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
