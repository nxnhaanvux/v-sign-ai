import React from 'react';
import Webcam from 'react-webcam';

const CameraSection = ({ webcamRef, canvasRef, isHandDetected, sequenceBuffer, maxBuffer }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📹</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Camera</h2>
              <p className="text-indigo-100 text-sm">Giơ tay lên để bắt đầu</p>
            </div>
          </div>
          
          {/* Hand Detection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isHandDetected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white text-sm font-medium">
              {isHandDetected ? 'Phát hiện tay' : 'Không có tay'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Video Feed */}
      <div className="relative bg-gray-900">
        {/* Webcam */}
        <Webcam
          ref={webcamRef}
          className="w-full h-auto"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user'
          }}
          mirrored={true}
        />
        
        {/* Overlay Canvas for Landmarks */}
        <canvas
          ref={canvasRef}
          style={{ transform: 'scaleX(-1)' }}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-auto landmark-canvas"
        />
        
        {/* Buffer Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">
              Đang thu thập frames: {sequenceBuffer.length}/{maxBuffer}
            </span>
            <span className="text-white text-sm">
              {sequenceBuffer.length >= maxBuffer ? '✓ Sẵn sàng dự đoán' : 'Đang chờ...'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                sequenceBuffer.length >= maxBuffer ? 'bg-green-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${(sequenceBuffer.length / maxBuffer) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* No Hand Detected Overlay */}
        {!isHandDetected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center bg-white/90 rounded-xl p-6 max-w-sm mx-4">
              <div className="text-6xl mb-4">✋</div>
              <p className="text-gray-800 font-semibold text-lg mb-2">
                Không phát hiện tay
              </p>
              <p className="text-gray-600 text-sm">
                Giơ tay lên trước camera để bắt đầu nhận diện ký hiệu
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl mt-1">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2">Hướng dẫn Sử dụng:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Đảm bảo ánh sáng đủ và nền tối giản</li>
              <li>• Giữ tay trong khung hình, cách camera khoảng 50-80cm</li>
              <li>• Thực hiện ký hiệu chậm rãi và rõ ràng</li>
              <li>• Hệ thống cần 30 frames (khoảng 1 giây) để nhận diện</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraSection;