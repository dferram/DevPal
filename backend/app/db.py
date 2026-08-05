import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from app.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# Configuración del pool de conexiones
try:
    postgreSQL_pool = psycopg2.pool.SimpleConnectionPool(
        1, 10,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        # Importante: sslmode=require si usas Azure, si es local puede ser 'disable' o 'prefer'
        sslmode="require" if "azure" in settings.DB_HOST else "prefer"
    )
    if postgreSQL_pool:
        logger.info("Connection pool created successfully")
except Exception as e:
    logger.error(f"Error creating connection pool: {e}")
    postgreSQL_pool = None

@contextmanager
def get_db_connection():
    """Generador para obtener una conexión del pool."""
    if not postgreSQL_pool:
        raise Exception("Database connection pool not initialized")
    
    conn = postgreSQL_pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        postgreSQL_pool.putconn(conn)

def execute_query(query, params=None, fetch=False):
    """Utilidad para ejecutar una query simple."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetch:
                return cur.fetchall()
            return None

def execute_one(query, params=None):
    """Utilidad para obtener un solo resultado."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()
