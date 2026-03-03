# ==================================
# DevPal - Script de Configuración Local
# ==================================
# Este script te ayuda a configurar DevPal en tu máquina local

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  DevPal - Configuración Local" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Verificar requisitos
Write-Host "`n[1/5] Verificando requisitos..." -ForegroundColor Yellow

# Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python NO encontrado. Instala Python 3.11+" -ForegroundColor Red
    exit 1
}

# PostgreSQL
try {
    $pgVersion = psql --version 2>&1
    Write-Host "  ✓ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ PostgreSQL NO encontrado. Instala PostgreSQL 14+" -ForegroundColor Red
    exit 1
}

# Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js NO encontrado. Instala Node.js 18+" -ForegroundColor Red
    exit 1
}

# Crear base de datos
Write-Host "`n[2/5] Configurando base de datos..." -ForegroundColor Yellow

$createDB = Read-Host "¿Deseas crear la base de datos 'devpal_db'? (s/n)"
if ($createDB -eq "s" -or $createDB -eq "S") {
    Write-Host "  Creando base de datos..."
    
    # Crear base de datos
    $env:PGPASSWORD = "postgres"
    psql -U postgres -c "CREATE DATABASE devpal_db;" 2>&1
    
    # Ejecutar script de inicialización
    Write-Host "  Ejecutando script de inicialización..."
    psql -U postgres -d devpal_db -f backend/database_init.sql
    
    Write-Host "  ✓ Base de datos creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "  ⊙ Paso omitido" -ForegroundColor Gray
}

# Configurar backend
Write-Host "`n[3/5] Configurando backend..." -ForegroundColor Yellow

Set-Location backend

# Crear entorno virtual
if (!(Test-Path ".venv")) {
    Write-Host "  Creando entorno virtual..."
    python -m venv .venv
    Write-Host "  ✓ Entorno virtual creado" -ForegroundColor Green
} else {
    Write-Host "  ⊙ Entorno virtual ya existe" -ForegroundColor Gray
}

# Activar entorno virtual
Write-Host "  Activando entorno virtual..."
& .venv\Scripts\Activate.ps1

# Instalar dependencias
Write-Host "  Instalando dependencias..."
pip install -r requirements.txt -q
Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green

Set-Location ..

# Configurar frontend
Write-Host "`n[4/5] Configurando frontend..." -ForegroundColor Yellow

Set-Location frontend

# Instalar dependencias
if (!(Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias npm..."
    npm install
    Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "  ⊙ Dependencias ya instaladas" -ForegroundColor Gray
}

Set-Location ..

# Resumen
Write-Host "`n[5/5] Configuración completada!" -ForegroundColor Green

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  ¡DevPal está listo!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host "`nPara ejecutar la aplicación:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend:" -ForegroundColor White
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    .venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "    uvicorn app.main:app --reload --port 8001" -ForegroundColor Gray
Write-Host ""
Write-Host "  Frontend:" -ForegroundColor White
Write-Host "    cd frontend" -ForegroundColor Gray
Write-Host "    npx expo start" -ForegroundColor Gray
Write-Host ""

Write-Host "  📚 Documentación completa: SETUP_LOCAL.md" -ForegroundColor Cyan
Write-Host "  🌐 API Docs: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "Notas importantes:" -ForegroundColor Yellow
Write-Host "  • Las funcionalidades de IA están bloqueadas (próximamente)" -ForegroundColor Gray
Write-Host "  • Revisa SETUP_LOCAL.md para más detalles" -ForegroundColor Gray
Write-Host "  • Usa datos de prueba manual o la API para poblar la BD" -ForegroundColor Gray
Write-Host ""
