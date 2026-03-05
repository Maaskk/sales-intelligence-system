"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, TrendingUp, Brain, Database, Shield, ArrowRight, Moon, Sun, CheckCircle, Users, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  const features = [
    {
      icon: Brain,
      title: "XGBoost Powered",
      description: "Advanced machine learning with 94.8% accuracy for reliable sales predictions"
    },
    {
      icon: Database,
      title: "Dual Dataset Integration",
      description: "12,000+ records combining legacy sales data and Rossmann store analytics"
    },
    {
      icon: TrendingUp,
      title: "Real-time Forecasting",
      description: "30-day predictive analytics with confidence intervals and trend analysis"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Admin-only access with secure authentication and data protection"
    },
    {
      icon: Users,
      title: "Regional Insights",
      description: "Comprehensive geographic analysis across all store locations"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with instant data refresh and real-time updates"
    }
  ]

  const metrics = [
    { value: "94.8%", label: "Model Accuracy" },
    { value: "844K+", label: "Training Samples" },
    { value: "12K", label: "Data Records" },
    { value: "30", label: "Day Forecasts" }
  ]

  const useCases = [
    {
      title: "Sales Planning",
      description: "Forecast future sales with machine learning precision",
      items: ["30-day predictions", "Confidence intervals", "Trend analysis"]
    },
    {
      title: "Performance Analytics",
      description: "Deep insights into product and regional performance",
      items: ["Product rankings", "Regional comparisons", "Category analysis"]
    },
    {
      title: "Data Intelligence",
      description: "Comprehensive analytics with dual dataset power",
      items: ["Legacy + Rossmann data", "Real-time updates", "Export capabilities"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Navigation */}
      <nav className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">RetailPro Analytics</h1>
                <p className="text-sm text-muted-foreground">Intelligent Sales Forecasting</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Advanced Sales Intelligence
              <span className="text-primary"> Platform</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Harness the power of XGBoost machine learning to predict sales, analyze performance, 
              and make data-driven decisions with confidence. Transform your retail analytics with 
              our intelligent forecasting system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{metric.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Powerful Features for Modern Retail
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to transform your sales data into actionable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Built for Retail Excellence
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive tools designed for every aspect of retail analytics
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  <CardDescription className="text-base">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-8">
            Powered by Cutting-Edge Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">XGBoost ML</h3>
              <p className="text-sm text-muted-foreground mt-2">Advanced gradient boosting for superior predictions</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Dual Datasets</h3>
              <p className="text-sm text-muted-foreground mt-2">Legacy + Rossmann data for comprehensive analysis</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Real-time Processing</h3>
              <p className="text-sm text-muted-foreground mt-2">Instant updates and live forecasting capabilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Ready to Transform Your Sales Analytics?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get instant access to powerful forecasting tools and comprehensive analytics. 
              Start making data-driven decisions today.
            </p>
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Access Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">RetailPro Analytics</h3>
                <p className="text-sm text-muted-foreground">Intelligent Sales Forecasting System</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 RetailPro Analytics. Powered by XGBoost Machine Learning.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
