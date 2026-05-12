import { useEffect } from "react";
import {
  Bell,
  ArrowLeftRight,
  MessageSquare,
  Mail,
  Moon,
  Send,
  Clock as ClockIcon,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSettings } from "@/store/settings";
import { useAuth } from "@/context/AuthContext";
import { NotificationsApi } from "@/api/notifications";
import { toast } from "sonner";

export default function Settings() {
  const s = useSettings();
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    if (user?.notificationPrefs) s.setFromPrefs(user.notificationPrefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const persist = async (
    patch: Partial<{
      leadTime: number;
      push: boolean;
      sms: boolean;
      email: boolean;
    }>,
  ) => {
    s.update(patch);
    try {
      await updateProfile({
        notificationPrefs: {
          push: patch.push ?? s.push,
          sms: patch.sms ?? s.sms,
          email: patch.email ?? s.email,
          reminderLeadMinutes: patch.leadTime ?? s.leadTime,
        },
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save settings");
    }
  };

  const sendTest = async () => {
    try {
      await NotificationsApi.test();
      toast.success("Test notification sent!");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send");
    }
  };

  return (
    <AppLayout title="Notification Settings">
      <h2 className="text-3xl font-bold text-slate-900">Reminder settings</h2>
      <p className="mt-1 text-sm text-slate-500">
        Configure how and when you want to be reminded about your healthcare
        routine.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-base p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
              <ClockIcon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Lead Time</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            How early should we notify you before your scheduled dose?
          </p>
          <div className="mt-5 space-y-2">
            {[5, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => persist({ leadTime: m })}
                className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-sm font-medium ${s.leadTime === m ? "border-primary bg-accent text-primary" : "border-slate-200 text-slate-700"}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${s.leadTime === m ? "border-primary bg-primary" : "border-slate-300"}`}
                  />
                  {m} minutes before
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-info/10 text-info">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Channels</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Choose which platforms you want to receive alerts on.
          </p>
          <div className="mt-5 space-y-4">
            {(
              [
                {
                  k: "push",
                  icon: Bell,
                  t: "Push Notifications",
                  d: "Sent to your mobile device",
                  v: s.push,
                },
                {
                  k: "sms",
                  icon: MessageSquare,
                  t: "SMS Reminders",
                  d: "Carrier rates may apply",
                  v: s.sms,
                },
                {
                  k: "email",
                  icon: Mail,
                  t: "Email Digests",
                  d: "Weekly health summary",
                  v: s.email,
                },
              ] as const
            ).map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.k} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.t}</p>
                    <p className="text-xs text-slate-500">{c.d}</p>
                  </div>
                  <button
                    onClick={() => persist({ [c.k]: !c.v } as any)}
                    className={`relative h-6 w-11 rounded-full transition ${c.v ? "bg-primary" : "bg-slate-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${c.v ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 card-base p-6 flex items-center gap-5">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Moon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">Quiet Hours</h3>
          <p className="text-sm text-slate-500">
            Mute non-urgent notifications during rest.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">
              Start
            </p>
            <p className="text-lg font-bold">{s.quietStart}</p>
          </div>
          <span className="text-slate-400">→</span>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">
              End
            </p>
            <p className="text-lg font-bold">{s.quietEnd}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 card-base bg-gradient-to-br from-primary to-primary-glow p-6 text-white">
        <h3 className="text-2xl font-bold">See it in action</h3>
        <p className="mt-2 text-sm text-white/85">
          Test your current settings by sending a sample SMS and Email notification to
          your registered Details.
        </p>
        <button
          onClick={sendTest}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary"
        >
          <Send className="h-4 w-4" /> Send Test Notification
        </button>
      </div>
    </AppLayout>
  );
}
