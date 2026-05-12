import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, SectionCard } from "@/features/shared/ui";
import { PatientCreationForm } from "@/components/doctor/PatientCreationForm";

export default function CreatePatient() {
  const navigate = useNavigate();
  return (
    <AppLayout title="Create Patient">
      <PageHeader title="Register New Patient" subtitle="Create a patient account and start their treatment plan" />
      <div className="max-w-3xl">
        <SectionCard title="Patient Information">
          <PatientCreationForm onCreated={(p) => p?.id && navigate(`/doctor/patients/${p.id}`)} />
        </SectionCard>
      </div>
    </AppLayout>
  );
}