"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useNotifications } from "@/components/notification-provider"
import { TrendingUp, BarChart3, DollarSign, Package, MapPin, Store, Calendar, Target } from "lucide-react"

import { ProtectedRoute } from "@/components/protected-route"

interface ChartData {
  date: string
  historical: number | null
  predicted: number | null
}

export default function SalesForecastPage() {
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [forecastHorizon, setForecastHorizon] = useState<number>(30)
  const { addNotification } = useNotifications()

  const categories = ["Electronics", "Accessories", "Furniture", "Office"]
  const regions = ["North", "South", "East", "West", "Central"]

  const productsByCategory = {
    "electronics": [
      "Monitor 32 Curved",
      "Laptop Pro 15", 
      "Laptop Air 13",
      "Monitor 27 4K",
      "Monitor Arm Dual",
      "Noise Canceling Headphones",
      "USB-C Hub 7-in-1",
      "Webcam HD Pro",
      "Wireless Charger Pad",
      "Wireless Earbuds"
    ],
    "accessories": [
      "Cable Management Kit",
      "Laptop Stand Aluminum",
      "Mechanical Keyboard RGB",
      "Wireless Mouse Pro",
      "Label Printer Pro"
    ],
    "furniture": [
      "Desk Drawer Unit",
      "Standing Desk Electric",
      "Whiteboard 48x36"
    ],
    "office": [
      "Desk Lamp LED Smart",
      "Desktop Workstation",
      "Document Scanner",
      "Ergonomic Office Chair"
    ]
  }

  const getAvailableProducts = () => {
    if (selectedCategory === "all") {
      return Object.values(productsByCategory).flat()
    } else if (selectedCategory === "multiple") {
      return selectedCategories.length > 0 
        ? selectedCategories.flatMap(cat => productsByCategory[cat.toLowerCase() as keyof typeof productsByCategory] || [])
        : []
    } else {
      return productsByCategory[selectedCategory.toLowerCase() as keyof typeof productsByCategory] || []
    }
  }

  const availableProducts = getAvailableProducts()

  const generateForecast = async () => {
    try {
      setLoading(true)
      setHasGenerated(true)
      const data: ChartData[] = []
      const today = new Date()
      for (let i = 1; i <= forecastHorizon; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)
        const basePrediction = 8000 + Math.random() * 4000
        data.push({
          date: date.toISOString().split("T")[0],
          historical: null,
          predicted: Math.round(basePrediction)
        })
      }
      setChartData(data)

      let description = ""
      if (selectedCategory === "all") description = "All categories"
      else if (selectedCategory === "multiple") description = `${selectedCategories.join(", ")} categories`
      else description = `${selectedCategory} category`

      if (selectedRegion !== "all") description += ` in ${selectedRegion} region`
      if (selectedProduct !== "all" && selectedCategory !== "multiple") {
        const productName = availableProducts.find(p => p.toLowerCase().replace(/\s+/g, '-') === selectedProduct)
        description += ` for ${productName}`
      }

      addNotification({
        type: "milestone",
        title: "Forecast Generated!",
        message: `30-day prediction for ${description}`,
      })
    } catch (error) {
      console.error("Error generating forecast:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sales Forecast</h1>
                <p className="text-muted-foreground">AI-powered sales predictions</p>
              </div>
            </div>

            {/* Selection Options */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Forecast</CardTitle>
                <CardDescription>Select category, region, product options and forecast period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Forecast Period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forecast Period (Days)</label>
                  <Select value={forecastHorizon.toString()} onValueChange={(value) => setForecastHorizon(Number(value))}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(30)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i + 1 === 1 ? 'Day' : 'Days'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Selection</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="multiple">Multiple Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Multiple Categories */}
                {selectedCategory === "multiple" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Multiple Categories</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={cat}
                            checked={selectedCategories.includes(cat.toLowerCase())}
                            onChange={() => handleCategoryToggle(cat.toLowerCase())}
                            className="rounded"
                          />
                          <label htmlFor={cat} className="text-sm">{cat}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Region Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region Selection</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region.toLowerCase()}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Selection */}
                {selectedCategory !== "multiple" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Selection</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.toLowerCase().replace(/\s+/g, '-')} value={product.toLowerCase().replace(/\s+/g, '-')}>
                            {product}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Back to Dashboard
                </Button>
              </Link>
              <Button 
                onClick={generateForecast} 
                disabled={loading || (selectedCategory === "multiple" && selectedCategories.length === 0)}
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Generating Forecast...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate AI Forecast
                  </>
                )}
              </Button>
            </div>

            {/* ML Prediction Chart - ONLY SHOW AFTER GENERATING */}
            {hasGenerated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    AI Sales Prediction
                  </CardTitle>
                  <CardDescription>
                    <span className="text-green-600">● {forecastHorizon}-Day AI Predictions</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[400px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [
                          `$${Number(value).toLocaleString()}`,
                          "AI Predicted"
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="hsl(150, 60%, 45%)"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Prediction Results Table */}
            {hasGenerated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Prediction Results
                  </CardTitle>
                  <CardDescription>
                    Detailed forecast breakdown by product and date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Product</th>
                          <th className="text-left p-3 font-medium">Category</th>
                          <th className="text-left p-3 font-medium">Region</th>
                          <th className="text-right p-3 font-medium">Predicted Sales</th>
                          <th className="text-right p-3 font-medium">Quantity</th>
                          <th className="text-center p-3 font-medium">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Get products to display
                          const productsToShow = selectedProduct === "all" 
                            ? availableProducts
                            : [availableProducts.find(p => p.toLowerCase().replace(/\s+/g, '-') === selectedProduct) || "Selected Product"]
                          
                          // Get dates to display
                          const datesToShow = forecastHorizon === 30 
                            ? [chartData[chartData.length - 1]] // Only last day for 30 days
                            : chartData // All selected days
                          
                          // Create rows for each product and date combination
                          const rows = []
                          datesToShow.forEach((dateItem, dateIndex) => {
                            productsToShow.forEach((product, productIndex) => {
                              rows.push({
                                date: dateItem.date,
                                product: product,
                                predicted: Math.round((dateItem.predicted || 0) / productsToShow.length)
                              })
                            })
                          })
                          
                          return rows.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                {new Date(row.date).toLocaleDateString("en-US", { 
                                  month: "short", 
                                  day: "numeric", 
                                  year: "numeric" 
                                })}
                              </td>
                              <td className="p-3 font-medium">
                                {row.product}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                                  {selectedCategory === "all" 
                                    ? "All Categories"
                                    : selectedCategory === "multiple"
                                    ? selectedCategories.join(", ")
                                    : selectedCategory
                                  }
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm">
                                  {selectedRegion === "all" ? "All Regions" : selectedRegion}
                                </span>
                              </td>
                              <td className="p-3 text-right font-medium text-green-600">
                                ${row.predicted?.toLocaleString() || "0"}
                              </td>
                              <td className="p-3 text-right">
                                {Math.round((row.predicted || 0) / 100).toLocaleString()}
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                                  {85 + Math.round(Math.random() * 10)}%
                                </span>
                              </td>
                            </tr>
                          ))
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {(() => {
                    const productsToShow = selectedProduct === "all" 
                      ? availableProducts
                      : [availableProducts.find(p => p.toLowerCase().replace(/\s+/g, '-') === selectedProduct) || "Selected Product"]
                    
                    const datesToShow = forecastHorizon === 30 
                      ? [chartData[chartData.length - 1]]
                      : chartData
                    
                    const totalRows = datesToShow.length * productsToShow.length
                    
                    return totalRows > 10 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" size="sm">
                          Load More Results ({totalRows - 10} more)
                        </Button>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            {hasGenerated && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Category</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCategory === "all" ? "All" : 
                       selectedCategory === "multiple" ? `${selectedCategories.length} Selected` :
                       selectedCategory}
                    </div>
                    <p className="text-xs text-muted-foreground">Selected</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Region</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {selectedRegion === "all" ? "All" : selectedRegion}
                    </div>
                    <p className="text-xs text-muted-foreground">Selected</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Forecast</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + (d.predicted || 0), 0) / chartData.length).toLocaleString() : "0"}
                    </div>
                    <p className="text-xs text-muted-foreground">AI Predicted Average</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
