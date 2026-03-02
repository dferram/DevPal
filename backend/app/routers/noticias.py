from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from app.db import execute_query
from app.services.ia_service import IAService, get_ia_service

router = APIRouter()

NEWS_COLUMNS = ["id", "usuario_id", "titulo_resumen", "url", "fecha_publicacion", "imagen_url", "fuente", "relevancia", "created_at"]

def row_to_dict(row):
    if not row: return None
    return dict(zip(NEWS_COLUMNS, row))

@router.get("/")
async def obtener_noticias(limite: int = 50, skip: int = 0):
    rows = execute_query(
        "SELECT " + ", ".join(NEWS_COLUMNS) + " FROM noticias ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limite, skip), fetch=True
    )
    return [row_to_dict(r) for r in rows]

@router.get("/generales")
async def obtener_noticias_generales(limite: int = 50, skip: int = 0):
    rows = execute_query(
        "SELECT " + ", ".join(NEWS_COLUMNS) + " FROM noticias WHERE usuario_id IS NULL ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limite, skip), fetch=True
    )
    return [row_to_dict(r) for r in rows]

@router.post("/generar")
async def generar_noticias(
    ia_service: Annotated[IAService, Depends(get_ia_service)],
    limite: int = 50,
):
    try:
        nuevas, duplicadas = await ia_service.generar_y_guardar_noticias(usuario_id=None, limite=limite)
        return {
            "status": "success",
            "noticias_nuevas": nuevas,
            "noticias_duplicadas": duplicadas,
            "total_generado": nuevas + duplicadas,
            "message": f"Se agregaron {nuevas} noticias nuevas"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar noticias: {str(e)}")
