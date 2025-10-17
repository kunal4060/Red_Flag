import React, { useState } from 'react'

const Stats = () => {
  const [hoveredStat, setHoveredStat] = useState(null);

  const stats = [
    { value: "65%+", label: "People Joined", description: "Of users report feeling more secure online after using RedFlag" },
    { value: "80%+", label: "Fraud Predicting", description: "Accuracy rate in detecting potential fraudulent websites" },
    { value: "100K+", label: "Sites Analyzed", description: "Websites scanned and analyzed for security threats daily" }
  ];

  return (
    <div className='flex flex-col items-center gap-8 mr-8 mt-8 mb-8'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-white mb-2'>Why Choose RedFlag?</h2>
        <p className='text-red-300 max-w-2xl mx-auto'>
          Join thousands of users who trust RedFlag to protect them from online threats
        </p>
      </div>
      
      <div className='flex flex-row justify-between gap-20 flex-wrap'>
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 cursor-pointer transform ${
              hoveredStat === index 
                ? 'bg-red-900 bg-opacity-50 backdrop-blur-sm scale-105' 
                : 'bg-transparent'
            }`}
            onMouseEnter={() => setHoveredStat(index)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className='text-5xl text-white flex items-center'>
              {stat.value}
              {hoveredStat === index && (
                <span className='text-2xl ml-2 animate-pulse'>★</span>
              )}
            </div>
            <div className='text-red-300 mt-2 text-center'>{stat.label}</div>
            {hoveredStat === index && (
              <div className='text-red-200 text-sm mt-2 text-center max-w-xs transition-all duration-300 animate-fadeIn'>
                {stat.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Stats