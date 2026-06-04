"use client";

import { useMemo } from "react";

import PredictionChart from "@/charts/PredictionChart";
import StatCard from "@/components/StatCard";
import { usePredictions } from "@/hooks/usePredictions";
import { formatCurrency } from "@/lib/formatCurrency";

export default function PredictionsPage() {
  const { predictions, isLoading, isFallback } = usePredictions();

  const forecast30Days = useMemo(() => predictions.slice(0, 30), [predictions]);

  const predictedTotalRevenue = useMemo(
    () => forecast30Days.reduce((sum, point) => sum + point.predicted_revenue, 0),
    [forecast30Days]
  );

  const highestPredictedDay = useMemo(() => {
    if (forecast30Days.length === 0) return null;

    return forecast30Days.reduce((max, point) =>
      point.predicted_revenue > max.predicted_revenue ? point : max
    );
  }, [forecast30Days]);

  const averageDailyForecast = useMemo(() => {
    if (forecast30Days.length === 0) return 0;
    return predictedTotalRevenue / forecast30Days.length;
  }, [forecast30Days, predictedTotalRevenue]);

  return (
    <div className="page-transition space-y-6">
      <h2 className="font-display text-xl font-semibold text-white">Sales Forecast (30 days)</h2>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
          </div>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Predicted Total Revenue (30 Days)"
          value={formatCurrency(predictedTotalRevenue)}
        />
        <StatCard
          title="Highest Predicted Day"
          value={
            highestPredictedDay
              ? formatCurrency(highestPredictedDay.predicted_revenue)
              : formatCurrency(0)
          }
          helper={highestPredictedDay ? highestPredictedDay.date : "No forecast data available"}
        />
        <StatCard
          title="Average Daily Forecast"
          value={formatCurrency(averageDailyForecast)}
        />
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-amber-100/80 via-white to-sky-100/70 p-[1px] dark:from-amber-900/30 dark:via-slate-900 dark:to-sky-900/30">
        <div className="panel rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-white">Predicted Revenue</h2>
            <p className="text-sm text-gray-300">30-day forecast with trend confidence shading</p>
          </div>
          <div className="h-[320px]">
            {forecast30Days.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No prediction data available.
              </div>
            ) : (
              <PredictionChart data={forecast30Days} />
            )}
          </div>
        </div>
      </section>

      {isFallback ? (
        <p className="text-xs text-slate-300">Using fallback forecast data because live predictions were unavailable.</p>
      ) : null}
    </div>
  );
}
