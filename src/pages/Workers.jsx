import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Phone, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'

export const Workers = () => {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select(`
          *,
          work_assignments (
            id,
            total_pay,
            status
          )
        `)
        .order('name')

      if (error) throw error

      // Calculate stats for each worker
      const workersWithStats = data?.map(worker => {
        const assignments = worker.work_assignments || []
        const totalEarnings = assignments
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.total_pay || 0), 0)
        const activeJobs = assignments.filter(a => a.status === 'pending').length

        return {
          ...worker,
          totalEarnings,
          activeJobs,
          totalJobs: assignments.length,
        }
      }) || []

      setWorkers(workersWithStats)
    } catch (error) {
      console.error('Error fetching workers:', error)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-4xl font-bold text-white mb-2">Workers</h1>
        <p className="text-slate-200">Manage your workforce</p>
      </motion.div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker, index) => (
          <motion.div
            key={worker.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-6 cursor-pointer hover:shadow-glow-teal transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-nature-teal/30 rounded-2xl">
                <Users className="w-6 h-6 text-nature-mint" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{worker.name}</h3>
                {worker.specialty && (
                  <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Briefcase className="w-4 h-4" />
                    {worker.specialty}
                  </div>
                )}
                {worker.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Phone className="w-4 h-4" />
                    {worker.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Total Earnings</span>
                <span className="text-nature-mint font-semibold">
                  {formatCurrency(worker.totalEarnings)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Active Jobs</span>
                <span className="text-yellow-400 font-semibold">{worker.activeJobs}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Total Jobs</span>
                <span className="text-white font-semibold">{worker.totalJobs}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {workers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-12 text-center"
        >
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No workers found</p>
          <p className="text-slate-400 text-sm mt-2">Add workers to start managing assignments</p>
        </motion.div>
      )}
    </div>
  )
}
