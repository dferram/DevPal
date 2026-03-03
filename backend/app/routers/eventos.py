from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from app.db import execute_query, execute_one, get_db_connection
from app.services.ia_service import IAService, get_ia_service
from app.utils.validation import validate_uuid, validate_positive_integer
from datetime import datetime
import uuid

router = APIRouter()

def row_to_dict(row, columns):
    if not row:
        return None
    return dict(zip(columns, row))

EVENT_COLUMNS = [
    "id", "titulo", "descripcion", "fecha", "hora", "ubicacion", 
    "categoria", "imagen_url", "cupos_disponibles", "es_popular", 
    "organizador", "url_externa", "latitud", "longitud", "created_at", "updated_at"
]

@router.get("/")
async def listar_eventos(
    categoria: str | None = None,
    limite: int = 50,
    skip: int = 0
):
    """
    Lista eventos futuros, opcionalmente filtrados por categoría.
    
    Args:
        categoria: Filtro de categoría (opcional)
        limite: Máximo de eventos a retornar (1-200)
        skip: Número de eventos a saltar para paginación
        
    Returns:
        Lista de eventos
    """
    # Validar parámetros
    limite = validate_positive_integer(limite, "Límite", min_value=1, max_value=200)
    skip = validate_positive_integer(skip, "Skip", min_value=0, max_value=10000)
    
    query = "SELECT " + ", ".join(EVENT_COLUMNS) + " FROM eventos WHERE fecha >= %s"
    params = [datetime.now().date()]
    
    if categoria:
        query += " AND LOWER(categoria) = LOWER(%s)"
        params.append(categoria)
    
    query += " ORDER BY fecha ASC LIMIT %s OFFSET %s"
    params.extend([limite, skip])
    
    rows = execute_query(query, params, fetch=True)
    return [row_to_dict(r, EVENT_COLUMNS) for r in rows]

@router.get("/guardados")
async def listar_eventos_guardados(usuario_id: str):
    """
    Lista eventos guardados por un usuario.
    
    Args:
        usuario_id: ID del usuario
        
    Returns:
        Lista de eventos guardados
    """
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    query = """
        SELECT e.* FROM eventos e 
        JOIN eventos_guardados eg ON e.id = eg.evento_id 
        WHERE eg.usuario_id = %s
    """
    rows = execute_query(query, (usuario_id,), fetch=True)
    # Note: Using * in query but we should ideally list columns for safety. 
    # For now, let's assume the table matches EVENT_COLUMNS.
    return [row_to_dict(r, EVENT_COLUMNS) for r in rows]

@router.get("/{evento_id}")
async def obtener_detalle_evento(evento_id: str):
    """
    Obtiene los detalles de un evento específico.
    
    Args:
        evento_id: ID del evento
        
    Returns:
        Detalles del evento
        
    Raises:
        HTTPException: 404 si el evento no existe, 422 si el ID es inválido
    """
    evento_id = validate_uuid(evento_id, "ID de evento")
    
    row = execute_one("SELECT " + ", ".join(EVENT_COLUMNS) + " FROM eventos WHERE id = %s", (evento_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return row_to_dict(row, EVENT_COLUMNS)

@router.post("/generar")
async def generar_eventos(
    ia_service: Annotated[IAService, Depends(get_ia_service)],
    limite: int = 15
):
    # Funcionalidad bloqueada temporalmente
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "message": "Funcionalidad próximamente disponible",
            "feature": "Generación de eventos con IA",
            "status": "coming_soon"
        }
    )

@router.post("/{evento_id}/guardar")
async def guardar_evento(evento_id: str, usuario_id: str):
    """
    Guarda un evento en los favoritos del usuario.
    
    Args:
        evento_id: ID del evento a guardar
        usuario_id: ID del usuario
        
    Returns:
        Mensaje de confirmación
        
    Raises:
        HTTPException: 400 si ya está guardado, 422 si los IDs son inválidos
    """
    evento_id = validate_uuid(evento_id, "ID de evento")
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    ya_guardado = execute_one("SELECT id FROM eventos_guardados WHERE usuario_id = %s AND evento_id = %s", (usuario_id, evento_id))
    if ya_guardado:
        raise HTTPException(status_code=400, detail="Evento ya está guardado")
    
    execute_query(
        "INSERT INTO eventos_guardados (id, usuario_id, evento_id) VALUES (%s, %s, %s)",
        (str(uuid.uuid4()), usuario_id, evento_id)
    )
    return {"message": "Evento guardado exitosamente"}

@router.delete("/{evento_id}/guardar")
async def eliminar_evento_guardado(evento_id: str, usuario_id: str):
    """
    Elimina un evento de los favoritos del usuario.
    
    Args:
        evento_id: ID del evento
        usuario_id: ID del usuario
        
    Returns:
        Mensaje de confirmación
        
    Raises:
        HTTPException: 404 si no está en favoritos, 422 si los IDs son inválidos
    """
    evento_id = validate_uuid(evento_id, "ID de evento")
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    ya_guardado = execute_one("SELECT id FROM eventos_guardados WHERE usuario_id = %s AND evento_id = %s", (usuario_id, evento_id))
    if not ya_guardado:
        raise HTTPException(status_code=404, detail="Evento no encontrado en favoritos")
    
    execute_query("DELETE FROM eventos_guardados WHERE usuario_id = %s AND evento_id = %s", (usuario_id, evento_id))
    return {"message": "Evento eliminado de favoritos"}

@router.post("/{evento_id}/registrar")
async def registrar_asistencia(evento_id: str, usuario_id: str):
    """
    Registra la asistencia del usuario a un evento.
    
    Args:
        evento_id: ID del evento
        usuario_id: ID del usuario
        
    Returns:
        Mensaje de confirmación
        
    Raises:
        HTTPException: 400 si ya está registrado, 422 si los IDs son inválidos
    """
    evento_id = validate_uuid(evento_id, "ID de evento")
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    ya_registrado = execute_one("SELECT id FROM usuario_eventos WHERE usuario_id = %s AND evento_id = %s", (usuario_id, evento_id))
    if ya_registrado:
        raise HTTPException(status_code=400, detail="Ya estás registrado en este evento")
    
    execute_query(
        "INSERT INTO usuario_eventos (id, usuario_id, evento_id, estado) VALUES (%s, %s, %s, %s)",
        (str(uuid.uuid4()), usuario_id, evento_id, 'Registrado')
    )
    return {"message": "Registro exitoso"}

@router.post("/fix-images")
async def fix_event_images():
    from app.services.eventos_generator import DEFAULT_IMAGES
    import random
    
    eventos = execute_query("SELECT id, titulo, categoria, imagen_url FROM eventos", fetch=True)
    count = 0
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            for ev_id, _, categoria, img_url in eventos:
                bad_url = (
                    not img_url or 
                    not img_url.startswith("http") or 
                    len(img_url) < 10 or
                    "via.placeholder.com" in img_url or
                    "example.com" in img_url
                )
                
                if bad_url:
                    cat = categoria or "Meetup"
                    if "hack" in cat.lower(): cat = "Hackathon"
                    elif "confer" in cat.lower(): cat = "Conferencia"
                    elif "work" in cat.lower() or "taller" in cat.lower(): cat = "Taller"
                    elif "concurso" in cat.lower(): cat = "Concurso"
                    elif cat not in DEFAULT_IMAGES: cat = "Meetup"
                    
                    fallback_list = DEFAULT_IMAGES.get(cat, DEFAULT_IMAGES["Default"])
                    new_image = random.choice(fallback_list)
                    
                    cur.execute("UPDATE eventos SET imagen_url = %s WHERE id = %s", (new_image, ev_id))
                    count += 1
            
    return {"message": f"Se actualizaron {count} eventos con imágenes por defecto"}
