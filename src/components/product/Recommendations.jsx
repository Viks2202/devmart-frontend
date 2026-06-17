import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiZap } from "react-icons/fi"
import API from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import ProductCard from "./ProductCard"
import Spinner from "../common/Spinner"

export default function Recommendations() {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true)
      try {
        if (isAuthenticated) {
          // Logged in: personalized recommendations
          const { data: res } = await API.get("/products/recommendations")
          setData(res)
        } else {
          // Not logged in: show popular/newest products
          const { data: res } = await API.get("/products?limit=8&sort=newest")
          setData({
            basedOn: "Popular products",
            count: res.products?.length || 0,
            recommendations: res.products || []
          })
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [isAuthenticated])

  if (loading) return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <Spinner size="md" className="py-10" />
      </div>
    </section>
  )

  if (!data || data.count === 0) return null

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <FiZap className="text-white" size={14} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {isAuthenticated ? "Recommended for You" : "You Might Like"}
              </h2>
            </div>
            <p className="text-sm text-gray-500 ml-9">
              {data?.basedOn}
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.recommendations?.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}