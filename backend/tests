import sys
sys.path.insert(0, 'c:/Users/Rogue/Documents/DevPal/Back')

from app.database import SessionLocal
from app.models.db_models import Usuario
from app.routers.auth import verify_password

db = SessionLocal()

user = db.query(Usuario).filter(Usuario.email == "test@test.com").first()

if user:
    print(f"Usuario encontrado: {user.email}")
    print(f"   ID: {user.id}")
    print(f"   Password hash: {user.password_hash[:20]}...")
    
    try:
        result = verify_password("test123", user.password_hash)
        print(f"   Verificacion de password: {result}")
    except Exception as e:
        print(f"Error en verify_password: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No hay usuario con email test@test.com")
    print("\nUsuarios en la DB:")
    users = db.query(Usuario).limit(5).all()
    for u in users:
        print(f"  - {u.email} (ID: {u.id})")

db.close()
