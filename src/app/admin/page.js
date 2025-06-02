'use client'

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Zap, Heart, Award, ExternalLink, Copy } from 'lucide-react';
import { getAllAthletes } from '../../lib/supabase';

export default function AdminDashboard() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completedToday: 0,
    pending: 0,
    averageEnergy: 0,
    averageMood: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAllAthletes();
      setAthletes(data);
      
      const today = new Date().toISOString().split('T')[0];
      const completedToday = data.filter(athlete => 
        athlete.checkins.some(checkin => checkin.date === today)
      ).length;
      
      const allCheckins = data.flatMap(athlete => athlete.checkins);
      const recentCheckins = allCheckins.filter(checkin => {
        const checkinDate = new Date(checkin.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return checkinDate >= weekAgo;
      });
      
      const avgEnergy = recentCheckins.length > 0 
        ? (recentCheckins.reduce((sum, c) => sum + c.energy, 0) / recentCheckins.length).toFixed(1)
        : 0;
      
      const avgMood = recentCheckins.length > 0
        ? (recentCheckins.reduce((sum, c) => sum + c.mood, 0) / recentCheckins.length).toFixed(1)
        : 0;
      
      setStats({
        total: data.length,
        completedToday,
        pending: data.length - completedToday,
        averageEnergy: avgEnergy,
        averageMood: avgMood
      });
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('¡Link copiado!');
  };

  const getAthleteStatus = (athlete) => {
    const today = new Date().toISOString().split('T')[0];
    const todayCheckin = athlete.checkins.find(c => c.date === today);
    return todayCheckin ? 'completed' : 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Samuka</h1>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Samuka - Panel de Control</h1>
              <p className="text-blue-100">Gestión de Deportistas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Completaron Hoy</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pendientes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Energía Promedio</p>
                <p className="text-2xl font-bold text-gray-800">{stats.averageEnergy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ánimo Promedio</p>
                <p className="text-2xl font-bold text-gray-800">{stats.averageMood}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Mis Deportistas
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Deportista</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Deporte</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Último</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Link</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {athletes.map((athlete) => {
                  const status = getAthleteStatus(athlete);
                  const lastCheckin = athlete.checkins[athlete.checkins.length - 1];
                  const appUrl = `${window.location.origin}/${athlete.code}`;

                  return (
                    <tr key={athlete.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {athlete.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{athlete.name}</p>
                            <p className="text-sm text-gray-500">{athlete.checkins.length} registros</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {athlete.sport}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status === 'completed' ? '✅ Completado' : '⏰ Pendiente'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        {lastCheckin ? (
                          <div>
                            <p className="text-sm text-gray-800">
                              {new Date(lastCheckin.date).toLocaleDateString('es')}
                            </p>
                            <p className="text-xs text-gray-500">
                              E:{lastCheckin.energy} A:{lastCheckin.mood}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sin registros</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            /{athlete.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(appUrl)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => window.open(appUrl, '_blank')}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {athletes.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay deportistas registrados aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
