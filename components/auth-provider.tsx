"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status on mount
    const auth = localStorage.getItem("isAuthenticated")
    const userData = localStorage.getItem("user")
    
    if (auth === "true" && userData) {
      setUser(JSON.parse(userData))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple authentication logic
    if (email === "admin@retailpro.com" && password === "admin123") {
      const userData = { email, role: "admin" }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
