import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PieChart, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('leandro_teza@hotmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Falha na autenticação',
        description: 'Verifique suas credenciais e tente novamente.',
      })
    } else {
      toast({
        title: 'Acesso liberado',
        description: 'Você foi autenticado com sucesso.',
      })
      navigate('/')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
              <PieChart className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-black text-slate-900 tracking-tight">
            Bem-vindo ao Board<span className="text-indigo-600">ECD</span>
          </CardTitle>
          <CardDescription className="text-center font-medium text-slate-500">
            Acesse a sua conta para analisar arquivos SPED.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 focus-visible:ring-indigo-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 focus-visible:ring-indigo-600"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-11"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Sistema'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
