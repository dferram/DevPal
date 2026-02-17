"""
Rutas de API para el sistema de gamificación: Leaderboard y Badges.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Annotated, Optional
from app.database import get_db
from app.services.gamification_service import GamificationService, get_gamification_service

router = APIRouter()


@router.get("/leaderboard")
async def get_leaderboard(
    limite: int = Query(default=100, le=500, description="Número de usuarios a retornar"),
    offset: int = Query(default=0, ge=0, description="Paginación"),
    lenguaje: Optional[str] = Query(default=None, description="Filtrar por lenguaje"),
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Obtiene el leaderboard global de usuarios ordenado por XP.
    
    Query params:
    - limite: Cantidad de resultados (max 500)
    - offset: Para paginación
    - lenguaje: Filtro opcional por lenguaje (ej: "Python", "JavaScript")
    
    Returns:
        Lista de usuarios con ranking, nombre, nivel, XP, racha y badges
    """
    try:
        leaderboard = service.get_leaderboard(
            limite=limite,
            offset=offset,
            filtro_lenguaje=lenguaje
        )
        
        return {
            "status": "success",
            "total": len(leaderboard),
            "leaderboard": leaderboard
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener leaderboard: {str(e)}"
        )


@router.get("/ranking/{usuario_id}")
async def get_usuario_ranking(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Obtiene el ranking específico de un usuario.
    
    Returns:
        Posición en el leaderboard global, XP total, nivel y percentil
    """
    try:
        ranking_data = service.get_usuario_ranking(usuario_id)
        
        if ranking_data["ranking_global"] is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado en el leaderboard"
            )
        
        return {
            "status": "success",
            "ranking": ranking_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener ranking: {str(e)}"
        )


@router.get("/badges/{usuario_id}")
async def get_badges_usuario(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Obtiene todos los badges de un usuario.
    
    Returns:
        - desbloqueados: Badges que ya tiene el usuario
        - proximos: Badges cercanos a desbloquear con progreso
    """
    try:
        badges_data = service.get_badges_usuario(usuario_id)
        
        return {
            "status": "success",
            **badges_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener badges: {str(e)}"
        )


@router.post("/badges/verificar/{usuario_id}")
async def verificar_badges(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    """
    Verifica y desbloquea nuevos badges para un usuario.
    
    Este endpoint se debe llamar después de acciones importantes:
    - Completar un desafío
    - Asistir a un evento
    - Subir de nivel
    
    Returns:
        Lista de badges recién desbloqueados (si hay)
    """
    try:
        nuevos_badges = service.verificar_y_desbloquear_badges(usuario_id)
        
        return {
            "status": "success",
            "nuevos_badges": nuevos_badges,
            "cantidad": len(nuevos_badges)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al verificar badges: {str(e)}"
        )


@router.get("/stats/global")
async def get_stats_globales(
    db: Annotated[Session, Depends(get_db)] = None
):
    """
    Estadísticas globales de la plataforma para mostrar en leaderboard.
    
    Returns:
        Total de usuarios activos, desafíos completados, eventos y XP generado
    """
    from app.models.db_models import Usuario, ProgresoDesafioDiario, UsuarioEvento
    
    try:
        total_usuarios = db.query(Usuario).count()
        
        desafios_completados = db.query(ProgresoDesafioDiario).filter(
            ProgresoDesafioDiario.estado == "completado"
        ).count()
        
        eventos_asistidos = db.query(UsuarioEvento).filter(
            UsuarioEvento.estado.in_(["Asistido", "Completado", "Ganador"])
        ).count()
        
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )
