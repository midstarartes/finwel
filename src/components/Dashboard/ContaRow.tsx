'use client'

import { ContaMensal, Status } from '@/lib/types'
import { formatCurrency, formatDate, computeStatus, getStatusLabel, getStatusColor } from '@/lib/utils'
import { CheckSquare, Square, RotateCcw, User, Pencil, Trash2, RefreshCw } from 'lucide-react'

interface ContaRowProps {
  conta: ContaMensal
  onMarcarPago: (conta: ContaMensal) => void
  onDesfazerPagamento: (contaId: string) => Promise<void>
  onEditar: (conta: ContaMensal) => void
  onExcluir: (contaId: string) => Promise<void>
}

export default function ContaRow({ conta, onMarcarPago, onDesfazerPagamento, onEditar, onExcluir }: ContaRowProps) {
  const status: Status = computeStatus(conta.data_vencimento, conta.data_pagamento)

  return (
    <tr className="border-b transition-colors hover:bg-white/[0.02] group"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      {/* Checkbox */}
      <td className="pl-4 pr-2 py-4">
        <button
          onClick={() => status !== 'pago' ? onMarcarPago(conta) : null}
          className="flex items-center justify-center transition-all"
          title={status === 'pago' ? 'Pago' : 'Marcar como pago'}>
          {status === 'pago' ? (
            <CheckSquare className="w-6 h-6 text-emerald-400" />
          ) : (
            <Square className="w-6 h-6 text-slate-500 hover:text-slate-300" />
          )}
        </button>
      </td>

      {/* Descrição */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <p className={`font-medium text-sm ${status === 'pago' ? 'text-slate-500 line-through' : 'text-white'}`}>
            {conta.descricao}
          </p>
          {conta.conta_recorrente_id && (
            <RefreshCw className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          )}
        </div>
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

      {/* Ações */}
      <td className="pl-2 pr-4 py-4">
        <div className="flex items-center justify-center gap-1">
          {status === 'pago' ? (
            <button
              onClick={() => onDesfazerPagamento(conta.id)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-amber-400/10"
              title="Desfazer pagamento">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{conta.data_pagamento ? formatDate(conta.data_pagamento) : 'Desfazer'}</span>
            </button>
          ) : (
            <span className="text-slate-700 text-xs hidden lg:inline">—</span>
          )}
          <button
            onClick={() => onEditar(conta)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all opacity-0 group-hover:opacity-100"
            title="Editar conta">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onExcluir(conta.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            title="Excluir conta">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
