"""Router para funcionalidad de Code Review con IA."""
import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.db import execute_query
from app.services.ia_service import IAService, get_ia_service

router = APIRouter()

REVIEW_COLUMNS = [
    "id", "usuario_id", "lenguaje", "codigo_original",
    "resumen_ejecutivo", "puntos_fuertes_json",
    "oportunidades_mejora_json", "optimizacion_json",
    "pista_conceptual", "created_at"
]


class CodeReviewRequest(BaseModel):
    """Request para solicitar code review."""
    codigo: str
    lenguaje: str
    usuario_id: str


class PistaRequest(BaseModel):
    """Request para generar pista de código."""
    codigo: str
    lenguaje: str


def parse_json_field(value):
    """Parsea un campo JSON de forma segura."""
    if value is None:
        return None
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, ValueError):
            return value
    return value


def review_to_dict(row):
    """Convierte una fila de review a diccionario."""
    if not row:
        return None
    data = dict(zip(REVIEW_COLUMNS, row))
    data["puntos_fuertes_json"] = parse_json_field(
        data["puntos_fuertes_json"]
    )
    data["oportunidades_mejora_json"] = parse_json_field(
        data["oportunidades_mejora_json"]
    )
    data["optimizacion_json"] = parse_json_field(
        data["optimizacion_json"]
    )
    return data


@router.post("/")
async def solicitar_code_review(
    request: CodeReviewRequest,
    ia_service: Annotated[IAService, Depends(get_ia_service)]
):
    """Solicita un code review con IA (próximamente)."""
    # Funcionalidad bloqueada temporalmente
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "message": "Funcionalidad próximamente disponible",
            "feature": "Code Review con IA",
            "status": "coming_soon"
        }
    )


@router.get("/historial")
async def obtener_historial_reviews(
    usuario_id: str,
    lenguaje: str | None = None,
    limite: int = 20,
    skip: int = 0
):
    """Obtiene historial de code reviews del usuario."""
    query = (
        "SELECT " + ", ".join(REVIEW_COLUMNS) +
        " FROM revisiones_codigo WHERE usuario_id = %s"
    )
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
    """Genera una pista para código (próximamente)."""
    # Funcionalidad bloqueada temporalmente
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "message": "Funcionalidad próximamente disponible",
            "feature": "Generación de pistas con IA",
            "status": "coming_soon"
        }
    )
