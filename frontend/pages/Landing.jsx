import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { FaGithub, FaX, FaYoutube, FaArrowRight } from "react-icons/fa6";
import Stats from '../components/Stats';
import About from '../components/About';
import Team from '../components/Team';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthStore();
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredApply, setHoveredApply] = useState(false);

  useEffect(() => {
    // Scroll to section based on hash
    const scrollToSection = (sectionId) => {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    if (location.hash === '#about') {
      scrollToSection('about-section');
    } else if (location.hash === '#team') {
      scrollToSection('team-section');
    }
  }, [location]);

  const handleSocialClick = (social) => {
    // In a real app, this would redirect to the social media pages
    console.log(`Clicked on ${social}`);
  };

  const handleApplyNow = () => {
    // If user is authenticated (has token), go to dashboard
    // Otherwise, go to signup
    if (authUser) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className='flex flex-col text-white items-center w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 bg-cover bg-center'>
      {/* Header */}
      <Header />

      {/* Body */}
      <div className='font-[system-ui] text-7xl font-light mt-38'>
        <div className='flex flex-row'>
          <div className=' mr-10 text-white'>Scan & Protect</div>
          <div className='relative h-20 w-20 mt-4'>
          {[...Array(6)].map((_, i) => (
            <div
            key={i}
            className='absolute bg-red-700 rounded-full border border-white float-animation'
            style={{
              opacity: (i + 1) / 6,
              width: `60px`,
              height: `60px`,
              left: `${i * 30}px`,
              animationDelay: `${i * 0.2}s`,
            }}
            />
          ))}
          </div>
        </div>

        <div className='flex flex-row -translate-y-4'>
          <div 
            className={`mt-6 my-auto rounded-full border-2 ${
              hoveredApply ? 'border-red-300' : 'border-red-500'
            } w-40 h-14 flex justify-between bg-red-900 transition-all duration-300 transform ${
              hoveredApply ? 'scale-105' : ''
            }`}
            onMouseEnter={() => setHoveredApply(true)}
            onMouseLeave={() => setHoveredApply(false)}
          >
            <div className='text-lg mt-3 ml-4 text-white'>apply now</div>
            <div 
              className={`rounded-full size-14 border-2 ${
                hoveredApply ? 'border-red-300' : 'border-red-500'
              } bg-red-950 transition-all duration-300 flex items-center justify-center cursor-pointer`}
              onClick={handleApplyNow}
            >
              <FaArrowRight className={`size-10 scale-50 w-full h-full text-white transition-all duration-300 ${
                hoveredApply ? 'scale-75' : ''
              }`}/>
            </div>
          </div>
          <div className='mx-10 text-white'>your browsing</div>
        </div>

        <div className='flex flex-row mt-4 -translate-y-4'>
          <div className='text-white'>with</div>
          <div className='mx-4 italic font-medium text-red-400'>RedFlag</div>
        </div>
      </div>

      {/* Icons for social media */}
      <div className='absolute left-16 top-[40%]'>
        <div className='flex flex-col justify-between gap-8 text-red-400'>
          <div 
            className={`transition-all duration-300 cursor-pointer ${
              hoveredSocial === 'github' ? 'text-red-200 scale-125' : 'hover:text-red-300'
            }`}
            onMouseEnter={() => setHoveredSocial('github')}
            onMouseLeave={() => setHoveredSocial(null)}
            onClick={() => handleSocialClick('GitHub')}
          >
            <FaGithub />
          </div>
          <div 
            className={`transition-all duration-300 cursor-pointer ${
              hoveredSocial === 'twitter' ? 'text-red-200 scale-125' : 'hover:text-red-300'
            }`}
            onMouseEnter={() => setHoveredSocial('twitter')}
            onMouseLeave={() => setHoveredSocial(null)}
            onClick={() => handleSocialClick('Twitter')}
          >
            <FaX />
          </div>
          <div 
            className={`transition-all duration-300 cursor-pointer ${
              hoveredSocial === 'youtube' ? 'text-red-200 scale-125' : 'hover:text-red-300'
            }`}
            onMouseEnter={() => setHoveredSocial('youtube')}
            onMouseLeave={() => setHoveredSocial(null)}
            onClick={() => handleSocialClick('YouTube')}
          >
            <FaYoutube />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className='w-[90%] border-b-2 border-red-700 mt-38'></div>

      <div className='w-full'>
        <Stats />
      </div>

      <div className='w-full' id='about-section'>
        <About />
      </div>

      <div className='w-full' id='team-section'>
        <Team />
      </div>

      <div className='w-full' id='testimonials-section'>
        <Testimonials />
      </div>

      <div className='w-full' id='faq-section'>
        <FAQ />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Landing