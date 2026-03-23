import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppStore } from "../../store/appStore";
import { useCountries, useChokepoints } from "../../api/hooks";
import type { CountryImpact, StressStatus } from "../../types";

const STRESS_COLORS: Record<StressStatus, string> = {
  stable: "#22c55e",
  tension: "#eab308",
  critical: "#f97316",
  emergency: "#ef4444",
};

const NO_COLOR = "transparent";
const SELECTED_COLOR = "#3b82f6";
const GEOJSON_BACKEND = "/api/v1/geo/countries";
const GEOJSON_CDN =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * Load country boundary GeoJSON with fallback.
 * 1. Try the lightweight backend proxy (pre-stripped properties).
 * 2. If it fails or returns 0 features, fetch directly from CDN and strip client-side.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadCountryGeoJSON(): Promise<any | null> {
  // Backend proxy (pre-stripped, ~30 KB)
  try {
    const res = await fetch(GEOJSON_BACKEND);
    if (res.ok) {
      const gj = await res.json();
      if (Array.isArray(gj?.features) && gj.features.length > 0) return gj;
      console.warn("[MapView] Backend returned empty GeoJSON — falling back to CDN");
    }
  } catch (e) {
    console.warn("[MapView] Backend GeoJSON proxy failed:", e);
  }

  // Fallback: fetch directly from CDN (CORS-enabled, ~530 KB)
  try {
    const res = await fetch(GEOJSON_CDN);
    if (!res.ok) throw new Error(`CDN ${res.status}`);
    const gj = await res.json();
    for (const f of gj.features ?? []) {
      const p = f.properties ?? {};
      f.properties = {
        ISO_A3: p.ISO_A3 ?? "",
        NAME: p.NAME ?? "",
        ISO_A3_EH: p.ISO_A3_EH ?? p.ISO_A3 ?? "",
      };
    }
    return gj;
  } catch (e) {
    console.error("[MapView] CDN GeoJSON fallback also failed:", e);
    return null;
  }
}

/**
 * Build a MapLibre paint expression that colors countries by stress status
 * and highlights the selected country in blue.
 *
 * Uses ["case", ...] instead of ["match", ["coalesce", ...], ...] because
 * MapLibre v5 can silently reject match expressions with coalesce inputs.
 */
function buildFillColor(
  impactMap: Map<string, CountryImpact>,
  selectedCode: string | null,
): unknown {
  // case expression: ["case", cond1, color1, cond2, color2, ..., fallback]
  const parts: unknown[] = ["case"];

  // Stress colors for simulated countries
  impactMap.forEach((ci, code) => {
    parts.push(
      ["any",
        ["==", ["get", "ISO_A3_EH"], code],
        ["==", ["get", "ISO_A3"], code],
      ],
      STRESS_COLORS[ci.stress_status],
    );
  });

  // Selected country (blue highlight) if not already in impacts
  if (selectedCode && !impactMap.has(selectedCode)) {
    parts.push(
      ["any",
        ["==", ["get", "ISO_A3_EH"], selectedCode],
        ["==", ["get", "ISO_A3"], selectedCode],
      ],
      SELECTED_COLOR,
    );
  }

  // If we have no conditions, just return transparent
  if (parts.length === 1) return NO_COLOR;

  parts.push(NO_COLOR); // fallback
  return parts;
}

function buildOutlineColor(selectedCode: string | null): unknown {
  if (!selectedCode) return NO_COLOR;
  return [
    "case",
    ["any",
      ["==", ["get", "ISO_A3_EH"], selectedCode],
      ["==", ["get", "ISO_A3"], selectedCode],
    ],
    SELECTED_COLOR,
    NO_COLOR,
  ];
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  // useState (not useRef) so that when GeoJSON loads, a re-render triggers
  // the color useEffect which was previously skipped.
  const [geoLoaded, setGeoLoaded] = useState(false);

  const { data: countries } = useCountries();
  const { data: chokepoints } = useChokepoints();
  const countryImpacts = useAppStore((s) => s.countryImpacts);
  const selectedCountryCode = useAppStore((s) => s.selectedCountryCode);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const setSelectedChokepointId = useAppStore((s) => s.setSelectedChokepointId);

  const impactMap = useMemo(() => {
    const map = new Map<string, CountryImpact>();
    countryImpacts.forEach((ci) => map.set(ci.country_code, ci));
    return map;
  }, [countryImpacts]);

  const handleCountryClick = useCallback((code: string) => {
    setSelectedCountryCode(code);
  }, [setSelectedCountryCode]);

  // Initialize map + load country boundaries for choropleth
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [40, 25],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-left");
    mapRef.current = map;

    map.on("load", async () => {
      const geojson = await loadCountryGeoJSON();
      if (!geojson) {
        console.warn("[MapView] No GeoJSON available — choropleth disabled, dots still work");
        return;
      }
      if (!map.getSource("country-boundaries")) {
        map.addSource("country-boundaries", { type: "geojson", data: geojson });

        const firstSymbolLayer = map.getStyle().layers?.find((l) => l.type === "symbol");

        map.addLayer(
          {
            id: "country-fill",
            type: "fill",
            source: "country-boundaries",
            paint: { "fill-color": NO_COLOR, "fill-opacity": 0.55 },
          },
          firstSymbolLayer?.id,
        );
        map.addLayer(
          {
            id: "country-outline",
            type: "line",
            source: "country-boundaries",
            paint: { "line-color": NO_COLOR, "line-width": 2, "line-opacity": 0.9 },
          },
          firstSymbolLayer?.id,
        );

        map.on("click", "country-fill", (e) => {
          const props = e.features?.[0]?.properties;
          const code = props?.ISO_A3_EH || props?.ISO_A3;
          if (code && code !== "-99") handleCountryClick(code);
        });
        map.on("mouseenter", "country-fill", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "country-fill", () => { map.getCanvas().style.cursor = ""; });

        // useState triggers re-render → color useEffect runs
        setGeoLoaded(true);
      }
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [handleCountryClick]);

  // Update country fill colors when impacts, selection, or geo-load changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoLoaded || !map.getLayer("country-fill")) return;

    map.setPaintProperty("country-fill", "fill-color", buildFillColor(impactMap, selectedCountryCode));
    map.setPaintProperty("country-outline", "line-color", buildOutlineColor(selectedCountryCode));
  }, [impactMap, selectedCountryCode, geoLoaded]);

  // Update markers (country dots + chokepoint diamonds)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !countries) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    countries.forEach((c) => {
      const impact = impactMap.get(c.code);
      const hasImpact = !!impact;
      const isSelected = c.code === selectedCountryCode;
      const color = hasImpact ? STRESS_COLORS[impact.stress_status] : isSelected ? SELECTED_COLOR : "#7cc8fb";
      const size = hasImpact ? Math.max(10, Math.min(22, 10 + impact.stress_score * 0.12)) : isSelected ? 14 : 10;

      const hitArea = Math.max(24, size + 10);


      const el = document.createElement("div");
      el.style.cssText = `width:${hitArea}px;height:${hitArea}px;cursor:pointer;display:flex;align-items:center;justify-content:center`;

      const dot = document.createElement("div");
      dot.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:1.5px solid ${hasImpact || isSelected ? color : "rgba(124,200,251,0.4)"};transition:transform .3s,box-shadow .3s;box-shadow:${hasImpact ? `0 0 ${size}px ${color}40` : "none"}`;
      el.appendChild(dot);

      el.title = `${c.name} (${c.code})${hasImpact ? ` — ${impact.stress_status} (${impact.stress_score.toFixed(0)})` : ""}`;
      el.addEventListener("click", () => handleCountryClick(c.code));
      el.addEventListener("mouseenter", () => { dot.style.transform = "scale(1.6)"; dot.style.boxShadow = `0 0 ${size + 8}px ${color}80`; });
      el.addEventListener("mouseleave", () => { dot.style.transform = "scale(1)"; dot.style.boxShadow = hasImpact ? `0 0 ${size}px ${color}40` : "none"; });

      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([c.longitude, c.latitude]).addTo(map));
    });

    if (chokepoints) {
      chokepoints.forEach((cp) => {
        const el = document.createElement("div");
        el.style.cssText = "width:14px;height:14px;cursor:pointer";

        const diamond = document.createElement("div");
        diamond.style.cssText = "width:100%;height:100%;border-radius:2px;background:rgba(239,68,68,.7);border:1.5px solid rgba(239,68,68,.9);transform:rotate(45deg);transition:transform .3s,box-shadow .3s,background .3s";
        el.appendChild(diamond);

        el.title = `${cp.name} (${cp.throughput_mbpd} Mb/d)`;
        el.addEventListener("click", () => setSelectedChokepointId(cp.id));
        el.addEventListener("mouseenter", () => { diamond.style.transform = "rotate(45deg) scale(1.5)"; diamond.style.boxShadow = "0 0 12px rgba(239,68,68,.6)"; diamond.style.background = "rgba(239,68,68,.9)"; });
        el.addEventListener("mouseleave", () => { diamond.style.transform = "rotate(45deg) scale(1)"; diamond.style.boxShadow = "none"; diamond.style.background = "rgba(239,68,68,.7)"; });

        markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([cp.longitude, cp.latitude]).addTo(map));
      });
    }
  }, [countries, chokepoints, impactMap, selectedCountryCode, handleCountryClick, setSelectedChokepointId]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
