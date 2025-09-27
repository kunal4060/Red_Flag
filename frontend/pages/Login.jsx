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
    const handleSumbit = (e) => {
        e.preventDefault()

        const success = validateForm();

        if (success===true) {
            setEmailRequiredError(false)
            setPasswordRequiredError(false)
            login(formData)
        }

        if (success===true && !authUser) {
            setWrongCredentialsError(true)
        }
    }

  return (
    <div className='p-8 h-screen w-screen flex flex-col justify-between'>
        {/* Header */}


        {/* Body */}
        <div>
        <div className="font-mono text-6xl font-bold flex flex-col lg:w-1/4">
            <TypingText text="Login" startDelay={0}/>
        </div>
        <div className="font-mono text-xl mt-4 w-full lg:w-1/5 flex flex-col">
            {emailRequiredError && (<div className='font-mono text-xl text-red-400'><TypingText text='E-mail is required' /></div>)}
            <TypingText text=">Username" startDelay={500}/>
            <input onChange={(e) => setFormData({...formData, email:e.target.value})} className='mb-4' placeholder='-Enter your Username' />
            {passwordRequiredError && (<div className='font-mono text-xl text-red-400'><TypingText text='Password is required' /></div>)}
            <TypingText text=">Password" startDelay={1000}/>
            <input onChange={(e) => setFormData({...formData, password:e.target.value})} type={showPassword ? 'text' : 'password'} placeholder='-Enter your Password' />
        </div>

        <div className="font-mono text-xl mt-4 w-full lg:w-1/5 flex flex-col gap-4">
            {wrongCrendentialsError && (<div className='font-mono text-xl text-red-400'><TypingText text='Wrong Credentials' /></div>)}
            <div aria-disabled={isLoggingIn} onClick={(e) => handleSumbit(e)}>
                {isLoggingIn ? (<h1>LoggingIN...</h1>) : (<TypingText text=">Login" startDelay={1500}/>)}
            </div>
            <div className='mt-4'><TypingText text="Secure your Soul now if you haven't already" startDelay={2000}/></div>
        </div>
        </div>

        {/* Footer */}
    </div>
    
  )
}

export default Login