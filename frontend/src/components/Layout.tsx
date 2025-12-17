"use client"

import { Outlet, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  FaHome,
  FaBed,
  FaCalendarAlt,
  FaConciergeBell,
  FaFileInvoice,
  FaUserCircle,
  FaUserAlt,
  FaUserCog,
  FaSignOutAlt,
  FaHotel,
} from "react-icons/fa"

export default function Layout() {
  const { user, logout, isAdmin, isManager, isReceptionniste } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                  <FaHotel className="text-xl text-zinc-100" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold tracking-tight text-zinc-50 leading-tight">
                    Hotel Management
                  </span>
                  <span className="text-xs text-zinc-500 leading-tight">Professional Suite</span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                >
                  <FaHome className="text-sm" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/chambres"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                >
                  <FaBed className="text-sm" />
                  <span>Rooms</span>
                </Link>
                <Link
                  to="/reservations"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                >
                  <FaCalendarAlt className="text-sm" />
                  <span>Reservations</span>
                </Link>
                {(isAdmin || isManager || isReceptionniste) && (
                  <>
                    <Link
                      to="/services"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                    >
                      <FaConciergeBell className="text-sm" />
                      <span>Services</span>
                    </Link>
                    <Link
                      to="/factures"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                    >
                      <FaFileInvoice className="text-sm" />
                      <span>Invoices</span>
                    </Link>
                    <Link
                      to="/clients"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                    >
                      <FaUserAlt className="text-sm" />
                      <span>Clients</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/users"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all"
                      >
                        <FaUserCog className="text-sm" />
                        <span>Users</span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/80 transition-all group"
                aria-label="Profile"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                  <FaUserCircle className="text-lg text-zinc-300" />
                </div>
                <div className="hidden md:flex flex-col leading-tight">
                  <span className="text-sm font-medium text-zinc-100">{user?.username}</span>
                  <span className="text-xs text-zinc-500">{user?.roleName}</span>
                </div>
              </Link>

              <div className="w-px h-8 bg-zinc-800" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-all"
              >
                <FaSignOutAlt className="text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
