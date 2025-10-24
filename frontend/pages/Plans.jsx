import React, { useState } from 'react'
import { useTrail, animated } from '@react-spring/web'
import { useAuthStore } from '../store/useAuthStore';

const plans = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Basic fraud and phishing alerts to keep you safer online.',
    features: ['Daily 20 websites', 'AI Analysis'],
    selected: true,
  },
  {
    name: 'Premium',
    price: '$8',
    desc: 'Basic fraud and phishing alerts to keep you safer online.',
    features: ['Daily 100 websites', 'AI Analysis', 'Deep Analysis'],
    selected: false,
  },
  {
    name: 'Pro',
    price: '$16',
    desc: 'Basic fraud and phishing alerts to keep you safer online.',
    features: ['Unlimited websites', 'AI Analysis', 'Deep Analysis', 'Insight Analysis'],
    selected: false,
  },
]

const Plans = ({ onProceed }) => {

  const updatePlan = useAuthStore((state) => state.updatePlan);

  const trail = useTrail(plans.length, {
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    config: { tension: 220, friction: 80 },
    delay: 200,
  })

  const [selection, setSelection] = useState("Free");
  const updateSelection = (e) => {
    setSelection(e)
  }

  return (
    <div className='bg-black text-white h-screen content-center'>
      <div className='flex flex-col items-center justify-center mx-20'>
        <div className='text-3xl font-semibold my-4'>Pricing</div>
        <div className='text-neutral-400 mb-8'>Secure your web browsing with the plan that's right for you.</div>

        <div className='flex flex-row justify-center'>
          {trail.map((style, idx) => (
            <animated.div
              key={plans[idx].name}
              style={{
                ...style,
                transform: style.y.to(y => `translateY(${y}px)`),
              }}
              className='bg-neutral-900 w-70 rounded-4xl flex flex-col m-4 p-8'
            >
              <div className='text-3xl'>{plans[idx].name}</div>
              <div className='flex flex-row mt-8'>
                <div className='text-3xl mr-2'>{plans[idx].price}</div>
                <div className='text-lg text-neutral-400'>per month</div>
              </div>
              <div className='text-neutral-400 my-2'>{plans[idx].desc}</div>
              <div className='border-b-2 my-2 border-neutral-700 mt-16'></div>
              <div>{plans[idx].features[0]}</div>
              <div className='border-b-2 my-2 border-neutral-700'></div>
              <div>{plans[idx].features[1]}</div>
              <div className='border-b-2 my-2 border-neutral-700 mb-8'></div>
              <button onClick={()=>{setSelection(plans[idx].name)}} className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${plans[idx].name === selection?"bg-white text-black":"bg-neutral-800 text-neutral-400"}`}>{plans[idx].name === selection?"Selected":"Select"}</button>
            </animated.div>
          ))}
        </div>

        <button
        className={`mt-8 px-16 py-2 rounded-xl transition-all duration-300 hover:scale-105 bg-white text-black`}
        onClick={async () => {
          await updatePlan(selection);
          if (onProceed) onProceed();
        }}
        >
          {selection === "Free" ? "Proceed" : "Pay now"}
        </button>
      </div>
    </div>
  )
}

export default Plans