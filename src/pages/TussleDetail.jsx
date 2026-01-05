import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Package, Receipt, Users, Plus, Upload, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import { uploadReceipt } from '../lib/uploadImage'

const TABS = ['overview', 'materials', 'labor']

export const TussleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [tussle, setTussle] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTussleData()
  }, [id])

  const fetchTussleData = async () => {
    try {
      const { data: tussleData, error: tussleError } = await supabase
        .from('tussles')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', id)
        .single()

      if (tussleError) throw tussleError
      setTussle(tussleData)
      setCompany(tussleData.companies)
    } catch (error) {
      console.error('Error fetching tussle:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    const newStatus = tussle.status === 'pending' ? 'completed' : 'pending'
    
    const { error } = await supabase
      .from('tussles')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setTussle({ ...tussle, status: newStatus })
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
      {/* Header with Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(`/companies/${company?.id}`)}
          className="flex items-center gap-2 text-slate-200 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {company?.name}
        </button>

        <div className="glass-panel overflow-hidden">
          {/* Reference Image - Album Art Style */}
          {tussle?.image_url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={tussle.image_url}
                alt={tussle.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nature-emerald/90 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {tussle?.name}
                </h1>
                <p className="text-xl text-slate-200">{company?.name}</p>
              </div>
            </div>
          )}

          {/* Title for tussles without image */}
          {!tussle?.image_url && (
            <div className="p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{tussle?.name}</h1>
              <p className="text-xl text-slate-200">{company?.name}</p>
            </div>
          )}

          {/* Quick Stats Bar */}
          <div className="p-6 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm text-slate-300 mb-1">Status</p>
                <motion.button
                  onClick={toggleStatus}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    tussle?.status === 'completed'
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                  }`}
                >
                  {tussle?.status === 'completed' ? (
                    <><Check className="w-4 h-4 inline mr-2" />Completed</>
                  ) : (
                    <><Package className="w-4 h-4 inline mr-2" />Pending</>
                  )}
                </motion.button>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-1">Sell Price</p>
                <p className="text-2xl font-bold text-nature-mint">
                  {formatCurrency(tussle?.sell_price || 0)}
                </p>
              </div>

              {tussle?.due_date && (
                <div>
                  <p className="text-sm text-slate-300 mb-1">Due Date</p>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(tussle.due_date)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-2"
      >
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-3 px-6 rounded-xl font-medium capitalize transition-all relative ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-gradient-to-r from-nature-teal/30 to-nature-mint/30 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab tussle={tussle} />}
          {activeTab === 'materials' && <MaterialsTab tussleId={id} />}
          {activeTab === 'labor' && <LaborTab tussleId={id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ tussle }) => {
  const [expenses, setExpenses] = useState([])
  const [laborCosts, setLaborCosts] = useState([])

  useEffect(() => {
    fetchOverviewData()
  }, [tussle?.id])

  const fetchOverviewData = async () => {
    if (!tussle?.id) return

    // Fetch expense allocations
    const { data: expensesData } = await supabase
      .from('expense_allocations')
      .select('allocated_amount')
      .eq('tussle_id', tussle.id)

    // Fetch labor costs
    const { data: laborData } = await supabase
      .from('work_assignments')
      .select('total_pay')
      .eq('tussle_id', tussle.id)

    setExpenses(expensesData || [])
    setLaborCosts(laborData || [])
  }

  const totalMaterialCost = expenses.reduce((sum, e) => sum + (e.allocated_amount || 0), 0)
  const totalLaborCost = laborCosts.reduce((sum, l) => sum + (l.total_pay || 0), 0)
  const totalCost = totalMaterialCost + totalLaborCost
  const profit = (tussle?.sell_price || 0) - totalCost
  const profitMargin = tussle?.sell_price ? ((profit / tussle.sell_price) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="glass-panel p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Financial Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Sell Price</span>
              <span className="text-xl font-bold text-white">
                {formatCurrency(tussle?.sell_price || 0)}
              </span>
            </div>
            
            <div className="h-px bg-white/10" />
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Material Costs</span>
              <span className="text-lg font-semibold text-red-400">
                -{formatCurrency(totalMaterialCost)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Labor Costs</span>
              <span className="text-lg font-semibold text-red-400">
                -{formatCurrency(totalLaborCost)}
              </span>
            </div>
            
            <div className="h-px bg-white/10" />
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Costs</span>
              <span className="text-lg font-semibold text-red-400">
                -{formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-nature-teal/20 to-nature-mint/20 rounded-2xl border border-white/20">
            <p className="text-slate-300 mb-2">Net Profit</p>
            <p className={`text-5xl font-bold mb-2 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(profit)}
            </p>
            <p className="text-slate-300 text-sm">
              {profitMargin}% margin
            </p>
          </div>
        </div>
      </div>

      {/* Description/Notes */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-white mb-4">Notes</h3>
        <p className="text-slate-300">
          {tussle?.notes || 'No notes available for this tussle.'}
        </p>
      </div>
    </div>
  )
}

// Materials Tab Component
const MaterialsTab = ({ tussleId }) => {
  const [allocations, setAllocations] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllocations()
  }, [tussleId])

  const fetchAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_allocations')
        .select(`
          *,
          receipts (*)
        `)
        .eq('tussle_id', tussleId)

      if (error) throw error
      setAllocations(data || [])
    } catch (error) {
      console.error('Error fetching allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.allocated_amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Material Expenses</h3>
            <p className="text-slate-300">Total: {formatCurrency(totalAllocated)}</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Expense
          </motion.button>
        </div>
      </div>

      {/* Allocations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allocations.map((allocation) => (
          <motion.div
            key={allocation.id}
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-5"
          >
            {allocation.receipts?.image_url && (
              <img
                src={allocation.receipts.image_url}
                alt="Receipt"
                className="w-full h-32 object-cover rounded-xl mb-3"
              />
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Allocated Amount</p>
                <p className="text-sm text-slate-300">
                  From total: {formatCurrency(allocation.receipts?.total_amount || 0)}
                </p>
              </div>
              <p className="text-xl font-bold text-nature-mint">
                {formatCurrency(allocation.allocated_amount)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {allocations.length === 0 && !loading && (
        <div className="glass-panel p-12 text-center">
          <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No expenses allocated yet</p>
          <p className="text-slate-400 text-sm mt-2">Add material expenses to track costs</p>
        </div>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddExpenseModal
            tussleId={tussleId}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              fetchAllocations()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Labor Tab Component
const LaborTab = ({ tussleId }) => {
  const [assignments, setAssignments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [tussleId])

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('work_assignments')
        .select(`
          *,
          workers (*)
        `)
        .eq('tussle_id', tussleId)

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalLabor = assignments.reduce((sum, a) => sum + (a.total_pay || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Labor Assignments</h3>
            <p className="text-slate-300">Total: {formatCurrency(totalLabor)}</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Assign Worker
          </motion.button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <motion.div
            key={assignment.id}
            whileHover={{ x: 5 }}
            className="glass-panel p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">
                  {assignment.workers?.name}
                </h4>
                <p className="text-sm text-slate-300">{assignment.workers?.specialty}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                assignment.status === 'completed'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {assignment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Quantity</p>
                <p className="text-white font-semibold">{assignment.quantity} pcs</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Rate</p>
                <p className="text-white font-semibold">{formatCurrency(assignment.rate)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Pay</p>
                <p className="text-nature-mint font-bold text-lg">
                  {formatCurrency(assignment.total_pay)}
                </p>
              </div>
              {assignment.due_date && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Due Date</p>
                  <p className="text-white font-semibold">{formatDate(assignment.due_date)}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {assignments.length === 0 && !loading && (
        <div className="glass-panel p-12 text-center">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No workers assigned yet</p>
          <p className="text-slate-400 text-sm mt-2">Assign workers to track labor costs</p>
        </div>
      )}

      {/* Add Assignment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddWorkerModal
            tussleId={tussleId}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              fetchAssignments()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Add Expense Modal
const AddExpenseModal = ({ tussleId, onClose, onSuccess }) => {
  const [mode, setMode] = useState('select') // 'select' or 'upload'
  const [receipts, setReceipts] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [allocatedAmount, setAllocatedAmount] = useState('')
  
  // Upload mode states
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [manualAmount, setManualAmount] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (!error) setReceipts(data || [])
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleSubmitExisting = async (e) => {
    e.preventDefault()
    if (!selectedReceipt || !allocatedAmount) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('expense_allocations')
        .insert([{
          tussle_id: tussleId,
          receipt_id: selectedReceipt.id,
          allocated_amount: parseFloat(allocatedAmount),
        }])

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Error adding expense')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitNew = async (e) => {
    e.preventDefault()
    if (!receiptFile || !manualAmount) return

    setSaving(true)
    setUploading(true)

    try {
      // Upload receipt image
      const { url, error: uploadError } = await uploadReceipt(receiptFile)
      if (uploadError) throw new Error('Failed to upload receipt')

      // Create receipt record
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          image_url: url,
          total_amount: parseFloat(manualAmount),
        }])
        .select()
        .single()

      if (receiptError) throw receiptError

      // Create expense allocation
      const { error: allocationError } = await supabase
        .from('expense_allocations')
        .insert([{
          tussle_id: tussleId,
          receipt_id: receiptData.id,
          allocated_amount: parseFloat(manualAmount),
        }])

      if (allocationError) throw allocationError

      onSuccess()
    } catch (error) {
      console.error('Error adding expense:', error)
      alert(error.message || 'Error adding expense')
    } finally {
      setSaving(false)
      setUploading(false)
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
        className="glass-panel p-6 sm:p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Add Material Expense</h2>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('select')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
              mode === 'select'
                ? 'bg-nature-teal text-white'
                : 'glass-button text-slate-300'
            }`}
          >
            Select Existing
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
              mode === 'upload'
                ? 'bg-nature-teal text-white'
                : 'glass-button text-slate-300'
            }`}
          >
            Upload New
          </button>
        </div>

        {/* Select Existing Receipt Mode */}
        {mode === 'select' && (
          <form onSubmit={handleSubmitExisting} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Select Receipt
              </label>
              {receipts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {receipts.map((receipt) => (
                    <motion.div
                      key={receipt.id}
                      onClick={() => setSelectedReceipt(receipt)}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedReceipt?.id === receipt.id
                          ? 'border-nature-teal bg-nature-teal/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {receipt.image_url && (
                        <img
                          src={receipt.image_url}
                          alt="Receipt"
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="text-white font-medium">
                        {formatCurrency(receipt.total_amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(receipt.uploaded_at)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No existing receipts. Upload a new one!</p>
              )}
            </div>

            {selectedReceipt && (
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Allocated Amount (PKR)
                </label>
                <input
                  type="number"
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
                  placeholder="Enter amount to allocate"
                  max={selectedReceipt.total_amount}
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Max: {formatCurrency(selectedReceipt.total_amount)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                type="submit"
                disabled={saving || !selectedReceipt || !allocatedAmount}
                whileTap={{ scale: 0.96 }}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Expense'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-2.5 sm:py-3 glass-button text-slate-200 rounded-xl"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        )}

        {/* Upload New Receipt Mode */}
        {mode === 'upload' && (
          <form onSubmit={handleSubmitNew} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Receipt Image
              </label>
              {receiptPreview ? (
                <div className="relative">
                  <img
                    src={receiptPreview}
                    alt="Receipt Preview"
                    className="w-full h-64 object-contain rounded-xl bg-black/20"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 glass-button border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-sm text-slate-300 font-medium">Click to upload receipt</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Receipt Amount (PKR)
              </label>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
                placeholder="Enter receipt total amount"
                min="0"
                step="0.01"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                This amount will be fully allocated to this tussle
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                type="submit"
                disabled={saving || uploading || !receiptFile || !manualAmount}
                whileTap={{ scale: 0.96 }}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : saving ? 'Adding...' : 'Upload & Add Expense'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-2.5 sm:py-3 glass-button text-slate-200 rounded-xl"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

// Add Worker Modal
const AddWorkerModal = ({ tussleId, onClose, onSuccess }) => {
  const [workers, setWorkers] = useState([])
  const [formData, setFormData] = useState({
    worker_id: '',
    quantity: '',
    rate: '',
    due_date: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name')

    if (!error) setWorkers(data || [])
  }

  const totalPay = formData.quantity && formData.rate 
    ? parseFloat(formData.quantity) * parseFloat(formData.rate)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('work_assignments')
        .insert([{
          tussle_id: tussleId,
          worker_id: formData.worker_id,
          quantity: parseFloat(formData.quantity),
          rate: parseFloat(formData.rate),
          total_pay: totalPay,
          due_date: formData.due_date || null,
          status: 'pending',
        }])

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Error assigning worker:', error)
      alert('Error assigning worker')
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
        <h2 className="text-2xl font-bold text-white mb-6">Assign Worker</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Select Worker *
            </label>
            <select
              value={formData.worker_id}
              onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white focus:outline-none focus:ring-2 focus:ring-nature-teal"
              required
            >
              <option value="">Choose a worker...</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id} className="bg-nature-emerald">
                  {worker.name} - {worker.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Quantity (pieces) *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="50"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Rate per piece (PKR) *
            </label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="50"
              required
              min="0"
              step="0.01"
            />
          </div>

          {totalPay > 0 && (
            <div className="p-4 bg-nature-teal/20 rounded-xl">
              <p className="text-sm text-slate-300 mb-1">Total Pay</p>
              <p className="text-2xl font-bold text-nature-mint">
                {formatCurrency(totalPay)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white focus:outline-none focus:ring-2 focus:ring-nature-teal"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              type="submit"
              disabled={saving}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {saving ? 'Assigning...' : 'Assign Worker'}
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 glass-button text-slate-200 rounded-xl"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
