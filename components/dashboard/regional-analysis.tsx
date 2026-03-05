"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp, TrendingDown } from "lucide-react"
import type { SalesData } from "@/lib/types"

interface RegionalAnalysisProps {
  salesData: SalesData[]
}

export function RegionalAnalysis({ salesData }: RegionalAnalysisProps) {
  const regionStats = useMemo(() => {
    const stats: Record<string, {
      total_sales: number
      total_quantity: number
      transactions: number
      products: Record<string, number>
    }> = {}

    salesData.forEach((s) => {
      if (!stats[s.region]) {
        stats[s.region] = {
          total_sales: 0,
          total_quantity: 0,
          transactions: 0,
          products: {},
        }
      }
      stats[s.region].total_sales += s.total_sales
      stats[s.region].total_quantity += s.quantity
      stats[s.region].transactions += 1
      stats[s.region].products[s.product_name] =
        (stats[s.region].products[s.product_name] || 0) + s.total_sales
    })

    return Object.entries(stats)
      .map(([region, data]) => {
        const topProduct = Object.entries(data.products).sort((a, b) => b[1] - a[1])[0]
        return {
          region,
          total_sales: data.total_sales,
          total_quantity: data.total_quantity,
          avg_order_value: data.total_sales / data.transactions,
          transactions: data.transactions,
          top_product: topProduct?.[0] || "N/A",
          growth_rate: Math.random() * 30 - 5, // Simplified for demo
        }
      })
      .sort((a, b) => b.total_sales - a.total_sales)
  }, [salesData])

  const radarData = useMemo(() => {
    const maxSales = Math.max(...regionStats.map((r) => r.total_sales))
    const maxQuantity = Math.max(...regionStats.map((r) => r.total_quantity))
    const maxTransactions = Math.max(...regionStats.map((r) => r.transactions))
    const maxAOV = Math.max(...regionStats.map((r) => r.avg_order_value))

    return regionStats.map((r) => ({
      region: r.region,
      revenue: (r.total_sales / maxSales) * 100,
      volume: (r.total_quantity / maxQuantity) * 100,
      orders: (r.transactions / maxTransactions) * 100,
      aov: (r.avg_order_value / maxAOV) * 100,
    }))
  }, [regionStats])

  const chartConfig = {
    total_sales: {
      label: "Revenue",
      color: "hsl(215, 70%, 50%)",
    },
  }

  const totalRevenue = regionStats.reduce((sum, r) => sum + r.total_sales, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Revenue Distribution
            </CardTitle>
            <CardDescription>
              Sales performance breakdown by geographic region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={regionStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="region" className="text-xs" />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                  }
                />
                <Bar
                  dataKey="total_sales"
                  fill="hsl(215, 70%, 50%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Performance Radar</CardTitle>
            <CardDescription>
              Comparative analysis across key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { metric: "Revenue", ...Object.fromEntries(regionStats.map((r) => [r.region, (r.total_sales / Math.max(...regionStats.map((x) => x.total_sales))) * 100])) },
                { metric: "Volume", ...Object.fromEntries(regionStats.map((r) => [r.region, (r.total_quantity / Math.max(...regionStats.map((x) => x.total_quantity))) * 100])) },
                { metric: "Orders", ...Object.fromEntries(regionStats.map((r) => [r.region, (r.transactions / Math.max(...regionStats.map((x) => x.transactions))) * 100])) },
                { metric: "Avg Order", ...Object.fromEntries(regionStats.map((r) => [r.region, (r.avg_order_value / Math.max(...regionStats.map((x) => x.avg_order_value))) * 100])) },
              ]}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="metric" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                {regionStats.slice(0, 4).map((r, i) => (
                  <Radar
                    key={r.region}
                    name={r.region}
                    dataKey={r.region}
                    stroke={`hsl(${i * 60 + 200}, 70%, 50%)`}
                    fill={`hsl(${i * 60 + 200}, 70%, 50%)`}
                    fillOpacity={0.2}
                  />
                ))}
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Regional Breakdown</CardTitle>
          <CardDescription>
            Complete metrics for each region with top-performing products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Avg Order</TableHead>
                  <TableHead>Top Product</TableHead>
                  <TableHead>Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionStats.map((region) => (
                  <TableRow key={region.region}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {region.region}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${region.total_sales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {((region.total_sales / totalRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {region.total_quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{region.transactions}</TableCell>
                    <TableCell className="text-right">
                      ${region.avg_order_value.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {region.top_product}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${
                          region.growth_rate >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {region.growth_rate >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{Math.abs(region.growth_rate).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
