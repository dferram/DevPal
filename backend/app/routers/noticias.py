from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
from app.database import get_db
from app.services.ia_service import IAService, get_ia_service

router = APIRouter()


@router.get("/")
async def obtener_noticias(
    db: Annotated[Session, Depends(get_db)],
    limite: int = 50,
    skip: int = 0
):
    from app.models.db_models import Noticia
    
    noticias = db.query(Noticia).order_by(
        Noticia.created_at.desc()
    ).offset(skip).limit(limite).all()
    
    return noticias


@router.get("/generales")
async def obtener_noticias_generales(
    db: Annotated[Session, Depends(get_db)],
    limite: int = 50,
    skip: int = 0
):
    from app.models.db_models import Noticia
    
    noticias = db.query(Noticia).filter(
        Noticia.usuario_id.is_(None)
    ).order_by(
        Noticia.created_at.desc()
    ).offset(skip).limit(limite).all()
    
    return noticias


@router.post("/generar")
async def generar_noticias(
    db: Annotated[Session, Depends(get_db)],
    ia_service: Annotated[IAService, Depends(get_ia_service)],
    limite: int = 50,
):
    try:
        nuevas, duplicadas = await ia_service.generar_y_guardar_noticias(
            usuario_id=None,
            limite=limite
        )
        
        return {
            "status": "success",
            "noticias_nuevas": nuevas,
            "noticias_duplicadas": duplicadas,
            "total_generado": nuevas + duplicadas,
            "message": f"Se agregaron {nuevas} noticias nuevas a la base de datos"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar noticias: {str(e)}"
        )
