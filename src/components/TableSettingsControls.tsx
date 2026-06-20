import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Settings2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TablePrefs } from '@/hooks/use-table-preferences'

interface ToggleOption {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}

interface Props {
  prefs: TablePrefs
  updatePrefs: (p: Partial<TablePrefs>) => void
  className?: string
  onAlignAll?: (val: 'left' | 'center' | 'right') => void
  options?: ToggleOption[]
}

export function TableSettingsControls({ prefs, updatePrefs, className, onAlignAll, options }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-9 w-9 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm', className)}
          title="Configurações da Tabela"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-4 border border-slate-200 shadow-md z-50">
        <div className="space-y-2">
          <h4 className="font-medium leading-none text-slate-900">Visualização da Tabela</h4>
          <p className="text-sm text-slate-500">
            Personalize as linhas de grade para facilitar a leitura.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="gridlines" className="text-sm font-medium">
            Linhas de Grade
          </Label>
          <Switch
            id="gridlines"
            checked={prefs.showGridlines}
            onCheckedChange={(checked) => updatePrefs({ showGridlines: checked })}
          />
        </div>
        {prefs.showGridlines && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Espessura das Linhas</Label>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {prefs.gridlineWidth}px
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[prefs.gridlineWidth]}
                onValueChange={(vals) => updatePrefs({ gridlineWidth: vals[0] })}
              />
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium block">Cor das Linhas</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={prefs.gridlineColor}
                  onChange={(e) => updatePrefs({ gridlineColor: e.target.value })}
                  className="h-8 w-14 cursor-pointer rounded border border-slate-200 p-0 shadow-sm"
                />
                <span className="text-xs font-medium text-slate-600 uppercase border border-slate-100 px-2 py-1 rounded bg-slate-50">
                  {prefs.gridlineColor}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <Label className="text-sm font-medium block">Densidade das Linhas</Label>
          <RadioGroup
            value={prefs.rowHeight || 'standard'}
            onValueChange={(val: 'compact' | 'standard' | 'comfortable') =>
              updatePrefs({ rowHeight: val })
            }
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact" className="font-normal cursor-pointer">
                Compacto (Menor)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="font-normal cursor-pointer">
                Padrão
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable" className="font-normal cursor-pointer">
                Confortável (Maior)
              </Label>
            </div>
          </RadioGroup>
        </div>
        {options && options.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <Label className="text-sm font-medium block">Conteúdo das células</Label>
            {options.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2">
                <Label
                  htmlFor={o.id}
                  className="text-sm font-normal cursor-pointer leading-snug"
                  title={o.hint}
                >
                  {o.label}
                </Label>
                <Switch id={o.id} checked={o.checked} onCheckedChange={o.onChange} />
              </div>
            ))}
          </div>
        )}
        {onAlignAll && (
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <Label className="text-sm font-medium block">Alinhamento geral</Label>
            <p className="text-xs text-slate-500">Aplica a todas as colunas de uma vez.</p>
            <div className="flex gap-1.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => onAlignAll(a)}
                  className="flex-1 flex items-center justify-center py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                  title={a === 'left' ? 'Tudo à esquerda' : a === 'center' ? 'Tudo ao centro' : 'Tudo à direita'}
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
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
