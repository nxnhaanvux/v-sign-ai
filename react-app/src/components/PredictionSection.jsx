import React from 'react';

const PredictionSection = ({ prediction, confidence, labels, sequenceBuffer, isHandDetected }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Prediction Display */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">💬</div>
            <h2 className="text-2xl font-bold text-white">Kết quả Dịch</h2>
          </div>
        </div>
        
        <div className="p-6">
          {/* Main Prediction Display */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-8 text-center min-h-[280px] flex flex-col justify-center shadow-lg">
            {prediction ? (
              <div className="animate-fade-in">
                {/* Prediction Text */}
                <div className="text-6xl font-bold text-white mb-4 prediction-result">
                  {prediction}
                </div>
                
                {/* Confidence */}
                <div className="text-2xl text-white/90 mb-4">
                  Độ tin cậy: {(confidence * 100).toFixed(1)}%
                </div>
                
                {/* Confidence Bar */}
                <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                
                {/* Confidence Level Indicator */}
                <div className="mt-4">
                  {confidence >= 0.9 && (
                    <div className="inline-flex items-center space-x-2 bg-green-500/30 px-4 py-2 rounded-full">
                      <span className="text-white text-sm font-semibold">✓ Rất chắc chắn</span>
                    </div>
                  )}
                  {confidence >= 0.7 && confidence < 0.9 && (
                    <div className="inline-flex items-center space-x-2 bg-yellow-500/30 px-4 py-2 rounded-full">
                      <span className="text-white text-sm font-semibold">⚡ Khá chắc chắn</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-white/70">
                {!isHandDetected ? (
                  <div>
                    <div className="text-5xl mb-4">👋</div>
                    <div className="text-xl">Không phát hiện ký hiệu...</div>
                    <div className="text-sm mt-2">Giơ tay lên để bắt đầu</div>
                  </div>
                ) : sequenceBuffer.length < 30 ? (
                  <div>
                    <div className="text-5xl mb-4">🔄</div>
                    <div className="text-xl">Đang thu thập dữ liệu...</div>
                    <div className="text-sm mt-2">
                      {sequenceBuffer.length}/30 frames
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-5xl mb-4">🤔</div>
                    <div className="text-xl">Đang phân tích...</div>
                    <div className="text-sm mt-2">
                      Độ tin cậy chưa đủ cao
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Gesture List */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📚</div>
            <h3 className="text-xl font-bold text-white">Danh sách Ký hiệu</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {Object.values(labels).map((label, idx) => {
              const isActive = prediction === label;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isActive ? 'bg-white' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-semibold text-lg">{label}</span>
                    </div>
                    {isActive && (
                      <div className="text-2xl animate-bounce">✓</div>
                    )}
                  </div>
                  
                  {/* Medical Context */}
                  {isActive && (
                    <div className="mt-2 text-sm text-white/90 pl-6">
                      {label === 'Đau' && '→ Chỉ vào vùng đau'}
                      {label === 'Bác sĩ' && '→ Cần gặp bác sĩ'}
                      {label === 'Cần giúp' && '→ Cần trợ giúp khẩn cấp'}
                      {label === 'Thuốc' && '→ Cần thuốc/điều trị'}
                      {label === 'Cảm ơn' && '→ Cảm ơn sự giúp đỡ'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Thống kê
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-3xl font-bold">{Object.keys(labels).length}</div>
            <div className="text-sm text-indigo-100">Ký hiệu</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-3xl font-bold">{prediction ? '1' : '0'}</div>
            <div className="text-sm text-indigo-100">Đang nhận diện</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionSection;
