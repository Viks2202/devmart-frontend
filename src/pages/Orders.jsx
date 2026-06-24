import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiPackage, FiChevronDown, FiChevronUp, FiX, FiShoppingBag } from "react-icons/fi"
import API from "../utils/api"
import Spinner from "../components/common/Spinner"
import Badge from "../components/common/Badge"
import Button from "../components/common/Button"
import EmptyState from "../components/common/EmptyState"
import toast from "react-hot-toast"
import { useSocket } from "../context/SocketContext"

const statusVariant = {
  pending: "warning",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger"
}

const statusSteps = ["pending", "confirmed", "shipped", "delivered"]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const { lastOrderUpdate } = useSocket()

  useEffect(() => {
    fetchOrders()
  }, [])

  // Live-update the matching order's status the instant a Socket.io event arrives
  useEffect(() => {
    if (!lastOrderUpdate) return
    setOrders(prev =>
      prev.map(o =>
        o._id === lastOrderUpdate.orderId ? { ...o, status: lastOrderUpdate.status } : o
      )
    )
  }, [lastOrderUpdate])

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/my")
      setOrders(data.orders || [])
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return
    setCancelling(orderId)
    try {
      await API.put(`/orders/${orderId}/cancel`)
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: "cancelled" } : o
      ))
      toast.success("Order cancelled")
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel this order")
    } finally {
      setCancelling(null) }
  }

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id)
  }

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm">
              <FiShoppingBag size={14} /> Continue Shopping
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping!"
            actionLabel="Browse Products"
            actionLink="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Order Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <FiPackage className="text-primary-500" size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                          {" · "}{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{(order.finalAmount || order.totalPrice)?.toLocaleString("en-IN")}
                        </p>
                        <Badge variant={statusVariant[order.status] || "default"} className="capitalize mt-1">
                          {order.status}
                        </Badge>
                      </div>
                      {expandedOrder === order._id
                        ? <FiChevronUp className="text-gray-400" />
                        : <FiChevronDown className="text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Progress bar for non-cancelled orders */}
                  {order.status !== "cancelled" && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        {statusSteps.map((step, i) => {
                          const currentIdx = statusSteps.indexOf(order.status)
                          const isDone = i <= currentIdx
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors
                                ${isDone ? "bg-primary-500" : "bg-gray-200"}`} />
                              {i < statusSteps.length - 1 && (
                                <div className={`h-0.5 flex-1 transition-colors
                                  ${i < currentIdx ? "bg-primary-500" : "bg-gray-200"}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between">
                        {statusSteps.map(step => (
                          <span key={step} className="text-xs text-gray-400 capitalize">{step}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-100 p-5">

                    {/* Items */}
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</h3>
                    <div className="space-y-3 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                            <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}</p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">
                            ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal ({order.items?.length} items)</span>
                          <span>₹{order.totalPrice?.toLocaleString("en-IN")}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                            <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-green-600">
                          <span>Delivery</span>
                          <span>FREE</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                          <span>Total</span>
                          <span className="text-primary-500">
                            ₹{(order.finalAmount || order.totalPrice)?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping + Payment info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ship To</p>
                        <p className="text-sm text-gray-800">
                          {order.shippingAddress?.street}, {order.shippingAddress?.city}
                        </p>
                        <p className="text-sm text-gray-800">
                          {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment</p>
                        <p className="text-sm text-gray-800 capitalize">{order.paymentMethod}</p>
                        <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} className="mt-1 capitalize">
                          {order.paymentStatus || "pending"}
                        </Badge>
                      </div>
                    </div>

                    {/* Cancel button */}
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancelling === order._id}
                        onClick={() => cancelOrder(order._id)}
                      >
                        <FiX size={14} /> Cancel Order
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}