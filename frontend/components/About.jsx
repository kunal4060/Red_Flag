import React from 'react'

const About = () => {
  const infoBoxClass = "flex flex-col items-center bg-neutral-800 rounded-3xl w-80 p-8"
return (
    <div className='bg-black bg-cover bg-center flex flex-col text-white text-5xl justify-center items-center w-full h-screen py-60'>
            <div className='mt-32 tracking-wide font-medium'>Everything you need</div>
            <p className='text-wrap w-200 text-lg text-neutral-400 mt-8 text-center'>Our extension scans links, emails, and websites to protect you from potential threats. We analyze content in real-time, identifying phishing attempts, malware, and other malicious activities to keep you safe online. We use advanced algorithms and machine learning techniques to provide you with the most accurate and up-to-date security information. With our extension, you can browse the web with confidence, knowing that you are protected from the latest online threats.</p>

            <div className='flex flex-row justify-between gap-20 mt-16 text-lg'>
              <div className={infoBoxClass}>
                <div className='text-2xl font-medium mb-8'>Analyzing Links</div>
                <div className='text-neutral-400 text-center'>Analyzes links to determine where they lead and if the linked website is safe. We check the domain reputation, scan for malware, and analyze the content of the linked page to provide you with a comprehensive risk assessment.</div>
              </div>
              <div className={infoBoxClass}>
                <div className='text-2xl font-medium mb-8'>Analyzing Webpages</div>
                <div className='text-neutral-400 text-center'>Analyzes the webpage for malicious content. We scan for suspicious code, analyze the page structure, and check for phishing attempts to ensure that you are not exposed to any harmful content.</div>
              </div>
              <div className={infoBoxClass}>
                <div className='text-2xl font-medium mb-8'>AI Detection</div>
                <div className='text-neutral-400 text-center'>Uses AI to detect red flags in content. Our AI models are trained to identify subtle signs of malicious activity, such as unusual language patterns, suspicious links, and fake login forms.</div>
              </div>
            </div>
    </div>
)
}

export default About