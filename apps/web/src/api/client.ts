/** API client for PetroSim backend. */

import type {
  Country,
  Chokepoint,
  Flow,
  Scenario,
  SimulationRun,
  CountryImpact,
  FlowImpact,
  SimulationStep,
  CountryBaselines,
  TradeFlowDetail,
  VerificationSummary,
} from "../types";

const BASE_URL = "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Reference Data ---

export const fetchCountries = () => request<Country[]>("/countries");
export const fetchChokepoints = () => request<Chokepoint[]>("/chokepoints");
export const fetchFlows = () => request<Flow[]>("/flows?limit=500");

// --- Scenarios ---

export const fetchScenarios = () => request<Scenario[]>("/scenarios");

// --- Simulations ---

export const runSimulation = (scenarioId: string) =>
  request<SimulationRun>("/simulations/run", {
    method: "POST",
    body: JSON.stringify({ scenario_id: scenarioId }),
  });

export const runCombinedSimulation = (scenarioIds: string[]) =>
  request<SimulationRun>("/simulations/run-combined", {
    method: "POST",
    body: JSON.stringify({ scenario_ids: scenarioIds }),
  });

export const fetchSimulationCountries = (id: string) =>
  request<CountryImpact[]>(`/simulations/${id}/countries?limit=200`);

export const fetchSimulationFlows = (id: string, minLoss = 0) =>
  request<FlowImpact[]>(`/simulations/${id}/flows?min_loss_pct=${minLoss}&limit=200`);

export const fetchSimulationJournal = (id: string) =>
  request<SimulationStep[]>(`/simulations/${id}/journal`);

// --- Enriched Data (petrole-datas backbone) ---

export const fetchCountryBaselines = (code: string) =>
  request<CountryBaselines>(`/data/baselines/${code}`);

export const fetchCountryTrade = (code: string) =>
  request<TradeFlowDetail[]>(`/data/trade/${code}`);

export const fetchVerificationSummary = () =>
  request<VerificationSummary>("/data/verification/summary");

