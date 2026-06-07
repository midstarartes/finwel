'use client'

import { useState, useEffect } from 'react'
import { ContaParcelada, Responsavel } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Button from '@/components/UI/Button'
import Modal from '@/components/UI/Modal'
import { Plus, Trash2, CreditCard, RefreshCw } from 'lucide-react'

export default function ParceladasPage() {
  const [contas, setContas] = useState<ContaParcelada[]>([])
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    descricao: '', responsavel_id: '', valor_parcela: '',
    total_parcelas: '2', primeira_vencimento: '', observacao: ''
  })

  async function fetchAll() {
    setLoading(true)
    const [c, r] = await Promise.all([
      fetch('/api/contas-parceladas').then(r => r.json()),
      fetch('/api/responsaveis').then(r => r.json()),
    ])
    setContas(Array.isArray(c) ? c : [])
    setResponsaveis(Array.isArray(r) ? r : [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/contas-parceladas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: form.descricao,
        responsavel_id: form.responsavel_id || null,
        valor_parcela: parseFloat(form.valor_parcela.replace(',', '.')),
        total_parcelas: parseInt(form.total_parcelas),
        primeira_vencimento: form.primeira_vencimento,
        observacao: form.observacao || null,
      }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ descricao: '', responsavel_id: '', valor_parcela: '', total_parcelas: '2', primeira_vencimento: '', observacao: '' })
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta conta parcelada? As parcelas não pagas serão removidas.')) return
    await fetch(`/api/contas-parceladas/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

  const totalForm = form.valor_parcela && form.total_parcelas
    ? parseFloat(form.valor_parcela.replace(',', '.') || '0') * parseInt(form.total_parcelas)
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contas Parceladas</h1>
          <p className="text-slate-400 text-sm mt-0.5">Compras parceladas e financiamentos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={() => setShowForm(true)} size="sm"><Plus className="w-4 h-4" />Nova Parcelada</Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : contas.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma conta parcelada</p>
          </div>
        ) : (
          <div className="grid gap-4 p-6">
            {contas.map(c => (
              <div key={c.id} className="rounded-xl p-5 flex items-start justify-between gap-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{c.descricao}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{c.responsavel?.nome ?? '—'}</p>
                    {c.observacao && <p className="text-slate-500 text-xs mt-1">{c.observacao}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 rounded-lg text-indigo-300"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {c.total_parcelas}x de {formatCurrency(c.valor_parcela)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Total: {formatCurrency(c.valor_parcela * c.total_parcelas)}
                      </span>
                      <span className="text-xs text-slate-500">
                        1ª venc.: {formatDate(c.primeira_vencimento)}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Conta Parcelada" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição *</label>
            <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} required
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
              style={inputStyle} placeholder="Ex: Compra no cartão" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor da parcela *</label>
              <input value={form.valor_parcela} onChange={e => setForm(f => ({ ...f, valor_parcela: e.target.value }))} required
                className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
                style={inputStyle} placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nº de parcelas *</label>
              <input type="number" min="2" max="360" value={form.total_parcelas}
                onChange={e => setForm(f => ({ ...f, total_parcelas: e.target.value }))} required
                className="w-full px-4 py-2.5 rounded-xl text-white outline-none" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">1ª data de vencimento *</label>
            <input type="date" value={form.primeira_vencimento}
              onChange={e => setForm(f => ({ ...f, primeira_vencimento: e.target.value }))} required
              className="w-full px-4 py-2.5 rounded-xl text-white outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Responsável</label>
            <select value={form.responsavel_id} onChange={e => setForm(f => ({ ...f, responsavel_id: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-white outline-none" style={inputStyle}>
              <option value="">— Selecionar —</option>
              {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Observação</label>
            <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
              style={inputStyle} placeholder="Opcional..." />
          </div>
          {totalForm > 0 && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-slate-400 text-xs">Total do parcelamento</p>
              <p className="text-indigo-300 font-bold text-lg">{formatCurrency(totalForm)}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1">Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
