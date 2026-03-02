from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from pydantic import BaseModel
import json
from app.db import execute_one, execute_query
from app.services.ia_service import IAService, get_ia_service

router = APIRouter()

class CodeReviewRequest(BaseModel):
    codigo: str
    lenguaje: str
    usuario_id: str

class PistaRequest(BaseModel):
    codigo: str
    lenguaje: str

REVIEW_COLUMNS = ["id", "usuario_id", "lenguaje", "codigo_original", "resumen_ejecutivo", "puntos_fuertes_json", "oportunidades_mejora_json", "optimizacion_json", "pista_conceptual", "created_at"]

def parse_json_field(value):
    if value is None: return None
    if isinstance(value, str):
        try: return json.loads(value)
        except: return value
    return value

def review_to_dict(row):
    if not row: return None
    d = dict(zip(REVIEW_COLUMNS, row))
    d["puntos_fuertes_json"] = parse_json_field(d["puntos_fuertes_json"])
    d["oportunidades_mejora_json"] = parse_json_field(d["oportunidades_mejora_json"])
    d["optimizacion_json"] = parse_json_field(d["optimizacion_json"])
    return d

@router.post("/")
async def solicitar_code_review(
    request: CodeReviewRequest,
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    try:
        user_row = execute_one("SELECT nombre FROM usuarios WHERE id = %s", (request.usuario_id,))
        informacion_usuario = {"nombre": user_row[0] if user_row else "Usuario"}
        
        review = await ia_service.realizar_code_review(
            usuario_id=request.usuario_id,
            codigo=request.codigo,
            lenguaje=request.lenguaje,
            informacion_usuario=informacion_usuario
        )
        
        if not review:
            raise HTTPException(status_code=500, detail="Error al generar la revisión")
        
        # If review is already a dict from ia_service (which it is in my refactored version), return it
        return {"status": "success", "review": review}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/historial")
async def obtener_historial_reviews(usuario_id: str, lenguaje: str | None = None, limite: int = 20, skip: int = 0):
    query = "SELECT " + ", ".join(REVIEW_COLUMNS) + " FROM revisiones_codigo WHERE usuario_id = %s"
    params = [usuario_id]
    if lenguaje:
        query += " AND lenguaje = %s"
        params.append(lenguaje)
    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limite, skip])
    
    rows = execute_query(query, params, fetch=True)
    return [review_to_dict(r) for r in rows]

@router.post("/pistas/generar")
async def generar_pista(
    request: PistaRequest,
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    try:
        pista = await ia_service.generar_pista_codigo(
            codigo=request.codigo,
            lenguaje=request.lenguaje,
            informacion_usuario={"nombre": "Usuario"}
        )
        if not pista:
            raise HTTPException(status_code=500, detail="Error al generar la pista")
        return {"status": "success", "pista": pista}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
