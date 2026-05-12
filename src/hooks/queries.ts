import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdherenceApi } from "@/api/adherence";
import { AdminApi } from "@/api/admin";
import { AiApi } from "@/api/ai";
import { AlertsApi, type AlertListParams } from "@/api/alerts";
import { CaregiverApi } from "@/api/caregiver";
import {
  DoctorApi,
  type DoctorCreatePatientInput,
  type DoctorCreateCaregiverInput,
  type MedicationCatalogCreateInput,
  type MedicationCatalogUpdateInput,
  type PatientMedicationAssignmentCreateInput,
  type PatientMedicationAssignmentUpdateInput,
} from "@/api/doctor";
import { DosesApi } from "@/api/doses";
import { MedicationsApi, type MedicationCreateInput } from "@/api/medications";
import { ReportsApi } from "@/api/reports";
import type { AlertStatus } from "@/types";

export const qk = {
  me: ["me"] as const,
  meds: ["medications"] as const,
  med: (id: string) => ["medications", id] as const,
  today: ["medications", "today"] as const,
  doses: (params?: any) => ["dose-logs", params] as const,
  alerts: (params?: any) => ["alerts", params] as const,
  adherenceSummary: (period: string) =>
    ["adherence", "summary", period] as const,
  adherenceHistory: (params?: any) => ["adherence", "history", params] as const,
  patients: ["caregiver", "patients"] as const,
  patient: (id: string) => ["caregiver", "patients", id] as const,
  notes: (id: string) => ["caregiver", "patients", id, "notes"] as const,
  metrics: ["admin", "metrics"] as const,
  risk: (id: string) => ["ai", "risk", id] as const,
  insights: (id: string) => ["ai", "insights", id] as const,
  report: (id: string, p?: any) => ["reports", "patient", id, p] as const,
  doctorPatients: ["doctor", "patients"] as const,
  doctorPatient: (id: string) => ["doctor", "patients", id] as const,
  doctorPatientMeds: (id: string) =>
    ["doctor", "patients", id, "medications"] as const,
  doctorPatientDoses: (id: string, params?: any) =>
    ["doctor", "patients", id, "doses", params] as const,
  doctorAlerts: (params?: any) => ["doctor", "alerts", params] as const,
  doctorPatientAdherence: (id: string, params?: any) =>
    ["doctor", "patients", id, "adherence", params] as const,
  doctorInterventions: (id: string) =>
    ["doctor", "patients", id, "interventions"] as const,
  // Medication Catalog
  doctorMedicationCatalog: ["doctor", "medication-catalog"] as const,
  // Patient Medication Assignments
  doctorPatientMedicationAssignments: (patientId: string) =>
    ["doctor", "patients", patientId, "medication-assignments"] as const,
};

// ---------- Medications ----------
export const useMedications = (patientId?: string) =>
  useQuery({
    queryKey: [...qk.meds, patientId],
    queryFn: async () => {
      const res = await MedicationsApi.list(patientId);
      return (res as any)?.medications ?? res ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useMedication = (id: string | undefined) =>
  useQuery({
    queryKey: qk.med(id ?? ""),
    queryFn: async () => {
      const res = await MedicationsApi.byId(id!);
      return (res as any)?.medication ?? res;
    },
    enabled: !!id,
  });

export const useTodayDoses = (patientId?: string) =>
  useQuery({
    queryKey: [...qk.today, patientId],
    queryFn: async () => {
      const res = await MedicationsApi.today(patientId);
      const d = res as any;
      // Backend returns { doses: [...] } flat array
      const arr = Array.isArray(d)
        ? d
        : Array.isArray(d?.doses)
          ? d.doses
          : Array.isArray(d?.data?.doses)
            ? d.data.doses
            : Array.isArray(d?.data)
              ? d.data
              : [];
      return arr;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MedicationCreateInput) => MedicationsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.meds });
      qc.invalidateQueries({ queryKey: qk.today });
    },
  });
}

export function useDeleteMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MedicationsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.meds });
      qc.invalidateQueries({ queryKey: qk.today });
    },
  });
}

// ---------- Doses ----------
export const useDoseLogs = (params?: Parameters<typeof DosesApi.list>[0]) =>
  useQuery({
    queryKey: qk.doses(params),
    queryFn: async () => {
      const res = await DosesApi.list(params);
      const d = (res as any)?.data ?? res;
      return d?.doseLogs ?? d?.logs ?? (Array.isArray(d) ? d : []);
    },
  });

export function useTakeDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      DosesApi.take(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dose-logs"] });
      qc.invalidateQueries({ queryKey: qk.today });
      qc.invalidateQueries({ queryKey: ["adherence"] });
    },
  });
}

export function useSkipDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      DosesApi.skip(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dose-logs"] });
      qc.invalidateQueries({ queryKey: qk.today });
    },
  });
}

export function useAssistDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      DosesApi.assist(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dose-logs"] });
      qc.invalidateQueries({ queryKey: qk.today });
      qc.invalidateQueries({ queryKey: ["adherence"] });
    },
  });
}

export function useConfirmDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      DosesApi.confirm(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dose-logs"] });
      qc.invalidateQueries({ queryKey: ["adherence"] });
    },
  });
}

// ---------- Adherence ----------
export const useAdherenceSummary = (
  period: "week" | "month" | "quarter" | "year" = "month",
) =>
  useQuery({
    queryKey: qk.adherenceSummary(period),
    queryFn: async () => {
      const res = await AdherenceApi.summary(period);
      const d = (res as any)?.data ?? res;

      // Backend returns [] array — wrap into expected { medications[] } shape
      if (Array.isArray(d)) {
        return { medications: d };
      }
      return d;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useAdherenceHistory = (
  params?: Parameters<typeof AdherenceApi.history>[0],
) =>
  useQuery({
    queryKey: qk.adherenceHistory(params),
    queryFn: () => AdherenceApi.history(params),
    staleTime: 5 * 60 * 1000,
  });

// ---------- Alerts ----------
export const useAlerts = (params?: AlertListParams) =>
  useQuery({
    queryKey: qk.alerts(params),
    queryFn: async () => {
      const res = await AlertsApi.list(params);
      const d = (res as any)?.data ?? res;
      return d?.alerts ?? (Array.isArray(d) ? d : []);
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AlertsApi.acknowledge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AlertsApi.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: { patientId?: string }) =>
      AlertsApi.markAllAsRead(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

// ---------- Caregiver ----------
export const usePatients = () =>
  useQuery({
    queryKey: qk.patients,
    queryFn: async () => {
      const res = await CaregiverApi.patients();
      const d = (res as any)?.data ?? res;
      const arr = d?.patients ?? (Array.isArray(d) ? d : []);
      return arr.map((item: any) => ({
        id: item.patient?.id ?? item.patient?._id,
        fullName: item.patient?.fullName ?? "Unknown",
        email: item.patient?.email ?? "",
        phone: item.patient?.phone ?? "",
        adherenceRate: item.todayAdherence ?? 0,
        relationship: item.link,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

export const usePatientSummary = (id: string | undefined) =>
  useQuery({
    queryKey: qk.patient(id ?? ""),
    queryFn: async () => {
      const res = await CaregiverApi.patientSummary(id!);
      const d = (res as any)?.data ?? res;
      return d;
    },
    enabled: !!id,
  });

export const usePatientNotes = (id: string | undefined) =>
  useQuery({
    queryKey: qk.notes(id ?? ""),
    queryFn: () => CaregiverApi.notes(id!),
    enabled: !!id,
  });

export function useAddPatientNote(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => CaregiverApi.addNote(patientId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notes(patientId) }),
  });
}

// ---------- Admin ----------
export const useAdminMetrics = () =>
  useQuery({
    queryKey: qk.metrics,
    queryFn: AdminApi.metrics,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

// ---------- AI ----------
export const useRisk = (patientId: string | undefined) =>
  useQuery({
    queryKey: qk.risk(patientId ?? ""),
    queryFn: async () => {
      const res = await AiApi.risk(patientId!);
      const d = (res as any)?.data ?? res;

      return {
        patientId: patientId!,
        overallRisk: Math.round((d?.riskScore ?? 0) * 100),
        riskLevel: d?.riskLevel ?? "low",
        factors: Array.isArray(d?.topFactors)
          ? d.topFactors.map((f: any) => ({
              factor: f.factor ?? f.name ?? "Unknown",
              weight: f.weight ?? 1,
              score: f.score ?? 0,
              description: f.description ?? "",
            }))
          : [],
        recommendations: d?.insightText ? [d.insightText] : [],
        calculatedAt: new Date().toISOString(),
      };
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });

export const useInsights = (patientId: string | undefined) =>
  useQuery({
    queryKey: qk.insights(patientId ?? ""),
    queryFn: async () => {
      const res = await AiApi.insights(patientId!);
      const d = (res as any)?.data ?? res;

      // Backend returns { insight: string } — normalize to AIInsightsResponse shape
      if (typeof d?.insight === "string") {
        return {
          patientId: patientId!,
          insights: [
            {
              type: "adherence",
              title: "AI Care Insight",
              description: d.insight,
              confidence: 1,
              recommendation: "",
            },
          ],
          predictions: [],
          generatedAt: new Date().toISOString(),
        };
      }
      return d;
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });

// ---------- Reports ----------
export const usePatientReport = (
  id: string | undefined,
  params?: Parameters<typeof ReportsApi.patient>[1],
) =>
  useQuery({
    queryKey: qk.report(id ?? "", params),
    queryFn: () => ReportsApi.patient(id!, params),
    enabled: !!id,
  });

// ---------- Doctor ----------
export const useDoctorPatients = () =>
  useQuery({
    queryKey: qk.doctorPatients,
    queryFn: async () => {
      const raw = await DoctorApi.patients();
      // Backend returns patient objects with enrichment fields
      return (raw as any[]).map((item) => ({
        id: item.id ?? item.patient?.id ?? item.patientId ?? "unknown",
        fullName: item.fullName ?? item.patient?.fullName ?? "Unknown",
        email: item.email ?? item.patient?.email ?? "",
        age: item.age ?? item.patient?.age ?? 0,
        phone: item.phone ?? item.patient?.phone ?? "",
        adherenceRate: item.adherenceScore ?? item.adherenceRate ?? 0,
        activeMedications: item.activeMedications ?? 0,
        riskLevel: (item.latestRiskLevel ?? item.riskLevel ?? "low") as
          | "high"
          | "medium"
          | "low",
        pendingAlerts: item.pendingAlerts ?? 0,
        lastActive:
          item.lastActive ??
          item.patient?.lastActive ??
          new Date().toISOString(),
        conditions: item.conditions ?? item.patient?.conditions ?? [],
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

export const useDoctorPatient = (id: string | undefined) =>
  useQuery({
    queryKey: qk.doctorPatient(id ?? ""),
    queryFn: () => DoctorApi.patientDetail(id!),
    enabled: !!id,
  });

export const useDoctorPatientMedications = (patientId: string | undefined) =>
  useQuery({
    queryKey: qk.doctorPatientMeds(patientId ?? ""),
    queryFn: () => DoctorApi.patientMedications(patientId!),
    enabled: !!patientId,
  });

export const useDoctorPatientDoseLogs = (
  patientId: string | undefined,
  params?: Parameters<typeof DoctorApi.patientDoseLogs>[1],
) =>
  useQuery({
    queryKey: qk.doctorPatientDoses(patientId ?? "", params),
    queryFn: () => DoctorApi.patientDoseLogs(patientId!, params),
    enabled: !!patientId,
  });

export const useDoctorAlerts = (
  params?: Parameters<typeof DoctorApi.alerts>[0],
) =>
  useQuery({
    queryKey: qk.doctorAlerts(params),
    queryFn: () => DoctorApi.alerts(params),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

export const useDoctorPatientAdherence = (
  patientId: string | undefined,
  params?: Parameters<typeof DoctorApi.adherenceHistory>[1],
) =>
  useQuery({
    queryKey: qk.doctorPatientAdherence(patientId ?? "", params),
    queryFn: () => DoctorApi.adherenceHistory(patientId!, params),
    enabled: !!patientId,
  });

export const useDoctorInterventions = (patientId: string | undefined) =>
  useQuery({
    queryKey: qk.doctorInterventions(patientId ?? ""),
    queryFn: () => DoctorApi.interventions(patientId!),
    enabled: !!patientId,
  });

export function useCreateIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: { type: string; detail: string; notes?: string };
    }) => DoctorApi.createIntervention(patientId, data),
    onSuccess: (_, { patientId }) => {
      qc.invalidateQueries({ queryKey: ["doctor", "interventions"] });
      qc.invalidateQueries({ queryKey: qk.doctorInterventions(patientId) });
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      DoctorApi.resolveAlert(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "alerts"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useEscalateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      DoctorApi.escalateAlert(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "alerts"] });
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

// ---------- Doctor: patient/caregiver management ----------
export const useCaregivers = () =>
  useQuery({
    queryKey: ["doctor", "caregivers"],
    queryFn: DoctorApi.caregivers,
    staleTime: 5 * 60 * 1000,
  });

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorCreatePatientInput) =>
      DoctorApi.createPatient(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.doctorPatients }),
  });
}

export function useCreateCaregiver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorCreateCaregiverInput) =>
      DoctorApi.createCaregiver(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["doctor", "caregivers"] }),
  });
}

export function useAssignCaregiver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      caregiverId,
    }: {
      patientId: string;
      caregiverId: string;
    }) => DoctorApi.assignCaregiver(patientId, caregiverId),
    onSuccess: (_, { patientId }) => {
      qc.invalidateQueries({ queryKey: ["doctor", "caregivers"] });
      qc.invalidateQueries({ queryKey: qk.doctorPatient(patientId) });
    },
  });
}

export function useDoctorCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      input,
    }: {
      patientId: string;
      input: MedicationCreateInput;
    }) => DoctorApi.createMedicationForPatient(patientId, input),
    onSuccess: (_, { patientId }) => {
      qc.invalidateQueries({ queryKey: qk.doctorPatientMeds(patientId) });
    },
  });
}

export function useDoctorUpdateMedication(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<MedicationCreateInput>;
    }) => DoctorApi.updateMedication(id, patch),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.doctorPatientMeds(patientId) }),
  });
}

export function useDoctorDeleteMedication(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DoctorApi.deleteMedication(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.doctorPatientMeds(patientId) }),
  });
}

// ---------- Doctor Medication Catalog ----------
export const useDoctorMedications = () =>
  useQuery({
    queryKey: qk.doctorMedicationCatalog,
    queryFn: DoctorApi.medicationCatalog,
    staleTime: 5 * 60 * 1000,
  });

export function useDoctorCreateMedicationCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MedicationCatalogCreateInput) =>
      DoctorApi.createMedicationCatalog(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.doctorMedicationCatalog });
    },
  });
}

export function useDoctorUpdateMedicationCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: MedicationCatalogUpdateInput;
    }) => DoctorApi.updateMedicationCatalog(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.doctorMedicationCatalog });
    },
  });
}

export function useDoctorDeleteMedicationCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DoctorApi.deleteMedicationCatalog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.doctorMedicationCatalog });
    },
  });
}

// ---------- Patient Medication Assignments ----------
export const usePatientAssignedMedications = (patientId: string | undefined) =>
  useQuery({
    queryKey: qk.doctorPatientMedicationAssignments(patientId ?? ""),
    queryFn: async () => {
      const res = await DoctorApi.patientMedicationAssignments(patientId!);
      // Unwrap: { success, data: { medications: [...] } }
      const d = res as any;
      return (
        d?.medications ?? // if DoctorApi already unwraps .data
        d?.data?.medications ?? // if DoctorApi returns raw axios .data
        (Array.isArray(d) ? d : [])
      );
    },
    enabled: !!patientId,
  });

export function useAssignMedicationToPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      input,
    }: {
      patientId: string;
      input: PatientMedicationAssignmentCreateInput;
    }) => DoctorApi.assignMedicationToPatient(patientId, input),
    onSuccess: (_, { patientId }) => {
      qc.invalidateQueries({
        queryKey: qk.doctorPatientMedicationAssignments(patientId),
      });
    },
  });
}

export function useUpdatePatientMedicationAssignment(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: PatientMedicationAssignmentUpdateInput;
    }) => DoctorApi.updatePatientMedicationAssignment(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.doctorPatientMedicationAssignments(patientId),
      });
    },
  });
}

export function useDeletePatientMedicationAssignment(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DoctorApi.deletePatientMedicationAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.doctorPatientMedicationAssignments(patientId),
      });
    },
  });
}
