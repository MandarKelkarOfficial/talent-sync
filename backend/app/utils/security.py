# File: app/utils/security.py

"""
Security Utilities
Author: Mandar K.
Date: 2024-10-10

This module provides helper functions for cryptographic operations
like hashing and AES-GCM encryption.
"""
import os
import base64
import hashlib
import logging
from typing import Dict
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

log = logging.getLogger(__name__)

# This global variable will be set at startup by main.py
AES_KEY: bytes | None = None

def initialize_aes_key(key_bytes: bytes):
    """
    Initializes the global AES key for the security module.
    This must be called at application startup.
    """
    global AES_KEY
    if len(key_bytes) != 32:
        raise ValueError("AES key must be 32 bytes long (AES-256).")
    AES_KEY = key_bytes
    log.info("✅ AES key initialized successfully.")


def sha256_hex(data_bytes: bytes) -> str:
    """
    Computes the SHA-256 hash of a byte string and returns it as a hex digest.
    """
    h = hashlib.sha256()
    h.update(data_bytes)
    return h.hexdigest()


def encrypt_aes_gcm(plaintext: bytes) -> dict[str, str]:
    """
    Encrypts plaintext using AES-GCM with the initialized global key.
    
    Returns:
        A dictionary containing the base64-encoded nonce and ciphertext.
    """
    if AES_KEY is None:
        log.error("Attempted to encrypt before AES key was initialized.")
        raise RuntimeError("AES key has not been initialized.")

    aesgcm = AESGCM(AES_KEY)
    nonce = os.urandom(12) # 12-byte nonce
    ct = aesgcm.encrypt(nonce, plaintext, None)
    
    return {
        "nonce_b64": base64.b64encode(nonce).decode("utf-8"),
        "ciphertext_b64": base64.b64encode(ct).decode("utf-8"),
    }

def decrypt_aes_gcm(encrypted_data: dict[str, str]) -> bytes:
    """
    Decrypts AES-GCM ciphertext using the initialized global key.
    
    Args:
        encrypted_data: A dict with 'nonce_b64' and 'ciphertext_b64'.
    
    Returns:
        The decrypted plaintext as bytes.
    """
    if AES_KEY is None:
        log.error("Attempted to decrypt before AES key was initialized.")
        raise RuntimeError("AES key has not been initialized.")

    try:
        nonce = base64.b64decode(encrypted_data["nonce_b64"])
        ct = base64.b64decode(encrypted_data["ciphertext_b64"])
        aesgcm = AESGCM(AES_KEY)
        return aesgcm.decrypt(nonce, ct, None)
    except (KeyError, InvalidTag, Exception) as e:
        log.error(f"Decryption failed: {e}")
        raise ValueError("Decryption failed. Ciphertext may be corrupt or the key incorrect.") from e
