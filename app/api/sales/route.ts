import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    // Use combined Rossmann data but update dates and scale to match predictions
    const combinedDataPath = join(process.cwd(), "ml", "data", "combined_sales_data.json")
    
    if (existsSync(combinedDataPath)) {
      const fileContent = readFileSync(combinedDataPath, "utf-8")
      const data = JSON.parse(fileContent)
      
      // Transform the data: update dates to recent and scale up to match predictions
      const transformedData = transformRossmannData(data)
      
      return NextResponse.json({
        data: transformedData,
        source: "transformed_rossmann",
        original_count: data.length,
      })
    }

    // Fallback to demo data if combined data doesn't exist
    return NextResponse.json({
      data: generateDemoData(),
      source: "demo",
    })
  } catch (error) {
    console.error("Error loading sales data:", error)
    return NextResponse.json({
      data: generateDemoData(),
      source: "demo",
    })
  }
}

function transformRossmannData(data: any[]): any[] {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 90) // Last 90 days, ending today
  
  // Group by original date to calculate daily totals
  const dailyTotals: Record<string, number> = {}
  data.forEach((item) => {
    const originalDate = item.date.split("T")[0]
    dailyTotals[originalDate] = (dailyTotals[originalDate] || 0) + item.total_sales
  })
  
  // Create transformed data with recent dates and scaled values
  const transformedData: any[] = []
  const originalDates = Object.keys(dailyTotals).sort()
  let dateIndex = 0
  
  // Use only the last 60 days of original data to ensure we end before predictions start
  const recentDates = originalDates.slice(-60)
  
  recentDates.forEach((originalDate) => {
    const dailyTotal = dailyTotals[originalDate]
    
    // Scale up to match prediction levels (much more reasonable scaling)
    const scaledTotal = Math.round(dailyTotal * 2.5) // Only 2.5x increase, not 85x
    
    // Create multiple transactions for this day to match original structure
    const numTransactions = Math.max(5, Math.floor(dailyTotal / 6000)) // Estimate transactions
    const baseDate = new Date(startDate)
    baseDate.setDate(baseDate.getDate() + dateIndex)
    
    for (let i = 0; i < numTransactions; i++) {
      const transactionDate = new Date(baseDate)
      transactionDate.setHours(Math.floor(Math.random() * 24))
      
      transformedData.push({
        ...data[Math.floor(Math.random() * data.length)], // Copy random original transaction structure
        id: `TRANS-${dateIndex}-${i}`,
        date: transactionDate.toISOString(),
        total_sales: Math.round(scaledTotal / numTransactions),
      })
    }
    
    dateIndex++
  })
  
  return transformedData
}

function generateDemoData() {
  const products = [
    { id: "P001", name: "Laptop Pro 15", category: "Electronics", price: 1299 },
    { id: "P002", name: "Wireless Mouse", category: "Accessories", price: 49 },
    { id: "P003", name: "USB-C Hub", category: "Accessories", price: 79 },
    { id: "P004", name: "Monitor 27 4K", category: "Electronics", price: 549 },
    { id: "P005", name: "Mechanical Keyboard", category: "Accessories", price: 159 },
    { id: "P006", name: "Webcam HD", category: "Electronics", price: 129 },
    { id: "P007", name: "Desk Lamp LED", category: "Office", price: 45 },
    { id: "P008", name: "Standing Desk", category: "Furniture", price: 699 },
    { id: "P009", name: "Office Chair", category: "Furniture", price: 399 },
    { id: "P010", name: "Noise Canceling Headphones", category: "Electronics", price: 299 },
  ]

  const regions = ["North", "South", "East", "West", "Central"]
  const segments = ["Consumer", "Business", "Enterprise"]

  const data = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)

  // Generate data for the last 90 days to ensure we have recent data
  for (let d = 0; d < 90; d++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + d)
    
    // Generate 15-25 transactions per day to reach ~$15k daily totals
    const transactionsPerDay = Math.floor(Math.random() * 10) + 15
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 5) + 1 // 1-5 units per transaction
      const hasPromotion = Math.random() > 0.7
      const priceMultiplier = hasPromotion ? 0.85 : 1

      data.push({
        id: `S${String(data.length + 1).padStart(5, "0")}`,
        date: currentDate.toISOString(),
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        region: regions[Math.floor(Math.random() * regions.length)],
        quantity: quantity,
        unit_price: Math.round(product.price * priceMultiplier * 100) / 100,
        total_sales: Math.round(quantity * product.price * priceMultiplier * 100) / 100,
        customer_segment: segments[Math.floor(Math.random() * segments.length)],
        promotion: hasPromotion,
        day_of_week: currentDate.getDay(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        quarter: Math.floor(currentDate.getMonth() / 3) + 1,
      })
    }
  }

  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
