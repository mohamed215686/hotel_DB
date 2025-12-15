import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import type { Chambre, Reservation, Service } from '../types';
import { 
  FaBed, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaSync, 
  FaConciergeBell,
  FaArrowRight
} from 'react-icons/fa';

export default function Dashboard() {
  const { user, isAdmin, isManager, isReceptionniste } = useAuth();
  const [stats, setStats] = useState({
    totalChambres: 0,
    availableChambres: 0,
    totalReservations: 0,
    activeReservations: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [chambres, reservations, services] = await Promise.all([
          apiService.getChambres(),
          apiService.getReservations(),
          apiService.getServices(),
        ]);

        const availableChambres = chambres.filter((c) => c.statut === 'Disponible').length;
        const activeReservations = reservations.filter(
          (r) => r.statut === 'Confirmée' || r.statut === 'En cours'
        ).length;

        setStats({
          totalChambres: chambres.length,
          availableChambres,
          totalReservations: reservations.length,
          activeReservations,
          totalServices: services.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Rooms',
      value: stats.totalChambres,
      icon: FaBed,
      color: 'from-blue-500 to-blue-600',
      link: '/chambres',
    },
    {
      title: 'Available Rooms',
      value: stats.availableChambres,
      icon: FaCheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Reservations',
      value: stats.totalReservations,
      icon: FaCalendarAlt,
      color: 'from-purple-500 to-purple-600',
      link: '/reservations',
    },
    {
      title: 'Active Reservations',
      value: stats.activeReservations,
      icon: FaSync,
      color: 'from-orange-500 to-orange-600',
    },
    ...(isAdmin || isManager || isReceptionniste
      ? [
          {
            title: 'Total Services',
            value: stats.totalServices,
            icon: FaConciergeBell,
            color: 'from-pink-500 to-pink-600',
            link: '/services',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, <span className="font-semibold text-blue-600">{user?.username}</span>! 
          <span className="text-gray-500"> ({user?.roleName})</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const CardContent = (
            <div className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${card.link ? 'cursor-pointer' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <Icon className="text-3xl" />
                </div>
              </div>
              {card.link && (
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-blue-100 transition-colors">
                  View all <FaArrowRight />
                </div>
              )}
            </div>
          );

          return card.link ? (
            <Link key={index} to={card.link} className="block">
              {CardContent}
            </Link>
          ) : (
            <div key={index}>{CardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
