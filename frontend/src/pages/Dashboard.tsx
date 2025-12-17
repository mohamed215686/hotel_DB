"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { apiService } from "../services/api"
import { Link } from "react-router-dom"
import { FaBed, FaCheckCircle, FaCalendarAlt, FaSync, FaConciergeBell, FaArrowRight, FaChartLine } from "react-icons/fa"

export default function Dashboard() {
  const { user, isAdmin, isManager, isReceptionniste } = useAuth()
  const [stats, setStats] = useState({
    totalChambres: 0,
    availableChambres: 0,
    totalReservations: 0,
    activeReservations: 0,
    totalServices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [chambres, reservations, services] = await Promise.all([
          apiService.getChambres(),
          apiService.getReservations(),
          apiService.getServices(),
        ])

        const availableChambres = chambres.filter((c) => c.statut === "Disponible").length
        const activeReservations = reservations.filter(
          (r) => r.statut === "Confirmée" || r.statut === "En cours",
        ).length

        setStats({
          totalChambres: chambres.length,
          availableChambres,
          totalReservations: reservations.length,
          activeReservations,
          totalServices: services.length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-200 border-t-zinc-900"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Rooms",
      value: stats.totalChambres,
      icon: FaBed,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/chambres",
    },
    {
      title: "Available Rooms",
      value: stats.availableChambres,
      icon: FaCheckCircle,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Reservations",
      value: stats.totalReservations,
      icon: FaCalendarAlt,
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      link: "/reservations",
    },
    {
      title: "Active Reservations",
      value: stats.activeReservations,
      icon: FaSync,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    ...(isAdmin || isManager || isReceptionniste
      ? [
          {
            title: "Total Services",
            value: stats.totalServices,
            icon: FaConciergeBell,
            bgColor: "bg-pink-50",
            iconColor: "text-pink-600",
            link: "/services",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-2 text-zinc-600 leading-relaxed">
            Welcome back, <span className="font-medium text-zinc-900">{user?.username}</span>
            <span className="text-zinc-400"> • </span>
            <span className="text-zinc-500">{user?.roleName}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-zinc-200 text-sm text-zinc-600">
          <FaChartLine className="text-emerald-500" />
          <span>All systems operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const CardContent = (
            <div
              key={index}
              className="group relative bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg hover:border-zinc-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgColor}`}>
                  <Icon className={`text-xl ${card.iconColor}`} />
                </div>
                {card.link && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                    <FaArrowRight className="text-sm text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 mb-1">{card.title}</p>
                <p className="text-3xl font-semibold text-zinc-900">{card.value}</p>
              </div>
            </div>
          )

          return card.link ? (
            <Link key={index} to={card.link} className="block">
              {CardContent}
            </Link>
          ) : (
            CardContent
          )
        })}
      </div>
    </div>
  )
}
