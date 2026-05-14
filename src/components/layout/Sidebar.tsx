import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Pill, Calendar, BarChart3, Bell, LogOut, FileText, Activity, Settings, Stethoscope, Heart, UserPlus, HeartHandshake } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

const NAV_BY_ROLE: Record<Role, { to: string; label: string; icon: React.ComponentType<any> }[]> = {
  patient: [
    { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patient/medications", label: "Medications", icon: Pill },
    { to: "/patient/today", label: "Timeline", icon: Calendar },
    { to: "/patient/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/patient/settings", label: "Alerts", icon: Bell },
  ],
  caregiver: [
    { to: "/caregiver/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/caregiver/patients", label: "Patients", icon: Heart },
    // { to: "/caregiver/alerts", label: "Alerts", icon: Bell },
    { to: "/caregiver/notifications", label: "Notifications", icon: Activity },
  ],
  doctor: [
    { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctor/patients", label: "Patients", icon: Stethoscope },
    { to: "/doctor/patients/create", label: "Add Patient", icon: UserPlus },
    { to: "/doctor/caregivers/create", label: "Add Caregiver", icon: HeartHandshake },
    { to: "/doctor/medications", label: "Medication Catalog", icon: Pill },
    { to: "/doctor/alerts", label: "Alerts", icon: Bell },
    { to: "/doctor/reports", label: "Reports", icon: FileText },
  ],
  admin: [
    { to: "/admin/metrics", label: "Metrics", icon: Activity },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user || !user.role) return null;
  const items = NAV_BY_ROLE[user.role] ?? [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 shrink-0 border-r border-slate-100 bg-white flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-5">
          <Logo />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l-full bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        {null}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>
    </>
  );
}
