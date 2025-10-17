import React, { useState } from 'react'

const GradientBox = ({ height = '100%', width = '100%', children, interactive = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`gradient-box bg-gradient-to-r from-red-900 to-black relative rounded-[50px] transition-all duration-300 ${
        interactive ? 'cursor-pointer' : ''
      } ${isHovered ? 'scale-105 shadow-2xl' : ''}`}
      style={{ height, width }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <div className="absolute h-auto w-auto inset-1 bg-gradient-to-br from-gray-900 to-black rounded-[50px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default GradientBox