"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import CategoryRevenueChart from "@/charts/CategoryRevenueChart";
import ChartCard from "@/components/ChartCard";
import { formatCurrency } from "@/lib/formatCurrency";
import { CategoryRevenue } from "@/lib/types";

const pieColors = ["#0ea5e9", "#14b8a6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316"];

export default function CategoriesPage() {
  const [data, setData] = useState<CategoryRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/category-performance", { cache: "force-cache" })
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setIsLoading(false));
  }, []);

  const totalRevenue = useMemo(
    () => data.reduce((sum, item) => sum + item.revenue, 0),
    [data]
  );

  const insightsRows = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        revenuePercentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
      })),
    [data, totalRevenue]
  );

  return (
    <div className="page-transition space-y-6">
      <h2 className="font-display text-xl font-semibold text-white">Category Performance</h2>

      {isLoading ? (
        <div className="space-y-5">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Revenue by Category" subtitle="Identify top earning product segments">
            <CategoryRevenueChart data={data} />
          </ChartCard>
        </div>
        <ChartCard title="Revenue Share" subtitle="Category contribution by percentage">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, props) => {
                  const percentage = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;
                  return [`${formatCurrency(value)} (${percentage.toFixed(1)}%)`, props.payload.category];
                }}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff"
                }}
                itemStyle={{ color: "#ffffff" }}
                labelStyle={{ color: "#ffffff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="panel rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold text-white">Category Insights</h3>
          <p className="text-sm text-gray-300">Revenue mix and order volume by category</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-300">
                <th className="px-3 py-3 font-bold">Category</th>
                <th className="px-3 py-3 font-bold">Total Revenue</th>
                <th className="px-3 py-3 font-bold">Total Orders</th>
                <th className="px-3 py-3 font-bold">Revenue Percentage</th>
              </tr>
            </thead>
            <tbody>
              {insightsRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-300">
                    No category data available.
                  </td>
                </tr>
              ) : (
                insightsRows.map((item) => (
                  <tr
                    key={item.category}
                    className="border-b border-white/10 transition-all duration-300 odd:bg-transparent even:bg-white/5 hover:bg-white/10 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-white">{item.category}</td>
                    <td className="px-3 py-3 text-slate-200">{formatCurrency(item.revenue)}</td>
                    <td className="px-3 py-3 text-slate-200">{item.totalOrders.toLocaleString()}</td>
                    <td className="px-3 py-3 text-slate-200">{item.revenuePercentage.toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
