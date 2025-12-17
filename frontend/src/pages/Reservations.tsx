

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import type { Reservation, ReservationCreate, Chambre, Service, Client } from "../types"
import { format } from "date-fns"
import {
  FaCalendarAlt,
  FaBed,
  FaUser,
  FaTimesCircle,
  FaPlus,
  FaConciergeBell,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa"
import Toast from "../components/Toast"

export default function Reservations() {
  const { isAdmin, isManager, isReceptionniste, user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [chambres, setChambres] = useState<Chambre[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [reservationServices, setReservationServices] = useState<Service[]>([])
  const [userClientId, setUserClientId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [formData, setFormData] = useState<ReservationCreate>({
    clientId: 0,
    chambreId: 0,
    dateDebut: "",
    dateFin: "",
    statut: "Confirmée",
  })
  const [error, setError] = useState("")

  const selectedReservationId = selectedReservation
    ? (selectedReservation as any).resId || selectedReservation.reservationId
    : null

  const isStartDateToday = (reservation: Reservation | null) => {
    if (!reservation || !reservation.dateDebut) return false
    const start = new Date(reservation.dateDebut)
    const today = new Date()
    return (
      start.getFullYear() === today.getFullYear() &&
      start.getMonth() === today.getMonth() &&
      start.getDate() === today.getDate()
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [resData, chambresData, servicesData, clientsData] = await Promise.all([
        apiService.getReservations(),
        apiService.getChambres(),
        apiService.getServices(),
        isAdmin || isManager || isReceptionniste ? apiService.getClients() : Promise.resolve([]),
      ])
      setReservations(resData)
      setChambres(chambresData)
      setServices(servicesData)
      setClients(clientsData)

      if (!isAdmin && !isManager && !isReceptionniste && resData.length > 0) {
        setUserClientId(resData[0].clientId)
        setFormData((prev) => ({ ...prev, clientId: resData[0].clientId }))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      let clientIdToUse = formData.clientId

      if (!isAdmin && !isManager && !isReceptionniste) {
        if (userClientId) {
          clientIdToUse = userClientId
        } else if (formData.clientId && formData.clientId > 0) {
          clientIdToUse = formData.clientId
        } else {
          setError("Unable to determine your client ID. Please contact support.")
          return
        }
      }

      if (!clientIdToUse || clientIdToUse === 0) {
        setError("Please select a client.")
        return
      }

      if (!formData.chambreId || formData.chambreId === 0) {
        setError("Please select a room.")
        return
      }

      if (!formData.dateDebut || !formData.dateFin) {
        setError("Please select both start and end dates.")
        return
      }

      const startDate = new Date(formData.dateDebut)
      const endDate = new Date(formData.dateFin)
      if (endDate <= startDate) {
        setError("End date must be after start date.")
        return
      }

      const data: ReservationCreate = {
        clientId: clientIdToUse,
        chambreId: formData.chambreId,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        statut: "Confirmée",
      }

      const result = await apiService.createReservation(data)
      setShowModal(false)
      setFormData({
        clientId: userClientId || 0,
        chambreId: 0,
        dateDebut: "",
        dateFin: "",
        statut: "Confirmée",
      })
      setError("")
      alert(result || "Reservation created successfully!")
      fetchData()
    } catch (error: any) {
      const errorMsg = error.response?.data || "Error creating reservation"
      setError(errorMsg)
      console.error("Reservation creation error:", error)
    }
  }

  const handleCheckIn = async (id: number) => {
    if (!confirm("Check in this reservation?")) return
    try {
      const result = await apiService.checkIn(id)
      const message = result && typeof result === "string" ? result : "Check-in successful!"
      setToast({ message, type: "success" })
      await fetchData()
    } catch (error: any) {
      let errorMsg = "Error checking in"
      if (error.response?.data) {
        const data = error.response.data
        errorMsg = typeof data === "string" ? data : data.error || data.message || JSON.stringify(data)
      } else if (error.message) {
        errorMsg = error.message
      }
      setToast({ message: errorMsg, type: "error" })
    }
  }

  const handleCheckOut = async (id: number) => {
    if (!confirm("Check out this reservation?")) return
    try {
      const result = await apiService.checkOut(id)
      const message = result && typeof result === "string" ? result : "Check-out successful!"
      setToast({ message, type: "success" })
      await fetchData()
    } catch (error: any) {
      let errorMsg = "Error checking out"
      if (error.response?.data) {
        const data = error.response.data
        errorMsg = typeof data === "string" ? data : data.error || data.message || JSON.stringify(data)
      } else if (error.message) {
        errorMsg = error.message
      }
      setToast({ message: errorMsg, type: "error" })
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return
    setLoadingAction(`cancel-${id}`)
    try {
      console.log("Canceling reservation:", id)
      const result = await apiService.cancelReservation(id)
      console.log("Cancel result:", result)
      const message = result && typeof result === "string" ? result : "Reservation cancelled successfully!"
      setToast({ message, type: "success" })
      await fetchData()
    } catch (error: any) {
      console.error("Cancel error:", error)
      let errorMsg = "Error canceling reservation"
      if (error.response?.data) {
        const data = error.response.data
        errorMsg = typeof data === "string" ? data : data.error || data.message || JSON.stringify(data)
      } else if (error.message) {
        errorMsg = error.message
      }
      setToast({ message: errorMsg, type: "error" })
    } finally {
      setLoadingAction(null)
    }
  }

  const handleViewServices = async (reservation: Reservation) => {
    try {
      const reservationId = (reservation as any).resId || reservation.reservationId
      console.log("Fetching services for reservation:", reservationId)
      console.log("Reservation object:", reservation)
      const resServices = await apiService.getReservationServices(reservationId)
      console.log("Reservation services response:", resServices)
      console.log("Is array?", Array.isArray(resServices))

      if (Array.isArray(resServices)) {
        setReservationServices(resServices)
        setSelectedReservation(reservation)
        setShowServiceModal(true)
      } else if (typeof resServices === "string") {
        setToast({ message: resServices, type: "error" })
      } else {
        console.error("Unexpected response type:", typeof resServices, resServices)
        setToast({ message: "Unexpected response format from server", type: "error" })
      }
    } catch (error: any) {
      console.error("Error fetching services - Full error:", error)
      console.error("Error response:", error.response)
      console.error("Error message:", error.message)

      let errorMsg = "Error fetching services"
      if (error.response) {
        if (typeof error.response.data === "string") {
          errorMsg = error.response.data
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message
        } else {
          errorMsg = `Server error: ${error.response.status} ${error.response.statusText}`
        }
      } else if (error.message) {
        errorMsg = error.message
      }

      setToast({ message: errorMsg, type: "error" })
    }
  }

  const handleAddService = async (serviceId: number) => {
    if (!selectedReservation) {
      console.error("No reservation selected")
      setToast({ message: "No reservation selected", type: "error" })
      return
    }

    const reservationId = (selectedReservation as any).resId || selectedReservation.reservationId

    if (!reservationId) {
      console.error("Reservation ID is missing. Full object:", selectedReservation)
      setToast({ message: "Invalid reservation ID", type: "error" })
      return
    }

    if (!isAdmin && !isManager && !isReceptionniste) {
      setToast({ message: "Only staff members can add services to reservations.", type: "error" })
      return
    }

    setLoadingAction(`add-service-${serviceId}`)
    try {
      const reservationId = (selectedReservation as any).resId || selectedReservation.reservationId
      console.log("Adding service:", serviceId, "to reservation:", reservationId)
      console.log("Selected reservation object:", selectedReservation)
      const result = await apiService.addServiceToReservation(reservationId, serviceId)
      console.log("Add service result:", result)
      const message = result && typeof result === "string" ? result : "Service added successfully!"

      if (result && (result.includes("déjà inclus") || result.includes("déjà") || result.includes("déja"))) {
        setToast({ message, type: "warning" })
      } else {
        setToast({ message, type: "success" })
      }

      if (showServiceModal) {
        await handleViewServices(selectedReservation)
      }
      await fetchData()

      if (showAddServiceModal) {
        setShowAddServiceModal(false)
      }
    } catch (error: any) {
      console.error("Add service error:", error)
      let errorMsg = "Error adding service"

      if (error.response) {
        const data = error.response.data
        if (typeof data === "string") {
          errorMsg = data
        } else if (data && typeof data === "object") {
          errorMsg = data.error || data.message || `Error ${data.status || error.response.status}`
        } else {
          errorMsg = `Server error: ${error.response.status} ${error.response.statusText}`
        }
      } else if (error.message) {
        errorMsg = error.message
      }

      setToast({ message: errorMsg, type: "error" })
    } finally {
      setLoadingAction(null)
    }
  }

  const handleQuickAddService = (reservation: Reservation) => {
    if (!isAdmin && !isManager && !isReceptionniste) {
      setToast({ message: "Only staff members can add services to reservations.", type: "error" })
      return
    }

    const reservationId = (reservation as any).resId || reservation.reservationId

    if (!reservation || !reservationId) {
      console.error("Invalid reservation:", reservation)
      setToast({ message: "Invalid reservation data", type: "error" })
      return
    }

    console.log("Setting selected reservation:", reservation)
    console.log("Reservation ID:", reservationId)
    setSelectedReservation(reservation)
    setShowAddServiceModal(true)
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Confirmée":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "En cours":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Annulée":
        return "bg-red-100 text-red-700 border-red-200"
      case "Terminée":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="text-white text-lg" />
            </div>
            Reservations
          </h1>
          <p className="mt-2 text-sm text-gray-500">Manage hotel reservations and bookings</p>
        </div>
        <button
          onClick={() => {
            setError("")
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
        >
          <FaPlus />
          New Reservation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl">
          <div className="flex">
            <FaTimesCircle className="text-red-400 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-indigo-600 text-2xl" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No reservations found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first reservation to get started</p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const reservationId = (reservation as any).resId || reservation.reservationId
            return (
              <div
                key={reservationId}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {reservationId}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Reservation #{reservationId}</h3>
                          <span
                            className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              reservation.statut,
                            )}`}
                          >
                            {reservation.statut}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaBed className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Room</p>
                            <p className="font-semibold text-gray-900">{reservation.chambreId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FaUser className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Client ID</p>
                            <p className="font-semibold text-gray-900">{reservation.clientId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900 text-sm">
                              {format(new Date(reservation.dateDebut), "MMM dd")} -{" "}
                              {format(new Date(reservation.dateFin), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {(isAdmin || isManager || isReceptionniste) && (
                        <button
                          onClick={() => handleQuickAddService(reservation)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          <FaPlus className="text-sm" />
                          Add Service
                        </button>
                      )}
                      <button
                        onClick={() => handleViewServices(reservation)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                      >
                        <FaConciergeBell />
                        View Services
                      </button>
                      {(isAdmin || isManager || isReceptionniste) && (
                        <>
                          {reservation.statut === "Confirmée" && isStartDateToday(reservation) && (
                            <button
                              onClick={() => handleCheckIn(reservationId)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                            >
                              <FaSignInAlt />
                              Check In
                            </button>
                          )}
                          {reservation.statut === "En cours" && (
                            <button
                              onClick={() => handleCheckOut(reservationId)}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap"
                            >
                              <FaSignOutAlt />
                              Check Out
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleCancel(reservationId)}
                        disabled={loadingAction === `cancel-${reservationId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loadingAction === `cancel-${reservationId}` ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                            Canceling...
                          </>
                        ) : (
                          <>
                            <FaTimesCircle />
                            Cancel
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaPlus className="text-white" />
                </div>
                New Reservation
              </h2>
            </div>
            <form onSubmit={handleCreateReservation} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  Client
                </label>
                {isAdmin || isManager || isReceptionniste ? (
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: Number.parseInt(e.target.value) })}
                  >
                    <option value={0}>Select a client</option>
                    {clients.map((client) => (
                      <option key={client.clientId} value={client.clientId}>
                        {client.prenom} {client.nom} (ID: {client.clientId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={formData.clientId || ""}
                    onChange={(e) => setFormData({ ...formData, clientId: Number.parseInt(e.target.value) })}
                    placeholder="Your Client ID"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaBed className="text-gray-400" />
                  Room
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.chambreId}
                  onChange={(e) => setFormData({ ...formData, chambreId: Number.parseInt(e.target.value) })}
                >
                  <option value={0}>Select a room</option>
                  {chambres
                    .filter((c) => c.statut === "Disponible")
                    .map((chambre) => (
                      <option key={chambre.chambreId} value={chambre.chambreId}>
                        {chambre.numero} - {chambre.type} (${chambre.prixNuitee}/night)
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
                >
                  Create Reservation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setError("")
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddServiceModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaPlus className="text-white" />
                </div>
                Add Service to Reservation #{selectedReservation.reservationId}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {services.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No services available.</p>
                ) : (
                  services.map((service) => (
                    <button
                      key={service.serviceId}
                      onClick={() => handleAddService(service.serviceId)}
                      disabled={loadingAction === `add-service-${service.serviceId}`}
                      className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl transition-all border border-purple-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <FaConciergeBell className="text-white" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {loadingAction === `add-service-${service.serviceId}` ? "Adding..." : service.libelle}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {loadingAction === `add-service-${service.serviceId}` ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          ) : (
                            <>
                              <span className="text-purple-600 font-bold text-lg">
                                ${service.tarifUnitaire.toFixed(2)}
                              </span>
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaPlus className="text-purple-600" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowAddServiceModal(false)
                    setSelectedReservation(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowAddServiceModal(false)
                    handleViewServices(selectedReservation)
                    setShowServiceModal(true)
                  }}
                  className="flex-1 px-6 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                >
                  View All Services
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showServiceModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaConciergeBell className="text-white" />
                </div>
                Services for Reservation #{selectedReservationId}
              </h2>

              {(isAdmin || isManager || isReceptionniste) && selectedReservationId && (
                <div className="flex items-center gap-2">
                  {selectedReservation &&
                    selectedReservation.statut === "Confirmée" &&
                    isStartDateToday(selectedReservation) && (
                      <button
                        onClick={() => {
                          if (confirm("Check in this reservation?")) {
                            handleCheckIn(selectedReservationId as number)
                            setShowServiceModal(false)
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                      >
                        <FaSignInAlt />
                        Check In
                      </button>
                    )}
                  {selectedReservation && selectedReservation.statut === "En cours" && (
                    <button
                      onClick={() => {
                        if (confirm("Check out this reservation?")) {
                          handleCheckOut(selectedReservationId as number)
                          setShowServiceModal(false)
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap"
                    >
                      <FaSignOutAlt />
                      Check Out
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {!Array.isArray(reservationServices) || reservationServices.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {typeof reservationServices === "string" ? reservationServices : "No services added yet."}
                  </p>
                ) : (
                  reservationServices.map((service) => (
                    <div
                      key={service.serviceId}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <FaConciergeBell className="text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{service.libelle}</span>
                      </div>
                      <span className="text-indigo-600 font-bold text-lg">${service.tarifUnitaire.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
              {(isAdmin || isManager || isReceptionniste) && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Service</h3>
                  <div className="space-y-2">
                    {services.length === 0 ? (
                      <p className="text-gray-500 text-center py-2">No services available.</p>
                    ) : (
                      services.map((service) => (
                        <button
                          key={service.serviceId}
                          onClick={() => handleAddService(service.serviceId)}
                          disabled={loadingAction === `add-service-${service.serviceId}`}
                          className="w-full text-left p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              {loadingAction === `add-service-${service.serviceId}` ? "Adding..." : service.libelle}
                            </span>
                            <span className="text-indigo-600 font-semibold">${service.tarifUnitaire.toFixed(2)}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowServiceModal(false)
                    setSelectedReservation(null)
                    setReservationServices([])
                  }}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
