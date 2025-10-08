import React from 'react'

const Stats = () => {
  return (
    <div className='flex flex-row justify-between gap-40 mr-8 mt-8 mb-8'>
        <div className='flex flex-col'>
            <div>safe security</div>
            <div className='text-wrap w-72 text-neutral-400 mt-4'>We take a look at dengerous websites before you so that you dont have to</div>
        </div>

        <div className='flex flex-row text-neutral-200  '>
            <div className='text-5xl'>65%+</div>
            <div className='w-10'>People Joined</div>
        </div>

        <div className='flex flex-row text-neutral-200  '>
            <div className='text-5xl'>80%+</div>
            <div className='w-10'>Fraud Pridicting</div>
        </div>

        <div className='flex flex-row text-neutral-200  '>
            <div className='text-5xl'>100K+</div>
            <div className='w-10'>Sites Analized</div>
        </div>
    </div>
  )
}

export default Stats