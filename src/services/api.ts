import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

export class BaseService {
  protected tableName: TableName

  constructor(tableName: TableName) {
    this.tableName = tableName
  }

  protected async handleSupabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { data, error } = await operation()
      
      if (error) {
        console.error(`Error in ${this.tableName}:`, error)
        return { data: null, error: error.message || 'An error occurred' }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error(`Unexpected error in ${this.tableName}:`, error)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  async getAll<T = any>() {
    return this.handleSupabaseOperation<T[]>(async () => {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
      return { data, error }
    })
  }

  async getById<T = any>(id: string) {
    return this.handleSupabaseOperation<T>(async () => {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    })
  }

  async create<T = any>(data: any) {
    return this.handleSupabaseOperation<T>(async () => {
      const { data: createdData, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single()
      return { data: createdData, error }
    })
  }

  async update<T = any>(id: string, data: Partial<any>) {
    return this.handleSupabaseOperation<T>(async () => {
      const { data: updatedData, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      return { data: updatedData, error }
    })
  }

  async delete(id: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
      return { data, error }
    })
  }
}

export class ProfileService extends BaseService {
  constructor() {
    super('profiles')
  }

  async getByEmail(email: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()
      return { data, error }
    })
  }

  async getByRole(role: 'Admin' | 'Provider' | 'Requester') {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
      return { data, error }
    })
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.update(userId, { avatar_url: avatarUrl })
  }

  async toggleBlock(userId: string, isBlocked: boolean) {
    return this.update(userId, { is_blocked: isBlocked })
  }

  async toggleSuspend(userId: string, isSuspended: boolean) {
    return this.update(userId, { is_suspended: isSuspended })
  }
}

export class RequestService extends BaseService {
  constructor() {
    super('requests')
  }

  async getByRequester(requesterId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          service:services(*),
          requester:profiles!requests_requester_id_fkey(*),
          provider:profiles!requests_provider_id_fkey(*),
          status:request_statuses(*)
        `)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getByProvider(providerId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          service:services(*),
          requester:profiles!requests_requester_id_fkey(*),
          provider:profiles!requests_provider_id_fkey(*),
          status:request_statuses(*)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getPending() {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          service:services(*),
          requester:profiles!requests_requester_id_fkey(*),
          status:request_statuses(*)
        `)
        .eq('status_id', (await supabase.from('request_statuses').select('id').eq('code', 'pending').single()).data?.id)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async updateStatus(requestId: string, statusCode: string) {
    return this.handleSupabaseOperation(async () => {
      const { data: statusData } = await supabase
        .from('request_statuses')
        .select('id')
        .eq('code', statusCode)
        .single()

      if (!statusData) {
        return { data: null, error: { message: 'Invalid status code' } }
      }

      const { data, error } = await supabase
        .from('requests')
        .update({ status_id: statusData.id })
        .eq('id', requestId)
        .select()
        .single()
      return { data, error }
    })
  }
}

export class ProjectService extends BaseService {
  constructor() {
    super('projects')
  }

  async getByRequester(requesterId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          request:requests(*),
          requester:profiles!projects_requester_id_fkey(*),
          provider:profiles!projects_provider_id_fkey(*),
          status:project_statuses(*)
        `)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getByProvider(providerId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          request:requests(*),
          requester:profiles!projects_requester_id_fkey(*),
          provider:profiles!projects_provider_id_fkey(*),
          status:project_statuses(*)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getActive() {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          request:requests(*),
          requester:profiles!projects_requester_id_fkey(*),
          provider:profiles!projects_provider_id_fkey(*),
          status:project_statuses(*)
        `)
        .in('status_id', [
          (await supabase.from('project_statuses').select('id').eq('code', 'waiting_approval').single()).data?.id,
          (await supabase.from('project_statuses').select('id').eq('code', 'waiting_start').single()).data?.id,
          (await supabase.from('project_statuses').select('id').eq('code', 'processing').single()).data?.id,
        ])
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async updateStatus(projectId: string, statusCode: string) {
    return this.handleSupabaseOperation(async () => {
      const { data: statusData } = await supabase
        .from('project_statuses')
        .select('id')
        .eq('code', statusCode)
        .single()

      if (!statusData) {
        return { data: null, error: { message: 'Invalid status code' } }
      }

      const { data, error } = await supabase
        .from('projects')
        .update({ status_id: statusData.id })
        .eq('id', projectId)
        .select()
        .single()
      return { data, error }
    })
  }
}

export class NotificationService extends BaseService {
  constructor() {
    super('notifications')
  }

  async getByUser(userId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async getUnread(userId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
      return { data, error }
    })
  }

  async markAsRead(notificationId: string) {
    return this.update(notificationId, { is_read: true })
  }

  async markAllAsRead(userId: string) {
    return this.handleSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      return { data, error }
    })
  }
}

export const profileService = new ProfileService()
export const requestService = new RequestService()
export const projectService = new ProjectService()
export const notificationService = new NotificationService()