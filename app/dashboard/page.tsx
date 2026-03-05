"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { PredictionPanel } from "@/components/dashboard/prediction-panel"
import { ProductPerformance } from "@/components/dashboard/product-performance"
import { RegionalAnalysis } from "@/components/dashboard/regional-analysis"
import { DataTable } from "@/components/dashboard/data-table"
import { ModelMetrics } from "@/components/dashboard/model-metrics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SalesData, PredictionResult, ModelInfo } from "@/lib/types"

import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [salesRes, predRes, modelRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/predictions"),
          fetch("/api/model-info"),
        ])

        if (!salesRes.ok || !predRes.ok || !modelRes.ok) {
          throw new Error("Failed to fetch data from API")
        }

        const [salesJson, predJson, modelJson] = await Promise.all([
          salesRes.json(),
          predRes.json(),
          modelRes.json(),
        ])

        setSalesData(salesJson.data || [])
        setPredictions(predJson.predictions || [])
        setModelInfo(modelJson)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-destructive text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Make sure the ML model is trained and the backend is running.
            Run the Python scripts first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <KPICards salesData={salesData} predictions={predictions} />
          
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
              <TabsTrigger value="model">Model Info</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <SalesChart salesData={salesData} predictions={predictions} />
                <ProductPerformance salesData={salesData} />
              </div>
              <div className="mt-6">
                <DataTable salesData={salesData} />
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="mt-6">
              <PredictionPanel predictions={predictions} salesData={salesData} />
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <ProductPerformance salesData={salesData} detailed />
            </TabsContent>

            <TabsContent value="regions" className="mt-6">
              <RegionalAnalysis salesData={salesData} />
            </TabsContent>

            <TabsContent value="forecast" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Forecast</CardTitle>
                  <CardDescription>
                    Generate detailed ML-based sales predictions with custom parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Advanced Sales Forecasting</h3>
                    <p className="text-muted-foreground mb-6">
                      Create custom forecasts by category, product, or time horizon
                    </p>
                  </div>
                  <div>
                    <Link href="/sales-forecast">
                      <Button size="lg" className="px-8">
                        Go to Sales Forecast
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="model" className="mt-6">
              <ModelMetrics modelInfo={modelInfo} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
