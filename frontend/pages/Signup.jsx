import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import TypingText from '../components/TypingText';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import Plans from './Plans';
import Survey from './Survey';
const Signup = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
      email:"",
      firstName:"",
      lastName:"",
      password: ""
  });
  const [focusedField, setFocusedField] = useState(null);

  const {authUser, signup, isSigningUp, emailAlreadyExists} = useAuthStore();

  const [emailRequiredError, setEmailRequiredError] = useState(false);
  const [firstNameRequiredError, setFirstNameRequiredError] = useState(false);
  const [lastNameRequiredError, setLastNameRequiredError] = useState(false);
  const [passwordRequiredError, setPasswordRequiredError] = useState(false);
  const [emailAlreadyTaken, setEmailAlreadyTaken] = useState(false);

  const [showPlans, setShowPlans] = useState(false);
  const [plansReady, setPlansReady] = useState(false);

  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizeReady, setFinalizeReady] = useState(false);

  const handleProceed = () => {
    setShowPlans(false);
    setShowFinalize(true);
    };
    
  const validateForm = () => {

    if (!formData.firstName.trim()) {
        setFirstNameRequiredError(true);
        setEmailRequiredError(false);
        setLastNameRequiredError(false);
        setPasswordRequiredError(false);
        setEmailAlreadyTaken(false);
        return false
    };

    if (!formData.lastName.trim()) {
        setFirstNameRequiredError(false);
        setEmailRequiredError(false);
        setLastNameRequiredError(true);
        setPasswordRequiredError(false);
        setEmailAlreadyTaken(false);
        return false
    };

    if (!formData.email.trim()) {
        setEmailRequiredError(true);
        setFirstNameRequiredError(false);
        setLastNameRequiredError(false);
        setPasswordRequiredError(false);
        setEmailAlreadyTaken(false);
        return false
    };

    if (!formData.password.trim()) {
        setPasswordRequiredError(true); 
        setEmailRequiredError(false);
        setFirstNameRequiredError(false);
        setLastNameRequiredError(false);
        setEmailAlreadyTaken(false);
        return false
    };
    
    return true
  }
  const handleSubmit = (e) => {
      e.preventDefault()

      const success = validateForm();

      if (success===true) {
        setFirstNameRequiredError(false)
        setLastNameRequiredError(false)
        setEmailRequiredError(false)
        setPasswordRequiredError(false)
        signup(formData)
        setShowPlans(true)
      }

      if (success===true && emailAlreadyExists) {
          setEmailAlreadyTaken(true)
      }
  }

  const planSpringLeft = useSpring({
    from: { width: '52%' },
    to: { width: showPlans ? '25%' : '52%' },
    config: { tension: 420, friction: 60 },
    onRest: () => {
        if (showPlans) setPlansReady(true);
        }
    });

  const navigate = useNavigate()
  return (
    <div className='flex flex-row h-screen w-full bg-black text-white'>
        {/* Left half Filler */}
        <animated.div style={planSpringLeft} className='rounded-4xl bg-neutral-900 m-4 flex flex-col justify-end items-center text-center'>
            <svg
                className=" top-0 left-1/2 rounded-4xl"
                width="100%"
                height="100%"
                viewBox="0 0 500 700"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ zIndex: 0 }}
                preserveAspectRatio="none"
            >
                <defs>
                    <radialGradient id="circleGradient" cx="50%" cy="0%" r="80%">
                        <stop offset="0%" stopColor="#ff3c6e" stopOpacity="0.7" />
                        <stop offset="70%" stopColor="#ffb86c" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </radialGradient>

                </defs>
                <circle z-index="10" cx="250" cy="350" r="550" fill="url(#circleGradient)" />
                {/* <circle cx="250" cy="600" r="400" fill="url(#circleGradient2)" /> */}


            </svg>
            <div>
                <div className='flex flex-row justify-center items-center gap-2 mb-4'>
                    <div className='text-4xl my-4 font-[gagalin]'>Red</div>
                    <div className='text-4xl my-4 font-[aloja]'>Flag</div>
                </div>
                <div className='text-4xl mb-2'>Get Started with Us</div>
                <div className='w-74 tracking-wider text-neutral-400'>Complete these easy steps to register your account.</div>
            </div>

            <div className='text-black m-8 gap-4 flex flex-col'>
{/* Sign Up your account */}
                <div className={`${(!showPlans && !showFinalize) ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"} transition-colors duration-300 rounded-xl px-20 py-2`}>
                    Sign Up your account
                </div>
                {/* Choose your plan */}
                <div className={`${(showPlans && !showFinalize) ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"} transition-colors duration-300 rounded-xl px-20 py-2`}>
                    Choose your plan
                </div>
                {/* Finalize */}
                <div className={`${showFinalize ? "bg-white text-black" : "bg-neutral-800 text-neutral-400"} transition-colors duration-300 rounded-xl px-20 py-2`}>
                    Finalize
                </div>
            </div>
        </animated.div>

        {/* Form on right */}
        <animated.div className={`my-4 flex flex-col items-center justify-center w-[40%] mx-auto px-10`}>
            {!showPlans && !showFinalize &&(<>
            <div className='text-3xl font-semibold my-4'>Sign Up Account</div>
            <div className='text-neutral-400'>Enter your personal data to create your account.</div>

            <div className='w-full flex flex-row gap-4 mt-8 justify-center'>
                <div className='w-full flex flex-col gap-2'>
                    <div>First Name</div>
                    <input 
                      onChange={(e) => setFormData({...formData, firstName:e.target.value})} 
                      className={`rounded-xl px-3 py-3 bg-neutral-800 transition-all duration-300 ${
                        focusedField === 'firstName' ? 'ring-2 ring-red-500' : ''
                      }`} 
                      placeholder='eg. John' 
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                    />
                </div>

                <div className='w-full flex flex-col gap-2'>
                    <div>Last Name</div>
                    <input 
                      onChange={(e) => setFormData({...formData, lastName:e.target.value})} 
                      className={`rounded-xl px-3 py-3 bg-neutral-800 transition-all duration-300 ${
                        focusedField === 'lastName' ? 'ring-2 ring-red-500' : ''
                      }`} 
                      placeholder='eg. Doe' 
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                    />
                </div>
            </div>
            {firstNameRequiredError && <div className='w-full text-left text-red-500 text-sm mt-1 animate-pulse'>First Name is required</div>}
            {lastNameRequiredError && <div className='w-full text-left text-red-500 text-sm mt-1 animate-pulse'>Last Name is required</div>}

            <div className='flex flex-col gap-2 mt-4 w-full'>
                <div className=''>Email</div>
                <input 
                  onChange={(e) => setFormData({...formData, email:e.target.value})} 
                  className={`rounded-xl px-3 py-3 bg-neutral-800 transition-all duration-300 ${
                    focusedField === 'email' ? 'ring-2 ring-red-500' : ''
                  }`} 
                  placeholder='eg. john.doe@example.com' 
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                {emailRequiredError && <div className='w-full text-left text-red-500 text-sm mt-1 animate-pulse'>Email is required</div>}
                {emailAlreadyTaken && <div className='w-full text-left text-red-500 text-sm mt-1 animate-pulse'>Email already taken</div>}
            </div>
            
            <div className='flex flex-col gap-2 mt-4 w-full'>
                <div className=''>Password</div>
                <div className='relative'>
                  <input 
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setFormData({...formData, password:e.target.value})} 
                    className={`rounded-xl px-3 py-3 bg-neutral-800 w-full transition-all duration-300 ${
                      focusedField === 'password' ? 'ring-2 ring-red-500' : ''
                    }`} 
                    placeholder='Enter your password' 
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordRequiredError && <div className='w-full text-left text-red-500 text-sm mt-1 animate-pulse'>Password is required</div>}
                <div className='text-sm text-neutral-400'>Must be atleast 6 characters long</div>
            </div>

            <button 
              onClick={(e) => handleSubmit(e)} 
              className='w-full rounded-xl px-4 py-2 bg-white hover:bg-neutral-100 mt-4 text-black transition-all duration-300 transform hover:scale-105'
              disabled={isSigningUp}
            >
              {isSigningUp ? 'Signing Up...' : 'Sign Up'}
            </button>

            <div className='flex flex-row gap-1 mt-8'>
                <div className='text-neutral-400'>Already have an account?</div>
                <div 
                  onClick={() => navigate('/login')} 
                  className='text-white cursor-pointer hover:text-red-400 transition-colors duration-300'
                >
                  Log In
                </div>
            </div>
            </>)}

            {plansReady && showPlans &&(<Plans onProceed={handleProceed} />)}
            {showFinalize && (<Survey />)}
        </animated.div>


    </div>
  )
}

export default Signup