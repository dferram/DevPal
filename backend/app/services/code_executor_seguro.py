"""
Ejecución segura de código Python usando RestrictedPython.
Alternativa a Docker para sandboxing rápido.
"""

from RestrictedPython import compile_restricted, safe_globals, limited_builtins
from RestrictedPython.Guards import guarded_iter_unpack_sequence, safe_builtins
import sys
from io import StringIO
from typing import List, Dict, Any
import signal
import resource


class CodeExecutionTimeout(Exception):
    """Excepción para timeout de ejecución."""
    pass


def timeout_handler(signum, frame):
    """Handler para timeout."""
    raise CodeExecutionTimeout("Código excedió el límite de tiempo de ejecución")


def ejecutar_codigo_python_seguro(codigo: str, casos_prueba: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ejecuta código Python en entorno restringido.
    
    Args:
        codigo: Código fuente del usuario
        casos_prueba: Lista de casos con 'input' y 'expected'
    
    Returns:
        Resultado de ejecución con casos pasados/fallados
    """
    
    # Configurar límites de recursos (solo en Unix)
    if hasattr(resource, 'RLIMIT_AS'):
        # Limitar memoria a 128MB
        resource.setrlimit(resource.RLIMIT_AS, (128 * 1024 * 1024, 128 * 1024 * 1024))
    
    # Compilar código con restricciones
    byte_code = compile_restricted(
        codigo,
        filename='<user_code>',
        mode='exec'
    )
    
    if byte_code.errors:
        return {
            'exito': False,
            'error_compilacion': '\n'.join(byte_code.errors),
            'casos_detalle': []
        }
    
    # Namespace restringido - SOLO funciones seguras
    restricted_globals = {
        '__builtins__': {
            # Tipos básicos
            'int': int,
            'float': float,
            'str': str,
            'bool': bool,
            'list': list,
            'dict': dict,
            'tuple': tuple,
            'set': set,
            
            # Funciones seguras
            'range': range,
            'len': len,
            'sum': sum,
            'max': max,
            'min': min,
            'abs': abs,
            'all': all,
            'any': any,
            'sorted': sorted,
            'reversed': reversed,
            'enumerate': enumerate,
            'zip': zip,
            'map': map,
            'filter': filter,
            
            # Math básico
            'pow': pow,
            'round': round,
            
            # NO permitir: open, exec, eval, __import__, compile, input, file
        },
        '_iter_unpack_sequence_': guarded_iter_unpack_sequence,
        '_getiter_': lambda x: iter(x),
        '__name__': 'restricted_module',
    }
    
    try:
        # Configurar timeout de 5 segundos (solo en Unix)
        if hasattr(signal, 'SIGALRM'):
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(5)
        
        # Ejecutar código del usuario
        exec(byte_code.code, restricted_globals)
        
        # Cancelar timeout
        if hasattr(signal, 'SIGALRM'):
            signal.alarm(0)
        
    except CodeExecutionTimeout:
        return {
            'exito': False,
            'error_compilacion': 'El código excedió el límite de tiempo (5 segundos)',
            'casos_detalle': []
        }
    except Exception as e:
        return {
            'exito': False,
            'error_compilacion': f'Error al ejecutar código: {str(e)}',
            'casos_detalle': []
        }
    
    # Verificar que existe la función 'solucion'
    if 'solucion' not in restricted_globals:
        return {
            'exito': False,
            'error_compilacion': 'No se encontró la función "solucion" en tu código',
            'casos_detalle': []
        }
    
    solucion_func = restricted_globals['solucion']
    
    # Ejecutar casos de prueba
    casos_detalle = []
    casos_pasados = 0
    
    for i, caso in enumerate(casos_prueba):
        try:
            # Capturar stdout
            old_stdout = sys.stdout
            sys.stdout = StringIO()
            
            # Ejecutar función del usuario
            entrada = caso.get('input', [])
            if not isinstance(entrada, list):
                entrada = [entrada]
            
            resultado = solucion_func(*entrada)
            
            # Restaurar stdout
            output_capturado = sys.stdout.getvalue()
            sys.stdout = old_stdout
            
            # Comparar resultado
            esperado = caso.get('expected')
            paso = (resultado == esperado)
            
            if paso:
                casos_pasados += 1
            
            casos_detalle.append({
                'caso': i + 1,
                'input': entrada,
                'expected': esperado,
                'output': resultado,
                'paso': paso,
                'stdout': output_capturado if output_capturado else None
            })
            
        except Exception as e:
            sys.stdout = old_stdout
            casos_detalle.append({
                'caso': i + 1,
                'input': caso.get('input'),
                'expected': caso.get('expected'),
                'output': None,
                'paso': False,
                'error': str(e)
            })
    
    return {
        'exito': casos_pasados == len(casos_prueba),
        'casos_pasados': casos_pasados,
        'casos_totales': len(casos_prueba),
        'casos_detalle': casos_detalle,
        'error_compilacion': None
    }


# Mantener función original para JavaScript (sin cambios)
def ejecutar_codigo_javascript(codigo: str, casos_prueba: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ejecuta código JavaScript usando Node.js (sin sandbox por ahora).
    TODO: Implementar sandboxing similar con vm2 o Docker.
    """
    import subprocess
    import json
    import tempfile
    import os
    
    # Crear archivo temporal con el código
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        # Agregar código de test
        test_code = f"""
{codigo}

const testCases = {json.dumps(casos_prueba)};
const results = [];

for (const testCase of testCases) {{
    try {{
        const input = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
        const result = solucion(...input);
        results.push({{
            input: testCase.input,
            expected: testCase.expected,
            output: result,
            paso: JSON.stringify(result) === JSON.stringify(testCase.expected)
        }});
    }} catch (error) {{
        results.push({{
            input: testCase.input,
            expected: testCase.expected,
            output: null,
            paso: false,
            error: error.message
        }});
    }}
}}

console.log(JSON.stringify(results));
"""
        f.write(test_code)
        temp_path = f.name
    
    try:
        # Ejecutar con Node.js con timeout
        result = subprocess.run(
            ['node', temp_path],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            return {
                'exito': False,
                'error_compilacion': result.stderr,
                'casos_detalle': []
            }
        
        # Parsear resultados
        casos_detalle = json.loads(result.stdout)
        casos_pasados = sum(1 for c in casos_detalle if c.get('paso'))
        
        return {
            'exito': casos_pasados == len(casos_prueba),
            'casos_pasados': casos_pasados,
            'casos_totales': len(casos_prueba),
            'casos_detalle': casos_detalle,
            'error_compilacion': None
        }
        
    except subprocess.TimeoutExpired:
        return {
            'exito': False,
            'error_compilacion': 'El código excedió el límite de tiempo (5 segundos)',
            'casos_detalle': []
        }
    except Exception as e:
        return {
            'exito': False,
            'error_compilacion': str(e),
            'casos_detalle': []
        }
    finally:
        # Limpiar archivo temporal
        os.unlink(temp_path)
