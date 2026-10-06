-- ================================================================
-- ESQUEMA DE BASE DE DATOS PARA CLIMAALERT EN SUPABASE
-- ================================================================

-- 1. Habilitar la extensión para UUIDs si no estuviese activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: registros_clima
-- Almacena cada medición realizada por el script de Python para cada ubicación.
CREATE TABLE IF NOT EXISTS public.registros_clima (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ubicacion TEXT NOT NULL,
    latitud NUMERIC(8, 5) NOT NULL,
    longitud NUMERIC(8, 5) NOT NULL,
    wmo_code INT NOT NULL DEFAULT 0,
    cape NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    precipitacion NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    rafagas_viento NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    direccion_viento INT NOT NULL DEFAULT 0,
    nubosidad INT NOT NULL DEFAULT 0,
    probabilidad_lluvia INT NOT NULL DEFAULT 0,
    nivel_alerta INT NOT NULL DEFAULT 0, -- 0: NONE, 1: MODERATE, 2: SEVERE
    nivel_alerta_nombre TEXT NOT NULL DEFAULT 'NONE',
    motivo_alerta TEXT DEFAULT 'Condiciones climáticas normales'
);

-- 3. TABLA: alertas
-- Registro específico de eventos de alerta (MODERATE o SEVERE) detectados.
CREATE TABLE IF NOT EXISTS public.alertas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ubicacion TEXT NOT NULL,
    latitud NUMERIC(8, 5) NOT NULL,
    longitud NUMERIC(8, 5) NOT NULL,
    nivel_alerta INT NOT NULL, -- 1: MODERATE, 2: SEVERE
    nivel_alerta_nombre TEXT NOT NULL, -- 'MODERATE' | 'SEVERE'
    motivo TEXT NOT NULL,
    detalles JSONB NOT NULL, -- Captura completa del objeto WeatherData
    notificado_telegram BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_registros_clima_ubicacion_fecha 
    ON public.registros_clima (ubicacion, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_fecha 
    ON public.alertas (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_nivel 
    ON public.alertas (nivel_alerta, created_at DESC);

-- 5. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)

-- Activar RLS en las tablas
ALTER TABLE public.registros_clima ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura Pública (Permite que la web React lea los datos libremente)
CREATE POLICY "Permitir lectura pública de registros_clima" 
    ON public.registros_clima 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Permitir lectura pública de alertas" 
    ON public.alertas 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);

-- Política 2: Inserción de datos (Python Script)
CREATE POLICY "Permitir insercion en registros_clima" 
    ON public.registros_clima 
    FOR INSERT 
    TO anon, authenticated, service_role 
    WITH CHECK (true);

CREATE POLICY "Permitir insercion en alertas" 
    ON public.alertas 
    FOR INSERT 
    TO anon, authenticated, service_role 
    WITH CHECK (true);

