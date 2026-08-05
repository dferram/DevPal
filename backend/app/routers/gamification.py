"""
Rutas de API para el sistema de gamificación: Leaderboard y Badges usando SQL puro.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Annotated, Optional
from app.services.gamification_service import GamificationService, get_gamification_service
from app.db import execute_one
from app.utils.validation import validate_uuid, validate_positive_integer

router = APIRouter()

@router.get("/leaderboard")
async def get_leaderboard(
    limite: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    lenguaje: Optional[str] = None,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Obtiene el leaderboard global.
    
    Args:
        limite: Máximo de usuarios en el leaderboard (1-500)
        offset: Número de usuarios a saltar (0-10000)
        lenguaje: Filtrar por lenguaje (opcional)
        
    Returns:
        Leaderboard con usuarios y sus estadísticas
        
    Raises:
        HTTPException: Si los parámetros no son válidos o hay error en el servidor
    """
    limite = validate_positive_integer(limite, "Límite", min_value=1, max_value=500)
    offset = validate_positive_integer(offset, "Offset", min_value=0, max_value=10000)
    
    try:
        leaderboard = service.get_leaderboard(limite=limite, offset=offset, filtro_lenguaje=lenguaje)
        return {"status": "success", "total": len(leaderboard), "leaderboard": leaderboard}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}") from e

@router.get("/ranking/{usuario_id}")
async def get_usuario_ranking(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Obtiene el ranking de un usuario específico.
    
    Args:
        usuario_id: ID del usuario
        
    Returns:
        Datos de ranking del usuario
        
    Raises:
        HTTPException: Si el usuario no existe o el ID no es válido
    """
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    try:
        ranking_data = service.get_usuario_ranking(usuario_id)
        if ranking_data["ranking_global"] is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {"status": "success", "ranking": ranking_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/badges/{usuario_id}")
async def get_badges_usuario(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Obtiene las badges (desbloqueadas y próximas) de un usuario.
    
    Args:
        usuario_id: ID del usuario
        
    Returns:
        Badges desbloqueadas y próximas a desbloquear
        
    Raises:
        HTTPException: Si el ID no es válido o hay error en el servidor
    """
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    try:
        return {"status": "success", **service.get_badges_usuario(usuario_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/badges/verificar/{usuario_id}")
async def verificar_badges(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Verifica y desbloquea nuevas badges para un usuario.
    
    Args:
        usuario_id: ID del usuario
        
    Returns:
        Lista de nuevas badges desbloqueadas
        
    Raises:
        HTTPException: Si el ID no es válido o hay error en el servidor
    """
    usuario_id = validate_uuid(usuario_id, "ID de usuario")
    
    try:
        nuevos = service.verificar_y_desbloquear_badges(usuario_id)
        return {"status": "success", "nuevos_badges": nuevos, "cantidad": len(nuevos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/stats/global")
async def get_stats_globales():
    """
    Obtiene estadísticas globales del sistema.
    
    Returns:
        Estadísticas globales (total usuarios, desafíos completados, eventos asistidos, XP generado)
        
    Raises:
        HTTPException: Si hay error en el servidor
    """
    try:
        total_usuarios = execute_one("SELECT COUNT(*) FROM usuarios")[0]
        desafios_completados = execute_one("SELECT COUNT(*) FROM progreso_desafio_diario WHERE estado = 'completado'")[0]
        eventos_asistidos = execute_one("SELECT COUNT(*) FROM usuario_eventos WHERE estado IN ('Asistido', 'Completado', 'Ganador')")[0]
        
        return {
            "status": "success",
            "stats": {
                "total_usuarios": total_usuarios,
                "desafios_completados": desafios_completados,
                "eventos_asistidos": eventos_asistidos,
                "xp_generado_total": desafios_completados * 50 + eventos_asistidos * 150
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
