import { useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { FiCheck } from "react-icons/fi"
import { useCart } from "../context/CartContext"
import Button from "../components/common/Button"
import API from "../utils/api"
import toast from "react-hot-toast"

export default function Checkout() {
const { cart } = useCart()
    const location = useLocation()
  const navigate = useNavigate()
  const { couponData, couponCode } = location.state || {}

  const [address, setAddress] = useState({
    street: "", city: "", state: "", pincode: ""
  })
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  const finalAmount = couponData ? couponData.finalAmount : cart.totalPrice

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill all address fields")
      return
    }
    if (address.pincode.length !== 6 || isNaN(address.pincode)) {
      toast.error("Enter valid 6-digit pincode")
      return
    }

    setLoading(true)
    try {
      // Step 1: Create order in DB
      const { data } = await API.post("/orders", {
        shippingAddress: address,
        paymentMethod,
        couponCode: couponData ? couponCode : undefined
      })

      const order = data.order

      if (paymentMethod === "cod") {
        // COD: show success directly
        setPlacedOrder(order)
        setOrderPlaced(true)
        toast.success("Order placed successfully!")
      } else {
        // Online: load Razorpay
        await handleRazorpayPayment(order)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpayPayment = async (order) => {
    try {
      // Step 2: Create Razorpay payment order
      const { data: paymentData } = await API.post("/payment/create", {
        orderId: order._id
      })

      // Step 3: Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await loadRazorpayScript()
      }

      // Step 4: Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "DevMart",
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: "Vikas Sharma",
          email: "vikas@gmail.com"
        },
        theme: { color: "#e94560" },
        handler: async function(response) {
          // Step 5: Verify payment
          try {
            await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            })
            setPlacedOrder(order)
            setOrderPlaced(true)
            toast.success("Payment successful! Order confirmed.")
          } catch {
            toast.error("Payment verification failed. Contact support.")
          }
        },
        modal: {
          ondismiss: function() {
            toast("Payment cancelled. Your order is saved as pending.")
            navigate(`/orders`)
          }
        }
      })

      rzp.open()
    } catch (err) {
      toast.error("Failed to initialize payment. Try COD.")
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = resolve
      document.body.appendChild(script)
    })
  }

  // Success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-2">
            Order #{placedOrder?._id?.slice(-8).toUpperCase()}
          </p>
          <p className="text-gray-500 mb-6">
            Thank you for shopping with DevMart. We'll deliver soon!
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Amount paid</span>
              <span className="font-bold text-gray-900">
                ₹{(placedOrder?.finalAmount || placedOrder?.totalPrice)?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment</span>
              <span className="font-medium capitalize">{placedOrder?.paymentMethod || paymentMethod}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/orders" className="flex-1">
              <Button variant="primary" fullWidth>View Orders</Button>
            </Link>
            <Link to="/products" className="flex-1">
              <Button variant="outline" fullWidth>Shop More</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-3 space-y-5">

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="123 Main Street, Connaught Place"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="New Delhi"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Delhi"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    placeholder="110001"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "cod",
                    label: "Cash on Delivery",
                    desc: "Pay when your order arrives",
                    icon: "💵"
                  },
                  {
                    value: "online",
                    label: "Pay Online",
                    desc: "UPI, Cards, Net Banking via Razorpay",
                    icon: "💳"
                  }
                ].map(method => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${paymentMethod === method.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-500 w-4 h-4"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                      <p className="text-gray-500 text-xs">{method.desc}</p>
                    </div>
                    {paymentMethod === method.value && (
                      <FiCheck className="ml-auto text-primary-500" size={18} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {cart.items?.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{cart.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
                {couponData && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({couponCode})</span>
                    <span>-₹{couponData.discountAmount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-green-600">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-primary-500">₹{finalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                loading={loading}
                fullWidth
                size="lg"
                className="mt-5"
              >
                {paymentMethod === "cod" ? "Place Order (COD)" : `Pay ₹${finalAmount?.toLocaleString("en-IN")}`}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 100% Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}