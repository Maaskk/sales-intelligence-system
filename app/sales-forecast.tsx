"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ProtectedRoute } from "@/components/protected-route"
import { useNotifications } from "@/components/notification-provider"
import { TrendingUp, BarChart3, DollarSign, Package, MapPin } from "lucide-react"

interface ChartData {
  date: string
  historical: number | null
  predicted: number | null
}

export default function SalesForecastPage() {
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("electronics")
  const [selectedRegion, setSelectedRegion] = useState<string>("north")
  const [selectedProduct, setSelectedProduct] = useState<string>("laptop")
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadForecastData()
  }, [selectedCategory, selectedRegion, selectedProduct])

  const loadForecastData = async () => {
    try {
      setLoading(true)
      const data: ChartData[] = []
      const today = new Date()
      
      // Historical data (last 30 days)
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toISOString().split("T")[0],
          historical: Math.round(8000 + Math.random() * 4000),
          predicted: null
        })
      }
      
      // Predicted data (next 30 days) - GREEN PREDICTIONS
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)
        const basePrediction = 10000 + Math.random() * 3000
        data.push({
          date: date.toISOString().split("T")[0],
          historical: null,
          predicted: Math.round(basePrediction)
        })
      }
      
      setChartData(data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewForecast = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newData = chartData.map(item => {
        if (item.predicted !== null) {
          return {
            ...item,
            predicted: Math.round(9000 + Math.random() * 4000)
          }
        }
        return item
      })
      
      setChartData(newData)
      
      addNotification({
        type: "milestone",
        title: "New Forecast Generated!",
        message: `${selectedCategory} in ${selectedRegion} region`,
      })
    } catch (error) {
      console.error("Error generating forecast:", error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p>Loading forecast...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
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

            {/* Simple Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Forecast</CardTitle>
                <CardDescription>Select category, region, and product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north">North</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="watch">Watch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ML Prediction Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Sales Prediction
                </CardTitle>
                <CardDescription>
                  <span className="text-blue-600">● Historical</span> → 
                  <span className="text-green-600"> ● AI Predictions</span>
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
                      formatter={(value: any, name: any) => [
                        `$${Number(value).toLocaleString()}`,
                        name === "historical" ? "Historical" : "AI Predicted"
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="hsl(215, 70%, 50%)"
                      strokeWidth={3}
                      dot={false}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(150, 60%, 45%)"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={false}
                      connectNulls={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Category</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{selectedCategory}</div>
                  <p className="text-xs text-muted-foreground">Selected Category</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Region</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{selectedRegion}</div>
                  <p className="text-xs text-muted-foreground">Selected Region</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Forecast</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$11,500</div>
                  <p className="text-xs text-muted-foreground">AI Predicted</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={generateNewForecast} size="lg" className="bg-green-600 hover:bg-green-700">
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate New Forecast
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
