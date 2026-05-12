import { format, isValid, formatDistanceToNow } from "date-fns";

export function safeFormat(value: string | number | Date | null | undefined, fmt: string, fallback = "—"): string {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  return isValid(d) ? format(d, fmt) : fallback;
}

export function safeDistanceToNow(date: string | null | undefined, opts?: { addSuffix?: boolean }): string {
  if (!date) return "some time ago";
  const d = new Date(date);
  if (!isValid(d)) return "some time ago";
  return formatDistanceToNow(d, opts);
}