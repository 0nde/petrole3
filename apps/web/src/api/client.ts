/** API client for PetroSim backend. */

import type {
  Country,
  Region,
  Chokepoint,
  Route,
  Flow,
  Port,
  Scenario,
  SimulationRun,
  CountryImpact,
  FlowImpact,
  SimulationStep,
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

export const fetchRegions = () => request<Region[]>("/regions");
export const fetchCountries = () => request<Country[]>("/countries");
export const fetchChokepoints = () => request<Chokepoint[]>("/chokepoints");
export const fetchRoutes = () => request<Route[]>("/routes");
export const fetchFlows = () => request<Flow[]>("/flows?limit=500");
export const fetchPorts = () => request<Port[]>("/ports");

// --- Scenarios ---

export const fetchScenarios = () => request<Scenario[]>("/scenarios");
export const fetchScenario = (id: string) => request<Scenario>(`/scenarios/${id}`);

export const createScenario = (data: {
  name: string;
  description?: string;
  actions: Array<{
    action_type: string;
    target_id: string;
    severity: number;
    params: Record<string, unknown>;
    order_index: number;
  }>;
}) =>
  request<Scenario>("/scenarios", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteScenario = (id: string) =>
  request<void>(`/scenarios/${id}`, { method: "DELETE" });

// --- Simulations ---

export const runSimulation = (scenarioId: string) =>
  request<SimulationRun>("/simulations/run", {
    method: "POST",
    body: JSON.stringify({ scenario_id: scenarioId }),
  });

export const fetchSimulation = (id: string) =>
  request<SimulationRun>(`/simulations/${id}`);

export const fetchSimulationCountries = (id: string) =>
  request<CountryImpact[]>(`/simulations/${id}/countries?limit=200`);

export const fetchSimulationFlows = (id: string, minLoss = 0) =>
  request<FlowImpact[]>(`/simulations/${id}/flows?min_loss_pct=${minLoss}&limit=200`);

export const fetchSimulationJournal = (id: string) =>
  request<SimulationStep[]>(`/simulations/${id}/journal`);

export const fetchSimulationNarrative = (id: string) =>
  request<{ narrative: string }>(`/simulations/${id}/narrative`);
