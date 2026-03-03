from fastapi import APIRouter, HTTPException, status, UploadFile, File
from passlib.context import CryptContext
from app.db import get_db_connection, execute_one, execute_query
from pydantic import BaseModel
from app.utils.validation import (
    validate_email, 
    validate_password, 
    validate_required_string
)
import shutil
import uuid
import logging

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

class RegisterRequest(BaseModel):
    nombre: str
    apellidos: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    nombre: str | None = None
    apellidos: str | None = None
    email: str | None = None
    avatar_url: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ProjectRequest(BaseModel):
    titulo: str
    descripcion: str
    tecnologias: list[str] = []
    url_repositorio: str | None = None
    url_demo: str | None = None
    imagen_url: str | None = None

@router.post("/register")
async def register(request: RegisterRequest):
    """
    Register a new user with validation.
    
    Args:
        request: RegisterRequest with nombre, apellidos, email, password
        
    Returns:
        User registration confirmation with user_id
        
    Raises:
        HTTPException: 400 if email already exists, 422 if validation fails
    """
    # Validate inputs
    nombre = validate_required_string(request.nombre, "Nombre", min_length=2, max_length=100)
    apellidos = validate_required_string(request.apellidos, "Apellidos", min_length=2, max_length=100)
    email = validate_email(request.email)
    password = validate_password(request.password, min_length=6)
    
    # Check if user already exists
    user = execute_one("SELECT id FROM usuarios WHERE email = %s", (email,))
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Create user
            cur.execute(
                "INSERT INTO usuarios (id, nombre, apellidos, email, password_hash) VALUES (%s, %s, %s, %s, %s)",
                (user_id, nombre, apellidos, email, hashed_password)
            )
            # Create profile
            cur.execute(
                "INSERT INTO perfiles_usuario (id, usuario_id, nivel, racha_dias, eventos_asistidos, certificados, logros) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (str(uuid.uuid4()), user_id, 1, 0, 0, 0, 0)
            )
            
    return {
        "message": "Usuario registrado exitosamente",
        "user_id": user_id,
        "email": email,
        "nombre": nombre
    }

@router.post("/login")
async def login(request: LoginRequest):
    """
    Authenticate user with email and password.
    
    Args:
        request: LoginRequest with email and password
        
    Returns:
        User information if authentication successful
        
    Raises:
        HTTPException: 401 if credentials are invalid, 422 if validation fails
    """
    # Validate inputs
    email = validate_email(request.email)
    password = validate_required_string(request.password, "Contraseña")
    
    user = execute_one("SELECT id, email, password_hash, nombre, apellidos FROM usuarios WHERE email = %s", (email,))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not verify_password(password, user[2]): # password_hash is index 2
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    return {
        "message": "Login exitoso",
        "user_id": str(user[0]),
        "email": user[1],
        "nombre": user[3],
        "apellidos": user[4]
    }

@router.get("/me/{user_id}")
async def get_user_profile(user_id: str):
    user = execute_one("SELECT id, nombre, apellidos, email, avatar_url FROM usuarios WHERE id = %s", (user_id,))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    perfil = execute_one("SELECT nivel, racha_dias, eventos_asistidos, certificados, logros FROM perfiles_usuario WHERE usuario_id = %s", (user_id,))
    
    # XP Calculation Logic
    xp_actual = 0
    nivel_calculado = 1
    
    if perfil:
        nivel = perfil[0]
        base_xp = (nivel - 1) * 1000
        xp_events = perfil[2] * 150
        xp_certs = perfil[3] * 500
        xp_achievements = perfil[4] * 200
        xp_streak = perfil[1] * 20
        
        # Proyectos count
        project_count = execute_one("SELECT COUNT(*) FROM proyectos_usuario WHERE usuario_id = %s", (user_id,))[0]
        xp_proyectos = project_count * 300
        
        xp_actual = base_xp + xp_events + xp_certs + xp_achievements + xp_streak + xp_proyectos
        nivel_calculado = (xp_actual // 1000) + 1

    # Interests and Languages
    intereses = execute_query("SELECT interes FROM intereses_usuario WHERE usuario_id = %s", (user_id,), fetch=True)
    lenguajes = execute_query("SELECT lenguaje, nivel FROM lenguajes_usuario WHERE usuario_id = %s", (user_id,), fetch=True)

    # Recent Activity (Combined)
    activities = []
    
    # 1. Recent Events
    recent_events = execute_query("""
        SELECT ue.id, e.titulo, ue.updated_at, ue.estado 
        FROM usuario_eventos ue 
        JOIN eventos e ON ue.evento_id = e.id 
        WHERE ue.usuario_id = %s 
        ORDER BY ue.updated_at DESC LIMIT 5
    """, (user_id,), fetch=True)
    
    for row in recent_events:
        status_color = "#3B82F6"
        icon = "calendar"
        if row[3] == 'Asistido':
            status_color = "#10B981"
            icon = "checkmark-circle"
        elif row[3] == 'Ganador':
            status_color = "#F59E0B"
            icon = "trophy"
            
        activities.append({
            "id": str(row[0]),
            "type": "event",
            "title": row[1],
            "date": row[2].strftime("%d %b %Y") if row[2] else "",
            "status": row[3],
            "icon": icon,
            "color": status_color,
            "timestamp": row[2]
        })

    # 2. Recent Challenges
    recent_challenges = execute_query("""
        SELECT p.id, d.titulo, p.completado_at, p.created_at, p.estado 
        FROM progreso_desafio_diario p 
        JOIN desafios_diarios d ON p.desafio_id = d.id 
        WHERE p.usuario_id = %s 
        ORDER BY p.created_at DESC LIMIT 5
    """, (user_id,), fetch=True)
    
    for row in recent_challenges:
        date_ref = row[2] if row[2] else row[3]
        is_completed = row[4] == 'completado'
        activities.append({
            "id": str(row[0]),
            "type": "challenge",
            "title": row[1],
            "date": date_ref.strftime("%d %b %Y") if date_ref else "",
            "status": "Completado" if is_completed else "Pendiente",
            "icon": "code-slash",
            "color": "#8B5CF6" if is_completed else "#64748B",
            "timestamp": date_ref
        })

    # Sort combined activities
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    for a in activities:
        del a['timestamp']

    return {
        "id": str(user[0]),
        "nombre": user[1],
        "apellidos": user[2],
        "email": user[3],
        "avatar_url": user[4],
        "perfil": {
            "nivel": nivel_calculado if perfil else 1,
            "racha_dias": perfil[1] if perfil else 0,
            "eventos_asistidos": perfil[2] if perfil else 0,
            "certificados": perfil[3] if perfil else 0,
            "logros": perfil[4] if perfil else 0,
            "xp": xp_actual,
            "xp_next_level": 1000,
            "xp_nivel_actual": xp_actual % 1000
        },
        "intereses": [i[0] for i in intereses],
        "lenguajes": [{"lenguaje": l[0], "nivel": l[1]} for l in lenguajes],
        "recent_activity": activities[:15],
        "unread_notifications_count": execute_one("SELECT COUNT(*) FROM notificaciones WHERE usuario_id = %s AND leido = FALSE", (user_id,))[0]
    }

@router.put("/me/{user_id}")
async def update_profile(user_id: str, request: UpdateProfileRequest):
    user = execute_one("SELECT id FROM usuarios WHERE id = %s", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            if request.nombre is not None:
                cur.execute("UPDATE usuarios SET nombre = %s WHERE id = %s", (request.nombre, user_id))
            if request.apellidos is not None:
                cur.execute("UPDATE usuarios SET apellidos = %s WHERE id = %s", (request.apellidos, user_id))
            if request.email is not None:
                existing = execute_one("SELECT id FROM usuarios WHERE email = %s AND id != %s", (request.email, user_id))
                if existing:
                    raise HTTPException(status_code=400, detail="El email ya está en uso")
                cur.execute("UPDATE usuarios SET email = %s WHERE id = %s", (request.email, user_id))
            if request.avatar_url is not None:
                cur.execute("UPDATE usuarios SET avatar_url = %s WHERE id = %s", (request.avatar_url, user_id))
                
    return {"message": "Perfil actualizado exitosamente"}

@router.post("/me/{user_id}/password")
async def change_password(user_id: str, request: ChangePasswordRequest):
    user = execute_one("SELECT password_hash FROM usuarios WHERE id = %s", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if not verify_password(request.current_password, user[0]):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
        
    execute_query("UPDATE usuarios SET password_hash = %s WHERE id = %s", (hash_password(request.new_password), user_id))
    return {"message": "Contraseña actualizada exitosamente"}

@router.post("/me/{user_id}/avatar")
async def upload_avatar(user_id: str, file: UploadFile = File(...)):
    user = execute_one("SELECT id FROM usuarios WHERE id = %s", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    file_ext = file.filename.split(".")[-1]
    filename = f"{user_id}_{uuid.uuid4()}.{file_ext}"
    file_path = f"static/uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
       
    final_url = f"/static/uploads/{filename}"
    execute_query("UPDATE usuarios SET avatar_url = %s WHERE id = %s", (final_url, user_id))
    return {"avatar_url": final_url}

@router.post("/me/{user_id}/projects")
async def add_user_project(user_id: str, request: ProjectRequest):
    user = execute_one("SELECT id FROM usuarios WHERE id = %s", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    import json
    execute_query(
        "INSERT INTO proyectos_usuario (id, usuario_id, titulo, descripcion, tecnologias, url_repositorio, url_demo, imagen_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (str(uuid.uuid4()), user_id, request.titulo, request.descripcion, json.dumps(request.tecnologias), request.url_repositorio, request.url_demo, request.imagen_url)
    )
    return {"status": "success", "message": "Proyecto agregado"}

@router.get("/me/{user_id}/notifications")
async def get_notifications(user_id: str):
    rows = execute_query("SELECT id, titulo, mensaje, tipo, leido, created_at FROM notificaciones WHERE usuario_id = %s ORDER BY created_at DESC", (user_id,), fetch=True)
    return [
        {"id": str(r[0]), "titulo": r[1], "mensaje": r[2], "tipo": r[3], "leido": r[4], "created_at": r[5]}
        for r in rows
    ]
