import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Button from "../components/common/Button"
import API from "../utils/api"
import toast from "react-hot-toast"

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await API.put("/auth/profile", form)
      updateUser(data.user)
      toast.success("Profile updated!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed")
    } finally { setLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match"); return
    }
    setPassLoading(true)
    try {
      await API.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success("Password changed!")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed")
    } finally { setPassLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        {/* Profile info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" loading={loading} size="sm">Save Changes</Button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { label: "Current Password", key: "currentPassword" },
              { label: "New Password", key: "newPassword" },
              { label: "Confirm New Password", key: "confirmPassword" }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type="password"
                  value={passwordForm[field.key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
            <Button type="submit" loading={passLoading} size="sm" variant="outline">Update Password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}