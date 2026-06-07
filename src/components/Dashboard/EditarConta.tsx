'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import ResponsaveisSelect from '@/components/UI/ResponsaveisSelect'
import { ContaMensal, Responsavel } from '@/lib/types'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface EditarContaProps {
  conta: ContaMensal | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditarConta({ conta, open, onClose, onSuccess }: EditarContaProps) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [descricao, setDescricao] = useState('')
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<string[]>([])
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [propagarRecorrente, setPropagarRecorrente] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/responsaveis').then(r => r.json()).then(setResponsaveis)
  }, [])

  useEffect(() => {
    if (conta) {
      setDescricao(conta.descricao)
      const existingNames = conta.responsaveis_texto
        ? conta.responsaveis_texto.split(', ').filter(Boolean)
        : conta.responsavel?.nome ? [conta.responsavel.nome] : []
      setResponsaveisSelecionados(existingNames)
      setValor(String(conta.valor))
      setDataVencimento(conta.data_vencimento)
      setPropagarRecorrente(true)
    }
  }, [conta])

  if (!conta) return null

  const isRecorrente = !!conta.conta_recorrente_id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!conta) return
    setLoading(true)

    const body = {
      descricao,
      responsavel_id: null,
      responsaveis_texto: responsaveisSelecionados.join(', '),
      valor: parseFloat(valor.replace(',', '.')),
      data_vencimento: dataVencimento,
      propagar_recorrente: isRecorrente && propagarRecorrente,
      mes_competencia: conta.mes_competencia,
      ano_competencia: conta.ano_competencia,
    }

    await fetch(`/api/contas-mensais/${conta.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    onClose()
    onSuccess()
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar Conta" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição *</label>
          <input value={descricao} onChange={e => setDescricao(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
            style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor *</label>
            <input value={valor} onChange={e => setValor(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
              style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Vencimento *</label>
            <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
              style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Responsável(is)</label>
          <div className="px-4 py-3 rounded-xl" style={inputStyle}>
            <ResponsaveisSelect
              responsaveis={responsaveis}
              selected={responsaveisSelecionados}
              onChange={setResponsaveisSelecionados}
            />
          </div>
        </div>

        {isRecorrente && (
          <button
            type="button"
            onClick={() => setPropagarRecorrente(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
            style={{
              background: propagarRecorrente ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
              border: propagarRecorrente ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
            }}>
            <div className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${propagarRecorrente ? 'bg-indigo-500' : 'bg-slate-600'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${propagarRecorrente ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">Atualizar meses futuros</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {propagarRecorrente
                  ? 'O novo valor/data/responsável valerá a partir deste mês em diante'
                  : 'Alterar apenas esta instância do mês'}
              </p>
            </div>
          </button>
        )}

        {isRecorrente && propagarRecorrente && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs text-amber-300"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>As contas não pagas deste mês em diante serão atualizadas com os novos dados.</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">Salvar</Button>
        </div>
      </form>
    </Modal>
  )
}
