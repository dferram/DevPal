from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from pydantic import BaseModel
import json
import uuid
from datetime import datetime
from app.db import execute_query, execute_one, get_db_connection
from app.services.ia_service import IAService, get_ia_service
from app.services.code_executor import ejecutar_codigo

router = APIRouter()

def parse_json_field(value, default):
    if value is None: return default
    if isinstance(value, str):
        try: return json.loads(value)
        except: return default
    return value

def serialize_desafio_con_progreso(desafio, progreso=None) -> dict:
    if desafio is None: return None
    
    resultado = {
        "id": str(desafio["id"]),
        "fecha": desafio["fecha"].isoformat() if desafio["fecha"] else None,
        "titulo": desafio["titulo"],
        "lenguaje_recomendado": desafio["lenguaje_recomendado"],
        "contexto_negocio": desafio.get("contexto_negocio", ""),
        "definicion_problema": desafio["definicion_problema"],
        "templates_lenguajes": parse_json_field(desafio.get("templates_lenguajes_json"), {}),
        "restricciones": parse_json_field(desafio.get("restricciones_json"), {}),
        "casos_prueba": parse_json_field(desafio.get("casos_prueba_json"), []),
        "pista": desafio.get("pista"),
        "dificultad": desafio["dificultad"],
        "xp_recompensa": desafio["xp_recompensa"],
        "created_at": desafio["created_at"].isoformat() if desafio["created_at"] else None,
    }
    
    if progreso:
        resultado["estado"] = progreso["estado"]
        resultado["completado_at"] = progreso["completado_at"].isoformat() if progreso["completado_at"] else None
        resultado["progreso_id"] = str(progreso["id"])
    else:
        resultado["estado"] = "pendiente"
        resultado["completado_at"] = None
        resultado["progreso_id"] = None
    
    return resultado

@router.get("/hoy")
async def obtener_desafio_del_dia(
    usuario_id: str,
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    hoy = datetime.now().date()
    # Buscar el desafío global del día
    desafio_row = execute_one("SELECT * FROM desafios_diarios WHERE fecha = %s", (hoy,))
    
    if not desafio_row:
        desafio_dict = await ia_service.generar_desafio_global()
        if not desafio_dict:
            raise HTTPException(status_code=500, detail="No se pudo generar el desafío del día")
        desafio_id = desafio_dict["id"]
    else:
        cols = ["id", "fecha", "titulo", "lenguaje_recomendado", "contexto_negocio", "definicion_problema", 
                "templates_lenguajes_json", "restricciones_json", "casos_prueba_json", "pista", "dificultad", "xp_recompensa", "created_at"]
        desafio_dict = dict(zip(cols, desafio_row))
        desafio_id = desafio_dict["id"]
    
    # Buscar o crear progreso
    prog_cols = ["id", "usuario_id", "desafio_id", "estado", "completado_at", "codigo_enviado", "lenguaje_usado", "created_at", "updated_at"]
    progreso_row = execute_one("SELECT * FROM progreso_desafio_diario WHERE usuario_id = %s AND desafio_id = %s", (usuario_id, desafio_id))
    
    if not progreso_row:
        prog_id = str(uuid.uuid4())
        execute_query(
            "INSERT INTO progreso_desafio_diario (id, usuario_id, desafio_id, estado) VALUES (%s, %s, %s, %s)",
            (prog_id, usuario_id, desafio_id, 'pendiente')
        )
        progreso_row = execute_one("SELECT * FROM progreso_desafio_diario WHERE id = %s", (prog_id,))
        
    progreso_dict = dict(zip(prog_cols, progreso_row))
    return serialize_desafio_con_progreso(desafio_dict, progreso_dict)

@router.post("/generar")
async def generar_nuevo_desafio(ia_service: Annotated[IAService, Depends(get_ia_service)]):
    hoy = datetime.now().date()
    desafio_existente = execute_one("SELECT id FROM desafios_diarios WHERE fecha = %s", (hoy,))
    if desafio_existente:
        return {"status": "exists", "message": "Ya existe un desafío para hoy"}
    
    desafio = await ia_service.generar_desafio_global()
    if not desafio:
        raise HTTPException(status_code=500, detail="Error al generar el desafío")
    
    return {"status": "success", "desafio": serialize_desafio_con_progreso(desafio), "message": "Desafío generado exitosamente"}

@router.get("/historial")
async def obtener_historial(usuario_id: str, estado: str | None = None, limite: int = 20, skip: int = 0):
    query = """
        SELECT p.*, d.* FROM progreso_desafio_diario p 
        JOIN desafios_diarios d ON p.desafio_id = d.id 
        WHERE p.usuario_id = %s
    """
    params = [usuario_id]
    if estado:
        query += " AND p.estado = %s"
        params.append(estado)
    query += " ORDER BY d.fecha DESC LIMIT %s OFFSET %s"
    params.extend([limite, skip])
    
    # Needs careful column splitting because of JOIN
    # Better to fetch specific columns.
    # For now, let's keep it simple or fetch separately.
    rows = execute_query(query, params, fetch=True)
    results = []
    # Approximate mapping (assuming p has 9 cols and d has 13 cols)
    for r in rows:
        p_dict = {"id": r[0], "estado": r[3], "completado_at": r[4]}
        d_dict = {"id": r[9], "fecha": r[10], "titulo": r[11], "lenguaje_recomendado": r[12], 
                  "contexto_negocio": r[13], "definicion_problema": r[14], "templates_lenguajes_json": r[15],
                  "restricciones_json": r[16], "casos_prueba_json": r[17], "pista": r[18],
                  "dificultad": r[19], "xp_recompensa": r[20], "created_at": r[21]}
        results.append(serialize_desafio_con_progreso(d_dict, p_dict))
    return results

@router.post("/{desafio_id}/completar")
async def marcar_completado(desafio_id: str, usuario_id: str):
    execute_query(
        "UPDATE progreso_desafio_diario SET estado = %s, completado_at = %s WHERE desafio_id = %s AND usuario_id = %s",
        ('completado', datetime.now(), desafio_id, usuario_id)
    )
    return {"message": "Desafío completado exitosamente"}

@router.post("/{desafio_id}/abandonar")
async def marcar_abandonado(desafio_id: str, usuario_id: str):
    execute_query(
        "UPDATE progreso_desafio_diario SET estado = %s WHERE desafio_id = %s AND usuario_id = %s",
        ('abandonado', desafio_id, usuario_id)
    )
    return {"message": "Desafío marcado como abandonado"}

class EjecutarCodigoRequest(BaseModel):
    codigo: str
    lenguaje: str

@router.post("/{desafio_id}/ejecutar")
async def ejecutar_codigo_desafio(desafio_id: str, usuario_id: str, request: EjecutarCodigoRequest):
    desafio_row = execute_one("SELECT casos_prueba_json FROM desafios_diarios WHERE id = %s", (desafio_id,))
    if not desafio_row:
        raise HTTPException(status_code=404, detail="Desafío no encontrado")
    
    # Update progress
    execute_query("""
        UPDATE progreso_desafio_diario 
        SET codigo_enviado = %s, lenguaje_usado = %s, estado = CASE WHEN estado = 'pendiente' THEN 'en_progreso' ELSE estado END 
        WHERE desafio_id = %s AND usuario_id = %s
    """, (request.codigo, request.lenguaje, desafio_id, usuario_id))
    
    casos_prueba = parse_json_field(desafio_row[0], [])
    if not casos_prueba:
        raise HTTPException(status_code=400, detail="No hay casos de prueba definidos")
    
    resultados = ejecutar_codigo(codigo=request.codigo, lenguaje=request.lenguaje, casos_prueba=casos_prueba)
    return {"status": "success" if resultados["exito"] else "error", "resultados": resultados}
