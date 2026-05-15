import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientDashboard from "./pages/patient/Dashboard";
import Medications from "./pages/patient/Medications";
import MedicationDetail from "./pages/patient/MedicationDetail";
import Today from "./pages/patient/Today";
import Analytics from "./pages/patient/Analytics";
import Settings from "./pages/patient/Settings";
import CaregiverDashboard from "./pages/caregiver/CaregiverDashboard";
import CaregiverPatients from "./pages/caregiver/Patients";
import CaregiverPatientDetail from "./pages/caregiver/CaregiverPatientDetail";
import CaregiverAlerts from "./pages/caregiver/CaregiverAlerts";
import CaregiverNotifications from "./pages/caregiver/CaregiverNotifications";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorPatientDetail from "./pages/doctor/PatientDetail";
import DoctorMedications from "./pages/doctor/Medications";
import DoctorSOSMedications from "./pages/doctor/SOSMedications";
import DoctorSOSMedicationDetail from "./pages/doctor/SOSMedicationDetail";
import DoctorCreatePatient from "./pages/doctor/CreatePatient";
import DoctorCreateCaregiver from "./pages/doctor/CreateCaregiver";
import DoctorAlerts from "./pages/doctor/Alerts";
import DoctorReports from "./pages/doctor/Reports";
import AdminMetrics from "./pages/admin/Metrics";
import { RoleGuard } from "./router/RoleGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/patient/dashboard" element={<RoleGuard allow={["patient"]}><PatientDashboard /></RoleGuard>} />
      <Route path="/patient/medications" element={<RoleGuard allow={["patient"]}><Medications /></RoleGuard>} />
      <Route path="/patient/medications/:id" element={<RoleGuard allow={["patient"]}><MedicationDetail /></RoleGuard>} />
      <Route path="/patient/today" element={<RoleGuard allow={["patient"]}><Today /></RoleGuard>} />
      <Route path="/patient/analytics" element={<RoleGuard allow={["patient"]}><Analytics /></RoleGuard>} />
      <Route path="/patient/settings" element={<RoleGuard allow={["patient"]}><Settings /></RoleGuard>} />

      <Route path="/caregiver/dashboard" element={<RoleGuard allow={["caregiver"]}><CaregiverDashboard /></RoleGuard>} />
      <Route path="/caregiver/patients" element={<RoleGuard allow={["caregiver"]}><CaregiverPatients /></RoleGuard>} />
      <Route path="/caregiver/patients/:id" element={<RoleGuard allow={["caregiver"]}><CaregiverPatientDetail /></RoleGuard>} />
      <Route path="/caregiver/alerts" element={<RoleGuard allow={["caregiver"]}><CaregiverAlerts /></RoleGuard>} />
      <Route path="/caregiver/notifications" element={<RoleGuard allow={["caregiver"]}><CaregiverNotifications /></RoleGuard>} />

      <Route path="/doctor/dashboard" element={<RoleGuard allow={["doctor"]}><DoctorDashboard /></RoleGuard>} />
      <Route path="/doctor/patients" element={<RoleGuard allow={["doctor"]}><DoctorPatients /></RoleGuard>} />
      <Route path="/doctor/patients/create" element={<RoleGuard allow={["doctor"]}><DoctorCreatePatient /></RoleGuard>} />
      <Route path="/doctor/caregivers/create" element={<RoleGuard allow={["doctor"]}><DoctorCreateCaregiver /></RoleGuard>} />
      <Route path="/doctor/patients/:id" element={<RoleGuard allow={["doctor"]}><DoctorPatientDetail /></RoleGuard>} />
      <Route path="/doctor/medications" element={<RoleGuard allow={["doctor"]}><DoctorMedications /></RoleGuard>} />
      <Route path="/doctor/sos-medications" element={<RoleGuard allow={["doctor"]}><DoctorSOSMedications /></RoleGuard>} />
      <Route path="/doctor/sos-medications/:id" element={<RoleGuard allow={["doctor"]}><DoctorSOSMedicationDetail /></RoleGuard>} />
      <Route path="/doctor/alerts" element={<RoleGuard allow={["doctor"]}><DoctorAlerts /></RoleGuard>} />
      <Route path="/doctor/reports" element={<RoleGuard allow={["doctor"]}><DoctorReports /></RoleGuard>} />
      <Route path="/doctor/report" element={<Navigate to="/doctor/reports" replace />} />

      <Route path="/admin/metrics" element={<RoleGuard allow={["admin"]}><AdminMetrics /></RoleGuard>} />
      <Route path="/admin/settings" element={<Navigate to="/admin/metrics" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
