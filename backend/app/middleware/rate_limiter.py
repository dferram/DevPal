"""
Middleware de Rate Limiting para proteger endpoints costosos.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

# Inicializar limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/hour"],  # Límite global por defecto
    storage_uri="memory://"  # Usar Redis en producción: "redis://localhost:6379"
)


def ai_rate_limit(limit: str):
    """
    Decorador para rate limiting específico de endpoints de IA.
    
    Args:
        limit: String de límite, ej: "5/hour", "10/minute"
    
    Ejemplo:
        @router.post("/generar")
        @ai_rate_limit("5/hour")
        async def generar_desafio(...):
            ...
    """
    return limiter.limit(limit)


def auth_rate_limit(limit: str):
    """
    Decorador para rate limiting de autenticación (anti brute-force).
    
    Args:
        limit: String de límite, ej: "10/minute"
    """
    return limiter.limit(limit)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware para manejar errores de rate limiting globalmente.
    """
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except RateLimitExceeded as e:
            logger.warning(
                f"Rate limit exceeded for {get_remote_address(request)} on {request.url.path}"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Too Many Requests",
                    "message": "Has excedido el límite de solicitudes. Intenta nuevamente más tarde.",
                    "retry_after": str(e.detail)
                }
            )
