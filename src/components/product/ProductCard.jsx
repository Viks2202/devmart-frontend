import { Link } from "react-router-dom"
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi"
import { useState, useEffect } from "react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import API from "../../utils/api"
import toast from "react-hot-toast"
import Badge from "../common/Badge"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [addingCart, setAddingCart] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [checkingWishlist, setCheckingWishlist] = useState(false)

  useEffect(() => {
    if (isAuthenticated && product?._id) {
      API.get(`/wishlist/check/${product._id}`)
        .then(({ data }) => setWishlisted(data.isWishlisted))
        .catch(() => {})
    }
  }, [isAuthenticated, product?._id])

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error("Please login to add to cart"); return }
    setAddingCart(true)
    try {
      await addToCart(product._id, 1)
      toast.success("Added to cart!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart")
    } finally {
      setAddingCart(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error("Please login to use wishlist"); return }
    setCheckingWishlist(true)
    try {
      if (wishlisted) {
        await API.delete(`/wishlist/item/${product._id}`)
        setWishlisted(false)
        toast.success("Removed from wishlist")
      } else {
        await API.post("/wishlist/add", { productId: product._id })
        setWishlisted(true)
        toast.success("Added to wishlist!")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setCheckingWishlist(false)
    }
  }

  const isOutOfStock = product.stock === 0

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
        <div className="relative overflow-hidden bg-gray-50" style={{ paddingTop: "70%" }}>
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
              📦
            </div>
          )}

          <button
            onClick={handleWishlist}
            disabled={checkingWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all z-10
              ${wishlisted
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-500"
              } disabled:opacity-50`}
          >
            <FiHeart size={16} className={wishlisted ? "fill-current" : ""} />
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Badge variant="danger" className="text-sm px-3 py-1">Out of Stock</Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <Badge variant="default" className="self-start mb-2 capitalize">{product.category}</Badge>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-sm leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <FiStar className="text-yellow-400 fill-current" size={12} />
            <span className="text-xs text-gray-600">{product.ratings?.toFixed(1) || "0.0"}</span>
            <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={addingCart || isOutOfStock}
              className="bg-primary-500 hover:bg-primary-600 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiShoppingCart size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}