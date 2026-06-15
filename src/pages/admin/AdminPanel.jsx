import { useState, useEffect } from "react"
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiUsers, FiPackage, FiShoppingBag, FiDollarSign } from "react-icons/fi"
import API from "../../utils/api"
import Badge from "../../components/common/Badge"
import Button from "../../components/common/Button"
import Spinner from "../../components/common/Spinner"
import toast from "react-hot-toast"

const CATEGORIES = ["electronics", "clothing", "books", "food", "other"]
const emptyForm = { name: "", description: "", price: "", category: "electronics", stock: "" }

export default function AdminPanel() {
  const [tab, setTab] = useState("products")
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        API.get("/products?limit=100&page=1"),
        API.get("/users"),
        API.get("/orders/all")
      ])
      setProducts(productsRes.data.products || [])
      setUsers(usersRes.data.users || [])
      setOrders(ordersRes.data.orders || [])

      const revenue = (ordersRes.data.orders || [])
        .filter(o => o.status !== "cancelled")
        .reduce((sum, o) => sum + (o.finalAmount || o.totalPrice || 0), 0)

      setStats({
        products: productsRes.data.pagination?.total || 0,
        users: usersRes.data.count || 0,
        orders: ordersRes.data.count || 0,
        revenue
      })
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false) }
  }

  const openAddForm = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditProduct(null)
    setForm(emptyForm)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error("Fill all required fields"); return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0
      }

      if (editProduct) {
        const { data } = await API.put(`/products/${editProduct._id}`, payload)
        setProducts(prev => prev.map(p => p._id === editProduct._id ? data.product : p))
        toast.success("Product updated!")
      } else {
        const { data } = await API.post("/products", payload)
        setProducts(prev => [data.product, ...prev])
        toast.success("Product added!")
      }
      closeForm()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save")
    } finally { setSaving(false) }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return
    try {
      await API.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success("Product deleted")
    } catch { toast.error("Failed to delete") }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o))
      toast.success("Order status updated")
    } catch { toast.error("Failed to update") }
  }

  const deactivateUser = async (userId) => {
    try {
      await API.put(`/users/${userId}/deactivate`)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false } : u))
      toast.success("User deactivated")
    } catch { toast.error("Failed") }
  }

  if (loading) return <Spinner size="xl" className="min-h-screen" />

  const statusColors = {
    pending: "warning", confirmed: "info",
    shipped: "info", delivered: "success", cancelled: "danger"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark-800 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your DevMart store</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiPackage, label: "Products", value: stats.products, color: "blue" },
            { icon: FiUsers, label: "Users", value: stats.users, color: "green" },
            { icon: FiShoppingBag, label: "Orders", value: stats.orders, color: "purple" },
            { icon: FiDollarSign, label: "Revenue", value: `₹${(stats.revenue || 0).toLocaleString("en-IN")}`, color: "orange" }
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`text-${color}-600`} size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {["products", "orders", "users"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors
                ${tab === t ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Products ({products.length})</h2>
              <Button onClick={openAddForm} size="sm">
                <FiPlus size={16} /> Add Product
              </Button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{editProduct ? "Edit Product" : "Add New Product"}</h3>
                  <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. iPhone 15 Pro" required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Product description..." required rows={3}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 29999" required min="0"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="e.g. 100" min="0"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex gap-3 w-full">
                      <Button type="submit" loading={saving} size="sm">
                        <FiCheck size={14} /> {editProduct ? "Update" : "Add Product"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Products table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images?.[0]?.url
                                ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                              }
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{product.price?.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={product.stock === 0 ? "danger" : product.stock < 10 ? "warning" : "success"}>
                            {product.stock === 0 ? "Out of Stock" : `${product.stock} units`}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={product.isActive ? "success" : "danger"}>
                            {product.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(product)}
                              className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                              <FiEdit size={15} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Orders ({orders.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-mono font-medium text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{order.items?.length} item(s)</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-gray-900">
                            ₹{(order.finalAmount || order.totalPrice)?.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"} className="capitalize">
                            {order.paymentStatus || "pending"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[order.status] || "default"} className="capitalize">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {order.status !== "delivered" && order.status !== "cancelled" && (
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Users ({users.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={user.role === "admin" ? "danger" : "primary"} className="capitalize">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={user.isActive ? "success" : "danger"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.isActive && user.role !== "admin" && (
                            <button
                              onClick={() => deactivateUser(user._id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}