"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Settings, Bell, Download, Moon, Sun, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/components/notification-provider"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { notifications, markAsRead, dismissNotification, clearAll } = useNotifications()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showNotifications, setShowNotifications] = useState(true)
  const [mounted, setMounted] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "sales_report.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">RetailPro Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Intelligent Sales Forecasting System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onDismiss={dismissNotification}
              onClearAll={clearAll}
            />
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Dashboard Settings</DialogTitle>
                  <DialogDescription>
                    Customize your dashboard experience and preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="dark-mode" className="text-sm font-medium">
                      Dark Mode
                    </Label>
                    <Switch
                      id="dark-mode"
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-refresh" className="text-sm font-medium">
                      Auto Refresh Data
                    </Label>
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications" className="text-sm font-medium">
                      Show Notifications
                    </Label>
                    <Switch
                      id="notifications"
                      checked={showNotifications}
                      onCheckedChange={setShowNotifications}
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Legacy Sales Data: 2,000 records</p>
                      <p>• Rossmann Store Data: 10,000 records</p>
                      <p>• XGBoost Model: Active</p>
                      <p>• Last Updated: Real-time</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Model Information</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Algorithm: XGBoost</p>
                      <p>• Accuracy: 94.8% R²</p>
                      <p>• Training Samples: 844,392</p>
                      <p>• Dataset: Rossmann Store Sales</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
            <div className="hidden sm:block text-sm text-muted-foreground">
              admin@retailpro.com
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
