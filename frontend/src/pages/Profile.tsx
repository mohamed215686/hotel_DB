import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
  const [usernameForm, setUsernameForm] = useState({ newUsername: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.changePassword(passwordForm);
      setMessage({ type: 'success', text: response });
      setPasswordForm({ newPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data || 'Error changing password' });
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.changeUsername(usernameForm);
      setMessage({ type: 'success', text: response });
      setUsernameForm({ newUsername: '' });
      // Note: User should re-login after username change
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data || 'Error changing username' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-400 text-green-700'
              : 'bg-red-50 border border-red-400 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.roleName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.utilisateurId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.roleId}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  minLength={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Change Password
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Username</h2>
            <form onSubmit={handleChangeUsername} className="space-y-4">
              <div>
                <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700">
                  New Username
                </label>
                <input
                  type="text"
                  id="newUsername"
                  required
                  minLength={3}
                  maxLength={20}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={usernameForm.newUsername}
                  onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Change Username
              </button>
            </form>
            <p className="mt-2 text-sm text-gray-500">
              Note: You will need to log in again after changing your username.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


