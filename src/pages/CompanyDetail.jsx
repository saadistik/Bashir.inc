import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Package, Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import { uploadImage } from '../lib/uploadImage'

export const CompanyDetail = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [tussles, setTussles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTussleModal, setShowTussleModal] = useState(false)

  useEffect(() => {
    fetchCompanyData()
    
    // Auto-open tussle modal if openTussle=true in URL
    if (searchParams.get('openTussle') === 'true') {
      setShowTussleModal(true)
    }
  }, [id, searchParams])

  const fetchCompanyData = async () => {
    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) throw companyError
      setCompany(companyData)

      // Fetch tussles
      const { data: tusslesData, error: tusslesError } = await supabase
        .from('tussles')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })

      if (tusslesError) throw tusslesError
      setTussles(tusslesData || [])
    } catch (error) {
      console.error('Error fetching company data:', error)
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

  const totalRevenue = tussles.reduce((sum, t) => sum + (t.sell_price || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-slate-200 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Companies
        </button>
        
        <div className="glass-panel p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{company?.name}</h1>
              <p className="text-slate-200">{tussles.length} tussles</p>
            </div>
            <motion.button
              onClick={() => setShowTussleModal(true)}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all ${
                searchParams.get('openTussle') === 'true' ? 'animate-pulse-glow' : ''
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Tussle
            </motion.button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Revenue</span>
              <span className="text-2xl font-bold text-nature-mint">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tussles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tussles.map((tussle, index) => (
          <motion.div
            key={tussle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/tussles/${tussle.id}`)}
            className="glass-panel p-5 cursor-pointer hover:shadow-glow-teal transition-all"
          >
            {tussle.image_url && (
              <img
                src={tussle.image_url}
                alt={tussle.name}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{tussle.name}</h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tussle.status === 'completed' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {tussle.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
              {tussle.due_date && (
                <span className="text-xs text-slate-400">{formatDate(tussle.due_date)}</span>
              )}
            </div>
            
            <div className="text-nature-mint font-semibold text-lg">
              {formatCurrency(tussle.sell_price)}
            </div>
          </motion.div>
        ))}
      </div>

      {tussles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-12 text-center"
        >
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No tussles yet</p>
          <p className="text-slate-400 text-sm mt-2">Click "Add Tussle" to create your first order</p>
        </motion.div>
      )}

      {/* Create Tussle Modal */}
      <AnimatePresence>
        {showTussleModal && (
          <CreateTussleModal
            companyId={id}
            onClose={() => setShowTussleModal(false)}
            onSuccess={() => {
              setShowTussleModal(false)
              fetchCompanyData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Tussle Modal Component
const CreateTussleModal = ({ companyId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    sell_price: '',
    due_date: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl = null

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        const { url, error: uploadError } = await uploadImage(imageFile)
        setUploading(false)
        
        if (uploadError) {
          throw new Error('Failed to upload image: ' + uploadError.message)
        }
        imageUrl = url
      }

      const { data, error } = await supabase
        .from('tussles')
        .insert([{
          company_id: companyId,
          name: formData.name,
          sell_price: parseFloat(formData.sell_price),
          due_date: formData.due_date || null,
          image_url: imageUrl,
          status: 'pending',
        }])
        .select()
        .single()

      if (error) throw error

      // Redirect to the new tussle detail page
      navigate(`/tussles/${data.id}`)
    } catch (error) {
      console.error('Error creating tussle:', error)
      alert(error.message || 'Error creating tussle. Please try again.')
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
        className="glass-panel p-6 sm:p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Create New Tussle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Tussle Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="e.g., Red Velvet Tussle"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Sell Price (PKR) *
            </label>
            <input
              type="number"
              value={formData.sell_price}
              onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
              placeholder="50000"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 glass-button text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Tussle Image
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 glass-button border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-400">Click to upload image</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <motion.button
              type="submit"
              disabled={saving || uploading}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-3 bg-gradient-to-r from-nature-teal to-nature-mint text-white font-semibold rounded-xl shadow-glow-teal hover:shadow-glow transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading Image...' : saving ? 'Creating...' : 'Create Tussle'}
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
