"""Script para poblar la base de datos con datos de prueba realistas."""
import sys
from datetime import datetime, timedelta
from pathlib import Path
import uuid
import json
import psycopg2

# Agregar el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent))

from app.db import execute_query, execute_one

def limpiar_datos_existentes():
    """Limpia solo los datos de prueba, mantiene usuarios reales."""
    print("🧹 Limpiando datos de prueba anteriores...")
    
    # No borrar usuarios, solo datos generados
    execute_query("DELETE FROM progreso_desafio_diario")
    execute_query("DELETE FROM desafios_diarios")
    execute_query("DELETE FROM noticias")
    # Mantener eventos reales, solo limpiar si no hay ninguno
    
    print("✅ Datos de prueba limpiados")


def crear_desafios_diarios():
    """Crea desafíos para los últimos 7 días y próximos 3."""
    print("📝 Creando desafíos diarios...")
    
    desafios = [
        {
            "dias_offset": -7,
            "titulo": "Validador de Paréntesis Balanceados",
            "lenguaje": "python",
            "contexto": "Sistema de validación de expresiones matemáticas",
            "problema": """Implementa una función que determine si una cadena de paréntesis está balanceada.
            
Los tipos de paréntesis son: (), [], {}
            
Ejemplos:
- "()[]" → True
- "([)]" → False
- "{[()]}" → True
- "(((" → False""",
            "dificultad": "Fácil",
            "xp": 50,
            "template_python": 'def validar_parentesis(s: str) -> bool:\n    """Valida si los paréntesis están balanceados."""\n    # Tu código aquí\n    pass',
            "template_js": 'function validarParentesis(s) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB",
                "longitud_maxima": 10000
            },
            "casos_prueba": [
                {"input": "()", "expected": True},
                {"input": "()[]{}", "expected": True},
                {"input": "(]", "expected": False},
                {"input": "([)]", "expected": False},
                {"input": "{[]}", "expected": True}
            ],
            "pista": "Usa una pila (stack) para rastrear los paréntesis abiertos"
        },
        {
            "dias_offset": -6,
            "titulo": "Encontrar Palíndromos en Array",
            "lenguaje": "javascript",
            "contexto": "Procesamiento de texto para detección de patrones",
            "problema": """Dada una lista de palabras, retorna solo aquellas que son palíndromos.
            
Un palíndromo se lee igual de izquierda a derecha que de derecha a izquierda.
            
Ejemplo:
Input: ["radar", "hello", "level", "world", "noon"]
Output: ["radar", "level", "noon"]""",
            "dificultad": "Fácil",
            "xp": 50,
            "template_python": 'def encontrar_palindromos(palabras: list) -> list:\n    """Retorna solo las palabras que son palíndromos."""\n    # Tu código aquí\n    pass',
            "template_js": 'function encontrarPalindromos(palabras) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB"
            },
            "casos_prueba": [
                {"input": ["radar"], "expected": ["radar"]},
                {"input": ["hello", "world"], "expected": []},
                {"input": ["radar", "level", "world"], "expected": ["radar", "level"]},
                {"input": ["a", "ab", "aba"], "expected": ["a", "aba"]}
            ],
            "pista": "Compara la palabra con su reverso"
        },
        {
            "dias_offset": -5,
            "titulo": "Merge de Arrays Ordenados",
            "lenguaje": "python",
            "contexto": "Optimización de algoritmos de ordenamiento",
            "problema": """Dados dos arrays ordenados, combínalos en un solo array ordenado.
            
Ejemplo:
arr1 = [1, 3, 5, 7]
arr2 = [2, 4, 6, 8]
resultado = [1, 2, 3, 4, 5, 6, 7, 8]""",
            "dificultad": "Medio",
            "xp": 100,
            "template_python": 'def merge_arrays(arr1: list, arr2: list) -> list:\n    """Combina dos arrays ordenados."""\n    # Tu código aquí\n    pass',
            "template_js": 'function mergeArrays(arr1, arr2) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 2000,
                "memoria_limite": "256MB",
                "complejidad": "O(n + m)"
            },
            "casos_prueba": [
                {"input": [[1, 3], [2, 4]], "expected": [1, 2, 3, 4]},
                {"input": [[1, 5, 9], [2, 6, 8]], "expected": [1, 2, 5, 6, 8, 9]},
                {"input": [[], [1, 2]], "expected": [1, 2]},
                {"input": [[1], []], "expected": [1]}
            ],
            "pista": "Usa dos punteros para recorrer ambos arrays simultáneamente"
        },
        {
            "dias_offset": -4,
            "titulo": "Contador de Palabras Únicas",
            "lenguaje": "javascript",
            "contexto": "Análisis de texto y frecuencias",
            "problema": """Cuenta cuántas palabras únicas hay en un texto (case-insensitive).
            
Ejemplo:
Input: "Hola mundo hola MUNDO"
Output: 2  # ["hola", "mundo"]""",
            "dificultad": "Fácil",
            "xp": 50,
            "template_python": 'def contar_palabras_unicas(texto: str) -> int:\n    """Cuenta palabras únicas en el texto."""\n    # Tu código aquí\n    pass',
            "template_js": 'function contarPalabrasUnicas(texto) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB"
            },
            "casos_prueba": [
                {"input": "hola mundo", "expected": 2},
                {"input": "hola hola hola", "expected": 1},
                {"input": "JavaScript python JAVASCRIPT", "expected": 2},
                {"input": "", "expected": 0}
            ],
            "pista": "Usa un Set para almacenar palabras únicas"
        },
        {
            "dias_offset": -3,
            "titulo": "Fibonacci Optimizado",
            "lenguaje": "python",
            "contexto": "Optimización con programación dinámica",
            "problema": """Calcula el n-ésimo número de Fibonacci de forma eficiente.
            
La secuencia: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...
            
Nota: NO uses recursión simple, debe ser eficiente para n >= 50""",
            "dificultad": "Medio",
            "xp": 100,
            "template_python": 'def fibonacci(n: int) -> int:\n    """Retorna el n-ésimo número de Fibonacci."""\n    # Tu código aquí\n    pass',
            "template_js": 'function fibonacci(n) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB",
                "complejidad": "O(n) tiempo, O(1) espacio"
            },
            "casos_prueba": [
                {"input": 0, "expected": 0},
                {"input": 1, "expected": 1},
                {"input": 5, "expected": 5},
                {"input": 10, "expected": 55},
                {"input": 20, "expected": 6765}
            ],
            "pista": "Usa iteración y dos variables para rastrear los últimos dos números"
        },
        {
            "dias_offset": -2,
            "titulo": "Detector de Anagramas",
            "lenguaje": "javascript",
            "contexto": "Procesamiento de strings y comparaciones",
            "problema": """Determina si dos palabras son anagramas (tienen las mismas letras en diferente orden).
            
Ejemplos:
- "listen" y "silent" → True
- "hello" y "world" → False
- "Dormitory" y "Dirty room" → True (ignorar espacios)""",
            "dificultad": "Fácil",
            "xp": 50,
            "template_python": 'def son_anagramas(palabra1: str, palabra2: str) -> bool:\n    """Verifica si dos palabras son anagramas."""\n    # Tu código aquí\n    pass',
            "template_js": 'function sonAnagramas(palabra1, palabra2) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB"
            },
            "casos_prueba": [
                {"input": ["listen", "silent"], "expected": True},
                {"input": ["hello", "world"], "expected": False},
                {"input": ["anagram", "nagaram"], "expected": True},
                {"input": ["rat", "car"], "expected": False}
            ],
            "pista": "Ordena las letras de ambas palabras y compáralas"
        },
        {
            "dias_offset": -1,
            "titulo": "Suma de Subarrays",
            "lenguaje": "python",
            "contexto": "Algoritmos de ventana deslizante",
            "problema": """Encuentra la suma máxima de un subarray contiguo de tamaño k.
            
Ejemplo:
arr = [1, 4, 2, 10, 23, 3, 1, 0, 20]
k = 4
Output: 39  # [4, 2, 10, 23]""",
            "dificultad": "Medio",
            "xp": 100,
            "template_python": 'def max_suma_subarray(arr: list, k: int) -> int:\n    """Encuentra la suma máxima de subarray de tamaño k."""\n    # Tu código aquí\n    pass',
            "template_js": 'function maxSumaSubarray(arr, k) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 2000,
                "memoria_limite": "256MB",
                "complejidad": "O(n)"
            },
            "casos_prueba": [
                {"input": [[1, 4, 2, 10, 23], 3], "expected": 35},
                {"input": [[2, 1, 5, 1, 3, 2], 2], "expected": 6},
                {"input": [[100], 1], "expected": 100}
            ],
            "pista": "Usa ventana deslizante en lugar de calcular cada suma desde cero"
        },
        {
            "dias_offset": 0,  # HOY
            "titulo": "Reverse String sin Métodos Built-in",
            "lenguaje": "javascript",
            "contexto": "Manipulación básica de strings sin helpers",
            "problema": """Invierte una cadena SIN usar métodos como reverse(), split(), o slicing.
            
Implementa tu propia lógica usando solo bucles y acceso a caracteres.
            
Ejemplo:
Input: "hello"
Output: "olleh" """,
            "dificultad": "Fácil",
            "xp": 50,
            "template_python": 'def reverse_string(s: str) -> str:\n    """Invierte una cadena sin métodos built-in."""\n    # Tu código aquí\n    pass',
            "template_js": 'function reverseString(s) {\n    // Sin usar reverse(), split(), o [...]\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB",
                "prohibido": ["reverse", "split", "..."]
            },
            "casos_prueba": [
                {"input": "hello", "expected": "olleh"},
                {"input": "world", "expected": "dlrow"},
                {"input": "a", "expected": "a"},
                {"input": "", "expected": ""}
            ],
            "pista": "Recorre el string de atrás hacia adelante y construye uno nuevo"
        },
        {
            "dias_offset": 1,  # MAÑANA
            "titulo": "Encontrar Duplicados en Array",
            "lenguaje": "python",
            "contexto": "Detección eficiente de duplicados",
            "problema": """Encuentra todos los números que aparecen más de una vez en un array.
            
Ejemplo:
Input: [4, 3, 2, 7, 8, 2, 3, 1]
Output: [2, 3]""",
            "dificultad": "Medio",
            "xp": 100,
            "template_python": 'def encontrar_duplicados(arr: list) -> list:\n    """Retorna los números duplicados."""\n    # Tu código aquí\n    pass',
            "template_js": 'function encontrarDuplicados(arr) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 2000,
                "memoria_limite": "256MB"
            },
            "casos_prueba": [
                {"input": [1, 2, 3, 1], "expected": [1]},
                {"input": [4, 3, 2, 7, 8, 2, 3, 1], "expected": [2, 3]},
                {"input": [1, 1, 1, 1], "expected": [1]},
                {"input": [1, 2, 3], "expected": []}
            ],
            "pista": "Usa un diccionario o Set para rastrear números vistos"
        },
        {
            "dias_offset": 2,
            "titulo": "Validador de Email Simple",
            "lenguaje": "javascript",
            "contexto": "Validación de inputs de usuario",
            "problema": """Valida si un string tiene formato de email válido básico.
            
Reglas:
- Debe tener un @ en el medio
- Debe tener al menos un carácter antes del @
- Debe tener al menos un . después del @
            
Ejemplo:
"user@example.com" → True
"invalid.email" → False""",
            "dificultad": "Fácil",
            "xp": 50,
            "template_python": 'def validar_email(email: str) -> bool:\n    """Valida formato básico de email."""\n    # Tu código aquí\n    pass',
            "template_js": 'function validarEmail(email) {\n    // Tu código aquí\n}',
            "restricciones": {
                "tiempo_limite": 1000,
                "memoria_limite": "128MB"
            },
            "casos_prueba": [
                {"input": "user@example.com", "expected": True},
                {"input": "invalid.email", "expected": False},
                {"input": "@example.com", "expected": False},
                {"input": "user@domain", "expected": False}
            ],
            "pista": "Verifica la presencia y posición de @ y . en el string"
        }
    ]
    
    hoy = datetime.now().date()
    count = 0
    
    for desafio in desafios:
        fecha = hoy + timedelta(days=desafio["dias_offset"])
        desafio_id = str(uuid.uuid4())
        
        templates = {
            "python": desafio["template_python"],
            "javascript": desafio["template_js"]
        }
        
        execute_query(
            """
            INSERT INTO desafios_diarios (
                id, fecha, titulo, lenguaje_recomendado, contexto_negocio,
                definicion_problema, templates_lenguajes_json, restricciones_json,
                casos_prueba_json, pista, dificultad, xp_recompensa
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                desafio_id,
                fecha,
                desafio["titulo"],
                desafio["lenguaje"],
                desafio["contexto"],
                desafio["problema"],
                json.dumps(templates),
                json.dumps(desafio["restricciones"]),
                json.dumps(desafio["casos_prueba"]),
                desafio["pista"],
                desafio["dificultad"],
                desafio["xp"]
            )
        )
        count += 1
    
    print(f"✅ {count} desafíos diarios creados (7 pasados, hoy, 2 futuros)")


def crear_noticias():
    """Crea noticias tech de prueba."""
    print("📰 Creando noticias tech...")
    
    noticias = [
        {
            "titulo_resumen": "Python 3.13 disponible con mejoras de rendimiento y nuevo JIT compiler experimental",
            "url": "https://www.python.org/downloads/release/python-3130/",
            "fuente": "Python.org",
            "relevancia": "Alta",
            "dias_offset": -3
        },
        {
            "titulo_resumen": "React 19 introduce Server Actions nativas y mejor integración con Suspense",
            "url": "https://react.dev/blog/2024/react-19",
            "fuente": "React Blog",
            "relevancia": "Alta",
            "dias_offset": -2
        },
        {
            "titulo_resumen": "GitHub Copilot expande soporte a más de 100 lenguajes de programación",
            "url": "https://github.com/features/copilot",
            "fuente": "GitHub",
            "relevancia": "Media",
            "dias_offset": -5
        },
        {
            "titulo_resumen": "TypeScript 5.5 mejora la inferencia de tipos y reduce necesidad de anotaciones manuales",
            "url": "https://devblogs.microsoft.com/typescript/",
            "fuente": "Microsoft",
            "relevancia": "Alta",
            "dias_offset": -1
        },
        {
            "titulo_resumen": "FastAPI lidera benchmarks de frameworks Python para APIs asíncronas",
            "url": "https://fastapi.tiangolo.com",
            "fuente": "TechCrunch",
            "relevancia": "Media",
            "dias_offset": -4
        },
        {
            "titulo_resumen": "Docker 25 trae mejoras de seguridad empresarial y optimización de recursos",
            "url": "https://www.docker.com/blog",
            "fuente": "Docker",
            "relevancia": "Media",
            "dias_offset": -6
        },
        {
            "titulo_resumen": "VS Code introduce AI Toolkit nativo con generación de código y refactoring inteligente",
            "url": "https://code.visualstudio.com/updates",
            "fuente": "Visual Studio",
            "relevancia": "Alta",
            "dias_offset": 0
        },
        {
            "titulo_resumen": "PostgreSQL 17 mejora optimizador de queries y soporte para JSON complejo",
            "url": "https://www.postgresql.org/about/news",
            "fuente": "PostgreSQL",
            "relevancia": "Media",
            "dias_offset": -7
        },
        {
            "titulo_resumen": "OpenAI lanza GPT-5 con capacidades multimodales revolucionarias",
            "url": "https://openai.com/blog",
            "fuente": "OpenAI",
            "relevancia": "Alta",
            "dias_offset": -1
        },
        {
            "titulo_resumen": "Google Gemini Ultra supera a GPT-4 en benchmarks de razonamiento complejo",
            "url": "https://deepmind.google/gemini",
            "fuente": "Google DeepMind",
            "relevancia": "Alta",
            "dias_offset": -2
        }
    ]
    
    hoy = datetime.now()
    count = 0
    
    for noticia in noticias:
        fecha = hoy + timedelta(days=noticia["dias_offset"])
        noticia_id = str(uuid.uuid4())
        
        execute_query(
            """
            INSERT INTO noticias (
                id, usuario_id, titulo_resumen, url,
                fecha_publicacion, fuente, relevancia
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                noticia_id,
                None,  # Noticias generales (no pertenecen a ningún usuario)
                noticia["titulo_resumen"],
                noticia["url"],
                fecha,
                noticia["fuente"],
                noticia["relevancia"]
            )
        )
        count += 1
    
    print(f"✅ {count} noticias creadas")


def verificar_eventos():
    """Verifica si hay eventos, si no crea algunos."""
    print("🎪 Verificando eventos...")
    
    count_row = execute_one("SELECT COUNT(*) FROM eventos")
    count = count_row[0] if count_row else 0
    
    if count > 0:
        print(f"✅ Ya hay {count} eventos en la base de datos")
        return
    
    print("📅 Creando eventos de ejemplo...")
    
    eventos = [
        {
            "titulo": "HackMTY 2026",
            "descripcion": "El hackathon más grande del norte de México",
            "fecha": (datetime.now() + timedelta(days=30)).date(),
            "hora": "09:00",
            "ubicacion": "Monterrey, México",
            "categoria": "Hackathon",
            "cupos_disponibles": 200,
            "es_popular": True,
            "organizador": "TechHub MTY",
            "url_externa": "https://hackmty.com",
            "latitud": 25.6866,
            "longitud": -100.3161
        },
        {
            "titulo": "JS Conf Colombia 2026",
            "descripcion": "Conferencia internacional de JavaScript",
            "fecha": (datetime.now() + timedelta(days=45)).date(),
            "hora": "10:30",
            "ubicacion": "Bogotá, Colombia",
            "categoria": "Conferencia",
            "cupos_disponibles": 500,
            "es_popular": True,
            "organizador": "JSConf",
            "url_externa": "https://jsconf.co",
            "latitud": 4.7110,
            "longitud": -74.0721
        },
        {
            "titulo": "Python Web Dev Workshop",
            "descripcion": "Taller intensivo de desarrollo web con Python y FastAPI",
            "fecha": (datetime.now() + timedelta(days=15)).date(),
            "hora": "16:00",
            "ubicacion": "Online",
            "categoria": "Taller",
            "cupos_disponibles": 100,
            "es_popular": False,
            "organizador": "Python Community",
            "url_externa": "https://python.org",
            "latitud": None,
            "longitud": None
        }
    ]
    
    for evento in eventos:
        evento_id = str(uuid.uuid4())
        execute_query(
            """
            INSERT INTO eventos (
                id, titulo, descripcion, fecha, hora, ubicacion,
                categoria, cupos_disponibles, es_popular, organizador,
                url_externa, latitud, longitud
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                evento_id,
                evento["titulo"],
                evento["descripcion"],
                evento["fecha"],
                evento["hora"],
                evento["ubicacion"],
                evento["categoria"],
                evento["cupos_disponibles"],
                evento["es_popular"],
                evento["organizador"],
                evento["url_externa"],
                evento["latitud"],
                evento["longitud"]
            )
        )
    
    print(f"✅ {len(eventos)} eventos creados")


def main():
    """Ejecuta el proceso de población de datos."""
    print("=" * 60)
    print("🎨 POBLANDO BASE DE DATOS CON DATOS DE PRUEBA")
    print("=" * 60)
    print()
    
    try:
        limpiar_datos_existentes()
        print()
        
        crear_desafios_diarios()
        print()
        
        crear_noticias()
        print()
        
        verificar_eventos()
        print()
        
        print("=" * 60)
        print("✅ BASE DE DATOS POBLADA EXITOSAMENTE")
        print("=" * 60)
        print()
        print("📊 Resumen:")
        print("  • 10 Desafíos diarios (7 pasados, hoy, 2 futuros)")
        print("  • 8 Noticias tech variadas")
        print("  • Eventos verificados/creados")
        print()
        print("🚀 Ahora tu app se verá llena de contenido")
        print("🔄 El backend se recargará automáticamente")
        
    except (psycopg2.Error, ValueError, KeyError) as e:
        print()
        print("=" * 60)
        print(f"❌ ERROR: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
