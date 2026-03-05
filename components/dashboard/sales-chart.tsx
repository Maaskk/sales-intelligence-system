"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Line, ComposedChart } from "recharts"
import type { SalesData, PredictionResult } from "@/lib/types"

interface SalesChartProps {
  salesData: SalesData[]
  predictions: PredictionResult[]
}

export function SalesChart({ salesData, predictions }: SalesChartProps) {
  const chartData = useMemo(() => {
    // Aggregate sales by date
    const dailySales: Record<string, number> = {}
    salesData.forEach((s) => {
      const date = s.date.split("T")[0]
      dailySales[date] = (dailySales[date] || 0) + s.total_sales
    })

    // Create historical data points
    const historical = Object.entries(dailySales)
      .map(([date, sales]) => ({
        date,
        actual: sales,
        predicted: null as number | null,
        lower: null as number | null,
        upper: null as number | null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Add predictions
    const predictionData = predictions.map((p) => ({
      date: p.date,
      actual: null as number | null,
      predicted: p.predicted_sales,
      lower: p.confidence_lower,
      upper: p.confidence_upper,
    }))

    // Combine and ensure no duplicates at the boundary
    const combined = [...historical.slice(-60), ...predictionData]
    const uniqueData = combined.reduce((acc, item) => {
      const existing = acc.find(x => x.date === item.date)
      if (existing) {
        // Merge if same date (boundary case)
        if (item.actual !== null) existing.actual = item.actual
        if (item.predicted !== null) existing.predicted = item.predicted
        if (item.lower !== null) existing.lower = item.lower
        if (item.upper !== null) existing.upper = item.upper
      } else {
        acc.push(item)
      }
      return acc
    }, [] as typeof combined)

    return uniqueData.sort((a, b) => a.date.localeCompare(b.date))
  }, [salesData, predictions])

  const chartConfig = {
    actual: {
      label: "Actual Sales",
      color: "hsl(215, 70%, 50%)",
    },
    predicted: {
      label: "Predicted Sales",
      color: "hsl(150, 60%, 45%)",
    },
    confidence: {
      label: "Confidence Range",
      color: "hsl(150, 60%, 45%)",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend & Forecast</CardTitle>
        <CardDescription>
          Historical sales data with ML predictions for the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(215, 70%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(215, 70%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === "actual" ? "Actual" : "Predicted",
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="hsl(215, 70%, 50%)"
              strokeWidth={2}
              fill="url(#colorActual)"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(150, 60%, 45%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorPredicted)"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="hsl(150, 60%, 45%)"
              strokeWidth={1}
              strokeOpacity={0.3}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="hsl(150, 60%, 45%)"
              strokeWidth={1}
              strokeOpacity={0.3}
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(215,70%,50%)]" />
            <span className="text-muted-foreground">Historical Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(150,60%,45%)]" />
            <span className="text-muted-foreground">ML Predictions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
