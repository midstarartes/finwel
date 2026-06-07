export type Status = 'aberto' | 'pago' | 'atrasado'

export interface Responsavel {
  id: string
  user_id: string
  nome: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface ContaRecorrente {
  id: string
  user_id: string
  descricao: string
  responsavel_id: string | null
  responsavel?: Responsavel
  responsaveis_texto: string
  valor: number
  dia_vencimento: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface ContaParcelada {
  id: string
  user_id: string
  descricao: string
  responsavel_id: string | null
  responsavel?: Responsavel
  responsaveis_texto: string
  valor_parcela: number
  total_parcelas: number
  primeira_vencimento: string
  observacao: string | null
  created_at: string
  updated_at: string
}

export interface ContaMensal {
  id: string
  user_id: string
  descricao: string
  responsavel_id: string | null
  responsavel?: Responsavel
  responsaveis_texto: string
  valor: number
  data_vencimento: string
  status: Status
  data_pagamento: string | null
  conta_recorrente_id: string | null
  conta_parcelada_id: string | null
  numero_parcela: number | null
  total_parcelas: number | null
  mes_competencia: number
  ano_competencia: number
  created_at: string
  updated_at: string
}

export interface ResumoMensal {
  total: number
  total_pago: number
  total_aberto: number
  total_atrasado: number
  quantidade_total: number
  quantidade_paga: number
  quantidade_aberto: number
  quantidade_atrasado: number
}
