from app.database import SessionLocal, engine
from app.models.db_models import Evento, UsuarioEvento, EventoGuardado
from sqlalchemy import text

def reset_events():
    db = SessionLocal()
    try:
        print("Deleting relations (UsuarioEvento, EventoGuardado)...")
        db.query(UsuarioEvento).delete()
        db.query(EventoGuardado).delete()
        
        print("Deleting Events...")
        db.query(Evento).delete()
        
        db.commit()
        print("Events and relations cleared successfully.")
        
        try:
            if engine.dialect.name == 'postgresql':
                db.execute(text("ALTER SEQUENCE eventos_id_seq RESTART WITH 1;"))
        except Exception as e:
            print(f"Skipping sequence reset: {e}")

    except Exception as e:
        print(f"Error resetting events: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_events()
