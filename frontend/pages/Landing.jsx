import React, { use } from 'react'
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <>
    <div>Landing Page</div>
    <button onClick={() => navigate("/login")}>Login</button>
    <button onClick={() => navigate("/signup")}>Sign Up</button>
    </>
  )
}

export default Landing