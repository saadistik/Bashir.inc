import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nature-emerald via-nature-forest to-nature-teal">
        <div className="glass-panel p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect based on role
    if (profile?.role === 'owner') {
      return <Navigate to="/dashboard" />
    } else {
      return <Navigate to="/home" />
    }
  }

  return children
}
