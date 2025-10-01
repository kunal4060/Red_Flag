import React, { use } from 'react'
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col bg-black text-white items-center w-full h-screen'>
      {/* Header */}

      {/* Body */}
      <div className='font-[system-ui] text-7xl font-light '>
        <div className='flex flex-row'>
          <div className=' mr-10'>Scan & Protect</div>
          <div className='relative h-20 w-20 mt-4'>
          {[...Array(6)].map((_, i) => (
            <div
            key={i}
            className='absolute bg-neutral-600 rounded-full border border-white'
            style={{
              opacity: (i + 1) / 6,
              width: `60px`,
              height: `60px`,
              left: `${i * 30}px`,
            }}
            />
          ))}
          </div>
        </div>

        <div className='flex flex-row -translate-y-4'>
          <div className='mt-6 my-auto rounded-full border-2 w-40 h-14 flex justify-between'>
            <div className='text-lg mt-3 ml-4 '>apply now</div>
            <div className='rounded-full size-14 border-2'></div>
          </div>
          <div className='mx-10'>your browsing</div>
        </div>

        <div className='flex flex-row mt-4 -translate-y-4'>
          <div className=''>with</div>
          <div className='mx-4 italic font-medium'>RedFlag</div>
        </div>
      </div>

    </div>
  )
}

export default Landing