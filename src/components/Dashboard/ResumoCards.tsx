import { ResumoMensal } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface ResumoCardsProps {
  resumo: ResumoMensal
}

export default function ResumoCards({ resumo }: ResumoCardsProps) {
  const cards = [
    {
      label: 'Total do Mês',
      value: formatCurrency(resumo.total),
      sub: `${resumo.quantidade_total} conta${resumo.quantidade_total !== 1 ? 's' : ''}`,
      icon: DollarSign,
      color: '#6366f1',
      glow: 'rgba(99,102,241,0.3)',
      grad: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
      border: 'rgba(99,102,241,0.25)',
    },
    {
      label: 'Pago',
      value: formatCurrency(resumo.total_pago),
      sub: `${resumo.quantidade_paga} pago${resumo.quantidade_paga !== 1 ? 's' : ''}`,
      icon: CheckCircle,
      color: '#10b981',
      glow: 'rgba(16,185,129,0.3)',
      grad: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))',
      border: 'rgba(16,185,129,0.2)',
    },
    {
      label: 'Em Aberto',
      value: formatCurrency(resumo.total_aberto),
      sub: `${resumo.quantidade_aberto} em aberto`,
      icon: Clock,
      color: '#60a5fa',
      glow: 'rgba(96,165,250,0.3)',
      grad: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.06))',
      border: 'rgba(96,165,250,0.2)',
    },
    {
      label: 'Atrasado',
      value: formatCurrency(resumo.total_atrasado),
      sub: `${resumo.quantidade_atrasado} atrasado${resumo.quantidade_atrasado !== 1 ? 's' : ''}`,
      icon: AlertCircle,
      color: '#f87171',
      glow: 'rgba(248,113,113,0.3)',
      grad: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.06))',
      border: 'rgba(248,113,113,0.2)',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl p-5 card-hover"
          style={{ background: card.grad, border: `1px solid ${card.border}`, boxShadow: `0 4px 20px ${card.glow}` }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${card.color}20`, border: `1px solid ${card.color}30` }}>
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white leading-none mb-1">{card.value}</p>
          <p className="text-xs text-slate-400 font-medium">{card.label}</p>
          <p className="text-xs mt-1" style={{ color: card.color }}>{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
