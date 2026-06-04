import { filterRows, getRows, salesTrends } from "../dataService";

export function getSalesTrends(params: {
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
}) {
  const rows = filterRows(getRows(), params.startDate, params.endDate, params.category);
  return salesTrends(rows);
}
