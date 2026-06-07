'use client'

import { useState, useEffect } from 'react'
import { ContaRecorrente, Responsavel } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/UI/Button'
import Modal from '@/components/UI/Modal'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, RefreshCw, CalendarDays } from 'lucide-react'

export default function RecorrentesPage() {
  const [contas, setContas] = useState<ContaRecorrente[]>([])
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ContaRecorrente | null>(null)
  const [form, setForm] = useState({ descricao: '', responsavel_id: '', valor: '', dia_vencimento: '1', ativo: true })
  const [saving, setSaving] = useState(false)

  async function fetchAll() {
    setLoading(true)
    const [c, r] = await Promise.all([
      fetch('/api/contas-recorrentes').then(r => r.json()),
      fetch('/api/responsaveis').then(r => r.json()),
    ])
    setContas(Array.isArray(c) ? c : [])
    setResponsaveis(Array.isArray(r) ? r : [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  function openNew() {
    setEditing(null)
    setForm({ descricao: '', responsavel_id: '', valor: '', dia_vencimento: '1', ativo: true })
    setShowForm(true)
  }

  function openEdit(c: ContaRecorrente) {
    setEditing(c)
    setForm({
      descricao: c.descricao,
      responsavel_id: c.responsavel_id ?? '',
      valor: String(c.valor),
      dia_vencimento: String(c.dia_vencimento),
      ativo: c.ativo,
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = {
      descricao: form.descricao,
      responsavel_id: form.responsavel_id || null,
      valor: parseFloat(form.valor.replace(',', '.')),
      dia_vencimento: parseInt(form.dia_vencimento),
      ativo: form.ativo,
    }
    if (editing) {
      await fetch(`/api/contas-recorrentes/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/contas-recorrentes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    setShowForm(false)
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta conta recorrente?')) return
    await fetch(`/api/contas-recorrentes/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  async function handleToggle(c: ContaRecorrente) {
    await fetch(`/api/contas-recorrentes/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !c.ativo }),
    })
    fetchAll()
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contas Recorrentes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Contas fixas que aparecem todo mês</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4" />Nova Recorrente</Button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : contas.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma conta recorrente cadastrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Responsável</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Dia Venc.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.map(c => (
                  <tr key={c.id} className="border-b hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.04)', opacity: c.ativo ? 1 : 0.5 }}>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium text-sm">{c.descricao}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-slate-400 text-sm">{c.responsavel?.nome ?? '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-white font-semibold text-sm">{formatCurrency(c.valor)}</span>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-sm">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Dia {c.dia_vencimento}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(c)} className="transition-all">
                        {c.ativo ? (
                          <ToggleRight className="w-7 h-7 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-slate-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Recorrente' : 'Nova Conta Recorrente'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição *</label>
            <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} required
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
              style={inputStyle} placeholder="Ex: Aluguel" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor *</label>
              <input value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} required
                className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
                style={inputStyle} placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Dia Vencimento *</label>
              <input type="number" min="1" max="31" value={form.dia_vencimento}
                onChange={e => setForm(f => ({ ...f, dia_vencimento: e.target.value }))} required
                className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
                style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Responsável</label>
            <select value={form.responsavel_id} onChange={e => setForm(f => ({ ...f, responsavel_id: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-white outline-none" style={inputStyle}>
              <option value="">— Selecionar —</option>
              {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <label htmlFor="ativo" className="text-sm text-slate-300">Ativa</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
