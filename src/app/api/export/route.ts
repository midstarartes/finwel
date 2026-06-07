import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const { data } = await supabase
    .from('contas_mensais')
    .select('*, responsavel:responsaveis(nome)')
    .eq('user_id', user.id)
    .order('data_vencimento')

  if (format === 'csv') {
    const headers = ['Descrição', 'Responsável', 'Valor', 'Vencimento', 'Status', 'Pagamento', 'Mês', 'Ano']
    const rows = (data ?? []).map((r: {
      descricao: string;
      responsavel?: { nome: string } | null;
      valor: number;
      data_vencimento: string;
      status: string;
      data_pagamento: string | null;
      mes_competencia: number;
      ano_competencia: number;
    }) => [
      r.descricao,
      r.responsavel?.nome ?? '',
      r.valor,
      r.data_vencimento,
      r.status,
      r.data_pagamento ?? '',
      r.mes_competencia,
      r.ano_competencia,
    ])

    const csv = [headers, ...rows].map(row => row.map(String).join(',')).join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="finwel-export.csv"',
      },
    })
  }

  return NextResponse.json(data, {
    headers: { 'Content-Disposition': 'attachment; filename="finwel-export.json"' }
  })
}
