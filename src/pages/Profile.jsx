import { motion } from 'framer-motion'
import { User, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../lib/utils'

export const Profile = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-slate-200">Manage your account and settings</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-8"
      >
        <div className="flex items-start gap-6">
          <div className="p-4 bg-nature-teal/30 rounded-3xl">
            <User className="w-16 h-16 text-nature-mint" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{profile?.full_name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-2 rounded-xl font-medium ${
                profile?.role === 'admin'
                  ? 'bg-nature-gold/30 text-nature-gold'
                  : 'bg-nature-teal/30 text-nature-mint'
              }`}>
                {profile?.role === 'admin' ? (
                  <><Shield className="w-4 h-4 inline mr-2" />Admin</>
                ) : (
                  <><User className="w-4 h-4 inline mr-2" />Employee</>
                )}
              </span>
              <span className="text-slate-300">@{profile?.username}</span>
            </div>

            {profile?.role === 'employee' && profile?.salary && (
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-1">Monthly Salary</p>
                <p className="text-2xl font-bold text-nature-mint">
                  {formatCurrency(profile.salary)}
                </p>
              </div>
            )}

            <motion.button
              onClick={handleLogout}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 bg-red-500/20 text-red-300 font-semibold rounded-xl hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5 inline mr-2" />
              Sign Out
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
