import { useState, useCallback, useRef, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { useThrottle } from './usePerformanceOptimization';

/**
 * Hook para optimizar el rendimiento de la cámara
 * Incluye throttling, resolución adaptativa y gestión de memoria
 */
export const useCameraOptimization = (options = {}) => {
  const {
    enableThrottling = true,
    throttleDelay = 100,
    adaptiveResolution = true,
    maxResolution = { width: 1920, height: 1080 },
    minResolution = { width: 640, height: 480 },
    quality = 0.8,
    enableFlash = false,
    enableFocus = true,
    enableZoom = true,
    maxZoom = 3,
    minZoom = 1,
  } = options;

  const [isReady, setIsReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [resolution, setResolution] = useState(maxResolution);
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef(null);
  const lastCaptureTime = useRef(0);

  // Solicitar permisos
  const requestPermissions = useCallback(async() => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  }, []);

  // Cambiar tipo de cámara
  const toggleCameraType = useCallback(() => {
    setCameraType(current =>
      current === Camera.Constants.Type.back ?
        Camera.Constants.Type.front :
        Camera.Constants.Type.back,
    );
  }, []);

  // Cambiar flash
  const toggleFlash = useCallback(() => {
    if (!enableFlash) return;

    setFlashMode(current =>
      current === Camera.Constants.FlashMode.off ?
        Camera.Constants.FlashMode.on :
        Camera.Constants.FlashMode.off,
    );
  }, [enableFlash]);

  // Ajustar zoom
  const adjustZoom = useCallback((delta) => {
    if (!enableZoom) return;

    setZoom(current => {
      const newZoom = current + delta;
      return Math.max(minZoom, Math.min(maxZoom, newZoom));
    });
  }, [enableZoom, minZoom, maxZoom]);

  // Ajustar foco
  const adjustFocus = useCallback((x, y) => {
    if (!enableFocus) return;

    setFocus({ x, y });
  }, [enableFocus]);

  // Ajustar resolución según el rendimiento
  const adjustResolution = useCallback((performance) => {
    if (!adaptiveResolution) return;

    if (performance < 0.5) {
      // Rendimiento bajo, reducir resolución
      setResolution(minResolution);
    } else if (performance > 0.8) {
      // Rendimiento alto, aumentar resolución
      setResolution(maxResolution);
    }
  }, [adaptiveResolution, minResolution, maxResolution]);

  // Capturar foto con throttling
  const capturePhoto = useCallback(async() => {
    if (!cameraRef.current || isCapturing) return null;

    const now = Date.now();
    if (enableThrottling && now - lastCaptureTime.current < throttleDelay) {
      return null;
    }

    lastCaptureTime.current = now;
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality,
        base64: false,
        skipProcessing: false,
      });

      return photo;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error capturing photo:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, enableThrottling, throttleDelay, quality]);

  // Throttle para captura
  const throttledCapturePhoto = useThrottle(capturePhoto, throttleDelay);

  // Inicializar cámara
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  return {
    isReady,
    hasPermission,
    cameraType,
    flashMode,
    zoom,
    focus,
    resolution,
    isCapturing,
    cameraRef,
    requestPermissions,
    toggleCameraType,
    toggleFlash,
    adjustZoom,
    adjustFocus,
    adjustResolution,
    capturePhoto: throttledCapturePhoto,
    setReady: setIsReady,
  };
};
