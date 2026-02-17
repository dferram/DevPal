-- ============================================
-- DevPal - Índices de Performance
-- ============================================
-- Ejecutar después de crear las tablas
-- Mejora significativa en queries de búsqueda y filtrado

-- ============================================
-- TABLA: eventos
-- ============================================
-- Índice para búsquedas por fecha (usado en home screen)
CREATE INDEX IF NOT EXISTS idx_evento_fecha 
ON eventos(fecha DESC);

-- Índice para filtros por categoría
CREATE INDEX IF NOT EXISTS idx_evento_categoria 
ON eventos(categoria);

-- Índice para eventos populares (featured)
CREATE INDEX IF NOT EXISTS idx_evento_es_popular 
ON eventos(es_popular) 
WHERE es_popular = true;

-- Índice compuesto para filtro común: fecha + categoría
CREATE INDEX IF NOT EXISTS idx_evento_fecha_categoria 
ON eventos(fecha DESC, categoria);

-- Índice de texto completo para búsqueda en título y descripción
CREATE INDEX IF NOT EXISTS idx_evento_titulo_trgm 
ON eventos USING gin(titulo gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_evento_descripcion_trgm 
ON eventos USING gin(descripcion gin_trgm_ops);

-- ============================================
-- TABLA: noticias
-- ============================================
-- Índice para noticias más recientes
CREATE INDEX IF NOT EXISTS idx_noticia_fecha_publicacion 
ON noticias(fecha_publicacion DESC);

-- Índice compuesto para ordenar por relevancia y fecha
CREATE INDEX IF NOT EXISTS idx_noticia_relevancia_fecha 
ON noticias(relevancia DESC, fecha_publicacion DESC);

-- Índice para filtro por categoría
CREATE INDEX IF NOT EXISTS idx_noticia_categoria 
ON noticias(categoria);

-- Índice de texto completo para búsqueda
CREATE INDEX IF NOT EXISTS idx_noticia_titulo_trgm 
ON noticias USING gin(titulo gin_trgm_ops);

-- ============================================
-- TABLA: desafios_diarios
-- ============================================
-- Índice para obtener desafíos de un usuario por estado
CREATE INDEX IF NOT EXISTS idx_desafio_usuario_estado 
ON desafios_diarios(usuario_id, estado);

-- Índice para desafíos por fecha de asignación
CREATE INDEX IF NOT EXISTS idx_desafio_fecha_asignacion 
ON desafios_diarios(fecha_asignacion DESC);

-- Índice para desafíos completados (para stats)
CREATE INDEX IF NOT EXISTS idx_desafio_completado 
ON desafios_diarios(completado_at DESC) 
WHERE estado = 'completado';

-- Índice para dificultad (usado en gamificación)
CREATE INDEX IF NOT EXISTS idx_desafio_dificultad 
ON desafios_diarios(dificultad);

-- ============================================
-- TABLA: usuario_eventos
-- ============================================
-- Índice para eventos de un usuario
CREATE INDEX IF NOT EXISTS idx_usuario_evento_usuario 
ON usuario_eventos(usuario_id);

-- Índice para filtrar por estado de asistencia
CREATE INDEX IF NOT EXISTS idx_usuario_evento_estado 
ON usuario_eventos(estado);

-- Índice compuesto para queries comunes
CREATE INDEX IF NOT EXISTS idx_usuario_evento_usuario_estado 
ON usuario_eventos(usuario_id, estado);

-- ============================================
-- TABLA: busquedas_recientes
-- ============================================
-- Índice para búsquedas de un usuario
CREATE INDEX IF NOT EXISTS idx_busqueda_usuario 
ON busquedas_recientes(usuario_id);

-- Índice para ordenar por más recientes
CREATE INDEX IF NOT EXISTS idx_busqueda_created 
ON busquedas_recientes(created_at DESC);

-- ============================================
-- TABLA: revision_codigo
-- ============================================
-- Índice para revisiones de un usuario
CREATE INDEX IF NOT EXISTS idx_revision_usuario 
ON revision_codigo(usuario_id);

-- Índice para revisiones por lenguaje
CREATE INDEX IF NOT EXISTS idx_revision_lenguaje 
ON revision_codigo(lenguaje);

-- Índice por fecha de creación
CREATE INDEX IF NOT EXISTS idx_revision_created 
ON revision_codigo(created_at DESC);

-- ============================================
-- TABLA: perfil_usuario
-- ============================================
-- Índice para ordenar por nivel (leaderboard)
CREATE INDEX IF NOT EXISTS idx_perfil_nivel 
ON perfil_usuario(nivel DESC);

-- Índice para usuarios con racha activa
CREATE INDEX IF NOT EXISTS idx_perfil_racha 
ON perfil_usuario(racha_dias DESC) 
WHERE racha_dias > 0;

-- Índice compuesto para leaderboard optimizado
CREATE INDEX IF NOT EXISTS idx_perfil_leaderboard 
ON perfil_usuario(nivel DESC, logros DESC, racha_dias DESC);

-- ============================================
-- TABLAS DE GAMIFICACIÓN
-- ============================================
-- Índice para badges de un usuario
CREATE INDEX IF NOT EXISTS idx_usuario_badges_usuario 
ON usuario_badges(usuario_id);

-- Índice para buscar badge específico
CREATE INDEX IF NOT EXISTS idx_usuario_badges_badge 
ON usuario_badges(badge_id);

-- Índice para badges desbloqueados recientemente
CREATE INDEX IF NOT EXISTS idx_usuario_badges_desbloqueado 
ON usuario_badges(desbloqueado_at DESC);

-- ============================================
-- EXTENSIÓN: pg_trgm (para búsqueda de texto)
-- ============================================
-- Habilitar extensión para búsqueda fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ver todos los índices creados
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Analizar tablas para actualizar estadísticas
ANALYZE eventos;
ANALYZE noticias;
ANALYZE desafios_diarios;
ANALYZE usuario_eventos;
ANALYZE perfil_usuario;
ANALYZE usuario_badges;
