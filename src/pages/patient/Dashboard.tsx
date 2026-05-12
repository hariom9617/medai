import { CheckCircle2, Flame, Clock, AlertTriangle, Plus, Bell } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/patient/StatCard";
import { AIInsightCard } from "@/components/patient/AIInsightCard";
import { MedicationCard } from "@/components/patient/MedicationCard";
import { DoseCompletionCard } from "@/components/patient/DoseCompletionCard";
import { RiskPredictionCard } from "@/features/ai/components/RiskPredictionCard";
import { PageHeader, SectionCard } from "@/features/shared/ui";
import { useMedications, useTodayDoses, useAdherenceSummary, useDoseLogs, useRisk } from "@/hooks/queries";
import { Link } from "react-router-dom";
import { calcStreak } from "@/utils/adherence";
import { useAuth } from "@/context/AuthContext";
import { SkeletonStatCard, SkeletonCard, SkeletonRow } from "@/components/common/Skeletons";

export default function PatientDashboard() {
  const { user } = useAuth();
  const userId = (user as any)?._id ?? user?.id;
  const { data: meds, isLoading: medsLoading } = useMedications(userId);
  const { data: today, isLoading: todayLoading } = useTodayDoses(userId);
  const { data: summary, isLoading: summaryLoading } = useAdherenceSummary("week");
  const { data: logs } = useDoseLogs();
  const { data: riskData, isLoading: isLoadingRisk, error: riskError } = useRisk(userId);

  const medications = Array.isArray(meds) ? meds : [];
  const doseLogs = Array.isArray(logs) ? logs : [];

  // Today doses are flat DoseLog objects with populated medicationId
  const todayFlat = Array.isArray(today) ? today : [];
  const pending = todayFlat.filter((d: any) => d.status === "pending");
  const nextDose = [...pending].sort(
    (a: any, b: any) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  )[0] as any | undefined;
  const nextTime = nextDose
    ? new Date(nextDose.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
  const nextMedName = (nextDose?.medicationId as any)?.name ?? "";

  // Adherence: average of adherence7d across all medications from summary
  const summaryMeds: any[] = (summary as any)?.medications ?? [];
  const adherenceRate = summaryMeds.length
    ? Math.round(summaryMeds.reduce((a, m) => a + (m.adherence7d ?? 0), 0) / summaryMeds.length)
    : 0;

  const streak = calcStreak(doseLogs);
  const missedToday = todayFlat.filter((d: any) => d.status === "missed").length;
  const statsLoading = todayLoading || summaryLoading;

  return (
    <AppLayout title="Overview">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statsLoading ? (
        [0,1,2,3].map(i => <SkeletonStatCard key={i} />)
      ) : (
        <>
        <StatCard
          label="Adherence Score"
          value={`${adherenceRate}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-success/10"
          iconColor="text-success"
          pill={{ label: "This week", tone: "success" }}
          bar={adherenceRate}
        />
        <StatCard
          label="Current Streak"
          value={`${streak} Days`}
          icon={<Flame className="h-5 w-5" />}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          subline="Keep it going!"
        />
        <StatCard
          label="Next Dose"
          value={nextTime}
          icon={<Clock className="h-5 w-5" />}
          highlight
          pill={{ label: "Upcoming", tone: "success" }}
          subline={nextMedName || undefined}
        />
        <StatCard
          label="Missed Doses"
          value={missedToday}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          subline={missedToday ? <span className="text-destructive">Action needed</span> : "All on track"}
        />
        </>
      )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AIInsightCard />

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Active Medications</h2>
                <p className="text-sm text-slate-500">Your current prescriptions and supplements</p>
              </div>
              <Link to="/patient/medications" className="text-sm font-semibold text-primary hover:underline">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {medsLoading
                ? [0,1].map(i => <SkeletonCard key={i} />)
                : medications.slice(0, 2).map((m) => (
                    <MedicationCard key={(m as any)._id ?? m.id} med={m} />
                  ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard title="Today's Dose Tasks">
            <div className="space-y-3">
              {todayLoading ? (
                [0,1,2].map(i => <SkeletonRow key={i} />)
              ) : (
                todayFlat.slice(0, 5).map((dose: any, i: number) => (
                  <DoseCompletionCard 
                    key={dose._id ?? i} 
                    dose={dose}
                  />
                ))
              )}
              {todayFlat.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No doses scheduled for today.
                </p>
              )}
            </div>
            {todayFlat.length > 5 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link 
                  to="/patient/today" 
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View All Today's Doses →
                </Link>
              </div>
            )}
          </SectionCard>

          <RiskPredictionCard 
            prediction={riskData ?? null}
            patientName={user?.fullName || "Patient"}
            isLoading={isLoadingRisk}
            error={riskError}
          />

          <div className="card-base p-6">
            <h3 className="text-lg font-bold text-slate-900">Today's Timeline</h3>
            <div className="mt-5 space-y-5">
              {todayLoading ? (
                [0,1,2].map(i => <SkeletonRow key={i} />)
              ) : (<>
              {todayFlat.slice(0, 4).map((d: any, i: number) => {
                const isTaken = d.status === "taken" || d.status === "delayed";
                const medName = (d.medicationId as any)?.name ?? "Medication";
                const time = new Date(d.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={d._id ?? i} className="relative flex gap-3">
                    {i < Math.min(todayFlat.length, 4) - 1 && (
                      <span className="absolute left-3 top-7 h-full w-px bg-slate-200" />
                    )}
                    <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${isTaken ? "bg-success text-white" : "bg-slate-100 text-slate-400"} relative z-10`}>
                      {isTaken ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{time}</p>
                      <p className="text-sm text-slate-700">{medName} {isTaken ? "taken" : d.status}</p>
                      <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isTaken ? "bg-success/10 text-success" : d.status === "missed" ? "bg-destructive/10 text-destructive" : "bg-info/10 text-info"}`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {todayFlat.length === 0 && <p className="text-sm text-slate-500">No doses today.</p>}
              </>)}
            </div>
          </div>

          <div className="card-base p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Bell className="h-5 w-5 text-primary" /> Reminders
              </h3>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-page p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Push Notifications</p>
                    <p className="text-xs text-slate-500">Configure in settings</p>
                  </div>
                  <Link to="/patient/settings" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary-glow">
                    <Plus className="h-5 w-5" />
                  </Link>
                </div>
              </div>
              <Link to="/patient/settings" className="block w-full rounded-lg border-2 border-primary py-2.5 text-center text-sm font-semibold text-primary hover:bg-accent">
                Manage All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}