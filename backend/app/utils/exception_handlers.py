"""
Global exception handlers for the FastAPI application.
Provides consistent error responses and logging.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback

logger = logging.getLogger(__name__)


async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    """
    Handle Pydantic validation errors with user-friendly messages.
    """
    logger.warning("Validation error: %s", exc.errors())
    
    # Extract first error for user-friendly message
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        field = first_error.get('loc', ['unknown'])[-1]
        msg = first_error.get('msg', 'Validation error')
        detail = f"Error en el campo '{field}': {msg}"
    else:
        detail = "Datos de entrada inválidos"
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail, "errors": errors}
    )


async def http_exception_handler(_request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions with consistent format.
    """
    logger.info("HTTP %s: %s", exc.status_code, exc.detail)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


async def general_exception_handler(_request: Request, exc: Exception):
    """
    Catch-all handler for unexpected exceptions.
    Logs full traceback and returns generic error to client.
    """
    logger.error("Unhandled exception: %s", str(exc))
    logger.error(traceback.format_exc())
    
    # In production, don't expose internal errors
    # In development, include more details
    import os
    if os.getenv("ENVIRONMENT", "development") == "production":
        detail = "Error interno del servidor"
    else:
        detail = f"Error interno: {str(exc)}"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail}
    )
