export type ColKind = 'text' | 'num' | 'ind' | 'pct'

export interface ExportColumn {
  label: string
  kind: ColKind
  indent?: boolean // coluna Descrição: indenta por nível (visual de árvore)
}
export interface ExportCell {
  text: string
  value?: number // para colunas numéricas (XLSX usa o número real)
}
export interface ExportRow {
  level: number
  isSintetica: boolean
  cells: ExportCell[]
}
export interface ExportData {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  rows: ExportRow[]
}

// Cores por nível, espelhando a tabela na tela
const LEVEL = (lvl: number) => {
  switch (lvl) {
    case 1:
      return { bg: '1E1B4B', fg: 'FFFFFF', bold: true } // indigo-950
    case 2:
      return { bg: '1E40AF', fg: 'FFFFFF', bold: true } // blue-800
    case 3:
      return { bg: '3B82F6', fg: 'FFFFFF', bold: false } // blue-500
    case 4:
      return { bg: 'BFDBFE', fg: '172554', bold: false } // blue-200
    case 5:
      return { bg: 'EFF6FF', fg: '000000', bold: false } // blue-50
    default:
      return { bg: 'EFF6FF', fg: '1E3A8A', bold: false } // blue-50 / blue-900
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

const escCsv = (s: string) => (/[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)

export function exportCsv(data: ExportData) {
  let out = data.columns.map((c) => escCsv(c.label)).join(';') + '\n'
  data.rows.forEach((r) => {
    out += r.cells.map((c) => escCsv(c.text)).join(';') + '\n'
  })
  // BOM para o Excel reconhecer acentuação
  downloadBlob(new Blob(['﻿' + out], { type: 'text/csv;charset=utf-8' }), `${data.title}.csv`)
}

export function exportTxt(data: ExportData) {
  let out = data.columns.map((c) => c.label).join('\t') + '\n'
  data.rows.forEach((r) => {
    out += r.cells.map((c) => c.text).join('\t') + '\n'
  })
  downloadBlob(new Blob([out], { type: 'text/plain;charset=utf-8' }), `${data.title}.txt`)
}

const escHtml = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export function buildHtml(data: ExportData): string {
  const head = data.columns
    .map((c) => {
      const align = c.kind === 'text' ? 'left' : c.kind === 'ind' ? 'center' : 'right'
      return `<th style="text-align:${align}">${escHtml(c.label)}</th>`
    })
    .join('')

  const body = data.rows
    .map((r) => {
      const st = LEVEL(r.level)
      const tds = r.cells
        .map((cell, i) => {
          const col = data.columns[i]
          const align = col.kind === 'text' ? 'left' : col.kind === 'ind' ? 'center' : 'right'
          const pad = col.indent ? `padding-left:${(r.level - 1) * 16 + 8}px;` : ''
          const mono = col.kind === 'num' || (col.kind === 'text' && i === 0) ? 'font-variant-numeric:tabular-nums;' : ''
          return `<td style="text-align:${align};${pad}${mono}">${escHtml(cell.text)}</td>`
        })
        .join('')
      return `<tr style="background:#${st.bg};color:#${st.fg};${st.bold ? 'font-weight:700;' : ''}">${tds}</tr>`
    })
    .join('')

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escHtml(data.title)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:#f1f5f9;color:#0f172a}
  .wrap{max-width:1400px;margin:0 auto;padding:20px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}
  .brand{font-weight:900;font-size:18px}.brand span{color:#4f46e5}
  .btn{background:#0f172a;color:#fff;border:0;padding:9px 14px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,.04);overflow:auto}
  h1{font-size:20px;margin:0 0 2px}.sub{color:#64748b;font-size:13px;margin:0 0 12px}
  table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}
  thead th{position:sticky;top:0;background:#f8fafc;color:#475569;text-transform:uppercase;font-size:10px;letter-spacing:.05em;border:1px solid #e2e8f0;padding:7px 9px}
  tbody td{border:1px solid rgba(148,163,184,.25);padding:5px 9px}
  @media print{body{background:#fff}.btn{display:none}.card{box-shadow:none;border:0;padding:0}.wrap{max-width:none;padding:0}thead th{position:static}}
</style></head>
<body><div class="wrap">
  <div class="topbar"><div class="brand">Board<span>ECD</span></div>
  <button class="btn" onclick="window.print()">Imprimir / Salvar PDF</button></div>
  <div class="card">
    <h1>${escHtml(data.title)}</h1>
    ${data.subtitle ? `<p class="sub">${escHtml(data.subtitle)}</p>` : ''}
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  </div>
</div>
<script>${' '}</script>
</body></html>`
}

export function openInBrowser(data: ExportData, print = false) {
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(buildHtml(data))
  w.document.close()
  if (print) {
    // dá tempo de renderizar antes de imprimir
    w.onload = () => setTimeout(() => w.print(), 300)
    setTimeout(() => {
      try {
        w.print()
      } catch {
        /* ignore */
      }
    }, 600)
  }
  return true
}

export async function exportXlsx(data: ExportData) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Balancete', { views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }] })

  const thin = { style: 'thin' as const, color: { argb: 'FFE2E8F0' } }
  const border = { top: thin, left: thin, bottom: thin, right: thin }

  const header = ws.addRow(data.columns.map((c) => c.label))
  header.height = 20
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
    cell.font = { bold: true, color: { argb: 'FF334155' }, size: 10 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = border
  })

  data.rows.forEach((r) => {
    const row = ws.addRow(
      r.cells.map((cell, i) => (data.columns[i].kind === 'num' ? (cell.value ?? null) : cell.text)),
    )
    const st = LEVEL(r.level)
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const col = data.columns[colNumber - 1]
      if (!col) return
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + st.bg } }
      cell.font = { color: { argb: 'FF' + st.fg }, bold: st.bold, size: 10 }
      cell.border = border
      if (col.kind === 'num') {
        cell.numFmt = '#,##0.00'
        cell.alignment = { horizontal: 'right' }
      } else if (col.kind === 'ind') {
        cell.alignment = { horizontal: 'center' }
      } else if (col.kind === 'pct') {
        cell.alignment = { horizontal: 'right' }
      } else {
        cell.alignment = { horizontal: 'left', indent: col.indent ? Math.max(0, r.level - 1) : 0 }
      }
    })
  })

  data.columns.forEach((c, i) => {
    const col = ws.getColumn(i + 1)
    col.width = c.indent ? 42 : c.kind === 'text' ? 16 : c.kind === 'ind' ? 5 : 16
  })

  const buf = await wb.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${data.title}.xlsx`,
  )
}
