import { useEffect, useState, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

export const LoginMascot = ({ isTypingUsername, isTypingPassword, loginSuccess }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mascotRef = useRef(null)
  const leftHandControls = useAnimation()
  const rightHandControls = useAnimation()
  const bodyControls = useAnimation()

  // Track mouse movement for eye following
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Calculate eye pupil positions based on mouse
  const calculateEyePosition = (eyeX, eyeY) => {
    if (!mascotRef.current) return { x: 0, y: 0 }

    const rect = mascotRef.current.getBoundingClientRect()
    const mascotCenterX = rect.left + rect.width / 2
    const mascotCenterY = rect.top + rect.height / 2

    const angle = Math.atan2(
      mousePosition.y - mascotCenterY - eyeY,
      mousePosition.x - mascotCenterX - eyeX
    )
    
    const distance = Math.min(6, Math.hypot(
      mousePosition.x - mascotCenterX - eyeX,
      mousePosition.y - mascotCenterY - eyeY
    ) / 30)

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  }

  const leftEyePos = calculateEyePosition(-30, -20)
  const rightEyePos = calculateEyePosition(30, -20)

  // Animate hands based on state
  useEffect(() => {
    if (loginSuccess) {
      // Celebration jump
      bodyControls.start({
        y: [-5, -30, -5],
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.8, times: [0, 0.5, 1] }
      })
      leftHandControls.start({
        rotate: [0, -45, 0],
        y: [0, -20, 0],
        transition: { duration: 0.8 }
      })
      rightHandControls.start({
        rotate: [0, 45, 0],
        y: [0, -20, 0],
        transition: { duration: 0.8 }
      })
    } else if (isTypingPassword) {
      // Cover eyes
      leftHandControls.start({
        x: -15,
        y: -80,
        rotate: -20,
        transition: { duration: 0.3, ease: 'easeOut' }
      })
      rightHandControls.start({
        x: 15,
        y: -80,
        rotate: 20,
        transition: { duration: 0.3, ease: 'easeOut' }
      })
    } else if (isTypingUsername) {
      // Attentive pose
      leftHandControls.start({
        x: -40,
        y: 20,
        rotate: -15,
        transition: { duration: 0.3 }
      })
      rightHandControls.start({
        x: 40,
        y: 20,
        rotate: 15,
        transition: { duration: 0.3 }
      })
      bodyControls.start({
        scale: 1.05,
        transition: { duration: 0.3 }
      })
    } else {
      // Idle
      leftHandControls.start({
        x: -50,
        y: 40,
        rotate: 0,
        transition: { duration: 0.3 }
      })
      rightHandControls.start({
        x: 50,
        y: 40,
        rotate: 0,
        transition: { duration: 0.3 }
      })
      bodyControls.start({
        scale: 1,
        y: 0,
        rotate: 0,
        transition: { duration: 0.3 }
      })
    }
  }, [isTypingUsername, isTypingPassword, loginSuccess, leftHandControls, rightHandControls, bodyControls])

  return (
    <div ref={mascotRef} className="w-64 h-64 mx-auto mb-8 relative">
      <motion.svg
        animate={bodyControls}
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Body */}
        <motion.ellipse
          cx="100"
          cy="120"
          rx="60"
          ry="70"
          fill="url(#monsterGradient)"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="monsterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Belly spot */}
        <ellipse cx="100" cy="135" rx="35" ry="40" fill="#5EEAD4" opacity="0.4" />

        {/* Left Ear */}
        <motion.ellipse
          cx="60"
          cy="60"
          rx="15"
          ry="25"
          fill="#14B8A6"
          animate={{
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Right Ear */}
        <motion.ellipse
          cx="140"
          cy="60"
          rx="15"
          ry="25"
          fill="#14B8A6"
          animate={{
            rotate: [5, -5, 5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        {/* Head */}
        <circle cx="100" cy="80" r="50" fill="url(#monsterGradient)" />

        {/* Left Eye White */}
        <ellipse cx="75" cy="75" rx="12" ry="16" fill="white" />
        
        {/* Right Eye White */}
        <ellipse cx="125" cy="75" rx="12" ry="16" fill="white" />

        {/* Left Eye Pupil */}
        <motion.circle
          cx={75 + leftEyePos.x}
          cy={75 + leftEyePos.y}
          r="6"
          fill="#064E3B"
          animate={isTypingPassword ? { scale: 0 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Right Eye Pupil */}
        <motion.circle
          cx={125 + rightEyePos.x}
          cy={75 + rightEyePos.y}
          r="6"
          fill="#064E3B"
          animate={isTypingPassword ? { scale: 0 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Eye shine */}
        <circle cx="78" cy="72" r="3" fill="white" opacity="0.8" />
        <circle cx="128" cy="72" r="3" fill="white" opacity="0.8" />

        {/* Nose */}
        <ellipse cx="100" cy="85" rx="6" ry="8" fill="#064E3B" opacity="0.6" />

        {/* Mouth */}
        <motion.path
          d={isTypingUsername || loginSuccess 
            ? "M 85 95 Q 100 105 115 95" // Smile
            : "M 85 98 Q 100 96 115 98"  // Neutral
          }
          stroke="#064E3B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isTypingUsername || loginSuccess 
              ? "M 85 95 Q 100 105 115 95"
              : "M 85 98 Q 100 96 115 98"
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Left Hand */}
        <motion.g animate={leftHandControls}>
          <ellipse
            cx="50"
            cy="140"
            rx="18"
            ry="22"
            fill="#14B8A6"
            filter="url(#glow)"
          />
          <ellipse cx="45" cy="135" rx="8" ry="10" fill="#5EEAD4" opacity="0.5" />
        </motion.g>

        {/* Right Hand */}
        <motion.g animate={rightHandControls}>
          <ellipse
            cx="150"
            cy="140"
            rx="18"
            ry="22"
            fill="#14B8A6"
            filter="url(#glow)"
          />
          <ellipse cx="155" cy="135" rx="8" ry="10" fill="#5EEAD4" opacity="0.5" />
        </motion.g>

        {/* Feet */}
        <ellipse cx="80" cy="175" rx="20" ry="12" fill="#064E3B" />
        <ellipse cx="120" cy="175" rx="20" ry="12" fill="#064E3B" />

        {/* Celebration sparkles when login succeeds */}
        {loginSuccess && (
          <>
            <motion.circle
              cx="50"
              cy="50"
              r="3"
              fill="#FCD34D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            />
            <motion.circle
              cx="150"
              cy="50"
              r="3"
              fill="#FCD34D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.2, repeat: 2 }}
            />
            <motion.circle
              cx="100"
              cy="30"
              r="4"
              fill="#FCD34D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.1, repeat: 2 }}
            />
          </>
        )}
      </motion.svg>
    </div>
  )
}
