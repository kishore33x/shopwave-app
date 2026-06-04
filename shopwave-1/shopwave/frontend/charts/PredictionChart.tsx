"use client";

import { memo } from "react";

import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatCurrency } from "@/lib/formatCurrency";
import { PredictionPoint } from "@/lib/types";

function PredictionChart({ data }: { data: PredictionPoint[] }) {
  return (
    <div className="h-full chart-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="predictionAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="predictionLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(v: number) => formatCurrency(v)}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 25px rgba(2, 8, 23, 0.35)",
              color: "#e2e8f0"
            }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Area type="monotone" dataKey="predicted_revenue" stroke="none" fill="url(#predictionAreaGradient)" />
          <Line type="monotone" dataKey="predicted_revenue" stroke="url(#predictionLineGradient)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(PredictionChart);
