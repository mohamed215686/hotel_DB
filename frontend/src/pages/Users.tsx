"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Users() {
  const { isAdmin, user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ login: "", motDePasse: "", roleId: 1 })

  useEffect(() => {
    if (isAdmin) fetchData()
    else setLoading(false)
  }, [isAdmin])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resUsers, resRoles] = await Promise.all([apiService.getUsers(), apiService.getRoles()])
      setUsers(resUsers || [])
      setRoles(resRoles || [])
    } catch (err) {
      console.error("Error fetching users or roles", err)
      alert("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { login: form.login, motDePasseHash: form.motDePasse, roleId: form.roleId }
      const msg = await apiService.createUser(payload)
      alert(msg || "User created")
      setShowModal(false)
      setForm({ login: "", motDePasse: "", roleId: 1 })
      await fetchData()
    } catch (err: any) {
      console.error("Create user error", err)
      alert(err.response?.data || err.message || "Error creating user")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return
    try {
      const msg = await apiService.deleteUser(id)
      alert(msg || "User deleted")
      await fetchData()
    } catch (err: any) {
      console.error("Delete user error", err)
      alert(err.response?.data || err.message || "Error deleting user")
    }
  }

  const roleMap = Object.fromEntries(
    roles.map((r: any) => [r.roleId ?? r.ROLE_ID, r.nomRole ?? r.NOMROLE ?? r.roleName]),
  )

  const getRoleBadge = (roleId: number) => {
    const roleName = roleMap[roleId] || "Unknown"
    const colors = {
      Admin: "bg-purple-100 text-purple-700 border-purple-200",
      Client: "bg-blue-100 text-blue-700 border-blue-200",
      Manager: "bg-green-100 text-green-700 border-green-200",
      Receptionniste: "bg-amber-100 text-amber-700 border-amber-200",
    }
    return colors[roleName as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-xl font-semibold text-gray-900">Access Denied</p>
        <p className="text-gray-500 mt-2">Administrator privileges required</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
        >
          Add User
        </button>
      </div>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No users found</p>
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.utilisateurId ?? u.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {u.login.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {u.login} {u.nom ? `(${u.nom} ${u.prenom})` : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(u.roleId ?? u.role)}`}
                      >
                        {roleMap[u.roleId] ?? roleMap[u.role] ?? u.roleLibelle ?? "Unknown"}
                      </span>
                      <span className="text-sm text-gray-500">ID: {u.utilisateurId ?? u.id}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(u.utilisateurId ?? u.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  required
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  required
                  type="password"
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: Number.parseInt(e.target.value, 10) })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Client</option>
                  <option value={3}>Manager</option>
                  <option value={4}>Receptionniste</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium shadow-lg"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
