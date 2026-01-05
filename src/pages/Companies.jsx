import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'

export const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          tussles (
            id,
            sell_price
          )
        `)
        .order('name')

      if (error) throw error

      // Calculate total spent for each company
      const companiesWithStats = data?.map(company => ({
        ...company,
        totalRevenue: company.tussles?.reduce((sum, t) => sum + (t.sell_price || 0), 0) || 0,
        tussleCount: company.tussles?.length || 0,
      })) || []

      setCompanies(companiesWithStats)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Companies</h1>
          <p className="text-slate-200">Manage your client companies</p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-4"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search companies..."
          className="w-full px-4 py-3 bg-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-teal border border-white/10"
        />
      </motion.div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/companies/${company.id}`)}
            className="glass-panel p-6 cursor-pointer hover:shadow-glow-teal transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-nature-teal/30 rounded-2xl">
                <Building2 className="w-6 h-6 text-nature-mint" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{company.name}</h3>
                <p className="text-sm text-slate-300">{company.tussleCount} tussles</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Total Revenue</span>
                <span className="text-nature-mint font-semibold">{formatCurrency(company.totalRevenue)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-12 text-center"
        >
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No companies found</p>
          <p className="text-slate-400 text-sm mt-2">Try adjusting your search or add a new company</p>
        </motion.div>
      )}
    </div>
  )
}
