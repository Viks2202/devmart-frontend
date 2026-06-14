import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag } from "react-icons/fi"
import { useCart } from "../context/CartContext"
import Button from "../components/common/Button"
import Spinner from "../components/common/Spinner"
import EmptyState from "../components/common/EmptyState"
import API from "../utils/api"
import toast from "react-hot-toast"

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState("")
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [updatingItem, setUpdatingItem] = useState(null)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await API.post("/coupons/apply", {
        code: couponCode.trim(),
        cartTotal: cart.totalPrice
      })
      setCouponData(data)
      toast.success(`Coupon applied! You save ₹${data.discountAmount}`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon")
      setCouponData(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return
    setUpdatingItem(productId)
    try {
      await updateQuantity(productId, newQty)
      setCouponData(null) // Reset coupon when cart changes
    } catch {
      toast.error("Failed to update quantity")
    } finally {
      setUpdatingItem(null)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId)
      toast.success("Item removed")
      setCouponData(null)
    } catch {
      toast.error("Failed to remove item")
    }
  }

  const handleCheckout = () => {
    navigate("/checkout", { state: { couponData, couponCode: couponData ? couponCode : null } })
  }

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    )
  }

  const finalTotal = couponData ? couponData.finalAmount : cart.totalPrice

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Shopping Cart ({cart.items.length} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map(item => (
              <div key={item._id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-grow min-w-0">
                    <Link to={`/products/${item.product?._id}`}>
                      <h3 className="font-semibold text-gray-900 text-sm hover:text-primary-500 transition-colors line-clamp-2">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <p className="text-primary-500 font-bold mt-1">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItem === item.product?._id}
                          className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold min-w-8 text-center">
                          {updatingItem === item.product?._id ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                          disabled={updatingItem === item.product?._id}
                          className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">
                          ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => handleRemove(item.product?._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => { clearCart(); toast.success("Cart cleared") }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FiTag size={14} /> Coupon Code
                </label>
                {couponData ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <span className="text-green-700 text-sm font-medium">{couponCode.toUpperCase()}</span>
                    <button
                      onClick={() => { setCouponData(null); setCouponCode("") }}
                      className="text-green-600 hover:text-green-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button onClick={applyCoupon} loading={couponLoading} size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cart.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
                {couponData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -₹{couponData.discountAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span className="text-primary-500">₹{finalTotal?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} fullWidth size="lg" className="mt-5">
                <FiShoppingBag size={18} />
                Proceed to Checkout
              </Button>

              <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}