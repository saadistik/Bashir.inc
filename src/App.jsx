import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Companies } from './pages/Companies'
import { CompanyDetail } from './pages/CompanyDetail'
import { TussleDetail } from './pages/TussleDetail'
import { Calendar } from './pages/Calendar'
import { Workers } from './pages/Workers'
import { Profile } from './pages/Profile'

function AppRoutes() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nature-emerald via-nature-forest to-nature-teal">
        <div className="glass-panel p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes with Layout */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Employee Routes */}
        <Route path="/home" element={
          <ProtectedRoute requiredRole="employee">
            <Home />
          </ProtectedRoute>
        } />

        {/* Owner Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="owner">
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Shared Routes */}
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/tussles/:id" element={<TussleDetail />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Root redirect based on role */}
      <Route path="/" element={
        profile ? (
          <Navigate to={profile.role === 'owner' ? '/dashboard' : '/home'} replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
