import time
import json
from google import genai


def generar_pista(codigo, lenguaje, client, informacion_usuario):
    nombre = informacion_usuario.get("nombre", "Usuario")
    
    prompt = f"""
    Actúa como una API de Mentoría de Código (Backend).

    INPUTS:
    - Lenguaje: {lenguaje}
    - Código del usuario (Snippet/Intento): {codigo}
    - Perfil del Candidato: Nombre: {nombre}

    TASK:
    Analiza el código proporcionado e identifica el bloqueo lógico o la optimización necesaria. Genera una pista conceptual sin revelar la solución directa.

    OUTPUT FORMAT:
    Devuelve SOLAMENTE un objeto JSON válido. NO uses markdown (```json).

    SCHEMA:
    {{
    "analisis_interno": "string (Breve diagnóstico del error o ineficiencia detectada - NO MOSTRAR AL USUARIO)",
    "titulo_pista": "string (Ej: 'Uso de Memoria', 'Complejidad', 'Estructura de Datos')",
    "contenido_pista": "string (La guía conceptual. Ej: 'Intenta usar un Hash Map para reducir la búsqueda de O(n) a O(1).')",
    "recurso_recomendado": "string (Nombre de concepto/patrón para que el usuario investigue, ej: 'Two Pointers Technique')"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'temperature': 0.6}
        )
        
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
        
        pista = json.loads(response_text)
        
        campos_requeridos = {"analisis_interno", "titulo_pista", "contenido_pista", "recurso_recomendado"}
        campos_faltantes = campos_requeridos - set(pista.keys())
        if campos_faltantes:
            print(f"Pista tiene campos faltantes: {campos_faltantes}")
        
        print(f"Pista generada: {pista.get('titulo_pista', 'Sin título')}")
        return pista, time.time()
        
    except json.JSONDecodeError as e:
        print(f"Error al parsear JSON: {e}")
        print(f"Respuesta recibida: {response_text[:200]}...")
        return None, time.time()
    
    except Exception as e:
        print(f"Error al generar pista: {e}")
        return None, time.time()
