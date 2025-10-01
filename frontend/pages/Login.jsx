import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingText from '../components/TypingText'
import { useAuthStore } from '../store/useAuthStore'
import Signup from './Signup'


const Login = () => {

    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email:"",
        password: ""
    });

    const [emailRequiredError, setEmailRequiredError] = useState(false);
    const [passwordRequiredError, setPasswordRequiredError] = useState(false);
    const [wrongCrendentialsError, setWrongCredentialsError] = useState(false);

    const {login, authUser, isLoggingIn} = useAuthStore();

    const validateForm = () => {
        if (!formData.email.trim()) {
            setEmailRequiredError(true);
            setPasswordRequiredError(false);
            setWrongCredentialsError(false);
            return false
        };
        if (!formData.password.trim()) {
            setPasswordRequiredError(true); 
            setEmailRequiredError(false);
            setWrongCredentialsError(false);
            return false
        };
        
        return true
    }
    const handleSubmit = (e) => {
        e.preventDefault()

        const success = validateForm();

        if (success===true) {
            setEmailRequiredError(false)
            setPasswordRequiredError(false)
            login(formData)
            navigate('/dashboard')
        }

        if (success===true && !authUser) {
            setWrongCredentialsError(true)
        }
    }

  return (
    
    <div className='flex flex-row h-screen w-full bg-black text-white'>
        {/* Left half Filler */}
        <div className='rounded-4xl bg-neutral-900 w-[52%] m-4 flex flex-col justify-end items-center text-center'>
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

                <div className='text-4xl'>Welcome Back</div>
            </div>

            <div className='text-black m-8 gap-4 flex flex-col'>
                <div className='w-74 tracking-wider text-neutral-400'>Here's a quick tip for browsing safely.</div>
                <div className='w-74 bg-neutral-800 text-neutral-400 rounded-xl px-4 py-2'>Dont share your password with anyone.</div>
            </div>
        </div>

        {/* Form on right */}
        <div className='my-4 flex flex-col items-center justify-center w-[40%] mx-auto px-10'>
            <div className='text-3xl font-semibold my-4'>Login to Account</div>
            <div className='text-neutral-400'>Enter your account details to Login to your account.</div>


            <div className='flex flex-col gap-2 mt-4 w-full'>
                <div className=''>Email</div>
                <input onChange={(e) => setFormData({...formData, email:e.target.value})} className='rounded-xl px-3 py-3 bg-neutral-800 ' placeholder='eg. john.doe@example.com' />
                {emailRequiredError && (<div className='w-full text-left text-red-500 text-sm mt-1'>E-mail is required</div>)}
            </div>
            
            <div className='flex flex-col gap-2 mt-4 w-full'>
                <div className=''>Password</div>
                <input onChange={(e) => setFormData({...formData, password:e.target.value})} className='rounded-xl px-3 py-3 bg-neutral-800 ' placeholder='Enter your password' />
                {passwordRequiredError && (<div className='w-full text-left text-red-500 text-sm mt-1'>Password is required</div>)}
            </div>

            <button onClick={(e) => handleSubmit(e)} className='w-full rounded-xl px-4 py-2 bg-white hover:bg-neutral-100 mt-4 text-black'>Login</button>

            <div className='flex flex-row gap-1 mt-8'>
                <div className='text-neutral-400'>Dont have an account?</div>
                <div onClick={() => navigate('/signup')} className='text-white'>Sign Up</div>
            </div>
        </div>
    </div>
    
  )
}

export default Login