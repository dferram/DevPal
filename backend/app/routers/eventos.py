from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
from app.database import get_db
from app.services.ia_service import IAService, get_ia_service
from sqlalchemy import func

router = APIRouter()


from app.models.db_models import Evento
from datetime import datetime

@router.get("/")
async def listar_eventos(
    db: Annotated[Session, Depends(get_db)],
    categoria: str | None = None,
    limite: int = 50,
    skip: int = 0
):
    print(f"DEBUG: Listing events - Category: {categoria}, Limit: {limite}, Skip: {skip}")
    
    query = db.query(Evento).filter(Evento.fecha >= datetime.now().date())
    
    if categoria:
        print(f"DEBUG: Filtering by category: '{categoria}'")
        # Case-insensitive filter just in case
        query = query.filter(func.lower(Evento.categoria) == categoria.lower())
    
    eventos = query.order_by(Evento.fecha.asc()).offset(skip).limit(limite).all()
    print(f"DEBUG: Found {len(eventos)} events")
    return eventos



@router.get("/guardados")
async def listar_eventos_guardados(
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    from app.models.db_models import Evento, EventoGuardado
    
    eventos = db.query(Evento).join(EventoGuardado).filter(
        EventoGuardado.usuario_id == usuario_id
    ).all()
    
    return eventos


@router.get("/{evento_id}")
async def obtener_detalle_evento(
    evento_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    from app.models.db_models import Evento
    
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    return evento


@router.post("/generar")
async def generar_eventos(
    db: Annotated[Session, Depends(get_db)],
    ia_service: Annotated[IAService, Depends(get_ia_service)],
    limite: int = 15
):
    try:
        nuevos, duplicados = await ia_service.generar_y_guardar_eventos(limite=limite)
        
        return {
            "status": "success",
            "eventos_nuevos": nuevos,
            "eventos_duplicados": duplicados,
            "total_generado": nuevos + duplicados,
            "message": f"Se agregaron {nuevos} eventos nuevos"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar eventos: {str(e)}"
        )


@router.post("/{evento_id}/guardar")
async def guardar_evento(
    evento_id: str,
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    from app.models.db_models import EventoGuardado
    
    ya_guardado = db.query(EventoGuardado).filter(
        EventoGuardado.usuario_id == usuario_id,
        EventoGuardado.evento_id == evento_id
    ).first()
    
    if ya_guardado:
        raise HTTPException(status_code=400, detail="Evento ya está guardado")
    
    evento_guardado = EventoGuardado(
        usuario_id=usuario_id,
        evento_id=evento_id
    )
    db.add(evento_guardado)
    db.commit()
    
    return {"message": "Evento guardado exitosamente"}


@router.delete("/{evento_id}/guardar")
async def eliminar_evento_guardado(
    evento_id: str,
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    from app.models.db_models import EventoGuardado
    
    evento_guardado = db.query(EventoGuardado).filter(
        EventoGuardado.usuario_id == usuario_id,
        EventoGuardado.evento_id == evento_id
    ).first()
    
    if not evento_guardado:
        raise HTTPException(status_code=404, detail="Evento no encontrado en favoritos")
    
    db.delete(evento_guardado)
    db.commit()
    
    return {"message": "Evento eliminado de favoritos"}


@router.post("/{evento_id}/registrar")
async def registrar_asistencia(
    evento_id: str,
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    from app.models.db_models import UsuarioEvento
    
    ya_registrado = db.query(UsuarioEvento).filter(
        UsuarioEvento.usuario_id == usuario_id,
        UsuarioEvento.evento_id == evento_id
    ).first()
    
    if ya_registrado:
        raise HTTPException(status_code=400, detail="Ya estás registrado en este evento")
    
    registro = UsuarioEvento(
        usuario_id=usuario_id,
        evento_id=evento_id,
        estado='Registrado'
    )
    db.add(registro)
    db.commit()
    
    return {"message": "Registro exitoso"}


@router.post("/fix-images")
async def fix_event_images(
    db: Annotated[Session, Depends(get_db)]
):
    from app.models.db_models import Evento
    from app.services.eventos_generator import DEFAULT_IMAGES
    import random
    
    eventos = db.query(Evento).all()
    count = 0
    
    for evento in eventos:
        # Check for empty, short, or placeholder/example URLs
        bad_url = (
            not evento.imagen_url or 
            not evento.imagen_url.startswith("http") or 
            len(evento.imagen_url) < 10 or
            "via.placeholder.com" in evento.imagen_url or
            "example.com" in evento.imagen_url
        )
        
        if bad_url:
            # Determine category
            cat = evento.categoria or "Meetup"
            
            # Normalize complex categories
            if "hack" in cat.lower(): cat = "Hackathon"
            elif "confer" in cat.lower(): cat = "Conferencia"
            elif "work" in cat.lower() or "taller" in cat.lower(): cat = "Taller"
            elif "concurso" in cat.lower(): cat = "Concurso"
            elif "meetup" not in cat and cat not in DEFAULT_IMAGES: cat = "Meetup" # Default to meetup if unknown
            
            # Get fallback list
            fallback_list = DEFAULT_IMAGES.get(cat, DEFAULT_IMAGES["Default"])
            new_image = random.choice(fallback_list)
            
            # Explicitly set the attribute
            evento.imagen_url = new_image
            db.add(evento) # Mark as modified explicitly
            count += 1
            print(f"Updated event '{evento.titulo}' with new image: {new_image}")
            
    if count > 0:
        db.commit()
        
    return {"message": f"Se actualizaron {count} eventos con imágenes por defecto"}

