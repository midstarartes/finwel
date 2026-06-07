'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, Pencil, Trash2, Copy, CheckCircle, RotateCcw } from 'lucide-react'
import { ContaMensal, Status } from '@/lib/types'
import { computeStatus } from '@/lib/utils'

interface ContaMenuProps {
  conta: ContaMensal
  onEditar: () => void
  onExcluir: () => void
  onDuplicar: () => void
  onMarcarPago: () => void
  onDesfazerPagamento: () => void
}

export default function ContaMenu({
  conta, onEditar, onExcluir, onDuplicar, onMarcarPago, onDesfazerPagamento
}: ContaMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const status: Status = computeStatus(conta.data_vencimento, conta.data_pagamento)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function action(fn: () => void) {
    setOpen(false)
    fn()
  }

  const items = [
    status !== 'pago'
      ? { icon: CheckCircle, label: 'Pago', color: '#10b981', fn: onMarcarPago }
      : { icon: RotateCcw, label: 'Desfazer pago', color: '#f59e0b', fn: onDesfazerPagamento },
    { icon: Pencil, label: 'Editar', color: '#818cf8', fn: onEditar },
    { icon: Copy, label: 'Duplicar próximo mês', color: '#60a5fa', fn: onDuplicar },
    { icon: Trash2, label: 'Excluir', color: '#f87171', fn: onExcluir },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg transition-all"
        style={{
          color: open ? '#a78bfa' : '#64748b',
          background: open ? 'rgba(99,102,241,0.12)' : 'transparent',
          border: open ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
        }}
        title="Opções"
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 w-52 rounded-xl overflow-hidden shadow-2xl"
          style={{
            top: 'calc(100% + 6px)',
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          }}
        >
          {items.map(({ icon: Icon, label, color, fn }) => (
            <button
              key={label}
              onClick={() => action(fn)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left hover:bg-white/5"
              style={{ color }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
