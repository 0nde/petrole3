/** TanStack Query hooks for API data fetching. */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as api from "./client";
import { useAppStore } from "../store/appStore";

export function useCountries() {
  return useQuery({ queryKey: ["countries"], queryFn: api.fetchCountries });
}

export function useChokepoints() {
  return useQuery({ queryKey: ["chokepoints"], queryFn: api.fetchChokepoints });
}

export function useFlows() {
  return useQuery({ queryKey: ["flows"], queryFn: api.fetchFlows });
}

export function useScenarios() {
  return useQuery({ queryKey: ["scenarios"], queryFn: api.fetchScenarios });
}

export function useRunSimulation() {
  const store = useAppStore();

  return useMutation({
    mutationFn: (scenarioId: string) => api.runSimulation(scenarioId),
    onMutate: () => {
      store.setIsSimulating(true);
      store.clearResults();
    },
    onSuccess: async (run) => {
      store.setCurrentRun(run);
      store.setActivePanel("results");

      const [countries, flows, journal] = await Promise.all([
        api.fetchSimulationCountries(run.id),
        api.fetchSimulationFlows(run.id, 0),
        api.fetchSimulationJournal(run.id),
      ]);

      store.setCountryImpacts(countries);
      store.setFlowImpacts(flows);
      store.setJournalSteps(journal);
      store.setIsSimulating(false);
    },
    onError: () => {
      store.setIsSimulating(false);
    },
  });
}

export function useRunCombinedSimulation() {
  const store = useAppStore();

  return useMutation({
    mutationFn: (scenarioIds: string[]) => api.runCombinedSimulation(scenarioIds),
    onMutate: () => {
      store.setIsSimulating(true);
      store.clearResults();
    },
    onSuccess: async (run) => {
      store.setCurrentRun(run);
      store.setActivePanel("results");

      const [countries, flows, journal] = await Promise.all([
        api.fetchSimulationCountries(run.id),
        api.fetchSimulationFlows(run.id, 0),
        api.fetchSimulationJournal(run.id),
      ]);

      store.setCountryImpacts(countries);
      store.setFlowImpacts(flows);
      store.setJournalSteps(journal);
      store.setIsSimulating(false);
    },
    onError: () => {
      store.setIsSimulating(false);
    },
  });
}
