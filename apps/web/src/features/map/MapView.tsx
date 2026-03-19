import { useRef, useEffect, useMemo } from "react";
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

const COUNTRY_GEOJSON_URL = "/api/v1/geo/countries";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** ISO_A3_EH with fallback to ISO_A3 (handles -99 disputed territories in Natural Earth). */
const ISO_PROP: maplibregl.ExpressionSpecification = [
  "coalesce", ["get", "ISO_A3_EH"], ["get", "ISO_A3"],
];

function buildCountryColorExpr(
  impactMap: Map<string, CountryImpact>,
  selectedCode: string | null,
): maplibregl.ExpressionSpecification {
  const expr: unknown[] = ["match", ISO_PROP];
  impactMap.forEach((ci, code) => {
    expr.push(code, STRESS_COLORS[ci.stress_status]);
  });
  if (selectedCode && !impactMap.has(selectedCode)) {
    expr.push(selectedCode, "#3b82f6");
  }
  expr.push("transparent");
  return expr as maplibregl.ExpressionSpecification;
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const geoLoadedRef = useRef(false);

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

    map.on("load", () => {
      fetch(COUNTRY_GEOJSON_URL)
        .then((r) => r.json())
        .then((geojson) => {
          if (!map.getSource("country-boundaries")) {
            map.addSource("country-boundaries", { type: "geojson", data: geojson });

            const firstSymbolLayer = map.getStyle().layers?.find((l) => l.type === "symbol");

            map.addLayer(
              {
                id: "country-fill",
                type: "fill",
                source: "country-boundaries",
                paint: { "fill-color": "transparent", "fill-opacity": 0.25 },
              },
              firstSymbolLayer?.id,
            );
            map.addLayer(
              {
                id: "country-outline",
                type: "line",
                source: "country-boundaries",
                paint: { "line-color": "transparent", "line-width": 1.5, "line-opacity": 0.6 },
              },
              firstSymbolLayer?.id,
            );

            map.on("click", "country-fill", (e) => {
              const code = e.features?.[0]?.properties?.ISO_A3_EH || e.features?.[0]?.properties?.ISO_A3;
              if (code && code !== "-99") setSelectedCountryCode(code);
            });
            map.on("mouseenter", "country-fill", () => { map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "country-fill", () => { map.getCanvas().style.cursor = ""; });

            geoLoadedRef.current = true;
          }
        })
        .catch(() => { /* GeoJSON load failed — dot markers still work as fallback */ });
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [setSelectedCountryCode]);

  // Update country fill colors when impacts or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoLoadedRef.current || !map.getLayer("country-fill")) return;

    map.setPaintProperty("country-fill", "fill-color", buildCountryColorExpr(impactMap, selectedCountryCode));

    const outlineExpr: maplibregl.ExpressionSpecification = selectedCountryCode
      ? ["case", ["==", ISO_PROP, selectedCountryCode], "#3b82f6", "transparent"]
      : "transparent" as unknown as maplibregl.ExpressionSpecification;
    map.setPaintProperty("country-outline", "line-color", outlineExpr);
  }, [impactMap, selectedCountryCode]);

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
      const color = hasImpact ? STRESS_COLORS[impact.stress_status] : isSelected ? "#3b82f6" : "#7cc8fb";
      const size = hasImpact ? Math.max(6, Math.min(20, 6 + impact.stress_score * 0.14)) : isSelected ? 8 : 4;

      const el = document.createElement("div");
      el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer`;

      const dot = document.createElement("div");
      dot.style.cssText = `width:100%;height:100%;border-radius:50%;background:${color};border:1.5px solid ${hasImpact || isSelected ? color : "rgba(124,200,251,0.3)"};transition:transform .3s,box-shadow .3s;box-shadow:${hasImpact ? `0 0 ${size}px ${color}40` : "none"}`;
      el.appendChild(dot);

      el.title = `${c.name} (${c.code})${hasImpact ? ` — ${impact.stress_status} (${impact.stress_score.toFixed(0)})` : ""}`;
      el.addEventListener("click", () => setSelectedCountryCode(c.code));
      el.addEventListener("mouseenter", () => { dot.style.transform = "scale(1.8)"; dot.style.boxShadow = `0 0 ${size + 8}px ${color}80`; });
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
  }, [countries, chokepoints, impactMap, selectedCountryCode, setSelectedCountryCode, setSelectedChokepointId]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
