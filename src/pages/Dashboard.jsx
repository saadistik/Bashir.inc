import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Users, Package, Calendar as CalendarIcon } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks } from 'date-fns'

const COLORS = ['#14B8A6', '#FCD34D', '#5EEAD4', '#064E3B']

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMaterialCost: 0,
    totalLaborCost: 0,
    totalEmployeeSalaries: 0,
    profit: 0,
  })
  const [profitData, setProfitData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [timeFilter, setTimeFilter] = useState('weekly') // weekly or monthly
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [timeFilter])

  const fetchDashboardData = async () => {
    try {
      // Fetch all tussles with related data
      const { data: tussles, error: tusslesError } = await supabase
        .from('tussles')
        .select(`
          *,
          expense_allocations (allocated_amount),
          work_assignments (total_pay)
        `)

      if (tusslesError) throw tusslesError

      // Fetch employee salaries
      const { data: employees, error: employeesError } = await supabase
        .from('profiles')
        .select('salary')
        .eq('role', 'employee')

      if (employeesError) throw employeesError

      // Calculate totals
      const totalRevenue = tussles?.reduce((sum, t) => sum + (t.sell_price || 0), 0) || 0
      
      const totalMaterialCost = tussles?.reduce((sum, t) => {
        const allocations = t.expense_allocations || []
        return sum + allocations.reduce((s, a) => s + (a.allocated_amount || 0), 0)
      }, 0) || 0

      const totalLaborCost = tussles?.reduce((sum, t) => {
        const assignments = t.work_assignments || []
        return sum + assignments.reduce((s, a) => s + (a.total_pay || 0), 0)
      }, 0) || 0

      const totalEmployeeSalaries = employees?.reduce((sum, e) => sum + (e.salary || 0), 0) || 0

      const profit = totalRevenue - totalMaterialCost - totalLaborCost - totalEmployeeSalaries

      setStats({
        totalRevenue,
        totalMaterialCost,
        totalLaborCost,
        totalEmployeeSalaries,
        profit,
      })

      // Generate profit over time data
      generateProfitData(tussles, timeFilter)

      // Generate status pie chart data
      const pending = tussles?.filter(t => t.status === 'pending').length || 0
      const completed = tussles?.filter(t => t.status === 'completed').length || 0
      
      setStatusData([
        { name: 'Pending', value: pending },
        { name: 'Completed', value: completed },
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateProfitData = (tussles, filter) => {
    if (!tussles || tussles.length === 0) {
      setProfitData([])
      return
    }

    if (filter === 'weekly') {
      // Generate data for last 7 weeks
      const data = []
      for (let i = 6; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(new Date(), i))
        const weekEnd = endOfWeek(weekStart)
        
        const weekTussles = tussles.filter(t => {
          const createdAt = new Date(t.created_at)
          return createdAt >= weekStart && createdAt <= weekEnd
        })

        const revenue = weekTussles.reduce((sum, t) => sum + (t.sell_price || 0), 0)
        const costs = weekTussles.reduce((sum, t) => {
          const materials = (t.expense_allocations || []).reduce((s, a) => s + (a.allocated_amount || 0), 0)
          const labor = (t.work_assignments || []).reduce((s, a) => s + (a.total_pay || 0), 0)
          return sum + materials + labor
        }, 0)

        data.push({
          name: format(weekStart, 'MMM d'),
          revenue,
          costs,
          profit: revenue - costs,
        })
      }
      setProfitData(data)
    } else {
      // Monthly view - last 6 months
      const data = []
      for (let i = 5; i >= 0; i--) {
        const month = new Date()
        month.setMonth(month.getMonth() - i)
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

        const monthTussles = tussles.filter(t => {
          const createdAt = new Date(t.created_at)
          return createdAt >= monthStart && createdAt <= monthEnd
        })

        const revenue = monthTussles.reduce((sum, t) => sum + (t.sell_price || 0), 0)
        const costs = monthTussles.reduce((sum, t) => {
          const materials = (t.expense_allocations || []).reduce((s, a) => s + (a.allocated_amount || 0), 0)
          const labor = (t.work_assignments || []).reduce((s, a) => s + (a.total_pay || 0), 0)
          return sum + materials + labor
        }, 0)

        data.push({
          name: format(monthStart, 'MMM'),
          revenue,
          costs,
          profit: revenue - costs,
        })
      }
      setProfitData(data)
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
        <h1 className="text-4xl font-bold text-white mb-2">Financial Dashboard</h1>
        <p className="text-slate-200">Overview of business performance</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/30 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
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
            <div className="p-3 bg-red-500/30 rounded-2xl">
              <Package className="w-6 h-6 text-red-300" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Material Costs</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalMaterialCost)}</p>
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
            <div className="p-3 bg-orange-500/30 rounded-2xl">
              <Users className="w-6 h-6 text-orange-300" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Labor + Salaries</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalLaborCost + stats.totalEmployeeSalaries)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 bg-gradient-to-br from-nature-teal/20 to-nature-mint/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-nature-gold/30 rounded-2xl">
              <DollarSign className="w-6 h-6 text-nature-gold" />
            </div>
            <div>
              <p className="text-slate-200 text-sm">Net Profit</p>
              <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(stats.profit)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Profit Over Time</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFilter('weekly')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeFilter === 'weekly'
                    ? 'bg-nature-teal/40 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeFilter('monthly')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeFilter === 'monthly'
                    ? 'bg-nature-teal/40 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={profitData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FCD34D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(6, 78, 59, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#14B8A6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="costs" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorCosts)"
                name="Costs"
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#FCD34D" 
                fillOpacity={1} 
                fill="url(#colorProfit)"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Order Status</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(6, 78, 59, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-slate-300 text-sm">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Cost Breakdown</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Material Costs</span>
              <span className="text-white font-semibold">{formatCurrency(stats.totalMaterialCost)}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                style={{ 
                  width: `${(stats.totalMaterialCost / (stats.totalMaterialCost + stats.totalLaborCost + stats.totalEmployeeSalaries)) * 100}%` 
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Worker Labor</span>
              <span className="text-white font-semibold">{formatCurrency(stats.totalLaborCost)}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                style={{ 
                  width: `${(stats.totalLaborCost / (stats.totalMaterialCost + stats.totalLaborCost + stats.totalEmployeeSalaries)) * 100}%` 
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Employee Salaries</span>
              <span className="text-white font-semibold">{formatCurrency(stats.totalEmployeeSalaries)}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                style={{ 
                  width: `${(stats.totalEmployeeSalaries / (stats.totalMaterialCost + stats.totalLaborCost + stats.totalEmployeeSalaries)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
