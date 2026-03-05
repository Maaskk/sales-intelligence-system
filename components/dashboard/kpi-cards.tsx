"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Target, Package } from "lucide-react"
import type { SalesData, PredictionResult } from "@/lib/types"

interface KPICardsProps {
  salesData: SalesData[]
  predictions: PredictionResult[]
}

export function KPICards({ salesData, predictions }: KPICardsProps) {
  const kpis = useMemo(() => {
    if (!salesData.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        predictedNextMonth: 0,
        revenueGrowth: 0,
        topProduct: "N/A",
      }
    }

    const totalRevenue = salesData.reduce((sum, s) => sum + s.total_sales, 0)
    const totalOrders = salesData.length
    const avgOrderValue = totalRevenue / totalOrders

    // Calculate growth (compare last month to previous month)
    const sortedByDate = [...salesData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const lastMonth = sortedByDate.slice(-30)
    const prevMonth = sortedByDate.slice(-60, -30)
    
    const lastMonthRevenue = lastMonth.reduce((sum, s) => sum + s.total_sales, 0)
    const prevMonthRevenue = prevMonth.reduce((sum, s) => sum + s.total_sales, 0)
    const revenueGrowth = prevMonthRevenue > 0 
      ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : 0

    // Get predicted next month
    const predictedNextMonth = predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.predicted_sales, 0)
      : 0

    // Find top product
    const productSales: Record<string, number> = {}
    salesData.forEach((s) => {
      productSales[s.product_name] = (productSales[s.product_name] || 0) + s.total_sales
    })
    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      predictedNextMonth,
      revenueGrowth,
      topProduct,
    }
  }, [salesData, predictions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      description: "All-time sales revenue",
      icon: DollarSign,
      trend: kpis.revenueGrowth,
    },
    {
      title: "Total Orders",
      value: kpis.totalOrders.toLocaleString(),
      description: "Total transactions",
      icon: ShoppingCart,
      trend: null,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(kpis.avgOrderValue),
      description: "Average per transaction",
      icon: Target,
      trend: null,
    },
    {
      title: "Predicted (30 days)",
      value: formatCurrency(kpis.predictedNextMonth),
      description: "ML forecasted revenue",
      icon: TrendingUp,
      trend: null,
      highlight: true,
    },
    {
      title: "Top Product",
      value: kpis.topProduct,
      description: "Best performing item",
      icon: Package,
      trend: null,
    },
    {
      title: "Monthly Growth",
      value: `${kpis.revenueGrowth >= 0 ? "+" : ""}${kpis.revenueGrowth.toFixed(1)}%`,
      description: "vs previous month",
      icon: kpis.revenueGrowth >= 0 ? TrendingUp : TrendingDown,
      trend: kpis.revenueGrowth,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={card.highlight ? "border-primary bg-primary/5" : ""}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon
              className={`h-4 w-4 ${
                card.highlight ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={card.value}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
            {card.trend !== null && (
              <div
                className={`flex items-center text-xs mt-2 ${
                  card.trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {card.trend >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(card.trend).toFixed(1)}% from last period
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
