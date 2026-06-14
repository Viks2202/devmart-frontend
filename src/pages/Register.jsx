import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Button from "../components/common/Button"
import toast from "react-hot-toast"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success("Account created! Please verify your email.")
      navigate("/products")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl mb-4">🛒</Link>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join DevMart today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Vikas Sharma" },
            { label: "Email", key: "email", type: "email", placeholder: "vikas@gmail.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
            { label: "Confirm Password", key: "confirmPassword", type: "password", placeholder: "Repeat password" }
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}