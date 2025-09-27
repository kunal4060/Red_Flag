import React from 'react'
import { useSpring, animated } from "@react-spring/web";

const TypingText = ({ text='', typingDelay = 50, startDelay = 0}) => {

    const { progress } = useSpring({
        from: {progress: 0},
        to: {progress: text.length},
        config: {duration: text.length * typingDelay},
        delay: startDelay
    })

  return (
    <>
    <animated.span>{progress.to((val) => text.slice(0, Math.floor(val)))}</animated.span>
    </>
  )
}

export default TypingText