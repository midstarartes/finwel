'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import { ContaMensal } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Copy } from 'lucide-react'

interface DuplicarModalProps {
  conta: ContaMensal | null
  open: boolean
  onClose: () => void
  onConfirm: (contaId: string, novoValor: number, novaData: string) => Promise<void>
}

function proximoMesData(dataVencimento: string): string {
  const d = new Date(dataVencimento)
  const dia = d.getUTCDate()
  const mes = d.getUTCMonth() + 2 // próximo mês (0-based + 1 para 1-based + 1 para próximo)
  const ano = mes > 12 ? d.getUTCFullYear() + 1 : d.getUTCFullYear()
  const mesNorm = mes > 12 ? 1 : mes
  const maxDia = new Date(ano, mesNorm, 0).getDate()
  const diaFinal = Math.min(dia, maxDia)
  return `${ano}-${String(mesNorm).padStart(2, '0')}-${String(diaFinal).padStart(2, '0')}`
}

export default function DuplicarModal({ conta, open, onClose, onConfirm }: DuplicarModalProps) {
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (conta) {
      setValor(String(conta.valor))
      setDataVencimento(proximoMesData(conta.data_vencimento))
    }
  }, [conta])

  if (!conta) return null

  async function handleConfirm() {
    if (!conta) return
    setLoading(true)
    await onConfirm(conta.id, parseFloat(valor.replace(',', '.')), dataVencimento)
    setLoading(false)
    onClose()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <Modal open={open} onClose={onClose} title="Duplicar para Próximo Mês" size="sm">
      <div className="space-y-5">
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <Copy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white font-semibold">{conta.descricao}</p>
          <p className="text-slate-400 text-sm mt-0.5">{conta.responsaveis_texto || conta.responsavel?.nome || ''}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor</label>
          <input
            value={valor}
            onChange={e => setValor(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
            style={inputStyle}
            placeholder={formatCurrency(conta.valor)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Data de Vencimento</label>
          <input
            type="date"
            value={dataVencimento}
            onChange={e => setDataVencimento(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleConfirm} loading={loading} className="flex-1"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
            Duplicar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
