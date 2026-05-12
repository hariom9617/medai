import { format, isToday, isThisWeek, startOfWeek } from "date-fns";
import { NotificationItem } from "./NotificationItem";
import type { Alert } from "@/types";
import { EmptyState } from "@/features/shared/ui";
import { Inbox } from "lucide-react";

interface NotificationListProps {
  notifications: Alert[];
  isLoading?: boolean;
  error?: unknown;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationList({ notifications, isLoading, error, onMarkAsRead }: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b border-slate-50">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-600">Failed to load notifications. Please try again.</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState icon={Inbox} title="No notifications" />
    );
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    let groupKey: string;

    if (isToday(date)) {
      groupKey = "Today";
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      groupKey = "This Week";
    } else {
      groupKey = format(date, "MMMM yyyy");
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, Alert[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
        <div key={groupKey}>
          <h4 className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {groupKey}
          </h4>
          <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl bg-white">
            {groupNotifications.map((notification) => (
              <NotificationItem
                key={notification.id || notification._id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}