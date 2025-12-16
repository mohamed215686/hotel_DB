import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Facture, Reservation } from '../types';
import { format, parseISO } from 'date-fns';

export default function Factures() {
  const { isAdmin, isManager, isReceptionniste } = useAuth();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reservationsData = await apiService.getReservations();
      setReservations(reservationsData || []);
      const facturesData = await apiService.getFactures(); // new
      setFactures(facturesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservationId || selectedReservationId === 0) {
      alert('Please select a reservation.');
      return;
    }
    setCreating(true);
    try {
      const message = await apiService.createFacture(selectedReservationId);
      // The backend returns a message — often including the new facture ID.
      // Try to extract a numeric ID from the string.
      const match = (message || '').match(/(\d+)/);
      if (match) {
        const newId = parseInt(match[1], 10);
        try {
          // Cast the backend response to `any` so we can safely normalize unexpected keys
          const raw: any = await apiService.getFactureById(newId);

const normalized: Facture = {
  factureId: (raw.factureId ?? raw.FACTURE_ID ?? raw.id ?? newId) as number,
  reservationId: (raw.reservationId ?? raw.resId ?? raw.RES_ID ?? 0) as number,
  montantTotal: typeof raw.montantTotal !== 'undefined' ? Number(raw.montantTotal)
               : typeof raw.montTotal !== 'undefined' ? Number(raw.montTotal)
               : typeof raw.MONT_TOTAL !== 'undefined' ? Number(raw.MONT_TOTAL)
               : 0,
  statutPaiement: raw.statutPaiement ?? raw.statut ?? raw.STATUT_PAIEMENT ?? 'INCONNU',
  dateCreation: raw.dateCreation ?? raw.dateEmission ?? raw.DATE_EMISSION ?? undefined,
  datePaiement: raw.datePaiement ?? raw.paidAt ?? raw.DATE_PAIEMENT ?? undefined,
};
          setFactures((prev) => [normalized, ...prev]);
          alert('Invoice created: ID ' + newId);
        } catch (err) {
          // If fetching the created invoice fails, still show the raw message
          console.warn('Created invoice id but failed to fetch full facture:', err);
          alert('Invoice created (could not fetch full details): ' + message);
        }
      } else {
        // No ID parsed — show the server message
        alert(message);
      }
      setShowModal(false);
      setSelectedReservationId(0);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      alert(error.response?.data || error.message || 'Error creating invoice');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    if (!confirm('Mark this invoice as paid?')) return;
    try {
      const message = await apiService.markFacturePaid(id);
      alert(message);
      // Update local copy (statut Paiement and datePaiement)
      setFactures((prev) =>
        prev.map((f) => (f.factureId === id ? { ...f, statutPaiement: 'PAYÉ', datePaiement: new Date().toISOString() } : f))
      );
    } catch (error: any) {
      console.error('Error marking invoice paid:', error);
      alert(error.response?.data || error.message || 'Error marking invoice as paid');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        {(isAdmin || isManager || isReceptionniste) && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create Invoice
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">
            Use the "Create Invoice" button to generate an invoice for a reservation.
            Invoices will appear below once created (note: the backend currently does not provide a "list all invoices" API).
          </p>
          <p className="text-gray-500 mt-2">
            Note: To view an existing invoice you already have the invoice ID — staff can create and then view the created invoice here.
          </p>
        </div>
      </div>

      {factures.length > 0 && (
        <div className="bg-white shadow sm:rounded-md mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Recently Created Invoices</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {factures.map((f) => (
                    <tr key={f.factureId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{f.factureId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{f.reservationId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof f.montantTotal === 'number' ? f.montantTotal.toFixed(2) : f.montantTotal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.statutPaiement ?? 'INCONNU'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.dateCreation ? format(parseISO(f.dateCreation), 'yyyy-MM-dd HH:mm') : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {f.statutPaiement !== 'Payé' && (
                          <button className="text-sm text-green-600 hover:underline mr-3" onClick={() => handleMarkPaid(f.factureId)}>Mark Paid</button>
                        )}
                        <button className="text-sm text-blue-600 hover:underline" onClick={async () => {
                          try {
                            const refreshed = await apiService.getFactureById(f.factureId);
                            alert(JSON.stringify(refreshed));
                          } catch (err) {
                            console.error('Error fetching facture', err);
                            alert('Error fetching facture details');
                          }
                        }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateFacture}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create Invoice
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Reservation
                      </label>
                      <select
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        value={selectedReservationId}
                        onChange={(e) =>
                          setSelectedReservationId(parseInt(e.target.value || '0', 10))
                        }
                      >
                        <option value={0}>Select a reservation</option>
                        {reservations
                          .filter((r) => (r.statut ?? '').toLowerCase().includes('en cours') || (r.statut ?? '').toLowerCase().includes('confirm'))
                          .map((reservation) => (
                            <option key={reservation.reservationId} value={reservation.reservationId}>
                              #{reservation.reservationId} — {reservation.clientId} — {reservation.dateDebut ? format(parseISO(reservation.dateDebut), 'yyyy-MM-dd') : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedReservationId(0);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto"
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
  );
}