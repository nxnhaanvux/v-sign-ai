import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as HandsModule from '@mediapipe/hands';
import * as CameraModule from '@mediapipe/camera_utils';
import * as DrawingModule from '@mediapipe/drawing_utils';
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
  const modelRef = useRef(null);
  const labelsRef = useRef({});
  
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
  const MODEL_PATH = '/tfjs_model/model.json';
  const LABELS_PATH = '/tfjs_model/labels.json';
  
  // ===== LOAD MODEL & LABELS =====
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingProgress(10);
        
        // Load TensorFlow.js model
        console.log('Loading TensorFlow.js model...');
        const loadedModel = await tf.loadLayersModel(MODEL_PATH);
        setModel(loadedModel);
        modelRef.current = loadedModel;
        console.log('✓ Model loaded successfully');
        setLoadingProgress(50);
        
        // Warm up the model
        console.log('Warming up model...');
        const dummyInput = tf.zeros([1, 30, 126]); // 126 thay vì 63
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
        labelsRef.current = labelData;
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
      locateFile: (file) => {
        const version = HandsModule.VERSION || '0.4.1646424915'; 
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${version}/${file}`;
      }
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
      drawLandmarksOnCanvas(results);
      
      const handDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
      setIsHandDetected(handDetected);
      
      if (handDetected) {
          let flattenedLandmarks;
          
          // Xử lý 1 hoặc 2 tay thành vector 126 chiều
          if (results.multiHandLandmarks.length === 1) {
              const hand1 = results.multiHandLandmarks[0].flatMap(lm => [lm.x, lm.y, lm.z]);
              const hand2Padding = new Array(63).fill(0);
              flattenedLandmarks = [...hand1, ...hand2Padding];
          } else {
              const hand1 = results.multiHandLandmarks[0].flatMap(lm => [lm.x, lm.y, lm.z]);
              const hand2 = results.multiHandLandmarks[1].flatMap(lm => [lm.x, lm.y, lm.z]);
              flattenedLandmarks = [...hand1, ...hand2];
          }
          
          setSequenceBuffer(prev => {
              const newBuffer = [...prev, flattenedLandmarks];
              
              // In ra để xem số frame đang chạy (Rất hữu ích để debug)
              console.log(`Đang gom frame: ${newBuffer.length}/30`);
              
              if (newBuffer.length > SEQUENCE_LENGTH) {
                  newBuffer.shift();
              }
              
              if (newBuffer.length === SEQUENCE_LENGTH && modelRef.current) {
                  console.log("🟢 Đã gom đủ 30 frames! Bắt đầu dự đoán...");
                  predictGesture(newBuffer);
              }
              
              return newBuffer;
          });
      } else {
    // KHI MẤT DẤU TAY: 
    // Chúng ta KHÔNG xóa mảng sequenceBuffer nữa, cứ giữ đó chờ tay xuất hiện lại.
    // Chỉ cần ẩn đi kết quả chữ trên màn hình thôi.
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks) {
      // Thử lấy hàm vẽ từ nhiều nguồn để tránh lỗi Production
      const drawConnect = DrawingModule.drawConnectors || window.drawConnectors;
      const drawLand = DrawingModule.drawLandmarks || window.drawLandmarks;
      const connections = HandsModule.HAND_CONNECTIONS || window.HAND_CONNECTIONS;

      if (drawConnect && drawLand) {
        results.multiHandLandmarks.forEach((landmarks) => {
          // Vẽ dây xanh (Connectors)
          drawConnect(ctx, landmarks, connections, {
            color: '#00FF00',
            lineWidth: 4
          });

          // Vẽ điểm đỏ (Landmarks)
          drawLand(ctx, landmarks, {
            color: '#FF0000',
            lineWidth: 2,
            radius: 5
          });
        });
      } else {
        console.error("DrawingUtils not loaded properly");
      }
    }
    ctx.restore();
  };
  
  const predictGesture = async (sequence) => {
    if (!modelRef.current) return;
    
    try {
      const inputTensor = tf.tensor3d([sequence], [1, 30, 126]);
      
      const predictions = modelRef.current.predict(inputTensor);
      const predictionsArray = await predictions.data();
      
      const maxIndex = predictionsArray.indexOf(Math.max(...predictionsArray));
      const maxConfidence = predictionsArray[maxIndex];
      const gestureName = labelsRef.current[maxIndex];
      
      console.log(`🤖 Đoán: ${gestureName} - Tự tin: ${(maxConfidence * 100).toFixed(2)}%`);
      
      if (maxConfidence >= CONFIDENCE_THRESHOLD) { 
        console.log("✅ Đủ tự tin! BẮT ĐẦU IN CHỮ LÊN MÀN HÌNH NÀY:", gestureName);
        setPrediction(gestureName); // Lệnh này sẽ yêu cầu giao diện hiện chữ
        setConfidence(maxConfidence);
      } else {
        console.log("⚠️ Tự tin quá thấp, không in!");
      }
      
      // CHỈ HIỂN THỊ KHI ĐỦ TỰ TIN
      if (maxConfidence >= CONFIDENCE_THRESHOLD) { 
        setPrediction(gestureName || '');
        setConfidence(maxConfidence);
      } 
      // XÓA KHỐI ELSE ĐI! 
      // Không gọi setPrediction('') ở đây nữa để giữ lại chữ trên màn hình cho mắt kịp đọc.
      else {
        console.log("⚠️ Tự tin thấp -> Bỏ qua, giữ nguyên chữ cũ trên màn hình");
      }
      
      inputTensor.dispose();
      predictions.dispose();
      
    } catch (error) {
      console.error('Lỗi khi dự đoán:', error);
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