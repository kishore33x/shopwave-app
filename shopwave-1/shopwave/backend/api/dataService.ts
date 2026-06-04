import fs from "fs";
import path from "path";

export type TxRow = {
  OrderID: string;
  ProductName: string;
  Category: string;
  Quantity: number;
  Price: number;
  Revenue: number;
  OrderDate: string;
};

function rootDir() {
  return path.resolve(process.cwd(), "..");
}

function readCsv(filePath: string): TxRow[] {
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  const [header, ...lines] = raw.split(/\r?\n/);
  if (!header || lines.length === 0) return [];

  const cols = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    const row = Object.fromEntries(cols.map((c, i) => [c, values[i]])) as Record<string, string>;

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

export function getRows(): TxRow[] {
  const cleaned = path.join(rootDir(), "data", "ecommerce_dataset_cleaned.csv");
  const raw = path.join(rootDir(), "data", "ecommerce_dataset.csv");
  if (fs.existsSync(cleaned)) return readCsv(cleaned);
  if (fs.existsSync(raw)) return readCsv(raw);
  return [];
}

export function filterRows(rows: TxRow[], startDate?: string | null, endDate?: string | null, category?: string | null): TxRow[] {
  return rows.filter((row) => {
    const date = new Date(row.OrderDate);
    if (Number.isNaN(date.getTime())) return false;

    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate)) return false;
    if (category && row.Category !== category) return false;

    return true;
  });
}

export function summary(rows: TxRow[]) {
  const totalRevenue = rows.reduce((acc, r) => acc + r.Revenue, 0);
  const totalOrders = new Set(rows.map((r) => r.OrderID)).size;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    averageOrderValue: Number((totalRevenue / Math.max(totalOrders, 1)).toFixed(2))
  };
}

export function categoryPerformance(rows: TxRow[]) {
  const map = new Map<string, number>();
  rows.forEach((row) => map.set(row.Category, (map.get(row.Category) ?? 0) + row.Revenue));

  return [...map.entries()]
    .map(([category, revenue]) => ({ category, revenue: Number(revenue.toFixed(2)) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function salesTrends(rows: TxRow[]) {
  const map = new Map<string, number>();
  rows.forEach((row) => map.set(row.OrderDate, (map.get(row.OrderDate) ?? 0) + row.Revenue));

  return [...map.entries()]
    .map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function topProducts(rows: TxRow[]) {
  const map = new Map<string, { category: string; totalQuantity: number; totalRevenue: number }>();

  rows.forEach((row) => {
    const prev = map.get(row.ProductName);
    if (!prev) {
      map.set(row.ProductName, {
        category: row.Category,
        totalQuantity: row.Quantity,
        totalRevenue: row.Revenue
      });
      return;
    }

    prev.totalQuantity += row.Quantity;
    prev.totalRevenue += row.Revenue;
  });

  return [...map.entries()]
    .map(([productName, data]) => ({
      productName,
      category: data.category,
      totalQuantity: data.totalQuantity,
      totalRevenue: Number(data.totalRevenue.toFixed(2))
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 20);
}

export function predictions() {
  const filePath = path.join(rootDir(), "data", "processed", "predictions.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
