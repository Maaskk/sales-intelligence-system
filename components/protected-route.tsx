"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      setIsAuthenticated(isLoggedIn)
      setIsLoading(false)
      
      if (!isLoggedIn) {
        router.push("/please-login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to please-login page
  }

  return <>{children}</>
}
