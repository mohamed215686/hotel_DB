"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { apiService } from "../services/api"
import type { LoginRequest } from "../types"
import { FaHotel, FaUser, FaLock } from "react-icons/fa"

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    login: "",
    motDePasse: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Attempting login with:", { login: formData.login, passwordLength: formData.motDePasse.length })
      const response = await apiService.login(formData)
      console.log("Login successful:", response)
      login(response)
      navigate("/")
    } catch (err: any) {
      console.error("Login error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        request: err.request,
      })

      let errorMessage = "Login failed. Please check your credentials."

      if (err.response) {
        const status = err.response.status
        const data = err.response.data

        if (status === 401) {
          errorMessage = typeof data === "string" ? data : "Invalid username or password."
        } else if (status === 404) {
          errorMessage = "Backend endpoint not found. Is the backend running?"
        } else if (status === 500) {
          errorMessage = "Server error. Check backend logs."
        } else if (typeof data === "string") {
          errorMessage = data
        } else if (data?.message) {
          errorMessage = data.message
        } else {
          errorMessage = `Error ${status}: ${JSON.stringify(data)}`
        }
      } else if (err.request) {
        errorMessage =
          "Cannot connect to the server. Please check:\n" +
          "1. Is the backend running on http://localhost:8080?\n" +
          "2. Check browser console (F12) for CORS errors\n" +
          "3. Check network tab for failed requests"
      } else {
        errorMessage = err.message || errorMessage
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 mb-4">
              <FaHotel className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-zinc-900 mb-2">Welcome Back</h2>
            <p className="text-zinc-600">Sign in to your hotel management account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl whitespace-pre-line text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-zinc-900 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-zinc-400" />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-zinc-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-zinc-400" />
                </div>
                <input
                  id="motDePasse"
                  name="motDePasse"
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  value={formData.motDePasse}
                  onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="text-center pt-2">
              <Link to="/signup" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                Don't have an account? <span className="text-zinc-900">Sign up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
