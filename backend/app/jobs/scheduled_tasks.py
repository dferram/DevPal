from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from google import genai
from app.database import SessionLocal
from app.services.ia_service import IAService
from app.config import get_settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()
scheduler = AsyncIOScheduler()


def get_ia_service_instance() -> IAService:
    db = SessionLocal()
    return IAService(db)


async def job_generar_noticias():
    logger.info("Iniciando generación automática de noticias...")
    try:
        ia_service = get_ia_service_instance()
        nuevas, duplicadas = ia_service.generar_y_guardar_noticias(
            usuario_id=None,
            limite=50
        )
        logger.info(f"Noticias generadas: {nuevas} nuevas, {duplicadas} duplicadas")
        ia_service.db.close()
    except Exception as e:
        logger.error(f"Error al generar noticias: {str(e)}")
    

async def job_generar_eventos():
    logger.info("Iniciando generación automática de eventos...")
    try:
        ia_service = get_ia_service_instance()
        nuevos, duplicados = ia_service.generar_y_guardar_eventos(limite=15)
        logger.info(f"Eventos generados: {nuevos} nuevos, {duplicados} duplicados")
        ia_service.db.close()
    except Exception as e:
        logger.error(f"Error al generar eventos: {str(e)}")


async def job_generar_desafios_diarios():
    """
    Genera UN único desafío global del día para todos los usuarios.
    Se ejecuta a medianoche.
    """
    logger.info("Iniciando generación de desafío diario global...")
    try:
        db = SessionLocal()
        ia_service = IAService(db)
        
        # Generar un único desafío global
        desafio = await ia_service.generar_desafio_global()
        
        if desafio:
            logger.info(f"Desafío global del día generado: {desafio['titulo']}")
        else:
            logger.warning("No se pudo generar el desafío global del día")
        
        db.close()
    except Exception as e:
        logger.error(f"Error al generar desafío diario global: {str(e)}")


def start_scheduler():
    if not settings.ENABLE_SCHEDULED_JOBS:
        logger.info("Jobs programados deshabilitados (ENABLE_SCHEDULED_JOBS=False)")
        return
    
    scheduler.add_job(
        job_generar_noticias,
        trigger=IntervalTrigger(hours=6),
        id='generar_noticias',
        name='Generar noticias cada 6 horas',
        replace_existing=True
    )
    
    scheduler.add_job(
        job_generar_eventos,
        trigger=IntervalTrigger(hours=6),
        id='generar_eventos',
        name='Generar eventos cada 6 horas',
        replace_existing=True
    )
    
    scheduler.add_job(
        job_generar_desafios_diarios,
        trigger=CronTrigger(hour=0, minute=0),
        id='generar_desafios_diarios',
        name='Generar desafíos diarios a medianoche',
        replace_existing=True
    )
    
    from datetime import datetime, timedelta
    run_date = datetime.now() + timedelta(seconds=5)
    
    scheduler.add_job(
        job_generar_noticias,
        trigger='date',
        run_date=run_date,
        id='generar_noticias_inicio',
        name='Generar noticias al inicio'
    )
    
    scheduler.add_job(
        job_generar_eventos,
        trigger='date',
        run_date=run_date,
        id='generar_eventos_inicio',
        name='Generar eventos al inicio'
    )
    
    scheduler.start()
    logger.info("Scheduler iniciado")
    logger.info("Noticias: cada 6 horas y al inicio")
    logger.info("Eventos: cada 6 horas y al inicio")
    logger.info("Desafíos diarios: todos los días a las 00:00")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler detenido")
