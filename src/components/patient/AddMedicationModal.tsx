import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AlarmClock, Plus, ChevronDown } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { useCreateMedication } from "@/hooks/queries";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  dosage: z.string().trim().min(1, "Required").max(40),
  form: z.enum(["Tablet", "Capsule", "Liquid", "Injection", "Gummy"]),
  instructions: z.string().max(500).optional(),
});
type Data = z.infer<typeof schema>;

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function AddMedicationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateMedication();
  const [frequency, setFrequency] = useState<"Daily" | "Specific Days" | "As Needed">("Daily");
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [time, setTime] = useState("08:00");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Data>({ resolver: zodResolver(schema), defaultValues: { form: "Tablet" } });

  const submit = async (d: Data) => {
    const freqDays =
      frequency === "Daily"
        ? ["all"]
        : frequency === "Specific Days"
        ? days.map((i) => DAY_NAMES[i])
        : [];
    try {
      await create.mutateAsync({
        name: d.name,
        dosage: d.dosage,
        frequency: { times: [time], days: freqDays },
        startDate: new Date().toISOString(),
        instructions: d.instructions,
      });
      toast.success(`${d.name} added`);
      reset();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add medication");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Medication" subtitle="Create a new adherence schedule" size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <Field label="Medication Name" error={errors.name?.message}>
          <Input placeholder="e.g. Advil" {...register("name")} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Dosage" error={errors.dosage?.message}>
            <Input placeholder="e.g. 500mg" {...register("dosage")} />
          </Field>
          <Field label="Form">
            <div className="relative">
              <select
                {...register("form")}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Tablet</option>
                <option>Capsule</option>
                <option>Liquid</option>
                <option>Injection</option>
                <option>Gummy</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Frequency</p>
          <div className="mt-3 flex gap-3">
            {(["Daily", "Specific Days", "As Needed"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`flex-1 rounded-lg border-2 py-3 text-sm font-medium transition ${
                  frequency === f
                    ? "border-primary bg-accent text-primary"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {frequency !== "As Needed" && (
            <div className="mt-4 flex justify-between gap-2">
              {DAY_LABELS.map((d, idx) => {
                const active = frequency === "Daily" || days.includes(idx);
                const interactive = frequency === "Specific Days";
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!interactive}
                    onClick={() =>
                      setDays((cur) => (cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx]))
                    }
                    className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                      active ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-400"
                    } ${interactive ? "" : "cursor-default"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-accent/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlarmClock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">First Dose</p>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm text-slate-600 hover:text-primary">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Field label="Special Instructions">
          <textarea
            placeholder="e.g. Take with food, avoid alcohol…"
            rows={3}
            {...register("instructions")}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Save Medication"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
  />
);

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
