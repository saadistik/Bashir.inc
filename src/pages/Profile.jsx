import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Shield, Users as UsersIcon, Plus, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { useEffect } from 'react'

export const Profile = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'owner') {
      fetchEmployees()
    } else {
      setLoading(false)
    }
  }, [profile])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .order('full_name')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

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
                profile?.role === 'owner'
                  ? 'bg-nature-gold/30 text-nature-gold'
                  : 'bg-nature-teal/30 text-nature-mint'
              }`}>
                {profile?.role === 'owner' ? (
                  <><Shield className="w-4 h-4 inline mr-2" />Owner</>
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

      {/* Employee Management (Owner Only) */}
      {profile?.role === 'owner' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Employee Management</h2>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Employee
            </motion.button>
          </div>

          {loading ? (
            <div className="glass-panel p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-nature-teal/30 rounded-2xl">
                      <User className="w-6 h-6 text-nature-mint" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {employee.full_name}
                      </h3>
                      <p className="text-sm text-slate-300">@{employee.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/10">
                    {employee.id_card && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">ID Card</span>
                        <span className="text-white font-mono">{employee.id_card}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Salary</span>
                      <span className="text-nature-mint font-semibold">
                        {formatCurrency(employee.salary || 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {employees.length === 0 && !loading && (
            <div className="glass-panel p-12 text-center">
              <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">No employees yet</p>
              <p className="text-slate-400 text-sm mt-2">Add your first employee to get started</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Employee Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateEmployeeModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchEmployees()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Employee Modal Component
const CreateEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    id_card: '',
    salary: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Create auth user
      const email = `${formData.username}@bashir.inc`
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username,
          }
        }
      })

      if (authError) throw authError

      // Update profile with additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          role: 'employee',
          salary: parseInt(formData.salary),
          id_card: formData.id_card || null,
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      onSuccess()
    } catch (error) {
      console.error('Error creating employee:', error)
      setError(error.message || 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Employee</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="Ali Khan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="ali"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Will be used as: {formData.username}@bashir.inc
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              ID Card Number
            </label>
            <input
              type="text"
              value={formData.id_card}
              onChange={(e) => setFormData({ ...formData, id_card: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="12345-1234567-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Monthly Salary (PKR) *
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="50000"
              required
              min="0"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <motion.button
              type="submit"
              disabled={saving}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Employee'}
            </motion.button>
            
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 glass-button text-slate-200 rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
