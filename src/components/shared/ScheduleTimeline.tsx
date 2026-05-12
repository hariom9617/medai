import { Clock } from "lucide-react";

export function ScheduleTimeline({ times, days }: { times: string[]; days: string[] }) {
  if (!times.length) return <p className="text-sm text-slate-500">No times scheduled.</p>;
  const dayLabel = days.includes("all") || days.length === 0 ? "Every day" : days.map((d) => d[0].toUpperCase() + d.slice(1, 3)).join(", ");
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{dayLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {times.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            <Clock className="h-3 w-3" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}