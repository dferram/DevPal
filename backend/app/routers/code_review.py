from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
from pydantic import BaseModel
from app.database import get_db
from app.services.ia_service import IAService, get_ia_service

router = APIRouter()


class CodeReviewRequest(BaseModel):
    codigo: str
    lenguaje: str
    usuario_id: str


class PistaRequest(BaseModel):
    codigo: str
    lenguaje: str


@router.post("/")
async def solicitar_code_review(
    request: CodeReviewRequest,
    db: Annotated[Session, Depends(get_db)],
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    from app.models.db_models import Usuario
    
    try:
        usuario = db.query(Usuario).filter(Usuario.id == request.usuario_id).first()
        informacion_usuario = {
            "nombre": usuario.nombre if usuario else "Usuario"
        }
        
        review = await ia_service.realizar_code_review(
            usuario_id=request.usuario_id,
            codigo=request.codigo,
            lenguaje=request.lenguaje,
            informacion_usuario=informacion_usuario
        )
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al generar la revisión"
            )
        
        return {
            "status": "success",
            "review": review
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )


@router.get("/historial")
async def obtener_historial_reviews(
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)],
    lenguaje: str | None = None,
    limite: int = 20,
    skip: int = 0
):
    from app.models.db_models import RevisionCodigo
    
    query = db.query(RevisionCodigo).filter(
        RevisionCodigo.usuario_id == usuario_id
    )
    
    if lenguaje:
        query = query.filter(RevisionCodigo.lenguaje == lenguaje)
    
    revisiones = query.order_by(
        RevisionCodigo.created_at.desc()
    ).offset(skip).limit(limite).all()
    
    return revisiones


@router.post("/pistas/generar")
async def generar_pista(
    request: PistaRequest,
    db: Annotated[Session, Depends(get_db)],
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    try:
        informacion_usuario = {
            "nombre": "Usuario"
        }
        
        pista = await ia_service.generar_pista_codigo(
            codigo=request.codigo,
            lenguaje=request.lenguaje,
            informacion_usuario=informacion_usuario
        )
        
        if not pista:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al generar la pista"
            )
        
        return {
            "status": "success",
            "pista": pista
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )
