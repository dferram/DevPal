"""
Rate Limiting Middleware Personalizado (sin SlowAPI)
Usa un dict en memoria para tracking simple.
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class SimpleRateLimiter:
    """Rate limiter simple basado en memoria."""
    
    def __init__(self):
        # Dict[endpoint][ip] = (request_count, window_start)
        self.requests: Dict[str, Dict[str, Tuple[int, datetime]]] = defaultdict(lambda: {})
        self.limits = {
            "/api/auth/login": (10, 60),  # 10 requests por 60 segundos
            "/api/desafios/generar": (5, 3600),  # 5 por hora
            "/api/code-review/": (10, 3600),  # 10 por hora
        }
    
    def check_rate_limit(self, endpoint: str, client_ip: str) -> bool:
        """
        Verifica si el cliente ha excedido el límite.
        
        Returns:
            True si está dentro del límite, False si excedió
        """
        if endpoint not in self.limits:
            return True  # Sin límite definido
        
        max_requests, window_seconds = self.limits[endpoint]
        now = datetime.now()
        
        # Obtener datos del cliente
        if client_ip not in self.requests[endpoint]:
            self.requests[endpoint][client_ip] = (1, now)
            return True
        
        count, window_start = self.requests[endpoint][client_ip]
        
        # Verificar si la ventana expiró
        if now - window_start > timedelta(seconds=window_seconds):
            # Nueva ventana
            self.requests[endpoint][client_ip] = (1, now)
            return True
        
        # Dentro de la ventana
        if count >= max_requests:
            return False  # Excedido
        
        # Incrementar contador
        self.requests[endpoint][client_ip] = (count + 1, window_start)
        return True
    
    def cleanup_old_entries(self):
        """Limpia entradas viejas para evitar memory leaks."""
        now = datetime.now()
        for endpoint, clients in list(self.requests.items()):
            for client_ip, (_, window_start) in list(clients.items()):
                if now - window_start > timedelta(hours=1):
                    del clients[client_ip]


# Instancia global
rate_limiter = SimpleRateLimiter()


class CustomRateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware para aplicar rate limiting."""
    
    async def dispatch(self, request: Request, call_next):
        # Obtener IP del cliente
        client_ip = request.client.host if request.client else "unknown"
        endpoint = request.url.path
        
        # Verificar rate limit
        if not rate_limiter.check_rate_limit(endpoint, client_ip):
            logger.warning(f"Rate limit exceeded for {client_ip} on {endpoint}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Too Many Requests",
                    "message": "Has excedido el límite de solicitudes. Intenta nuevamente más tarde."
                }
            )
        
        response = await call_next(request)
        return response
