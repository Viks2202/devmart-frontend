import axios from "axios"

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  timeout: 30000
})

API.interceptors.request.use(
  config => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await API.post("/auth/refresh")
        localStorage.setItem("accessToken", data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return API(originalRequest)
      } catch {
        localStorage.removeItem("accessToken")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default API