import React from 'react';

const LoadingScreen = ({ progress }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-pulse-slow">
          <div className="text-8xl mb-4">🤟</div>
          <h1 className="text-5xl font-bold text-white mb-2">
            V-Sign AI
          </h1>
          <p className="text-xl text-indigo-100">
            Dịch Ngôn ngữ Ký hiệu Việt Nam
          </p>
        </div>
        
        {/* Loading Progress */}
        <div className="max-w-md mx-auto px-8">
          <div className="bg-white bg-opacity-20 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="text-white text-lg font-medium">
            {progress < 30 && "Đang tải mô hình AI..."}
            {progress >= 30 && progress < 60 && "Đang khởi tạo TensorFlow.js..."}
            {progress >= 60 && progress < 90 && "Đang chuẩn bị MediaPipe..."}
            {progress >= 90 && "Sẵn sàng!"}
          </div>
          
          <div className="text-indigo-100 text-sm mt-2">
            {progress}%
          </div>
        </div>
        
        {/* Loading Spinner */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Tech Info */}
        <div className="mt-12 text-indigo-100 text-sm">
          <p>Powered by TensorFlow.js + MediaPipe Hands</p>
          <p className="mt-1">100% Client-side Processing - Dữ liệu không rời khỏi thiết bị</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
