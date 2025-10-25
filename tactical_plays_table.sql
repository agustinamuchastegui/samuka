-- Tabla para almacenar jugadas tácticas de fútbol
-- Ejecuta este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS tactical_plays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  players JSONB NOT NULL,
  drawings JSONB NOT NULL,
  formation TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas más rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_tactical_plays_created_at ON tactical_plays(created_at DESC);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_tactical_plays_name ON tactical_plays(name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tactical_plays ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de jugadas tácticas"
ON tactical_plays FOR SELECT
USING (true);

-- Política para permitir inserción pública (puedes restringir esto más adelante)
CREATE POLICY "Permitir inserción pública de jugadas tácticas"
ON tactical_plays FOR INSERT
WITH CHECK (true);

-- Política para permitir actualización pública (puedes restringir esto más adelante)
CREATE POLICY "Permitir actualización pública de jugadas tácticas"
ON tactical_plays FOR UPDATE
USING (true);

-- Política para permitir eliminación pública (puedes restringir esto más adelante)
CREATE POLICY "Permitir eliminación pública de jugadas tácticas"
ON tactical_plays FOR DELETE
USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_tactical_plays_updated_at
BEFORE UPDATE ON tactical_plays
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
