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

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const { data: countries } = useCountries();
  const { data: chokepoints } = useChokepoints();
  const countryImpacts = useAppStore((s) => s.countryImpacts);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);

  // Build impact lookup
  const impactMap = useMemo(() => {
    const map = new Map<string, CountryImpact>();
    countryImpacts.forEach((ci) => map.set(ci.country_code, ci));
    return map;
  }, [countryImpacts]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [40, 25],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 8,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-left");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !countries) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Country markers
    countries.forEach((c) => {
      const impact = impactMap.get(c.code);
      const hasImpact = !!impact;
      const color = hasImpact ? STRESS_COLORS[impact.stress_status] : "#7cc8fb";
      const size = hasImpact
        ? Math.max(8, Math.min(28, 8 + impact.stress_score * 0.2))
        : 6;

      const el = document.createElement("div");
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.cursor = "pointer";

      const dot = document.createElement("div");
      dot.style.width = "100%";
      dot.style.height = "100%";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = color;
      dot.style.border = `2px solid ${hasImpact ? color : "rgba(124,200,251,0.4)"}`;
      dot.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      dot.style.boxShadow = hasImpact
        ? `0 0 ${size}px ${color}40`
        : "none";
      el.appendChild(dot);

      el.title = `${c.name} (${c.code})${
        hasImpact ? ` — ${impact.stress_status} (${impact.stress_score.toFixed(0)})` : ""
      }`;

      el.addEventListener("click", () => {
        setSelectedCountryCode(c.code);
      });

      // Hover effect on inner dot only (not the marker container)
      el.addEventListener("mouseenter", () => {
        dot.style.transform = "scale(1.5)";
        dot.style.boxShadow = `0 0 ${size + 6}px ${color}80`;
      });
      el.addEventListener("mouseleave", () => {
        dot.style.transform = "scale(1)";
        dot.style.boxShadow = hasImpact ? `0 0 ${size}px ${color}40` : "none";
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([c.longitude, c.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Chokepoint markers
    if (chokepoints) {
      chokepoints.forEach((cp) => {
        const el = document.createElement("div");
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.borderRadius = "2px";
        el.style.backgroundColor = "rgba(239, 68, 68, 0.7)";
        el.style.border = "1px solid rgba(239, 68, 68, 0.9)";
        el.style.transform = "rotate(45deg)";
        el.title = `${cp.name} (${cp.throughput_mbpd} Mb/d)`;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([cp.longitude, cp.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [countries, chokepoints, impactMap, setSelectedCountryCode]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
