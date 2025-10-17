import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTeam, setShowTeam] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const scrollToAbout = () => {
    if (location.pathname === '/') {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#about');
    }
  };
  
  const goToHome = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const scrollToTeam = () => {
    if (location.pathname === '/') {
      const teamSection = document.getElementById('team-section');
      if (teamSection) {
        teamSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#team');
    }
  };

  return (
    <div className='w-full flex flex-row justify-between text-4xl py-8 px-16 text-white relative'>
        <div 
          className='font-[Ariel] text-red-600 cursor-pointer transition-all duration-300 hover:text-red-400 hover:scale-105'
          onClick={goToHome}
        >
          RedFlag
        </div>

        <div className='flex flex-row gap-20 text-base text-yellow-400'>
            <div 
              className={`hover:text-yellow-200 cursor-pointer transition-all duration-300 ${
                hoveredItem === 'home' ? 'text-yellow-200 scale-110' : ''
              }`}
              onClick={goToHome}
              onMouseEnter={() => setHoveredItem('home')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Home
            </div>
            <div 
              className={`hover:text-yellow-200 cursor-pointer transition-all duration-300 ${
                hoveredItem === 'about' ? 'text-yellow-200 scale-110' : ''
              }`}
              onClick={scrollToAbout}
              onMouseEnter={() => setHoveredItem('about')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              About
            </div>
            <div 
              className={`hover:text-yellow-200 cursor-pointer transition-all duration-300 ${
                hoveredItem === 'team' ? 'text-yellow-200 scale-110' : ''
              }`}
              onClick={scrollToTeam}
              onMouseEnter={() => setHoveredItem('team')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Team
            </div>
            <div 
              className={`hover:text-yellow-200 cursor-pointer transition-all duration-300 ${
                hoveredItem === 'download' ? 'text-yellow-200 scale-110' : ''
              }`}
              onMouseEnter={() => setHoveredItem('download')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Download
            </div>
        </div>

        <div 
          className='text-base rounded-3xl bg-gradient-to-r from-red-900 to-black text-white px-4 py-2 hover:from-red-950 hover:to-gray-800 cursor-pointer border border-red-700 transition-all duration-300 transform hover:scale-105 flex items-center'
          onClick={() => navigate('/signup')}
        >
          Apply Now
        </div>
    </div>
  )
}

export default Header