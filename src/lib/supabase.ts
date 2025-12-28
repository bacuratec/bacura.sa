import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'bacora-amal',
    },
  },
})

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Profile = Tables<'profiles'>
export type Service = Tables<'services'>
export type Request = Tables<'requests'>
export type Project = Tables<'projects'>
export type Attachment = Tables<'attachments'>
export type Rating = Tables<'ratings'>
export type Ticket = Tables<'tickets'>
export type TicketMessage = Tables<'ticket_messages'>
export type FAQ = Tables<'faqs'>
export type Partner = Tables<'partners'>
export type Customer = Tables<'customers'>
export type Notification = Tables<'notifications'>
export type City = Tables<'cities'>
export type EntityType = Tables<'entity_types'>
export type RequestStatus = Tables<'request_statuses'>
export type ProjectStatus = Tables<'project_statuses'>
export type TicketStatus = Tables<'ticket_statuses'>

export type UserRole = 'Admin' | 'Provider' | 'Requester'
export type EntityTypeType = 'requester' | 'provider'
