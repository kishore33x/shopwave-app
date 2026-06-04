import { categoryPerformance, filterRows, getRows } from "../dataService";

export function getCategoryPerformance(params: {
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
}) {
  const rows = filterRows(getRows(), params.startDate, params.endDate, params.category);
  return categoryPerformance(rows);
}
