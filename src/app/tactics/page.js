'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Save, Trash2, Share2, Undo, Redo, Plus, Minus } from 'lucide-react';
import { saveTacticalPlay, getAllTacticalPlays, deleteTacticalPlay } from '@/lib/supabase';

// Formaciones tácticas profesionales
const FORMATIONS = {
  '4-3-3': [
    { x: 50, y: 90 }, // GK
    { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 }, // Defensores
    { x: 35, y: 55 }, { x: 50, y: 50 }, { x: 65, y: 55 }, // Mediocampistas
    { x: 25, y: 25 }, { x: 50, y: 20 }, { x: 75, y: 25 }, // Delanteros
  ],
  '4-4-2': [
    { x: 50, y: 90 }, // GK
    { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 }, // Defensores
    { x: 20, y: 50 }, { x: 40, y: 50 }, { x: 60, y: 50 }, { x: 80, y: 50 }, // Mediocampistas
    { x: 40, y: 25 }, { x: 60, y: 25 }, // Delanteros
  ],
  '3-5-2': [
    { x: 50, y: 90 }, // GK
    { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, // Defensores
    { x: 15, y: 55 }, { x: 35, y: 50 }, { x: 50, y: 45 }, { x: 65, y: 50 }, { x: 85, y: 55 }, // Mediocampistas
    { x: 40, y: 25 }, { x: 60, y: 25 }, // Delanteros
  ],
  '4-2-3-1': [
    { x: 50, y: 90 }, // GK
    { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 }, // Defensores
    { x: 40, y: 60 }, { x: 60, y: 60 }, // Pivotes
    { x: 25, y: 40 }, { x: 50, y: 35 }, { x: 75, y: 40 }, // Mediapuntas
    { x: 50, y: 20 }, // Delantero
  ],
  '3-4-3': [
    { x: 50, y: 90 }, // GK
    { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, // Defensores
    { x: 25, y: 55 }, { x: 42, y: 50 }, { x: 58, y: 50 }, { x: 75, y: 55 }, // Mediocampistas
    { x: 25, y: 25 }, { x: 50, y: 20 }, { x: 75, y: 25 }, // Delanteros
  ],
  '5-3-2': [
    { x: 50, y: 90 }, // GK
    { x: 15, y: 75 }, { x: 32, y: 75 }, { x: 50, y: 75 }, { x: 68, y: 75 }, { x: 85, y: 75 }, // Defensores
    { x: 35, y: 50 }, { x: 50, y: 45 }, { x: 65, y: 50 }, // Mediocampistas
    { x: 40, y: 25 }, { x: 60, y: 25 }, // Delanteros
  ],
};

export default function TacticsBoard() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [selectedTool, setSelectedTool] = useState('player');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentTeam, setCurrentTeam] = useState('team1');
  const [savedPlays, setSavedPlays] = useState([]);
  const [playName, setPlayName] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const FIELD_WIDTH = 800;
  const FIELD_HEIGHT = 600;
  const PLAYER_RADIUS = 15;

  // Colores para equipos
  const TEAM_COLORS = {
    team1: '#3B82F6', // Azul
    team2: '#EF4444', // Rojo
    team3: '#10B981', // Verde
  };

  useEffect(() => {
    drawField();
  }, [players, drawings]);

  // Cargar jugadas guardadas al inicio
  useEffect(() => {
    loadSavedPlays();
  }, []);

  // Cargar jugadas desde Supabase
  const loadSavedPlays = async () => {
    const plays = await getAllTacticalPlays();
    setSavedPlays(plays);
  };

  // Dibujar el campo de fútbol
  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Fondo verde
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    // Líneas del campo
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;

    // Perímetro
    ctx.strokeRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    // Línea media
    ctx.beginPath();
    ctx.moveTo(0, FIELD_HEIGHT / 2);
    ctx.lineTo(FIELD_WIDTH, FIELD_HEIGHT / 2);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 60, 0, 2 * Math.PI);
    ctx.stroke();

    // Punto central
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Áreas (superior e inferior)
    const areaWidth = 300;
    const areaHeight = 100;
    const smallAreaWidth = 150;
    const smallAreaHeight = 50;

    // Área superior
    ctx.strokeRect((FIELD_WIDTH - areaWidth) / 2, 0, areaWidth, areaHeight);
    ctx.strokeRect((FIELD_WIDTH - smallAreaWidth) / 2, 0, smallAreaWidth, smallAreaHeight);

    // Área inferior
    ctx.strokeRect((FIELD_WIDTH - areaWidth) / 2, FIELD_HEIGHT - areaHeight, areaWidth, areaHeight);
    ctx.strokeRect((FIELD_WIDTH - smallAreaWidth) / 2, FIELD_HEIGHT - smallAreaHeight, smallAreaWidth, smallAreaHeight);

    // Punto penal superior
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, 80, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Punto penal inferior
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT - 80, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Arcos del área superior
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, 80, 60, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();

    // Arcos del área inferior
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT - 80, 60, 1.3 * Math.PI, 1.7 * Math.PI);
    ctx.stroke();

    // Dibujar drawings (líneas, flechas, zonas)
    drawings.forEach(drawing => {
      if (drawing.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(drawing.x1, drawing.y1);
        ctx.lineTo(drawing.x2, drawing.y2);
        ctx.strokeStyle = drawing.color || '#FFFF00';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (drawing.type === 'arrow') {
        drawArrow(ctx, drawing.x1, drawing.y1, drawing.x2, drawing.y2, drawing.color || '#FFFF00');
      } else if (drawing.type === 'zone') {
        const radius = Math.sqrt(Math.pow(drawing.x2 - drawing.x1, 2) + Math.pow(drawing.y2 - drawing.y1, 2));
        ctx.beginPath();
        ctx.arc(drawing.x1, drawing.y1, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = drawing.color || '#FFA500';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Dibujar jugadores
    players.forEach((player, index) => {
      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = TEAM_COLORS[player.team];
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Número del jugador
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.number || (index + 1), player.x, player.y);

      // Resaltar jugador seleccionado
      if (selectedPlayer === index) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_RADIUS + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  };

  // Dibujar flecha
  const drawArrow = (ctx, x1, y1, x2, y2, color) => {
    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  // Manejo de clics en el canvas
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'player') {
      // Agregar jugador
      const newPlayer = { x, y, team: currentTeam, number: players.length + 1 };
      const newPlayers = [...players, newPlayer];
      setPlayers(newPlayers);
      saveToHistory({ players: newPlayers, drawings });
    } else if (selectedTool === 'delete') {
      // Eliminar jugador
      const playerIndex = findPlayerAtPosition(x, y);
      if (playerIndex !== -1) {
        const newPlayers = players.filter((_, i) => i !== playerIndex);
        setPlayers(newPlayers);
        saveToHistory({ players: newPlayers, drawings });
      }
    }
  };

  // Manejo de mouse down
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'move') {
      const playerIndex = findPlayerAtPosition(x, y);
      setSelectedPlayer(playerIndex);
    } else if (['line', 'arrow', 'zone'].includes(selectedTool)) {
      setIsDrawing(true);
      setDrawStart({ x, y });
    }
  };

  // Manejo de mouse move
  const handleMouseMove = (e) => {
    if (selectedTool === 'move' && selectedPlayer !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newPlayers = [...players];
      newPlayers[selectedPlayer] = { ...newPlayers[selectedPlayer], x, y };
      setPlayers(newPlayers);
    }
  };

  // Manejo de mouse up
  const handleMouseUp = (e) => {
    if (selectedTool === 'move' && selectedPlayer !== null) {
      saveToHistory({ players, drawings });
      setSelectedPlayer(null);
    } else if (isDrawing && drawStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x2 = e.clientX - rect.left;
      const y2 = e.clientY - rect.top;

      const newDrawing = {
        type: selectedTool,
        x1: drawStart.x,
        y1: drawStart.y,
        x2,
        y2,
        color: selectedTool === 'zone' ? '#FFA500' : '#FFFF00',
      };

      const newDrawings = [...drawings, newDrawing];
      setDrawings(newDrawings);
      saveToHistory({ players, drawings: newDrawings });
      setIsDrawing(false);
      setDrawStart(null);
    }
  };

  // Encontrar jugador en posición
  const findPlayerAtPosition = (x, y) => {
    return players.findIndex(player => {
      const distance = Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2));
      return distance <= PLAYER_RADIUS;
    });
  };

  // Aplicar formación
  const applyFormation = (formationName) => {
    const formation = FORMATIONS[formationName];
    const newPlayers = formation.map((pos, index) => ({
      x: (pos.x / 100) * FIELD_WIDTH,
      y: (pos.y / 100) * FIELD_HEIGHT,
      team: currentTeam,
      number: index + 1,
    }));
    setPlayers(newPlayers);
    saveToHistory({ players: newPlayers, drawings });
  };

  // Guardar en historial
  const saveToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Deshacer
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setPlayers(previousState.players);
      setDrawings(previousState.drawings);
    }
  };

  // Rehacer
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setPlayers(nextState.players);
      setDrawings(nextState.drawings);
    }
  };

  // Limpiar pizarra
  const clearBoard = () => {
    setPlayers([]);
    setDrawings([]);
    setSelectedPlayer(null);
    saveToHistory({ players: [], drawings: [] });
  };

  // Exportar como imagen
  const exportAsImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `tactica-${playName || 'jugada'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Guardar jugada
  const savePlay = async () => {
    if (!playName) {
      alert('Por favor ingresa un nombre para la jugada');
      return;
    }

    const playData = {
      name: playName,
      players,
      drawings,
    };

    const { data, error } = await saveTacticalPlay(playData);

    if (error) {
      alert('Error al guardar la jugada. Por favor intenta de nuevo.');
      console.error(error);
      return;
    }

    alert(`Jugada "${playName}" guardada exitosamente`);
    setPlayName('');
    loadSavedPlays(); // Recargar las jugadas
  };

  // Cargar jugada
  const loadPlay = (play) => {
    setPlayers(play.players);
    setDrawings(play.drawings);
    saveToHistory({ players: play.players, drawings: play.drawings });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2">Pizarra Táctica Profesional</h1>
          <p className="text-blue-200">Diseña jugadas y formaciones como un entrenador de élite</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de control */}
          <div className="lg:col-span-1 space-y-4">
            {/* Herramientas */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-white font-bold mb-3 text-lg">Herramientas</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTool('player')}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    selectedTool === 'player'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Agregar Jugador
                </button>
                <button
                  onClick={() => setSelectedTool('move')}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    selectedTool === 'move'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Mover Jugador
                </button>
                <button
                  onClick={() => setSelectedTool('arrow')}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    selectedTool === 'arrow'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Dibujar Flecha
                </button>
                <button
                  onClick={() => setSelectedTool('line')}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    selectedTool === 'line'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Dibujar Línea
                </button>
                <button
                  onClick={() => setSelectedTool('zone')}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    selectedTool === 'zone'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Marcar Zona
                </button>
                <button
                  onClick={() => setSelectedTool('delete')}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    selectedTool === 'delete'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Selección de equipo */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-white font-bold mb-3 text-lg">Equipo</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentTeam('team1')}
                  className={`w-full p-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    currentTeam === 'team1'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                  Equipo Azul
                </button>
                <button
                  onClick={() => setCurrentTeam('team2')}
                  className={`w-full p-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    currentTeam === 'team2'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                  Equipo Rojo
                </button>
                <button
                  onClick={() => setCurrentTeam('team3')}
                  className={`w-full p-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    currentTeam === 'team3'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                  Equipo Verde
                </button>
              </div>
            </div>

            {/* Formaciones */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-white font-bold mb-3 text-lg">Formaciones</h2>
              <div className="space-y-2">
                {Object.keys(FORMATIONS).map(formation => (
                  <button
                    key={formation}
                    onClick={() => applyFormation(formation)}
                    className="w-full p-3 rounded-lg font-medium bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    {formation}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-white font-bold mb-3 text-lg">Acciones</h2>
              <div className="space-y-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="w-full p-3 rounded-lg font-medium bg-white/20 text-white hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Undo size={18} />
                  Deshacer
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="w-full p-3 rounded-lg font-medium bg-white/20 text-white hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Redo size={18} />
                  Rehacer
                </button>
                <button
                  onClick={clearBoard}
                  className="w-full p-3 rounded-lg font-medium bg-red-500/80 text-white hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Limpiar Todo
                </button>
                <button
                  onClick={exportAsImage}
                  className="w-full p-3 rounded-lg font-medium bg-green-500/80 text-white hover:bg-green-500 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Exportar Imagen
                </button>
              </div>
            </div>

            {/* Guardar jugada */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-white font-bold mb-3 text-lg">Guardar Jugada</h2>
              <input
                type="text"
                value={playName}
                onChange={(e) => setPlayName(e.target.value)}
                placeholder="Nombre de la jugada..."
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 mb-2"
              />
              <button
                onClick={savePlay}
                className="w-full p-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Guardar
              </button>
            </div>

            {/* Jugadas guardadas */}
            {savedPlays.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h2 className="text-white font-bold mb-3 text-lg">Jugadas Guardadas</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedPlays.map((play, index) => (
                    <div
                      key={play.id || index}
                      className="w-full p-3 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => loadPlay(play)}
                          className="flex-1 text-left"
                        >
                          <div className="font-bold">{play.name}</div>
                          <div className="text-xs text-white/70">
                            {new Date(play.created_at || play.timestamp).toLocaleString()}
                          </div>
                        </button>
                        {play.id && (
                          <button
                            onClick={async () => {
                              if (confirm(`¿Eliminar la jugada "${play.name}"?`)) {
                                await deleteTacticalPlay(play.id);
                                loadSavedPlays();
                              }
                            }}
                            className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas del campo */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <canvas
                ref={canvasRef}
                width={FIELD_WIDTH}
                height={FIELD_HEIGHT}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full rounded-lg shadow-2xl cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto' }}
              />

              <div className="mt-4 flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                  <span className="text-white text-sm">Equipo Azul</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
                  <span className="text-white text-sm">Equipo Rojo</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                  <span className="text-white text-sm">Equipo Verde</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                  <div className="w-8 h-1 bg-yellow-400"></div>
                  <span className="text-white text-sm">Pase/Movimiento</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full border-2 border-dashed border-orange-400"></div>
                  <span className="text-white text-sm">Zona de Presión</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <p className="text-white text-sm">
                  <strong>Instrucciones:</strong> Selecciona una herramienta del panel izquierdo.
                  Haz clic en el campo para agregar jugadores. Arrastra para mover.
                  Dibuja flechas para mostrar movimientos y pases.
                  Usa las formaciones predefinidas para configuración rápida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
