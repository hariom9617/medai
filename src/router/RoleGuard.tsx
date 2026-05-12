import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

const ROLE_HOME: Record<Role, string> = {
  patient: "/patient/dashboard",
  caregiver: "/caregiver/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/metrics",
};

export function RoleGuard({ allow, children }: { allow: Role[]; children: JSX.Element }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  return children;
}

export function HomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role]} replace />;
}
