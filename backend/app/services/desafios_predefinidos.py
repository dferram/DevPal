# -*- coding: utf-8 -*-

DESAFIOS_PREDEFINIDOS = [
    {
        "lenguaje_recomendado": "python",
        "titulo": "Suma de Dos",
        "dificultad": "Fácil",
        "xp_recompensa": 25,
        "contexto_negocio": "Una plataforma e-commerce necesita encontrar combinaciones de productos que sumados den exactamente un valor objetivo (ej. un cupón fijo).",
        "definicion_problema": "Dada una lista de enteros 'nums' y un entero 'target', retorna los índices de los dos números tales que sumen 'target'. Puedes asumir que cada entrada tendría exactamente una solución, y no puedes usar el mismo elemento dos veces. El orden del arreglo de retorno no importa.",
        "templates_por_lenguaje": {
            "python": "def sumaDeDos(nums: list[int], target: int) -> list[int]:\n    # Tu código aquí\n    pass",
            "javascript": "function sumaDeDos(nums, target) {\n    // Tu código aquí\n}",
            "java": "class Solution {\n    public int[] sumaDeDos(int[] nums, int target) {\n        // Tu código aquí\n        return new int[]{};\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> sumaDeDos(vector<int>& nums, int target) {\n        // Tu código aquí\n        return {};\n    }\n};"
        },
        "restricciones": {
            "tiempo": "O(n)",
            "memoria": "O(n)"
        },
        "casos_prueba": [
            { "input": "[2,7,11,15]\n9", "output": "[0, 1]", "tipo": "Normal", "explicacion": "2 + 7 = 9. Por lo tanto return [0, 1]." },
            { "input": "[3,2,4]\n6", "output": "[1, 2]", "tipo": "Normal", "explicacion": "2 + 4 = 6. return [1, 2]." },
            { "input": "[3,3]\n6", "output": "[0, 1]", "tipo": "Edge Case", "explicacion": "Mismos números." }
        ],
        "pista": "Intenta usar un HashMap/Diccionario para guardar los números por los que ya has pasado y buscar el complemento necesario ('target - num_actual') de una manera eficiente."
    },
    {
        "lenguaje_recomendado": "python",
        "titulo": "Palíndromo Válido",
        "dificultad": "Fácil",
        "xp_recompensa": 25,
        "contexto_negocio": "Un sistema de procesamiento lingüístico requiere validar si un texto ingresado por un usuario puede leerse igual de izquierda a derecha descartando símbolos.",
        "definicion_problema": "Dada una cadena 's', devuelve true si es un palíndromo, o false en caso contrario. Una cadena es palíndromo si, después de convertir todas las letras mayúsculas en minúsculas y eliminar todos los caracteres no alfanuméricos, se lee igual hacia adelante que hacia atrás. Los caracteres alfanuméricos incluyen letras y números.",
        "templates_por_lenguaje": {
            "python": "def esPalindromo(s: str) -> bool:\n    # Tu código aquí\n    pass",
            "javascript": "function esPalindromo(s) {\n    // Tu código aquí\n}",
            "java": "class Solution {\n    public boolean esPalindromo(String s) {\n        // Tu código aquí\n        return false;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool esPalindromo(string s) {\n        // Tu código aquí\n        return false;\n    }\n};"
        },
        "restricciones": {
            "tiempo": "O(n)",
            "memoria": "O(1)"
        },
        "casos_prueba": [
            { "input": "\"A man, a plan, a canal: Panama\"", "output": "true", "tipo": "Normal", "explicacion": "\"amanaplanacanalpanama\" es un un palíndromo." },
            { "input": "\"race a car\"", "output": "false", "tipo": "Normal", "explicacion": "\"raceacar\" no es un palíndromo." },
            { "input": "\" \"", "output": "true", "tipo": "Edge Case", "explicacion": "Una cadena vacía/solo espacios se lee igual hacia atrás." }
        ],
        "pista": "Puedes resolverlo usando dos punteros: uno empezando desde el inicio (izquierdo) y otro desde el final (derecho). Mueve ambos hacia el centro ignorando lo que no sea alfanumérico."
    },
    {
        "lenguaje_recomendado": "python",
        "titulo": "Invertir Cadena",
        "dificultad": "Fácil",
        "xp_recompensa": 25,
        "contexto_negocio": "Herramienta de manipulación de cadenas en un sistema criptográfico ligero.",
        "definicion_problema": "Escribe una función que invierta una cadena. Debes hacerlo modificando un arreglo de caracteres en el mismo lugar (in-place) asumiendo que te llega como lista. Para efecto del desafío asume que recibes una simple cadena de texto y debes retornar la cadena de texto invertida.",
        "templates_por_lenguaje": {
            "python": "def revertirCadena(s: str) -> str:\n    # Tu código aquí\n    pass",
            "javascript": "function revertirCadena(s) {\n    // Tu código aquí\n}",
            "java": "class Solution {\n    public String revertirCadena(String s) {\n        // Tu código aquí\n        return \"\";\n    }\n}",
            "cpp": "class Solution {\npublic:\n    string revertirCadena(string s) {\n        // Tu código aquí\n        return \"\";\n    }\n};"
        },
        "restricciones": {
            "tiempo": "O(n)",
            "memoria": "O(n) o O(1)"
        },
        "casos_prueba": [
            { "input": "\"hola\"", "output": "\"aloh\"", "tipo": "Normal", "explicacion": "Invierte hola a aloh." },
            { "input": "\"Hannah\"", "output": "\"hannaH\"", "tipo": "Normal", "explicacion": "Nota la capitalización." }
        ],
        "pista": "En Python puedes usar slicing (s[::-1]). Otros lenguajes requieren recorrer y armar el reverso de la cadena o usar un par de punteros y hacer swap."
    },
    {
        "lenguaje_recomendado": "python",
        "titulo": "Primer Carácter Único",
        "dificultad": "Fácil",
        "xp_recompensa": 35,
        "contexto_negocio": "Un sistema procesador de streams de eventos de transacciones para detectar secuencias de ID únicos enviados solo una vez.",
        "definicion_problema": "Dada una cadena s, encuentra el primer carácter no repetido y devuelve su índice. Si no existe un carácter único, devuelve -1.",
        "templates_por_lenguaje": {
            "python": "def primerUnicoCaracter(s: str) -> int:\n    # Tu código aquí\n    pass",
            "javascript": "function primerUnicoCaracter(s) {\n    // Tu código aquí\n}",
            "java": "class Solution {\n    public int primerUnicoCaracter(String s) {\n        // Tu código aquí\n        return -1;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int primerUnicoCaracter(string s) {\n        // Tu código aquí\n        return -1;\n    }\n};"
        },
        "restricciones": {
            "tiempo": "O(n)",
            "memoria": "O(1) (solo son 26 letras)"
        },
        "casos_prueba": [
            { "input": "\"devpal\"", "output": "0", "tipo": "Normal", "explicacion": "La 'd' es el primer caracter único." },
            { "input": "\"aabb\"", "output": "-1", "tipo": "Normal", "explicacion": "Todos se repiten." }
        ],
        "pista": "Usa una tabla hash (diccionario) para contar las frecuencias de cada carácter en la primera pasada, luego haz otra pasada para encontrar el primero con frecuencia 1."
    },
    {
        "lenguaje_recomendado": "python",
        "titulo": "Subcadena más larga sin repetir",
        "dificultad": "Medio",
        "xp_recompensa": 50,
        "contexto_negocio": "Optimizador de buffers de transmisión que debe encontrar la subsecuencia máxima de bits o carácteres no duplicados antes de flushear buffer.",
        "definicion_problema": "Dada una cadena s, encuentra la longitud de la subcadena más larga que no contenga caracteres repetidos.",
        "templates_por_lenguaje": {
            "python": "def longitudSubcadena(s: str) -> int:\n    # Tu código aquí\n    pass",
            "javascript": "function longitudSubcadena(s) {\n    // Tu código aquí\n}",
            "java": "class Solution {\n    public int longitudSubcadena(String s) {\n        // Tu código aquí\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int longitudSubcadena(string s) {\n        // Tu código aquí\n        return 0;\n    }\n};"
        },
        "restricciones": {
            "tiempo": "O(n)",
            "memoria": "O(min(n, m))"
        },
        "casos_prueba": [
            { "input": "\"abcabcbb\"", "output": "3", "tipo": "Normal", "explicacion": "La respuesta es 'abc', longitud 3." },
            { "input": "\"bbbbb\"", "output": "1", "tipo": "Normal", "explicacion": "La respuesta es 'b', longitud 1." },
            { "input": "\"pwwkew\"", "output": "3", "tipo": "Normal", "explicacion": "La respuesta es 'wke', longitud 3. A pesar que pwwkew contiene pwke la subcadena debe ser continua." }
        ],
        "pista": "Una ventana deslizante (sliding window) con dos punteros es la estrategia óptima. Usa un set/diccionario para marcar los carácteres que están actualmente en tu ventana."
    }
]
