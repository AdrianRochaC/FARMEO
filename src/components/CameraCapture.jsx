import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaVideo, FaStop, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import './CameraCapture.css';

const CameraCapture = ({ onCapture, onClose, tipo = 'foto' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' o 'environment'

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: tipo === 'video' ? true : false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPreview(URL.createObjectURL(blob));
      if (onCapture) {
        onCapture(file, URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = () => {
    if (!stream) return;

    const chunks = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      setPreview(URL.createObjectURL(blob));
      setRecordedChunks([]);
      if (onCapture) {
        onCapture(file, URL.createObjectURL(blob));
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordedChunks([]);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      stopCamera();
    }
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  const handleConfirm = () => {
    if (preview && onCapture) {
      // Ya se llamó onCapture cuando se capturó
      onClose();
    }
  };

  const handleCancel = () => {
    stopCamera();
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    onClose();
  };

  const handleRetake = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    startCamera();
  };

  if (preview) {
    return (
      <div className="camera-capture-overlay">
        <div className="camera-capture-container">
          <div className="camera-preview">
            {tipo === 'foto' ? (
              <img src={preview} alt="Preview" />
            ) : (
              <video src={preview} controls autoPlay />
            )}
          </div>
          <div className="camera-actions">
            <button className="btn-cancel" onClick={handleRetake}>
              <FaTimes /> Volver a Capturar
            </button>
            <button className="btn-confirm" onClick={handleConfirm}>
              <FaCheck /> Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-capture-overlay">
      <div className="camera-capture-container">
        <div className="camera-header">
          <h3>{tipo === 'foto' ? '📷 Capturar Foto' : '🎥 Grabar Video'}</h3>
          <button className="btn-close" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="camera-error">
            <p>{error}</p>
          </div>
        )}

        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={tipo === 'foto'}
            className={isRecording ? 'recording' : ''}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              <span>Grabando...</span>
            </div>
          )}
        </div>

        <div className="camera-controls">
          {tipo === 'foto' ? (
            <button 
              className="btn-capture" 
              onClick={capturePhoto}
              disabled={!stream || loading}
            >
              <FaCamera />
            </button>
          ) : (
            <>
              {!isRecording ? (
                <button 
                  className="btn-record" 
                  onClick={startRecording}
                  disabled={!stream || loading}
                >
                  <FaVideo /> Iniciar Grabación
                </button>
              ) : (
                <button 
                  className="btn-stop" 
                  onClick={stopRecording}
                  disabled={loading}
                >
                  <FaStop /> Detener
                </button>
              )}
            </>
          )}
          
          <button 
            className="btn-switch-camera" 
            onClick={toggleCamera}
            disabled={loading}
            title="Cambiar cámara"
          >
            🔄
          </button>
        </div>

        <div className="camera-footer">
          <p className="camera-hint">
            {tipo === 'foto' 
              ? 'Haz clic en el botón de cámara para capturar'
              : 'Haz clic en "Iniciar Grabación" para comenzar'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
