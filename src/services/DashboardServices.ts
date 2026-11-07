import api from "@/services/api";

export type DashboardRange = "today" | "week" | "month" | "year";

export interface KpiValue {
  value: number;
  previous: number;
  change_pct: number | null;
}

export interface DashboardModel {
  range: DashboardRange;
  period: { from: string; to: string; prev_from: string; prev_to: string };

  kpis: {
    revenue: KpiValue;
    orders: KpiValue;
    avg_order_value: KpiValue;
    net_profit: KpiValue;
    new_customers: KpiValue;
    pending_orders: number;
  };

  revenue_vs_expenses: { label: string; revenue: number; expenses: number }[];

  orders_by_status: { status: string; count: number }[];

  sales_by_category: {
    category_id: string;
    category_name: string;
    category_name_ar: string;
    revenue: number;
    percent: number;
  }[];

  top_products: {
    id: string;
    product_name: string;
    product_name_ar: string;
    category_name: string;
    image: string | null;
    units_sold: number;
    revenue: number;
  }[];

  low_stock: {
    id: string;
    product_name: string;
    product_name_ar: string;
    image: string | null;
    stock_qty: number;
    days_left: number | null;
  }[];

  recent_orders: {
    id: string;
    created_at: string;
    total: number;
    status: string;
    user: { id: string; first_name: string; last_name: string };
    area: { id: string; area_name: string; area_name_ar: string };
  }[];

  sales_by_area: {
    area_id: string;
    area_name: string;
    area_name_ar: string;
    city_name: string;
    orders: number;
    revenue: number;
  }[];

  reviews: {
    average: number;
    count: number;
    new_today: number;
    latest: {
      id: string;
      rate: string;
      review: string;
      created_at: string;
      user: { first_name: string; last_name: string };
    }[];
  };
}

export const getDashboard = async (range: DashboardRange): Promise<DashboardModel> => {
  const response = await api.get(`/admin_apis/dashboard/`, { params: { range } });
  return response.data["data"];
};