"""Router para gestión de noticias."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.db import execute_query
from app.services.ia_service import IAService, get_ia_service

router = APIRouter()

NEWS_COLUMNS = [
    "id", "usuario_id", "titulo_resumen", "url",
    "fecha_publicacion", "imagen_url", "fuente",
    "relevancia", "created_at"
]


def row_to_dict(row):
    """Convierte una fila de noticia a diccionario."""
    if not row:
        return None
    return dict(zip(NEWS_COLUMNS, row))


@router.get("/")
async def obtener_noticias(limite: int = 50, skip: int = 0):
    """Obtiene noticias recientes."""
    query = (
        "SELECT " + ", ".join(NEWS_COLUMNS) +
        " FROM noticias ORDER BY created_at DESC LIMIT %s OFFSET %s"
    )
    rows = execute_query(query, (limite, skip), fetch=True)
    return [row_to_dict(r) for r in rows]


@router.get("/generales")
async def obtener_noticias_generales(limite: int = 50, skip: int = 0):
    """Obtiene noticias generales (no personalizadas)."""
    query = (
        "SELECT " + ", ".join(NEWS_COLUMNS) +
        " FROM noticias WHERE usuario_id IS NULL "
        "ORDER BY created_at DESC LIMIT %s OFFSET %s"
    )
    rows = execute_query(query, (limite, skip), fetch=True)
    return [row_to_dict(r) for r in rows]


@router.post("/generar")
async def generar_noticias(
    ia_service: Annotated[IAService, Depends(get_ia_service)],
    limite: int = 50,
):
    """Genera noticias personalizadas con IA (próximamente)."""
    # Funcionalidad bloqueada temporalmente
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "message": "Funcionalidad próximamente disponible",
            "feature": "Generación de noticias con IA",
            "status": "coming_soon"
        }
    )
