import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiTrash2, FiShoppingCart } from "react-icons/fi"
import API from "../utils/api"
import Spinner from "../components/common/Spinner"
import EmptyState from "../components/common/EmptyState"
import Button from "../components/common/Button"
import Badge from "../components/common/Badge"
import { useCart } from "../context/CartContext"
import toast from "react-hot-toast"

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [addingCartId, setAddingCartId] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const { data } = await API.get("/wishlist")
      setProducts(data.wishlist?.products || [])
    } catch {
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (productId) => {
    setRemovingId(productId)
    try {
      await API.delete(`/wishlist/item/${productId}`)
      setProducts(prev => prev.filter(p => p._id !== productId))
      toast.success("Removed from wishlist")
    } catch {
      toast.error("Failed to remove")
    } finally {
      setRemovingId(null)
    }
  }

  const addToCartHandler = async (productId) => {
    setAddingCartId(productId)
    try {
      await addToCart(productId, 1)
      toast.success("Added to cart!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart")
    } finally {
      setAddingCartId(null)
    }
  }

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            My Wishlist <span className="text-gray-400 font-normal">({products.length} items)</span>
          </h1>
          {products.length > 0 && (
            <button
              onClick={async () => {
                await API.delete("/wishlist/clear")
                setProducts([])
                toast.success("Wishlist cleared")
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Save products you love by clicking the heart icon on any product"
            actionLabel="Browse Products"
            actionLink="/products"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <Link to={`/products/${product._id}`} className="block">
                  <div className="relative" style={{ paddingTop: "65%" }}>
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-100">📦</div>
                    )}
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-grow">
                  <Badge variant="default" className="self-start mb-2 capitalize text-xs">
                    {product.category}
                  </Badge>
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-primary-500 transition-colors mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-primary-500 mb-3">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      onClick={() => addToCartHandler(product._id)}
                      loading={addingCartId === product._id}
                      disabled={product.stock === 0}
                      size="sm"
                      fullWidth
                      className="text-xs"
                    >
                      <FiShoppingCart size={13} />
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <button
                      onClick={() => removeItem(product._id)}
                      disabled={removingId === product._id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 border border-gray-200"
                    >
                      {removingId === product._id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiTrash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}