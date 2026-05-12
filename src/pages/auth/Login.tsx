import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Bell, BarChart3, Users, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/layout/Logo";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(4, "Password is required"),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const FEATURES = [
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Personalized nudges that adapt to your daily routine and sleep cycles.",
  },
  {
    icon: BarChart3,
    title: "Adherence Tracking",
    desc: "Visual progress insights to help you maintain consistent health habits.",
  },
  {
    icon: Users,
    title: "Caregiver Monitoring",
    desc: "Peace of mind for family members through secure adherence sharing.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${(user.fullName || user.email).split(" ")[0]}`);

      const redirectMap: Record<string, string> = {
        patient: '/patient/dashboard',
        caregiver: '/caregiver/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/metrics',
      };
      navigate(redirectMap[user.role] || '/', { replace: true });
    } catch (e: any) {
      toast.error(e.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-page">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary to-primary-glow p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Logo className="text-white [&>span:last-child]:text-white" />
        <div className="absolute inset-0 grid place-items-center opacity-10">
          <div className="h-[480px] w-[420px] rounded-3xl border-[6px] border-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight">MedAI</h1>
          <p className="mt-2 text-lg text-white/85">Your partner in medication health</p>
          <div className="mt-12 space-y-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm text-white/80 max-w-md">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div />
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="card-base p-8 md:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your care portal</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  Remember me
                </label>
                <button type="button" className="text-sm font-semibold text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-glow disabled:opacity-60"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[10px] text-white">G</span>
                Sign in with Google
              </button>

              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Join MedAI
                </Link>
              </p>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> HIPAA Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> AES-256 Encryption
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
