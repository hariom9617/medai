import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader, SectionCard } from "@/features/shared/ui";
import { CaregiverCreationForm } from "@/components/doctor/CaregiverCreationForm";

export default function CreateCaregiver() {
  const navigate = useNavigate();
  return (
    <AppLayout title="Create Caregiver">
      <PageHeader title="Register New Caregiver" subtitle="Add caregivers and assign them to patients" />
      <div className="max-w-3xl">
        <SectionCard title="Caregiver Information">
          <CaregiverCreationForm onCreated={() => navigate("/doctor/patients")} />
        </SectionCard>
      </div>
    </AppLayout>
  );
}