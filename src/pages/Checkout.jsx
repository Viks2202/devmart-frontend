import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FiMapPin, FiCreditCard } from "react-icons/fi"
import { useCart } from "../context/CartContext"
import Button from "../components/common/Button"
import API from "../utils/api"
import toast from "react-hot-toast"

export default function Checkout() {
  const { cart, clearCart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const { couponData, couponCode } = location.state || {}

  const [address, setAddress] = useState({
    street: "", city: "", state: "", pincode: ""
  })
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [loading, setLoading] = useState(false)

  const finalAmount = couponData ? couponData.finalAmount : cart.totalPrice

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill all address fields")
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post("/orders", {
        shippingAddress: address,
        paymentMethod,
        couponCode: couponData ? couponCode : undefined
      })
      toast.success("Order placed successfully!")
      navigate(`/orders/${data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Address */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary-500" /> Shipping Address
            </h2>
            <div className="space-y-4">
              {[
                { label: "Street Address", key: "street", placeholder: "123 Main St, Connaught Place" },
                { label: "City", key: "city", placeholder: "Delhi" },
                { label: "State", key: "state", placeholder: "Delhi" },
                { label: "Pincode", key: "pincode", placeholder: "110001" }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={address[field.key]}
                    onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiCreditCard size={14} /> Payment Method
              </h3>
              <div className="space-y-2">
                {[
                  { value: "cod", label: "💵 Cash on Delivery" },
                  { value: "online", label: "💳 Pay Online (Razorpay)" }
                ].map(method => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-500"
                    />
                    <span className="text-sm font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cart.items?.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity)?.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{cart.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
                {couponData && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{couponData.discountAmount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-green-600">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-primary-500">₹{finalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Button onClick={handlePlaceOrder} loading={loading} fullWidth size="lg" className="mt-5">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}