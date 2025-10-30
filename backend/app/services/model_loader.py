# File: app/services/model_loader.py

"""
Hugging Face Model Loader and Status Service

Author: Mandar K.
Date: 2025-09-15

This module runs a background task to periodically "warm up" the Hugging Face
Inference API models to prevent them from going into a cold state. It also
provides a mechanism to check the current status of each model.
"""

import asyncio
import httpx
from enum import Enum
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.core.config import settings

class ModelStatus(Enum):
    """Enumeration for the status of a model."""
    SLEEPING = "SLEEPING"
    LOADING = "LOADING"
    AWAKE = "AWAKE"
    FAILED = "FAILED"

# --- Configuration ---
# Single source of truth for the models we rely on.
MODELS_TO_MONITOR: List[Dict[str, str]] = [
    {
        "name": "microsoft/trocr-base-printed",
        "url": "https://api-inference.huggingface.co/models/microsoft/trocr-base-printed"
    },
    {
        "name": "microsoft/trocr-small-printed",
        "url": "https://api-inference.huggingface.co/models/microsoft/trocr-small-printed"
    }
]

# In-memory store for the current status of each model.
MODEL_STATUS: Dict[str, Dict[str, Any]] = {
    model["name"]: {
        "status": ModelStatus.SLEEPING,
        "last_checked": None,
        "url": model["url"]
    }
    for model in MODELS_TO_MONITOR
}

async def warm_up_models():
    """
    A background task that runs indefinitely to keep models awake.
    It sends a lightweight request to each model endpoint periodically.
    """
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    # A very small, blank image to send as a lightweight ping.
    blank_image_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'

    print("🚀 Model Warmer Service started.")
    while True:
        for model in MODELS_TO_MONITOR:
            model_name = model["name"]
            url = model["url"]
            print(f"Pinging model: {model_name}...")
            
            MODEL_STATUS[model_name]["status"] = ModelStatus.LOADING
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(url, headers=headers, data=blank_image_bytes)
                    
                    if response.status_code == 200:
                        MODEL_STATUS[model_name]["status"] = ModelStatus.AWAKE
                        print(f"✅ Model {model_name} is AWAKE.")
                    elif response.status_code == 503:
                        MODEL_STATUS[model_name]["status"] = ModelStatus.LOADING
                        print(f"⏳ Model {model_name} is still loading (503). Will retry.")
                    else:
                        MODEL_STATUS[model_name]["status"] = ModelStatus.FAILED
                        print(f"❌ Model {model_name} FAILED with status: {response.status_code}.")
                        
            except Exception as e:
                MODEL_STATUS[model_name]["status"] = ModelStatus.FAILED
                print(f"❌ Error pinging {model_name}: {e}")
            
            MODEL_STATUS[model_name]["last_checked"] = datetime.now(timezone.utc).isoformat()
        
        # Wait for 5 minutes before the next round of pings.
        await asyncio.sleep(300)

def get_models_status() -> Dict[str, Any]:
    """Returns the current status of all monitored models."""
    # Convert Enum members to strings for JSON serialization
    return {
        name: {
            "status": data["status"].value,
            "last_checked": data["last_checked"]
        }
        for name, data in MODEL_STATUS.items()
    }

def get_best_available_model() -> Optional[Dict[str, str]]:
    """
    Finds the best model that is currently awake.
    It prioritizes models earlier in the MODELS_TO_MONITOR list.
    """
    for model_data in MODELS_TO_MONITOR:
        model_name = model_data["name"]
        if MODEL_STATUS.get(model_name, {}).get("status") == ModelStatus.AWAKE:
            return model_data
    return None
