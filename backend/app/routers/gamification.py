"""
Rutas de API para el sistema de gamificación: Leaderboard y Badges usando SQL puro.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, Optional
from app.services.gamification_service import GamificationService, get_gamification_service
from app.db import execute_one

router = APIRouter()

@router.get("/leaderboard")
async def get_leaderboard(
    limite: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    lenguaje: Optional[str] = None,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    try:
        leaderboard = service.get_leaderboard(limite=limite, offset=offset, filtro_lenguaje=lenguaje)
        return {"status": "success", "total": len(leaderboard), "leaderboard": leaderboard}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/ranking/{usuario_id}")
async def get_usuario_ranking(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    try:
        ranking_data = service.get_usuario_ranking(usuario_id)
        if ranking_data["ranking_global"] is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {"status": "success", "ranking": ranking_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/badges/{usuario_id}")
async def get_badges_usuario(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    try:
        return {"status": "success", **service.get_badges_usuario(usuario_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/badges/verificar/{usuario_id}")
async def verificar_badges(
    usuario_id: str,
    service: Annotated[GamificationService, Depends(get_gamification_service)] = None
):
    try:
        nuevos = service.verificar_y_desbloquear_badges(usuario_id)
        return {"status": "success", "nuevos_badges": nuevos, "cantidad": len(nuevos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/global")
async def get_stats_globales():
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
        raise HTTPException(status_code=500, detail=str(e))
