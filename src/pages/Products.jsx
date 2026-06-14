import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi"
import API from "../utils/api"
import ProductCard from "../components/product/ProductCard"
import Spinner from "../components/common/Spinner"
import EmptyState from "../components/common/EmptyState"
import Button from "../components/common/Button"

const CATEGORIES = ["electronics", "clothing", "books", "food", "other"]
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name A-Z", value: "name_asc" }
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const category = searchParams.get("category") || ""
  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "newest"
  const page = Number(searchParams.get("page")) || 1
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const limit = 12

  useEffect(() => {
    fetchProducts()
  }, [category, search, sort, page, minPrice, maxPrice])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (search) params.set("search", search)
      if (sort) params.set("sort", sort)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      params.set("page", page)
      params.set("limit", limit)

      const { data } = await API.get(`/products?${params}`)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set("page", "1")
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchParams({ sort: "newest" })
  }

  const hasFilters = category || minPrice || maxPrice

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {search ? `Results for "${search}"` : category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Products"}
              </h1>
              {pagination.total > 0 && (
                <span className="text-sm text-gray-500">({pagination.total} products)</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <FiFilter size={16} />
                Filters
                {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full"></span>}
              </button>

              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-end gap-6">
                {/* Category filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam("category", "")}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                        ${!category ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      All
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateParam("category", cat)}
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors
                          ${category === cat ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Price Range (₹)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => updateParam("minPrice", e.target.value)}
                      className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => updateParam("maxPrice", e.target.value)}
                      className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    <FiX size={14} /> Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Spinner size="xl" className="py-20" />
        ) : products.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No products found"
            description="Try adjusting your filters or search query"
            actionLabel="View all products"
            actionLink="/products"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => updateParam("page", String(page - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) <= 2)
                  .map(p => (
                    <button
                      key={p}
                      onClick={() => updateParam("page", String(p))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${p === page ? "bg-primary-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}`}
                    >
                      {p}
                    </button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => updateParam("page", String(page + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}