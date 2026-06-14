import { useState, useEffect, useCallback } from "react"
import API from "../utils/api"

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    ...initialParams
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined))
      ).toString()

      const { data } = await API.get(`/products?${queryString}`)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }))
  }

  const changePage = (page) => {
    setParams(prev => ({ ...prev, page }))
  }

  return { products, pagination, loading, error, params, updateParams, changePage, refetch: fetchProducts }
}