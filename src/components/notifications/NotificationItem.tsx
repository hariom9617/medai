import {
  Bell,
  AlertTriangle,
  Pill,
  Sparkles,
  Package,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { safeDistanceToNow } from "@/lib/date";
import type { Alert } from "@/types";

const ICONS: Record<string, any> = {
  missed_dose: AlertTriangle,
  high_risk: Sparkles,
  delay: Pill,
  anomaly: Bell,
  medication_refill: Package,
  low_adherence: TrendingDown,
};
const TYPE_LABELS: Record<string, string> = {
  missed_dose: "Missed Dose",
  high_risk: "High Risk",
  delay: "Delayed Dose",
  anomaly: "Anomaly",
  medication_refill: "Refill Needed",
  low_adherence: "Low Adherence",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Alert;
  onMarkAsRead?: (id: string) => void;
}) {
  const Icon = ICONS[notification.type] || Bell;
  const isUnread = !notification.isRead;
  const id = notification.id || notification._id;
  const handleMarkAsRead = () => {
    if (isUnread && id && onMarkAsRead) onMarkAsRead(id);
  };

  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${isUnread ? "bg-accent/40" : ""}`}
      onClick={handleMarkAsRead}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${isUnread ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium truncate ${isUnread ? "text-slate-900" : "text-slate-700"}`}
            >
              {notification.title ||
                TYPE_LABELS[notification.type] ||
                notification.type?.replace(/_/g, " ") ||
                "Alert"}
            </p>
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
              {notification.message}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {safeDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>
          {isUnread && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              className="shrink-0 rounded-full p-1 hover:bg-slate-200 transition-colors"
              title="Mark as read"
            >
              <CheckCircle2 className="h-4 w-4 text-slate-400 hover:text-primary" />
            </button>
          )}
        </div>
      </div>
      {isUnread && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
}
