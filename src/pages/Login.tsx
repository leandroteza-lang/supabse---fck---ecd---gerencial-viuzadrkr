import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { PieChart, Loader2, TrendingUp, ShieldCheck, Activity } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Verifique seu email para confirmar o cadastro.',
        })
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: error.message || 'Credenciais inválidas. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                Board<span className="text-indigo-600">ECD</span>
              </h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            {isSignUp
              ? 'Comece a analisar seus dados contábeis em segundos.'
              : 'Bem-vindo de volta! Insira suas credenciais para continuar.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-bold">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-sm bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                'Cadastrar'
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isSignUp
                ? 'Já tem uma conta? Faça login'
                : 'Ainda não tem conta? Cadastre-se grátis'}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/1200?q=finance')] opacity-10 bg-cover bg-center mix-blend-overlay" />

        <div className="relative z-10 max-w-2xl px-12 animate-fade-in">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Inteligência Contábil para Decisões Estratégicas
          </h2>
          <p className="text-lg text-indigo-200 mb-12 leading-relaxed font-medium">
            Transforme arquivos SPED ECD em dashboards interativos, DREs analíticas e indicadores de
            performance em poucos cliques.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <TrendingUp className="w-8 h-8 text-indigo-300 mb-4" />
              <h3 className="text-white font-bold mb-2">Dashboards Evolutivos</h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Acompanhe o crescimento das suas receitas e despesas mês a mês de forma visual.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <ShieldCheck className="w-8 h-8 text-emerald-300 mb-4" />
              <h3 className="text-white font-bold mb-2">Auditoria Integrada</h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                Valide a consistência dos seus saldos com o Bloco J oficial da Receita Federal.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 md:col-span-2">
              <Activity className="w-8 h-8 text-rose-300 mb-4" />
              <h3 className="text-white font-bold mb-2">Análise de EBITDA & Liquidez</h3>
              <p className="text-rose-100/80 text-sm leading-relaxed">
                Descubra a real geração de caixa do seu negócio e acompanhe de perto os principais
                indicadores de saúde financeira.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
