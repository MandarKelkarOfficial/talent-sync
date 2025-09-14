# File: app/services/face_analysis.py

"""
Face Analysis Service

Author: Mandar . k
Date: 2024-10-10

This module contains functions for detecting faces in images, assessing their
quality, and generating recommendations for users. It uses the `face_recognition`
library with an OpenCV fallback.
"""
from typing import Dict, Any, List
import cv2
import numpy as np

# Conditionally import face_recognition
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("Warning: `face_recognition` library not found. Using basic OpenCV face detection.")


def analyze_face_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Analyzes an image to detect faces, extract encodings, and calculate a quality score.

    :param image_bytes: The raw bytes of the image file.
    :return: A dictionary containing analysis results.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {"error": "Invalid or unsupported image format."}

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        result = {
            "image_dimensions": {"width": image.shape[1], "height": image.shape[0]},
            "face_detected": False,
            "face_count": 0,
            "quality_score": 0.0,
        }

        if FACE_RECOGNITION_AVAILABLE:
            face_locations = face_recognition.face_locations(rgb_image)
            result.update({
                "face_locations": face_locations,
                "face_count": len(face_locations),
                "face_detected": len(face_locations) > 0,
            })
            
            if len(face_locations) == 1:  # Ideal case: exactly one face
                top, right, bottom, left = face_locations[0]
                face_area = (right - left) * (bottom - top)
                image_area = image.shape[0] * image.shape[1]
                face_ratio = face_area / image_area
                
                # Quality score is higher if the face is well-framed
                if 0.1 <= face_ratio <= 0.7:
                    result["quality_score"] = min(face_ratio * 2, 1.0)
                else:
                    result["quality_score"] = 0.3 # Penalize if too small or too large
        else:
            # Fallback to basic OpenCV Haar Cascade for face detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            result.update({
                "face_locations": faces.tolist(),
                "face_count": len(faces),
                "face_detected": len(faces) > 0,
            })

            if len(faces) == 1:
                result["quality_score"] = 0.6  # Assign a baseline score for basic detection

        return result

    except Exception as e:
        return {"error": f"An unexpected error occurred during face analysis: {str(e)}"}


def get_face_recommendations(analysis: Dict[str, Any]) -> List[str]:
    """
    Provides user-friendly recommendations based on face analysis results.

    :param analysis: The result dictionary from `analyze_face_image`.
    :return: A list of string recommendations.
    """
    recommendations = []
    
    if not analysis.get("face_detected"):
        recommendations.append("No face detected. Please ensure your face is clearly visible and facing the camera.")
    elif analysis.get("face_count", 0) > 1:
        recommendations.append("Multiple faces detected. Please ensure only your face is in the picture.")
    
    if analysis.get("quality_score", 0.0) < 0.5:
        recommendations.append("Image quality is low. Try using better lighting and a clearer background.")
        recommendations.append("Make sure your face is not too close or too far from the camera.")
    
    if not recommendations:
        recommendations.append("Great! Your face image looks good for verification.")
        
    return recommendations