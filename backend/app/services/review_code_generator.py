import time
import json
from google import genai


def review_code(codigo, lenguaje, client, informacion_usuario):
    nombre = informacion_usuario.get("nombre", "Usuario")
    
    prompt = f"""
    Actúa como una API de Revisión de Código Estático y Calidad de Software.

    INPUTS:
    - Lenguaje: {lenguaje}
    - Snippet a revisar: {codigo}
    - Perfil del Candidato: Nombre: {nombre}
    
    TASK:
    Realiza un análisis de calidad de código (Code Review) estilo FAANG. Sé crítico pero constructivo.

    OUTPUT FORMAT:
    Devuelve SOLAMENTE un objeto JSON válido. NO uses markdown (```json).

    SCHEMA:
    {{
    "resumen_ejecutivo": "string (1 frase sobre la calidad general del código)",
    "puntos_fuertes": ["string", "string"],
    "oportunidades_mejora": [
        {{
        "categoria": "string (Ej: Rendimiento, Legibilidad, Seguridad)",
        "descripcion": "string (Qué está mal)",
        "severidad": "string (Alta/Media/Baja)"
        }}
    ],
    "optimizacion_sugerida": {{
        "explicacion": "string (Qué cambiar)",
        "codigo_mejorado": "string (Snippet corto con la mejora aplicada, si aplica)"
    }},
    "pista_conceptual": "string (Concepto teórico que el usuario debería estudiar)"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'temperature': 0.5}
        )
        
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
        
        review = json.loads(response_text)
        
        if not isinstance(review.get("puntos_fuertes"), list):
            review["puntos_fuertes"] = []
        if not isinstance(review.get("oportunidades_mejora"), list):
            review["oportunidades_mejora"] = []
        
        print(f"Code review completado para {lenguaje}")
        return review, time.time()
        
    except json.JSONDecodeError as e:
        print(f"Error al parsear JSON: {e}")
        print(f"Respuesta recibida: {response_text[:200]}...")
        return None, time.time()
    
    except Exception as e:
        print(f"Error en code review: {e}")
        return None, time.time()

