'use client'

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { formatMonthYear, MESES } from '@/lib/utils'

interface MesNavigationProps {
  mes: number
  ano: number
  onPrev: () => void
  onNext: () => void
}

export default function MesNavigation({ mes, ano, onPrev, onNext }: MesNavigationProps) {
  const isCurrentMonth = (() => {
    const now = new Date()
    return mes === now.getMonth() + 1 && ano === now.getFullYear()
  })()

  return (
    <div className="flex items-center gap-3">
      <button onClick={onPrev}
        className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <CalendarDays className="w-4 h-4 text-indigo-400" />
        <span className="text-white font-semibold capitalize text-sm">
          {formatMonthYear(mes, ano)}
        </span>
        {isCurrentMonth && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a78bfa' }}>Atual</span>
        )}
      </div>

      <button onClick={onNext}
        className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
