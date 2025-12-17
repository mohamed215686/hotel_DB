"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import type { Chambre, ChambreCreate } from "../types"
import { FaPlus, FaEdit, FaTrash, FaBed } from "react-icons/fa"

export default function Chambres() {
  const { isAdmin, isManager } = useAuth()
  const [chambres, setChambres] = useState<Chambre[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingChambre, setEditingChambre] = useState<Chambre | null>(null)
  const [formData, setFormData] = useState<ChambreCreate>({
    numero: "",
    type: "",
    prixNuitee: 0,
    statut: "Disponible",
  })

  useEffect(() => {
    fetchChambres()
  }, [])

  const fetchChambres = async () => {
    try {
      const data = await apiService.getChambres()
      setChambres(data)
    } catch (error) {
      console.error("Error fetching chambres:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingChambre) {
        await apiService.updateChambre(editingChambre.chambreId, formData)
      } else {
        await apiService.createChambre(formData)
      }
      setShowModal(false)
      setEditingChambre(null)
      setFormData({ numero: "", type: "", prixNuitee: 0, statut: "Disponible" })
      fetchChambres()
    } catch (error: any) {
      alert(error.response?.data || "Error saving chambre")
    }
  }

  const handleEdit = (chambre: Chambre) => {
    setEditingChambre(chambre)
    setFormData({
      numero: chambre.numero,
      type: chambre.type,
      prixNuitee: chambre.prixNuitee,
      statut: chambre.statut,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return
    try {
      await apiService.deleteChambre(id)
      fetchChambres()
    } catch (error: any) {
      alert(error.response?.data || "Error deleting chambre")
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
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Rooms</h1>
          <p className="mt-2 text-zinc-600">Manage hotel room inventory</p>
        </div>
        {(isAdmin || isManager) && (
          <button
            onClick={() => {
              setEditingChambre(null)
              setFormData({ numero: "", type: "", prixNuitee: 0, statut: "Disponible" })
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <FaPlus className="text-sm" />
            Add Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chambres.map((chambre) => (
          <div
            key={chambre.chambreId}
            className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100">
                <FaBed className="text-xl text-zinc-600" />
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  chambre.statut === "Disponible"
                    ? "bg-emerald-50 text-emerald-700"
                    : chambre.statut === "Occupée"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {chambre.statut}
              </span>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-zinc-900 mb-1">Room {chambre.numero}</h3>
              <p className="text-sm text-zinc-600">{chambre.type}</p>
              <p className="text-lg font-semibold text-zinc-900 mt-2">
                ${chambre.prixNuitee.toFixed(2)}
                <span className="text-sm font-normal text-zinc-500"> / night</span>
              </p>
            </div>
            {(isAdmin || isManager) && (
              <div className="flex gap-2 pt-4 border-t border-zinc-100">
                <button
                  onClick={() => handleEdit(chambre)}
                  className="flex items-center gap-2 flex-1 justify-center px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors text-sm"
                >
                  <FaEdit className="text-sm" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(chambre.chambreId)}
                  className="flex items-center gap-2 flex-1 justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors text-sm"
                >
                  <FaTrash className="text-sm" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setShowModal(false)
                setEditingChambre(null)
              }}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-2xl font-semibold text-zinc-900 mb-6">
                    {editingChambre ? "Edit Room" : "Add New Room"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Room Number</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Type</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Price per Night</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.prixNuitee}
                        onChange={(e) => setFormData({ ...formData, prixNuitee: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Status</label>
                      <select
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={formData.statut}
                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      >
                        <option value="Disponible">Available</option>
                        <option value="Occupée">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 px-6 py-4 flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                  >
                    {editingChambre ? "Update Room" : "Save Room"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingChambre(null)
                    }}
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
