'use client'

import { useState } from 'react'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import { ContaMensal } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface PagamentoModalProps {
  conta: ContaMensal | null
  open: boolean
  onClose: () => void
  onConfirm: (contaId: string, dataPagamento: string) => Promise<void>
}

export default function PagamentoModal({ conta, open, onClose, onConfirm }: PagamentoModalProps) {
  const [dataPagamento, setDataPagamento] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  if (!conta) return null

  async function handleConfirm() {
    if (!conta) return
    setLoading(true)
    await onConfirm(conta.id, dataPagamento)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirmar Pagamento" size="sm">
      <div className="space-y-5">
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-semibold text-lg">{conta.descricao}</p>
          <p className="text-emerald-400 text-2xl font-bold mt-1">{formatCurrency(conta.valor)}</p>
          <p className="text-slate-400 text-sm mt-1">Vencimento: {formatDate(conta.data_vencimento)}</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            Data de Pagamento
          </label>
          <input
            type="date"
            value={dataPagamento}
            onChange={e => setDataPagamento(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} loading={loading} className="flex-1"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
            Confirmar Pago
          </Button>
        </div>
      </div>
    </Modal>
  )
}
