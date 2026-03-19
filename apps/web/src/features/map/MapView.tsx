import { useRef, useEffect, useMemo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppStore } from "../../store/appStore";
import { useCountries, useChokepoints, useFlows } from "../../api/hooks";
import { maritimeRoutePaths, countryPorts } from "../../data/maritimeRoutePaths";
import type { CountryImpact, Flow, StressStatus } from "../../types";

const STRESS_COLORS: Record<StressStatus, string> = {
  stable: "#22c55e",
  tension: "#eab308",
  critical: "#f97316",
  emergency: "#ef4444",
};

const COUNTRY_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/main/data/countries.geojson";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** Build a color match expression for the country fill layer. */
function buildCountryColorExpr(
  impactMap: Map<string, CountryImpact>,
  selectedCode: string | null,
): maplibregl.ExpressionSpecification {
  const expr: unknown[] = ["match", ["get", "ISO_A3"]];
  impactMap.forEach((ci, code) => {
    expr.push(code, STRESS_COLORS[ci.stress_status]);
  });
  if (selectedCode && !impactMap.has(selectedCode)) {
    expr.push(selectedCode, "#3b82f6");
  }
  expr.push("transparent");
  return expr as maplibregl.ExpressionSpecification;
}

/** Build a GeoJSON FeatureCollection for flow route lines. */
function buildFlowLinesGeoJSON(
  flows: Flow[],
  selectedCode: string | null,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  if (!selectedCode) return { type: "FeatureCollection", features };

  const relatedFlows = flows.filter(
    (f) => f.importer_code === selectedCode || f.exporter_code === selectedCode,
  );

  for (const flow of relatedFlows) {
    const routePath = maritimeRoutePaths[flow.route_id];
    if (!routePath) continue;

    const isImport = flow.importer_code === selectedCode;
    const otherCode = isImport ? flow.exporter_code : flow.importer_code;
    const otherPort = countryPorts[otherCode];
    const selectedPort = countryPorts[selectedCode];
    if (!otherPort || !selectedPort) continue;

    // Use the route path, potentially reversed for exports
    let coords: [number, number][];
    if (isImport) {
      coords = [...routePath];
    } else {
      coords = [...routePath].reverse();
    }

    features.push({
      type: "Feature",
      properties: {
        flow_id: flow.id,
        volume: flow.volume_mbpd,
        is_import: isImport,
        other_code: otherCode,
        product: flow.product_id,
      },
      geometry: { type: "LineString", coordinates: coords },
    });
  }

  return { type: "FeatureCollection", features };
}

/** Build GeoJSON points for animated ship positions along routes. */
function buildShipPositions(
  flows: Flow[],
  selectedCode: string | null,
  progress: number,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  if (!selectedCode) return { type: "FeatureCollection", features };

  const relatedFlows = flows.filter(
    (f) => f.importer_code === selectedCode || f.exporter_code === selectedCode,
  );

  for (const flow of relatedFlows) {
    const routePath = maritimeRoutePaths[flow.route_id];
    if (!routePath || routePath.length < 2) continue;

    const isImport = flow.importer_code === selectedCode;
    const coords = isImport ? routePath : [...routePath].reverse();

    // Place ship at interpolated position along the route
    const totalSegments = coords.length - 1;
    const exactPos = (progress % 1) * totalSegments;
    const segIndex = Math.min(Math.floor(exactPos), totalSegments - 1);
    const t = exactPos - segIndex;

    const p0 = coords[segIndex]!;
    const p1 = coords[Math.min(segIndex + 1, coords.length - 1)]!;
    const lng = p0[0] + (p1[0] - p0[0]) * t;
    const lat = p0[1] + (p1[1] - p0[1]) * t;

    features.push({
      type: "Feature",
      properties: {
        flow_id: flow.id,
        volume: flow.volume_mbpd,
        is_import: isImport,
      },
      geometry: { type: "Point", coordinates: [lng, lat] },
    });
  }

  return { type: "FeatureCollection", features };
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const animFrameRef = useRef<number>(0);
  const geoLoadedRef = useRef(false);

  const { data: countries } = useCountries();
  const { data: chokepoints } = useChokepoints();
  const { data: flows } = useFlows();
  const countryImpacts = useAppStore((s) => s.countryImpacts);
  const selectedCountryCode = useAppStore((s) => s.selectedCountryCode);
  const setSelectedCountryCode = useAppStore((s) => s.setSelectedCountryCode);
  const setSelectedChokepointId = useAppStore((s) => s.setSelectedChokepointId);

  const impactMap = useMemo(() => {
    const map = new Map<string, CountryImpact>();
    countryImpacts.forEach((ci) => map.set(ci.country_code, ci));
    return map;
  }, [countryImpacts]);

  // Initialize map + load country boundaries
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
      // Add empty sources for flow lines and ships
      map.addSource("flow-lines", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addSource("ship-positions", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Flow route lines layer
      map.addLayer({
        id: "flow-lines-layer",
        type: "line",
        source: "flow-lines",
        paint: {
          "line-color": [
            "case",
            ["get", "is_import"], "#3b82f6",
            "#10b981",
          ],
          "line-width": [
            "interpolate", ["linear"], ["get", "volume"],
            0.01, 1, 0.1, 2, 0.5, 3.5, 1.0, 5,
          ],
          "line-opacity": 0.5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      // Ship icon layer (animated dots)
      map.addLayer({
        id: "ship-layer",
        type: "circle",
        source: "ship-positions",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["get", "volume"],
            0.01, 3, 0.1, 4, 0.5, 6, 1.0, 8,
          ],
          "circle-color": [
            "case",
            ["get", "is_import"], "#60a5fa",
            "#34d399",
          ],
          "circle-opacity": 0.9,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.6,
        },
      });

      // Load country boundaries GeoJSON for choropleth
      fetch(COUNTRY_GEOJSON_URL)
        .then((r) => r.json())
        .then((geojson) => {
          if (!map.getSource("country-boundaries")) {
            map.addSource("country-boundaries", { type: "geojson", data: geojson });
            // Insert fill layer BELOW labels
            const firstSymbolLayer = map.getStyle().layers?.find((l) => l.type === "symbol");
            map.addLayer(
              {
                id: "country-fill",
                type: "fill",
                source: "country-boundaries",
                paint: {
                  "fill-color": "transparent",
                  "fill-opacity": 0.25,
                },
              },
              firstSymbolLayer?.id,
            );
            map.addLayer(
              {
                id: "country-outline",
                type: "line",
                source: "country-boundaries",
                paint: {
                  "line-color": "transparent",
                  "line-width": 1.5,
                  "line-opacity": 0.6,
                },
              },
              firstSymbolLayer?.id,
            );

            // Click on country polygon
            map.on("click", "country-fill", (e) => {
              const feature = e.features?.[0];
              if (feature?.properties?.ISO_A3) {
                setSelectedCountryCode(feature.properties.ISO_A3);
              }
            });
            map.on("mouseenter", "country-fill", () => {
              map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "country-fill", () => {
              map.getCanvas().style.cursor = "";
            });

            geoLoadedRef.current = true;
          }
        })
        .catch(() => {
          // GeoJSON load failed — country dots still work as fallback
        });
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [setSelectedCountryCode]);

  // Update country fill colors when impacts change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoLoadedRef.current) return;
    if (!map.getLayer("country-fill")) return;

    const colorExpr = buildCountryColorExpr(impactMap, selectedCountryCode);
    map.setPaintProperty("country-fill", "fill-color", colorExpr);

    // Outline selected country
    const outlineExpr: maplibregl.ExpressionSpecification = selectedCountryCode
      ? ["case", ["==", ["get", "ISO_A3"], selectedCountryCode], "#3b82f6", "transparent"]
      : "transparent" as unknown as maplibregl.ExpressionSpecification;
    map.setPaintProperty("country-outline", "line-color", outlineExpr);
  }, [impactMap, selectedCountryCode]);

  // Update flow lines + animate ships when selected country changes
  const animateFlows = useCallback(() => {
    const map = mapRef.current;
    if (!map || !flows || !selectedCountryCode) {
      // Clear flows when no country selected
      if (map?.getSource("flow-lines")) {
        (map.getSource("flow-lines") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection", features: [],
        });
      }
      if (map?.getSource("ship-positions")) {
        (map.getSource("ship-positions") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection", features: [],
        });
      }
      return;
    }

    // Set flow lines (static)
    const lineData = buildFlowLinesGeoJSON(flows, selectedCountryCode);
    (map.getSource("flow-lines") as maplibregl.GeoJSONSource).setData(lineData);

    // Animate ship positions
    let startTime = performance.now();
    const speed = 0.00004; // cycles per ms (~25 seconds per full route)

    function animate() {
      if (!mapRef.current) return;
      const elapsed = performance.now() - startTime;
      const progress = elapsed * speed;
      const shipData = buildShipPositions(flows!, selectedCountryCode, progress);
      const src = mapRef.current.getSource("ship-positions") as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(shipData);
      animFrameRef.current = requestAnimationFrame(animate);
    }

    cancelAnimationFrame(animFrameRef.current);
    startTime = performance.now();
    animate();
  }, [flows, selectedCountryCode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Wait for map to be loaded before setting sources
    if (map.loaded()) {
      animateFlows();
    } else {
      map.on("load", animateFlows);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [animateFlows]);

  // Update markers (country dots + chokepoint diamonds)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !countries) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Country markers (smaller now since we have fills)
    countries.forEach((c) => {
      const impact = impactMap.get(c.code);
      const hasImpact = !!impact;
      const isSelected = c.code === selectedCountryCode;
      const color = hasImpact ? STRESS_COLORS[impact.stress_status] : isSelected ? "#3b82f6" : "#7cc8fb";
      const size = hasImpact
        ? Math.max(6, Math.min(20, 6 + impact.stress_score * 0.14))
        : isSelected ? 8 : 4;

      const el = document.createElement("div");
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.cursor = "pointer";

      const dot = document.createElement("div");
      dot.style.width = "100%";
      dot.style.height = "100%";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = color;
      dot.style.border = `1.5px solid ${hasImpact || isSelected ? color : "rgba(124,200,251,0.3)"}`;
      dot.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      dot.style.boxShadow = hasImpact ? `0 0 ${size}px ${color}40` : "none";
      el.appendChild(dot);

      el.title = `${c.name} (${c.code})${hasImpact ? ` — ${impact.stress_status} (${impact.stress_score.toFixed(0)})` : ""}`;

      el.addEventListener("click", () => setSelectedCountryCode(c.code));
      el.addEventListener("mouseenter", () => {
        dot.style.transform = "scale(1.8)";
        dot.style.boxShadow = `0 0 ${size + 8}px ${color}80`;
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
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.cursor = "pointer";

        const diamond = document.createElement("div");
        diamond.style.width = "100%";
        diamond.style.height = "100%";
        diamond.style.borderRadius = "2px";
        diamond.style.backgroundColor = "rgba(239, 68, 68, 0.7)";
        diamond.style.border = "1.5px solid rgba(239, 68, 68, 0.9)";
        diamond.style.transform = "rotate(45deg)";
        diamond.style.transition = "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease";
        el.appendChild(diamond);

        el.title = `${cp.name} (${cp.throughput_mbpd} Mb/d)`;
        el.addEventListener("click", () => setSelectedChokepointId(cp.id));
        el.addEventListener("mouseenter", () => {
          diamond.style.transform = "rotate(45deg) scale(1.5)";
          diamond.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.6)";
          diamond.style.backgroundColor = "rgba(239, 68, 68, 0.9)";
        });
        el.addEventListener("mouseleave", () => {
          diamond.style.transform = "rotate(45deg) scale(1)";
          diamond.style.boxShadow = "none";
          diamond.style.backgroundColor = "rgba(239, 68, 68, 0.7)";
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([cp.longitude, cp.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [countries, chokepoints, impactMap, selectedCountryCode, setSelectedCountryCode, setSelectedChokepointId]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
