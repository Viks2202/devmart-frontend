import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { FiChevronRight, FiBookmark, FiMinus, FiPlus } from "react-icons/fi"
import API from "../utils/api"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import Badge from "../components/common/Badge"
import Button from "../components/common/Button"
import Spinner from "../components/common/Spinner"
import toast from "react-hot-toast"

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingCart, setAddingCart] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await API.get(`/products/${id}`)
      setProduct(data.product)
    } catch {
      toast.error("Product not found")
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await API.get(`/reviews/${id}`)
      setReviews(data.reviews || [])
    } catch {
      // silently fail
    }
  }, [id])

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [fetchProduct, fetchReviews])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please login first"); return }
    setAddingCart(true)
    try {
      await addToCart(product._id, quantity)
      toast.success(`${quantity} item(s) added to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart")
    } finally {
      setAddingCart(false)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error("Please login to review"); return }
    setSubmittingReview(true)
    try {
      await API.post(`/reviews/${id}`, reviewForm)
      toast.success("Review submitted!")
      setReviewForm({ rating: 5, comment: "" })
      fetchReviews()
      fetchProduct()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <Link to="/products" className="text-primary-500 hover:underline">Back to products</Link>
      </div>
    </div>
  )

  const isOutOfStock = product.stock === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <FiChevronRight size={14} />
          <Link to="/products" className="hover:text-primary-500">Products</Link>
          <FiChevronRight size={14} />
          <span className="text-gray-900 font-medium capitalize">{product.category}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-6 lg:p-8">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                {product.images?.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors
                        ${selectedImage === i ? "border-primary-500" : "border-transparent"}`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-100">
              <Badge variant="default" className="capitalize mb-3">{product.category}</Badge>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={`text-sm ${star <= Math.round(product.ratings || 0) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.ratings?.toFixed(1) || "0.0"}</span>
                <span className="text-sm text-gray-500">({product.numReviews || 0} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-green-500"}`}></div>
                <span className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                  {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} available)`}
                </span>
              </div>

              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  loading={addingCart}
                  disabled={isOutOfStock}
                  fullWidth
                  size="lg"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
                <button className="border border-gray-300 hover:border-primary-500 hover:text-primary-500 p-3 rounded-xl transition-colors">
                  <FiBookmark size={20} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: "🚚", label: "Free Delivery", sub: "On all orders" },
                  { icon: "↩️", label: "Easy Returns", sub: "30 day policy" },
                  { icon: "🔒", label: "Secure Payment", sub: "100% protected" },
                  { icon: "✅", label: "Genuine Products", sub: "Quality assured" }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Customer Reviews ({reviews.length})
          </h2>

          {isAuthenticated && (
            <form onSubmit={submitReview} className="bg-gray-50 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
              <div className="flex gap-2 mb-3">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                    className="text-2xl focus:outline-none"
                  >
                    <span className={star <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                rows={3}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <Button type="submit" loading={submittingReview} size="sm">
                Submit Review
              </Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-4xl mb-2">⭐</div>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {review.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{review.user?.name}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-4">
                      {new Date(review.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}