import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className='w-full flex flex-row justify-between text-4xl py-8 px-16'>
        <div className='font-[Ariel]'>RedFlag</div>

        <div className='flex flex-row gap-20 text-base'>
            <div>Home</div>
            <div>About</div>
            <div>Team</div>
            <div>Download</div>
        </div>

        <div className='text-base rounded-3xl bg-white text-black px-4 py-2' onClick={() => navigate('/signup')}>Apply Now</div>
    </div>
  )
}

export default Header