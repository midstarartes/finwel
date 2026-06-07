'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import { Responsavel } from '@/lib/types'
import { format } from 'date-fns'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/responsaveis').then(r => r.json()).then(setResponsaveis)
  }, [])

  useEffect(() => {
    setDataVencimento(format(new Date(ano, mes - 1, 1), 'yyyy-MM-dd'))
  }, [mes, ano])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/contas-mensais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao,
        responsavel_id: responsavelId || null,
        valor: parseFloat(valor.replace(',', '.')),
        data_vencimento: dataVencimento,
        mes_competencia: mes,
        ano_competencia: ano,
      }),
    })
    setLoading(false)
    setDescricao('')
    setValor('')
    setResponsavelId('')
    onClose()
    onSuccess()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Conta Manual" size="md">
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
            className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
            style={inputStyle}>
            <option value="">— Selecionar —</option>
            {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">Adicionar</Button>
        </div>
      </form>
    </Modal>
  )
}
