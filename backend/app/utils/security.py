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
from app.core.config import settings
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag


def sha256_hex(data_bytes: bytes) -> str:
    """
    Computes the SHA-256 hash of a byte string and returns it as a hex digest.

    :param data_bytes: The input bytes to hash.
    :return: The hexadecimal representation of the SHA-256 hash.
    """
    h = hashlib.sha256()
    h.update(data_bytes)
    return h.hexdigest()

AES_KEY = None

# --- NEW: Initialization function ---
def initialize_aes_key(key_bytes: bytes):
    """
    Initializes the AES key for the security module.
    This must be called at application startup.
    """
    global AES_KEY
    if len(key_bytes) != 32:
        raise ValueError("AES key must be 32 bytes long.")
    AES_KEY = key_bytes
    print("✅ AES key initialized successfully.")


def encrypt_aes_gcm(plaintext: bytes) -> dict[str, str]:
    """Encrypts plaintext using AES-GCM with the initialized key."""
    # --- MODIFIED: Check if the key is loaded ---
    if AES_KEY is None:
        raise RuntimeError("AES key has not been initialized.")

    aesgcm = AESGCM(AES_KEY)
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, plaintext, None)
    return {
        "nonce_b64": base64.b64encode(nonce).decode("utf-8"),
        "ciphertext_b64": base64.b64encode(ct).decode("utf-8"),
    }
    
    # ... (decrypt_aes_gcm function, modify it similarly to check for AES_KEY) ...
def decrypt_aes_gcm(encrypted_data: dict[str, str]) -> bytes:
    """Decrypts AES-GCM ciphertext using the initialized key."""
    # --- MODIFIED: Check if the key is loaded ---
    if AES_KEY is None:
        raise RuntimeError("AES key has not been initialized.")

    try:
        nonce = base64.b64decode(encrypted_data["nonce_b64"])
        ct = base64.b64decode(encrypted_data["ciphertext_b64"])
        aesgcm = AESGCM(AES_KEY)
        return aesgcm.decrypt(nonce, ct, None)
    except (KeyError, InvalidTag) as e:
        # Handle cases where decryption fails or data is malformed
        raise ValueError("Decryption failed. Ciphertext may be corrupt or the key incorrect.") from e