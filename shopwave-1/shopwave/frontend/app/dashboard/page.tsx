"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DollarSign, Package, ShoppingCart } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import dynamic from "next/dynamic";
import PredictionSummary from "@/components/PredictionSummary";

const AIInsights = dynamic(() => import("@/components/AIInsights"), { ssr: false });
const SalesTrendChart = dynamic(() => import("@/charts/SalesTrendChart"), { ssr: false });
const CategoryRevenueChart = dynamic(() => import("@/charts/CategoryRevenueChart"), { ssr: false });
import ChartCard from "@/components/ChartCard";
import StatCard from "@/components/StatCard";
import { usePredictions } from "@/hooks/usePredictions";
import { formatCurrency } from "@/lib/formatCurrency";
import { CategoryRevenue, DailyRevenue, PredictionPoint, SalesSummary, TopProduct } from "@/lib/types";

const categoryOptions = ["", "Electronics", "Clothing", "Home & Kitchen", "Beauty", "Sports"];

function buildQuery(startDate: string, endDate: string, category: string): string {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (category) params.set("category", category);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [trends, setTrends] = useState<DailyRevenue[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { predictions, isLoading: isPredictionsLoading } = usePredictions();

  const query = useMemo(() => buildQuery(startDate, endDate, category), [startDate, endDate, category]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [s, t, c, tp] = await Promise.all([
          fetch(`/api/sales-summary${query}`, { cache: "force-cache" }).then((r) => r.json()),
          fetch(`/api/sales-trends${query}`, { cache: "force-cache" }).then((r) => r.json()),
          fetch(`/api/category-performance${query}`, { cache: "force-cache" }).then((r) => r.json()),
          fetch(`/api/top-products${query}`, { cache: "force-cache" }).then((r) => r.json())
        ]);
        setSummary(s);
        setTrends(t);
        setCategoryData(c);
        setTopProducts(tp.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [query]);

  const next7Days = useMemo<PredictionPoint[]>(() => predictions.slice(0, 7), [predictions]);

  const next7DayRevenue = useMemo(
    () => next7Days.reduce((sum, point) => sum + point.predicted_revenue, 0),
    [next7Days]
  );

  const downloadCsv = () => {
    const rows = ["Date,Revenue", ...trends.map((row) => `${row.date},${row.revenue}`)].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "shopwave_sales_trends.csv");
    link.click();
  };

  return (
    <div className="page-transition space-y-6">
      <section className="panel rounded-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-sm text-black transition-all duration-300 ease-in-out"
            >
              {categoryOptions.map((value) => (
                <option key={value} value={value} className="bg-white text-black">
                  {value || "All categories"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={downloadCsv}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
            >
              Download CSV Report
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(summary?.totalRevenue ?? 0)} icon={DollarSign} />
        <StatCard title="Total Orders" value={`${summary?.totalOrders ?? 0}`} icon={ShoppingCart} />
        <StatCard title="Average Order Value" value={formatCurrency(summary?.averageOrderValue ?? 0)} icon={Package} />
      </section>

      <div className="relative z-0 mt-6 w-full max-w-full overflow-hidden">
        <AIInsights summary={summary} categoryData={categoryData} trends={trends} />
      </div>

      {isLoading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Sales Trend" subtitle="Daily revenue over time">
          <SalesTrendChart data={trends} />
        </ChartCard>
        <ChartCard title="Category Revenue" subtitle="Top performing categories">
          <CategoryRevenueChart data={categoryData} />
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Top Products</h2>
              <p className="text-sm text-gray-300">Top 5 products by revenue</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-cyan-300 transition-all duration-200 hover:text-cyan-200">
              View All Products
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-300">No product data available.</p>
            ) : (
              topProducts.map((product) => (
                <div
                  key={product.productName}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-300 ease-in-out hover:bg-white/10"
                >
                  <p className="truncate pr-3 text-sm font-medium text-white">{product.productName}</p>
                  <p className="text-sm font-semibold text-cyan-200">{formatCurrency(product.totalRevenue)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <PredictionSummary predictions={next7Days} isLoading={isPredictionsLoading} />
      </section>
    </div>
  );
}
