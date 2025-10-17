import React, { useState } from 'react'

const Team = () => {
  const [hoveredMember, setHoveredMember] = useState(null);
  
  const teamMembers = [
    { 
      name: "Amritesh", 
      role: "Team Leader",
      description: "Leads the development team and oversees project coordination and technical direction.",
      linkedin: "https://www.linkedin.com/in/amritesh-kumar-70a111384/"
    },
    { 
      name: "Aniket", 
      role: "Backend Developer",
      description: "Handles server-side logic, databases, and API development.",
      linkedin: "https://www.linkedin.com/in/aniket"
    },
    { 
      name: "Kunal", 
      role: "UI/UX Designer",
      description: "Designs the user experience and visual elements of the application.",
      linkedin: "https://www.linkedin.com/in/kunal-ugale-08624a363/"
    },
    { 
      name: "Nessra", 
      role: "Representative",
      description: "Represents the team in external communications and stakeholder meetings.",
      linkedin: "https://www.linkedin.com/in/nessra"
    }
  ];

  const handleMemberClick = (linkedinUrl) => {
    window.open(linkedinUrl, '_blank');
  };

  return (
    <div className='flex flex-col text-white text-5xl justify-center items-center w-full py-20 bg-gradient-to-br from-gray-900 via-black to-red-950'>
      <div className='mt-16 tracking-wide font-medium text-white'>Our Team</div>
      <p className='text-wrap w-200 text-lg text-red-300 mt-8 text-center px-10 mb-16'>
        Meet the talented individuals who brought RedFlag to life. Our diverse team combines expertise 
        in web development, security, and design to create a seamless user experience.
      </p>
      
      <div className='flex flex-row justify-center gap-10 mt-10 flex-wrap px-10'>
        {teamMembers.map((member, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center rounded-3xl w-72 p-8 border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
              member.role === "Team Leader" 
                ? "bg-gradient-to-br from-red-900 to-red-950 border-red-400" 
                : member.role === "Representative"
                ? "bg-gradient-to-br from-purple-800 to-purple-900 border-purple-300" 
                : "bg-gradient-to-br from-gray-800 to-black border-red-700 hover:border-red-500"
            }`}
            onMouseEnter={() => setHoveredMember(index)}
            onMouseLeave={() => setHoveredMember(null)}
            onClick={() => handleMemberClick(member.linkedin)}
          >
            <div className={`rounded-full w-32 h-32 flex items-center justify-center mb-6 text-5xl transition-all duration-300 ${
              member.role === "Team Leader" 
                ? "bg-red-800 text-white" 
                : member.role === "Representative"
                ? "bg-purple-700 text-white"
                : "bg-gray-700 text-red-400"
            } ${hoveredMember === index ? 'scale-110 shadow-lg' : ''}`}>
              {member.name.charAt(0)}
            </div>
            <div className='text-2xl font-medium mb-2 text-white'>{member.name}</div>
            <div className={`text-lg mb-4 transition-all duration-300 ${
              member.role === "Team Leader" 
                ? "text-red-300 font-bold" 
                : member.role === "Representative"
                ? "text-purple-200 font-bold"
                : "text-red-400"
            } ${hoveredMember === index ? 'text-xl' : ''}`}>
              {member.role}
            </div>
            <div className={`text-red-300 text-center text-sm transition-all duration-300 ${hoveredMember === index ? 'opacity-100' : 'opacity-80'}`}>{member.description}</div>
            
            <div className='mt-4 text-yellow-400 text-sm hover:text-yellow-300 transition-colors duration-300 font-medium'>
              View LinkedIn Profile
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Team