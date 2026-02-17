from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Annotated
from passlib.context import CryptContext
from app.database import get_db
from app.models.db_models import Usuario, PerfilUsuario, Notificacion, ProyectoUsuario
from app.middleware.rate_limiter import auth_rate_limit

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


from pydantic import BaseModel

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

# ... (ChangePasswordRequest definition remains here)

@router.put("/me/{user_id}")
async def update_profile(
    user_id: str,
    request: UpdateProfileRequest,
    db: Annotated[Session, Depends(get_db)]
):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if request.nombre is not None:
        user.nombre = request.nombre
    if request.apellidos is not None:
        user.apellidos = request.apellidos
    if request.email is not None:
        # Check if email is taken by another user
        existing_email = db.query(Usuario).filter(Usuario.email == request.email, Usuario.id != user_id).first()
        if existing_email:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está en uso"
            )
        user.email = request.email
    if request.avatar_url is not None:
        user.avatar_url = request.avatar_url
        
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Perfil actualizado exitosamente",
        "user": {
            "id": str(user.id),
            "nombre": user.nombre,
            "apellidos": user.apellidos,
            "email": user.email,
            "avatar_url": user.avatar_url
        }
    }

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/register")
async def register(
    request: RegisterRequest,
    db: Annotated[Session, Depends(get_db)]
):
    existing_user = db.query(Usuario).filter(Usuario.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    hashed_password = hash_password(request.password)
    
    new_user = Usuario(
        nombre=request.nombre,
        apellidos=request.apellidos,
        email=request.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    perfil = PerfilUsuario(
        usuario_id=new_user.id,
        nivel=1,
        racha_dias=0,
        eventos_asistidos=0,
        certificados=0,
        logros=0
    )
    db.add(perfil)
    db.commit()
    
    return {
        "message": "Usuario registrado exitosamente",
        "user_id": str(new_user.id),
        "email": new_user.email,
        "nombre": new_user.nombre
    }


@router.post("/login")
async def login(
    request: LoginRequest,
    db: Annotated[Session, Depends(get_db)]
):
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    return {
        "message": "Login exitoso",
        "user_id": str(user.id),
        "email": user.email,
        "nombre": user.nombre,
        "apellidos": user.apellidos
    }


@router.get("/me/{user_id}")
async def get_user_profile(
    user_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    perfil = user.perfil
    
    # --- XP Calculation Logic ---
    # Formula Estimada: Base por Nivel + Extras
    xp_actual = 0
    xp_next_level = 1000
    
    if perfil:
        # Base XP del nivel actual
        base_xp = (perfil.nivel - 1) * 1000
        
        # XP ganada por actividades
        xp_events = perfil.eventos_asistidos * 150
        xp_certs = perfil.certificados * 500
        xp_achievements = perfil.logros * 200
        xp_streak = perfil.racha_dias * 20
        
        # Proyectos manuales (ej: 300 XP por proyecto)
        project_count = db.query(ProyectoUsuario).filter(ProyectoUsuario.usuario_id == user_id).count()
        xp_proyectos = project_count * 300
        
        xp_actual = base_xp + xp_events + xp_certs + xp_achievements + xp_streak + xp_proyectos
        
        # CÁLCULO DE NIVEL: Cada 1000 XP es un nivel.
        nivel_calculado = (xp_actual // 1000) + 1
        
        # XP necesaria para el siguiente nivel (siempre 1000 relativo al nivel actual para la barra)
        xp_next_level = 1000

    # --- Portfolio / Recent Activity ---
    activities = []
    
    # 1. Recent Events
    from app.models.db_models import UsuarioEvento, DesafioDiario, Notificacion
    from sqlalchemy import desc
    
    recent_events = db.query(UsuarioEvento).filter(
        UsuarioEvento.usuario_id == user_id
    ).order_by(desc(UsuarioEvento.updated_at)).limit(5).all()
    
    for ue in recent_events:
        # Determinar color/icono según estado
        status_color = "#3B82F6" # Blue default
        icon = "calendar"
        
        if ue.estado == 'Asistido':
            status_color = "#10B981" # Green
            icon = "checkmark-circle"
        elif ue.estado == 'Ganador':
            status_color = "#F59E0B" # Yellow
            icon = "trophy"
            
        activities.append({
            "id": str(ue.id),
            "type": "event",
            "title": ue.evento.titulo,
            "date": ue.updated_at.strftime("%d %b %Y"),
            "status": ue.estado,
            "icon": icon,
            "color": status_color,
            "timestamp": ue.updated_at
        })

    # 2. Recent Challenges (usando ProgresoDesafioDiario)
    from app.models.db_models import ProgresoDesafioDiario
    
    recent_challenge_progress = db.query(ProgresoDesafioDiario, DesafioDiario).join(
        DesafioDiario,
        ProgresoDesafioDiario.desafio_id == DesafioDiario.id
    ).filter(
        ProgresoDesafioDiario.usuario_id == user_id
    ).order_by(desc(ProgresoDesafioDiario.created_at)).limit(5).all()
    
    for progreso, desafio in recent_challenge_progress:
        date_ref = progreso.completado_at if progreso.completado_at else progreso.created_at
        is_completed = progreso.estado == 'completado'
        
        activities.append({
            "id": str(desafio.id),
            "type": "challenge",
            "title": desafio.titulo,
            "date": date_ref.strftime("%d %b %Y") if date_ref else "",
            "status": "Completado" if is_completed else "Pendiente",
            "icon": "code-slash",
            "color": "#8B5CF6" if is_completed else "#64748B", # Purple or Gray
            "timestamp": date_ref
        })

    # 3. Manual Projects
    manual_projects = db.query(ProyectoUsuario).filter(
        ProyectoUsuario.usuario_id == user_id
    ).order_by(desc(ProyectoUsuario.created_at)).all()
    
    for p in manual_projects:
        activities.append({
            "id": str(p.id),
            "type": "project",
            "title": p.titulo,
            "date": p.created_at.strftime("%d %b %Y"),
            "status": "Publicado",
            "icon": "briefcase",  # distintivo para proyectos
            "color": "#EC4899",   # Pink
            "timestamp": p.created_at,
            "description": p.descripcion,
            "url_repositorio": p.url_repositorio,
            "url_demo": p.url_demo,
            "tecnologias": p.tecnologias
        })

    # Sort combined activities by timestamp desc
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Clean up timestamp before sending
    final_activities = []
    for a in activities[:15]: # Increased limit to show more variety
        a_copy = a.copy()
        del a_copy['timestamp']
        final_activities.append(a_copy)

    # Use calculation from service if needed, but here we replicated logic for simplicity 
    # or we can just send the raw computed values
    
    return {
        "id": str(user.id),
        "nombre": user.nombre,
        "apellidos": user.apellidos,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "perfil": {
            "nivel": nivel_calculado if perfil else 1, # Use calculated level
            "racha_dias": perfil.racha_dias if perfil else 0,
            "eventos_asistidos": perfil.eventos_asistidos if perfil else 0,
            "certificados": perfil.certificados if perfil else 0,
            "logros": perfil.logros if perfil else 0,
            "xp": xp_actual,
            "xp_next_level": xp_next_level,
            "xp_nivel_actual": xp_actual % 1000 # Send progress within level
        },
        "intereses": [i.interes for i in user.intereses],
        "lenguajes": [{"lenguaje": l.lenguaje, "nivel": l.nivel} for l in user.lenguajes],
        "recent_activity": final_activities,
        "unread_notifications_count": db.query(Notificacion).filter(
            Notificacion.usuario_id == user_id,
            Notificacion.leido == False
        ).count()
    }





@router.post("/me/{user_id}/password")
async def change_password(
    user_id: str,
    request: ChangePasswordRequest,
    db: Annotated[Session, Depends(get_db)]
):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
        
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
        
    user.password_hash = hash_password(request.new_password)
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}


from fastapi import UploadFile, File
import shutil
import os
import uuid

@router.post("/me/{user_id}/avatar")
async def upload_avatar(
    user_id: str,
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...)
):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{user_id}_{uuid.uuid4()}.{file_ext}"
    file_path = f"static/uploads/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al guardar la imagen")
       
    # Construct relative URL 
    final_url = f"/static/uploads/{filename}"
    user.avatar_url = final_url
    
    db.commit()
    db.refresh(user)
    
    return {"avatar_url": final_url}


class ProjectRequest(BaseModel):
    titulo: str
    descripcion: str
    tecnologias: list[str] = []
    url_repositorio: str | None = None
    url_demo: str | None = None
    imagen_url: str | None = None

@router.post("/me/projects")
async def add_project(
    request: ProjectRequest,
    current_user: Annotated[Usuario, Depends(auth_rate_limit)], # Using auth dependency if available, or simpler approach
    db: Annotated[Session, Depends(get_db)]
):
    # Note: In a real app, current_user would come from a dependency that validates the token.
    # Assuming we might need to parse token manually if not available, OR 
    # relying on the fact that headers are passed. 
    # For now, let's assume we extract user_id from headers or similar mechanism if implemented,
    # BUT since I don't see a `get_current_user` dependency used in login/register, I will check 
    # if I can implement a simple one or if I should pass user_id as query param for MVP (less secure but fast).
    # BETTER: Let's assume the frontend sends the user_id for now as we saw in get_user_profile
    pass

@router.post("/me/{user_id}/projects")
async def add_user_project(
    user_id: str,
    request: ProjectRequest,
    db: Annotated[Session, Depends(get_db)]
):
    # Verify user exists
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    try:
        # Defensive local import to avoid NameError if global import fails or circular dependency issues arise during reload
        from app.models.db_models import ProyectoUsuario
        
        new_project = ProyectoUsuario(
            usuario_id=user_id,
            titulo=request.titulo,
            descripcion=request.descripcion,
            tecnologias=request.tecnologias,
            url_repositorio=request.url_repositorio,
            url_demo=request.url_demo,
            imagen_url=request.imagen_url
        )
        
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        
        return {"status": "success", "message": "Proyecto agregado", "project_id": str(new_project.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.get("/me/{user_id}/notifications")
async def get_notifications(
    user_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    notifications = db.query(Notificacion).filter(
        Notificacion.usuario_id == user_id
    ).order_by(desc(Notificacion.created_at)).all()
    
    return [
        {
            "id": str(n.id),
            "titulo": n.titulo,
            "mensaje": n.mensaje,
            "tipo": n.tipo,
            "leido": n.leido,
            "created_at": n.created_at
        }
        for n in notifications
    ]
