import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import TypingText from '../components/TypingText';
const Signup = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
      email:"",
      fullName:"",
      password: ""
  });

  const {authUser, signup, isSigningUp, emailAlreadyExists} = useAuthStore();

  const [emailRequiredError, setEmailRequiredError] = useState(false);
  const [nameRequiredError, setNameRequiredError] = useState(false);
  const [passwordRequiredError, setPasswordRequiredError] = useState(false);
  const [emailAlreadyTaken, setEmailAlreadyTaken] = useState(false);
    
  const validateForm = () => {
    if (!formData.email.trim()) {
        setEmailRequiredError(true);
        setNameRequiredError(false);
        setPasswordRequiredError(false);
        setEmailAlreadyTaken(false);
        return false
    };

    if (!formData.fullName.trim()) {
        setNameRequiredError(true);
        setEmailRequiredError(false);
        setPasswordRequiredError(false);
        setEmailAlreadyTaken(false);
        return false
    };

    if (!formData.password.trim()) {
        setPasswordRequiredError(true); 
        setEmailRequiredError(false);
        setNameRequiredError(false);
        setEmailAlreadyTaken(false);
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
          signup(formData)
      }

      if (success===true && emailAlreadyExists) {
          setEmailAlreadyTaken(true)
      }
  }
  return (
    <div className='p-8 h-screen w-screen flex flex-col justify-between'>
        {/* Header */}

        {/* Body */}
        <div>
        <div className="font-mono text-6xl font-bold flex flex-col lg:w-1/4">
          <TypingText text="Signup" startDelay={0}/>
        </div>
        <div className="font-mono text-xl mt-4 w-full lg:w-1/5 flex flex-col">
          {emailRequiredError && (<div className='font-mono text-xl text-red-400'><TypingText text='E-mail is required' /></div>)}
          <TypingText text=">Email" startDelay={500}/>
          <input onChange={(e) => setFormData({...formData, email:e.target.value})} className='mb-4' placeholder='-Enter your Email' />

          {nameRequiredError && (<div className='font-mono text-xl text-red-400'><TypingText text='Name is required' /></div>)}
          <TypingText text=">Name" startDelay={500}/>
          <input onChange={(e) => setFormData({...formData, fullName:e.target.value})} className='mb-4' placeholder='-Enter your Name' />

          {passwordRequiredError && (<div className='font-mono text-xl text-red-400'><TypingText text='Password is required' /></div>)}
          <TypingText text=">Password" startDelay={1000}/>
          <input onChange={(e) => setFormData({...formData, password:e.target.value})} type={showPassword ? 'text' : 'password'} placeholder='-Enter your Password' />
        </div>

        <div className="font-mono text-xl mt-4 w-full lg:w-1/5 flex flex-col gap-4">
            {emailAlreadyTaken && (<div className='font-mono text-xl text-red-400'><TypingText text='Email already exists' /></div>)}
            <div aria-disabled={isSigningUp} onClick={(e) => handleSumbit(e)}>
                {isSigningUp ? (<h1>SigningUP...</h1>) : (<TypingText text=">Signup" startDelay={1500}/>)}
            </div>
            <div className='mt-4'><TypingText text="Already secured your Soul? Sync now!" startDelay={2000}/></div>
        </div>
        </div>

        {/* Footer */}
    </div>
  )
}

export default Signup