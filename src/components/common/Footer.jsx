import { Link } from "react-router-dom"
import { FiGithub, FiLinkedin, FiGlobe } from "react-icons/fi"

export default function Footer() {
  return (
    <footer className="bg-dark-800 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛒</span>
              <span className="text-xl font-bold text-white">
                Dev<span className="text-primary-500">Mart</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              A full-stack e-commerce platform built with React, Node.js, Express, and MongoDB.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="https://github.com/Viks2202/devmart" target="_blank" rel="noreferrer"
                className="hover:text-white transition-colors">
                <FiGithub size={20} />
              </a>
              <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noreferrer"
                className="hover:text-white transition-colors">
                <FiLinkedin size={20} />
              </a>
              <a href="https://devmart-api.onrender.com/api-docs" target="_blank" rel="noreferrer"
                className="hover:text-white transition-colors">
                <FiGlobe size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=books" className="hover:text-white transition-colors">Books</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2026 DevMart. Built by Vikas Sharma.</p>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            <a href="https://devmart-api.onrender.com/health" target="_blank" rel="noreferrer" className="hover:text-white">
              API Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}