import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Building2, Calendar, Users, User, Plus, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { path: '/home', icon: Home, label: 'Home', employeeOnly: true },
  { path: '/dashboard', icon: Home, label: 'Dashboard', ownerOnly: true },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/workers', icon: Users, label: 'Workers' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export const AppLayout = () => {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredNavItems = navItems.filter(item => {
    if (item.employeeOnly && profile?.role !== 'employee') return false
    if (item.ownerOnly && profile?.role !== 'owner') return false
    return true
  })

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleAddClick = () => {
    setShowAddModal(true)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-nature-emerald via-nature-forest to-nature-teal animate-gradient-shift -z-10"
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Ambient Orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 bg-nature-teal/20 rounded-full blur-3xl -z-10"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-nature-gold/15 rounded-full blur-3xl -z-10"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Desktop Top Bar */}
      <div className="hidden md:block">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-panel px-6 py-3 flex items-center gap-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-5 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-glow' 
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-nature-teal/30 to-nature-mint/30 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
            
            <div className="w-px h-8 bg-white/20 mx-2" />
            
            <motion.button
              onClick={handleLogout}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-3 rounded-xl text-slate-200 hover:bg-white/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* Main Content */}
      <main className="pt-24 pb-32 md:pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Dock */}
      <div className="md:hidden">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-panel px-4 py-3 flex items-center gap-1">
            {filteredNavItems.slice(0, 4).map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.9 }}
                  className={`relative p-4 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-slate-200'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileTab"
                      className="absolute inset-0 bg-gradient-to-r from-nature-teal/30 to-nature-mint/30 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
            
            <motion.button
              onClick={() => navigate('/profile')}
              whileTap={{ scale: 0.9 }}
              className={`relative p-4 rounded-2xl transition-all ${
                location.pathname === '/profile'
                  ? 'bg-white/20 text-white' 
                  : 'text-slate-200'
              }`}
            >
              <User className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.nav>

        {/* Floating Add Button */}
        {profile?.role === 'employee' && (
          <motion.button
            onClick={handleAddClick}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-gradient-to-br from-nature-teal to-nature-mint rounded-full shadow-glow-teal flex items-center justify-center animate-float"
          >
            <Plus className="w-8 h-8 text-white" />
          </motion.button>
        )}
      </div>

      {/* Desktop Add Button */}
      {profile?.role === 'employee' && (
        <motion.button
          onClick={handleAddClick}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="hidden md:flex fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-nature-teal to-nature-mint rounded-full shadow-glow-teal items-center justify-center animate-float"
        >
          <Plus className="w-8 h-8 text-white" />
        </motion.button>
      )}

      {/* Add Order Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddOrderModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Add Order Modal Component
const AddOrderModal = ({ onClose }) => {
  const [clientName, setClientName] = useState('')
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!clientName.trim()) return

    setSearching(true)
    
    // Search for existing company
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${clientName}%`)
      .limit(1)

    if (error) {
      console.error('Error searching companies:', error)
      setSearching(false)
      return
    }

    if (companies && companies.length > 0) {
      // Company exists - redirect to company page
      navigate(`/companies/${companies[0].id}?openTussle=true`)
      onClose()
    } else {
      // Create new company
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([{ name: clientName.trim() }])
        .select()
        .single()

      if (createError) {
        console.error('Error creating company:', createError)
        setSearching(false)
        return
      }

      // Redirect to new company page
      navigate(`/companies/${newCompany.id}?openTussle=true`)
      onClose()
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
        className="glass-panel p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Add New Order</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="Enter client name..."
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={handleSearch}
              disabled={searching || !clientName.trim()}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Continue'}
            </motion.button>
            
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 glass-button text-slate-200 rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Need to import supabase for the modal
import { supabase } from '../../lib/supabase'
