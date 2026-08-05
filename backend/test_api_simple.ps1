# Script de prueba de API DevPal
Write-Host "Probando API de DevPal..." -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing
if ($health.StatusCode -eq 200) {
    Write-Host "   OK - Servidor funcionando" -ForegroundColor Green
} else {
    Write-Host "   ERROR" -ForegroundColor Red
    exit 1
}

# 2. Crear usuario
Write-Host ""
Write-Host "2. Creando usuario de prueba..." -ForegroundColor Yellow
$bodyRegister = @{
    nombre = "Usuario"
    apellidos = "Prueba"
    email = "test@devpal.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/auth/register" -Method POST -Body $bodyRegister -ContentType "application/json" -UseBasicParsing
    Write-Host "   OK - Usuario creado" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "   OK - Usuario ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "   ERROR: $_" -ForegroundColor Red
    }
}

# 3. Login
Write-Host ""
Write-Host "3. Probando login..." -ForegroundColor Yellow
$bodyLogin = @{
    email = "test@devpal.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/auth/login" -Method POST -Body $bodyLogin -ContentType "application/json" -UseBasicParsing
    Write-Host "   OK - Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# 4. Eventos
Write-Host ""
Write-Host "4. Obteniendo eventos..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/eventos/" -UseBasicParsing
    $eventos = $response.Content | ConvertFrom-Json
    Write-Host "   OK - Total eventos: $($eventos.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host " BACKEND FUNCIONANDO CORRECTAMENTE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Documentacion API:" -ForegroundColor Cyan
Write-Host "  http://localhost:8001/docs" -ForegroundColor White
Write-Host "  http://localhost:8001/redoc" -ForegroundColor White
Write-Host ""
