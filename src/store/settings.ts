import { create } from "zustand";

interface SettingsState {
  leadTime: number;
  push: boolean;
  sms: boolean;
  email: boolean;
  quietStart: string;
  quietEnd: string;
  setFromPrefs: (p?: { push?: boolean; sms?: boolean; email?: boolean; reminderLeadMinutes?: number }) => void;
  update: (patch: Partial<Omit<SettingsState, "update" | "setFromPrefs">>) => void;
}

export const useSettings = create<SettingsState>()((set) => ({
  leadTime: 15,
  push: true,
  sms: false,
  email: true,
  quietStart: "22:00",
  quietEnd: "07:00",
  setFromPrefs: (p) =>
    set((s) => ({
      ...s,
      push: p?.push ?? s.push,
      sms: p?.sms ?? s.sms,
      email: p?.email ?? s.email,
      leadTime: p?.reminderLeadMinutes ?? s.leadTime,
    })),
  update: (patch) => set((state) => ({ ...state, ...patch })),
}));
