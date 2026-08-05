from app.database import SessionLocal
from app.models.db_models import Badge


def crear_badges_iniciales():
    db = SessionLocal()
    
    badges_data = [
        {
            "nombre": "Racha de Fuego",
            "descripcion": "Completa desafios durante 7 dias consecutivos",
            "icono": "flame",
            "color": "#FF4500",
            "rareza": "Raro",
            "criterio_json": {"tipo": "racha", "dias": 7},
            "xp_bonus": 200
        },
        {
            "nombre": "Rayo Imparable",
            "descripcion": "Manten una racha de 30 dias",
            "icono": "flash",
            "color": "#FFD700",
            "rareza": "Epico",
            "criterio_json": {"tipo": "racha", "dias": 30},
            "xp_bonus": 1000
        },
        {
            "nombre": "Primer Desafio",
            "descripcion": "Completa tu primer desafio diario",
            "icono": "code-slash",
            "color": "#10B981",
            "rareza": "Comun",
            "criterio_json": {"tipo": "desafios_completados", "cantidad": 1},
            "xp_bonus": 50
        },
        {
            "nombre": "Maestro de Desafios",
            "descripcion": "Completa 50 desafios diarios",
            "icono": "trophy",
            "color": "#3B82F6",
            "rareza": "Raro",
            "criterio_json": {"tipo": "desafios_completados", "cantidad": 50},
            "xp_bonus": 500
        },
        {
            "nombre": "Einstein del Codigo",
            "descripcion": "Resuelve 10 problemas dificiles",
            "icono": "bulb",
            "color": "#8B5CF6",
            "rareza": "Epico",
            "criterio_json": {"tipo": "desafios_dificiles", "cantidad": 10},
            "xp_bonus": 800
        },
        {
            "nombre": "Leyenda",
            "descripcion": "Completa 100 desafios diarios",
            "icono": "star",
            "color": "#FFD700",
            "rareza": "Legendario",
            "criterio_json": {"tipo": "desafios_completados", "cantidad": 100},
            "xp_bonus": 2000
        },
        {
            "nombre": "Asistente Activo",
            "descripcion": "Asiste a tu primer evento",
            "icono": "calendar",
            "color": "#06B6D4",
            "rareza": "Comun",
            "criterio_json": {"tipo": "eventos_asistidos", "cantidad": 1},
            "xp_bonus": 100
        },
        {
            "nombre": "Social Developer",
            "descripcion": "Asiste a 10 eventos tech",
            "icono": "people",
            "color": "#F59E0B",
            "rareza": "Raro",
            "criterio_json": {"tipo": "eventos_asistidos", "cantidad": 10},
            "xp_bonus": 600
        },
        {
            "nombre": "Nivel 5",
            "descripcion": "Alcanza el nivel 5",
            "icono": "arrow-up",
            "color": "#10B981",
            "rareza": "Comun",
            "criterio_json": {"tipo": "nivel", "nivel_minimo": 5},
            "xp_bonus": 150
        },
        {
            "nombre": "Nivel 10",
            "descripcion": "Alcanza el nivel 10",
            "icono": "rocket",
            "color": "#3B82F6",
            "rareza": "Raro",
            "criterio_json": {"tipo": "nivel", "nivel_minimo": 10},
            "xp_bonus": 400
        },
        {
            "nombre": "Nivel 25",
            "descripcion": "Alcanza el nivel 25",
            "icono": "diamond",
            "color": "#8B5CF6",
            "rareza": "Epico",
            "criterio_json": {"tipo": "nivel", "nivel_minimo": 25},
            "xp_bonus": 1500
        },
        {
            "nombre": "Maestro Supremo",
            "descripcion": "Alcanza el nivel 50",
            "icono": "infinite",
            "color": "#FFD700",
            "rareza": "Legendario",
            "criterio_json": {"tipo": "nivel", "nivel_minimo": 50},
            "xp_bonus": 5000
        }
    ]
    
    try:
        for badge_data in badges_data:
            existing = db.query(Badge).filter(Badge.nombre == badge_data["nombre"]).first()
            if existing:
                print(f"Badge '{badge_data['nombre']}' ya existe, saltando...")
                continue
            
            badge = Badge(**badge_data)
            db.add(badge)
            print(f"Creado badge: {badge_data['nombre']}")
        
        db.commit()
        print(f"\n{len(badges_data)} badges creados exitosamente!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creando badges: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    print("Creando badges iniciales para GameFicacion DevPal...\n")
    crear_badges_iniciales()
