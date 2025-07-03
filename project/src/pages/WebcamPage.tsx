import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import ConfidenceGauge from '../components/ConfidenceGauge';

const WebcamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCapture, setHasCapture] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    label: 'PUB' | 'NO PUB';
    confidence: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setErrorMessage(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setErrorMessage('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setHasCapture(true);
    analyzeImage();
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    
    // In a real app, you would send the image to your backend for analysis
    // This is a mock prediction
    setTimeout(() => {
      const isPub = Math.random() > 0.5;
      const mockConfidence = Math.floor(60 + Math.random() * 35);
      
      setResult({
        label: isPub ? 'PUB' : 'NO PUB',
        confidence: mockConfidence
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const resetCapture = () => {
    setHasCapture(false);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/dashboard" className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-200">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Retour au dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Analyse par webcam
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Capturez une image avec votre webcam pour l'analyser
          </p>
        </div>

        <div className="relative">
          {errorMessage && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 text-center">
              {errorMessage}
              <button 
                onClick={startCamera}
                className="ml-2 underline"
              >
                Réessayer
              </button>
            </div>
          )}

          <div className="relative bg-black aspect-video max-h-[60vh] flex justify-center items-center overflow-hidden">
            {!hasCapture ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isCameraActive ? 'block' : 'hidden'}`}
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            )}
            
            {!isCameraActive && !errorMessage && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
            <div className="flex justify-between items-center">
              {!hasCapture ? (
                <button
                  onClick={captureImage}
                  disabled={!isCameraActive}
                  className={`flex items-center justify-center mx-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors duration-200 ${
                    !isCameraActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capturer
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={resetCapture}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Nouvelle capture
                  </button>
                  
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className={`px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 ${
                      isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isAnalyzing ? 'Analyse...' : 'Analyser à nouveau'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Result Section */}
            {result && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Résultat de l'analyse
                </h2>
                
                <div className="flex flex-col sm:flex-row items-center justify-around">
                  <ConfidenceGauge 
                    value={result.confidence} 
                    label={result.label} 
                  />
                  
                  <div className="mt-4 sm:mt-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500 dark:text-gray-400">Classification:</div>
                      <div className={`font-medium ${
                        result.label === 'PUB' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {result.label}
                      </div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Confiance:</div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        {result.confidence}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamPage;