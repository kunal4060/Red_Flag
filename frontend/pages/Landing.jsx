import React, { useEffect, useState } from 'react'
import TypingText from '../components/TypingText'
import { useNavigate } from 'react-router-dom'


const Landing = () => {  
  
  const navigate = useNavigate()
  return (
    <div className='p-8 h-screen w-screen flex flex-col justify-between'>
      {/* Header */}


      {/* Body */}
      <div>
        <div className="font-mono text-6xl font-bold flex flex-col">
          <TypingText text='Hello!' delay={80} />
          <TypingText text="I'm Crypton" delay={80} startDelay={500}/>
        </div>
        <div className="font-mono text-xl mt-4 w-full lg:w-1/5">
          <TypingText text="An AI powered chatbot that digitalizes your psyche and makes you immortal." typingDelay={20} startDelay={1000}/>
        </div>
        <div className="font-mono text-xl mt-8 w-full lg:w-1/5 flex flex-col gap-4">
          <div className='cursor-pointer' onClick={() => navigate("/signup")}><TypingText text=">Secure your Soul" startDelay={2600}/></div>
          <div className='cursor-pointer' onClick={() => navigate("/login")}><TypingText text=">Sync Existing Soul" startDelay={3600}/></div>
        </div>
      </div>

      {/* Footer */}

    </div>
  )
}

export default Landing