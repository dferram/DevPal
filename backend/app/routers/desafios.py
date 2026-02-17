from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
from pydantic import BaseModel
import json
from datetime import datetime
from app.database import get_db
from app.services.ia_service import IAService, get_ia_service
from app.services.code_executor import ejecutar_codigo

router = APIRouter()


@router.get("/hoy")
async def obtener_desafio_del_dia(
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)],
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    """
    Obtiene el desafío global del día y el progreso del usuario.
    Si no existe desafío para hoy, lo genera automáticamente.
    """
    from app.models.db_models import DesafioDiario, ProgresoDesafioDiario, Usuario
    
    hoy = datetime.now().date()
    
    # Buscar el desafío global del día
    desafio = db.query(DesafioDiario).filter(
        DesafioDiario.fecha == hoy
    ).first()
    
    # Si no existe, generar uno nuevo (desafío global)
    if not desafio:
        desafio = await ia_service.generar_desafio_global()
        if not desafio:
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el desafío del día"
            )
    
    # Verificar que el usuario existe
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Buscar o crear el progreso del usuario para este desafío
    progreso = db.query(ProgresoDesafioDiario).filter(
        ProgresoDesafioDiario.usuario_id == usuario_id,
        ProgresoDesafioDiario.desafio_id == desafio.id
    ).first()
    
    if not progreso:
        # Crear registro de progreso para el usuario
        progreso = ProgresoDesafioDiario(
            usuario_id=usuario_id,
            desafio_id=desafio.id,
            estado='pendiente'
        )
        db.add(progreso)
        db.commit()
        db.refresh(progreso)
    
    # Serializar el desafío con el estado del usuario
    return serialize_desafio_con_progreso(desafio, progreso)


def serialize_desafio_con_progreso(desafio, progreso=None) -> dict:
    """Convierte un objeto DesafioDiario y su progreso a diccionario."""
    if desafio is None:
        return None
    
    def parse_json_field(value, default):
        """Parsea un campo que puede ser string JSON o ya un dict/list."""
        if value is None:
            return default
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return default
        return value
    
    resultado = {
        "id": str(desafio.id),
        "fecha": desafio.fecha.isoformat() if desafio.fecha else None,
        "titulo": desafio.titulo,
        "lenguaje_recomendado": desafio.lenguaje_recomendado,
        "contexto_negocio": desafio.contexto_negocio,
        "definicion_problema": desafio.definicion_problema,
        "templates_lenguajes": parse_json_field(desafio.templates_lenguajes_json, {}),
        "restricciones": parse_json_field(desafio.restricciones_json, {}),
        "casos_prueba": parse_json_field(desafio.casos_prueba_json, []),
        "pista": desafio.pista,
        "dificultad": desafio.dificultad,
        "xp_recompensa": desafio.xp_recompensa,
        "created_at": desafio.created_at.isoformat() if desafio.created_at else None,
    }
    
    # Agregar información de progreso del usuario si existe
    if progreso:
        resultado["estado"] = progreso.estado
        resultado["completado_at"] = progreso.completado_at.isoformat() if progreso.completado_at else None
        resultado["progreso_id"] = str(progreso.id)
    else:
        resultado["estado"] = "pendiente"
        resultado["completado_at"] = None
        resultado["progreso_id"] = None
    
    return resultado


# Mantener compatibilidad con código antiguo
def serialize_desafio(desafio) -> dict:
    """Función de compatibilidad - usa serialize_desafio_con_progreso"""
    return serialize_desafio_con_progreso(desafio, None)


@router.post("/generar")
async def generar_nuevo_desafio(
    db: Annotated[Session, Depends(get_db)],
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    """
    Genera un nuevo desafío global del día (solo si no existe uno para hoy).
    Este endpoint puede ser llamado por un job programado o manualmente.
    """
    from app.models.db_models import DesafioDiario
    
    hoy = datetime.now().date()
    
    # Verificar si ya existe un desafío para hoy
    desafio_existente = db.query(DesafioDiario).filter(
        DesafioDiario.fecha == hoy
    ).first()
    
    if desafio_existente:
        return {
            "status": "exists",
            "desafio": serialize_desafio(desafio_existente),
            "message": "Ya existe un desafío para hoy"
        }
    
    desafio = await ia_service.generar_desafio_global()
    
    if not desafio:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al generar el desafío"
        )
    
    return {
        "status": "success",
        "desafio": serialize_desafio(desafio),
        "message": "Desafío generado exitosamente"
    }


@router.get("/historial")
async def obtener_historial(
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)],
    estado: str | None = None,
    limite: int = 20,
    skip: int = 0
):
    """
    Obtiene el historial de desafíos del usuario con su progreso.
    """
    from app.models.db_models import DesafioDiario, ProgresoDesafioDiario
    
    # Consulta con join para obtener desafíos y progreso del usuario
    query = db.query(ProgresoDesafioDiario, DesafioDiario).join(
        DesafioDiario,
        ProgresoDesafioDiario.desafio_id == DesafioDiario.id
    ).filter(
        ProgresoDesafioDiario.usuario_id == usuario_id
    )
    
    if estado:
        query = query.filter(ProgresoDesafioDiario.estado == estado)
    
    resultados = query.order_by(
        DesafioDiario.fecha.desc()
    ).offset(skip).limit(limite).all()
    
    # Serializar resultados
    return [
        serialize_desafio_con_progreso(desafio, progreso)
        for progreso, desafio in resultados
    ]


@router.post("/{desafio_id}/completar")
async def marcar_completado(
    desafio_id: str,
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Marca el progreso del usuario en un desafío como completado.
    """
    from app.models.db_models import ProgresoDesafioDiario
    
    progreso = db.query(ProgresoDesafioDiario).filter(
        ProgresoDesafioDiario.desafio_id == desafio_id,
        ProgresoDesafioDiario.usuario_id == usuario_id
    ).first()
    
    if not progreso:
        raise HTTPException(status_code=404, detail="Progreso de desafío no encontrado")
    
    progreso.estado = 'completado'
    progreso.completado_at = datetime.now()
    db.commit()
    
    return {"message": "Desafío completado exitosamente"}


@router.post("/{desafio_id}/abandonar")
async def marcar_abandonado(
    desafio_id: str,
    usuario_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Marca el progreso del usuario en un desafío como abandonado.
    """
    from app.models.db_models import ProgresoDesafioDiario
    
    progreso = db.query(ProgresoDesafioDiario).filter(
        ProgresoDesafioDiario.desafio_id == desafio_id,
        ProgresoDesafioDiario.usuario_id == usuario_id
    ).first()
    
    if not progreso:
        raise HTTPException(status_code=404, detail="Progreso de desafío no encontrado")
    
    progreso.estado = 'abandonado'
    db.commit()
    
    return {"message": "Desafío marcado como abandonado"}


class EjecutarCodigoRequest(BaseModel):
    codigo: str
    lenguaje: str


@router.post("/{desafio_id}/ejecutar")
async def ejecutar_codigo_desafio(
    desafio_id: str,
    usuario_id: str,
    request: EjecutarCodigoRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Ejecuta el código del usuario contra los casos de prueba del desafío.
    Guarda el código y lenguaje usado en el progreso.
    """
    from app.models.db_models import DesafioDiario, ProgresoDesafioDiario
    
    # Obtener el desafío global
    desafio = db.query(DesafioDiario).filter(
        DesafioDiario.id == desafio_id
    ).first()
    
    if not desafio:
        raise HTTPException(status_code=404, detail="Desafío no encontrado")
    
    # Obtener o crear el progreso del usuario
    progreso = db.query(ProgresoDesafioDiario).filter(
        ProgresoDesafioDiario.desafio_id == desafio_id,
        ProgresoDesafioDiario.usuario_id == usuario_id
    ).first()
    
    if not progreso:
        progreso = ProgresoDesafioDiario(
            usuario_id=usuario_id,
            desafio_id=desafio_id,
            estado='en_progreso'
        )
        db.add(progreso)
    
    # Actualizar el código y lenguaje usado
    progreso.codigo_enviado = request.codigo
    progreso.lenguaje_usado = request.lenguaje
    if progreso.estado == 'pendiente':
        progreso.estado = 'en_progreso'
    db.commit()
    
    # Obtener casos de prueba
    casos_prueba = desafio.casos_prueba_json or []
    
    if not casos_prueba:
        raise HTTPException(
            status_code=400,
            detail="No hay casos de prueba definidos para este desafío"
        )
    
    # Ejecutar el código
    resultados = ejecutar_codigo(
        codigo=request.codigo,
        lenguaje=request.lenguaje,
        casos_prueba=casos_prueba
    )
    
    return {
        "status": "success" if resultados["exito"] else "error",
        "resultados": resultados
    }
