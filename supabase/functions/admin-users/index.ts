// Edge Function: admin-users
// Operações administrativas de usuários (criar, listar, resetar senha, excluir).
// Usa a service_role key (server-side, NUNCA exposta no frontend) e só permite
// que usuários com profiles.is_admin = true executem as ações.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization') ?? ''

    // Cliente no contexto do chamador: identifica quem está chamando
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return json({ error: 'Não autenticado.' }, 401)
    }

    // Cliente admin (ignora RLS) para verificar permissão e executar ações
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!callerProfile?.is_admin) {
      return json({ error: 'Acesso negado: requer privilégio de admin.' }, 403)
    }

    const body = await req.json().catch(() => ({}))
    const action = body?.action as string

    switch (action) {
      case 'list': {
        const { data, error } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        })
        if (error) return json({ error: error.message }, 400)

        const ids = data.users.map((u) => u.id)
        const { data: profiles } = await adminClient
          .from('profiles')
          .select('id, full_name, is_admin')
          .in('id', ids)
        const profileById = new Map(
          (profiles ?? []).map((p) => [p.id, p]),
        )

        const users = data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          full_name: profileById.get(u.id)?.full_name ?? null,
          is_admin: profileById.get(u.id)?.is_admin ?? false,
        }))
        return json({ users })
      }

      case 'create': {
        const email = (body.email ?? '').trim()
        const password = body.password ?? ''
        const full_name = (body.full_name ?? '').trim() || null
        if (!email || !password) {
          return json({ error: 'Email e senha são obrigatórios.' }, 400)
        }
        const { data, error } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: full_name ? { name: full_name } : {},
        })
        if (error) return json({ error: error.message }, 400)
        return json({ user: data.user })
      }

      case 'reset-password': {
        const userId = body.userId as string
        const password = body.password ?? ''
        if (!userId || !password) {
          return json({ error: 'userId e senha são obrigatórios.' }, 400)
        }
        const { error } = await adminClient.auth.admin.updateUserById(userId, {
          password,
        })
        if (error) return json({ error: error.message }, 400)
        return json({ ok: true })
      }

      case 'delete': {
        const userId = body.userId as string
        if (!userId) return json({ error: 'userId é obrigatório.' }, 400)
        if (userId === user.id) {
          return json({ error: 'Você não pode excluir a própria conta.' }, 400)
        }
        const { error } = await adminClient.auth.admin.deleteUser(userId)
        if (error) return json({ error: error.message }, 400)
        return json({ ok: true })
      }

      default:
        return json({ error: `Ação inválida: ${action}` }, 400)
    }
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Erro interno.' }, 500)
  }
})
