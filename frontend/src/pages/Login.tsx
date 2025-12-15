import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { LoginRequest } from '../types';

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    login: '',
    motDePasse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { login: formData.login, passwordLength: formData.motDePasse.length });
      const response = await apiService.login(formData);
      console.log('Login successful:', response);
      login(response);
      navigate('/');
    } catch (err: any) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        request: err.request,
      });
      
      // Handle different error formats
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        // Backend returned an error response
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          errorMessage = typeof data === 'string' ? data : 'Invalid username or password.';
        } else if (status === 404) {
          errorMessage = 'Backend endpoint not found. Is the backend running?';
        } else if (status === 500) {
          errorMessage = 'Server error. Check backend logs.';
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Error ${status}: ${JSON.stringify(data)}`;
        }
      } else if (err.request) {
        // Request was made but no response received (CORS, network error, etc.)
        errorMessage = 'Cannot connect to the server. Please check:\n' +
          '1. Is the backend running on http://localhost:8080?\n' +
          '2. Check browser console (F12) for CORS errors\n' +
          '3. Check network tab for failed requests';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-line">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="login" className="sr-only">
                Username
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="motDePasse" className="sr-only">
                Password
              </label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

