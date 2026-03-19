/** Global application state using Zustand. */

import { create } from "zustand";
import type {
  ActivePanel,
  CountryImpact,
  FlowImpact,
  Scenario,
  SimulationRun,
  SimulationStep,
  ViewMode,
} from "../types";

interface AppState {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Active panel
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;

  // Selected scenario
  selectedScenario: Scenario | null;
  setSelectedScenario: (scenario: Scenario | null) => void;

  // Selected country (on map click)
  selectedCountryCode: string | null;
  setSelectedCountryCode: (code: string | null) => void;

  // Selected chokepoint (on map click)
  selectedChokepointId: string | null;
  setSelectedChokepointId: (id: string | null) => void;

  // Simulation results
  currentRun: SimulationRun | null;
  setCurrentRun: (run: SimulationRun | null) => void;

  countryImpacts: CountryImpact[];
  setCountryImpacts: (impacts: CountryImpact[]) => void;

  flowImpacts: FlowImpact[];
  setFlowImpacts: (impacts: FlowImpact[]) => void;

  journalSteps: SimulationStep[];
  setJournalSteps: (steps: SimulationStep[]) => void;

  // Loading states
  isSimulating: boolean;
  setIsSimulating: (v: boolean) => void;

  // Reset
  clearResults: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: "simple",
  setViewMode: (mode) => set({ viewMode: mode }),

  activePanel: "scenarios",
  setActivePanel: (panel) => set({ activePanel: panel }),

  selectedScenario: null,
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),

  selectedCountryCode: null,
  setSelectedCountryCode: (code) => set({ selectedCountryCode: code, selectedChokepointId: null, activePanel: code ? "country" : null }),

  selectedChokepointId: null,
  setSelectedChokepointId: (id) => set({ selectedChokepointId: id, selectedCountryCode: null, activePanel: id ? "chokepoint" : null }),

  currentRun: null,
  setCurrentRun: (run) => set({ currentRun: run }),

  countryImpacts: [],
  setCountryImpacts: (impacts) => set({ countryImpacts: impacts }),

  flowImpacts: [],
  setFlowImpacts: (impacts) => set({ flowImpacts: impacts }),

  journalSteps: [],
  setJournalSteps: (steps) => set({ journalSteps: steps }),

  isSimulating: false,
  setIsSimulating: (v) => set({ isSimulating: v }),

  clearResults: () =>
    set({
      currentRun: null,
      countryImpacts: [],
      flowImpacts: [],
      journalSteps: [],
    }),
}));
