"use client";

import React, { memo, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { PredictionPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
  predictions: PredictionPoint[];
  isLoading?: boolean;
};

function calcConfidence(points: PredictionPoint[]) {
  if (points.length === 0) return 0;
  const vals = points.map((p) => p.predicted_revenue);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + (v - mean) * (v - mean), 0) / vals.length;
  const sd = Math.sqrt(variance);
  const score = Math.max(20, Math.min(99, Math.round(100 - (sd / Math.max(mean, 1)) * 100)));
  return score;
}

function sparkPath(points: number[], width = 240, height = 48) {
  if (points.length === 0) return "";
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, points.length - 1);
  return points
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function PredictionSummary({ predictions, isLoading }: Props) {
  const total = useMemo(() => predictions.reduce((s, p) => s + p.predicted_revenue, 0), [predictions]);
  const first = predictions[0]?.predicted_revenue ?? 0;
  const last = predictions[predictions.length - 1]?.predicted_revenue ?? 0;
  const growth = useMemo(() => (first === 0 ? 0 : ((last - first) / Math.max(1, Math.abs(first))) * 100), [first, last]);
  const confidence = useMemo(() => calcConfidence(predictions), [predictions]);

  const motionVal = useMotionValue(total);
  const spring = useSpring(motionVal, { stiffness: 120, damping: 20 });

  useEffect(() => {
    motionVal.set(total);
  }, [total, motionVal]);

  const sparkPoints = predictions.map((p) => p.predicted_revenue);
  const path = useMemo(() => sparkPath(sparkPoints, 320, 56), [sparkPoints]);

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -4, boxShadow: "0 12px 30px rgba(2,8,23,0.6)", scale: 1.01 }}
      className="panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 backdrop-blur-md bg-white/4 border border-white/6 shadow-lg"
      style={{ willChange: "transform" }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">Prediction Summary</h3>
          <p className="text-sm text-slate-300">Next 7 days predicted revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-xs font-semibold text-slate-200">
            <span className="text-xs">Confidence</span>
            <span className="ml-1 rounded-md bg-gradient-to-r from-emerald-400 to-cyan-400 px-2 py-0.5 text-[11px] font-bold">{confidence}%</span>
          </div>
          <div
            aria-hidden
            className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold ${growth >= 0 ? "text-emerald-300" : "text-rose-300"}`}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${growth >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span>{growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <motion.span style={{ fontVariantNumeric: "tabular-nums" }} className="block text-3xl font-display font-semibold text-white">
            {spring && (
              <motion.span
                style={{ translateY: 0 }}
                // @ts-ignore - framer motion supports spring value formatting
                children={spring}
              />
            )}
            {!spring && <span>{formatCurrency(total)}</span>}
          </motion.span>
          {isLoading ? <p className="mt-2 text-xs text-slate-300">Loading predictions...</p> : null}
        </div>
        <div className="hidden sm:block">
          <svg width="160" height="56" viewBox="0 0 320 56" className="overflow-visible">
            <defs>
              <linearGradient id="sparkGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <motion.path d={path} fill="none" stroke="url(#sparkGradient)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
          </svg>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${confidence}%`, transition: "width 600ms ease" }}
            />
          </div>
          <p className="text-xs text-slate-300">Prediction confidence</p>
        </div>
        <div className="text-xs text-slate-400">Forecast horizon: 7 days</div>
      </div>
    </motion.section>
  );
}

export default memo(PredictionSummary);
