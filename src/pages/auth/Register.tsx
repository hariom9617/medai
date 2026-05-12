import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Clock, Lock, RotateCcw, Heart, Stethoscope, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/layout/Logo";
import { Role } from "@/types";
import { useAuth } from "@/context/AuthContext";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
    timezone: z.string().min(1),
    role: z.enum(["patient", "caregiver", "doctor"]),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[0-9]/, "Add at least one number")
      .regex(/[^a-zA-Z0-9]/, "Add at least one symbol"),
    confirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type FormData = z.infer<typeof schema>;

type RegRole = Exclude<Role, "admin">;
const ROLE_INFO: Record<RegRole, { icon: any; label: string; desc: string }> = {
  patient: {
    icon: User,
    label: "Patient",
    desc: "Track your medication adherence, get AI-powered insights, and sync your health data securely.",
  },
  caregiver: {
    icon: Heart,
    label: "Caregiver",
    desc: "Monitor a loved one's adherence, receive alerts, and stay connected with their care team.",
  },
  doctor: {
    icon: Stethoscope,
    label: "Doctor",
    desc: "Review patient adherence, receive critical alerts, and download clinical reports.",
  },
};

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [role, setRole] = useState<RegRole>("patient");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "patient", timezone: "Pacific Time (PT)" },
  });

  const pwd = watch("password") ?? "";
  const strength = pwdStrength(pwd);

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        timezone: data.timezone,
      });
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-page">
      <div className="relative hidden w-1/3 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-glow p-10 text-primary-foreground lg:flex">
        <div>
          <h1 className="text-4xl font-bold">MedAI</h1>
          <p className="mt-2 max-w-sm text-base text-white/85">
            Empathetic precision for your health journey. Join thousands managing their wellness with clarity.
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
          <p className="text-sm italic">
            "MedAI transformed how I manage my daily prescriptions. It's more than an app; it's peace of mind."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/30 font-semibold">SC</div>
            <div>
              <p className="text-sm font-semibold">Dr. Sarah Chen</p>
              <p className="text-xs text-white/70">Senior Medical Advisor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-2/3">
        <div className="w-full max-w-2xl">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <div className="card-base p-8 md:p-10">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-1 text-sm text-slate-500">Start your journey to better health management.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <Field label="Full Name" error={errors.fullName?.message}>
                <IconInput icon={User} placeholder="John Doe" {...register("fullName")} />
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified legal name required for prescriptions
                </p>
              </Field>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Email Address" error={errors.email?.message}>
                  <IconInput icon={Mail} type="email" placeholder="john@example.com" {...register("email")} />
                </Field>
                <Field label="Phone Number" error={errors.phone?.message}>
                  <IconInput icon={Phone} placeholder="+1 (555) 000-0000" {...register("phone")} />
                </Field>
              </div>

              <Field label="Timezone">
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    {...register("timezone")}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Pacific Time (PT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Central Time (CT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </Field>

              <div>
                <p className="text-sm font-medium text-slate-700">I am joining as a:</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {(["patient", "caregiver", "doctor"] as RegRole[]).map((r) => {
                    const Icon = ROLE_INFO[r].icon;
                    const active = role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setValue("role", r);
                        }}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-sm transition ${
                          active
                            ? "border-primary bg-accent text-primary"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="font-medium">{ROLE_INFO[r].label}</span>
                        {active && (
                          <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  <span className="font-semibold text-primary">{ROLE_INFO[role].label}:</span>{" "}
                  {ROLE_INFO[role].desc}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Password" error={errors.password?.message}>
                  <IconInput icon={Lock} type="password" placeholder="••••••••" {...register("password")} />
                  <StrengthBar strength={strength} />
                </Field>
                <Field label="Confirm Password" error={errors.confirm?.message}>
                  <IconInput icon={RotateCcw} type="password" placeholder="••••••••" {...register("confirm")} />
                </Field>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" {...register("terms")} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>
                  I agree to the <a className="font-semibold text-primary">Terms of Service</a> and{" "}
                  <a className="font-semibold text-primary">Privacy Policy</a>, including HIPAA-compliant data handling.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms.message as string}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-glow disabled:opacity-60"
              >
                Complete Registration <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function pwdStrength(p: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s as any;
}

function StrengthBar({ strength }: { strength: number }) {
  const colors = ["bg-slate-200", "bg-destructive", "bg-warning", "bg-warning", "bg-success"];
  const labels = ["", "Weak password. Add symbols and numbers.", "Fair password.", "Good password.", "Strong password."];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? colors[strength] : "bg-slate-200"}`} />
        ))}
      </div>
      {strength > 0 && (
        <p className={`mt-1 text-xs ${strength <= 1 ? "text-destructive" : "text-slate-500"}`}>{labels[strength]}</p>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const IconInput = ({ icon: Icon, ...rest }: any) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      {...rest}
      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  </div>
);
