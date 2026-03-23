/** Shared TypeScript types matching the API contracts. */

export interface Region {
  id: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
  region_id: string;
  production_mbpd: number;
  consumption_mbpd: number;
  refining_capacity_mbpd: number;
  strategic_reserves_mb: number;
  reserve_release_rate_mbpd: number;
  is_refining_hub: boolean;
  domestic_priority_ratio: number;
  longitude: number;
  latitude: number;
}

export interface Chokepoint {
  id: string;
  name: string;
  throughput_mbpd: number;
  longitude: number;
  latitude: number;
}

export interface RouteChokepoint {
  chokepoint_id: string;
  order_index: number;
}

export interface Route {
  id: string;
  name: string;
  route_type: string;
  chokepoints: RouteChokepoint[];
}

export interface Flow {
  id: string;
  exporter_code: string;
  importer_code: string;
  product_id: string;
  volume_mbpd: number;
  route_id: string;
  confidence: string;
  source: string | null;
}

export interface Port {
  id: string;
  name: string;
  country_code: string;
  capacity_mbpd: number;
  port_type: string;
  longitude: number;
  latitude: number;
}

export type ActionType =
  | "chokepoint_block"
  | "route_block"
  | "embargo_total"
  | "embargo_targeted"
  | "production_change"
  | "demand_change"
  | "reserve_release"
  | "port_disruption";

export interface ScenarioAction {
  id?: string;
  action_type: ActionType;
  target_id: string;
  severity: number;
  params: Record<string, unknown>;
  order_index: number;
}

export interface Scenario {
  id: string;
  name: string;
  name_fr: string | null;
  category: string | null;
  description: string | null;
  description_fr: string | null;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
  actions: ScenarioAction[];
}

export interface CountryImpact {
  country_code: string;
  production_before: number;
  production_after: number;
  consumption: number;
  imports_before: number;
  imports_after: number;
  exports_before: number;
  exports_after: number;
  domestic_available: number;
  demand_coverage_ratio: number;
  stress_score: number;
  stress_status: StressStatus;
  reserve_mobilized_mbpd: number;
}

export interface FlowImpact {
  flow_id: string;
  volume_before: number;
  volume_after: number;
  loss_pct: number;
  loss_reasons: string[];
}

export interface SimulationStep {
  step_number: number;
  rule_id: string;
  description: string;
  affected_entities: Record<string, string[]>;
  detail: Record<string, unknown>;
}

export interface SimulationSummary {
  countries_stable: number;
  countries_tension: number;
  countries_critical: number;
  countries_emergency: number;
  top_affected: Array<{
    country_code: string;
    stress_score: number;
    stress_status: string;
    demand_coverage_ratio: number;
  }>;
  total_flow_loss_mbpd: number;
}

export interface SimulationRun {
  id: string;
  scenario_id: string;
  created_at: string;
  duration_ms: number | null;
  status: string;
  global_stress_score: number | null;
  global_supply_loss_pct: number | null;
  estimated_price_impact_pct: number | null;
  summary: SimulationSummary | null;
}

export type StressStatus = "stable" | "tension" | "critical" | "emergency";

export type ViewMode = "simple" | "expert";

export type ActivePanel = "scenarios" | "results" | "journal" | "country" | "chokepoint" | "news" | "crisis" | null;

// ---------------------------------------------------------------------------
// Enriched data types (petrole-datas backbone)
// ---------------------------------------------------------------------------

export type ConfidenceScore = "Very High" | "High" | "Medium" | "Low" | "Hypothesis";

export interface BaselineRecord {
  id: number;
  indicator: string;
  value: number;
  unit: string;
  reference_year: number;
  source_name: string;
  source_url: string | null;
  definition: string | null;
  confidence_score: ConfidenceScore;
  verification_method: string | null;
  verified_date: string | null;
}

export interface CountryBaselines {
  country_code: string;
  oil_core: BaselineRecord[];
  energy_structure: BaselineRecord[];
  electricity_mix: BaselineRecord[];
  climate: BaselineRecord[];
  all: BaselineRecord[];
}

export interface TradeFlowDetail {
  id: number;
  country_code: string;
  flow_type: string;
  partner_country: string;
  quantity: number;
  unit: string;
  percentage: number;
  reference_year: number;
  source_name: string;
  source_url: string | null;
  confidence_score: ConfidenceScore;
  verification_method: string | null;
}

export interface VerificationSummary {
  total_verifications: number;
  confirmed: number;
  mismatch: number;
  parse_failed: number;
  total_baselines: number;
  very_high_count: number;
  pct_verified: number;
}
