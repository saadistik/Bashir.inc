import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})
const ALLOWED_USERNAMES = new Set(['zeeshan', 'bashir', 'farhan'])

const normalizeUsername = (value) => (value || '').trim().toLowerCase()

const isAllowedProfile = (currentProfile) => {
  if (!currentProfile) return false
  const normalizedUsername = normalizeUsername(currentProfile.username)
  const isAllowedRole = currentProfile.role === 'owner' || currentProfile.role === 'employee'
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (!isAllowedProfile(data)) {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
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

      // Map username to email format
      const email = `${normalizedUsername}@bashir.inc`
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', data.user.id)
        .single()

      if (profileError || !isAllowedProfile(profileData)) {
        await supabase.auth.signOut()
        throw new Error('This account is not allowed to access the system')
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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
