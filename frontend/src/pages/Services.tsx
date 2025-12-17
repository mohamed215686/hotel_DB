"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import type { Service, ServiceCreate } from "../types"

export default function Services() {
  const { isAdmin, isManager, isReceptionniste } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<ServiceCreate>({
    libelle: "",
    tarifUnitaire: 0,
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const data = await apiService.getServices()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createService(formData)
      setShowModal(false)
      setFormData({ libelle: "", tarifUnitaire: 0 })
      fetchServices()
    } catch (error: any) {
      alert(error.response?.data || "Error creating service")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    try {
      await apiService.deleteService(id)
      fetchServices()
    } catch (error: any) {
      alert(error.response?.data || "Error deleting service")
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage hotel services and amenities</p>
        </div>
        {(isAdmin || isManager || isReceptionniste) && (
          <button
            onClick={() => {
              setFormData({ libelle: "", tarifUnitaire: 0 })
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Add Service
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No services found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first service to get started</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.serviceId}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group"
            >
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {service.libelle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{service.libelle}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Service ID: {service.serviceId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">${service.tarifUnitaire.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per unit</p>
                  </div>
                  {(isAdmin || isManager || isReceptionniste) && (
                    <button
                      onClick={() => handleDelete(service.serviceId)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Service</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        value={formData.libelle}
                        onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                        placeholder="e.g., Room Service, Spa Treatment"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          value={formData.tarifUnitaire}
                          onChange={(e) =>
                            setFormData({ ...formData, tarifUnitaire: Number.parseFloat(e.target.value) })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-base font-medium text-white hover:from-indigo-700 hover:to-indigo-800 sm:w-auto transition-all"
                  >
                    Add Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
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
