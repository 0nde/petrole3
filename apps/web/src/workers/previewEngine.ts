/**
 * Web Worker: lightweight client-side simulation preview engine.
 * Mirrors the backend rules A-I in simplified form so users get
 * instant feedback while building scenarios.
 *
 * Messages IN:  { type: "run", payload: PreviewInput }
 * Messages OUT: { type: "result", payload: PreviewResult }
 */

// ---- Types ----

interface PreviewCountry {
  code: string;
  production_mbpd: number;
  consumption_mbpd: number;
  refining_capacity_mbpd: number;
  strategic_reserves_mb: number;
  reserve_release_rate_mbpd: number;
  is_refining_hub: boolean;
  domestic_priority_ratio: number;
}

interface PreviewFlow {
  id: string;
  exporter_code: string;
  importer_code: string;
  volume_mbpd: number;
  route_id: string;
}

interface PreviewChokepoint {
  id: string;
  throughput_mbpd: number;
}

interface PreviewRoute {
  id: string;
  chokepoint_ids: string[];
}

interface PreviewAction {
  action_type: string;
  target_id: string;
  severity: number;
  params: Record<string, unknown>;
}

interface PreviewInput {
  countries: PreviewCountry[];
  flows: PreviewFlow[];
  chokepoints: PreviewChokepoint[];
  routes: PreviewRoute[];
  actions: PreviewAction[];
}

interface PreviewCountryImpact {
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
  stress_status: string;
  reserve_mobilized_mbpd: number;
}

interface PreviewResult {
  country_impacts: PreviewCountryImpact[];
  global_stress_score: number;
  global_supply_loss_pct: number;
  estimated_price_impact_pct: number;
  duration_ms: number;
}

// ---- Constants ----

const PRICE_ELASTICITY = 3.0;
const RESERVE_HORIZON_DAYS = 90;

// ---- Engine ----

function runPreview(input: PreviewInput): PreviewResult {
  const t0 = performance.now();

  const {
    countries,
    flows: originalFlows,
    chokepoints: _chokepoints,
    routes,
    actions,
  } = input;

  // Clone flows for mutation
  const flows = originalFlows.map((f) => ({ ...f, volume_after: f.volume_mbpd }));

  // Build lookup maps
  const routeMap = new Map(routes.map((r) => [r.id, r]));
  const countryMap = new Map(countries.map((c) => [c.code, { ...c }]));

  // Blocked chokepoints & routes
  const blockedCPs = new Set<string>();
  const blockedRoutes = new Set<string>();
  const embargoedExporters = new Set<string>();
  const productionChanges = new Map<string, number>();

  // Process actions
  for (const action of actions) {
    switch (action.action_type) {
      case "chokepoint_block":
        blockedCPs.add(action.target_id);
        break;
      case "route_block":
        blockedRoutes.add(action.target_id);
        break;
      case "embargo_total":
        embargoedExporters.add(action.target_id);
        break;
      case "embargo_targeted": {
        // Mark specific exporter-importer pairs
        embargoedExporters.add(action.target_id);
        break;
      }
      case "production_change":
        productionChanges.set(
          action.target_id,
          (productionChanges.get(action.target_id) ?? 0) + action.severity
        );
        break;
      default:
        break;
    }
  }

  // Rule A: Chokepoint blockade → affected routes → flow reduction
  for (const flow of flows) {
    const route = routeMap.get(flow.route_id);
    if (!route) continue;

    // Check if any chokepoint on this route is blocked
    for (const cpId of route.chokepoint_ids) {
      if (blockedCPs.has(cpId)) {
        flow.volume_after = 0;
        break;
      }
    }

    // Check if route itself is blocked
    if (blockedRoutes.has(flow.route_id)) {
      flow.volume_after = 0;
    }
  }

  // Rule B: Embargo
  for (const flow of flows) {
    if (embargoedExporters.has(flow.exporter_code)) {
      flow.volume_after = 0;
    }
  }

  // Rule C: Production changes
  for (const [code, delta] of productionChanges) {
    const c = countryMap.get(code);
    if (c) {
      c.production_mbpd = Math.max(0, c.production_mbpd * (1 + delta));
    }
  }

  // Aggregate per-country
  const importsBeforeMap = new Map<string, number>();
  const importsAfterMap = new Map<string, number>();
  const exportsBeforeMap = new Map<string, number>();
  const exportsAfterMap = new Map<string, number>();

  for (const flow of flows) {
    importsBeforeMap.set(
      flow.importer_code,
      (importsBeforeMap.get(flow.importer_code) ?? 0) + flow.volume_mbpd
    );
    importsAfterMap.set(
      flow.importer_code,
      (importsAfterMap.get(flow.importer_code) ?? 0) + flow.volume_after
    );
    exportsBeforeMap.set(
      flow.exporter_code,
      (exportsBeforeMap.get(flow.exporter_code) ?? 0) + flow.volume_mbpd
    );
    exportsAfterMap.set(
      flow.exporter_code,
      (exportsAfterMap.get(flow.exporter_code) ?? 0) + flow.volume_after
    );
  }

  // Build country impacts
  const impacts: PreviewCountryImpact[] = [];
  let totalLoss = 0;
  let totalBefore = 0;

  for (const c of countries) {
    const cur = countryMap.get(c.code)!;
    const prodBefore = c.production_mbpd;
    const prodAfter = cur.production_mbpd;
    const impBefore = importsBeforeMap.get(c.code) ?? 0;
    const impAfter = importsAfterMap.get(c.code) ?? 0;
    const expBefore = exportsBeforeMap.get(c.code) ?? 0;
    const expAfter = exportsAfterMap.get(c.code) ?? 0;

    // Rule D: Domestic priority
    const domesticPriority = c.domestic_priority_ratio;
    const domesticAvailable =
      prodAfter * domesticPriority + (impAfter - expAfter * (1 - domesticPriority));
    const availableClamped = Math.max(0, domesticAvailable);

    // Rule F: Reserves
    const shortfall = Math.max(0, c.consumption_mbpd - availableClamped);
    const maxRelease = c.reserve_release_rate_mbpd;
    const maxFromReserves = c.strategic_reserves_mb / RESERVE_HORIZON_DAYS;
    const reserveRelease = Math.min(shortfall, maxRelease, maxFromReserves);

    const finalAvailable = availableClamped + reserveRelease;

    // Rule G: Coverage
    const coverage =
      c.consumption_mbpd > 0
        ? Math.min(1, finalAvailable / c.consumption_mbpd)
        : 1;

    // Rule H: Stress score
    const stressScore = Math.round(Math.max(0, Math.min(100, (1 - coverage) * 100)));
    const stressStatus =
      stressScore <= 10
        ? "stable"
        : stressScore <= 30
        ? "tension"
        : stressScore <= 60
        ? "critical"
        : "emergency";

    // Track totals for global metrics
    totalBefore += impBefore + prodBefore;
    totalLoss += Math.max(0, (impBefore + prodBefore) - (impAfter + prodAfter));

    impacts.push({
      country_code: c.code,
      production_before: prodBefore,
      production_after: prodAfter,
      consumption: c.consumption_mbpd,
      imports_before: impBefore,
      imports_after: impAfter,
      exports_before: expBefore,
      exports_after: expAfter,
      domestic_available: finalAvailable,
      demand_coverage_ratio: coverage,
      stress_score: stressScore,
      stress_status: stressStatus,
      reserve_mobilized_mbpd: reserveRelease,
    });
  }

  // Global metrics
  const globalSupplyLossPct = totalBefore > 0 ? (totalLoss / totalBefore) * 100 : 0;
  const globalStress =
    impacts.length > 0
      ? impacts.reduce((sum, i) => sum + i.stress_score, 0) / impacts.length
      : 0;
  const priceImpact = globalSupplyLossPct * PRICE_ELASTICITY;

  const duration = performance.now() - t0;

  return {
    country_impacts: impacts,
    global_stress_score: Math.round(globalStress),
    global_supply_loss_pct: Math.round(globalSupplyLossPct * 10) / 10,
    estimated_price_impact_pct: Math.round(priceImpact),
    duration_ms: Math.round(duration * 100) / 100,
  };
}

// ---- Worker message handler ----

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;
  if (type === "run") {
    const result = runPreview(payload as PreviewInput);
    self.postMessage({ type: "result", payload: result });
  }
};
