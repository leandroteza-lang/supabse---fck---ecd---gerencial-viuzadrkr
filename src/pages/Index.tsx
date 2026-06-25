// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
  CalendarOff,
  CalendarClock,
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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  LogOut,
  KeyRound,
  Users,
  UserCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreVertical,
  BookOpen,
  ExternalLink,
  FileSpreadsheet,
  Eye,
  EyeOff,
  GripHorizontal,
  GripVertical,
  Pin,
  Copy,
  ClipboardList,
  Trash2,
  ListChecks,
  StickyNote,
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import AdminUsersDialog from '@/components/AdminUsersDialog'
import { TableSettingsControls } from '@/components/TableSettingsControls'
import RazaoAvancado from '@/components/RazaoAvancado'
import {
  exportCsv as dlCsv,
  exportTxt as dlTxt,
  exportXlsx as dlXlsx,
  openInBrowser as openExport,
} from '@/lib/balancete-export'
import {
  useTablePreferences,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
} from '@/hooks/use-table-preferences'

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

// Ajuda detalhada do recurso "Comparar Cenários" (Perfis de Análise)
const CenariosHelp = () => (
  <HoverCard openDelay={150} closeDelay={100}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        className="text-slate-400 hover:text-indigo-600 transition-colors"
        title="O que é Comparar Cenários?"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </HoverCardTrigger>
    <HoverCardContent
      align="start"
      className="w-[400px] max-h-[70vh] overflow-y-auto custom-scrollbar p-4 text-xs leading-relaxed shadow-2xl border-slate-200 z-[60] bg-white text-left"
    >
      <h4 className="text-sm font-black text-slate-900 mb-1">
        Comparar Cenários — Perfis de Análise
      </h4>
      <p className="text-slate-600 mb-3">
        Um <strong>Cenário</strong> (Perfil de Análise) é uma configuração salva de{' '}
        <strong>como os percentuais da tabela são calculados</strong>. Ele muda a metodologia de
        leitura, <em>não os saldos</em> — os valores em R$ continuam idênticos.
      </p>

      <p className="font-bold text-slate-800 mb-1">O que cada cenário define:</p>
      <ul className="list-disc pl-4 space-y-1.5 text-slate-600 mb-3">
        <li>
          <strong>Análise Vertical (AV%)</strong> — qual é a base de “100%”:{' '}
          <em>Padrão</em> (conta como % do Ativo Total / Receita Líquida) ou{' '}
          <em>Relativa à Conta Pai</em> (conta como % do grupo imediatamente acima).
        </li>
        <li>
          <strong>Análise Horizontal (AH%)</strong> — contra o que comparar:{' '}
          <em>Período anterior</em> (mês a mês) ou <em>Período Base Fixo</em> (tudo comparado a um
          mês de referência).
        </li>
        <li>
          <strong>Alertas de desvio (⚠️)</strong> — limites de AV%/AH% acima dos quais a célula
          sinaliza.
        </li>
      </ul>

      <p className="font-bold text-slate-800 mb-1">Como funciona o P1 / P2:</p>
      <p className="text-slate-600 mb-3">
        <strong>P1</strong> é o cenário ativo. Ao marcar <strong>Comparar Cenários</strong>,
        habilita-se o <strong>P2</strong> (um segundo cenário) e a tabela passa a mostrar os
        percentuais <strong>lado a lado, nas duas metodologias ao mesmo tempo</strong> (colunas{' '}
        <code className="bg-slate-100 px-1 rounded">AV% P1</code> e{' '}
        <code className="bg-slate-100 px-1 rounded">AV% P2</code>).
      </p>

      <p className="font-bold text-slate-800 mb-1">Exemplos práticos:</p>
      <ul className="list-disc pl-4 space-y-1.5 text-slate-600 mb-3">
        <li>
          <strong>Telefonia:</strong> no P1 (Padrão) representa <strong>3% da receita total</strong>;
          no P2 (Relativa à Pai) representa <strong>40% das Despesas Administrativas</strong>. Os
          dois números aparecem juntos para você dimensionar o gasto por ângulos diferentes.
        </li>
        <li>
          <strong>Crescimento de Receita:</strong> P1 com AH “Período anterior” mostra que Março
          cresceu <strong>+5% sobre Fevereiro</strong>; P2 com AH “Base fixo = Janeiro” mostra que
          Março está <strong>+18% sobre Janeiro</strong>. Útil para separar a variação do mês da
          tendência do ano.
        </li>
        <li>
          <strong>Auditoria de relevância:</strong> um cenário “Conservador” com alerta de AV% em 5%
          (P1) versus um “Tolerante” com alerta em 15% (P2) — você vê quais contas disparam ⚠️ em
          cada régua de materialidade.
        </li>
      </ul>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-slate-700">
        <strong>Importante:</strong> a comparação só aparece com <strong>AV%</strong> (ou AH%)
        marcado — é nesses percentuais que P1 e P2 diferem. Use a{' '}
        <strong>engrenagem (⚙️)</strong> ao lado para criar, editar ou excluir cenários.
      </div>
    </HoverCardContent>
  </HoverCard>
)

// Formatação de moeda BRL para as memórias de cálculo
const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)

// Rótulo curto de período (ex.: "01/01/2026 a 31/01/2026" -> "01/2026")
const periodLabel = (p?: string) => (p ? p.split(' a ')[0].substring(3) : 'N/A')

// Alinhamento por coluna (texto e flex)
const BC_ALIGN_TEXT: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}
const BC_ALIGN_JUSTIFY: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

// Menu (kebab) de alinhamento exibido no cabeçalho de cada coluna do Balancete
const ColAlignMenu = ({
  colKey,
  current,
  onChange,
}: {
  colKey: string
  current: 'left' | 'center' | 'right'
  onChange: (key: string, val: 'left' | 'center' | 'right') => void
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
        title="Alinhamento da coluna"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-auto p-2 z-[60]">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
        Alinhamento
      </p>
      <div className="flex gap-1">
        {(['left', 'center', 'right'] as const).map((a) => (
          <button
            key={a}
            onClick={() => onChange(colKey, a)}
            className={`p-1.5 rounded transition-colors ${current === a ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
            title={a === 'left' ? 'Esquerda' : a === 'center' ? 'Centro' : 'Direita'}
          >
            {a === 'left' ? (
              <AlignLeft className="w-4 h-4" />
            ) : a === 'center' ? (
              <AlignCenter className="w-4 h-4" />
            ) : (
              <AlignRight className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
)

// Botão de ordenação por grupo (aparece nas linhas sintéticas, por coluna)
const SortBtn = ({
  active,
  direction,
  onClick,
  dark,
}: {
  active: boolean
  direction?: 'asc' | 'desc'
  onClick: () => void
  dark?: boolean
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className="inline-flex items-center shrink-0 align-middle"
    title="Ordenar este grupo por esta coluna"
  >
    {active && direction === 'asc' ? (
      <ArrowUp className={`w-3.5 h-3.5 ${dark ? 'text-amber-300' : 'text-indigo-600'}`} />
    ) : active && direction === 'desc' ? (
      <ArrowDown className={`w-3.5 h-3.5 ${dark ? 'text-amber-300' : 'text-indigo-600'}`} />
    ) : (
      <ArrowUpDown
        className={`w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity ${dark ? 'text-white' : 'text-slate-400'}`}
      />
    )}
  </button>
)

// Popover genérico de "Memória de Cálculo" (Acumulado / Média)
const CalcMemoPopover = ({
  children,
  title,
  accent,
  conta,
  nome,
  lines,
  formula,
  resultado,
}: {
  children: React.ReactNode
  title: string
  accent: string
  conta?: string
  nome?: string
  lines: { label: string; value: string }[]
  formula?: string
  resultado: string
}) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent
      side="top"
      align="end"
      className="w-80 p-4 text-sm z-[120] max-h-[70vh] overflow-y-auto custom-scrollbar"
      onClick={(e) => e.stopPropagation()}
    >
      <h4 className="font-bold text-slate-800 mb-2 border-b pb-1 flex items-center gap-1.5">
        <BookOpen className={`h-4 w-4 ${accent}`} /> {title}
      </h4>
      {conta && (
        <div className="text-xs mb-3 pb-2 border-b border-slate-100">
          <span className="text-slate-500">Conta:</span>
          <div className="font-medium text-slate-700 leading-snug mt-0.5">
            <span className="font-mono text-indigo-600">{conta}</span> {nome}
          </div>
        </div>
      )}
      <div className="space-y-2 mt-2">
        {lines.map((l, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-slate-500">{l.label}</span>
            <span className="font-medium text-slate-700">{l.value}</span>
          </div>
        ))}
        {formula && (
          <div className="bg-slate-50 p-2 rounded-md border border-slate-100 mt-2 font-mono text-[10px] text-center text-slate-600 leading-tight">
            {formula}
          </div>
        )}
        <div className="flex justify-between items-center text-sm font-bold pt-1 border-t mt-1">
          <span className="text-slate-700">Resultado:</span>
          <span className="text-slate-700">{resultado}</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
)

// Ajuda da Perspectiva (Mensal Isolado vs Acumulado Mensal)
const PerspectivaHelp = () => (
  <HoverCard openDelay={150} closeDelay={100}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        className="text-slate-400 hover:text-indigo-600 transition-colors"
        title="Como funciona a Perspectiva?"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </HoverCardTrigger>
    <HoverCardContent
      align="end"
      className="w-[380px] p-4 text-xs leading-relaxed shadow-2xl border-slate-200 z-[60] bg-white text-left"
    >
      <h4 className="text-sm font-black text-slate-900 mb-2">Perspectiva de leitura dos valores</h4>
      <div className="space-y-2.5">
        <div>
          <p className="font-bold text-slate-800">Mensal Isolado</p>
          <p className="text-slate-600">
            Cada coluna mostra <strong>apenas a movimentação daquele mês</strong>, isoladamente. Ex.:
            a coluna 03/2026 traz só o que aconteceu em março.
          </p>
        </div>
        <div>
          <p className="font-bold text-slate-800">Acumulado Mensal</p>
          <p className="text-slate-600">
            Cada coluna <strong>soma desde o primeiro mês até ela</strong>. Ex.: 03/2026 = janeiro +
            fevereiro + março. Em contas de resultado mostra o total no período; em contas
            patrimoniais (ativo/passivo), o saldo final acumulado.
          </p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-slate-700 mt-3">
        <strong>Dica:</strong> use <strong>Mensal Isolado</strong> para comparar o desempenho mês a
        mês e <strong>Acumulado Mensal</strong> para ver a evolução total ao longo do tempo.
      </div>
    </HoverCardContent>
  </HoverCard>
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
  // Padrão recolhido para telas mais limpas; o usuário expande quando quiser.
  const [isOpen, setIsOpen] = useState(false)
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

interface AnalysisProfile {
  id: string
  name: string
  globalAvMode: 'default' | 'parent' | 'lowest_synthetic' | 'receita_bruta'
  globalAhMode: 'previous' | 'base_period'
  basePeriodForAh?: string
  customAvBases: Record<string, string | string[]>
  ahAlertThreshold?: number | null
  avAlertThreshold?: number | null
  // Alerta por intervalo (De–Até) + modo (dentro/fora). Substituem os limites únicos acima.
  // Aceitam string (campo digitável) ou número.
  avAlertMin?: number | string | null
  avAlertMax?: number | string | null
  avAlertMode?: 'dentro' | 'fora'
  ahAlertMin?: number | string | null
  ahAlertMax?: number | string | null
  ahAlertMode?: 'dentro' | 'fora'
  // Forma atual: operador (>, <, entre, fora de) + valores.
  avAlertOp?: 'none' | 'gt' | 'lt' | 'between' | 'outside'
  avAlertV1?: number | string | null
  avAlertV2?: number | string | null
  ahAlertOp?: 'none' | 'gt' | 'lt' | 'between' | 'outside'
  ahAlertV1?: number | string | null
  ahAlertV2?: number | string | null
}

// Converte um valor digitável (string/número, com vírgula ou negativo) para número.
// Retorna o fallback quando vazio/inválido/parcial (ex.: "-").
const parseLimite = (v: any, fallback: number) => {
  if (v == null) return fallback
  const s = String(v).trim().replace(',', '.')
  if (s === '' || s === '-' || s === '.' || s === '-.') return fallback
  const n = Number(s)
  return isNaN(n) ? fallback : n
}
// Avalia a condição de alerta: operador + valores (auto-normaliza o intervalo).
const condDispara = (value: number, c: any) => {
  if (!c || !c.op || c.op === 'none') return false
  const a = parseLimite(c.v1, NaN)
  const b = parseLimite(c.v2, NaN)
  switch (c.op) {
    case 'gt':
      return !isNaN(a) && value > a
    case 'lt':
      return !isNaN(a) && value < a
    case 'between':
      return !isNaN(a) && !isNaN(b) && value >= Math.min(a, b) && value <= Math.max(a, b)
    case 'outside':
      return !isNaN(a) && !isNaN(b) && (value < Math.min(a, b) || value > Math.max(a, b))
    default:
      return false
  }
}
// Texto humano da condição (para o tooltip)
const condTexto = (c: any) => {
  if (!c || !c.op || c.op === 'none') return ''
  switch (c.op) {
    case 'gt':
      return `acima de ${c.v1}%`
    case 'lt':
      return `abaixo de ${c.v1}%`
    case 'between':
      return `entre ${c.v1}% e ${c.v2}%`
    case 'outside':
      return `fora da faixa ${c.v1}% a ${c.v2}%`
    default:
      return ''
  }
}
// Condição efetiva (compatível com configurações antigas: intervalo De–Até e limite único)
const effCond = (profile: any, kind: 'av' | 'ah') => {
  const op = profile?.[`${kind}AlertOp`]
  if (op && op !== 'none') {
    return { op, v1: profile[`${kind}AlertV1`], v2: profile[`${kind}AlertV2`] }
  }
  const min = profile?.[`${kind}AlertMin`]
  const max = profile?.[`${kind}AlertMax`]
  const mode = profile?.[`${kind}AlertMode`]
  const hasMin = !isNaN(parseLimite(min, NaN))
  const hasMax = !isNaN(parseLimite(max, NaN))
  if (hasMin && hasMax) return { op: mode === 'fora' ? 'outside' : 'between', v1: min, v2: max }
  if (hasMin) return { op: mode === 'fora' ? 'lt' : 'gt', v1: min }
  if (hasMax) return { op: mode === 'fora' ? 'gt' : 'lt', v1: max }
  const t = profile?.[`${kind}AlertThreshold`]
  if (t != null) {
    return kind === 'av' ? { op: 'gt', v1: t } : { op: 'outside', v1: -t, v2: t }
  }
  return { op: 'none' }
}

// Resolução hierárquica de alertas por conta/grupo:
// verifica regras específicas (conta → grupo pai → avô…) antes do global do perfil.
const effCondForAccountFn = (profile: any, kind: 'av' | 'ah', conta: string, parentMap: any) => {
  if (!profile || !conta) return effCond(profile, kind)
  const rules: any[] = profile.accountRules || []
  let current: string | undefined = conta
  while (current) {
    const rule = rules.find((r: any) => r.conta === current)
    if (rule) {
      const op = rule[`${kind}Op`]
      if (op !== undefined && op !== null) {
        if (op === 'none') return { op: 'none' }
        return { op, v1: rule[`${kind}V1`] ?? null, v2: rule[`${kind}V2`] ?? null }
      }
    }
    current = parentMap?.[current]
  }
  return effCond(profile, kind)
}

// Texto legível de uma regra de conta
const ruleCondTexto = (op: string, v1: any, v2: any) => {
  if (!op || op === 'none') return 'Sem alerta'
  switch (op) {
    case 'gt': return `> ${v1}%`
    case 'lt': return `< ${v1}%`
    case 'between': return `entre ${v1}% e ${v2}%`
    case 'outside': return `fora de ${v1}% a ${v2}%`
    default: return op
  }
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

// ─── Roteiros / Checklists ────────────────────────────────────────────────────
const CHECKLIST_COLORS = ['indigo','rose','amber','emerald','violet','sky','orange'] as const

const CHECKLIST_TEMPLATES = [
  {
    name: 'Reunião Mensal de Resultados',
    emoji: '📊',
    color: 'indigo',
    sections: [
      { title: 'Abertura', items: ['Confirmar empresa e período selecionado', 'Verificar se todos os dados foram importados', 'Apresentar visão geral do dashboard'] },
      { title: 'Receitas', items: ['Receita Bruta — apresentar variação AH%', 'Deduções de receita (impostos, devoluções)', 'Receita Líquida — evolução vs. período anterior'] },
      { title: 'Custos e Despesas', items: ['CPV/CSP — Custo dos Produtos/Serviços', 'Top 5 despesas operacionais', 'Despesas financeiras — taxa e volume'] },
      { title: 'Resultado', items: ['EBITDA — margem %', 'Lucro/Prejuízo Líquido', 'Análise Horizontal vs. período anterior'] },
      { title: 'Encerramento', items: ['Pontos de atenção identificados', 'Próximas ações definidas', 'Data da próxima reunião confirmada'] },
    ],
  },
  {
    name: 'Fechamento de Período',
    emoji: '📅',
    color: 'amber',
    sections: [
      { title: 'Importação', items: ['Exportar SPED ECD do sistema contábil', 'Importar arquivo no BoardECD', 'Confirmar empresa e período importados'] },
      { title: 'Validação SPED', items: ['Executar Validação SPED — sem divergências', 'Saldo inicial = saldo final do período anterior', 'Conferir totais J100 / J150'] },
      { title: 'Conferência', items: ['Ausências de contas recorrentes verificadas', 'Mapa de Movimentação analisado', 'Lacunas de movimento identificadas'] },
      { title: 'Backup e Registro', items: ['Exportar balancete em Excel/PDF', 'Registrar data de fechamento', 'Comunicar equipe sobre o encerramento'] },
    ],
  },
  {
    name: 'Auditoria Rápida',
    emoji: '🔍',
    color: 'rose',
    sections: [
      { title: 'Integridade dos Dados', items: ['Sem divergências de saldo (J100/J150)', 'Saldo inicial correto', 'Contas recorrentes sem ausências'] },
      { title: 'Análises Percentuais', items: ['AV% — despesas dentro do limite do perfil', 'AH% — variações atípicas investigadas', 'Contas com alerta revisadas'] },
      { title: 'Mapa de Movimentação', items: ['Contas sem movimento identificadas', 'Lacunas de período analisadas', 'Grupos com comportamento fora do padrão'] },
    ],
  },
  {
    name: 'DRE Analítica — Apresentação',
    emoji: '📈',
    color: 'emerald',
    sections: [
      { title: 'Preparação', items: ['Configurar layout DRE (grupos e subgrupos)', 'Selecionar período de análise', 'Definir base de comparação AH%'] },
      { title: 'Análise', items: ['Receita Líquida — variação e margem', 'EBITDA ajustado', 'Resultado antes e depois dos impostos'] },
      { title: 'Apresentação', items: ['Compartilhar relatório DRE em HTML', 'Destacar principais variações', 'Registrar observações nos pontos críticos'] },
    ],
  },
]

function makeCLSection(title: string, items: string[]) {
  return {
    id: crypto.randomUUID(),
    title,
    items: items.map((text) => ({ id: crypto.randomUUID(), text, checked: false, note: '', required: true, isPrereq: false })),
  }
}

export default function App() {
  const { user, signOut, isAdmin } = useAuth()
  const { toast } = useToast()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showAdminUsers, setShowAdminUsers] = useState(false)
  const [showRazaoAvancado, setShowRazaoAvancado] = useState(false)
  const [razaoAvancadoInitial, setRazaoAvancadoInitial] = useState<any>(null)
  // Preferências de visualização da tabela do Balancete Comparativo
  const { prefs: balancetePrefs, updatePrefs: updateBalancetePrefs } =
    useTablePreferences('balancete_comparativo')
  // Preferências de visualização da tabela da DRE
  const { prefs: drePrefs, updatePrefs: updateDrePrefs } =
    useTablePreferences('dre')

  // Alinhamento por coluna (persistido nas prefs)
  const setColAlign = (key: string, val: 'left' | 'center' | 'right') =>
    updateBalancetePrefs({
      alignments: { ...(balancetePrefs.alignments || {}), [key]: val },
    })
  const getColAlign = (key: string, fallback: 'left' | 'center' | 'right') =>
    (balancetePrefs.alignments?.[key] as 'left' | 'center' | 'right') || fallback
  // Alinhamento geral: aplica a todas as colunas da tabela de uma vez
  const setAllColAlign = (val: 'left' | 'center' | 'right') => {
    // Conta e Descrição ficam de fora do "geral": só alinham pelo menu da própria coluna.
    const a: Record<string, 'left' | 'center' | 'right'> = {
      ...(balancetePrefs.alignments || {}),
      acumulado: val,
      media: val,
    }
    periodsToDisplay.forEach((p: string) => {
      a[p] = val
      a[`${p}_av`] = val
      a[`${p}_avp2`] = val
      a[`${p}_ah`] = val
      a[`${p}_ahd`] = val
    })
    updateBalancetePrefs({ alignments: a })
  }

  // Ordenação por grupo (cada conta sintética pode ordenar seus filhos por uma coluna)
  const [balanceteSortConfigs, setBalanceteSortConfigs] = useState<
    Record<string, { key: string; direction: 'asc' | 'desc' }>
  >({})
  const handleBalanceteSort = (parentConta: string, key: string) => {
    setBalanceteSortConfigs((prev) => {
      const cur = prev[parentConta]
      if (cur?.key === key) {
        if (cur.direction === 'desc') return { ...prev, [parentConta]: { key, direction: 'asc' } }
        const next = { ...prev }
        delete next[parentConta]
        return next
      }
      return { ...prev, [parentConta]: { key, direction: 'desc' } }
    })
  }
  const [data, setData] = useState([])
  const [companyInfo, setCompanyInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filesCount, setFilesCount] = useState(0)
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)

  const [isStagingModalOpen, setIsStagingModalOpen] = useState(false)
  const [stagingPayload, setStagingPayload] = useState<{
    info: any
    extractedData: any[]
    extractedTx: any[]
    spedDiff?: any
  } | null>(null)

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)
  const [showAuditDetails, setShowAuditDetails] = useState(false)

  const [isAccumulated, setIsAccumulated] = useState(false)
  const [showAV, setShowAV] = useState(false)
  const [showAH, setShowAH] = useState(false)
  const [ocultarValores, setOcultarValores] = useState(false)
  const [soDivergencias, setSoDivergencias] = useState(false)
  const [ocultarDC, setOcultarDC] = useState(true)
  const [ocultarAlertas, setOcultarAlertas] = useState(false)
  const [showAhDelta, setShowAhDelta] = useState(false)
  const [soAusencias, setSoAusencias] = useState(false)
  const [soLacunas, setSoLacunas] = useState(false)
  const [showRecorrenciaConfig, setShowRecorrenciaConfig] = useState(false)
  const [recorrenciaSearch, setRecorrenciaSearch] = useState('')
  const [ausenciaDetalheConta, setAusenciaDetalheConta] = useState<string | null>(null)
  const [soAnaliticas, setSoAnaliticas] = useState(false)
  const [ausenciasPanelOculto, setAusenciasPanelOculto] = useState(false)
  const [ausenciasPanelPos, setAusenciasPanelPos] = useState<{ x: number; y: number } | null>(null)
  const ausenciasPanelRef = useRef<HTMLDivElement>(null)
  const startAusenciasDrag = useCallback((e: React.MouseEvent) => {
    // only left button
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const panel = ausenciasPanelRef.current
    if (!panel) return
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    const rect = panel.getBoundingClientRect()
    const initX = rect.left
    const initY = rect.top
    const startMX = e.clientX
    const startMY = e.clientY
    // float immediately at current position
    setAusenciasPanelPos({ x: initX, y: initY })
    const handleMove = (me: MouseEvent) => {
      me.preventDefault()
      setAusenciasPanelPos({ x: initX + (me.clientX - startMX), y: initY + (me.clientY - startMY) })
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [])

  // ─── Roteiros / Checklists ──────────────────────────────────────────────────
  // Leitura direta (getSavedState não está definida ainda neste ponto do body)
  const [checklists, setChecklists] = useState(() => {
    try { const s = localStorage.getItem('boardecd_config'); return s ? (JSON.parse(s).checklists ?? []) : [] } catch { return [] }
  })
  const [activeChecklistId, setActiveChecklistId] = useState(() => {
    try { const s = localStorage.getItem('boardecd_config'); return s ? (JSON.parse(s).activeChecklistId ?? null) : null } catch { return null }
  })
  const [showChecklistPanel, setShowChecklistPanel] = useState(false)
  const [showChecklistManager, setShowChecklistManager] = useState(false)
  const [checklistPanelPos, setChecklistPanelPos] = useState(null)
  const [checklistPanelMinimized, setChecklistPanelMinimized] = useState(false)
  const [clEditId, setClEditId] = useState(null)        // id do checklist sendo editado no manager
  const [clNewSectionTitle, setClNewSectionTitle] = useState('')
  const [clNewItemTexts, setClNewItemTexts] = useState({}) // { [sectionId]: string }
  const [clExpandedNotes, setClExpandedNotes] = useState({}) // { [itemId]: bool }
  const [clManagerTab, setClManagerTab] = useState('list') // 'list'|'edit'|'templates'
  const checklistPanelRef = useRef(null)

  const activeChecklist = checklists.find((c) => c.id === activeChecklistId) || checklists[0] || null

  const clStats = (cl) => {
    if (!cl) return { total: 0, done: 0, pct: 0 }
    const total = cl.sections.reduce((a, s) => a + s.items.length, 0)
    const done = cl.sections.reduce((a, s) => a + s.items.filter((i) => i.checked).length, 0)
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
  }

  const pendingChecklistCount = (() => {
    const cl = activeChecklist
    if (!cl || !showChecklistPanel) return 0
    return cl.sections.reduce((a, s) => a + s.items.filter((i) => !i.checked).length, 0)
  })()

  const toggleCheckItem = (clId, secId, itemId) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id !== clId ? cl : {
          ...cl,
          sections: cl.sections.map((s) =>
            s.id !== secId ? s : {
              ...s,
              items: s.items.map((it) => it.id !== itemId ? it : { ...it, checked: !it.checked }),
            }
          ),
        }
      )
    )
  }

  const setCheckItemNote = (clId, secId, itemId, note) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id !== clId ? cl : {
          ...cl,
          sections: cl.sections.map((s) =>
            s.id !== secId ? s : {
              ...s,
              items: s.items.map((it) => it.id !== itemId ? it : { ...it, note }),
            }
          ),
        }
      )
    )
  }

  const resetChecklist = (clId) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id !== clId ? cl : {
          ...cl,
          lastReset: new Date().toLocaleDateString('pt-BR'),
          sections: cl.sections.map((s) => ({
            ...s, items: s.items.map((it) => ({ ...it, checked: false })),
          })),
        }
      )
    )
  }

  const createChecklist = (name, emoji, color, fromTemplate = null) => {
    const sections = fromTemplate
      ? fromTemplate.sections.map((s) => makeCLSection(s.title, s.items))
      : [makeCLSection('Seção 1', [])]
    const id = crypto.randomUUID()
    const novo = { id, name: name || fromTemplate?.name || 'Novo Roteiro', emoji: emoji || fromTemplate?.emoji || '📋', color: color || fromTemplate?.color || 'indigo', sections, createdAt: new Date().toLocaleDateString('pt-BR') }
    setChecklists((prev) => [...prev, novo])
    setActiveChecklistId(id)
    return id
  }

  const deleteChecklist = (clId) => {
    setChecklists((prev) => prev.filter((c) => c.id !== clId))
    if (activeChecklistId === clId) setActiveChecklistId(checklists.find((c) => c.id !== clId)?.id || null)
    if (clEditId === clId) setClEditId(null)
  }

  const updateCL = (clId, updates) => {
    setChecklists((prev) => prev.map((c) => c.id !== clId ? c : { ...c, ...updates }))
  }

  const addCLSection = (clId, title) => {
    if (!title.trim()) return
    const sec = makeCLSection(title.trim(), [])
    setChecklists((prev) => prev.map((c) => c.id !== clId ? c : { ...c, sections: [...c.sections, sec] }))
    setClNewSectionTitle('')
  }

  const deleteCLSection = (clId, secId) => {
    setChecklists((prev) =>
      prev.map((c) => c.id !== clId ? c : { ...c, sections: c.sections.filter((s) => s.id !== secId) })
    )
  }

  const addCLItem = (clId, secId, text) => {
    if (!text.trim()) return
    const item = { id: crypto.randomUUID(), text: text.trim(), checked: false, note: '', required: true, isPrereq: false }
    setChecklists((prev) =>
      prev.map((c) =>
        c.id !== clId ? c : {
          ...c,
          sections: c.sections.map((s) =>
            s.id !== secId ? s : { ...s, items: [...s.items, item] }
          ),
        }
      )
    )
    setClNewItemTexts((prev) => ({ ...prev, [secId]: '' }))
  }

  const updateCLItemProp = (clId, secId, itemId, prop, value) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id !== clId ? c : {
          ...c,
          sections: c.sections.map((s) =>
            s.id !== secId ? s : {
              ...s, items: s.items.map((it) => it.id !== itemId ? it : { ...it, [prop]: value }),
            }
          ),
        }
      )
    )
  }

  const deleteCLItem = (clId, secId, itemId) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id !== clId ? c : {
          ...c,
          sections: c.sections.map((s) =>
            s.id !== secId ? s : { ...s, items: s.items.filter((it) => it.id !== itemId) }
          ),
        }
      )
    )
  }

  const moveCLItem = (clId, secId, itemId, dir) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id !== clId ? c : {
          ...c,
          sections: c.sections.map((s) => {
            if (s.id !== secId) return s
            const idx = s.items.findIndex((it) => it.id === itemId)
            const newIdx = idx + dir
            if (newIdx < 0 || newIdx >= s.items.length) return s
            const items = [...s.items]
            ;[items[idx], items[newIdx]] = [items[newIdx], items[idx]]
            return { ...s, items }
          }),
        }
      )
    )
  }

  // DnD de itens no editor (intra e inter-seção)
  const [clDragItem, setClDragItem] = useState(null)   // { clId, secId, itemId }
  const [clDragTarget, setClDragTarget] = useState(null) // { secId, insertAfterItemId: string|null }

  const moveItemDnD = (clId, srcSecId, srcItemId, dstSecId, insertAfterItemId) => {
    if (srcSecId === dstSecId && srcItemId === insertAfterItemId) return
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== clId) return c
        let draggedItem = null
        const afterRemove = c.sections.map((s) => {
          if (s.id !== srcSecId) return s
          const items = s.items.filter((it) => { if (it.id === srcItemId) { draggedItem = it; return false } return true })
          return { ...s, items }
        })
        if (!draggedItem) return c
        const afterInsert = afterRemove.map((s) => {
          if (s.id !== dstSecId) return s
          if (insertAfterItemId === null) return { ...s, items: [draggedItem, ...s.items] }
          const idx = s.items.findIndex((it) => it.id === insertAfterItemId)
          const items = [...s.items]
          items.splice(idx === -1 ? items.length : idx + 1, 0, draggedItem)
          return { ...s, items }
        })
        return { ...c, sections: afterInsert }
      })
    )
  }

  const startChecklistDrag = useCallback((e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const panel = checklistPanelRef.current
    if (!panel) return
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    const rect = panel.getBoundingClientRect()
    const initX = rect.left, initY = rect.top
    const startMX = e.clientX, startMY = e.clientY
    setChecklistPanelPos({ x: initX, y: initY })
    const handleMove = (me) => {
      me.preventDefault()
      setChecklistPanelPos({ x: initX + (me.clientX - startMX), y: initY + (me.clientY - startMY) })
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [])

  const CL_COLOR_MAP = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-600', bar: 'bg-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700 text-white', ring: 'ring-indigo-400', dot: 'bg-indigo-500' },
    rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-600',   bar: 'bg-rose-500',   btn: 'bg-rose-600 hover:bg-rose-700 text-white',   ring: 'ring-rose-400',   dot: 'bg-rose-500' },
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-500',  bar: 'bg-amber-400',  btn: 'bg-amber-500 hover:bg-amber-600 text-white',  ring: 'ring-amber-400',  dot: 'bg-amber-400' },
    emerald:{ bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',badge: 'bg-emerald-600',bar: 'bg-emerald-500',btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',ring: 'ring-emerald-400',dot: 'bg-emerald-500' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-600', bar: 'bg-violet-500', btn: 'bg-violet-600 hover:bg-violet-700 text-white', ring: 'ring-violet-400', dot: 'bg-violet-500' },
    sky:    { bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    badge: 'bg-sky-600',    bar: 'bg-sky-500',    btn: 'bg-sky-600 hover:bg-sky-700 text-white',    ring: 'ring-sky-400',    dot: 'bg-sky-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500', bar: 'bg-orange-400', btn: 'bg-orange-500 hover:bg-orange-600 text-white', ring: 'ring-orange-400', dot: 'bg-orange-400' },
  }

  // Com AV%/AH% visível, oculta as colunas de valor (Saldo, Acumulado, Média),
  // deixando literalmente só os índices. Sem índice, apenas mascara os valores.
  const soIndices = ocultarValores && (showAV || showAH)

  const [selectedMonthlyPeriods, setSelectedMonthlyPeriods] = useState<string[]>([])
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false)

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

          // Load from Supabase
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

            const newCompanyInfo = (company as any).raw_sped_info || {
              cnpj: company.cnpj,
              nome: company.name,
            }
            setCompanyInfo(newCompanyInfo as any)
            setData(reconstructedData as any)

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
              if (conf.viewPresets) setViewPresets(conf.viewPresets)
              if (conf.recorrentes) setRecorrentes(conf.recorrentes)
              if (conf.recorrenciaPresets) setRecorrenciaPresets(conf.recorrenciaPresets)
            }
          }
        }
        setIsConfigLoaded(true)
      } catch (err) {
        console.error('Erro ao carregar dados da nuvem', err)
        setIsConfigLoaded(true)
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
  const [dreSelectedPeriods, setDreSelectedPeriods] = useState<string[]>([])
  const [drePeriodsNone, setDrePeriodsNone] = useState(false)
  const [dreIsAccumulated, setDreIsAccumulated] = useState(false)
  const [dreAccumulateYear, setDreAccumulateYear] = useState<string | null>(null)
  const [drePeriodPopover, setDrePeriodPopover] = useState(false)
  const setAllDreColAlign = (val: 'left' | 'center' | 'right') =>
    updateDrePrefs({ alignments: { ...(drePrefs.alignments || {}), value: val } })
  const dreValAlign = (drePrefs.alignments?.value as 'left' | 'center' | 'right') || 'right'
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

  const [viewPresets, setViewPresets] = useState<any[]>(() => getSavedState('viewPresets', []))

  // Contas marcadas como "recorrência mensal" (devem ter movimento todo mês).
  const [recorrentes, setRecorrentes] = useState<string[]>(() => getSavedState('recorrentes', []))
  const recorrentesSet = useMemo(() => new Set(recorrentes), [recorrentes])
  const toggleRecorrente = (conta: string) =>
    setRecorrentes((prev: string[]) =>
      prev.includes(conta) ? prev.filter((c) => c !== conta) : [...prev, conta],
    )

  const [recorrenciaPresets, setRecorrenciaPresets] = useState<
    Array<{ id: string; nome: string; contas: string[] }>
  >(() => getSavedState('recorrenciaPresets', []))
  const [showSavePresetModal, setShowSavePresetModal] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [recorrenciaTabAtivo, setRecorrenciaTabAtivo] = useState<'editar' | 'presets'>('editar')

  const saveRecorrenciaPreset = (nome: string) => {
    if (!nome.trim()) return
    const id = crypto.randomUUID()
    const novoPreset = { id, nome: nome.trim(), contas: [...recorrentes] }
    setRecorrenciaPresets((prev) => [...prev, novoPreset])
    setPresetName('')
    setShowSavePresetModal(false)
  }

  const loadRecorrenciaPreset = (id: string) => {
    const preset = recorrenciaPresets.find((p) => p.id === id)
    if (preset) {
      setRecorrentes(preset.contas)
    }
  }

  const deleteRecorrenciaPreset = (id: string) => {
    const updated = recorrenciaPresets.filter((p) => p.id !== id)
    setRecorrenciaPresets(updated)
  }

  const [analysisProfiles, setAnalysisProfiles] = useState<AnalysisProfile[]>(() =>
    getSavedState('analysisProfiles', [
      {
        id: 'default',
        name: 'Padrão (Receita/Ativo)',
        globalAvMode: 'default',
        globalAhMode: 'previous',
        customAvBases: {},
      },
    ]),
  )
  const [activeProfileId, setActiveProfileId] = useState<string>(() =>
    getSavedState('activeProfileId', 'default'),
  )
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [isCustomBaseModalOpen, setIsCustomBaseModalOpen] = useState(false)
  const [customBaseTargetAcc, setCustomBaseTargetAcc] = useState<string | null>(null)
  const [customBaseSearch, setCustomBaseSearch] = useState('')

  const [isCustomMultiBaseModalOpen, setIsCustomMultiBaseModalOpen] = useState(false)
  const [customMultiBaseTargetAcc, setCustomMultiBaseTargetAcc] = useState<string | null>(null)
  const [customMultiBaseSearch, setCustomMultiBaseSearch] = useState('')
  const [customMultiBaseSelection, setCustomMultiBaseSelection] = useState<string[]>([])

  // Estados para o formulário de nova regra de alerta por conta/grupo
  const [ruleSearch, setRuleSearch] = useState('')
  const [ruleAccts, setRuleAccts] = useState<any[]>([])
  const [ruleAvOp, setRuleAvOp] = useState('none')
  const [ruleAvV1, setRuleAvV1] = useState('')
  const [ruleAvV2, setRuleAvV2] = useState('')
  const [ruleAhOp, setRuleAhOp] = useState('none')
  const [ruleAhV1, setRuleAhV1] = useState('')
  const [ruleAhV2, setRuleAhV2] = useState('')

  const [ruleTreeExpanded, setRuleTreeExpanded] = useState<Set<string>>(new Set())
  const [ruleEditId, setRuleEditId] = useState<string | null>(null)
  const resetRuleForm = () => { setRuleSearch(''); setRuleAccts([]); setRuleAvOp('none'); setRuleAvV1(''); setRuleAvV2(''); setRuleAhOp('none'); setRuleAhV1(''); setRuleAhV2(''); setRuleEditId(null) }

  const [selectedMonthlyAccounts, setSelectedMonthlyAccounts] = useState<string[]>([])
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [isAccountFilterOpen, setIsAccountFilterOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [accountFilterSearch, setAccountFilterSearch] = useState('')

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
  const [razaoDateFrom, setRazaoDateFrom] = useState('')
  const [razaoDateTo, setRazaoDateTo] = useState('')
  const [razaoValueMin, setRazaoValueMin] = useState('')
  const [razaoValueMax, setRazaoValueMax] = useState('')
  const [razaoIndDc, setRazaoIndDc] = useState('ALL')
  const [showRazaoFilters, setShowRazaoFilters] = useState(false)
  const [razaoSortConfig, setRazaoSortConfig] = useState<{
    key: 'data' | 'valor' | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const [selectedExpenseTrend, setSelectedExpenseTrend] = useState<any>(null)

  const [isComparingProfiles, setIsComparingProfiles] = useState(false)
  const [compareProfileId, setCompareProfileId] = useState<string>('')
  const [explodedAvContext, setExplodedAvContext] = useState<any>(null)

  const clearRazaoFilters = () => {
    setRazaoSearch('')
    setRazaoDateFrom('')
    setRazaoDateTo('')
    setRazaoValueMin('')
    setRazaoValueMax('')
    setRazaoIndDc('ALL')
    setRazaoSortConfig({ key: null, direction: 'asc' })
  }

  const openRazao = async (acc: any) => {
    if (acc.tipo === 'S') return
    setSelectedAccountForRazao(acc)
    setIsLoadingRazao(true)
    clearRazaoFilters()
    setRazaoTransactions([])

    try {
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
            let query = supabase
              .from('transactions')
              .select('*')
              .eq('company_id', companies.id)
              .eq('account_id', accounts.id)

            if (selectedMonthlyPeriods.length > 0) {
              let minMs = Infinity
              let maxMs = -Infinity
              let minDate = null
              let maxDate = null

              selectedMonthlyPeriods.forEach((p) => {
                const parts = p.split(' a ')
                if (parts.length === 2) {
                  const [d1, m1, y1] = parts[0].split('/')
                  const [d2, m2, y2] = parts[1].split('/')

                  const ms1 = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1)).getTime()
                  const ms2 = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2)).getTime()

                  if (ms1 < minMs) {
                    minMs = ms1
                    minDate = `${y1}-${m1}-${d1}`
                  }
                  if (ms2 > maxMs) {
                    maxMs = ms2
                    maxDate = `${y2}-${m2}-${d2}`
                  }
                }
              })

              if (minDate) query = query.gte('date', minDate)
              if (maxDate) query = query.lte('date', maxDate)
            }

            const { data: txs } = await query.order('date', { ascending: false }).limit(2000)

            if (txs) {
              const uniqueTxs: any[] = []
              const seen = new Set()

              txs.forEach((t) => {
                const key = `${t.date}_${t.amount}_${t.indicator}_${t.history}`
                if (!seen.has(key)) {
                  seen.add(key)
                  uniqueTxs.push({
                    data: t.date ? t.date.split('-').reverse().join('/') : '',
                    valor: Number(t.amount || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                    indDc: t.indicator,
                    historico: t.history,
                  })
                }
              })
              setRazaoTransactions(uniqueTxs)
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
    let result = razaoTransactions

    if (razaoSearch) {
      const lower = razaoSearch.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.historico.toLowerCase().includes(lower) ||
          tx.valor.toString().includes(lower) ||
          tx.data.includes(lower),
      )
    }

    if (razaoDateFrom || razaoDateTo) {
      const fromMs = razaoDateFrom ? new Date(`${razaoDateFrom}T00:00:00`).getTime() : 0
      const toMs = razaoDateTo ? new Date(`${razaoDateTo}T23:59:59`).getTime() : Infinity
      result = result.filter((tx) => {
        if (!tx.data) return false
        const [d, m, y] = tx.data.split('/')
        const txMs = new Date(`${y}-${m}-${d}T12:00:00`).getTime()
        return txMs >= fromMs && txMs <= toMs
      })
    }

    if (razaoValueMin || razaoValueMax) {
      const min = razaoValueMin ? parseFloat(razaoValueMin) : 0
      const max = razaoValueMax ? parseFloat(razaoValueMax) : Infinity
      result = result.filter((tx) => {
        const val = parseFloat(tx.valor.replace(/\./g, '').replace(',', '.')) || 0
        return val >= min && val <= max
      })
    }

    if (razaoIndDc !== 'ALL') {
      result = result.filter((tx) => tx.indDc === razaoIndDc)
    }

    return result
  }, [
    razaoTransactions,
    razaoSearch,
    razaoDateFrom,
    razaoDateTo,
    razaoValueMin,
    razaoValueMax,
    razaoIndDc,
  ])

  const sortedRazaoTransactions = useMemo(() => {
    let sortableItems = [...filteredRazaoTransactions]
    if (razaoSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (razaoSortConfig.key === 'data') {
          const parseDate = (str: string) => {
            if (!str) return 0
            const [d, m, y] = str.split('/')
            return new Date(`${y}-${m}-${d}T12:00:00`).getTime()
          }
          const dateA = parseDate(a.data)
          const dateB = parseDate(b.data)
          if (dateA < dateB) return razaoSortConfig.direction === 'asc' ? -1 : 1
          if (dateA > dateB) return razaoSortConfig.direction === 'asc' ? 1 : -1
          return 0
        }
        if (razaoSortConfig.key === 'valor') {
          const parseVal = (str: string) =>
            parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0
          const valA = parseVal(a.valor)
          const valB = parseVal(b.valor)
          if (valA < valB) return razaoSortConfig.direction === 'asc' ? -1 : 1
          if (valA > valB) return razaoSortConfig.direction === 'asc' ? 1 : -1
          return 0
        }
        return 0
      })
    }
    return sortableItems
  }, [filteredRazaoTransactions, razaoSortConfig])

  const handleSortRazao = (key: 'data' | 'valor') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (razaoSortConfig.key === key && razaoSortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setRazaoSortConfig({ key, direction })
  }

  // Totais do razão (sobre os lançamentos já filtrados)
  const razaoTotals = useMemo(() => {
    const parseV = (s: any) => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0
    let d = 0
    let c = 0
    filteredRazaoTransactions.forEach((t) => {
      if (t.indDc === 'D') d += parseV(t.valor)
      else if (t.indDc === 'C') c += parseV(t.valor)
    })
    return { d, c, saldo: d - c, count: filteredRazaoTransactions.length }
  }, [filteredRazaoTransactions])

  // Abre o razão atual (já filtrado/ordenado) como uma página HTML autônoma em nova aba
  // Envia o razão simplificado (conta + filtros atuais) para o Razão Avançado
  const enviarParaRazaoAvancado = () => {
    const acc = selectedAccountForRazao
    if (!acc) return
    let df = razaoDateFrom
    let dt = razaoDateTo
    if (!df || !dt) {
      let minMs = Infinity
      let maxMs = -Infinity
      let minDate = ''
      let maxDate = ''
      selectedMonthlyPeriods.forEach((p: string) => {
        const parts = p.split(' a ')
        if (parts.length === 2) {
          const [d1, m1, y1] = parts[0].split('/')
          const [d2, m2, y2] = parts[1].split('/')
          const ms1 = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1)).getTime()
          const ms2 = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2)).getTime()
          if (ms1 < minMs) {
            minMs = ms1
            minDate = `${y1}-${m1}-${d1}`
          }
          if (ms2 > maxMs) {
            maxMs = ms2
            maxDate = `${y2}-${m2}-${d2}`
          }
        }
      })
      if (!df) df = minDate
      if (!dt) dt = maxDate
    }
    setRazaoAvancadoInitial({
      contas: [acc.conta],
      dateFrom: df || '',
      dateTo: dt || '',
      valMin: razaoValueMin || '',
      valMax: razaoValueMax || '',
      indDc: razaoIndDc || 'ALL',
    })
    setSelectedAccountForRazao(null)
    setShowRazaoAvancado(true)
  }

  const openRazaoAsPage = () => {
    const acc = selectedAccountForRazao
    if (!acc) return
    const rows = sortedRazaoTransactions
    const parseV = (s: any) => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0
    const esc = (s: any) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    const totD = rows.filter((t) => t.indDc === 'D').reduce((a, t) => a + parseV(t.valor), 0)
    const totC = rows.filter((t) => t.indDc === 'C').reduce((a, t) => a + parseV(t.valor), 0)
    const saldo = totD - totC
    const saldoInd = saldo >= 0 ? 'D' : 'C'

    const filtros: string[] = []
    if (razaoSearch) filtros.push(`Histórico contém "${esc(razaoSearch)}"`)
    if (razaoDateFrom || razaoDateTo)
      filtros.push(`Data ${razaoDateFrom || '…'} a ${razaoDateTo || '…'}`)
    if (razaoValueMin || razaoValueMax)
      filtros.push(`Valor ${razaoValueMin || '0'} a ${razaoValueMax || '∞'}`)
    if (razaoIndDc !== 'ALL') filtros.push(`Apenas ${razaoIndDc === 'D' ? 'Débitos' : 'Créditos'}`)

    const rowsHtml = rows.length
      ? rows
          .map(
            (t) => `<tr>
          <td class="mono">${esc(t.data)}</td>
          <td>${esc(t.historico)}</td>
          <td class="num ${t.indDc === 'D' ? 'd' : 'c'}">R$ ${esc(t.valor)}</td>
          <td class="ind ${t.indDc === 'D' ? 'd' : 'c'}">${esc(t.indDc)}</td>
        </tr>`,
          )
          .join('')
      : `<tr><td colspan="4" class="empty">Nenhum lançamento.</td></tr>`

    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Razão • ${esc(acc.conta)} ${esc(acc.nome)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:#f1f5f9;color:#0f172a}
  .wrap{max-width:1100px;margin:0 auto;padding:24px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
  .brand{font-weight:900;font-size:20px;letter-spacing:-.02em}
  .brand span{color:#4f46e5}
  .btn{background:#0f172a;color:#fff;border:0;padding:10px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,.04)}
  h1{font-size:24px;margin:0 0 4px}
  .sub{color:#64748b;font-size:14px;margin:0 0 4px}
  .meta{color:#94a3b8;font-size:12px;margin-top:8px}
  .chip{display:inline-block;background:#eef2ff;color:#4338ca;border:1px solid #e0e7ff;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;margin:2px 4px 2px 0}
  .tots{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}
  .tot{border:1px solid #e2e8f0;border-radius:12px;padding:14px}
  .tot .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:800}
  .tot .val{font-size:18px;font-weight:900;margin-top:4px}
  .d{color:#2563eb}.c{color:#e11d48}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
  thead th{text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:#64748b;border-bottom:2px solid #e2e8f0;padding:10px 8px}
  thead th.num,thead th.ind{text-align:right}
  tbody td{padding:9px 8px;border-bottom:1px solid #f1f5f9}
  tbody tr:nth-child(even){background:#f8fafc}
  .mono{font-family:ui-monospace,Menlo,Consolas,monospace;color:#475569;font-size:12px}
  .num{text-align:right;font-weight:700;white-space:nowrap}
  .ind{text-align:right;font-weight:700;width:36px}
  .empty{text-align:center;color:#94a3b8;padding:40px}
  @media print{body{background:#fff}.btn{display:none}.card{box-shadow:none;border:0}.wrap{max-width:none;padding:0}}
</style></head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="brand">Board<span>ECD</span> — Razão Contábil</div>
      <button class="btn" onclick="window.print()">Imprimir / Salvar PDF</button>
    </div>
    <div class="card">
      <h1>${esc(acc.conta)} — ${esc(acc.nome)}</h1>
      <p class="sub">${esc(companyInfo?.nome || '')}${companyInfo?.cnpj ? ' • CNPJ ' + esc(companyInfo.cnpj) : ''}</p>
      <p class="sub">Perspectiva: <strong>${isAccumulated ? 'Acumulado Mensal' : 'Mensal Isolado'}</strong> • ${rows.length} lançamento(s)</p>
      ${filtros.length ? `<div class="meta">Filtros: ${filtros.map((f) => `<span class="chip">${f}</span>`).join('')}</div>` : ''}
      <div class="meta">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
      <div class="tots">
        <div class="tot"><div class="lbl">Total Débitos</div><div class="val d">${fmtBRL(totD)}</div></div>
        <div class="tot"><div class="lbl">Total Créditos</div><div class="val c">${fmtBRL(totC)}</div></div>
        <div class="tot"><div class="lbl">Saldo</div><div class="val ${saldoInd === 'D' ? 'd' : 'c'}">${fmtBRL(Math.abs(saldo))} ${saldoInd}</div></div>
        <div class="tot"><div class="lbl">Lançamentos</div><div class="val">${rows.length}</div></div>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Histórico</th><th class="num">Valor</th><th class="ind">D/C</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  </div>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      toast({
        variant: 'destructive',
        title: 'Pop-up bloqueado',
        description: 'Permita pop-ups deste site para abrir o razão como página.',
      })
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  const openAusenciasAsPage = (items: any[]) => {
    const esc = (s: any) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    const periods = periodsToDisplay
    const theadPeriods = periods.map((p: string) => `<th class="per">${esc(periodLabel(p))}</th>`).join('')

    const rowsHtml = items
      .map((item) => {
        const mesSet = new Set(item.meses)
        const periodCells = periods
          .map((p: string) =>
            mesSet.has(p)
              ? `<td class="cel aus" title="${esc(periodLabel(p))} — sem movimento">✗</td>`
              : `<td class="cel ok" title="${esc(periodLabel(p))} — com movimento">✓</td>`
          )
          .join('')
        return `
          <tr>
            <td class="mono">${esc(item.conta)}</td>
            <td>${esc(item.nome)}</td>
            ${periodCells}
            <td class="num bad">${item.meses.length}</td>
          </tr>`
      })
      .join('')

    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Ausências de Recorrência — BoardECD</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#0d1117;--bg2:#161b22;--bg3:#21262d;--border:#30363d;--text:#e6edf3;--text2:#8b949e;--rose:#f87171;--rose-bg:rgba(248,113,113,.12);--rose-border:rgba(248,113,113,.3);--amber:#d29922;--amber-bg:rgba(210,153,34,.1);--amber-border:rgba(210,153,34,.3)}
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
  .wrap{max-width:100%;margin:0 auto;padding:24px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;border-bottom:1px solid var(--border);padding-bottom:16px;flex-wrap:wrap}
  .brand{font-weight:900;font-size:20px;letter-spacing:-.03em}
  .brand em{color:var(--rose);font-style:normal}
  .brand small{font-size:12px;font-weight:500;color:var(--text2);margin-left:8px;letter-spacing:.05em;text-transform:uppercase}
  .print-btn{background:var(--bg3);color:var(--text);border:1px solid var(--border);padding:8px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}
  .print-btn:hover{border-color:var(--rose)}
  .meta{margin-bottom:20px}
  .meta h1{font-size:22px;font-weight:800;margin-bottom:4px}
  .meta p{font-size:13px;color:var(--text2);margin-top:3px}
  .summary{display:flex;gap:12px;margin:20px 0;flex-wrap:wrap}
  .sum-card{flex:1;min-width:130px;border:1px solid var(--rose-border);border-radius:12px;padding:14px 16px;background:var(--rose-bg)}
  .sum-card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--text2);font-weight:700}
  .sum-card .val{font-size:26px;font-weight:900;color:var(--rose);margin-top:6px}
  .tbl-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:10px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text2);border-bottom:1px solid var(--border);padding:10px 10px;font-weight:700;background:var(--bg2);position:sticky;top:0;white-space:nowrap}
  thead th.num{text-align:right}
  thead th.per{text-align:center;min-width:60px}
  tbody tr{border-bottom:1px solid var(--border)}
  tbody tr:hover{background:var(--bg3)}
  tbody td{padding:9px 10px;color:var(--text)}
  .mono{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--text2);font-size:12px}
  .num{text-align:right;font-weight:700}
  .bad{color:var(--rose);font-weight:800}
  .cel{text-align:center;font-weight:800;font-size:14px}
  .ok{color:#3fb950}
  .aus{color:var(--amber)}
  @media print{
    :root{--bg:#fff;--bg2:#f8fafc;--bg3:#f1f5f9;--border:#e2e8f0;--text:#0f172a;--text2:#64748b;--rose:#e11d48;--rose-bg:#fff1f2;--rose-border:#fecdd3;--amber:#d97706}
    .print-btn{display:none}.wrap{max-width:none;padding:0}.tbl-wrap{border:none}
    thead th{position:static}
  }
</style></head>
<body>
<div class="wrap">
  <div class="topbar">
    <div class="brand">Board<em>ECD</em> <small>Ausências de Recorrência</small></div>
    <button class="print-btn" onclick="window.print()">⎙ Imprimir / Salvar PDF</button>
  </div>
  <div class="meta">
    <h1>⚠ Ausências de Movimentação</h1>
    <p>${esc(companyInfo?.nome || 'Empresa')}${companyInfo?.cnpj ? ' · CNPJ ' + esc(companyInfo.cnpj) : ''}</p>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
  <div class="summary">
    <div class="sum-card"><div class="lbl">Contas recorrentes</div><div class="val">${recorrentes.length}</div></div>
    <div class="sum-card"><div class="lbl">Contas com ausências</div><div class="val">${items.length}</div></div>
    <div class="sum-card"><div class="lbl">Total de meses ausentes</div><div class="val">${items.reduce((s: number, i: any) => s + i.meses.length, 0)}</div></div>
  </div>
  <div class="tbl-wrap">
    <table>
      <thead><tr><th>Conta</th><th>Descrição</th>${theadPeriods}<th class="num">Ausências</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
</div>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      toast({ variant: 'destructive', title: 'Pop-up bloqueado', description: 'Permita pop-ups deste site para abrir o relatório.' })
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  const openMapaMovimentoAsPage = () => {
    const esc = (s: any) =>
      String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;')

    const periods = periodsToDisplay
    const allContas = (monthlyData.allAccounts || [])

    // Pré-calcula movimento por conta/período
    const contaInfo = allContas.map((acc: any) => {
      const isSin = acc.tipo === 'S'
      const nivel = parseInt(acc.nivel) || 1
      const periodos = periods.map((p: string) => {
        if (isSin) return null
        const sld = acc.saldos?.[p]
        return !sld || (getRawNumber(sld.debito) === 0 && getRawNumber(sld.credito) === 0) ? 'aus' : 'ok'
      })
      const lacunas = periodos.filter((x: any) => x === 'aus').length
      return { ...acc, nivel, isSin, periodos, lacunas }
    })

    // Calcula lacunas por grupo (sintéticas) a partir das analíticas
    const lacunasPorGrupo: Record<string, number> = {}
    const analiticas = contaInfo.filter((a: any) => !a.isSin && a.lacunas > 0)
    allContas.forEach((acc: any) => {
      if (acc.tipo !== 'S') return
      const filhas = analiticas.filter((a: any) => {
        let p = accountParentMap[a.conta]
        while (p) { if (p === acc.conta) return true; p = accountParentMap[p] }
        return false
      })
      lacunasPorGrupo[acc.conta] = filhas.length
    })

    const totalAnaliticas = contaInfo.filter((a: any) => !a.isSin).length
    const comAus = contaInfo.filter((a: any) => !a.isSin && a.lacunas > 0).length
    const maxNivel = Math.max(...contaInfo.map((a: any) => a.nivel), 1)

    const theadCols = periods.map((p: string) => `<th class="per">${esc(periodLabel(p))}</th>`).join('')

    const rowsHtml = contaInfo.map((acc: any) => {
      const indent = (acc.nivel - 1) * 18
      const contaEsc = esc(acc.conta)
      const pai = esc(accountParentMap[acc.conta] || '')

      let cells = ''
      if (acc.isSin) {
        const nLac = lacunasPorGrupo[acc.conta] || 0
        cells = periods.map(() => `<td class="cel sin-cel">—</td>`).join('')
        const lacBadge = nLac > 0
          ? `<span class="lac-badge">${nLac} com lacuna</span>`
          : ''
        return `<tr class="tr-sin" data-id="${contaEsc}" data-pai="${pai}" data-nivel="${acc.nivel}" data-type="S" data-lacunas="${nLac}">
          <td class="mono sin-td" style="padding-left:${indent + 4}px">
            <input type="checkbox" class="grp-chk" data-grp-id="${contaEsc}" onchange="toggleGrupo('${contaEsc}',this.checked)" checked title="Marcar para expandir / desmarcar para recolher">
            ${contaEsc}
          </td>
          <td class="nome sin-nome">${esc(acc.nome)} ${lacBadge}</td>
          ${cells}
          <td class="num grc">${nLac > 0 ? nLac : '—'}</td>
        </tr>`
      }

      cells = acc.periodos.map((st: any) =>
        st === 'aus' ? `<td class="cel aus">✗</td>` : `<td class="cel ok">✓</td>`
      ).join('')
      const rowClass = acc.lacunas > 0 ? 'tr-aus' : ''
      return `<tr class="${rowClass}" data-id="${contaEsc}" data-pai="${pai}" data-nivel="${acc.nivel}" data-type="A" data-lacunas="${acc.lacunas}">
        <td class="mono" style="padding-left:${indent + 22}px">${contaEsc}</td>
        <td class="nome">${esc(acc.nome)}</td>
        ${cells}
        <td class="num ${acc.lacunas > 0 ? 'bad' : 'good'}">${acc.lacunas > 0 ? acc.lacunas : '—'}</td>
      </tr>`
    }).join('')

    const levelBtns = Array.from({ length: maxNivel }, (_, i) => i + 1)
      .map((n) => `<button class="lbtn" onclick="expandNivel(${n})">N${n}</button>`)
      .join('')

    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Mapa de Movimentação — BoardECD</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0d1117;--bg2:#161b22;--bg3:#21262d;--border:#30363d;
    --text:#e6edf3;--text2:#8b949e;--text3:#58a6ff;
    --green:#3fb950;--green-bg:rgba(63,185,80,.12);--green-border:rgba(63,185,80,.3);
    --amber:#d29922;--amber-bg:rgba(210,153,34,.12);--amber-border:rgba(210,153,34,.3);
    --indigo:#818cf8;--indigo-bg:rgba(129,140,248,.1);--indigo-border:rgba(129,140,248,.25);
  }
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
  .wrap{max-width:100%;padding:24px}
  /* topbar */
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:16px}
  .brand{font-weight:900;font-size:20px;letter-spacing:-.03em;color:var(--text)}
  .brand em{color:var(--amber);font-style:normal}
  .brand small{font-size:12px;font-weight:500;color:var(--text2);margin-left:8px;letter-spacing:.05em;text-transform:uppercase}
  .print-btn{background:var(--bg3);color:var(--text);border:1px solid var(--border);padding:8px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;transition:border-color .2s}
  .print-btn:hover{border-color:var(--indigo)}
  /* meta */
  .meta{margin-bottom:20px}
  .meta h1{font-size:22px;font-weight:800;color:var(--text);margin-bottom:4px}
  .meta p{font-size:13px;color:var(--text2);margin-top:3px}
  /* cards */
  .summary{display:flex;gap:12px;margin:20px 0;flex-wrap:wrap}
  .sum-card{flex:1;min-width:130px;border:1px solid var(--border);border-radius:12px;padding:14px 16px;background:var(--bg2)}
  .sum-card.warn{border-color:var(--amber-border);background:var(--amber-bg)}
  .sum-card.ok{border-color:var(--green-border);background:var(--green-bg)}
  .sum-card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--text2);font-weight:700}
  .sum-card .val{font-size:26px;font-weight:900;margin-top:6px;color:var(--text)}
  .sum-card.warn .val{color:var(--amber)}
  .sum-card.ok .val{color:var(--green)}
  /* controls */
  .controls{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px}
  .ctrl-sep{width:1px;height:20px;background:var(--border);margin:0 4px}
  .ctrl-lbl{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
  .lbtn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;color:var(--text2);transition:all .15s}
  .lbtn:hover,.lbtn.act{background:var(--indigo-bg);border-color:var(--indigo);color:var(--indigo)}
  .fbtn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;color:var(--text2);transition:all .15s}
  .fbtn:hover{border-color:var(--border)}
  .fbtn.fok.act{background:var(--green-bg);border-color:var(--green-border);color:var(--green)}
  .fbtn.faus.act{background:var(--amber-bg);border-color:var(--amber-border);color:var(--amber)}
  .fbtn.fall.act{background:var(--indigo-bg);border-color:var(--indigo-border);color:var(--indigo)}
  /* table */
  .tbl-wrap{overflow-x:auto;max-height:calc(100vh - 320px);overflow-y:auto;border:1px solid var(--border);border-radius:10px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--text2);border-bottom:1px solid var(--border);padding:10px 8px;font-weight:700;position:sticky;top:0;background:var(--bg2);z-index:2;white-space:nowrap}
  thead th.per{text-align:center;min-width:56px}
  thead th.num{text-align:right}
  tbody tr{border-bottom:1px solid var(--border);transition:background .1s}
  tbody td{padding:7px 8px}
  .tr-sin{background:var(--indigo-bg);cursor:pointer}
  .tr-sin:hover{background:rgba(129,140,248,.18)}
  .tr-aus{background:var(--amber-bg)}
  .tr-aus:hover{background:rgba(210,153,34,.2)}
  tbody tr:not(.tr-aus):not(.tr-sin):hover{background:var(--bg3)}
  .mono{font-family:ui-monospace,Menlo,Consolas,monospace;color:var(--text2);font-size:11px;white-space:nowrap}
  .nome{color:var(--text)}
  .sin-td{color:var(--indigo);font-weight:800;font-size:11px}
  .sin-nome{font-weight:700;color:var(--indigo)}
  .grp-chk{width:14px;height:14px;cursor:pointer;accent-color:var(--indigo);margin-right:5px;vertical-align:middle;flex-shrink:0;position:relative;top:-1px}
  .cel{text-align:center;font-weight:800;font-size:13px}
  .sin-cel{text-align:center;color:var(--text2);font-size:11px}
  .ok{color:var(--green)}
  .aus{color:var(--amber)}
  .num{text-align:right;font-weight:700}
  .grc{text-align:right;font-weight:700;color:var(--indigo)}
  .bad{color:var(--amber)}
  .good{color:var(--text2)}
  .lac-badge{font-size:10px;font-weight:700;background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-border);border-radius:99px;padding:1px 8px;margin-left:8px}
  .ok-badge{font-size:10px;font-weight:700;background:var(--green-bg);color:var(--green);border:1px solid var(--green-border);border-radius:99px;padding:1px 8px;margin-left:8px}
  @media print{
    :root{--bg:#fff;--bg2:#f8fafc;--bg3:#f1f5f9;--border:#e2e8f0;--text:#0f172a;--text2:#64748b;--text3:#4f46e5;--green:#16a34a;--green-bg:#f0fdf4;--green-border:#86efac;--amber:#d97706;--amber-bg:#fffbeb;--amber-border:#fde68a;--indigo:#4f46e5;--indigo-bg:#eef2ff;--indigo-border:#c7d2fe}
    .controls,.print-btn{display:none}
    .tbl-wrap{max-height:none;overflow:visible;border:none}
    .wrap{padding:0}
    thead th{position:static}
  }
</style></head>
<body>
<div class="wrap">
  <div class="topbar">
    <div class="brand">Board<em>ECD</em> <small>Mapa de Movimentação</small></div>
    <button class="print-btn" onclick="window.print()">⎙ Imprimir / Salvar PDF</button>
  </div>
  <div class="meta">
    <h1>Mapa de Movimentação por Conta</h1>
    <p>${esc(companyInfo?.nome || 'Empresa')}${companyInfo?.cnpj ? ' · CNPJ ' + esc(companyInfo.cnpj) : ''}</p>
    <p>Período: <strong>${periods.map((p: string) => periodLabel(p)).join(' · ')}</strong> · Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  <div class="summary">
    <div class="sum-card"><div class="lbl">Contas analíticas</div><div class="val">${totalAnaliticas}</div></div>
    <div class="sum-card warn"><div class="lbl">Com lacuna</div><div class="val">${comAus}</div></div>
    <div class="sum-card ok"><div class="lbl">Sem lacuna</div><div class="val">${totalAnaliticas - comAus}</div></div>
  </div>
  <div class="controls">
    <span class="ctrl-lbl">Mostrar:</span>
    <button class="fbtn fall act" onclick="filtrar('all',this)">Todas</button>
    <button class="fbtn faus" onclick="filtrar('aus',this)">Só com lacuna</button>
    <button class="fbtn fok" onclick="filtrar('ok',this)">Só sem lacuna</button>
    <div class="ctrl-sep"></div>
    <span class="ctrl-lbl">Nível:</span>
    ${levelBtns}
    <button class="lbtn" onclick="expandTudo()">Expandir tudo</button>
    <button class="lbtn" onclick="recolherTudo()">Recolher tudo</button>
  </div>
  <div class="tbl-wrap">
    <table id="tbl">
      <thead><tr>
        <th>Conta</th><th>Descrição</th>${theadCols}<th class="num">Lacunas</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
</div>
<script>
  var filtroAtual = 'all'
  var nivelAtual = 2   // começa expandido até nível 2

  // ── helpers ──────────────────────────────────────────────────────────────
  function passaFiltro(r){
    var lac = parseInt(r.dataset.lacunas||0)
    if(filtroAtual==='aus') return lac > 0
    if(filtroAtual==='ok')  return lac === 0
    return true
  }

  function syncChk(id){
    var chk = document.querySelector('.grp-chk[data-grp-id="'+id+'"]')
    if(!chk) return
    var f = document.querySelector('tbody tr[data-pai="'+id+'"]')
    chk.checked = f ? f.style.display !== 'none' : false
  }

  // ── renderizar: aplica filtroAtual + nivelAtual juntos ───────────────────
  function renderizar(){
    var nMax = nivelAtual

    // 1. Analíticas: passa filtro E nível
    document.querySelectorAll('tbody tr[data-type="A"]').forEach(function(r){
      var niv = parseInt(r.dataset.nivel||1)
      r.style.display = (passaFiltro(r) && niv <= nMax) ? '' : 'none'
    })

    // 2. Sintéticas: bottom-up
    var sins = Array.from(document.querySelectorAll('tbody tr[data-type="S"]'))
    sins.sort(function(a,b){ return parseInt(b.dataset.nivel)-parseInt(a.dataset.nivel) })
    sins.forEach(function(r){
      var niv = parseInt(r.dataset.nivel||1)
      if(niv > nMax){ r.style.display='none'; return }
      // Nível 1: sempre visível (cabeçalhos do plano)
      if(niv === 1){ r.style.display=''; return }
      // Demais: visível se tiver filho visível
      var temFilho = Array.from(document.querySelectorAll('tbody tr[data-pai="'+r.dataset.id+'"]'))
        .some(function(c){ return c.style.display !== 'none' })
      r.style.display = (filtroAtual==='all' || temFilho) ? '' : 'none'
    })

    // 3. Sincroniza checkboxes
    document.querySelectorAll('.grp-chk').forEach(function(c){ syncChk(c.dataset.grpId) })
  }

  // ── toggle individual de checkbox ────────────────────────────────────────
  function setVisible(id, vis){
    document.querySelectorAll('tbody tr[data-pai="'+id+'"]').forEach(function(r){
      r.style.display = vis ? '' : 'none'
      if(!vis) setVisible(r.dataset.id, false)
    })
    syncChk(id)
  }

  function toggleGrupo(id, checked){ setVisible(id, checked) }

  // ── filtrar ──────────────────────────────────────────────────────────────
  function filtrar(f, btn){
    filtroAtual = f
    document.querySelectorAll('.fbtn').forEach(function(b){ b.classList.remove('act') })
    btn.classList.add('act')
    renderizar()
  }

  // ── níveis ────────────────────────────────────────────────────────────────
  function expandNivel(n){
    nivelAtual = n
    renderizar()
    document.querySelectorAll('.lbtn').forEach(function(b){ b.classList.remove('act') })
    event.target.classList.add('act')
  }

  function expandTudo(){
    nivelAtual = 99
    renderizar()
    document.querySelectorAll('.lbtn').forEach(function(b){ b.classList.remove('act') })
  }

  function recolherTudo(){
    nivelAtual = 1
    // Nivel 1 sintéticas sempre visíveis; tudo mais oculto
    document.querySelectorAll('tbody tr').forEach(function(r){
      r.style.display = parseInt(r.dataset.nivel||1) === 1 ? '' : 'none'
    })
    document.querySelectorAll('.grp-chk').forEach(function(c){ c.checked=false })
    document.querySelectorAll('.lbtn').forEach(function(b){ b.classList.remove('act') })
  }

  renderizar()
</script>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      toast({ variant: 'destructive', title: 'Pop-up bloqueado', description: 'Permita pop-ups deste site para abrir o relatório.' })
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  // Sincronização Automática (Auto-Save) com o navegador e nuvem
  useEffect(() => {
    if (!isConfigLoaded) return

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
      viewPresets,
      analysisProfiles,
      activeProfileId,
      recorrentes,
      recorrenciaPresets,
      checklists,
      activeChecklistId,
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
    viewPresets,
    analysisProfiles,
    activeProfileId,
    recorrentes,
    recorrenciaPresets,
    checklists,
    activeChecklistId,
    user,
    companyInfo,
  ])

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!event.target.closest('.chart-dropdown-container')) {
        setOpenDropdownId(null)
      }
      if (!event.target.closest('.pie-dropdown-container')) {
        setOpenPieDropdownId(null)
      }
      if (!event.target.closest('.period-dropdown-container')) {
        setIsPeriodDropdownOpen(false)
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
      analysisProfiles,
      activeProfileId,
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
        if (configData.analysisProfiles) setAnalysisProfiles(configData.analysisProfiles)
        if (configData.activeProfileId) setActiveProfileId(configData.activeProfileId)
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
          let currentLctoId = ''
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
                j005: [],
                j100: [],
                j150: [],
              }
            } else if (reg === 'J005') {
              if (info) info.j005.push(parts)
            } else if (reg === 'J100') {
              if (info) info.j100.push(parts)
            } else if (reg === 'J150') {
              if (info) info.j150.push(parts)
            } else if (reg === 'I200') {
              currentLctoDate = parseSpedDate(parts[3])
              currentLctoDateDb = parseSpedDateDb(parts[3])
              // Identificador único do lançamento (agrupa débito↔crédito p/ contrapartida)
              currentLctoId =
                typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `${currentLctoDateDb}-${parts[2] || ''}-${i}`
            } else if (reg === 'I250') {
              extractedTx.push({
                conta: parts[2],
                data: currentLctoDate,
                dataDb: currentLctoDateDb,
                valor: parts[4],
                indDc: parts[5],
                historico: parts[8] || '',
                lancamentoId: currentLctoId,
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
        if (res.info.j005) mergedInfo.j005 = [...(mergedInfo.j005 || []), ...res.info.j005]
        if (res.info.j100) mergedInfo.j100 = [...(mergedInfo.j100 || []), ...res.info.j100]
        if (res.info.j150) mergedInfo.j150 = [...(mergedInfo.j150 || []), ...res.info.j150]
      }
    })

    let spedDiff = {
      periodChanged: false,
      oldPeriod: '',
      newPeriod: '',
      j100Changes: [] as string[],
      j150Changes: [] as string[],
    }

    if (mergedInfo && companyInfo) {
      let isSamePeriod = false

      const getJ005Periods = (j005Array: any[]) =>
        j005Array
          ?.map((p) => `${p[2]}-${p[3]}`)
          .sort()
          .join(',') || ''

      const oldJ005 =
        getJ005Periods(companyInfo.j005) || `${companyInfo.dtIni}-${companyInfo.dtFin}`
      const newJ005 = getJ005Periods(mergedInfo.j005) || `${mergedInfo.dtIni}-${mergedInfo.dtFin}`

      if (oldJ005 === newJ005) {
        isSamePeriod = true
      } else {
        spedDiff.periodChanged = true
        spedDiff.oldPeriod = oldJ005
        spedDiff.newPeriod = newJ005
      }

      const getJ100T = (j100Array: any[]) => {
        return j100Array?.filter((p) => p[3] === 'T').map((p) => p.join('|')) || []
      }
      const getJ150T = (j150Array: any[]) => {
        return j150Array?.filter((p) => p[4] === 'T').map((p) => p.join('|')) || []
      }

      const currentJ100T = getJ100T(companyInfo.j100)
      const newJ100T = getJ100T(mergedInfo.j100)
      const currentJ150T = getJ150T(companyInfo.j150)
      const newJ150T = getJ150T(mergedInfo.j150)

      newJ100T.forEach((line) => {
        if (!currentJ100T.includes(line)) {
          spedDiff.j100Changes.push(`Novo/Alterado: ${line}`)
        }
      })
      currentJ100T.forEach((line) => {
        if (!newJ100T.includes(line)) {
          spedDiff.j100Changes.push(`Removido/Antigo: ${line}`)
        }
      })

      newJ150T.forEach((line) => {
        if (!currentJ150T.includes(line)) {
          spedDiff.j150Changes.push(`Novo/Alterado: ${line}`)
        }
      })
      currentJ150T.forEach((line) => {
        if (!newJ150T.includes(line)) {
          spedDiff.j150Changes.push(`Removido/Antigo: ${line}`)
        }
      })

      if (isSamePeriod && spedDiff.j100Changes.length === 0 && spedDiff.j150Changes.length === 0) {
        // Os blocos de DRE (J005/J100/J150) batem, mas isso NÃO garante que os
        // lançamentos (I250) no banco estejam corretos/únicos. Em vez de pular
        // automaticamente, deixa o usuário decidir reimportar (reprocessa os
        // lançamentos do período e corrige eventuais duplicatas).
        const forcar = window.confirm(
          'Este arquivo parece conter os mesmos dados de DRE (J005/J100/J150) que já estão no sistema.\n\n' +
            'Deseja REIMPORTAR mesmo assim?\n\n' +
            'Isso reprocessa todos os lançamentos do período (útil para corrigir duplicatas) ' +
            'e atualiza a contrapartida.',
        )
        if (!forcar) {
          toast({
            title: 'Importação ignorada',
            description: 'Você optou por não reimportar. Nada foi alterado.',
          })
          setLoading(false)
          if (e.target) e.target.value = ''
          return
        }
      }
    }

    allExtracted.sort((a: any, b: any) => {
      const dateA = dateStrToMs(a.periodo.split(' a ')[0])
      const dateB = dateStrToMs(b.periodo.split(' a ')[0])
      if (dateA !== dateB) return dateA - dateB
      return a.conta.localeCompare(b.conta)
    })

    setStagingPayload({
      info: mergedInfo,
      extractedData: allExtracted,
      extractedTx: allExtractedTx,
      spedDiff,
    })
    setIsStagingModalOpen(true)
    setLoading(false)
    if (e.target) e.target.value = ''
  }

  const exportAuditLog = () => {
    if (!auditResult) return
    let csv = 'Tipo;Ação;Quantidade;Detalhes\n'
    csv += `Contas;Novas;${auditResult.accounts.new};${auditResult.accounts.newDetails.join(', ')}\n`
    csv += `Contas;Atualizadas;${auditResult.accounts.updated};-\n`
    csv += `Saldos;Novos;${auditResult.balances.new};-\n`
    csv += `Saldos;Atualizados;${auditResult.balances.updated};-\n`
    csv += `Lancamentos (Tx);Inseridos;${auditResult.transactions.inserted};-\n`
    csv += `Lancamentos (Tx);Removidos (Antigos);${auditResult.transactions.deleted};-\n`

    if (auditResult.errors.length > 0) {
      csv += `\nErros Encontrados;\n`
      auditResult.errors.forEach((err: string) => {
        csv += `Erro;${err}\n`
      })
    }

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `auditoria_importacao_${companyInfo?.cnpj || 'sped'}.csv`
    link.click()
  }

  const confirmImport = async () => {
    if (!stagingPayload) return
    setIsStagingModalOpen(false)
    setLoading(true)

    setCompanyInfo(stagingPayload.info)
    setData(stagingPayload.extractedData)

    try {
      const audit = await saveToSupabase(
        stagingPayload.info,
        stagingPayload.extractedData,
        stagingPayload.extractedTx,
        stagingPayload.spedDiff,
      )

      if (audit) {
        setAuditResult(audit)
        setIsAuditModalOpen(true)
      }
    } catch (err) {
      console.error('Falha crítica na importação', err)
    }

    setStagingPayload(null)
    setLoading(false)
  }

  const cancelImport = () => {
    setStagingPayload(null)
    setIsStagingModalOpen(false)
  }

  const saveToSupabase = async (
    info: any,
    extractedData: any[],
    extractedTx: any[],
    spedDiff: any,
  ) => {
    if (!user) return null

    const audit = {
      accounts: { new: 0, updated: 0, newDetails: [] as string[], updatedDetails: [] as string[] },
      balances: { new: 0, updated: 0 },
      transactions: { inserted: 0, deleted: 0 },
      errors: [] as string[],
      startTime: Date.now(),
      endTime: 0,
      spedDiff: spedDiff || null,
    }

    try {
      toast({
        title: 'Sincronizando',
        description: 'Salvando dados na nuvem, validando duplicatas...',
      })

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .upsert(
          { user_id: user.id, cnpj: info.cnpj, name: info.nome, raw_sped_info: info } as any,
          { onConflict: 'user_id, cnpj' },
        )
        .select()
        .single()

      if (companyError) throw companyError
      const companyId = companyData.id

      // 1. Auditar Contas
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('code')
        .eq('company_id', companyId)

      const existingAccCodes = new Set((existingAccounts || []).map((a: any) => a.code))

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

          if (existingAccCodes.has(row.conta)) {
            audit.accounts.updated++
            audit.accounts.updatedDetails.push(row.conta)
          } else {
            audit.accounts.new++
            audit.accounts.newDetails.push(row.conta)
          }
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

        if (accError) {
          audit.errors.push(`Erro ao salvar contas: ${accError.message}`)
          throw accError
        }
        upsertedAccounts?.forEach((a) => accountIdMap.set(a.code, a.id))
      }

      // 2. Auditar Saldos
      const allAccIds = Array.from(accountIdMap.values())
      const existingBalSet = new Set()

      for (let i = 0; i < allAccIds.length; i += 200) {
        const chunk = allAccIds.slice(i, i + 200)
        const { data: bals } = await supabase
          .from('balances')
          .select('account_id, period')
          .in('account_id', chunk)

        if (bals) {
          bals.forEach((b) => existingBalSet.add(`${b.account_id}_${b.period}`))
        }
      }

      const balancesToUpsert = extractedData.map((row) => {
        const accId = accountIdMap.get(row.conta)
        if (existingBalSet.has(`${accId}_${row.periodo}`)) {
          audit.balances.updated++
        } else {
          audit.balances.new++
        }

        return {
          account_id: accId,
          period: row.periodo,
          initial_balance:
            parseFloat(row.sldIni.toString().replace(/\./g, '').replace(',', '.')) || 0,
          initial_indicator: row.indDcIni,
          debit: parseFloat(row.debito.toString().replace(/\./g, '').replace(',', '.')) || 0,
          credit: parseFloat(row.credito.toString().replace(/\./g, '').replace(',', '.')) || 0,
          final_balance:
            parseFloat(row.sldFin.toString().replace(/\./g, '').replace(',', '.')) || 0,
          final_indicator: row.indDcFin,
        }
      })

      for (let i = 0; i < balancesToUpsert.length; i += chunkSize) {
        const chunk = balancesToUpsert.slice(i, i + chunkSize)
        const { error: balError } = await supabase
          .from('balances')
          .upsert(chunk, { onConflict: 'account_id, period' })

        if (balError) {
          audit.errors.push(`Erro ao salvar saldos: ${balError.message}`)
          throw balError
        }
      }

      // 3. Auditar Transações
      if (extractedTx && extractedTx.length > 0) {
        const seenTxs = new Set()
        const validTxs = extractedTx
          .filter((t) => accountIdMap.has(t.conta) && t.dataDb)
          .map((t) => ({
            company_id: companyId,
            account_id: accountIdMap.get(t.conta),
            date: t.dataDb,
            amount: parseFloat(t.valor.toString().replace(/\./g, '').replace(',', '.')) || 0,
            indicator: t.indDc,
            history: t.historico,
            lancamento_id: t.lancamentoId || null,
          }))
          .filter((t) => {
            const key = `${t.account_id}_${t.date}_${t.amount}_${t.indicator}_${t.history}`
            if (seenTxs.has(key)) return false
            seenTxs.add(key)
            return true
          })

        if (validTxs.length > 0) {
          const dates = [...new Set(validTxs.map((t) => t.date))].sort()
          const minDate = dates[0]
          const maxDate = dates[dates.length - 1]

          // Limpa o período antes de reinserir, em lotes via RPC (confiável mesmo
          // com a tabela enorme — usa o índice (company_id, date)). Evita a
          // duplicação que ocorria quando o DELETE por intervalo expirava.
          let safetyCounter = 0
          let totalDeleted = 0
          while (safetyCounter < 500) {
            safetyCounter++
            const { data: removed, error: delError } = await supabase.rpc(
              'purge_transactions_range',
              { p_company_id: companyId, p_date_from: minDate, p_date_to: maxDate, p_limit: 200000 },
            )
            if (delError) {
              audit.errors.push(`Erro ao limpar lançamentos do período: ${delError.message}`)
              break
            }
            const n = removed || 0
            totalDeleted += n
            if (n === 0) break
          }

          audit.transactions.deleted = totalDeleted

          for (let i = 0; i < validTxs.length; i += 2000) {
            const chunk = validTxs.slice(i, i + 2000)
            const { error: txError } = await supabase.from('transactions').insert(chunk)
            if (txError) audit.errors.push(`Erro ao salvar lançamentos: ${txError.message}`)
          }

          audit.transactions.inserted = validTxs.length
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Seus dados foram importados e salvos na nuvem.',
      })

      audit.endTime = Date.now()
      return audit
    } catch (err: any) {
      console.error(err)
      audit.errors.push(err.message || 'Erro desconhecido')
      toast({
        variant: 'destructive',
        title: 'Erro na sincronização',
        description: 'Não foi possível salvar todos os dados na nuvem.',
      })
      audit.endTime = Date.now()
      return audit
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

  useEffect(() => {
    if (monthlyData && monthlyData.periods.length > 0) {
      setSelectedMonthlyPeriods((prev) => {
        if (prev.length === 0) return monthlyData.periods
        const validPrev = prev.filter((p) => monthlyData.periods.includes(p))
        return validPrev.length > 0 ? validPrev : monthlyData.periods
      })
    }
    if (monthlyData && monthlyData.allAccounts.length > 0) {
      setSelectedMonthlyAccounts((prev) => {
        if (prev.length === 0) return monthlyData.allAccounts.map((a: any) => a.conta)
        const validPrev = prev.filter((p) =>
          monthlyData.allAccounts.some((a: any) => a.conta === p),
        )
        return validPrev.length > 0 ? validPrev : monthlyData.allAccounts.map((a: any) => a.conta)
      })

      setExpandedAccounts((prev) => {
        if (prev.size === 0) {
          const initial = new Set<string>()
          monthlyData.allAccounts.forEach((a: any) => {
            if (parseInt(a.nivel) <= 2) initial.add(a.conta)
          })
          return initial
        }
        return prev
      })
    }
  }, [monthlyData])

  const periodsToDisplay = useMemo(() => {
    return monthlyData.periods.filter((p: string) => selectedMonthlyPeriods.includes(p))
  }, [monthlyData.periods, selectedMonthlyPeriods])

  const accountsToDisplay = useMemo(() => {
    return monthlyData.accounts.filter((acc: any) => selectedMonthlyAccounts.includes(acc.conta))
  }, [monthlyData.accounts, selectedMonthlyAccounts])

  const accountParentMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (!monthlyData?.allAccounts) return map
    monthlyData.allAccounts.forEach((acc: any) => {
      const possibleParents = monthlyData.allAccounts.filter(
        (p: any) =>
          acc.conta.startsWith(p.conta) &&
          p.conta !== acc.conta &&
          parseInt(p.nivel) < parseInt(acc.nivel),
      )
      if (possibleParents.length > 0) {
        const parent = possibleParents.sort((a: any, b: any) => b.conta.length - a.conta.length)[0]
        map[acc.conta] = parent.conta
      }
    })
    return map
  }, [monthlyData])

  const isAccountVisibleInTree = useCallback(
    (conta: string) => {
      let curr = accountParentMap[conta]
      while (curr) {
        if (!expandedAccounts.has(curr)) return false
        curr = accountParentMap[curr]
      }
      return true
    },
    [accountParentMap, expandedAccounts],
  )

  const tableAccountsToDisplay = useMemo(() => {
    return accountsToDisplay.filter((acc: any) => isAccountVisibleInTree(acc.conta))
  }, [accountsToDisplay, isAccountVisibleInTree])

  // Valor exibido de uma conta num período (espelha a lógica das células de saldo)
  const getBalanceteRawVal = useCallback(
    (acc: any, period: string) => {
      const sld = acc?.saldos?.[period]
      if (!sld) return 0
      const isResult =
        acc.natureza === '04' ||
        acc.natureza === '4' ||
        acc.conta.startsWith('3') ||
        acc.conta.startsWith('4') ||
        acc.conta.startsWith('5')
      if (!isAccumulated && isResult) {
        return Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
      }
      return Math.abs(getRawNumber(sld.sldFin))
    },
    [isAccumulated],
  )

  const getBalanceteAccTotal = useCallback(
    (acc: any) => {
      const isResult =
        acc.natureza === '04' ||
        acc.natureza === '4' ||
        acc.conta.startsWith('3') ||
        acc.conta.startsWith('4') ||
        acc.conta.startsWith('5')
      if (isResult && !isAccumulated) {
        let sumDeb = 0
        let sumCred = 0
        periodsToDisplay.forEach((p: string) => {
          const s = acc.saldos[p]
          if (s) {
            sumDeb += getRawNumber(s.debito)
            sumCred += getRawNumber(s.credito)
          }
        })
        return Math.abs(sumDeb - sumCred)
      }
      if (periodsToDisplay.length > 0) {
        const last = periodsToDisplay[periodsToDisplay.length - 1]
        const s = acc.saldos[last]
        if (s) return Math.abs(getRawNumber(s.sldFin))
      }
      return 0
    },
    [isAccumulated, periodsToDisplay],
  )

  // Média = Acumulado ÷ quantidade de períodos filtrados.
  // Como o Acumulado é o mesmo valor nos dois modos (Mensal Isolado / Acumulado
  // Mensal), a média também é idêntica nos dois modos.
  const getBalanceteMedia = useCallback(
    (acc: any) => {
      const n = periodsToDisplay.length
      if (!n) return { val: 0, ind: '' }
      const isResult =
        acc.natureza === '04' ||
        acc.natureza === '4' ||
        acc.conta.startsWith('3') ||
        acc.conta.startsWith('4') ||
        acc.conta.startsWith('5')
      let acVal = 0
      let acInd = ''
      if (isResult && !isAccumulated) {
        let sumDeb = 0
        let sumCred = 0
        periodsToDisplay.forEach((p: string) => {
          const s = acc.saldos[p]
          if (s) {
            sumDeb += getRawNumber(s.debito)
            sumCred += getRawNumber(s.credito)
          }
        })
        acVal = Math.abs(sumDeb - sumCred)
        acInd = acVal > 0 ? (sumDeb > sumCred ? 'D' : 'C') : ''
      } else {
        const last = periodsToDisplay[n - 1]
        const s = acc.saldos[last]
        if (s) {
          acVal = Math.abs(getRawNumber(s.sldFin))
          acInd = s.indDcFin
        }
      }
      return { val: acVal / n, ind: acInd }
    },
    [isAccumulated, periodsToDisplay],
  )

  const isResultConta = (acc: any) =>
    acc.natureza === '04' ||
    acc.natureza === '4' ||
    acc.conta.startsWith('3') ||
    acc.conta.startsWith('4') ||
    acc.conta.startsWith('5')

  // Valor exibido de uma conta num período (mesma lógica das células de saldo)
  const periodVal = (acc: any, p: string) => {
    const sld = acc.saldos[p]
    if (!sld) return { val: 0, ind: '' }
    if (!isAccumulated && isResultConta(acc)) {
      const deb = getRawNumber(sld.debito)
      const cred = getRawNumber(sld.credito)
      const net = Math.abs(deb - cred)
      return { val: net, ind: net > 0 ? (deb > cred ? 'D' : 'C') : '' }
    }
    return { val: Math.abs(getRawNumber(sld.sldFin)), ind: sld.indDcFin }
  }
  const periodLines = (acc: any) =>
    periodsToDisplay.map((p: string) => {
      const v = periodVal(acc, p)
      return {
        label: `${periodLabel(p)}:`,
        value: v.val > 0 ? `${fmtBRL(v.val)}${v.ind ? ' ' + v.ind : ''}` : '—',
      }
    })

  // Memória do Acumulado: traz o valor de cada mês filtrado e a soma
  const getAcumuladoMemo = (acc: any) => {
    const n = periodsToDisplay.length
    if (isResultConta(acc) && !isAccumulated) {
      let sd = 0
      let sc = 0
      periodsToDisplay.forEach((p: string) => {
        const s = acc.saldos[p]
        if (s) {
          sd += getRawNumber(s.debito)
          sc += getRawNumber(s.credito)
        }
      })
      const net = Math.abs(sd - sc)
      const ind = net > 0 ? (sd > sc ? 'D' : 'C') : ''
      return {
        lines: periodLines(acc),
        formula: `Soma dos ${n} período(s) selecionado(s)`,
        resultado: `${fmtBRL(net)}${ind ? ' ' + ind : ''}`,
      }
    }
    const last = n > 0 ? periodsToDisplay[n - 1] : null
    const v = last ? periodVal(acc, last) : { val: 0, ind: '' }
    return {
      lines: [
        {
          label: `Saldo final (${periodLabel(last || '')}):`,
          value: `${fmtBRL(v.val)}${v.ind ? ' ' + v.ind : ''}`,
        },
      ],
      formula: 'Saldo final do último período selecionado',
      resultado: `${fmtBRL(v.val)}${v.ind ? ' ' + v.ind : ''}`,
    }
  }

  // Memória da Média: Acumulado ÷ quantidade de períodos filtrados
  const getMediaMemo = (acc: any) => {
    const n = periodsToDisplay.length || 1
    const m = getBalanceteMedia(acc)
    const acVal = m.val * n
    return {
      lines: [
        {
          label: `Acumulado (${n} período(s)):`,
          value: `${fmtBRL(acVal)}${m.ind ? ' ' + m.ind : ''}`,
        },
        { label: 'Qtd. de períodos:', value: String(n) },
      ],
      formula: `${fmtBRL(acVal)} ÷ ${n}`,
      resultado: `${fmtBRL(m.val)}${m.ind ? ' ' + m.ind : ''}`,
    }
  }

  // Reordena as linhas visíveis aplicando a ordenação escolhida em cada grupo (conta pai),
  // mantendo a hierarquia: filhos de um pai são ordenados entre si pela coluna selecionada.
  const orderedBalanceteRows = useMemo(() => {
    const list = tableAccountsToDisplay
    if (!list.length) return list
    const inSet = new Set(list.map((a: any) => a.conta))
    const childrenMap: Record<string, any[]> = {}
    const roots: any[] = []
    list.forEach((acc: any) => {
      const parent = accountParentMap[acc.conta]
      if (parent && inSet.has(parent)) {
        if (!childrenMap[parent]) childrenMap[parent] = []
        childrenMap[parent].push(acc)
      } else {
        roots.push(acc)
      }
    })

    const byCode = (a: any, b: any) =>
      String(a.conta).localeCompare(String(b.conta), undefined, { numeric: true })

    const sortSiblings = (sibs: any[], parentConta: string | null) => {
      const cfg = parentConta ? balanceteSortConfigs[parentConta] : null
      const arr = [...sibs]
      if (!cfg) return arr.sort(byCode)
      return arr.sort((a, b) => {
        let cmp = 0
        if (cfg.key === 'conta') {
          cmp = byCode(a, b)
        } else if (cfg.key === 'descricao') {
          cmp = String(a.nome || '').localeCompare(String(b.nome || ''))
        } else if (cfg.key === 'media') {
          cmp = getBalanceteMedia(a).val - getBalanceteMedia(b).val
        } else if (cfg.key === 'acumulado') {
          cmp = getBalanceteAccTotal(a) - getBalanceteAccTotal(b)
        } else {
          cmp = getBalanceteRawVal(a, cfg.key) - getBalanceteRawVal(b, cfg.key)
        }
        if (cmp === 0) cmp = byCode(a, b)
        return cfg.direction === 'asc' ? cmp : -cmp
      })
    }

    const result: any[] = []
    const walk = (node: any) => {
      result.push(node)
      const kids = childrenMap[node.conta]
      if (kids && kids.length) sortSiblings(kids, node.conta).forEach(walk)
    }
    sortSiblings(roots, null).forEach(walk)
    return result
  }, [
    tableAccountsToDisplay,
    accountParentMap,
    balanceteSortConfigs,
    getBalanceteRawVal,
    getBalanceteAccTotal,
    getBalanceteMedia,
  ])

  const expandAllAccounts = () => {
    if (!monthlyData?.allAccounts) return
    const allSinteticas = monthlyData.allAccounts
      .filter((a: any) => a.tipo === 'S')
      .map((a: any) => a.conta)
    setExpandedAccounts(new Set(allSinteticas))
  }

  const collapseToLevel1 = () => {
    setExpandedAccounts(new Set())
  }

  const toggleAccountSelection = (conta: string, currentState: boolean) => {
    const isChecked = !currentState
    setSelectedMonthlyAccounts((prev) => {
      const newSet = new Set(prev)
      if (isChecked) {
        monthlyData.allAccounts.forEach((a: any) => {
          if (a.conta === conta || a.conta.startsWith(conta)) newSet.add(a.conta)
        })
      } else {
        monthlyData.allAccounts.forEach((a: any) => {
          if (a.conta === conta || a.conta.startsWith(conta)) newSet.delete(a.conta)
        })
        monthlyData.allAccounts.forEach((a: any) => {
          if (conta !== a.conta && conta.startsWith(a.conta)) newSet.delete(a.conta)
        })
      }
      return Array.from(newSet)
    })
  }

  const toggleAccountExpand = (conta: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev)
      if (next.has(conta)) next.delete(conta)
      else next.add(conta)
      return next
    })
  }

  const setAvBase = (accountCode: string, base: string | string[] | null) => {
    setAnalysisProfiles((prev) =>
      prev.map((p) => {
        if (p.id === activeProfileId) {
          const newBases = { ...p.customAvBases }
          if (base === null) {
            delete newBases[accountCode]
          } else {
            newBases[accountCode] = base
          }
          return { ...p, customAvBases: newBases }
        }
        return p
      }),
    )
  }

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return
    const newPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName,
      accounts: selectedMonthlyAccounts,
      periods: selectedMonthlyPeriods,
    }
    setViewPresets((prev) => [...prev, newPreset])
    setNewPresetName('')
    toast({ title: 'Sucesso', description: 'Preset salvo com sucesso!' })
  }

  const handleApplyPreset = (preset: any) => {
    setSelectedMonthlyAccounts(preset.accounts)
    setSelectedMonthlyPeriods(preset.periods)
    toast({ title: 'Sucesso', description: `Preset "${preset.name}" aplicado!` })
    setIsAccountFilterOpen(false)
  }

  const handleDeletePreset = (id: string) => {
    setViewPresets((prev) => prev.filter((p) => p.id !== id))
  }

  const selectedExpenseTrendData = useMemo(() => {
    if (!selectedExpenseTrend || !monthlyData || !monthlyData.periods.length) return null

    const trend = monthlyData.periods.map((period: any) => {
      let val = 0

      if (selectedExpenseTrend.isGrouped) {
        selectedExpenseTrend.subAccounts?.forEach((accCode: string) => {
          const acc = monthlyData.allAccounts.find((a: any) => a.conta === accCode)
          if (acc) {
            const sld = acc.saldos[period]
            if (sld) {
              val += Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
            }
          }
        })
      } else {
        const acc = monthlyData.allAccounts.find((a: any) => a.conta === selectedExpenseTrend.conta)
        if (acc) {
          const sld = acc.saldos[period]
          if (sld) {
            val += Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
          }
        }
      }

      return {
        period: period.split(' a ')[0].substring(3),
        valor: val,
      }
    })

    return trend
  }, [selectedExpenseTrend, monthlyData])

  const baseValuesPerPeriod = useMemo(() => {
    if (!monthlyData?.periods?.length) return {}

    const bases: Record<string, { ativo: number; receita: number; receitaBruta: number }> = {}

    // Encontra a conta raiz do Ativo (1) — uma vez, fora do loop de períodos
    const ativoAcc = monthlyData.allAccounts.find(
      (a: any) => a.conta.startsWith('1') && a.nivel === '1',
    )
    // Encontra a conta raiz de Receitas Líquidas (3 ou 4, nível 1)
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
    // Encontra a conta de Receita Bruta: sintética com "BRUTA" no nome sob o grupo de Receitas
    const receitaBrutaAcc =
      monthlyData.allAccounts.find(
        (a: any) =>
          a.tipo === 'S' &&
          a.nome.toUpperCase().includes('BRUTA') &&
          a.nome.toUpperCase().includes('RECEITA') &&
          (a.conta.startsWith('3') || a.conta.startsWith('4')),
      ) ||
      monthlyData.allAccounts.find(
        (a: any) =>
          a.tipo === 'S' &&
          a.nome.toUpperCase().includes('BRUTA') &&
          (a.conta.startsWith('3') || a.conta.startsWith('4')),
      )

    monthlyData.periods.forEach((period) => {
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
        receitaBruta: getReceitaVal(receitaBrutaAcc),
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
    const top20 = expenses.slice(0, 20)
    const maxVal = top20.length > 0 ? top20[0].valor : 0
    const totalExpenses = expenses.reduce((acc: any, curr: any) => acc + curr.valor, 0)
    const top20Total = top20.reduce((acc: any, curr: any) => acc + curr.valor, 0)
    const paretoPct = totalExpenses > 0 ? (top20Total / totalExpenses) * 100 : 0

    // Trend Analysis for Top 5 over last 12 periods
    const top5 = top20.slice(0, 5)
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
                periodVal += Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
              }
            }
          })
        } else {
          const acc = monthlyData.allAccounts.find((a: any) => a.conta === item.conta)
          if (acc) {
            const sld = acc.saldos[period]
            if (sld) {
              periodVal += Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
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
      items: top20,
      maxVal,
      totalExpenses,
      top20Total,
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

  const toggleChartAccountSelection = (chartId: any, conta: any) => {
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

  // Monta os dados do Balancete para exportação (CSV/TXT/XLSX/PDF/HTML)
  const buildBalanceteExportData = () => {
    const fmt = (n: number) =>
      n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const isResultAcc = (acc: any) =>
      acc.natureza === '04' ||
      acc.natureza === '4' ||
      acc.conta.startsWith('3') ||
      acc.conta.startsWith('4') ||
      acc.conta.startsWith('5')

    const periodVI = (acc: any, p: string) => {
      const sld = acc.saldos[p]
      if (!sld) return { val: 0, ind: '' }
      if (!isAccumulated && isResultAcc(acc)) {
        const deb = getRawNumber(sld.debito)
        const cred = getRawNumber(sld.credito)
        const net = Math.abs(deb - cred)
        return { val: net, ind: net > 0 ? (deb > cred ? 'D' : 'C') : '' }
      }
      return { val: Math.abs(getRawNumber(sld.sldFin)), ind: sld.indDcFin }
    }
    const acumVI = (acc: any) => {
      if (isResultAcc(acc) && !isAccumulated) {
        let sd = 0
        let sc = 0
        periodsToDisplay.forEach((p: string) => {
          const s = acc.saldos[p]
          if (s) {
            sd += getRawNumber(s.debito)
            sc += getRawNumber(s.credito)
          }
        })
        const net = Math.abs(sd - sc)
        return { val: net, ind: net > 0 ? (sd > sc ? 'D' : 'C') : '' }
      }
      if (periodsToDisplay.length > 0) {
        const last = periodsToDisplay[periodsToDisplay.length - 1]
        const s = acc.saldos[last]
        if (s) return { val: Math.abs(getRawNumber(s.sldFin)), ind: s.indDcFin }
      }
      return { val: 0, ind: '' }
    }
    const ahPctOf = (acc: any, p: string, vi: { val: number }) => {
      let prevVal = 0
      let ok = false
      if (activeProfile.globalAhMode === 'base_period' && activeProfile.basePeriodForAh) {
        const b = acc.saldos[activeProfile.basePeriodForAh]
        if (b) {
          ok = true
          prevVal =
            !isAccumulated && isResultAcc(acc)
              ? Math.abs(getRawNumber(b.debito) - getRawNumber(b.credito))
              : Math.abs(getRawNumber(b.sldFin))
        }
      } else {
        const idx = monthlyData.periods.indexOf(p)
        if (idx > 0) {
          const b = acc.saldos[monthlyData.periods[idx - 1]]
          if (b) {
            ok = true
            prevVal =
              !isAccumulated && isResultAcc(acc)
                ? Math.abs(getRawNumber(b.debito) - getRawNumber(b.credito))
                : Math.abs(getRawNumber(b.sldFin))
          }
        }
      }
      if (ok && prevVal > 0) return ((vi.val / prevVal - 1) * 100).toFixed(2).replace('.', ',') + '%'
      if (ok && prevVal === 0 && vi.val > 0) return 'N/A'
      return ''
    }

    const p2 =
      isComparingProfiles && compareProfileId
        ? analysisProfiles.find((x: any) => x.id === compareProfileId)
        : null
    const n = periodsToDisplay.length

    const columns: any[] = [
      { label: 'Conta', kind: 'text' },
      { label: 'Descrição', kind: 'text', indent: true },
    ]
    periodsToDisplay.forEach((p: string) => {
      const lbl = p.split(' a ')[0].substring(3)
      columns.push({ label: `${lbl} Saldo`, kind: 'num' }, { label: 'D/C', kind: 'ind' })
      if (showAV) {
        columns.push({ label: `${lbl} AV%`, kind: 'pct' })
        if (p2) columns.push({ label: `${lbl} AV% P2`, kind: 'pct' })
      }
      if (showAH) columns.push({ label: `${lbl} AH%`, kind: 'pct' })
    })
    columns.push({ label: `Acumulado (${n})`, kind: 'num' }, { label: 'D/C', kind: 'ind' })
    columns.push({ label: `Média (${n})`, kind: 'num' }, { label: 'D/C', kind: 'ind' })

    // usa rowsToRender para respeitar a ordem customizada (drag-and-drop) da tela
    const rows = rowsToRender
      .filter((acc: any) => selectedMonthlyAccounts.includes(acc.conta))
      .map((acc: any) => {
        const cells: any[] = [{ text: acc.conta }, { text: acc.nome }]
        const isRecorrente = recorrentesSet.has(acc.conta) && acc.tipo === 'A'
        periodsToDisplay.forEach((p: string) => {
          const sld = acc.saldos?.[p]
          const semMovimento = !sld || (getRawNumber(sld.debito) === 0 && getRawNumber(sld.credito) === 0)
          const isLacuna = isRecorrente && semMovimento
          const vi = periodVI(acc, p)
          cells.push(
            { text: vi.val > 0 ? fmt(vi.val) : '', value: vi.val, isLacuna },
            { text: vi.ind, isLacuna },
          )
          if (showAV) {
            const base1 = getBaseValueForAccountWithProfile(acc, p, activeProfile)
            cells.push({
              text: base1 && vi.val > 0 ? ((vi.val / base1) * 100).toFixed(2).replace('.', ',') + '%' : '',
              isLacuna,
            })
            if (p2) {
              const base2 = getBaseValueForAccountWithProfile(acc, p, p2)
              cells.push({
                text: base2 && vi.val > 0 ? ((vi.val / base2) * 100).toFixed(2).replace('.', ',') + '%' : '',
                isLacuna,
              })
            }
          }
          if (showAH) cells.push({ text: ahPctOf(acc, p, vi), isLacuna })
        })
        const ac = acumVI(acc)
        cells.push({ text: ac.val > 0 ? fmt(ac.val) : '', value: ac.val }, { text: ac.ind })
        const m = getBalanceteMedia(acc)
        cells.push({ text: m.val > 0 ? fmt(m.val) : '', value: m.val }, { text: m.ind })
        return { level: parseInt(acc.nivel) || 1, isSintetica: acc.tipo === 'S', cells }
      })

    const title = `Balancete Comparativo${companyInfo?.nome ? ' - ' + companyInfo.nome : ''}`
    const subtitle = `${companyInfo?.cnpj ? 'CNPJ ' + companyInfo.cnpj + ' • ' : ''}${
      isAccumulated ? 'Acumulado Mensal' : 'Mensal Isolado'
    } • ${n} período(s)`
    return { title, subtitle, columns, rows }
  }

  const exportBalancete = async (format: 'csv' | 'txt' | 'xlsx' | 'pdf' | 'html') => {
    try {
      const data = buildBalanceteExportData()
      if (format === 'csv') dlCsv(data)
      else if (format === 'txt') dlTxt(data)
      else if (format === 'xlsx') await dlXlsx(data)
      else if (format === 'pdf') openExport(data, true)
      else openExport(data, false)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao exportar', description: err?.message })
    }
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
      periodsToDisplay.forEach((p: any) => {
        csv += `${p} (Saldo Final);${p} (D/C);`
        if (showAV) {
          csv += `${p} AV% (${activeProfile.name});`
          if (isComparingProfiles && compareProfileId) {
            const p2 = analysisProfiles.find((x: any) => x.id === compareProfileId)
            if (p2) csv += `${p} AV% (${p2.name});`
          }
        }
        if (showAH) {
          csv += `${p} AH%;`
        }
      })
      csv += `Acumulado ${periodsToDisplay.length} per. (Valor);Acumulado ${periodsToDisplay.length} per. (D/C);\n`

      monthlyData.accounts.forEach((acc: any) => {
        if (!selectedMonthlyAccounts.includes(acc.conta)) return

        csv += `${acc.conta};${acc.nome};${acc.tipo};${acc.nivel};`
        periodsToDisplay.forEach((p: any) => {
          const sld = acc.saldos[p]
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
              const ind = deb > cred ? 'D' : cred > deb ? 'C' : ''
              csv += `${net.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })};${ind};`
              rawVal = net
            } else {
              csv += `${sld.sldFin};${sld.indDcFin};`
              rawVal = Math.abs(getRawNumber(sld.sldFin))
            }
          } else {
            csv += '0,00;;'
          }

          if (showAV) {
            const base1 = getBaseValueForAccountWithProfile(acc, p, activeProfile)
            const av1 = base1 && rawVal > 0 ? ((rawVal / base1) * 100).toFixed(2) + '%' : ''
            csv += `${av1};`
            if (isComparingProfiles && compareProfileId) {
              const p2 = analysisProfiles.find((x: any) => x.id === compareProfileId)
              const base2 = p2 ? getBaseValueForAccountWithProfile(acc, p, p2) : 0
              const av2 = base2 && rawVal > 0 ? ((rawVal / base2) * 100).toFixed(2) + '%' : ''
              csv += `${av2};`
            }
          }

          if (showAH) {
            let ahPct = ''
            let prevVal = 0
            let hasValidPrev = false
            if (activeProfile.globalAhMode === 'base_period' && activeProfile.basePeriodForAh) {
              const baseSld = acc.saldos[activeProfile.basePeriodForAh]
              if (baseSld) {
                hasValidPrev = true
                const isResult =
                  acc.natureza === '04' ||
                  acc.natureza === '4' ||
                  acc.conta.startsWith('3') ||
                  acc.conta.startsWith('4') ||
                  acc.conta.startsWith('5')
                if (!isAccumulated && isResult) {
                  prevVal = Math.abs(getRawNumber(baseSld.debito) - getRawNumber(baseSld.credito))
                } else {
                  prevVal = Math.abs(getRawNumber(baseSld.sldFin))
                }
              }
            } else {
              const originalIndex = monthlyData.periods.indexOf(p)
              if (originalIndex > 0) {
                const prevPeriod = monthlyData.periods[originalIndex - 1]
                const prevSld = acc.saldos[prevPeriod]
                if (prevSld) {
                  hasValidPrev = true
                  const isResult =
                    acc.natureza === '04' ||
                    acc.natureza === '4' ||
                    acc.conta.startsWith('3') ||
                    acc.conta.startsWith('4') ||
                    acc.conta.startsWith('5')
                  if (!isAccumulated && isResult) {
                    prevVal = Math.abs(getRawNumber(prevSld.debito) - getRawNumber(prevSld.credito))
                  } else {
                    prevVal = Math.abs(getRawNumber(prevSld.sldFin))
                  }
                }
              }
            }
            if (hasValidPrev && prevVal > 0) {
              ahPct = ((rawVal / prevVal - 1) * 100).toFixed(2) + '%'
            } else if (hasValidPrev && prevVal === 0 && rawVal > 0) {
              ahPct = 'N/A'
            }
            csv += `${ahPct};`
          }
        })

        // Accumulated
        let accDisplayVal = '0,00'
        let accDisplayInd = ''
        const isResult =
          acc.natureza === '04' ||
          acc.natureza === '4' ||
          acc.conta.startsWith('3') ||
          acc.conta.startsWith('4') ||
          acc.conta.startsWith('5')

        if (isResult && !isAccumulated) {
          let sumDeb = 0
          let sumCred = 0
          periodsToDisplay.forEach((period: string) => {
            const sld = acc.saldos[period]
            if (sld) {
              sumDeb += getRawNumber(sld.debito)
              sumCred += getRawNumber(sld.credito)
            }
          })
          const net = Math.abs(sumDeb - sumCred)
          accDisplayVal = net.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          if (net > 0) accDisplayInd = sumDeb > sumCred ? 'D' : sumCred > sumDeb ? 'C' : ''
        } else {
          if (periodsToDisplay.length > 0) {
            const lastPeriod = periodsToDisplay[periodsToDisplay.length - 1]
            const sld = acc.saldos[lastPeriod]
            if (sld) {
              accDisplayVal = sld.sldFin
              accDisplayInd = sld.indDcFin
            }
          }
        }
        csv += `${accDisplayVal};${accDisplayInd};\n`
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
    } else if (activeTab === 'top20') {
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

  const activeProfile =
    analysisProfiles.find((p) => p.id === activeProfileId) || analysisProfiles[0]

  const getBaseDetailsForAccount = (acc: any, period: string, profile: AnalysisProfile) => {
    const baseConfig = profile.customAvBases?.[acc.conta]

    const computeVal = (baseAcc: any) => {
      if (!baseAcc) return 0
      const sld = baseAcc.saldos[period]
      if (!sld) return 0
      const isResult =
        baseAcc.natureza === '04' ||
        baseAcc.natureza === '4' ||
        baseAcc.conta.startsWith('3') ||
        baseAcc.conta.startsWith('4') ||
        baseAcc.conta.startsWith('5')
      if (!isAccumulated && isResult) {
        return Math.abs(getRawNumber(sld.debito) - getRawNumber(sld.credito))
      }
      return Math.abs(getRawNumber(sld.sldFin))
    }

    if (Array.isArray(baseConfig)) {
      const accounts = baseConfig.map((code) => {
        const baseAcc = monthlyData.allAccounts.find((a: any) => a.conta === code)
        return { conta: code, nome: baseAcc?.nome || 'Desconhecida', valor: computeVal(baseAcc) }
      })
      return {
        type: 'Composição Manual (Múltiplas Contas)',
        totalValue: accounts.reduce((acc: number, curr: any) => acc + curr.valor, 0),
        accounts,
      }
    }

    let baseAccCode = baseConfig as string | undefined

    if (!baseAccCode) {
      if (profile.globalAvMode === 'parent') {
        baseAccCode = accountParentMap[acc.conta]
      } else if (profile.globalAvMode === 'receita_bruta') {
        const isPatrimonial = acc.conta.startsWith('1') || acc.conta.startsWith('2')
        const type = isPatrimonial ? 'Ativo Total (Padrão Global)' : 'Receita Bruta (Padrão Global)'
        const totalValue = isPatrimonial
          ? baseValuesPerPeriod[period]?.ativo
          : baseValuesPerPeriod[period]?.receitaBruta
        return { type, totalValue, accounts: [] }
      } else if (profile.globalAvMode === 'lowest_synthetic') {
        if (acc.tipo === 'S') {
          // Sintética folha = nenhum filho sintético → ela mesma é 100%
          const hasSyntheticChild = monthlyData.allAccounts.some(
            (a: any) => accountParentMap[a.conta] === acc.conta && a.tipo === 'S'
          )
          baseAccCode = hasSyntheticChild ? accountParentMap[acc.conta] : acc.conta
        } else {
          // Analítica → usa o pai imediato (sintético folha)
          baseAccCode = accountParentMap[acc.conta]
        }
      } else {
        const isPatrimonial = acc.conta.startsWith('1') || acc.conta.startsWith('2')
        const type = isPatrimonial
          ? 'Ativo Total (Padrão Global)'
          : 'Receita Líquida (Padrão Global)'
        const totalValue = isPatrimonial
          ? baseValuesPerPeriod[period]?.ativo
          : baseValuesPerPeriod[period]?.receita
        return { type, totalValue, accounts: [] }
      }
    }

    if (baseAccCode === acc.conta) {
      // modo lowest_synthetic: a conta é sua própria base (100%)
      const val = computeVal(acc)
      return {
        type: `Sub-nível mais baixo — ${acc.conta} (100%)`,
        totalValue: val,
        accounts: [{ conta: acc.conta, nome: acc.nome, valor: val }],
      }
    } else if (baseAccCode === 'parent') {
      baseAccCode = accountParentMap[acc.conta]
    } else if (baseAccCode === 'root') {
      baseAccCode = monthlyData.allAccounts.find(
        (a: any) => acc.conta.startsWith(a.conta) && a.nivel === '1',
      )?.conta
      if (!baseAccCode) baseAccCode = acc.conta.split('.')[0]
    }

    if (baseAccCode) {
      const baseAcc = monthlyData.allAccounts.find((a: any) => a.conta === baseAccCode)
      if (baseAcc) {
        const val = computeVal(baseAcc)
        return {
          type: `Conta Específica (${baseAccCode})`,
          totalValue: val,
          accounts: [{ conta: baseAcc.conta, nome: baseAcc.nome, valor: val }],
        }
      }
    }

    const isPatrimonial = acc.conta.startsWith('1') || acc.conta.startsWith('2')
    const type = isPatrimonial ? 'Ativo Total (Fallback)' : 'Receita Líquida (Fallback)'
    const totalValue = isPatrimonial
      ? baseValuesPerPeriod[period]?.ativo
      : baseValuesPerPeriod[period]?.receita
    return { type, totalValue, accounts: [] }
  }

  const getBaseValueForAccountWithProfile = (
    acc: any,
    period: string,
    profile: AnalysisProfile,
  ) => {
    return getBaseDetailsForAccount(acc, period, profile).totalValue
  }

  // Linhas a renderizar no Balancete: aplica o filtro "Só divergências" (mostra
  // apenas contas que disparam algum alerta AV%/AH% do perfil ativo + seus pais).
  const rowsToRender = useMemo(() => {
    // filtroDiv: ativo sempre que soDivergencias está ligado (resolução por conta dentro de diverge)
    const filtroDiv = soDivergencias
    const filtroAus = soAusencias && recorrentesSet.size > 0
    const filtroLac = soLacunas
    const filtroAna = soAnaliticas
    if (!filtroDiv && !filtroAus && !filtroLac && !filtroAna) return orderedBalanceteRows
    const allP = monthlyData.periods

    const temAus = (acc: any) => {
      if (!recorrentesSet.has(acc.conta)) return false
      return periodsToDisplay.some((p: string) => {
        const sld = acc.saldos?.[p]
        if (!sld) return true
        return getRawNumber(sld.debito) === 0 && getRawNumber(sld.credito) === 0
      })
    }

    const diverge = (acc: any) => {
      for (const p of periodsToDisplay) {
        const rawVal = getBalanceteRawVal(acc, p)
        if (showAV && rawVal > 0) {
          const avC = effCondForAccountFn(activeProfile, 'av', acc.conta, accountParentMap) as any
          if (avC.op !== 'none') {
            const base = getBaseValueForAccountWithProfile(acc, p, activeProfile)
            if (base > 0 && condDispara((rawVal / base) * 100, avC)) return true
          }
        }
        if (showAH) {
          const ahC = effCondForAccountFn(activeProfile, 'ah', acc.conta, accountParentMap) as any
          if (ahC.op !== 'none') {
            let prevVal = 0
            if (activeProfile.globalAhMode === 'base_period' && activeProfile.basePeriodForAh) {
              prevVal = getBalanceteRawVal(acc, activeProfile.basePeriodForAh)
            } else {
              const idx = allP.indexOf(p)
              if (idx > 0) prevVal = getBalanceteRawVal(acc, allP[idx - 1])
            }
            if (prevVal > 0 && condDispara((rawVal / prevVal - 1) * 100, ahC)) return true
          }
        }
      }
      return false
    }

    const temLacuna = (acc: any) =>
      periodsToDisplay.some((p: string) => {
        const sld = acc.saldos?.[p]
        if (!sld) return true
        return getRawNumber(sld.debito) === 0 && getRawNumber(sld.credito) === 0
      })

    // "Somente analíticas" — retorna direto, sem manter pais
    if (filtroAna && !filtroDiv && !filtroAus && !filtroLac) {
      return orderedBalanceteRows.filter((acc: any) => acc.tipo === 'A')
    }

    const keep = new Set<string>()
    orderedBalanceteRows.forEach((acc: any) => {
      // para filtros que precisam dos pais, só considera analíticas como candidatas
      const isCandidate = !filtroAna || acc.tipo === 'A'
      if (
        isCandidate && (
          (filtroDiv && diverge(acc)) ||
          (filtroAus && temAus(acc)) ||
          (filtroLac && temLacuna(acc))
        )
      ) {
        keep.add(acc.conta)
        if (!filtroAna) {
          // inclui pais apenas quando não estamos em modo "só analíticas"
          let par = accountParentMap[acc.conta]
          while (par) {
            keep.add(par)
            par = accountParentMap[par]
          }
        }
      }
    })
    return orderedBalanceteRows.filter((acc: any) => keep.has(acc.conta))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderedBalanceteRows,
    soDivergencias,
    soAusencias,
    soLacunas,
    recorrentesSet,
    showAV,
    showAH,
    soAnaliticas,
    activeProfileId,
    analysisProfiles,
    periodsToDisplay,
    monthlyData.periods,
    accountParentMap,
    getBalanceteRawVal,
    isAccumulated,
  ])

  // Opção "Só divergências": diz se o MÊS (acc x período) divergiu de algum
  // alerta visível (AV%/AH%). Usado p/ mascarar os meses que não bateram.
  const periodoDiverge = (acc: any, p: string) => {
    if (!soDivergencias) return true
    const avC = effCondForAccountFn(activeProfile, 'av', acc.conta, accountParentMap) as any
    const ahC = effCondForAccountFn(activeProfile, 'ah', acc.conta, accountParentMap) as any
    const avActive = showAV && avC.op !== 'none'
    const ahActive = showAH && ahC.op !== 'none'
    if (!avActive && !ahActive) return true
    const rawVal = getBalanceteRawVal(acc, p)
    if (avActive && rawVal > 0) {
      const base = getBaseValueForAccountWithProfile(acc, p, activeProfile)
      if (base > 0 && condDispara((rawVal / base) * 100, avC)) return true
    }
    if (ahActive) {
      let prevVal = 0
      if (activeProfile.globalAhMode === 'base_period' && activeProfile.basePeriodForAh) {
        prevVal = getBalanceteRawVal(acc, activeProfile.basePeriodForAh)
      } else {
        const idx = monthlyData.periods.indexOf(p)
        if (idx > 0) prevVal = getBalanceteRawVal(acc, monthlyData.periods[idx - 1])
      }
      if (prevVal > 0 && condDispara((rawVal / prevVal - 1) * 100, ahC)) return true
    }
    return false
  }

  // Recorrência mensal: o mês não teve NENHUM lançamento (débito e crédito zerados).
  const semMovimento = (acc: any, p: string) => {
    const sld = acc.saldos?.[p]
    if (!sld) return true
    return getRawNumber(sld.debito) === 0 && getRawNumber(sld.credito) === 0
  }
  // Conta marcada como recorrente que ficou sem movimento em algum mês exibido.
  const temAusencia = (acc: any) =>
    recorrentesSet.has(acc.conta) && periodsToDisplay.some((p: string) => semMovimento(acc, p))

  // Resumo das ausências (para o painel acima da tabela).
  const ausenciasResumo = useMemo(() => {
    if (recorrentes.length === 0) return [] as any[]
    const out: any[] = []
    monthlyData.allAccounts.forEach((acc: any) => {
      if (!recorrentesSet.has(acc.conta)) return
      const meses = periodsToDisplay.filter((p: string) => {
        const sld = acc.saldos?.[p]
        if (!sld) return true
        return getRawNumber(sld.debito) === 0 && getRawNumber(sld.credito) === 0
      })
      if (meses.length > 0) out.push({ conta: acc.conta, nome: acc.nome, meses })
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorrentes, recorrentesSet, monthlyData.allAccounts, periodsToDisplay])

  const ToggleAccumulated = () => (
    <div className="flex items-center gap-1.5 mr-2 shrink-0">
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => setIsAccumulated(false)}
          title="Mostra apenas a movimentação do próprio mês (ex.: só o que ocorreu em março), sem somar os meses anteriores."
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${!isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Mensal Isolado
        </button>
        <button
          onClick={() => setIsAccumulated(true)}
          title="Soma a movimentação desde o 1º mês até cada coluna (ex.: março = jan+fev+mar). Em contas patrimoniais, exibe o saldo final acumulado."
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${isAccumulated ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Acumulado Mensal
        </button>
      </div>
      <PerspectivaHelp />
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors mr-2 px-2 py-1.5 rounded-lg hover:bg-slate-100">
                    <UserCircle className="w-5 h-5" />
                    <span className="hidden sm:inline max-w-[160px] truncate">{user?.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-50">
                  <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                    <KeyRound className="w-4 h-4 mr-2" /> Alterar minha senha
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => setShowAdminUsers(true)}>
                      <Users className="w-4 h-4 mr-2" /> Gerenciar usuários
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-rose-600 focus:text-rose-600">
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                onClick={() => setActiveTab('top20')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'top20' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <ListOrdered className="w-4 h-4" /> Top 20 Despesas
              </button>
              <button
                onClick={() => setActiveTab('auditoria')}
                className={`flex items-center gap-2 px-6 py-3.5 font-semibold text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg ${activeTab === 'auditoria' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <ShieldCheck className="w-4 h-4" /> Validação SPED
              </button>

              <div className="w-full lg:w-auto flex-1"></div>
              {activeTab !== 'dashboard' &&
                activeTab !== 'liquidez' &&
                activeTab !== 'endividamento' &&
                activeTab !== 'monthly' && (
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
            Sincronização Ativa na Nuvem (Supabase)
          </AlertTitle>
          <AlertDescription className="text-indigo-700/80 font-medium text-sm mt-1">
            Olá, {user?.email}! Seus dados brutos do SPED, configurações de layout e mapeamentos
            agora estão sendo sincronizados e salvos diretamente na nuvem (Supabase). Isso garante a
            máxima segurança, backup contínuo e acesso unificado de qualquer dispositivo.
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
              <div className="mt-12 mb-6 border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-indigo-600" />
                    Dashboards Gráficos de "Composição de Custos"
                  </h3>
                  <p className="text-slate-500 font-medium mt-1">
                    Distribuição visual das suas bases de cálculo personalizadas.
                  </p>
                </div>
              </div>
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
                                        toggleChartAccountSelection(chartConf.id, acc.conta)
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

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
                  {/* Perspectiva */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                    <button
                      onClick={() => setDreIsAccumulated(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!dreIsAccumulated ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Mensal Isolado
                    </button>
                    <button
                      onClick={() => setDreIsAccumulated(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${dreIsAccumulated ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Acumulado Mensal
                    </button>
                  </div>

                  {/* Ano de acumulação (só aparece no modo Acumulado Mensal com múltiplos anos) */}
                  {dreIsAccumulated && dreStructuredData?.periods?.length > 0 && (() => {
                    const years = [...new Set(
                      dreStructuredData.periods.map((p: any) => {
                        const mm_aaaa = p.split(' a ')[0].substring(3) // "01/2026"
                        return mm_aaaa.split('/')[1] || ''
                      }).filter(Boolean)
                    )] as string[]
                    if (years.length < 2) return null
                    return (
                      <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-lg p-0.5">
                        <button
                          onClick={() => setDreAccumulateYear(null)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${dreAccumulateYear === null ? 'bg-white shadow text-indigo-700' : 'text-indigo-400 hover:text-indigo-600'}`}
                          title="Acumular todos os anos juntos"
                        >
                          Todos
                        </button>
                        {years.map((y) => (
                          <button
                            key={y}
                            onClick={() => setDreAccumulateYear(y)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${dreAccumulateYear === y ? 'bg-indigo-600 shadow text-white' : 'text-indigo-400 hover:text-indigo-600'}`}
                            title={`Acumular apenas ${y} (Jan → Dez ${y})`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Expandir / Recolher todos os grupos */}
                  {dreStructuredData?.lines?.length > 0 && (() => {
                    const groupIds = dreStructuredData.lines
                      .filter((l: any) => l.isGroup && l.accounts?.length > 0)
                      .map((l: any) => l.id)
                    const allExpanded = groupIds.length > 0 && groupIds.every((id: any) => expandedDreGroups[id])
                    return (
                      <button
                        onClick={() => {
                          if (allExpanded) {
                            setExpandedDreGroups({})
                          } else {
                            const next: any = {}
                            groupIds.forEach((id: any) => { next[id] = true })
                            setExpandedDreGroups(next)
                          }
                        }}
                        className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                        title={allExpanded ? 'Recolher todos os grupos' : 'Expandir todos os grupos'}
                      >
                        {allExpanded
                          ? <><ChevronsUpDown className="w-3.5 h-3.5" /> Recolher tudo</>
                          : <><ChevronsUpDown className="w-3.5 h-3.5" /> Expandir tudo</>
                        }
                      </button>
                    )
                  })()}

                  {/* Períodos */}
                  {dreStructuredData?.periods?.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setDrePeriodPopover((v) => !v)}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {(() => {
                          if (drePeriodsNone) return `Períodos (0)`
                          if (dreSelectedPeriods.length === 0) return `Períodos (${dreStructuredData.periods.length})`
                          return `Períodos (${dreSelectedPeriods.length})`
                        })()}
                      </button>
                      {drePeriodPopover && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[230px]">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Períodos</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setDreSelectedPeriods([]); setDrePeriodsNone(false) }}
                                className="text-xs text-indigo-600 font-bold hover:underline"
                              >
                                Todos
                              </button>
                              <button
                                onClick={() => { setDrePeriodsNone(true) }}
                                className="text-xs text-slate-500 font-bold hover:underline"
                              >
                                Nenhum
                              </button>
                              <button
                                onClick={() => { setDreSelectedPeriods([]); setDrePeriodsNone(false) }}
                                className="text-xs text-rose-500 font-bold hover:underline"
                              >
                                Limpar
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                            {dreStructuredData.periods.map((p: any) => {
                              const checked = !drePeriodsNone && (dreSelectedPeriods.length === 0 || dreSelectedPeriods.includes(p))
                              return (
                                <label key={p} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-1 py-0.5">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      if (drePeriodsNone) {
                                        setDrePeriodsNone(false)
                                        setDreSelectedPeriods([p])
                                      } else if (dreSelectedPeriods.length === 0) {
                                        setDreSelectedPeriods(dreStructuredData.periods.filter((x: any) => x !== p))
                                      } else if (checked) {
                                        const next = dreSelectedPeriods.filter((x) => x !== p)
                                        setDreSelectedPeriods(next.length === dreStructuredData.periods.length ? [] : next)
                                      } else {
                                        const next = [...dreSelectedPeriods, p]
                                        setDreSelectedPeriods(next.length === dreStructuredData.periods.length ? [] : next)
                                      }
                                    }}
                                    className="accent-indigo-600"
                                  />
                                  <span className="text-xs text-slate-700">{p.split(' a ')[0].substring(3)}</span>
                                </label>
                              )
                            })}
                          </div>
                          <button
                            onClick={() => setDrePeriodPopover(false)}
                            className="mt-2 w-full text-xs text-center text-slate-500 hover:text-slate-700 font-medium"
                          >
                            Fechar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Font size + Visualização */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                    <button
                      onClick={() => updateDrePrefs({ fontSize: Math.max(FONT_SIZE_MIN, drePrefs.fontSize - 1) })}
                      className="h-7 w-7 flex items-center justify-center rounded text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Diminuir fonte"
                    >
                      A-
                    </button>
                    <span className="text-xs font-bold text-slate-500 w-5 text-center select-none">{drePrefs.fontSize}</span>
                    <button
                      onClick={() => updateDrePrefs({ fontSize: Math.min(FONT_SIZE_MAX, drePrefs.fontSize + 1) })}
                      className="h-7 w-7 flex items-center justify-center rounded text-[15px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Aumentar fonte"
                    >
                      A+
                    </button>
                    <div className="w-px h-5 bg-slate-200 mx-0.5" />
                    <TableSettingsControls
                      prefs={drePrefs}
                      updatePrefs={updateDrePrefs}
                      onAlignAll={setAllDreColAlign}
                      className="border-0 shadow-none bg-transparent h-7 w-7"
                    />
                  </div>

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

              {dreStructuredData?.lines?.length > 0 ? (() => {
                const allDrePeriods = dreStructuredData.periods
                // Períodos do ano selecionado para acumulação (ou todos)
                const getPeriodYear = (p: string) => p.split(' a ')[0].substring(3).split('/')[1] || ''
                const accumBasePeriods = (dreIsAccumulated && dreAccumulateYear)
                  ? allDrePeriods.filter((p: any) => getPeriodYear(p) === dreAccumulateYear)
                  : allDrePeriods
                // Períodos exibidos: respeitam o seletor de períodos e, em modo acumulado por ano, só mostram o ano escolhido
                const drePeriodsToDisplay = drePeriodsNone
                  ? []
                  : dreSelectedPeriods.length === 0
                    ? accumBasePeriods
                    : accumBasePeriods.filter((p: any) => dreSelectedPeriods.includes(p))
                const getDreLineVal = (line: any, period: string) => {
                  if (!dreIsAccumulated) return line.totals[period] || 0
                  const idx = accumBasePeriods.indexOf(period)
                  if (idx < 0) return line.totals[period] || 0
                  return accumBasePeriods.slice(0, idx + 1).reduce((s: number, p: any) => s + (line.totals[p] || 0), 0)
                }
                const getDreAccVal = (acc: any, period: string) => {
                  if (!dreIsAccumulated) return acc.saldos[period] || 0
                  const idx = accumBasePeriods.indexOf(period)
                  if (idx < 0) return acc.saldos[period] || 0
                  return accumBasePeriods.slice(0, idx + 1).reduce((s: number, p: any) => s + (acc.saldos[p] || 0), 0)
                }
                return (
                <div className="overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  <Table
                    className="w-full text-left dre-viz-table"
                    data-grid={drePrefs.showGridlines ? 'on' : 'off'}
                    data-density={drePrefs.rowHeight || 'standard'}
                    style={{
                      fontSize: `${drePrefs.fontSize}px`,
                      ['--dre-gw']: `${drePrefs.gridlineWidth}px`,
                      ['--dre-gl']: drePrefs.gridlineColor,
                    } as any}
                  >
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="border-b-2 border-slate-200 hover:bg-slate-50/80">
                        <TableHead className="p-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] min-w-[400px] bg-slate-50 sticky left-0 z-20">
                          Estrutura Contábil Analítica
                        </TableHead>
                        {drePeriodsToDisplay.map((period: any) => (
                          <TableHead
                            key={period}
                            className={`p-5 whitespace-nowrap text-${dreValAlign} border-l border-slate-100 h-auto bg-slate-50`}
                          >
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                              {period.split(' a ')[0].substring(3)}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">
                              {dreIsAccumulated ? 'Saldo Acumulado' : 'Saldo no Período'}
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

                        // Esquema de cores espelhando o Balancete Comparativo
                        let rowBg = ''
                        let textClass = 'text-slate-700 font-semibold text-[13px]'
                        let valClass = 'text-slate-700'
                        let chevronClass = 'bg-white/20 text-white'

                        if (line.id === '14_LUCRO_LIQUIDO') {
                          // Resultado final → azul mais escuro (nível 1 do Balancete)
                          rowBg = 'bg-[#1E1B4B]'
                          textClass = 'text-white font-black text-[13px] uppercase tracking-wide'
                          valClass = 'text-white font-black'
                        } else if (line.id === '08_EBIT' || line.id === '05_LUCRO_BRUTO') {
                          // Resultados intermediários importantes → azul-800
                          rowBg = 'bg-[#1E40AF]'
                          textClass = 'text-white font-black text-[13px] uppercase tracking-wide'
                          valClass = 'text-white font-black'
                        } else if (isSubtotal) {
                          // Demais subtotais → azul-500
                          rowBg = 'bg-[#3B82F6]'
                          textClass = 'text-white font-bold text-[12px] uppercase tracking-wide'
                          valClass = 'text-white font-bold'
                        } else if (hasChildren) {
                          // Grupos sintéticos expandíveis → azul mais escuro (nível 1)
                          rowBg = 'bg-[#1E1B4B] cursor-pointer group'
                          textClass = 'text-white font-bold text-[13px]'
                          valClass = 'text-white font-bold'
                        }

                        const rowClass = rowBg
                          ? `${rowBg} hover:brightness-110 transition-all`
                          : 'hover:bg-slate-50 transition-colors'

                        return (
                          <React.Fragment key={line.id}>
                            <TableRow
                              onClick={() => hasChildren && toggleDreGroup(line.id)}
                              className={rowClass}
                            >
                              <TableCell className="p-4 md:px-6 flex items-center gap-3">
                                {hasChildren ? (
                                  <span
                                    className={`p-1 rounded transition-colors ${isExpanded ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                                  >
                                    <ChevronDown
                                      className={`w-4 h-4 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </span>
                                ) : (
                                  <span className="w-6" />
                                )}
                                <span className={textClass}>{line.label}</span>
                              </TableCell>
                              {drePeriodsToDisplay.map((period: any) => (
                                <TableCell
                                  key={period}
                                  className={`p-4 md:px-6 whitespace-nowrap border-l border-slate-100/50 ${valClass} text-${dreValAlign}`}
                                >
                                  {formatDreValue(getDreLineVal(line, period))}
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
                                  <TableCell className="py-3 px-6 pl-14 whitespace-nowrap">
                                    <span className="font-mono text-[11px] font-bold text-slate-900 tracking-wider mr-2">{acc.conta}</span>
                                    <span className="text-slate-900 font-medium text-[13px]">{acc.nome}</span>
                                  </TableCell>
                                  {drePeriodsToDisplay.map((period: any) => (
                                    <TableCell
                                      key={period}
                                      className={`p-3 md:px-6 whitespace-nowrap border-l border-slate-100/50 text-slate-900 text-[13px] font-medium text-${dreValAlign}`}
                                    >
                                      {formatDreValue(getDreAccVal(acc, period))}
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
                )
              })() : (
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

        {/* --- ABA: TOP 20 DESPESAS --- */}
        {data.length > 0 && activeTab === 'top20' && topExpensesData && (
          <div className="animate-in fade-in duration-500">
            <ExplanationPanel
              title="Para que serve o Ranking de Top 20 Despesas?"
              description="Funciona como a fatura do seu cartão de crédito. Se o dinheiro no final do mês faltou, essa tela te mostra exatamente os 20 maiores 'ralos' por onde o dinheiro da empresa está escapando, permitindo um controle muito mais detalhado."
              indicators={[
                {
                  name: 'Barras Visuais (O Tamanho do Gasto)',
                  desc: 'As cores mostram o peso visual da conta. Se a barra de "Folha de Pagamento" estiver quase cheia e a de "Material de Limpeza" pequenininha, fica claro onde focar esforços.',
                },
                {
                  name: 'Análise Trimestral ou Anual',
                  desc: 'Você não precisa olhar mês a mês. Exemplo: você pode selecionar o filtro "YTD" (Desde Janeiro) para descobrir qual foi a conta que mais "roubou" dinheiro da empresa ao longo de todo o ano.',
                },
                {
                  name: 'Agrupamento Personalizado (Juntar Contas)',
                  desc: "O contador lançou as manutenções dos caminhões separadas em peças, mecânico, funilaria... Crie um grupo 'Gastos com Frota' e jogue tudo dentro para ver o valor somado no Top 20.",
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Ranking: Top 20 Despesas
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
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-rose-500" />
                          Ranking Detalhado (Top 20)
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Maiores despesas do período selecionado
                        </p>
                      </div>
                    </div>
                    <div className="h-[750px] w-full">
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
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                      Clique na barra para ver a evolução mensal
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={22}>
                            {topExpensesData.items.map((entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length].hex}
                                className="cursor-pointer hover:brightness-110 transition-all"
                                onClick={() => setSelectedExpenseTrend(entry)}
                              />
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
                {
                  name: 'Alertas de Desvio (Ícones ⚠️)',
                  desc: 'Se configurado no Perfil, um ícone de alerta aparecerá ao lado de variações que ultrapassarem sua margem de segurança. Passe o mouse sobre o ícone para ver os detalhes.',
                },
              ]}
            />

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col overflow-hidden">
              <div className="p-6 md:p-8 pb-0 flex flex-col gap-6 bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      Balancete Comparativo
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Evolução dos saldos contábeis ao longo do tempo extraída do arquivo SPED.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:inline">
                        Perspectiva:
                      </span>
                      <ToggleAccumulated />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md whitespace-nowrap">
                          <Download className="w-4 h-4" /> Exportar
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 z-50">
                        <DropdownMenuLabel>Exportar Balancete</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => exportBalancete('xlsx')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Excel (.xlsx)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportBalancete('pdf')}>
                          <FileText className="w-4 h-4 mr-2 text-rose-600" /> PDF (imprimir)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportBalancete('csv')}>
                          <Download className="w-4 h-4 mr-2 text-slate-500" /> CSV (.csv)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportBalancete('txt')}>
                          <FileText className="w-4 h-4 mr-2 text-slate-500" /> Texto (.txt)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => exportBalancete('html')}>
                          <ExternalLink className="w-4 h-4 mr-2 text-indigo-600" /> Abrir no navegador
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row justify-between gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                      <button
                        onClick={collapseToLevel1}
                        className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap hover:bg-slate-50 text-slate-600 hover:text-indigo-700"
                        title="Recolher para o Nível 1"
                      >
                        Recolher (N1)
                      </button>
                      <div className="w-px bg-slate-100 my-1 mx-0.5"></div>
                      <button
                        onClick={expandAllAccounts}
                        className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap hover:bg-slate-50 text-slate-600 hover:text-indigo-700"
                        title="Expandir Todas"
                      >
                        Expandir Todas
                      </button>
                      <div className="w-px bg-slate-100 my-1 mx-0.5"></div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap hover:bg-slate-50 text-slate-600 hover:text-indigo-700 flex items-center gap-1">
                            Expandir por Nível <ChevronDown className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 z-50">
                          <DropdownMenuLabel>Profundidade de Visão</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={collapseToLevel1}>
                            Mostrar Nível 1 (Sintéticas)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setExpandedAccounts((prev) => {
                                const next = new Set<string>()
                                monthlyData.allAccounts.forEach((a: any) => {
                                  if (parseInt(a.nivel) < 2 && a.tipo === 'S') next.add(a.conta)
                                })
                                return next
                              })
                            }}
                          >
                            Expandir até Nível 2
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setExpandedAccounts((prev) => {
                                const next = new Set<string>()
                                monthlyData.allAccounts.forEach((a: any) => {
                                  if (parseInt(a.nivel) < 3 && a.tipo === 'S') next.add(a.conta)
                                })
                                return next
                              })
                            }}
                          >
                            Expandir até Nível 3
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setExpandedAccounts((prev) => {
                                const next = new Set<string>()
                                monthlyData.allAccounts.forEach((a: any) => {
                                  if (parseInt(a.nivel) < 4 && a.tipo === 'S') next.add(a.conta)
                                })
                                return next
                              })
                            }}
                          >
                            Expandir até Nível 4
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setExpandedAccounts((prev) => {
                                const next = new Set<string>()
                                monthlyData.allAccounts.forEach((a: any) => {
                                  if (parseInt(a.nivel) < 5 && a.tipo === 'S') next.add(a.conta)
                                })
                                return next
                              })
                            }}
                          >
                            Expandir até Nível 5
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={expandAllAccounts}>
                            Expandir Todos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <button
                      onClick={() => setSoAnaliticas(v => !v)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm whitespace-nowrap ${
                        soAnaliticas
                          ? 'bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Exibir somente contas analíticas (último nível, sem grupos sintéticos)"
                    >
                      <Filter className="w-4 h-4" />
                      Somente analíticas
                    </button>

                    <div className="relative period-dropdown-container z-30 w-full sm:w-auto">
                      <button
                        onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                        className="flex items-center justify-between w-full sm:w-44 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <span className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-600" />
                          Períodos ({selectedMonthlyPeriods.length})
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isPeriodDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
                          <div className="p-3 border-b border-slate-100 flex justify-between gap-2 bg-slate-50">
                            <button
                              onClick={() => setSelectedMonthlyPeriods(monthlyData.periods)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Selecionar Todos
                            </button>
                            <button
                              onClick={() => setSelectedMonthlyPeriods([])}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              Limpar
                            </button>
                          </div>
                          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                            {monthlyData.periods.map((p: string) => (
                              <label
                                key={p}
                                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMonthlyPeriods.includes(p)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMonthlyPeriods((prev: string[]) =>
                                        [...prev, p].sort(
                                          (a, b) =>
                                            monthlyData.periods.indexOf(a) -
                                            monthlyData.periods.indexOf(b),
                                        ),
                                      )
                                    } else {
                                      setSelectedMonthlyPeriods((prev: string[]) =>
                                        prev.filter((x) => x !== p),
                                      )
                                    }
                                  }}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                  {p.split(' a ')[0].substring(3)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setIsAccountFilterOpen(true)}
                      className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto"
                    >
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Filtro de Contas
                    </button>
                    <button
                      onClick={() => {
                        setRazaoAvancadoInitial(null)
                        setShowRazaoAvancado(true)
                      }}
                      className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto"
                      title="Razão contábil avançado (várias contas, contrapartida, totais)"
                    >
                      <ListOrdered className="w-4 h-4 text-indigo-600" />
                      Razão Avançado
                    </button>
                    <button
                      onClick={() => setShowRecorrenciaConfig(true)}
                      className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto"
                      title="Marcar contas que devem ter movimento todo mês (recorrência mensal)"
                    >
                      <CalendarClock className="w-4 h-4 text-rose-600" />
                      Recorrência mensal
                      {recorrentes.length > 0 && (
                        <span className="ml-0.5 text-[11px] font-bold bg-rose-100 text-rose-700 rounded-full px-1.5 py-0.5">
                          {recorrentes.length}
                        </span>
                      )}
                    </button>
                    {periodsToDisplay.length > 0 && monthlyData.allAccounts?.length > 0 && (
                      <button
                        onClick={openMapaMovimentoAsPage}
                        className="flex items-center gap-2 bg-white border border-amber-300 px-3 py-2 rounded-lg text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors shadow-sm w-full sm:w-auto"
                        title="Relatório geral: todas as contas analíticas × meses, mostrando quais tiveram ou não movimento"
                      >
                        <Activity className="w-4 h-4 text-amber-500" />
                        Mapa de Movimento
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 xl:border-l xl:border-slate-200 xl:pl-4">
                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={isComparingProfiles}
                          onChange={(e) => {
                            setIsComparingProfiles(e.target.checked)
                            if (e.target.checked && !compareProfileId) {
                              const p2 = analysisProfiles.find((p) => p.id !== activeProfileId)
                              if (p2) setCompareProfileId(p2.id)
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="whitespace-nowrap">Comparar Cenários</span>
                      </label>
                      <CenariosHelp />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                        P1:
                      </span>
                      <Select value={activeProfileId} onValueChange={setActiveProfileId}>
                        <SelectTrigger className="w-[140px] h-9 text-sm bg-white font-bold text-indigo-700 shadow-sm border-slate-200">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {analysisProfiles.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {isComparingProfiles && (
                        <>
                          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest hidden sm:block ml-1">
                            P2:
                          </span>
                          <Select value={compareProfileId} onValueChange={setCompareProfileId}>
                            <SelectTrigger className="w-[140px] h-9 text-sm bg-indigo-50 font-bold text-indigo-700 shadow-sm border-indigo-200">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {analysisProfiles
                                .filter((p) => p.id !== activeProfileId)
                                .map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setEditingProfileId(activeProfileId)
                          setIsProfileManagerOpen(true)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-slate-200 bg-white shadow-sm ml-1"
                        title="Gerir Perfis de Análise"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={showAV}
                          onChange={() => setShowAV(!showAV)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>AV%</span>
                      </label>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={showAH}
                          onChange={() => setShowAH(!showAH)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>AH%</span>
                      </label>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <label
                        className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-600"
                        title="Ocultar os valores em R$ (mantém D/C e os índices AV%/AH%)"
                      >
                        <input
                          type="checkbox"
                          checked={ocultarValores}
                          onChange={() => setOcultarValores(!ocultarValores)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        {ocultarValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="whitespace-nowrap">Ocultar valores</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                      <label
                        className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-600"
                        title="Mostra apenas as contas que divergem dos limites de alerta (AV%/AH%) do perfil ativo"
                      >
                        <input
                          type="checkbox"
                          checked={soDivergencias}
                          onChange={() => setSoDivergencias(!soDivergencias)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="whitespace-nowrap">Só divergências</span>
                      </label>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <label
                        className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-600"
                        title="Mostra apenas as contas marcadas como recorrência mensal que ficaram sem movimento em algum mês"
                      >
                        <input
                          type="checkbox"
                          checked={soAusencias}
                          onChange={() => setSoAusencias(!soAusencias)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <CalendarOff className="w-4 h-4 text-rose-500" />
                        <span className="whitespace-nowrap">Só ausências</span>
                      </label>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <label
                        className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-600"
                        title="Mostra contas analíticas que ficaram sem movimento em pelo menos 1 mês do período — independente de configuração de recorrência"
                      >
                        <input
                          type="checkbox"
                          checked={soLacunas}
                          onChange={() => setSoLacunas(!soLacunas)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <Activity className="w-4 h-4 text-amber-500" />
                        <span className="whitespace-nowrap">Lacunas</span>
                      </label>
                    </div>

                    {Object.keys(balanceteSortConfigs).length > 0 && (
                      <button
                        onClick={() => setBalanceteSortConfigs({})}
                        className="flex items-center gap-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
                        title="Remover todas as ordenações por valor e voltar à ordem padrão por código contábil"
                      >
                        <RotateCcw className="w-4 h-4" /> Restaurar Ordem (Conta)
                      </button>
                    )}

                    <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      <button
                        onClick={() =>
                          updateBalancetePrefs({
                            fontSize: Math.max(FONT_SIZE_MIN, balancetePrefs.fontSize - 1),
                          })
                        }
                        className="h-7 w-7 flex items-center justify-center rounded text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Diminuir fonte da tabela"
                      >
                        A-
                      </button>
                      <span className="text-xs font-bold text-slate-500 w-5 text-center select-none">
                        {balancetePrefs.fontSize}
                      </span>
                      <button
                        onClick={() =>
                          updateBalancetePrefs({
                            fontSize: Math.min(FONT_SIZE_MAX, balancetePrefs.fontSize + 1),
                          })
                        }
                        className="h-7 w-7 flex items-center justify-center rounded text-[15px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Aumentar fonte da tabela"
                      >
                        A+
                      </button>
                      <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
                      <TableSettingsControls
                        prefs={balancetePrefs}
                        updatePrefs={updateBalancetePrefs}
                        onAlignAll={setAllColAlign}
                        className="border-0 shadow-none bg-transparent h-7 w-7"
                        options={[
                          {
                            id: 'ocultar-dc',
                            label: 'Ocultar D / C',
                            checked: ocultarDC,
                            onChange: setOcultarDC,
                            hint: 'Esconde os indicadores Débito/Crédito ao lado dos valores',
                          },
                          {
                            id: 'ocultar-alertas',
                            label: 'Ocultar alertas de divergência',
                            checked: ocultarAlertas,
                            onChange: setOcultarAlertas,
                            hint: 'Esconde os ícones de aviso (⚠) de desvio nas colunas AV%/AH%',
                          },
                          {
                            id: 'ah-delta',
                            label: 'Coluna de variação em R$ (Δ R$)',
                            checked: showAhDelta,
                            onChange: setShowAhDelta,
                            hint: 'Adiciona, após o AH%, uma coluna com a diferença em R$ entre o mês e o anterior',
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {ausenciasResumo.length > 0 && (() => {
                const isFloating = ausenciasPanelPos !== null
                return (
                  <div
                    ref={ausenciasPanelRef}
                    style={isFloating ? { position: 'fixed', left: ausenciasPanelPos!.x, top: ausenciasPanelPos!.y, zIndex: 100, width: 700, maxWidth: '92vw' } : {}}
                    className={`${!isFloating ? 'mx-6 md:mx-8 mt-4 mb-0' : ''} p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-2 shadow-lg`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-2 min-w-0 flex-1 cursor-grab active:cursor-grabbing select-none"
                        onMouseDown={startAusenciasDrag}
                        title="Segure e arraste para mover o painel"
                      >
                        <GripHorizontal className="w-4 h-4 text-rose-300 shrink-0" />
                        <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm min-w-0">
                          <CalendarOff className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            Ausências detectadas em {ausenciasResumo.length} conta
                            {ausenciasResumo.length !== 1 ? 's' : ''} recorrente
                            {ausenciasResumo.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openAusenciasAsPage(ausenciasResumo)}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg px-2.5 py-1.5 transition-colors"
                          title="Abrir relatório completo em nova aba"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Relatório
                        </button>
                        {isFloating && (
                          <button
                            onClick={() => setAusenciasPanelPos(null)}
                            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-900 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg px-2 py-1.5 transition-colors"
                            title="Encaixar no lugar original"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setAusenciasPanelOculto(v => !v)}
                          className="flex items-center justify-center w-7 h-7 text-rose-500 hover:text-rose-800 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                          title={ausenciasPanelOculto ? 'Exibir contas' : 'Ocultar contas'}
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ausenciasPanelOculto ? '' : 'rotate-180'}`} />
                        </button>
                      </div>
                    </div>
                    {!ausenciasPanelOculto && (
                      <div className="flex flex-wrap gap-1.5 overflow-y-auto" style={{ maxHeight: 120 }}>
                        {ausenciasResumo.map((item: any) => (
                          <Popover
                            key={item.conta}
                            open={ausenciaDetalheConta === item.conta}
                            onOpenChange={(open) => setAusenciaDetalheConta(open ? item.conta : null)}
                          >
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-1 bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 rounded-lg px-2.5 py-1 text-xs text-rose-800 cursor-pointer transition-colors whitespace-nowrap shrink-0">
                                <span className="font-mono font-bold">{item.conta}</span>
                                <span className="text-rose-400 mx-0.5">·</span>
                                <span>{item.nome}</span>
                                <span className="text-rose-400 mx-0.5">·</span>
                                <span className="font-semibold text-rose-600">
                                  {item.meses.length} {item.meses.length === 1 ? 'mês' : 'meses'} sem movimento
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-64 p-3 space-y-2 z-50">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meses sem movimento</p>
                              <p className="font-bold text-slate-800 text-sm">{item.conta} — {item.nome}</p>
                              <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
                                {item.meses.map((m: string) => (
                                  <div key={m} className="flex items-center gap-2 py-1">
                                    <CalendarOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span className="text-sm text-slate-700 font-medium">{periodLabel(m)}</span>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              <div
                className="overflow-x-auto overflow-y-auto custom-scrollbar rounded-xl border border-slate-200 m-6 md:m-8 mt-2 md:mt-2"
                style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}
              >
                <table
                  className="w-full text-left border-collapse text-sm bc-viz-table"
                  data-grid={balancetePrefs.showGridlines ? 'on' : 'off'}
                  data-density={balancetePrefs.rowHeight || 'standard'}
                  style={{
                    fontSize: `${balancetePrefs.fontSize}px`,
                    ['--bc-gw']: `${balancetePrefs.gridlineWidth}px`,
                    ['--bc-gl']: balancetePrefs.gridlineColor,
                  }}
                >
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        className={`py-2 px-4 font-bold text-slate-500 uppercase tracking-widest text-[11px] border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm border-r-0 ${BC_ALIGN_TEXT[getColAlign('conta', 'left')]}`}
                      >
                        <div
                          className={`flex items-center gap-1 ${BC_ALIGN_JUSTIFY[getColAlign('conta', 'left')]}`}
                        >
                          <span>Conta</span>
                          <ColAlignMenu
                            colKey="conta"
                            current={getColAlign('conta', 'left')}
                            onChange={setColAlign}
                          />
                        </div>
                      </th>
                      <th
                        className={`py-2 px-4 font-bold text-slate-500 uppercase tracking-widest text-[11px] border-b border-slate-200 min-w-[300px] sticky top-0 bg-slate-50 z-20 shadow-sm border-r-0 ${BC_ALIGN_TEXT[getColAlign('descricao', 'left')]}`}
                      >
                        <div
                          className={`flex items-center gap-1 ${BC_ALIGN_JUSTIFY[getColAlign('descricao', 'left')]}`}
                        >
                          <span>Descrição</span>
                          <ColAlignMenu
                            colKey="descricao"
                            current={getColAlign('descricao', 'left')}
                            onChange={setColAlign}
                          />
                        </div>
                      </th>
                      {periodsToDisplay.map((period: string) => (
                        <React.Fragment key={period}>
                          {!soIndices && (
                            <th
                              className={`py-2 px-4 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm ${BC_ALIGN_TEXT[getColAlign(period, 'right')]}`}
                            >
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">
                                {period.split(' a ')[0].substring(3)}
                              </div>
                              <div
                                className={`flex items-center gap-1 ${BC_ALIGN_JUSTIFY[getColAlign(period, 'right')]}`}
                              >
                                <span className="font-bold text-slate-700 text-xs">Saldo</span>
                                <ColAlignMenu
                                  colKey={period}
                                  current={getColAlign(period, 'right')}
                                  onChange={setColAlign}
                                />
                              </div>
                            </th>
                          )}
                          {showAV && (
                            <>
                              <th
                                className={`py-2 px-2 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm w-20 ${BC_ALIGN_TEXT[getColAlign(`${period}_av`, 'right')]}`}
                              >
                                {soIndices ? (
                                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">
                                    {period.split(' a ')[0].substring(3)}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5 opacity-0">
                                    AV
                                  </div>
                                )}
                                <div
                                  className={`flex items-center gap-0.5 ${BC_ALIGN_JUSTIFY[getColAlign(`${period}_av`, 'right')]}`}
                                >
                                  <span
                                    className="font-bold text-slate-500 text-[10px]"
                                    title="Análise Vertical"
                                  >
                                    AV%{' '}
                                    {isComparingProfiles && (
                                      <span className="text-indigo-500 ml-1">P1</span>
                                    )}
                                  </span>
                                  <ColAlignMenu
                                    colKey={`${period}_av`}
                                    current={getColAlign(`${period}_av`, 'right')}
                                    onChange={setColAlign}
                                  />
                                </div>
                              </th>
                              {isComparingProfiles && (
                                <th
                                  className={`py-2 px-2 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-indigo-50/50 z-20 shadow-sm w-20 ${BC_ALIGN_TEXT[getColAlign(`${period}_avp2`, 'right')]}`}
                                >
                                  <div className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-0.5 opacity-0">
                                    AV
                                  </div>
                                  <div
                                    className={`flex items-center gap-0.5 ${BC_ALIGN_JUSTIFY[getColAlign(`${period}_avp2`, 'right')]}`}
                                  >
                                    <span
                                      className="font-bold text-indigo-600 text-[10px]"
                                      title={`Análise Vertical (${analysisProfiles.find((p) => p.id === compareProfileId)?.name})`}
                                    >
                                      AV% P2
                                    </span>
                                    <ColAlignMenu
                                      colKey={`${period}_avp2`}
                                      current={getColAlign(`${period}_avp2`, 'right')}
                                      onChange={setColAlign}
                                    />
                                  </div>
                                </th>
                              )}
                            </>
                          )}
                          {showAH && (
                            <th
                              className={`py-2 px-2 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm w-16 ${BC_ALIGN_TEXT[getColAlign(`${period}_ah`, 'right')]}`}
                            >
                              {soIndices && !showAV ? (
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">
                                  {period.split(' a ')[0].substring(3)}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5 opacity-0">
                                  AH
                                </div>
                              )}
                              <div
                                className={`flex items-center gap-0.5 ${BC_ALIGN_JUSTIFY[getColAlign(`${period}_ah`, 'right')]}`}
                              >
                                <span
                                  className="font-bold text-slate-500 text-[10px]"
                                  title="Análise Horizontal"
                                >
                                  AH%
                                </span>
                                <ColAlignMenu
                                  colKey={`${period}_ah`}
                                  current={getColAlign(`${period}_ah`, 'right')}
                                  onChange={setColAlign}
                                />
                              </div>
                            </th>
                          )}
                          {showAhDelta && (
                            <th
                              className={`py-2 px-2 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm w-24 ${BC_ALIGN_TEXT[getColAlign(`${period}_ahd`, 'right')]}`}
                            >
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5 opacity-0">
                                Δ
                              </div>
                              <div
                                className={`flex items-center gap-0.5 ${BC_ALIGN_JUSTIFY[getColAlign(`${period}_ahd`, 'right')]}`}
                              >
                                <span
                                  className="font-bold text-slate-500 text-[10px]"
                                  title="Variação em R$ vs período anterior"
                                >
                                  Δ R$
                                </span>
                                <ColAlignMenu
                                  colKey={`${period}_ahd`}
                                  current={getColAlign(`${period}_ahd`, 'right')}
                                  onChange={setColAlign}
                                />
                              </div>
                            </th>
                          )}
                        </React.Fragment>
                      ))}
                      {!soIndices && (
                        <>
                          <th
                            className={`py-2 px-4 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-indigo-50 z-20 shadow-sm ${BC_ALIGN_TEXT[getColAlign('acumulado', 'right')]}`}
                          >
                            <div className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-0.5 flex items-center justify-end gap-1">
                              Acumulado{' '}
                              {periodsToDisplay.length > 0 && `(${periodsToDisplay.length})`}
                              <IndicatorTooltip
                                text="Total acumulado nos períodos selecionados."
                                example="Soma a movimentação das contas de resultado (no modo isolado) ou exibe o saldo final do último período selecionado."
                              />
                            </div>
                            <div
                              className={`flex items-center gap-1 ${BC_ALIGN_JUSTIFY[getColAlign('acumulado', 'right')]}`}
                            >
                              <span className="font-bold text-indigo-700 text-xs">Saldo Total</span>
                              <ColAlignMenu
                                colKey="acumulado"
                                current={getColAlign('acumulado', 'right')}
                                onChange={setColAlign}
                              />
                            </div>
                          </th>
                          <th
                            className={`py-2 px-4 whitespace-nowrap border-l border-b border-slate-200 sticky top-0 bg-violet-50 z-20 shadow-sm ${BC_ALIGN_TEXT[getColAlign('media', 'right')]}`}
                          >
                            <div className="text-[10px] text-violet-500 uppercase font-bold tracking-widest mb-0.5 flex items-center justify-end gap-1">
                              Média {periodsToDisplay.length > 0 && `(${periodsToDisplay.length})`}
                              <IndicatorTooltip
                                text="Média dos saldos no período."
                                example="Soma os valores exibidos nos períodos selecionados e divide pela quantidade de períodos."
                              />
                            </div>
                            <div
                              className={`flex items-center gap-1 ${BC_ALIGN_JUSTIFY[getColAlign('media', 'right')]}`}
                            >
                              <span className="font-bold text-violet-700 text-xs">Saldo Médio</span>
                              <ColAlignMenu
                                colKey="media"
                                current={getColAlign('media', 'right')}
                                onChange={setColAlign}
                              />
                            </div>
                          </th>
                        </>
                      )}
                      <th
                        aria-hidden
                        className="border-b border-slate-200 sticky top-0 bg-slate-50 z-20 shadow-sm"
                        style={{ width: '100%' }}
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      // Envolve o conteúdo de uma célula de índice (AV%/AH%) deixando o
                      // alerta (⚠) num slot de largura fixa, como uma coluna, p/ os
                      // valores alinharem mesmo quando há/não há divergência.
                      const wrapIdxCell = (content: any, alertNode: any, justify: string) => (
                        <div className="flex items-center w-full gap-1">
                          {!ocultarAlertas && (
                            <span className="w-4 shrink-0 flex items-center justify-center">
                              {alertNode}
                            </span>
                          )}
                          <div className={`flex-1 flex items-center relative group/av ${justify}`}>
                            {content}
                          </div>
                        </div>
                      )
                      const renderAvCell = (
                        acc: any,
                        period: string,
                        profile: AnalysisProfile | undefined,
                        rawVal: number,
                        isDarkBg: boolean,
                        isP2 = false,
                        alignJustify = 'justify-end',
                      ) => {
                        if (!profile || rawVal <= 0) {
                          return wrapIdxCell(
                            <span className={isDarkBg ? 'text-white/30' : 'text-blue-900/30'}>-</span>,
                            null,
                            alignJustify,
                          )
                        }
                        // Só divergências: mascara o mês que não bateu nenhum alerta
                        if (!periodoDiverge(acc, period)) {
                          return wrapIdxCell(
                            <span className={isDarkBg ? 'text-white/30' : 'text-blue-900/30'}>•••</span>,
                            null,
                            alignJustify,
                          )
                        }
                        const baseDetails = getBaseDetailsForAccount(acc, period, profile)
                        const base = baseDetails.totalValue
                        const baseAcc =
                          baseDetails.accounts && baseDetails.accounts.length === 1
                            ? baseDetails.accounts[0]
                            : null
                        if (!base || base <= 0) {
                          return wrapIdxCell(
                            <span className={isDarkBg ? 'text-white/30' : 'text-blue-900/30'}>-</span>,
                            null,
                            alignJustify,
                          )
                        }
                        const avPct = (rawVal / base) * 100
                        const avCond = effCondForAccountFn(profile, 'av', acc.conta, accountParentMap)
                        const hasAlert = condDispara(avPct, avCond)
                        const avHasCustomRule = (profile.accountRules || []).some((r: any) => { let c = acc.conta; while(c){ if(r.conta===c && r.avOp!=null) return true; c=accountParentMap?.[c] } return false })

                        const avCustomBadge = avHasCustomRule ? (
                          <UITooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <span className={`text-[11px] font-bold cursor-help shrink-0 leading-none ${isDarkBg ? 'text-violet-300' : 'text-violet-500'}`}>✦</span>
                            </TooltipTrigger>
                            <TooltipContent className="p-2 text-xs shadow-xl z-50">Limiar de alerta customizado para esta conta/grupo</TooltipContent>
                          </UITooltip>
                        ) : null
                        const avAlertNode = (hasAlert || avHasCustomRule) ? (
                          <span className="flex items-center gap-0.5">
                            {hasAlert && (
                              <UITooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <AlertCircle className={`w-3.5 h-3.5 cursor-help shrink-0 ${isDarkBg ? 'text-amber-400' : 'text-amber-500'}`} />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[260px] p-2 text-xs shadow-xl z-50 whitespace-normal text-left">
                                  Atenção: o peso de {avPct.toFixed(2)}% está {condTexto(avCond)} — faixa de alerta configurada no perfil.
                                </TooltipContent>
                              </UITooltip>
                            )}
                            {avCustomBadge}
                          </span>
                        ) : null

                        return wrapIdxCell(
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExplodedAvContext({
                                  acc,
                                  period,
                                  profileId: profile.id,
                                  rawVal,
                                  avPct,
                                })
                              }}
                              className={`opacity-0 group-hover/av:opacity-100 p-0.5 rounded transition-all absolute right-full mr-1 ${isDarkBg ? 'hover:bg-white/20 text-white/70' : 'hover:bg-indigo-100 text-indigo-500'}`}
                              title="Ver detalhamento da base (Drill-down)"
                            >
                              <Search className="w-3 h-3" />
                            </button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <span
                                  onClick={(e) => e.stopPropagation()}
                                  className={`text-[0.9em] font-mono border-b border-dotted cursor-pointer hover:opacity-80 transition-opacity ${isDarkBg ? 'text-white/70 border-white/40' : isP2 ? 'text-indigo-700 font-bold border-indigo-300' : 'text-blue-800/70 border-blue-800/40'}`}
                                  title="Clique para ver a memória de cálculo"
                                >
                                  {avPct.toFixed(2)}%
                                </span>
                              </PopoverTrigger>
                              <PopoverContent
                                side="top"
                                align="end"
                                className="w-80 p-4 text-sm z-[120]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h4 className="font-bold text-slate-800 mb-2 border-b pb-1 flex items-center gap-1.5">
                                  <BookOpen className="h-4 w-4 text-indigo-600" /> Memória de Cálculo
                                  (AV%)
                                </h4>
                                <div className="text-xs mb-3 pb-2 border-b border-slate-100 space-y-2">
                                  <div>
                                    <span className="text-slate-500">Conta base:</span>
                                    <div className="font-medium text-slate-700 leading-snug mt-0.5">
                                      {baseAcc ? (
                                        <>
                                          <span className="font-mono text-indigo-600">
                                            {baseAcc.conta}
                                          </span>{' '}
                                          {baseAcc.nome}
                                        </>
                                      ) : (
                                        <span className="text-slate-600">{baseDetails.type}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">Conta analisada:</span>
                                    <div className="font-medium text-slate-700 leading-snug mt-0.5">
                                      <span className="font-mono text-indigo-600">{acc.conta}</span>{' '}
                                      {acc.nome}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2 mt-3">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">
                                      Valor Atual ({periodLabel(period)}):
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      {fmtBRL(rawVal)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 mr-2">Valor da Base:</span>
                                    <span className="font-medium text-slate-700 shrink-0">
                                      {fmtBRL(base)}
                                    </span>
                                  </div>
                                  {baseDetails.accounts && baseDetails.accounts.length > 0 && (
                                    <div className="pl-2 border-l-2 border-slate-100 space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
                                      {baseDetails.accounts.map((a: any) => (
                                        <div
                                          key={a.conta}
                                          className="flex justify-between items-center text-[11px] text-slate-500 gap-2"
                                        >
                                          <span className="truncate">
                                            <span className="font-mono text-slate-600">
                                              {a.conta}
                                            </span>{' '}
                                            {a.nome}
                                          </span>
                                          <span className="shrink-0 font-medium text-slate-600">
                                            {fmtBRL(a.valor)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100 mt-2 font-mono text-[10px] text-center text-slate-600 leading-tight">
                                    (|{fmtBRL(rawVal)}| / {fmtBRL(base)}) × 100
                                  </div>
                                  <div className="flex justify-between items-center text-sm font-bold pt-1 border-t mt-1">
                                    <span className="text-slate-700">Resultado:</span>
                                    <span className="text-slate-700">
                                      {avPct.toFixed(2).replace('.', ',')}%
                                    </span>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </>,
                          avAlertNode,
                          alignJustify,
                        )
                      }

                      return rowsToRender.map((acc: any, index: number) => {
                        const isSintetica = acc.tipo === 'S'
                        const isExpanded = expandedAccounts.has(acc.conta)
                        const indent = (parseInt(acc.nivel) - 1) * 16

                        const level = parseInt(acc.nivel) || 1
                        const isLevel5 = level === 5
                        let rowClass = 'transition-colors cursor-pointer '
                        let isDarkBg = false

                        if (level === 1) {
                          rowClass += 'bg-indigo-950 text-white hover:bg-indigo-900 font-bold'
                          isDarkBg = true
                        } else if (level === 2) {
                          rowClass += 'bg-blue-800 text-white hover:bg-blue-700 font-semibold'
                          isDarkBg = true
                        } else if (level === 3) {
                          rowClass += 'bg-blue-500 text-white hover:bg-blue-400 font-medium'
                          isDarkBg = true
                        } else if (level === 4) {
                          rowClass += 'bg-blue-200 text-blue-950 hover:bg-blue-300 font-medium'
                        } else if (isLevel5) {
                          rowClass += 'bg-blue-50 text-black hover:bg-blue-100 font-medium'
                        } else {
                          rowClass += 'bg-blue-50 text-blue-900 hover:bg-blue-100 font-medium'
                        }

                        return (
                          <tr
                            key={acc.conta}
                            onClick={() => {
                              if (isSintetica) {
                                toggleAccountExpand(acc.conta)
                              } else {
                                openRazao(acc)
                              }
                            }}
                            className={rowClass}
                          >
                            <td
                              className={`py-1.5 px-4 font-mono text-[0.8em] border-r border-white/10 group ${isDarkBg ? 'text-white/80' : isLevel5 ? 'text-black' : 'text-blue-900/60'}`}
                              style={{ paddingLeft: `${indent + 16}px` }}
                            >
                              <div
                                className={`flex items-center gap-1 ${BC_ALIGN_JUSTIFY[getColAlign('conta', 'left')]}`}
                              >
                                {isSintetica ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleAccountExpand(acc.conta)
                                    }}
                                    className={`w-4 h-4 flex items-center justify-center rounded ${isDarkBg ? 'text-white/80 hover:bg-white/20' : 'text-blue-800/60 hover:bg-blue-900/10'}`}
                                  >
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                    />
                                  </button>
                                ) : (
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <Search
                                      className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkBg ? 'text-white/80' : 'text-blue-600'}`}
                                    />
                                  </div>
                                )}
                                {isSintetica ? <strong>{acc.conta}</strong> : acc.conta}
                                {isSintetica && (
                                  <SortBtn
                                    active={balanceteSortConfigs[acc.conta]?.key === 'conta'}
                                    direction={balanceteSortConfigs[acc.conta]?.direction}
                                    onClick={() => handleBalanceteSort(acc.conta, 'conta')}
                                    dark={isDarkBg}
                                  />
                                )}
                              </div>
                            </td>
                            <td
                              className={`py-1.5 px-4 text-[0.92em] ${BC_ALIGN_TEXT[getColAlign('descricao', 'left')]} ${isDarkBg ? 'text-white' : isLevel5 ? 'text-black' : 'text-blue-950'}`}
                            >
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <div
                                    className={`w-full h-full cursor-context-menu flex items-center ${BC_ALIGN_JUSTIFY[getColAlign('descricao', 'left')]}`}
                                  >
                                    {acc.nome}
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-64">
                                  <ContextMenuLabel className="text-xs text-slate-500 uppercase">
                                    Configurar AV Base
                                  </ContextMenuLabel>
                                  <ContextMenuSeparator />
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>
                                      Relativa a Nível Superior
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                      <ContextMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setAvBase(acc.conta, 'parent')
                                        }}
                                      >
                                        Pai Imediato (Padrão)
                                      </ContextMenuItem>
                                      <ContextMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setAvBase(acc.conta, 'root')
                                        }}
                                      >
                                        Grupo Raiz (Nível 1)
                                      </ContextMenuItem>
                                      <ContextMenuSeparator />
                                      {(() => {
                                        const ancs = []
                                        let curr = accountParentMap[acc.conta]
                                        while (curr) {
                                          ancs.push(curr)
                                          curr = accountParentMap[curr]
                                        }
                                        if (ancs.length > 0) {
                                          return ancs.map((anc) => (
                                            <ContextMenuItem
                                              key={anc}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setAvBase(acc.conta, anc)
                                              }}
                                            >
                                              Nível {anc}
                                            </ContextMenuItem>
                                          ))
                                        }
                                        return null
                                      })()}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  <ContextMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setCustomBaseTargetAcc(acc.conta)
                                      setIsCustomBaseModalOpen(true)
                                    }}
                                  >
                                    Escolher Conta Única...
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setCustomMultiBaseTargetAcc(acc.conta)
                                      const existing = activeProfile.customAvBases?.[acc.conta]
                                      setCustomMultiBaseSelection(
                                        Array.isArray(existing) ? existing : [],
                                      )
                                      setIsCustomMultiBaseModalOpen(true)
                                    }}
                                  >
                                    Compor Base Manualmente...
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setAvBase(acc.conta, null)
                                    }}
                                    className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" /> Restaurar Padrão
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleRecorrente(acc.conta)
                                    }}
                                  >
                                    <CalendarClock className="w-4 h-4 mr-2 text-rose-600" />
                                    {recorrentesSet.has(acc.conta)
                                      ? 'Remover recorrência mensal'
                                      : 'Marcar como recorrência mensal'}
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            </td>
                            {periodsToDisplay.map((period: string) => {
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

                              // Só divergências (Opção 3): mascara os meses que não bateram alerta
                              const mesOculto = !periodoDiverge(acc, period)
                              // Recorrência mensal: conta marcada e mês sem movimento
                              const isAusente =
                                recorrentesSet.has(acc.conta) && semMovimento(acc, period)
                              // Lacuna geral: qualquer conta sem movimento — ativo quando "Lacunas" ou
                              // "Só ausências" estão ligados (no segundo caso, mostra contexto nas
                              // contas não-recorrentes que aparecem como pais de recorrentes)
                              const isLacuna =
                                (soLacunas || soAusencias) &&
                                !isAusente &&
                                acc.tipo !== 'S' &&
                                semMovimento(acc, period)

                              // Análise Horizontal
                              let ahContent: any = null
                              let ahAlertNode: any = null
                              const ahJustify =
                                BC_ALIGN_JUSTIFY[getColAlign(`${period}_ah`, 'right')]
                              let prevVal = 0
                              let prevPeriodLabel = ''
                              let hasValidPrev = false

                              if (
                                activeProfile.globalAhMode === 'base_period' &&
                                activeProfile.basePeriodForAh
                              ) {
                                const baseSld = acc.saldos[activeProfile.basePeriodForAh]
                                if (baseSld) {
                                  hasValidPrev = true
                                  prevPeriodLabel = activeProfile.basePeriodForAh
                                  const isResult =
                                    acc.natureza === '04' ||
                                    acc.natureza === '4' ||
                                    acc.conta.startsWith('3') ||
                                    acc.conta.startsWith('4') ||
                                    acc.conta.startsWith('5')
                                  if (!isAccumulated && isResult) {
                                    prevVal = Math.abs(
                                      getRawNumber(baseSld.debito) - getRawNumber(baseSld.credito),
                                    )
                                  } else {
                                    prevVal = Math.abs(getRawNumber(baseSld.sldFin))
                                  }
                                }
                              } else {
                                const originalIndex = monthlyData.periods.indexOf(period)
                                if (originalIndex > 0) {
                                  const prevPeriod = monthlyData.periods[originalIndex - 1]
                                  const prevSld = acc.saldos[prevPeriod]
                                  if (prevSld) {
                                    hasValidPrev = true
                                    prevPeriodLabel = prevPeriod
                                    const isResult =
                                      acc.natureza === '04' ||
                                      acc.natureza === '4' ||
                                      acc.conta.startsWith('3') ||
                                      acc.conta.startsWith('4') ||
                                      acc.conta.startsWith('5')
                                    if (!isAccumulated && isResult) {
                                      prevVal = Math.abs(
                                        getRawNumber(prevSld.debito) -
                                          getRawNumber(prevSld.credito),
                                      )
                                    } else {
                                      prevVal = Math.abs(getRawNumber(prevSld.sldFin))
                                    }
                                  }
                                }
                              }

                              if (hasValidPrev) {
                                if (prevVal > 0) {
                                  const ahPct = (rawVal / prevVal - 1) * 100
                                  const isPositive = ahPct > 0
                                  const isNegative = ahPct < 0

                                  const isDespesa =
                                    acc.conta.startsWith('4') ||
                                    acc.conta.startsWith('5') ||
                                    (acc.natureza === '04' &&
                                      !acc.nome.toUpperCase().includes('RECEITA'))
                                  const colorClass = isDespesa
                                    ? isPositive
                                      ? isDarkBg
                                        ? 'text-rose-400'
                                        : 'text-rose-600'
                                      : isNegative
                                        ? isDarkBg
                                          ? 'text-emerald-400'
                                          : 'text-emerald-600'
                                        : isDarkBg
                                          ? 'text-white/50'
                                          : 'text-blue-800/50'
                                    : isPositive
                                      ? isDarkBg
                                        ? 'text-emerald-400'
                                        : 'text-emerald-600'
                                      : isNegative
                                        ? isDarkBg
                                          ? 'text-rose-400'
                                          : 'text-rose-600'
                                        : isDarkBg
                                          ? 'text-white/50'
                                          : 'text-blue-800/50'

                                  const ahCond = effCondForAccountFn(activeProfile, 'ah', acc.conta, accountParentMap)
                                  const hasAlert = condDispara(ahPct, ahCond)
                                  const ahHasCustomRule = (activeProfile?.accountRules || []).some((r: any) => { let c = acc.conta; while(c){ if(r.conta===c && r.ahOp!=null) return true; c=accountParentMap?.[c] } return false })

                                  const ahCustomBadge = ahHasCustomRule ? (
                                    <UITooltip delayDuration={0}>
                                      <TooltipTrigger asChild>
                                        <span className={`text-[11px] font-bold cursor-help shrink-0 leading-none ${isDarkBg ? 'text-violet-300' : 'text-violet-500'}`}>✦</span>
                                      </TooltipTrigger>
                                      <TooltipContent className="p-2 text-xs shadow-xl z-50">Limiar de alerta customizado para esta conta/grupo</TooltipContent>
                                    </UITooltip>
                                  ) : null
                                  ahAlertNode = (hasAlert || ahHasCustomRule) ? (
                                    <span className="flex items-center gap-0.5">
                                      {hasAlert && <UITooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                          <AlertCircle
                                            className={`w-3.5 h-3.5 cursor-help shrink-0 ${isDarkBg ? 'text-amber-400' : 'text-amber-500'}`}
                                        />
                                      </TooltipTrigger>
                                        <TooltipContent className="max-w-[260px] p-2 text-xs shadow-xl z-50 whitespace-normal text-left">
                                          Atenção: a variação de {ahPct.toFixed(2)}% está{' '}
                                          {condTexto(ahCond)} — faixa de alerta configurada no perfil.
                                        </TooltipContent>
                                      </UITooltip>}
                                      {ahCustomBadge}
                                    </span>
                                  ) : null

                                  ahContent = (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                          <span
                                            onClick={(e) => e.stopPropagation()}
                                            className={`text-[0.9em] font-mono border-b border-dotted border-current cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
                                            title="Clique para ver a memória de cálculo"
                                          >
                                            {ahPct > 0 ? '+' : ''}
                                            {ahPct.toFixed(2)}%
                                          </span>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          side="top"
                                          align="end"
                                          className="w-80 p-4 text-sm z-[120]"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <h4 className="font-bold text-slate-800 mb-2 border-b pb-1 flex items-center gap-1.5">
                                            <BookOpen className="h-4 w-4 text-emerald-600" /> Memória
                                            de Cálculo (AH%)
                                          </h4>
                                          <div className="text-xs mb-3 pb-2 border-b border-slate-100">
                                            <span className="text-slate-500">Conta analisada:</span>
                                            <div className="font-medium text-slate-700 leading-snug mt-0.5">
                                              <span className="font-mono text-emerald-700">
                                                {acc.conta}
                                              </span>{' '}
                                              {acc.nome}
                                            </div>
                                          </div>
                                          <div className="space-y-2 mt-3">
                                            <div className="flex justify-between items-center text-xs">
                                              <span className="text-slate-500">
                                                Valor Atual ({periodLabel(period)}):
                                              </span>
                                              <span className="font-medium text-slate-700">
                                                {fmtBRL(rawVal)}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                              <span className="text-slate-500">
                                                Valor Anterior ({periodLabel(prevPeriodLabel)}):
                                              </span>
                                              <span className="font-medium text-slate-700">
                                                {fmtBRL(prevVal)}
                                              </span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-md border border-slate-100 mt-2 font-mono text-[10px] text-center text-slate-600 leading-tight">
                                              (({fmtBRL(rawVal)} - {fmtBRL(prevVal)}) / |
                                              {fmtBRL(prevVal)}|) × 100
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-bold pt-1 border-t mt-1">
                                              <span className="text-slate-700">Resultado:</span>
                                              <span
                                                className={
                                                  ahPct > 0
                                                    ? 'text-emerald-600'
                                                    : ahPct < 0
                                                      ? 'text-rose-600'
                                                      : 'text-slate-600'
                                                }
                                              >
                                                {ahPct > 0 ? '+' : ''}
                                                {ahPct.toFixed(2).replace('.', ',')}%
                                              </span>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                  )
                                } else if (rawVal > 0 && prevVal === 0) {
                                  ahContent = (
                                    <span
                                      className={`text-[0.9em] font-mono ${isDarkBg ? 'text-emerald-400' : 'text-emerald-600'}`}
                                      title="Análise Horizontal (vs Mês Anterior)"
                                    >
                                      N/A (Novo)
                                    </span>
                                  )
                                }
                              }

                              // Só divergências: mês sem alerta fica mascarado também no AH%
                              if (mesOculto) {
                                ahContent = (
                                  <span className={isDarkBg ? 'text-white/30' : 'text-blue-900/30'}>
                                    •••
                                  </span>
                                )
                                ahAlertNode = null
                              }

                              const ahLabel =
                                ahContent !== null
                                  ? wrapIdxCell(ahContent, ahAlertNode, ahJustify)
                                  : null

                              // Coluna Δ R$: diferença de valor vs período anterior
                              let deltaLabel: any = null
                              if (showAhDelta) {
                                if (hasValidPrev) {
                                  const dval = rawVal - prevVal
                                  const isDespesaD =
                                    acc.conta.startsWith('4') ||
                                    acc.conta.startsWith('5') ||
                                    (acc.natureza === '04' &&
                                      !acc.nome.toUpperCase().includes('RECEITA'))
                                  const dColor =
                                    dval > 0
                                      ? isDespesaD
                                        ? isDarkBg
                                          ? 'text-rose-300'
                                          : 'text-rose-600'
                                        : isDarkBg
                                          ? 'text-emerald-300'
                                          : 'text-emerald-600'
                                      : dval < 0
                                        ? isDespesaD
                                          ? isDarkBg
                                            ? 'text-emerald-300'
                                            : 'text-emerald-600'
                                          : isDarkBg
                                            ? 'text-rose-300'
                                            : 'text-rose-600'
                                        : isDarkBg
                                          ? 'text-white/40'
                                          : 'text-slate-400'
                                  deltaLabel = (
                                    <span
                                      className={`text-[0.9em] font-mono ${dColor}`}
                                      title="Variação em R$ vs período anterior"
                                    >
                                      {ocultarValores
                                        ? '•••'
                                        : `${dval > 0 ? '+' : ''}${fmtBRL(dval)}`}
                                    </span>
                                  )
                                } else {
                                  deltaLabel = (
                                    <span className={isDarkBg ? 'text-white/30' : 'text-blue-900/30'}>
                                      -
                                    </span>
                                  )
                                }
                              }

                              return (
                                <React.Fragment key={period}>
                                  {!soIndices && (
                                    <td
                                      className={`py-1.5 px-4 whitespace-nowrap border-l border-white/10 ${isAusente ? (isDarkBg ? 'bg-rose-500/20' : 'bg-rose-50') : isLacuna ? (isDarkBg ? 'bg-amber-500/20' : 'bg-amber-50') : ''} ${isDarkBg ? 'text-white' : isLevel5 ? 'text-black' : 'text-blue-950'}`}
                                    >
                                      <div className="flex items-center w-full gap-1">
                                        {isAusente && (
                                          <UITooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                              <CalendarOff
                                                className={`w-3.5 h-3.5 cursor-help shrink-0 ${isDarkBg ? 'text-rose-300' : 'text-rose-600'}`}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[260px] p-2 text-xs shadow-xl z-50 whitespace-normal text-left">
                                              Sem movimento neste mês — conta marcada como{' '}
                                              <strong>recorrência mensal</strong> (deveria ter
                                              lançamentos todo mês).
                                            </TooltipContent>
                                          </UITooltip>
                                        )}
                                        {!isAusente && isLacuna && (
                                          <UITooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                              <Activity
                                                className={`w-3.5 h-3.5 cursor-help shrink-0 ${isDarkBg ? 'text-amber-300' : 'text-amber-600'}`}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[260px] p-2 text-xs shadow-xl z-50 whitespace-normal text-left">
                                              Sem movimento neste mês (lacuna de movimentação).
                                            </TooltipContent>
                                          </UITooltip>
                                        )}
                                        <span
                                          className={`flex-1 ${BC_ALIGN_TEXT[getColAlign(period, 'right')]} ${displayVal === '0,00' ? (isDarkBg ? 'text-white/30' : 'text-blue-900/30') : ''}`}
                                        >
                                          {displayVal !== '0,00'
                                            ? ocultarValores
                                              ? '•••'
                                              : displayVal
                                            : '-'}
                                        </span>
                                        {!ocultarDC && (
                                          <span
                                            className={`w-5 shrink-0 pl-1 text-center text-[10px] border-l ${isDarkBg ? 'border-white/15' : 'border-slate-200'} ${displayInd === 'D' ? (isDarkBg ? 'text-blue-200' : 'text-blue-600') : displayInd === 'C' ? (isDarkBg ? 'text-red-200' : 'text-red-600') : ''}`}
                                          >
                                            {displayInd}
                                          </span>
                                        )}
                                        <span className="w-4 shrink-0 flex items-center justify-center">
                                          {isSintetica && (
                                            <SortBtn
                                              active={balanceteSortConfigs[acc.conta]?.key === period}
                                              direction={balanceteSortConfigs[acc.conta]?.direction}
                                              onClick={() => handleBalanceteSort(acc.conta, period)}
                                              dark={isDarkBg}
                                            />
                                          )}
                                        </span>
                                      </div>
                                    </td>
                                  )}
                                  {showAV && (
                                    <>
                                      <td
                                        className={`py-1.5 px-2 whitespace-nowrap border-l border-white/10 ${BC_ALIGN_TEXT[getColAlign(`${period}_av`, 'right')]} ${isDarkBg ? 'bg-black/10 text-white/80' : 'bg-black/[0.02] text-blue-900/70'}`}
                                      >
                                        {renderAvCell(
                                          acc,
                                          period,
                                          activeProfile,
                                          rawVal,
                                          isDarkBg,
                                          false,
                                          BC_ALIGN_JUSTIFY[getColAlign(`${period}_av`, 'right')],
                                        )}
                                      </td>
                                      {isComparingProfiles && (
                                        <td
                                          className={`py-1.5 px-2 whitespace-nowrap border-l border-white/10 ${BC_ALIGN_TEXT[getColAlign(`${period}_avp2`, 'right')]} ${isDarkBg ? 'bg-indigo-900/30 text-white/80' : 'bg-indigo-50/30 text-blue-900/70'}`}
                                        >
                                          {renderAvCell(
                                            acc,
                                            period,
                                            analysisProfiles.find((p) => p.id === compareProfileId),
                                            rawVal,
                                            isDarkBg,
                                            true,
                                            BC_ALIGN_JUSTIFY[getColAlign(`${period}_avp2`, 'right')],
                                          )}
                                        </td>
                                      )}
                                    </>
                                  )}
                                  {showAH && (
                                    <td
                                      className={`py-1.5 px-2 whitespace-nowrap border-l border-white/10 ${BC_ALIGN_TEXT[getColAlign(`${period}_ah`, 'right')]} ${isDarkBg ? 'bg-black/10 text-white/80' : 'bg-black/[0.02] text-blue-900/70'}`}
                                    >
                                      {ahLabel ||
                                        wrapIdxCell(
                                          <span
                                            className={
                                              isDarkBg ? 'text-white/30' : 'text-blue-900/30'
                                            }
                                          >
                                            -
                                          </span>,
                                          null,
                                          ahJustify,
                                        )}
                                    </td>
                                  )}
                                  {showAhDelta && (
                                    <td
                                      className={`py-1.5 px-2 whitespace-nowrap border-l border-white/10 ${BC_ALIGN_TEXT[getColAlign(`${period}_ahd`, 'right')]} ${isDarkBg ? 'bg-black/10 text-white/80' : 'bg-black/[0.02] text-blue-900/70'}`}
                                    >
                                      {deltaLabel}
                                    </td>
                                  )}
                                </React.Fragment>
                              )
                            })}
                            {!soIndices &&
                              (() => {
                                let accDisplayVal = '0,00'
                                let accDisplayInd = ''

                              const isResult =
                                acc.natureza === '04' ||
                                acc.natureza === '4' ||
                                acc.conta.startsWith('3') ||
                                acc.conta.startsWith('4') ||
                                acc.conta.startsWith('5')

                              if (isResult && !isAccumulated) {
                                let sumDeb = 0
                                let sumCred = 0
                                periodsToDisplay.forEach((period: string) => {
                                  const sld = acc.saldos[period]
                                  if (sld) {
                                    sumDeb += getRawNumber(sld.debito)
                                    sumCred += getRawNumber(sld.credito)
                                  }
                                })
                                const net = Math.abs(sumDeb - sumCred)
                                accDisplayVal = net.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                if (net > 0) {
                                  accDisplayInd =
                                    sumDeb > sumCred ? 'D' : sumCred > sumDeb ? 'C' : ''
                                }
                              } else {
                                if (periodsToDisplay.length > 0) {
                                  const lastPeriod = periodsToDisplay[periodsToDisplay.length - 1]
                                  const sld = acc.saldos[lastPeriod]
                                  if (sld) {
                                    const rawVal = Math.abs(getRawNumber(sld.sldFin))
                                    accDisplayVal = rawVal.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                    accDisplayInd = sld.indDcFin
                                  }
                                }
                              }

                              return (
                                <td
                                  className={`py-1.5 px-4 whitespace-nowrap border-l border-white/10 ${isDarkBg ? 'bg-white/10 text-white' : isLevel5 ? 'bg-black/[0.04] text-black' : 'bg-black/[0.04] text-blue-950'}`}
                                >
                                  <div className="flex items-center w-full gap-1">
                                    {accDisplayVal !== '0,00'
                                      ? (() => {
                                          const memo = getAcumuladoMemo(acc)
                                          return (
                                            <CalcMemoPopover
                                              title="Memória de Cálculo (Acumulado)"
                                              accent="text-indigo-600"
                                              conta={acc.conta}
                                              nome={acc.nome}
                                              lines={memo.lines}
                                              formula={memo.formula}
                                              resultado={memo.resultado}
                                            >
                                              <span
                                                onClick={(e) => e.stopPropagation()}
                                                className={`flex-1 cursor-pointer border-b border-dotted border-current hover:opacity-80 ${BC_ALIGN_TEXT[getColAlign('acumulado', 'right')]}`}
                                              >
                                                {ocultarValores ? '•••' : accDisplayVal}
                                              </span>
                                            </CalcMemoPopover>
                                          )
                                        })()
                                      : (
                                          <span
                                            className={`flex-1 ${BC_ALIGN_TEXT[getColAlign('acumulado', 'right')]} ${isDarkBg ? 'text-white/30' : 'text-blue-900/30'}`}
                                          >
                                            -
                                          </span>
                                        )}
                                    {!ocultarDC && (
                                      <span
                                        className={`w-5 shrink-0 pl-1 text-center text-[10px] border-l ${isDarkBg ? 'border-white/15' : 'border-slate-200'} ${accDisplayInd === 'D' ? (isDarkBg ? 'text-blue-200' : 'text-blue-600') : accDisplayInd === 'C' ? (isDarkBg ? 'text-red-200' : 'text-red-600') : ''}`}
                                      >
                                        {accDisplayInd}
                                      </span>
                                    )}
                                    <span className="w-4 shrink-0 flex items-center justify-center">
                                      {isSintetica && (
                                        <SortBtn
                                          active={balanceteSortConfigs[acc.conta]?.key === 'acumulado'}
                                          direction={balanceteSortConfigs[acc.conta]?.direction}
                                          onClick={() => handleBalanceteSort(acc.conta, 'acumulado')}
                                          dark={isDarkBg}
                                        />
                                      )}
                                    </span>
                                  </div>
                                </td>
                              )
                            })()}
                            {!soIndices &&
                              (() => {
                                const m = getBalanceteMedia(acc)
                                const mAlign = getColAlign('media', 'right')
                              const mStr =
                                m.val > 0
                                  ? m.val.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : '0,00'
                              return (
                                <td
                                  className={`py-1.5 px-4 whitespace-nowrap border-l border-white/10 ${isDarkBg ? 'bg-white/10 text-white' : isLevel5 ? 'bg-violet-50/50 text-black' : 'bg-violet-50/50 text-blue-950'}`}
                                >
                                  <div className="flex items-center w-full gap-1">
                                    {mStr !== '0,00'
                                      ? (() => {
                                          const memo = getMediaMemo(acc)
                                          return (
                                            <CalcMemoPopover
                                              title="Memória de Cálculo (Média)"
                                              accent="text-violet-600"
                                              conta={acc.conta}
                                              nome={acc.nome}
                                              lines={memo.lines}
                                              formula={memo.formula}
                                              resultado={memo.resultado}
                                            >
                                              <span
                                                onClick={(e) => e.stopPropagation()}
                                                className={`flex-1 cursor-pointer border-b border-dotted border-current hover:opacity-80 ${BC_ALIGN_TEXT[mAlign]}`}
                                              >
                                                {ocultarValores ? '•••' : mStr}
                                              </span>
                                            </CalcMemoPopover>
                                          )
                                        })()
                                      : (
                                          <span
                                            className={`flex-1 ${BC_ALIGN_TEXT[mAlign]} ${isDarkBg ? 'text-white/30' : 'text-blue-900/30'}`}
                                          >
                                            -
                                          </span>
                                        )}
                                    {!ocultarDC && (
                                      <span
                                        className={`w-5 shrink-0 pl-1 text-center text-[10px] border-l ${isDarkBg ? 'border-white/15' : 'border-slate-200'} ${m.ind === 'D' ? (isDarkBg ? 'text-blue-200' : 'text-blue-600') : m.ind === 'C' ? (isDarkBg ? 'text-red-200' : 'text-red-600') : ''}`}
                                      >
                                        {m.ind}
                                      </span>
                                    )}
                                    <span className="w-4 shrink-0 flex items-center justify-center">
                                      {isSintetica && (
                                        <SortBtn
                                          active={balanceteSortConfigs[acc.conta]?.key === 'media'}
                                          direction={balanceteSortConfigs[acc.conta]?.direction}
                                          onClick={() => handleBalanceteSort(acc.conta, 'media')}
                                          dark={isDarkBg}
                                        />
                                      )}
                                    </span>
                                  </div>
                                </td>
                              )
                            })()}
                            <td style={{ width: '100%' }} />
                          </tr>
                        )
                      })
                    })()}
                    {rowsToRender.length === 0 && (
                      <tr>
                        <td
                          colSpan={
                            periodsToDisplay.length *
                              ((soIndices ? 0 : 1) +
                                (showAV ? (isComparingProfiles ? 2 : 1) : 0) +
                                (showAH ? 1 : 0) +
                                (showAhDelta ? 1 : 0)) +
                            (soIndices ? 3 : 5)
                          }
                          className="p-12 text-center text-slate-500"
                        >
                          {soDivergencias
                            ? 'Nenhuma divergência encontrada para os limites de alerta do perfil.'
                            : soAusencias
                              ? 'Nenhuma ausência detectada nas contas marcadas como recorrentes.'
                              : soLacunas
                                ? 'Nenhuma lacuna de movimentação detectada no período selecionado.'
                                : 'Nenhuma conta encontrada ou selecionada no filtro.'}
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

      {/* --- MODAL DE AGRUPAMENTO DE DESPESAS (TOP 20) --- */}
      {isExpenseGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Layers className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Agrupar Despesas (Top 20)</h3>
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
                      Agrupamento (Top 20)
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

          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por histórico..."
                  value={razaoSearch}
                  onChange={(e) => setRazaoSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowRazaoFilters(!showRazaoFilters)}
                className={`p-2.5 border rounded-lg transition-colors flex items-center justify-center shrink-0 ${showRazaoFilters || razaoDateFrom || razaoDateTo || razaoValueMin || razaoValueMax || razaoIndDc !== 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title="Filtros Avançados"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={openRazaoAsPage}
                disabled={sortedRazaoTransactions.length === 0}
                className="p-2.5 border rounded-lg transition-colors flex items-center justify-center shrink-0 bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Abrir como página (nova aba) — imprimir / salvar PDF"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={enviarParaRazaoAvancado}
                className="px-3 py-2.5 border rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold whitespace-nowrap"
                title="Abrir esta conta no Razão Avançado, já com os filtros atuais"
              >
                <ListOrdered className="w-4 h-4" /> Razão Avançado
              </button>
            </div>

            {showRazaoFilters && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Período (Data)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={razaoDateFrom}
                        onChange={(e) => setRazaoDateFrom(e.target.value)}
                        className="h-9 text-sm bg-white"
                      />
                      <span className="text-slate-400 text-sm">até</span>
                      <Input
                        type="date"
                        value={razaoDateTo}
                        onChange={(e) => setRazaoDateTo(e.target.value)}
                        className="h-9 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Faixa de Valor (R$)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Mín"
                        value={razaoValueMin}
                        onChange={(e) => setRazaoValueMin(e.target.value)}
                        className="h-9 text-sm bg-white"
                        min="0"
                      />
                      <span className="text-slate-400 text-sm">-</span>
                      <Input
                        type="number"
                        placeholder="Máx"
                        value={razaoValueMax}
                        onChange={(e) => setRazaoValueMax(e.target.value)}
                        className="h-9 text-sm bg-white"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Classificação (D/C)
                    </label>
                    <select
                      value={razaoIndDc}
                      onChange={(e) => setRazaoIndDc(e.target.value)}
                      className="w-full h-9 text-sm border border-slate-200 rounded-md px-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="ALL">Todas as Naturezas</option>
                      <option value="D">Apenas Débitos (D)</option>
                      <option value="C">Apenas Créditos (C)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200/60">
                  <button
                    onClick={clearRazaoFilters}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3 h-3" /> Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {isLoadingRazao ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 text-sm font-medium">
                Buscando lançamentos detalhados...
              </p>
            </div>
          ) : razaoTransactions.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Débitos
                  </div>
                  <div className="text-sm font-black text-blue-600">{fmtBRL(razaoTotals.d)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Créditos
                  </div>
                  <div className="text-sm font-black text-rose-600">{fmtBRL(razaoTotals.c)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Saldo
                  </div>
                  <div
                    className={`text-sm font-black ${razaoTotals.saldo >= 0 ? 'text-blue-600' : 'text-rose-600'}`}
                  >
                    {fmtBRL(Math.abs(razaoTotals.saldo))} {razaoTotals.saldo >= 0 ? 'D' : 'C'}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Lançamentos
                  </div>
                  <div className="text-sm font-black text-slate-800">{razaoTotals.count}</div>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {razaoTransactions.length >= 2000 && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 font-medium">
                  Exibindo os <strong>2.000 lançamentos mais recentes</strong> do(s) período(s)
                  selecionado(s). Use os filtros (período, valor, histórico) ou selecione um período
                  menor para refinar a análise.
                </div>
              )}
              <Table>
                <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
                  <TableRow>
                    <TableHead
                      className="w-[120px] font-bold text-slate-500 uppercase text-[10px] tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSortRazao('data')}
                    >
                      <div className="flex items-center gap-1 select-none">
                        Data
                        {razaoSortConfig.key === 'data' ? (
                          razaoSortConfig.direction === 'asc' ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                      Histórico
                    </TableHead>
                    <TableHead
                      className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSortRazao('valor')}
                    >
                      <div className="flex items-center justify-end gap-1 select-none">
                        {razaoSortConfig.key === 'valor' ? (
                          razaoSortConfig.direction === 'asc' ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                        Valor
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {sortedRazaoTransactions.map((tx, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-slate-100/60 transition-colors even:bg-slate-50 odd:bg-white"
                    >
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
                          R$ {tx.valor}{' '}
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {tx.indDc}
                          </span>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedRazaoTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500 text-sm">
                        Nenhum lançamento encontrado para a sua busca.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </>
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

      <Dialog
        open={!!selectedExpenseTrend}
        onOpenChange={(open) => !open && setSelectedExpenseTrend(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">
              Evolução Mensal: {selectedExpenseTrend?.nome}
            </DialogTitle>
            <DialogDescription>
              Acompanhamento do histórico de saldos desta despesa ao longo de todos os períodos
              importados.
            </DialogDescription>
          </DialogHeader>

          <div className="h-[400px] w-full mt-4">
            {selectedExpenseTrendData && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedExpenseTrendData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    }
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-xl z-50">
                            <p className="font-bold text-slate-800 text-sm mb-1">
                              {payload[0].payload.period}
                            </p>
                            <p className="font-black text-indigo-600">
                              R${' '}
                              {Number(payload[0].value).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="valor" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40}>
                    {selectedExpenseTrendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#4f46e5" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- SHEET DE FILTRO DE CONTAS E PRESETS --- */}
      <Sheet open={isAccountFilterOpen} onOpenChange={setIsAccountFilterOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-slate-50"
        >
          <div className="p-6 border-b border-slate-200 bg-white">
            <SheetTitle className="text-xl font-black text-slate-800">
              Visualização Avançada
            </SheetTitle>
            <SheetDescription>
              Filtre as contas contábeis desejadas e salve como presets para análises rápidas.
            </SheetDescription>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <Tabs defaultValue="contas" className="flex-1 flex flex-col">
              <div className="px-6 pt-4 bg-white border-b border-slate-200">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="contas">Filtro de Contas</TabsTrigger>
                  <TabsTrigger value="presets">Preferências Salvas</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="contas" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                <div className="p-4 bg-white border-b border-slate-200 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar conta..."
                      value={accountFilterSearch}
                      onChange={(e) => setAccountFilterSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() =>
                        setSelectedMonthlyAccounts(monthlyData.allAccounts.map((a: any) => a.conta))
                      }
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Selecionar Todas
                    </button>
                    <button
                      onClick={() => setSelectedMonthlyAccounts([])}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Limpar Seleção
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white">
                  {monthlyData.allAccounts
                    .filter((a: any) => isAccountVisibleInTree(a.conta))
                    .filter(
                      (a: any) =>
                        !accountFilterSearch ||
                        a.conta.toLowerCase().includes(accountFilterSearch.toLowerCase()) ||
                        a.nome.toLowerCase().includes(accountFilterSearch.toLowerCase()),
                    )
                    .map((acc: any) => {
                      const isChecked = selectedMonthlyAccounts.includes(acc.conta)
                      const isSintetica = acc.tipo === 'S'
                      const isExpanded = expandedAccounts.has(acc.conta)
                      const indent = (parseInt(acc.nivel) - 1) * 16

                      return (
                        <div
                          key={acc.conta}
                          className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-lg group"
                          style={{ paddingLeft: `${indent + 8}px` }}
                        >
                          {isSintetica ? (
                            <button
                              onClick={() => toggleAccountExpand(acc.conta)}
                              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-slate-200 rounded"
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                              />
                            </button>
                          ) : (
                            <span className="w-5" />
                          )}
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleAccountSelection(acc.conta, isChecked)}
                            className="data-[state=checked]:bg-indigo-600 border-slate-300"
                          />
                          <span
                            className={`text-sm truncate cursor-pointer select-none ${isSintetica ? 'font-bold text-slate-800' : 'text-slate-600'}`}
                            onClick={() => toggleAccountSelection(acc.conta, isChecked)}
                          >
                            <span className="font-mono text-xs mr-2">{acc.conta}</span>
                            {acc.nome}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>

              <TabsContent value="presets" className="flex-1 overflow-y-auto p-6 m-0 bg-slate-50">
                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Salvar Visão Atual</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Salve os períodos e as contas que estão marcados agora para carregar facilmente
                    no futuro.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Custos Fixos"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSavePreset}
                      disabled={!newPresetName.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-3">Preferências Salvas</h4>
                {viewPresets.length > 0 ? (
                  <div className="space-y-3">
                    {viewPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group"
                      >
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">{preset.name}</h5>
                          <p className="text-xs text-slate-500 mt-1">
                            {preset.accounts.length} contas • {preset.periods.length} períodos
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyPreset(preset)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors"
                          >
                            Aplicar
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-white">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Nenhum preset salvo ainda.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* --- SHEET: RECORRÊNCIA MENSAL (marcar contas que devem ter movimento todo mês) --- */}
      <Sheet open={showRecorrenciaConfig} onOpenChange={setShowRecorrenciaConfig}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-slate-50"
        >
          <div className="p-6 border-b border-slate-200 bg-white">
            <SheetTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-rose-600" /> Recorrência Mensal
            </SheetTitle>
            <SheetDescription>
              Marque as contas que <strong>devem ter movimento todo mês</strong> (ex.: energia,
              água, aluguel). Quando um mês ficar sem lançamento, o balancete sinaliza como possível
              ausência.
            </SheetDescription>
          </div>

          <div className="border-b border-slate-200 bg-white flex gap-0">
            <button
              onClick={() => setRecorrenciaTabAtivo('editar')}
              className={`flex-1 px-4 py-3 text-sm font-bold transition-colors border-b-2 ${recorrenciaTabAtivo === 'editar' ? 'text-rose-700 border-rose-600 bg-rose-50' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
            >
              Editar
            </button>
            <button
              onClick={() => setRecorrenciaTabAtivo('presets')}
              className={`flex-1 px-4 py-3 text-sm font-bold transition-colors border-b-2 ${recorrenciaTabAtivo === 'presets' ? 'text-rose-700 border-rose-600 bg-rose-50' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
            >
              Preferências Salvas ({recorrenciaPresets.length})
            </button>
          </div>

          {recorrenciaTabAtivo === 'editar' ? (
            <>
              <div className="p-4 bg-white border-b border-slate-200 flex flex-col gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar conta..."
                    value={recorrenciaSearch}
                    onChange={(e) => setRecorrenciaSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">
                    {recorrentes.length} conta(s) marcada(s)
                  </span>
                  <div className="flex gap-2">
                    {recorrentes.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowSavePresetModal(true)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Salvar como preferência
                        </button>
                        <button
                          onClick={() => setRecorrentes([])}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800"
                        >
                          Limpar marcações
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white">
                {monthlyData.allAccounts
                  .filter((a: any) => isAccountVisibleInTree(a.conta))
                  .filter(
                    (a: any) =>
                      !recorrenciaSearch ||
                      a.conta.toLowerCase().includes(recorrenciaSearch.toLowerCase()) ||
                      a.nome.toLowerCase().includes(recorrenciaSearch.toLowerCase()),
                  )
                  .map((acc: any) => {
                    const isChecked = recorrentesSet.has(acc.conta)
                    const isSintetica = acc.tipo === 'S'
                    const isExpanded = expandedAccounts.has(acc.conta)
                    const indent = (parseInt(acc.nivel) - 1) * 16
                    return (
                      <div
                        key={acc.conta}
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-lg group"
                        style={{ paddingLeft: `${indent + 8}px` }}
                      >
                        {isSintetica ? (
                          <button
                            onClick={() => toggleAccountExpand(acc.conta)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-slate-200 rounded"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                            />
                          </button>
                        ) : (
                          <span className="w-5" />
                        )}
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleRecorrente(acc.conta)}
                          className="data-[state=checked]:bg-rose-600 border-slate-300"
                        />
                        <span
                          className={`text-sm truncate cursor-pointer select-none ${isSintetica ? 'font-bold text-slate-800' : 'text-slate-600'}`}
                          onClick={() => toggleRecorrente(acc.conta)}
                        >
                          <span className="font-mono text-xs mr-2">{acc.conta}</span>
                          {acc.nome}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 flex flex-col gap-3">
              {recorrenciaPresets.length > 0 ? (
                recorrenciaPresets.map((preset: any) => (
                  <div key={preset.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-rose-300 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{preset.nome}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{preset.contas.length} conta(s)</p>
                      </div>
                      <button
                        onClick={() => deleteRecorrenciaPreset(preset.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Deletar preferência"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadRecorrenciaPreset(preset.id)}
                        className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors"
                      >
                        Carregar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Nenhuma preferência salva ainda.</p>
                    <p className="text-xs text-slate-400 mt-2">Marque contas e clique em "Salvar como preferência"</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* --- MODAL: SALVAR PREFERÊNCIA DE RECORRÊNCIA --- */}
      <Dialog open={showSavePresetModal} onOpenChange={setShowSavePresetModal}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Salvar como Preferência</DialogTitle>
            <DialogDescription>
              Dê um nome a este conjunto de contas para reutilizá-lo depois.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              placeholder="Ex: Contas de Utilidades, Aluguel..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRecorrenciaPreset(presetName)
              }}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowSavePresetModal(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => saveRecorrenciaPreset(presetName)}
              disabled={!presetName.trim()}
              className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE STAGING (PREVIEW IMPORTAÇÃO) --- */}
      <Dialog
        open={isStagingModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelImport()
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Revisão de Importação
            </DialogTitle>
            <DialogDescription>
              Analisamos o arquivo SPED selecionado. Verifique o resumo abaixo antes de confirmar a
              gravação no banco de dados.
            </DialogDescription>
          </DialogHeader>

          {stagingPayload && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Empresa Identificada
                </h4>
                <p className="font-bold text-slate-800 text-lg">
                  {stagingPayload.info?.nome || 'N/A'}
                </p>
                <p className="font-mono text-slate-500 text-sm mt-1">
                  {stagingPayload.info?.cnpj || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Períodos Encontrados
                  </h4>
                  <div className="max-h-24 overflow-y-auto custom-scrollbar pr-2">
                    {Array.from(
                      new Set(stagingPayload.extractedData.map((d: any) => d.periodo)),
                    ).map((p: any) => (
                      <div key={p} className="text-sm font-medium text-slate-700 mb-1">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Volume de Dados
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 flex justify-between">
                      <span>Contas Analíticas:</span>
                      <span className="font-bold text-slate-800">
                        {
                          new Set(
                            stagingPayload.extractedData
                              .filter((d) => d.tipo !== 'S')
                              .map((d) => d.conta),
                          ).size
                        }
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 flex justify-between">
                      <span>Saldos Mensais:</span>
                      <span className="font-bold text-slate-800">
                        {stagingPayload.extractedData.length}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 flex justify-between">
                      <span>Lançamentos (I250):</span>
                      <span className="font-bold text-slate-800">
                        {stagingPayload.extractedTx.length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-amber-50/50 border-amber-200 mt-4">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <AlertTitle className="text-amber-800 font-bold text-sm">
                  Atenção à Duplicidade
                </AlertTitle>
                <AlertDescription className="text-amber-700/80 text-xs mt-1">
                  Ao confirmar, o sistema usará a lógica de atualização segura. Se estes períodos já
                  existirem para o CNPJ, os saldos serão atualizados com os novos valores.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={cancelImport}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmImport}
              className="px-6 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Confirmar Importação
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE AUDITORIA PÓS-IMPORTAÇÃO --- */}
      <Dialog
        open={isAuditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAuditModalOpen(false)
            setAuditResult(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Auditoria de Importação Pós-Processamento
            </DialogTitle>
            <DialogDescription>
              A importação foi finalizada. Veja abaixo o impacto exato dessa operação no seu banco
              de dados.
            </DialogDescription>
          </DialogHeader>

          {auditResult && (
            <div className="space-y-6 py-4">
              {auditResult.errors.length === 0 ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Processamento concluído com sucesso!</p>
                    <p className="text-xs opacity-90 mt-0.5">
                      Tempo total:{' '}
                      {((auditResult.endTime - auditResult.startTime) / 1000).toFixed(1)} segundos.
                      A validação de integridade não encontrou erros físicos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Processamento concluído com ressalvas.</p>
                    <ul className="text-xs opacity-90 mt-2 list-disc list-inside space-y-1">
                      {auditResult.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 w-full border-b border-slate-100 pb-2">
                    Contas
                  </h4>
                  <div className="flex justify-around w-full gap-2">
                    <div>
                      <p className="text-2xl font-black text-emerald-600">
                        {auditResult.accounts.new}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Novas</p>
                    </div>
                    <div className="w-px bg-slate-100 h-10"></div>
                    <div>
                      <p className="text-2xl font-black text-indigo-600">
                        {auditResult.accounts.updated}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Atualizadas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 w-full border-b border-slate-100 pb-2">
                    Saldos
                  </h4>
                  <div className="flex justify-around w-full gap-2">
                    <div>
                      <p className="text-2xl font-black text-emerald-600">
                        {auditResult.balances.new}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Novos</p>
                    </div>
                    <div className="w-px bg-slate-100 h-10"></div>
                    <div>
                      <p className="text-2xl font-black text-indigo-600">
                        {auditResult.balances.updated}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Atualizados</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 w-full border-b border-slate-100 pb-2">
                    Lançamentos (Tx)
                  </h4>
                  <div className="flex justify-around w-full gap-2">
                    <div>
                      <p className="text-2xl font-black text-emerald-600">
                        {auditResult.transactions.inserted}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Inseridos</p>
                    </div>
                    <div className="w-px bg-slate-100 h-10"></div>
                    <div>
                      <p className="text-2xl font-black text-rose-500">
                        {auditResult.transactions.deleted}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Limpos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAuditDetails(!showAuditDetails)}
                  className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Ver Detalhes Específicos e Diferenças SPED
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${showAuditDetails ? 'rotate-180' : ''}`}
                  />
                </button>

                {showAuditDetails && (
                  <div className="p-4 bg-white border-t border-slate-200">
                    {auditResult.spedDiff &&
                      (auditResult.spedDiff.periodChanged ||
                        auditResult.spedDiff.j100Changes.length > 0 ||
                        auditResult.spedDiff.j150Changes.length > 0) && (
                        <div className="mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                          <h5 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Diferenças Encontradas (Bloco J)
                          </h5>

                          {auditResult.spedDiff.periodChanged && (
                            <div className="mb-3">
                              <span className="text-xs font-bold text-indigo-700 block mb-1">
                                Período (J005):
                              </span>
                              <div className="text-xs text-slate-700">
                                De{' '}
                                <span className="line-through text-rose-500 mr-2">
                                  {auditResult.spedDiff.oldPeriod}
                                </span>
                                Para{' '}
                                <span className="font-bold text-emerald-600">
                                  {auditResult.spedDiff.newPeriod}
                                </span>
                              </div>
                            </div>
                          )}

                          {auditResult.spedDiff.j100Changes.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-bold text-indigo-700 block mb-1">
                                Balanço (J100 - Totais):
                              </span>
                              <ul className="text-[11px] font-mono bg-white border border-slate-200 rounded p-2 space-y-1 max-h-32 overflow-y-auto">
                                {auditResult.spedDiff.j100Changes.map(
                                  (change: string, i: number) => (
                                    <li
                                      key={i}
                                      className={
                                        change.startsWith('Novo')
                                          ? 'text-emerald-700'
                                          : 'text-rose-700'
                                      }
                                    >
                                      {change}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {auditResult.spedDiff.j150Changes.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-bold text-indigo-700 block mb-1">
                                DRE (J150 - Totais):
                              </span>
                              <ul className="text-[11px] font-mono bg-white border border-slate-200 rounded p-2 space-y-1 max-h-32 overflow-y-auto">
                                {auditResult.spedDiff.j150Changes.map(
                                  (change: string, i: number) => (
                                    <li
                                      key={i}
                                      className={
                                        change.startsWith('Novo')
                                          ? 'text-emerald-700'
                                          : 'text-rose-700'
                                      }
                                    >
                                      {change}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                    <p className="text-xs text-slate-500 mb-3">
                      Lógica aplicada: Upsert. Contas e Saldos novos foram inseridos. Os existentes
                      foram sobrescritos com os valores mais recentes do arquivo.
                    </p>
                    {auditResult.accounts.new > 0 && (
                      <div className="mb-4">
                        <h5 className="text-xs font-bold text-emerald-700 mb-2">
                          Amostra de Novas Contas Criadas:
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {auditResult.accounts.newDetails.slice(0, 20).map((accCode: string) => (
                            <span
                              key={accCode}
                              className="text-[10px] font-mono bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-1 rounded"
                            >
                              {accCode}
                            </span>
                          ))}
                          {auditResult.accounts.newDetails.length > 20 && (
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-1">
                              + {auditResult.accounts.newDetails.length - 20} contas...
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {auditResult.transactions.deleted > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-rose-700 mb-1">
                          Rotina de Limpeza de Transações:
                        </h5>
                        <p className="text-xs text-slate-600">
                          {auditResult.transactions.deleted} transações anteriores do mesmo período
                          foram permanentemente substituídas pelas{' '}
                          {auditResult.transactions.inserted} novas transações do arquivo,
                          garantindo que não haja duplicidade de lançamentos na tabela de Razão.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={exportAuditLog}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Baixar Log (CSV)
            </button>
            <button
              onClick={() => {
                setIsAuditModalOpen(false)
                setAuditResult(null)
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center"
            >
              Concluir e Ver Painel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileManagerOpen} onOpenChange={setIsProfileManagerOpen}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Gestor de Perfis de Análise</DialogTitle>
            <DialogDescription>
              Crie perfis personalizados para Análise Vertical e Horizontal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="border-r border-slate-100 pr-4 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Seus Perfis</h4>
              {analysisProfiles.map((p) => (
                <div
                  key={p.id}
                  className={`p-2 rounded-lg cursor-pointer text-sm font-medium transition-colors flex justify-between items-center group ${editingProfileId === p.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  onClick={() => setEditingProfileId(p.id)}
                >
                  <span className="truncate flex-1 min-w-0">{p.name}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 ml-1">
                    <button
                      title="Replicar perfil"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newId = `profile_${Date.now()}`
                        const clone = {
                          ...JSON.parse(JSON.stringify(p)),
                          id: newId,
                          name: `${p.name} (Cópia)`,
                        }
                        setAnalysisProfiles((prev) => [...prev, clone])
                        setEditingProfileId(newId)
                      }}
                      className="p-0.5 rounded text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {p.id !== 'default' && (
                      <button
                        title="Excluir perfil"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAnalysisProfiles((prev) => prev.filter((x) => x.id !== p.id))
                          if (editingProfileId === p.id) setEditingProfileId('default')
                          if (activeProfileId === p.id) setActiveProfileId('default')
                        }}
                        className="p-0.5 rounded text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newId = `profile_${Date.now()}`
                  setAnalysisProfiles((prev) => [
                    ...prev,
                    {
                      id: newId,
                      name: `Novo Perfil ${prev.length}`,
                      globalAvMode: 'default',
                      globalAhMode: 'previous',
                      customAvBases: {},
                      ahAlertThreshold: null,
                      avAlertThreshold: null,
                    },
                  ])
                  setEditingProfileId(newId)
                }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Criar Novo Perfil
              </button>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">
              {editingProfileId ? (
                (() => {
                  const profile = analysisProfiles.find((p) => p.id === editingProfileId)
                  if (!profile) return null

                  const updateProfile = (updates: Partial<AnalysisProfile>) => {
                    setAnalysisProfiles((prev) =>
                      prev.map((p) => (p.id === editingProfileId ? { ...p, ...updates } : p)),
                    )
                  }

                  return (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Nome do Perfil
                        </label>
                        <Input
                          value={profile.name}
                          onChange={(e) => updateProfile({ name: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Análise Vertical (Padrão Global)
                        </label>
                        <Select
                          value={profile.globalAvMode}
                          onValueChange={(val: any) => updateProfile({ globalAvMode: val })}
                        >
                          <SelectTrigger className="h-9 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              Padrão (Ativo Total / Receita Líquida)
                            </SelectItem>
                            <SelectItem value="receita_bruta">
                              Padrão (Ativo Total / Receita Bruta)
                            </SelectItem>
                            <SelectItem value="parent">Relativa à Conta Pai Imediata</SelectItem>
                            <SelectItem value="lowest_synthetic">Relativa Último Sub-Nível</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Análise Horizontal (Comparação)
                        </label>
                        <Select
                          value={profile.globalAhMode}
                          onValueChange={(val: any) => updateProfile({ globalAhMode: val })}
                        >
                          <SelectTrigger className="h-9 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="previous">Período Imediatamente Anterior</SelectItem>
                            <SelectItem value="base_period">Período Base Fixo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {profile.globalAhMode === 'base_period' && (
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                            Período Base para AH
                          </label>
                          <Select
                            value={profile.basePeriodForAh || ''}
                            onValueChange={(val) => updateProfile({ basePeriodForAh: val })}
                          >
                            <SelectTrigger className="h-9 bg-white">
                              <SelectValue placeholder="Selecione um período..." />
                            </SelectTrigger>
                            <SelectContent>
                              {monthlyData.periods.map((p: string) => (
                                <SelectItem key={p} value={p}>
                                  {p.split(' a ')[0].substring(3)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {(
                          [
                            { k: 'av' as const, titulo: 'Alerta de Desvio (AV%)' },
                            { k: 'ah' as const, titulo: 'Alerta de Desvio (AH%)' },
                          ] as const
                        ).map((cfg) => {
                          const c = effCond(profile, cfg.k) as any
                          const op = c.op || 'none'
                          const v1 = (profile as any)[`${cfg.k}AlertV1`] ?? c.v1 ?? ''
                          const v2 = (profile as any)[`${cfg.k}AlertV2`] ?? c.v2 ?? ''
                          const onV = (field: 'V1' | 'V2', e: any) => {
                            const x = e.target.value
                            if (x !== '' && !/^-?[\d.,]*$/.test(x)) return
                            updateProfile({ [`${cfg.k}Alert${field}`]: x === '' ? null : x } as any)
                          }
                          const setOp = (newOp: string) =>
                            updateProfile({
                              [`${cfg.k}AlertOp`]: newOp,
                              [`${cfg.k}AlertV1`]: newOp !== 'none' ? (c.v1 ?? null) : null,
                              [`${cfg.k}AlertV2`]: newOp !== 'none' ? (c.v2 ?? null) : null,
                              // limpa campos legados para que effCond retorne op:'none' de verdade
                              ...(newOp === 'none' ? {
                                [`${cfg.k}AlertMin`]: null,
                                [`${cfg.k}AlertMax`]: null,
                                [`${cfg.k}AlertMode`]: null,
                                [`${cfg.k}AlertThreshold`]: null,
                              } : {}),
                            } as any)
                          const oneVal = op === 'gt' || op === 'lt'
                          const twoVal = op === 'between' || op === 'outside'
                          return (
                            <div key={cfg.k}>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                {cfg.titulo}
                              </label>
                              <Select value={op} onValueChange={setOp}>
                                <SelectTrigger className="h-9 bg-white text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem alerta</SelectItem>
                                  <SelectItem value="gt">Maior que</SelectItem>
                                  <SelectItem value="lt">Menor que</SelectItem>
                                  <SelectItem value="between">Entre (dentro da faixa)</SelectItem>
                                  <SelectItem value="outside">Fora da faixa</SelectItem>
                                </SelectContent>
                              </Select>
                              {oneVal && (
                                <div className="relative mt-1.5">
                                  <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={v1}
                                    onChange={(e) => onV('V1', e)}
                                    placeholder={op === 'gt' ? 'ex.: 10' : 'ex.: -5'}
                                    className="h-9 pr-6 text-sm"
                                  />
                                  <Percent className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                              )}
                              {twoVal && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <div className="relative flex-1">
                                    <Input
                                      type="text"
                                      inputMode="decimal"
                                      value={v1}
                                      onChange={(e) => onV('V1', e)}
                                      placeholder="De"
                                      className="h-9 pr-6 text-sm"
                                    />
                                    <Percent className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                  </div>
                                  <span className="text-slate-400 text-xs">a</span>
                                  <div className="relative flex-1">
                                    <Input
                                      type="text"
                                      inputMode="decimal"
                                      value={v2}
                                      onChange={(e) => onV('V2', e)}
                                      placeholder="Até"
                                      className="h-9 pr-6 text-sm"
                                    />
                                    <Percent className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* ─── Regras de alerta por conta / grupo ───────────────── */}
                      {(() => {
                        const rules: any[] = profile.accountRules || []
                        const accounts = monthlyData.allAccounts || []
                        // build children map for the account tree
                        const treeChildrenMap: Record<string, any[]> = {}
                        accounts.forEach((a: any) => {
                          const par = accountParentMap?.[a.conta] ?? '__root__'
                          if (!treeChildrenMap[par]) treeChildrenMap[par] = []
                          treeChildrenMap[par].push(a)
                        })
                        const treeRoots: any[] = treeChildrenMap['__root__'] || []

                        const toggleTreeNode = (conta: string) =>
                          setRuleTreeExpanded(prev => {
                            const next = new Set(prev)
                            next.has(conta) ? next.delete(conta) : next.add(conta)
                            return next
                          })

                        const expandAllTree = () =>
                          setRuleTreeExpanded(new Set(
                            accounts.filter((a: any) => (treeChildrenMap[a.conta]?.length ?? 0) > 0).map((a: any) => a.conta)
                          ))

                        const collapseAllTree = () => setRuleTreeExpanded(new Set())

                        const treeFilter = ruleSearch.trim().toLowerCase()
                        const isMatchOrDescendant = (acc: any): boolean => {
                          if (!treeFilter) return true
                          if (acc.conta.toLowerCase().includes(treeFilter) || acc.nome.toLowerCase().includes(treeFilter)) return true
                          return (treeChildrenMap[acc.conta] || []).some(isMatchOrDescendant)
                        }

                        const toggleAcctSelection = (acc: any) => {
                          setRuleAccts(prev =>
                            prev.some((a: any) => a.conta === acc.conta)
                              ? prev.filter((a: any) => a.conta !== acc.conta)
                              : [...prev, acc]
                          )
                        }

                        const renderTreeNode = (acc: any, depth: number): any => {
                          if (!isMatchOrDescendant(acc)) return null
                          const children: any[] = treeChildrenMap[acc.conta] || []
                          const hasChildren = children.length > 0
                          const isExpanded = ruleTreeExpanded.has(acc.conta) || treeFilter.length > 0
                          const isSelected = ruleAccts.some((a: any) => a.conta === acc.conta)
                          // em modo edição, só a conta sendo editada pode ser reajustada
                          const alreadyHasRule = rules.some((r: any) => r.conta === acc.conta && r.id !== ruleEditId)
                          const isEditTarget = ruleEditId && rules.find((r: any) => r.id === ruleEditId)?.conta === acc.conta
                          return (
                            <div key={acc.conta}>
                              <div
                                style={{ paddingLeft: 6 + depth * 14 }}
                                onClick={() => {
                                  if (alreadyHasRule) return
                                  if (ruleEditId && !isEditTarget && !isSelected) return // em edição, não adiciona novas
                                  toggleAcctSelection(acc)
                                }}
                                className={`flex items-center gap-1 py-1 pr-2 rounded-lg transition-colors select-none ${alreadyHasRule ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'bg-indigo-100' : 'hover:bg-slate-50'}`}
                              >
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleTreeNode(acc.conta) }}
                                  className={`w-4 h-4 flex items-center justify-center shrink-0 rounded transition-colors ${hasChildren ? 'hover:bg-slate-200 cursor-pointer' : 'cursor-default'}`}
                                >
                                  {hasChildren
                                    ? <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isExpanded ? '' : '-rotate-90'}`} />
                                    : <span className="w-2 h-px bg-slate-200 block rounded" />}
                                </button>
                                {/* mini checkbox */}
                                <span className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'} ${alreadyHasRule ? 'opacity-0' : ''}`}>
                                  {isSelected && <span className="text-white text-[8px] font-bold leading-none">✓</span>}
                                </span>
                                <span className={`text-[11px] font-mono shrink-0 ${isSelected ? 'text-indigo-700 font-bold' : depth === 0 ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>{acc.conta}</span>
                                <span className={`text-[11px] truncate flex-1 ${isSelected ? 'text-indigo-800 font-semibold' : hasChildren ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>{acc.nome}</span>
                                {alreadyHasRule && <span className="text-[9px] text-indigo-400 font-bold shrink-0 bg-indigo-50 px-1 rounded">✓ regra</span>}
                              </div>
                              {isExpanded && hasChildren && children.map((child: any) => renderTreeNode(child, depth + 1))}
                            </div>
                          )
                        }

                        const buildRuleData = (id: string, acc: any) => ({
                          id,
                          conta: acc.conta,
                          nome: acc.nome,
                          avOp: ruleAvOp !== 'none' ? ruleAvOp : null,
                          avV1: ruleAvOp !== 'none' ? (ruleAvV1 || null) : null,
                          avV2: ruleAvOp !== 'none' ? (ruleAvV2 || null) : null,
                          ahOp: ruleAhOp !== 'none' ? ruleAhOp : null,
                          ahV1: ruleAhOp !== 'none' ? (ruleAhV1 || null) : null,
                          ahV2: ruleAhOp !== 'none' ? (ruleAhV2 || null) : null,
                        })

                        const addRule = () => {
                          if (ruleAccts.length === 0) return
                          if (ruleEditId) {
                            // editar: atualiza a regra existente com os novos valores
                            updateProfile({ accountRules: rules.map((r: any) => r.id === ruleEditId ? buildRuleData(ruleEditId, ruleAccts[0]) : r) } as any)
                          } else {
                            // multi-add: cria uma regra por conta selecionada (ignora duplicatas)
                            const newRules = ruleAccts
                              .filter((a: any) => !rules.find((r: any) => r.conta === a.conta))
                              .map((a: any) => buildRuleData(crypto.randomUUID(), a))
                            if (newRules.length === 0) return
                            updateProfile({ accountRules: [...rules, ...newRules] } as any)
                          }
                          resetRuleForm()
                        }

                        const editRule = (rule: any) => {
                          const acc = accounts.find((a: any) => a.conta === rule.conta) || { conta: rule.conta, nome: rule.nome }
                          setRuleAccts([acc])
                          setRuleAvOp(rule.avOp ?? 'none')
                          setRuleAvV1(rule.avV1 ?? '')
                          setRuleAvV2(rule.avV2 ?? '')
                          setRuleAhOp(rule.ahOp ?? 'none')
                          setRuleAhV1(rule.ahV1 ?? '')
                          setRuleAhV2(rule.ahV2 ?? '')
                          setRuleEditId(rule.id)
                        }

                        const deleteRule = (id: string) => {
                          updateProfile({ accountRules: rules.filter((r: any) => r.id !== id) } as any)
                          if (ruleEditId === id) resetRuleForm()
                        }

                        const OpSelect = ({ value, onChange, label }: any) => (
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">{label}</label>
                            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white">
                              <option value="none">Sem alerta (herda)</option>
                              <option value="gt">Maior que</option>
                              <option value="lt">Menor que</option>
                              <option value="between">Entre (dentro)</option>
                              <option value="outside">Fora da faixa</option>
                            </select>
                          </div>
                        )

                        return (
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block">Regras por Conta / Grupo</label>
                                <p className="text-[11px] text-slate-400">Limiar específico por conta, subgrupo ou nível — herança hierárquica automática.</p>
                              </div>
                            </div>

                            {/* Regras existentes */}
                            {rules.length > 0 && (
                              <div className="mb-3 flex flex-col gap-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                                {rules.map((rule: any) => {
                                  const accInfo = accounts.find((a: any) => a.conta === rule.conta)
                                  const isEditing = ruleEditId === rule.id
                                  return (
                                    <div key={rule.id} className={`flex items-center gap-2 border rounded-xl px-3 py-2 transition-colors ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {isEditing && <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full shrink-0">Editando</span>}
                                          <span className="text-[11px] font-mono font-bold text-indigo-700">{rule.conta}</span>
                                          <span className="text-[11px] text-slate-500 truncate">{accInfo?.nome || rule.nome}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                          {rule.avOp && <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">AV% {ruleCondTexto(rule.avOp, rule.avV1, rule.avV2)}</span>}
                                          {rule.ahOp && <span className="text-[10px] bg-violet-50 border border-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">AH% {ruleCondTexto(rule.ahOp, rule.ahV1, rule.ahV2)}</span>}
                                          {!rule.avOp && !rule.ahOp && <span className="text-[10px] text-slate-400 italic">herda perfil global</span>}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button onClick={() => isEditing ? resetRuleForm() : editRule(rule)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-amber-100 hover:bg-amber-200 text-amber-600' : 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-500'}`} title={isEditing ? 'Cancelar edição' : 'Editar regra'}>
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-slate-400 hover:text-rose-400" title="Excluir regra">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Formulário nova regra */}
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 flex flex-col gap-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">+ Nova regra</p>

                              {/* Plano de contas — tree picker */}
                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                {/* Toolbar da árvore */}
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border-b border-slate-100">
                                  <input
                                    value={ruleSearch}
                                    onChange={(e) => setRuleSearch(e.target.value)}
                                    placeholder="Filtrar..."
                                    className="flex-1 text-[11px] bg-transparent outline-none placeholder:text-slate-300 text-slate-600 min-w-0"
                                  />
                                  <button onClick={expandAllTree} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold whitespace-nowrap shrink-0 transition-colors">Expandir tudo</button>
                                  <span className="text-slate-200 text-xs">|</span>
                                  <button onClick={collapseAllTree} className="text-[10px] text-slate-400 hover:text-slate-600 font-medium whitespace-nowrap shrink-0 transition-colors">Recolher</button>
                                  {ruleAccts.length > 0 && (
                                    <>
                                      <span className="text-slate-200 text-xs">|</span>
                                      <button onClick={() => setRuleAccts([])} className="text-[10px] text-rose-400 hover:text-rose-600 font-medium whitespace-nowrap shrink-0">Limpar tudo</button>
                                    </>
                                  )}
                                </div>
                                {/* Chips de contas selecionadas */}
                                {ruleAccts.length > 0 && (
                                  <div className="flex flex-wrap gap-1 px-2.5 py-1.5 bg-indigo-50 border-b border-indigo-100">
                                    {ruleAccts.map((a: any) => (
                                      <span key={a.conta} className="flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                                        <span className="font-mono font-bold">{a.conta}</span>
                                        <span className="text-indigo-500 max-w-[80px] truncate hidden sm:inline">{a.nome}</span>
                                        {!ruleEditId && (
                                          <button onClick={() => setRuleAccts(prev => prev.filter((x: any) => x.conta !== a.conta))} className="text-indigo-300 hover:text-rose-500 ml-0.5 transition-colors leading-none font-bold">×</button>
                                        )}
                                      </span>
                                    ))}
                                    {!ruleEditId && ruleAccts.length > 1 && (
                                      <span className="text-[10px] text-indigo-400 self-center">{ruleAccts.length} contas</span>
                                    )}
                                  </div>
                                )}
                                {/* Árvore */}
                                <div className="overflow-y-auto custom-scrollbar py-1" style={{ maxHeight: 200 }}>
                                  {treeRoots.length === 0
                                    ? <p className="text-[11px] text-slate-400 text-center py-6">Nenhuma conta carregada</p>
                                    : treeRoots.map((acc: any) => renderTreeNode(acc, 0))
                                  }
                                </div>
                              </div>

                              {/* Condições AV% e AH% */}
                              <div className="flex gap-2">
                                <OpSelect label="AV%" value={ruleAvOp} onChange={setRuleAvOp} />
                                <OpSelect label="AH%" value={ruleAhOp} onChange={setRuleAhOp} />
                              </div>

                              {/* Valores AV% */}
                              {(ruleAvOp === 'gt' || ruleAvOp === 'lt') && (
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-slate-400 w-8">AV%</span>
                                  <div className="relative flex-1">
                                    <input type="text" inputMode="decimal" value={ruleAvV1} onChange={(e) => setRuleAvV1(e.target.value)} placeholder={ruleAvOp === 'gt' ? 'ex.: 80' : 'ex.: 5'} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-5 outline-none focus:ring-1 focus:ring-indigo-300" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                                  </div>
                                </div>
                              )}
                              {(ruleAvOp === 'between' || ruleAvOp === 'outside') && (
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-slate-400 w-8">AV%</span>
                                  <div className="relative flex-1"><input type="text" inputMode="decimal" value={ruleAvV1} onChange={(e) => setRuleAvV1(e.target.value)} placeholder="De" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-5 outline-none focus:ring-1 focus:ring-indigo-300" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span></div>
                                  <span className="text-[10px] text-slate-400">a</span>
                                  <div className="relative flex-1"><input type="text" inputMode="decimal" value={ruleAvV2} onChange={(e) => setRuleAvV2(e.target.value)} placeholder="Até" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-5 outline-none focus:ring-1 focus:ring-indigo-300" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span></div>
                                </div>
                              )}

                              {/* Valores AH% */}
                              {(ruleAhOp === 'gt' || ruleAhOp === 'lt') && (
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-slate-400 w-8">AH%</span>
                                  <div className="relative flex-1">
                                    <input type="text" inputMode="decimal" value={ruleAhV1} onChange={(e) => setRuleAhV1(e.target.value)} placeholder={ruleAhOp === 'gt' ? 'ex.: 20' : 'ex.: -10'} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-5 outline-none focus:ring-1 focus:ring-indigo-300" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                                  </div>
                                </div>
                              )}
                              {(ruleAhOp === 'between' || ruleAhOp === 'outside') && (
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-slate-400 w-8">AH%</span>
                                  <div className="relative flex-1"><input type="text" inputMode="decimal" value={ruleAhV1} onChange={(e) => setRuleAhV1(e.target.value)} placeholder="De" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-5 outline-none focus:ring-1 focus:ring-indigo-300" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span></div>
                                  <span className="text-[10px] text-slate-400">a</span>
                                  <div className="relative flex-1"><input type="text" inputMode="decimal" value={ruleAhV2} onChange={(e) => setRuleAhV2(e.target.value)} placeholder="Até" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-5 outline-none focus:ring-1 focus:ring-indigo-300" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span></div>
                                </div>
                              )}

                              <button
                                onClick={addRule}
                                disabled={ruleAccts.length === 0}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed self-end ${ruleEditId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                              >
                                {ruleEditId
                                  ? <><Edit2 className="w-3.5 h-3.5" /> Salvar alterações</>
                                  : <><Plus className="w-3.5 h-3.5" /> {ruleAccts.length > 1 ? `Adicionar ${ruleAccts.length} regras` : 'Adicionar regra'}</>}
                              </button>
                              {ruleEditId && (
                                <button onClick={resetRuleForm} className="self-end text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors">Cancelar</button>
                              )}
                            </div>
                          </div>
                        )
                      })()}

                      {Object.keys(profile.customAvBases || {}).length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                            Exceções de Base AV Customizadas
                          </label>
                          <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {Object.entries(profile.customAvBases).map(([acc, base]) => (
                              <div
                                key={acc}
                                className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-700">{acc}</span>
                                  <span className="mx-2 text-slate-400">→</span>
                                  <span className="text-indigo-600 font-medium">
                                    {Array.isArray(base)
                                      ? `Composição (${base.length} contas)`
                                      : base === 'parent'
                                        ? 'Conta Pai'
                                        : base === 'root'
                                          ? 'Conta Raiz'
                                          : base}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    const newBases = { ...profile.customAvBases }
                                    delete newBases[acc]
                                    updateProfile({ customAvBases: newBases })
                                  }}
                                  className="text-rose-500 hover:bg-rose-100 p-1 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                  Selecione um perfil para editar
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomMultiBaseModalOpen} onOpenChange={setIsCustomMultiBaseModalOpen}>
        <DialogContent className="sm:max-w-md bg-white max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Compor Base Manual</DialogTitle>
            <DialogDescription>
              Selecione as contas que serão somadas para formar o 100% da Análise Vertical de{' '}
              <strong className="text-indigo-600">{customMultiBaseTargetAcc}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex flex-col min-h-0 py-4">
            <div className="relative mb-4 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar conta..."
                value={customMultiBaseSearch}
                onChange={(e) => setCustomMultiBaseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-lg">
              {monthlyData.allAccounts
                .filter(
                  (a: any) =>
                    !customMultiBaseSearch ||
                    a.conta.includes(customMultiBaseSearch) ||
                    a.nome.toLowerCase().includes(customMultiBaseSearch.toLowerCase()),
                )
                .map((a: any) => {
                  const isSelected = customMultiBaseSelection.includes(a.conta)
                  return (
                    <label
                      key={a.conta}
                      className="flex items-start gap-3 px-3 py-2 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            setCustomMultiBaseSelection((prev) => [...prev, a.conta])
                          } else {
                            setCustomMultiBaseSelection((prev) => prev.filter((c) => c !== a.conta))
                          }
                        }}
                        className="mt-1 data-[state=checked]:bg-indigo-600 border-slate-300"
                      />
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {a.conta}
                        </span>
                        <span className="text-sm text-slate-800">{a.nome}</span>
                      </div>
                    </label>
                  )
                })}
            </div>
          </div>
          <div className="shrink-0 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                if (customMultiBaseTargetAcc) {
                  if (customMultiBaseSelection.length === 0) {
                    setAvBase(customMultiBaseTargetAcc, null)
                  } else {
                    setAvBase(customMultiBaseTargetAcc, customMultiBaseSelection)
                  }
                }
                setIsCustomMultiBaseModalOpen(false)
                setCustomMultiBaseTargetAcc(null)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md"
            >
              Salvar Composição ({customMultiBaseSelection.length})
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomBaseModalOpen} onOpenChange={setIsCustomBaseModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Selecionar Base para {customBaseTargetAcc}</DialogTitle>
            <DialogDescription>
              Escolha qual conta será usada como 100% na Análise Vertical desta linha.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar conta..."
                value={customBaseSearch}
                onChange={(e) => setCustomBaseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-100 rounded-lg">
              {monthlyData.allAccounts
                .filter(
                  (a: any) =>
                    !customBaseSearch ||
                    a.conta.includes(customBaseSearch) ||
                    a.nome.toLowerCase().includes(customBaseSearch.toLowerCase()),
                )
                .map((a: any) => (
                  <div
                    key={a.conta}
                    onClick={() => {
                      if (customBaseTargetAcc) {
                        setAvBase(customBaseTargetAcc, a.conta)
                      }
                      setIsCustomBaseModalOpen(false)
                      setCustomBaseTargetAcc(null)
                    }}
                    className="px-3 py-2 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex flex-col transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-slate-600">{a.conta}</span>
                    <span className="text-sm text-slate-800 truncate">{a.nome}</span>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!explodedAvContext}
        onOpenChange={(open) => !open && setExplodedAvContext(null)}
      >
        <DialogContent className="sm:max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
              <Layers className="w-5 h-5 text-indigo-600" /> Detalhamento da Base de Cálculo (AV%)
            </DialogTitle>
            <DialogDescription>
              Transparência total: veja exatamente como chegamos a este percentual.
            </DialogDescription>
          </DialogHeader>
          {explodedAvContext &&
            (() => {
              const profile =
                analysisProfiles.find((p) => p.id === explodedAvContext.profileId) || activeProfile
              const details = getBaseDetailsForAccount(
                explodedAvContext.acc,
                explodedAvContext.period,
                profile,
              )

              return (
                <div className="py-4 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Conta Analisada ({explodedAvContext.period})
                      </span>
                      <p className="font-mono text-xs text-slate-500 mb-1">
                        {explodedAvContext.acc.conta}
                      </p>
                      <p
                        className="font-bold text-slate-800 text-sm truncate"
                        title={explodedAvContext.acc.nome}
                      >
                        {explodedAvContext.acc.nome}
                      </p>
                      <p className="text-xl font-black text-indigo-600 mt-2">
                        R$ {formatCompact(explodedAvContext.rawVal)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-300">÷</span>
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Base de Cálculo (Denominador)
                      </span>
                      <p className="font-mono text-xs text-slate-500 mb-1">
                        Perfil: {profile.name}
                      </p>
                      <p className="font-bold text-slate-800 text-sm truncate" title={details.type}>
                        {details.type}
                      </p>
                      <p className="text-xl font-black text-indigo-600 mt-2">
                        R$ {formatCompact(details.totalValue)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-600 p-4 rounded-xl text-center shadow-md">
                    <span className="text-indigo-200 text-sm font-bold uppercase tracking-widest">
                      Resultado da Análise Vertical
                    </span>
                    <p className="text-4xl font-black text-white mt-1">
                      {explodedAvContext.avPct.toFixed(2)}%
                    </p>
                  </div>

                  {details.accounts && details.accounts.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 p-3 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                          Composição da Base
                        </h4>
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar p-0">
                        <table className="w-full text-left text-sm">
                          <tbody className="divide-y divide-slate-100">
                            {details.accounts.map((a: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-3 font-mono text-xs text-slate-500 w-28">
                                  {a.conta}
                                </td>
                                <td className="p-3 text-slate-700 truncate max-w-[200px]">
                                  {a.nome}
                                </td>
                                <td className="p-3 text-right font-bold text-slate-800">
                                  R$ {formatCompact(a.valor)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Visualização da Tabela (Balancete Comparativo) */
        .bc-viz-table[data-grid='on'] th,
        .bc-viz-table[data-grid='on'] td {
          border-width: var(--bc-gw, 1px) !important;
          border-style: solid !important;
          border-color: var(--bc-gl, #cbd5e1) !important;
        }
        .bc-viz-table[data-density='compact'] th,
        .bc-viz-table[data-density='compact'] td {
          padding-top: 2px !important;
          padding-bottom: 2px !important;
        }
        .bc-viz-table[data-density='comfortable'] th,
        .bc-viz-table[data-density='comfortable'] td {
          padding-top: 14px !important;
          padding-bottom: 14px !important;
        }
        /* Visualização da Tabela (DRE) */
        .dre-viz-table[data-grid='on'] th,
        .dre-viz-table[data-grid='on'] td {
          border-top-width: var(--dre-gw, 1px) !important;
          border-right-width: var(--dre-gw, 1px) !important;
          border-bottom-width: var(--dre-gw, 1px) !important;
          border-left-width: var(--dre-gw, 1px) !important;
          border-style: solid !important;
          border-color: var(--dre-gl, #cbd5e1) !important;
        }
        .dre-viz-table[data-density='compact'] th,
        .dre-viz-table[data-density='compact'] td {
          padding-top: 2px !important;
          padding-bottom: 2px !important;
        }
        .dre-viz-table[data-density='comfortable'] th,
        .dre-viz-table[data-density='comfortable'] td {
          padding-top: 14px !important;
          padding-bottom: 14px !important;
        }
      `,
        }}
      />

      {/* ─── CHECKLIST: botão global flutuante ─────────────────────────────── */}
      {(() => {
        const stats = clStats(activeChecklist)
        const colorKey = activeChecklist?.color || 'indigo'
        const cc = CL_COLOR_MAP[colorKey] || CL_COLOR_MAP.indigo
        const pending = activeChecklist ? stats.total - stats.done : 0
        return (
          <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 300 }}>
            <button
              onClick={() => setShowChecklistPanel((v) => !v)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl shadow-indigo-600/20 font-bold text-sm transition-all hover:scale-105 active:scale-95 ${showChecklistPanel ? 'bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              title="Abrir Roteiro / Checklist"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Roteiro</span>
              {pending > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black min-w-5 h-5 rounded-full flex items-center justify-center px-1 shadow-lg">
                  {pending > 99 ? '99+' : pending}
                </span>
              )}
              {activeChecklist && stats.total > 0 && stats.pct === 100 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">✓</span>
              )}
            </button>
          </div>
        )
      })()}

      {/* ─── CHECKLIST: painel flutuante arrastável ─────────────────────────── */}
      {showChecklistPanel && (() => {
        const cl = activeChecklist
        const stats = clStats(cl)
        const colorKey = cl?.color || 'indigo'
        const cc = CL_COLOR_MAP[colorKey] || CL_COLOR_MAP.indigo
        const isFloating = checklistPanelPos !== null
        return (
          <div
            ref={checklistPanelRef}
            style={isFloating
              ? { position: 'fixed', left: checklistPanelPos.x, top: checklistPanelPos.y, zIndex: 290, width: 380, maxWidth: '96vw' }
              : { position: 'fixed', bottom: 88, right: 28, zIndex: 290, width: 380, maxWidth: 'calc(100vw - 32px)' }
            }
            className={`rounded-2xl shadow-2xl border ${cc.border} ${cc.bg} flex flex-col overflow-hidden`}
          >
            {/* Header — drag handle */}
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 cursor-grab active:cursor-grabbing select-none border-b border-white/40"
              onMouseDown={startChecklistDrag}
              title="Arraste para mover"
            >
              <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-lg">{cl?.emoji || '📋'}</span>
              {/* Seletor de checklist */}
              <select
                value={activeChecklistId || ''}
                onChange={(e) => setActiveChecklistId(e.target.value || null)}
                onMouseDown={(e) => e.stopPropagation()}
                className={`flex-1 min-w-0 bg-transparent font-bold text-sm ${cc.text} border-none outline-none cursor-pointer truncate`}
              >
                {checklists.length === 0 && <option value="">Sem roteiros</option>}
                {checklists.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setChecklistPanelMinimized((v) => !v)}
                  className="p-1 rounded-lg hover:bg-white/60 transition-colors"
                  title={checklistPanelMinimized ? 'Expandir' : 'Minimizar'}
                >
                  <ChevronDown className={`w-4 h-4 ${cc.text} transition-transform ${checklistPanelMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => { setShowChecklistManager(true); setClEditId(cl?.id || null); setClManagerTab(cl ? 'edit' : 'templates') }}
                  className="p-1 rounded-lg hover:bg-white/60 transition-colors"
                  title="Gerenciar roteiros"
                >
                  <Settings className={`w-3.5 h-3.5 ${cc.text}`} />
                </button>
                <button
                  onClick={() => setShowChecklistPanel(false)}
                  className="p-1 rounded-lg hover:bg-white/60 transition-colors"
                  title="Fechar painel"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {!checklistPanelMinimized && (
              <>
                {/* Barra de progresso */}
                {cl && stats.total > 0 && (
                  <div className="px-3.5 pt-2.5 pb-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${cc.text}`}>{stats.done}/{stats.total} itens</span>
                      <span className={`text-xs font-black ${stats.pct === 100 ? 'text-emerald-600' : cc.text}`}>{stats.pct}%{stats.pct === 100 ? ' ✓' : ''}</span>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${stats.pct === 100 ? 'bg-emerald-500' : cc.bar}`} style={{ width: `${stats.pct}%` }} />
                    </div>
                  </div>
                )}

                {/* Seções e itens */}
                {cl ? (
                  <div className="overflow-y-auto flex-1 px-2 py-2 flex flex-col gap-2" style={{ maxHeight: 420 }}>
                    {cl.sections.length === 0 && (
                      <p className={`text-xs ${cc.text} text-center py-6 opacity-60`}>Nenhuma seção. Clique em ⚙ para editar.</p>
                    )}
                    {cl.sections.map((sec, si) => (
                      <div key={sec.id} className="bg-white/70 rounded-xl px-3 pt-2.5 pb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                          <span className={`${cc.text} mr-1`}>{si + 1}.</span>{sec.title}
                        </p>
                        {sec.items.length === 0 && (
                          <p className="text-[11px] text-slate-400 italic pb-1">Seção vazia</p>
                        )}
                        {sec.items.map((item, ii) => {
                          const noteOpen = clExpandedNotes[item.id]
                          // Pré-requisito efetivo: só prevalece se o item for obrigatório (não facultativo)
                          const isEffectivePrereq = (it) => it.isPrereq && it.required !== false
                          // Todos os itens anteriores que são pré-req efetivo e ainda não checados bloqueiam os seguintes
                          const locked = ii > 0 && sec.items.slice(0, ii).some((prev) => isEffectivePrereq(prev) && !prev.checked)
                          const itemNum = `${si + 1}.${ii + 1}`
                          return (
                            <div key={item.id} className={`mb-1.5 transition-opacity ${locked ? 'opacity-40' : ''}`}>
                              <div className="flex items-start gap-2">
                                {/* Número */}
                                <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5 w-6 text-right">{itemNum}</span>
                                {/* Checkbox ou cadeado */}
                                {locked ? (
                                  <div className="mt-0.5 w-4 h-4 rounded shrink-0 border-2 border-slate-200 bg-slate-50 flex items-center justify-center" title="Aguardando item anterior (pré-requisito)">
                                    <svg className="w-2.5 h-2.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => toggleCheckItem(cl.id, sec.id, item.id)}
                                    className={`mt-0.5 w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all ${item.checked ? `${cc.badge} border-transparent` : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                                  >
                                    {item.checked && <Check className="w-2.5 h-2.5 text-white" />}
                                  </button>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className={`text-xs leading-snug transition-all ${item.checked ? 'line-through text-slate-400' : locked ? 'text-slate-400' : 'text-slate-700'}`}>
                                    {item.text}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    {!item.required && (
                                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">facultativo</span>
                                    )}
                                    {/* Pré-req só prevalece se for obrigatório */}
                                    {item.isPrereq && item.required !== false && !item.checked && (
                                      <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">🔒 pré-req dos seguintes</span>
                                    )}
                                    {item.isPrereq && item.required !== false && item.checked && (
                                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">✓ pré-req concluído</span>
                                    )}
                                    {/* Facultativo com pré-req: avisa que o bloqueio está inativo */}
                                    {item.isPrereq && item.required === false && (
                                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">pré-req inativo (facultativo)</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setClExpandedNotes((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                                  className="shrink-0 p-0.5 rounded hover:bg-white transition-colors"
                                  title={item.note ? 'Ver/editar nota' : 'Adicionar nota'}
                                >
                                  <StickyNote className={`w-3 h-3 ${item.note ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`} />
                                </button>
                              </div>
                              {noteOpen && (
                                <div className="mt-1 ml-8">
                                  <textarea
                                    value={item.note || ''}
                                    onChange={(e) => setCheckItemNote(cl.id, sec.id, item.id, e.target.value)}
                                    placeholder="Nota opcional..."
                                    rows={2}
                                    className="w-full text-[11px] text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 resize-none outline-none focus:ring-1 focus:ring-amber-300"
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 px-4">
                    <ClipboardList className="w-10 h-10 text-indigo-300" />
                    <p className="text-sm text-slate-500 text-center">Nenhum roteiro criado ainda.<br />Crie a partir de um template ou do zero.</p>
                    <button
                      onClick={() => { setShowChecklistManager(true); setClManagerTab('templates') }}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      + Criar Roteiro
                    </button>
                  </div>
                )}

                {/* Footer */}
                {cl && (
                  <div className="flex items-center gap-2 px-3 py-2 border-t border-white/40">
                    <button
                      onClick={() => resetChecklist(cl.id)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-white/60"
                      title="Desmarcar todos os itens"
                    >
                      <RotateCcw className="w-3 h-3" /> Resetar
                    </button>
                    {cl.lastReset && (
                      <span className="text-[10px] text-slate-400">último reset: {cl.lastReset}</span>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => { setShowChecklistManager(true); setClEditId(cl.id); setClManagerTab('edit') }}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-colors ${cc.btn}`}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })()}

      {/* ─── CHECKLIST: modal gestor completo ───────────────────────────────── */}
      <Dialog open={showChecklistManager} onOpenChange={setShowChecklistManager}>
        <DialogContent className="max-w-3xl w-full bg-white p-0 overflow-hidden" style={{ maxHeight: '90vh' }}>
          <div className="flex h-full" style={{ minHeight: 520 }}>
            {/* Sidebar */}
            <div className="w-56 shrink-0 bg-slate-50 border-r border-slate-100 flex flex-col">
              <div className="px-4 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-black text-slate-800 text-sm">Gestor de Roteiros</h2>
                </div>
                <p className="text-[11px] text-slate-400">Checklists para reuniões e processos</p>
              </div>
              {/* Tabs */}
              <div className="flex flex-col gap-0.5 px-2 pt-2">
                {[
                  { k: 'list', label: 'Meus Roteiros', icon: ListChecks },
                  { k: 'templates', label: 'Templates', icon: BookOpen },
                ].map(({ k, label, icon: Icon }) => (
                  <button
                    key={k}
                    onClick={() => setClManagerTab(k)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${clManagerTab === k ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
                {clEditId && (
                  <button
                    onClick={() => setClManagerTab('edit')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${clManagerTab === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar Roteiro
                  </button>
                )}
              </div>
              <div className="flex-1" />
              <div className="px-2 py-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    const id = createChecklist('Novo Roteiro', '📋', 'indigo')
                    setClEditId(id)
                    setClManagerTab('edit')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-200 border-dashed"
                >
                  <Plus className="w-3.5 h-3.5" /> Novo Roteiro
                </button>
              </div>
            </div>

            {/* Main */}
            <div className="flex-1 overflow-y-auto flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Tab: Meus Roteiros */}
              {clManagerTab === 'list' && (
                <div className="p-5 flex flex-col gap-3">
                  <h3 className="font-black text-slate-800 text-base">Meus Roteiros</h3>
                  {checklists.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <ClipboardList className="w-12 h-12 text-slate-200" />
                      <p className="text-sm text-slate-400 text-center">Nenhum roteiro criado.<br />Use templates para começar rapidamente.</p>
                      <button onClick={() => setClManagerTab('templates')} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Ver Templates
                      </button>
                    </div>
                  ) : (
                    checklists.map((cl) => {
                      const stats = clStats(cl)
                      const cc = CL_COLOR_MAP[cl.color] || CL_COLOR_MAP.indigo
                      const isActive = cl.id === activeChecklistId
                      return (
                        <div key={cl.id} className={`border rounded-2xl p-4 flex items-center gap-3 transition-all ${isActive ? `${cc.border} ${cc.bg}` : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                          <span className="text-2xl">{cl.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate ${isActive ? cc.text : 'text-slate-800'}`}>{cl.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${stats.pct === 100 ? 'bg-emerald-500' : cc.bar}`} style={{ width: `${stats.pct}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">{stats.done}/{stats.total}</span>
                            </div>
                            {cl.lastReset && <p className="text-[10px] text-slate-400 mt-0.5">último reset: {cl.lastReset}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isActive && (
                              <button onClick={() => { setActiveChecklistId(cl.id) }} className="text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors" title="Ativar este roteiro">
                                Ativar
                              </button>
                            )}
                            {isActive && <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Ativo</span>}
                            <button onClick={() => { setClEditId(cl.id); setClManagerTab('edit') }} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Editar">
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <button onClick={() => deleteChecklist(cl.id)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Excluir">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Tab: Templates */}
              {clManagerTab === 'templates' && (
                <div className="p-5 flex flex-col gap-3">
                  <div>
                    <h3 className="font-black text-slate-800 text-base">Templates prontos</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Crie um roteiro a partir de um modelo pré-definido</p>
                  </div>
                  {CHECKLIST_TEMPLATES.map((tpl) => {
                    const cc = CL_COLOR_MAP[tpl.color] || CL_COLOR_MAP.indigo
                    const totalItems = tpl.sections.reduce((a, s) => a + s.items.length, 0)
                    return (
                      <div key={tpl.name} className={`border ${cc.border} ${cc.bg} rounded-2xl p-4`}>
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{tpl.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${cc.text}`}>{tpl.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{tpl.sections.length} seções · {totalItems} itens</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {tpl.sections.map((s) => (
                                <span key={s.title} className="text-[10px] bg-white/70 border border-white/80 text-slate-600 px-2 py-0.5 rounded-full font-medium">{s.title}</span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const id = createChecklist(tpl.name, tpl.emoji, tpl.color, tpl)
                              setClEditId(id)
                              setClManagerTab('edit')
                            }}
                            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${cc.btn}`}
                          >
                            Usar template
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tab: Editar */}
              {clManagerTab === 'edit' && (() => {
                const cl = checklists.find((c) => c.id === clEditId)
                if (!cl) return (
                  <div className="flex items-center justify-center flex-1 p-8">
                    <p className="text-sm text-slate-400">Selecione um roteiro para editar.</p>
                  </div>
                )
                const cc = CL_COLOR_MAP[cl.color] || CL_COLOR_MAP.indigo
                return (
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <input
                          value={cl.name}
                          onChange={(e) => updateCL(cl.id, { name: e.target.value })}
                          className="w-full font-black text-slate-800 text-base bg-transparent border-b-2 border-slate-200 focus:border-indigo-400 outline-none pb-0.5"
                          placeholder="Nome do roteiro"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Criado em {cl.createdAt}</p>
                      </div>
                    </div>

                    {/* Emoji e Cor */}
                    <div className="flex flex-col gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ícone (clique para escolher)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['📊','📅','🔍','📈','📉','💰','🏦','📋','✅','⚡','🎯','📌','🗂️','💼','🔒','📣','🧾','🧮','🔎','📝'].map((em) => (
                            <button
                              key={em}
                              onClick={() => updateCL(cl.id, { emoji: em })}
                              className={`w-9 h-9 text-xl rounded-xl border-2 transition-all hover:scale-110 ${cl.emoji === em ? 'border-indigo-400 bg-indigo-50 scale-110' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                              title={em}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cor</label>
                        <div className="flex gap-1.5">
                          {CHECKLIST_COLORS.map((cor) => {
                            const c = CL_COLOR_MAP[cor]
                            return (
                              <button
                                key={cor}
                                onClick={() => updateCL(cl.id, { color: cor })}
                                className={`w-6 h-6 rounded-full ${c.dot} transition-all ${cl.color === cor ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                title={cor}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Seções e itens */}
                    <div className="flex flex-col gap-3">
                      {cl.sections.map((sec, si) => {
                        const isSecDragTarget = clDragTarget?.secId === sec.id
                        return (
                        <div key={sec.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                          {/* Cabeçalho da seção — drop zone para inserir no início */}
                          <div
                            className={`flex items-center gap-2 bg-slate-50 px-3 py-2 transition-colors ${isSecDragTarget && clDragTarget?.insertAfterItemId === null ? 'bg-indigo-50 border-b-2 border-indigo-400' : ''}`}
                            onDragOver={(e) => { if (!clDragItem) return; e.preventDefault(); setClDragTarget({ secId: sec.id, insertAfterItemId: null }) }}
                            onDrop={(e) => { e.preventDefault(); if (clDragItem) { moveItemDnD(cl.id, clDragItem.secId, clDragItem.itemId, sec.id, null); setClDragItem(null); setClDragTarget(null) } }}
                          >
                            <span className={`text-xs font-black ${cc.text} shrink-0`}>{si + 1}.</span>
                            <input
                              value={sec.title}
                              onChange={(e) => {
                                setChecklists((prev) => prev.map((c) => c.id !== cl.id ? c : {
                                  ...c,
                                  sections: c.sections.map((s) => s.id !== sec.id ? s : { ...s, title: e.target.value }),
                                }))
                              }}
                              className="flex-1 text-xs font-bold text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-slate-300"
                              placeholder="Nome da seção"
                            />
                            <button onClick={() => deleteCLSection(cl.id, sec.id)} className="p-1 rounded-lg hover:bg-rose-50 transition-colors" title="Remover seção">
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                          <div className="p-2 flex flex-col">
                            {sec.items.map((item, ii) => {
                              const isDragSource = clDragItem?.itemId === item.id
                              const isDropTarget = isSecDragTarget && clDragTarget?.insertAfterItemId === item.id
                              return (
                                <div key={item.id}>
                                  <div
                                    draggable
                                    onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setClDragItem({ clId: cl.id, secId: sec.id, itemId: item.id }) }}
                                    onDragEnd={() => { setClDragItem(null); setClDragTarget(null) }}
                                    onDragOver={(e) => { if (!clDragItem) return; e.preventDefault(); setClDragTarget({ secId: sec.id, insertAfterItemId: item.id }) }}
                                    onDrop={(e) => { e.preventDefault(); if (clDragItem) { moveItemDnD(cl.id, clDragItem.secId, clDragItem.itemId, sec.id, item.id); setClDragItem(null); setClDragTarget(null) } }}
                                    className={`rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/60 group px-2 py-1.5 transition-all ${isDragSource ? 'opacity-40' : ''}`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {/* Handle de drag */}
                                      <GripVertical className="w-3 h-3 text-slate-300 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                                      {/* Número automático */}
                                      <span className="text-[10px] font-mono text-slate-400 shrink-0 w-6 text-right">{si + 1}.{ii + 1}</span>
                                      <div className={`w-3.5 h-3.5 rounded-sm border-2 shrink-0 ${item.checked ? `${cc.badge} border-transparent` : 'border-slate-300'} flex items-center justify-center`}>
                                        {item.checked && <Check className="w-2 h-2 text-white" />}
                                      </div>
                                      <input
                                        value={item.text}
                                        onChange={(e) => {
                                          setChecklists((prev) => prev.map((c) => c.id !== cl.id ? c : {
                                            ...c,
                                            sections: c.sections.map((s) => s.id !== sec.id ? s : {
                                              ...s,
                                              items: s.items.map((it) => it.id !== item.id ? it : { ...it, text: e.target.value }),
                                            }),
                                          }))
                                        }}
                                        className="flex-1 text-xs text-slate-700 bg-transparent outline-none"
                                        placeholder="Descrição do item"
                                      />
                                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button disabled={ii === 0} onClick={() => moveCLItem(cl.id, sec.id, item.id, -1)} className="p-0.5 rounded disabled:opacity-20 hover:bg-slate-100" title="Mover para cima">
                                          <ArrowUp className="w-3 h-3 text-slate-400" />
                                        </button>
                                        <button disabled={ii === sec.items.length - 1} onClick={() => moveCLItem(cl.id, sec.id, item.id, 1)} className="p-0.5 rounded disabled:opacity-20 hover:bg-slate-100" title="Mover para baixo">
                                          <ArrowDown className="w-3 h-3 text-slate-400" />
                                        </button>
                                        <button onClick={() => deleteCLItem(cl.id, sec.id, item.id)} className="p-0.5 rounded hover:bg-rose-50" title="Excluir item">
                                          <X className="w-3 h-3 text-rose-400" />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Toggles: obrigatório / pré-requisito — sempre visíveis no hover */}
                                    <div className="flex items-center gap-2 mt-1 ml-9 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => updateCLItemProp(cl.id, sec.id, item.id, 'required', item.required === false ? true : false)}
                                        className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-all ${item.required !== false ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
                                        title="Alternar obrigatório / facultativo"
                                      >
                                        {item.required !== false ? '★ Obrigatório' : '◇ Facultativo'}
                                      </button>
                                      <button
                                        onClick={() => updateCLItemProp(cl.id, sec.id, item.id, 'isPrereq', !item.isPrereq)}
                                        className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-all ${item.isPrereq ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                        title="Bloqueia todos os itens seguintes até ser concluído"
                                      >
                                        🔒 Pré-req dos seguintes
                                      </button>
                                    </div>
                                  </div>
                                  {/* Linha indicadora de drop após este item */}
                                  {isDropTarget && (
                                    <div className="h-0.5 bg-indigo-400 rounded-full mx-2 my-0.5" />
                                  )}
                                </div>
                              )
                            })}
                            {/* Drop zone no final da seção */}
                            <div
                              className={`h-6 rounded-lg flex items-center justify-center transition-all mt-1 ${isSecDragTarget && clDragTarget?.insertAfterItemId === 'END' ? 'bg-indigo-50 border border-dashed border-indigo-300' : ''}`}
                              onDragOver={(e) => { if (!clDragItem) return; e.preventDefault(); setClDragTarget({ secId: sec.id, insertAfterItemId: 'END' }) }}
                              onDrop={(e) => { e.preventDefault(); if (clDragItem) { const lastId = sec.items[sec.items.length - 1]?.id || null; moveItemDnD(cl.id, clDragItem.secId, clDragItem.itemId, sec.id, lastId); setClDragItem(null); setClDragTarget(null) } }}
                            />
                            {/* Adicionar item */}
                            <div className="flex items-center gap-2 px-2 pt-1">
                              <input
                                value={clNewItemTexts[sec.id] || ''}
                                onChange={(e) => setClNewItemTexts((prev) => ({ ...prev, [sec.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && addCLItem(cl.id, sec.id, clNewItemTexts[sec.id] || '')}
                                placeholder="+ Adicionar item (Enter)"
                                className="flex-1 text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300"
                              />
                              <button
                                onClick={() => addCLItem(cl.id, sec.id, clNewItemTexts[sec.id] || '')}
                                className={`p-1.5 rounded-lg transition-colors ${cc.btn}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        )
                      })}
                    </div>

                    {/* Adicionar seção */}
                    <div className="flex items-center gap-2">
                      <input
                        value={clNewSectionTitle}
                        onChange={(e) => setClNewSectionTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCLSection(cl.id, clNewSectionTitle)}
                        placeholder="Nome da nova seção (Enter para adicionar)"
                        className="flex-1 text-xs border border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-300 text-slate-600"
                      />
                      <button
                        onClick={() => addCLSection(cl.id, clNewSectionTitle)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Seção
                      </button>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => { setActiveChecklistId(cl.id); setShowChecklistManager(false) }}
                        className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${cc.btn}`}
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Ativar e usar este roteiro
                      </button>
                      <button onClick={() => resetChecklist(cl.id)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-2 rounded-xl transition-colors hover:bg-slate-50">
                        <RotateCcw className="w-3 h-3" /> Resetar checks
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => { if (confirm('Excluir este roteiro?')) deleteChecklist(cl.id); setClManagerTab('list') }} className="p-2 rounded-xl hover:bg-rose-50 text-rose-400 transition-colors" title="Excluir roteiro">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      {isAdmin && <AdminUsersDialog open={showAdminUsers} onOpenChange={setShowAdminUsers} />}
      <RazaoAvancado
        open={showRazaoAvancado}
        onOpenChange={setShowRazaoAvancado}
        accounts={monthlyData.allAccounts}
        accountParentMap={accountParentMap}
        periods={monthlyData.periods}
        companyName={companyInfo?.nome}
        companyCnpj={companyInfo?.cnpj}
        initial={razaoAvancadoInitial}
      />
    </div>
  )
}
