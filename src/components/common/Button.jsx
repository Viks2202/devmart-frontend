import Spinner from "./Spinner"

export default function Button({
  children, onClick, type = "button", variant = "primary",
  size = "md", loading = false, disabled = false, className = "", fullWidth = false
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300",
    outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-300"
  }
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}