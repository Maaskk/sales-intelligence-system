export interface SalesData {
  id: string
  date: string
  product_id: string
  product_name: string
  category: string
  region: string
  quantity: number
  unit_price: number
  total_sales: number
  customer_segment: string
  promotion: boolean
  day_of_week: number
  month: number
  year: number
  quarter: number
}

export interface PredictionResult {
  date: string
  predicted_sales: number
  confidence_lower: number
  confidence_upper: number
  trend: "up" | "down" | "stable"
}

export interface ModelInfo {
  model_type: string
  algorithm: string
  features: string[]
  training_date: string
  metrics: {
    mae: number
    rmse: number
    r2_score: number
    mape: number
  }
  training_samples: number
  test_samples: number
  feature_importance: Record<string, number>
}

export interface ProductStats {
  product_id: string
  product_name: string
  category: string
  total_quantity: number
  total_revenue: number
  avg_price: number
  growth_rate: number
}

export interface RegionStats {
  region: string
  total_sales: number
  total_quantity: number
  avg_order_value: number
  top_product: string
  growth_rate: number
}

export interface KPIData {
  total_revenue: number
  total_orders: number
  avg_order_value: number
  predicted_next_month: number
  revenue_growth: number
  top_product: string
}
