"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Calculator } from "lucide-react"
import type { SalesData, PredictionResult } from "@/lib/types"
import { useNotifications } from "@/components/notification-provider"

interface PredictionPanelProps {
  predictions: PredictionResult[]
  salesData: SalesData[]
}

export function PredictionPanel({ predictions, salesData }: PredictionPanelProps) {
  const [customPrediction, setCustomPrediction] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addNotification } = useNotifications()
  const [formData, setFormData] = useState({
    category: "",
    region: "",
    promotion: "false",
    quantity: "10",
    unit_price: "100",
  })

  const categories = useMemo(() => {
    const cats = new Set(salesData.map((s) => s.category))
    return Array.from(cats)
  }, [salesData])

  const regions = useMemo(() => {
    const regs = new Set(salesData.map((s) => s.region))
    return Array.from(regs)
  }, [salesData])

  const handleCustomPrediction = async () => {
    if (!formData.category || !formData.region) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          region: formData.region,
          promotion: formData.promotion === "true",
          quantity: parseInt(formData.quantity),
          unit_price: parseFloat(formData.unit_price),
        }),
      })

      const data = await response.json()
      setCustomPrediction(data.predicted_sales)
      
      // Add notification for successful prediction
      addNotification({
        type: "milestone",
        title: "Custom Prediction Generated!",
        message: `Predicted $${data.predicted_sales.toLocaleString()} for ${formData.quantity} units of ${formData.category} in ${formData.region} region${formData.promotion === "true" ? " with promotion" : ""}`,
      })
      
    } catch (error) {
      console.error("Prediction failed:", error)
      addNotification({
        type: "system",
        title: "Prediction Failed",
        message: "Unable to generate custom prediction. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "up":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Upward</Badge>
      case "down":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Downward</Badge>
      default:
        return <Badge variant="secondary">Stable</Badge>
    }
  }

  const totalPredicted = predictions.reduce((sum, p) => sum + p.predicted_sales, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>30-Day Sales Forecast</CardTitle>
          <CardDescription>
            ML-generated predictions with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Predicted Sales</TableHead>
                  <TableHead className="text-right">Confidence Range</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.slice(0, 15).map((prediction) => (
                  <TableRow key={prediction.date}>
                    <TableCell className="font-medium">
                      {new Date(prediction.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${prediction.predicted_sales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${prediction.confidence_lower.toLocaleString()} - $
                      {prediction.confidence_upper.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(prediction.trend)}
                        {getTrendBadge(prediction.trend)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4">
            <span className="text-sm font-medium">Total Forecasted (30 days)</span>
            <span className="text-2xl font-bold text-primary">
              ${totalPredicted.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Custom Prediction
          </CardTitle>
          <CardDescription>
            Get a prediction for specific parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Product Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select
              value={formData.region}
              onValueChange={(value) => setFormData({ ...formData, region: value })}
            >
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((reg) => (
                  <SelectItem key={reg} value={reg}>
                    {reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion">Promotion Active</Label>
            <Select
              value={formData.promotion}
              onValueChange={(value) => setFormData({ ...formData, promotion: value })}
            >
              <SelectTrigger id="promotion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCustomPrediction}
            disabled={isLoading || !formData.category || !formData.region}
          >
            {isLoading ? "Calculating..." : "Get Prediction"}
          </Button>

          {customPrediction !== null && (
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">Predicted Sales</p>
              <p className="text-3xl font-bold text-primary">
                ${customPrediction.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
