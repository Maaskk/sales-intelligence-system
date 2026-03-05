import type { SalesData, PredictionResult, ModelInfo } from "./types"

// Generate realistic mock sales data
function generateSalesData(): SalesData[] {
  const products = [
    { id: "P001", name: "Wireless Headphones", category: "Electronics", basePrice: 149.99 },
    { id: "P002", name: "Smart Watch Pro", category: "Electronics", basePrice: 299.99 },
    { id: "P003", name: "Running Shoes", category: "Sports", basePrice: 89.99 },
    { id: "P004", name: "Yoga Mat Premium", category: "Sports", basePrice: 45.99 },
    { id: "P005", name: "Coffee Maker Deluxe", category: "Home", basePrice: 129.99 },
    { id: "P006", name: "LED Desk Lamp", category: "Home", basePrice: 59.99 },
    { id: "P007", name: "Protein Powder", category: "Health", basePrice: 39.99 },
    { id: "P008", name: "Vitamin D3 Supplement", category: "Health", basePrice: 24.99 },
    { id: "P009", name: "Winter Jacket", category: "Clothing", basePrice: 189.99 },
    { id: "P010", name: "Denim Jeans", category: "Clothing", basePrice: 69.99 },
    { id: "P011", name: "Bluetooth Speaker", category: "Electronics", basePrice: 79.99 },
    { id: "P012", name: "Fitness Tracker", category: "Electronics", basePrice: 99.99 },
  ]

  const regions = ["North", "South", "East", "West", "Central"]
  const customerSegments = ["Retail", "Corporate", "Online", "Wholesale"]

  const data: SalesData[] = []
  const startDate = new Date("2024-01-01")
  const endDate = new Date("2025-01-31")

  let idCounter = 1
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const transactionsPerDay = Math.floor(Math.random() * 15) + 10
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const region = regions[Math.floor(Math.random() * regions.length)]
      const segment = customerSegments[Math.floor(Math.random() * customerSegments.length)]
      
      const quantity = Math.floor(Math.random() * 10) + 1
      const priceVariation = 0.9 + Math.random() * 0.2
      const unitPrice = Math.round(product.basePrice * priceVariation * 100) / 100
      const isPromo = Math.random() < 0.2
      const promoDiscount = isPromo ? 0.85 : 1
      
      const currentDate = new Date(d)
      
      data.push({
        id: `S${String(idCounter++).padStart(6, "0")}`,
        date: currentDate.toISOString(),
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        region,
        quantity,
        unit_price: unitPrice,
        total_sales: Math.round(quantity * unitPrice * promoDiscount * 100) / 100,
        customer_segment: segment,
        promotion: isPromo,
        day_of_week: currentDate.getDay(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        quarter: Math.ceil((currentDate.getMonth() + 1) / 3),
      })
    }
  }

  return data
}

// Generate predictions for next 30 days
function generatePredictions(): PredictionResult[] {
  const predictions: PredictionResult[] = []
  const startDate = new Date("2025-02-01")
  
  let baseSales = 12000
  const trend = 1.003

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)
    
    const dayOfWeek = currentDate.getDay()
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1.1
    
    const randomVariation = 0.9 + Math.random() * 0.2
    const predictedSales = Math.round(baseSales * weekendFactor * randomVariation)
    
    const confidenceMargin = predictedSales * 0.15
    
    predictions.push({
      date: currentDate.toISOString().split("T")[0],
      predicted_sales: predictedSales,
      confidence_lower: Math.round(predictedSales - confidenceMargin),
      confidence_upper: Math.round(predictedSales + confidenceMargin),
      trend: randomVariation > 1.05 ? "up" : randomVariation < 0.95 ? "down" : "stable",
    })
    
    baseSales = baseSales * trend
  }

  return predictions
}

// Model information
function getModelInfo(): ModelInfo {
  return {
    model_type: "Regression",
    algorithm: "Random Forest",
    features: [
      "quantity",
      "unit_price",
      "promotion",
      "day_of_week",
      "month",
      "quarter",
      "category_encoded",
      "region_encoded",
      "customer_segment_encoded",
    ],
    training_date: "2025-01-15T10:30:00Z",
    metrics: {
      mae: 487.23,
      rmse: 623.45,
      r2_score: 0.89,
      mape: 5.67,
    },
    training_samples: 4850,
    test_samples: 1212,
    feature_importance: {
      quantity: 0.28,
      unit_price: 0.22,
      promotion: 0.12,
      day_of_week: 0.08,
      month: 0.09,
      quarter: 0.05,
      category_encoded: 0.07,
      region_encoded: 0.05,
      customer_segment_encoded: 0.04,
    },
  }
}

// Cache the generated data
let cachedSalesData: SalesData[] | null = null
let cachedPredictions: PredictionResult[] | null = null
let cachedModelInfo: ModelInfo | null = null

export function getSalesData(): SalesData[] {
  if (!cachedSalesData) {
    cachedSalesData = generateSalesData()
  }
  return cachedSalesData
}

export function getPredictions(): PredictionResult[] {
  if (!cachedPredictions) {
    cachedPredictions = generatePredictions()
  }
  return cachedPredictions
}

export function getModelInfoData(): ModelInfo {
  if (!cachedModelInfo) {
    cachedModelInfo = getModelInfo()
  }
  return cachedModelInfo
}
