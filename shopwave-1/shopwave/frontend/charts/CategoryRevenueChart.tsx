"use client";

import { memo } from "react";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/formatCurrency";
import { CategoryRevenue } from "@/lib/types";

function CategoryRevenueChart({ data }: { data: CategoryRevenue[] }) {
  return (
    <div className="h-full chart-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="categoryBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={70} />
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
          <Bar dataKey="revenue" fill="url(#categoryBarGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(CategoryRevenueChart);
