'use client'

import { useState, useEffect } from 'react'
import { Responsavel } from '@/lib/types'
import Button from '@/components/UI/Button'
import Modal from '@/components/UI/Modal'
import { Plus, Pencil, Trash2, User, RefreshCw } from 'lucide-react'

const INITIAL_RESPONSAVEIS = ['Welington', 'Edes', 'Dionísia', 'Todos']

export default function ResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Responsavel | null>(null)
  const [nome, setNome] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  async function fetchAll() {
    setLoading(true)
    const data = await fetch('/api/responsaveis').then(r => r.json())
    const list: Responsavel[] = Array.isArray(data) ? data : []
    setResponsaveis(list)
    setLoading(false)
    return list
  }

  async function initializeDefaults(list: Responsavel[]) {
    if (list.length > 0 || initialized) return
    setInitialized(true)
    for (const nome of INITIAL_RESPONSAVEIS) {
      await fetch('/api/responsaveis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, ativo: true }),
      })
    }
    fetchAll()
  }

  useEffect(() => {
    fetchAll().then(list => initializeDefaults(list))
  }, [])

  function openNew() {
    setEditing(null)
    setNome('')
    setShowForm(true)
  }

  function openEdit(r: Responsavel) {
    setEditing(r)
    setNome(r.nome)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await fetch(`/api/responsaveis/${editing.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      })
    } else {
      await fetch('/api/responsaveis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, ativo: true }),
      })
    }
    setSaving(false)
    setShowForm(false)
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este responsável?')) return
    await fetch(`/api/responsaveis/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Responsáveis</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie os responsáveis pelas contas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4" />Novo</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {responsaveis.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between p-4 rounded-xl card-hover"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: colors[i % colors.length] + '30', border: `1px solid ${colors[i % colors.length]}40`, color: colors[i % colors.length] }}>
                  {r.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{r.nome}</p>
                  <p className="text-slate-500 text-xs">Responsável</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {responsaveis.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum responsável cadastrado</p>
            </div>
          )}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Responsável' : 'Novo Responsável'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} required autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Nome do responsável" />
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
