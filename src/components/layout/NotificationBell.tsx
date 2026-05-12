import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Pill, Sparkles } from "lucide-react";
import { useAlerts, useAcknowledgeAlert } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const ICONS: Record<string, any> = {
  missed_dose: AlertTriangle,
  high_risk: Sparkles,
  delay: Pill,
  anomaly: Bell,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: rawAlerts } = useAlerts();
  const alerts = Array.isArray(rawAlerts) ? rawAlerts : [];
  const ack = useAcknowledgeAlert();
  const unread = alerts.filter((a) => !a.isRead).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAll = async () => {
    await Promise.all(
      alerts.filter((a) => !a.isRead).map((a) => ack.mutateAsync((a as any)._id ?? a.id!))
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 rounded-xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <button onClick={markAll} className="text-xs font-medium text-primary hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.slice(0, 5).map((a) => {
              const Icon = ICONS[a.type] ?? Bell;
              const isActive = !a.isRead;
              return (
                <div
                  key={(a as any)._id ?? a.id}
                  className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0 ${isActive ? "bg-accent/40" : ""}`}
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.title ?? a.type?.replace(/_/g, " ") ?? "Alert"}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{a.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {isActive && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
              );
            })}
            {alerts.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No notifications.</p>}
          </div>
          <Link to="/patient/settings" onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-slate-50">
            View all alerts
          </Link>
        </div>
      )}
    </div>
  );
}
