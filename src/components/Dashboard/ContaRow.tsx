'use client'

import { ContaMensal, Status } from '@/lib/types'
import { formatCurrency, formatDate, computeStatus, getStatusLabel, getStatusColor } from '@/lib/utils'
import { RefreshCw, Users } from 'lucide-react'
import ContaMenu from './ContaMenu'

interface ContaRowProps {
  conta: ContaMensal
  onMarcarPago: (conta: ContaMensal) => void
  onDesfazerPagamento: (contaId: string) => Promise<void>
  onEditar: (conta: ContaMensal) => void
  onExcluir: (contaId: string) => Promise<void>
  onDuplicar: (conta: ContaMensal) => Promise<void>
}

export default function ContaRow({ conta, onMarcarPago, onDesfazerPagamento, onEditar, onExcluir, onDuplicar }: ContaRowProps) {
  const status: Status = computeStatus(conta.data_vencimento, conta.data_pagamento)
  const responsaveisLabel = conta.responsaveis_texto || conta.responsavel?.nome || '—'

  return (
    <tr className="border-b transition-colors hover:bg-white/[0.02]"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>

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

      {/* Responsável(is) */}
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-sm text-slate-400">{responsaveisLabel}</span>
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

      {/* Menu engrenagem */}
      <td className="pr-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {status === 'pago' && conta.data_pagamento && (
            <span className="text-xs text-slate-600 hidden lg:inline">{formatDate(conta.data_pagamento)}</span>
          )}
          <ContaMenu
            conta={conta}
            onEditar={() => onEditar(conta)}
            onExcluir={() => onExcluir(conta.id)}
            onDuplicar={() => onDuplicar(conta)}
            onMarcarPago={() => onMarcarPago(conta)}
            onDesfazerPagamento={() => onDesfazerPagamento(conta.id)}
          />
        </div>
      </td>
    </tr>
  )
}
