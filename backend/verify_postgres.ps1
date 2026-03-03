# Script de Verificación y Solución de PostgreSQL
# DevPal Project - Diagnóstico de Base de Datos

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE POSTGRESQL - DEVPAL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si PostgreSQL está instalado
Write-Host "1. Verificando instalación de PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($pgService) {
    Write-Host "   ✓ PostgreSQL encontrado: $($pgService.DisplayName)" -ForegroundColor Green
    Write-Host "   Status: $($pgService.Status)" -ForegroundColor $(if ($pgService.Status -eq 'Running') {'Green'} else {'Red'})
    
    # Si no está corriendo, intentar iniciar
    if ($pgService.Status -ne 'Running') {
        Write-Host ""
        Write-Host "2. Intentando iniciar PostgreSQL..." -ForegroundColor Yellow
        try {
            Start-Service $pgService.Name
            Start-Sleep -Seconds 3
            $pgService.Refresh()
            Write-Host "   ✓ PostgreSQL iniciado correctamente" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ Error al iniciar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Intenta iniciarlo manualmente desde Servicios de Windows" -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-Host "   ✗ PostgreSQL NO encontrado como servicio" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "  1. Instalar PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "  2. O verificar si está instalado en otra ruta" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "3. Verificando conexión a PostgreSQL..." -ForegroundColor Yellow

# Buscar rutas comunes de PostgreSQL
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "   ✗ psql.exe no encontrado en rutas comunes" -ForegroundColor Red
    Write-Host "   Busca manualmente la instalación de PostgreSQL" -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✓ psql encontrado en: $psqlPath" -ForegroundColor Green
Write-Host ""

# 4. Verificar conexión con Python
Write-Host "4. Verificando conexión desde Python..." -ForegroundColor Yellow
$pythonScript = @"
import psycopg2
import sys
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='postgres',
        client_encoding='UTF8'
    )
    print('OK')
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
"@

$result = & python -c $pythonScript 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Conexión exitosa desde Python" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error de conexión: $result" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intentando solucionar encoding..." -ForegroundColor Yellow
    
    # Intentar con diferentes configuraciones
    $altScript = @"
import psycopg2
import os
os.environ['PGCLIENTENCODING'] = 'UTF8'
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='postgres'
    )
    print('OK con PGCLIENTENCODING=UTF8')
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
"@
    
    $altResult = & python -c $altScript 2>&1
    Write-Host "   Resultado con UTF8: $altResult" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "5. Verificando base de datos devpal_db..." -ForegroundColor Yellow

$checkDbScript = @"
import psycopg2
import os
os.environ['PGCLIENTENCODING'] = 'UTF8'
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='postgres',
        client_encoding='UTF8'
    )
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname='devpal_db'")
    exists = cur.fetchone()
    if exists:
        print('EXISTS')
    else:
        print('NOT_EXISTS')
    cur.close()
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
"@

$dbExists = & python -c $checkDbScript 2>&1

if ($dbExists -match 'EXISTS') {
    Write-Host "   ✓ Base de datos 'devpal_db' existe" -ForegroundColor Green
} elseif ($dbExists -match 'NOT_EXISTS') {
    Write-Host "   ✗ Base de datos 'devpal_db' NO existe" -ForegroundColor Red
    Write-Host ""
    Write-Host "¿Deseas crear la base de datos ahora? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Host "   Creando base de datos..." -ForegroundColor Yellow
        
        $createDbScript = @"
import psycopg2
import os
os.environ['PGCLIENTENCODING'] = 'UTF8'
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='postgres',
        client_encoding='UTF8'
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE DATABASE devpal_db")
    print('CREATED')
    cur.close()
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
"@
        
        $createResult = & python -c $createDbScript 2>&1
        
        if ($createResult -match 'CREATED') {
            Write-Host "   ✓ Base de datos 'devpal_db' creada" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Error al crear BD: $createResult" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ✗ Error al verificar BD: $dbExists" -ForegroundColor Red
}

Write-Host ""
Write-Host "6. Verificando tablas en devpal_db..." -ForegroundColor Yellow

$checkTablesScript = @"
import psycopg2
import os
os.environ['PGCLIENTENCODING'] = 'UTF8'
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='devpal_db',
        client_encoding='UTF8'
    )
    cur = conn.cursor()
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname='public'")
    tables = cur.fetchall()
    if tables:
        print(f'TABLES: {len(tables)}')
        for table in tables:
            print(f'  - {table[0]}')
    else:
        print('NO_TABLES')
    cur.close()
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
"@

$tablesResult = & python -c $checkTablesScript 2>&1
Write-Host "   $tablesResult" -ForegroundColor Cyan

if ($tablesResult -match 'NO_TABLES') {
    Write-Host ""
    Write-Host "   ⚠ La base de datos existe pero NO tiene tablas" -ForegroundColor Yellow
    Write-Host "   Necesitas ejecutar: psql -U postgres -d devpal_db -f database_init.sql" -ForegroundColor Cyan
    Write-Host "   O ejecutar el script manualmente desde pgAdmin" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($pgService.Status -eq 'Running') {
    Write-Host "✓ PostgreSQL está corriendo" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL NO está corriendo" -ForegroundColor Red
}

if ($result -eq 'OK') {
    Write-Host "✓ Conexión Python funciona" -ForegroundColor Green
} else {
    Write-Host "✗ Conexión Python tiene problemas" -ForegroundColor Red
}

if ($dbExists -match 'EXISTS') {
    Write-Host "✓ Base de datos devpal_db existe" -ForegroundColor Green
} else {
    Write-Host "✗ Base de datos devpal_db NO existe" -ForegroundColor Red
}

if ($tablesResult -match 'TABLES') {
    Write-Host "✓ Base de datos tiene tablas" -ForegroundColor Green
} else {
    Write-Host "✗ Base de datos NO tiene tablas" -ForegroundColor Red
}

Write-Host ""
Write-Host "Siguiente paso: Ejecutar el backend con 'uvicorn app.main:app --reload --port 8001'" -ForegroundColor Cyan
Write-Host ""
