"""
Servicio de gamificación: Leaderboard, Badges y cálculo de XP.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Dict, Any, Optional
from app.models.db_models import (
    Usuario, PerfilUsuario, DesafioDiario, ProgresoDesafioDiario, UsuarioEvento,
    Badge, UsuarioBadge
)


class GamificationService:
    """Gestiona el sistema de recompensas, badges y leaderboard."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def calcular_xp_usuario(self, perfil: PerfilUsuario) -> Dict[str, int]:
        """
        Calcula XP total de un usuario basado en su perfil.
        
        Returns:
            dict con 'xp_actual' y 'xp_next_level'
        """
        if not perfil:
            return {"xp_actual": 0, "xp_next_level": 1000}
        
        # Base XP del nivel actual
        base_xp = (perfil.nivel - 1) * 1000
        
        # XP ganada por actividades
        # XP ganada por actividades (incluyendo proyectos manuales si se requiere, por ahora eventos/retos)
        xp_events = perfil.eventos_asistidos * 150
        xp_certs = perfil.certificados * 500
        xp_achievements = perfil.logros * 200
        xp_streak = perfil.racha_dias * 20
        
        # Sumar bonus de badges
        usuario = perfil.usuario
        xp_badges = sum(
            ub.badge.xp_bonus 
            for ub in usuario.badges 
            if ub.badge
        )

        # Proyectos manuales (ej: 300 XP por proyecto)
        xp_proyectos = 0
        if hasattr(usuario, 'proyectos'):
             xp_proyectos = len(usuario.proyectos) * 300
        
        # XP TOTAL ACUMULADO
        xp_total = xp_events + xp_certs + xp_achievements + xp_streak + xp_badges + xp_proyectos
        
        # CÁLCULO DE NIVEL: Cada 1000 XP es un nivel. Nivel 1 es 0-999 XP.
        # Nivel = floor(xp_total / 1000) + 1
        nivel_calculado = (xp_total // 1000) + 1
        
        # XP para el siguiente nivel (siempre múltiplo de 1000 superior)
        xp_next_level_total = nivel_calculado * 1000
        
        # Si el nivel calculado es mayor al guardado, podríamos actualizarlo aquí o dejar que un proceso lo haga
        # Para visualización, retornamos el calculado.
        
        return {
            "xp_actual": xp_total,           # XP Total acumulado en la vida
            "xp_nivel_actual": xp_total % 1000, # XP dentro del nivel actual (barra de progreso)
            "xp_next_level": 1000,           # Meta del nivel (siempre 1000 en este modelo lineal)
            "nivel_calculado": nivel_calculado
        }
    
    def get_leaderboard(
        self, 
        limite: int = 100, 
        offset: int = 0,
        filtro_lenguaje: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtiene el leaderboard global ordenado por XP.
        
        Args:
            limite: Número de usuarios a retornar
            offset: Paginación
            filtro_lenguaje: Filtrar por lenguaje de programación
        
        Returns:
            Lista de usuarios con su ranking y XP
        """
        from sqlalchemy.orm import joinedload
        
        query = self.db.query(Usuario, PerfilUsuario)\
            .join(PerfilUsuario, Usuario.id == PerfilUsuario.usuario_id)\
            .options(joinedload(Usuario.badges).joinedload(UsuarioBadge.badge))
        
        # Filtro opcional por lenguaje
        if filtro_lenguaje:
            from app.models.db_models import LenguajeUsuario
            query = query.join(
                LenguajeUsuario,
                Usuario.id == LenguajeUsuario.usuario_id
            ).filter(LenguajeUsuario.lenguaje == filtro_lenguaje)
        
        # Obtener usuarios ordenados por nivel y logros
        usuarios = query.order_by(
            desc(PerfilUsuario.nivel),
            desc(PerfilUsuario.logros),
            desc(PerfilUsuario.racha_dias)
        ).limit(limite).offset(offset).all()
        
        # Calcular XP y armar leaderboard
        leaderboard = []
        for rank, (usuario, perfil) in enumerate(usuarios, start=offset + 1):
            xp_data = self.calcular_xp_usuario(perfil)
            
            # Contar badges desbloqueados (sin query adicional)
            badges_count = len(usuario.badges)
            
            leaderboard.append({
                "ranking": rank,
                "usuario_id": str(usuario.id),
                "nombre": usuario.nombre,
                "apellidos": usuario.apellidos,
                "avatar_url": usuario.avatar_url,
                "nivel": perfil.nivel,
                "xp_total": xp_data["xp_actual"],
                "racha_dias": perfil.racha_dias,
                "badges_count": badges_count,
                "eventos_asistidos": perfil.eventos_asistidos
            })
        
        return leaderboard
    
    def get_usuario_ranking(self, usuario_id: str) -> Dict[str, Any]:
        """
        Obtiene el ranking específico de un usuario.
        
        Returns:
            Posición en el leaderboard y datos de progreso
        """
        # Obtener todos los usuarios con XP calculado
        leaderboard_completo = self.get_leaderboard(limite=10000)
        
        # Buscar posición del usuario
        for entry in leaderboard_completo:
            if entry["usuario_id"] == usuario_id:
                return {
                    "ranking_global": entry["ranking"],
                    "xp_total": entry["xp_total"],
                    "nivel": entry["nivel"],
                    "percentil": round((1 - entry["ranking"] / len(leaderboard_completo)) * 100, 1)
                }
        
        return {
            "ranking_global": None,
            "xp_total": 0,
            "nivel": 1,
            "percentil": 0
        }
    
    def verificar_y_desbloquear_badges(self, usuario_id: str) -> List[Dict[str, Any]]:
        """
        Verifica si el usuario cumple criterios para nuevos badges.
        
        Returns:
            Lista de badges recién desbloqueados
        """
        usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            return []
        
        perfil = usuario.perfil
        nuevos_badges = []
        
        # Obtener todos los badges disponibles
        todos_badges = self.db.query(Badge).all()
        
        # Badges ya desbloqueados por el usuario
        badges_desbloqueados_ids = {ub.badge_id for ub in usuario.badges}
        
        for badge in todos_badges:
            if badge.id in badges_desbloqueados_ids:
                continue  # Ya tiene este badge
            
            criterio = badge.criterio_json
            cumple = False
            
            # Evaluar criterios según tipo
            if criterio.get("tipo") == "racha":
                cumple = perfil.racha_dias >= criterio.get("dias", 0)
            
            elif criterio.get("tipo") == "desafios_completados":
                desafios_completados = self.db.query(ProgresoDesafioDiario).filter(
                    ProgresoDesafioDiario.usuario_id == usuario_id,
                    ProgresoDesafioDiario.estado == "completado"
                ).count()
                cumple = desafios_completados >= criterio.get("cantidad", 0)
            
            elif criterio.get("tipo") == "desafios_dificiles":
                desafios_dificiles = self.db.query(ProgresoDesafioDiario).join(
                    DesafioDiario,
                    ProgresoDesafioDiario.desafio_id == DesafioDiario.id
                ).filter(
                    ProgresoDesafioDiario.usuario_id == usuario_id,
                    ProgresoDesafioDiario.estado == "completado",
                    DesafioDiario.dificultad == "Difícil"
                ).count()
                cumple = desafios_dificiles >= criterio.get("cantidad", 0)
            
            elif criterio.get("tipo") == "eventos_asistidos":
                cumple = perfil.eventos_asistidos >= criterio.get("cantidad", 0)
            
            elif criterio.get("tipo") == "nivel":
                cumple = perfil.nivel >= criterio.get("nivel_minimo", 0)
            
            # Si cumple, desbloquear badge
            if cumple:
                nuevo_usuario_badge = UsuarioBadge(
                    usuario_id=usuario_id,
                    badge_id=badge.id,
                    progreso_actual=100,  # 100% completado
                    notificado=False
                )
                self.db.add(nuevo_usuario_badge)
                
                nuevos_badges.append({
                    "id": str(badge.id),
                    "nombre": badge.nombre,
                    "descripcion": badge.descripcion,
                    "icono": badge.icono,
                    "color": badge.color,
                    "rareza": badge.rareza,
                    "xp_bonus": badge.xp_bonus
                })
        
        if nuevos_badges:
            self.db.commit()
        
        return nuevos_badges
    
    def get_badges_usuario(self, usuario_id: str) -> Dict[str, Any]:
        """
        Obtiene todos los badges de un usuario.
        
        Returns:
            Badges desbloqueados y próximos badges cercanos
        """
        usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            return {"desbloqueados": [], "proximos": []}
        
        # Badges desbloqueados
        desbloqueados = []
        for ub in usuario.badges:
            desbloqueados.append({
                "id": str(ub.badge_id),
                "nombre": ub.badge.nombre,
                "descripcion": ub.badge.descripcion,
                "icono": ub.badge.icono,
                "color": ub.badge.color,
                "rareza": ub.badge.rareza,
                "xp_bonus": ub.badge.xp_bonus,
                "desbloqueado_at": ub.desbloqueado_at.isoformat()
            })
        
        # Próximos badges (aún no desbloqueados)
        badges_desbloqueados_ids = {ub.badge_id for ub in usuario.badges}
        proximos_badges = self.db.query(Badge).filter(
            ~Badge.id.in_(badges_desbloqueados_ids)
        ).limit(5).all()
        
        proximos = []
        perfil = usuario.perfil
        
        for badge in proximos_badges:
            criterio = badge.criterio_json
            progreso_actual = 0
            progreso_total = 100
            
            # Calcular progreso según tipo
            if criterio.get("tipo") == "racha" and perfil:
                progreso_actual = min(perfil.racha_dias, criterio.get("dias", 0))
                progreso_total = criterio.get("dias", 0)
            elif criterio.get("tipo") == "eventos_asistidos" and perfil:
                progreso_actual = min(perfil.eventos_asistidos, criterio.get("cantidad", 0))
                progreso_total = criterio.get("cantidad", 0)
            
            proximos.append({
                "id": str(badge.id),
                "nombre": badge.nombre,
                "descripcion": badge.descripcion,
                "icono": badge.icono,
                "color": badge.color,
                "rareza": badge.rareza,
                "progreso_actual": progreso_actual,
                "progreso_total": progreso_total
            })
        
        return {
            "desbloqueados": desbloqueados,
            "proximos": proximos
        }


from fastapi import Depends
from app.database import get_db

def get_gamification_service(db: Session = Depends(get_db)) -> GamificationService:
    return GamificationService(db)
