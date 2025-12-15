import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Chambre, ChambreCreate } from '../types';

export default function Chambres() {
  const { isAdmin, isManager } = useAuth();
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChambre, setEditingChambre] = useState<Chambre | null>(null);
  const [formData, setFormData] = useState<ChambreCreate>({
    numero: '',
    type: '',
    prixNuitee: 0,
    statut: 'Disponible',
  });

  useEffect(() => {
    fetchChambres();
  }, []);

  const fetchChambres = async () => {
    try {
      const data = await apiService.getChambres();
      setChambres(data);
    } catch (error) {
      console.error('Error fetching chambres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChambre) {
        await apiService.updateChambre(editingChambre.chambreId, formData);
      } else {
        await apiService.createChambre(formData);
      }
      setShowModal(false);
      setEditingChambre(null);
      setFormData({ numero: '', type: '', prixNuitee: 0, statut: 'Disponible' });
      fetchChambres();
    } catch (error: any) {
      alert(error.response?.data || 'Error saving chambre');
    }
  };

  const handleEdit = (chambre: Chambre) => {
    setEditingChambre(chambre);
    setFormData({
      numero: chambre.numero,
      type: chambre.type,
      prixNuitee: chambre.prixNuitee,
      statut: chambre.statut,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await apiService.deleteChambre(id);
      fetchChambres();
    } catch (error: any) {
      alert(error.response?.data || 'Error deleting chambre');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
        {(isAdmin || isManager) && (
          <button
            onClick={() => {
              setEditingChambre(null);
              setFormData({ numero: '', type: '', prixNuitee: 0, statut: 'Disponible' });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Add Room
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {chambres.map((chambre) => (
            <li key={chambre.chambreId}>
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <p className="text-lg font-medium text-gray-900">
                      Room {chambre.numero} - {chambre.type}
                    </p>
                    <span
                      className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                        chambre.statut === 'Disponible'
                          ? 'bg-green-100 text-green-800'
                          : chambre.statut === 'Occupée'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {chambre.statut}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Price per night: ${chambre.prixNuitee.toFixed(2)}
                  </p>
                </div>
                {(isAdmin || isManager) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(chambre)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chambre.chambreId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingChambre ? 'Edit Room' : 'Add Room'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room Number</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        value={formData.prixNuitee}
                        onChange={(e) =>
                          setFormData({ ...formData, prixNuitee: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingChambre(null);
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


