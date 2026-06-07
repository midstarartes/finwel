'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContaMensal, ResumoMensal } from '@/lib/types'
import { getCurrentMonthYear, computeStatus } from '@/lib/utils'
import ResumoCards from '@/components/Dashboard/ResumoCards'
import MesNavigation from '@/components/Dashboard/MesNavigation'
import ContaRow from '@/components/Dashboard/ContaRow'
import PagamentoModal from '@/components/Dashboard/PagamentoModal'
import NovaConta from '@/components/Dashboard/NovaConta'
import { Plus, Download, RefreshCw } from 'lucide-react'
import Button from '@/components/UI/Button'

export default function DashboardPage() {
  const { mes: meAtual, ano: anoAtual } = getCurrentMonthYear()
  const [mes, setMes] = useState(meAtual)
  const [ano, setAno] = useState(anoAtual)
  const [contas, setContas] = useState<ContaMensal[]>([])
  const [loading, setLoading] = useState(true)
  const [contaSelecionada, setContaSelecionada] = useState<ContaMensal | null>(null)
  const [showNovaConta, setShowNovaConta] = useState(false)

  const fetchContas = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/contas-mensais?mes=${mes}&ano=${ano}`)
    const data = await res.json()
    setContas(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [mes, ano])

  useEffect(() => { fetchContas() }, [fetchContas])

  function prevMes() {
    if (mes === 1) { setMes(12); setAno(y => y - 1) }
    else setMes(m => m - 1)
  }

  function nextMes() {
    if (mes === 12) { setMes(1); setAno(y => y + 1) }
    else setMes(m => m + 1)
  }

  async function handleMarcarPago(contaId: string, dataPagamento: string) {
    await fetch(`/api/contas-mensais/${contaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pago', data_pagamento: dataPagamento }),
    })
    fetchContas()
  }

  async function handleDesfazerPagamento(contaId: string) {
    await fetch(`/api/contas-mensais/${contaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aberto', data_pagamento: null }),
    })
    fetchContas()
  }

  const resumo: ResumoMensal = contas.reduce((acc, c) => {
    const status = computeStatus(c.data_vencimento, c.data_pagamento)
    acc.total += c.valor
    acc.quantidade_total++
    if (status === 'pago') { acc.total_pago += c.valor; acc.quantidade_paga++ }
    else if (status === 'atrasado') { acc.total_atrasado += c.valor; acc.quantidade_atrasado++ }
    else { acc.total_aberto += c.valor; acc.quantidade_aberto++ }
    return acc
  }, { total: 0, total_pago: 0, total_aberto: 0, total_atrasado: 0, quantidade_total: 0, quantidade_paga: 0, quantidade_aberto: 0, quantidade_atrasado: 0 } as ResumoMensal)

  function handleExport(format: 'csv' | 'json') {
    window.open(`/api/export?format=${format}`, '_blank')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Controle de pagamentos mensais</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('csv')} title="Exportar CSV"
            className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Download className="w-4 h-4" />
          </button>
          <button onClick={fetchContas} title="Atualizar"
            className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={() => setShowNovaConta(true)} size="sm">
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <MesNavigation mes={mes} ano={ano} onPrev={prevMes} onNext={nextMes} />

      {/* Summary Cards */}
      <ResumoCards resumo={resumo} />

      {/* Bills Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <h2 className="text-white font-semibold">Contas do Mês</h2>
          <span className="text-slate-400 text-sm">{contas.length} conta{contas.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : contas.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium">Nenhuma conta neste mês</p>
            <p className="text-sm mt-1">Adicione contas recorrentes ou uma nova conta manualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th className="pl-4 pr-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Responsável</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Vencimento</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="pl-2 pr-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {contas.map(conta => (
                  <ContaRow
                    key={conta.id}
                    conta={conta}
                    onMarcarPago={c => setContaSelecionada(c)}
                    onDesfazerPagamento={handleDesfazerPagamento}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PagamentoModal
        conta={contaSelecionada}
        open={!!contaSelecionada}
        onClose={() => setContaSelecionada(null)}
        onConfirm={handleMarcarPago}
      />

      <NovaConta
        open={showNovaConta}
        onClose={() => setShowNovaConta(false)}
        mes={mes}
        ano={ano}
        onSuccess={fetchContas}
      />
    </div>
  )
}
