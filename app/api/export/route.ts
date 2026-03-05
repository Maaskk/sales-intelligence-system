import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    const dataPath = join(process.cwd(), "ml", "data", "sales_data.json")
    
    let data = []
    
    if (existsSync(dataPath)) {
      const fileContent = readFileSync(dataPath, "utf-8")
      data = JSON.parse(fileContent)
    } else {
      // Generate demo data
      data = generateDemoData()
    }

    // Convert to CSV
    const csv = convertToCSV(data)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=sales_report.csv",
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header]
      // Handle strings with commas
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`
      }
      return String(value)
    }).join(",")
  )

  return [headers.join(","), ...rows].join("\n")
}

function generateDemoData() {
  const products = [
    { id: "P001", name: "Laptop Pro 15", category: "Electronics", price: 1299 },
    { id: "P002", name: "Wireless Mouse", category: "Accessories", price: 49 },
    { id: "P003", name: "USB-C Hub", category: "Accessories", price: 79 },
    { id: "P004", name: "Monitor 27 4K", category: "Electronics", price: 549 },
    { id: "P005", name: "Mechanical Keyboard", category: "Accessories", price: 159 },
  ]

  const regions = ["North", "South", "East", "West", "Central"]
  const segments = ["Consumer", "Business", "Enterprise"]

  const data = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + Math.floor(Math.random() * 365))
    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.floor(Math.random() * 10) + 1
    const hasPromotion = Math.random() > 0.7

    data.push({
      id: `S${String(i + 1).padStart(5, "0")}`,
      date: date.toISOString().split("T")[0],
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      region: regions[Math.floor(Math.random() * regions.length)],
      quantity: quantity,
      unit_price: product.price,
      total_sales: quantity * product.price,
      customer_segment: segments[Math.floor(Math.random() * segments.length)],
      promotion: hasPromotion,
    })
  }

  return data
}
