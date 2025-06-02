'use client'

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, TrendingUp, Zap, Heart, CheckCircle, ArrowLeft, Sparkles, Target, Award, AlertCircle } from 'lucide-react';
import { getAthleteData, saveCheckin } from '../../lib/supabase';

export default function AthletePage({ params }) {
  const [currentView, setCurrentView] = useState('daily');
  const [todayEntry, setTodayEntry] = useState({ energy: null, mood: null });
  const [entries, setEntries] = useState([]);
  const [athlete, setAthlete] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAthleteData = async () => {
      try {
        setLoading(true);
        const data = await getAthleteData(params.athleteCode);
        
        if (!data) {
          setError('Deportista no encontrado');
          return;
        }

        setAthlete(data.athlete);
        
        const processedEntries = data.checkins.map(checkin => ({
          date: checkin.date,
          energy: checkin.energy,
          mood: checkin.mood,
          day: new Date(checkin.date).toLocaleDateString('es', { weekday: 'short' })
        }));
        
        setEntries(processedEntries);
        
        const today = new Date().toISOString().split('T')[0];
        const todayCheckin = data.checkins.find(c => c.date === today);
        if (todayCheckin) {
          setSubmitted(true);
          setTodayEntry({ energy: todayCheckin.energy, mood: todayCheckin.mood });
        }
        
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAthleteData();
  }, [params.athleteCode]);

  const handleSubmit = async () => {
    if (!todayEntry.energy || !todayEntry.mood || !athlete) return;

    try {
      setLoading(true);
      const { error } = await saveCheckin(athlete.id, todayEntry.energy, todayEntry.mood);
      
      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      const newEntry = {
        date: today,
        energy: todayEntry.energy,
        mood: todayEntry.mood,
        day: new Date().toLocaleDateString('es', { weekday: 'short' })
      };
      
      setEntries([...entries, newEntry]);
      setSubmitted(true);
      
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEnergyEmoji = (value) => {
    if (value <= 3) return '🔋';
    if (value <= 6) return '⚡';
    return '🚀';
  };

  const getMoodEmoji = (value) => {
    if (value <= 3) return '😔';
    if (value <= 6) return '😊';
    return '🔥';
  };

  const ScaleButton = ({ value, currentValue, setValue, type }) => {
    const isSelected = currentValue === value;
    const emoji = type === 'energy' ? getEnergyEmoji(value) : getMoodEmoji(value);
    
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setValue(value)}
          disabled={loading}
          className={`w-12 h-12 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
            isSelected 
              ? type === 'energy'
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110 shadow-orange-200' 
                : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white scale-110 shadow-purple-200'
              : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:scale-105'
          } ${isSelected ? 'shadow-xl' : 'hover:shadow-md'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSelected ? emoji : value}
        </button>
        {isSelected && (
          <div className="text-xs font-semibold text-gray-600 animate-pulse">
            {value === 10 ? '¡MÁXIMO!' : value >= 8 ? 'Excelente' : value >= 6 ? 'Bien' : value >= 4 ? 'Regular' : 'Bajo'}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Samuka</h1>
          <p className="text-gray-600 font-semibold">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-red-50 via-white to-orange-50 min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'daily') {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-8 rounded-b-[2.5rem]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">¡Hola {athlete?.name?.split(' ')[0]}!</h1>
                  <p className="text-blue-100 text-sm">¿Cómo te sientes hoy?</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">📅 {new Date().toLocaleDateString('es', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p className="text-xs text-blue-100 mt-1">{athlete?.sport}</p>
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-8">
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Perfecto! 🎉</h2>
              <p className="text-gray-600 mb-6">Tu registro de hoy se guardó correctamente</p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getEnergyEmoji(todayEntry.energy)}</div>
                    <div className="text-sm font-semibold text-gray-600">Energía: {todayEntry.energy}/10</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getMoodEmoji(todayEntry.mood)}</div>
                    <div className="text-sm font-semibold text-gray-600">Ánimo: {todayEntry.mood}/10</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setCurrentView('analytics')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Ver mi progreso 📊
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Nivel de Energía</h2>
                <p className="text-gray-600 text-sm">¿Cómo sientes tu energía física hoy?</p>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <ScaleButton 
                    key={num}
                    value={num} 
                    currentValue={todayEntry.energy}
                    setValue={(val) => setTodayEntry({...todayEntry, energy: val})}
                    type="energy"
                  />
                ))}
              </div>
              
              {todayEntry.energy && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-semibold text-orange-700">
                    {todayEntry.energy >= 8 ? '¡Energía alta! Perfecto para entrenar intenso 🚀' : 
                     todayEntry.energy >= 6 ? 'Energía moderada, buen día para entrenar 💪' :
                     todayEntry.energy >= 4 ? 'Energía baja, considera entrenamiento suave 🚶‍♂️' :
                     'Energía muy baja, prioriza el descanso 😴'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-pink-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Estado de Ánimo</h2>
                <p className="text-gray-600 text-sm">¿Cómo te sientes mentalmente?</p>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <ScaleButton 
                    key={num}
                    value={num} 
                    currentValue={todayEntry.mood}
                    setValue={(val) => setTodayEntry({...todayEntry, mood: val})}
                    type="mood"
                  />
                ))}
              </div>
              
              {todayEntry.mood && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-semibold text-purple-700">
                    {todayEntry.mood >= 8 ? '¡Ánimo excelente! Día perfecto para desafíos 🔥' : 
                     todayEntry.mood >= 6 ? 'Buen ánimo, mantén el momentum positivo 😊' :
                     todayEntry.mood >= 4 ? 'Ánimo regular, cuida tu bienestar mental 💚' :
                     'Ánimo bajo, busca apoyo y autocuidado 🤗'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSubmit}
                disabled={!todayEntry.energy || !todayEntry.mood || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'Guardando...' :
                 !todayEntry.energy || !todayEntry.mood ? 
                  'Completa ambas evaluaciones ⏳' : 
                  'Guardar mi check-in ✨'
                }
              </button>

              <button 
                onClick={() => setCurrentView('analytics')}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                📊 Ver mi historial
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const averageEnergy = entries.length ? (entries.reduce((acc, e) => acc + e.energy, 0) / entries.length).toFixed(1) : '0';
  const averageMood = entries.length ? (entries.reduce((acc, e) => acc + e.mood, 0) / entries.length).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-6">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mi Progreso</h1>
                <p className="text-blue-100 text-sm">{athlete?.name} - {athlete?.sport}</p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('daily')}
              className="bg-white bg-opacity-20 px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-700">Energía Promedio</span>
                <div className="text-3xl font-bold text-orange-600">{averageEnergy}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-700">Ánimo Promedio</span>
                <div className="text-3xl font-bold text-purple-600">{averageMood}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-700">Total Registros</span>
                <div className="text-3xl font-bold text-green-600">{entries.length}</div>
              </div>
            </div>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-500" />
              Tu Evolución
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={entries.slice(-14)}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis domain={[0, 10]} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [value, name === 'energy' ? '⚡ Energía' : '💜 Ánimo']}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="#f97316"
                  strokeWidth={3}
                  fill="url(#energyGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fill="url(#moodGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {entries.length === 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Comienza tu seguimiento!</h3>
            <p className="text-gray-600 mb-6">Realiza tu primer check-in para ver tus gráficos</p>
            <button 
              onClick={() => setCurrentView('daily')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Hacer check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
