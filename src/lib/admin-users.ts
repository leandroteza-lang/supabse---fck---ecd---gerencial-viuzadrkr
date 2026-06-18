import { supabase } from '@/lib/supabase/client'

// Wrappers finos sobre a Edge Function "admin-users".
// O supabase-js anexa automaticamente o access token da sessão atual na chamada,
// então a função consegue identificar e autorizar o chamador (admin).

export interface AdminUser {
  id: string
  email: string | null
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  full_name: string | null
  is_admin: boolean
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body })
  if (error) {
    // Tenta extrair a mensagem de erro retornada pela função (corpo JSON)
    let message = error.message
    try {
      const ctx = (error as { context?: Response }).context
      if (ctx && typeof ctx.json === 'function') {
        const parsed = await ctx.json()
        if (parsed?.error) message = parsed.error
      }
    } catch {
      // mantém a mensagem padrão
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data as T
}

export function listUsers() {
  return invoke<{ users: AdminUser[] }>({ action: 'list' })
}

export function createUser(params: {
  email: string
  password: string
  full_name?: string
}) {
  return invoke<{ user: unknown }>({ action: 'create', ...params })
}

export function resetPassword(userId: string, password: string) {
  return invoke<{ ok: true }>({ action: 'reset-password', userId, password })
}

export function deleteUser(userId: string) {
  return invoke<{ ok: true }>({ action: 'delete', userId })
}
