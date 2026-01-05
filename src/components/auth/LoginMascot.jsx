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

  // Animate owl based on state
  useEffect(() => {
    if (loginSuccess) {
      // Celebration jump
      bodyControls.start({
        y: [-5, -30, -5],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.8, times: [0, 0.5, 1] }
      })
      leftHandControls.start({
        rotate: [0, -30, 0],
        y: [0, -15, 0],
        transition: { duration: 0.8 }
      })
      rightHandControls.start({
        rotate: [0, 30, 0],
        y: [0, -15, 0],
        transition: { duration: 0.8 }
      })
    } else if (isTypingPassword) {
      // Awkwardly look away (turn head to side nervously)
      bodyControls.start({
        rotate: -25,
        x: -10,
        transition: { duration: 0.4, ease: 'easeOut' }
      })
      leftHandControls.start({
        x: -45,
        y: 45,
        rotate: -25,
        transition: { duration: 0.4 }
      })
      rightHandControls.start({
        x: 45,
        y: 35,
        rotate: 15,
        transition: { duration: 0.4 }
      })
    } else if (isTypingUsername) {
      // Slightly awkward but curious
      bodyControls.start({
        rotate: 15,
        x: 5,
        scale: 1.03,
        transition: { duration: 0.3 }
      })
      leftHandControls.start({
        x: -40,
        y: 30,
        rotate: -10,
        transition: { duration: 0.3 }
      })
      rightHandControls.start({
        x: 40,
        y: 30,
        rotate: 10,
        transition: { duration: 0.3 }
      })
    } else {
      // Idle - gentle breathing
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
        x: 0,
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
        {/* Gradient Definitions for Owl Colors */}
        <defs>
          <linearGradient id="owlBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="100%" stopColor="#6B5744" />
          </linearGradient>
          <linearGradient id="owlBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4C4B0" />
            <stop offset="100%" stopColor="#B8A89A" />
          </linearGradient>
          <radialGradient id="owlFace" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E8DDD0" />
            <stop offset="100%" stopColor="#C4B5A0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Body (rounded owl shape) */}
        <motion.ellipse
          cx="100"
          cy="125"
          rx="55"
          ry="65"
          fill="url(#owlBody)"
          animate={{
            ry: [65, 67, 65],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Belly pattern */}
        <ellipse cx="100" cy="140" rx="30" ry="40" fill="url(#owlBelly)" opacity="0.8" />
        
        {/* Belly feather pattern (spots) */}
        <ellipse cx="95" cy="130" rx="4" ry="6" fill="#8B7355" opacity="0.3" />
        <ellipse cx="105" cy="135" rx="4" ry="6" fill="#8B7355" opacity="0.3" />
        <ellipse cx="100" cy="145" rx="4" ry="6" fill="#8B7355" opacity="0.3" />
        <ellipse cx="93" cy="150" rx="4" ry="6" fill="#8B7355" opacity="0.3" />
        <ellipse cx="107" cy="150" rx="4" ry="6" fill="#8B7355" opacity="0.3" />

        {/* Head (large round owl head) */}
        <circle cx="100" cy="70" r="48" fill="url(#owlBody)" />
        
        {/* Facial disc (heart-shaped face pattern) */}
        <ellipse cx="100" cy="75" rx="42" ry="40" fill="url(#owlFace)" />

        {/* Left Ear Tuft */}
        <motion.path
          d="M 55 35 Q 50 25 55 20 Q 60 22 58 30 Z"
          fill="#6B5744"
          animate={{
            d: [
              "M 55 35 Q 50 25 55 20 Q 60 22 58 30 Z",
              "M 55 35 Q 48 23 55 18 Q 62 20 58 30 Z",
              "M 55 35 Q 50 25 55 20 Q 60 22 58 30 Z"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Right Ear Tuft */}
        <motion.path
          d="M 145 35 Q 150 25 145 20 Q 140 22 142 30 Z"
          fill="#6B5744"
          animate={{
            d: [
              "M 145 35 Q 150 25 145 20 Q 140 22 142 30 Z",
              "M 145 35 Q 152 23 145 18 Q 138 20 142 30 Z",
              "M 145 35 Q 150 25 145 20 Q 140 22 142 30 Z"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        {/* Left Eye Background (white oval) */}
        <ellipse cx="80" cy="70" rx="16" ry="20" fill="white" />
        {/* Left Eye Border */}
        <ellipse cx="80" cy="70" rx="16" ry="20" fill="none" stroke="#3D2817" strokeWidth="2" />
        
        {/* Right Eye Background (white oval) */}
        <ellipse cx="120" cy="70" rx="16" ry="20" fill="white" />
        {/* Right Eye Border */}
        <ellipse cx="120" cy="70" rx="16" ry="20" fill="none" stroke="#3D2817" strokeWidth="2" />

        {/* Left Eye Pupil (large owl pupil) */}
        <motion.circle
          cx={80 + (isTypingPassword ? -8 : leftEyePos.x)}
          cy={70 + (isTypingPassword ? 0 : leftEyePos.y)}
          r="8"
          fill="#1a1a1a"
          animate={isTypingPassword ? { 
            cx: [80, 72, 80],
            transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
          } : {}}
        />

        {/* Right Eye Pupil */}
        <motion.circle
          cx={120 + (isTypingPassword ? -8 : rightEyePos.x)}
          cy={70 + (isTypingPassword ? 0 : rightEyePos.y)}
          r="8"
          fill="#1a1a1a"
          animate={isTypingPassword ? { 
            cx: [120, 112, 120],
            transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
          } : {}}
        />

        {/* Eye shine (highlights) */}
        <circle cx="83" cy="67" r="3" fill="white" opacity="0.9" />
        <circle cx="123" cy="67" r="3" fill="white" opacity="0.9" />

        {/* Beak (triangular) */}
        <motion.path
          d="M 100 82 L 94 90 L 106 90 Z"
          fill="#D4A574"
          animate={isTypingUsername || loginSuccess ? {
            d: "M 100 82 L 95 88 L 105 88 Z"
          } : {
            d: "M 100 82 L 94 90 L 106 90 Z"
          }}
          transition={{ duration: 0.3 }}
        />
        <path d="M 100 82 L 94 90 L 106 90 Z" fill="none" stroke="#8B6F47" strokeWidth="1.5" />

        {/* Left Wing */}
        <motion.g animate={leftHandControls}>
          <ellipse
            cx="50"
            cy="140"
            rx="22"
            ry="28"
            fill="#8B7355"
            opacity="0.9"
          />
          {/* Wing feather details */}
          <path d="M 50 125 Q 45 140 50 155" stroke="#6B5744" strokeWidth="2" fill="none" />
          <path d="M 55 128 Q 50 140 55 152" stroke="#6B5744" strokeWidth="1.5" fill="none" />
        </motion.g>

        {/* Right Wing */}
        <motion.g animate={rightHandControls}>
          <ellipse
            cx="150"
            cy="140"
            rx="22"
            ry="28"
            fill="#8B7355"
            opacity="0.9"
          />
          {/* Wing feather details */}
          <path d="M 150 125 Q 155 140 150 155" stroke="#6B5744" strokeWidth="2" fill="none" />
          <path d="M 145 128 Q 150 140 145 152" stroke="#6B5744" strokeWidth="1.5" fill="none" />
        </motion.g>

        {/* Feet (talons) */}
        <g opacity="0.8">
          <ellipse cx="85" cy="178" rx="18" ry="10" fill="#D4A574" />
          <ellipse cx="115" cy="178" rx="18" ry="10" fill="#D4A574" />
          {/* Talons */}
          <path d="M 80 183 L 78 188" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
          <path d="M 85 183 L 85 188" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
          <path d="M 90 183 L 92 188" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
          <path d="M 110 183 L 108 188" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
          <path d="M 115 183 L 115 188" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
          <path d="M 120 183 L 122 188" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Celebration sparkles when login succeeds */}
        {loginSuccess && (
          <>
            <motion.circle
              cx="50"
              cy="50"
              r="4"
              fill="#FCD34D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            />
            <motion.circle
              cx="150"
              cy="50"
              r="4"
              fill="#FCD34D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.2, repeat: 2 }}
            />
            <motion.circle
              cx="100"
              cy="30"
              r="5"
              fill="#FCD34D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.1, repeat: 2 }}
            />
            <motion.path
              d="M 70 60 L 75 65 L 70 70 L 65 65 Z"
              fill="#EC4899"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.15, repeat: 2 }}
            />
            <motion.path
              d="M 130 60 L 135 65 L 130 70 L 125 65 Z"
              fill="#8B5CF6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.25, repeat: 2 }}
            />
          </>
        )}

        {/* Awkward sweat drop when typing password */}
        {isTypingPassword && (
          <motion.ellipse
            cx="130"
            cy="50"
            rx="3"
            ry="5"
            fill="#60A5FA"
            opacity="0.7"
            initial={{ cy: 45, opacity: 0 }}
            animate={{ 
              cy: [45, 55],
              opacity: [0, 0.7, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeIn"
            }}
          />
        )}
      </motion.svg>
    </div>
  )

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
