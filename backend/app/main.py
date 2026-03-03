from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import get_settings
from app.middleware.simple_rate_limiter import CustomRateLimitMiddleware
from app.utils.exception_handlers import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)
import logging
import os

settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DevPal API",
    description="API para DevPal - Plataforma de desarrollo profesional",
    version="1.0.0"
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

if not os.path.exists("static/uploads"):
    os.makedirs("static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(CustomRateLimitMiddleware)

origins = settings.cors_origins_list
if settings.CORS_ORIGINS == "*":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def validate_security_config():

    if settings.CORS_ORIGINS == "*" or (origins and origins[0] == "*"):
        logger.warning("⚠️ CORS configurado como '*' - Permitido para compatibilidad con Expo")
    
    logger.info("✅ CORS activo para: %s", origins)
    logger.info("🌍 Ambiente: %s", getattr(settings, 'ENVIRONMENT', 'development'))

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "DevPal API is running with Raw PostgreSQL",
        "version": "1.0.0",
        "port": settings.PORT,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from app.routers import auth, noticias, eventos, desafios, code_review, gamification

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(noticias.router, prefix="/api/noticias", tags=["Noticias"])
app.include_router(eventos.router, prefix="/api/eventos", tags=["Eventos"])
app.include_router(desafios.router, prefix="/api/desafios", tags=["Desafíos"])
app.include_router(code_review.router, prefix="/api/code-review", tags=["Code Review"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamificación"])

@app.on_event("startup")
async def startup_event():
    try:
        if getattr(settings, 'ENABLE_SCHEDULED_JOBS', False):
            from app.jobs.scheduled_tasks import start_scheduler
            start_scheduler()
    except ImportError:
        logger.warning("No se pudo iniciar el scheduler (posiblemente falta librería apscheduler)")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        from app.jobs.scheduled_tasks import stop_scheduler
        stop_scheduler()
    except ImportError:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)