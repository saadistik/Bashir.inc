import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'

export const Home = () => {
  const [tussles, setTussles] = useState([])
  const [stats, setStats] = useState({ pending: 0, completed: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch tussles with company info
      const { data: tusslesData, error: tusslesError } = await supabase
        .from('tussles')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url
          )
        `)
        .order('due_date', { ascending: true })

      if (tusslesError) throw tusslesError

      setTussles(tusslesData || [])

      // Calculate stats
      const pending = tusslesData?.filter(t => t.status === 'pending').length || 0
      const completed = tusslesData?.filter(t => t.status === 'completed').length || 0
      const revenue = tusslesData?.reduce((sum, t) => sum + (t.sell_price || 0), 0) || 0

      setStats({ pending, completed, revenue })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingDeadlines = tussles
    .filter(t => t.status === 'pending' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-200">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-nature-teal/30 rounded-2xl">
              <Package className="w-6 h-6 text-nature-mint" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Pending Orders</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-nature-gold/30 rounded-2xl">
              <Clock className="w-6 h-6 text-nature-gold" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Completed</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-nature-mint/30 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-nature-mint" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Pending Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tussles.filter(t => t.status === 'pending').map((tussle, index) => (
            <motion.div
              key={tussle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/tussles/${tussle.id}`)}
              className="glass-panel p-5 cursor-pointer hover:shadow-glow-teal transition-all"
            >
              {tussle.image_url && (
                <img
                  src={tussle.image_url}
                  alt={tussle.name}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{tussle.name}</h3>
              <p className="text-sm text-slate-300 mb-2">{tussle.companies?.name}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-nature-mint">{formatCurrency(tussle.sell_price)}</span>
                {tussle.due_date && (
                  <span className="text-slate-400">{formatDate(tussle.due_date)}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Upcoming Deadlines</h2>
          <div className="glass-panel p-6">
            <div className="space-y-3">
              {upcomingDeadlines.map((tussle) => (
                <motion.div
                  key={tussle.id}
                  whileHover={{ x: 5 }}
                  onClick={() => navigate(`/tussles/${tussle.id}`)}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div>
                    <p className="text-white font-medium">{tussle.name}</p>
                    <p className="text-sm text-slate-300">{tussle.companies?.name}</p>
                  </div>
                  <span className="text-nature-gold font-medium">{formatDate(tussle.due_date)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
