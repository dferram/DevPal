import time
import json
import random
from google import genai
from google.genai import types
from datetime import datetime, timedelta

DEFAULT_IMAGES = {
    "Hackathon": [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
        "https://images.unsplash.com/photo-1517245386647-45ac0c1e8f32?w=800&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    ],
    "Conferencia": [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        "https://images.unsplash.com/photo-1559223606-3158cf9890ca?w=800&q=80",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
        "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80",
    ],
    "Taller": [
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
        "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80",
        "https://images.unsplash.com/photo-1558008258-3256797b1e1e?w=800&q=80",
        "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80",
        "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80",
    ],
    "Meetup": [
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
        "https://images.unsplash.com/photo-1529119368496-2dfdaefde6a3?w=800&q=80",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
        "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80",
    ],
    "Concurso": [
        "https://images.unsplash.com/photo-1546519638-68e109498ee2?w=800&q=80",
        "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&q=80",
        "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80",
    ],
    "Default": [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
    ]
}

def buscar_eventos_generales(client, limite=15):
    fecha_inicio = datetime.now().strftime("%Y-%m-%d")
    fecha_fin = (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d")
    
    prompt = f"""
    ERES UN ASISTENTE DE BÚSQUEDA DE EVENTOS TECNOLÓGICOS DE ALTA PRECISIÓN.
    TU OBJETIVO ES ENCONTRAR {limite} EVENTOS REALES, CONFIRMADOS Y FUTUROS entre {fecha_inicio} y {fecha_fin}.

    REGLAS DE ORO (CRÍTICAS):
    1.  **SITIO OFICIAL OBLIGATORIO**: Cada evento DEBE tener una `url_externa` válida que lleve al sitio oficial, Meetup, Eventbrite o página de registro. NO INVENTAR URLS.
    2.  **HORA EXACTA**: Busca la hora de inicio real. Si es un evento de todo el día, usa "09:00". NO USAR "TBD".
    3.  **UBICACIÓN REAL**: Necesitamos coordenadas (`latitud`, `longitud`) para el mapa. Si es online, usa coordenadas 0.0, 0.0. Si es presencial, busca las coordenadas del venue o la ciudad.

    Tipos de Eventos: Hackathons, Conferencias, Talleres, Meetups, Concursos.
    Temas: Dev, IA, Cloud, Cybersec, Data, Blockchain.

    FORMATO DE SALIDA (JSON PURO, SIN MARKDOWN):
    [
      {{
        "titulo": "Nombre Completo del Evento",
        "descripcion": "Resumen atractivo (max 3 frases)",
        "fecha": "YYYY-MM-DD",
        "hora": "HH:MM",
        "ubicacion": "Nombre del lugar (o 'Online')"(obligatorio),
        "categoria": "Hackathon|Conferencia|Taller|Concurso|Meetup",
        "imagen_url": "URL de imagen real o placeholder temático",
        "url_externa": "https://sitio-real-del-evento.com"(obligatorio),
        "latitud": 19.4326, 
        "longitud": -99.1332,
        "cupos_disponibles": 100,
        "es_popular": true,
        "organizador": "Empresa/Comunidad Organizadora"
      }}
    ]
    """
    
    try:
        tools = [types.Tool(google_search=types.GoogleSearch())]
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=tools,
                temperature=0.7
            )
        )
        
        response_text = response.text.strip()
        
        import re
        
        # Intentar limpiar bloques de código
        clean_text = response.text.strip()
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
             clean_text = clean_text.split("```")[0].strip()

        # Buscar el primer array JSON válido con regex
        match = re.search(r'\[.*\]', clean_text, re.DOTALL)
        if match:
            clean_text = match.group(0)
        
        try:
            eventos = json.loads(clean_text)
        except json.JSONDecodeError:
             # Fallback: intentar limpiar comillas o caracteres raros si es necesario
            print(f"JSON Raw fallido: {clean_text[:100]}...")
            raise

        if not isinstance(eventos, list):
            raise ValueError("La respuesta no es un array JSON válido")
        
        # Validar y limpiar datos
        eventos_validos = []
        categorias_validas = {"Hackathon", "Conferencia", "Taller", "Concurso", "Meetup"}
        
        for evento in eventos:
            # Asegurar campos mínimos
            if not all(k in evento for k in ["titulo", "fecha", "categoria"]):
                continue
                
            # Normalizar categoría
            cat = evento.get("categoria", "Meetup")
            if cat not in categorias_validas:
                # Intento de mapping simple
                if "hack" in cat.lower(): cat = "Hackathon"
                elif "confer" in cat.lower(): cat = "Conferencia"
                elif "work" in cat.lower() or "taller" in cat.lower(): cat = "Taller"
                else: cat = "Meetup"
            evento["categoria"] = cat
            
            # Asegurar imagen válida o asignar fallback
            img_url = evento.get("imagen_url", "")
            if not img_url or not img_url.startswith("http") or len(img_url) < 10:
                # Seleccionar imagen random de la categoría
                fallback_list = DEFAULT_IMAGES.get(cat, DEFAULT_IMAGES["Default"])
                evento["imagen_url"] = random.choice(fallback_list)
            
            # Asegurar otros campos
            if "url_externa" not in evento:
                evento["url_externa"] = "https://google.com/search?q=" + evento["titulo"].replace(" ", "+")
            
            if "hora" not in evento or not evento["hora"]:
                 evento["hora"] = "09:00"
                 
            if "cupos_disponibles" not in evento:
                evento["cupos_disponibles"] = 100
                
            if "es_popular" not in evento:
                evento["es_popular"] = False

            eventos_validos.append(evento)
        
        print(f"Se generaron {len(eventos_validos)} eventos válidos")
        return eventos_validos, time.time()
        
    except json.JSONDecodeError as e:
        print(f"Error al parsear JSON: {e}")
        return [], time.time()
    
    except Exception as e:
        print(f"Error al buscar eventos: {e}")
        return [], time.time()
