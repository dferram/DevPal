from sqlalchemy import text
from app.database import engine, SessionLocal

def migrate_desafios_table():
    migrations = [
        "ALTER TABLE desafios_diarios RENAME COLUMN lenguaje TO lenguaje_recomendado;",
        "ALTER TABLE desafios_diarios ADD COLUMN IF NOT EXISTS dificultad VARCHAR(50) DEFAULT 'Medio' NOT NULL;",
        "ALTER TABLE desafios_diarios ADD COLUMN IF NOT EXISTS xp_recompensa INTEGER DEFAULT 50 NOT NULL;",
        "ALTER TABLE desafios_diarios RENAME COLUMN firma_funcion TO templates_lenguajes_json;",
        "ALTER TABLE desafios_diarios ALTER COLUMN templates_lenguajes_json TYPE JSONB USING templates_lenguajes_json::jsonb;",
        "ALTER TABLE desafios_diarios ADD CONSTRAINT IF NOT EXISTS check_dificultad_valida CHECK (dificultad IN ('Facil', 'Medio', 'Dificil'));",
        "ALTER TABLE desafios_diarios ADD CONSTRAINT IF NOT EXISTS check_xp_positivo CHECK (xp_recompensa >= 0);",
        # Eliminar columna usuario_id ya que los desafíos diarios son globales
        "ALTER TABLE desafios_diarios DROP COLUMN IF EXISTS usuario_id;",
        """
        UPDATE desafios_diarios
        SET templates_lenguajes_json = jsonb_build_object(
            lenguaje_recomendado, 
            COALESCE(templates_lenguajes_json::text, '# Tu codigo aqui')
        )
        WHERE templates_lenguajes_json IS NULL 
           OR (templates_lenguajes_json::text != 'null' AND jsonb_typeof(templates_lenguajes_json) != 'object');
        """
    ]
    
    db = SessionLocal()
    try:
        for i, sql in enumerate(migrations, 1):
            print(f"Executing migration step {i}...")
            try:
                db.execute(text(sql))
                db.commit()
                print(f"  Step {i} completed")
            except Exception as e:
                error_msg = str(e)
                if "already exists" in error_msg.lower() or "does not exist" in error_msg.lower():
                    print(f"  Step {i} skipped (already applied or column doesn't exist): {error_msg}")
                    db.rollback()
                else:
                    print(f"  Step {i} failed: {error_msg}")
                    db.rollback()
                    raise
        
        print("\nMigration completed successfully!")
        
    except Exception as e:
        print(f"\nMigration failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database migration for desafios_diarios table...\n")
    migrate_desafios_table()
