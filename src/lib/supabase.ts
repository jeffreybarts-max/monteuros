import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Profile = {
  id: string
  full_name: string
  email: string
  phone?: string
  role: 'admin' | 'monteur'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Customer = {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  postal_code?: string
  city?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  customer_id?: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  heatpump_model?: string
  installation_date?: string
  warranty_until?: string
  notes?: string
  created_at: string
  updated_at: string
  customer?: Customer
}

export type HeatpumpScan = {
  id: string
  project_id?: string
  customer_id?: string
  monteur_id?: string
  scan_date: string
  heatpump_model: string
  serial_number?: string
  installation_year?: number
  current_power_kw?: number
  current_flow_temp?: number
  current_return_temp?: number
  current_pressure_bar?: number
  outdoor_temp?: number
  indoor_temp?: number
  tap_water_temp?: number
  cop_measured?: number
  is_functioning: boolean
  error_codes?: string[]
  maintenance_needed: boolean
  maintenance_notes?: string
  advice_summary?: string
  recommended_action?: 'none' | 'maintenance' | 'repair' | 'replacement' | 'investigation'
  estimated_savings_percent?: number
  report_generated: boolean
  report_url?: string
  created_at: string
  updated_at: string
}
