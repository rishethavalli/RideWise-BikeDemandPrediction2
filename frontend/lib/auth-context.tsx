"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface RegisteredUser {
  name: string
  email: string
  phone: string
  password: string
}

type SignupResult = { success: true } | { success: false; error: string }
type LoginResult = { success: true } | { success: false; error: string }

type AuthContextType = {
  isLoggedIn: boolean
  login: (email: string, password: string) => LoginResult
  signup: (name: string, email: string, phone: string, password: string) => SignupResult
  logout: () => void
  userEmail: string | null
  userName: string | null
  userPhone: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("ridewise_users")
  return users ? JSON.parse(users) : []
}

function saveRegisteredUsers(users: RegisteredUser[]) {
  localStorage.setItem("ridewise_users", JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const authState = localStorage.getItem("ridewise_auth")
    const savedEmail = localStorage.getItem("ridewise_email")
    const savedName = localStorage.getItem("ridewise_name")
    const savedPhone = localStorage.getItem("ridewise_phone")
    if (authState === "true") {
      setIsLoggedIn(true)
      setUserEmail(savedEmail)
      setUserName(savedName)
      setUserPhone(savedPhone)
    }
  }, [])

  useEffect(() => {
    const protectedRoutes = [
      "/welcome",
      "/predict",
      "/insights",
      "/assistant",
      "/reviews",
      "/about",
      "/profile",
      "/pdf-predictor",
    ]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !isLoggedIn) {
      router.push("/login")
    }
  }, [pathname, isLoggedIn, router])

  const signup = (name: string, email: string, phone: string, password: string): SignupResult => {
    const users = getRegisteredUsers()

    // Check if email already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." }
    }

    // Register new user
    const newUser: RegisteredUser = { name, email, phone, password }
    users.push(newUser)
    saveRegisteredUsers(users)

    // Auto-login after signup
    setIsLoggedIn(true)
    setUserEmail(email)
    setUserName(name)
    setUserPhone(phone)
    localStorage.setItem("ridewise_auth", "true")
    localStorage.setItem("ridewise_email", email)
    localStorage.setItem("ridewise_name", name)
    localStorage.setItem("ridewise_phone", phone)
    
    // Trigger custom event to sync user context
    window.dispatchEvent(new Event("ridewise_user_updated"))

    return { success: true }
  }

  const login = (email: string, password: string): LoginResult => {
    const users = getRegisteredUsers()

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { success: false, error: "Account not found. Please sign up first." }
    }

    // Check password
    if (user.password !== password) {
      return { success: false, error: "Incorrect email or password." }
    }

    // Login successful
    setIsLoggedIn(true)
    setUserEmail(user.email)
    setUserName(user.name)
    setUserPhone(user.phone || "")
    localStorage.setItem("ridewise_auth", "true")
    localStorage.setItem("ridewise_email", user.email)
    localStorage.setItem("ridewise_name", user.name)
    localStorage.setItem("ridewise_phone", user.phone || "")
    
    // Trigger custom event to sync user context
    window.dispatchEvent(new Event("ridewise_user_updated"))

    return { success: true }
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUserEmail(null)
    setUserName(null)
    setUserPhone(null)
    localStorage.removeItem("ridewise_auth")
    localStorage.removeItem("ridewise_email")
    localStorage.removeItem("ridewise_name")
    localStorage.removeItem("ridewise_phone")
    
    // Trigger custom event to sync user context
    window.dispatchEvent(new Event("ridewise_user_updated"))
    
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, signup, logout, userEmail, userName, userPhone }}>
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
