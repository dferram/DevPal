import sys
sys.path.insert(0, 'c:/Users/Rogue/Documents/DevPal/Back')

from app.database import SessionLocal
from app.models.db_models import Usuario, PerfilUsuario
from app.routers.auth import hash_password
import uuid

db = SessionLocal()

existing = db.query(Usuario).filter(Usuario.email == "test@devpal.com").first()
if existing:
    print(f"Usuario ya existe: {existing.email} (ID: {existing.id})")
    db.close()
    exit(0)

user = Usuario(
    id=str(uuid.uuid4()),
    nombre="Test",
    apellidos="User",
    email="test@devpal.com",
    password_hash=hash_password("test123"),
    avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=test"
)

perfil = PerfilUsuario(
    usuario_id=user.id,
    nivel=1,
    logros=0,
    certificados=0,
    eventos_asistidos=0,
    racha_dias=0
)

try:
    db.add(user)
    db.add(perfil)
    db.commit()
    
    print("Usuario de prueba creado exitosamente!")
    print(f"   Email: {user.email}")
    print(f"   Password: test123")
    print(f"   ID: {user.id}")
    print(f"\nUsa estas credenciales para hacer login en la app")
    
except Exception as e:
    db.rollback()
    print(f"Error al crear usuario: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
