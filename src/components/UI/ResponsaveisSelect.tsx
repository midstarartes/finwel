'use client'

import { Responsavel } from '@/lib/types'
import { Users } from 'lucide-react'

interface ResponsaveisSelectProps {
  responsaveis: Responsavel[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function ResponsaveisSelect({ responsaveis, selected, onChange }: ResponsaveisSelectProps) {
  function toggle(nome: string) {
    if (selected.includes(nome)) {
      onChange(selected.filter(n => n !== nome))
    } else {
      onChange([...selected, nome])
    }
  }

  const label = selected.length === 0
    ? 'Nenhum selecionado'
    : selected.join(', ')

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Users className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-500 truncate">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {responsaveis.map(r => {
          const isSelected = selected.includes(r.nome)
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.nome)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                border: isSelected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: isSelected ? '#a78bfa' : '#94a3b8',
              }}
            >
              {r.nome}
            </button>
          )
        })}
      </div>
    </div>
  )
}
