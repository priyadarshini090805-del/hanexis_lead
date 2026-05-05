export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost'
export type LeadSource = 'linkedin' | 'instagram' | 'manual' | 'import'

export interface Lead {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  source: LeadSource
  status: LeadStatus
  tags: string[]
  notes?: string
  linkedin_url?: string
  instagram_handle?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface AIMessage {
  id: string
  user_id: string
  lead_id: string
  type: 'connection' | 'followup' | 'pitch'
  content: string
  lead?: Lead
  created_at: string
}

export interface DashboardStats {
  total_leads: number
  new_leads: number
  contacted: number
  converted: number
  conversion_rate: number
}
