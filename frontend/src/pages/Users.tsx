import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ login: '', motDePasse: '', roleId: 1 });

  useEffect(() => {
    if (isAdmin) fetchData();
    else setLoading(false);
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([apiService.getUsers(), apiService.getRoles()]);
      setUsers(resUsers || []);
      setRoles(resRoles || []);
    } catch (err) {
      console.error('Error fetching users or roles', err);
      alert('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { login: form.login, motDePasseHash: form.motDePasse, roleId: form.roleId };
      const msg = await apiService.createUser(payload);
      alert(msg || 'User created');
      setShowModal(false);
      setForm({ login: '', motDePasse: '', roleId: 1 });
      await fetchData();
    } catch (err: any) {
      console.error('Create user error', err);
      alert(err.response?.data || err.message || 'Error creating user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      const msg = await apiService.deleteUser(id);
      alert(msg || 'User deleted');
      await fetchData();
    } catch (err: any) {
      console.error('Delete user error', err);
      alert(err.response?.data || err.message || 'Error deleting user');
    }
  };

  const roleMap = Object.fromEntries(roles.map((r: any) => [r.roleId ?? r.ROLE_ID, r.nomRole ?? r.NOMROLE ?? r.roleName]));

  if (!isAdmin) {
    return <div className="text-center py-8">Access denied (admin only)</div>;
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </div>

      <div className="bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((u) => (
            <li key={u.utilisateurId ?? u.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div>
                <p className="font-medium">{u.login} {u.nom ? `(${u.nom} ${u.prenom})` : ''}</p>
                <p className="text-sm text-gray-500">Role: {roleMap[u.roleId] ?? roleMap[u.role] ?? u.roleLibelle ?? 'Unknown'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(u.utilisateurId ?? u.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create User</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Login</label>
                <input required value={form.login} onChange={(e) => setForm({...form, login: e.target.value})} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input required type="password" value={form.motDePasse} onChange={(e) => setForm({...form, motDePasse: e.target.value})} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select value={form.roleId} onChange={(e) => setForm({...form, roleId: parseInt(e.target.value,10)})} className="w-full border px-3 py-2 rounded">
                  <option value={1}>Admin</option>
                  <option value={2}>Client</option>
                  <option value={3}>Manager</option>
                  <option value={4}>Receptionniste</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
