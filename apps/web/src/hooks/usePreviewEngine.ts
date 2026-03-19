/** Hook to run the client-side preview engine in a Web Worker. */

import { useRef, useEffect, useCallback, useState } from "react";

interface PreviewResult {
  country_impacts: Array<{
    country_code: string;
    stress_score: number;
    stress_status: string;
    demand_coverage_ratio: number;
  }>;
  global_stress_score: number;
  global_supply_loss_pct: number;
  estimated_price_impact_pct: number;
  duration_ms: number;
}

export function usePreviewEngine() {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/previewEngine.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.type === "result") {
        setResult(event.data.payload);
        setIsRunning(false);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const runPreview = useCallback(
    (input: {
      countries: unknown[];
      flows: unknown[];
      chokepoints: unknown[];
      routes: unknown[];
      actions: unknown[];
    }) => {
      if (!workerRef.current) return;
      setIsRunning(true);
      workerRef.current.postMessage({ type: "run", payload: input });
    },
    []
  );

  return { result, isRunning, runPreview };
}
