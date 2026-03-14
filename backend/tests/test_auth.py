import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
from app.main import app
from app.routers.auth import hash_password

@pytest.fixture
def mock_db():
    with patch("app.routers.auth.execute_one") as mock_execute_one, \
         patch("app.routers.auth.get_db_connection") as mock_get_conn:
        yield mock_execute_one, mock_get_conn

@pytest.mark.asyncio
async def test_register_success(mock_db):
    mock_execute_one, mock_get_conn = mock_db
    # Simulamos que no hay usuario con ese email
    mock_execute_one.return_value = None
    
    # Mockeamos el connection pool y cursor para el insert
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_conn.return_value.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json={
            "nombre": "Test",
            "apellidos": "User",
            "email": "test@example.com",
            "password": "Password123!"
        })
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Usuario registrado exitosamente"
    assert "user_id" in data
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_register_existing_email(mock_db):
    mock_execute_one, _ = mock_db
    # Simulamos que YA existe un usuario con ese email
    mock_execute_one.return_value = ("existing_id",)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json={
            "nombre": "Test",
            "apellidos": "User",
            "email": "test@example.com",
            "password": "Password123!"
        })
    
    assert response.status_code == 400
    assert response.json()["detail"] == "El email ya está registrado"

@pytest.mark.asyncio
async def test_login_success(mock_db):
    mock_execute_one, _ = mock_db
    # Simulamos el usuario que devuelve la DB (id, email, password_hash, nombre, apellidos)
    hashed_pass = hash_password("Password123!")
    mock_execute_one.return_value = ("fake_id", "test@example.com", hashed_pass, "Test", "User")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "Password123!"
        })
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Login exitoso"
    assert data["user_id"] == "fake_id"

@pytest.mark.asyncio
async def test_login_wrong_password(mock_db):
    mock_execute_one, _ = mock_db
    hashed_pass = hash_password("Password123!")
    mock_execute_one.return_value = ("fake_id", "test@example.com", hashed_pass, "Test", "User")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPassword!"
        })
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Email o contraseña incorrectos"
