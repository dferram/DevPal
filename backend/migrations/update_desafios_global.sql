-- Migración: Desafíos diarios globales
-- Fecha: 2026-02-08
-- Descripción: Cambia el esquema de desafíos por usuario a desafíos globales con tabla de progreso

-- =============================================
-- PASO 1: Crear nueva tabla de progreso
-- =============================================
CREATE TABLE IF NOT EXISTS progreso_desafio_diario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    desafio_id UUID NOT NULL REFERENCES desafios_diarios(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL,
    completado_at TIMESTAMP WITH TIME ZONE,
    codigo_enviado TEXT,
    lenguaje_usado VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_usuario_desafio UNIQUE (usuario_id, desafio_id),
    CONSTRAINT check_estado_progreso_valido CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'abandonado'))
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_desafio_diario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_desafio ON progreso_desafio_diario(desafio_id);
CREATE INDEX IF NOT EXISTS idx_progreso_estado ON progreso_desafio_diario(estado);

-- =============================================
-- PASO 2: Migrar datos existentes
-- =============================================

-- 2a. Agregar columna fecha a desafios_diarios (si no existe)
ALTER TABLE desafios_diarios
ADD COLUMN IF NOT EXISTS fecha DATE;

-- 2b. Migrar estado y completado_at a la tabla de progreso
INSERT INTO progreso_desafio_diario (usuario_id, desafio_id, estado, completado_at, created_at)
SELECT 
    dd.usuario_id,
    dd.id,
    dd.estado,
    dd.completado_at,
    dd.created_at
FROM desafios_diarios dd
WHERE dd.usuario_id IS NOT NULL
ON CONFLICT (usuario_id, desafio_id) DO NOTHING;

-- 2c. Actualizar fecha basada en created_at para desafíos existentes
UPDATE desafios_diarios
SET fecha = DATE(created_at)
WHERE fecha IS NULL;

-- =============================================
-- PASO 3: Modificar tabla desafios_diarios
-- =============================================

-- 3a. Eliminar constraint antiguo si existe
ALTER TABLE desafios_diarios
DROP CONSTRAINT IF EXISTS check_estado_desafio_valido;

-- 3b. Eliminar columnas obsoletas (después de migrar datos)
-- NOTA: Ejecutar esto manualmente después de verificar la migración de datos
-- ALTER TABLE desafios_diarios DROP COLUMN IF EXISTS usuario_id;
-- ALTER TABLE desafios_diarios DROP COLUMN IF EXISTS estado;
-- ALTER TABLE desafios_diarios DROP COLUMN IF EXISTS completado_at;

-- 3c. Agregar constraint de fecha única (un desafío por día)
-- NOTA: Primero debemos consolidar desafíos duplicados del mismo día
-- Esto se debe hacer manualmente revisando duplicados

-- Para agregar la constraint única después de limpiar duplicados:
-- ALTER TABLE desafios_diarios ADD CONSTRAINT unique_fecha_desafio UNIQUE (fecha);

-- =============================================
-- PASO 4: Crear índice para búsquedas por fecha
-- =============================================
CREATE INDEX IF NOT EXISTS idx_desafio_fecha ON desafios_diarios(fecha);

-- =============================================
-- NOTAS IMPORTANTES PARA PRODUCCIÓN:
-- =============================================
-- 1. Ejecutar primero los pasos 1 y 2 para migrar datos
-- 2. Verificar que los datos se migraron correctamente
-- 3. Consolidar desafíos duplicados del mismo día (elegir uno representativo)
-- 4. Ejecutar paso 3b para eliminar columnas obsoletas
-- 5. Ejecutar constraint único de fecha
-- =============================================
