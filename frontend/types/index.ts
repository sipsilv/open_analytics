export interface User {
  id: number | string
  user_id?: string  // Unique immutable user ID from backend
  username: string
  name?: string
  email: string
  mobile?: string
  role: 'user' | 'admin' | 'super_admin'
  is_active: boolean
  account_status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
  theme_preference?: string
  created_at?: string
  updated_at?: string
  last_seen?: string
  last_active_at?: string
  is_online?: boolean
}

export interface AccessRequest {
  id: string
  name: string
  email: string
  mobile?: string
  company?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  user_name: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
}

export interface Connection {
  id: string
  type: 'login' | 'database' | 'analytics' | 'ai_llm' | 'social_media' | 'broker'
  name: string
  status: 'active' | 'inactive' | 'error'
  config: Record<string, any>
  created_at: string
}

export interface Symbol {
  id: string
  symbol: string
  name: string
  exchange: string
  sector?: string
  is_active: boolean
}

export interface Indicator {
  id: string
  name: string
  type: string
  parameters: Record<string, any>
  is_active: boolean
}
