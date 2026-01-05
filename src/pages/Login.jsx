import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { LoginMascot } from '../components/auth/LoginMascot'
import { Lock, User } from 'lucide-react'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [isTypingUsername, setIsTypingUsername] = useState(false)
  const [isTypingPassword, setIsTypingPassword] = useState(false)

  const { signIn, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect based on role if already logged in
    if (profile) {
      if (profile.role === 'owner') {
        navigate('/dashboard')
      } else {
        navigate('/home')
      }
    }
  }, [profile, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await signIn(username, password)

    if (error) {
      setError('Invalid username or password')
      setLoading(false)
    } else {
      setLoginSuccess(true)
      
      // Wait for animation then redirect based on role
      setTimeout(() => {
        if (data.user) {
          // The profile will be loaded by AuthContext, causing redirect via useEffect
        }
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-nature-emerald via-nature-forest to-nature-teal animate-gradient-shift"
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-nature-teal/30 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-nature-gold/20 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-12">
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-glow">
              Bashir.inc
            </h1>
            <p className="text-slate-200 text-sm md:text-base">Manufacturing ERP System</p>
          </motion.div>

          {/* Mascot */}
          <LoginMascot
            isTypingUsername={isTypingUsername}
            isTypingPassword={isTypingPassword}
            loginSuccess={loginSuccess}
          />

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setIsTypingUsername(true)}
                  onBlur={() => setIsTypingUsername(false)}
                  className="w-full pl-12 pr-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal focus:border-transparent transition-all"
                  placeholder="Enter username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsTypingPassword(true)}
                  onBlur={() => setIsTypingPassword(false)}
                  className="w-full pl-12 pr-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal focus:border-transparent transition-all"
                  placeholder="Enter password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || loginSuccess}
              whileTap={{ scale: 0.96 }}
              className="w-full py-4 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-2xl shadow-glow-teal hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : loginSuccess ? 'Success! ✨' : 'Sign In'}
            </motion.button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 text-center text-xs text-slate-300 space-y-1">
            <p>Demo: owner / bashir123 (Owner Dashboard)</p>
            <p>Demo: ali / bashir123 (Employee View)</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
