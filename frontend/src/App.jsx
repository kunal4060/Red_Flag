import React, { useEffect } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import Signup from '../pages/Signup.jsx'
import Login from '../pages/Login.jsx'
import Landing from '../pages/Landing.jsx'
import Plans from '../pages/Plans.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Survey from '../pages/Survey.jsx'
import { useAuthStore } from '../store/useAuthStore.js'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();

  useEffect(() => {
      checkAuth()
  }, [checkAuth]);

  console.log(authUser);

  if (isCheckingAuth && !authUser) return (
    <h1>LOADING</h1>
  )

  return (

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to={"/"} />} />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to={"/"} />} />
          <Route path='/plans' element={!authUser ? <Plans /> : <Navigate to="/login" />} />
          <Route path='/survey' element={!authUser ? <Survey /> : <Navigate to="/login" />} />
          <Route path='/dashboard' element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    )
}
export default App