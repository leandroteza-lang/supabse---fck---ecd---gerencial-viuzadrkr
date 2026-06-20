import { useState, useMemo, useEffect, useCallback, Fragment } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Search, ExternalLink, Play, ChevronRight, ChevronDown } from 'lucide-react'

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
const parsePt = (s: any) => parseFloat(String(s ?? '0').replace(/\./g, '').replace(',', '.')) || 0
const periodStartMs = (p: string) => {
  const d = (p || '').split(' a ')[0].split('/')
  if (d.length < 3) return 0
  return new Date(parseInt(d[2]), parseInt(d[1]) - 1, parseInt(d[0])).getTime()
}
const byCodeNum = (a: string, b: string) =>
  String(a).localeCompare(String(b), undefined, { numeric: true })
const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

interface AccountRow {
  conta: string
  nome: string
  tipo: string
  nivel: string
  saldos: Record<string, any>
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  accounts: AccountRow[]
  accountParentMap: Record<string, string>
  periods: string[]
  companyName?: string
  companyCnpj?: string
}

const PAGE = 500

export default function RazaoAvancado({
  open,
  onOpenChange,
  accounts,
  accountParentMap,
  periods,
  companyName,
  companyCnpj,
}: Props) {
  const { toast } = useToast()

  const [companyId, setCompanyId] = useState<string | null>(null)
  const [codeToId, setCodeToId] = useState<Record<string, string>>({})
  const [idToAcc, setIdToAcc] = useState<Record<string, { code: string; name: string }>>({})

  // Seleção de contas
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [accSearch, setAccSearch] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [codeFrom, setCodeFrom] = useState('')
  const [codeTo, setCodeTo] = useState('')

  // Filtros
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [valMin, setValMin] = useState('')
  const [valMax, setValMax] = useState('')
  const [indDc, setIndDc] = useState('ALL')

  // Opções
  const [totalConta, setTotalConta] = useState(true)
  const [totalMes, setTotalMes] = useState(false)
  const [totalDia, setTotalDia] = useState(false)
  const [ordem, setOrdem] = useState('codigo')
  const [mostrarContrapartida, setMostrarContrapartida] = useState(true)

  // Resultado
  const [loading, setLoading] = useState(false)
  const [lines, setLines] = useState<any[]>([])
  const [resumo, setResumo] = useState<any>(null)
  const [contraMap, setContraMap] = useState<Record<string, any[]>>({})
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [generated, setGenerated] = useState(false)

  const accountsByCode = useMemo(() => {
    const m: Record<string, AccountRow> = {}
    accounts.forEach((a) => (m[a.conta] = a))
    return m
  }, [accounts])

  const childrenMap = useMemo(() => {
    const m: Record<string, string[]> = {}
    accounts.forEach((a) => {
      const p = accountParentMap[a.conta]
      if (p) {
        if (!m[p]) m[p] = []
        m[p].push(a.conta)
      }
    })
    return m
  }, [accounts, accountParentMap])

  // Carrega o mapa código<->id (tabela accounts) ao abrir
  useEffect(() => {
    if (!open || !companyCnpj) return
    let active = true
    ;(async () => {
      const { data: comp } = await supabase
        .from('companies')
        .select('id')
        .eq('cnpj', companyCnpj)
        .maybeSingle()
      if (!active || !comp) return
      setCompanyId(comp.id)
      const { data: accs } = await supabase
        .from('accounts')
        .select('id, code, name')
        .eq('company_id', comp.id)
      if (!active) return
      const c2i: Record<string, string> = {}
      const i2a: Record<string, { code: string; name: string }> = {}
      ;(accs || []).forEach((a: any) => {
        c2i[a.code] = a.id
        i2a[a.id] = { code: a.code, name: a.name }
      })
      setCodeToId(c2i)
      setIdToAcc(i2a)
    })()
    return () => {
      active = false
    }
  }, [open, companyCnpj])

  const descendantsOf = useCallback(
    (code: string): string[] => {
      const out: string[] = []
      const stack = [...(childrenMap[code] || [])]
      while (stack.length) {
        const c = stack.pop() as string
        out.push(c)
        ;(childrenMap[c] || []).forEach((x) => stack.push(x))
      }
      return out
    },
    [childrenMap],
  )

  const toggleCode = (code: string, checked: boolean) => {
    const acc = accountsByCode[code]
    const codes = acc?.tipo === 'S' ? [code, ...descendantsOf(code)] : [code]
    setSelected((prev) => {
      const next = new Set(prev)
      codes.forEach((c) => (checked ? next.add(c) : next.delete(c)))
      return next
    })
  }

  const applyCodeRange = () => {
    if (!codeFrom && !codeTo) return
    setSelected((prev) => {
      const next = new Set(prev)
      accounts.forEach((a) => {
        const okFrom = !codeFrom || byCodeNum(a.conta, codeFrom) >= 0
        const okTo = !codeTo || byCodeNum(a.conta, codeTo) <= 0
        if (okFrom && okTo) next.add(a.conta)
      })
      return next
    })
  }

  const roots = useMemo(
    () =>
      accounts
        .filter((a) => !accountParentMap[a.conta])
        .sort((a, b) => byCodeNum(a.conta, b.conta)),
    [accounts, accountParentMap],
  )

  const toggleExpand = (code: string) =>
    setExpandedNodes((prev) => {
      const n = new Set(prev)
      if (n.has(code)) n.delete(code)
      else n.add(code)
      return n
    })
  const expandAll = () =>
    setExpandedNodes(new Set(accounts.filter((a) => a.tipo === 'S').map((a) => a.conta)))
  const collapseAll = () => setExpandedNodes(new Set())

  // Lista visível: árvore (raiz → filhos só quando expandido) ou plana na busca
  const visibleTree = useMemo(() => {
    const lower = accSearch.toLowerCase()
    if (lower) {
      return accounts
        .filter((a) => a.conta.toLowerCase().includes(lower) || a.nome.toLowerCase().includes(lower))
        .sort((a, b) => byCodeNum(a.conta, b.conta))
        .map((a) => ({
          acc: a,
          level: parseInt(a.nivel) || 1,
          hasChildren: (childrenMap[a.conta] || []).length > 0,
        }))
    }
    const out: { acc: AccountRow; level: number; hasChildren: boolean }[] = []
    const walk = (code: string) => {
      const acc = accountsByCode[code]
      if (!acc) return
      const kids = (childrenMap[code] || []).slice().sort(byCodeNum)
      out.push({ acc, level: parseInt(acc.nivel) || 1, hasChildren: kids.length > 0 })
      if (kids.length && expandedNodes.has(code)) kids.forEach(walk)
    }
    roots.forEach((r) => walk(r.conta))
    return out
  }, [accSearch, accounts, roots, childrenMap, accountsByCode, expandedNodes])

  // Saldo anterior (de balances/saldos do período inicial selecionado)
  const computeOpening = useCallback(
    (code: string) => {
      const acc = accountsByCode[code]
      if (!acc) return 0
      const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : 0
      const toMs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : Infinity
      const candidates = periods
        .filter((p) => {
          const ms = periodStartMs(p)
          return ms >= fromMs && ms <= toMs
        })
        .sort((a, b) => periodStartMs(a) - periodStartMs(b))
      const firstP = candidates[0] || periods.slice().sort((a, b) => periodStartMs(a) - periodStartMs(b))[0]
      const sld = acc.saldos?.[firstP]
      if (!sld) return 0
      const v = parsePt(sld.sldIni)
      return sld.indDcIni === 'C' ? -v : v
    },
    [accountsByCode, periods, dateFrom, dateTo],
  )

  const resolvedAccountIds = useMemo(() => {
    const ids: string[] = []
    selected.forEach((code) => {
      const acc = accountsByCode[code]
      if (acc && acc.tipo !== 'S' && codeToId[code]) ids.push(codeToId[code])
    })
    return Array.from(new Set(ids))
  }, [selected, accountsByCode, codeToId])

  const rpcParams = useCallback(
    () => ({
      p_company_id: companyId,
      p_account_ids: resolvedAccountIds,
      p_date_from: dateFrom || null,
      p_date_to: dateTo || null,
      p_val_min: valMin ? parseFloat(valMin) : null,
      p_val_max: valMax ? parseFloat(valMax) : null,
      p_ind: indDc,
    }),
    [companyId, resolvedAccountIds, dateFrom, dateTo, valMin, valMax, indDc],
  )

  const fetchContrapartidas = useCallback(
    async (rows: any[]) => {
      if (!mostrarContrapartida || !companyId) return {}
      const ids = Array.from(new Set(rows.map((r) => r.lancamento_id).filter(Boolean)))
      if (ids.length === 0) return {}
      const map: Record<string, any[]> = {}
      for (let i = 0; i < ids.length; i += 200) {
        const chunk = ids.slice(i, i + 200)
        const { data } = await supabase.rpc('razao_contrapartidas', {
          p_company_id: companyId,
          p_lancamento_ids: chunk,
        })
        ;(data || []).forEach((p: any) => {
          if (!map[p.lancamento_id]) map[p.lancamento_id] = []
          map[p.lancamento_id].push(p)
        })
      }
      return map
    },
    [mostrarContrapartida, companyId],
  )

  const gerar = async () => {
    if (!companyId) {
      toast({ variant: 'destructive', title: 'Empresa não identificada' })
      return
    }
    if (resolvedAccountIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selecione ao menos uma conta analítica',
        description: 'Marque contas (ou um grupo) e/ou aplique uma faixa de código.',
      })
      return
    }
    setLoading(true)
    setGenerated(true)
    try {
      const params = rpcParams()
      const [{ data: res, error: e1 }, { data: ln, error: e2 }] = await Promise.all([
        supabase.rpc('razao_resumo', params),
        supabase.rpc('razao_lancamentos', { ...params, p_limit: PAGE, p_offset: 0 }),
      ])
      if (e1) throw e1
      if (e2) throw e2
      const rows = ln || []
      setResumo(res || null)
      setLines(rows)
      setOffset(rows.length)
      setHasMore(rows.length === PAGE)
      setContraMap(await fetchContrapartidas(rows))
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao gerar razão', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const carregarMais = async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data: ln, error } = await supabase.rpc('razao_lancamentos', {
        ...rpcParams(),
        p_limit: PAGE,
        p_offset: offset,
      })
      if (error) throw error
      const rows = ln || []
      setLines((prev) => [...prev, ...rows])
      setOffset((prev) => prev + rows.length)
      setHasMore(rows.length === PAGE)
      const more = await fetchContrapartidas(rows)
      setContraMap((prev) => ({ ...prev, ...more }))
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar mais', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Contrapartida (texto) de uma linha
  const contrapartidaDe = useCallback(
    (line: any) => {
      if (!line.lancamento_id) return '—'
      const partidas = contraMap[line.lancamento_id]
      if (!partidas) return '—'
      const outras = partidas.filter(
        (p) => p.account_id !== line.account_id && p.indicator !== line.indicator,
      )
      if (outras.length === 0) return '—'
      const codes = Array.from(new Set(outras.map((p) => p.code)))
      if (codes.length === 1) return codes[0]
      return `${codes[0]} (+${codes.length - 1})`
    },
    [contraMap],
  )

  // Agrupa linhas por conta, ordena os grupos e calcula saldo corrente
  const grupos = useMemo(() => {
    const byAcc: Record<string, any[]> = {}
    lines.forEach((l) => {
      if (!byAcc[l.account_id]) byAcc[l.account_id] = []
      byAcc[l.account_id].push(l)
    })
    const arr = Object.entries(byAcc).map(([accountId, rows]) => {
      const code = rows[0]?.code || idToAcc[accountId]?.code || ''
      const name = rows[0]?.name || idToAcc[accountId]?.name || ''
      let saldo = computeOpening(code)
      const withSaldo = rows.map((r) => {
        saldo += r.indicator === 'D' ? Number(r.amount) : -Number(r.amount)
        return { ...r, saldoCorrente: saldo }
      })
      const conta = (resumo?.por_conta || []).find((c: any) => c.account_id === accountId)
      return {
        accountId,
        code,
        name,
        rows: withSaldo,
        debito: Number(conta?.debito || 0),
        credito: Number(conta?.credito || 0),
        qtd: Number(conta?.qtd || 0),
      }
    })
    arr.sort((a, b) => (ordem === 'descricao' ? a.name.localeCompare(b.name) : byCodeNum(a.code, b.code)))
    return arr
  }, [lines, idToAcc, computeOpening, resumo, ordem])

  const geral = resumo?.geral || { debito: 0, credito: 0, qtd: 0 }

  const abrirComoPagina = () => {
    const filtros: string[] = []
    if (dateFrom || dateTo) filtros.push(`Período ${dateFrom || '…'} a ${dateTo || '…'}`)
    if (valMin || valMax) filtros.push(`Valor ${valMin || '0'} a ${valMax || '∞'}`)
    if (indDc !== 'ALL') filtros.push(`Apenas ${indDc === 'D' ? 'Débitos' : 'Créditos'}`)

    const gruposHtml = grupos
      .map((g) => {
        const linhas = g.rows
          .map(
            (r: any) => `<tr>
            <td class="mono">${esc(r.dt ? String(r.dt).split('-').reverse().join('/') : '')}</td>
            <td>${esc(r.history)}</td>
            <td class="mono">${esc(contrapartidaDe(r))}</td>
            <td class="num">${r.indicator === 'D' ? fmtBRL(Number(r.amount)) : ''}</td>
            <td class="num">${r.indicator === 'C' ? fmtBRL(Number(r.amount)) : ''}</td>
            <td class="num">${fmtBRL(Math.abs(r.saldoCorrente))} ${r.saldoCorrente >= 0 ? 'D' : 'C'}</td>
          </tr>`,
          )
          .join('')
        const subtotal = totalConta
          ? `<tr class="sub"><td colspan="3">Subtotal — ${esc(g.code)} ${esc(g.name)}</td>
             <td class="num">${fmtBRL(g.debito)}</td><td class="num">${fmtBRL(g.credito)}</td>
             <td class="num">${fmtBRL(Math.abs(g.debito - g.credito))} ${g.debito - g.credito >= 0 ? 'D' : 'C'}</td></tr>`
          : ''
        return `<tr class="acc"><td colspan="6">${esc(g.code)} — ${esc(g.name)}</td></tr>${linhas}${subtotal}`
      })
      .join('')

    const mesHtml =
      totalMes && resumo?.por_mes?.length
        ? `<h3>Totais por mês</h3><table><thead><tr><th>Mês</th><th class="num">Débito</th><th class="num">Crédito</th></tr></thead><tbody>${resumo.por_mes
            .map(
              (m: any) =>
                `<tr><td class="mono">${esc(m.mes)}</td><td class="num">${fmtBRL(Number(m.debito))}</td><td class="num">${fmtBRL(Number(m.credito))}</td></tr>`,
            )
            .join('')}</tbody></table>`
        : ''
    const diaHtml =
      totalDia && resumo?.por_dia?.length
        ? `<h3>Totais por dia</h3><table><thead><tr><th>Dia</th><th class="num">Débito</th><th class="num">Crédito</th></tr></thead><tbody>${resumo.por_dia
            .map(
              (d: any) =>
                `<tr><td class="mono">${esc(String(d.dia).split('-').reverse().join('/'))}</td><td class="num">${fmtBRL(Number(d.debito))}</td><td class="num">${fmtBRL(Number(d.credito))}</td></tr>`,
            )
            .join('')}</tbody></table>`
        : ''

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Razão Avançado — ${esc(companyName || '')}</title>
<style>
  *{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:#f1f5f9;color:#0f172a}
  .wrap{max-width:1200px;margin:0 auto;padding:24px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
  .brand{font-weight:900;font-size:20px}.brand span{color:#4f46e5}
  .btn{background:#0f172a;color:#fff;border:0;padding:10px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,.04)}
  h1{font-size:22px;margin:0 0 4px}h3{margin:24px 0 6px;font-size:14px}
  .sub0{color:#64748b;font-size:13px;margin:0 0 4px}.chip{display:inline-block;background:#eef2ff;color:#4338ca;border:1px solid #e0e7ff;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;margin:2px 4px 2px 0}
  .meta{color:#94a3b8;font-size:12px;margin-top:8px}
  .tots{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}
  .tot{border:1px solid #e2e8f0;border-radius:12px;padding:14px}.tot .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:800}.tot .val{font-size:17px;font-weight:900;margin-top:4px}
  .d{color:#2563eb}.c{color:#e11d48}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
  thead th{text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.06em;color:#64748b;border-bottom:2px solid #e2e8f0;padding:8px}
  th.num,td.num{text-align:right}
  tbody td{padding:6px 8px;border-bottom:1px solid #f1f5f9}
  tr.acc td{background:#1e1b4b;color:#fff;font-weight:800;padding:8px}
  tr.sub td{background:#eef2ff;font-weight:800}
  .mono{font-family:ui-monospace,Menlo,Consolas,monospace;color:#475569}
  @media print{body{background:#fff}.btn{display:none}.card{box-shadow:none;border:0}.wrap{max-width:none;padding:0}}
</style></head><body><div class="wrap">
  <div class="topbar"><div class="brand">Board<span>ECD</span> — Razão Avançado</div>
  <button class="btn" onclick="window.print()">Imprimir / Salvar PDF</button></div>
  <div class="card">
    <h1>Razão Contábil</h1>
    <p class="sub0">${esc(companyName || '')}${companyCnpj ? ' • CNPJ ' + esc(companyCnpj) : ''}</p>
    <p class="sub0">${grupos.length} conta(s) • ${geral.qtd} lançamento(s)${lines.length < geral.qtd ? ` (exibindo ${lines.length})` : ''}</p>
    ${filtros.length ? `<div class="meta">${filtros.map((f) => `<span class="chip">${f}</span>`).join('')}</div>` : ''}
    <div class="meta">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
    <div class="tots">
      <div class="tot"><div class="lbl">Total Débitos</div><div class="val d">${fmtBRL(Number(geral.debito))}</div></div>
      <div class="tot"><div class="lbl">Total Créditos</div><div class="val c">${fmtBRL(Number(geral.credito))}</div></div>
      <div class="tot"><div class="lbl">Saldo</div><div class="val ${Number(geral.debito) - Number(geral.credito) >= 0 ? 'd' : 'c'}">${fmtBRL(Math.abs(Number(geral.debito) - Number(geral.credito)))} ${Number(geral.debito) - Number(geral.credito) >= 0 ? 'D' : 'C'}</div></div>
      <div class="tot"><div class="lbl">Lançamentos</div><div class="val">${geral.qtd}</div></div>
    </div>
    <table><thead><tr><th>Data</th><th>Histórico</th><th>Contrapartida</th><th class="num">Débito</th><th class="num">Crédito</th><th class="num">Saldo</th></tr></thead>
    <tbody>${gruposHtml}</tbody></table>
    ${mesHtml}${diaHtml}
  </div></div></body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      toast({ variant: 'destructive', title: 'Pop-up bloqueado', description: 'Permita pop-ups para abrir o relatório.' })
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  const saldoGeral = Number(geral.debito) - Number(geral.credito)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-slate-100">
          <DialogTitle className="text-xl font-black text-slate-800">Razão Avançado</DialogTitle>
          <DialogDescription>
            Selecione contas / grupos, período e opções. Totais sempre calculados no servidor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Coluna de configuração */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Contas / Grupos
              </Label>
              <div className="relative mt-1.5">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  placeholder="Buscar conta/código..."
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs gap-1.5 flex-wrap">
                <button
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                  onClick={() => setSelected(new Set(accounts.map((a) => a.conta)))}
                >
                  Selecionar todas
                </button>
                <button className="font-bold text-slate-500 hover:text-slate-800" onClick={expandAll}>
                  Expandir
                </button>
                <button className="font-bold text-slate-500 hover:text-slate-800" onClick={collapseAll}>
                  Recolher
                </button>
                <span className="text-slate-400">{selected.size} selec.</span>
                <button
                  className="font-bold text-slate-500 hover:text-rose-600"
                  onClick={() => setSelected(new Set())}
                >
                  Limpar
                </button>
              </div>
              <div className="mt-2 max-h-[260px] overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-1 bg-slate-50/50">
                {visibleTree.map(({ acc: a, level: lvl, hasChildren }) => (
                  <div
                    key={a.conta}
                    className="flex items-center gap-1 py-1 pr-1.5 rounded hover:bg-white text-xs"
                    style={{ paddingLeft: `${(lvl - 1) * 14 + 2}px` }}
                  >
                    {hasChildren ? (
                      <button
                        onClick={() => toggleExpand(a.conta)}
                        className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0"
                        title={expandedNodes.has(a.conta) ? 'Recolher' : 'Expandir'}
                      >
                        {expandedNodes.has(a.conta) || !!accSearch ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <span className="w-4 shrink-0" />
                    )}
                    <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                      <Checkbox
                        checked={selected.has(a.conta)}
                        onCheckedChange={(c) => toggleCode(a.conta, !!c)}
                      />
                      <span className="font-mono text-slate-500 shrink-0">{a.conta}</span>
                      <span
                        className={`truncate ${a.tipo === 'S' ? 'font-bold text-slate-700' : 'text-slate-600'}`}
                      >
                        {a.nome}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-1">
                  <Label className="text-[10px] text-slate-500">Cód. inicial</Label>
                  <Input value={codeFrom} onChange={(e) => setCodeFrom(e.target.value)} className="h-8 text-xs" placeholder="ex.: 4.1" />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-slate-500">Cód. final</Label>
                  <Input value={codeTo} onChange={(e) => setCodeTo(e.target.value)} className="h-8 text-xs" placeholder="ex.: 4.9" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={applyCodeRange}>
                  Aplicar faixa
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-slate-500 uppercase">Data inicial</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 uppercase">Data final</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 uppercase">Valor mín.</Label>
                <Input type="number" value={valMin} onChange={(e) => setValMin(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 uppercase">Valor máx.</Label>
                <Input type="number" value={valMax} onChange={(e) => setValMax(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-slate-500 uppercase">Classificação (D/C)</Label>
              <Select value={indDc} onValueChange={setIndDc}>
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="D">Apenas Débitos</SelectItem>
                  <SelectItem value="C">Apenas Créditos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] text-slate-500 uppercase">Ordem das contas</Label>
              <Select value={ordem} onValueChange={setOrdem}>
                <SelectTrigger className="h-8 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codigo">Código / Classificação</SelectItem>
                  <SelectItem value="descricao">Descrição</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={totalConta} onCheckedChange={(c) => setTotalConta(!!c)} /> Totalizar por conta
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={totalMes} onCheckedChange={(c) => setTotalMes(!!c)} /> Totalizar por mês
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={totalDia} onCheckedChange={(c) => setTotalDia(!!c)} /> Totalizar por dia
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={mostrarContrapartida} onCheckedChange={(c) => setMostrarContrapartida(!!c)} /> Mostrar contrapartida
              </label>
            </div>

            <Button onClick={gerar} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Play className="w-4 h-4 mr-2" /> Gerar Razão</>)}
            </Button>
          </div>

          {/* Coluna de resultado */}
          <div className="min-w-0">
            {!generated ? (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl p-12">
                Configure os filtros à esquerda e clique em <strong className="mx-1">Gerar Razão</strong>.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Débitos</div>
                      <div className="text-sm font-black text-blue-600">{fmtBRL(Number(geral.debito))}</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Créditos</div>
                      <div className="text-sm font-black text-rose-600">{fmtBRL(Number(geral.credito))}</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Saldo</div>
                      <div className={`text-sm font-black ${saldoGeral >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {fmtBRL(Math.abs(saldoGeral))} {saldoGeral >= 0 ? 'D' : 'C'}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Lançamentos</div>
                      <div className="text-sm font-black text-slate-800">{geral.qtd}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={abrirComoPagina}
                    disabled={loading || grupos.length === 0}
                    title="Abrir como página / PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {loading && lines.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                  </div>
                ) : grupos.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-12 border border-dashed border-slate-200 rounded-xl">
                    Nenhum lançamento encontrado para os filtros.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="max-h-[48vh] overflow-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-[13px]">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                            <th className="py-2 px-3 text-left">Data</th>
                            <th className="py-2 px-3 text-left">Histórico</th>
                            {mostrarContrapartida && <th className="py-2 px-3 text-left">Contrapartida</th>}
                            <th className="py-2 px-3 text-right">Débito</th>
                            <th className="py-2 px-3 text-right">Crédito</th>
                            <th className="py-2 px-3 text-right">Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupos.map((g) => {
                            const cols = mostrarContrapartida ? 6 : 5
                            const sub = g.debito - g.credito
                            return (
                              <Fragment key={g.accountId}>
                                <tr className="bg-indigo-950 text-white">
                                  <td colSpan={cols} className="py-1.5 px-3 font-bold">
                                    <span className="font-mono">{g.code}</span> — {g.name}
                                  </td>
                                </tr>
                                {g.rows.map((r: any, i: number) => (
                                  <tr key={i} className="border-b border-slate-100 even:bg-slate-50/50">
                                    <td className="py-1.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                      {r.dt ? String(r.dt).split('-').reverse().join('/') : ''}
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-700">{r.history}</td>
                                    {mostrarContrapartida && (
                                      <td className="py-1.5 px-3 font-mono text-[11px] text-indigo-600">
                                        {contrapartidaDe(r)}
                                      </td>
                                    )}
                                    <td className="py-1.5 px-3 text-right font-medium text-blue-700 whitespace-nowrap">
                                      {r.indicator === 'D' ? fmtBRL(Number(r.amount)) : ''}
                                    </td>
                                    <td className="py-1.5 px-3 text-right font-medium text-rose-700 whitespace-nowrap">
                                      {r.indicator === 'C' ? fmtBRL(Number(r.amount)) : ''}
                                    </td>
                                    <td className="py-1.5 px-3 text-right font-bold whitespace-nowrap text-slate-700">
                                      {fmtBRL(Math.abs(r.saldoCorrente))} {r.saldoCorrente >= 0 ? 'D' : 'C'}
                                    </td>
                                  </tr>
                                ))}
                                {totalConta && (
                                  <tr className="bg-indigo-50 font-bold text-slate-700">
                                    <td colSpan={cols - 3} className="py-1.5 px-3 text-right">
                                      Subtotal {g.code}:
                                    </td>
                                    <td className="py-1.5 px-3 text-right text-blue-700">{fmtBRL(g.debito)}</td>
                                    <td className="py-1.5 px-3 text-right text-rose-700">{fmtBRL(g.credito)}</td>
                                    <td className="py-1.5 px-3 text-right">
                                      {fmtBRL(Math.abs(sub))} {sub >= 0 ? 'D' : 'C'}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {hasMore && (
                      <div className="p-2 border-t border-slate-100 text-center">
                        <Button variant="ghost" size="sm" onClick={carregarMais} disabled={loading}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Carregar mais (${offset} de ${geral.qtd})`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {(totalMes || totalDia) && resumo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {totalMes && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Totais por mês
                        </div>
                        <div className="max-h-48 overflow-auto custom-scrollbar">
                          <table className="w-full text-[12px]">
                            <tbody>
                              {(resumo.por_mes || []).map((m: any) => (
                                <tr key={m.mes} className="border-b border-slate-100">
                                  <td className="py-1.5 px-3 font-mono text-slate-500">{m.mes}</td>
                                  <td className="py-1.5 px-3 text-right text-blue-700">{fmtBRL(Number(m.debito))}</td>
                                  <td className="py-1.5 px-3 text-right text-rose-700">{fmtBRL(Number(m.credito))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {totalDia && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Totais por dia
                        </div>
                        <div className="max-h-48 overflow-auto custom-scrollbar">
                          <table className="w-full text-[12px]">
                            <tbody>
                              {(resumo.por_dia || []).map((d: any) => (
                                <tr key={d.dia} className="border-b border-slate-100">
                                  <td className="py-1.5 px-3 font-mono text-slate-500">
                                    {String(d.dia).split('-').reverse().join('/')}
                                  </td>
                                  <td className="py-1.5 px-3 text-right text-blue-700">{fmtBRL(Number(d.debito))}</td>
                                  <td className="py-1.5 px-3 text-right text-rose-700">{fmtBRL(Number(d.credito))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
