import React, { useState, useEffect } from 'react'

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Marketer",
      content: "RedFlag has completely changed how I browse the internet. I feel so much more secure knowing that every link is automatically checked for threats.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      content: "As someone who clicks on dozens of links daily for work, RedFlag saves me countless hours by instantly identifying malicious sites.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Small Business Owner",
      content: "Our company's security improved dramatically after implementing RedFlag. It's simple to use and incredibly effective.",
      rating: 4
    },
    {
      name: "David Thompson",
      role: "Freelance Writer",
      content: "I used to be paranoid about every email attachment and link. RedFlag gives me peace of mind and lets me focus on my work.",
      rating: 5
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className='flex flex-col text-white justify-center items-center w-full py-20 bg-gradient-to-br from-gray-900 via-black to-red-950'>
      <div className='mt-16 tracking-wide font-medium text-4xl text-white'>User Testimonials</div>
      <p className='text-wrap text-lg text-red-300 mt-4 text-center px-10 mb-16 max-w-3xl'>
        Hear what our users have to say about their experience with RedFlag
      </p>
      
      <div 
        className='flex flex-col items-center bg-gradient-to-br from-gray-800 to-black rounded-3xl w-full max-w-4xl p-8 border border-red-700 transition-all duration-300'
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className='text-6xl text-red-400 mb-6 font-serif'>“</div>
        <p className='text-wrap text-xl text-red-200 text-center mb-8 px-6 md:px-10 leading-relaxed'>
          {testimonials[currentTestimonial].content}
        </p>
        
        <div className='flex items-center mb-4'>
          {renderStars(testimonials[currentTestimonial].rating)}
        </div>
        
        <div className='text-2xl font-medium text-white mb-1'>{testimonials[currentTestimonial].name}</div>
        <div className='text-red-300 text-lg mb-8'>{testimonials[currentTestimonial].role}</div>
        
        <div className='flex mt-4 space-x-2'>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial ? 'bg-red-500' : 'bg-gray-600'
              }`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
        
        <div className='flex mt-8 space-x-4'>
          <button 
            className='px-6 py-3 bg-red-900 rounded-full text-white hover:bg-red-800 transition-all duration-300 font-medium'
            onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
          >
            Previous
          </button>
          <button 
            className='px-6 py-3 bg-red-900 rounded-full text-white hover:bg-red-800 transition-all duration-300 font-medium'
            onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Testimonials