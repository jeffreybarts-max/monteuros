import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Thermometer, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase, type Project } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    checkConnection()
    loadProjects()
  }, [])

  async function checkConnection() {
    try {
      const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true })
      if (error) throw error
      setConnectionStatus('connected')
    } catch (err) {
      console.error('Connection error:', err)
      setConnectionStatus('error')
    }
  }

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, customer:customers(*)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error loading projects:', err)
      // Mock data for testing
      setProjects([
        {
          id: '1',
          title: 'F470 Installatie - Familie Jansen',
          status: 'active',
          priority: 'high',
          heatpump_model: 'F470',
          created_at: new Date().toISOString(),
          customer: { id: '1', name: 'Familie Jansen', city: 'Rekken', created_at: '', updated_at: '' },
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Storing S2125 - Geen warm water',
          status: 'active',
          priority: 'urgent',
          heatpump_model: 'S2125',
          created_at: new Date().toISOString(),
          customer: { id: '2', name: 'Dhr. van Dijk', city: 'Eibergen', created_at: '', updated_at: '' },
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        connectionStatus === 'connected' ? 'bg-green-50 text-green-700' :
        connectionStatus === 'error' ? 'bg-red-50 text-red-700' :
        'bg-yellow-50 text-yellow-700'
      }`}>
        {connectionStatus === 'connected' ? <CheckCircle size={20} /> :
         connectionStatus === 'error' ? <AlertCircle size={20} /> :
         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        <span>
          {connectionStatus === 'connected' ? 'Verbonden met Supabase!' :
           connectionStatus === 'error' ? 'Verbindingsfout - Mock data actief' :
           'Verbinding controleren...'}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/warmtepompscan')}
          className="card text-left hover:border-orange-500 transition-colors group"
        >
          <Thermometer className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-lg">Nieuwe Warmtepompscan</h3>
          <p className="text-gray-500 text-sm">Start een nieuwe scan</p>
        </button>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recente Projecten</h2>
        {loading ? (
          <p>Laden...</p>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <div key={project.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.customer?.name} - {project.customer?.city}</p>
                    {project.heatpump_model && (
                      <p className="text-xs text-orange-600 mt-1">{project.heatpump_model}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.priority === 'urgent' ? 'Spoed' : project.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
