import { useState, useEffect } from "react"
import { FiTrash2 } from "react-icons/fi"
import API from "../utils/api"
import ProductCard from "../components/product/ProductCard"
import Spinner from "../components/common/Spinner"
import EmptyState from "../components/common/EmptyState"
import toast from "react-hot-toast"

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get("/wishlist")
      setProducts(data.wishlist.products || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWishlist() }, [])

  const removeItem = async (productId) => {
    try {
      await API.delete(`/wishlist/item/${productId}`)
      setProducts(prev => prev.filter(p => p._id !== productId))
      toast.success("Removed from wishlist")
    } catch { toast.error("Failed to remove") }
  }

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          My Wishlist ({products.length})
        </h1>
        {products.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Save products you love by clicking the heart icon"
            actionLabel="Browse Products"
            actionLink="/products"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map(product => (
              <div key={product._id} className="relative">
                <ProductCard product={product} />
                <button
                  onClick={() => removeItem(product._id)}
                  className="absolute top-3 left-3 bg-white rounded-full p-1.5 shadow-md text-red-500 hover:bg-red-50 z-10"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}