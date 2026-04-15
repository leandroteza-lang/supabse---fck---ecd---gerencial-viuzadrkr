// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area as RechartsArea,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from 'recharts'
import {
  Upload,
  FileText,
  Search,
  Download,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  CalendarDays,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Check,
  ChevronsUpDown,
  X,
  Activity,
  Files,
  ChevronDown,
  Briefcase,
  PieChart,
  Settings,
  RotateCcw,
  Plus,
  Zap,
  HelpCircle,
  ListOrdered,
  Filter,
  Layers,
  Scale,
  Percent,
  Landmark,
  Timer,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Save,
  Edit2,
  Server,
  ShieldCheck,
  Info,
} from 'lucide-react'
import localforage from 'localforage'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

const CHART_COLORS = [
  {
    bg: 'bg-indigo-500',
    hover: 'group-hover:bg-indigo-400',
    border: 'border-indigo-500',
    text: 'text-indigo-600',
    stroke: 'stroke-indigo-500',
    fill: 'fill-indigo-500',
    hex: '#6366f1',
  },
  {
    bg: 'bg-emerald-500',
    hover: 'group-hover:bg-emerald-400',
    border: 'border-emerald-500',
    text: 'text-emerald-600',
    stroke: 'stroke-emerald-500',
    fill: 'fill-emerald-500',
    hex: '#10b981',
  },
  {
    bg: 'bg-amber-500',
    hover: 'group-hover:bg-amber-400',
    border: 'border-amber-500',
    text: 'text-amber-600',
    stroke: 'stroke-amber-500',
    fill: 'fill-amber-500',
    hex: '#f59e0b',
  },
  {
    bg: 'bg-rose-500',
    hover: 'group-hover:bg-rose-400',
    border: 'border-rose-500',
    text: 'text-rose-600',
    stroke: 'stroke-rose-500',
    fill: 'fill-rose-500',
    hex: '#f43f5e',
  },
  {
    bg: 'bg-cyan-500',
    hover: 'group-hover:bg-cyan-400',
    border: 'border-cyan-500',
    text: 'text-cyan-600',
    stroke: 'stroke-cyan-500',
    fill: 'fill-cyan-500',
    hex: '#06b6d4',
  },
]

// Recharts custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm text-slate-800 text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-200">
        <p className="font-bold border-b border-slate-100 pb-2 mb-3 text-slate-900">{label}</p>
        {payload.map((entry: any, index: number) => {
          let formattedValue = ''
          const name = entry.name

          if (
            [
              'Margem (%)',
              'Margem Bruta',
              'Margem Operacional',
              'Margem Líquida',
              'ROE',
              'ROA',
            ].includes(name)
          ) {
            formattedValue = `${Number(entry.value).toFixed(2)}%`
          } else if (['PMR (dias)', 'PMP (dias)'].includes(name)) {
            formattedValue = `${Number(entry.value).toFixed(0)} dias`
          } else if (name === 'Giro Ativo') {
            formattedValue = `${Number(entry.value).toFixed(2)}x`
          } else if (['Corrente', 'Seca', 'Imediata', 'Geral'].includes(name)) {
            formattedValue = Number(entry.value).toFixed(2)
          } else {
            formattedValue = `R$ ${Number(entry.value).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          }

          return (
            <div key={index} className="flex items-center justify-between gap-8 py-1">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[13px] font-medium truncate max-w-[200px] text-slate-600">
                  {entry.name}
                </span>
              </div>
              <span className="font-mono font-bold text-[13px] text-slate-800">
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 backdrop-blur-sm text-slate-800 text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-200">
        <p className="font-bold border-b border-slate-100 pb-2 mb-2 text-slate-900 flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          ></span>
          {data.name}
        </p>
        <div className="flex flex-col gap-1 mt-2">
          <span className="font-mono font-bold text-[14px] text-slate-800">
            R${' '}
            {Number(data.value).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Representa {data.percent ? (data.percent * 100).toFixed(1) : 0}% do total
          </span>
        </div>
      </div>
    )
  }
  return null
}

const CustomPctTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm text-slate-800 text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-200">
        <p className="font-bold border-b border-slate-100 pb-2 mb-3 text-slate-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-8 py-1">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[13px] font-medium truncate max-w-[200px] text-slate-600">
                {entry.name}
              </span>
            </div>
            <span className="font-mono font-bold text-[13px] text-slate-800">
              {Number(entry.value).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const DRE_GROUPS_OPTIONS = [
  { id: '01_RECEITA_BRUTA', label: '1. Receita Bruta de Vendas e Serviços' },
  { id: '02_DEDUCOES', label: '2. (-) Deduções da Receita Bruta' },
  { id: '04_CUSTOS', label: '4. (-) Custos Operacionais (CMV/CPV)' },
  { id: '06A_DESPESAS_PESSOAL', label: '6.1 (-) Despesas (Pessoal)' },
  { id: '06B_DESPESAS_ADM', label: '6.2 (-) Despesas (Administrativas/Gerais)' },
  { id: '06C_DESPESAS_TRIB', label: '6.3 (-) Despesas (Tributárias)' },
  { id: '06D_OUTRAS_DESPESAS', label: '6.4 (-) Outras Despesas Operacionais' },
  { id: '07_OUTRAS_RECEITAS', label: '7. (+) Outras Receitas Operacionais' },
  { id: '09_FINANCEIRO', label: '9. (+/-) Resultado Financeiro' },
  { id: '11_TRIBUTOS', label: '11. (-) Provisão para Tributos sobre Lucro' },
  { id: '13_PARTICIPACOES', label: '13. (-) Participações e Contribuições' },
]

const parseSpedDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 8) return dateStr
  return `${dateStr.substring(0, 2)}/${dateStr.substring(2, 4)}/${dateStr.substring(4, 8)}`
}

const parseSpedDateDb = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 8) return null
  return `${dateStr.substring(4, 8)}-${dateStr.substring(2, 4)}-${dateStr.substring(0, 2)}`
}

const IndicatorTooltip = ({ text, example }: { text: string; example: string }) => (
  <UITooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 cursor-help ml-1.5 inline-block" />
    </TooltipTrigger>
    <TooltipContent className="max-w-[300px] p-3 text-xs leading-relaxed shadow-xl border-slate-200 z-50 bg-white">
      <p className="font-semibold text-slate-700 mb-1">{text}</p>
      <p className="text-slate-500 italic">{example}</p>
    </TooltipContent>
  </UITooltip>
)

const dateStrToMs = (dateStr: string) => {
  if (!dateStr || dateStr.length < 10) return 0
  const [d, m, y] = dateStr.split('/')
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)).getTime()
}

const ExplanationPanel = ({
  title,
  description,
  indicators,
}: {
  title: string
  description: string
  indicators: any[]
}) => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 md:p-6 mb-8 transition-all">
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <HelpCircle className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-indigo-900 tracking-tight">{title}</h3>
            {!isOpen && (
              <p className="text-sm text-indigo-600/80 font-medium">
                Clique para ver como ler este guia detalhado
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-indigo-200/50 animate-in slide-in-from-top-4 duration-300">
          <p className="mb-6 text-indigo-950/90 leading-relaxed font-medium text-[15px]">
            {description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicators.map((ind: any, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-black text-indigo-900 block mb-2 text-sm uppercase tracking-wide">
                  {ind.name}
                </span>
                <span className="text-slate-600 text-[14px] leading-relaxed block">{ind.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const EditableTitle = ({
  initialTitle,
  defaultTitle,
  onSave,
  className,
}: {
  initialTitle: string
  defaultTitle: string
  onSave: (val: string) => void
  className: string
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [val, setVal] = useState(initialTitle || '')

  useEffect(() => {
    setVal(initialTitle || '')
  }, [initialTitle])

  const handleSave = () => {
    setIsEditing(false)
    if (val !== (initialTitle || '')) {
      onSave(val)
    }
  }

  const handleCancel = () => {
    setVal(initialTitle || '')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <h3
          className={className
            .replace('border-b', 'border-transparent')
            .replace('bg-transparent', '')}
        >
          {val || defaultTitle}
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors border border-slate-200 hover:border-indigo-200"
        >
          <Edit2 className="w-3.5 h-3.5" /> Editar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={val}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') handleCancel()
        }}
        placeholder={defaultTitle}
        className={className + ' shadow-sm border-indigo-200 bg-white'}
      />
      <button
        onClick={handleSave}
        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors shadow-sm whitespace-nowrap"
      >
        <Save className="w-3.5 h-3.5" /> Salvar
      </button>
      <button
        onClick={handleCancel}
        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function App() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState([])
  const [companyInfo, setCompanyInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filesCount, setFilesCount] = useState(0)

  const [isAccumulated, setIsAccumulated] = useState(true)
  const [showAV, setShowAV] = useState(false)
  const [showAH, setShowAH] = useState(false)

  // Carrega os dados da nuvem (Supabase) ou do cache local na inicialização
  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      try {
        setLoading(true)

        // 1. Check if we have the company in Supabase
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (companiesError) throw companiesError

        if (companies && companies.length > 0) {
          const company = companies[0]

          // 2. Check local cache first for speed
          const cachedCnpj = await localforage.getItem('ecd_company_cnpj')
          if (cachedCnpj === company.cnpj) {
            const cachedData = await localforage.getItem('ecd_parsed_data')
            const cachedInfo = await localforage.getItem('ecd_company_info')
            if (cachedData && cachedInfo) {
              setData(cachedData as any)
              setCompanyInfo(cachedInfo as any)
              setLoading(false)
              return
            }
          }

          // 3. If not in cache or different CNPJ, load from Supabase
          const { data: accounts, error: accError } = await supabase
            .from('accounts')
            .select('*')
            .eq('company_id', company.id)

          if (accError) throw accError

          if (accounts && accounts.length > 0) {
            let allBalances: any[] = []
            let page = 0
            const pageSize = 1000
            let hasMore = true

            while (hasMore) {
              const { data: balances, error: balError } = await supabase
                .from('balances')
                .select('*, accounts!inner(company_id)')
                .eq('accounts.company_id', company.id)
                .range(page * pageSize, (page + 1) * pageSize - 1)

              if (balError) throw balError
              if (balances && balances.length > 0) {
                allBalances = [...allBalances, ...balances]
                page++
                if (balances.length < pageSize) hasMore = false
              } else {
                hasMore = false
              }
            }

            const formatNumber = (num: number) => {
              if (num === null || num === undefined) return '0,00'
              return Math.abs(num).toFixed(2).replace('.', ',')
            }

            const reconstructedData = allBalances.map((b) => {
              const acc = accounts.find((a) => a.id === b.account_id)
              return {
                id: b.id,
                periodo: b.period,
                conta: acc?.code || '-',
                nome: acc?.name || '-',
                tipo: acc?.type || '-',
                nivel: acc?.level ? acc.level.toString() : '-',
                natureza: acc?.nature || '-',
                sldIni: formatNumber(b.initial_balance),
                indDcIni: b.initial_indicator || '',
                debito: formatNumber(b.debit),
                credito: formatNumber(b.credit),
                sldFin: formatNumber(b.final_balance),
                indDcFin: b.final_indicator || '',
              }
            })

            reconstructedData.sort((a: any, b: any) => {
              const dateA = dateStrToMs(a.periodo.split(' a ')[0])
              const dateB = dateStrToMs(b.periodo.split(' a ')[0])
              if (dateA !== dateB) return dateA - dateB
              return a.conta.localeCompare(b.conta)
            })

            const newCompanyInfo = { cnpj: company.cnpj, nome: company.name }
            setCompanyInfo(newCompanyInfo as any)
            setData(reconstructedData as any)

            await localforage.setItem('ecd_parsed_data', reconstructedData)
            await localforage.setItem('ecd_company_info', newCompanyInfo)
            await localforage.setItem('ecd_company_cnpj', company.cnpj)

            // Load user configs
            const { data: configData } = await supabase
              .from('user_configs')
              .select('config_data')
              .eq('company_id', company.id)
              .eq('user_id', user.id)
              .single()

            if (configData && configData.config_data) {
              const conf = configData.config_data as any
              if (conf.charts) setCharts(conf.charts)
              if (conf.pieCharts) setPieCharts(conf.pieCharts)
              if (conf.piePeriods) setPiePeriods(conf.piePeriods)
              if (conf.chartPeriods) setChartPeriods(conf.chartPeriods)
              if (conf.chartAccumulated) setChartAccumulated(conf.chartAccumulated)
              if (conf.pieAccumulated) setPieAccumulated(conf.pieAccumulated)
              if (conf.customMapping) setCustomMapping(conf.customMapping)
              if (conf.customDaMapping) setCustomDaMapping(conf.customDaMapping)
              if (conf.customExpenseGroups) setCustomExpenseGroups(conf.customExpenseGroups)
              if (conf.expenseAccountToGroup) setExpenseAccountToGroup(conf.expenseAccountToGroup)
              if (conf.expenseRange) setExpenseRange(conf.expenseRange)
            }
          }
        } else {
          // Fallback to local storage if no user in cloud just in case
          const storedData = await localforage.getItem('ecd_parsed_data')
          const storedCompany = await localforage.getItem('ecd_company_info')
          if (storedData && storedCompany) {
            setData(storedData as any)
            setCompanyInfo(storedCompany as any)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados da nuvem', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  // Helper para ler estado salvo no cache local do navegador
  const getSavedState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem('boardecd_config')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed[key] !== undefined ? parsed[key] : defaultValue
      }
    } catch (e) {
      console.error('Erro ao ler config do localStorage:', e)
    }
    return defaultValue
  }

  const [charts, setCharts] = useState(() =>
    getSavedState('charts', [{ id: 'default', accounts: [], type: 'bar' }]),
  )
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [expandedDreGroups, setExpandedDreGroups] = useState({})
  const dropdownRef = useRef(null)

  const [customMapping, setCustomMapping] = useState(() => getSavedState('customMapping', {}))
  const [customDaMapping, setCustomDaMapping] = useState(() => getSavedState('customDaMapping', {}))
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false)
  const [mappingSearch, setMappingSearch] = useState('')
  const [isEbitdaMappingModalOpen, setIsEbitdaMappingModalOpen] = useState(false)
  const [ebitdaMappingSearch, setEbitdaMappingSearch] = useState('')
  const [expenseRange, setExpenseRange] = useState(() => getSavedState('expenseRange', null))
  const [expensePeriod, setExpensePeriod] = useState<string | null>(null)
  const [detailsTab, setDetailsTab] = useState('monthly')

  const [isExpenseGroupModalOpen, setIsExpenseGroupModalOpen] = useState(false)
  const [customExpenseGroups, setCustomExpenseGroups] = useState(() =>
    getSavedState('customExpenseGroups', []),
  )
  const [expenseAccountToGroup, setExpenseAccountToGroup] = useState(() =>
    getSavedState('expenseAccountToGroup', {}),
  )
  const [expenseGroupSearch, setExpenseGroupSearch] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const [chartAccountSearch, setChartAccountSearch] = useState('')
  const [activePieSlice, setActivePieSlice] = useState(null)

  const [pieCharts, setPieCharts] = useState(() =>
    getSavedState('pieCharts', [{ id: 'pie-default', accounts: [] }]),
  )
  const [openPieDropdownId, setOpenPieDropdownId] = useState(null)
  const [pieChartAccountSearch, setPieChartAccountSearch] = useState('')
  const [piePeriods, setPiePeriods] = useState<Record<string, { from: string; to: string }>>(() =>
    getSavedState('piePeriods', {}),
  )
  const [chartPeriods, setChartPeriods] = useState<Record<string, { from: string; to: string }>>(
    () => getSavedState('chartPeriods', {}),
  )
  const [chartAccumulated, setChartAccumulated] = useState<Record<string, boolean>>(() =>
    getSavedState('chartAccumulated', {}),
  )
  const [pieAccumulated, setPieAccumulated] = useState<Record<string, boolean>>(() =>
    getSavedState('pieAccumulated', {}),
  )
  const [hiddenTop5Lines, setHiddenTop5Lines] = useState<Record<string, boolean>>({})

  const [selectedAccountForRazao, setSelectedAccountForRazao] = useState<any>(null)
  const [razaoTransactions, setRazaoTransactions] = useState<any[]>([])
  const [isLoadingRazao, setIsLoadingRazao] = useState(false)
  const [razaoSearch, setRazaoSearch] = useState('')

  const openRazao = async (acc: any) => {
    if (acc.tipo === 'S') return
    setSelectedAccountForRazao(acc)
    setIsLoadingRazao(true)
    setRazaoSearch('')
    setRazaoTransactions([])

    try {
      const cachedTx = (await localforage.getItem('ecd_transactions')) as any[]
      if (cachedTx && cachedTx.length > 0) {
        const accTx = cachedTx.filter((t: any) => t.conta === acc.conta)
        if (accTx.length > 0) {
          setRazaoTransactions(accTx)
          setIsLoadingRazao(false)
          return
        }
      }

      if (companyInfo && user) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id')
          .eq('cnpj', companyInfo.cnpj)
          .single()

        if (companies) {
          const { data: accounts } = await supabase
            .from('accounts')
            .select('id')
            .eq('company_id', companies.id)
            .eq('code', acc.conta)
            .single()

          if (accounts) {
            const { data: txs } = await supabase
              .from('transactions')
              .select('*')
              .eq('account_id', accounts.id)
              .order('date', { ascending: true })

            if (txs) {
              const formattedTxs = txs.map((t) => ({
                data: t.date ? t.date.split('-').reverse().join('/') : '',
                valor: t.amount.toString().replace('.', ','),
                indDc: t.indicator,
                historico: t.history,
              }))
              setRazaoTransactions(formattedTxs)
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingRazao(false)
    }
  }

  const filteredRazaoTransactions = useMemo(() => {
    if (!razaoSearch) return razaoTransactions
    const lower = razaoSearch.toLowerCase()
    return razaoTransactions.filter(
      (tx) =>
        tx.historico.toLowerCase().includes(lower) ||
        tx.valor.toString().includes(lower) ||
        tx.data.includes(lower),
    )
  }, [razaoTransactions, razaoSearch])

  // Sincronização Automática (Auto-Save) com o navegador e nuvem
  useEffect(() => {
    const configData = {
      charts,
      pieCharts,
      piePeriods,
      chartPeriods,
      chartAccumulated,
      pieAccumulated,
      customMapping,
      customDaMapping,
      customExpenseGroups,
      expenseAccountToGroup,
      expenseRange,
    }
    localStorage.setItem('boardecd_config', JSON.stringify(configData))

    if (user && companyInfo?.cnpj) {
      const saveToCloud = async () => {
        try {
          let { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('cnpj', companyInfo.cnpj)
            .eq('user_id', user.id)
            .single()

          if (!company) {
            const { data: newCompany } = await supabase
              .from('companies')
              .upsert(
                {
                  user_id: user.id,
                  cnpj: companyInfo.cnpj,
                  name: companyInfo.nome,
                },
                { onConflict: 'user_id, cnpj' },
              )
              .select('id')
              .single()
            company = newCompany
          }

          if (company) {
            const { data: existingConfig } = await supabase
              .from('user_configs')
              .select('id')
              .eq('company_id', company.id)
              .eq('user_id', user.id)
              .single()

            if (existingConfig) {
              await supabase
                .from('user_configs')
                .update({ config_data: configData, updated_at: new Date().toISOString() })
                .eq('id', existingConfig.id)
            } else {
              await supabase.from('user_configs').insert({
                user_id: user.id,
                company_id: company.id,
                config_data: configData,
              })
            }
          }
        } catch (e) {
          console.error('Failed to sync to cloud', e)
        }
      }
      const timeout = setTimeout(saveToCloud, 2000)
      return () => clearTimeout(timeout)
    }
  }, [
    charts,
    pieCharts,
    piePeriods,
    chartPeriods,
    chartAccumulated,
    pieAccumulated,
    customMapping,
    customDaMapping,
    customExpenseGroups,
    expenseAccountToGroup,
    expenseRange,
    user,
    companyInfo,
  ])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.chart-dropdown-container')) {
        setOpenDropdownId(null)
      }
      if (!event.target.closest('.pie-dropdown-container')) {
        setOpenPieDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setChartAccountSearch('')
  }, [openDropdownId])

  useEffect(() => {
    setPieChartAccountSearch('')
  }, [openPieDropdownId])

  const formatCurrency = (val, ind) => {
    if (!val) return '0,00'
    const cleanStr = val.toString().replace(/\./g, '').replace(',', '.')
    const num = parseFloat(cleanStr)
    if (isNaN(num)) return val
    const formatted = num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return ind ? (
      <span className="flex justify-between min-w-[5rem]">
        <span>{formatted}</span>
        <span className={`font-bold ml-2 ${ind === 'D' ? 'text-blue-600' : 'text-red-600'}`}>
          {ind}
        </span>
      </span>
    ) : (
      formatted
    )
  }

  const formatDreValue = (val: number) => {
    if (val === 0 || !val) return '0,00'
    const isNeg = val < 0
    const absVal = Math.abs(val).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return isNeg ? `(${absVal})` : absVal
  }

  const getRawNumber = (val: any) => {
    if (!val) return 0
    const cleanStr = val.toString().replace(/\./g, '').replace(',', '.')
    return parseFloat(cleanStr) || 0
  }

  const formatCompact = (val: number) => {
    if (val === 0 || !val) return '0,00'
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Funções de Persistência de Configuração
  const handleSaveConfig = () => {
    const configData = {
      charts,
      pieCharts,
      piePeriods,
      chartPeriods,
      chartAccumulated,
      pieAccumulated,
      customMapping,
      customDaMapping,
      customExpenseGroups,
      expenseAccountToGroup,
    }
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `boardecd_layout_${companyInfo ? companyInfo.cnpj : 'export'}.json`
    link.click()
  }

  const handleLoadConfig = (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const configData = JSON.parse(event.target.result)
        if (configData.charts) setCharts(configData.charts)
        if (configData.pieCharts) setPieCharts(configData.pieCharts)
        if (configData.piePeriods) setPiePeriods(configData.piePeriods)
        if (configData.chartPeriods) setChartPeriods(configData.chartPeriods)
        if (configData.chartAccumulated) setChartAccumulated(configData.chartAccumulated)
        if (configData.pieAccumulated) setPieAccumulated(configData.pieAccumulated)
        if (configData.customMapping) setCustomMapping(configData.customMapping)
        if (configData.customDaMapping) setCustomDaMapping(configData.customDaMapping)
        if (configData.customExpenseGroups) setCustomExpenseGroups(configData.customExpenseGroups)
        if (configData.expenseAccountToGroup)
          setExpenseAccountToGroup(configData.expenseAccountToGroup)
        // Exibindo um mini aviso temporal poderia ser melhor, mas usaremos um modal simples.
        alert(
          'Configurações carregadas com sucesso! Todos os gráficos e mapeamentos foram restaurados.',
        )
      } catch (error) {
        alert('Erro ao ler arquivo de configuração. Verifique se o formato JSON é válido.')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset input so the same file can be loaded again if needed
  }

  const handleFileUpload = async (e: any) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setLoading(true)
    setSearchTerm('')
    setFilesCount(files.length)
    // REMOVIDO os resets automáticos das customizações. Assim o usuário pode manter o layout e carregar novos meses!
    // setExpandedDreGroups({});
    // setCustomMapping({});
    // setCustomDaMapping({});
    // setCustomExpenseGroups([]);
    // setExpenseAccountToGroup({});

    let allExtracted = []
    let allExtractedTx = []
    let mergedInfo = null

    const readFile = (file: any) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target.result
          const lines = text.split('\n')

          let accounts = {}
          let currentPeriod = ''
          let currentLctoDate = ''
          let currentLctoDateDb = ''
          let periodsMap = {}
          let info = null
          let extractedTx = []

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const parts = line.split('|')
            if (parts.length < 2) continue

            const reg = parts[1]

            if (reg === '0000') {
              info = {
                nome: parts[4],
                cnpj: parts[5],
                dtIni: parseSpedDate(parts[2]),
                dtFin: parseSpedDate(parts[3]),
                j100: [],
                j150: [],
              }
            } else if (reg === 'J100') {
              if (info) info.j100.push(parts)
            } else if (reg === 'J150') {
              if (info) info.j150.push(parts)
            } else if (reg === 'I200') {
              currentLctoDate = parseSpedDate(parts[3])
              currentLctoDateDb = parseSpedDateDb(parts[3])
            } else if (reg === 'I250') {
              extractedTx.push({
                conta: parts[2],
                data: currentLctoDate,
                dataDb: currentLctoDateDb,
                valor: parts[4],
                indDc: parts[5],
                historico: parts[8] || '',
              })
            } else if (reg === 'I050') {
              accounts[parts[6]] = {
                conta: parts[6],
                pai: parts[7],
                nome: parts[8],
                natureza: parts[3],
                tipo: parts[4],
                nivel: parts[5],
              }
            } else if (reg === 'I150') {
              currentPeriod = `${parseSpedDate(parts[2])} a ${parseSpedDate(parts[3])}`
              if (!periodsMap[currentPeriod]) periodsMap[currentPeriod] = {}
            } else if (reg === 'I155') {
              const accInfo = accounts[parts[2]] || {}
              if (!periodsMap[currentPeriod]) periodsMap[currentPeriod] = {}
              periodsMap[currentPeriod][parts[2]] = {
                id: `${file.name}_${i}`,
                periodo: currentPeriod,
                conta: parts[2],
                nome: accInfo.nome || 'Conta não encontrada',
                tipo: accInfo.tipo || '-',
                nivel: accInfo.nivel || '-',
                natureza: accInfo.natureza || '-',
                sldIni: parts[4] || '0,00',
                indDcIni: parts[5] || '',
                debito: parts[6] || '0,00',
                credito: parts[7] || '0,00',
                sldFin: parts[8] || '0,00',
                indDcFin: parts[9] || '',
              }
            }
          }

          const childrenMap = {}
          const rootAccounts = []

          Object.values(accounts).forEach((acc: any) => {
            let pai = acc.pai

            if (!pai && acc.nivel > 1) {
              const possibleParents = Object.keys(accounts)
                .filter((k: any) => acc.conta.startsWith(k) && k.length < acc.conta.length)
                .sort((a: any, b: any) => b.length - a.length)
              if (possibleParents.length > 0) pai = possibleParents[0]
            }

            if (pai && accounts[pai]) {
              if (!childrenMap[pai]) childrenMap[pai] = []
              childrenMap[pai].push(acc.conta)
            } else {
              rootAccounts.push(acc.conta)
            }
          })

          const getNum = (val: any) => parseFloat(val.toString().replace(',', '.')) || 0
          const formatSpedNum = (val: any) => Math.abs(val).toFixed(2).replace('.', ',')

          const computeRollup = (conta: any, period: any) => {
            const acc = accounts[conta]
            const i155 = periodsMap[period]?.[conta]

            if (acc.tipo === 'A') {
              if (i155) {
                const iniAlg = i155.indDcIni === 'C' ? -getNum(i155.sldIni) : getNum(i155.sldIni)
                const finAlg = i155.indDcFin === 'C' ? -getNum(i155.sldFin) : getNum(i155.sldFin)
                return { iniAlg, deb: getNum(i155.debito), cred: getNum(i155.credito), finAlg }
              }
              return { iniAlg: 0, deb: 0, cred: 0, finAlg: 0 }
            }

            let sumIniAlg = 0,
              sumDeb = 0,
              sumCred = 0,
              sumFinAlg = 0
            const children = childrenMap[conta] || []

            children.forEach((child: any) => {
              const childTotals = computeRollup(child, period)
              sumIniAlg += childTotals.iniAlg
              sumDeb += childTotals.deb
              sumCred += childTotals.cred
              sumFinAlg += childTotals.finAlg
            })

            if (!periodsMap[period]) periodsMap[period] = {}

            if (
              Math.abs(sumIniAlg) > 0 ||
              sumDeb > 0 ||
              sumCred > 0 ||
              Math.abs(sumFinAlg) > 0 ||
              i155
            ) {
              periodsMap[period][conta] = {
                id: `synth_${conta}_${period}`,
                periodo: period,
                conta: conta,
                nome: acc.nome,
                tipo: 'S',
                nivel: acc.nivel,
                natureza: acc.natureza,
                sldIni: formatSpedNum(sumIniAlg),
                indDcIni: sumIniAlg < 0 ? 'C' : sumIniAlg > 0 ? 'D' : '',
                debito: formatSpedNum(sumDeb),
                credito: formatSpedNum(sumCred),
                sldFin: formatSpedNum(sumFinAlg),
                indDcFin: sumFinAlg < 0 ? 'C' : sumFinAlg > 0 ? 'D' : '',
              }
            }

            return { iniAlg: sumIniAlg, deb: sumDeb, cred: sumCred, finAlg: sumFinAlg }
          }

          Object.keys(periodsMap).forEach((period: any) => {
            rootAccounts.forEach((root: any) => computeRollup(root, period))
          })

          let extracted = []
          Object.keys(periodsMap).forEach((period: any) => {
            Object.values(periodsMap[period]).forEach((row: any) => extracted.push(row))
          })

          resolve({ extracted, info, extractedTx })
        }
        reader.readAsText(file, 'ISO-8859-1')
      })
    }

    const results = await Promise.all(files.map(readFile))

    results.forEach((res: any) => {
      allExtracted = [...allExtracted, ...res.extracted]
      allExtractedTx = [...allExtractedTx, ...(res.extractedTx || [])]
      if (!mergedInfo && res.info) {
        mergedInfo = res.info
      } else if (mergedInfo && res.info) {
        if (res.info.j100) mergedInfo.j100 = [...(mergedInfo.j100 || []), ...res.info.j100]
        if (res.info.j150) mergedInfo.j150 = [...(mergedInfo.j150 || []), ...res.info.j150]
      }
    })

    allExtracted.sort((a: any, b: any) => {
      const dateA = dateStrToMs(a.periodo.split(' a ')[0])
      const dateB = dateStrToMs(b.periodo.split(' a ')[0])
      if (dateA !== dateB) return dateA - dateB
      return a.conta.localeCompare(b.conta)
    })

    setCompanyInfo(mergedInfo)
    setData(allExtracted)

    // Save to localforage cache
    await localforage.setItem('ecd_parsed_data', allExtracted)
    await localforage.setItem('ecd_company_info', mergedInfo)
    await localforage.setItem('ecd_company_cnpj', mergedInfo.cnpj)
    await localforage.setItem('ecd_transactions', allExtractedTx)

    // Save to Supabase (in background to not block UI entirely, but wait to show toast)
    saveToSupabase(mergedInfo, allExtracted, allExtractedTx)

    setLoading(false)
  }

  const saveToSupabase = async (info: any, extractedData: any[], extractedTx: any[]) => {
    if (!user) return
    try {
      toast({
        title: 'Sincronizando',
        description: 'Salvando dados na nuvem, isso pode levar alguns segundos...',
      })

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .upsert(
          { user_id: user.id, cnpj: info.cnpj, name: info.nome },
          { onConflict: 'user_id, cnpj' },
        )
        .select()
        .single()

      if (companyError) throw companyError

      const companyId = companyData.id

      const uniqueAccountsMap = new Map()
      extractedData.forEach((row) => {
        if (!uniqueAccountsMap.has(row.conta)) {
          uniqueAccountsMap.set(row.conta, {
            company_id: companyId,
            code: row.conta,
            name: row.nome,
            type: row.tipo,
            level: parseInt(row.nivel) || null,
            nature: row.natureza,
          })
        }
      })

      const accountsToUpsert = Array.from(uniqueAccountsMap.values())
      const chunkSize = 1000
      const accountIdMap = new Map()

      for (let i = 0; i < accountsToUpsert.length; i += chunkSize) {
        const chunk = accountsToUpsert.slice(i, i + chunkSize)
        const { data: upsertedAccounts, error: accError } = await supabase
          .from('accounts')
          .upsert(chunk, { onConflict: 'company_id, code' })
          .select('id, code')

        if (accError) throw accError
        upsertedAccounts?.forEach((a) => accountIdMap.set(a.code, a.id))
      }

      const balancesToUpsert = extractedData.map((row) => ({
        account_id: accountIdMap.get(row.conta),
        period: row.periodo,
        initial_balance:
          parseFloat(row.sldIni.toString().replace(/\./g, '').replace(',', '.')) || 0,
        initial_indicator: row.indDcIni,
        debit: parseFloat(row.debito.toString().replace(/\./g, '').replace(',', '.')) || 0,
        credit: parseFloat(row.credito.toString().replace(/\./g, '').replace(',', '.')) || 0,
        final_balance: parseFloat(row.sldFin.toString().replace(/\./g, '').replace(',', '.')) || 0,
        final_indicator: row.indDcFin,
      }))

      for (let i = 0; i < balancesToUpsert.length; i += chunkSize) {
        const chunk = balancesToUpsert.slice(i, i + chunkSize)
        const { error: balError } = await supabase
          .from('balances')
          .upsert(chunk, { onConflict: 'account_id, period' })

        if (balError) throw balError
      }

      if (extractedTx && extractedTx.length > 0) {
        const validTxs = extractedTx
          .filter((t) => accountIdMap.has(t.conta) && t.dataDb)
          .map((t) => ({
            company_id: companyId,
            account_id: accountIdMap.get(t.conta),
            date: t.dataDb,
            amount: parseFloat(t.valor.toString().replace(/\./g, '').replace(',', '.')) || 0,
            indicator: t.indDc,
            history: t.historico,
          }))

        if (validTxs.length > 0) {
          const dates = [...new Set(validTxs.map((t) => t.date))].sort()
          const minDate = dates[0]
          const maxDate = dates[dates.length - 1]

          await supabase
            .from('transactions')
            .delete()
            .eq('company_id', companyId)
            .gte('date', minDate)
            .lte('date', maxDate)

          for (let i = 0; i < validTxs.length; i += 2000) {
            const chunk = validTxs.slice(i, i + 2000)
            await supabase.from('transactions').insert(chunk)
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Seus dados foram importados e salvos na nuvem.',
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Erro na sincronização',
        description: 'Não foi possível salvar os dados na nuvem.',
      })
    }
  }

  useEffect(() => {
    if (data.length > 0 && charts.length === 1 && charts[0].accounts.length === 0) {
      const firstLevel1 = data.find((d: any) => d.nivel === '1')?.conta
      setCharts([{ id: 'default', accounts: [firstLevel1 || data[0].conta], type: 'bar' }])
    }
  }, [data])

  const monthlyData = useMemo(() => {
    if (!data.length) return { periods: [], accounts: [], allAccounts: [] }

    let periods = [...new Set(data.map((d) => d.periodo))]
    periods.sort(
      (a: any, b: any) => dateStrToMs(a.split(' a ')[0]) - dateStrToMs(b.split(' a ')[0]),
    )

    const accMap = {}
    data.forEach((row: any) => {
      if (!accMap[row.conta]) {
        accMap[row.conta] = {
          conta: row.conta,
          nome: row.nome,
          tipo: row.tipo,
          nivel: row.nivel,
          saldos: {},
        }
      }
      accMap[row.conta].saldos[row.periodo] = row
    })

    let allAccounts = Object.values(accMap).sort((a: any, b: any) => a.conta.localeCompare(b.conta))
    let accounts = allAccounts

    if (searchTerm && activeTab === 'monthly') {
      const lower = searchTerm.toLowerCase()
      accounts = accounts.filter(
        (acc: any) =>
          acc.conta.toLowerCase().includes(lower) || acc.nome.toLowerCase().includes(lower),
      )
    }

    return { periods, accounts, allAccounts }
  }, [data, searchTerm, activeTab])

  const baseValuesPerPeriod = useMemo(() => {
    if (!monthlyData?.periods?.length) return {}

    const bases: Record<string, { ativo: number; receita: number }> = {}
    monthlyData.periods.forEach((period) => {
      // Encontra a conta raiz do Ativo (1)
      const ativoAcc = monthlyData.allAccounts.find(
        (a: any) => a.conta.startsWith('1') && a.nivel === '1',
      )
      // Encontra a conta raiz de Receitas (3 ou 4)
      const receitaAcc =
        monthlyData.allAccounts.find(
          (a: any) =>
            (a.conta.startsWith('3') || a.conta.startsWith('4')) &&
            a.nome.toUpperCase().includes('RECEITA') &&
            a.nivel === '1',
        ) ||
        monthlyData.allAccounts.find(
          (a: any) => (a.conta.startsWith('3') || a.conta.startsWith('4')) && a.nivel === '1',
        )

      const getAtivoVal = (acc: any) => {
        if (!acc) return 0
        const sld = acc.saldos[period]
        if (!sld) return 0
        return Math.abs(getRawNumber(sld.sldFin))
      }

      const getReceitaVal = (acc: any) => {
        if (!acc) return 0
        const sld = acc.saldos[period]
        if (!sld) return 0
        if (!isAccumulated) {
          const deb = getRawNumber(sld.debito)
          const cred = getRawNumber(sld.credito)
          return Math.abs(deb - cred)
        } else {
          return Math.abs(getRawNumber(sld.sldFin))
        }
      }

      bases[period] = {
        ativo: getAtivoVal(ativoAcc),
        receita: getReceitaVal(receitaAcc),
      }
    })
    return bases
  }, [monthlyData, isAccumulated])

  useEffect(() => {
    if (monthlyData && monthlyData.periods.length > 0 && !expensePeriod) {
      setExpensePeriod(monthlyData.periods[monthlyData.periods.length - 1])
    }
  }, [monthlyData, expensePeriod])

  const getDefaultClassification = (conta: string, nome: string, indDc: string) => {
    const c = conta || ''
    const n = (nome || '').toUpperCase()

    if (c.startsWith('3.1.01')) return '01_RECEITA_BRUTA'
    if (c.startsWith('3.1.02') || c.startsWith('3.1.03')) return '02_DEDUCOES'
    if (c.startsWith('3.1.04')) return '09_FINANCEIRO'
    if (c.startsWith('3.1.05')) return '07_OUTRAS_RECEITAS'
    if (c.startsWith('4.1.')) return '04_CUSTOS'
    if (c.startsWith('4.2.01')) return '06A_DESPESAS_PESSOAL'
    if (c.startsWith('4.2.02')) return '06B_DESPESAS_ADM'
    if (c.startsWith('4.2.03')) return '09_FINANCEIRO'
    if (c.startsWith('4.2.04')) return '06C_DESPESAS_TRIB'
    if (c.startsWith('4.2.05') || c.startsWith('4.2.06') || c.startsWith('4.2.07'))
      return '06D_OUTRAS_DESPESAS'

    if (/(IRPJ|CSLL|IMPOSTO DE RENDA|CONTRIBUICAO SOCIAL|PROVISAO PARA IMP)/.test(n))
      return '11_TRIBUTOS'
    if (/(PARTICIPACAO|DEBENTURISTAS|PLR|LUCROS AOS EMPREGADOS)/.test(n)) return '13_PARTICIPACOES'
    if (/(CUSTO|CMV|CPV|CSP)/.test(n)) return '04_CUSTOS'
    if (
      /(DEDUCAO|DEVOLUCAO|VENDAS CANCELADAS|ABATIMENTO|DESCONTO INCOND|ICMS SOBRE|PIS SOBRE|COFINS SOBRE|ISS SOBRE|IMPOSTO SOBRE VEND)/.test(
        n,
      )
    )
      return '02_DEDUCOES'
    if (
      /(FINANCEIR|JUROS|RENDIMENTO|DESCONTO OBTIDO|DESCONTO CONCED|IOF|MULTA|VARIACOES MONETARIAS|CAMBIAL)/.test(
        n,
      )
    )
      return '09_FINANCEIRO'
    if (/(OUTRAS RECEITAS|GANHO DE CAPITAL|ALIENACAO)/.test(n)) return '07_OUTRAS_RECEITAS'
    if (/(RECEITA|VENDA|PRESTACAO|FATURAMENTO|SERVICO)/.test(n) && indDc === 'C')
      return '01_RECEITA_BRUTA'

    if (indDc === 'C') return '01_RECEITA_BRUTA'
    return '06D_OUTRAS_DESPESAS'
  }

  const uniqueResultAccounts = useMemo(() => {
    if (!data.length) return []
    let accs = data.filter((d: any) => d.natureza === '04' || d.natureza === '4')
    if (accs.length === 0) {
      accs = data.filter(
        (d: any) => d.conta.startsWith('3') || d.conta.startsWith('4') || d.conta.startsWith('5'),
      )
    }
    const uniqueMap = new Map()
    accs.forEach((a) => {
      if (a.tipo === 'S') return
      if (!uniqueMap.has(a.conta)) {
        uniqueMap.set(a.conta, a)
      }
    })
    return Array.from(uniqueMap.values()).sort((a: any, b: any) => a.conta.localeCompare(b.conta))
  }, [data])

  const filteredAccountsForMapping = useMemo(() => {
    if (!mappingSearch) return uniqueResultAccounts
    const lower = mappingSearch.toLowerCase()
    return uniqueResultAccounts.filter(
      (a: any) => a.conta.toLowerCase().includes(lower) || a.nome.toLowerCase().includes(lower),
    )
  }, [uniqueResultAccounts, mappingSearch])

  const filteredAccountsForEbitdaMapping = useMemo(() => {
    if (!ebitdaMappingSearch) return uniqueResultAccounts
    const lower = ebitdaMappingSearch.toLowerCase()
    return uniqueResultAccounts.filter(
      (a: any) => a.conta.toLowerCase().includes(lower) || a.nome.toLowerCase().includes(lower),
    )
  }, [uniqueResultAccounts, ebitdaMappingSearch])

  const expenseAccountsForGrouping = useMemo(() => {
    let accs = uniqueResultAccounts

    if (expenseGroupSearch) {
      const lower = expenseGroupSearch.toLowerCase()
      accs = accs.filter(
        (a: any) => a.conta.toLowerCase().includes(lower) || a.nome.toLowerCase().includes(lower),
      )
    }
    return accs
  }, [uniqueResultAccounts, expenseGroupSearch])

  const dreStructuredData = useMemo(() => {
    if (!data.length) return null

    let resultAccounts = data.filter((d: any) => d.natureza === '04' || d.natureza === '4')
    if (resultAccounts.length === 0) {
      resultAccounts = data.filter(
        (d: any) => d.conta.startsWith('3') || d.conta.startsWith('4') || d.conta.startsWith('5'),
      )
    }

    let periods = [...new Set(resultAccounts.map((d) => d.periodo))]
    periods.sort(
      (a: any, b: any) => dateStrToMs(a.split(' a ')[0]) - dateStrToMs(b.split(' a ')[0]),
    )

    const classifyAccount = (conta, nome, indDc) => {
      if (customMapping[conta]) return customMapping[conta]
      return getDefaultClassification(conta, nome, indDc)
    }

    const groups = {
      '01_RECEITA_BRUTA': {
        id: '01_RECEITA_BRUTA',
        label: '1. Receita Bruta de Vendas e Serviços',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '02_DEDUCOES': {
        id: '02_DEDUCOES',
        label: '2. (-) Deduções da Receita Bruta',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '03_RECEITA_LIQUIDA': {
        id: '03_RECEITA_LIQUIDA',
        label: '3. (=) Receita Líquida de Vendas',
        isSubtotal: true,
        totals: {},
      },
      '04_CUSTOS': {
        id: '04_CUSTOS',
        label: '4. (-) Custos Operacionais (CMV/CPV)',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '05_LUCRO_BRUTO': {
        id: '05_LUCRO_BRUTO',
        label: '5. (=) Lucro Bruto',
        isSubtotal: true,
        totals: {},
      },
      '06A_DESPESAS_PESSOAL': {
        id: '06A_DESPESAS_PESSOAL',
        label: '6.1 (-) Despesas Operacionais (Pessoal)',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '06B_DESPESAS_ADM': {
        id: '06B_DESPESAS_ADM',
        label: '6.2 (-) Despesas Operacionais (Administrativas/Gerais)',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '06C_DESPESAS_TRIB': {
        id: '06C_DESPESAS_TRIB',
        label: '6.3 (-) Despesas Operacionais (Tributárias)',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '06D_OUTRAS_DESPESAS': {
        id: '06D_OUTRAS_DESPESAS',
        label: '6.4 (-) Outras Despesas Operacionais',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '07_OUTRAS_RECEITAS': {
        id: '07_OUTRAS_RECEITAS',
        label: '7. (+) Outras Receitas Operacionais',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '08_EBIT': {
        id: '08_EBIT',
        label: '8. (=) Resultado Operacional (EBIT)',
        isSubtotal: true,
        totals: {},
      },
      '09_FINANCEIRO': {
        id: '09_FINANCEIRO',
        label: '9. (+/-) Resultado Financeiro',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '10_LAIR': {
        id: '10_LAIR',
        label: '10. (=) Resultado Antes dos Tributos (LAIR)',
        isSubtotal: true,
        totals: {},
      },
      '11_TRIBUTOS': {
        id: '11_TRIBUTOS',
        label: '11. (-) Provisão para Tributos sobre Lucro',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '12_RES_LIQ_ANTES_PART': {
        id: '12_RES_LIQ_ANTES_PART',
        label: '12. (=) Resultado Líq. antes Participações',
        isSubtotal: true,
        totals: {},
      },
      '13_PARTICIPACOES': {
        id: '13_PARTICIPACOES',
        label: '13. (-) Participações e Contribuições',
        isGroup: true,
        accounts: [],
        totals: {},
      },
      '14_LUCRO_LIQUIDO': {
        id: '14_LUCRO_LIQUIDO',
        label: '14. (=) Lucro Líquido do Exercício',
        isSubtotal: true,
        totals: {},
      },
    }

    periods.forEach((p: any) => {
      Object.keys(groups).forEach((key: any) => (groups[key].totals[p] = 0))
    })

    const accMap = {}
    resultAccounts.forEach((row: any) => {
      if (row.tipo === 'S') return

      let signedVal = 0
      if (!isAccumulated) {
        const deb = getRawNumber(row.debito)
        const cred = getRawNumber(row.credito)
        signedVal = cred - deb
      } else {
        const rawVal = getRawNumber(row.sldFin)
        signedVal = row.indDcFin === 'D' ? -rawVal : rawVal
      }

      if (!accMap[row.conta]) {
        const groupId = classifyAccount(row.conta, row.nome, row.indDcFin)
        accMap[row.conta] = { conta: row.conta, nome: row.nome, groupId, saldos: {} }
        groups[groupId].accounts.push(accMap[row.conta])
      }
      accMap[row.conta].saldos[row.periodo] = signedVal
      groups[accMap[row.conta].groupId].totals[row.periodo] += signedVal
    })

    periods.forEach((p: any) => {
      groups['03_RECEITA_LIQUIDA'].totals[p] =
        groups['01_RECEITA_BRUTA'].totals[p] + groups['02_DEDUCOES'].totals[p]
      groups['05_LUCRO_BRUTO'].totals[p] =
        groups['03_RECEITA_LIQUIDA'].totals[p] + groups['04_CUSTOS'].totals[p]
      groups['08_EBIT'].totals[p] =
        groups['05_LUCRO_BRUTO'].totals[p] +
        groups['06A_DESPESAS_PESSOAL'].totals[p] +
        groups['06B_DESPESAS_ADM'].totals[p] +
        groups['06C_DESPESAS_TRIB'].totals[p] +
        groups['06D_OUTRAS_DESPESAS'].totals[p] +
        groups['07_OUTRAS_RECEITAS'].totals[p]
      groups['10_LAIR'].totals[p] = groups['08_EBIT'].totals[p] + groups['09_FINANCEIRO'].totals[p]
      groups['12_RES_LIQ_ANTES_PART'].totals[p] =
        groups['10_LAIR'].totals[p] + groups['11_TRIBUTOS'].totals[p]
      groups['14_LUCRO_LIQUIDO'].totals[p] =
        groups['12_RES_LIQ_ANTES_PART'].totals[p] + groups['13_PARTICIPACOES'].totals[p]
    })

    Object.keys(groups).forEach((key: any) => {
      if (groups[key].accounts) {
        groups[key].accounts.sort((a: any, b: any) => a.conta.localeCompare(b.conta))
      }
    })

    const orderedKeys = Object.keys(groups).sort()
    return { periods, lines: orderedKeys.map((k: any) => groups[k]) }
  }, [data, customMapping, isAccumulated])

  const toggleDreGroup = (groupId: any) => {
    setExpandedDreGroups((prev: any) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const checkIsAutoDaAccount = (conta: string, nome: string, natureza: string) => {
    const isResult =
      natureza === '04' ||
      natureza === '4' ||
      conta.startsWith('3') ||
      conta.startsWith('4') ||
      conta.startsWith('5')
    if (!isResult) return false
    const n = (nome || '').toUpperCase()
    return (
      n.includes('DEPRECIACAO') ||
      n.includes('DEPRECIAÇÃO') ||
      n.includes('AMORTIZACAO') ||
      n.includes('AMORTIZAÇÃO') ||
      n.includes('EXAUSTAO') ||
      n.includes('EXAUSTÃO') ||
      conta.startsWith('4.2.05.01.01')
    )
  }

  const ebitdaData = useMemo(() => {
    if (!dreStructuredData || !dreStructuredData.periods.length) return null

    const periods = dreStructuredData.periods
    const metricsByPeriod = {}
    let globalMaxEbitda = 0

    const daAccountsList = monthlyData.allAccounts.filter((acc: any) => {
      if (acc.tipo === 'S') return false
      if (customDaMapping[acc.conta] !== undefined) return customDaMapping[acc.conta]
      return checkIsAutoDaAccount(acc.conta, acc.nome, acc.natureza)
    })

    periods.forEach((p: any) => {
      let totalDA = 0
      daAccountsList.forEach((acc: any) => {
        const sld = acc.saldos[p]
        if (sld) {
          let signedVal = 0
          if (!isAccumulated) {
            const deb = getRawNumber(sld.debito)
            const cred = getRawNumber(sld.credito)
            signedVal = cred - deb
          } else {
            const rawVal = getRawNumber(sld.sldFin)
            signedVal = sld.indDcFin === 'D' ? -rawVal : rawVal
          }
          totalDA += signedVal
        }
      })

      const receitaLiquida = dreStructuredData.lines.find((l: any) => l.id === '03_RECEITA_LIQUIDA')
        .totals[p]
      const custos = dreStructuredData.lines.find((l: any) => l.id === '04_CUSTOS').totals[p]
      const despPessoal = dreStructuredData.lines.find((l: any) => l.id === '06A_DESPESAS_PESSOAL')
        .totals[p]
      const despAdm = dreStructuredData.lines.find((l: any) => l.id === '06B_DESPESAS_ADM').totals[
        p
      ]
      const despTrib = dreStructuredData.lines.find((l: any) => l.id === '06C_DESPESAS_TRIB')
        .totals[p]
      const outrasDespesas = dreStructuredData.lines.find(
        (l: any) => l.id === '06D_OUTRAS_DESPESAS',
      ).totals[p]
      const outrasReceitas = dreStructuredData.lines.find((l: any) => l.id === '07_OUTRAS_RECEITAS')
        .totals[p]
      const despesasOperacionaisTotais = despPessoal + despAdm + despTrib + outrasDespesas

      const ebit = dreStructuredData.lines.find((l: any) => l.id === '08_EBIT').totals[p]
      const lucroLiquido = dreStructuredData.lines.find((l: any) => l.id === '14_LUCRO_LIQUIDO')
        .totals[p]
      const financeiro = dreStructuredData.lines.find((l: any) => l.id === '09_FINANCEIRO').totals[
        p
      ]
      const tributos = dreStructuredData.lines.find((l: any) => l.id === '11_TRIBUTOS').totals[p]
      const participacoes = dreStructuredData.lines.find((l: any) => l.id === '13_PARTICIPACOES')
        .totals[p]

      const adjTributos = -tributos
      const adjFinanceiro = -financeiro
      const adjParticipacoes = -participacoes
      const adjDA = Math.abs(totalDA)

      const ebitda = ebit + adjDA
      const margin = receitaLiquida > 0 ? (ebitda / receitaLiquida) * 100 : 0

      const ebitIndirect = lucroLiquido + adjTributos + adjFinanceiro + adjParticipacoes
      const ebitdaIndirect = ebitIndirect + adjDA
      const checkDifference = ebitda - ebitdaIndirect

      if (ebitda > globalMaxEbitda) globalMaxEbitda = ebitda

      metricsByPeriod[p] = {
        receitaLiquida,
        custos,
        despesasOperacionaisTotais,
        outrasReceitas,
        ebit,
        lucroLiquido,
        adjTributos,
        adjFinanceiro,
        adjParticipacoes,
        adjDA,
        ebitda,
        margin,
        ebitIndirect,
        ebitdaIndirect,
        checkDifference,
      }
    })

    const lastPeriod = periods[periods.length - 1]
    const lastMetrics = metricsByPeriod[lastPeriod]

    return {
      periods,
      metricsByPeriod,
      lastPeriod,
      lastMetrics,
      globalMaxEbitda,
      daAccountsList,
    }
  }, [dreStructuredData, monthlyData, customDaMapping, isAccumulated])

  const liquidityData = useMemo(() => {
    if (!monthlyData || !monthlyData.periods.length) return null
    const periods = monthlyData.periods
    const metricsByPeriod = {}

    periods.forEach((p: any) => {
      let AC = 0,
        ESTOQUES = 0,
        DISP = 0,
        RLP = 0
      let PC = 0,
        ELP = 0

      monthlyData.accounts.forEach((acc: any) => {
        if (acc.tipo === 'S') return

        const sld = acc.saldos[p]
        if (!sld) return

        const rawVal = getRawNumber(sld.sldFin)

        if (acc.conta.startsWith('1')) {
          const val = sld.indDcFin === 'D' ? rawVal : -rawVal
          if (acc.conta.startsWith('1.1')) {
            AC += val
            if (acc.conta.startsWith('1.1.01') || acc.conta.startsWith('1.1.1')) DISP += val
            if (
              acc.conta.startsWith('1.1.04') ||
              acc.conta.startsWith('1.1.4') ||
              acc.conta.startsWith('1.1.03.01')
            )
              ESTOQUES += val
          } else if (
            acc.conta.startsWith('1.2.01') ||
            acc.conta.startsWith('1.2.1') ||
            acc.conta.startsWith('1.2.02') ||
            acc.conta.startsWith('1.2.2')
          ) {
            RLP += val
          }
        } else if (acc.conta.startsWith('2')) {
          const val = sld.indDcFin === 'C' ? rawVal : -rawVal
          if (acc.conta.startsWith('2.1')) {
            PC += val
          } else if (acc.conta.startsWith('2.2')) {
            ELP += val
          }
        }
      })

      const liqCorrente = PC > 0 ? AC / PC : 0
      const liqSeca = PC > 0 ? (AC - ESTOQUES) / PC : 0
      const liqImediata = PC > 0 ? DISP / PC : 0
      const liqGeral = PC + ELP > 0 ? (AC + RLP) / (PC + ELP) : 0

      metricsByPeriod[p] = {
        AC,
        ESTOQUES,
        DISP,
        RLP,
        PC,
        ELP,
        liqCorrente,
        liqSeca,
        liqImediata,
        liqGeral,
      }
    })

    const lastPeriod = periods[periods.length - 1]
    const lastMetrics = metricsByPeriod[lastPeriod]

    return { periods, metricsByPeriod, lastPeriod, lastMetrics }
  }, [monthlyData])

  const rentabilidadeData = useMemo(() => {
    if (!monthlyData || !monthlyData.periods.length || !dreStructuredData || !ebitdaData)
      return null
    const periods = monthlyData.periods
    const metricsByPeriod = {}

    periods.forEach((p: any) => {
      let ATIVO_TOTAL = 0
      let PL = 0

      monthlyData.accounts.forEach((acc: any) => {
        if (acc.tipo === 'S') return
        const sld = acc.saldos[p]
        if (!sld) return

        const rawVal = getRawNumber(sld.sldFin)

        if (acc.conta.startsWith('1')) {
          const val = sld.indDcFin === 'D' ? rawVal : -rawVal
          ATIVO_TOTAL += val
        } else if (
          acc.conta.startsWith('2.3') ||
          acc.conta.startsWith('2.4') ||
          acc.conta.startsWith('2.5')
        ) {
          const val = sld.indDcFin === 'C' ? rawVal : -rawVal
          PL += val
        }
      })

      const receitaLiquida =
        dreStructuredData.lines.find((l: any) => l.id === '03_RECEITA_LIQUIDA').totals[p] || 0
      const lucroBruto =
        dreStructuredData.lines.find((l: any) => l.id === '05_LUCRO_BRUTO').totals[p] || 0
      const lucroLiquido =
        dreStructuredData.lines.find((l: any) => l.id === '14_LUCRO_LIQUIDO').totals[p] || 0
      const ebitda = ebitdaData.metricsByPeriod[p].ebitda || 0

      const ebit = ebitdaData.metricsByPeriod[p].ebit || 0
      const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0
      const margemOperacional = receitaLiquida > 0 ? (ebit / receitaLiquida) * 100 : 0
      const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0
      const roa = ATIVO_TOTAL > 0 ? (lucroLiquido / ATIVO_TOTAL) * 100 : 0
      const roe = PL > 0 ? (lucroLiquido / PL) * 100 : 0

      metricsByPeriod[p] = {
        receitaLiquida,
        lucroBruto,
        ebit,
        lucroLiquido,
        ATIVO_TOTAL,
        PL,
        ebitda,
        margemBruta,
        margemOperacional,
        margemLiquida,
        roa,
        roe,
      }
    })

    const lastPeriod = periods[periods.length - 1]
    const lastMetrics = metricsByPeriod[lastPeriod]

    return { periods, metricsByPeriod, lastPeriod, lastMetrics }
  }, [monthlyData, dreStructuredData, ebitdaData])

  const endividamentoData = useMemo(() => {
    if (!monthlyData || !monthlyData.periods.length) return null
    const periods = monthlyData.periods
    const metricsByPeriod = {}

    periods.forEach((p: any) => {
      let ATIVO_TOTAL = 0,
        PC = 0,
        PNC = 0

      monthlyData.accounts.forEach((acc: any) => {
        if (acc.tipo === 'S') return
        const sld = acc.saldos[p]
        if (!sld) return

        const rawVal = getRawNumber(sld.sldFin)

        if (acc.conta.startsWith('1')) {
          const val = sld.indDcFin === 'D' ? rawVal : -rawVal
          ATIVO_TOTAL += val
        } else if (acc.conta.startsWith('2.1')) {
          const val = sld.indDcFin === 'C' ? rawVal : -rawVal
          PC += val
        } else if (acc.conta.startsWith('2.2')) {
          const val = sld.indDcFin === 'C' ? rawVal : -rawVal
          PNC += val
        }
      })

      const CAP_TERCEIROS = PC + PNC
      const grauEndividamento = ATIVO_TOTAL > 0 ? (CAP_TERCEIROS / ATIVO_TOTAL) * 100 : 0
      const compEndividamento = CAP_TERCEIROS > 0 ? (PC / CAP_TERCEIROS) * 100 : 0

      metricsByPeriod[p] = {
        ATIVO_TOTAL,
        PC,
        PNC,
        CAP_TERCEIROS,
        grauEndividamento,
        compEndividamento,
      }
    })

    const lastPeriod = periods[periods.length - 1]
    const lastMetrics = metricsByPeriod[lastPeriod]

    return { periods, metricsByPeriod, lastPeriod, lastMetrics }
  }, [monthlyData])

  const auditoriaData = useMemo(() => {
    if (!monthlyData || !monthlyData.periods.length || !companyInfo) return null
    const lastPeriod = monthlyData.periods[monthlyData.periods.length - 1]

    let calcAtivo = 0
    let calcPassivo = 0

    monthlyData.accounts.forEach((acc: any) => {
      if (acc.tipo === 'S') return
      const sld = acc.saldos[lastPeriod]
      if (!sld) return

      const rawVal = getRawNumber(sld.sldFin)
      if (acc.conta.startsWith('1')) {
        const val = sld.indDcFin === 'D' ? rawVal : -rawVal
        calcAtivo += val
      } else if (acc.conta.startsWith('2')) {
        const val = sld.indDcFin === 'C' ? rawVal : -rawVal
        calcPassivo += val
      }
    })

    const calcLucro =
      dreStructuredData?.lines?.find((l: any) => l.id === '14_LUCRO_LIQUIDO')?.totals[lastPeriod] ||
      0

    let jAtivo = 0
    let jPassivo = 0
    let jLucro = 0
    let hasBlocoJ = false

    const parseJRow = (row: string[]) => {
      let descIdx = -1
      for (let i = 2; i < row.length; i++) {
        if (row[i] && isNaN(Number(row[i].replace(',', '.'))) && row[i].length > 2) {
          descIdx = i
          break
        }
      }
      if (descIdx !== -1 && row.length > descIdx + 2) {
        return {
          desc: row[descIdx].toUpperCase(),
          val: parseFloat(row[descIdx + 1].replace(',', '.')) || 0,
          ind: row[descIdx + 2],
        }
      }
      return null
    }

    if (companyInfo.j100 && companyInfo.j100.length > 0) {
      hasBlocoJ = true
      companyInfo.j100.forEach((row: string[]) => {
        const parsed = parseJRow(row)
        if (parsed) {
          if (parsed.desc === 'ATIVO' || parsed.desc === 'TOTAL DO ATIVO') jAtivo = parsed.val
          if (
            parsed.desc === 'PASSIVO' ||
            parsed.desc === 'TOTAL DO PASSIVO' ||
            parsed.desc === 'PASSIVO E PATRIMONIO LIQUIDO' ||
            parsed.desc === 'PASSIVO E PATRIMÔNIO LÍQUIDO'
          )
            jPassivo = parsed.val
        }
      })
    }

    if (companyInfo.j150 && companyInfo.j150.length > 0) {
      hasBlocoJ = true
      companyInfo.j150.forEach((row: string[]) => {
        const parsed = parseJRow(row)
        if (parsed) {
          if (
            parsed.desc.includes('RESULTADO LÍQUIDO') ||
            parsed.desc.includes('LUCRO LÍQUIDO') ||
            parsed.desc.includes('PREJUÍZO LÍQUIDO') ||
            parsed.desc.includes('RESULTADO DO EXERC')
          ) {
            jLucro = parsed.val
            if (parsed.ind === 'D') jLucro = -Math.abs(jLucro)
          }
        }
      })
    }

    return {
      calcAtivo,
      calcPassivo,
      calcLucro,
      jAtivo,
      jPassivo,
      jLucro,
      hasBlocoJ,
    }
  }, [monthlyData, dreStructuredData, companyInfo])

  const atividadeData = useMemo(() => {
    if (!monthlyData || !monthlyData.periods.length || !dreStructuredData) return null
    const periods = monthlyData.periods
    const metricsByPeriod = {}

    periods.forEach((p, idx) => {
      let ATIVO_TOTAL = 0,
        CLIENTES = 0,
        FORNECEDORES = 0

      monthlyData.accounts.forEach((acc: any) => {
        if (acc.tipo === 'S') return
        const sld = acc.saldos[p]
        if (!sld) return

        const rawVal = getRawNumber(sld.sldFin)
        const nomeUpper = acc.nome.toUpperCase()

        if (acc.conta.startsWith('1')) {
          const val = sld.indDcFin === 'D' ? rawVal : -rawVal
          ATIVO_TOTAL += val

          if (
            acc.conta.startsWith('1.1') &&
            (nomeUpper.includes('CLIENTE') ||
              nomeUpper.includes('DUPLICATAS A RECEBER') ||
              (nomeUpper.includes('RECEBER') &&
                !nomeUpper.includes('IMPOSTO') &&
                !nomeUpper.includes('TRIBUTO')))
          ) {
            CLIENTES += val
          }
        } else if (acc.conta.startsWith('2.1')) {
          const val = sld.indDcFin === 'C' ? rawVal : -rawVal
          if (nomeUpper.includes('FORNECEDOR') || nomeUpper.includes('FORNECEDORES')) {
            FORNECEDORES += val
          }
        }
      })

      const receitaLiquida =
        dreStructuredData.lines.find((l: any) => l.id === '03_RECEITA_LIQUIDA').totals[p] || 0
      const custos = dreStructuredData.lines.find((l: any) => l.id === '04_CUSTOS').totals[p] || 0

      const giroAtivo = ATIVO_TOTAL > 0 ? receitaLiquida / ATIVO_TOTAL : 0

      const diasPeriodo = isAccumulated ? (idx + 1) * 30 : 30
      const receitaPorDia = receitaLiquida / diasPeriodo
      const custoPorDia = Math.abs(custos) / diasPeriodo

      const pmr = receitaPorDia > 0 ? CLIENTES / receitaPorDia : 0
      const pmp = custoPorDia > 0 ? FORNECEDORES / custoPorDia : 0

      metricsByPeriod[p] = {
        ATIVO_TOTAL,
        CLIENTES,
        FORNECEDORES,
        receitaLiquida,
        custos,
        giroAtivo,
        pmr,
        pmp,
      }
    })

    const lastPeriod = periods[periods.length - 1]
    const lastMetrics = metricsByPeriod[lastPeriod]

    return { periods, metricsByPeriod, lastPeriod, lastMetrics }
  }, [monthlyData, dreStructuredData, isAccumulated])

  const topExpensesData = useMemo(() => {
    if (!monthlyData || !monthlyData.periods.length) return null

    const lastPeriod = monthlyData.periods[monthlyData.periods.length - 1]
    const fromPeriod = expenseRange?.from || lastPeriod
    const toPeriod = expenseRange?.to || lastPeriod

    // Filtra apenas os períodos dentro do intervalo selecionado
    const periodsInRange = monthlyData.periods.filter((p: any) => {
      const pMs = dateStrToMs(p.split(' a ')[0])
      const fromMs = dateStrToMs(fromPeriod.split(' a ')[0])
      const toMs = dateStrToMs(toPeriod.split(' a ')[0])
      return pMs >= fromMs && pMs <= toMs
    })

    const expenses: any[] = []
    const groupedExpenses: Record<string, any> = {}
    const expensesByGroup: Record<string, number> = {}

    monthlyData.allAccounts.forEach((acc: any) => {
      // AC: Ensure only analytic accounts (tipo === 'A' or !== 'S')
      if (acc.tipo === 'S') return
      // AC: Exclude Assets (1) and Liabilities (2)
      if (acc.conta.startsWith('1') || acc.conta.startsWith('2')) return

      const lastP = periodsInRange[periodsInRange.length - 1]
      const sldForFallback = lastP ? acc.saldos[lastP] : null
      const indDcFallback = sldForFallback ? sldForFallback.indDcFin : 'D'
      const mapping =
        customMapping[acc.conta] ||
        acc.mapeamentoOriginal ||
        getDefaultClassification(acc.conta, acc.nome, indDcFallback)

      // AC: Exclude Revenues (01, 02, 03, 07) -> only include expenses (04, 06)
      if (mapping && (mapping.startsWith('06') || mapping.startsWith('04'))) {
        const groupId = mapping
        let val = 0

        const isResult =
          acc.natureza === '04' ||
          acc.natureza === '4' ||
          acc.conta.startsWith('3') ||
          acc.conta.startsWith('4') ||
          acc.conta.startsWith('5')

        if (!isAccumulated && isResult) {
          // Visão Mensal Isolada: Soma a movimentação do intervalo
          periodsInRange.forEach((p: any) => {
            const sld = acc.saldos[p]
            if (sld) {
              const deb = getRawNumber(sld.debito)
              const cred = getRawNumber(sld.credito)
              val += Math.abs(deb - cred)
            }
          })
        } else {
          // Visão Acumulada: Pega o saldo final no fim do período final selecionado
          const sld = lastP ? acc.saldos[lastP] : null
          if (sld) {
            val = Math.abs(getRawNumber(sld.sldFin))
          }
        }

        if (val > 0) {
          const groupLabel = DRE_GROUPS_OPTIONS.find((g: any) => g.id === groupId)?.label || groupId
          if (!expensesByGroup[groupLabel]) expensesByGroup[groupLabel] = 0
          expensesByGroup[groupLabel] += val

          const customGroupId = expenseAccountToGroup[acc.conta]

          if (customGroupId) {
            if (!groupedExpenses[customGroupId]) {
              groupedExpenses[customGroupId] = {
                conta: `GRUPO_CUSTOM`,
                nome:
                  customExpenseGroups.find((g: any) => g.id === customGroupId)?.name ||
                  'Grupo Personalizado',
                valor: 0,
                grupo: 'MÚLTIPLOS GRUPOS',
                isGrouped: true,
                subAccounts: [],
              }
            }
            groupedExpenses[customGroupId].valor += val
            groupedExpenses[customGroupId].subAccounts.push(acc.conta)
          } else {
            expenses.push({
              conta: acc.conta,
              nome: acc.nome,
              valor: val,
              grupo: groupLabel,
              isGrouped: false,
            })
          }
        }
      }
    })

    Object.values(groupedExpenses).forEach((g: any) => expenses.push(g))

    expenses.sort((a: any, b: any) => b.valor - a.valor)
    const top10 = expenses.slice(0, 10)
    const maxVal = top10.length > 0 ? top10[0].valor : 0
    const totalExpenses = expenses.reduce((acc: any, curr: any) => acc + curr.valor, 0)
    const top10Total = top10.reduce((acc: any, curr: any) => acc + curr.valor, 0)
    const paretoPct = totalExpenses > 0 ? (top10Total / totalExpenses) * 100 : 0

    // Trend Analysis for Top 5 over last 12 periods
    const top5 = top10.slice(0, 5)
    const last12Periods = monthlyData.periods.slice(-12)
    const trendData = last12Periods.map((period: any) => {
      const datePart = period.split(' a ')[0]
      const [dd, mm, yyyy] = datePart.split('/')
      const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd))
      const monthName = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
      const formattedMonth = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`

      const dataPoint: any = { period: formattedMonth, fullPeriod: period }
      top5.forEach((item: any, idx: number) => {
        let periodVal = 0
        if (item.isGrouped) {
          item.subAccounts.forEach((accCode: string) => {
            const acc = monthlyData.allAccounts.find((a: any) => a.conta === accCode)
            if (acc) {
              const sld = acc.saldos[period]
              if (sld) {
                if (!isAccumulated) {
                  periodVal += Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
                } else {
                  periodVal += Math.abs(getRawNumber(sld.sldFin))
                }
              }
            }
          })
        } else {
          const acc = monthlyData.allAccounts.find((a: any) => a.conta === item.conta)
          if (acc) {
            const sld = acc.saldos[period]
            if (sld) {
              if (!isAccumulated) {
                periodVal = Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
              } else {
                periodVal = Math.abs(getRawNumber(sld.sldFin))
              }
            }
          }
        }
        dataPoint[`item${idx}`] = periodVal
      })
      return dataPoint
    })

    const distributionData = Object.entries(expensesByGroup)
      .map(([name, value]) => ({
        name: name.replace(/^[0-9.]+\s*\(-\)\s*/, '').replace(/^[0-9.]+\s*/, ''), // Clean up DRE prefix
        value,
      }))
      .sort((a: any, b: any) => b.value - a.value)
      .map((d, idx) => ({
        ...d,
        distKey: `dist${idx}`,
        fill: `var(--color-dist${idx})`,
      }))

    const displayRangeLabel =
      fromPeriod === toPeriod
        ? fromPeriod.split(' a ')[0].substring(3)
        : `${fromPeriod.split(' a ')[0].substring(3)} a ${toPeriod.split(' a ')[0].substring(3)}`

    return {
      period: displayRangeLabel,
      items: top10,
      maxVal,
      totalExpenses,
      top10Total,
      paretoPct,
      trendData,
      top5,
      distributionData,
    }
  }, [
    monthlyData,
    expenseRange,
    customMapping,
    customExpenseGroups,
    expenseAccountToGroup,
    isAccumulated,
  ])

  const dashboardData = useMemo(() => {
    if (!monthlyData.periods.length) return null

    const lastPeriod = monthlyData.periods[monthlyData.periods.length - 1]

    const macroAccounts = monthlyData.allAccounts
      .filter((acc: any) => acc.nivel === '1')
      .slice(0, 4)
      .map((acc) => {
        const sld = acc.saldos[lastPeriod]
        let val = 0
        let formattedVal = '0,00'
        let ind = ''

        if (sld) {
          const isResult =
            sld.natureza === '04' ||
            sld.natureza === '4' ||
            sld.conta.startsWith('3') ||
            sld.conta.startsWith('4') ||
            sld.conta.startsWith('5')
          if (!isAccumulated && isResult) {
            const deb = getRawNumber(sld.debito)
            const cred = getRawNumber(sld.credito)
            const net = cred - deb
            val = Math.abs(net)
            ind = net >= 0 ? 'C' : 'D'
            if (sld.conta.startsWith('4')) {
              ind = net <= 0 ? 'D' : 'C'
            }
            formattedVal = val.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          } else {
            val = getRawNumber(sld.sldFin)
            formattedVal = sld.sldFin
            ind = sld.indDcFin
          }
        }

        return {
          ...acc,
          lastValue: val,
          lastInd: ind,
          formattedVal: formattedVal,
          isPositiveResult: ind === 'C' || (acc.conta.startsWith('1') && ind === 'D'),
        }
      })

    const chartsData = charts.map((chartConf) => {
      const isChartAccumulated =
        chartAccumulated[chartConf.id] !== undefined
          ? chartAccumulated[chartConf.id]
          : isAccumulated

      const selectedAccountsInfo = monthlyData.allAccounts.filter((a: any) =>
        chartConf.accounts.includes(a.conta),
      )

      const chartRange = chartPeriods[chartConf.id]
      const fromPeriod = chartRange?.from || monthlyData.periods[0] || lastPeriod
      const toPeriod = chartRange?.to || lastPeriod

      const periodsInRange = monthlyData.periods.filter((p: any) => {
        const pMs = dateStrToMs(p.split(' a ')[0])
        const fromMs = dateStrToMs(fromPeriod.split(' a ')[0])
        const toMs = dateStrToMs(toPeriod.split(' a ')[0])
        return pMs >= fromMs && pMs <= toMs
      })

      let chartData = []
      let globalMaxVal = 0

      const accountStats = selectedAccountsInfo.map((acc: any, idx) => {
        let maxVal = 0
        let firstVal = null
        let lastVal = 0

        periodsInRange.forEach((period: any) => {
          const sld = acc.saldos[period]
          let val = 0
          if (sld) {
            const isResult =
              sld.natureza === '04' ||
              sld.natureza === '4' ||
              sld.conta.startsWith('3') ||
              sld.conta.startsWith('4') ||
              sld.conta.startsWith('5')
            if (!isChartAccumulated && isResult) {
              val = Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
            } else {
              val = getRawNumber(sld.sldFin)
            }
          }

          if (firstVal === null && val !== 0) firstVal = val
          lastVal = val
          if (val > maxVal) maxVal = val
          if (val > globalMaxVal) globalMaxVal = val
        })

        const growth =
          firstVal !== null && firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0
        const isPositive = lastVal >= (firstVal || 0)

        return {
          ...acc,
          colorIndex: idx % CHART_COLORS.length,
          maxVal,
          growth,
          isPositive,
        }
      })

      if (selectedAccountsInfo.length > 0) {
        chartData = periodsInRange.map((period: any) => {
          const periodData = {
            period,
            shortPeriod: period.split(' a ')[0].substring(3, 10),
            values: {},
          }

          selectedAccountsInfo.forEach((acc: any) => {
            const sld = acc.saldos[period]
            let rawVal = 0
            let formatted = sld ? sld.sldFin : '0,00'
            let ind = sld ? sld.indDcFin : ''

            if (sld) {
              const isResult =
                sld.natureza === '04' ||
                sld.natureza === '4' ||
                sld.conta.startsWith('3') ||
                sld.conta.startsWith('4') ||
                sld.conta.startsWith('5')
              if (!isChartAccumulated && isResult) {
                const deb = getRawNumber(sld.debito)
                const cred = getRawNumber(sld.credito)
                rawVal = Math.abs(deb - cred)
                formatted = rawVal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              } else {
                rawVal = getRawNumber(sld.sldFin)
              }
            }

            periodData.values[acc.conta] = { raw: rawVal, formatted, ind }
          })

          return periodData
        })
      }

      return {
        id: chartConf.id,
        title: chartConf.title || '',
        accounts: chartConf.accounts,
        type: chartConf.type,
        accountStats,
        chartData,
        globalMaxVal,
      }
    })

    const pieChartsData = pieCharts.map((pieConf) => {
      const isPieAccumulated =
        pieAccumulated[pieConf.id] !== undefined ? pieAccumulated[pieConf.id] : isAccumulated

      const selectedAccountsInfo = monthlyData.allAccounts.filter((a: any) =>
        pieConf.accounts.includes(a.conta),
      )
      let totalValue = 0

      // Intervalo selecionado pelo usuário ou padrão (último período)
      const pieRange = piePeriods[pieConf.id]
      const fromPeriod = pieRange?.from || lastPeriod
      const toPeriod = pieRange?.to || lastPeriod

      // Filtra apenas os períodos dentro do intervalo selecionado
      const periodsInRange = monthlyData.periods.filter((p: any) => {
        const pMs = dateStrToMs(p.split(' a ')[0])
        const fromMs = dateStrToMs(fromPeriod.split(' a ')[0])
        const toMs = dateStrToMs(toPeriod.split(' a ')[0])
        return pMs >= fromMs && pMs <= toMs
      })

      // Rótulo de exibição do intervalo
      const fromLabel = fromPeriod.split(' a ')[0].substring(3)
      const toLabel = toPeriod.split(' a ')[0].substring(3)
      const rangeLabel = fromLabel === toLabel ? fromLabel : `${fromLabel} a ${toLabel}`

      let items = selectedAccountsInfo
        .map((acc) => {
          let val = 0
          const isResult =
            acc.natureza === '04' ||
            acc.natureza === '4' ||
            acc.conta.startsWith('3') ||
            acc.conta.startsWith('4') ||
            acc.conta.startsWith('5')

          if (!isPieAccumulated && isResult) {
            // Para contas de resultado em visão mensal isolada (que agora pode ser um intervalo de isolados),
            // somamos a movimentação (débito - crédito) do intervalo selecionado.
            periodsInRange.forEach((p: any) => {
              const sld = acc.saldos[p]
              if (sld) {
                const deb = getRawNumber(sld.debito)
                const cred = getRawNumber(sld.credito)
                val += Math.abs(deb - cred)
              }
            })
          } else {
            // Em qualquer outra situação (contas patrimoniais em qualquer modo OU contas de resultado no modo Acumulado)
            // basta considerarmos o saldo final do ÚLTIMO período do intervalo selecionado.
            const lastP = periodsInRange[periodsInRange.length - 1]
            const sld = lastP ? acc.saldos[lastP] : null
            if (sld) {
              val = Math.abs(getRawNumber(sld.sldFin))
            }
          }

          totalValue += val
          return { ...acc, valor: val }
        })
        .filter((item) => item.valor > 0)

      items.sort((a: any, b: any) => b.valor - a.valor)

      return {
        id: pieConf.id,
        title: pieConf.title || '',
        accounts: pieConf.accounts,
        items,
        totalValue,
        rangeLabel,
        fromPeriod,
        toPeriod,
      }
    })

    return { macroAccounts, lastPeriod, chartsData, pieChartsData }
  }, [
    monthlyData,
    charts,
    pieCharts,
    isAccumulated,
    piePeriods,
    chartPeriods,
    chartAccumulated,
    pieAccumulated,
  ])

  const toggleAccountSelection = (chartId: any, conta: any) => {
    setCharts((prev: any) =>
      prev.map((chart) => {
        if (chart.id !== chartId) return chart
        const isSelected = chart.accounts.includes(conta)
        if (isSelected) {
          return { ...chart, accounts: chart.accounts.filter((c: any) => c !== conta) }
        }
        if (chart.accounts.length >= 5) return chart
        return { ...chart, accounts: [...chart.accounts, conta] }
      }),
    )
  }

  const changeChartType = (chartId: any, type: any) => {
    setCharts((prev: any) =>
      prev.map((chart: any) => (chart.id === chartId ? { ...chart, type } : chart)),
    )
  }

  const changeChartTitle = (chartId: string, title: string) => {
    setCharts((prev: any) =>
      prev.map((chart: any) => (chart.id === chartId ? { ...chart, title } : chart)),
    )
  }

  const changePieChartTitle = (chartId: string, title: string) => {
    setPieCharts((prev: any) =>
      prev.map((chart: any) => (chart.id === chartId ? { ...chart, title } : chart)),
    )
  }

  const removeAccount = (e: any, chartId: any, conta: any) => {
    e.stopPropagation()
    setCharts((prev: any) =>
      prev.map((chart) => {
        if (chart.id !== chartId) return chart
        return { ...chart, accounts: chart.accounts.filter((c: any) => c !== conta) }
      }),
    )
  }

  const addChart = () => {
    setCharts((prev: any) => [...prev, { id: Date.now().toString(), accounts: [], type: 'bar' }])
  }

  const removeChart = (chartId: any) => {
    setCharts((prev: any) => prev.filter((c: any) => c.id !== chartId))
  }

  const togglePieAccountSelection = (chartId: any, conta: any) => {
    setPieCharts((prev: any) =>
      prev.map((chart) => {
        if (chart.id !== chartId) return chart
        const isSelected = chart.accounts.includes(conta)
        if (isSelected) {
          return { ...chart, accounts: chart.accounts.filter((c: any) => c !== conta) }
        }
        if (chart.accounts.length >= 15) return chart
        return { ...chart, accounts: [...chart.accounts, conta] }
      }),
    )
  }

  const removePieAccount = (e: any, chartId: any, conta: any) => {
    e.stopPropagation()
    setPieCharts((prev: any) =>
      prev.map((chart) => {
        if (chart.id !== chartId) return chart
        return { ...chart, accounts: chart.accounts.filter((c: any) => c !== conta) }
      }),
    )
  }

  const addPieChart = () => {
    setPieCharts((prev: any) => [...prev, { id: `pie_${Date.now()}`, accounts: [] }])
  }

  const removePieChart = (chartId: any) => {
    setPieCharts((prev: any) => prev.filter((c: any) => c.id !== chartId))
  }

  const handleCreateExpenseGroup = () => {
    if (!newGroupName.trim()) return
    const newId = `group_${Date.now()}`
    setCustomExpenseGroups((prev: any) => [...prev, { id: newId, name: newGroupName }])
    setNewGroupName('')
  }

  const handleRemoveExpenseGroup = (groupId: any) => {
    setCustomExpenseGroups((prev: any) => prev.filter((g) => g.id !== groupId))
    setExpenseAccountToGroup((prev: any) => {
      const copy = { ...prev }
      Object.keys(copy).forEach((k) => {
        if (copy[k] === groupId) delete copy[k]
      })
      return copy
    })
  }

  const exportCSV = () => {
    let csv = ''

    if (activeTab === 'dre') {
      csv = 'Estrutura / Conta;Descrição;'
      dreStructuredData.periods.forEach((p: any) => (csv += `${p} (Valor);`))
      csv += '\n'

      dreStructuredData.lines.forEach((line: any) => {
        csv += `${line.id};${line.label};`
        dreStructuredData.periods.forEach((p: any) => {
          csv += `${line.totals[p].toFixed(2).replace('.', ',')};`
        })
        csv += '\n'

        if (line.isGroup && line.accounts.length > 0) {
          line.accounts.forEach((acc: any) => {
            csv += `${acc.conta};    ${acc.nome};`
            dreStructuredData.periods.forEach((p: any) => {
              const val = acc.saldos[p] || 0
              csv += `${val.toFixed(2).replace('.', ',')};`
            })
            csv += '\n'
          })
        }
      })
    } else if (activeTab === 'monthly') {
      csv = 'Conta;Nome;Tipo;Nível;'
      monthlyData.periods.forEach((p: any) => (csv += `${p} (Saldo Final);${p} (D/C);`))
      csv += '\n'

      monthlyData.accounts.forEach((acc: any) => {
        csv += `${acc.conta};${acc.nome};${acc.tipo};${acc.nivel};`
        monthlyData.periods.forEach((p: any) => {
          const sld = acc.saldos[p]
          if (sld) {
            csv += `${sld.sldFin};${sld.indDcFin};`
          } else {
            csv += '0,00;;'
          }
        })
        csv += '\n'
      })
    } else if (activeTab === 'ebitda') {
      csv = 'Métrica de Geração de Caixa;'
      ebitdaData.periods.forEach((p: any) => (csv += `${p};`))
      csv += '\n'
      const addRow = (label: string, key: string, isMethodProp: boolean = false) => {
        csv += `${label};`
        ebitdaData.periods.forEach((p: any) => {
          let val = isMethodProp
            ? ebitdaData.metricsByPeriod[p][key]
            : ebitdaData.metricsByPeriod[p][key]
          csv += `${val.toFixed(2).replace('.', ',')};`
        })
        csv += '\n'
      }
      addRow('MÉTODO DIRETO', 'ebitda')
      addRow('Receita Líquida', 'receitaLiquida')
      addRow('Custos Operacionais', 'custos')
      addRow('Despesas Operacionais', 'despesasOperacionaisTotais')
      addRow('Outras Receitas', 'outrasReceitas')
      addRow('EBIT', 'ebit')
      addRow('Depreciação/Amortização', 'adjDA')
      addRow('EBITDA (Direto)', 'ebitda')
      csv += '\n'
      addRow('MÉTODO INDIRETO', 'ebitdaIndirect')
      addRow('Lucro Líquido', 'lucroLiquido')
      addRow('Tributos sobre Lucro (IRPJ/CSLL)', 'adjTributos')
      addRow('Resultado Financeiro', 'adjFinanceiro')
      addRow('Participações', 'adjParticipacoes')
      addRow('EBIT Indireto', 'ebitIndirect')
      addRow('Depreciação/Amortização', 'adjDA')
      addRow('EBITDA (Indireto)', 'ebitdaIndirect')
    } else if (activeTab === 'top10') {
      csv = 'Ranking;Conta;Descrição;Grupo;Valor\n'
      topExpensesData.items.forEach((item, index) => {
        const contaDesc = item.isGrouped
          ? `(Agrupado: ${item.subAccounts.length} contas)`
          : item.conta
        csv += `${index + 1};${contaDesc};${item.nome};${item.grupo};${item.valor.toFixed(2).replace('.', ',')}\n`
      })
    } else if (activeTab === 'liquidez') {
      csv = 'Indicadores de Liquidez;\n'
      csv += 'Período;'
      liquidityData.periods.forEach((p: any) => (csv += `${p};`))
      csv += '\n'

      const addRow = (label: string, key: string, isCurrency: boolean = false) => {
        csv += `${label};`
        liquidityData.periods.forEach((p: any) => {
          let val = liquidityData.metricsByPeriod[p][key]
          csv += `${val.toFixed(2).replace('.', ',')};`
        })
        csv += '\n'
      }

      addRow('Liquidez Corrente', 'liqCorrente')
      addRow('Liquidez Seca', 'liqSeca')
      addRow('Liquidez Imediata', 'liqImediata')
      addRow('Liquidez Geral', 'liqGeral')
      csv += '\nVariáveis Base;\n'
      addRow('Ativo Circulante', 'AC', true)
      addRow('Passivo Circulante', 'PC', true)
      addRow('Estoques', 'ESTOQUES', true)
      addRow('Disponibilidades', 'DISP', true)
      addRow('Realizável a Longo Prazo', 'RLP', true)
      addRow('Exigível a Longo Prazo', 'ELP', true)
    } else if (activeTab === 'rentabilidade') {
      csv = 'Indicadores de Rentabilidade e Lucratividade;\n'
      csv += 'Período;'
      rentabilidadeData.periods.forEach((p: any) => (csv += `${p};`))
      csv += '\n'

      const addRow = (label: string, key: string, isCurrency: boolean = false) => {
        csv += `${label};`
        rentabilidadeData.periods.forEach((p: any) => {
          let val = rentabilidadeData.metricsByPeriod[p][key]
          csv += `${val.toFixed(2).replace('.', ',')};`
        })
        csv += '\n'
      }

      addRow('Margem Bruta (%)', 'margemBruta')
      addRow('Margem Operacional (%)', 'margemOperacional')
      addRow('Margem Líquida (%)', 'margemLiquida')
      addRow('ROE - Retorno sobre PL (%)', 'roe')
      addRow('ROA - Retorno sobre Ativo (%)', 'roa')
      csv += '\nVariáveis Base;\n'
      addRow('Receita Líquida', 'receitaLiquida', true)
      addRow('Lucro Bruto', 'lucroBruto', true)
      addRow('Lucro Líquido', 'lucroLiquido', true)
      addRow('Ativo Total', 'ATIVO_TOTAL', true)
      addRow('Patrimônio Líquido', 'PL', true)
      addRow('EBITDA', 'ebitda', true)
    } else if (activeTab === 'endividamento') {
      csv = 'Indicadores de Endividamento (Estrutura de Capital);\n'
      csv += 'Período;'
      endividamentoData.periods.forEach((p: any) => (csv += `${p};`))
      csv += '\n'

      const addRow = (label: string, key: string, isCurrency: boolean = false) => {
        csv += `${label};`
        endividamentoData.periods.forEach((p: any) => {
          let val = endividamentoData.metricsByPeriod[p][key]
          csv += `${val.toFixed(2).replace('.', ',')};`
        })
        csv += '\n'
      }

      addRow('Grau de Endividamento (%)', 'grauEndividamento')
      addRow('Composição do Endividamento (%)', 'compEndividamento')
      csv += '\nVariáveis Base;\n'
      addRow('Ativo Total', 'ATIVO_TOTAL', true)
      addRow('Passivo Circulante (Curto Prazo)', 'PC', true)
      addRow('Passivo Não Circulante (Longo Prazo)', 'PNC', true)
      addRow('Capital de Terceiros (Total Dívidas)', 'CAP_TERCEIROS', true)
    } else if (activeTab === 'atividade') {
      csv = 'Indicadores de Atividade (Eficiência Operacional);\n'
      csv += 'Período;'
      atividadeData.periods.forEach((p: any) => (csv += `${p};`))
      csv += '\n'

      const addRow = (label: string, key: string, isCurrency: boolean = false) => {
        csv += `${label};`
        atividadeData.periods.forEach((p: any) => {
          let val = atividadeData.metricsByPeriod[p][key]
          csv += `${val.toFixed(2).replace('.', ',')};`
        })
        csv += '\n'
      }

      addRow('Giro do Ativo (Vezes)', 'giroAtivo')
      addRow('Prazo Médio de Recebimento (PMR) - Dias', 'pmr')
      addRow('Prazo Médio de Pagamento (PMP) - Dias', 'pmp')
      csv += '\nVariáveis Base;\n'
      addRow('Ativo Total', 'ATIVO_TOTAL', true)
      addRow('Receita Líquida do Período', 'receitaLiquida', true)
      addRow('Custos Operacionais do Período', 'custos', true)
      addRow('Clientes (Contas a Receber)', 'CLIENTES', true)
      addRow('Fornecedores (Contas a Pagar)', 'FORNECEDORES', true)
    }

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resultado_${activeTab}_${companyInfo ? companyInfo.cnpj : 'ecd'}.csv`
    link.click()
  }

  const ToggleAccumulated = () => (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2 shrink-0">
      <button
        onClick={() => setIsAccumulated(false)}
        className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
      >
        Mensal Isolado
      </button>
      <button
        onClick={() => setIsAccumulated(true)}
        className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
      >
        Acumulado (YTD)
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                  Board<span className="text-indigo-600">ECD</span>
                </h1>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-0.5">
                  Presentation Deck
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {companyInfo && (
                <div className="hidden lg:flex flex-col items-end mr-6 border-r border-slate-200 pr-6">
                  <span className="text-sm font-bold text-slate-800">{companyInfo.nome}</span>
                  <span className="text-xs text-slate-500 font-mono">{companyInfo.cnpj}</span>
                </div>
              )}

              {data.length > 0 && (
                <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
                  <button
                    onClick={handleSaveConfig}
                    className="bg-white hover:bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all border border-slate-200 hover:border-indigo-200 shadow-sm text-sm"
                    title="Baixar backup do layout para partilhar com outra máquina"
                  >
                    <Save className="w-4 h-4" /> Backup Layout
                  </button>
                  <label
                    className="cursor-pointer bg-white hover:bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all border border-slate-200 hover:border-indigo-200 shadow-sm text-sm"
                    title="Importar layout de outro colega"
                  >
                    <Upload className="w-4 h-4" /> Importar
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleLoadConfig}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <button
                onClick={signOut}
                className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors mr-2 hidden sm:block"
              >
                Sair
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept=".txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Files className="w-4 h-4" />
                  )}
                  {loading ? 'Processando...' : 'Importar Dados'}
                </label>
              </div>
            </div>
          </div>

          {data.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-4 pb-2 border-t border-slate-100/50 mt-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <BarChart3 className="w-4 h-4" /> Dashboard de Evolução
              </button>
              <button
                onClick={() => setActiveTab('dre')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'dre' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Activity className="w-4 h-4" /> DRE Analítica & Subtotais
              </button>
              <button
                onClick={() => setActiveTab('ebitda')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'ebitda' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Zap className="w-4 h-4" /> Análise de EBITDA
              </button>
              <button
                onClick={() => setActiveTab('rentabilidade')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'rentabilidade' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Percent className="w-4 h-4" /> Indicadores de Rentabilidade
              </button>
              <button
                onClick={() => setActiveTab('liquidez')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'liquidez' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Scale className="w-4 h-4" /> Indicadores de Liquidez
              </button>
              <button
                onClick={() => setActiveTab('endividamento')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'endividamento' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Landmark className="w-4 h-4" /> Endividamento
              </button>
              <button
                onClick={() => setActiveTab('atividade')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'atividade' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Timer className="w-4 h-4" /> Indicadores de Atividade
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'monthly' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <CalendarDays className="w-4 h-4" /> Balancete Comparativo
              </button>
              <button
                onClick={() => setActiveTab('top10')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'top10' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <ListOrdered className="w-4 h-4" /> Top 10 Despesas
              </button>
              <button
                onClick={() => setActiveTab('auditoria')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'auditoria' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <ShieldCheck className="w-4 h-4" /> Validação SPED
              </button>

              <div className="w-full lg:w-auto flex-1"></div>
              {activeTab !== 'dashboard' && (
                <div className="flex items-center gap-3 shrink-0 py-2 lg:py-0 border-t lg:border-t-0 border-slate-100/50 w-full lg:w-auto justify-end">
                  <span className="text-sm font-bold text-slate-500 hidden sm:inline-block">
                    Perspectiva:
                  </span>
                  <ToggleAccumulated />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-12 py-8 space-y-8">
        <Alert className="bg-indigo-50/50 border-indigo-200 text-indigo-900 shadow-sm relative overflow-hidden">
          <Server className="h-5 w-5 text-indigo-600 mt-0.5" />
          <AlertTitle className="font-bold text-indigo-800 text-base">
            Sincronização Ativa (Supabase)
          </AlertTitle>
          <AlertDescription className="text-indigo-700/80 font-medium text-sm mt-1">
            Olá, {user?.email}! Seus mapeamentos e configurações de layout estão sendo salvos na
            nuvem automaticamente. Os dados brutos do SPED permanecem no seu navegador (IndexedDB)
            para garantir máxima performance.
          </AlertDescription>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-2xl"></div>
        </Alert>

        {!data.length && !loading && !companyInfo && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Análise Contábil Profissional
            </h2>
            <p className="text-slate-500 mt-4 max-w-lg text-lg leading-relaxed">
              Transforme seus arquivos <span className="font-semibold">SPED ECD</span> em
              apresentações executivas ricas, dashboards e DREs estruturadas. Tudo processado
              localmente, garantindo total privacidade.
            </p>
            <div className="mt-8 flex gap-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                Iniciar Importação de Arquivos
              </label>
            </div>
          </div>
        )}

        {/* --- ABA: DASHBOARD DE EVOLUÇÃO --- */}
        {data.length > 0 && activeTab === 'dashboard' && dashboardData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="O que é o Dashboard de Evolução e como usá-lo?"
              description="O Dashboard de Evolução é o painel de controle principal da sua empresa. Ele transforma milhares de números em gráficos fáceis de ler, ajudando você a ver se as vendas estão subindo, onde os gastos estão disparando e como está a saúde geral do negócio. Exemplo prático: se você quer saber se os gastos com marketing no ano valeram a pena, pode comparar a linha de 'Despesas com Marketing' com a de 'Receitas de Vendas' mês a mês."
              indicators={[
                {
                  name: 'Lente: Mensal Isolado vs Acumulado',
                  desc: "O botão no topo muda a forma como você vê os números. 'Mensal Isolado' mostra apenas o que aconteceu naquele mês (Ex: Lucramos 10 mil em Março?). 'Acumulado' soma tudo desde Janeiro (Ex: Lucramos 30 mil no ano até agora?).",
                },
                {
                  name: 'Cards de Resumo (O Placar)',
                  desc: 'Mostram os saldos mais importantes (como todo o dinheiro que a empresa tem, o que deve e o que gastou). A cor verde significa que a situação melhorou (mais dinheiro ou menos dívida); vermelho significa alerta.',
                },
                {
                  name: 'Gráficos Comparativos Livres',
                  desc: "Permitem colocar diferentes contas lado a lado. Exemplo: você pode selecionar 'Despesas com Pessoal' e 'Vendas' para ver se a contratação de novos funcionários realmente aumentou o faturamento.",
                },
                {
                  name: 'Pico Registrado e Crescimento',
                  desc: 'Mostra automaticamente o maior valor alcançado e o quanto cresceu (ou caiu). Exemplo: ajuda a descobrir rapidamente que em Julho a conta de energia elétrica atingiu o valor mais alto do ano.',
                },
              ]}
            />
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.macroAccounts.map((acc: any, idx) => {
                  const isPositive = acc.isPositiveResult
                  return (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out"></div>

                      <div className="relative z-10 flex justify-between items-start">
                        <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest truncate pr-4">
                          {acc.nome}
                        </h3>
                        <span
                          className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </span>
                      </div>

                      <div className="relative z-10 mt-6">
                        <p
                          className="text-3xl font-black text-slate-800 tracking-tight truncate pr-2"
                          title={`R$ ${acc.lastValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        >
                          R${' '}
                          {acc.lastValue.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 opacity-50" />
                          Fechamento de {dashboardData.lastPeriod.split(' a ')[0].substring(3)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* --- NOVA SESSÃO: GRÁFICOS DE PIZZA (COMPOSIÇÃO LIVRE) --- */}
              {dashboardData.pieChartsData.map((pieConf: any, pieIndex) => (
                <div
                  key={pieConf.id}
                  className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-8 flex flex-col gap-10"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2 group">
                        <EditableTitle
                          initialTitle={pieConf.title}
                          defaultTitle={`Composição (Pizza) ${pieIndex + 1}`}
                          onSave={(newTitle) => changePieChartTitle(pieConf.id, newTitle)}
                          className="text-xl font-bold text-slate-900 tracking-tight bg-transparent border-b border-transparent hover:border-dashed hover:border-slate-300 focus:bg-slate-50 focus:border-indigo-500 transition-all px-1.5 py-0.5 rounded outline-none w-full sm:w-[350px] placeholder:text-slate-900"
                        />
                        <Edit2 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Análise de representatividade das contas em{' '}
                        <span className="font-bold text-indigo-600">{pieConf.rangeLabel}</span>.
                      </p>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center w-full lg:w-auto">
                      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            setPieAccumulated((prev) => ({ ...prev, [pieConf.id]: false }))
                          }
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${pieAccumulated[pieConf.id] === false ? 'bg-white shadow-sm text-indigo-700' : pieAccumulated[pieConf.id] === undefined && !isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Isolado
                        </button>
                        <button
                          onClick={() =>
                            setPieAccumulated((prev) => ({ ...prev, [pieConf.id]: true }))
                          }
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${pieAccumulated[pieConf.id] === true ? 'bg-white shadow-sm text-indigo-700' : pieAccumulated[pieConf.id] === undefined && isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Acumulado
                        </button>
                      </div>

                      {/* Seletor de Intervalo de Período para o Gráfico de Pizza */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full xl:w-auto">
                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto">
                          <CalendarDays className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider shrink-0">
                            De
                          </span>
                          <select
                            value={piePeriods[pieConf.id]?.from || dashboardData.lastPeriod}
                            onChange={(e) =>
                              setPiePeriods((prev) => ({
                                ...prev,
                                [pieConf.id]: {
                                  from: e.target.value,
                                  to: prev[pieConf.id]?.to || dashboardData.lastPeriod,
                                },
                              }))
                            }
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-6 w-full"
                          >
                            {monthlyData.periods.map((p: any) => (
                              <option key={p} value={p}>
                                {p.split(' a ')[0].substring(3)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto">
                          <CalendarDays className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider shrink-0">
                            Até
                          </span>
                          <select
                            value={piePeriods[pieConf.id]?.to || dashboardData.lastPeriod}
                            onChange={(e) =>
                              setPiePeriods((prev) => ({
                                ...prev,
                                [pieConf.id]: {
                                  from: prev[pieConf.id]?.from || dashboardData.lastPeriod,
                                  to: e.target.value,
                                },
                              }))
                            }
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-6 w-full"
                          >
                            {monthlyData.periods.map((p: any) => (
                              <option key={p} value={p}>
                                {p.split(' a ')[0].substring(3)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="w-full lg:w-[450px] relative pie-dropdown-container">
                        <div
                          className="flex flex-wrap items-center gap-2 w-full min-h-[50px] p-2 bg-slate-50/80 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                          onClick={() =>
                            setOpenPieDropdownId(
                              openPieDropdownId === pieConf.id ? null : pieConf.id,
                            )
                          }
                        >
                          {pieConf.accounts.length === 0 && (
                            <span className="text-sm font-medium text-slate-400 pl-3">
                              Pesquisar e adicionar contas à pizza...
                            </span>
                          )}
                          {pieConf.accounts.map((conta: any) => {
                            const accObj = monthlyData.allAccounts.find(
                              (a: any) => a.conta === conta,
                            )
                            return (
                              <span
                                key={conta}
                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg shadow-sm"
                              >
                                {conta}
                                <button
                                  onClick={(e) => removePieAccount(e, pieConf.id, conta)}
                                  className="hover:bg-rose-50 p-0.5 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            )
                          })}
                          <ChevronsUpDown className="w-4 h-4 text-slate-400 ml-auto mr-3" />
                        </div>

                        {openPieDropdownId === pieConf.id && (
                          <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-80 flex flex-col overflow-hidden">
                            <div className="p-3 sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 z-10 flex flex-col gap-3 shadow-sm">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                  {pieConf.accounts.length}/15 permitidas
                                </p>
                              </div>
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Pesquisar conta ou descrição..."
                                  value={pieChartAccountSearch}
                                  onChange={(e) => setPieChartAccountSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                              {monthlyData.allAccounts
                                .filter(
                                  (acc: any) =>
                                    acc.conta
                                      .toLowerCase()
                                      .includes(pieChartAccountSearch.toLowerCase()) ||
                                    acc.nome
                                      .toLowerCase()
                                      .includes(pieChartAccountSearch.toLowerCase()),
                                )
                                .map((acc) => {
                                  const isSelected = pieConf.accounts.includes(acc.conta)
                                  const isDisabled = !isSelected && pieConf.accounts.length >= 15
                                  return (
                                    <div
                                      key={acc.conta}
                                      onClick={() =>
                                        !isDisabled &&
                                        togglePieAccountSelection(pieConf.id, acc.conta)
                                      }
                                      className={`flex items-center px-3 py-2.5 my-0.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}
                                      >
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-800 truncate">
                                          {acc.conta}
                                        </span>
                                        <span className="text-[12px] text-slate-500 truncate">
                                          {acc.nome}{' '}
                                          {acc.tipo === 'S' && (
                                            <span className="ml-1.5 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">
                                              Sintética
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              {monthlyData.allAccounts.filter(
                                (acc: any) =>
                                  acc.conta
                                    .toLowerCase()
                                    .includes(pieChartAccountSearch.toLowerCase()) ||
                                  acc.nome
                                    .toLowerCase()
                                    .includes(pieChartAccountSearch.toLowerCase()),
                              ).length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">
                                  Nenhuma conta encontrada.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {pieCharts.length > 1 && (
                        <button
                          onClick={() => removePieChart(pieConf.id)}
                          className="p-3.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                          title="Remover Gráfico"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {pieConf.items.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start w-full">
                      <div className="w-full lg:w-1/3 flex justify-center">
                        <div className="w-64 h-64 relative">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full transform -rotate-90 rounded-full drop-shadow-xl overflow-visible"
                          >
                            {(() => {
                              const EXTENDED_COLORS = [
                                '#6366f1',
                                '#10b981',
                                '#f59e0b',
                                '#f43f5e',
                                '#06b6d4',
                                '#8b5cf6',
                                '#ec4899',
                                '#14b8a6',
                                '#f97316',
                                '#3b82f6',
                                '#94a3b8',
                                '#84cc16',
                                '#a855f7',
                                '#ef4444',
                                '#facc15',
                              ]

                              let cumulativePercent = 0
                              return pieConf.items.map((item: any, i) => {
                                const percent = item.valor / pieConf.totalValue
                                const fill = EXTENDED_COLORS[i % EXTENDED_COLORS.length]
                                const isActive = activePieSlice === `${pieConf.id}_${item.conta}`

                                if (percent > 0.999) {
                                  return (
                                    <circle
                                      key={item.conta}
                                      cx="50"
                                      cy="50"
                                      r="50"
                                      fill={fill}
                                      className="transition-all duration-300"
                                      onMouseEnter={() =>
                                        setActivePieSlice(`${pieConf.id}_${item.conta}`)
                                      }
                                      onMouseLeave={() => setActivePieSlice(null)}
                                    />
                                  )
                                }

                                const startX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent)
                                const startY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent)
                                cumulativePercent += percent
                                const endX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent)
                                const endY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent)
                                const largeArcFlag = percent > 0.5 ? 1 : 0
                                const pathData = `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`

                                return (
                                  <path
                                    key={item.conta}
                                    d={pathData}
                                    fill={fill}
                                    stroke="#ffffff"
                                    strokeWidth="0.5"
                                    className={`transition-all duration-300 cursor-pointer ${isActive ? 'opacity-100 scale-[1.03] origin-center' : activePieSlice?.startsWith(pieConf.id) ? 'opacity-40' : 'opacity-100 hover:opacity-80'}`}
                                    onMouseEnter={() =>
                                      setActivePieSlice(`${pieConf.id}_${item.conta}`)
                                    }
                                    onMouseLeave={() => setActivePieSlice(null)}
                                    style={{ transformOrigin: '50px 50px' }}
                                  />
                                )
                              })
                            })()}
                          </svg>
                          <div className="absolute inset-[25%] bg-white rounded-full shadow-inner flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Total
                            </span>
                            <span
                              className="text-sm font-black text-slate-800"
                              title={`R$ ${pieConf.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            >
                              R$ {formatCompact(pieConf.totalValue)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                        {(() => {
                          const EXTENDED_COLORS = [
                            '#6366f1',
                            '#10b981',
                            '#f59e0b',
                            '#f43f5e',
                            '#06b6d4',
                            '#8b5cf6',
                            '#ec4899',
                            '#14b8a6',
                            '#f97316',
                            '#3b82f6',
                            '#94a3b8',
                            '#84cc16',
                            '#a855f7',
                            '#ef4444',
                            '#facc15',
                          ]

                          return pieConf.items.map((item: any, i) => {
                            const percent = (item.valor / pieConf.totalValue) * 100
                            const fill = EXTENDED_COLORS[i % EXTENDED_COLORS.length]
                            const isActive = activePieSlice === `${pieConf.id}_${item.conta}`

                            return (
                              <div
                                key={item.conta}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-slate-50 border-slate-300 shadow-sm' : 'border-transparent hover:bg-slate-50/50'}`}
                                onMouseEnter={() =>
                                  setActivePieSlice(`${pieConf.id}_${item.conta}`)
                                }
                                onMouseLeave={() => setActivePieSlice(null)}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: fill }}
                                  ></div>
                                  <div className="min-w-0">
                                    <p
                                      className="text-[13px] font-bold text-slate-800 truncate"
                                      title={item.nome}
                                    >
                                      {item.nome}
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-400 truncate">
                                      {item.conta}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                  <p className="text-[13px] font-black text-slate-700">
                                    {percent.toFixed(1)}%
                                  </p>
                                  <p className="text-[10px] font-medium text-slate-400">
                                    R$ {formatCompact(item.valor)}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <PieChart className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">
                        Selecione até 15 contas na barra acima para montar o gráfico de composição.
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addPieChart}
                className="w-full py-6 border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl text-slate-500 font-bold hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" /> Adicionar Novo Gráfico de Pizza
              </button>

              {dashboardData.chartsData.map((chartConf, chartIndex) => (
                <div
                  key={chartConf.id}
                  className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-8"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 group">
                          <EditableTitle
                            initialTitle={chartConf.title}
                            defaultTitle={`Gráfico Comparativo ${chartIndex + 1}`}
                            onSave={(newTitle) => changeChartTitle(chartConf.id, newTitle)}
                            className="text-xl font-bold text-slate-900 tracking-tight bg-transparent border-b border-transparent hover:border-dashed hover:border-slate-300 focus:bg-slate-50 focus:border-indigo-500 transition-all px-1.5 py-0.5 rounded outline-none w-full sm:w-[350px] md:w-[450px] placeholder:text-slate-900 cursor-text"
                          />
                          <Edit2 className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => changeChartType(chartConf.id, 'bar')}
                            className={`p-1.5 rounded transition-all ${chartConf.type === 'bar' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Gráfico de Barras"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => changeChartType(chartConf.id, 'line')}
                            className={`p-1.5 rounded transition-all ${chartConf.type === 'line' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Gráfico de Linhas"
                          >
                            <LineChartIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => changeChartType(chartConf.id, 'area')}
                            className={`p-1.5 rounded transition-all ${chartConf.type === 'area' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Gráfico de Área"
                          >
                            <AreaChartIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-500 font-medium mt-1 pl-1">
                        Comparativo de contas contábeis e resultado (Até 5 seleções simultâneas).
                      </p>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center w-full lg:w-auto">
                      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            setChartAccumulated((prev) => ({ ...prev, [chartConf.id]: false }))
                          }
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${chartAccumulated[chartConf.id] === false ? 'bg-white shadow-sm text-indigo-700' : chartAccumulated[chartConf.id] === undefined && !isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Isolado
                        </button>
                        <button
                          onClick={() =>
                            setChartAccumulated((prev) => ({ ...prev, [chartConf.id]: true }))
                          }
                          className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${chartAccumulated[chartConf.id] === true ? 'bg-white shadow-sm text-indigo-700' : chartAccumulated[chartConf.id] === undefined && isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Acumulado
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full xl:w-auto">
                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto">
                          <CalendarDays className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider shrink-0">
                            De
                          </span>
                          <select
                            value={
                              chartPeriods[chartConf.id]?.from ||
                              monthlyData.periods[0] ||
                              dashboardData.lastPeriod
                            }
                            onChange={(e) =>
                              setChartPeriods((prev) => ({
                                ...prev,
                                [chartConf.id]: {
                                  from: e.target.value,
                                  to: prev[chartConf.id]?.to || dashboardData.lastPeriod,
                                },
                              }))
                            }
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-6 w-full"
                          >
                            {monthlyData.periods.map((p: any) => (
                              <option key={p} value={p}>
                                {p.split(' a ')[0].substring(3)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto">
                          <CalendarDays className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider shrink-0">
                            Até
                          </span>
                          <select
                            value={chartPeriods[chartConf.id]?.to || dashboardData.lastPeriod}
                            onChange={(e) =>
                              setChartPeriods((prev) => ({
                                ...prev,
                                [chartConf.id]: {
                                  from:
                                    prev[chartConf.id]?.from ||
                                    monthlyData.periods[0] ||
                                    dashboardData.lastPeriod,
                                  to: e.target.value,
                                },
                              }))
                            }
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-6 w-full"
                          >
                            {monthlyData.periods.map((p: any) => (
                              <option key={p} value={p}>
                                {p.split(' a ')[0].substring(3)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="w-full lg:w-[450px] relative chart-dropdown-container">
                        <div
                          className="flex flex-wrap items-center gap-2 w-full min-h-[50px] p-2 bg-slate-50/80 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                          onClick={() =>
                            setOpenDropdownId(openDropdownId === chartConf.id ? null : chartConf.id)
                          }
                        >
                          {chartConf.accounts.length === 0 && (
                            <span className="text-sm font-medium text-slate-400 pl-3">
                              Pesquisar e adicionar contas ao gráfico...
                            </span>
                          )}
                          {chartConf.accounts.map((conta: any) => {
                            const accObj = monthlyData.allAccounts.find(
                              (a: any) => a.conta === conta,
                            )
                            return (
                              <span
                                key={conta}
                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg shadow-sm"
                              >
                                {conta}
                                <button
                                  onClick={(e) => removeAccount(e, chartConf.id, conta)}
                                  className="hover:bg-rose-50 p-0.5 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            )
                          })}
                          <ChevronsUpDown className="w-4 h-4 text-slate-400 ml-auto mr-3" />
                        </div>

                        {openDropdownId === chartConf.id && (
                          <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-80 flex flex-col overflow-hidden">
                            <div className="p-3 sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 z-10 flex flex-col gap-3 shadow-sm">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                  {chartConf.accounts.length}/5 permitidas
                                </p>
                              </div>
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Pesquisar conta ou descrição..."
                                  value={chartAccountSearch}
                                  onChange={(e) => setChartAccountSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                              {monthlyData.allAccounts
                                .filter(
                                  (acc: any) =>
                                    acc.conta
                                      .toLowerCase()
                                      .includes(chartAccountSearch.toLowerCase()) ||
                                    acc.nome
                                      .toLowerCase()
                                      .includes(chartAccountSearch.toLowerCase()),
                                )
                                .map((acc) => {
                                  const isSelected = chartConf.accounts.includes(acc.conta)
                                  const isDisabled = !isSelected && chartConf.accounts.length >= 5
                                  return (
                                    <div
                                      key={acc.conta}
                                      onClick={() =>
                                        !isDisabled &&
                                        toggleAccountSelection(chartConf.id, acc.conta)
                                      }
                                      className={`flex items-center px-3 py-2.5 my-0.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}
                                      >
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-800 truncate">
                                          {acc.conta}
                                        </span>
                                        <span className="text-[12px] text-slate-500 truncate">
                                          {acc.nome}{' '}
                                          {acc.tipo === 'S' && (
                                            <span className="ml-1.5 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">
                                              Sintética
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              {monthlyData.allAccounts.filter(
                                (acc: any) =>
                                  acc.conta
                                    .toLowerCase()
                                    .includes(chartAccountSearch.toLowerCase()) ||
                                  acc.nome.toLowerCase().includes(chartAccountSearch.toLowerCase()),
                              ).length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">
                                  Nenhuma conta encontrada.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {charts.length > 1 && (
                        <button
                          onClick={() => removeChart(chartConf.id)}
                          className="p-3.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                          title="Remover Gráfico"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {chartConf.accountStats.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                      <div className="xl:col-span-1 flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {chartConf.accountStats.map((stat) => {
                          const colorClass = CHART_COLORS[stat.colorIndex]
                          return (
                            <div
                              key={stat.conta}
                              className={`bg-white p-5 rounded-xl border border-slate-100 shadow-sm border-l-4 ${colorClass.border}`}
                            >
                              <p className="text-sm font-black text-slate-800 leading-tight mb-4">
                                {stat.nome}
                                <span className="block font-mono text-xs font-medium text-slate-400 mt-1">
                                  {stat.conta}
                                </span>
                              </p>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                                    Crescimento Período
                                  </span>
                                  <span
                                    className={`text-sm font-black flex items-center gap-1 ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
                                  >
                                    {stat.isPositive ? (
                                      <TrendingUp className="w-4 h-4" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(stat.growth).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                                    Pico Registrado
                                  </span>
                                  <span
                                    className="text-base font-bold text-slate-700 truncate block pr-2"
                                    title={`R$ ${stat.maxVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                  >
                                    R${' '}
                                    {stat.maxVal.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="xl:col-span-4">
                        <div className="h-[420px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            {chartConf.type === 'bar' ? (
                              <BarChart
                                data={chartConf.chartData.map((d: any) => {
                                  const point: any = { name: d.shortPeriod }
                                  chartConf.accountStats.forEach((stat: any) => {
                                    point[stat.nome] = d.values[stat.conta]?.raw || 0
                                  })
                                  return point
                                })}
                                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis
                                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                                  tickFormatter={(v: number) =>
                                    v.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  }
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                {chartConf.accountStats.map((stat: any) => (
                                  <Bar
                                    key={stat.conta}
                                    dataKey={stat.nome}
                                    fill={CHART_COLORS[stat.colorIndex].hex}
                                    radius={[4, 4, 0, 0]}
                                  />
                                ))}
                              </BarChart>
                            ) : chartConf.type === 'area' ? (
                              <AreaChart
                                data={chartConf.chartData.map((d: any) => {
                                  const point: any = { name: d.shortPeriod }
                                  chartConf.accountStats.forEach((stat: any) => {
                                    point[stat.nome] = d.values[stat.conta]?.raw || 0
                                  })
                                  return point
                                })}
                                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis
                                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                                  tickFormatter={(v: number) =>
                                    v.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  }
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                {chartConf.accountStats.map((stat: any) => (
                                  <RechartsArea
                                    key={stat.conta}
                                    type="monotone"
                                    dataKey={stat.nome}
                                    stroke={CHART_COLORS[stat.colorIndex].hex}
                                    fill={CHART_COLORS[stat.colorIndex].hex}
                                    fillOpacity={0.15}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, strokeWidth: 2 }}
                                    activeDot={{ r: 5 }}
                                  />
                                ))}
                              </AreaChart>
                            ) : (
                              <LineChart
                                data={chartConf.chartData.map((d: any) => {
                                  const point: any = { name: d.shortPeriod }
                                  chartConf.accountStats.forEach((stat: any) => {
                                    point[stat.nome] = d.values[stat.conta]?.raw || 0
                                  })
                                  return point
                                })}
                                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis
                                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                                  tickFormatter={(v: number) =>
                                    v.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  }
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                {chartConf.accountStats.map((stat: any) => (
                                  <Line
                                    key={stat.conta}
                                    type="monotone"
                                    dataKey={stat.nome}
                                    stroke={CHART_COLORS[stat.colorIndex].hex}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 5 }}
                                  />
                                ))}
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addChart}
                className="w-full py-6 border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl text-slate-500 font-bold hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" /> Adicionar Novo Gráfico Comparativo
              </button>
            </div>
          </div>
        )}

        {/* --- ABA: DRE --- */}
        {data.length > 0 && activeTab === 'dre' && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Como entender a Demonstração do Resultado (DRE)?"
              description="A DRE é o 'raio-x' financeiro da empresa. Ela responde à pergunta de ouro: 'A empresa deu lucro ou prejuízo?'. Imagine uma escada onde você começa com todo o dinheiro das vendas no topo e vai descendo degrau por degrau, pagando custos, despesas e impostos, até chegar ao que realmente sobra no bolso do dono no final."
              indicators={[
                {
                  name: '1. Receita Bruta (Tudo que entrou)',
                  desc: 'É o topo da escada. Representa tudo o que você faturou. Exemplo: Se sua padaria vendeu 1000 pães a R$ 1,00, sua Receita Bruta é de R$ 1.000,00 (antes de descontar farinha, funcionários ou impostos).',
                },
                {
                  name: '4. Custos Operacionais (O preço do produto)',
                  desc: 'É quanto custou para fazer ou comprar o que você vendeu. Exemplo: Para vender aqueles 1000 pães, você gastou R$ 300,00 em farinha, fermento e padeiro. Esse é o seu custo direto.',
                },
                {
                  name: '6. Despesas Operacionais (Manter as portas abertas)',
                  desc: 'São os gastos gerais que não estão no produto em si, mas fazem a empresa funcionar. Exemplo: O aluguel da padaria, o contador, a conta de internet e o salário do gerente.',
                },
                {
                  name: '14. Lucro Líquido (A sobra final)',
                  desc: 'É a última linha. Depois de pegar os R$ 1.000,00 das vendas, pagar os ingredientes, o aluguel e os impostos, o que sobrar aqui é o verdadeiro lucro (ou prejuízo) que o negócio gerou.',
                },
              ]}
            />
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div className="relative w-full">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Demonstração do Resultado (DRE)
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-widest">
                      Padrão CPC
                    </span>
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Classificação inteligente baseada no seu plano de contas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsMappingModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm"
                  >
                    <Settings className="w-4 h-4 text-slate-500" /> Ajustar Mapeamento
                  </button>
                  <button
                    onClick={exportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Exportar CSV
                  </button>
                </div>
              </div>

              {dreStructuredData?.lines?.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <Table className="w-full text-left text-sm">
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 border-b-2 border-slate-200 hover:bg-slate-50/80">
                        <TableHead className="p-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] min-w-[400px]">
                          Estrutura Contábil Analítica
                        </TableHead>
                        {dreStructuredData.periods.map((period) => (
                          <TableHead
                            key={period}
                            className="p-5 whitespace-nowrap text-right border-l border-slate-100 h-auto"
                          >
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                              {period.split(' a ')[0].substring(3)}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">
                              Saldo no Período
                            </span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {dreStructuredData.lines.map((line: any) => {
                        const isExpanded = expandedDreGroups[line.id]
                        const isSubtotal = line.isSubtotal
                        const hasChildren =
                          line.isGroup && line.accounts && line.accounts.length > 0

                        let rowClass = 'hover:bg-slate-50 transition-colors'
                        let textClass = 'text-slate-700 font-semibold text-[14px]'
                        let valClass = 'text-slate-700'

                        if (line.id === '14_LUCRO_LIQUIDO') {
                          rowClass = 'bg-slate-900 text-white hover:bg-slate-800'
                          textClass = 'text-white font-black text-base uppercase tracking-wide'
                          valClass = 'text-white font-black text-base'
                        } else if (line.id === '08_EBIT' || line.id === '05_LUCRO_BRUTO') {
                          rowClass =
                            'bg-indigo-50/50 border-t-2 border-indigo-100 hover:bg-indigo-50/80'
                          textClass = 'text-indigo-900 font-black text-[14px] uppercase'
                          valClass = 'text-indigo-900 font-black'
                        } else if (isSubtotal) {
                          rowClass =
                            'bg-slate-50 font-bold border-t-2 border-slate-200 hover:bg-slate-50/80'
                          textClass = 'text-slate-800 uppercase text-[12px] tracking-wide'
                          valClass = 'text-slate-800 font-bold'
                        } else if (hasChildren) {
                          rowClass = 'hover:bg-blue-50/30 cursor-pointer group'
                          textClass =
                            'text-slate-600 font-bold text-[13px] group-hover:text-blue-700 transition-colors'
                        }

                        return (
                          <React.Fragment key={line.id}>
                            <TableRow
                              onClick={() => hasChildren && toggleDreGroup(line.id)}
                              className={rowClass}
                            >
                              <TableCell className="p-4 md:px-6 flex items-center gap-3">
                                {hasChildren ? (
                                  <span
                                    className={`p-1 rounded transition-colors ${isExpanded ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}
                                  >
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </span>
                                ) : (
                                  <span className="w-6" />
                                )}
                                <span className={textClass}>{line.label}</span>
                              </TableCell>
                              {dreStructuredData.periods.map((period) => (
                                <TableCell
                                  key={period}
                                  className={`p-4 md:px-6 text-right whitespace-nowrap border-l border-slate-100/50 ${valClass}`}
                                >
                                  {formatDreValue(line.totals[period])}
                                </TableCell>
                              ))}
                            </TableRow>

                            {hasChildren &&
                              isExpanded &&
                              line.accounts.map((acc: any) => (
                                <TableRow
                                  key={acc.conta}
                                  className="bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                  <TableCell className="py-3 px-6 pl-14 flex flex-col border-l-4 border-l-blue-400/30">
                                    <span className="font-mono text-[11px] font-bold text-slate-400 tracking-wider">
                                      {acc.conta}
                                    </span>
                                    <span className="text-slate-600 font-medium text-[13px] mt-0.5">
                                      {acc.nome}
                                    </span>
                                  </TableCell>
                                  {dreStructuredData.periods.map((period) => (
                                    <TableCell
                                      key={period}
                                      className="p-3 md:px-6 text-right whitespace-nowrap border-l border-slate-100/50 text-slate-500 text-[13px] font-medium"
                                    >
                                      {formatDreValue(acc.saldos[period] || 0)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700">Classificação Indisponível</h3>
                  <p className="text-slate-500 mt-2 max-w-md">
                    O plano de contas do arquivo selecionado não contém as naturezas de resultado
                    (04) ou prefixos esperados para montagem da DRE.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA: EBITDA --- */}
        {data.length > 0 && activeTab === 'ebitda' && ebitdaData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="O que é o EBITDA e como ele mede a força do seu negócio?"
              description="O EBITDA é a resposta para a pergunta: 'A essência do meu negócio dá dinheiro?'. Ele isola a sua operação das dívidas e impostos. Exemplo prático: Imagine uma padaria que faz um pão incrível e vende muito. Porém, o dono pegou um empréstimo gigante no passado e paga juros altíssimos. O Lucro Final (Líquido) será ruim (culpa da dívida), mas o EBITDA será ótimo (mérito da operação da padaria). Bancos e investidores olham o EBITDA para saber se a empresa é viável."
              indicators={[
                {
                  name: 'EBITDA em Dinheiro (R$)',
                  desc: 'É o dinheiro que sobrou só da operação (vender menos os gastos para funcionar). Se esse valor for negativo, a empresa está "sangrando" dinheiro todo mês só para tentar existir.',
                },
                {
                  name: 'Margem EBITDA (%)',
                  desc: 'É a eficiência do negócio. Exemplo: Uma margem de 20% significa que de cada R$ 100,00 que entram no caixa pelas vendas, sobram R$ 20,00 limpos antes de pagar o governo e os juros do banco.',
                },
                {
                  name: 'Por que ignorar impostos e juros aqui?',
                  desc: 'Impostos mudam por decisões do governo e juros dependem de como você financiou a empresa. O EBITDA ignora isso para focar apenas se o seu produto/serviço consegue gerar dinheiro sozinho.',
                },
                {
                  name: 'Por que somar a Depreciação de volta?',
                  desc: "Depreciação é o carro envelhecendo, mas você não tira dinheiro do bolso hoje para pagar isso. O EBITDA devolve esse valor à conta porque quer descobrir quanto dinheiro real ('caixa') sobrou naquele mês.",
                },
              ]}
            />
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden flex flex-col p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      Geração de Caixa (EBITDA)
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Comparativo pelo Método Direto (Cima para Baixo) e Indireto (Baixo para Cima).
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setIsEbitdaMappingModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm"
                    >
                      <Settings className="w-4 h-4 text-slate-500" /> Configurar D&A
                    </button>
                    <button
                      onClick={exportCSV}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" /> Exportar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      EBITDA (Último Período)
                      <IndicatorTooltip
                        text="Dinheiro que sobrou só da operação (vender menos gastos operacionais)."
                        example="Ex: Se for negativo, a empresa está 'sangrando' dinheiro todo mês só para tentar existir."
                      />
                    </span>
                    <p className="text-3xl font-black text-indigo-700 mt-2">
                      R${' '}
                      {ebitdaData.lastMetrics.ebitda.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      Margem EBITDA
                      <IndicatorTooltip
                        text="Eficiência do negócio em gerar caixa."
                        example="Ex: Margem de 20% significa que de R$ 100 vendidos, sobram R$ 20 limpos antes de pagar impostos e juros."
                      />
                    </span>
                    <p className="text-3xl font-black text-emerald-600 mt-2">
                      {ebitdaData.lastMetrics.margin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      Resultado Operacional (EBIT)
                    </span>
                    <p className="text-3xl font-black text-slate-700 mt-2">
                      R${' '}
                      {ebitdaData.lastMetrics.ebit.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      Lucro Líquido Final
                    </span>
                    <p className="text-3xl font-black text-slate-700 mt-2">
                      R${' '}
                      {ebitdaData.lastMetrics.lucroLiquido.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {/* Gráfico de Evolução do EBITDA */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 mb-8">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
                    Evolução do EBITDA e Margem
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={ebitdaData.periods.map((p: any) => ({
                          name: p.split(' a ')[0].substring(3),
                          EBITDA: ebitdaData.metricsByPeriod[p].ebitda,
                          'Margem (%)': ebitdaData.metricsByPeriod[p].margin,
                          EBIT: ebitdaData.metricsByPeriod[p].ebit,
                        }))}
                        margin={{ top: 10, right: 60, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickFormatter={(v: number) =>
                            v.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                        <Bar yAxisId="left" dataKey="EBITDA" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="EBIT" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="Margem (%)"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabela de Reconciliação dos Métodos */}
                <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200">
                        <th className="p-4 font-bold text-slate-600 uppercase tracking-widest text-[11px] min-w-[300px]">
                          Rubrica Analítica
                        </th>
                        {ebitdaData.periods.map((period) => (
                          <th
                            key={period}
                            className="p-4 whitespace-nowrap text-right border-l border-slate-200/50"
                          >
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                              {period.split(' a ')[0].substring(3)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* MÉTODO DIRETO */}
                      <tr className="bg-slate-50">
                        <td
                          colSpan={ebitdaData.periods.length + 1}
                          className="p-3 px-5 font-black text-indigo-900 text-[12px] uppercase tracking-wider"
                        >
                          Método 1: Abordagem Direta (A partir da Receita)
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (+) Receita Líquida
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-slate-700 font-medium">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].receitaLiquida)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (-) Custos Operacionais
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-rose-600 font-medium">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].custos)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (-) Despesas Operacionais Totais
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-rose-600 font-medium">
                            {formatDreValue(
                              ebitdaData.metricsByPeriod[p].despesasOperacionaisTotais,
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (+) Outras Receitas Operacionais
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-emerald-600 font-medium">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].outrasReceitas)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-indigo-50/30 border-t border-indigo-100">
                        <td className="p-3 px-5 text-indigo-900 font-black text-[13px] uppercase">
                          (=) Resultado Operacional (EBIT)
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-indigo-900 font-black">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].ebit)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-amber-50/50 bg-amber-50/20">
                        <td className="p-3 px-5 pl-10 text-amber-900 font-semibold">
                          (+) Reversão de Depreciação / Amortização
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-amber-700 font-bold">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].adjDA)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-indigo-600 border-t border-indigo-700">
                        <td className="p-4 px-5 text-white font-black text-[15px] uppercase tracking-wider">
                          (=) EBITDA (Gerencial Direto)
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td
                            key={p}
                            className="p-4 px-4 text-right text-white font-black text-[15px]"
                          >
                            {formatDreValue(ebitdaData.metricsByPeriod[p].ebitda)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td colSpan={ebitdaData.periods.length + 1} className="h-6"></td>
                      </tr>

                      {/* MÉTODO INDIRETO */}
                      <tr className="bg-slate-50">
                        <td
                          colSpan={ebitdaData.periods.length + 1}
                          className="p-3 px-5 font-black text-slate-800 text-[12px] uppercase tracking-wider border-t border-slate-200"
                        >
                          Método 2: Abordagem Indireta (Norma CVM / Reconciliação do Lucro Líquido)
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                          Lucro Líquido do Exercício
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-slate-800 font-bold">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].lucroLiquido)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (+) Ajuste de Tributos (IRPJ/CSLL)
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-slate-700 font-medium">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].adjTributos)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (+/-) Ajuste do Resultado Financeiro
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-slate-700 font-medium">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].adjFinanceiro)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 px-5 pl-10 text-slate-600 font-semibold">
                          (+) Ajuste de Participações e Contribuições
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-slate-700 font-medium">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].adjParticipacoes)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-100/50 border-t border-slate-200">
                        <td className="p-3 px-5 text-slate-800 font-black text-[13px] uppercase">
                          (=) Resultado Operacional (EBIT Reconciliado)
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].ebitIndirect)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-amber-50/50 bg-amber-50/20">
                        <td className="p-3 px-5 pl-10 text-amber-900 font-semibold">
                          (+) Reversão de Depreciação / Amortização
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td key={p} className="p-3 px-4 text-right text-amber-700 font-bold">
                            {formatDreValue(ebitdaData.metricsByPeriod[p].adjDA)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-800 border-t border-slate-900">
                        <td className="p-4 px-5 text-white font-black text-[15px] uppercase tracking-wider">
                          (=) EBITDA (Indireto Oficial)
                        </td>
                        {ebitdaData.periods.map((p) => (
                          <td
                            key={p}
                            className="p-4 px-4 text-right text-white font-black text-[15px]"
                          >
                            {formatDreValue(ebitdaData.metricsByPeriod[p].ebitdaIndirect)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-white">
                        <td className="p-2 px-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-t border-slate-200">
                          Prova Real de Diferença (Direto vs Indireto)
                        </td>
                        {ebitdaData.periods.map((p) => {
                          const diff = ebitdaData.metricsByPeriod[p].checkDifference
                          const isOk = Math.abs(diff) < 0.05
                          return (
                            <td key={p} className="p-2 px-4 text-right border-t border-slate-200">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded ${isOk ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                              >
                                {isOk
                                  ? 'BALANCEADO'
                                  : `R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Informações Auxiliares (Auditoria do EBITDA) */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mt-8 flex flex-col md:flex-row gap-4 items-start">
                  <div className="bg-amber-100 p-2.5 rounded-lg flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">
                      Auditoria de Despesas Não-Desembolsáveis (D&A)
                    </h4>
                    <p className="text-sm text-amber-800 mt-1 mb-3">
                      Para o cálculo do EBITDA acima, o motor varreu todas as contas analíticas de
                      resultado em busca de despesas de depreciação, amortização ou exaustão para
                      adicionar de volta ao caixa gerado. As contas capturadas no balancete foram:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ebitdaData.daAccountsList.map((acc) => (
                        <span
                          key={acc.conta}
                          className="bg-white/80 border border-amber-300 shadow-sm text-amber-900 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          {acc.conta} - {acc.nome}
                        </span>
                      ))}
                      {ebitdaData.daAccountsList.length === 0 && (
                        <span className="text-sm font-bold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200">
                          Atenção: Nenhuma conta contábil de Depreciação ou Amortização foi
                          localizada no grupo de resultados.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: RENTABILIDADE --- */}
        {data.length > 0 && activeTab === 'rentabilidade' && rentabilidadeData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Para que servem os Indicadores de Rentabilidade?"
              description="Faturar muito não significa ganhar muito. Estes índices mostram exatamente qual é a fatia do bolo que fica com você. Eles medem o poder da sua empresa em transformar vendas em lucro de verdade."
              indicators={[
                {
                  name: 'Margem Bruta (O peso do produto)',
                  desc: 'Exemplo: Se você vende uma blusa por R$ 100 e a fábrica cobrou R$ 60 para fazê-la, sobraram R$ 40. Sua Margem Bruta é de 40%. Se for muito baixa, seu produto está muito barato ou custando muito caro para ser feito.',
                },
                {
                  name: 'Margem Líquida (A sobra final)',
                  desc: 'Exemplo: Dos mesmos R$ 100 da blusa, você ainda pagou o aluguel da loja, a vendedora e os impostos. No final, sobraram R$ 8 limpos. A sua Margem Líquida é de 8%. É o que realmente pode ir para o bolso do dono.',
                },
                {
                  name: 'ROE (O negócio rende mais que a poupança?)',
                  desc: 'Exemplo: Você investiu R$ 100 mil do seu dinheiro para abrir o negócio. Se o ROE é de 20% ao ano, significa que o negócio te devolveu R$ 20 mil de lucro. É melhor do que deixar o dinheiro parado no banco!',
                },
                {
                  name: 'ROA (As máquinas estão se pagando?)',
                  desc: 'Exemplo: Se a empresa tem R$ 1 Milhão em equipamentos, caminhões e computadores (Ativos) e dá pouco lucro, o ROA será baixo (ex: 2%). Isso indica que você tem muito luxo e pouca eficiência em gerar dinheiro com isso.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Rentabilidade e Lucratividade
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Análise de margens de lucro e retorno sobre investments.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={exportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Exportar Planilha
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${rentabilidadeData.lastMetrics.margemBruta >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${rentabilidadeData.lastMetrics.margemBruta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    Margem Bruta
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${rentabilidadeData.lastMetrics.margemBruta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {rentabilidadeData.lastMetrics.margemBruta.toFixed(2)}%
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${rentabilidadeData.lastMetrics.margemOperacional >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${rentabilidadeData.lastMetrics.margemOperacional >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    Margem Oper.
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${rentabilidadeData.lastMetrics.margemOperacional >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {rentabilidadeData.lastMetrics.margemOperacional.toFixed(2)}%
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${rentabilidadeData.lastMetrics.margemLiquida >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${rentabilidadeData.lastMetrics.margemLiquida >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    Margem Líquida
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${rentabilidadeData.lastMetrics.margemLiquida >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {rentabilidadeData.lastMetrics.margemLiquida.toFixed(2)}%
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${rentabilidadeData.lastMetrics.roe >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${rentabilidadeData.lastMetrics.roe >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}
                  >
                    ROE (Ret. sobre PL)
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${rentabilidadeData.lastMetrics.roe >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}
                  >
                    {rentabilidadeData.lastMetrics.roe.toFixed(2)}%
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${rentabilidadeData.lastMetrics.roa >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${rentabilidadeData.lastMetrics.roa >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}
                  >
                    ROA (Ret. sobre Ativo)
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${rentabilidadeData.lastMetrics.roa >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}
                  >
                    {rentabilidadeData.lastMetrics.roa.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Gráfico de Evolução da Rentabilidade */}
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 mb-6">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
                  Evolução das Margens e Retornos (%)
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={rentabilidadeData.periods.map((p: any) => ({
                        name: p.split(' a ')[0].substring(3),
                        'Margem Bruta': rentabilidadeData.metricsByPeriod[p].margemBruta,
                        'Margem Operacional':
                          rentabilidadeData.metricsByPeriod[p].margemOperacional,
                        'Margem Líquida': rentabilidadeData.metricsByPeriod[p].margemLiquida,
                        ROE: rentabilidadeData.metricsByPeriod[p].roe,
                        ROA: rentabilidadeData.metricsByPeriod[p].roa,
                      }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                      />
                      <Tooltip content={<CustomPctTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                      <Line
                        type="monotone"
                        dataKey="Margem Bruta"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Margem Operacional"
                        stroke="#0ea5e9"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Margem Líquida"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ROE"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ROA"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-600 uppercase tracking-widest text-[11px] min-w-[250px]">
                        Métrica / Variável
                      </th>
                      {rentabilidadeData.periods.map((period) => (
                        <th
                          key={period}
                          className="p-4 whitespace-nowrap text-right border-l border-slate-200/50"
                        >
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                            {period.split(' a ')[0].substring(3)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* INDICADORES PERCENTUAIS */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={rentabilidadeData.periods.length + 1}
                        className="p-3 px-5 font-black text-indigo-900 text-[12px] uppercase tracking-wider"
                      >
                        Evolução dos Indicadores (%)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">Margem Bruta</td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {rentabilidadeData.metricsByPeriod[p].margemBruta.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        Margem Operacional
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {rentabilidadeData.metricsByPeriod[p].margemOperacional.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">Margem Líquida</td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {rentabilidadeData.metricsByPeriod[p].margemLiquida.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        ROE (Retorno sobre o Patrimônio Líquido)
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {rentabilidadeData.metricsByPeriod[p].roe.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        ROA (Retorno sobre o Ativo)
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {rentabilidadeData.metricsByPeriod[p].roa.toFixed(2)}%
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td colSpan={rentabilidadeData.periods.length + 1} className="h-6"></td>
                    </tr>

                    {/* VARIÁVEIS BASE */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={rentabilidadeData.periods.length + 1}
                        className="p-3 px-5 font-black text-slate-600 text-[12px] uppercase tracking-wider border-t border-slate-200"
                      >
                        Variáveis Base (R$)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">Receita Líquida</td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-emerald-600 font-medium">
                          {formatDreValue(rentabilidadeData.metricsByPeriod[p].receitaLiquida)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">Lucro Bruto</td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-emerald-600 font-medium">
                          {formatDreValue(rentabilidadeData.metricsByPeriod[p].lucroBruto)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Lucro Líquido do Exercício
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-indigo-600 font-bold">
                          {formatDreValue(rentabilidadeData.metricsByPeriod[p].lucroLiquido)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Ativo Total (Acumulado)
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(rentabilidadeData.metricsByPeriod[p].ATIVO_TOTAL)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Patrimônio Líquido (Acumulado)
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(rentabilidadeData.metricsByPeriod[p].PL)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-amber-50/30 hover:bg-amber-50/50 border-t border-amber-100">
                      <td className="p-3 px-5 pl-10 text-amber-800 font-bold">
                        EBITDA Gerencial (Para Referência)
                      </td>
                      {rentabilidadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-amber-700 font-bold">
                          {formatDreValue(rentabilidadeData.metricsByPeriod[p].ebitda)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-8 flex flex-col md:flex-row gap-4 items-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Nota sobre a Estrutura de Contas
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Os cálculos de ROA e ROE dependem da exatidão dos saldos de Ativo Total (contas
                    com prefixo 1) e Patrimônio Líquido (contas com prefixo padrão 2.3 ou 2.4,
                    dependendo do PC utilizado pelo contador). As rubricas de resultado variam
                    consoante o filtro "Mensal Isolado" ou "Acumulado" que o utilizador selecionou
                    no botão do cabeçalho.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: INDICADORES DE LIQUIDEZ --- */}
        {data.length > 0 && activeTab === 'liquidez' && liquidityData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="O que são os Indicadores de Liquidez (Fôlego Financeiro)?"
              description="A liquidez mede o quão fácil a sua empresa consegue pagar as contas dela. Exemplo prático: se todo mundo que você deve batesse na sua porta hoje cobrando, você teria dinheiro ou bens fáceis de vender (como estoque e contas a receber) para pagar tudo sem fechar as portas?"
              indicators={[
                {
                  name: 'Liquidez Corrente (O Teste do Ano)',
                  desc: 'Exemplo: O número "1.50" significa que para cada R$ 1,00 que você deve pagar nos próximos meses, você tem R$ 1,50 em caixa, estoque e dinheiro a receber. Valores acima de 1 mostram que a empresa tem folga.',
                },
                {
                  name: 'Liquidez Seca (A Prova de Fogo)',
                  desc: 'Exemplo: Se tirarmos o seu Estoque da conta (porque estoque pode demorar meses para ser vendido), a empresa ainda consegue pagar o que deve? Se este número for "0.80", você precisará de 20 centavos emprestados para cada real devido se não conseguir vender nada.',
                },
                {
                  name: 'Liquidez Imediata (O Dia de Hoje)',
                  desc: "É o cenário mais extremo. Compara apenas o dinheiro 'vivo' (na conta do banco e no cofre) contra as dívidas que estão vencendo. Exemplo: '0.10' significa que o dinheiro no banco hoje cobre apenas 10% das contas do mês.",
                },
                {
                  name: 'Liquidez Geral (O Futuro)',
                  desc: 'Olha para todas as dívidas, inclusive financiamentos longos (ex: 5 anos), comparando com todos os bens da empresa (como os próprios imóveis e equipamentos). Mede se, no fim da vida da empresa, tudo que ela tem cobre tudo que ela deve.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Indicadores de Liquidez
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Análise da saúde e da capacidade de pagamento da empresa.
                  </p>
                </div>
                <button
                  onClick={exportCSV}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Exportar Planilha
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${liquidityData.lastMetrics.liqCorrente >= 1 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest flex items-center ${liquidityData.lastMetrics.liqCorrente >= 1 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    Liquidez Corrente
                    <IndicatorTooltip
                      text="Capacidade de pagar contas de curto prazo com o que tem em caixa, estoque e a receber."
                      example="Ex: '1.50' significa que para cada R$ 1 devido, você tem R$ 1,50."
                    />
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${liquidityData.lastMetrics.liqCorrente >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {liquidityData.lastMetrics.liqCorrente.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${liquidityData.lastMetrics.liqSeca >= 1 ? 'bg-emerald-50 border-emerald-100' : liquidityData.lastMetrics.liqSeca > 0.5 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest flex items-center ${liquidityData.lastMetrics.liqSeca >= 1 ? 'text-emerald-700' : liquidityData.lastMetrics.liqSeca > 0.5 ? 'text-amber-700' : 'text-rose-700'}`}
                  >
                    Liquidez Seca
                    <IndicatorTooltip
                      text="Capacidade de pagar contas sem depender da venda do Estoque."
                      example="Ex: Se for '0.80', faltarão 20 centavos para cada R$ 1 devido se não conseguir vender nada."
                    />
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${liquidityData.lastMetrics.liqSeca >= 1 ? 'text-emerald-600' : liquidityData.lastMetrics.liqSeca > 0.5 ? 'text-amber-600' : 'text-rose-600'}`}
                  >
                    {liquidityData.lastMetrics.liqSeca.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    Liquidez Imediata
                    <IndicatorTooltip
                      text="Capacidade de pagamento considerando APENAS o dinheiro vivo na conta do banco/cofre."
                      example="Ex: '0.10' significa que o dinheiro no banco hoje cobre apenas 10% das dívidas do mês."
                    />
                  </span>
                  <p className="text-3xl font-black text-slate-700 mt-2">
                    {liquidityData.lastMetrics.liqImediata.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${liquidityData.lastMetrics.liqGeral >= 1 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest flex items-center ${liquidityData.lastMetrics.liqGeral >= 1 ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    Liquidez Geral
                    <IndicatorTooltip
                      text="Capacidade de quitar TODAS as dívidas (curto e longo prazo) com todos os bens."
                      example="Ex: Compara financiamentos longos com seus imóveis e dinheiro. Se fechar a empresa, consegue pagar tudo?"
                    />
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${liquidityData.lastMetrics.liqGeral >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {liquidityData.lastMetrics.liqGeral.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Gráfico de Evolução da Liquidez */}
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 mb-6">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
                  Evolução dos Índices de Liquidez
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={liquidityData.periods.map((p: any) => ({
                        name: p.split(' a ')[0].substring(3),
                        Corrente: liquidityData.metricsByPeriod[p].liqCorrente,
                        Seca: liquidityData.metricsByPeriod[p].liqSeca,
                        Imediata: liquidityData.metricsByPeriod[p].liqImediata,
                        Geral: liquidityData.metricsByPeriod[p].liqGeral,
                      }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                      <ReferenceLine
                        y={1}
                        stroke="#ef4444"
                        strokeDasharray="8 4"
                        strokeWidth={1.5}
                        label={{
                          value: 'Zona de Segurança (1.0)',
                          position: 'insideTopRight',
                          fontSize: 10,
                          fill: '#ef4444',
                          fontWeight: 700,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Corrente"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Seca"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Imediata"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Geral"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-600 uppercase tracking-widest text-[11px] min-w-[250px]">
                        Métrica / Variável
                      </th>
                      {liquidityData.periods.map((period) => (
                        <th
                          key={period}
                          className="p-4 whitespace-nowrap text-right border-l border-slate-200/50"
                        >
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                            {period.split(' a ')[0].substring(3)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* INDICADORES */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={liquidityData.periods.length + 1}
                        className="p-3 px-5 font-black text-indigo-900 text-[12px] uppercase tracking-wider"
                      >
                        Evolução dos Indicadores (Índices)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">Liquidez Corrente</td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {liquidityData.metricsByPeriod[p].liqCorrente.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">Liquidez Seca</td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {liquidityData.metricsByPeriod[p].liqSeca.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">Liquidez Imediata</td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {liquidityData.metricsByPeriod[p].liqImediata.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">Liquidez Geral</td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {liquidityData.metricsByPeriod[p].liqGeral.toFixed(2)}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td colSpan={liquidityData.periods.length + 1} className="h-6"></td>
                    </tr>

                    {/* VARIÁVEIS BASE */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={liquidityData.periods.length + 1}
                        className="p-3 px-5 font-black text-slate-600 text-[12px] uppercase tracking-wider border-t border-slate-200"
                      >
                        Variáveis Base Extraídas do Balancete (R$)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Ativo Circulante (AC)
                      </td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(liquidityData.metricsByPeriod[p].AC)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Passivo Circulante (PC)
                      </td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(liquidityData.metricsByPeriod[p].PC)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Estoques (Subgrupo AC)
                      </td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(liquidityData.metricsByPeriod[p].ESTOQUES)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Disponibilidades (Subgrupo AC)
                      </td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(liquidityData.metricsByPeriod[p].DISP)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Realizável a Longo Prazo (RLP)
                      </td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(liquidityData.metricsByPeriod[p].RLP)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Exigível a Longo Prazo (ELP)
                      </td>
                      {liquidityData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(liquidityData.metricsByPeriod[p].ELP)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-8 flex flex-col md:flex-row gap-4 items-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Nota sobre a Estrutura de Contas
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Os cálculos de liquidez utilizam os saldos consolidados identificados pelos
                    prefixos padrões dos Planos de Contas brasileiros (ex: 1.1 para Ativo
                    Circulante, 2.1 para Passivo Circulante, 1.1.04 ou 1.1.03.01 para Estoques).
                    Valores iguais a 0 podem indicar ausência de saldo ou utilização de uma
                    hierarquia de contas não padrão (excluindo os prefixos típicos) pelo contador na
                    geração do ficheiro SPED.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: INDICADORES DE ENDIVIDAMENTO --- */}
        {data.length > 0 && activeTab === 'endividamento' && endividamentoData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Para que servem os Indicadores de Endividamento?"
              description="Eles respondem: 'Quem é o verdadeiro dono da empresa, você ou o banco?'. Estes indicadores mostram o quanto a sua empresa depende de dinheiro de fora (empréstimos, prazo de fornecedores) para continuar aberta."
              indicators={[
                {
                  name: 'Grau de Endividamento (Quem bancou a festa?)',
                  desc: 'Exemplo: Se a sua empresa tem R$ 1 Milhão de bens, e o grau de endividamento é de 80%, significa que R$ 800 mil vieram de dívidas (bancos/fornecedores) e só R$ 200 mil vieram do seu bolso. Passar dos 70% é um sinal de alerta.',
                },
                {
                  name: 'Composição da Dívida (O Sufoco)',
                  desc: 'De tudo o que você deve, quanto vence rápido? Exemplo: Se a composição for de 90%, significa que de todas as dívidas da empresa, 90% delas vencem no próximo ano. É um grande risco de sufoco no caixa.',
                },
                {
                  name: 'Capital de Terceiros',
                  desc: 'É o valor em Reais (R$) de todo o dinheiro que você está usando, mas não é seu. Junta os boletos de fornecedores, salários a pagar, impostos não pagos e empréstimos bancários.',
                },
                {
                  name: 'A dívida é sempre ruim?',
                  desc: 'Nem sempre. Se você pega um empréstimo pagando 1% ao mês, e consegue gerar 3% de lucro com esse dinheiro, a dívida foi inteligente ("alavancagem"). Mas se a dívida servir apenas para tapar buracos e pagar contas atrasadas, ela é tóxica.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Endividamento e Estrutura de Capital
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Análise da dependência de capital de terceiros e perfil da dívida.
                  </p>
                </div>
                <button
                  onClick={exportCSV}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Exportar Planilha
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${endividamentoData.lastMetrics.grauEndividamento < 50 ? 'bg-emerald-50 border-emerald-100' : endividamentoData.lastMetrics.grauEndividamento < 80 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${endividamentoData.lastMetrics.grauEndividamento < 50 ? 'text-emerald-700' : endividamentoData.lastMetrics.grauEndividamento < 80 ? 'text-amber-700' : 'text-rose-700'}`}
                  >
                    Grau de Endividamento
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${endividamentoData.lastMetrics.grauEndividamento < 50 ? 'text-emerald-600' : endividamentoData.lastMetrics.grauEndividamento < 80 ? 'text-amber-600' : 'text-rose-600'}`}
                  >
                    {endividamentoData.lastMetrics.grauEndividamento.toFixed(2)}%
                  </p>
                </div>
                <div
                  className={`p-5 rounded-xl border relative overflow-hidden ${endividamentoData.lastMetrics.compEndividamento < 50 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${endividamentoData.lastMetrics.compEndividamento < 50 ? 'text-emerald-700' : 'text-amber-700'}`}
                  >
                    Composição da Dívida
                  </span>
                  <p
                    className={`text-3xl font-black mt-2 ${endividamentoData.lastMetrics.compEndividamento < 50 ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {endividamentoData.lastMetrics.compEndividamento.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Capital de Terceiros Total
                  </span>
                  <p
                    className="text-2xl font-black text-slate-700 mt-2 truncate"
                    title={`R$ ${endividamentoData.lastMetrics.CAP_TERCEIROS.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    R$ {formatCompact(endividamentoData.lastMetrics.CAP_TERCEIROS)}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Passivo de Curto Prazo (PC)
                  </span>
                  <p
                    className="text-2xl font-black text-slate-700 mt-2 truncate"
                    title={`R$ ${endividamentoData.lastMetrics.PC.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    R$ {formatCompact(endividamentoData.lastMetrics.PC)}
                  </p>
                </div>
              </div>

              {/* Gráfico de Evolução do Endividamento */}
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 mb-6">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
                  Evolução do Endividamento (%)
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={endividamentoData.periods.map((p: any) => ({
                        name: p.split(' a ')[0].substring(3),
                        'Grau de Endividamento':
                          endividamentoData.metricsByPeriod[p].grauEndividamento,
                        'Composição (Curto Prazo)':
                          endividamentoData.metricsByPeriod[p].compEndividamento,
                      }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                      />
                      <Tooltip content={<CustomPctTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                      <ReferenceLine
                        y={60}
                        stroke="#f59e0b"
                        strokeDasharray="8 4"
                        strokeWidth={1.5}
                        label={{
                          value: 'Alerta (60%)',
                          position: 'insideTopRight',
                          fontSize: 10,
                          fill: '#f59e0b',
                          fontWeight: 700,
                        }}
                      />
                      <Bar dataKey="Grau de Endividamento" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="Composição (Curto Prazo)"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-600 uppercase tracking-widest text-[11px] min-w-[250px]">
                        Métrica / Variável
                      </th>
                      {endividamentoData.periods.map((period) => (
                        <th
                          key={period}
                          className="p-4 whitespace-nowrap text-right border-l border-slate-200/50"
                        >
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                            {period.split(' a ')[0].substring(3)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* INDICADORES PERCENTUAIS */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={endividamentoData.periods.length + 1}
                        className="p-3 px-5 font-black text-indigo-900 text-[12px] uppercase tracking-wider"
                      >
                        Evolução dos Indicadores (%)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        Grau de Endividamento
                      </td>
                      {endividamentoData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {endividamentoData.metricsByPeriod[p].grauEndividamento.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        Composição do Endividamento (Curto Prazo)
                      </td>
                      {endividamentoData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {endividamentoData.metricsByPeriod[p].compEndividamento.toFixed(2)}%
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td colSpan={endividamentoData.periods.length + 1} className="h-6"></td>
                    </tr>

                    {/* VARIÁVEIS BASE */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={endividamentoData.periods.length + 1}
                        className="p-3 px-5 font-black text-slate-600 text-[12px] uppercase tracking-wider border-t border-slate-200"
                      >
                        Variáveis Base Extraídas do Balancete (R$)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">Ativo Total</td>
                      {endividamentoData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(endividamentoData.metricsByPeriod[p].ATIVO_TOTAL)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Passivo Circulante (PC)
                      </td>
                      {endividamentoData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(endividamentoData.metricsByPeriod[p].PC)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Passivo Não Circulante (PNC)
                      </td>
                      {endividamentoData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(endividamentoData.metricsByPeriod[p].PNC)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-amber-50/30 hover:bg-amber-50/50 border-t border-amber-100">
                      <td className="p-3 px-5 pl-10 text-amber-800 font-bold">
                        Capital de Terceiros (PC + PNC)
                      </td>
                      {endividamentoData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-amber-700 font-bold">
                          {formatDreValue(endividamentoData.metricsByPeriod[p].CAP_TERCEIROS)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-8 flex flex-col md:flex-row gap-4 items-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Nota sobre a Estrutura de Contas
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Para o cálculo do Capital de Terceiros, somamos todas as dívidas representadas
                    pelo Passivo Circulante e Passivo Não Circulante (prefixos 2.1 e 2.2 do Plano de
                    Contas). Como os Passivos têm natureza credora por defeito, os valores são
                    ajustados matematicamente para o cálculo das percentagens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: INDICADORES DE ATIVIDADE --- */}
        {data.length > 0 && activeTab === 'atividade' && atividadeData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Para que servem os Indicadores de Atividade (Velocidade)?"
              description="Eles mostram a velocidade da 'roda financeira' da sua empresa. Basicamente, medem quanto tempo o seu dinheiro fica preso no bolso do cliente e quanto tempo você consegue segurar o dinheiro antes de pagar um fornecedor."
              indicators={[
                {
                  name: 'PMR - Prazo de Recebimento (Seu dinheiro com os clientes)',
                  desc: 'Exemplo: Um PMR de "45 dias" significa que você espera, em média, um mês e meio desde o dia que entregou o serviço/produto até o dia que o dinheiro realmente cai na conta. Quanto menor, melhor.',
                },
                {
                  name: 'PMP - Prazo de Pagamento (O dinheiro dos fornecedores)',
                  desc: 'Exemplo: Um PMP de "30 dias" significa que você demora, em média, 30 dias para pagar os fornecedores após receber a mercadoria. Quanto maior o prazo que você negociar, mais fôlego sua empresa tem.',
                },
                {
                  name: 'O Buraco no Caixa (Ciclo)',
                  desc: 'Exemplo prático: Se você paga o fornecedor em 30 dias, mas dá 45 dias para o cliente pagar você, existem 15 dias em que a empresa fica sem dinheiro e terá que usar capital próprio ou empréstimo para sobreviver. O ideal é sempre receber antes de pagar.',
                },
                {
                  name: 'Giro do Ativo (As máquinas rodam rápido?)',
                  desc: 'Exemplo: Um Giro de "2.5x" significa que a empresa gerou de faturamento duas vezes e meia o valor que ela possui em maquinário, carros e dinheiro. Indica que a estrutura não está ociosa.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Indicadores de Atividade
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Análise de eficiência operacional e prazos médios de recebimento e pagamento.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={exportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Exportar Planilha
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    Giro do Ativo
                    <IndicatorTooltip
                      text="Quantas vezes a empresa faturou o equivalente ao seu patrimônio total."
                      example="Ex: Giro de '2.5x' significa que a empresa vendeu 2,5 vezes o valor das suas máquinas e estrutura."
                    />
                  </span>
                  <p className="text-3xl font-black text-indigo-600 mt-2">
                    {atividadeData.lastMetrics.giroAtivo.toFixed(2)}x
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    Prazo Médio Recebimento
                    <IndicatorTooltip
                      text="Dias que o dinheiro fica 'preso' no bolso do cliente antes de você receber."
                      example="Ex: '45 dias' significa que demora um mês e meio desde a venda até o dinheiro cair na conta."
                    />
                  </span>
                  <p className="text-3xl font-black text-slate-700 mt-2">
                    {atividadeData.lastMetrics.pmr.toFixed(0)}{' '}
                    <span className="text-lg text-slate-500 font-medium">dias</span>
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    Prazo Médio Pagamento
                    <IndicatorTooltip
                      text="Dias de fôlego que você consegue segurar o dinheiro antes de pagar o fornecedor."
                      example="Ex: '30 dias' significa que você demora um mês para pagar após receber a mercadoria."
                    />
                  </span>
                  <p className="text-3xl font-black text-slate-700 mt-2">
                    {atividadeData.lastMetrics.pmp.toFixed(0)}{' '}
                    <span className="text-lg text-slate-500 font-medium">dias</span>
                  </p>
                </div>
              </div>

              {/* Gráfico de Evolução dos Prazos */}
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 mb-6">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
                  Evolução dos Prazos Médios e Giro do Ativo
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={atividadeData.periods.map((p: any) => ({
                        name: p.split(' a ')[0].substring(3),
                        'PMR (dias)': atividadeData.metricsByPeriod[p].pmr,
                        'PMP (dias)': atividadeData.metricsByPeriod[p].pmp,
                        'Giro Ativo': atividadeData.metricsByPeriod[p].giroAtivo,
                      }))}
                      margin={{ top: 10, right: 60, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        label={{
                          value: 'Dias',
                          angle: -90,
                          position: 'insideLeft',
                          fontSize: 10,
                          fill: '#94a3b8',
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        label={{
                          value: 'Giro (x)',
                          angle: 90,
                          position: 'insideRight',
                          fontSize: 10,
                          fill: '#94a3b8',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                      <Bar
                        yAxisId="left"
                        dataKey="PMR (dias)"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="PMP (dias)"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Giro Ativo"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-600 uppercase tracking-widest text-[11px] min-w-[250px]">
                        Métrica / Variável
                      </th>
                      {atividadeData.periods.map((period) => (
                        <th
                          key={period}
                          className="p-4 whitespace-nowrap text-right border-l border-slate-200/50"
                        >
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                            {period.split(' a ')[0].substring(3)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50">
                      <td
                        colSpan={atividadeData.periods.length + 1}
                        className="p-3 px-5 font-black text-indigo-900 text-[12px] uppercase tracking-wider"
                      >
                        Evolução dos Indicadores
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        Giro do Ativo (Vezes)
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {atividadeData.metricsByPeriod[p].giroAtivo.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        Prazo Médio Recebimento (Dias)
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {atividadeData.metricsByPeriod[p].pmr.toFixed(0)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-800 font-bold">
                        Prazo Médio Pagamento (Dias)
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-800 font-black">
                          {atividadeData.metricsByPeriod[p].pmp.toFixed(0)}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td colSpan={atividadeData.periods.length + 1} className="h-6"></td>
                    </tr>

                    <tr className="bg-slate-50">
                      <td
                        colSpan={atividadeData.periods.length + 1}
                        className="p-3 px-5 font-black text-slate-600 text-[12px] uppercase tracking-wider border-t border-slate-200"
                      >
                        Variáveis Base Extraídas (R$)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Ativo Total (Acumulado)
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(atividadeData.metricsByPeriod[p].ATIVO_TOTAL)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Receita Líquida do Período
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-emerald-600">
                          {formatDreValue(atividadeData.metricsByPeriod[p].receitaLiquida)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Custos Operacionais do Período
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-rose-600">
                          {formatDreValue(Math.abs(atividadeData.metricsByPeriod[p].custos))}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Clientes (Contas a Receber)
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(atividadeData.metricsByPeriod[p].CLIENTES)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 px-5 pl-10 text-slate-500 font-medium">
                        Fornecedores (Contas a Pagar)
                      </td>
                      {atividadeData.periods.map((p) => (
                        <td key={p} className="p-3 px-4 text-right text-slate-600">
                          {formatDreValue(atividadeData.metricsByPeriod[p].FORNECEDORES)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-8 flex flex-col md:flex-row gap-4 items-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Nota Metodológica
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Para o cálculo dos prazos, o sistema localiza automaticamente as contas de
                    "Clientes / Duplicatas a Receber" (Ativo Circulante 1.1) e "Fornecedores"
                    (Passivo Circulante 2.1). O cálculo considera o fluxo equivalente a 30 dias para
                    o período analisado. Pode existir distorção em operações com ciclos muito
                    sazonais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: TOP 10 DESPESAS --- */}
        {data.length > 0 && activeTab === 'top10' && topExpensesData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Para que serve o Ranking de Top 10 Despesas?"
              description="Funciona como a fatura do seu cartão de crédito. Se o dinheiro no final do mês faltou, essa tela te mostra exatamente os 10 maiores 'ralos' por onde o dinheiro da empresa está escapando."
              indicators={[
                {
                  name: 'Barras Visuais (O Tamanho do Gasto)',
                  desc: 'A cor de fundo rosa mostra o peso visual da conta. Se a barra de "Folha de Pagamento" estiver quase cheia e a de "Material de Limpeza" pequenininha, fica claro onde você deve focar seus esforços para cortar custos.',
                },
                {
                  name: 'Análise Trimestral ou Anual',
                  desc: 'Você não precisa olhar mês a mês. Exemplo: você pode selecionar o filtro "YTD" (Desde Janeiro) para descobrir qual foi a conta que mais "roubou" dinheiro da empresa ao longo de todo o ano.',
                },
                {
                  name: 'Agrupamento Personalizado (Juntar Contas)',
                  desc: "Exemplo prático: O contador lançou as manutenções dos caminhões separadas em peças, mecânico, funilaria... Isso esconde o problema. Crie um grupo 'Gastos com Frota' e jogue tudo dentro para ver o valor somado no Top 10.",
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Ranking: Top 10 Despesas
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    As contas analíticas que mais consumiram recursos da operação.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full xl:w-auto">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => {
                          const last = monthlyData.periods[monthlyData.periods.length - 1]
                          setExpenseRange({ from: last, to: last })
                        }}
                        className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap hover:bg-white hover:shadow-sm text-slate-600 hover:text-indigo-700"
                      >
                        Mês Atual
                      </button>
                      <button
                        onClick={() => {
                          const lastIdx = monthlyData.periods.length - 1
                          const fromIdx = Math.max(0, lastIdx - 2)
                          setExpenseRange({
                            from: monthlyData.periods[fromIdx],
                            to: monthlyData.periods[lastIdx],
                          })
                        }}
                        className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap hover:bg-white hover:shadow-sm text-slate-600 hover:text-indigo-700"
                      >
                        Trimestre
                      </button>
                      <button
                        onClick={() => {
                          const last = monthlyData.periods[monthlyData.periods.length - 1]
                          const first = monthlyData.periods[0]
                          setExpenseRange({ from: first, to: last })
                        }}
                        className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap hover:bg-white hover:shadow-sm text-slate-600 hover:text-indigo-700"
                      >
                        YTD
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-auto">
                        <CalendarDays className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-tight shrink-0">
                          De
                        </span>
                        <select
                          value={
                            expenseRange?.from ||
                            (monthlyData.periods.length > 0
                              ? monthlyData.periods[monthlyData.periods.length - 1]
                              : '')
                          }
                          onChange={(e) =>
                            setExpenseRange((prev) => ({
                              from: e.target.value,
                              to: prev?.to || e.target.value,
                            }))
                          }
                          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-4 w-full"
                        >
                          {monthlyData.periods.map((p) => (
                            <option key={p} value={p}>
                              {p.split(' a ')[0].substring(3)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-auto">
                        <CalendarDays className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-tight shrink-0">
                          Até
                        </span>
                        <select
                          value={
                            expenseRange?.to ||
                            (monthlyData.periods.length > 0
                              ? monthlyData.periods[monthlyData.periods.length - 1]
                              : '')
                          }
                          onChange={(e) =>
                            setExpenseRange((prev) => ({
                              from: prev?.from || e.target.value,
                              to: e.target.value,
                            }))
                          }
                          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-4 w-full"
                        >
                          {monthlyData.periods.map((p) => (
                            <option key={p} value={p}>
                              {p.split(' a ')[0].substring(3)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpenseGroupModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm"
                  >
                    <Layers className="w-4 h-4 text-slate-500" /> Agrupar Despesas
                  </button>
                  <button
                    onClick={exportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Exportar Ranking
                  </button>
                </div>
              </div>

              {topExpensesData.items.length > 0 ? (
                <>
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
                      <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1 z-10">
                        Total de Despesas
                      </p>
                      <p
                        className="text-3xl font-black text-rose-950 z-10 truncate"
                        title={`R$ ${topExpensesData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      >
                        R$ {formatCompact(topExpensesData.totalExpenses)}
                      </p>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-100 rounded-full opacity-50 blur-xl"></div>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
                      <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 z-10">
                        Total Top 10
                      </p>
                      <p
                        className="text-3xl font-black text-amber-950 z-10 truncate"
                        title={`R$ ${topExpensesData.top10Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      >
                        R$ {formatCompact(topExpensesData.top10Total)}
                      </p>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-100 rounded-full opacity-50 blur-xl"></div>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1 z-10">
                        Índice de Pareto (Top 10)
                      </p>
                      <p className="text-3xl font-black text-indigo-950 z-10">
                        {topExpensesData.paretoPct.toFixed(1)}%{' '}
                        <span className="text-sm font-medium text-indigo-600/70 ml-1">
                          do total
                        </span>
                      </p>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-xl"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfico de Evolução (Trend Analysis) das Top 5 */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Evolução das Top 5 Despesas
                          </h3>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            Análise temporal empilhada dos maiores ofensores
                          </p>
                        </div>
                      </div>
                      <div className="h-[320px] w-full flex-1">
                        {(() => {
                          const top5Config = topExpensesData.top5.reduce(
                            (acc: any, item: any, idx: number) => {
                              acc[`item${idx}`] = {
                                label: item.nome,
                                color: CHART_COLORS[idx % CHART_COLORS.length].hex,
                              }
                              return acc
                            },
                            {} as any,
                          )

                          return (
                            <ChartContainer config={top5Config} className="h-full w-full">
                              <BarChart
                                data={topExpensesData.trendData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                              >
                                <CartesianGrid
                                  vertical={false}
                                  strokeDasharray="3 3"
                                  stroke="#f1f5f9"
                                />
                                <XAxis
                                  dataKey="period"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                  tickFormatter={(value) => value.slice(0, 3)}
                                  tick={{ fontSize: 11, fill: '#64748b' }}
                                />
                                <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(v) => `R$ ${formatCompact(v)}`}
                                  width={100}
                                  tick={{ fontSize: 11, fill: '#64748b' }}
                                />
                                <ChartTooltip
                                  cursor={{ fill: '#f8fafc' }}
                                  content={<ChartTooltipContent indicator="dot" />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                {topExpensesData.top5.map((item: any, idx: number) => (
                                  <Bar
                                    key={item.conta}
                                    dataKey={`item${idx}`}
                                    stackId="a"
                                    fill={`var(--color-item${idx})`}
                                    radius={
                                      idx === topExpensesData.top5.length - 1
                                        ? [4, 4, 0, 0]
                                        : [0, 0, 0, 0]
                                    }
                                  />
                                ))}
                              </BarChart>
                            </ChartContainer>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Gráfico de Distribuição por Grupo Contábil */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-emerald-500" />
                            Distribuição por Grupo Contábil
                          </h3>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            Representatividade das naturezas
                          </p>
                        </div>
                      </div>
                      <div className="h-[320px] w-full flex-1 relative">
                        {(() => {
                          const distConfig = topExpensesData.distributionData.reduce(
                            (acc: any, item: any, idx: number) => {
                              acc[`dist${idx}`] = {
                                label: item.name,
                                color: CHART_COLORS[idx % CHART_COLORS.length].hex,
                              }
                              return acc
                            },
                            { value: { label: 'Valor (R$)' } } as any,
                          )

                          return (
                            <ChartContainer config={distConfig} className="h-full w-full">
                              <RechartsPieChart>
                                <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel indicator="dot" />}
                                />
                                <Pie
                                  data={topExpensesData.distributionData}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={75}
                                  outerRadius={105}
                                  strokeWidth={3}
                                  stroke="#ffffff"
                                  paddingAngle={2}
                                />
                                <ChartLegend
                                  content={<ChartLegendContent />}
                                  layout="vertical"
                                  verticalAlign="middle"
                                  align="right"
                                  className="w-[120px] lg:w-[150px] text-xs"
                                />
                              </RechartsPieChart>
                            </ChartContainer>
                          )
                        })()}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-[25%] sm:pr-[20%]">
                          <div className="text-center bg-white/95 backdrop-blur-sm px-4 py-3 rounded-full shadow-sm border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                              Total Geral
                            </p>
                            <p className="text-sm font-black text-slate-800">
                              R$ {formatCompact(topExpensesData.totalExpenses)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-rose-500" />
                          Ranking Detalhado (Top 10)
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Maiores despesas do período selecionado
                        </p>
                      </div>
                    </div>
                    <div className="h-[450px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={topExpensesData.items.map((item: any, i: number) => ({
                            name: item.nome,
                            conta: item.isGrouped
                              ? `Agrupado (${item.subAccounts.length} contas)`
                              : item.conta,
                            valor: item.valor,
                            fill: CHART_COLORS[i % CHART_COLORS.length].hex,
                          }))}
                          margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={220}
                            tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) =>
                              val.length > 35 ? val.substring(0, 35) + '...' : val
                            }
                          />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-xl z-50">
                                    <p className="font-bold text-slate-800 text-sm mb-1">
                                      {data.name}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono mb-2">
                                      {data.conta}
                                    </p>
                                    <p className="font-black text-rose-600">
                                      R$ {formatCompact(data.valor)}
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={28}>
                            {topExpensesData.items.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-16 text-center flex flex-col items-center border border-dashed border-slate-200 rounded-xl">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Nenhuma despesa encontrada</h3>
                  <p className="text-slate-500 mt-2 max-w-md text-sm">
                    Não foram localizados custos ou despesas operacionais no período selecionado com
                    base no mapeamento atual.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA: AUDITORIA SPED --- */}
        {data.length > 0 && activeTab === 'auditoria' && auditoriaData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Para que serve a Auditoria e Validação SPED?"
              description="Este é o teste do 'bater o ponto'. Ele serve para garantir que as informações que estamos exibindo no painel (que foram construídas linha a linha) batem perfeitamente com os documentos finais oficias que o contador enviou para a Receita Federal."
              indicators={[
                {
                  name: 'Ativo e Passivo (A Matemática Fecha?)',
                  desc: 'Exemplo: Se a aba de Dashboard mostrou que a empresa tem R$ 5 Milhões em Ativos, mas o documento oficial do contador (Bloco J) diz R$ 5.1 Milhões, o sistema avisará aqui em vermelho que está faltando alguma coisa no meio do caminho.',
                },
                {
                  name: 'Lucro Líquido (A Prova Real)',
                  desc: 'Garante que o lucro final apontado pelos nossos gráficos é exatamente o mesmo número que foi usado para calcular o imposto da empresa.',
                },
                {
                  name: 'Por que isso me dá tranquilidade?',
                  desc: 'Com esses alertas todos com o selo "Saldos Batem" em verde, você pode apresentar o painel para o banco ou para sócios com 100% de segurança de que os números estão corretos e fiéis à contabilidade.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Relatório de Confiabilidade dos Dados
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Comparação de saldos entre os blocos analíticos e os demonstrativos contábeis
                    oficiais.
                  </p>
                </div>
              </div>

              {!auditoriaData.hasBlocoJ ? (
                <div className="p-16 text-center flex flex-col items-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    Bloco J não encontrado no arquivo
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-md text-sm">
                    O arquivo SPED importado não possui os registros J100 (Balanço) e J150 (DRE)
                    para realizar a validação oficial. Os cálculos dinâmicos do Bloco I continuam
                    disponíveis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card Ativo */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                        Ativo Total
                      </h3>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Calculado (Bloco I)
                        </span>
                        <p className="text-xl font-black text-slate-800">
                          R$ {formatCompact(auditoriaData.calcAtivo)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Oficial (Bloco J100)
                        </span>
                        <p className="text-xl font-black text-slate-800">
                          R$ {formatCompact(auditoriaData.jAtivo)}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                          Diferença
                        </span>
                        {Math.abs(auditoriaData.calcAtivo - auditoriaData.jAtivo) < 1 ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-sm font-bold">
                            <Check className="w-4 h-4" /> Saldos Batem
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-sm font-bold">
                            <AlertCircle className="w-4 h-4" /> R${' '}
                            {formatCompact(
                              Math.abs(auditoriaData.calcAtivo - auditoriaData.jAtivo),
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Passivo */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                        Passivo Total + PL
                      </h3>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Calculado (Bloco I)
                        </span>
                        <p className="text-xl font-black text-slate-800">
                          R$ {formatCompact(auditoriaData.calcPassivo)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Oficial (Bloco J100)
                        </span>
                        <p className="text-xl font-black text-slate-800">
                          R$ {formatCompact(auditoriaData.jPassivo)}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                          Diferença
                        </span>
                        {Math.abs(auditoriaData.calcPassivo - auditoriaData.jPassivo) < 1 ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-sm font-bold">
                            <Check className="w-4 h-4" /> Saldos Batem
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-sm font-bold">
                            <AlertCircle className="w-4 h-4" /> R${' '}
                            {formatCompact(
                              Math.abs(auditoriaData.calcPassivo - auditoriaData.jPassivo),
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Lucro */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                        Lucro/Prejuízo Líquido
                      </h3>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Calculado (DRE Dinâmica)
                        </span>
                        <p className="text-xl font-black text-slate-800">
                          R$ {formatCompact(auditoriaData.calcLucro)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Oficial (Bloco J150)
                        </span>
                        <p className="text-xl font-black text-slate-800">
                          R$ {formatCompact(auditoriaData.jLucro)}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                          Diferença
                        </span>
                        {Math.abs(auditoriaData.calcLucro - auditoriaData.jLucro) < 1 ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-sm font-bold">
                            <Check className="w-4 h-4" /> Saldos Batem
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-sm font-bold">
                            <AlertCircle className="w-4 h-4" /> R${' '}
                            {formatCompact(
                              Math.abs(auditoriaData.calcLucro - auditoriaData.jLucro),
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-8 flex flex-col md:flex-row gap-4 items-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Status da Auditoria de Indicadores
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 mb-2">
                    A estrutura de cálculo de todos os índices foi revisada de acordo com as normas
                    contábeis:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc marker:text-slate-300">
                    <li>
                      <strong>Liquidez Seca:</strong> O estoque (prefixos 1.1.04, 1.1.4 ou
                      1.1.03.01) é subtraído com precisão do Ativo Circulante.
                    </li>
                    <li>
                      <strong>Sinais Contábeis:</strong> Contas de Ativo e Despesa têm saldo devedor
                      como positivo; Passivo e Receita têm saldo credor como positivo. O motor de
                      conversão trata isso automaticamente nos indicadores.
                    </li>
                    <li>
                      <strong>EBITDA:</strong> Validado duplamente via método direto e indireto,
                      isolando o resultado da operação principal.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA: BALANCETE COMPARATIVO --- */}
        {data.length > 0 && activeTab === 'monthly' && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Como utilizar o Balancete Comparativo?"
              description="O Balancete é a 'tabela-mãe' de toda a contabilidade. Em vez de ver gráficos ou resumos, aqui você pode investigar a origem de qualquer número, conta a conta, lado a lado em todos os meses."
              indicators={[
                {
                  name: 'Investigação (Modo Lupa)',
                  desc: 'Exemplo prático: O gráfico do painel mostrou que em Agosto as despesas explodiram. Você vem nesta tabela, busca por "Manutenção", e enxerga que em Agosto o valor foi de R$ 50 mil, enquanto no resto do ano era de apenas R$ 5 mil.',
                },
                {
                  name: 'AV% (Análise Vertical)',
                  desc: 'Marque essa caixinha para ver a porcentagem que aquela conta representa do bolo total. Exemplo: saber que a conta "Telefonia" representa 3% de todas as despesas da empresa naquele mês.',
                },
                {
                  name: 'AH% (Análise Horizontal)',
                  desc: 'Marque para ver o quanto aquela conta cresceu em relação ao mês anterior. Exemplo: um "AH: +20%" verde na receita indica que você vendeu 20% a mais do que no mês passado.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div className="relative w-full">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Balancete Comparativo
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Evolução dos saldos contábeis ao longo do tempo extraída do arquivo SPED.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-4 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={showAV}
                        onChange={() => setShowAV(!showAV)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>AV%</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={showAH}
                        onChange={() => setShowAH(!showAH)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>AH%</span>
                    </label>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar conta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={exportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Exportar CSV
                  </button>
                </div>
              </div>

              <div
                className="overflow-x-auto overflow-y-auto custom-scrollbar"
                style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '400px' }}
              >
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 px-6 font-bold text-slate-500 uppercase tracking-widest text-[11px] border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm border-r-0">
                        Conta
                      </th>
                      <th className="p-4 px-6 font-bold text-slate-500 uppercase tracking-widest text-[11px] border-b border-slate-200 min-w-[300px] sticky top-0 bg-slate-50 z-20 shadow-sm border-r-0">
                        Descrição
                      </th>
                      {monthlyData.periods.map((period) => (
                        <th
                          key={period}
                          className="p-4 px-6 whitespace-nowrap text-right border-l border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm"
                        >
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                            {period.split(' a ')[0].substring(3)}
                          </div>
                          <span className="font-bold text-slate-700">Saldo</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyData.accounts.map((acc) => {
                      const isSintetica = acc.tipo === 'S'
                      return (
                        <tr
                          key={acc.conta}
                          onClick={() => !isSintetica && openRazao(acc)}
                          className={`transition-colors ${isSintetica ? 'bg-slate-50/50' : 'bg-white cursor-pointer hover:bg-indigo-50'}`}
                        >
                          <td className="p-3 px-6 font-mono text-[12px] text-slate-600 border-r border-slate-50 group">
                            {isSintetica ? null : (
                              <Search className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity inline mr-1" />
                            )}
                            {isSintetica ? <strong>{acc.conta}</strong> : acc.conta}
                          </td>
                          <td
                            className={`p-3 px-6 ${isSintetica ? 'font-bold text-slate-800' : 'text-slate-600'}`}
                          >
                            {acc.nome}
                            {isSintetica && (
                              <span className="ml-2 text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">
                                Sintética
                              </span>
                            )}
                          </td>
                          {monthlyData.periods.map((period, pIndex) => {
                            const sld = acc.saldos[period]
                            let displayVal = '0,00'
                            let displayInd = ''
                            let rawVal = 0

                            if (sld) {
                              const isResult =
                                acc.natureza === '04' ||
                                acc.natureza === '4' ||
                                acc.conta.startsWith('3') ||
                                acc.conta.startsWith('4') ||
                                acc.conta.startsWith('5')
                              if (!isAccumulated && isResult) {
                                const deb = getRawNumber(sld.debito)
                                const cred = getRawNumber(sld.credito)
                                const net = Math.abs(deb - cred)
                                displayVal = net.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                displayInd = deb > cred ? 'D' : cred > deb ? 'C' : ''
                                rawVal = net
                              } else {
                                rawVal = Math.abs(getRawNumber(sld.sldFin))
                                displayVal = rawVal.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                displayInd = sld.indDcFin
                              }
                            }

                            // Análise Vertical
                            let avLabel = null
                            if (showAV && rawVal > 0) {
                              const isPatrimonial =
                                acc.conta.startsWith('1') || acc.conta.startsWith('2')
                              const base = isPatrimonial
                                ? baseValuesPerPeriod[period]?.ativo
                                : baseValuesPerPeriod[period]?.receita
                              if (base && base > 0) {
                                const avPct = (rawVal / base) * 100
                                avLabel = (
                                  <div
                                    className="text-[10px] text-slate-400 font-mono mt-0.5"
                                    title="Análise Vertical"
                                  >
                                    AV: {avPct.toFixed(2)}%
                                  </div>
                                )
                              }
                            }

                            // Análise Horizontal
                            let ahLabel = null
                            if (showAH && pIndex > 0) {
                              const prevPeriod = monthlyData.periods[pIndex - 1]
                              const prevSld = acc.saldos[prevPeriod]
                              let prevVal = 0
                              if (prevSld) {
                                const isResult =
                                  acc.natureza === '04' ||
                                  acc.natureza === '4' ||
                                  acc.conta.startsWith('3') ||
                                  acc.conta.startsWith('4') ||
                                  acc.conta.startsWith('5')
                                if (!isAccumulated && isResult) {
                                  prevVal = Math.abs(
                                    getRawNumber(prevSld.debito) - getRawNumber(prevSld.credito),
                                  )
                                } else {
                                  prevVal = Math.abs(getRawNumber(prevSld.sldFin))
                                }
                              }

                              if (prevVal > 0) {
                                const ahPct = (rawVal / prevVal - 1) * 100
                                const isPositive = ahPct > 0
                                const isNegative = ahPct < 0

                                // Determinar cor (Simplificado: Crescimento em despesa é ruim, em receita/ativo é bom. Aqui usaremos neutro/verde/vermelho baseado na conta)
                                const isDespesa =
                                  acc.conta.startsWith('4') ||
                                  acc.conta.startsWith('5') ||
                                  (acc.natureza === '04' &&
                                    !acc.nome.toUpperCase().includes('RECEITA'))
                                const colorClass = isDespesa
                                  ? isPositive
                                    ? 'text-rose-500'
                                    : isNegative
                                      ? 'text-emerald-500'
                                      : 'text-slate-400'
                                  : isPositive
                                    ? 'text-emerald-500'
                                    : isNegative
                                      ? 'text-rose-500'
                                      : 'text-slate-400'

                                ahLabel = (
                                  <div
                                    className={`text-[10px] font-mono mt-0.5 ${colorClass}`}
                                    title="Análise Horizontal (vs Mês Anterior)"
                                  >
                                    AH: {ahPct > 0 ? '+' : ''}
                                    {ahPct.toFixed(2)}%
                                  </div>
                                )
                              } else if (rawVal > 0 && prevVal === 0) {
                                ahLabel = (
                                  <div
                                    className="text-[10px] text-emerald-500 font-mono mt-0.5"
                                    title="Análise Horizontal (vs Mês Anterior)"
                                  >
                                    AH: N/A (Novo)
                                  </div>
                                )
                              } else {
                                ahLabel = (
                                  <div
                                    className="text-[10px] text-slate-400 font-mono mt-0.5"
                                    title="Análise Horizontal"
                                  >
                                    -
                                  </div>
                                )
                              }
                            }

                            return (
                              <td
                                key={period}
                                className={`p-3 px-6 text-right whitespace-nowrap border-l border-slate-100/50 ${isSintetica ? 'font-bold text-slate-800' : 'text-slate-600 font-medium'}`}
                              >
                                {displayVal !== '0,00' ? (
                                  <div className="flex flex-col items-end justify-center">
                                    <div className="flex items-center justify-end gap-2 w-full">
                                      <span>{displayVal}</span>
                                      <span
                                        className={`text-[10px] w-3 ${displayInd === 'D' ? 'text-blue-500' : 'text-red-500'}`}
                                      >
                                        {displayInd}
                                      </span>
                                    </div>
                                    <div className="flex gap-3 justify-end items-center mt-1 w-full opacity-80 group-hover:opacity-100 transition-opacity">
                                      {avLabel}
                                      {ahLabel}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                    {monthlyData.accounts.length === 0 && (
                      <tr>
                        <td
                          colSpan={monthlyData.periods.length + 2}
                          className="p-12 text-center text-slate-500"
                        >
                          Nenhuma conta encontrada para a pesquisa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DE MAPEAMENTO CUSTOMIZADO DA DRE --- */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Settings className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Ajustar Mapeamento da DRE</h3>
                  <p className="text-sm text-slate-500">
                    Reclassifique contas manualmente caso as regras automáticas não correspondam ao
                    seu plano.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMappingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar conta ou descrição..."
                  value={mappingSearch}
                  onChange={(e) => setMappingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Tem certeza que deseja apagar as customizações e voltar à regra inteligente?',
                    )
                  ) {
                    setCustomMapping({})
                  }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-transparent hover:border-rose-100"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Padrões
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200 w-32">
                      Conta
                    </th>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                      Descrição
                    </th>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200 w-72">
                      Classificação na DRE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccountsForMapping.map((acc) => {
                    const defaultClass = getDefaultClassification(acc.conta, acc.nome, acc.indDcFin)
                    const currentClass = customMapping[acc.conta] || defaultClass
                    const isCustom = !!customMapping[acc.conta]

                    return (
                      <tr
                        key={acc.conta}
                        className={`hover:bg-slate-50 transition-colors ${isCustom ? 'bg-indigo-50/20' : ''}`}
                      >
                        <td className="p-4 font-mono text-slate-600 font-medium text-[13px]">
                          {acc.conta}
                        </td>
                        <td className="p-4 text-slate-800 font-medium">{acc.nome}</td>
                        <td className="p-3">
                          <select
                            value={currentClass}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setCustomMapping((prev: any) => {
                                const copy = { ...prev }
                                if (newVal === defaultClass) {
                                  delete copy[acc.conta]
                                } else {
                                  copy[acc.conta] = newVal
                                }
                                return copy
                              })
                            }}
                            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isCustom ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                          >
                            {DRE_GROUPS_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredAccountsForMapping.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-slate-500">
                        Nenhuma conta encontrada na busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setIsMappingModalOpen(false)}
                className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-md"
              >
                Concluir Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE MAPEAMENTO CUSTOMIZADO DO EBITDA (D&A) --- */}
      {isEbitdaMappingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Configurar Contas D&A (EBITDA)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Marque as contas de Depreciação, Amortização ou Exaustão para adicioná-las ao
                    cálculo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEbitdaMappingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar conta ou descrição..."
                  value={ebitdaMappingSearch}
                  onChange={(e) => setEbitdaMappingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Tem certeza que deseja restaurar as detecções automáticas de D&A?',
                    )
                  ) {
                    setCustomDaMapping({})
                  }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-transparent hover:border-rose-100"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Padrões
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200 w-32">
                      Conta
                    </th>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                      Descrição
                    </th>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200 w-48 text-center">
                      Somar ao EBITDA? (D&A)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccountsForEbitdaMapping.map((acc) => {
                    const isAutoDA = checkIsAutoDaAccount(acc.conta, acc.nome, acc.natureza)
                    const currentDA =
                      customDaMapping[acc.conta] !== undefined
                        ? customDaMapping[acc.conta]
                        : isAutoDA
                    const isDACustom = customDaMapping[acc.conta] !== undefined

                    return (
                      <tr
                        key={acc.conta}
                        className={`hover:bg-slate-50 transition-colors ${isDACustom ? 'bg-indigo-50/20' : ''}`}
                      >
                        <td className="p-4 font-mono text-slate-600 font-medium text-[13px]">
                          {acc.conta}
                        </td>
                        <td className="p-4 text-slate-800 font-medium">{acc.nome}</td>
                        <td className="p-3 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={currentDA}
                              onChange={(e) => {
                                const val = e.target.checked
                                setCustomDaMapping((prev: any) => {
                                  const copy = { ...prev }
                                  if (val === isAutoDA) {
                                    delete copy[acc.conta]
                                  } else {
                                    copy[acc.conta] = val
                                  }
                                  return copy
                                })
                              }}
                              className="w-5 h-5 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                          </label>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredAccountsForEbitdaMapping.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-slate-500">
                        Nenhuma conta encontrada na busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setIsEbitdaMappingModalOpen(false)}
                className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-md"
              >
                Concluir Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE AGRUPAMENTO DE DESPESAS (TOP 10) --- */}
      {isExpenseGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Layers className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Agrupar Despesas (Top 10)</h3>
                  <p className="text-sm text-slate-500">
                    Crie pastas virtuais para unificar várias contas analíticas numa única linha no
                    ranking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpenseGroupModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nome do novo grupo (ex: Frota de Veículos, Marketing)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateExpenseGroup()}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={handleCreateExpenseGroup}
                  disabled={!newGroupName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Criar Grupo
                </button>
              </div>

              {customExpenseGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {customExpenseGroups.map((group) => (
                    <span
                      key={group.id}
                      className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {group.name}
                      <button
                        onClick={() => handleRemoveExpenseGroup(group.id)}
                        className="hover:bg-rose-50 hover:text-rose-600 p-0.5 rounded transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-b border-slate-100 bg-white flex items-center">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar despesa para agrupar..."
                  value={expenseGroupSearch}
                  onChange={(e) => setExpenseGroupSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200 w-32">
                      Conta
                    </th>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                      Descrição
                    </th>
                    <th className="p-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200 w-64">
                      Agrupamento (Top 10)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseAccountsForGrouping.map((acc) => {
                    const currentGroup = expenseAccountToGroup[acc.conta] || ''
                    const isGrouped = !!currentGroup

                    return (
                      <tr
                        key={acc.conta}
                        className={`hover:bg-slate-50 transition-colors ${isGrouped ? 'bg-indigo-50/20' : ''}`}
                      >
                        <td className="p-4 font-mono text-slate-600 font-medium text-[13px]">
                          {acc.conta}
                        </td>
                        <td className="p-4 text-slate-800 font-medium">{acc.nome}</td>
                        <td className="p-3">
                          <select
                            value={currentGroup}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setExpenseAccountToGroup((prev: any) => {
                                const copy = { ...prev }
                                if (!newVal) {
                                  delete copy[acc.conta]
                                } else {
                                  copy[acc.conta] = newVal
                                }
                                return copy
                              })
                            }}
                            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isGrouped ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'}`}
                          >
                            <option value="">-- Não agrupar --</option>
                            {customExpenseGroups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                  {expenseAccountsForGrouping.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-slate-500">
                        Nenhuma despesa encontrada na busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setIsExpenseGroupModalOpen(false)}
                className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-md"
              >
                Concluir Agrupamentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RAZÃO CONTÁBIL DRILL-DOWN --- */}
      <Sheet
        open={!!selectedAccountForRazao}
        onOpenChange={(open) => !open && setSelectedAccountForRazao(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto bg-white border-l border-slate-200"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-black text-slate-800">Razão Contábil</SheetTitle>
            <SheetDescription>
              Detalhe de lançamentos da conta{' '}
              <strong className="text-indigo-600">{selectedAccountForRazao?.conta}</strong> -{' '}
              {selectedAccountForRazao?.nome}
            </SheetDescription>
          </SheetHeader>

          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar histórico, data ou valor..."
                value={razaoSearch}
                onChange={(e) => setRazaoSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {isLoadingRazao ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 text-sm font-medium">
                Buscando lançamentos detalhados...
              </p>
            </div>
          ) : razaoTransactions.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
                  <TableRow>
                    <TableHead className="w-[100px] font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                      Data
                    </TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                      Histórico
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {filteredRazaoTransactions.map((tx, i) => (
                    <TableRow key={i} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-[11px] text-slate-500 py-3">
                        {tx.data}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium py-3">
                        {tx.historico}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap py-3">
                        <span
                          className={`text-[13px] font-bold flex items-center justify-end gap-2 ${tx.indDc === 'D' ? 'text-blue-600' : 'text-rose-600'}`}
                        >
                          {tx.valor}{' '}
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {tx.indDc}
                          </span>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRazaoTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500 text-sm">
                        Nenhum lançamento encontrado para a sua busca.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Files className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                Nenhum Lançamento Encontrado
              </h3>
              <p className="text-slate-500 text-xs">
                Os registros I250 não constam ou não correspondem a esta conta analítica no arquivo
                SPED importado.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  )
}
