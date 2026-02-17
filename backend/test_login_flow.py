import sys
sys.path.insert(0, 'c:/Users/Rogue/Documents/DevPal/Back')

from app.database import SessionLocal
from app.models.db_models import Usuario
from app.routers.auth import LoginRequest, verify_password
from fastapi import HTTPException

login_request = LoginRequest(
    email="test@devpal.com",
    password="test123"
)

db = SessionLocal()

try:
    print(f"Buscando usuario: {login_request.email}")
    user = db.query(Usuario).filter(Usuario.email == login_request.email).first()
    
    if not user:
        print("Usuario no encontrado")
    else:
        print(f"Usuario encontrado: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Password hash: {user.password_hash[:30]}...")
        
        print(f"\nVerificando password...")
        try:
            is_valid = verify_password(login_request.password, user.password_hash)
            print(f"   Resultado: {is_valid}")
            
            if is_valid:
                print("\nLOGIN EXITOSO!")
                print(f"   User ID: {user.id}")
                print(f"   Email: {user.email}")
            else:
                print("\nPassword incorrecta")
        except Exception as e:
            print(f"\nError al verificar password: {e}")
            import traceback
            traceback.print_exc()
            
except Exception as e:
    print(f"Error general: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
