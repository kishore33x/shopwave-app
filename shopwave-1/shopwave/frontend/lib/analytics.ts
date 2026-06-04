import fs from "fs";
import path from "path";

import {
  CategoryRevenue,
  DailyRevenue,
  PredictionPoint,
  SalesSummary,
  TopProduct
} from "@/lib/types";

type RecordRow = {
  OrderID: string;
  ProductName: string;
  Category: string;
  Quantity: number;
  Price: number;
  Revenue: number;
  OrderDate: string;
};

type RawPredictionPoint = {
  date?: unknown;
  predicted_revenue?: unknown;
  predictedRevenue?: unknown;
};

function projectRoot(): string {
  return path.resolve(process.cwd(), "..");
}

function readCsv(filePath: string): RecordRow[] {
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  const [header, ...lines] = raw.split(/\r?\n/);

  if (!header || lines.length === 0) return [];

  const columns = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    const row = Object.fromEntries(columns.map((c, i) => [c, values[i]])) as Record<string, string>;

    return {
      OrderID: row.OrderID,
      ProductName: row.ProductName,
      Category: row.Category,
      Quantity: Number(row.Quantity ?? 0),
      Price: Number(row.Price ?? 0),
      Revenue: Number(row.Revenue ?? 0),
      OrderDate: row.OrderDate
    };
  });
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inDateRange(orderDate: string, startDate?: string | null, endDate?: string | null): boolean {
  const date = parseDate(orderDate);
  if (!date) return false;

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function getDataset(): RecordRow[] {
  const root = projectRoot();
  const cleanedPath = path.join(root, "data", "ecommerce_dataset_cleaned.csv");
  const rawPath = path.join(root, "data", "ecommerce_dataset.csv");

  if (fs.existsSync(cleanedPath)) return readCsv(cleanedPath);
  if (fs.existsSync(rawPath)) return readCsv(rawPath);

  return [];
}

export function filterDataset(rows: RecordRow[], startDate?: string | null, endDate?: string | null, category?: string | null): RecordRow[] {
  return rows.filter((row) => {
    const categoryPass = category ? row.Category === category : true;
    const datePass = inDateRange(row.OrderDate, startDate, endDate);
    return categoryPass && datePass;
  });
}

export function getSalesSummary(rows: RecordRow[]): SalesSummary {
  const orderSet = new Set(rows.map((r) => r.OrderID));
  const totalRevenue = rows.reduce((sum, row) => sum + row.Revenue, 0);
  const totalOrders = orderSet.size;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    averageOrderValue: Number((totalRevenue / Math.max(totalOrders, 1)).toFixed(2))
  };
}

export function getCategoryPerformance(rows: RecordRow[]): CategoryRevenue[] {
  const map = new Map<string, { revenue: number; orders: Set<string> }>();

  rows.forEach((row) => {
    const current = map.get(row.Category);
    if (!current) {
      map.set(row.Category, { revenue: row.Revenue, orders: new Set([row.OrderID]) });
      return;
    }

    current.revenue += row.Revenue;
    current.orders.add(row.OrderID);
  });

  return [...map.entries()]
    .map(([category, value]) => ({
      category,
      revenue: Number(value.revenue.toFixed(2)),
      totalOrders: value.orders.size
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getDailySalesTrends(rows: RecordRow[]): DailyRevenue[] {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    map.set(row.OrderDate, (map.get(row.OrderDate) ?? 0) + row.Revenue);
  });

  return [...map.entries()]
    .map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTopProducts(rows: RecordRow[]): TopProduct[] {
  const map = new Map<string, { category: string; totalQuantity: number; totalRevenue: number }>();

  rows.forEach((row) => {
    const existing = map.get(row.ProductName);
    if (!existing) {
      map.set(row.ProductName, {
        category: row.Category,
        totalQuantity: row.Quantity,
        totalRevenue: row.Revenue
      });
      return;
    }

    existing.totalQuantity += row.Quantity;
    existing.totalRevenue += row.Revenue;
  });

  return [...map.entries()]
    .map(([productName, value]) => ({
      productName,
      category: value.category,
      totalQuantity: value.totalQuantity,
      totalRevenue: Number(value.totalRevenue.toFixed(2))
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 20);
}

export function getPredictions(): PredictionPoint[] {
  const filePath = path.join(projectRoot(), "data", "processed", "predictions.json");
  if (!fs.existsSync(filePath)) return buildFallbackPredictions(30);

  try {
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
    const normalized = normalizePredictionData(json);
    return normalized.length > 0 ? normalized : buildFallbackPredictions(30);
  } catch {
    return buildFallbackPredictions(30);
  }
}

function normalizePredictionData(raw: unknown): PredictionPoint[] {
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

function buildFallbackPredictions(days: number): PredictionPoint[] {
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
