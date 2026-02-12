import React from 'react';

const Header = ({ fps, bufferLength, maxBuffer }) => {
  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="text-5xl">🤟</div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                V-Sign AI
              </h1>
              <p className="text-sm text-gray-600">
                Dịch Ngôn ngữ Ký hiệu Việt Nam - Thời gian Thực
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            {/* FPS Counter */}
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {fps}
              </div>
              <div className="text-xs text-gray-500 uppercase">FPS</div>
            </div>
            
            {/* Buffer Status */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {bufferLength}/{maxBuffer}
              </div>
              <div className="text-xs text-gray-500 uppercase">Frames</div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Hoạt động</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Stats */}
        <div className="md:hidden mt-3 flex justify-around text-center">
          <div>
            <div className="text-lg font-bold text-indigo-600">{fps} FPS</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{bufferLength}/{maxBuffer}</div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
