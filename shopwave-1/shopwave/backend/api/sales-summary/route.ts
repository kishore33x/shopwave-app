import { filterRows, getRows, summary } from "../dataService";

export function getSalesSummary(params: {
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
}) {
  const rows = filterRows(getRows(), params.startDate, params.endDate, params.category);
  return summary(rows);
}
