"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import type { Client, ClientCreate } from "../types"
import { FaPlus, FaTrash, FaUser } from "react-icons/fa"

export default function Clients() {
  const { isAdmin, isManager, isReceptionniste } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<ClientCreate>({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await apiService.getClients()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createClient(formData)
      setShowModal(false)
      setFormData({ nom: "", prenom: "", telephone: "", email: "", adresse: "" })
      fetchClients()
    } catch (error: any) {
      alert(error.response?.data || "Error creating client")
    }
  }

  const handleDeleteClient = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client? This cannot be undone.")) return
    try {
      const msg = await apiService.deleteClient(id)
      alert(msg || "Client deleted")
      await fetchClients()
    } catch (error: any) {
      console.error("Delete client error:", error)
      alert(error.response?.data || "Error deleting client")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-200 border-t-zinc-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Clients</h1>
          <p className="mt-2 text-zinc-600">Manage your client directory</p>
        </div>
        {(isAdmin || isManager || isReceptionniste) && (
          <button
            onClick={() => {
              setFormData({ nom: "", prenom: "", telephone: "", email: "", adresse: "" })
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <FaPlus className="text-sm" />
            Add Client
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clients.map((client) => (
          <div
            key={client.clientId}
            className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100">
                  <FaUser className="text-xl text-zinc-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {client.prenom} {client.nom}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-zinc-600">
                      <span className="font-medium text-zinc-900">Email:</span> {client.email}
                    </p>
                    <p className="text-sm text-zinc-600">
                      <span className="font-medium text-zinc-900">Phone:</span> {client.telephone}
                    </p>
                    <p className="text-sm text-zinc-600">
                      <span className="font-medium text-zinc-900">Address:</span> {client.adresse}
                    </p>
                  </div>
                </div>
              </div>
              {(isAdmin || isManager || isReceptionniste) && (
                <button
                  onClick={() => handleDeleteClient(client.clientId)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
                >
                  <FaTrash className="text-sm" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-2xl font-semibold text-zinc-900 mb-6">Add New Client</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">First Name</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Address</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 px-6 py-4 flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Save Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
