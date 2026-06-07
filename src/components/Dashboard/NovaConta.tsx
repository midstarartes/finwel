'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import { Responsavel } from '@/lib/types'
import { format, getDate } from 'date-fns'
import { RefreshCw } from 'lucide-react'

interface NovaContaProps {
  open: boolean
  onClose: () => void
  mes: number
  ano: number
  onSuccess: () => void
}

export default function NovaConta({ open, onClose, mes, ano, onSuccess }: NovaContaProps) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [descricao, setDescricao] = useState('')
  const [responsavelId, setResponsavelId] = useState('')
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState(
    format(new Date(ano, mes - 1, 1), 'yyyy-MM-dd')
  )
  const [recorrente, setRecorrente] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/responsaveis').then(r => r.json()).then(setResponsaveis)
  }, [])

  useEffect(() => {
    setDataVencimento(format(new Date(ano, mes - 1, 1), 'yyyy-MM-dd'))
  }, [mes, ano])

  function resetForm() {
    setDescricao('')
    setValor('')
    setResponsavelId('')
    setRecorrente(false)
    setDataVencimento(format(new Date(ano, mes - 1, 1), 'yyyy-MM-dd'))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const valorNum = parseFloat(valor.replace(',', '.'))
    const diaVencimento = getDate(new Date(dataVencimento))

    if (recorrente) {
      // Criar recorrente + instância do mês atual
      await fetch('/api/contas-recorrentes/create-with-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao,
          responsavel_id: responsavelId || null,
          valor: valorNum,
          dia_vencimento: diaVencimento,
          mes_atual: mes,
          ano_atual: ano,
          data_vencimento: dataVencimento,
        }),
      })
    } else {
      await fetch('/api/contas-mensais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao,
          responsavel_id: responsavelId || null,
          valor: valorNum,
          data_vencimento: dataVencimento,
          mes_competencia: mes,
          ano_competencia: ano,
        }),
      })
    }

    setLoading(false)
    resetForm()
    onClose()
    onSuccess()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose() }} title="Nova Conta" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição *</label>
          <input value={descricao} onChange={e => setDescricao(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
            style={inputStyle} placeholder="Ex: Conta de luz" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor *</label>
            <input value={valor} onChange={e => setValor(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
              style={inputStyle} placeholder="0,00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Vencimento *</label>
            <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
              style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Responsável</label>
          <select value={responsavelId} onChange={e => setResponsavelId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-white outline-none" style={inputStyle}>
            <option value="">— Selecionar —</option>
            {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>

        {/* Toggle recorrente */}
        <button
          type="button"
          onClick={() => setRecorrente(v => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
          style={{
            background: recorrente ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
            border: recorrente ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
          }}>
          <div className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${recorrente ? 'bg-indigo-500' : 'bg-slate-600'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${recorrente ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-white">Conta Recorrente</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {recorrente
                ? `Vai aparecer todo mês no dia ${dataVencimento ? getDate(new Date(dataVencimento)) : '—'}`
                : 'Ativar para repetir automaticamente todo mês'}
            </p>
          </div>
        </button>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => { resetForm(); onClose() }} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {recorrente ? 'Adicionar Recorrente' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
