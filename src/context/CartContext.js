import { createContext, useContext, useState, useEffect, useCallback } from "react"
import API from "../utils/api"
import { useAuth } from "./AuthContext"

const CartContext = createContext()

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState({ items: [], totalPrice: 0 })
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalPrice: 0 })
      setCartCount(0)
      return
    }
    try {
      setLoading(true)
      const { data } = await API.get("/cart")
      setCart(data.cart || { items: [], totalPrice: 0 })
      setCartCount(data.cart?.items?.length || 0)
    } catch {
      setCart({ items: [], totalPrice: 0 })
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await API.post("/cart/add", { productId, quantity })
    await fetchCart()
    return data
  }

  const updateQuantity = async (productId, quantity) => {
    const { data } = await API.put("/cart/update", { productId, quantity })
    await fetchCart()
    return data
  }

  const removeFromCart = async (productId) => {
    await API.delete(`/cart/item/${productId}`)
    await fetchCart()
  }

  const clearCart = async () => {
    await API.delete("/cart/clear")
    setCart({ items: [], totalPrice: 0 })
    setCartCount(0)
  }

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}