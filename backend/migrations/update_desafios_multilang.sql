"""
Database migration script to update desafios_diarios table for multi-language templates.

Changes:
- Rename column: lenguaje -> lenguaje_recomendado
- Rename column: firma_funcion -> templates_lenguajes_json (type: JSONB)
- Add column: dificultad (String, default 'Medio')
- Add column: xp_recompensa (Integer, default 50)
- Add constraints for dificultad and xp_recompensa
"""

-- Step 1: Rename lenguaje to lenguaje_recomendado
ALTER TABLE desafios_diarios
RENAME COLUMN lenguaje TO lenguaje_recomendado;

-- Step 2: Add new columns
ALTER TABLE desafios_diarios
ADD COLUMN dificultad VARCHAR(50) DEFAULT 'Medio' NOT NULL,
ADD COLUMN xp_recompensa INTEGER DEFAULT 50 NOT NULL;

-- Step 3: Rename firma_funcion to templates_lenguajes_json and change type
ALTER TABLE desafios_diarios
RENAME COLUMN firma_funcion TO templates_lenguajes_json;

ALTER TABLE desafios_diarios
ALTER COLUMN templates_lenguajes_json TYPE JSONB USING templates_lenguajes_json::jsonb;

-- Step 4: Add constraints
ALTER TABLE desafios_diarios
ADD CONSTRAINT check_dificultad_valida CHECK (dificultad IN ('Fácil', 'Medio', 'Difícil')),
ADD CONSTRAINT check_xp_positivo CHECK (xp_recompensa >= 0);

-- Optional: Update existing records to have proper structure
-- This converts old single-function format to multi-language template format
UPDATE desafios_diarios
SET templates_lenguajes_json = jsonb_build_object(
    lenguaje_recomendado, 
    COALESCE(templates_lenguajes_json::text, '# Tu código aquí')
)
WHERE templates_lenguajes_json IS NULL OR jsonb_typeof(templates_lenguajes_json) != 'object';
