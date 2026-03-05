"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Brain, Calendar, Database, Target, CheckCircle2, AlertCircle } from "lucide-react"
import type { ModelInfo } from "@/lib/types"

interface ModelMetricsProps {
  modelInfo: ModelInfo | null
}

export function ModelMetrics({ modelInfo }: ModelMetricsProps) {
  if (!modelInfo) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Model Not Available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Train the ML model first by running the training script.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const featureImportanceData = Object.entries(modelInfo.feature_importance)
    .map(([feature, importance]) => ({
      feature: feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      importance: importance * 100,
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10)

  const chartConfig = {
    importance: {
      label: "Importance",
      color: "hsl(215, 70%, 50%)",
    },
  }

  const getMetricStatus = (metric: string, value: number) => {
    switch (metric) {
      case "r2_score":
        return value > 0.8 ? "excellent" : value > 0.6 ? "good" : "needs_improvement"
      case "mape":
        return value < 10 ? "excellent" : value < 20 ? "good" : "needs_improvement"
      default:
        return "good"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Good</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Needs Improvement</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Type</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelInfo.algorithm}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {modelInfo.model_type}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(modelInfo.training_date).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last trained
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Samples</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelInfo.training_samples.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {modelInfo.test_samples.toLocaleString()} test samples
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelInfo.features.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Input variables
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Model Performance Metrics
            </CardTitle>
            <CardDescription>
              Evaluation metrics from test set validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">R² Score (Accuracy)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{(modelInfo.metrics.r2_score * 100).toFixed(1)}%</span>
                  {getStatusBadge(getMetricStatus("r2_score", modelInfo.metrics.r2_score))}
                </div>
              </div>
              <Progress value={modelInfo.metrics.r2_score * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Percentage of variance explained by the model
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MAE (Mean Absolute Error)</span>
                <span className="font-bold">${modelInfo.metrics.mae.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Average prediction error in dollars
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RMSE (Root Mean Square Error)</span>
                <span className="font-bold">${modelInfo.metrics.rmse.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Standard deviation of prediction errors
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MAPE (Mean Absolute % Error)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{modelInfo.metrics.mape.toFixed(1)}%</span>
                  {getStatusBadge(getMetricStatus("mape", modelInfo.metrics.mape))}
                </div>
              </div>
              <Progress value={100 - modelInfo.metrics.mape} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Average percentage deviation from actual values
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>
              Top factors influencing sales predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart
                data={featureImportanceData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" domain={[0, "auto"]} className="text-xs" tickFormatter={(value) => `${value.toFixed(0)}%`} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, "Importance"]}
                    />
                  }
                />
                <Bar dataKey="importance" fill="hsl(215, 70%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features Used for Prediction</CardTitle>
          <CardDescription>
            Input variables the model uses to make predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {modelInfo.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-sm">
                {feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
