import { create } from "zustand";

export type OnboardingChild = {
  name: string;
  birthDate: string;
  schoolName: string;
  grade: string;
  allergyIds: string[];
  avoidedFoods: string[];
  specialNotes?: string | null;
};

export type OnboardingAddress = {
  label: "school" | "home" | "office";
  schoolName: string;
  address: string;
  timeSlot: "morning" | "evening";
};

type OnboardingState = {
  child: OnboardingChild | null;
  address: OnboardingAddress | null;
  setChild: (child: OnboardingChild) => void;
  setAddress: (address: OnboardingAddress) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  child: null,
  address: null,
  setChild: (child) => set({ child }),
  setAddress: (address) => set({ address }),
  reset: () => set({ child: null, address: null }),
}));

