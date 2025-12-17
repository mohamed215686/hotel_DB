"use client"

import type React from "react"

import { useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { FaUser, FaLock, FaEdit } from "react-icons/fa"

export default function Profile() {
  const { user } = useAuth()
  const [passwordForm, setPasswordForm] = useState({ newPassword: "" })
  const [usernameForm, setUsernameForm] = useState({ newUsername: "" })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiService.changePassword(passwordForm)
      setMessage({ type: "success", text: response })
      setPasswordForm({ newPassword: "" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data || "Error changing password" })
    }
  }

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiService.changeUsername(usernameForm)
      setMessage({ type: "success", text: response })
      setUsernameForm({ newUsername: "" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data || "Error changing username" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Profile Settings</h1>
        <p className="mt-2 text-zinc-600">Manage your account information and security</p>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100">
              <FaUser className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">User Information</h2>
          </div>
        </div>
        <div className="px-6 py-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-zinc-500 mb-1">Username</dt>
              <dd className="text-base font-medium text-zinc-900">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 mb-1">Role</dt>
              <dd className="text-base font-medium text-zinc-900">{user?.roleName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 mb-1">User ID</dt>
              <dd className="text-base font-medium text-zinc-900">{user?.utilisateurId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-500 mb-1">Role ID</dt>
              <dd className="text-base font-medium text-zinc-900">{user?.roleId}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100">
              <FaLock className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Change Password</h2>
          </div>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-900 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                required
                minLength={6}
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
              />
              <p className="mt-1.5 text-sm text-zinc-500">Must be at least 6 characters</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100">
              <FaEdit className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Change Username</h2>
          </div>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium text-zinc-900 mb-1.5">
                New Username
              </label>
              <input
                type="text"
                id="newUsername"
                required
                minLength={3}
                maxLength={20}
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                value={usernameForm.newUsername}
                onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
              />
              <p className="mt-1.5 text-sm text-zinc-500">3-20 characters</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors"
            >
              Update Username
            </button>
          </form>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> You will need to log in again after changing your username.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
