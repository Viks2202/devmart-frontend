import { createContext, useContext, useState, useEffect, useCallback } from "react"
import API from "../utils/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await API.get("/auth/me")
      setUser(data.user)
    } catch {
      localStorage.removeItem("accessToken")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [fetchMe])

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password })
    localStorage.setItem("accessToken", data.accessToken)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password })
    localStorage.setItem("accessToken", data.accessToken)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try {
      await API.post("/auth/logout")
    } finally {
      localStorage.removeItem("accessToken")
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin"
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}