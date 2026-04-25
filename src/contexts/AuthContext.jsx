import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})
const SESSION_STORAGE_KEY = 'bashir_inc_local_session'
const ALLOWED_USERNAMES = new Set(['bashir', 'farhan'])

const normalizeUsername = (value) => (value || '').trim().toLowerCase()

const isAllowedProfile = (currentProfile) => {
  if (!currentProfile) return false
  const normalizedUsername = normalizeUsername(currentProfile.username)
  const isAllowedRole = currentProfile.role === 'admin' || currentProfile.role === 'employee'
  return isAllowedRole && ALLOWED_USERNAMES.has(normalizedUsername)
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY)
        if (!savedSession) {
          setLoading(false)
          return
        }

        const parsed = JSON.parse(savedSession)
        const sessionId = parsed?.id

        if (!sessionId) {
          localStorage.removeItem(SESSION_STORAGE_KEY)
          setLoading(false)
          return
        }

        await fetchProfile(sessionId)
      } catch (error) {
        console.error('Error restoring session:', error)
        localStorage.removeItem(SESSION_STORAGE_KEY)
        setLoading(false)
      }
    }

    initializeSession()
  }, [])

  const fetchProfile = async (profileId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle()

      if (error) throw error

      if (!isAllowedProfile(data)) {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        setUser(null)
        setProfile(null)
        return
      }

      setUser({ id: data.id, username: data.username, role: data.role })
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      localStorage.removeItem(SESSION_STORAGE_KEY)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (username, password) => {
    try {
      const normalizedUsername = normalizeUsername(username)

      if (!ALLOWED_USERNAMES.has(normalizedUsername)) {
        throw new Error('This account is not allowed to access the system')
      }

      const { data, error } = await supabase.rpc('login_user', {
        p_username: normalizedUsername,
        p_password: password,
      })

      if (error) throw error

      if (!data) {
        throw new Error('Invalid username or password')
      }

      const loggedInProfile = Array.isArray(data) ? data[0] : data

      if (!isAllowedProfile(loggedInProfile)) {
        throw new Error('This account is not allowed to access the system')
      }

      const nextUser = {
        id: loggedInProfile.id,
        username: loggedInProfile.username,
        role: loggedInProfile.role,
      }

      setUser(nextUser)
      setProfile(loggedInProfile)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: loggedInProfile.id }))

      return { data: { user: nextUser }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
