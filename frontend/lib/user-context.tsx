"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  name: string
  email: string
  phone: string
  role: string
  avatar?: string
}

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Function to load user data from localStorage
    const loadUserData = () => {
      const authState = localStorage.getItem("ridewise_auth")
      if (authState === "true") {
        const name = localStorage.getItem("ridewise_name") || ""
        const email = localStorage.getItem("ridewise_email") || ""
        const phone = localStorage.getItem("ridewise_phone") || ""
        
        if (name && email) {
          const userData: User = {
            name,
            email,
            phone,
            role: "RideWise User",
          }
          setUser(userData)
        }
      } else {
        setUser(null)
      }
    }
    
    // Load user data on mount
    loadUserData()
    
    // Listen for custom event from auth-context
    window.addEventListener("ridewise_user_updated", loadUserData)
    
    // Listen for storage changes to sync across tabs
    window.addEventListener("storage", loadUserData)
    
    return () => {
      window.removeEventListener("ridewise_user_updated", loadUserData)
      window.removeEventListener("storage", loadUserData)
    }
  }, [])

  const updateUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem("ridewise_user", JSON.stringify(newUser))
    } else {
      localStorage.removeItem("ridewise_user")
    }
  }

  return <UserContext.Provider value={{ user, setUser: updateUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
