"use client";

import { useEffect, useState } from "react";

import { PredictionPoint } from "@/lib/types";

type RawPredictionPoint = {
  date?: unknown;
  predicted_revenue?: unknown;
  predictedRevenue?: unknown;
};

let predictionsCache: PredictionPoint[] | null = null;
let fallbackCache = false;
let inFlightRequest: Promise<{ data: PredictionPoint[]; usedFallback: boolean }> | null = null;

function normalizePredictions(raw: unknown): PredictionPoint[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((row) => {
      const point = row as RawPredictionPoint;
      const date = typeof point.date === "string" ? point.date : "";
      const valueRaw = point.predicted_revenue ?? point.predictedRevenue;
      const predictedRevenue = Number(valueRaw);

      if (!date || Number.isNaN(predictedRevenue)) return null;

      return {
        date,
        predicted_revenue: Number(predictedRevenue.toFixed(2))
      };
    })
    .filter((point): point is PredictionPoint => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildFallbackPredictions(days = 30): PredictionPoint[] {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);

    const baseline = 2100;
    const trend = index * 22;
    const seasonality = Math.sin(index / 3) * 180;

    return {
      date: date.toISOString().slice(0, 10),
      predicted_revenue: Number((baseline + trend + seasonality).toFixed(2))
    };
  });
}

async function fetchPredictions(): Promise<{ data: PredictionPoint[]; usedFallback: boolean }> {
  if (!inFlightRequest) {
    inFlightRequest = fetch("/api/predictions", { cache: "force-cache" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch predictions");
        return res.json();
      })
      .then((json) => {
        const normalized = normalizePredictions(json);
        if (normalized.length > 0) {
          return { data: normalized, usedFallback: false };
        }

        return { data: buildFallbackPredictions(30), usedFallback: true };
      })
      .catch(() => ({ data: buildFallbackPredictions(30), usedFallback: true }))
      .finally(() => {
        inFlightRequest = null;
      });
  }

  return inFlightRequest;
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<PredictionPoint[]>(predictionsCache ?? []);
  const [isLoading, setIsLoading] = useState(predictionsCache === null);
  const [isFallback, setIsFallback] = useState(fallbackCache);

  useEffect(() => {
    let mounted = true;

    if (predictionsCache) {
      setPredictions(predictionsCache);
      setIsLoading(false);
      setIsFallback(fallbackCache);
      return;
    }

    fetchPredictions().then(({ data, usedFallback }) => {
      if (!mounted) return;

      predictionsCache = data;
      fallbackCache = usedFallback;
      setPredictions(data);
      setIsLoading(false);
      setIsFallback(fallbackCache);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    predictions,
    isLoading,
    isFallback
  };
}
