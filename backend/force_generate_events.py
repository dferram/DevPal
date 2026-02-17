import asyncio
from app.services.eventos_generator import buscar_eventos_generales
from app.database import SessionLocal
from app.models.db_models import Evento
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

async def generate():
    print("Starting generation...")
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    eventos, duration = buscar_eventos_generales(client, limite=5)
    
    if eventos:
        db = SessionLocal()
        try:
            for e in eventos:
                print(f"Saving: {e['titulo']} (Lat: {e.get('latitud')}, Lon: {e.get('longitud')})")
                new_event = Evento(
                    titulo=e['titulo'],
                    descripcion=e['descripcion'],
                    fecha=e['fecha'],
                    hora=e['hora'],
                    ubicacion=e['ubicacion'],
                    categoria=e['categoria'],
                    imagen_url=e['imagen_url'],
                    cupos_disponibles=e['cupos_disponibles'],
                    es_popular=e['es_popular'],
                    organizador=e['organizador'],
                    url_externa=e.get('url_externa', ''),
                    latitud=e.get('latitud', 0.0),
                    longitud=e.get('longitud', 0.0)
                )
                db.add(new_event)
            db.commit()
            print("Events saved successfully!")
        except Exception as e:
            print(f"Error saving events: {e}")
            db.rollback()
        finally:
            db.close()
    else:
        print("No events generated.")

if __name__ == "__main__":
    asyncio.run(generate())
