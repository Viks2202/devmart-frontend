import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiPackage, FiChevronRight } from "react-icons/fi"
import API from "../utils/api"
import Spinner from "../components/common/Spinner"
import Badge from "../components/common/Badge"
import EmptyState from "../components/common/EmptyState"

const statusVariant = {
  pending: "warning", confirmed: "info", shipped: "info",
  delivered: "success", cancelled: "danger"
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get("/orders/my")
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="You haven't placed any orders yet"
            actionLabel="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <FiPackage className="text-primary-500" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{(order.finalAmount || order.totalPrice)?.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-500">{order.items?.length} item(s)</p>
                    </div>
                    <Badge variant={statusVariant[order.status] || "default"} className="capitalize">
                      {order.status}
                    </Badge>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}