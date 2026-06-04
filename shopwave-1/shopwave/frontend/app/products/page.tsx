"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/formatCurrency";
import { TopProduct } from "@/lib/types";

const PAGE_SIZE = 10;
type SortKey = "revenue" | "quantity";

export default function ProductsPage() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/top-products", { cache: "force-cache" })
      .then((res) => res.json())
      .then((json) => setProducts(json))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(queryInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryInput]);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => p.productName.toLowerCase().includes(q));
  }, [products, query]);

  const sorted = useMemo(() => {
    const next = [...filtered];

    next.sort((a, b) => {
      if (sortBy === "quantity") return b.totalQuantity - a.totalQuantity;
      return b.totalRevenue - a.totalRevenue;
    });

    return next;
  }, [filtered, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [query, sortBy]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-white">Top Products</h2>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out sm:w-80"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="quantity">Sort by Quantity</option>
          </select>
        </div>
      </div>

      <div className="panel overflow-x-auto rounded-2xl">
        {isLoading ? <div className="skeleton mx-4 mt-4 h-6 rounded-lg" /> : null}
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-3 font-bold">Product</th>
              <th className="px-4 py-3 font-bold">Category</th>
              <th className="px-4 py-3 font-bold">Quantity</th>
              <th className="px-4 py-3 font-bold">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-300">
                  No products found.
                </td>
              </tr>
            ) : (
              pagedProducts.map((item) => (
                <tr
                  key={item.productName}
                  className="border-b border-white/10 transition-all duration-300 ease-in-out odd:bg-transparent even:bg-white/5 hover:bg-white/10"
                >
                  <td className="px-4 py-3 font-medium text-white">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-200">{item.category}</td>
                  <td className="px-4 py-3 text-slate-200">{item.totalQuantity.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-cyan-200">{formatCurrency(item.totalRevenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">
          Page {page} of {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
