from app.database import SessionLocal
from app.models.db_models import Evento
from datetime import datetime, timedelta
import random

def populate_mock():
    db = SessionLocal()
    try:
        # Clear existing
        db.query(Evento).delete()
        
        events = [
            {
                "titulo": "Hackathon Querétaro 2026",
                "descripcion": "El evento de desarrollo más grande del bajío. 48 horas de código, innovación y networking.",
                "fecha": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
                "hora": "09:00",
                "ubicacion": "Centro de Congresos, Qro",
                "categoria": "Hackathon",
                "imagen_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
                "url_externa": "https://hackathon-qro.com",
                "latitud": 20.5888,
                "longitud": -100.3899,
                "cupos_disponibles": 200,
                "es_popular": True,
                "organizador": "TechHub Qro"
            },
            {
                "titulo": "React Native Summit",
                "descripcion": "Conferencia internacional sobre el futuro del desarrollo móvil con React Native y Expo.",
                "fecha": (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d"),
                "hora": "10:30",
                "ubicacion": "Auditorio Josefa Ortiz, Qro",
                "categoria": "Conferencia",
                "imagen_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                "url_externa": "https://reactnative.dev/summit",
                "latitud": 20.5925,
                "longitud": -100.3900,
                "cupos_disponibles": 500,
                "es_popular": True,
                "organizador": "Facebook Open Source"
            },
            {
                "titulo": "Taller de IA Generativa",
                "descripcion": "Aprende a integrar modelos como Gemini y GPT-4 en tus aplicaciones en este taller práctico.",
                "fecha": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "hora": "16:00",
                "ubicacion": "Coworking Central, Juriquilla",
                "categoria": "Taller",
                "imagen_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800",
                "url_externa": "https://ia-taller.io",
                "latitud": 20.7027,
                "longitud": -100.4468,
                "cupos_disponibles": 30,
                "es_popular": False,
                "organizador": "AI Lab"
            },
             {
                "titulo": "DevOps Meetup Monthly",
                "descripcion": "Reunión mensual para compartir experiencias sobre CI/CD, Kubernetes y Cloud Computing.",
                "fecha": (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d"),
                "hora": "19:00",
                "ubicacion": "Cervecería Hércules, Qro",
                "categoria": "Meetup",
                "imagen_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
                "url_externa": "https://meetup.com/devops-qro",
                "latitud": 20.6001,
                "longitud": -100.3600,
                "cupos_disponibles": 80,
                "es_popular": False,
                "organizador": "DevOps Community"
            },
            {
                "titulo": "Concurso de Algoritmos",
                "descripcion": "Demuestra tus habilidades resolviendo problemas complejos. Premios en efectivo.",
                "fecha": (datetime.now() + timedelta(days=20)).strftime("%Y-%m-%d"),
                "hora": "08:00",
                "ubicacion": "Tec de Monterrey, Qro",
                "categoria": "Concurso",
                "imagen_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
                "url_externa": "https://algo-comp.org",
                "latitud": 20.6128,
                "longitud": -100.4045,
                "cupos_disponibles": 100,
                "es_popular": True,
                "organizador": "ITESM"
            }
        ]

        for e in events:
            new_event = Evento(**e)
            db.add(new_event)
        
        db.commit()
        print(f"Inserted {len(events)} mock events with coordinates and URLs.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_mock()
