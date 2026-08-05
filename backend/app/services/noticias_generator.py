import time
import json
from google import genai
from google.genai import types


def buscar_noticias_generales(client, limite=50):
    prompt = f"""
    Busca las {limite} noticias más relevantes y recientes sobre TECNOLOGÍA de las últimas 24-48 horas.
    
    REQUISITOS DE BÚSQUEDA:
    - Usa Google Search para encontrar noticias reales y actuales
    - Temas: IA, programación, frameworks, desarrollo web/móvil, hardware, software, startups tech, ciberseguridad
    - Solo noticias publicadas en las últimas 48 horas
    - Fuentes confiables (TechCrunch, The Verge, Wired, blogs técnicos reconocidos, etc.)
    
    OUTPUT FORMAT:
    Devuelve ÚNICAMENTE un array JSON válido. NO uses bloques de código markdown (```json).
    NO agregues explicaciones antes o después del JSON.
    
    ESTRUCTURA EXACTA:
    [
      {{
        "titulo_resumen": "Título claro y conciso de la noticia",
        "url": "URL completa de la noticia",
        "fecha_publicacion": "YYYY-MM-DD",
        "imagen_url": "URL de imagen (si está disponible, sino usar cadena vacía)",
        "fuente": "Nombre de la fuente (ej: TechCrunch, The Verge)",
        "relevancia": "Alta"
      }}
    ]
    
    IMPORTANTE:
    - fecha_publicacion debe ser formato YYYY-MM-DD
    - relevancia debe ser exactamente: "Alta", "Media", o "Baja"
    - Todos los campos son obligatorios (usar "" si no hay datos disponibles)
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
        
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
        
        noticias = json.loads(response_text)
        
        if not isinstance(noticias, list):
            raise ValueError("La respuesta no es un array JSON válido")
        
        campos_requeridos = {"titulo_resumen", "url", "fecha_publicacion", "imagen_url", "fuente", "relevancia"}
        for i, noticia in enumerate(noticias):
            campos_faltantes = campos_requeridos - set(noticia.keys())
            if campos_faltantes:
                print(f"Noticia {i+1} tiene campos faltantes: {campos_faltantes}")
            
            if noticia.get("relevancia") not in ["Alta", "Media", "Baja"]:
                noticia["relevancia"] = "Media"
        
        return noticias, time.time()
        
    except json.JSONDecodeError as e:
        print(f"Error al parsear JSON: {e}")
        print(f"Respuesta recibida: {response_text[:200]}...")
        return None, time.time()
    
    except Exception as e:
        print(f"Error al buscar noticias: {e}")
        return None, time.time()
