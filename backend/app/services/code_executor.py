"""
Code execution service for running user code against test cases.
Supports Python, JavaScript (Node.js), Java (JDK), and C++ (g++/clang).

IMPORTANT SECURITY NOTES:
- This is a simplified implementation for development/demo purposes
- In production, use Docker containers or cloud sandboxing (AWS Lambda, etc.)
- Never run untrusted code directly on production servers
- Implement proper resource limits, timeouts, and security measures
"""

import json
import traceback
import subprocess
import tempfile
import os
from typing import Dict, List, Any
from pathlib import Path


# Configuration
EXECUTION_TIMEOUT = 5  # seconds
MAX_OUTPUT_LENGTH = 1000  # characters


def ejecutar_codigo_python(codigo: str, casos_prueba: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ejecuta código Python contra casos de prueba.
    Usa exec() - simple pero limitado en seguridad.
    """
    resultados = {
        "exito": True,
        "casos_pasados": 0,
        "casos_totales": len(casos_prueba),
        "casos_detalle": [],
        "error_compilacion": None
    }
    
    try:
        codigo_limpio = codigo
        codigo_limpio = codigo_limpio.replace('"', '"').replace('"', '"')
        codigo_limpio = codigo_limpio.replace(''', "'").replace(''', "'")
        codigo_limpio = codigo_limpio.replace('—', '-').replace('–', '-')
        
        # Crear namespace para la ejecución
        namespace = {}
        
        # Compilar el código sanitizado
        exec(codigo_limpio, namespace)
        
        # Buscar la función principal
        funcion_principal = None
        for name, obj in namespace.items():
            if callable(obj) and not name.startswith('__'):
                funcion_principal = obj
                break
        
        if not funcion_principal:
            resultados["exito"] = False
            resultados["error_compilacion"] = (
                "Tu código debe contener una función.\n\n"
                "Ejemplo:\n"
                "def solucion(parametro):\n"
                "    # tu lógica aquí\n"
                "    return resultado\n\n"
                "La función será llamada con los casos de prueba."
            )
            return resultados
        
        # Ejecutar cada caso de prueba
        for i, caso in enumerate(casos_prueba):
            resultado_caso = {
                "numero": i + 1,
                "input": caso.get("input", ""),
                "output_esperado": caso.get("output", ""),
                "output_obtenido": None,
                "pasado": False,
                "error": None
            }
            
            try:
                # Parsear el input
                try:
                    input_valor = json.loads(caso["input"])
                except:
                    input_valor = eval(caso["input"])
                
                # Ejecutar la función
                if isinstance(input_valor, list):
                    output = funcion_principal(*input_valor)
                else:
                    output = funcion_principal(input_valor)
                
                resultado_caso["output_obtenido"] = str(output)
                
                # Comparar resultados
                try:
                    output_esperado = json.loads(caso["output"])
                except:
                    output_esperado = eval(caso["output"])
                
                if output == output_esperado or str(output) == str(output_esperado):
                    resultado_caso["pasado"] = True
                    resultados["casos_pasados"] += 1
                
            except Exception as e:
                resultado_caso["error"] = str(e)
                resultado_caso["output_obtenido"] = f"Error: {str(e)}"
            
            resultados["casos_detalle"].append(resultado_caso)
        
        # Marcar como no exitoso si algún caso falló
        if resultados["casos_pasados"] < resultados["casos_totales"]:
            resultados["exito"] = False
            
    except Exception as e:
        resultados["exito"] = False
        resultados["error_compilacion"] = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
    
    return resultados


def ejecutar_codigo_javascript(codigo: str, casos_prueba: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ejecuta código JavaScript usando Node.js.
    Requiere Node.js instalado en el sistema.
    """
    resultados = {
        "exito": True,
        "casos_pasados": 0,
        "casos_totales": len(casos_prueba),
        "casos_detalle": [],
        "error_compilacion": None
    }
    
    # Verificar si Node.js está disponible
    try:
        subprocess.run(["node", "--version"], capture_output=True, timeout=2)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return {
            "exito": False,
            "casos_pasados": 0,
            "casos_totales": len(casos_prueba),
            "casos_detalle": [],
            "error_compilacion": "Node.js no está instalado. Instálalo desde https://nodejs.org/"
        }
    
    try:
        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
            # Escribir el código del usuario
            f.write(codigo + "\n\n")
            
            # Agregar código de prueba
            f.write("""
// Test runner
const testCases = """ + json.dumps(casos_prueba) + """;
const results = [];

// Buscar la función principal (asumimos que es la primera función exportada o definida)
let mainFunction;
if (typeof solution !== 'undefined') mainFunction = solution;
else if (typeof solve !== 'undefined') mainFunction = solve;
else {
    // Buscar cualquier función definida
    for (let key of Object.keys(global)) {
        if (typeof global[key] === 'function' && !key.startsWith('_')) {
            mainFunction = global[key];
            break;
        }
    }
}

if (!mainFunction) {
    console.log(JSON.stringify({error: "No se encontró una función en el código"}));
    process.exit(1);
}

testCases.forEach((testCase, i) => {
    try {
        let input = JSON.parse(testCase.input);
        let expectedOutput = JSON.parse(testCase.output);
        
        let output;
        if (Array.isArray(input)) {
            output = mainFunction(...input);
        } else {
            output = mainFunction(input);
        }
        
        const passed = JSON.stringify(output) === JSON.stringify(expectedOutput);
        results.push({
            numero: i + 1,
            input: testCase.input,
            output_esperado: testCase.output,
            output_obtenido: JSON.stringify(output),
            pasado: passed,
            error: null
        });
    } catch (error) {
        results.push({
            numero: i + 1,
            input: testCase.input,
            output_esperado: testCase.output,
            output_obtenido: `Error: ${error.message}`,
            pasado: false,
            error: error.message
        });
    }
});

console.log(JSON.stringify(results));
""")
            temp_file = f.name
        
        # Ejecutar el código
        result = subprocess.run(
            ["node", temp_file],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT
        )
        
        # Limpiar archivo temporal
        os.unlink(temp_file)
        
        if result.returncode != 0:
            # Error de compilación o ejecución
            error_msg = result.stderr[:MAX_OUTPUT_LENGTH] if result.stderr else "Error desconocido"
            if "No se encontró una función" in result.stdout:
                resultados["error_compilacion"] = "No se encontró una función en el código"
            else:
                resultados["error_compilacion"] = error_msg
            resultados["exito"] = False
            return resultados
        
        # Parsear resultados
        casos_detalle = json.loads(result.stdout)
        resultados["casos_detalle"] = casos_detalle
        resultados["casos_pasados"] = sum(1 for c in casos_detalle if c["pasado"])
        
        if resultados["casos_pasados"] < resultados["casos_totales"]:
            resultados["exito"] = False
            
    except subprocess.TimeoutExpired:
        resultados["exito"] = False
        resultados["error_compilacion"] = f"Tiempo de ejecución excedido ({EXECUTION_TIMEOUT}s)"
        if 'temp_file' in locals():
            os.unlink(temp_file)
    except Exception as e:
        resultados["exito"] = False
        resultados["error_compilacion"] = f"{type(e).__name__}: {str(e)}"
        if 'temp_file' in locals() and os.path.exists(temp_file):
            os.unlink(temp_file)
    
    return resultados


def ejecutar_codigo_java(codigo: str, casos_prueba: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ejecuta código Java usando JDK.
    Requiere Java Development Kit instalado.
    """
    resultados = {
        "exito": True,
        "casos_pasados": 0,
        "casos_totales": len(casos_prueba),
        "casos_detalle": [],
        "error_compilacion": None
    }
    
    # Verificar si Java está disponible
    try:
        subprocess.run(["javac", "-version"], capture_output=True, timeout=2)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return {
            "exito": False,
            "casos_pasados": 0,
            "casos_totales": len(casos_prueba),
            "casos_detalle": [],
            "error_compilacion": "JDK no está instalado. Instálalo desde https://www.oracle.com/java/technologies/downloads/"
        }
    
    # Por ahora, retornar mensaje de no implementado
    # La implementación completa requiere compilación y manejo más complejo
    return {
        "exito": False,
        "casos_pasados": 0,
        "casos_totales": len(casos_prueba),
        "casos_detalle": [],
        "error_compilacion": "Ejecución de Java en desarrollo. Por ahora usa Python o JavaScript."
    }


def ejecutar_codigo_cpp(codigo: str, casos_prueba: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ejecuta código C++ usando g++ o clang.
    Requiere compilador C++ instalado.
    """
    resultados = {
        "exito": True,
        "casos_pasados": 0,
        "casos_totales": len(casos_prueba),
        "casos_detalle": [],
        "error_compilacion": None
    }
    
    # Verificar si g++ está disponible
    try:
        subprocess.run(["g++", "--version"], capture_output=True, timeout=2)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return {
            "exito": False,
            "casos_pasados": 0,
            "casos_totales": len(casos_prueba),
            "casos_detalle": [],
            "error_compilacion": "g++ no está instalado. Instala MinGW (Windows) o build-essential (Linux)"
        }
    
    # Por ahora, retornar mensaje de no implementado
    return {
        "exito": False,
        "casos_pasados": 0,
        "casos_totales": len(casos_prueba),
        "casos_detalle": [],
        "error_compilacion": "Ejecución de C++ en desarrollo. Por ahora usa Python o JavaScript."
    }


def ejecutar_codigo(
    codigo: str,
    lenguaje: str,
    casos_prueba: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Ejecuta código en el lenguaje especificado.
    
    Args:
        codigo: Código fuente del usuario
        lenguaje: Lenguaje de programación (python, javascript, java, cpp)
        casos_prueba: Lista de casos de prueba
        
    Returns:
        Resultados de ejecución
    """
    lenguaje = lenguaje.lower()
    
    if lenguaje == "python":
        return ejecutar_codigo_python(codigo, casos_prueba)
    elif lenguaje in ["javascript", "js"]:
        return ejecutar_codigo_javascript(codigo, casos_prueba)
    elif lenguaje == "java":
        return ejecutar_codigo_java(codigo, casos_prueba)
    elif lenguaje in ["cpp", "c++"]:
        return ejecutar_codigo_cpp(codigo, casos_prueba)
    else:
        return {
            "exito": False,
            "casos_pasados": 0,
            "casos_totales": len(casos_prueba),
            "casos_detalle": [],
            "error_compilacion": f"Lenguaje '{lenguaje}' no soportado. Soportados: Python, JavaScript"
        }
