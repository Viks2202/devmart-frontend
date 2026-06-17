import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from "react-icons/fi"
import API from "../utils/api"
import ProductCard from "../components/product/ProductCard"
import Spinner from "../components/common/Spinner"
import Recommendations from "../components/product/Recommendations"

const categories = [
  { name: "Electronics", emoji: "📱", value: "electronics", color: "from-blue-400 to-blue-600" },
  { name: "Clothing", emoji: "👕", value: "clothing", color: "from-purple-400 to-purple-600" },
  { name: "Books", emoji: "📚", value: "books", color: "from-green-400 to-green-600" },
  { name: "Food", emoji: "🍔", value: "food", color: "from-orange-400 to-orange-600" },
]

const features = [
  { icon: FiShield, title: "Secure Payments", desc: "100% secure Razorpay payments" },
  { icon: FiTruck, title: "Fast Delivery", desc: "Delivery across India" },
  { icon: FiRefreshCw, title: "Easy Returns", desc: "Hassle-free 30-day returns" },
  { icon: FiHeadphones, title: "24/7 Support", desc: "Always here to help you" },
]

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get("/products?limit=8&sort=newest")
        setFeaturedProducts(data.products)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-500 bg-opacity-20 border border-primary-500 border-opacity-30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-primary-400 text-sm font-medium">🔥 New Arrivals Every Week</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Shop Smart,<br />
              Live <span className="text-primary-500">Better</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-xl">
              Discover thousands of products at unbeatable prices. Electronics, clothing, books and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Shop Now <FiArrowRight />
              </Link>
              <Link
                to="/products?sort=popular"
                className="inline-flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Best Sellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 mt-2">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                className="group"
              >
                <div className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform duration-300 shadow-lg`}>
                  <div className="text-4xl mb-3">{cat.emoji}</div>
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                  <p className="text-white text-opacity-80 text-sm mt-1 flex items-center justify-center gap-1">
                    Shop now <FiArrowRight size={12} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Products</h2>
              <p className="text-gray-500 mt-1">Fresh arrivals just for you</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <Spinner size="lg" className="py-20" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Recommendations />


      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="text-primary-500" size={22} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}