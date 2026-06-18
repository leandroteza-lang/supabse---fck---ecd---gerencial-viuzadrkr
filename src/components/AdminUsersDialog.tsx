import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  AdminUser,
  createUser,
  deleteUser,
  listUsers,
  resetPassword,
} from '@/lib/admin-users'
import { Loader2, UserPlus, KeyRound, Trash2, RefreshCw } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AdminUsersDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [creating, setCreating] = useState(false)

  // formulário de novo usuário
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')

  // reset de senha
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [resetValue, setResetValue] = useState('')
  const [resetting, setResetting] = useState(false)

  // exclusão
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = async () => {
    setLoadingList(true)
    try {
      const { users } = await listUsers()
      setUsers(users)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao listar usuários', description: e.message })
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (open) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      })
      return
    }
    setCreating(true)
    try {
      await createUser({ email: email.trim(), password, full_name: fullName.trim() })
      toast({ title: 'Usuário criado!', description: `${email} já pode acessar o sistema.` })
      setEmail('')
      setFullName('')
      setPassword('')
      await refresh()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: e.message })
    } finally {
      setCreating(false)
    }
  }

  const handleReset = async () => {
    if (!resetTarget) return
    if (resetValue.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      })
      return
    }
    setResetting(true)
    try {
      await resetPassword(resetTarget.id, resetValue)
      toast({ title: 'Senha redefinida!', description: `Nova senha definida para ${resetTarget.email}.` })
      setResetTarget(null)
      setResetValue('')
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao redefinir senha', description: e.message })
    } finally {
      setResetting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      toast({ title: 'Usuário excluído', description: `${deleteTarget.email} foi removido.` })
      setDeleteTarget(null)
      await refresh()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: e.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar usuários</DialogTitle>
            <DialogDescription>
              Crie contas e redefina senhas. Novos usuários já entram com o e-mail confirmado.
            </DialogDescription>
          </DialogHeader>

          {/* Novo usuário */}
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-50 p-4 rounded-lg border"
          >
            <div className="space-y-1.5">
              <Label htmlFor="adm-email">Email</Label>
              <Input
                id="adm-email"
                type="email"
                placeholder="pessoa@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-name">Nome</Label>
              <Input
                id="adm-name"
                placeholder="Opcional"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-pass">Senha</Label>
              <Input
                id="adm-pass"
                type="text"
                placeholder="Mín. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={creating} className="bg-indigo-600 hover:bg-indigo-700">
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" /> Criar
                </>
              )}
            </Button>
          </form>

          {/* Lista */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-slate-600">
              {users.length} usuário(s)
            </span>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loadingList}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingList ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          <div className="max-h-[45vh] overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                      <Loader2 className="w-5 h-5 animate-spin inline" />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                      Nenhum usuário.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell className="text-slate-500">{u.full_name ?? '—'}</TableCell>
                      <TableCell>
                        {u.is_admin ? (
                          <Badge className="bg-indigo-600">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">Usuário</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setResetValue('')
                            setResetTarget(u)
                          }}
                          title="Redefinir senha"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          disabled={u.id === user?.id}
                          onClick={() => setDeleteTarget(u)}
                          title={u.id === user?.id ? 'Você não pode excluir a si mesmo' : 'Excluir'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de reset de senha */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => {
          if (!o) setResetTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para <strong>{resetTarget?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reset-pass">Nova senha</Label>
            <Input
              id="reset-pass"
              type="text"
              value={resetValue}
              onChange={(e) => setResetValue(e.target.value)}
              placeholder="Mín. 6 caracteres"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setResetTarget(null)} disabled={resetting}>
              Cancelar
            </Button>
            <Button
              onClick={handleReset}
              disabled={resetting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar senha'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente <strong>{deleteTarget?.email}</strong> e os dados
              vinculados a ele. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
