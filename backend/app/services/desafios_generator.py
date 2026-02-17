import time
import json
from google import genai


def generar_desafio_diario(client, user_info, historia_desafios):
    nivel = user_info.get("nivel", 1)
    intereses = user_info.get("intereses", ["Programación general"])
    lenguajes = user_info.get("lenguajes", ["Python", "JavaScript"])
    
    if not isinstance(intereses, list):
        intereses = [str(intereses)]
    if not isinstance(lenguajes, list):
        lenguajes = [str(lenguajes)]
    if not isinstance(historia_desafios, list):
        historia_desafios = []
    
    lista_historial = ", ".join(historia_desafios) if historia_desafios else "Ninguno"
    lenguajes_disponibles = ", ".join(lenguajes)
    intereses_str = ", ".join(intereses)

    prompt = f"""
    Actúa como una API de Generación de Desafíos de Código (Backend).

    INPUT_PARAMS:
    - Perfil del Candidato: Nivel {nivel}, Intereses: {intereses_str}
    - Lenguajes Preferidos: {lenguajes_disponibles}
    
    HISTORY CONSTRAINT (CRITICAL):
    El usuario YA ha resuelto los siguientes desafíos. ESTÁ PROHIBIDO generar ejercicios similares o repetidos a estos títulos:
    [{lista_historial}]

    TASK:
    Genera un micro-desafío de programación técnica NUEVO y original, estilo LeetCode.
    DEBES generar templates de código (función/clase base) para 4 lenguajes: Python, JavaScript, Java, y C++.

    OUTPUT FORMAT:
    Devuelve SOLAMENTE un objeto JSON válido (RFC 8259). NO uses bloques markdown (```json).

    SCHEMA:
    {{
      "lenguaje_recomendado": "string (El lenguaje más apropiado para este problema de: python, javascript, java, cpp)",
      "titulo": "string (Título corto y descriptivo)",
      "dificultad": "string (Fácil, Medio, o Difícil)",
      "xp_recompensa": "number (25 para Fácil, 50 para Medio, 100 para Difícil)",
      "contexto_negocio": "string (Escenario real en máximo 2 oraciones)",
      "definicion_problema": "string (Descripción técnica detallada del problema, qué debe hacer la función, formato de entrada/salida)",
      "templates_por_lenguaje": {{
          "python": "string (Template con def/class, tipo hints, y comentario '# Tu código aquí')",
          "javascript": "string (Template con function, y comentario '// Tu código aquí')",
          "java": "string (Template con class Solution y método público, comentario '// Tu código aquí')",
          "cpp": "string (Template con class Solution y método público, comentario '// Tu código aquí')"
      }},
      "restricciones": {{
          "tiempo": "string (ej: O(n))",
          "memoria": "string (ej: O(1))"
      }},
      "casos_prueba": [
        {{ "input": "string", "output": "string", "tipo": "Normal", "explicacion": "string (breve)" }},
        {{ "input": "string", "output": "string", "tipo": "Normal", "explicacion": "string (breve)" }},
        {{ "input": "string", "output": "string", "tipo": "Edge Case", "explicacion": "string (breve)" }}
      ],
      "pista": "string (Pista conceptual sin dar la solución directamente)"
    }}
    
    IMPORTANTE: Los templates deben ser estructuras realistas tipo LeetCode, con firma de función/clase predefinida.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'temperature': 0.8}
        )
        
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
        
        desafio = json.loads(response_text)
        
        campos_requeridos = {
            "lenguaje_recomendado", "titulo", "dificultad", "xp_recompensa",
            "contexto_negocio", "definicion_problema", "templates_por_lenguaje",
            "restricciones", "casos_prueba", "pista"
        }
        campos_faltantes = campos_requeridos - set(desafio.keys())
        if campos_faltantes:
            print(f"Desafío tiene campos faltantes: {campos_faltantes}")
        
        if not isinstance(desafio.get("casos_prueba"), list):
            desafio["casos_prueba"] = []
        
        print(f"Desafío generado: {desafio.get('titulo', 'Sin título')}")
        return desafio, time.time()
        
    except json.JSONDecodeError as e:
        print(f"Error al parsear JSON: {e}")
        print(f"Respuesta recibida: {response_text[:200]}...")
        return None, time.time()
    
    except Exception as e:
        print(f"Error al generar desafío: {e}")
        return None, time.time()
