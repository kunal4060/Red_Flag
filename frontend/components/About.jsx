import React, { useState } from 'react'

const About = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  
  const features = [
    {
      title: "Real-time Link Scanning",
      description: "Instantly analyzes any link you hover over or click, checking the destination URL against our extensive database of known malicious sites and applying advanced heuristic analysis to detect new threats.",
      icon: "🔗"
    },
    {
      title: "Website Security Analysis",
      description: "Performs comprehensive security assessments of websites you visit, examining SSL certificates, domain reputation, content safety, and potential malware signatures to ensure your online safety.",
      icon: "🌐"
    },
    {
      title: "AI-Powered Threat Detection",
      description: "Utilizes machine learning algorithms to identify suspicious patterns and emerging threats that traditional security measures might miss, constantly evolving to protect against the latest attack vectors.",
      icon: "🤖"
    },
    {
      title: "Email Content Protection",
      description: "Scans email content for phishing attempts, malicious attachments, and suspicious links, providing warnings before you interact with potentially harmful email content.",
      icon: "📧"
    }
  ];

  return (
    <div className='flex flex-col text-white text-5xl justify-center items-center w-full py-20'>
      <div className='mt-16 tracking-wide font-medium text-white'>About RedFlag</div>
      <p className='text-wrap w-200 text-lg text-red-300 mt-8 text-center px-10'>
        RedFlag is a cutting-edge browser extension designed to protect users from online threats. 
        Our intelligent system scans links, emails, and websites in real-time to identify potential 
        security risks before you interact with them. With the rise of sophisticated phishing attacks 
        and malicious websites, RedFlag acts as your first line of defense in the digital world.
      </p>
      
      <div className='mt-10 text-3xl font-medium text-red-400'>How It Works</div>
      <p className='text-wrap w-200 text-lg text-red-300 mt-4 text-center px-10'>
        Our extension seamlessly integrates with your browser, providing instant security analysis 
        without interrupting your browsing experience. When you encounter a link or visit a website, 
        RedFlag automatically performs multiple security checks and provides a clear risk assessment.
      </p>

      <div className='flex flex-row justify-between gap-10 mt-16 text-lg flex-wrap px-10'>
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center bg-gradient-to-br from-gray-800 to-black rounded-3xl w-80 p-8 border transition-all duration-300 transform cursor-pointer ${
              activeFeature === index 
                ? 'border-red-400 scale-105 shadow-lg' 
                : 'border-red-700 hover:border-red-500'
            }`}
            onMouseEnter={() => setActiveFeature(index)}
            onMouseLeave={() => setActiveFeature(null)}
          >
            <div className='text-4xl mb-4'>{feature.icon}</div>
            <div className='text-2xl font-medium mb-4 text-white text-center'>{feature.title}</div>
            <div className={`text-red-300 text-center transition-all duration-300 ${
              activeFeature === index ? 'opacity-100' : 'opacity-80'
            }`}>
              {feature.description}
            </div>
          </div>
        ))}
      </div>
      
      <div className='mt-16 text-3xl font-medium text-red-400'>Our Mission</div>
      <p className='text-wrap w-200 text-lg text-red-300 mt-4 text-center px-10 mb-20'>
        We believe that everyone deserves to browse the internet safely without 
        worrying about cyber threats. Our mission is to make advanced cybersecurity 
        protection accessible to all internet users, regardless of their technical expertise. 
        By combining cutting-edge technology with an intuitive user interface, RedFlag 
        empowers users to make informed decisions about their online activities.
      </p>
    </div>
  )
}

export default About