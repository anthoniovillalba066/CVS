-- Migración: agregar columna producidas a ordenesproduccion
-- Ejecutar una sola vez en el panel SQL de Supabase

ALTER TABLE ordenesproduccion
  ADD COLUMN IF NOT EXISTS producidas INT NOT NULL DEFAULT 0;
