import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Pill, Calendar, Clock, X } from "lucide-react";
import { toast } from "sonner";
import {
  useDoctorPatientMedications,
  useDoctorCreateMedication,
  useDoctorDeleteMedication,
} from "@/hooks/queries";
import { ScheduleTimeline } from "@/components/shared/ScheduleTimeline";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  dosage: z.string().trim().min(1, "Required").max(40),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().optional(),
  instructions: z.string().max(500).optional(),
});
type Data = z.infer<typeof schema>;

export function MedicationScheduler({ patientId }: { patientId: string }) {
  const { data: meds = [] } = useDoctorPatientMedications(patientId);
  const create = useDoctorCreateMedication();
  const remove = useDoctorDeleteMedication(patientId);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [times, setTimes] = useState<string[]>(["09:00"]);
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [newTime, setNewTime] = useState("12:00");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: today },
  });

  const submit = async (d: Data) => {
    if (!times.length) {
      toast.error("Add at least one dose time");
      return;
    }
    try {
      await create.mutateAsync({
        patientId,
        input: {
          name: d.name,
          dosage: d.dosage,
          frequency: {
            times: [...times].sort(),
            days: mode === "daily" ? ["all"] : days.map((i) => DAY_NAMES[i]),
          },
          startDate: d.startDate,
          endDate: d.endDate || undefined,
          instructions: d.instructions,
          patientId,
        },
      });
      toast.success(`${d.name} added`);
      reset({ startDate: today });
      setTimes(["09:00"]);
      setDays([1, 3, 5]);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create medication");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from this patient's plan?`)) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Medication removed");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{meds.length} active medication{meds.length === 1 ? "" : "s"}</p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-glow"
        >
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {open ? "Close" : "New Medication"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <Input placeholder="e.g. Metformin" {...register("name")} />
            </Field>
            <Field label="Dosage" error={errors.dosage?.message}>
              <Input placeholder="e.g. 500mg" {...register("dosage")} />
            </Field>
            <Field label="Start Date" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </Field>
            <Field label="End Date (optional)">
              <Input type="date" {...register("endDate")} />
            </Field>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Schedule</p>
            <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-white p-1">
              {(["daily", "weekly"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    mode === m ? "bg-primary text-primary-foreground" : "text-slate-600"
                  }`}
                >
                  {m === "daily" ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode === "weekly" && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Days</p>
              <div className="mt-2 flex gap-2">
                {DAY_LABELS.map((d, idx) => {
                  const active = days.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDays((cur) => (cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx]))}
                      className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                        active ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dose Times</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {times.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                  {t}
                  <button type="button" onClick={() => setTimes((cur) => cur.filter((x) => x !== t))} className="text-primary/60 hover:text-destructive">
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
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (!times.includes(newTime)) setTimes((cur) => [...cur, newTime]);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Time
              </button>
            </div>
          </div>

          <Field label="Instructions">
            <textarea
              rows={2}
              placeholder="e.g. Take with food"
              {...register("instructions")}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Add to Treatment Plan"}
          </button>
        </form>
      )}

      {meds.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No medications scheduled yet. Add the first one to start the treatment plan.
        </p>
      ) : (
        <ul className="space-y-3">
          {meds.map((m) => (
            <li key={(m as any)._id ?? m.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{m.name} <span className="text-slate-500">{m.dosage}</span></p>
                  {m.instructions && <p className="text-xs text-slate-500">{m.instructions}</p>}
                  <div className="mt-2">
                    <ScheduleTimeline times={m.frequency?.times ?? []} days={m.frequency?.days ?? []} />
                  </div>
                </div>
                <button
                  onClick={() => handleDelete((m as any)._id ?? m.id, m.name)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
);
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}