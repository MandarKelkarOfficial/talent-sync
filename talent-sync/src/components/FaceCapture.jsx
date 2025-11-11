/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

const FaceCapture = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState(null);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please check your camera settings.');
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Basic face detection using video dimensions and positioning
  const detectFace = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState !== 4 || !cameraReady) return false;

    // Simple face detection placeholder - in production, use a proper face detection library
    // For now, we'll assume a face is "detected" if video is playing and has reasonable dimensions
    return video.currentTime > 0 && !video.paused && !video.ended && video.videoWidth > 0;
  }, [cameraReady]);

  // Capture image
  const captureImage = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !cameraReady) return null;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }, [cameraReady]);

  // Start capture process with countdown
  const startCapture = useCallback(async () => {
    if (!detectFace()) {
      setError('Please position your face in the camera view and ensure the camera is working.');
      return;
    }

    setIsCapturing(true);
    setError(null);
    
    // 3-second countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCountdown(null);
    
    // Capture the image
    const blob = await captureImage();
    if (blob && onCapture) {
      setCaptureComplete(true);
      setTimeout(() => {
        onCapture(blob);
        setIsCapturing(false);
        setCaptureComplete(false);
      }, 1000);
    } else {
      setError('Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  }, [detectFace, captureImage, onCapture]);

  // Face detection loop
  useEffect(() => {
    if (!isOpen || !cameraReady) return;

    const interval = setInterval(() => {
      setFaceDetected(detectFace());
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, detectFace, cameraReady]);

  // Initialize camera when component opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isCapturing}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Face Capture</h2>
          <p className="text-gray-600">Position your face in the camera and stay still</p>
        </div>

        {/* Camera View */}
        <div className="relative mb-6">
          <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-video">
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!cameraReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
            />
            
            {/* Face detection overlay */}
            {cameraReady && (
              <div className={`absolute inset-4 border-2 rounded-lg transition-colors duration-300 ${
                faceDetected ? 'border-green-400' : 'border-red-400'
              }`}>
                <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 transition-colors duration-300 ${
                  faceDetected ? 'border-green-400' : 'border-red-400'
                }`}></div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 transition-colors duration-300 ${
                  faceDetected ? 'border-green-400' : 'border-red-400'
                }`}></div>
                <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 transition-colors duration-300 ${
                  faceDetected ? 'border-green-400' : 'border-red-400'
                }`}></div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 transition-colors duration-300 ${
                  faceDetected ? 'border-green-400' : 'border-red-400'
                }`}></div>
              </div>
            )}

            {/* Countdown overlay */}
            {countdown && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-8xl font-bold animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Capture complete overlay */}
            {captureComplete && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg font-semibold">Captured!</p>
                </div>
              </div>
            )}
          </div>

          {/* Face detection status */}
          {cameraReady && (
            <div className="mt-3 flex items-center justify-center">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                faceDetected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  faceDetected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                {faceDetected ? 'Face detected' : 'No face detected'}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isCapturing}
          >
            Cancel
          </button>
          <button
            onClick={startCapture}
            disabled={!faceDetected || isCapturing || !cameraReady || error}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isCapturing ? 'Capturing...' : 'Capture'}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Make sure your face is well-lit and clearly visible</p>
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default FaceCapture;