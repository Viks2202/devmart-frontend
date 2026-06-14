import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiHeart, FiLogOut, FiPackage, FiSettings } from "react-icons/fi"
import toast from "react-hot-toast"

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
    navigate("/")
    setUserMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-dark-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-white">
              Dev<span className="text-primary-500">Mart</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-dark-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-10 py-2 text-sm border border-gray-700 focus:outline-none focus:border-primary-500"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-primary-500">
                <FiSearch size={16} />
              </button>
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors ${isActive("/products") ? "text-primary-500" : "text-gray-300 hover:text-white"}`}
            >
              Products
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  className={`text-sm font-medium transition-colors ${isActive("/wishlist") ? "text-primary-500" : "text-gray-300 hover:text-white"}`}
                >
                  <FiHeart size={20} />
                </Link>

                <Link to="/cart" className="relative">
                  <FiShoppingCart size={20} className="text-gray-300 hover:text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-dark-700 rounded-full px-3 py-1.5 text-sm hover:bg-dark-600 transition-colors"
                >
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-200 max-w-20 truncate">{user?.name?.split(" ")[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiUser size={14} /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiPackage size={14} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiSettings size={14} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-white font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-700 py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-dark-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 text-sm border border-gray-700"
              />
              <button type="submit" className="bg-primary-500 px-4 py-2 rounded-lg">
                <FiSearch size={16} />
              </button>
            </form>
            <Link to="/products" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Products</Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
                <Link to="/orders" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Orders</Link>
                <Link to="/wishlist" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                {isAdmin && <Link to="/admin" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Admin</Link>}
                <button onClick={handleLogout} className="block text-red-400 py-2 text-left w-full">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="block text-primary-500 py-2" onClick={() => setMobileOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}