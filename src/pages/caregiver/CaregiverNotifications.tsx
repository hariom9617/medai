import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, FilterChip, EmptyState } from "@/features/shared/ui";
import { mockNotifications } from "@/features/shared/mock/patients";
import {
  Bell,
  AlertTriangle,
  MessageCircle,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { safeDistanceToNow } from "@/lib/date";

const ICON: Record<string, any> = {
  emergency: AlertTriangle,
  reminder: Bell,
  doctor: Stethoscope,
  escalation: MessageCircle,
  system: Wrench,
};
const TONE: Record<string, string> = {
  emergency: "bg-destructive/10 text-destructive",
  reminder: "bg-accent text-primary",
  doctor: "bg-info/10 text-info",
  escalation: "bg-warning/10 text-warning",
  system: "bg-slate-100 text-slate-500",
};
type Tab = "all" | "unread" | "emergency";

export default function CaregiverNotifications() {
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState(mockNotifications);
  const filtered = useMemo(() => {
    if (tab === "unread") return items.filter((i) => i.unread);
    if (tab === "emergency") return items.filter((i) => i.type === "emergency");
    return items;
  }, [items, tab]);

  return (
    <AppLayout title="Notifications">
      <PageHeader
        title="Notification Center"
        subtitle={`${items.filter((i) => i.unread).length} unread`}
        actions={
          <button
            onClick={() =>
              setItems((arr) => arr.map((i) => ({ ...i, unread: false })))
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Mark all as read
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "unread", "emergency"] as Tab[]).map((t) => (
          <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </FilterChip>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up."
        />
      ) : (
        <div className="card-base divide-y divide-slate-100">
          {filtered.map((n) => {
            const Icon = ICON[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 ${n.unread ? "bg-accent/20" : ""}`}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${TONE[n.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {safeDistanceToNow(n.time, { addSuffix: true })}
                  </p>
                </div>
                {n.unread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
