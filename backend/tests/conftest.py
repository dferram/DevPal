import pytest

@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """
    Configura variables de entorno para que los tests no dependan 
    del .env de desarrollo o producción y usen credenciales falsas
    para validaciones de settings (si es necesario).
    """
    monkeypatch.setenv("DB_HOST", "test_db_host")
    monkeypatch.setenv("DB_NAME", "test_db")
    monkeypatch.setenv("DB_USER", "test_user")
    monkeypatch.setenv("DB_PASSWORD", "test_pass")
    monkeypatch.setenv("GEMINI_API_KEY", "fake_gemini_key")
    monkeypatch.setenv("ENVIRONMENT", "testing")
