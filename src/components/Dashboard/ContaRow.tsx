'use client'

import { ContaMensal, Status } from '@/lib/types'
import { formatCurrency, formatDate, computeStatus, getStatusLabel, getStatusColor } from '@/lib/utils'
import { CheckSquare, Square, RotateCcw, User } from 'lucide-react'

interface ContaRowProps {
  conta: ContaMensal
  onMarcarPago: (conta: ContaMensal) => void
  onDesfazerPagamento: (contaId: string) => Promise<void>
}

export default function ContaRow({ conta, onMarcarPago, onDesfazerPagamento }: ContaRowProps) {
  const status: Status = computeStatus(conta.data_vencimento, conta.data_pagamento)

  return (
    <tr className="border-b transition-colors hover:bg-white/[0.02]"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      {/* Checkbox / Status */}
      <td className="pl-4 pr-2 py-4">
        <button
          onClick={() => status !== 'pago' ? onMarcarPago(conta) : null}
          className="flex items-center justify-center transition-all"
          title={status === 'pago' ? 'Pago' : 'Marcar como pago'}
        >
          {status === 'pago' ? (
            <CheckSquare className="w-6 h-6 text-emerald-400" />
          ) : (
            <Square className="w-6 h-6 text-slate-500 hover:text-slate-300" />
          )}
        </button>
      </td>

      {/* Descrição */}
      <td className="px-4 py-4">
        <p className={`font-medium text-sm ${status === 'pago' ? 'text-slate-500 line-through' : 'text-white'}`}>
          {conta.descricao}
        </p>
        {conta.numero_parcela && (
          <p className="text-xs text-slate-500 mt-0.5">Parcela {conta.numero_parcela}/{conta.total_parcelas}</p>
        )}
      </td>

      {/* Responsável */}
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm text-slate-400">{conta.responsavel?.nome ?? '—'}</span>
        </div>
      </td>

      {/* Valor */}
      <td className="px-4 py-4 text-right">
        <span className={`font-semibold text-sm ${status === 'pago' ? 'text-slate-500' : 'text-white'}`}>
          {formatCurrency(conta.valor)}
        </span>
      </td>

      {/* Vencimento */}
      <td className="px-4 py-4 text-center hidden sm:table-cell">
        <span className="text-sm text-slate-400">{formatDate(conta.data_vencimento)}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-4 text-center">
        <span className={`status-badge ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
      </td>

      {/* Pagamento / Desfazer */}
      <td className="pl-2 pr-4 py-4 text-center hidden lg:table-cell">
        {status === 'pago' ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-500">{conta.data_pagamento ? formatDate(conta.data_pagamento) : ''}</span>
            <button
              onClick={() => onDesfazerPagamento(conta.id)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-400 transition-colors"
              title="Desfazer pagamento">
              <RotateCcw className="w-3 h-3" />
              Desfazer
            </button>
          </div>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        )}
      </td>
    </tr>
  )
}
