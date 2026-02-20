import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle,
  Save,
  ArrowLeft
} from 'lucide-react'
import { supabase, isMockMode } from '../lib/supabase'

const HEAT_PUMP_MODELS = [
  'F2120', 'F2040', 'F2050', 'F470', 'F370', 'F750',
  'S2125', 'S1155', 'S1255', 'S1256', 'S735',
  'F1155', 'F1255', 'F1245', 'F1345',
  'AMS 10-12', 'AMS 20-24', 'SPLIT',
  'Anders'
]

const ERROR_CODES = [
  '634 - Geen warm tapwater',
  '417 - Te hoge retourtemperatuur',
  '205 - Compressor probleem',
  '110 - Stroomuitval',
  '317 - Lage druk',
  '318 - Hoge druk',
  '414 - Flow probleem',
]

export default function Warmtepompscan() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    heatpump_model: '',
    serial_number: '',
    installation_year: '',
    current_power_kw: '',
    current_flow_temp: '',
    current_return_temp: '',
    current_pressure_bar: '',
    outdoor_temp: '',
    indoor_temp: '',
    tap_water_temp: '',
    cop_measured: '',
    is_functioning: true,
    error_codes: [] as string[],
    maintenance_needed: false,
    maintenance_notes: '',
    advice_summary: '',
    recommended_action: 'none',
    estimated_savings_percent: '',
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleErrorToggle = (errorCode: string) => {
    setFormData(prev => ({
      ...prev,
      error_codes: prev.error_codes.includes(errorCode)
        ? prev.error_codes.filter(e => e !== errorCode)
        : [...prev.error_codes, errorCode]
    }))
  }

  const handleSubmit = async () => {
    setIsSaving(true)

    try {
      // In mock mode, just simulate success
      if (isMockMode) {
        console.log('Mock mode: Simulating scan save', formData)
        await new Promise(resolve => setTimeout(resolve, 500))
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/')
        }, 2000)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('heatpump_scans')
        .insert({
          heatpump_model: formData.heatpump_model,
          serial_number: formData.serial_number,
          installation_year: formData.installation_year ? parseInt(formData.installation_year) : null,
          current_power_kw: formData.current_power_kw ? parseFloat(formData.current_power_kw) : null,
          current_flow_temp: formData.current_flow_temp ? parseFloat(formData.current_flow_temp) : null,
          current_return_temp: formData.current_return_temp ? parseFloat(formData.current_return_temp) : null,
          current_pressure_bar: formData.current_pressure_bar ? parseFloat(formData.current_pressure_bar) : null,
          outdoor_temp: formData.outdoor_temp ? parseFloat(formData.outdoor_temp) : null,
          indoor_temp: formData.indoor_temp ? parseFloat(formData.indoor_temp) : null,
          tap_water_temp: formData.tap_water_temp ? parseFloat(formData.tap_water_temp) : null,
          cop_measured: formData.cop_measured ? parseFloat(formData.cop_measured) : null,
          is_functioning: formData.is_functioning,
          error_codes: formData.error_codes,
          maintenance_needed: formData.maintenance_needed,
          maintenance_notes: formData.maintenance_notes,
          advice_summary: formData.advice_summary,
          recommended_action: formData.recommended_action,
          estimated_savings_percent: formData.estimated_savings_percent ? parseInt(formData.estimated_savings_percent) : null,
          monteur_id: user?.id,
        })

      if (error) throw error

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/')
      }, 2000)
    } catch (err: any) {
      console.error('Error saving scan:', err)
      alert('Fout bij opslaan: ' + (err?.message || 'Onbekende fout'))
    } finally {
      setIsSaving(false)
    }
  }

  const canSubmit = formData.heatpump_model && formData.serial_number

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Warmtepompscan</h1>
      </div>

      {/* Demo Mode Notice */}
      {isMockMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-blue-500" size={20} />
          <span className="text-blue-700">
            Demo modus - Scans worden lokaal opgeslagen en niet naar de database verstuurd.
          </span>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <span className="text-green-700">Scan succesvol opgeslagen!</span>
        </div>
      )}

      {/* Algemene Info */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Algemene Informatie</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
            <select
              value={formData.heatpump_model}
              onChange={(e) => handleInputChange('heatpump_model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Selecteer</option>
              {HEAT_PUMP_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serienummer *</label>
            <input
              type="text"
              value={formData.serial_number}
              onChange={(e) => handleInputChange('serial_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bouwjaar</label>
            <input
              type="number"
              value={formData.installation_year}
              onChange={(e) => handleInputChange('installation_year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Technische Metingen */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Technische Metingen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'current_power_kw', label: 'Vermogen (kW)' },
            { key: 'current_flow_temp', label: 'Aanvoer (°C)' },
            { key: 'current_return_temp', label: 'Retour (°C)' },
            { key: 'current_pressure_bar', label: 'Druk (bar)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                step="0.1"
                value={(formData as any)[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Omgeving */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Omgeving</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'outdoor_temp', label: 'Buiten (°C)' },
            { key: 'indoor_temp', label: 'Binnen (°C)' },
            { key: 'tap_water_temp', label: 'Tapwater (°C)' },
            { key: 'cop_measured', label: 'COP' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                step="0.1"
                value={(formData as any)[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Storingen */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" size={20} />
          Storingen
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_functioning}
              onChange={(e) => handleInputChange('is_functioning', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Installatie functioneert normaal</span>
          </label>

          {!formData.is_functioning && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {ERROR_CODES.map(code => (
                <label key={code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.error_codes.includes(code)}
                    onChange={() => handleErrorToggle(code)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{code}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Onderhoud & Advies */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Onderhoud & Advies</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.maintenance_needed}
              onChange={(e) => handleInputChange('maintenance_needed', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Onderhoud aanbevolen</span>
          </label>

          {formData.maintenance_needed && (
            <textarea
              value={formData.maintenance_notes}
              onChange={(e) => handleInputChange('maintenance_notes', e.target.value)}
              placeholder="Onderhoud notities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aanbevolen Actie</label>
            <select
              value={formData.recommended_action}
              onChange={(e) => handleInputChange('recommended_action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="none">Geen</option>
              <option value="maintenance">Onderhoud</option>
              <option value="repair">Reparatie</option>
              <option value="replacement">Vervanging</option>
              <option value="investigation">Nader onderzoek</option>
            </select>
          </div>

          <textarea
            value={formData.advice_summary}
            onChange={(e) => handleInputChange('advice_summary', e.target.value)}
            placeholder="Advies samenvatting..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geschatte besparing (%)</label>
            <input
              type="number"
              value={formData.estimated_savings_percent}
              onChange={(e) => handleInputChange('estimated_savings_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 text-gray-600 hover:text-gray-900"
        >
          Annuleren
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
            canSubmit && !isSaving
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Save size={18} />
              Scan Opslaan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
