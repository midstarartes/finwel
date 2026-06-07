import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Status } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export function computeStatus(dataVencimento: string, dataPagamento: string | null): Status {
  if (dataPagamento) return 'pago'
  const vencimento = startOfDay(parseISO(dataVencimento))
  const hoje = startOfDay(new Date())
  return isAfter(hoje, vencimento) ? 'atrasado' : 'aberto'
}

export function getStatusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    aberto: 'Aberto',
    pago: 'Pago',
    atrasado: 'Atrasado',
  }
  return labels[status]
}

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    aberto: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    pago: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    atrasado: 'text-red-400 bg-red-400/10 border-red-400/20',
  }
  return colors[status]
}

export function getCurrentMonthYear(): { mes: number; ano: number } {
  const now = new Date()
  return { mes: now.getMonth() + 1, ano: now.getFullYear() }
}

export function getMonthDays(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

export function buildVencimentoDate(dia: number, mes: number, ano: number): string {
  const maxDia = getMonthDays(mes, ano)
  const safeDia = Math.min(dia, maxDia)
  return format(new Date(ano, mes - 1, safeDia), 'yyyy-MM-dd')
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
