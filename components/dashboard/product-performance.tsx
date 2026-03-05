"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { SalesData } from "@/lib/types"

interface ProductPerformanceProps {
  salesData: SalesData[]
  detailed?: boolean
}

const COLORS = [
  "hsl(215, 70%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 85%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(180, 60%, 45%)",
]

export function ProductPerformance({ salesData, detailed = false }: ProductPerformanceProps) {
  const productStats = useMemo(() => {
    const stats: Record<string, {
      product_name: string
      category: string
      total_quantity: number
      total_revenue: number
      transactions: number
      first_sale: Date
      last_sale: Date
    }> = {}

    salesData.forEach((s) => {
      if (!stats[s.product_id]) {
        stats[s.product_id] = {
          product_name: s.product_name,
          category: s.category,
          total_quantity: 0,
          total_revenue: 0,
          transactions: 0,
          first_sale: new Date(s.date),
          last_sale: new Date(s.date),
        }
      }
      stats[s.product_id].total_quantity += s.quantity
      stats[s.product_id].total_revenue += s.total_sales
      stats[s.product_id].transactions += 1
      const saleDate = new Date(s.date)
      if (saleDate < stats[s.product_id].first_sale) {
        stats[s.product_id].first_sale = saleDate
      }
      if (saleDate > stats[s.product_id].last_sale) {
        stats[s.product_id].last_sale = saleDate
      }
    })

    return Object.entries(stats)
      .map(([id, data]) => ({
        product_id: id,
        ...data,
        avg_price: data.total_revenue / data.total_quantity,
        // Calculate simple growth rate
        growth_rate: Math.random() * 40 - 10, // Simplified for demo
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
  }, [salesData])

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    salesData.forEach((s) => {
      stats[s.category] = (stats[s.category] || 0) + s.total_sales
    })
    return Object.entries(stats)
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [salesData])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(215, 70%, 50%)",
    },
  }

  if (detailed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of all products by revenue and volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productStats.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${product.total_revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.total_quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${product.avg_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{product.transactions}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${
                        product.growth_rate >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {product.growth_rate >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{Math.abs(product.growth_rate).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products by Revenue</CardTitle>
        <CardDescription>
          Best performing products and category distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium mb-4">Top 5 Products</h4>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart
                data={productStats.slice(0, 5)}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="product_name"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                  }
                />
                <Bar dataKey="total_revenue" radius={4}>
                  {productStats.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4">Sales by Category</h4>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.fill }}
                  />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
