"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Eye, EyeOff, Lock, Mail, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simple authentication check
    if (email === "admin@retailpro.com" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true")
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Use admin@retailpro.com / admin123")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">RetailPro Analytics</h1>
              <p className="text-lg text-muted-foreground">Intelligent Sales Forecasting</p>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <h2 className="text-2xl font-semibold text-foreground">Advanced Sales Intelligence Platform</h2>
            <p className="text-base leading-relaxed">
              Harness the power of machine learning with our XGBoost-powered sales forecasting system. 
              Analyze trends, predict future sales, and make data-driven decisions with confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">94.8%</div>
              <div className="text-sm text-muted-foreground">Model Accuracy</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">844K+</div>
              <div className="text-sm text-muted-foreground">Training Samples</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">12K</div>
              <div className="text-sm text-muted-foreground">Data Records</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">30</div>
              <div className="text-sm text-muted-foreground">Day Forecasts</div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Real-time XGBoost Predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Dual Dataset Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Advanced Analytics Dashboard</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@retailpro.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
