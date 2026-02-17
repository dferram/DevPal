import os
from dotenv import load_dotenv


load_dotenv()

def api_key():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY no encontrada en variables de entorno. Verifica tu archivo .env")
    return key

def nombre_host_db_azure():
    nombre = os.getenv("NOMBRE_HOST_DB_AZURE")
    if not nombre:
        raise ValueError("NOMBRE_HOST_DB_AZURE no encontrada en variables de entorno. Verifica tu archivo .env")
    return nombre

def nombre_db_azure():
    nombre = os.getenv("NOMBRE_DB_AZURE")
    if not nombre:
        raise ValueError("NOMBRE_DB_AZURE no encontrada en variables de entorno. Verifica tu archivo .env")
    return nombre

def nombre_usuario_db_azure():
    nombre = os.getenv("NOMBRE_USUARIO_DB_AZURE")
    if not nombre:
        raise ValueError("NOMBRE_USUARIO_DB_AZURE no encontrada en variables de entorno. Verifica tu archivo .env")
    return nombre

def contrasena_db_azure():
    contraseña = os.getenv("CONTRASENA_DB_AZURE")
    if not contraseña:
        raise ValueError("CONTRASENA_DB_AZURE no encontrada en variables de entorno. Verifica tu archivo .env")
    return contraseña



