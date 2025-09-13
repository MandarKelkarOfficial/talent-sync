# File: app/utils/security.py

"""
Security Utilities
Author: Maddy (Originally by Gemini)

This module provides helper functions for cryptographic operations
like hashing and AES-GCM encryption.
"""
import os
import base64
import hashlib
from typing import Dict
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

def sha256_hex(data_bytes: bytes) -> str:
    """
    Computes the SHA-256 hash of a byte string and returns it as a hex digest.

    :param data_bytes: The input bytes to hash.
    :return: The hexadecimal representation of the SHA-256 hash.
    """
    h = hashlib.sha256()
    h.update(data_bytes)
    return h.hexdigest()

def encrypt_aes_gcm(plaintext: bytes) -> Dict[str, str]:
    """
    Encrypts plaintext using AES-GCM with the key from app settings.

    :param plaintext: The data to encrypt.
    :return: A dictionary containing the base64-encoded nonce and ciphertext.
    """
    if not settings.AES_KEY:
        raise RuntimeError("AES key has not been initialized.")
        
    aesgcm = AESGCM(settings.AES_KEY)
    nonce = os.urandom(12)  # GCM standard nonce size is 12 bytes
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data=None)
    
    return {
        "nonce_b64": base64.b64encode(nonce).decode("utf-8"),
        "ciphertext_b64": base64.b64encode(ciphertext).decode("utf-8"),
    }