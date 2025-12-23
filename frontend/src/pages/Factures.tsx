"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { apiService } from "../services/api"
import { useAuth } from "../context/AuthContext"
import type { Facture, Reservation, LigneFacture } from "../types"
import { format, parseISO } from "date-fns"
import { FaPlus, FaFileInvoice, FaCheckCircle, FaEye } from "react-icons/fa"

export default function Factures() {
  const { isAdmin, isManager, isReceptionniste } = useAuth()
  const [factures, setFactures] = useState<Facture[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState<number>(0)
  const [creating, setCreating] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null)
  const [lignes, setLignes] = useState<LigneFacture[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const reservationsData = await apiService.getReservations()
      setReservations(reservationsData || [])
      const facturesData = await apiService.getFactures()
      setFactures(facturesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFacture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReservationId || selectedReservationId === 0) {
      alert("Please select a reservation.")
      return
    }
    setCreating(true)
    try {
      const message = await apiService.createFacture(selectedReservationId)
      const match = (message || "").match(/(\d+)/)
      if (match) {
        const newId = Number.parseInt(match[1], 10)
        try {
          const raw: any = await apiService.getFactureById(newId)

          const normalized: Facture = {
            factureId: (raw.factureId ?? raw.FACTURE_ID ?? raw.id ?? newId) as number,
            reservationId: (raw.reservationId ?? raw.resId ?? raw.RES_ID ?? 0) as number,
            montantTotal:
              typeof raw.montantTotal !== "undefined"
                ? Number(raw.montantTotal)
                : typeof raw.montTotal !== "undefined"
                  ? Number(raw.montTotal)
                  : typeof raw.MONT_TOTAL !== "undefined"
                    ? Number(raw.MONT_TOTAL)
                    : 0,
            statutPaiement: raw.statutPaiement ?? raw.statut ?? raw.STATUT_PAIEMENT ?? "INCONNU",
            dateCreation: raw.dateCreation ?? raw.dateEmission ?? raw.DATE_EMISSION ?? undefined,
            datePaiement: raw.datePaiement ?? raw.paidAt ?? raw.DATE_PAIEMENT ?? undefined,
          }
          setFactures((prev) => [normalized, ...prev])
          alert("Invoice created: ID " + newId)
        } catch (err) {
          console.warn("Created invoice id but failed to fetch full facture:", err)
          alert("Invoice created (could not fetch full details): " + message)
        }
      } else {
        alert(message)
      }
      setShowModal(false)
      setSelectedReservationId(0)
    } catch (error: any) {
      console.error("Error creating invoice:", error)
      alert(error.response?.data || error.message || "Error creating invoice")
    } finally {
      setCreating(false)
    }
  }

  const handleMarkPaid = async (id: number) => {
    if (!confirm("Mark this invoice as paid?")) return
    try {
      const message = await apiService.markFacturePaid(id)
      alert(message)
      setFactures((prev) =>
        prev.map((f) =>
          f.factureId === id ? { ...f, statutPaiement: "PAYÉ", datePaiement: new Date().toISOString() } : f,
        ),
      )
    } catch (error: any) {
      console.error("Error marking invoice paid:", error)
      alert(error.response?.data || error.message || "Error marking invoice as paid")
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
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Invoices</h1>
          <p className="mt-2 text-zinc-600">Manage billing and payments</p>
        </div>
        {(isAdmin || isManager || isReceptionniste) && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <FaPlus className="text-sm" />
            Create Invoice
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
            <FaFileInvoice className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Invoice Management</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Create invoices for confirmed or ongoing reservations. Once created, invoices can be marked as paid and
              tracked below.
            </p>
          </div>
        </div>
      </div>

      {factures.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">Recent Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Reservation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-zinc-100">
                {factures.map((f) => (
                  <tr key={f.factureId} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-zinc-900">#{f.factureId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-zinc-600">#{f.reservationId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-zinc-900">
                        ${typeof f.montantTotal === "number" ? f.montantTotal.toFixed(2) : f.montantTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          f.statutPaiement === "Payé" || f.statutPaiement === "PAYÉ"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {f.statutPaiement ?? "INCONNU"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {f.dateCreation ? format(parseISO(f.dateCreation), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {f.statutPaiement !== "Payé" && f.statutPaiement !== "PAYÉ" && (
                          <button
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition-colors"
                            onClick={() => handleMarkPaid(f.factureId)}
                          >
                            <FaCheckCircle className="text-xs" />
                            Mark Paid
                          </button>
                        )}
                        <button
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors"
                          onClick={async () => {
                            setLoadingDetail(true)
                            try {
                              const refreshed = await apiService.getFactureById(f.factureId)
                              const lignesData = await apiService.getLignesFacture(f.factureId)
                              setSelectedFacture(refreshed)
                              setLignes(lignesData || [])
                              setDetailModalOpen(true)
                            } catch (err: any) {
                              console.error("Error fetching facture details", err)
                              const msg = err?.response?.data ?? err?.message ?? "Error fetching facture details"
                              alert(msg)
                            } finally {
                              setLoadingDetail(false)
                            }
                          }}
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailModalOpen && selectedFacture && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setDetailModalOpen(false)
                setSelectedFacture(null)
                setLignes([])
              }}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-zinc-900">Invoice #{selectedFacture.factureId}</h3>
                    <p className="text-sm text-zinc-600">Reservation #{selectedFacture.reservationId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-zinc-600">Status</div>
                    <div className="font-semibold">{selectedFacture.statutPaiement}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-900 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-900 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-900 uppercase">Unit</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-900 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-100">
                      {lignes.length > 0 ? (
                        lignes.map((ln) => (
                          <tr key={ln.detailId}>
                            <td className="px-4 py-2 text-sm text-zinc-700">{ln.description}</td>
                            <td className="px-4 py-2 text-sm text-right text-zinc-700">{ln.quantite ?? 0}</td>
                            <td className="px-4 py-2 text-sm text-right text-zinc-700">{"$" + (ln.prixUnitaire ?? 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right text-zinc-900 font-semibold">{"$" + (ln.sousTotal ?? ((ln.quantite ?? 0) * (ln.prixUnitaire ?? 0))).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-600">No line items</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-700 text-right">Calculated Total</td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-900 text-right">
                          {"$" + lignes.reduce((s, ln) => s + (Number(ln.sousTotal ?? (Number(ln.quantite ?? 0) * Number(ln.prixUnitaire ?? 0))) || 0), 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-700 text-right">Invoice Total</td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-900 text-right">{"$" + (typeof selectedFacture.montantTotal === 'number' ? selectedFacture.montantTotal.toFixed(2) : selectedFacture.montantTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="bg-zinc-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDetailModalOpen(false)
                    setSelectedFacture(null)
                    setLignes([])
                  }}
                  className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setShowModal(false)
                setSelectedReservationId(0)
              }}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateFacture}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-2xl font-semibold text-zinc-900 mb-6">Create New Invoice</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1.5">Select Reservation</label>
                      <select
                        required
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                        value={selectedReservationId}
                        onChange={(e) => setSelectedReservationId(Number.parseInt(e.target.value || "0", 10))}
                      >
                        <option value={0}>Select a reservation</option>
                        {reservations
                          .filter(
                            (r) =>
                              (r.statut ?? "").toLowerCase().includes("en cours") ||
                              (r.statut ?? "").toLowerCase().includes("confirm"),
                          )
                          .map((reservation) => (
                            <option key={reservation.reservationId} value={reservation.reservationId}>
                              #{reservation.reservationId} — Client {reservation.clientId} —{" "}
                              {reservation.dateDebut ? format(parseISO(reservation.dateDebut), "MMM d, yyyy") : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 px-6 py-4 flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    {creating ? "Creating…" : "Create Invoice"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedReservationId(0)
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
