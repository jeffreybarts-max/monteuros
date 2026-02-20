import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase, isMockMode } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import Warmtepompscan from './pages/Warmtepompscan'
import Layout from './components/Layout'

// Mock session for test mode (no Supabase required)
const createMockSession = () => ({
  user: {
    id: 'test-monteur-001',
    email: 'test@barts.nl',
    user_metadata: {
      full_name: 'Test Monteur'
    }
  },
  access_token: 'mock-token',
  expires_at: Date.now() + 86400000 // 24 hours
})

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored mock session first
    const storedMockSession = localStorage.getItem('monteuros_mock_session')
    if (storedMockSession) {
      try {
        setSession(JSON.parse(storedMockSession))
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem('monteuros_mock_session')
      }
    }

    // Try Supabase session (if configured)
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.log('Supabase session check:', error.message)
        }
        setSession(session)
      } catch (err) {
        console.log('Supabase not available, using test mode only')
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Subscribe to auth changes
    let subscription: { unsubscribe: () => void } | null = null
    try {
      const { data } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setSession(session)
      })
      subscription = data.subscription
    } catch (err) {
      console.log('Auth state change not available')
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleTestLogin = async () => {
    setError(null)
    try {
      // Try Supabase auth first (if configured)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@barts.nl',
        password: 'test123'
      })

      if (error || !data.session) {
        // Fallback: use mock session for demo/test mode
        console.log('Using mock session for test mode')
        const mockSession = createMockSession()
        localStorage.setItem('monteuros_mock_session', JSON.stringify(mockSession))
        setSession(mockSession)
      }
    } catch (err: any) {
      // If Supabase fails (e.g., not configured), use mock session
      console.log('Supabase error, using mock session:', err?.message || err)
      const mockSession = createMockSession()
      localStorage.setItem('monteuros_mock_session', JSON.stringify(mockSession))
      setSession(mockSession)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">MonteurOS</h1>
          <p className="text-gray-600 mb-6 text-center">
            Test modus - Geen login nodig
          </p>
          {isMockMode && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              ℹ️ Supabase is niet geconfigureerd. Demo modus actief.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleTestLogin}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Doorgaan als Test Monteur
          </button>
          <p className="mt-4 text-xs text-gray-400 text-center">
            Demo modus - werkt zonder database configuratie
          </p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/warmtepompscan" element={<Warmtepompscan />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
