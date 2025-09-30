import React from 'react'

const GradientBox = ({ height = '100%', width = '100%', children }) => {
  return (
    <div
      className="gradient-box bg-[#a7a7a7] relative rounded-[50px] "
      style={{ height, width }}
    >
      <div className="absolute h-auto w-auto inset-1 bg-black rounded-[50px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};


export default GradientBox