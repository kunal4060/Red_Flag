import React, { useState } from 'react'

const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleLinkClick = (link) => {
    // In a real app, this would navigate to different pages
    console.log(`Clicked on ${link}`);
  };

  return (
    <footer className='w-full bg-black bg-opacity-30 backdrop-blur-sm border-t border-red-700 border-opacity-30 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='text-2xl font-bold text-red-500 mb-4 md:mb-0 transition-all duration-300 hover:text-red-300 cursor-pointer'>
            RedFlag
          </div>
          
          <div className='flex flex-wrap justify-center gap-6 mb-4 md:mb-0'>
            <div 
              className={`text-red-300 text-sm cursor-pointer transition-all duration-300 ${
                hoveredLink === 'privacy' ? 'text-red-200 scale-105' : 'hover:text-red-200'
              }`}
              onMouseEnter={() => setHoveredLink('privacy')}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={() => handleLinkClick('Privacy Policy')}
            >
              Privacy Policy
            </div>
            <div 
              className={`text-red-300 text-sm cursor-pointer transition-all duration-300 ${
                hoveredLink === 'terms' ? 'text-red-200 scale-105' : 'hover:text-red-200'
              }`}
              onMouseEnter={() => setHoveredLink('terms')}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={() => handleLinkClick('Terms of Service')}
            >
              Terms of Service
            </div>
            <div 
              className={`text-red-300 text-sm cursor-pointer transition-all duration-300 ${
                hoveredLink === 'contact' ? 'text-red-200 scale-105' : 'hover:text-red-200'
              }`}
              onMouseEnter={() => setHoveredLink('contact')}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={() => handleLinkClick('Contact Us')}
            >
              Contact Us
            </div>
          </div>
          
          <div className='text-red-300 text-sm'>
            © {new Date().getFullYear()} RedFlag. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer