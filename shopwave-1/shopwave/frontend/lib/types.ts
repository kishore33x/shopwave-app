export type SalesSummary = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
};

export type CategoryRevenue = {
  category: string;
  revenue: number;
  totalOrders: number;
};

export type DailyRevenue = {
  date: string;
  revenue: number;
};

export type TopProduct = {
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type PredictionPoint = {
  date: string;
  predicted_revenue: number;
};
