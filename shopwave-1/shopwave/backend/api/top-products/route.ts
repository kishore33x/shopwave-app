import { filterRows, getRows, topProducts } from "../dataService";

export function getTopProducts(params: {
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
}) {
  const rows = filterRows(getRows(), params.startDate, params.endDate, params.category);
  return topProducts(rows);
}
