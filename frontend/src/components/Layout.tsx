import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaBed, 
  FaCalendarAlt, 
  FaConciergeBell, 
  FaFileInvoice, 
  FaUsers, 
  FaUserCircle,
  FaSignOutAlt,
  FaHotel
} from 'react-icons/fa';

export default function Layout() {
  const { user, logout, isAdmin, isManager, isReceptionniste } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:text-blue-200 transition-colors">
                  <FaHotel className="text-2xl" />
                  Hotel Management
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaHome />
                  Dashboard
                </Link>
                <Link
                  to="/chambres"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaBed />
                  Rooms
                </Link>
                <Link
                  to="/reservations"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaCalendarAlt />
                  Reservations
                </Link>
                {(isAdmin || isManager || isReceptionniste) && (
                  <>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <FaConciergeBell />
                      Services
                    </Link>
                    <Link
                      to="/factures"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <FaFileInvoice />
                      Invoices
                    </Link>
                    <Link
                      to="/clients"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <FaUsers />
                      Clients
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <FaUserCircle />
                <span className="hidden sm:inline">{user?.username}</span>
                <span className="hidden md:inline text-blue-200">({user?.roleName})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
