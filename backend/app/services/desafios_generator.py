import time
import random
from typing import Optional, Tuple
from app.services.desafios_predefinidos import DESAFIOS_PREDEFINIDOS

def generar_desafio_diario(client=None, user_info=None, historia_desafios=None) -> Tuple[Optional[dict], float]:
    """Genera un desafío usando la lista predefinida (sin IA)."""
    start_time = time.time()
    
    if not isinstance(historia_desafios, list):
        historia_desafios = []
        
    # Filtrar desafíos que no se hayan completado
    desafios_disponibles = [
        d for d in DESAFIOS_PREDEFINIDOS 
        if d["titulo"] not in historia_desafios
    ]
    
    # Si ya completó todos, reiniciar el ciclo
    if not desafios_disponibles:
        desafios_disponibles = DESAFIOS_PREDEFINIDOS
        
    # Seleccionar uno al azar
    desafio_seleccionado = random.choice(desafios_disponibles)
    print(f"Desafío offline seleccionado: {desafio_seleccionado['titulo']}")
    
    return desafio_seleccionado, start_time
