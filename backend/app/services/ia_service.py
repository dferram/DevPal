from google import genai
from google.genai import types
from typing import Tuple, Any
from starlette.concurrency import run_in_threadpool
import logging
import uuid
import json
from datetime import datetime

from app.services.noticias_generator import buscar_noticias_generales
from app.services.eventos_generator import buscar_eventos_generales
from app.services.desafios_generator import generar_desafio_diario
from app.services.code_review_generator import generar_pista
from app.services.review_code_generator import review_code
from app.credenciales import api_key
from app.config import get_settings
from app.db import execute_query, execute_one, get_db_connection

settings = get_settings()
logger = logging.getLogger(__name__)

class IAService:
    
    def __init__(self):
        try:
            self.client = genai.Client(api_key=api_key())
        except Exception as e:
            logger.error(f"Error initializing GenAI client: {e}")
            self.client = None
    
    def generar_y_guardar_noticias(
        self, 
        usuario_id: str | None = None, 
        limite: int = 50
    ) -> Tuple[int, int]:
        
        if not self.client:
            logger.warning("GenAI client not initialized. Skipping news generation.")
            return 0, 0

        try:
            noticias_raw, timestamp = buscar_noticias_generales(self.client, limite)
            
            if not noticias_raw:
                return 0, 0
            
            # Get existing URLs
            urls_generadas = [n['url'] for n in noticias_raw]
            placeholders = ', '.join(['%s'] * len(urls_generadas))
            query_existentes = f"SELECT url FROM noticias WHERE url IN ({placeholders})"
            rows_existentes = execute_query(query_existentes, tuple(urls_generadas), fetch=True)
            urls_existentes_set = {r[0] for r in rows_existentes}
            
            noticias_nuevas = [n for n in noticias_raw if n['url'] not in urls_existentes_set]
            
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    for n in noticias_nuevas:
                        cur.execute(
                            """INSERT INTO noticias (id, usuario_id, titulo_resumen, url, fecha_publicacion, imagen_url, fuente, relevancia) 
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                            (str(uuid.uuid4()), usuario_id, n['titulo_resumen'], n['url'], n.get('fecha_publicacion'), 
                             n.get('imagen_url', ''), n.get('fuente', ''), n.get('relevancia', 'Media'))
                        )
            
            duplicadas = len(noticias_raw) - len(noticias_nuevas)
            return len(noticias_nuevas), duplicadas

        except Exception as e:
            logger.error(f"Error generando noticias: {e}")
            return 0, 0
    
    def generar_y_guardar_eventos(
        self, 
        limite: int = 15
    ) -> Tuple[int, int]:
       
        if not self.client:
            logger.warning("GenAI client not initialized. Skipping event generation.")
            return 0, 0

        try:
            eventos_raw, timestamp = buscar_eventos_generales(self.client, limite)
            
            if not eventos_raw:
                return 0, 0
            
            nuevos_count = 0
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    for e in eventos_raw:
                        # Check if exists
                        cur.execute(
                            "SELECT id FROM eventos WHERE titulo = %s AND fecha = %s AND (ubicacion = %s OR (ubicacion IS NULL AND %s IS NULL))",
                            (e['titulo'], e['fecha'], e.get('ubicacion', ''), e.get('ubicacion', ''))
                        )
                        if not cur.fetchone():
                            cur.execute(
                                """INSERT INTO eventos (id, titulo, descripcion, fecha, hora, ubicacion, categoria, imagen_url, cupos_disponibles, es_popular, organizador, url_externa, latitud, longitud) 
                                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                                (str(uuid.uuid4()), e['titulo'], e.get('descripcion', ''), e['fecha'], e['hora'], e.get('ubicacion', ''), 
                                 e['categoria'], e.get('imagen_url', ''), e.get('cupos_disponibles', 100), e.get('es_popular', False), 
                                 e.get('organizador', ''), e.get('url_externa', ''), e.get('latitud'), e.get('longitud'))
                            )
                            nuevos_count += 1
            
            duplicados = len(eventos_raw) - nuevos_count
            return nuevos_count, duplicados

        except Exception as e:
            logger.error(f"Error generando eventos: {e}")
            return 0, 0
    
    async def generar_desafio_global(self) -> dict | None:
        hoy = datetime.now().date()
        
        # Check if exists
        desafio_existente = execute_one("SELECT id, titulo, fecha FROM desafios_diarios WHERE fecha = %s", (hoy,))
        if desafio_existente:
            # Return as dict for consistency if needed, but the router will fetch details.
            # Usually routers expect an object or dict.
            # Let's return the full dict of the challenge.
            return self._get_challenge_by_date(hoy)

        try:
            # 1. Previous history
            previos = execute_query("SELECT titulo FROM desafios_diarios ORDER BY fecha DESC LIMIT 30", fetch=True)
            historia_titulos = [d[0] for d in previos]
            
            user_info = {
                "nombre": "Developer",
                "nivel": 2,
                "intereses": ["Algoritmos", "Estructuras de datos", "Programación"],
                "lenguajes": ["Python", "JavaScript", "Java"]
            }
            
            # Now using the static generator
            desafio_raw, timestamp = generar_desafio_diario(None, user_info, historia_titulos)
            
            if not desafio_raw:
                return None
            
            desafio_id = str(uuid.uuid4())
            execute_query(
                """INSERT INTO desafios_diarios (id, fecha, titulo, lenguaje_recomendado, contexto_negocio, 
                   definicion_problema, templates_lenguajes_json, restricciones_json, casos_prueba_json, 
                   pista, dificultad, xp_recompensa) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (desafio_id, hoy, desafio_raw['titulo'], desafio_raw.get('lenguaje_recomendado', 'python'), 
                 desafio_raw.get('contexto_negocio', ''), desafio_raw['definicion_problema'], 
                 json.dumps(desafio_raw.get('templates_por_lenguaje', {})), 
                 json.dumps(desafio_raw.get('restricciones', {})), 
                 json.dumps(desafio_raw.get('casos_prueba', [])), 
                 desafio_raw.get('pista', ''), desafio_raw.get('dificultad', 'Medio'), 
                 desafio_raw.get('xp_recompensa', 50))
            )
            
            return self._get_challenge_by_id(desafio_id)

        except Exception as e:
            logger.error(f"Error generando desafío global: {e}")
            return None

    def _get_challenge_by_date(self, fecha):
        cols = ["id", "fecha", "titulo", "lenguaje_recomendado", "contexto_negocio", "definicion_problema", 
                "templates_lenguajes_json", "restricciones_json", "casos_prueba_json", "pista", "dificultad", "xp_recompensa", "created_at"]
        row = execute_one(f"SELECT {', '.join(cols)} FROM desafios_diarios WHERE fecha = %s", (fecha,))
        if not row: return None
        return dict(zip(cols, row))

    def _get_challenge_by_id(self, id):
        cols = ["id", "fecha", "titulo", "lenguaje_recomendado", "contexto_negocio", "definicion_problema", 
                "templates_lenguajes_json", "restricciones_json", "casos_prueba_json", "pista", "dificultad", "xp_recompensa", "created_at"]
        row = execute_one(f"SELECT {', '.join(cols)} FROM desafios_diarios WHERE id = %s", (id,))
        if not row: return None
        return dict(zip(cols, row))

    async def realizar_code_review(
        self,
        usuario_id: str,
        codigo: str,
        lenguaje: str,
        informacion_usuario: dict
    ) -> dict | None:
        if not self.client:
            return {
                "resumen_ejecutivo": "Servicio de IA no disponible.",
                "puntos_fuertes_json": [],
                "oportunidades_mejora_json": [],
                "pista_conceptual": "Por favor contacta al administrador."
            }

        try:
            review_raw, timestamp = await run_in_threadpool(
                review_code, codigo, lenguaje, self.client, informacion_usuario
            )
            
            if not review_raw:
                return None
            
            rev_id = str(uuid.uuid4())
            execute_query(
                """INSERT INTO revisiones_codigo (id, usuario_id, lenguaje, codigo_original, resumen_ejecutivo, 
                   puntos_fuertes_json, oportunidades_mejora_json, optimizacion_json, pista_conceptual) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (rev_id, usuario_id, lenguaje, codigo, review_raw.get('resumen_ejecutivo', ''), 
                 json.dumps(review_raw.get('puntos_fuertes', [])), 
                 json.dumps(review_raw.get('oportunidades_mejora', [])), 
                 json.dumps(review_raw.get('optimizacion_sugerida', {})), 
                 review_raw.get('pista_conceptual', ''))
            )
            
            # Return as dict
            cols = ["id", "usuario_id", "lenguaje", "codigo_original", "resumen_ejecutivo", "puntos_fuertes_json", 
                    "oportunidades_mejora_json", "optimizacion_json", "pista_conceptual", "created_at"]
            row = execute_one(f"SELECT {', '.join(cols)} FROM revisiones_codigo WHERE id = %s", (rev_id,))
            return dict(zip(cols, row))

        except Exception as e:
            logger.error(f"Error en Code Review: {e}")
            return {
                "resumen_ejecutivo": "El servicio de IA está temporalmente no disponible (Quota Limit).",
                "puntos_fuertes_json": [],
                "oportunidades_mejora_json": [],
                "pista_conceptual": "Intenta más tarde."
            }
    
    async def generar_pista_codigo(self, codigo: str, lenguaje: str, informacion_usuario: dict) -> dict | None:
        if not self.client:
             return {"pista": "Servicio de IA no inicializado."}
        try:
            pista_raw, timestamp = await run_in_threadpool(generar_pista, codigo, lenguaje, self.client, informacion_usuario)
            return pista_raw
        except Exception as e:
            logger.error(f"Error generando pista: {e}")
            return {"pista": "No se pudo generar una pista en este momento."}

def get_ia_service() -> IAService:
    return IAService()
