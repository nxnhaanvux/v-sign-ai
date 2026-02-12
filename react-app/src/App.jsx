import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as HandsModule from '@mediapipe/hands';
import * as CameraModule from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';

// Import components
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import CameraSection from './components/CameraSection';
import PredictionSection from './components/PredictionSection';
import InfoPanel from './components/InfoPanel';

function App() {
  // ===== REFS =====
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  
  // ===== STATE =====
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState({});
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [sequenceBuffer, setSequenceBuffer] = useState([]);
  const [fps, setFps] = useState(0);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [error, setError] = useState(null);
  
  // ===== CONSTANTS =====
  const SEQUENCE_LENGTH = 30;
  const CONFIDENCE_THRESHOLD = 0.7;
  const MODEL_PATH = './tfjs_model/model.json';
  const LABELS_PATH = './tfjs_model/labels.json';
  
  // ===== LOAD MODEL & LABELS =====
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingProgress(10);
        
        // Load TensorFlow.js model
        console.log('Loading TensorFlow.js model...');
        const loadedModel = await tf.loadLayersModel(MODEL_PATH);
        setModel(loadedModel);
        console.log('✓ Model loaded successfully');
        setLoadingProgress(50);
        
        // Warm up the model
        console.log('Warming up model...');
        const dummyInput = tf.zeros([1, SEQUENCE_LENGTH, 63]);
        loadedModel.predict(dummyInput).dispose();
        dummyInput.dispose();
        console.log('✓ Model warmed up');
        setLoadingProgress(70);
        
        // Load labels
        console.log('Loading labels...');
        const response = await fetch(LABELS_PATH);
        if (!response.ok) {
          throw new Error('Failed to load labels');
        }
        const labelData = await response.json();
        setLabels(labelData);
        console.log('✓ Labels loaded:', labelData);
        setLoadingProgress(90);
        
        // Initialize MediaPipe Hands
        console.log('Initializing MediaPipe Hands...');
        await initializeMediaPipe();
        console.log('✓ MediaPipe initialized');
        setLoadingProgress(100);
        
        setTimeout(() => setIsLoading(false), 500);
        
      } catch (error) {
        console.error('Error loading resources:', error);
        setError(`Không thể tải mô hình AI: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    loadResources();
    
    // Cleanup
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);
  
  // ===== INITIALIZE MEDIAPIPE =====
  const initializeMediaPipe = async () => {
        // Kiểm tra constructor an toàn cho Production
    const HandsConstructor = HandsModule.Hands || window.Hands;

    const hands = new HandsConstructor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,           // Sửa lỗi chính tả và bật 2 tay
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });
    
    hands.onResults(onHandsResults);
    handsRef.current = hands;
  };
  
  // ===== START CAMERA =====
  useEffect(() => {
    if (!isLoading && webcamRef.current?.video && handsRef.current) {
      console.log('Starting camera...');
      
      const CameraConstructor = CameraModule.Camera || window.Camera;
      const camera = new CameraConstructor(webcamRef.current.video, {
          onFrame: async () => {
              if (webcamRef.current?.video && handsRef.current) {
                  await handsRef.current.send({ image: webcamRef.current.video });
              }
          },
          width: 640,
          height: 480
      });
      
      camera.start();
      cameraRef.current = camera;
      
      // FPS counter
      let frameCount = 0;
      let lastTime = Date.now();
      
      const fpsInterval = setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - lastTime) / 1000;
        const currentFps = Math.round(frameCount / deltaTime);
        setFps(currentFps);
        frameCount = 0;
        lastTime = now;
      }, 1000);
      
      const incrementFrame = () => {
        frameCount++;
        requestAnimationFrame(incrementFrame);
      };
      incrementFrame();
      
      return () => {
        clearInterval(fpsInterval);
        if (cameraRef.current) {
          cameraRef.current.stop();
        }
      };
    }
  }, [isLoading]);
  
  // ===== PROCESS HAND LANDMARKS =====
  const onHandsResults = useCallback((results) => {
    // Draw landmarks on canvas
    drawLandmarksOnCanvas(results);
    
    // Check if hand is detected
    const handDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
    setIsHandDetected(handDetected);
    
    if (handDetected) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Flatten landmarks to 63-dimensional vector
      const flattenedLandmarks = landmarks.flatMap(lm => [lm.x, lm.y, lm.z]);
      
      // Add to sequence buffer
      setSequenceBuffer(prev => {
        const newBuffer = [...prev, flattenedLandmarks];
        
        // Keep only last SEQUENCE_LENGTH frames
        if (newBuffer.length > SEQUENCE_LENGTH) {
          newBuffer.shift();
        }
        
        // Predict when buffer is full
        if (newBuffer.length === SEQUENCE_LENGTH && model) {
          predictGesture(newBuffer);
        }
        
        return newBuffer;
      });
    } else {
      // No hand detected - reset buffer and prediction
      setSequenceBuffer([]);
      setPrediction('');
      setConfidence(0);
    }
  }, [model]);
  
  // ===== DRAW LANDMARKS ON CANVAS =====
  const drawLandmarksOnCanvas = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.save();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks) {
  // Lặp qua tất cả các bàn tay tìm thấy
      results.multiHandLandmarks.forEach((landmarks) => {
        drawConnectors(ctx, landmarks, HandsModule.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1
        });
      });
    }
    
    ctx.restore();
  };
  
  // ===== PREDICT GESTURE =====
  const predictGesture = async (sequence) => {
    if (!model) return;
    
    try {
      // Convert to tensor: shape [1, 30, 63]
      const inputTensor = tf.tensor3d([sequence]);
      
      // Predict
      const predictions = model.predict(inputTensor);
      const predictionsArray = await predictions.data();
      
      // Get class with highest probability
      const maxIndex = predictionsArray.indexOf(Math.max(...predictionsArray));
      const maxConfidence = predictionsArray[maxIndex];
      
      // Update UI only if confidence is high enough
      if (maxConfidence >= CONFIDENCE_THRESHOLD) {
        setPrediction(labels[maxIndex] || '');
        setConfidence(maxConfidence);
      } else {
        setPrediction('');
        setConfidence(0);
      }
      
      // Cleanup tensors
      inputTensor.dispose();
      predictions.dispose();
      
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };
  
  // ===== RENDER =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-red-900 mb-4 text-center">
            Lỗi Tải Mô hình
          </h2>
          <p className="text-gray-700 mb-6 text-center">{error}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Hướng dẫn khắc phục:</strong>
            </p>
            <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
              <li>Đảm bảo thư mục <code className="bg-red-100 px-1 rounded">public/tfjs_model/</code> tồn tại</li>
              <li>Kiểm tra file <code className="bg-red-100 px-1 rounded">model.json</code> và <code className="bg-red-100 px-1 rounded">labels.json</code></li>
              <li>Chạy script <code className="bg-red-100 px-1 rounded">convert_to_tfjs.py</code> để tạo mô hình</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Tải lại Trang
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <Header fps={fps} bufferLength={sequenceBuffer.length} maxBuffer={SEQUENCE_LENGTH} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Section - 2 columns */}
          <div className="lg:col-span-2">
            <CameraSection
              webcamRef={webcamRef}
              canvasRef={canvasRef}
              isHandDetected={isHandDetected}
              sequenceBuffer={sequenceBuffer}
              maxBuffer={SEQUENCE_LENGTH}
            />
          </div>
          
          {/* Prediction Section - 1 column */}
          <div className="lg:col-span-1">
            <PredictionSection
              prediction={prediction}
              confidence={confidence}
              labels={labels}
              sequenceBuffer={sequenceBuffer}
              isHandDetected={isHandDetected}
            />
          </div>
        </div>
        
        {/* Info Panel */}
        <InfoPanel />
      </div>
      
      {/* Footer */}
      <footer className="bg-white bg-opacity-80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              <strong className="text-indigo-600">V-Sign AI</strong> - Phá bỏ rào cản giao tiếp cho 2.5 triệu người khiếm thính tại Việt Nam
            </p>
            <p className="text-sm">
              Công nghệ: React + MediaPipe Hands + TensorFlow.js | 
              <span className="text-green-600 font-semibold"> 100% Client-side Processing</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © 2024 V-Sign AI Team. Mã nguồn mở - MIT License
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;