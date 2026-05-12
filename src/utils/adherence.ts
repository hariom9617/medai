import type { DoseLog } from "@/types";

export function calcAdherence(logs: DoseLog[]): number {
  const considered = logs.filter((l) => l.status === "taken" || l.status === "missed" || l.status === "delayed");
  if (considered.length === 0) return 0;
  const taken = considered.filter((l) => l.status === "taken" || l.status === "delayed").length;
  return Math.round((taken / considered.length) * 100);
}

export function calcStreak(logs: DoseLog[]): number {
  if (!Array.isArray(logs)) return 0;
  const byDay = new Map<string, DoseLog[]>();
  logs.forEach((l) => {
    if (!l.scheduledTime) return;
    const date = new Date(l.scheduledTime);
    if (isNaN(date.getTime())) return;
    const day = date.toISOString().slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), l]);
  });
  const days = Array.from(byDay.keys()).sort().reverse();
  let streak = 0;
  for (const d of days) {
    const dayLogs = byDay.get(d)!;
    const considered = dayLogs.filter((l) => l.status !== "pending");
    if (considered.length === 0) continue;
    const allGood = considered.every((l) => l.status === "taken" || l.status === "delayed");
    if (allGood) streak++;
    else break;
  }
  return streak;
}
