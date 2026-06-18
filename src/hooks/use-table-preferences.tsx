import { useState } from 'react'

// Preferências de visualização de tabela (linhas de grade, densidade e fonte),
// persistidas por menu no localStorage — mesma lógica do projeto NOMA, adaptada
// a este projeto (que já usa localStorage para configurações).

export interface TablePrefs {
  showGridlines: boolean
  gridlineWidth: number
  gridlineColor: string
  rowHeight: 'compact' | 'standard' | 'comfortable'
  fontSize: number
}

export const DEFAULT_TABLE_PREFS: TablePrefs = {
  showGridlines: false,
  gridlineWidth: 1,
  gridlineColor: '#cbd5e1',
  rowHeight: 'standard',
  fontSize: 14,
}

export const FONT_SIZE_MIN = 8
export const FONT_SIZE_MAX = 24

export function useTablePreferences(menuKey: string) {
  const storageKey = `boardecd_table_prefs:${menuKey}`

  const [prefs, setPrefs] = useState<TablePrefs>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return { ...DEFAULT_TABLE_PREFS, ...JSON.parse(raw) }
    } catch (e) {
      console.error('Falha ao ler preferências de tabela', e)
    }
    return DEFAULT_TABLE_PREFS
  })

  const updatePrefs = (newPrefs: Partial<TablePrefs>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs }
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch (e) {
        console.error('Falha ao salvar preferências de tabela', e)
      }
      return updated
    })
  }

  return { prefs, updatePrefs }
}
