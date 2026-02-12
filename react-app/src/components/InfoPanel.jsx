import React from 'react';

const InfoPanel = () => {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Feature 1: Privacy */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
        <div className="text-5xl mb-4 text-center">🔒</div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
          Bảo mật 100%
        </h3>
        <p className="text-gray-600 text-center">
          Dữ liệu video không bao giờ rời khỏi thiết bị. Tất cả xử lý AI diễn ra hoàn toàn trên trình duyệt của bạn.
        </p>
      </div>
      
      {/* Feature 2: Real-time */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
        <div className="text-5xl mb-4 text-center">⚡</div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
          Thời gian Thực
        </h3>
        <p className="text-gray-600 text-center">
          Độ trễ chỉ 50-100ms. Nhận diện ký hiệu ngay lập tức mà không cần gửi dữ liệu lên server.
        </p>
      </div>
      
      {/* Feature 3: Free */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
        <div className="text-5xl mb-4 text-center">🌟</div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
          Miễn phí Hoàn toàn
        </h3>
        <p className="text-gray-600 text-center">
          Không cần đăng ký, không giới hạn sử dụng. Chỉ cần trình duyệt web để truy cập bất cứ lúc nào.
        </p>
      </div>
      
      {/* Impact Statement */}
      <div className="md:col-span-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Phá bỏ Rào cản Giao tiếp
          </h2>
          <p className="text-xl text-indigo-100 mb-6">
            V-Sign AI được tạo ra để giúp <strong className="text-white">2.5 triệu người khiếm thính tại Việt Nam</strong> có thể giao tiếp dễ dàng hơn trong các tình huống y tế khẩn cấp.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-4xl font-bold">2.5M+</div>
              <div className="text-sm text-indigo-100 mt-1">Người khiếm thính tại VN</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-4xl font-bold">5</div>
              <div className="text-sm text-indigo-100 mt-1">Ký hiệu y tế cơ bản</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-4xl font-bold">0đ</div>
              <div className="text-sm text-indigo-100 mt-1">Chi phí triển khai</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technology Stack */}
      <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Công nghệ Sử dụng
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">⚛️</span>
            </div>
            <div className="font-semibold text-gray-800">React 18</div>
            <div className="text-xs text-gray-500">UI Framework</div>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🧠</span>
            </div>
            <div className="font-semibold text-gray-800">TensorFlow.js</div>
            <div className="text-xs text-gray-500">AI Inference</div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">✋</span>
            </div>
            <div className="font-semibold text-gray-800">MediaPipe</div>
            <div className="text-xs text-gray-500">Hand Tracking</div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🎨</span>
            </div>
            <div className="font-semibold text-gray-800">Tailwind CSS</div>
            <div className="text-xs text-gray-500">Styling</div>
          </div>
        </div>
      </div>
      
      {/* How it Works */}
      <div className="md:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Cách Hoạt động
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-indigo-600 shadow-md">
              1
            </div>
            <div className="font-semibold text-gray-800 mb-2">Thu thập Video</div>
            <div className="text-sm text-gray-600">Webcam chụp hình ảnh tay người dùng</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-indigo-600 shadow-md">
              2
            </div>
            <div className="font-semibold text-gray-800 mb-2">Trích xuất Landmarks</div>
            <div className="text-sm text-gray-600">MediaPipe phát hiện 21 điểm xương tay</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-indigo-600 shadow-md">
              3
            </div>
            <div className="font-semibold text-gray-800 mb-2">Mô hình LSTM</div>
            <div className="text-sm text-gray-600">TensorFlow.js phân tích chuỗi 30 frames</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-indigo-600 shadow-md">
              4
            </div>
            <div className="font-semibold text-gray-800 mb-2">Hiển thị Kết quả</div>
            <div className="text-sm text-gray-600">Dịch ký hiệu sang văn bản tiếng Việt</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
