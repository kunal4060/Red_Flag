import React, { useState } from 'react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does RedFlag protect me from phishing attacks?",
      answer: "RedFlag uses advanced machine learning algorithms to analyze URLs, email content, and website characteristics in real-time. Our system checks against extensive databases of known malicious sites and applies heuristic analysis to detect new threats that haven't been catalogued yet."
    },
    {
      question: "Does RedFlag slow down my browsing experience?",
      answer: "No, RedFlag is designed to work seamlessly in the background without affecting your browsing speed. Our lightweight extension performs security checks quickly and efficiently, typically completing analyses in milliseconds."
    },
    {
      question: "Can I customize the security settings?",
      answer: "Yes, RedFlag offers customizable security levels to match your needs. You can adjust sensitivity settings, whitelist trusted sites, and configure notification preferences through our intuitive dashboard."
    },
    {
      question: "Is my data safe with RedFlag?",
      answer: "Absolutely. We prioritize your privacy and security. RedFlag operates locally on your device whenever possible, and any data sent to our servers is encrypted and anonymized. We never sell or share your personal information with third parties."
    },
    {
      question: "What browsers does RedFlag support?",
      answer: "RedFlag is compatible with all major browsers including Chrome, Firefox, Safari, and Edge. Our extension is regularly updated to ensure compatibility with the latest browser versions."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='flex flex-col text-white justify-center items-center w-full py-20 bg-gradient-to-br from-gray-900 via-black to-red-950'>
      <div className='mt-16 tracking-wide font-medium text-4xl text-white'>Frequently Asked Questions</div>
      <p className='text-wrap text-lg text-red-300 mt-4 text-center px-10 mb-16 max-w-3xl'>
        Find answers to common questions about RedFlag
      </p>
      
      <div className='flex flex-col w-full max-w-4xl px-4 md:px-10'>
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className='mb-4 border border-red-700 rounded-2xl overflow-hidden transition-all duration-300'
          >
            <div 
              className='flex justify-between items-center p-6 bg-gradient-to-r from-gray-800 to-black cursor-pointer hover:bg-gray-800 transition-colors duration-300'
              onClick={() => toggleFAQ(index)}
            >
              <div className='text-lg font-medium text-white leading-tight'>{faq.question}</div>
              <div className='text-2xl text-red-400 transition-transform duration-300'>
                {openIndex === index ? '−' : '+'}
              </div>
            </div>
            {openIndex === index && (
              <div className='p-6 bg-black bg-opacity-50 animate-fadeIn'>
                <div className='text-red-200 text-base leading-relaxed'>{faq.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ