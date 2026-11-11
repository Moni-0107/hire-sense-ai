import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_token

def test_password_hashing_and_verification():
    plain = "SuperSecurePassword123!"
    hashed = hash_password(plain)
    
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    payload = {"sub": "user@example.com", "role": "candidate"}
    token = create_access_token(payload)
    
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "candidate"

def test_tampered_token_fails():
    token = create_access_token({"sub": "legit@example.com"})
    tampered = token[:-4] + "abcd"
    assert decode_token(tampered) is None

