import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { descricao, responsavel_id, responsaveis_texto, valor, dia_vencimento, mes_atual, ano_atual, data_vencimento } = body

  // 1. Create the recurring bill template
  const { data: recorrente, error: errRec } = await supabase
    .from('contas_recorrentes')
    .insert({ descricao, responsavel_id, responsaveis_texto: responsaveis_texto || '', valor, dia_vencimento, ativo: true, user_id: user.id })
    .select()
    .single()

  if (errRec) return NextResponse.json({ error: errRec.message }, { status: 500 })

  // 2. Create the instance for the current month
  const { error: errMes } = await supabase
    .from('contas_mensais')
    .insert({
      user_id: user.id,
      descricao,
      responsavel_id,
      responsaveis_texto: responsaveis_texto || '',
      valor,
      data_vencimento,
      status: 'aberto',
      conta_recorrente_id: recorrente.id,
      mes_competencia: mes_atual,
      ano_competencia: ano_atual,
    })

  if (errMes) return NextResponse.json({ error: errMes.message }, { status: 500 })

  return NextResponse.json(recorrente)
}
