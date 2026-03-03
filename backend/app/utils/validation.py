"""
Centralized validation utilities for API endpoints.
Provides consistent validation and error messages.
"""
from typing import Any, Optional
from fastapi import HTTPException, status
import re


def validate_email(email: str) -> str:
    """Validate email format."""
    if not email or len(email) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email es requerido"
        )
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email.strip()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Formato de email inválido"
        )
    
    return email.strip().lower()


def validate_password(password: str, min_length: int = 6) -> str:
    """Validate password strength."""
    if not password or len(password) < min_length:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"La contraseña debe tener al menos {min_length} caracteres"
        )
    
    return password


def validate_required_string(
    value: Optional[str], 
    field_name: str, 
    min_length: int = 1,
    max_length: int = 255
) -> str:
    """Validate a required string field."""
    if not value or not value.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} es requerido"
        )
    
    value = value.strip()
    
    if len(value) < min_length:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} debe tener al menos {min_length} caracteres"
        )
    
    if len(value) > max_length:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} no puede exceder {max_length} caracteres"
        )
    
    return value


def validate_uuid(value: str, field_name: str = "ID") -> str:
    """Validate UUID format."""
    if not value:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} es requerido"
        )
    
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, value.lower()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} debe ser un UUID válido"
        )
    
    return value.lower()


def validate_positive_integer(
    value: Any, 
    field_name: str,
    min_value: int = 1,
    max_value: Optional[int] = None
) -> int:
    """Validate positive integer."""
    try:
        int_value = int(value)
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} debe ser un número entero"
        ) from exc
    
    if int_value < min_value:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} debe ser al menos {min_value}"
        )
    
    if max_value and int_value > max_value:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} no puede exceder {max_value}"
        )
    
    return int_value


def validate_choice(value: str, choices: list[str], field_name: str) -> str:
    """Validate that value is one of the allowed choices."""
    if value not in choices:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} debe ser uno de: {', '.join(choices)}"
        )
    
    return value
