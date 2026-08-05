from typing import List, Dict, Any, Optional
import uuid
import json
from datetime import datetime
from app.db import execute_query, execute_one, get_db_connection

class GamificationService:
    """Gestiona el sistema de recompensas, badges y leaderboard usando SQL puro."""
    
    def __init__(self):
        pass
    
    def calcular_xp_usuario(self, perfil_dict: Dict[str, Any], usuario_id: str) -> Dict[str, Any]:
        """Calcula XP total de un usuario."""
        if not perfil_dict:
            return {"xp_actual": 0, "xp_nivel_actual": 0, "xp_next_level": 1000, "nivel_calculado": 1}
        
        # XP ganada por actividades
        xp_events = perfil_dict.get('eventos_asistidos', 0) * 150
        xp_certs = perfil_dict.get('certificados', 0) * 500
        xp_achievements = perfil_dict.get('logros', 0) * 200
        xp_streak = perfil_dict.get('racha_dias', 0) * 20
        
        # XP de badges
        badge_xp_row = execute_one("""
            SELECT SUM(b.xp_bonus) FROM badges b 
            JOIN usuario_badges ub ON b.id = ub.badge_id 
            WHERE ub.usuario_id = %s
        """, (usuario_id,))
        xp_badges = badge_xp_row[0] if badge_xp_row and badge_xp_row[0] else 0
        
        # XP de proyectos
        proj_count_row = execute_one("SELECT COUNT(*) FROM proyectos_usuario WHERE usuario_id = %s", (usuario_id,))
        xp_proyectos = proj_count_row[0] * 300 if proj_count_row else 0
        
        xp_total = xp_events + xp_certs + xp_achievements + xp_streak + xp_badges + xp_proyectos
        nivel_calculado = (xp_total // 1000) + 1
        
        return {
            "xp_actual": xp_total,
            "xp_nivel_actual": xp_total % 1000,
            "xp_next_level": 1000,
            "nivel_calculado": nivel_calculado
        }
    
    def get_leaderboard(
        self, 
        limite: int = 100, 
        offset: int = 0,
        filtro_lenguaje: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = """
            SELECT u.id, u.nombre, u.apellidos, u.avatar_url, p.nivel, p.logros, p.racha_dias, p.eventos_asistidos, p.certificados
            FROM usuarios u
            JOIN perfiles_usuario p ON u.id = p.usuario_id
        """
        params = []
        if filtro_lenguaje:
            query += " JOIN lenguajes_usuario l ON u.id = l.usuario_id WHERE l.lenguaje = %s"
            params.append(filtro_lenguaje)
            
        query += " ORDER BY p.nivel DESC, p.logros DESC, p.racha_dias DESC LIMIT %s OFFSET %s"
        params.extend([limite, offset])
        
        rows = execute_query(query, params, fetch=True)
        leaderboard = []
        for rank, r in enumerate(rows, start=offset + 1):
            u_id = str(r[0])
            perfil_dict = {
                "nivel": r[4], "logros": r[5], "racha_dias": r[6], 
                "eventos_asistidos": r[7], "certificados": r[8]
            }
            xp_data = self.calcular_xp_usuario(perfil_dict, u_id)
            
            # Count badges
            badges_count_row = execute_one("SELECT COUNT(*) FROM usuario_badges WHERE usuario_id = %s", (u_id,))
            badges_count = badges_count_row[0] if badges_count_row else 0
            
            leaderboard.append({
                "ranking": rank,
                "usuario_id": u_id,
                "nombre": r[1],
                "apellidos": r[2],
                "avatar_url": r[3],
                "nivel": r[4],
                "xp_total": xp_data["xp_actual"],
                "racha_dias": r[6],
                "badges_count": badges_count,
                "eventos_asistidos": r[7]
            })
        
        return leaderboard
    
    def get_usuario_ranking(self, usuario_id: str) -> Dict[str, Any]:
        # Simplificando para no traer 10000 usuarios en memoria si es posible
        # Pero para mantener la lógica de percentil necesitamos el total
        total_usuarios_row = execute_one("SELECT COUNT(*) FROM usuarios")
        total_usuarios = total_usuarios_row[0] if total_usuarios_row else 1
        
        # Encontrar ranking por XP (requiere subquery compleja o traer lista)
        # Vamos a traer el top 1000 para el ranking
        leaderboard = self.get_leaderboard(limite=1000, offset=0)
        
        for entry in leaderboard:
            if entry["usuario_id"] == usuario_id:
                return {
                    "ranking_global": entry["ranking"],
                    "xp_total": entry["xp_total"],
                    "nivel": entry["nivel"],
                    "percentil": round((1 - entry["ranking"] / total_usuarios) * 100, 1)
                }
        
        return {"ranking_global": None, "xp_total": 0, "nivel": 1, "percentil": 0}
    
    def verificar_y_desbloquear_badges(self, usuario_id: str) -> List[Dict[str, Any]]:
        perfil_row = execute_one("SELECT nivel, racha_dias, eventos_asistidos, certificados, logros FROM perfiles_usuario WHERE usuario_id = %s", (usuario_id,))
        if not perfil_row: return []
        
        perfil = {"nivel": perfil_row[0], "racha_dias": perfil_row[1], "eventos_asistidos": perfil_row[2]}
        
        todos_badges = execute_query("SELECT id, nombre, descripcion, icono, color, rareza, criterio_json, xp_bonus FROM badges", fetch=True)
        desbloqueados_rows = execute_query("SELECT badge_id FROM usuario_badges WHERE usuario_id = %s", (usuario_id,), fetch=True)
        desbloqueados_ids = {str(r[0]) for r in desbloqueados_rows}
        
        nuevos_badges = []
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                for b in todos_badges:
                    b_id = str(b[0])
                    if b_id in desbloqueados_ids: continue
                    
                    criterio = b[6] # criterio_json
                    if isinstance(criterio, str): criterio = json.loads(criterio)
                    
                    cumple = False
                    tipo = criterio.get("tipo")
                    if tipo == "racha":
                        cumple = perfil["racha_dias"] >= criterio.get("dias", 0)
                    elif tipo == "desafios_completados":
                        count = execute_one("SELECT COUNT(*) FROM progreso_desafio_diario WHERE usuario_id = %s AND estado = 'completado'", (usuario_id,))[0]
                        cumple = count >= criterio.get("cantidad", 0)
                    elif tipo == "eventos_asistidos":
                        cumple = perfil["eventos_asistidos"] >= criterio.get("cantidad", 0)
                    elif tipo == "nivel":
                        cumple = perfil["nivel"] >= criterio.get("nivel_minimo", 0)
                        
                    if cumple:
                        cur.execute("INSERT INTO usuario_badges (id, usuario_id, badge_id, progreso_actual) VALUES (%s, %s, %s, %s)",
                                   (str(uuid.uuid4()), usuario_id, b_id, 100))
                        nuevos_badges.append({
                            "id": b_id, "nombre": b[1], "descripcion": b[2], "icono": b[3],
                            "color": b[4], "rareza": b[5], "xp_bonus": b[7]
                        })
        return nuevos_badges
    
    def get_badges_usuario(self, usuario_id: str) -> Dict[str, Any]:
        rows = execute_query("""
            SELECT b.id, b.nombre, b.descripcion, b.icono, b.color, b.rareza, b.xp_bonus, ub.desbloqueado_at 
            FROM badges b JOIN usuario_badges ub ON b.id = ub.badge_id 
            WHERE ub.usuario_id = %s
        """, (usuario_id,), fetch=True)
        
        desbloqueados = [
            {"id": str(r[0]), "nombre": r[1], "descripcion": r[2], "icono": r[3], "color": r[4], 
             "rareza": r[5], "xp_bonus": r[6], "desbloqueado_at": r[7].isoformat() if r[7] else None}
            for r in rows
        ]
        
        # Proximos
        desb_ids = [str(r[0]) for r in rows]
        if desb_ids:
            placeholders = ', '.join(['%s'] * len(desb_ids))
            query = f"SELECT id, nombre, descripcion, icono, color, rareza, criterio_json FROM badges WHERE id NOT IN ({placeholders}) LIMIT 5"
            prox_rows = execute_query(query, tuple(desb_ids), fetch=True)
        else:
            prox_rows = execute_query("SELECT id, nombre, descripcion, icono, color, rareza, criterio_json FROM badges LIMIT 5", fetch=True)
            
        proximos = []
        perfil_row = execute_one("SELECT racha_dias, eventos_asistidos FROM perfiles_usuario WHERE usuario_id = %s", (usuario_id,))
        for p in prox_rows:
            criterio = p[6]
            if isinstance(criterio, str): criterio = json.loads(criterio)
            prog_act = 0
            prog_tot = 100
            if criterio.get("tipo") == "racha" and perfil_row:
                prog_act = min(perfil_row[0], criterio.get("dias", 0))
                prog_tot = criterio.get("dias", 0)
            elif criterio.get("tipo") == "eventos_asistidos" and perfil_row:
                prog_act = min(perfil_row[1], criterio.get("cantidad", 0))
                prog_tot = criterio.get("cantidad", 0)
                
            proximos.append({
                "id": str(p[0]), "nombre": p[1], "descripcion": p[2], "icono": p[3], "color": p[4], 
                "rareza": p[5], "progreso_actual": prog_act, "progreso_total": prog_tot
            })
            
        return {"desbloqueados": desbloqueados, "proximos": proximos}

def get_gamification_service() -> GamificationService:
    return GamificationService()
